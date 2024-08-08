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
import { LoadingComponent } from '../../../../utils/newLoader';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import { AgriGenERPEnum } from 'src/views/Common/AgriGenERPEnum/AgriGenERPEnum';
import Autocomplete from '@material-ui/lab/Autocomplete';

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

const screenCode = "EMPLOYEEREGISTRATION";

export function EmployeeGeneral({ empGeneralArray, setEmpGeneralArray, setFactoryID, setIsMainButtonEnable, nameAndRegNo }) {
  const agriGenERPEnum = new AgriGenERPEnum();
  const classes = useStyles();
  const [btnDisable, setBtnDisable] = useState(false);
  const [isClear, setIsClear] = useState(false);
  const [employee, setEmployee] = useState({
    groupID: '0',
    factoryID: '0',
    titleID: '0',
    genderID: '0',
    firstName: '',
    lastName: '',
    dob: null,
    address: '',
    addresstwo: '',
    addressthree: '',
    mobileNumber: '',
    homeNumber: '',
    joiningDate: null,
    areaType: '0',
    area: '',
    employeeTypeID: '0',
    employeeCategoryID: '2',
    employeeSubCategoryID: '3',
    employeeSubCategoryMappingID: '0',
    employeeDivisionID: '0',
    designationID: '0',
    employeeCode: '',
    registrationNumber: '',
    isEPFEnable: '-1',
    epfNumber: '',
    nICNumber: '',
    secondName: '',
    city: '',
    email: '',
    basicMonthlySalary: '0',
    basicDailySalary: '',
    specialAllowance: '',
    otherAllowance: '',
    religionID: '0',
    raiseID: '0',
    identityTypeID: '1',
    countryID: '1',
    gangID: '0',
    bookNumber: '',
    statusID: '0',
    retiredDate: null,
    rationQuantity: '',
    khethLandDeductionQuantity: '',
    paymentTypeID: '0',
    paymentModeID: '0',
    specialtyID: '0',
    postalCode: '',
    postOffice: '',
    policeStation: '',
    addressPresent: '',
    dateOfConfirmation: null,
    workLocationID: '0',
    payPointID: '0',
    expiredDate: null,
    resignedDate: null,
    terminatedDate: null,
    rationCardNumber: ''
  });
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [routes, setRoutes] = useState();
  const [isUpdate, setIsUpdate] = useState(false);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const [employeeType, setEmployeeType] = useState(null)
  const [employeeCategory, setEmployeeCategory] = useState();
  const [employeeSubCategory, setEmployeeSubCategory] = useState();
  const [employeeSubCategoryMapping, setEmployeeSubCategoryMapping] = useState();
  const [divisions, setDivisions] = useState();
  const [payPoints, setPayPoints] = useState([]);
  const [workLocation, setWorkLocation] = useState([]);
  const [employeePaymentMode, setEmployeePaymentMode] = useState();
  const [employeePaymentType, setEmployeePaymentType] = useState();
  const [employeeTitles, setEmployeeTitles] = useState();
  const [employeeReligions, setEmployeeReligions] = useState();
  const [employeeRaises, setEmployeeRaises] = useState();
  const [employeeCountries, setEmployeeCountries] = useState();
  const [harvestingJobs, setHarvestingJobs] = useState([])
  const [designations, setDesignations] = useState([])
  const [options, setOptions] = useState([]);
  const [gangs, setGangs] = useState([]);
  const navigate = useNavigate();
  const alert = useAlert();

  useEffect(() => {
    trackPromise(
      getPermission(),
    );
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoriesForDropDown(),
    )
  }, [employee.groupID]);

  useEffect(() => {
    if (employee.employeeSubCategoryID > 0) {
      trackPromise(
        getDivisionsForDropDown(),
      )
    }
  }, [employee.employeeSubCategoryID, employee.factoryID]);

  useEffect(() => {
    trackPromise(
      getRoutesForDropDown(),
    )
  }, [employee.factoryID]);

  useEffect(() => {
    trackPromise(getGangDetailsByDivisionID());
  }, [employee.employeeDivisionID]);

  useEffect(() => {
    if (employeeType != null) {
      for (const [key, value] of Object.entries(employeeType)) {
        if (employee.employeeTypeID == key && value.code == "01") {
          setEmployee({
            ...employee,
            isEPFEnable: '1'
          })
          return;
        }
        else if (employee.employeeTypeID == '0') {
          setEmployee({
            ...employee,
            isEPFEnable: '-1'
          })
        }
        else {
          setEmployee({
            ...employee,
            isEPFEnable: '0'
          })
        }
      }
    }
  }, [employee.employeeTypeID])

  useEffect(() => {
    setIsClear(!isClear);
    // setHarvestingJobs([])
    trackPromise(GetHarvestingJobsForDropDown());
  }, [employee.factoryID, employee.employeeTypeID])

  useEffect(() => {
    trackPromise(getEmployeeSubCategoryMappingForDropdown());
  }, [employee.employeeCategoryID, employee.employeeTypeID])

  useEffect(() => {
    trackPromise(
      getDesignationsForDropDown()
    )
  }, [employee.employeeSubCategoryMappingID])

  useEffect(() => {
    trackPromise(
      GetDivisionDetailsByGroupID()
    )
  }, [employee.groupID])

  useEffect(() => {
    if (Object.keys(empGeneralArray).length == 0) {
      if (employee.workLocationID > 0) {
        setEmployee((preState) => ({
          ...preState,
          workLocationID: employee.workLocationID,
          payPointID: employee.workLocationID
        }))
      }
    }
  }, [employee.workLocationID])

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITEMPLOYEEREGISTRATION');

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

    setEmployee({
      ...employee,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    });

    setFactoryID(tokenService.getFactoryIDFromToken());
    trackPromise(getGroupsForDropdown());
    trackPromise(setGeneralValues());
    trackPromise(
      getEmployeeTypesForDropdown(),
      getEmployeeCategoriesForDropdown(),
      getEmployeeSubCategoriesForDropdown(),
      GetEmployeePaymentMode(),
      GetEmployeePaymentType(),
      getTitlesForDropDown(),
      getEmployeeReligions(),
      getEmployeeRaises(),
      GetEmployeeCountries()
    )
  }

  async function GetHarvestingJobsForDropDown() {
    const harvestingJobFromDB = await services.GetHarvestingJobsByEmployeeType(employee.employeeTypeID, employee.factoryID);
    if (!isUpdate) {
      setOptions(harvestingJobFromDB);
    } else {
      const harvestingIDArray = harvestingJobs.map(job => job.haverstingJobTypeID)
      let filteredArray = harvestingJobFromDB.filter(obj => !harvestingIDArray.includes(obj.haverstingJobTypeID));
      setOptions(filteredArray)
    }
  }
  async function getRoutesForDropDown() {
    const routeList = await services.getRoutesForDropDown(employee.factoryID);
    setRoutes(routeList);
  }

  async function getFactoriesForDropDown() {
    const factoryList = await services.getFactoryByGroupID(employee.groupID);
    setFactories(factoryList);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }
  async function getEmployeeTypesForDropdown() {
    const types = await services.getEmployeeTypesForDropdown();
    setEmployeeType(types);
  }
  async function getEmployeeCategoriesForDropdown() {
    const result = await services.getEmployeeCategoriesForDropdown();
    setEmployeeCategory(result)
  }
  async function getEmployeeSubCategoriesForDropdown() {
    const result = await services.getEmployeeSubCategoriesForDropdown();
    setEmployeeSubCategory(result)
  }
  async function getEmployeeSubCategoryMappingForDropdown() {
    const result = await services.getEmployeeSubCategoryMappingForDropdown(employee.employeeTypeID, employee.employeeCategoryID);
    setEmployeeSubCategoryMapping(result)
  }
  async function GetEmployeePaymentMode() {
    const result = await services.GetEmployeePaymentMode();
    setEmployeePaymentMode(result)
  }
  async function GetEmployeePaymentType() {
    const result = await services.GetEmployeePaymentType();
    setEmployeePaymentType(result)
  }
  async function getTitlesForDropDown() {
    const result = await services.getTitlesForDropDown();
    setEmployeeTitles(result)
  }
  async function getEmployeeReligions() {
    const result = await services.getEmployeeReligions();
    setEmployeeReligions(result)
  }
  async function getEmployeeRaises() {
    const result = await services.getEmployeeRaises();
    setEmployeeRaises(result)
  }
  async function GetEmployeeCountries() {
    const result = await services.GetEmployeeCountries();
    setEmployeeCountries(result)
  }
  async function GetDivisionDetailsByGroupID() {
    const result = await services.GetDivisionDetailsByGroupID(employee.groupID);
    setPayPoints(result)
    setWorkLocation(result)
  }
  async function getDivisionsForDropDown() {
    const divisions = await services.getDivisionDetailsByEstateID(parseInt(employee.factoryID));
    setDivisions(divisions);
  }
  async function getDesignationsForDropDown() {
    const designations = await services.getDesignationsByEmployeeCategoryID(employee.employeeSubCategoryMappingID);
    setDesignations(designations);
  }
  async function getGangDetailsByDivisionID() {
    var response = await services.getGangDetailsByDivisionID(employee.employeeDivisionID);
    setGangs(response);
  };
  async function setGeneralValues() {
    if (empGeneralArray.haverstingJobTypeID) {
      setHarvestingJobs(empGeneralArray.haverstingJobTypeID)
    } else {
      setHarvestingJobs([])
    }
    if (Object.keys(empGeneralArray).length > 0) {
      setEmployee({
        ...employee,
        titleID: empGeneralArray.titleID,
        firstName: empGeneralArray.firstName,
        lastName: empGeneralArray.lastName,
        genderID: empGeneralArray.genderID,
        dob: empGeneralArray.dob,
        nic: empGeneralArray.nic,
        retiredDate: empGeneralArray.retiredDate,
        address: empGeneralArray.address,
        addresstwo: empGeneralArray.addresstwo,
        addressthree: empGeneralArray.addressthree,
        groupID: empGeneralArray.groupID,
        factoryID: empGeneralArray.factoryID,
        joiningDate: empGeneralArray.joiningDate,
        areaType: empGeneralArray.areaType,
        area: empGeneralArray.area == null ? 0 : empGeneralArray.area,

        employeeTypeID: empGeneralArray.employeeTypeID,
        employeeCategoryID: empGeneralArray.employeeCategoryID,
        employeeSubCategoryID: empGeneralArray.employeeSubCategoryID,
        designationID: empGeneralArray.designationID,
        employeeCode: empGeneralArray.employeeCode,
        registrationNumber: empGeneralArray.registrationNumber,
        isEPFEnable: empGeneralArray.isEPFEnable,
        epfNumber: empGeneralArray.epfNumber,
        nICNumber: empGeneralArray.nICNumber,
        secondName: empGeneralArray.secondName,
        city: empGeneralArray.city,
        homeNumber: empGeneralArray.homeNumber,
        mobileNumber: empGeneralArray.mobileNumber,
        email: empGeneralArray.email,
        basicMonthlySalary: empGeneralArray.basicMonthlySalary,
        basicDailySalary: empGeneralArray.basicDailySalary,
        specialAllowance: empGeneralArray.specialAllowance,
        otherAllowance: empGeneralArray.otherAllowance,
        religionID: empGeneralArray.religionID,
        raiseID: empGeneralArray.raiseID,
        identityTypeID: empGeneralArray.identityTypeID,
        countryID: empGeneralArray.countryID,
        employeeDivisionID: empGeneralArray.employeeDivisionID,
        gangID: empGeneralArray.gangID,
        bookNumber: empGeneralArray.bookNumber,
        statusID: empGeneralArray.statusID,
        rationQuantity: empGeneralArray.rationQuantity,
        khethLandDeductionQuantity: empGeneralArray.khethLandDeductionQuantity,

        employeeSubCategoryMappingID: empGeneralArray.employeeSubCategoryMappingID,
        paymentTypeID: empGeneralArray.paymentTypeID,
        paymentModeID: empGeneralArray.paymentModeID,
        specialtyID: empGeneralArray.specialtyID,

        postalCode: empGeneralArray.postalCode,
        postOffice: empGeneralArray.postOffice,
        policeStation: empGeneralArray.policeStation,
        addressPresent: empGeneralArray.addressPresent,
        dateOfConfirmation: empGeneralArray.dateOfConfirmation,

        workLocationID: empGeneralArray.workLocationID,
        payPointID: empGeneralArray.payPointID,

        expiredDate: empGeneralArray.expiredDate,
        resignedDate: empGeneralArray.resignedDate,
        terminatedDate: empGeneralArray.terminatedDate,
        rationCardNumber: empGeneralArray.rationCardNumber
      });

      if (empGeneralArray.employeeID > 0) {
        setFactoryID(empGeneralArray.factoryID);
        setIsUpdate(true);
      }
      else {
        setIsUpdate(false);
      }
    }
  }

  async function saveEmployeeGeneral(values) {
    let general = {
      titleID: values.titleID,
      firstName: values.firstName,
      lastName: values.lastName,
      genderID: values.genderID,
      dob: values.dob,
      nic: values.nic,
      address: values.address,
      addresstwo: values.addresstwo,
      addressthree: values.addressthree,
      mobileNumber: values.mobileNumber,
      groupID: values.groupID,
      factoryID: values.factoryID,
      areaType: values.areaType,
      area: parseFloat(values.areaType) === 0 ? 0 : values.area,
      joiningDate: values.joiningDate,
      retiredDate: values.retiredDate,
      employeeTypeID: values.employeeTypeID,
      employeeCategoryID: values.employeeCategoryID,
      employeeSubCategoryID: values.employeeSubCategoryID,
      designationID: values.designationID,
      employeeCode: values.employeeCode,
      registrationNumber: values.registrationNumber,
      isEPFEnable: values.isEPFEnable,
      epfNumber: values.epfNumber,
      nICNumber: values.nICNumber,
      secondName: values.secondName,
      city: values.city,
      homeNumber: values.homeNumber,
      email: values.email,
      basicMonthlySalary: values.basicMonthlySalary,
      basicDailySalary: values.basicDailySalary,
      specialAllowance: values.specialAllowance,
      otherAllowance: values.otherAllowance,
      religionID: values.religionID,
      raiseID: values.raiseID,
      countryID: values.countryID,
      employeeDivisionID: values.employeeDivisionID,
      gangID: values.gangID,
      bookNumber: values.bookNumber,
      haverstingJobTypeID: harvestingJobs,//.length>0?harvestingJobs.map(job => job.haverstingJobTypeID):[],
      identityTypeID: values.identityTypeID,
      statusID: values.statusID,
      rationQuantity: values.rationQuantity,
      khethLandDeductionQuantity: values.khethLandDeductionQuantity,

      employeeSubCategoryMappingID: values.employeeSubCategoryMappingID,
      paymentTypeID: values.paymentTypeID,
      paymentModeID: values.paymentModeID,
      specialtyID: values.specialtyID,

      postalCode: values.postalCode,
      postOffice: values.postOffice,
      policeStation: values.policeStation,
      addressPresent: values.addressPresent,
      dateOfConfirmation: values.dateOfConfirmation,

      workLocationID: values.workLocationID,
      payPointID: values.payPointID,
      expiredDate: values.expiredDate,
      resignedDate: values.resignedDate,
      terminatedDate: values.terminatedDate,
      rationCardNumber: values.rationCardNumber
    }
    btnchecking();
    setEmpGeneralArray(general);
    setIsMainButtonEnable(true);
    alert.success("Employee general deatils added.");
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
  function generateDropDownMenuWithTwoValues(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value.name}</MenuItem>);
      }
    }
    return items
  }
  const handleChangeHarvestingJob = (event, value) => {
    const haverstingJobTypeIDs = value.map(obj => obj.haverstingJobTypeID);
    setHarvestingJobs(value)
  };
  function handleChangeForm(e) {
    const target = e.target;
    const value = target.value

    if (e.target.name === "factoryID") {
      setFactoryID(value);
    }

    setEmployee({
      ...employee,
      [e.target.name]: value
    });
  }

  function handleDateChange(value, field) {
    if (field == "joiningDate") {
      setEmployee({
        ...employee,
        joiningDate: value
      });
    }
    else if (field == "dob") {
      setEmployee({
        ...employee,
        dob: value
      });
    }
    else if (field == "retiredDate") {
      setEmployee({
        ...employee,
        retiredDate: value
      })
    }
    else if (field == "dateOfConfirmation") {
      setEmployee({
        ...employee,
        dateOfConfirmation: value
      })
    }
    else if (field == "expiredDate") {
      setEmployee({
        ...employee,
        expiredDate: value
      })
    }
    else if (field == "resignedDate") {
      setEmployee({
        ...employee,
        resignedDate: value
      })
    }
    else if (field == "terminatedDate") {
      setEmployee({
        ...employee,
        terminatedDate: value
      })
    }
  }

  //For DOB Date Automatic '/' Appears
  const formatAsDate = (input) => {
    if (!input) return '';
    const cleanedInput = input.replace(/[^\d]/g, '');
    if (cleanedInput.length > 4) {
      return `${cleanedInput.slice(0, 2)}/${cleanedInput.slice(2, 4)}/${cleanedInput.slice(4, 8)}`;
    } else if (cleanedInput.length > 2) {
      return `${cleanedInput.slice(0, 2)}/${cleanedInput.slice(2)}`;
    } else {
      return cleanedInput;
    }
  };

  return (
    <Page className={classes.root} title="Employee General Details Add Edit">
      <Container maxWidth={false}>
        <LoadingComponent />
        <Formik
          initialValues={{
            titleID: employee.titleID,
            firstName: employee.firstName,
            lastName: employee.lastName,
            genderID: employee.genderID,
            dob: employee.dob,
            address: employee.address,
            addresstwo: employee.addresstwo,
            addressthree: employee.addressthree,
            groupID: employee.groupID,
            factoryID: employee.factoryID,
            joiningDate: employee.joiningDate,
            retiredDate: employee.retiredDate,
            areaType: employee.areaType,
            area: employee.area,
            employeeTypeID: employee.employeeTypeID,
            employeeCategoryID: employee.employeeCategoryID,
            employeeSubCategoryID: employee.employeeSubCategoryID,
            employeeSubCategoryMappingID: employee.employeeSubCategoryMappingID,
            paymentTypeID: employee.paymentTypeID,
            paymentModeID: employee.paymentModeID,
            designationID: employee.designationID,
            employeeCode: employee.employeeCode,
            registrationNumber: employee.registrationNumber,
            isEPFEnable: employee.isEPFEnable,
            epfNumber: employee.epfNumber,
            nICNumber: employee.nICNumber,
            secondName: employee.secondName,
            city: employee.city,
            homeNumber: employee.homeNumber,
            mobileNumber: employee.mobileNumber,
            email: employee.email,
            basicMonthlySalary: employee.basicMonthlySalary,
            basicDailySalary: employee.basicDailySalary,
            specialAllowance: employee.specialAllowance,
            otherAllowance: employee.otherAllowance,
            religionID: employee.religionID,
            raiseID: employee.raiseID,
            empGeneralArray: employee.identityTypeID,
            countryID: employee.countryID,
            employeeDivisionID: employee.employeeDivisionID,
            gangID: employee.gangID,
            bookNumber: employee.bookNumber,
            identityTypeID: employee.identityTypeID,
            statusID: employee.statusID,
            rationQuantity: employee.rationQuantity,
            khethLandDeductionQuantity: employee.khethLandDeductionQuantity,
            specialtyID: employee.specialtyID,
            postalCode: employee.postalCode,
            postOffice: employee.postOffice,
            policeStation: employee.policeStation,
            addressPresent: employee.addressPresent,
            dateOfConfirmation: employee.dateOfConfirmation,
            expiredDate: employee.expiredDate,
            resignedDate: employee.resignedDate,
            terminatedDate: employee.terminatedDate,
            workLocationID: employee.workLocationID,
            payPointID: employee.payPointID,
            rationCardNumber: employee.rationCardNumber
          }}
          validationSchema={
            Yup.object().shape({
              firstName: Yup.string().max(50, "First Name must be at most 50 characters").required('First Name is required'),
              lastName: Yup.string().max(50, "Last Name must be at most 50 characters"),
              mobileNumber: Yup.string().max(10, "Mobile number must be at most 10 characters").required('Mobile number is required').matches(/^[0-9\b]+$/, 'Only allow numbers').nullable(),
              groupID: Yup.number().required('Business Division required').min("1", 'Select a Business Division'),
              factoryID: Yup.number().required('Location required').min("1", 'Select a Location'),
              employeeTypeID: Yup.number().required('Employee Type is required').min("1", 'Select an employee type'),
              employeeCategoryID: Yup.number().required('Employee Category is required').min("1", 'Select an employee category'),
              employeeSubCategoryID: Yup.number().required('Employee Unit is required').min("1", 'Select an Employee Unit'),
              employeeSubCategoryMappingID: Yup.number().required('Employee Sub Category is required').min("1", 'Select an Employee Sub Category'),
              paymentTypeID: Yup.number().required('Payment Type is required').min("1", 'Select an Payment Type'),
              paymentModeID: Yup.number().required('Payment Mode is required').min("1", 'Select an Payment Mode'),
              designationID: Yup.number().required('Designation is required').min("1", 'Select a designation'),
              employeeCode: Yup.string().required('Employee Code is required').matches(/^[^-\s].*/, 'Can Not Start With Spaces'),
              registrationNumber: Yup.string().required('Registration Number is required').matches(/^[^-\s].*/, 'Can Not Start With Spaces'),
              isEPFEnable: Yup.number().required('PF mode is required').min("-1", 'Select an PF mode'),
              nICNumber: Yup.string().required('NIC number is required').matches(/^[^-\s].*/, 'Can Not Start With Spaces'),
              areaType: Yup.number().required('Area type required').min("0", 'Select area type'),
              mobileNumber: Yup.string().matches(/^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/, 'Please enter valid phone number').
                min(15, "Enter number is too short").max(15, "Entered number is too long").nullable(),
              homeNumber: Yup.string().matches(/^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/, 'Please enter valid phone number').
                min(15, "Enter number is too short").max(15, "Entered number is too long").nullable(),
              email: Yup.string().email('Please enter a valid email').nullable(),
              basicMonthlySalary: Yup.string().typeError('Please enter a valid amount').nullable().matches(/^[0-9]*(\.[0-9]{0,2})?$/, 'Enter valid amount.'),
              basicDailySalary: Yup.string().typeError('Please enter a valid amount').nullable().matches(/^[0-9]*(\.[0-9]{0,2})?$/, 'Enter valid amount.'),
              specialAllowance: Yup.string().typeError('Please enter a valid amount').nullable().matches(/^[0-9]*(\.[0-9]{0,2})?$/, 'Enter valid amount.'),
              otherAllowance: Yup.string().typeError('Please enter a valid amount').nullable().matches(/^[0-9]*(\.[0-9]{0,2})?$/, 'Enter valid amount.'),
              area: Yup.string().when('areaType', {
                is: (areaType) => areaType > 0,
                then: Yup.string().required('Area required').matches(/^\s*(?=.*[1-9])\d*(?:\.\d{1,3})?\s*$/, 'Enter valid area.').nullable()
              }),
              employeeDivisionID: Yup.number().required('Employee Sub Division required').min("1", 'Select a Employee Sub Division'),
              gangID: Yup.number().required('Duffa is required').min("1", 'Select a duffa'),
              specialtyID: Yup.number().required('Specialty is required').min("1", 'Select a Specialty'),
              joiningDate: Yup.date().typeError('Invalid date').nullable(),
              retiredDate: Yup.date().typeError('Invalid date').nullable(),
              expiredDate: Yup.date().typeError('Invalid date').nullable(),
              resignedDate: Yup.date().typeError('Invalid date').nullable(),
              terminatedDate: Yup.date().typeError('Invalid date').nullable(),
              // retiredDate: Yup.date().when('retiredDate',{
              //   is: (employeeTypeID) => employeeTypeID == 5,
              //   then: Yup.date().typeError('Invalid date').nullable()
              // })
              rationQuantity: Yup.string().typeError('Please enter a valid amount').nullable().matches(/^[0-9]*(\.[0-9]{0,2})?$/, 'Enter valid amount.'),
              khethLandDeductionQuantity: Yup.string().typeError('Please enter a valid amount').nullable().matches(/^[0-9]*(\.[0-9]{0,2})?$/, 'Enter valid amount.'),
              workLocationID: Yup.number().required('Work Location is required').min("1", 'Select a Work Location'),
              payPointID: Yup.number().required('Pay Point is required').min("1", 'Select a Pay Point'),
              rationCardNumber:employee.employeeTypeID == 1? Yup.string().required('Ration Card Nmber is required').typeError('Enter valid ration card number').max(10, 'Ration number is too long').matches(/^[^-\s].*/, 'Can Not Start With Spaces').matches(/^[a-zA-Z0-9]*$/, 'Only numbers and charaters are allowed'):null
            })
          }
          onSubmit={(values) => trackPromise(saveEmployeeGeneral(values))}
          enableReinitialize
        >
          {({
            errors,
            handleBlur,
            handleChange,
            handleSubmit,
            isSubmitting,
            setFieldValue,
            touched,
            values,
            isValid,
            dirty
          }) => (
            <form onSubmit={handleSubmit}>
              {(nameAndRegNo.length > 0) ?
                <Grid container spacing={3}>
                  <Grid item md={4} xs={12}>Employee Name : {nameAndRegNo[0]}</Grid>
                  <Grid item md={4} xs={12}>Registration Number : {nameAndRegNo[1]}</Grid>
                </Grid>
                : null}
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
                            Business Division *
                          </InputLabel>
                          <TextField select
                            error={Boolean(touched.groupID && errors.groupID)}
                            fullWidth
                            helperText={touched.groupID && errors.groupID}
                            size='small'
                            name="groupID"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.groupID}
                            variant="outlined"
                            id="groupID"
                            InputProps={{
                              readOnly: isUpdate || !permissionList.isGroupFilterEnabled ? true : false,
                            }}
                          >
                            <MenuItem value='0'>--Select Business Division--</MenuItem>
                            {generateDropDownMenu(groups)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
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
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.factoryID}
                            variant="outlined"
                            InputProps={{
                              readOnly: isUpdate || !permissionList.isFactoryFilterEnabled ? true : false,
                            }}
                          >
                            <MenuItem value="0">--Select Location--</MenuItem>
                            {generateDropDownMenu(factories)}
                          </TextField>
                        </Grid>
                        {employee.employeeSubCategoryID == agriGenERPEnum.EmployeeSubCategory.Division ?
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="employeeDivisionID">
                              Employee Sub Division *
                            </InputLabel>
                            <TextField select fullWidth
                              error={Boolean(touched.employeeDivisionID && errors.employeeDivisionID)}
                              helperText={touched.employeeDivisionID && errors.employeeDivisionID}
                              size='small'
                              onBlur={handleBlur}
                              id="employeeDivisionID"
                              name="employeeDivisionID"
                              value={employee.employeeDivisionID}
                              type="text"
                              variant="outlined"
                              onChange={(e) => handleChangeForm(e)}
                            >
                              <MenuItem value='0'>--Select Employee Sub Division--</MenuItem>
                              {generateDropDownMenu(divisions)}
                            </TextField>
                          </Grid> : null}
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="employeeTypeID">
                            Employee Type *
                          </InputLabel>
                          <TextField select fullWidth
                            error={Boolean(touched.employeeTypeID && errors.employeeTypeID)}
                            helperText={touched.employeeTypeID && errors.employeeTypeID}
                            size='small'
                            onBlur={handleBlur}
                            id="employeeTypeID"
                            name="employeeTypeID"
                            value={employee.employeeTypeID}
                            type="text"
                            variant="outlined"
                            onChange={(e) => handleChangeForm(e)}
                          >
                            <MenuItem value="0">--Select Employee Type--</MenuItem>
                            {generateDropDownMenuWithTwoValues(employeeType)}
                          </TextField>
                        </Grid>
                        {employee.employeeTypeID == 5 ?
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="retiredDate" style={{ marginBottom: '-8px' }}>
                              Retired Date *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                error={Boolean(touched.retiredDate && errors.retiredDate)}
                                helperText={touched.retiredDate && errors.retiredDate}
                                autoOk
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                inputVariant="outlined"
                                id="retiredDate"
                                name="retiredDate"
                                value={employee.retiredDate}
                                onChange={(e) => handleDateChange(e, "retiredDate")}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                          : null}

                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="employeeCategoryID">
                            Employee Category *
                          </InputLabel>
                          <TextField select fullWidth
                            error={Boolean(touched.employeeCategoryID && errors.employeeCategoryID)}
                            helperText={touched.employeeCategoryID && errors.employeeCategoryID}
                            size='small'
                            onBlur={handleBlur}
                            id="employeeCategoryID"
                            name="employeeCategoryID"
                            value={employee.employeeCategoryID}
                            type="text"
                            variant="outlined"
                            onChange={(e) => handleChangeForm(e)}
                          >
                            <MenuItem value="0">--Select Employee Category--</MenuItem>
                            {generateDropDownMenuWithTwoValues(employeeCategory)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="employeeSubCategoryMappingID">
                            Employee Sub Category *
                          </InputLabel>
                          <TextField select fullWidth
                            error={Boolean(touched.employeeSubCategoryMappingID && errors.employeeSubCategoryMappingID)}
                            helperText={touched.employeeSubCategoryMappingID && errors.employeeSubCategoryMappingID}
                            size='small'
                            onBlur={handleBlur}
                            id="employeeSubCategoryMappingID"
                            name="employeeSubCategoryMappingID"
                            value={employee.employeeSubCategoryMappingID}
                            type="text"
                            variant="outlined"
                            onChange={(e) => handleChangeForm(e)}
                          >
                            <MenuItem value="0">--Select Employee Sub Category--</MenuItem>
                            {generateDropDownMenu(employeeSubCategoryMapping)}
                          </TextField>
                        </Grid>
                        {/* <Grid item md={4} xs={12}>
                          <InputLabel shrink id="employeeSubCategoryID">
                            Employee Unit *
                          </InputLabel>
                          <TextField select fullWidth
                            error={Boolean(touched.employeeSubCategoryID && errors.employeeSubCategoryID)}
                            helperText={touched.employeeSubCategoryID && errors.employeeSubCategoryID}
                            size='small'
                            onBlur={handleBlur}
                            id="employeeSubCategoryID"
                            name="employeeSubCategoryID"
                            value={employee.employeeSubCategoryID}
                            type="text"
                            variant="outlined"
                            onChange={(e) => handleChangeForm(e)}
                          >
                            <MenuItem value="0">--Select Employee Unit--</MenuItem>
                            {generateDropDownMenu(employeeSubCategory)}
                          </TextField>
                        </Grid> */}

                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="designationID">
                            Designation *
                          </InputLabel>
                          <TextField select fullWidth
                            error={Boolean(touched.designationID && errors.designationID)}
                            helperText={touched.designationID && errors.designationID}
                            size='small'
                            onBlur={handleBlur}
                            id="designationID"
                            name="designationID"
                            value={employee.designationID}
                            type="text"
                            variant="outlined"
                            onChange={(e) => handleChangeForm(e)}
                          >
                            <MenuItem value="0">--Select Designation--</MenuItem>
                            {generateDropDownMenu(designations)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="gangID">
                            Duffa *
                          </InputLabel>
                          <TextField select fullWidth
                            error={Boolean(touched.gangID && errors.gangID)}
                            helperText={touched.gangID && errors.gangID}
                            name="gangID"
                            onBlur={handleBlur}
                            size='small'
                            onChange={(e) => {
                              handleChangeForm(e)
                            }}
                            value={employee.gangID}
                            variant="outlined"
                            id="gangID"
                          >
                            <MenuItem value={'0'}>--Select Duffa--</MenuItem>
                            {generateDropDownMenu(gangs)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="paymentModeID">
                            Payment Mode *
                          </InputLabel>
                          <TextField select fullWidth
                            error={Boolean(touched.paymentModeID && errors.paymentModeID)}
                            helperText={touched.paymentModeID && errors.paymentModeID}
                            name="paymentModeID"
                            onBlur={handleBlur}
                            size='small'
                            onChange={(e) => {
                              handleChangeForm(e)
                            }}
                            value={employee.paymentModeID}
                            variant="outlined"
                            id="paymentModeID"
                          >
                            <MenuItem value={'0'}>--Select Payment Mode--</MenuItem>
                            {generateDropDownMenu(employeePaymentMode)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="paymentTypeID">
                            Payment Type *
                          </InputLabel>
                          <TextField select fullWidth
                            error={Boolean(touched.paymentTypeID && errors.paymentTypeID)}
                            helperText={touched.paymentTypeID && errors.paymentTypeID}
                            name="paymentTypeID"
                            onBlur={handleBlur}
                            size='small'
                            onChange={(e) => {
                              handleChangeForm(e)
                            }}
                            value={employee.paymentTypeID}
                            variant="outlined"
                            id="paymentTypeID"
                          >
                            <MenuItem value={'0'}>--Select Payment Type--</MenuItem>
                            {generateDropDownMenu(employeePaymentType)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="specialtyID">
                            Specialty *
                          </InputLabel>
                          <TextField select fullWidth
                            error={Boolean(touched.specialtyID && errors.specialtyID)}
                            helperText={touched.specialtyID && errors.specialtyID}
                            size='small'
                            onBlur={handleBlur}
                            id="specialtyID"
                            name="specialtyID"
                            value={employee.specialtyID}
                            type="text"
                            variant="outlined"
                            onChange={(e) => handleChangeForm(e)}
                          >
                            <MenuItem value="0">--Select Specialty--</MenuItem>
                            <MenuItem value="1">Default</MenuItem>
                            <MenuItem value="2">Skill</MenuItem>
                            <MenuItem value="3">Semi Skilled</MenuItem>
                            <MenuItem value="4">Unskilled</MenuItem>
                          </TextField>
                        </Grid>
                      </Grid>
                      <br></br>
                      <Divider />
                      <br></br>
                      <Grid container spacing={3}>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="employeeCode">
                            Employee Code *
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.employeeCode && errors.employeeCode)}
                            fullWidth
                            helperText={touched.employeeCode && errors.employeeCode}
                            size='small'
                            name="employeeCode"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.employeeCode}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="registrationNumber">
                            Registration Number *
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.registrationNumber && errors.registrationNumber)}
                            fullWidth
                            helperText={touched.registrationNumber && errors.registrationNumber}
                            size='small'
                            name="registrationNumber"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.registrationNumber}
                            variant="outlined"
                            InputProps={{
                              readOnly: isUpdate
                            }}
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="isEPFEnable">
                            PF Mode *
                          </InputLabel>
                          <TextField select fullWidth
                            error={Boolean(touched.isEPFEnable && errors.isEPFEnable)}
                            helperText={touched.isEPFEnable && errors.isEPFEnable}
                            size='small'
                            onBlur={handleBlur}
                            id="isEPFEnable"
                            name="isEPFEnable"
                            value={
                              employee.isEPFEnable
                            }
                            type="text"
                            variant="outlined"
                            onChange={(e) => handleChangeForm(e)}
                          >
                            <MenuItem value="-1">--Select PF Mode--</MenuItem>
                            <MenuItem value="0">Non-PF</MenuItem>
                            <MenuItem value="1">PF</MenuItem>
                          </TextField>
                        </Grid>
                        {values.isEPFEnable == 1 ?
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="epfNumber">
                              PF Number
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.epfNumber && errors.epfNumber)}
                              fullWidth
                              helperText={touched.epfNumber && errors.epfNumber}
                              size='small'
                              name="epfNumber"
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeForm(e)}
                              value={employee.epfNumber}
                              variant="outlined"
                            />
                          </Grid>
                          : null}
                        <Grid item md={4} xs={12} container alignItems="center">
                          <Grid container>
                            <Grid item xs={3} fullWidth>
                              <InputLabel shrink id="IDType">
                                Type
                              </InputLabel>
                              <TextField select
                                // error={Boolean(touched.identityTypeID && errors.identityTypeID)}
                                // helperText={touched.identityTypeID && errors.identityTypeID}
                                size='small'
                                onBlur={handleBlur}
                                id="identityTypeID"
                                name="identityTypeID"
                                value={employee.identityTypeID}
                                type="text"
                                variant="outlined"
                                onChange={(e) => handleChangeForm(e)}
                              >
                                <MenuItem value="1">NID</MenuItem>
                                <MenuItem value="2">BIR</MenuItem>
                                {/* <MenuItem value="3">NIC</MenuItem> */}
                              </TextField>
                            </Grid>
                            <Grid item xs={9}>
                              <InputLabel shrink id="nICNumber">
                                Identity Number *
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.nICNumber && errors.nICNumber)}
                                fullWidth
                                helperText={touched.nICNumber && errors.nICNumber}
                                size='small'
                                name="nICNumber"
                                onBlur={handleBlur}
                                onChange={(e) => handleChangeForm(e)}
                                value={employee.nICNumber}
                                variant="outlined"
                              />
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="titleID">
                            Title
                          </InputLabel>
                          <TextField select fullWidth
                            error={Boolean(touched.titleID && errors.titleID)}
                            helperText={touched.titleID && errors.titleID}
                            size='small'
                            onBlur={handleBlur}
                            id="titleID"
                            name="titleID"
                            value={employee.titleID}
                            type="text"
                            variant="outlined"
                            onChange={(e) => handleChangeForm(e)}
                          >
                            <MenuItem value="0">--Select Title--</MenuItem>
                            {generateDropDownMenu(employeeTitles)}
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
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.firstName}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="secondName">
                            Middle Name
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.secondName && errors.secondName)}
                            fullWidth
                            helperText={touched.secondName && errors.secondName}
                            size='small'
                            name="secondName"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.secondName}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="lastName">
                            Last Name
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.lastName && errors.lastName)}
                            fullWidth
                            helperText={touched.lastName && errors.lastName}
                            size='small'
                            name="lastName"
                            type="lastName"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.lastName}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="genderID">
                            Gender
                          </InputLabel>
                          <TextField select fullWidth
                            error={Boolean(touched.genderID && errors.genderID)}
                            helperText={touched.genderID && errors.genderID}
                            size='small'
                            onBlur={handleBlur}
                            id="genderID"
                            name="genderID"
                            value={employee.genderID
                              //employee.genderID = employee.titleID === '3' ? '2' : employee.titleID
                            }
                            type="text"
                            variant="outlined"
                            onChange={(e) => handleChangeForm(e)}>
                            <MenuItem value="0">--Select Gender--</MenuItem>
                            <MenuItem value="1">Male</MenuItem>
                            <MenuItem value="2">Female</MenuItem>
                            <MenuItem value="3">Other</MenuItem>
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="statusID">
                            Marital Status
                          </InputLabel>
                          <TextField select fullWidth
                            error={Boolean(touched.statusID && errors.statusID)}
                            helperText={touched.statusID && errors.statusID}
                            size='small'
                            onBlur={handleBlur}
                            id="statusID"
                            name="statusID"
                            value={employee.statusID}
                            type="text"
                            variant="outlined"
                            onChange={(e) => handleChangeForm(e)}>
                            <MenuItem value="0">--Select Marital Status--</MenuItem>
                            <MenuItem value="1">Single</MenuItem>
                            <MenuItem value="2">Married</MenuItem>
                            <MenuItem value="3">Divorce</MenuItem>
                            <MenuItem value="4">Widow</MenuItem>
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
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.religionID}
                            variant="outlined"
                          >
                            <MenuItem value="0">--Select Religion--</MenuItem>
                            {generateDropDownMenu(employeeReligions)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="raiseID">
                            Race
                          </InputLabel>
                          <TextField select fullWidth
                            error={Boolean(touched.raiseID && errors.raiseID)}
                            helperText={touched.raiseID && errors.raiseID}
                            size='small'
                            name="raiseID"
                            id="raiseID"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.raiseID}
                            variant="outlined"
                          >
                            <MenuItem value="0">--Select Race--</MenuItem>
                            {generateDropDownMenu(employeeRaises)}
                          </TextField>
                        </Grid>
                        {/* <Grid item md={4} xs={12}>
                          <InputLabel shrink id="dob" style={{ marginBottom: '-8px' }}>
                            Date Of Birth
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
                              inputVariant="outlined"
                              id="dob"
                              name="dob"
                              value={employee.dob}
                              onChange={(e) => handleDateChange(e, "dob")}
                              KeyboardButtonProps={{
                                'aria-label': 'change date',
                              }}
                              InputProps={{ readOnly: true }}
                            />
                          </MuiPickersUtilsProvider>
                        </Grid> */}
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="dob" style={{ marginBottom: '-8px' }}>
                            Date Of Birth
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.dob && errors.dob)}
                            helperText={touched.dob && errors.dob}
                            fullWidth
                            variant="outlined"
                            margin="dense"
                            id="dob"
                            name="dob"
                            value={formatAsDate(employee.dob)}
                            placeholder="DD/MM/YYYY"
                            onChange={(e) => handleDateChange(e.target.value, "dob")}
                            InputLabelProps={{
                              shrink: true,
                            }}
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="joiningDate" style={{ marginBottom: '-8px' }}>
                            Joining Date
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
                              inputVariant="outlined"
                              id="joiningDate"
                              name="joiningDate"
                              value={employee.joiningDate}
                              onChange={(e) => handleDateChange(e, "joiningDate")}
                              KeyboardButtonProps={{
                                'aria-label': 'change date',
                              }}
                            />
                          </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="dateOfConfirmation" style={{ marginBottom: '-8px' }}>
                            Date of Confirmation
                          </InputLabel>
                          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                              error={Boolean(touched.dateOfConfirmation && errors.dateOfConfirmation)}
                              helperText={touched.dateOfConfirmation && errors.dateOfConfirmation}
                              autoOk
                              fullWidth
                              variant="inline"
                              format="dd/MM/yyyy"
                              margin="dense"
                              inputVariant="outlined"
                              id="dateOfConfirmation"
                              name="dateOfConfirmation"
                              value={employee.dateOfConfirmation}
                              onChange={(e) => handleDateChange(e, "dateOfConfirmation")}
                              KeyboardButtonProps={{
                                'aria-label': 'change date',
                              }}
                            />
                          </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="expiredDate" style={{ marginBottom: '-8px' }}>
                            Expired Date
                          </InputLabel>
                          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                              error={Boolean(touched.expiredDate && errors.expiredDate)}
                              helperText={touched.expiredDate && errors.expiredDate}
                              autoOk
                              fullWidth
                              variant="inline"
                              format="dd/MM/yyyy"
                              margin="dense"
                              inputVariant="outlined"
                              id="expiredDate"
                              name="expiredDate"
                              value={employee.expiredDate}
                              onChange={(e) => handleDateChange(e, "expiredDate")}
                              KeyboardButtonProps={{
                                'aria-label': 'change date',
                              }}
                            />
                          </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="resignedDate" style={{ marginBottom: '-8px' }}>
                            Resigned Date
                          </InputLabel>
                          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                              error={Boolean(touched.resignedDate && errors.resignedDate)}
                              helperText={touched.resignedDate && errors.resignedDate}
                              autoOk
                              fullWidth
                              variant="inline"
                              format="dd/MM/yyyy"
                              margin="dense"
                              inputVariant="outlined"
                              id="resignedDate"
                              name="resignedDate"
                              value={employee.resignedDate}
                              onChange={(e) => handleDateChange(e, "resignedDate")}
                              KeyboardButtonProps={{
                                'aria-label': 'change date',
                              }}
                            />
                          </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="terminatedDate" style={{ marginBottom: '-8px' }}>
                            Terminated Date
                          </InputLabel>
                          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                              error={Boolean(touched.terminatedDate && errors.terminatedDate)}
                              helperText={touched.terminatedDate && errors.terminatedDate}
                              autoOk
                              fullWidth
                              variant="inline"
                              format="dd/MM/yyyy"
                              margin="dense"
                              inputVariant="outlined"
                              id="terminatedDate"
                              name="terminatedDate"
                              value={employee.terminatedDate}
                              onChange={(e) => handleDateChange(e, "terminatedDate")}
                              KeyboardButtonProps={{
                                'aria-label': 'change date',
                              }}
                            />
                          </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item md={4} xs={12}>
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
                            value={employee.workLocationID}
                            type="text"
                            variant="outlined"
                            onChange={(e) => handleChangeForm(e)}
                          >
                            <MenuItem value="0">--Select Work Location--</MenuItem>
                            {generateDropDownMenu(workLocation)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="payPointID">
                            Pay Point *
                          </InputLabel>
                          <TextField select fullWidth
                            error={Boolean(touched.payPointID && errors.payPointID)}
                            helperText={touched.payPointID && errors.payPointID}
                            size='small'
                            onBlur={handleBlur}
                            id="payPointID"
                            name="payPointID"
                            value={employee.payPointID}
                            type="text"
                            variant="outlined"
                            onChange={(e) => handleChangeForm(e)}
                          >
                            <MenuItem value="0">--Select Pay Point--</MenuItem>
                            {generateDropDownMenu(payPoints)}
                          </TextField>
                        </Grid>
                        {employee.employeeTypeID == 1 ?
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="rationCardNumber">
                            Ration Card Number *
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.rationCardNumber && errors.rationCardNumber)}
                            fullWidth
                            helperText={touched.rationCardNumber && errors.rationCardNumber}
                            size='small'
                            name="rationCardNumber"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.rationCardNumber}
                            variant="outlined"
                          />
                        </Grid>: null}
                      </Grid>
                      <br></br>
                      <Divider />
                      <br></br>
                      <Grid container spacing={3}>
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
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.address}
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
                            helperText={touched.addresstwo && errors.addresstwo}
                            size='small'
                            name="addresstwo"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.addresstwo}
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
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.addressthree}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="city">
                            City
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.city && errors.city)}
                            fullWidth
                            helperText={touched.city && errors.city}
                            size='small'
                            name="city"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.city}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="postalCode">
                            Postal Code
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.postalCode && errors.postalCode)}
                            fullWidth
                            helperText={touched.postalCode && errors.postalCode}
                            size='small'
                            name="postalCode"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.postalCode}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="postOffice">
                            Post Office
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.postOffice && errors.postOffice)}
                            fullWidth
                            helperText={touched.postOffice && errors.postOffice}
                            size='small'
                            name="postOffice"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.postOffice}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="policeStation">
                            Police Station
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.policeStation && errors.policeStation)}
                            fullWidth
                            helperText={touched.policeStation && errors.policeStation}
                            size='small'
                            name="policeStation"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.policeStation}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="countryID">
                            Country
                          </InputLabel>
                          <TextField select fullWidth
                            error={Boolean(touched.countryID && errors.countryID)}
                            helperText={touched.countryID && errors.countryID}
                            size='small'
                            name="countryID"
                            id="countryID"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.countryID}
                            variant="outlined"
                          >
                            <MenuItem value="0">--Select Country--</MenuItem>
                            {generateDropDownMenu(employeeCountries)}
                          </TextField>
                        </Grid>
                      </Grid>
                      <Grid container spacing={3} style={{ marginTop: '10px' }}>
                        <Grid item md={12} xs={12}>
                          <InputLabel shrink id="addressPresent">
                            Address (Present)
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.addressPresent && errors.addressPresent)}
                            fullWidth
                            helperText={touched.addressPresent && errors.addressPresent}
                            size='small'
                            name="addressPresent"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.addressPresent}
                            variant="outlined"
                          />
                        </Grid>
                      </Grid>
                      <Grid container spacing={3} style={{ marginTop: '10px' }}>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="mobileNumber">
                            Mobile Number
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.mobileNumber && errors.mobileNumber)}
                            fullWidth
                            helperText={touched.mobileNumber && errors.mobileNumber}
                            size='small'
                            name="mobileNumber"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.mobileNumber}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="homeNumber">
                            Home Number
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.homeNumber && errors.homeNumber)}
                            fullWidth
                            helperText={touched.homeNumber && errors.homeNumber}
                            size='small'
                            name="homeNumber"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.homeNumber}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="email">
                            Email Address
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.email && errors.email)}
                            fullWidth
                            helperText={touched.email && errors.email}
                            size='small'
                            name="email"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.email}
                            variant="outlined"
                          />
                        </Grid>
                      </Grid>
                      <br></br>
                      <Divider />
                      <br></br>
                      <Grid container spacing={3}>
                        {values.employeeCategoryID == 1 ?
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="basicMonthlySalary">
                              Monthly Salary
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.basicMonthlySalary && errors.basicMonthlySalary)}
                              fullWidth
                              helperText={touched.basicMonthlySalary && errors.basicMonthlySalary}
                              size='small'
                              name="basicMonthlySalary"
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeForm(e)}
                              value={employee.basicMonthlySalary}
                              variant="outlined"
                            />
                          </Grid> : null}
                        {values.employeeCategoryID == 2 || values.employeeCategoryID == 3 ?
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="basicMonthlySalary">
                              Basic Wages
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.basicDailySalary && errors.basicDailySalary)}
                              fullWidth
                              helperText={touched.basicDailySalary && errors.basicDailySalary}
                              size='small'
                              name="basicDailySalary"
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeForm(e)}
                              value={employee.basicDailySalary}
                              variant="outlined"
                            />
                          </Grid> : null}
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="specialAllowance">
                            Special Allowance
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.specialAllowance && errors.specialAllowance)}
                            fullWidth
                            helperText={touched.specialAllowance && errors.specialAllowance}
                            size='small'
                            name="specialAllowance"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.specialAllowance}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="otherAllowance">
                            Other Allowance
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.otherAllowance && errors.otherAllowance)}
                            fullWidth
                            helperText={touched.otherAllowance && errors.otherAllowance}
                            size='small'
                            name="otherAllowance"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.otherAllowance}
                            variant="outlined"
                          />
                        </Grid>
                      </Grid>
                      <br></br>
                      <Divider />
                      <br></br>
                      <Grid container spacing={3} alignItems="center">
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
                            value={employee.areaType}
                            variant="outlined"
                            onChange={(e) => {
                              handleChangeForm(e)
                              if (parseInt(e.target.value) === 0) {
                                setFieldValue('area', '');
                              }
                              setFieldValue('areaType', e.target.value);
                            }}>
                            <MenuItem value="0">--Select Area Type--</MenuItem>
                            <MenuItem value="1">Decimal</MenuItem>
                            <MenuItem value="2">Khair</MenuItem>
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
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.area}
                            variant="outlined"
                          />
                        </Grid> : null}
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="areaType">
                            Harvesting Job Name
                          </InputLabel>
                          <Autocomplete
                            key={isClear}
                            multiple
                            id="harvestingJobID"
                            name="harvestingJobID"
                            options={options}
                            size="small"
                            getOptionLabel={(option) => option.haverstingJobTypeName}
                            defaultValue={harvestingJobs}
                            onChange={handleChangeHarvestingJob}
                            filterSelectedOptions
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="outlined"
                                label="Harvesting Job Name"
                                placeholder="Harvesting Job"
                              />
                            )}
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="rationQuantity">
                            Ration Quantity
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.rationQuantity && errors.rationQuantity)}
                            fullWidth
                            helperText={touched.rationQuantity && errors.rationQuantity}
                            size='small'
                            name="rationQuantity"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.rationQuantity}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="khethLandDeductionQuantity">
                            Kheth Land Deduction Quantity
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.khethLandDeductionQuantity && errors.khethLandDeductionQuantity)}
                            fullWidth
                            helperText={touched.khethLandDeductionQuantity && errors.khethLandDeductionQuantity}
                            size='small'
                            name="khethLandDeductionQuantity"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.khethLandDeductionQuantity}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="bookNumber">
                            Book Number
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.bookNumber && errors.bookNumber)}
                            fullWidth
                            helperText={touched.bookNumber && errors.bookNumber}
                            size='small'
                            name="bookNumber"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.bookNumber}
                            variant="outlined"
                          />
                        </Grid>
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
