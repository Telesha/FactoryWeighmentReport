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

const screenCode = 'DAILYNONPLUCKINGRECONCILIATIONREPORT';

export default function DailyNonPluckingReconciliationReport(props) {
    const [title, setTitle] = useState("Daily Non Plucking Reconciliation Report")
    const classes = useStyles();
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [groups, setGroups] = useState();
    const [date, setDate] = useState(new Date());
    const [gardens, setGardens] = useState([]);
    const [costCenters, setCostCenters] = useState();
    const [payPoints, setPayPoints] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [employeeType, setEmployeeType] = useState();
    const [gangs, setGangs] = useState([]);
    const [sirders, setSirders] = useState([]);
    const [operators, setOperators] = useState([]);
    const [sundry, setSundry] = useState([]);
    const [status, setStatus] = useState([]);
    const [attendanceDataList, setAttendanceDataList] = useState({
        groupID: '0',
        gardenID: '0',
        costCenterID: '0',
        taskID: '0',
        estateTaskID: '0',
        empTypeID: '0',
        fieldID: '0',
        sirderID: '0',
        operatorID: 0,
        registrationNumber: '',
        payPointID: '0'
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
        taskName: "0",
        registrationNumber: ''
    })

    const [totalValues, setTotalValues] = useState({
        totalAmount: 0,
        totalBCSAllowance: 0,
        totalExtraPayment: 0,
        totalExtraHazira: 0,
        totalTotalAmount: 0,
        totalAddition: 0,
        totalDeduction: 0,
        totalMandayCount: 0
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
    const [fields, setFields] = useState([]);
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
    //MultiSelect Sections
    const [selectedOptions1, setSelectedOptions1] = useState([]);
    const getOptionLabel1 = option => `${option.label}`;
    const getOptionDisabled1 = option => option.value === "foo";
    const handleToggleOption1 = selectedOptions =>
        setSelectedOptions1(selectedOptions);
    const handleClearOptions1 = () => setSelectedOptions1([]);
    const handleSelectAll1 = isSelected => {
        if (isSelected) {
            setSelectedOptions1(fields);
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
    const [selectedOptionsstatus, setSelectedOptionsstatus] = useState([]);
    const getOptionLabelstatus = option => `${option.label}`;
    const getOptionDisabledstatus = option => option.value === "foo";
    const handleToggleOptionstatus = selectedOptionsstatus =>
        setSelectedOptionsstatus(selectedOptionsstatus);
    const handleClearOptionsstatus = () => setSelectedOptionsstatus([]);
    const handleSelectAllstatus = isSelected => {
        if (isSelected) {
            setSelectedOptionsstatus(status);
        } else {
            handleClearOptionsstatus();
        }
    };
    const [initialState,setInitialState] = useState(false);

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission(), GetEmployeeTypesData(), getStatus());
    }, []);

    useEffect(()=>{
        if(!initialState){
            trackPromise(getPermission());
        }
    },[])

    useEffect(() => {
        setAttendanceDataList((prevState) => ({
            ...prevState,
            costCenterID: "0"
        }));
    }, [attendanceDataList.groupID]);

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID(), GetDivisionDetailsByGroupID());
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

    useEffect(() => {
        if (attendanceDataList.costCenterID != "0") {
            trackPromise(GetFieldDetailsByDivisionID(), getSirdersForDropdown())
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

    useEffect(() => {
        setAttendanceData([])
    }, [selectedOptionsstatus]);

    useEffect(()=>{
        if(initialState){
            setAttendanceDataList((prevState)=>({
                ...prevState,
                gardenID:0,
                payPointID:0,
                costCenterID:0

            }));
        }
    },[attendanceDataList.groupID,initialState]);

    async function GetEmployeeTypesData() {
        const result = await services.GetAllEmployeeSubCategoryMapping();
        var newOptionArray = empType;
        for (var i = 0; i < result.length; i++) {
            newOptionArray.push({ label: result[i].employeeSubCategoryName, value: result[i].employeeSubCategoryMappingID })
        }
        setEmpType(newOptionArray);
    }

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWNONPLUCKINGRECONCILIATIONREPORT');

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
        var generated = generateDropDownMenu(response)
        if (generated.length > 0) {
            setAttendanceDataList((attendanceDataList) => ({
                ...attendanceDataList,
                costCenterID: generated[0].props.value,
            }));
        }
        setCostCenters(response);
    };

    async function GetDivisionDetailsByGroupID() {
        const result = await services.GetDivisionDetailsByGroupID(attendanceDataList.groupID);
        setPayPoints(result);
    }

    async function GetFieldDetailsByDivisionID() {
        var response = await services.GetFieldDetailsByDivisionID(attendanceDataList.costCenterID);
        const newOptionArray = [];
        for (var i = 0; i < response.length; i++) {
            newOptionArray.push({ label: response[i].fieldName, value: response[i].fieldID })
        }
        setFields(newOptionArray);
    };

    async function getEmployeeTypesForDropdown() {
        const types = await services.getEmployeeTypesForDropdown();
        setEmployeeType(types);
    }

    async function getSirdersForDropdown() {
        const result = await services.GetSirdersByDivisionID(attendanceDataList.costCenterID);
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

    async function getStatus() {
        const status = [
            { value: 1, label: 'Suspended' },
            { value: 2, label: 'Completed' }
        ];
        setStatus(status);
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
            newOptionArray.push({ label: response[i].gangName, value: response[i].fieldID })
        }
        setGangs(newOptionArray);
    };

    async function GetOperatorListByDateAndGardenIDForLabourChecklistReport() {
        const result = await services.GetOperatorListByDateAndGardenIDForLabourChecklistReport(attendanceDataList.gardenID, moment(date.toString()).format().split('T')[0]);
        const newOptionArray = [];
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
            registrationNumber: attendanceDataList.registrationNumber,
            fieldID: selectedOptions1.map(x => x.value).join(','),
            sirderID: selectedOptions4.map(x => x.value).join(','),
            operatorID: selectedOptions3.map(x => x.value).join(','),
            taskID: selectedOptions2.map(x => x.value).join(','),
            statusID: selectedOptionsstatus.map(x => x.label).join(','),
            jobTypeID: 2
        }
        getSelectedDropdownValuesForReport(model);
        const response = await services.GetWorkerAttendanceNonPlukingReportDetails(model);
        if (response.statusCode == "Success" && response.data != null) {

            const sortedData = [...response.data];
            sortedData.sort((a, b) => {
                return a.registrationNumber.localeCompare(b.registrationNumber, undefined, { numeric: true });

            });

            setAttendanceData(sortedData)
        }
        else {
            setAttendanceData([])
            alert.error(response.message);
        }
    }

    function calculateTotalQty() {
        const totalAmount = attendanceData.reduce((accumulator, current) => accumulator + current.amount, 0);
        const totalBCSAllowance = attendanceData.reduce((accumulator, current) => accumulator + current.bcsAllowance, 0);
        const totalExtraPayment = attendanceData.reduce((accumulator, current) => accumulator + current.extraPayment, 0);
        const totalExtraHazira = attendanceData.reduce((accumulator, current) => accumulator + current.extraHazira, 0);
        const totalTotalAmount = attendanceData.reduce((accumulator, current) => accumulator + current.totalAmount, 0);
        const totalAddition = attendanceData.reduce((accumulator, current) => accumulator + current.addition, 0);
        const totalDeduction = attendanceData.reduce((accumulator, current) => accumulator + current.deduction, 0);
        const totalMandayCount = attendanceData.reduce((accumulator, current) => accumulator + current.mandaysCount, 0);
        setTotalValues({
            ...totalValues,
            totalAmount: totalAmount,
            totalBCSAllowance: totalBCSAllowance,
            totalExtraPayment: totalExtraPayment,
            totalExtraHazira: totalExtraHazira,
            totalTotalAmount: totalTotalAmount,
            totalAddition: totalAddition,
            totalDeduction: totalDeduction,
            totalMandayCount: totalMandayCount
        })
    };

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            array.map(x => {
                var vr = {
                    'Kamjari': x.taskName,
                    'Emp.ID': x.registrationNumber,
                    'Emp.Name': x.employeeName,
                    'Measuring unit': x.measuringunit,
                    'Measuring Quantity': x.measuringQuantity,
                    'Mandays Count': x.mandaysCount,
                    'Amount': x.amount.toFixed(2),
                    'BCS Allowance': x.bcsAllowance.toFixed(2),
                    'Extra Payment': x.extraPayment.toFixed(2),
                    'Extra Hazira': x.extraHazira.toFixed(2),
                    'Addition': x.addition.toFixed(2),
                    'Deduction': x.deduction.toFixed(2),
                    'Total Amount': x.totalAmount.toFixed(2),
                };
                res.push(vr);
            });
            var vr = {
                'Kamjari': 'Grand Total',
                'Mandays Count': totalValues.totalMandayCount.toFixed(2),
                'Amount': totalValues.totalAmount.toFixed(2),
                'BCS Allowance': totalValues.totalBCSAllowance.toFixed(2),
                'Extra Payment': totalValues.totalExtraPayment.toFixed(2),
                'Extra Hazira': totalValues.totalExtraHazira.toFixed(2),
                'Addition': totalValues.totalAddition.toFixed(2),
                'Deduction': totalValues.totalDeduction.toFixed(2),
                'Total Amount': totalValues.totalTotalAmount.toFixed(2),
            };
            res.push(vr);
            res.push([])
            var vr = {
                'Kamjari': 'Location - ' + selectedSearchValues.gardenName,
                'Emp.ID': 'Sub Division - ' + selectedSearchValues.costCenterName,
                'Emp.Name': selectedSearchValues.empTypeID == "" ? 'Employee Sub Category - All Employee Sub Categories' : 'Employee Sub Category - ' + selectedSearchValues.empTypeID,
                'Measuring unit': selectedSearchValues.fieldID == "" ? 'Field - All Fields' : 'Field - ' + selectedSearchValues.fieldID,
                'Measuring Quantity': selectedSearchValues.sirderID == "" ? 'Sirder - All Sirders' : 'Sirder - ' + selectedSearchValues.sirderID,
                'Mandays Count': selectedSearchValues.operatorID == "" ? 'Operator - All Operators' : 'Operator - ' + selectedSearchValues.operatorID,
                'Amount': selectedSearchValues.taskID == "" ? 'Task - All Tasks' : 'Task - ' + selectedSearchValues.taskID,
                'BCS Allowance': selectedSearchValues.statusID == "" ? 'Status - All Status' : 'Status - ' + selectedSearchValues.statusID,
                'Extra Payment': 'Date - ' + moment(selectedSearchValues.date.toString()).format().split('T')[0]
            };
            res.push(vr);
        }
        return res;
    }

    async function createFile() {
        var file = await createDataForExcel(attendanceData);
        var settings = {
            sheetName: 'Daily NP Reconciliation Report',
            fileName:
                'Daily NP Reconciliation Report ' + ' - ' + selectedSearchValues.gardenName + ' - ' + selectedSearchValues.costCenterName + ' - ' + moment(selectedSearchValues.date.toString()).format().split('T')[0]
        };

        let keys = Object.keys(file[0]);
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem });
        });
        let dataA = [
            {
                sheet: 'Daily NP Reconciliation Report',
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
            registrationNumber: attendanceDataList.registrationNumber,
            costCenterName: costCenters[searchForm.costCenterID],
            empTypeID: selectedOptions.map(x => x.label).join(','),
            fieldID: selectedOptions1.map(x => x.label).join(','),
            sirderID: selectedOptions4.map(x => x.label).join(','),
            operatorID: selectedOptions3.map(x => x.label).join(','),
            taskID: selectedOptions2.map(x => x.label).join(','),
            statusID: selectedOptionsstatus.map(x => x.label).join(','),
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
                        costCenterID: attendanceDataList.costCenterID
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Business Division is required').min("1", 'Business Division is required'),
                            gardenID: Yup.number().required('Location is required').min("1", 'Location is required'),
                            //costCenterID: Yup.number().required('Sub Division is required').min("1", 'Sub Division is required'),
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
                                                        Location*
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
                                                        format="yyyy-MM-dd"
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
                                                        Sub Division
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
                                                        <MenuItem value="0">--All Sub Divisions--</MenuItem>
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
                                                        value={attendanceDataList.payPointID}
                                                        variant="outlined"
                                                        id="payPointID"
                                                        size='small'
                                                    >
                                                        <MenuItem value="0">--All Pay Points--</MenuItem>
                                                        {generateDropDownMenu(payPoints)}
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
                                                <Grid item md={3} xs={12} >
                                                    <InputLabel shrink id="empTypeID">
                                                        Employee Sub Category
                                                    </InputLabel>
                                                    <CustomMultiSelect
                                                        items={empType}
                                                        getOptionLabel={getOptionLabel}
                                                        getOptionDisabled={getOptionDisabled}
                                                        selectedValues={selectedOptions}
                                                        placeholder="Employee Sub Category"
                                                        selectAllLabel="Select all"
                                                        onToggleOption={handleToggleOption}
                                                        onClearOptions={handleClearOptions}
                                                        onSelectAll={handleSelectAll}
                                                    />
                                                </Grid>
                                                <Grid item md={3} xs={12} >
                                                    <InputLabel shrink id="fieldID">
                                                        Fields
                                                    </InputLabel>
                                                    <CustomMultiSelect
                                                        items={fields}
                                                        getOptionLabel={getOptionLabel1}
                                                        getOptionDisabled={getOptionDisabled1}
                                                        selectedValues={selectedOptions1}
                                                        placeholder="--Select Fields--"
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
                                                        Kamjari
                                                    </InputLabel>
                                                    <CustomMultiSelect
                                                        items={sundry}
                                                        getOptionLabel={getOptionLabel2}
                                                        getOptionDisabled={getOptionDisabled2}
                                                        selectedValues={selectedOptions2}
                                                        placeholder="Kamjari"
                                                        selectAllLabel="Select all"
                                                        onToggleOption={handleToggleOption2}
                                                        onClearOptions={handleClearOptions2}
                                                        onSelectAll={handleSelectAll2}
                                                    />
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="StatusID">
                                                        Status
                                                    </InputLabel>
                                                    <CustomMultiSelect
                                                        items={status}
                                                        getOptionLabel={getOptionLabelstatus}
                                                        getOptionDisabled={getOptionDisabledstatus}
                                                        selectedValues={selectedOptionsstatus}
                                                        placeholder="Status"
                                                        selectAllLabel="Select all"
                                                        onToggleOption={handleToggleOptionstatus}
                                                        onClearOptions={handleClearOptionsstatus}
                                                        onSelectAll={handleSelectAllstatus}
                                                    />
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="registrationNumber">
                                                        Reg. No.
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
                                            <Box minWidth={1050}>
                                                <br></br>
                                                <br></br>
                                                {attendanceData.length > 0 ?
                                                    <TableContainer component={Paper}>
                                                        <Table className={classes.table} aria-label="simple table" size='small'>
                                                            <TableHead>
                                                                <TableRow style={{ border: "2px solid black" }}>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>Kamjari</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>Reg. No.</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>Emp.Name</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>Measuring unit</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>Measuring Quantity</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>Mandays Count</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>Amount</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>BCS Allowance</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>Extra Payment</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>Extra Hazira</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>Addition</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>Deduction</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>Total Amount</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {attendanceData.slice(page * limit, page * limit + limit).map((row, i) => (
                                                                    <TableRow style={{ border: "2px solid black" }} key={i}>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.taskName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.registrationNumber}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.employeeName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.measuringunit}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "2px solid black" }}> {row.measuringQuantity}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "2px solid black" }}> {row.mandaysCount}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "2px solid black" }}> {row.amount}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "2px solid black" }}> {row.bcsAllowance}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "2px solid black" }}> {row.extraPayment}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "2px solid black" }}> {row.extraHazira}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "2px solid black" }}> {row.addition}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "2px solid black" }}> {row.deduction}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ fontSize: "18px", border: "2px solid black" }}> <b>{row.totalAmount}</b></TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                            <TableRow>
                                                                <TableCell align={'center'} colSpan={5} style={{ borderBottom: "none", border: "2px solid black" }}><b>Grand Total</b></TableCell>
                                                                <TableCell align={'right'} style={{ borderBottom: "none", border: "2px solid black" }}>
                                                                    <b> {totalValues.totalMandayCount} </b>
                                                                </TableCell>
                                                                <TableCell align={'right'} style={{ borderBottom: "none", border: "2px solid black" }}>
                                                                    <b> {totalValues.totalAmount.toFixed(2)} </b>
                                                                </TableCell>
                                                                <TableCell align={'right'} style={{ borderBottom: "none", border: "2px solid black" }}>
                                                                    <b> {totalValues.totalBCSAllowance.toFixed(2)} </b>
                                                                </TableCell>
                                                                <TableCell align={'right'} style={{ borderBottom: "none", border: "2px solid black" }}>
                                                                    <b> {totalValues.totalExtraPayment.toFixed(2)} </b>
                                                                </TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "2px solid black" }}>
                                                                    <b> {totalValues.totalExtraHazira.toFixed(2)} </b>
                                                                </TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "2px solid black" }}>
                                                                    <b> {totalValues.totalAddition.toFixed(2)} </b>
                                                                </TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "2px solid black" }}>
                                                                    <b> {totalValues.totalDeduction.toFixed(2)} </b>
                                                                </TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ fontSize: "18px", borderBottom: "none", border: "2px solid black" }}>
                                                                    <b> {totalValues.totalTotalAmount.toFixed(2)} </b>
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
                                                    documentTitle={"Daily Non Plucking Reconciliation Report" + ' - ' + selectedSearchValues.gardenName + ' - ' + selectedSearchValues.costCenterName + ' - ' + moment(selectedSearchValues.date.toString()).format().split('T')[0]}
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