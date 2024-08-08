import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader, MenuItem,
  Table
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import { DatePicker, MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import Typography from '@material-ui/core/Typography';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import Chip from '@material-ui/core/Chip';
import { red, blue, green } from '@material-ui/core/colors';
import moment from 'moment';
import MaterialTable, { MTableToolbar, MTableBody, MTableHeader } from "material-table";
import xlsx from 'json-as-xlsx';


const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  cardroot: {
    minWidth: 275,
  },
  avatar: {
    marginRight: theme.spacing(2)
  },
  colorReject: {
    backgroundColor: "red",
  },
  colorApprove: {
    backgroundColor: "green",
  },
  card: {
    flexGrow: 10,
    backgroundColor: "#ffffff",
    paddingInlineStart: '10px',
    borderRadius: '10px',
  },
  avatar: {
    backgroundColor: red[500],
  },
  blue: {
    backgroundColor: blue[500],
  },
  succes: {
    backgroundColor: "#e8f5e9"
  },
  failed: {
    backgroundColor: "#fce4ec"
  },
  mainButtons: {
    marginRight: '0.5rem'
  },
  bold: {
    fontWeight: 600
  }
}));

const screenCode = 'BALANCEPAYMENTSUMMARYREPORT';

export default function BalancePaymentSummaryReport(props) {
  const [title, setTitle] = useState("Balance Payment Summary");
  const classes = useStyles();
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [searchStarted, setSearchStarted] = useState(false);
  const [balance, setBalance] = useState();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [balancePayment, setBalancePayment] = useState({
    balancePaymentSummaries: [],
    noOfActiveAccounts: 0
  });
  const [collectionTypeRate, setCollectionTypeRate] = useState({
    groupID: 0,
    factoryID: 0,
    month: '',
    year: ''
  });

  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/');
  }
  const alert = useAlert();
  const currentProps = {
    border: 3,
    style: { width: '10rem', height: '5rem' },
  };

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
    isBalanceRateChangeEnabled: false,
  });
  const [LedgerCsvHeaders, SetledgerCsvHeaders] = useState([])
  const [RouteWiseCsvHeaders, SetrouteWiseCsvHeaders] = useState([])

  useEffect(() => {
    setSelectedDate();
    getPermissions();
    trackPromise(
      getGroupsForDropdown()
    );

  }, []);

  useEffect(() => {
    setSelectedDate();
    getFactoriesForDropdown();
  }, [collectionTypeRate.groupID]);

  useEffect(() => {
    setSelectedDate();
  }, [collectionTypeRate.factoryID]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWBALANCEPAYMENTSUMMARYREPORT');

    if (isAuthorized === undefined) {
      navigate('/404');
    }

    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');
    var isBalanceRateChangeEnabled = permissions.find(p => p.permissionCode === 'BALANCERATEPERMISSION');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
      isBalanceRateChangeEnabled: isBalanceRateChangeEnabled !== undefined
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

  function generateDropDownMenu(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>)
      }
    }
    return items
  }

  async function generateSummaryReport() {
    trackPromise(GetSummary())
  }

  async function GetSummary() {

    var date = new Date();
    var month = date.getUTCMonth() + 1; //months from 1-12
    var year = date.getUTCFullYear();
    let model = {
      groupID: parseInt(collectionTypeRate.groupID),
      factoryID: parseInt(collectionTypeRate.factoryID),
      applicableMonth: selectedDate == undefined ? month.toString() : collectionTypeRate.month,
      applicableYear: selectedDate == undefined ? year.toString() : collectionTypeRate.year
    }
    const balancePay = await services.GetBalancePaymentSummary(model);

    if (balancePay.statusCode == "Success" && balancePay.data != null) {
      setBalancePayment(balancePay.data);
      setBalance(true)
    }
    else {
      alert.error("Error");
      setBalance(false)
    }
  }

  async function downloadBalancePaymentLedger() {
    trackPromise(GetBalancePaymentLedger())
  }

  async function GetBalancePaymentLedger() {

    var date = new Date();
    var month = date.getUTCMonth() + 1; //months from 1-12
    var year = date.getUTCFullYear();
    let model = {
      groupID: parseInt(collectionTypeRate.groupID),
      factoryID: parseInt(collectionTypeRate.factoryID),
      applicableMonth: selectedDate == undefined ? month.toString() : collectionTypeRate.month,
      applicableYear: selectedDate == undefined ? year.toString() : collectionTypeRate.year
    }

    const balancePay = await services.GetBalancePaymentDetailedData(model);

    if (balancePay.statusCode == "Success" && balancePay.data != null) {

      createBalancePaymentLedgerxlx(balancePay.data);
      alert.success("Success");

    }
    else {
      alert.error("Error");
    }
  }

  async function downloadRoutewiseBalancepayment() {
    trackPromise(GetRoutewiseBalancepayment())
  }

  async function GetRoutewiseBalancepayment() {

    var date = new Date();
    var month = date.getUTCMonth() + 1; //months from 1-12
    var year = date.getUTCFullYear();
    let model = {
      groupID: parseInt(collectionTypeRate.groupID),
      factoryID: parseInt(collectionTypeRate.factoryID),
      applicableMonth: selectedDate == undefined ? month.toString() : collectionTypeRate.month,
      applicableYear: selectedDate == undefined ? year.toString() : collectionTypeRate.year
    }

    const balancePay = await services.GetRoutewiseBalancepayment(model);
    if (balancePay.statusCode == "Success" && balancePay.data != null) {

      createRouteuWiseBalancePaymentxlx(balancePay.data);
      alert.success("Success");

    }
    else {
      alert.error("Error");
    }
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setCollectionTypeRate({
      ...collectionTypeRate,
      [e.target.name]: value
    });

  }

  function handleDateChange(date) {
    var month = date.getUTCMonth() + 1; //months from 1-12
    var year = date.getUTCFullYear();
    var currentmonth = moment().format('MM');
    setCollectionTypeRate({
      ...collectionTypeRate,
      month: month.toString(),
      year: year.toString()
    });

    if (selectedDate != null) {

      var prevMonth = selectedDate.getUTCMonth() + 1
      var prevyear = selectedDate.getUTCFullYear();

      if ((prevyear == year && prevMonth != month) || (prevyear != year)) {
        setSelectedDate(date)
        setSearchStarted(true)

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

  function createBalancePaymentLedgerxlx(data) {
    var settings = {
      sheetName: 'Balance Payment Ledger',
      fileName: 'Balance Payment Ledgert',
      writeOptions: {}
    }

    let keys = Object.keys(data[0])
    let tempcsvHeaders = LedgerCsvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let mergedData = [
      {
        sheet: 'Balance Payment Ledger',
        columns: tempcsvHeaders,
        content: data
      }
    ]

    xlsx(mergedData, settings);
  }

  function createRouteuWiseBalancePaymentxlx(data) {
    var settings = {
      sheetName: 'Route wise Balance Payment',
      fileName: 'Route wise Balance Payment',
      writeOptions: {}
    }

    let keys = Object.keys(data[0])
    let tempcsvHeaders = RouteWiseCsvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let mergedData = [
      {
        sheet: 'Route wise Balance Payment',
        columns: tempcsvHeaders,
        content: data
      }
    ]

    xlsx(mergedData, settings);
  }


  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: collectionTypeRate.groupID,
              factoryID: collectionTypeRate.factoryID
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group required').min("1", 'Group required'),
                factoryID: Yup.number().required('Factory required').min("1", 'Factory required'),
              })
            }
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
                          <Grid item md={3} xs={8}>
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
                              value={collectionTypeRate.groupID}
                              variant="outlined"
                              id="groupID"
                              disabled={!permissionList.isGroupFilterEnabled}

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
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={collectionTypeRate.factoryID}
                              variant="outlined"
                              id="factoryID"
                              disabled={!permissionList.isFactoryFilterEnabled}

                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={12}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <DatePicker
                                autoOk
                                variant="outlined"
                                openTo="month"
                                views={["year", "month"]}
                                label="Year and Month"
                                helperText="Select applicable month"
                                value={selectedDate}
                                disableFuture={true}
                                onChange={(date) => handleDateChange(date)}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                        </Grid>


                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <Button
                            color="primary"
                            variant="contained"
                            type="button"
                            onClick={() => generateSummaryReport(balancePayment)}
                            className={classes.mainButtons}
                          >
                            View Summary
                          </Button>
                          <Button
                            color="primary"
                            variant="contained"
                            type="button"
                            onClick={() => downloadRoutewiseBalancepayment(balancePayment)}
                            className={classes.mainButtons}
                          >
                            Download Route wise Balance payment
                          </Button>

                          <Button
                            color="primary"
                            variant="contained"
                            type="button"
                            onClick={() => downloadBalancePaymentLedger(balancePayment)}
                          >
                            Download Balance Payment Ledger
                          </Button>
                        </Box>

                        <br />

                      </CardContent>
                      {balance ?
                        <Grid >
                          <Card className={classes.cardroot}>
                            <CardContent>
                              <Box>
                                <MaterialTable
                                  title="Multiple Actions Preview"
                                  columns={[
                                    { title: 'Transaction Type', field: 'transactionTypeName' },
                                    // {
                                    //   title: ' Entry Type', field: 'entryType', lookup: {
                                    //     1: 'CR',
                                    //     2: 'DR'
                                    //   }, defaultSort:"asc",
                                    // },
                                    //{ title: 'Amount(Rs.)', field: 'total',render:rowData=>rowData.total.toFixed(2) },
                                    {
                                      title: 'Debit (LKR)', field: 'total',
                                      render: rowData => rowData.entryType == 2 ? rowData.total.toFixed(2) : "--"
                                    },  // hide if a credit entry
                                    {
                                      title: 'Credit (LKR)', field: 'total',
                                      render: rowData => rowData.entryType == 1 ? rowData.total.toFixed(2) : "--"
                                    },
                                  ]}
                                  data={balancePayment.balancePaymentSummaries}
                                  options={{
                                    exportButton: false,
                                    showTitle: false,
                                    headerStyle: { textAlign: "center", height: '1%' },
                                    cellStyle: { textAlign: "center" },
                                    columnResizable: false,
                                    actionsColumnIndex: -1,
                                    search: false,
                                    paging: false
                                  }}
                                  components={{
                                    Body: props => {
                                      return (
                                        <div>
                                          <MTableBody {...props} />
                                          <Box display="flex" justifyContent="flex-end" p={1}>
                                            {/* <Grid container spacing={3}> */}
                                            <Grid container justify="center" item md={4} xs={12} >
                                              <Typography className={classes.bold}>
                                                Total
                                              </Typography>
                                            </Grid>
                                            <Grid container justify="center" item md={4} xs={12}>
                                              <Typography className={classes.bold}>
                                                {balancePayment.balancePaymentSummaries.filter(({ entryType }) => entryType === 2)
                                                  .reduce((totalDebit, item) => totalDebit + item.total, 0).toFixed(2)}
                                              </Typography>
                                            </Grid>
                                            <Grid container justify="center" item md={4} xs={12}>
                                              <Typography className={classes.bold}>
                                                {balancePayment.balancePaymentSummaries.filter(({ entryType }) => entryType === 1)
                                                  .reduce((totalCredit, item) => totalCredit + item.total, 0).toFixed(2)}
                                              </Typography>
                                              {/* </Grid> */}
                                            </Grid>
                                          </Box>
                                        </div>

                                      )
                                    }
                                    ,
                                    Header: props => (
                                      <div>
                                        <MTableHeader {...props} />
                                      </div>
                                    )
                                  }}
                                />
                                <br />
                                <Grid container align="center" justify="center" alignItems="center">
                                  <Grid item xs={4} spacing={2}>
                                    <Typography className={classes.title} color="textSecondary" gutterBottom>
                                      <Chip style={{ marginLeft: '1rem', backgroundColor: "#44a6c6 " }} alignContent="center"
                                        icon={<PeopleAltIcon />}
                                        label={"Number Of Active Accounts : " + balancePayment.noOfActiveAccounts}
                                        color="primary"
                                      />
                                    </Typography>
                                  </Grid>
                                </Grid>
                                <br />

                              </Box>
                              <br />

                            </CardContent>

                          </Card>

                        </Grid> :
                        null
                      }


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
