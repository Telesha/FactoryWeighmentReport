import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box,
    Card,
    Grid,
    TextField,
    makeStyles,
    Container,
    Button,
    CardContent,
    InputLabel,
    CardHeader,
    Divider,
    MenuItem,
    Switch
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from "formik";
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
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
    }

}));
var screenCode = "VEHICLEREGISTRATION"
export default function VehicleRegistrationAddEdit(props) {
    const [title, setTitle] = useState("Add Vehicle")
    const classes = useStyles();
    const [isUpdate, setisUpdate] = useState(false);
    const [parameterOne, setParameterOne] = useState(false);
    const [factories, setFactories] = useState();
    const [VehicleTypes, setVehicleTypes] = useState();
    const [groups, setGroups] = useState();
    const [VehicleDetail, setVehicleDetail] = useState({
        vehicleID: 0,
        groupID: 0,
        factoryID: 0,
        vehicleTypeID: 0,
        vehicleNumber: '',
        fuelTypeID: 0,
        capacity: '',
        purchaseValue: '',
        lastYear: '',
        manufactureYear: '',
        manufactureBy: '',
        engineNumber: '',
        chassisNumber: '',
        applicableDate: null,
        expiryDateTax: null,
        expiryDateFitness: null,
        isActive: true
    });
    const navigate = useNavigate();
    const { vehicleID } = useParams();
    const alert = useAlert();
    let decrypted = 0;
    const handleClick = () => {
        navigate('/app/VehicleRegistration/listing');
    }
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });

    useEffect(() => {
        decrypted = atob(vehicleID.toString());
        if (decrypted != 0) {
            trackPromise(GetVehicleDetailsByVehicleID(decrypted));
        }
        trackPromise(getPermissions(), getGroupsForDropdown(), getVehicleTypeForDropdown());
    }, []);

    useEffect(() => {
        if (VehicleDetail.groupID > 0) {
            trackPromise(
                getfactoriesForDropDown()
            )
        }
    }, [VehicleDetail.groupID]);

    useEffect(() => {
        if (parameterOne) {
            setVehicleDetail({
                ...VehicleDetail,
                factoryID: '0'
            })
        }
    }, [VehicleDetail.groupID, parameterOne]);

    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITVEHICLEREGISTRATION');

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
        if (decrypted == 0) {
            setVehicleDetail({
                ...VehicleDetail,
                groupID: parseInt(tokenService.getGroupIDFromToken()),
                factoryID: parseInt(tokenService.getFactoryIDFromToken()),

            })
            setParameterOne(false);
        }
    }

    async function getfactoriesForDropDown() {
        const factory = await services.getFactoriesByGroupID(VehicleDetail.groupID);
        setFactories(factory);
    }
    async function getGroupsForDropdown() {
        const groups = await services.getGroupsForDropdown();
        setGroups(groups);
    }
    async function getVehicleTypeForDropdown() {
        const result = await services.getVehicleTypes();
        setVehicleTypes(result);
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

    async function GetVehicleDetailsByVehicleID(vehicleID) {
        let response = await services.GetVehicleDetailsByVehicleID(vehicleID);
        setTitle("Edit Vehicle");
        setVehicleDetail({
            ...VehicleDetail,
            groupID: response.groupID,
            factoryID: response.factoryID,
            vehicleNumber: response.vehicleRegistrationNumber,
            fuelTypeID: response.fuelTypeID,
            capacity: response.capacity == null ? '' : response.capacity,
            vehicleTypeID: response.vehicleTypeID,
            lastYear: response.purchaseYear == null ? '' : new Date(response.purchaseYear),
            manufactureYear: response.manufactureYear == null ? '' : new Date(response.manufactureYear),
            purchaseValue: response.purchaseValue == null ? '' : response.purchaseValue.toFixed(2),
            manufactureBy: response.manufactureBy == null ? '' : response.manufactureBy,
            engineNumber: response.engineNumber == null ? '' : response.engineNumber,
            chassisNumber: response.chassisNumber == null ? '' : response.chassisNumber,
            applicableDate: response.applicableDate == null ? '' : response.applicableDate,
            expiryDateTax: response.expiryDateTax == null ? '' : (response.expiryDateTax),
            expiryDateFitness: response.expiryDateFitness == null ? '' : (response.expiryDateFitness),
            isActive: response.isActive
        });
        setisUpdate(true);
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

    function handleChange(e) {
        const target = e.target;
        const value = target.value;
        setVehicleDetail({
            ...VehicleDetail,
            [e.target.name]: value
        });

        if (e.target.name === 'groupID') {
            setParameterOne(true);
        }
    }

    function handleChangeCheck(e) {
        const target = e.target;
        const value = target.checked;
        setVehicleDetail({
            ...VehicleDetail,
            [e.target.name]: value
        });
    }

    function handleDateChange(date) {
        setVehicleDetail({
            ...VehicleDetail,
            applicableDate: moment(date).format('YYYY-MM-DD')
        });
    }

    function handleexpiryDateTaxChange(date) {
        setVehicleDetail({
            ...VehicleDetail,
            expiryDateTax: moment(date).format('YYYY-MM-DD')
        });
    }

    function handleexpiryDateFitnessChange(date) {
        setVehicleDetail({
            ...VehicleDetail,
            expiryDateFitness: moment(date).format('YYYY-MM-DD')
        });
    }

    async function SaveVehicle(values) {
        if (isUpdate == true) {
            let updateModel = {
                vehicleID: parseInt(atob(vehicleID.toString())),
                factoryID: parseInt(values.factoryID),
                groupID: parseInt(values.groupID),
                vehicleNumber: values.vehicleNumber,
                fuelTypeID: parseInt(values.fuelTypeID),
                capacity: values.capacity,
                purchaseValue: values.purchaseValue,
                vehicleTypeID: values.vehicleTypeID,
                purchaseYear: VehicleDetail.lastYear,
                manufactureYear: VehicleDetail.manufactureYear,
                manufactureBy: values.manufactureBy,
                engineNumber: values.engineNumber,
                chassisNumber: values.chassisNumber,
                applicableDate: values.applicableDate,
                expiryDateTax: values.expiryDateTax,
                expiryDateFitness: values.expiryDateFitness,
                modifiedBy: parseInt(tokenService.getUserIDFromToken()),
                isActive: values.isActive
            }
            let response = await services.updateVehicleDetail(updateModel);
            if (response.statusCode == "Success") {
                alert.success(response.message);
                setVehicleDetail(updateModel);
                navigate('/app/VehicleRegistration/listing');
            }
            else {
                alert.error(response.message);
            }
        }
        else {
            let response = await services.saveVehicleDetail(values);
            if (response.statusCode == "Success") {
                alert.success(response.message);
                setVehicleDetail(values);
                navigate('/app/VehicleRegistration/listing');
            }
            else {
                alert.error(response.message);
            }
        }
    }

    function handleYearChange(value) {
        setVehicleDetail({
            ...VehicleDetail,
            lastYear: value
        })
    }

    function handleManufactureYearChange(value) {
        setVehicleDetail({
            ...VehicleDetail,
            manufactureYear: value.toISOString().split('T')[0]
        })
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: VehicleDetail.groupID,
                            factoryID: VehicleDetail.factoryID,
                            vehicleNumber: VehicleDetail.vehicleNumber,
                            fuelTypeID: VehicleDetail.fuelTypeID,
                            capacity: VehicleDetail.capacity,
                            vehicleTypeID: VehicleDetail.vehicleTypeID,
                            lastYear: VehicleDetail.lastYear,
                            manufactureYear: VehicleDetail.manufactureYear,
                            purchaseValue: VehicleDetail.purchaseValue,
                            manufactureBy: VehicleDetail.manufactureBy,
                            engineNumber: VehicleDetail.engineNumber,
                            chassisNumber: VehicleDetail.chassisNumber,
                            applicableDate: VehicleDetail.applicableDate,
                            expiryDateTax: VehicleDetail.expiryDateTax,
                            expiryDateFitness: VehicleDetail.expiryDateFitness,
                            isActive: VehicleDetail.isActive
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().notRequired(),
                                factoryID: Yup.number().notRequired().when("groupID",
                                    {
                                        is: val => val > 0,
                                        then: Yup.number().required('Please select a location').min("1", 'Please select a location'),
                                    }),
                                vehicleTypeID: Yup.number().required('Vehicle Type is required').min("1", 'Vehicle Type is required'),
                                vehicleNumber: Yup.string().required('Vehicle Number is Required'),
                                purchaseValue: Yup.string().notRequired().matches(/^\s*(?=.*[0-9])\d*(?:\.\d{1,2})?\s*$/, 'Purchase Value allow Only 2 decimals'),
                                fuelTypeID: Yup.number().max(255).required('Fuel Type is Required').min("1", 'Fuel Type is Required'),
                                lastYear: Yup.string().notRequired(),
                                manufactureYear: Yup.string().notRequired(),
                                expiryDateFitness: Yup.string().notRequired().nullable(),
                                expiryDateTax: Yup.string().notRequired().nullable(),
                                applicableDate: Yup.string().notRequired().nullable(),
                            })
                        }
                        onSubmit={(e) => trackPromise(SaveVehicle(e))}
                        enableReinitialize
                    >
                        {({
                            errors,
                            handleBlur,
                            handleSubmit,
                            isSubmitting,
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
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="vehicleTypeID">
                                                            Vehicle Type *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.vehicleTypeID && errors.vehicleTypeID)}
                                                            fullWidth
                                                            helperText={touched.vehicleTypeID && errors.vehicleTypeID}
                                                            name="vehicleTypeID"
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={VehicleDetail.vehicleTypeID}
                                                            variant="outlined"
                                                            id="vehicleTypeID"
                                                        >
                                                            <MenuItem value="0">--Select Vehicle Type--</MenuItem>
                                                            {generateDropDownMenu(VehicleTypes)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="fuelTypeID">
                                                            Fuel Type *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.fuelTypeID && errors.fuelTypeID)}
                                                            fullWidth
                                                            helperText={touched.fuelTypeID && errors.fuelTypeID}
                                                            name="fuelTypeID"
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={VehicleDetail.fuelTypeID}
                                                            variant="outlined"
                                                        >
                                                            <MenuItem value="0">--Select Fuel Type--</MenuItem>
                                                            <MenuItem value="1">Petrol</MenuItem>
                                                            <MenuItem value="2">Diesel</MenuItem>
                                                            <MenuItem value="3">Kerosene</MenuItem>
                                                            <MenuItem value="4">Gas</MenuItem>
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="engineNumber">
                                                            Engine Number
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            name="engineNumber"
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={VehicleDetail.engineNumber}
                                                            variant="outlined"
                                                        />
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="chassisNumber">
                                                            Chassis Number
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            name="chassisNumber"
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={VehicleDetail.chassisNumber}
                                                            variant="outlined"
                                                        />
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="manufactureBy">
                                                            Make (Name of the Manufacturer)
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            name="manufactureBy"
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={VehicleDetail.manufactureBy}
                                                            variant="outlined"
                                                        />
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="manufactureYear" style={{ marginBottom: '-8px' }}>
                                                            Model (Year of Manufacture)
                                                        </InputLabel>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <KeyboardDatePicker
                                                                error={Boolean(touched.manufactureYear && errors.manufactureYear)}
                                                                fullWidth
                                                                helperText={touched.manufactureYear && errors.manufactureYear}
                                                                autoOk
                                                                views={['year']}
                                                                format="yyyy"
                                                                inputVariant="outlined"
                                                                margin="dense"
                                                                name="manufactureYear"
                                                                disableFuture
                                                                value={VehicleDetail.manufactureYear}
                                                                onChange={(e) => {
                                                                    handleManufactureYearChange(e);
                                                                }}
                                                                KeyboardButtonProps={{
                                                                    'aria-label': 'change date',
                                                                }}
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="capacity">
                                                            Capacity
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            name="capacity"
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={VehicleDetail.capacity}
                                                            variant="outlined"
                                                        />
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="lastYear" style={{ marginBottom: '-8px' }}>
                                                            Date of Purchase
                                                        </InputLabel>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <KeyboardDatePicker
                                                                error={Boolean(touched.lastYear && errors.lastYear)}
                                                                fullWidth
                                                                helperText={touched.lastYear && errors.lastYear}
                                                                autoOk
                                                                views={['year']}
                                                                inputVariant="outlined"
                                                                margin="dense"
                                                                format="yyyy"
                                                                name="lastYear"
                                                                disableFuture
                                                                value={VehicleDetail.lastYear}
                                                                onChange={(e) => {
                                                                    handleYearChange(e);
                                                                }}
                                                                KeyboardButtonProps={{
                                                                    'aria-label': 'change date',
                                                                }}
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="purchaseValue">
                                                            Purchase Value
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.purchaseValue && errors.purchaseValue)}
                                                            fullWidth
                                                            helperText={touched.purchaseValue && errors.purchaseValue}
                                                            name="purchaseValue"
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={VehicleDetail.purchaseValue}
                                                            variant="outlined"
                                                        />
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="applicableDate" style={{ marginBottom: '-8px' }}> Date of Registration</InputLabel>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <KeyboardDatePicker
                                                                error={Boolean(touched.applicableDate && errors.applicableDate)}
                                                                fullWidth
                                                                helperText={touched.applicableDate && errors.applicableDate}
                                                                inputVariant="outlined"
                                                                variant="inline"
                                                                format="dd/MM/yyyy"
                                                                margin="dense"
                                                                name='applicableDate'
                                                                id='applicableDate'
                                                                size='small'
                                                                value={VehicleDetail.applicableDate}
                                                                onChange={(e) => {
                                                                    handleDateChange(e)
                                                                }}
                                                                KeyboardButtonProps={{
                                                                    'aria-label': 'change date',
                                                                }}
                                                                autoOk
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="vehicleNumber">
                                                            Registration Number *
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.vehicleNumber && errors.vehicleNumber)}
                                                            fullWidth
                                                            helperText={touched.vehicleNumber && errors.vehicleNumber}
                                                            name="vehicleNumber"
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={VehicleDetail.vehicleNumber}
                                                            variant="outlined"
                                                        />
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="expiryDateTax" style={{ marginBottom: '-8px' }}> Expiry Date of Tax Token</InputLabel>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <KeyboardDatePicker
                                                                error={Boolean(touched.expiryDateTax && errors.expiryDateTax)}
                                                                fullWidth
                                                                helperText={touched.expiryDateTax && errors.expiryDateTax}
                                                                inputVariant="outlined"
                                                                variant="inline"
                                                                format="dd/MM/yyyy"
                                                                margin="dense"
                                                                name='expiryDateTax'
                                                                id='expiryDateTax'
                                                                size='small'
                                                                value={VehicleDetail.expiryDateTax}
                                                                onChange={(e) => {
                                                                    handleexpiryDateTaxChange(e)
                                                                }}
                                                                KeyboardButtonProps={{
                                                                    'aria-label': 'change date',
                                                                }}
                                                                autoOk
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="expiryDateFitness" style={{ marginBottom: '-8px' }}> Expiry Date of Fitness</InputLabel>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <KeyboardDatePicker
                                                                error={Boolean(touched.expiryDateFitness && errors.expiryDateFitness)}
                                                                fullWidth
                                                                helperText={touched.expiryDateFitness && errors.expiryDateFitness}
                                                                inputVariant="outlined"
                                                                variant="inline"
                                                                format="dd/MM/yyyy"
                                                                margin="dense"
                                                                name='expiryDateFitness'
                                                                id='expiryDateFitness'
                                                                size='small'
                                                                value={VehicleDetail.expiryDateFitness}
                                                                onChange={(e) => {
                                                                    handleexpiryDateFitnessChange(e)
                                                                }}
                                                                KeyboardButtonProps={{
                                                                    'aria-label': 'change date',
                                                                }}
                                                                autoOk
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>
                                                </Grid>
                                                <br></br><br></br>
                                                <Grid container spacing={3}>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="groupID">
                                                            Business Division
                                                        </InputLabel>
                                                        <TextField select
                                                            fullWidth
                                                            name="groupID"
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={VehicleDetail.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            InputProps={{
                                                                readOnly: !permissionList.isGroupFilterEnabled ? true : false
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Business Division--</MenuItem>
                                                            {generateDropDownMenu(groups)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="factoryID">
                                                            Location
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.factoryID && errors.factoryID)}
                                                            fullWidth
                                                            helperText={touched.factoryID && errors.factoryID}
                                                            name="factoryID"
                                                            onBlur={handleBlur}
                                                            size='small'
                                                            onChange={(e) => handleChange(e)}
                                                            value={VehicleDetail.factoryID}
                                                            variant="outlined"
                                                            id="factoryID"
                                                            InputProps={{
                                                                readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Location--</MenuItem>
                                                            {generateDropDownMenu(factories)}
                                                        </TextField>
                                                    </Grid>
                                                </Grid>
                                                <br></br>
                                                <Grid container spacing={3}>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="isActive">
                                                            Active
                                                        </InputLabel>
                                                        <Switch
                                                            checked={VehicleDetail.isActive}
                                                            onChange={(e) => handleChangeCheck(e)}
                                                            name="isActive"
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                <Button
                                                    color="primary"
                                                    disabled={isSubmitting}
                                                    type="submit"
                                                    variant="contained"
                                                >
                                                    {isUpdate == true ? "Update" : "Save"}
                                                </Button>
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