
import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  makeStyles,
  Container,
  Divider,
  CardContent,
  CardHeader,
  Grid,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from 'src/utils/newLoader';
import { Formik } from 'formik';
import PageHeader from 'src/views/Common/PageHeader';

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
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
}));

const screenCode = 'ADVANCEDPAYMENTDETAILS';

export default function ViewAdvancePaymentStatusHistory(props) {
  const [title, setTitle] = useState("View Advance Payment Details")
  const classes = useStyles();
  const [factoryEnteringInput, setFactoryEnteringInput] = useState([])
  const [advancePaymentData, setAdvancePaymentData] = useState([]);
  const [id, setID] = useState([]);
  const [customerName, setCustomerName] = useState([]);
  const [approvedAmount, setApprovedAmount] = useState([]);
  const [reqAmount, setReqAmount] = useState([]);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const { advancePaymentRequestID } = useParams();
  let decrypted = 0;
  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/app/advancePaymentDetails/listing')
  }

  useEffect(() => {
    trackPromise(getPermission())

  }, []);

  useEffect(() => {
    decrypted = atob(advancePaymentRequestID.toString());
    if (decrypted != 0) {
      trackPromise(
        GetAdvancePaymentStatusHistory(decrypted),
      )
    }

  }, []);


  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADVANCEPAYMENTDETAILS');

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

    setFactoryEnteringInput({
      ...factoryEnteringInput,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function GetAdvancePaymentStatusHistory(advancePaymentRequestID) {
    const response = await services.GetAdvancePaymentStatusHistory(advancePaymentRequestID);
    setID(advancePaymentRequestID);
    setCustomerName(response.data[0].customerName);
    setReqAmount(response.data[0].requestedAmount.toFixed(2));
    setApprovedAmount(response.data[0].approvedAmount.toFixed(2));

    setTitle("View Advance Payment Details");
    setAdvancePaymentData(response.data);
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

  function statusTypes(data) {
    if (data == 1) {
      return 'Pending';
    }
    else if (data == 2) {
      return 'Issue';
    }
    else if (data == 3) {
      return 'Reject';
    }
    else if (data == 4) {
      return 'Send_To_Deliver';
    }
    else if (data == 5) {
      return 'Autherized';
    }
    else if (data == 6) {
      return 'Delivered';
    }
    else {
      return null;
    }
  }


  function advanceRequestTypes(data) {
    if (data == 1) {
      return 'Mobile Advance';
    }
    else if (data == 2) {
      return 'Over Advance';
    }
    else if (data == 3) {
      return 'Direct Advance';
    }
    else {
      return null;
    }
  }
  function createdDate(data) {
    return data;
  }
  function userName(data) {
    return data;
  }


  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
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

                        <Card style={{ padding: 30, marginTop: 20 }}>
                          <Grid container md={12} spacing={2} style={{ justifyContent: 'start' }}>
                            <Grid item md={3} xs={12}>
                              <InputLabel><b>Advance Payment Requeste ID</b></InputLabel>
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel > {": " + id} </InputLabel>
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel><b>Requested Amount</b></InputLabel>
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel > {": " + reqAmount} </InputLabel>
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel><b>Customer Name</b></InputLabel>
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel > {": " + customerName} </InputLabel>
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel><b>Approved Amount </b></InputLabel>
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel > {": " + approvedAmount} </InputLabel>
                            </Grid>
                          </Grid>
                        </Card>
                        <br></br>
                        <br></br>

                        <Divider />
                        <br></br>
                        {(advancePaymentData.length > 0) ?
                          <TableContainer >
                            <Table className={classes.table} aria-label="caption table">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Status</TableCell>
                                  <TableCell>Advance Request Type</TableCell>
                                  <TableCell>Date</TableCell>
                                  <TableCell>Authorized User</TableCell>

                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {advancePaymentData.map((rowData, index) => (
                                  <TableRow key={index}>
                                    <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {statusTypes(rowData.statusID)}
                                    </TableCell>
                                    <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {advanceRequestTypes(rowData.advanceRequestType)}
                                    </TableCell>
                                    <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {createdDate(rowData.createdDate.split('T')[0])}
                                    </TableCell>
                                    <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {userName(rowData.userName)}
                                    </TableCell>

                                  </TableRow>
                                ))}

                              </TableBody>
                            </Table>
                          </TableContainer>
                          : null}
                        <br />
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
