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

var screenCode = "VEHICLETYPE"

export default function VehicleTypeAddEdit(props) {
    const [title, setTitle] = useState("Add Vehicle")
    const classes = useStyles();
    const [isUpdate, setisUpdate] = useState(false);
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [vehicleTypeList, setVehicleTypeList] = useState({
        vehicleTypeID: 0,
        groupID: 0,
        factoryID: 0,
        vehicleTypeCode: '',
        vehicleName: '',
        isActive: true
    });
    const navigate = useNavigate();
    const { vehicleTypeID } = useParams();
    const alert = useAlert();
    let decrypted = 0;
    const handleClick = () => {
        navigate('/app/VehicleType/listing');
    }
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });

    useEffect(() => {
        decrypted = atob(vehicleTypeID.toString());
        if (decrypted != 0) {
            trackPromise(
                GetVehicleTypeDetailsByID(decrypted));
        }
    }, []);

    useEffect(() => {
        trackPromise(
            getPermissions(),
            getGroupsForDropdown()
        );
    }, []);

    useEffect(() => {
        if (vehicleTypeList.groupID > 0) {
            trackPromise(
                getfactoriesForDropDown()
            )
        }
    }, [vehicleTypeList.groupID]);

    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITVEHICLETYPE');

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
    }

    async function getGroupsForDropdown() {
        const groups = await services.getGroupsForDropdown();
        setGroups(groups);
    }

    async function getfactoriesForDropDown() {
        const factory = await services.getFactoriesByGroupID(vehicleTypeList.groupID);
        setFactories(factory);
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

    async function GetVehicleTypeDetailsByID(vehicleTypeID) {
        let response = await services.GetVehicleTypeDetailsByID(vehicleTypeID);
        let data = response[0];
        setTitle("Update Vehicle Type");
        setVehicleTypeList(prevState => ({
            ...prevState,
            vehicleTypeID: data.vehicleTypeID,
            groupID: data.groupID,
            factoryID: data.factoryID,
            vehicleTypeCode: data.vehicleTypeCode,
            vehicleName: data.vehicleName,
            isActive: data.isActive
        }));
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
        setVehicleTypeList({
            ...vehicleTypeList,
            [e.target.name]: value
        });
    }

    function handleChangeCheck(e) {
        const target = e.target;
        const value = target.checked;
        setVehicleTypeList({
            ...vehicleTypeList,
            [e.target.name]: value
        });
    }

    async function SaveVehicleType(values) {
        if (isUpdate == true) {
            let updateModel = {
                vehicleTypeID: atob(vehicleTypeID.toString()),
                factoryID: parseInt(values.factoryID),
                groupID: parseInt(values.groupID),
                vehicleTypeCode: values.vehicleTypeCode,
                vehicleName: values.vehicleName,
                isActive: values.isActive,
            }
            let response = await services.updateVehicleType(updateModel);
            if (response.statusCode == "Success") {
                alert.success(response.message);
                setVehicleTypeList(updateModel);
                navigate('/app/VehicleType/listing');
            }
            else {
                alert.error(response.message);
            }
        }
        else {
            let response = await services.SaveVehicleType(values);
            if (response.statusCode == "Success") {
                alert.success(response.message);
                setVehicleTypeList(values);
                navigate('/app/VehicleType/listing');
            }
            else {
                alert.error(response.message);
            }
        }
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            vehicleTypeID: parseInt(atob(vehicleTypeID.toString())),
                            groupID: parseInt(vehicleTypeList.groupID),
                            factoryID: parseInt(vehicleTypeList.factoryID),
                            vehicleTypeCode: vehicleTypeList.vehicleTypeCode,
                            vehicleName: vehicleTypeList.vehicleName,
                            isActive: vehicleTypeList.isActive
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number()
                                    .required('Business Division is required')
                                    .moreThan(0, 'Please select a valid Business Division'),
                                factoryID: Yup.number()
                                    .required('Location is required')
                                    .moreThan(0, 'Please select a valid Location'),
                                vehicleTypeCode: Yup.string()
                                    .required('Vehicle Type Code is required'),
                                vehicleName: Yup.string()
                                    .required('Vehicle Name is required')
                            })
                        }
                        onSubmit={(e) => trackPromise(SaveVehicleType(e))}
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
                                                        <InputLabel shrink id="groupID">
                                                            Business Division *
                                                        </InputLabel>
                                                        <TextField select
                                                            disabled={isUpdate}
                                                            error={Boolean(touched.groupID && errors.groupID)}
                                                            fullWidth
                                                            helperText={touched.groupID && errors.groupID}
                                                            name="groupID"
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={vehicleTypeList.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                        >
                                                            <MenuItem value="0">--Select Business Division--</MenuItem>
                                                            {generateDropDownMenu(groups)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="factoryID">
                                                            Location *
                                                        </InputLabel>
                                                        <TextField select
                                                            disabled={isUpdate}
                                                            error={Boolean(touched.factoryID && errors.factoryID)}
                                                            fullWidth
                                                            helperText={touched.factoryID && errors.factoryID}
                                                            name="factoryID"
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={vehicleTypeList.factoryID}
                                                            variant="outlined"
                                                        >
                                                            <MenuItem value="0">--Select Location--</MenuItem>
                                                            {generateDropDownMenu(factories)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="vehicleTypeCode">
                                                            Vehicle Type Code *
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.vehicleTypeCode && errors.vehicleTypeCode)}
                                                            fullWidth
                                                            helperText={touched.vehicleTypeCode && errors.vehicleTypeCode}
                                                            name="vehicleTypeCode"
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={vehicleTypeList.vehicleTypeCode}
                                                            variant="outlined"
                                                            id="vehicleTypeCode"
                                                        />
                                                    </Grid>

                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="vehicleName">
                                                            Vehicle Name *
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.vehicleName && errors.vehicleName)}
                                                            fullWidth
                                                            helperText={touched.vehicleName && errors.vehicleName}
                                                            name="vehicleName"
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={vehicleTypeList.vehicleName}
                                                            variant="outlined"
                                                            id="vehicleName"
                                                        />
                                                    </Grid>
                                                </Grid>
                                                
                                                <Grid container spacing={3}>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="isActive">
                                                            Active
                                                        </InputLabel>
                                                        <Switch
                                                            checked={vehicleTypeList.isActive}
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