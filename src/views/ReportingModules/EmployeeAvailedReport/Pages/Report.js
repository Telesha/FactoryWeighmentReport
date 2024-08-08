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
    TablePagination
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
import moment from 'moment';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";

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

const screenCode = 'EMPLOYEEAVAILEDREPORT';

export default function EmployeeAvailedReport(props) {

    const [title, setTitle] = useState("Leave Availed")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [gardens, setGardens] = useState([]);
    const [costCenters, setCostCenters] = useState();
    const [payPoints, setPayPoints] = useState([]);
    const [employeeSubCategoryMapping, setEmployeeSubCategoryMapping] = useState();
    const [leaveTypes, setLeaveTypes] = useState();
    const [leaveTotals, setLeaveTotals] = useState([]);
    const [availedReportData, setAvailedReportData] = useState([]);
    const [initialState, setInitialState] = useState(false);
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const januaryFirst = new Date(year, 0, 1);
    const [fromDate, handleFromDate] = useState(januaryFirst);
    const [toDate, handleToDate] = useState(currentDate);

    const [availedReport, setAvailedReport] = useState({
        groupID: 0,
        gardenID: 0,
        costCenterID: 0,
        payPointID: 0,
        employeeSubCategoryMappingID: 0,
        regNo: '',
        fromDate: januaryFirst.toISOString().substr(0, 10),
        toDate: currentDate.toISOString().substr(0, 10)
    })

    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: "",
        gardenName: "",
        costCenterName: "",
        payPointName: "",
        employeeSubCategoryName: "",
        fromDate: "",
        toDate: ""
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

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission(), GetAllEmployeeSubCategoryMapping(), GetAllLeaveTypes());
    }, []);

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID(), GetDivisionDetailsByGroupID());
    }, [availedReport.groupID]);

    useEffect(() => {
        trackPromise(getCostCenterDetailsByGardenID());
    }, [availedReport.gardenID]);

    useEffect(() => {
        setAvailedReportData([])
    }, [availedReport]);

    useEffect(() => {
        setAvailedReport((prevState) => ({
            ...prevState,
            costCenterID: "0"
        }));
    }, [availedReport.groupID]);

    const handleLimitChange = (event) => {
        setLimit(event.target.value);
    };
    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    useEffect(() => {
        if (!initialState) {
            trackPromise(getPermission());
        }
    }, []);

    useEffect(() => {
        if (initialState) {
            setAvailedReport((prevState) => ({
                ...prevState,
                gardenID: 0,
                costCenterID: 0,
                payPointID: 0
            }));
        }
    }, [availedReport.groupID, initialState]);

    useEffect(() => {
        if (initialState) {
            setAvailedReport((prevState) => ({
                ...prevState,
                costCenterID: 0
            }));
        }
    }, [availedReport.gardenID, initialState]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWEMPLOYEEAVAILEDREPORT');

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

        setAvailedReport({
            ...availedReport,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            gardenID: parseInt(tokenService.getFactoryIDFromToken())
        })
        setInitialState(true);
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(availedReport.groupID);
        setGardens(response);
    };

    async function getCostCenterDetailsByGardenID() {
        var response = await services.getDivisionDetailsByEstateID(availedReport.gardenID);
        const elementCount = response.reduce((count) => count + 1, 0);
        var generated = generateDropDownMenu(response)
        if (elementCount === 1) {
            setAvailedReport((prevState) => ({
                ...prevState,
                costCenterID: generated[0].props.value,
            }));
        }
        setCostCenters(response);
    };

    async function GetDivisionDetailsByGroupID() {
        const result = await services.GetDivisionDetailsByGroupID(availedReport.groupID);
        setPayPoints(result)
    }

    async function GetAllEmployeeSubCategoryMapping() {
        const result = await services.GetAllEmployeeSubCategoryMapping();
        setEmployeeSubCategoryMapping(result)
    }

    async function GetAllLeaveTypes() {
        const result = await services.GetAllLeaveTypes();
        setLeaveTypes(result)
    }

    async function GetDetails() {

        let model = {
            groupID: parseInt(availedReport.groupID),
            gardenID: parseInt(availedReport.gardenID),
            costCenterID: parseInt(availedReport.costCenterID),
            payPointID: parseInt(availedReport.payPointID),
            employeeSubCategoryMappingID: parseInt(availedReport.employeeSubCategoryMappingID),
            regNo: availedReport.regNo,
            fromDate: moment(availedReport.fromDate.toString()).format('YYYY-MM-DD').split('T')[0],
            toDate: moment(availedReport.toDate.toString()).format('YYYY-MM-DD').split('T')[0],
        }
        getSelectedDropdownValuesForReport();
        const response = await services.GetDetails(model);
        if (response.length > 0) {
            const totals = {};
            response.forEach(data => {
                data.details.forEach(detail => {
                    if (!totals[detail.shortForm]) {
                        totals[detail.shortForm] = 0;
                    }
                    totals[detail.shortForm] += detail.leaveCount || 0;
                });
            });
            setLeaveTotals(totals);
            setAvailedReportData(response);
        }
        else {
            setAvailedReportData([]);
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
        setAvailedReport({
            ...availedReport,
            [e.target.name]: value
        });
    }

    function getSelectedDropdownValuesForReport() {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: groups[availedReport.groupID],
            gardenName: gardens[availedReport.gardenID],
            costCenterName: costCenters[availedReport.costCenterID],
            payPointName: payPoints[availedReport.payPointID],
            employeeSubCategoryName: employeeSubCategoryMapping[availedReport.employeeSubCategoryMappingID],
            fromDate: availedReport.fromDate,
            toDate: availedReport.toDate
        })
    }

    return (
        <Page className={classes.root} title={title}>
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: availedReport.groupID,
                        gardenID: availedReport.gardenID,
                        costCenterID: availedReport.costCenterID,
                        payPointID: availedReport.payPointID,
                        employeeSubCategoryMappingID: availedReport.employeeSubCategoryMappingID,
                        regNo: availedReport.regNo,
                        fromDate: availedReport.fromDate,
                        toDate: availedReport.toDate
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
                                                        Business Division  *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.groupID && errors.groupID)}
                                                        fullWidth
                                                        helperText={touched.groupID && errors.groupID}
                                                        name="groupID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={availedReport.groupID}
                                                        variant="outlined"
                                                        id="groupID"
                                                        size='small'
                                                        InputProps={{
                                                            readOnly: !permissionList.isGroupFilterEnabled,
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
                                                        value={availedReport.gardenID}
                                                        variant="outlined"
                                                        id="gardenID"
                                                        size='small'
                                                        InputProps={{
                                                            readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                        }}
                                                    >
                                                        <MenuItem value="0">--All Location--</MenuItem>
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
                                                        value={availedReport.costCenterID}
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
                                                        value={availedReport.payPointID}
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
                                                        value={availedReport.employeeSubCategoryMappingID}
                                                        type="text"
                                                        variant="outlined"
                                                        onChange={(e) => handleChange(e)}
                                                    >
                                                        <MenuItem value="0">--All Employee Categories--</MenuItem>
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
                                                            name='fromDate'
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

                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="regNo">
                                                        Registration Number
                                                    </InputLabel>
                                                    <TextField
                                                        fullWidth
                                                        size='small'
                                                        name="regNo"
                                                        onChange={(e) => handleChange(e)}
                                                        value={availedReport.regNo}
                                                        variant="outlined"
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
                                                <br></br>
                                                {availedReportData.length > 0 ?
                                                    <TableContainer component={Paper}>
                                                        <Table className={classes.table} aria-label="simple table" size='small'>
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell align="left" rowSpan={2} style={{ fontWeight: "bold", border: "1px solid black" }}>Reg. No</TableCell>
                                                                    <TableCell align="left" rowSpan={2} style={{ fontWeight: "bold", border: "1px solid black" }}>First Name</TableCell>
                                                                    <TableCell align="center" colSpan={leaveTypes.length} style={{ fontWeight: "bold", border: "1px solid black" }}>Leave Types</TableCell>
                                                                </TableRow>
                                                                <TableRow>
                                                                    {leaveTypes.map((shortForm, index) => (
                                                                        <TableCell key={index} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>{shortForm}</TableCell>
                                                                    ))}
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody style={{ border: "1px solid black" }}>
                                                                {availedReportData.slice(page * limit, page * limit + limit).map((data, i) => (
                                                                    <TableRow key={i}>
                                                                        <TableCell align="left" style={{ border: "1px dashed black" }}>{data.registrationNumber}</TableCell>
                                                                        <TableCell align="left" style={{ border: "1px dashed black" }}>{data.firstName}</TableCell>
                                                                        {leaveTypes.map((shortForm, k) => {
                                                                            const leaveCount = data.details.find(d => d.shortForm === shortForm)?.leaveCount || 0;
                                                                            return (
                                                                                <TableCell key={`${i}-${k}`} align="right" style={{ border: "1px dashed black" }}>{leaveCount}</TableCell>
                                                                            );
                                                                        })}
                                                                    </TableRow>
                                                                ))}
                                                                <TableRow>
                                                                    <TableCell align="left" colSpan={2} style={{ fontWeight: "bold", border: "1px solid black" }}>Total</TableCell>
                                                                    {leaveTypes.map((shortForm, k) => (
                                                                        <TableCell key={`total-${k}`} align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>{leaveTotals[shortForm] ? (leaveTotals[shortForm]).toLocaleString('en-US') : 0}</TableCell>
                                                                    ))}
                                                                </TableRow>
                                                            </TableBody>
                                                        </Table>
                                                        <TablePagination
                                                            component="div"
                                                            count={availedReportData.length}
                                                            onChangePage={handlePageChange}
                                                            onChangeRowsPerPage={handleLimitChange}
                                                            page={page}
                                                            rowsPerPage={limit}
                                                            rowsPerPageOptions={[5, 10, 25]}
                                                        />
                                                    </TableContainer> : null}
                                            </Box>
                                        </CardContent>
                                        {availedReportData.length > 0 ?
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                <ReactToPrint
                                                    documentTitle={"Leave Availed"}
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
                                                    <CreatePDF ref={componentRef} availedReportData={availedReportData} selectedSearchValues={selectedSearchValues} leaveTotals={leaveTotals} leaveTypes={leaveTypes} />
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