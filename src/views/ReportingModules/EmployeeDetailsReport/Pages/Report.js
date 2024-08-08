import React, { useState, useEffect, Fragment, useRef } from 'react';
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
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from 'yup';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
import xlsx from 'json-as-xlsx';
import { useAlert } from 'react-alert';
import { CustomTable } from './CustomTable';

const useStyles = makeStyles(theme => ({
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
    backgroundColor: 'red'
  },
  colorRecord: {
    backgroundColor: 'green'
  }
}));

const screenCode = 'EMPLOYEEDETAILSREPORT';

export default function EmployeeDetailsReport(props) {
  const [title, setTitle] = useState('Employee Master');
  const classes = useStyles();
  const [employeeDetail, setEmployeeDetail] = useState({
    groupID: 0,
    gardenID: 0,
    costCenterID: 0,
    employeeTypeID: 0,
    employeeSubCategoryMappingID: 0,
    employeeCategoryID: 0,
    designationID: 0,
    gangID: 0,
    payPointID: '0',
    statusID: '2',
    registrationNumber: ''
  });
  const [GroupList, setGroupList] = useState([]);
  const [gardens, setGardens] = useState([]);
  const [costCenters, setCostCenters] = useState();
  const [employeeType, setEmployeeType] = useState();
  const [designations, setDesignations] = useState([]);
  const [employeeSubCategoryMapping, setEmployeeSubCategoryMapping] = useState([]);
  const [PayPoints, setPayPoints] = useState();
  const [gangs, setGangs] = useState([]);
  const [employeeCategory, setEmployeeCategory] = useState();
  const [employeeData, setEmployeeData] = useState([]);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const navigate = useNavigate();

  const [csvHeaders, SetCsvHeaders] = useState([]);
  const [excel, setExcel] = useState(false);
  const [initialState, setInitialState] = useState(false);
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    gardenName: '0',
    groupName: '0',
    costCenterName: "0",
    employeeTypeName: "0",
    employeeCategoryName: "0",
    employeeSubCategory: "0",
    designationName: "0",
    payPointID: '0',
    gangName: "0"
  });
  const componentRef = useRef();
  const alert = useAlert();

  useEffect(() => {
    trackPromise(getGroupsForDropdown(), getPermission());
  }, []);

  useEffect(() => {
    if (!initialState) {
      trackPromise(getPermission());
    }
  }, []);

  useEffect(() => {
    trackPromise(getEstateDetailsByGroupID());
  }, [employeeDetail.groupID]);

  useEffect(() => {
    setEmployeeDetail((prevState) => ({
      ...prevState,
      costCenterID: "0"
    }));
  }, [employeeDetail.groupID]);

  useEffect(() => {
    trackPromise(
      getCostCenterDetailsByGardenID()
    )
  }, [employeeDetail.gardenID]);

  useEffect(() => {
    trackPromise(getEstateDetailsByGroupID(),
      GetDivisionDetailsByGroupID());
  }, [employeeDetail.groupID]);

  useEffect(() => {
    setEmployeeData([])
  }, [employeeDetail]);

  useEffect(() => {
    if (initialState) {
      setEmployeeDetail((prevState) => ({
        ...prevState,
        gardenID: 0,
        costCenterID: 0,
        payPointID: 0
      }));
    }
  }, [employeeDetail.groupID, initialState]);

  useEffect(() => {
    if (initialState) {
      setEmployeeDetail((prevState) => ({
        ...prevState,
        costCenterID: 0
      }));
    }
  }, [employeeDetail.gardenID, initialState]);

  useEffect(() => {
    if (employeeDetail.costCenterID != 0) {
      getGangDetailsByDivisionID();
    }
  }, [employeeDetail.costCenterID]);

  useEffect(() => {
    GetAllEmployeeSubCategoryMapping();
  }, []);

  useEffect(() => {
    if (excel == true) {
      createFile()
    }
  }, [excel]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(
      p => p.permissionCode == 'VIEWEMPLOYEEDETAILSREPORT'
    );

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(
      p => p.permissionCode == 'GROUPDROPDOWN'
    );
    var isFactoryFilterEnabled = permissions.find(
      p => p.permissionCode == 'FACTORYDROPDOWN'
    );

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
    });

    setEmployeeDetail({
      ...employeeDetail,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      gardenID: parseInt(tokenService.getFactoryIDFromToken())
    });
    setInitialState(true);
    getEmployeeTypesForDropdown();
    getEmployeeCategoriesForDropdown();
    getDesignationsForDropDown();
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value;
    setEmployeeDetail({
      ...employeeDetail,
      [e.target.name]: value
    });
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroupList(groups);
  }

  async function getEstateDetailsByGroupID() {
    const factory = await services.getEstateDetailsByGroupID(employeeDetail.groupID);
    setGardens(factory);
  };

  async function getCostCenterDetailsByGardenID() {
    var response = await services.getDivisionDetailsByEstateID(employeeDetail.gardenID);
    const elementCount = response.reduce((count) => count + 1, 0);
    var generated = generateDropDownMenu(response)
    if (elementCount === 1) {
      setEmployeeDetail((prevState) => ({
        ...prevState,
        costCenterID: generated[0].props.value,
      }));
    }
    setCostCenters(response);
  };

  async function GetDivisionDetailsByGroupID() {
    const result = await services.GetDivisionDetailsByGroupID(employeeDetail.groupID);
    setPayPoints(result)
  }
  async function getEmployeeTypesForDropdown() {
    const types = await services.getEmployeeTypesForDropdown();
    setEmployeeType(types);
  }

  async function getEmployeeCategoriesForDropdown() {
    const result = await services.getEmployeeCategoriesForDropdown();
    setEmployeeCategory(result)
  }

  async function getDesignationsForDropDown() {
    const designations = await services.getDesignationsByEmployeeCategoryID();
    setDesignations(designations);
  }

  async function GetAllEmployeeSubCategoryMapping() {
    const result = await services.GetAllEmployeeSubCategoryMapping();
    setEmployeeSubCategoryMapping(result)
  }

  async function getGangDetailsByDivisionID() {
    var response = await services.getGangDetailsByDivisionID(employeeDetail.costCenterID);
    setGangs(response);
  };

  async function GetDetails() {
    let model = {
      groupID: parseInt(employeeDetail.groupID),
      gardenID: parseInt(employeeDetail.gardenID),
      costCenterID: parseInt(employeeDetail.costCenterID),
      employeeTypeID: parseInt(employeeDetail.employeeTypeID),
      employeeCategoryID: parseInt(employeeDetail.employeeCategoryID),
      employeeSubCategoryMappingID: parseInt(employeeDetail.employeeSubCategoryMappingID),
      gangID: parseInt(employeeDetail.gangID),
      payPointID: parseInt(employeeDetail.payPointID),
      statusID: parseInt(employeeDetail.statusID),
      registrationNumber: employeeDetail.registrationNumber
    };
    getSelectedDropdownValuesForReport(model);
    const response = await services.GetEmployeeDetails(model);

    if (response.statusCode == 'Success' && response.data != null) {
      setEmployeeData(response.data);
      createDataForExcel(response.data);
    } else {
      alert.error('NO RECORDS TO DISPLAY');
    }
  }

  async function createDataForExcel(array) {
    var res = [];

    if (array != null) {
      array.map(x => {
        var vr = {
          'Business Division': x.groupName,
          'Location': x.factoryName,
          'Sub-Division': x.employeeDivisionName,
          'Work Location': x.divisionName,
          'Paypoint': x.payPointName,

          'Employee Type': x.employeeTypeName,
          'Employee Sub Category': x.employeeSubCategoryName,

          'Registration Number': x.registrationNumber,
          'Employee Code': x.employeeCode,
          'PF Number': x.epfNumber,
          'PF Status': x.isEPFEnable == 1 ? 'PF Enabled' : 'Non PF',
          'Employee Title': x.employeeTitleName,
          'Employee Name': x.employeeName,
          'Designation': x.designationName,

          'Gender': x.genderID == 1 ? 'Male' : x.genderID == 2 ? 'Female' : '',
          'Marital Status': x.statusID == 1 ? 'Single' : x.statusID == 2 ? 'Married' : x.statusID == 3 ? 'Divorce' : x.statusID == 4 ? 'Widow' : '',
          'Identity Type': x.identityType == 1 ? 'BIR' : x.identityType == 2 ? 'NID' : x.identityType == 3 ? 'NIC' : '',
          'NIC/BIR Number': x.nicNumber,


          'Date Of Birth': x.dateOfBirth == null ? '' : new Date(x.dateOfBirth).toISOString().split('T')[0],
          'Joined Date': x.joiningDate == null ? '' : new Date(x.joiningDate).toISOString().split('T')[0],
          'Date of Confirmation': x.dateOfConfirmation == null ? '' : new Date(x.dateOfConfirmation).toISOString().split('T')[0],
          'Employee Category': x.employeeCategoryName,
          'Duffa Code': x.gangCode,
          'Duffa': x.gangName,

          'Payment Mode': x.paymentModeName,
          'Payment Type': x.paymentTypeName,
          'Employee Unit': x.employeeUnitName,

          'Basic Salary': x.basicDailySalary,
          'Special Allowance': x.specialAllowance,
          'Other Allowance': x.otherAllowance,

          'Specialty': x.specialtyID == 1 ? 'Default' : x.specialtyID == 2 ? 'Skill' : x.specialtyID == 3 ? 'Semi Skilled' : x.specialtyID == 4 ? 'Unskilled' : '',
          'Address 1': x.address1,
          'Address 2': x.address2,
          'Address 3': x.address3,
          'City': x.city,

          'Postal Code': x.postalCode,
          'Post Office': x.postOffice,
          'Police Station': x.policeStation,

          'Address (Present)': x.addressPresent,
          'Mobile Number': x.mobileNumber,
          'Home Number': x.homeNumber,

          'Email': x.email,
          'Area': x.area,
          'Country': x.countryName,
          'Religion': x.religionName,
          'Raise': x.raiseName,

          'Book Number': x.bookNumber,
          'Status': x.isActive == 1 ? 'Active' : 'Inactive'
        };
        res.push(vr);
      });

      res.push([]);

      var vr = {
        'Business Division': 'Business Division : ' + selectedSearchValues.groupName,
        'Location': 'Location : ' + selectedSearchValues.gardenName,
        'Sub-Division': selectedSearchValues.costCenterName === undefined ? 'Sub-Division : All Sub-Division' : 'Sub-Division : ' + selectedSearchValues.costCenterName,
        'Registration Number': selectedSearchValues.employeeTypeName === undefined ? 'Employee Type : All Employee Types' : 'Employee Type : ' + selectedSearchValues.employeeTypeName.name,
        'Employee Title': selectedSearchValues.employeeCategoryName === undefined ? 'Employee Category : All Employee Categories' : 'Employee Category : ' + selectedSearchValues.employeeCategoryName.name,
        'Employee Code': selectedSearchValues.employeeSubCategory === undefined ? 'Employee Sub Category : All Employee Sub Categories' : 'Employee Sub Category : ' + selectedSearchValues.employeeSubCategory
      };
      res.push(vr);

      var vr = {
        'Business Division': selectedSearchValues.gangName === undefined ? 'Duffa : All Duffas' : 'Duffa : ' + selectedSearchValues.gangName
      };
      res.push(vr);
    }

    return res;
  }

  async function createFile() {
    setExcel(false);
    var file = await createDataForExcel(employeeData);
    var settings = {
      sheetName: 'Employee Master',
      fileName: 'Employee Master ' + selectedSearchValues.groupName + ' - ' + selectedSearchValues.gardenName,
      writeOptions: {}
    };

    let keys = Object.keys(file[0]);
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem });
    });

    let dataA = [
      {
        sheet: 'Employee Master',
        columns: tempcsvHeaders,
        content: file
      }
    ];

    xlsx(dataA, settings);
  }

  function generateDropDownMenu(data) {
    let items = [];
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(
          <MenuItem key={key} value={key}>
            {value}
          </MenuItem>
        );
      }
    }
    return items;
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

  function getSelectedDropdownValuesForReport(searchForm) {
    setSelectedSearchValues({
      ...selectedSearchValues,
      gardenName: gardens[searchForm.gardenID],
      groupName: GroupList[searchForm.groupID],
      costCenterName: costCenters[searchForm.costCenterID],
      employeeTypeName: employeeType[searchForm.employeeTypeID],
      employeeCategoryName: employeeCategory[searchForm.employeeCategoryID],
      employeeSubCategory: employeeSubCategoryMapping[searchForm.employeeSubCategoryMappingID],
      payPointID: PayPoints[searchForm.payPointID],
      gangName: gangs[searchForm.gangID]
    });
  }

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {titleName}
        </Grid>
      </Grid>
    );
  }

  return (
    <Fragment>
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: employeeDetail.groupID,
              gardenID: employeeDetail.gardenID,
              employeeTypeID: employeeDetail.employeeTypeID,
              employeeSubCategoryMappingID: employeeDetail.employeeSubCategoryMappingID,
              registrationNumber: employeeDetail.registrationNumber,
              payPointID: employeeDetail.payPointID,
              gangID: employeeDetail.gangID,
              statusID: parseInt(employeeDetail.statusID)
            }}
            validationSchema={Yup.object().shape({
              groupID: Yup.number()
                .required('Business Division is required')
                .min('1', 'Business Division is required'),
              // gardenID: Yup.number()
              //   .required('Location is required')
              //   .min('1', 'Location is required')
            })}
            onSubmit={() => trackPromise(GetDetails())}
            enableReinitialize
          >
            {({ errors, handleBlur, handleSubmit, touched }) => (
              <form onSubmit={handleSubmit}>
                <Box mt={0}>
                  <Card>
                    <CardHeader title={cardTitle(title)} />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="groupID">
                              Business Division *
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="groupID"
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={employeeDetail.groupID}
                              variant="outlined"
                              id="groupID"
                              size="small"
                              InputProps={{
                                readOnly: !permissionList.isGroupFilterEnabled ? true : false
                              }}
                            >
                              <MenuItem value="0">--All Business Division--</MenuItem>
                              {generateDropDownMenu(GroupList)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="gardenID">
                              Location
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(touched.gardenID && errors.gardenID)}
                              fullWidth
                              helperText={touched.gardenID && errors.gardenID}
                              name="gardenID"
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={employeeDetail.gardenID}
                              variant="outlined"
                              id="gardenID"
                              size="small"
                              InputProps={{
                                readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                              }}
                            >
                              <MenuItem value="0">--All Location --</MenuItem>
                              {generateDropDownMenu(gardens)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="costCenterID">
                              Sub-Division
                            </InputLabel>
                            <TextField
                              select
                              fullWidth
                              name="costCenterID"
                              onChange={e => handleChange(e)}
                              value={employeeDetail.costCenterID}
                              variant="outlined"
                              id="costCenterID"
                              size="small"
                            >
                              <MenuItem value="0">--All Sub-Division--</MenuItem>
                              {generateDropDownMenu(costCenters)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="payPointID">
                              Pay Point
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.payPointID && errors.payPointID)}
                              fullWidth
                              helperText={touched.payPointID && errors.payPointID}
                              name="payPointID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={employeeDetail.payPointID}
                              variant="outlined"
                              id="payPointID"
                              size='small'
                            >
                              <MenuItem value="0">--All Pay Point--</MenuItem>
                              {generateDropDownMenu(PayPoints)}
                            </TextField>
                          </Grid>
                        </Grid>


                        <Grid container spacing={3}>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="employeeTypeID">
                              Employee Type
                            </InputLabel>
                            <TextField select fullWidth
                              size='small'
                              onBlur={handleBlur}
                              id="employeeTypeID"
                              name="employeeTypeID"
                              value={employeeDetail.employeeTypeID}
                              type="text"
                              variant="outlined"
                              onChange={e => handleChange(e)}
                            >
                              <MenuItem value="0">--All Employee Type--</MenuItem>
                              {generateDropDownMenuWithTwoValues(employeeType)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="employeeCategoryID">
                              Employee Category
                            </InputLabel>
                            <TextField select fullWidth
                              size='small'
                              onBlur={handleBlur}
                              id="employeeCategoryID"
                              name="employeeCategoryID"
                              value={employeeDetail.employeeCategoryID}
                              type="text"
                              variant="outlined"
                              onChange={(e) => handleChange(e)}
                            >
                              <MenuItem value="0">--All Employee Category--</MenuItem>
                              {generateDropDownMenuWithTwoValues(employeeCategory)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="employeeSubCategoryMappingID">
                              Employee Sub Category
                            </InputLabel>
                            <TextField select fullWidth
                              size='small'
                              id="employeeSubCategoryMappingID"
                              onBlur={handleBlur}
                              name="employeeSubCategoryMappingID"
                              value={employeeDetail.employeeSubCategoryMappingID}
                              type="text"
                              variant="outlined"
                              onChange={(e) => handleChange(e)}
                            >
                              <MenuItem value="0">--All Employee Sub Category--</MenuItem>
                              {generateDropDownMenu(employeeSubCategoryMapping)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="gangID">
                              Duffa
                            </InputLabel>
                            <TextField select fullWidth
                              error={Boolean(touched.gangID && errors.gangID)}
                              helperText={touched.gangID && errors.gangID}
                              name="gangID"
                              onBlur={handleBlur}
                              size='small'
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={employeeDetail.gangID}
                              variant="outlined"
                              id="gangID"
                            >
                              <MenuItem value={'0'}>--All Duffa--</MenuItem>
                              {generateDropDownMenu(gangs)}
                            </TextField>
                          </Grid>
                        </Grid>

                        <Grid container spacing={3}>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="statusID">
                              Status
                            </InputLabel>
                            <TextField select
                              fullWidth
                              size='small'
                              name="statusID"
                              onChange={(e) => handleChange(e)}
                              value={employeeDetail.statusID}
                              variant="outlined"
                              id="statusID"
                            >
                              <MenuItem value="2">--All Status--</MenuItem>
                              <MenuItem value="1">Active</MenuItem>
                              <MenuItem value="0">Inactive</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="registrationNumber">
                              Registration Number
                            </InputLabel>
                            <TextField
                              fullWidth
                              size='small'
                              name="registrationNumber"
                              onChange={(e) => handleChange(e)}
                              value={employeeDetail.registrationNumber}
                              variant="outlined"
                            />
                          </Grid>
                        </Grid>
                        <Box display="flex" flexDirection="row-reverse" p={2} >
                          <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                          >
                            Search
                          </Button>
                        </Box>
                      </CardContent>
                      <Box minWidth={1050}>
                        {employeeData.length > 0 ?
                          <CustomTable employeeData={employeeData} setExcel={setExcel} componentRef={componentRef} selectedSearchValues={selectedSearchValues} />
                          : null}
                      </Box>
                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            )}
          </Formik>
        </Container>
      </Page>
    </Fragment>
  );
}
