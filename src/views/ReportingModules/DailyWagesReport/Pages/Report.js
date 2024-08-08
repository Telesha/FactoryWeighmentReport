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

import TablePagination from '@material-ui/core/TablePagination';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
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

const screenCode = 'DAILYWAGESREPORT';

export default function DailyWagesReport(props) {
    const [title, setTitle] = useState("Daily Wages Report")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [gardens, setGardens] = useState([]);
    const [costCenters, setCostCenters] = useState();
    const [payPoints, setPayPoints] = useState([]);
    const [offDayCashPaymentData, setOffDayCashPaymentData] = useState([]);
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [empType, setEmpType] = useState([]);
    const [dailyWagesDataList, setDailyWagesDataList] = useState({
        groupID: '0',
        gardenID: '0',
        payPointID: '0',
        date: new Date().toISOString().substr(0, 10),
        empTypeID: '0',
        gangID: '0',
        registrationNumber: '',
    })

    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: "0",
        gardenName: "0",
        costCenterName: "0",
        date: '',
        employeeName: '',
        employeeTypeID: '',
        statusID: ''
    })

    const [totalValues, setTotalValues] = useState({
        totalAssQuantity: 0,
        totalComQuantity: 0,
        totalgrossAmount: 0,
        totalallowance: 0,
        totalExtraPayment: 0,
        totalExtraHazira: 0,
        totalAmount: 0,
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
    const [status, setStatus] = useState([]);
    const [gangs, setGangs] = useState([]);
    const [initialState, setInitialState] = useState(false);
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

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission(), getJob(), GetEmployeeTypesData());
    }, []);

    useEffect(() => {
        if (!initialState) {
            trackPromise(getPermission());
        }
    }, []);

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID());
        trackPromise(GetDivisionDetailsByGroupID());
    }, [dailyWagesDataList.groupID]);

    useEffect(() => {
        setDailyWagesDataList((prevState) => ({
            ...prevState,
            costCenterID: "0"
        }));
    }, [dailyWagesDataList.groupID]);

    useEffect(() => {
        if (initialState) {
            setDailyWagesDataList((prevState) => ({
                ...prevState,
                gardenID: 0,
                payPointID: 0
            }));
        }
    }, [dailyWagesDataList.groupID, initialState]);

    useEffect(() => {
        if (initialState) {
            setDailyWagesDataList((prevState) => ({
                ...prevState,
                payPointID: 0
            }));
        }
    }, [dailyWagesDataList.gardenID, initialState]);

    useEffect(() => {
        trackPromise(
            getCostCenterDetailsByGardenID()
        )
    }, [dailyWagesDataList.gardenID]);

    useEffect(() => {
        setOffDayCashPaymentData([]);
    }, [dailyWagesDataList]);

    useEffect(() => {
        if (offDayCashPaymentData.length != 0) {
            calculateTotalQty()
        }
    }, [offDayCashPaymentData]);

    useEffect(() => {
        setOffDayCashPaymentData([])
    }, [selectedOptionsstatus]);

    useEffect(() => {
        setOffDayCashPaymentData([])
    }, [selectedOptions]);

    const handleLimitChange = (event) => {
        setLimit(event.target.value);
    };
    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    useEffect(() => {
        if (dailyWagesDataList.costCenterID != 0) {
            getGangDetailsByDivisionID();
        }
    }, [dailyWagesDataList.costCenterID]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWDAILYWAGESREPORT');

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

        setDailyWagesDataList({
            ...dailyWagesDataList,
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
        var response = await services.getEstateDetailsByGroupID(dailyWagesDataList.groupID);
        setGardens(response);
    };

    async function getGangDetailsByDivisionID() {
        var response = await services.getGangDetailsByDivisionID(dailyWagesDataList.costCenterID);
        var newOptionArray = gangs;
        for (var i = 0; i < response.length; i++) {
            newOptionArray.push({ label: response[i].gangName, value: response[i].gangID })
        }
        setGangs(newOptionArray);
    };

    async function getCostCenterDetailsByGardenID() {
        var response = await services.getDivisionDetailsByEstateID(dailyWagesDataList.gardenID);
        const elementCount = response.reduce((count) => count + 1, 0);
        var generated = generateDropDownMenu(response)
        if (elementCount === 1) {
            setDailyWagesDataList((prevState) => ({
                ...prevState,
                costCenterID: generated[0].props.value,
            }));
        }
        setCostCenters(response);
    };

    async function GetDivisionDetailsByGroupID() {
        const result = await services.GetDivisionDetailsByGroupID(dailyWagesDataList.groupID);
        setPayPoints(result)
    }

    async function GetEmployeeTypesData() {
        const result = await services.GetEmployeeTypesData();
        var newOptionArray = empType;
        for (var i = 0; i < result.length; i++) {
            if (result[i].employeeTypeID !== 3 && result[i].employeeTypeID !== 4 && result[i].employeeTypeID !== 5) {
                newOptionArray.push({ label: result[i].employeeTypeName, value: result[i].employeeTypeID })
            }
        }
        newOptionArray.splice()
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

    async function GetDetails() {
        let model = {
            groupID: parseInt(dailyWagesDataList.groupID),
            gardenID: parseInt(dailyWagesDataList.gardenID),
            payPointID: parseInt(dailyWagesDataList.payPointID),
            date: new Date(dailyWagesDataList.date),
            employeeTypeID: selectedOptions.map(x => x.value).join(','),
            gangID: selectedOptions1.map(x => x.value).join(','),
            statusID: selectedOptionsstatus.map(x => x.value).join(','),
            registrationNumber: dailyWagesDataList.registrationNumber,
        }
        getSelectedDropdownValuesForReport(model);
        const response = await services.GetOffDayCashPaymentDetails(model);
        if (response.statusCode == "Success" && response.data != null) {
            setOffDayCashPaymentData(response.data);
            createDataForExcel(response.data);
        }
        else {
            alert.error(response.message);
        }
    }

    function calculateTotalQty() {
        const totalAssQuantity = offDayCashPaymentData.reduce((accumulator, current) => accumulator + current.targetQuantity, 0);
        const totalComQuantity = offDayCashPaymentData.reduce((accumulator, current) => accumulator + current.completedQuantity, 0);
        const totalgrossAmount = offDayCashPaymentData.reduce((accumulator, current) => accumulator + current.amount, 0);
        const totalallowance = offDayCashPaymentData.reduce((accumulator, current) => accumulator + current.allowance, 0);
        const totalExtraPayment = offDayCashPaymentData.reduce((accumulator, current) => accumulator + current.extraPayment, 0);
        const totalExtraHazira = offDayCashPaymentData.reduce((accumulator, current) => accumulator + current.extraHazira, 0);
        const totalAmount = offDayCashPaymentData.reduce((accumulator, current) => accumulator + current.amount + current.allowance + current.extraPayment + current.extraHazira, 0);
        setTotalValues({
            ...totalValues,
            totalAssQuantity: totalAssQuantity,
            totalComQuantity: totalComQuantity,
            totalgrossAmount: totalgrossAmount,
            totalallowance: totalallowance,
            totalExtraPayment: totalExtraPayment,
            totalExtraHazira: totalExtraHazira,
            totalAmount: totalAmount,
        })
    };

    async function createDataForExcel(array) {
        var res = [];

        if (array != null) {
            array.map(x => {
                var vr = {
                    'Emp.ID': x.registrationNumber,
                    'Emp.Name': x.employeeName,
                    'Emp.Type': x.employeeTypeName,
                    'Job Type': x.jobName,
                    // 'Ass.Qty': x.targetQuantity.toFixed(2),
                    // 'Com.Qty': x.completedQuantity.toFixed(2),
                    'Amount': x.amount.toFixed(2),
                    'Allowances(BCS)': x.allowance.toFixed(2),
                    'Extra Payment': x.extraPayment.toFixed(2),
                    'Extra Hazira': x.extraHazira.toFixed(2),
                    'Total Amount': (x.amount + x.allowance + x.extraPayment + x.extraHazira).toFixed(2)
                };
                res.push(vr);
            });
            var vr = {
                'Emp.ID': 'Total',
                // 'Ass.Qty': totalValues.totalAssQuantity.toFixed(2),
                // 'Com.Qty': totalValues.totalComQuantity.toFixed(2),
                'Amount': totalValues.totalgrossAmount.toFixed(2),
                'Allowances(BCS)': totalValues.totalallowance.toFixed(2),
                'Extra Payment': totalValues.totalExtraPayment.toFixed(2),
                'Extra Hazira': totalValues.totalExtraHazira.toFixed(2),
                'Total Amount': totalValues.totalAmount.toFixed(2)
            };
            res.push(vr);
            res.push([]);
            var vr = {
                'Emp.ID': 'Garden : ' + selectedSearchValues.gardenName,
                'Emp.Name': 'Division : ' + selectedSearchValues.costCenterName,
                'Emp.Type': selectedSearchValues.employeeTypeID === "" ? 'Emp.Type : All Emp.Types' : 'Emp.Type : ' + selectedSearchValues.employeeTypeID,
                'Job Type': selectedSearchValues.statusID === "" ? 'Job Type : All' : 'Job Type :' + selectedSearchValues.statusID,
                'Amount': 'Date : ' + selectedSearchValues.date
            };
            res.push(vr);
        }

        return res;
    }

    async function createFile() {
        var file = await createDataForExcel(offDayCashPaymentData);
        var settings = {
            sheetName: 'Daily Wages Details Report',
            fileName:
                'Daily Wages Details Report - ' +
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
                sheet: 'Daily Wages Details Report',
                columns: tempcsvHeaders,
                content: file
            }
        ];

        xlsx(dataA, settings);
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
        setDailyWagesDataList({
            ...dailyWagesDataList,
            [e.target.name]: value
        });

    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: groups[searchForm.groupID],
            gardenName: gardens[searchForm.gardenID],
            costCenterName: costCenters[searchForm.payPointID],
            date: dailyWagesDataList.date,
            employeeTypeID: selectedOptions.map(x => x.label).join(','),
            statusID: selectedOptionsstatus.map(x => x.label).join(','),
        })
    }

    async function getJob() {
        const status = [
            { value: 1, label: 'Plucking' },
            { value: 2, label: 'Non Plucking' }
        ];
        setStatus(status);
    }

    return (
        <Page className={classes.root} title={title}>
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: dailyWagesDataList.groupID,
                        gardenID: dailyWagesDataList.gardenID,
                        payPointID: dailyWagesDataList.payPointID,
                        date: dailyWagesDataList.date,
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Business Division is required').min("1", 'Business Division is required'),
                            gardenID: Yup.number().required('Location is required').min("1", 'Location is required'),
                            date: Yup.date().required('Date is required')
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
                                                <Grid item md={3} xs={8}>
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
                                                        value={dailyWagesDataList.groupID}
                                                        variant="outlined"
                                                        id="groupID"
                                                        size='small'

                                                    >
                                                        <MenuItem value="0">--Select Business Division--</MenuItem>
                                                        {generateDropDownMenu(groups)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={8}>
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
                                                        value={dailyWagesDataList.gardenID}
                                                        variant="outlined"
                                                        id="gardenID"
                                                        size='small'

                                                    >
                                                        <MenuItem value="0">--Select Location--</MenuItem>
                                                        {generateDropDownMenu(gardens)}
                                                    </TextField>
                                                </Grid>
                                                {/* <Grid item md={3} xs={8}>
                                                    <InputLabel shrink id="costCenterID">
                                                        Cost Center *
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="costCenterID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={dailyWagesDataList.costCenterID}
                                                        variant="outlined"
                                                        id="costCenterID"
                                                        size='small'
                                                    >
                                                        <MenuItem value="0">--Select Cost Center--</MenuItem>
                                                        {generateDropDownMenu(costCenters)}
                                                    </TextField>
                                                </Grid> */}
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="payPointID">
                                                        Pay Point
                                                    </InputLabel>
                                                    <TextField select fullWidth
                                                        size='small'
                                                        id="payPointID"
                                                        name="payPointID"
                                                        value={dailyWagesDataList.payPointID}
                                                        type="text"
                                                        variant="outlined"
                                                        onChange={(e) => handleChange(e)}
                                                    >
                                                        <MenuItem value="0">--All Pay Point--</MenuItem>
                                                        {generateDropDownMenu(payPoints)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={8}>
                                                    <InputLabel shrink id="date">
                                                        Date *
                                                    </InputLabel>
                                                    <TextField
                                                        error={Boolean(touched.date && errors.date)}
                                                        helperText={touched.date && errors.date}
                                                        fullWidth
                                                        size='small'
                                                        name="date"
                                                        type="date"
                                                        value={dailyWagesDataList.date}
                                                        onChange={(e) => handleChange(e)}
                                                        variant="outlined"
                                                        id="date"
                                                    />
                                                </Grid>
                                                <Grid item md={3} xs={8}>
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
                                                <Grid item md={3} xs={8}>
                                                    <InputLabel shrink id="statusID">
                                                        Job Type
                                                    </InputLabel>
                                                    <CustomMultiSelect
                                                        items={status}
                                                        getOptionLabel={getOptionLabelstatus}
                                                        getOptionDisabled={getOptionDisabledstatus}
                                                        selectedValues={selectedOptionsstatus}
                                                        placeholder="Plucking/Non Plucking"
                                                        selectAllLabel="Select all"
                                                        onToggleOption={handleToggleOptionstatus}
                                                        onClearOptions={handleClearOptionsstatus}
                                                        onSelectAll={handleSelectAllstatus}
                                                    />
                                                </Grid>
                                                <Grid item md={3} xs={12} >
                                                    <InputLabel shrink id="registrationNumber">
                                                        Emp.ID
                                                    </InputLabel>
                                                    <TextField
                                                        fullWidth
                                                        size='small'
                                                        name="registrationNumber"
                                                        onChange={(e) => handleChange(e)}
                                                        value={dailyWagesDataList.registrationNumber}
                                                        variant="outlined"
                                                        id="registrationNumber"
                                                    >
                                                    </TextField>
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
                                                {offDayCashPaymentData.length > 0 ?
                                                    <TableContainer component={Paper}>
                                                        <Table className={classes.table} aria-label="simple table">
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Emp.ID</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Emp.Name</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Emp.Type</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Job Type</TableCell>
                                                                    {/* <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Ass.Qty</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Com.Qty</TableCell> */}
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Amount</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Allowances(BCS)</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Extra Payment</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Extra Hazira</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Total Amount</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {offDayCashPaymentData.slice(page * limit, page * limit + limit).map((row, i) => (
                                                                    <TableRow key={i}>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.registrationNumber}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.employeeName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.employeeTypeName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.jobName}</TableCell>
                                                                        {/* <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.targetQuantity.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.completedQuantity.toFixed(2)}</TableCell> */}
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.amount.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.jobName == "Plucking" ? '-' : row.allowance.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.jobName == "Plucking" ? '-' : row.extraPayment.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.jobName == "Plucking" ? '-' : row.extraHazira.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {(row.amount + row.allowance + row.extraPayment + row.extraHazira).toFixed(2)}</TableCell>
                                                                    </TableRow>
                                                                )
                                                                )}
                                                            </TableBody>
                                                            <TableRow>
                                                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}><b>Total</b></TableCell>
                                                                <TableCell component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }} ></TableCell>
                                                                <TableCell component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }} ></TableCell>
                                                                <TableCell component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }} ></TableCell>
                                                                {/* <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                                                    <b> {totalValues.totalAssQuantity.toFixed(2)} </b>
                                                                </TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                                                    <b> {totalValues.totalComQuantity.toFixed(2)} </b>
                                                                </TableCell> */}
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                                                    <b> {totalValues.totalgrossAmount.toFixed(2)} </b>
                                                                </TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                                                    <b> {totalValues.totalallowance.toFixed(2)} </b>
                                                                </TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                                                    <b> {totalValues.totalExtraPayment.toFixed(2)} </b>
                                                                </TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                                                    <b> {totalValues.totalExtraHazira.toFixed(2)} </b>
                                                                </TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                                                    <b> {totalValues.totalAmount.toFixed(2)} </b>
                                                                </TableCell>
                                                            </TableRow>
                                                        </Table>
                                                        <TablePagination
                                                            component="div"
                                                            count={offDayCashPaymentData.length}
                                                            onChangePage={handlePageChange}
                                                            onChangeRowsPerPage={handleLimitChange}
                                                            page={page}
                                                            rowsPerPage={limit}
                                                            rowsPerPageOptions={[5, 10, 25]}
                                                        />
                                                    </TableContainer> : null}
                                            </Box>
                                        </CardContent>
                                        {offDayCashPaymentData.length > 0 ?
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
                                                    documentTitle={"Daily Wages Details Report"}
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
                                                        searchData={selectedSearchValues} offDayCashPaymentData={offDayCashPaymentData}
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