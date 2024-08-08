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
import { border } from '@material-ui/system';
import { forEach } from 'lodash';
import _ from 'lodash';
import { zbu2s } from 'jwt-js-decode';
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

const screenCode = 'DAILYLABOURREPORT';

export default function DailyLabourReport(props) {
    const [title, setTitle] = useState("Daily Labour Report")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [gardens, setGardens] = useState([]);
    const [mainHeader, setMainHeader] = useState([]);
    const [header, setHeader] = useState([]);
    const [totalRow, setTotalRow] = useState([]);
    const [csvtotalRow, setCsvTotalRow] = useState([]);
    const [costCenters, setCostCenters] = useState();
    const [allTotal, setAllTotal] = useState(0);
    const [dailylabourData, setDailylabourData] = useState([]);
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [fromDate, handleFromDate] = useState(new Date());
    const [toDate, handleToDate] = useState(new Date());
    const [dailylabourDataList, setDailylabourDataList] = useState({
        groupID: '0',
        gardenID: '0',
        costCenterID: '0',
        fromDate: new Date().toISOString().substr(0, 10),
        toDate: new Date().toISOString().substr(0, 10)
    })

    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: "0",
        gardenName: "0",
        costCenterName: "0",
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

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID());
    }, [dailylabourDataList.groupID]);

    useEffect(() => {
        setDailylabourDataList((prevState) => ({
            ...prevState,
            costCenterID: "0"
        }));
    }, [dailylabourDataList.groupID]);

    useEffect(() => {
        trackPromise(
            getCostCenterDetailsByGardenID()
        )
    }, [dailylabourDataList.gardenID]);

    useEffect(() => {
        setDailylabourData([])
    }, [dailylabourDataList.gardenID]);

    useEffect(() => {
        setDailylabourData([])
    }, [dailylabourDataList.costCenterID]);

    useEffect(() => {
        setDailylabourData([])
    }, [dailylabourDataList.fromDate]);

    useEffect(() => {
        setDailylabourData([]);
    }, [dailylabourDataList.toDate]);

    useEffect(() => {
        setDailylabourData([]);
    }, [dailylabourDataList.empTypeID]);

    useEffect(() => {
        setDailylabourData([]);
    }, [dailylabourDataList.factoryJobID]);

    useEffect(() => {
        setDailylabourData([]);
    }, [dailylabourDataList.fieldID]);

    useEffect(() => {
        setDailylabourData([]);
    }, [dailylabourDataList.costCenterID]);

    const handleLimitChange = (event) => {
        setLimit(event.target.value);
    };
    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWDAILYLABOURREPORT');

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

        setDailylabourDataList({
            ...dailylabourDataList,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            gardenID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(dailylabourDataList.groupID);
        setGardens(response);
    };

    async function getCostCenterDetailsByGardenID() {
        var response = await services.getDivisionDetailsByEstateID(dailylabourDataList.gardenID);
        const elementCount = response.reduce((count) => count + 1, 0);
        var generated = generateDropDownMenu(response)
        if (elementCount === 1) {
            setDailylabourDataList((prevState) => ({
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
            groupID: parseInt(dailylabourDataList.groupID),
            gardenID: parseInt(dailylabourDataList.gardenID),
            costCenterID: parseInt(dailylabourDataList.costCenterID),
            fromDate: new Date(dailylabourDataList.fromDate),
            toDate: new Date(dailylabourDataList.toDate)
        }

        getSelectedDropdownValuesForReport(model);

        const response = await services.GetDailyLabourDetails(model);
        if (response.statusCode == "Success" && response.data != null) {
            const countsByTask = [];
            response.data.forEach((record) => {
                const { employeeTypeID, employeeTypeName, taskID, taskName, gangID, gangName } = record;
                let existingTask = countsByTask.find(task => task.taskID === taskID && task.employeeTypeID === employeeTypeID && task.gangID === gangID);

                if (!existingTask) {
                    existingTask = {
                        taskID: taskID,
                        taskName: taskName,
                        gangID: gangID,
                        gangName: gangName,
                        employeeTypeName: employeeTypeName,
                        employeeTypeID: employeeTypeID,
                        value: 0
                    };
                    countsByTask.push(existingTask);
                }
                existingTask.value++;
            });
            const sumData = countsByTask.reduce((result, obj) => {
                const groupKey = `${obj.employeeTypeID}-${obj.gangID}`;
                if (!result[groupKey]) {
                    result[groupKey] = {
                        employeeTypeID: obj.employeeTypeID,
                        gangID: obj.gangID,
                        sumValue: 0
                    };
                }
                result[groupKey].sumValue += obj.value;
                return result;
            }, {});
            const sortedSumDataOne = Object.entries(sumData).map(([key, value]) => (value));
            setTotalRow(sortedSumDataOne)
            const sumCsvData = countsByTask.reduce((result, obj) => {
                var gangName = obj.gangName;
                var employeeTypeName = obj.employeeTypeName.charAt(0);
                const groupKey = `${employeeTypeName}-${gangName}`;
                if (!result[groupKey]) {
                    result[groupKey] = 0
                }
                result[groupKey] += obj.value;
                return result;
            }, {});
            sumCsvData['Particulars of Work'] = 'Total'
            setCsvTotalRow(sumCsvData)
            const uniqueData = countsByTask.filter((obj, index, self) =>
                index === self.findIndex(
                    (o) => o.employeeTypeID === obj.employeeTypeID && o.gangID === obj.gangID
                )
            );
            uniqueData.sort((a, b) => { return a.employeeTypeID - b.employeeTypeID; });
            const groupedByOne = uniqueData.reduce((result, obj) => {
                const category = obj.employeeTypeID;
                if (!result[category]) {
                    result[category] = [];
                }
                result[category].push(obj);
                return result;
            }, {});
            const sortedObjectListOne = Object.entries(groupedByOne).map(([key, value]) => ({
                employeeTypeID: key,
                employeeTypeName: value[0].employeeTypeName,
                newList: value,
            }));

            setMainHeader(uniqueData)
            setHeader(sortedObjectListOne)
            const groupedByCategory = countsByTask.reduce((result, obj) => {
                const category = obj.taskID;
                if (!result[category]) {
                    result[category] = [];
                }
                result[category].push(obj);
                return result;
            }, {});
            const sortedObjectList = Object.entries(groupedByCategory).map(([key, value]) => ({
                taskID: key,
                taskName: value[0].taskName,
                newList: value,
                totalCount: value.reduce((accumulator, current) => accumulator + current.value, 0)
            }));
            var Alltotal = sortedObjectList.reduce((accumulator, current) => accumulator + current.totalCount, 0)
            setAllTotal(Alltotal)
            setDailylabourData(sortedObjectList);
        }
        else {
            alert.error(response.message);
        }
    }

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            var csvHeaders = [
                { label: "Particulars of Work", value: "Particulars of Work" },
            ];
            array.map(x => {
                x.newList.map(y => {
                    var gangName = y.gangName;
                    var employeeTypeName = y.employeeTypeName.charAt(0);
                    var duplicate = res.find(z => parseInt(z.taskID) == parseInt(y.taskID));
                    if (duplicate) {
                        duplicate['Particulars of Work'] = y.taskName;
                        duplicate[employeeTypeName + '-' + gangName] = checkUndifind(duplicate[employeeTypeName + '-' + gangName]) + checkUndifind(y.value);
                        duplicate.taskID = y.taskID;
                        duplicate.Total = checkUndifind(duplicate.Total) + checkUndifind(y.value);
                    } else {
                        res.push({
                            'Particulars of Work': y.taskName,
                            [employeeTypeName + '-' + gangName]: checkUndifind(y.value),
                            taskID: y.taskID,
                            Total: checkUndifind(y.value),
                        });
                    }

                    var duplicateName = csvHeaders.find(z => z.label == employeeTypeName + '-' + gangName);

                    if (!duplicateName) {
                        csvHeaders.push({ label: employeeTypeName + '-' + gangName, value: employeeTypeName + '-' + gangName });
                    }
                });
            });
            csvHeaders.push({ label: 'Total', value: 'Total' });
            csvtotalRow['Total'] = allTotal
            res.push(csvtotalRow, []);
            var vr1 = {
                'Particulars of Work': 'Legal Entity: ' + selectedSearchValues.groupName,
            };
            var vr2 = {
                'Particulars of Work': 'Garden: ' + selectedSearchValues.gardenName,
            };
            var vr3 = {
                'Particulars of Work': selectedSearchValues.costCenterName === undefined ? 'Cost Center: All Cost Centers' : 'Cost Center: ' + selectedSearchValues.costCenterName,
            };
            var vr4 = {
                'Particulars of Work': 'From: ' + selectedSearchValues.fromDate,
            };
            var vr5 = {
                'Particulars of Work': 'To: ' + selectedSearchValues.toDate
            };
            res.push(vr1, vr2, vr3, vr4, vr5);
        }
        var result = {
            res: res,
            names: csvHeaders
        }
        return result;
    }

    function checkUndifind(value) {
        if (value === undefined) {
            return 0;
        }
        else {
            return value;
        }
    }

    async function createFile() {
        var file = await createDataForExcel(dailylabourData);
        var settings = {
            sheetName: 'Daily Labour Report',
            fileName:
                'Daily Labour Report - ' +
                selectedSearchValues.fromDate + ' - ' + selectedSearchValues.toDate,
            writeOptions: {}
        };
        let dataA = [
            {
                sheet: 'Daily Labour Report',
                columns: file.names,
                content: file.res
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
        setDailylabourDataList({
            ...dailylabourDataList,
            [e.target.name]: value
        });
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: groups[searchForm.groupID],
            gardenName: gardens[searchForm.gardenID],
            costCenterName: costCenters[searchForm.costCenterID],
            fromDate: dailylabourDataList.fromDate,
            toDate: dailylabourDataList.toDate
        })
    }

    return (
        <Page className={classes.root} title={title}>
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: dailylabourDataList.groupID,
                        gardenID: dailylabourDataList.gardenID,
                        costCenterID: dailylabourDataList.costCenterID,
                        fromDate: dailylabourDataList.fromDate,
                        toDate: dailylabourDataList.toDate
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Legal Entity is required').min("1", 'Legal Entity is required'),
                            gardenID: Yup.number().required('Garden is required').min("1", 'Garden is required'),
                            fromDate: Yup.date().required('From Date is required'),
                            toDate: Yup.date().required('To Date is required')
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
                                                        value={dailylabourDataList.groupID}
                                                        variant="outlined"
                                                        id="groupID"
                                                        size='small'

                                                    >
                                                        <MenuItem value="0">--Select Business Division--</MenuItem>
                                                        {generateDropDownMenu(groups)}
                                                    </TextField>
                                                </Grid>

                                                <Grid item md={4} xs={8}>
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
                                                        value={dailylabourDataList.gardenID}
                                                        variant="outlined"
                                                        id="gardenID"
                                                        size='small'
                                                    >
                                                        <MenuItem value="0">--Select Location--</MenuItem>
                                                        {generateDropDownMenu(gardens)}
                                                    </TextField>
                                                </Grid>

                                                <Grid item md={4} xs={8}>
                                                    <InputLabel shrink id="costCenterID">
                                                        Cost Center
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="costCenterID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={dailylabourDataList.costCenterID}
                                                        variant="outlined"
                                                        id="costCenterID"
                                                        size='small'

                                                    >
                                                        <MenuItem value="0">--Select Cost Center--</MenuItem>
                                                        {generateDropDownMenu(costCenters)}
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
                                                            format="yyyy/MM/dd"
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
                                                            format="yyyy/MM/dd"
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
                                                <Grid item md={4} xs={8}>
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
                                            </Grid>
                                            <br />
                                            <Box minWidth={1050}>
                                                {dailylabourData.length > 0 ?
                                                    <TableContainer component={Paper}>
                                                        <Table className={classes.table} aria-label="simple table">
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell align="center" rowSpan="3" style={{ fontWeight: "bold", border: "1px solid black" }}>Particulars of Work</TableCell>
                                                                    <TableCell align="center" colSpan={mainHeader.length + 1} style={{ fontWeight: "bold", border: "1px solid black" }}>Number of Workers</TableCell>
                                                                </TableRow>
                                                                <TableRow>
                                                                    {header.map((row, i) => {
                                                                        return (
                                                                            <TableCell colSpan={row.newList.length} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                                                {row.employeeTypeName}
                                                                            </TableCell>
                                                                        )
                                                                    })}
                                                                    <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                                        Total
                                                                    </TableCell>
                                                                </TableRow>
                                                                <TableRow>
                                                                    {mainHeader.map((row, i) => {
                                                                        return (
                                                                            <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                                                {row.gangName}
                                                                            </TableCell>
                                                                        )
                                                                    })}
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {dailylabourData.slice(page * limit, page * limit + limit).map((row, i) => {
                                                                    return (
                                                                        <TableRow key={i}>
                                                                            <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.taskName}</TableCell>
                                                                            {mainHeader.map((rows, i) => {
                                                                                var result = row.newList.find(x => x.employeeTypeID == rows.employeeTypeID && x.gangID == rows.gangID)
                                                                                return (
                                                                                    <>
                                                                                        <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black" }}>
                                                                                            {result == undefined ? '-' : result.value}
                                                                                        </TableCell>
                                                                                    </>
                                                                                )
                                                                            })}
                                                                            <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black" }}> {row.totalCount}</TableCell>
                                                                        </TableRow>
                                                                    )
                                                                })}
                                                                <TableRow>
                                                                    <TableCell component="th" scope="row" align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Total</TableCell>
                                                                    {mainHeader.map((rows, i) => {
                                                                        var result = totalRow.find(x => x.employeeTypeID == rows.employeeTypeID && x.gangID == rows.gangID)
                                                                        return (
                                                                            <>
                                                                                <TableCell component="th" scope="row" align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                                                    {result == undefined ? '-' : result.sumValue}
                                                                                </TableCell>
                                                                            </>
                                                                        )
                                                                    })}
                                                                    <TableCell component="th" scope="row" align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>{allTotal} </TableCell>
                                                                </TableRow>
                                                            </TableBody>
                                                        </Table>
                                                        <TablePagination
                                                            component="div"
                                                            count={dailylabourData.length}
                                                            onChangePage={handlePageChange}
                                                            onChangeRowsPerPage={handleLimitChange}
                                                            page={page}
                                                            rowsPerPage={limit}
                                                            rowsPerPageOptions={[5, 50, 100]}
                                                        />
                                                    </TableContainer> : null}
                                            </Box>
                                        </CardContent>
                                        {dailylabourData.length > 0 ?
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
                                                    documentTitle={"Daily Labour Report"}
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
                                                        searchData={selectedSearchValues} dailylabourData={dailylabourData} mainHeader={mainHeader}
                                                        header={header} totalRow={totalRow} allTotal={allTotal}
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