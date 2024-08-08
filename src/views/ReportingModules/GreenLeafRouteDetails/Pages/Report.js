import React, { useState, useEffect, Fragment, useRef } from 'react';
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
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Table
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import * as Yup from "yup";
import { LoadingComponent } from 'src/utils/newLoader';
import { Formik, validateYupSchema } from 'formik';
import { DatePicker, MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import moment from 'moment';
import { useAlert } from "react-alert";
import _ from 'lodash';
import xlsx from 'json-as-xlsx';
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePDF';

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

const screenCode = 'GREENLEAFROUTEDETAILS';

export default function GreenLeafRouteDetails(props) {
    const [title, setTitle] = useState("Green Leaf Route Crop Details Report")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [leaf, setLeaf] = useState();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [greenLeafInput, setGreenLeafInput] = useState({
        groupID: '0',
        factoryID: '0',
        year: '',
        collectionTypeID: '0'
    })
    const [leafRouteDetails, setLeafRouteDetails] = useState([]);
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const navigate = useNavigate();
    const alert = useAlert();
    const [leafweightTotal, setLeafweightTotal] = useState({
        january: 0,
        february: 0,
        march: 0,
        april: 0,
        may: 0,
        june: 0,
        july: 0,
        august: 0,
        september: 0,
        october: 0,
        november: 0,
        december: 0
    });
    const [allTotal, setAllTotal] = useState();
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const componentRef = useRef();
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        factoryName: "0",
        groupName: "0"
    })

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        trackPromise(getFactoriesForDropDown());
    }, [greenLeafInput.groupID]);

    useEffect(() => {
        trackPromise(getLeafTypesForDropDown());
    }, [greenLeafInput.factoryID]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWGREENLEAFROUTEDETAILS');



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

        setGreenLeafInput({
            ...greenLeafInput,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getFactoriesForDropDown() {
        const factory = await services.getFactoryByGroupID(greenLeafInput.groupID);
        setFactories(factory);
    }

    async function getLeafTypesForDropDown() {
        const leafTypes = await services.GetAllLeafTypes(greenLeafInput.factoryID);
        setLeaf(leafTypes);
    }

    async function GetDetails() {
        let model = {
            groupID: parseInt(greenLeafInput.groupID),
            factoryID: parseInt(greenLeafInput.factoryID),
            collectionTypeID: parseInt(greenLeafInput.collectionTypeID),
            applicableYear: greenLeafInput.year === "" ? moment(new Date()).format('YYYY') : greenLeafInput.year
        }
        getSelectedDropdownValuesForReport(model);

        const response = await services.GetGreenLeafRouteDetails(model);
        if (response.statusCode == "Success" && response.data != null) {
            setLeafRouteDetails(response.data);
            calTotal(response.data);
            if (response.data.length == 0) {
                alert.error("No records to display");
            }
        }
        else {
            alert.error(response.message);
        }
    }

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            array.map(x => {
                var vr = {
                    'Route Name': x.routeName,
                    'January': x.january,
                    'February': x.february,
                    'March': x.march,
                    'April': x.april,
                    'May': x.may,
                    'June': x.june,
                    'July': x.july,
                    'August': x.august,
                    'September': x.september,
                    'October': x.october,
                    'November': x.november,
                    'December': x.december,
                    'Total (KG)': (x.january + x.february + x.march + x.april + x.may + x.june + x.july + x.august
                        + x.september + x.october + x.november + x.december).toFixed(2),
                }
                res.push(vr);
            });
            var vr = {
                'Route Name': "Total",
                'January': leafweightTotal.january,
                'February': leafweightTotal.february,
                'March': leafweightTotal.march,
                'April': leafweightTotal.april,
                'May': leafweightTotal.may,
                'June': leafweightTotal.june,
                'July': leafweightTotal.july,
                'August': leafweightTotal.august,
                'September': leafweightTotal.september,
                'October': leafweightTotal.october,
                'November': leafweightTotal.november,
                'December': leafweightTotal.december,
                'Total (KG)': allTotal
            }
            res.push(vr);
        }

        return res;
    }

    async function createFile() {
        var file = await createDataForExcel(leafRouteDetails);
        var settings = {
            sheetName: 'Green Leaf Route Details Report',
            fileName: 'Green Leaf Route Details Report  ' + ' - ' + selectedSearchValues.groupName + ' - ' + selectedSearchValues.factoryName + ' - ' + greenLeafInput.year,
            writeOptions: {}
        }
        let keys = Object.keys(file[0])
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem })
        })
        let dataA = [
            {
                sheet: 'Green Leaf Route Details Report',
                columns: tempcsvHeaders,
                content: file
            }
        ]
        xlsx(dataA, settings);
    }

    function calTotal(data) {
        let januarySum = 0;
        let februarySum = 0;
        let marchSum = 0;
        let aprilSum = 0;
        let maySum = 0;
        let juneSum = 0;
        let julySum = 0;
        let augustSum = 0;
        let septemberSum = 0;
        let octoberSum = 0;
        let novemberSum = 0;
        let decemberSum = 0;
        let tot =0;

        data.forEach(element => {
            januarySum += parseFloat(element.january);
            februarySum += parseFloat(element.february)
            marchSum += parseFloat(element.march);
            aprilSum += parseFloat(element.april)
            maySum += parseFloat(element.may);
            juneSum += parseFloat(element.june)
            julySum += parseFloat(element.july);
            augustSum += parseFloat(element.august);
            septemberSum += parseFloat(element.september);
            octoberSum += parseFloat(element.october)
            novemberSum += parseFloat(element.november);
            decemberSum += parseFloat(element.december);
        });
        setLeafweightTotal({
            ...leafweightTotal,
            january: januarySum,
            february: februarySum,
            march: marchSum,
            april: aprilSum,
            may: maySum,
            june: juneSum,
            july: julySum,
            august: augustSum,
            september: septemberSum,
            october: octoberSum,
            november: novemberSum,
            december: decemberSum
        });

        tot=(januarySum+februarySum+marchSum+aprilSum+maySum+juneSum+julySum+augustSum+septemberSum+octoberSum+novemberSum+decemberSum).toFixed(2);
        setAllTotal(tot);
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
        setGreenLeafInput({
            ...greenLeafInput,
            [e.target.name]: value
        });
        setLeafRouteDetails([]);
    }

    function handleDateChange(date) {
        var year = date.getUTCFullYear();

        setGreenLeafInput({
            ...greenLeafInput,
            year: year.toString()
        });
        if (selectedDate != null) {
            var prevyear = selectedDate.getUTCFullYear();

            if ((prevyear != year)) {
                setSelectedDate(date)
            }
        } else {
            setSelectedDate(date)
        }
        setLeafRouteDetails([]);
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            factoryName: factories[searchForm.factoryID],
            groupName: groups[searchForm.groupID]
        })
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: greenLeafInput.groupID,
                            factoryID: greenLeafInput.factoryID,
                            collectionTypeID: greenLeafInput.collectionTypeID
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required')
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
                                                            Group *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.groupID && errors.groupID)}
                                                            fullWidth
                                                            helperText={touched.groupID && errors.groupID}
                                                            name="groupID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={greenLeafInput.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            disabled={!permissionList.isGroupFilterEnabled}
                                                            size='small'
                                                        >
                                                            <MenuItem value="0">--Select Group--</MenuItem>
                                                            {generateDropDownMenu(groups)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={3} xs={8}>
                                                        <InputLabel shrink id="factoryID">
                                                            Factory *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.factoryID && errors.factoryID)}
                                                            fullWidth
                                                            helperText={touched.factoryID && errors.factoryID}
                                                            name="factoryID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={greenLeafInput.factoryID}
                                                            variant="outlined"
                                                            id="factoryID"
                                                            disabled={!permissionList.isFactoryFilterEnabled}
                                                            size='small'
                                                        >
                                                            <MenuItem value="0">--Select Factory--</MenuItem>
                                                            {generateDropDownMenu(factories)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={3} xs={8}>
                                                        <InputLabel shrink id="collectionTypeID">
                                                            Leaf Type
                                                        </InputLabel>
                                                        <TextField select
                                                            fullWidth
                                                            name="collectionTypeID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={greenLeafInput.collectionTypeID}
                                                            variant="outlined"
                                                            id="collectionTypeID"
                                                            size='small'

                                                        >
                                                            <MenuItem value="0">--Select Leaf Type--</MenuItem>
                                                            {generateDropDownMenu(leaf)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={3} xs={12}>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <DatePicker
                                                                autoOk
                                                                variant="inline"
                                                                openTo="month"
                                                                views={["year"]}
                                                                label="Year *"
                                                                helperText="Select applicable year"
                                                                value={selectedDate}
                                                                disableFuture={true}
                                                                onChange={(date) => handleDateChange(date)}
                                                                size='small'
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>

                                                </Grid>

                                                <Box display="flex" flexDirection="row-reverse" p={2} >
                                                    <Button
                                                        color="primary"
                                                        type="submit"
                                                        variant="contained"
                                                        size='small'
                                                    >
                                                        Search
                                                    </Button>
                                                </Box>
                                                <br />
                                                <Box minWidth={1050}>
                                                    {leafRouteDetails.length > 0 ?
                                                        <TableContainer >
                                                            <Table aria-label="caption table">
                                                                <TableHead>
                                                                    <TableRow>
                                                                        <TableCell align={'center'}>Route Name</TableCell>
                                                                        <TableCell align={'center'}>January</TableCell>
                                                                        <TableCell align={'center'}>February</TableCell>
                                                                        <TableCell align={'center'}>March</TableCell>
                                                                        <TableCell align={'center'}>April</TableCell>
                                                                        <TableCell align={'center'}>May</TableCell>
                                                                        <TableCell align={'center'}>June</TableCell>
                                                                        <TableCell align={'center'}>July</TableCell>
                                                                        <TableCell align={'center'}>August</TableCell>
                                                                        <TableCell align={'center'}>September</TableCell>
                                                                        <TableCell align={'center'}>October</TableCell>
                                                                        <TableCell align={'center'}>November</TableCell>
                                                                        <TableCell align={'center'}>December</TableCell>
                                                                        <TableCell align={'center'}>Total (KG)</TableCell>
                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                    {leafRouteDetails.map((data, index) => (
                                                                        <TableRow key={index}>
                                                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                {data.routeName}
                                                                            </TableCell>
                                                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                {data.january.toFixed(2)}
                                                                            </TableCell>
                                                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                {data.february.toFixed(2)}
                                                                            </TableCell>
                                                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                {data.march.toFixed(2)}
                                                                            </TableCell>
                                                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                {data.april.toFixed(2)}
                                                                            </TableCell>
                                                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                {data.may.toFixed(2)}
                                                                            </TableCell>
                                                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                {data.june.toFixed(2)}
                                                                            </TableCell>
                                                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                {data.july.toFixed(2)}
                                                                            </TableCell>
                                                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                {data.august.toFixed(2)}
                                                                            </TableCell>
                                                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                {data.september.toFixed(2)}
                                                                            </TableCell>
                                                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                {data.october.toFixed(2)}
                                                                            </TableCell>
                                                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                {data.november.toFixed(2)}
                                                                            </TableCell>
                                                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                {data.december.toFixed(2)}
                                                                            </TableCell>
                                                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                {(data.january + data.february + data.march + data.april + data.may + data.june +
                                                                                    data.july + data.august + data.september + data.october + data.november + data.december).toFixed(2)}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                                <TableRow>
                                                                    <TableCell align={'center'}><b>Total</b></TableCell>
                                                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                        <b> {leafweightTotal.january.toFixed(2)} </b>
                                                                    </TableCell>
                                                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                        <b> {leafweightTotal.february.toFixed(2)} </b>
                                                                    </TableCell>
                                                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                        <b> {leafweightTotal.march.toFixed(2)} </b>
                                                                    </TableCell>
                                                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                        <b> {leafweightTotal.april.toFixed(2)} </b>
                                                                    </TableCell>
                                                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                        <b> {leafweightTotal.may.toFixed(2)} </b>
                                                                    </TableCell>
                                                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                        <b> {leafweightTotal.june.toFixed(2)} </b>
                                                                    </TableCell>
                                                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                        <b> {leafweightTotal.july.toFixed(2)} </b>
                                                                    </TableCell>
                                                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                        <b> {leafweightTotal.august.toFixed(2)} </b>
                                                                    </TableCell>
                                                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                        <b> {leafweightTotal.september.toFixed(2)} </b>
                                                                    </TableCell>
                                                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                        <b> {leafweightTotal.october.toFixed(2)} </b>
                                                                    </TableCell>
                                                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                        <b> {leafweightTotal.november.toFixed(2)} </b>
                                                                    </TableCell>
                                                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                        <b> {leafweightTotal.december.toFixed(2)} </b>
                                                                    </TableCell>
                                                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                        <b> {allTotal} </b>
                                                                    </TableCell>
                                                                </TableRow>
                                                            </Table>
                                                        </TableContainer> : null}
                                                </Box>
                                            </CardContent>

                                            {leafRouteDetails.length > 0 ?
                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    <Button
                                                        color="primary"
                                                        id="btnRecord"
                                                        type="submit"
                                                        variant="contained"
                                                        style={{ marginRight: '1rem' }}
                                                        className={classes.colorRecord}
                                                        onClick={createFile}
                                                        size='small'
                                                    >
                                                        EXCEL
                                                    </Button>
                                                    <div>&nbsp;</div>
                                                    <ReactToPrint
                                                        documentTitle={"Green Leaf Route Details Report"}
                                                        trigger={() => <Button
                                                            color="primary"
                                                            id="btnCancel"
                                                            variant="contained"
                                                            style={{ marginRight: '1rem' }}
                                                            className={classes.colorCancel}
                                                            size='small'
                                                        >
                                                            PDF
                                                        </Button>}
                                                        content={() => componentRef.current}
                                                    />
                                                    <div hidden={true}>
                                                        <CreatePDF ref={componentRef} LeafRouteDetails={leafRouteDetails} LeafweightTotal={leafweightTotal}
                                                            SearchData={selectedSearchValues} GreenLeafInput={greenLeafInput} AllTotal={allTotal} />
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
        </Fragment>
    )
}