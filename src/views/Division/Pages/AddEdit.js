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
import { Formik } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import NumberFormat from 'react-number-format';
import PropTypes from 'prop-types';

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
var screenCode = "DIVISION"

function NumberFormatCustom(props) {
  const { inputRef, onChange, ...other } = props;

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={(values) => {
        onChange({
          target: {
            name: props.name,
            value: values.value,
          },
        });
      }}
      decimalScale={2}
      isNumericString

    />
  );
}
NumberFormatCustom.propTypes = {
  inputRef: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default function DivisionAddEdit(props) {
  const [title, setTitle] = useState("Add Sub Division")
  const [isUpdate, setIsUpdate] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const classes = useStyles();
  const [factories, setFactories] = useState();
  const [products, setProducts] = useState();
  const [groups, setGroups] = useState();
  const [costCenter, setCostCenter] = useState({
    groupID: '0',
    factoryID: '0',
    routeName: '',
    routeCode: '',
    shortCode: '',
    routeLocation: '',
    transportRate: '',
    targetCrop: '',
    productID: '0',
    isActive: true,
  });
  const [costCenterIsActive, setcostCenterIsActive] = useState(true);
  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/app/division/listing');
  }
  const [initialState, setInitialState] = useState(false);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const alert = useAlert();
  const { routeID } = useParams();
  let decrypted = 0;

  useEffect(() => {
    decrypted = atob(routeID.toString());
    if (decrypted != 0) {
      trackPromise(
        getGroupDetails(decrypted)
      )
    }
  }, []);

  useEffect(() => {
    trackPromise(getPermissions());
    trackPromise(getGroupsForDropdown());
  }, []);

  useEffect(() => {
    trackPromise(
      getfactoriesForDropDown()
    );
  }, [costCenter.groupID]);

  useEffect(() => {
    if (!initialState) {
      trackPromise(getPermissions());
    }
  }, []);

  useEffect(() => {
    trackPromise(
      getProductsForDropDown()
    );
  }, [costCenter.factoryID]);

  useEffect(() => {
    if (initialState) {
      setCostCenter((prevState) => ({
        ...prevState,
        factoryID: 0,
      }));
    }
  }, [costCenter.groupID, initialState]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDDIVISION');

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

    setCostCenter({
      ...costCenter,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
    setInitialState(true);
  }

  async function getfactoriesForDropDown() {
    const factory = await services.getfactoriesForDropDown(costCenter.groupID);
    setFactories(factory);
  }

  async function getProductsForDropDown() {
    const product = await services.getProductsByFactoryID(costCenter.factoryID);
    setProducts(product);
  }

  async function getGroupDetails(routeID) {
    const response = await services.getcostCenterDetailsByID(routeID);
    let data = response[0];
    setTitle("Edit Sub Division");
    setCostCenter((prevState) => ({
      ...prevState,
      groupID: data.groupID,
      factoryID: data.factoryID,
      routeName: data.routeName,
      routeCode: data.routeCode,
      shortCode: data.shortCode == null ? "" : data.shortCode,
      routeLocation: data.routeLocation == null ? "" : data.routeLocation,
      transportRate: data.transportRate,
      targetCrop: data.targetCrop == null ? "" : data.targetCrop,
      productID: data.productID,
      isActive: data.isActive
    }));
    setIsUpdate(true);
    setcostCenterIsActive(response[0]);

  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  async function savecostCenter(values) {
    if (isUpdate == true) {
      let updateModel = {
        costCenterID: atob(routeID.toString()),
        costCenterCode: values.costCenterCode,
        shortCode: values.shortCode,
        costCenterName: values.costCenterName,
        costCenterLocation: values.costCenterLocation,
        transportRate: values.transportRate,
        targetCrop: values.targetCrop,
        productID: values.productID,
        isActive: values.isActive,
        factoryID: values.factoryID,
        groupID: values.groupID
      }
      let response = await services.updatecostCenter(updateModel);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/division/listing');
      }
      else {
        setCostCenter({
          ...costCenter,
          isActive: costCenterIsActive
        });
        alert.error(response.message);
      }
    }

    else {
      let response = await services.savecostCenter(values);

      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/division/listing');
      }
      else {
        alert.error(response.message);
      }
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

  function handleChangeData(e) {
    const target = e.target;
    const value = target.value
    setCostCenter({
      ...costCenter,
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

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: costCenter.groupID,
              factoryID: costCenter.factoryID,
              costCenterName: costCenter.routeName,
              costCenterCode: costCenter.routeCode,
              costCenterLocation: costCenter.routeLocation,
              targetCrop: costCenter.targetCrop,
              productID: costCenter.productID,
              shortCode: costCenter.shortCode,
              isActive: costCenter.isActive,

            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Business Division is required').min("1", 'Business Division is required'),
                factoryID: Yup.number().required('Location is required').min("1", 'Location is required'),
                costCenterName: Yup.string().max(255).matches(/^[a-zA-Z\d\s]+$/, 'Special Characters Not Allowed').required('Sub Division Name is required'),
                costCenterCode: Yup.string().max(2, "Sub Division Code must be at most 2 characters").required('Sub Division Code is required').matches(/^[0-9\b]+$/, 'Only allow numbers'),
                costCenterLocation: Yup.string().max(255).matches(/^[a-zA-Z\d\s\,\.\/]+$/, 'Special Characters and Numbers Not Allowed'),
                targetCrop: Yup.string().matches(/^[0-9]+([.][0-9]+)?$/, 'Target Crop should positive number').nullable(),
                productID: Yup.number().required('Product is required').min("1", 'Product is required'),
                shortCode: Yup.string().required('Short Code is required').matches(/^[A-Z0-9]+$/, 'Numbers And Uppercase Letters Only').max(5, 'Short Code must be at most 5 characters'),
              })
            }
            onSubmit={savecostCenter}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleChange,
              handleSubmit,
              isSubmitting,
              touched,
              values,
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
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="groupID">
                              Business Division *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              size='small'
                              name="groupID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeData(e)}
                              value={values.groupID}
                              variant="outlined"
                              id="groupID"
                              InputProps={{
                                readOnly: isUpdate || !permissionList.isGroupFilterEnabled ? true : false,
                              }}
                            >
                              <MenuItem value="0">--Select Business Division--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="factoryID">
                              Location *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.factoryID && errors.factoryID)}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              size='small'
                              name="factoryID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeData(e)}
                              value={costCenter.factoryID}
                              variant="outlined"
                              id="factoryID"
                              InputProps={{
                                readOnly: isUpdate || !permissionList.isFactoryFilterEnabled ? true : false,
                              }}
                            >
                              <MenuItem value="0">--Select Location--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="productID">
                              Product *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.productID && errors.productID)}
                              fullWidth
                              helperText={touched.productID && errors.productID}
                              size='small'
                              name="productID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeData(e)}
                              value={costCenter.productID}
                              variant="outlined"
                              id="productID"
                              InputProps={{
                                readOnly: isUpdate ? true : false,
                              }}
                            >
                              <MenuItem value="0">--Select Product--</MenuItem>
                              {generateDropDownMenu(products)}
                            </TextField>
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="costCenterCode">
                              Sub Division Code *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.costCenterCode && errors.costCenterCode)}
                              fullWidth
                              helperText={touched.costCenterCode && errors.costCenterCode}
                              size='small'
                              name="routeCode"
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeData(e)}
                              value={costCenter.routeCode}
                              variant="outlined"
                              disabled={isDisableButton}
                              InputProps={{
                                readOnly: isUpdate ? true : false,
                              }}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="shortCode">
                              Short Code *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.shortCode && errors.shortCode)}
                              fullWidth
                              helperText={touched.shortCode && errors.shortCode}
                              name="shortCode"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeData(e)}
                              value={costCenter.shortCode}
                              variant="outlined"
                              disabled={isDisableButton}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="costCenterName">
                              Sub Division Name *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.costCenterName && errors.costCenterName)}
                              fullWidth
                              helperText={touched.costCenterName && errors.costCenterName}
                              size='small'
                              name="routeName"
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeData(e)}
                              value={costCenter.routeName}
                              variant="outlined"
                              disabled={isDisableButton}
                              inputProps={{ maxLength: 20 }}
                            />
                          </Grid>

                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="costCenterLocation">
                              Sub Division Location
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.costCenterLocation && errors.costCenterLocation)}
                              fullWidth
                              helperText={touched.costCenterLocation && errors.costCenterLocation}
                              size='small'
                              name="routeLocation"
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeData(e)}
                              value={costCenter.routeLocation}
                              variant="outlined"
                              disabled={isDisableButton}
                              inputProps={{ maxLength: 30 }}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="targetCrop">
                              Target Crop (in Kg)
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.targetCrop && errors.targetCrop)}
                              fullWidth
                              helperText={touched.targetCrop && errors.targetCrop}
                              size='small'
                              name="targetCrop"
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeData(e)}
                              value={costCenter.targetCrop}
                              variant="outlined"
                              disabled={isDisableButton}
                            />
                          </Grid>
                        </Grid>

                        <Grid container spacing={3}>
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
                      </CardContent>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          color="primary"
                          disabled={isSubmitting || isDisableButton}
                          type="submit"
                          variant="contained"
                          size='small'
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
    </Fragment>
  );
};
