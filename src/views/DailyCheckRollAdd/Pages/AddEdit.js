import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  Button,
  makeStyles,
  Container,
  Divider,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  MenuItem,
  Switch,
  InputLabel,
  FormControlLabel,
  Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Slide
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import { Fragment } from 'react';
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import tokenDecoder from '../../../utils/tokenDecoder';
import authService from '../../../utils/permissionAuth';
import MaterialTable from "material-table";
import { useNavigate } from 'react-router-dom';
import tokenService from '../../../utils/tokenDecoder';
import _ from 'lodash';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  avatar: {
    marginRight: theme.spacing(2)
  },
  row: {
    marginTop: '1rem'
  }
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const screenCode = 'DAILYCHECKROLLADDING';

export default function DailyCheckRollAdd(props) {

  const alert = useAlert();
  const classes = useStyles();
  const [FormDetails, setFormDetails] = useState({
    groupID: '0',
    estateID: '0',
    divisionID: '0',
    collectedDate: null,
    jobTypeID: '0',
    employeeTypeID: '0',
    employeeNumber: '',
    workTypeID: '0',
    fieldID: '0',
    gangID: '0',
    norm: '0',
    sessionID: '0',
    amount: 0,
    days: '0',
    norm: 25,
    isActive: false
  });
  const navigate = useNavigate();
  const handleClick = () => {

    navigate('/app/dailyCheckRollAdd');

  }
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const [groups, setGroups] = useState([]);
  const [estates, setEstates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [fields, setFields] = useState([]);
  const [gangs, setGangs] = useState([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [IsComplete, setIsComplete] = useState(false);
  const [overKilo, setOverKilo] = useState();
  const [days, setDay] = useState();
  const [dailyCheckRollDetail, setDailyCheckRollDetail] = useState([]);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const [DailyCheckrollAddingDetailsList, setDailyCheckrollAddingDetailsList] = useState([])

  useEffect(() => {
    trackPromise(getAllGroups(), getPermissions())
  }, [])

  useEffect(() => {
    trackPromise(getEstateDetailsByGroupID());
  }, [FormDetails.groupID]);

  useEffect(() => {
    trackPromise(getDivisionDetailsByEstateID());
  }, [FormDetails.estateID]);

  useEffect(() => {
    trackPromise(getFieldDetailsByDivisionID(), getGangDetailsByDivisionID());
  }, [FormDetails.divisionID]);

  useEffect(() => {
    trackPromise(getDailyCheckRollDetail());
  }, [FormDetails.employeeNumber]);

  useEffect(() => {
    trackPromise(calOverKilo());
  }, [FormDetails.days]);

  useEffect(() => {
    trackPromise(clearDays());
  }, [FormDetails.isActive === false]);

  async function UploadCheckrollDetails() {
    let dataModel = {
      groupID: parseInt(FormDetails.groupID),
      estateID: parseInt(FormDetails.estateID),
      collectedDate: FormDetails.collectedDate,
      employeeNumber: FormDetails.employeeNumber,
      dayType: parseFloat(FormDetails.days),
      dayOT: parseInt(overKilo),
      nightOT: 0,
      createdBy: parseInt(tokenDecoder.getUserIDFromToken())
    }
    let response = await services.saveCheckrollAttendance(dataModel);
    if (response.statusCode == "Success") {
      alert.success(response.message);
      allClearData();
    }
    else {
      alert.error(response.message);
    }
    setOpen(false);
  }

  async function getGangDetailsByDivisionID() {
    var response = await services.getGangDetailsByDivisionID(FormDetails.divisionID);
    setGangs(response);
  };

  async function getFieldDetailsByDivisionID() {
    var response = await services.getFieldDetailsByDivisionID(FormDetails.divisionID);
    setFields(response);
  };

  async function getDivisionDetailsByEstateID() {
    var response = await services.getDivisionDetailsByEstateID(FormDetails.estateID);
    setDivisions(response);
  };

  async function getEstateDetailsByGroupID() {
    var response = await services.getEstateDetailsByGroupID(FormDetails.groupID);
    setEstates(response);
  };

  async function getAllGroups() {
    var response = await services.getAllGroups();
    setGroups(response);
  };

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWDAILYCHECKROLLADD');

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
    });
    setFormDetails({
      ...FormDetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      estateID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getDailyCheckRollDetail() {
    if (FormDetails.employeeNumber === "") {

      setDailyCheckRollDetail([]);
    }
    else {
      var response = await services.getDailyCheckRollDetail(FormDetails.divisionID, FormDetails.employeeNumber, FormDetails.collectedDate);
      setDailyCheckRollDetail(response);
    }
  };

  async function AddDailyCheckRoll() {
    let dataModel = {
      groupID: parseInt(FormDetails.groupID),
      estateID: parseInt(FormDetails.estateID),
      divisionID: parseInt(FormDetails.divisionID),
      collectedDate: (FormDetails.collectedDate),
      employeeTypeID: parseInt(FormDetails.employeeTypeID),
      jobTypeID: parseInt(FormDetails.jobTypeID),
      workTypeID: parseInt(FormDetails.workTypeID),
      employeeNumber: FormDetails.employeeNumber,
      amount: parseFloat(FormDetails.amount),
      sessionID: parseInt(FormDetails.sessionID),
      fieldID: parseInt(FormDetails.fieldID),
      gangID: parseInt(FormDetails.gangID),
      createdBy: parseInt(tokenDecoder.getUserIDFromToken())
    }
    let response = await services.saveDailyCheckroll(dataModel);
    if (response.statusCode == "Success") {
      alert.success(response.message);
      clearData();
      getDailyCheckRollDetail();
    }
    else {
      alert.error(response.message);
    }
  }

  async function calOverKilo() {
    var totalKilo = 0;
    var cloneData = _.cloneDeep(dailyCheckRollDetail)
    cloneData.forEach(x => {
      totalKilo = totalKilo + x.amount;
    });

    if (FormDetails.days == '1') {
      var overKilo = 0;
      overKilo = totalKilo - FormDetails.norm;
      setOverKilo(overKilo);
      setDay(1)
      setIsUpdate(true)
    }
    else if (FormDetails.days == '2') {
      var overKilo = 0;
      overKilo = (totalKilo - (FormDetails.norm / 2));
      setOverKilo(overKilo);
      setDay(0.5)
      setIsUpdate(true)
    }
    else {
      setIsUpdate(false)
      setOverKilo(0);
      setDay(0)
    }
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setFormDetails({
      ...FormDetails,
      [e.target.name]: value
    });
  }

  function handleDateChange(value) {
    setFormDetails({
      ...FormDetails,
      collectedDate: value
    });
  }

  function isActivehandleChange(e) {
    const target = e.target
    const value = target.name === 'isActive' ? target.checked : target.value
    setIsComplete(value)
    setFormDetails({
      ...FormDetails,
      [e.target.name]: value
    })
  }

  function generateDropDownMenu(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
      }
    }
    return items
  }

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {titleName}
        </Grid>
      </Grid>
    )
  }

  function clearData() {
    setFormDetails({
      ...FormDetails,
      fieldID: '0',
      gangID: '0',
      sessionID: '0',
      amount: 0
    });
  }

  async function clearDays() {
    setFormDetails({
      ...FormDetails,
      days: '0'
    });
  }

  function allClearData() {
    setFormDetails({
      ...FormDetails,
      divisionID: '0',
      collectedDate: null,
      jobTypeID: '0',
      employeeTypeID: '0',
      //cropCategoryID: '0',
      employeeNumber: '',
      workTypeID: '0',
      fieldID: '0',
      gangID: '0',
      sessionID: '0',
      amount: 0,
      days: '0',
    });
    setDailyCheckRollDetail([]);
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={"Daily Checkroll"}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: FormDetails.groupID,
              estateID: FormDetails.estateID,
              divisionID: FormDetails.divisionID,
              attendanceDate: FormDetails.attendanceDate,
              jobTypeID: FormDetails.jobTypeID,
              employeeTypeID: FormDetails.employeeTypeID,
              employeeNumber: FormDetails.employeeNumber,
              workTypeID: FormDetails.workTypeID,
              fieldID: FormDetails.fieldID,
              gangID: FormDetails.gangID,
              norm: FormDetails.norm,
              sessionID: FormDetails.sessionID,
              amount: FormDetails.amount,
              days: FormDetails.days,
              collectedDate: FormDetails.collectedDate
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().min(1, "Please Select a Group").required('Group is required'),
                estateID: Yup.number().min(1, "Please Select a Estate").required('Estate is required'),
                divisionID: Yup.number().min(1, "Please Select a Division").required('Division is required'),
                jobTypeID: Yup.number().min(1, "Please Select a Job Type").required('Job Type is required'),
                employeeTypeID: Yup.number().min(1, "Please Select a Employee Type").required('Employee Type is required'),
                employeeNumber: Yup.string().required('Employee Number is required'),
                workTypeID: Yup.number().min(1, "Please Select a Work Type").required('Work Type is required'),
                fieldID: Yup.number().min(1, "Please Select a Field").required('Field is required'),
                days: Yup.number(),
                attendanceDate: Yup.string(),
                sessionID: Yup.number().min(1, "Please Select a Session").required('Session is required'),
                amount: Yup.string().matches(/^\d{1,5}(\.\d{1,2})?$/, 'Please enter valid amount').test('amount', "Please provide valid amount", val => val > 0).required('Amount is required'),
                collectedDate: Yup.date().required('Collected date is required').typeError('Invalid date'),
              })
            }
            onSubmit={() => trackPromise(AddDailyCheckRoll())}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              touched,
              values
            }) => (
              <form onSubmit={handleSubmit}>
                <Box mt={0}>
                  <Card>
                    <CardHeader
                      title={cardTitle("Daily Checkroll")}
                    />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="groupID">
                              Group *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="groupID"
                              onBlur={handleBlur}
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={FormDetails.groupID}
                              variant="outlined"
                              size='small'
                              id="groupID"
                              InputProps={{
                                readOnly: !permissionList.isGroupFilterEnabled ? true : false
                              }}
                            >
                              <MenuItem value={'0'}>--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="estateID">
                              Estate *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.estateID && errors.estateID)}
                              fullWidth
                              helperText={touched.estateID && errors.estateID}
                              name="estateID"
                              onBlur={handleBlur}
                              size='small'
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={FormDetails.estateID}
                              variant="outlined"
                              id="estateID"
                              InputProps={{
                                readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                              }}
                            >
                              <MenuItem value={0}>--Select Estate--</MenuItem>
                              {generateDropDownMenu(estates)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="divisionID">
                              Division *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.divisionID && errors.divisionID)}
                              fullWidth
                              helperText={touched.divisionID && errors.divisionID}
                              name="divisionID"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={FormDetails.divisionID}
                              variant="outlined"
                              id="divisionID"
                            >
                              <MenuItem value={0}>--Select Division--</MenuItem>
                              {generateDropDownMenu(divisions)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="collectedDate">
                              Collected Date *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                error={Boolean(touched.collectedDate && errors.collectedDate)}
                                helperText={touched.collectedDate && errors.collectedDate}
                                autoOk
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                name="collectedDate"
                                size='small'
                                id="collectedDate"
                                value={FormDetails.collectedDate}
                                onChange={(e) => {
                                  handleDateChange(e);
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                InputProps={{ readOnly: true }}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="employeeNumber">
                              Employee Registration Number *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.employeeNumber && errors.employeeNumber)}
                              fullWidth
                              helperText={touched.employeeNumber && errors.employeeNumber}
                              name="employeeNumber"
                              onBlur={handleBlur}
                              size='small'
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={FormDetails.employeeNumber}
                              variant="outlined"
                              id="employeeNumber"
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="employeeTypeID">
                              Employee Type *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.employeeTypeID && errors.employeeTypeID)}
                              fullWidth
                              helperText={touched.employeeTypeID && errors.employeeTypeID}
                              name="employeeTypeID"
                              onBlur={handleBlur}
                              size='small'
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={FormDetails.employeeTypeID}
                              variant="outlined"
                              id="employeeTypeID"
                            >
                              <MenuItem value={'0'} >--Select Employee Type--</MenuItem>
                              <MenuItem value={'1'} >Register</MenuItem>
                              <MenuItem value={'2'} >Unregister</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="jobTypeID">
                              Job Type *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.jobTypeID && errors.jobTypeID)}
                              fullWidth
                              helperText={touched.jobTypeID && errors.jobTypeID}
                              name="jobTypeID"
                              onBlur={handleBlur}
                              size='small'
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={FormDetails.jobTypeID}
                              variant="outlined"
                              id="jobTypeID"
                            >
                              <MenuItem value={'0'} >--Select Job Type--</MenuItem>
                              <MenuItem value={'1'} >Cash</MenuItem>
                              <MenuItem value={'2'} >Kilo</MenuItem>
                              <MenuItem value={'3'} >General</MenuItem>
                              <MenuItem value={'4'} >RSM</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="workTypeID">
                              Work Type *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.workTypeID && errors.workTypeID)}
                              fullWidth
                              helperText={touched.workTypeID && errors.workTypeID}
                              name="workTypeID"
                              onBlur={handleBlur}
                              size='small'
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={FormDetails.workTypeID}
                              variant="outlined"
                              id="workTypeID"
                            >
                              <MenuItem value={'0'} >--Select Work Type--</MenuItem>
                              <MenuItem value={'1'} >Division Labour</MenuItem>
                              <MenuItem value={'2'} >Lent Labour</MenuItem>
                            </TextField>
                          </Grid>
                        </Grid>
                        <br />
                        <br />
                        <Card>
                          <CardContent>
                            <Grid container spacing={3}>
                              <Grid item md={3} xs={12}>
                                <InputLabel shrink id="amount">
                                  Amount(Kg) *
                                </InputLabel>
                                <TextField
                                  error={Boolean(touched.amount && errors.amount)}
                                  fullWidth
                                  helperText={touched.amount && errors.amount}
                                  name="amount"
                                  onBlur={handleBlur}
                                  size='small'
                                  onChange={(e) => {
                                    handleChange(e)
                                  }}
                                  value={FormDetails.amount}
                                  variant="outlined"
                                  id="amount"
                                >
                                </TextField>
                              </Grid>
                              <Grid item md={3} xs={12}>
                                <InputLabel shrink id="sessionID">
                                  Session *
                                </InputLabel>
                                <TextField select
                                  error={Boolean(touched.sessionID && errors.sessionID)}
                                  fullWidth
                                  helperText={touched.sessionID && errors.sessionID}
                                  name="sessionID"
                                  onBlur={handleBlur}
                                  size='small'
                                  onChange={(e) => {
                                    handleChange(e)
                                  }}
                                  value={FormDetails.sessionID}
                                  variant="outlined"
                                  id="sessionID"
                                >
                                  <MenuItem value={'0'} >--Select Session--</MenuItem>
                                  <MenuItem value={'1'} >Morning Session</MenuItem>
                                  <MenuItem value={'2'} >Noon Session</MenuItem>
                                  <MenuItem value={'3'} >Evening Session</MenuItem>
                                </TextField>
                              </Grid>
                              <Grid item md={3} xs={12}>
                                <InputLabel shrink id="fieldID">
                                  Field *
                                </InputLabel>
                                <TextField select
                                  error={Boolean(touched.fieldID && errors.fieldID)}
                                  fullWidth
                                  helperText={touched.fieldID && errors.fieldID}
                                  name="fieldID"
                                  size='small'
                                  onBlur={handleBlur}
                                  onChange={(e) => {
                                    handleChange(e)
                                  }}
                                  value={FormDetails.fieldID}
                                  variant="outlined"
                                  id="fieldID"
                                >
                                  <MenuItem value={'0'} >--Select Field--</MenuItem>
                                  {generateDropDownMenu(fields)}
                                </TextField>
                              </Grid>
                              <Grid item md={3} xs={12}>
                                <InputLabel shrink id="gangID">
                                  Gang
                                </InputLabel>
                                <TextField select
                                  error={Boolean(touched.gangID && errors.gangID)}
                                  fullWidth
                                  helperText={touched.gangID && errors.gangID}
                                  name="gangID"
                                  onBlur={handleBlur}
                                  size='small'
                                  onChange={(e) => {
                                    handleChange(e)
                                  }}
                                  value={FormDetails.gangID}
                                  variant="outlined"
                                  id="gangID"
                                >
                                  <MenuItem value={'0'}>--Select Gang--</MenuItem>
                                  {generateDropDownMenu(gangs)}
                                </TextField>
                              </Grid>
                            </Grid>
                            <Box display="flex" justifyContent="flex-end" p={2}>
                              <Button
                                color="primary"
                                type="reset"
                                variant="outlined"
                                onClick={() => allClearData()}
                                disabled={IsComplete || isUpdate ? true : false}
                                size='small'
                              >
                                Clear
                              </Button>
                              <div>&nbsp;</div>
                              <Button
                                color="primary"
                                type="submit"
                                variant="contained"
                                disabled={IsComplete || isUpdate ? true : false}
                                size='small'
                              >
                                Save
                              </Button>
                            </Box>
                            <Box minWidth={1050}>
                              {dailyCheckRollDetail.length > 0 ?
                                <MaterialTable
                                  title="Multiple Actions Preview"
                                  columns={[
                                    {
                                      title: 'Session', field: 'sessionID', lookup: {
                                        1: "Morning Session",
                                        2: "Noon Session",
                                        3: "Evening Session"
                                      }
                                    },
                                    {
                                      title: 'Field', field: 'fieldName'
                                    },
                                    {
                                      title: 'Gang', field: 'gangName'
                                    },
                                    { title: 'Amount (Kg)', field: 'amount', render: data => data.amount.toFixed(2) }
                                  ]}
                                  data={dailyCheckRollDetail}
                                  options={{
                                    exportButton: false,
                                    showTitle: false,
                                    headerStyle: { textAlign: "left", height: '1%' },
                                    cellStyle: { textAlign: "left" },
                                    columnResizable: false,
                                    actionsColumnIndex: -1
                                  }}
                                /> : null}
                            </Box>
                          </CardContent>
                        </Card>
                        <br />
                        {dailyCheckRollDetail.length > 1 ?
                          <CardContent>
                            <Grid container spacing={4}>
                              <Grid item md={3} xs={12}>
                                <FormControlLabel
                                  style={{ marginTop: '25px' }}
                                  control={
                                    <Switch
                                      checked={FormDetails.isActive}
                                      onChange={(e) => isActivehandleChange(e)}
                                      name="isActive"
                                    />
                                  }
                                  label="Is Day Complete"
                                />
                              </Grid>
                              <Grid item md={3} xs={12}>
                                <InputLabel shrink id="gangID">
                                  Full/Half *
                                </InputLabel>
                                <TextField select
                                  error={Boolean(touched.days && errors.days)}
                                  fullWidth
                                  helperText={touched.days && errors.days}
                                  name="days"
                                  onBlur={handleBlur}
                                  onChange={(e) => handleChange(e)}
                                  size='small'
                                  value={FormDetails.days}
                                  variant="outlined"
                                  disabled={IsComplete || isUpdate ? false : true}
                                >
                                  <MenuItem value='0'>--Select Full/Half--</MenuItem>
                                  <MenuItem value="1">Full Day</MenuItem>
                                  <MenuItem value="2">Half Day</MenuItem>
                                </TextField>
                              </Grid>
                              <Grid item md={3} xs={12}>
                                <Typography variant="h5" style={{ marginTop: '35px' }} color="text.secondary" gutterBottom>
                                  Full Day : {days}
                                </Typography>
                              </Grid>
                              <Grid item md={3} xs={12}>
                                <Typography variant="h5" style={{ marginTop: '35px' }} color="text.secondary" gutterBottom>
                                  Over Kilo : {overKilo.toFixed(2)}
                                </Typography>
                              </Grid>
                            </Grid>
                            <Box display="flex" justifyContent="flex-end" p={2}>
                              <Button
                                color="primary"
                                type="button"
                                disabled={IsComplete && isUpdate ? false : true}
                                variant="contained"
                                onClick={handleClickOpen}
                                size='small'
                              >
                                Complete
                              </Button>
                            </Box>
                          </CardContent>
                          :
                          null
                        }
                        <Dialog
                          open={open}
                          TransitionComponent={Transition}
                          keepMounted
                          onClose={handleClose}
                          aria-describedby="alert-dialog-slide-description"
                        >
                          <DialogTitle>{"Are you sure about complete the attendance?"}</DialogTitle>
                          <DialogContent>
                            <DialogContentText id="alert-dialog-slide-description">
                              If you complete ones, you can not edit this recodes.
                            </DialogContentText>
                          </DialogContent>
                          <DialogActions>
                            <Button onClick={handleClose}>No</Button>
                            <Button onClick={() => trackPromise(UploadCheckrollDetails())}>Yes</Button>
                          </DialogActions>
                        </Dialog>
                      </CardContent>
                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            )}
          </Formik>
        </Container>
      </Page>
    </Fragment>)
}
