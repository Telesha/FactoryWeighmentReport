import React, { useState, useEffect, Fragment, useRef } from 'react';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography, TablePagination
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik } from 'formik';
import * as Yup from "yup";
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
import { useAlert } from "react-alert";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import moment from 'moment';
import Checkbox from '@material-ui/core/Checkbox';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import CircularProgress from '@material-ui/core/CircularProgress';
import MaterialTable from "material-table";
import { isSunday } from 'date-fns';

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
  colorCancel: {
    backgroundColor: "red",
  },
  colorRecord: {
    backgroundColor: "green",
  },

}));

const screenCode = 'TRANSFERATTENDANCE';

export default function TransferAttendanceListing(props) {
  const [title, setTitle] = useState("Transfer Attendance");
  const classes = useStyles();
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [payPoints, setPayPoints] = useState([]);
  const [transferAttendance, setTransferAttendance] = useState([]);
  const [date, setDate] = useState(new Date());
  const [dateOne, setDateOne] = useState(new Date());
  const [monthlyCropDetail, setMonthlyCropDetail] = useState({
    groupID: 0,
    factoryID: 0,
    payPointID: 0,
    jobTypeID: 0,
    year: '',
    month: ''
  });
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const navigate = useNavigate();
  const alert = useAlert();
  const componentRef = useRef();
  const [response, setResponse] = useState({
    totalCount: 0,
    alreadyCount: 0,
    successfullCount: 0
  });

  useEffect(() => {
    trackPromise(
      getPermission()
    );
    trackPromise(
      getGroupsForDropdown()
    );
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoriesForDropdown(), GetDivisionDetailsByGroupID());
  }, [monthlyCropDetail.groupID]);

  useEffect(() => {
    setTransferAttendance([])
    setUploadData([])
  }, [monthlyCropDetail.factoryID]);

  useEffect(() => {
    setTransferAttendance([])
    setUploadData([])
  }, [monthlyCropDetail.payPointID]);

  useEffect(() => {
    setTransferAttendance([])
    setUploadData([])
  }, [monthlyCropDetail.jobTypeID]);

  useEffect(() => {
    setTransferAttendance([])
    setUploadData([])
  }, [date]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWTRANSFERATTENDANCE');

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

    setMonthlyCropDetail({
      ...monthlyCropDetail,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroupList(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(monthlyCropDetail.groupID);
    setFactoryList(factories);
  }

  async function GetDivisionDetailsByGroupID() {
    const result = await services.GetDivisionDetailsByGroupID(monthlyCropDetail.groupID);
    setPayPoints(result);
  }

  async function GetCropDetails() {
    setUploadData([])
    setUploadDataOne([])
    let model = {
      operationEntityID: parseInt(monthlyCropDetail.factoryID),
      payPointID: parseInt(monthlyCropDetail.payPointID),
      jobTypeID: parseInt(monthlyCropDetail.jobTypeID),
      searchDate: date.toISOString()
    }
    const cropData = await services.GetTransferAttendanceDetails(model);
    if (cropData.statusCode == "Success" && cropData.data != null) {
      const rewResult = cropData.data
      for (let index = 0; index < rewResult.length; index++) {
        rewResult[index].newIndex = index + 1
      }
      setTransferAttendance(cropData.data)
      if (cropData.data.length == 0) {
        alert.error("No records to display");
      }
    }
    else {
      alert.error("Error");
    }
  }

  function generateDropDownMenu(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
      }
    }
    return items;
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setMonthlyCropDetail({
      ...monthlyCropDetail,
      [e.target.name]: value
    });
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

  const [checkAll, setCheckAll] = useState(false);
  const [checkAllOne, setCheckAllOne] = useState(false);
  const [uploadData, setUploadData] = useState([]);
  const [uploadDataOne, setUploadDataOne] = useState([]);
  const selectAll = () => {
    setCheckAll(!checkAll);
  };

  const selectAllOne = () => {
    setCheckAllOne(!checkAllOne);
  };

  function handleClickOneAll(e) {
    let uploadDataCopy = [...uploadData];
    if (e.target.checked) {
      transferAttendance.forEach(x => {
        const isEnable = uploadDataCopy.filter((p) => p.uniqueID == x.uniqueID);
        if (isEnable.length === 0) {
          uploadDataCopy.push(x);
        }
      });
      setUploadData(uploadDataCopy);
    }
    else {
      setUploadData([]);
    }
  }

  function handleClickOne(data) {
    let uploadDataCopy = [...uploadData];
    const isEnable = uploadDataCopy.filter((p) => p.uniqueID == data.uniqueID);
    if (isEnable.length === 0) {
      uploadDataCopy.push(data)
    } else {
      var index = uploadDataCopy.indexOf(isEnable[0]);
      uploadDataCopy.splice(index, 1);
    }
    setUploadData(uploadDataCopy);
  }

  function handleClickTwoAll(e) {
    let uploadDataCopy = [...uploadDataOne];
    if (e.target.checked) {
      transferAttendance.forEach(x => {
        const isEnable = uploadDataCopy.filter((p) => p.newIndex == x.newIndex);
        if (isEnable.length === 0) {
          uploadDataCopy.push(x);
        }
      });
      setUploadDataOne(uploadDataCopy);
    }
    else {
      setUploadDataOne([]);
    }
  }

  function handleClickTwo(data) {
    let uploadDataCopy = [...uploadDataOne];
    const isEnable = uploadDataCopy.filter((p) => p.newIndex == data.newIndex);
    if (isEnable.length === 0) {
      uploadDataCopy.push(data)
    } else {
      var index = uploadDataCopy.indexOf(isEnable[0]);
      uploadDataCopy.splice(index, 1);
    }
    setUploadDataOne(uploadDataCopy);
  }

  async function UpdateTransferAttendance() {
    if (monthlyCropDetail.jobTypeID == 2) {
      setOpenOne(false);
      setOpenTwo(true)
      uploadData.forEach(x => {
        x.modifiedBy = parseInt(tokenService.getUserIDFromToken())
        x.newDate = dateOne.toISOString()
      })
      const result = await services.UpdateTransferAttendanceNonPlucking(uploadData);
      if (result.statusCode == "Success") {
        setOpenTwo(false)
        setOpenThree(true)
        setResponse((prevState) => ({
          ...prevState,
          totalCount: result.data.totalCount,
          alreadyCount: result.data.alreadyCount,
          successfullCount: result.data.successfullCount
        }));
        alert.success(result.message);
        trackPromise(GetCropDetails())
      }
      else {
        setOpenTwo(false)
        alert.error(result.message);
      }
    }
    else if (monthlyCropDetail.jobTypeID == 1) {
      setOpenOne(false);
      setOpenTwo(true)
      uploadDataOne.forEach(x => {
        x.modifiedBy = parseInt(tokenService.getUserIDFromToken())
        x.newDate = dateOne.toISOString()
      })
      const result = await services.UpdateTransferAttendancePlucking(uploadDataOne);
      if (result.statusCode == "Success") {
        setOpenTwo(false)
        setOpenThree(true)
        setResponse((prevState) => ({
          ...prevState,
          totalCount: result.data.totalCount,
          alreadyCount: result.data.alreadyCount,
          successfullCount: result.data.successfullCount
        }));
        alert.success(result.message);
        trackPromise(GetCropDetails())
      }
      else {
        setOpenTwo(false)
        alert.error(result.message);
      }
    }
  }

  const [open, setOpen] = useState(false);
  const handleOpenDialog = () => {
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const [openOne, setOpenOne] = useState(false);
  const handleOpenDialogOne = () => {
    setOpenOne(true);
    setOpen(false);
  };

  const handleCloseDialogOne = () => {
    setOpenOne(false);
  };
  const [openTwo, setOpenTwo] = useState(false);
  const [openThree, setOpenThree] = useState(false);
  const handleCloseDialogThree = () => {
    setOpenThree(false);
  };
  const isDayDisabled = (date) => {
    return !isSunday(date);
  };

  return (
    <Fragment>
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: monthlyCropDetail.groupID,
              factoryID: monthlyCropDetail.factoryID,
              payPointID: monthlyCropDetail.payPointID,
              jobTypeID: monthlyCropDetail.jobTypeID
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                payPointID: Yup.number().required('Pay Point is required').min("1", 'Pay Point is required'),
                jobTypeID: Yup.number().required('Job Type is required').min("1", 'Job Type is required')
              })
            }
            onSubmit={() => trackPromise(GetCropDetails())}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              touched
            }) => (
              <form onSubmit={handleSubmit}>
                <Box mt={0}>
                  <Card>
                    <CardHeader
                      title={cardTitle(title)}
                    />
                    <Divider />
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="groupID">
                            Business Division  *
                          </InputLabel>
                          <TextField select
                            error={Boolean(touched.groupID && errors.groupID)}
                            fullWidth
                            helperText={touched.groupID && errors.groupID}
                            name="groupID"
                            onBlur={handleBlur}
                            onChange={(e) => handleChange(e)}
                            value={monthlyCropDetail.groupID}
                            variant="outlined"
                            id="groupID"
                            disabled={!permissionList.isGroupFilterEnabled}
                            size='small'
                          >
                            <MenuItem value="0">--Select Business Division--</MenuItem>
                            {generateDropDownMenu(GroupList)}
                          </TextField>
                        </Grid>

                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="factoryID">
                            Location *
                          </InputLabel>
                          <TextField select
                            error={Boolean(touched.factoryID && errors.factoryID)}
                            fullWidth
                            helperText={touched.factoryID && errors.factoryID}
                            name="factoryID"
                            onBlur={handleBlur}
                            onChange={(e) => handleChange(e)}
                            value={monthlyCropDetail.factoryID}
                            variant="outlined"
                            id="factoryID"
                            disabled={!permissionList.isFactoryFilterEnabled}
                            size='small'
                          >
                            <MenuItem value="0">--Select  Location--</MenuItem>
                            {generateDropDownMenu(FactoryList)}
                          </TextField>
                        </Grid>
                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="payPointID">
                            Pay Point *
                          </InputLabel>
                          <TextField select
                            error={Boolean(touched.payPointID && errors.payPointID)}
                            fullWidth
                            helperText={touched.payPointID && errors.payPointID}
                            name="payPointID"
                            onBlur={handleBlur}
                            onChange={(e) => handleChange(e)}
                            value={monthlyCropDetail.payPointID}
                            variant="outlined"
                            id="payPointID"
                            size='small'
                          >
                            <MenuItem value="0">--Select Pay Point--</MenuItem>
                            {generateDropDownMenu(payPoints)}
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
                            onChange={(e) => handleChange(e)}
                            value={monthlyCropDetail.jobTypeID}
                            variant="outlined"
                            id="jobTypeID"
                            size='small'
                          >
                            <MenuItem value={0}>--Select Job Type--</MenuItem>
                            <MenuItem value={1}>Plucking</MenuItem>
                            <MenuItem value={2}>Non Plucking</MenuItem>
                          </TextField>
                        </Grid>
                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="date" style={{ marginBottom: '-8px' }}>Date *</InputLabel>
                          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                              fullWidth
                              inputVariant="outlined"
                              format="yyyy/MM/dd"
                              margin="dense"
                              name='todayDate'
                              id='todayDate'
                              size='small'
                              value={date}
                              onChange={(e) => {
                                setDate(e)
                              }}
                              KeyboardButtonProps={{
                                'aria-label': 'change date',
                              }}
                              autoOk
                            />
                          </MuiPickersUtilsProvider>
                        </Grid>
                      </Grid>
                      <Box display="flex" flexDirection="row-reverse" p={2}>
                        <Button
                          color="primary"
                          variant="contained"
                          type="submit"
                          size='small'
                        >
                          Search
                        </Button>
                      </Box>
                    </CardContent>
                    {monthlyCropDetail.jobTypeID == 2 ?
                      <Box minWidth={1000}>
                        {transferAttendance.length > 0 ?
                          <MaterialTable
                            title="Multiple Actions Preview"
                            columns={[
                              { title: 'Section', field: 'fieldName' },
                              { title: 'Duffa', field: 'gangName' },
                              { title: 'Reg No', field: 'registrationNumber' },
                              { title: 'Emp Name', field: 'firstName' },
                              { title: 'Task', field: 'taskName' },
                              { title: 'Time', field: 'date', render: rowData => moment(rowData.date).format('hh:mm:ss a') },
                              {
                                title: (
                                  <label>
                                    Select All
                                    <Checkbox
                                      color="primary"
                                      onClick={(e) => handleClickOneAll(e)}
                                      onChange={selectAll}
                                      checked={transferAttendance.length != 0 && uploadData.length == transferAttendance.length}
                                    ></Checkbox>
                                  </label>
                                ),
                                sorting: false,
                                field: "select",
                                type: "boolean",
                                render: (data) => (
                                  <Checkbox
                                    color="primary"
                                    onClick={() => handleClickOne(data)}
                                    checked={!(uploadData.find((x) => x.uniqueID == data.uniqueID) == undefined)}
                                  ></Checkbox>
                                ),
                              }
                            ]}
                            data={transferAttendance}
                            options={{
                              exportButton: false,
                              showTitle: false,
                              headerStyle: { textAlign: "left", height: '1%' },
                              cellStyle: { textAlign: "left" },
                              columnResizable: false,
                              actionsColumnIndex: -1
                            }}
                          />
                          : null}
                      </Box> :
                      <Box minWidth={1000}>
                        {transferAttendance.length > 0 ?
                          <MaterialTable
                            title="Multiple Actions Preview"
                            columns={[
                              { title: 'Duffa', field: 'gangName' },
                              { title: 'Reg No', field: 'registrationNumber' },
                              { title: 'Emp Name', field: 'firstName' },
                              { title: 'Quntity', field: 'totalAmount', render: rowData => parseFloat(rowData.totalAmount).toFixed(2) },
                              {
                                title: (
                                  <label>
                                    Select All
                                    <Checkbox
                                      color="primary"
                                      onClick={(e) => handleClickTwoAll(e)}
                                      onChange={selectAllOne}
                                      checked={transferAttendance.length != 0 && uploadDataOne.length == transferAttendance.length}
                                    ></Checkbox>
                                  </label>
                                ),
                                sorting: false,
                                field: "select",
                                type: "boolean",
                                render: (data) => (
                                  <Checkbox
                                    color="primary"
                                    onClick={() => handleClickTwo(data)}
                                    checked={!(uploadDataOne.find((x) => x.newIndex == data.newIndex) == undefined)}
                                  ></Checkbox>
                                ),
                              }
                            ]}
                            data={transferAttendance}
                            options={{
                              exportButton: false,
                              showTitle: false,
                              headerStyle: { textAlign: "left", height: '1%' },
                              cellStyle: { textAlign: "left" },
                              columnResizable: false,
                              actionsColumnIndex: -1
                            }}
                          />
                          : null}
                      </Box>}
                    {uploadData.length != 0 || uploadDataOne.length != 0 ?
                      <Box display="flex" flexDirection="row-reverse" p={2}>
                        <Button
                          color="primary"
                          variant="contained"
                          type="button"
                          size='small'
                          onClick={() => handleOpenDialog()}
                        >
                          Transfer
                        </Button>
                      </Box>
                      : null}
                  </Card>
                </Box>
              </form>
            )}
          </Formik>
        </Container>
      </Page>
      {open ?
        <Dialog open onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle><h2><b>Transfer Confirmation</b></h2></DialogTitle>
          <DialogContent>
            <DialogContentText style={{ fontSize: '18px' }}>
              Are you sure you want to Transfer Attendance ?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => handleOpenDialogOne()}
              color="primary" autoFocus>
              Yes
            </Button>
            <Button onClick={handleCloseDialog} color="primary">
              No
            </Button>
          </DialogActions>
        </Dialog> : null}
      {openOne ?
        <Dialog open onClose={handleCloseDialogOne} maxWidth="sm" fullWidth>
          <DialogTitle><h2><b>Transfer Details</b></h2></DialogTitle>
          <DialogContent>
            <Grid container >
              <Grid item md={6} xs={12}>
                <InputLabel shrink id="date" style={{ marginBottom: '-8px' }}>Transfer Date *</InputLabel>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    fullWidth
                    inputVariant="outlined"
                    format="yyyy/MM/dd"
                    margin="dense"
                    name='todayDate'
                    id='todayDate'
                    size='small'
                    value={dateOne}
                    shouldDisableDate={isDayDisabled}
                    onChange={(e) => {
                      setDateOne(e)
                    }}
                    maxDate={date}
                    KeyboardButtonProps={{
                      'aria-label': 'change date',
                    }}
                    autoOk
                  />
                </MuiPickersUtilsProvider>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => trackPromise(UpdateTransferAttendance())}
              color="primary" autoFocus>
              Yes
            </Button>
            <Button onClick={handleCloseDialogOne} color="primary">
              No
            </Button>
          </DialogActions>
        </Dialog> : null}
      {openTwo ?
        <Dialog open maxWidth="sm" fullWidth>
          <Card style={{ justifycontent: 'center' }} >
            <Box p={2} >
              <Typography variant="h1">
                <center>
                  <b>
                    Please Wait!
                  </b>
                </center>
              </Typography>
              <Typography variant="h3" gutterBottom>
                <center>
                  Employee Bulk Leave Applying...
                </center>
              </Typography>
            </Box>
            <Box p={2} >
              <center>
                <CircularProgress />
              </center>
            </Box>
          </Card>
        </Dialog>
        : null}
      {openThree ?
        <Dialog open onClose={handleCloseDialogThree} maxWidth="sm" fullWidth>
          <Card style={{ justifycontent: 'center' }} >
            <Box p={2} >
              <Typography variant="h3">
                <center>
                  <b>
                    Attendance Transfer Status!
                  </b>
                </center>
              </Typography>
              <br />
              <br />
              <Typography variant="h4" gutterBottom>
                <Grid container spacing={0}>
                  <Grid item md={5} xs={12}>
                    Total No Of Attendance
                  </Grid>
                  <Grid item md={3} xs={12}>
                    :{'  ' + response.totalCount}
                  </Grid>
                </Grid>
              </Typography>
              <br />
              <Typography style={{ color: 'green' }} variant="h4" gutterBottom>
                <Grid container spacing={0}>
                  <Grid item md={5} xs={12}>
                    Success Count
                  </Grid>
                  <Grid item md={3} xs={12}>
                    :{'  ' + response.successfullCount}
                  </Grid>
                </Grid>
              </Typography>
              <br />
              <Typography color='secondary' variant="h4" gutterBottom>
                <Grid container spacing={0}>
                  <Grid item md={5} xs={12}>
                    Already Attendance Applied
                  </Grid>
                  <Grid item md={3} xs={12}>
                    :{'  ' + response.alreadyCount}
                  </Grid>
                </Grid>
              </Typography>
            </Box>
          </Card>
        </Dialog>
        : null}
    </Fragment>
  )
}
