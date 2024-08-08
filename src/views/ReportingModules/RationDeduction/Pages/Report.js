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
import moment from 'moment';
import TablePagination from '@material-ui/core/TablePagination';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import { isSunday } from 'date-fns';

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

const screenCode = 'RATIONDEDUCTION';

export default function RationDeduction(props) {
    const [title, setTitle] = useState("Ration Deduction")
    const classes = useStyles();
    const [GroupList, setGroupList] = useState([]);
    const [estates, setEstates] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [employeeType, setEmployeeType] = useState([]);
    const [employeeSubCategoryMapping, setEmployeeSubCategoryMapping] = useState([]);
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [supplementaryDetailsData, setSupplementaryDetailsData] = useState([]);
    const isDayDisabled = (date) => {
        return !isSunday(date);
    };
    const curr = new Date;
    const first = curr.getDate() - curr.getDay();
    const last = first - 1;
    const friday = first + 5;
    const lastday = new Date(curr.setDate(last)).toISOString().substr(0, 10);
    const friday1 = new Date(curr.setDate(friday)).toISOString().substr(0, 10);
    const [initialState, setInitialState] = useState(false);
    const [supplementaryDetailsReport, setSupplementaryDetailsReport] = useState({
        groupID: '0',
        operationEntityID: '0',
        employeeDivisionID: '0',
        employeeTypeID: 0,
        employeeSubCategoryMappingID: 0,
        regNo: '',
        date: new Date().toISOString().substr(0, 10),
    })
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: '',
        estateName: 0,
        divisionName: 0,
        employeeTypeName: "0",
        employeeSubCategory: "0",
        fromDate: '',
        date: '',
    })

    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);

    const componentRef = useRef();
    const navigate = useNavigate();
    const alert = useAlert();

    const handleLimitChange = (event) => {
        setLimit(event.target.value);
    };
    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

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
    }, [supplementaryDetailsReport.groupID]);

    useEffect(() => {
        getDivisionDetailsByEstateID();
    }, [supplementaryDetailsReport.operationEntityID]);

    useEffect(() => {
        if (initialState) {
            setSupplementaryDetailsReport((prevState) => ({
                ...prevState,
                operationEntityID: 0,
                employeeDivisionID: 0,
            }));
        }
    }, [supplementaryDetailsReport.groupID, initialState]);

    useEffect(() => {
        if (initialState) {
            setSupplementaryDetailsReport((prevState) => ({
                ...prevState,
                employeeDivisionID: 0
            }));
        }
    }, [supplementaryDetailsReport.operationEntityID, initialState]);

    useEffect(() => {
        setSupplementaryDetailsData([]);
        setPage(0);
    }, [supplementaryDetailsReport]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWRATIONDEDUCTION');

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

        setSupplementaryDetailsReport({
            ...supplementaryDetailsReport,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            operationEntityID: parseInt(tokenService.getFactoryIDFromToken())
        });
        getEmployeeTypesForDropdown();
        setInitialState(true);
    }

    async function getEmployeeTypesForDropdown() {
        const types = await services.getEmployeeTypesForDropdown();
        setEmployeeType(types);
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroupList(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(supplementaryDetailsReport.groupID);
        setEstates(response);
    }

    async function getDivisionDetailsByEstateID() {
        var response = await services.getDivisionDetailsByEstateID(supplementaryDetailsReport.operationEntityID);
        setDivisions(response);
    }

    async function GetAllEmployeeSubCategoryMapping() {
        const result = await services.GetAllEmployeeSubCategoryMapping();
        setEmployeeSubCategoryMapping(result)
    }

    async function GetDetails() {
        let model = {
            groupID: parseInt(supplementaryDetailsReport.groupID),
            operationEntityID: parseInt(supplementaryDetailsReport.operationEntityID),
            employeeDivisionID: parseInt(supplementaryDetailsReport.employeeDivisionID),
            employeeTypeID: parseInt(supplementaryDetailsReport.employeeTypeID),
            employeeCategoryID: parseInt(supplementaryDetailsReport.employeeCategoryID),
            employeeSubCategoryMappingID: parseInt(supplementaryDetailsReport.employeeSubCategoryMappingID),
            regNo: supplementaryDetailsReport.regNo,
            applicableDate: new Date(supplementaryDetailsReport.date),
        }
        getSelectedDropdownValuesForReport(model);
        const response = await services.GetFieldDetails(model);
        if (response.statusCode === "Success" && response.data !== null) {
            setSupplementaryDetailsData(response.data);
        } else {
            alert.error("No Records to Display");
        }
    }

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            array.map(group => {
                group.details.map(grp => {
                    grp.detailsx.map(detail => {
                        var vr = {
                            'Particulars': `${group.masterGroupName} - ${grp.groupName} - ${detail.factoryName}`,
                            'Labour on Book': parseFloat(detail.labourOnBook).toFixed(2),
                            'Grant Area': parseFloat(detail.grantArea).toFixed(2),
                            'Labour per Hectare': (detail.labourOnBook / detail.grantArea).toFixed(2)
                        };
                        res.push(vr);
                    });
                });
            });
        }
        return res;
    }

    async function createFile() {
        var file = await createDataForExcel(supplementaryDetailsData);
        var settings = {
            sheetName: 'Field Detail Report',
            fileName:
                'Field Detail Report',
            writeOptions: {}
        };
        let keys = Object.keys(file[0]);
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem });
        });
        let dataA = [
            {
                sheet: 'Field Detail Report',
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
        setSupplementaryDetailsReport({
            ...supplementaryDetailsReport,
            [e.target.name]: value
        });
    }

    function handleDateChange(value) {
        setSupplementaryDetailsReport({
            ...supplementaryDetailsReport,
            date: value
        });
    }
    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: GroupList[searchForm.groupID],
            estateName: estates[searchForm.operationEntityID],
            divisionName: divisions[searchForm.employeeDivisionID],
            employeeTypeName: employeeType[searchForm.employeeTypeID],
            employeeSubCategory: employeeSubCategoryMapping[searchForm.employeeSubCategoryMappingID],
            date: supplementaryDetailsReport.date
        })
    }

    return (
        <Page className={classes.root} title={title}>
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: supplementaryDetailsReport.groupID,
                        operationEntityID: supplementaryDetailsReport.operationEntityID,
                        employeeDivisionID: supplementaryDetailsReport.employeeDivisionID,
                        employeeTypeID: supplementaryDetailsReport.employeeTypeID,
                        employeeSubCategoryMappingID: supplementaryDetailsReport.employeeSubCategoryMappingID,
                        regNo: supplementaryDetailsReport.regNo,
                        date: supplementaryDetailsReport.date
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Business Division is required').min("1", 'Business Division is required'),
                            operationEntityID: Yup.number().required('Location is required').min("1", 'Location is required')
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
                                                        onChange={(e) => handleChange(e)}
                                                        value={supplementaryDetailsReport.groupID}
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

                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="operationEntityID">
                                                        Location *
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
                                                        value={supplementaryDetailsReport.operationEntityID}
                                                        variant="outlined"
                                                        id="operationEntityID"
                                                        InputProps={{
                                                            readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                        }}
                                                    >
                                                        <MenuItem value={0}>--Select Location--</MenuItem>
                                                        {generateDropDownMenu(estates)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="employeeDivisionID">
                                                        Sub Division
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="employeeDivisionID"
                                                        size='small'
                                                        onChange={(e) => {
                                                            handleChange(e)
                                                        }}
                                                        value={supplementaryDetailsReport.employeeDivisionID}
                                                        variant="outlined"
                                                        id="employeeDivisionID"
                                                    >
                                                        <MenuItem value={0}>--All Sub Divisions--</MenuItem>
                                                        {generateDropDownMenu(divisions)}
                                                    </TextField>
                                                </Grid>

                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="employeeTypeID">
                                                        Employee Type
                                                    </InputLabel>
                                                    <TextField select fullWidth
                                                        size='small'
                                                        onBlur={handleBlur}
                                                        id="employeeTypeID"
                                                        name="employeeTypeID"
                                                        value={supplementaryDetailsReport.employeeTypeID}
                                                        type="text"
                                                        variant="outlined"
                                                        onChange={e => handleChange(e)}
                                                    >
                                                        <MenuItem value="0">--All Employee Types--</MenuItem>
                                                        {generateDropDownMenu(employeeType)}
                                                    </TextField>
                                                </Grid>

                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="employeeSubCategoryMappingID">
                                                        Employee Category
                                                    </InputLabel>
                                                    <TextField select fullWidth
                                                        size='small'
                                                        id="employeeSubCategoryMappingID"
                                                        onBlur={handleBlur}
                                                        name="employeeSubCategoryMappingID"
                                                        value={supplementaryDetailsReport.employeeSubCategoryMappingID}
                                                        type="text"
                                                        variant="outlined"
                                                        onChange={(e) => handleChange(e)}
                                                    >
                                                        <MenuItem value="0">--All Employee Categories--</MenuItem>
                                                        {generateDropDownMenu(employeeSubCategoryMapping)}
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
                                                            format="yyyy/MM/dd"
                                                            margin="dense"
                                                            id="date"
                                                            value={supplementaryDetailsReport.date}
                                                            onChange={(e) => handleDateChange(e)}
                                                            shouldDisableDate={isDayDisabled}
                                                            KeyboardButtonProps={{
                                                                'aria-label': 'change date',
                                                            }}
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
                                                        value={supplementaryDetailsReport.regNo}
                                                        variant="outlined"
                                                    />
                                                </Grid>

                                            </Grid>
                                            <Grid container justify="flex-end">
                                                <Box pt={2}>
                                                    <Button
                                                        color="primary"
                                                        variant="contained"
                                                        type='submit'
                                                    >
                                                        Search
                                                    </Button>
                                                </Box>
                                            </Grid>
                                            <br />
                                            <br />
                                            <br />
                                            <Box style={{ maxWidth: '1500px', overflowX: 'auto', margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
                                                <br></br>
                                                <br></br>
                                                {supplementaryDetailsData.length > 0 ?
                                                    <TableContainer component={Paper}>
                                                        <Table className={classes.table} aria-label="simple table" size='small'>
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', width: '100px' }}>Emp.No</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', width: '100px' }}>Name</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', width: '100px' }}>Working Days</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', width: '100px' }}>Entitlement</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', width: '100px' }}>Eligible</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', width: '100px' }}>Khetland</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', width: '100px' }}>Qty.Issued</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', width: '100px' }}>Rate</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', width: '100px' }}>Value</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {supplementaryDetailsData.map((data, i) => {
                                                                    return (
                                                                        <React.Fragment key={i}>
                                                                            <TableRow>
                                                                                <TableCell colSpan={9} component="th" scope="row" align="left" style={{ fontWeight: 'bolder', color: 'green', borderBottom: '1px solid black' }}>Division: {data.divisionName} <div>Category: {data.employeeSubCategoryName}</div></TableCell>
                                                                            </TableRow>
                                                                            {data.detailsx.map((detail, k) => {
                                                                                return (
                                                                                    <TableRow key={`${i}-${k}`}>
                                                                                        <TableCell component="th" scope="row" align="left" style={{ borderBottom: "1px dashed black", width: '100px' }}> {detail.registrationNumber}</TableCell>
                                                                                        <TableCell component="th" scope="row" align="left" style={{ borderBottom: "1px dashed black", width: '100px' }}> {detail.fullName}</TableCell>
                                                                                        <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", width: '100px' }}> {detail.noOfAttendance}</TableCell>
                                                                                        <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", width: '100px' }}> {parseFloat(detail.entitleQuntity).toFixed(3)}</TableCell>
                                                                                        <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", width: '100px' }}> {parseFloat(detail.eligibleQuntity).toFixed(3)}</TableCell>
                                                                                        <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", width: '100px' }}> {parseFloat(detail.deductionQuntity).toFixed(3)}</TableCell>
                                                                                        <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", width: '100px' }}> {parseFloat(detail.quntityIssued).toFixed(3)}</TableCell>
                                                                                        <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", width: '100px' }}> {detail.perKgRate}</TableCell>
                                                                                        <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", width: '100px' }}> {detail.amount <= 0 ? '0' : parseFloat(detail.amount).toFixed(3)}</TableCell>
                                                                                    </TableRow>
                                                                                );
                                                                            })}

                                                                        </React.Fragment>
                                                                    );
                                                                })}
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer> : null}
                                            </Box>
                                        </CardContent>
                                        {supplementaryDetailsData.length > 0 ?
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                <div>&nbsp;</div>
                                                <ReactToPrint
                                                    documentTitle={"Ration Deduction"}
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
                                                        searchData={selectedSearchValues} supplementaryDetailsData={supplementaryDetailsData} />

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