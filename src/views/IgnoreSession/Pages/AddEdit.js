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
    MenuItem
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
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
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
var screenCode = "IGNORESESSION"
export default function IgnoreSessionAddEdit(props) {
    const [title, setTitle] = useState("Ignore Session Add")
    const classes = useStyles();
    const [isUpdate, setisUpdate] = useState(false);
    const [factories, setFactories] = useState();
    const [groups, setGroups] = useState();
    const [costCenter, setCostCenter] = useState([]);
    const [appliedDate, handleappliedDate] = useState(new Date());
    const [ignoreSession, setIgnoreSession] = useState({
        ignoreSessionID: 0,
        groupID: 0,
        OperationEntityID: 0,
        costCenterID: 0,
        registrationNumber: '',
        applyDate: new Date(),
        reason: '',
    });
    const navigate = useNavigate();
    const { ignoreSessionID } = useParams();
    const alert = useAlert();
    let decrypted = 0;
    const handleClick = () => {
        navigate('/app/ignoreSession/listing');
    }
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });

    useEffect(() => {
        decrypted = atob(ignoreSessionID.toString());
        if (decrypted != 0) {
            trackPromise(getIgnoreSessionDetailsByID(decrypted));
        }
        trackPromise(getPermissions(), getGroupsForDropdown());
    }, []);

    useEffect(() => {
        if (ignoreSession.groupID > 0) {
            trackPromise(
                getfactoriesForDropDown()
            )
        }
    }, [ignoreSession.groupID]);

    useEffect(() => {
        if (ignoreSession.OperationEntityID > 0) {
            trackPromise(
                getDivisionsByEstateID(ignoreSession.OperationEntityID)
            )
        }
    }, [ignoreSession.OperationEntityID]);

    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITIGNORESESSION');

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
            setIgnoreSession({
                ...ignoreSession,
                groupID: parseInt(tokenService.getGroupIDFromToken()),
                OperationEntityID: parseInt(tokenService.getFactoryIDFromToken()),
            })
        }
    }

    async function getfactoriesForDropDown() {
        const factory = await services.getFactoriesByGroupID(ignoreSession.groupID);
        setFactories(factory);
    }
    async function getGroupsForDropdown() {
        const groups = await services.getGroupsForDropdown();
        setGroups(groups);
    }

    async function getDivisionsByEstateID(gardenID) {
        const costCenters = await services.getDivisionByEstateID(gardenID);
        setCostCenter(costCenters);
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
    async function getIgnoreSessionDetailsByID(ignoreSessionID) {
        let response = await services.getIgnoreSessionDetailsByID(ignoreSessionID);
        setTitle("Edit Ignore Session");
        setIgnoreSession({
            ...ignoreSession,
            groupID: response.groupID,
            OperationEntityID: response.OperationEntityID,
            registrationNumber: response.registrationNumber,
            costCenterID: response.costCenterID,
            applyDate: response.applyDate,
            reason: response.reason,
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
        setIgnoreSession({
            ...ignoreSession,
            [e.target.name]: value
        });
    }
    async function saveIgnoreSession(values) {
        if (isUpdate == true) {
            let updateModel = {
                ignoreSessionID: parseInt(atob(ignoreSession.toString())),
                OperationEntityID: parseInt(ignoreSession.OperationEntityID),
                groupID: parseInt(ignoreSession.groupID),
                collectionPointID: parseInt(ignoreSession.costCenterID),
                registrationNumber: ignoreSession.registrationNumber,
                appliedDate: appliedDate,
                requestReason: ignoreSession.reason,
                modifiedBy: parseInt(tokenService.getUserIDFromToken())
            }
            let response = await services.updateIgnoreSession(updateModel);
            if (response.statusCode == "Success") {
                alert.success(response.message);
                setIgnoreSession(updateModel);
                navigate('/app/ignoreSession/listing');
            }
            else {
                alert.error(response.message);
            }
        }
        else {
            let saveModel = {
                OperationEntityID: parseInt(ignoreSession.OperationEntityID),
                groupID: parseInt(ignoreSession.groupID),
                collectionPointID: parseInt(ignoreSession.costCenterID),
                registrationNumber: ignoreSession.registrationNumber,
                appliedDate: appliedDate,
                requestReason: ignoreSession.reason,
                createdBy: parseInt(tokenService.getUserIDFromToken())
            }
            let response = await services.saveIgnoreSession(saveModel);
            if (response.statusCode == "Success") {
                alert.success(response.message);
                setIgnoreSession(values);
                navigate('/app/ignoreSession/listing');
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
                            groupID: ignoreSession.groupID,
                            OperationEntityID: ignoreSession.OperationEntityID,
                            costCenterID: ignoreSession.costCenterID,
                            registrationNumber: ignoreSession.registrationNumber,
                            appliedDate: ignoreSession.applyDate,
                            reason: ignoreSession.reason
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group required').min("1", 'Group required'),
                                OperationEntityID: Yup.number().required('factoryID required').min("1", 'factoryID required'),
                                costCenterID: Yup.number().required('Cost center is required').min("1", 'Cost center is required'),
                                registrationNumber: Yup.string().required('Registration Number is required'),
                                appliedDate: Yup.date().required('Apply date is required').typeError('Invalid date'),
                                reason: Yup.string().required('Reason  is required'),
                            })
                        }
                        onSubmit={(e) => trackPromise(saveIgnoreSession(e))}
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
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="groupID">
                                                            Legal Entity  *
                                                        </InputLabel>
                                                        <TextField select
                                                            fullWidth
                                                            helperText={touched.groupID && errors.groupID}
                                                            error={Boolean(touched.groupID && errors.groupID)}
                                                            name="groupID"
                                                            size='small'
                                                            onChange={(e) => handleChange(e)}
                                                            value={ignoreSession.groupID}
                                                            variant="outlined"
                                                            InputProps={{
                                                                readOnly: !permissionList.isGroupFilterEnabled ? true : false
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Legal Entity--</MenuItem>
                                                            {generateDropDownMenu(groups)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="OperationEntityID">
                                                            Garden *
                                                        </InputLabel>
                                                        <TextField select
                                                            fullWidth
                                                            helperText={touched.OperationEntityID && errors.OperationEntityID}
                                                            error={Boolean(touched.OperationEntityID && errors.OperationEntityID)}
                                                            name="OperationEntityID"
                                                            size='small'
                                                            onChange={(e) => handleChange(e)}
                                                            value={ignoreSession.OperationEntityID}
                                                            variant="outlined"
                                                            id="OperationEntityID"
                                                            InputProps={{
                                                                readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Garden--</MenuItem>
                                                            {generateDropDownMenu(factories)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="OperationEntityID">
                                                            Cost Center *
                                                        </InputLabel>
                                                        <TextField select
                                                            fullWidth
                                                            helperText={touched.costCenterID && errors.costCenterID}
                                                            error={Boolean(touched.costCenterID && errors.costCenterID)}
                                                            name="costCenterID"
                                                            size='small'
                                                            onChange={(e) => handleChange(e)}
                                                            value={ignoreSession.costCenterID}
                                                            variant="outlined"
                                                            id="costCenterID"
                                                            InputProps={{
                                                                readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Cost Center--</MenuItem>
                                                            {generateDropDownMenu(costCenter)}
                                                        </TextField>
                                                    </Grid>

                                                </Grid>
                                                <Grid container spacing={3}>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="registrationNumber">
                                                            Register Number *
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.registrationNumber && errors.registrationNumber)}
                                                            fullWidth
                                                            helperText={touched.registrationNumber && errors.registrationNumber}
                                                            name="registrationNumber"
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={ignoreSession.registrationNumber}
                                                            variant="outlined"
                                                            InputProps={{
                                                                readOnly: isUpdate ? true : false,
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="appliedDate" style={{ marginBottom: '-8px' }}>
                                                            Applied Date *
                                                        </InputLabel>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <KeyboardDatePicker
                                                                error={Boolean(touched.appliedDate && errors.appliedDate)}
                                                                helperText={touched.appliedDate && errors.appliedDate}
                                                                autoOk
                                                                fullWidth
                                                                variant="outlined"
                                                                format="dd/MM/yyyy"
                                                                margin='dense'
                                                                name="appliedDate"
                                                                id="appliedDate"
                                                                value={appliedDate}
                                                                minDate={new Date()}
                                                                onChange={(e) => {
                                                                    handleappliedDate(e);
                                                                }}
                                                                KeyboardButtonProps={{
                                                                    'aria-label': 'change date',
                                                                }}
                                                                InputProps={{ readOnly: true }}
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="reason">
                                                            Reason *
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.reason && errors.reason)}
                                                            fullWidth
                                                            helperText={touched.reason && errors.reason}
                                                            name="reason"
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            multiline
                                                            maxRows={4}
                                                            onChange={(e) => handleChange(e)}
                                                            value={ignoreSession.reason}
                                                            variant="outlined"
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                <Button
                                                    color="primary"
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