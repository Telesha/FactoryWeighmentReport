import React, { useState, useEffect, createContext } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Card, makeStyles, Container, CardHeader, CardContent, Divider, MenuItem, Grid, InputLabel, TextField, Button, Chip } from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import MaterialTable from "material-table";
import moment from 'moment';
import xlsx from 'json-as-xlsx';
import SearchNotFound from 'src/views/Common/SearchNotFound';
import { CustomTable } from './CustomTable';
import * as Yup from "yup";
import { Formik } from 'formik';

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
  colorRecord: {
    backgroundColor: 'green'
  }
}));

const screenCode = 'FIELDREGISTRATION';
export default function FieldRegistrationListing() {
  const classes = useStyles();
  const [fieldData, setFieldData] = useState([]);
  const [groups, setGroups] = useState();
  const [estates, setEstates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [products, setProducts] = useState([]);
  const [totalFieldArea, setTotalFieldArea] = useState([]);
  const [totalMaturedArea, setTotalMaturedArea] = useState([]);
  const [totalImmaturedArea, setTotalImmaturedArea] = useState([]);
  const [totalActualPlants, setTotalActualPlants] = useState([]);
  const [excel, setExcel] = useState(false);
  const [initialLoad, setInitialLoad] = useState(false);
  const [fieldID, setFeildID] = useState(0);
  const [fieldList, setFieldList] = useState({
    groupID: '0',
    estateID: '0',
    divisionID: '0',
    productID: '0'
  })
  const [IDDataForDefaultLoad, setIsIDDataForDefaultLoad] = useState(null);
  const [csvHeaders, SetCsvHeaders] = useState([]);
  const navigate = useNavigate();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    let model = {
      groupID: parseInt(fieldList.groupID),
      estateID: parseInt(fieldList.estateID),
      divisionID: parseInt(fieldList.divisionID),
      productID: parseInt(fieldList.productID)
    }
    sessionStorage.setItem(
      'field-listing-page-search-parameters-id',
      JSON.stringify(model)
    );
    navigate('/app/fieldRegistration/addEdit/' + encrypted);
  }
  useEffect(() => {
    if (fieldID != 0) {
      handleClickEdit(fieldID)
    }
  }, [fieldID]);

  const handleClickEdit = (fieldID) => {
    encrypted = btoa(fieldID.toString());
    let model = {
      groupID: parseInt(fieldList.groupID),
      estateID: parseInt(fieldList.estateID),
      divisionID: parseInt(fieldList.divisionID),
      productID: parseInt(fieldList.productID)
    }
    sessionStorage.setItem(
      'field-listing-page-search-parameters-id',
      JSON.stringify(model)
    );
    navigate('/app/fieldRegistration/addEdit/' + encrypted);

  }

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
    isAddEditScreen: false
  });

  useEffect(() => {
    const IDdata = JSON.parse(
      sessionStorage.getItem('field-listing-page-search-parameters-id')
    );
    getPermissions(IDdata);
  }, []);

  useEffect(() => {
    sessionStorage.removeItem(
      'field-listing-page-search-parameters-id'
    );
  }, []);

  useEffect(() => {
    trackPromise(
      getGroupsForDropdown(),
    );
  }, []);

  useEffect(() => {
    getEstateDetailsByGroupID();
  }, [fieldList.groupID]);

  useEffect(() => {
    getDivisionDetailsByEstateID();
  }, [fieldList.estateID]);

  useEffect(() => {
    GetMappedProductsByIDs();
  }, [fieldList.estateID, fieldList.divisionID]);

  useEffect(() => {
    setFieldData([]);
  }, [fieldList.groupID, fieldList.estateID, fieldList.divisionID, fieldList.productID]);

  useEffect(() => {
    if (initialLoad) {
      setFieldList({
        ...fieldList,
        estateID: '0',
        divisionID: '0',
        productID: '0'
      })
    }
  }, [initialLoad, fieldList.groupID]);

  useEffect(() => {
    if (initialLoad) {
      setFieldList({
        ...fieldList,
        productID: '0'
      })
    }
  }, [initialLoad, fieldList.divisionID]);

  useEffect(() => {
    if (initialLoad) {
      setFieldList({
        ...fieldList,
        divisionID: '0',
        productID: '0'
      })
    }
  }, [initialLoad, fieldList.groupID, fieldList.estateID]);

  useEffect(() => {
    if (excel == true) {
      createFile()
    }
  }, [excel]);

  useEffect(() => {
    if (IDDataForDefaultLoad != null) {
      getFieldDetailsByGroupIDEstateIDDivisionID();
    }
  }, [IDDataForDefaultLoad]);

  async function getPermissions(IDdata) {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWFIELDLISTING');
    var isAddEditScreen = permissions.find(p => p.permissionCode == 'ADDEDITFIELDREGISTRATION');

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
      isAddEditScreen: isAddEditScreen !== undefined
    });

    const isInitialLoad = IDdata === null
    if (isInitialLoad) {
      setFieldList({
        ...fieldList,
        groupID: parseInt(tokenService.getGroupIDFromToken()),
        estateID: parseInt(tokenService.getFactoryIDFromToken())
      })
      setInitialLoad(true);
    }
    else {
      setFieldList({
        ...fieldList,
        groupID: IDdata.groupID,
        estateID: IDdata.estateID,
        divisionID: IDdata.divisionID,
        productID: IDdata.productID
      })
      setIsIDDataForDefaultLoad(IDdata);
      setInitialLoad(false);
    }
  }

  async function getFieldDetailsByGroupIDEstateIDDivisionID() {
    const fieldItem = await services.getFieldDetailsByGroupIDEstateIDDivisionID(fieldList.groupID, fieldList.estateID, fieldList.divisionID, fieldList.productID);
    const totalFieldArea = fieldItem.reduce((total, field) => total + field.area, 0);
    const totalMaturedArea = fieldItem.reduce((total, field) => total + field.cultivationArea, 0);
    const totalActualPlants = fieldItem.reduce((total, field) => total + field.noOfTeaBushes, 0);

    setTotalActualPlants(totalActualPlants);
    setTotalMaturedArea(totalMaturedArea);
    setTotalFieldArea(totalFieldArea);
    setTotalImmaturedArea(parseFloat(totalFieldArea) - parseFloat(totalMaturedArea));
    setFieldData(fieldItem);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getEstateDetailsByGroupID() {
    var response = await services.getEstateDetailsByGroupID(fieldList.groupID);
    setEstates(response);
  }

  async function getDivisionDetailsByEstateID() {
    var response = await services.getDivisionDetailsByEstateID(fieldList.estateID);
    setDivisions(response);
  }

  async function submitForm() {

  };

  async function GetMappedProductsByIDs() {
    setProducts([])
    var response = 0;
    if (fieldList.divisionID == '0') {
      response = await services.GetMappedProductsByFactoryID(fieldList.estateID);
    } else {
      response = await services.GetMappedProductsByDivisionID(fieldList.divisionID);
    }
    setProducts(response);
  };

  async function createDataForExcel(array) {
    var res = [];
    if (array != null) {
      array.map(x => {
        var vr = {
          'Business Division': x.groupName,
          'Location': x.factoryName,
          'Sub Division': x.divisionName,
          'Field Type': x.typeName,
          'Product': x.productName,
          'Field Topography': x.topographyName,
          'Field Code': x.fieldCode,
          'Field Name': x.fieldName,
          'Field Area': x.area,
          'Matured Area': x.cultivationArea,
          'Immatured Area': (x.area - x.cultivationArea),
          'Last Planting Year': x.lastPlantingYear == null ? '' : moment(x.lastPlantingYear).format('YYYY'),
          'Spacing': x.specing,
          'Plants per Hectare': x.plantsPerHectare,
          'Vacancy Percentage': x.vacancyPercentage,
          'Actual Number of Plants': x.noOfTeaBushes,
          'Types of plant': x.plantTypeName,
          'Field Clone': x.fieldCloneName,
          'Clone Details': x.cloneDetails,
          'Field Class': x.fieldClassName,
          'Target Crop': x.targetCrop,
          'Drainage Lengths': x.drainageLengths,
          'No. of shade trees': x.noOfShadeTrees,
          'Field Location': x.fieldLocation
        }
        res.push(vr);
      });
      res.push({});
      var vr = {
        'Business Division': "Total Field Area : " + totalFieldArea.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        'Location': "Total Matured Area : " + totalMaturedArea.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        'Sub Division': "Total Actual Plants : " + totalActualPlants.toLocaleString('en-US')
      }
      res.push(vr);
    }
    return res;
  }

  async function createFile() {
    setExcel(false);
    var file = await createDataForExcel(fieldData);
    var settings = {
      sheetName: 'Fields',
      fileName: 'Fields',
      writeOptions: {}
    }

    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let dataA = [
      {
        sheet: 'Fields',
        columns: tempcsvHeaders,
        content: file
      }
    ]
    xlsx(dataA, settings);
  }

  function handleGroupChange(e) {
    const target = e.target;
    const value = target.value
    setFieldList({
      ...fieldList,
      [e.target.name]: value,
      estateID: "0"
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

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setFieldList({
      ...fieldList,
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
          {permissionList.isAddEditScreen == true ?
            <PageHeader
              onClick={handleClick}
              isEdit={true}
              toolTiptitle={"Add Field"}
            />
            : null}
        </Grid>
      </Grid>
    )
  }

  return (
    <Page
      className={classes.root}
      title="Fields"
    >
      <Container maxWidth={false}>
        <Formik
          initialValues={{
            groupID: fieldList.groupID,
            estateID: fieldList.estateID,
            divisionID: fieldList.divisionID,
            productID: fieldList.productID
          }}
          validationSchema={Yup.object().shape({
            groupID: Yup.number()
              .required('Business Division is required')
              .min("1", 'Business Division is required'),
          })}
          onSubmit={() => trackPromise(getFieldDetailsByGroupIDEstateIDDivisionID())}
          enableReinitialize
        >
          {({
            errors,
            touched,
            handleSubmit,
          }) => {
            return (
              <form onSubmit={handleSubmit}>
                <Box mt={0}>
                  <Card>
                    <CardHeader
                      title={cardTitle("Fields")}
                    />
                    <PerfectScrollbar>
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
                              onChange={(e) => handleGroupChange(e)}
                              value={fieldList.groupID}
                              variant="outlined"
                              size='small'
                              InputProps={{
                                readOnly: !permissionList.isGroupFilterEnabled,
                              }}
                            >
                              <MenuItem value="0">--Select Business Division--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="estateID">
                              Location
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="estateID"
                              size='small'
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={fieldList.estateID}
                              variant="outlined"
                              id="estateID"
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
                              Sub Division
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="divisionID"
                              size='small'
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={fieldList.divisionID}
                              variant="outlined"
                              id="divisionID"
                            >
                              <MenuItem value={0}>--Select Sub Division--</MenuItem>
                              {generateDropDownMenu(divisions)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="productID">
                              Product
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="productID"
                              size='small'
                              onChange={(e) => handleChange(e)}
                              value={fieldList.productID}
                              variant="outlined"
                              id="productID"
                            >
                              <MenuItem value={0}>--Select Product--</MenuItem>
                              {generateDropDownMenu(products)}
                            </TextField>
                          </Grid>
                        </Grid>
                        <Grid container justify="flex-end">
                          <Box pt={2}>
                            <Button
                              color="primary"
                              variant="contained"
                              type='submit'
                            >
                              Search
                            </Button>
                          </Box>
                        </Grid>
                      </CardContent>
                      {fieldData.length > 0 ?
                        <>
                          <CustomTable fieldData={fieldData} setFeildID={setFeildID} setExcel={setExcel} totalFieldArea={totalFieldArea} totalMaturedArea={totalMaturedArea} totalImmaturedArea={totalImmaturedArea} totalActualPlants={totalActualPlants}
                            permissionList={permissionList.isAddEditScreen} />
                        </>
                        : <SearchNotFound searchQuery="Fields" />

                      }
                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            );
          }}
        </Formik>
      </Container>
    </Page>


  )
};