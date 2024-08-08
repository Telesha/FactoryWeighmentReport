import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  Grid,
  TextField,
  makeStyles,
  Container,
  Button,
  CardContent,
  Divider,
  InputLabel,
  Switch,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  CircularProgress
} from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import Typography from '@material-ui/core/Typography';
import { Formik, validateYupSchema } from 'formik';
import { trackPromise } from 'react-promise-tracker';
import PerfectScrollbar from 'react-perfect-scrollbar';
import * as Yup from "yup";
import Autocomplete from '@material-ui/lab/Autocomplete';
import services from '../Services';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import tokenService from '../../../utils/tokenDecoder';
import moment from 'moment';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const AddEditTable = ({ dialogbox, setDialogbox, isEdit, setIsEdit, editDataSet, closeDialogbox,
  nonPluckingAmendmentList, getNonPluckingAmendmentDetails, date }) => {
  const alert = useAlert();
  const handleClose = () => {
    setDialogbox(false);
    fieldsClear();
    setIsEdit(false)
  };
  const [task, setTask] = useState([]);
  const [taskOne, setTaskOne] = useState([]);
  const [fields, setFields] = useState([]);
  const [sirders, setSirder] = useState([]);
  const [users, setUsers] = useState([]);
  const [isCleared, setIsCleared] = useState(false);
  const [formData, setFormData] = useState({
    taskID: '0',
    taskCode: '',
    fieldID: '0',
    sirderID: '0',
    operatorID: '0',
    rate: '0',
    allowance: '0',
    gardenAllowance: '0',
    assignQuntity: '0',
    quntity: '',
    addition: '0',
    deduction: '0',
    isNightJob: false,
    uniqueID: '',
    kamjari: '',
    taskName: ''
  });

  const firstLoadRef = useRef(null);
  const fieldRef = useRef(null);
  const quntityRef = useRef(null);
  const saveButtonRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    trackPromise(
      trackPromise(GetTaskNamesByProductID()),
      trackPromise(getTaskNamesByOperationIDForEdit()),
      trackPromise(getFieldDetailsByDivisionID()),
      trackPromise(getSirdersForDropdown()),
      trackPromise(getMobileAccessibleUsersForDropDown())
    )
  }, [nonPluckingAmendmentList]);

  useEffect(() => {
    if (isEdit == true) {
      // setFormData((prevState) => ({
      //   ...prevState,
      //   taskID: editDataSet.taskID,
      //   taskCode: editDataSet.taskCode,
      //   fieldID: editDataSet.fieldID,
      //   sirderID: editDataSet.employeeID,
      //   operatorID: editDataSet.operatorID,
      //   quntity: editDataSet.quntity,
      //   addition: editDataSet.addition,
      //   deduction: editDataSet.deduction,
      //   isNightJob: editDataSet.isNightJob,
      //   uniqueID: editDataSet.uniqueID,
      //   kamjari: editDataSet.kamjari,
      //   jobTypeID: editDataSet.jobTypeID
      // }));
      setFormData({
        ...formData,
        uniqueID: editDataSet.uniqueID,
        kamjari: editDataSet.kamjari,
        isNightJob: editDataSet.isNightJob,
        quntity: editDataSet.quntity,
        addition: editDataSet.addition,
        deduction: editDataSet.deduction,
      })
    }
  }, [isEdit]);

  useEffect(() => {
    const IDdata = JSON.parse(
      sessionStorage.getItem('nonPluckingAmendment-listing-page-search-parameters-id')
    );
    const isInitialLoad = IDdata === null
    if (!isInitialLoad) {
      setFormData({
        ...formData,
        fieldID: parseInt(IDdata.fieldID)
      })
    }
  }, []);

  useEffect(() => {
    sessionStorage.removeItem(
      'nonPluckingAmendment-listing-page-search-parameters-id'
    );
  }, []);


  useEffect(() => {
    if (formData.taskID != '0') {
      trackPromise(getRatesQuntities())
    }
  }, [formData.taskID]);

  useEffect(() => {
    if (!isEdit) {
      setFormData({
        ...formData,
        taskName: ''
      })
    }
  }, [formData.taskCode]);

  async function GetTaskNamesByProductID() {
    const task = await services.GetTaskNamesByProductID(nonPluckingAmendmentList.productID);
    setTask(task);
  }

  async function GetTaskNamesByTaskCode() {
    var response = await services.GetTaskNamesByTaskCode(formData.taskCode, nonPluckingAmendmentList.workLocationID);
    if (response.statusCode == "Success") {
      let task = response.data;
      setFormData((prevState) => ({
        ...prevState,
        taskName: task.taskName,
        taskID: task.taskID
      }))
    }
  }

  async function getTaskNamesByOperationIDForEdit() {
    const task = await services.getTaskNamesByOperationIDForEdit(nonPluckingAmendmentList.gardenID);
    setTaskOne(task);
  }

  async function getFieldDetailsByDivisionID() {
    var response = await services.getFieldDetailsByDivisionIDForEdit(nonPluckingAmendmentList.costCenterID);
    setFields(response);
  };

  async function getSirdersForDropdown() {
    const sirders = await services.GetSirdersByOperationEntityID(nonPluckingAmendmentList.gardenID);
    setSirder(sirders);
  }

  async function getMobileAccessibleUsersForDropDown() {
    const mobileUsers = await services.GetMobileAccessibleUsersOperationEntityID(nonPluckingAmendmentList.gardenID)
    var generated = generateDropDownMenu(mobileUsers)
    if (generated.length > 0) {
      setFormData((newData) => ({
        ...newData,
        operatorID: generated[0].props.value,
      }));
    }
    setUsers(mobileUsers)
  }

  function handleChangeTask(e) {
    const target = e.target;
    const value = target.value;

    setFormData({
      ...formData,
      [e.target.name]: value.toUpperCase()
    });
    GetTaskNamesByTaskCode(value);
  }

  function handleChangeOne(e) {
    const target = e.target;
    const value = target.name === 'isNightJob' ? target.checked : target.value
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  }

  function handleChangeTwo(e) {
    const target = e.target;
    const value = target.value
    setFormData({
      ...formData,
      jobTypeID: parseInt(value)
    });
  }

  // function handleSearchDropdownChangeTask(data, e) {
  //   if (data === undefined || data === null) {
  //     setFormData({
  //       ...formData,
  //       taskID: '',
  //       taskCode: ''
  //     });
  //     return;
  //   } else {
  //     var nameV = "taskID";
  //     var valueV = data["taskID"];;
  //     setFormData({
  //       ...formData,
  //       taskID: valueV.toString(),
  //       taskCode: data.taskCode
  //     });
  //   }
  // }

  const handleKeyDown = (event, nextInputRef) => {
    if (nextInputRef && nextInputRef.current && typeof nextInputRef.current.focus === 'function') {
      if (event.key === 'Enter') {
        event.preventDefault();
        nextInputRef.current.focus();
      }
      if (event.key === 'Enter') {
        GetTaskNamesByTaskCode();
      }
    }
  }

  function generateDropDownMenu(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>)
      }
    }
    return items
  }

  function generateDropDownMenuWithTwoValues(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value.firstName + ' ' + value.lastName}</MenuItem>);
      }
    }
    return items
  }

  async function getRatesQuntities() {
    const response = await services.getRatesQuntitiesByTaskID(formData.taskID
      , nonPluckingAmendmentList.employeeTypeID, nonPluckingAmendmentList.genderID, nonPluckingAmendmentList.workLocationID);
    if (response.data === null) {
      setFormData((prevState) => ({
        ...prevState,
        rate: '0',
        allowance: '0',
        gardenAllowance: '0',
        assignQuntity: '0',
        quntity: '0'
      }))
    }
    else {
      let data = response.data;
      setFormData((prevState) => ({
        ...prevState,
        rate: data.rate,
        allowance: data.allowance,
        gardenAllowance: data.gardenAllowance,
        assignQuntity: data.assignQuntity,
        quntity: data.assignQuntity
      }))
    }
  }

  async function saveNonPluckingAttendance() {
    const amount = ((parseFloat(formData.rate) * parseFloat(formData.quntity)) / parseFloat(formData.assignQuntity))
    const allowance = parseFloat(formData.allowance)
    const gardenAllowance = ((parseFloat(formData.gardenAllowance) * parseFloat(formData.quntity)) / parseFloat(formData.assignQuntity))
    const totalAmount = parseFloat(amount)

    if (isEdit == false) {
    setIsLoading(true);
      let model = {
        dailyNonPluckingAttendanceID: parseInt(0),
        workerAttendanceNonPluckingID: parseInt(0),
        groupID: parseInt(nonPluckingAmendmentList.groupID),
        gardenID: parseInt(nonPluckingAmendmentList.gardenID),
        costCenterID: parseInt(nonPluckingAmendmentList.costCenterID),
        payPointID: parseInt(nonPluckingAmendmentList.payPointID),
        workLocationID: parseInt(nonPluckingAmendmentList.workLocationID),
        employeeID: parseInt(nonPluckingAmendmentList.employeeID),
        employeeName: nonPluckingAmendmentList.employeeName,
        employeeTypeID: parseInt(nonPluckingAmendmentList.employeeTypeID),
        bookNumber: nonPluckingAmendmentList.bookNumber,
        measuringUnitName: task.find(x => x.taskID == parseInt(formData.taskID)).measuringUnitName,
        measuringUnitCode: task.find(x => x.taskID == parseInt(formData.taskID)).measuringUnitCode,
        measuringunitID: task.find(x => x.taskID == parseInt(formData.taskID)).measuringunitID,
        taskSubCode: task.find(x => x.taskID == parseInt(formData.taskID)).taskSubCode,
        employeeTypeName: nonPluckingAmendmentList.employeeTypeName,
        date: moment(date).format('YYYY-MM-DD'),
        registrationNumber: nonPluckingAmendmentList.registrationNumber,
        taskID: parseInt(formData.taskID),
        taskCode: formData.taskCode,
        taskName: formData.taskName,
        sirderID: parseInt(formData.sirderID) == 0 ? 0 : parseInt(formData.sirderID),
        sirderName: parseInt(formData.sirderID) == 0 ? "" : sirders[formData.sirderID],
        fieldID: parseInt(formData.fieldID) == 0 ? 0 : parseInt(formData.fieldID),
        fieldName: parseInt(formData.fieldID) == 0 ? "" : fields[formData.fieldID],
        gangID: parseInt(nonPluckingAmendmentList.gangID) == 0 ? null : parseInt(nonPluckingAmendmentList.gangID),
        gangName: nonPluckingAmendmentList.gangName,
        rate: parseFloat(formData.rate),
        allowance: parseFloat(formData.allowance),
        gardenAllowance: parseFloat(gardenAllowance),
        assignQuntity: parseFloat(formData.assignQuntity),
        completedQuntity: parseFloat(formData.quntity),
        amount: parseFloat(totalAmount),
        addition: formData.addition == "" ? parseFloat(0) : parseFloat(formData.deduction) != 0 ? parseFloat(0) : parseFloat(formData.addition),
        deduction: formData.deduction == "" ? parseFloat(0) : parseFloat(formData.addition) != 0 ? parseFloat(0) : parseFloat(formData.deduction),
        isNightJob: formData.isNightJob,
        operatorID: parseInt(formData.operatorID) == 0 ? null : parseInt(formData.operatorID),
        operatorName: users[formData.operatorID].firstName + ' ' + users[formData.operatorID].lastName,
        //jobTypeID: parseInt(nonPluckingAmendmentList.jobTypeID),
        createdBy: tokenService.getUserIDFromToken(),
        createdDate: new Date().toISOString().split('T')[0]
      }
      let model1 = {
        fieldID: parseInt(formData.fieldID) == 0 ? 0 : parseInt(formData.fieldID),
      }
      sessionStorage.setItem(
        'nonPluckingAmendment-listing-page-search-parameters-id',
        JSON.stringify(model1)
      );
      let response = await services.NewSaveNonPluckingAttendance(model);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        getNonPluckingAmendmentDetails()
        setDialogbox(false)
        setIsEdit(false)
        fieldsClear()
      }
      else {
        alert.error(response.message);
        getNonPluckingAmendmentDetails()
        setDialogbox(false)
        setIsEdit(false)
        fieldsClear()
      }
      setTimeout(() => {
        setIsLoading(false);
      }, 3000);
    }
    else {
    setIsLoading(true);
      let model = {
        dailyNonPluckingAttendanceID: parseInt(0),
        workerAttendanceNonPluckingID: parseInt(0),
        groupID: parseInt(nonPluckingAmendmentList.groupID),
        gardenID: parseInt(nonPluckingAmendmentList.gardenID),
        costCenterID: parseInt(nonPluckingAmendmentList.costCenterID),
        payPointID: parseInt(nonPluckingAmendmentList.payPointID),
        workLocationID: parseInt(nonPluckingAmendmentList.workLocationID),
        employeeID: parseInt(nonPluckingAmendmentList.employeeID),
        employeeName: nonPluckingAmendmentList.employeeName,
        employeeTypeID: parseInt(nonPluckingAmendmentList.employeeTypeID),
        bookNumber: nonPluckingAmendmentList.bookNumber,
        measuringUnitName: task.find(x => x.taskID == parseInt(formData.taskID)).measuringUnitName,
        measuringUnitCode: task.find(x => x.taskID == parseInt(formData.taskID)).measuringUnitCode,
        measuringunitID: task.find(x => x.taskID == parseInt(formData.taskID)).measuringunitID,
        taskSubCode: task.find(x => x.taskID == parseInt(formData.taskID)).taskSubCode,
        employeeTypeName: nonPluckingAmendmentList.employeeTypeName,
        date: moment(date).format('YYYY-MM-DD'),
        registrationNumber: nonPluckingAmendmentList.registrationNumber,
        taskID: parseInt(formData.taskID),
        taskCode: formData.taskCode,
        taskName: task.find(x => x.taskID == parseInt(formData.taskID)).taskName,
        sirderID: parseInt(formData.sirderID) == 0 ? 0 : parseInt(formData.sirderID),
        sirderName: parseInt(formData.sirderID) == 0 ? "" : sirders[formData.sirderID],
        fieldID: parseInt(formData.fieldID) == 0 ? 0 : parseInt(formData.fieldID),
        fieldName: parseInt(formData.fieldID) == 0 ? "" : fields[formData.fieldID],
        gangID: parseInt(nonPluckingAmendmentList.gangID) == 0 ? null : parseInt(nonPluckingAmendmentList.gangID),
        gangName: nonPluckingAmendmentList.gangName,
        rate: parseFloat(formData.rate),
        allowance: parseFloat(formData.allowance),
        gardenAllowance: parseFloat(gardenAllowance),
        assignQuntity: parseFloat(formData.assignQuntity),
        completedQuntity: parseFloat(formData.quntity),
        amount: parseFloat(totalAmount),
        addition: formData.addition == "" ? parseFloat(0) : parseFloat(formData.deduction) != 0 ? parseFloat(0) : parseFloat(formData.addition),
        deduction: formData.deduction == "" ? parseFloat(0) : parseFloat(formData.addition) != 0 ? parseFloat(0) : parseFloat(formData.deduction),
        isNightJob: formData.isNightJob,
        operatorID: parseInt(formData.operatorID) == 0 ? null : parseInt(formData.operatorID),
        operatorName: users[formData.operatorID].firstName + ' ' + users[formData.operatorID].lastName,
        uniqueID: formData.uniqueID == "" ? null : formData.uniqueID,
        //jobTypeID: parseInt(nonPluckingAmendmentList.jobTypeID),
        modifiedBy: tokenService.getUserIDFromToken(),
        createdDate: new Date().toISOString().split('T')[0]
      }
      let response = await services.NewUpdateNonPluckingAttendance(model);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        getNonPluckingAmendmentDetails()
        setDialogbox(false)
        setIsEdit(false)
        fieldsClear()
      }
      else {
        alert.error(response.message);
        getNonPluckingAmendmentDetails()
        setDialogbox(false)
        setIsEdit(false)
        fieldsClear()
      }
    }
  }

  function fieldsClear() {
    setFormData((prevState) => ({
      ...prevState,
      taskID: '0',
      taskCode: '',
      fieldID: '0',
      sirderID: '0',
      operatorID: '0',
      rate: '0',
      allowance: '0',
      gardenAllowance: '0',
      assignQuntity: '0',
      quntity: '',
      addition: '0',
      deduction: '0',
      kamjari: '',
      isNightJob: false,
      jobTypeID: '1'
    }));
    setIsCleared(!isCleared)
  }

  return (
    <div>
      <Dialog
        fullWidth={true}
        maxWidth="lg"
        open={dialogbox}
        onBackdropClick="false"
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">
          <Typography
            color="textSecondary"
            gutterBottom
            variant="h3"
          >
            <Box textAlign="left" >
              {isEdit == true ? "Edit " : "Add "} Non Plucking Attendance
            </Box>
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            {/* <LoadingComponent /> */}
            <Container>
              <Formik
                initialValues={{
                  taskCode: formData.taskCode,
                  taskName: formData.taskName,
                  fieldID: formData.fieldID,
                  sirderID: formData.sirderID,
                  operatorID: formData.operatorID,
                  assignQuntity: formData.assignQuntity,
                  quntity: formData.quntity,
                  addition: formData.addition,
                  deduction: formData.deduction,
                  isActive: formData.isActive,
                }}
                validationSchema={
                  Yup.object().shape({
                    taskID: Yup.number(),
                    taskCode: Yup.string().required('Task is required'),
                    taskName: Yup.string().required('Task Code is Invalid'),
                    fieldID: Yup.number(),
                    sirderID: Yup.number(),
                    operatorID: Yup.number().required('Operator is required').min("1", 'Operator is required'),
                    assignQuntity: Yup.number().required('Assign Quntity is required'),
                    quntity: Yup.number().required('Completed Qty is required').min("0", 'Completed Qty can not be Less than 0')
                      .max(formData.assignQuntity, 'Completed Qty can not be more than Assign Quntity'),
                    addition: Yup.string().matches(/^\s*(?=.*[0-9])\d*(?:\.\d{1,2})?\s*$/, 'Invalid Amount (Allow only positive amount with 2 decimal)'),
                    deduction: Yup.string().matches(/^\s*(?=.*[0-9])\d*(?:\.\d{1,2})?\s*$/, 'Invalid Amount (Allow only positive amount with 2 decimal)')
                  })
                }
                onSubmit={() => saveNonPluckingAttendance()}
                enableReinitialize
              >
                {({
                  errors,
                  handleBlur,
                  handleChange,
                  handleSubmit,
                  isSubmitting,
                  touched,
                  values,
                  props
                }) => (
                  <form onSubmit={handleSubmit}>
                    <Box mt={0}>
                      <PerfectScrollbar>
                        <Divider />
                        <CardContent>
                          {isEdit == true ?
                            <Grid container spacing={3}>
                              <Grid item md={3} xs={12}>
                                <InputLabel shrink id="kamjari">
                                  Current Task
                                </InputLabel>
                                <TextField
                                  fullWidth
                                  name="kamjari"
                                  onBlur={handleBlur}
                                  onChange={(e) => handleChangeOne(e)}
                                  value={formData.kamjari}
                                  variant="outlined"
                                  id="kamjari"
                                  size='small'
                                  InputProps={{ readOnly: true }}
                                />
                              </Grid>
                            </Grid> : null}
                          <Grid container spacing={3}>
                            {/* <Grid item md={3} xs={12}>
                              <InputLabel shrink id="taskID">
                                New Task *
                              </InputLabel>
                              <Autocomplete
                                key={isCleared}
                                id="taskID"
                                options={task}
                                getOptionLabel={option => option.taskName ?? option.taskName}
                                onChange={(e, value) =>
                                  handleSearchDropdownChangeTask(value, e)
                                }
                                renderInput={params => (
                                  <TextField
                                    {...params}
                                    variant="outlined"
                                    name="taskID"
                                    size="small"
                                    fullWidth
                                    error={Boolean(
                                      touched.taskID && errors.taskID
                                    )}
                                    helperText={touched.taskID && errors.taskID}
                                    value={formData.taskID}
                                    inputRef={firstLoadRef}
                                    onKeyDown={(e) => handleKeyDown(e, quntityRef)}
                                    getOptionDisabled={true}
                                    onBlur={handleBlur}
                                  />
                                )}
                              />
                            </Grid> */}
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="taskCode">
                                Task Code
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.taskCode && errors.taskCode)}
                                fullWidth
                                helperText={touched.taskCode && errors.taskCode}
                                size='small'
                                name="taskCode"
                                onChange={(e) => handleChangeTask(e)}
                                value={formData.taskCode}
                                variant="outlined"
                                id="taskCode"
                                inputRef={firstLoadRef}
                                autoFocus
                                onKeyDown={(e) => handleKeyDown(e, fieldRef)}
                              >
                              </TextField>
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="taskName">
                                Task Name
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.taskName && errors.taskName)}
                                fullWidth
                                helperText={touched.taskName && errors.taskName}
                                name="taskName"
                                size='small'
                                value={formData.taskName}
                                onChange={(e) => handleChangeTask(e)}
                                variant="outlined"
                                id="taskName"
                                InputProps={{ readOnly: true }}
                              >
                              </TextField>
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="fieldID">
                                Field
                              </InputLabel>
                              <TextField select
                                error={Boolean(touched.fieldID && errors.fieldID)}
                                fullWidth
                                helperText={touched.fieldID && errors.fieldID}
                                name="fieldID"
                                size='small'
                                onBlur={handleBlur}
                                onChange={(e) => handleChangeOne(e)}
                                value={formData.fieldID}
                                variant="outlined"
                                id="fieldID"
                                inputRef={fieldRef}
                                onKeyDown={(e) => handleKeyDown(e, quntityRef)}
                              >
                                <MenuItem value={'0'} >--Select Section--</MenuItem>
                                {generateDropDownMenu(fields)}
                              </TextField>
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="sirderID">
                                Sirder
                              </InputLabel>
                              <TextField select
                                error={Boolean(touched.sirderID && errors.sirderID)}
                                fullWidth
                                helperText={touched.sirderID && errors.sirderID}
                                name="sirderID"
                                onBlur={handleBlur}
                                onChange={(e) => handleChangeOne(e)}
                                value={formData.sirderID}
                                variant="outlined"
                                id="sirderID"
                                size='small'
                              >
                                <MenuItem value="0">--Select Sirder--</MenuItem>
                                {generateDropDownMenu(sirders)}
                              </TextField>
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="operatorID">
                                Operator *
                              </InputLabel>
                              <TextField select
                                error={Boolean(touched.operatorID && errors.operatorID)}
                                fullWidth
                                helperText={touched.operatorID && errors.operatorID}
                                name="operatorID"
                                onBlur={handleBlur}
                                onChange={(e) => handleChangeOne(e)}
                                value={formData.operatorID}
                                variant="outlined"
                                id="operatorID"
                                size='small'
                              >
                                <MenuItem value="0">--Select Operator--</MenuItem>
                                {generateDropDownMenuWithTwoValues(users)}
                              </TextField>
                            </Grid>
                          </Grid>
                          <Grid container spacing={3}>
                            <Grid item md={3} xs={12} >
                              <InputLabel shrink id="assignQuntity">
                                Assigned Qty *
                              </InputLabel>
                              <TextField
                                fullWidth
                                size='small'
                                disabled={true}
                                name="assignQuntity"
                                onChange={(e) => handleChangeOne(e)}
                                value={formData.assignQuntity}
                                variant="outlined"
                                id="assignQuntity"
                              >
                              </TextField>
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="quntity">
                                Completed Qty *
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.quntity && errors.quntity)}
                                fullWidth
                                helperText={touched.quntity && errors.quntity}
                                size='small'
                                name="quntity"
                                onChange={(e) => handleChangeOne(e)}
                                value={formData.quntity}
                                inputRef={quntityRef}
                                onKeyDown={(e) => handleKeyDown(e, saveButtonRef)}
                                variant="outlined"
                                id="quntity"
                              >
                              </TextField>
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="addition">
                                Addition Amount
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.addition && errors.addition)}
                                fullWidth
                                helperText={touched.addition && errors.addition}
                                size='small'
                                name="addition"
                                type='number'
                                onChange={(e) => handleChangeOne(e)}
                                value={formData.addition}
                                variant="outlined"
                                id="addition"
                                disabled={formData.deduction > 0 ? true : false}
                              >
                              </TextField>
                            </Grid>

                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="deduction">
                                Deduction Amount
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.deduction && errors.deduction)}
                                fullWidth
                                helperText={touched.deduction && errors.deduction}
                                size='small'
                                type='number'
                                name="deduction"
                                onChange={(e) => handleChangeOne(e)}
                                value={formData.deduction}
                                variant="outlined"
                                id="deduction"
                                disabled={formData.addition > 0 ? true : false}
                              >
                              </TextField>
                            </Grid>
                          </Grid>
                          {/* <Grid container spacing={3}>
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="isNightJob">
                                Is Night Job
                              </InputLabel>
                              <Switch
                                checked={formData.isNightJob}
                                onChange={(e) => handleChangeOne(e)}
                                name="isNightJob"
                                id="isNightJob"
                              />
                            </Grid>
                          </Grid>
                          <Grid container spacing={3}>
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="jobType">
                                Job Type
                              </InputLabel>
                              <RadioGroup row aria-label="entryType" name="entryType" value={nonPluckingAmendmentList.jobTypeID} onChange={handleChangeTwo}>
                                <FormControlLabel disabled={true} value={1} control={<Radio />} label="General" />
                                <FormControlLabel disabled={true} value={2} control={<Radio />} label="Cash" />
                              </RadioGroup>
                            </Grid>
                          </Grid> */}
                        </CardContent>
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          {!isLoading ?
                          <Button
                            color="primary"
                            type="button"
                            variant="outlined"
                            onClick={() => { closeDialogbox(); handleClose(); }}
                          >
                            Close
                          </Button>
                          :null}
                          &nbsp;
                          &nbsp;
                          {isEdit == false ?
                          <Button
                            color= "primary"
                            type="submit"
                            variant={isLoading ? "outlined" : "contained"}
                            ref={saveButtonRef}
                            disabled={isLoading}
                          >
                            {isLoading ? <CircularProgress size="1.3rem" color="inherit"/> : "Save" }
                            </Button>
                            : null}
                          {isEdit == true ?
                            <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                            ref={saveButtonRef}
                            disabled={isLoading}
                          >
                            {"Update"}
                          </Button> : null }
                        </Box>
                      </PerfectScrollbar>
                    </Box>
                  </form>
                )}
              </Formik>
            </Container>
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </div>
  );
}
