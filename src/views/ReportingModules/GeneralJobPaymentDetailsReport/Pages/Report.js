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
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import xlsx from 'json-as-xlsx';
import moment from 'moment';
import { CustomMultiSelect } from 'src/utils/CustomMultiSelect';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import CircleIcon from '@mui/icons-material/Circle';

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

const screenCode = 'DAILYGENERALJOBPAYMENTDETAILSREPORT';

export default function GeneralJobPaymentDetailsReport(props) {
    const [title, setTitle] = useState("Daily Payment Details Report")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [gardens, setGardens] = useState([]);
    const [costCenters, setCostCenters] = useState();
    const [employeeCount, setEmployeeCount] = useState([]);
    const [offDayCashPaymentData, setOffDayCashPaymentData] = useState([]);
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [empType, setEmpType] = useState([]);
    const [offDayCashPaymentDataList, setOffDayCashPaymentDataList] = useState({
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
        employeeName: '',
        employeeTypeID: '',
        harvestJobTypeID: ''
    })

    const [totalValues, setTotalValues] = useState(0);

    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const componentRef = useRef();
    const navigate = useNavigate();
    const alert = useAlert();
    const [status, setStatus] = useState([]);
    const [initialState, setIsInitialState] = useState(false);
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

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission(), getJob(), GetEmployeeTypesData());
    }, []);

    useEffect(() => {
        if (!initialState) {
            trackPromise(getPermission());
        }
    }, [initialState]);

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID(), getCostCenterDetailsByGardenID());
    }, [offDayCashPaymentDataList.groupID]);

    useEffect(() => {
        setOffDayCashPaymentDataList((prevState) => ({
            ...prevState,
            costCenterID: "0"
        }));
    }, [offDayCashPaymentDataList.groupID]);

    useEffect(() => {
        setOffDayCashPaymentData([]);
    }, [offDayCashPaymentDataList]);

    useEffect(() => {
        setOffDayCashPaymentData([])
    }, [selectedOptionsstatus]);

    useEffect(() => {
        setOffDayCashPaymentData([])
    }, [selectedOptions]);

    useEffect(() => {
        if (initialState) {
            setOffDayCashPaymentDataList((prevState) => ({
                ...prevState,
                gardenID: "0",
                payPointID: "0"
            }));
        }
    }, [offDayCashPaymentDataList.groupID, initialState]);

    useEffect(() => {
        if (initialState) {
            setOffDayCashPaymentDataList((prevState) => ({
                ...prevState,
                payPointID: "0"
            }));
        }
    }, [offDayCashPaymentDataList.gardenID, initialState]);

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
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWGENERALJOBPAYMENTDETAILSREPORT');

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
        setIsInitialState(true);
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(offDayCashPaymentDataList.groupID);
        setGardens(response);
    };

    async function getCostCenterDetailsByGardenID() {
        var response = await services.GetDivisionDetailsByGroupID(offDayCashPaymentDataList.groupID);
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
            employeeTypeID: selectedOptions.map(x => x.value).join(','),
            harvestJobTypeID: selectedOptionsstatus.map(x => x.value).join(',')
        }
        getSelectedDropdownValuesForReport(model);
        const response = await services.GetOffDayCashPaymentDetails(model);
        if (response.statusCode == "Success" && response.data != null) {
            const attendanceData = response.data;
            const groupedData = attendanceData.reduce((acc, data) => {
                const key = `${data.divisionName}_${data.employeeSubCategoryName}`;
                if (!acc[key]) {
                    acc[key] = {
                        divisionName: data.divisionName,
                        employeeSubCategoryName: data.employeeSubCategoryName,
                        details: {},
                        totals: {
                            pluckQty: 0,
                            nonCashGrossAmount: 0,
                            cashGrossAmount: 0,
                            leaveGrossAmount: 0,
                            allowance: 0,
                            pfDeductionAmount: 0,
                            totalEarnings: 0,
                            totalNetPay: 0
                        },
                    };
                }
                data.details.forEach(detail => {
                    detail.detailsx.forEach(row => {
                        const regKey = detail.registrationNumber;
                        if (!acc[key].details[regKey]) {
                            acc[key].details[regKey] = {
                                registrationNumber: detail.registrationNumber,
                                employeeName: detail.employeeName,
                                taskCodes: detail.taskCodes,
                                pluckQty: 0,
                                nonCashGrossAmount: 0,
                                cashGrossAmount: 0,
                                leaveGrossAmount: 0,
                                allowance: 0,
                                pfDeductionAmount: 0,
                                totalEarnings: 0,
                                totalNetPay: 0
                            };
                        }
                        acc[key].details[regKey].pluckQty += row.pluckQty;
                        acc[key].details[regKey].nonCashGrossAmount += ((row.isCash == true && row.isHoliday == true) || (row.isCash == true && row.isHoliday == false)
                            || (row.isCash == false && row.isHoliday == true) || (row.employeeLeaveRequestID > 0)) ? 0 : row.grossAmount;
                        acc[key].details[regKey].cashGrossAmount += (row.isCash == false && row.isHoliday == false) ? (0 + row.otAmount) : (row.grossAmount + row.otAmount);
                        acc[key].details[regKey].leaveGrossAmount += (row.employeeLeaveRequestID == 0) ? 0 : row.grossAmount;
                        acc[key].details[regKey].allowance += row.allowance;
                        acc[key].details[regKey].pfDeductionAmount += row.pfDeductionAmount;
                        acc[key].details[regKey].totalEarnings += (row.grossAmount + row.allowance + row.otAmount);
                        acc[key].details[regKey].totalNetPay += ((row.grossAmount + row.allowance + row.otAmount) - row.pfDeductionAmount);

                        acc[key].totals.pluckQty += row.pluckQty;
                        acc[key].totals.nonCashGrossAmount += ((row.isCash == true && row.isHoliday == true) || (row.isCash == true && row.isHoliday == false)
                            || (row.isCash == false && row.isHoliday == true) || (row.employeeLeaveRequestID > 0)) ? 0 : row.grossAmount;
                        acc[key].totals.cashGrossAmount += (row.isCash == false && row.isHoliday == false) ? (0 + row.otAmount) : (row.grossAmount + row.otAmount);
                        acc[key].totals.leaveGrossAmount += (row.employeeLeaveRequestID == 0) ? 0 : row.grossAmount;
                        acc[key].totals.allowance += row.allowance;
                        acc[key].totals.pfDeductionAmount += row.pfDeductionAmount;
                        acc[key].totals.totalEarnings += (row.grossAmount + row.allowance + row.otAmount);
                        acc[key].totals.totalNetPay += ((row.grossAmount + row.allowance + row.otAmount) - row.pfDeductionAmount);
                    });
                });
                return acc;
            }, {});

            let uniqueRegistrationNumbersArray = [];

            const groupedArray = Object.values(groupedData).map(group => {
                Object.keys(group.details).forEach(regKey => {
                    if (!uniqueRegistrationNumbersArray.includes(regKey)) {
                        uniqueRegistrationNumbersArray.push(regKey);
                    }
                });

                return {
                    divisionName: group.divisionName,
                    employeeSubCategoryName: group.employeeSubCategoryName,
                    details: Object.values(group.details),
                    totals: group.totals
                };
            });

            const grandTotals = {
                pluckQty: 0,
                nonCashGrossAmount: 0,
                cashGrossAmount: 0,
                leaveGrossAmount: 0,
                allowance: 0,
                pfDeductionAmount: 0,
                totalEarnings: 0,
                totalNetPay: 0
            };

            groupedArray.forEach(group => {
                grandTotals.pluckQty += group.totals.pluckQty;
                grandTotals.nonCashGrossAmount += group.totals.nonCashGrossAmount;
                grandTotals.cashGrossAmount += group.totals.cashGrossAmount;
                grandTotals.leaveGrossAmount += group.totals.leaveGrossAmount;
                grandTotals.allowance += group.totals.allowance;
                grandTotals.pfDeductionAmount += group.totals.pfDeductionAmount;
                grandTotals.totalEarnings += group.totals.totalEarnings;
                grandTotals.totalNetPay += group.totals.totalNetPay;
            });
            setTotalValues(grandTotals);
            setOffDayCashPaymentData(groupedArray);
            setEmployeeCount(uniqueRegistrationNumbersArray.length)
        }
        else {
            alert.error(response.message);
        }
    }

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            array.map(data => {
                res.push({
                    'Reg.No.': 'Pay Point: ' + data.divisionName,
                    'Emp.Name': 'Category: ' + data.employeeSubCategoryName,
                    'Tasks': ' ',
                    'KGs': ' ',
                    'General': ' ',
                    'Cash': ' ',
                    'Leave': ' ',
                    'O.T': ' ',
                    'Allowance': ' ',
                    'Gross': ' ',
                    'PF': ' ',
                    'Net': ' '
                });

                data.details.map(row => {
                    var vr = {
                        'Reg.No.': row.registrationNumber,
                        'Emp.Name': row.employeeName,
                        'Tasks': row.taskCodes,
                        'KGs': row.pluckQty == 0 ? '-' : row.pluckQty.toFixed(2),
                        'General': row.nonCashGrossAmount == 0 ? '-' : row.nonCashGrossAmount.toFixed(2),
                        'Cash': row.cashGrossAmount == 0 ? '-' : row.cashGrossAmount.toFixed(2),
                        'Leave': row.leaveGrossAmount == 0 ? '-' : row.leaveGrossAmount.toFixed(2),
                        'O.T': '-',
                        'Allowance': row.allowance == 0 ? '-' : row.allowance.toFixed(2),
                        'Gross': row.totalEarnings == 0 ? '-' : row.totalEarnings.toFixed(2),
                        'PF': row.pfDeductionAmount == 0 ? '-' : Math.round(row.pfDeductionAmount).toFixed(2),
                        'Net': row.totalNetPay == 0 ? '-' : Math.floor(row.totalNetPay).toFixed(2)
                    };
                    res.push(vr);
                });

                res.push({
                    'Reg.No.': 'Sub Total',
                    'KGs': data.totals.pluckQty == 0 ? '-' : data.totals.pluckQty.toFixed(2),
                    'General': data.totals.nonCashGrossAmount == 0 ? '-' : data.totals.nonCashGrossAmount.toFixed(2),
                    'Cash': data.totals.cashGrossAmount == 0 ? '-' : data.totals.cashGrossAmount.toFixed(2),
                    'Leave': data.totals.leaveGrossAmount == 0 ? '-' : data.totals.leaveGrossAmount.toFixed(2),
                    'O.T': '-',
                    'Allowance': data.totals.allowance == 0 ? '-' : data.totals.allowance.toFixed(2),
                    'Gross': data.totals.totalEarnings == 0 ? '-' : data.totals.totalEarnings.toFixed(2),
                    'PF': data.totals.pfDeductionAmount == 0 ? '-' : Math.round(data.totals.pfDeductionAmount).toFixed(2),
                    'Net': data.totals.totalNetPay == 0 ? '-' : Math.floor(data.totals.totalNetPay).toFixed(2)
                });
            });

            res.push({
                'Reg.No.': 'Grand Total',
                'KGs': totalValues.pluckQty == 0 ? '-' : totalValues.pluckQty.toFixed(2),
                'General': totalValues.nonCashGrossAmount == 0 ? '-' : totalValues.nonCashGrossAmount.toFixed(2),
                'Cash': totalValues.cashGrossAmount == 0 ? '-' : totalValues.cashGrossAmount.toFixed(2),
                'Leave': totalValues.leaveGrossAmount == 0 ? '-' : totalValues.leaveGrossAmount.toFixed(2),
                'O.T': '-',
                'Allowance': totalValues.allowance == 0 ? '-' : totalValues.allowance.toFixed(2),
                'Gross': totalValues.totalEarnings == 0 ? '-' : totalValues.totalEarnings.toFixed(2),
                'PF': totalValues.pfDeductionAmount == 0 ? '-' : Math.round(totalValues.pfDeductionAmount).toFixed(2),
                'Net': totalValues.totalNetPay == 0 ? '-' : Math.floor(totalValues.totalNetPay).toFixed(2)
            });

            res.push({});
            res.push({
                'Reg.No.': selectedSearchValues.gardenName === undefined ? 'Location : All Locations' : 'Location : ' + selectedSearchValues.gardenName,
                'Emp.Name': selectedSearchValues.costCenterName === undefined ? 'Pay Point : All Pay Points' : 'Pay Point : ' + selectedSearchValues.costCenterName,
                'Tasks': selectedSearchValues.employeeTypeID === "" ? 'Employee Category : All Employee Categories' : 'Employee Category : ' + selectedSearchValues.employeeTypeID,
                'KGs': 'Date : ' + moment(selectedSearchValues.date).format('YYYY-MM-DD')
            });
        }
        return res;
    }

    async function createFile() {
        var file = await createDataForExcel(offDayCashPaymentData);
        var settings = {
            sheetName: 'Daily Payment Details Report',
            fileName:
                'Daily Payment Details Report - ' +
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
                sheet: 'Daily Payment Details Report',
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
            employeeTypeID: selectedOptions.map(x => x.label).join(','),
            harvestJobTypeID: selectedOptionsstatus.map(x => x.label).join(',')
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
                        groupID: offDayCashPaymentDataList.groupID,
                        gardenID: offDayCashPaymentDataList.gardenID,
                        costCenterID: offDayCashPaymentDataList.costCenterID,
                        date: offDayCashPaymentDataList.date,
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Business Division is required').min("1", 'Business Division is required'),
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
                                                        value={offDayCashPaymentDataList.groupID}
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
                                                        Location
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
                                                        <MenuItem value="0">--All Locations--</MenuItem>
                                                        {generateDropDownMenu(gardens)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="costCenterID">
                                                        Pay Point
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
                                                        <MenuItem value="0">--All Pay Points--</MenuItem>
                                                        {generateDropDownMenu(costCenters)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="empTypeID">
                                                        Employee Category
                                                    </InputLabel>
                                                    <CustomMultiSelect
                                                        items={empType}
                                                        getOptionLabel={getOptionLabel}
                                                        getOptionDisabled={getOptionDisabled}
                                                        selectedValues={selectedOptions}
                                                        placeholder="Employee Category"
                                                        selectAllLabel="Select all"
                                                        onToggleOption={handleToggleOption}
                                                        onClearOptions={handleClearOptions}
                                                        onSelectAll={handleSelectAll}
                                                    />
                                                </Grid>
                                                {/* <Grid item md={4} xs={8}>
                                                    <InputLabel shrink id="StatusID">
                                                        Plucking/Non Plucking
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
                                                </Grid> */}

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
                                                            format="yyyy-MM-dd"
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
                                                {offDayCashPaymentData.length > 0 ? (
                                                    <Chip
                                                        icon={<CircleIcon
                                                            fontSize='small' />}
                                                        label={"Employee Count: " + employeeCount}
                                                        color="secondary"
                                                        variant="outlined"
                                                    />
                                                ) : null}
                                                <br />
                                                <br />
                                                {offDayCashPaymentData.length > 0 ? (
                                                    <TableContainer component={Paper}>
                                                        <Table className={classes.table} aria-label="simple table" size='small'>
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }}>Reg.No.</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }}>Emp.Name</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }}>Task</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }}>KGs</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }}>General</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }}>Cash</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }}>Leave</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }}>O.T</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }}>Allowance</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }}>Gross</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }}>PF</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black' }}>Net</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {offDayCashPaymentData.map((group, i) => {
                                                                    return (
                                                                        <React.Fragment key={i}>
                                                                            <TableRow>
                                                                                <TableCell colSpan={12} component="th" scope="row" align="left" style={{ fontWeight: 'bolder', color: 'green', borderBottom: '1px solid black' }}>
                                                                                    Pay Point: {group.divisionName} <div>Category: {group.employeeSubCategoryName}</div>
                                                                                </TableCell>
                                                                            </TableRow>
                                                                            {group.details.map((data, j) => (
                                                                                <TableRow key={`${i}-${j}`}>
                                                                                    <TableCell component="th" scope="row" align="left" style={{ borderBottom: "1px dashed black" }}>{data.registrationNumber}</TableCell>
                                                                                    <TableCell component="th" scope="row" align="left" style={{ borderBottom: "1px dashed black" }}>{data.employeeName}</TableCell>
                                                                                    <TableCell component="th" scope="row" align="left" style={{ borderBottom: "1px dashed black" }}>{data.taskCodes}</TableCell>
                                                                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black" }}>{data.pluckQty == 0 ? '-' : data.pluckQty.toFixed(2)}</TableCell>
                                                                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black" }}>{data.nonCashGrossAmount == 0 ? '-' : data.nonCashGrossAmount.toFixed(2)}</TableCell>
                                                                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black" }}>{data.cashGrossAmount == 0 ? '-' : data.cashGrossAmount.toFixed(2)}</TableCell>
                                                                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black" }}>{data.leaveGrossAmount == 0 ? '-' : data.leaveGrossAmount.toFixed(2)}</TableCell>
                                                                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black" }}>{'-'}</TableCell>
                                                                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black" }}>{data.allowance == 0 ? '-' : data.allowance.toFixed(2)}</TableCell>
                                                                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black" }}>{data.totalEarnings == 0 ? '-' : data.totalEarnings.toFixed(2)}</TableCell>
                                                                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black" }}>{data.pfDeductionAmount == 0 ? '-' : Math.round(data.pfDeductionAmount).toFixed(2)}</TableCell>
                                                                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black" }}>{data.totalNetPay == 0 ? '-' : Math.floor(data.totalNetPay).toFixed(2)}</TableCell>
                                                                                </TableRow>
                                                                            ))}
                                                                            <TableRow>
                                                                                <TableCell colSpan={3} component="th" scope="row" align="left" style={{ fontWeight: 'bolder', color: 'blue', borderBottom: '1px solid black' }}>Sub Total</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ borderBottom: '1px solid black' }}>{group.totals.pluckQty == 0 ? '-' : group.totals.pluckQty.toFixed(2)}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ borderBottom: '1px solid black' }}>{group.totals.nonCashGrossAmount == 0 ? '-' : group.totals.nonCashGrossAmount.toFixed(2)}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ borderBottom: '1px solid black' }}>{group.totals.cashGrossAmount == 0 ? '-' : group.totals.cashGrossAmount.toFixed(2)}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ borderBottom: '1px solid black' }}>{group.totals.leaveGrossAmount == 0 ? '-' : group.totals.leaveGrossAmount.toFixed(2)}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ borderBottom: '1px solid black' }}>{'-'}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ borderBottom: '1px solid black' }}>{group.totals.allowance == 0 ? '-' : group.totals.allowance.toFixed(2)}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ borderBottom: '1px solid black' }}>{group.totals.totalEarnings == 0 ? '-' : group.totals.totalEarnings.toFixed(2)}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ borderBottom: '1px solid black' }}>{group.totals.pfDeductionAmount == 0 ? '-' : Math.round(group.totals.pfDeductionAmount).toFixed(2)}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ borderBottom: '1px solid black' }}>{group.totals.totalNetPay == 0 ? '-' : Math.floor(group.totals.totalNetPay).toFixed(2)}</TableCell>
                                                                            </TableRow>
                                                                        </React.Fragment>
                                                                    );
                                                                })}
                                                                <TableRow>
                                                                    <TableCell colSpan={3} component="th" scope="row" align="left" style={{ fontWeight: 'bolder', color: 'red', borderBottom: '1px solid black' }}>Grand Total</TableCell>
                                                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: '1px solid black' }}>{totalValues.pluckQty == 0 ? '-' : totalValues.pluckQty.toFixed(2)}</TableCell>
                                                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: '1px solid black' }}>{totalValues.nonCashGrossAmount == 0 ? '-' : totalValues.nonCashGrossAmount.toFixed(2)}</TableCell>
                                                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: '1px solid black' }}>{totalValues.cashGrossAmount == 0 ? '-' : totalValues.cashGrossAmount.toFixed(2)}</TableCell>
                                                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: '1px solid black' }}>{totalValues.leaveGrossAmount == 0 ? '-' : totalValues.leaveGrossAmount.toFixed(2)}</TableCell>
                                                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: '1px solid black' }}>{'-'}</TableCell>
                                                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: '1px solid black' }}>{totalValues.allowance == 0 ? '-' : totalValues.allowance.toFixed(2)}</TableCell>
                                                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: '1px solid black' }}>{totalValues.totalEarnings == 0 ? '-' : totalValues.totalEarnings.toFixed(2)}</TableCell>
                                                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: '1px solid black' }}>{totalValues.pfDeductionAmount == 0 ? '-' : Math.round(totalValues.pfDeductionAmount).toFixed(2)}</TableCell>
                                                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: '1px solid black' }}>{totalValues.totalNetPay == 0 ? '-' : Math.floor(totalValues.totalNetPay).toFixed(2)}</TableCell>
                                                                </TableRow>
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                ) : null}
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
                                                    documentTitle={"Daily Payment Details Report"}
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
                                                        totalValues={totalValues} employeeCount={employeeCount} />
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