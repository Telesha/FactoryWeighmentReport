import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  Grid,
  makeStyles,
  Container,
  Button,
  CardContent,
  Divider,
  CardHeader,
  Tabs,
  Tab,
  AppBar,
  Switch,
  InputLabel
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { TabPanel } from './tabPanel';
import { EmployeeGeneral } from '../Pages/TabPages/General';
import { EmployeePayments } from './TabPages/PaymentMethods';
import { MobileAllowEmployee } from './TabPages/MobileAllowEmployee'
import { EmployeeBoimetric } from './TabPages/BioMetrics';
import { EmployeeSupplimentary } from './TabPages/Supplimentary';
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from '../../../utils/newLoader';
import { AlertDialogWithoutButton } from '../../Common/AlertDialogWithoutButton';
import tokenDecoder from '../../../utils/tokenDecoder';
import moment from 'moment';

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
  root1: {
    flexGrow: 4
  },
}));

export default function EmployeeAddEdit() {
  const [title, setTitle] = useState("Add Employee")
  const classes = useStyles();
  const [empGeneralArray, setEmpGeneralArray] = useState([]);
  const [paymentMethodArray, setPaymentMethodArray] = useState([]);
  const [empBiometricArray, setempBiometricArray] = useState([]);
  const [supplimentaryArray, setSupplimentaryArray] = useState([]);
  const [deletedSupplimentaryList, setDeleledSupplimentaryList] = useState([])
  const [standingOrdersArray, setStandingOrdersArray] = useState([]);
  const [standingFundsArray, setStandingFundsArray] = useState([]);
  const [mobileCredentialsArray, setMobileCredentialsArray] = useState([])
  const [onChangefactoryID, setFactoryID] = useState(0);
  const [isFormValid, setIsFormValid] = useState(0);
  const [isMainButtonEnable, setIsMainButtonEnable] = useState(false);
  const [nameAndRegNo, setNameAndRegNo] = useState([]);

  const [employeeIsActive, setEmployeeIsActive] = useState(true);
  const navigate = useNavigate();
  const alert = useAlert();
  const [value, setValue] = React.useState(0);
  const [btnDisable, setBtnDisable] = useState(false);
  const { employeeID } = useParams();
  const [isUpdate, setIsUpdate] = useState(false);
  let decryptedID = 0;
  const [initialCustomer, setInitialCustomer] = useState(true);
  const [decryptedIDForUpdate, setDecryptedIDForUpdate] = useState(true);
  const [dialog, setDialog] = useState(false);

  useEffect(() => {
    if (isMainButtonEnable) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }

  }, [isMainButtonEnable]);

  useEffect(() => {
    decryptedID = atob(employeeID.toString());
    if (decryptedID != 0) {
      setTitle("Edit Employee");
      trackPromise(getEmployeeGeneralDetailsByEmployeeID(decryptedID));
      trackPromise(getEmployeePaymentDetailsByEmployeeID(decryptedID));
      setDecryptedIDForUpdate(decryptedID);
      getEmployeeSupplimentaryDetailsByEmployeeID(decryptedID);
      trackPromise(getEmployeeBioMetricsDetailsByEmployeeID(decryptedID));
      trackPromise(getEmployeeMobileAllowDetailsByEmployeeID(decryptedID));
    }
  }, []);

  async function getEmployeeGeneralDetailsByEmployeeID(employeeID) {
    let response = await services.getEmployeeGeneralDetailsByEmployeeID(employeeID);
    const propertyID = 'haverstingJobTypeID';
    const propertyName = 'haverstingJobTypeName'
    const harvestingJobs = response.map(value => ({ [propertyName]: value.haverstingJobTypeName, [propertyID]: value.employeeHarvestingJobID }));
    let general = {
      employeeCode: response[0].employeeCode,
      titleID: response[0].titleID,
      firstName: response[0].firstName,
      secondName: response[0].secondName,
      lastName: response[0].lastName === null ? '' : response[0].lastName,
      genderID: response[0].genderID,
      dob: response[0].dateOfBirth === null ? '' : moment(response[0].dateOfBirth).format('DD-MM-YYYY'),
      nICNumber: response[0].nicNumber,
      address: response[0].address1,
      addresstwo: response[0].address2,
      addressthree: response[0].address3,
      mobileNumber: response[0].mobileNumber,
      homeNumber: response[0].homeNumber,
      groupID: response[0].groupID,
      factoryID: response[0].operationEntityID,
      isEPFEnable: response[0].isEPFEnable,
      epfNumber: response[0].epfNumber,
      employeeID: response[0].employeeID,
      joiningDate: response[0].joiningDate === null ? '' : response[0].joiningDate.split('T')[0],
      areaType: response[0].areaType === null ? '0' : response[0].areaType,
      area: response[0].area,
      basicDailySalary: response[0].basicDailySalary,
      basicMonthlySalary: response[0].basicMonthlySalary,
      city: response[0].city,
      designationID: response[0].designationID,
      employeeCategoryID: response[0].employeeCategoryID,
      employeeSubCategoryID: response[0].employeeSubCategoryID,
      employeeTypeID: response[0].employeeTypeID,
      otherAllowance: response[0].otherAllowance,
      specialAllowance: response[0].specialAllowance,
      registrationNumber: response[0].registrationNumber,
      email: response[0].email,
      religionID: response[0].religionID,
      raiseID: response[0].raiseID,
      identityTypeID: response[0].employeeTypeID,
      gangID: response[0].gangId,
      employeeDivisionID: response[0].employeeDivisionID,
      bookNumber: response[0].bookNumber === null ? '' : response[0].bookNumber,
      countryID: response[0].countryId,
      haverstingJobTypeID: harvestingJobs[0].haverstingJobTypeID === null ? [] : harvestingJobs,
      statusID: response[0].statusID,
      rationQuantity: response[0].rationQuantity,
      khethLandDeductionQuantity: response[0].khethLandDeductionQuantity,
      employeeSubCategoryMappingID: response[0].employeeSubCategoryMappingID === null ? '0' : response[0].employeeSubCategoryMappingID,
      paymentTypeID: response[0].paymentTypeID === null ? '0' : response[0].paymentTypeID,
      paymentModeID: response[0].paymentModeID === null ? '0' : response[0].paymentModeID,
      specialtyID: response[0].specialtyID === null ? '0' : response[0].specialtyID,

      postalCode: response[0].postalCode === null ? '' : response[0].postalCode,
      postOffice: response[0].postOffice === null ? '' : response[0].postOffice,
      policeStation: response[0].policeStation === null ? '' : response[0].policeStation,
      addressPresent: response[0].addressPresent === null ? '' : response[0].addressPresent,
      dateOfConfirmation: response[0].dateOfConfirmation === null ? null : response[0].dateOfConfirmation,

      workLocationID: response[0].workLocationID,
      payPointID: response[0].payPointID,
      expiredDate: response[0].expiredDate === null ? null : response[0].expiredDate,
      resignedDate: response[0].resignedDate === null ? null : response[0].resignedDate,
      terminatedDate: response[0].terminatedDate === null ? null : response[0].terminatedDate,
      rationCardNumber: response[0].rationCardNumber === null ? "" : response[0].rationCardNumber
    }

    var isActiveResult = response[0].isActive === null ? false : response[0].isActive;
    setEmployeeIsActive(isActiveResult);

    var fullName = (general.firstName == null ? "" : general.firstName) + " " + (general.secondName == null ? "" : general.secondName);
    var regNo = general.registrationNumber;
    setNameAndRegNo([fullName, regNo, employeeID]);

    setEmpGeneralArray(general);
    setIsUpdate(true);
    setInitialCustomer(response[0].isActive)
    setValue(1);
    setValue(0);
  }

  async function getEmployeePaymentDetailsByEmployeeID(employeeID) {
    let response = await services.getEmployeePaymentDetailsByEmployeeID(employeeID);
    setPaymentMethodArray(response);
  }

  async function getEmployeeSupplimentaryDetailsByEmployeeID(employeeID) {
    let response = await services.getEmployeeSupplimentaryDetailsByEmployeeID(employeeID);
    setSupplimentaryArray(response);
  }

  async function getEmployeeStandingOrderDetailsByEmployeeID(employeeID) {
    let response = await services.getEmployeeStandingOrderDetailsByEmployeeID(employeeID);
    setStandingOrdersArray(response)
  }

  async function getEmployeeFundsDetailsByEmployeeID(employeeID) {
    let response = await services.getEmployeeFundsDetailsByEmployeeID(employeeID);
    setStandingFundsArray(response)
  }

  async function getEmployeeBioMetricsDetailsByEmployeeID(employeeID) {
    let response = await services.getEmployeeBioMetricsDetailsByEmployeeID(employeeID);
    for (var i = 0; i < response.length; i++) {
      var newBioArray = empBiometricArray;
      newBioArray.push({
        employeeBiometricData: response[i].employeeBiometricData,
        employeeBiometricID: response[i].employeeBiometricID,
        isDefault: response[i].isDefault
      });
      setempBiometricArray(newBioArray);
    }
  }

  async function getEmployeeMobileAllowDetailsByEmployeeID(employeeID) {
    let response = await services.getEmployeeMobileAllowDetailsByEmployeeID(employeeID);
    setMobileCredentialsArray(response)
  }
  function onIsActiveChange() {
    setEmployeeIsActive(!employeeIsActive);
    setIsMainButtonEnable(true);
  }

  async function saveEmployee() {
    if (empGeneralArray.length <= 0) {
      alert.error('Please fill before save');
    }
    else {
      if (!isUpdate) {
        empGeneralArray.isActive = employeeIsActive;

        let saveModel = {
          employeeGeneralArray: empGeneralArray,
          paymentMethodArray: paymentMethodArray.length === 0 ? null : paymentMethodArray,
          employeeBiometricArray: [],
          supplimentaryArray: supplimentaryArray,
          standingFundsArray: standingFundsArray,
          standingOrdersArray: standingOrdersArray,
          mobileCredentialsArray: mobileCredentialsArray.length === 0 ? null : mobileCredentialsArray
        }
        let response = await services.saveEmployee(saveModel);
        if (response.statusCode == "Success") {
          alert.success(response.message);
          setBtnDisable(true);
          navigate('/app/EmployeeRegistration/listing');
        }
        else {
          alert.error(response.message);
        }
      } else {
        empGeneralArray.isActive = employeeIsActive;

        let updateModel = {
          employeeID: atob(employeeID.toString()),
          employeeGeneralArray: empGeneralArray,
          paymentMethodArray: paymentMethodArray,
          employeeBiometricArray: [],
          supplimentaryArray: supplimentaryArray,
          standingFundsArray: standingFundsArray,
          standingOrdersArray: standingOrdersArray,
          mobileCredentialsArray: mobileCredentialsArray
        }
        const res = await services.DeleteEmployeeSupplimentary(deletedSupplimentaryList, tokenDecoder.getUserIDFromToken());
        let response = await services.updateEmployee(updateModel);
        if (response.statusCode == "Success" && deletedSupplimentaryList.length > 0 ? res > 0 : false || deletedSupplimentaryList.length == 0) {
          alert.success(response.message);
          setBtnDisable(true);
          navigate('/app/EmployeeRegistration/listing');
        }
        else {
          setEmployeeIsActive({
            ...employeeIsActive,
            isActiveResult: initialCustomer
          })
          alert.error(response.message);
        }
      }
    }
  }
  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  function handleClick() {

    if (isUpdate == false) {
      if (empGeneralArray.length != 0) {
        setDialog(true);
      } else {
        navigate('/app/EmployeeRegistration/listing');
      }
    } else {
      navigate('/app/EmployeeRegistration/listing');
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
            onClick={() => handleClick()}
          />
        </Grid>
      </Grid>
    )
  }

  // function supplimentaryTabClick() {
  //   if (isUpdate) {
  //     trackPromise(getEmployeeSupplimentaryDetailsByEmployeeID(decryptedIDForUpdate));
  //   }
  // }

  function EmployeeStandingOrdersFundsTabClick() {
    trackPromise(getEmployeeStandingOrderDetailsByEmployeeID(decryptedIDForUpdate));
    trackPromise(getEmployeeFundsDetailsByEmployeeID(decryptedIDForUpdate));
  }

  async function confirmRequest() {
    navigate('/app/EmployeeRegistration/listing');
  }

  async function cancelRequest() {
    setDialog(false);
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              isActive: employeeIsActive,
            }}
            validationSchema={
              Yup.object().shape({
                isActive: Yup.boolean().required('Is default required'),
              })
            }
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
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid className={classes.root1} item xs={12}>
                            <AppBar position="static">
                              <Tabs value={value} onChange={handleTabChange} variant={'fullWidth'} classes={{ indicator: classes.indicator }}
                                aria-label="simple tabs example" style={{ backgroundColor: "white" }}>
                                <Tab label="General" {...a11yProps(0)} style={{ color: "black" }} />
                                <Tab label="Payment Methods" {...a11yProps(1)} style={{ color: "black" }} />
                                <Tab label="Mobile Allow" {...a11yProps(2)} style={{ color: "black" }} />
                                {isUpdate == true ?
                                  <Tab label="Biometrics" {...a11yProps(3)} style={{ color: "black" }} />
                                  : null}
                                <Tab label="Dependant" {...a11yProps(4)} style={{ color: "black" }} //onClick={() => supplimentaryTabClick()} 
                                />
                                {/* <Tab label="Saving & Funds" {...a11yProps(5)} style={{ color: "black" }} onClick={() => EmployeeStandingOrdersFundsTabClick()} /> */}
                              </Tabs>
                            </AppBar>
                            <TabPanel value={value} index={0} >
                              <EmployeeGeneral empGeneralArray={empGeneralArray} setEmpGeneralArray={setEmpGeneralArray} setFactoryID={setFactoryID}
                                setIsMainButtonEnable={setIsMainButtonEnable} nameAndRegNo={nameAndRegNo} />
                            </TabPanel>
                            <TabPanel value={value} index={1} >
                              <EmployeePayments paymentMethodArray={paymentMethodArray} setPaymentMethodArray={setPaymentMethodArray}
                                setIsMainButtonEnable={setIsMainButtonEnable} nameAndRegNo={nameAndRegNo} />
                            </TabPanel>
                            <TabPanel value={value} index={2} >
                              <MobileAllowEmployee mobileCredentialsArray={mobileCredentialsArray} setMobileCredentialsArray={setMobileCredentialsArray}
                                setIsMainButtonEnable={setIsMainButtonEnable} nameAndRegNo={nameAndRegNo} />
                            </TabPanel>
                            {isUpdate == true ?
                              <TabPanel value={value} index={3} >
                                <EmployeeBoimetric empBiometricArray={empBiometricArray} setempBiometricArray={setempBiometricArray}
                                  setIsMainButtonEnable={setIsMainButtonEnable} nameAndRegNo={nameAndRegNo} />
                              </TabPanel>
                              : null}
                            <TabPanel value={value} index={isUpdate == true ? 4 : 3} >
                              <EmployeeSupplimentary supplimentaryArray={supplimentaryArray} setSupplimentaryArray={setSupplimentaryArray}
                                setIsMainButtonEnable={setIsMainButtonEnable} setEmployee={atob(employeeID.toString())} nameAndRegNo={nameAndRegNo} setDeleledSupplimentaryList={setDeleledSupplimentaryList} empGeneralArray={empGeneralArray} />
                            </TabPanel>
                            {/* <TabPanel value={value} index={5} >
                              <EmployeeStandingOrdersFunds standingOrdersArray={standingOrdersArray} setStandingOrdersArray={setStandingOrdersArray}
                                standingFundsArray={standingFundsArray} setStandingFundsArray={setStandingFundsArray}
                                onChangefactoryID={onChangefactoryID} setIsMainButtonEnable={setIsMainButtonEnable} />
                            </TabPanel> */}
                          </Grid>
                        </Grid>
                      </CardContent>
                      <Grid container spacing={0} >
                        <Grid item md={1} xs={12} style={{ marginLeft: '5rem' }}>
                          <InputLabel id="isActive">
                            Active
                          </InputLabel>
                          <Switch
                            error={Boolean(touched.isActive && errors.isActive)}
                            helperText={touched.isActive && errors.isActive}
                            checked={employeeIsActive}
                            onBlur={handleBlur}
                            onChange={onIsActiveChange}
                            name="isActive"
                          />
                        </Grid>
                      </Grid>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          color="primary"
                          disabled={(isUpdate ? false : (btnDisable)) || !isFormValid}
                          type="submit"
                          variant="contained"
                          onClick={() => trackPromise(saveEmployee())}
                          style={{ marginTop: '-2rem', marginBottom: '2rem', marginRight: '3rem' }}
                        >
                          {isUpdate ? "Update" : "Save"}
                        </Button>
                      </Box>
                    </PerfectScrollbar>
                  </Card>
                </Box>
                {dialog ?
                  <AlertDialogWithoutButton confirmData={confirmRequest} cancelData={cancelRequest}
                    headerMessage={"Employee Registration"}
                    discription={"Added employee details will be not save, Are you sure you want to leave?"} />
                  : null
                }
              </form>
            )}
          </Formik>
        </Container>
      </Page>
    </Fragment>
  );
};
