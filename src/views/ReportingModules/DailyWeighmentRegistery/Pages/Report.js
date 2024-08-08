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

const screenCode = 'DAILYWEIGHMENTREGISTERY';

export default function DailyWeighmentRegistery(props) {

    const [selectedOptions, setSelectedOptions] = useState([]);
    const [selectedOptions1, setSelectedOptions1] = useState([]);
    const [selectedOptions2, setSelectedOptions2] = useState([]);
    const [selectedOptions3, setSelectedOptions3] = useState([]);

    const [selectedOptions4, setSelectedOptions4] = useState([]);
    const getOptionLabel4 = option => `${option.label}`;
    const getOptionDisabled4 = option => option.value === "foo";
    const handleToggleOption4 = selectedOptions =>
        setSelectedOptions4(selectedOptions);
    const handleClearOptions4 = () => setSelectedOptions4([]);
    const handleSelectAll4 = isSelected => {
        if (isSelected) {
            setSelectedOptions4(harvestingJobs);
        } else {
            handleClearOptions4();
        }
    };
    const [title, setTitle] = useState("Daily Weighment Register")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [gardens, setGardens] = useState([]);
    const [costCenters, setCostCenters] = useState([]);
    const [PayPoints, setPayPoints] = useState();
    const [harvestingJobs, setHarvestingJobs] = useState([]);
    const [sundry, setSundry] = useState();
    const [colName, setColName] = useState([]);
    const [dailyAttendanceData, setDailyAttendanceData] = useState([]);
    const [dailyAttendanceDataList, setDailyAttendanceDataList] = useState({
        groupID: '0',
        gardenID: '0',
        costCenterID: '0',
        payPointID: '0',
        date: '0',
        factoryJobID: '0',
        taskID: '0',
        fieldID: '0',
        gangID: '0',
        empTypeID: '0'
    })

    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: "",
        gardenName: "",
        costCenterName: "",
        payPointName: "",
        date: "",
        factoryJobName: "",
        empTypeName: "",
        fieldName: "",
        gangName: "",
        operatorName: ""
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
        allTotal: 0,
        allAmountTotal: 0
    });
    const [empCount, setEmpCount] = useState({
        Weighment1Count: 0,
        Weighment2Count: 0,
        Weighment3Count: 0,
        Weighment4Count: 0,
        WeighmentTotCount: 0
    });
    const componentRef = useRef();
    const navigate = useNavigate();
    const alert = useAlert();
    const [date, setDate] = useState(new Date());
    const [fields, setFields] = useState([]);
    const [gangs, setGangs] = useState([]);
    const [empType, setEmpType] = useState([]);
    const [operator, setOperator] = useState([]);
    const [data, setdata] = useState([]);
    const [subNames, setSubNames] = useState([]);
    const [summeryData, setSummeryData] = useState([]);
    const [csvData, setCsvData] = useState([]);
    const [csvHeaders, setCsvHeaders] = useState([]);
    const [initialState,setInitialState] = useState(false);

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission(), GetAllEmployeeSubCategoryMapping());
    }, []);

    useEffect(()=>{
        if(!initialState){
            trackPromise(getPermission());
        }
    },[])

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID(), GetDivisionDetailsByGroupID());
    }, [dailyAttendanceDataList.groupID]);

    useEffect(() => {
        setDailyAttendanceDataList((prevState) => ({
            ...prevState,
            costCenterID: "0"
        }));
    }, [dailyAttendanceDataList.groupID]);

    useEffect(() => {
        trackPromise(
            GetOperatorListByDateAndGardenIDForLabourChecklistReport(),
            GetFactoryJobs()
        )
    }, [dailyAttendanceDataList.gardenID, date]);

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
                GetFactoryJobs(),
                getCostCenterDetailsByGardenID()
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
    }, [dailyAttendanceDataList.gangID]);

    useEffect(()=>{
        if(initialState){
            setDailyAttendanceDataList((prevState)=>({
                ...prevState,
                gardenID: 0,
                costCenterID: 0,
                payPointID:0
            }));
        }
    },[dailyAttendanceDataList.groupID,initialState]);

    useEffect(() => {
        if (initialState) {
            setDailyAttendanceDataList((prevState) => ({
                ...prevState,
                costCenterID: 0
            }));
        }
    }, [dailyAttendanceDataList.gardenID, initialState]);

    useEffect(() => {
        setdata([]);
    }, [date]);

    useEffect(() => {
        setdata([]);
    }, [selectedOptions]);

    useEffect(() => {
        setdata([]);
    }, [selectedOptions1]);

    useEffect(() => {
        setdata([]);
    }, [selectedOptions2]);

    useEffect(() => {
        setdata([]);
    }, [selectedOptions3]);



    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWDAILYWEIGHMENTREGISTERY');

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
        setInitialState(true);
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
        setCostCenters(response);
    };

    async function GetDivisionDetailsByGroupID() {
        var response = await services.GetDivisionDetailsByGroupID(dailyAttendanceDataList.groupID);
        const elementCount = response.reduce((count) => count + 1, 0);
        var generated = generateDropDownMenu(response)
        if (elementCount === 1) {
            setDailyAttendanceDataList((prevState) => ({
                ...prevState,
                payPointID: generated[0].props.value,
            }));
        }
        setPayPoints(response);
    };

    async function GetFactoryJobs() {
        const response = await services.GetFactoryJobs(date);
        const newOptionArray = [];
        for (var i = 0; i < response.length; i++) {
            newOptionArray.push({ label: response[i].jobName, value: response[i].harvestingJobMasterID })
        }
        setHarvestingJobs(newOptionArray);
    }

    async function getLabourTask() {
        const result = await services.getLabourTask(dailyAttendanceDataList.gardenID, dailyAttendanceDataList.costCenterID);
        setSundry(result);
    }

    async function GetFieldDetailsByDivisionID() {
        var response = await services.GetFieldDetailsByDivisionID(dailyAttendanceDataList.costCenterID);
        var newOptionArray = [];
        for (var i = 0; i < response.length; i++) {
            newOptionArray.push({ label: response[i].fieldName, value: response[i].fieldID })
        }
        setFields(newOptionArray);
    };

    async function getGangDetailsByDivisionID() {
        var response = await services.getGangDetailsByDivisionID(dailyAttendanceDataList.costCenterID);
        var newOptionArray = [];
        for (var i = 0; i < response.length; i++) {
            newOptionArray.push({ label: response[i].gangName, value: response[i].gangID })
        }
        setGangs(newOptionArray);
    };

    async function GetAllEmployeeSubCategoryMapping() {
        const result = await services.GetAllEmployeeSubCategoryMapping();
        setEmpType(result);
    }

    async function GetOperatorListByDateAndGardenIDForLabourChecklistReport() {
        const result = await services.GetOperatorListByDateAndGardenIDForLabourChecklistReport(dailyAttendanceDataList.gardenID, moment(date.toString()).format().split('T')[0]);
        var newOptionArray = [];
        for (var i = 0; i < result.length; i++) {
            newOptionArray.push({ label: result[i].operatorName, value: result[i].operatorID })
        }
        setOperator(newOptionArray);
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
            payPointID: parseInt(dailyAttendanceDataList.payPointID),
            fieldID: selectedOptions2.map(x => x.value).join(','),
            gangID: selectedOptions1.map(x => x.value).join(','),
            empTypeID: parseInt(dailyAttendanceDataList.empTypeID),
            userID: selectedOptions3.map(x => x.value).join(','),
            taskID: selectedOptions4.map(x => x.value).join(','),
            date: moment(date.toString()).format().split('T')[0],
        }

        getSelectedDropdownValuesForReport();
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
        var totalOfRaterecords = 0;
        var names = [];
        var csvHeaders = [
            { label: "Employee Sub Category", value: "employeeSubCategoryName" },
            { label: "Reg.No", value: "registrationNumber" },
            { label: "Employee Name", value: "firstName" }
        ];
        data.forEach(x => {

            var sessionName = x.sessionName;
            if (result.length === 0) {
                result.push({
                    [sessionName + 'N']: checkUndifind(x.totalAmount),
                    [sessionName + 'C']: x.sessionCode,
                    [sessionName + 'F']: x.fieldName,
                    employeeID: parseInt(x.employeeID),
                    registrationNumber: x.registrationNumber,
                    firstName: x.firstName,
                    total: checkUndifind(x.totalAmount),
                    totalRate: Math.round(checkUndifind(x.totalAmount) * checkUndifind(x.rate)),
                    configurationValue: x.configurationValue,
                    employeeTypeName: x.employeeTypeName,
                    employeeSubCategoryName: x.employeeSubCategoryName,
                    divisionName: x.divisionName.trim(),
                    gangName: x.gangName
                });
                names.push({ sessionName: x.sessionName, sessionCode: x.sessionCode });
                totalOfAllrecords = totalOfAllrecords + parseFloat(x.totalAmount);
            } else {
                totalOfAllrecords = totalOfAllrecords + parseFloat(x.totalAmount);
                var duplicate = result.find(y => parseInt(y.employeeID) == parseInt(x.employeeID));

                var duplicateName = names.find(y => y.sessionName === x.sessionName);

                if (!duplicateName) {
                    names.push({ sessionName: x.sessionName, sessionCode: x.sessionCode });
                }

                if (duplicate) {
                    duplicate[sessionName + 'N'] = checkUndifind(duplicate[sessionName + 'N']) + checkUndifind(x.totalAmount);
                    duplicate[sessionName + 'C'] = x.sessionCode;
                    duplicate[sessionName + 'F'] = x.fieldName;
                    duplicate.employeeID = x.employeeID;
                    duplicate.registrationNumber = x.registrationNumber;
                    duplicate.firstName = x.firstName;
                    duplicate.configurationValue = x.configurationValue;
                    duplicate.gangName = x.gangName;
                    duplicate.employeeTypeName = x.employeeTypeName;
                    duplicate.employeeSubCategoryName = x.employeeSubCategoryName;
                    duplicate.divisionName = x.divisionName.trim();
                    duplicate.total = checkUndifind(duplicate.total) + checkUndifind(x.totalAmount);
                    duplicate.totalRate = Math.round(checkUndifind(duplicate.total) * checkUndifind(x.rate));
                } else {
                    result.push({
                        [sessionName + 'N']: checkUndifind(x.totalAmount),
                        [sessionName + 'C']: x.sessionCode,
                        [sessionName + 'F']: x.fieldName,
                        employeeID: parseInt(x.employeeID),
                        registrationNumber: x.registrationNumber,
                        firstName: x.firstName,
                        total: checkUndifind(x.totalAmount),
                        totalRate: Math.round(checkUndifind(x.totalAmount) * checkUndifind(x.rate)),
                        configurationValue: x.configurationValue,
                        employeeTypeName: x.employeeTypeName,
                        employeeSubCategoryName: x.employeeSubCategoryName,
                        divisionName: x.divisionName.trim(),
                        gangName: x.gangName
                    });
                }
            }
        });
        var newNames = [];
        for (let index = 1; index < 5; index++) {
            const found = names.find(x => parseInt(x.sessionCode) == parseInt(index))
            newNames.push({
                labelOne: found == undefined ? "Not Found Session" : found.sessionName,
                labelTwo: found == undefined ? "0" + index : found.sessionCode,
                value: index
            });
        }

        newNames.sort((a, b) => { return a.value - b.value; });
        var subNames = [];
        var subNamesCopy = [];
        for (let index = 0; index < newNames.length; index++) {
            subNames.push(newNames[index].labelOne + 'F');
            subNames.push(newNames[index].labelOne + 'C');
            subNames.push(newNames[index].labelOne + 'N');
            if (newNames[index].labelTwo == "01") {
                csvHeaders.push({ label: "W 1" + ' - Section', value: newNames[index].labelOne + 'F' });
                csvHeaders.push({ label: "W 1" + ' - Kg', value: newNames[index].labelOne + 'N' });
            }
            else if (newNames[index].labelTwo == "02") {
                csvHeaders.push({ label: "W 2" + ' - Section', value: newNames[index].labelOne + 'F' });
                csvHeaders.push({ label: "W 2" + ' - Kg', value: newNames[index].labelOne + 'N' });
            }
            else if (newNames[index].labelTwo == "03") {
                csvHeaders.push({ label: "W 3" + ' - Section', value: newNames[index].labelOne + 'F' });
                csvHeaders.push({ label: "W 3" + ' - Kg', value: newNames[index].labelOne + 'N' });
            }
            else if (newNames[index].labelTwo == "04") {
                csvHeaders.push({ label: "W 4" + ' - Section', value: newNames[index].labelOne + 'F' });
                csvHeaders.push({ label: "W 4" + ' - Kg', value: newNames[index].labelOne + 'N' });
            }
            subNamesCopy.push(newNames[index].labelTwo);
        }
        csvHeaders.push({ label: "Total Qty", value: "total" });
        var result2 = [];
        result.forEach(x => {
            subNames.forEach(y => {
                if (x[y]) {
                    var res = y.slice(-1);
                    var str = y.slice(0, -1);
                    if (res == 'N') {
                        result2.push({
                            property: y,
                            propertyOne: x[str + 'C'],
                            propertyTwo: str,
                            value: checkUndifind(x[y])
                        });
                    }
                }
            });
        });

        let Weighment1Count = 0;
        let Weighment2Count = 0;
        let Weighment3Count = 0;
        let Weighment4Count = 0;

        result2.forEach(x => {
            if (x.propertyOne == "01") {
                Weighment1Count++;
            }
            else if (x.propertyOne == "02") {
                Weighment2Count++;
            }
            else if (x.propertyOne == "03") {
                Weighment3Count++;
            }
            else if (x.propertyOne == "04") {
                Weighment4Count++;
            }
        })
        setEmpCount({
            ...empCount,
            Weighment1Count: Weighment1Count,
            Weighment2Count: Weighment2Count,
            Weighment3Count: Weighment3Count,
            Weighment4Count: Weighment4Count,
            WeighmentTotCount: result2.length
        });
        const result4 = result.filter(x => x.total >= x.configurationValue);
        const totalRate = result.reduce((accumulator, current) => accumulator + current.totalRate, 0);
        setSummeryValues({
            ...summeryValues,
            full: result4.length,
            half: result.length - result4.length,
            allTotal: totalOfAllrecords,
            allAmountTotal: totalRate
        });
        setCsvHeaders(csvHeaders);
        setSubNames(subNames);
        const groupedData = Object.values(groupBy(result, 'employeeSubCategoryName')).flatMap(group => {
            return Object.values(groupBy(group, 'divisionName')).map(subGroup => ({
                employeeSubCategoryName: subGroup[0].employeeSubCategoryName,
                divisionName: subGroup[0].divisionName,
                details: subGroup
            }));
        });
        setdata(groupedData);
        setCsvData(result);
        setColName(subNamesCopy);
        result2.forEach(x => {
            if (x.propertyOne == "01") {
                x.order = 1;
            }
            else if (x.propertyOne == "02") {
                x.order = 2;
            }
            else if (x.propertyOne == "03") {
                x.order = 3;
            }
            else if (x.propertyOne == "04") {
                x.order = 4;
            }
        })
        result2.sort((a, b) => { return a.propertyOne - b.propertyOne; });
        let finalResult = [];
        result2.forEach(x => {
            var sessionName = x.property;
            var duplicate = finalResult.find(y => parseInt(y.order) == parseInt(x.order));
            if (duplicate) {
                duplicate[sessionName] = duplicate[sessionName] == undefined ? 0 + checkUndifind(x.value) : duplicate[sessionName] + checkUndifind(x.value);
                duplicate.value = duplicate.value == undefined ? 0 + checkUndifind(x.value) : duplicate.value + checkUndifind(x.value);
                duplicate.name = sessionName;
                duplicate.prop = x.propertyOne;
                duplicate.order = parseInt(x.order);
            } else {
                finalResult.push({
                    [sessionName]: checkUndifind(x.value),
                    value: checkUndifind(x.value),
                    name: sessionName,
                    prop: x.propertyOne,
                    order: parseInt(x.order),
                });
            }
        })
        let result3 = [];
        for (let index = 1; index < 5; index++) {
            const found = finalResult.find(x => parseInt(x.order) == parseInt(index))
            if (found != undefined) {
                result3.push({
                    [found.name]: found.value,
                    name: found.name,
                    order: index,
                    prop: "0" + index,
                    value: found.value
                });
            }
            else {
                result3.push({
                    ["Not Found SessionN"]: 0,
                    name: "Not Found SessionN",
                    order: index,
                    prop: "0" + index,
                    value: 0
                });
            }
        }
        setSummeryData(result3);
    }

    function groupBy(arr, key) {
        return arr.reduce((acc, obj) => {
            const prop = obj[key];
            acc[prop] = acc[prop] || [];
            acc[prop].push(obj);
            return acc;
        }, {});
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
            sheetName: 'DailyWeighmentRegister',
            fileName: 'DailyWeighmentRegister ' + moment(new Date().toString()).format().split('T')[0],
            writeOptions: {}
        }

        var copyOfCsv = _.cloneDeep(csvData)
        var newRow1 = {
            employeeSubCategoryName: "Business Division : " + groups[dailyAttendanceDataList.groupID],
            registrationNumber: "Location : " + gardens[dailyAttendanceDataList.gardenID],
            firstName: costCenters[dailyAttendanceDataList.costCenterID] == undefined ? "All Pay Point" : "Pay Point : " + costCenters[dailyAttendanceDataList.costCenterID],
        }
        var newRow2 = {
            employeeSubCategoryName: selectedSearchValues.empTypeName == "" ? "Employee Sub Category : " + "All Employee Sub Category " : "Employee Sub Category : " + selectedSearchValues.empTypeName,
            registrationNumber: "Date : " + moment(date.toString()).format().split('T')[0],
        }
        var newRow3 = {
            employeeSubCategoryName: "Generated date/time : " + new Date().toLocaleString(),
            registrationNumber: "Generated user : " + tokenService.getUserNameFromToken(),
        }

        var newRow5 = {
            employeeSubCategoryName: "Total",
            total: summeryValues.allTotal,
            totalRate: summeryValues.allAmountTotal
        }
        summeryData.forEach(x => {
            if (x.prop == "01") {
                newRow5[x.name] = (x.value);
            }
            else if (x.prop == "02") {
                newRow5[x.name] = (x.value);
            }
            else if (x.prop == "03") {
                newRow5[x.name] = (x.value);
            }
            else if (x.prop == "04") {
                newRow5[x.name] = (x.value);
            }
        })
        copyOfCsv.push(newRow5, {}, newRow1, newRow2, newRow3)
        let dataA = [
            {
                sheet: 'Daily Weighment Registery',
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

    function getSelectedDropdownValuesForReport() {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: groups[dailyAttendanceDataList.groupID],
            gardenName: gardens[dailyAttendanceDataList.gardenID],
            costCenterName: costCenters[dailyAttendanceDataList.costCenterID],
            payPointName: PayPoints[dailyAttendanceDataList.payPointID],
            fieldName: selectedOptions2.map(x => x.label).join(', '),
            date: moment(date.toString()).format().split('T')[0],
            empTypeName:empType[dailyAttendanceDataList.empTypeID],
            gangName: selectedOptions1.map(x => x.label).join(', '),
            operatorName: selectedOptions3.map(x => x.label).join(', '),
            taskName: selectedOptions4.map(x => x.label).join(', ')
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
                        payPointID: dailyAttendanceDataList.payPointID,
                        factoryJobID: dailyAttendanceDataList.factoryJobID,
                        taskID: dailyAttendanceDataList.taskID,
                        fieldID: dailyAttendanceDataList.fieldID,
                        sectionID: dailyAttendanceDataList.sectionID,
                        empTypeID : dailyAttendanceDataList.empTypeID
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
                                                        value={dailyAttendanceDataList.groupID}
                                                        variant="outlined"
                                                        id="groupID"
                                                        size='small'

                                                    >
                                                        <MenuItem value="0">--All Business Divisions--</MenuItem>
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
                                                        value={dailyAttendanceDataList.gardenID}
                                                        variant="outlined"
                                                        id="gardenID"
                                                        size='small'

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
                                                        value={dailyAttendanceDataList.costCenterID}
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
                                                        value={dailyAttendanceDataList.payPointID}
                                                        variant="outlined"
                                                        id="payPointID"
                                                        size='small'

                                                    >
                                                        <MenuItem value="0">--All Pay Points--</MenuItem>
                                                        {generateDropDownMenu(PayPoints)}
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
                                                        value={dailyAttendanceDataList.empTypeID}
                                                        variant="outlined"
                                                        id="empTypeID"
                                                        size='small'
                                                    >
                                                        <MenuItem value="0">--All Employee Categories--</MenuItem>
                                                        {generateDropDownMenu(empType)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="factoryJobID">
                                                        Harvesting Job
                                                    </InputLabel>
                                                    <CustomMultiSelect
                                                        items={harvestingJobs}
                                                        getOptionLabel={getOptionLabel4}
                                                        getOptionDisabled={getOptionDisabled4}
                                                        selectedValues={selectedOptions4}
                                                        placeholder="Harvesting Job"
                                                        selectAllLabel="Select all"
                                                        onToggleOption={handleToggleOption4}
                                                        onClearOptions={handleClearOptions4}
                                                        onSelectAll={handleSelectAll4}
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
                                                            format="yyyy-MM-dd"
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
                                                {data.length != 0 ?
                                                    <Card>
                                                        <TableContainer component={Paper}>
                                                            <div className="row alternative_cls bg-light  ">
                                                                <CardContent>
                                                                    <Grid container md={8} spacing={2} style={{ justifyContent: 'start' }}>
                                                                        <Grid item md={2} xs={8} style={{ borderBottom: '1px solid black', borderTop: '1px solid black' }}>
                                                                        </Grid>
                                                                        <Grid item md={2} xs={8} style={{ textAlign: 'right', borderBottom: '1px solid black', borderTop: '1px solid black', marginLeft: '-1px' }}>
                                                                            <InputLabel style={{ color: "black" }}><b>Kg</b></InputLabel>
                                                                        </Grid>
                                                                        <Grid item md={2} xs={8} style={{ textAlign: 'right', borderBottom: '1px solid black', borderTop: '1px solid black', marginLeft: '-1px' }}>
                                                                            <InputLabel style={{ color: "black" }}><b>Emp Count</b></InputLabel>
                                                                        </Grid>
                                                                        <Grid item md={2} xs={8} style={{ textAlign: 'right', borderBottom: '1px solid black', borderTop: '1px solid black', marginLeft: '-1px' }}>
                                                                            <InputLabel style={{ color: "black" }}><b>Avg</b></InputLabel>
                                                                        </Grid>
                                                                    </Grid>
                                                                    {summeryData.map((item) => {
                                                                        if (item.prop == "01") {
                                                                            return (
                                                                                <Grid container md={8} spacing={2} style={{ justifyContent: 'start', marginTop: '7px' }}>
                                                                                    <Grid item md={2} xs={8} style={{ borderBottom: "1px dashed black" }}>
                                                                                        <InputLabel style={{ color: "black" }} ><b>Weighment 1</b></InputLabel>
                                                                                    </Grid>
                                                                                    <Grid item md={2} xs={8} style={{ textAlign: 'right', borderBottom: "1px dashed black", marginLeft: '-1px' }}>
                                                                                        <InputLabel style={{ color: "black", fontWeight: "bold" }} >{item.value == 0 ? "-" : parseFloat(item.value).toFixed(2)} </InputLabel>
                                                                                    </Grid>
                                                                                    <Grid item md={2} xs={8} style={{ textAlign: 'right', borderBottom: "1px dashed black", marginLeft: '-1px' }}>
                                                                                        <InputLabel style={{ color: "black", fontWeight: "bold" }} >{item.value == 0 ? "-" : parseInt(empCount.Weighment1Count)} </InputLabel>
                                                                                    </Grid>
                                                                                    <Grid item md={2} xs={8} style={{ textAlign: 'right', borderBottom: "1px dashed black", marginLeft: '-1px' }}>
                                                                                        <InputLabel style={{ color: "black", fontWeight: "bold" }} >{item.value == 0 ? "-" : parseFloat((item.value) / empCount.Weighment1Count).toFixed(2)} </InputLabel>
                                                                                    </Grid>
                                                                                </Grid>
                                                                            )
                                                                        }
                                                                        else if (item.prop == "02") {
                                                                            return (
                                                                                <Grid container md={8} spacing={2} style={{ justifyContent: 'start', marginTop: '7px' }}>
                                                                                    <Grid item md={2} xs={8} style={{ borderBottom: "1px dashed black" }}>
                                                                                        <InputLabel style={{ color: "black" }}><b>Weighment 2</b></InputLabel>
                                                                                    </Grid>
                                                                                    <Grid item md={2} xs={8} style={{ textAlign: 'right', borderBottom: "1px dashed black", marginLeft: '-1px' }}>
                                                                                        <InputLabel style={{ color: "black", fontWeight: "bold" }}>{item.value == 0 ? "-" : parseFloat(item.value).toFixed(2)} </InputLabel>
                                                                                    </Grid>
                                                                                    <Grid item md={2} xs={8} style={{ textAlign: 'right', borderBottom: "1px dashed black", marginLeft: '-1px' }}>
                                                                                        <InputLabel style={{ color: "black", fontWeight: "bold" }} >{item.value == 0 ? "-" : parseInt(empCount.Weighment2Count)} </InputLabel>
                                                                                    </Grid>
                                                                                    <Grid item md={2} xs={8} style={{ textAlign: 'right', borderBottom: "1px dashed black", marginLeft: '-1px' }}>
                                                                                        <InputLabel style={{ color: "black", fontWeight: "bold" }} >{item.value == 0 ? "-" : parseFloat((item.value) / empCount.Weighment2Count).toFixed(2)} </InputLabel>
                                                                                    </Grid>
                                                                                </Grid>
                                                                            )
                                                                        }
                                                                        else if (item.prop == "03") {
                                                                            return (
                                                                                <Grid container md={8} spacing={2} style={{ justifyContent: 'start', marginTop: '7px' }}>
                                                                                    <Grid item md={2} xs={8} style={{ borderBottom: "1px dashed black" }}>
                                                                                        <InputLabel style={{ color: "black" }}><b>Weighment 3</b></InputLabel>
                                                                                    </Grid>
                                                                                    <Grid item md={2} xs={8} style={{ textAlign: 'right', borderBottom: "1px dashed black", marginLeft: '-1px' }}>
                                                                                        <InputLabel style={{ color: "black", fontWeight: "bold" }}>{item.value == 0 ? "-" : parseFloat(item.value).toFixed(2)} </InputLabel>
                                                                                    </Grid>
                                                                                    <Grid item md={2} xs={8} style={{ textAlign: 'right', borderBottom: "1px dashed black", marginLeft: '-1px' }}>
                                                                                        <InputLabel style={{ color: "black", fontWeight: "bold" }} >{item.value == 0 ? "-" : parseInt(empCount.Weighment3Count)} </InputLabel>
                                                                                    </Grid>
                                                                                    <Grid item md={2} xs={8} style={{ textAlign: 'right', borderBottom: "1px dashed black", marginLeft: '-1px' }}>
                                                                                        <InputLabel style={{ color: "black", fontWeight: "bold" }} >{item.value == 0 ? "-" : parseFloat((item.value) / empCount.Weighment3Count).toFixed(2)} </InputLabel>
                                                                                    </Grid>
                                                                                </Grid>
                                                                            )
                                                                        }
                                                                        else if (item.prop == "04") {
                                                                            return (
                                                                                <Grid container md={8} spacing={2} style={{ justifyContent: 'start', marginTop: '7px' }}>
                                                                                    <Grid item md={2} xs={8} style={{ borderBottom: "1px dashed black" }}>
                                                                                        <InputLabel style={{ color: "black" }}><b>Weighment 4</b></InputLabel>
                                                                                    </Grid>
                                                                                    <Grid item md={2} xs={8} style={{ textAlign: 'right', borderBottom: "1px dashed black", marginLeft: '-1px' }}>
                                                                                        <InputLabel style={{ color: "black", fontWeight: "bold" }}>{item.value == 0 ? "-" : parseFloat(item.value).toFixed(2)} </InputLabel>
                                                                                    </Grid>
                                                                                    <Grid item md={2} xs={8} style={{ textAlign: 'right', borderBottom: "1px dashed black", marginLeft: '-1px' }}>
                                                                                        <InputLabel style={{ color: "black", fontWeight: "bold" }} >{item.value == 0 ? "-" : parseInt(empCount.Weighment4Count)} </InputLabel>
                                                                                    </Grid>
                                                                                    <Grid item md={2} xs={8} style={{ textAlign: 'right', borderBottom: "1px dashed black", marginLeft: '-1px' }}>
                                                                                        <InputLabel style={{ color: "black", fontWeight: "bold" }} >{item.value == 0 ? "-" : parseFloat((item.value) / empCount.Weighment4Count).toFixed(2)} </InputLabel>
                                                                                    </Grid>
                                                                                </Grid>
                                                                            )
                                                                        }
                                                                    })}
                                                                    <Grid container md={8} spacing={2} style={{ justifyContent: 'start', marginTop: '7px' }}>
                                                                        <Grid item md={2} xs={8} style={{ borderBottom: "1px solid black", borderTop: '1px solid black' }}>
                                                                            <InputLabel style={{ color: "black" }}><b>Total</b></InputLabel>
                                                                        </Grid>
                                                                        <Grid item md={2} xs={8} style={{ textAlign: 'right', borderBottom: "1px solid black", marginLeft: '-1px', borderTop: '1px solid black' }}>
                                                                            <InputLabel style={{ color: "black", fontWeight: "bold" }} >{parseFloat(summeryValues.allTotal).toFixed(2)} </InputLabel>
                                                                        </Grid>
                                                                        <Grid item md={2} xs={8} style={{ textAlign: 'right', borderBottom: "1px solid black", marginLeft: '-1px', borderTop: '1px solid black' }}>
                                                                            <InputLabel style={{ color: "black", fontWeight: "bold" }} >{parseInt(csvData.length)} </InputLabel>
                                                                        </Grid>
                                                                        <Grid item md={2} xs={8} style={{ textAlign: 'right', borderBottom: "1px solid black", marginLeft: '-1px', borderTop: '1px solid black' }}>
                                                                            <InputLabel style={{ color: "black", fontWeight: "bold" }} >{parseFloat(summeryValues.allTotal / csvData.length).toFixed(2)} </InputLabel>
                                                                        </Grid>
                                                                    </Grid>
                                                                </CardContent>
                                                                <br>
                                                                </br>
                                                                <Table aria-label="simple table" size="small">
                                                                    <TableHead>
                                                                        <TableRow>
                                                                            <TableCell rowSpan={2} align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }}>
                                                                                Reg.No
                                                                            </TableCell>
                                                                            <TableCell rowSpan={2} align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }}>
                                                                                Employee Name
                                                                            </TableCell>
                                                                            <TableCell colSpan={2} style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }} align='center'>
                                                                                Weighment 1
                                                                            </TableCell>
                                                                            <TableCell colSpan={2} style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }} align='center'>
                                                                                Weighment 2
                                                                            </TableCell>
                                                                            <TableCell colSpan={2} style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }} align='center'>
                                                                                Weighment 3
                                                                            </TableCell>
                                                                            <TableCell colSpan={2} style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }} align='center'>
                                                                                Weighment 4
                                                                            </TableCell>
                                                                            {/* {colName.map((item) => {
                                                                                if (item == "01") {
                                                                                    return (
                                                                                        <TableCell colSpan={2} style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }} align='center'>
                                                                                            {"Weighment 1"}
                                                                                        </TableCell>
                                                                                    );
                                                                                } else if (item == "02") {
                                                                                    return (
                                                                                        <TableCell colSpan={2} style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }} align='center'>
                                                                                            {"Weighment 2"}
                                                                                        </TableCell>
                                                                                    );
                                                                                }
                                                                                else if (item == "03") {
                                                                                    return (
                                                                                        <TableCell colSpan={2} style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }} align='center'>
                                                                                            {"Weighment 3"}
                                                                                        </TableCell>
                                                                                    );
                                                                                }
                                                                                else if (item == "04") {
                                                                                    return (
                                                                                        <TableCell colSpan={2} style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }} align='center'>
                                                                                            {"Weighment 4"}
                                                                                        </TableCell>
                                                                                    );
                                                                                }
                                                                            })} */}
                                                                            <TableCell rowSpan={2} align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }}>
                                                                                Total Kg
                                                                            </TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell style={{ fontWeight: "bold", borderBottom: "1px solid black" }} align='left'>
                                                                                Field
                                                                            </TableCell>
                                                                            <TableCell style={{ fontWeight: "bold", borderBottom: "1px solid black" }} align='right'>
                                                                                Kg
                                                                            </TableCell>
                                                                            <TableCell style={{ fontWeight: "bold", borderBottom: "1px solid black" }} align='left'>
                                                                                Field
                                                                            </TableCell>
                                                                            <TableCell style={{ fontWeight: "bold", borderBottom: "1px solid black" }} align='right'>
                                                                                Kg
                                                                            </TableCell>
                                                                            <TableCell style={{ fontWeight: "bold", borderBottom: "1px solid black" }} align='left'>
                                                                                Field
                                                                            </TableCell>
                                                                            <TableCell style={{ fontWeight: "bold", borderBottom: "1px solid black" }} align='right'>
                                                                                Kg
                                                                            </TableCell>
                                                                            <TableCell style={{ fontWeight: "bold", borderBottom: "1px solid black" }} align='left'>
                                                                                Field
                                                                            </TableCell>
                                                                            <TableCell style={{ fontWeight: "bold", borderBottom: "1px solid black" }} align='right'>
                                                                                Kg
                                                                            </TableCell>
                                                                            {/* {subNames.map((item) => {
                                                                                var res = item.slice(-1);
                                                                                if (res == 'F') {
                                                                                    return (
                                                                                        <TableCell style={{ fontWeight: "bold", borderBottom: "1px solid black" }} align='right'>
                                                                                            {'Section'}
                                                                                        </TableCell>
                                                                                    );
                                                                                }
                                                                                else if (res == 'N') {
                                                                                    return (
                                                                                        <TableCell style={{ fontWeight: "bold", borderBottom: "1px solid black" }} align='right'>
                                                                                            {'Kg'}
                                                                                        </TableCell>
                                                                                    );
                                                                                }
                                                                            })} */}
                                                                        </TableRow>
                                                                    </TableHead>
                                                                    <TableBody>
                                                                        {data.map((data, i) => {
                                                                            const sortedDetails = data.details.sort((a, b) => a.registrationNumber.localeCompare(b.registrationNumber));
                                                                            return (
                                                                                <React.Fragment key={i}>
                                                                                    <TableRow>
                                                                                        <TableCell colSpan={12} component="th" scope="row" align="left" style={{ fontWeight: 'bolder', color: 'green', borderBottom: '1px solid black' }}>Pay Point: {data.divisionName} <div>Category: {data.employeeSubCategoryName}</div></TableCell>
                                                                                    </TableRow>
                                                                                    {sortedDetails.map((row, k) => {
                                                                                        return (
                                                                                            <TableRow key={k}>
                                                                                                <TableCell align="left" style={{ borderBottom: "1px dashed black" }}>
                                                                                                    {row.registrationNumber}
                                                                                                </TableCell>
                                                                                                <TableCell align="left" style={{ borderBottom: "1px dashed black" }}>
                                                                                                    {row.firstName}
                                                                                                </TableCell>
                                                                                                {subNames.map((column) => {
                                                                                                    const value = row[column];
                                                                                                    var res = column.slice(-1);
                                                                                                    if (res == 'F') {
                                                                                                        return (
                                                                                                            <TableCell style={{ borderBottom: "1px dashed black" }} align='left'>
                                                                                                                {value == undefined ? '-' : res == 'N' ? parseFloat(value).toFixed(2) : value}
                                                                                                            </TableCell>
                                                                                                        );
                                                                                                    }
                                                                                                    else if (res == 'N') {
                                                                                                        return (
                                                                                                            <TableCell style={{ borderBottom: "1px dashed black" }} align='right'>
                                                                                                                {value == undefined ? '-' : res == 'N' ? parseFloat(value).toFixed(2) : value}
                                                                                                            </TableCell>
                                                                                                        );
                                                                                                    }
                                                                                                })}
                                                                                                <TableCell style={{ borderBottom: "1px dashed black" }} align="right">{parseFloat(row.total).toFixed(2)}</TableCell>
                                                                                            </TableRow>
                                                                                        );
                                                                                    })}
                                                                                </React.Fragment>
                                                                            );
                                                                        })}
                                                                        <TableRow>
                                                                            <TableCell colSpan={2} component="th" align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }} >
                                                                                Grand Total
                                                                            </TableCell>
                                                                            {summeryData.map((item) => {
                                                                                if (item.prop == "01") {
                                                                                    return (
                                                                                        <>
                                                                                            <TableCell component="th" align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }} >
                                                                                            </TableCell>
                                                                                            <TableCell component="th" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }} >
                                                                                                {item.value == 0 ? "-" : parseFloat(item.value).toFixed(2)}
                                                                                            </TableCell>
                                                                                        </>
                                                                                    )
                                                                                }
                                                                                else if (item.prop == "02") {
                                                                                    return (
                                                                                        <>
                                                                                            <TableCell component="th" align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }} >
                                                                                            </TableCell>
                                                                                            <TableCell component="th" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }} >
                                                                                                {item.value == 0 ? "-" : parseFloat(item.value).toFixed(2)}
                                                                                            </TableCell>
                                                                                        </>
                                                                                    )
                                                                                }
                                                                                else if (item.prop == "03") {
                                                                                    return (
                                                                                        <>
                                                                                            <TableCell component="th" align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }} >
                                                                                            </TableCell>
                                                                                            <TableCell component="th" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }} >
                                                                                                {item.value == 0 ? "-" : parseFloat(item.value).toFixed(2)}
                                                                                            </TableCell>
                                                                                        </>
                                                                                    )
                                                                                }
                                                                                else if (item.prop == "04") {
                                                                                    return (
                                                                                        <>
                                                                                            <TableCell component="th" align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }} >
                                                                                            </TableCell>
                                                                                            <TableCell component="th" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }} >
                                                                                                {item.value == 0 ? "-" : parseFloat(item.value).toFixed(2)}
                                                                                            </TableCell>
                                                                                        </>
                                                                                    )
                                                                                }
                                                                            })}
                                                                            <TableCell component="th" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }} >
                                                                                {parseFloat(summeryValues.allTotal).toFixed(2)}
                                                                            </TableCell>
                                                                        </TableRow>
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
                                                    documentTitle={"Daily Weighment Register Report " + moment(new Date().toString()).format().split('T')[0]}
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
                                                    <CreatePDF ref={componentRef} data={data} summeryValues={summeryValues}
                                                        selectedSearchValues={selectedSearchValues} summeryData={summeryData} subNames={subNames}
                                                        colName={colName} empCount={empCount} csvData={csvData} />
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