import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Card, makeStyles, Container, CardHeader, Button, CardContent, Divider, MenuItem, Grid, InputLabel, TextField } from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { LoadingComponent } from '../../../utils/newLoader';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import SearchNotFound from 'src/views/Common/SearchNotFound';
import { CustomTable } from './CustomTable';
import xlsx from 'json-as-xlsx';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
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
  }
}));

const screenCode = 'LEAVEELIGIBILITYBULKUPLOAD';
export default function LeaveEligibilityBulkUploadListing() {
  const classes = useStyles();
  const [employeeLeaveDetailsData, setEmployeeLeaveDetailsData] = useState([]);
  const [csvHeaders, SetCsvHeaders] = useState([]);
  const [employeeLeaveMasterID, setemployeeLeaveMasterID] = useState(0);
  const [excel, setExcel] = useState(false);
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [employeeType, setEmployeeType] = useState(null)
  const [employeeSubCategoryMapping, setEmployeeSubCategoryMapping] = useState();
  const [leaveTypes, setLeaveTypes] = useState();
  const [isHideField, setIsHideField] = useState(true);
  const [costCenters, setCostCenters] = useState();
  const [initialLoad, setInitialLoad] = useState(null);
  const [employeeLeaveDetails, setEmployeeLeaveDetails] = useState({
    groupID: '0',
    gardenID: '0',
    costCenterID: '0',
    regNo: '',
    employeeTypeID: '0',
    employeeSubCategoryMappingID: '0',
    leaveTypeID: '0',
    year: new Date().toISOString().toString()
  })
  const navigate = useNavigate();

  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    let model = {
      groupID: parseInt(employeeLeaveDetails.groupID),
      gardenID: parseInt(employeeLeaveDetails.gardenID),
      costCenterID: parseInt(employeeLeaveDetails.costCenterID),
      regNo: employeeLeaveDetails.regNo,
      employeeTypeID: parseInt(employeeLeaveDetails.employeeTypeID),
      employeeSubCategoryMappingID: parseInt(employeeLeaveDetails.employeeSubCategoryMappingID),
      leaveTypeID: parseInt(employeeLeaveDetails.leaveTypeID),
      year: new Date().toISOString().toString()
    }
    sessionStorage.setItem(
      'leave-eligibility-bulk-upload-listing-page-search-parameters-id',
      JSON.stringify(model)
    );
    navigate('/app/LeaveEligibilityBulkUpload/addEdit/' + encrypted);
  }

  const handleClickEdit = (employeeLeaveMasterID) => {
    encrypted = btoa(employeeLeaveMasterID.toString());
    let model = {
      groupID: parseInt(employeeLeaveDetails.groupID),
      gardenID: parseInt(employeeLeaveDetails.gardenID),
      costCenterID: parseInt(employeeLeaveDetails.costCenterID),
      regNo: employeeLeaveDetails.regNo,
      employeeTypeID: parseInt(employeeLeaveDetails.employeeTypeID),
      employeeSubCategoryMappingID: parseInt(employeeLeaveDetails.employeeSubCategoryMappingID),
      leaveTypeID: parseInt(employeeLeaveDetails.leaveTypeID),
      year: new Date().toISOString().toString()
    }
    sessionStorage.setItem(
      'leave-eligibility-bulk-upload-listing-page-search-parameters-id',
      JSON.stringify(model)
    );
    navigate('/app/LeaveEligibilityBulkUpload/addEdit/' + encrypted);
  }

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  const alert = useAlert();

  useEffect(() => {
    const IDdata = JSON.parse(
      sessionStorage.getItem('leave-eligibility-bulk-upload-listing-page-search-parameters-id')
    )
    if (IDdata != null) {
      setEmployeeLeaveDetails({
        ...employeeLeaveDetails,
        groupID: parseInt(IDdata.groupID),
        gardenID: parseInt(IDdata.gardenID),
        costCenterID: parseInt(IDdata.costCenterID),
        regNo: IDdata.regNo,
        employeeTypeID: parseInt(IDdata.employeeTypeID),
        employeeSubCategoryMappingID: parseInt(IDdata.employeeSubCategoryMappingID),
        leaveTypeID: parseInt(IDdata.leaveTypeID),
        year: new Date().toISOString().toString()
      })
      setInitialLoad(IDdata);
    }
    trackPromise(getPermissions(IDdata));
  }, []);

  useEffect(() => {
    sessionStorage.removeItem(
      'leave-eligibility-bulk-upload-listing-page-search-parameters-id'
    );
  }, []);

  useEffect(() => {
    trackPromise(
      getGroupsForDropdown(),
      getEmployeeTypesForDropdown());
  }, []);

  useEffect(() => {
    if (employeeLeaveDetails.groupID > 0) {
      trackPromise(getFactoriesForDropdown(),
        getLeaveTypeForDropdown());
    }
  }, [employeeLeaveDetails.groupID]);

  useEffect(() => {
    if (employeeLeaveDetails.gardenID > 0) {
      trackPromise(getCostCenterDetailsByGardenID())
    }
  }, [employeeLeaveDetails.gardenID]);

  useEffect(() => {
    trackPromise(GetAllEmployeeSubCategoryMapping());
  }, [employeeLeaveDetails.employeeTypeID]);

  useEffect(() => {
    if (excel == true) {
      createFile()
    }
  }, [excel]);

  useEffect(() => {
    setEmployeeLeaveDetailsData([])
  }, [employeeLeaveDetails]);

  useEffect(() => {
    if (employeeLeaveMasterID != 0) {
      handleClickEdit(employeeLeaveMasterID)
    }
  }, [employeeLeaveMasterID]);

  useEffect(() => {
    if (initialLoad != null) {
      trackPromise(
        getEmployeeLeaveDetails())
    }
  }, [initialLoad]);

  async function getPermissions(IDdata) {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWLEAVEELIGIBILITYBULKUPLOAD');
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

    if (IDdata === null) {
      setEmployeeLeaveDetails({
        ...employeeLeaveDetails,
        groupID: parseInt(tokenService.getGroupIDFromToken()),
        gardenID: parseInt(tokenService.getFactoryIDFromToken())
      })
    }
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getAllFactoriesByGroupID(employeeLeaveDetails.groupID);
    setFactories(factories);
  }

  async function getLeaveTypeForDropdown() {
    const leaveTypes = await services.getEmployeeLeaveType(employeeLeaveDetails.groupID);
    let leaveTypeArray = []
    for (let item of Object.entries(leaveTypes)) {
      leaveTypeArray[item[1]["employeeLeaveTypeID"]] = item[1]["employeeLeaveTypeName"]
    }
    setLeaveTypes(leaveTypeArray);
  }

  async function getEmployeeTypesForDropdown() {
    let types = await services.getEmployeeTypesForDropdown();
    let empTypeArray = []
    for (let item of Object.entries(types)) {
      empTypeArray[item[1]["employeeTypeID"]] = item[1]["employeeTypeName"]
    }
    setEmployeeType(empTypeArray);
  }

  async function GetAllEmployeeSubCategoryMapping() {
    setEmployeeSubCategoryMapping([])
    var result = 0;
    if (employeeLeaveDetails.employeeTypeID == '0') {
      result = await services.GetAllEmployeeSubCategoryMapping();
    }
    else {
      result = await services.GetAllEmployeeSubCategoryMappingByTypeID(employeeLeaveDetails.employeeTypeID);
    }
    setEmployeeSubCategoryMapping(result)
  }
  async function getCostCenterDetailsByGardenID() {
    var response = await services.getDivisionDetailsByEstateID(employeeLeaveDetails.gardenID);
    setCostCenters(response);
  };

  function generateDropDownMenu(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
      }
    }
    return items
  }

  async function getEmployeeLeaveDetails() {
    let model = {
      groupID: parseInt(employeeLeaveDetails.groupID),
      estateID: parseInt(employeeLeaveDetails.gardenID),
      costCenterID: parseInt(employeeLeaveDetails.costCenterID),
      employeeTypeID: parseInt(employeeLeaveDetails.employeeTypeID),
      employeeSubCategoryMappingID: parseInt(employeeLeaveDetails.employeeSubCategoryMappingID),
      leaveTypeID: parseInt(employeeLeaveDetails.leaveTypeID),
      registrationNumber: employeeLeaveDetails.regNo,
      year: moment(employeeLeaveDetails.year).format('YYYY')
    }
    const response = await services.GetLeaveEligibilityDetailByIDs(model);
    if (response.statusCode == 'Success') {
      setEmployeeLeaveDetailsData(response.data);
      setIsHideField(false);
    }
    else {
      setIsHideField(true);
      alert.error("No records to display");
    }
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setEmployeeLeaveDetails({
      ...employeeLeaveDetails,
      [e.target.name]: value
    });
  }

  function handleDateChange(value) {
    setEmployeeLeaveDetails({
      ...employeeLeaveDetails,
      year: value
    })
  }

  function handleGroupChange(e) {
    const target = e.target;
    const value = target.value
    setEmployeeLeaveDetails({
      ...employeeLeaveDetails,
      [e.target.name]: value,
      gardenID: "0",
      costCenterID: "0"
    });
  }

  function handleEmpTypeChange(e) {
    const target = e.target;
    const value = target.value
    setEmployeeLeaveDetails({
      ...employeeLeaveDetails,
      [e.target.name]: value,
      employeeSubCategoryMappingID: "0"
    });
  }



  async function createDataForExcel(array) {
    var res = [];
    if (array != null) {
      array.map(x => {
        var vr = {
          'Employee ID': x.registrationNumber,
          'Employee Name': x.firstName,
          'Leave Type': x.leaveTypeName,
          'Total Leave Count': x.noOfDays,
          'Remaining Leaves': x.remainingLeaves == null ? x.noOfDays : x.remainingLeaves,
          'Status': x.isActive == true ? 'Active' : 'InActive'
        }
        res.push(vr);
      });
    }
    return res;
  }

  async function createFile() {
    setExcel(false);
    var file = await createDataForExcel(employeeLeaveDetailsData);
    var settings = {
      sheetName: 'Leave Details',
      fileName: 'Employee Leave Details',
      writeOptions: {}
    }

    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let dataA = [
      {
        sheet: 'Employee Leave Details',
        columns: tempcsvHeaders,
        content: file
      }
    ]
    xlsx(dataA, settings);
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
            isEdit={true}
            toolTiptitle={"Add Leave Details"}
          />
        </Grid>
      </Grid>
    )
  }


  return (
    <Page
      className={classes.root}
      title="Leave Eligibility Bulk Upload"
    >
      <LoadingComponent />
      <Container maxWidth={false}>
        <Formik
          initialValues={{
            groupID: employeeLeaveDetails.groupID,
            gardenID: employeeLeaveDetails.gardenID,
            costCenterID: employeeLeaveDetails.costCenterID,
            regNo: employeeLeaveDetails.regNo,
            employeeTypeID: employeeLeaveDetails.employeeTypeID,
            employeeSubCategoryMappingID: employeeLeaveDetails.employeeSubCategoryMappingID,
            leaveTypeID: employeeLeaveDetails.leaveTypeID,
            year: employeeLeaveDetails.year
          }}
          validationSchema={
            Yup.object().shape({
              groupID: Yup.number().required('Business Division is required').min("1", 'Business Division is required'),
              gardenID: Yup.number().required('Location is required').min("1", 'Location is required')
            })
          }
          onSubmit={() => trackPromise(getEmployeeLeaveDetails())}
          enableReinitialize
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
                    title={cardTitle("Leave Eligibility Bulk Upload")}
                  />
                  <Divider />
                  <CardContent style={{ marginBottom: "2rem" }}>
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
                          onChange={(e) => handleGroupChange(e)}
                          value={employeeLeaveDetails.groupID}
                          variant="outlined"
                          size='small'
                          InputProps={{
                            readOnly: !permissionList.isGroupFilterEnabled ? true : false
                          }}
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
                          onChange={(e) => handleChange(e)}
                          value={employeeLeaveDetails.gardenID}
                          variant="outlined"
                          size='small'
                          InputProps={{
                            readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                          }}
                        >
                          <MenuItem value="0">--Select Location--</MenuItem>
                          {generateDropDownMenu(factories)}
                        </TextField>
                      </Grid>
                      <Grid item md={3} xs={12}>
                        <InputLabel shrink id="costCenterID">
                          Sub Division
                        </InputLabel>
                        <TextField select
                          error={Boolean(touched.costCenterID && errors.costCenterID)}
                          fullWidth
                          helperText={touched.costCenterID && errors.costCenterID}
                          name="costCenterID"
                          onBlur={handleBlur}
                          onChange={(e) => handleChange(e)}
                          value={employeeLeaveDetails.costCenterID}
                          variant="outlined"
                          id="costCenterID"
                          size='small'
                        >
                          <MenuItem value="0">--All Sub Division--</MenuItem>
                          {generateDropDownMenu(costCenters)}
                        </TextField>
                      </Grid>
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
                          value={employeeLeaveDetails.employeeTypeID}
                          type="text"
                          variant="outlined"
                          onChange={(e) => handleEmpTypeChange(e)}
                        >
                          <MenuItem value="0">--All Employee Type--</MenuItem>
                          {generateDropDownMenu(employeeType)}
                        </TextField>
                      </Grid>
                      <Grid item md={3} xs={12}>
                        <InputLabel shrink id="employeeSubCategoryMappingID">
                          Employee Sub Category
                        </InputLabel>
                        <TextField select fullWidth
                          size='small'
                          onBlur={handleBlur}
                          id="employeeSubCategoryMappingID"
                          name="employeeSubCategoryMappingID"
                          value={employeeLeaveDetails.employeeSubCategoryMappingID}
                          type="text"
                          variant="outlined"
                          onChange={(e) => handleChange(e)}
                        >
                          <MenuItem value="0">--All Employee Sub Category--</MenuItem>
                          {generateDropDownMenu(employeeSubCategoryMapping)}
                        </TextField>
                      </Grid>
                      <Grid item md={3} xs={12}>
                        <InputLabel shrink id="leaveTypeID">
                          Leave Type
                        </InputLabel>
                        <TextField
                          select fullWidth
                          name="leaveTypeID"
                          onBlur={handleBlur}
                          onChange={(e) => handleChange(e)}
                          value={employeeLeaveDetails.leaveTypeID}
                          variant="outlined"
                          id="leaveTypeID"
                          size="small"
                        >
                          <MenuItem value="0">--All Leave Type--</MenuItem>
                          {generateDropDownMenu(leaveTypes)}
                        </TextField>
                      </Grid>
                      <Grid item md={3} xs={12}>
                        <InputLabel shrink id="regNo">
                          Reg. No.
                        </InputLabel>
                        <TextField
                          fullWidth
                          name="regNo"
                          onBlur={handleBlur}
                          onChange={(e) => handleChange(e)}
                          value={employeeLeaveDetails.regNo}
                          variant="outlined"
                          size="small"
                        />
                      </Grid>
                      <Grid item md={3} xs={12}>
                        <InputLabel shrink id="lastYear" style={{ marginBottom: '-8px' }}>
                          Year *
                        </InputLabel>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                          <KeyboardDatePicker
                            error={Boolean(touched.year && errors.year)}
                            fullWidth
                            helperText={touched.year && errors.year}
                            autoOk
                            views={['year']}
                            inputVariant="outlined"
                            margin="dense"
                            name="year"
                            disableFuture
                            value={employeeLeaveDetails.year}
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
                    <Box display="flex" justifyContent="flex-end" p={2}>
                      <Button
                        color="primary"
                        type="submit"
                        variant="contained"

                      >
                        Search
                      </Button>
                    </Box>
                  </CardContent>
                  <PerfectScrollbar>
                    {employeeLeaveDetailsData.length > 0 ?
                      <CustomTable employeeLeaveDetailsData={employeeLeaveDetailsData} setemployeeLeaveMasterID={setemployeeLeaveMasterID} setExcel={setExcel} />
                      : <SearchNotFound searchQuery="Leave Eligibility" />}
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
