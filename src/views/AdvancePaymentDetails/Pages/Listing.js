import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader, MenuItem,
  Table
} from '@material-ui/core';
import {
  startOfMonth,
  endOfMonth,
  addMonths
} from 'date-fns';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
import MaterialTable from "material-table";
import { DatePicker, MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import { useAlert } from "react-alert";
import DateFnsUtils from '@date-io/date-fns';
import CreatePDF from './CreatePDF';
import ReactToPrint from "react-to-print";
import xlsx from 'json-as-xlsx';
import VisibilityIcon from '@material-ui/icons/Visibility';

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
  colorRecord: {
    backgroundColor: "green",
  },

}));

const screenCode = 'ADVANCEDPAYMENTDETAILS';

export default function AdvancePaymentDetails(props) {
  const [title, setTitle] = useState("Advance Payment Details");
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [advancedPaymentList, setAdvancedPaymentList] = useState({
    groupID: 0,
    factoryID: 0,
    routeID: 0,
    statusID: 0,
    advanceRequestType: 0,
  });

  const [FactoryList, setFactoryList] = useState([]);
  const [GroupList, setGroupList] = useState([]);
  const [routes, setRoutes] = useState();
  const [advancePaymentData, setAdvancePaymentData] = useState([]);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  const id = open ? 'simple-popover' : undefined;
  const componentRef = useRef();
  const [fromDate, handleFromDate] = useState(new Date());
  const [toDate, handleToDate] = useState(new Date());
  const alert = useAlert();
  const [csvHeaders, SetCsvHeaders] = useState([]);
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    groupName: "0",
    factoryName: "0",
    startDate: '',
    endDate: '',
    routeName: ''
  });
  let encrypted = "";
  const handleClickView = (advancePaymentRequestID) => {
    encrypted = btoa(advancePaymentRequestID.toString());
    navigate('/app/advancePaymentDetails/ViewStatusHistory/' + encrypted);
  }

  useEffect(() => {
    trackPromise(
      getPermission()
    );
    trackPromise(
      getGroupsForDropdown()
    );
  }, []);

  useEffect(() => {
    getFactoriesForDropdown();
  }, [advancedPaymentList.groupID]);

  useEffect(() => {
    trackPromise(
      getRoutesByFactoryID()
    )
  }, [advancedPaymentList.factoryID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWADVANCEPAYMENTDETAILS');

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

    setAdvancedPaymentList({
      ...advancedPaymentList,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroupList(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(advancedPaymentList.groupID);
    setFactoryList(factories);
  }

  async function getRoutesByFactoryID() {
    const routeList = await services.getRoutesForDropDown(advancedPaymentList.factoryID);
    setRoutes(routeList);
  }

  async function GetDetails() {
    let model = {
      groupID: parseInt(advancedPaymentList.groupID),
      factoryID: parseInt(advancedPaymentList.factoryID),
      startDate: fromDate.toLocaleDateString(),
      endDate: toDate.toLocaleDateString(),
      routeID: parseInt(advancedPaymentList.routeID),
      advanceRequestType: parseInt(advancedPaymentList.advanceRequestType),
      statusID: parseInt(advancedPaymentList.statusID),

    }
    getSelectedDropdownValuesForReport(model);

    if (model.startDate <= model.endDate) {
      const response = await services.GetAdvancePaymentDetailsForView(model);
      if (response.statusCode == "Success" && response.data != null) {
        if (response.data.length == 0) {
          alert.error("No records to display");
        }
      }
      setAdvancePaymentData(response.data);
      createDataForExcel(response.data);
    }
    else if (model.startDate <= model.endDate) {
      const response = await services.GetAdvancePaymentDetailsForView(model);
      if (response.statusCode == "Success" && response.data != null) {
        setAdvancePaymentData(response.data);
        createDataForExcel(response.data);
        if (response.data.length == 0) {
          alert.error("No records to display");
        }
      }
      else {
        alert.error("No records to display");
      }
    }
    else {
      alert.error("Selected Months Are Incorrect");
    }
  }

  function getSelectedDropdownValuesForReport(searchForm) {
    setSelectedSearchValues({
      ...selectedSearchValues,
      groupName: GroupList[searchForm.groupID],
      factoryName: FactoryList[searchForm.factoryID],
      startDate: searchForm.startDate,
      endDate: searchForm.endDate,
      routeName: searchForm.routeName
    });
  }

  async function createDataForExcel(array) {
    var res = [];
    if (array != null) {
      array.map(x => {
        var vr = {
          'Date': x.effectiveDate,
          'Route Name': x.routeName,
          'Register Number': x.registrationNumber,
          'Requested Amount(Rs)': x.amount,
          'Approved Amount(Rs)': x.approvedAmount,
          'Source': x.advanceRequestType,
          'Status': x.statusID
        }
        res.push(vr);
      });
    }

    return res;
  }

  async function createFile() {
    var file = await createDataForExcel(advancePaymentData);
    var settings = {
      sheetName: 'Advanced Payment Details',
      fileName: 'Advanced Payment Details' + ' ' + selectedSearchValues.groupName + ' ' + selectedSearchValues.factoryName,
      writeOptions: {}
    }
    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })
    let dataA = [
      {
        sheet: 'Advanced Payment Details',
        columns: tempcsvHeaders,
        content: file
      }
    ]
    xlsx(dataA, settings);
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
    setAdvancedPaymentList({
      ...advancedPaymentList,
      [e.target.name]: value
    });
    setAdvancePaymentData([]);
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
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: advancedPaymentList.groupID,
              factoryID: advancedPaymentList.factoryID
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
              })
            }
            onSubmit={() => GetDetails()}
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
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="groupID">
                              Group *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="groupID"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={advancedPaymentList.groupID}
                              variant="outlined"
                              id="groupID"
                              disabled={!permissionList.isGroupFilterEnabled}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(GroupList)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="factoryID">
                              Factory *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.factoryID && errors.factoryID)}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              name="factoryID"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={advancedPaymentList.factoryID}
                              variant="outlined"
                              id="factoryID"
                              disabled={!permissionList.isFactoryFilterEnabled}
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(FactoryList)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="fromDate" style={{ marginBottom: '-8px' }}>
                              From Date *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                autoOk
                                fullWidth
                                inputVariant="outlined"
                                format="dd/MM/yyyy"
                                margin="dense"
                                id="fromDate"
                                value={fromDate}
                                onChange={(e) => {
                                  handleFromDate(e);
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>

                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="toDate" style={{ marginBottom: '-8px' }}>
                              To Date *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                autoOk
                                fullWidth
                                inputVariant="outlined"
                                format="dd/MM/yyyy"
                                margin="dense"
                                id="toDate"
                                value={toDate}
                                onChange={(e) => {
                                  handleToDate(e);
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="routeID">
                              Route
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="routeID"
                              size='small'
                              onChange={(e) => handleChange(e)}
                              value={advancedPaymentList.routeID}
                              variant="outlined"
                            >
                              <MenuItem value="0">--Select Route--</MenuItem>
                              {generateDropDownMenu(routes)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="advanceRequestType">
                              Source
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="advanceRequestType"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={advancedPaymentList.advanceRequestType}
                              variant="outlined"
                              id="advanceRequestType"
                            >
                              <MenuItem value={'0'}>--Select Source--</MenuItem>
                              <MenuItem value={'1'}>Mobile Advance</MenuItem>
                              <MenuItem value={'2'}>Over Advance</MenuItem>
                              <MenuItem value={'3'}>Direct Advance</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="statusID">
                              Status
                            </InputLabel>

                            <TextField select
                              fullWidth
                              name="statusID"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={advancedPaymentList.statusID}
                              variant="outlined"
                              id="statusID"
                            >
                              <MenuItem value={'0'}>--Select Status--</MenuItem>
                              <MenuItem value={'1'}>Pending</MenuItem>
                              <MenuItem value={'2'}>Issued</MenuItem>
                              <MenuItem value={'3'}>Rejected</MenuItem>
                              <MenuItem value={'4'}>Delivered</MenuItem>
                              <MenuItem value={'5'}>Autherized</MenuItem>
                            </TextField>
                          </Grid>
                        </Grid>
                        <Box display="flex" flexDirection="row-reverse" p={2} >
                          <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                          >
                            Search
                          </Button>
                        </Box>
                      </CardContent>
                      <Box minWidth={1050} hidden={advancePaymentData.length <= 0}>
                        <MaterialTable
                          title="Multiple Actions Preview"
                          columns={[
                            { title: 'Date', field: 'effectiveDate', render: rowData => rowData.effectiveDate.split('T')[0] },
                            { title: 'Route Name', field: 'routeName' },
                            { title: 'Register Number', field: 'registrationNumber' },
                            { title: 'Requested Amount(Rs)', field: 'amount', render: rowData => rowData.amount.toFixed(2) },
                            { title: 'Approved Amount(Rs)', field: 'approvedAmount', render: rowData => rowData.approvedAmount.toFixed(2) },
                            {
                              title: 'Source', field: 'advanceRequestType', lookup: {
                                1: 'Mobile Advance',
                                2: 'Over Advance',
                                3: 'Direct Advance'
                              }
                            },
                            {
                              title: 'Status', field: 'statusID', lookup: {
                                1: 'Pending',
                                2: 'Issue',
                                3: 'Reject',
                                4: 'Send_To_Deliver',
                                5: 'Autherized',
                                6: 'Delivered'
                              }
                            },
                          ]}
                          data={advancePaymentData}
                          options={{
                            exportButton: false,
                            showTitle: false,
                            headerStyle: { textAlign: "left", height: '1%' },
                            cellStyle: { textAlign: "left" },
                            columnResizable: false,
                            actionsColumnIndex: -1,
                            pageSize: 10
                          }}
                          actions={[{
                            icon: VisibilityIcon,
                            tooltip: 'View History',
                            onClick: (event, rowData) => handleClickView(rowData.advancePaymentRequestID)
                          }]}
                        />
                      </Box>
                      {advancePaymentData.length > 0 ?
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <Button
                            color="primary"
                            id="btnRecord"
                            type="submit"
                            variant="contained"
                            style={{ marginRight: '1rem' }}
                            className={classes.colorRecord}
                            onClick={() => createFile()}
                          >
                            EXCEL
                          </Button>
                          <ReactToPrint
                            documentTitle={"Factory Item Detail Report"}
                            trigger={() => <Button
                              color="primary"
                              id="btnRecord"
                              type="submit"
                              variant="contained"
                              style={{ marginRight: '1rem' }}
                              className={classes.colorCancel}
                            >
                              PDF
                            </Button>}
                            content={() => componentRef.current}
                          />
                          <div hidden={true}>
                            <CreatePDF ref={componentRef}
                              advancedPaymentList={advancePaymentData} searchData={selectedSearchValues}
                            />
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
  );
}
