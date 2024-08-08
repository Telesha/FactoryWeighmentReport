import React, { useState, useEffect } from 'react';
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
  Switch,
  InputLabel,
  FormControlLabel,
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import { Fragment } from 'react';
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import tokenDecoder from '../../../utils/tokenDecoder';
import authService from '../../../utils/permissionAuth';
import { useNavigate,useParams } from 'react-router-dom';
import tokenService from '../../../utils/tokenDecoder';
import _ from 'lodash'
import PageHeader from 'src/views/Common/PageHeader';

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
  }
}));

const screenCode = 'LEAVETYPECONFIGURATION';

export default function GardenLeaveTypeConfigurationAdd(props) {

  const alert = useAlert();
  const classes = useStyles();
  const navigate = useNavigate();
  const [title, setTitle] = useState("Add Garden Leave Type Configuration")
  const [leaveDetails, setLeaveDetails] = useState({
    factoryID: '0',
    shortForm : '',
    elaboration:'',
    eligible:'',
    condition: '',
    wages:'0'
  });

  const [factories, setSetFactories] = useState([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const [ConfigurationID, setConfigurationID] = useState('')
  const { leaveTypeConfigurationID } = useParams();
  let decryptedID = 0;

  const handleClick = () => {
    navigate('/app/gardenLeaveTypeConfiguration/listing');
}

  useEffect(() => {
    decryptedID = atob(leaveTypeConfigurationID.toString());
    setConfigurationID(decryptedID)
    if (decryptedID != 0) {
        trackPromise(GetLeaveTypeConfigurationsByLeaveTypeConfigurationID(decryptedID));
    }
    trackPromise( getAllFactories(),getPermissions())
  }, [])

  async function getAllFactories() {
    var response = await services.getAllFactories();
    setSetFactories(response);
  };

  async function GetLeaveTypeConfigurationsByLeaveTypeConfigurationID(leaveTypeConfigurationID){
    let response = await services.GetLeaveTypeConfigurationsByLeaveTypeConfigurationID(leaveTypeConfigurationID)
    setTitle("Edit Garden Leave Type Configuration");

    setLeaveDetails({
      ...leaveDetails,
      factoryID: response.factoryID,
      shortForm : response.shortForm,
      elaboration:response.elaboration,
      eligible:response.eligible,
      condition: response.condition,
      wages:response.wages
    })
    setIsUpdate(true)
  }
  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITLEAVETYPECONFIGURATION');

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
    setLeaveDetails({
      ...leaveDetails,
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function AddGardenLeaveTypeConfiguration() {
    if(isUpdate){
      let updateModel = {
        leaveTypeConfigurationID: parseInt(ConfigurationID),
        factoryID: parseInt(leaveDetails.factoryID),
        shortForm : leaveDetails.shortForm,
        elaboration:leaveDetails.elaboration,
        eligible:leaveDetails.eligible,
        condition: leaveDetails.condition,
        wages:parseFloat(leaveDetails.wages),
        createdBy: parseInt(tokenDecoder.getUserIDFromToken())
      }
      let response = await services.updateGardenLeaveTypeConfigurationDetails(updateModel);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        clearData();
      }
      else {
        alert.error(response.message);
      }
    }else{
      let dataModel = {
        leaveTypeConfigurationID:0,
        factoryID: parseInt(leaveDetails.factoryID),
        shortForm : leaveDetails.shortForm,
        elaboration:leaveDetails.elaboration,
        eligible:leaveDetails.eligible,
        condition: leaveDetails.condition,
        wages:parseFloat(leaveDetails.wages),
        createdBy: parseInt(tokenDecoder.getUserIDFromToken())
      }
      let response = await services.saveGardenLeaveTypeConfigurationDetails(dataModel);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        clearData();
      }
      else {
        alert.error(response.message);
      }
    }
    handleClick();
  }


  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setLeaveDetails({
      ...leaveDetails,
      [e.target.name]: value
    });
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

  function clearData() {
    setLeaveDetails({
      ...leaveDetails,
      shortForm : '',
      elaboration:'',
      eligible:'',
      condition: '',
      wages:'0'
    });
  }

  function allClearData() {
    setLeaveDetails({
      ...leaveDetails,
      shortForm : '',
      elaboration:'',
      eligible:'',
      condition: '',
      wages:'0'
    });
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              factoryID: leaveDetails.factoryID,
              shortForm : leaveDetails.shortForm,
              elaboration:leaveDetails.elaboration,
              eligible:leaveDetails.eligible,
              condition: leaveDetails.condition,
              wages:leaveDetails.wages
            }}
            validationSchema={
              Yup.object().shape({
                factoryID: Yup.number().min(1, "Please Select a Garden").required('Garden is required'),
                shortForm: Yup.string().required('Short Form is required'),
                elaboration: Yup.string().required('Elaboration is required'),
                eligible: Yup.string().required('Eligible is required'),
                condition: Yup.string().required('Condition is required'),
                wages: Yup.number().required('Wages is required')
              })
            }
            onSubmit={() => trackPromise(AddGardenLeaveTypeConfiguration())}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              touched,
              values
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
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="factoryID">
                              Garden *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.factoryID && errors.factoryID)}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              name="factoryID"
                              onBlur={handleBlur}
                              size='small'
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={leaveDetails.factoryID}
                              variant="outlined"
                              id="factoryID"
                              InputProps={{
                                readOnly: isUpdate|| !permissionList.isFactoryFilterEnabled ? true : false
                              }}
                            >
                              <MenuItem value={0}>--Select Garden--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="shortForm">
                              Short From *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.shortForm && errors.shortForm)}
                              fullWidth
                              helperText={touched.shortForm && errors.shortForm}
                              name="shortForm"
                              onBlur={handleBlur}
                              size='small'
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={leaveDetails.shortForm}
                              variant="outlined"
                              id="shortForm"
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="shortForm">
                                Elaboration *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.elaboration && errors.elaboration)}
                              fullWidth
                              helperText={touched.elaboration && errors.elaboration}
                              name="elaboration"
                              onBlur={handleBlur}
                              size='small'
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={leaveDetails.elaboration}
                              variant="outlined"
                              id="elaboration"
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="shortForm">
                                Eligible *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.eligible && errors.eligible)}
                              fullWidth
                              helperText={touched.eligible && errors.eligible}
                              name="eligible"
                              onBlur={handleBlur}
                              size='small'
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={leaveDetails.eligible}
                              variant="outlined"
                              id="eligible"
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="shortForm">
                                Condition *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.condition && errors.condition)}
                              fullWidth
                              helperText={touched.condition && errors.condition}
                              name="condition"
                              onBlur={handleBlur}
                              size='small'
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={leaveDetails.condition}
                              variant="outlined"
                              id="condition"
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="shortForm">
                                Wages *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.wages && errors.wages)}
                              fullWidth
                              helperText={touched.wages && errors.wages}
                              name="wages"
                              onBlur={handleBlur}
                              size='small'
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={leaveDetails.wages}
                              variant="outlined"
                              id="wages"
                              type="number"
                            >
                            </TextField>
                          </Grid>
                          </Grid>
                            <Box display="flex" justifyContent="flex-end" p={2}>
                              <Button
                                color="primary"
                                type="reset"
                                variant="outlined"
                                onClick={() => allClearData()}
                                //disabled={IsComplete || isUpdate ? true : false}
                                size='small'
                              >
                                Clear
                              </Button>
                              <div>&nbsp;</div>
                              <Button
                                color="primary"
                                type="submit"
                                variant="contained"
                                //disabled={IsComplete || isUpdate ? true : false}
                                size='small'
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
    </Fragment>)
}
