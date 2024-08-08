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
const screenCode = 'RATIONCONFIGURATION';
export default function LeaveAddEdit(props) {
  const [title, setTitle] = useState("Add Ration Configuration Details")
  const [isUpdate, setIsUpdate] = useState(false);
  const [isHideField, setIsHideField] = useState(true);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const [employeeType, setEmployeeType] = useState(null)
  const classes = useStyles();
  const [groupData, setGroupData] = useState([]);
  const [factoryData, setFactoryData] = useState([]);
  const [groups, setGroups] = useState()
  const [factories, setFactories] = useState()
  const [rationConfigDetails, setrationConfigDetails] = useState({
    groupID: '0',
    operationEntityID: '0',
    rationConfigurationID: '0',
    employeeTypeID: '0',
    employeeEntitleQntity: '',
    spouseEntitleQntity: '',
    under8EntitleQntity: '',
    between8to12EntitleQntity: '',
    seniorCitizenEntitleQntity: '',
    perKgRate: '',
    isActive: true,
  });
  const [rationConfigurationIsActive, setrationConfigurationIsActive] = useState(true);
  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/app/RationConfiguration/listing');
  }
  const alert = useAlert();

  const { rationConfigurationID } = useParams();
  let decrypted = 0;


  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  const [isCleared, setIsCleared] = useState(false);
  

  useEffect(() => {
    decrypted = atob(rationConfigurationID.toString());
    if (decrypted != 0) {
      setIsUpdate(true);
      setTitle("Edit Ration Configuration");
      trackPromise(GetRationConfiguration(decrypted));
    }
    trackPromise(getEmployeeTypesForDropdown());
  }, []);

  useEffect(() => {
    getPermissions();
    GetAllGroups();
  }, []);


  useEffect(() => {
    if (rationConfigDetails.groupID != 0) {
      trackPromise(getEstateDetailsByGroupID());
    }
  }, [rationConfigDetails.groupID]);

  useEffect(() => {
    if (isUpdate == false) {
      setrationConfigDetails({
        ...rationConfigDetails,
        groupID: '',
        operationEntityID: '',
        employeeEntitleQntity: '',
        spouseEntitleQntity: '',
        under8EntitleQntity: '',
        between8to12EntitleQntity: '',
        seniorCitizenEntitleQntity: '',
        perKgRate: '',
        employeeTypeID: '0',
        isActive: '0'
      });
      setIsCleared(true);
    }
  }, []);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITRATIONCONFIGURATION');

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


    setrationConfigDetails({
      ...rationConfigDetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      operationEntityID: parseInt(tokenService.getFactoryIDFromToken())
    })

  }

  async function GetAllGroups() {
    const result = await services.GetAllGroups();
    setGroupData(result);
  }

  async function getEstateDetailsByGroupID() {
    var result = await services.getEstateDetailsByGroupID(rationConfigDetails.groupID);
    setFactoryData(result);
  }

  async function getEmployeeTypesForDropdown() {
    let types = await services.getEmployeeTypesForDropdown();
    let empTypeArray = []
    for (let item of Object.entries(types)) {
      empTypeArray[item[1]["employeeTypeID"]] = item[1]["employeeTypeName"]
    }
    setEmployeeType(empTypeArray);
  }

  async function GetRationConfiguration(rationConfigurationID) {
    const response = await services.GetRationConfigurationByRationConfigurationID(rationConfigurationID);
    if (response.statusCode == 'Success') {
      let data = response.data;

      setrationConfigDetails({
        ...rationConfigDetails,
        rationConfigurationID: data.rationConfigurationID,
        groupID: data.groupID,
        operationEntityID: data.operationEntityID,
        employeeEntitleQntity: data.employeeEntitleQntity,
        spouseEntitleQntity: data.spouseEntitleQntity,
        under8EntitleQntity: data.under8EntitleQntity,
        between8to12EntitleQntity: data.between8to12EntitleQntity,
        seniorCitizenEntitleQntity: data.seniorCitizenEntitleQntity,
        perKgRate: data.perKgRate,
        employeeTypeID: data.employeeTypeID,
        isActive: data.isActive

      });
      setIsUpdate(true);
      setrationConfigurationIsActive(response[0]);
    }
    else {
      
      alert.error('Error Occur In Ration Configuration Update.');
    }

  }
  async function SaveRationConfiguration() {
   
    if (isUpdate == true) {
      setIsUpdate(true)
      let response = await services.UpdateRationConfiguration(rationConfigDetails, tokenService.getUserIDFromToken());
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/RationConfiguration/listing');
      }
      else {
        setrationConfigDetails({
          ...rationConfigDetails,
          isActive: rationConfigurationIsActive
        });
        alert.error(response.message);
      }
    }
    else {
      setIsUpdate(false);
      if (rationConfigDetails.empName != 0 && rationConfigDetails.nic != 0) {
        if (rationConfigDetails.leaveType != 0) {
          let response = await services.SaveRationConfiguration(rationConfigDetails, tokenService.getUserIDFromToken());
          if (response.statusCode == "Success") {
            alert.success(response.message);
            setIsDisableButton(true);

            navigate('/app/RationConfiguration/listing');
          }
          else {
            alert.error(response.message);
          }
        }
        else {
          alert.error('Please Select a Ration Configuration');
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

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setrationConfigDetails({
      ...rationConfigDetails,
      [e.target.name]: value
    });
  }

  function handleActiveChange() {
    setrationConfigDetails({
      ...rationConfigDetails,
      isActive: !rationConfigDetails.isActive
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

  return (
    <Page
      className={classes.root}
      title="Add Ration Configuration"
    >
      <LoadingComponent />
      <Container maxWidth={false}>
        <Formik
          initialValues={{
            groupID: rationConfigDetails.groupID,
            operationEntityID: rationConfigDetails.operationEntityID,
            employeeTypeID: rationConfigDetails.employeeTypeID,
            employeeEntitleQntity: rationConfigDetails.employeeEntitleQntity,
            spouseEntitleQntity: rationConfigDetails.spouseEntitleQntity,
            under8EntitleQntity: rationConfigDetails.under8EntitleQntity,
            between8to12EntitleQntity: rationConfigDetails.between8to12EntitleQntity,
            seniorCitizenEntitleQntity: rationConfigDetails.seniorCitizenEntitleQntity,
            perKgRate: rationConfigDetails.perKgRate,
            isActive: rationConfigDetails.isActive

          }}
          validationSchema={
            Yup.object().shape({
              groupID: Yup.number().required('Business Division required').min("1", 'Business Division is required'),
              operationEntityID: Yup.number().required('Location is required').min("1",'Location is required'),

              isActive: Yup.boolean().required('Is default required'),

            })
          }
          onSubmit={SaveRationConfiguration}
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
                            onChange={(e) => handleChange(e)}
                            size='small'
                            value={rationConfigDetails.groupID}
                            variant="outlined"
                            InputProps={{
                              readOnly: !permissionList.isGroupFilterEnabled ? true : false
                            }}
                          >
                            <MenuItem value="0">--Select Business Division--</MenuItem>
                            {generateDropDownMenu(groupData)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="operationEntityID">
                            Location*
                          </InputLabel>
                          <TextField select
                            error={Boolean(touched.operationEntityID && errors.operationEntityID)}
                            fullWidth
                            helperText={touched.operationEntityID && errors.operationEntityID}
                            name="operationEntityID"
                            onChange={(e) => handleChange(e)}
                            size='small'
                            value={rationConfigDetails.operationEntityID}
                            variant="outlined"
                            InputProps={{
                              readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                            }}
                          >
                            <MenuItem value="0">--Select Location--</MenuItem>
                            {generateDropDownMenu(factoryData)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="employeeEntitleQntity">
                            Employee Entitle Quantity
                          </InputLabel>
                          <TextField
                            fullWidth
                            name="employeeEntitleQntity"
                            size='small'
                            onBlur={handleBlur}
                            onChange={(e) => handleChange(e)}
                            value={rationConfigDetails.employeeEntitleQntity}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="spouseEntitleQntity">
                            Spouse Entitle Quantity
                          </InputLabel>
                          <TextField
                            fullWidth
                            name="spouseEntitleQntity"
                            size='small'
                            onBlur={handleBlur}
                            onChange={(e) => handleChange(e)}
                            value={rationConfigDetails.spouseEntitleQntity}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="under8EntitleQntity">
                            Under 8 Entitle Quantity
                          </InputLabel>
                          <TextField
                            fullWidth
                            name="under8EntitleQntity"
                            size='small'
                            onBlur={handleBlur}
                            onChange={(e) => handleChange(e)}
                            value={rationConfigDetails.under8EntitleQntity}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="between8to12EntitleQntity">
                            Between 8 to 12 Entitle Quantity
                          </InputLabel>
                          <TextField
                            fullWidth
                            name="between8to12EntitleQntity"
                            size='small'
                            onBlur={handleBlur}
                            onChange={(e) => handleChange(e)}
                            value={rationConfigDetails.between8to12EntitleQntity}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="seniorCitizenEntitleQntity">
                            Senior Citizen Entitle Quantity
                          </InputLabel>
                          <TextField
                            fullWidth
                            name="seniorCitizenEntitleQntity"
                            size='small'
                            onBlur={handleBlur}
                            onChange={(e) => handleChange(e)}
                            value={rationConfigDetails.seniorCitizenEntitleQntity}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="perKgRate">
                            Per Kg Rate
                          </InputLabel>
                          <TextField
                            fullWidth
                            name="perKgRate"
                            size='small'
                            onBlur={handleBlur}
                            onChange={(e) => handleChange(e)}
                            value={rationConfigDetails.perKgRate}
                            variant="outlined"
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
                      <br></br>
                      <Grid container spacing={3}>
                        <Grid item md={4} xs={12}>
                          <InputLabel  id="isActive">
                            Active
                          </InputLabel>
                          <Switch
                            checked={rationConfigDetails.isActive}
                            onChange={handleActiveChange}
                            name="isActive"
                            disabled={isDisableButton}
                            
                          />
                        </Grid>
                        
                      </Grid>
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
