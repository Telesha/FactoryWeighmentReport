import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box, Card, Grid, TextField, makeStyles, Container, Button,
    CardContent, Divider, InputLabel, CardHeader,
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder'
import { MenuItem } from '@material-ui/core';
import { trackPromise } from 'react-promise-tracker';

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

var screenCode = "LANDDISTRIBUTION"

export default function AddEditLandDistribution() {
    const [title, setTitle] = useState("Add Land Distribution")
    const [isUpdate, setIsUpdate] = useState(false);
    const [isDisableButton, setIsDisableButton] = useState(false);
    const classes = useStyles();
    const [landDistribution, setLandDistribution] = useState({
        landDistributionID: '0',
        groupID: "0",
        operationEntityID: "0",
        landDescriptionID: "0",
        printPriority: '',
        area: '0'
    });
    const [initialState, setInitialState] = useState(false);
    const [groupData, setGroupData] = useState([]);
    const [factoryData, setFactoryData] = useState([]);
    const [landDescription, setLandDescription] = useState([]);
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });

    const navigate = useNavigate();
    const handleClick = () => {
        navigate('/app/landDistribution/Listing');
    }
    const alert = useAlert();
    const { landDistributionID } = useParams();
    let decryptedID = 0;

    useEffect(() => {
        getPermission();
        GetAllGroups();
    }, []);

    useEffect(() => {
        trackPromise(
            getEstateDetailsByGroupID()
        )
    }, [landDistribution.groupID]);

    useEffect(() => {
        if (!initialState) {
            trackPromise(getPermission());
        }
    }, []);


    useEffect(() => {
        trackPromise(
            GetAllPrintPriorityByLandDescriptionID()
        )
    }, [landDistribution.landDescriptionID]);

    useEffect(() => {
        if (initialState) {
            setLandDistribution((prevState) => ({
                ...prevState,
                operationEntityID: 0,
            }));
        }
    }, [landDistribution.groupID, initialState]);

    useEffect(() => {
        GetAllLandDescriptions();
    }, [landDistribution.operationEntityID]);

    useEffect(() => {
        decryptedID = atob(landDistributionID.toString());
        if (decryptedID != 0) {
            setIsUpdate(true);
            setTitle("Edit Land Distribution");
            trackPromise(
                GetLandDistributionsDetailsByLandDistributionID(decryptedID)
            )
        }
    }, []);

    async function GetLandDistributionsDetailsByLandDistributionID(landDistributionID) {
        const landDistribution = await services.GetLandDistributionsDetailsByLandDistributionID(landDistributionID);
        setLandDistribution({
            ...landDistribution,
            landDistributionID: landDistribution.landDistributionID,
            groupID: landDistribution.groupID,
            operationEntityID: landDistribution.operationEntityID,
            landDescriptionID: landDistribution.landDescriptionID,
            printPriority: landDistribution.printPriority,
            area: landDistribution.area
        });
    }

    async function GetAllGroups() {
        const result = await services.GetAllGroups();
        setGroupData(result);
    }

    async function getEstateDetailsByGroupID() {
        var result = await services.getEstateDetailsByGroupID(landDistribution.groupID);
        setFactoryData(result);
    }

    async function GetAllLandDescriptions() {
        setLandDescription([]);
        var result = 0;
        if (isUpdate) {
            result = await services.GetAllLandDescriptions();
        }
        else {
            result = await services.GetAllLandDescriptionsWithoutSelected(landDistribution.operationEntityID);
        }
        setLandDescription(result);
    }

    async function GetAllPrintPriorityByLandDescriptionID() {
        const result = await services.GetAllPrintPriorityByLandDescriptionID(landDistribution.landDescriptionID);
        setLandDistribution({
            ...landDistribution,
            printPriority: result.printPriority
        })
    }

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITLANDDISTRIBUTION');

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

        setLandDistribution({
            ...landDistribution,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            operationEntityID: parseInt(tokenService.getFactoryIDFromToken())
        })
        setInitialState(true);
    }

    async function SaveLandDistribution(model) {
        if (isUpdate == true) {
            let updateModel = {
                landDistributionID: parseInt(atob(landDistributionID.toString())),
                operationEntityID: parseInt(landDistribution.operationEntityID),
                landDescriptionID: parseInt(landDistribution.landDescriptionID),
                printPriority: parseInt(landDistribution.printPriority),
                area: parseFloat(landDistribution.area),
                modifiedBy: parseInt(tokenService.getUserIDFromToken())
            }
            let response = await services.UpdateLandDistributions(updateModel);
            if (response.statusCode == "Success") {
                alert.success(response.message);
                setIsDisableButton(true);
                navigate('/app/landDistribution/Listing');
            }
            else {
                alert.error(response.message);
            }
        }
        else {
            let response = await services.SaveLandDistribution(model)
            if (response.statusCode == "Success") {
                alert.success(response.message);
                setIsDisableButton(true);
                navigate('/app/landDistribution/Listing');
            }
            else {
                alert.error(response.message);
            }
        }
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
        setLandDistribution({
            ...landDistribution,
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
                    <PageHeader
                        onClick={handleClick}
                        isEdit={false}
                    />
                </Grid>
            </Grid>
        )
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: landDistribution.groupID,
                            operationEntityID: landDistribution.operationEntityID,
                            landDescriptionID: landDistribution.landDescriptionID,
                            printPriority: landDistribution.printPriority,
                            area: landDistribution.area
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().min(1, 'Business Division is required').required('Business Division is required'),
                                operationEntityID: Yup.number().min(1, 'Location is required').required('Location is required'),
                                landDescriptionID: Yup.number().min(1, 'Land Description is required').required('Land Description is required'),
                                area: Yup.string().min(0, 'Area is required').required('Area is required').matches(/^[0-9]*(\.[0-9]{0,2})?$/, 'Area must have 2 Decimal Places'),
                            })
                        }
                        onSubmit={SaveLandDistribution}
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
                                                            error={Boolean(touched.groupID && errors.groupID)}
                                                            fullWidth
                                                            helperText={touched.groupID && errors.groupID}
                                                            name="groupID"
                                                            onChange={(e) => handleChange(e)}
                                                            size='small'
                                                            value={landDistribution.groupID}
                                                            variant="outlined"
                                                            InputProps={{
                                                                readOnly: !permissionList.isGroupFilterEnabled ? true : false || isUpdate
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Business Division--</MenuItem>
                                                            {generateDropDownMenu(groupData)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="operationEntityID">
                                                            Location *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.operationEntityID && errors.operationEntityID)}
                                                            fullWidth
                                                            helperText={touched.operationEntityID && errors.operationEntityID}
                                                            name="operationEntityID"
                                                            onChange={(e) => handleChange(e)}
                                                            size='small'
                                                            value={landDistribution.operationEntityID}
                                                            variant="outlined"
                                                            InputProps={{
                                                                readOnly: !permissionList.isFactoryFilterEnabled ? true : false || isUpdate
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Location--</MenuItem>
                                                            {generateDropDownMenu(factoryData)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="landDescriptionID">
                                                            Land Description *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.landDescriptionID && errors.landDescriptionID)}
                                                            fullWidth
                                                            helperText={touched.landDescriptionID && errors.landDescriptionID}
                                                            name="landDescriptionID"
                                                            onChange={(e) => handleChange(e)}
                                                            size='small'
                                                            value={landDistribution.landDescriptionID}
                                                            variant="outlined"
                                                            id="landDescriptionID"
                                                            disabled={isDisableButton}
                                                            InputProps={{
                                                                readOnly: isUpdate
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Land Description--</MenuItem>
                                                            {generateDropDownMenu(landDescription)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="printPriority">
                                                            Print Priority *
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.printPriority && errors.printPriority)}
                                                            fullWidth
                                                            helperText={touched.printPriority && errors.printPriority}
                                                            name="printPriority"
                                                            onChange={(e) => handleChange(e)}
                                                            size='small'
                                                            value={landDistribution.printPriority}
                                                            variant="outlined"
                                                            id="printPriority"
                                                            disabled={isDisableButton}
                                                            InputProps={{
                                                                readOnly: !isUpdate || isUpdate
                                                            }}
                                                        >
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="area">
                                                            Area *
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.area && errors.area)}
                                                            fullWidth
                                                            helperText={touched.area && errors.area}
                                                            name="area"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={landDistribution.area}
                                                            variant="outlined"
                                                            disabled={isDisableButton}
                                                            size='small'
                                                        />
                                                    </Grid>
                                                </Grid>
                                                <br />
                                                <br />
                                            </CardContent>
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                <Button
                                                    color="primary"
                                                    disabled={isSubmitting || isDisableButton}
                                                    type="submit"
                                                    variant="contained"
                                                    size='small'
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
        </Fragment >
    );
};
