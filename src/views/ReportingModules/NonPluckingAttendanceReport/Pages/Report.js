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
import moment from 'moment';
import TablePagination from '@material-ui/core/TablePagination';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import xlsx from 'json-as-xlsx';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import LineWeightIcon from '@material-ui/icons/LineWeight';

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

const screenCode = 'NONPLUCKINGATTENDANCEREPORT';

export default function NonPluckingAttendanceReport(props) {
    const [title, setTitle] = useState("Attendance Record Export")
    const classes = useStyles();
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [groups, setGroups] = useState();
    const [date, setDate] = useState(new Date());
    const [gardens, setGardens] = useState([]);
    const [costCenters, setCostCenters] = useState();
    const [PayPoints, setPayPoints] = useState();
    const [products, setProducts] = useState([]);
    const [empCategory, setEmpCategory] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [attendanceDataList, setAttendanceDataList] = useState({
        groupID: '0',
        gardenID: '0',
        costCenterID: '0',
        payPointID: '0',
        productID: '0',
        empCategoryID: '0',
        date: '',
        jobTypeID: '0',
        labourTypeID: '0'
    })
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: "",
        gardenName: "",
        costCenterName: "",
        date: "",
        payPointName: "",
        productName: "",
        empCategoryName: "",
        jobTypeID: "",
        labourTypeID: ""
    })

    const [totalValues, setTotalValues] = useState({
        totalQuantity: 0,
        totalTarget: 0
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
        trackPromise(getGroupsForDropdown(), getPermission(), GetAllEmployeeSubCategoryMapping());
    }, []);

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID(), GetDivisionDetailsByGroupID());
    }, [attendanceDataList.groupID]);

    useEffect(() => {
        if (attendanceData.length != 0) {
            calculateTotalQty()
        }
    }, [attendanceData]);

    useEffect(() => {
        setAttendanceDataList((prevState) => ({
            ...prevState,
            costCenterID: "0"
        }));
    }, [attendanceDataList.groupID]);

    useEffect(() => {
        trackPromise(
            getCostCenterDetailsByGardenID(),
            GetMappedProductsByFactoryID()
        )
    }, [attendanceDataList.gardenID]);

    useEffect(() => {
        setAttendanceData([])
    }, [attendanceDataList]);

    useEffect(() => {
        setAttendanceData([])
    }, [date]);

    const handleLimitChange = (event) => {
        setLimit(event.target.value);
    };
    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWNONPLUCKINGATTENDANCEREPORT');

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

        setAttendanceDataList({
            ...attendanceDataList,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            gardenID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(attendanceDataList.groupID);
        setGardens(response);
    };

    async function getCostCenterDetailsByGardenID() {
        var response = await services.getDivisionDetailsByEstateID(attendanceDataList.gardenID);
        const elementCount = response.reduce((count) => count + 1, 0);
        var generated = generateDropDownMenu(response)
        if (elementCount === 1) {
            setAttendanceDataList((prevState) => ({
                ...prevState,
                costCenterID: generated[0].props.value,
            }));
        }
        setCostCenters(response);
    };

    async function GetDivisionDetailsByGroupID() {
        var response = await services.GetDivisionDetailsByGroupID(attendanceDataList.groupID);
        const elementCount = response.reduce((count) => count + 1, 0);
        var generated = generateDropDownMenu(response)
        if (elementCount === 1) {
            setAttendanceDataList((prevState) => ({
                ...prevState,
                payPointID: generated[0].props.value,
            }));
        }
        setPayPoints(response);
    };

    async function GetMappedProductsByFactoryID() {
        var response = await services.GetMappedProductsByFactoryID(attendanceDataList.gardenID);
        setProducts(response);
    };

    async function GetAllEmployeeSubCategoryMapping() {
        const result = await services.GetAllEmployeeSubCategoryMapping();
        setEmpCategory(result);
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
            groupID: parseInt(attendanceDataList.groupID),
            estateID: parseInt(attendanceDataList.gardenID),
            divisionID: parseInt(attendanceDataList.costCenterID),
            payPointID: parseInt(attendanceDataList.payPointID),
            productID: parseInt(attendanceDataList.productID),
            empCategoryID: parseInt(attendanceDataList.empCategoryID),
            jobTypeID: parseInt(attendanceDataList.jobTypeID),
            labourTypeID: parseInt(attendanceDataList.labourTypeID),
            date: moment(date).format('YYYY-MM-DD')
        }
        getSelectedDropdownValuesForReport(model);
        const response = await services.GetNonPluckingAttendanceDetails(model);
        if (response.statusCode == "Success" && response.data != null) {
            response.data.forEach(x => {
                if (x.assignQuntity != 0) {
                    x.amount = (x.quntity / x.assignQuntity) * x.rate
                } else {
                    x.amount = 0
                }

            });
            setAttendanceData(response.data)
            createDataForExcel(response.data);
        }
        else {
            setAttendanceData([])
            alert.error(response.message);
        }
    }

    function calculateTotalQty() {
        const totalQuantity = attendanceData.reduce((accumulator, current) => accumulator + current.actual, 0);
        const totalTarget = attendanceData.reduce((accumulator, current) => accumulator + current.target, 0);
        setTotalValues({
            ...totalValues,
            totalQuantity: totalQuantity,
            totalTarget: totalTarget
        })
    };

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            array.map(x => {
                var vr = {
                    'AttDate': moment(x.date).format('DD/MM/YYYY'),
                    'WorkType': x.jobTypeID == 1 ? 'General' : 'Cash',
                    'LabourType': (x.collectionPointID == x.workLocationID) ? 'General' : 'Lent Labour',
                    'TransactionDivision': x.pShortCode,
                    'CategoryCode': x.categoryCode,
                    'OutGarden': x.dShortCode,
                    'Crop': x.productName == 'Tea' ? 'TEA' : x.productName == 'Rubber' ? 'RUBBER' : x.productName,
                    'EmployeeNo': x.employeeCode,
                    'Jab': x.taskCode,
                    'Field': (x.fieldName !== null && x.fieldName !== '') ? x.fieldName : "NULL",
                    'Block': (x.block !== null && x.block !== '') ? x.block : "NULL",
                    'Target': x.target,
                    'Actual': x.actual,
                    // 'SubCategoryName': x.employeeSubCategoryName,
                };
                res.push(vr);
            });
            res.push({});

            // var totalRow = {
            //     'AttDate': 'Total',
            //     'Target': totalValues.totalTarget,
            //     'Actual': totalValues.totalQuantity,
            // };
            // res.push(totalRow);

            // var additionalInfoRow = {
            //     'AttDate': 'Business Division - ' + selectedSearchValues.groupName,
            //     'WorkType': 'Location - ' + selectedSearchValues.gardenName,
            //     'LabourType': selectedSearchValues.costCenterName == undefined ? 'Sub-Division - All Sub-Divisions' : 'Sub-Division - ' + selectedSearchValues.costCenterName,
            //     'TransactionDivision': selectedSearchValues.payPointName == undefined ? 'Pay Point - All Pay Point' : 'Pay Point - ' + selectedSearchValues.payPointName,
            //     'CategoryCode': selectedSearchValues.productName == undefined ? 'Product - All Products' : 'Product - ' + selectedSearchValues.productName,
            //     'OutGarden': selectedSearchValues.empTypeID == undefined ? 'Employee Category - All Employee Category' : 'Employee Category - ' + selectedSearchValues.empTypeID,
            //     'Crop': selectedSearchValues.jobTypeID == 1 ? 'Work Type - General' : selectedSearchValues.jobTypeID == 2 ? 'Work Type - Cash Work' : 'Work Type - All',
            //     'EmployeeNo': selectedSearchValues.labourTypeID == 1 ? 'Labour Type - General' : selectedSearchValues.labourTypeID == 2 ? 'Labour Type - Lent Labour' : selectedSearchValues.labourTypeID == 3 ? 'Labour Type - Inter Center Lent Labour' : 'Labour Type - All',
            //     'Jab': 'Date - ' + moment(selectedSearchValues.date.toString()).format().split('T')[0]
            // };
            // res.push(additionalInfoRow);
        }
        return res;
    }

    async function createFile() {
        var file = await createDataForExcel(attendanceData);
        var settings = {
            sheetName: 'Sheet1',
            fileName:
                'Attendance Record Export'
        };

        let keys = Object.keys(file[0]);
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem });
        });

        let dataA = [
            {
                sheet: 'Sheet1',
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
        setAttendanceDataList({
            ...attendanceDataList,
            [e.target.name]: value
        });
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: groups[searchForm.groupID],
            gardenName: gardens[searchForm.estateID],
            costCenterName: costCenters[searchForm.divisionID],
            payPointName: PayPoints[searchForm.payPointID],
            productName: products[searchForm.productID],
            empCategoryName: empCategory[searchForm.empCategoryID],
            date: searchForm.date,
            jobTypeID: searchForm.jobTypeID,
            labourTypeID: searchForm.labourTypeID
        })
    }

    return (
        <Page className={classes.root} title={title}>
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: attendanceDataList.groupID,
                        gardenID: attendanceDataList.gardenID,
                        costCenterID: attendanceDataList.costCenterID
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Business Division is required').min("1", 'Business Division is required')
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
                                                        Business Division *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.groupID && errors.groupID)}
                                                        fullWidth
                                                        helperText={touched.groupID && errors.groupID}
                                                        name="groupID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={attendanceDataList.groupID}
                                                        variant="outlined"
                                                        id="groupID"
                                                        size='small'
                                                        InputProps={{
                                                            readOnly: !permissionList.isGroupFilterEnabled ? true : false
                                                        }}
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
                                                        value={attendanceDataList.gardenID}
                                                        variant="outlined"
                                                        id="gardenID"
                                                        size='small'
                                                        InputProps={{
                                                            readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                        }}
                                                    >
                                                        <MenuItem value="0">--All Locations--</MenuItem>
                                                        {generateDropDownMenu(gardens)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="costCenterID">
                                                        Sub Division
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.costCenterID && errors.costCenterID)}
                                                        fullWidth
                                                        helperText={touched.costCenterID && errors.costCenterID}
                                                        name="costCenterID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={attendanceDataList.costCenterID}
                                                        variant="outlined"
                                                        id="costCenterID"
                                                        size='small'

                                                    >
                                                        <MenuItem value="0">--All Sub Divisions--</MenuItem>
                                                        {generateDropDownMenu(costCenters)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="payPointID">
                                                        Pay Point
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="payPointID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={attendanceDataList.payPointID}
                                                        variant="outlined"
                                                        id="payPointID"
                                                        size='small'
                                                    >
                                                        <MenuItem value="0">--All Pay Points--</MenuItem>
                                                        {generateDropDownMenu(PayPoints)}
                                                    </TextField>
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
                                                        onChange={(e) => handleChange(e)}
                                                        size='small'
                                                        value={attendanceDataList.productID}
                                                        variant="outlined"
                                                        id="productID"
                                                    >
                                                        <MenuItem value="0">--All Products--</MenuItem>
                                                        {generateDropDownMenu(products)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="empCategoryID">
                                                        Employee Category
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="empCategoryID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={attendanceDataList.empCategoryID}
                                                        variant="outlined"
                                                        id="empCategoryID"
                                                        size='small'
                                                    >
                                                        <MenuItem value="0">--All Employee Categories--</MenuItem>
                                                        {generateDropDownMenu(empCategory)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="jobTypeID">
                                                        Work Type
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        size='small'
                                                        name="jobTypeID"
                                                        onChange={(e) => handleChange(e)}
                                                        value={attendanceDataList.jobTypeID}
                                                        variant="outlined"
                                                        id="jobTypeID"
                                                    >
                                                        <MenuItem value="0">--All Work Types--</MenuItem>
                                                        <MenuItem value="1">General</MenuItem>
                                                        <MenuItem value="2">Cash Work</MenuItem>
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="labourTypeID">
                                                        Labour Type
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        size='small'
                                                        name="labourTypeID"
                                                        onChange={(e) => handleChange(e)}
                                                        value={attendanceDataList.labourTypeID}
                                                        variant="outlined"
                                                        id="labourTypeID"
                                                    >
                                                        <MenuItem value="0">--All Labour Types--</MenuItem>
                                                        <MenuItem value="1">General</MenuItem>
                                                        <MenuItem value="2">Lent Labour</MenuItem>
                                                        <MenuItem value="3">Inter Center Lent Labour</MenuItem>
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="date">Date *</InputLabel>
                                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                        <KeyboardDatePicker
                                                            fullWidth
                                                            variant="inline"
                                                            format="yyyy/MM/dd"
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
                                                {attendanceData.length > 0 ? (
                                                    <Chip
                                                        icon={<LineWeightIcon />}
                                                        label={"Transaction Count: " + attendanceData.length}
                                                        color="secondary"
                                                        variant="outlined"
                                                    />
                                                ) : null}
                                                <br></br>
                                                <br></br>
                                                <br></br>
                                                {attendanceData.length > 0 ?
                                                    <TableContainer component={Paper}>
                                                        <Table className={classes.table} aria-label="simple table" size='small'>
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Attendance Date</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Work Type</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Labour Type</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Transaction Division</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Category Code</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Out Garden</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Crop</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Employee No</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Jab</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Field</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Block</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Target</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Actual</TableCell>
                                                                    {/* <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Sub Category Name</TableCell> */}
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {attendanceData.slice(page * limit, page * limit + limit).map((row, i) => (
                                                                    <TableRow key={i}>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {moment(row.date).format('DD/MM/YYYY')}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.jobTypeID == 1 ? 'General' : 'Cash'}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {(row.collectionPointID == row.workLocationID) ? 'General' : 'Lent Labour'}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.pShortCode}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.categoryCode}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.dShortCode}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.productName == 'Tea' ? 'TEA' : row.productName == 'Rubber' ? 'RUBBER' : row.productName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.employeeCode}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.taskCode}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.fieldName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.block}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.target}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.actual}</TableCell>
                                                                        {/* <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.employeeSubCategoryName}</TableCell> */}
                                                                    </TableRow>
                                                                )
                                                                )}
                                                            </TableBody>
                                                            <TableRow>
                                                                <TableCell colSpan={11} align={'left'} style={{ borderBottom: "none", border: "1px solid black" }}><b>Total</b></TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>{totalValues.totalTarget}</TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>{totalValues.totalQuantity}</TableCell>
                                                                {/* <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>{ }</TableCell> */}
                                                            </TableRow>
                                                        </Table>
                                                        <TablePagination
                                                            component="div"
                                                            count={attendanceData.length}
                                                            onChangePage={handlePageChange}
                                                            onChangeRowsPerPage={handleLimitChange}
                                                            page={page}
                                                            rowsPerPage={limit}
                                                            rowsPerPageOptions={[5, 10, 25]}
                                                        />
                                                    </TableContainer> : null}
                                            </Box>
                                        </CardContent>
                                        {attendanceData.length > 0 ?
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
                                                    documentTitle={"Attendance Record Export"}
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
                                                        searchData={selectedSearchValues} attendanceData={attendanceData}
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