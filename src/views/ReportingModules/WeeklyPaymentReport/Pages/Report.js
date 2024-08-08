import React, { useState, useEffect, useRef } from 'react';
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
    TableSortLabel
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import { Formik } from 'formik';
import * as Yup from "yup";
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePDF';
import { LoadingComponent } from 'src/utils/newLoader';
import { useAlert } from "react-alert";
import tokenDecoder from '../../../../utils/tokenDecoder';
import TablePagination from '@material-ui/core/TablePagination';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import xlsx from 'json-as-xlsx';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { isSaturday, isSunday } from 'date-fns';
import moment from 'moment';
import { CustomMultiSelect } from 'src/utils/CustomMultiSelect';
import { confirmAlert } from 'react-confirm-alert';

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

const screenCode = 'WEEKLYPAYMENTREPORT';

export default function WeeklyPaymentReport(props) {

    const [selectedOptionsBook, setSelectedOptionsBook] = useState([]);
    const getOptionLabelBook = option => `${option.label}`;
    const getOptionDisabledBook = option => option.value === "foo";
    const handleToggleOptionBook = selectedOptions =>
        setSelectedOptionsBook(selectedOptions);
    const handleClearOptionsBook = () => setSelectedOptionsBook([]);
    const handleSelectAllBook = isSelected => {
        if (isSelected) {
            setSelectedOptionsBook(books);
        } else {
            handleClearOptionsBook();
        }
    };
    const [selectedOptions1, setSelectedOptions1] = useState([]);
    const getOptionLabel1 = option => `${option.label}`;
    const getOptionDisabled1 = option => option.value === "foo";
    const handleToggleOption1 = selectedOptions =>
        setSelectedOptions1(selectedOptions);
    const handleClearOptions1 = () => setSelectedOptions1([]);
    const handleSelectAll1 = isSelected => {
        if (isSelected) {
            setSelectedOptions1(gangs);
        } else {
            handleClearOptions1();
        }
    };
    const [selectedOptions, setSelectedOptions] = useState([]);
    const getOptionLabel = option => `${option.label}`;
    const getOptionDisabled = option => option.value === "foo";
    const handleToggleOption = selectedOptions =>
        setSelectedOptions(selectedOptions);
    const handleClearOptions = () => setSelectedOptions([]);
    const handleSelectAll = isSelected => {
        if (isSelected) {
            setSelectedOptions(empType);
        } else {
            handleClearOptions();
        }
    };

    const [selectedOptionsEmpCategory, setSelectedOptionsEmpCategory] = useState([]);
    const getOptionLabelEmpCategory = option => `${option.label}`;
    const getOptionDisabledEmpCategory = option => option.value === "foo";
    const handleToggleOptionEmpCategory = selectedOptions =>
        setSelectedOptionsEmpCategory(selectedOptions);
    const handleClearOptionsEmpCategory = () => setSelectedOptionsEmpCategory([]);
    const handleSelectAllEmpCategory = isSelected => {
        if (isSelected) {
            setSelectedOptionsEmpCategory(employeeSubCategoryMapping);
        } else {
            handleClearOptionsEmpCategory();
        }
    };

    const [title, setTitle] = useState("Weekly Payment Report")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [gardens, setGardens] = useState([]);
    const [costCenters, setCostCenters] = useState();
    const [dailylabourData, setDailylabourData] = useState([]);
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [gangs, setGangs] = useState([]);
    const [satDate, setSatDate] = useState();
    const [sunDate, setSunDate] = useState();
    const [monDate, setMonDate] = useState();
    const [tueDate, setTueDate] = useState();
    const [wedDate, setWedDate] = useState();
    const [thuDate, setThuDate] = useState();
    const [friDate, setFriDate] = useState();
    const [books, setbooks] = useState([]);
    const [ishidden, setishidden] = useState(true);
    const clr = (value, int) => {
        if (value == 0) {
            return "#FEFFB8"
        }
        else if (int !== null) {
            return "#FFD3F9"
        }
        else {
            return "#FFFFFF"
        }
    }
    const [open, setOpen] = React.useState(true);
    const [empType, setEmpType] = useState([]);
    const [employeeSubCategoryMapping, setEmployeeSubCategoryMapping] = useState([]);
    const [payPoints, setPayPoints] = useState([]);
    const [otherdeduction, setOtherdeduction] = useState([]);
    const [elecdeduction, setElecdeduction] = useState([]);
    const isDayDisabled = (date) => {
        return !isSunday(date);
    };
    const curr = new Date;
    const first = curr.getDate() - curr.getDay();
    const last = first - 1;
    const friday = first + 5;
    const lastday = new Date(curr.setDate(last)).toISOString().substr(0, 10);
    const friday1 = new Date(curr.setDate(friday)).toISOString().substr(0, 10);
    const [dailylabourDataList, setDailylabourDataList] = useState({
        fromDate: lastday,
        toDate: friday1,
        empTypeID: '0',
        employeeSubCategoryMappingID: '0',
        registrationNumber: '',
        groupID: '0',
        gardenID: '0',
        costCenterID: '0',
        payPointID: '0',
        bookNumber: '',
        gangID: '0',
        count: ''
    })
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        fromDate: '',
        toDate: '',
        empTypeName: '',
        empSubTypeName: '',
        groupName: '',
        gardenName: '',
        costCenterName: '',
        gangName: '',
        registrationNumber: '',
        bookNumber: '',
        payPointName: ''
    })
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
        isCompleteButtonEnabled: false
    });
    const componentRef = useRef();
    const navigate = useNavigate();
    const alert = useAlert();
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);
    const [totalValues, setTotalValues] = useState({
        totalPayGross: 0,
        totalNetPay: 0,
        totalPayble: 0,
        totalBFwd: 0,
        totalWages: 0,
        totalAllowance: 0,
        totalOvertime: 0,
        totalPfBasic: 0,
        totalPF: 0,
        totalBCSU: 0,
        totalDeduction: 0,
        totalCFWD: 0,
        totalSat: 0,
        totalSun: 0,
        totalMon: 0,
        totalTue: 0,
        totalWed: 0,
        totalThu: 0,
        totalFri: 0,
        totalExAllowance: 0,
        totalelec: 0,
        totalOther: 0,
        totalDayAddtion: 0,
        totalDayDeduction: 0,
        totalKhethQty: 0,
        totalRationQty: 0,
        totalCashWages: 0
    });


    const [orderBy, setOrderBy] = useState("registrationNumber");
    const [order, setOrder] = useState("asc");

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission(), getBookDetails());
    }, []);

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID());
        trackPromise(GetDivisionDetailsByGroupID());
    }, [dailylabourDataList.groupID]);

    useEffect(() => {
        setDailylabourDataList((prevState) => ({
            ...prevState,
            costCenterID: "0"
        }));
    }, [dailylabourDataList.groupID]);

    useEffect(() => {
        trackPromise(
            getCostCenterDetailsByGardenID()
        )
    }, [dailylabourDataList.gardenID]);

    useEffect(() => {
        setDailylabourData([])
        setSatDate("")
        setMonDate("")
        setTueDate("")
        setWedDate("")
        setThuDate("")
    }, [dailylabourDataList]);

    useEffect(() => {
        setDailylabourData([]);
        setSatDate("")
        setMonDate("")
        setTueDate("")
        setWedDate("")
        setThuDate("")
    }, [selectedOptions, selectedOptions1, selectedOptionsBook, selectedOptionsEmpCategory]);

    useEffect(() => {
        if (dailylabourDataList.costCenterID != 0) {
            getGangDetailsByDivisionID();
        }
    }, [dailylabourDataList.costCenterID]);

    useEffect(() => {
        if (dailylabourData.length != 0) {
            calculateTotalQty()
        }
    }, [dailylabourData]);

    const handleLimitChange = (event) => {
        setLimit(event.target.value);
    };
    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };
    const handleClose = () => {
        setOpen(false);
    };

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWWEEKLYPAYMENTREPORT');

        if (isAuthorized === undefined) {
            navigate('/404');
        }
        var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');
        var isCompleteButtonEnabled = permissions.find(p => p.permissionCode == 'VIEWCOMPLETEBUTTON');
        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
            isCompleteButtonEnabled: isCompleteButtonEnabled !== undefined
        });

        setDailylabourDataList({
            ...dailylabourDataList,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            gardenID: parseInt(tokenService.getFactoryIDFromToken())
        })

        getEmployeeTypesForDropdown()
        GetAllEmployeeSubCategoryMapping()
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(dailylabourDataList.groupID);
        setGardens(response);
    };

    async function getEmployeeTypesForDropdown() {
        const result = await services.getEmployeeTypesForDropdown();
        var newOptionArray = empType;
        for (var i = 0; i < result.length; i++) {
            newOptionArray.push({ label: result[i].employeeTypeName, value: result[i].employeeTypeID })
        }
        setEmpType(newOptionArray);
    }

    async function GetDivisionDetailsByGroupID() {
        const result = await services.GetDivisionDetailsByGroupID(dailylabourDataList.groupID);
        setPayPoints(result)
    }

    async function GetAllEmployeeSubCategoryMapping() {
        const result = await services.GetAllEmployeeSubCategoryMapping();
        var newOptionArray = employeeSubCategoryMapping;
        for (var i = 0; i < result.length; i++) {
            newOptionArray.push({ label: result[i].employeeSubCategoryName, value: result[i].employeeSubCategoryMappingID })
        }
        setEmployeeSubCategoryMapping(newOptionArray)
    }

    async function getGangDetailsByDivisionID() {
        var response = await services.getGangDetailsByDivisionID(dailylabourDataList.costCenterID);
        var newOptionArray = gangs;
        for (var i = 0; i < response.length; i++) {
            newOptionArray.push({ label: response[i].gangName, value: response[i].gangID })
        }
        setGangs(newOptionArray);
    };

    async function getBookDetails() {
        var response = await services.getBookDetailsForDropDown();
        var newOptionArray = books;
        var bookID = 1;
        for (var i = 0; i < response.length; i++) {
            newOptionArray.push({ label: response[i].bookName, value: bookID });
            bookID++;
        }
        setbooks(newOptionArray);
    };

    async function getCostCenterDetailsByGardenID() {
        var response = await services.getDivisionDetailsByEstateID(dailylabourDataList.gardenID);
        const elementCount = response.reduce((count) => count + 1, 0);
        var generated = generateDropDownMenu(response)
        if (elementCount === 1) {
            setDailylabourDataList((prevState) => ({
                ...prevState,
                costCenterID: generated[0].props.value,
            }));
        }
        setCostCenters(response);
    };

    function getWeekDates() {
        var date1 = dailylabourDataList.fromDate;
        date1.setDate(date1.getDate());
        setSunDate(moment(date1).format('MM/DD'))

        var date2 = dailylabourDataList.fromDate;
        date1.setDate(date1.getDate() + 1);
        setMonDate(moment(date2).format('MM/DD'))

        var date3 = dailylabourDataList.fromDate;
        date2.setDate(date2.getDate() + 1);
        setTueDate(moment(date3).format('MM/DD'))

        var date4 = dailylabourDataList.fromDate;
        date3.setDate(date3.getDate() + 1);
        setWedDate(moment(date4).format('MM/DD'))

        var date5 = dailylabourDataList.fromDate;
        date4.setDate(date5.getDate() + 1);
        setThuDate(moment(date5).format('MM/DD'))

        var date6 = dailylabourDataList.fromDate;
        date5.setDate(date5.getDate() + 1);
        setFriDate(moment(date6).format('MM/DD'))

        var date7 = dailylabourDataList.fromDate;
        date6.setDate(date6.getDate() + 1);
        setSatDate(moment(date7).format('MM/DD'))

        var date8 = dailylabourDataList.fromDate;
        date7.setDate(date7.getDate() - 6);

    }

    function handleDateChange(value) {

        setDailylabourDataList({
            ...dailylabourDataList,
            fromDate: value
        });
    }

    function calculateToDate() {
        const calDate = new Date(dailylabourDataList.fromDate);
        calDate.setDate(calDate.getDate() + 6);
        setDailylabourDataList({
            ...dailylabourDataList,
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

    async function GetDetails() {

        getWeekDates()
        let model = {
            groupID: parseInt(dailylabourDataList.groupID),
            gardenID: parseInt(dailylabourDataList.gardenID),
            payPointID: parseInt(dailylabourDataList.payPointID),
            registrationNumber: (dailylabourDataList.registrationNumber),
            fromDate: new Date(dailylabourDataList.fromDate),
            toDate: new Date(dailylabourDataList.toDate),
            bookNumber: selectedOptionsBook.map(x => x.label).join(','),
            gangID: selectedOptions1.map(x => x.value).join(','),
            employeeTypeID: selectedOptions.map(x => x.value).join(','),
            employeeSubCategoryMappingID: selectedOptionsEmpCategory.map(x => x.value).join(', '),
            count: parseInt(dailylabourDataList.count)
        }

        getSelectedDropdownValuesForReport(model);
        const response = await services.GetDailyLabourDetails(model);
        if (response.statusCode == "Success" && response.data != null) {
            const deductions = response.data[0].deductionTypeListModels;
            const otherDeduction = deductions.find(x => x.deductionTypeCode === "005");
            let otherArr = [];
            otherArr.push(otherDeduction)
            setOtherdeduction(otherArr);
            const eleDeduction = deductions.find(x => x.deductionTypeCode === "004");
            let elecrArr = [];
            elecrArr.push(eleDeduction)
            setElecdeduction(elecrArr);
            const groupedData = [];
            response.data.forEach(record => {
                const existingGroup = groupedData.find(group => group.employeeID === record.employeeID);
                if (existingGroup) {
                    if (record.paymentDay === "Mon") {
                        if (record.attendanceJobTypeID !== 2) {
                            existingGroup.MonTotal = record.grossAmount;
                            existingGroup.MonPf = record.pfDeductionAmount;
                            existingGroup.MonOver = record.overKGAmount;
                            existingGroup.MonDate = record.date;
                            existingGroup.MonL = record.shortForm;
                            existingGroup.MonOt = record.otAmount;
                            existingGroup.MonAll = record.allowance;
                            existingGroup.MonGAll = record.gardenAllowance;
                            existingGroup.MonAdd = record.addition;
                            existingGroup.MonDed = record.deduction;
                        }
                        else {
                            existingGroup.MonTotalL = record.grossAmount;
                            existingGroup.MonPf = record.pfDeductionAmount;
                            existingGroup.MonOver = record.overKGAmount;
                            existingGroup.MonDate = record.date;
                            existingGroup.MonL = record.shortForm;
                            existingGroup.MonOt = record.otAmount;
                            existingGroup.MonAll = record.allowance;
                            existingGroup.MonGAll = record.gardenAllowance;
                            existingGroup.MonAdd = record.addition;
                            existingGroup.MonDed = record.deduction;
                        }
                    } else if (record.paymentDay === "Tue") {
                        if (record.attendanceJobTypeID !== 2) {
                            existingGroup.TueTotal = record.grossAmount;
                            existingGroup.TuePf = record.pfDeductionAmount;
                            existingGroup.TueOver = record.overKGAmount;
                            existingGroup.TueDate = record.date;
                            existingGroup.TueL = record.shortForm;
                            existingGroup.TueOt = record.otAmount;
                            existingGroup.TueAll = record.allowance;
                            existingGroup.TueGAll = record.gardenAllowance;
                            existingGroup.TueAdd = record.addition;
                            existingGroup.TueDed = record.deduction;
                        }
                        else {
                            existingGroup.TueTotalL = record.grossAmount;
                            existingGroup.TuePf = record.pfDeductionAmount;
                            existingGroup.TueOver = record.overKGAmount;
                            existingGroup.TueDate = record.date;
                            existingGroup.TueL = record.shortForm;
                            existingGroup.TueOt = record.otAmount;
                            existingGroup.TueAll = record.allowance;
                            existingGroup.TueGAll = record.gardenAllowance;
                            existingGroup.TueAdd = record.addition;
                            existingGroup.TueDed = record.deduction;
                        }
                    } else if (record.paymentDay === "Wed") {
                        if (record.attendanceJobTypeID !== 2) {
                            existingGroup.WedTotal = record.grossAmount;
                            existingGroup.WedPf = record.pfDeductionAmount;
                            existingGroup.WedOver = record.overKGAmount;
                            existingGroup.WedDate = record.date;
                            existingGroup.WedL = record.shortForm;
                            existingGroup.WedOt = record.otAmount;
                            existingGroup.WedAll = record.allowance;
                            existingGroup.WedGAll = record.gardenAllowance;
                            existingGroup.WedAdd = record.addition;
                            existingGroup.WedDed = record.deduction;
                        }
                        else {
                            existingGroup.WedTotalL = record.grossAmount;
                            existingGroup.WedPf = record.pfDeductionAmount;
                            existingGroup.WedOver = record.overKGAmount;
                            existingGroup.WedDate = record.date;
                            existingGroup.WedL = record.shortForm;
                            existingGroup.WedOt = record.otAmount;
                            existingGroup.WedAll = record.allowance;
                            existingGroup.WedGAll = record.gardenAllowance;
                            existingGroup.WedAdd = record.addition;
                            existingGroup.WedDed = record.deduction;
                        }
                    } else if (record.paymentDay === "Thu") {
                        if (record.attendanceJobTypeID !== 2) {
                            existingGroup.ThuTotal = record.grossAmount;
                            existingGroup.ThuPf = record.pfDeductionAmount;
                            existingGroup.ThuOver = record.overKGAmount;
                            existingGroup.ThuDate = record.date;
                            existingGroup.ThuL = record.shortForm;
                            existingGroup.ThuOt = record.otAmount;
                            existingGroup.ThuAll = record.allowance;
                            existingGroup.ThuGAll = record.gardenAllowance;
                            existingGroup.ThuAdd = record.addition;
                            existingGroup.ThuDed = record.deduction;
                        }
                        else {
                            existingGroup.ThuTotalL = record.grossAmount;
                            existingGroup.ThuPf = record.pfDeductionAmount;
                            existingGroup.ThuOver = record.overKGAmount;
                            existingGroup.ThuDate = record.date;
                            existingGroup.ThuL = record.shortForm;
                            existingGroup.ThuOt = record.otAmount;
                            existingGroup.ThuAll = record.allowance;
                            existingGroup.ThuGAll = record.gardenAllowance;
                            existingGroup.ThuAdd = record.addition;
                            existingGroup.ThuDed = record.deduction;
                        }
                    } else if (record.paymentDay === "Fri") {
                        if (record.attendanceJobTypeID !== 2) {
                            existingGroup.FriTotal = record.grossAmount;
                            existingGroup.FriPf = record.pfDeductionAmount;
                            existingGroup.FriOver = record.overKGAmount;
                            existingGroup.FriDate = record.date;
                            existingGroup.FriL = record.shortForm;
                            existingGroup.FriOt = record.otAmount;
                            existingGroup.FriAll = record.allowance;
                            existingGroup.FriGAll = record.gardenAllowance;
                            existingGroup.FriAdd = record.addition;
                            existingGroup.FriDed = record.deduction;
                        }
                        else {
                            existingGroup.FriTotalL = record.grossAmount;
                            existingGroup.FriPf = record.pfDeductionAmount;
                            existingGroup.FriOver = record.overKGAmount;
                            existingGroup.FriDate = record.date;
                            existingGroup.FriL = record.shortForm;
                            existingGroup.FriOt = record.otAmount;
                            existingGroup.FriAll = record.allowance;
                            existingGroup.FriGAll = record.gardenAllowance;
                            existingGroup.FriAdd = record.addition;
                            existingGroup.FriDed = record.deduction;
                        }
                    } else if (record.paymentDay === "Sat") {
                        if (record.attendanceJobTypeID !== 2) {
                            existingGroup.SatTotal = record.grossAmount;
                            existingGroup.SatPf = record.pfDeductionAmount;
                            existingGroup.SatOver = record.overKGAmount;
                            existingGroup.SatDate = record.date;
                            existingGroup.SatL = record.shortForm;
                            existingGroup.SatOt = record.otAmount;
                            existingGroup.SatAll = record.allowance;
                            existingGroup.SatGAll = record.gardenAllowance;
                            existingGroup.SatAdd = record.addition;
                            existingGroup.SatDed = record.deduction;
                        }
                        else {
                            existingGroup.SatTotalL = record.grossAmount;
                            existingGroup.SatPf = record.pfDeductionAmount;
                            existingGroup.SatOver = record.overKGAmount;
                            existingGroup.SatDate = record.date;
                            existingGroup.SatL = record.shortForm;
                            existingGroup.SatOt = record.otAmount;
                            existingGroup.SatAll = record.allowance;
                            existingGroup.SatGAll = record.gardenAllowance;
                            existingGroup.SatAdd = record.addition;
                            existingGroup.SatDed = record.deduction;
                        }
                    } else if (record.paymentDay === "Sun") {
                        if (record.attendanceJobTypeID !== 2) {
                            existingGroup.SunTotal = record.grossAmount;
                            existingGroup.SunPf = record.pfDeductionAmount;
                            existingGroup.SunOver = record.overKGAmount;
                            existingGroup.SunDate = record.date;
                            existingGroup.SunL = record.shortForm;
                            existingGroup.SunOt = record.otAmount;
                            existingGroup.SunAll = record.allowance;
                            existingGroup.SunGAll = record.gardenAllowance;
                            existingGroup.SunAdd = record.addition;
                            existingGroup.SunDed = record.deduction;
                        }
                        else {
                            existingGroup.SunTotalL = record.grossAmount;
                            existingGroup.SunPf = record.pfDeductionAmount;
                            existingGroup.SunOver = record.overKGAmount;
                            existingGroup.SunDate = record.date;
                            existingGroup.SunL = record.shortForm;
                            existingGroup.SunOt = record.otAmount;
                            existingGroup.SunAll = record.allowance;
                            existingGroup.SunGAll = record.gardenAllowance;
                            existingGroup.SunAdd = record.addition;
                            existingGroup.SunDed = record.deduction;
                        }
                    }
                } else {
                    const newGroup = {
                        employeeID: record.employeeID,
                        registrationNumber: record.registrationNumber,
                        khethLandDeductionQuantity: record.khethLandDeductionQuantity,
                        rationQuantity: record.rationQuantity,
                        firstName: record.firstName,
                        allowance: record.allowance,
                        lessKGAmount: record.lessKGAmount,
                        overKGAmount: record.overKGAmount,
                        overTime: record.overTime,
                        paymentDay: record.paymentDay,
                        pfDeductionAmount: record.pfDeductionAmount,
                        bcsuAmount: record.bcsuAmount,
                        employeeTypeName: record.employeeTypeName,
                        employeeTypeID: record.employeeTypeID,
                        grossAmount: record.grossAmount,
                        pfNumber: record.pfNumber,
                        leaveType: record.shortForm,
                        paymentRevisionNo: record.paymentRevisionNo,
                        gardenAllowance: record.gardenAllowance,
                        isEPFEnable: record.isEPFEnable,
                        jobTypeID: record.jobTypeID,
                        otAmount: record.otAmount,
                        addition: record.addition,
                        deduction: record.deduction,
                        date: record.date,
                        createdBy: tokenDecoder.getUserIDFromToken(),
                        cfAmount: record.cfAmount,
                        attendanceJobTypeID: record.attendanceJobTypeID,
                        eleDeduction: eleDeduction.deductionAmount === undefined ? 0 : eleDeduction.deductionAmount,
                        otherDeduction: otherDeduction.deductionAmount === undefined ? 0 : otherDeduction.deductionAmount,

                        MonTotal: (record.paymentDay === "Mon" && record.attendanceJobTypeID !== 2) ? record.grossAmount : 0,
                        TueTotal: (record.paymentDay === "Tue" && record.attendanceJobTypeID !== 2) ? record.grossAmount : 0,
                        WedTotal: (record.paymentDay === "Wed" && record.attendanceJobTypeID !== 2) ? record.grossAmount : 0,
                        ThuTotal: (record.paymentDay === "Thu" && record.attendanceJobTypeID !== 2) ? record.grossAmount : 0,
                        FriTotal: (record.paymentDay === "Fri" && record.attendanceJobTypeID !== 2) ? record.grossAmount : 0,
                        SatTotal: (record.paymentDay === "Sat" && record.attendanceJobTypeID !== 2) ? record.grossAmount : 0,
                        SunTotal: (record.paymentDay === "Sun" && record.attendanceJobTypeID !== 2) ? record.grossAmount : 0,

                        MonTotalL: (record.paymentDay === "Mon" && record.attendanceJobTypeID == 2) ? record.grossAmount : 0,
                        TueTotalL: (record.paymentDay === "Tue" && record.attendanceJobTypeID == 2) ? record.grossAmount : 0,
                        WedTotalL: (record.paymentDay === "Wed" && record.attendanceJobTypeID == 2) ? record.grossAmount : 0,
                        ThuTotalL: (record.paymentDay === "Thu" && record.attendanceJobTypeID == 2) ? record.grossAmount : 0,
                        FriTotalL: (record.paymentDay === "Fri" && record.attendanceJobTypeID == 2) ? record.grossAmount : 0,
                        SatTotalL: (record.paymentDay === "Sat" && record.attendanceJobTypeID == 2) ? record.grossAmount : 0,
                        SunTotalL: (record.paymentDay === "Sun" && record.attendanceJobTypeID == 2) ? record.grossAmount : 0,

                        MonPf: record.paymentDay === "Mon" ? record.pfDeductionAmount : 0,
                        TuePf: record.paymentDay === "Tue" ? record.pfDeductionAmount : 0,
                        WedPf: record.paymentDay === "Wed" ? record.pfDeductionAmount : 0,
                        ThuPf: record.paymentDay === "Thu" ? record.pfDeductionAmount : 0,
                        FriPf: record.paymentDay === "Fri" ? record.pfDeductionAmount : 0,
                        SatPf: record.paymentDay === "Sat" ? record.pfDeductionAmount : 0,
                        SunPf: record.paymentDay === "Sun" ? record.pfDeductionAmount : 0,

                        MonOver: record.paymentDay === "Mon" ? record.overKGAmount : 0,
                        TueOver: record.paymentDay === "Tue" ? record.overKGAmount : 0,
                        WedOver: record.paymentDay === "Wed" ? record.overKGAmount : 0,
                        ThuOver: record.paymentDay === "Thu" ? record.overKGAmount : 0,
                        FriOver: record.paymentDay === "Fri" ? record.overKGAmount : 0,
                        SatOver: record.paymentDay === "Sat" ? record.overKGAmount : 0,
                        SunOver: record.paymentDay === "Sun" ? record.overKGAmount : 0,

                        MonL: record.paymentDay === "Mon" ? record.shortForm : null,
                        TueL: record.paymentDay === "Tue" ? record.shortForm : null,
                        WedL: record.paymentDay === "Wed" ? record.shortForm : null,
                        ThuL: record.paymentDay === "Thu" ? record.shortForm : null,
                        FriL: record.paymentDay === "Fri" ? record.shortForm : null,
                        SatL: record.paymentDay === "Sat" ? record.shortForm : null,
                        SunL: record.paymentDay === "Sun" ? record.shortForm : null,

                        MonOt: record.paymentDay === "Mon" ? record.otAmount : null,
                        TueOt: record.paymentDay === "Tue" ? record.otAmount : null,
                        WedOt: record.paymentDay === "Wed" ? record.otAmount : null,
                        ThuOt: record.paymentDay === "Thu" ? record.otAmount : null,
                        FriOt: record.paymentDay === "Fri" ? record.otAmount : null,
                        SatOt: record.paymentDay === "Sat" ? record.otAmount : null,
                        SunOt: record.paymentDay === "Sun" ? record.otAmount : null,

                        MonAll: record.paymentDay === "Mon" ? record.allowance : null,
                        TueAll: record.paymentDay === "Tue" ? record.allowance : null,
                        WedAll: record.paymentDay === "Wed" ? record.allowance : null,
                        ThuAll: record.paymentDay === "Thu" ? record.allowance : null,
                        FriAll: record.paymentDay === "Fri" ? record.allowance : null,
                        SatAll: record.paymentDay === "Sat" ? record.allowance : null,
                        SunAll: record.paymentDay === "Sun" ? record.allowance : null,

                        MonGAll: record.paymentDay === "Mon" ? record.gardenAllowance : null,
                        TueGAll: record.paymentDay === "Tue" ? record.gardenAllowance : null,
                        WedGAll: record.paymentDay === "Wed" ? record.gardenAllowance : null,
                        ThuGAll: record.paymentDay === "Thu" ? record.gardenAllowance : null,
                        FriGAll: record.paymentDay === "Fri" ? record.gardenAllowance : null,
                        SatGAll: record.paymentDay === "Sat" ? record.gardenAllowance : null,
                        SunGAll: record.paymentDay === "Sun" ? record.gardenAllowance : null,

                        MonAdd: record.paymentDay === "Mon" ? record.addition : null,
                        TueAdd: record.paymentDay === "Tue" ? record.addition : null,
                        WedAdd: record.paymentDay === "Wed" ? record.addition : null,
                        ThuAdd: record.paymentDay === "Thu" ? record.addition : null,
                        FriAdd: record.paymentDay === "Fri" ? record.addition : null,
                        SatAdd: record.paymentDay === "Sat" ? record.addition : null,
                        SunAdd: record.paymentDay === "Sun" ? record.addition : null,

                        MonDed: record.paymentDay === "Mon" ? record.deduction : null,
                        TueDed: record.paymentDay === "Tue" ? record.deduction : null,
                        WedDed: record.paymentDay === "Wed" ? record.deduction : null,
                        ThuDed: record.paymentDay === "Thu" ? record.deduction : null,
                        FriDed: record.paymentDay === "Fri" ? record.deduction : null,
                        SatDed: record.paymentDay === "Sat" ? record.deduction : null,
                        SunDed: record.paymentDay === "Sun" ? record.deduction : null,

                        MonDate: record.paymentDay === "Mon" ? moment(record.date).format('MM/DD') : null,
                        TueDate: record.paymentDay === "Tue" ? moment(record.date).format('MM/DD') : null,
                        WedDate: record.paymentDay === "Wed" ? moment(record.date).format('MM/DD') : null,
                        ThuDate: record.paymentDay === "Thu" ? moment(record.date).format('MM/DD') : null,
                        FriDate: record.paymentDay === "Fri" ? moment(record.date).format('MM/DD') : null,
                        SatDate: record.paymentDay === "Sat" ? moment(record.date).format('MM/DD') : null,
                        SunDate: record.paymentDay === "Sun" ? moment(record.date).format('MM/DD') : null,
                    };
                    groupedData.push(newGroup);
                }
            });
            groupedData.forEach(x => {
                var monPFB = x.MonTotal > parseFloat(170).toFixed(2) ? 170 : x.MonTotal
                var tuePFB = x.TueTotal > parseFloat(170).toFixed(2) ? 170 : x.TueTotal
                var wedPFB = x.WedTotal > parseFloat(170).toFixed(2) ? 170 : x.WedTotal
                var thuPFB = x.ThuTotal > parseFloat(170).toFixed(2) ? 170 : x.ThuTotal
                var friPFB = x.FriTotal > parseFloat(170).toFixed(2) ? 170 : x.FriTotal
                var satPFB = x.SatTotal > parseFloat(170).toFixed(2) ? 170 : x.SatTotal
                var sunPFB = x.SunTotal > parseFloat(170).toFixed(2) ? 170 : x.SunTotal

                x.totalOverTime = x.MonOver + x.TueOver + x.WedOver + x.ThuOver + x.FriOver
                x.wagesTotal = x.MonTotal + x.TueTotal + x.WedTotal + x.ThuTotal + x.FriTotal + x.SatTotal + x.SunTotal
                x.wagesCashTotal = x.MonTotalL + x.TueTotalL + x.WedTotalL + x.ThuTotalL + x.FriTotalL + x.SatTotalL + x.SunTotalL
                x.overTime = x.MonOt + x.TueOt + x.WedOt + x.ThuOt + x.FriOt + x.SatOt + x.SunOt
                x.totAllowance = x.MonAll + x.TueAll + x.WedAll + x.ThuAll + x.FriAll + x.SatAll + x.SunAll
                x.totGAllowance = x.MonGAll + x.TueGAll + x.WedGAll + x.ThuGAll + x.FriGAll + x.SatGAll + x.SunGAll
                x.totalAdd = x.MonAdd + x.TueAdd + x.WedAdd + x.ThuAdd + x.FriAdd + x.SatAdd + x.SunAdd
                x.totalGross = (x.wagesTotal + x.wagesCashTotal + x.totAllowance + x.overTime + x.totGAllowance + x.totalAdd) + x.cfAmount
                x.pfDeductionAmount = x.MonPf + x.TuePf + x.WedPf + x.ThuPf + x.FriPf + x.SatPf + x.SunPf
                x.totalDed = x.MonDed + x.TueDed + x.WedDed + x.ThuDed + x.FriDed + x.SatDed + x.SunDed
                x.totalDeduction = (x.pfDeductionAmount + x.bcsuAmount + x.totalDed + x.khethLandDeductionQuantity + x.rationQuantity + (eleDeduction.deductionAmount) + (otherDeduction.deductionAmount))
                x.totalNet = (x.totalGross - x.totalDeduction)
                x.payable = Math.floor((x.totalNet))
                x.broughtForward = (x.totalNet - x.payable) % 1
                x.overTotal = x.MonOver + x.TueOver + x.WedOver + x.ThuOver + x.FriOver + x.SatOver + x.SunOver
                x.baseTotal = x.isEPFEnable == false ? 0 : (x.employeeTypeID == 2 ? 0 : (monPFB + tuePFB + wedPFB + thuPFB + friPFB + satPFB + sunPFB))
            });
            response.data[0].deductionTypeListModels.forEach(x => {
            });
            setDailylabourData(groupedData);
        }
        else {
            alert.error(response.message);
            setDailylabourData([])
        }
    }

    function calculateTotalQty() {
        const totalPayGross = dailylabourData.reduce((accumulator, current) => accumulator + current.totalGross, 0);
        const totalNetPay = dailylabourData.reduce((accumulator, current) => accumulator + current.totalNet, 0);
        const totalPayble = dailylabourData.reduce((accumulator, current) => accumulator + current.payable, 0);
        const totalBFwd = dailylabourData.reduce((accumulator, current) => accumulator + current.broughtForward, 0);
        const totalWages = dailylabourData.reduce((accumulator, current) => accumulator + current.wagesTotal, 0);
        const totalCashWages = dailylabourData.reduce((accumulator, current) => accumulator + current.wagesCashTotal, 0);
        const totalAllowance = dailylabourData.reduce((accumulator, current) => accumulator + current.totAllowance, 0);
        const totalOvertime = dailylabourData.reduce((accumulator, current) => accumulator + current.overTime, 0);
        const totalPfBasic = dailylabourData.reduce((accumulator, current) => accumulator + current.baseTotal, 0);
        const totalPF = dailylabourData.reduce((accumulator, current) => accumulator + current.pfDeductionAmount, 0);
        const totalBCSU = dailylabourData.reduce((accumulator, current) => accumulator + current.bcsuAmount, 0);
        const totalOther = otherdeduction.reduce((accumulator, current) => accumulator + current.deductionAmount, 0);
        const totalelec = elecdeduction.reduce((accumulator, current) => accumulator + current.deductionAmount, 0);
        const totalDeduction = dailylabourData.reduce((accumulator, current) => accumulator + current.totalDeduction, 0);
        const totalDayDeduction = dailylabourData.reduce((accumulator, current) => accumulator + current.totalDed, 0);
        const totalDayAddtion = dailylabourData.reduce((accumulator, current) => accumulator + current.totalAdd, 0);
        const totalKhethQty = dailylabourData.reduce((accumulator, current) => accumulator + current.khethLandDeductionQuantity, 0);
        const totalRationQty = dailylabourData.reduce((accumulator, current) => accumulator + current.rationQuantity, 0);
        const totalCFWD = dailylabourData.reduce((accumulator, current) => accumulator + current.cfAmount, 0);
        const totalSat = dailylabourData.reduce((accumulator, current) => (current.attendanceJobTypeID == 2) ? accumulator + 0 : accumulator + current.SatTotal, 0);
        const totalSun = dailylabourData.reduce((accumulator, current) => (current.attendanceJobTypeID == 2) ? accumulator + 0 : accumulator + current.SunTotal, 0);
        const totalMon = dailylabourData.reduce((accumulator, current) => (current.attendanceJobTypeID == 2) ? accumulator + 0 : accumulator + current.MonTotal, 0);
        const totalTue = dailylabourData.reduce((accumulator, current) => (current.attendanceJobTypeID == 2) ? accumulator + 0 : accumulator + current.TueTotal, 0);
        const totalWed = dailylabourData.reduce((accumulator, current) => (current.attendanceJobTypeID != 2) ? accumulator + current.WedTotal : accumulator + 0, 0);
        const totalThu = dailylabourData.reduce((accumulator, current) => (current.attendanceJobTypeID == 2) ? accumulator + 0 : accumulator + current.ThuTotal, 0);
        const totalFri = dailylabourData.reduce((accumulator, current) => (current.attendanceJobTypeID == 2) ? accumulator + 0 : accumulator + current.FriTotal, 0);
        const totalExAllowance = dailylabourData.reduce((accumulator, current) => accumulator + current.totGAllowance, 0);
        setTotalValues({
            ...totalValues,
            totalPayGross: totalPayGross,
            totalNetPay: totalNetPay,
            totalPayble: totalPayble,
            totalBFwd: totalBFwd,
            totalWages: totalWages,
            totalAllowance: totalAllowance,
            totalOvertime: totalOvertime,
            totalPfBasic: totalPfBasic,
            totalPF: totalPF,
            totalBCSU: totalBCSU,
            totalDeduction: totalDeduction,
            totalCFWD: totalCFWD,
            totalSat: totalSat,
            totalSun: totalSun,
            totalMon: totalMon,
            totalTue: totalTue,
            totalWed: totalWed,
            totalThu: totalThu,
            totalFri: totalFri,
            totalExAllowance: totalExAllowance,
            totalelec: totalelec,
            totalOther: totalOther,
            totalDayDeduction: totalDayDeduction,
            totalDayAddtion: totalDayAddtion,
            totalRationQty: totalRationQty,
            totalKhethQty: totalKhethQty,
            totalCashWages: totalCashWages
        })
    };

    async function createDataForExcel(array) {
        var res = [];
        var csvHeaders = [
            { label: "Sat" + satDate, value: "gangName" },
            { label: "Employee Type", value: "employeeTypeName" },
            { label: "Reg Number", value: "registrationNumber" },
            { label: "Employee Name", value: "firstName" }
        ];
        if (array != null) {
            array.map(x => {
                var vr = {
                    'Reg.No': x.registrationNumber,
                    'Emp.Name': x.firstName,
                    'Emp.Type': x.employeeTypeName,
                    'PF.No': x.pfNumber,
                    'B.FWRD': x.cfAmount.toFixed(2),
                    'Sat': x.SatTotal == 0 ? "A" : x.SatTotal.toFixed(2),
                    'Sun': x.SunTotal == 0 ? "A" : x.SunTotal.toFixed(2),
                    'Mon': x.MonTotal == 0 ? "A" : x.MonTotal.toFixed(2),
                    'Tue': x.TueTotal == 0 ? "A" : x.TueTotal.toFixed(2),
                    'Wed': x.WedTotal == 0 ? "A" : x.WedTotal.toFixed(2),
                    'Thu': x.ThuTotal == 0 ? "A" : x.ThuTotal.toFixed(2),
                    'Fri': x.FriTotal == 0 ? "0.00" : x.FriTotal.toFixed(2),
                    'Wages Total': x.wagesTotal.toFixed(2),
                    'Allowance (BCS)': x.totAllowance.toFixed(2),
                    'Extra Allowance': x.totGAllowance.toFixed(2),
                    'Overtime': x.overTime,
                    'Addition': x.totalAdd,
                    'Gross Pay': x.totalGross.toFixed(2),
                    'PF Basic': x.employeeTypeID == 2 ? 0 : x.baseTotal.toFixed(2),
                    'PF': x.pfDeductionAmount.toFixed(2),
                    'BCSU': x.bcsuAmount.toFixed(2),
                    'Elec': x.eleDeduction.toFixed(2),
                    'Kheth Land Qty': x.khethLandDeductionQuantity.toFixed(2),
                    'Ration': x.rationQuantity.toFixed(2),
                    'Other': x.otherDeduction.toFixed(2),
                    'Deduction': x.totalDed.toFixed(2),
                    'Total Deduction': x.totalDeduction.toFixed(2),
                    'Net Pay': x.totalNet.toFixed(2),
                    'Payable': x.payable.toFixed(2),
                    'C.FWRD': x.broughtForward.toFixed(2),
                };
                res.push(vr);
            });
            var vr = {
                'Reg.No': 'Total',
                'B.FWRD': totalValues.totalCFWD.toFixed(2),
                'Sat': totalValues.totalSat.toFixed(2),
                'Sun': totalValues.totalSun.toFixed(2),
                'Mon': totalValues.totalMon.toFixed(2),
                'Tue': totalValues.totalTue.toFixed(2),
                'Wed': totalValues.totalWed.toFixed(2),
                'Thu': totalValues.totalThu.toFixed(2),
                'Fri': totalValues.totalFri.toFixed(2),
                'Wages Total': totalValues.totalWages.toFixed(2),
                'Allowance (BCS)': totalValues.totalAllowance.toFixed(2),
                'Extra Allowance': totalValues.totalExAllowance.toFixed(2),
                'Overtime': totalValues.totalOvertime.toFixed(2),
                'Addition': totalValues.totalDayAddtion.toFixed(2),
                'Gross Pay': totalValues.totalPayGross.toFixed(2),
                'PF Basic': totalValues.totalPfBasic.toFixed(2),
                'PF': totalValues.totalPF.toFixed(2),
                'BCSU': totalValues.totalBCSU.toFixed(2),
                'Elec': totalValues.totalelec.toFixed(2),
                'Kheth Land Qty': totalValues.totalKhethQty.toFixed(2),
                'Ration': totalValues.totalRationQty.toFixed(2),
                'Other': totalValues.totalOther.toFixed(2),
                'Deduction': totalValues.totalDayDeduction.toFixed(2),
                'Total Deduction': totalValues.totalDeduction.toFixed(2),
                'Net Pay': totalValues.totalNetPay.toFixed(2),
                'Payable': totalValues.totalPayble.toFixed(2),
                'C.FWRD': totalValues.totalBFwd.toFixed(2),


            };
            res.push(vr);
            res.push([]);
            var vr = {
                'Reg.No': 'Location: ' + selectedSearchValues.gardenName,
                'Emp.Name': 'Pay Point: ' + selectedSearchValues.payPointName,
                'Emp.Type': selectedSearchValues.empTypeName === "" ? 'Employee Type: All Employee Types' : 'Employee Type: ' + selectedSearchValues.empTypeName,
                'PF.No': selectedSearchValues.empSubTypeName === "" ? 'Employee SubCategory: All Employee SubCategories' : 'Employee SubCategory: ' + selectedSearchValues.empSubTypeName,
                'B.FWRD': selectedSearchValues.gangName === "" ? 'Duffa: All Duffas' : 'Duffa: ' + selectedSearchValues.gangName,
                'Sun': selectedSearchValues.registrationNumber == "" ? 'Reg.No: All Employees' : 'Reg.No: ' + selectedSearchValues.registrationNumber,
                'Sat': selectedSearchValues.bookName === "" ? 'Book: All Books' : 'Book: ' + selectedSearchValues.bookName,
                'Mon': 'To: ' + selectedSearchValues.toDate,
                'Tue': 'From: ' + selectedSearchValues.fromDate,
            };
            res.push(vr);
        }

        return res;
    }

    async function createFile() {
        setishidden(false);
        var file = await createDataForExcel(dailylabourData);
        var settings = {
            sheetName: 'Weekly Payment Report',
            fileName:
                'Weekly Payment Report - ' +
                selectedSearchValues.fromDate + ' - ' + selectedSearchValues.toDate,
            writeOptions: {}
        };

        let keys = Object.keys(file[0]);
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem });
        });

        let dataA = [
            {
                sheet: 'Weekly Payment Report',
                columns: tempcsvHeaders,
                content: file
            }
        ];

        xlsx(dataA, settings);
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
        setDailylabourDataList({
            ...dailylabourDataList,
            [e.target.name]: value
        });
    }

    function timeout(delay) {
        return new Promise(res => setTimeout(res, delay));
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: groups[searchForm.groupID],
            gardenName: gardens[searchForm.gardenID],
            payPointName: payPoints[searchForm.divisionName],
            empTypeName: selectedOptions.map(x => x.label).join(', '),
            empSubTypeName: selectedOptionsEmpCategory.map(x => x.label).join(', '),
            fromDate: new Date(dailylabourDataList.fromDate).toISOString().substr(0, 10),
            toDate: new Date(dailylabourDataList.toDate).toISOString().substr(0, 10),
            gangName: selectedOptions1.map(x => x.label).join(', '),
            registrationNumber: searchForm.registrationNumber,
            bookName: selectedOptionsBook.map(x => x.label).join(', ')
        })
    }

    async function paymentComplete() {
        const response = await services.completePayment(dailylabourData);

        await timeout(1000);
        if (response.statusCode == "Success") {
            setishidden(true);
            alert.success(response.message);
            GetDetails();
        }
        else {
            alert.error(response.message);
        }
    }

    function confirmPayment() {
        confirmAlert({
            title: 'Payment Completion',
            message: 'Are you sure you want to do this.',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => trackPromise(paymentComplete())
                },
                {
                    label: 'No',
                    onClick: () => handleClose()
                }
            ],
            closeOnEscape: true,
            closeOnClickOutside: true,
        });
    }


    function handleRequestSort(property) {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    function getSortIcon(columnId) {
        if (orderBy === columnId) {
            return order === "asc" ? "" : "";
        }
        return null;
    };

    function sortData(data) {
        const sortedData = [...data];
        sortedData.sort((a, b) => {
            if (order === "asc") {
                return a[orderBy].localeCompare(b[orderBy]);
            } else {
                return b[orderBy].localeCompare(a[orderBy]);
            }
        });
        return sortedData;
    };

    return (
        <Page className={classes.root} title={title}>
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        registrationNumber: dailylabourDataList.registrationNumber,
                        empTypeID: dailylabourDataList.empTypeID,
                        fromDate: dailylabourDataList.fromDate,
                        toDate: dailylabourDataList.toDate,
                        groupID: dailylabourDataList.groupID,
                        gardenID: dailylabourDataList.gardenID,
                        bookNumber: dailylabourDataList.bookNumber,
                        count: dailylabourDataList.count

                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Business Division is required').min("1", 'Business Division is required'),
                            gardenID: Yup.number().required('Location is required').min("1", 'Location is required'),
                            fromDate: Yup.date().required('From Date is required'),
                            toDate: Yup.date().required('To Date is required'),
                            count: Yup.number().required('Count is required')
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
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="groupID">
                                                        Business Division *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.groupID && errors.groupID)}
                                                        fullWidth
                                                        helperText={touched.groupID && errors.groupID}
                                                        name="groupID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={dailylabourDataList.groupID}
                                                        variant="outlined"
                                                        id="groupID"
                                                        size='small'
                                                        InputProps={{
                                                            readOnly: !permissionList.isGroupFilterEnabled ? true : false
                                                        }}
                                                    >
                                                        <MenuItem value="0">--Select Business Division --</MenuItem>
                                                        {generateDropDownMenu(groups)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
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
                                                        value={dailylabourDataList.gardenID}
                                                        variant="outlined"
                                                        id="gardenID"
                                                        size='small'
                                                        InputProps={{
                                                            readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                        }}
                                                    >
                                                        <MenuItem value="0">--Select Location--</MenuItem>
                                                        {generateDropDownMenu(gardens)}
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
                                                        value={dailylabourDataList.payPointID}
                                                        variant="outlined"
                                                        id="payPointID"
                                                        size='small'
                                                    >
                                                        <MenuItem value="0">--Select Pay Point--</MenuItem>
                                                        {generateDropDownMenu(payPoints)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="employeeSubCategoryMappingID">
                                                        Employee Category
                                                    </InputLabel>
                                                    <CustomMultiSelect
                                                        items={employeeSubCategoryMapping}
                                                        getOptionLabel={getOptionLabelEmpCategory}
                                                        getOptionDisabled={getOptionDisabledEmpCategory}
                                                        selectedValues={selectedOptionsEmpCategory}
                                                        placeholder="Employee Category"
                                                        selectAllLabel="Select all"
                                                        onToggleOption={handleToggleOptionEmpCategory}
                                                        onClearOptions={handleClearOptionsEmpCategory}
                                                        onSelectAll={handleSelectAllEmpCategory}
                                                    />
                                                </Grid>
                                                <Grid item md={3} xs={12} >
                                                    <InputLabel shrink id="empTypeID">
                                                        Employee Type
                                                    </InputLabel>
                                                    <CustomMultiSelect
                                                        items={empType}
                                                        getOptionLabel={getOptionLabel}
                                                        getOptionDisabled={getOptionDisabled}
                                                        selectedValues={selectedOptions}
                                                        placeholder="Employee Type"
                                                        selectAllLabel="Select all"
                                                        onToggleOption={handleToggleOption}
                                                        onClearOptions={handleClearOptions}
                                                        onSelectAll={handleSelectAll}
                                                    />
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="gangID">
                                                        Duffa
                                                    </InputLabel>
                                                    <CustomMultiSelect
                                                        items={gangs}
                                                        getOptionLabel={getOptionLabel1}
                                                        getOptionDisabled={getOptionDisabled1}
                                                        selectedValues={selectedOptions1}
                                                        placeholder="Duffa"
                                                        selectAllLabel="Select all"
                                                        onToggleOption={handleToggleOption1}
                                                        onClearOptions={handleClearOptions1}
                                                        onSelectAll={handleSelectAll1}
                                                    />
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="fromDate">
                                                        From Date *
                                                    </InputLabel>
                                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                        <KeyboardDatePicker
                                                            autoOk
                                                            fullWidth
                                                            variant="inline"
                                                            format="yyyy/MM/dd"
                                                            margin="dense"
                                                            id="fromDate"
                                                            value={dailylabourDataList.fromDate}
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
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="count">
                                                        Employee Count *
                                                    </InputLabel>
                                                    <TextField
                                                        error={Boolean(touched.count && errors.count)}
                                                        fullWidth
                                                        helperText={touched.count && errors.count}
                                                        size='small'
                                                        name="count"
                                                        onChange={(e) => handleChange(e)}
                                                        value={dailylabourDataList.count}
                                                        variant="outlined"
                                                        id="count"
                                                    >
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12} >
                                                    <InputLabel shrink id="bookID">
                                                        Book
                                                    </InputLabel>
                                                    <CustomMultiSelect
                                                        items={books}
                                                        getOptionLabel={getOptionLabelBook}
                                                        getOptionDisabled={getOptionDisabledBook}
                                                        selectedValues={selectedOptionsBook}
                                                        placeholder="Book"
                                                        selectAllLabel="Select all"
                                                        onToggleOption={handleToggleOptionBook}
                                                        onClearOptions={handleClearOptionsBook}
                                                        onSelectAll={handleSelectAllBook}
                                                    />
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="registrationNumber">
                                                        Reg.No
                                                    </InputLabel>
                                                    <TextField
                                                        fullWidth
                                                        size='small'
                                                        name="registrationNumber"
                                                        onChange={(e) => handleChange(e)}
                                                        value={dailylabourDataList.registrationNumber}
                                                        variant="outlined"
                                                        id="registrationNumber"
                                                    >
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
                                            <Box minWidth={1050}>
                                                {dailylabourData.length > 0 ?
                                                    <TableContainer component={Paper}>
                                                        <Table className={classes.table} aria-label="simple table" size="small">
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }} onClick={() => handleRequestSort("registrationNumber")}>
                                                                        <TableSortLabel
                                                                            active={orderBy === "registrationNumber"}
                                                                            direction={order}
                                                                            onClick={() => handleRequestSort("registrationNumber")}
                                                                        >
                                                                            Reg.No {getSortIcon("registrationNumber")}
                                                                        </TableSortLabel>
                                                                    </TableCell>
                                                                    <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }} onClick={() => handleRequestSort("firstName")}>
                                                                        <TableSortLabel
                                                                            active={orderBy === "firstName"}
                                                                            direction={order}
                                                                            onClick={() => handleRequestSort("firstName")}
                                                                        >
                                                                            Emp.Name {getSortIcon("firstName")}
                                                                        </TableSortLabel>
                                                                    </TableCell>
                                                                    <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>B.FWRD</TableCell>
                                                                    <TableCell align="center" colSpan="8" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Wages</TableCell>
                                                                    <TableCell align="center" colSpan="5" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Other Earnings</TableCell>
                                                                    <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Gross Pay</TableCell>
                                                                    <TableCell align="center" colSpan="6" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Other Deductions</TableCell>
                                                                    <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Net Pay</TableCell>
                                                                    <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Payable</TableCell>
                                                                    <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>C.FWRD</TableCell>
                                                                </TableRow>
                                                                <TableRow>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Sun {sunDate}</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Mon {monDate}</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Tue {tueDate}</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Wed {wedDate}</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Thu {thuDate}</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Fri {friDate}</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Sat {satDate}</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Wages Total</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Allowance (BCS)</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Over Time</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Cash Wages</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Leave Wages</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Others</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>PF/PF Aries</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Ration</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Elec</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Union</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Other</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Total</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {sortData(dailylabourData).slice(page * limit, page * limit + limit).map((row, i) => (
                                                                    <TableRow key={i}
                                                                    >
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.registrationNumber}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.firstName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.cfAmount.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black" }}> {(row.SunTotal == 0) ? ("0.00") : ((row.SunL !== null) ? (row.SunL + " " + row.SunTotal.toFixed(2)) : row.SunTotal.toFixed(2))}</TableCell>
                                                                        <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black", backgroundColor: clr(row.MonTotal, row.MonL) }}> {(row.MonTotal == 0) ? ("A") : ((row.MonL !== null) ? (row.MonL + " " + row.MonTotal.toFixed(2)) : row.MonTotal.toFixed(2))}</TableCell>
                                                                        <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black", backgroundColor: clr(row.TueTotal, row.TueL) }}> {(row.TueTotal == 0) ? ("A") : ((row.TueL !== null) ? (row.TueL + " " + row.TueTotal.toFixed(2)) : row.TueTotal.toFixed(2))}</TableCell>
                                                                        <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black", backgroundColor: clr(row.WedTotal, row.WedL) }}> {(row.WedTotal == 0) ? ("A") : ((row.WedL !== null) ? (row.WedL + " " + row.WedTotal.toFixed(2)) : row.WedTotal.toFixed(2))}</TableCell>
                                                                        <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black", backgroundColor: clr(row.ThuTotal, row.ThuL) }}> {(row.ThuTotal === 0) ? ("A") : ((row.ThuL !== null) ? (row.ThuL + " " + row.ThuTotal.toFixed(2)) : row.ThuTotal.toFixed(2))}</TableCell>
                                                                        <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black", backgroundColor: clr(row.FriTotal, row.FriL) }}> {(row.FriTotal == 0) ? ("A") : ((row.FriL !== null) ? (row.FriL + " " + row.FriTotal.toFixed(2)) : row.FriTotal.toFixed(2))}</TableCell>
                                                                        <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black", backgroundColor: clr(row.SatTotal, row.SatL) }}> {(row.SatTotal == 0) ? ("A") : ((row.SatL !== null) ? (row.SatL + " " + row.SatTotal.toFixed(2)) : row.SatTotal.toFixed(2))}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.wagesTotal.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.totAllowance.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {(row.overTime.toFixed(2))}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.wagesCashTotal.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {(row.totalAdd.toFixed(2))}</TableCell> {/*Temp}*/}
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {(row.totalAdd.toFixed(2))}</TableCell> {/*Temp}*/}
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.totalGross.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.pfDeductionAmount.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.rationQuantity.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.eleDeduction.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.bcsuAmount.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.otherDeduction.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.totalDeduction.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.totalNet.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.payable.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.broughtForward.toFixed(2)}</TableCell>
                                                                    </TableRow>
                                                                )
                                                                )}
                                                                <TableRow>
                                                                    <TableCell align={'center'} colSpan="2" style={{ borderBottom: "none", border: "1px solid black" }}><b>Total</b></TableCell>
                                                                    <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalCFWD.toFixed(2)}</b></TableCell>
                                                                    <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalSun.toFixed(2)} </b></TableCell>
                                                                    <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalMon.toFixed(2)} </b></TableCell>
                                                                    <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalTue.toFixed(2)} </b></TableCell>
                                                                    <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalWed.toFixed(2)} </b></TableCell>
                                                                    <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalThu.toFixed(2)} </b></TableCell>
                                                                    <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalFri.toFixed(2)} </b></TableCell>
                                                                    <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalSat.toFixed(2)} </b></TableCell>
                                                                    <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalWages.toFixed(2)} </b></TableCell>
                                                                    <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalAllowance.toFixed(2)} </b></TableCell>
                                                                    <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalOvertime.toFixed(2)} </b></TableCell>
                                                                    <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalCashWages.toFixed(2)} </b></TableCell>
                                                                    <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {"0.00"} </b></TableCell> {/*Temp}*/}
                                                                    <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalDayAddtion.toFixed(2)} </b></TableCell>
                                                                    <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalPayGross.toFixed(2)} </b></TableCell>
                                                                    <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalPF.toFixed(2)} </b></TableCell>
                                                                    <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalRationQty.toFixed(2)} </b></TableCell>
                                                                    <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalelec.toFixed(2)} </b></TableCell>
                                                                    <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalBCSU.toFixed(2)} </b></TableCell>
                                                                    <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalOther.toFixed(2)} </b></TableCell>
                                                                    <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalDeduction.toFixed(2)} </b></TableCell>
                                                                    <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalNetPay.toFixed(2)} </b></TableCell>
                                                                    <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalPayble.toFixed(2)} </b></TableCell>
                                                                    <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalBFwd.toFixed(2)} </b></TableCell>
                                                                </TableRow>
                                                            </TableBody>
                                                        </Table>

                                                        <TablePagination
                                                            component="div"
                                                            count={dailylabourData.length}
                                                            onChangePage={handlePageChange}
                                                            onChangeRowsPerPage={handleLimitChange}
                                                            page={page}
                                                            rowsPerPage={limit}
                                                            rowsPerPageOptions={[5, 10, 25]}
                                                        />
                                                    </TableContainer>
                                                    : null}
                                            </Box>
                                        </CardContent>
                                        {dailylabourData.length > 0 ?
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                <Button
                                                    color="primary"
                                                    id="btnRecord"
                                                    type="button"
                                                    variant="contained"
                                                    style={{ marginRight: '1rem' }}
                                                    className={classes.colorRecord}
                                                    onClick={createFile}
                                                    size="small"
                                                >
                                                    EXCEL
                                                </Button>
                                                <div>&nbsp;</div>
                                                <ReactToPrint
                                                    documentTitle={"Weekly Payment Report"}
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
                                                {permissionList.isCompleteButtonEnabled && !ishidden ?
                                                    <Button
                                                        color="primary"
                                                        type="button"
                                                        variant="contained"
                                                        onClick={() => (confirmPayment())}
                                                    >
                                                        Payment Complete
                                                    </Button>
                                                    : null}
                                                <div hidden={true}>
                                                    <CreatePDF ref={componentRef}
                                                        searchData={selectedSearchValues} dailylabourData={dailylabourData}
                                                        monDate={monDate} tueDate={tueDate} wedDate={wedDate} thuDate={thuDate}
                                                        friDate={friDate} satDate={satDate} sunDate={sunDate} totalValues={totalValues}
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
    )


}