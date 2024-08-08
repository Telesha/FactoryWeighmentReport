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

var screenCode = "VEHICLETYPE"

export default function VehicleTypeListing() {
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [vehicleType, setVehicleType] = useState([]);
    const alert = useAlert();
    const [vehicleTypeID, setVehicleTypeID] = useState(0);
    const [excel, setExcel] = useState(false);
    const [initialLoad, setInitialLoad] = useState(null);
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [vehicleTypeList, setVehicleTypeList] = useState({
        factoryID: 0
    })
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
        isAddEditScreen: false
    });
    const [vehicleTypes, setVehicleTypes] = useState([]);
    const navigate = useNavigate();
    let encrypted = "";
    const handleClick = () => {
        encrypted = btoa('0');
        let model = {
            factoryID: parseInt(vehicleTypeList.factoryID),
        }
        sessionStorage.setItem(
            'vehicleType-listing-page-search-parameters-id',
            JSON.stringify(model)
        );
        navigate('/app/VehicleType/addedit/' + encrypted);
    }
    const handleClickEdit = (vehicleTypeID) => {
        encrypted = btoa(vehicleTypeID.toString());
        let model = {
            factoryID: parseInt(vehicleTypeList.factoryID),
        }
        sessionStorage.setItem(
            'vehicleType-listing-page-search-parameters-id',
            JSON.stringify(model)
        );
        navigate('/app/VehicleType/addedit/' + encrypted);
    }

    useEffect(() => {
        const IDdata = JSON.parse(
            sessionStorage.getItem('vehicleType-listing-page-search-parameters-id')
        )
        if (IDdata != null) {
            setVehicleTypeList({
                ...vehicleTypeList,
                factoryID: parseInt(IDdata.factoryID),
            })
            setInitialLoad(IDdata);
        }
        getPermissions();
    }, []);

    useEffect(() => {
        sessionStorage.removeItem(
            'vehicleType-listing-page-search-parameters-id'
        );
    }, []);

    useEffect(() => {
        trackPromise(
            getPermissions(),
            getGroupsForDropdown(),
        );
    }, []);

    useEffect(() => {
        if (vehicleTypeID != 0) {
            handleClickEdit(vehicleTypeID)
        }
    }, [vehicleTypeID]);

    useEffect(() => {
        if (excel == true) {
            createFile()
        }
    }, [excel]);

    useEffect(() => {
        if (vehicleTypeList.groupID > 0) {
            trackPromise(
                getFactoriesByGroupID(),
            )
        }
    }, [vehicleTypeList.groupID]);

    useEffect(() => {
        trackPromise(
            GetVehicleTypeDetails()
        )
    }, [vehicleTypeList.factoryID]);

    useEffect(() => {
        if (initialLoad != null) {
            trackPromise(
                GetVehicleTypeDetails())
        }
    }, [initialLoad]);

    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWVEHICLETYPE');

        if (isAuthorized === undefined) {
            navigate('/404');
        }

        var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');
        var isAddEditScreen = permissions.find(p => p.permissionCode == 'ADDEDITVEHICLETYPE');

        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
            isAddEditScreen: isAddEditScreen !== undefined
        })
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

    const handleChange = (e) => {
        const target = e.target;
        const value = target.value
        setVehicleTypeList({
            ...vehicleTypeList,
            [e.target.name]: value
        });
    }

    async function getGroupsForDropdown() {
        const groups = await services.getGroupsForDropdown();
        setGroups(groups);
    }

    async function getFactoriesByGroupID() {
        const factory = await services.getFactoriesByGroupID(vehicleTypeList.groupID);
        setFactories(factory);
    }

    async function GetVehicleTypeDetails() {
        const response = await services.GetVehicleTypeDetails(vehicleTypeList.factoryID);
        if (response.statusCode == "Success" && response.data.length > 0) {
            setVehicleTypes(response.data);
        }
        else {
            setVehicleTypes([]);
        }
    }

    function cardTitle(titleName) {
        return (
            <Grid container spacing={1}>
                <Grid item md={10} xs={12}>
                    {titleName}
                </Grid>
                <Grid item md={2} xs={12}>
                    {permissionList.isAuthorizedOne == true ?
                        <PageHeader
                            onClick={handleClick}
                            isEdit={true}
                            toolTiptitle={"Vehicle Types"}
                        /> : null}
                </Grid>
            </Grid>
        )
    }

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            array.map(x => {
                var vr = {
                    'Location': x.factoryName,
                    'Vehicle Type': x.vehicleName,
                    'Vehicle Type Code': x.vehicleTypeCode,
                    'Status': x.isActive == true ? 'Active' : 'InActive'
                }
                res.push(vr);
            });
        }
        return res;
    }

    async function createFile() {
        setExcel(false)
        var file = await createDataForExcel(vehicleTypes);
        var settings = {
            sheetName: 'Vehicle Type',
            fileName: 'Vehicle Type',
            writeOptions: {}
        }

        let keys = Object.keys(file[0])
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem })
        })

        let dataA = [
            {
                sheet: 'Vehicle Type',
                columns: tempcsvHeaders,
                content: file
            }
        ]
        xlsx(dataA, settings);
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
            title="Vehicle Types"
        >
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: vehicleTypeList.groupID,
                        factoryID: vehicleTypeList.factoryID
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required(),
                            factoryID: Yup.number().required()
                        })
                    }
                    onSubmit={() => trackPromise(GetVehicleTypeDetails())}
                >
                    {({
                        handleSubmit,
                    }) => (
                        <form onSubmit={handleSubmit}>

                            <Box mt={0}>
                                <Card>
                                    <CardHeader
                                        title={cardTitle("Add Vehicle Type")}
                                    />
                                    <PerfectScrollbar>
                                        <Divider />
                                        <CardContent style={{ marginBottom: "2rem" }}>
                                            <Grid container spacing={3}>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="groupID">
                                                        Business Division *
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="groupID"
                                                        size='small'
                                                        onChange={(e) => handleChange(e)}
                                                        value={vehicleTypeList.groupID}
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
                                                        Location *
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="factoryID"
                                                        size='small'
                                                        onChange={(e) => handleChange(e)}
                                                        value={vehicleTypeList.factoryID}
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
                                        {vehicleTypes.length > 0 ?
                                            <CustomTable vehicleTypes={vehicleTypes} setVehicleTypeID={setVehicleTypeID} setExcel={setExcel} permissionList={permissionList.isAddEditScreen} />
                                            : <SearchNotFound searchQuery="Vehicle Types" />}
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