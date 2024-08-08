import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, Switch, CardHeader, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import { Delete, Edit } from '@material-ui/icons';
import moment from 'moment';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import tokenService from '../../../../utils/tokenDecoder';
import authService from '../../../../utils/permissionAuth';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100%',
  },
  cardContent: {
    border: `2px solid #e8eaf6`
  },
}));

const screenCode = 'FIELDREGISTRATION';
export function GeneralDetails({ fieldGeneralArray, setFieldGeneralArray, setIsMainButtonEnable }) {
  const [title, setTitle] = useState("Add Field")
  const [isUpdate, setIsUpdate] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const [btnDisable, setBtnDisable] = useState(false);
  const classes = useStyles();
  const [groups, setGroups] = useState()
  const [estates, setEstates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [products, setProducts] = useState([]);
  const [typesOfPlants, setTypesOfPlants] = useState([]);
  const [fieldClass, setFieldClass] = useState([]);
  const [fieldTopography, setFieldTopography] = useState([]);
  const [fieldClone, setFieldClone] = useState([]);
  const [sectionTypes, setSectionTypes] = useState([]);
  const [field, setField] = useState({
    fieldID: 0,
    groupID: 0,
    estateID: 0,
    divisionID: 0,
    fieldCode: '',
    fieldName: '',
    fieldLocation: '',
    area: 0,
    cultivationArea: 0,
    targetCrop: 0,
    sectionName: '',
    areaOfSection: 0,
    typesOfPlant: 0,
    clone: 0,
    seedling: 0,
    drainageLengths: 0,
    noOfTeaBushes: 0,
    noOfShadeTrees: 0,
    isActive: true,
    sectionType: 0,
    fieldClassID: 0,
    fieldTopographyID: 0,
    productID: 0,
    fieldCloneDetailID: 0,
    plantsPerHectare: 0,
    vacancyPercentage: 0,
    actualPlants: 0,
    lastYear: '',
    specing: '',
    cloneDetails: ''
  });

  const navigate = useNavigate();
  const alert = useAlert();
  const [initialState, setInitialState] = useState(false);
  const { fieldID } = useParams();
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  let decrypted = 0;

  useEffect(() => {
    trackPromise(
      getPermissions(),
    );
  }, []);

  useEffect(() => {
    getEstateDetailsByGroupID();
  }, [field.groupID]);

  useEffect(() => {
    getDivisionDetailsByEstateID();
  }, [field.estateID]);

  useEffect(() => {
    if (!initialState) {
      trackPromise(getPermissions());
    }
  }, []);

  useEffect(() => {
    GetMappedProductsByDivisionID();
  }, [field.divisionID]);

  useEffect(() => {
    if (initialState) {
      setField((prevState) => ({
        ...prevState,
        estateID: 0,
        divisionID: 0,

      }));
    }
  }, [field.groupID, initialState]);

  useEffect(() => {
    if (initialState) {
      setField((prevState) => ({
        ...prevState,
        divisionID: 0
      }));
    }
  }, [field.estateID, initialState]);

  useEffect(() => {
    calActualPlantsValue(field.plantsPerHectare, field.area, field.vacancyPercentage);
  }, [field.plantsPerHectare, field.area, field.vacancyPercentage]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITFIELDREGISTRATION');

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
      setField({
        ...field,
        groupID: parseInt(tokenService.getGroupIDFromToken()),
        estateID: parseInt(tokenService.getFactoryIDFromToken()),
      });
    }
    trackPromise(setGeneralValues());
    trackPromise(
      getGroupsForDropdown(),
      GetAllFieldPlantType(),
      GetAllFieldTopography(),
      GetAllFieldClass(),
      GetAllFieldCloneDetail(),
      getSectionTypes());
    setInitialState(true);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  };

  async function getEstateDetailsByGroupID() {
    var response = await services.getEstateDetailsByGroupID(field.groupID);
    setEstates(response);
  };

  async function getDivisionDetailsByEstateID() {
    var response = await services.getDivisionDetailsByEstateID(field.estateID);
    setDivisions(response);
  };

  async function GetMappedProductsByDivisionID() {
    var response = await services.GetMappedProductsByDivisionID(field.divisionID);
    setProducts(response);
  };

  async function getSectionTypes() {
    const result = await services.getSectionTypes()
    setSectionTypes(result);
  }

  async function GetAllFieldPlantType() {
    const result = await services.GetAllFieldPlantType()
    setTypesOfPlants(result);
  }

  async function GetAllFieldClass() {
    const result = await services.GetAllFieldClass()
    setFieldClass(result);
  }

  async function GetAllFieldTopography() {
    const result = await services.GetAllFieldTopography()
    setFieldTopography(result);
  }

  async function GetAllFieldCloneDetail() {
    const result = await services.GetAllFieldCloneDetail()
    setFieldClone(result);
  }

  async function setGeneralValues() {
    if (Object.keys(fieldGeneralArray).length > 0) {
      setField({
        ...field,
        groupID: fieldGeneralArray.groupID,
        estateID: fieldGeneralArray.estateID,
        divisionID: fieldGeneralArray.divisionID,
        fieldCode: fieldGeneralArray.fieldCode,
        fieldName: fieldGeneralArray.fieldName,
        fieldLocation: fieldGeneralArray.fieldLocation,
        area: fieldGeneralArray.area,
        cultivationArea: fieldGeneralArray.cultivationArea,
        targetCrop: fieldGeneralArray.targetCrop,
        sectionName: fieldGeneralArray.sectionName,
        areaOfSection: fieldGeneralArray.areaOfSection,
        sectionType: fieldGeneralArray.sectionTypeID,
        typesOfPlant: fieldGeneralArray.typesOfPlant,
        clone: fieldGeneralArray.clone,
        seedling: fieldGeneralArray.seedling,
        drainageLengths: fieldGeneralArray.drainageLengths,
        noOfTeaBushes: fieldGeneralArray.noOfTeaBushes,
        noOfShadeTrees: fieldGeneralArray.noOfShadeTrees,
        productID: fieldGeneralArray.productID,
        fieldClassID: fieldGeneralArray.fieldClassID,
        fieldTopographyID: fieldGeneralArray.fieldTopographyID,
        fieldCloneDetailID: fieldGeneralArray.fieldCloneDetailID,
        plantsPerHectare: fieldGeneralArray.plantsPerHectare,
        vacancyPercentage: fieldGeneralArray.vacancyPercentage,
        lastYear: fieldGeneralArray.lastPlantingYear,
        specing: fieldGeneralArray.specing == null ? '' : fieldGeneralArray.specing,
        cloneDetails: fieldGeneralArray.cloneDetails,
        isActive: fieldGeneralArray.isActive,
      });
      if (fieldGeneralArray.fieldID > 0) {
        setIsUpdate(true);
      }
      else {
        setIsUpdate(false);
      }
    }
  }

  async function saveFieldGeneral(values) {
    let general = {
      fieldID: 0,
      groupID: parseInt(values.groupID),
      estateID: parseInt(values.estateID),
      divisionID: parseInt(values.divisionID),
      fieldCode: values.fieldCode,
      fieldName: values.fieldName,
      fieldLocation: values.fieldLocation,
      area: parseFloat(values.area),
      cultivationArea: values.cultivationArea == "" ? parseFloat(0) : parseFloat(values.cultivationArea),
      targetCrop: parseFloat(values.targetCrop),
      typesOfPlant: parseInt(values.typesOfPlant),
      clone: parseInt(values.clone),
      seedling: parseInt(values.seedling),
      drainageLengths: parseFloat(values.drainageLengths),
      noOfTeaBushes: parseInt(values.noOfTeaBushes),
      noOfShadeTrees: parseInt(values.noOfShadeTrees),
      sectionTypeID: parseInt(values.sectionType),
      productID: parseInt(values.productID),
      fieldClassID: parseInt(values.fieldClassID),
      fieldTopographyID: parseInt(values.fieldTopographyID),
      fieldCloneDetailID: parseInt(values.fieldCloneDetailID),
      plantsPerHectare: parseFloat(values.plantsPerHectare),
      vacancyPercentage: parseFloat(values.vacancyPercentage),
      lastPlantingYear: values.lastYear,
      specing: values.specing,
      cloneDetails: values.cloneDetails,
      isActive: values.isActive,
      createdBy: tokenService.getUserIDFromToken(),
    }
    btnchecking();
    setFieldGeneralArray(general);
    setIsMainButtonEnable(true);
    alert.success("Field general details added.");
  }

  function btnchecking() {
    setBtnDisable(false);
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

  function handleChangeValue(e) {
    const target = e.target;
    const value = target.value;
    if (field.typesOfPlant == 3) {
      setField({
        ...field,
        clone: value
      })
    }
  }

  function handleChangeData(e) {
    const value = e.target.value;
    setField({
      ...field,
      [e.target.name]: value
    });
  }

  function handleDateChange(value) {
    setField({
      ...field,
      lastYear: value
    })
  }

  function calActualPlantsValue(plantsPerHectare, area, vacancyPercentage) {
    const total = ((parseFloat(area) * parseFloat(plantsPerHectare)) - ((parseFloat(area) * parseFloat(plantsPerHectare)) * (parseFloat(vacancyPercentage) / 100)))
    setField({
      ...field,
      noOfTeaBushes: parseInt(total)
    })
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: field.groupID,
              estateID: field.estateID,
              divisionID: field.divisionID,
              fieldCode: field.fieldCode,
              fieldName: field.fieldName,
              fieldLocation: field.fieldLocation,
              area: field.area,
              cultivationArea: field.cultivationArea,
              targetCrop: field.targetCrop,
              sectionName: field.sectionName,
              areaOfSection: field.areaOfSection,
              typesOfPlant: field.typesOfPlant,
              clone: field.clone,
              seedling: field.seedling,
              drainageLengths: field.drainageLengths,
              noOfTeaBushes: field.noOfTeaBushes,
              noOfShadeTrees: field.noOfShadeTrees,
              isActive: field.isActive,
              sectionType: field.sectionType,
              productID: field.productID,
              fieldClassID: field.fieldClassID,
              fieldTopographyID: field.fieldTopographyID,
              fieldCloneDetailID: field.fieldCloneDetailID,
              plantsPerHectare: field.plantsPerHectare,
              vacancyPercentage: field.vacancyPercentage,
              actualPlants: field.actualPlants,
              lastYear: field.lastYear,
              specing: field.specing,
              cloneDetails: field.cloneDetails
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Business Division is required').min("1", 'Business Division is required'),
                estateID: Yup.number().required('Location is required').min("1", 'Location is required'),
                divisionID: Yup.number().required('Sub Division is required').min("1", 'Sub Division is required'),
                fieldCode: Yup.string().max(30).required('Field Code is required'),
                fieldName: Yup.string().max(30).required('Field Name is required'),
                fieldLocation: Yup.string().max(100),
                area: Yup.number().min(0, 'Field Area should be greater than 0')
                  .typeError('Matured Area must be a number').test('decimal-places', 'Field Area should have exactly 2 decimal places', value => (value + '').match(/^\d+(\.\d{1,2})?$/))
                  .required('Field Area is required'),
                cultivationArea: Yup.number().required('Matured Area is required').min(0, 'Matured Area should be positive value').max(field.area, 'Matured Area should lower than Field Area')
                  .typeError('Matured Area must be a number').test('decimal-places', 'Matured Area should have exactly 2 decimal places', value => (value + '').match(/^\d+(\.\d{1,2})?$/))
                  .required('Matured Area is required'),
                targetCrop: Yup.number().min(0, 'Target Crop should be positive value'),
                drainageLengths: Yup.number().required('Drainage Lengths is required').min(0, 'Drainage Lengths should be positive value').typeError('Drainage Lengths must be a number').test(
                  "maxDigitsAfterDecimal",
                  "Drainage Lengths must have 2 Decimal Places",
                  (number) => Number.isInteger(number * (10 ** 2))
                ),
                noOfTeaBushes: Yup.number().min(0, 'Actual Number of Plants should be positive value'),
                noOfShadeTrees: Yup.number().required('No. of Shade Trees is required').min(0, 'No Of Shade Trees should be positive value').typeError('No Of Shade Trees must be a number').test(
                  "maxDigits",
                  "No Of Shade Trees must be whole number",
                  (number) => Number.isInteger(number)
                ),
                sectionType: Yup.number().required('Field Type is required').min("1", 'Field Type is required'),
                clone: field.typesOfPlant == 3 ? Yup.number().min(0, 'Clone value should greater than 0').max(field.area, 'Clone value should lower than Field Area').required('Clone is required')
                  : Yup.number().notRequired(),
                productID: Yup.number().required('Product is required').min("1", 'Product is required'),
                fieldClassID: Yup.number().required('Field Class is required').min("1", 'Field Class is required'),
                fieldTopographyID: Yup.number().required('Field Topography is required').min("1", 'Field Topography is required'),
                typesOfPlant: Yup.number().required('Types Of Plant is required').min("1", 'Types Of Plant is required'),
                fieldCloneDetailID: Yup.number().required('Field Clone is required').min("1", 'Field Clone is required'),
                plantsPerHectare: Yup.number().min(0, 'Plants Per Hectare should be greater than 0').required('Plants Per Hectare is required').typeError('Matured Area must be a number').test(
                  "maxDigits",
                  "Plants Per Hectare must be whole number",
                  (number) => Number.isInteger(number)
                ),
                vacancyPercentage: Yup.number().required('Vacancy Percentage is required').min(0, 'Vacancy Percentage should 0 or greater than 0').max(100, 'Vacancy Percentage should 100 or lower than 100').typeError('Vacancy Percentage must be a number').test(
                  "maxDigitsAfterDecimal",
                  "Vacancy Percentage must have 2 Decimal Places",
                  (number) => Number.isInteger(number * (10 ** 2))
                ),
                lastYear: Yup.date().required('Last Planting Year required'),
              })
            }
            onSubmit={(values) => trackPromise(saveFieldGeneral(values))}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              handleChange,
              isSubmitting,
              touched,
              values,
            }) => (
              <form onSubmit={handleSubmit} autoComplete="off">
                <Box mt={3}>
                  <Card className={classes.cardContent}>
                    <CardHeader
                      title="Add General Details"
                    />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
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
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeData(e)}
                              size='small'
                              value={field.groupID}
                              variant="outlined"
                              id="groupID"
                              InputProps={{
                                readOnly: isUpdate || !permissionList.isGroupFilterEnabled ? true : false
                              }}
                            >
                              <MenuItem value="0">--Select Business Division--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="estateID">
                              Location *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.estateID && errors.estateID)}
                              fullWidth
                              helperText={touched.estateID && errors.estateID}
                              name="estateID"
                              onBlur={handleBlur}
                              size='small'
                              onChange={(e) => handleChangeData(e)}
                              value={field.estateID}
                              variant="outlined"
                              id="estateID"
                              InputProps={{
                                readOnly: isUpdate || !permissionList.isFactoryFilterEnabled ? true : false
                              }}
                            >
                              <MenuItem value={0}>--Select Location--</MenuItem>
                              {generateDropDownMenu(estates)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="divisionID">
                              Sub Division *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.divisionID && errors.divisionID)}
                              fullWidth
                              helperText={touched.divisionID && errors.divisionID}
                              name="divisionID"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeData(e)}
                              value={field.divisionID}
                              variant="outlined"
                              id="divisionID"
                              InputProps={{
                                readOnly: isUpdate
                              }}
                            >
                              <MenuItem value={0}>--Select Sub Division--</MenuItem>
                              {generateDropDownMenu(divisions)}
                            </TextField>
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="sectionType">
                              Field Type *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.sectionType && errors.sectionType)}
                              fullWidth
                              helperText={touched.sectionType && errors.sectionType}
                              name="sectionType"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeData(e)}
                              value={field.sectionType}
                              variant="outlined"
                              id="sectionType"
                            >
                              <MenuItem value="0">--Select Field Type--</MenuItem>
                              {generateDropDownMenu(sectionTypes)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="fieldCode">
                              Field Code *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.fieldCode && errors.fieldCode)}
                              fullWidth
                              helperText={touched.fieldCode && errors.fieldCode}
                              name="fieldCode"
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeData(e)}
                              value={field.fieldCode}
                              size='small'
                              variant="outlined"
                              disabled={isDisableButton}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="fieldName">
                              Field Name *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.fieldName && errors.fieldName)}
                              fullWidth
                              helperText={touched.fieldName && errors.fieldName}
                              name="fieldName"
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeData(e)}
                              value={field.fieldName}
                              size='small'
                              variant="outlined"
                              disabled={isDisableButton}
                            />
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="productID">
                              Product *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.productID && errors.productID)}
                              fullWidth
                              helperText={touched.productID && errors.productID}
                              name="productID"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeData(e)}
                              value={field.productID}
                              variant="outlined"
                              id="productID"
                            >
                              <MenuItem value={0}>--Select Product--</MenuItem>
                              {generateDropDownMenu(products)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id='area'>
                              Field Area *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.area && errors.area)}
                              fullWidth
                              helperText={touched.area && errors.area}
                              name='area'
                              onBlur={handleBlur}
                              value={field.area}
                              onChange={(e) => handleChangeData(e)}
                              variant="outlined"
                              size='small'
                              InputProps={{
                                inputProps: {
                                  step: 0
                                },
                              }}
                              onKeyDown={(evt) =>
                                (evt.key === "-") && evt.preventDefault()
                              }
                              onWheel={event => event.target.blur()}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id='cultivationArea'>
                              Matured Area *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.cultivationArea && errors.cultivationArea)}
                              fullWidth
                              helperText={touched.cultivationArea && errors.cultivationArea}
                              name='cultivationArea'
                              onBlur={handleBlur}
                              value={field.cultivationArea}
                              onChange={(e) => handleChangeData(e)}
                              variant="outlined"
                              size='small'
                              InputProps={{
                                inputProps: {
                                  step: 0
                                },
                              }}
                              onKeyDown={(evt) =>
                                (evt.key === "-") && evt.preventDefault()
                              }
                              onWheel={event => event.target.blur()}
                            />
                          </Grid>
                        </Grid>
                        <br />
                        <Divider />
                        <br />
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id='plantsPerHectare'>
                              Plants per Hectare *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.plantsPerHectare && errors.plantsPerHectare)}
                              fullWidth
                              helperText={touched.plantsPerHectare && errors.plantsPerHectare}
                              name='plantsPerHectare'
                              onBlur={handleBlur}
                              value={field.plantsPerHectare}
                              onChange={(e) => handleChangeData(e)}
                              variant="outlined"
                              size='small'
                              InputProps={{
                                inputProps: {
                                  step: 0
                                },
                              }}
                              onKeyDown={(evt) =>
                                (evt.key === "-") && evt.preventDefault()
                              }
                              onWheel={event => event.target.blur()}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id='vacancyPercentage'>
                              Vacancy Percentage *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.vacancyPercentage && errors.vacancyPercentage)}
                              fullWidth
                              helperText={touched.vacancyPercentage && errors.vacancyPercentage}
                              name='vacancyPercentage'
                              onBlur={handleBlur}
                              value={field.vacancyPercentage}
                              onChange={(e) => handleChangeData(e)}
                              variant="outlined"
                              size='small'
                              InputProps={{
                                inputProps: {
                                  step: 0
                                },
                              }} OfTeaBushes
                              onKeyDown={(evt) =>
                                (evt.key === "-") && evt.preventDefault()
                              }
                              onWheel={event => event.target.blur()}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id='noOfTeaBushes'>
                              Actual Number of Plants
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.noOfTeaBushes && errors.noOfTeaBushes)}
                              fullWidth
                              helperText={touched.noOfTeaBushes && errors.noOfTeaBushes}
                              name='noOfTeaBushes'
                              onBlur={handleBlur}
                              value={field.noOfTeaBushes}
                              onChange={(e) => handleChangeData(e)}
                              variant="outlined"
                              size='small'
                              InputProps={{
                                inputProps: {
                                  step: 0,
                                  type: 'number',
                                },
                                readOnly: true
                              }}
                              onKeyDown={(evt) =>
                                (evt.key === "-") && evt.preventDefault()
                              }
                              onWheel={event => event.target.blur()}
                            />
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="fieldClassID">
                              Field Class *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.fieldClassID && errors.fieldClassID)}
                              fullWidth
                              helperText={touched.fieldClassID && errors.fieldClassID}
                              name="fieldClassID"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeData(e)}
                              value={field.fieldClassID}
                              variant="outlined"
                              id="fieldClassID"
                            >
                              <MenuItem value={0}>--Select Field Class--</MenuItem>
                              {generateDropDownMenu(fieldClass)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="fieldTopographyID">
                              Field Topography *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.fieldTopographyID && errors.fieldTopographyID)}
                              fullWidth
                              helperText={touched.fieldTopographyID && errors.fieldTopographyID}
                              name="fieldTopographyID"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeData(e)}
                              value={field.fieldTopographyID}
                              variant="outlined"
                              id="fieldTopographyID"
                            >
                              <MenuItem value={0}>--Select Field Topography--</MenuItem>
                              {generateDropDownMenu(fieldTopography)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="fieldCloneDetailID">
                              Field Clone *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.fieldCloneDetailID && errors.fieldCloneDetailID)}
                              fullWidth
                              helperText={touched.fieldCloneDetailID && errors.fieldCloneDetailID}
                              name="fieldCloneDetailID"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeData(e)}
                              value={field.fieldCloneDetailID}
                              variant="outlined"
                              id="fieldCloneDetailID"
                            >
                              <MenuItem value={0}>--Select Field Clone--</MenuItem>
                              {generateDropDownMenu(fieldClone)}
                            </TextField>
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id='cloneDetails'>
                              Clone Details
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.cloneDetails && errors.cloneDetails)}
                              fullWidth
                              helperText={touched.cloneDetails && errors.cloneDetails}
                              name='cloneDetails'
                              onBlur={handleBlur}
                              value={field.cloneDetails}
                              onChange={(e) => handleChangeData(e)}
                              variant="outlined"
                              size='small'
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="typesOfPlant">
                              Types of plant *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.typesOfPlant && errors.typesOfPlant)}
                              fullWidth
                              helperText={touched.typesOfPlant && errors.typesOfPlant}
                              name="typesOfPlant"
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeData(e)}
                              value={field.typesOfPlant}
                              size='small'
                              variant="outlined" >
                              <MenuItem value="0">--Select Types of plant--</MenuItem>
                              {generateDropDownMenu(typesOfPlants)}
                            </TextField>
                          </Grid>
                          {field.typesOfPlant == 3 ?
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id='clone'>
                                Clone *
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.clone && errors.clone)}
                                fullWidth
                                helperText={touched.clone && errors.clone}
                                name='clone'
                                onBlur={handleBlur}
                                value={field.clone}
                                onChange={(e) => handleChangeValue(e)}
                                variant="outlined"
                                size='small'
                                InputProps={{
                                  inputProps: {
                                    step: 0
                                  },
                                }}
                                onKeyDown={(evt) =>
                                  (evt.key === "-") && evt.preventDefault()
                                }
                                onWheel={event => event.target.blur()}
                              />
                            </Grid>
                            : null}
                          {field.typesOfPlant == 3 ?
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id='seedling'>
                                Seedling
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.seedling && errors.seedling)}
                                fullWidth
                                helperText={touched.seedling && errors.seedling}
                                name='seedling'
                                onBlur={handleBlur}
                                value={field.seedling}
                                onChange={(e) => handleChangeValue(e)}
                                variant="outlined"
                                size='small'
                                InputProps={{
                                  readOnly: field.typesOfPlant == 3 ? true : false
                                }}
                              />
                            </Grid>
                            : null}
                        </Grid>
                        <br />
                        <Divider />
                        <br />
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="lastYear" style={{ marginBottom: '-8px' }}>
                              Last Planting Year *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                error={Boolean(touched.lastYear && errors.lastYear)}
                                fullWidth
                                helperText={touched.lastYear && errors.lastYear}
                                autoOk
                                views={['year']}
                                inputVariant="outlined"
                                margin="dense"
                                name="lastYear"
                                disableFuture
                                value={field.lastYear}
                                onChange={(e) => {
                                  handleDateChange(e);
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                InputProps={{ readOnly: true }}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id='targetCrop'>
                              Target Crop
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.targetCrop && errors.targetCrop)}
                              fullWidth
                              helperText={touched.targetCrop && errors.targetCrop}
                              name='targetCrop'
                              onBlur={handleBlur}
                              value={field.targetCrop}
                              onChange={(e) => handleChangeData(e)}
                              variant="outlined"
                              size='small'
                              InputProps={{
                                inputProps: {
                                  step: 0
                                },
                              }}
                              onKeyDown={(evt) =>
                                (evt.key === "-") && evt.preventDefault()
                              }
                              onWheel={event => event.target.blur()}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="fieldLocation">
                              Field Location
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.fieldLocation && errors.fieldLocation)}
                              fullWidth
                              helperText={touched.fieldLocation && errors.fieldLocation}
                              name="fieldLocation"
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeData(e)}
                              size='small'
                              value={field.fieldLocation}
                              variant="outlined"
                            />
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id='drainageLengths'>
                              Drainage Lengths *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.drainageLengths && errors.drainageLengths)}
                              fullWidth
                              helperText={touched.drainageLengths && errors.drainageLengths}
                              name='drainageLengths'
                              onBlur={handleBlur}
                              value={field.drainageLengths}
                              onChange={(e) => handleChangeData(e)}
                              variant="outlined"
                              size='small'
                              InputProps={{
                                inputProps: {
                                  step: 0
                                },
                              }}
                              onKeyDown={(evt) =>
                                (evt.key === "-") && evt.preventDefault()
                              }
                              onWheel={event => event.target.blur()}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id='noOfShadeTrees'>
                              No. of shade trees *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.noOfShadeTrees && errors.noOfShadeTrees)}
                              fullWidth
                              helperText={touched.noOfShadeTrees && errors.noOfShadeTrees}
                              name='noOfShadeTrees'
                              onBlur={handleBlur}
                              value={field.noOfShadeTrees}
                              onChange={(e) => handleChangeData(e)}
                              variant="outlined"
                              size='small'
                              InputProps={{
                                inputProps: {
                                  step: 0
                                },
                              }}
                              onKeyDown={(evt) =>
                                (evt.key === "-") && evt.preventDefault()
                              }
                              onWheel={event => event.target.blur()}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id='specing'>
                              Specing
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.specing && errors.specing)}
                              fullWidth
                              helperText={touched.specing && errors.specing}
                              name='specing'
                              onBlur={handleBlur}
                              value={field.specing}
                              onChange={(e) => handleChangeData(e)}
                              variant="outlined"
                              size='small'
                            />
                          </Grid>
                        </Grid>
                        <Grid container spacing={3} style={{ marginTop: 30 }}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="isActive">
                              Active
                            </InputLabel>
                            <Switch
                              checked={values.isActive}
                              onChange={handleChange}
                              name="isActive"
                              disabled={isDisableButton}
                            />
                          </Grid>
                        </Grid>
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <Button
                            color="primary"
                            disabled={btnDisable}
                            type="submit"
                            size='small'
                            variant="contained"
                          >
                            Add
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
    </Fragment >
  );
};
