import React, { useState, useEffect, useRef, Fragment } from 'react';
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
  TableRow
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import authService from '../../../../utils/permissionAuth';
import { trackPromise } from 'react-promise-tracker';
import { Formik } from 'formik';
import * as Yup from 'yup';
import ReactToPrint from 'react-to-print';
import CreatePDF from './CreatePDF';
import { LoadingComponent } from 'src/utils/newLoader';
import TablePagination from '@material-ui/core/TablePagination';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import Paper from '@material-ui/core/Paper';
import xlsx from 'json-as-xlsx';
import _ from 'lodash';
import tokenService from '../../../../utils/tokenDecoder';
import moment from 'moment';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import { useAlert } from "react-alert";

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  avatar: {
    marginRight: theme.spacing(2)
  },
  grp: {
    marginTop: '1rem'
  },
  colorCancel: {
    backgroundColor: 'red'
  },
  colorRecordAndNew: {
    backgroundColor: '#FFBE00'
  },
  colorRecord: {
    backgroundColor: 'green'
  }
}));

const screenCode = 'DAILYLEAVEBALANCEREPORT';

export default function DailyLeaveBalanceReport(props) {
  const [title, setTitle] = useState('Leave Balance - Daily');
  const classes = useStyles();
  const [groups, setGroups] = useState();
  const [estates, setEstates] = useState([]);
  const [divisions, setDivisions] = useState();
  const [PayPoints, setPayPoints] = useState();
  const [employeeSubCategoryMapping, setEmployeeSubCategoryMapping] = useState();
  const [csvHeaders, SetCsvHeaders] = useState([]);
  const componentRef = useRef();
  const [leavebalanceData, setLeavebalanceData] = useState([]);
  const [page, setPage] = useState(0);
  const navigate = useNavigate();
  const [limit, setLimit] = useState(10);
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };
  const handleLimitChange = event => {
    setLimit(event.target.value);
  };
  const alert = useAlert();
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const januaryFirst = new Date(year, 0, 1);
  januaryFirst.setDate(januaryFirst.getDate() + 1);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const [leaveBalanceList, setleaveBalanceList] = useState({
    groupID: 0,
    estateID: 0,
    divisionID: "0",
    payPointID: '0',
    employeeSubCategoryMappingID: 0,
    regNo: '',
    fromDate: januaryFirst.toISOString().substr(0, 10),
    toDate: currentDate.toISOString().substr(0, 10)
  });
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    groupName: '',
    estateName: '',
    divisionName: '',
    payPointID: '0',
    employeeSubCategoryMappingName: '',
    fromDate: "",
    toDate: ""
  });

  useEffect(() => {
    setLeavebalanceData([]);
  }, [leaveBalanceList]);

  useEffect(() => {
    setleaveBalanceList((prevState) => ({
      ...prevState,
      divisionID: "0"
    }));
  }, [leaveBalanceList.groupID]);

  useEffect(() => {
    setleaveBalanceList((prevState) => ({
      ...prevState,
      divisionID: "0"
    }));
  }, [leaveBalanceList.estateID]);

  useEffect(() => {
    trackPromise(getGroupsForDropdown(), getPermission(), GetAllEmployeeSubCategoryMapping());
  }, []);

  useEffect(() => {
    trackPromise(
      getCostCenterDetailsByEstateID());
  }, [leaveBalanceList.estateID]);

  useEffect(() => {
    trackPromise(getEstateDetailsByGroupID());
  }, [leaveBalanceList.groupID]);

  useEffect(() => {
    trackPromise(getEstateDetailsByGroupID(),
      GetDivisionDetailsByGroupID());
  }, [leaveBalanceList.groupID]);

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function GetDivisionDetailsByGroupID() {
    const result = await services.GetDivisionDetailsByGroupID(leaveBalanceList.groupID);
    setPayPoints(result)
  }

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(
      p => p.permissionCode == 'VIEWDAILYLEAVEBALANCEREPORT'
    );

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(
      p => p.permissionCode == 'GROUPDROPDOWN'
    );
    var isFactoryFilterEnabled = permissions.find(
      p => p.permissionCode == 'FACTORYDROPDOWN'
    );

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
    });
    setleaveBalanceList({
      ...leaveBalanceList,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      estateID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {titleName}
        </Grid>
      </Grid>
    );
  }

  function handleChange(x) {
    const target = x.target;
    const value = target.value;
    setleaveBalanceList({
      ...leaveBalanceList,
      [x.target.name]: value
    });
  }

  function generateDropDownMenu(data) {
    let items = [];
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(
          <MenuItem key={key} value={key}>
            {value}
          </MenuItem>
        );
      }
    }
    return items;
  }

  function handleStartDateChange(value) {
    setleaveBalanceList({
      ...leaveBalanceList,
      fromDate: value

    });
  }

  function handleEndDateChange(value) {
    setleaveBalanceList({
      ...leaveBalanceList,
      toDate: value
    });
  }

  function getSelectedDropdownValuesForReport(searchForm) {
    setSelectedSearchValues({
      ...selectedSearchValues,
      groupName: groups[searchForm.groupID],
      estateName: estates[searchForm.estateID],
      divisionName: divisions[searchForm.divisionID],
      payPointID: PayPoints[searchForm.payPointID],
      employeeSubCategoryMappingName: employeeSubCategoryMapping[searchForm.employeeSubCategoryMappingID],
      fromDate: searchForm.fromDate,
      toDate: searchForm.toDate
    });
  }

  async function createFile() {
    var file = await createDataForExcel(leavebalanceData);
    var settings = {
      sheetName: 'Leave Balance Sum',
      fileName:
        'Leave Balance Report - ' +
        new Date().toISOString().split('T', 1)
    };

    let keys = Object.keys(file[0]);
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem });
    });

    let dataA = [
      {
        sheet: 'Leave Balance Sum',
        columns: tempcsvHeaders,
        content: file
      }
    ];
    xlsx(dataA, settings);
  }

  async function getCostCenterDetailsByEstateID() {
    var response = await services.getDivisionDetailsByEstateID(
      leaveBalanceList.estateID
    );
    const elementCount = response.reduce((count) => count + 1, 0);
    var generated = generateDropDownMenu(response);
    if (elementCount === 1) {
      setleaveBalanceList(prevState => ({
        ...prevState,
        divisionID: generated[0].props.value
      }));
    }
    setDivisions(response);
  }

  async function getEstateDetailsByGroupID() {
    var response = await services.getEstateDetailsByGroupID(
      leaveBalanceList.groupID
    );
    setEstates(response);
  }

  async function GetAllEmployeeSubCategoryMapping() {
    var result = await services.GetAllEmployeeSubCategoryMapping();
    setEmployeeSubCategoryMapping(result)
  }

  function generateDropDownMenu(data) {
    let items = [];
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(
          <MenuItem key={key} value={key}>
            {value}
          </MenuItem>
        );
      }
    }
    return items;
  }

  async function GetDetails() {
    let model = {
      groupID: parseInt(leaveBalanceList.groupID),
      estateID: parseInt(leaveBalanceList.estateID),
      divisionID: parseInt(leaveBalanceList.divisionID),
      payPointID: parseInt(leaveBalanceList.payPointID),
      employeeSubCategoryMappingID: parseInt(leaveBalanceList.employeeSubCategoryMappingID),
      registrationNumber: leaveBalanceList.regNo,
      fromDate: moment(leaveBalanceList.fromDate.toString()).format('YYYY-MM-DD').split('T')[0],
      toDate: moment(leaveBalanceList.toDate.toString()).format('YYYY-MM-DD').split('T')[0],
    };
    const response = await services.GetLeaveDetails(model);
    if (response.statusCode === 'Success' && response.data !== null) {
      setLeavebalanceData(response.data);
      getSelectedDropdownValuesForReport(model);
    } else {
      setLeavebalanceData([]);
      alert.error(response.message);
    }
  }

  const getEntitlement = (details, leaveType) => {
    const leaveData = details.find(detail => detail.shortForm === leaveType);
    return leaveData ? leaveData.allocatedQuntity : 0;
  };

  const getAvailed = (details, leaveType) => {
    const leaveData = details.find(detail => detail.shortForm === leaveType);
    return leaveData ? leaveData.consumedQuntity : 0;
  };

  const getBalance = (details, leaveType) => {
    const leaveData = details.find(detail => detail.shortForm === leaveType);
    return leaveData ? leaveData.remainingQuntity : 0;
  };

  async function createDataForExcel(array) {
    var res = [];
    if (array != null) {
      array.map(x => {
        var vr = {
          'Emp.ID': x.employeeID,
          'Emp.Name': x.firstName,
          'PayPoint': x.payPointName,
          'Leave Type': x.leaveType,
          'Allocated Quantity': x.allocatedQuntity,
          'Consumed Quantity': x.consumedQuntity,
          'Remaining Quantity': x.remainingQuntity
        };
        res.push(vr);
      });
      res.push([]);
      var vr = {
        'Emp.ID': 'Group - ' + selectedSearchValues.groupName,
        'Emp.Name': 'Division - ' + selectedSearchValues.costCenterName,
        'Allocated Quantity': 'Garden - ' + selectedSearchValues.gardenName,
        'Remaining Quantity': 'Employee -' + selectedSearchValues.employeeID
      };
      res.push(vr);
    }
    return res;
  }

  return (
    <Page className={classes.root} title={title}>
      <LoadingComponent />
      <Container maxWidth={false}>
        <Formik
          initialValues={{
            groupID: leaveBalanceList.groupID,
            estateID: leaveBalanceList.estateID,
            divisionID: leaveBalanceList.divisionID,
            payPointID: leaveBalanceList.payPointID,
            employeeSubCategoryMappingID: leaveBalanceList.employeeSubCategoryMappingID,
            regNo: leaveBalanceList.regNo,
            fromDate: leaveBalanceList.fromDate,
            toDate: leaveBalanceList.toDate
          }}
          validationSchema={Yup.object().shape({
            groupID: Yup.number()
              .required('Business Division is required')
              .min('1', 'Business Division is required'),
          })}
          onSubmit={() => trackPromise(GetDetails())}
          enableReinitialize
        >
          {({ errors, handleBlur, handleSubmit, touched }) => (
            <form onSubmit={handleSubmit}>
              <Box mt={0}>
                <Card>
                  <CardHeader title={cardTitle(title)}></CardHeader>
                  <PerfectScrollbar>
                    <Divider />
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="groupID">
                            Business Division *
                          </InputLabel>
                          <TextField
                            select
                            error={Boolean(touched.groupID && errors.groupID)}
                            fullWidth
                            helperText={touched.groupID && errors.groupID}
                            name="groupID"
                            onBlur={handleBlur}
                            onChange={e => handleChange(e)}
                            value={leaveBalanceList.groupID}
                            variant="outlined"
                            id="groupID"
                            size="small"
                          >
                            <MenuItem value="0">
                              --Select Business Division--
                            </MenuItem>
                            {generateDropDownMenu(groups)}
                          </TextField>
                        </Grid>

                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="estateID">
                            Location
                          </InputLabel>
                          <TextField
                            select
                            error={Boolean(touched.estateID && errors.estateID)}
                            fullWidth
                            helperText={touched.estateID && errors.estateID}
                            name="estateID"
                            onBlur={handleBlur}
                            onChange={e => handleChange(e)}
                            value={leaveBalanceList.estateID}
                            variant="outlined"
                            id="estateID"
                            size="small"
                          >
                            <MenuItem value="0">--Select Location--</MenuItem>
                            {generateDropDownMenu(estates)}
                          </TextField>
                        </Grid>

                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="divisionID">
                            Sub Division
                          </InputLabel>
                          <TextField
                            select
                            fullWidth
                            name="divisionID"
                            onBlur={handleBlur}
                            onChange={e => handleChange(e)}
                            value={leaveBalanceList.divisionID}
                            variant="outlined"
                            id="divisionID"
                            size="small"
                          >
                            <MenuItem value="0">
                              --All Sub Divisions--
                            </MenuItem>
                            {generateDropDownMenu(divisions)}
                          </TextField>
                        </Grid>

                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="payPointID">
                            Pay Point
                          </InputLabel>
                          <TextField select
                            error={Boolean(touched.payPointID && errors.payPointID)}
                            fullWidth
                            helperText={touched.payPointID && errors.payPointID}
                            name="payPointID"
                            onBlur={handleBlur}
                            onChange={(e) => handleChange(e)}
                            value={leaveBalanceList.payPointID}
                            variant="outlined"
                            id="payPointID"
                            size='small'
                          >
                            <MenuItem value="0">--Select Pay Point--</MenuItem>
                            {generateDropDownMenu(PayPoints)}
                          </TextField>
                        </Grid>

                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="employeeSubCategoryMappingID">
                            Employee Sub Category
                          </InputLabel>
                          <TextField select fullWidth
                            size='small'
                            onBlur={handleBlur}
                            id="employeeSubCategoryMappingID"
                            name="employeeSubCategoryMappingID"
                            value={leaveBalanceList.employeeSubCategoryMappingID}
                            type="text"
                            variant="outlined"
                            onChange={(e) => handleChange(e)}
                          >
                            <MenuItem value="0">--All Employee Sub Categories--</MenuItem>
                            {generateDropDownMenu(employeeSubCategoryMapping)}
                          </TextField>
                        </Grid>

                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="fromDate">
                            From *
                          </InputLabel>
                          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                              error={Boolean(touched.fromDate && errors.fromDate)}
                              helperText={touched.fromDate && errors.fromDate}
                              autoOk
                              fullWidth
                              variant="inline"
                              format="yyyy/MM/dd"
                              margin="dense"
                              id="fromDate"
                              value={leaveBalanceList.fromDate}
                              onChange={(e) => handleStartDateChange(e)}
                              KeyboardButtonProps={{
                                'aria-label': 'change date',
                              }}
                            />
                          </MuiPickersUtilsProvider>
                        </Grid>

                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="toDate">
                            To *
                          </InputLabel>
                          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                              error={Boolean(touched.toDate && errors.toDate)}
                              helperText={touched.toDate && errors.toDate}
                              autoOk
                              fullWidth
                              variant="inline"
                              format="yyyy/MM/dd"
                              margin="dense"
                              id="toDate"
                              value={leaveBalanceList.toDate}
                              onChange={(e) => handleEndDateChange(e)}
                              KeyboardButtonProps={{
                                'aria-label': 'change date',
                              }}
                            />
                          </MuiPickersUtilsProvider>
                        </Grid>

                        <Grid item md={3} xs={12} >
                          <InputLabel shrink id="regNo">
                            Registration No.
                          </InputLabel>
                          <TextField
                            fullWidth
                            size='small'
                            name="regNo"
                            onChange={(e) => handleChange(e)}
                            value={leaveBalanceList.regNo}
                            variant="outlined"
                            id="regNo"
                          >
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
                      </Box>
                      <br />
                      <Box minWidth={1050}>
                        {leavebalanceData.length > 0 ? (
                          <TableContainer component={Paper}>
                            <Table className={classes.table} aria-label="simple table" size='small'>
                              <TableHead>
                                <TableRow>
                                  <TableCell rowSpan={2} align="left" style={{ fontWeight: 'bold', border: '1px solid black' }}>Emp.ID</TableCell>
                                  <TableCell rowSpan={2} align="left" style={{ fontWeight: 'bold', border: '1px solid black' }}>Emp.Name</TableCell>
                                  <TableCell rowSpan={2} align="left" style={{ fontWeight: 'bold', border: '1px solid black' }}>Pay Point</TableCell>
                                  <TableCell rowSpan={2} align="left" style={{ fontWeight: 'bold', border: '1px solid black' }}>Joining Date</TableCell>
                                  <TableCell colSpan={3} align="center" style={{ fontWeight: 'bold', border: '1px solid black' }}>Annual Leave</TableCell>
                                  <TableCell colSpan={3} align="center" style={{ fontWeight: 'bold', border: '1px solid black' }}>Sick Leave</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell align="right" style={{ fontWeight: 'bold', border: '1px solid black' }}>Entitle</TableCell>
                                  <TableCell align="right" style={{ fontWeight: 'bold', border: '1px solid black' }}>Availed</TableCell>
                                  <TableCell align="right" style={{ fontWeight: 'bold', border: '1px solid black' }}>Balance</TableCell>
                                  <TableCell align="right" style={{ fontWeight: 'bold', border: '1px solid black' }}>Entitle</TableCell>
                                  <TableCell align="right" style={{ fontWeight: 'bold', border: '1px solid black' }}>Availed</TableCell>
                                  <TableCell align="right" style={{ fontWeight: 'bold', border: '1px solid black' }}>Balance</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {leavebalanceData.slice(page * limit, page * limit + limit).map((group, i) => (
                                  <TableRow key={i}>
                                    <TableCell align="left" style={{ border: '1px solid black' }}>{group.employeeID}</TableCell>
                                    <TableCell align="left" style={{ border: '1px solid black' }}>{group.firstName}</TableCell>
                                    <TableCell align="left" style={{ border: '1px solid black' }}>{group.payPointName}</TableCell>
                                    <TableCell align="left" style={{ border: '1px solid black' }}>{group.joiningDate == null ? '-' : moment(group.joiningDate).format('YYYY-MM-DD')}</TableCell>
                                    <TableCell align="right" style={{ border: '1px solid black' }}>{getEntitlement(group.details, 'AL')}</TableCell>
                                    <TableCell align="right" style={{ border: '1px solid black' }}>{getAvailed(group.details, 'AL')}</TableCell>
                                    <TableCell align="right" style={{ border: '1px solid black' }}>{getBalance(group.details, 'AL')}</TableCell>
                                    <TableCell align="right" style={{ border: '1px solid black' }}>{getEntitlement(group.details, 'SL')}</TableCell>
                                    <TableCell align="right" style={{ border: '1px solid black' }}>{getAvailed(group.details, 'SL')}</TableCell>
                                    <TableCell align="right" style={{ border: '1px solid black' }}>{getBalance(group.details, 'SL')}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                            <TablePagination
                              component="div"
                              count={leavebalanceData.length}
                              onChangePage={handlePageChange}
                              onChangerowsPerPage={handleLimitChange}
                              page={page}
                              rowsPerPage={limit}
                              rowsPerPageOptions={[5, 10, 25]}
                            />
                          </TableContainer>
                        ) : null}
                      </Box>
                    </CardContent>
                    {leavebalanceData.length > 0 ? (
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <ReactToPrint
                          documentTitle={'Leave Balance'}
                          trigger={() => (
                            <Button
                              color="primary"
                              id="btnCancel"
                              variant="contained"
                              style={{ marginRight: '1rem' }}
                              className={classes.colorCancel}
                            >
                              PDF
                            </Button>
                          )}
                          content={() => componentRef.current}
                        />
                        <div hidden={true}>
                          <CreatePDF
                            ref={componentRef}
                            searchData={selectedSearchValues}
                            leavebalanceData={leavebalanceData}
                            getEntitlement={getEntitlement}
                            getAvailed={getAvailed}
                            getBalance={getBalance}
                          />
                        </div>
                      </Box>
                    ) : null}
                  </PerfectScrollbar>
                </Card>
              </Box>
            </form>
          )}
        </Formik>
      </Container>
    </Page>
  );
}
