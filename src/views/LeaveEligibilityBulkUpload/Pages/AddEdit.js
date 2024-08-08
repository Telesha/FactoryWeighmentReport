import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Card, makeStyles, Container, CardHeader, Button, CardContent, Checkbox, Chip, Divider, MenuItem, Grid, InputLabel, TextField, TableCell, Switch, TableRow, TableContainer, TableBody, Table, TableHead, InputAdornment } from '@material-ui/core';
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
import tokenService from '../../../utils/tokenDecoder';
import tokenDecoder from '../../../utils/tokenDecoder';
import SearchIcon from '@material-ui/icons/Search';

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
  table: {
    minWidth: 550,
  },
  stickyHeader: {
    position: 'sticky',
    left: 0,
    zIndex: 1,
    backgroundColor: 'white',
  },
  stickyColumn: {
    position: 'sticky',
    left: 0,
    zIndex: 1,
    backgroundColor: 'white',
  },
}));

const screenCode = 'LEAVEELIGIBILITYBULKUPLOAD';
export default function LeaveEligibilityBulkUploadAddEdit(props) {
  const [title, setTitle] = useState("Add Leave Eligibility Bulk")
  const [isUpdate, setIsUpdate] = useState(false);
  const [employeeType, setEmployeeType] = useState(null)
  const [employeeTypeOne, setEmployeeTypeOne] = useState(null)
  const [employeeSubCategoryMapping, setEmployeeSubCategoryMapping] = useState();
  const classes = useStyles();
  const [groups, setGroups] = useState()
  const [factories, setFactories] = useState()
  const [costCenters, setCostCenters] = useState();
  const [ArrayField, setArrayField] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState();
  const [selectedRows, setSelectedRows] = useState([]);
  const [dataList, setDataList] = useState(selectedRows)
  const [isTableHide, setIsTableHide] = useState(false);
  const [remainLeaveQty, setRemainLeaveQty] = useState(0)
  const [eligibleLeaveQty, setEligibleLeaveQty] = useState(0)
  const [employeeCount, setEmployeeCount] = useState(0)
  const [BulkUploadDetails, setBulkUploadDetails] = useState({
    groupID: '0',
    factoryID: '0',
    costCenterID: '0',
    employeeTypeID: '0',
    employeeSubCategoryMappingID: '0',
    leaveTypeID: '0',
    noOfDays: '',
    registrationNumber: '',
    firstName: '',
    year: ''
  });

  const [searchInput, setSearchInput] = React.useState('');
  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
  };

  let decrypted = 0;
  const { employeeLeaveMasterID } = useParams();

  const navigate = useNavigate();
  const [initialState, setInitialState] = useState(false);
  const handleClick = () => {
    navigate('/app/LeaveEligibilityBulkUpload/listing');
  }
  const alert = useAlert();

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelectedRows(Array.from({ length: ArrayField.length }, (_, index) => ({
        index,
        data: ArrayField[index]
      })));
    } else {
      setSelectedRows([]);
    }
  };

  const handleRowCheckboxClick = (event, index) => {
    const selectedRowData = ArrayField[index];

    if (event.target.checked) {
      setSelectedRows([...selectedRows, { index, data: selectedRowData }]);
    } else {
      setSelectedRows(selectedRows.filter((row) => row.index !== index));
    }
  };

  useEffect(() => {
    trackPromise(getPermissions(), getGroupsForDropdown(), getEmployeeTypesForDropdown());
  }, []);

  useEffect(() => {
    if (BulkUploadDetails.groupID != '0') {
      trackPromise(getFactoriesForDropdown());
      trackPromise(getLeaveTypeForDropdown());
    }
  }, [BulkUploadDetails.groupID]);

  useEffect(() => {
    trackPromise(getCostCenterDetailsByGardenID());
  }, [BulkUploadDetails.factoryID]);

  useEffect(() => {
    trackPromise(GetAllEmployeeSubCategoryMappingByTypeID());
  }, [BulkUploadDetails.employeeTypeID]);

  useEffect(() => {
    setArrayField([]);
    setIsTableHide(false);
  }, [BulkUploadDetails]);

  useEffect(() => {
    if (!initialState) {
      trackPromise(getPermissions());
    }
  }, []);

  useEffect(() => {
    decrypted = atob(employeeLeaveMasterID.toString());
    if (parseInt(decrypted) > 0) {
      setIsUpdate(true);
      setIsTableHide(false);
      GetDetailsByLeaveMasterID(decrypted);
    }
  }, []);

  useEffect(() => {
    if (initialState) {
      setBulkUploadDetails((prevState) => ({
        ...prevState,
        factoryID: 0,
        costCenterID: 0,

      }));
    }
  }, [BulkUploadDetails.groupID, initialState]);

  useEffect(() => {
    if (initialState) {
      setBulkUploadDetails((prevState) => ({
        ...prevState,
        costCenterID: 0
      }));
    }
  }, [BulkUploadDetails.factoryID, initialState]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITLEAVEELIGIBILITYBULKUPLOAD');
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

    setBulkUploadDetails({
      ...BulkUploadDetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken()),
    })
    setInitialState(true);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }
  async function getFactoriesForDropdown() {
    const factories = await services.getAllFactoriesByGroupID(BulkUploadDetails.groupID);
    setFactories(factories);
  }

  async function getLeaveTypeForDropdown() {
    const leaveTypes = await services.getEmployeeLeaveType(BulkUploadDetails.groupID);
    let leaveTypeArray = []
    for (let item of Object.entries(leaveTypes)) {
      if (item[1]["shortForm"] == 'AL' || item[1]["shortForm"] == 'SL') {
        leaveTypeArray[item[1]["employeeLeaveTypeID"]] = item[1]["employeeLeaveTypeName"]
      }
    }
    setLeaveTypes(leaveTypeArray);
  }

  async function getEmployeeTypesForDropdown() {
    const types = await services.getEmployeeTypesForDropdown();
    let empTypeArray = []
    for (let item of Object.entries(types)) {
      if (item[1]["employeeTypeCode"] == '01') {
        empTypeArray[item[1]["employeeTypeID"]] = item[1]["employeeTypeName"]
      }
    }
    var generated = generateDropDownMenuWithTwoValues(empTypeArray)
    if (generated.length > 0) {
      setBulkUploadDetails((typex) => ({
        ...typex,
        employeeTypeID: generated[0].props.value,
      }));
    }
    setEmployeeTypeOne(types);
    setEmployeeType(empTypeArray);
  }

  async function GetAllEmployeeSubCategoryMappingByTypeID() {
    const result = await services.GetAllEmployeeSubCategoryMappingByTypeID(BulkUploadDetails.employeeTypeID);
    setEmployeeSubCategoryMapping(result)
  }

  async function getCostCenterDetailsByGardenID() {
    var response = await services.getDivisionDetailsByEstateID(BulkUploadDetails.factoryID);
    setCostCenters(response);
  };

  async function handleClickAdd() {
    let model = {
      groupID: parseInt(BulkUploadDetails.groupID),
      factoryID: parseInt(BulkUploadDetails.factoryID),
      costCenterID: parseInt(BulkUploadDetails.costCenterID),
      employeeTypeID: parseInt(BulkUploadDetails.employeeTypeID),
      employeeSubCategoryMappingID: parseInt(BulkUploadDetails.employeeSubCategoryMappingID),
      leaveTypeID: parseInt(BulkUploadDetails.leaveTypeID),
      year: (new Date().getFullYear()).toString()
    }
    const response = await services.GetLeaveEligibilityBulkUpload(model);
    setEmployeeCount(response.length)
    if (response.length > 0) {
      var array1 = [...ArrayField];

      response.forEach((item) => {
        array1.push({
          groupID: parseInt(BulkUploadDetails.groupID),
          factoryID: parseInt(BulkUploadDetails.factoryID),
          divisionID: parseInt(BulkUploadDetails.costCenterID),
          registrationNumber: item.registrationNumber,
          firstName: item.firstName,
          leaveTypeID: parseInt(BulkUploadDetails.leaveTypeID),
          leaveTypeName: leaveTypes[BulkUploadDetails.leaveTypeID],
          employeeTypeID: parseInt(BulkUploadDetails.employeeTypeID),
          employeeSubCategoryMappingID: parseInt(BulkUploadDetails.employeeSubCategoryMappingID),
          noOfDays: BulkUploadDetails.noOfDays,
          year: (new Date().getFullYear()).toString(),
          createdBy: parseInt(tokenDecoder.getUserIDFromToken())
        });
      });
      setArrayField(array1);
      setIsTableHide(true);

      let dataModel = {
        groupID: BulkUploadDetails.groupID,
        factoryID: BulkUploadDetails.factoryID,
        costCenterID: BulkUploadDetails.costCenterID,
        registrationNumber: BulkUploadDetails.registrationNumber,
        leaveTypeID: BulkUploadDetails.leaveTypeID,
        employeeTypeID: BulkUploadDetails.employeeTypeID,
        employeeSubCategoryMappingID: BulkUploadDetails.employeeSubCategoryMappingID,
        noOfDays: BulkUploadDetails.noOfDays
      }
      setDataList(dataList => [...dataList, dataModel]);
    }
    else if (response.length == 0) {
      alert.error("All the employees have this leave type eligibility for this year")
    }
  }

  const renderChips = (leaveTypeName) => {
    return leaveTypeName.split(', ').map((label, index) => (
      <Chip key={index} label={label} size="small" style={{ color: 'black', fontStyle: 'bold' }} />
    ));
  };

  async function saveDetails() {
    if (isUpdate == true) {
      let updateModel = {
        employeeLeaveMasterID: parseInt(atob(employeeLeaveMasterID.toString())),
        groupID: parseInt(BulkUploadDetails.groupID),
        factoryID: parseInt(BulkUploadDetails.factoryID),
        divisionID: parseInt(BulkUploadDetails.costCenterID),
        firstName: BulkUploadDetails.firstName,
        leaveTypeID: parseInt(BulkUploadDetails.leaveTypeID),
        leaveTypeName: leaveTypes[BulkUploadDetails.leaveTypeID],
        employeeTypeID: parseInt(BulkUploadDetails.employeeTypeID),
        employeeSubCategoryMappingID: parseInt(BulkUploadDetails.employeeSubCategoryMappingID),
        registrationNumber: BulkUploadDetails.registrationNumber,
        year: BulkUploadDetails.year,
        noOfDays: BulkUploadDetails.noOfDays,
        createdBy: parseInt(tokenDecoder.getUserIDFromToken())
      }
      setIsUpdate(true);
      const consumedLeavesQty = eligibleLeaveQty - remainLeaveQty
      if (consumedLeavesQty > BulkUploadDetails.noOfDays) {
        alert.error("Consumed Leave Count Is Greater Than Eligible Leave Count")
      }
      else {
        let response = await services.UpdateLeaveDetails(updateModel);
        if (response.statusCode == "Success") {
          alert.success(response.message);
          navigate('/app/LeaveEligibilityBulkUpload/listing');
        }
        else {
          alert.error("Leave Eligibility Update Failed");
        }
      }
    }
    else {
      let requestData = selectedRows.map((row) => row.data);
      let response = await services.saveDetails(requestData);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        navigate('/app/LeaveEligibilityBulkUpload/listing');
      }
      else {
        alert.error("Leave Eligibility Save Failed!");
        clearFields();
      }
    }
  }

  function clearFields() {
    setBulkUploadDetails({
      ...BulkUploadDetails,
      leaveTypeID: 0,
      noOfDays: ''
    });
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

  function generateDropDownMenuWithTwoValues(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value.name}</MenuItem>);
      }
    }
    return items
  }

  async function GetDetailsByLeaveMasterID(employeeLeaveMasterID) {
    const bulkUploadDetails = await services.GetDetailsByLeaveMasterID(employeeLeaveMasterID);
    setBulkUploadDetails({
      ...BulkUploadDetails,
      groupID: bulkUploadDetails.groupID,
      factoryID: bulkUploadDetails.factoryID,
      costCenterID: bulkUploadDetails.divisionID,
      employeeTypeID: bulkUploadDetails.employeeTypeID,
      employeeSubCategoryMappingID: bulkUploadDetails.employeeSubCategoryMappingID,
      registrationNumber: bulkUploadDetails.registrationNumber,
      leaveTypeID: bulkUploadDetails.leaveTypeID,
      firstName: bulkUploadDetails.firstName,
      noOfDays: bulkUploadDetails.noOfDays,
      year: bulkUploadDetails.year
    })
    setIsUpdate(true);
    setRemainLeaveQty(parseInt(bulkUploadDetails.remainingLeaves))
    setEligibleLeaveQty(parseInt(bulkUploadDetails.noOfDays))
    setTitle("Edit Leave Eligibility Bulk");
  }

  const filteredArrayField = ArrayField.filter((row) => {
    return (
      row.registrationNumber.toLowerCase().includes(searchInput) ||
      row.firstName.toLowerCase().includes(searchInput.toLowerCase()) ||
      row.leaveTypeName.toLowerCase().includes(searchInput.toLowerCase())
    );
  });

  function handleChange1(e) {
    const target = e.target;
    const value = target.value
    setBulkUploadDetails({
      ...BulkUploadDetails,
      [e.target.name]: value
    });
  }

  function cardTitle() {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {title}
        </Grid>
        <Grid item md={2} xs={12}>
          <PageHeader
            onClick={handleClick}
          />
        </Grid>
      </Grid>
    )
  }

  return (
    <Page
      className={classes.root}
      title={title}
    >
      <LoadingComponent />
      <Container maxWidth={false}>
        <Formik
          initialValues={{
            groupID: BulkUploadDetails.groupID,
            factoryID: BulkUploadDetails.factoryID,
            costCenterID: BulkUploadDetails.costCenterID,
            employeeTypeID: BulkUploadDetails.employeeTypeID,
            employeeSubCategoryMappingID: BulkUploadDetails.employeeSubCategoryMappingID,
            leaveTypeID: BulkUploadDetails.leaveTypeID,
            noOfDays: BulkUploadDetails.noOfDays

          }}
          validationSchema={
            Yup.object().shape({
              groupID: Yup.number().required('Business Division required').min("1", 'Business Division is required'),
              factoryID: Yup.number().required('Location required').min("1", 'Location is required'),
              costCenterID: Yup.number().required('Sub Division required').min("1", 'Sub Division is required'),
              leaveTypeID: Yup.number().required('Leave Type required').min("1", 'Leave Type is required'),
              noOfDays: Yup.number().required('No. of Days required').min("1", 'No. of Days is required'),
            })
          }
          onSubmit={() => trackPromise(handleClickAdd())}
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
                    title={cardTitle()}
                  />
                  <PerfectScrollbar>
                    <Divider />
                    <CardContent>
                      <Grid container spacing={4}>
                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="groupID">
                            Business Division*
                          </InputLabel>
                          <TextField select
                            error={Boolean(touched.groupID && errors.groupID)}
                            fullWidth
                            helperText={touched.groupID && errors.groupID}
                            name="groupID"
                            onBlur={handleBlur}
                            onChange={(e) => handleChange1(e)}
                            value={BulkUploadDetails.groupID}
                            variant="outlined"
                            id="groupID"
                            InputProps={{
                              readOnly: isUpdate || !permissionList.isGroupFilterEnabled ? true : false
                            }}
                            size="small"
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
                            error={Boolean(touched.factoryID && errors.factoryID)}
                            fullWidth
                            helperText={touched.factoryID && errors.factoryID}
                            name="factoryID"
                            onBlur={handleBlur}
                            onChange={(e) => handleChange1(e)}
                            value={BulkUploadDetails.factoryID}
                            variant="outlined"
                            id="factoryID"
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
                          <InputLabel shrink id="costCenterID">
                            Sub Division *
                          </InputLabel>
                          <TextField select
                            error={Boolean(touched.costCenterID && errors.costCenterID)}
                            fullWidth
                            helperText={touched.costCenterID && errors.costCenterID}
                            name="costCenterID"
                            onBlur={handleBlur}
                            onChange={(e) => handleChange1(e)}
                            value={BulkUploadDetails.costCenterID}
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
                        </Grid>
                        {isUpdate ?
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="year">
                              Year
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="year"
                              type="text"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={BulkUploadDetails.year}
                              variant="outlined"
                              size="small"
                              InputProps={{
                                readOnly: true
                              }}
                            />
                          </Grid>
                          :
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="year">
                              Year
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="year"
                              type="text"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={new Date().getFullYear()}
                              variant="outlined"
                              size="small"
                              InputProps={{
                                readOnly: true
                              }}
                            />
                          </Grid>}
                      </Grid>
                      <Grid container spacing={3}>
                        {isUpdate ?
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="registrationNumber">
                              Employee ID
                            </InputLabel>
                            <TextField
                              fullWidth
                              size='small'
                              onBlur={handleBlur}
                              id="registrationNumber"
                              name="registrationNumber"
                              value={BulkUploadDetails.registrationNumber}
                              variant="outlined"
                              InputProps={{
                                readOnly: true
                              }}                            >
                            </TextField>
                          </Grid>
                          : null}
                        {isUpdate ?
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="firstName">
                              Employee Name *
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="firstName"
                              onBlur={handleBlur}
                              value={BulkUploadDetails.firstName}
                              variant="outlined"
                              id="firstName"
                              size="small"
                              InputProps={{
                                readOnly: true
                              }}
                            >
                            </TextField>
                          </Grid>
                          : null}
                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="employeeTypeID">
                            Employee Type
                          </InputLabel>
                          <TextField
                            select fullWidth
                            size='small'
                            onBlur={handleBlur}
                            id="employeeTypeID"
                            name="employeeTypeID"
                            value={BulkUploadDetails.employeeTypeID}
                            type="text"
                            variant="outlined"
                            onChange={(e) => handleChange1(e)}
                            InputProps={{
                              readOnly: true
                            }}
                          >
                            <MenuItem value="0">--Select Employee Type--</MenuItem>
                            {generateDropDownMenu(employeeType)}
                          </TextField>
                        </Grid>
                        {!isUpdate ?
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="employeeSubCategoryMappingID">
                              Employee Sub Category
                            </InputLabel>
                            <TextField select fullWidth
                              size='small'
                              onBlur={handleBlur}
                              id="employeeSubCategoryMappingID"
                              name="employeeSubCategoryMappingID"
                              value={BulkUploadDetails.employeeSubCategoryMappingID}
                              type="text"
                              variant="outlined"
                              onChange={(e) => handleChange1(e)}
                              InputProps={{
                                readOnly: isUpdate
                              }}
                            >
                              <MenuItem value="0">--Select Employee Sub Category--</MenuItem>
                              {generateDropDownMenu(employeeSubCategoryMapping)}
                            </TextField>
                          </Grid>
                          : null}
                        {(isUpdate && BulkUploadDetails.employeeSubCategoryMappingID > 0) ?
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="employeeSubCategoryMappingID">
                              Employee Sub Category
                            </InputLabel>
                            <TextField select fullWidth
                              size='small'
                              onBlur={handleBlur}
                              id="employeeSubCategoryMappingID"
                              name="employeeSubCategoryMappingID"
                              value={BulkUploadDetails.employeeSubCategoryMappingID}
                              type="text"
                              variant="outlined"
                              onChange={(e) => handleChange1(e)}
                              InputProps={{
                                readOnly: isUpdate
                              }}
                            >
                              <MenuItem value="0">--Select Employee Sub Category--</MenuItem>
                              {generateDropDownMenu(employeeSubCategoryMapping)}
                            </TextField>
                          </Grid>
                          : null}
                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="leaveTypeID">
                            Leave Type *
                          </InputLabel>
                          <TextField
                            select fullWidth
                            error={Boolean(touched.leaveTypeID && errors.leaveTypeID)}
                            helperText={touched.leaveTypeID && errors.leaveTypeID}
                            name="leaveTypeID"
                            onBlur={handleBlur}
                            onChange={(e) => handleChange1(e)}
                            value={BulkUploadDetails.leaveTypeID}
                            variant="outlined"
                            id="leaveTypeID"
                            size="small"
                            InputProps={{
                              readOnly: isUpdate
                            }}
                          >
                            <MenuItem value="0">--Select Leave Type--</MenuItem>
                            {generateDropDownMenu(leaveTypes)}
                          </TextField>
                        </Grid>
                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="noOfDays">
                            No of Days *
                          </InputLabel>
                          <TextField
                            fullWidth
                            error={Boolean(touched.noOfDays && errors.noOfDays)}
                            helperText={touched.noOfDays && errors.noOfDays}
                            name="noOfDays"
                            type="number"
                            onBlur={handleBlur}
                            onChange={(e) => handleChange1(e)}
                            value={BulkUploadDetails.noOfDays}
                            variant="outlined"
                            size="small"
                          />
                        </Grid>
                      </Grid>

                      {!isUpdate && ArrayField.length == 0 ?
                        <Box display="flex" justifyContent="flex-end" item p={2}>
                          <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                          >
                            Add
                          </Button>
                        </Box >
                        : null}
                    </CardContent>
                  </PerfectScrollbar>
                  <PerfectScrollbar>
                    <Box minWidth={1050}>
                      {ArrayField.length > 0 && isTableHide && !isUpdate ?
                        <Grid item xs={12}>
                          <Chip style={{ marginLeft: '1rem', backgroundColor: "#44a6c6 ", fontWeight: "bold" }} alignContent="center"
                            label={"Total Employee Count : " + employeeCount}
                            clickable
                            color="primary"
                          />
                          <TextField
                            label="Search"
                            variant="standard"
                            size="small"
                            value={searchInput}
                            onChange={handleSearchInputChange}
                            style={{ float: 'right', marginRight: '50px' }}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <SearchIcon />
                                </InputAdornment>
                              ),
                            }}
                          />
                          <TableContainer style={{ maxHeight: '550px', overflowY: 'auto' }}>
                            <Table className={classes.table} aria-label="sticky table" stickyHeader size="small" Table>
                              <TableHead style={{ position: "sticky", top: 0, zIndex: 1000, background: "white" }}>
                                <TableRow>
                                  <TableCell className={classes.sticky} align="center"><b>Registration Number</b></TableCell>
                                  <TableCell className={classes.sticky} align="center"><b>First Name</b></TableCell>
                                  <TableCell className={classes.sticky} align="center"><b>Leave Type</b></TableCell>
                                  <TableCell className={classes.sticky} align="center"><b>No. Of Days</b></TableCell>
                                  <TableCell className={classes.sticky} align="center">
                                    <b>Select All</b>
                                    <Checkbox
                                      indeterminate={
                                        selectedRows.length > 0 && selectedRows.length < ArrayField.length
                                      }
                                      checked={selectedRows.length === ArrayField.length}
                                      onChange={handleSelectAllClick}
                                    />
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {filteredArrayField.map((row, index) => {
                                  return <TableRow key={index}>
                                    <TableCell align="center" >{row.registrationNumber}
                                    </TableCell>
                                    <TableCell align="center" >{row.firstName}
                                    </TableCell>
                                    <TableCell align="center" >  {renderChips(row.leaveTypeName)}
                                    </TableCell>
                                    <TableCell align="center" >  {row.noOfDays}
                                    </TableCell>
                                    <TableCell align="center" padding='100px'>
                                      <Checkbox
                                        checked={selectedRows.some((selectedRow) => selectedRow.index === index)}
                                        onChange={(event) => handleRowCheckboxClick(event, index)}
                                      />
                                    </TableCell>
                                  </TableRow>
                                })}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Grid>
                        : null}

                      {!isUpdate && ArrayField.length > 0 && isTableHide && selectedRows.length > 0 ?
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <Box pr={2}>
                            <Button
                              color="primary"
                              variant="contained"
                              type="submit"
                              size='small'
                              onClick={saveDetails}
                            >
                              {isUpdate == true ? "Update" : "Save"}
                            </Button>
                          </Box>
                        </Box>
                        : null}

                      {isUpdate ?
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <Box pr={2}>
                            <Button
                              color="primary"
                              variant="contained"
                              type="submit"
                              size='small'
                              onClick={saveDetails}
                            >
                              {isUpdate == true ? "Update" : "Save"}
                            </Button>
                          </Box>
                        </Box>
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
  );
};
