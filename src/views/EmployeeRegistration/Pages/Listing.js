import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  makeStyles,
  Container,
  Divider,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  InputLabel,
  CardHeader,
  Button
} from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { LoadingComponent } from '../../../../src/utils/newLoader';
import xlsx from 'json-as-xlsx';
import SearchNotFound from 'src/views/Common/SearchNotFound';
import { CustomTable } from './CustomTable';
import EmployeeViewModal from './ViewModal'

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
  colorRecord: {
    backgroundColor: 'green'
  }
}));

const screenCode = "EMPLOYEEREGISTRATION";

export default function EmployeeListing(props) {
  const classes = useStyles();
  const [page, setPage] = useState(0);
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [employeeType, setEmployeeType] = useState();
  const [employeeCategory, setEmployeeCategory] = useState();
  const [employeeSubCategoryMapping, setEmployeeSubCategoryMapping] = useState();
  const [gangs, setGangs] = useState([]);
  const [csvHeaders, SetCsvHeaders] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  const [payPoints, setPayPoints] = useState([]);
  const [labourOnBookCount, setLabourOnBookCount] = useState([]);
  const [empCount, setEmpCount] = useState([]);
  const [IDDataForCall, setIDDataForCall] = useState(null)
  const [employeeList, setEmployeeList] = useState({
    groupID: '0',
    factoryID: '0',
    empTypeID: '0',
    employeeCategoryID: '0',
    employeeSubCategoryMappingID: '0',
    costCenterID: '0',
    payPointID: '0',
    gangID: '0',
    genderID: 0,
    designationID: '0',
    registrationNumber: '',
    statusID: '2'
  })
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
    isAddEditScreen: false
  });
  const [openModal, setOpenModal] = useState(false);
  const [selectedEmpData, setSelectedEmpData] = useState(null);

  const [employeeData, setEmployeeData] = useState([]);
  const navigate = useNavigate();
  let encryptedID = "";
  const [employeeID, setEmployeeID] = useState(0);
  const [excel, setExcel] = useState(false);
  const handleClick = () => {
    encryptedID = btoa('0');
    let modelID = {
      groupID: parseInt(employeeList.groupID),
      factoryID: parseInt(employeeList.factoryID),
      empTypeID: parseInt(employeeList.empTypeID),
      costCenterID: parseInt(employeeList.costCenterID),
      payPointID: parseInt(employeeList.payPointID),
      employeeCategoryID: parseInt(employeeList.employeeCategoryID),
      employeeSubCategoryMappingID: parseInt(employeeList.employeeSubCategoryMappingID),
      gangID: parseInt(employeeList.gangID),
      registrationNumber: employeeList.registrationNumber,
      statusID: parseInt(employeeList.statusID)
    };
    sessionStorage.setItem('employee-list-page-search-parameters-id', JSON.stringify(modelID));
    navigate('/app/EmployeeRegistration/addedit/' + encryptedID);
  }

  const EditEmployeeDetails = (employeeID) => {
    encryptedID = btoa(employeeID);
    let modelID = {
      groupID: parseInt(employeeList.groupID),
      factoryID: parseInt(employeeList.factoryID),
      empTypeID: parseInt(employeeList.empTypeID),
      costCenterID: parseInt(employeeList.costCenterID),
      payPointID: parseInt(employeeList.payPointID),
      employeeCategoryID: parseInt(employeeList.employeeCategoryID),
      employeeSubCategoryMappingID: parseInt(employeeList.employeeSubCategoryMappingID),
      gangID: parseInt(employeeList.gangID),
      registrationNumber: employeeList.registrationNumber,
      statusID: parseInt(employeeList.statusID)
    };
    sessionStorage.setItem('employee-list-page-search-parameters-id', JSON.stringify(modelID));
    sessionStorage.setItem('employee-table-page', JSON.stringify(page));
    navigate('/app/EmployeeRegistration/addedit/' + encryptedID);
  }

  useEffect(() => {
    if (employeeID != 0) {
      EditEmployeeDetails(employeeID)
    }
  }, [employeeID]);

  useEffect(() => {
    const IDdata = JSON.parse(
      sessionStorage.getItem('employee-list-page-search-parameters-id')
    );
    const page = JSON.parse(
      sessionStorage.getItem('employee-table-page')
    )
    trackPromise(
      getPermission(IDdata, page)
    );
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoriesForDropDown(),
      GetDivisionDetailsByGroupID()
    )
  }, [employeeList.groupID]);

  useEffect(() => {
    trackPromise(
      GetEmpAndLabouronBookCount(),
    )
  }, [employeeList.factoryID]);

  useEffect(() => {
    if (IDDataForCall !== null) {
      trackPromise(getEmployeeDetails());
    }
  }, [IDDataForCall]);

  useEffect(() => {
    if (employeeList.factoryID != "0") {
      trackPromise(
        getCostCenterDetailsByGardenID()
      )
      setEmployeeData([]);
    }
  }, [employeeList.factoryID]);

  useEffect(() => {
    if (employeeList.costCenterID != "0") {
      getGangDetailsByDivisionID();
    }
  }, [employeeList.costCenterID]);

  useEffect(() => {
    GetAllEmployeeSubCategoryMapping();
  }, []);

  useEffect(() => {
    if (excel == true) {
      createFile()
    }
  }, [excel]);

  async function getPermission(IDdata, page) {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWEMPLOYEEREGISTRATION');

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');
    var isAddEditScreen = permissions.find(p => p.permissionCode == 'ADDEDITEMPLOYEEREGISTRATION');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
      isAddEditScreen: isAddEditScreen !== undefined
    });

    const initialLoad = IDdata === null;
    if (initialLoad) {
      setEmployeeList({
        ...employeeList,
        groupID: parseInt(tokenService.getGroupIDFromToken()),
        factoryID: parseInt(tokenService.getFactoryIDFromToken()),
      })
    }
    else {
      setEmployeeList({
        ...employeeList,
        groupID: IDdata.groupID,
        factoryID: IDdata.factoryID,
        empTypeID: IDdata.empTypeID,
        costCenterID: IDdata.costCenterID,
        payPointID: IDdata.payPointID,
        employeeCategoryID: IDdata.employeeCategoryID,
        employeeSubCategoryMappingID: IDdata.employeeSubCategoryMappingID,
        gangID: IDdata.gangID,
        registrationNumber: IDdata.registrationNumber,
        statusID: IDdata.statusID
      })
      setIDDataForCall(IDdata);
      setPage(page);
    }

    getEmployeeTypesForDropdown()
    trackPromise(getGroupsForDropdown())
    getEmployeeCategoriesForDropdown();
  }

  async function getFactoriesForDropDown() {
    const factory = await services.getFactoryByGroupID(employeeList.groupID);
    setFactories(factory);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  async function GetEmpAndLabouronBookCount() {
    const result = await services.GetEmpAndLabouronBookCount(employeeList.factoryID);
    setLabourOnBookCount(result.labourOnBook);
    setEmpCount(result.empCount);
  }

  async function getEmployeeDetails() {
    let model = {
      groupID: parseInt(employeeList.groupID),
      factoryID: parseInt(employeeList.factoryID),
      costCenterID: parseInt(employeeList.costCenterID),
      payPointID: parseInt(employeeList.payPointID),
      empTypeID: parseInt(employeeList.empTypeID),
      employeeCategoryID: parseInt(employeeList.employeeCategoryID),
      employeeSubCategoryMappingID: parseInt(employeeList.employeeSubCategoryMappingID),
      gangID: parseInt(employeeList.gangID),
      genderID: parseInt(employeeList.genderID),
      designationID: parseInt(employeeList.designationID),
      registrationNumber: employeeList.registrationNumber,
      statusID: parseInt(employeeList.statusID)
    }
    var result = await services.getEmployeeDetails(model);
    setEmployeeData(result);
  }

  async function getEmployeeTypesForDropdown() {
    const types = await services.getEmployeeTypesForDropdown();
    setEmployeeType(types);
  }

  async function getEmployeeCategoriesForDropdown() {
    const result = await services.getEmployeeCategoriesForDropdown();
    setEmployeeCategory(result)
  }

  async function GetAllEmployeeSubCategoryMapping() {
    const result = await services.GetAllEmployeeSubCategoryMapping();
    setEmployeeSubCategoryMapping(result)
  }

  async function GetDivisionDetailsByGroupID() {
    const result = await services.GetDivisionDetailsByGroupID(employeeList.groupID);
    setPayPoints(result)
  }

  async function getCostCenterDetailsByGardenID() {
    var response = await services.getDivisionDetailsByEstateID(employeeList.factoryID);
    const elementCount = response.reduce((count) => count + 1, 0);
    var generated = generateDropDownMenu(response)
    if (elementCount === 1) {
      setEmployeeList((prevState) => ({
        ...prevState,
        costCenterID: generated[0].props.value,
      }));
    }
    setCostCenters(response);
  };

  async function getGangDetailsByDivisionID() {
    var response = await services.getGangDetailsByDivisionID(employeeList.costCenterID);
    setGangs(response);
  };

  async function createDataForExcel(array) {
    var res = [];

    if (array != null) {
      array.map(x => {
        var vr = {
          'Business Division': x.groupName,
          'Location': x.factoryName,
          'Sub-Division': x.divisionName,
          'Work Location': x.workLocation,
          'Pay Point': x.payPoint,
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
    }
    return res;
  }

  async function createFile() {
    setExcel(false);
    var file = await createDataForExcel(employeeData);
    var settings = {
      sheetName: 'Employees',
      fileName: 'Employees',
      writeOptions: {}
    };

    let keys = Object.keys(file[0]);
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem });
    });

    let dataA = [
      {
        sheet: 'Employees',
        columns: tempcsvHeaders,
        content: file
      }
    ];
    xlsx(dataA, settings);
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

  function handleGroupChange(e) {
    const target = e.target;
    const value = target.value
    setEmployeeList({
      ...employeeList,
      [e.target.name]: value,
      factoryID: "0",
      payPointID: "0"
    });
  }

  function handleLocationChange(e) {
    const target = e.target;
    const value = target.value
    setEmployeeList({
      ...employeeList,
      [e.target.name]: value,
      costCenterID: "0"
    });
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
    setEmployeeList({
      ...employeeList,
      [e.target.name]: value
    });
  }

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {titleName}
        </Grid>
        <Grid item md={2} xs={12}>
          {permissionList.isAddEditScreen == true ?
            <PageHeader
              onClick={handleClick}
              isEdit={true}
              toolTiptitle={"Add Employee"}
            />
            : null}
        </Grid>
      </Grid>
    )
  }

  useEffect(() => {
    sessionStorage.removeItem('employee-list-page-search-parameters-id')
    sessionStorage.removeItem('employee-table-page')
  }, []);

  const handleViewModalClick = async (regNo, empID) => {
    const model = { registrationNumber: regNo, groupID: parseInt(employeeList.groupID) }
    const basic = await services.GetEmployeeProfile(model);
    const dependant = await services.getEmployeeSupplimentaryDetailsByEmployeeID(parseInt(empID));
    const relationships = await services.GetAllRelationshipsForDropDown();
    const data = { basic: basic?.data, dependant, relationships }
    setSelectedEmpData(data);
    setOpenModal(true);
  }

  return (
    <Page
      className={classes.root}
      title="Employee"
    >
      <LoadingComponent />
      <EmployeeViewModal open={openModal} onClose={() => setOpenModal(false)} employeeProfileData={selectedEmpData} />
      <Container maxWidth={false}>
        <Box mt={0}>
          <Card>
            <CardHeader
              title={cardTitle("Employee")}
            />
            <PerfectScrollbar>
              <Divider />
              <CardContent style={{ marginBottom: "2rem" }}>
                <Grid container spacing={3}>
                  <Grid item md={3} xs={12}>
                    <InputLabel shrink id="groupID">
                      Business Division *
                    </InputLabel>
                    <TextField select
                      fullWidth
                      size='small'
                      name="groupID"
                      onChange={(e) => handleGroupChange(e)}
                      value={employeeList.groupID}
                      variant="outlined"
                      InputProps={{
                        readOnly: !permissionList.isGroupFilterEnabled,
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
                      fullWidth
                      size='small'
                      name="factoryID"
                      onChange={(e) => handleLocationChange(e)}
                      value={employeeList.factoryID}
                      variant="outlined"
                      id="factoryID"
                      InputProps={{
                        readOnly: !permissionList.isFactoryFilterEnabled,
                      }}
                    >
                      <MenuItem value="0">--Select Location--</MenuItem>
                      {generateDropDownMenu(factories)}
                    </TextField>
                  </Grid>
                  <Grid item md={3} xs={12}>
                    <InputLabel shrink id="costCenterID">
                      Sub-Division
                    </InputLabel>
                    <TextField select
                      fullWidth
                      name="costCenterID"
                      onChange={(e) => handleChange(e)}
                      value={employeeList.costCenterID}
                      variant="outlined"
                      id="costCenterID"
                      size='small'
                    >
                      <MenuItem value="0">--Select Sub-Division--</MenuItem>
                      {generateDropDownMenu(costCenters)}
                    </TextField>
                  </Grid>
                  <Grid item md={3} xs={12}>
                    <InputLabel shrink id="payPointID">
                      Pay Point
                    </InputLabel>
                    <TextField select fullWidth
                      size='small'
                      id="payPointID"
                      name="payPointID"
                      value={employeeList.payPointID}
                      type="text"
                      variant="outlined"
                      onChange={(e) => handleChange(e)}
                    >
                      <MenuItem value="0">--Select Pay Point--</MenuItem>
                      {generateDropDownMenu(payPoints)}
                    </TextField>
                  </Grid>
                </Grid>
                <Grid container spacing={3}>
                  <Grid item md={3} xs={12}>
                    <InputLabel shrink id="empTypeID">
                      Employee Type
                    </InputLabel>
                    <TextField select
                      fullWidth
                      name="empTypeID"
                      onChange={(e) => handleChange(e)}
                      value={employeeList.empTypeID}
                      variant="outlined"
                      id="empTypeID"
                      size='small'
                    >
                      <MenuItem value="0">--Select Employee Type--</MenuItem>
                      {generateDropDownMenuWithTwoValues(employeeType)}
                    </TextField>
                  </Grid>
                  <Grid item md={3} xs={12}>
                    <InputLabel shrink id="employeeCategoryID">
                      Employee Category
                    </InputLabel>
                    <TextField select fullWidth
                      size='small'
                      id="employeeCategoryID"
                      name="employeeCategoryID"
                      value={employeeList.employeeCategoryID}
                      variant="outlined"
                      onChange={(e) => handleChange(e)}
                    >
                      <MenuItem value="0">--Select Employee Category--</MenuItem>
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
                      name="employeeSubCategoryMappingID"
                      value={employeeList.employeeSubCategoryMappingID}
                      type="text"
                      variant="outlined"
                      onChange={(e) => handleChange(e)}
                    >
                      <MenuItem value="0">--Select Employee Sub Category--</MenuItem>
                      {generateDropDownMenu(employeeSubCategoryMapping)}
                    </TextField>
                  </Grid>
                  <Grid item md={3} xs={12}>
                    <InputLabel shrink id="gangID">
                      Duffa
                    </InputLabel>
                    <TextField select fullWidth
                      name="gangID"
                      size='small'
                      onChange={(e) => {
                        handleChange(e)
                      }}
                      value={employeeList.gangID}
                      variant="outlined"
                      id="gangID"
                    >
                      <MenuItem value={'0'}>--Select Duffa--</MenuItem>
                      {generateDropDownMenu(gangs)}
                    </TextField>
                  </Grid>
                </Grid>
                <Grid container spacing={3}>
                  <Grid item md={3} xs={12}>
                    <InputLabel shrink id="registrationNumber">
                      Registration Number
                    </InputLabel>
                    <TextField
                      fullWidth
                      size='small'
                      name="registrationNumber"
                      onChange={(e) => handleChange(e)}
                      value={employeeList.registrationNumber}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item md={3} xs={12}>
                    <InputLabel shrink id="statusID">
                      Status
                    </InputLabel>
                    <TextField select
                      fullWidth
                      size='small'
                      name="statusID"
                      onChange={(e) => handleChange(e)}
                      value={employeeList.statusID}
                      variant="outlined"
                      id="statusID"
                    >
                      <MenuItem value="2">--All Status--</MenuItem>
                      <MenuItem value="1">Active</MenuItem>
                      <MenuItem value="0">Inactive</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
                <Box display="flex" flexDirection="row-reverse" p={2} >
                  <Button
                    color="primary"
                    onClick={() => trackPromise(getEmployeeDetails())}
                    variant="contained"
                  >
                    Search
                  </Button>
                </Box>
                <br />
              </CardContent>
              {employeeData.length > 0 ?
                <CustomTable employeeData={employeeData} setEmployeeID={setEmployeeID} setExcel={setExcel} permissionList={permissionList.isAddEditScreen} empCount={empCount} labourOnBookCount={labourOnBookCount} handleViewModalClick={handleViewModalClick} />
                : <SearchNotFound searchQuery="Employee" />}
            </PerfectScrollbar>
          </Card>
        </Box>
      </Container>
    </Page>
  );
};

