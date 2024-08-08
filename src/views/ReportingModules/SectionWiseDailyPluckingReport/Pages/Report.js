import React, { useState, useEffect, Fragment, useRef } from 'react';
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
  InputLabel,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Table
} from '@material-ui/core';
import {
  startOfMonth,
  endOfMonth,
  addMonths,
} from 'date-fns';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from '../../../../utils/newLoader';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import xlsx from 'json-as-xlsx';
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePDF';
import { useAlert } from "react-alert";
import Paper from '@material-ui/core/Paper';
import TablePagination from '@material-ui/core/TablePagination';
import _ from 'lodash';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";


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

const screenCode = 'SECTIONWISEDAILYPLUKINGREPORT';

export default function SectionWiseDailyPluckingReport(props) {
  const [title, setTitle] = useState("Section Wise Daily Plucking Report")
  const classes = useStyles();
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);
  const [groups, setGroups] = useState();
  const [gardens, setGardens] = useState([]);
  const [costCenters, setCostCenters] = useState();
  const [fields, setFields] = useState([]);
  const [routeSummaryData, setRouteSummaryData] = useState([]);
  const [fromDate, handleFromDate] = useState(new Date());
  const [toDate, handleToDate] = useState(new Date());
  const [reportDetails, setReportDetails] = useState({
    groupID: '0',
    gardenID: '0',
    costCenterID: '0',
    fieldID: '0',
    fromDate: new Date().toISOString().substr(0, 10),
    toDate: new Date().toISOString().substr(0, 10),
  })
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });

  const csvHeaders = [
    { label: 'Garden', value: 'factoryName' },
    { label: 'Plucking Date', value: 'cardReadTime' },
    { label: 'Section', value: 'fieldName' },
    { label: 'Area in Hectare', value: 'area' },
    { label: 'Area Covered', value: 'coveredArea' },
    { label: 'Green leaf plucked in Kg', value: 'totalAmount' },
    { label: 'No.of Pluckers', value: 'employeeCount' },
    { label: 'Average / Plucker', value: 'avgPluk' },
    { label: 'Percentage of Leaf Count %', value: 'percentageOfLeaf' }
  ];
  const componentRef = useRef();
  const navigate = useNavigate();
  const alert = useAlert();

  const [selectedSearchValues, setSelectedSearchValues] = useState({
    groupName: '0',
    gardenName: '0',
    costCenterName: '0',
    fieldName: '0',
    froDate: '',
    tDate: '',
  })

  const [totalValues, setTotalValues] = useState({
    totalArea: 0,
    totalCoveredArea: 0,
    totalTotalAmount: 0,
    totalEmployeeCount: 0,
    totalPercentageOfLeaf: 0
  });

  const handleLimitChange = (event) => {
    setLimit(event.target.value);
  };
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };


  useEffect(() => {
    trackPromise(getGroupsForDropdown(), getPermission());
  }, []);

  useEffect(() => {
    trackPromise(getEstateDetailsByGroupID());
  }, [reportDetails.groupID]);

  useEffect(() => {
    trackPromise(getCostCenterDetailsByGardenID())
  }, [reportDetails.gardenID]);

  useEffect(() => {
    trackPromise(getFieldDetailsByDivisionID());
  }, [reportDetails.costCenterID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWSECTIONWISEDAILYPLUKINGREPORT');

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

    setReportDetails({
      ...reportDetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      gardenID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }
  async function getEstateDetailsByGroupID() {
    var response = await services.getEstateDetailsByGroupID(reportDetails.groupID);
    setGardens(response);
  };

  async function getCostCenterDetailsByGardenID() {
    var response = await services.getDivisionDetailsByEstateID(reportDetails.gardenID);
    setCostCenters(response);
  };

  async function getFieldDetailsByDivisionID() {
    var response = await services.getFieldDetailsByDivisionID(reportDetails.costCenterID);
    setFields(response);
  };

  function generateDropDownMenu(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
      }
    }
    return items
  }

  async function GetDetails() {
    let model = {
      gardenID: parseInt(reportDetails.gardenID),
      costCenterID: parseInt(reportDetails.costCenterID),
      fieldID: parseInt(reportDetails.fieldID),
      fromDate: new Date(reportDetails.fromDate).toISOString().split('T')[0],
      toDate: new Date(reportDetails.toDate).toISOString().split('T')[0],

    }
    getSelectedDropdownValuesForReport(model);
    const routeData = await services.GetSectionWiseDailyPluckingReportDetails(model);
    if (routeData.statusCode == "Success" && routeData.data != null) {
      var result = [];
      routeData.data.forEach(x => {
        var duplicateDate = result.find(y => y.fieldID === x.fieldID
          && y.cardReadTime.split('T')[0] === x.cardReadTime.split('T')[0]);

        if (duplicateDate) {
          duplicateDate.fieldID = x.fieldID;
          duplicateDate.factoryName = x.factoryName;
          duplicateDate.cardReadTime = x.cardReadTime;
          duplicateDate.fieldName = x.fieldName;
          duplicateDate.area = x.area;
          duplicateDate.coveredArea = duplicateDate.coveredArea + x.coveredArea;
          duplicateDate.employeeCount = x.employeeCount;
          duplicateDate.totalAmount = x.totalAmount;
        }
        else {
          result.push({
            fieldID: x.fieldID,
            factoryName: x.factoryName,
            cardReadTime: x.cardReadTime,
            fieldName: x.fieldName,
            area: x.area,
            coveredArea: x.coveredArea,
            employeeCount: x.employeeCount,
            totalAmount: x.totalAmount
          });
        }
      });
      const totalTotalAmount = result.reduce((accumulator, current) => accumulator + current.totalAmount, 0)
      result.forEach(x => {
        x.percentageOfLeaf = (x.totalAmount / totalTotalAmount) * 100
      })
      setRouteSummaryData(result);
      calculateTotalQty(result)
      getSelectedDropdownValuesForReport();
    }
    else {
      alert.error("Error");
    }
  }

  function calculateTotalQty(data) {
    const totalArea = data.reduce((accumulator, current) => accumulator + current.area, 0);
    const totalCoveredArea = data.reduce((accumulator, current) => accumulator + current.coveredArea, 0);
    const totalTotalAmount = data.reduce((accumulator, current) => accumulator + current.totalAmount, 0);
    const totalEmployeeCount = data.reduce((accumulator, current) => accumulator + current.employeeCount, 0);
    const totalPercentageOfLeaf = data.reduce((accumulator, current) => accumulator + current.percentageOfLeaf, 0);
    setTotalValues({
      ...totalValues,
      totalArea: totalArea,
      totalCoveredArea: totalCoveredArea,
      totalTotalAmount: totalTotalAmount,
      totalEmployeeCount: totalEmployeeCount,
      totalPercentageOfLeaf: totalPercentageOfLeaf
    })
  };

  async function createFile() {
    var settings = {
      sheetName: 'SectionDailyPluckingReport',
      fileName: 'Section Daily Plucking Report',
      writeOptions: {}
    }
    var cloneData = _.cloneDeep(routeSummaryData)
    cloneData.forEach(x => {
      x.cardReadTime = x.cardReadTime.split('T')[0]
      x.area = parseFloat(x.area).toFixed(2)
      x.coveredArea = parseFloat(x.coveredArea).toFixed(2)
      x.totalAmount = parseFloat(x.totalAmount).toFixed(2)
      x.employeeCount = parseInt(x.employeeCount)
      x.avgPluk = parseFloat(x.totalAmount / x.employeeCount).toFixed(2)
      x.percentageOfLeaf = parseFloat(x.percentageOfLeaf).toFixed(2)
    })

    var vr1 = {
      'factoryName': 'Total',
      'area': parseFloat(totalValues.totalArea).toFixed(2),
      'coveredArea': parseFloat(totalValues.totalCoveredArea).toFixed(2),
      'totalAmount': parseFloat(totalValues.totalTotalAmount).toFixed(2),
      'employeeCount': parseInt(totalValues.totalEmployeeCount),
      'avgPluk': parseFloat(totalValues.totalTotalAmount / totalValues.totalEmployeeCount).toFixed(2),
      'percentageOfLeaf': parseFloat(totalValues.totalPercentageOfLeaf).toFixed(2),
    };

    cloneData.push(vr1, {});

    var vr = {
      'factoryName': 'Legal Entity : ' + selectedSearchValues.groupName,
      'cardReadTime': 'Garden : ' + selectedSearchValues.gardenName,
      'fieldName': selectedSearchValues.costCenterName === undefined ? 'Cost Center : All Cost Centers' : 'Cost Center : ' + selectedSearchValues.costCenterName,
      'area': selectedSearchValues.fieldName === undefined ? 'Section : All Sections' : 'Section : ' + selectedSearchValues.fieldName,
      'coveredArea': 'From : ' + selectedSearchValues.froDate,
      'totalAmount': 'To : ' + selectedSearchValues.tDate
    };

    cloneData.push(vr);

    let dataA = [
      {
        sheet: 'Section Daily Plucking Report',
        columns: csvHeaders,
        content: cloneData
      }
    ]
    xlsx(dataA, settings);
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
    setReportDetails({
      ...reportDetails,
      [e.target.name]: value
    });

    clearTable()
  }

  function getSelectedDropdownValuesForReport() {
    setSelectedSearchValues({
      ...selectedSearchValues,
      groupName: groups[reportDetails.groupID],
      gardenName: gardens[reportDetails.gardenID],
      costCenterName: costCenters[reportDetails.costCenterID],
      fieldName: fields[reportDetails.fieldID],
      froDate: reportDetails.fromDate,
      tDate: reportDetails.toDate,
    })
  }

  function clearTable() {
    setRouteSummaryData([])
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: reportDetails.groupID,
              gardenID: reportDetails.gardenID,
              costCenterID: reportDetails.costCenterID,
              fieldID: reportDetails.fieldID,
              fromDate: reportDetails.fromDate,
              toDate: reportDetails.toDate,
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Legal Entity is required').min("1", 'Legal Entity is required'),
                gardenID: Yup.number().required('Garden is required').min("1", 'Garden is required'),
                costCenterID: Yup.number(),
                fieldID: Yup.number(),
                fromDate: Yup.date().required('From Date is required'),
                toDate: Yup.date().required('To Date is required'),
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
                    <CardHeader
                      title={cardTitle(title)}
                    />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={8}>
                            <InputLabel shrink id="groupID">
                                Business Division  *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="groupID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={reportDetails.groupID}
                              variant="outlined"
                              id="groupID"
                              size='small'

                            >
                              <MenuItem value="0">--Select Business Division--</MenuItem>
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
                              value={reportDetails.gardenID}
                              variant="outlined"
                              id="gardenID"
                              size='small'

                            >
                              <MenuItem value="0">--Select Location--</MenuItem>
                              {generateDropDownMenu(gardens)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={8}>
                            <InputLabel shrink id="costCenterID">
                              Cost Center
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="costCenterID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={reportDetails.costCenterID}
                              variant="outlined"
                              id="costCenterID"
                              size='small'

                            >
                              <MenuItem value="0">--Select Cost Center--</MenuItem>
                              {generateDropDownMenu(costCenters)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={8}>
                            <InputLabel shrink id="fieldID">
                              Section
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="fieldID"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={reportDetails.fieldID}
                              variant="outlined"
                              id="fieldID"
                            >
                              <MenuItem value={'0'} >--Select Section--</MenuItem>
                              {generateDropDownMenu(fields)}
                            </TextField>
                          </Grid>
                          
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="fromDate">From Date *</InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                error={Boolean(touched.fromDate && errors.fromDate)}
                                fullWidth
                                helperText={touched.fromDate && errors.fromDate}
                                variant="inline"
                                format="yyyy/MM/dd"
                                margin="dense"
                                name='fromDate'
                                id='fromDate'
                                size='small'
                                value={fromDate}
                                onChange={(e) => {
                                  handleFromDate(e)
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change fromDate',
                                }}
                                autoOk
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>

                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="todate">To Date *</InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                error={Boolean(touched.todate && errors.todate)}
                                fullWidth
                                helperText={touched.todate && errors.todate}
                                variant="inline"
                                format="yyyy/MM/dd"
                                margin="dense"
                                name='todate'
                                id='todate'
                                size='small'
                                value={toDate}
                                onChange={(e) => {
                                  handleToDate(e)
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change todate',
                                }}
                                minDate={fromDate}
                                autoOk
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>

                          <Grid container justify="flex-end">
                            <Box pr={2}>
                              <Button
                                color="primary"
                                variant="contained"
                                type="submit"
                              >
                                Search
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                        <br />

                        <Box minWidth={1050}>
                          {routeSummaryData.length > 0 ?
                            <TableContainer component={Paper} >
                              <Table aria-label="caption table">
                                <TableHead>
                                  <TableRow>
                                    <TableCell align={'left'} style={{ fontWeight: "bold", border: "1px solid black" }}>Garden</TableCell>
                                    <TableCell align={'left'} style={{ fontWeight: "bold", border: "1px solid black" }}>Plucking Date</TableCell>
                                    <TableCell align={'left'} style={{ fontWeight: "bold", border: "1px solid black" }}>Section</TableCell>
                                    <TableCell align={'right'} style={{ fontWeight: "bold", border: "1px solid black" }}>Area in Hectare</TableCell>
                                    <TableCell align={'right'} style={{ fontWeight: "bold", border: "1px solid black" }}>Area Covered</TableCell>
                                    <TableCell align={'right'} style={{ fontWeight: "bold", border: "1px solid black" }}>Green leaf plucked in Kg</TableCell>
                                    <TableCell align={'right'} style={{ fontWeight: "bold", border: "1px solid black" }}>No.of Pluckers</TableCell>
                                    <TableCell align={'right'} style={{ fontWeight: "bold", border: "1px solid black" }}>Average / Plucker</TableCell>
                                    <TableCell align={'right'} style={{ fontWeight: "bold", border: "1px solid black" }}>Percentage of Leaf Count %</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {routeSummaryData.slice(page * limit, page * limit + limit).map((data, index) => (
                                    <TableRow key={index}>
                                      <TableCell align={'left'} component="th" scope="row" style={{ border: "1px solid black" }}>
                                        {data.factoryName}
                                      </TableCell>
                                      <TableCell align={'left'} component="th" scope="row" style={{ border: "1px solid black" }}>
                                        {data.cardReadTime.split('T')[0]}
                                      </TableCell>
                                      <TableCell align={'left'} component="th" scope="row" style={{ border: "1px solid black" }}>
                                        {data.fieldName}
                                      </TableCell>
                                      <TableCell align={'right'} component="th" scope="row" style={{ border: "1px solid black" }}>
                                        {parseFloat(data.area).toFixed(2)}
                                      </TableCell>
                                      <TableCell align={'right'} component="th" scope="row" style={{ border: "1px solid black" }}>
                                        {parseFloat(data.coveredArea).toFixed(2)}
                                      </TableCell>
                                      <TableCell align={'right'} component="th" scope="row" style={{ border: "1px solid black" }}>
                                        {parseFloat(data.totalAmount).toFixed(2)}
                                      </TableCell>
                                      <TableCell align={'right'} component="th" scope="row" style={{ border: "1px solid black" }}>
                                        {parseInt(data.employeeCount)}
                                      </TableCell>
                                      <TableCell align={'right'} component="th" scope="row" style={{ border: "1px solid black" }}>
                                        {parseFloat(data.totalAmount / data.employeeCount).toFixed(2)}
                                      </TableCell>
                                      <TableCell align={'right'} component="th" scope="row" style={{ border: "1px solid black" }}>
                                        {parseFloat(data.percentageOfLeaf).toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                                <TableRow>
                                  <TableCell align={'center'} style={{ border: "1px solid black" }}><b>Total</b></TableCell>
                                  <TableCell style={{ border: "1px solid black" }}></TableCell>
                                  <TableCell style={{ border: "1px solid black" }} ></TableCell>
                                  <TableCell align={'right'} component="th" scope="row" style={{ border: "1px solid black" }}>
                                    <b> {parseFloat(totalValues.totalArea).toFixed(2)} </b>
                                  </TableCell>
                                  <TableCell align={'right'} component="th" scope="row" style={{ border: "1px solid black" }}>
                                    <b> {parseFloat(totalValues.totalCoveredArea).toFixed(2)} </b>
                                  </TableCell>
                                  <TableCell align={'right'} component="th" scope="row" style={{ border: "1px solid black" }}>
                                    <b> {parseFloat(totalValues.totalTotalAmount).toFixed(2)} </b>
                                  </TableCell>
                                  <TableCell align={'right'} component="th" scope="row" style={{ border: "1px solid black" }}>
                                    <b> {parseInt(totalValues.totalEmployeeCount)} </b>
                                  </TableCell>
                                  <TableCell align={'right'} component="th" scope="row" style={{ border: "1px solid black" }}>
                                    <b> {parseFloat(totalValues.totalTotalAmount / totalValues.totalEmployeeCount).toFixed(2)} </b>
                                  </TableCell>
                                  <TableCell align={'right'} component="th" scope="row" style={{ border: "1px solid black" }}>
                                    <b> {parseFloat(totalValues.totalPercentageOfLeaf).toFixed(2)} </b>
                                  </TableCell>
                                </TableRow>
                              </Table>
                              <TablePagination
                                component="div"
                                count={routeSummaryData.length}
                                onChangePage={handlePageChange}
                                onChangeRowsPerPage={handleLimitChange}
                                page={page}
                                rowsPerPage={limit}
                                rowsPerPageOptions={[5, 10, 25]}
                              />
                            </TableContainer> : null}
                        </Box>
                      </CardContent>
                      {routeSummaryData.length > 0 ?
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
                            documentTitle={"Section Wise Daily Plucking Report"}
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
                          <div hidden={true}>
                            <CreatePDF ref={componentRef} routeSummaryData={routeSummaryData}
                              searchData={selectedSearchValues} totalValues={totalValues} />
                          </div>
                        </Box> : null}

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