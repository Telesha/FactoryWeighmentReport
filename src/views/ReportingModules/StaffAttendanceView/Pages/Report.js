import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  Button,
  makeStyles,
  Container,
  Divider,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  MenuItem,
  InputLabel
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from '../../../../utils/newLoader';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import MaterialTable from "material-table";
import { useAlert } from "react-alert";

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
  row: {
    marginTop: '1rem'
  },
  colorCancel: {
    backgroundColor: "red",
  },
  colorRecordAndNew: {
    backgroundColor: "#FFBE00"
  },
  colorRecord: {
    backgroundColor: "green",
  }



}));

const screenCode = 'STAFFATTENDANCEVIEW';

export default function StaffAttendanceView(props) {
  const [title, setTitle] = useState("Staff Attendances View")
  const classes = useStyles();
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [routes, setRoutes] = useState();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [routeSummaryData, setRouteSummaryData] = useState(true);
  const [isTableHide, setIsTableHide] = useState(true);
  const [routeSummaryDetails, setRouteSummaryDetails] = useState({
    groupID: '0',
    factoryID: '0',
    routeID: '0',
    date: ''
  })
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const componentRef = useRef();
  const navigate = useNavigate();
  const alert = useAlert();

  function createData(empNo, empName, empType, jobCategory, job, workType, field, attendance, isTable) {
    return { empNo, empName, empType, jobCategory, job, workType, field, attendance, isTable };
  }

  const rows = [
    createData("5718", "R.G.GANESHAMOORTHY", "Registered", "Weeding", "Manual Weeding", "Division Labour", "AT30", "Full", "Yes"),
    createData("5962", "R.WIJAYAKUMAR", "Registered", "Weeding", "Manual Weeding", "Division Labour", "AT31", "Full", "Yes"),
    createData("5832", "R.RAJALETCHUMY", "Registered", "Weeding", "Manual Weeding", "Division Labour", "AT32", "Full", "Yes"),
    createData("5931", "S.K.ROSHAN", "Registered", "Sanitation", "Bush Sanitation", "Division Labour", "AT33", "Half", "No"),
    createData("5961", "M.THIRUMONEY", "Registered", "Spray", "Chemical Spray", "Lent Labour", "AT34", "Half", "No"),
  ];

  useEffect(() => {
    trackPromise(getGroupsForDropdown(), getPermission());
  }, []);

  useEffect(() => {
    trackPromise(getFactoriesForDropDown());
  }, [routeSummaryDetails.groupID]);

  useEffect(() => {
    trackPromise(getRoutesByFactoryID());
  }, [routeSummaryDetails.factoryID]);



  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWSTAFFATTENDANCEVIEW');



    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');



    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
    });

    setRouteSummaryDetails({
      ...routeSummaryDetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }
  async function getFactoriesForDropDown() {
    const factory = await services.getFactoryByGroupID(routeSummaryDetails.groupID);
    setFactories(factory);
  }
  async function getRoutesByFactoryID() {
    const routeList = await services.getRoutesForDropDown(routeSummaryDetails.factoryID);
    setRoutes(routeList);
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



  async function GetDetails() {
    await timeout(1000);
    setIsTableHide(false);

  }

  function timeout(delay) {
    return new Promise(res => setTimeout(res, delay));
  }

  async function ClearTable() {
    clearState();
  }

  function clearState() {
    setRouteSummaryDetails({
      ...routeSummaryDetails,
      routeID: "0",
      date: ""
    });
    setIsTableHide(true);
  }

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {titleName}
        </Grid>
      </Grid>
    )
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setRouteSummaryDetails({
      ...routeSummaryDetails,
      [e.target.name]: value
    });
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: routeSummaryDetails.groupID,
              factoryID: routeSummaryDetails.factoryID,
              date: routeSummaryDetails.date
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
              })
            }
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
                      title={cardTitle(title)}
                    />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={4}>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="groupID">
                              Group *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="groupID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={routeSummaryDetails.groupID}
                              variant="outlined"
                              id="groupID"
                            // disabled={!permissionList.isGroupFilterEnabled}

                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              <MenuItem value="1">Ispahani</MenuItem>
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="factoryID">
                              Estate *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.factoryID && errors.factoryID)}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              name="factoryID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={routeSummaryDetails.factoryID}
                              variant="outlined"
                              id="factoryID"
                            // disabled={!permissionList.isFactoryFilterEnabled}

                            >
                              <MenuItem value="0">--Select Estate--</MenuItem>
                              <MenuItem value="1">Ispahani</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="routeID">
                              Division
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="routeID"
                              onChange={(e) => handleChange(e)}
                              value={routeSummaryDetails.routeID}
                              variant="outlined"
                              id="routeID"
                            >
                              <MenuItem value="0">--Select Division--</MenuItem>
                              <MenuItem value="1">Division One</MenuItem>
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="date">
                              Date *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.date && errors.date)}
                              helperText={touched.date && errors.date}
                              fullWidth
                              name="date"
                              type="date"
                              onChange={(e) => handleChange(e)}
                              value={routeSummaryDetails.date}
                              variant="outlined"
                              id="date"
                            />
                          </Grid>
                          <br />
                          <br />
                          <Grid container justify="flex-end">
                            <Box pr={2}>
                              <Button
                                color="primary"
                                variant="outlined"
                                type="submit"
                                onClick={ClearTable}
                              >
                                Clear
                              </Button>
                            </Box>
                            <Box pr={2}>
                              <Button
                                color="primary"
                                variant="contained"
                                type="submit"
                                onClick={() => trackPromise(GetDetails())}
                              >
                                Search
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                        <br />
                        <br />
                        <br />
                        <Box minWidth={1050} hidden={isTableHide}>
                          <MaterialTable
                            title="Multiple Actions Preview"
                            columns={[
                              { title: 'EMP No', field: 'empNo' },
                              { title: 'EMP Name', field: 'empName' },
                              { title: 'EMP Type', field: 'empType' },
                              { title: 'Job Category', field: 'jobCategory' },
                              { title: 'Job', field: 'job' },
                              { title: 'Work Type', field: 'workType' },
                              { title: 'Field', field: 'field' },
                              { title: 'Attendance', field: 'attendance' },
                              { title: 'Is Task Complete', field: 'isTable' },
                            ]}
                            data={rows}
                            options={{
                              exportButton: false,
                              showTitle: false,
                              headerStyle: { textAlign: "center", backgroundColor: "#a8c5f4" },
                              cellStyle: { textAlign: "left" },
                              columnResizable: false,
                              actionsColumnIndex: -1,
                              pageSize: 5
                            }}
                          />
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
    </Fragment>
  )

}