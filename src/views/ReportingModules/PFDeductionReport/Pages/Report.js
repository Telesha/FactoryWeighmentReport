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

const screenCode = 'PFDEDUCTIONREPORT';

export default function PFDeductionReport(props) {
    const [title, setTitle] = useState("PF Deduction Report")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [gardens, setGardens] = useState([]);
    const [PayPoints, setPayPoints] = useState();
    const [employeeSubCategoryMapping, setEmployeeSubCategoryMapping] = useState();
    const [fromDate, handleFromDate] = useState(new Date());
    const [toDate, handleToDate] = useState(new Date());
    const [monthlyPFDeduction, setMonthlyPFDeduction] = useState([]);
    const [monthlyPFDeductionList, setMonthlyPFDeductionList] = useState({
        groupID: '0',
        gardenID: '0',
        payPointID: '0',
        employeeSubCategoryMappingID: '0',
        fromDate: new Date().toISOString().substr(0, 10),
        toDate: new Date().toISOString().substr(0, 10),
        regNo: ''
    })
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: "0",
        gardenName: "0",
        payPointName: '',
        employeeSubCategoryName: "",
        fromDate: '',
        toDate: ''
    })
    const [totalValues, setTotalValues] = useState({
        totalTotalPF: 0,
        totalPFBasic: 0,
        totalPFArearsT: 0
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
    const [csvHeaders, setCsvHeaders] = useState([]);
    const [initialState,setInitialState] = useState(false);

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission(), GetAllEmployeeSubCategoryMapping());
    }, []);

    useEffect(()=>{
        if(!initialState){
            trackPromise(getPermission());
        }
    },[])

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID())
    }, [monthlyPFDeductionList.groupID]);

    useEffect(() => {
        setMonthlyPFDeductionList((prevState) => ({
            ...prevState
        }));
    }, [monthlyPFDeductionList.groupID]);

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID(),
            GetDivisionDetailsByGroupID());
    }, [monthlyPFDeductionList.groupID]);

    useEffect(()=>{
        if(initialState){
            setMonthlyPFDeductionList((prevState)=>({
                ...prevState,
                gardenID:0,
                payPointID:0,
                regNo:""
            }));
        }

    },[monthlyPFDeductionList.groupID,initialState]);

    useEffect(()=>{
        
        setMonthlyPFDeductionList((prevState)=>({
            ...prevState,
            regNo:""
        }))
        
    },[
        monthlyPFDeductionList.payPointID,
        monthlyPFDeductionList.employeeSubCategoryMappingID,
    ]);
    useEffect(()=>{
        if(initialState){
            setMonthlyPFDeductionList((prevState)=>({
                ...prevState,
                regNo:""
            }))
        }
    },[monthlyPFDeductionList.gardenID,initialState]);



    useEffect(() => {
        setMonthlyPFDeduction([])
    }, [monthlyPFDeductionList]);

    useEffect(() => {
        if (setMonthlyPFDeductionList.length != 0) {
            calculateTotalQty()
        }
    }, [monthlyPFDeduction]);

    const handleLimitChange = (event) => {
        setLimit(event.target.value);
    };
    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWPFDEDUCTIONREPORT');

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

        setMonthlyPFDeductionList({
            ...monthlyPFDeductionList,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            gardenID: parseInt(tokenService.getFactoryIDFromToken())
        });
        setInitialState(true);
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(monthlyPFDeductionList.groupID);
        setGardens(response);
    };

    async function GetDivisionDetailsByGroupID() {
        const result = await services.GetDivisionDetailsByGroupID(monthlyPFDeductionList.groupID);
        setPayPoints(result)
    }

    async function GetAllEmployeeSubCategoryMapping() {
        var result = await services.GetAllEmployeeSubCategoryMapping();
        setEmployeeSubCategoryMapping(result)
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
            groupID: parseInt(monthlyPFDeductionList.groupID),
            gardenID: parseInt(monthlyPFDeductionList.gardenID),
            payPointID: parseInt(monthlyPFDeductionList.payPointID),
            employeeSubCategoryMappingID: parseInt(monthlyPFDeductionList.employeeSubCategoryMappingID),
            fromDate: moment(fromDate).format('YYYY-MM-DD'),
            toDate: moment(toDate).format('YYYY-MM-DD'),
            registrationNumber: monthlyPFDeductionList.regNo
        }
        getSelectedDropdownValuesForReport(model);
        const response = await services.GetPFDeductionReportDetails(model);
        if (response.statusCode == "Success" && response.data != null) {
            setMonthlyPFDeduction(response.data);
        } else {
            setMonthlyPFDeduction([]);
            alert.error("No records to display");
        }
    }

    function calculateTotalQty() {

        const totalTotalPF = monthlyPFDeduction.reduce((accumulator, current) => accumulator + current.totalPF, 0);
        const totalPFBasic = monthlyPFDeduction.reduce((accumulator, current) => accumulator + current.pfBasic, 0);
        const totalPFArearsT = monthlyPFDeduction.reduce((accumulator, current) => accumulator + current.totalPFArears, 0);

        setTotalValues({
            ...totalValues,
            totalTotalPF: totalTotalPF,
            totalPFBasic: totalPFBasic,
            totalPFArearsT: totalPFArearsT
        })
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

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            array.map(x => {
                var vr = {
                    'Reg.No': x.registrationNumber,
                    'Emp.Name': x.firstName,
                    'PF No': x.epfNumber == null ? '-' : x.epfNumber,
                    'Book No': x.bookNumber ? x.bookNumber : '-',
                    'PF Total': x.totalPF.toFixed(2),
                    'Total PF Arears': x.totalPFArears.toFixed(2),
                    'PF Basic': x.pfBasic.toFixed(2),
                };
                res.push(vr);
            });
            var vr = {
                'Reg.No': 'Total',
                'PF Total': totalValues.totalTotalPF == 0 ? '-' : totalValues.totalTotalPF.toFixed(2),
                'Total PF Arears': totalValues.totalPFArearsT == 0 ? '-' : totalValues.totalPFArearsT.toFixed(2),
                'PF Basic': totalValues.totalPFBasic == 0 ? '-' : totalValues.totalPFBasic.toFixed(2),
            };
            res.push(vr);
            res.push([])
            var vr = {
                'Reg.No': 'Business Division - ' + selectedSearchValues.groupName,
                'Emp.Name': 'Location - ' + ((selectedSearchValues.gardenName == undefined || selectedSearchValues.gardenName == "") ? 'All Locations' : selectedSearchValues.gardenName),
                'PF No': 'Pay Point - ' + ((selectedSearchValues.payPointName === undefined || selectedSearchValues.payPointName == "") ? 'All Pay Points' : selectedSearchValues.payPointName),
                'Book No': 'Employee Category - ' + ((selectedSearchValues.employeeSubCategoryName === undefined || selectedSearchValues.employeeSubCategoryName == "") ? 'All Employee Categories' : selectedSearchValues.employeeSubCategoryName),
                'PF Total': 'From Date - ' + moment(fromDate).format('YYYY-MM-DD'),
                'Total PF Arears': 'To Date - ' + moment(toDate).format('YYYY-MM-DD')
            };
            res.push(vr);
        }
        return res;
    }

    async function createFile() {
        var file = await createDataForExcel(monthlyPFDeduction);
        var settings = {
            sheetName: 'PF Deduction Report Report',
            fileName:
                'PF Deduction Report Report ' + moment(selectedSearchValues.fromDate).format('YYYY/MM/DD') + '-' + moment(selectedSearchValues.toDate).format('YYYY/MM/DD')
        };
        let keys = Object.keys(file[0]);

        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem });
        });

        let dataA = [
            {
                sheet: 'PF Deduction Report Report',
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
        setMonthlyPFDeductionList({
            ...monthlyPFDeductionList,
            [e.target.name]: value
        });
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: groups[searchForm.groupID],
            gardenName: gardens[searchForm.gardenID],
            payPointName: PayPoints[searchForm.payPointID],
            employeeSubCategoryName: employeeSubCategoryMapping[searchForm.employeeSubCategoryMappingID],
            toDate: toDate,
            fromDate: fromDate,
        })
    }

    return (
        <Page className={classes.root} title={title}>
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: monthlyPFDeductionList.groupID,
                        gardenID: monthlyPFDeductionList.gardenID,
                        payPointID: monthlyPFDeductionList.payPointID,
                        employeeSubCategoryMappingID: monthlyPFDeductionList.employeeSubCategoryMappingID,
                        fromDate: fromDate,
                        todate: toDate,
                        regNo: monthlyPFDeductionList.regNo
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Business Division is required').min("1", 'Business Division is required'),
                            fromDate: Yup.date().required('From Date is required'),
                            todate: Yup.date().required('To Date is required')
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
                                                        value={monthlyPFDeductionList.groupID}
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
                                                        value={monthlyPFDeductionList.gardenID}
                                                        variant="outlined"
                                                        id="gardenID"
                                                        size='small'
                                                        placeholder='--Select Garden--'
                                                    >
                                                        <MenuItem value="0">--All Locations--</MenuItem>
                                                        {generateDropDownMenu(gardens)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
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
                                                        value={monthlyPFDeductionList.payPointID}
                                                        variant="outlined"
                                                        id="payPointID"
                                                        size='small'
                                                    >
                                                        <MenuItem value="0">--All Pay Points--</MenuItem>
                                                        {generateDropDownMenu(PayPoints)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="employeeSubCategoryMappingID">
                                                        Employee Sub Category
                                                    </InputLabel>
                                                    <TextField select fullWidth
                                                        size='small'
                                                        onBlur={handleBlur}
                                                        id="employeeSubCategoryMappingID"
                                                        name="employeeSubCategoryMappingID"
                                                        value={monthlyPFDeductionList.employeeSubCategoryMappingID}
                                                        type="text"
                                                        variant="outlined"
                                                        onChange={(e) => handleChange(e)}
                                                    >
                                                        <MenuItem value="0">--All Employee Sub Categories--</MenuItem>
                                                        {generateDropDownMenu(employeeSubCategoryMapping)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="fromDate">From Date *</InputLabel>
                                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                        <KeyboardDatePicker
                                                            error={Boolean(touched.fromDate && errors.fromDate)}
                                                            fullWidth
                                                            helperText={touched.fromDate && errors.fromDate}
                                                            variant="inline"
                                                            format="yyyy-MM-dd"
                                                            margin="dense"
                                                            name='todate'
                                                            id='fromDate'
                                                            size='small'
                                                            value={fromDate}
                                                            onChange={(e) => {
                                                                handleFromDate(e)
                                                            }}
                                                            KeyboardButtonProps={{
                                                                'aria-label': 'change fromDate',
                                                            }}
                                                            autoOk
                                                        />
                                                    </MuiPickersUtilsProvider>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="todate">To Date *</InputLabel>
                                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                        <KeyboardDatePicker
                                                            error={Boolean(touched.todate && errors.todate)}
                                                            fullWidth
                                                            helperText={touched.todate && errors.todate}
                                                            variant="inline"
                                                            format="yyyy-MM-dd"
                                                            margin="dense"
                                                            name='todate'
                                                            id='todate'
                                                            size='small'
                                                            value={toDate}
                                                            onChange={(e) => {
                                                                handleToDate(e)
                                                            }}
                                                            KeyboardButtonProps={{
                                                                'aria-label': 'change todate',
                                                            }}
                                                            minDate={fromDate}
                                                            autoOk
                                                        />
                                                    </MuiPickersUtilsProvider>
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
                                                        value={monthlyPFDeductionList.regNo}
                                                        variant="outlined"
                                                        id="regNo"
                                                    >
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
                                                <br>
                                                </br>
                                                {monthlyPFDeduction.length != 0 ?
                                                    <Card>
                                                        <TableContainer component={Paper}>
                                                            <Table className={classes.table} aria-label="simple table" size='small'>
                                                                <TableHead>
                                                                    <TableRow>
                                                                        <TableCell align="left" style={{ fontWeight: 'bold', border: '1px solid black' }}>Reg.No</TableCell>
                                                                        <TableCell align="left" style={{ fontWeight: 'bold', border: '1px solid black' }}>Emp.Name</TableCell>
                                                                        <TableCell align="left" style={{ fontWeight: 'bold', border: '1px solid black' }}>PF No</TableCell>
                                                                        <TableCell align="left" style={{ fontWeight: 'bold', border: '1px solid black' }}>Book No</TableCell>
                                                                        <TableCell align="right" style={{ fontWeight: 'bold', border: '1px solid black' }}>PF Total</TableCell>
                                                                        <TableCell align="right" style={{ fontWeight: 'bold', border: '1px solid black' }}>Total PF Arears</TableCell>
                                                                        <TableCell align="right" style={{ fontWeight: 'bold', border: '1px solid black' }}>PF Basic</TableCell>
                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                    {monthlyPFDeduction.slice(page * limit, page * limit + limit).map((row, i) => (
                                                                        <TableRow key={i}>
                                                                            <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.registrationNumber}</TableCell>
                                                                            <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.firstName}</TableCell>
                                                                            <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.epfNumber}</TableCell>
                                                                            <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.bookNumber ? row.bookNumber : '-'}</TableCell>
                                                                            <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.totalPF == 0 ? '-' : row.totalPF.toFixed(2)}</TableCell>
                                                                            <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.totalPFArears == 0 ? '-' : row.totalPFArears.toFixed(2)}</TableCell>
                                                                            <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.pfBasic == 0 ? '-' : row.pfBasic.toFixed(2)}</TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                                <TableRow>
                                                                    <TableCell align={'left'} colSpan={4} style={{ border: "1px solid black", fontWeight: "bold", padding: '3px' }}><b>Total</b></TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", padding: '3px' }}>
                                                                        <b> {totalValues.totalTotalPF == 0 ? '-' : totalValues.totalTotalPF.toFixed(2)} </b>
                                                                    </TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", padding: '3px' }}>
                                                                        <b> {totalValues.totalPFArearsT == 0 ? '-' : totalValues.totalPFArearsT.toFixed(2)} </b>
                                                                    </TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", padding: '3px' }}>
                                                                        <b> {totalValues.totalPFBasic == 0 ? '-' : totalValues.totalPFBasic.toFixed(2)} </b>
                                                                    </TableCell>
                                                                </TableRow>
                                                            </Table>
                                                            <TablePagination
                                                                component="div"
                                                                count={monthlyPFDeduction.length}
                                                                onChangePage={handlePageChange}
                                                                onChangeRowsPerPage={handleLimitChange}
                                                                page={page}
                                                                rowsPerPage={limit}
                                                                rowsPerPageOptions={[5, 10, 25]}
                                                            />
                                                        </TableContainer>
                                                    </Card>
                                                    : null}
                                            </Box>
                                        </CardContent>
                                        {monthlyPFDeduction.length > 0 ?
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                <Button
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
                                                </Button>
                                                <ReactToPrint
                                                    documentTitle={'PF Deduction Report'}
                                                    trigger={() => (
                                                        <Button
                                                            color="primary"
                                                            id="btnRecord"
                                                            type="submit"
                                                            variant="contained"
                                                            style={{ marginRight: '1rem' }}
                                                            className={classes.colorCancel}
                                                            size="small"
                                                        >
                                                            PDF
                                                        </Button>
                                                    )}
                                                    content={() => componentRef.current}
                                                />
                                                <div hidden={true}>
                                                    <CreatePDF
                                                        ref={componentRef}
                                                        searchData={selectedSearchValues}
                                                        monthlyPFDeduction={monthlyPFDeduction}
                                                        totalValues={totalValues}
                                                        fromDate={fromDate}
                                                        toDate={toDate}
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