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
import xlsx from 'json-as-xlsx';

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

const screenCode = 'RATIONCONFIGURATION';

export default function LeaveListing() {
  const classes = useStyles();
  const [rationConfigDetailsData, setrationConfigDetailsData] = useState([]);
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [isHideField, setIsHideField] = useState(true);
  const [csvHeaders, SetCsvHeaders] = useState([]);
  const [groupData, setGroupData] = useState([]);
  const [employeeType, setEmployeeType] = useState(null)
  const [rationConfigurationID, setrationConfigurationID] = useState(0);
  const [excel, setExcel] = useState(false);
  const [rationConfigurationDetails, setrationConfigurationDetails] = useState({
    groupID: 0,
    gardenID: 0,
    employeeTypeID: '0',

  })

  const navigate = useNavigate();
  let encrypted = "";


  const handleClick = () => {
    encrypted = btoa('0');
    let model = {
      groupID: parseInt(rationConfigurationDetails.groupID),
      operationEntityID: parseInt(rationConfigurationDetails.operationEntityID),
      employeeTypeID: parseInt(rationConfigurationDetails.employeeTypeID)
    }
    sessionStorage.setItem(
      'RationConfiguration-listing-page-search-parameters-id',
      JSON.stringify(model)
    );
    navigate('/app/RationConfiguration/addedit/' + encrypted);
  }
  const handleClickEdit = (rationConfigurationID) => {
    encrypted = btoa(rationConfigurationID.toString());
    navigate('/app/RationConfiguration/addEdit/' + encrypted);
  }

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const alert = useAlert();

  useEffect(() => {
    if (rationConfigurationID != 0) {
      handleClickEdit(rationConfigurationID)
    }
  }, [rationConfigurationID]);

  useEffect(() => {
    if (excel == true) {
      createFile()
    }
  }, [excel]);

  useEffect(() => {
    trackPromise(getPermissions(), GetAllGroups(), getEmployeeTypesForDropdown());
    let model = sessionStorage.getItem(
      'RationConfiguration-listing-page-search-parameters-id',
    )
    if (model) {
      model = JSON.parse(model)
      setrationConfigurationDetails({
        groupID: model.groupID,
        employeeTypeID: model.employeeTypeID,
        operationEntityID: model.operationEntityID
      })
      //trackPromise(getEmployeeLeaveDetails())
    }
  }, []);

  useEffect(() => {
    if (rationConfigurationDetails.groupID > 0) {
      trackPromise(getFactoriesForDropdown());
    }
  }, [rationConfigurationDetails.groupID]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWRATIONCONFIGURATION');

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

    setrationConfigurationDetails({
      ...rationConfigurationDetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      gardenID: parseInt(tokenService.getFactoryIDFromToken()),

    })
  }
  async function GetAllGroups() {
    const result = await services.GetAllGroups();
    setGroupData(result);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getAllFactoriesByGroupID(rationConfigurationDetails.groupID);
    setFactories(factories);
  }

  async function getEmployeeTypesForDropdown() {
    let types = await services.getEmployeeTypesForDropdown();
    let empTypeArray = []
    for (let item of Object.entries(types)) {
      empTypeArray[item[1]["employeeTypeID"]] = item[1]["employeeTypeName"]
    }
    setEmployeeType(empTypeArray);
  }

  async function getEmployeeLeaveDetails() {
    let model = {
      groupID: parseInt(rationConfigurationDetails.groupID),
      OperationEntityID: parseInt(rationConfigurationDetails.gardenID),
      employeeTypeID: parseInt(rationConfigurationDetails.employeeTypeID),
    }

    const response = await services.GetRationConfiguration(model);
    if (response.statusCode == 'Success') {
      setrationConfigDetailsData(response.data || []);
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
    setrationConfigurationDetails({
      ...rationConfigurationDetails,
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
            toolTiptitle={"Add Ration Configuration"}
          />
        </Grid>
      </Grid>
    )
  }
  async function createDataForExcel(array) {
    var res = [];
    if (Array.isArray(array)) {
      array.map(x => {
        var vr = {
          'Employee Entitle Qty': x.employeeEntitleQntity,
          'Spouse Entitle Qty': x.spouseEntitleQntity,
          'Age Below 8 Entitle Qty': x.under8EntitleQntity,
          'Age Above 8 Entitle Qty': x.between8to12EntitleQntity,
          'Senior Citizen Entitle Qty': x.seniorCitizenEntitleQntity,
          'Per Kg Rate': x.perKgRate,
          'Status': x.isActive == true ? 'Active' : 'InActive'
        };
        res.push(vr);
      });
    }
    return res;
  }

  async function createFile() {
    setExcel(false);

    var file = await createDataForExcel(rationConfigDetailsData);
    var settings = {
      sheetName: 'Ration Configuration',
      fileName: 'Ration Configuration Details',
      writeOptions: {}
    }

    let keys = file && file.length > 0 ? Object.keys(file[0]) : [];
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let dataA = [
      {
        sheet: 'Ration Configuration',
        columns: tempcsvHeaders,
        content: file
      }
    ]

    xlsx(dataA, settings);
  }
  return (

    <Page
      className={classes.root}
      title="Ration Configuration"
    >
      <LoadingComponent />
      <Container maxWidth={false}>

        <Formik
          initialValues={{
            groupID: rationConfigurationDetails.groupID,
            gardenID: rationConfigurationDetails.gardenID,
            employeeTypeID: rationConfigurationDetails.employeeTypeID,

          }}
          validationSchema={
            Yup.object().shape({
              groupID: Yup.number().required('Business Division is required').min("1", 'Business Division is required'),
              gardenID: Yup.number().required('Location is required').min("1",'Location is required')

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
                    title={cardTitle("Ration Configuration")}
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
                          value={rationConfigurationDetails.groupID}
                          variant="outlined"
                          size='small'
                          InputProps={{
                            readOnly: !permissionList.isGroupFilterEnabled ? true : false
                          }}
                        >
                          <MenuItem value="0">--Select Business Division--</MenuItem>
                          {generateDropDownMenu(groupData)}
                        </TextField>
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <InputLabel shrink id="gardenID">
                          Location*
                        </InputLabel>
                        <TextField select
                          error={Boolean(touched.gardenID && errors.gardenID)}
                          fullWidth
                          helperText={touched.gardenID && errors.gardenID}
                          name="gardenID"
                          onChange={(e) => handleChange(e)}
                          value={rationConfigurationDetails.gardenID}
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
                    {rationConfigDetailsData.length > 0 ?
                      <CustomTable rationConfigDetailsData={rationConfigDetailsData} setrationConfigurationID={setrationConfigurationID} setExcel={setExcel} permissionList={permissionList.isAddEditScreen} />
                      : <SearchNotFound searchQuery="Ration Configuration" />}
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
