import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader, MenuItem,
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

const screenCode = 'VALUATION';

export default function ValuationAddEdit(props) {
  const [title, setTitle] = useState("Add Valuation");
  const classes = useStyles();
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [brokers, setBrokers] = useState([]);
  const [grades, setGrades] = useState();
  const [invoiceNumbers, setInvoiceNumbers] = useState([]);
  const [sellingMarks, setSellingMarks] = useState([]);
  const [valuation, setValuation] = useState({
    groupID: 0,
    factoryID: 0,
    invoiceNo: 0,
    invNo: '',
    brokerID: 0,
    sellingMarkID: 0,
    sellingDate: '',
    teaGradeID: 0,
    valuePerKg: '',
    valuePerLot: '',
    lotNumber: '',
    typeOfPack: 0,
    noOfPackages: '',
    unitAmount: '',
    sampleAmount: '',
    netAmount: '',
    mValue: '',
    mValueAmount: '',
    value: '',
    valueAmount: '',

  });
  const [isUpdate, setIsUpdate] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const { valuationID } = useParams();
  let decrypted = 0;
  const navigate = useNavigate();
  const alert = useAlert();
  const handleClick = () => {
    navigate('/app/valuation/listing');
  }

  useEffect(() => {
    trackPromise(
      getPermission());
    trackPromise(
      getGroupsForDropdown());
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoriesForDropdown());
  }, [valuation.groupID]);

  useEffect(() => {
    trackPromise(
      getBrokersForDropdown());
    trackPromise(
      getSellingMarksForDropdown());
    trackPromise(
      getGradesForDropdown());
    trackPromise(
      getInvoiceNumbersForDropdown());
  }, [valuation.factoryID]);

  useEffect(() => {
    decrypted = atob(valuationID);
    if (decrypted != 0) {
      trackPromise(
        getValuationDetailsByID(decrypted),
      )
    }

  }, []);


  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITVALUATION');
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

    setValuation({
      ...valuation,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(valuation.groupID);
    setFactories(factories);
  }

  async function getBrokersForDropdown() {
    const brokers = await services.getBrokerList(valuation.groupID, valuation.factoryID);
    setBrokers(brokers);
  }

  async function getSellingMarksForDropdown() {
    const sellingMarks = await services.getSellingMarkList(valuation.groupID, valuation.factoryID);
    setSellingMarks(sellingMarks);
  }

  async function getGradesForDropdown() {
    const grades = await services.getGradeDetails(valuation.groupID, valuation.factoryID);
    setGrades(grades);
  }

  async function getInvoiceNumbersForDropdown() {
    const invoiceNumbers = await services.getAllInvoiceNumbers(valuation.groupID, valuation.factoryID);
    setInvoiceNumbers(invoiceNumbers);
  }

  async function getValuationDetailsByInvoiceNo(teaProductDispatchID) {
    let response = await services.getValuationDetailsByInvoiceNo(teaProductDispatchID);

    let data = {
      groupID: response.groupID,
      factoryID: response.factoryID,
      sellingDate: response.sellingDate.split('T')[0],
      sellingMarkID: response.sellingMarkID,
      brokerID: response.brokerID,
      teaGradeID: response.teaGradeID,
      typeOfPack: response.typeOfPack,
      lotNumber: response.lotNumber,
      sampleAmount: response.sampleQuantity,
      netAmount: response.netQuantity,
      noOfPackages: response.noOfPackages,
      invoiceNo: teaProductDispatchID.toString(),
    };

    setValuation(data);


  }

  async function getValuationDetailsByID(valuationID) {
    let response = await services.getValuationDetailsByID(valuationID);

    let data = {
      valuationID: response.valuationID,
      invoiceNo: response.teaProductDispatchID.toString(),
      groupID: response.groupID,
      factoryID: response.factoryID,
      sellingDate: response.sellingDate.split('T')[0],
      sellingMarkID: response.sellingMarkID,
      brokerID: response.brokerID,
      teaGradeID: response.teaGradeID,
      valuePerKg: response.valuePerKg,
      valuePerLot: response.valuePerLot,
      typeOfPack: response.typeOfPack,
      unitAmount: response.unitAmount,
      lotNumber: response.lotNumber,
      sampleAmount: response.sampleAmount,
      netAmount: response.netAmount,
      mValue: response.mValue,
      mValueAmount: response.mValueAmount,
      value: response.value,
      valueAmount: response.valueAmount,
      noOfPackages: response.noOfPackages,
      invNo: response.invoiceNo
    };

    setTitle("Edit Valuation");
    setValuation(data);
    setIsUpdate(true)
  }

  async function saveValuation() {
    let model = {
      valuationID: atob(valuationID),
      groupID: parseInt(valuation.groupID),
      factoryID: parseInt(valuation.factoryID),
      teaGradeID: parseInt(valuation.teaGradeID),
      invoiceNo: valuation.invoiceNo,
      brokerID: parseInt(valuation.brokerID),
      sellingMarkID: parseInt(valuation.sellingMarkID),
      sellingDate: valuation.sellingDate,
      valuePerKg: parseFloat(valuation.valuePerKg),
      valuePerLot: parseFloat(valuation.valuePerLot),
      lotNumber: valuation.lotNumber,
      typeOfPack: valuation.typeOfPack,
      noOfPackages: parseFloat(valuation.noOfPackages),
      unitAmount: parseFloat(valuation.unitAmount),
      sampleAmount: parseFloat(valuation.sampleAmount),
      netAmount: parseFloat(valuation.netAmount),
      mValue: parseFloat(valuation.mValue),
      mValueAmount: parseFloat(valuation.mValueAmount),
      value: parseFloat(valuation.value),
      valueAmount: parseFloat(valuation.valueAmount),
      isActive: true
    }

    if (isUpdate == true) {

      let response = await services.updateValuation(model);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        navigate('/app/valuation/listing');
      }
      else {
        alert.error(response.message);
      }
    } else {
      let response = await services.saveValuation(model);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        navigate('/app/valuation/listing');
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
    return items;
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setValuation({
      ...valuation,
      [e.target.name]: value
    });
  }

  function handleSearchDropdownChange(data, e) {
    if (data === undefined || data === null) {
      setValuation({
        ...valuation,
        invoiceNo: 0
      });
      return;
    } else {
      var valueV = data["teaProductDispatchID"];
      setValuation({
        ...valuation,
        invoiceNo: valueV.toString()
      });
      getValuationDetailsByInvoiceNo(valueV)
    }

  }

  function clearFormFields() {
    setValuation({
      ...valuation,
      invoiceNo: 0,
      brokerID: 0,
      sellingMarkID: 0,
      sellingDate: '',
      teaGradeID: 0,
      valuePerKg: '',
      valuePerLot: '',
      lotNumber: '',
      typeOfPack: 0,
      noOfPackages: '',
      unitAmount: '',
      sampleAmount: '',
      netAmount: '',
      mValue: '',
      mValueAmount: '',
      value: '',
      valueAmount: ''
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
              groupID: valuation.groupID,
              factoryID: valuation.factoryID,
              invoiceNo: valuation.invoiceNo,
              brokerID: valuation.brokerID,
              sellingMarkID: valuation.sellingMarkID,
              sellingDate: valuation.sellingDate,
              teaGradeID: valuation.teaGradeID,
              valuePerKg: valuation.valuePerKg,
              valuePerLot: valuation.valuePerLot,
              lotNumber: valuation.lotNumber,
              typeOfPack: valuation.typeOfPack,
              noOfPackages: valuation.noOfPackages,
              unitAmount: valuation.unitAmount,
              sampleAmount: valuation.sampleAmount,
              netAmount: valuation.netAmount,
              mValue: valuation.mValue,
              mValueAmt: valuation.mValueAmt,
              value: valuation.value,
              valueAmt: valuation.valueAmt,
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                invoiceNo: Yup.number().required('Invoice No is required').min("1", 'Invoice No is required'),
              })
            }
            enableReinitialize
            onSubmit={() => trackPromise(saveValuation())}
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
                      <CardContent style={{ marginBottom: "1rem" }}>
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
                              onChange={(e) => handleChange(e)}
                              value={valuation.groupID}
                              variant="outlined"
                              id="groupID"
                              size='small'
                              InputProps={{
                                readOnly: isUpdate || !permissionList.isGroupFilterEnabled ? true : false
                              }}
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
                              onChange={(e) => handleChange(e)}
                              value={valuation.factoryID}
                              variant="outlined"
                              size='small'
                              id="factoryID"
                              InputProps={{
                                readOnly: isUpdate || !permissionList.isFactoryFilterEnabled ? true : false
                              }}
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={12} hidden={isUpdate}>
                            <InputLabel shrink id="invoiceNo">
                              Invoice No *
                            </InputLabel>
                            <Autocomplete

                              id="invoiceNo"
                              options={invoiceNumbers}
                              getOptionLabel={(option) => option.invoiceNo.toString()}
                              onChange={(e, value) => handleSearchDropdownChange(value, e)}
                              defaultValue={null}
                              renderInput={(params) =>
                                <TextField {...params} placeholder="--Select Invoice No--"
                                  error={Boolean(touched.invoiceNo && errors.invoiceNo)}
                                  helperText={touched.invoiceNo && errors.invoiceNo}
                                  variant="outlined"
                                  name="invoiceNo"
                                  fullWidth
                                  size='small'
                                  value={valuation.invoiceNo}
                                  getOptionDisabled={true}
                                />
                              }
                            />
                          </Grid>
                          <Grid item md={4} xs={12} hidden={!isUpdate}>
                            <InputLabel shrink id="invNo">
                            Invoice No *
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="invNo"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={valuation.invNo}
                              size='small'
                              InputProps={{
                                readOnly: true
                            }}
                              variant="outlined"
                            />
                          </Grid>

                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="brokerID">
                              Broker
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="brokerID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              disabled={true}
                              size='small'
                              value={valuation.brokerID}
                              variant="outlined"
                              id="brokerID"
                            >
                              <MenuItem value={'0'}>--Select Broker--</MenuItem>
                              {generateDropDownMenu(brokers)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="sellingMarkID">
                              Selling Mark
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="sellingMarkID"
                              onBlur={handleBlur}
                              disabled={true}
                              onChange={(e) => handleChange(e)}
                              value={valuation.sellingMarkID}
                              size='small'
                              variant="outlined"
                            >
                              <MenuItem value={'0'}>--Select Selling Mark--</MenuItem>
                              {generateDropDownMenu(sellingMarks)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="sellingDate">
                              Selling Date
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="sellingDate"
                              type="date"
                              onChange={(e) => handleChange(e)}
                              disabled={true}
                              value={valuation.sellingDate}
                              variant="outlined"
                              size='small'
                              id="sellingDate"
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                      <CardContent style={{ marginBottom: "1rem" }}>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="teaGradeID">
                              Grade
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="teaGradeID"
                              onBlur={handleBlur}
                              disabled={true}
                              onChange={(e) => handleChange(e)}
                              value={valuation.teaGradeID}
                              size='small'
                              variant="outlined"
                            >
                              <MenuItem value="0">--Select Grade--</MenuItem>
                              {generateDropDownMenu(grades)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="valuePerKg">
                              Value per Kg in Rs
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="valuePerKg"
                              type='number'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={valuation.valuePerKg}
                              variant="outlined"
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="valuePerLot">
                              Value per Lot in Rs
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="valuePerLot"
                              type='number'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={valuation.valuePerLot}
                              variant="outlined"
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="lotNumber">
                              Lot Number
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="lotNumber"
                              onBlur={handleBlur}
                              disabled={true}
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={valuation.lotNumber}
                              variant="outlined" >
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="typeOfPack">
                              Type Of Pack
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="typeOfPack"
                              onBlur={handleBlur}
                              disabled={true}
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={valuation.typeOfPack}
                              variant="outlined"
                            >
                              <MenuItem value="0">--Select Type Of Pack--</MenuItem>
                              <MenuItem value="1">CHEST</MenuItem>
                              <MenuItem value="2">DJ_MWPS</MenuItem>
                              <MenuItem value="3">MWPS</MenuItem>
                              <MenuItem value="4">PS</MenuItem>
                              <MenuItem value="5">SPBS</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="noOfPackages">
                              No of Packages
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="noOfPackages"
                              onBlur={handleBlur}
                              disabled={true}
                              onChange={(e) => handleChange(e)}
                              value={valuation.noOfPackages}
                              variant="outlined"
                              size='small'
                              multiline={true}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="unitAmount">
                              Unit Amount
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="unitAmount"
                              type='number'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={valuation.unitAmount}
                              size='small'
                              variant="outlined" >
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="sampleAmount">
                              Sample Amount (Kg)
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="sampleAmount"
                              onBlur={handleBlur}
                              disabled={true}
                              onChange={(e) => handleChange(e)}
                              value={valuation.sampleAmount}
                              size='small'
                              variant="outlined" >
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="netAmount">
                              Net Amount (Kg)
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="netAmount"
                              onBlur={handleBlur}
                              disabled={true}
                              onChange={(e) => handleChange(e)}
                              value={valuation.netAmount}
                              size='small'
                              variant="outlined" >
                            </TextField>
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="mValue">
                              M: Value (Rs/Kg)
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="mValue"
                              type='number'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={valuation.mValue}
                              size='small'
                              variant="outlined" >
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="mValueAmount">
                              M: Value Amount (Rs)
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="mValueAmount"
                              type='number'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={valuation.mValueAmount}
                              size='small'
                              variant="outlined" >
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="value">
                              Value (Rs/Kg)
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="value"
                              type='number'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={valuation.value}
                              variant="outlined" >
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="valueAmount">
                              Value Amount (Rs)
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="valueAmount"
                              type='number'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={valuation.valueAmount}
                              variant="outlined" >
                            </TextField>
                          </Grid>
                        </Grid>
                      </CardContent>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                      <Button
                          color="primary"
                          type="reset"
                          variant="outlined"
                          onClick={() => clearFormFields()}
                          size='small'
                        >
                          Cancel
                        </Button>
                        <div>&nbsp;</div>
                        <Button
                          color="primary"
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

