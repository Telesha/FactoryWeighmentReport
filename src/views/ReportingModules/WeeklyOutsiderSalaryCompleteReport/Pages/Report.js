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
import { isSaturday } from 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import moment from 'moment';
import tokenDecoder from '../../../../utils/tokenDecoder';
import { X } from 'react-feather';

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

const screenCode = 'WEEKLYOUTSIDERSALARYCOMPLETEREPORT';

export default function WeeklyOutsiderSalaryCompleteReport(props) {
    const [title, setTitle] = useState("Weekly Outsider Salary History Report")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [gardens, setGardens] = useState([]);
    const [costCenters, setCostCenters] = useState();
    const [dailylabourData, setDailylabourData] = useState([]);
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [employeeType, setEmployeeType] = useState();
    const [gangs, setGangs] = useState([]);
    const [books, setBooks] = useState([]);
    const [operator, setOperator] = useState([]);
    const curr = new Date;
    const first = curr.getDate() - curr.getDay();
    const last = first - 1;
    const friday = first + 5;
    const lastday = new Date(curr.setDate(last)).toISOString().substr(0, 10);
    const friday1 = new Date(curr.setDate(friday)).toISOString().substr(0, 10);
    const [ishidden, setishidden] = useState(true);
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
        bookNumber: ''
    })

    const [totalValues, setTotalValues] = useState({
        totalSatAmt: 0,
        totalSunAmt: 0,
        totalMonAmt: 0,
        totalTueAmt: 0,
        totalWedAmt: 0,
        totalThuAmt: 0,
        totalFriAmt: 0,
        totalAmt: 0,
        totalNet: 0,
        totalPayble: 0,
        totalBFwd: 0,
        totalCFwd: 0,
        totalRation: 0
    });

    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const componentRef = useRef();
    const navigate = useNavigate();
    const alert = useAlert();
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);

    const [satDate, setSatDate] = useState();
    const [sunDate, setSunDate] = useState();
    const [monDate, setMonDate] = useState();
    const [tueDate, setTueDate] = useState();
    const [wedDate, setWedDate] = useState();
    const [thuDate, setThuDate] = useState();
    const [friDate, setFriDate] = useState();

    //MultiSelect Duffa
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

    //MultiSelect Book
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

    const isDayDisabled = (date) => {
        return !isSaturday(date);
    };

    const [orderBy, setOrderBy] = useState("registrationNumber");
    const [order, setOrder] = useState("asc");

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
    }, [selectedOptionsBook]);


    useEffect(() => {
        setDailylabourData([])
    }, [dailylabourDataList.gardenID]);

    useEffect(() => {
        setDailylabourData([])
    }, [dailylabourDataList.costCenterID]);

    useEffect(() => {
        setDailylabourData([])
        calculateToDate();
    }, [dailylabourDataList.fromDate]);

    useEffect(() => {
        setDailylabourData([]);
    }, [dailylabourDataList.toDate]);

    useEffect(() => {
        setDailylabourData([]);
    }, [dailylabourDataList.empTypeID]);

    useEffect(() => {
        setDailylabourData([]);
    }, [dailylabourDataList.factoryJobID]);

    useEffect(() => {
        setDailylabourData([]);
    }, [dailylabourDataList.fieldID]);

    useEffect(() => {
        setDailylabourData([]);
    }, [dailylabourDataList.costCenterID]);

    useEffect(() => {
        setDailylabourData([]);
    }, [selectedOptions1]);

    useEffect(() => {
        setDailylabourData([]);
    }, [selectedOptionsBook]);

    useEffect(() => {
        setDailylabourData([]);
    }, [dailylabourDataList.registrationNumber]);

    useEffect(() => {
        trackPromise(
            GetOperatorListByDateAndGardenIDForWeeklyOutsiderPaymentReportReport()
        )
    }, [dailylabourDataList.gardenID, dailylabourDataList.date]);

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
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWWEEKLYOUTSIDERSALARYCOMPLETEREPORT');

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
        const types = await services.getEmployeeTypesForDropdown();
        setEmployeeType(types);
    }

    async function getGangDetailsByDivisionID() {
        var response = await services.getGangDetailsByDivisionID(dailylabourDataList.costCenterID);
        const newOptionArray = [];
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

    async function GetOperatorListByDateAndGardenIDForWeeklyOutsiderPaymentReportReport() {
        const result = await services.GetOperatorListByDateAndGardenIDForWeeklyOutsiderPaymentReportReport(dailylabourDataList.gardenID, new Date(dailylabourDataList.fromDate).toISOString().substr(0, 10));
        var newOptionArray = operator;
        for (var i = 0; i < result.length; i++) {
            newOptionArray.push({ label: result[i].operatorName, value: result[i].operatorID })
        }
        setOperator(newOptionArray);
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

    function generateDropDownMenuWithTwoValues(data) {
        let items = []
        if (data != null) {
            for (const [key, value] of Object.entries(data)) {
                items.push(<MenuItem key={key} value={key}>{value.name}</MenuItem>);
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

    async function GetDetails() {
        getWeekDates();
        setDailylabourData([]);
        let model = {
            groupID: parseInt(dailylabourDataList.groupID),
            gardenID: parseInt(dailylabourDataList.gardenID),
            employeeTypeID: parseInt(dailylabourDataList.empTypeID),
            registrationNumber: (dailylabourDataList.registrationNumber),
            fromDate: new Date(dailylabourDataList.fromDate),
            toDate: new Date(dailylabourDataList.toDate),
            bookNumber: selectedOptionsBook.map(x => x.label).join(', '),
            gangID: selectedOptions1.map(x => x.value).join(', '),
        }
        getSelectedDropdownValuesForReport(model);
        const response = await services.GetWeeklyOutsiderSalaryCompleteReportDate(model);
        if (response.statusCode == "Success" && response.data != null) {
            const groupedData = [];
            response.data.forEach(record => {
                const existingGroup = groupedData.find(group => group.employeeID === record.employeeID);
                if (existingGroup) {
                    if (record.paymentDay === "Mon") {
                        existingGroup.MonTotal = record.grossAmount;
                        existingGroup.MonAdjusment = record.extraAdjusment;
                    } else if (record.paymentDay === "Tue") {
                        existingGroup.TueTotal = record.grossAmount;
                        existingGroup.TueAdjusment = record.extraAdjusment;
                    } else if (record.paymentDay === "Wed") {
                        existingGroup.WedTotal = record.grossAmount;
                        existingGroup.WedAdjusment = record.extraAdjusment;
                    } else if (record.paymentDay === "Thu") {
                        existingGroup.ThuTotal = record.grossAmount;
                        existingGroup.ThuAdjusment = record.extraAdjusment;
                    } else if (record.paymentDay === "Fri") {
                        existingGroup.FriTotal = record.grossAmount;
                        existingGroup.FriAdjusment = record.extraAdjusment;
                    } else if (record.paymentDay === "Sat") {
                        existingGroup.SatTotal = record.grossAmount;
                        existingGroup.SatAdjusment = record.extraAdjusment;
                    } else if (record.paymentDay === "Sun") {
                        existingGroup.SunTotal = record.grossAmount;
                        existingGroup.SunAdjusment = record.extraAdjusment;
                    }
                } else {
                    const newGroup = {
                        employeeID: record.employeeID,
                        registrationNumber: record.registrationNumber,
                        firstName: record.firstName,
                        duffa: record.duffa,
                        userName: record.userName,
                        createdDate: record.createdDate,
                        allowance: record.allowance,
                        lessKGAmount: record.lessKGAmount,
                        overKGAmount: record.overKGAmount,
                        overTime: record.overTime,
                        cfAmount: record.cfAmount,
                        paymentDay: record.paymentDay,
                        pfDeductionAmount: record.pfDeductionAmount,
                        bcsuAmount: record.bcsuAmount,
                        employeeTypeName: record.employeeTypeName,
                        grossAmount: record.grossAmount,
                        date: record.date,
                        paymentRevisionNo: record.paymentRevisionNo,
                        employeeTypeID: record.employeeTypeID,
                        createdBy: tokenDecoder.getUserIDFromToken(),
                        extraAdjusment: record.extraAdjusment,
                        ration: record.ration,
                        MonTotal: record.paymentDay === "Mon" ? record.grossAmount : 0,
                        TueTotal: record.paymentDay === "Tue" ? record.grossAmount : 0,
                        WedTotal: record.paymentDay === "Wed" ? record.grossAmount : 0,
                        ThuTotal: record.paymentDay === "Thu" ? record.grossAmount : 0,
                        FriTotal: record.paymentDay === "Fri" ? record.grossAmount : 0,
                        SatTotal: record.paymentDay === "Sat" ? record.grossAmount : 0,
                        SunTotal: record.paymentDay === "Sun" ? record.grossAmount : 0,
                        MonAdjusment: record.paymentDay === "Mon" ? record.extraAdjusment : 0,
                        TueAdjusment: record.paymentDay === "Tue" ? record.extraAdjusment : 0,
                        WedAdjusment: record.paymentDay === "Wed" ? record.extraAdjusment : 0,
                        ThuAdjusment: record.paymentDay === "Thu" ? record.extraAdjusment : 0,
                        FriAdjusment: record.paymentDay === "Fri" ? record.extraAdjusment : 0,
                        SatAdjusment: record.paymentDay === "Sat" ? record.extraAdjusment : 0,
                        SunAdjusment: record.paymentDay === "Sun" ? record.extraAdjusment : 0

                    };
                    groupedData.push(newGroup);
                }
            });
            groupedData.forEach(x => {
                x.wagesTotal = x.MonTotal + x.TueTotal + x.WedTotal + x.ThuTotal + x.FriTotal + x.SatTotal + x.SunTotal
                x.extraAdjusment = + x.MonAdjusment + x.TueAdjusment + x.WedAdjusment + x.ThuAdjusment + x.FriAdjusment + x.SatAdjusment + x.SunAdjusment
                x.totalGross = x.wagesTotal
                x.totalNet = (x.totalGross + x.cfAmount) - (x.extraAdjusment) - (x.ration)
                x.payable = Math.floor((x.totalNet) / 10) * 10
                x.broughtForward = ((x.totalNet - x.payable) + (x.extraAdjusment)) < 0 ? 0 : ((x.totalNet - x.payable) + (x.extraAdjusment))
            });
            setDailylabourData(groupedData);
        }
        else {
            alert.error(response.message);
        }
    }

    function calculateTotalQty() {
        const totalSatAmt = dailylabourData.reduce((accumulator, current) => accumulator + current.SatTotal, 0);
        const totalSunAmt = dailylabourData.reduce((accumulator, current) => accumulator + current.SunTotal, 0);
        const totalMonAmt = dailylabourData.reduce((accumulator, current) => accumulator + current.MonTotal, 0);
        const totalTueAmt = dailylabourData.reduce((accumulator, current) => accumulator + current.TueTotal, 0);
        const totalWedAmt = dailylabourData.reduce((accumulator, current) => accumulator + current.WedTotal, 0);
        const totalThuAmt = dailylabourData.reduce((accumulator, current) => accumulator + current.ThuTotal, 0);
        const totalFriAmt = dailylabourData.reduce((accumulator, current) => accumulator + current.FriTotal, 0);
        const totalAmt = dailylabourData.reduce((accumulator, current) => accumulator + current.wagesTotal, 0);
        const totalNet = dailylabourData.reduce((accumulator, current) => accumulator + current.totalNet, 0);
        const totalRation = dailylabourData.reduce((accumulator, current) => accumulator + current.ration, 0);
        const totalPayble = dailylabourData.reduce((accumulator, current) => accumulator + current.payable, 0);
        const totalBFwd = dailylabourData.reduce((accumulator, current) => accumulator + current.broughtForward, 0);
        const totalCFwd = dailylabourData.reduce((accumulator, current) => accumulator + current.cfAmount, 0);
        setTotalValues({
            ...totalValues,
            totalSatAmt: totalSatAmt,
            totalSunAmt: totalSunAmt,
            totalMonAmt: totalMonAmt,
            totalTueAmt: totalTueAmt,
            totalWedAmt: totalWedAmt,
            totalThuAmt: totalThuAmt,
            totalFriAmt: totalFriAmt,
            totalAmt: totalAmt,
            totalNet: totalNet,
            totalPayble: totalPayble,
            totalBFwd: totalBFwd,
            totalCFwd: totalCFwd,
            totalRation: totalRation
        })
    };

    async function createDataForExcel(array) {
        var res = [];

        if (array != null) {
            array.map(x => {
                var vr = {
                    'Emp.ID': x.registrationNumber,
                    'Emp.Name': x.firstName,
                    'Emp.Type': x.employeeTypeName,
                    'Duffa': x.duffa,
                    'B.FWRD': x.cfAmount.toFixed(2),
                    'Sat': x.SatTotal.toFixed(2),
                    'Sun': x.SunTotal.toFixed(2),
                    'Mon': x.MonTotal.toFixed(2),
                    'Tue': x.TueTotal.toFixed(2),
                    'Wed': x.WedTotal.toFixed(2),
                    'Thu': x.ThuTotal.toFixed(2),
                    'Fri': x.FriTotal.toFixed(2),
                    'Wages Total': x.wagesTotal.toFixed(2),
                    'Ration': x.ration.toFixed(2),
                    'Net Pay': x.totalNet.toFixed(2),
                    'Payable': x.payable.toFixed(2),
                    'C.FWRD': x.broughtForward.toFixed(2),
                    'Completed By': x.userName,
                    'Completed Date': x.createdDate?.split('T')[0],
                };
                res.push(vr);
            });
            var vr = {
                'Emp.ID': 'Total',
                'B.FWRD': totalValues.totalCFwd.toFixed(2),
                'Sat': totalValues.totalSatAmt.toFixed(2),
                'Sun': totalValues.totalSunAmt.toFixed(2),
                'Mon': totalValues.totalMonAmt.toFixed(2),
                'Tue': totalValues.totalTueAmt.toFixed(2),
                'Wed': totalValues.totalWedAmt.toFixed(2),
                'Thu': totalValues.totalThuAmt.toFixed(2),
                'Fri': totalValues.totalFriAmt.toFixed(2),
                'Ration': totalValues.totalRation.toFixed(2),
                'Wages Total': totalValues.totalAmt.toFixed(2),
                'Net Pay': totalValues.totalNet.toFixed(2),
                'Payable': totalValues.totalPayble.toFixed(2),
                'C.FWRD': totalValues.totalBFwd.toFixed(2),


            };
            res.push(vr);
            res.push([]);
            var vr = {
                'Emp.ID': 'Legal Entity: ' + selectedSearchValues.groupName,
                'Emp.Name': 'Garden: ' + selectedSearchValues.gardenName,
                'Emp.Type': selectedSearchValues.gangName === undefined ? 'Duffa: All Duffas' : 'Duffa: ' + selectedSearchValues.gangName,
                'Duffa': 'From: ' + selectedSearchValues.fromDate,
                'B.FWRD': 'To: ' + selectedSearchValues.toDate,
                'Sat': selectedSearchValues.registrationNumber == "" ? 'Reg.No: -' : 'Reg.No: ' + selectedSearchValues.registrationNumber,
                'Sun': selectedSearchValues.bookNumber == "" ? 'Book Number: -' : 'Book Number: ' + selectedSearchValues.bookNumber,
            };
            res.push(vr);
        }

        return res;
    }

    async function createFile() {
        setishidden(false);
        var file = await createDataForExcel(dailylabourData);
        var settings = {
            sheetName: 'Weekly Outsider Salary History Report',
            fileName:
                'Weekly Outsider Salary History Report - ' +
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
                sheet: 'Weekly Outsider Salary History',
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

    async function getBookDetails() {
        var response = await services.getBookDetailsByEmployeeTypeForDropDown();
        var newOptionArray = [];
        var bookID = 1;
        for (var i = 0; i < response.length; i++) {
            newOptionArray.push({ label: response[i].bookName, value: bookID });
            bookID++;
        }
        setBooks(newOptionArray);
    };

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: groups[searchForm.groupID],
            gardenName: gardens[searchForm.gardenID],
            empTypeName: employeeType[searchForm.empTypeID],
            fromDate: moment(dailylabourDataList.fromDate).format('YYYY-MM-DD'),
            toDate: moment(dailylabourDataList.toDate).format('YYYY-MM-DD'),
            gangName: selectedOptions1.map(x => x.label).join(', '),
            registrationNumber: searchForm.registrationNumber,
            bookNumber: selectedOptionsBook.map(x => x.label).join(', ')
        })
    }

    function getWeekDates() {
        var date1 = dailylabourDataList.fromDate;
        date1.setDate(date1.getDate());
        setSatDate(moment(date1).format('MM/DD'))

        var date2 = dailylabourDataList.fromDate;
        date1.setDate(date1.getDate() + 1);
        setSunDate(moment(date2).format('MM/DD'))

        var date3 = dailylabourDataList.fromDate;
        date2.setDate(date2.getDate() + 1);
        setMonDate(moment(date3).format('MM/DD'))

        var date4 = dailylabourDataList.fromDate;
        date3.setDate(date3.getDate() + 1);
        setTueDate(moment(date4).format('MM/DD'))

        var date5 = dailylabourDataList.fromDate;
        date4.setDate(date5.getDate() + 1);
        setWedDate(moment(date5).format('MM/DD'))

        var date6 = dailylabourDataList.fromDate;
        date5.setDate(date5.getDate() + 1);
        setThuDate(moment(date6).format('MM/DD'))

        var date7 = dailylabourDataList.fromDate;
        date6.setDate(date6.getDate() + 1);
        setFriDate(moment(date7).format('MM/DD'))

        var date8 = dailylabourDataList.fromDate;
        date7.setDate(date7.getDate() - 6);

    }

    function handleDateChange(value) {
        setDailylabourDataList({
            ...dailylabourDataList,
            fromDate: value
        });
    }

    function timeout(delay) {
        return new Promise(res => setTimeout(res, delay));
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

                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Legal Entity is required').min("1", 'Legal Entity is required'),
                            gardenID: Yup.number().required('Garden is required').min("1", 'Garden is required'),
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
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="groupID">
                                                        Legal Entity *
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
                                                        <MenuItem value="0">--Select Legal Entity--</MenuItem>
                                                        {generateDropDownMenu(groups)}
                                                    </TextField>
                                                </Grid>

                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="gardenID">
                                                        Garden *
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
                                                        <MenuItem value="0">--Select Garden--</MenuItem>
                                                        {generateDropDownMenu(gardens)}
                                                    </TextField>
                                                </Grid>
                                                {/* <Grid item md={4} xs={8}>
                                                    <InputLabel shrink id="empTypeID">
                                                        Employee Type
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.empTypeID && errors.empTypeID)}
                                                        fullWidth
                                                        helperText={touched.empTypeID && errors.empTypeID}
                                                        name="empTypeID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={dailylabourDataList.empTypeID}
                                                        variant="outlined"
                                                        id="empTypeID"
                                                        size='small'

                                                    >
                                                        <MenuItem value="0">--Select Employee Type--</MenuItem>
                                                        {generateDropDownMenuWithTwoValues(employeeType)}
                                                    </TextField>
                                                </Grid> */}
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="fromDate">
                                                        From Date *
                                                    </InputLabel>
                                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                        <KeyboardDatePicker
                                                            autoOk
                                                            fullWidth
                                                            variant="inline"
                                                            format="dd/MM/yyyy"
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
                                                    <InputLabel shrink id="gangID">
                                                        Duffa
                                                    </InputLabel>
                                                    <CustomMultiSelect
                                                        items={gangs}
                                                        getOptionLabel={getOptionLabel1}
                                                        getOptionDisabled={getOptionDisabled1}
                                                        selectedValues={selectedOptions1}
                                                        placeholder="--Select Duffa--"
                                                        selectAllLabel="Select all"
                                                        onToggleOption={handleToggleOption1}
                                                        onClearOptions={handleClearOptions1}
                                                        onSelectAll={handleSelectAll1}
                                                    />
                                                </Grid>
                                                <Grid item md={3} xs={12}>
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
                                                {/* <Grid item md={3} xs={12} >
                                                    <InputLabel shrink id="operatorID">
                                                        Operator
                                                    </InputLabel>
                                                    <CustomMultiSelect
                                                        items={operator}
                                                        getOptionLabel={getOptionLabel3}
                                                        getOptionDisabled={getOptionDisabled3}
                                                        selectedValues={selectedOptions3}
                                                        placeholder="Operator"
                                                        selectAllLabel="Select all"
                                                        onToggleOption={handleToggleOption3}
                                                        onClearOptions={handleClearOptions3}
                                                        onSelectAll={handleSelectAll3}
                                                    />
                                                </Grid> */}
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="registrationNumber">
                                                        Emp.ID
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
                                                        <Table className={classes.table} aria-label="simple table">
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }} onClick={() => handleRequestSort("registrationNumber")}>
                                                                        <TableSortLabel
                                                                            active={orderBy === "registrationNumber"}
                                                                            direction={order}
                                                                            onClick={() => handleRequestSort("registrationNumber")}
                                                                        >
                                                                            Emp.ID {getSortIcon("registrationNumber")}
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
                                                                    <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }} onClick={() => handleRequestSort("employeeTypeName")}>
                                                                        <TableSortLabel
                                                                            active={orderBy === "employeeTypeName"}
                                                                            direction={order}
                                                                            onClick={() => handleRequestSort("employeeTypeName")}
                                                                        >
                                                                            Emp.Type {getSortIcon("employeeTypeName")}
                                                                        </TableSortLabel>
                                                                    </TableCell>
                                                                    <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }} onClick={() => handleRequestSort("duffa")}>
                                                                        <TableSortLabel
                                                                            active={orderBy === "duffa"}
                                                                            direction={order}
                                                                            onClick={() => handleRequestSort("duffa")}
                                                                        >
                                                                            Duffa {getSortIcon("duffa")}
                                                                        </TableSortLabel>
                                                                    </TableCell>
                                                                    <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>B.FWRD</TableCell>
                                                                    <TableCell align="center" colSpan="8" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Wages</TableCell>
                                                                    <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Ration</TableCell>
                                                                    <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Net Pay</TableCell>
                                                                    <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Payable</TableCell>
                                                                    <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>C.FWRD</TableCell>
                                                                    <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Completed By</TableCell>
                                                                    <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Completed Date</TableCell>
                                                                </TableRow>
                                                                <TableRow>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Sat {satDate}</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Sun {sunDate}</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Mon {monDate}</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Tue {tueDate}</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Wed {wedDate}</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Thu {thuDate}</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Fri {friDate}</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Total</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {sortData(dailylabourData).slice(page * limit, page * limit + limit).map((row, i) => (
                                                                    <TableRow key={i}
                                                                    >
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.registrationNumber}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.firstName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.employeeTypeName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.duffa}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.cfAmount.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.SatTotal == 0 ? "-" : row.SatTotal.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.SunTotal == 0 ? "-" : row.SunTotal.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.MonTotal == 0 ? "-" : row.MonTotal.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.TueTotal == 0 ? "-" : row.TueTotal.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.WedTotal == 0 ? "-" : row.WedTotal.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.ThuTotal == 0 ? "-" : row.ThuTotal.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.FriTotal == 0 ? "-" : row.FriTotal.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.wagesTotal.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.ration.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.totalNet.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.payable.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.broughtForward.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.userName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.createdDate?.split('T')[0]}</TableCell>
                                                                    </TableRow>
                                                                )
                                                                )}
                                                                <TableCell align={'center'} style={{ borderBottom: "none", border: "1px solid black" }}><b>Total</b></TableCell>
                                                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b>{totalValues.totalCFwd.toFixed(2)}</b></TableCell>
                                                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b>{totalValues.totalSatAmt.toFixed(2)}</b></TableCell>
                                                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b>{totalValues.totalSunAmt.toFixed(2)}</b></TableCell>
                                                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b>{totalValues.totalMonAmt.toFixed(2)}</b></TableCell>
                                                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b>{totalValues.totalTueAmt.toFixed(2)} </b></TableCell>
                                                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalWedAmt.toFixed(2)} </b></TableCell>
                                                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalThuAmt.toFixed(2)} </b></TableCell>
                                                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalFriAmt.toFixed(2)} </b></TableCell>
                                                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b>{totalValues.totalAmt.toFixed(2)} </b></TableCell>
                                                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b>{totalValues.totalRation.toFixed(2)} </b></TableCell>
                                                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b>{totalValues.totalNet.toFixed(2)} </b></TableCell>
                                                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b>{totalValues.totalPayble.toFixed(2)} </b></TableCell>
                                                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b>{totalValues.totalBFwd.toFixed(2)} </b></TableCell>
                                                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
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
                                                    documentTitle={"Weekly Outsider Salary History Report"}
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
                                                    <CreatePDF ref={componentRef}
                                                        searchData={selectedSearchValues} dailylabourData={dailylabourData}
                                                        totalValues={totalValues} monDate={monDate} tueDate={tueDate} wedDate={wedDate} thuDate={thuDate}
                                                        friDate={friDate} satDate={satDate} sunDate={sunDate}
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