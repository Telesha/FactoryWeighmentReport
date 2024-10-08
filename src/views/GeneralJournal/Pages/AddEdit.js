import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, Switch, CardHeader, MenuItem, setRef, TableBody,
  TableCell,
  TableHead,
  TableRow,
  Table,
  Hidden,
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import tokenDecoder from '../../../utils/tokenDecoder';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CountUp from 'react-countup';

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
}));

var screenCode = "GENERALJOURNAL"
export default function GeneralJournalAddEdit(props) {

  const navigate = useNavigate();
  const alert = useAlert();
  const { referenceNumber } = useParams();
  const { groupID } = useParams();
  const { factoryID } = useParams();
  const [title, setTitle] = useState("Journal")
  const [isUpdate, setIsUpdate] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const classes = useStyles();
  const [factories, setFactories] = useState();
  const [transactionTypes, setTransactionTypes] = useState();
  const [groups, setGroups] = useState();
  const [voucherTypes, setVoucherTypes] = useState([]);
  const [transactionModes, setTransactionModes] = useState([]);
  const [refNo, setRefNo] = useState();
  const [voucherCode, setVoucherCode] = useState();
  const [selectedDate, handleDateChange] = useState(new Date());
  const [selectedDueDate, handleDueDateChange] = useState(new Date().toISOString());
  const [financialYearStartDate, setFinancialYearStartDate] = useState();
  const [financialYearEndDate, setFinancialYearEndDate] = useState();
  const [dateDisable, setDateDisable] = useState(false);
  const [journalData, setJournalData] = useState([]);
  const [accountTypeNames, setAccountTypeNames] = useState();
  const [creditTotal, setCreditTotal] = useState(0);
  const [debitTotal, setDebitTotal] = useState(0);
  const [status, setStatus] = useState(0);
  const [recordAndNewBtnEnable, setRecordAndNewBtnEnable] = useState();
  const [approveButtonEnabled, setApproveButtonEnabled] = useState(false);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
    isApproveButtonEnabled: false
  });
  const [generalJournal, setGeneralJournal] = useState({
    groupID: '0',
    factoryID: '0',
    transactionTypeID: '0',
    referenceNumber: '',
    description: '',
    payModeID: '0',
    chequeNumber: '',
    isActive: true,
    preparedBy: '',
    updatedBy: '',
    voucherType: '0',
    voucherCode: '',
    transactionMode: '0',
    recipientName: '',
    address: '',
  });

  const handleClick = () => {
    navigate('/app/generalJournal/listing');
  }

  let decrypted = 0;
  let decryptedfactoryID = 0;
  let decryptedgroupID = 0

  useEffect(() => {
    getPermissions();
    getGroupsForDropdown();
  }, []);

  useEffect(() => {
    if (generalJournal.groupID.toString() !== "0") {
      trackPromise(getfactoriesForDropDown());
    }
  }, [generalJournal.groupID]);

  useEffect(() => {
    if (generalJournal.factoryID.toString() !== "0") {
      trackPromise(getAccountTypeNames(generalJournal.groupID, generalJournal.factoryID));
      trackPromise(getTransactionTypes());
      trackPromise(getVoucherTypeList());
      trackPromise(getTransactionModeList());
      trackPromise(getFinancialYearStartEndDate());
    }
  }, [generalJournal.factoryID]);

  useEffect(() => {
    decrypted = atob(referenceNumber.toString());
    decryptedgroupID = atob(groupID.toString());
    decryptedfactoryID = atob(factoryID.toString());
    if (decrypted != 0) {
      trackPromise(getGeneralJournalDetails(decrypted, decryptedgroupID, decryptedfactoryID));
    } else {
      setJournalData([
        {
          accountTypeName: 0,
          credit: 0,
          debit: 0,
          description: undefined,
          ledgerTransactionID: 0,
          rowID: GenerateRandomID()
        }
      ])
    }
  }, []);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITGENERALJOURNAL');

    if (isAuthorized === undefined) {
      navigate('/404');
    }

    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');
    var isApproveButtonEnabled = permissions.find(p => p.permissionCode == 'JOURNALAPPROVEBUTTONENABLED');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
      isApproveButtonEnabled: isApproveButtonEnabled !== undefined,
    });

    setGeneralJournal({
      ...generalJournal,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getReferenceNumber(voucherCode) {
    let refModel = {
      groupID: generalJournal.groupID,
      factoryID: generalJournal.factoryID,
      date: selectedDate.toISOString().split('-')[0],
      voucherCode: voucherCode
    }
    const ref = await services.getReferenceNumber(refModel);
    setRefNo(ref.data);
  }

  async function getTransactionTypes() {
    const transaction = await services.getTransactionTypeNamesForDropdown();
    setTransactionTypes(transaction);
  }

  async function getAccountTypeNames(groupID, factoryID) {
    const accounts = await services.getLedgerAccountNamesForDatagrid(groupID, factoryID);
    setAccountTypeNames(accounts);
    return accounts;
  }

  async function getFinancialYearStartEndDate() {
    const yearDate = await services.getFinancialYearStartDateByGroupIDFactoryID(generalJournal.groupID, generalJournal.factoryID);
    if (yearDate !== null) {
      setFinancialYearStartDate(yearDate.financialYearStartDate);
      setFinancialYearEndDate(yearDate.financialYearEndDate);
      setDateDisable(false);
    }
    else {
      alert.error("Please Config the Financial Year");
      setDateDisable(true);
      setFinancialYearStartDate(new Date());
      setFinancialYearEndDate(new Date());
    }
  }

  async function getfactoriesForDropDown() {
    const factory = await services.getfactoriesForDropDown(generalJournal.groupID);
    setFactories(factory);
  }

  async function getGeneralJournalDetails(referenceNumber, groupID, factoryID) {
    let response = await services.getGeneralJournalDetailsByReferenceNumber(referenceNumber, groupID, factoryID);
    let data = response;

    setTitle("Update Journal");
    setIsUpdate(true);
    setGeneralJournal({
      ...generalJournal,
      groupID: data[0].groupID,
      factoryID: data[0].factoryID,
      transactionTypeID: data[0].transactionTypeID,
      referenceNumber: data[0].referenceNumber,
      description: data[0].description,
      recipientName: data[0].recipientName,
      transactionMode: data[0].transactionModeID,
      voucherType: data[0].voucherTypeID,
      payModeID: data[0].payModeID,
      chequeNumber: data[0].chequeNumber == null ? "" : data[0].chequeNumber,
      preparedBy: data[0].preparedBy
    });
    setStatus(data[0].status);
    setRefNo(data[0].referenceNumber);
    let copyArray = data;

    let accountNameList = await getAccountTypeNames(data[0].groupID, data[0].factoryID);

    let tempArray = [...journalData]

    copyArray.forEach(element => {
      let reuslt = GetAll(element.accountTypeName, accountNameList);
      tempArray.push(
        {
          accountTypeName: element.accountTypeName,
          description: element.description,
          credit: element.credit,
          debit: element.debit,
          ledgerTransactionID: element.ledgerTransactionID,
          disableDebitField: parseFloat(element.credit.toString()) > 0 ? true : false,
          disableCreditField: parseFloat(element.debit.toString()) > 0 ? true : false,
          rowID: GenerateRandomID(),
          selected: reuslt
        }
      )
    });
    setJournalData(tempArray)
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  async function getVoucherTypeList() {
    const voucherTypes = await services.getVoucherTypeList();
    setVoucherTypes(voucherTypes);
    decrypted = atob(referenceNumber.toString());
    if (decrypted == 0) {
      voucherTypes.forEach(x => {
        if (x.screenCode == 'JOURNAL') {
          setGeneralJournal({
            ...generalJournal,
            voucherType: parseInt(x.voucherTypeID)
          })
        }
      });
    }
    return voucherTypes;
  }

  async function getTransactionModeList() {
    const transactionModes = await services.getTransactionModeList();
    setTransactionModes(transactionModes);
    return transactionModes
  }

  async function SaveGeneralJournal() {
    if (journalData[0].credit != 0 || journalData[0].debit != 0) {
      let index = journalData.findIndex(x => x.accountTypeName === 0);

      if (index > 0) {
        alert.error('Account name is required, please check');
        journalData.splice(index, 1);
        return;
      }

      journalData.forEach(
        function (part, index) {
          journalData[index].accountTypeName = parseInt(part.accountTypeName);
          journalData[index].credit = parseFloat(part.credit);
          journalData[index].debit = parseFloat(part.debit);
          journalData[index].description = part.description;
        });
      setJournalData(journalData)

      var finalArray = journalData.filter(e => e.accountTypeName !== 0);

      if (!isUpdate) {

        let saveModel = {
          groupID: generalJournal.groupID,
          factoryID: generalJournal.factoryID,
          transactionTypeID: generalJournal.transactionTypeID,
          referenceNumber: refNo,
          chequeNumber: generalJournal.chequeNumber,
          voucherType: generalJournal.voucherType,
          transactionMode: generalJournal.transactionMode,
          voucherCode: voucherCode,
          recipientName: generalJournal.recipientName,
          isActive: true,
          journalData: finalArray,
          date: selectedDate,
          dueDate: selectedDueDate,
          status: approveButtonEnabled == true ? parseInt(2) : parseInt(1)
        }

        let change = calOutOfBalance();
        if (change == 0) {
          if (recordAndNewBtnEnable) {
            let response = await services.saveGeneralJournal(saveModel);

            if (response.statusCode == "Success") {
              alert.success('journal saved successfully');
              clearData();
            }
            else {
              alert.error(response.message);
            }
          }
          else {
            let response = await services.saveGeneralJournal(saveModel);

            if (response.statusCode == "Success") {
              alert.success('journal saved successfully');
              clearData();
              navigate('/app/generalJournal/listing');
            }
            else {
              alert.error(response.message);
            }
          }
        }
        else {
          alert.error('credit and debit records shoud be balanced');
        }

      }
      else {
        let updateModel = {
          groupID: generalJournal.groupID,
          factoryID: generalJournal.factoryID,
          transactionTypeID: generalJournal.transactionTypeID,
          referenceNumber: generalJournal.referenceNumber,
          voucherType: generalJournal.voucherType,
          transactionMode: generalJournal.transactionMode,
          recipientName: generalJournal.recipientName,
          chequeNumber: generalJournal.chequeNumber,
          isActive: true,
          journalData: finalArray,
          date: selectedDate,
          dueDate: selectedDueDate,
          voucherCode: generalJournal.voucherCode,
        }

        let response = await services.updateGeneralJournal(updateModel);
        if (response.statusCode == "Success") {
          alert.success('journal updated successfully');
          clearData();
          navigate('/app/generalJournal/listing');
        }
        else {
          alert.error(response.message);
        }
      }
    }
    else {
      alert.error("please enter Debit/Credit Values");
    }
  }

  function concatenate(voucherType, transactionMode) {
    const voucherCode = voucherTypes.find(x => x.voucherTypeID === voucherType)
    const transactionCode = transactionModes.find(x => x.transactionModeID === transactionMode)
    const concatCode = transactionCode.transactionModeCode.concat(voucherCode.voucherTypeCode)
    setVoucherCode(concatCode)
    return concatCode;
  }

  function GetAll(ledgerAccountID, accountTypeNames) {
    const result = accountTypeNames.filter((a) => a.ledgerAccountID.toString() === ledgerAccountID.toString())
    return result;
  }

  function generateDropownForVoucherList(dataList) {
    let items = []
    if (dataList != null) {
      voucherTypes.forEach(x => {
        if (x.screenCode == 'JOURNAL') {
          items.push(<MenuItem key={x.voucherTypeID} value={x.voucherTypeID}>{x.voucherTypeName}</MenuItem>)
        }
      });

    }
    return items
  }

  function generateDropownForTransactionModeList(dataList) {
    let items = []
    if (dataList != null) {
      transactionModes.forEach(x => {
        if (x.screenCode == 'JOURNAL') {
          items.push(<MenuItem key={x.transactionModeID} value={x.transactionModeID}>{x.transactionModeName}</MenuItem>)
        }
      });
    }
    return items

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

  async function transactionModeChange(e) {
    const target = e.target;
    const value = target.value
    var voucherCode = concatenate(generalJournal.voucherType, value);
    trackPromise(getReferenceNumber(voucherCode));
  }

  function handleChangeForm(e) {
    const target = e.target;
    const value = target.value
    setGeneralJournal({
      ...generalJournal,
      [e.target.name]: value
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

  function calDebitTotal() {
    let sum = 0;
    journalData.forEach(x => {
      sum += parseFloat(x.debit);
      x.debit = parseFloat(x.debit);
      x.ledgerTransactionID = parseFloat(x.ledgerTransactionID);
      x.description = x.description;
    });
    setDebitTotal(sum.toFixed(2));
    return sum.toFixed(2);
  }

  function calCreditTotal() {
    let sum = 0;
    journalData.forEach(x => {
      sum += parseFloat(x.credit);
      x.credit = parseFloat(x.credit);
    });
    setCreditTotal(sum.toFixed(2));
    return sum.toFixed(2);
  }

  function calOutOfBalance() {
    return (parseFloat(creditTotal) - parseFloat(debitTotal)).toFixed(2);
  }

  function findLoginUser() {
    return tokenDecoder.getUserNameFromToken();
  }

  function Cancel() {
    navigate('/app/generalJournal/listing');
  }

  const RecordAndNew = () => {
    setRecordAndNewBtnEnable(true);
    setApproveButtonEnabled(false);
  }

  const RecordClick = () => {
    setRecordAndNewBtnEnable(false);
    setApproveButtonEnabled(false);
  }

  const ApproveClick = () => {
    setRecordAndNewBtnEnable(false);
    setApproveButtonEnabled(true);
  }

  function clearData() {
    setGeneralJournal({
      ...generalJournal,
      transactionTypeID: '0',
      referenceNumber: '',
      description: '',
      payModeID: '0',
      chequeNumber: '',
      isActive: true,
      preparedBy: '',
      updatedBy: '',
      voucherCode: '',
      transactionMode: '0',
      recipientName: ''
    });
    setJournalData([{
      accountTypeName: 0,
      credit: 0,
      debit: 0,
      description: "",
      ledgerTransactionID: 0,
      rowID: GenerateRandomID()
    }]);
    handleDateChange(new Date());
    handleDueDateChange(new Date().toISOString());
    setRefNo('');
    setVoucherCode('');
  }

  function handleSearchDropdownChange(e, data, rowID) {
    if (data === undefined || data === null)
      return;

    let valueV = data["ledgerAccountID"];
    const newArr = [...journalData];
    var idx = newArr.findIndex(e => e.rowID == parseInt(rowID));

    let reuslt = GetAll(valueV, accountTypeNames);

    newArr[idx] = { ...newArr[idx], accountTypeName: parseInt(valueV), selected: reuslt };
    setJournalData(newArr)
  }

  function changeText(e, rowID, inputType) {

    const target = e.target;
    const value = target.value

    const newArr = [...journalData];
    var idx = newArr.findIndex(e => e.rowID == parseInt(rowID));

    if (inputType === "description") {
      newArr[idx] = { ...newArr[idx], description: value };
    } else if (inputType === "credit") {

      var reg = new RegExp('^[\.0-9]*$');

      if (reg.test(value) == false) {
        alert.error("Allow Only Numbers")
        return;
      }

      let debitBool = false
      let creditBool = false
      if (parseFloat(value.toString()) > 0) {
        debitBool = true;
        creditBool = false
      }
      if (value.toString().length >= 20) {
        alert.error('Allow Only 20 Numbers');
        return;
      }
      newArr[idx] = { ...newArr[idx], credit: (value === "" ? 0 : value), disableCreditField: creditBool, disableDebitField: debitBool };
    } else {

      var reg = new RegExp('^[\.0-9]*$');

      if (reg.test(value) == false) {
        alert.error("Allow Only Numbers")
        return;
      }

      let debitBool = false
      let creditBool = false
      if (parseFloat(value.toString()) > 0) {
        debitBool = false;
        creditBool = true
      }
      if (value.toString().length >= 20) {
        alert.error('Allow Only 20 Numbers');
        return;
      }
      newArr[idx] = { ...newArr[idx], debit: (value === "" ? 0 : value), disableCreditField: creditBool, disableDebitField: debitBool };
    }
    setJournalData(newArr)
  }

  function GenerateRandomID() {
    const d = new Date();
    let ms = d.valueOf();

    let rendomValue = ((ms + Math.floor(Math.random() * 10000)) - 12) + ((ms - 128) + (ms * 512))
    return rendomValue;
  }

  function onKeyDown(e, id, data) {
    if (e.key === "Tab") {
      if (data.credit != 0 || data.debit != 0) {
        if (journalData[journalData.length - 1].rowID.toString() === id.toString()) {
          let ID = GenerateRandomID()
          journalData.push({ accountTypeName: 0, credit: 0, debit: 0, ledgerTransactionID: 0, rowID: ID, selected: [] })
          var result = refNo == undefined ? 0 : refNo.substring(0, 3);
          setJournalData(journalData)
          if (result == 'CHP') {
            getChequeNumber(data)
          }
        }
      }
      else {
        alert.error("please enter Debit/Credit Values");
      }
    }
  };

  async function getChequeNumber(data) {
    let response = await services.getChequeNumber(data.accountTypeName);
    if (response.data == null) {
      alert.error(response.message);
    }
    else {
      setGeneralJournal({
        ...generalJournal,
        chequeNumber: response.data
      });
    }
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: generalJournal.groupID,
              factoryID: generalJournal.factoryID,
              referenceNumber: referenceNumber,
              recipientName: generalJournal.recipientName,
              description: generalJournal.description,
              voucherType: generalJournal.voucherType,
              transactionMode: generalJournal.transactionMode,
              chequeNumber: generalJournal.chequeNumber,
              isActive: generalJournal.isActive,

            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group required').min("1", 'Group required'),
                factoryID: Yup.number().required('Factory required').min("1", 'Factory required'),
                referenceNumber: Yup.string().required('Reference number required'),
                voucherType: Yup.number().required('Voucher Type required').min("1", 'Voucher Type required'),
                transactionMode: Yup.number().required('Transaction Mode required').min("1", 'Transaction Mode required'),
                chequeNumber: Yup.string().when("payModeID",
                  {
                    is: val => val == '',
                    then: Yup.string().required('Cheque number required'),
                  }),
              })
            }
            onSubmit={(event) => trackPromise(SaveGeneralJournal(event))}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              touched,
              values,
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
                          <Grid item md={4} xs={12}>
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
                              onChange={(e) => handleChangeForm(e)}
                              value={values.groupID}
                              variant="outlined"
                              id="groupID"
                              InputProps={{
                                readOnly: isUpdate || !permissionList.isGroupFilterEnabled ? true : false,
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
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeForm(e)}
                              value={generalJournal.factoryID}
                              variant="outlined"
                              id="factoryID"
                              InputProps={{
                                readOnly: isUpdate || !permissionList.isFactoryFilterEnabled ? true : false,
                              }}
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="date" style={{ marginBottom: '-8px' }}>
                              Date *
                            </InputLabel>

                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                fullWidth
                                inputVariant="outlined"
                                format="dd/MM/yyyy"
                                margin="dense"
                                id="date-picker-inline"
                                value={selectedDate}
                                minDate={financialYearStartDate}
                                maxDate={financialYearEndDate}
                                disabled={dateDisable}
                                onChange={(e) => {
                                  handleDateChange(e)
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                autoOk
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          {Hidden == true ?
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="voucherType">
                                Voucher Type *
                              </InputLabel>
                              <TextField select
                                error={Boolean(touched.voucherType && errors.voucherType)}
                                fullWidth
                                helperText={touched.voucherType && errors.voucherType}
                                name="voucherType"
                                size='small'
                                onBlur={handleBlur}
                                onChange={(e) => handleChangeForm(e)}
                                value={generalJournal.voucherType}
                                variant="outlined"
                                id="voucherType"
                                InputProps={{
                                  readOnly: isUpdate ? true : false,
                                }}
                              >
                                <MenuItem value="0">--Select Voucher Type--</MenuItem>
                                {generateDropownForVoucherList(voucherTypes)}
                              </TextField>
                            </Grid> : null}

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="transactionMode">
                              Transaction Mode *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.transactionMode && errors.transactionMode)}
                              fullWidth
                              helperText={touched.transactionMode && errors.transactionMode}
                              name="transactionMode"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => {
                                handleChangeForm(e)
                                trackPromise(transactionModeChange(e))
                              }}
                              value={generalJournal.transactionMode}
                              variant="outlined"
                              id="transactionMode"
                              InputProps={{
                                readOnly: isUpdate ? true : false,
                              }}
                            >
                              <MenuItem value="0">--Select Transaction Mode--</MenuItem>
                              {generateDropownForTransactionModeList(transactionModes)}

                            </TextField>

                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="referenceNumber">
                              Voucher Code *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.referenceNumber && errors.referenceNumber)}
                              fullWidth
                              helperText={touched.referenceNumber && errors.referenceNumber}
                              name="referenceNumber"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeForm(e)}
                              value={refNo}
                              variant="outlined"
                              InputProps={{
                                readOnly: true,
                              }}
                            />
                          </Grid>

                        </Grid>
                        {Hidden == true ?
                          <Grid container spacing={3}>

                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="chequeNumber">
                                Due Date
                              </InputLabel>
                              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <KeyboardDatePicker
                                  fullWidth
                                  variant="inline"
                                  format="dd/MM/yyyy"
                                  margin="dense"
                                  id="date-picker-inline"
                                  value={selectedDueDate}
                                  onChange={(e) => {
                                    handleDueDateChange(e)
                                  }}
                                  KeyboardButtonProps={{
                                    'aria-label': 'change date',
                                  }}
                                  autoOk
                                />
                              </MuiPickersUtilsProvider>

                            </Grid>

                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="chequeNumber">
                                Cheque Number
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.chequeNumber && errors.chequeNumber)}
                                fullWidth
                                helperText={touched.chequeNumber && errors.chequeNumber}
                                name="chequeNumber"
                                onBlur={handleBlur}
                                onChange={(e) => handleChangeForm(e)}
                                value={generalJournal.chequeNumber}
                                variant="outlined"
                                disabled={isDisableButton}
                              />
                            </Grid>

                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="recipientName">
                                Recipient Name
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.recipientName && errors.recipientName)}
                                fullWidth
                                helperText={touched.recipientName && errors.recipientName}
                                name="recipientName"
                                onBlur={handleBlur}
                                onChange={(e) => handleChangeForm(e)}
                                value={generalJournal.recipientName}
                                variant="outlined"
                                disabled={isDisableButton}
                              />
                            </Grid>
                          </Grid> : null}

                      </CardContent>
                      <CardContent height="auto">
                        <Box style={{ border: "1px solid gray" }}>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Account Name *</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Debit *</TableCell>
                                <TableCell>Credit *</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {
                                journalData.map((object) => {
                                  let ID = object.rowID
                                  return (
                                    <TableRow>
                                      <TableCell style={{ padding: "16px", width: "20rem" }}>
                                        <Autocomplete
                                          id={ID.toString()}
                                          options={accountTypeNames}
                                          size={"small"}
                                          style={{ width: "20rem" }}
                                          getOptionLabel={(option) => option.ledgerAccountName}
                                          onChange={(e, value) => handleSearchDropdownChange("accountName", value, ID)}
                                          value={object.selected !== undefined ? object.selected[0] : null}
                                          renderInput={(params) => (
                                            <TextField {...params} fullWidth autoFocus variant="outlined" placeholder="--Select Account--" />
                                          )}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <TextField
                                          variant="outlined"
                                          size={"small"}
                                          name={ID}
                                          onBlur={handleBlur}
                                          onChange={(e) => changeText(e, ID, "description")}
                                          value={object.description}
                                          fullWidth />
                                      </TableCell>
                                      <TableCell>
                                        <TextField
                                          variant="outlined"
                                          size={"small"}
                                          name={ID}
                                          onBlur={handleBlur}
                                          fullWidth
                                          onChange={(e) => changeText(e, ID, "debit")}
                                          value={object.debit}
                                          inputProps={{ readOnly: object.disableDebitField }}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <TextField
                                          variant="outlined"
                                          size={"small"}
                                          name={ID}
                                          onBlur={handleBlur}
                                          onChange={(e) => changeText(e, ID, "credit")}
                                          value={object.credit}
                                          fullWidth
                                          onKeyDown={(e) => onKeyDown(e, ID, object)}
                                          inputProps={{ readOnly: object.disableCreditField }}
                                        />
                                      </TableCell>
                                    </TableRow>
                                  )
                                })
                              }
                            </TableBody>
                          </Table>
                        </Box>
                      </CardContent>
                      <CardContent>
                        <Box border={1} borderColor="#626964" >
                          <Grid container md={12} spacing={2} style={{ marginTop: '1rem', marginLeft: '1rem' }}>

                            <Grid item md={2} xs={12} style={{ marginLeft: '10px' }}>
                              <InputLabel><b>Total Debit (Rs)</b></InputLabel>
                            </Grid>
                            <Grid item md={2} xs={12}>
                              <InputLabel > {": "}
                                <CountUp decimals={2} separator=',' end={calDebitTotal()} duration={.1} />
                              </InputLabel>
                            </Grid>
                            <Grid item md={2} xs={12}>
                              <InputLabel ><b>Total Credit (Rs)</b></InputLabel>
                            </Grid>
                            <Grid item md={2} xs={12}>
                              <InputLabel >{": "}
                                <CountUp decimals={2} separator=',' end={calCreditTotal()} duration={.1} />
                              </InputLabel>
                            </Grid>
                            <Grid item md={2} xs={12}>
                              <InputLabel ><b>Out Of Balance (Rs)</b></InputLabel>
                            </Grid>
                            <Grid item md={1} xs={12}>
                              <InputLabel >{": "}
                                <CountUp decimals={2} separator=',' end={calOutOfBalance()} duration={.1} />
                              </InputLabel>
                            </Grid>
                          </Grid>
                          <br />
                          <Grid container md={12} spacing={2} style={{ marginLeft: '1rem' }}>
                            <Grid item md={2} xs={12} style={{ marginLeft: '10px' }}>
                              <InputLabel ><b>Prepared By</b></InputLabel>
                            </Grid>
                            <Grid item md={2} xs={12}>
                              <InputLabel >{isUpdate ? ": " + generalJournal.preparedBy : ": " + findLoginUser()}</InputLabel>
                            </Grid>
                            {isUpdate ?
                              <Grid item md={2} xs={12}>
                                <InputLabel ><b>Updated By</b></InputLabel>
                              </Grid> : null}
                            {isUpdate ?
                              <Grid item md={2} xs={12}>
                                <InputLabel >{": " + findLoginUser()}</InputLabel>
                              </Grid> : null}
                          </Grid>
                          <br />
                        </Box>
                      </CardContent>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          color="primary"
                          id="btnCancel"
                          variant="contained"
                          style={{ marginRight: '1rem' }}
                          className={classes.colorCancel}
                          onClick={() => Cancel()}
                        >
                          Cancel
                        </Button>
                        {!isUpdate ?
                          <Button
                            color="primary"
                            id="btnRecordAndNew"
                            type="submit"
                            variant="contained"
                            style={{ marginRight: '1rem' }}
                            className={classes.colorRecordAndNew}
                            onClick={RecordAndNew}
                          >
                            Record and New
                          </Button> : null}
                        {permissionList.isApproveButtonEnabled == false && !isUpdate ?
                          <Button
                            color="primary"
                            id="btnRecord"
                            type="submit"
                            variant="contained"
                            style={{ marginRight: '1rem' }}
                            className={classes.colorRecord}
                            onClick={RecordClick}
                          >
                            Record
                          </Button> : null}
                        {permissionList.isApproveButtonEnabled == true && !isUpdate ?
                          <Button
                            color="primary"
                            id="btnRecord"
                            type="submit"
                            variant="contained"
                            style={{ marginRight: '1rem' }}
                            className={classes.colorRecord}
                            onClick={ApproveClick}
                          >
                            Approve
                          </Button> : null}
                        {isUpdate && status != 2 ?
                          <Button
                            color="primary"
                            id="btnRecord"
                            type="submit"
                            variant="contained"
                            style={{ marginRight: '1rem' }}
                            className={classes.colorRecord}
                          >
                            Update
                          </Button> : null}
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
