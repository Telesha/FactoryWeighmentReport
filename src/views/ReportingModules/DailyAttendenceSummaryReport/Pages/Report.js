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

const screenCode = 'DAILYATTENDANCESUMMARYREPORT';

export default function DailyAttendaceSummaryReport(props) {
    const [title, setTitle] = useState("Daily Attendance Summary Report")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [gardens, setGardens] = useState([]);
    const [costCenters, setCostCenters] = useState();
    const [harvestingJobs, setHarvestingJobs] = useState([]);
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [employeeCount, setEmployeeCount] = useState([]);
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
    })

    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: "0",
        gardenName: "0",
        costCenterName: "0",
        date: "0",
        factoryJobName: "0",
        taskName: "0",
        fieldName: "0",
        gangName: "0",
        bookName: "",
        sirderID: ''
    })

    const [totalValues, setTotalValues] = useState({
        totalEmp: 0,
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
    const [date, setDate] = useState(new Date());
    const [gangs, setGangs] = useState([]);
    const [operator, setOperator] = useState([]);
    const [books, setbooks] = useState([]);
    const [mainHeader, setMainHeader] = useState([]);
    const [header, setHeader] = useState([]);
    const [totalRow, setTotalRow] = useState([]);
    const [csvtotalRow, setCsvTotalRow] = useState([]);
    const [allTotal, setAllTotal] = useState(0);

    //MultiSelect EmployeeType
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

    //Multiselect Sections
    // const [selectedOptions2, setSelectedOptions2] = useState([]);
    // const getOptionLabel2 = option => `${option.label}`;
    // const getOptionDisabled2 = option => option.value === "foo";
    // const handleToggleOption2 = selectedOptions =>
    //     setSelectedOptions2(selectedOptions);
    // const handleClearOptions2 = () => setSelectedOptions2([]);
    // const handleSelectAll2 = isSelected => {
    //     if (isSelected) {
    //         setSelectedOptions2(fields);
    //     } else {
    //         handleClearOptions2();
    //     }
    // };

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
    const [sirders, setSirder] = useState([]);
    //MultiSelect Operator
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

    //MultiSelect Book
    const [selectedOptionsBook, setSelectedOptionsBook] = useState([]);
    const getOptionLabelBook = option => `${option.label}`;
    const getOptionDisabledBook = option => option.value === "foo";
    const handleToggleOptionBook = selectedOptions =>
        setSelectedOptionsBook(selectedOptions);
    const handleClearOptionsBook = () => setSelectedOptionsBook([]);
    const handleSelectAllBook = isSelected => {
        if (isSelected) {
            setSelectedOptionsBook(books);
        } else {
            handleClearOptionsBook();
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

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission(), GetEmployeeTypesData(), getBookDetails());
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
        setDailyAttendanceData([])
    }, [dailyAttendanceDataList.gardenID]);

    useEffect(() => {
        setDailyAttendanceData([])
    }, [dailyAttendanceDataList.costCenterID]);

    useEffect(() => {
        setDailyAttendanceData([])
    }, [dailyAttendanceDataList.empTypeID]);

    useEffect(() => {
        if (dailyAttendanceDataList.gardenID != "0") {
            trackPromise(
                GetFactoryJobs()
            )
        }
    }, [dailyAttendanceDataList.gardenID, date]);

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
        setDailyAttendanceData([]);
    }, [dailyAttendanceDataList.taskID]);

    useEffect(() => {
        setDailyAttendanceData([]);
    }, [dailyAttendanceDataList.factoryJobID]);

    useEffect(() => {
        setDailyAttendanceData([]);
    }, [dailyAttendanceDataList.costCenterID]);

    useEffect(() => {
        setDailyAttendanceData([]);
    }, [dailyAttendanceDataList.fieldID]);

    useEffect(() => {
        setDailyAttendanceData([]);
    }, [dailyAttendanceDataList.gangID]);

    useEffect(() => {
        setDailyAttendanceData([]);
    }, [selectedOptions]);

    useEffect(() => {
        setDailyAttendanceData([]);
    }, [selectedOptions3]);

    useEffect(() => {
        setDailyAttendanceData([]);
    }, [selectedOptions1]);

    useEffect(() => {
        setDailyAttendanceData([]);
    }, [selectedOptionsBook]);

    useEffect(() => {
        setDailyAttendanceData([]);
    }, [selectedOptions4]);

    useEffect(() => {
        setDailyAttendanceData([]);
    }, [date]);

    useEffect(() => {
        trackPromise(
            GetOperatorListByDateAndGardenIDForAttendenceSummaryReport()
        )
    }, [dailyAttendanceDataList.gardenID, date]);

    const handleLimitChange = (event) => {
        setLimit(event.target.value);
    };
    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWDAILYATTENDANCESUMMARYREPORT');

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
        getSirdersForDropdown();
    }
    async function getBookDetails() {
        var response = await services.getBookDetailsForDropDown();
        var newOptionArray = [];
        var bookID = 1;
        for (var i = 0; i < response.length; i++) {
            newOptionArray.push({ label: response[i].bookName, value: bookID });
            bookID++;
        }
        setbooks(newOptionArray);
    };

    async function GetEmployeeTypesData() {
        const result = await services.GetEmployeeTypesData();
        var newOptionArray = [];
        for (var i = 0; i < result.length; i++) {
            newOptionArray.push({ label: result[i].employeeTypeName, value: result[i].employeeTypeID })
        }
        setEmpType(newOptionArray);
    }


    async function getGangDetailsByDivisionID() {
        var response = await services.getGangDetailsByDivisionID(dailyAttendanceDataList.costCenterID);
        var newOptionArray = [];
        for (var i = 0; i < response.length; i++) {
            newOptionArray.push({ label: response[i].gangName, value: response[i].gangID })
        }
        setGangs(newOptionArray);
    };

    async function getSirdersForDropdown() {
        const result = await services.getSirdersForDropdown();
        var newOptionArray = sirders;
        for (var i = 0; i < result.length; i++) {
            newOptionArray.push({ label: result[i].employeeName, value: result[i].employeeID })
        }
        setSirder(newOptionArray);
    }

    async function GetOperatorListByDateAndGardenIDForAttendenceSummaryReport() {
        const result = await services.GetOperatorListByDateAndGardenIDForAttendenceSummaryReport(dailyAttendanceDataList.gardenID, moment(date.toString()).format().split('T')[0]);
        var newOptionArray = [];
        for (var i = 0; i < result.length; i++) {
            newOptionArray.push({ label: result[i].operatorName, value: result[i].operatorID })
        }
        setOperator(newOptionArray);
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
        const result = await services.GetFactoryJobs(dailyAttendanceDataList.gardenID, date);
        setHarvestingJobs(result);
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
            groupID: parseInt(dailyAttendanceDataList.groupID),
            gardenID: parseInt(dailyAttendanceDataList.gardenID),
            costCenterID: parseInt(dailyAttendanceDataList.costCenterID),
            date: moment(date.toString()).format().split('T')[0],
            empTypeID: selectedOptions.map(x => x.value).join(','),
            operatorID: selectedOptions3.map(x => x.value).join(','),
            gangID: selectedOptions1.map(x => x.value).join(','),
            bookID: selectedOptionsBook.map(x => x.label).join(','),
            sirderID: selectedOptions4.map(x => x.label).join(',')
        }
        getSelectedDropdownValuesForReport(model);

        const response = await services.GetDetails(model);
        if (response.statusCode === "Success" && response.data !== null) {
            const countsByTask = [];
            var cloneData = _.cloneDeep(response.data)
            var result = [];
            cloneData.forEach(x => {
                x.details.forEach(y => {
                    y.details.forEach(z => {
                        const empTypeName = z.employeeTypeName;
                        var duplicateDate = result.find(y => y.operatorName === z.operatorName && y.sirderName === z.sirderName);
                        if (duplicateDate) {
                            duplicateDate[empTypeName] = duplicateDate[empTypeName] == undefined ? 0 + z.employeeCount : duplicateDate[empTypeName] + z.employeeCount;
                            duplicateDate.operatorName = z.operatorName;
                            duplicateDate.sirderName = z.sirderName;
                            duplicateDate.total = duplicateDate.total + z.employeeCount;
                        }
                        else {
                            result.push({
                                [empTypeName]: z.employeeCount,
                                operatorName: z.operatorName,
                                sirderName: z.sirderName,
                                total: z.employeeCount
                            });
                        }
                    });
                })
            })
            var results = [];
            response.data.forEach(x => {
                x.details.forEach(y => {
                    y.details.forEach(x => {
                        var duplicateDate = results.find(y => y.employeeTypeName === x.employeeTypeName);
                        if (duplicateDate) {
                            duplicateDate.employeeTypeName = x.employeeTypeName;
                        }
                        else {
                            results.push({
                                employeeTypeName: x.employeeTypeName,
                            });
                        }
                    });
                })
            })

            var total = [];
            result.forEach(x => {
                for (var property in x) {
                    if (property !== "sirderName" && property !== "operatorName") {
                        total.push({ name: property, value: x[property] });
                    }
                }
            });
            const res = Array.from(total.reduce(
                (m, { name, value }) => m.set(name, parseFloat(m.get(name) || 0) + parseFloat(value)), new Map
            ), ([name, value]) => ({ name, value }));

            setTotalRow(res)
            var Alltotal = result.reduce((accumulator, current) => accumulator + current.total, 0)
            setAllTotal(Alltotal)
            setHeader(results);
            setDailyAttendanceData(result);
        } else {
            setDailyAttendanceData([]);
            alert.error(response.message);
        }
    }

    function calculateTotalQty() {
        const totalQty = dailyAttendanceData.reduce((accumulator, current) => accumulator + current.employeeCount, 0);
        setTotalValues({
            ...totalValues,
            totalEmp: totalQty
        })
    };

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            var csvHeaders = [
                { label: "Operator", value: "operatorName" },
                { label: "Sirder", value: "sirderName" },
            ];
            header.map(x => {
                csvHeaders.push({ label: x.employeeTypeName, value: x.employeeTypeName });
            });
            csvHeaders.push({ label: 'Total', value: 'total' });
            var tot = {};
            tot['operatorName'] = 'Total'
            totalRow.forEach(x => {
                tot[x.name] = x.value
            })
            tot.total = allTotal
            var vr1 = {
                'operatorName': 'Legal Entity: ' + selectedSearchValues.groupName,
            };
            var vr2 = {
                'operatorName': 'Garden: ' + selectedSearchValues.gardenName,
            };
            var vr3 = {
                'operatorName': selectedSearchValues.costCenterName === undefined ? 'Cost Center: All Cost Centers' : 'Cost Center: ' + selectedSearchValues.costCenterName,
            };
            var vr4 = {
                'operatorName': 'Date: ' + selectedSearchValues.date,
            };
            array.push(tot, {}, vr1, vr2, vr3, vr4);
        }
        var result = {
            res: array,
            names: csvHeaders
        }
        return result;
    }

    function checkUndifind(value) {
        if (value === undefined) {
            return 0;
        }
        else {
            return value;
        }
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

    async function createFile() {
        var file = await createDataForExcel(dailyAttendanceData);
        var settings = {
            sheetName: 'Daily Attendence Sum',
            fileName:
                'Daily Attendence Summary Report - ' + new Date().toISOString().split('T', 1),
            writeOptions: {}
        };
        let dataA = [
            {
                sheet: 'Daily Attendence Sum',
                columns: file.names,
                content: file.res
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
        setDailyAttendanceDataList({
            ...dailyAttendanceDataList,
            [e.target.name]: value
        });
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: groups[searchForm.groupID],
            gardenName: gardens[searchForm.gardenID],
            costCenterName: costCenters[searchForm.costCenterID],
            date: searchForm.date,
            empTypeName: selectedOptions.map(x => x.label).join(', '),
            gangName: selectedOptions1.map(x => x.label).join(', '),
            operatorName: selectedOptions3.map(x => x.label).join(', '),
            bookName: selectedOptionsBook.map(x => x.label).join(','),
            sirderID: selectedOptions4.map(x => x.label).join(',')
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
                                                <br>
                                                </br>
                                                <br>
                                                </br>
                                                {dailyAttendanceData.length > 0 ?
                                                    <TableContainer component={Paper}>
                                                        <Table className={classes.table} aria-label="simple table">
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black" }}>Operator</TableCell>
                                                                    <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black" }}>Sirder</TableCell>
                                                                    <TableCell align="center" colSpan={header.length} style={{ fontWeight: "bold", border: "1px solid black" }}>Number of Workers</TableCell>
                                                                    <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                                        Total
                                                                    </TableCell>
                                                                </TableRow>
                                                                <TableRow>
                                                                    {header.map((row, i) => {
                                                                        return (
                                                                            <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                                                {row.employeeTypeName}
                                                                            </TableCell>
                                                                        )
                                                                    })}
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {dailyAttendanceData.slice(page * limit, page * limit + limit).map((row, i) => {

                                                                    return (
                                                                        <TableRow>
                                                                            <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.operatorName}</TableCell>
                                                                            <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}>{row.sirderName}</TableCell>

                                                                            {header.map((rows, i) => {
                                                                                var result = row[rows.employeeTypeName]
                                                                                return (
                                                                                    <>
                                                                                        <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black" }}>
                                                                                            {result == undefined ? '-' : result}
                                                                                        </TableCell>
                                                                                    </>
                                                                                )
                                                                            })}
                                                                            <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black" }}>{row.total}</TableCell>
                                                                        </TableRow>
                                                                    )
                                                                })}
                                                                <TableRow>
                                                                    <TableCell component="th" scope="row" align="left" style={{ fontWeight: "bold", borderLeft: "1px solid black", borderBottom: "1px solid black" }}>Total</TableCell>
                                                                    <TableCell style={{ borderBottom: "1px solid black" }}></TableCell>
                                                                    {header.map((rows, i) => {
                                                                        var result = totalRow.find(x => x.name == rows.employeeTypeName)
                                                                        return (
                                                                            <>
                                                                                <TableCell component="th" scope="row" align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                                                    {result == undefined ? '-' : result.value}
                                                                                </TableCell>
                                                                            </>
                                                                        )
                                                                    })}
                                                                    <TableCell component="th" scope="row" align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>{allTotal} </TableCell>
                                                                </TableRow>
                                                            </TableBody>
                                                        </Table>
                                                        <TablePagination
                                                            component="div"
                                                            count={dailyAttendanceData.length}
                                                            onChangePage={handlePageChange}
                                                            onChangeRowsPerPage={handleLimitChange}
                                                            page={page}
                                                            rowsPerPage={limit}
                                                            rowsPerPageOptions={[5, 10, 25]}
                                                        />
                                                    </TableContainer> : null}
                                            </Box>
                                        </CardContent>
                                        {dailyAttendanceData.length > 0 ?
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
                                                    documentTitle={"Daily Attendance Summary Report"}
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
                                                        searchData={selectedSearchValues} dailyAttendanceData={dailyAttendanceData} allTotal={allTotal}
                                                        totalRow={totalRow} mainHeader={mainHeader} header={header}
                                                    />
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