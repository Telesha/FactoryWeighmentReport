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
import xlsx from 'json-as-xlsx';
import LineWeightIcon from '@material-ui/icons/LineWeight';
import { CustomMultiSelect } from 'src/utils/CustomMultiSelect';
import moment from 'moment';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";

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

const screenCode = 'DAILYNONPLUCKINGACTIVITYREPORT';

export default function DailyNonPluckingActivityReport(props) {
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
            setSelectedOptions4(sirders);
        } else {
            handleClearOptions4();
        }
    };
    const [title, setTitle] = useState("Daily Non Plucking Activity Report")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [gardens, setGardens] = useState([]);
    const [costCenters, setCostCenters] = useState();
    const [dailyNonPluckingPaymentData, setDailyNonPluckingPaymentData] = useState([]);
    const [employeeType, setEmployeeType] = useState();
    const [gangs, setGangs] = useState([]);
    const [operator, setOperator] = useState([]);
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [harvestingJobs, setHarvestingJobs] = useState([]);
    const [date, setDate] = useState(new Date());
    const [empType, setEmpType] = useState([]);
    const [sirders, setSirder] = useState([]);
    const [employeeCount, setEmployeeCount] = useState([]);
    const [dailyNonPluckingPaymentList, setDailyNonPluckingPaymentList] = useState({
        groupID: '0',
        gardenID: '0',
        costCenterID: '0',
        date: new Date().toISOString().substr(0, 10),
        factoryJobID: '0',
        fieldID: '0',
        empTypeID: '0'
    })

    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: "0",
        gardenName: "0",
        costCenterName: "0",
        date: '',
        factoryJobID: '',
        fieldID: '',
        empTypeID: '',
        sirderName: '',
        operatorName: '',
        gangName: '',
        fieldName: ''
    })

    const [totalValues, setTotalValues] = useState({
        totalAmount: 0,
        totalTotalAmount: 0,
        totalgrossAmount: 0,
        totalallowance: 0,
        totalgardenAllowance: 0,
        totalpfDeductionAmount: 0,
        totalOTAmount: 0,
        totalDeductionAmount: 0,
        totalQuantity: 0,
        totalAssignQuantity: 0,
        totalExtraallowance: 0,
        totalbase: 0,
        totalBCSAllowance: 0,
        totalExtraPayment: 0,
        totalExtraHazira: 0,
        totalHaziraCount: 0
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

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID());
    }, [dailyNonPluckingPaymentList.groupID]);

    useEffect(() => {
        setDailyNonPluckingPaymentList((prevState) => ({
            ...prevState,
            costCenterID: "0"
        }));
    }, [dailyNonPluckingPaymentList.groupID]);

    useEffect(() => {
        trackPromise(
            getCostCenterDetailsByGardenID()
        )
    }, [dailyNonPluckingPaymentList.gardenID]);

    useEffect(() => {
        setDailyNonPluckingPaymentData([])
    }, [dailyNonPluckingPaymentList.gardenID]);

    useEffect(() => {
        setDailyNonPluckingPaymentData([])
    }, [dailyNonPluckingPaymentList.costCenterID]);
 
    useEffect(() => {
        setDailyNonPluckingPaymentData([])
    }, [dailyNonPluckingPaymentList.date]);

    useEffect(() => {
        if (dailyNonPluckingPaymentData.length != 0) {
            calculateTotalQty()
        }
    }, [dailyNonPluckingPaymentData]);

    useEffect(() => {
        if (dailyNonPluckingPaymentData.gardenID != "0") {
            trackPromise(GetFactoryJobs())
        }
    }, [dailyNonPluckingPaymentList.gardenID]);

    useEffect(() => {
        if (dailyNonPluckingPaymentList.costCenterID != 0) {
            getGangDetailsByDivisionID();
        }
    }, [dailyNonPluckingPaymentList.costCenterID]);

    useEffect(() => {
        setDailyNonPluckingPaymentData([]);
    }, [dailyNonPluckingPaymentList.date]);

    useEffect(() => {
        setDailyNonPluckingPaymentData([]);
    }, [dailyNonPluckingPaymentList.empTypeID]);

    useEffect(() => {
        setDailyNonPluckingPaymentData([]);
    }, [dailyNonPluckingPaymentList.factoryJobID]);

    useEffect(() => {
        setDailyNonPluckingPaymentData([]);
    }, [dailyNonPluckingPaymentList.fieldID]);

    useEffect(() => {
        setDailyNonPluckingPaymentData([]);
    }, [dailyNonPluckingPaymentList.costCenterID]);

    useEffect(() => {
        GetOperatorListByDateAndGardenIDForLabourChecklistReport();
    }, [dailyNonPluckingPaymentList.gardenID, date]);

    useEffect(() => {
        setDailyNonPluckingPaymentData([]);
    }, [dailyNonPluckingPaymentList.costCenterID]);

    useEffect(() => {
        setDailyNonPluckingPaymentData([]);
    }, [selectedOptions]);

    useEffect(() => {
        setDailyNonPluckingPaymentData([]);
    }, [selectedOptions1]);

    useEffect(() => {
        setDailyNonPluckingPaymentData([]);
    }, [selectedOptions3]);

    useEffect(() => {
        setDailyNonPluckingPaymentData([]);
    }, [selectedOptions4]);


    const handleLimitChange = (event) => {
        setLimit(event.target.value);
    };
    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWDAILYNONPLUCKINGACTIVITYREPORT');

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

        setDailyNonPluckingPaymentList({
            ...dailyNonPluckingPaymentList,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            gardenID: parseInt(tokenService.getFactoryIDFromToken())
        })

        getEmployeeTypesForDropdown();
        getSirdersForDropdown();
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(dailyNonPluckingPaymentList.groupID);
        setGardens(response);
    };

    async function getCostCenterDetailsByGardenID() {
        var response = await services.getDivisionDetailsByEstateID(dailyNonPluckingPaymentList.gardenID);
        const elementCount = response.reduce((count) => count + 1, 0);
        var generated = generateDropDownMenu(response)
        if (elementCount === 1) {
            setDailyNonPluckingPaymentList((prevState) => ({
                ...prevState,
                costCenterID: generated[0].props.value,
            }));
        }
        setCostCenters(response);
    };

    async function GetFactoryJobs() {
        const result = await services.GetFactoryJobs(dailyNonPluckingPaymentList.gardenID);
        setHarvestingJobs(result);
    }

    async function getGangDetailsByDivisionID() {
        var response = await services.getGangDetailsByDivisionID(dailyNonPluckingPaymentList.costCenterID);
        var newOptionArray = gangs;
        for (var i = 0; i < response.length; i++) {
            newOptionArray.push({ label: response[i].gangName, value: response[i].gangID })
        }
        setGangs(newOptionArray);
    };

    async function GetOperatorListByDateAndGardenIDForLabourChecklistReport() {
        const result = await services.GetOperatorListByDateAndGardenIDForLabourChecklistReport(dailyNonPluckingPaymentList.gardenID, moment(date.toString()).format().split('T')[0]);
        if (result.length > 0) {
            var newOptionArray = [];
            for (var i = 0; i < result.length; i++) {
                newOptionArray.push({ label: result[i].operatorName, value: result[i].operatorID })
            }
            setOperator(newOptionArray);
        }
        else {
            setOperator([]);
        }
    }

    async function getEmployeeTypesForDropdown() {
        const result = await services.getEmployeeTypesForDropdown();
        var newOptionArray = empType;
        for (var i = 0; i < result.length; i++) {
            newOptionArray.push({ label: result[i].employeeTypeName, value: result[i].employeeTypeID })
        }
        setEmpType(newOptionArray);
    }

    async function getSirdersForDropdown() {
        const result = await services.getSirdersForDropdown();
        var newOptionArray = sirders;
        for (var i = 0; i < result.length; i++) {
            newOptionArray.push({ label: result[i].employeeName, value: result[i].employeeID })
        }
        setSirder(newOptionArray);
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
            groupID: parseInt(dailyNonPluckingPaymentList.groupID),
            gardenID: parseInt(dailyNonPluckingPaymentList.gardenID),
            costCenterID: parseInt(dailyNonPluckingPaymentList.costCenterID),
            applicableDate: new Date(date),
            gangID: selectedOptions1.map(x => x.value).join(','),
            empTypeID: selectedOptions.map(x => x.value).join(','),
            userID: selectedOptions3.map(x => x.value).join(','),
            sirderID: selectedOptions4.map(x => x.value).join(','),
        }
        getSelectedDropdownValuesForReport(model);
        const response = await services.GetDailyNonPluckingDetails(model);
        if (response.statusCode == "Success" && response.data != null) {
            response.data.forEach(x => {
                if (x.assignQuntity !== 0 && x.quntity !== 0) {
                    x.amount = (x.rate / x.assignQuntity) * x.quntity;
                } else {
                    x.amount = 170.00;
                }
                x.totalAmount = x.allowance + x.gardenAllowance + x.base + x.ot
                if ((x.quntity - x.assignQuntity) > 0) {
                    x.otAmount = x.quntity - x.assignQuntity
                }
            });
            setDailyNonPluckingPaymentData(response.data);
            createDataForExcel(response.data);
            const attendanceData = response.data;
            const groupedAttendance = attendanceData.reduce((groups, record) => {
                const registrationNumber = record.registrationNumber;
                if (!groups[registrationNumber]) {
                    groups[registrationNumber] = [];
                }
                groups[registrationNumber].push(record);
                return groups;
            }, {});
            const employeeRegistrationNumberCount = Object.keys(groupedAttendance).length;
            setEmployeeCount(employeeRegistrationNumberCount)
        }
        else {
            alert.error(response.message);
        }
    }

    function calculateTotalQty() {
        const totalAmount = dailyNonPluckingPaymentData.reduce((accumulator, current) => accumulator + current.base, 0);
        const totalbase = dailyNonPluckingPaymentData.reduce((accumulator, current) => accumulator + current.base, 0);
        const totalBCSAllowance = dailyNonPluckingPaymentData.reduce((accumulator, current) => accumulator + current.allowance, 0);
        const totalExtraPayment = dailyNonPluckingPaymentData.reduce((accumulator, current) => accumulator + current.gardenAllowance, 0);
        const totalExtraHazira = dailyNonPluckingPaymentData.reduce((accumulator, current) => accumulator + current.ot, 0);
        const totalTotalAmount = dailyNonPluckingPaymentData.reduce((accumulator, current) => accumulator + current.totalAmount, 0);
        const totalHaziraCount = dailyNonPluckingPaymentData.reduce((accumulator, current) => accumulator + current.taskType, 0);
        const totalgrossAmount = dailyNonPluckingPaymentData.reduce((accumulator, current) => accumulator + current.grossAmount, 0);
        const totalallowance = dailyNonPluckingPaymentData.reduce((accumulator, current) => accumulator + current.allowance, 0);
        const totalgardenAllowance = dailyNonPluckingPaymentData.reduce((accumulator, current) => accumulator + current.gardenAllowance, 0);
        const totalpfDeductionAmount = dailyNonPluckingPaymentData.reduce((accumulator, current) => accumulator + current.pfDeductionAmount, 0);
        const totalOTAmount = dailyNonPluckingPaymentData.reduce((accumulator, current) => accumulator + current.ot, 0);
        const totalQuantity = dailyNonPluckingPaymentData.reduce((accumulator, current) => accumulator + current.aQuntity, 0);
        const totalAssignQuantity = dailyNonPluckingPaymentData.reduce((accumulator, current) => accumulator + current.base, 0);
        const totalExtraallowance = dailyNonPluckingPaymentData.reduce((accumulator, current) => accumulator + current.gardenAllowance, 0);
        setTotalValues({
            ...totalValues,
            totalAmount: totalAmount,
            totalTotalAmount: totalTotalAmount,
            totalgrossAmount: totalgrossAmount,
            totalallowance: totalallowance,
            totalgardenAllowance: totalgardenAllowance,
            totalpfDeductionAmount: totalpfDeductionAmount,
            totalOTAmount: totalOTAmount,
            totalQuantity: totalQuantity,
            totalAssignQuantity: totalAssignQuantity,
            totalExtraallowance: totalExtraallowance,
            totalbase: totalbase,
            totalBCSAllowance: totalBCSAllowance,
            totalExtraPayment: totalExtraPayment,
            totalExtraHazira: totalExtraHazira,
            totalHaziraCount: totalHaziraCount
        })
    };

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            array.map(x => {
                var vr = {
                    'Date': x.date.split('T')[0],
                    'Operator': x.operatorName,
                    'Emp.ID': x.registrationNumber,
                    'Emp.Name': x.firstName,
                    'Emp.Type': x.employeeTypeName,
                    'Duffa': x.gangName,
                    'Amount': x.base.toFixed(2), 
                    'BCS Allowance': x.allowance.toFixed(2),
                    'Extra Payment': x.gardenAllowance.toFixed(2),
                    'Extra Hazira': x.ot.toFixed(2),
                    'Total Amount': x.totalAmount.toFixed(2),
                    'Hazira Count': x.taskType
                };
                res.push(vr);
            });
            var vr = {
                'Date': 'Total',
                'Amount': totalValues.totalbase.toFixed(2),
                'BCS Allowance': totalValues.totalBCSAllowance.toFixed(2),
                'Extra Payment': totalValues.totalExtraPayment.toFixed(2),
                'Extra Hazira': totalValues.totalExtraHazira.toFixed(2),
                'Total Amount': totalValues.totalTotalAmount.toFixed(2),
                'Hazira Count': totalValues.totalHaziraCount

            };
            res.push(vr);
            res.push([]);
            var vr = {
                'Date': 'Garden: ' + selectedSearchValues.gardenName,
                'Operator': selectedSearchValues.costCenterName === undefined ? 'Division: All Divisions' : 'Division: ' + selectedSearchValues.costCenterName,
                'Emp.ID': selectedSearchValues.empTypeName === "" ? 'Employee Type: All Employee Types' : 'Employee Type: ' + selectedSearchValues.empTypeName,
                'Emp.Name': selectedSearchValues.operatorName === "" ? 'Operator: All Operators' : 'Operator: ' + selectedSearchValues.operatorName,
                'Emp.Type': selectedSearchValues.gangName === "" ? 'Duffa: All Duffas' : 'Duffa: ' + selectedSearchValues.gangName,
                'Duffa': selectedSearchValues.fieldName === "" ? 'Section: All Sections' : 'Section: ' + selectedSearchValues.fieldName,
                'Amount': selectedSearchValues.sirderName === "" ? 'Sirder: All Siders' : 'Sirder: ' + selectedSearchValues.sirderName,
                'BCS Allowance': 'Date: ' + selectedSearchValues.date
            };
            res.push(vr);
        }
        return res;
    }

    async function createFile() {
        var file = await createDataForExcel(dailyNonPluckingPaymentData);
        var settings = {
            sheetName: 'Daily NonPlu Activity Report',
            fileName:
                'Daily Non Plucking Activity Report - ' +
                selectedSearchValues.date,
            writeOptions: {}
        };
        let keys = Object.keys(file[0]);
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem });
        });
        let dataA = [
            {
                sheet: 'Daily NonPlu Activity Report',
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
        setDailyNonPluckingPaymentList({
            ...dailyNonPluckingPaymentList,
            [e.target.name]: value
        });
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: groups[searchForm.groupID],
            gardenName: gardens[searchForm.gardenID],
            costCenterName: costCenters[searchForm.costCenterID],
            date: dailyNonPluckingPaymentList.date,
            empTypeName: selectedOptions.map(x => x.label).join(', '),
            gangName: selectedOptions1.map(x => x.label).join(', '),
            operatorName: selectedOptions3.map(x => x.label).join(', '),
            sirderName: selectedOptions4.map(x => x.label).join(', ')
        })
    }

    return (
        <Page className={classes.root} title={title}>
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: dailyNonPluckingPaymentList.groupID,
                        gardenID: dailyNonPluckingPaymentList.gardenID,
                        costCenterID: dailyNonPluckingPaymentList.costCenterID,
                        date: dailyNonPluckingPaymentList.date,
                        factoryJobID: dailyNonPluckingPaymentList.factoryJobID,
                        fieldID: dailyNonPluckingPaymentList.fieldID,
                        empTypeID: dailyNonPluckingPaymentList.empTypeID

                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Legal Entity is required').min("1", 'Legal Entity is required'),
                            gardenID: Yup.number().required('Garden is required').min("1", 'Garden is required'),
                            date: Yup.date().required('Date is required'),
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
                                                        value={dailyNonPluckingPaymentList.groupID}
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
                                                        value={dailyNonPluckingPaymentList.gardenID}
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
                                                        fullWidth
                                                        name="costCenterID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={dailyNonPluckingPaymentList.costCenterID}
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
                                                <Grid container justify="flex-end">
                                                    <Box pr={2}>
                                                        <Button
                                                            color="primary"
                                                            variant="contained"
                                                            type="submit"
                                                            size='small'
                                                        >
                                                            Search
                                                        </Button>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                            <br />
                                            <Box minWidth={1050}>
                                                {dailyNonPluckingPaymentData.length > 0 ? (
                                                    <Chip
                                                        icon={<LineWeightIcon />}
                                                        label={"Total Employee Count: " + employeeCount}
                                                        color="secondary"
                                                        variant="outlined"
                                                    />
                                                ) : null}
                                                <br>
                                                </br>
                                                <br>
                                                </br>
                                                {dailyNonPluckingPaymentData.length > 0 ?
                                                    <TableContainer component={Paper}>
                                                        <Table className={classes.table} aria-label="simple table">
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Date</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Operator</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Emp.ID</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Emp.Name</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Emp.Type</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Duffa</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Amount</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>BCS Allowance</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Extra Payment</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Extra Hazira</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Total Amount</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Hazira Count</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {dailyNonPluckingPaymentData.slice(page * limit, page * limit + limit).map((row, i) => (
                                                                    <TableRow key={i}>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.date.split('T')[0]}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.operatorName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.registrationNumber}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.firstName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.employeeTypeName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.gangName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.base.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.allowance.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.gardenAllowance.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.ot.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.totalAmount.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.taskType}</TableCell>
                                                                    </TableRow>
                                                                )
                                                                )}
                                                            </TableBody>
                                                            <TableRow>
                                                                <TableCell align={'center'} style={{ borderBottom: "none", border: "1px solid black" }}><b>Total</b></TableCell>
                                                                <TableCell style={{ borderBottom: "none", border: "1px solid black" }} ></TableCell>
                                                                <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                                <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                                <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                                <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                                <TableCell align={'right'} style={{ borderBottom: "none", border: "1px solid black" }}>
                                                                    <b> {totalValues.totalbase.toFixed(2)} </b>
                                                                </TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                                                    <b> {totalValues.totalBCSAllowance.toFixed(2)} </b>
                                                                </TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                                                    <b> {totalValues.totalExtraPayment.toFixed(2)} </b>
                                                                </TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                                                    <b> {totalValues.totalExtraHazira.toFixed(2)} </b>
                                                                </TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                                                    <b> {totalValues.totalTotalAmount.toFixed(2)} </b>
                                                                </TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                                                    <b> {totalValues.totalHaziraCount} </b>
                                                                </TableCell>
                                                            </TableRow>
                                                        </Table>
                                                        <TablePagination
                                                            component="div"
                                                            count={dailyNonPluckingPaymentData.length}
                                                            onChangePage={handlePageChange}
                                                            onChangeRowsPerPage={handleLimitChange}
                                                            page={page}
                                                            rowsPerPage={limit}
                                                            rowsPerPageOptions={[5, 10, 25]}
                                                        />
                                                    </TableContainer> : null}
                                            </Box>
                                        </CardContent>
                                        {dailyNonPluckingPaymentData.length > 0 ?
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                <Button
                                                    color="primary"
                                                    id="btnRecord"
                                                    type="submit"
                                                    variant="contained"
                                                    style={{ marginRight: '1rem' }}
                                                    className={classes.colorRecord}
                                                    onClick={createFile}
                                                    size="small"
                                                >
                                                    EXCEL
                                                </Button>
                                                <div>&nbsp;</div>
                                                <ReactToPrint
                                                    documentTitle={"Daily Non Plucking Activity Report"}
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
                                                        searchData={selectedSearchValues} dailyNonPluckingPaymentData={dailyNonPluckingPaymentData}
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