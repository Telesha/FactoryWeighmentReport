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

const screenCode = 'EMPLOYEETRANSFERREPORT';

export default function EmployeeTransferReport(props) {
    const [title, setTitle] = useState("Employee Transfer")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [gardens, setGardens] = useState([]);
    const [costCenters, setCostCenters] = useState();
    const [fromDate, handleFromDate] = useState(new Date());
    const [payPoints, setPayPoints] = useState([]);
    const [employeeSubCategoryMapping, setEmployeeSubCategoryMapping] = useState();
    const [toDate, handleToDate] = useState(new Date());
    const [empData, setEmpData] = useState([]);
    const [employeeTransferList, setEmployeeTransferList] = useState({
        groupID: 0,
        gardenID: 0,
        costCenterID: 0,
        payPointID: 0,
        employeeSubCategoryMappingID: 0,
        registrationNumber: '',
        fromDate: new Date().toISOString().substr(0, 10),
        toDate: new Date().toISOString().substr(0, 10)
    })
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: "0",
        gardenName: "0",
        fromDate: '',
        toDate: ''
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
    const [csvHeaders, setCsvHeaders] = useState([]);

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission(), GetAllEmployeeSubCategoryMapping());
    }, []);


    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID(),
        );
    }, [employeeTransferList.groupID]);


    useEffect(() => {
        setEmpData([])
    }, [employeeTransferList]);

    useEffect(() => {
        setEmployeeTransferList((prevState) => ({
            ...prevState,
            costCenterID: "0"
        }));
    }, [employeeTransferList.groupID]);

    useEffect(() => {
        trackPromise(getCostCenterDetailsByGardenID());
    }, [employeeTransferList.gardenID]);

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID(), GetDivisionDetailsByGroupID());
    }, [employeeTransferList.groupID]);

    const handleLimitChange = (event) => {
        setLimit(event.target.value);
    };
    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'EMPLOYEETRANSFERREPORT');

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

        setEmployeeTransferList({
            ...employeeTransferList,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            gardenID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(employeeTransferList.groupID);
        setGardens(response);
    };

    async function GetDivisionDetailsByGroupID() {
        const result = await services.GetDivisionDetailsByGroupID(employeeTransferList.groupID);
        setPayPoints(result)
    }

    async function GetAllEmployeeSubCategoryMapping() {
        const result = await services.GetAllEmployeeSubCategoryMapping();
        setEmployeeSubCategoryMapping(result)
    }

    async function getCostCenterDetailsByGardenID() {
        var response = await services.getDivisionDetailsByEstateID(employeeTransferList.gardenID);
        const elementCount = response.reduce((count) => count + 1, 0);
        var generated = generateDropDownMenu(response)
        if (elementCount === 1) {
            setEmployeeTransferList((prevState) => ({
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
            legalEntity: parseInt(employeeTransferList.groupID),
            garden: parseInt(employeeTransferList.gardenID),
            costCenterID: parseInt(employeeTransferList.costCenterID),
            payPointID: parseInt(employeeTransferList.payPointID),
            employeeSubCategoryMappingID: parseInt(employeeTransferList.employeeSubCategoryMappingID),
            registrationNumber: employeeTransferList.registrationNumber,
            fromDate: moment(fromDate).format('YYYY-MM-DD'),
            toDate: moment(toDate).format('YYYY-MM-DD')
        }
        getSelectedDropdownValuesForReport(model);
        const response = await services.GetEmployeeTransferReportData(model);
        if (response.statusCode == "Success" && response.data != null) {
            setEmpData(response.data);
            createDataForExcel(response.data);
        } else {
            setEmpData([]);
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

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            array.map(x => {
                var vr = {
                    'Registration Number': x.registrationNumber,
                    'Name': x.employeeName,
                    'Work Location': x.workLocationName,
                    'PayPoint': x.payPointName,
                    'Created Date/Time': moment(x.createdDate).format('YYYY-MM-DD hh:mm:ss a'),
                    'Modified Date/Time': moment(x.modifiedDate).format('YYYY-MM-DD hh:mm:ss a'),

                };
                res.push(vr);
            });
            res.push([]);
            var vr = {
                'Registration Number': 'Business Division - ' + selectedSearchValues.groupName,
                'Name': 'Location - ' + selectedSearchValues.gardenName,
                'Work Location': ' Sub Division - ' + selectedSearchValues.costCenterName,
                'PayPoint': ' Pay Point - ' + selectedSearchValues.payPointName,
                'Created Date/Time': ' Employee Sub Category- ' + selectedSearchValues.employeeSubCategoryName,
            };
            res.push(vr);
        }
        return res;
    }

    async function createFile() {
        var file = await createDataForExcel(empData);
        var settings = {
            sheetName: 'Employee Transfer Report',
            fileName:
                'Employee Transfer Report ' + moment(selectedSearchValues.fromDate).format('YYYY/MM/DD') + '-' + moment(selectedSearchValues.toDate).format('YYYY/MM/DD')

        };

        let keys = Object.keys(file[0]);
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem });
        });

        let dataA = [
            {
                sheet: 'Employee Transfer Report',
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
        setEmployeeTransferList({
            ...employeeTransferList,
            [e.target.name]: value
        });
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: groups[searchForm.legalEntity],
            gardenName: gardens[searchForm.garden],
            costCenterName: costCenters[searchForm.costCenterID],
            payPointName: payPoints[searchForm.payPointID],
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
                        groupID: employeeTransferList.groupID,
                        gardenID: employeeTransferList.gardenID,
                        costCenterID: employeeTransferList.costCenterID,
                        payPointID: employeeTransferList.payPointID,
                        employeeSubCategoryMappingID: employeeTransferList.employeeSubCategoryMappingID,
                        registrationNumber: employeeTransferList.registrationNumber,
                        fromDate: fromDate,
                        todate: toDate
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
                                                        value={employeeTransferList.groupID}
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
                                                        value={employeeTransferList.gardenID}
                                                        variant="outlined"
                                                        id="gardenID"
                                                        size='small'
                                                        placeholder='--Select Garden--'
                                                    >
                                                        <MenuItem value="0">--Select Location--</MenuItem>
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
                                                        value={employeeTransferList.costCenterID}
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
                                                        error={Boolean(touched.payPointID && errors.payPointID)}
                                                        fullWidth
                                                        helperText={touched.payPointID && errors.payPointID}
                                                        name="payPointID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={employeeTransferList.payPointID}
                                                        variant="outlined"
                                                        id="payPointID"
                                                        size='small'
                                                    >
                                                        <MenuItem value="0">--All Pay Points--</MenuItem>
                                                        {generateDropDownMenu(payPoints)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="employeeSubCategoryMappingID">
                                                        Employee Category
                                                    </InputLabel>
                                                    <TextField select fullWidth
                                                        error={Boolean(touched.employeeSubCategoryMappingID && errors.employeeSubCategoryMappingID)}
                                                        helperText={touched.employeeSubCategoryMappingID && errors.employeeSubCategoryMappingID}
                                                        size='small'
                                                        onBlur={handleBlur}
                                                        id="employeeSubCategoryMappingID"
                                                        name="employeeSubCategoryMappingID"
                                                        value={employeeTransferList.employeeSubCategoryMappingID}
                                                        type="text"
                                                        variant="outlined"
                                                        onChange={(e) => handleChange(e)}
                                                    >
                                                        <MenuItem value="0">--All Employee Categories--</MenuItem>
                                                        {generateDropDownMenu(employeeSubCategoryMapping)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="registrationNumber">
                                                        Registration Number
                                                    </InputLabel>
                                                    <TextField
                                                        fullWidth
                                                        size='small'
                                                        name="registrationNumber"
                                                        onChange={(e) => handleChange(e)}
                                                        value={employeeTransferList.registrationNumber}
                                                        variant="outlined"
                                                    />
                                                </Grid>

                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="fromDate">From Date *</InputLabel>
                                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                        <KeyboardDatePicker
                                                            error={Boolean(touched.fromDate && errors.fromDate)}
                                                            fullWidth
                                                            helperText={touched.fromDate && errors.fromDate}
                                                            variant="inline"
                                                            format="yyyy/MM/dd"
                                                            margin="dense"
                                                            name='fromDate'
                                                            id='fromDate'
                                                            size='small'
                                                            value={fromDate}
                                                            disableFuture={true}
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
                                                            format="yyyy/MM/dd"
                                                            margin="dense"
                                                            name='todate'
                                                            id='todate'
                                                            size='small'
                                                            value={toDate}
                                                            disableFuture={true}
                                                            onChange={(e) => {
                                                                handleToDate(e)
                                                            }}
                                                            KeyboardButtonProps={{
                                                                'aria-label': 'change todate',
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
                                                <br>
                                                </br>
                                                {empData.length != 0 ?
                                                    <Card>
                                                        <TableContainer component={Paper}>
                                                            <Table className={classes.table} aria-label="simple table" size='small'>
                                                                <TableHead>
                                                                    <TableRow>
                                                                        <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Registration Number</TableCell>
                                                                        <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Name</TableCell>
                                                                        <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Work Location</TableCell>
                                                                        <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>PayPoint</TableCell>
                                                                        <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Created Date/Time</TableCell>
                                                                        <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Modified Date/Time</TableCell>

                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                    {empData.slice(page * limit, page * limit + limit).map((row, i) => (
                                                                        <TableRow key={i}>
                                                                            <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.registrationNumber}</TableCell>
                                                                            <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.employeeName}</TableCell>
                                                                            <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.workLocationName}</TableCell>
                                                                            <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.payPointName}</TableCell>
                                                                            <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {moment(row.createdDate).format('YYYY-MM-DD hh:mm:ss a')}</TableCell>
                                                                            <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {moment(row.modifiedDate).format('YYYY-MM-DD hh:mm:ss a')}</TableCell>
                                                                        </TableRow>
                                                                    )
                                                                    )}
                                                                </TableBody>
                                                            </Table>
                                                            <TablePagination
                                                                component="div"
                                                                count={empData.length}
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
                                        {empData.length > 0 ?
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
                                                    documentTitle={'Employee Transfer Report'}
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
                                                        reportData={empData}
                                                        searchData={selectedSearchValues}
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