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
import * as Yup from "yup";
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
import moment from 'moment';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
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

const screenCode = 'FACTORYWEIGHMENTREPORT';

export default function TaskSummaryReport(props) {
    const [title, setTitle] = useState("Factory Weighment Report")
    const classes = useStyles();
    const [GroupList, setGroupList] = useState([]);
    const [estates, setEstates] = useState([]);
    const [taskCategory, setTaskCategory] = useState([]);
    const [products, setProducts] = useState([]);
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [taskSummaryData, setTaskSummaryData] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [payPoints, setPayPoints] = useState([]);
    const [generalTotal, setGeneralTotal] = useState(0)
    const [total, setTotal] = useState(0)
    const [cashTotal, setCashTotal] = useState(0)
    const [susTotal, setSusTotal] = useState(0)
    const [prodOneCashTotal, setProdOneCashTotal] = useState(0)
    const [prodOneGenTotal, setProdOneGenTotal] = useState(0)
    const [prodOneSusTotal, setProdOneSusTotal] = useState(0)
    const [prodOneTotal, setProdOneTotal] = useState(0)
    const [prodTwoCashTotal, setProdTwoCashTotal] = useState(0)
    const [prodTwoGenTotal, setProdTwoGenTotal] = useState(0)
    const [prodTwoSusTotal, setProdTwoSusTotal] = useState(0)
    const [prodTwoTotal, setProdTwoTotal] = useState(0)
    const [allCount, setAllCount] = useState(0);
    const [transCount, setTransCount] = useState(0);
    const [genCount, setGenCount] = useState(0);
    const [cashCount, setCashCount] = useState(0);
    const [susCount, setSusCount] = useState(0);
    const [employeeCount, setEmployeeCount] = useState(0);
    const [taskTypes, setTaskTypes] = useState([]);
    const [taskSummaryReport, setTaskSummaryReport] = useState({
        groupID: '0',
        estateID: '0',
        divisionID: '0',
        payPointID: '0',
        estateTaskID: '0',
        taskTypeID: '0',
        productID: '0',
        date: new Date().toISOString().substr(0, 10),
        taskSickLeaveID: '0',
        regNo: '',
        pluckingTypeID: '1',
    })
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: '',
        estateName: '',
        divisionName: '',
        payPointName: '',
        productName: '',
        taskTypeID: '',
        date: '',
        pluckingType: '',
        taskSickLeave: ''
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
        if (!initialState) {
            trackPromise(getPermission());
        }
    }, []);

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission(), getTaskTypes());
    }, []);

    useEffect(() => {
        getEstateDetailsByGroupID();
    }, [taskSummaryReport.groupID]);

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID(),
            GetDivisionDetailsByGroupID());
    }, [taskSummaryReport.groupID]);

    useEffect(() => {
        trackPromise(
            getAllTaskNames()
        )
    }, [taskSummaryReport.groupID, taskSummaryReport.estateID]);

    useEffect(() => {
        trackPromise(
            GetMappedProductsByFactoryID(),
            getDivisionDetailsByEstateID()
        )
    }, [taskSummaryReport.estateID]);

    useEffect(() => {
        if (initialState) {
            setTaskSummaryReport((prevState) => ({
                ...prevState,
                estateID: 0,
                divisionID: 0,
                payPointID: 0
            }));
        }
    }, [taskSummaryReport.groupID, initialState]);

    useEffect(() => {
        if (initialState) {
            setTaskSummaryReport((prevState) => ({
                ...prevState,
                divisionID: 0
            }));
        }
    }, [taskSummaryReport.estateID, initialState]);

    useEffect(() => {
        setTaskSummaryData([]);
    }, [taskSummaryReport]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWFACTORYWEIGHMENTREPORT');

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

        setTaskSummaryReport({
            ...taskSummaryReport,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            estateID: parseInt(tokenService.getFactoryIDFromToken())
        })
        setInitialState(true);
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroupList(groups);
    }
    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(taskSummaryReport.groupID);
        setEstates(response);
    }

    async function getAllTaskNames() {
        const result = await services.getAllTaskNames(taskSummaryReport.groupID, taskSummaryReport.estateID);
        setTaskCategory(result);
    }
    async function GetMappedProductsByFactoryID() {
        var response = await services.GetMappedProductsByFactoryID(taskSummaryReport.estateID);
        setProducts(response);
    };
    async function getDivisionDetailsByEstateID() {
        var response = await services.getDivisionDetailsByEstateID(taskSummaryReport.estateID);
        setDivisions(response);
    }

    async function getTaskTypes() {
        var result = await services.getTaskTypes();
        setTaskTypes(result);
    }

    async function GetDivisionDetailsByGroupID() {
        const result = await services.GetDivisionDetailsByGroupID(taskSummaryReport.groupID);
        setPayPoints(result)
    }
    async function GetDetails() {
        let model = {
            groupID: parseInt(taskSummaryReport.groupID),
            estateID: parseInt(taskSummaryReport.estateID),
            divisionID: parseInt(taskSummaryReport.divisionID),
            estateTaskID: parseInt(taskSummaryReport.estateTaskID),
            payPointID: parseInt(taskSummaryReport.payPointID),
            productID: parseInt(taskSummaryReport.productID),
            taskTypeID: parseInt(taskSummaryReport.taskTypeID),
            taskSickLeaveID: parseInt(taskSummaryReport.taskSickLeaveID),
            registrationNumber: taskSummaryReport.regNo,
            date: moment(taskSummaryReport.date).format('YYYY-MM-DD'),
            pluckingTypeID: parseInt(taskSummaryReport.pluckingTypeID)
        }
        getSelectedDropdownValuesForReport(model);
        let genTotal = 0;
        let caTotal = 0;
        let susTotal = 0;
        let cashTotalProdOne = 0;
        let genTotalProdOne = 0;
        let susTotalProdOne = 0;
        let cashTotalProdTwo = 0;
        let genTotalProdTwo = 0;
        let susTotalProdTwo = 0;
        const response = await services.GetTaskSummaryReportDetails(model);
        if (response.statusCode === "Success" && response.data !== null) {
            const summaryData = response.data;
            setTaskSummaryData(response.data);
            response.data.map((data, index) => {
                data.detail.map((detail, k) => {
                    genTotal += detail.details[0] && detail.details[0].jobTypeID == 1 ? detail.details[0].count : detail.details[1] && detail.details[1].jobTypeID == 1 ? detail.details[1].count : 0
                    caTotal += detail.details[0] && detail.details[0].jobTypeID == 2 ? detail.details[0].count : detail.details[1] && detail.details[1].jobTypeID == 2 ? detail.details[1].count : 0
                    susTotal += detail.details[0] && detail.details[0].jobTypeID == 3 ? detail.details[0].count : detail.details[1] && detail.details[1].jobTypeID == 3 ? detail.details[1].count : 0

                    if (data.productID == 1) {
                        genTotalProdOne += (detail.details[0] && detail.details[0].jobTypeID == 1) ? detail.details[0].count : (detail.details[1] && detail.details[1].jobTypeID == 1) ? detail.details[1].count : 0
                        cashTotalProdOne += (detail.details[0] && detail.details[0].jobTypeID == 2) ? detail.details[0].count : (detail.details[1] && detail.details[1].jobTypeID == 2) ? detail.details[1].count : 0
                        susTotalProdOne += (detail.details[0] && detail.details[0].jobTypeID == 3) ? detail.details[0].count : (detail.details[1] && detail.details[1].jobTypeID == 3) ? detail.details[1].count : 0
                    }

                    if (data.productID == 2) {
                        genTotalProdTwo += (detail.details[0] && detail.details[0].jobTypeID == 1) ? detail.details[0].count : (detail.details[1] && detail.details[1].jobTypeID == 1) ? detail.details[1].count : 0
                        cashTotalProdTwo += (detail.details[0] && detail.details[0].jobTypeID == 2) ? detail.details[0].count : (detail.details[1] && detail.details[1].jobTypeID == 2) ? detail.details[1].count : 0
                        susTotalProdTwo += (detail.details[0] && detail.details[0].jobTypeID == 3) ? detail.details[0].count : (detail.details[1] && detail.details[1].jobTypeID == 3) ? detail.details[1].count : 0
                    }
                })
            })
            let result = [];
            let res = [];
            let resG = [];
            let resC = [];
            let resS = [];
            summaryData.forEach(x => {
                x.detail.forEach(y => {
                    y.details.forEach(z => {
                        z.detailsx.forEach(a => {
                            result.push(a);
                            if (z.jobTypeID !== 3) {
                                res.push(a);
                            }
                            if (z.jobTypeID == 1) {
                                resG.push(a);
                            }
                            if (z.jobTypeID == 2) {
                                resC.push(a);
                            }
                            if (z.jobTypeID == 3) {
                                resS.push(a);
                            }
                        })
                    })
                })
            });
            const groupedAttendance = result.reduce((groups, record) => {
                const registrationNumber = record.employeeID;
                if (!groups[registrationNumber]) {
                    groups[registrationNumber] = [];
                }
                groups[registrationNumber].push(record);
                return groups;
            }, {});
            const employeeRegistrationNumberCount = Object.keys(groupedAttendance).length;
            setAllCount(result.length)
            setTransCount(res.length);
            setGenCount(resG.length);
            setCashCount(resC.length);
            setSusCount(resS.length);
            setProdOneCashTotal(cashTotalProdOne)
            setProdOneGenTotal(genTotalProdOne)
            setProdOneSusTotal(susTotalProdOne)
            setProdOneTotal(genTotalProdOne + cashTotalProdOne + susTotalProdOne)

            setProdTwoCashTotal(cashTotalProdTwo)
            setProdTwoGenTotal(genTotalProdTwo)
            setProdTwoSusTotal(susTotalProdTwo)
            setProdTwoTotal(genTotalProdTwo + cashTotalProdTwo + susTotalProdTwo)

            setTotal(genTotal + caTotal + susTotal)
            setGeneralTotal(genTotal)
            setCashTotal(caTotal)
            setSusTotal(susTotal)
            setEmployeeCount(employeeRegistrationNumberCount)
        } else {
            alert.error("No Records to Display");
        }
    }

    async function createDataForExcel() {
        var res = [];
        if (taskSummaryData != null) {
            taskSummaryData.forEach(data => {
                res.push({
                    'Task Code': data.estateTaskName,
                    'Task Name': '',
                    'Budget Code': '',
                });
                data.details.forEach(detail => {
                    var vr = {
                        'Task Code': detail.taskCode,
                        'Task Name': detail.taskName,
                        'Budget Code': detail.budgetexpensescode,
                    };
                    res.push(vr);
                });
            });
        }
        return res;
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
        setTaskSummaryReport({
            ...taskSummaryReport,
            [e.target.name]: value
        });
    }
    function handleDateChange(value) {
        setTaskSummaryReport({
            ...taskSummaryReport,
            date: value
        });
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: GroupList[searchForm.groupID],
            estateName: estates[searchForm.estateID],
            divisionName: divisions[searchForm.divisionID],
            payPointName: payPoints[searchForm.payPointID],
            estateTaskName: taskCategory[searchForm.estateTaskID],
            productName: products[searchForm.productID],
            taskTypeID: searchForm.taskTypeID == 0 ? 'All Task Types' : taskTypes[searchForm.taskTypeID],
            date: searchForm.date,
            pluckingType: searchForm.pluckingTypeID,
            taskSickLeave: searchForm.taskSickLeaveID == 0 ? 'With Sick Leave' : searchForm.taskSickLeaveID == 2 ? 'WithOut Sick Leave' : 'Only Sick Leave'
        })
    }

    return (
        <Page className={classes.root} title={title}>
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: taskSummaryReport.groupID,
                        estateID: taskSummaryReport.estateID,
                        divisionID: taskSummaryReport.divisionID,
                        estateTaskID: taskSummaryReport.estateTaskID,
                        payPointID: taskSummaryReport.payPointID,
                        productID: taskSummaryReport.productID,
                        taskTypeID: taskSummaryReport.taskTypeID,
                        date: taskSummaryReport.date,
                        pluckingTypeID: taskSummaryReport.pluckingTypeID,
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Business Division is required').min("1", 'Business Division is required'),
                            date: Yup.string().required('Date is required')
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
                                                        onChange={(e) => handleChange(e)}
                                                        value={taskSummaryReport.groupID}
                                                        variant="outlined"
                                                        size='small'
                                                        InputProps={{
                                                            readOnly: !permissionList.isGroupFilterEnabled,
                                                        }}
                                                    >
                                                        <MenuItem value="0">--Select Business Division--</MenuItem>
                                                        {generateDropDownMenu(GroupList)}
                                                    </TextField>
                                                </Grid>

                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="estateID">
                                                        Location
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.estateID && errors.estateID)}
                                                        fullWidth
                                                        helperText={touched.estateID && errors.estateID}
                                                        name="estateID"
                                                        size='small'
                                                        onChange={(e) => {
                                                            handleChange(e)
                                                        }}
                                                        value={taskSummaryReport.estateID}
                                                        variant="outlined"
                                                        id="estateID"
                                                        InputProps={{
                                                            readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                        }}
                                                    >
                                                        <MenuItem value={0}>--All Locations--</MenuItem>
                                                        {generateDropDownMenu(estates)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="divisionID">
                                                        Sub-Division
                                                    </InputLabel>
                                                    <TextField select fullWidth
                                                        size='small'
                                                        onBlur={handleBlur}
                                                        id="divisionID"
                                                        name="divisionID"
                                                        value={taskSummaryReport.divisionID}
                                                        type="text"
                                                        variant="outlined"
                                                        onChange={(e) => {
                                                            handleChange(e)
                                                        }}                                                    >
                                                        <MenuItem value="0">--All Sub-Divisions--</MenuItem>
                                                        {generateDropDownMenu(divisions)}
                                                    </TextField>
                                                </Grid>





                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="divisionID">
                                                        Feild
                                                    </InputLabel>
                                                    <TextField select fullWidth
                                                        size='small'
                                                        onBlur={handleBlur}
                                                        id="divisionID"
                                                        name="divisionID"
                                                        value={taskSummaryReport.divisionID}
                                                        type="text"
                                                        variant="outlined"
                                                        onChange={(e) => {
                                                            handleChange(e)
                                                        }}                                                    >
                                                        <MenuItem value="0">--All Sub-Divisions--</MenuItem>
                                                        {generateDropDownMenu(divisions)}
                                                    </TextField>

                                                </Grid>

                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="date">
                                                        Date *
                                                    </InputLabel>
                                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                        <KeyboardDatePicker
                                                            error={Boolean(touched.date && errors.date)}
                                                            helperText={touched.date && errors.date}
                                                            autoOk
                                                            fullWidth
                                                            variant="inline"
                                                            format="yyyy-MM-dd"
                                                            margin="dense"
                                                            id="date"
                                                            value={taskSummaryReport.date}
                                                            onChange={(e) => handleDateChange(e)}
                                                            KeyboardButtonProps={{
                                                                'aria-label': 'change date',
                                                            }}
                                                        />
                                                    </MuiPickersUtilsProvider>
                                                </Grid>
                                            </Grid>
                                            <Grid container justify="flex-end">
                                                <Box pt={2}>
                                                    <Button
                                                        color="primary"
                                                        variant="contained"
                                                        type='submit'
                                                    >
                                                        Search
                                                    </Button>
                                                </Box>
                                            </Grid>
                                            <br />
                                            <Box minWidth={1050}>
                                                {taskSummaryData.length > 0 ? (
                                                    <Chip
                                                        icon={<CircleIcon
                                                            fontSize='small' />}
                                                        label={"Total Employee Count: " + employeeCount}
                                                        color="secondary"
                                                        variant="outlined"
                                                    />
                                                ) : null}
                                                &nbsp; &nbsp;
                                                {taskSummaryData.length > 0 ? (
                                                    <Chip
                                                        icon={<CircleIcon
                                                            fontSize='small' color='success' />}
                                                        label={"G : " + genCount}
                                                        style={{ color: "green", fontStyle: "bold", borderColor: "green" }}
                                                        variant="outlined"
                                                    />
                                                ) : null}
                                                &nbsp; &nbsp;
                                                {taskSummaryData.length > 0 ? (
                                                    <Chip
                                                        icon={<CircleIcon
                                                            fontSize='small' color='error' />}
                                                        label={"C : " + cashCount}
                                                        style={{ color: "red", fontStyle: "bold", borderColor: "red" }}
                                                        variant="outlined"
                                                    />
                                                ) : null}
                                                &nbsp; &nbsp;
                                                {taskSummaryData.length > 0 ? (
                                                    <Chip
                                                        icon={<CircleIcon
                                                            fontSize='small' style={{ color: "orange" }} />}
                                                        label={"S : " + susCount}
                                                        style={{ color: "orange", fontStyle: "bold", borderColor: "orange" }}
                                                        variant="outlined"
                                                    />
                                                ) : null}
                                                &nbsp; &nbsp;
                                                {taskSummaryData.length > 0 ? (
                                                    <Chip
                                                        icon={<CircleIcon
                                                            fontSize='small' />}
                                                        label={"Transaction Count: " + transCount}
                                                        color="secondary"
                                                        variant="outlined"
                                                    />
                                                ) : null}
                                                &nbsp; &nbsp;
                                                {taskSummaryData.length > 0 ? (
                                                    <Chip
                                                        icon={<CircleIcon
                                                            fontSize='small' />}
                                                        label={"Record: " + allCount}
                                                        color="secondary"
                                                        style={{ position: 'absolute', right: 15 }}
                                                        variant="outlined"
                                                    />
                                                ) : null}
                                                <br></br>
                                                <br></br>
                                                {taskSummaryData.length > 0 ?
                                                    <TableContainer component={Paper}>
                                                        <Table className={classes.table} aria-label="simple table" size='small' style={{ border: "1px solid black" }}>
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell align="center" rowSpan={2} style={{ fontWeight: "bold", border: "1px solid black" }}>Kamjari Code</TableCell>
                                                                    <TableCell align="center" rowSpan={2} style={{ fontWeight: "bold", border: "1px solid black" }}>Kamjari Name</TableCell>
                                                                    <TableCell align="center" colSpan={4} style={{ fontWeight: "bold", border: "1px solid black" }}>Head Count</TableCell>
                                                                </TableRow>
                                                                <TableRow>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", color: "green", width: "150px" }}>General</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", color: "red", width: "150px" }}>Cash</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", color: "orange", width: "150px" }}>Suspended</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", width: "150px" }}>Total</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {taskSummaryData.map((data, i) => {
                                                                    return (
                                                                        <React.Fragment key={i}>
                                                                            <TableRow>
                                                                                <TableCell colSpan={4} component="th" scope="row" align="left" style={{ fontWeight: 'bolder', color: 'blue', borderLeft: '1px solid black', borderBottom: '1px dashed black' }}>{data.productName}</TableCell>
                                                                            </TableRow>
                                                                            {data.detail.map((detail, k) => {
                                                                                return (
                                                                                    <TableRow key={`${i}-${k}`}>
                                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black", borderLeft: "1px solid black" }}> {detail.taskCode}</TableCell>
                                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black", borderLeft: "1px dashed black" }}> {detail.taskName}</TableCell>
                                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px dashed black", borderLeft: "1px dashed black" }}> {detail.details[0] && detail.details[0].jobTypeID == 1 ? detail.details[0].count : detail.details[1] && detail.details[1].jobTypeID == 1 ? detail.details[1].count : '--'}</TableCell>
                                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px dashed black", borderLeft: "1px dashed black" }}> {detail.details[0] && detail.details[0].jobTypeID == 2 ? detail.details[0].count : detail.details[1] && detail.details[1].jobTypeID == 2 ? detail.details[1].count : '--'}</TableCell>
                                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px dashed black", borderLeft: "1px dashed black" }}> {detail.details[0] && detail.details[0].jobTypeID == 3 ? detail.details[0].count : detail.details[1] && detail.details[1].jobTypeID == 3 ? detail.details[1].count : '--'}</TableCell>
                                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px dashed black", borderLeft: "1px dashed black" }}> {detail.details.length < 2 ? detail.details[0].count : (detail.details[0].count + detail.details[1].count)}</TableCell>
                                                                                    </TableRow>
                                                                                )
                                                                            })}
                                                                            <TableRow>
                                                                                <TableCell component="th" scope="row" align="left" colSpan={2} style={{ border: "1px solid black", fontWeight: 'bold' }}>Total</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", fontWeight: 'bold', color: "green" }}>{data.productID == 1 ? prodOneGenTotal : (data.productID == 2 ? prodTwoGenTotal : 0)}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", fontWeight: 'bold', color: "red" }}>{data.productID == 1 ? prodOneCashTotal : (data.productID == 2 ? prodTwoCashTotal : 0)}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", fontWeight: 'bold', color: "orange" }}>{data.productID == 1 ? prodOneSusTotal : (data.productID == 2 ? prodTwoSusTotal : 0)}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", fontWeight: 'bold' }}>{data.productID == 1 ? prodOneTotal : data.productID == 2 ? prodTwoTotal : 0}</TableCell>
                                                                            </TableRow>
                                                                        </React.Fragment>
                                                                    )
                                                                })}
                                                                <TableRow>
                                                                    <TableCell component="th" scope="row" align="left" colSpan={2} style={{ border: "1px solid black", fontWeight: 'bold' }}>Total</TableCell>
                                                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", fontWeight: 'bold', color: "green" }}>{generalTotal}</TableCell>
                                                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", fontWeight: 'bold', color: "red" }}>{cashTotal}</TableCell>
                                                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", fontWeight: 'bold', color: "orange" }}>{susTotal}</TableCell>
                                                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", fontWeight: 'bold' }}>{total}</TableCell>
                                                                </TableRow>
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer> : null}
                                            </Box>
                                        </CardContent>
                                        {taskSummaryData.length > 0 ?
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                {/* <Button
                                                    color="primary"
                                                    id="btnRecord"
                                                    variant="contained"
                                                    style={{ marginRight: '1rem' }}
                                                    className={classes.colorRecord}
                                                    onClick={createFile}
                                                >
                                                    EXCEL
                                                </Button>
                                                <div>&nbsp;</div> */}
                                                <ReactToPrint
                                                    documentTitle={"Task Summary"}
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
                                                        searchData={selectedSearchValues} taskSummaryData={taskSummaryData} generalTotal={generalTotal} cashTotal={cashTotal} total={total} prodOneCashTotal={prodOneCashTotal} prodOneGenTotal={prodOneGenTotal} prodOneTotal={prodOneTotal} prodTwoCashTotal={prodTwoCashTotal} prodTwoGenTotal={prodTwoGenTotal} prodTwoTotal={prodTwoTotal}
                                                        employeeCount={employeeCount} transCount={transCount} genCount={genCount} cashCount={cashCount} susCount={susCount} allCount={allCount} susTotal={susTotal} prodOneSusTotal={prodOneSusTotal} prodTwoSusTotal={prodTwoSusTotal} />
                                                </div>
                                            </Box>
                                            : null
                                        }
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