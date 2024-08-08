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

const screenCode = 'DAILYOUTSIDERJOBPAYMENTREPORT';

export default function DailyOutsiderJobPaymentReport(props) {
    const [title, setTitle] = useState("Daily Outsider Job Payment Report")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [gardens, setGardens] = useState([]);
    const [costCenters, setCostCenters] = useState();
    const [offDayCashPaymentData, setOffDayCashPaymentData] = useState([]);
    const [fields, setFields] = useState([]);
    const [employeeType, setEmployeeType] = useState();
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [harvestingJobs, setHarvestingJobs] = useState([]);
    const [offDayCashPaymentDataList, setOffDayCashPaymentDataList] = useState({
        groupID: '0',
        gardenID: '0',
        costCenterID: '0',
        date: new Date().toISOString().substr(0, 10),
        factoryJobID: '0',
        fieldID: '0',
        empTypeID: '0'
    })

    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: "0",
        gardenName: "0",
        costCenterName: "0",
        date: '',
        factoryJobID: '',
        fieldID: '',
        employeeName: ''
    })

    const [totalValues, setTotalValues] = useState({
        totalAmount: 0,
        totalgrossAmount: 0,
        totalallowance: 0,
        totalgardenAllowance: 0,
        totalpfDeductionAmount: 0,
        totalOverKg: 0,
        totalLessKg: 0,
        totalQuantity: 0
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
        trackPromise(getGroupsForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID());
    }, [offDayCashPaymentDataList.groupID]);

    useEffect(() => {
        setOffDayCashPaymentDataList((prevState) => ({
            ...prevState,
            costCenterID: "0"
        }));
    }, [offDayCashPaymentDataList.groupID]);

    useEffect(() => {
        trackPromise(
            getCostCenterDetailsByGardenID()
        )
    }, [offDayCashPaymentDataList.gardenID]);

    useEffect(() => {
        setOffDayCashPaymentData([])
    }, [offDayCashPaymentDataList.gardenID]);

    useEffect(() => {
        setOffDayCashPaymentData([])
    }, [offDayCashPaymentDataList.costCenterID]);

    useEffect(() => {
        setOffDayCashPaymentData([])
    }, [offDayCashPaymentDataList.date]);

    useEffect(() => {
        if (offDayCashPaymentData.length != 0) {
            calculateTotalQty()
        }
    }, [offDayCashPaymentData]);

    useEffect(() => {
        if (offDayCashPaymentData.gardenID != "0") {
            trackPromise(GetFactoryJobs())
        }
    }, [offDayCashPaymentDataList.gardenID, offDayCashPaymentDataList.date]);

    useEffect(() => {
        trackPromise(getFieldDetailsByDivisionID());
    }, [offDayCashPaymentDataList.costCenterID, offDayCashPaymentDataList.date]);

    useEffect(() => {
        setOffDayCashPaymentData([]);
    }, [offDayCashPaymentDataList.date]);

    useEffect(() => {
        setOffDayCashPaymentData([]);
    }, [offDayCashPaymentDataList.empTypeID]);

    useEffect(() => {
        setOffDayCashPaymentData([]);
    }, [offDayCashPaymentDataList.factoryJobID]);

    useEffect(() => {
        setOffDayCashPaymentData([]);
    }, [offDayCashPaymentDataList.fieldID]);

    useEffect(() => {
        setOffDayCashPaymentData([]);
    }, [offDayCashPaymentDataList.costCenterID]);

    const handleLimitChange = (event) => {
        setLimit(event.target.value);
    };
    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'DAILYOUTSIDERJOBPAYMENTREPORT');

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

        setOffDayCashPaymentDataList({
            ...offDayCashPaymentDataList,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            gardenID: parseInt(tokenService.getFactoryIDFromToken())
        })

        getEmployeeTypesForDropdown();
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(offDayCashPaymentDataList.groupID);
        setGardens(response);
    };

    async function getCostCenterDetailsByGardenID() {
        var response = await services.getDivisionDetailsByEstateID(offDayCashPaymentDataList.gardenID);
        const elementCount = response.reduce((count) => count + 1, 0);
        var generated = generateDropDownMenu(response)
        if (elementCount === 1) {
            setOffDayCashPaymentDataList((prevState) => ({
                ...prevState,
                costCenterID: generated[0].props.value,
            }));
        }
        setCostCenters(response);
    };

    async function GetFactoryJobs() {
        const result = await services.GetFactoryJobs(offDayCashPaymentDataList.gardenID, offDayCashPaymentDataList.date);
        setHarvestingJobs(result);
    }

    async function getFieldDetailsByDivisionID() {
        var response = await services.getFieldDetailsByDivisionID(offDayCashPaymentDataList.costCenterID, offDayCashPaymentDataList.date);
        setFields(response);
    };

    async function getEmployeeTypesForDropdown() {
        const types = await services.getEmployeeTypesForDropdown();
        setEmployeeType(types);
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

    function generateDropDownMenuWithTwoValues(data) {
        let items = []
        if (data != null) {
            for (const [key, value] of Object.entries(data)) {
                items.push(<MenuItem key={key} value={key}>{value.name}</MenuItem>);
            }
        }
        return items
    }

    async function GetDetails() {
        let model = {
            groupID: parseInt(offDayCashPaymentDataList.groupID),
            gardenID: parseInt(offDayCashPaymentDataList.gardenID),
            costCenterID: parseInt(offDayCashPaymentDataList.costCenterID),
            applicableDate: new Date(offDayCashPaymentDataList.date),
            factoryJobID: parseInt(offDayCashPaymentDataList.factoryJobID),
            empTypeID: parseInt(offDayCashPaymentDataList.empTypeID)
        }
        getSelectedDropdownValuesForReport(model);
        const response = await services.GetOffDayCashPaymentDetails(model);
        if (response.statusCode == "Success" && response.data != null) {
            setOffDayCashPaymentData(response.data);
            createDataForExcel(response.data);
        }
        else {
            alert.error(response.message);
        }
    }

    function calculateTotalQty() {
        const totalAmount = offDayCashPaymentData.reduce((accumulator, current) => accumulator + current.totalAmount, 0);
        const totalgrossAmount = offDayCashPaymentData.reduce((accumulator, current) => accumulator + current.grossAmount, 0);
        const totalQuantity = offDayCashPaymentData.reduce((accumulator, current) => accumulator + current.completedQuantity, 0);
        setTotalValues({
            ...totalValues,
            totalAmount: totalAmount,
            totalgrossAmount: totalgrossAmount,
            totalQuantity: totalQuantity
        })
    };

    async function createDataForExcel(array) {
        var res = [];

        if (array != null) {
            array.map(x => {
                var vr = {
                    'Reg.No': x.registrationNumber,
                    'Emp.Name': x.employeeName,
                    'Emp.Type': x.employeeTypeName,
                    'Job': x.jobName,
                    'Qty(KG)': x.completedQuantity,
                    'Gross(BDT)': x.grossAmount,
                    'Net(BDT)': x.totalAmount
                };
                res.push(vr);
            });
            var vr = {
                'Reg.No': 'Total',
                'Qty(KG)': totalValues.totalQuantity,
                'Gross(BDT)': totalValues.totalgrossAmount,
                'Net(BDT)': totalValues.totalAmount
                

            };
            res.push(vr);
            res.push([]);
            var vr = {
                'Reg.No': 'Legal Entity: ' + selectedSearchValues.groupName,
                'Emp.Name': 'Garden: ' + selectedSearchValues.gardenName,
                'Emp.Type': selectedSearchValues.costCenterName === undefined ? 'Cost Center: All Cost Centers' : 'Cost Center: ' + selectedSearchValues.costCenterName,
                'Job': 'Date: ' + selectedSearchValues.date,
                'Qty(KG)': 'Harvesting Job: ' + selectedSearchValues.factoryJobID,
            };
            res.push(vr);
        }

        return res;
    }

    async function createFile() {
        var file = await createDataForExcel(offDayCashPaymentData);
        var settings = {
            sheetName: 'Outsider Job Payment Report',
            fileName:
                'Outsider Job Payment Report - ' +
                selectedSearchValues.date,
            writeOptions: {}
        };

        let keys = Object.keys(file[0]);
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem });
        });

        let dataA = [
            {
                sheet: 'Outsider Job Payment Report',
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
        setOffDayCashPaymentDataList({
            ...offDayCashPaymentDataList,
            [e.target.name]: value
        });
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: groups[searchForm.groupID],
            gardenName: gardens[searchForm.gardenID],
            costCenterName: costCenters[searchForm.costCenterID],
            date: offDayCashPaymentDataList.date,
            factoryJobID: harvestingJobs[searchForm.factoryJobID],
            fieldID: fields[searchForm.fieldID],
            employeeName: employeeType[searchForm.empTypeID]
        })
    }

    return (
        <Page className={classes.root} title={title}>
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: offDayCashPaymentDataList.groupID,
                        gardenID: offDayCashPaymentDataList.gardenID,
                        costCenterID: offDayCashPaymentDataList.costCenterID,
                        date: offDayCashPaymentDataList.date,
                        factoryJobID: offDayCashPaymentDataList.factoryJobID,
                        //fieldID: offDayCashPaymentDataList.fieldID,
                        empTypeID: offDayCashPaymentDataList.empTypeID

                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Legal Entity is required').min("1", 'Legal Entity is required'),
                            gardenID: Yup.number().required('Garden is required').min("1", 'Garden is required'),
                            date: Yup.date().required('Date is required'),
                            factoryJobID: Yup.number().required('Harvesting Job is required').min("1", 'Harvesting Job is required'),
                            //fieldID: Yup.number().required('Section is required').min("1", 'Section is required'),
                            empTypeID: Yup.number().required('Employee Type is required').min("1", 'Employee Type is required')
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
                                                        value={offDayCashPaymentDataList.groupID}
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
                                                        value={offDayCashPaymentDataList.gardenID}
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
                                                        value={offDayCashPaymentDataList.costCenterID}
                                                        variant="outlined"
                                                        id="costCenterID"
                                                        size='small'

                                                    >
                                                        <MenuItem value="0">--Select Cost Center--</MenuItem>
                                                        {generateDropDownMenu(costCenters)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={8}>
                                                    <InputLabel shrink id="date">
                                                        Date *
                                                    </InputLabel>
                                                    <TextField
                                                        error={Boolean(touched.date && errors.date)}
                                                        helperText={touched.date && errors.date}
                                                        fullWidth
                                                        size='small'
                                                        name="date"
                                                        type="date"
                                                        onChange={(e) => handleChange(e)}
                                                        value={offDayCashPaymentDataList.date}
                                                        variant="outlined"
                                                        id="date"
                                                    />
                                                </Grid>
                                                {/* <Grid item md={4} xs={8}>
                                                    <InputLabel shrink id="fieldID">
                                                        Section *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.fieldID && errors.fieldID)}
                                                        fullWidth
                                                        helperText={touched.fieldID && errors.fieldID}
                                                        name="fieldID"
                                                        size='small'
                                                        onBlur={handleBlur}
                                                        onChange={(e) => {
                                                            handleChange(e)
                                                        }}
                                                        value={offDayCashPaymentDataList.fieldID}
                                                        variant="outlined"
                                                        id="fieldID"
                                                    >
                                                        <MenuItem value={'0'} >--Select Section--</MenuItem>
                                                        {generateDropDownMenu(fields)}
                                                    </TextField>
                                                </Grid> */}
                                                <Grid item md={4} xs={8}>
                                                    <InputLabel shrink id="factoryJobID">
                                                        Harvesting Job *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.factoryJobID && errors.factoryJobID)}
                                                        fullWidth
                                                        helperText={touched.factoryJobID && errors.factoryJobID}
                                                        name="factoryJobID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={offDayCashPaymentDataList.factoryJobID}
                                                        variant="outlined"
                                                        id="factoryJobID"
                                                        size='small'

                                                    >
                                                        <MenuItem value="0">--Select Harvesting Job--</MenuItem>
                                                        {generateDropDownMenu(harvestingJobs)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={8}>
                                                    <InputLabel shrink id="empTypeID">
                                                        Employee Type *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.empTypeID && errors.empTypeID)}
                                                        fullWidth
                                                        helperText={touched.empTypeID && errors.empTypeID}
                                                        name="empTypeID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={offDayCashPaymentDataList.empTypeID}
                                                        variant="outlined"
                                                        id="empTypeID"
                                                        size='small'

                                                    >
                                                        <MenuItem value="0">--Select Employee Type--</MenuItem>
                                                        {generateDropDownMenuWithTwoValues(employeeType)}
                                                    </TextField>
                                                </Grid>
                                                <Grid container justify="flex-end">
                                                    <Box pr={2}>
                                                        <Button
                                                            color="primary"
                                                            variant="contained"
                                                            type="submit"
                                                            size='small'
                                                        >
                                                            Search
                                                        </Button>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                            <br>
                                            </br>
                                            <br>
                                            </br>
                                            <Box minWidth={1050}>
                                                {offDayCashPaymentData.length > 0 ?
                                                    <TableContainer component={Paper}>
                                                        <Table className={classes.table} aria-label="simple table">
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Reg.No</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Emp.Name</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Emp.Type</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Job</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Qty(KG)</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Gross(BDT)</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Net(BDT)</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {offDayCashPaymentData.slice(page * limit, page * limit + limit).map((row, i) => (
                                                                    <TableRow key={i}>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.registrationNumber}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.firstName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{  border: "1px solid black" }}> {row.employeeTypeName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.jobName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.completedQuantity.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.grossAmount.toFixed(2)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{  border: "1px solid black" }}> {row.totalAmount.toFixed(2)}</TableCell>
                                                                    </TableRow>
                                                                )
                                                                )}
                                                            </TableBody>
                                                            <TableRow>
                                                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}><b>Total</b></TableCell>
                                                                <TableCell component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }} ></TableCell>
                                                                <TableCell component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }} ></TableCell>
                                                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                                                </TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" , border: "1px solid black"  }}>
                                                                 <b> {totalValues.totalQuantity.toFixed(2)} </b>
                                                                </TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" , border: "1px solid black" }}>
                                                                    <b> {totalValues.totalgrossAmount.toFixed(2)} </b>
                                                                </TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                                                    <b> {totalValues.totalAmount.toFixed(2)} </b>
                                                                </TableCell>
                                                            </TableRow>
                                                        </Table>
                                                        <TablePagination
                                                            component="div"
                                                            count={offDayCashPaymentData.length}
                                                            onChangePage={handlePageChange}
                                                            onChangeRowsPerPage={handleLimitChange}
                                                            page={page}
                                                            rowsPerPage={limit}
                                                            rowsPerPageOptions={[5, 10, 25]}
                                                        />
                                                    </TableContainer> : null}
                                            </Box>
                                        </CardContent>
                                        {offDayCashPaymentData.length > 0 ?
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
                                                    documentTitle={"Daily Outsider Job Payment Report"}
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
                                                        searchData={selectedSearchValues} offDayCashPaymentData={offDayCashPaymentData}
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