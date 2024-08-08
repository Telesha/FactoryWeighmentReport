import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, Switch, CardHeader, MenuItem, TextareaAutosize
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
import tokenService from '../../../utils/tokenDecoder';
import Autocomplete from '@material-ui/lab/Autocomplete';

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
const screenCode = 'LEAVE';
export default function LeaveAddEdit(props) {
  const [title, setTitle] = useState("Add Leave Details")
  const [isUpdate, setIsUpdate] = useState(false);
  const [isHideField, setIsHideField] = useState(true);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const [employeeType, setEmployeeType] = useState(null)
  const [employeeSubCategoryMapping, setEmployeeSubCategoryMapping] = useState();
  const classes = useStyles();
  const [groups, setGroups] = useState()
  const [factories, setFactories] = useState()
  const [leaveDetails, setleaveDetails] = useState({
    groupID: '0',
    gardenID: '0',
    employeeID: '0',
    empName: '',
    nic: '',
    noOfDays: '',
    leaveType: '0',
    epfNo: '',
    regNo: '',
    employeeLeaveMasterID: '0',
    employeeTypeID: '0',
    employeeSubCategoryMappingID: '0'
  });
  const [leaveTypes, setLeaveTypes] = useState();
  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/app/leave/listing');
  }
  const alert = useAlert();

  const { employeeLeaveMasterID } = useParams();
  let decrypted = 0;


  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const [clearStatus, setClearStatus] = useState('');
  const [isCleared, setIsCleared] = useState(false);
  const [isClear, setIsClear] = useState(false);
  const [productOrderStatusList, setProductOrderStatusList] = useState([]);

  useEffect(() => {
    decrypted = atob(employeeLeaveMasterID.toString());
    if (decrypted != 0) {
      setIsUpdate(true);
      setTitle("Edit Leave Details");
      trackPromise(getEmployeeLeaveDetails(decrypted));
    }
    trackPromise(getPermissions(), getGroupsForDropdown(), getEmployeeTypesForDropdown(), GetAllEmployeeSubCategoryMapping());
  }, []);

  useEffect(() => {
    if (leaveDetails.groupID != '0') {
      trackPromise(getFactoriesForDropdown());
      trackPromise(getLeaveTypeForDropdown());
    }
  }, [leaveDetails.groupID]);

  useEffect(() => {
    if (leaveDetails.gardenID != '0') {
      trackPromise(getStatus());
    }
  }, [leaveDetails.gardenID]);

  useEffect(() => {
    if (leaveDetails.regNo !== '' && isUpdate == false) {
      trackPromise(getEmployeDetails())
    }
  }, [leaveDetails.regNo]);

  useEffect(() => {
    if (isUpdate == false) {
      setleaveDetails({
        ...leaveDetails,
        regNo: '',
        empName: '',
        nic: '',
        employeeTypeID: '0',
        employeeSubCategoryMappingID: '0',
      });
      setIsCleared(true);
    }
  }, [leaveDetails.gardenID]);

  useEffect(() => {
    if (isUpdate == false) {
      setleaveDetails({
        ...leaveDetails,
        empName: '',
        nic: '',
        employeeTypeID: '0',
        employeeSubCategoryMappingID: '0',
      });
      setIsCleared(true);
    }
  }, [leaveDetails.regNo]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITLEAVE');

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
      setleaveDetails({
        ...leaveDetails,
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
    const factories = await services.getAllFactoriesByGroupID(leaveDetails.groupID);
    setFactories(factories);
  }

  async function getLeaveTypeForDropdown() {
    const leaveTypes = await services.getEmployeeLeaveType(leaveDetails.groupID);
    setLeaveTypes(leaveTypes);
  }

  async function getEmployeeTypesForDropdown() {
    const types = await services.getEmployeeTypesForDropdown();
    setEmployeeType(types);
  }

  async function GetAllEmployeeSubCategoryMapping() {
    const result = await services.GetAllEmployeeSubCategoryMapping();
    setEmployeeSubCategoryMapping(result)
  }

  async function getEmployeeLeaveDetails(employeeLeaveMasterID) {
    const response = await services.getLeaveDetailsByEmployeeLeaveDetailsID(employeeLeaveMasterID);
    if (response.statusCode == 'Success') {
      let data = response.data;

      setleaveDetails({
        ...leaveDetails,
        groupID: data.groupID,
        gardenID: data.gardenID,
        employeeID: data.employeeID,
        employeeTypeID: data.employeeTypeID,
        empName: data.employeeName,
        nic: data.nicNumber,
        noOfDays: data.allocatedDays,
        leaveType: data.leaveType,
        epfNo: data.epfNo,
        regNo: data.registrationNumber,
        employeeLeaveMasterID: data.employeeLeaveMasterID,
        employeeSubCategoryMappingID: data.employeeSubCategoryMappingID
      });
    }
    else {
      alert.error('Error Occur In Employee Leave Update.');
    }

  }

  async function getEmployeDetails() {
    const response = await services.getEmployeeDetailsByFactoryIDRegistrationNumberEPFNumber(leaveDetails.gardenID, leaveDetails.regNo, leaveDetails.epfNo);
    if (response === null) {
      setIsHideField(true);
      alert.error("THIS IS INACTIVE EMPLOYEE REG NO");
    }
    else {
      setIsHideField(false);
      let data = response.data;
      setleaveDetails({
        ...leaveDetails,
        empName: data.fullName,
        nic: data.nicNumber,
        employeeID: data.employeeID,
        employeeTypeID: data.employeeTypeID,
        employeeSubCategoryMappingID: data.employeeSubCategoryMappingID
      })
    }
  }

  async function SaveLeaveDetails() {
    if (isUpdate == true) {
      let response = await services.UpdateLeaveDetails(leaveDetails, tokenService.getUserIDFromToken());
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        clearFields();
        navigate('/app/leave/listing');
      }
      else {
        alert.error(response.message);
      }
    }
    else {
      if (leaveDetails.empName != 0 && leaveDetails.nic != 0) {
        if (leaveDetails.leaveType != 0) {
          let response = await services.saveEmployeeLeaveDetails(leaveDetails, tokenService.getUserIDFromToken());
          if (response.statusCode == "Success") {
            alert.success(response.message);
            setIsDisableButton(true);
            clearFields();
            navigate('/app/leave/listing');
          }
          else {
            alert.error(response.message);
          }
        }
        else {
          alert.error('Please Select a Leave Type');
        }
      }
      else {
        alert.error('Enter Valid Registration Number');
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
    setleaveDetails({
      ...leaveDetails,
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
          <PageHeader
            onClick={handleClick}
          />
        </Grid>
      </Grid>
    )
  }

  function clearFields() {
    setleaveDetails({
      ...leaveDetails,
      regNo: '',
      epfNo: '',
      leaveType: '0',
      reason: '0',
      shedule: '0',
      noOfDays: ''
    });
    setIsHideField(true)
  }

  function handleSearchDropdownChangeStatus(data, e) {
    if (data === undefined || data === null) {
      setleaveDetails({
        ...leaveDetails,
        regNo: '0'
      });
      return;
    } else {
      var nameV = "RegistrationNumber";
      var valueV = data.registrationNumber;
      setleaveDetails({
        ...leaveDetails,
        regNo: valueV.toString()
      });
    }
  }

  async function getStatus() {
    let response = await services.getStatus(leaveDetails.gardenID);
    setProductOrderStatusList(response);
  }

  return (
    <Page
      className={classes.root}
      title="Add Leave Details"
    >
      <LoadingComponent />
      <Container maxWidth={false}>
        <Formik
          initialValues={{
            groupID: leaveDetails.groupID,
            gardenID: leaveDetails.gardenID,
            regNo: leaveDetails.regNo,
            empName: leaveDetails.empName,
            nic: leaveDetails.nic,
            leaveType: leaveDetails.leaveType,
            noOfDays: leaveDetails.noOfDays
          }}
          validationSchema={
            Yup.object().shape({
              groupID: Yup.number().required('Business Division required').min("1", 'Business Division is required'),
              gardenID: Yup.number().required('Location is required').min("1", 'Location is required'),
              regNo: Yup.string().required('Registration Number is required'),
              empName: Yup.string().required('Employee Name is required'),
              nic: Yup.string().required('NIC Number is required'),
              leaveType: Yup.number().required('Leave Type is required'),
              noOfDays: Yup.number().required('Number of Days is required')
            })
          }
          onSubmit={() => trackPromise(SaveLeaveDetails())}
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
                      <Grid container spacing={4}>
                        <Grid item md={4} xs={12}>
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
                            value={leaveDetails.groupID}
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
                        <Grid item md={4} xs={12}>
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
                            value={leaveDetails.gardenID}
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
                        {isUpdate ?
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="regNo">
                              Emp.ID *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.regNo && errors.regNo)}
                              fullWidth
                              helperText={touched.regNo && errors.regNo}
                              name="regNo"
                              onBlur={handleBlur}
                              value={leaveDetails.regNo}
                              variant="outlined"
                              disabled={isDisableButton}
                              InputProps={{
                                readOnly: isUpdate
                              }}
                              size='small'
                            />
                          </Grid>

                          :
                          <Grid item md={4} xs={12}>

                            <InputLabel shrink id="regNo">
                              Emp.ID *
                            </InputLabel>
                            <Autocomplete
                              key={isCleared}
                              id="regNo"
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
                                  name="regNo"
                                  //label="Emp ID *"
                                  size="small"
                                  fullWidth
                                  error={Boolean(
                                    touched.regNo && errors.regNo
                                  )}
                                  helperText={touched.regNo && errors.regNo}
                                  value={leaveDetails.regNo}
                                  getOptionDisabled={true}
                                  onBlur={handleBlur}
                                />
                              )}
                            />
                          </Grid>
                        }
                      </Grid>
                      <Grid container spacing={3}>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="empName">
                            Employee Name
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.empName && errors.empName)}
                            fullWidth
                            helperText={touched.empName && errors.empName}
                            name="empName"
                            onBlur={handleBlur}
                            value={leaveDetails.empName}
                            variant="outlined"
                            disabled={isDisableButton}
                            InputProps={{
                              readOnly: true
                            }}
                            size='small'
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="nic">
                            NIC
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.nic && errors.nic)}
                            fullWidth
                            helperText={touched.nic && errors.nic}
                            name="nic"
                            onBlur={handleBlur}
                            value={leaveDetails.nic}
                            variant="outlined"
                            disabled={isDisableButton}
                            InputProps={{
                              readOnly: true
                            }}
                            size='small'
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="employeeTypeID">
                            Employee Type
                          </InputLabel>
                          <TextField select fullWidth
                            error={Boolean(touched.employeeTypeID && errors.employeeTypeID)}
                            helperText={touched.employeeTypeID && errors.employeeTypeID}
                            size='small'
                            onBlur={handleBlur}
                            id="employeeTypeID"
                            name="employeeTypeID"
                            value={leaveDetails.employeeTypeID}
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
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="employeeSubCategoryMappingID">
                            Employee Sub Category
                          </InputLabel>
                          <TextField select fullWidth
                            error={Boolean(touched.employeeSubCategoryMappingID && errors.employeeSubCategoryMappingID)}
                            helperText={touched.employeeSubCategoryMappingID && errors.employeeSubCategoryMappingID}
                            size='small'
                            onBlur={handleBlur}
                            id="employeeSubCategoryMappingID"
                            name="employeeSubCategoryMappingID"
                            value={leaveDetails.employeeSubCategoryMappingID}
                            type="text"
                            variant="outlined"
                            onChange={(e) => handleChange1(e)}
                            InputProps={{
                              readOnly: true
                            }}
                          >
                            <MenuItem value="0"></MenuItem>
                            {generateDropDownMenu(employeeSubCategoryMapping)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="leaveType">
                            Leave Type *
                          </InputLabel>
                          <TextField select
                            error={Boolean(touched.leaveType && errors.leaveType)}
                            fullWidth
                            helperText={touched.leaveType && errors.leaveType}
                            name="leaveType"
                            onBlur={handleBlur}
                            onChange={(e) => handleChange1(e)}
                            value={leaveDetails.leaveType}
                            variant="outlined"
                            id="leaveType"
                            InputProps={{
                              readOnly: isUpdate ? true : false
                            }}
                            size="small"
                          >
                            <MenuItem value="0">--Select Leave Type--</MenuItem>
                            {generateDropDownMenu(leaveTypes)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="noOfDays">
                            No of Days *
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.noOfDays && errors.noOfDays)}
                            fullWidth
                            helperText={touched.noOfDays && errors.noOfDays}
                            name="noOfDays"
                            type="number"
                            onBlur={handleBlur}
                            onChange={(e) => handleChange1(e)}
                            value={leaveDetails.noOfDays}
                            variant="outlined"
                            size="small"
                          />
                        </Grid>
                      </Grid>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          color="primary"
                          disabled={isSubmitting || isDisableButton}
                          type="submit"
                          variant="contained"
                        >
                          {isUpdate == true ? "Update" : "Save"}
                        </Button>
                      </Box>
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
