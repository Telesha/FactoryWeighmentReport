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
import moment from 'moment';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

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
    },
    zeroQuantityRow: {
        backgroundColor: '#f5d46f',
    },

}));

const screenCode = 'OFFDAYCASHPAYMENTREPORT';

export default function OffDayCashPaymentReport(props) {
    const [title, setTitle] = useState("Off Day Cash Payment Report - Plucking")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [gardens, setGardens] = useState([]);
    const [costCenters, setCostCenters] = useState();
    const [offDayCashPaymentData, setOffDayCashPaymentData] = useState([]);
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [empTypes, setEmpTypes] = useState([]);
    const [gangs, setGangs] = useState([]);
    const [operators, setOperators] = useState([]);
    const [offDayCashPaymentDataList, setOffDayCashPaymentDataList] = useState({
        groupID: '0',
        gardenID: '0',
        costCenterID: '0',
        empTypeID: '0',
        operatorID: '0',
        gangID: '0',
        date: new Date().toISOString().substr(0, 10)
    })

    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: "0",
        gardenName: "0",
        costCenterName: "0",
        empTypeName: '0',
        operatorName: '0',
        gangName: '0',
        date: ''
    })

    const [totalValues, setTotalValues] = useState({
        totalBroughtForward: 0,
        totalQuantity: 0,
        totalOfTotalAmount: 0,
        totalNetAmount: 0,
        totalPaidAmount: 0,
        totalCarryForward: 0,
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

    //MultiSelect Sections
    const [selectedOptions1, setSelectedOptions1] = useState([]);
    const getOptionLabel1 = option => `${option.label}`;
    const getOptionDisabled1 = option => option.value === "foo";
    const handleToggleOption1 = selectedOptions =>
        setSelectedOptions1(selectedOptions);
    const handleClearOptions1 = () => setSelectedOptions1([]);
    const handleSelectAll1 = isSelected => {
        if (isSelected) {
            setSelectedOptions1(empTypes);
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
            setSelectedOptions2(gangs);
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
            setSelectedOptions3(operators);
        } else {
            handleClearOptions3();
        }
    };

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission(), GetEmployeeTypesData());
    }, []);

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID());
    }, [offDayCashPaymentDataList.groupID]);

    useEffect(() => {
        setOffDayCashPaymentDataList((prevState) => ({
            ...prevState,
            costCenterID: "0"
        }));
    }, [offDayCashPaymentDataList.groupID]);

    useEffect(() => {
        trackPromise(
            getCostCenterDetailsByGardenID()
        )
    }, [offDayCashPaymentDataList.gardenID]);

    useEffect(() => {
        setOffDayCashPaymentData([])
    }, [offDayCashPaymentDataList.gardenID]);

    useEffect(() => {
        setOffDayCashPaymentData([])
    }, [offDayCashPaymentDataList.costCenterID]);

    useEffect(() => {
        setOffDayCashPaymentData([])
    }, [offDayCashPaymentDataList.date]);

    useEffect(() => {
        if (offDayCashPaymentData.length != 0) {
            calculateTotalQty()
        }
    }, [offDayCashPaymentData]);

    useEffect(() => {
        setOffDayCashPaymentData([]);
    }, [offDayCashPaymentDataList.date]);

    useEffect(() => {
        setOffDayCashPaymentData([]);
    }, [offDayCashPaymentDataList.empTypeID]);

    useEffect(() => {
        setOffDayCashPaymentData([]);
    }, [offDayCashPaymentDataList.factoryJobID]);

    useEffect(() => {
        setOffDayCashPaymentData([]);
    }, [selectedOptions1]);

    useEffect(() => {
        setOffDayCashPaymentData([]);
    }, [selectedOptions2]);

    useEffect(() => {
        setOffDayCashPaymentData([]);
    }, [selectedOptions3]);

    useEffect(() => {
        setOffDayCashPaymentData([]);
    }, [offDayCashPaymentDataList.costCenterID]);

    useEffect(() => {
        if (offDayCashPaymentDataList.costCenterID != "0") {
            getGangDetailsByDivisionID();
        }
    }, [offDayCashPaymentDataList.costCenterID]);

    useEffect(() => {
        trackPromise(
            GetOperatorListByDateAndGardenIDFromOffDayCashPlucking()
        )
    }, [offDayCashPaymentDataList.gardenID, offDayCashPaymentDataList.date]);

    const handleLimitChange = (event) => {
        setLimit(event.target.value);
    };
    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWOFFDAYCASHPAYMENTREPORT');

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

        setOffDayCashPaymentDataList({
            ...offDayCashPaymentDataList,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            gardenID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(offDayCashPaymentDataList.groupID);
        setGardens(response);
    };

    async function GetEmployeeTypesData() {
        const result = await services.GetEmployeeTypesData();
        var newOptionArray = empTypes;
        for (var i = 0; i < result.length; i++) {
            newOptionArray.push({ label: result[i].employeeTypeName, value: result[i].employeeTypeID })
        }
        setEmpTypes(newOptionArray);
    }


    async function getGangDetailsByDivisionID() {
        var response = await services.getGangDetailsByDivisionID(offDayCashPaymentDataList.costCenterID);
        var newOptionArray = gangs;
        for (var i = 0; i < response.length; i++) {
            newOptionArray.push({ label: response[i].gangName, value: response[i].gangID })
        }
        setGangs(newOptionArray);
    };

    async function GetOperatorListByDateAndGardenIDFromOffDayCashPlucking() {
        const result = await services.GetOperatorListByDateAndGardenIDFromOffDayCashPlucking(offDayCashPaymentDataList.gardenID, moment(offDayCashPaymentDataList.date.toString()).format().split('T')[0]);
        var newOptionArray = operators;
        for (var i = 0; i < result.length; i++) {
            newOptionArray.push({ label: result[i].operatorName, value: result[i].operatorID })
        }
        setOperators(newOptionArray);
    }


    async function getCostCenterDetailsByGardenID() {
        var response = await services.getDivisionDetailsByEstateID(offDayCashPaymentDataList.gardenID);
        const elementCount = response.reduce((count) => count + 1, 0);
        var generated = generateDropDownMenu(response)
        if (elementCount === 1) {
            setOffDayCashPaymentDataList((prevState) => ({
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
            groupID: parseInt(offDayCashPaymentDataList.groupID),
            gardenID: parseInt(offDayCashPaymentDataList.gardenID),
            costCenterID: parseInt(offDayCashPaymentDataList.costCenterID),
            applicableDate: moment(offDayCashPaymentDataList.date.toString()).format('YYYY-MM-DD').split('T')[0],
            empTypeID: selectedOptions1.map(x => x.value).join(', '),
            gangID: selectedOptions2.map(x => x.value).join(', '),
            operatorID: selectedOptions3.map(x => x.value).join(', ')
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
        const totalBroughtForward = offDayCashPaymentData.reduce((accumulator, current) => accumulator + current.broughtForward, 0);
        const totalQuantity = offDayCashPaymentData.reduce((accumulator, current) => accumulator + current.quantity, 0);
        const totalOfTotalAmount = offDayCashPaymentData.reduce((accumulator, current) => accumulator + current.totalAmount, 0);
        const totalNetAmount = offDayCashPaymentData.reduce((accumulator, current) => accumulator + current.netAmount, 0);
        const totalPaidAmount = offDayCashPaymentData.reduce((accumulator, current) => accumulator + current.paidAmount, 0);
        const totalCarryForward = offDayCashPaymentData.reduce((accumulator, current) => accumulator + current.carryForward, 0);
        setTotalValues({
            ...totalValues,
            totalBroughtForward: totalBroughtForward,
            totalQuantity: totalQuantity,
            totalOfTotalAmount: totalOfTotalAmount,
            totalNetAmount: totalNetAmount,
            totalPaidAmount: totalPaidAmount,
            totalCarryForward: totalCarryForward
        })
    };

    async function createDataForExcel(array) {
        var res = [];

        if (array != null) {
            array.map(x => {
                var vr = {
                    'Reg.No': x.registrationNumber,
                    'Emp.Name': x.employeeName,
                    'Emp.Type': x.employeeType,
                    'B.FWRD': x.broughtForward.toFixed(2),
                    'Quantity(Kg)': x.quantity.toFixed(2),
                    'Total Amount': x.amount.toFixed(2),
                    'Net Amount': x.totalAmount.toFixed(2),
                    'Paid Amount': x.paidAmount.toFixed(2),
                    'C.FWRD': x.carryForward.toFixed(2),
                };
                res.push(vr);
            });
            var vr = {
                'Reg.No': 'Total',
                'B.FWRD': totalValues.totalBroughtForward.toFixed(2),
                'Quantity(Kg)': totalValues.totalQuantity.toFixed(2),
                'Total Amount': totalValues.totalOfTotalAmount.toFixed(2),
                'Net Amount': totalValues.totalNetAmount.toFixed(2),
                'Paid Amount': totalValues.totalPaidAmount.toFixed(2),
                'C.FWRD': totalValues.totalCarryForward.toFixed(2),
            };
            res.push(vr);
            res.push([]);
            var vr = {
                'Reg.No': 'Business Division: ' + selectedSearchValues.groupName,
                'Emp.Name': 'Location: ' + selectedSearchValues.gardenName,
                'Emp.Type': selectedSearchValues.costCenterName === undefined ? 'Sub Division: All Sub Divisions' : 'Sub Division: ' + selectedSearchValues.costCenterName,
                'B.FWRD': 'Date: ' + selectedSearchValues.date,
                'Quantity(Kg)': selectedSearchValues.empTypeName === "" ? 'Employee Type : All Employee Types' : 'Employee Type: ' + selectedSearchValues.empTypeName,
                'Total Amount': selectedSearchValues.gangName === "" ? 'Duffa : All Duffas' : 'Duffa: ' + selectedSearchValues.gangName,
                'Net Amount': selectedSearchValues.operatorName === "" ? 'Operator : All Operators' : 'Operator: ' + selectedSearchValues.operatorName,
            };
            res.push(vr);
        }

        return res;
    }

    async function createFile() {
        var file = await createDataForExcel(offDayCashPaymentData);
        var settings = {
            sheetName: 'Off Day Cash Report - Plucking',
            fileName:
                'Off Day Cash Payment Report - Plucking - ' +
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
                sheet: 'Off Day Cash Report - Plucking',
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
        setOffDayCashPaymentDataList({
            ...offDayCashPaymentDataList,
            [e.target.name]: value
        });
    }

    function handleDateChange(value) {
        setOffDayCashPaymentDataList({
            ...offDayCashPaymentDataList,
            date: value,
        });
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: groups[searchForm.groupID],
            gardenName: gardens[searchForm.gardenID],
            costCenterName: costCenters[searchForm.costCenterID],
            date: offDayCashPaymentDataList.date,
            empTypeName: selectedOptions1.map(x => x.label).join(', '),
            gangName: selectedOptions2.map(x => x.label).join(', '),
            operatorName: selectedOptions3.map(x => x.label).join(', ')
        })
    }

    return (
        <Page className={classes.root} title={title}>
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: offDayCashPaymentDataList.groupID,
                        gardenID: offDayCashPaymentDataList.gardenID,
                        costCenterID: offDayCashPaymentDataList.costCenterID,
                        date: offDayCashPaymentDataList.date,
                        empTypeID: offDayCashPaymentDataList.empTypeID,
                        gangID: offDayCashPaymentDataList.gangID,
                        operatorID: offDayCashPaymentDataList.operatorID
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Business Division is required').min("1", 'Business Division is required'),
                            gardenID: Yup.number().required('Location is required').min("1", 'Location is required'),
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
                                                <Grid item md={3} xs={12} >
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
                                                        value={offDayCashPaymentDataList.groupID}
                                                        variant="outlined"
                                                        id="groupID"
                                                        size='small'

                                                    >
                                                        <MenuItem value="0">--Select Business Division--</MenuItem>
                                                        {generateDropDownMenu(groups)}
                                                    </TextField>
                                                </Grid>

                                                <Grid item md={3} xs={12} >
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
                                                        value={offDayCashPaymentDataList.gardenID}
                                                        variant="outlined"
                                                        id="gardenID"
                                                        size='small'

                                                    >
                                                        <MenuItem value="0">--Select Location--</MenuItem>
                                                        {generateDropDownMenu(gardens)}
                                                    </TextField>
                                                </Grid>

                                                <Grid item md={3} xs={12} >
                                                    <InputLabel shrink id="costCenterID">
                                                        Sub Division
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="costCenterID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={offDayCashPaymentDataList.costCenterID}
                                                        variant="outlined"
                                                        id="costCenterID"
                                                        size='small'

                                                    >
                                                        <MenuItem value="0">--Select Sub Division--</MenuItem>
                                                        {generateDropDownMenu(costCenters)}
                                                    </TextField>
                                                </Grid>

                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="date">
                                                        Date *
                                                    </InputLabel>
                                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                        <KeyboardDatePicker
                                                            error={Boolean(touched.date && errors.date)}
                                                            helperText={touched.date && errors.date}
                                                            autoOk
                                                            fullWidth
                                                            variant="inline"
                                                            format="yyyy/MM/dd"
                                                            margin="dense"
                                                            id="date"
                                                            value={offDayCashPaymentDataList.date}
                                                            onChange={(e) => handleDateChange(e)}
                                                            KeyboardButtonProps={{
                                                                'aria-label': 'change date',
                                                            }}
                                                        />
                                                    </MuiPickersUtilsProvider>
                                                </Grid>

                                                <Grid item md={3} xs={12} >
                                                    <InputLabel shrink id="empTypeID">
                                                        Employee Type
                                                    </InputLabel>
                                                    <CustomMultiSelect
                                                        items={empTypes}
                                                        getOptionLabel={getOptionLabel1}
                                                        getOptionDisabled={getOptionDisabled1}
                                                        selectedValues={selectedOptions1}
                                                        placeholder="--Select Employee Types--"
                                                        selectAllLabel="Select all"
                                                        onToggleOption={handleToggleOption1}
                                                        onClearOptions={handleClearOptions1}
                                                        onSelectAll={handleSelectAll1}
                                                    />
                                                </Grid>
                                                <Grid item md={3} xs={12} >
                                                    <InputLabel shrink id="gangID">
                                                        Duffa
                                                    </InputLabel>
                                                    <CustomMultiSelect
                                                        items={gangs}
                                                        getOptionLabel={getOptionLabel2}
                                                        getOptionDisabled={getOptionDisabled1}
                                                        selectedValues={selectedOptions2}
                                                        placeholder="--Select Duffas--"
                                                        selectAllLabel="Select all"
                                                        onToggleOption={handleToggleOption2}
                                                        onClearOptions={handleClearOptions2}
                                                        onSelectAll={handleSelectAll2}
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
                                                        placeholder="--Select Operators--"
                                                        selectAllLabel="Select all"
                                                        onToggleOption={handleToggleOption3}
                                                        onClearOptions={handleClearOptions3}
                                                        onSelectAll={handleSelectAll3}
                                                    />
                                                </Grid>
                                                <Grid item md={3} xs={12} >
                                                    <Box display="flex" flexDirection="row-reverse" justifyContent="right" p={2}>
                                                        <Button
                                                            color="primary"
                                                            type="submit"
                                                            variant="contained"
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
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Reg.No</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Emp.Name</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Emp.Type</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>B.FWRD</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Quantity(Kg)</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Total Amount</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Net Amount</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Paid Amount</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>C.FWRD</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {offDayCashPaymentData.slice(page * limit, page * limit + limit).map((row, i) => (
                                                                    <TableRow
                                                                        key={i}
                                                                        className={row.quntity === 0 ? classes.zeroQuantityRow : ""}
                                                                    >
                                                                        <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black" }}> {row.registrationNumber}</TableCell>
                                                                        <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black" }}> {row.employeeName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black" }}> {row.employeeType}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.broughtForward.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.quantity.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.totalAmount.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.netAmount.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.paidAmount.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.carryForward.toFixed(2)}</TableCell>
                                                                    </TableRow>
                                                                )
                                                                )}
                                                            </TableBody>
                                                            <TableRow>
                                                                <TableCell align={'center'} style={{ borderBottom: "none", border: "1px solid black" }}><b>Total</b></TableCell>
                                                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                                                </TableCell>
                                                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                                                </TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                                                    <b> {totalValues.totalBroughtForward.toFixed(2)} </b>
                                                                </TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                                                    <b> {totalValues.totalQuantity.toFixed(2)} </b>
                                                                </TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                                                    <b> {totalValues.totalOfTotalAmount.toFixed(2)} </b>
                                                                </TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                                                    <b> {totalValues.totalNetAmount.toFixed(2)} </b>
                                                                </TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                                                    <b> {totalValues.totalPaidAmount.toFixed(2)} </b>
                                                                </TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                                                    <b> {totalValues.totalCarryForward.toFixed(2)} </b>
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
                                                    documentTitle={"Off Day Cash Payment Report - Plucking"}
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