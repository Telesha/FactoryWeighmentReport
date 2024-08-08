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
import { CustomMultiSelect } from 'src/utils/CustomMultiSelect';

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

const screenCode = 'WORKERATTENDANCEREPORT';

export default function WorkerAttendanceReport(props) {
    const [title, setTitle] = useState("Daily Attendance Report-Plucker")
    const classes = useStyles();
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [groups, setGroups] = useState();
    const [date, setDate] = useState(new Date());
    const [gardens, setGardens] = useState([]);
    const [costCenters, setCostCenters] = useState();
    const [attendanceData, setAttendanceData] = useState([]);
    const [gangs, setGangs] = useState([]);
    const [sirders, setSirders] = useState([]);
    const [operators, setOperators] = useState([]);
    const [sundry, setSundry] = useState([]);
    const [attendanceDataList, setAttendanceDataList] = useState({
        groupID: '0',
        gardenID: '0',
        costCenterID: '0',
        taskID: '0',
        estateTaskID: '0',
        empTypeID: '0',
        gangID: 0,
        sirderID: '0',
        operatorID: 0,
        taskID: '0'
    })

    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: "0",
        gardenName: "0",
        costCenterName: "0",
        date: "",
        taskName: "0",
        estateTaskName: "0",
        empTypeName: "0",
        gangName: "0",
        sirderName: "0",
        operatorName: "0",
        taskName: "0"
    })

    const [totalValues, setTotalValues] = useState({
        totalW1Qty: 0,
        totalW2Qty: 0,
        totalW3Qty: 0

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
    const [empType, setEmpType] = useState([]);
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
    const [selectedOptions4, setSelectedOptions4] = useState([]);
    const getOptionLabel4 = option => `${option.label}`;
    const getOptionDisabled4 = option => option.value === "foo";
    const handleToggleOption4 = selectedOptions =>
        setSelectedOptions4(selectedOptions);
    const handleClearOptions4 = () => setSelectedOptions4([]);
    const handleSelectAll4 = isSelected => {
        if (isSelected) {
            setSelectedOptions4(sirders);
        } else {
            handleClearOptions4();
        }
    };
    const [selectedOptions3, setSelectedOptions3] = useState([]);
    const getOptionLabel3 = option => `${option.label}`;
    const getOptionDisabled3 = option => option.value === "foo";
    const handleToggleOption3 = selectedOptions =>
        setSelectedOptions3(selectedOptions);
    const handleClearOptions3 = () => setSelectedOptions3([]);
    const handleSelectAll3 = isSelected => {
        if (isSelected) {
            setSelectedOptions3(operators);
        } else {
            handleClearOptions3();
        }
    };
    const [selectedOptions2, setSelectedOptions2] = useState([]);
    const getOptionLabel2 = option => `${option.label}`;
    const getOptionDisabled2 = option => option.value === "foo";
    const handleToggleOption2 = selectedOptions =>
        setSelectedOptions2(selectedOptions);
    const handleClearOptions2 = () => setSelectedOptions2([]);
    const handleSelectAll2 = isSelected => {
        if (isSelected) {
            setSelectedOptions2(sundry);
        } else {
            handleClearOptions2();
        }
    };

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission(), GetEmployeeTypesData(), getSirdersForDropdown());
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
        setAttendanceData([])
    }, [date]);

    useEffect(() => {
        if (attendanceDataList.costCenterID != "0") {
            getGangDetailsByDivisionID();
        }
    }, [attendanceDataList.costCenterID]);

    useEffect(() => {
        if (attendanceDataList.gardenID != "0" && attendanceDataList.costCenterID != "0") {
            trackPromise(
                getLabourTask(),
                GetOperatorListByDateAndGardenIDForLabourChecklistReport()
            )
        }

    }, [attendanceDataList.gardenID, attendanceDataList.costCenterID, date]);

    useEffect(() => {
        if (attendanceData.length != 0) {
            calculateTotalQty()
        }
    }, [attendanceData]);

    useEffect(() => {
        setAttendanceData([])
    }, [selectedOptions1]);

    useEffect(() => {
        setAttendanceData([])
    }, [selectedOptions4]);

    useEffect(() => {
        setAttendanceData([])
    }, [selectedOptions2]);

    useEffect(() => {
        setAttendanceData([])
    }, [selectedOptions3]);

    useEffect(() => {
        setAttendanceData([])
    }, [selectedOptions3]);

    useEffect(() => {
        setAttendanceData([])
    }, [selectedOptions]);


    const handleLimitChange = (event) => {
        setLimit(event.target.value);
    };
    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWWORKERATTENDANCEREPORT');

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

    async function getGangDetailsByDivisionID() {
        var response = await services.getGangDetailsByDivisionID(attendanceDataList.costCenterID);
        var newOptionArray = [];
        for (var i = 0; i < response.length; i++) {
            newOptionArray.push({ label: response[i].gangName, value: response[i].gangID })
        }
        setGangs(newOptionArray);
    };

    async function getSirdersForDropdown() {
        const result = await services.getSirdersForDropdown();
        var newOptionArray = [];
        for (var i = 0; i < result.length; i++) {
            newOptionArray.push({ label: result[i].employeeName, value: result[i].employeeID })
        }
        setSirders(newOptionArray);
    }

    async function GetOperatorListByDateAndGardenIDForLabourChecklistReport() {
        const result = await services.GetOperatorListByDateAndGardenIDForLabourChecklistReport(attendanceDataList.gardenID, moment(date.toString()).format().split('T')[0]);
        var newOptionArray = [];
        for (var i = 0; i < result.length; i++) {
            newOptionArray.push({ label: result[i].operatorName, value: result[i].operatorID })
        }
        setOperators(newOptionArray);
    }

    async function getLabourTask() {
        const result = await services.getLabourTask(attendanceDataList.gardenID, attendanceDataList.costCenterID, date);
        var newOptionArray = [];
        for (var i = 0; i < result.length; i++) {
            newOptionArray.push({ label: result[i].taskName, value: result[i].taskID })
        }
        setSundry(newOptionArray);
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
            date: moment(date.toString()).format().split('T')[0],
            empTypeID: selectedOptions.map(x => x.value).join(','),
            gangID: selectedOptions1.map(x => x.value).join(','),
            sirderID: selectedOptions4.map(x => x.label).join(','),
            operatorID: selectedOptions3.map(x => x.value).join(','),
            taskID: selectedOptions2.map(x => x.label).join(',')
        }

        getSelectedDropdownValuesForReport(model);
        const response = await services.GetWorkerAttendanceReportDetails(model);
        if (response.statusCode == "Success" && response.data != null) {
            const attendanceData = response.data;
            const groupedAttendance = attendanceData.reduce((groups, record) => {
                const firstName = record.firstName;
                if (!groups[firstName]) {
                    groups[firstName] = [];
                }
                groups[firstName].push(record);
                return groups;
            }, {});
            setAttendanceData(response.data)
        }
        else {
            setAttendanceData([])
            alert.error(response.message);
        }
    }

    function calculateTotalQty() {
        const totalW1Qty = attendanceData.reduce((accumulator, current) => accumulator + current.session1TimeQuntity, 0);
        const totalW2Qty = attendanceData.reduce((accumulator, current) => accumulator + current.session2TimeQuntity, 0);
        const totalW3Qty = attendanceData.reduce((accumulator, current) => accumulator + current.session3TimeQuntity, 0);
        setTotalValues({
            ...totalValues,
            totalW1Qty: totalW1Qty,
            totalW2Qty: totalW2Qty,
            totalW3Qty: totalW3Qty
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
                    'Sirder': x.sirderName,
                    'Operator': x.operatorName,
                    'Duffa': x.gangName,
                    'Date': x.date == null ? '-' : x.date.split('T')[0],
                    'In Time': x.inTime == null ? '-' : moment(x.inTime).format('HH:mm:ss A'),
                    'Session W 1 Time': x.session1Time == null ? '-' : moment(x.session1Time).format('HH:mm:ss A'),
                    'Session W 1 Section': x.session1Section == null ? '-' : x.session1Section,
                    'Session 1 Quantity': x.session1TimeQuntity == 0 ? '-' : x.session1TimeQuntity,
                    'Session W 2 Time': x.session2Time == null ? '-' : moment(x.session2Time).format('HH:mm:ss A'),
                    'Session W 2 Section': x.session2Section == null ? '-' : x.session2Section,
                    'Session 2 Quantity': x.session2TimeQuntity == 0 ? '-' : x.session2TimeQuntity,
                    'Session W 3 Time': x.session3Time == null ? '-' : moment(x.session3Time).format('HH:mm:ss A'),
                    'Session W 3 Section': x.session3Section == null ? '-' : x.session3Section,
                    'Session 3 Quantity': x.session3TimeQuntity == 0 ? '-' : x.session3TimeQuntity,
                };
                res.push(vr);
            });
            var vr = {
                'Emp.ID': 'Total',
                'Session 1 Quantity': totalValues.totalW1Qty.toFixed(2),
                'Session 2 Quantity': totalValues.totalW2Qty.toFixed(2),
                'Session 3 Quantity': totalValues.totalW3Qty.toFixed(2)
            };
            res.push(vr);
            res.push([])
            var vr = {
                'Emp.ID': 'Garden - ' + selectedSearchValues.gardenName,
                'Emp.Name': 'Division - ' + selectedSearchValues.costCenterName,
                'Emp.Type': selectedSearchValues.empTypeID == "" ? 'Employee Type - All Employee Types' : 'Employee Type - ' + selectedSearchValues.empTypeID,
                'Sirder': selectedSearchValues.gangID == "" ? 'Duffa - All Duffas' : 'Duffa - ' + selectedSearchValues.gangID,
                'Operator': selectedSearchValues.sirderID == "" ? 'Sirder - All Sirders' : 'Sirder - ' + selectedSearchValues.sirderID,
                'Duffa': selectedSearchValues.operatorID == "" ? 'Operator - All Operators' : 'Operator - ' + selectedSearchValues.operatorID,
                'Date': selectedSearchValues.taskID == "" ? 'Task - All Tasks' : 'Task - ' + selectedSearchValues.taskID,
                'In Time': 'Date - ' + moment(selectedSearchValues.date.toString()).format().split('T')[0],
            };
            res.push(vr);
        }
        return res;
    }

    async function createFile() {
        var file = await createDataForExcel(attendanceData);
        var settings = {
            sheetName: 'Daily Attendance Report-Plucker',
            fileName:
                'Daily Attendance Report-Plucker' +
                new Date().toLocaleString().split('T')[0]
        };

        let keys = Object.keys(file[0]);
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem });
        });

        let dataA = [
            {
                sheet: 'Daily Attendance Report-Plucker',
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
            empTypeID: selectedOptions.map(x => x.label).join(','),
            gangID: selectedOptions1.map(x => x.label).join(','),
            sirderID: selectedOptions4.map(x => x.label).join(','),
            operatorID: selectedOptions3.map(x => x.label).join(','),
            taskID: selectedOptions2.map(x => x.label).join(','),
            date: date.toLocaleString().split('T')[0]
        })
    }

    async function GetEmployeeTypesData() {
        const result = await services.GetEmployeeTypesData();
        var newOptionArray = [];
        for (var i = 0; i < result.length; i++) {
            newOptionArray.push({ label: result[i].employeeTypeName, value: result[i].employeeTypeID })
        }
        setEmpType(newOptionArray);
    }

    return (
        <Page className={classes.root} title={title}>
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: attendanceDataList.groupID,
                        gardenID: attendanceDataList.gardenID,
                        costCenterID: attendanceDataList.costCenterID
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
                                                <Grid item md={3} xs={12}>
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
                                                        value={attendanceDataList.gardenID}
                                                        variant="outlined"
                                                        id="gardenID"
                                                        size='small'

                                                    >
                                                        <MenuItem value="0">--Select Garden--</MenuItem>
                                                        {generateDropDownMenu(gardens)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
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
                                                <Grid item md={3} xs={12}>
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
                                                <Grid item md={3} xs={12} >
                                                    <InputLabel shrink id="sirderID">
                                                        Sirder
                                                    </InputLabel>
                                                    <CustomMultiSelect
                                                        items={sirders}
                                                        getOptionLabel={getOptionLabel4}
                                                        getOptionDisabled={getOptionDisabled4}
                                                        selectedValues={selectedOptions4}
                                                        placeholder="Sirder"
                                                        selectAllLabel="Select all"
                                                        onToggleOption={handleToggleOption4}
                                                        onClearOptions={handleClearOptions4}
                                                        onSelectAll={handleSelectAll4}
                                                    />
                                                </Grid>
                                                <Grid item md={3} xs={12} >
                                                    <InputLabel shrink id="operatorID">
                                                        Operator
                                                    </InputLabel>
                                                    <CustomMultiSelect
                                                        items={operators}
                                                        getOptionLabel={getOptionLabel3}
                                                        getOptionDisabled={getOptionDisabled3}
                                                        selectedValues={selectedOptions3}
                                                        placeholder="Operator"
                                                        selectAllLabel="Select all"
                                                        onToggleOption={handleToggleOption3}
                                                        onClearOptions={handleClearOptions3}
                                                        onSelectAll={handleSelectAll3}
                                                    />
                                                </Grid>
                                                <Grid item md={3} xs={12} >
                                                    <InputLabel shrink id="taskID">
                                                        Plucking Kamjari
                                                    </InputLabel>
                                                    <CustomMultiSelect
                                                        items={sundry}
                                                        getOptionLabel={getOptionLabel2}
                                                        getOptionDisabled={getOptionDisabled2}
                                                        selectedValues={selectedOptions2}
                                                        placeholder="Plucking Kamjari"
                                                        selectAllLabel="Select all"
                                                        onToggleOption={handleToggleOption2}
                                                        onClearOptions={handleClearOptions2}
                                                        onSelectAll={handleSelectAll2}
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
                                            <Box minWidth={1050}>
                                                {attendanceData.length > 0 ? (
                                                    <Chip
                                                        icon={<LineWeightIcon />}
                                                        label={"Total Employee Count: " + attendanceData.length}
                                                        color="secondary"
                                                        variant="outlined"
                                                    />
                                                ) : null}
                                                <br>
                                                </br>
                                                <br>
                                                </br>
                                                {attendanceData.length > 0 ?
                                                    <TableContainer component={Paper}>
                                                        <Table className={classes.table} aria-label="simple table">
                                                            <TableHead>
                                                                <TableRow style={{ border: "2px solid black" }}>
                                                                    <TableCell align="left" rowSpan={2} style={{ fontWeight: "bold", border: "2px solid black" }}>Emp.ID</TableCell>
                                                                    <TableCell align="left" rowSpan={2} style={{ fontWeight: "bold", border: "2px solid black" }}>Emp.Name</TableCell>
                                                                    <TableCell align="left" rowSpan={2} style={{ fontWeight: "bold", border: "2px solid black" }}>Emp.Type</TableCell>
                                                                    <TableCell align="left" rowSpan={2} style={{ fontWeight: "bold", border: "2px solid black" }}>Sirder</TableCell>
                                                                    <TableCell align="left" rowSpan={2} style={{ fontWeight: "bold", border: "2px solid black" }}>Operator</TableCell>
                                                                    <TableCell align="left" rowSpan={2} style={{ fontWeight: "bold", border: "2px solid black" }}>Duffa</TableCell>
                                                                    <TableCell align="left" rowSpan={2} style={{ fontWeight: "bold", border: "2px solid black" }}>Date</TableCell>
                                                                    <TableCell align="left" rowSpan={2} style={{ fontWeight: "bold", border: "2px solid black" }}>In Time</TableCell>
                                                                    <TableCell align="center" colSpan={3} style={{ fontWeight: "bold", border: "2px solid black" }}>Session 1</TableCell>
                                                                    <TableCell align="center" colSpan={3} style={{ fontWeight: "bold", border: "2px solid black" }}>Session 2</TableCell>
                                                                    <TableCell align="center" colSpan={3} style={{ fontWeight: "bold", border: "2px solid black" }}>Session 3</TableCell>
                                                                </TableRow>
                                                                <TableRow style={{ border: "2px solid black" }}>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>W 1 Time</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>W 1 Section</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>W 1 Quantity</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>W 2 Time</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>W 2 Section</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>W 2 Quantity</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>W 3 Time</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>W 3 Section</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>W 3 Quantity</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {attendanceData.slice(page * limit, page * limit + limit).map((row, i) => (
                                                                    <TableRow style={{ border: "2px solid black" }} key={i}>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.registrationNumber}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.firstName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.employeeTypeName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.sirderName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.operatorName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.gangName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.date == null ? '-' : row.date.split('T')[0]}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.inTime == null ? '-' : moment(row.inTime).format('HH:mm:ss A')}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.session1Time == null ? '-' : moment(row.session1Time).format('HH:mm:ss A')}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.session1Section == null ? '-' : row.session1Section}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.session1TimeQuntity == 0 ? '-' : row.session1TimeQuntity.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.session2Time == null ? '-' : moment(row.session2Time).format('HH:mm:ss A')}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.session2Section == null ? '-' : row.session2Section}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.session2TimeQuntity == 0 ? '-' : row.session2TimeQuntity.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.session3Time == null ? '-' : moment(row.session3Time).format('HH:mm:ss A')}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.session3Section == null ? '-' : row.session3Section}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.session3TimeQuntity == 0 ? '-' : row.session3TimeQuntity.toFixed(2)}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                            <TableRow>
                                                                <TableCell align={'center'} style={{ borderBottom: "none", border: "1px solid black" }}><b>Total</b></TableCell>
                                                                <TableCell style={{ borderBottom: "none", border: "1px solid black" }} ></TableCell>
                                                                <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                                <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                                <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                                <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                                <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                                <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                                <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                                <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                                <TableCell style={{ borderBottom: "none", border: "1px solid black" }}>
                                                                    <b> {totalValues.totalW1Qty.toFixed(2)} </b>
                                                                </TableCell>
                                                                <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                                <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                                                    <b> {totalValues.totalW2Qty.toFixed(2)} </b>
                                                                </TableCell>
                                                                <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                                <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                                                    <b> {totalValues.totalW3Qty.toFixed(2)} </b>
                                                                </TableCell>
                                                            </TableRow>
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
                                                    documentTitle={"Daily Attendance Report-Plucker"}
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
                                                        searchData={selectedSearchValues} attendanceData={attendanceData} totalValues={totalValues} />
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