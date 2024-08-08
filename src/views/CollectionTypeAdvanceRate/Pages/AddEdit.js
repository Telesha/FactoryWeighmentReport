import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button,
  CardContent, Divider, InputLabel, Switch, CardHeader, MenuItem, Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import { DatePicker, MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { parseInt } from 'lodash';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import moment from 'moment';
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

var screenCode = "ADVANCERATE"
export default function CollectionTypeAdvanceRate(props) {
  const [title, setTitle] = useState(" Advance Rate");
  const [isUpdate, setIsUpdate] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const [isDisableSaveButton, setIsDisableSaveButton] = useState(false);
  const classes = useStyles();
  const [groups, setGroups] = useState()
  const [factories, setFactories] = useState()
  const [products, setProducts] = useState()
  const [collectionTypeArray, setCollectionTypeArray] = useState([])
  const [searchStarted, setSearchStarted] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isMaxEror, setIsMaxEror] = useState({});
  const [isMinEror, setIsMinEror] = useState({});
  const [minErrorMsg, setMinErrorMsg] = useState({});
  const [maxErrorMsg, setMaxErrorMsg] = useState({});
  const [isValid, setIsValid] = useState(true);

  const [collectionTypeRate, setCollectionTypeRate] = useState({
    groupID: 0,
    factoryID: 0,
    routeID: 0,
    productID: 0,
    collectionTypeID: 0,
    balanceRate: '0',
    advanceRate: '0',
  });

  const navigate = useNavigate();
  const handleClick = () => {

    navigate('/');

  }
  const alert = useAlert();
  const { collectionTypeID } = useParams();
  let decrypted = 0;
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });

  useEffect(() => {
    setSelectedDate(null)
    getPermissions();
    trackPromise(
      getGroupsForDropdown()
    );
  }, []);

  useEffect(() => {
    setSelectedDate(null)
    getFactoriesForDropdown()
  }, [collectionTypeRate.groupID]);

  useEffect(() => {
    setSelectedDate(null)
    trackPromise(getProductsForDropdown());
  }, [collectionTypeRate.factoryID]);

  useEffect(() => {
    setSelectedDate(null)
  }, [collectionTypeRate.productID]);

  useEffect(() => {
    setIsDisableSaveButton(false);
    trackPromise(
      GetCollectionTypeAdvanceRateDetails()
    );
  }, [selectedDate]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITADVANCETRATE');

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

    setCollectionTypeRate({
      ...collectionTypeRate,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getAllFactoriesByGroupID(collectionTypeRate.groupID);
    setFactories(factories);
  }

  async function getProductsForDropdown() {
    const products = await services.getAllProducts(collectionTypeRate.factoryID);
    setProducts(products);
  }

  async function GetCollectionTypeAdvanceRateDetails() {
    const collectionTypes = await services.GetCollectionTypeAdvanceRateDetails(collectionTypeRate.factoryID,
      collectionTypeRate.productID, moment(selectedDate).format('L'));
    setCollectionTypeArray(collectionTypes);
    if(collectionTypes==null||collectionTypes==undefined ||collectionTypes==""){
      setIsDisableSaveButton(true);
    }
  }

  async function saveCollectionTypeAdvanceRate() {
    var count = 0;
    if (!isValid) {
      alert.error("One or more invalid values in rates.");
      return;
    }

    collectionTypeArray.forEach(element => {
      if (element.minRate > element.maxRate) {
        count += 1;
      }
    });
    if (count > 0) {
      alert.error("Min rate cannot be greater than max rate");
    }
    else {

      setIsDisableButton(true);
      var valueChecker = false;
      collectionTypeArray.forEach(element => {
        if (element.minRate <= 0 || element.maxRate <= 0) {

          valueChecker = true;
          return;
        }
      });

      if (!valueChecker) {
        let response = await services.saveCollectionTypeAdvanceRate(collectionTypeArray);
        if (response.statusCode == "Success") {
          alert.success(response.message);
          trackPromise(
            GetCollectionTypeAdvanceRateDetails()
          );
          setIsDisableButton(false);
        }
        else {
          alert.error(response.message);
          setIsDisableButton(false);
        }
      } else {
        alert.error('Insert positive values');
        setIsDisableButton(false);
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
    setCollectionTypeRate({
      ...collectionTypeRate,
      [e.target.name]: value
    });
  }

  function handleRateChange(e, colletionTypeID, rateType) {
    const target = e.target;
    const value = target.value

    const newArr = [...collectionTypeArray];
    var idx = newArr.findIndex(e => e.collectionTypeID == parseInt(colletionTypeID));
    if (rateType === 'minRate') {
      checkMinValue(value, idx)
      newArr[idx] = { ...newArr[idx], minRate: parseFloat(value) };
    } else if (rateType === 'maxRate') {
      checkMaxValue(value, idx)
      newArr[idx] = { ...newArr[idx], maxRate: parseFloat(value) };
    }

    setCollectionTypeArray(newArr);
  }

  function checkMinValue(value, id) {
    var pattern = /^[0-9]+([.][0-9]{0,2})?$/;
    setIsValid(false);

    var copyOfMinErrMsgs = minErrorMsg;
    var copyOfIsMinEror = isMinEror;

    copyOfIsMinEror[id] = id;
    setIsMinEror(copyOfIsMinEror);


    if (value < 0) {
      copyOfMinErrMsgs[id] = "Min value need to be a positive number.";
    } else if (value.length > 8) {
      copyOfMinErrMsgs[id] = "Min value length exceeded.";
    } else if (value.length === 0) {
      copyOfMinErrMsgs[id] = "Min rate is required.";
    } else if (!pattern.test(value.toString())) {
      copyOfMinErrMsgs[id] = "Min value only allow numbers and numbers with atmost 2 decimal points.";
    } else {
      copyOfMinErrMsgs[id] = "";
      setIsValid(true);

      copyOfIsMinEror[id] = -1;
      setIsMinEror(copyOfIsMinEror);
    }

    setMinErrorMsg(copyOfMinErrMsgs);
  }

  function checkMaxValue(value, id) {
    var pattern = /^[0-9]+([.][0-9]{0,2})?$/;
    setIsValid(false);

    var copyOfMaxErrMsgs = maxErrorMsg;
    var copyOfIsMaxEror = isMaxEror;

    copyOfIsMaxEror[id] = id;
    setIsMaxEror(copyOfIsMaxEror);

    if (value < 0) {
      copyOfMaxErrMsgs[id] = "Max value need to be a positive number.";
    } else if (value.length > 8) {
      copyOfMaxErrMsgs[id] = "Max value length exceeded.";
    } else if (value.length === 0) {
      copyOfMaxErrMsgs[id] = "Max rate is required.";
    } else if (!pattern.test(value.toString())) {
      copyOfMaxErrMsgs[id] = "Max value only allow numbers and numbers with atmost 2 decimal points.";
    } else {
      copyOfMaxErrMsgs[id] = "";
      setIsValid(true);

      copyOfIsMaxEror[id] = -1;
      setIsMaxEror(copyOfIsMaxEror);
    }

    setMaxErrorMsg(copyOfMaxErrMsgs);

  }

  function handleDateChange(date) {

    var month = date.getUTCMonth() + 1; //months from 1-12 
    var year = date.getUTCFullYear();

    if (selectedDate != null) {

      var prevMonth = selectedDate.getUTCMonth() + 1
      var prevyear = selectedDate.getUTCFullYear();

      if ((prevyear == year && prevMonth != month) || (prevyear != year)) {
        setSelectedDate(date);
        setSearchStarted(true);

        setIsValid(true);
        setMinErrorMsg({});
        setMaxErrorMsg({});
        setIsMinEror({});
        setIsMaxEror({});
      }

    } else {
      setSelectedDate(date)
      setSearchStarted(true)
    }

  }

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {titleName}
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
              groupID: collectionTypeRate.groupID,
              factoryID: collectionTypeRate.factoryID,
              routeID: collectionTypeRate.routeID,
              productID: collectionTypeRate.productID,
              collectionTypeID: collectionTypeRate.collectionTypeID
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group required').min("1", 'Group required'),
                factoryID: Yup.number().required('Factory required').min("1", 'Factory required'),
                routeID: Yup.number().required('Route required').min("1", 'Route required'),
                productID: Yup.number().required('Product required').min("1", 'Product required'),
              })
            }
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
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="groupID">
                              Group *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="groupID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={collectionTypeRate.groupID}
                              variant="outlined"
                              id="groupID"
                              InputProps={{
                                readOnly: isUpdate || !permissionList.isGroupFilterEnabled ? true : false
                              }}
                              size='small'
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="factoryID">
                              Factory *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.factoryID && errors.factoryID)}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              name="factoryID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={collectionTypeRate.factoryID}
                              variant="outlined"
                              id="factoryID"
                              InputProps={{
                                readOnly: isUpdate || !permissionList.isFactoryFilterEnabled ? true : false
                              }}
                              size='small'
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="productID">
                              Product *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.productID && errors.productID)}
                              fullWidth
                              helperText={touched.productID && errors.productID}
                              name="productID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={collectionTypeRate.productID}
                              variant="outlined"
                              id="productID"
                              InputProps={{
                                readOnly: isUpdate ? true : false
                              }}
                              size='small'
                            >
                              <MenuItem value="0">--Select Product--</MenuItem>
                              {generateDropDownMenu(products)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <DatePicker
                                autoOk
                                variant="inline"
                                openTo="month"
                                views={["year", "month"]}
                                label="Year and Month"
                                helperText="Select applicable month *"
                                value={selectedDate}
                                onChange={(date) => handleDateChange(date)}
                                size='small'
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                        </Grid>

                        {(collectionTypeRate.productID > 0 && selectedDate > 0) ?
                          <Grid item md={12} xs={12}>
                            <Grid className={classes.container}>
                              <Collapse in={true}>
                                <Paper elevation={0} className={classes.paper}>
                                  <Grid container spacing={4}>

                                    <Grid item xs={12}>

                                      <TableContainer >
                                        <Table className={classes.table} aria-label="caption table">
                                          <TableHead>
                                            <TableRow>
                                              <TableCell align={'center'}>Collection Type</TableCell>
                                              <TableCell align={'center'}>Min Rate</TableCell>
                                              <TableCell align={'center'}>Max Rate</TableCell>
                                            </TableRow>
                                          </TableHead>
                                          <TableBody>
                                            {collectionTypeArray.map((data, index) => (
                                              <TableRow key={index}>
                                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                  {data.collectionTypeName}
                                                </TableCell>

                                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                  <Grid alignContent={'center'}  >

                                                    <TextField
                                                      error={Boolean(touched.balanceRate && errors.balanceRate)}
                                                      helperText={touched.balanceRate && errors.balanceRate}
                                                      name="balanceRate"
                                                      onBlur={handleBlur}
                                                      alignContent='center'
                                                      onChange={(e) => handleRateChange(e, data.collectionTypeID, "minRate")}
                                                      value={data.minRate}
                                                      type='number'
                                                      variant="outlined"
                                                      size='small'
                                                      disabled={isDisableButton}
                                                    />
                                                  </Grid>
                                                  {(parseInt(isMinEror[index]) === parseInt(index)) ?
                                                    <small style={{ color: 'red', wordWrap: 'break-word' }}>{minErrorMsg[index]}</small> : null
                                                  }
                                                </TableCell>

                                                <TableCell align={'center'} alignContent={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                  <Grid alignContent={'center'}>

                                                    <TextField
                                                      error={Boolean(touched.advanceRate && errors.advanceRate)}
                                                      type='number'
                                                      helperText={touched.advanceRate && errors.advanceRate}
                                                      name="advanceRate"
                                                      onBlur={handleBlur}
                                                      onChange={(e) => handleRateChange(e, data.collectionTypeID, "maxRate")}
                                                      value={data.maxRate}
                                                      variant="outlined"
                                                      size='small'
                                                      disabled={isDisableButton}
                                                    />
                                                  </Grid>
                                                  {(parseInt(isMaxEror[index]) === parseInt(index)) ?
                                                    <small style={{ color: 'red', wordWrap: 'break-word' }}>{maxErrorMsg[index]}</small> : null
                                                  }
                                                </TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </TableContainer>
                                    </Grid>

                                  </Grid>
                                </Paper>
                              </Collapse>
                            </Grid>
                          </Grid>
                          :null
                          }
                          {(collectionTypeArray.length == 0) ? (
                            <Box paddingTop="20px"
                            hidden={!searchStarted}  >
                            {"- No records found. -"}
                          </Box>
                          ) : null
                          }
                                                  
                      </CardContent>

                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          color="primary"
                          disabled={isSubmitting ||isDisableButton|| isDisableSaveButton}
                          type="button"
                          variant="contained"
                          onClick={() => saveCollectionTypeAdvanceRate()}
                        >
                          {"Save"}
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
