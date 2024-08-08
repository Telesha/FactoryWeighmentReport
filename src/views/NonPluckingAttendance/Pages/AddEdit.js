import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader, MenuItem, Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from '@material-ui/pickers';
import tokenService from '../../../utils/tokenDecoder';
import Autocomplete from '@material-ui/lab/Autocomplete';
import DeleteIcon from '@material-ui/icons/Delete';
import moment from 'moment';
import { AlertDialogWithoutButton } from 'src/views/Common/AlertDialogWithoutButton';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  avatar: {
    marginRight: theme.spacing(2)
  }
}));

const screenCode = 'NONPLUCKINGATTENDANCE';

export default function NonPluckingAttendanceAddEdit(props) {
  const [title, setTitle] = useState("Add Non Plucking Attendance Details")
  const [isUpdate, setIsUpdate] = useState(false);
  const [isHideField, setIsHideField] = useState(true);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const [employeeType, setEmployeeType] = useState([])
  const classes = useStyles();
  const [groups, setGroups] = useState()
  const [factories, setFactories] = useState()
  const [costCenters, setCostCenters] = useState();
  const [task, setTask] = useState([]);
  const [sirders, setSirder] = useState([]);
  const [operator, setOperator] = useState([]);
  const [fields, setFields] = useState([]);
  const [otherDeductionDetails, setotherDeductionDetails] = useState({
    dailyNonPluckingAttendanceID: '0',
    workerAttendanceNonPluckingID: '0',
    groupID: '0',
    gardenID: '0',
    costCenterID: '0',
    costCenterName: '',
    employeeID: '0',
    employeeName: '',
    employeeTypeID: '0',
    employeeTypeName: '',
    date: new Date(),
    registrationNumber: '',
    taskID: '0',
    taskCode: '',
    taskName: '',
    sirderID: '0',
    sirderName: '',
    fieldID: '0',
    fieldName: '',
    rate: '0',
    allowance: '0',
    gardenAllowance: '0',
    assignQuntity: '0',
    completedQuntity: '',
    operatorID: '0',
    operatorName: '',
    createdBy: '0',
    createdDate: ''
  });
  const [ArrayField, setArrayField] = useState([]);
  const [arrayNewWareField, setArrayNewWareField] = useState([]);
  const [dialogbox, setDialogbox] = useState(false);
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();
  const [totalValues, setTotalValues] = useState({
    amount: '0'
  });

  const alert = useAlert();

  let decrypted = 0;
  const [fieldDataList, setFieldDataList] = useState([])
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const [isCleared, setIsCleared] = useState(false);
  const [productOrderStatusList, setProductOrderStatusList] = useState([]);

  useEffect(() => {
    trackPromise(getPermissions(), getGroupsForDropdown(), getEmployeeTypesForDropdown(),getOperatorsForDropdown());
  }, []);

  useEffect(() => {
    if (otherDeductionDetails.groupID != '0') {
      trackPromise(getFactoriesForDropdown());
    }
  }, [otherDeductionDetails.groupID]);

  useEffect(() => {
    if (otherDeductionDetails.gardenID != '0') {
      trackPromise(getStatus());
    }
  }, [otherDeductionDetails.gardenID]);

  useEffect(() => {
    setotherDeductionDetails({
      ...otherDeductionDetails,
      employeeID: '0',
    })
    if (otherDeductionDetails.registrationNumber !== '' && isUpdate == false) {
      trackPromise(getEmployeDetails())
    }
  }, [otherDeductionDetails.registrationNumber]);

  useEffect(() => {
    trackPromise(
      getCostCenterDetailsByGardenID()
    )
  }, [otherDeductionDetails.gardenID]);

  useEffect(() => {
    trackPromise(
      GetTaskNamesByOperationID()
    )
  }, [otherDeductionDetails.gardenID]);
  
  useEffect(() => {
    trackPromise(getFieldDetailsByDivisionID());
  }, [otherDeductionDetails.costCenterID]);

  useEffect(() => {
    setotherDeductionDetails({
      ...otherDeductionDetails,
      rate: '0',
    })
    if (otherDeductionDetails.taskID !== '0' && isUpdate == false) {
      trackPromise(getRatesQuntities())
    }
  }, [otherDeductionDetails.taskID]);

  useEffect(() => {
    if (ArrayField.length != 0) {
      calculateTotalQty()
    }
  }, [ArrayField]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITNONPLUCKINGATTENDANCE');

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

    if (decrypted == 0) {
      setotherDeductionDetails({
        ...otherDeductionDetails,
        groupID: parseInt(tokenService.getGroupIDFromToken()),
        gardenID: parseInt(tokenService.getFactoryIDFromToken())
      })
    }
    getSirdersForDropdown();
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getAllFactoriesByGroupID(otherDeductionDetails.groupID);
    setFactories(factories);
  }

  async function getCostCenterDetailsByGardenID() {
    var response = await services.getDivisionDetailsByEstateID(otherDeductionDetails.gardenID);
    const elementCount = response.reduce((count) => count + 1, 0);
    var generated = generateDropDownMenu(response)
    if (elementCount === 1) {
      setotherDeductionDetails((prevState) => ({
        ...prevState,
        costCenterID: generated[0].props.value,
      }));
    }
    setCostCenters(response);
  };

  async function getSirdersForDropdown() {
    const sirders = await services.getSirdersForDropdown();
    setSirder(sirders);
  }

  async function getOperatorsForDropdown() {
    const operator = await services.getOperatorsForDropdown();
    setOperator(operator);
  }

  async function GetTaskNamesByOperationID() {
    const task = await services.getTaskNamesByOperationID(otherDeductionDetails.gardenID);
    setTask(task);
  }

  async function getFieldDetailsByDivisionID() {
    var response = await services.getFieldDetailsByDivisionID(otherDeductionDetails.costCenterID);
    setFields(response);
  };

  async function getEmployeeTypesForDropdown() {
    const types = await services.getEmployeeTypesForDropdown();
    setEmployeeType(types);
  }

  async function getEmployeDetails() {
    const response = await services.getEmployeeDetailsByFactoryIDRegistrationNumber(otherDeductionDetails.gardenID, otherDeductionDetails.registrationNumber);
    if (response.data === null) {
      setIsHideField(true);
      setotherDeductionDetails({
        ...otherDeductionDetails,
        employeeName: '',
        employeeID: '0',
        employeeTypeID: '0'
      })
    }
    else {
      setIsHideField(false);
      let data = response.data;
      setotherDeductionDetails({
        ...otherDeductionDetails,
        employeeName: data.employeeName,
        employeeID: data.employeeID,
        employeeTypeID: data.employeeTypeID
      })
    }
  }

  async function getRatesQuntities() {
    const response = await services.getRatesQuntitiesByTaskID(otherDeductionDetails.taskID);
    if (response.data === null) {
      setotherDeductionDetails({
        ...otherDeductionDetails,
        rate: '0',
        allowance: '0',
        gardenAllowance: '0',
        assignQuntity: '0'
      })
    }
    else {
      let data = response.data;
      setotherDeductionDetails({
        ...otherDeductionDetails,
        rate: data.rate,
        allowance: data.allowance,
        gardenAllowance: data.gardenAllowance,
        assignQuntity: data.assignQuntity
      })
    }
  }

  async function SaveOtherDeductionDetails() {
    if (isUpdate != true) {
      const response = await services.SaveNonPluckingAttendance(ArrayField);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        clearFields();
        setIsCleared(!isCleared)
        navigate('/app/NonPluckingAttendance');
      }
      else {
        alert.error(response.message);
      }
    }
  }

  function calculateTotalQty() {
    const isMatch1 = arrayNewWareField.some(x =>
      x.groupID === parseInt(otherDeductionDetails.groupID) &&
      x.gardenID === parseInt(otherDeductionDetails.gardenID) &&
      x.registrationNumber === otherDeductionDetails.registrationNumber &&
      x.employeeID === parseInt(otherDeductionDetails.employeeID) &&
      x.taskID === parseInt(otherDeductionDetails.taskID) &&
      x.taskCode === otherDeductionDetails.taskCode
    );

    if (!isMatch1) {
      const isMatch = ArrayField.some(x =>
        x.groupID === parseInt(otherDeductionDetails.groupID) &&
        x.gardenID === parseInt(otherDeductionDetails.gardenID) &&
        x.registrationNumber === otherDeductionDetails.registrationNumber &&
        x.employeeID === parseInt(otherDeductionDetails.employeeID) &&
        x.assignQuntity === otherDeductionDetails.completedQuntity
      );
      if (isMatch) {
        const amount = ArrayField.reduce((accumulator, current) => accumulator + current.rate + current.allowance + current.gardenAllowance, 0);
        setTotalValues({
          ...totalValues,
          amount: amount,
        })
      }
      else {
        const amount = ArrayField.reduce((accumulator, current) => accumulator + (current.rate * current.completedQuntity) / current.assignQuntity + current.allowance + (current.gardenAllowance * current.completedQuntity) / current.assignQuntity, 0);
        setTotalValues({
          ...totalValues,
          amount: amount,
        })
      }
    }

    else {
      const isMatch = ArrayField.some(x =>
        x.groupID === parseInt(otherDeductionDetails.groupID) &&
        x.gardenID === parseInt(otherDeductionDetails.gardenID) &&
        x.registrationNumber === otherDeductionDetails.registrationNumber &&
        x.employeeID === parseInt(otherDeductionDetails.employeeID) &&
        x.assignQuntity === otherDeductionDetails.completedQuntity
      );
      if (isMatch) {
        const amount = ArrayField.reduce((accumulator, current) => accumulator + current.rate, 0);
        setTotalValues({
          ...totalValues,
          amount: amount,
        })
      }
      else {
        const amount = ArrayField.reduce((accumulator, current) => accumulator + (current.rate * current.completedQuntity) / current.assignQuntity, 0);
        setTotalValues({
          ...totalValues,
          amount: amount,
        })
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
        items.push(<MenuItem key={key} value={key}>{value.name}</MenuItem>);
      }
    }
    return items
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setotherDeductionDetails({
      ...otherDeductionDetails,
      [e.target.name]: value
    });
  }

  function handleDateChange(date) {
    setotherDeductionDetails({
      ...otherDeductionDetails,
      date: moment(date).format('YYYY-MM-DD')
    });
  }

  function handleSearchDropdownChangeStatus(data, e) {
    if (data === undefined || data === null) {
      setotherDeductionDetails({
        ...otherDeductionDetails,
        registrationNumber: '0'
      });
      return;
    } else {
      var nameV = "RegistrationNumber";
      var valueV = data.registrationNumber;
      setotherDeductionDetails({
        ...otherDeductionDetails,
        registrationNumber: valueV.toString()
      });
    }
  }

  function handleSearchDropdownChangeTask(data, e) {
    if (data === undefined || data === null) {
      setotherDeductionDetails({
        ...otherDeductionDetails,
        taskID: ''
      });
      return;
    } else {
      var nameV = "taskID";
      var valueV = data["taskID"];;
      setotherDeductionDetails({
        ...otherDeductionDetails,
        taskID: valueV.toString(),
        taskCode: data.taskCode,
      });
    }
  }

  function clearFields() {
    setotherDeductionDetails({
      ...otherDeductionDetails,
      registrationNumber: '',
      taskID: '0',
      fieldID: '0',
      sirderID: '0',
      operatorID: '0',
      completedQuntity: '',
      date: new Date()
    });
    setArrayField([]);
    setIsHideField(true)
  }

  async function getStatus() {
    let response = await services.getStatus(otherDeductionDetails.gardenID);
    setProductOrderStatusList(response);
  }

  async function handleClickAdd() {
    {
      var array1 = [...ArrayField];
      var array2 = [...arrayNewWareField];

      array1.push({
        dailyNonPluckingAttendanceID: parseInt(otherDeductionDetails.dailyNonPluckingAttendanceID),
        workerAttendanceNonPluckingID: parseInt(otherDeductionDetails.workerAttendanceNonPluckingID),
        groupID: parseInt(otherDeductionDetails.groupID),
        gardenID: parseInt(otherDeductionDetails.gardenID),
        costCenterID: parseInt(otherDeductionDetails.costCenterID),
        costCenterName: costCenters[otherDeductionDetails.costCenterID],
        employeeID: parseInt(otherDeductionDetails.employeeID),
        employeeName: otherDeductionDetails.employeeName,
        employeeTypeID: parseInt(otherDeductionDetails.employeeTypeID),
        employeeTypeName: employeeType[otherDeductionDetails.employeeTypeID].name,
        date: moment(otherDeductionDetails.date).format('YYYY-MM-DD'),
        registrationNumber: otherDeductionDetails.registrationNumber,
        taskID: parseInt(otherDeductionDetails.taskID),
        taskCode: otherDeductionDetails.taskCode,
        taskName: task[otherDeductionDetails.taskID].taskName,
        sirderID: parseInt(otherDeductionDetails.sirderID) == 0 ? null : parseInt(otherDeductionDetails.sirderID),
        sirderName: sirders[otherDeductionDetails.sirderID].name,
        fieldID: parseInt(otherDeductionDetails.fieldID) == 0 ? null : parseInt(otherDeductionDetails.fieldID),
        fieldName: fields[otherDeductionDetails.fieldID],
        rate: parseFloat(otherDeductionDetails.rate),
        allowance: parseFloat(otherDeductionDetails.allowance),
        gardenAllowance: parseFloat(otherDeductionDetails.gardenAllowance),
        assignQuntity: parseFloat(otherDeductionDetails.assignQuntity),
        completedQuntity: otherDeductionDetails.completedQuntity,
        amount: parseFloat(totalValues.amount),
        operatorID: parseInt(otherDeductionDetails.operatorID) == 0 ? null : parseInt(otherDeductionDetails.operatorID),
        operatorName: operator[otherDeductionDetails.operatorID].name,
        createdBy: tokenService.getUserIDFromToken(),
        createdDate: new Date().toISOString().split('T')[0],

      });
      setArrayField(array1);

      array2.push({
        dailyNonPluckingAttendanceID: parseInt(otherDeductionDetails.dailyNonPluckingAttendanceID),
        workerAttendanceNonPluckingID: parseInt(otherDeductionDetails.workerAttendanceNonPluckingID),
        groupID: parseInt(otherDeductionDetails.groupID),
        gardenID: parseInt(otherDeductionDetails.gardenID),
        costCenterID: parseInt(otherDeductionDetails.costCenterID),
        costCenterName: costCenters[otherDeductionDetails.costCenterID],
        employeeID: parseInt(otherDeductionDetails.employeeID),
        employeeName: otherDeductionDetails.employeeName,
        employeeTypeID: parseInt(otherDeductionDetails.employeeTypeID),
        employeeTypeName: employeeType[otherDeductionDetails.employeeTypeID].name,
        date: moment(otherDeductionDetails.date).format('YYYY-MM-DD'),
        registrationNumber: otherDeductionDetails.registrationNumber,
        taskID: parseInt(otherDeductionDetails.taskID),
        taskCode: otherDeductionDetails.taskCode,
        taskName: task[otherDeductionDetails.taskID].taskName,
        sirderID: parseInt(otherDeductionDetails.sirderID),
        sirderName: sirders[otherDeductionDetails.sirderID].name,
        fieldID: parseInt(otherDeductionDetails.fieldID),
        fieldName: fields[otherDeductionDetails.fieldID],
        rate: parseFloat(otherDeductionDetails.rate),
        allowance: parseFloat(otherDeductionDetails.allowance),
        gardenAllowance: parseFloat(otherDeductionDetails.gardenAllowance),
        assignQuntity: parseFloat(otherDeductionDetails.assignQuntity),
        completedQuntity: otherDeductionDetails.completedQuntity,
        amount: parseFloat(totalValues.amount),
        operatorID: parseInt(otherDeductionDetails.operatorID),
        operatorName: operator[otherDeductionDetails.operatorID].name,
        createdBy: tokenService.getUserIDFromToken(),
        createdDate: new Date().toISOString().split('T')[0],
      });

      setArrayNewWareField(array2);

      let dataModel = {
        dailyNonPluckingAttendanceID: parseInt(otherDeductionDetails.dailyNonPluckingAttendanceID),
        workerAttendanceNonPluckingID: parseInt(otherDeductionDetails.workerAttendanceNonPluckingID),
        groupID: parseInt(otherDeductionDetails.groupID),
        gardenID: parseInt(otherDeductionDetails.gardenID),
        costCenterID: parseInt(otherDeductionDetails.costCenterID),
        costCenterName: costCenters[otherDeductionDetails.costCenterID],
        employeeID: parseInt(otherDeductionDetails.employeeID),
        employeeName: otherDeductionDetails.employeeName,
        employeeTypeID: parseInt(otherDeductionDetails.employeeTypeID),
        employeeTypeName: employeeType[otherDeductionDetails.employeeTypeID].name,
        date: moment(otherDeductionDetails.date).format('YYYY-MM-DD'),
        registrationNumber: otherDeductionDetails.registrationNumber,
        taskID: parseInt(otherDeductionDetails.taskID),
        taskCode: otherDeductionDetails.taskCode,
        taskName: task[otherDeductionDetails.taskID].taskName,
        sirderID: parseInt(otherDeductionDetails.sirderID),
        sirderName: sirders[otherDeductionDetails.sirderID].name,
        fieldID: parseInt(otherDeductionDetails.fieldID),
        fieldName: fields[otherDeductionDetails.fieldID],
        rate: parseFloat(otherDeductionDetails.rate),
        allowance: parseFloat(otherDeductionDetails.allowance),
        gardenAllowance: parseFloat(otherDeductionDetails.gardenAllowance),
        assignQuntity: parseFloat(otherDeductionDetails.assignQuntity),
        completedQuntity: otherDeductionDetails.completedQuntity,
        amount: parseFloat(totalValues.amount),
        operatorID: parseInt(otherDeductionDetails.operatorID),
        operatorName: operator[otherDeductionDetails.operatorID].name,
        createdBy: tokenService.getUserIDFromToken(),
        createdDate: new Date().toISOString().split('T')[0],
      }

      setFieldDataList(fieldDataList => [...fieldDataList, dataModel]);
      setotherDeductionDetails({
        ...otherDeductionDetails,
        registrationNumber: '',
        employeeID: '0',
      })
    }
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

  function DeleteItem(index) {
    setDialogbox(true);
    setIndex(index)
  }

  function cancelData() {
    setDialogbox(false);
  }

  function confirmData() {
    setDialogbox(false);
    if (isUpdate != true) {
      const dataDelete = [...ArrayField];
      const remove = index;
      dataDelete.splice(remove, 1);
      setArrayField([...dataDelete]);
      alert.success('Item deleted successfully');
    }
  }

  return (
    <Page
      className={classes.root}
      title="Add Non Plucking Attendance"
    >
      <LoadingComponent />
      <Container maxWidth={false}>
        <Formik
          initialValues={{
            groupID: otherDeductionDetails.groupID,
            gardenID: otherDeductionDetails.gardenID,
            costCenterID: otherDeductionDetails.costCenterID,
            date: otherDeductionDetails.date,
            registrationNumber: otherDeductionDetails.registrationNumber,
            taskID: otherDeductionDetails.taskID,
            fieldID: otherDeductionDetails.fieldID,
            sirderID: otherDeductionDetails.sirderID,
            operatorID: otherDeductionDetails.operatorID,
            completedQuntity: otherDeductionDetails.completedQuntity
          }}
          validationSchema={
            Yup.object().shape({
              groupID: Yup.number().required('Legal Entity required').min("1", 'Legal Entity is required'),
              gardenID: Yup.number().required('Garden is required').min("1", 'Garden is required'),
              costCenterID: Yup.number().required('Cost Center is required').min("1", 'Cost Center is required'),
              date: Yup.string().required('Date is required'),
              registrationNumber: Yup.string().required('Registration Number is required'),
              taskID: Yup.number().required('Task is required').min("1", 'Task is required'),
              fieldID: Yup.number().required('Section is required').min("1", 'Section is required'),
              sirderID: Yup.number().required('Sirder is required').min("1", 'Sirder is required'),
              operatorID: Yup.number().required('Operator is required').min("1", 'Operator is required'),
              completedQuntity: Yup.string().required('Completed Quantity is required'),
            })
          }
          onSubmit={() => handleClickAdd()}
          enableReinitialize
        >
          {({
            errors,
            handleBlur,
            handleSubmit,
            isSubmitting,
            touched,
            values,
            props
          }) => (
            <form onSubmit={handleSubmit}>
              <Box mt={0}>
                <Card>
                  <CardHeader
                    title={cardTitle(title)}
                  />
                  <PerfectScrollbar>
                    <Divider />
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="groupID">
                            Legal Entity *
                          </InputLabel>
                          <TextField select
                            error={Boolean(touched.groupID && errors.groupID)}
                            fullWidth
                            helperText={touched.groupID && errors.groupID}
                            name="groupID"
                            onBlur={handleBlur}
                            onChange={(e) => handleChange(e)}
                            value={otherDeductionDetails.groupID}
                            variant="outlined"
                            id="groupID"
                            InputProps={{
                              readOnly: isUpdate || !permissionList.isGroupFilterEnabled ? true : false
                            }}
                            size="small"
                          >
                            <MenuItem value="0">--Select Legal Entity--</MenuItem>
                            {generateDropDownMenu(groups)}
                          </TextField>
                        </Grid>
                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="gardenID">
                            Garden *
                          </InputLabel>
                          <TextField select
                            error={Boolean(touched.gardenID && errors.gardenID)}
                            fullWidth
                            helperText={touched.gardenID && errors.gardenID}
                            name="gardenID"
                            onBlur={handleBlur}
                            onChange={(e) => handleChange(e)}
                            value={otherDeductionDetails.gardenID}
                            variant="outlined"
                            id="gardenID"
                            InputProps={{
                              readOnly: isUpdate || !permissionList.isFactoryFilterEnabled ? true : false
                            }}
                            size="small"
                          >
                            <MenuItem value="0">--Select Garden--</MenuItem>
                            {generateDropDownMenu(factories)}
                          </TextField>
                        </Grid>
                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="costCenterID">
                            Cost Center *
                          </InputLabel>
                          <TextField select
                            fullWidth
                            name="costCenterID"
                            onBlur={handleBlur}
                            onChange={(e) => handleChange(e)}
                            value={otherDeductionDetails.costCenterID}
                            variant="outlined"
                            id="costCenterID"
                            size='small'
                          >
                            <MenuItem value="0">--Select Cost Center--</MenuItem>
                            {generateDropDownMenu(costCenters)}
                          </TextField>
                        </Grid>
                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="date">Date *</InputLabel>
                          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                              error={Boolean(touched.date && errors.date)}
                              fullWidth
                              helperText={touched.date && errors.date}
                              variant="inline"
                              format="dd/MM/yyyy"
                              margin="dense"
                              name='date'
                              id='date'
                              size='small'
                              value={otherDeductionDetails.date}
                              onChange={(e) => {
                                handleDateChange(e)
                              }}
                              KeyboardButtonProps={{
                                'aria-label': 'change date',
                              }}
                              autoOk
                            />
                          </MuiPickersUtilsProvider>
                        </Grid>
                      </Grid>

                      <Grid container spacing={3}>

                        <Grid item md={3} xs={12}>

                          <InputLabel shrink id="registrationNumber">
                            Emp.ID *
                          </InputLabel>
                          <Autocomplete
                            key={isCleared}
                            id="registrationNumber"
                            options={productOrderStatusList}
                            getOptionLabel={option => option.registrationNumber ?? option.registrationNumber}
                            onChange={(e, value) =>
                              handleSearchDropdownChangeStatus(value, e)
                            }
                            renderInput={params => (
                              <TextField
                                {...params}
                                variant="outlined"
                                name="registrationNumber"
                                size="small"
                                fullWidth
                                error={Boolean(
                                  touched.registrationNumber && errors.registrationNumber
                                )}
                                helperText={touched.registrationNumber && errors.registrationNumber}
                                value={otherDeductionDetails.registrationNumber}
                                getOptionDisabled={true}
                                onBlur={handleBlur}
                              />
                            )}
                          />
                        </Grid>
                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="taskID">
                            Task *
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
                                value={otherDeductionDetails.taskID}
                                getOptionDisabled={true}
                                onBlur={handleBlur}
                              />
                            )}
                          />
                        </Grid>
                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="fieldID">
                            Section
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
                            value={otherDeductionDetails.fieldID}
                            variant="outlined"
                            id="fieldID"
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
                            onChange={(e) => handleChange(e)}
                            value={otherDeductionDetails.sirderID}
                            variant="outlined"
                            id="sirderID"
                            size='small'
                          >
                            <MenuItem value="0">--Select Sirder--</MenuItem>
                            {generateDropDownMenuWithTwoValues(sirders)}
                          </TextField>
                        </Grid>
                      </Grid>

                      <Grid container spacing={3}>
                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="operatorID">
                            Operator
                          </InputLabel>
                          <TextField select
                            error={Boolean(touched.operatorID && errors.operatorID)}
                            fullWidth
                            helperText={touched.operatorID && errors.operatorID}
                            name="operatorID"
                            onBlur={handleBlur}
                            onChange={(e) => handleChange(e)}
                            value={otherDeductionDetails.operatorID}
                            variant="outlined"
                            id="operatorID"
                            size='small'
                          >
                            <MenuItem value="0">--Select Operator--</MenuItem>
                            {generateDropDownMenuWithTwoValues(operator)}
                          </TextField>
                        </Grid>
                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="completedQuntity">
                            Completed Quantity *
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.completedQuntity && errors.completedQuntity)}
                            fullWidth
                            helperText={touched.completedQuntity && errors.completedQuntity}
                            name="completedQuntity"
                            type="text"
                            onBlur={handleBlur}
                            onChange={(e) => handleChange(e)}
                            value={otherDeductionDetails.completedQuntity}
                            variant="outlined"
                            size="small"
                          />
                        </Grid>
                      </Grid>
                      {ArrayField.length <= 0 ?
                        <Box display="flex" justifyContent="flex-end" p={2}>

                          <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                          >
                            {isUpdate == true ? "Update" : "Add"}
                          </Button>
                        </Box>
                        : null}
                      <br></br>
                      <br></br>
                      <br></br>
                      <br></br>
                      {isUpdate ? null :
                        <Grid container spacing={2}>
                          {(ArrayField.length > 0) ?
                            <Grid item xs={12}>
                              <TableContainer >
                                <Table className={classes.table} aria-label="caption table">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell align='center'>Emp. ID</TableCell>
                                      <TableCell align='center'>Emp. Name</TableCell>
                                      <TableCell align='center'>Emp. Type</TableCell>
                                      <TableCell align='center' >Section</TableCell>
                                      <TableCell align='center'>Cost Center</TableCell>
                                      <TableCell align='center'>Task Code</TableCell>
                                      <TableCell align='center'>Task Name</TableCell>
                                      <TableCell align='center'>Rate</TableCell>
                                      <TableCell align='center'>BCS Allowance</TableCell>
                                      <TableCell align='center'>G. Allowance</TableCell>
                                      <TableCell align='center'>Assigned Qty</TableCell>
                                      <TableCell align='center'>Completed Qty</TableCell>
                                      <TableCell align='center'>Amount</TableCell>
                                      <TableCell align='center'>Action</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {ArrayField.map((rowData, index) => (
                                      <TableRow key={index}>
                                        <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.registrationNumber)}
                                        </TableCell>
                                        <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.employeeName)}
                                        </TableCell>
                                        <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.employeeTypeName)}
                                        </TableCell>
                                        <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.fieldName)}
                                        </TableCell>
                                        <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.costCenterName)}
                                        </TableCell>
                                        <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.taskCode)}
                                        </TableCell>
                                        <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.taskName)}
                                        </TableCell>
                                        <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.rate)}
                                        </TableCell>
                                        <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.allowance)}
                                        </TableCell>
                                        <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.gardenAllowance)}
                                        </TableCell>
                                        <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.assignQuntity)}
                                        </TableCell>
                                        <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.completedQuntity)}
                                        </TableCell>
                                        <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(totalValues.amount)}
                                        </TableCell>
                                        <TableCell align='center' scope="row" style={{ borderBottom: "none" }}>
                                          <DeleteIcon
                                            style={{
                                              color: "red",
                                              marginBottom: "-1rem",
                                              marginTop: "0rem",
                                              cursor: "pointer"
                                            }}
                                            size="small"
                                            onClick={() => DeleteItem(index)}
                                          >
                                          </DeleteIcon>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Grid> : null}
                        </Grid>
                      }
                      {dialogbox ?
                        <AlertDialogWithoutButton confirmData={confirmData} cancelData={cancelData}
                          IconTitle={"Delete"}
                          headerMessage={"Are you sure you want to delete?"}
                        />
                        : null
                      }
                      {(ArrayField.length > 0) ?
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <Button
                            color="primary"
                            disabled={isSubmitting || isDisableButton}
                            type="button"
                            variant="contained"
                            onClick={SaveOtherDeductionDetails}
                          >
                            {isUpdate == true ? "Update" : "Save"}
                          </Button>
                        </Box>
                        : null
                      }
                    </CardContent>
                  </PerfectScrollbar>
                </Card>
              </Box>
            </form>
          )}
        </Formik>
      </Container>
    </Page>
  );
};
