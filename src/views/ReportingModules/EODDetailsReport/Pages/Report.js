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
import moment from 'moment';
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

const screenCode = 'EODDETAILSREPORT';

export default function EODDetailsReport(props) {
    const [title, setTitle] = useState("EOD Details Report")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [gardens, setGardens] = useState([]);
    const [costCenters, setCostCenters] = useState();
    const [operators, setOperators] = useState([]);
    const [status, setStatus] = useState({
        0 : 'Pending',
        1 : 'Complete'
    })
    const [eodDetailsData, setEODDetailsData] = useState([]);
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [eodDetails, setEODDetails] = useState({
        groupID: '0',
        gardenID: '0',
        costCenterID: '0',
        date: new Date().toISOString().substr(0, 10),
        operatorID: 0,
        status: ""
    })
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: "0",
        gardenName: "0",
        costCenterName: "0",
        date: '',
        operatorName: "0",
        status: ""

    })

    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const componentRef = useRef();
    const navigate = useNavigate();
    const alert = useAlert();
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);

    const [selectedOptions, setSelectedOptions] = useState([]);
    const getOptionLabel = option => `${option.label}`;
    const getOptionDisabled = option => option.value === "foo";
    const handleToggleOption = selectedOptions =>
        setSelectedOptions(selectedOptions);
    const handleClearOptions = () => setSelectedOptions([]);
    const handleSelectAll = isSelected => {
        if (isSelected) {
            setSelectedOptions(operators);
        } else {
            handleClearOptions();
        }
    };

    const [totalValues, setTotalValues] = useState({
        totalNoofEmp: 0,
        totalnoOfSessions: 0,
        totalnoOfIncompleteTask: 0,
        totalnoOfAssingTask: 0,
        totalnoOfCompleteTask: 0,
        totalnoOfPluckers: 0,
        totalnoOfNonPluckers: 0,
        totalnoOfOutsidePlukers: 0,
        totalnoOfOutsideNonPlukers: 0,
        totaleodfailcount: 0,
        totalnonpluckingsuscount: 0
    });

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID());
    }, [eodDetails.groupID]);

    useEffect(() => {
        setEODDetails((prevState) => ({
            ...prevState,
            costCenterID: "0"
        }));
    }, [eodDetails.groupID]);

    useEffect(() => {
        trackPromise(
            getCostCenterDetailsByGardenID()
        )
    }, [eodDetails.gardenID]);

    useEffect(() => {
        setEODDetailsData([])
    }, [eodDetails.gardenID]);

    useEffect(() => {
        setEODDetailsData([])
    }, [eodDetails.status]);

    useEffect(() => {
        setEODDetailsData([])
    }, [eodDetails.costCenterID]);

    useEffect(() => {
        setEODDetailsData([])
    }, [eodDetails.date]);

    useEffect(() => {
        setEODDetailsData([]);
    }, [selectedOptions]);

    useEffect(() => {
        if (eodDetailsData.length != 0) {
            calculateTotalQty()
        }
    }, [eodDetailsData]);

    useEffect(() => {
        if (eodDetails.gardenID != "0" && eodDetails.costCenterID != "0") {
            trackPromise(
                GetOperatorsbyDateforEODDetailReport()
            )
        }

    }, [eodDetails.gardenID, eodDetails.costCenterID, eodDetails.date]);

    const handleLimitChange = (event) => {
        setLimit(event.target.value);
    };
    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWEODDETAILSREPORT');

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

        setEODDetails({
            ...eodDetails,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            gardenID: parseInt(tokenService.getFactoryIDFromToken())
        })

    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(eodDetails.groupID);
        setGardens(response);
    };

    async function getCostCenterDetailsByGardenID() {
        var response = await services.getDivisionDetailsByEstateID(eodDetails.gardenID);
        const elementCount = response.reduce((count) => count + 1, 0);
        var generated = generateDropDownMenu(response)
        if (elementCount === 1) {
            setEODDetails((prevState) => ({
                ...prevState,
                costCenterID: generated[0].props.value,
            }));
        }
        setCostCenters(response);
    };

    async function GetOperatorsbyDateforEODDetailReport() {
        const result = await services.GetOperatorsbyDateforEODDetailReport(moment(eodDetails.date.toString()).format().split('T')[0]);
        var newOptionArray = [];
        for (var i = 0; i < result.length; i++) {
            newOptionArray.push({ label: result[i].operatorName, value: result[i].operatorID })
        }
        setOperators(newOptionArray);
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
            groupID: parseInt(eodDetails.groupID),
            gardenID: parseInt(eodDetails.gardenID),
            costCenterID: parseInt(eodDetails.costCenterID),
            date: eodDetails.date,
            operatorID: selectedOptions.map(x => x.value).join(','),
            status: eodDetails.status === "" ? null : parseInt(eodDetails.status),
        }
        getSelectedDropdownValuesForReport(model);
        const response = await services.GetEODDetails(model);
        if (response.statusCode == "Success" && response.data != null) {
            setEODDetailsData(response.data);
        }
        else {
            alert.error("No Records to Display");
        }
    }

    function calculateTotalQty() {
        const totalNoofEmp = eodDetailsData.reduce((accumulator, current) => accumulator + current.noOfEmp, 0);
        const totalnoOfSessions = eodDetailsData.reduce((accumulator, current) => accumulator + current.noOfSessions, 0);
        const totalnoOfIncompleteTask = eodDetailsData.reduce((accumulator, current) => accumulator + current.noOfIncompleteTask, 0);
        const totalnoOfAssingTask = eodDetailsData.reduce((accumulator, current) => accumulator + current.noOfAssingTask, 0);
        const totalnoOfCompleteTask = eodDetailsData.reduce((accumulator, current) => accumulator + current.noOfCompleteTask, 0);
        const totalnoOfPluckers = eodDetailsData.reduce((accumulator, current) => accumulator + current.noOfPluckers, 0);
        const totalnoOfNonPluckers = eodDetailsData.reduce((accumulator, current) => accumulator + current.noOfNonPluckers, 0);
        const totalnoOfOutsidePlukers = eodDetailsData.reduce((accumulator, current) => accumulator + current.noOfOutsidePlukers, 0);
        const totalnoOfOutsideNonPlukers = eodDetailsData.reduce((accumulator, current) => accumulator + current.noOfOutsideNonPlukers, 0);
        const totaleodfailcount = eodDetailsData.reduce((accumulator, current) => accumulator + current.eodFailCount, 0);
        const totalnonpluckingsuscount = eodDetailsData.reduce((accumulator, current) => accumulator + current.nonPluckingSuspendCount, 0);

        setTotalValues({
            ...totalValues,
            totalNoofEmp: totalNoofEmp,
            totalnoOfSessions: totalnoOfSessions,
            totalnoOfIncompleteTask: totalnoOfIncompleteTask,
            totalnoOfAssingTask: totalnoOfAssingTask,
            totalnoOfCompleteTask: totalnoOfCompleteTask,
            totalnoOfPluckers: totalnoOfPluckers,
            totalnoOfNonPluckers: totalnoOfNonPluckers,
            totalnoOfOutsidePlukers: totalnoOfOutsidePlukers,
            totalnoOfOutsideNonPlukers: totalnoOfOutsideNonPlukers,
            totaleodfailcount: totaleodfailcount,
            totalnonpluckingsuscount: totalnonpluckingsuscount
        })
    };

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            array.map(x => {
                var vr = {
                    'Operator': x.oparaterName,
                    'Device Lang': x.deviceLang,
                    'Device Model': x.deviceModel,
                    'OS Version': x.osVersion == 0 ? '-' : x.osVersion,
                    'EOS Time': moment(x.eosTime).format('YYYY-MM-DD, hh:mm:ss a'),
                    'EOD Time': x.isEodDone == false ? 'Pending' : moment(x.eodTime).format('YYYY-MM-DD, hh:mm:ss a'),
                    'EOD Fail Count': x.eodFailCount == 0 ? '-' : x.eodFailCount,
                    'No. of Employee': x.noOfEmp,
                    'No. of Sessions': x.noOfSessions,
                    'No. of Assing Task': x.noOfAssingTask,
                    'No. of Incomplete Task': x.noOfIncompleteTask,
                    'No. of Complete Task': x.noOfCompleteTask,
                    'No. of Pluckers': x.noOfPluckers,
                    'No. of Outside Pluckers': x.noOfOutsidePlukers,
                    'No. of Non Pluckers': x.noOfNonPluckers,
                    'No. of Outside Non Pluckers': x.noOfOutsideNonPlukers,
                    'Non Plucking Suspend Count': x.nonPluckingSuspendCount == 0 ? '-' : x.nonPluckingSuspendCount,
                    'Version': x.version,
                    'Installation Date': x.installationDate == null ? '-' : moment(x.installationDate).format('YYYY-MM-DD'),
                };
                res.push(vr);
            });
            var vr = {
                'Operator': 'Total',
                'EOD Fail Count': totalValues.totaleodfailcount,
                'No. of Employee': totalValues.totalNoofEmp,
                'No. of Sessions': totalValues.totalnoOfSessions,
                'No. of Assing Task': totalValues.totalnoOfAssingTask,
                'No. of Incomplete Task': totalValues.totalnoOfIncompleteTask,
                'No. of Complete Task': totalValues.totalnoOfCompleteTask,
                'No. of Pluckers': totalValues.totalnoOfPluckers,
                'No. of Outside Pluckers': totalValues.totalnoOfOutsidePlukers,
                'No. of Non Pluckers': totalValues.totalnoOfNonPluckers,
                'No. of Outside Non Pluckers': totalValues.totalnoOfOutsideNonPlukers,
                'Non Plucking Suspend Count': totalValues.totalnonpluckingsuscount
            };

            res.push(vr);
            res.push([]);
            var vr = {
                'Operator': 'Location: ' + selectedSearchValues.gardenName,
                'Device Lang': 'Sub Division: ' + selectedSearchValues.costCenterName,
                'Device Model': 'Date: ' + selectedSearchValues.date
            };
            res.push(vr);
        }
        return res;
    }

    async function createFile() {
        var file = await createDataForExcel(eodDetailsData);
        var settings = {
            sheetName: 'EOD Details Report',
            fileName:
                'EOD Details Report - ' +
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
                sheet: 'EOD Details Report',
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
        setEODDetails({
            ...eodDetails,
            [e.target.name]: value
        });
    }


    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: groups[searchForm.groupID],
            gardenName: gardens[searchForm.gardenID],
            costCenterName: costCenters[searchForm.costCenterID],
            date: eodDetails.date,
            operatorID: selectedOptions.map(x => x.label).join(','),
            status: parseInt(eodDetails.status),
        })
    }

    return (
        <Page className={classes.root} title={title}>
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: eodDetails.groupID,
                        gardenID: eodDetails.gardenID,
                        costCenterID: eodDetails.costCenterID,
                        date: eodDetails.date,
                        factoryJobID: eodDetails.factoryJobID,
                        fieldID: eodDetails.fieldID,
                        empTypeID: eodDetails.empTypeID,
                        status: parseInt(eodDetails.status)

                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Business Division is required').min("1", 'Business Division is required'),
                            gardenID: Yup.number().required('Location is required').min("1", 'Location is required'),
                            costCenterID: Yup.number().required('Sub Division is required').min("1", 'Sub Division is required'),
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
                                                        Business Division  *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.groupID && errors.groupID)}
                                                        fullWidth
                                                        helperText={touched.groupID && errors.groupID}
                                                        name="groupID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={eodDetails.groupID}
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
                                                        Location *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.gardenID && errors.gardenID)}
                                                        fullWidth
                                                        helperText={touched.gardenID && errors.gardenID}
                                                        name="gardenID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={eodDetails.gardenID}
                                                        variant="outlined"
                                                        id="gardenID"
                                                        size='small'
                                                    >
                                                        <MenuItem value="0">--Select Location--</MenuItem>
                                                        {generateDropDownMenu(gardens)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="costCenterID">
                                                        Sub Division *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.costCenterID && errors.costCenterID)}
                                                        fullWidth
                                                        helperText={touched.costCenterID && errors.costCenterID}
                                                        name="costCenterID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={eodDetails.costCenterID}
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
                                                    <TextField
                                                        error={Boolean(touched.date && errors.date)}
                                                        helperText={touched.date && errors.date}
                                                        fullWidth
                                                        size='small'
                                                        name="date"
                                                        type="date"
                                                        value={eodDetails.date}
                                                        onChange={(e) => handleChange(e)}
                                                        variant="outlined"
                                                        id="date"
                                                    />
                                                </Grid>
                                                <Grid item md={3} xs={12} >
                                                    <InputLabel shrink id="operatorID">
                                                        Operator
                                                    </InputLabel>
                                                    <CustomMultiSelect
                                                        items={operators}
                                                        getOptionLabel={getOptionLabel}
                                                        getOptionDisabled={getOptionDisabled}
                                                        selectedValues={selectedOptions}
                                                        placeholder="Operator"
                                                        selectAllLabel="Select all"
                                                        onToggleOption={handleToggleOption}
                                                        onClearOptions={handleClearOptions}
                                                        onSelectAll={handleSelectAll}
                                                    />
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="status">
                                                        Status
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.status && errors.status)}
                                                        fullWidth
                                                        helperText={touched.status && errors.status}
                                                        name="status"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={eodDetails.status}
                                                        variant="outlined"
                                                        id="status"
                                                        size='small'
                                                    >
                                                        <MenuItem value="0">--Select Status--</MenuItem>
                                                        {generateDropDownMenu(status)}
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
                                                <br></br>
                                                <br></br>
                                                <br></br>
                                                {eodDetailsData.length > 0 ?
                                                    <TableContainer component={Paper}>
                                                        <Table className={classes.table} aria-label="simple table" size="small">
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell align="center" rowSpan={2} style={{ fontWeight: "bold", border: "1px solid black" }}>Operator</TableCell>
                                                                    <TableCell align="center" colSpan={3} style={{ fontWeight: "bold", border: "1px solid black" }}>Device</TableCell>
                                                                    <TableCell align="center" colSpan={2} style={{ fontWeight: "bold", border: "1px solid black" }}>Time</TableCell>
                                                                    <TableCell align="center" rowSpan={2} style={{ fontWeight: "bold", border: "1px solid black" }}>EOD Fail Count</TableCell>
                                                                    <TableCell align="center" rowSpan={2} style={{ fontWeight: "bold", border: "1px solid black" }}>No. of Employee</TableCell>
                                                                    <TableCell align="center" rowSpan={2} style={{ fontWeight: "bold", border: "1px solid black" }}>No. of Sessions</TableCell>
                                                                    <TableCell align="center" colSpan={3} style={{ fontWeight: "bold", border: "1px solid black" }}>Task</TableCell>
                                                                    <TableCell align="center" rowSpan={2} style={{ fontWeight: "bold", border: "1px solid black" }}>No. of Pluckers</TableCell>
                                                                    <TableCell align="center" rowSpan={2} style={{ fontWeight: "bold", border: "1px solid black" }}>No. of Non Pluckers</TableCell>
                                                                    <TableCell align="center" rowSpan={2} style={{ fontWeight: "bold", border: "1px solid black" }}>Non Plucking Suspend Count</TableCell>
                                                                    <TableCell align="center" rowSpan={2} style={{ fontWeight: "bold", border: "1px solid black" }}>Version</TableCell>
                                                                    <TableCell align="center" rowSpan={2} style={{ fontWeight: "bold", border: "1px solid black" }}>Installation Date</TableCell>
                                                                </TableRow>
                                                                <TableRow>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Device Lang</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Device Model</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>OS Version</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>EOS Time</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>EOD Time</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>No. of Assing Task</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>No. of Incomplete Task</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>No. of Complete Task</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {eodDetailsData.slice(page * limit, page * limit + limit).map((row, i) => (
                                                                    <TableRow key={i}>
                                                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black" }}> {row.oparaterName}</TableCell>
                                                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black" }}> {row.deviceLang}</TableCell>
                                                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black" }}> {row.deviceModel}</TableCell>
                                                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px dashed black" }}> {row.osVersion == 0 ? '-' : row.osVersion}</TableCell>
                                                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px dashed black" }}> {moment(row.eosTime).format('YYYY-MM-DD, hh:mm:ss a')}</TableCell>
                                                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px dashed black", color: row.isEodDone === false ? 'red' : 'inherit', fontWeight: row.isEodDone === false ? 'bold' : 'normal'}}> {row.isEodDone == false ? 'Pending' : moment(row.eodTime).format('YYYY-MM-DD, hh:mm:ss a')}</TableCell>
                                                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px dashed black" }}> {row.eodFailCount == 0 ? '-' : row.eodFailCount}</TableCell>
                                                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px dashed black" }}> {row.noOfEmp}</TableCell>
                                                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px dashed black" }}> {row.noOfSessions}</TableCell>
                                                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px dashed black" }}> {row.noOfAssingTask}</TableCell>
                                                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px dashed black" }}> {row.noOfIncompleteTask}</TableCell>
                                                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px dashed black" }}> {row.noOfCompleteTask}</TableCell>
                                                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px dashed black" }}> {row.noOfPluckers}</TableCell>
                                                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px dashed black" }}> {row.noOfNonPluckers}</TableCell>
                                                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px dashed black" }}> {row.nonPluckingSuspendCount == 0 ? '-' : row.nonPluckingSuspendCount}</TableCell>
                                                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px dashed black" }}> {row.version}</TableCell>
                                                                    <TableCell component="th" scope="row" align="center" style={{ border: "1px dashed black" }}> {row.installationDate == null ? '-' : moment(row.installationDate).format('YYYY-MM-DD')}</TableCell>
                                                                    </TableRow>
                                                                )
                                                                )}
                                                            </TableBody>
                                                            <TableRow>
                                                                <TableCell align={'center'} colSpan={6} style={{ borderBottom: "none", border: "1px solid black" }}><b>Total</b></TableCell>                                             
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                                                    <b> {totalValues.totaleodfailcount} </b>
                                                                </TableCell>
                                                                <TableCell align={'right'} style={{ borderBottom: "none", border: "1px solid black" }}>
                                                                    <b> {totalValues.totalNoofEmp} </b>
                                                                </TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                                                    <b> {totalValues.totalnoOfSessions} </b>
                                                                </TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                                                    <b> {totalValues.totalnoOfAssingTask} </b>
                                                                </TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                                                    <b> {totalValues.totalnoOfIncompleteTask} </b>
                                                                </TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                                                    <b> {totalValues.totalnoOfCompleteTask} </b>
                                                                </TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                                                    <b> {totalValues.totalnoOfPluckers} </b>
                                                                </TableCell>                                           
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                                                    <b> {totalValues.totalnoOfNonPluckers} </b>
                                                                </TableCell>                                                               
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                                                    <b> {totalValues.totalnonpluckingsuscount} </b>
                                                                </TableCell>
                                                                <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                                <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                                            </TableRow>
                                                        </Table>
                                                        <TablePagination
                                                            component="div"
                                                            count={eodDetailsData.length}
                                                            onChangePage={handlePageChange}
                                                            onChangeRowsPerPage={handleLimitChange}
                                                            page={page}
                                                            rowsPerPage={limit}
                                                            rowsPerPageOptions={[5, 10, 25]}
                                                        />
                                                    </TableContainer> : null}
                                            </Box>
                                        </CardContent>
                                        {eodDetailsData.length > 0 ?
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
                                                    documentTitle={"EOD Details Report"}
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
                                                        searchData={selectedSearchValues} eodDetailsData={eodDetailsData}
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