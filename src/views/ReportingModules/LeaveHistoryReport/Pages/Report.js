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
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import moment from 'moment';
import xlsx from 'json-as-xlsx';
import _ from 'lodash';

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

const screenCode = 'LEAVEHISTORYREPORT';

export default function LeaveHistoryReport(props) {
    const [title, setTitle] = useState("Leave History")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [gardens, setGardens] = useState([]);
    const [costCenters, setCostCenters] = useState();
    const [PayPoints, setPayPoints] = useState();
    const [employeeSubCategoryMapping, setEmployeeSubCategoryMapping] = useState();
    const [leaveTypes, setLeaveTypes] = useState();
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const januaryFirst = new Date(year, 0, 1);
    januaryFirst.setDate(januaryFirst.getDate() + 1);
    const [fromDate, handleFromDate] = useState(januaryFirst.toISOString().substr(0, 10));
    const [toDate, handleToDate] = useState(currentDate.toISOString().substr(0, 10));
    const [leaveData, setLeaveData] = useState([]);
    const [leaveDataList, setLeaveDataList] = useState({
        groupID: '0',
        gardenID: '0',
        costCenterID: '0',
        payPointID: '0',
        statusID: '0',
        employeeSubCategoryMappingID: '0',
        leaveTypeID: '0',
        regNo: '',
        fromDate: new Date().toISOString().substr(0, 10),
        toDate: new Date().toISOString().substr(0, 10)
    })
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: "0",
        gardenName: "0",
        costCenterName: "0",
        payPointName: '',
        employeeSubCategoryName: "",
        leaveTypeName: "",
        fromDate: '',
        toDate: '',
        status: ''
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
    const [initialState, setInitialState] = useState(false);
    const [csvHeaders, setCsvHeaders] = useState([]);

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission(), GetAllEmployeeSubCategoryMapping());
    }, []);

    useEffect(() => {
        if (!initialState) {
            trackPromise(getPermission());
        }
    }, []);

    useEffect(() => {
        if (initialState) {
            setLeaveDataList((prevState) => ({
                ...prevState,
                gardenID: 0,
                costCenterID: 0,
                payPointID: 0
            }));
        }
    }, [leaveDataList.groupID, initialState]);

    useEffect(() => {
        if (initialState) {
            setLeaveDataList((prevState) => ({
                ...prevState,
                costCenterID: 0
            }));
        }
    }, [leaveDataList.gardenID, initialState]);

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID(),
            getLeaveTypeForDropdown());
    }, [leaveDataList.groupID]);

    useEffect(() => {
        setLeaveDataList((prevState) => ({
            ...prevState,
            costCenterID: "0"
        }));
    }, [leaveDataList.groupID]);

    useEffect(() => {
        trackPromise(
            getCostCenterDetailsByGardenID()
        )
    }, [leaveDataList.gardenID]);

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID(),
            GetDivisionDetailsByGroupID());
    }, [leaveDataList.groupID]);

    useEffect(() => {
        setLeaveData([])
    }, [leaveDataList]);

    const handleLimitChange = (event) => {
        setLimit(event.target.value);
    };
    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWLEAVEHISTORYREPORT');

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

        setLeaveDataList({
            ...leaveDataList,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            gardenID: parseInt(tokenService.getFactoryIDFromToken())
        })
        setInitialState(true);
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(leaveDataList.groupID);
        setGardens(response);
    };

    async function GetDivisionDetailsByGroupID() {
        const result = await services.GetDivisionDetailsByGroupID(leaveDataList.groupID);
        setPayPoints(result)
    }

    async function getCostCenterDetailsByGardenID() {
        var response = await services.getDivisionDetailsByEstateID(leaveDataList.gardenID);
        const elementCount = response.reduce((count) => count + 1, 0);
        var generated = generateDropDownMenu(response)
        if (elementCount === 1) {
            setLeaveDataList((prevState) => ({
                ...prevState,
                costCenterID: generated[0].props.value,
            }));
        }
        setCostCenters(response);
    };

    async function GetAllEmployeeSubCategoryMapping() {
        var result = await services.GetAllEmployeeSubCategoryMapping();
        setEmployeeSubCategoryMapping(result)
    }

    async function getLeaveTypeForDropdown() {
        const leaveTypes = await services.getEmployeeLeaveType(leaveDataList.groupID);
        let leaveTypeArray = []
        for (let item of Object.entries(leaveTypes)) {
            leaveTypeArray[item[1]["employeeLeaveTypeID"]] = item[1]["employeeLeaveTypeName"]
        }
        setLeaveTypes(leaveTypeArray);
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
            legalEntity: parseInt(leaveDataList.groupID),
            garden: parseInt(leaveDataList.gardenID),
            costCenter: parseInt(leaveDataList.costCenterID),
            payPointID: parseInt(leaveDataList.payPointID),
            status: parseInt(leaveDataList.statusID),
            employeeSubCategoryMappingID: parseInt(leaveDataList.employeeSubCategoryMappingID),
            leaveTypeID: parseInt(leaveDataList.leaveTypeID),
            registrationNumber: leaveDataList.regNo,
            fromDate: moment(fromDate).format('YYYY-MM-DD'),
            toDate: moment(toDate).format('YYYY-MM-DD')
        }
        getSelectedDropdownValuesForReport(model);
        const response = await services.GetLeaveDetails(model);
        if (response.statusCode == "Success" && response.data != null) {
            setLeaveData(response.data);
            createDataForExcel(response.data);
        } else {
            setLeaveData([]);
            alert.error("No records to display");
        }
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

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            array.map(emp => {
                emp.details.map(leave => {
                    leave.details.map(x => {
                        var vr = {
                            'Reg.Number': x.employeeID,
                            'Emp.Type': x.employeeTypeName,
                            'Emp.Name': x.firstName,
                            'Leave Type': x.leaveTypeName,
                            'Location': x.factoryName,
                            'Sub Division': x.subDivisionName,
                            'Pay Point': x.payPointName,
                            'Employee Sub Category': x.employeeSubCategoryName,
                            'From Date': moment(x.fromDate).format('YYYY-MM-DD'),
                            'To Date': moment(x.toDate).format('YYYY-MM-DD'),
                            'Date Count': x.noOfDays,
                            'Status': x.status,
                            'Approved by': x.approvedbyOrRejectedby,
                        };
                        res.push(vr)
                    })
                });
            });
            const statusText = 'Status - ' + (
                selectedSearchValues.status == 1 ? "Pending" :
                    selectedSearchValues.status == 2 ? "Approved" :
                        selectedSearchValues.status == 3 ? "Rejected" :
                            selectedSearchValues.status == 4 ? "Cancelled" : "All"
            );
            // res.push([]);
            var vr = {
                'Reg.Number': 'Business Division - ' + selectedSearchValues.groupName,
                'Emp.Type': selectedSearchValues.gardenName === undefined ? 'Location - All' : 'Location - ' + selectedSearchValues.gardenName,
                'Emp.Name': selectedSearchValues.costCenterName === undefined ? 'Sub-Division - All' : 'Sub-Division - ' + selectedSearchValues.costCenterName,
                'Leave Type': selectedSearchValues.payPointName === undefined ? 'Pay Point - All' : 'Pay Point - ' + selectedSearchValues.payPointName,
                'Location': selectedSearchValues.employeeSubCategoryName === undefined ? 'Employee Sub Category - All' : 'Employee Sub Category - ' + selectedSearchValues.employeeSubCategoryName,
                'Sub Division': selectedSearchValues.leaveTypeName === undefined ? 'Leave Type - All' : 'Leave Type - ' + selectedSearchValues.leaveTypeName,
                'Pay Point': 'From Date - ' + moment(selectedSearchValues.fromDate).format('YYYY-MM-DD'),
                'Employee Sub Category': 'To Date - ' + moment(selectedSearchValues.toDate).format('YYYY-MM-DD'),
                'From Date': statusText,
            };
            res.push(vr);
        }
        return res;
    }

    async function createFile() {
        var file = await createDataForExcel(leaveData);
        var settings = {
            sheetName: 'Leave History Report',
            fileName:
                'Leave History Report ' + moment(selectedSearchValues.fromDate).format('YYYY/MM/DD') + '-' + moment(selectedSearchValues.toDate).format('YYYY/MM/DD')

        };

        let keys = Object.keys(file[0]);
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem });
        });

        let dataA = [
            {
                sheet: 'Leave History Report',
                columns: tempcsvHeaders,
                content: file
            }
        ];
        xlsx(dataA, settings);
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
        setLeaveDataList({
            ...leaveDataList,
            [e.target.name]: value
        });
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: groups[searchForm.legalEntity],
            gardenName: gardens[searchForm.garden],
            costCenterName: costCenters[searchForm.costCenter],
            payPointName: PayPoints[searchForm.payPointID],
            employeeSubCategoryName: employeeSubCategoryMapping[searchForm.employeeSubCategoryMappingID],
            leaveTypeName: leaveTypes[searchForm.leaveTypeID],
            toDate: toDate,
            fromDate: fromDate,
            status: leaveDataList.statusID
        })
    }

    return (
        <Page className={classes.root} title={title}>
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: leaveDataList.groupID,
                        gardenID: leaveDataList.gardenID,
                        costCenterID: leaveDataList.costCenterID,
                        payPointID: leaveDataList.payPointID,
                        statusID: leaveDataList.statusID,
                        employeeSubCategoryMappingID: leaveDataList.employeeSubCategoryMappingID,
                        leaveTypeID: leaveDataList.leaveTypeID,
                        regNo: leaveDataList.regNo,
                        fromDate: fromDate,
                        todate: toDate
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Business Division is required').min("1", 'Business Division is required'),
                            fromDate: Yup.date().required('From Date is required'),
                            todate: Yup.date().required('To Date is required')
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
                                                        value={leaveDataList.groupID}
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
                                                        Location
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.gardenID && errors.gardenID)}
                                                        fullWidth
                                                        helperText={touched.gardenID && errors.gardenID}
                                                        name="gardenID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={leaveDataList.gardenID}
                                                        variant="outlined"
                                                        id="gardenID"
                                                        size='small'
                                                        placeholder='--Select Garden--'
                                                    >
                                                        <MenuItem value="0">--All Locations--</MenuItem>
                                                        {generateDropDownMenu(gardens)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="costCenterID">
                                                        Sub-Division
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="costCenterID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={leaveDataList.costCenterID}
                                                        variant="outlined"
                                                        id="costCenterID"
                                                        size='small'
                                                    >
                                                        <MenuItem value="0">--All Sub-Divisions--</MenuItem>
                                                        {generateDropDownMenu(costCenters)}
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
                                                        value={leaveDataList.payPointID}
                                                        variant="outlined"
                                                        id="payPointID"
                                                        size='small'
                                                    >
                                                        <MenuItem value="0">--All Pay Points--</MenuItem>
                                                        {generateDropDownMenu(PayPoints)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="employeeSubCategoryMappingID">
                                                        Employee Category
                                                    </InputLabel>
                                                    <TextField select fullWidth
                                                        size='small'
                                                        onBlur={handleBlur}
                                                        id="employeeSubCategoryMappingID"
                                                        name="employeeSubCategoryMappingID"
                                                        value={leaveDataList.employeeSubCategoryMappingID}
                                                        type="text"
                                                        variant="outlined"
                                                        onChange={(e) => handleChange(e)}
                                                    >
                                                        <MenuItem value="0">--All Employee Categories--</MenuItem>
                                                        {generateDropDownMenu(employeeSubCategoryMapping)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="leaveTypeID">
                                                        Leave Type
                                                    </InputLabel>
                                                    <TextField
                                                        select fullWidth
                                                        name="leaveTypeID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={leaveDataList.leaveTypeID}
                                                        variant="outlined"
                                                        id="leaveTypeID"
                                                        size="small"
                                                    >
                                                        <MenuItem value="0">--All Leave Types--</MenuItem>
                                                        {generateDropDownMenu(leaveTypes)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="statusID">
                                                        Status
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.statusID && errors.statusID)}
                                                        fullWidth
                                                        helperText={touched.statusID && errors.statusID}
                                                        name="statusID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={leaveDataList.statusID}
                                                        variant="outlined"
                                                        id="statusID"
                                                        size='small'
                                                    >
                                                        <MenuItem value="0">--All Status--</MenuItem>
                                                        <MenuItem value="1">Pending</MenuItem>
                                                        <MenuItem value="2">Approved</MenuItem>
                                                        <MenuItem value="3">Rejected</MenuItem>
                                                        <MenuItem value="4">Cancelled</MenuItem>

                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12} >
                                                    <InputLabel shrink id="regNo">
                                                        Registration No.
                                                    </InputLabel>
                                                    <TextField
                                                        fullWidth
                                                        size='small'
                                                        name="regNo"
                                                        onChange={(e) => handleChange(e)}
                                                        value={leaveDataList.regNo}
                                                        variant="outlined"
                                                        id="regNo"
                                                    >
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
                                                            format="yyyy-MM-dd"
                                                            margin="dense"
                                                            name='todate'
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
                                                            format="yyyy-MM-dd"
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
                                            <br />
                                            <Box minWidth={1050}>
                                                <br>
                                                </br>
                                                {leaveData.length != 0 ?
                                                    <Card>
                                                        <TableContainer component={Paper}>
                                                            <Table className={classes.table} aria-label="simple table" size='small'>
                                                                <TableHead>
                                                                    <TableRow>
                                                                        <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Reg.No.</TableCell>
                                                                        <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Emp.Name</TableCell>
                                                                        <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>From Date</TableCell>
                                                                        <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>To Date</TableCell>
                                                                        <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Day Count</TableCell>
                                                                        <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}> Status </TableCell>
                                                                        <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Approved by</TableCell>
                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                    {leaveData.map((data, i) => {
                                                                        return (
                                                                            <React.Fragment key={i}>
                                                                                <TableRow>
                                                                                    <TableCell colSpan={2} component="th" scope="row" align="left" style={{ fontWeight: 'bolder', color: 'green', borderLeft: '1px solid black', borderBottom: '1px dashed black', padding: '3px' }}>Reg.No. : {data.employeeID}</TableCell>
                                                                                    <TableCell colSpan={2} component="th" scope="row" align="left" style={{ fontWeight: 'bolder', color: 'green', borderBottom: '1px dashed black', padding: '3px' }}>No.of Days : {data.noOfDays}</TableCell>
                                                                                    <TableCell colSpan={3} component="th" scope="row" align="left" style={{ fontWeight: 'bolder', color: 'green', borderBottom: '1px dashed black', borderRight: '1px solid black', padding: '3px' }}> Emp.Name : {data.firstName} </TableCell>
                                                                                </TableRow>
                                                                                {data.details.map((row, k) => {
                                                                                    return (
                                                                                        <>
                                                                                            <TableRow>
                                                                                                <TableCell colSpan={2} component="th" scope="row" align="left" style={{ fontWeight: 'bolder', color: 'blue', borderLeft: '1px solid black', borderBottom: '1px dashed black', padding: '3px' }}>Leave Type : {row.leaveTypeName}</TableCell>
                                                                                                <TableCell colSpan={5} component="th" scope="row" align="left" style={{ fontWeight: 'bolder', color: 'blue', borderBottom: '1px dashed black', borderRight: '1px solid black', padding: '3px' }}>No.of Days : {row.noOfDays}</TableCell>
                                                                                            </TableRow>
                                                                                            {row.details.map((item, j) => {
                                                                                                return (
                                                                                                    <TableRow key={`${k}-${j}`}>
                                                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {item.employeeID}</TableCell>
                                                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {item.firstName}</TableCell>
                                                                                                        <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black" }}> {moment(item.fromDate).format('YYYY-MM-DD')}</TableCell>
                                                                                                        <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black" }}> {moment(item.toDate).format('YYYY-MM-DD')}</TableCell>
                                                                                                        <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black" }}> {item.noOfDays}</TableCell>
                                                                                                        <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black" }}> {item.status}</TableCell>
                                                                                                        <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black" }}> {item.approvedbyOrRejectedby}</TableCell>
                                                                                                    </TableRow>
                                                                                                )
                                                                                            })}
                                                                                        </>
                                                                                    );
                                                                                })}
                                                                            </React.Fragment>
                                                                        );
                                                                    })}
                                                                </TableBody>
                                                            </Table>
                                                            <TablePagination
                                                                component="div"
                                                                count={leaveData.length}
                                                                onChangePage={handlePageChange}
                                                                onChangeRowsPerPage={handleLimitChange}
                                                                page={page}
                                                                rowsPerPage={limit}
                                                                rowsPerPageOptions={[5, 10, 25]}
                                                            />
                                                        </TableContainer>
                                                    </Card>
                                                    : null}
                                            </Box>
                                        </CardContent>
                                        {leaveData.length > 0 ?
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                <Button
                                                    color="primary"
                                                    id="btnRecord"
                                                    type="button"
                                                    variant="contained"
                                                    style={{ marginRight: '1rem' }}
                                                    className={classes.colorRecord}
                                                    onClick={() => createFile()}
                                                    size='small'
                                                >
                                                    EXCEL
                                                </Button>
                                                <ReactToPrint
                                                    documentTitle={'Leave History Report'}
                                                    trigger={() => (
                                                        <Button
                                                            color="primary"
                                                            id="btnRecord"
                                                            type="submit"
                                                            variant="contained"
                                                            style={{ marginRight: '1rem' }}
                                                            className={classes.colorCancel}
                                                            size="small"
                                                        >
                                                            PDF
                                                        </Button>
                                                    )}
                                                    content={() => componentRef.current}
                                                />
                                                <div hidden={true}>
                                                    <CreatePDF
                                                        ref={componentRef}
                                                        reportData={leaveData}
                                                        searchData={selectedSearchValues}
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