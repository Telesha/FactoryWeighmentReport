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

const screenCode = 'DAILYATTENDACESESSIONWISEREPORT';

export default function DailyAttendaceSessionWiseReport(props) {
    const [title, setTitle] = useState("Daily Plucking Details - Session Wise")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [gardens, setGardens] = useState([]);
    const [costCenters, setCostCenters] = useState();
    const [harvestingJobs, setHarvestingJobs] = useState([]);
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [sundry, setSundry] = useState([]);
    const [dailyAttendanceSessionWiseData, setDailyAttendanceSessionWiseData] = useState([]);
    const [dailyAttendanceSessionWiseDataList, setDailyAttendanceSessionWiseDataList] = useState({
        groupID: '0',
        gardenID: '0',
        costCenterID: '0',
        date: '0',
        factoryJobID: '0',
        taskID: '0',
        fieldID: '0',
        gangID: '0',
        session: '0'

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
        sessionName: "0"
    })

    const [totalValues, setTotalValues] = useState({
        totalQty: 0
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
    const [fields, setFields] = useState([]);
    const [gangs, setGangs] = useState([]);

    //MultiSelect Harvesting Job
    const [selectedOptions1, setSelectedOptions1] = useState([]);
    const getOptionLabel1 = option => `${option.label}`;
    const getOptionDisabled1 = option => option.value === "foo";
    const handleToggleOption1 = selectedOptions =>
        setSelectedOptions1(selectedOptions);
    const handleClearOptions1 = () => setSelectedOptions1([]);
    const handleSelectAll1 = isSelected => {
        if (isSelected) {
            setSelectedOptions1(harvestingJobs);
        } else {
            handleClearOptions1();
        }
    };

    //MultiSelect Plucking Kamjari
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

    //MultiSelect Sections
    const [selectedOptions3, setSelectedOptions3] = useState([]);
    const getOptionLabel3 = option => `${option.label}`;
    const getOptionDisabled3 = option => option.value === "foo";
    const handleToggleOption3 = selectedOptions =>
        setSelectedOptions3(selectedOptions);
    const handleClearOptions3 = () => setSelectedOptions3([]);
    const handleSelectAll3 = isSelected => {
        if (isSelected) {
            setSelectedOptions3(fields);
        } else {
            handleClearOptions3();
        }
    };

    //MultiSelect Duffa
    const [selectedOptions4, setSelectedOptions4] = useState([]);
    const getOptionLabel4 = option => `${option.label}`;
    const getOptionDisabled4 = option => option.value === "foo";
    const handleToggleOption4 = selectedOptions =>
        setSelectedOptions4(selectedOptions);
    const handleClearOptions4 = () => setSelectedOptions4([]);
    const handleSelectAll4 = isSelected => {
        if (isSelected) {
            setSelectedOptions4(gangs);
        } else {
            handleClearOptions4();
        }
    };

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID());
    }, [dailyAttendanceSessionWiseDataList.groupID]);

    useEffect(() => {
        setDailyAttendanceSessionWiseDataList((prevState) => ({
            ...prevState,
            costCenterID: "0"
        }));
    }, [dailyAttendanceSessionWiseDataList.groupID]);

    useEffect(() => {
        trackPromise(
            getCostCenterDetailsByGardenID()
        )
    }, [dailyAttendanceSessionWiseDataList.gardenID]);

    useEffect(() => {
        setDailyAttendanceSessionWiseData([])
    }, [dailyAttendanceSessionWiseDataList.gardenID]);

    useEffect(() => {
        setDailyAttendanceSessionWiseData([])
    }, [dailyAttendanceSessionWiseDataList.costCenterID]);

    useEffect(() => {
        setDailyAttendanceSessionWiseData([])
    }, [dailyAttendanceSessionWiseDataList.empTypeID]);

    useEffect(() => {
        if (dailyAttendanceSessionWiseDataList.gardenID != "0") {
            trackPromise(
                GetFactoryJobs()
            )
        }
    }, [date]);

    useEffect(() => {
        setDailyAttendanceSessionWiseDataList((prevState) => ({
            ...prevState,
            taskID: '0',
            factoryJobID: '0',
            session: '0',
            fieldID: '0',
            gangID: '0'
        }));
    }, [date]);

    useEffect(() => {
        if (dailyAttendanceSessionWiseDataList.gardenID != "0" && dailyAttendanceSessionWiseDataList.costCenterID != 0) {
            trackPromise(
                getLabourTask()
            )
        }
    }, [dailyAttendanceSessionWiseDataList.gardenID, dailyAttendanceSessionWiseDataList.costCenterID, date]);

    useEffect(() => {
        if (dailyAttendanceSessionWiseDataList.costCenterID != "0") {
            trackPromise(
                GetFieldDetailsByDivisionID()
            )
        }
    }, [date]);

    useEffect(() => {
        if (dailyAttendanceSessionWiseDataList.costCenterID != 0) {
            getGangDetailsByDivisionID();
        }
    }, [date]);

    useEffect(() => {
        if (dailyAttendanceSessionWiseData.length != 0) {
            calculateTotalQty()
        }
    }, [dailyAttendanceSessionWiseData]);

    useEffect(() => {
        setDailyAttendanceSessionWiseData([]);
    }, [selectedOptions1]);

    useEffect(() => {
        setDailyAttendanceSessionWiseData([]);
    }, [date]);

    useEffect(() => {
        setDailyAttendanceSessionWiseData([]);
    }, [selectedOptions2]);

    useEffect(() => {
        setDailyAttendanceSessionWiseData([]);
    }, [selectedOptions3]);

    useEffect(() => {
        setDailyAttendanceSessionWiseData([]);
    }, [selectedOptions4]);

    useEffect(() => {
        setDailyAttendanceSessionWiseData([]);
    }, [dailyAttendanceSessionWiseDataList.costCenterID]);

    useEffect(() => {
        setDailyAttendanceSessionWiseData([]);
    }, [dailyAttendanceSessionWiseDataList.costCenterID]);

    const handleLimitChange = (event) => {
        setLimit(event.target.value);
    };
    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWDAILYATTENDACESESSIONWISEREPORT');

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

        setDailyAttendanceSessionWiseDataList({
            ...dailyAttendanceSessionWiseDataList,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            gardenID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(dailyAttendanceSessionWiseDataList.groupID);
        setGardens(response);
    };

    async function getCostCenterDetailsByGardenID() {
        var response = await services.getDivisionDetailsByEstateID(dailyAttendanceSessionWiseDataList.gardenID);
        const elementCount = response.reduce((count) => count + 1, 0);
        var generated = generateDropDownMenu(response)
        if (elementCount === 1) {
            setDailyAttendanceSessionWiseDataList((prevState) => ({
                ...prevState,
                costCenterID: generated[0].props.value,
            }));
        }
        setCostCenters(response);
    };

    async function GetFactoryJobs() {
        const response = await services.GetFactoryJobs(dailyAttendanceSessionWiseDataList.gardenID, date);
        const newOptionArray = [];
        for (var i = 0; i < response.length; i++) {
            newOptionArray.push({ label: response[i].jobName, value: response[i].harvestingJobMasterID })
        }
        setHarvestingJobs(newOptionArray);
    }

    async function getLabourTask() {
        const response = await services.getLabourTask(dailyAttendanceSessionWiseDataList.gardenID, dailyAttendanceSessionWiseDataList.costCenterID, date);
        const newOptionArray = [];
        for (var i = 0; i < response.length; i++) {
            newOptionArray.push({ label: response[i].taskName, value: response[i].taskID })
        }
        setSundry(newOptionArray);
    }

    async function GetFieldDetailsByDivisionID() {
        var response = await services.GetFieldDetailsByDivisionID(dailyAttendanceSessionWiseDataList.costCenterID, date);
        const newOptionArray = [];
        for (var i = 0; i < response.length; i++) {
            newOptionArray.push({ label: response[i].fieldName, value: response[i].fieldID })
        }
        setFields(newOptionArray);
    };

    async function getGangDetailsByDivisionID() {
        var response = await services.getGangDetailsByDivisionID(dailyAttendanceSessionWiseDataList.costCenterID, date);
        const newOptionArray = [];
        for (var i = 0; i < response.length; i++) {
            newOptionArray.push({ label: response[i].gangName, value: response[i].gangID })
        }
        setGangs(newOptionArray);
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
            groupID: parseInt(dailyAttendanceSessionWiseDataList.groupID),
            gardenID: parseInt(dailyAttendanceSessionWiseDataList.gardenID),
            costCenterID: parseInt(dailyAttendanceSessionWiseDataList.costCenterID),
            date: moment(date.toString()).format().split('T')[0],
            harvestingJobID: selectedOptions1.map(x => x.value).join(','),
            taskID: selectedOptions2.map(x => x.value).join(','),
            fieldID: selectedOptions3.map(x => x.value).join(','),
            gangID: selectedOptions4.map(x => x.value).join(','),
            session: dailyAttendanceSessionWiseDataList.session == '0' ? '' : dailyAttendanceSessionWiseDataList.session
        }

        getSelectedDropdownValuesForReport(model);

        const response = await services.GetDetails(model);
        if (response.statusCode == "Success" && response.data != null) {
            var added = GrossCalculation(response.data)
            setDailyAttendanceSessionWiseData(added);
        }
        else {
            setDailyAttendanceSessionWiseData([])
            alert.error(response.message);
        }
    }

    function GrossCalculation(data) {
        data.forEach((record) => {
            if (record.taskSubCode == '501-1') {
                record.grossPay = record.rate;
            } else {
                record.grossPay = record.rate * record.quntity;
            }
        });
        return data;
    }

    function calculateTotalQty() {
        const totalQty = dailyAttendanceSessionWiseData.reduce((accumulator, current) => accumulator + current.quntity, 0);

        setTotalValues({
            ...totalValues,
            totalQty: totalQty
        })
    };

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            array.map(x => {
                var vr = {
                    'Reg.No': x.registrationNumber,
                    'Name': x.employeeName,
                    'Job': x.jobName,
                    'Kamjari Code': x.taskCode,
                    'Kamjari Name': x.taskName,
                    'Section': x.taskSubCode,
                    'Duffa': x.gangName,
                    'Session': x.sessionName,
                    'Qty(Kg)': x.quntity.toFixed(2),
                };
                res.push(vr);
            });
            var vr = {
                'Reg.No': 'Total',
                'Name': '',
                'Job': '',
                'Kamjari Code': '',
                'Kamjari Name': '',
                'Section': '',
                'Duffa': '',
                'Session': '',
                'Qty(Kg)': totalValues.totalQty.toFixed(2)
            };
            res.push(vr);
            res.push([]);
            var vr = {
                'Reg.No': 'Legal Entity - ' + selectedSearchValues.groupName,
                'Name': 'Garden - ' + selectedSearchValues.gardenName,
                'Job': selectedSearchValues.costCenterName === undefined ? 'Cost Center - All Cost Centers' : 'Cost Center - ' + selectedSearchValues.costCenterName,
                'Kamjari Code': selectedSearchValues.factoryJobName === undefined ? 'Harvesting Job - All Harvesting Jobs' : 'Harvesting Job - ' + selectedSearchValues.factoryJobName,
                'Kamjari Name': selectedSearchValues.taskName === undefined ? 'Plucking Task - All Plucking Tasks' : 'Plucking Task - ' + selectedSearchValues.taskName,
                'Section': selectedSearchValues.fieldName === undefined ? 'Section - All Sections' : 'Section - ' + selectedSearchValues.fieldName,
                'Duffa': selectedSearchValues.gangName === undefined ? 'Duffa - All Duffas' : 'Duffa - ' + selectedSearchValues.gangName,
                'Session': 'Date - ' + moment(date.toString()).format().split('T')[0],
                'Qty(Kg)': selectedSearchValues.sessionName === "0" ? 'Session - All Sessions' : 'Session - ' + selectedSearchValues.sessionName,
            };
            res.push(vr);
        }
        return res;
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
        var file = await createDataForExcel(dailyAttendanceSessionWiseData);
        var settings = {
            sheetName: 'Daily Plucking Details - Session Wise',
            fileName:
                'Daily Plucking Details - Session Wise -' + new Date().toISOString().split('T', 1),
        };

        let keys = Object.keys(file[0]);
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem });
        });

        let dataA = [
            {
                sheet: 'Daily Plucking Details',
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
        setDailyAttendanceSessionWiseDataList({
            ...dailyAttendanceSessionWiseDataList,
            [e.target.name]: value
        });
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        let harvestingJobMasterID = searchForm.harvestingJobID
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: groups[searchForm.groupID],
            gardenName: gardens[searchForm.gardenID],
            costCenterName: costCenters[searchForm.costCenterID],
            date: searchForm.date,
            factoryJobName: selectedOptions1.map(x => x.label).join(', '),
            taskName: selectedOptions2.map(x => x.label).join(', '),
            fieldName: selectedOptions3.map(x => x.label).join(', '),
            gangName: selectedOptions4.map(x => x.label).join(', '),
            sessionName: searchForm.session
        })
    }

    return (
        <Page className={classes.root} title={title}>
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: dailyAttendanceSessionWiseDataList.groupID,
                        gardenID: dailyAttendanceSessionWiseDataList.gardenID,
                        costCenterID: dailyAttendanceSessionWiseDataList.costCenterID,
                        factoryJobID: dailyAttendanceSessionWiseDataList.factoryJobID,
                        taskID: dailyAttendanceSessionWiseDataList.taskID,
                        fieldID: dailyAttendanceSessionWiseDataList.fieldID,
                        gangID: dailyAttendanceSessionWiseDataList.gangID
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
                                                <Grid item md={4} xs={8}>
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
                                                        value={dailyAttendanceSessionWiseDataList.groupID}
                                                        variant="outlined"
                                                        id="groupID"
                                                        size='small'

                                                    >
                                                        <MenuItem value="0">--Select Legal Entity--</MenuItem>
                                                        {generateDropDownMenu(groups)}
                                                    </TextField>
                                                </Grid>

                                                <Grid item md={4} xs={8}>
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
                                                        value={dailyAttendanceSessionWiseDataList.gardenID}
                                                        variant="outlined"
                                                        id="gardenID"
                                                        size='small'

                                                    >
                                                        <MenuItem value="0">--Select Garden--</MenuItem>
                                                        {generateDropDownMenu(gardens)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={8}>
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
                                                        value={dailyAttendanceSessionWiseDataList.costCenterID}
                                                        variant="outlined"
                                                        id="costCenterID"
                                                        size='small'

                                                    >
                                                        <MenuItem value="0">--Select Cost Center--</MenuItem>
                                                        {generateDropDownMenu(costCenters)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={8}>
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
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="factoryJobID">
                                                        Harvesting Job
                                                    </InputLabel>
                                                    <CustomMultiSelect
                                                        items={harvestingJobs}
                                                        getOptionLabel={getOptionLabel1}
                                                        getOptionDisabled={getOptionDisabled1}
                                                        selectedValues={selectedOptions1}
                                                        placeholder="--Select Harvesting Job--"
                                                        selectAllLabel="Select all"
                                                        onToggleOption={handleToggleOption1}
                                                        onClearOptions={handleClearOptions1}
                                                        onSelectAll={handleSelectAll1}
                                                    />
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="taskID">
                                                        Plucking Kamjari
                                                    </InputLabel>
                                                    <CustomMultiSelect
                                                        items={sundry}
                                                        getOptionLabel={getOptionLabel2}
                                                        getOptionDisabled={getOptionDisabled2}
                                                        selectedValues={selectedOptions2}
                                                        placeholder="--Select Plucking Kamjari--"
                                                        selectAllLabel="Select all"
                                                        onToggleOption={handleToggleOption2}
                                                        onClearOptions={handleClearOptions2}
                                                        onSelectAll={handleSelectAll2}
                                                    />
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="fields">
                                                        Sections
                                                    </InputLabel>
                                                    <CustomMultiSelect
                                                        items={fields}
                                                        getOptionLabel={getOptionLabel3}
                                                        getOptionDisabled={getOptionDisabled3}
                                                        selectedValues={selectedOptions3}
                                                        placeholder="--Select Sections--"
                                                        selectAllLabel="Select all"
                                                        onToggleOption={handleToggleOption3}
                                                        onClearOptions={handleClearOptions3}
                                                        onSelectAll={handleSelectAll3}
                                                    />
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="gangID">
                                                        Duffa
                                                    </InputLabel>
                                                    <CustomMultiSelect
                                                        items={gangs}
                                                        getOptionLabel={getOptionLabel4}
                                                        getOptionDisabled={getOptionDisabled4}
                                                        selectedValues={selectedOptions4}
                                                        placeholder="--Select Sections--"
                                                        selectAllLabel="Select all"
                                                        onToggleOption={handleToggleOption4}
                                                        onClearOptions={handleClearOptions4}
                                                        onSelectAll={handleSelectAll4}
                                                    />
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="session">
                                                        Session
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="session"
                                                        onBlur={handleBlur}
                                                        size='small'
                                                        onChange={(e) => {
                                                            handleChange(e)
                                                        }}
                                                        value={dailyAttendanceSessionWiseDataList.session}
                                                        variant="outlined"
                                                        id="session"
                                                    >
                                                        <MenuItem value={'0'}>--Select Session--</MenuItem>
                                                        <MenuItem value={'Morning Cash'}>Morning Cash</MenuItem>
                                                        <MenuItem value={'Mid Day Session'}>Mid Day Session</MenuItem>
                                                        <MenuItem value={'Evening Session'}>Evening Session</MenuItem>
                                                        <MenuItem value={'Off Day Cash 1'}>Off Day Cash 1</MenuItem>
                                                        <MenuItem value={'Off Day Cash 2'}>Off Day Cash 2</MenuItem>
                                                        <MenuItem value={'Off Day Cash 3'}>Off Day Cash 3</MenuItem>
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
                                                {dailyAttendanceSessionWiseData.length > 0 ?
                                                    <TableContainer component={Paper}>
                                                        <Table className={classes.table} aria-label="simple table">
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Reg.No</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Name</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Job</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Kamjari Code</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Kamjari Name</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Section</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Duffa</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Session</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Qty(Kg)</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {dailyAttendanceSessionWiseData.slice(page * limit, page * limit + limit).map((row, i) => (
                                                                    <TableRow key={i}>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.registrationNumber}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.employeeName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.jobName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.taskCode}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.taskName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.taskSubCode}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.gangName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.sessionName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.quntity.toFixed(2)}</TableCell>
                                                                    </TableRow>
                                                                )
                                                                )}
                                                            </TableBody>
                                                            <TableRow>
                                                                <TableCell align={'center'} style={{ borderBottom: "none", border: "1px solid black" }}><b>Total</b></TableCell>
                                                                <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                                <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                                <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                                <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                                <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                                <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                                <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                                                    <b> {totalValues.totalQty.toFixed(2)} </b>
                                                                </TableCell>
                                                            </TableRow>
                                                            <TableHead>
                                                            </TableHead>
                                                        </Table>
                                                        <TablePagination
                                                            component="div"
                                                            count={dailyAttendanceSessionWiseData.length}
                                                            onChangePage={handlePageChange}
                                                            onChangeRowsPerPage={handleLimitChange}
                                                            page={page}
                                                            rowsPerPage={limit}
                                                            rowsPerPageOptions={[5, 10, 25]}
                                                        />
                                                    </TableContainer> : null}
                                            </Box>
                                        </CardContent>
                                        {dailyAttendanceSessionWiseData.length > 0 ?
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
                                                    documentTitle={"Daily Plucking Details - Session Wise"}
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
                                                        searchData={selectedSearchValues} dailyAttendanceSessionWiseData={dailyAttendanceSessionWiseData} totalValues={totalValues} />
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