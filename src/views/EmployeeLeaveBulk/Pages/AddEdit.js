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
  Switch,
  Tooltip,
  Typography,
  IconButton
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import * as Yup from "yup";
import { LoadingComponent } from 'src/utils/newLoader';
import { Formik } from 'formik';
import { useAlert } from "react-alert";
import PageHeader from 'src/views/Common/PageHeader';
import moment from 'moment';
import { AgriGenERPEnum } from 'src/views/Common/AgriGenERPEnum/AgriGenERPEnum';
import ReactToPrint from "react-to-print";
import CreatePdf from './createPdf';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Checkbox from '@material-ui/core/Checkbox';
import MaterialTable from "material-table";
import Chip from '@material-ui/core/Chip';
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import { CustomMultiSelect } from 'src/utils/CustomMultiSelect';
import CircularProgress from '@material-ui/core/CircularProgress';

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

const screenCode = 'EMPLOYEELEAVEBULK';

export default function EmployeeLeaveBulkAddEdit(props) {
  const agriGenERPEnum = new AgriGenERPEnum();
  const componentRef = useRef([]);
  const [title, setTitle] = useState("Employee Leave Bulk")
  const classes = useStyles();
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [costCenters, setCostCenters] = useState();
  const [gangs, setGangs] = useState([]);
  const [employeeSubCategoryMapping, setEmployeeSubCategoryMapping] = useState();
  const [employeeReligions, setEmployeeReligions] = useState();
  const [leaveTypes, setLeaveTypes] = useState();
  const [leaveTypesOne, setLeaveTypesOne] = useState([]);
  const [payPoints, setPayPoints] = useState([]);
  const [employeeVerified, setEmployeeVerified] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [remainingLeave, setRemainingLeave] = useState(0);
  const [refNo, setRefNo] = useState(0);
  const [allocatedDays, setAllocatedDays] = useState(null);
  const [isPlucking, setIsPlucking] = useState(true)
  const [reportData, setReportData] = useState([]);
  const [isDisable, setIsDisable] = useState(true);
  const [pdfData, setpdfData] = useState({
    daysEnjoyed: 0,
    fromDate: '',
    toDate: ''
  });
  const [PDFDate, setPDFDate] = useState({
    fromDate: '',
    toDate: ''
  })
  const [open, setOpen] = useState(false);
  const [openOne, setOpenOne] = useState(false);
  const [openTwo, setOpenTwo] = useState(false);
  const [leaveRequestData, setLeaveRequestData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isPDF, setIsPDF] = useState(false);
  const [leaveFormData, setLeaveFormData] = useState({
    groupID: 0,
    factoryID: 0,
    costCenterID: 0,
    gangID: 0,
    religionID: 0,
    payPointID: 0,
    leaveTypeID: 0,
    isPayment: false,
    regNo: '',
    employeeID: 0,
    fromDate: '',
    toDate: null,
    date: '',
    coveringPerson: '',
    noOfDays: 0,
    isCoveringPerson: false,
    applyForID: 1,
    timeFrom: '',
    timeTo: '',
    reason: '',
    halfID: 0,
    employeeRequestStatusID: 0,
    pendingLeave: 0,
    employeeSubCategoryMappingID: 0,
    isTrue: false
  })
  const [isDisableButton, setIsDisableButton] = useState(false);
  const [clearStatus, setClearStatus] = useState('');
  const [isCleared, setIsCleared] = useState(false);
  const [isClear, setIsClear] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const [initialState, setInitialState] = useState(false);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
    isLeaveRequestApproveReject: false
  });
  const [response, setResponse] = useState({
    totalCount: 0,
    remainingCount: 0,
    alreadyLeaveCount: 0,
    successfullCount: 0
  });
  const { leaveRefNo } = useParams();
  let decryptedID = 0;
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/app/employeeLeaveBulk/listing');
  }

  const handleOpenDialog = () => {
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleCloseDialogTwo = () => {
    setOpenTwo(false);
    navigate('/app/employeeLeaveBulk/listing');
  };

  const alert = useAlert();

  const [selectedOptions1, setSelectedOptions1] = useState([]);
  const getOptionLabel1 = option => `${option.label}`;
  const getOptionDisabled1 = option => option.value === "foo";
  const handleToggleOption1 = selectedOptions =>
    setSelectedOptions1(selectedOptions);
  const handleClearOptions1 = () => setSelectedOptions1([]);
  const handleSelectAll1 = isSelected => {
    if (isSelected) {
      setSelectedOptions1(employeeList);
    } else {
      handleClearOptions1();
    }
  };

  useEffect(() => {
    trackPromise(getGroupsForDropdown(), getEmployeeReligions(), getPermission(), GetAllEmployeeSubCategoryMapping());
  }, []);

  useEffect(() => {
    decryptedID = atob(leaveRefNo.toString());
    setRefNo(decryptedID)
    if (decryptedID != 0) {
      trackPromise(getEmployeeLeaveFormDetailsByEmployeeLeaveRequestID(decryptedID));
      trackPromise(getEmployeeLeaveFormDetailsByLeaveRefNo(decryptedID));
    }
  }, []);

  useEffect(() => {
    if (leaveFormData.groupID != 0) {
      trackPromise(getFactoriesForDropDown());
    }
  }, [leaveFormData.groupID]);

  useEffect(() => {
    if (!initialState) {
      trackPromise(getPermission());
    }
  }, []);


  useEffect(() => {
    if (!isUpdate) {
      if (leaveFormData.regNo != '' || leaveFormData.leaveTypeID) {
        getEmployeeRemainingLeaveValue(parseInt(leaveFormData.leaveTypeID), parseInt(leaveFormData.employeeID))
      }
    }
  }, [leaveFormData.leaveTypeID]);

  useEffect(() => {
    if (!isUpdate) {
      if (leaveFormData.regNo != '' || leaveFormData.leaveTypeID) {
        getAllocatedDays(parseInt(leaveFormData.leaveTypeID), parseInt(leaveFormData.employeeID))
      }
    }
  }, [leaveFormData.leaveTypeID]);

  useEffect(() => {
    if (initialState) {
      setLeaveFormData((prevState) => ({
        ...prevState,
        payPointID: 0,

      }));
    }
  }, [leaveFormData.groupID, initialState]);

  useEffect(() => {
    if (leaveFormData.groupID != '') {
      trackPromise(getleaveTypesForDropDown(),
        GetDivisionDetailsByGroupID());
    }
  }, [leaveFormData.groupID]);

  useEffect(() => {
    if (leaveFormData.toDate != '' && leaveFormData.toDate != '') {
      handleDateDifference();
    }
  }, [leaveFormData.fromDate]);

  useEffect(() => {
    if (!isUpdate) {
      trackPromise(getPermantEmployeeRegNo());
    }
  }, [leaveFormData.religionID, leaveFormData.employeeSubCategoryMappingID,
  leaveFormData.regNo, leaveFormData.payPointID, leaveFormData.leaveTypeID, leaveFormData.fromDate]);

  useEffect(() => {
    setEmployeeList([]);
    setIsCleared(!isCleared);
    setIsClear(true);
    setClearStatus('');
    setLeaveRequestData([])
  }, [leaveFormData.groupID]);

  useEffect(() => {
    setEmployeeList([]);
    setIsCleared(!isCleared);
    setIsClear(true);
    setClearStatus('');
    setLeaveRequestData([])
  }, [leaveFormData.factoryID]);

  useEffect(() => {
    trackPromise(getCostCenterDetailsByGardenID());
  }, [leaveFormData.factoryID]);

  useEffect(() => {
    setEmployeeList([]);
    setIsCleared(!isCleared);
    setIsClear(true);
    setClearStatus('');
    setLeaveRequestData([])
  }, [leaveFormData]);

  useEffect(() => {
    if (leaveFormData.costCenterID != 0) {
      getGangDetailsByDivisionID();
    }
  }, [leaveFormData.costCenterID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITEMPLOYEELEAVEBULK');

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');
    var isLeaveRequestApproveReject = permissions.find(p => p.permissionCode === 'VIEWLEAVEREQUESTAPPROVEREJECTBULK');

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

  async function getCostCenterDetailsByGardenID() {
    var response = await services.getDivisionDetailsByEstateID(leaveFormData.factoryID);
    setCostCenters(response);
  };

  async function getGangDetailsByDivisionID() {
    var response = await services.getGangDetailsByDivisionID(leaveFormData.costCenterID);
    setGangs(response);
  };

  async function getEmployeeReligions() {
    const result = await services.getEmployeeReligions();
    setEmployeeReligions(result)
  }

  async function GetAllEmployeeSubCategoryMapping() {
    const result = await services.GetAllEmployeeSubCategoryMapping();
    setEmployeeSubCategoryMapping(result)
  }

  async function getleaveTypesForDropDown() {
    const leaveTypes = await services.getleaveTypes(leaveFormData.groupID);
    let leaveTypeArray = []
    for (let item of Object.entries(leaveTypes)) {
      if (item[1]["shortForm"] == 'AL' || item[1]["shortForm"] == 'FL') {
        leaveTypeArray[item[1]["employeeLeaveTypeID"]] = item[1]["employeeLeaveTypeName"]
      }
    }
    // var generated = generateDropDownMenu(leaveTypeArray)
    // if (generated.length > 0) {
    //   setLeaveFormData((attendanceDataList) => ({
    //     ...attendanceDataList,
    //     leaveTypeID: generated[0].props.value,
    //   }));
    // }
    setLeaveTypesOne(leaveTypes)
    setLeaveTypes(leaveTypeArray);
  }

  async function GetDivisionDetailsByGroupID() {
    const result = await services.GetDivisionDetailsByGroupID(leaveFormData.groupID);
    setPayPoints(result)
  }

  async function getEmployeeLeaveFormDetailsByEmployeeLeaveRequestID(LeaveRefNo) {
    let response = await services.GetBulkLeaveRequestDetailsByLeaveRefNo(LeaveRefNo);
    setTitle("Edit Employee Leave Form");
    let model = {
      groupID: response.groupID,
      factoryID: response.factoryID,
      costCenterID: response.employeeDivisionID,
      gangID: response.gangId,
      religionID: response.religionID,
      leaveTypeID: response.leaveTypeID,
      isPayment: response.isPayment,
      regNo: response.registrationNumber,
      applyForID: response.applyForID,
      fromDate: moment(response.fromDate).format('YYYY-MM-DD'),
      toDate: moment(response.toDate).format('YYYY-MM-DD'),
      noOfDays: response.noOfDays,
      reason: response.reason,
      isCoveringPerson: response.isCoveringPerson,
      coveringPerson: response.coveringPerson,
      timeFrom: response.timeFrom,
      timeTo: response.timeTo,
      date: new Date(response.date).toISOString().slice(0, 10),
      halfID: response.halfID,
      isPlucking: response.isPlucking,
      employeeRequestStatusID: response.employeeLeaveRequestStatusID,
      pendingLeave: response.pendingLeave > 0 ? true : false,
      daysEnjoyed: 0,
      isTrue: response.isTrue,
    }
    setIsPlucking(response.isPlucking)
    setLeaveFormData(model);
    setIsUpdate(true);
    setEmployeeVerified(false);
    setReportData([response]);
    setRemainingLeave(response.remainingQuntity);
    getEmployeeRemainingLeaveValue(parseInt(model.leaveTypeID), parseInt(leaveFormData.employeeID));
    getAllocatedDays(parseInt(model.leaveTypeID), parseInt(leaveFormData.employeeID));
  }

  async function getEmployeeLeaveFormDetailsByLeaveRefNo(LeaveRefNo) {
    let response = await services.getEmployeeLeaveFormDetailsByLeaveRefNo(LeaveRefNo);
    response.data.forEach((x, i) => {
      x.index = i
    })
    setLeaveRequestData(response.data)
  }

  async function getEmployeeRemainingLeaveValue(leaveTypeID, regNo) {
    let remaining = await services.getEmployeeRemainingLeaveValue(leaveTypeID, regNo)
    if (remaining.statusCode == "Success") {
      setRemainingLeave(remaining.data.remainingLeaveValue)
    }
  }

  async function getAllocatedDays(leaveTypeID, regNo) {
    let allocatedDays = await services.getAllocatedDays(leaveTypeID, regNo)
    if (allocatedDays.data === null) {
      setAllocatedDays(0)
    }
    else {
      setAllocatedDays(allocatedDays.data.allocatedDays)
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

  function submitForm(values) {
    const selectedRowsData = selectedOptions1.map(row => ({
      groupID: parseInt(values.groupID),
      factoryID: parseInt(row.operationEntityID),
      payPointID: parseInt(values.payPointID),
      registrationNumber: row.label,
      employeeID: row.value,
      employeeName: row.empName,
      workLocationName: row.workLocationName,
      payPointName: row.payPointName,
      balance: row.balance,
      noOfDays: parseInt(1),
      leaveTypeID: parseInt(values.leaveTypeID),
      leaveTypeName: leaveTypes[values.leaveTypeID],
      leaveTypeCode: leaveTypesOne.find(x => x.employeeLeaveTypeID == parseInt(values.leaveTypeID)).shortForm,
      fromDate: values.fromDate,
      toDate: values.fromDate,
      reason: values.reason,
      leaveRefNo: generateLeaveRefNo(),
      createdBy: parseInt(tokenService.getUserIDFromToken())
    }));
    setUploadData(selectedRowsData)
    setLeaveRequestData(selectedRowsData)
  };

  async function SaveSendToApprove() {
    setOpenOne(true)
    const response = await services.SaveSendToApprove(uploadData);
    if (response.statusCode === "Success") {
      setOpenOne(false)
      setOpenTwo(true)
      setResponse((prevState) => ({
        ...prevState,
        totalCount: response.data.totalCount,
        remainingCount: response.data.remainingCount,
        alreadyLeaveCount: response.data.alreadyLeaveCount,
        successfullCount: response.data.successfullCount
      }));
    }
    else {
      setOpenOne(false)
      alert.error(response.message);
    }
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
        <Grid item md={2} xs={12}>
          <PageHeader
            onClick={handleClick}
          />
        </Grid>
      </Grid>
    )
  }

  function handleDateDifference() {
    const oneDay = 24 * 60 * 60 * 1000;
    const startTimestamp = new Date(leaveFormData.fromDate).getTime();
    const endTimestamp = new Date(leaveFormData.fromDate).getTime();

    const diffInDays = Math.round(Math.abs(((startTimestamp - endTimestamp) / oneDay)) + 1);

    setLeaveFormData({
      ...leaveFormData,
      noOfDays: diffInDays
    })
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
      fromDate: moment(value).format('YYYY-MM-DD'),
      toDate: moment(value).format('YYYY-MM-DD')
    });
  }

  function handleToDateChange(value) {
    setLeaveFormData({
      ...leaveFormData,
      toDate: moment(value).format('YYYY-MM-DD')
    });
  }

  function clearData() {
    setLeaveFormData({
      ...leaveFormData,
      regNo: '',
      employeeID: 0,
      leaveTypeID: 0,
      fromDate: '',
      toDate: '',
      timeFrom: '',
      timeTo: '',
      date: '',
      noOfDays: 0,
      isCoveringPerson: false,
      coveringPerson: '',
      reason: '',
      applyForID: 0
    });
  }

  async function getPermantEmployeeRegNo() {
    let model = {
      groupID: parseInt(leaveFormData.groupID),
      //factoryID: parseInt(leaveFormData.factoryID),
      //costCenterID: parseInt(leaveFormData.costCenterID),
      //gangID: parseInt(leaveFormData.gangID),
      religionID: parseInt(leaveFormData.religionID),
      payPointID: parseInt(leaveFormData.payPointID),
      employeeSubCategoryMappingID: parseInt(leaveFormData.employeeSubCategoryMappingID),
      leaveTypeID: parseInt(leaveFormData.leaveTypeID),
      date: moment(leaveFormData.fromDate).format('YYYY-MM-DD'),
      regNo: leaveFormData.regNo
    }

    let response = await services.getPermantEmployeeRegNo(model);
    const newOptionArray = [];
    for (var i = 0; i < response.length; i++) {
      newOptionArray.push({
        label: response[i].registrationNumber,
        value: response[i].employeeID,
        empName: response[i].employeeName,
        payPointName: response[i].payPointName,
        workLocationName: response[i].workLocationName,
        operationEntityID: response[i].operationEntityID,
        balance: response[i].balance
      })
    }
    setSelectedOptions1(newOptionArray)
    setEmployeeList(newOptionArray);
  }

  const [checkAll, setCheckAll] = useState(false);
  const [uploadData, setUploadData] = useState([]);
  const selectAll = () => {
    setCheckAll(!checkAll);
  };

  function handleClickOneAll(e) {
    let uploadDataCopy = [...uploadData];
    if (e.target.checked) {
      leaveRequestData.forEach(x => {
        const isEnable = uploadDataCopy.filter((p) => p.leaveRefNo == x.leaveRefNo);
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
    const isEnable = uploadDataCopy.filter((p) => p.leaveRefNo == data.leaveRefNo);
    if (isEnable.length === 0) {
      uploadDataCopy.push(data)
    } else {
      var index = uploadDataCopy.indexOf(isEnable[0]);
      uploadDataCopy.splice(index, 1);
    }
    setUploadData(uploadDataCopy);
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: leaveFormData.groupID,
              //factoryID: leaveFormData.factoryID,
              regNo: leaveFormData.regNo,
              leaveTypeID: leaveFormData.leaveTypeID,
              payPointID: leaveFormData.payPointID,
              applyForID: leaveFormData.applyForID,
              fromDate: leaveFormData.fromDate,
              //noOfDays: leaveFormData.noOfDays,
              reason: leaveFormData.reason,
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Business Division is required').min("1", 'Business Division is required'),
                //factoryID: Yup.number().required('Location is required').min("1", 'Location is required'),
                payPointID: Yup.number().required('PayPoint is required').min("1", 'PayPoint is required'),
                leaveTypeID: Yup.number().required('Leave Type is required').min("1", 'Leave Type is required'),
                applyForID: Yup.number().required('Applying for is required').min("1", 'Applying for is required'),
                fromDate: Yup.date().required('From Date is required'),
                //noOfDays: Yup.number().min(1, 'No of days must be greater than zero').required('No of days is required'),
              })
            }
            onSubmit={(value) => submitForm(value)}
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
                          <Grid container spacing={3}>
                            <Grid item md={4} xs={12}>
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
                                  readOnly: isUpdate || !permissionList.isGroupFilterEnabled
                                }}
                              >
                                <MenuItem value="0">--Select Business Division--</MenuItem>
                                {generateDropDownMenu(groups)}
                              </TextField>
                            </Grid>
                            <Grid item md={4} xs={12}>
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
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="fromDate" >
                                Date *
                              </InputLabel>
                              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <KeyboardDatePicker
                                  disableCloseOnSelect
                                  error={Boolean(touched.fromDate && errors.fromDate)}
                                  autoOk
                                  format="yyyy-MM-dd"
                                  fullWidth
                                  helperText={touched.fromDate && errors.fromDate}
                                  size='small'
                                  name="fromDate"
                                  onChange={(e) => handleFromDateChange(e)}
                                  value={leaveFormData.fromDate}
                                  inputVariant="outlined"
                                  id="fromDate"
                                  inputProps={{
                                    readOnly: isUpdate
                                  }}
                                  KeyboardButtonProps={{
                                    'aria-label': 'change date',
                                  }}
                                />
                              </MuiPickersUtilsProvider>
                            </Grid>
                            {/* <Grid item md={4} xs={12}>
                              <InputLabel shrink id="gangID">
                                Duffa
                              </InputLabel>
                              <TextField select fullWidth
                                name="gangID"
                                size='small'
                                onChange={(e) => handleChange(e)}
                                value={leaveFormData.gangID}
                                variant="outlined"
                                id="gangID"
                                InputProps={{
                                  readOnly: isUpdate
                                }}
                              >
                                <MenuItem value={'0'}>--Select Duffa--</MenuItem>
                                {generateDropDownMenu(gangs)}
                              </TextField>
                            </Grid> */}
                            {/* <Grid item md={4} xs={12}>
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
                                  readOnly: isUpdate || !permissionList.isFactoryFilterEnabled
                                }}
                              >
                                <MenuItem value="0">--Select Location--</MenuItem>
                                {generateDropDownMenu(factories)}
                              </TextField>
                            </Grid>
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="costCenterID">
                                Sub Division
                              </InputLabel>
                              <TextField select
                                error={Boolean(touched.costCenterID && errors.costCenterID)}
                                fullWidth
                                helperText={touched.costCenterID && errors.costCenterID}
                                name="costCenterID"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange(e)}
                                value={leaveFormData.costCenterID}
                                variant="outlined"
                                id="costCenterID"
                                size='small'
                                InputProps={{
                                  readOnly: isUpdate
                                }}
                              >
                                <MenuItem value="0">--Select Sub Division--</MenuItem>
                                {generateDropDownMenu(costCenters)}
                              </TextField>
                            </Grid> */}
                          </Grid>
                          <Grid container spacing={3}>
                            <Grid item md={4} xs={12}>
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
                                variant="outlined"
                                id="leaveTypeID"
                                InputProps={{
                                  readOnly: isUpdate
                                }}
                              >
                                <MenuItem value="0">--Select Leave Type--</MenuItem>
                                {generateDropDownMenu(leaveTypes)}
                              </TextField>
                            </Grid>
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="employeeSubCategoryMappingID">
                                Employee Sub Category
                              </InputLabel>
                              <TextField select fullWidth
                                size='small'
                                id="employeeSubCategoryMappingID"
                                name="employeeSubCategoryMappingID"
                                value={leaveFormData.employeeSubCategoryMappingID}
                                type="text"
                                variant="outlined"
                                onChange={(e) => handleChange(e)}
                              >
                                <MenuItem value="0">--Select Employee Sub Category--</MenuItem>
                                {generateDropDownMenu(employeeSubCategoryMapping)}
                              </TextField>
                            </Grid>
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="religionID">
                                Religion
                              </InputLabel>
                              <TextField select fullWidth
                                error={Boolean(touched.religionID && errors.religionID)}
                                helperText={touched.religionID && errors.religionID}
                                size='small'
                                name="religionID"
                                id="religionID"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange(e)}
                                value={leaveFormData.religionID}
                                variant="outlined"
                                InputProps={{
                                  readOnly: isUpdate
                                }}
                              >
                                <MenuItem value="0">--Select Religion--</MenuItem>
                                {generateDropDownMenu(employeeReligions)}
                              </TextField>
                            </Grid>
                          </Grid>
                          <Grid container spacing={3} >
                            {isUpdate ?
                              <Grid item md={4} xs={12}>
                                <InputLabel shrink id="regNo">
                                  Reg.No
                                </InputLabel>
                                <TextField
                                  error={Boolean(touched.regNo && errors.regNo)}
                                  fullWidth
                                  helperText={touched.regNo && errors.regNo}
                                  name="regNo"
                                  onBlur={handleBlur}
                                  value={leaveFormData.regNo}
                                  variant="outlined"
                                  disabled={isDisableButton}
                                  InputProps={{
                                    readOnly: isUpdate
                                  }}
                                  size='small'
                                />
                              </Grid> :
                              <Grid item md={4} xs={12}>
                                <InputLabel shrink id="employeeID">
                                  Reg.No
                                </InputLabel>
                                <CustomMultiSelect
                                  items={employeeList}
                                  getOptionLabel={getOptionLabel1}
                                  getOptionDisabled={getOptionDisabled1}
                                  selectedValues={selectedOptions1}
                                  placeholder="--Select Employee--"
                                  selectAllLabel="Select all"
                                  onToggleOption={handleToggleOption1}
                                  onClearOptions={handleClearOptions1}
                                  onSelectAll={handleSelectAll1}
                                />
                              </Grid>
                            }
                          </Grid>
                          <br />
                          <Divider />
                          <br />
                          {/* <Grid container spacing={3} >
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="toDate" >
                                To Date *
                              </InputLabel>
                              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <KeyboardDatePicker
                                  autoOk
                                  format="yyyy-MM-dd"
                                  fullWidth
                                  size='small'
                                  name="toDate"
                                  onChange={(e) => handleToDateChange(e)}
                                  value={leaveFormData.toDate}
                                  inputVariant="outlined"
                                  id="toDate"
                                  disabled />
                              </MuiPickersUtilsProvider>
                            </Grid>
                            <Grid item md={4} xs={12}>
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
                                disabled
                                variant="outlined"
                                id="noOfDays"
                              >
                              </TextField>
                            </Grid>
                          </Grid> */}
                          <Grid container spacing={3}>
                            <Grid item md={8} xs={12}>
                              <InputLabel shrink id="reason">
                                Reason
                              </InputLabel>
                              <TextField
                                fullWidth
                                size='small'
                                name="reason"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange(e)}
                                value={leaveFormData.reason}
                                variant="outlined"
                                id="reason"
                                InputProps={{
                                  readOnly: isUpdate
                                }}
                                multiline
                                rows={3}
                              >
                              </TextField>
                            </Grid>
                          </Grid>
                          <Grid container spacing={3}>
                            {permissionList.isLeaveRequestApproveReject && isUpdate ?
                              <Grid item md={4} xs={12} >
                                <InputLabel shrink id="remainingLeave">
                                  Remaining Leave Count
                                </InputLabel>
                                <TextField
                                  fullWidth
                                  size='small'
                                  name="remainingLeave"
                                  type='number'
                                  onBlur={handleBlur}
                                  onChange={(e) => handleChange(e)}
                                  value={remainingLeave}
                                  variant="outlined"
                                  id="remainingLeave"
                                  inputProps={{
                                    readOnly: true
                                  }}
                                >
                                </TextField>
                              </Grid> : null}
                            {permissionList.isLeaveRequestApproveReject && isUpdate ?
                              <Grid item md={4} xs={12} >
                                <InputLabel shrink id="refNo">
                                  Ref No
                                </InputLabel>
                                <TextField
                                  fullWidth
                                  size='small'
                                  name="refNo"
                                  type='number'
                                  onBlur={handleBlur}
                                  onChange={(e) => handleChange(e)}
                                  value={refNo}
                                  variant="outlined"
                                  id="refNo"
                                  inputProps={{
                                    readOnly: true
                                  }}
                                >
                                </TextField>
                              </Grid> : null}
                          </Grid>
                        </CardContent>
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          {!isUpdate ?
                            <Button
                              color="primary"
                              variant="contained"
                              type="submit"
                              style={{ marginLeft: 10 }}
                            >
                              {"Create Bulk List"}
                            </Button>
                            : null}
                        </Box>
                        {isUpdate == false ?
                          <>
                            {leaveRequestData.length > 0 ?
                              <Box minWidth={1000}>
                                <MaterialTable
                                  title="Multiple Actions Preview"
                                  columns={[
                                    { title: 'Reg.No.', field: 'registrationNumber' },
                                    { title: 'Emp.Name', field: 'employeeName' },
                                    { title: 'W/L', field: 'workLocationName' },
                                    { title: 'P/P', field: 'payPointName' },
                                    { title: 'Leave Type', field: 'leaveTypeCode' },
                                    { title: 'Leave Name', field: 'leaveTypeName' },
                                    { title: 'Balance', field: 'balance' },
                                    { title: 'Date', field: 'fromDate', render: rowData => rowData.fromDate.split('T')[0] },
                                    // { title: 'T.Date', field: 'toDate', render: rowData => rowData.toDate.split('T')[0] },
                                    {
                                      title: (
                                        <label>
                                          Select All
                                          <Checkbox
                                            color="primary"
                                            onClick={(e) => handleClickOneAll(e)}
                                            onChange={selectAll}
                                            checked={leaveRequestData.length != 0 && uploadData.length == leaveRequestData.length}
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
                                          checked={!(uploadData.find((x) => x.leaveRefNo == data.leaveRefNo) == undefined)}
                                        ></Checkbox>
                                      ),
                                    }
                                  ]}
                                  data={leaveRequestData}
                                  options={{
                                    exportButton: false,
                                    showTitle: false,
                                    headerStyle: { textAlign: "left", height: '1%' },
                                    cellStyle: { textAlign: "left" },
                                    columnResizable: false,
                                    actionsColumnIndex: -1
                                  }}
                                />
                              </Box>
                              : null}
                          </>
                          :
                          <>
                            {leaveRequestData.length > 0 ?
                              <Box minWidth={1000}>
                                <MaterialTable
                                  title="Multiple Actions Preview"
                                  columns={[
                                    { title: 'Emp.ID', field: 'registrationNumber' },
                                    { title: 'Emp.Name', field: 'employeeName' },
                                    { title: 'Leave Name', field: 'employeeLeaveTypeName' },
                                    {
                                      title: 'Apply For', field: 'applyForID',
                                      render: rowData => {
                                        if (rowData.applyForID == 1)
                                          return "Full Day"
                                        else if (rowData.applyForID == 2)
                                          return 'Half Day'
                                        else
                                          return '-'
                                      }
                                    },
                                    { title: 'F.Date', field: 'fromDate', render: rowData => rowData.fromDate.split('T')[0] },
                                    { title: 'F.Date', field: 'toDate', render: rowData => rowData.toDate.split('T')[0] },
                                    {
                                      title: 'Status',
                                      field: 'employeeLeaveRequestStatusID',
                                      render: rowData => {
                                        let label, color;

                                        switch (rowData.employeeLeaveRequestStatusID) {
                                          case 1:
                                            label = 'Pending';
                                            color = 'default';
                                            break;
                                          case 2:
                                            label = 'Approved';
                                            color = 'success';
                                            break;
                                          default:
                                            label = 'Rejected';
                                            color = 'error';
                                            break;
                                        }

                                        return <Chip variant="outlined" label={label} color={color} />;
                                      }
                                    },
                                    {
                                      title: 'Action',
                                      field: 'selected',
                                      render: rowData => {
                                        if (rowData.employeeLeaveRequestStatusID === 1) {
                                          return (
                                            <Checkbox
                                              checked={rowData.tableData.checked === true}
                                              onChange={() => {
                                                const updatedData = [...leaveRequestData];
                                                const index = updatedData.findIndex(item => item.tableData.id === rowData.tableData.id);
                                                updatedData[index].tableData.checked = !updatedData[index].tableData.checked;
                                                const selected = updatedData.filter(item => item.tableData.checked);
                                                setSelectedRows(selected);
                                                setIsDisable(!updatedData[index].tableData.checked);
                                                setLeaveRequestData(updatedData);
                                              }}
                                              disabled={rowData.employeeLeaveRequestStatusID === 1 ? false : true}
                                            />
                                          );
                                        } else {
                                          return (
                                            <Checkbox
                                              checked={true}
                                              disabled={rowData.employeeLeaveRequestStatusID === 1 ? false : true}
                                            />
                                          );
                                        }
                                      },
                                    },
                                    {
                                      title: 'PDF',
                                      field: 'button',
                                      render: rowData => {
                                        componentRef.current[rowData.index] = componentRef.current[rowData.index]
                                        return (
                                          rowData.employeeLeaveRequestStatusID === 2 ? (
                                            <>
                                              <ReactToPrint
                                                documentTitle={'Leave Entry Form'}
                                                trigger={() => (
                                                  <Tooltip title="PDF">
                                                    <IconButton
                                                      aria-label="delete" >
                                                      <PictureAsPdfIcon />
                                                    </IconButton>
                                                  </Tooltip>
                                                )}
                                                content={() => componentRef.current[rowData.index]}
                                              />
                                              <div hidden={true}>
                                                <CreatePdf
                                                  ref={(el) => (componentRef.current[rowData.index] = el)}
                                                  reportData={reportData}
                                                  pdfData={rowData}
                                                  leaveRequestData={leaveRequestData}
                                                />
                                              </div>
                                            </>
                                          ) : null
                                        )
                                      }
                                    },
                                  ]}
                                  data={leaveRequestData}
                                  options={{
                                    exportButton: false,
                                    showTitle: false,
                                    headerStyle: { textAlign: "left", height: '1%' },
                                    cellStyle: { textAlign: "left" },
                                    columnResizable: false,
                                    actionsColumnIndex: -1
                                  }}
                                />
                              </Box>
                              : null}
                          </>}
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          {leaveRequestData.length > 0 && !isUpdate ?
                            <Button
                              color="primary"
                              variant="contained"
                              style={{ marginLeft: 10 }}
                              onClick={() => trackPromise(SaveSendToApprove())}
                            >
                              {'Send To Approve'}
                            </Button>
                            : null}
                          {permissionList.isLeaveRequestApproveReject && isUpdate && selectedRows.length > 0 ?
                            <Button
                              color="primary"
                              variant="contained"
                              style={{ marginLeft: 10 }}
                              className={classes.colorApprove}
                            //onClick={() => trackPromise(handleApproveClick())}
                            >
                              Approve
                            </Button>
                            : null}
                          {permissionList.isLeaveRequestApproveReject && isUpdate && selectedRows.length > 0 ?
                            <Button
                              color="primary"
                              variant="contained"
                              style={{ marginRight: '1rem', marginLeft: 10 }}
                              className={classes.colorReject}
                              onClick={() => handleOpenDialog()}
                            >
                              Reject
                            </Button>
                            : null}
                        </Box>
                      </PerfectScrollbar>
                    </Card>
                    <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                      <DialogTitle>Confirm Reject</DialogTitle>
                      <DialogContent>
                        <DialogContentText style={{ fontSize: '18px' }}>
                          Are you sure you want to reject this request ?
                        </DialogContentText>
                      </DialogContent>
                      <DialogActions>
                        <Button
                          //onClick={() => trackPromise(handleReject())} 
                          color="primary" autoFocus>
                          Yes
                        </Button>
                        <Button onClick={handleCloseDialog} color="primary">
                          No
                        </Button>
                      </DialogActions>
                    </Dialog>
                    <Dialog open={openOne} maxWidth="sm" fullWidth>
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
                    <Dialog open={openTwo} onClose={handleCloseDialogTwo} maxWidth="sm" fullWidth>
                      <Card style={{ justifycontent: 'center' }} >
                        <Box p={2} >
                          <Typography variant="h3">
                            <center>
                              <b>
                                Leave Execution Status!
                              </b>
                            </center>
                          </Typography>
                          <br />
                          <br />
                          <Typography variant="h4" gutterBottom>
                            <Grid container spacing={0}>
                              <Grid item md={5} xs={12}>
                                Total No Of Employees
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
                          <Typography color='error' variant="h4" gutterBottom>
                            <Grid container spacing={0}>
                              <Grid item md={5} xs={12}>
                                Fail Count
                              </Grid>
                              <Grid item md={3} xs={12}>
                                :{'  ' + response.remainingCount}
                              </Grid>
                            </Grid>
                          </Typography>
                          <br />
                          <Typography color='secondary' variant="h4" gutterBottom>
                            <Grid container spacing={0}>
                              <Grid item md={5} xs={12}>
                                Already Applied
                              </Grid>
                              <Grid item md={3} xs={12}>
                                :{'  ' + response.alreadyLeaveCount}
                              </Grid>
                            </Grid>
                          </Typography>
                        </Box>
                      </Card>
                    </Dialog>
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