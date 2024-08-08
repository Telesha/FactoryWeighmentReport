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
import LineWeightIcon from '@material-ui/icons/LineWeight';
import { x64 } from 'crypto-js';
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

const screenCode = 'PLUCKINGREPORT';

export default function PluckingReport(props) {
    const [title, setTitle] = useState("Plucking Report")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [gardens, setGardens] = useState([]);
    const [costCenters, setCostCenters] = useState();
    const [harvestingJobs, setHarvestingJobs] = useState([]);
    const [employeeCount, setEmployeeCount] = useState([]);
    const [sundry, setSundry] = useState();
    const [colName, setColName] = useState([]);
    const [empType, setEmpType] = useState([]);
    const [dailyAttendanceData, setDailyAttendanceData] = useState([]);
    const [dailyAttendanceDataList, setDailyAttendanceDataList] = useState({
        groupID: '0',
        gardenID: '0',
        costCenterID: '0',
        date: '0',
        factoryJobID: '0',
        taskID: '0',
        fieldID: '0',
        gangID: '0',
        employeeTypeID: '0'
    })

    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: "0",
        gardenName: "0",
        costCenterName: "0",
        date: "0",
        factoryJobName: "0",
        taskName: "0",
        fieldName: "0",
        gangName: "0"
    })

    const [totalValues, setTotalValues] = useState({
        totalQty: 0,
        totalGardenAllowance: 0,
        totlAllowance: 0
    });

    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const [summeryValues, setSummeryValues] = useState({
        full: 0,
        half: 0,
        allTotal: 0
    });
    const [empCount, setEmpCount] = useState({
        Weighment1Count: 0,
        Weighment2Count: 0,
        Weighment3Count: 0,
        WeighmentTotCount: 0
    });
    const componentRef = useRef();
    const navigate = useNavigate();
    const alert = useAlert();
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);
    const [date, setDate] = useState(new Date());
    const [fields, setFields] = useState([]);
    const [gangs, setGangs] = useState([]);
    const [data, setdata] = useState([]);
    const [subNames, setSubNames] = useState([]);
    const [summeryData, setSummeryData] = useState([]);
    const [csvData, setCsvData] = useState([]);
    const [csvHeaders, setCsvHeaders] = useState([]);

    //MultiSelect Duffa
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

    //MultiSelect Employee Type
    const [selectedOptions2, setSelectedOptions2] = useState([]);
    const getOptionLabel2 = option => `${option.label}`;
    const getOptionDisabled2 = option => option.value === "foo";
    const handleToggleOption2 = selectedOptions =>
        setSelectedOptions2(selectedOptions);
    const handleClearOptions2 = () => setSelectedOptions2([]);
    const handleSelectAll2 = isSelected => {
        if (isSelected) {
            setSelectedOptions2(empType);
        } else {
            handleClearOptions2();
        }
    };

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getEmployeeTypesForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID());
    }, [dailyAttendanceDataList.groupID]);

    useEffect(() => {
        setDailyAttendanceDataList((prevState) => ({
            ...prevState,
            costCenterID: "0"
        }));
    }, [dailyAttendanceDataList.groupID]);

    useEffect(() => {
        trackPromise(
            getCostCenterDetailsByGardenID()
        )
    }, [dailyAttendanceDataList.gardenID]);

    useEffect(() => {
        setdata([])
    }, [dailyAttendanceDataList.gardenID]);

    useEffect(() => {
        setdata([])
    }, [dailyAttendanceDataList.costCenterID]);

    useEffect(() => {
        setdata([])
    }, [dailyAttendanceDataList.empTypeID]);

    useEffect(() => {
        if (dailyAttendanceDataList.gardenID != "0") {
            trackPromise(
                GetFactoryJobs()
            )
        }
    }, [dailyAttendanceDataList.gardenID]);

    useEffect(() => {
        if (dailyAttendanceDataList.gardenID != "0" && dailyAttendanceDataList.costCenterID != 0) {
            trackPromise(
                getLabourTask()
            )
        }
    }, [dailyAttendanceDataList.gardenID, dailyAttendanceDataList.costCenterID]);

    useEffect(() => {
        if (dailyAttendanceDataList.costCenterID != "0") {
            trackPromise(
                GetFieldDetailsByDivisionID()
            )
        }
    }, [dailyAttendanceDataList.costCenterID]);

    useEffect(() => {
        if (dailyAttendanceDataList.costCenterID != 0) {
            getGangDetailsByDivisionID();
        }
    }, [dailyAttendanceDataList.costCenterID]);

    useEffect(() => {
        if (dailyAttendanceData.length != 0) {
            calculateTotalQty()
        }
    }, [dailyAttendanceData]);

    useEffect(() => {
        setdata([]);
    }, [dailyAttendanceDataList.taskID]);

    useEffect(() => {
        setdata([]);
    }, [dailyAttendanceDataList.factoryJobID]);

    useEffect(() => {
        setdata([]);
    }, [dailyAttendanceDataList.costCenterID]);

    useEffect(() => {
        setdata([]);
    }, [dailyAttendanceDataList.fieldID]);

    useEffect(() => {
        setdata([]);
    }, [selectedOptions1]);

    useEffect(() => {
        setdata([]);
    }, [selectedOptions2]);

    useEffect(() => {
        setDailyAttendanceData([]);
    }, [date]);

    const handleLimitChange = (event) => {
        setLimit(event.target.value);
    };
    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWPLUCKINGREPORT');

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

        setDailyAttendanceDataList({
            ...dailyAttendanceDataList,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            gardenID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(dailyAttendanceDataList.groupID);
        setGardens(response);
    };

    async function getCostCenterDetailsByGardenID() {
        var response = await services.getDivisionDetailsByEstateID(dailyAttendanceDataList.gardenID);
        const elementCount = response.reduce((count) => count + 1, 0);
        var generated = generateDropDownMenu(response)
        if (elementCount === 1) {
            setDailyAttendanceDataList((prevState) => ({
                ...prevState,
                costCenterID: generated[0].props.value,
            }));
        }
        setCostCenters(response);
    };

    async function GetFactoryJobs() {
        const result = await services.GetFactoryJobs(dailyAttendanceDataList.gardenID);
        setHarvestingJobs(result);
    }

    async function getLabourTask() {
        const result = await services.getLabourTask(dailyAttendanceDataList.gardenID, dailyAttendanceDataList.costCenterID);
        setSundry(result);
    }

    async function GetFieldDetailsByDivisionID() {
        var response = await services.GetFieldDetailsByDivisionID(dailyAttendanceDataList.costCenterID);
        setFields(response);
    };

    async function getGangDetailsByDivisionID() {
        var response = await services.getGangDetailsByDivisionID(dailyAttendanceDataList.costCenterID);
        const newOptionArray = [];
        for (var i = 0; i < response.length; i++) {
            newOptionArray.push({ label: response[i].gangName, value: response[i].gangID })
        }
        setGangs(newOptionArray);
    };

    async function getEmployeeTypesForDropdown() {
        const response = await services.getEmployeeTypesForDropdown();
        const newOptionArray = [];
        for (var i = 0; i < response.length; i++) {
            newOptionArray.push({ label: response[i].employeeTypeName, value: response[i].employeeTypeID })
        }
        setEmpType(newOptionArray);
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

    function checkUndifind(value) {
        if (value === undefined) {
            return 0;
        }
        else {
            return value;
        }
    }

    async function GetDetails() {

        let model = {
            legalEntityID: parseInt(dailyAttendanceDataList.groupID),
            gardenID: parseInt(dailyAttendanceDataList.gardenID),
            costCenterID: parseInt(dailyAttendanceDataList.costCenterID),
            gangID: selectedOptions1.map(x => x.value).join(','),
            employeeTypeID: selectedOptions2.map(x => x.value).join(','),
            date: moment(date.toString()).format().split('T')[0],
        }

        getSelectedDropdownValuesForReport(model);

        const response = await services.GetDetails(model);
        if (response.length > 0) {
            var copyOfResponse = _.cloneDeep(response)
            formatResult(copyOfResponse);
        }
        else {
            setdata([])
            alert.error("No records to display");
        }
    }

    function formatResult(data) {
        var result = [];
        var totalOfAllrecords = 0;
        var names = [];
        var csvHeaders = [
            { label: "Reg Number", value: "registrationNumber" },
            { label: "Employee Name", value: "firstName" },
            { label: "Employee Type", value: "employeeTypeName" },
            { label: "Duffa", value: "gangName" }
        ];
        data.forEach(x => {

            var sessionName = x.sessionName;
            if (result.length === 0) {
                result.push({
                    [sessionName + 'N']: checkUndifind(x.totalAmount),
                    [sessionName + 'F']: checkUndifind(x.totalAmount * x.rate),
                    employeeID: parseInt(x.employeeID),
                    registrationNumber: x.registrationNumber,
                    firstName: x.firstName,
                    total: checkUndifind(x.totalAmount),
                    configurationValue: x.configurationValue,
                    gangName: x.gangName,
                    employeeTypeName: x.employeeTypeName,
                    rate: x.rate,
                    totalRate: checkUndifind(x.totalAmount) * checkUndifind(x.rate)
                });
                names.push(x.sessionName);
                totalOfAllrecords = totalOfAllrecords + parseFloat(x.totalAmount);
            } else {
                totalOfAllrecords = totalOfAllrecords + parseFloat(x.totalAmount);
                var duplicate = result.find(y => parseInt(y.employeeID) == parseInt(x.employeeID));

                var duplicateName = names.find(y => y === x.sessionName);

                if (!duplicateName) {
                    names.push(x.sessionName);
                }

                if (duplicate) {
                    duplicate[sessionName + 'N'] = checkUndifind(duplicate[sessionName + 'N']) + checkUndifind(x.totalAmount);
                    duplicate[sessionName + 'F'] = (checkUndifind(duplicate[sessionName + 'F']) + (checkUndifind(x.totalAmount) * checkUndifind(x.rate)));
                    duplicate.registrationNumber = x.registrationNumber;
                    duplicate.firstName = x.firstName;
                    duplicate.configurationValue = x.configurationValue;
                    duplicate.gangName = x.gangName;
                    duplicate.rate = x.rate;
                    duplicate.employeeTypeName = x.employeeTypeName;
                    duplicate.total = checkUndifind(duplicate.total) + checkUndifind(x.totalAmount);
                    duplicate.totalRate = (checkUndifind(duplicate.total) * checkUndifind(x.rate));
                } else {
                    result.push({
                        [sessionName + 'N']: checkUndifind(x.totalAmount),
                        [sessionName + 'F']: checkUndifind(x.totalAmount * x.rate),
                        employeeID: parseInt(x.employeeID),
                        registrationNumber: x.registrationNumber,
                        firstName: x.firstName,
                        total: checkUndifind(x.totalAmount),
                        configurationValue: x.configurationValue,
                        gangName: x.gangName,
                        rate: x.rate,
                        employeeTypeName: x.employeeTypeName,
                        totalRate: checkUndifind(x.totalAmount) * checkUndifind(x.rate)
                    });
                }
            }
        });
        var newNames = [];
        names.forEach(x => {
            if (x == "Morning Cash" || x == "Off Day Cash 1") {
                newNames.push({ label: x, value: 1 });
            }
            else if (x == "Mid Day Session" || x == "Off Day Cash 2") {
                newNames.push({ label: x, value: 2 });
            }
            else if (x == "Evening Session" || x == "Off Day Cash 3") {
                newNames.push({ label: x, value: 3 });
            }

        })
        newNames.sort((a, b) => { return a.value - b.value; });
        var subNames = [];
        var subNamesCopy = [];
        for (let index = 0; index < newNames.length; index++) {
            subNames.push(newNames[index].label + 'N');
            subNames.push(newNames[index].label + 'F');
            if (newNames[index].label == "Morning Cash" || newNames[index].label == "Off Day Cash 1") {
                csvHeaders.push({ label: "W1-QTY", value: newNames[index].label + 'N' });
                csvHeaders.push({ label: "W1-Amount", value: newNames[index].label + 'F' });
            }
            else if (newNames[index].label == "Mid Day Session" || newNames[index].label == "Off Day Cash 2") {
                csvHeaders.push({ label: "W2-QTY", value: newNames[index].label + 'N' });
                csvHeaders.push({ label: "W2-Amount", value: newNames[index].label + 'F' });
            }
            else if (newNames[index].label == "Evening Session" || newNames[index].label == "Off Day Cash 3") {
                csvHeaders.push({ label: "W3-QTY", value: newNames[index].label + 'N' });
                csvHeaders.push({ label: "W3-Amount", value: newNames[index].label + 'F' });
            }

            subNamesCopy.push(newNames[index].label);
        }
        csvHeaders.push({ label: "Total Qty", value: "total" });
        csvHeaders.push({ label: "Total Rate", value: "totalRate" });


        var result2 = [];
        result.forEach(x => {
            subNames.forEach(y => {
                if (x[y]) {
                    var res = y.slice(-1);
                    if (res == 'N') {
                        result2.push({
                            property: y,
                            value: checkUndifind(x[y])
                        });
                    }
                }
            });
        });

        let Weighment1Count = 0;
        let Weighment2Count = 0;
        let Weighment3Count = 0;
        result2.forEach(x => {
            if (x.property == "Morning CashN" || x.property == "Off Day Cash 1N") {
                Weighment1Count++;
            }
            else if (x.property == "Mid Day SessionN" || x.property == "Off Day Cash 2N") {
                Weighment2Count++;
            }
            else if (x.property == "Evening SessionN" || x.property == "Off Day Cash 3N") {
                Weighment3Count++;
            }
        })
        setEmpCount({
            ...empCount,
            Weighment1Count: Weighment1Count,
            Weighment2Count: Weighment2Count,
            Weighment3Count: Weighment3Count,
            WeighmentTotCount: result2.length
        });
        const result3 = result2.reduce((obj, el) => {

            obj[el.property] = (obj[el.property] || 0) + el.value;

            return obj;
        }, {});
        const result4 = result.filter(x => x.total >= x.configurationValue);

        setSummeryValues({
            ...summeryValues,
            full: result4.length,
            half: result.length - result4.length,
            allTotal: totalOfAllrecords
        });
        setCsvHeaders(csvHeaders);
        setSubNames(subNames);
        setdata(result);
        setCsvData(result);
        setColName(subNamesCopy);

        var resultqqqq = Object.entries(result3);

        var temlArry = [];
        for (const key in resultqqqq) {
            temlArry.push({
                name: resultqqqq[key][0],
                value: resultqqqq[key][1]
            })
        }

        temlArry.forEach(x => {
            if (x == "Morning CashN" || x == "Off Day Cash 1N") {
                temlArry.push({ name: x, value: 1 });
            }
            else if (x == "Mid Day SessionN" || x == "Off Day Cash 2N") {
                temlArry.push({ name: x, value: 2 });
            }
            else if (x == "Evening SessionN" || x == "Off Day Cash 3N") {
                temlArry.push({ name: x, value: 3 });
            }

        })
        temlArry.sort((a, b) => { return a.name - b.name; });
        setSummeryData(temlArry);

    }

    function calculateTotalQty() {
        const totalQty = dailyAttendanceData.reduce((accumulator, current) => accumulator + current.quntity, 0);
        const totalAllowance = dailyAttendanceData.reduce((accumulator, current) => accumulator + current.allowance, 0);
        const totalGardenAllowance = dailyAttendanceData.reduce((accumulator, current) => accumulator + current.gardenAllowance, 0);
        setTotalValues({
            ...totalValues,
            totalQty: totalQty,
            totlAllowance: totalAllowance,
            totalGardenAllowance: totalGardenAllowance
        })
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

    function createFile() {
        var settings = {
            sheetName: 'Plucking Report',
            fileName: 'PluckingReport',
            writeOptions: {}
        }

        var copyOfCsv = _.cloneDeep(csvData)
        var newRow1 = {
            registrationNumber: "Group :" + groups[dailyAttendanceDataList.groupID],
            firstName: "Operation Entity : " + gardens[dailyAttendanceDataList.gardenID],
        }
        var newRow2 = {
            registrationNumber: "Collection Point :" + costCenters[dailyAttendanceDataList.costCenterID],
            firstName: "Date : " + moment(date.toString()).format().split('T')[0],
        }
        var newRow3 = {
            registrationNumber: "Generated date/time : " + new Date().toLocaleString(),
            firstName: "Generated user : " + tokenService.getUserNameFromToken(),
        }

        copyOfCsv.push({}, newRow1, newRow2, newRow3)
        let dataA = [
            {
                sheet: 'Plucking Report',
                columns: csvHeaders,
                content: copyOfCsv
            }
        ];
        xlsx(dataA, settings)
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
        setDailyAttendanceDataList({
            ...dailyAttendanceDataList,
            [e.target.name]: value
        });
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        let harvestingJobMasterID = searchForm.harvestingJobID
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: groups[searchForm.legalEntityID],
            gardenName: gardens[searchForm.gardenID],
            costCenterName: costCenters[searchForm.costCenterID],
            date: searchForm.date,
            factoryJobName: harvestingJobs[harvestingJobMasterID],
            taskName: sundry[searchForm.taskID],
            fieldName: selectedOptions2.map(x => x.label).join(','),
            gangName: selectedOptions1.map(x => x.label).join(',')
        })
    }

    return (
        <Page className={classes.root} title={title}>
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: dailyAttendanceDataList.groupID,
                        gardenID: dailyAttendanceDataList.gardenID,
                        costCenterID: dailyAttendanceDataList.costCenterID,
                        factoryJobID: dailyAttendanceDataList.factoryJobID,
                        taskID: dailyAttendanceDataList.taskID,
                        fieldID: dailyAttendanceDataList.fieldID,
                        sectionID: dailyAttendanceDataList.sectionID
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Legal Entity is required').min("1", 'Legal Entity is required'),
                            gardenID: Yup.number().required('Garden is required').min("1", 'Garden is required'),
                            costCenterID: Yup.number().required('Cost Center is required').min("1", 'Cost Center is required'),
                            //date: Yup.number().required('Date is required').min("1", 'Date is required'),
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
                                                        value={dailyAttendanceDataList.groupID}
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
                                                        value={dailyAttendanceDataList.gardenID}
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
                                                        value={dailyAttendanceDataList.costCenterID}
                                                        variant="outlined"
                                                        id="costCenterID"
                                                        size='small'

                                                    >
                                                        <MenuItem value="0">--Select Cost Center--</MenuItem>
                                                        {generateDropDownMenu(costCenters)}
                                                    </TextField>
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
                                                        placeholder="--Select Duffa--"
                                                        selectAllLabel="Select all"
                                                        onToggleOption={handleToggleOption1}
                                                        onClearOptions={handleClearOptions1}
                                                        onSelectAll={handleSelectAll1}
                                                    />
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="employeeTypeID">
                                                        Employee Type
                                                    </InputLabel>
                                                    <CustomMultiSelect
                                                        items={empType}
                                                        getOptionLabel={getOptionLabel2}
                                                        getOptionDisabled={getOptionDisabled2}
                                                        selectedValues={selectedOptions2}
                                                        placeholder="--Select Duffa--"
                                                        selectAllLabel="Select all"
                                                        onToggleOption={handleToggleOption2}
                                                        onClearOptions={handleClearOptions2}
                                                        onSelectAll={handleSelectAll2}
                                                    />
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="date">Date *</InputLabel>
                                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                        <KeyboardDatePicker
                                                            error={Boolean(touched.date && errors.date)}
                                                            fullWidth
                                                            helperText={touched.date && errors.date}
                                                            variant="inline"
                                                            format="dd/MM/yyyy"
                                                            margin="dense"
                                                            name='date'
                                                            id='date'
                                                            size='small'
                                                            value={date}
                                                            disableFuture={true}
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
                                                {/* {dailyAttendanceData.length > 0 ? (
                                                    <Chip
                                                        icon={<LineWeightIcon />}
                                                        label={"Total Employee Count: " + employeeCount}
                                                        color="secondary"
                                                        variant="outlined"
                                                    />
                                                ) : null} */}
                                                <br>
                                                </br>
                                                {data.length != 0 ?
                                                    <Card>
                                                        <TableContainer component={Paper}>
                                                            <div className="row alternative_cls bg-light  ">

                                                                <Table aria-label="simple table">
                                                                    <TableHead>
                                                                        <TableRow>
                                                                            <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                                                Reg No
                                                                            </TableCell>
                                                                            <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                                                Employee Name
                                                                            </TableCell>
                                                                            <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                                                Employee Type
                                                                            </TableCell>
                                                                            <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                                                Duffa
                                                                            </TableCell>
                                                                            {colName.map((item) => {
                                                                                if (item == "Morning Cash" || item == "Off Day Cash 1") {
                                                                                    return (
                                                                                        <>
                                                                                            <TableCell style={{ fontWeight: "bold", border: "1px solid black" }} align='center'>
                                                                                                {"W1-QTY"}
                                                                                            </TableCell>
                                                                                            <TableCell style={{ fontWeight: "bold", border: "1px solid black" }} align='center'>
                                                                                                {"W1-Amount"}
                                                                                            </TableCell>
                                                                                        </>
                                                                                    );
                                                                                } else if (item == "Mid Day Session" || item == "Off Day Cash 2") {
                                                                                    return (
                                                                                        <>
                                                                                            <TableCell style={{ fontWeight: "bold", border: "1px solid black" }} align='center'>
                                                                                                {"W2-QTY"}
                                                                                            </TableCell>
                                                                                            <TableCell style={{ fontWeight: "bold", border: "1px solid black" }} align='center'>
                                                                                                {"W2-Amount"}
                                                                                            </TableCell>
                                                                                        </>
                                                                                    );
                                                                                }
                                                                                else if (item == "Evening Session" || item == "Off Day Cash 3") {
                                                                                    return (
                                                                                        <>
                                                                                            <TableCell style={{ fontWeight: "bold", border: "1px solid black" }} align='center'>
                                                                                                {"W3-QTY"}
                                                                                            </TableCell>
                                                                                            <TableCell style={{ fontWeight: "bold", border: "1px solid black" }} align='center'>
                                                                                                {"W3-Amount"}
                                                                                            </TableCell>
                                                                                        </>
                                                                                    );
                                                                                }
                                                                            })}
                                                                            <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                                                Total QTY
                                                                            </TableCell>
                                                                            <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                                                Total Amount
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    </TableHead>
                                                                    <TableBody>
                                                                        {data.map((row) => (
                                                                            <TableRow key={row.registrationNumber}>
                                                                                <TableCell component="th" align="left" style={{ border: "1px solid black" }} >
                                                                                    {row.registrationNumber}
                                                                                </TableCell>
                                                                                <TableCell align="left" style={{ border: "1px solid black" }}>
                                                                                    {row.firstName}
                                                                                </TableCell>
                                                                                <TableCell align="left" style={{ border: "1px solid black" }}>
                                                                                    {row.employeeTypeName}
                                                                                </TableCell>
                                                                                <TableCell align="left" style={{ border: "1px solid black" }}>
                                                                                    {row.gangName}
                                                                                </TableCell>
                                                                                {subNames.map((column) => {
                                                                                    const value = row[column];
                                                                                    var res = column.slice(-1);
                                                                                    if (res == 'N') {
                                                                                        return (
                                                                                            <>
                                                                                                <TableCell style={{ border: "1px solid black" }} align='right'>{value == undefined ? '-' : parseFloat(value).toFixed(2)}</TableCell>
                                                                                                <TableCell style={{ border: "1px solid black" }} align='right'>{value == undefined ? '-' : parseFloat(value * row.rate).toFixed(2)}</TableCell>
                                                                                            </>
                                                                                        );
                                                                                    }

                                                                                })}
                                                                                <TableCell style={{ border: "1px solid black" }} align="right">
                                                                                    {parseFloat(row.total).toFixed(2)}
                                                                                </TableCell>
                                                                                <TableCell align="right" style={{ border: "1px solid black" }}>
                                                                                    {parseFloat(row.total * row.rate).toFixed(2)}
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                    </TableBody>
                                                                </Table>
                                                            </div>
                                                        </TableContainer>
                                                    </Card>
                                                    : null}
                                            </Box>
                                        </CardContent>
                                        {data.length > 0 ?
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                {/* <input
                                                    type="button"
                                                    className="btn btn-primary pull-right ml-2"
                                                    value="Excel"
                                                    onClick={createFile}
                                                /> */}
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
                                                {/* <ReactToPrint
                                                    documentTitle={"Daily Plucking Details Report"}
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
                                                /> */}
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