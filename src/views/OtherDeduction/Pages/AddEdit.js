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

const screenCode = 'OTHERDEDUCTION';

export default function OtherDeductionAddEdit(props) {
  const [title, setTitle] = useState("Add Other Deduction Details")
  const [isUpdate, setIsUpdate] = useState(false);
  const [isHideField, setIsHideField] = useState(true);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const [employeeType, setEmployeeType] = useState([])
  const classes = useStyles();
  const [groups, setGroups] = useState()
  const [factories, setFactories] = useState()
  const [initialState, setInitialState] = useState(false);
  const [otherDeductionDetails, setotherDeductionDetails] = useState({
    groupID: '0',
    gardenID: '0',
    registrationNumber: '',
    employeeName: '',
    employeeTypeID: '0',
    employeeTypeName: '',
    deductionType: '0',
    deductionTypeName: '',
    deductionAmount: '',
    // applyParty: '0',
    // calculationType: '0',
    otherDeductionID: '0',
    employeeID: '0',
    reference: '',
    createdBy: '0',
    applicableDate: new Date(),
  });
  const [ArrayField, setArrayField] = useState([]);
  const [arrayNewWareField, setArrayNewWareField] = useState([]);
  const [dialogbox, setDialogbox] = useState(false);
  const [index, setIndex] = useState(0);
  const [deductionTypes, setDeductionTypes] = useState();
  // const [applyParty, setapplyParty] = useState({
  //   1: "Daily",
  //   2: "Weekly",
  //   3: "Monthly",
  //   4: "Quarterly",
  // })
  // const [calculationType, setcalculationType] = useState({
  //   1: "Fix",
  //   2: "Percentage",
  // })
  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/app/otherDeduction/listing');
  }
  const alert = useAlert();

  const { otherDeductionID } = useParams();
  let decrypted = 0;
  const [fieldDataList, setFieldDataList] = useState([])

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const [clearStatus, setClearStatus] = useState('');
  const [isCleared, setIsCleared] = useState(false);
  const [isClear, setIsClear] = useState(false);
  const [productOrderStatusList, setProductOrderStatusList] = useState([]);
  useEffect(() => {
    decrypted = atob(otherDeductionID);
    if (decrypted != 0) {
      trackPromise(getOtherDeductionDetails(decrypted));
    }
    trackPromise(getPermissions(), getGroupsForDropdown(), getEmployeeTypesForDropdown());
  }, []);

  useEffect(() => {
    if (otherDeductionDetails.groupID != '0') {
      trackPromise(getFactoriesForDropdown());
    }
  }, [otherDeductionDetails.groupID]);

  useEffect(() => {
    if (!initialState) {
      trackPromise(getPermissions());
    }
  }, []);

  useEffect(() => {
    if (otherDeductionDetails.gardenID != '0') {
      trackPromise(getDeductionTypeForDropdown());
      trackPromise(getStatus());
    }
  }, [otherDeductionDetails.gardenID]);

  useEffect(() => {
    if (initialState) {
      setotherDeductionDetails((prevState) => ({
        ...prevState,
        gardenID: 0,

      }));
    }
  }, [otherDeductionDetails.groupID, initialState]);

  useEffect(() => {
    setotherDeductionDetails({
      ...otherDeductionDetails,
      employeeID: '0',
    })
    if (otherDeductionDetails.registrationNumber !== '' && isUpdate == false) {
      trackPromise(getEmployeDetails())
    }
  }, [otherDeductionDetails.registrationNumber]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITOTHERDEDUCTION');

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
      setInitialState(true);
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

  async function getDeductionTypeForDropdown() {
    const deductionTypes = await services.getDeductionType();
    setDeductionTypes(deductionTypes);
  }

  async function getEmployeeTypesForDropdown() {
    const types = await services.getEmployeeTypesForDropdown();
    setEmployeeType(types);
  }

  async function getOtherDeductionDetails(otherDeductionID) {
    const response = await services.getOtherDeductionDetailsByOtherDeductionID(otherDeductionID);
    if (response.statusCode == 'Success') {
      setIsUpdate(true);
      setTitle("Edit Other Deduction Details");
      let data = response.data;
      setotherDeductionDetails({
        ...otherDeductionDetails,
        groupID: data.groupID,
        gardenID: data.gardenID,
        registrationNumber: data.registrationNumber,
        employeeName: data.employeeName,
        employeeTypeID: data.employeeTypeID,
        employeeTypeName: data.employeeTypeName,
        deductionType: data.deductionType,
        deductionTypeName: data.deductionTypeName,
        deductionAmount: data.deductionAmount,
        // applyParty: data.applyParty,
        // calculationType: data.calculationType,
        otherDeductionID: data.otherDeductionID,
        employeeID: data.employeeID,
        reference: data.reference,
        createdBy: data.createdBy,
        applicableDate: moment(data.applicableDate).format('YYYY-MM-DD')
      });
    }
    else {
      alert.error('Error Occur In Other Deduction Update.');
    }
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

  async function SaveOtherDeductionDetails() {
    const result = await services.ValidateOtherDeductionDetails(otherDeductionDetails);
    if (isUpdate) {
      if (result.statusCode === "Success") {
        let response = await services.UpdateOtherDeductionDetails(otherDeductionDetails, tokenService.getUserIDFromToken());
        if (response.statusCode === "Success") {
          alert.success(response.message);
          setIsDisableButton(true);
          clearFields();
          navigate('/app/otherDeduction/listing');
        }
        else {
          alert.error(response.message);
        }
      }
      else {
        alert.error("The record already exists!");
      }

    }
    else {
      let response = await services.saveOtherDeductionDetails(ArrayField, tokenService.getUserIDFromToken());
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        clearFields();
        navigate('/app/otherDeduction/listing');
      }
      else {
        alert.error(response.message);
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

  function handleChange1(e) {
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
      applicableDate: moment(date).format('YYYY-MM-DD')
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
      employeeTypeID: '0',
      employeeTypeName: '',
      deductionType: '0',
      deductionTypeName: '',
      deductionAmount: '',
      // applyParty: '0',
      // calculationType: '0',
      otherDeductionID: '0',
      employeeID: '0',
      reference: '',
      createdBy: '',
      applicableDate: new Date(),
    });
    setIsHideField(true)
  }

  async function getStatus() {
    let response = await services.getStatus(otherDeductionDetails.gardenID);
    setProductOrderStatusList(response);
  }

  async function handleClickAdd() {
    const isMatch = ArrayField.some(x =>
      x.groupID === parseInt(otherDeductionDetails.groupID) &&
      x.gardenID === parseInt(otherDeductionDetails.gardenID) &&
      x.registrationNumber === otherDeductionDetails.registrationNumber &&
      x.deductionType === parseInt(otherDeductionDetails.deductionType) &&
      x.deductionAmount === parseFloat(otherDeductionDetails.deductionAmount) &&
      x.employeeID === parseInt(otherDeductionDetails.employeeID) &&
      x.applicableDate === moment(otherDeductionDetails.applicableDate).format('YYYY-MM-DD')
    );



    if (isMatch) {
      alert.error("The record already exists!")
    } else {
      let response = await services.ValidateOtherDeductionDetails(otherDeductionDetails);
      if (response.statusCode == "Success") {
        var array1 = [...ArrayField];
        var array2 = [...arrayNewWareField];

        array1.push({
          groupID: parseInt(otherDeductionDetails.groupID),
          gardenID: parseInt(otherDeductionDetails.gardenID),
          registrationNumber: otherDeductionDetails.registrationNumber,
          employeeName: otherDeductionDetails.employeeName,
          employeeTypeID: parseInt(otherDeductionDetails.employeeTypeID),
          employeeTypeName: employeeType[otherDeductionDetails.employeeTypeID].name,
          deductionType: parseInt(otherDeductionDetails.deductionType),
          deductionTypeName: deductionTypes[otherDeductionDetails.deductionType],
          deductionAmount: parseFloat(otherDeductionDetails.deductionAmount),
          // applyParty: parseInt(otherDeductionDetails.applyParty),
          // calculationType: parseInt(otherDeductionDetails.calculationType),
          otherDeductionID: parseInt(otherDeductionDetails.otherDeductionID),
          employeeID: parseInt(otherDeductionDetails.employeeID),
          reference: otherDeductionDetails.reference,
          applicableDate: moment(otherDeductionDetails.applicableDate).format('YYYY-MM-DD'),
          createdBy: tokenService.getUserIDFromToken(),
        });

        array2.push({
          groupID: parseInt(otherDeductionDetails.groupID),
          gardenID: parseInt(otherDeductionDetails.gardenID),
          registrationNumber: otherDeductionDetails.registrationNumber,
          employeeName: otherDeductionDetails.employeeName,
          employeeTypeID: parseInt(otherDeductionDetails.employeeTypeID),
          employeeTypeName: employeeType[otherDeductionDetails.employeeTypeID].name,
          deductionType: parseInt(otherDeductionDetails.deductionType),
          deductionTypeName: deductionTypes[otherDeductionDetails.deductionType],
          deductionAmount: parseFloat(otherDeductionDetails.deductionAmount),
          // applyParty: parseInt(otherDeductionDetails.applyParty),
          // calculationType: parseInt(otherDeductionDetails.calculationType),
          otherDeductionID: parseInt(otherDeductionDetails.otherDeductionID),
          employeeID: parseInt(otherDeductionDetails.employeeID),
          reference: otherDeductionDetails.reference,
          applicableDate: moment(otherDeductionDetails.applicableDate).format('YYYY-MM-DD'),
          createdBy: tokenService.getUserIDFromToken(),
        });

        setArrayField(array1);
        setArrayNewWareField(array2);

        let dataModel = {
          groupID: parseInt(otherDeductionDetails.groupID),
          gardenID: parseInt(otherDeductionDetails.gardenID),
          registrationNumber: otherDeductionDetails.registrationNumber,
          employeeName: otherDeductionDetails.employeeName,
          employeeTypeID: parseInt(otherDeductionDetails.employeeTypeID),
          employeeTypeName: employeeType[otherDeductionDetails.employeeTypeID].name,
          deductionType: parseInt(otherDeductionDetails.deductionType),
          deductionTypeName: deductionTypes[otherDeductionDetails.deductionType],
          deductionAmount: parseFloat(otherDeductionDetails.deductionAmount),
          // applyParty: parseInt(otherDeductionDetails.applyParty),
          // calculationType: parseInt(otherDeductionDetails.calculationType),
          otherDeductionID: parseInt(otherDeductionDetails.otherDeductionID),
          employeeID: parseInt(otherDeductionDetails.employeeID),
          reference: otherDeductionDetails.reference,
          applicableDate: moment(otherDeductionDetails.applicableDate).format('YYYY-MM-DD'),
          createdBy: tokenService.getUserIDFromToken(),
        }

        setFieldDataList(fieldDataList => [...fieldDataList, dataModel]);
        setotherDeductionDetails({
          ...otherDeductionDetails,
          registrationNumber: '',
          employeeName: '',
          employeeTypeID: '0',
          employeeTypeName: '',
          employeeID: '0',
        })
        setIsCleared(!isCleared)
      }
      else {
        alert.error(response.message);
      }


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

  return (
    <Page
      className={classes.root}
      title="Add Other Deduction Details"
    >
      <LoadingComponent />
      <Container maxWidth={false}>
        <Formik
          initialValues={{
            groupID: otherDeductionDetails.groupID,
            gardenID: otherDeductionDetails.gardenID,
            registrationNumber: otherDeductionDetails.registrationNumber,
            employeeName: otherDeductionDetails.employeeName,
            employeeTypeID: otherDeductionDetails.employeeTypeID,
            deductionType: otherDeductionDetails.deductionType,
            deductionAmount: otherDeductionDetails.deductionAmount,
            // applyParty: otherDeductionDetails.applyParty,
            // calculationType: otherDeductionDetails.calculationType,
            reference: otherDeductionDetails.reference,
            applicableDate: otherDeductionDetails.applicableDate,
            createdBy: otherDeductionDetails.createdBy

          }}
          validationSchema={
            Yup.object().shape({
              groupID: Yup.number().required('Legal Entity required').min("1", 'Legal Entity is required'),
              gardenID: Yup.number().required('Garden is required').min("1", 'Garden is required'),
              registrationNumber: Yup.string().required('Registration Number is required'),
              employeeName: Yup.string().required('Employee Name is required'),
              employeeTypeID: Yup.number().required('Employee Type is required').min("1", 'Employee Type is required'),
              deductionType: Yup.number().required('Deduction Type is required').min("1", 'Deduction Type is required'),
              deductionAmount: Yup.string().required('Amount is required').matches(/^\s*(?=.*[0-9])\d*(?:\.\d{1,2})?\s*$/, 'Invalid Amount (Allow only positive amount with 2 decimal)'),
              // applyParty: Yup.number().required('Apply Party is required').min("1", 'Apply Party is required'),
              // calculationType: Yup.number().required('Calculation Type is required').min("1", 'Calculation Type is required'),
              //reference: Yup.string().required('Reference is required'),
            })
          }
          onSubmit={() => isUpdate == true ? SaveOtherDeductionDetails() : handleClickAdd()}
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
                              readOnly: isUpdate || !permissionList.isGroupFilterEnabled ? true : false
                            }}
                            size="small"
                          >
                            <MenuItem value="0">--Select  Business Division--</MenuItem>
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
                              readOnly: isUpdate || !permissionList.isFactoryFilterEnabled ? true : false
                            }}
                            size="small"
                          >
                            <MenuItem value="0">--Select Location--</MenuItem>
                            {generateDropDownMenu(factories)}
                          </TextField>
                        </Grid>
                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="deductionType">
                            Deduction Type *
                          </InputLabel>
                          <TextField select
                            error={Boolean(touched.deductionType && errors.deductionType)}
                            fullWidth
                            helperText={touched.deductionType && errors.deductionType}
                            name="deductionType"
                            onBlur={handleBlur}
                            onChange={(e) => handleChange1(e)}
                            value={otherDeductionDetails.deductionType}
                            variant="outlined"
                            id="deductionType"
                            size="small"
                          >
                            <MenuItem value="0">--Select Deduction Type--</MenuItem>
                            {generateDropDownMenu(deductionTypes)}
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
                          />
                        </Grid>
                      </Grid>
                      <Grid container spacing={3}>


                        {/* <Grid item md={3} xs={12}>
                          <InputLabel shrink id="applyParty">
                            Apply Party *
                          </InputLabel>
                          <TextField select
                            error={Boolean(touched.applyParty && errors.applyParty)}
                            fullWidth
                            helperText={touched.applyParty && errors.applyParty}
                            name="applyParty"
                            onBlur={handleBlur}
                            onChange={(e) => handleChange1(e)}
                            value={otherDeductionDetails.applyParty}
                            variant="outlined"
                            id="applyParty" 
                            size="small"
                          >
                            <MenuItem value="0">--Select Apply Party--</MenuItem>
                            {generateDropDownMenu(applyParty)}
                          </TextField>
                        </Grid> */}
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
                          />
                        </Grid>
                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="applicableDate">Date *</InputLabel>
                          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                              fullWidth
                              variant="inline"
                              format="dd/MM/yyyy"
                              margin="dense"
                              name='applicableDate'
                              id='applicableDate'
                              size='small'
                              value={otherDeductionDetails.applicableDate}
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
                      {/* <Grid container spacing={3}>
                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="calculationType">
                            Calculation Type *
                          </InputLabel>
                          <TextField select
                            error={Boolean(touched.calculationType && errors.calculationType)}
                            fullWidth
                            helperText={touched.calculationType && errors.calculationType}
                            name="calculationType"
                            onBlur={handleBlur}
                            onChange={(e) => handleChange1(e)}
                            value={otherDeductionDetails.calculationType}
                            variant="outlined"
                            id="calculationType"
                            size="small"
                          >
                            <MenuItem value="0">--Select Calculation Type--</MenuItem>
                            {generateDropDownMenu(calculationType)}
                          </TextField>
                        </Grid>
                      </Grid> */}
                      <br></br>
                      <br></br>
                      <br></br>
                      <br></br>
                      <br></br>
                      <Grid container spacing={3}>
                        {isUpdate ?
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="registrationNumber">
                              Emp.ID *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.registrationNumber && errors.registrationNumber)}
                              fullWidth
                              helperText={touched.registrationNumber && errors.registrationNumber}
                              name="registrationNumber"
                              onBlur={handleBlur}
                              value={otherDeductionDetails.registrationNumber}
                              variant="outlined"
                              disabled={isDisableButton}
                              InputProps={{
                                readOnly: isUpdate
                              }}
                              size='small'
                            />
                          </Grid>

                          :
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

                              clearOnBlur={isClear}
                              defaultValue={{ value: clearStatus }}
                              renderInput={params => (
                                <TextField
                                  {...params}
                                  variant="outlined"
                                  name="registrationNumber"
                                  //label="Emp ID *"
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
                          <InputLabel shrink id="employeeTypeID">
                            Emp.Type *
                          </InputLabel>
                          <TextField select fullWidth
                            error={Boolean(touched.employeeTypeID && errors.employeeTypeID)}
                            helperText={touched.employeeTypeID && errors.employeeTypeID}
                            size='small'
                            onBlur={handleBlur}
                            id="employeeTypeID"
                            name="employeeTypeID"
                            value={otherDeductionDetails.employeeTypeID}
                            type="text"
                            variant="outlined"
                            onChange={(e) => handleChange1(e)}
                            InputProps={{
                              readOnly: true
                            }}
                          >
                            <MenuItem value="0"></MenuItem>
                            {generateDropDownMenuWithTwoValues(employeeType)}
                          </TextField>
                        </Grid>
                      </Grid>

                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          color="primary"
                          type="submit"
                          variant="contained"
                        >
                          {isUpdate == true ? "Update" : "Add"}
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
                                      <TableCell align='center'>Applicable Date</TableCell>
                                      <TableCell align='center' >Emp.ID</TableCell>
                                      <TableCell align='center'>Emp.Name</TableCell>
                                      <TableCell align='center'>Emp.Type</TableCell>
                                      <TableCell align='center'>Deduction Type</TableCell>
                                      <TableCell align='center'>Deduction Amount</TableCell>
                                      <TableCell align='center'>Reference</TableCell>
                                      <TableCell align='center'>Actions</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {ArrayField.map((rowData, index) => (
                                      <TableRow key={index}>
                                        <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.applicableDate)}
                                        </TableCell>
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
                                          {(rowData.deductionTypeName)}
                                        </TableCell>
                                        <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.deductionAmount)}
                                        </TableCell>
                                        <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.reference)}
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
                      {(isUpdate == false) && (ArrayField.length > 0) ?
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
