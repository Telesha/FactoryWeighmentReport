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
    Typography
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import { Formik } from 'formik';
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePDF';
import { LoadingComponent } from 'src/utils/newLoader';
import { useAlert } from "react-alert";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import _ from 'lodash';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { isSunday } from 'date-fns';
import { confirmAlert } from 'react-confirm-alert';
import xlsx from 'json-as-xlsx';

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

const screenCode = 'WEEKLYPAYMENTSHEET';
export default function WeeklyPaymentSheet(props) {
    const [title, setTitle] = useState("Weekly Payment Sheet F1")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [gardens, setGardens] = useState([]);
    const [costCenters, setCostCenters] = useState();
    const [PayPoints, setPayPoints] = useState();
    const [ishidden, setishidden] = useState(true);
    const [initialState, setIsInitialState] = useState(false);
    const [WeeklyPaymentSheetData, setWeeklyPaymentSheetData] = useState([]);
    const [WeeklyPaymentSheetDataOne, setWeeklyPaymentSheetDataOne] = useState([]);
    const getPreviousSunday = (date) => {
        const currentDay = date.getDay();
        const distanceToPreviousSunday = currentDay === 0 ? 7 : currentDay;
        const previousSunday = new Date(date);
        previousSunday.setDate(date.getDate() - distanceToPreviousSunday);
        return previousSunday;
    };
    const [WeeklyPaymentSheetList, setWeeklyPaymentSheetList] = useState({
        groupID: '0',
        gardenID: '0',
        costCenterID: '0',
        payPointID: '0',
        date: getPreviousSunday(new Date())
    })

    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: "0",
        gardenName: "0",
        costCenterName: "0",
        payPointID: '0',
        date: '',
    })

    const [grandTotalValues, setGrandTotalValues] = useState({
        workCount: 0,
        otAmount: 0,
        leaveAmount: 0,
        totalEarnings: 0,
        pfDeductionAmount: 0,
        totalDeduction: 0,
        pluckQty: 0,
        netPayable: 0,
        roundOff: 0,
        netPay: 0
    })

    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
        isCompleteButtonEnabled: false
    });
    const componentRef = useRef();
    const navigate = useNavigate();
    const alert = useAlert();
    const [csvHeaders, SetCsvHeaders] = useState([]);

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        if (!initialState) {
            trackPromise(getPermission());
        }
    }, [initialState]);

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID());
    }, [WeeklyPaymentSheetList.groupID]);

    useEffect(() => {
        setWeeklyPaymentSheetList((prevState) => ({
            ...prevState,
            costCenterID: "0"
        }));
    }, [WeeklyPaymentSheetList.groupID]);

    useEffect(() => {
        trackPromise(
            getCostCenterDetailsByGardenID()
        )
    }, [WeeklyPaymentSheetList.gardenID]);

    useEffect(() => {
        setWeeklyPaymentSheetData([])
    }, [WeeklyPaymentSheetList.gardenID]);

    useEffect(() => {
        setWeeklyPaymentSheetData([])
    }, [WeeklyPaymentSheetList.payPointID]);

    useEffect(() => {
        setWeeklyPaymentSheetData([])
    }, [WeeklyPaymentSheetList.costCenterID]);

    useEffect(() => {
        setWeeklyPaymentSheetData([])
    }, [WeeklyPaymentSheetList.date]);

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID(),
            GetDivisionDetailsByGroupID());
    }, [WeeklyPaymentSheetList.groupID]);

    useEffect(() => {
        if (initialState) {
            setWeeklyPaymentSheetList((prevState) => ({
                ...prevState,
                gardenID: "0",
                payPointID: "0"
            }));
        }
    }, [WeeklyPaymentSheetList.groupID, initialState]);

    useEffect(() => {
        if (initialState) {
            setWeeklyPaymentSheetList((prevState) => ({
                ...prevState,
                payPointID: "0"
            }));
        }
    }, [WeeklyPaymentSheetList.gardenID, initialState]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWWEEKLYPAYMENTSHEET');

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

        setWeeklyPaymentSheetList({
            ...WeeklyPaymentSheetList,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            gardenID: parseInt(tokenService.getFactoryIDFromToken())
        })
        setIsInitialState(true);
    }
    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(WeeklyPaymentSheetList.groupID);
        setGardens(response);
    };

    async function getCostCenterDetailsByGardenID() {
        var response = await services.getDivisionDetailsByEstateID(WeeklyPaymentSheetList.gardenID);
        const elementCount = response.reduce((count) => count + 1, 0);
        var generated = generateDropDownMenu(response)
        if (elementCount === 1) {
            setWeeklyPaymentSheetList((prevState) => ({
                ...prevState,
                costCenterID: generated[0].props.value,
            }));
        }
        setCostCenters(response);
    };
    async function GetDivisionDetailsByGroupID() {
        const result = await services.GetDivisionDetailsByGroupID(WeeklyPaymentSheetList.groupID);
        setPayPoints(result)
    }

    function timeout(delay) {
        return new Promise(res => setTimeout(res, delay));
    }

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            array.forEach(dataOne => {
                var payPointName = dataOne.divisionName;
                dataOne.details.forEach(data => {
                    data.details.forEach(row => {
                        var vr = {
                            'Pay Point': payPointName,
                            'Reg.No': row.registrationNumber,
                            'PF.No': row.epfNumber == null || row.epfNumber == "" || row.epfNumber == "NULL" ? '-' : row.epfNumber,
                            'Emp.Name': row.firstName,
                            'Work Days': row.workCount <= 0 ? '-' : parseInt(row.workCount),
                            'Pluck Kgs': row.pluckQty == 0 ? '-' : row.pluckQty.toFixed(2),
                            'Latex Kgs': '-',
                            'Cash Wages': row.otAmount == 0 ? '-' : row.otAmount.toFixed(2),
                            'Over Kilo Amt': '-',
                            'Leave Wages': row.leaveAmount === 0 ? '-' : row.leaveAmount.toFixed(2),
                            'O.T Wages': '-',
                            'B/F': '-',
                            'Gross': row.totalEarnings === 0 ? '-' : row.totalEarnings.toFixed(2),
                            'P.F.': row.pfDeductionAmount === 0 ? '-' : Math.round(row.pfDeductionAmount).toFixed(2),
                            'Total Deduct.': row.totalDeduction === 0 ? '-' : row.totalDeduction.toFixed(2),
                            'Payable': row.netPayable === 0 ? '-' : row.netPayable.toFixed(2),
                            'C/F': row.roundOff === 0 ? '-' : row.roundOff.toFixed(2),
                            'Net': row.netPay === 0 ? '-' : row.netPay.toFixed(2)
                        };
                        res.push(vr);
                    });
                });
            });
            var grandTotalRow = {
                'Pay Point': 'Grand Total',
                'Reg.No': '-',
                'PF.No': '-',
                'Emp.Name': '-',
                'Work Days': grandTotalValues.workCount <= 0 ? '-' : parseInt(grandTotalValues.workCount),
                'Pluck Kgs': grandTotalValues.pluckQty == 0 ? '-' : grandTotalValues.pluckQty.toFixed(2),
                'Latex Kgs': '-',
                'Cash Wages': grandTotalValues.otAmount == 0 ? '-' : grandTotalValues.otAmount.toFixed(2),
                'Over Kilo Amt': '-',
                'Leave Wages': grandTotalValues.leaveAmount === 0 ? '-' : grandTotalValues.leaveAmount.toFixed(2),
                'O.T Wages': '-',
                'B/F': '-',
                'Gross': grandTotalValues.totalEarnings === 0 ? '-' : grandTotalValues.totalEarnings.toFixed(2),
                'P.F.': grandTotalValues.pfDeductionAmount === 0 ? '-' : grandTotalValues.pfDeductionAmount.toFixed(2),
                'Total Deduct.': grandTotalValues.totalDeduction === 0 ? '-' : grandTotalValues.totalDeduction.toFixed(2),
                'Payable': grandTotalValues.netPayable === 0 ? '-' : grandTotalValues.netPayable.toFixed(2),
                'C/F': grandTotalValues.roundOff === 0 ? '-' : grandTotalValues.roundOff.toFixed(2),
                'Net': grandTotalValues.netPay === 0 ? '-' : grandTotalValues.netPay.toFixed(2)
            };
            res.push(grandTotalRow);
        }
        return res;
    }


    async function createFile() {
        setishidden(false);
        var file = await createDataForExcel(WeeklyPaymentSheetData);
        var settings = {
            sheetName: 'Weekly Payment Report',
            fileName:
                'Weekly Payment Report - ' + selectedSearchValues.date,
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
    async function GetDetails() {
        let model = {
            groupID: parseInt(WeeklyPaymentSheetList.groupID),
            gardenID: parseInt(WeeklyPaymentSheetList.gardenID),
            payPointID: parseInt(WeeklyPaymentSheetList.payPointID),
            applicableDate: new Date(WeeklyPaymentSheetList.date),
        }

        getSelectedDropdownValuesForReport(model);
        const response = await services.GetWeeklyPaymentSheet(model);
        if (response.statusCode == "Success" && response.data.length != 0) {
            const result = _.cloneDeep(response.data);

            result.forEach(x => {
                x.details.forEach(y => {
                    x.employeeSubCategoryName = y.employeeSubCategoryName;
                    x.payPointID = y.payPointID;
                    x.divisionName = y.divisionName;
                    x.pluckQty = x.pluckQty == undefined ? 0 + y.pluckQty : x.pluckQty + y.pluckQty;
                    x.otAmount = x.otAmount == undefined ? 0 + y.otAmount : x.otAmount + y.otAmount;
                    x.grossAmount = x.grossAmount == undefined ? 0 + (y.grossAmount)
                        : x.grossAmount + y.grossAmount
                    x.leaveAmount = x.leaveAmount == undefined ? 0 + (y.employeeLeaveRequestID == 0 ? 0 : y.grossAmount)
                        : x.leaveAmount + (y.employeeLeaveRequestID == 0 ? 0 : y.grossAmount)

                    x.leaveCount = x.leaveCount == undefined ? 0 + (y.employeeLeaveRequestID == 0 ? 0 : 1)
                        : x.leaveCount + (y.employeeLeaveRequestID == 0 ? 0 : 1)

                    x.deduction = x.deduction == undefined ? 0 + y.deduction : x.deduction + y.deduction
                    x.bcsuAmount = x.bcsuAmount == undefined ? 0 + y.bcsuAmount : x.bcsuAmount + y.bcsuAmount
                    x.otherDeduction = x.otherDeduction == undefined ? 0 + y.otherDeduction : x.otherDeduction + y.otherDeduction
                    x.pfDeductionAmount = x.pfDeductionAmount == undefined ? 0 + y.pfDeductionAmount : x.pfDeductionAmount + y.pfDeductionAmount
                    x.cfpfDeductionAmount = x.cfpfDeductionAmount == undefined ? 0 + y.cfpfDeductionAmount : x.cfpfDeductionAmount + y.cfpfDeductionAmount
                    x.rationDeduction = x.rationDeduction == undefined ? y.rationDeduction : y.rationDeduction

                    x.totalCount = x.totalCount == undefined ? 0 + 1 : x.totalCount + 1
                    //x.totalCount = y.paymentDay === 'Sun' ? x.totalCount - 1 : x.totalCount
                    x.totalCount = y.isHoliday == true ? x.totalCount - 1 : x.totalCount
                    x.workCount = x.totalCount - x.leaveCount
                    x.allowance = x.allowance == undefined ? 0 + y.allowance : x.allowance + y.allowance;
                    x.totalEarnings = x.otAmount + x.grossAmount + x.allowance
                    x.totalDeduction = x.deduction + x.bcsuAmount + x.otherDeduction + Math.round(x.pfDeductionAmount) + x.cfpfDeductionAmount + x.rationDeduction

                    x.netPayable = x.totalEarnings - x.totalDeduction
                    x.roundOff = x.netPayable - Math.floor(x.netPayable)
                    x.netPay = x.netPayable - x.roundOff
                    x.date = y.date
                    x.paymentRevisionNo = y.paymentRevisionNo
                    x.employeeTypeID = y.employeeTypeID
                });
            });
            setWeeklyPaymentSheetDataOne(result);
            const groupedData = Object.values(groupBy(result, 'employeeSubCategoryName')).flatMap(group => {
                return Object.values(groupBy(group, 'divisionName')).map(subGroup => ({
                    employeeSubCategoryName: subGroup[0].employeeSubCategoryName,
                    divisionName: subGroup[0].divisionName,
                    details: subGroup
                }));
            });
            const groupedDataOne = Object.values(groupBy(groupedData, 'divisionName')).flatMap(group => {
                return Object.values(groupBy(group, 'divisionName')).map(subGroup => ({
                    divisionName: subGroup[0].divisionName,
                    details: subGroup
                }));
            });
            calTotal(groupedDataOne)
        }
        else {
            alert.error("No Data Found");
        }
    }

    function calTotal(data) {
        const result = _.cloneDeep(data);
        let workCount = 0;
        let otAmount = 0;
        let leaveAmount = 0;
        let totalEarnings = 0;
        let pfDeductionAmount = 0;
        let totalDeduction = 0;
        let pluckQty = 0;

        let netPayable = 0;
        let roundOff = 0;
        let netPay = 0;

        result.forEach(x => {
            x.details.forEach(y => {
                y.details.forEach(z => {
                    y.workCount = y.workCount == undefined ? 0 + z.workCount : y.workCount + z.workCount
                    y.otAmount = y.otAmount == undefined ? 0 + z.otAmount : y.otAmount + z.otAmount
                    y.leaveAmount = y.leaveAmount == undefined ? 0 + z.leaveAmount : y.leaveAmount + z.leaveAmount
                    y.totalEarnings = y.totalEarnings == undefined ? 0 + z.totalEarnings : y.totalEarnings + z.totalEarnings
                    y.pfDeductionAmount = y.pfDeductionAmount == undefined ? 0 + z.pfDeductionAmount : y.pfDeductionAmount + z.pfDeductionAmount
                    y.totalDeduction = y.totalDeduction == undefined ? 0 + z.totalDeduction : y.totalDeduction + z.totalDeduction
                    y.pluckQty = y.pluckQty == undefined ? 0 + z.pluckQty : y.pluckQty + z.pluckQty

                    y.netPayable = y.netPayable == undefined ? 0 + z.netPayable : y.netPayable + z.netPayable
                    y.roundOff = y.roundOff == undefined ? 0 + z.roundOff : y.roundOff + z.roundOff
                    y.netPay = y.netPay == undefined ? 0 + z.netPay : y.netPay + z.netPay
                });
                x.workCount = x.workCount == undefined ? 0 + y.workCount : x.workCount + y.workCount
                x.otAmount = x.otAmount == undefined ? 0 + y.otAmount : x.otAmount + y.otAmount
                x.leaveAmount = x.leaveAmount == undefined ? 0 + y.leaveAmount : x.leaveAmount + y.leaveAmount
                x.totalEarnings = x.totalEarnings == undefined ? 0 + y.totalEarnings : x.totalEarnings + y.totalEarnings
                x.pfDeductionAmount = x.pfDeductionAmount == undefined ? 0 + y.pfDeductionAmount : x.pfDeductionAmount + y.pfDeductionAmount
                x.totalDeduction = x.totalDeduction == undefined ? 0 + y.totalDeduction : x.totalDeduction + y.totalDeduction
                x.pluckQty = x.pluckQty == undefined ? 0 + y.pluckQty : x.pluckQty + y.pluckQty

                x.netPayable = x.netPayable == undefined ? 0 + y.netPayable : x.netPayable + y.netPayable
                x.roundOff = x.roundOff == undefined ? 0 + y.roundOff : x.roundOff + y.roundOff
                x.netPay = x.netPay == undefined ? 0 + y.netPay : x.netPay + y.netPay
            });
            workCount = workCount + x.workCount
            otAmount = otAmount + x.otAmount
            leaveAmount = leaveAmount + x.leaveAmount
            totalEarnings = totalEarnings + x.totalEarnings
            pfDeductionAmount = pfDeductionAmount + x.pfDeductionAmount
            totalDeduction = totalDeduction + x.totalDeduction
            pluckQty = pluckQty + x.pluckQty

            netPayable = netPayable + x.netPayable
            roundOff = roundOff + x.roundOff
            netPay = netPay + x.netPay
        });
        setGrandTotalValues((prevState) => ({
            ...prevState,
            workCount: workCount,
            otAmount: otAmount,
            leaveAmount: leaveAmount,
            totalEarnings: totalEarnings,
            pfDeductionAmount: pfDeductionAmount,
            totalDeduction: totalDeduction,
            pluckQty: pluckQty,
            netPayable: netPayable,
            roundOff: roundOff,
            netPay: netPay
        }));
        setWeeklyPaymentSheetData(result)
    }

    function groupBy(arr, key) {
        return arr.reduce((acc, obj) => {
            const prop = obj[key];
            acc[prop] = acc[prop] || [];
            acc[prop].push(obj);
            return acc;
        }, {});
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
        setWeeklyPaymentSheetList({
            ...WeeklyPaymentSheetList,
            [e.target.name]: value
        });
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: groups[searchForm.groupID],
            gardenName: gardens[searchForm.gardenID],
            costCenterName: costCenters[searchForm.costCenterID],
            payPointID: PayPoints[searchForm.payPointID],
            date: searchForm.applicableDate,
        })
    }

    const isDayDisabled = (date) => {
        return !isSunday(date);
    };

    function handleDateChange(value) {
        setWeeklyPaymentSheetList({
            ...WeeklyPaymentSheetList,
            date: value
        });
    }

    async function paymentComplete() {
        const response = await services.completePayment(WeeklyPaymentSheetDataOne);
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
            closeOnEscape: true,
            closeOnClickOutside: true,
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui'>
                        <Card style={{ justifycontent: 'center', width: '25rem', height: '10rem' }} >
                            <Box p={2}>
                                <Typography variant="h4">
                                    <b>Payment Completion</b>
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                    Are you sure you want to do this.
                                </Typography>
                            </Box>
                            <Box display="flex" flexDirection="row-reverse" p={2} >
                                <Button
                                    type="button"
                                    variant="contained"
                                    color="black"
                                    size='small'
                                    onClick={() => onClose()}
                                >
                                    No
                                </Button>
                                &nbsp;&nbsp;
                                <Button
                                    type="button"
                                    variant="contained"
                                    color="black"
                                    size='small'
                                    onClick={() => trackPromise(paymentComplete(), onClose())}
                                >
                                    Yes
                                </Button>
                            </Box>
                        </Card>
                    </div>
                );
            }
        });
    }

    const getPageMargins = () => {
        return `@media print {
            @page {
                size: Legal Landscape !important;
                margin: 96px 24px 96px 24px !important;
            }
        
            body {
                transform: scale(0.6, 1);
                transform-origin: top left;
            }
        }`;
    };

    return (
        <Page className={classes.root} title={title}>
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: WeeklyPaymentSheetList.groupID,
                        gardenID: WeeklyPaymentSheetList.gardenID,
                        costCenterID: WeeklyPaymentSheetList.costCenterID,
                        payPointID: WeeklyPaymentSheetList.payPointID,
                        date: WeeklyPaymentSheetList.date,
                    }}
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
                                                        value={WeeklyPaymentSheetList.groupID}
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
                                                        Location
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.gardenID && errors.gardenID)}
                                                        fullWidth
                                                        helperText={touched.gardenID && errors.gardenID}
                                                        name="gardenID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={WeeklyPaymentSheetList.gardenID}
                                                        variant="outlined"
                                                        id="gardenID"
                                                        size='small'
                                                        InputProps={{
                                                            readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                        }}
                                                    >
                                                        <MenuItem value="0">--Select Location --</MenuItem>
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
                                                        value={WeeklyPaymentSheetList.payPointID}
                                                        variant="outlined"
                                                        id="payPointID"
                                                        size='small'

                                                    >
                                                        <MenuItem value="0">--Select Pay Point--</MenuItem>
                                                        {generateDropDownMenu(PayPoints)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="date">
                                                        From Date *
                                                    </InputLabel>
                                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                        <KeyboardDatePicker
                                                            autoOk
                                                            fullWidth
                                                            variant="inline"
                                                            format="yyyy-MM-dd"
                                                            margin="dense"
                                                            id="date"
                                                            value={WeeklyPaymentSheetList.date}
                                                            shouldDisableDate={isDayDisabled}
                                                            onChange={(e) => {
                                                                handleDateChange(e);

                                                            }}
                                                            KeyboardButtonProps={{
                                                                'aria-label': 'change date',
                                                            }}
                                                            TextFieldComponent={(props) => (
                                                                <TextField
                                                                    {...props}
                                                                    InputProps={{
                                                                        readOnly: true,
                                                                        endAdornment: props.InputProps.endAdornment,
                                                                    }}
                                                                />
                                                            )}
                                                        />
                                                    </MuiPickersUtilsProvider>
                                                </Grid>
                                                <Grid container justify="flex-end">
                                                    <Box pr={2}>
                                                        <Button
                                                            color="primary"
                                                            variant="contained"
                                                            type="submit"
                                                            size='small'
                                                        >
                                                            Search
                                                        </Button>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                            <br />
                                            <Box minWidth={1050}>
                                                {WeeklyPaymentSheetData.length > 0 ?
                                                    <>
                                                        {WeeklyPaymentSheetData.map((dataOne) => {
                                                            return (
                                                                <>
                                                                    <TableContainer component={Paper}>
                                                                        <TableRow>
                                                                            <TableCell size='small' colSpan={17} align="left" style={{ fontWeight: 'bolder', marginTop: '3px', marginBottom: '3px' }}>
                                                                                Pay Point :  {dataOne.divisionName}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                        <Table className={classes.table} aria-label="simple table" size='small'>
                                                                            <TableHead >
                                                                                <TableRow>
                                                                                    <TableCell align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}>Reg.No</TableCell>
                                                                                    <TableCell align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}>PF.No</TableCell>
                                                                                    <TableCell align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}>Emp.Name</TableCell>
                                                                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}>Work Days</TableCell>
                                                                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}>Pluck Kgs</TableCell>
                                                                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}>Latex Kgs</TableCell>
                                                                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}>Cash Wages</TableCell>
                                                                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}>Over Kilo&nbsp;Amt</TableCell>
                                                                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}>Leave Wages</TableCell>
                                                                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}>O.T Wages</TableCell>
                                                                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}>B/F</TableCell>
                                                                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}>Gross</TableCell>
                                                                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}>P.F.</TableCell>
                                                                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}>Total Deduct.</TableCell>
                                                                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}>Payable</TableCell>
                                                                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}>C/F</TableCell>
                                                                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}>Net</TableCell>
                                                                                </TableRow>
                                                                            </TableHead>
                                                                            <TableBody>
                                                                                {dataOne.details.map((data, i) => {
                                                                                    return (
                                                                                        <React.Fragment key={i}>
                                                                                            <TableRow>
                                                                                                <TableCell colSpan={17} align="left" style={{ fontWeight: 'bolder', color: 'green', borderBottom: '1px solid black', fontSize: '12px' }}>
                                                                                                    Category :  {data.employeeSubCategoryName}
                                                                                                </TableCell>
                                                                                            </TableRow>
                                                                                            {data.details.map((row, k) => {
                                                                                                return (
                                                                                                    <TableRow key={i}>
                                                                                                        <TableCell component="th" scope="row" align="left" style={{ borderBottom: "1px dashed black", fontSize: '12px' }}> {row.registrationNumber}</TableCell>
                                                                                                        <TableCell component="th" scope="row" align="left" style={{ borderBottom: "1px dashed black", fontSize: '12px' }}> {row.epfNumber == null || row.epfNumber == "" || row.epfNumber == "NULL" ? '-' : row.epfNumber}</TableCell>
                                                                                                        <TableCell component="th" scope="row" align="left" style={{ borderBottom: "1px dashed black", fontSize: '12px' }}> {row.firstName}</TableCell>
                                                                                                        <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", fontSize: '12px' }}> {row.workCount <= 0 ? '-' : parseInt(row.workCount)}</TableCell>
                                                                                                        <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", fontSize: '12px' }}> {row.pluckQty == 0 ? '-' : row.pluckQty.toFixed(2)}</TableCell>
                                                                                                        <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", fontSize: '12px' }}> {'-'}</TableCell>
                                                                                                        <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", fontSize: '12px' }}> {row.otAmount == 0 ? '-' : row.otAmount.toFixed(2)}</TableCell>
                                                                                                        <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", fontSize: '12px' }}> {'-'}</TableCell>
                                                                                                        <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", fontSize: '12px' }}> {row.leaveAmount == 0 ? '-' : row.leaveAmount.toFixed(2)}</TableCell>
                                                                                                        <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", fontSize: '12px' }}> {'-'}</TableCell>
                                                                                                        <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", fontSize: '12px' }}> {'-'}</TableCell>
                                                                                                        <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", fontSize: '12px' }}> {row.totalEarnings == 0 ? '-' : row.totalEarnings.toFixed(2)}</TableCell>
                                                                                                        <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", fontSize: '12px' }}> {row.pfDeductionAmount == 0 ? '-' : Math.round(row.pfDeductionAmount).toFixed(2)}</TableCell>
                                                                                                        <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", fontSize: '12px' }}> {row.totalDeduction == 0 ? '-' : row.totalDeduction.toFixed(2)}</TableCell>
                                                                                                        <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", fontSize: '12px' }}> {row.netPayable == 0 ? '-' : row.netPayable.toFixed(2)}</TableCell>
                                                                                                        <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", fontSize: '12px' }}> {row.roundOff == 0 ? '-' : row.roundOff.toFixed(2)}</TableCell>
                                                                                                        <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", fontSize: '12px' }}> {row.netPay == 0 ? '-' : row.netPay.toFixed(2)}</TableCell>
                                                                                                    </TableRow>
                                                                                                );
                                                                                            })}
                                                                                            <TableRow>
                                                                                                <TableCell component="th" scope="row" align="left" colSpan={3} style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> Category Total</TableCell>
                                                                                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {data.workCount <= 0 ? '-' : parseInt(data.workCount)}</TableCell>
                                                                                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {data.pluckQty == 0 ? '-' : data.pluckQty.toFixed(2)}</TableCell>
                                                                                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {'-'}</TableCell>
                                                                                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {data.otAmount == 0 ? '-' : data.otAmount.toFixed(2)}</TableCell>
                                                                                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {'-'}</TableCell>
                                                                                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {data.leaveAmount == 0 ? '-' : data.leaveAmount.toFixed(2)}</TableCell>
                                                                                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {'-'}</TableCell>
                                                                                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {'-'}</TableCell>
                                                                                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {data.totalEarnings == 0 ? '-' : data.totalEarnings.toFixed(2)}</TableCell>
                                                                                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {data.pfDeductionAmount == 0 ? '-' : Math.round(data.pfDeductionAmount).toFixed(2)}</TableCell>
                                                                                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {data.totalDeduction == 0 ? '-' : data.totalDeduction.toFixed(2)}</TableCell>
                                                                                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {data.netPayable == 0 ? '-' : data.netPayable.toFixed(2)}</TableCell>
                                                                                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {data.roundOff == 0 ? '-' : data.roundOff.toFixed(2)}</TableCell>
                                                                                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {data.netPay == 0 ? '-' : data.netPay.toFixed(2)}</TableCell>
                                                                                            </TableRow>
                                                                                        </React.Fragment>
                                                                                    );
                                                                                })}
                                                                            </TableBody>
                                                                            <TableRow>
                                                                                <TableCell component="th" scope="row" align="left" colSpan={3} style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> Outgarden Total</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {dataOne.workCount <= 0 ? '-' : parseInt(dataOne.workCount)}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {dataOne.pluckQty == 0 ? '-' : dataOne.pluckQty.toFixed(2)}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {'-'}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {dataOne.otAmount == 0 ? '-' : dataOne.otAmount.toFixed(2)}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {'-'}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {dataOne.leaveAmount == 0 ? '-' : dataOne.leaveAmount.toFixed(2)}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {'-'}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {'-'}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {dataOne.totalEarnings == 0 ? '-' : dataOne.totalEarnings.toFixed(2)}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {dataOne.pfDeductionAmount == 0 ? '-' : Math.round(dataOne.pfDeductionAmount).toFixed(2)}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {dataOne.totalDeduction == 0 ? '-' : dataOne.totalDeduction.toFixed(2)}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {dataOne.netPayable == 0 ? '-' : dataOne.netPayable.toFixed(2)}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {dataOne.roundOff == 0 ? '-' : dataOne.roundOff.toFixed(2)}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {dataOne.netPay == 0 ? '-' : dataOne.netPay.toFixed(2)}</TableCell>
                                                                            </TableRow>
                                                                        </Table>
                                                                    </TableContainer>

                                                                    <br />
                                                                </>
                                                            );
                                                        })}
                                                        <TableContainer component={Paper}>
                                                            <TableRow>
                                                                <TableCell size='small' colSpan={17} align="left" style={{ fontWeight: 'bolder', marginTop: '3px', marginBottom: '3px' }}>
                                                                    Total Table
                                                                </TableCell>
                                                            </TableRow>
                                                            <Table className={classes.table} aria-label="simple table" size='small'>
                                                                <TableHead >
                                                                    <TableRow>
                                                                        <TableCell align="left" colSpan={3} style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}>Pay Point</TableCell>
                                                                        <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}>Work Days</TableCell>
                                                                        <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}>Pluck Kgs</TableCell>
                                                                        <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}>Latex Kgs</TableCell>
                                                                        <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}>Cash Wages</TableCell>
                                                                        <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}>Over Kilo&nbsp;Amt</TableCell>
                                                                        <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}>Leave Wages</TableCell>
                                                                        <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}>O.T Wages</TableCell>
                                                                        <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}>B/F Wages</TableCell>
                                                                        <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}>Total Earnings</TableCell>
                                                                        <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}>P.F. Amount</TableCell>
                                                                        <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}>Total Deductions</TableCell>
                                                                        <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}>Net Payble</TableCell>
                                                                        <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}>Rounded Off</TableCell>
                                                                        <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}>Net&nbsp;pay</TableCell>
                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                    {WeeklyPaymentSheetData.map((row, i) => {
                                                                        return (
                                                                            <TableRow key={i}>
                                                                                <TableCell align="left" colSpan={3} style={{ fontWeight: "bold", borderBottom: "1px dashed black", fontSize: '12px' }}> {row.divisionName}</TableCell>
                                                                                <TableCell align="right" style={{ fontWeight: "bold", borderBottom: "1px dashed black", fontSize: '12px' }}> {row.workCount <= 0 ? '-' : parseInt(row.workCount)}</TableCell>
                                                                                <TableCell align="right" style={{ fontWeight: "bold", borderBottom: "1px dashed black", fontSize: '12px' }}> {row.pluckQty == 0 ? '-' : row.pluckQty.toFixed(2)}</TableCell>
                                                                                <TableCell align="right" style={{ fontWeight: "bold", borderBottom: "1px dashed black", fontSize: '12px' }}> {'-'}</TableCell>
                                                                                <TableCell align="right" style={{ fontWeight: "bold", borderBottom: "1px dashed black", fontSize: '12px' }}> {row.otAmount == 0 ? '-' : row.otAmount.toFixed(2)}</TableCell>
                                                                                <TableCell align="right" style={{ fontWeight: "bold", borderBottom: "1px dashed black", fontSize: '12px' }}> {'-'}</TableCell>
                                                                                <TableCell align="right" style={{ fontWeight: "bold", borderBottom: "1px dashed black", fontSize: '12px' }}> {row.leaveAmount == 0 ? '-' : row.leaveAmount.toFixed(2)}</TableCell>
                                                                                <TableCell align="right" style={{ fontWeight: "bold", borderBottom: "1px dashed black", fontSize: '12px' }}> {'-'}</TableCell>
                                                                                <TableCell align="right" style={{ fontWeight: "bold", borderBottom: "1px dashed black", fontSize: '12px' }}> {'-'}</TableCell>
                                                                                <TableCell align="right" style={{ fontWeight: "bold", borderBottom: "1px dashed black", fontSize: '12px' }}> {row.totalEarnings == 0 ? '-' : row.totalEarnings.toFixed(2)}</TableCell>
                                                                                <TableCell align="right" style={{ fontWeight: "bold", borderBottom: "1px dashed black", fontSize: '12px' }}> {row.pfDeductionAmount == 0 ? '-' : Math.round(row.pfDeductionAmount).toFixed(2)}</TableCell>
                                                                                <TableCell align="right" style={{ fontWeight: "bold", borderBottom: "1px dashed black", fontSize: '12px' }}> {row.totalDeduction == 0 ? '-' : row.totalDeduction.toFixed(2)}</TableCell>
                                                                                <TableCell align="right" style={{ fontWeight: "bold", borderBottom: "1px dashed black", fontSize: '12px' }}> {row.netPayable == 0 ? '-' : row.netPayable.toFixed(2)}</TableCell>
                                                                                <TableCell align="right" style={{ fontWeight: "bold", borderBottom: "1px dashed black", fontSize: '12px' }}> {row.roundOff == 0 ? '-' : row.roundOff.toFixed(2)}</TableCell>
                                                                                <TableCell align="right" style={{ fontWeight: "bold", borderBottom: "1px dashed black", fontSize: '12px' }}> {row.netPay == 0 ? '-' : row.netPay.toFixed(2)}</TableCell>
                                                                            </TableRow>
                                                                        )
                                                                    })}
                                                                </TableBody>
                                                                <TableRow>
                                                                    <TableCell component="th" scope="row" align="left" colSpan={3} style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> Grand Total</TableCell>
                                                                    <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {grandTotalValues.workCount <= 0 ? '-' : parseInt(grandTotalValues.workCount)}</TableCell>
                                                                    <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {grandTotalValues.pluckQty == 0 ? '-' : grandTotalValues.pluckQty.toFixed(2)}</TableCell>
                                                                    <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {'-'}</TableCell>
                                                                    <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {grandTotalValues.otAmount == 0 ? '-' : grandTotalValues.otAmount.toFixed(2)}</TableCell>
                                                                    <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {'-'}</TableCell>
                                                                    <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {grandTotalValues.leaveAmount == 0 ? '-' : grandTotalValues.leaveAmount.toFixed(2)}</TableCell>
                                                                    <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {'-'}</TableCell>
                                                                    <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {'-'}</TableCell>
                                                                    <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {grandTotalValues.totalEarnings == 0 ? '-' : grandTotalValues.totalEarnings.toFixed(2)}</TableCell>
                                                                    <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {grandTotalValues.pfDeductionAmount == 0 ? '-' : Math.round(grandTotalValues.pfDeductionAmount).toFixed(2)}</TableCell>
                                                                    <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {grandTotalValues.totalDeduction == 0 ? '-' : grandTotalValues.totalDeduction.toFixed(2)}</TableCell>
                                                                    <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {grandTotalValues.netPayable == 0 ? '-' : grandTotalValues.netPayable.toFixed(2)}</TableCell>
                                                                    <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {grandTotalValues.roundOff == 0 ? '-' : grandTotalValues.roundOff.toFixed(2)}</TableCell>
                                                                    <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px' }}> {grandTotalValues.netPay == 0 ? '-' : grandTotalValues.netPay.toFixed(2)}</TableCell>
                                                                </TableRow>
                                                            </Table>
                                                        </TableContainer>
                                                    </>
                                                    : null}
                                            </Box>
                                        </CardContent>
                                        {WeeklyPaymentSheetData.length > 0 ?
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
                                                <style>{getPageMargins()}</style>
                                                <ReactToPrint
                                                    documentTitle={"Weekly Payment Sheet Report"}
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
                                                        searchData={selectedSearchValues} WeeklyPaymentSheetData={WeeklyPaymentSheetData} grandTotalValues={grandTotalValues}
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