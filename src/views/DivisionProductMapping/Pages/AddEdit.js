import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, Switch, CardHeader, MenuItem, TextareaAutosize
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
import tokenService from '../../../utils/tokenDecoder';

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

const screenCode = 'DIVISIONPRODUCTMAPPING';
export default function DivisionProductMappingAddEdit(props) {
  const [title, setTitle] = useState("Add Division Product Mapping")
  const [isUpdate, setIsUpdate] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const classes = useStyles();
  const [groups, setGroups] = useState()
  const [estates, setEstates] = useState([]);
  const [products, setProducts] = useState();
  const [divisions, setDivisions] = useState([]);
  const [initialState, setInitialState] = useState(false);
  const [divisionProductMapping, setDivisionProductMapping] = useState({
    divisionProductMappingID: 0,
    groupID: 0,
    factoryID: 0,
    divisionID: 0,
    productID: 0,
    isActive: true,
  });

  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/app/DivisionProductMapping/listing');
  }
  const alert = useAlert();

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  const { divisionProductMappingID } = useParams();
  let decrypted = 0;
  useEffect(() => {
    decrypted = atob(divisionProductMappingID.toString());

    if (decrypted !== "0") {

      setTitle("Edit Division Product Mapping");
      setIsUpdate(true);
      trackPromise(
        GetDivisionProductMappingDetailsByDivisionProductMappingID(decrypted)
      )
    }
  }, []);


  useEffect(() => {
    trackPromise(
      getPermissions(), getGroupsForDropdown(),
      getProductsForDropdown()
    );
  }, []);

  useEffect(() => {
    if (!initialState) {
      trackPromise(getPermissions());
    }
  }, []);

  useEffect(() => {
    getEstateDetailsByGroupID();
  }, [divisionProductMapping.groupID]);

  useEffect(() => {
    if (initialState) {
      setDivisionProductMapping((prevState) => ({
        ...prevState,
        factoryID: 0,
        divisionID: 0,

      }));
    }
  }, [divisionProductMapping.groupID, initialState]);

  useEffect(() => {
    if (initialState) {
      setDivisionProductMapping((prevState) => ({
        ...prevState,
        divisionID: 0
      }));
    }
  }, [divisionProductMapping.factoryID, initialState]);

  useEffect(() => {
    getDivisionDetailsByEstateID();
  }, [divisionProductMapping.factoryID]);

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  };

  async function getEstateDetailsByGroupID() {
    var response = await services.getEstateDetailsByGroupID(divisionProductMapping.groupID);
    setEstates(response);
  };

  async function getDivisionDetailsByEstateID() {
    var response = await services.getDivisionDetailsByEstateID(divisionProductMapping.factoryID);
    setDivisions(response);
  };

  async function getProductsForDropdown() {
    const products = await services.getProductsForDropdown();
    setProducts(products);
  }


  async function GetDivisionProductMappingDetailsByDivisionProductMappingID(divisionProductMappingID) {
    let response = await services.GetDivisionProductMappingDetailsByDivisionProductMappingID(divisionProductMappingID);
    setTitle("Edit Division Product Mapping");
    setDivisionProductMapping({
      ...divisionProductMapping,
      divisionProductMappingID: response.divisionProductMappingID,
      groupID: response.groupID,
      factoryID: response.factoryID,
      divisionID: response.divisionID,
      productID: response.productID,
      isActive: response.isActive,
    });

    setIsUpdate(true);
  }

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITDIVISIONPRODUCTMAPPING');

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
    setDivisionProductMapping({
      ...divisionProductMapping,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      gardenID: parseInt(tokenService.getFactoryIDFromToken())
    })
    setInitialState(true);
  }



  async function saveDivisionProductMapping(values) {
    if (isUpdate) {
      let updateModel = {
        divisionProductMappingID: parseInt(atob(divisionProductMappingID.toString())),
        groupID: parseInt(values.groupID),
        factoryID: parseInt(values.factoryID),
        divisionID: parseInt(values.divisionID),
        productID: parseInt(values.productID),
        isActive: values.isActive,
        modifiedBy: parseInt(tokenService.getUserIDFromToken())
      }
      let response = await services.UpdateDivisionProductMapping(updateModel);

      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/DivisionProductMapping/listing');
      }
      else {
        alert.error(response.message);
      }
    } else {
      let saveModel = {
        divisionProductMappingID: 0,
        groupID: parseInt(divisionProductMapping.groupID),
        factoryID: parseInt(divisionProductMapping.factoryID),
        divisionID: parseInt(divisionProductMapping.divisionID),
        productID: parseInt(values.productID),
        isActive: divisionProductMapping.isActive,
        createdBy: tokenService.getUserIDFromToken(),
      }

      let response = await services.saveDivisionProductMapping(saveModel);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/DivisionProductMapping/listing');
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
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>)
      }
    }
    return items
  }

  function handleChange1(e) {
    const target = e.target;
    const value = target.value;
    setDivisionProductMapping({
      ...divisionProductMapping,
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
              groupID: divisionProductMapping.groupID,
              factoryID: divisionProductMapping.factoryID,
              divisionID: divisionProductMapping.divisionID,
              productID: divisionProductMapping.productID,
              isActive: divisionProductMapping.isActive,
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Business Division is required').min("1", 'Business Division is required'),
                factoryID: Yup.number().required('Location is required').min("1", 'Location is required'),
                divisionID: Yup.number().required('Sub Division is required').min("1", 'Sub Division is required'),
                productID: Yup.number().required('Product is required').min("1", 'Product is required'),

              })
            }
            onSubmit={saveDivisionProductMapping}
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
                              size='small'
                              value={divisionProductMapping.groupID}
                              variant="outlined"
                              id="groupID"
                              InputProps={{
                                readOnly: !permissionList.isGroupFilterEnabled ? true : false

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
                              name="factoryID"
                              onBlur={handleBlur}
                              size='small'
                              onChange={(e) => handleChange1(e)}
                              value={divisionProductMapping.factoryID}
                              variant="outlined"
                              id="factoryID"
                              InputProps={{
                                readOnly: !permissionList.isFactoryFilterEnabled ? true : false

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
                              onChange={(e) => handleChange1(e)}
                              value={divisionProductMapping.divisionID}
                              variant="outlined"
                              id="divisionID"
                              InputProps={{

                              }}
                            >
                              <MenuItem value={0}>--Select Sub Division--</MenuItem>
                              {generateDropDownMenu(divisions)}
                            </TextField>
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
                              onChange={(e) => handleChange1(e)}
                              value={divisionProductMapping.productID}
                              variant="outlined"
                              id="productID"
                              onBlur={handleBlur}
                            >
                              <MenuItem value={0}>--Select Product--</MenuItem>
                              {generateDropDownMenu(products)}
                            </TextField>
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
                          size='small'
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
    </Fragment>
  );
};
