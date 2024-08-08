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
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import moment from 'moment';
import { KeyboardDatePicker } from "@material-ui/pickers";
import { CustomMultiSelect } from 'src/utils/CustomMultiSelect';
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

const screenCode = 'NONPLUCKINGATTENDANCE';
export default function NonPluckingAttendanceListing() {
  const classes = useStyles();
  const [otherDeductionDetailsData, setOtherDeductionDetailsData] = useState([]);
  const [date, setDate] = useState(new Date());
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [costCenters, setCostCenters] = useState();
  const [sirders, setSirder] = useState([]);
  const [operator, setOperator] = useState([]);
  const [isHideField, setIsHideField] = useState(true);
  const [isCleared, setIsCleared] = useState(false);
  const [productOrderStatusList, setProductOrderStatusList] = useState([]);

  const [otherDeductionDetails, setOtherDeductionDetails] = useState({
    groupID: '0',
    gardenID: '0',
    costCenterID: '0',
    sirderID: 0,
    operatorID: 0,
    date: new Date().toISOString().substr(0, 10),
    registrationNumber: '',
  })
  const navigate = useNavigate();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/NonPluckingAttendance/addEdit/' + encrypted);
  }

  const handleClickEdit = (otherDeductionID) => {
    encrypted = btoa(otherDeductionID.toString());
    navigate('/app/NonPluckingAttendance/addEdit/' + encrypted);
  }

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  const alert = useAlert();

  useEffect(() => {
    trackPromise(getPermissions(), getGroupsForDropdown());
  }, []);

  useEffect(() => {
    setOtherDeductionDetailsData([]);
  }, [otherDeductionDetails.groupID]);

  useEffect(() => {
    setOtherDeductionDetailsData([]);
  }, [otherDeductionDetails.gardenID]);

  useEffect(() => {
    setOtherDeductionDetailsData([]);
  }, [otherDeductionDetails.registrationNumber]);

  useEffect(() => {
    if (otherDeductionDetails.groupID > 0) {
      trackPromise(getFactoriesForDropdown());
    }
  }, [otherDeductionDetails.groupID]);

  useEffect(() => {
    trackPromise(
      getCostCenterDetailsByGardenID()
    )
  }, [otherDeductionDetails.gardenID]);

  useEffect(() => {
    getSirdersForDropdown();
  }, []);

  useEffect(() => {
    getOperatorsForDropdown();
  }, [otherDeductionDetails.date]);


  useEffect(() => {
    if (otherDeductionDetails.gardenID != '0') {
      trackPromise(getStatus());
    }
  }, [otherDeductionDetails.gardenID]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWNONPLUCKINGATTENDANCE');

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

    setOtherDeductionDetails({
      ...otherDeductionDetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      gardenID: parseInt(tokenService.getFactoryIDFromToken())
    })
    getSirdersForDropdown();
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getAllFactoriesByGroupID(otherDeductionDetails.groupID);
    setFactories(factories);
  }

  async function getCostCenterDetailsByGardenID() {
    var response = await services.getDivisionDetailsByEstateID(otherDeductionDetails.gardenID);
    const elementCount = response.reduce((count) => count + 1, 0);
    var generated = generateDropDownMenu(response)
    if (elementCount === 1) {
      setOtherDeductionDetails((prevState) => ({
        ...prevState,
        costCenterID: generated[0].props.value,
      }));
    }
    setCostCenters(response);
  };

  async function getSirdersForDropdown() {
    const sirders = await services.getSirdersForDropdown();
    setSirder(sirders);
  }

  async function getOperatorsForDropdown() {
    const operator = await services.getOperatorsForDropdown(otherDeductionDetails.date);
    setOperator(operator);
  }


  async function getStatus() {
    let response = await services.getStatus(otherDeductionDetails.gardenID);
    setProductOrderStatusList(response);
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

  async function getOtherDeductionDetails() {
    const OtherDeductionDetails = await services.GetOtherDeductionDetailsByGroupFactoryRegistrationNo(otherDeductionDetails.groupID, otherDeductionDetails.gardenID, otherDeductionDetails.registrationNumber);
    if (OtherDeductionDetails.statusCode == 'Success') {
      setOtherDeductionDetailsData(OtherDeductionDetails.data);
      setIsHideField(false);
      setIsCleared(!isCleared)
    }
    else {
      setIsHideField(true);
      alert.error("No records to display");
    }
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setOtherDeductionDetails({
      ...otherDeductionDetails,
      [e.target.name]: value
    });
  }

  function handleSearchDropdownChangeStatus(data, e) {
    if (data === undefined || data === null) {
      setOtherDeductionDetails({
        ...otherDeductionDetails,
        registrationNumber: '0'
      });
      return;
    } else {
      var nameV = "RegistrationNumber";
      var valueV = data.registrationNumber;
      setOtherDeductionDetails({
        ...otherDeductionDetails,
        registrationNumber: valueV.toString()
      });
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
            onClick={handleClick}
            isEdit={true}
            toolTiptitle={"Add Non Plucking Attendance Details"}
          />
        </Grid>
      </Grid>
    )
  }

  return (

    <Page
      className={classes.root}
      title="Non Plucking Attendance"
    >
      <LoadingComponent />
      <Container maxWidth={false}>

        <Formik
          initialValues={{
            groupID: otherDeductionDetails.groupID,
            gardenID: otherDeductionDetails.gardenID,
            registrationNumber: otherDeductionDetails.registrationNumber,
          }}
          validationSchema={
            Yup.object().shape({
              groupID: Yup.number().required('Legal Entity is required').min("1", 'Legal Entity is required'),
              gardenID: Yup.number().required('Garden is required').min("1", 'Garden is required')
            })
          }
          onSubmit={() => trackPromise(getOtherDeductionDetails())}
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
                    title={cardTitle("Non Plucking Attendance")}
                  />
                  <Divider />
                  <CardContent style={{ marginBottom: "2rem" }}>
                    <Grid container spacing={3}>
                      <Grid item md={3} xs={12}>
                        <InputLabel shrink id="groupID">
                          Legal Entity *
                        </InputLabel>
                        <TextField select
                          error={Boolean(touched.groupID && errors.groupID)}
                          fullWidth
                          helperText={touched.groupID && errors.groupID}
                          name="groupID"
                          onChange={(e) => handleChange(e)}
                          value={otherDeductionDetails.groupID}
                          variant="outlined"
                          disabled={!permissionList.isGroupFilterEnabled}
                          size='small'
                        >
                          <MenuItem value="0">--Select Group--</MenuItem>
                          {generateDropDownMenu(groups)}
                        </TextField>
                      </Grid>

                      <Grid item md={3} xs={12}>
                        <InputLabel shrink id="gardenID">
                          Garden *
                        </InputLabel>
                        <TextField select
                          error={Boolean(touched.gardenID && errors.gardenID)}
                          fullWidth
                          helperText={touched.gardenID && errors.gardenID}
                          name="gardenID"
                          onChange={(e) => handleChange(e)}
                          value={otherDeductionDetails.gardenID}
                          variant="outlined"
                          disabled={!permissionList.isFactoryFilterEnabled}
                          size='small'
                        >
                          <MenuItem value="0">--Select Garden--</MenuItem>
                          {generateDropDownMenu(factories)}
                        </TextField>
                      </Grid>
                      <Grid item md={3} xs={12}>
                        <InputLabel shrink id="costCenterID">
                          Cost Center *
                        </InputLabel>
                        <TextField select
                          fullWidth
                          name="costCenterID"
                          onBlur={handleBlur}
                          onChange={(e) => handleChange(e)}
                          value={otherDeductionDetails.costCenterID}
                          variant="outlined"
                          id="costCenterID"
                          size='small'
                        >
                          <MenuItem value="0">--Select Cost Center--</MenuItem>
                          {generateDropDownMenu(costCenters)}
                        </TextField>
                      </Grid>
                      <Grid item md={3} xs={12}>
                        <InputLabel shrink id="date">Date *</InputLabel>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                          <KeyboardDatePicker
                            fullWidth
                            variant="inline"
                            format="dd/MM/yyyy"
                            margin="dense"
                            name='date'
                            id='date'
                            size='small'
                            value={date}
                            onChange={(e) => {
                              setDate(e)
                            }}
                            KeyboardButtonProps={{
                              'aria-label': 'change date',
                            }}
                            autoOk
                          />
                        </MuiPickersUtilsProvider>
                      </Grid>
                      <Grid item md={3} xs={12}>
                        <InputLabel shrink id="registrationNumber">
                          Emp.ID *
                        </InputLabel>
                        <Autocomplete
                          key={isCleared}
                          id="registrationNumber"
                          options={productOrderStatusList}
                          getOptionLabel={option => option.registrationNumber ?? option.registrationNumber}
                          onChange={(e, value) =>
                            handleSearchDropdownChangeStatus(value, e)
                          }
                          renderInput={params => (
                            <TextField
                              {...params}
                              variant="outlined"
                              name="registrationNumber"
                              size="small"
                              fullWidth
                              error={Boolean(
                                touched.registrationNumber && errors.registrationNumber
                              )}
                              helperText={touched.registrationNumber && errors.registrationNumber}
                              value={otherDeductionDetails.registrationNumber}
                              getOptionDisabled={true}
                              onBlur={handleBlur}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item md={3} xs={12}>
                        <InputLabel shrink id="sirderID">
                          Sirder *
                        </InputLabel>
                        <TextField select
                          fullWidth
                          name="sirderID"
                          onBlur={handleBlur}
                          onChange={(e) => handleChange(e)}
                          value={otherDeductionDetails.sirderID}
                          variant="outlined"
                          id="sirderID"
                          size='small'
                        >
                          <MenuItem value="0">--Select Sirder--</MenuItem>
                          {generateDropDownMenuWithTwoValues(sirders)}
                        </TextField>
                      </Grid>
                      <Grid item md={3} xs={12}>
                        <InputLabel shrink id="operatorID">
                          Operator *
                        </InputLabel>
                        <TextField select
                          fullWidth
                          name="operatorID"
                          onBlur={handleBlur}
                          onChange={(e) => handleChange(e)}
                          value={otherDeductionDetails.operatorID}
                          variant="outlined"
                          id="operatorID"
                          size='small'
                        >
                          <MenuItem value="0">--Select Operator--</MenuItem>
                          {generateDropDownMenuWithTwoValues(operator)}
                        </TextField>
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
                    <Box minWidth={1050}
                      hidden={isHideField}
                    >

                      <MaterialTable
                        title="Employee Deduction Details"
                        columns={[
                          { title: 'Applicable Date', field: 'date', render: rowData => rowData.date.split('T')[0] },
                          { title: 'Emp.ID', field: 'registrationNumber' },
                          { title: 'Emp.Name', field: 'employeeName' },
                          { title: 'Emp.Type', field: 'employeeTypeName' },
                          { title: 'Deduction Type', field: 'deductionTypeName' },
                          { title: 'Deduction Amount', field: 'deductionAmount' },
                          { title: 'Reference', field: 'reference' },
                        ]}
                        data={otherDeductionDetailsData}
                        options={{
                          exportButton: false,
                          showTitle: true,
                          headerStyle: { textAlign: "left", height: '1%' },
                          cellStyle: { textAlign: "left" },
                          columnResizable: false,
                          actionsColumnIndex: -1,
                          pageSize: 10
                        }}
                        actions={[
                          {
                            icon: 'mode',
                            tooltip: 'Edit Other Deduction Details',
                            onClick: (event, rowData) => { handleClickEdit(rowData.otherDeductionID) }
                          },
                        ]}
                      />

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
