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
import xlsx from 'json-as-xlsx';
import LineWeightIcon from '@material-ui/icons/LineWeight';

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

const screenCode = 'DAILYNONPLUCKINGATTENDANCEREPORT';

export default function DailyNonPluckingAttendanceReport(props) {
    const [title, setTitle] = useState("Daily Non Plucking Attendance")
    const classes = useStyles();
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [groups, setGroups] = useState();
    const [date, setDate] = useState(new Date());
    const [gardens, setGardens] = useState([]);
    const [costCenters, setCostCenters] = useState();
    const [attendanceData, setAttendanceData] = useState([]);
    const [employeeCount, setEmployeeCount] = useState([]);
    const [taskCategory, setTaskCategory] = useState();
    const [attendanceDataList, setAttendanceDataList] = useState({
        groupID: '0',
        gardenID: '0',
        costCenterID: '0',
        taskID: '0',
        estateTaskID: '0'

    })
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: "0",
        gardenName: "0",
        costCenterName: "0",
        date: "",
        taskName: "0",
        estateTaskName: "0"
    })

    const [totalValues, setTotalValues] = useState({
        totalAmount: 0,
        totalQuantity: 0,
        totalTarget: 0
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
    const [sundry, setSundry] = useState();

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID());
    }, [attendanceDataList.groupID]);


    useEffect(() => {
        trackPromise(
            getAllTaskNames()
        )
    }, [attendanceDataList.groupID, attendanceDataList.gardenID]);

    useEffect(() => {
        if (attendanceDataList.gardenID != "0") {
            trackPromise(
                getLabourTask()
            )
        }
    }, [attendanceDataList.gardenID, attendanceDataList.estateTaskID]);

    useEffect(() => {
        if (attendanceData.length != 0) {
            calculateTotalQty()
        }
    }, [attendanceData]);


    useEffect(() => {
        setAttendanceDataList((prevState) => ({
            ...prevState,
            costCenterID: "0"
        }));
    }, [attendanceDataList.groupID]);

    useEffect(() => {
        trackPromise(
            getCostCenterDetailsByGardenID()
        )
    }, [attendanceDataList.gardenID]);

    useEffect(() => {
        setAttendanceData([])
    }, [attendanceDataList.gardenID]);

    useEffect(() => {
        setAttendanceData([])
    }, [attendanceDataList.costCenterID]);

    useEffect(() => {
        setAttendanceData([])
    }, [attendanceDataList.estateTaskID]);

    useEffect(() => {
        setAttendanceData([])
    }, [attendanceDataList.taskID]);

    useEffect(() => {
        setAttendanceData([])
    }, [date]);

    const handleLimitChange = (event) => {
        setLimit(event.target.value);
    };
    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWDAILYNONPLUCKINGATTENDANCEREPORT');

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
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(attendanceDataList.groupID);
        setGardens(response);
    };

    async function getAllTaskNames() {
        const result = await services.getAllTaskNames(attendanceDataList.groupID, attendanceDataList.gardenID);
        setTaskCategory(result);
    }

    async function getLabourTask() {
        const result = await services.getLabourTask(attendanceDataList.gardenID, attendanceDataList.estateTaskID);
        setSundry(result);
    }


    async function getCostCenterDetailsByGardenID() {
        var response = await services.getDivisionDetailsByEstateID(attendanceDataList.gardenID);
        const elementCount = response.reduce((count) => count + 1, 0);
        var generated = generateDropDownMenu(response)
        if (elementCount === 1) {
            setAttendanceDataList((prevState) => ({
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

    async function GetDetails() {
        let model = {
            groupID: parseInt(attendanceDataList.groupID),
            gardenID: parseInt(attendanceDataList.gardenID),
            costCenterID: parseInt(attendanceDataList.costCenterID),
            date: moment(date.toString())
                .format()
                .split('T')[0],
            taskID: parseInt(attendanceDataList.taskID),
            estateTaskID: parseInt(attendanceDataList.estateTaskID),
        }

        getSelectedDropdownValuesForReport(model);
        const response = await services.GetNonPluckingAttendanceDetails(model);
        if (response.statusCode == "Success" && response.data != null) {
            response.data.forEach(x => {
                if (x.assignQuntity != 0) {
                    x.amount = (x.quntity / x.assignQuntity) * x.rate
                } else {
                    x.amount = 0
                }

            });
            setAttendanceData(response.data)
            setEmployeeCount(response.data.length)
            createDataForExcel(response.data);
        }
        else {
            setAttendanceData([])
            alert.error(response.message);
        }
    }

    function calculateTotalQty() {
        const totalAmount = attendanceData.reduce((accumulator, current) => accumulator + current.amount, 0);
        const totalQuantity = attendanceData.reduce((accumulator, current) => accumulator + current.quntity, 0);
        const totalTarget = attendanceData.reduce((accumulator, current) => accumulator + current.assignQuntity, 0);
        setTotalValues({
            ...totalValues,
            totalAmount: totalAmount,
            totalQuantity: totalQuantity,
            totalTarget: totalTarget
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
                    'Duffa': x.duffaName,
                    'Sirder': x.sirderName,
                    'Operator': x.operator,
                    'Kamjari Code': x.taskCode,
                    'Kamjari Name': x.taskName,
                    'In Time': moment(x.inTime).format('HH:mm:ss A'),
                    'Out Time': moment(x.outTime).format('HH:mm:ss A'),
                    'Target Qty': x.assignQuntity,
                    'Qty': x.quntity,
                    'M.Unit': x.measuringUnitName,
                    'Rate': x.rate,
                    'Amount': x.amount,

                    // 'Allowance': x.allowance,
                    // 'Garden Allowance': x.gardenAllowance,
                };
                res.push(vr);
            });
            var vr = {
                'Emp.ID': 'Total',
                'Amount': totalValues.totalAmount,

            };
            // res.push(vr);
            // var vr = {
            //     'Emp.ID': 'Total Employee Count - ' + employeeCount,
            // };
            res.push(vr);
            res.push([])
            var vr = {
                'Emp.ID': 'Legal Entity - ' + selectedSearchValues.groupName,
                'Emp.Name': 'Garden - ' + selectedSearchValues.gardenName,
                'Emp.Type': 'Cost Center - ' + selectedSearchValues.costCenterName,
                'Duffa': 'Date - ' + moment(selectedSearchValues.date.toString()).format().split('T')[0],
                'Sirder': selectedSearchValues.estateTaskName === undefined ? 'Task Category - All Task Categories' : 'Task Category - ' + selectedSearchValues.estateTaskName,
                'Operator': selectedSearchValues.taskName === undefined ? 'Sundry Task - All Sundry Tasks' : 'Sundry Task - ' + selectedSearchValues.taskName,
            };
            res.push(vr);
        }
        return res;
    }

    async function createFile() {
        var file = await createDataForExcel(attendanceData);
        var settings = {
            sheetName: 'Daily Non Plucking Attendance',
            fileName:
                'Daily Non Plucking Attendance ' +
                new Date()
        };

        let keys = Object.keys(file[0]);
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem });
        });

        let dataA = [
            {
                sheet: 'Daily Non Plucking Attendance',
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
            gardenName: gardens[searchForm.gardenID],
            costCenterName: costCenters[searchForm.costCenterID],
            date: date.toLocaleString().split('T')[0],
            taskName: sundry[searchForm.taskID],
            estateTaskName: taskCategory[searchForm.estateTaskID]

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
                        taskID: attendanceDataList.taskID,
                        estateTaskID: attendanceDataList.estateTaskID,
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Legal Entity is required').min("1", 'Legal Entity is required'),
                            gardenID: Yup.number().required('Garden is required').min("1", 'Garden is required'),
                            costCenterID: Yup.number().required('Cost Center is required').min("1", 'Cost Center is required'),
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
                                                        Legal Entity  *
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

                                                    >
                                                        <MenuItem value="0">--Select Legal Entity--</MenuItem>
                                                        {generateDropDownMenu(groups)}
                                                    </TextField>
                                                </Grid>

                                                <Grid item md={4} xs={8}>
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
                                                        value={attendanceDataList.gardenID}
                                                        variant="outlined"
                                                        id="gardenID"
                                                        size='small'

                                                    >
                                                        <MenuItem value="0">--Select Garden--</MenuItem>
                                                        {generateDropDownMenu(gardens)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={8}>
                                                    <InputLabel shrink id="costCenterID">
                                                        Cost Center *
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
                                                        <MenuItem value="0">--Select Cost Center--</MenuItem>
                                                        {generateDropDownMenu(costCenters)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="date">Date *</InputLabel>
                                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                        <KeyboardDatePicker
                                                            fullWidth
                                                            variant="inline"
                                                            format="dd/MM/yyyy"
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
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="estateTaskID">
                                                        Task Category
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="estateTaskID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={attendanceDataList.estateTaskID}
                                                        variant="outlined"
                                                        id="estateTaskID"
                                                        size="small"

                                                    >
                                                        <MenuItem value="0">--Select Task Category--</MenuItem>
                                                        {generateDropDownMenu(taskCategory)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="taskID">
                                                        Sundry Task
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="taskID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={attendanceDataList.taskID}
                                                        variant="outlined"
                                                        id="taskID"
                                                        size="small"

                                                    >
                                                        <MenuItem value="0">--Select Sundry Task--</MenuItem>
                                                        {generateDropDownMenu(sundry)}
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
                                            <br />
                                            <Box minWidth={1050}>
                                                {/* {attendanceData.length > 0 ? (
                                                    <Chip
                                                        icon={<LineWeightIcon />}
                                                        label={"Total Employee Count: " + employeeCount}
                                                        color="secondary"
                                                        variant="outlined"
                                                    />
                                                ) : null} */}
                                                <br>
                                                </br>
                                                <br>
                                                </br>
                                                {attendanceData.length > 0 ?

                                                    <TableContainer component={Paper}>
                                                        <Table className={classes.table} aria-label="simple table">
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Emp.ID</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Emp.Name</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Emp.Type</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Duffa</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Sirder</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Operator</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Kamjari Code</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Kamjari Name</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>In Time</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Out Time</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Target</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Qty</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>M.Unit</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Rate</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Amount</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {attendanceData.slice(page * limit, page * limit + limit).map((row, i) => (
                                                                    <TableRow key={i}>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.registrationNumber}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.firstName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.employeeTypeName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.duffaName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.sirderName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}>  {row.operator}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.taskCode}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.taskName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black" }}>  {moment(row.inTime).format('HH:mm:ss A')}</TableCell>
                                                                        <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black" }}>  {moment(row.outTime).format('HH:mm:ss A')}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.assignQuntity.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.quntity.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.measuringUnitName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.rate.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.amount.toFixed(2)}</TableCell>
                                                                    </TableRow>
                                                                )
                                                                )}
                                                            </TableBody>
                                                            <TableRow>
                                                                <TableCell align={'center'} style={{ borderBottom: "none", border: "1px solid black" }}><b>Total</b></TableCell>
                                                                <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                                <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                                <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                                <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                                <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                                <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                                <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                                <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                                <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                                                </TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                                                </TableCell>
                                                                <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                                <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                                                    <b> {totalValues.totalAmount.toFixed(2)} </b>
                                                                </TableCell>
                                                            </TableRow>
                                                            <TableHead>
                                                            </TableHead>
                                                        </Table>
                                                        <TablePagination
                                                            component="div"
                                                            count={attendanceData.length}
                                                            onChangePage={handlePageChange}
                                                            onChangeRowsPerPage={handleLimitChange}
                                                            page={page}
                                                            rowsPerPage={limit}
                                                            rowsPerPageOptions={[5, 10, 25]}
                                                        />
                                                    </TableContainer> : null}
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
                                                    documentTitle={"Daily Non Plucking Attendance"}
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
                                                        searchData={selectedSearchValues} attendanceData={attendanceData} employeeCount={employeeCount}
                                                        totalValues={totalValues} />
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