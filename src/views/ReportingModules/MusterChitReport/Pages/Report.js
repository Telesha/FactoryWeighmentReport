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
import * as Yup from "yup";
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import { Formik } from 'formik';
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
import LineWeightIcon from '@material-ui/icons/LineWeight';
import { isSaturday } from 'date-fns';
import moment from 'moment';
import { Autocomplete } from '@material-ui/lab';
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

const screenCode = 'MUSTERCHITREPORT';

export default function RationEntitlementReport(props) {
    const [title, setTitle] = useState("Muster Chit")
    const classes = useStyles();
    const [GroupList, setGroupList] = useState([]);
    const [estates, setEstates] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const isDayDisabled = (date) => {
        return !isSaturday(date);
    };
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [musterchitDetailsData, setMusterchitDetailsData] = useState([]);
    const [musterchitDetailsDataOne, setMusterchitDetailsDataOne] = useState([]);
    const [employeeSubCategoryMapping, setEmployeeSubCategoryMapping] = useState([]);
    const [task, setTask] = useState([]);
    const [products, setProducts] = useState([]);
    const [PayPoints, setPayPoints] = useState();
    const [musterChitReport, setMusterChitReport] = useState({
        groupID: '0',
        operationEntityID: '0',
        divisionID: '0',
        payPointID: '0',
        employeeSubCategoryMappingID: 0,
        taskID: 0,
        productID: 0,
        taskSickLeaveID: '0',
        taskCode: '',
        date: new Date().toISOString().substr(0, 10),
        regNo: ''
    })
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: '',
        estateName: '',
        divisionName: '',
        payPointName: '',
        employeeSubCategory: '',
        productName: '',
        date: '',
        taskSickLeave: ''
    })
    const [registrationNumberCount, setRegistrationNumberCount] = useState(0);
    const [transCount, setTransCount] = useState(0);
    const [genCount, setGenCount] = useState(0);
    const [cashCount, setCashCount] = useState(0);
    const [susCount, setSusCount] = useState(0);
    const [registrationNumberCountByTaskCode, setRegistrationNumberCountByTaskCode] = useState(0);
    const [isCleared, setIsCleared] = useState(false);
    const [initialState, setInitialState] = useState(false);
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });

    const componentRef = useRef();
    const navigate = useNavigate();
    const alert = useAlert();

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission(), GetAllEmployeeSubCategoryMapping());
    }, []);

    useEffect(() => {
        if (!initialState) {
            trackPromise(getPermission());
        }
    }, []);

    useEffect(() => {
        getEstateDetailsByGroupID();
    }, [musterChitReport.groupID]);

    useEffect(() => {
        setMusterChitReport({
            ...musterChitReport,
            taskID: 0
        })
        setIsCleared(!isCleared)
    }, [musterChitReport.groupID, musterChitReport.operationEntityID, musterChitReport.payPointID, musterChitReport.employeeSubCategoryMappingID, musterChitReport.divisionID]);

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID(),
            GetDivisionDetailsByGroupID());
    }, [musterChitReport.groupID]);

    useEffect(() => {
        getDivisionDetailsByEstateID();
        GetTaskNamesByOperationID();
        GetMappedProductsByIDs();
    }, [musterChitReport.operationEntityID]);

    useEffect(() => {
        if (initialState) {
            setMusterChitReport((prevState) => ({
                ...prevState,
                operationEntityID: 0,
                divisionID: 0,
                payPointID: 0
            }));
        }
    }, [musterChitReport.groupID, initialState]);

    useEffect(() => {
        if (initialState) {
            setMusterChitReport((prevState) => ({
                ...prevState,
                divisionID: 0
            }));
        }
    }, [musterChitReport.operationEntityID, initialState]);

    useEffect(() => {
        setMusterchitDetailsData([]);
    }, [musterChitReport]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'MUSTERCHITREPORT');

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

        setMusterChitReport({
            ...musterChitReport,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            operationEntityID: parseInt(tokenService.getFactoryIDFromToken())
        })
        setInitialState(true);
    }
    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroupList(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(musterChitReport.groupID);
        setEstates(response);
    }

    async function getDivisionDetailsByEstateID() {
        var response = await services.getDivisionDetailsByEstateID(musterChitReport.operationEntityID);
        setDivisions(response);
    }

    async function GetDivisionDetailsByGroupID() {
        const result = await services.GetDivisionDetailsByGroupID(musterChitReport.groupID);
        setPayPoints(result)
    }

    async function GetAllEmployeeSubCategoryMapping() {
        const result = await services.GetAllEmployeeSubCategoryMapping();
        setEmployeeSubCategoryMapping(result)

    }

    async function GetTaskNamesByOperationID() {
        const task = await services.getTaskNamesByOperationID(musterChitReport.operationEntityID);
        setTask(task);
    }

    async function GetMappedProductsByIDs() {
        var response = await services.GetMappedProductsByFactoryID(musterChitReport.operationEntityID);
        setProducts(response);
    };

    async function GetDetails() {
        let model = {
            groupID: parseInt(musterChitReport.groupID),
            operationEntityID: parseInt(musterChitReport.operationEntityID),
            divisionID: parseInt(musterChitReport.divisionID),
            payPointID: parseInt(musterChitReport.payPointID),
            employeeSubCategoryMappingID: parseInt(musterChitReport.employeeSubCategoryMappingID),
            taskID: parseInt(musterChitReport.taskID),
            productID: parseInt(musterChitReport.productID),
            taskSickLeaveID: parseInt(musterChitReport.taskSickLeaveID),
            registrationNumber: musterChitReport.regNo,
            date: musterChitReport.date == "" ? "" : moment(musterChitReport.date).format('YYYY-MM-DD')
        }

        getSelectedDropdownValuesForReport(model);
        const response = await services.GetMusterChitReport(model)
        if (response.statusCode === "Success" && response.data !== null) {
            const attendData = response.data;
            const groupedCustomerList = response.data.reduce((acc, curr) => {
                const found = acc.find(item => item.taskCode === curr.taskCode);
                if (found) {
                    found.details.push(curr);
                } else {
                    acc.push({
                        taskName: curr.taskName,
                        taskCode: curr.taskCode,
                        details: [curr]
                    });
                }
                return acc;
            }, []);

            const registrationNumbersByTaskCode = groupedCustomerList.reduce((acc, group) => {
                const { taskCode, details } = group;
                if (!acc[taskCode]) {
                    acc[taskCode] = new Set();
                }
                details.forEach(detail => {
                    acc[taskCode].add(detail.registrationNumber);
                });
                return acc;
            }, {});
            let result = [];
            let res = [];
            let resG = [];
            let resC = [];
            let resS = [];
            attendData.forEach(y => {
                result.push(y);
                if (y.jobType !== 'S') {
                    res.push(y);
                }
                if (y.jobType == 'G') {
                    resG.push(y);
                }
                if (y.jobType == 'C') {
                    resC.push(y);
                }
                if (y.jobType == 'S') {
                    resS.push(y);
                }
            });
            const registrationNumbersByTaskCodex = Object.keys(registrationNumbersByTaskCode).map(taskCode => ({
                taskCode,
                count: registrationNumbersByTaskCode[taskCode].size
            }));
            const registrationNumbers = new Set(response.data.map(item => item.registrationNumber));
            const registrationNumberCount = registrationNumbers.size;
            setRegistrationNumberCount(registrationNumberCount)
            setTransCount(res.length);
            setGenCount(resG.length);
            setCashCount(resC.length);
            setSusCount(resS.length);
            setRegistrationNumberCountByTaskCode(registrationNumbersByTaskCodex)
            setMusterchitDetailsData(groupedCustomerList);
            setMusterchitDetailsDataOne(response.data)
        }
        else {
            alert.error("No records to display");
        }
    }

    function groupBy(arr, key) {
        return arr.reduce((acc, obj) => {
            const prop = obj[key];
            acc[prop] = acc[prop] || [];
            acc[prop].push(obj);
            return acc;
        }, {});
    }

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            array.map(x => {
                var vr = {
                    'Location': x.factoryName,
                    'Sub Division': x.divisionName,
                    'Pay Point': x.payPointName,
                    'Reg No': x.registrationNumber,
                    'Employee Name': x.employeeName,
                    'Short Code': x.taskCode,
                    'Task Name': x.taskName,
                    'Work Type': x.jobType == 'G' ? 'General' : x.jobType == 'C' ? 'Cash' : x.jobType == 'S' ? 'Suspended' : '-',
                    'Field': x.fieldName == null ? '-' : x.fieldName,
                    'Target': x.assignQuntity,
                    'Actual': x.completedQuntity,
                    'Assign (Date/Time)': x.assignAt == null ? "-" : moment(x.assignAt).format('YYYY-MM-DD hh:mm:ss a'),
                    'Started (Date/Time)': x.startedAt == null ? "-" : moment(x.startedAt).format('YYYY-MM-DD hh:mm:ss a'),
                    'Completed (Date/Time)': x.completedTime == null ? "-" : moment(x.completedTime).format('YYYY-MM-DD hh:mm:ss a'),
                    'Status': x.status
                };
                res.push(vr);
            });

            res.push([]);
            var vr = {
                'Location': 'Business Division - ' + selectedSearchValues.groupName,
                'Sub Division': 'Location - ' + selectedSearchValues.estateName,
                'Pay Point': 'Pay Point - ' + selectedSearchValues.payPointName,
                'Reg No': 'Employee Sub Category - ' + selectedSearchValues.employeeSubCategory,
            };
            res.push(vr);
        }
        return res;
    }
    async function createFile() {
        var file = await createDataForExcel(musterchitDetailsDataOne);
        var settings = {
            sheetName: 'Muster Chit Report',
            fileName:
                'Muster Chit Report',
            writeOptions: {}
        };
        let keys = Object.keys(file[0]);
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem });
        });
        let dataA = [
            {
                sheet: 'Muster Chit Report',
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
        setMusterChitReport({
            ...musterChitReport,
            [e.target.name]: value
        });
    }

    function handleSearchDropdownChangeTask(data, e) {
        if (data === undefined || data === null) {
            setMusterChitReport({
                ...musterChitReport,
                taskID: 0,
                taskCode: ''
            });
            return;
        } else {
            var nameV = "taskID";
            var valueV = data["taskID"];;
            setMusterChitReport({
                ...musterChitReport,
                taskID: valueV.toString(),
                taskCode: data.taskCode
            });
        }
    }

    function handleDateChange(value) {
        setMusterChitReport({
            ...musterChitReport,
            date: value
        });
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: GroupList[searchForm.groupID],
            estateName: estates[searchForm.operationEntityID],
            divisionName: divisions[searchForm.divisionID],
            payPointName: PayPoints[searchForm.payPointID],
            employeeSubCategory: employeeSubCategoryMapping[searchForm.employeeSubCategoryMappingID],
            productName: products[searchForm.productID],
            date: searchForm.date,
            taskSickLeave: searchForm.taskSickLeaveID == 0 ? 'With Sick Leave' : searchForm.taskSickLeaveID == 2 ? 'WithOut Sick Leave' : 'Only Sick Leave'
        })

    }

    const getAge = birthDate => Math.floor((new Date() - new Date(birthDate).getTime()) / 3.15576e+10)
    return (
        <Page className={classes.root} title={title}>
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: musterChitReport.groupID,
                        operationEntityID: musterChitReport.operationEntityID,
                        divisionID: musterChitReport.divisionID,
                        employeeSubCategoryMappingID: musterChitReport.employeeSubCategoryMappingID,
                        date: musterChitReport.date,
                        taskID: musterChitReport.taskID,
                        productID: musterChitReport.productID
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Business Division is required').min("1", 'Business Division is required'),
                            date: Yup.string().notRequired().nullable(),
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
                                                        Business Division *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.groupID && errors.groupID)}
                                                        fullWidth
                                                        helperText={touched.groupID && errors.groupID}
                                                        name="groupID"
                                                        onChange={(e) => handleChange(e)}
                                                        value={musterChitReport.groupID}
                                                        variant="outlined"
                                                        size='small'
                                                        InputProps={{
                                                            readOnly: !permissionList.isGroupFilterEnabled,
                                                        }}
                                                    >
                                                        <MenuItem value="0">--Select Business Division--</MenuItem>
                                                        {generateDropDownMenu(GroupList)}
                                                    </TextField>
                                                </Grid>

                                                <Grid item md={3} xs={8}>
                                                    <InputLabel shrink id="operationEntityID">
                                                        Location
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.operationEntityID && errors.operationEntityID)}
                                                        fullWidth
                                                        helperText={touched.operationEntityID && errors.operationEntityID}
                                                        name="operationEntityID"
                                                        size='small'
                                                        onChange={(e) => {
                                                            handleChange(e)
                                                        }}
                                                        value={musterChitReport.operationEntityID}
                                                        variant="outlined"
                                                        id="operationEntityID"
                                                        InputProps={{
                                                            readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                        }}
                                                    >
                                                        <MenuItem value={0}>--All Locations--</MenuItem>
                                                        {generateDropDownMenu(estates)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={8}>
                                                    <InputLabel shrink id="divisionID">
                                                        Sub-Division
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="divisionID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={musterChitReport.divisionID}
                                                        variant="outlined"
                                                        id="divisionID"
                                                        size='small'
                                                    >
                                                        <MenuItem value="0">--All Sub-Divisions--</MenuItem>
                                                        {generateDropDownMenu(divisions)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={8}>
                                                    <InputLabel shrink id="payPointID">
                                                        Pay Point
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.payPointID && errors.payPointID)}
                                                        fullWidth
                                                        helperText={touched.payPointID && errors.payPointID}
                                                        name="payPointID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={musterChitReport.payPointID}
                                                        variant="outlined"
                                                        id="payPointID"
                                                        size='small'
                                                    >
                                                        <MenuItem value="0">--All Pay Points--</MenuItem>
                                                        {generateDropDownMenu(PayPoints)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={8}>
                                                    <InputLabel shrink id="employeeSubCategoryMappingID">
                                                        Employee Sub Category
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.employeeSubCategoryMappingID && errors.employeeSubCategoryMappingID)}
                                                        fullWidth
                                                        size='small'
                                                        id="employeeSubCategoryMappingID"
                                                        onBlur={handleBlur}
                                                        name="employeeSubCategoryMappingID"
                                                        value={musterChitReport.employeeSubCategoryMappingID}
                                                        type="text"
                                                        variant="outlined"
                                                        onChange={(e) => handleChange(e)}
                                                    >
                                                        <MenuItem value="0">--All Employee Sub Categories--</MenuItem>
                                                        {generateDropDownMenu(employeeSubCategoryMapping)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={8}>
                                                    <InputLabel shrink id="taskID">
                                                        Task
                                                    </InputLabel>
                                                    <Autocomplete
                                                        key={isCleared}
                                                        id="taskID"
                                                        options={task}
                                                        getOptionLabel={option => option.taskName ?? option.taskName}
                                                        onChange={(e, value) =>
                                                            handleSearchDropdownChangeTask(value, e)
                                                        }
                                                        renderInput={params => (
                                                            <TextField
                                                                {...params}
                                                                variant="outlined"
                                                                name="taskID"
                                                                size="small"
                                                                fullWidth
                                                                value={musterChitReport.taskID}
                                                                getOptionDisabled={true}
                                                            />
                                                        )}
                                                    />
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="productID">
                                                        Product
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.productID && errors.productID)}
                                                        fullWidth
                                                        helperText={touched.productID && errors.productID}
                                                        name="productID"
                                                        size='small'
                                                        onChange={(e) => handleChange(e)}
                                                        value={musterChitReport.productID}
                                                        variant="outlined"
                                                        id="productID"
                                                        onBlur={handleBlur}
                                                    >
                                                        <MenuItem value={0}>--All Products--</MenuItem>
                                                        {generateDropDownMenu(products)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="taskSickLeaveID">
                                                        Sick Leave
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        size='small'
                                                        name="taskSickLeaveID"
                                                        onChange={(e) => handleChange(e)}
                                                        value={musterChitReport.taskSickLeaveID}
                                                        variant="outlined"
                                                        id="taskSickLeaveID"
                                                    >
                                                        <MenuItem value="0">--With Sick Leave--</MenuItem>
                                                        <MenuItem value="1">WithOut Sick Leave</MenuItem>
                                                        <MenuItem value="2">Only Sick Leave</MenuItem>
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12} >
                                                    <InputLabel shrink id="regNo">
                                                        Registration No.
                                                    </InputLabel>
                                                    <TextField
                                                        fullWidth
                                                        size='small'
                                                        name="regNo"
                                                        onChange={(e) => handleChange(e)}
                                                        value={musterChitReport.regNo}
                                                        variant="outlined"
                                                        id="regNo"
                                                    >
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
                                                            format="yyyy-MM-dd"
                                                            margin="dense"
                                                            id="date"
                                                            value={musterChitReport.date}
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
                                            <br /><br />
                                            <Box minWidth={1050}>
                                                {musterchitDetailsData.length > 0 ? (
                                                    <Chip
                                                        icon={<CircleIcon
                                                            fontSize='small' />}
                                                        label={"Total Employee Count: " + registrationNumberCount}
                                                        color="secondary"
                                                        variant="outlined"
                                                    />
                                                ) : null}
                                                &nbsp; &nbsp;
                                                {musterchitDetailsData.length > 0 ? (
                                                    <Chip
                                                        icon={<CircleIcon
                                                            fontSize='small' color='success' />}
                                                        label={"G : " + genCount}
                                                        style={{ color: "green", fontStyle: "bold", borderColor: "green" }}
                                                        variant="outlined"
                                                    />
                                                ) : null}
                                                &nbsp; &nbsp;
                                                {musterchitDetailsData.length > 0 ? (
                                                    <Chip
                                                        icon={<CircleIcon
                                                            fontSize='small' color='error' />}
                                                        label={"C : " + cashCount}
                                                        style={{ color: "red", fontStyle: "bold", borderColor: "red" }}
                                                        variant="outlined"
                                                    />
                                                ) : null}
                                                &nbsp; &nbsp;
                                                {musterchitDetailsData.length > 0 ? (
                                                    <Chip
                                                        icon={<CircleIcon
                                                            fontSize='small' style={{ color: "orange" }} />}
                                                        label={"S : " + susCount}
                                                        style={{ color: "orange", fontStyle: "bold", borderColor: "orange" }}
                                                        variant="outlined"
                                                    />
                                                ) : null}
                                                &nbsp; &nbsp;
                                                {musterchitDetailsData.length > 0 ? (
                                                    <Chip
                                                        icon={<CircleIcon
                                                            fontSize='small' />}
                                                        label={"Transaction Count: " + transCount}
                                                        color="secondary"
                                                        variant="outlined"
                                                    />
                                                ) : null}
                                                &nbsp; &nbsp;
                                                {musterchitDetailsData.length > 0 ? (
                                                    <Chip
                                                        icon={<CircleIcon
                                                            fontSize='small' />}
                                                        label={"Record: " + musterchitDetailsDataOne.length}
                                                        color="secondary"
                                                        style={{ position: 'absolute', right: 15 }}
                                                        variant="outlined"
                                                    />
                                                ) : null}
                                                <br />
                                                <br />
                                                {musterchitDetailsData.length > 0 ? (
                                                    <TableContainer component={Paper}>
                                                        <Table className={classes.table} aria-label="simple table" size='small'>
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell align="left" style={{ fontWeight: 'bold', borderBottom: '1px solid black', borderTop: '1px solid black' }}>
                                                                        Reg. No
                                                                    </TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: 'bold', borderBottom: '1px solid black', borderTop: '1px solid black' }}>
                                                                        Employee Name
                                                                    </TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: 'bold', borderBottom: '1px solid black', borderTop: '1px solid black' }}>
                                                                        W/Type
                                                                    </TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: 'bold', borderBottom: '1px solid black', borderTop: '1px solid black' }}>
                                                                        Field
                                                                    </TableCell>
                                                                    {/* <TableCell align="left" style={{ fontWeight: 'bold', borderBottom: '1px solid black', borderTop: '1px solid black' }}>
                                                                        Assign (Date/Time)
                                                                    </TableCell> */}
                                                                    <TableCell align="left" style={{ fontWeight: 'bold', borderBottom: '1px solid black', borderTop: '1px solid black' }}>
                                                                        Started (Date/Time)
                                                                    </TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: 'bold', borderBottom: '1px solid black', borderTop: '1px solid black' }}>
                                                                        Completed (Date/Time)
                                                                    </TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {musterchitDetailsData.map((data, i) => {
                                                                    const taskCount = registrationNumberCountByTaskCode.find(item => item.taskCode === data.taskCode)?.count || 0;
                                                                    const sortedDetails = data.details.sort((a, b) => a.registrationNumber.localeCompare(b.registrationNumber));
                                                                    return (
                                                                        <React.Fragment key={i}>
                                                                            <TableRow>
                                                                                <TableCell colSpan={2} component="th" scope="row" align="left" style={{ fontWeight: 'bolder', color: 'green', borderBottom: '1px solid black' }}>
                                                                                    Task Name : {data.taskName + ' - ' + data.taskCode}
                                                                                </TableCell>
                                                                                <TableCell colSpan={1} component="th" scope="row" align="left" style={{ fontWeight: 'bolder', color: 'green', borderBottom: '1px solid black' }}>
                                                                                    Emp Count : {taskCount}
                                                                                </TableCell>
                                                                                <TableCell colSpan={4} component="th" scope="row" align="left" style={{ fontWeight: 'bolder', color: 'green', borderBottom: '1px solid black' }}>
                                                                                    Transaction Count : {data.details.length}
                                                                                </TableCell>
                                                                            </TableRow>
                                                                            {sortedDetails.map((row, k) => {
                                                                                return (
                                                                                    <TableRow key={k}>
                                                                                        <TableCell component="th" scope="row" align="left" style={{ borderBottom: '1px dashed black' }}>
                                                                                            {row.registrationNumber}
                                                                                        </TableCell>
                                                                                        <TableCell component="th" scope="row" align="left" style={{ borderBottom: '1px dashed black' }}>
                                                                                            {row.employeeName}
                                                                                        </TableCell>
                                                                                        <TableCell component="th" scope="row" align="center" style={{ fontWeight: 'bold', borderBottom: '1px dashed black', color: row.jobType == 'G' ? 'green' : row.jobType == 'C' ? 'red' : row.jobType == 'S' ? 'orange' : 'inherit' }}>
                                                                                            {row.jobType}
                                                                                        </TableCell>
                                                                                        <TableCell component="th" scope="row" align="left" style={{ borderBottom: '1px dashed black' }}>
                                                                                            {row.fieldName == null ? '-' : row.fieldName}
                                                                                        </TableCell>
                                                                                        {/* <TableCell component="th" scope="row" align="left" style={{ borderBottom: '1px dashed black' }}>
                                                                                            {moment(row.assignAt).format('YYYY-MM-DD hh:mm:ss a')}
                                                                                        </TableCell> */}
                                                                                        <TableCell component="th" scope="row" align="left" style={{ borderBottom: '1px dashed black' }}>
                                                                                            {row.startedAt == null ? '-' : moment(row.startedAt).format('YYYY-MM-DD hh:mm:ss a')}
                                                                                        </TableCell>
                                                                                        <TableCell component="th" scope="row" align="left" style={{ borderBottom: '1px dashed black' }}>
                                                                                            {row.completedTime == null ? '-' : moment(row.completedTime).format('YYYY-MM-DD hh:mm:ss a')}
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                );
                                                                            })}
                                                                        </React.Fragment>
                                                                    );
                                                                })}
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                ) : null}
                                            </Box>
                                        </CardContent>
                                        {musterchitDetailsData.length > 0 ?
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                <Button
                                                    color="primary"
                                                    id="btnRecord"
                                                    type="submit"
                                                    variant="contained"
                                                    style={{ marginRight: '1rem' }}
                                                    className={classes.colorRecord}
                                                    onClick={() => createFile()}
                                                    size="small"
                                                >
                                                    EXCEL
                                                </Button>
                                                <div>&nbsp;</div>
                                                <ReactToPrint
                                                    documentTitle={"Muster Chit"}
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
                                                        searchData={selectedSearchValues} musterchitDetailsData={musterchitDetailsData} registrationNumberCount={registrationNumberCount} musterchitDetailsDataOne={musterchitDetailsDataOne}
                                                        registrationNumberCountByTaskCode={registrationNumberCountByTaskCode} transCount={transCount} genCount={genCount} cashCount={cashCount} susCount={susCount} />
                                                </div>
                                            </Box>
                                            : null
                                        }
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