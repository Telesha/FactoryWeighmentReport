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

const screenCode = 'PAYPOINTEXCEPTIONREPORT';

export default function PaypointExceptionReport(props) {
    const [title, setTitle] = useState("Paypoint Exception")
    const classes = useStyles();
    const [GroupList, setGroupList] = useState([]);
    const [estates, setEstates] = useState([]);
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [paypointExceptionData, setPaypointExceptionData] = useState([]);
    const isDayDisabled = (date) => {
        return !isSunday(date);
    };
    const curr = new Date;
    const first = curr.getDate() - curr.getDay();
    const last = first - 1;
    const friday = first + 5;
    const lastday = new Date(curr.setDate(last)).toISOString().substr(0, 10);
    const friday1 = new Date(curr.setDate(friday)).toISOString().substr(0, 10);
    const [paypointExceptionReport, setPaypointExceptionReport] = useState({
        groupID: '0',
        estateID: '0',
        date: new Date().toISOString().substr(0, 10),
    })
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: '0',
        estateName: '0',
        date: '',
    })
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const [initialState, setInitialState] = useState(false);
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
        trackPromise(getGroupsForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        if (!initialState) {
            trackPromise(getPermission());
        }
    }, []);

    useEffect(() => {
        getEstateDetailsByGroupID();
    }, [paypointExceptionReport.groupID]);

    useEffect(() => {
        if (initialState) {
            setPaypointExceptionReport((prevState) => ({
                ...prevState,
                estateID: 0,
            }));
        }
    }, [paypointExceptionReport.groupID, initialState]);

    useEffect(() => {
        setPaypointExceptionData([]);
        setPage(0);
    }, [paypointExceptionReport]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWPAYPOINTEXCEPTIONREPORT');

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

        setPaypointExceptionReport({
            ...paypointExceptionReport,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            estateID: parseInt(tokenService.getFactoryIDFromToken())
        });
        setInitialState(true);
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroupList(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(paypointExceptionReport.groupID);
        setEstates(response);
    }

    async function GetDetails() {
        let model = {
            groupID: parseInt(paypointExceptionReport.groupID),
            estateID: parseInt(paypointExceptionReport.estateID),
            date: new Date(paypointExceptionReport.date),
        }
        getSelectedDropdownValuesForReport(model);
        const response = await services.GetPaypointExceptionDetails(model);
        if (response.statusCode === "Success" && response.data !== null && response.data.length > 0) {
            setPaypointExceptionData(response.data);
            createDataForExcel(response.data);
        } else {
            setPaypointExceptionData([]);
            alert.error("No Records to Display");
        }
    }

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            array.map(x => {
                var vr = {
                    'Reg.No': x.registrationNumber,
                    'Emp.Name': x.employeeName,
                    'Paypoint Name': x.paypointName,
                    'Created Date': moment(x.createdDate).format('YYYY-MM-DD HH:mm:ss'),
                };
                res.push(vr);
            });
            res.push([]);
            var vr = {
                'Reg.No': 'Business Division - ' + selectedSearchValues.groupName,
                'Emp.Name': 'Location- ' + selectedSearchValues.estateName,
                'Paypoint Name': 'Date - ' + moment(selectedSearchValues.date).format('YYYY-MM-DD'),
            };
            res.push(vr);
        }
        return res;
    }

    async function createFile() {
        var file = await createDataForExcel(paypointExceptionData);
        var settings = {
            sheetName: 'Paypoint Exceptioon Report',
            fileName:
                'Paypoint Exceptioon Report',
            writeOptions: {}
        };
        let keys = Object.keys(file[0]);
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem });
        });
        let dataA = [
            {
                sheet: 'Paypoint Exceptioon Report',
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
        setPaypointExceptionReport({
            ...paypointExceptionReport,
            [e.target.name]: value
        });
    }

    function handleDateChange(value) {
        setPaypointExceptionReport({
            ...paypointExceptionReport,
            date: value
        });
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: GroupList[searchForm.groupID],
            estateName: estates[searchForm.estateID],
            date: paypointExceptionReport.date
        })
    }

    return (
        <Page className={classes.root} title={title}>
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: paypointExceptionReport.groupID,
                        estateID: paypointExceptionReport.estateID,
                        date: paypointExceptionReport.date
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Business Division is required').min("1", 'Business Division is required'),
                            estateID: Yup.number().required('Location is required').min("1", 'Location is required')
                        })
                    }
                    onSubmit={() => trackPromise(GetDetails())}
                    enableReinitialize
                >
                    {({
                        errors,
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
                                                        value={paypointExceptionReport.groupID}
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
                                                    <InputLabel shrink id="estateID">
                                                        Location *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.estateID && errors.estateID)}
                                                        fullWidth
                                                        helperText={touched.estateID && errors.estateID}
                                                        name="estateID"
                                                        size='small'
                                                        onChange={(e) => {
                                                            handleChange(e)
                                                        }}
                                                        value={paypointExceptionReport.estateID}
                                                        variant="outlined"
                                                        id="estateID"
                                                        InputProps={{
                                                            readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                        }}
                                                    >
                                                        <MenuItem value={0}>--Select Location--</MenuItem>
                                                        {generateDropDownMenu(estates)}
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
                                                            value={paypointExceptionReport.date}
                                                            onChange={(e) => handleDateChange(e)}
                                                            shouldDisableDate={isDayDisabled}
                                                            KeyboardButtonProps={{
                                                                'aria-label': 'change date',
                                                            }}
                                                        />
                                                    </MuiPickersUtilsProvider>
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
                                            <Box minWidth={1050} >
                                                <br></br>
                                                <br></br>
                                                {paypointExceptionData.length != 0 ?
                                                    <TableContainer component={Paper}>
                                                        <Table className={classes.table} aria-label="simple table" size='small'>
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: '1px solid black' }}>Reg.No</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: '1px solid black' }}>Emp.Name</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: '1px solid black' }}>Paypoint Name</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: '1px solid black' }}>Created Date</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {paypointExceptionData.slice(page * limit, page * limit + limit).map((row, i) => (
                                                                    <TableRow key={i}>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black" }}> {row.registrationNumber}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black" }}> {row.employeeName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black" }}> {row.paypointName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black" }}> {moment(row.createdDate).format('YYYY-MM-DD HH:mm:ss')}</TableCell>
                                                                    </TableRow>
                                                                )
                                                                )}
                                                            </TableBody>
                                                        </Table>
                                                        <TablePagination
                                                            component="div"
                                                            count={paypointExceptionData.length}
                                                            onChangePage={handlePageChange}
                                                            onChangeRowsPerPage={handleLimitChange}
                                                            page={page}
                                                            rowsPerPage={limit}
                                                            rowsPerPageOptions={[5, 10, 25]}
                                                        />
                                                    </TableContainer>
                                                    : null}
                                            </Box>
                                        </CardContent>
                                        {paypointExceptionData.length > 0 ?
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
                                                    documentTitle={"Paypoint Exception"}
                                                    trigger={() => <Button
                                                        color="primary"
                                                        id="btnRecord"
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
                                                        searchData={selectedSearchValues} paypointExceptionData={paypointExceptionData} />
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


