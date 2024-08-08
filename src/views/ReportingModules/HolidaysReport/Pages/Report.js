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
import xlsx from 'json-as-xlsx';
import _ from 'lodash';
import moment from "moment";

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

const screenCode = 'HOLIDAYSREPORT';

export default function HolidaysReport(props) {
    const [title, setTitle] = useState("Holiday Report")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [gardens, setGardens] = useState([]);
    const [holidayData, setHolidayData] = useState([]);
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [holidayDataList, setHolidayDataList] = useState({
        groupID: '0',
        gardenID: '0',
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
        trackPromise(getEstateDetailsByGroupID());
    }, [holidayDataList.groupID]);

    useEffect(() => {
        setHolidayData([]);
    }, [holidayDataList.gardenID]);

    useEffect(() => {
        setHolidayData([])
    }, [holidayDataList.fromDate]);

    useEffect(() => {
        setHolidayData([]);
    }, [holidayDataList.toDate]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWHOLIDAYSREPORT');

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

        setHolidayDataList({
            ...holidayDataList,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            gardenID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(holidayDataList.groupID);
        setGardens(response);
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
            groupID: parseInt(holidayDataList.groupID),
            gardenID: parseInt(holidayDataList.gardenID),
            fromDate: new Date(holidayDataList.fromDate),
            toDate: new Date(holidayDataList.toDate)
        }

        getSelectedDropdownValuesForReport(model);

        const response = await services.GetHolidayReportDetails(model);
        if (response.statusCode === "Success" && response.data !== null && response.data.length > 0) {
            setHolidayData(response.data);
            createDataForExcel(response.data);
        } else {
            setHolidayData([]);
            alert.error("No Records to Display");
        }
    }

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            array.map(x => {
                var vr = {
                    'Location': x.gardenName,
                    'Date': moment(x.date).format('YYYY-MM-DD'),
                    'Description': x.description,
                };
                res.push(vr);
            });
            res.push([]);
            var vr = {
                'Location': 'Business Division -' + selectedSearchValues.groupName,
                'Date': 'Location -' + selectedSearchValues.gardenName ,
                'Description': 'Date -' + selectedSearchValues.fromDate + ' to ' + selectedSearchValues.toDate,

            }
            res.push(vr);
        }
        return res;
    }

    async function createFile() {
        var file = await createDataForExcel(holidayData);
        var settings = {
            sheetName: 'Holidays Report',
            fileName:
                'Holidays Report',
            writeOptions: {}
        };
        let keys = Object.keys(file[0]);
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem });
        });
        let dataA = [
            {
                sheet: 'Holidays Report',
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
        setHolidayDataList({
            ...holidayDataList,
            [e.target.name]: value
        });
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: groups[searchForm.groupID],
            gardenName: gardens[searchForm.gardenID],
            fromDate: holidayDataList.fromDate,
            toDate: holidayDataList.toDate
        })
    }

    return (
        <Page className={classes.root} title={title}>
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: holidayDataList.groupID,
                        gardenID: holidayDataList.gardenID,
                        fromDate: holidayDataList.fromDate,
                        toDate: holidayDataList.toDate
                    }}
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
                                                        Business Division  *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.groupID && errors.groupID)}
                                                        fullWidth
                                                        helperText={touched.groupID && errors.groupID}
                                                        name="groupID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={holidayDataList.groupID}
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
                                                        Location 
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.gardenID && errors.gardenID)}
                                                        fullWidth
                                                        helperText={touched.gardenID && errors.gardenID}
                                                        name="gardenID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={holidayDataList.gardenID}
                                                        variant="outlined"
                                                        id="gardenID"
                                                        size='small'
                                                    >
                                                        <MenuItem value="0">--Select Garden--</MenuItem>
                                                        {generateDropDownMenu(gardens)}
                                                    </TextField>
                                                </Grid>

                                                <Grid item md={4} xs={8}>
                                                    <InputLabel shrink id="fromDate">
                                                        From *
                                                    </InputLabel>
                                                    <TextField
                                                        error={Boolean(touched.fromDate && errors.fromDate)}
                                                        helperText={touched.fromDate && errors.fromDate}
                                                        fullWidth
                                                        size='small'
                                                        name="fromDate"
                                                        type="date"
                                                        onChange={(e) => handleChange(e)}
                                                        value={holidayDataList.fromDate}
                                                        variant="outlined"
                                                        id="fromDate"
                                                    />
                                                </Grid>

                                                <Grid item md={4} xs={8}>
                                                    <InputLabel shrink id="toDate">
                                                        To *
                                                    </InputLabel>
                                                    <TextField
                                                        error={Boolean(touched.toDate && errors.toDate)}
                                                        helperText={touched.toDate && errors.toDate}
                                                        fullWidth
                                                        size='small'
                                                        name="toDate"
                                                        type="date"
                                                        onChange={(e) => handleChange(e)}
                                                        value={holidayDataList.toDate}
                                                        variant="outlined"
                                                        id="toDate"
                                                    />
                                                </Grid>
                                            </Grid>
                                            <Grid container justify="flex-end">
                                                <Box display="flex" flexDirection="row-reverse" justifyContent="right" p={2}>
                                                    <Button
                                                        color="primary"
                                                        type="submit"
                                                        variant="contained"
                                                    >
                                                        Search
                                                    </Button>
                                                </Box>
                                            </Grid>
                                            <br />
                                            <Box minWidth={1050}>
                                                {holidayData.length > 0 ?
                                                    <TableContainer component={Paper}>
                                                        <Table className={classes.table} aria-label="simple table">
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: '1px solid black' }}>Location</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: '1px solid black' }}>Date</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: '1px solid black' }}>Description</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {holidayData.slice(page * limit, page * limit + limit).map((row, i) => (
                                                                    <TableRow key={i}>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black" }}> {row.gardenName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black" }}> {moment(row.date).format('YYYY-MM-DD')}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black" }}> {row.description}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                        <TablePagination
                                                            component="div"
                                                            count={holidayData.length}
                                                            onChangePage={handlePageChange}
                                                            onChangeRowsPerPage={handleLimitChange}
                                                            page={page}
                                                            rowsPerPage={limit}
                                                            rowsPerPageOptions={[5, 50, 100]}
                                                        />
                                                    </TableContainer>
                                                    : null}
                                            </Box>
                                        </CardContent>
                                        {holidayData.length > 0 ?
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
                                                    documentTitle={"Holiday Report"}
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
                                                        searchData={selectedSearchValues} holidayData={holidayData}
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


