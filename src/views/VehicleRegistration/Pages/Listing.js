import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box,
    Card,
    makeStyles,
    Container,
    CardHeader,
    CardContent,
    Divider,
    Button,
    MenuItem,
    Grid,
    InputLabel,
    TextField,
    Chip
} from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import SearchNotFound from 'src/views/Common/SearchNotFound';
import { CustomTable } from './CustomTable';
import xlsx from 'json-as-xlsx';
import tokenService from '../../../utils/tokenDecoder';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    },
    activeChip: {
        backgroundColor: 'green',
        color: 'white',
        border: '1px solid green',
    },
    inactiveChip: {
        backgroundColor: 'red',
        color: 'white',
        border: '1px solid red',
    },
}));

var screenCode = "VEHICLEREGISTRATION"

export default function VehicleRegistrationListing() {
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [Vehicle, setVehicle] = useState([]);
    const alert = useAlert();
    const [vehicleID, setVehicleID] = useState(0);
    const [excel, setExcel] = useState(false);
    const [initialLoad, setInitialLoad] = useState(null);
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [vehicleTypes, setVehicleTypes] = useState([]);
    const [VehicleData, setVehicleData] = useState({
        groupID: 0,
        factoryID: 0,
        vehicleTypeID: 0,
        fuelTypeID: 0
    })
    const navigate = useNavigate();
    let encrypted = "";
    const handleClick = () => {
        encrypted = btoa('0');
        let model = {
            groupID: parseInt(VehicleData.groupID),
            factoryID: parseInt(VehicleData.factoryID),
            vehicleID: parseInt(VehicleData.vehicleID),
            fuelTypeID: parseInt(VehicleData.fuelTypeID)
        }
        sessionStorage.setItem(
            'vehicleRegistration-listing-page-search-parameters-id',
            JSON.stringify(model)
        );
        navigate('/app/VehicleRegistration/addedit/' + encrypted);
    }
    const handleClickEdit = (vehicleID) => {
        encrypted = btoa(vehicleID.toString());
        let model = {
            groupID: parseInt(VehicleData.groupID),
            factoryID: parseInt(VehicleData.factoryID),
            vehicleID: parseInt(VehicleData.vehicleID),
            fuelTypeID: parseInt(VehicleData.fuelTypeID)
        }
        sessionStorage.setItem(
            'vehicleRegistration-listing-page-search-parameters-id',
            JSON.stringify(model)
        );
        navigate('/app/VehicleRegistration/addedit/' + encrypted);
    }
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
        isAddEditScreen: false
    });

    useEffect(() => {
        const IDdata = JSON.parse(
            sessionStorage.getItem('vehicleRegistration-listing-page-search-parameters-id')
        )
        if (IDdata != null) {
            setVehicleData({
                ...VehicleData,
                groupID: parseInt(IDdata.groupID),
                factoryID: parseInt(IDdata.factoryID),
                vehicleID: parseInt(IDdata.vehicleID),
                fuelTypeID: parseInt(IDdata.fuelTypeID)
            })
            setInitialLoad(IDdata);
        }
        getPermissions();
    }, []);

    useEffect(() => {
        sessionStorage.removeItem(
            'vehicleRegistration-listing-page-search-parameters-id'
        );
    }, []);

    useEffect(() => {
        trackPromise(
            getGroupsForDropdown(),
            getVehicleTypes());
    }, []);

    useEffect(() => {
        if (VehicleData.groupID > 0) {
            trackPromise(
                getFactoriesByGroupID()
            )
        }
    }, [VehicleData.groupID]);

    useEffect(() => {
        if (excel == true) {
            createFile()
        }
    }, [excel]);

    useEffect(() => {
        if (vehicleID != 0) {
            handleClickEdit(vehicleID)
        }
    }, [vehicleID]);

    useEffect(() => {
        if (initialLoad != null) {
            trackPromise(
                getVehicleDetails())
        }
    }, [initialLoad]);

    useEffect(() => {
        setVehicle([])
    }, [VehicleData]);

    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWVEHICLEREGISTRATION');

        if (isAuthorized === undefined) {
            navigate('/404');
        }

        var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');
        var isAddEditScreen = permissions.find(p => p.permissionCode == 'ADDEDITVEHICLEREGISTRATION');

        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
            isAddEditScreen: isAddEditScreen !== undefined
        })

        setVehicleData({
            ...VehicleData,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getGroupsForDropdown();
        setGroups(groups);
    }

    async function getFactoriesByGroupID() {
        const factory = await services.getFactoriesByGroupID(VehicleData.groupID);
        setFactories(factory);
    }

    async function getVehicleDetails() {
        let model = {
            groupID: parseInt(VehicleData.groupID),
            factoryID: parseInt(VehicleData.factoryID),
            vehicleTypeID: parseInt(VehicleData.vehicleTypeID),
            fuelTypeID: parseInt(VehicleData.fuelTypeID)
        }
        const response = await services.getVehicleDetails(model);
        if (response.statusCode == "Success" && response.data.length > 0) {
            setVehicle(response.data);
        }
        else {
            setVehicle([]);
            alert.error("No Records To Display")
        }
    }

    async function getVehicleTypes() {
        const result = await services.getVehicleTypes();
        setVehicleTypes(result);
    }

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            array.map(x => {
                var purchaseYear = new Date(x.purchaseYear).getFullYear();
                var applicableDate = new Date(x.applicableDate).toISOString().split('T')[0];
                var manufactureYear = new Date(x.manufactureYear).getFullYear();
                var expiryDateTax = new Date(x.expiryDateTax).toISOString().split('T')[0];
                var expiryDateFitness = new Date(x.expiryDateFitness).toISOString().split('T')[0];
                var fuelType;
                switch (x.fuelTypeID) {
                    case 1:
                        fuelType = 'Petrol';
                        break;
                    case 2:
                        fuelType = 'Diesel';
                        break;
                    case 3:
                        fuelType = 'Kerosene';
                        break;
                    case 4:
                        fuelType = 'Gas';
                        break;
                    default:
                        fuelType = '';
                }

                var vr = {
                    'Location': x.factoryName,
                    'Business Division': x.groupName,
                    'Vehicle type': x.vehicleName,
                    'Fuel Type': fuelType,
                    'Registration Number': x.vehicleRegistrationNumber,
                    'Date of Registration': applicableDate,
                    'Engine Number': x.engineNumber,
                    'Chassis Number': x.chassisNumber,
                    'Capacity': x.capacity == null ? '-' : x.capacity,
                    'Year of Purchase': purchaseYear,
                    'Purchase Value': x.purchaseValue == null ? '-' : x.purchaseValue.toFixed(2),
                    'Manufacture By': x.manufactureBy,
                    'Year of Manufacture': manufactureYear,
                    'Expiry Date of Tax Token': expiryDateTax,
                    'Expiry Date of Fitness': expiryDateFitness,
                    'Status': x.isActive == true ? 'Active' : 'InActive'
                }
                res.push(vr);
            });
        }
        return res;
    }

    async function createFile() {
        setExcel(false)
        var file = await createDataForExcel(Vehicle);
        var settings = {
            sheetName: 'Vehicle',
            fileName: 'Vehicle',
            writeOptions: {}
        }

        let keys = Object.keys(file[0])
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem })
        })

        let dataA = [
            {
                sheet: 'Vehicle',
                columns: tempcsvHeaders,
                content: file
            }
        ]
        xlsx(dataA, settings);
    }

    function handleGroupChange(e) {
        const target = e.target;
        const value = target.value
        setVehicleData({
            ...VehicleData,
            [e.target.name]: value,
            factoryID: "0"
        });
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

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setVehicleData({
            ...VehicleData,
            [e.target.name]: value
        });
    }

    function cardTitle(titleName) {
        return (
            <Grid container spacing={1}>
                <Grid item md={10} xs={12}>
                    {titleName}
                </Grid>
                <Grid item md={2} xs={12}>
                    {permissionList.isAddEditScreen == true ?
                        <PageHeader
                            onClick={handleClick}
                            isEdit={true}
                            toolTiptitle={"Vehicle Registration Add"}
                        />
                        : null}
                </Grid>
            </Grid>
        )
    }

    return (
        <Page
            className={classes.root}
            title="Vehicle Registration"
        >
            <Container maxWidth={false}>

                <Formik
                    initialValues={{
                        groupID: VehicleData.groupID,
                        factoryID: VehicleData.factoryID,
                        vehicleTypeID: VehicleData.vehicleTypeID,
                        fuelTypeID: VehicleData.fuelTypeID
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().notRequired(),
                            factoryID: Yup.number().notRequired(),
                            vehicleTypeID: Yup.number().notRequired(),
                            fuelTypeID: Yup.number().notRequired()
                        })
                    }
                    onSubmit={() => trackPromise(getVehicleDetails())}
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
                                        title={cardTitle("Vehicle Registration")}
                                    />
                                    <PerfectScrollbar>
                                        <Divider />
                                        <CardContent style={{ marginBottom: "2rem" }}>
                                            <Grid container spacing={3}>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="groupID">
                                                        Business Division
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="groupID"
                                                        size='small'
                                                        onChange={(e) => handleGroupChange(e)}
                                                        value={VehicleData.groupID}
                                                        defaultValue={0}
                                                        variant="outlined"
                                                        InputProps={{
                                                            readOnly: !permissionList.isGroupFilterEnabled ? true : false
                                                        }}
                                                    >
                                                        <MenuItem value={0}>--All Business Divisions--</MenuItem>
                                                        {generateDropDownMenu(groups)}
                                                    </TextField>
                                                </Grid>

                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="factoryID">
                                                        Location
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="factoryID"
                                                        size='small'
                                                        onChange={(e) => handleChange(e)}
                                                        value={VehicleData.factoryID}
                                                        defaultValue={0}
                                                        variant="outlined"
                                                        id="factoryID"
                                                        InputProps={{
                                                            readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                        }}
                                                    >
                                                        <MenuItem value={0}>--All Locations--</MenuItem>
                                                        {generateDropDownMenu(factories)}
                                                    </TextField>
                                                </Grid>

                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="vehicleTypeID">
                                                        Vehicle Types
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="vehicleTypeID"
                                                        size='small'
                                                        onChange={(e) => handleChange(e)}
                                                        value={VehicleData.vehicleTypeID}
                                                        defaultValue={0}
                                                        variant="outlined"
                                                        id="vehicleTypeID"
                                                    >
                                                        <MenuItem value={0}>--All Vehicle Types--</MenuItem>
                                                        {generateDropDownMenu(vehicleTypes)}
                                                    </TextField>
                                                </Grid>

                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="fuelTypeID">
                                                        Fuel Type
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="fuelTypeID"
                                                        size='small'
                                                        onChange={(e) => handleChange(e)}
                                                        value={VehicleData.fuelTypeID}
                                                        defaultValue={0}
                                                        variant="outlined"
                                                        id="fuelTypeID"
                                                    >
                                                        <MenuItem value={0}>--All Fuel Types--</MenuItem>
                                                        <MenuItem value={1}>Petrol</MenuItem>
                                                        <MenuItem value={2}>Diesel</MenuItem>
                                                        <MenuItem value={3}>Kerosene</MenuItem>
                                                        <MenuItem value={4}>Gas</MenuItem>
                                                    </TextField>
                                                </Grid>

                                            </Grid>
                                            <Box display="flex" flexDirection="row-reverse" p={2} style={{ marginTop: '20px' }}>
                                                <Button
                                                    color="primary"
                                                    type="submit"
                                                    variant="contained"
                                                >
                                                    Search
                                                </Button>
                                            </Box>
                                        </CardContent>
                                        {Vehicle.length > 0 ?
                                            <CustomTable Vehicle={Vehicle} setVehicleID={setVehicleID} setExcel={setExcel} permissionList={permissionList.isAddEditScreen} />
                                            : <SearchNotFound searchQuery="Vehicle" />}
                                    </PerfectScrollbar>
                                </Card>
                            </Box>
                        </form>
                    )}
                </Formik>
            </Container>
        </Page>
    );
};