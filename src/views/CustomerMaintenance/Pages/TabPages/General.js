import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
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
  CardHeader,
  MenuItem  
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../../Services';
import { Formik } from 'formik';
import * as Yup from "yup";
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
import { useAlert } from "react-alert";
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100%',
  },
  avatar: {
    marginRight: theme.spacing(2)
  },
  cardContent: {
    border: `2px solid #e8eaf6`
  }
}));

const screenCode = "CUSTOMERMAINTENANCE";

export function CustomerGeneral({ cusGeneralArray, setCusGeneralArray, setFactoryID, setIsMainButtonEnable }) {
  const classes = useStyles();
  const [btnDisable, setBtnDisable] = useState(false);
  const [customer, setCustomer] = useState({
    groupID: '0',
    factoryID: '0',
    title: '0',
    customerCode: '',
    gender: '0',
    firstName: '',
    middleName: '',
    lastName: '',
    dob: null,
    nic: '',
    address: '',
    addresstwo: '',
    addressthree: '',
    mobile: '',
    home: '',
    joiningDate: null,
    areaType: '0',
    area: ''
  });
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [routes, setRoutes] = useState();
  const [isUpdate, setIsUpdate] = useState(false);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const navigate = useNavigate();
  const alert = useAlert();

  useEffect(() => {
    trackPromise(
      getPermission()
    );
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoriesForDropDown(),
    )
  }, [customer.groupID]);

  useEffect(() => {
    trackPromise(
      getRoutesForDropDown(),
    )
  }, [customer.factoryID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITCUSTOMERMAINTENANCE');

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

    setCustomer({
      ...customer,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    });

    setFactoryID(tokenService.getFactoryIDFromToken());
    getGroupsForDropdown();
    setGeneralValues();
  }

  async function getRoutesForDropDown() {
    const routeList = await services.getRoutesForDropDown(customer.factoryID);
    setRoutes(routeList);
  }

  async function getFactoriesForDropDown() {
    const factoryList = await services.getFactoryByGroupID(customer.groupID);
    setFactories(factoryList);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  async function setGeneralValues() {
    if (Object.keys(cusGeneralArray).length > 0) {
      setCustomer({
        ...customer,
        customerCode: cusGeneralArray.customerCode,
        title: cusGeneralArray.title,
        firstName: cusGeneralArray.firstName,
        middleName: cusGeneralArray.middleName,
        lastName: cusGeneralArray.lastName,
        gender: cusGeneralArray.gender,
        dob: cusGeneralArray.dob,
        nic: cusGeneralArray.nic,
        address: cusGeneralArray.address,
        addresstwo: cusGeneralArray.addresstwo,
        addressthree: cusGeneralArray.addressthree,
        mobile: cusGeneralArray.mobile,
        home: cusGeneralArray.home,
        groupID: cusGeneralArray.groupID,
        factoryID: cusGeneralArray.factoryID,
        joiningDate: cusGeneralArray.joiningDate,
        areaType: cusGeneralArray.areaType,
        area: cusGeneralArray.area == null ? 0 : cusGeneralArray.area
      });

      if (cusGeneralArray.customerID > 0) {
        setFactoryID(cusGeneralArray.factoryID);
        setIsUpdate(true);
      }
      else {
        setIsUpdate(false);
      }
    }
  }

  async function saveCustomerGeneral(values) {

    let general = {
      customerCode: values.customerCode,
      title: values.title,
      firstName: values.firstName,
      middleName: values.middleName,
      lastName: values.lastName,
      gender: values.gender,
      dob: values.dob,
      nic: values.nic,
      address: values.address,
      addresstwo: values.addresstwo,
      addressthree: values.addressthree,
      mobile: values.mobile,
      home: values.home,
      groupID: values.groupID,
      factoryID: values.factoryID,
      areaType: values.areaType,
      area: parseFloat(values.areaType) === 0 ? 0 : values.area,
      joiningDate: values.joiningDate
    }
    btnchecking();
    setCusGeneralArray(general);
    setIsMainButtonEnable(true);
    alert.success("Customer general deatils added.");
  }

  function btnchecking() {
    setBtnDisable(false);
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

  function handleChangeFields(e) {
    const target = e.target;
    const value = target.value

    if (e.target.name === "factoryID") {
      setFactoryID(value);
    }

    setCustomer({
      ...customer,
      [e.target.name]: value
    });
  }

  function handleDateChange(value, field) {
    if (field == "joiningDate") {
      setCustomer({
        ...customer,
        joiningDate: value
      });
    }
    else if (field == "dob") {
      setCustomer({
        ...customer,
        dob: value
      });
    }
  }

  return (
    <Page className={classes.root} title="General Details Add Edit">
      <Container maxWidth={false}>
        <Formik
          initialValues={{
            customerCode: customer.customerCode,
            title: customer.title,
            firstName: customer.firstName,
            middleName: customer.middleName,
            lastName: customer.lastName,
            gender: customer.gender,
            dob: customer.dob,
            nic: customer.nic,
            address: customer.address,
            addresstwo: customer.addresstwo,
            addressthree: customer.addressthree,
            mobile: customer.mobile,
            home: customer.home,
            groupID: customer.groupID,
            factoryID: customer.factoryID,
            joiningDate: customer.joiningDate,
            areaType: customer.areaType,
            area: customer.area
          }}
          validationSchema={
            Yup.object().shape({
              customerCode: Yup.string().max(10, 'Customer code must be at most 10 characters').required('Customer code required').matches(/^[a-zA-Z0-9]*$/, "Special Characters are not allowed for this field"),
              title: Yup.number().max(255).required('Title required').min("1", 'Select a title'),
              firstName: Yup.string().max(50, "First name must be at most 50 characters").required('First name is required').matches(/^[a-zA-Z]+[a-zA-Z.]+[ (a-zA-Z)+]*$/, "Only alphabets are allowed for this field"),
              middleName: Yup.string().max(50, "Middle name must be at most 50 characters").matches(/^[a-zA-Z]+[a-zA-Z.]+[ (a-zA-Z)+]*$/, "Only alphabets are allowed for this field").nullable(),
              lastName: Yup.string().max(50, "Last name must be at most 50 characters").required('Last name is required').matches(/^[a-zA-Z]+[a-zA-Z.]+[ (a-zA-Z)+]*$/, "Only alphabets are allowed for this field"),
              dob: Yup.date().required('DOB is required').typeError('Dob is required'),
              nic: Yup.string().required('NIC is required').matches(/^(\d{9}[vVxX]|\d{12})$/, 'Entered NIC not valid'),
              address: Yup.string().max(75, "Address line 1 must be at most 75 characters").nullable(),
              addresstwo: Yup.string().max(75, "Address line 2 must be at most 75 characters").nullable(),
              addressthree: Yup.string().max(75, "Address line 3 must be at most 75 characters").nullable(),
              mobile: Yup.string().matches(/^[0-9\b]+$/, 'Only allow numbers').min(10,'Mobile number must be at least 10 characters').max(10,"Mobile number must be at most 10 characters").nullable(),
              home: Yup.string().min(10,'Home number must be at least 10 characters').matches(/^[0-9\b]+$/, 'Only allow numbers').nullable(),
              groupID: Yup.number().required('Group required').min("1", 'Select a group'),
              factoryID: Yup.number().required('Factory required').min("1", 'Select a factory'),
              joiningDate: Yup.date().required('Joining Date is required').typeError('Joining date is required'),
              areaType: Yup.number().required('Area type required').min("0", 'Select area type'),
              area: Yup.string().when('areaType', {
                is: (areaType) => areaType > 0,
                then: Yup.string().required('Area required').matches(/^\s*(?=.*[1-9])\d*(?:\.\d{1, 2})?\s*$/, 'Enter valid area.').nullable()
              })
            })
          }
          onSubmit={saveCustomerGeneral}
          enableReinitialize
        >
          {({
            errors,
            handleBlur,
            handleSubmit,
            setFieldValue,
            touched,
            values,
          }) => (
            <form onSubmit={handleSubmit}>
              <Box mt={3}>
                <Card className={classes.cardContent}>
                  <CardHeader
                    title="General Details"
                  />
                  <PerfectScrollbar>
                    <Divider />
                    <CardContent >
                      <Grid container spacing={3}>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="groupID">
                            Group *
                          </InputLabel>
                          <TextField select
                            error={Boolean(touched.groupID && errors.groupID)}
                            fullWidth
                            helperText={touched.groupID && errors.groupID}
                            size='small'
                            name="groupID"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeFields(e)}
                            value={values.groupID}
                            variant="outlined"
                            id="groupID"
                            InputProps={{
                              readOnly: isUpdate || !permissionList.isGroupFilterEnabled ? true : false,
                            }}
                          >
                            <MenuItem value='0'>--Select Group--</MenuItem>
                            {generateDropDownMenu(groups)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="factoryID">
                            Factory *
                          </InputLabel>
                          <TextField select
                            error={Boolean(touched.factoryID && errors.factoryID)}
                            fullWidth
                            helperText={touched.factoryID && errors.factoryID}
                            size='small'
                            name="factoryID"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeFields(e)}
                            value={customer.factoryID}
                            variant="outlined"
                            InputProps={{
                              readOnly: isUpdate || !permissionList.isFactoryFilterEnabled ? true : false,
                            }}
                          >
                            <MenuItem value="0">--Select Factory--</MenuItem>
                            {generateDropDownMenu(factories)}
                          </TextField>
                        </Grid>
                        <Grid item md={2} xs={12}>
                          <InputLabel shrink id="customerCode">
                            Customer Code *
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.customerCode && errors.customerCode)}
                            fullWidth
                            helperText={touched.customerCode && errors.customerCode}
                            size='small'
                            name="customerCode"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeFields(e)}
                            value={values.customerCode}
                            variant="outlined"
                            InputProps={{
                              readOnly: isUpdate ? true : false,
                            }}
                          />
                        </Grid>
                        <Grid item md={2} xs={12}>
                          <InputLabel shrink id="title">
                            Title *
                          </InputLabel>
                          <TextField select fullWidth
                            error={Boolean(touched.title && errors.title)}
                            helperText={touched.title && errors.title}
                            size='small'
                            onBlur={handleBlur}
                            id="title"
                            name="title"
                            value={values.title}
                            type="text"
                            variant="outlined"
                            onChange={(e) => handleChangeFields(e)}
                          >
                            <MenuItem value="0">--Select Title--</MenuItem>
                            <MenuItem value="1">Mr</MenuItem>
                            <MenuItem value="2">Mrs</MenuItem>
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="firstName">
                            First Name *
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.firstName && errors.firstName)}
                            fullWidth
                            helperText={touched.firstName && errors.firstName}
                            size='small'
                            name="firstName"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeFields(e)}
                            value={values.firstName}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="middleName">
                            Middle Name
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.middleName && errors.middleName)}
                            fullWidth
                            helperText={touched.middleName && errors.middleName}
                            size='small'
                            name="middleName"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeFields(e)}
                            value={values.middleName}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="lastName">
                            Last Name *
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.lastName && errors.lastName)}
                            fullWidth
                            helperText={touched.lastName && errors.lastName}
                            size='small'
                            name="lastName"
                            type="lastName"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeFields(e)}
                            value={values.lastName}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="gender">
                            Gender
                          </InputLabel>
                          <TextField select fullWidth
                            error={Boolean(touched.gender && errors.gender)}
                            helperText={touched.gender && errors.gender}
                            size='small'
                            onBlur={handleBlur}
                            id="gender"
                            name="gender"
                            value={
                              values.gender = values.title
                            }
                            type="text"
                            variant="outlined"
                            onChange={(e) => handleChangeFields(e)}>
                            <MenuItem value="0">--Select Gender--</MenuItem>
                            <MenuItem value="1">Male</MenuItem>
                            <MenuItem value="2">Female</MenuItem>
                          </TextField>

                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="dob">
                            DOB *
                          </InputLabel>
                          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                              error={Boolean(touched.dob && errors.dob)}
                              helperText={touched.dob && errors.dob}
                              autoOk
                              fullWidth
                              variant="inline"
                              format="dd/MM/yyyy"
                              margin="dense"
                              id="dob"
                              name="dob"
                              value={values.dob}
                              onChange={(e) => handleDateChange(e, "dob")}
                              KeyboardButtonProps={{
                                'aria-label': 'change date',
                              }}
                              InputProps={{ readOnly: true }}
                            />
                          </MuiPickersUtilsProvider>
                        </Grid>

                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="joiningDate">
                            Joining Date *
                          </InputLabel>
                          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                              error={Boolean(touched.joiningDate && errors.joiningDate)}
                              helperText={touched.joiningDate && errors.joiningDate}
                              autoOk
                              fullWidth
                              variant="inline"
                              format="dd/MM/yyyy"
                              margin="dense"
                              id="joiningDate"
                              name="joiningDate"
                              value={values.joiningDate}
                              onChange={(e) => handleDateChange(e, "joiningDate")}
                              KeyboardButtonProps={{
                                'aria-label': 'change date',
                              }}
                              InputProps={{ readOnly: true }}
                            />
                          </MuiPickersUtilsProvider>
                        </Grid>                      
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="nic">
                            NIC *
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.nic && errors.nic)}
                            fullWidth
                            helperText={touched.nic && errors.nic}
                            size='small'
                            name="nic"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeFields(e)}
                            value={values.nic}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="mobile">
                            Mobile
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.mobile && errors.mobile)}
                            fullWidth
                            helperText={touched.mobile && errors.mobile}
                            size='small'
                            name="mobile"

                            onBlur={handleBlur}
                            onChange={(e) => handleChangeFields(e)}
                            value={values.mobile}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="home">
                            Home
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.home && errors.home)}
                            fullWidth
                            helperText={touched.home && errors.home}
                            size='small'
                            name="home"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeFields(e)}
                            value={values.home}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="address">
                            Address 1
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.address && errors.address)}
                            fullWidth
                            helperText={touched.address && errors.address}
                            size='small'
                            name="address"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeFields(e)}
                            value={values.address}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="addresstwo">
                            Address 2
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.addresstwo && errors.addresstwo)}
                            fullWidth
                            helperText={touched.address && errors.addresstwo}
                            size='small'
                            name="addresstwo"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeFields(e)}
                            value={values.addresstwo}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="addressthree">
                            Address 3
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.addressthree && errors.addressthree)}
                            fullWidth
                            helperText={touched.addressthree && errors.addressthree}
                            size='small'
                            name="addressthree"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeFields(e)}
                            value={values.addressthree}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="areaType">
                            Area Type
                          </InputLabel>
                          <TextField select fullWidth
                            error={Boolean(touched.areaType && errors.areaType)}
                            helperText={touched.areaType && errors.areaType}
                            size='small'
                            onBlur={handleBlur}
                            id="areaType"
                            name="areaType"
                            value={values.areaType}
                            variant="outlined"
                            onChange={(e) => {
                              handleChangeFields(e)
                              if (parseInt(e.target.value) === 0) {
                                setFieldValue('area', '');
                              }
                              setFieldValue('areaType', e.target.value);
                            }}>
                            <MenuItem value="0">--Select Area Type--</MenuItem>
                            <MenuItem value="1">Perch</MenuItem>
                            <MenuItem value="2">Hectare</MenuItem>
                          </TextField>
                        </Grid>
                        {values.areaType > 0 ? <Grid item md={4} xs={12}>
                          <InputLabel shrink id="area">
                            Area Size
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.area && errors.area)}
                            fullWidth
                            helperText={touched.area && errors.area}
                            size='small'
                            name="area"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeFields(e)}
                            value={values.area}
                            variant="outlined"
                          />
                        </Grid> : null}
                      </Grid>
                    </CardContent>
                    <Box display="flex" justifyContent="flex-end" p={2}>
                      <Button
                        color="primary"
                        disabled={btnDisable}
                        type="submit"
                        variant="contained"
                      >
                        Add
                      </Button>
                    </Box>
                  </PerfectScrollbar>
                </Card>
              </Box>
            </form>
          )}
        </Formik>
      </Container>

    </Page >
  );
};
