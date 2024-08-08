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
import _, { flatMap } from 'lodash';
import Chip from '@material-ui/core/Chip';

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

const screenCode = 'DAILYHARVESTERPERFORMANCESREPORT';

export default function DailyHarvesterPerformancesReport(props) {
    const [title, setTitle] = useState("Daily Harvester Performances Report")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [date, setDate] = useState(new Date());
    const [gardens, setGardens] = useState([]);
    const [costCenters, setCostCenters] = useState();
    const [attendanceData, setAttendanceData] = useState([]);
    const [attendanceDataList, setAttendanceDataList] = useState({
        groupID: '0',
        gardenID: '0',
        costCenterID: '0',
        gangID: '0',
        month: ""
    })

    const [selectedSearchValues, setSelectedSearchValues] = useState({
        group: "",
        estate: "",
        collectionID: "",
        gang: "",
        month: "",
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
    const [gangs, setGang] = useState([]);

    const [total, setTotal] = useState(0);
    const [allTotal, setAllTotal] = useState([]);
    const [csvData, setCsvData] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [columeNames, setColumeNames] = useState([]);
    const [csvHeaders, setCsvHeaders] = useState([]);

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID());
    }, [attendanceDataList.groupID]);

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
        trackPromise(
            getGangByCollectionPointID(attendanceDataList.costCenterID)
        )
    }, [attendanceDataList.costCenterID])

    useEffect(() => {
        setAttendanceData([])
    }, [date]);

    const handleLimitChange = (event) => {
        setLimit(event.target.value);
    };
    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    const [rowsPerPage, setRowsPerPage] = useState(5);
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWDAILYHARVESTERPERFORMANCESREPORT');

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

    async function getGangByCollectionPointID() {
        const gang = await services.getGangByCollectionPointID(attendanceDataList.groupID, attendanceDataList.gardenID, attendanceDataList.costCenterID);
        setGang(gang);
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
            divisionID: parseInt(attendanceDataList.costCenterID),
            estateID: parseInt(attendanceDataList.gardenID),
            gangID: parseInt(attendanceDataList.gangID),
            searchDate: attendanceDataList.month
        }

        getSelectedDropdownValuesForReport(model);

        const response = await services.GetDailyHarvesterPerformancesReport(model);

        if (response.statusCode == "Success" && response.data != null) {

            setAttendanceData(response.data)
            let newRes = _.cloneDeep(response.data);
            var result = [];
            var totalRow = [];
            var totalOfAllrecords = 0;
            var initialcsvHeaders = [];
            initialcsvHeaders.push({ label: "Name", value: "firstName" });
            initialcsvHeaders.push({ label: "Reg No", value: "registrationNumber" });

            newRes.forEach(x => {
                var date = x.cardReadTime.split('T')[0];

                var duplicateTotalRowData = totalRow.find(y => y.name === date);
                if (duplicateTotalRowData) {
                    duplicateTotalRowData.value = duplicateTotalRowData.value + x.totalAmount;
                } else {
                    totalRow.push({ name: date, value: x.totalAmount });
                }

                var duplicateDate = result.find(y => y.employeeID === x.employeeID);
                if (duplicateDate) {
                    duplicateDate[date] = duplicateDate[date] == undefined ? 0 + x.totalAmount : duplicateDate[date] + x.totalAmount;
                    duplicateDate.firstName = x.firstName;
                    duplicateDate.registrationNumber = x.registrationNumber;
                    duplicateDate.employeeID = x.employeeID;
                    duplicateDate.employeeTypeID = x.employeeTypeID;
                    duplicateDate.total = duplicateDate.total == undefined ? 0 + x.totalAmount : duplicateDate.total + x.totalAmount;
                    duplicateDate.totalDays = duplicateDate.totalDays + 1;
                    duplicateDate.configurationValue = x.configurationValue;
                    totalOfAllrecords = totalOfAllrecords + x.totalAmount;
                }
                else {
                    result.push({
                        [date]: x.totalAmount,
                        firstName: x.firstName,
                        registrationNumber: x.registrationNumber,
                        employeeID: x.employeeID,
                        employeeTypeID: x.employeeTypeID,
                        total: x.totalAmount,
                        totalDays: 1,
                        configurationValue: x.configurationValue
                    });
                    totalOfAllrecords = totalOfAllrecords + x.totalAmount;
                }


            });
            setTotal(totalOfAllrecords);
            setAllTotal(totalRow)
            setCsvData(result)
            setReportData(result)
            var year = attendanceDataList.month.split('-')[0]
            var month = attendanceDataList.month.split('-')[1]

            const daysInMonth = getDaysInMonth(parseInt(month), parseInt(year));
            const weekends = getWeekendsInMonth(parseInt(year), parseInt(month));

            var daysForColumn = [];

            for (var i = 0; i < daysInMonth; i++) {
                var dayLength = ((i + 1).toString()).length
                var createDate = (attendanceDataList.month + '-' + (dayLength == 1 ? ('0' + (i + 1)).toString() : (i + 1).toString()).toString())
                let duplicateDate = [];
                weekends.forEach(x => {
                    let sd = x.toLocaleDateString().split("/");
                    let final = sd[2] + "-" + sd[0].padStart(2, 0) + "-" + sd[1].padStart(2, 0);
                    if (final === createDate) {
                        duplicateDate.push(x)
                    }
                })

                var datetodate = date.toDateString();

                var createColumColorCode = duplicateDate.length === 0 ? 0 : (duplicateDate.toString()).substring(0, 3) == "Sat" ? 1 : date.toDateString() === moment(datetodate).format('MM/DD/YYYY') ? 99 : 2
                daysForColumn.push({
                    column: createDate,
                    columnColor: createColumColorCode,
                    columnName: i + 1,
                });
                initialcsvHeaders.push({ label: 'day ' + (i + 1), value: createDate });
            }
            initialcsvHeaders.push({ label: "Total Kg", value: "total" });
            initialcsvHeaders.push({ label: "Total Days", value: "totalDays" });
            setColumeNames(daysForColumn)
            setCsvHeaders(initialcsvHeaders)
            setSelectedSearchData();
            //createDataForExcel(response.data);
        }
        else {
            setAttendanceData([])
            alert.error(response.message);
        }
    }


    function getDaysInMonth(month, year) {
        return new Date(year, month, 0).getDate();
    }

    function getWeekendsInMonth(year, month) {
        const weekends = [];
        const firstDayOfMonth = new Date(year, month - 1, 1);
        const lastDayOfMonth = new Date(year, month, 0);
        for (let datex = firstDayOfMonth; datex <= lastDayOfMonth; datex.setDate(datex.getDate() + 1)) {
            if (datex.getDay() === 5 || datex.getDay() === 6) {
                weekends.push(new Date(datex));
            }
        }
        return weekends;
    }


    function setSelectedSearchData() {
        setSelectedSearchValues({
            ...selectedSearchValues,
            group: groups[attendanceDataList.groupID],
            estate: gardens[attendanceDataList.gardenID],
            collectionID: costCenters[attendanceDataList.costCenterID],
            gang: gangs[attendanceDataList.gangID],
            month: attendanceDataList.month
        })
    }

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            array.map(x => {
                var vr = {
                    'Registration Number': x.registrationNumber,
                    'Employee Name': x.firstName,
                    'Kamjari Code': x.taskCode,
                    'Kamjari Sub Code': x.subTaskCode,
                    'Kamjari Name': x.taskName,
                    'Measuring Unit': x.measuringUnitName,
                    'Quantity': x.quntity,
                    'Rate': x.rate,
                    // 'Allowance': x.allowance,
                    // 'Garden Allowance': x.gardenAllowance,
                };
                res.push(vr);
            });
            res.push([])
            var vr = {
                'Registration Number': 'Legal Entity - ' + selectedSearchValues.groupName,
                'Employee Name': 'Garden - ' + selectedSearchValues.gardenName,
                'Kamjari Code': 'Cost Center - ' + selectedSearchValues.costCenterName,
                'Kamjari Sub Code': 'Date - ' + moment(selectedSearchValues.date.toString()).format().split('T')[0],
                'Kamjari Name': 'Created By - ' + tokenService.getUserNameFromToken(),
                'Measuring Unit': 'Created Date - ' + new Date().toISOString().slice(0, -5),
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
            gardenName: gardens[searchForm.estateID],
            costCenterName: costCenters[searchForm.divisionID],
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
                        gangID: attendanceDataList.gangID
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
                                                        Group  *
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
                                                <Grid item md={4} xs={8}>
                                                    <InputLabel shrink id="costCenterID">
                                                        Duffa
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.gangID && errors.gangID)}
                                                        fullWidth
                                                        helperText={touched.gangID && errors.gangID}
                                                        name="gangID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={attendanceDataList.gangID}
                                                        variant="outlined"
                                                        id="gangID"
                                                        size='small'
                                                    >
                                                        <MenuItem value="0">--Select Duffa--</MenuItem>
                                                        {generateDropDownMenu(gangs)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <TextField
                                                        id="month"
                                                        label="Month *"
                                                        name="month"
                                                        type="month"
                                                        fullWidth
                                                        value={attendanceDataList.month}
                                                        onChange={(e) => handleChange(e)}
                                                        InputLabelProps={{
                                                            shrink: true,
                                                        }}
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
                                            <br />
                                            {reportData.length > 0 ?
                                                <Box minWidth={1150}>
                                                    <Container>
                                                        <Card style={{ justifycontent: 'center' }}>
                                                            <Paper className={classes.paper}>
                                                                <TableContainer>
                                                                    <Table className={classes.table}
                                                                        aria-labelledby="tableTitle"
                                                                        aria-label="enhanced table">
                                                                        <TableHead>
                                                                            <TableRow>
                                                                                <TableCell style={{ fontWeight: "bold", border: "1px solid black" }} align='center'>Name</TableCell>
                                                                                <TableCell style={{ fontWeight: "bold", border: "1px solid black" }} align='center'>Reg No</TableCell>
                                                                                {columeNames.map((item) => (
                                                                                    <TableCell style={{
                                                                                        fontWeight: "bold", border: "1px solid black", backgroundColor: item.columnColor == 0 ? null :
                                                                                            item.columnColor == 1 ? '#fffff' : item.columnColor == 99 ? '#008000' : '#6aa3d6'
                                                                                    }} align='center'>{item.columnName}</TableCell>
                                                                                ))}
                                                                                <TableCell style={{ fontWeight: "bold", border: "1px solid black" }} align='center'>Total Kg</TableCell>
                                                                                <TableCell style={{ fontWeight: "bold", border: "1px solid black" }} align='center'>Total Days</TableCell>
                                                                            </TableRow>
                                                                        </TableHead>
                                                                        <TableBody>
                                                                            {reportData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                                                .map((row, index) => {
                                                                                    return (
                                                                                        <TableRow>
                                                                                            <TableCell align='left' style={{ border: "1px solid black" }}>{row.firstName}</TableCell>
                                                                                            <TableCell align='center' style={{ border: "1px solid black" }}>{row.registrationNumber}</TableCell>
                                                                                            {columeNames.map((column) => {
                                                                                                const value = row[column.column];
                                                                                                return (
                                                                                                    <TableCell style={{
                                                                                                        border: "1px solid black", backgroundColor: column.columnColor == 0 ? null :
                                                                                                            column.columnColor == 1 ? '#fffff' : column.columnColor == 99 ? '#008000' : '#6aa3d6'
                                                                                                    }} align='center'>
                                                                                                        {value == undefined ? '-' :
                                                                                                            row.employeeTypeID == 1 ?
                                                                                                                ((row.configurationValue > parseInt(value)) ?
                                                                                                                    parseInt(value) :
                                                                                                                    parseInt(value)) :
                                                                                                                parseInt(value)
                                                                                                        }</TableCell>
                                                                                                );
                                                                                            })}
                                                                                            <TableCell style={{ fontWeight: "bold", border: "1px solid black" }} align='center'>{row.total}</TableCell>
                                                                                            <TableCell style={{ fontWeight: "bold", border: "1px solid black" }} align='center'>{row.totalDays}</TableCell>
                                                                                        </TableRow>
                                                                                    );
                                                                                })}
                                                                            <TableRow>
                                                                                <TableCell align='center' style={{ fontWeight: "bold", border: "1px solid black" }} colSpan={2}>Plucker Count</TableCell>
                                                                                {columeNames.map((column) => {
                                                                                    const value = reportData.filter(x => x[column.column])
                                                                                    return (
                                                                                        <TableCell style={{
                                                                                            border: "1px solid black", fontWeight: "bold", backgroundColor: column.columnColor == 0 ? null :
                                                                                                column.columnColor == 1 ? '#fffff' : column.columnColor == 99 ? '#008000' : '#6aa3d6'
                                                                                        }} align='center'>{value.length == 0 ? '-' :
                                                                                            parseInt(value.length)}</TableCell>
                                                                                    );
                                                                                })}
                                                                                <TableCell style={{ fontWeight: "bold", border: "1px solid black" }} align='center'>-</TableCell>
                                                                                <TableCell style={{ fontWeight: "bold", border: "1px solid black" }} align='center'>-</TableCell>
                                                                            </TableRow>
                                                                            <TableRow>
                                                                                <TableCell align='center' style={{ fontWeight: "bold", border: "1px solid black" }} colSpan={2}>Total Kg</TableCell>
                                                                                {columeNames.map((column) => {
                                                                                    const value = allTotal.find(x => x.name == column.column)
                                                                                    return (
                                                                                        <TableCell style={{
                                                                                            border: "1px solid black", fontWeight: "bold", backgroundColor: column.columnColor == 0 ? null :
                                                                                                column.columnColor == 1 ? '#fffff' : column.columnColor == 99 ? '#008000' : '#6aa3d6'
                                                                                        }} align='center'>{value == undefined ? '-' :
                                                                                            parseInt(value.value)}</TableCell>
                                                                                    );
                                                                                })}
                                                                                <TableCell style={{ fontWeight: "bold", border: "1px solid black" }} align='center'>{parseInt(total)}</TableCell>
                                                                                <TableCell style={{ fontWeight: "bold", border: "1px solid black" }} align='center'>-</TableCell>
                                                                            </TableRow>
                                                                        </TableBody>
                                                                    </Table>
                                                                </TableContainer>
                                                                <TablePagination
                                                                    rowsPerPageOptions={[5, 10, 50]}
                                                                    component="div"
                                                                    count={reportData.length}
                                                                    rowsPerPage={rowsPerPage}
                                                                    page={page}
                                                                    onChangePage={handleChangePage}
                                                                    onChangeRowsPerPage={handleChangeRowsPerPage}
                                                                />
                                                            </Paper>
                                                        </Card>
                                                    </Container>
                                                </Box>
                                                : null
                                            }
                                        </CardContent>
                                        {attendanceData.length > 0 ?
                                            <Box display="flex" justifyContent="flex-end" p={2}>

                                                <ReactToPrint
                                                    documentTitle={"Daily Harvester Performances Report"}
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
                                                    <CreatePDF ref={componentRef} reportData={reportData} columeNames={columeNames}
                                                        selectedSearchValues={selectedSearchValues} allTotal={allTotal} total={total} />
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