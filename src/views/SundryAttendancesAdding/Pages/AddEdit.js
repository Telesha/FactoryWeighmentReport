import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader, MenuItem,
  Checkbox, FormControlLabel, FormGroup
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
import MaterialTable from "material-table";
import tokenDecoder from '../../../utils/tokenDecoder';
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
  colorCancel: {
    backgroundColor: "red",
  },
  colorRecord: {
    backgroundColor: "green",
  },

}));

const screenCode = 'SUNDRYATTENDENCESADDING';

export default function SundryAttendancesAdding(props) {
  const [title, setTitle] = useState("Sundry Attendances");
  const classes = useStyles();
  const [dailyCropDetail, setDailyCropDetail] = useState({
    groupID: 0,
    estateID: 0,
    divisionID: 0,
    date: '',
    employeeTypeID: '0',
    jobCategoryID: '0',
    jobID: '0',
    attendenceID: '0',
    empNo: '',
    workType: '0',
    fieldID: '0',
    otHours: '',
    isTaskComplete: true

  });
  const [IsAddButtonDisable, setIsAddButtonDisable] = useState(false);
  const [GroupList, setGroupList] = useState([]);
  const [estates, setEstates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [fields, setFields] = useState([]);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const [dailyCropData, setDailyCropData] = useState([]);
  const [attendenceData, setAttendenceData] = useState([]);
  const navigate = useNavigate();
  const alert = useAlert();
  const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

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
      getEstateDetailsByGroupID());
  }, [dailyCropDetail.groupID]);

  useEffect(() => {
    trackPromise(
      getDivisionDetailsByEstateID()
    )
  }, [dailyCropDetail.estateID]);

  useEffect(() => {
    trackPromise(
      getFieldDetailsByDivisionID()
    )
  }, [dailyCropDetail.divisionID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWSUNDRYATTENDENCESADDING');

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

    setDailyCropDetail({
      ...dailyCropDetail,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      estateID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroupList(groups);
  }

  async function getEstateDetailsByGroupID() {
    var response = await services.getEstateDetailsByGroupID(dailyCropDetail.groupID);
    setEstates(response);
  };

  async function getDivisionDetailsByEstateID() {
    var response = await services.getDivisionDetailsByEstateID(dailyCropDetail.estateID);
    setDivisions(response);
  };

  async function getFieldDetailsByDivisionID() {
    var response = await services.getFieldDetailsByDivisionID(dailyCropDetail.divisionID);
    setFields(response);
  };

  function generateDropDownMenu(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
      }
    }
    return items;
  }

  async function SaveEmployeeSundry() {
    var response = await services.saveEmployeeSundryAttendance(attendenceData);
    if (response.statusCode == "Success") {
      alert.success(response.message);
      setAttendenceData([]);
    }
    else {
      alert.error(response.message);
    }
  }

  async function handleCancel() {
    setAttendenceData([]);
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.name === 'isTaskComplete' ? target.checked : target.value
    setDailyCropDetail({
      ...dailyCropDetail,
      [e.target.name]: value
    });
    setDailyCropData([]);
  }

  function handleDateChange(value) {
    setDailyCropDetail({
      ...dailyCropDetail,
      date: value
    });
    setDailyCropData([]);
  }

  function handleClickEdit(rowData) {
    setAttendenceData(attendenceData.filter(item => item.tableData.id !== rowData.tableData.id))
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

  async function addDetails() {
    var response = await services.GetSundryAttendanceEmployeeDetailsByEmpNo(dailyCropDetail.estateID, dailyCropDetail.empNo);
    if (response.statusCode == "Error") {
      alert.error(response.message);
    }
    else {
      let dataModel = {
        empNo: dailyCropDetail.empNo,
        workType: parseInt(dailyCropDetail.workType),
        attendenceID: parseInt(dailyCropDetail.attendenceID),
        isTaskComplete: dailyCropDetail.isTaskComplete,
        fieldID: parseInt(dailyCropDetail.fieldID),
        groupID: parseInt(dailyCropDetail.groupID),
        estateID: parseInt(dailyCropDetail.estateID),
        divisionID: parseInt(dailyCropDetail.divisionID),
        date: dailyCropDetail.date,
        employeeTypeID: parseInt(dailyCropDetail.employeeTypeID),
        jobCategoryID: parseInt(dailyCropDetail.jobCategoryID),
        jobID: parseInt(dailyCropDetail.jobID),
        otHours: parseFloat(dailyCropDetail.otHours),
        createdBy: tokenDecoder.getUserIDFromToken()
      };
      setAttendenceData(attendenceData => [...attendenceData, dataModel]);
    }
  }

  return (
    <Fragment>
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: dailyCropDetail.groupID,
              estateID: dailyCropDetail.estateID,
              divisionID: dailyCropDetail.divisionID,
              date: dailyCropDetail.date,
              employeeTypeID: dailyCropDetail.employeeTypeID,
              jobCategoryID: dailyCropDetail.jobCategoryID,
              jobID: dailyCropDetail.jobID,
              workType: dailyCropDetail.workType,
              fieldID: dailyCropDetail.fieldID,
              attendenceID: dailyCropDetail.attendenceID,
              otHours: dailyCropDetail.otHours,
              empNo: dailyCropDetail.empNo
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                estateID: Yup.number().required('Estate is required').min("1", 'Estate is required'),
                divisionID: Yup.number().required('Division is required').min("1", 'Division is required'),
                date: Yup.date().required('Date is required'),
                employeeTypeID: Yup.number().required('Employee Type is required').min("1", 'Employee Type is required'),
                jobCategoryID: Yup.number().required('Job Category is required').min("1", 'Job Category is required'),
                jobID: Yup.number().required('Job is required').min("1", 'Job is required'),
                workType: Yup.number().required('Work Type required').min("1", 'Work Type is required'),
                fieldID: Yup.number().required('Field is required').min("1", 'Field is required'),
                attendenceID: Yup.number().required('Attendence is required').min("1", 'Attendence is required'),
                otHours: Yup.number().required('OT Hours Type is required'),
                empNo: Yup.string().required('EMP No is required'),
              })
            }
            onSubmit={() => trackPromise(addDetails())}
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
                    <PerfectScrollbar>
                      <CardContent>
                        <Grid container spacing={3} style={{ marginTop: '5px', marginBottom: '5px' }}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="groupID">
                              Group *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="groupID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={dailyCropDetail.groupID}
                              variant="outlined"
                              size = 'small'
                              id="groupID"
                              disabled={!permissionList.isGroupFilterEnabled}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(GroupList)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="estateID">
                              Estate *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.estateID && errors.estateID)}
                              fullWidth
                              helperText={touched.estateID && errors.estateID}
                              name="estateID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={dailyCropDetail.estateID}
                              variant="outlined"
                              size = 'small'
                              id="estateID"
                              disabled={!permissionList.isFactoryFilterEnabled}
                            >
                              <MenuItem value="0">--Select Estate--</MenuItem>
                              {generateDropDownMenu(estates)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="divisionID">
                              Division *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.divisionID && errors.divisionID)}
                              fullWidth
                              helperText={touched.divisionID && errors.divisionID}
                              name="divisionID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              size = 'small'
                              value={dailyCropDetail.divisionID}
                              variant="outlined"
                              id="divisionID"
                            >
                              <MenuItem value="0">--Select Division--</MenuItem>
                              {generateDropDownMenu(divisions)}
                            </TextField>
                          </Grid>
                        </Grid>
                      </CardContent>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3} style={{ marginTop: '5px', marginBottom: '5px' }}>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="date">
                              Date *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                error={Boolean(touched.date && errors.date)}
                                helperText={touched.date && errors.date}
                                autoOk
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                size = 'small'
                                margin="dense"
                                name="date"
                                id="date"
                                value={dailyCropDetail.date}
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
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="employeeTypeID">
                              Employee Type *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.employeeTypeID && errors.employeeTypeID)}
                              fullWidth
                              helperText={touched.employeeTypeID && errors.employeeTypeID}
                              name="employeeTypeID"
                              onBlur={handleBlur}
                              value={dailyCropDetail.employeeTypeID}
                              variant="outlined"
                              size = 'small'
                              id="employeeTypeID"
                              onChange={(e) => handleChange(e)}
                            >
                              <MenuItem value={'0'} disabled={true}>--Select Employee Type--</MenuItem>
                              <MenuItem value="1">Register</MenuItem>
                              <MenuItem value="2">Unregister</MenuItem>
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="jobCategoryID">
                              Job Category *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.jobCategoryID && errors.jobCategoryID)}
                              fullWidth
                              helperText={touched.jobCategoryID && errors.jobCategoryID}
                              name="jobCategoryID"
                              onBlur={handleBlur}
                              size = 'small'
                              onChange={(e) => handleChange(e)}
                              value={dailyCropDetail.jobCategoryID}
                              variant="outlined"
                              id="jobCategoryID"
                            >
                              <MenuItem value={'0'} disabled={true}>--Select Job Category--</MenuItem>
                              <MenuItem value="1">Weeding</MenuItem>
                              <MenuItem value="2">Fertilizing</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="jobID">
                              Job *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.jobID && errors.jobID)}
                              fullWidth
                              helperText={touched.jobID && errors.jobID}
                              name="jobID"
                              onBlur={handleBlur}
                              size = 'small'
                              onChange={(e) => handleChange(e)}
                              value={dailyCropDetail.jobID}
                              variant="outlined"
                              id="jobID"
                            >
                              <MenuItem value={'0'} disabled={true}>--Select Job--</MenuItem>
                              <MenuItem value="1">Manual Weeding</MenuItem>
                              <MenuItem value="2">Manul Fertilizing</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="workType">
                              Work Type *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.workType && errors.workType)}
                              fullWidth
                              helperText={touched.workType && errors.workType}
                              name="workType"
                              onBlur={handleBlur}
                              size = 'small'
                              value={dailyCropDetail.workType}
                              variant="outlined"
                              id="workType"
                              onChange={(e) => handleChange(e)}
                            >
                              <MenuItem value={'0'} disabled={true}>--Select Work Type--</MenuItem>
                              <MenuItem value="1">Lent labor</MenuItem>
                              <MenuItem value="2">Division labor</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="fieldID">
                              Field *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.fieldID && errors.fieldID)}
                              fullWidth
                              helperText={touched.fieldID && errors.fieldID}
                              name="fieldID"
                              onBlur={handleBlur}
                              size = 'small'
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={dailyCropDetail.fieldID}
                              variant="outlined"
                              id="fieldID"
                            >
                              <MenuItem value='0'>--Select Field--</MenuItem>
                              {generateDropDownMenu(fields)}
                            </TextField>
                          </Grid>
                        </Grid>
                      </CardContent>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3} style={{ marginTop: '5px', marginBottom: '5px' }}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="empNo">
                              Emp No *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.empNo && errors.empNo)}
                              fullWidth
                              helperText={touched.empNo && errors.empNo}
                              name="empNo"
                              onBlur={handleBlur}
                              size = 'small'
                              onChange={(e) => handleChange(e)}
                              value={dailyCropDetail.empNo}
                              variant="outlined"
                              id="empNo"
                              type="text"
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="attendenceID">
                              Attendence *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.attendenceID && errors.attendenceID)}
                              fullWidth
                              helperText={touched.attendenceID && errors.attendenceID}
                              name="attendenceID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              size = 'small'
                              value={dailyCropDetail.attendenceID}
                              variant="outlined"
                              id="attendenceID"
                            >
                              <MenuItem value="0">--Attendence--</MenuItem>
                              <MenuItem value="1">Full Day</MenuItem>
                              <MenuItem value="2">Half Day</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="otHours">
                              OT Hours *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.otHours && errors.otHours)}
                              fullWidth
                              helperText={touched.otHours && errors.otHours}
                              name="otHours"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              size = 'small'
                              value={dailyCropDetail.otHours}
                              variant="outlined"
                              id="otHours"
                              type="text"
                            >
                            </TextField>
                          </Grid>
                        </Grid>
                      </CardContent>
                      <CardContent>
                        <Grid container spacing={4}>
                          <Grid item md={3} xs={12} style={{ marginLeft: '30px', marginTop: '-20px' }}>
                            <FormGroup>
                              <FormControlLabel control={<Checkbox />}
                                label="Is Task Complete"
                                name="isTaskComplete"
                                id="isTaskComplete"
                                onChange={(e) => handleChange(e)}
                                checked={dailyCropDetail.isTaskComplete} />
                              <label htmlFor="isTaskComplete" data-on-label="Yes"
                                data-off-label="No"></label>
                            </FormGroup>
                          </Grid>
                        </Grid>
                      </CardContent>
                      <Box display="flex" justifyContent="flex-end" p={2} style={{ marginRight: '20px', marginBottom: '20px' }}>
                        <Button
                          color="primary"
                          type="submit"
                          variant="contained"
                          disabled={IsAddButtonDisable}
                          size = 'small'
                        >
                          Add
                        </Button>
                      </Box>
                      <Box minWidth={1050}>
                        {attendenceData.length > 0 ?
                          <MaterialTable
                            title="Multiple Actions Preview"
                            columns={[
                              { title: 'Emp No', field: 'empNo' },
                              {
                                title: 'Work Type', field: 'workType', lookup: {
                                  1: "Lent labour",
                                  2: "Division labor"

                                }
                              },
                              { title: 'Field ', field: 'fieldID', render: rowData => fields[rowData.fieldID] },
                              {
                                title: 'Attendence ', field: 'attendenceID', lookup: {
                                  1: "Full",
                                  2: "Half"

                                }
                              },
                              {
                                title: 'Is Task Complete', field: 'isTaskComplete', lookup: {
                                  true: "Yes",
                                  false: "No"
                                }
                              },
                            ]}
                            data={attendenceData}
                            options={{
                              exportButton: false,
                              showTitle: false,
                              headerStyle: { textAlign: "left", height: '1%' },
                              cellStyle: { textAlign: "left" },
                              columnResizable: false,
                              actionsColumnIndex: -1
                            }}
                            actions={[
                              {
                                icon: 'delete',
                                tooltip: 'Remove record',
                                onClick: (event, rowData) => { handleClickEdit(rowData) }
                              },
                            ]}
                          /> : null}
                        {attendenceData.length > 0 ?
                          <Box display="flex" justifyContent="flex-end" p={2}>
                            <Button
                              color="primary"
                              variant="outlined"
                              type="button"
                              onClick={() => trackPromise(handleCancel())}
                              size = 'small'
                            >
                              Cancel
                            </Button>
                            <div>&nbsp;</div>
                            <Button
                              color="primary"
                              variant="contained"
                              type="button"
                              onClick={() => trackPromise(SaveEmployeeSundry())}
                              size = 'small'
                            >
                              Upload
                            </Button>
                          </Box>
                          : null}
                      </Box>
                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            )}
          </Formik>
        </Container>
      </Page >
    </Fragment >
  )
}
