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

const screenCode = 'DAILYATTENDANCEREPORTMORETHANONETASK';

export default function WorkerAttendanceNonPlukingReport(props) {
    const [title, setTitle] = useState("Daily Attendance Report : More Than One Task")
    const classes = useStyles();
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [groups, setGroups] = useState();
    const [date, setDate] = useState(new Date());
    const [gardens, setGardens] = useState([]);
    const [costCenters, setCostCenters] = useState();
    const [attendanceData, setAttendanceData] = useState([]);
    const [employeeType, setEmployeeType] = useState();
    const [gangs, setGangs] = useState([]);
    const [sirders, setSirders] = useState([]);
    const [operators, setOperators] = useState([]);
    const [sundry, setSundry] = useState([]);
    const [payPoints, setPayPoints] = useState([]);
    const [attendanceDataList, setAttendanceDataList] = useState({
        groupID: '0',
        gardenID: '0',
        costCenterID: '0',
        taskID: '0',
        estateTaskID: '0',
        payPointID: '0',
        empTypeID: '0',
        gangID: '0',
        sirderID: '0',
        operatorID: 0,
        registrationNumber: '',

    })
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: "0",
        gardenName: "0",
        payPointName: "0",
        date: "",
        taskName: "0",
        estateTaskName: "0",
        empTypeName: "0",
        gangName: "0",
        sirderName: "0",
        operatorName: "0",
        taskName: "0",
        registrationNumber: "",
    })
    const [totalValues, setTotalValues] = useState({
        totalCompletedTasks: 0,
        totalOfAmount: 0,
        totalAllowance: 0,
        totalAddition: 0,
        totalDeduction: 0,
        totalOfTotalAmount: 0,

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
        setAttendanceDataList((prevState) => ({
            ...prevState,
            costCenterID: "0"
        }));
    }, [attendanceDataList.groupID]);

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID());
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
        setAttendanceData([])
    }, [attendanceDataList.registrationNumber]);

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID(),
            GetDivisionDetailsByGroupID());
    }, [attendanceDataList.groupID]);

    useEffect(() => {
        setAttendanceData([])
    }, [attendanceDataList.payPointID]);


    useEffect(() => {
        if (attendanceDataList.gardenID != "0" && attendanceDataList.costCenterID != "0") {
            trackPromise(
                getLabourTask(),
                GetOperatorListByDateAndGardenIDForLabourChecklistReport()
            )
        }
    }, [attendanceDataList.gardenID, attendanceDataList.costCenterID, date]);

    useEffect(() => {
        if (attendanceDataList.costCenterID != "0") {
            getGangDetailsByDivisionID();
        }
    }, [attendanceDataList.costCenterID]);

    const handleLimitChange = (event) => {
        setLimit(event.target.value);
    };
    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    useEffect(() => {
        if (attendanceData.length != 0) {
            calculateTotalQty()
        }
    }, [attendanceData]);

    useEffect(() => {
        setAttendanceData([])
    }, [selectedOptions]);

    useEffect(() => {
        setAttendanceData([])
    }, [selectedOptions1]);

    useEffect(() => {
        setAttendanceData([])
    }, [selectedOptions2]);

    useEffect(() => {
        setAttendanceData([])
    }, [selectedOptions3]);

    useEffect(() => {
        setAttendanceData([])
    }, [selectedOptions4]);

    async function GetEmployeeTypesData() {
        const result = await services.GetEmployeeTypesData();
        var newOptionArray = empType;
        for (var i = 0; i < result.length; i++) {
            newOptionArray.push({ label: result[i].employeeTypeName, value: result[i].employeeTypeID })
        }
        setEmpType(newOptionArray);
    }

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWDAILYATTENDANCEREPORTMORETHANONETASK');

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
        getEmployeeTypesForDropdown();
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


    async function getEmployeeTypesForDropdown() {
        const types = await services.getEmployeeTypesForDropdown();
        setEmployeeType(types);
    }

    async function getSirdersForDropdown() {
        const result = await services.getSirdersForDropdown();
        var newOptionArray = [];
        for (var i = 0; i < result.length; i++) {
            newOptionArray.push({ label: result[i].employeeName, value: result[i].employeeID })
        }
        setSirders(newOptionArray);
    }

    async function getLabourTask() {
        const result = await services.getLabourTask(attendanceDataList.gardenID, attendanceDataList.costCenterID, date);
        var newOptionArray = [];
        for (var i = 0; i < result.length; i++) {
            newOptionArray.push({ label: result[i].taskName, value: result[i].taskID })
        }
        setSundry(newOptionArray);
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

    async function getGangDetailsByDivisionID() {
        var response = await services.getGangDetailsByDivisionID(attendanceDataList.costCenterID);
        
        var newOptionArray = [];
        for (var i = 0; i < response.length; i++) {
            newOptionArray.push({ label: response[i].gangName, value: response[i].gangID })
        }
        setGangs(newOptionArray);
    };

    async function GetOperatorListByDateAndGardenIDForLabourChecklistReport() {
        const result = await services.GetOperatorListByDateAndGardenIDForLabourChecklistReport(attendanceDataList.gardenID, moment(date.toString()).format().split('T')[0]);
        var newOptionArray = [];
        for (var i = 0; i < result.length; i++) {
            newOptionArray.push({ label: result[i].operatorName, value: result[i].operatorID })
        }
        setOperators(newOptionArray);
    }
    async function GetDetails() { 
        let model = {
            gardenID: parseInt(attendanceDataList.gardenID),
            costCenterID: parseInt(attendanceDataList.costCenterID),     
            payPointID: parseInt(attendanceDataList.payPointID),
            date: moment(date.toString()).format().split('T')[0],
            empTypeID: selectedOptions.map(x => x.value).join(','),
            gangID: selectedOptions1.map(x => x.value).join(','),
            sirderID: selectedOptions4.map(x => x.value).join(','),
            operatorID: selectedOptions3.map(x => x.value).join(','),
            taskID: selectedOptions2.map(x => x.value).join(','),
            registrationNumber: attendanceDataList.registrationNumber,
        }
        getSelectedDropdownValuesForReport(model);
        const response = await services.GetDailyAttendanceReportMoreThanOneTaskReportDetails(model);
        if (response.statusCode == "Success" && response.data != null) {
            setAttendanceData(response.data)
        }
        else {
            setAttendanceData([])
            alert.error(response.message);
        }
    }

    function calculateTotalQty() {
        const totalCompletedTasks = attendanceData.reduce((accumulator, current) => accumulator + current.completedTask, 0);
        const totalOfAmount = attendanceData.reduce((accumulator, current) => accumulator + current.amount, 0);
        const totalAllowance = attendanceData.reduce((accumulator, current) => accumulator + current.allowance, 0);
        const totalAddition = attendanceData.reduce((accumulator, current) => accumulator + current.addition, 0);
        const totalDeduction = attendanceData.reduce((accumulator, current) => accumulator + current.deduction, 0);
        const totalOfTotalAmount = attendanceData.reduce((accumulator, current) => accumulator + current.totalAmount, 0);
        setTotalValues({
            ...totalValues,
            totalCompletedTasks: totalCompletedTasks,
            totalOfAmount: totalOfAmount,
            totalAllowance: totalAllowance,
            totalAddition: totalAddition,
            totalDeduction: totalDeduction,
            totalOfTotalAmount: totalOfTotalAmount,
        })
    };

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            array.map(x => {
                var vr = {
                    'Emp.ID': x.registrationNumber,
                    'Emp.Name': x.firstName,
                    'Field': x.fieldName,
                    'Operator': x.operatorName,
                    'Kamjari': x.taskName,
                    'Job Type': x.jobTypeID == 1 ? 'General' : x.jobTypeID == 2 ? 'Cash' : '-',
                    'Completed Task': x.completedTask,
                    'Amount': x.amount == 0 ? '-' : x.amount.toFixed(2),
                    'Allowance': x.allowance == 0 ? '-' : x.allowance.toFixed(2),
                    'Addition': x.addition == 0 ? '-' : x.addition.toFixed(2),
                    'Deduction': x.deduction == 0 ? '-' : x.deduction.toFixed(2),
                    'Total Amount': x.totalAmount == 0 ? '-' : x.totalAmount.toFixed(2),
                };
                res.push(vr);
            });
            var vr = {
                'Emp.ID': 'Total',
                'Amount': totalValues.totalOfAmount == 0 ? '-' : totalValues.totalOfAmount.toFixed(2),
                'Allowance': totalValues.totalAllowance == 0 ? '-' : totalValues.totalAllowance.toFixed(2),
                'Addition': totalValues.totalAddition == 0 ? '-' : totalValues.totalAddition.toFixed(2),
                'Deduction': totalValues.totalDeduction == 0 ? '-' : totalValues.totalDeduction.toFixed(2),
                'Total Amount': totalValues.totalOfTotalAmount == 0 ? '-' : totalValues.totalOfTotalAmount.toFixed(2),
            };
            res.push(vr);
            res.push([])
            var vr = {
                'Emp.ID': 'Location - ' + selectedSearchValues.gardenName,
                'Emp.Name': 'Pay point - ' + selectedSearchValues.payPointName,
                'Field': selectedSearchValues.empTypeID == "" ? 'Emp.Type - All Emp.Types' : 'Emp.Type - ' + selectedSearchValues.empTypeID,
                'Operator': selectedSearchValues.registrationNumber == "" ? 'Emp.ID - All Emp.ID' : 'Emp.ID - ' + selectedSearchValues.registrationNumber,
                'Kamjari': selectedSearchValues.gangID == "" ? 'Duffa - All Duffas' : 'Duffa - ' + selectedSearchValues.gangID,
                'Job Type': selectedSearchValues.fieldID == "" ? 'Field - All Field' : 'Field - ' + selectedSearchValues.fieldID,
                'Completed Task': selectedSearchValues.operatorID == "" ? 'Operator - All Operators' : 'Operator - ' + selectedSearchValues.operatorID,
            };
            res.push(vr);
        }
        return res;
    }

    async function GetDivisionDetailsByGroupID() {
        const result = await services.GetDivisionDetailsByGroupID(attendanceDataList.groupID);
        setPayPoints(result)
    }

    async function createFile() {
        var file = await createDataForExcel(attendanceData);
        var settings = {
            sheetName: 'DA Report : More Than One Task',
            fileName:
                'Daily Attendance Report : More Than One Task ' +
                new Date().toLocaleString().split('T')[0]
        };

        let keys = Object.keys(file[0]);
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem });
        });

        let dataA = [
            {
                sheet: 'DA Report : More Than One Task',
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
            groupName: groups[attendanceDataList.groupID],
            gardenName: gardens[searchForm.gardenID],
            payPointName: payPoints[searchForm.payPointID],
            empTypeID: selectedOptions.map(x => x.label).join(','),
            gangID: selectedOptions1.map(x => x.label).join(','),
            sirderID: selectedOptions4.map(x => x.label).join(','),
            operatorID: selectedOptions3.map(x => x.label).join(','),
            taskID: selectedOptions2.map(x => x.label).join(','),
            date: date.toLocaleString().split('T')[0],
            registrationNumber: searchForm.registrationNumber
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
                        payPointID: attendanceDataList.payPointID
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Legal Entity is required').min("1", 'Legal Entity is required'),
                            gardenID: Yup.number().required('Garden is required').min("1", 'Garden is required'),
                            payPointID: Yup.number().required('Cost Center is required').min("1", 'Cost Center is required'),
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
                                                        value={attendanceDataList.groupID}
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
                                                        value={attendanceDataList.gardenID}
                                                        variant="outlined"
                                                        id="gardenID"
                                                        size='small'

                                                    >
                                                        <MenuItem value="0">--Select Location--</MenuItem>
                                                        {generateDropDownMenu(gardens)}
                                                    </TextField>

                                                </Grid>
                                                
                                                <Grid
                                                item md={3} xs={12}>
                                                        <InputLabel shrink id="payPointID">
                                                            Pay Point *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.payPointID && errors.payPointID)}
                                                            fullWidth
                                                            helperText={touched.payPointID && errors.payPointID}
                                                            name="payPointID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={attendanceDataList.payPointID}
                                                            variant="outlined"
                                                            id="payPointID"
                                                            size='small'
                                                        >
                                                            <MenuItem value="0">--Select Pay Point--</MenuItem>
                                                            {generateDropDownMenu(payPoints)}
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
                                                        Emp.Type
                                                    </InputLabel>
                                                    <CustomMultiSelect
                                                        items={empType}
                                                        getOptionLabel={getOptionLabel}
                                                        getOptionDisabled={getOptionDisabled}
                                                        selectedValues={selectedOptions}
                                                        placeholder="Emp.Type"
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
                                                        Field
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
                                                        Non Plucking Kamjari
                                                    </InputLabel>
                                                    <CustomMultiSelect
                                                        items={sundry}
                                                        getOptionLabel={getOptionLabel2}
                                                        getOptionDisabled={getOptionDisabled2}
                                                        selectedValues={selectedOptions2}
                                                        placeholder="Non Plucking Kamjari"
                                                        selectAllLabel="Select all"
                                                        onToggleOption={handleToggleOption2}
                                                        onClearOptions={handleClearOptions2}
                                                        onSelectAll={handleSelectAll2}
                                                    />
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="registrationNumber">
                                                        Emp.ID
                                                    </InputLabel>
                                                    <TextField
                                                        fullWidth
                                                        size='small'
                                                        name="registrationNumber"
                                                        onChange={(e) => handleChange(e)}
                                                        value={attendanceDataList.registrationNumber}
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
                                            <br />
                                            <Box minWidth={900}>
                                                {attendanceData.length > 0 ?
                                                    <TableContainer component={Paper}>
                                                        <Table className={classes.table} aria-label="simple table">
                                                            <TableHead>
                                                                <TableRow style={{ border: "2px solid black" }}>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", width: "0.5px" }}>Emp.ID</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", width: "0.5px" }}>Emp.Name</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", width: "0.5px" }}>Field</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", width: "0.5px" }}>Operator</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", width: "100px" }}>Kamjari</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", width: "0.5px" }}>Job Type</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", width: "0.5px" }}>Completed Task</TableCell>                                                                   
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", width: "0.5px" }}>Target</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", width: "0.5px" }}>Actual</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", width: "1px" }}>Amount</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", width: "1px" }}>Allowance</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", width: "1px" }}>Addition</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", width: "1px" }}>Deduction</TableCell>
                                                                    <TableCell align="center" style={{ fontSize: "18px", fontWeight: "bold", border: "2px solid black", width: "1px" }}>Total Amount</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {attendanceData.slice(page * limit, page * limit + limit).map((row, i) => (
                                                                    <TableRow style={{ border: "2px solid black" }} key={i}>
                                                                        <TableCell component="th" scope="row" align="center" style={{ border: "2px solid black" }}> {row.registrationNumber}</TableCell>
                                                                        <TableCell component="th" scope="row" align="center" style={{ border: "2px solid black" }}> {row.firstName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="center" style={{ border: "2px solid black" }}> {row.sirderName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="center" style={{ border: "2px solid black" }}> {row.operatorName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="center" style={{ border: "2px solid black" }}> {row.taskName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="center" style={{ border: "2px solid black" }}> {(row.jobTypeID == 1 ? 'General' : row.jobTypeID == 2 ? 'Cash' : '-')}</TableCell>
                                                                        <TableCell component="th" scope="row" align="center" style={{ border: "2px solid black" }}> {row.completedTask}</TableCell> 
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }} > {(row.assignQuntity)} </TableCell>                                                                               
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }} > {(row.quntity)} </TableCell>                                       
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "2px solid black" }}> {row.amount == 0 ? '-' : row.amount.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "2px solid black" }}> {row.allowance == 0 ? '-' : row.allowance.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "2px solid black" }}> {row.deduction == 0 ? '-' : row.deduction.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "2px solid black" }}> {row.addition == 0 ? '-' : row.addition.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ fontSize: "18px", border: "2px solid black" }}> <b>{row.totalAmount == 0 ? '-' : row.totalAmount.toFixed(2)}</b></TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                            <TableRow>
                                                                <TableCell align={'center'} colSpan={9} style={{ borderBottom: "none", border: "2px solid black" }}><b>Total</b></TableCell>
                                                                <TableCell align={'right'} style={{ borderBottom: "none", border: "2px solid black" }}>
                                                                    <b> {totalValues.totalOfAmount == 0 ? '-' : totalValues.totalOfAmount.toFixed(2)} </b>
                                                                </TableCell>
                                                                <TableCell align={'right'} style={{ borderBottom: "none", border: "2px solid black" }}>
                                                                    <b> {totalValues.totalAllowance == 0 ? '-' : totalValues.totalAllowance.toFixed(2)} </b>
                                                                </TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "2px solid black" }}>
                                                                    <b> {totalValues.totalAddition== 0 ? '-' : totalValues.totalAddition.toFixed(2)} </b>
                                                                </TableCell>
                                                                <TableCell align={'right'} style={{ borderBottom: "none", border: "2px solid black" }}>
                                                                    <b> {totalValues.totalDeduction== 0 ? '-' : totalValues.totalDeduction.toFixed(2)} </b>
                                                                </TableCell>
                                                                <TableCell align={'right'} style={{ fontSize: "18px", borderBottom: "none", border: "2px solid black" }}>
                                                                    <b> {totalValues.totalOfTotalAmount == 0 ? '-' : totalValues.totalOfTotalAmount.toFixed(2)} </b>
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
                                                    documentTitle={"Daily Attendance Report : More Than One Task"}
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