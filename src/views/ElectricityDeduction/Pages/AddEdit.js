import React, { useState, useEffect, useRef } from 'react';
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
import DeleteIcon from '@material-ui/icons/Delete';
import moment from 'moment';
import CreateIcon from '@material-ui/icons/Create';
import Slide from '@material-ui/core/Slide';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';

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
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});
const screenCode = 'ELECTRICITYDEDUCTION';

export default function ElectricityDeductionAddEdit(props) {
  const [title, setTitle] = useState("Add Electricity Deduction Details")
  const [isUpdate, setIsUpdate] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const classes = useStyles();
  const [groups, setGroups] = useState()
  const [factories, setFactories] = useState()
  const [costCenters, setCostCenters] = useState();
  const curr = new Date;
  const first = curr.getDate() - curr.getDay();
  const last = first - 1;
  const friday = first + 5;
  const lastday = new Date(curr.setDate(last)).toISOString().substr(0, 10);
  const friday1 = new Date(curr.setDate(friday)).toISOString().substr(0, 10);
  const [otherDeductionDetails, setotherDeductionDetails] = useState({
    groupID: '0',
    gardenID: '0',
    costCenterID: '0',
    employeeName: '',
    deductionAmount: '',
    employeeSubCategoryName: '',
    employeeID: '0',
    employeeSubCategoryMappingID: '0',
    reference: '',
    createdBy: '0',
    registrationNumber: '',
    electricityDeductionID: '0',
    applicableDate: lastday,
    toDate: friday1,
  });
  const [ArrayField, setArrayField] = useState([]);
  const [FailedList, setFailedList] = useState([]);
  const [dialogbox, setDialogbox] = useState(false);
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/app/ElectricityDeduction/listing');
  }
  const alert = useAlert();
  const amountRef = useRef(null);
  const addButtonRef = useRef(null);
  const referenceRef = useRef(null);
  const { electricityDeductionID } = useParams();
  let decrypted = 0;
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const [isCleared, setIsCleared] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [enabledDay, setEnabledDay] = useState(1);
  const isDayDisabled = (date) => {
    if (enabledDay === null) {
      return true;
    }
    if (date.getDay() !== enabledDay) {
      return true;
    }
    const pastWeek = new Date();
    pastWeek.setDate(pastWeek.getDate() - 7);
    return date < pastWeek;
  };

  useEffect(() => {
    decrypted = atob(electricityDeductionID);
    if (decrypted != 0) {
      trackPromise(getElectricityDeductionDetails(decrypted));
    }
    trackPromise(getPermissions(), getGroupsForDropdown());
  }, []);

  useEffect(() => {
    if (otherDeductionDetails.groupID != '0') {
      trackPromise(getFactoriesForDropdown());
      setotherDeductionDetails({
        ...otherDeductionDetails,
        costCenterID: ''
      })
    }
  }, [otherDeductionDetails.groupID]);

  useEffect(() => {
    trackPromise(
      getCostCenterDetailsByGardenID()
    )
  }, [otherDeductionDetails.gardenID]);

  useEffect(() => {
    if (otherDeductionDetails.electricityDeductionID == '0') {
      setotherDeductionDetails((otherDeductionDetails) => ({
        ...otherDeductionDetails,
        applicableDate: null
      }));
    }
  }, [otherDeductionDetails.gardenID, otherDeductionDetails.groupID])

  useEffect(() => {
    calculateToDate();
  }, [otherDeductionDetails.applicableDate])

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITELECTRICITYDEDUCTION');

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
        gardenID: parseInt(tokenService.getFactoryIDFromToken()),
      })
    }
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
    var generated = generateDropDownMenu(response)
    if (generated.length > 0) {
      setotherDeductionDetails((otherDeductionDetails) => ({
        ...otherDeductionDetails,
        costCenterID: generated[0].props.value,
      }));
    }
    setCostCenters(response);
  };

  async function getElectricityDeductionDetails(electricityDeductionID) {
    const response = await services.getElectricityDeductionDetailsByelectricityDeductionID(electricityDeductionID);
    if (response.statusCode == 'Success') {
      setIsUpdate(true);
      setTitle("Edit Electricity Deduction Details");
      let data = response.data;
      setotherDeductionDetails({
        ...otherDeductionDetails,
        groupID: data.groupID,
        gardenID: data.gardenID,
        registrationNumber: data.registrationNumber,
        employeeName: data.employeeName,
        employeeSubCategoryMappingID: data.employeeSubCategoryMappingID,
        employeeSubCategoryName: data.employeeSubCategoryName,
        deductionAmount: data.deductionAmount,
        electricityDeductionID: data.electricityDeductionID,
        employeeID: data.employeeID,
        reference: data.reference,
        createdBy: data.createdBy,
        applicableDate: moment(data.applicableDate).format('YYYY-MM-DD'),
      });
    }
    else {
      alert.error('Error Occur In Electricity Deduction Update.');
    }
  }

  async function SaveElectricityDeductionDetails() {
    if (isUpdate) {
      let response = await services.UpdateElectricityDeductionDetails(otherDeductionDetails, tokenService.getUserIDFromToken());
      if (response.statusCode === "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        clearFields();
        navigate('/app/ElectricityDeduction/listing');
      }
      else {
        alert.error(response.message);
      }
    }
    else {
      let response = await services.SaveElectricityDeductionDetails(ArrayField, tokenService.getUserIDFromToken());
      if (response.statusCode == "Success" && response.data == 0) {
        alert.success(response.message);
        setIsDisableButton(true);
        clearFields();
        navigate('/app/ElectricityDeduction/listing');
      }
      else if (response.statusCode == "Success" && response.data != 0) {
        alert.success(response.message);
        clearFields();
        setFailedList(response.data)
        setIsFailed(true);
      }
      else if (response.statusCode == "Error" && response.data != 0) {
        alert.error(response.message);
        clearFields();
        setFailedList(response.data)
        setIsFailed(true);
      }
      else {
        alert.error(response.message);
      }
    }
    setArrayField([]);
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

  const handleClose = () => {
    setDialogbox(false);
  };

  function handleChange1(e) {
    const target = e.target;
    const value = target.value
    setotherDeductionDetails({
      ...otherDeductionDetails,
      [e.target.name]: value
    });
  }

  const handleKeyDown = async (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      await fetchEmployeeDetails(otherDeductionDetails.registrationNumber);
      amountRef.current.focus();
    }

  }

  const handleKeyDown1 = (event, nextInputRef) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (!otherDeductionDetails.registrationNumber || !otherDeductionDetails.deductionAmount || !otherDeductionDetails.employeeID) {
        return;
      }

      if (nextInputRef === addButtonRef) {
        handleClickAdd();
      } else {
        nextInputRef && nextInputRef.current && typeof nextInputRef.current.focus === 'function' && nextInputRef.current.focus();
      }
    }
  }

  const fetchEmployeeDetails = async (registrationNumber) => {
    if (registrationNumber) {
      const response = await services.getEmployeeDetailsByRegNumber(otherDeductionDetails.costCenterID, registrationNumber);
      if (response && response.data) {
        const { employeeName, employeeSubCategoryName } = response.data;
        setotherDeductionDetails(prev => ({
          ...prev,
          employeeName: employeeName,
          employeeSubCategoryName: employeeSubCategoryName,
          employeeID: response.data.employeeID,
          employeeSubCategoryMappingID: response.data.employeeSubCategoryMappingID,
        }));
        amountRef.current.focus();
      } else {

        alert.error('No employee details found for this registration number.');
      }
    }
  }

  function handleDateChange(value) {
    setotherDeductionDetails({
      ...otherDeductionDetails,
      applicableDate: value
    });
  }

  function calculateToDate() {
    const calDate = new Date(otherDeductionDetails.applicableDate);
    calDate.setDate(calDate.getDate() + 6);
    setotherDeductionDetails({
      ...otherDeductionDetails,
      toDate: calDate
    });
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

  function clearFields() {
    setotherDeductionDetails({
      ...otherDeductionDetails,
      registrationNumber: '',
      employeeName: '',
      employeeSubCategoryMappingID: '0',
      employeeSubCategoryName: '',
      deductionAmount: '',
      employeeID: '0',
      reference: '',
      createdBy: '',
    });
  }

  async function handleClickAdd() {
    setIsFailed(false);
    setIsEdit(false)
    const isMatch = ArrayField.some(x =>
      x.groupID === parseInt(otherDeductionDetails.groupID) &&
      x.gardenID === parseInt(otherDeductionDetails.gardenID) &&
      x.costCenterID == parseInt(otherDeductionDetails.costCenterID) &&
      x.registrationNumber === otherDeductionDetails.registrationNumber &&
      x.employeeID === parseInt(otherDeductionDetails.employeeID)
    );

    if (isMatch) {
      alert.error("This record already exists!")
      setotherDeductionDetails({
        ...otherDeductionDetails,
        deductionAmount: '',
        reference: ''
      })
    } else {
      var array1 = [...ArrayField];

      array1.push({
        groupID: parseInt(otherDeductionDetails.groupID),
        gardenID: parseInt(otherDeductionDetails.gardenID),
        costCenterID: parseInt(otherDeductionDetails.costCenterID),
        employeeID: parseInt(otherDeductionDetails.employeeID),
        employeeName: otherDeductionDetails.employeeName,
        employeeSubCategoryMappingID: parseInt(otherDeductionDetails.employeeSubCategoryMappingID),
        employeeSubCategoryName: otherDeductionDetails.employeeSubCategoryName,
        registrationNumber: otherDeductionDetails.registrationNumber,
        deductionAmount: parseFloat(otherDeductionDetails.deductionAmount),
        reference: otherDeductionDetails.reference,
        applicableDate: moment(otherDeductionDetails.applicableDate).format('YYYY-MM-DD'),
        toDate: moment(otherDeductionDetails.toDate).format('YYYY-MM-DD'),
        createdBy: tokenService.getUserIDFromToken(),
      });

      setArrayField(array1);
      setIsCleared(!isCleared)
      setotherDeductionDetails({
        ...otherDeductionDetails,
        registrationNumber: '',
        employeeName: '',
        employeeSubCategoryName: '',
        deductionAmount: '',
        reference: ''
      })
    }
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

  const EditElectricityDeduction = (rowData, index) => {
    setIsEdit(true)
    setotherDeductionDetails({
      ...otherDeductionDetails,
      employeeName: rowData.employeeName,
      employeeSubCategoryMappingID: rowData.employeeSubCategoryMappingID,
      employeeSubCategoryName: rowData.employeeSubCategoryName,
      registrationNumber: rowData.registrationNumber,
      deductionAmount: rowData.deductionAmount,
      reference: rowData.reference,
      createdBy: rowData.createdBy,
    });

    setArrayField(prevArray => prevArray.filter((_, i) => i !== index));
  };

  return (
    <Page
      className={classes.root}
      title="Add Electricity Deduction Details"
    >
      <LoadingComponent />
      <Container maxWidth={false}>
        <Formik
          initialValues={{
            groupID: otherDeductionDetails.groupID,
            gardenID: otherDeductionDetails.gardenID,
            costCenterID: otherDeductionDetails.costCenterID,
            employeeName: otherDeductionDetails.employeeName,
            employeeSubCategoryName: otherDeductionDetails.employeeSubCategoryName,
            deductionAmount: otherDeductionDetails.deductionAmount,
            reference: otherDeductionDetails.reference,
            applicableDate: otherDeductionDetails.applicableDate,
            createdBy: otherDeductionDetails.createdBy

          }}
          validationSchema={
            Yup.object().shape({
              groupID: Yup.number().required('Legal Entity required').min("1", 'Legal Entity is required'),
              gardenID: Yup.number().required('Garden is required').min("1", 'Garden is required'),
              costCenterID: Yup.number().required('CostCenter is required').min("1", 'CostCenter is required'),
              employeeName: Yup.string().required('Employee Name is required'),
              employeeSubCategoryName: Yup.string().required('Employee Type Name is required'),
              deductionAmount: Yup.string().required('Amount is required. Please enter a valid amount.').matches(/^\s*(?!0(?:\.0{1,2})?$)(?=.*[1-9])\d*(?:\.\d{1,2})?\s*$/, 'Invalid Amount (Allow only positive amount with 2 decimal and cannot be zero)'),
              applicableDate: Yup.date().nullable().required('Date is required')
            })
          }
          onSubmit={() => isUpdate == true ? SaveElectricityDeductionDetails() : handleClickAdd()}
          enableReinitialize
        >
          {({
            errors,
            handleBlur,
            handleSubmit,
            isSubmitting,
            touched
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
                            Business Division *
                          </InputLabel>
                          <TextField select
                            error={Boolean(touched.groupID && errors.groupID)}
                            fullWidth
                            helperText={touched.groupID && errors.groupID}
                            name="groupID"
                            onBlur={handleBlur}
                            onChange={(e) => handleChange1(e)}
                            value={otherDeductionDetails.groupID}
                            variant="outlined"
                            id="groupID"
                            InputProps={{
                              readOnly: (isUpdate || !permissionList.isGroupFilterEnabled ? true : false) || ArrayField.length > 0
                            }}
                            size="small"
                          >
                            <MenuItem value="0">--Select Business Division--</MenuItem>
                            {generateDropDownMenu(groups)}
                          </TextField>
                        </Grid>

                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="gardenID">
                            Location *
                          </InputLabel>
                          <TextField select
                            error={Boolean(touched.gardenID && errors.gardenID)}
                            fullWidth
                            helperText={touched.gardenID && errors.gardenID}
                            name="gardenID"
                            onBlur={handleBlur}
                            onChange={(e) => handleChange1(e)}
                            value={otherDeductionDetails.gardenID}
                            variant="outlined"
                            id="gardenID"
                            InputProps={{
                              readOnly: (isUpdate || !permissionList.isFactoryFilterEnabled ? true : false) || ArrayField.length > 0
                            }}
                            size="small"
                          >
                            <MenuItem value="0">--Select Location--</MenuItem>
                            {generateDropDownMenu(factories)}
                          </TextField>
                        </Grid>

                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="costCenterID">
                            Sub Division *
                          </InputLabel>
                          <TextField select
                            error={Boolean(touched.costCenterID && errors.costCenterID)}
                            fullWidth
                            name="costCenterID"
                            onBlur={handleBlur}
                            onChange={(e) => handleChange1(e)}
                            value={otherDeductionDetails.costCenterID}
                            variant="outlined"
                            id="costCenterID"
                            InputProps={{
                              readOnly: isUpdate || ArrayField.length > 0
                            }}
                            size='small'
                          >
                            <MenuItem value="0">--Select Sub Division--</MenuItem>
                            {generateDropDownMenu(costCenters)}
                          </TextField>
                        </Grid>

                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="applicableDate">
                            Date *
                          </InputLabel>
                          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                              error={Boolean(touched.applicableDate && errors.applicableDate)}
                              autoOk
                              fullWidth
                              helperText={touched.applicableDate && errors.applicableDate}
                              variant="inline"
                              format="yyyy/MM/dd"
                              margin="dense"
                              id="applicableDate"
                              readOnly={isUpdate || ArrayField.length > 0}
                              value={otherDeductionDetails.applicableDate}
                              shouldDisableDate={isDayDisabled}
                              onChange={(e) => {
                                handleDateChange(e);
                              }}
                              KeyboardButtonProps={{
                                'aria-label': 'change date',
                              }}
                            />
                          </MuiPickersUtilsProvider>
                        </Grid>
                      </Grid>
                      <br />
                      <br />
                      <br />
                      <br />
                      <br />
                      <Grid container spacing={3}>
                        {isEdit == true || isUpdate == true ?
                          <Grid item md={3} xs={12} >
                            <InputLabel shrink id="registrationNumber">
                              Reg No. *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.registrationNumber && errors.registrationNumber)}
                              fullWidth
                              helperText={touched.registrationNumber && errors.registrationNumber}
                              size='small'
                              name="registrationNumber"
                              onBlur={handleBlur}
                              value={otherDeductionDetails.registrationNumber}
                              variant="outlined"
                              disabled={isDisableButton}
                              InputProps={{
                                readOnly: isUpdate || isEdit
                              }}
                            >
                            </TextField>
                          </Grid>
                          :
                          <Grid item md={3} xs={12} >
                            <InputLabel shrink id="registrationNumber">
                              Reg No. *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.registrationNumber && errors.registrationNumber)}
                              fullWidth
                              helperText={touched.registrationNumber && errors.registrationNumber}
                              size='small'
                              name="registrationNumber"
                              onChange={(e) => handleChange1(e)}
                              value={otherDeductionDetails.registrationNumber}
                              variant="outlined"
                              id="registrationNumber"
                              onKeyDown={(e) => handleKeyDown(e)}
                            >
                            </TextField>
                          </Grid>
                        }

                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="employeeName">
                            Emp.Name *
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.employeeName && errors.employeeName)}
                            fullWidth
                            helperText={touched.employeeName && errors.employeeName}
                            name="employeeName"
                            onBlur={handleBlur}
                            value={otherDeductionDetails.employeeName}
                            variant="outlined"
                            disabled={isDisableButton}
                            InputProps={{
                              readOnly: true
                            }}
                            size='small'
                          />
                        </Grid>

                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="employeeSubCategoryName">
                            Emp.Category *
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.employeeSubCategoryName && errors.employeeSubCategoryName)}
                            fullWidth
                            helperText={touched.employeeSubCategoryName && errors.employeeSubCategoryName}
                            size='small'
                            onBlur={handleBlur}
                            id="employeeSubCategoryName"
                            name="employeeSubCategoryName"
                            value={otherDeductionDetails.employeeSubCategoryName}
                            type="text"
                            variant="outlined"
                            InputProps={{
                              readOnly: true
                            }}
                          >
                          </TextField>
                        </Grid>

                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="deductionAmount">
                            Amount *
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.deductionAmount && errors.deductionAmount)}
                            fullWidth
                            helperText={touched.deductionAmount && errors.deductionAmount}
                            name="deductionAmount"
                            type="number"
                            onBlur={handleBlur}
                            onChange={(e) => handleChange1(e)}
                            value={otherDeductionDetails.deductionAmount}
                            variant="outlined"
                            size="small"
                            inputRef={amountRef}
                            onKeyDown={(e) => handleKeyDown1(e, referenceRef)}
                          />
                        </Grid>

                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="reference">
                            Reference
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.reference && errors.reference)}
                            fullWidth
                            helperText={touched.reference && errors.reference}
                            name="reference"
                            type="text"
                            onBlur={handleBlur}
                            onChange={(e) => handleChange1(e)}
                            value={otherDeductionDetails.reference}
                            variant="outlined"
                            size="small"
                            inputRef={referenceRef}
                            onKeyDown={(e) => handleKeyDown1(e, addButtonRef)}
                          />
                        </Grid>
                      </Grid>

                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          color="primary"
                          type="submit"
                          variant="contained"
                        >
                          {isEdit == true || isUpdate == true ? "Update" : "Add"}
                        </Button>
                      </Box>
                      {isUpdate ? null :
                        <Grid container spacing={2}>
                          {(ArrayField.length > 0) ?
                            <Grid item xs={12}>
                              <TableContainer >
                                <Table className={classes.table} aria-label="caption table">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell align='center' >Emp.ID</TableCell>
                                      <TableCell align='center'>Emp.Name</TableCell>
                                      <TableCell align='center'>From Date</TableCell>
                                      <TableCell align='center'>To Date</TableCell>
                                      <TableCell align='center'>Reference</TableCell>
                                      <TableCell align='center'>Deduction Amount</TableCell>
                                      <TableCell align='center'>Actions</TableCell>
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
                                          {(rowData.applicableDate)}
                                        </TableCell>
                                        <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.toDate)}
                                        </TableCell>
                                        <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.reference == "" ? '-' : rowData.reference)}
                                        </TableCell>
                                        <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.deductionAmount).toFixed(2)}
                                        </TableCell>
                                        <TableCell align='center' scope="row" style={{ borderBottom: "none" }}>
                                          <CreateIcon
                                            style={{
                                              cursor: "pointer",
                                              marginBottom: "-1rem",
                                              marginTop: "0rem",
                                              marginRight: "12PX"
                                            }}
                                            size="small"
                                            onClick={() => EditElectricityDeduction(rowData, index)}
                                          />
                                          <DeleteIcon
                                            style={{
                                              color: "red",
                                              marginBottom: "-1rem",
                                              marginTop: "0rem",
                                              cursor: "pointer",
                                              marginLeft: "12px",
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
                      {isFailed ?
                        <Grid container spacing={2}>
                          {(FailedList.length > 0) ?
                            <Grid item xs={12}>
                              <Typography variant="h5" gutterBottom>
                                The below employees already have electricity deduction
                              </Typography>
                              <TableContainer >
                                <Table className={classes.table} aria-label="caption table">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell align='center' >Emp.ID</TableCell>
                                      <TableCell align='center'>Emp.Name</TableCell>
                                      <TableCell align='center'>From Date</TableCell>
                                      <TableCell align='center'>To Date</TableCell>
                                      <TableCell align='center'>Reference</TableCell>
                                      <TableCell align='center'>Deduction Amount</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {FailedList.map((rowData, index) => (
                                      <TableRow key={index}>
                                        <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.employeeID)}
                                        </TableCell>
                                        <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.employeeName)}
                                        </TableCell>
                                        <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(moment(rowData.fromDate).format('YYYY-MM-DD'))}
                                        </TableCell>
                                        <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(moment(rowData.toDate).format('YYYY-MM-DD'))}
                                        </TableCell>
                                        <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.reference == "" ? '-' : rowData.reference)}
                                        </TableCell>
                                        <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.deductionAmount).toFixed(2)}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Grid> : null}
                        </Grid>
                        : null}
                      {(ArrayField.length > 0) ?
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <Button
                            color="primary"
                            disabled={isSubmitting || isDisableButton}
                            type="button"
                            variant="contained"
                            onClick={SaveElectricityDeductionDetails}
                          >
                            {"Save"}
                          </Button>
                        </Box>
                        : null
                      }
                      <Dialog
                        open={dialogbox}
                        onBackdropClick="false"
                        TransitionComponent={Transition}
                        keepMounted
                        onClose={handleClose}
                        aria-labelledby="alert-dialog-slide-title"
                        aria-describedby="alert-dialog-slide-description"
                      >
                        <DialogTitle id="alert-dialog-slide-title"> <Typography
                          color="textSecondary"
                          gutterBottom
                          variant="h3"
                        >
                          <Box textAlign="center" >
                            {"Are you sure you want to delete?"}
                          </Box>
                        </Typography></DialogTitle>
                        <DialogActions>
                          <Button onClick={() => { cancelData(); handleClose(); }} color="primary">
                            No
                          </Button>
                          <Button onClick={() => { confirmData(true); handleClose(); }} color="primary">
                            Yes
                          </Button>
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
  );
};
