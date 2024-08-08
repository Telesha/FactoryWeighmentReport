import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Card, Grid, makeStyles, Container, Button, CardContent, Divider, CardHeader, Tabs, Tab, AppBar, MenuItem, InputLabel, TextField, Switch } from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { TabPanel } from './tabPanel';
import { Payments } from './TabPages/Payments';
import { ItemDetails } from './TabPages/ItemDetails';
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from '../../../utils/newLoader';
import { SupplierGeneral } from './TabPages/General';
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
  },
  root1: {
    flexGrow: 4
  },
}));

const screenCode = 'FACTORYITEMSUPPLIER'
export default function FactoryItemSupplierAddEdit() {
  const [title, setTitle] = useState("Add Supplier Details")
  const classes = useStyles();
  const [supplierItemArray, setSupplierItemArray] = useState([]);
  const [paymentArray, setPaymentArray] = useState([]);
  const [supplierGeneralArray, setSupplierGeneralArray] = useState([]);
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/app/factoryItemSuppliers/listing');
  }
  const alert = useAlert();
  const [value, setValue] = React.useState(0);
  const [btnDisable, setBtnDisable] = useState(false);
  const { supplierID } = useParams();
  const [isUpdate, setIsUpdate] = useState(false);
  const [supplier, setSupplier] = useState({
    groupID: '0',
    factoryID: '0',
    isActive: true
  });
  let decryptedID = 0;
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  useEffect(() => {
    decryptedID = atob(supplierID.toString());
    if (decryptedID != 0) {
      setIsUpdate(true);
      setTitle("Edit Supplier Details");
      trackPromise(getItemSuppliersBySupplierID(decryptedID));
      trackPromise(getItemSupplierByFactoryItemSupplierID(decryptedID));
      trackPromise(getSupplierPaymentMethodsByFactoryItemSupplierID(decryptedID));
    }
  }, []);

  useEffect(() => {
    trackPromise(getGroupsForDropdown(), getPermission());
  }, []);

  useEffect(() => {
    trackPromise(getFactoriesForDropDown());

  }, [supplier.groupID]);

  useEffect(() => {
    setGeneralValues();
  }, [supplierGeneralArray]);

  useEffect(() => {
    if(parseInt(atob(supplierID.toString())) === 0){
    trackPromise(checkFactoryItems());
    }

  }, [supplier.factoryID]);

  async function checkFactoryItems(){
   var checks= supplierItemArray.filter(x=>parseInt(x.factoryID)===parseInt(supplier.factoryID));
   setSupplierItemArray(checks);
  }

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITFACTORYITEMSUPPLIER');

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
    if (parseInt(atob(supplierID.toString()))=== 0) {
      setSupplier({
        ...supplier,
        groupID: parseInt(tokenService.getGroupIDFromToken()),
        factoryID: parseInt(tokenService.getFactoryIDFromToken())
      })
    }
  }

  async function setGeneralValues() {
    if (Object.keys(supplierGeneralArray).length > 0 && isUpdate) {
      setSupplier({
        ...supplier,
        groupID: supplierGeneralArray.groupID,
        factoryID: supplierGeneralArray.factoryID,
        isActive: supplierGeneralArray.isActive,
      });
    }
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  async function getFactoriesForDropDown() {
    const factoryList = await services.getFactoryByGroupID(supplier.groupID);
    setFactories(factoryList);
  }

  async function getSupplierPaymentMethodsByFactoryItemSupplierID(supplierID) {
    let responsePayment = await services.getSupplierPaymentMethodsByFactoryItemSupplierID(supplierID);
    for (var i = 0; i < responsePayment.length; i++) {
      var newPaymentArray = paymentArray;
      newPaymentArray.push(responsePayment[i]);
      setPaymentArray(newPaymentArray);
    }
  }

  async function getItemSupplierByFactoryItemSupplierID(supplierID) {
    let suppliers = await services.getItemSupplierByFactoryItemSupplierID(supplierID);

    for (var i = 0; i < suppliers.length; i++) {
      var newItemArray = supplierItemArray;
      newItemArray.push(suppliers[i]);
      setSupplierItemArray(newItemArray);
    }
  }

  async function getItemSuppliersBySupplierID(supplierID) {
    let supplierGeneral = await services.getItemSuppliersBySupplierID(supplierID);
    setSupplierGeneralArray({ ...supplierGeneral });
  }

  async function saveFactoryItemSupplier() {

    if(!isUpdate  && (supplierItemArray.length <= 0 || paymentArray.length <= 0||supplierGeneralArray.length<=0)) {
      alert.error('Please fill before save');
    } else {

      if (!isUpdate) {

        let saveModel = {
          groupID: supplier.groupID,
          factoryID: supplier.factoryID,
          isActive: supplier.isActive,
          supplierName: supplierGeneralArray.supplierName,
          taxNumber: supplierGeneralArray.taxNumber,
          address3: supplierGeneralArray.address3,
          address1: supplierGeneralArray.address1,
          address2: supplierGeneralArray.address2,
          zipCode: supplierGeneralArray.zipCode,
          country: supplierGeneralArray.country,
          officePhoneNumber: supplierGeneralArray.officePhoneNumber,
          mobile: supplierGeneralArray.mobile,
          email: supplierGeneralArray.email,
          isCreditSupplier: supplierGeneralArray.isCreditSupplier,
          supplierItemArray: supplierItemArray,
          paymentArray: paymentArray,
          nicBRNumber: supplierGeneralArray.nicBRNumber
        }
        let response = await services.saveFactoryItemSupplier(saveModel);
        if (response.statusCode == "Success") {
          alert.success(response.message);
          setBtnDisable(true);
          navigate('/app/factoryItemSuppliers/listing');
        }
        else {
          alert.error(response.message);
        }
      } else {
        let updateModel = {
          supplierID: parseInt(atob(supplierID.toString())),
          groupID: supplier.groupID,
          factoryID: supplier.factoryID,
          isActive: supplier.isActive,
          supplierName: supplierGeneralArray.supplierName,
          taxNumber: supplierGeneralArray.taxNumber,
          address3: supplierGeneralArray.address3,
          address1: supplierGeneralArray.address1,
          address2: supplierGeneralArray.address2,
          zipCode: supplierGeneralArray.zipCode,
          country: supplierGeneralArray.country,
          officePhoneNumber: supplierGeneralArray.officePhoneNumber,
          mobile: supplierGeneralArray.mobile,
          email: supplierGeneralArray.email,
          isCreditSupplier: supplierGeneralArray.isCreditSupplier,
          supplierItemArray: supplierItemArray,
          paymentArray: paymentArray,
          nicBRNumber: supplierGeneralArray.nicBRNumber
        }

        let response = await services.updateFactoryItemSupplier(updateModel);
        if (response.statusCode == "Success") {
          alert.success(response.message);
          setBtnDisable(true);
          navigate('/app/factoryItemSuppliers/listing');
        }
        else {
          alert.error(response.message);
        }
      }
    }
  }

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
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

  function generateDropDownMenu(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
      }
    }
    return items
  }

  function handleChange1(e) {
    const target = e.target;
    const value = target.name === 'isActive' ? target.checked : target.value;
    setSupplier({
      ...supplier,
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
              groupID: supplier.groupID,
              factoryID: supplier.factoryID
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min(1, 'Please select a group'),
                factoryID: Yup.number().required('Factory is required').min(1, 'Please select a factory'),
              })
            }
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleChange,
              handleSubmit,
              isSubmitting,
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
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="groupID">
                                Group *
                                </InputLabel>
                              <TextField select
                                error={Boolean(touched.groupID && errors.groupID)}
                                fullWidth
                                helperText={touched.groupID && errors.groupID}
                                name="groupID"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange1(e)}
                                value={supplier.groupID}
                                variant="outlined"
                                InputProps={{
                                  readOnly: isUpdate||!permissionList.isGroupFilterEnabled ? true : false,
                                }}
                                size='small'
                              >
                                <MenuItem value="0">--Select Group--</MenuItem>
                                {generateDropDownMenu(groups)}
                              </TextField>
                            </Grid>
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="factoryID">
                                Factory *
                            </InputLabel>
                              <TextField select
                                error={Boolean(touched.factoryID && errors.factoryID)}
                                fullWidth
                                helperText={touched.factoryID && errors.factoryID}
                                name="factoryID"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange1(e)}
                                value={supplier.factoryID}
                                variant="outlined"
                                InputProps={{
                                  readOnly: isUpdate||!permissionList.isFactoryFilterEnabled ? true : false,
                                }}
                                size='small'
                              >
                                <MenuItem value="0">--Select Factory--</MenuItem>
                                {generateDropDownMenu(factories)}
                              </TextField>
                            </Grid>
                          </Grid>
                          <Grid container spacing={3}>
                            <Grid className={classes.root1} item xs={12}>
                              <AppBar position="static">
                                <Tabs value={value} onChange={handleTabChange} variant={'fullWidth'} classes={{ indicator: classes.indicator }}
                                  aria-label="simple tabs example" style={{ backgroundColor: "white" }}>
                                  <Tab label="General Details" {...a11yProps(0)} style={{ color: "black" }} />
                                  <Tab label="Item Details" {...a11yProps(1)} style={{ color: "black" }} />
                                  <Tab label="Payment Details" {...a11yProps(2)} style={{ color: "black" }} />
                                </Tabs>
                              </AppBar>
                              <TabPanel value={value} index={0} >
                                <SupplierGeneral supplierGeneralArray={supplierGeneralArray} setSupplierGeneralArray={setSupplierGeneralArray} isUpdate={isUpdate} />
                              </TabPanel>
                              <TabPanel value={value} index={1} >
                                <ItemDetails supplierItemArray={supplierItemArray} setSupplierItemArray={setSupplierItemArray} factoryID={supplier.factoryID} groupID={supplier.groupID} />
                              </TabPanel>
                              <TabPanel value={value} index={2}>
                                <Payments paymentArray={paymentArray} setPaymentArray={setPaymentArray} />
                              </TabPanel>
                            </Grid>
                          </Grid>

                          <Grid container spacing={0} >

                            <Grid item md={1} xs={12} style={{ marginLeft: '6rem' }}>
                              <Switch
                                checked={supplier.isActive}
                                onChange={(e) => handleChange1(e)}
                                name="isActive"
                                size='small'
                              />
                            </Grid>
                            <Grid item md={1} xs={12} style={{ marginLeft: '-1rem', marginTop: '0.6rem' }}>
                              <InputLabel id="isActive">
                                Active
                              </InputLabel>
                            </Grid>
                          </Grid>
                          <Box display="flex" justifyContent="flex-end">
                            <Button
                              color="primary"
                              disabled={(!isUpdate && supplierItemArray.length <= 0)?true:false}
                              type="submit"
                              variant="contained"
                              onClick={() => saveFactoryItemSupplier()}
                              style={{ marginTop: '-2rem' }}
                            >
                              {isUpdate ? "Update" : "Save"}
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
    </Fragment>
  );
};
