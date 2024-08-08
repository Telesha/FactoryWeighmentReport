import React, { useState, useEffect, Fragment, createContext } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Button, Card, makeStyles, Container, CardHeader, CardContent, Divider, MenuItem, Grid, InputLabel, TextField } from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../../Services';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import { useNavigate, useParams, Prompt } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import tokenDecoder from 'src/utils/tokenDecoder';
import MaterialTable from "material-table";
import Paper from '@material-ui/core/Paper';
import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';
import TabContext from '@material-ui/lab/TabContext';
import TabList from '@material-ui/lab/TabList';
import TabPanel from '@material-ui/lab/TabPanel';
import WitheredLeaf from '../TabViews/TabOneWitheredLeaf';
import Rolling from '../TabViews/TabTwoRolling';
import Fiering from '../TabViews/TabThreeFiering';
import LossExess from '../TabViews/TabFiveExsesLoss';
import moment from 'moment';
import { useAlert } from "react-alert";
import { AlertDialogWithoutButton } from '../../../Common/AlertDialogWithoutButton';
import { LoadingComponent } from '../../../../utils/newLoader';
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
  }
}));
const screenCode = 'MANUFACTURING';

export default function ManufacturingAddEditMain(props) {
  const [title, setTitle] = useState("Add Manufacturing");
  const classes = useStyles();
  const [GroupList, setGroupList] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);
  const [dialogbox, setDialogbox] = useState(false);
  const [dialog, setDialog] = useState();
  const [isFormIncomplete, setIsFormIncomplete] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isRollingDisabled, setIsRollingDisabled] = useState(true);
  const [DisableUserFields, setDisableUserFields] = useState(true);
  const [isFiringDisabled, setIsFiringDisabled] = useState(true);
  const [isGradingDisabled, setIsGradingDisabled] = useState(true);
  const [isCompleteDisabled, setIsCompleteDisabled] = useState(true);
  const [tableData, setTableData] = useState([]);
  const [factoryList, setFactoryList] = useState([]);
  const [manufactureNumber, setManufactureNumber] = useState([]);
  const [concat, setConcat] = useState();
  const [manufacturingDetail, setManufacturingDetail] = useState({
    groupID: 0,
    factoryID: 0,
    manufactureNumber: "",
    greenLeafAmount: '',
    fromDateOfCrop: null,
    toDateOfCrop: null,
    fromDateOfManufacture: null,
    toDateOfManufacture: null,
    fAmount: 0,
    rFAmount: 0,
    statusID: '',
    wAmount: 0,
    numberOfDays: '',
    isActive: true,
    best: '',
    belowBest: '',
    poor: '',
    weatherCondition: 0,
    fuelTypeID: 0,
    jobTypeID: 0,
    amount: ''
  });
  const [manufactureList, setManufactureList] = useState([]);
  const [manufactureId, setManufactureID] = useState();
  const [DhoolDetaislList, setDhoolDetaislList] = useState([]);
  const [witheredLeafData, setWitheredLeafData] = useState([]);
  const [firingDhoolData, setFiringDhoolData] = useState([]);
  const [GradeDetaislList, setGradeDetaislList] = useState([]);
  const [rollingData, setRollingData] = useState([]);
  const [successData, setSuccessData] = useState([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [isHide, setIsHide] = useState(true);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const alert = useAlert();
  const navigate = useNavigate();

  const [value, setValue] = React.useState("1");

  const handleChangetab = (event, newValue) => {
    setValue(newValue);
  };




  const { blManufaturingID } = useParams();
  let decrypted = 0;

  let encrypted = "";

  useEffect(() => {
    trackPromise(
      getPermission());
    trackPromise(
      getGroupsForDropdown());
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoriesForDropdown());
    trackPromise(
      getFuelTypesForDropdown());
    trackPromise(
      getJobTypesForDropdown());
  }, [manufacturingDetail.groupID]);

  useEffect(() => {
    trackPromise(
      generateBtachNumber()
    )
  }, [factoryList, manufacturingDetail.factoryID]);

  useEffect(() => {
    decrypted = atob(blManufaturingID.toString());
    if (decrypted != 0) {
      trackPromise(getManufacturing(decrypted));
      trackPromise(GetFuelConsumeByBLManufaturingID(decrypted));
    }
  }, []);



  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITMANUFACTURING');
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
    setManufacturingDetail({
      ...manufacturingDetail,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroupList(groups);

  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(manufacturingDetail.groupID);

    setFactoryList(factories);

  }

  async function getFuelTypesForDropdown() {
    const fuelTypes = await services.getFuelTypesForDropdown();
    setFuelTypes(fuelTypes);
  }

  async function getJobTypesForDropdown() {
    const jobTypes = await services.getJobTypesForDropdown();
    setJobTypes(jobTypes);
  }



  async function saveManufacture() {
    let model = {
      groupID: parseInt(manufacturingDetail.groupID),
      factoryID: parseInt(manufacturingDetail.factoryID),
      blManufaturingID: atob(blManufaturingID.toString()),
      manufactureNumber: manufacturingDetail.manufactureNumber,
      greenLeafAmount: manufacturingDetail.greenLeafAmount,
      numberOfDays: manufacturingDetail.numberOfDays,
      fromDateOfCrop: manufacturingDetail.fromDateOfCrop,
      toDateOfCrop: manufacturingDetail.toDateOfCrop,
      fromDateOfManufacture: manufacturingDetail.fromDateOfManufacture,
      toDateOfManufacture: manufacturingDetail.toDateOfManufacture,
      best: manufacturingDetail.best,
      belowBest: manufacturingDetail.belowBest,
      poor: manufacturingDetail.poor,
      weatherCondition: manufacturingDetail.weatherCondition,
      fuelConsumeList: DhoolDetaislList,
      isActive: true,
      createdBy: tokenDecoder.getUserIDFromToken(),
      createdDate: new Date().toISOString(),
    }

    if (isUpdate == true) {
      let response = await services.updateManufacturing(model, DhoolDetaislList);
      if (response.statusCode == "Success") {
        alert.success(response.message);
      }
      else {
        alert.error(response.message);
      }
    } else {
      let response = await services.saveManufacture(model, DhoolDetaislList);
      if (response.statusCode == "Success") {

        setManufactureID(response.data)

        setDhoolDetaislList([])
        getFuelConsumeData(response.data);
        setSuccessData(response.data);
        setIsSaved(true);

        setIsHide(false)
      }
      else {
        alert.error(response.message);
        setSuccessData(response.data);
      }
    }
  }

  async function getFuelConsumeData(data) {
    let response = await services.GetFuelConsumeByBLManufaturingID(data);
    setDhoolDetaislList(response)
  }

  async function GetFuelConsumeByBLManufaturingID(blManufaturingID) {
    let response = await services.GetFuelConsumeByBLManufaturingID(blManufaturingID);
    setDhoolDetaislList(response)

    setTitle("Edit Manufacturing");
    setIsUpdate(true || false);
    setIsHide(false)
  }

  async function getManufacturing(blManufaturingID) {
    let response = await services.GetManufacturingByID(blManufaturingID);
    let data = {
      groupID: response.groupID,
      factoryID: response.factoryID,
      blManufaturingID: response.blManufaturingID,
      manufactureNumber: response.manufactureNumber,
      greenLeafAmount: response.greenLeafAmount,
      fromDateOfCrop: response.fromDateOfCrop.split('T')[0],
      toDateOfCrop: response.toDateOfCrop.split('T')[0],
      fromDateOfManufacture: response.fromDateOfManufaturing.split('T')[0],
      toDateOfManufacture: response.toDateOfManufaturing.split('T')[0],
      best: response.best,
      belowBest: response.belowBest,
      poor: response.poor,
      numberOfDays: response.numberOfDays,
      weatherCondition: response.weatherCondition,
      statusID: response.statusID
    };
    setTitle("Edit Manufacturing");
    setManufacturingDetail(data);
    setDhoolDetaislList(data);
    setManufactureID(data.blManufaturingID)
    setIsUpdate(true);
    setIsHide(false);
    setIsRollingDisabled(false);
    setIsFiringDisabled(false);
    setIsGradingDisabled(false);
    setIsFormIncomplete(true);
    setManufactureNumber(response.manufactureNumber);


  }



  async function AddShoolDetails() {
    let dhoolModel = {
      fuelTypeID: parseInt(manufacturingDetail.fuelTypeID),
      jobTypeID: parseInt(manufacturingDetail.jobTypeID),
      amount: parseFloat(manufacturingDetail.amount)
    }


    setDhoolDetaislList(DhoolDetaislList => [...DhoolDetaislList, dhoolModel]);
    clearFormFields();
  }

  async function handleClickRemove(data) {
    setTableData(data)
    setDialogbox(true);
  }

  async function confirmData() {
    if (isUpdate == true) {

      let decrypted = 0;
      decrypted = atob(blManufaturingID);
      GetFuelConsumeByBLManufaturingID(decrypted)
      const res = await services.DeleteFuelConsume(tableData.manufactureFuelConsumeID);

      if (res == 1) {

        setDhoolDetaislList(DhoolDetaislList.splice(tableData.tableData.id))
        let decrypted = 0;
        decrypted = atob(blManufaturingID);
        GetFuelConsumeByBLManufaturingID(decrypted)

        alert.success('Item deleted successfully');

      } else {

        const dataDelete = [...DhoolDetaislList];
        const index = tableData.tableData.id;
        dataDelete.splice(index, 1);
        setDhoolDetaislList([...dataDelete]);

        setDialogbox(false);
      }
      setDialogbox(false);

    } else {

      if (tableData.manufactureFuelConsumeID != undefined) {

        const res = await services.DeleteFuelConsume(tableData.manufactureFuelConsumeID);

        if (res == 1) {

          const dataDelete = [...DhoolDetaislList];
          const index = tableData.tableData.id;
          dataDelete.splice(index, 1);
          setDhoolDetaislList([...dataDelete]);
        }

        alert.success('Item deleted successfully');
      } else {
        const dataDelete = [...DhoolDetaislList];
        const index = tableData.tableData.id;
        dataDelete.splice(index, 1);
        setDhoolDetaislList([...dataDelete]);

        setDialogbox(false);
      }
    }


  }

  async function cancelData() {
    if (isUpdate == true) {

      setDialogbox(false);
      let decrypted = 0;
      decrypted = atob(blManufaturingID);
      GetFuelConsumeByBLManufaturingID(decrypted)

    } else {
      setDialogbox(false);
    }


  }

  async function generateBtachNumber() {
    if (isUpdate == false) {
      if (manufacturingDetail.factoryID == 0) {
      }
      else {
        const factoryName = factoryList.find(x => x.factoryID === manufacturingDetail.factoryID)
        const factoryCode = factoryList.find(x => x.factoryID === manufacturingDetail.factoryID)
        const concatCode = (factoryName.factoryName.toUpperCase().substring(0, 3)).concat(factoryCode.factoryCode)

        const concatManufactureNumber = concatCode.concat(moment().format("DDMMYYYYhhmmssms"))
        setManufactureNumber(concatManufactureNumber);


        setManufacturingDetail({
          ...manufacturingDetail,
          manufactureNumber: concatManufactureNumber
        });
      }
    }


  }

  async function handleClick() {

    if (isUpdate == true) {

      if (manufacturingDetail.statusID == 1) {
        setDialog(true);
        setIsFormIncomplete(false);
      } else if (manufacturingDetail.statusID == 2) {
        navigate('/app/manufacturing/listing')

      }

    } else if (isSaved == true) {
      setDialog(true);
      setIsFormIncomplete(false);

    } else {
      navigate('/app/manufacturing/listing')
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

  function generateFactoryDropDownMenu(data) {
    let items = []
    if (data != null) {
      factoryList.forEach(x => {
        items.push(<MenuItem key={x.factoryID} value={x.factoryID}>{x.factoryName}</MenuItem>)
      });
    }
    return items
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setManufacturingDetail({
      ...manufacturingDetail,
      [e.target.name]: value
    });
  }

  function handleDateChange(value, field) {
    setManufacturingDetail({
      ...manufacturingDetail,
      [field]: value
    });
  }

  function enableRolling() {
    if (isUpdate == true) {
      setIsRollingDisabled(false);
    } else {
      setIsRollingDisabled(false);
    }

  }

  function enableFiring() {
    if (isUpdate == true) {
      setIsFiringDisabled(false);
    } else {
      setIsFiringDisabled(false);
    }

  }

  function enableGrading() {
    setIsGradingDisabled(false);
  }

  function isComplete() {
    if (isUpdate == true) {
      setIsFormIncomplete(false);
    } else {
      setIsFormIncomplete(false);
    }

  }

  async function confirmRequest() {
    navigate('/app/manufacturing/listing')
  }

  async function cancelRequest() {
    setDialog(false);

  }

  async function clearFormFields() {
    setManufacturingDetail({
      ...manufacturingDetail,
      fuelTypeID: 0,
      jobTypeID: 0,
      amount: '',

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
            onClick={() => handleClick()}
            isEdit={false}
          />
        </Grid>
      </Grid>
    )
  }

  function a11yProps(index) {
    return {
      id: `scrollable-auto-tab-${index}`,
      'aria-controls': `scrollable-auto-tabpanel-${index}`,
    };
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: manufacturingDetail.groupID,
              factoryID: manufacturingDetail.factoryID,
              manufactureNumber: manufacturingDetail.manufactureNumber,
              greenLeafAmount: manufacturingDetail.greenLeafAmount,
              fromDateOfCrop: manufacturingDetail.fromDateOfCrop,
              toDateOfCrop: manufacturingDetail.toDateOfCrop,
              fromDateOfManufacture: manufacturingDetail.fromDateOfManufacture,
              toDateOfManufacture: manufacturingDetail.toDateOfManufacture,
              weatherCondition: manufacturingDetail.weatherCondition,
              fuelTypeID: manufacturingDetail.fuelTypeID,
              jobTypeID: manufacturingDetail.jobTypeID,
              amount: manufacturingDetail.amount,
              best: manufacturingDetail.best,
              belowBest: manufacturingDetail.belowBest,
              poor: manufacturingDetail.poor,
              numberOfDays: manufacturingDetail.numberOfDays,
              isActive: manufacturingDetail.isActive
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                fromDateOfCrop: Yup.date().required('From Date Of Crop is required').typeError('Invalid date'),
                toDateOfCrop: Yup.date().required('To Date Of Crop is required').typeError('Invalid date'),
                fromDateOfManufacture: Yup.date().required('From Date Of Manufacture is required').typeError('Invalid date'),
                toDateOfManufacture: Yup.date().required('To Date Of Manufacture is required').typeError('Invalid date'),
                greenLeafAmount: Yup.number().required('Green Leaf Quantity is required').min("1", 'Green Leaf Quantity Amount is required'),
                weatherCondition: Yup.number().required('Weather Condition is required').min("1", 'Weather Condition  is required'),
                best: Yup.number().required('Best percentage is required').max(100, 'Enter a percentage of at most 100%').min(0,'Enter a positive percentage'),
                belowBest: Yup.number().required('Below Best percentage is required').max(100, 'Enter a percentage of at most 100%').min(0,'Enter a positive percentage'),
                poor: Yup.number().required('Poor percentage is required').max(100, 'Enter a percentage of at most 100%').min(0,'Enter a positive percentage'),
                fuelTypeID: Yup.number().required('Fuel Type is required').min("1", 'Fuel Type is required'),
                jobTypeID: Yup.number().required('Job Type is required').min("1", 'Job Type is required'),
                amount: Yup.number().required('Amount is required').min("1", 'Amount is required'),
                numberOfDays: Yup.number().required('Number of days is required').min("1", 'Number of days is required'),
              })
            }
            onSubmit={(event) => trackPromise(AddShoolDetails(event))}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              touched,
              isSubmitting
            }) => (
              <form onSubmit={handleSubmit}>
                <Box mt={0}>
                  <Card>
                    <CardHeader title={cardTitle(title)} />
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
                              value={manufacturingDetail.groupID}
                              variant="outlined"
                              id="groupID"
                              size='small'
                              InputProps={{
                                readOnly: isUpdate || !permissionList.isGroupFilterEnabled ? true : false
                              }}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(GroupList)}
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
                              value={manufacturingDetail.factoryID}
                              variant="outlined"
                              id="factoryID"
                              size='small'
                              InputProps={{
                                readOnly: isUpdate || !permissionList.isFactoryFilterEnabled ? true : false
                              }}
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateFactoryDropDownMenu(factoryList)}
                            </TextField>

                          </Grid>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="manufactureNumber">
                              Manufacture Number *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.manufactureNumber && errors.manufactureNumber)}
                              fullWidth
                              helperText={touched.manufactureNumber && errors.manufactureNumber}
                              name="manufactureNumber"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={manufacturingDetail.manufactureNumber}
                              variant="outlined"
                              size='small'
                              id="manufactureNumber"
                              InputProps={{
                                readOnly: true
                              }}
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="greenLeafAmount">
                              Green Leaf Quantity (KG) *
                            </InputLabel>
                            <TextField
                              type='number'
                              error={Boolean(touched.greenLeafAmount && errors.greenLeafAmount)}
                              fullWidth
                              helperText={touched.greenLeafAmount && errors.greenLeafAmount}
                              name="greenLeafAmount"
                              onBlur={handleBlur}
                              size='small'
                              onChange={(e) => handleChange(e)}
                              value={manufacturingDetail.greenLeafAmount}
                              InputProps={{
                                readOnly: manufacturingDetail.statusID == 2
                              }}
                              variant="outlined"
                              id="greenLeafAmount"
                            >
                            </TextField>
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="fromDateOfCrop">
                              From Date Of Crop *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                error={Boolean(touched.fromDateOfCrop && errors.fromDateOfCrop)}
                                helperText={touched.fromDateOfCrop && errors.fromDateOfCrop}
                                autoOk
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                id="fromDateOfCrop"
                                name="fromDateOfCrop"
                                size='small'
                                value={manufacturingDetail.fromDateOfCrop}
                                onChange={(e) => handleDateChange(e, "fromDateOfCrop")}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}                                     
                                disabled={manufacturingDetail.statusID == 2}                       
                                InputProps={{ readOnly: true }}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="toDateOfCrop">
                              To Date Of Crop *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                error={Boolean(touched.toDateOfCrop && errors.toDateOfCrop)}
                                helperText={touched.toDateOfCrop && errors.toDateOfCrop}
                                autoOk
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                id="toDateOfCrop"
                                size='small'
                                name="toDateOfCrop"
                                value={manufacturingDetail.toDateOfCrop}
                                onChange={(e) => handleDateChange(e, "toDateOfCrop")}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                disabled={manufacturingDetail.statusID == 2}                       
                                InputProps={{ readOnly: true }}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="fromDateOfManufacture">
                              From Date Of Manufacture *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                error={Boolean(touched.fromDateOfManufacture && errors.fromDateOfManufacture)}
                                helperText={touched.fromDateOfManufacture && errors.fromDateOfManufacture}
                                autoOk
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                id="fromDateOfManufacture"
                                size='small'
                                name="fromDateOfManufacture"
                                value={manufacturingDetail.fromDateOfManufacture}
                                onChange={(e) => handleDateChange(e, "fromDateOfManufacture")}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                disabled={manufacturingDetail.statusID == 2}                       
                                InputProps={{ readOnly: true }}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="toDateOfManufacture">
                              To Date Of Manufacture *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                error={Boolean(touched.toDateOfManufacture && errors.toDateOfManufacture)}
                                helperText={touched.toDateOfManufacture && errors.toDateOfManufacture}
                                autoOk
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                id="toDateOfManufacture"
                                size='small'
                                name="toDateOfManufacture"
                                value={manufacturingDetail.toDateOfManufacture}
                                onChange={(e) => handleDateChange(e, "toDateOfManufacture")}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                disabled={manufacturingDetail.statusID == 2}                       
                                InputProps={{ readOnly: true }}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="numberOfDays">
                              Number Of Days *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.numberOfDays && errors.numberOfDays)}
                              fullWidth
                              helperText={touched.numberOfDays && errors.numberOfDays}
                              name="numberOfDays"
                              type="number"
                              onBlur={handleBlur}
                              size='small'
                              onChange={(e) => handleChange(e)}
                              value={manufacturingDetail.numberOfDays}
                              InputProps={{
                                readOnly: manufacturingDetail.statusID == 2
                              }}
                              variant="outlined"
                              id="numberOfDays"
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="weatherCondition">
                              Weather Condition *
                            </InputLabel>
                            <TextField select
                              fullWidth
                              error={Boolean(touched.weatherCondition && errors.weatherCondition)}
                              helperText={touched.weatherCondition && errors.weatherCondition}
                              name="weatherCondition"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={manufacturingDetail.weatherCondition}
                              InputProps={{
                                readOnly: manufacturingDetail.statusID == 2
                              }}
                              variant="outlined"
                              id="weatherCondition"
                            >
                              <MenuItem value="0">--Select Weather Condition--</MenuItem>
                              <MenuItem value="1">Dry</MenuItem>
                              <MenuItem value="2">Rainy</MenuItem>
                              <MenuItem value="3">Heavy Rainy</MenuItem>

                            </TextField>
                          </Grid>
                        </Grid>

                        <Grid container spacing={3}>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="best">
                              Best (%) *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.best && errors.best)}
                              fullWidth
                              helperText={touched.best && errors.best}
                              name="best"
                              onBlur={handleBlur}
                              size='small'
                              onChange={(e) => handleChange(e)}
                              value={manufacturingDetail.best}
                              InputProps={{
                                readOnly: manufacturingDetail.statusID == 2
                              }}
                              variant="outlined"
                              id="best"
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="belowBest">
                              Below Best (%) *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.belowBest && errors.belowBest)}
                              fullWidth
                              helperText={touched.belowBest && errors.belowBest}
                              name="belowBest"
                              onBlur={handleBlur}
                              size='small'
                              onChange={(e) => handleChange(e)}
                              value={manufacturingDetail.belowBest}
                              InputProps={{
                                readOnly: manufacturingDetail.statusID == 2
                              }}
                              variant="outlined"
                              id="belowBest"
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="poor">
                              Poor (%) *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.poor && errors.poor)}
                              fullWidth
                              helperText={touched.poor && errors.poor}
                              name="poor"
                              onBlur={handleBlur}
                              size='small'
                              onChange={(e) => handleChange(e)}
                              value={manufacturingDetail.poor}
                              InputProps={{
                                readOnly: manufacturingDetail.statusID == 2
                              }}
                              variant="outlined"
                              id="poor"
                            >
                            </TextField>
                          </Grid>
                        </Grid>
                        <br />

                        <Grid container spacing={3} style={{ marginTop: "1rem" }}>
                          <Grid item md={6} xs={8}>
                            Consumed(Yarl/Ltr) Firewood / oil (Used For F:RF:W)
                          </Grid>
                        </Grid>

                        <Grid container spacing={3}>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="fuelTypeID">
                              Fuel Type *
                            </InputLabel>
                            <TextField select
                              fullWidth
                              error={Boolean(touched.fuelTypeID && errors.fuelTypeID)}
                              helperText={touched.fuelTypeID && errors.fuelTypeID}
                              name="fuelTypeID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={manufacturingDetail.fuelTypeID}
                              disabled={(manufacturingDetail.statusID == 2)}
                              variant="outlined"
                              id="fuelTypeID"
                            >
                              <MenuItem value="0">--Select Fuel Type--</MenuItem>
                              {generateDropDownMenu(fuelTypes)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="jobTypeID">
                              Job Type *
                            </InputLabel>
                            <TextField select
                              fullWidth
                              error={Boolean(touched.jobTypeID && errors.jobTypeID)}
                              helperText={touched.jobTypeID && errors.jobTypeID}
                              name="jobTypeID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={manufacturingDetail.jobTypeID}
                              disabled={(manufacturingDetail.statusID == 2)}
                              variant="outlined"
                              id="jobTypeID"
                            >
                              <MenuItem value="0">--Select Job Type--</MenuItem>
                              {generateDropDownMenu(jobTypes)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="amount">
                              Amount *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.amount && errors.amount)}
                              fullWidth
                              helperText={touched.amount && errors.amount}
                              name="amount"
                              type='number'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={manufacturingDetail.amount}
                              disabled={(manufacturingDetail.statusID == 2)}
                              variant="outlined"
                              id="amount"
                            >
                            </TextField>
                          </Grid>

                        </Grid>
                        <Box display="flex" flexDirection="row-reverse" p={2} >
                          <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                            disabled={manufacturingDetail.statusID == 2}
                            size='small'
                          >
                            Add
                          </Button>
                        </Box>

                        <Box minWidth={1050}>

                          <MaterialTable
                            title="Multiple Actions Preview"
                            columns={[
                              { title: 'Fuel Type', field: 'fuelTypeID', lookup: { ...fuelTypes } },
                              { title: 'Job Type', field: 'jobTypeID', lookup: { ...jobTypes } },
                              { title: 'Amount', field: 'amount' }

                            ]}
                            data={DhoolDetaislList}
                            options={{
                              exportButton: false,
                              showTitle: false,
                              headerStyle: { textAlign: "left", height: '1%' },
                              cellStyle: { textAlign: "left" },
                              columnResizable: false,
                              actionsColumnIndex: -1,
                              pageSize: 5,
                              search: false
                            }}
                            actions={[
                              rowData => ({
                                disabled: (manufacturingDetail.statusID == 2),
                                icon: 'delete',
                                tooltip: 'Remove',
                                onClick: (event, rowData) => { handleClickRemove(rowData) }
                              }),
                            ]}

                          />
                        </Box>

                        {dialogbox ?
                          <AlertDialogWithoutButton confirmData={confirmData} cancelData={cancelData}
                            IconTitle={"Delete"}
                            headerMessage={"Are you sure you want to delete?"}
                            discription={""} />
                          : null
                        }
                        {dialog ?
                          <AlertDialogWithoutButton confirmData={confirmRequest} cancelData={cancelRequest}
                            headerMessage={"Manufacturing"}
                            discription={"Manufacturing was not completed, This will be pending, Are you sure you want to leave?"} />
                          : null
                        }

                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <Button
                            color="primary"
                            variant="contained"
                            disabled={manufacturingDetail.statusID == 2}
                            onClick={() => saveManufacture()}
                            size='small'
                          >
                            Next
                          </Button>

                        </Box>

                        <br />
                        {isHide == false ?
                          <Box>
                            <Paper square>
                              <TabContext value={value}>
                                <AppBar position="static">
                                  <TabList centered="true" onChange={handleChangetab} variant={'fullWidth'} aria-label="simple tabs example" style={{ backgroundColor: "white" }}>
                                    <Tab label="Withered Leaf" value="1" style={{ color: "black" }} />
                                    <Tab label="Rolling" value="2" style={{ color: "black" }} disabled={isRollingDisabled} />
                                    <Tab label="Firing" value="3" style={{ color: "black" }} disabled={isFiringDisabled} />
                                    <Tab label="Grading" value="5" style={{ color: "black" }} disabled={isGradingDisabled} />
                                  </TabList>
                                </AppBar>
                                <TabPanel value="1"><WitheredLeaf manufactureID={manufactureId} groupData={manufacturingDetail.groupID} factoryData={manufacturingDetail.factoryID}
                                  witheredLeafData={witheredLeafData} setWitheredLeafData={setWitheredLeafData} enableRolling={enableRolling} disableFields={manufacturingDetail.statusID == 2} /></TabPanel>
                                <TabPanel value="2"><Rolling manufactureID={manufactureId} groupData={manufacturingDetail.groupID} factoryData={manufacturingDetail.factoryID}
                                  rollingData={rollingData} setRollingData={setRollingData} enableFiring={enableFiring} disableFields={manufacturingDetail.statusID == 2} /></TabPanel>
                                <TabPanel value="3"><Fiering manufactureID={manufactureId} groupData={manufacturingDetail.groupID} factoryData={manufacturingDetail.factoryID}
                                  firingDhoolData={firingDhoolData} setFiringDhoolData={setFiringDhoolData} enableGrading={enableGrading} disableFields={manufacturingDetail.statusID == 2} /></TabPanel>
                                <TabPanel value="5"><LossExess manufactureID={manufactureId} groupData={manufacturingDetail.groupID} factoryData={manufacturingDetail.factoryID} manufactureNumber={manufactureNumber}
                                  GradeDetaislList={GradeDetaislList} setGradeDetaislList={setGradeDetaislList} isComplete={isComplete} disableFields={manufacturingDetail.statusID == 2}
                                  setIsCompleteDisabled={setIsCompleteDisabled} isCompleteDisabled={isCompleteDisabled} /></TabPanel>
                              </TabContext>
                            </Paper>
                          </Box>
                          : true}

                      </CardContent>
                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            )}
          </Formik>
        </Container>
        <Prompt
          when={isFormIncomplete}
          message="Are you sure you want to leave?"
        />
      </Page>
    </Fragment>
  );
}
