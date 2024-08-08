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
import { X } from 'react-feather';

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

const screenCode = 'LEAFCHITREPORT';

export default function LeafChitReport(props) {

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

    const [title, setTitle] = useState("Leaf Chit Report")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [gardens, setGardens] = useState([]);
    const [costCenters, setCostCenters] = useState();
    const [harvestingJobs, setHarvestingJobs] = useState([]);
    const [employeeCount, setEmployeeCount] = useState([]);
    const [sundry, setSundry] = useState();
    const [colName, setColName] = useState([]);
    const [leafChitDataList, setLeafChitDataList] = useState({
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
    const [selectEmpType, setSelectEmpType] = useState('');
    const [empType, setEmpType] = useState([]);
    const [operator, setOperator] = useState([]);
    const [data, setdata] = useState([]);
    const [chitData, setChitData] = useState([]);
    const [subNames, setSubNames] = useState([]);
    const [summeryData, setSummeryData] = useState([]);
    const [csvData, setCsvData] = useState([]);
    const [csvHeaders, setCsvHeaders] = useState([]);

    const [totalValues, setTotalValues] = useState({
        tGross: 0,
        tareaCoverdTodate: 0,
        taverageLeafPluckedToday: 0,
        tleafPluckedTodate: 0,
        tleafPluckedToday: 0,
        tnumberOfPluckersTodate: 0,
        tnumberOfPluckersToday: 0,
        tareaCoverdToday: 0,
        taverageLeafPluckedTodate: 0
    });

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission(), GetEmployeeTypesData());
    }, []);

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID());
    }, [leafChitDataList.groupID]);

    useEffect(() => {
        setLeafChitDataList((prevState) => ({
            ...prevState,
            costCenterID: "0"
        }));
    }, [leafChitDataList.groupID]);

    useEffect(() => {
        trackPromise(
            getCostCenterDetailsByGardenID(),
            GetOperatorListByDateAndGardenIDForLabourChecklistReport()
        )
    }, [leafChitDataList.gardenID]);

    useEffect(() => {
        setdata([])
    }, [leafChitDataList.gardenID]);

    useEffect(() => {
        setdata([])
    }, [leafChitDataList.costCenterID]);

    useEffect(() => {
        setdata([])
    }, [leafChitDataList.empTypeID]);

    useEffect(() => {
        if (leafChitDataList.gardenID != "0") {
            trackPromise(
                GetFactoryJobs()
            )
        }
    }, [leafChitDataList.gardenID]);

    useEffect(() => {
        if (leafChitDataList.costCenterID != "0") {
            trackPromise(
                GetFieldDetailsByDivisionID()
            )
        }
    }, [leafChitDataList.costCenterID]);

    useEffect(() => {
        if (leafChitDataList.costCenterID != 0) {
            getGangDetailsByDivisionID();
        }
    }, [leafChitDataList.costCenterID]);

    useEffect(() => {
        setdata([]);
    }, [leafChitDataList.taskID]);

    useEffect(() => {
        setdata([]);
    }, [leafChitDataList.factoryJobID]);

    useEffect(() => {
        setdata([]);
    }, [leafChitDataList.costCenterID]);

    useEffect(() => {
        setdata([]);
    }, [leafChitDataList.fieldID]);

    useEffect(() => {
        setdata([]);
    }, [leafChitDataList.gangID]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWLEAFCHITREPORT');

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

        setLeafChitDataList({
            ...leafChitDataList,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            gardenID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(leafChitDataList.groupID);
        setGardens(response);
    };

    async function getCostCenterDetailsByGardenID() {
        var response = await services.getDivisionDetailsByEstateID(leafChitDataList.gardenID);
        const elementCount = response.reduce((count) => count + 1, 0);
        var generated = generateDropDownMenu(response)
        if (elementCount === 1) {
            setLeafChitDataList((prevState) => ({
                ...prevState,
                costCenterID: generated[0].props.value,
            }));
        }
        setCostCenters(response);
    };

    async function GetFactoryJobs() {
        const result = await services.GetFactoryJobs(leafChitDataList.gardenID);
        setHarvestingJobs(result);
    }


    async function GetFieldDetailsByDivisionID() {
        var response = await services.GetFieldDetailsByDivisionID(leafChitDataList.costCenterID);
        var newOptionArray = fields;
        for (var i = 0; i < response.length; i++) {
            newOptionArray.push({ label: response[i].fieldName, value: response[i].fieldID })
        }
        setFields(newOptionArray);
    };

    async function getGangDetailsByDivisionID() {
        var response = await services.getGangDetailsByDivisionID(leafChitDataList.costCenterID);
        var newOptionArray = gangs;
        for (var i = 0; i < response.length; i++) {
            newOptionArray.push({ label: response[i].gangName, value: response[i].gangID })
        }
        setGangs(newOptionArray);
    };

    async function GetEmployeeTypesData() {
        const result = await services.GetEmployeeTypesData();
        var newOptionArray = empType;
        for (var i = 0; i < result.length; i++) {
            newOptionArray.push({ label: result[i].employeeTypeName, value: result[i].employeeTypeID })
        }
        setEmpType(newOptionArray);
    }

    async function GetOperatorListByDateAndGardenIDForLabourChecklistReport() {
        const result = await services.GetOperatorListByDateAndGardenIDForLabourChecklistReport(leafChitDataList.gardenID, moment(date.toString()).format().split('T')[0]);
        var newOptionArray = operator;
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
            legalEntityID: parseInt(leafChitDataList.groupID),
            gardenID: parseInt(leafChitDataList.gardenID),
            //costCenterID: parseInt(leafChitDataList.costCenterID),
            fieldID: selectedOptions2.map(x => x.value).join(','),
            gangID: selectedOptions1.map(x => x.value).join(','),
            empTypeID: selectedOptions.map(x => x.value).join(','),
            //userID: selectedOptions3.map(x => x.value).join(','),
            date: moment(date.toString()).format().split('T')[0],
        }

        getSelectedDropdownValuesForReport();
        const response = await services.GetDetails(model); 
        if (response.length > 0) {
            setChitData(response);

            const tGross = response.reduce((accumulator, current) => accumulator + current.grosArea, 0);
            const tareaCoverdTodate = response.reduce((accumulator, current) => accumulator + current.areaCoverdTodate, 0);
            const taverageLeafPluckedToday = response.reduce((accumulator, current) => accumulator + current.averageLeafPluckedToday, 0);
            const tleafPluckedTodate = response.reduce((accumulator, current) => accumulator + current.leafPluckedTodate, 0);
            const tleafPluckedToday = response.reduce((accumulator, current) => accumulator + current.leafPluckedToday, 0);
            const tnumberOfPluckersTodate = response.reduce((accumulator, current) => accumulator + current.numberOfPluckersTodate, 0);
            const tnumberOfPluckersToday = response.reduce((accumulator, current) => accumulator + current.numberOfPluckersToday, 0);
            const tareaCoverdToday = response.reduce((accumulator, current) => accumulator + current.areaCoverdToday, 0);
            const taverageLeafPluckedTodate = response.reduce((accumulator, current) => accumulator + current.averageLeafPluckedTodate, 0);

            setTotalValues({
                ...totalValues,
                tGross: tGross,
                tareaCoverdTodate: tareaCoverdTodate,
                taverageLeafPluckedToday: taverageLeafPluckedToday,
                tleafPluckedTodate: tleafPluckedTodate,
                tleafPluckedToday: tleafPluckedToday,
                tnumberOfPluckersTodate: tnumberOfPluckersTodate,
                tnumberOfPluckersToday: tnumberOfPluckersToday,
                tareaCoverdToday: tareaCoverdToday,
                taverageLeafPluckedTodate: taverageLeafPluckedTodate
            })
        }
        else {
            setdata([])
            alert.error("No records to display");
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

    function createFile() {
        var settings = {
            sheetName: 'Leaf Chit Report',
            fileName: 'Leaf Chit Report ' + moment(new Date().toString()).format().split('T')[0],
            writeOptions: {}
        }

        var csvHeaders = [
            { label: "Perticular", value: "perticular" },
            { label: "Unit", value: "unit" }
        ];

        chitData.forEach(x => {
            csvHeaders.push({ label: x.fieldName, value: x.fieldName });
        })

        var copyOfCsv = [];
        let dataA = [
            {
                sheet: 'Leaf Chit Details',
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
        setLeafChitDataList({
            ...leafChitDataList,
            [e.target.name]: value
        });
    }

    function getSelectedDropdownValuesForReport() {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: groups[leafChitDataList.groupID],
            gardenName: gardens[leafChitDataList.gardenID],
            costCenterName: costCenters[leafChitDataList.costCenterID],
            fieldName: selectedOptions2.map(x => x.label).join(', '),
            date: moment(date.toString()).format().split('T')[0],
            empTypeName: selectedOptions.map(x => x.label).join(', '),
            gangName: selectedOptions1.map(x => x.label).join(', '),
            //operatorName: selectedOptions3.map(x => x.label).join(', ')
        })
    }

    return (
        <Page className={classes.root} title={title}>
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: leafChitDataList.groupID,
                        gardenID: leafChitDataList.gardenID,
                        //costCenterID: leafChitDataList.costCenterID,
                        factoryJobID: leafChitDataList.factoryJobID,
                        taskID: leafChitDataList.taskID,
                        fieldID: leafChitDataList.fieldID,
                        sectionID: leafChitDataList.sectionID
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Legal Entity is required').min("1", 'Legal Entity is required'),
                            gardenID: Yup.number().required('Garden is required').min("1", 'Garden is required'),
                            //costCenterID: Yup.number().required('Cost Center is required').min("1", 'Cost Center is required'),
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
                                                        value={leafChitDataList.groupID}
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
                                                        value={leafChitDataList.gardenID}
                                                        variant="outlined"
                                                        id="gardenID"
                                                        size='small'

                                                    >
                                                        <MenuItem value="0">--Select Garden--</MenuItem>
                                                        {generateDropDownMenu(gardens)}
                                                    </TextField>
                                                </Grid>
                                                {/* <Grid item md={3} xs={12}>
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
                                                </Grid> */}
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
                                                {chitData.length != 0 ?
                                                    <Card>
                                                        <TableContainer component={Paper}>
                                                            <div className="row alternative_cls bg-light  ">
                                                                <br>
                                                                </br>
                                                                <Table aria-label="simple table">
                                                                    <TableHead>
                                                                        <TableRow>
                                                                            <TableCell rowSpan={2} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                                                Perticular
                                                                            </TableCell>
                                                                            <TableCell rowSpan={2} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                                                Unit
                                                                            </TableCell>
                                                                            {chitData.map((item) => {
                                                                                return (
                                                                                    <TableCell style={{ fontWeight: "bold", border: "1px solid black" }} align='center'>
                                                                                        {item.fieldName}
                                                                                    </TableCell>

                                                                                );
                                                                            })}

                                                                            <TableCell rowSpan={2} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                                                Total
                                                                            </TableCell>

                                                                        </TableRow>
                                                                    </TableHead>
                                                                    <TableBody>
                                                                        <TableRow>
                                                                            <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                                                Gross Area
                                                                            </TableCell>
                                                                            <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                                                HA
                                                                            </TableCell>
                                                                            {chitData.map((item) => {
                                                                                return (
                                                                                    <TableCell component="th" align="center" style={{ border: "1px solid black" }}>
                                                                                        {item.grosArea}
                                                                                    </TableCell>
                                                                                );
                                                                            })}
                                                                            <TableCell align="center" style={{ border: "1px solid black" }}>
                                                                                {totalValues.tGross.toFixed(2)}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                                                Area Covered-Today
                                                                            </TableCell>
                                                                            <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                                                HA
                                                                            </TableCell>
                                                                            {chitData.map((item) => {
                                                                                return (
                                                                                    <TableCell component="th" align="center" style={{ border: "1px solid black" }}>
                                                                                        {item.areaCoverdToday}
                                                                                    </TableCell>
                                                                                );
                                                                            })}
                                                                            <TableCell align="center" style={{ border: "1px solid black" }}>
                                                                                {totalValues.tareaCoverdToday.toFixed(2)}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                                                Area Coverd-Todate
                                                                            </TableCell>
                                                                            <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                                                HA
                                                                            </TableCell>
                                                                            {chitData.map((item) => {
                                                                                return (
                                                                                    <TableCell component="th" align="center" style={{ border: "1px solid black" }}>
                                                                                        {item.areaCoverdTodate}
                                                                                    </TableCell>
                                                                                );
                                                                            })}
                                                                            <TableCell align="center" style={{ border: "1px solid black" }}>
                                                                                {totalValues.tareaCoverdTodate.toFixed(2)}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                                                Number Of Pluckers-Today
                                                                            </TableCell>
                                                                            <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                                                No
                                                                            </TableCell>
                                                                            {chitData.map((item) => {
                                                                                return (
                                                                                    <TableCell component="th" align="center" style={{ border: "1px solid black" }}>
                                                                                        {item.numberOfPluckersToday}
                                                                                    </TableCell>
                                                                                );
                                                                            })}
                                                                            <TableCell align="center" style={{ border: "1px solid black" }}>
                                                                                {totalValues.tnumberOfPluckersToday.toFixed(2)}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                                                Number Of Pluckers Todate
                                                                            </TableCell>
                                                                            <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                                                NO
                                                                            </TableCell>
                                                                            {chitData.map((item) => {
                                                                                return (
                                                                                    <TableCell component="th" align="center" style={{ border: "1px solid black" }}>
                                                                                        {item.numberOfPluckersTodate}
                                                                                    </TableCell>
                                                                                );
                                                                            })}
                                                                            <TableCell align="center" style={{ border: "1px solid black" }}>
                                                                                {totalValues.tnumberOfPluckersTodate.toFixed(2)}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                                                Leaf Plucked Today
                                                                            </TableCell>
                                                                            <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                                                KG
                                                                            </TableCell>
                                                                            {chitData.map((item) => {
                                                                                return (
                                                                                    <TableCell component="th" align="center" style={{ border: "1px solid black" }}>
                                                                                        {item.leafPluckedToday}
                                                                                    </TableCell>
                                                                                );
                                                                            })}
                                                                            <TableCell align="center" style={{ border: "1px solid black" }}>
                                                                                {totalValues.tleafPluckedToday.toFixed(2)}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                                                Leaf Plucked Todate
                                                                            </TableCell>
                                                                            <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                                                NO
                                                                            </TableCell>
                                                                            {chitData.map((item) => {
                                                                                return (
                                                                                    <TableCell component="th" align="center" style={{ border: "1px solid black" }}>
                                                                                        {item.leafPluckedTodate}
                                                                                    </TableCell>
                                                                                );
                                                                            })}
                                                                            <TableCell align="center" style={{ border: "1px solid black" }}>
                                                                                {totalValues.tleafPluckedTodate.toFixed(2)}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                                                Average Leaf Plucked Today
                                                                            </TableCell>
                                                                            <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                                                KG
                                                                            </TableCell>
                                                                            {chitData.map((item) => {
                                                                                return (
                                                                                    <TableCell component="th" align="center" style={{ border: "1px solid black" }}>
                                                                                        {parseFloat(item.averageLeafPluckedToday).toFixed(2)}
                                                                                    </TableCell>
                                                                                );
                                                                            })}
                                                                            <TableCell align="center" style={{ border: "1px solid black" }}>
                                                                                {totalValues.taverageLeafPluckedToday.toFixed(2)}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                                                Average Leaf Plucked Todate
                                                                            </TableCell>
                                                                            <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                                                KG
                                                                            </TableCell>
                                                                            {chitData.map((item) => {
                                                                                return (
                                                                                    <TableCell component="th" align="center" style={{ border: "1px solid black" }}>
                                                                                        {parseFloat(item.averageLeafPluckedTodate).toFixed(2)}
                                                                                    </TableCell>
                                                                                );
                                                                            })}
                                                                            <TableCell align="center" style={{ border: "1px solid black" }}>
                                                                                {totalValues.taverageLeafPluckedTodate.toFixed(2)}
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
                                        {chitData.length > 0 ?
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                {/* <Button
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
                                                </Button> */}
                                                <ReactToPrint
                                                    documentTitle={"Leaf Chit Report " + moment(new Date().toString()).format().split('T')[0]}
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
                                                    <CreatePDF ref={componentRef} data={chitData} summeryValues={summeryValues}
                                                        selectedSearchValues={selectedSearchValues} summeryData={summeryData} subNames={subNames}
                                                        colName={colName} empCount={empCount} totalValues={totalValues} />
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
