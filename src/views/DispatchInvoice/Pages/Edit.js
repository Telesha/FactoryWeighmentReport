import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, Switch, CardHeader, MenuItem, TextareaAutosize, Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
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
    colorCancel: {
        backgroundColor: "red",
    },
    colorRecord: {
        backgroundColor: "green",
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 200,
    },
}));

const screenCode = 'DISPATCHINVOICE';

export default function DispatchInvoiceEdit(props) {
    const [title, setTitle] = useState("View Dispatch Invoice");
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [brokers, setBrokers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [sellingMarks, setSellingMarks] = useState([]);
    const [manufactureNumbers, setManufactureNumbers] = useState([]);
    const [sampleQuantity, setSampleQuantity] = useState();

    const [grades, setGrades] = useState();
    const [factories, setFactories] = useState();
    const [selectedDate, handleDateChange] = useState(new Date().toISOString());
    const [dipatchInv, setDispatchInv] = useState({
        groupID: 0,
        factoryID: 0,
        batchNo: "",
        dateOfDispatched: "",
        natureOfDispatch: 0,
        manufactureNumber: 0,
        sellingMarkID: 0,
        brokerID: 0,
        invoiceNo: "",
        teaGradeID: 0,
        noOfPackages: 0,
        dispatchQty: 0,
        fullOrHalf: 0,
        manufactureYear: "",
        typeOfPack: 0,
        packNo: "",
        packNetWeight: 0,
        grossQuantity: 0,
        netQuantity: 0,
        dispatchCondt: "",
        manufactureDate: "",
        vehicleID: 0,
        sampleQuantity: "",
        isActive: true
    });
    const [isDisableButton, setIsDisableButton] = useState(false);
    const [isButtonHide, setIsButtonHide] = useState(false);
    const [approveAndNewBtnEnable, setApproveAndNewBtnEnable] = useState();
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });
    const [dispatchList, setDispatchList] = useState([]);
    const [manufactureDetailList, setManufactureDetailList] = useState([]);
    const [manufactureList, setmanufactureList] = useState([]);
    const [manufactureDate, setManufactureDate] = useState([]);
    const [netQuantity, setNetQuantity] = useState([])
    const { teaProductDispatchID } = useParams();
    let decrypted = 0;
    const navigate = useNavigate();
    const alert = useAlert();
    const handleClick = () => {
        navigate('/app/dispatchInvoice/listing');
    }

    useEffect(() => {
        trackPromise(
            getPermission());
        trackPromise(
            getGroupsForDropdown());

    }, []);

    useEffect(() => {
        trackPromise(
            getFactoriesForDropdown());

    }, [dipatchInv.groupID]);

    useEffect(() => {
        trackPromise(
            getBrokersForDropdown(),
            getVehiclesForDropdown(),
            getSellingMarksForDropdown(),
            getGradesForDropdown(),
        );
    }, [dipatchInv.groupID], [dipatchInv.factoryID]);

    useEffect(() => {
        trackPromise(
            getManufactureNumbersForDropdown());
    }, [dipatchInv.teaGradeID]);

    useEffect(() => {
        trackPromise(
            getSampleValueByGradeID());
    }, [dipatchInv.teaGradeID]);

    useEffect(() => {
        trackPromise(
            GetManufactureDateByManufactureNumber());
    }, [dipatchInv.manufactureNumber]);

    useEffect(() => {
        decrypted = atob(teaProductDispatchID);
        if (decrypted != 0) {
            trackPromise(
                getDispatchInvoiceDetails(decrypted),
                GetDispatchList(decrypted),


            )
        }

    }, []);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'ADDDISPATCHINVOICE');
        if (isAuthorized === undefined) {
            navigate('/404');
        }
        var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');
        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
        });
        setDispatchInv({
            ...dipatchInv,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getFactoriesForDropdown() {
        const factories = await services.getFactoryByGroupID(dipatchInv.groupID);
        setFactories(factories);
    }

    async function getBrokersForDropdown() {
        const brokers = await services.GetBrokerList(dipatchInv.groupID, dipatchInv.factoryID);
        setBrokers(brokers);
    }

    async function getGradesForDropdown() {
        const grades = await services.GetGradeDetails(dipatchInv.groupID, dipatchInv.factoryID);
        setGrades(grades);
    }

    async function getVehiclesForDropdown() {
        const vehicles = await services.GetVehicleList(dipatchInv.groupID, dipatchInv.factoryID);
        setVehicles(vehicles);
    }

    async function getSellingMarksForDropdown() {
        const sellingMarks = await services.GetSellingMarkList(dipatchInv.groupID, dipatchInv.factoryID);
        setSellingMarks(sellingMarks);
    }

    async function GetManufactureDateByManufactureNumber() {
        const response = await services.GetManufactureDateByManufactureNumber(dipatchInv.manufactureNumber);
        setManufactureDate(response.fromDateOfManufaturing.split('T')[0]);
    }

    async function getManufactureNumbersForDropdown() {
        let data = await services.GetManufactureNumbersByGradeID(dipatchInv.teaGradeID);
        var options = []
        for (let item of Object.entries(data)) {
            options[item[1]["manufactureNumber"]] = item[1]["manufactureNumber"];

        }
        setManufactureNumbers(options);
    }

    async function getSampleValueByGradeID() {
        const response = await services.GetSampleValueByGradeID(dipatchInv.teaGradeID);
        setSampleQuantity(response.sampleAllowance);
    }

    async function AddManufactureDetails() {
        let model = {
            invoiceNo: dipatchInv.invoiceNo,
            teaGradeID: parseInt(dipatchInv.teaGradeID),
            manufactureNumber: dipatchInv.manufactureNumber,
            manufactureDate: moment(manufactureDate.manufactureDate).format(),
            isReact: true
        }

        setManufactureDetailList(manufactureDetailList => [...manufactureDetailList, model]);
        setDispatchList(dispatchList => [...dispatchList, model]);
    }

    async function GetDispatchList(teaProductDispatchID) {
        let response = await services.GetDispatchList(teaProductDispatchID);
        setManufactureDetailList(response[0].manufactureDetailList);
    }

    async function getDispatchInvoiceDetails(teaProductDispatchID) {
        let response = await services.GetDispatchInvoiceDetailsByID(teaProductDispatchID);
        let data = {
            teaProductDispatchID: response.teaProductDispatchID,
            groupID: response[0].groupID,
            factoryID: response[0].factoryID,
            dateOfDispatched: response[0].dateofDispatched.split('T')[0],
            sellingMarkID: response[0].sellingMarkID,
            brokerID: response[0].brokerID,
            invoiceNo: response[0].invoiceNo,
            manufactureYear: response[0].manufactureYear,
            vehicleID: response[0].vehicleID,
            natureOfDispatch: response[0].dispatchNature,
            teaGradeID: response[0].teaGradeID,
            fullOrHalf: response[0].fullOrHalf,
            typeOfPack: response[0].typeOfPack,
            packNetWeight: response[0].packNetWeight,
            noOfPackages: response[0].noOfPackages,
            grossQuantity: response[0].grossQuantity,
            sampleQuantity: response[0].sampleQuantity,
            netQuantity: response[0].netQuantity,

        }

        setDispatchInv(data);
    }

    async function saveDispatchInvoice() {
        let updateModel = {
            teaProductDispatchID: atob(teaProductDispatchID),
            groupID: parseInt(dipatchInv.groupID),
            factoryID: parseInt(dipatchInv.factoryID),
            invoiceNo: dipatchInv.invoiceNo,
            dateOfDispatched: dipatchInv.dateOfDispatched,
            sellingMarkID: parseInt(dipatchInv.sellingMarkID),
            brokerID: parseInt(dipatchInv.brokerID),
            dispatchNature: parseInt(dipatchInv.natureOfDispatch),
            manufactureYear: moment(selectedDate).format('YYYY-MM-DD'),
            vehicleID: parseInt(dipatchInv.vehicleID),
            dispatchList: [{
                manufactureDetailList: manufactureDetailList,
                invoiceNo: dipatchInv.invoiceNo,
                teaGradeID: dipatchInv.teaGradeID,
                typeOfPack: parseInt(dipatchInv.typeOfPack),
                grossQuantity: dipatchInv.grossQuantity,
                sampleQuantity: dipatchInv.sampleQuantity,
                netQuantity: dipatchInv.netQuantity,
                noOfPackages: dipatchInv.noOfPackages,
                packNetWeight: dipatchInv.packNetWeight,
                fullOrHalf: dipatchInv.fullOrHalf
            }],
            isActive: true

        }

        let response = await services.updateDispatchInvoice(updateModel);
        if (response.statusCode == "Success") {
            alert.success(response.message);
            setIsDisableButton(true);
            navigate('/app/dispatchInvoice/listing');
        }
        else {
            alert.error(response.message);
        }
    }

    const ApproveAndNew = () => {
        setApproveAndNewBtnEnable(true);

    }
    const ApproveClick = () => {
        setApproveAndNewBtnEnable(false);
    }




    function generateDropDownMenu(data) {
        let items = []
        if (data != null) {
            for (const [key, value] of Object.entries(data)) {
                items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
            }
        }
        return items;
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setDispatchInv({
            ...dipatchInv,
            [e.target.name]: value
        });
    }

    function clearFormFields() {
        setDispatchInv({
            ...dipatchInv,
            batchNo: '',
            brokerID: 0,
            dateOfDispatched: '',
            manufactureNumber: 0,
            sellingMarkID: 0,
            invoiceNo: '',
            teaGradeID: 0.,
            noOfPackages: '',
            fullOrHalf: '',
            typeOfPack: '',
            packNo: '',
            packNetWeight: '',
            grossQuantity: 0,
            sampleQuantity: 0,
            netQuantity: 0,
            manufactureYear: '',
            manufactureDate: '',
            vehicleID: 0,
        });
        setManufactureDetailList([]);
        setDispatchList([]);
        setSampleQuantity([]);
        setNetQuantity([]);
    }

    function cardTitle(titleName) {
        return (
            <Grid container spacing={1}>
                <Grid item md={10} xs={12}>
                    {titleName}
                </Grid>
                <Grid item md={2} xs={12}>
                    <PageHeader
                        onClick={handleClick}
                    />
                </Grid>
            </Grid>
        )
    }

    function settingManufactureNumber(data) {
        return data;
    }
    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: dipatchInv.groupID,
                            factoryID: dipatchInv.factoryID,
                            batchNo: dipatchInv.batchNo,
                            dateOfDispatched: dipatchInv.dateOfDispatched,
                            manufactureNumber: dipatchInv.manufactureNumber,
                            sellingMarkID: dipatchInv.sellingMarkID,
                            brokerID: dipatchInv.brokerID,
                            invoiceNo: dipatchInv.invoiceNo,
                            gradeID: dipatchInv.gradeID,
                            noOfPackages: dipatchInv.noOfPackages,
                            fullOrHalf: dipatchInv.fullOrHalf,
                            typeofPack: dipatchInv.typeOfPack,
                            packNo: dipatchInv.packNo,
                            packNetWeight: dipatchInv.packNetWeight,
                            grossQuantity: dipatchInv.grossQuantity,
                            sampleQuantity: dipatchInv.sampleQuantity,
                            netQuantity: dipatchInv.netQuantity,
                            manufactureYear: dipatchInv.manufactureYear,
                            manufactureDate: dipatchInv.manufactureDate,
                            vehicleID: dipatchInv.vehicleID,

                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required')
                            })
                        }
                        onSubmit={(event) => trackPromise(saveDispatchInvoice(event))}
                        enableReinitialize
                    >
                        {({
                            errors,
                            handleBlur,
                            handleSubmit,
                            isSubmitting,
                            touched,
                            values,
                            props
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
                                                <Grid container spacing={4}>
                                                    <Grid item md={3} xs={12}>
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
                                                            value={dipatchInv.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            size='small'
                                                            InputProps={{
                                                                readOnly: true
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Group--</MenuItem>
                                                            {generateDropDownMenu(groups)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
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
                                                            value={dipatchInv.factoryID}
                                                            variant="outlined"
                                                            id="factoryID"
                                                            size='small'
                                                            InputProps={{
                                                                readOnly: true
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Factory--</MenuItem>
                                                            {generateDropDownMenu(factories)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="dateOfDispatched">
                                                            Date of Dispatched *
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            name="dateOfDispatched"
                                                            type="date"
                                                            onChange={(e) => handleChange(e)}
                                                            InputProps={{
                                                                readOnly: true
                                                            }}
                                                            value={dipatchInv.dateOfDispatched}
                                                            variant="outlined"
                                                            id="dateOfDispatched"
                                                            size='small'
                                                        />
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <DatePicker
                                                                autoOk
                                                                variant="inline"
                                                                openTo="month"
                                                                views={["year"]}
                                                                label=" Dispatch Year*"
                                                                value={selectedDate}
                                                                disableFuture={true}
                                                                InputProps={{
                                                                    readOnly: true
                                                                }}
                                                                onChange={(date) => handleDateChange(date)}
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>
                                                </Grid>

                                                <Grid container spacing={4}>

                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="natureOfDispatch">
                                                            Nature Of Dispatch *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.natureOfDispatch && errors.natureOfDispatch)}
                                                            fullWidth
                                                            helperText={touched.natureOfDispatch && errors.natureOfDispatch}
                                                            name="natureOfDispatch"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={dipatchInv.natureOfDispatch}
                                                            InputProps={{
                                                                readOnly: true
                                                            }}
                                                            variant="outlined"
                                                            size='small'
                                                            id="natureOfDispatch"
                                                        >
                                                            <MenuItem value="0">--Select Nature Of Dispatch--</MenuItem>
                                                            <MenuItem value="1">Incomplete</MenuItem>
                                                            <MenuItem value="2">Complete</MenuItem>
                                                            <MenuItem value="3">Invoice</MenuItem>

                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="sellingMarkID">
                                                            Selling Mark *
                                                        </InputLabel>

                                                        <TextField select
                                                            fullWidth
                                                            name="sellingMarkID"
                                                            onChange={(e) => {
                                                                handleChange(e)
                                                            }}
                                                            value={dipatchInv.sellingMarkID}
                                                            InputProps={{
                                                                readOnly: true
                                                            }}
                                                            variant="outlined"
                                                            id="sellingMarkID"
                                                            size='small'
                                                        >
                                                            <MenuItem value={'0'}>
                                                                --Select Selling Mark--
                                                            </MenuItem>
                                                            {generateDropDownMenu(sellingMarks)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="halfID">
                                                            Broker *
                                                        </InputLabel>

                                                        <TextField select
                                                            fullWidth
                                                            name="brokerID"
                                                            onChange={(e) => {
                                                                handleChange(e)
                                                            }}
                                                            value={dipatchInv.brokerID}
                                                            InputProps={{
                                                                readOnly: true
                                                            }}
                                                            variant="outlined"
                                                            id="brokerID"
                                                        >
                                                            <MenuItem value={'0'}>
                                                                --Select Broker--
                                                            </MenuItem>
                                                            {generateDropDownMenu(brokers)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="vehicleID">
                                                            Vehicle Number *
                                                        </InputLabel>
                                                        <TextField select
                                                            fullWidth
                                                            name="vehicleID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={dipatchInv.vehicleID}
                                                            InputProps={{
                                                                            readOnly: true
                                                                        }}
                                                            variant="outlined" >
                                                            <MenuItem value={'0'}>
                                                                --Select Vehicle Number--
                                                            </MenuItem>
                                                            {generateDropDownMenu(vehicles)}
                                                        </TextField>
                                                    </Grid>

                                                </Grid>
                                                <br />
                                                <br />
                                                <Divider />
                                                <br /><br />
                                                <Card style={{ padding: 20, marginTop: 20 }}>
                                                    <Grid container spacing={4}>
                                                        <Grid item md={3} xs={12}>
                                                            <InputLabel shrink id="salesNo">
                                                                Invoice No *
                                                            </InputLabel>
                                                            <TextField
                                                                fullWidth
                                                                name="invoiceNo"
                                                                onBlur={handleBlur}
                                                                InputProps={{
                                                                    readOnly: true
                                                                }}
                                                                onChange={(e) => handleChange(e)}
                                                                value={dipatchInv.invoiceNo}
                                                                variant="outlined" >
                                                            </TextField>
                                                        </Grid>

                                                        <Grid item md={3} xs={12}>
                                                            <InputLabel shrink id="teaGradeID">
                                                                Grade *
                                                            </InputLabel>

                                                            <TextField select
                                                                fullWidth
                                                                name="teaGradeID"
                                                                onChange={(e) => {
                                                                    handleChange(e)
                                                                }}
                                                                value={dipatchInv.teaGradeID}
                                                                InputProps={{
                                                                    readOnly: true
                                                                }}
                                                                variant="outlined"
                                                                id="teaGradeID"
                                                            >
                                                                <MenuItem value={'0'}>
                                                                    --Select Grade--
                                                                </MenuItem>
                                                                {generateDropDownMenu(grades)}
                                                            </TextField>
                                                        </Grid>
                                                    </Grid>
                                                    <CardContent>
                                                        <Card style={{ padding: 20, marginTop: 20 }}>
                                                            <TableContainer >
                                                                <Table className={classes.table} aria-label="caption table">
                                                                    <TableHead>
                                                                        <TableRow>
                                                                            <TableCell>Manufacture Number</TableCell>
                                                                            <TableCell>Fully Utiliesed</TableCell>
                                                                        </TableRow>
                                                                    </TableHead>
                                                                    <TableBody>
                                                                        {manufactureDetailList.map((rowData, index) => (
                                                                            <TableRow key={index}>
                                                                                <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                    {settingManufactureNumber(rowData.manufactureNumber)}
                                                                                </TableCell>
                                                                                <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                    <input type="checkbox"
                                                                                        defaultChecked
                                                                                        disabled={true}
                                                                                    />
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        ))}

                                                                    </TableBody>
                                                                </Table>
                                                            </TableContainer>
                                                            <br />
                                                            <br />
                                                            <Divider />
                                                            <br /><br />
                                                            <Grid container spacing={4}>

                                                                <Grid item md={3} xs={12}>
                                                                    <InputLabel shrink id="fullOrHalf">
                                                                        Full / Half
                                                                    </InputLabel>

                                                                    <TextField select
                                                                        fullWidth
                                                                        name="fullOrHalf"
                                                                        onChange={(e) => {
                                                                            handleChange(e)
                                                                        }}
                                                                        value={dipatchInv.fullOrHalf}
                                                                        InputProps={{
                                                                            readOnly: true
                                                                        }}
                                                                        variant="outlined"
                                                                        id="fullOrHalf"
                                                                    >
                                                                        <MenuItem value={'0'}>
                                                                            --Select  Full / Half--
                                                                        </MenuItem>
                                                                        <MenuItem value={'1'}>Full</MenuItem>
                                                                        <MenuItem value={'2'}>Half</MenuItem>
                                                                    </TextField>
                                                                </Grid>
                                                                <Grid item md={3} xs={12}>
                                                                    <InputLabel shrink id="typeOfPack">
                                                                        Types Of Packs *
                                                                    </InputLabel>
                                                                    <TextField select
                                                                        error={Boolean(touched.typeOfPack && errors.typeOfPack)}
                                                                        fullWidth
                                                                        helperText={touched.typeOfPack && errors.typeOfPack}
                                                                        name="typeOfPack"
                                                                        onBlur={handleBlur}
                                                                        onChange={(e) => handleChange(e)}
                                                                        InputProps={{
                                                                            readOnly: true
                                                                        }}
                                                                        value={dipatchInv.typeOfPack}
                                                                        variant="outlined"
                                                                        id="typeOfPack"
                                                                    >
                                                                        <MenuItem value="0">--Select Types Of Packs--</MenuItem>
                                                                        <MenuItem value="1">CHEST</MenuItem>
                                                                        <MenuItem value="2">DJ-MWPS</MenuItem>
                                                                        <MenuItem value="3">MWPS</MenuItem>
                                                                        <MenuItem value="4">PS</MenuItem>
                                                                        <MenuItem value="5">SPBS</MenuItem>

                                                                    </TextField>
                                                                </Grid>
                                                                <Grid item md={3} xs={12}>
                                                                    <InputLabel shrink id="packNetWeight">
                                                                        Pack Net Weight (KG) *
                                                                    </InputLabel>
                                                                    <TextField
                                                                        fullWidth
                                                                        name="packNetWeight"
                                                                        onBlur={handleBlur}
                                                                        onChange={(e) => handleChange(e)}
                                                                        InputProps={{
                                                                            readOnly: true
                                                                        }}
                                                                        value={dipatchInv.packNetWeight}
                                                                        variant="outlined" >
                                                                    </TextField>
                                                                </Grid>
                                                                <Grid item md={3} xs={12}>
                                                                    <InputLabel shrink id="lotNo">
                                                                        No Of Packages *
                                                                    </InputLabel>
                                                                    <TextField
                                                                        fullWidth
                                                                        name="noOfPackages"
                                                                        onBlur={handleBlur}
                                                                        onChange={(e) => handleChange(e)}
                                                                        value={dipatchInv.noOfPackages}
                                                                        InputProps={{
                                                                            readOnly: true
                                                                        }}
                                                                        variant="outlined"
                                                                    />
                                                                </Grid>
                                                            </Grid>
                                                            <Grid container spacing={4}>
                                                                <Grid item md={3} xs={12}>
                                                                    <InputLabel shrink id="grossQuantity">
                                                                        Gross Qty (KG) *
                                                                    </InputLabel>
                                                                    <TextField
                                                                        fullWidth
                                                                        name="grossQuantity"
                                                                        onBlur={handleBlur}
                                                                        onChange={(e) => handleChange(e)}
                                                                        InputProps={{
                                                                            readOnly: true
                                                                        }}
                                                                        value={
                                                                            Number(dipatchInv.packNetWeight) *
                                                                            Number(dipatchInv.noOfPackages)
                                                                        }
                                                                        variant="outlined" >
                                                                    </TextField>
                                                                </Grid>
                                                                <Grid item md={3} xs={12}>
                                                                    <InputLabel shrink id="sampleQuantity">
                                                                        Sample Qty (KG) *
                                                                    </InputLabel>
                                                                    <TextField
                                                                        fullWidth
                                                                        name="sampleQuantity"
                                                                        onBlur={handleBlur}
                                                                        onChange={(e) => handleChange(e)}
                                                                        InputProps={{
                                                                            readOnly: true
                                                                        }}
                                                                        value={sampleQuantity}
                                                                        variant="outlined" >

                                                                    </TextField>
                                                                </Grid>



                                                                <Grid item md={3} xs={12}>
                                                                    <InputLabel shrink id="netQuantity">
                                                                        Net Qty (KG) *
                                                                    </InputLabel>
                                                                    <TextField
                                                                        fullWidth
                                                                        name="netQuantity"
                                                                        onBlur={handleBlur}
                                                                        onChange={(e) => handleChange(e)}
                                                                        InputProps={{
                                                                            readOnly: true
                                                                        }}
                                                                        value={dipatchInv.netQuantity
                                                                        }
                                                                        variant="outlined" >
                                                                    </TextField>
                                                                </Grid>
                                                            </Grid>
                                                            <br />
                                                            <br />
                                                            <Divider />
                                                            <br /><br />
                                                        </Card>
                                                    </CardContent>
                                                </Card>
                                            </CardContent>

                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                <Button
                                                    color="primary"
                                                    id="btnRecord"
                                                    variant="contained"
                                                    style={{ marginRight: '1rem' }}
                                                    className={classes.colorCancel}

                                                >
                                                    Print
                                                </Button>

                                            </Box>
                                            <Box display="flex" justifyContent="flex-end" p={2}>

                                            </Box>
                                        </PerfectScrollbar>
                                    </Card>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </Container>
            </Page>
        </Fragment>
    );
};

