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
import _ from 'lodash';
import { CustomMultiSelect } from 'src/utils/CustomMultiSelect';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { isSaturday } from 'date-fns';
import moment from 'moment';
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

const screenCode = 'WEEKLYMORNINGCASHPAYMENTREPORT';

export default function WeeklyMorningCashPaymentReport(props) {
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

    const [title, setTitle] = useState("Weekly Morning Cash Payment Report")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [gardens, setGardens] = useState([]);
    const [costCenters, setCostCenters] = useState();
    const [dailylabourData, setDailylabourData] = useState([]);
    const [gangs, setGangs] = useState([]);
    const [empType, setEmpType] = useState([]);
    const [monDate, setMonDate] = useState();
    const [satDate, setSatDate] = useState();
    const [sunDate, setSunDate] = useState();
    const [tueDate, setTueDate] = useState();
    const [wedDate, setWedDate] = useState();
    const [thuDate, setThuDate] = useState();
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [books, setbooks] = useState([]);
    const isDayDisabled = (date) => {
        return !isSaturday(date);
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
        registrationNumber: '',
        groupID: '0',
        gardenID: '0',
        costCenterID: '0',
        bookNumber: '',
        gangID: '0',
        count: ''
    })
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        fromDate: '',
        toDate: '',
        empTypeName: '',
        groupName: '',
        gardenName: '',
        costCenterName: '',
        gangName: '',
        registrationNumber: '',
        bookID: '',
        operatorName: ''
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
    const [ishidden, setishidden] = useState(true);
    const [totalValues, setTotalValues] = useState({
        totalSatQty: 0,
        totalSunQty: 0,
        totalMonQty: 0,
        totalTueQty: 0,
        totalWedQty: 0,
        totalThuQty: 0,
        totalSatAmt: 0,
        totalSunAmt: 0,
        totalMonAmt: 0,
        totalTueAmt: 0,
        totalWedAmt: 0,
        totalThuAmt: 0,
        totalQty: 0,
        totalAmt: 0,
        totalPayble: 0,
        totalBFwd: 0,
        totalCFwd: 0
    });

    const [open, setOpen] = React.useState(true);

    const [orderBy, setOrderBy] = useState("registrationNumber");
    const [order, setOrder] = useState("asc");

    const handleClose = () => {
        setOpen(false);
    };

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission(), getBookDetails());
    }, []);

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID());
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
        setSunDate("")
        setSatDate("")
        setMonDate("")
        setTueDate("")
        setWedDate("")
        setThuDate("")
    }, [dailylabourDataList.gardenID]);

    useEffect(() => {
        setDailylabourData([])
        setSunDate("")
        setSatDate("")
        setMonDate("")
        setTueDate("")
        setWedDate("")
        setThuDate("")
    }, [dailylabourDataList.costCenterID]);

    useEffect(() => {
        setDailylabourData([])
        setSunDate("")
        setSatDate("")
        setMonDate("")
        setTueDate("")
        setWedDate("")
        setThuDate("")
        calculateToDate();
    }, [dailylabourDataList.fromDate]);

    useEffect(() => {
        setDailylabourData([]);
        setSunDate("")
        setSatDate("")
        setMonDate("")
        setTueDate("")
        setWedDate("")
        setThuDate("")
    }, [dailylabourDataList.toDate]);

    useEffect(() => {
        setDailylabourData([]);
        setSunDate("")
        setSatDate("")
        setMonDate("")
        setTueDate("")
        setWedDate("")
        setThuDate("")
    }, [dailylabourDataList.empTypeID]);

    useEffect(() => {
        setDailylabourData([]);
        setSunDate("")
        setSatDate("")
        setMonDate("")
        setTueDate("")
        setWedDate("")
        setThuDate("")
    }, [dailylabourDataList.factoryJobID]);

    useEffect(() => {
        setDailylabourData([]);
        setSunDate("")
        setSatDate("")
        setMonDate("")
        setTueDate("")
        setWedDate("")
        setThuDate("")
    }, [dailylabourDataList.costCenterID]);

    useEffect(() => {
        setDailylabourData([]);
        setSunDate("")
        setSatDate("")
        setMonDate("")
        setTueDate("")
        setWedDate("")
        setThuDate("")
    }, [selectedOptions]);

    useEffect(() => {
        setDailylabourData([]);
        setSunDate("")
        setSatDate("")
        setMonDate("")
        setTueDate("")
        setWedDate("")
        setThuDate("")
    }, [selectedOptions1]);

    useEffect(() => {
        setDailylabourData([]);
        setSunDate("")
        setSatDate("")
        setMonDate("")
        setTueDate("")
        setWedDate("")
        setThuDate("")
    }, [selectedOptionsBook]);

    useEffect(() => {
        setDailylabourData([]);
        setSunDate("")
        setSatDate("")
        setMonDate("")
        setTueDate("")
        setWedDate("")
        setThuDate("")
    }, [dailylabourDataList.count]);

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

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWWEEKLYMORNINGCASHPAYMENTREPORT');

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
        newOptionArray.splice(2);
        setEmpType(newOptionArray);
    }

    async function getGangDetailsByDivisionID() {
        var response = await services.getGangDetailsByDivisionID(dailylabourDataList.costCenterID);
        var newOptionArray = gangs;
        for (var i = 0; i < response.length; i++) {
            newOptionArray.push({ label: response[i].gangName, value: response[i].gangID })
        }
        setGangs(newOptionArray);
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

    function generateDropDownMenu(data) {
        let items = []
        if (data != null) {
            for (const [key, value] of Object.entries(data)) {
                items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
            }
        }
        return items
    }

    function calculateToDate() {
        const calDate = new Date(dailylabourDataList.fromDate);
        calDate.setDate(calDate.getDate() + 6);
        setDailylabourDataList({
            ...dailylabourDataList,
            toDate: calDate
        });
    }

    function getWeekDates() {
        var date1 = dailylabourDataList.fromDate;
        date1.setDate(date1.getDate());
        setSatDate(moment(date1).format('YYYY/MM/DD'))

        var date2 = dailylabourDataList.fromDate;
        date1.setDate(date1.getDate() + 1);
        setSunDate(moment(date2).format('YYYY/MM/DD'))

        var date3 = dailylabourDataList.fromDate;
        date2.setDate(date2.getDate() + 1);
        setMonDate(moment(date3).format('YYYY/MM/DD'))

        var date4 = dailylabourDataList.fromDate;
        date3.setDate(date3.getDate() + 1);
        setTueDate(moment(date4).format('YYYY/MM/DD'))

        var date5 = dailylabourDataList.fromDate;
        date4.setDate(date5.getDate() + 1);
        setWedDate(moment(date5).format('YYYY/MM/DD'))

        var date6 = dailylabourDataList.fromDate;
        date5.setDate(date5.getDate() + 1);
        setThuDate(moment(date6).format('YYYY/MM/DD'))

        var date8 = dailylabourDataList.fromDate;
        date6.setDate(date6.getDate() - 5);

    }

    function handleDateChange(value) {
        setDailylabourDataList({
            ...dailylabourDataList,
            fromDate: value
        });
    }

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

    function timeout(delay) {
        return new Promise(res => setTimeout(res, delay));
    }

    async function GetDetails() {
        setDailylabourData([]);
        getWeekDates();
        let model = {
            groupID: parseInt(dailylabourDataList.groupID),
            gardenID: parseInt(dailylabourDataList.gardenID),
            costCenterID: parseInt(dailylabourDataList.costCenterID),
            employeeTypeID: selectedOptions.map(x => x.value).join(','),
            fromDate: new Date(dailylabourDataList.fromDate),
            toDate: new Date(dailylabourDataList.toDate),
            gangID: selectedOptions1.map(x => x.value).join(','),
            bookID: selectedOptionsBook.map(x => x.label).join(','),
            count: parseInt(dailylabourDataList.count)
        }
        getSelectedDropdownValuesForReport(model);

        const response = await services.GetDailyLabourDetails(model);
        if (response.statusCode == "Success" && response.data != null) {
            const groupedData = [];
            response.data.forEach(record => {
                const existingGroup = groupedData.find(group => group.employeeID === record.employeeID);
                if (existingGroup) {
                    if (record.paymentDay === "Mon") {
                        existingGroup.MonTotal = record.grossAmount;
                        existingGroup.MonPf = record.pfDeductionAmount;
                        existingGroup.MonOver = record.overKGAmount;
                        existingGroup.MonQty = record.completedQuantity;
                        existingGroup.MonAmt = record.grossAmount;
                        existingGroup.MonDate = record.date;
                    } else if (record.paymentDay === "Tue") {
                        existingGroup.TueTotal = record.grossAmount;
                        existingGroup.TuePf = record.pfDeductionAmount;
                        existingGroup.TueOver = record.overKGAmount;
                        existingGroup.TueQty = record.completedQuantity;
                        existingGroup.TueAmt = record.grossAmount;
                        existingGroup.TueDate = record.date;
                    } else if (record.paymentDay === "Wed") {
                        existingGroup.WedTotal = record.grossAmount;
                        existingGroup.WedPf = record.pfDeductionAmount;
                        existingGroup.WedOver = record.overKGAmount;
                        existingGroup.WedQty = record.completedQuantity;
                        existingGroup.WedAmt = record.grossAmount;
                        existingGroup.WedDate = record.date;
                    } else if (record.paymentDay === "Thu") {
                        existingGroup.ThuTotal = record.grossAmount;
                        existingGroup.ThuPf = record.pfDeductionAmount;
                        existingGroup.ThuOver = record.overKGAmount;
                        existingGroup.ThuQty = record.completedQuantity;
                        existingGroup.ThuAmt = record.grossAmount;
                        existingGroup.ThuDate = record.date;
                    } else if (record.paymentDay === "Fri") {
                        existingGroup.FriTotal = record.grossAmount;
                        existingGroup.FriPf = record.pfDeductionAmount;
                        existingGroup.FriOver = record.overKGAmount;
                        existingGroup.FriQty = record.completedQuantity;
                        existingGroup.FriAmt = record.grossAmount;
                        existingGroup.FriDate = record.date;
                    } else if (record.paymentDay === "Sat") {
                        existingGroup.SatTotal = record.grossAmount;
                        existingGroup.SatPf = record.pfDeductionAmount;
                        existingGroup.SatOver = record.overKGAmount;
                        existingGroup.SatQty = record.completedQuantity;
                        existingGroup.SatAmt = record.grossAmount;
                        existingGroup.SatDate = record.date;
                    } else if (record.paymentDay === "Sun") {
                        existingGroup.SunTotal = record.grossAmount;
                        existingGroup.SunPf = record.pfDeductionAmount;
                        existingGroup.SunOver = record.overKGAmount;
                        existingGroup.SunQty = record.completedQuantity;
                        existingGroup.SunAmt = record.grossAmount;
                        existingGroup.SunDate = record.date;
                    }
                } else {
                    const newGroup = {
                        employeeID: record.employeeID,
                        registrationNumber: record.registrationNumber,
                        firstName: record.firstName,
                        allowance: record.allowance,
                        lessKGAmount: record.lessKGAmount,
                        overKGAmount: record.overKGAmount,
                        overTime: record.overTime,
                        paymentDay: record.paymentDay,
                        pfDeductionAmount: record.pfDeductionAmount,
                        bcsuAmount: record.bcsuAmount,
                        employeeTypeName: record.employeeTypeName,
                        grossAmount: record.grossAmount,
                        pfNumber: record.pfNumber,
                        paymentRevisionNo: record.paymentRevisionNo,
                        date: record.date,
                        employeeTypeID: record.employeeTypeID,
                        createdBy: tokenDecoder.getUserIDFromToken(),
                        cfAmount: record.cfAmount,
                        MonTotal: record.paymentDay === "Mon" ? record.grossAmount : 0,
                        TueTotal: record.paymentDay === "Tue" ? record.grossAmount : 0,
                        WedTotal: record.paymentDay === "Wed" ? record.grossAmount : 0,
                        ThuTotal: record.paymentDay === "Thu" ? record.grossAmount : 0,
                        FriTotal: record.paymentDay === "Fri" ? record.grossAmount : 0,
                        SatTotal: record.paymentDay === "Sat" ? record.grossAmount : 0,
                        SunTotal: record.paymentDay === "Sun" ? record.grossAmount : 0,
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

                        MonQty: record.paymentDay === "Mon" ? record.completedQuantity : 0,
                        TueQty: record.paymentDay === "Tue" ? record.completedQuantity : 0,
                        WedQty: record.paymentDay === "Wed" ? record.completedQuantity : 0,
                        ThuQty: record.paymentDay === "Thu" ? record.completedQuantity : 0,
                        FriQty: record.paymentDay === "Fri" ? record.completedQuantity : 0,
                        SatQty: record.paymentDay === "Sat" ? record.completedQuantity : 0,
                        SunQty: record.paymentDay === "Sun" ? record.completedQuantity : 0,

                        MonAmt: record.paymentDay === "Mon" ? record.grossAmount : 0,
                        TueAmt: record.paymentDay === "Tue" ? record.grossAmount : 0,
                        WedAmt: record.paymentDay === "Wed" ? record.grossAmount : 0,
                        ThuAmt: record.paymentDay === "Thu" ? record.grossAmount : 0,
                        FriAmt: record.paymentDay === "Fri" ? record.grossAmount : 0,
                        SatAmt: record.paymentDay === "Sat" ? record.grossAmount : 0,
                        SunAmt: record.paymentDay === "Sun" ? record.grossAmount : 0,
                    };

                    groupedData.push(newGroup);
                }
            });
            groupedData.forEach(x => {
                x.wagesTotal = x.MonTotal + x.TueTotal + x.WedTotal + x.ThuTotal + x.FriTotal + x.SatTotal + x.SunTotal
                x.overTime = 0.00
                x.totalGross = x.wagesTotal + x.allowance + x.overTime
                x.pfDeductionAmount = x.MonPf + x.TuePf + x.WedPf + x.ThuPf + x.FriPf + x.SatPf + x.SunPf
                x.totalDeduction = x.pfDeductionAmount + x.bcsuAmount
                x.totalNet = x.totalGross - x.totalDeduction
                x.totalAmount = (x.MonAmt + x.TueAmt + x.WedAmt + x.ThuAmt + x.FriAmt + x.SatAmt + x.SunAmt) + x.cfAmount
                x.payable = Math.floor((x.totalAmount) / 10) * 10
                x.broughtForward = x.totalAmount - x.payable
                x.overTotal = x.MonOver + x.TueOver + x.WedOver + x.ThuOver + x.FriOver + x.SatOver + x.SunOver
                x.baseTotal = x.wagesTotal - x.overTotal
                x.totalQuantity = x.MonQty + x.TueQty + x.WedQty + x.ThuQty + x.FriQty + x.SatQty + x.SunQty




            });
            setDailylabourData(groupedData);
        }
        else {
            alert.error(response.message);
        }
    }

    function calculateTotalQty() {
        const totalSatQty = dailylabourData.reduce((accumulator, current) => accumulator + current.SatQty, 0);
        const totalSunQty = dailylabourData.reduce((accumulator, current) => accumulator + current.SunQty, 0);
        const totalMonQty = dailylabourData.reduce((accumulator, current) => accumulator + current.MonQty, 0);
        const totalTueQty = dailylabourData.reduce((accumulator, current) => accumulator + current.TueQty, 0);
        const totalWedQty = dailylabourData.reduce((accumulator, current) => accumulator + current.WedQty, 0);
        const totalThuQty = dailylabourData.reduce((accumulator, current) => accumulator + current.ThuQty, 0);
        const totalSatAmt = dailylabourData.reduce((accumulator, current) => accumulator + current.SatAmt, 0);
        const totalSunAmt = dailylabourData.reduce((accumulator, current) => accumulator + current.SunAmt, 0);
        const totalMonAmt = dailylabourData.reduce((accumulator, current) => accumulator + current.MonAmt, 0);
        const totalTueAmt = dailylabourData.reduce((accumulator, current) => accumulator + current.TueAmt, 0);
        const totalWedAmt = dailylabourData.reduce((accumulator, current) => accumulator + current.WedAmt, 0);
        const totalThuAmt = dailylabourData.reduce((accumulator, current) => accumulator + current.ThuAmt, 0);
        const totalQty = dailylabourData.reduce((accumulator, current) => accumulator + current.totalQuantity, 0);
        const totalAmt = dailylabourData.reduce((accumulator, current) => accumulator + current.totalAmount, 0);
        const totalPayble = dailylabourData.reduce((accumulator, current) => accumulator + current.payable, 0);
        const totalBFwd = dailylabourData.reduce((accumulator, current) => accumulator + current.broughtForward, 0);
        const totalCFwd = dailylabourData.reduce((accumulator, current) => accumulator + current.cfAmount, 0);
        setTotalValues({
            ...totalValues,
            totalSatQty: totalSatQty,
            totalSunQty: totalSunQty,
            totalMonQty: totalMonQty,
            totalTueQty: totalTueQty,
            totalWedQty: totalWedQty,
            totalThuQty: totalThuQty,
            totalSatAmt: totalSatAmt,
            totalSunAmt: totalSunAmt,
            totalMonAmt: totalMonAmt,
            totalTueAmt: totalTueAmt,
            totalWedAmt: totalWedAmt,
            totalThuAmt: totalThuAmt,
            totalAmt: totalAmt,
            totalQty: totalQty,
            totalPayble: totalPayble,
            totalBFwd: totalBFwd,
            totalCFwd: totalCFwd
        })
    };

    async function createDataForExcel(array) {
        var res = [];

        if (array != null) {
            array.map(x => {
                var vr = {
                    'Reg.No': x.registrationNumber,
                    'Emp.Name': x.firstName,
                    'B.FWRD': x.cfAmount.toFixed(2),
                    'SatQty': x.SatQty.toFixed(2),
                    'SatAmount': x.SatAmt.toFixed(2),
                    'SunQty': x.SunQty.toFixed(2),
                    'SunAmount': x.SunAmt.toFixed(2),
                    'MonQty': x.MonQty.toFixed(2),
                    'MonAmount': x.MonAmt.toFixed(2),
                    'TueQty': x.TueQty.toFixed(2),
                    'TueAmount': x.TueAmt.toFixed(2),
                    'WedQty': x.WedQty.toFixed(2),
                    'WedAmount': x.WedAmt.toFixed(2),
                    'ThuQty': x.ThuQty.toFixed(2),
                    'ThuAmount': x.ThuAmt.toFixed(2),
                    'Total Qty': x.totalQuantity.toFixed(2),
                    'Total Amount': x.totalAmount.toFixed(2),
                    'Payable': x.payable.toFixed(2),
                    'C.FWRD': x.broughtForward.toFixed(2),
                };
                res.push(vr);
            });
            var vr = {
                'Reg.No': 'Total',
                'B.FWRD': totalValues.totalCFwd.toFixed(2),
                'SatQty': totalValues.totalSatQty.toFixed(2),
                'SatAmount': totalValues.totalSatAmt.toFixed(2),
                'SunQty': totalValues.totalSunQty.toFixed(2),
                'SunAmount': totalValues.totalSunAmt.toFixed(2),
                'MonQty': totalValues.totalMonQty.toFixed(2),
                'MonAmount': totalValues.totalMonAmt.toFixed(2),
                'TueQty': totalValues.totalTueQty.toFixed(2),
                'TueAmount': totalValues.totalTueAmt.toFixed(2),
                'WedQty': totalValues.totalWedQty.toFixed(2),
                'WedAmount': totalValues.totalWedAmt.toFixed(2),
                'ThuQty': totalValues.totalThuQty.toFixed(2),
                'ThuAmount': totalValues.totalThuAmt.toFixed(2),
                'Total Qty': totalValues.totalQty.toFixed(2),
                'Total Amount': totalValues.totalAmt.toFixed(2),
                'Payable': totalValues.totalPayble.toFixed(2),
                'C.FWRD': totalValues.totalBFwd.toFixed(2),


            };
            res.push(vr);
            res.push([]);
            var vr = {
                'Reg.No': 'Garden: ' + selectedSearchValues.gardenName,
                'Emp.Name': selectedSearchValues.empTypeName === "" ? 'Employee Type: All Employee Types' : 'Employee Type: ' + selectedSearchValues.empTypeName,
                'SatQty': selectedSearchValues.gangName === "" ? 'Duffa: All Duffas' : 'Duffa: ' + selectedSearchValues.gangName,
                'SatAmount': selectedSearchValues.bookID == "" ? 'Book: All Books' : 'Book: ' + selectedSearchValues.bookID,
                'SunQty': 'From: ' + selectedSearchValues.fromDate,
                'SunAmount': 'To: ' + selectedSearchValues.toDate,
            };
            res.push(vr);
        }

        return res;
    }

    async function createFile() {
        setishidden(false);
        var file = await createDataForExcel(dailylabourData);
        var settings = {
            sheetName: 'Weekly M.Cash Payment Report',
            fileName:
                'Weekly M.Cash Payment Report - ' +
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
                sheet: 'Weekly M.Cash Payment Report',
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

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: groups[searchForm.groupID],
            gardenName: gardens[searchForm.gardenID],
            empTypeName: selectedOptions.map(x => x.label).join(', '),
            fromDate: new Date(dailylabourDataList.fromDate).toISOString().substr(0, 10),
            toDate: new Date(dailylabourDataList.toDate).toISOString().substr(0, 10),
            gangName: selectedOptions1.map(x => x.label).join(', '),
            costCenterName: costCenters[searchForm.costCenterID],
            bookID: selectedOptionsBook.map(x => x.label).join(','),
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
                                                        Business Division  *
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

                                                    >
                                                        <MenuItem value="0">--Select Business Division--</MenuItem>
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

                                                    >
                                                        <MenuItem value="0">--Select Location--</MenuItem>
                                                        {generateDropDownMenu(gardens)}
                                                    </TextField>
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
                                                        <Table className={classes.table} aria-label="simple table">
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
                                                                    <TableCell align="center" colSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>{satDate}</TableCell>
                                                                    <TableCell align="center" colSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>{sunDate}</TableCell>
                                                                    <TableCell align="center" colSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>{monDate}</TableCell>
                                                                    <TableCell align="center" colSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>{tueDate}</TableCell>
                                                                    <TableCell align="center" colSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>{wedDate}</TableCell>
                                                                    <TableCell align="center" colSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>{thuDate}</TableCell>
                                                                    <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Total Qty</TableCell>
                                                                    <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Net Pay</TableCell>
                                                                    <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Payable</TableCell>
                                                                    <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>C.FWRD</TableCell>
                                                                </TableRow>
                                                                <TableRow>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Qty</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Amount</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Qty</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Amount</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Qty</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Amount</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Qty</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Amount</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Qty</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Amount</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Qty</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Amount</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {sortData(dailylabourData).slice(page * limit, page * limit + limit).map((row, i) => (
                                                                    <TableRow key={i}
                                                                    >
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.registrationNumber}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.firstName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.cfAmount.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.SatQty == 0 ? "-" : row.SatQty.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.SatAmt == 0 ? "-" : row.SatAmt.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.SunQty == 0 ? "-" : row.SunQty.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.SunAmt == 0 ? "-" : row.SunAmt.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.MonQty == 0 ? "-" : row.MonQty.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.MonAmt == 0 ? "-" : row.MonAmt.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.TueQty == 0 ? "-" : row.TueQty.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.TueAmt == 0 ? "-" : row.TueAmt.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.WedQty == 0 ? "-" : row.WedQty.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.WedAmt == 0 ? "-" : row.WedAmt.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.ThuQty == 0 ? "-" : row.ThuQty.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.ThuAmt == 0 ? "-" : row.ThuAmt.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.totalQuantity.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.totalAmount.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.payable.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.broughtForward.toFixed(2)}</TableCell>
                                                                    </TableRow>
                                                                )
                                                                )}
                                                                <TableCell align={'center'} style={{ borderBottom: "none", border: "1px solid black" }}><b>Total</b></TableCell>
                                                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b>{totalValues.totalCFwd.toFixed(2)}</b></TableCell>
                                                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b>{totalValues.totalSatQty.toFixed(2)}</b></TableCell>
                                                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b>{totalValues.totalSatAmt.toFixed(2)}</b></TableCell>
                                                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b>{totalValues.totalSunQty.toFixed(2)}</b></TableCell>
                                                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b>{totalValues.totalSunAmt.toFixed(2)} </b></TableCell>
                                                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalMonQty.toFixed(2)} </b></TableCell>
                                                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalMonAmt.toFixed(2)} </b></TableCell>
                                                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalTueQty.toFixed(2)} </b></TableCell>
                                                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalTueAmt.toFixed(2)}</b></TableCell>
                                                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalWedQty.toFixed(2)} </b></TableCell>
                                                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalWedAmt.toFixed(2)}</b></TableCell>
                                                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalThuQty.toFixed(2)} </b></TableCell>
                                                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b>{totalValues.totalThuAmt.toFixed(2)}</b></TableCell>
                                                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b>{totalValues.totalQty.toFixed(2)}</b></TableCell>
                                                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b>{totalValues.totalAmt.toFixed(2)} </b></TableCell>
                                                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b>{totalValues.totalPayble.toFixed(2)} </b></TableCell>
                                                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b>{totalValues.totalBFwd.toFixed(2)} </b></TableCell>
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
                                                    documentTitle={"Weekly Cash Payment Report"}
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
                                                        satDate={satDate} sunDate={sunDate} totalValues={totalValues}
                                                    />
                                                </div>
                                            </Box>
                                            : null}
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