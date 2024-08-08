import React, { useState, useEffect, Fragment, useRef } from 'react';
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
  InputLabel,
  Typography,
  Chip
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import * as Yup from "yup";
import { LoadingComponent } from 'src/utils/newLoader';
import { Formik } from 'formik';
import { useAlert } from "react-alert";
import moment from 'moment';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import MaterialTable from "material-table";

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
  colorSelect: {
    backgroundColor: "#D2042D",
  },
  colorRecordAndNew: {
    backgroundColor: "#FFBE00"
  },
  colorRecord: {
    backgroundColor: "green",
  },
  colorReject: {
    backgroundColor: "red",
  },
  colorApprove: {
    backgroundColor: "green",
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
  },
}));

const screenCode = 'EMPLOYEELEAVE';

export default function EmployeeLeaveAddEdit(props) {
  const title = "Leave Application"
  const classes = useStyles();
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [leaveTypes, setLeaveTypes] = useState();
  const [leaveTypesOne, setLeaveTypesOne] = useState([]);
  const [isExistingLeave, setIsExistingLeave] = useState(false);
  const [leaveDataList, setLeaveDataList] = useState([])
  const [leaveFormData, setLeaveFormData] = useState({
    groupID: 0,
    factoryID: 0,
    workLocationID: 0,
    payPointID: 0,
    leaveTypeID: 0,
    isPayment: false,
    regNo: '',
    employeeID: 0,
    fromDate: new Date(),
    noOfDays: 1,
    applyForID: 1,
    employeeRequestStatusID: 0,
    pendingLeave: 0,
    isTrue: false,
    divisionName: '',
    epfNo: ''
  })
  const [isCleared, setIsCleared] = useState(false);
  const [payPoints, setPayPoints] = useState([]);
  const [workLocation, setWorkLocation] = useState([]);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
    isLeaveRequestApproveReject: false
  });
  const registrationNumberRef = useRef(null);
  const addButtonRef = useRef(null);
  const navigate = useNavigate();
  const [initialState, setInitialState] = useState(false);
  const alert = useAlert();

  useEffect(() => {
    trackPromise(getGroupsForDropdown(), getPermission());
  }, []);

  useEffect(() => {
    if (leaveFormData.groupID != 0) {
      trackPromise(getFactoriesForDropDown());
      trackPromise(getleaveTypesForDropDown());
    }
  }, [leaveFormData.groupID]);

  useEffect(() => {
    if (!initialState) {
      trackPromise(getPermission());
    }
  }, []);

  useEffect(() => {
    setIsCleared(!isCleared);
    GetDivisionDetailsByGroupID()
  }, [leaveFormData.groupID]);

  useEffect(() => {
    setIsCleared(!isCleared);
  }, [leaveFormData.factoryID]);

  useEffect(() => {
    setIsCleared(!isCleared);
  }, [leaveFormData.costCenterID]);

  useEffect(() => {
    if (initialState) {
      setLeaveFormData((prevState) => ({
        ...prevState,
        factoryID: 0,
        workLocationID: 0,
        payPointID: 0
      }));
    }
  }, [leaveFormData.groupID, initialState]);

  useEffect(() => {
    if (initialState) {
      setLeaveFormData((prevState) => ({
        ...prevState,
        workLocationID: 0
      }));
    }
  }, [leaveFormData.factoryID, initialState]);

  useEffect(() => {
    if (isExistingLeave) {
      setLeaveDataList([])
      setIsExistingLeave(false);
    }
  }, [leaveFormData]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITEMPLOYEELEAVE');

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');
    var isLeaveRequestApproveReject = permissions.find(p => p.permissionCode === 'VIEWLEAVEREQUESTAPPROVEREJECT');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
      isLeaveRequestApproveReject: isLeaveRequestApproveReject !== undefined
    });

    setLeaveFormData({
      ...leaveFormData,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
    setInitialState(true);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }
  async function getFactoriesForDropDown() {
    const factory = await services.getFactoryByGroupID(leaveFormData.groupID);
    setFactories(factory);
  }

  async function getleaveTypesForDropDown() {
    const leaveTypes = await services.getleaveTypes(leaveFormData.groupID);
    let leaveTypeArray = []
    for (let item of Object.entries(leaveTypes)) {
      leaveTypeArray[item[1]["employeeLeaveTypeID"]] = item[1]["employeeLeaveTypeName"]
    }
    setLeaveTypesOne(leaveTypes)
    setLeaveTypes(leaveTypeArray);
  }

  async function GetDivisionDetailsByGroupID() {
    const result = await services.GetDivisionDetailsByGroupID(leaveFormData.groupID);
    setPayPoints(result);
    setWorkLocation(result)
  }

  async function submitApplication() {
    let pass = false;
    const verify = await services.getEmployeeAvailability(leaveFormData.groupID, leaveFormData.factoryID, leaveFormData.regNo);
    if (verify.statusCode == "Error") {
      alert.error(verify.message)
      return;
    }
    const response = await services.getEmployeeDetailsByFactoryIDRegistrationNumberEPFNumber(leaveFormData.factoryID, leaveFormData.regNo, leaveFormData.epfNo);
    if (response === null) {
      alert.error("THIS IS INACTIVE EMPLOYEE REG NO");
      return;
    }
    let model1 = {
      leaveTypeID: parseInt(leaveFormData.leaveTypeID),
      registrationNumber: leaveFormData.regNo
    }
    let allocatedDays = await services.getAllocatedDays(model1)

    let model2 = {
      leaveTypeID: parseInt(leaveFormData.leaveTypeID),
      registrationNumber: leaveFormData.regNo
    }
    let remaining = await services.getEmployeeRemainingLeaveValue(model2)

    const found = leaveTypesOne.find(x => x.employeeLeaveTypeID == leaveFormData.leaveTypeID).isPayment
    if (allocatedDays.data === null) {
      setLeaveFormData({
        ...leaveFormData,
        leaveTypeID: 0
      });
      alert.error("This Employee has no leaves allocated");
      pass = false
    }
    else if (found == true) {
      const alreadyAddedLeaves = leaveDataList.filter((leave) => leave.registrationNumber == leaveFormData.regNo)
      if (remaining.data.remainingLeaveValue < (parseInt(leaveFormData.noOfDays) + alreadyAddedLeaves.length)) {
        alert.error("Exceeds remaining number of leaves");
        pass = false
      }
      else {
        pass = true
      }
    }
    else {
      pass = true
    }
    if (pass == true) {
      let leaveArr = []
      const fromDateCopy = new Date(leaveFormData.fromDate)
      const toDate = new Date(fromDateCopy.setDate(fromDateCopy.getDate() + parseInt(leaveFormData.noOfDays)))
      const dateCount = leaveFormData.noOfDays
      const fromDate = new Date(leaveFormData.fromDate)

      const duplicateLeaves = leaveDataList.filter((leave) => leave.registrationNumber == leaveFormData.regNo && (new Date(leave.fromDate) >= fromDate && new Date(leave.fromDate) <= toDate))
      if (duplicateLeaves.length > 0) {
        alert.error("There are some same leave entries in the table")
        return;
      }

      for (let i = 0; i < dateCount; i++) {
        let model = {
          groupID: parseInt(leaveFormData.groupID),
          factoryID: parseInt(leaveFormData.factoryID),
          registrationNumber: leaveFormData.regNo,
          leaveTypeID: parseInt(leaveFormData.leaveTypeID),
          applyForID: parseInt(leaveFormData.applyForID),
          fromDate: i == 0 ? new Date(fromDate) : new Date(fromDate.setDate(fromDate.getDate() + 1)),
          toDate: toDate,
          noOfDays: parseInt(leaveFormData.noOfDays),
          CreatedBy: parseInt(tokenService.getUserIDFromToken()),
          employeeID: response.data.employeeID,
          leaveRefNo: generateLeaveRefNo(),
          employeeSubCategoryMappingID: response.data.employeeSubCategoryMappingID,
          employeeName: response.data.fullName,
          leaveTypeName: leaveTypes[leaveFormData.leaveTypeID],
          payPointID: parseInt(leaveFormData.payPointID),
          workLocationID: parseInt(leaveFormData.workLocationID),
          factoryName: factories[leaveFormData.factoryID],
          workLocationName: workLocation[leaveFormData.workLocationID],
          payPointName: payPoints[leaveFormData.payPointID]
        }
        leaveArr.push(model)
      }
      setLeaveDataList(leaveDataList => [...leaveDataList, ...leaveArr]);
    }
  }

  async function saveLeaveData() {
    const response = await services.SaveLeaveDetails(leaveDataList);
    if (response.statusCode == "Success") {
      setIsExistingLeave(false);
      alert.success(response.message);
      clearData();
      if (response.data.length > 0) {
        setIsExistingLeave(true);
        setLeaveDataList(response.data)
      }
      else {
        setIsExistingLeave(false);
        setLeaveDataList([])
      }
    }
    else {
      alert.error("An error occurred while saving leave details");
    }
  }

  function generateLeaveRefNo() {
    const currentDate = new Date();

    const no = Math.floor(1000000 + Math.random() * 9000000);
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');

    const leaveRefNoInt = `${no}${seconds}`;
    const leaveRefNo = parseInt(leaveRefNoInt);

    return leaveRefNo;
  }

  function submitForm() {
    trackPromise(submitApplication());
  };

  function generateDropDownMenu(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
      }
    }
    return items
  }
  const handleKeyDown = (event, nextInputRef) => {
    if (nextInputRef && nextInputRef.current && typeof nextInputRef.current.focus === 'function') {
      if (event.key === 'Enter' && event.name === 'regNo') {
        event.preventDefault();
        nextInputRef.current.focus();
      }
    }
  }
  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {titleName}
        </Grid>
        <Grid item md={2} xs={12}>
        </Grid>
      </Grid>
    )
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setLeaveFormData({
      ...leaveFormData,
      [e.target.name]: value
    });
  }

  function handleFromDateChange(value) {
    setLeaveFormData({
      ...leaveFormData,
      fromDate: moment(value).format('YYYY-MM-DD')
    });
  }
  function DeleteItem(rowData, event) {
    let tempArray = [...leaveDataList];
    tempArray.splice(rowData.tableData.id, 1);
    setLeaveDataList(tempArray);
  }

  function clearData() {
    setLeaveFormData({
      ...leaveFormData,
      applyForID: 1,
    });
    setLeaveDataList([])
  }

  function clearDatas() {
    setLeaveFormData({
      ...leaveFormData,
      regNo: '',
      leaveTypeID: 0,
      fromDate: new Date(),
      noOfDays: 1,
      applyForID: 1,
      workLocationID: 0,
      payPointID: 0,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    });
    setLeaveDataList([])
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: leaveFormData.groupID,
              factoryID: leaveFormData.factoryID,
              regNo: leaveFormData.regNo,
              leaveTypeID: leaveFormData.leaveTypeID,
              applyForID: leaveFormData.applyForID,
              fromDate: leaveFormData.fromDate,
              date: leaveFormData.date,
              noOfDays: leaveFormData.noOfDays,
              payPointID: leaveFormData.payPointID,
              workLocationID: leaveFormData.workLocationID
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Business Division is required').min("1", 'Business Division is required'),
                factoryID: Yup.number().required('Location is required').min("1", 'Location is required'),
                payPointID: Yup.number().required('Pay Point is required').min("1", 'Pay Point is required'),
                workLocationID: Yup.number().required('Work Location is required').min("1", 'Work Location is required'),
                leaveTypeID: Yup.number().required('Leave Type is required').min("1", 'Leave Type is required'),
                fromDate: Yup.date().required('From Date is required').typeError('From Date is required'),
                
                noOfDays: Yup.number()
                  .when('applyForID', {
                    is: 1,
                    then: Yup.number().min(1, 'No of days must be greater than zero').required('No of days is required'),
                    otherwise: Yup.number()
                  }),
                regNo: Yup.string().required('Registration No is required'),
              })
            }
            onSubmit={submitForm}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              touched,
              values
            }) => {
              return (
                <form onSubmit={handleSubmit}>
                  <Box mt={0}>
                    <Card>
                      <CardHeader
                        title={cardTitle(title)} />
                      <PerfectScrollbar>
                        <Divider />
                        <CardContent>
                          <Card style={{ padding: 30, marginTop: 20, marginBottom: 20 }}>
                            <Grid container spacing={3}>
                              <Grid item md={3} xs={12}>
                                <InputLabel shrink id="groupID">
                                  Business Division *
                                </InputLabel>
                                <TextField select
                                  error={Boolean(touched.groupID && errors.groupID)}
                                  fullWidth
                                  helperText={touched.groupID && errors.groupID}
                                  size='small'
                                  name="groupID"
                                  onBlur={handleBlur}
                                  onChange={(e) => handleChange(e)}
                                  value={leaveFormData.groupID}
                                  variant="outlined"
                                  id="groupID"
                                  InputProps={{
                                    readOnly: !permissionList.isGroupFilterEnabled
                                  }}
                                >
                                  <MenuItem value="0">--Select Business Division--</MenuItem>
                                  {generateDropDownMenu(groups)}
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
                                  size='small'
                                  name="factoryID"
                                  onBlur={handleBlur}
                                  onChange={(e) => handleChange(e)}
                                  value={leaveFormData.factoryID}
                                  variant="outlined"
                                  id="factoryID"
                                  InputProps={{
                                    readOnly: !permissionList.isFactoryFilterEnabled
                                  }}
                                >
                                  <MenuItem value="0">--Select Location--</MenuItem>
                                  {generateDropDownMenu(factories)}
                                </TextField>
                              </Grid>
                              <Grid item md={3} xs={12}>
                                <InputLabel shrink id="workLocationID">
                                  Work Location *
                                </InputLabel>
                                <TextField select fullWidth
                                  error={Boolean(touched.workLocationID && errors.workLocationID)}
                                  helperText={touched.workLocationID && errors.workLocationID}
                                  size='small'
                                  onBlur={handleBlur}
                                  id="workLocationID"
                                  name="workLocationID"
                                  value={leaveFormData.workLocationID}
                                  type="text"
                                  variant="outlined"
                                  onChange={(e) => handleChange(e)}
                                >
                                  <MenuItem value="0">--Select Work Location--</MenuItem>
                                  {generateDropDownMenu(workLocation)}
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
                                  value={leaveFormData.payPointID}
                                  variant="outlined"
                                  id="payPointID"
                                  size='small'
                                >
                                  <MenuItem value="0">--Select Pay Point--</MenuItem>
                                  {generateDropDownMenu(payPoints)}
                                </TextField>
                              </Grid>
                              <Grid item md={3} xs={12}>
                                <InputLabel shrink id="leaveTypeID">
                                  Leave Type *
                                </InputLabel>
                                <TextField select
                                  error={Boolean(touched.leaveTypeID && errors.leaveTypeID)}
                                  fullWidth
                                  helperText={touched.leaveTypeID && errors.leaveTypeID}
                                  size='small'
                                  name="leaveTypeID"
                                  onBlur={handleBlur}
                                  onChange={(e) => handleChange(e)}
                                  value={leaveFormData.leaveTypeID}
                                  disabled={(leaveFormData.employeeRequestStatusID == 2 || leaveFormData.employeeRequestStatusID == 3)}
                                  variant="outlined"
                                  id="leaveTypeID"
                                >
                                  <MenuItem value="0">--Select Leave Type--</MenuItem>
                                  {generateDropDownMenu(leaveTypes)}
                                </TextField>
                              </Grid>
                              <Grid item md={3} xs={12}>
                                <InputLabel shrink id="fromDate" >
                                  From Date *
                                </InputLabel>
                                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                  <KeyboardDatePicker
                                    disableCloseOnSelect
                                    error={Boolean(touched.fromDate && errors.fromDate)}
                                    autoOk
                                    format="yyyy-MM-dd"
                                    fullWidth
                                    helperText={touched.fromDate && errors.fromDate ? errors.fromDate : ''}
                                    // helperText={touched.fromDate && errors.fromDate}
                                    size='small'
                                    name="fromDate"
                                    onChange={(e) => handleFromDateChange(e)}
                                    value={leaveFormData.fromDate}
                                    disabled={(leaveFormData.employeeRequestStatusID == 2 || leaveFormData.employeeRequestStatusID == 3)}
                                    inputVariant="outlined"
                                    id="fromDate"
                                    KeyboardButtonProps={{
                                      'aria-label': 'change date',
                                    }}
                                  />
                                </MuiPickersUtilsProvider>
                              </Grid>
                              <Grid item md={3} xs={12}>
                                <InputLabel shrink id="noOfDays">
                                  No Of Days *
                                </InputLabel>
                                <TextField
                                  error={Boolean(touched.noOfDays && errors.noOfDays)}
                                  fullWidth
                                  helperText={touched.noOfDays && errors.noOfDays}
                                  size='small'
                                  name="noOfDays"
                                  type='number'
                                  onBlur={handleBlur}
                                  onChange={(e) => handleChange(e)}
                                  value={leaveFormData.noOfDays}
                                  variant="outlined"
                                  id="noOfDays"
                                >
                                </TextField>
                              </Grid>
                              <Grid item md={3} xs={12} >
                                <InputLabel shrink id="regNo">
                                  Reg No. *
                                </InputLabel>
                                <TextField
                                  error={Boolean(touched.regNo && errors.regNo)}
                                  fullWidth
                                  helperText={touched.regNo && errors.regNo}
                                  size='small'
                                  name="regNo"
                                  onChange={(e) => handleChange(e)}
                                  value={leaveFormData.regNo}
                                  variant="outlined"
                                  id="regNo"
                                  inputRef={registrationNumberRef}
                                  onKeyDown={(e) => handleKeyDown(e, addButtonRef)}
                                >
                                </TextField>
                              </Grid>
                              <Grid container justify="flex-end">
                                <Box pr={2}>
                                  {leaveDataList.length <= 0 || isExistingLeave ?
                                    <Button
                                      color="primary"
                                      type="reset"
                                      variant="outlined"
                                      onClick={() => clearDatas()}
                                    >
                                      Clear
                                    </Button>
                                    : null}
                                  &nbsp;&nbsp;
                                  <Button
                                    color="primary"
                                    variant="contained"
                                    type="submit"
                                    style={{ marginLeft: 10 }}
                                    ref={addButtonRef}
                                  >
                                    {"ADD"}
                                  </Button>
                                </Box>
                              </Grid>
                            </Grid>
                            <br />
                            {leaveDataList.length > 0 || isExistingLeave ?
                              <Chip style={{ marginLeft: '1rem', backgroundColor: "#44a6c6 ", fontWeight: "bold" }} alignContent="center"
                                label={"Count : " + leaveDataList.length}
                                clickable
                                color="primary"
                              />
                              : null}
                            <br />
                            {isExistingLeave && leaveDataList.length > 0 ?
                              <Typography style={{ color: "red", fontWeight: 'bold' }}>These employees already have leave records for these dates</Typography> : null}
                            <br />
                            {leaveDataList.length > 0 || isExistingLeave ?
                              <Box minWidth={1000}>
                                <MaterialTable
                                  columns={[
                                    { title: 'Reg.No.', field: 'registrationNumber' },
                                    { title: 'Emp.Name', field: 'employeeName' },
                                    { title: 'Location', field: 'factoryName' },
                                    { title: 'Work Location', field: 'workLocationName' },
                                    { title: 'Pay Point', field: 'payPointName' },
                                    {
                                      title: 'Date', field: 'fromDate', type: "date",
                                      render: rowData => moment(rowData.fromDate).format('YYYY-MM-DD')
                                    },
                                    { title: 'Type', field: 'leaveTypeName' }
                                  ]}
                                  data={leaveDataList}
                                  options={{
                                    exportButton: false,
                                    showTitle: false,
                                    headerStyle: { textAlign: "left", height: '1%' },
                                    cellStyle: { textAlign: "left" },
                                    columnResizable: false,
                                    actionsColumnIndex: isExistingLeave ? -1 : -1
                                  }}
                                  actions={
                                    isExistingLeave
                                      ? []
                                      : [
                                        {
                                          icon: 'delete',
                                          tooltip: 'Delete Leave',
                                          onClick: (event, rowData,) => {
                                            DeleteItem(rowData, event)
                                          }
                                        }
                                      ]}
                                />
                              </Box> : null}
                            <br />
                          </Card>
                        </CardContent>
                        {leaveDataList.length > 0 && !isExistingLeave ?
                          <Box display="flex" justifyContent="flex-end" p={2}>
                            <Button
                              color="primary"
                              variant="contained"
                              disabled={leaveDataList.length <= 0}
                              style={{ marginLeft: 10 }}
                              ref={addButtonRef}
                              onClick={saveLeaveData}
                            >
                              {"Send To Approve"}
                            </Button>
                          </Box>
                          : null}
                      </PerfectScrollbar>
                    </Card>
                  </Box>
                </form>
              );
            }}
          </Formik>
        </Container>
      </Page>
    </Fragment>
  )
}