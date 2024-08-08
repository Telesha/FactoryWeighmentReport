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

const screenCode = 'LABOURCHECKLISTREPORT';

export default function LabourCheckListReport(props) {

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
    const [selectedOptions2, setSelectedOptions2] = useState([]);
    const getOptionLabel2 = option => `${option.label}`;
    const getOptionDisabled2 = option => option.value === "foo";
    const handleToggleOption2 = selectedOptions =>
        setSelectedOptions2(selectedOptions);
    const handleClearOptions2 = () => setSelectedOptions2([]);
    const handleSelectAll2 = isSelected => {
        if (isSelected) {
            setSelectedOptions2(fields);
        } else {
            handleClearOptions2();
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
            setSelectedOptions3(operator);
        } else {
            handleClearOptions3();
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
            setSelectedOptions4(harvestingJobs);
        } else {
            handleClearOptions4();
        }
    };
    const [title, setTitle] = useState("Daily Weighment Register Report")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [gardens, setGardens] = useState([]);
    const [costCenters, setCostCenters] = useState();
    const [harvestingJobs, setHarvestingJobs] = useState([]);
    const [sundry, setSundry] = useState();
    const [colName, setColName] = useState([]);
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
        empTypeID: '0'
    })

    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: "",
        gardenName: "",
        costCenterName: "",
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
    const [selectEmpType, setSelectEmpType] = useState('');
    const [empType, setEmpType] = useState([]);
    const [operator, setOperator] = useState([]);
    const [data, setdata] = useState([]);
    const [subNames, setSubNames] = useState([]);
    const [summeryData, setSummeryData] = useState([]);
    const [csvData, setCsvData] = useState([]);
    const [csvHeaders, setCsvHeaders] = useState([]);

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission(), GetEmployeeTypesData());
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
    }, [dailyAttendanceDataList.gangID]);

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

    const handleLimitChange = (event) => {
        setLimit(event.target.value);
    };
    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    const handleOnchange = val => {
        setSelectEmpType(val)
    }

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWLABOURCHECKLISTREPORT');

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

    async function GetEmployeeTypesData() {
        const result = await services.GetEmployeeTypesData();
        var newOptionArray = [];
        for (var i = 0; i < result.length; i++) {
            newOptionArray.push({ label: result[i].employeeTypeName, value: result[i].employeeTypeID })
        }
        setEmpType(newOptionArray);
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
            fieldID: selectedOptions2.map(x => x.value).join(','),
            gangID: selectedOptions1.map(x => x.value).join(','),
            empTypeID: selectedOptions.map(x => x.value).join(','),
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
            { label: "Duffa", value: "gangName" },
            { label: "Employee Type", value: "employeeTypeName" },
            { label: "Reg Number", value: "registrationNumber" },
            { label: "Employee Name", value: "firstName" }
        ];
        data.forEach(x => {

            var sessionName = x.sessionName;
            var employeeTypeName = x.employeeTypeName;
            if (result.length === 0) {
                result.push({
                    [sessionName + 'N']: checkUndifind(x.totalAmount),
                    [sessionName + 'A']: Math.round(checkUndifind(x.totalAmount) * checkUndifind(x.rate)),
                    [sessionName + 'A']: sessionName == "Morning Cash" ? checkUndifind(x.totalAmount) * checkUndifind(x.rate) :
                        sessionName == "Evening Session" && (employeeTypeName == "Permanent" || employeeTypeName == "Casual") ? checkUndifind(x.totalAmount) * 6.80 :
                            sessionName == "Mid Day Session" && (employeeTypeName == "Permanent" || employeeTypeName == "Casual") ? checkUndifind(x.totalAmount) * 6.80 :
                                employeeTypeName == "Outsider" ? checkUndifind(x.totalAmount) * 5.46 : 0,
                    //[sessionName + 'A']: checkUndifind(x.totalAmount) * checkUndifind(x.rate),
                    [sessionName + 'F']: x.fieldName,
                    [sessionName + 'U']: x.userName,
                    employeeID: parseInt(x.employeeID),
                    registrationNumber: x.registrationNumber,
                    firstName: x.firstName,
                    total: checkUndifind(x.totalAmount),
                    totalRate: Math.round(checkUndifind(x.totalAmount) * checkUndifind(x.rate)),
                    configurationValue: x.configurationValue,
                    employeeTypeName: x.employeeTypeName,
                    gangName: x.gangName
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
                    duplicate[sessionName + 'A'] = Math.round(checkUndifind(duplicate[sessionName + 'N']) * checkUndifind(x.rate));
                    duplicate[sessionName + 'A'] = sessionName == "Morning Cash" && employeeTypeName != "Outsider" ? checkUndifind(duplicate[sessionName + 'N']) * checkUndifind(x.rate) :
                        sessionName == "Evening Session" && (employeeTypeName == "Permanent" || employeeTypeName == "Casual") ? checkUndifind(duplicate[sessionName + 'N']) * 6.80 :
                            sessionName == "Mid Day Session" && (employeeTypeName == "Permanent" || employeeTypeName == "Casual") ? checkUndifind(duplicate[sessionName + 'N']) * 6.80 :
                                employeeTypeName == "Outsider" ? checkUndifind(duplicate[sessionName + 'N']) * 5.46 : 0;
                    //duplicate[sessionName + 'A'] = checkUndifind(duplicate[sessionName + 'N']) * checkUndifind(x.rate);
                    duplicate[sessionName + 'F'] = x.fieldName;
                    duplicate[sessionName + 'U'] = x.userName;
                    duplicate.employeeID = x.employeeID;
                    duplicate.registrationNumber = x.registrationNumber;
                    duplicate.firstName = x.firstName;
                    duplicate.configurationValue = x.configurationValue;
                    duplicate.gangName = x.gangName;
                    duplicate.employeeTypeName = x.employeeTypeName;
                    duplicate.total = checkUndifind(duplicate.total) + checkUndifind(x.totalAmount);
                    duplicate.totalRate = Math.round(checkUndifind(duplicate.total) * checkUndifind(x.rate));
                } else {
                    result.push({
                        [sessionName + 'N']: checkUndifind(x.totalAmount),
                        [sessionName + 'A']: Math.round(checkUndifind(x.totalAmount) * checkUndifind(x.rate)),
                        [sessionName + 'A']: sessionName == "Morning Cash" ? checkUndifind(x.totalAmount) * checkUndifind(x.rate) :
                            sessionName == "Evening Session" && (employeeTypeName == "Permanent" || employeeTypeName == "Casual") ? checkUndifind(x.totalAmount) * 6.80 :
                                sessionName == "Mid Day Session" && (employeeTypeName == "Permanent" || employeeTypeName == "Casual") ? checkUndifind(x.totalAmount) * 6.80 :
                                    employeeTypeName == "Outsider" ? checkUndifind(x.totalAmount) * 5.46 : 0,
                        [sessionName + 'F']: x.fieldName,
                        [sessionName + 'U']: x.userName,
                        employeeID: parseInt(x.employeeID),
                        registrationNumber: x.registrationNumber,
                        firstName: x.firstName,
                        total: checkUndifind(x.totalAmount),
                        totalRate: Math.round(checkUndifind(x.totalAmount) * checkUndifind(x.rate)),
                        configurationValue: x.configurationValue,
                        employeeTypeName: x.employeeTypeName,
                        gangName: x.gangName
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
            subNames.push(newNames[index].label + 'A');
            subNames.push(newNames[index].label + 'F');
            subNames.push(newNames[index].label + 'U');
            if (newNames[index].label == "Morning Cash" || newNames[index].label == "Off Day Cash 1") {
                csvHeaders.push({ label: "W 1" + ' - Kg', value: newNames[index].label + 'N' });
                csvHeaders.push({ label: "W 1" + ' - Amount', value: newNames[index].label + 'A' });
                csvHeaders.push({ label: "W 1" + ' - Section', value: newNames[index].label + 'F' });
                csvHeaders.push({ label: "W 1" + ' - Operator', value: newNames[index].label + 'U' });
            }
            else if (newNames[index].label == "Mid Day Session" || newNames[index].label == "Off Day Cash 2") {
                csvHeaders.push({ label: "W 2" + ' - Kg', value: newNames[index].label + 'N' });
                csvHeaders.push({ label: "W 2" + ' - Amount', value: newNames[index].label + 'A' });
                csvHeaders.push({ label: "W 2" + ' - Section', value: newNames[index].label + 'F' });
                csvHeaders.push({ label: "W 2" + ' - Operator', value: newNames[index].label + 'U' });
            }
            else if (newNames[index].label == "Evening Session" || newNames[index].label == "Off Day Cash 3") {
                csvHeaders.push({ label: "W 3" + ' - Kg', value: newNames[index].label + 'N' });
                csvHeaders.push({ label: "W 3" + ' - Amount', value: newNames[index].label + 'A' });
                csvHeaders.push({ label: "W 3" + ' - Section', value: newNames[index].label + 'F' });
                csvHeaders.push({ label: "W 3" + ' - Operator', value: newNames[index].label + 'U' });
            }

            subNamesCopy.push(newNames[index].label);
        }
        csvHeaders.push({ label: "Total Qty", value: "total" });
        csvHeaders.push({ label: "Total Amount", value: "totalRate" });


        var result2 = [];

        result.forEach(x => {
            subNames.forEach(y => {
                if (x[y]) {
                    var res = y.slice(-1);
                    if (res == 'N' || res == 'A') {
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
            if (x.name == "Morning CashN" || x.name == "Off Day Cash 1N" || x.name == "Morning CashA" || x.name == "Off Day Cash 1A") {
                x.order = 1;
            }
            else if (x.name == "Mid Day SessionN" || x.name == "Off Day Cash 2N" || x.name == "Mid Day SessionA" || x.name == "Off Day Cash 2A") {
                x.order = 2;
            }
            else if (x.name == "Evening SessionN" || x.name == "Off Day Cash 3N" || x.name == "Evening SessionA" || x.name == "Off Day Cash 3A") {
                x.order = 3;
            }

        })
        temlArry.sort((a, b) => { return a.order - b.order; });
        let finalResult = [];
        temlArry.forEach(x => {
            var sessionName = x.name;
            var duplicate = finalResult.find(y => parseInt(y.order) == parseInt(x.order));
            if (duplicate) {
                duplicate[sessionName] = checkUndifind(x.value);
                duplicate.order = x.order;
            } else {
                finalResult.push({
                    [sessionName]: checkUndifind(x.value),
                    order: parseInt(x.order),
                });
            }
        })
        setSummeryData(finalResult);

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
            gangName: "Legal Entity : " + groups[dailyAttendanceDataList.groupID],
            employeeTypeName: "Garden : " + gardens[dailyAttendanceDataList.gardenID],
            registrationNumber: "Cost Center : " + costCenters[dailyAttendanceDataList.costCenterID],
            firstName: selectedSearchValues.fieldName == "" ? "Section : " + "All Sections" : "Section : " + selectedSearchValues.fieldName
        }
        var newRow2 = {
            gangName: selectedSearchValues.gangName == "" ? "Duffa : " + "All Duffas" : "Duffa : " + selectedSearchValues.gangName,
            employeeTypeName: selectedSearchValues.empTypeName == "" ? "Employee Type : " + "All Employee Types " : "Employee Type : " + selectedSearchValues.empTypeName,
            registrationNumber: selectedSearchValues.operatorName == "" ? "Operator : " + "All Operators" : "Operator : " + selectedSearchValues.operatorName,
            firstName: "Date : " + moment(date.toString()).format().split('T')[0],
        }
        var newRow3 = {
            gangName: "Generated date/time : " + new Date().toLocaleString(),
            employeeTypeName: "Generated user : " + tokenService.getUserNameFromToken(),
        }

        var newRow5 = {
            gangName: "Total",
            total: summeryValues.allTotal,
            totalRate: summeryValues.allAmountTotal
        }

        summeryData.forEach(x => {
            if (x["Morning CashN"] || x["Off Day Cash 1N"] || x["Morning CashA"] || x["Off Day Cash 1A"]) {
                newRow5["Morning CashN"] = (x["Morning CashN"] || x["Off Day Cash 1N"]);
                newRow5["Morning CashA"] = (x["Morning CashA"] || x["Off Day Cash 1A"]);
            }
            else if (x["Mid Day SessionN"] || x["Off Day Cash 2N"] || x["Mid Day SessionA"] || x["Off Day Cash 2A"]) {
                newRow5["Mid Day SessionN"] = (x["Mid Day SessionN"] || x["Off Day Cash 2N"]);
                newRow5["Mid Day SessionA"] = (x["Mid Day SessionA"] || x["Off Day Cash 2A"]);
            }
            else if (x["Evening SessionN"] || x["Off Day Cash 3N"] || x["Evening SessionA"] || x["Off Day Cash 3A"]) {
                newRow5["Evening SessionN"] = (x["Evening SessionN"] || x["Off Day Cash 3N"]);
                newRow5["Evening SessionA"] = (x["Evening SessionA"] || x["Off Day Cash 3A"]);
            }
        })
        copyOfCsv.push(newRow5, {}, newRow1, newRow2, newRow3)
        let dataA = [
            {
                sheet: 'Daily Weighment Register',
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
            fieldName: selectedOptions2.map(x => x.label).join(', '),
            date: moment(date.toString()).format().split('T')[0],
            empTypeName: selectedOptions.map(x => x.label).join(', '),
            gangName: selectedOptions1.map(x => x.label).join(', '),
            operatorName: selectedOptions3.map(x => x.label).join(', ')
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
                                                    <InputLabel shrink id="fieldID">
                                                        Section
                                                    </InputLabel>
                                                    <CustomMultiSelect
                                                        items={fields}
                                                        getOptionLabel={getOptionLabel2}
                                                        getOptionDisabled={getOptionDisabled2}
                                                        selectedValues={selectedOptions2}
                                                        placeholder="Section"
                                                        selectAllLabel="Select all"
                                                        onToggleOption={handleToggleOption2}
                                                        onClearOptions={handleClearOptions2}
                                                        onSelectAll={handleSelectAll2}
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
                                                <Grid item md={3} xs={12} >
                                                    <InputLabel shrink id="operatorID">
                                                        Operator
                                                    </InputLabel>
                                                    <CustomMultiSelect
                                                        items={operator}
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
                                                                        <Grid item md={2} xs={8} style={{ border: "1px solid black" }}>
                                                                        </Grid>
                                                                        <Grid item md={2} xs={8} style={{ border: "1px solid black", marginLeft: '-1px' }}>
                                                                            <InputLabel style={{ color: "black" }}><b>Qty</b></InputLabel>
                                                                        </Grid>
                                                                        <Grid item md={2} xs={8} style={{ border: "1px solid black", marginLeft: '-1px' }}>
                                                                            <InputLabel style={{ color: "black" }}><b>Amount</b></InputLabel>
                                                                        </Grid>
                                                                        <Grid item md={2} xs={8} style={{ border: "1px solid black", marginLeft: '-1px' }}>
                                                                            <InputLabel style={{ color: "black" }}><b>Emp Count</b></InputLabel>
                                                                        </Grid>
                                                                        <Grid item md={2} xs={8} style={{ border: "1px solid black", marginLeft: '-1px' }}>
                                                                            <InputLabel style={{ color: "black" }}><b>Avg</b></InputLabel>
                                                                        </Grid>
                                                                    </Grid>
                                                                    {summeryData.map((item) => {
                                                                        if (item["Morning CashN"] || item["Off Day Cash 1N"] || item["Morning CashA"] || item["Off Day Cash 1A"]) {
                                                                            return (
                                                                                <Grid container md={8} spacing={2} style={{ justifyContent: 'start', marginTop: '7px' }}>
                                                                                    <Grid item md={2} xs={8} style={{ border: "1px solid black" }}>
                                                                                        <InputLabel style={{ color: "black" }} ><b>Weighment 1 </b></InputLabel>
                                                                                    </Grid>
                                                                                    <Grid item md={2} xs={8} style={{ border: "1px solid black", marginLeft: '-1px' }}>
                                                                                        <InputLabel style={{ color: "black", fontWeight: "bold" }} >{parseFloat(item['Morning CashN'] || item["Off Day Cash 1N"]).toFixed(2)} </InputLabel>
                                                                                    </Grid>
                                                                                    <Grid item md={2} xs={8} style={{ border: "1px solid black", marginLeft: '-1px' }}>
                                                                                        <InputLabel style={{ color: "black", fontWeight: "bold" }} >{parseInt(item["Morning CashA"] || item["Off Day Cash 1A"])} </InputLabel>
                                                                                    </Grid>
                                                                                    <Grid item md={2} xs={8} style={{ border: "1px solid black", marginLeft: '-1px' }}>
                                                                                        <InputLabel style={{ color: "black", fontWeight: "bold" }} >{parseInt(empCount.Weighment1Count)} </InputLabel>
                                                                                    </Grid>
                                                                                    <Grid item md={2} xs={8} style={{ border: "1px solid black", marginLeft: '-1px' }}>
                                                                                        <InputLabel style={{ color: "black", fontWeight: "bold" }} >{parseFloat((item['Morning CashN'] || item["Off Day Cash 1N"]) / empCount.Weighment1Count).toFixed(2)} </InputLabel>
                                                                                    </Grid>
                                                                                </Grid>
                                                                            )
                                                                        }
                                                                        else if (item["Mid Day SessionN"] || item["Off Day Cash 2N"] || item["Mid Day SessionA"] || item["Off Day Cash 2A"]) {
                                                                            return (
                                                                                <Grid container md={8} spacing={2} style={{ justifyContent: 'start', marginTop: '7px' }}>
                                                                                    <Grid item md={2} xs={8} style={{ border: "1px solid black" }}>
                                                                                        <InputLabel style={{ color: "black" }}><b>Weighment 2</b></InputLabel>
                                                                                    </Grid>
                                                                                    <Grid item md={2} xs={8} style={{ border: "1px solid black", marginLeft: '-1px' }}>
                                                                                        <InputLabel style={{ color: "black", fontWeight: "bold" }}>{parseFloat(item["Mid Day SessionN"] || item["Off Day Cash 2N"]).toFixed(2)} </InputLabel>
                                                                                    </Grid>
                                                                                    <Grid item md={2} xs={8} style={{ border: "1px solid black", marginLeft: '-1px' }}>
                                                                                        <InputLabel style={{ color: "black", fontWeight: "bold" }}>{parseInt(item["Mid Day SessionA"] || item["Off Day Cash 2A"])} </InputLabel>
                                                                                    </Grid>
                                                                                    <Grid item md={2} xs={8} style={{ border: "1px solid black", marginLeft: '-1px' }}>
                                                                                        <InputLabel style={{ color: "black", fontWeight: "bold" }} >{parseInt(empCount.Weighment2Count)} </InputLabel>
                                                                                    </Grid>
                                                                                    <Grid item md={2} xs={8} style={{ border: "1px solid black", marginLeft: '-1px' }}>
                                                                                        <InputLabel style={{ color: "black", fontWeight: "bold" }} >{parseFloat((item["Mid Day SessionN"] || item["Off Day Cash 2N"]) / empCount.Weighment2Count).toFixed(2)} </InputLabel>
                                                                                    </Grid>
                                                                                </Grid>
                                                                            )
                                                                        }
                                                                        else if (item["Evening SessionN"] || item["Off Day Cash 3N"] || item["Evening SessionA"] || item["Off Day Cash 3A"]) {
                                                                            return (
                                                                                <Grid container md={8} spacing={2} style={{ justifyContent: 'start', marginTop: '7px' }}>
                                                                                    <Grid item md={2} xs={8} style={{ border: "1px solid black" }}>
                                                                                        <InputLabel style={{ color: "black" }}><b>Weighment 3</b></InputLabel>
                                                                                    </Grid>
                                                                                    <Grid item md={2} xs={8} style={{ border: "1px solid black", marginLeft: '-1px' }}>
                                                                                        <InputLabel style={{ color: "black", fontWeight: "bold" }}>{parseFloat(item["Evening SessionN"] || item["Off Day Cash 3N"]).toFixed(2)} </InputLabel>
                                                                                    </Grid>
                                                                                    <Grid item md={2} xs={8} style={{ border: "1px solid black", marginLeft: '-1px' }}>
                                                                                        <InputLabel style={{ color: "black", fontWeight: "bold" }}>{parseInt(item["Evening SessionA"] || item["Off Day Cash 3A"])} </InputLabel>
                                                                                    </Grid>
                                                                                    <Grid item md={2} xs={8} style={{ border: "1px solid black", marginLeft: '-1px' }}>
                                                                                        <InputLabel style={{ color: "black", fontWeight: "bold" }} >{parseInt(empCount.Weighment3Count)} </InputLabel>
                                                                                    </Grid>
                                                                                    <Grid item md={2} xs={8} style={{ border: "1px solid black", marginLeft: '-1px' }}>
                                                                                        <InputLabel style={{ color: "black", fontWeight: "bold" }} >{parseFloat((item["Evening SessionN"] || item["Off Day Cash 3N"]) / empCount.Weighment3Count).toFixed(2)} </InputLabel>
                                                                                    </Grid>
                                                                                </Grid>
                                                                            )
                                                                        }
                                                                    })}
                                                                    <Grid container md={8} spacing={2} style={{ justifyContent: 'start', marginTop: '7px' }}>
                                                                        <Grid item md={2} xs={8} style={{ border: "1px solid black" }}>
                                                                            <InputLabel style={{ color: "black" }}><b>Total</b></InputLabel>
                                                                        </Grid>
                                                                        <Grid item md={2} xs={8} style={{ border: "1px solid black", marginLeft: '-1px' }}>
                                                                            <InputLabel style={{ color: "black", fontWeight: "bold" }} >{parseFloat(summeryValues.allTotal).toFixed(2)} </InputLabel>
                                                                        </Grid>
                                                                        <Grid item md={2} xs={8} style={{ border: "1px solid black", marginLeft: '-1px' }}>
                                                                            <InputLabel style={{ color: "black", fontWeight: "bold" }} >{parseInt(summeryValues.allAmountTotal)} </InputLabel>
                                                                        </Grid>
                                                                        <Grid item md={2} xs={8} style={{ border: "1px solid black", marginLeft: '-1px' }}>
                                                                            <InputLabel style={{ color: "black", fontWeight: "bold" }} >{parseInt(data.length)} </InputLabel>
                                                                        </Grid>
                                                                        <Grid item md={2} xs={8} style={{ border: "1px solid black", marginLeft: '-1px' }}>
                                                                            <InputLabel style={{ color: "black", fontWeight: "bold" }} >{parseFloat(summeryValues.allTotal / data.length).toFixed(2)} </InputLabel>
                                                                        </Grid>
                                                                    </Grid>
                                                                </CardContent>
                                                                <br>
                                                                </br>
                                                                <Table aria-label="simple table">
                                                                    <TableHead>
                                                                        <TableRow>
                                                                            <TableCell rowSpan={2} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                                                Duffa
                                                                            </TableCell>
                                                                            <TableCell rowSpan={2} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                                                Employee Type
                                                                            </TableCell>
                                                                            <TableCell rowSpan={2} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                                                Reg.No
                                                                            </TableCell>
                                                                            <TableCell rowSpan={2} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                                                Employee Name
                                                                            </TableCell>
                                                                            {colName.map((item) => {
                                                                                if (item == "Morning Cash" || item == "Off Day Cash 1") {
                                                                                    return (
                                                                                        <TableCell colSpan={4} style={{ fontWeight: "bold", border: "1px solid black" }} align='center'>
                                                                                            {"Weighment 1"}
                                                                                        </TableCell>
                                                                                    );
                                                                                } else if (item == "Mid Day Session" || item == "Off Day Cash 2") {
                                                                                    return (
                                                                                        <TableCell colSpan={4} style={{ fontWeight: "bold", border: "1px solid black" }} align='center'>
                                                                                            {"Weighment 2"}
                                                                                        </TableCell>
                                                                                    );
                                                                                }
                                                                                else if (item == "Evening Session" || item == "Off Day Cash 3") {
                                                                                    return (
                                                                                        <TableCell colSpan={4} style={{ fontWeight: "bold", border: "1px solid black" }} align='center'>
                                                                                            {"Weighment 3"}
                                                                                        </TableCell>
                                                                                    );
                                                                                }
                                                                            })}
                                                                            <TableCell rowSpan={2} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                                                Total Qty
                                                                            </TableCell>
                                                                            <TableCell rowSpan={2} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                                                Total Amount
                                                                            </TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            {subNames.map((item) => {
                                                                                var res = item.slice(-1);
                                                                                return (
                                                                                    <TableCell style={{ fontWeight: "bold", border: "1px solid black" }} align='center'>
                                                                                        {res == 'N' ? 'Kg' : res == 'F' ? 'Section' : res == 'A' ? 'Amount' : 'Operator'}
                                                                                    </TableCell>
                                                                                );
                                                                            })}
                                                                        </TableRow>
                                                                    </TableHead>
                                                                    <TableBody>
                                                                        {data.map((row) => (
                                                                            <TableRow key={row.registrationNumber}>
                                                                                <TableCell component="th" align="left" style={{ border: "1px solid black" }} >
                                                                                    {row.gangName}
                                                                                </TableCell>
                                                                                <TableCell align="left" style={{ border: "1px solid black" }}>
                                                                                    {row.employeeTypeName}
                                                                                </TableCell>
                                                                                <TableCell align="left" style={{ border: "1px solid black" }}>
                                                                                    {row.registrationNumber}
                                                                                </TableCell>
                                                                                <TableCell align="left" style={{ border: "1px solid black" }}>
                                                                                    {row.firstName}
                                                                                </TableCell>
                                                                                {subNames.map((column) => {
                                                                                    const value = row[column];
                                                                                    var res = column.slice(-1);
                                                                                    return (
                                                                                        <TableCell style={{ border: "1px solid black" }} align='right'>
                                                                                            {value == undefined ? '-' : res == 'N' ? parseFloat(value).toFixed(2) : res == 'A' ? parseInt(value) : value}
                                                                                        </TableCell>
                                                                                    );
                                                                                })}
                                                                                <TableCell style={{ border: "1px solid black" }} align="right">{parseFloat(row.total).toFixed(2)}</TableCell>
                                                                                <TableCell style={{ border: "1px solid black" }} align="right">{parseInt(row.totalRate)}</TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                        <TableRow>
                                                                            <TableCell colSpan={4} component="th" align="left" style={{ fontWeight: "bold", border: "1px solid black" }} >
                                                                                Total
                                                                            </TableCell>
                                                                            {summeryData.map((item) => {
                                                                                if (item["Morning CashN"] || item["Off Day Cash 1N"] || item["Morning CashA"] || item["Off Day Cash 1A"]) {
                                                                                    return (
                                                                                        <>
                                                                                            <TableCell component="th" align="right" style={{ fontWeight: "bold", border: "1px solid black" }} >
                                                                                                {parseFloat(item['Morning CashN'] || item["Off Day Cash 1N"]).toFixed(2)}
                                                                                            </TableCell>
                                                                                            <TableCell component="th" align="right" style={{ fontWeight: "bold", border: "1px solid black" }} >
                                                                                                {parseInt(item['Morning CashA'] || item["Off Day Cash 1A"])}
                                                                                            </TableCell>
                                                                                            <TableCell component="th" align="left" style={{ fontWeight: "bold", border: "1px solid black" }} >

                                                                                            </TableCell>
                                                                                            <TableCell component="th" align="left" style={{ fontWeight: "bold", border: "1px solid black" }} >

                                                                                            </TableCell>
                                                                                        </>
                                                                                    )
                                                                                }
                                                                                else if (item["Mid Day SessionN"] || item["Off Day Cash 2N"] || item["Mid Day SessionA"] || item["Off Day Cash 2A"]) {
                                                                                    return (
                                                                                        <>
                                                                                            <TableCell component="th" align="right" style={{ fontWeight: "bold", border: "1px solid black" }} >
                                                                                                {parseFloat(item['Mid Day SessionN'] || item["Off Day Cash 2N"]).toFixed(2)}
                                                                                            </TableCell>
                                                                                            <TableCell component="th" align="right" style={{ fontWeight: "bold", border: "1px solid black" }} >
                                                                                                {parseInt(item['Mid Day SessionA'] || item["Off Day Cash 2A"])}
                                                                                            </TableCell>
                                                                                            <TableCell component="th" align="left" style={{ fontWeight: "bold", border: "1px solid black" }} >

                                                                                            </TableCell>
                                                                                            <TableCell component="th" align="left" style={{ fontWeight: "bold", border: "1px solid black" }} >

                                                                                            </TableCell>
                                                                                        </>
                                                                                    )
                                                                                }
                                                                                else if (item["Evening SessionN"] || item["Off Day Cash 3N"] || item["Evening SessionA"] || item["Off Day Cash 3A"]) {
                                                                                    return (
                                                                                        <>
                                                                                            <TableCell component="th" align="right" style={{ fontWeight: "bold", border: "1px solid black" }} >
                                                                                                {parseFloat(item['Evening SessionN'] || item["Off Day Cash 3N"]).toFixed(2)}
                                                                                            </TableCell>
                                                                                            <TableCell component="th" align="right" style={{ fontWeight: "bold", border: "1px solid black" }} >
                                                                                                {parseInt(item['Evening SessionA'] || item["Off Day Cash 3A"])}
                                                                                            </TableCell>
                                                                                            <TableCell component="th" align="left" style={{ fontWeight: "bold", border: "1px solid black" }} >

                                                                                            </TableCell>
                                                                                            <TableCell component="th" align="left" style={{ fontWeight: "bold", border: "1px solid black" }} >

                                                                                            </TableCell>
                                                                                        </>
                                                                                    )
                                                                                }
                                                                            })}
                                                                            <TableCell component="th" align="right" style={{ fontWeight: "bold", border: "1px solid black" }} >
                                                                                {parseFloat(summeryValues.allTotal).toFixed(2)}
                                                                            </TableCell>
                                                                            <TableCell component="th" align="right" style={{ fontWeight: "bold", border: "1px solid black" }} >
                                                                                {parseInt(summeryValues.allAmountTotal)}
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
                                                        colName={colName} empCount={empCount} />
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