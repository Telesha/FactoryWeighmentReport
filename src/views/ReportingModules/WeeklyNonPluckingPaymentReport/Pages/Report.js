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
    InputLabel
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
import { border } from '@material-ui/system';
import _, { map, set } from 'lodash';
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

const screenCode = 'WEEKLYNONPLUCKINGPAYMENTREPORT';

export default function WeeklyCashPaymentReport(props) {
    const [title, setTitle] = useState("Weekly Non Plucking Payment Report")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [gardens, setGardens] = useState([]);
    const [costCenters, setCostCenters] = useState();
    const [dailylabourData, setDailylabourData] = useState([]);
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [employeeType, setEmployeeType] = useState();
    const [gangs, setGangs] = useState([]);
    const [fromDate, handleFromDate] = useState(new Date());
    const [toDate, handleToDate] = useState(new Date());
    const [dailylabourDataList, setDailylabourDataList] = useState({
        fromDate: new Date().toISOString().substr(0, 10),
        toDate: new Date().toISOString().substr(0, 10),
        empTypeID: '0',
        registrationNumber: '',
        groupID: '0',
        gardenID: '0',
        costCenterID: '0',
        bookNumber: '',
        gangID: '0'
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

    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const componentRef = useRef();
    const navigate = useNavigate();
    const alert = useAlert();
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission());
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
    }, [dailylabourDataList.gardenID]);

    useEffect(() => {
        setDailylabourData([])
    }, [dailylabourDataList.costCenterID]);

    useEffect(() => {
        setDailylabourData([])
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
        if (dailylabourDataList.costCenterID != 0) {
            getGangDetailsByDivisionID();
        }
    }, [dailylabourDataList.costCenterID]);

    const handleLimitChange = (event) => {
        setLimit(event.target.value);
    };
    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWWEEKLYNONPLUCKINGPAYMENTREPORT');

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
        setGangs(response);
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

    function generateDropDownMenuWithTwoValues(data) {
        let items = []
        if (data != null) {
            for (const [key, value] of Object.entries(data)) {
                items.push(<MenuItem key={key} value={key}>{value.name}</MenuItem>);
            }
        }
        return items
    }

    async function GetDetails() {

        let model = {
            groupID: parseInt(dailylabourDataList.groupID),
            gardenID: parseInt(dailylabourDataList.gardenID),
            employeeTypeID: parseInt(dailylabourDataList.empTypeID),
            registrationNumber: (dailylabourDataList.registrationNumber),
            fromDate: new Date(dailylabourDataList.fromDate),
            toDate: new Date(dailylabourDataList.toDate),
            bookNumber: (dailylabourDataList.bookNumber),
            gangID: parseInt(dailylabourDataList.gangID)

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
                    } else if (record.paymentDay === "Tue") {
                        existingGroup.TueTotal = record.grossAmount;
                        existingGroup.TuePf = record.pfDeductionAmount;
                    } else if (record.paymentDay === "Wed") {
                        existingGroup.WedTotal = record.grossAmount;
                        existingGroup.WedPf = record.pfDeductionAmount;
                    } else if (record.paymentDay === "Thu") {
                        existingGroup.ThuTotal = record.grossAmount;
                        existingGroup.ThuPf = record.pfDeductionAmount;
                    } else if (record.paymentDay === "Fri") {
                        existingGroup.FriTotal = record.grossAmount;
                        existingGroup.FriPf = record.pfDeductionAmount;
                    } else if (record.paymentDay === "Sat") {
                        existingGroup.SatTotal = record.grossAmount;
                        existingGroup.SatPf = record.pfDeductionAmount;
                    } else if (record.paymentDay === "Sun") {
                        existingGroup.SunTotal = record.grossAmount;
                        existingGroup.SunPf = record.pfDeductionAmount;
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
                    };
                    groupedData.push(newGroup);
                }
            });
            groupedData.forEach(x => {
                x.wagesTotal = x.MonTotal + x.TueTotal + x.WedTotal + x.ThuTotal + x.FriTotal + x.SatTotal + x.SunTotal
                x.totalGross = x.wagesTotal + x.allowance
                x.pfDeductionAmount = x.MonPf + x.TuePf + x.WedPf + x.ThuPf + x.FriPf + x.SatPf + x.SunPf
                x.totalNet = x.totalGross - x.pfDeductionAmount
                x.payable = Math.floor((x.totalNet) / 10) * 10
                x.broughtForward = x.totalNet - x.payable
            });
            setDailylabourData(groupedData);
        }
        else {
            alert.error(response.message);
        }
    }

    async function createDataForExcel(array) {
        var res = [];

        if (array != null) {
            array.map(x => {
                var vr = {
                    'Emp.ID': x.registrationNumber,
                    'Emp.Name': x.firstName,
                    'Emp.Type': x.employeeTypeName,
                    'PF.No': x.pfNumber,
                    'C.FWRD': "0.00",
                    'Sat': x.SatTotal.toFixed(2),
                    'Sun': x.SunTotal.toFixed(2),
                    'Mon': x.MonTotal.toFixed(2),
                    'Tue': x.TueTotal.toFixed(2),
                    'Wed': x.WedTotal.toFixed(2),
                    'Thu': x.ThuTotal.toFixed(2),
                    'Fri': x.FriTotal.toFixed(2),
                    'Wages Total': x.wagesTotal.toFixed(2),
                    'Other Earnings': x.allowance.toFixed(2),
                    'Gross Pay': x.totalGross.toFixed(2),
                    'PF': x.pfDeductionAmount.toFixed(2),
                    'Net Pay': x.totalNet.toFixed(2),
                    'Payable': x.payable.toFixed(2),
                    'B.FWRD': x.broughtForward.toFixed(2),
                };
                res.push(vr);
            });
            res.push([]);
            var vr = {
                'Emp.ID': 'Legal Entity: ' + selectedSearchValues.groupName,
                'Emp.Name': 'Garden: ' + selectedSearchValues.gardenName,
                'Emp.Type': selectedSearchValues.empTypeName === undefined ? 'Employee Type: All Employee Types' : 'Employee Type: ' + selectedSearchValues.empTypeName,
                'PF.No': selectedSearchValues.gangName === undefined ? 'Duffa: All Duffas' : 'Duffa: ' + selectedSearchValues.gangName,
                'C.FWRD': 'From: ' + selectedSearchValues.fromDate,
                'Sat': 'To: ' + selectedSearchValues.toDate,
                'Sun': selectedSearchValues.registrationNumber == "" ? 'Reg.No: -' : 'Reg.No: ' + selectedSearchValues.registrationNumber,
                'Mon': selectedSearchValues.bookNumber == "" ? 'Book Number: -' : 'Book Number: ' + selectedSearchValues.bookNumber,
            };
            res.push(vr);
        }

        return res;
    }

    async function createFile() {
        var file = await createDataForExcel(dailylabourData);
        var settings = {
            sheetName: 'Weekly Non Plu Payment Report',
            fileName:
                'Weekly Non Plu Payment Report - ' +
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
                sheet: 'Weekly Non Plu Payment Report',
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
            empTypeName: employeeType[searchForm.empTypeID],
            fromDate: dailylabourDataList.fromDate,
            toDate: dailylabourDataList.toDate,
            gangName: gangs[searchForm.gangID],
            registrationNumber: searchForm.registrationNumber,
            bookNumber: searchForm.bookNumber
        })
    }

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
                            toDate: Yup.date().required('To Date is required')
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
                                                <Grid item md={4} xs={8}>
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

                                                <Grid item md={4} xs={8}>
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
                                                <Grid item md={4} xs={8}>
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
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="gangID">
                                                        Duffa
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="gangID"
                                                        onBlur={handleBlur}
                                                        size='small'
                                                        onChange={(e) => {
                                                            handleChange(e)
                                                        }}
                                                        value={dailylabourDataList.gangID}
                                                        variant="outlined"
                                                        id="gangID"
                                                    >
                                                        <MenuItem value={'0'}>--Select Duffa--</MenuItem>
                                                        {generateDropDownMenu(gangs)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="fromDate">From Date *</InputLabel>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <KeyboardDatePicker
                                                                error={Boolean(touched.fromDate && errors.fromDate)}
                                                                fullWidth
                                                                helperText={touched.fromDate && errors.fromDate}
                                                                variant="inline"
                                                                format="yyyy/MM/dd"
                                                                margin="dense"
                                                                name='fromDate'
                                                                id='fromDate'
                                                                size='small'
                                                                value={fromDate}
                                                                onChange={(e) => {
                                                                    handleFromDate(e)
                                                                }}
                                                                KeyboardButtonProps={{
                                                                    'aria-label': 'change fromDate',
                                                                }}
                                                                autoOk
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="todate">To Date *</InputLabel>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <KeyboardDatePicker
                                                                error={Boolean(touched.todate && errors.todate)}
                                                                fullWidth
                                                                helperText={touched.todate && errors.todate}
                                                                variant="inline"
                                                                format="yyyy/MM/dd"
                                                                margin="dense"
                                                                name='todate'
                                                                id='todate'
                                                                size='small'
                                                                value={toDate}
                                                                onChange={(e) => {
                                                                    handleToDate(e)
                                                                }}
                                                                KeyboardButtonProps={{
                                                                    'aria-label': 'change todate',
                                                                }}
                                                                minDate={fromDate}
                                                                autoOk
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="registrationNumber">
                                                        Registration Number
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
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="bookNumber">
                                                        Book Number
                                                    </InputLabel>
                                                    <TextField
                                                        fullWidth
                                                        size='small'
                                                        name="bookNumber"
                                                        onChange={(e) => handleChange(e)}
                                                        value={dailylabourDataList.bookNumber}
                                                        variant="outlined"
                                                        id="bookNumber"
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
                                                                    <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Emp.ID</TableCell>
                                                                    <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Emp.Name</TableCell>
                                                                    <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Emp.Type</TableCell>
                                                                    <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>PF.No</TableCell>
                                                                    <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>C.FWRD</TableCell>
                                                                    <TableCell align="center" colSpan="8" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Wages</TableCell>
                                                                    <TableCell align="center" colSpan="1" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Other Earnings</TableCell>
                                                                    <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Gross Pay</TableCell>
                                                                    <TableCell align="center" colSpan="1" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Deduction</TableCell>
                                                                    <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Net Pay</TableCell>
                                                                    <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Payable</TableCell>
                                                                    <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>B.FWRD</TableCell>
                                                                </TableRow>
                                                                <TableRow>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Sat</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Sun</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Mon</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Tue</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Wed</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Thu</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Fri</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Total</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Allowance</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>PF</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {dailylabourData.slice(page * limit, page * limit + limit).map((row, i) => (
                                                                    <TableRow key={i}
                                                                    >
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.registrationNumber}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.firstName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.employeeTypeName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.pfNumber == null ? "-" : row.pfNumber}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {"0.00"}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.SatTotal == 0 ? "-" : row.SatTotal.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.SunTotal == 0 ? "-" : row.SunTotal.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.MonTotal == 0 ? "-" : row.MonTotal.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.TueTotal == 0 ? "-" : row.TueTotal.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.WedTotal == 0 ? "-" : row.WedTotal.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.ThuTotal == 0 ? "-" : row.ThuTotal.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.FriTotal == 0 ? "-" : row.FriTotal.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.wagesTotal.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.allowance.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.totalGross.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.pfDeductionAmount.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.totalNet.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.payable.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.broughtForward.toFixed(2)}</TableCell>
                                                                    </TableRow>
                                                                )
                                                                )}
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
                                                    documentTitle={"Weekly Non Plucking Payment Report"}
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