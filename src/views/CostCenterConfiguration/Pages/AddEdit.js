import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  Grid,
  TextField,
  makeStyles,
  Container,
  Button,
  CardContent,
  Divider,
  InputLabel,
  Switch,
  CardHeader,
  MenuItem
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from 'src/utils/tokenDecoder';
import tokenDecoder from 'src/utils/tokenDecoder';

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
const screenCode = 'COSTCENTERCONFIGURATION';
export default function CostCenterConfigurationAddEdit(props) {
  const [title, setTitle] = useState("Add Cost Center Configuration")
  const [isUpdate, setIsUpdate] = useState(false);
  const [groups, setGroups] = useState();
  const [configurationMaster, setConfigurationMaster] = useState();
  const [gardens, setGardens] = useState([]);
  const [costCenters, setCostCenters] = useState();
  const [measuringUnitType, setMeasuringUnitType] = useState([]);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const classes = useStyles();
  const [group, setGroup] = useState({
    masterGroupName: '',
    masterGroupCode: '',
    isActive: true,
  });

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });

  const [costCenterConfiguration, setCostCenterConfiguration] = useState({
    groupID: '0',
    gardenID: '0',
    costCenterID: '0',
    configurationTypeID: "0",
    configurationMasterID: "0",
    configurationValue: "",
    measuringUnitID: "0",
    minValue: "",
    maxValue: "",
    jsonString: "",
    isActive: true,
    isApply: true
  });

  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/app/costCenterConfiguration/listing');
  }
  const alert = useAlert();
  const { configurationID } = useParams();
  let decrypted = 0;

  useEffect(() => {
    trackPromise(getGroupsForDropdown(), getPermission());
  }, []);

  useEffect(() => {
    trackPromise(
      GetMeasuringUnit()
    )
  }, []);

  useEffect(() => {
    trackPromise(getEstateDetailsByGroupID());
  }, [costCenterConfiguration.groupID]);

  useEffect(() => {
    if (costCenterConfiguration.gardenID != "0") {
      trackPromise(
        getCostCenterDetailsByGardenID(),
        getConfugarationForDropdown()
      )
    }
  }, [costCenterConfiguration.gardenID]);

  useEffect(() => {
    decrypted = atob(configurationID.toString());
    if (decrypted != 0) {
      trackPromise(
        getConfigurationDataByConfigurationID(decrypted)
      )
    }
  }, []);

  async function getConfigurationDataByConfigurationID(configurationID) {
    setIsUpdate(true);
    let response = await services.getConfigurationDataByConfigurationID(configurationID);
    setTitle("Edit Cost Center Configuration");
    setCostCenterConfiguration({
      ...costCenterConfiguration,
      groupID: response.groupID.toString(),
      gardenID: response.gardenID.toString(),
      costCenterID: response.costCenterID.toString(),
      configurationTypeID: response.configurationTypeID.toString(),
      configurationMasterID: response.configurationMasterID.toString(),
      configurationValue: response.configurationValue == null ? "" : response.configurationValue.toString(),
      measuringUnitID: response.measuringUnitID.toString(),
      minValue: response.minValue == null ? "" : response.minValue.toString(),
      maxValue: response.maxValue == null ? "" : response.maxValue.toString(),
      jsonString: response.jsonString,
      isActive: response.isActive,
      isApply: response.isApply

    })
  }

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITCOSTCENTERCONFIGURATION');

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

    setCostCenterConfiguration({
      ...costCenterConfiguration,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      gardenID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getEstateDetailsByGroupID() {
    var response = await services.getEstateDetailsByGroupID(costCenterConfiguration.groupID);
    setGardens(response);
  };

  async function getCostCenterDetailsByGardenID() {
    var response = await services.getDivisionDetailsByEstateID(costCenterConfiguration.gardenID);
    setCostCenters(response);
  };

  async function getConfugarationForDropdown() {
    const config = await services.getConfugarationForDropdown(costCenterConfiguration.gardenID, isUpdate);
    setConfigurationMaster(config);
  }

  async function GetMeasuringUnit() {
    const result = await services.getMeasuringUnit();
    setMeasuringUnitType(result);
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
  async function saveConfiguration(values) {
    if (isUpdate == true) {

      let updateModel = {
        configurationID: parseInt(atob(configurationID)),
        groupID: parseInt(values.groupID),
        gardenID: parseInt(values.gardenID),
        costCenterID: parseInt(values.costCenterID),
        configurationTypeID: parseInt(values.configurationTypeID),
        configurationMasterID: parseInt(values.configurationMasterID),
        configurationValue: values.configurationValue == "" ? 0 : parseInt(values.configurationValue),
        measuringUnitID: parseInt(values.measuringUnitID),
        minValue: values.minValue == "" ? 0 : parseInt(values.minValue),
        maxValue: values.maxValue == "" ? 0 : parseInt(values.maxValue),
        jsonString: values.jsonString,
        isActive: values.isActive,
        isApply: values.isApply,
        modifiedBy: parseInt(tokenDecoder.getUserIDFromToken())
      }

      let response = await services.updateConfiguration(updateModel);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        navigate('/app/costCenterConfiguration/listing');
      }
      else {
        alert.error(response.message);
      }
    } else {
      let saveModel = {
        groupID: parseInt(values.groupID),
        gardenID: parseInt(values.gardenID),
        costCenterID: parseInt(values.costCenterID),
        configurationTypeID: parseInt(values.configurationTypeID),
        configurationMasterID: parseInt(values.configurationMasterID),
        configurationValue: values.configurationValue == "" ? 0 : parseInt(values.configurationValue),
        measuringUnitID: parseInt(values.measuringUnitID),
        minValue: values.minValue == "" ? 0 : parseInt(values.minValue),
        maxValue: values.maxValue == "" ? 0 : parseInt(values.maxValue),
        jsonString: values.jsonString,
        isActive: values.isActive,
        isApply: values.isApply,
        createdBy: parseInt(tokenDecoder.getUserIDFromToken())
      }
      let response = await services.saveConfiguration(saveModel);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/costCenterConfiguration/listing');
      }
      else {
        alert.error(response.message);
      }
    }
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setCostCenterConfiguration({
      ...costCenterConfiguration,
      [e.target.name]: value
    });
  }

  function handleCheckActive(e) {
    const target = e.target;
    const value = target.name === 'isActive' ? target.checked : target.value
    setCostCenterConfiguration({
      ...costCenterConfiguration,
      [e.target.name]: value
    });
  }
  function handleSwitchApply(e) {
    const target = e.target;
    const value = target.name === 'isApply' ? target.checked : target.value
    setCostCenterConfiguration({
      ...costCenterConfiguration,
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
            toolTiptitle={"Cost Center Configuration"}
          />
        </Grid>
      </Grid>
    )
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: costCenterConfiguration.groupID,
              gardenID: costCenterConfiguration.gardenID,
              costCenterID: costCenterConfiguration.costCenterID,
              configurationTypeID: costCenterConfiguration.configurationTypeID,
              configurationMasterID: costCenterConfiguration.configurationMasterID,
              configurationValue: costCenterConfiguration.configurationValue,
              measuringUnitID: costCenterConfiguration.measuringUnitID,
              minValue: costCenterConfiguration.minValue,
              maxValue: costCenterConfiguration.maxValue,
              jsonString: costCenterConfiguration.jsonString,
              isActive: costCenterConfiguration.isActive,
              isApply: costCenterConfiguration.isApply
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Legal Entity is required').min("1", 'Legal Entity is required'),
                gardenID: Yup.number().required('Garden is required').min("1", 'Garden is required'),
                costCenterID: Yup.number().required('Cost Center is required').min("1", 'Cost Center is required'),
                configurationMasterID: Yup.number().required('Configuration is required').min("1", 'Configuration Center is required'),
                configurationTypeID: Yup.number().required('Configuration Type is required').min("1", 'Configuration Type is required'),
                configurationValue: Yup.string()
                  .notRequired()
                  .matches(/^[0-9]+$/, 'Configuration value must be an integer'),
                minValue: Yup.string()
                  .notRequired()
                  .matches(/^[0-9]+$/, 'Min Value must be an integer'),
                maxValue: Yup.string()
                  .notRequired()
                  .matches(/^[0-9]+$/, 'Max Value must be an integer')
              })
            }
            onSubmit={saveConfiguration}
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
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={8}>
                            <InputLabel shrink id="groupID">
                                Business Division *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="groupID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={costCenterConfiguration.groupID}
                              variant="outlined"
                              id="groupID"
                              size='small'
                              InputProps={{
                                readOnly: isUpdate ? true : false
                              }}
                            >
                              <MenuItem value="0">--Select  Business Division--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={8}>
                            <InputLabel shrink id="gardenID">
                               Location *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.gardenID && errors.gardenID)}
                              fullWidth
                              helperText={touched.gardenID && errors.gardenID}
                              name="gardenID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={costCenterConfiguration.gardenID}
                              variant="outlined"
                              id="gardenID"
                              size='small'
                              InputProps={{
                                readOnly: isUpdate ? true : false
                              }}
                            >
                              <MenuItem value="0">--Select Location--</MenuItem>
                              {generateDropDownMenu(gardens)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={8}>
                            <InputLabel shrink id="costCenterID">
                              Sub Division*
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.costCenterID && errors.costCenterID)}
                              fullWidth
                              helperText={touched.costCenterID && errors.costCenterID}
                              name="costCenterID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={costCenterConfiguration.costCenterID}
                              variant="outlined"
                              id="costCenterID"
                              size='small'
                              InputProps={{
                                readOnly: isUpdate ? true : false
                              }}
                            >
                              <MenuItem value="0">--Select Sub Division--</MenuItem>
                              {generateDropDownMenu(costCenters)}
                            </TextField>
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={8}>
                            <InputLabel shrink id="configurationMasterID">
                              Configuration *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.configurationMasterID && errors.configurationMasterID)}
                              fullWidth
                              helperText={touched.configurationMasterID && errors.configurationMasterID}
                              name="configurationMasterID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={costCenterConfiguration.configurationMasterID}
                              variant="outlined"
                              id="configurationMasterID"
                              size='small'
                              InputProps={{
                                readOnly: isUpdate ? true : false
                              }}
                            >
                              <MenuItem value="0">--Select Configuration--</MenuItem>
                              {generateDropDownMenu(configurationMaster)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={8}>
                            <InputLabel shrink id="configurationTypeID">
                              Configuration Type *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.configurationTypeID && errors.configurationTypeID)}
                              fullWidth
                              helperText={touched.configurationTypeID && errors.configurationTypeID}
                              name="configurationTypeID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={costCenterConfiguration.configurationTypeID}
                              variant="outlined"
                              id="configurationTypeID"
                              size='small'
                              InputProps={{
                                readOnly: isUpdate ? true : false
                              }}
                            >
                              <MenuItem value="0">--Select Configuration Type--</MenuItem>
                              <MenuItem value="1">Value</MenuItem>
                              <MenuItem value="2">Min / Max</MenuItem>
                              <MenuItem value="3">Boolean</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={8}>
                            <InputLabel shrink id="configurationValue">
                              Configuration Value
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.configurationValue && errors.configurationValue)}
                              fullWidth
                              helperText={touched.configurationValue && errors.configurationValue}
                              name="configurationValue"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={costCenterConfiguration.configurationValue}
                              variant="outlined"
                              defaultValue={0}
                              onKeyDown={(evt) =>
                                (evt.key === "-") && evt.preventDefault()
                              }
                              InputProps={{
                                step: 0.01,
                                type: 'number',
                              }}
                              onWheel={event => event.target.blur()}
                            />
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={8}>
                            <InputLabel shrink id="measuringUnitID">
                              Measuring Unit
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="measuringUnitID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={costCenterConfiguration.measuringUnitID}
                              variant="outlined"
                              id="measuringUnitID"
                              size='small'
                            >
                              <MenuItem value="0">--Select Measuring Unit--</MenuItem>
                              {generateDropDownMenu(measuringUnitType)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={8}>
                            <InputLabel shrink id="minValue">
                              Min Value
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.minValue && errors.minValue)}
                              fullWidth
                              helperText={touched.minValue && errors.minValue}
                              name="minValue"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={costCenterConfiguration.minValue}
                              variant="outlined"
                              defaultValue={0}
                              onKeyDown={(evt) =>
                                (evt.key === "-") && evt.preventDefault()
                              }
                              InputProps={{
                                step: 0.01,
                                type: 'number',
                              }}
                              onWheel={event => event.target.blur()}
                            />
                          </Grid>
                          <Grid item md={4} xs={8}>
                            <InputLabel shrink id="maxValue">
                              Max Value
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.maxValue && errors.maxValue)}
                              fullWidth
                              helperText={touched.maxValue && errors.maxValue}
                              name="maxValue"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={costCenterConfiguration.maxValue}
                              variant="outlined"
                              defaultValue={0}
                              onKeyDown={(evt) =>
                                (evt.key === "-") && evt.preventDefault()
                              }
                              InputProps={{
                                step: 0.01,
                                type: 'number',
                              }}
                              onWheel={event => event.target.blur()}
                            />
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={8}>
                            <InputLabel shrink id="jsonString">
                              Json String
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.jsonString && errors.jsonString)}
                              fullWidth
                              helperText={touched.jsonString && errors.jsonString}
                              name="jsonString"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={costCenterConfiguration.jsonString}
                              variant="outlined"
                            />
                          </Grid>
                          <Grid item md={4} xs={8}>
                            <InputLabel shrink id="isActive">
                              Active
                            </InputLabel>
                            <Switch
                              checked={costCenterConfiguration.isActive}
                              onChange={(e) => handleCheckActive(e)}
                              name="isActive"
                            />
                          </Grid>
                          <Grid item md={4} xs={8}>
                            <InputLabel shrink id="isApply">
                              Is Apply
                            </InputLabel>
                            <Switch
                              checked={costCenterConfiguration.isApply}
                              onChange={(e) => handleSwitchApply(e)}
                              name="isApply"
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          color="primary"
                          disabled={isSubmitting}
                          type="submit"
                          variant="contained"
                        >
                          {isUpdate == true ? "Update" : "Save"}
                        </Button>
                      </Box>
                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            )}
          </Formik>
        </Container>
      </Page>
    </Fragment >
  );
};
