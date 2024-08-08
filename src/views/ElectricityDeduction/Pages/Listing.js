import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Card, makeStyles, Container, CardHeader, Button, CardContent, Divider, MenuItem, Grid, InputLabel, TextField } from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import MaterialTable from "material-table";
import { LoadingComponent } from '../../../utils/newLoader';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import Slide from '@material-ui/core/Slide';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from '@material-ui/pickers';
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

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const screenCode = 'ELECTRICITYDEDUCTION';
export default function ElectricityDeductionListing() {
  const classes = useStyles();
  const [electricityDeductionDetailsData, setElectricityDeductionDetailsData] = useState([]);
  const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [costCenters, setcostCenters] = useState();
  const [isHideField, setIsHideField] = useState(true);
  const [tableData, setTableData] = useState([]);
  const curr = new Date;
  const first = curr.getDate() - curr.getDay();
  const last = first - 1;
  const friday = first + 5;
  const lastday = new Date(curr.setDate(last)).toISOString().substr(0, 10);
  const friday1 = new Date(curr.setDate(friday)).toISOString().substr(0, 10);
  const [enabledDay, setEnabledDay] = useState(1);
  const isDayDisabled = (date) => {
    if (enabledDay === null) {
      return true;
    }
    return date.getDay() !== enabledDay;
  };
  const [otherDeductionDetails, setOtherDeductionDetails] = useState({
    groupID: '0',
    gardenID: '0',
    costCenterID: '0',
    regNo: '',
    applicableDate: lastday,
    toDate: friday1,
  })
  const navigate = useNavigate();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/ElectricityDeduction/addEdit/' + encrypted);
  }
  const handleClickEdit = (electricityDeductionID) => {
    encrypted = btoa(electricityDeductionID.toString());
    navigate('/app/ElectricityDeduction/addEdit/' + encrypted);
  }
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const alert = useAlert();

  useEffect(() => {
    trackPromise(getPermissions(), getGroupsForDropdown());
  }, []);

  useEffect(() => {
    if (otherDeductionDetails.groupID > 0) {
      trackPromise(getFactoriesForDropdown());
      setOtherDeductionDetails({
        ...otherDeductionDetails,
        costCenterID: ''
      })
    }
    setElectricityDeductionDetailsData([]);
  }, [otherDeductionDetails.groupID]);

  useEffect(() => {
    trackPromise(getCostCenterDetailsByGardenID())
    setElectricityDeductionDetailsData([]);
  }, [otherDeductionDetails.gardenID]);

  useEffect(() => {
    setOtherDeductionDetails((otherDeductionDetails) => ({
      ...otherDeductionDetails,
      applicableDate: null
    }));
  }, [otherDeductionDetails.gardenID, otherDeductionDetails.groupID])

  useEffect(() => {
    setElectricityDeductionDetailsData([]);
  }, [otherDeductionDetails.costCenterID])

  useEffect(() => {
    calculateToDate();
  }, [otherDeductionDetails.applicableDate])

  useEffect(() => {
    setElectricityDeductionDetailsData([]);
  }, [otherDeductionDetails.regNo]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWELECTRICITYDEDUCTION');

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

    setOtherDeductionDetails({
      ...otherDeductionDetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      gardenID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getAllFactoriesByGroupID(otherDeductionDetails.groupID);
    setFactories(factories);
  }

  async function getCostCenterDetailsByGardenID() {
    var response = await services.getDivisionDetailsByEstateID(otherDeductionDetails.gardenID);
    var generated = generateDropDownMenu(response)
    if (generated.length > 0) {
      setOtherDeductionDetails((otherDeductionDetails) => ({
        ...otherDeductionDetails,
        costCenterID: generated[0].props.value,
      }));
    }
    setcostCenters(response);
  };

  async function getElectricityDeductionDetails() {
    let model = {
      groupID: parseInt(otherDeductionDetails.groupID),
      gardenID: parseInt(otherDeductionDetails.gardenID),
      costCenterID: parseInt(otherDeductionDetails.costCenterID),
      regNo: otherDeductionDetails.regNo,
      applicableDate: moment(otherDeductionDetails.applicableDate).format('YYYY-MM-DD'),
      toDate: moment(otherDeductionDetails.toDate).format('YYYY-MM-DD'),
    }
    const OtherDeductionDetails = await services.GetElectricityDeductionDetailsForView(model);
    if (OtherDeductionDetails.statusCode == 'Success') {
      setElectricityDeductionDetailsData(OtherDeductionDetails.data);
      setIsHideField(false);
    }
    else {
      setIsHideField(true);
      alert.error("No records to display");
    }
  }

  function handleClickDelete(data) {
    setOpen(true);
    setTableData(data);
  }

  function cancelData() {
    setOpen(false);
  }

  const handleClose = () => {
    setOpen(false);
  };

  async function confirmData() {
    setOpen(true);
    if (tableData.electricityDeductionID != undefined) {
      const response = await services.DeleteElectricityDeductionDetails(tableData.electricityDeductionID)
      if (response.data == 1) {
        const index = electricityDeductionDetailsData.findIndex(item => item.electricityDeductionID === tableData.electricityDeductionID);
        if (index !== -1) {
          const dataDelete = [...electricityDeductionDetailsData];
          dataDelete.splice(index, 1);
          setElectricityDeductionDetailsData(dataDelete);
          alert.success('Item deleted successfully');
        } else {
          alert.error('Error occurred in item delete');
        }
      }
      else {
        alert.error('Error occured in item delete')
      }
    }
  }

  function calculateToDate() {
    const calDate = new Date(otherDeductionDetails.applicableDate);
    calDate.setDate(calDate.getDate() + 6);
    setOtherDeductionDetails({
      ...otherDeductionDetails,
      toDate: calDate
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
    setOtherDeductionDetails({
      ...otherDeductionDetails,
      [e.target.name]: value
    });
  }

  function handleDateChange(value) {
    setElectricityDeductionDetailsData([]);
    setOtherDeductionDetails({
      ...otherDeductionDetails,
      applicableDate: value
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
            isEdit={true}
            toolTiptitle={"Add Electricity Deduction Details"}
          />
        </Grid>
      </Grid>
    )
  }

  return (
    <Page
      className={classes.root}
      title="Electricity Deductions"
    >
      <LoadingComponent />
      <Container maxWidth={false}>
        <Formik
          initialValues={{
            groupID: otherDeductionDetails.groupID,
            gardenID: otherDeductionDetails.gardenID,
            costCenterID: otherDeductionDetails.costCenterID,
            applicableDate: otherDeductionDetails.applicableDate,
            regNo: otherDeductionDetails.regNo,
          }}
          validationSchema={
            Yup.object().shape({
              groupID: Yup.number().required('Legal Entity is required').min("1", 'Legal Entity is required'),
              gardenID: Yup.number().required('Garden is required').min("1", 'Garden is required'),
              costCenterID: Yup.number().required('CostCenter is required').min("1", 'CostCenter is required'),
              applicableDate: Yup.date().nullable().required('Date is required')
            })
          }
          onSubmit={() => trackPromise(getElectricityDeductionDetails())}
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
                    title={cardTitle("Electricity Deductions")}
                  />
                  <Divider />
                  <CardContent style={{ marginBottom: "2rem" }}>
                    <Grid container spacing={3}>
                      <Grid item md={3} xs={8}>
                        <InputLabel shrink id="groupID">
                          Business Division *
                        </InputLabel>
                        <TextField select
                          error={Boolean(touched.groupID && errors.groupID)}
                          fullWidth
                          helperText={touched.groupID && errors.groupID}
                          name="groupID"
                          onChange={(e) => handleChange(e)}
                          value={otherDeductionDetails.groupID}
                          variant="outlined"
                          size='small'
                          InputProps={{
                            readOnly: !permissionList.isGroupFilterEnabled ? true : false
                          }}
                        >
                          <MenuItem value="0">--Select Business Division--</MenuItem>
                          {generateDropDownMenu(groups)}
                        </TextField>
                      </Grid>
                      <Grid item md={3} xs={8}>
                        <InputLabel shrink id="gardenID">
                          Location *
                        </InputLabel>
                        <TextField select
                          error={Boolean(touched.gardenID && errors.gardenID)}
                          fullWidth
                          helperText={touched.gardenID && errors.gardenID}
                          name="gardenID"
                          onChange={(e) => handleChange(e)}
                          value={otherDeductionDetails.gardenID}
                          variant="outlined"
                          size='small'
                          InputProps={{
                            readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                          }}
                        >
                          <MenuItem value="0">--Select Location--</MenuItem>
                          {generateDropDownMenu(factories)}
                        </TextField>
                      </Grid>
                      <Grid item md={3} xs={8}>
                        <InputLabel shrink id="costCenterID">
                          Sub Division *
                        </InputLabel>
                        <TextField select
                          error={Boolean(touched.costCenterID && errors.costCenterID)}
                          fullWidth
                          name="costCenterID"
                          onBlur={handleBlur}
                          onChange={(e) => handleChange(e)}
                          value={otherDeductionDetails.costCenterID}
                          variant="outlined"
                          id="costCenterID"
                          size='small'
                        >
                          <MenuItem value="0">--Select Sub Division--</MenuItem>
                          {generateDropDownMenu(costCenters)}
                        </TextField>
                      </Grid>
                      <Grid item md={3} xs={8}>
                        <InputLabel shrink id="applicableDate">
                          Date *
                        </InputLabel>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                          <KeyboardDatePicker
                            error={Boolean(touched.applicableDate && errors.applicableDate)}
                            autoOk
                            fullWidth
                            helperText={touched.applicableDate && errors.applicableDate}
                            variant="inline"
                            format="dd/MM/yyyy"
                            margin="dense"
                            id="applicableDate"
                            value={otherDeductionDetails.applicableDate}
                            shouldDisableDate={isDayDisabled}
                            onChange={(e) => {
                              handleDateChange(e);
                            }}
                            KeyboardButtonProps={{
                              'aria-label': 'change date',
                            }}
                          />
                        </MuiPickersUtilsProvider>
                      </Grid>
                      <Grid item md={3} xs={8}>
                        <InputLabel shrink id="regNo">
                          Reg.No
                        </InputLabel>
                        <TextField
                          error={Boolean(touched.regNo && errors.regNo)}
                          fullWidth
                          helperText={touched.regNo && errors.regNo}
                          name="regNo"
                          onBlur={handleBlur}
                          onChange={(e) => handleChange(e)}
                          value={otherDeductionDetails.regNo}
                          variant="outlined"
                          size="small"
                        />
                      </Grid>
                    </Grid>
                    <Box display="flex" justifyContent="flex-end" p={2}>
                      <Button
                        color="primary"
                        type="submit"
                        variant="contained"
                      >
                        Search
                      </Button>
                    </Box>
                  </CardContent>
                  <PerfectScrollbar>
                    <Box minWidth={1050}
                      hidden={isHideField}
                    >
                      <MaterialTable
                        title="Employee Electricity Deduction Details"
                        columns={[
                          { title: 'Emp.ID', field: 'employeeID' },
                          { title: 'Emp.Name', field: 'employeeName' },
                          { title: 'Emp.Category', field: 'employeeSubCategoryName' },
                          {
                            title: 'Reference',
                            field: 'reference',
                            render: rowData => rowData.reference ? rowData.reference : '-'
                          },
                          {
                            title: 'Deduction Amount',
                            field: 'deductionAmount',
                            render: rowData => rowData.deductionAmount.toFixed(2)
                          }
                        ]}
                        data={electricityDeductionDetailsData}
                        options={{
                          exportButton: false,
                          showTitle: true,
                          headerStyle: { textAlign: "left", height: '1%' },
                          cellStyle: { textAlign: "left" },
                          columnResizable: false,
                          actionsColumnIndex: -1,
                          pageSize: 10
                        }}
                        actions={[
                          {
                            icon: 'mode',
                            tooltip: 'Edit Electricity Deduction Details',
                            onClick: (event, rowData) => { handleClickEdit(rowData.electricityDeductionID) }
                          },
                          {
                            icon: 'delete',
                            tooltip: 'Remove record',
                            onClick: (event, rowData) => { handleClickDelete(rowData) }
                          }
                        ]}
                      />
                      <Dialog
                        open={open}
                        onBackdropClick="false"
                        TransitionComponent={Transition}
                        keepMounted
                        onClose={handleClose}
                        aria-labelledby="alert-dialog-slide-title"
                        aria-describedby="alert-dialog-slide-description"
                      >
                        <DialogTitle id="alert-dialog-slide-title"> <Typography
                          color="textSecondary"
                          gutterBottom
                          variant="h3"
                        >
                          <Box textAlign="center" >
                            {"Are you sure you want to delete?"}
                          </Box>
                        </Typography></DialogTitle>
                        <DialogActions>
                          <Button onClick={() => { cancelData(); handleClose(); }} color="primary">
                            No
                          </Button>
                          <Button onClick={() => { confirmData(true); handleClose(); }} color="primary">
                            Yes
                          </Button>
                        </DialogActions>
                      </Dialog>
                    </Box>
                  </PerfectScrollbar>
                </Card>
              </Box>
            </form>
          )}
        </Formik>
      </Container>
    </Page>
  );
};
