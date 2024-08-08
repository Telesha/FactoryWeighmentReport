import React, { useState, Fragment, useRef } from 'react';
import {
  Box,
  Card,
  Grid,
  CardHeader,
  makeStyles,
  CardContent,
  InputLabel,
  TextField,
  MenuItem,
  Button,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@material-ui/core';
import { LoadingComponent } from 'src/utils/newLoader';
import Page from 'src/components/Page';
import { Container } from '@material-ui/core';
import { Formik, validateYupSchema } from 'formik';
import PerfectScrollbar from 'react-perfect-scrollbar';
import * as Yup from "yup";
import DateFnsUtils from '@date-io/date-fns';
import { DatePicker, MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import { useEffect } from 'react';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../../utils/permissionAuth';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import tokenService from '../../../../utils/tokenDecoder';
import { useAlert } from 'react-alert';
import xlsx from 'json-as-xlsx';
import CreatePDF from './CreatePDF';
import ReactToPrint from "react-to-print";

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
  colorCancel: {
    backgroundColor: "red",
  },
  colorRecordAndNew: {
    backgroundColor: "#FFBE00"
  },
  colorRecord: {
    backgroundColor: "green",
  }
}));

const screenCode = "GREEENLEAFSUPPLIERDETAILSREPORT";

export default function GreenLeafSupplierDetailsReport(props) {

  const classes = useStyles();
  const [title, setTitle] = useState("Green Leaf Supplier Details");
  const [groupList, setGroupList] = useState([])
  const [operationEntityList, setOperationEntityList] = useState([])
  const [collectionPointList, setCollectionPointList] = useState([])
  const [leafTypeList, setLeafTypeList] = useState([])
  const [supplierReportData, setSupplierReportData] = useState([])
  const [csvHeaders, SetCsvHeaders] = useState([])
  const navigate = useNavigate();
  const alert = useAlert();
  const componentRef = useRef();

  const [permissionList, setPermissionList] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    groupName: "0",
    factoryName: "0",
    startDate: '',
    endDate: ''
  });
  const [approveList, setApproveList] = useState({
    groupID: '0',
    factoryID: '0',
    collectionPointID: '0',
    year: new Date().toISOString().split('-')[0],
    ProductID: '1',
    collectionTypeID: '0',
  })

  useEffect(() => {
    getPermissions();
    trackPromise(
      getGroupsForDropdown()
    );
  }, []);

  useEffect(() => {
    trackPromise(
      getOperationEntityForDropDown()
    );
  }, [approveList.groupID]);

  useEffect(() => {
    trackPromise(
      getLeafTypeForDropDown(),
      getCollectionPointForDropDown()
    );
    setApproveList({
      ...approveList,
      collectionPointID: 0,
      collectionTypeID: 0
    })
  }, [approveList.factoryID]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWGREEENLEAFSUPPLIERDETAILSREPORT');

    if (isAuthorized === undefined) {
      navigate('/404');
    }

    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

    setPermissionList({
      isGroupFilterEnabled: isGroupFilterEnabled != undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled != undefined
    })

    setApproveList({
      ...approveList,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groupList = await services.getAllGroupsForDropDown();
    setGroupList(groupList);
  }

  async function getOperationEntityForDropDown() {
    const operationEntityList = await services.getOperationEntityForDropDown(approveList.groupID);
    setOperationEntityList(operationEntityList)
  }

  async function getCollectionPointForDropDown() {
    const collectionPointList = await services.getCollectionPointForDropDown(approveList.factoryID);
    setCollectionPointList(collectionPointList);
  }

  async function getLeafTypeForDropDown() {
    const leafTypeList = await services.getLeafTypeForDropDown(approveList.factoryID);
    setLeafTypeList(leafTypeList);
  }

  async function GetDetails() {
    let groupID = parseInt(approveList.groupID);
    let factoryID = parseInt(approveList.factoryID);
    let year = parseInt(approveList.year);
    let collectionTypeID = parseInt(approveList.collectionTypeID);
    let collectionPointID = parseInt(approveList.collectionPointID);

    const supplierReport = await services.getSupplierReportDetails(groupID, factoryID, year, collectionTypeID, collectionPointID);
    if (supplierReport.statusCode == 'Success' && supplierReport.data.length > 0) {
      setSupplierReportData(supplierReport.data);
      getSelectedDropdownValuesForReport(groupID, factoryID);
    }
    else {
      setSupplierReportData([]);
      alert.error("No record to display");
    }
  }

  function getSelectedDropdownValuesForReport(groupID, factoryID) {
    setSelectedSearchValues({
      ...selectedSearchValues,
      factoryName: operationEntityList[factoryID],
      groupName: groupList[groupID]
    })
  }

  function generateDropDownMenu(data) {
    let items = [];
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
      }
    }
    return items;
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

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setApproveList({
      ...approveList,
      [e.target.name]: value
    });
    setSupplierReportData([]);
  }

  function handleDateChange(date) {
    var year = date.getUTCFullYear();
    setApproveList({
      ...approveList,
      year: year.toString()
    })
    setSupplierReportData([]);
  }

  function calclateTotalWeight(data) {
    let totalWeight = (data.january + data.february + data.march + data.april + data.may + data.june + data.july +
      data.august + data.september + data.october + data.november + data.december);

    return totalWeight;
  }

  function clearData() {
    setApproveList({
      ...approveList,
      groupID: '0',
      factoryID: '0',
      collectionPointID: '0',
      year: Date(),
      ProductID: '0',
      collectionTypeID: '0',
    })
    setSupplierReportData([]);
  }

  async function createFile() {

    var file = await createDataForExcel(supplierReportData);
    var settings = {
      sheetName: 'Green Leaf Supplier Details Report',
      fileName: 'Green Leaf Supplier Details Report  ' + selectedSearchValues.factoryName + '  ' + selectedSearchValues.endDate + ' - ' + selectedSearchValues.endDate,
      writeOptions: {}
    }

    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let dataA = [
      {
        sheet: 'Route Summary Report',
        columns: tempcsvHeaders,
        content: file
      }
    ]

    xlsx(dataA, settings);
  }

  async function createDataForExcel(array) {
    var res = [];
    if (array != null) {
      array.map(x => {
        var vr = {
          RegistrationNumber: x.registrationNumber,
          SupplierName: x.supplierName,
          January: x.january,
          February: x.february,
          March: x.march,
          April: x.april,
          May: x.may,
          June: x.june,
          July: x.july,
          August: x.august,
          September: x.september,
          October: x.october,
          November: x.november,
          December: x.december
        }
        res.push(vr);
      });
    }
    return res;
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: approveList.groupID,
              factoryID: approveList.factoryID,
              year: approveList.year,
            }}
            validateSchema={
              Yup.object().shape({
                groupId: Yup.number().required('Group required').min('1', 'Group Required'),
                factoryID: Yup.number().required('Factory required').min('1', 'Factory Required')
              })
            }
            onSubmit={() => trackPromise(GetDetails())}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              touched
            }) => (
              <form onSubmit={handleSubmit}>
                <Box mt={0}>
                  <Card>
                    <CardHeader title={cardTitle(title)} />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={8}>
                            <InputLabel shrink id='groupID'>
                              Group *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="groupID"
                              onBlur={handleBlur}
                              onChange={(e) => (handleChange(e))}
                              value={approveList.groupID}
                              size="small"
                              variant="outlined"
                              id="groupID"
                              disabled={!permissionList.isGroupFilterEnabled}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(groupList)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={8}>
                            <InputLabel shrink id='factoryID'>
                              Factory *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.factoryID && errors.factoryID)}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              name="factoryID"
                              onBlur={handleBlur}
                              value={approveList.factoryID}
                              onChange={(e) => handleChange(e)}
                              variant="outlined"
                              id="factoryID"
                              size="small"
                              disabled={!permissionList.isFactoryFilterEnabled}
                            >
                              <MenuItem value="0">--Select Operation Entity--</MenuItem>
                              {generateDropDownMenu(operationEntityList)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={8}>
                            <InputLabel shrink id='collectionPointID'>
                              Route
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="collectionPointID"
                              onBlur={handleBlur}
                              value={approveList.collectionPointID}
                              onChange={(e) => (handleChange(e))}
                              variant="outlined"
                              id="collectionPointID"
                              size="small"
                            >
                              <MenuItem value="0">--Select Route--</MenuItem>
                              {generateDropDownMenu(collectionPointList)}
                            </TextField>
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={8}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <DatePicker
                                autoOk
                                variant="inline"
                                fullWidth
                                openTo="year"
                                views={["year"]}
                                label="Year"
                                helperText="Select applicable year"
                                value={approveList.year}
                                disableFuture={true}
                                size="small"
                                onChange={(date) => handleDateChange(date)}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                          <Grid item md={4} xs={8}>
                            <InputLabel shrink id='collectionTypeID'>
                              Leaf Type
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="collectionTypeID"
                              onBlur={handleBlur}
                              value={approveList.collectionTypeID}
                              onChange={(e) => (handleChange(e))}
                              variant="outlined"
                              id="collectionTypeID"
                              size="small"
                            >
                              <MenuItem value="0">--Select Leaf Type--</MenuItem>
                              {generateDropDownMenu(leafTypeList)}
                            </TextField>
                          </Grid>
                        </Grid>
                        <Box display="flex" flexDirection="row-reverse" p={2}>
                          <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                          >
                            Search
                          </Button>
                          <div>&nbsp;</div>
                          <Button
                            color="primary"
                            type="reset"
                            variant="outlined"
                            onClick={() => clearData()}
                          >
                            Clear
                          </Button>
                        </Box>
                        <Box minWidth={1050}>
                          {supplierReportData.length > 0 ?
                            <TableContainer >
                              <Table aria-label="caption table">
                                <TableHead>
                                  <TableRow>
                                    <TableCell align={'center'}>Registration Number</TableCell>
                                    <TableCell align={'center'}>Supplier Name</TableCell>
                                    <TableCell align={'center'}>January</TableCell>
                                    <TableCell align={'center'}>February</TableCell>
                                    <TableCell align={'center'}>March</TableCell>
                                    <TableCell align={'center'}>April</TableCell>
                                    <TableCell align={'center'}>May</TableCell>
                                    <TableCell align={'center'}>June</TableCell>
                                    <TableCell align={'center'}>July</TableCell>
                                    <TableCell align={'center'}>August</TableCell>
                                    <TableCell align={'center'}>September</TableCell>
                                    <TableCell align={'center'}>October</TableCell>
                                    <TableCell align={'center'}>November</TableCell>
                                    <TableCell align={'center'}>December</TableCell>
                                    <TableCell align={'center'}>Total</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {supplierReportData.map((data, index) => (
                                    <TableRow key={index}>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {data.registrationNumber}
                                      </TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {data.supplierName}
                                      </TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {data.january}
                                      </TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {data.february}
                                      </TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {data.march}
                                      </TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {data.april}
                                      </TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {data.may}
                                      </TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {data.june}
                                      </TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {data.july}
                                      </TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {data.august}
                                      </TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {data.september}
                                      </TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {data.october}
                                      </TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {data.november}
                                      </TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {data.december}
                                      </TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", fontWeight: 'bold' }}>
                                        {calclateTotalWeight(data)}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer> : null}
                        </Box>
                        {supplierReportData.length > 0 ?
                          <Box display="flex" justifyContent="flex-end" p={2}>
                            <Button
                              color="primary"
                              id="btnRecord"
                              type="submit"
                              variant="contained"
                              style={{ marginRight: '1rem' }}
                              className={classes.colorRecord}
                              onClick={createFile}
                            >
                              EXCEL
                            </Button>
                            <div>&nbsp;</div>
                            <ReactToPrint
                              documentTitle={"Green Leaf Supplier Details Summary"}
                              trigger={() => <Button
                                color="primary"
                                id="btnCancel"
                                variant="contained"
                                style={{ marginRight: '1rem' }}
                                className={classes.colorCancel}
                              >
                                PDF
                              </Button>}
                              content={() => componentRef.current}
                            />
                            {<div hidden={true}>
                              <CreatePDF ref={componentRef} supplierReportData={supplierReportData} searchData={selectedSearchValues}
                              />
                            </div>}
                          </Box> : null}
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
  )
}