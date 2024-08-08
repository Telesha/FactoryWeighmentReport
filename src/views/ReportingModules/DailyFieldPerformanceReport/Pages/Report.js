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
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import xlsx from 'json-as-xlsx';
import Paper from '@material-ui/core/Paper';
import _ from 'lodash';
import moment from 'moment';

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
    },
    table: {
        minWidth: 650,
    },
    dialog1: {
        width: 850,
    }

}));

const screenCode = 'DAILYSECTIONPERFORMANCEREPORT';

export default function DailyFieldPerformanceReport(props) {
    const [title, setTitle] = useState("Daily Section Performance Report")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [gardens, setGardens] = useState([]);
    const [costCenters, setCostCenters] = useState();
    const [fieldPerformaceData, setFieldPerformaceData] = useState([]);
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [allTotal, setAllTotal] = useState(0);
    const [totalArray, setTotalArray] = useState([]);
    const [headings, setHeadings] = useState([]);
    const [numOfDays, setNumOfDays] = useState([]);
    const [startdayName, setStartdayName] = useState([]);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    const initialMonthValue = `${currentYear}-${currentMonth}`;
    const [fieldPerformanceDataList, setFieldPerformanceDataList] = useState({
        groupID: '0',
        gardenID: '0',
        costCenterID: '0',
        month: initialMonthValue
    })

    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: "0",
        gardenName: "0",
        costCenterName: "0",
        month: ''
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
    }, [fieldPerformanceDataList.groupID]);

    useEffect(() => {
        setFieldPerformanceDataList((prevState) => ({
            ...prevState,
            costCenterID: "0"
        }));
    }, [fieldPerformanceDataList.groupID]);

    useEffect(() => {
        trackPromise(
            getCostCenterDetailsByGardenID()
        )
    }, [fieldPerformanceDataList.gardenID]);

    useEffect(() => {
        setFieldPerformaceData([])
    }, [fieldPerformanceDataList.gardenID]);

    useEffect(() => {
        setFieldPerformaceData([])
    }, [fieldPerformanceDataList.costCenterID]);

    useEffect(() => {
        setFieldPerformaceData([])
    }, [fieldPerformanceDataList.month]);

    useEffect(() => {
        setFieldPerformaceData([]);
    }, [fieldPerformanceDataList.month]);

    useEffect(() => {
        setFieldPerformaceData([]);
    }, [fieldPerformanceDataList.empTypeID]);

    useEffect(() => {
        setFieldPerformaceData([]);
    }, [fieldPerformanceDataList.factoryJobID]);

    useEffect(() => {
        setFieldPerformaceData([]);
    }, [fieldPerformanceDataList.fieldID]);

    useEffect(() => {
        setFieldPerformaceData([]);
    }, [fieldPerformanceDataList.costCenterID]);

    const handleLimitChange = (event) => {
        setLimit(event.target.value);
    };
    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWDAILYSECTIONPERFORMANCEREPORT');

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

        setFieldPerformanceDataList({
            ...fieldPerformanceDataList,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            gardenID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(fieldPerformanceDataList.groupID);
        setGardens(response);
    };

    async function getCostCenterDetailsByGardenID() {
        var response = await services.getDivisionDetailsByEstateID(fieldPerformanceDataList.gardenID);
        const elementCount = response.reduce((count) => count + 1, 0);
        var generated = generateDropDownMenu(response)
        if (elementCount === 1) {
            setFieldPerformanceDataList((prevState) => ({
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
            groupID: parseInt(fieldPerformanceDataList.groupID),
            gardenID: parseInt(fieldPerformanceDataList.gardenID),
            costCenterID: parseInt(fieldPerformanceDataList.costCenterID),
            month: fieldPerformanceDataList.month + "-01",
        }
        var monthCT = fieldPerformanceDataList.month
        getSelectedDropdownValuesForReport(model);

        const res = await services.GetDailyFieldPerformanceDetails(model);
        let monthValue = monthCT;
        const month = monthValue.split('-')[1];

        const year = monthValue.split('-')[0];
        function getDaysInMonth(year, month) {
            return new Date(year, month, 0).getDate();
        }
        const value = getDaysInMonth(year, month);

        const date = new Date(monthValue + '-01');
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });

        const daysNamesArray = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        let daysArray = [];
        const elementIndex = daysNamesArray.indexOf(dayOfWeek);

        for (let i = 0; i < value; i++) {

            for (let j = 0; j < daysNamesArray.length; j++) {
                if (daysArray.length < (value + elementIndex)) {
                    daysArray.push(daysNamesArray[j]);
                }
                else { break; }
            }

        }
        const newDaysArray = daysArray.slice(elementIndex);
        const csvHeaders = [];

        csvHeaders.push({ label: "Section Name", value: "fieldName" })
        let dateArray = [];

        for (let i = 0; i < value; i++) {
            var dayLength = ((i + 1).toString()).length
            //dateArray.push((dayLength == 1 ? ('0' + (i + 1)).toString() : (i + 1).toString()).toString())
            csvHeaders.push({ label: ('day ' + (i + 1)).toString(), value: (dayLength == 1 ? ('0' + (i + 1)).toString() : (i + 1).toString()).toString() })
        }
        csvHeaders.push({ label: "Total", value: "amount" })
        let newRes = _.cloneDeep(res);
        var result = [];
        var totalArray = [];
        totalArray.push({ name: "fieldName", value: "Total" });
        var totalOfAllrecords = 0;
        newRes.data.forEach(z => {
            z.groupedData.forEach(x => {

                const date = x.cardReadTime.split('T')[0];
                const day = date.split('-')[2];
                var duplicateDate = result.find(y => y.fieldID === x.fieldID);

                var duplicateTotalRowData = totalArray.find(y => parseInt(y.name) === parseInt(day));

                if (duplicateTotalRowData) {
                    duplicateTotalRowData.value = duplicateTotalRowData.value == undefined ?
                        0 + x.actualAmount : duplicateTotalRowData.value + x.actualAmount;
                }
                else {
                    totalArray.push({
                        name: day,
                        value: x.actualAmount
                    });
                    dateArray.push(day)
                }

                if (duplicateDate) {
                    duplicateDate[day] = duplicateDate[day] == undefined ?
                        0 + x.actualAmount : duplicateDate[day] + x.actualAmount;
                    duplicateDate.division = x.division;
                    duplicateDate.estateName = x.estateName;
                    duplicateDate.fieldName = x.fieldName;
                    duplicateDate.fieldID = x.fieldID;
                    duplicateDate.amount = duplicateDate.amount == undefined ?
                        0 + x.actualAmount : duplicateDate.amount + x.actualAmount;
                    totalOfAllrecords = totalOfAllrecords + x.actualAmount;
                }
                else {
                    result.push({
                        [day]: x.actualAmount,
                        division: x.division,
                        estateName: x.estateName,
                        fieldName: x.fieldName,
                        fieldID: x.fieldID,
                        amount: x.actualAmount
                    });
                    totalOfAllrecords = totalOfAllrecords + x.actualAmount;
                }
            });

        });
        totalArray.push({ name: "amount", value: totalOfAllrecords });
        var sortedDateArray = dateArray.sort((a, b) => a - b);
        setAllTotal(totalOfAllrecords);
        setTotalArray(totalArray);
        setHeadings(csvHeaders)
        setFieldPerformaceData(result);
        setNumOfDays(sortedDateArray);
        setStartdayName(newDaysArray);
    }

    function createFile() {
        var settings = {
            sheetName: ' DP report',
            fileName: 'Daily Section Performance Report-' + selectedSearchValues.groupName + '-' + selectedSearchValues.gardenName + '-' + selectedSearchValues.costCenterName + '-' + fieldPerformanceDataList.month,
            writeOptions: {}
        }

        var copyOfCsv = [...fieldPerformaceData]
        let newAllTotal = _.cloneDeep(totalArray);

        const obj = newAllTotal.reduce((acc, cur) => {
            acc[cur.name] = cur.value;
            return acc;
        }, {});

        var newRow1 = {
            fieldName: "Group :" + groups[fieldPerformanceDataList.groupID]
        }

        var newRow2 = {
            fieldName: "Garden : " + gardens[fieldPerformanceDataList.gardenID]
        }

        var newRow3 = {
            fieldName: "Cost Center : " + costCenters[fieldPerformanceDataList.costCenterID]
        }

        var newRow4 = {
            fieldName: "Month : " + fieldPerformanceDataList.month
        }

        copyOfCsv.push(obj, {}, {}, newRow1, newRow2, newRow3, newRow4)
        let dataA = [
            {
                sheet: 'Section Performance Report',
                columns: headings,
                content: copyOfCsv
            }
        ];
        xlsx(dataA, settings)
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
        setFieldPerformanceDataList({
            ...fieldPerformanceDataList,
            [e.target.name]: value
        });
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: groups[searchForm.groupID],
            gardenName: gardens[searchForm.gardenID],
            costCenterName: costCenters[searchForm.costCenterID],
            month: searchForm.month
        })
    }

    function generateDynamicColor(fieldID) {
        const hash = fieldID.toString().split('').reduce((acc, char) => {
            return char.charCodeAt(0) + (acc << 6) + (acc << 16) - acc;
        }, 0);

        const baseBrightness = 80;
        const randomness = (Math.abs(hash) % 20) - 10;
        const adjustedBrightness = Math.max(30, Math.min(95, baseBrightness + randomness));
        const hue = (hash % 360 + 360) % 360;

        const color = `hsl(${hue}, 100%, ${adjustedBrightness}%)`;

        return color;
    }

    const sortedData = fieldPerformaceData.slice().sort((a, b) => {
        const [aNumeric, aNonNumeric] = partitionString(a.fieldName);
        const [bNumeric, bNonNumeric] = partitionString(b.fieldName);

        const numericComparison = compareNumericParts(aNumeric, bNumeric);

        if (numericComparison === 0) {
            return aNonNumeric.localeCompare(bNonNumeric);
        }

        return numericComparison;
    });

    function partitionString(input) {
        const numericPart = input.match(/\d+/);
        const nonNumericPart = input.replace(/\d+/g, '');
        return [numericPart ? numericPart[0] : '', nonNumericPart];
    }

    function compareNumericParts(a, b) {
        const numA = parseInt(a);
        const numB = parseInt(b);

        if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
        } else if (!isNaN(numA)) {
            return -1;
        } else if (!isNaN(numB)) {
            return 1;
        } else {
            return 0;
        }
    }

    return (
        <Page className={classes.root} title={title}>
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: fieldPerformanceDataList.groupID,
                        gardenID: fieldPerformanceDataList.gardenID,
                        costCenterID: fieldPerformanceDataList.costCenterID,
                        month: fieldPerformanceDataList.month
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Legal Entity is required').min("1", 'Legal Entity is required'),
                            gardenID: Yup.number().required('Garden is required').min("1", 'Garden is required'),
                            costCenterID: Yup.number().required('Cost Center is required').min("1", 'Cost Center is required'),
                            month: Yup.date().required('Month is required'),
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
                                                        Legal Entity  *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.groupID && errors.groupID)}
                                                        fullWidth
                                                        helperText={touched.groupID && errors.groupID}
                                                        name="groupID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={fieldPerformanceDataList.groupID}
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
                                                        Garden *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.gardenID && errors.gardenID)}
                                                        fullWidth
                                                        helperText={touched.gardenID && errors.gardenID}
                                                        name="gardenID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={fieldPerformanceDataList.gardenID}
                                                        variant="outlined"
                                                        id="gardenID"
                                                        size='small'

                                                    >
                                                        <MenuItem value="0">--Select Garden--</MenuItem>
                                                        {generateDropDownMenu(gardens)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={8}>
                                                    <InputLabel shrink id="costCenterID">
                                                        Cost Center *
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="costCenterID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={fieldPerformanceDataList.costCenterID}
                                                        variant="outlined"
                                                        id="costCenterID"
                                                        size='small'

                                                    >
                                                        <MenuItem value="0">--Select Cost Center--</MenuItem>
                                                        {generateDropDownMenu(costCenters)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={8}>
                                                    <InputLabel shrink id="month">
                                                        Month *
                                                    </InputLabel>
                                                    <TextField
                                                        error={Boolean(touched.month && errors.month)}
                                                        helperText={touched.month && errors.month}
                                                        fullWidth
                                                        size='small'
                                                        name="month"
                                                        type="month"
                                                        onChange={(e) => handleChange(e)}
                                                        value={fieldPerformanceDataList.month}
                                                        variant="outlined"
                                                        id="month"
                                                    />
                                                </Grid>
                                                <Grid item md={4} xs={8}></Grid>
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
                                            {fieldPerformaceData.length > 0 ?
                                                <div className="form-group row">
                                                    <div className="col-md-12 pb-1">
                                                        <Container>
                                                            <Card style={{ justifycontent: 'center' }}>
                                                                <Paper className={classes.paper}>
                                                                    <TableContainer>
                                                                        <Table aria-label="simple table">
                                                                            <TableHead>
                                                                                <TableRow>
                                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Section Name</TableCell>

                                                                                    {numOfDays.map((count, i) => (
                                                                                        <TableCell key={i} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>{count}</TableCell>
                                                                                    ))}

                                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Total</TableCell>
                                                                                </TableRow>
                                                                                <TableRow>
                                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}></TableCell>

                                                                                    {numOfDays.map((count, i) => (
                                                                                        <TableCell key={i} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>{moment(new Date((fieldPerformanceDataList.month + '-' + count).toString())).format('ddd')}</TableCell>
                                                                                    ))}
                                                                                </TableRow>
                                                                            </TableHead>
                                                                            <TableBody>
                                                                                {sortedData.map((rows, i) => {
                                                                                    const cellColor = generateDynamicColor(rows.fieldID);
                                                                                    return (
                                                                                        <TableRow key={i} >
                                                                                            <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black" }}> {rows.fieldName}</TableCell>
                                                                                            {numOfDays.map((count) => {
                                                                                                const result = rows[count]
                                                                                                if (result == undefined) {
                                                                                                    return (
                                                                                                        <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black" }}> - </TableCell>
                                                                                                    );
                                                                                                }
                                                                                                else {
                                                                                                    return (
                                                                                                        <TableCell component="th" scope="row" align="center" style={{ backgroundColor: cellColor, border: "1px solid black" }}> {parseFloat(result).toFixed(2)}</TableCell>
                                                                                                    );
                                                                                                }
                                                                                            })}
                                                                                            <TableCell component="th" scope="row" style={{ backgroundColor: "#14a37f", border: "1px solid black" }} align="center"> {parseFloat(rows.amount).toFixed(2)}</TableCell>
                                                                                        </TableRow>
                                                                                    );
                                                                                })}
                                                                                <TableRow>
                                                                                    <TableCell component="th" style={{ fontWeight: "bold", border: "1px solid black" }} scope="row" align="center"> Total</TableCell>
                                                                                    {numOfDays.map((count) => {
                                                                                        const result = totalArray.find(x => x.name == count)

                                                                                        if (result == undefined) {
                                                                                            return (
                                                                                                <TableCell component="th" style={{ fontWeight: "bold", border: "1px solid black" }} scope="row" align="center"> - </TableCell>
                                                                                            );
                                                                                        }
                                                                                        else {
                                                                                            return (
                                                                                                <TableCell component="th" scope="row" align="center" style={{ fontWeight: "bold", backgroundColor: "#14a37f", border: "1px solid black" }}> {parseFloat(result.value).toFixed(2)}</TableCell>
                                                                                            );
                                                                                        }
                                                                                    })}
                                                                                    <TableCell component="th" scope="row" style={{ fontWeight: "bold", border: "1px solid black" }} align="center"> {parseFloat(allTotal).toFixed(2)}</TableCell>
                                                                                </TableRow>
                                                                            </TableBody>
                                                                        </Table>
                                                                    </TableContainer>
                                                                </Paper>
                                                            </Card>
                                                        </Container>
                                                    </div>
                                                </div>
                                                : null}
                                        </CardContent>
                                        {fieldPerformaceData.length > 0 ?
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                <Button
                                                    color="primary"
                                                    id="btnRecord"
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
                                                    documentTitle={"Daily Section Performance Report"}
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
                                                        data={sortedData}
                                                        allTotal={allTotal} totalArray={totalArray}
                                                        searchData={selectedSearchValues} daysCount={numOfDays}
                                                        startDay={startdayName} fieldPerformanceDataList={fieldPerformanceDataList} />
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