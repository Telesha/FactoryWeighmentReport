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
import MaterialTable from "material-table";
import { LoadingComponent } from '../../../utils/newLoader';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import SearchNotFound from 'src/views/Common/SearchNotFound';
import { CustomTable } from './CustomTable';

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

export default function LeaveListing() {
  const classes = useStyles();
  const [employeeLeaveDetailsData, setEmployeeLeaveDetailsData] = useState([]);
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [leaveTypes, setLeaveTypes] = useState();
  const [isHideField, setIsHideField] = useState(true);
  const [employeeLeaveMasterID, setemployeeLeaveMasterID] = useState(0);
  const [employeeLeaveDetails, setEmployeeLeaveDetails] = useState({
    groupID: 0,
    gardenID: 0,
    leaveTypeID: 0,
    regNo: ''
  })

  const navigate = useNavigate();
  let encrypted = "";

  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/leave/addEdit/' + encrypted);
  }

  const handleClickEdit = (employeeLeaveMasterID) => {
    encrypted = btoa(employeeLeaveMasterID.toString());
    navigate('/app/leave/addEdit/' + encrypted);
  }

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const alert = useAlert();

  useEffect(() => {
    if (employeeLeaveMasterID != 0) {
      handleClickEdit(employeeLeaveMasterID)
    }
  }, [employeeLeaveMasterID]);

  useEffect(() => {
    trackPromise(getPermissions(), getGroupsForDropdown());
  }, []);

  useEffect(() => {
    if (employeeLeaveDetails.groupID > 0) {
      trackPromise(getFactoriesForDropdown());
    }
  }, [employeeLeaveDetails.groupID]);

  useEffect(() => {
    trackPromise(getLeaveTypeForDropdown());
  }, [employeeLeaveDetails.groupID]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWLEAVE');

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

    setEmployeeLeaveDetails({
      ...employeeLeaveDetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      gardenID: parseInt(tokenService.getFactoryIDFromToken()),

    })
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

  async function getEmployeeLeaveDetails() {
    let model = {
      groupID: parseInt(employeeLeaveDetails.groupID),
      OperationEntityID: parseInt(employeeLeaveDetails.gardenID),
      leaveTypeID: parseInt(employeeLeaveDetails.leaveTypeID),
      registrationNumber: employeeLeaveDetails.regNo
    }
    const response = await services.GetEmployeeLeaveDetailsByGroupFactoryRegistrationNo(model);
    if (response.statusCode == 'Success') {
      setEmployeeLeaveDetailsData(response.data);
      setIsHideField(false);
    }
    else {
      setIsHideField(true);
      alert.error("No records to display");
    }
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

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setEmployeeLeaveDetails({
      ...employeeLeaveDetails,
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
      title="Leaves"
    >
      <LoadingComponent />
      <Container maxWidth={false}>

        <Formik
          initialValues={{
            groupID: employeeLeaveDetails.groupID,
            gardenID: employeeLeaveDetails.gardenID,
            leaveTypeID: employeeLeaveDetails.leaveTypeID,
            regNo: employeeLeaveDetails.regNo,
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
                    title={cardTitle("Leaves")}
                  />
                  <Divider />
                  <CardContent style={{ marginBottom: "2rem" }}>
                    <Grid container spacing={3}>
                      <Grid item md={4} xs={12}>
                        <InputLabel shrink id="groupID">
                          Business Division *
                        </InputLabel>
                        <TextField select
                          error={Boolean(touched.groupID && errors.groupID)}
                          fullWidth
                          helperText={touched.groupID && errors.groupID}
                          name="groupID"
                          onChange={(e) => handleChange(e)}
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

                      <Grid item md={4} xs={12}>
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

                      <Grid item md={4} xs={12}>
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
                          <MenuItem value="0">--Select Leave Type--</MenuItem>
                          {generateDropDownMenu(leaveTypes)}
                        </TextField>
                      </Grid>

                      <Grid item md={4} xs={12}>
                        <InputLabel shrink id="regNo">
                          Employee ID
                        </InputLabel>
                        <TextField
                          error={Boolean(touched.regNo && errors.regNo)}
                          fullWidth
                          helperText={touched.regNo && errors.regNo}
                          name="regNo"
                          onBlur={handleBlur}
                          onChange={(e) => handleChange(e)}
                          value={employeeLeaveDetails.regNo}
                          variant="outlined"
                          size="small"
                        />
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
                      <CustomTable employeeLeaveDetailsData={employeeLeaveDetailsData} setemployeeLeaveMasterID={setemployeeLeaveMasterID} permissionList={permissionList.isAddEditScreen} />
                      : <SearchNotFound searchQuery="Leaves" />}
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
