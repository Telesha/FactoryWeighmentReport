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
    Chip
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
import moment from 'moment';
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
import xlsx from 'json-as-xlsx';
import CircleIcon from '@mui/icons-material/Circle';

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

const screenCode = 'WORKERATTENDANCENONPLUKINGREPORT';

export default function WorkerAttendanceNonPlukingReport(props) {
    const title = "Daily Attendance (Non-Plucker)"
    const classes = useStyles();
    const csvHeaders = []
    const [groups, setGroups] = useState();
    const [date, setDate] = useState(new Date());
    const [gardens, setGardens] = useState([]);
    const [costCenters, setCostCenters] = useState();
    const [products, setProducts] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [attendanceDataOne, setAttendanceDataOne] = useState([]);
    const [transCount, setTransCount] = useState(0);
    const [genCount, setGenCount] = useState(0);
    const [cashCount, setCashCount] = useState(0);
    const [susCount, setSusCount] = useState(0);
    const [employeeCount, setEmployeeCount] = useState([]);
    const [PayPoints, setPayPoints] = useState();
    const [taskTypes, setTaskTypes] = useState([]);
    const [empType, setEmpType] = useState([]);
    const [attendanceDataList, setAttendanceDataList] = useState({
        groupID: '0',
        gardenID: '0',
        costCenterID: '0',
        empTypeID: '0',
        productID: '0',
        taskTypeID: '0',
        payPointID: '0',
        jobTypeID: '',
        statusID: '',
        taskSickLeaveID: '0',
        regNo: ''
    })
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: "0",
        gardenName: "0",
        costCenterName: "0",
        payPointName: "0",
        date: "",
        empTypeName: "0",
        taskTypeID: '',
        jobType: '',
        status: '',
        taskSickLeave: '',
        productName: ""
    })

    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const [initialState, setInitialState] = useState(false);
    const componentRef = useRef();
    const navigate = useNavigate();
    const alert = useAlert();

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission(), GetAllEmployeeSubCategoryMapping(), getTaskTypes());
    }, []);

    useEffect(() => {
        if (!initialState) {
            trackPromise(getPermission());
        }
    }, []);

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID(), GetDivisionDetailsByGroupID());
    }, [attendanceDataList.groupID]);

    useEffect(() => {
        trackPromise(GetMappedProductsByFactoryID(), getCostCenterDetailsByGardenID())
    }, [attendanceDataList.gardenID]);

    useEffect(() => {
        setAttendanceData([])
    }, [attendanceDataList]);

    useEffect(() => {
        if (initialState) {
            setAttendanceDataList((prevState) => ({
                ...prevState,
                gardenID: 0,
                costCenterID: 0,
                payPointID: 0
            }));
        }
    }, [attendanceDataList.groupID, initialState]);

    useEffect(() => {
        if (initialState) {
            setAttendanceDataList((prevState) => ({
                ...prevState,
                costCenterID: 0
            }));
        }
    }, [attendanceDataList.gardenID, initialState]);

    useEffect(() => {
        setAttendanceData([])
    }, [date]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWWORKERATTENDANCENONPLUKINGREPORT');

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

        setAttendanceDataList({
            ...attendanceDataList,
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
        var response = await services.getEstateDetailsByGroupID(attendanceDataList.groupID);
        setGardens(response);
    };

    async function getCostCenterDetailsByGardenID() {
        var response = await services.getDivisionDetailsByEstateID(attendanceDataList.gardenID);
        setCostCenters(response);
    };

    async function GetDivisionDetailsByGroupID() {
        var response = await services.GetDivisionDetailsByGroupID(attendanceDataList.groupID);
        const elementCount = response.reduce((count) => count + 1, 0);
        var generated = generateDropDownMenu(response)
        if (elementCount === 1) {
            setAttendanceDataList((prevState) => ({
                ...prevState,
                payPointID: generated[0].props.value,
            }));
        }
        setPayPoints(response);
    };

    async function GetMappedProductsByFactoryID() {
        var response = await services.GetMappedProductsByFactoryID(attendanceDataList.gardenID);
        setProducts(response);
    };

    async function getTaskTypes() {
        var result = await services.getTaskTypes();
        setTaskTypes(result);
    }

    async function GetAllEmployeeSubCategoryMapping() {
        const result = await services.GetAllEmployeeSubCategoryMapping();
        setEmpType(result);
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
            groupID: parseInt(attendanceDataList.groupID),
            gardenID: parseInt(attendanceDataList.gardenID),
            costCenterID: parseInt(attendanceDataList.costCenterID),
            payPointID: parseInt(attendanceDataList.payPointID),
            productID: parseInt(attendanceDataList.productID),
            empTypeID: parseInt(attendanceDataList.empTypeID),
            taskTypeID: parseInt(attendanceDataList.taskTypeID),
            jobTypeID: attendanceDataList.jobTypeID,
            statusID: attendanceDataList.statusID,
            taskSickLeaveID: parseInt(attendanceDataList.taskSickLeaveID),
            registrationNumber: attendanceDataList.regNo,
            date: moment(date.toString()).format().split('T')[0]
        }

        getSelectedDropdownValuesForReport(model);
        const response = await services.GetWorkerAttendanceNonPlukingReportDetails(model);
        if (response.statusCode == "Success" && response.data != null) {
            const attendanceData = response.data;
            let result = [];
            let res = [];
            let resG = [];
            let resC = [];
            let resS = [];
            attendanceData.forEach(x => {
                x.details.forEach(y => {
                    result.push(y);
                    if (y.jobType !== 'S') {
                        res.push(y);
                    }
                    if (y.jobType == 'G') {
                        resG.push(y);
                    }
                    if (y.jobType == 'C') {
                        resC.push(y);
                    }
                    if (y.jobType == 'S') {
                        resS.push(y);
                    }
                })
            });
            const groupedAttendance = result.reduce((groups, record) => {
                const registrationNumber = record.registrationNumber;
                if (!groups[registrationNumber]) {
                    groups[registrationNumber] = [];
                }
                groups[registrationNumber].push(record);
                return groups;
            }, {});
            const employeeRegistrationNumberCount = Object.keys(groupedAttendance).length;
            setTransCount(res.length);
            setGenCount(resG.length);
            setCashCount(resC.length);
            setSusCount(resS.length);
            setAttendanceDataOne(result)
            setAttendanceData(attendanceData)
            setEmployeeCount(employeeRegistrationNumberCount)
        }
        else {
            setAttendanceData([])
            alert.error(response.message);
        }
    }

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            array.map(x => {
                var vr = {
                    'Location': x.factoryName,
                    'Sub-Division': x.divisionName,
                    'Pay Point': x.payPointName,
                    'Employee Type': x.employeeTypeName,
                    'Employee Category': x.employeeSubCategoryName,
                    'Duffa': x.gangName,
                    'Sirder': x.siderName,
                    'Reg.No': x.registrationNumber,
                    'Emp.Name': x.firstName,
                    'Short Code': x.taskCode,
                    'Kamjari': x.taskName,
                    'Work Type': x.jobType == 'G' ? 'General' : x.jobType == 'C' ? 'Cash' : x.jobType == 'S' ? 'Suspended' : '',
                    'Field': x.fieldName,
                    'Target': x.assignQuntity.toFixed(2),
                    'Actual': x.completedQuntity.toFixed(2),
                    'Attendance Date': moment(x.date).format('YYYY-MM-DD'),
                    'In Time': x.inTime == null ? '-' : moment(x.inTime).format('HH:mm:ss A'),
                    'Out Time': x.outTime == null ? '-' : moment(x.outTime).format('HH:mm:ss A'),
                    'Status': x.status,
                };
                res.push(vr);
            });
            res.push([])
            var vr = {
                'Location': selectedSearchValues.gardenName == undefined ? 'Location - All Location' : 'Location - ' + selectedSearchValues.gardenName,
                'Sub-Division': selectedSearchValues.costCenterName == undefined ? 'Sub-Division - All Sub-Divisions' : 'Sub-Division - ' + selectedSearchValues.costCenterName,
                'Pay Point': selectedSearchValues.payPointName == undefined ? 'Pay Point - All Pay Point' : 'Pay Point - ' + selectedSearchValues.payPointName,
                'Employee Type': selectedSearchValues.productName == undefined ? 'Product - All Products' : 'Product - ' + selectedSearchValues.productName,
                'Employee Category': selectedSearchValues.empTypeID == undefined ? 'Employee Category - All Employee Category' : 'Employee Category - ' + selectedSearchValues.empTypeID,
                'Duffa': selectedSearchValues.taskTypeID == undefined ? 'Task - All Task Types' : 'Task - ' + selectedSearchValues.taskTypeID,
                'Sirder': 'Work Type - ' + selectedSearchValues.jobType,
                'Reg.No': 'Status - ' + selectedSearchValues.status,
                'Emp.Name': 'Sick Leave - ' + selectedSearchValues.taskSickLeave,
                'Short Code': 'Date - ' + moment(selectedSearchValues.date.toString()).format().split('T')[0]
            };
            res.push(vr);
        }
        return res;
    }

    async function createFile() {
        const sortedDetails = attendanceDataOne.sort((a, b) => a.registrationNumber.localeCompare(b.registrationNumber));
        var file = await createDataForExcel(sortedDetails);
        var settings = {
            sheetName: 'Daily Attendance Report-Non plucker',
            fileName:
                'Daily Attendance Report-Non plucker ' +
                new Date().toLocaleString().split('T')[0]
        };

        let keys = Object.keys(file[0]);
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem });
        });

        let dataA = [
            {
                sheet: 'DA Report-Non plucker',
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
        setAttendanceDataList({
            ...attendanceDataList,
            [e.target.name]: value
        });
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: groups[searchForm.groupID],
            gardenName: searchForm.gardenID == 0 ? "All" : gardens[searchForm.gardenID],
            costCenterName: searchForm.costCenterID == 0 ? "All" : costCenters[searchForm.costCenterID],
            payPointName: searchForm.payPointID == 0 ? "All" : PayPoints[searchForm.payPointID],
            productName: searchForm.productID == 0 ? "All" : products[searchForm.productID],
            empTypeID: searchForm.empTypeID == 0 ? "All" : empType[searchForm.empTypeID],
            taskTypeID: searchForm.taskTypeID == 0 ? 'All' : taskTypes[searchForm.taskTypeID],
            jobType: searchForm.jobTypeID == "G" ? 'General' : searchForm.jobTypeID == "C" ? 'Cash Work' : 'All',
            status: searchForm.statusID == "Completed" ? 'Completed' : searchForm.statusID == 'Force Complete' ? 'Force Complete' : searchForm.statusID == 'Suspended' ? 'Suspended' : 'All',
            taskSickLeave: searchForm.taskSickLeaveID == 0 ? 'With Sick Leave' : searchForm.taskSickLeaveID == 2 ? 'WithOut Sick Leave' : 'Only Sick Leave',
            date: date.toLocaleString().split('T')[0]
        })
    }

    return (
        <Page className={classes.root} title={title}>
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: attendanceDataList.groupID,
                        gardenID: attendanceDataList.gardenID,
                        costCenterID: attendanceDataList.costCenterID,
                        taskTypeID: attendanceDataList.taskTypeID,
                        empTypeID: attendanceDataList.empTypeID
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Business Division is required').min("1", 'Business Division is required')
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
                                                        value={attendanceDataList.groupID}
                                                        variant="outlined"
                                                        id="groupID"
                                                        size='small'
                                                        InputProps={{
                                                            readOnly: !permissionList.isGroupFilterEnabled ? true : false
                                                        }}
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
                                                        value={attendanceDataList.gardenID}
                                                        variant="outlined"
                                                        id="gardenID"
                                                        size='small'
                                                        InputProps={{
                                                            readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                        }}
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
                                                        error={Boolean(touched.costCenterID && errors.costCenterID)}
                                                        fullWidth
                                                        helperText={touched.costCenterID && errors.costCenterID}
                                                        name="costCenterID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={attendanceDataList.costCenterID}
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
                                                        fullWidth
                                                        name="payPointID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={attendanceDataList.payPointID}
                                                        variant="outlined"
                                                        id="payPointID"
                                                        size='small'
                                                    >
                                                        <MenuItem value="0">--All Pay Points--</MenuItem>
                                                        {generateDropDownMenu(PayPoints)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="productID">
                                                        Product
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.productID && errors.productID)}
                                                        fullWidth
                                                        helperText={touched.productID && errors.productID}
                                                        name="productID"
                                                        onChange={(e) => handleChange(e)}
                                                        size='small'
                                                        value={attendanceDataList.productID}
                                                        variant="outlined"
                                                        id="productID"
                                                    >
                                                        <MenuItem value="0">--All Products--</MenuItem>
                                                        {generateDropDownMenu(products)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="empTypeID">
                                                        Employee Category
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="empTypeID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={attendanceDataList.empTypeID}
                                                        variant="outlined"
                                                        id="empTypeID"
                                                        size='small'
                                                    >
                                                        <MenuItem value="0">--All Employee Categories--</MenuItem>
                                                        {generateDropDownMenu(empType)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="taskTypeID">
                                                        Task Type
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="taskTypeID"
                                                        size='small'
                                                        onChange={(e) => handleChange(e)}
                                                        value={attendanceDataList.taskTypeID}
                                                        variant="outlined"
                                                        id="taskTypeID"
                                                    >
                                                        <MenuItem value="0">--All Task Types--</MenuItem>
                                                        {generateDropDownMenu(taskTypes)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="jobTypeID">
                                                        Work Type
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        size='small'
                                                        name="jobTypeID"
                                                        onChange={(e) => handleChange(e)}
                                                        value={attendanceDataList.jobTypeID}
                                                        variant="outlined"
                                                        id="jobTypeID"
                                                    >
                                                        <MenuItem value={""}>--All Work Types--</MenuItem>
                                                        <MenuItem value="G">General</MenuItem>
                                                        <MenuItem value="C">Cash Work</MenuItem>
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="statusID">
                                                        Status
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        size='small'
                                                        name="statusID"
                                                        onChange={(e) => handleChange(e)}
                                                        value={attendanceDataList.statusID}
                                                        variant="outlined"
                                                        id="statusID"
                                                    >
                                                        <MenuItem value="">--All Status--</MenuItem>
                                                        <MenuItem value="Completed">Completed</MenuItem>
                                                        <MenuItem value="Force Complete">Force Complete</MenuItem>
                                                        <MenuItem value="Suspended">Suspended</MenuItem>
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="taskSickLeaveID">
                                                        Sick Leave
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        size='small'
                                                        name="taskSickLeaveID"
                                                        onChange={(e) => handleChange(e)}
                                                        value={attendanceDataList.taskSickLeaveID}
                                                        variant="outlined"
                                                        id="taskSickLeaveID"
                                                    >
                                                        <MenuItem value="0">--With Sick Leave--</MenuItem>
                                                        <MenuItem value="1">WithOut Sick Leave</MenuItem>
                                                        <MenuItem value="2">Only Sick Leave</MenuItem>
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
                                                        value={attendanceDataList.regNo}
                                                        variant="outlined"
                                                        id="regNo"
                                                    >
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="date">Date *</InputLabel>
                                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                        <KeyboardDatePicker
                                                            fullWidth
                                                            variant="inline"
                                                            format="yyyy-MM-dd"
                                                            margin="dense"
                                                            name='date'
                                                            id='date'
                                                            size='small'
                                                            value={date}
                                                            onChange={(e) => {
                                                                setDate(e)
                                                            }}
                                                            KeyboardButtonProps={{
                                                                'aria-label': 'change date',
                                                            }}
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
                                                {attendanceData.length > 0 ? (
                                                    <Chip
                                                        icon={<CircleIcon
                                                            fontSize='small' />}
                                                        label={"Total Employee Count: " + employeeCount}
                                                        color="secondary"
                                                        variant="outlined"
                                                    />
                                                ) : null}
                                                &nbsp; &nbsp;
                                                {attendanceData.length > 0 ? (
                                                    <Chip
                                                        icon={<CircleIcon
                                                            fontSize='small' color='success' />}
                                                        label={"G : " + genCount}
                                                        style={{ color: "green", fontStyle: "bold", borderColor: "green" }}
                                                        variant="outlined"
                                                    />
                                                ) : null}
                                                &nbsp; &nbsp;
                                                {attendanceData.length > 0 ? (
                                                    <Chip
                                                        icon={<CircleIcon
                                                            fontSize='small' color='error' />}
                                                        label={"C : " + cashCount}
                                                        style={{ color: "red", fontStyle: "bold", borderColor: "red" }}
                                                        variant="outlined"
                                                    />
                                                ) : null}
                                                &nbsp; &nbsp;
                                                {attendanceData.length > 0 ? (
                                                    <Chip
                                                        icon={<CircleIcon
                                                            fontSize='small' style={{ color: "orange" }} />}
                                                        label={"S : " + susCount}
                                                        style={{ color: "orange", fontStyle: "bold", borderColor: "orange" }}
                                                        variant="outlined"
                                                    />
                                                ) : null}
                                                &nbsp; &nbsp;
                                                {attendanceData.length > 0 ? (
                                                    <Chip
                                                        icon={<CircleIcon
                                                            fontSize='small' />}
                                                        label={"Transaction Count: " + transCount}
                                                        color="secondary"
                                                        variant="outlined"
                                                    />
                                                ) : null}
                                                &nbsp; &nbsp;
                                                {attendanceData.length > 0 ? (
                                                    <Chip
                                                        icon={<CircleIcon fontSize='small' />}
                                                        label={"Record: " + attendanceDataOne.length}
                                                        color="secondary"
                                                        style={{ position: 'absolute', right: 15 }}
                                                        variant="outlined"
                                                    />
                                                ) : null}
                                                <br />
                                                <br />
                                                {attendanceData.length > 0 ?
                                                    <TableContainer component={Paper}>
                                                        <Table className={classes.table} aria-label="simple table" size='small'>
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }}>Reg. No</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }}>Emp.Name</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }}>Short&nbsp;Code</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }}>Kamjari</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }}>W/Type</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }}>Field</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }}>Target</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }}>Actual</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }}>In&nbsp;Time&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }}>Out&nbsp;Time&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }}>Status</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {attendanceData.map((data, i) => {
                                                                    const sortedDetails = data.details.sort((a, b) => a.registrationNumber.localeCompare(b.registrationNumber));
                                                                    return (
                                                                        <React.Fragment key={i}>
                                                                            <TableRow>
                                                                                <TableCell colSpan={12} component="th" scope="row" align="left" style={{ fontWeight: 'bolder', color: 'green', borderBottom: '1px solid black' }}>Pay Point: {data.payPointName} <div>Category: {data.employeeSubCategoryName}</div></TableCell>
                                                                            </TableRow>
                                                                            {sortedDetails.map((row, k) => {
                                                                                return (
                                                                                    <TableRow key={`${i}-${k}`}>
                                                                                        <TableCell component="th" scope="row" align="left" style={{ borderBottom: "1px dashed black" }}> {row.registrationNumber}</TableCell>
                                                                                        <TableCell component="th" scope="row" align="left" style={{ borderBottom: "1px dashed black" }}> {row.firstName}</TableCell>
                                                                                        <TableCell component="th" scope="row" align="left" style={{ borderBottom: "1px dashed black" }}> {row.taskCode}</TableCell>
                                                                                        <TableCell component="th" scope="row" align="left" style={{ borderBottom: "1px dashed black" }}> {row.taskName}</TableCell>
                                                                                        <TableCell component="th" scope="row" align="center" style={{ fontWeight: 'bold', borderBottom: "1px dashed black", color: row.jobType == 'G' ? 'green' : row.jobType == 'C' ? 'red' : row.jobType == 'S' ? 'orange' : 'inherit' }}> {row.jobType}</TableCell>
                                                                                        <TableCell component="th" scope="row" align="left" style={{ borderBottom: "1px dashed black" }}> {row.fieldName == null ? '-' : row.fieldName}</TableCell>
                                                                                        <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black" }}> {row.assignQuntity}</TableCell>
                                                                                        <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black" }}> {row.completedQuntity}</TableCell>
                                                                                        <TableCell component="th" scope="row" align="left" style={{ borderBottom: "1px dashed black" }}> {row.inTime == null ? '-' : moment(row.inTime).format('HH:mm:ss A')}</TableCell>
                                                                                        <TableCell component="th" scope="row" align="left" style={{ borderBottom: "1px dashed black" }}> {row.outTime == null ? '-' : moment(row.outTime).format('HH:mm:ss A')}</TableCell>
                                                                                        <TableCell component="th" scope="row" align="left" style={{ borderBottom: "1px dashed black" }}> {row.status}</TableCell>
                                                                                    </TableRow>
                                                                                );
                                                                            })}
                                                                        </React.Fragment>
                                                                    );
                                                                })}
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                    : null}
                                            </Box>
                                        </CardContent>
                                        {attendanceData.length > 0 ?
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                <Button
                                                    color="primary"
                                                    id="btnRecord"
                                                    type="submit"
                                                    variant="contained"
                                                    style={{ marginRight: '1rem' }}
                                                    className={classes.colorRecord}
                                                    onClick={() => createFile()}
                                                    size='small'
                                                >
                                                    EXCEL
                                                </Button>
                                                <ReactToPrint
                                                    documentTitle={"Daily Attendance (Non-Plucker)"}
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
                                                        searchData={selectedSearchValues} attendanceData={attendanceData} employeeCount={employeeCount} attendanceDataOne={attendanceDataOne}
                                                        transCount={transCount} genCount={genCount} cashCount={cashCount} susCount={susCount} />
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