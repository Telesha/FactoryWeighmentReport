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
    Switch,
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
import MaterialTable from 'material-table';
import tokenService from '../../../utils/tokenDecoder';
import tokenDecoder from '../../../utils/tokenDecoder';
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
var screenCode = "DEDUCTIONTEMPLATE"
export default function DeductionAddEdit(props) {
    const [title, setTitle] = useState("Add Deduction Template")
    const classes = useStyles();
    const [isUpdate, setisUpdate] = useState(false);
    const [factories, setFactories] = useState();
    const [isDefaultDeductionEnabled, setIsDefaultDeductionEnabled] = useState(false);
    const [isFixedDeduction, setIsFixedDeduction] = useState(false);
    const [costCenter, setCostCenter] = useState([]);
    const [mobileMenu, setMobileMenu] = useState([]);
    const [deductionTypes, setDeductionTypes] = useState([]);
    const [applyMethods, setApplyMethods] = useState([]);
    const [initialState, setInitialState] = useState(false);
    const [groups, setGroups] = useState([]);
    const [deductionData, setDeductionData] = useState({
        deductionTemplateID: 0,
        groupID: 0,
        operationEntityID: 0,
        collectionPointID: 0,
        menuID: 0,
        deductionTypeID: 0,
        applyMethodID: 0,
        deductionOrder: '',
        deductionSequence: '',
        defaultValue: 0,
        minimumValue: 0,
        isFixed: false,
        isActive: true,
        isDefaultValueEnabled: false,
        entityTypeID: 0,
        fixedDeductions: []

    });
    const navigate = useNavigate();
    const { deductionID } = useParams();
    const alert = useAlert();
    let decrypted = 0;
    const handleClick = () => {
        navigate('/app/deductionTemplate/listing');
    }
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });

    const [state, setState] = useState({
        columns: [
            { title: 'Deduction Type', field: 'name' },
            { title: 'Value', field: 'value', type: 'numeric' },
        ],
        data: [],
    });
    const [deletedValues, setDeletedValues] = useState({
        deleted: []
    });

    useEffect(() => {
        decrypted = atob(deductionID.toString());
        if (decrypted != 0) {
            trackPromise(getDeductionDetailsByID(decrypted));
        }
        trackPromise(getPermissions(),
            getGroupsForDropdown(),
            getMobileMenuList(),
            getApplyMethodList()
        );
    }, []);

    useEffect(() => {
        if (deductionData.groupID > 0 && deductionData.operationEntityID > 0 && deductionData.collectionPointID > 0 && deductionData.menuID)
            trackPromise(
                getDeductionTypeList(),
            )
    }, [deductionData.collectionPointID, deductionData.menuID]);

    useEffect(() => {
        if (deductionData.groupID > 0) {
            trackPromise(
                getfactoriesForDropDown()
            )
        }
    }, [deductionData.groupID]);

    useEffect(() => {
        if (!initialState) {
            trackPromise(getPermissions());
        }
    }, []);

    useEffect(() => {
        if (deductionData.operationEntityID > 0) {
            trackPromise(
                getDivisionsByEstateID(deductionData.operationEntityID)
            );
        }
    }, [deductionData.operationEntityID]);

    useEffect(() => {
        if (initialState) {
            setDeductionData((prevState) => ({
                ...prevState,
                operationEntityID: 0,
                collectionPointID: 0,

            }));
        }
    }, [deductionData.groupID, initialState]);

    useEffect(() => {
        if (initialState) {
            setDeductionData((prevState) => ({
                ...prevState,
                collectionPointID: 0
            }));
        }
    }, [deductionData.operationEntityID, initialState]);

    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITDEDUCTIONTEMPLATE');

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
            setDeductionData({
                ...deductionData,
                groupID: parseInt(tokenService.getGroupIDFromToken()),
                operationEntityID: parseInt(tokenService.getFactoryIDFromToken()),
            })
            setInitialState(true);
        }
    }

    async function getfactoriesForDropDown() {
        const factory = await services.getFactoriesByGroupID(deductionData.groupID);
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

    async function getMobileMenuList() {
        const mobileMenu = await services.getMobileMenuList();
        setMobileMenu(mobileMenu);
    }

    async function getDeductionTypeList() {
        decrypted = atob(deductionID.toString());
        let divisionModel = {
            deductionTemplateID: parseInt(decrypted),
            groupID: parseInt(deductionData.groupID),
            operationEntityID: parseInt(deductionData.operationEntityID),
            collectionPointID: parseInt(deductionData.collectionPointID),
            menuID: parseInt(deductionData.menuID),
        }
        const deductionTypes = await services.getDeductionTypeList(divisionModel);
        setDeductionTypes(deductionTypes);
    }

    async function getApplyMethodList() {
        const applyMethod = await services.getApplyMethodList();
        setApplyMethods(applyMethod);
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
    async function getDeductionDetailsByID(deductionID) {
        let response = await services.getDeductionDetailsByID(deductionID);
        setTitle("Edit Deduction Template");
        setDeductionData({
            ...deductionData,
            deductionTemplateID: response.deductionTemplateID,
            groupID: response.groupID,
            operationEntityID: response.operationEntityID,
            collectionPointID: response.collectionPointID,
            menuID: response.menuID,
            deductionTypeID: response.deductionTypeID,
            applyMethodID: response.applyMethodID,
            deductionOrder: response.deductionOrder,
            deductionSequence: response.deductionSequence,
            defaultValue: response.defaultValue,
            minimumValue: response.minimumValue,
            isFixed: response.isFixed,
            isActive: response.isActive,
            isDefaultValueEnabled: response.isDefaultValueEnabled,
            entityTypeID: response.entityTypeID,
            fixedDeductions: response.fixedDeductions

        });
        setState({
            ...state,
            data: response.fixedDeductions
        });
        setIsFixedDeduction(response.isFixed);
        setIsDefaultDeductionEnabled(response.isDefaultValueEnabled)
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
        setDeductionData({
            ...deductionData,
            [e.target.name]: value
        });
    }

    function handleChangeSwitch(e) {

        if (e.target.name === "isFixedDeduction") {
            setIsDefaultDeductionEnabled(false);
            setIsFixedDeduction(!isFixedDeduction)
        }
        else if (e.target.name === "isDefaultDeductionEnabled") {
            setIsFixedDeduction(false);
            setIsDefaultDeductionEnabled(!isDefaultDeductionEnabled)
        }
        else {
            setDeductionData({
                ...deductionData,
                isActive: !deductionData.isActive
            })
        }
    }
    async function SaveDeductionTemplate(values) {
        if (isUpdate == true) {
            let updateModel = {
                deductionTemplateID: parseInt(deductionData.deductionTemplateID),
                groupID: parseInt(deductionData.groupID),
                operationEntityID: parseInt(deductionData.operationEntityID),
                collectionPointID: parseInt(deductionData.collectionPointID),
                MenuID: parseInt(deductionData.menuID),
                deductionTypeID: parseInt(deductionData.deductionTypeID),
                applyMethodID: parseInt(deductionData.applyMethodID),
                deductionOrder: parseInt(deductionData.deductionOrder),
                deductionSequence: parseInt(deductionData.deductionSequence),
                defaultValue: isDefaultDeductionEnabled == true ? parseFloat(deductionData.defaultValue) : parseFloat(0),
                minimumValue: isDefaultDeductionEnabled == true ? parseFloat(deductionData.minimumValue) : parseFloat(0),
                modifiedBy: parseInt(tokenService.getUserIDFromToken()),
                isFixed: isFixedDeduction,
                isActive: deductionData.isActive,
                isDefaultValueEnabled: isDefaultDeductionEnabled,
                fixedDeductions: state.data,
                deletedFixedDeduction: deletedValues.deleted
            }
            if (state.data.length == 0 && isFixedDeduction == true) {
                alert.error("At least one deduction type need");
            }
            else {
                let response = await services.updateDeductionTemplate(updateModel);
                if (response.statusCode == "Success") {
                    alert.success(response.message);
                    setDeductionData(updateModel);
                    navigate('/app/deductionTemplate/listing');
                }
                else {
                    alert.error(response.message);
                }
            }
        }
        else {
            let saveModel = {
                groupID: parseInt(deductionData.groupID),
                operationEntityID: parseInt(deductionData.operationEntityID),
                collectionPointID: parseInt(deductionData.collectionPointID),
                MenuID: parseInt(deductionData.menuID),
                deductionTypeID: parseInt(deductionData.deductionTypeID),
                applyMethodID: parseInt(deductionData.applyMethodID),
                deductionOrder: parseInt(deductionData.deductionOrder),
                deductionSequence: parseInt(deductionData.deductionSequence),
                defaultValue: isDefaultDeductionEnabled == true ? parseFloat(deductionData.defaultValue) : parseFloat(0),
                minimumValue: isDefaultDeductionEnabled == true ? parseFloat(deductionData.minimumValue) : parseFloat(0),
                createdBy: parseInt(tokenDecoder.getUserIDFromToken()),
                isFixed: isFixedDeduction,
                isActive: deductionData.isActive,
                isDefaultValueEnabled: isDefaultDeductionEnabled,
                fixedDeductions: state.data,

            }
            if (state.data.length == 0 && isFixedDeduction == true) {
                alert.error("At least one deduction type need");
            }
            else {
                let response = await services.SaveDeductionTemplate(saveModel);
                if (response.statusCode == "Success") {
                    alert.success(response.message);
                    setDeductionData(values);
                    navigate('/app/deductionTemplate/listing');
                }
                else {
                    alert.error(response.message);
                }
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
                            groupID: deductionData.groupID,
                            operationEntityID: deductionData.operationEntityID,
                            collectionPointID: deductionData.collectionPointID,
                            menuID: deductionData.menuID,
                            deductionTypeID: deductionData.deductionTypeID,
                            applyMethodID: deductionData.applyMethodID,
                            deductionOrder: deductionData.deductionOrder,
                            deductionSequence: deductionData.deductionSequence,
                            defaultValue: deductionData.defaultValue,
                            minimumValue: deductionData.minimumValue,
                            isActive: deductionData.isActive,
                            isFixedDeduction: isFixedDeduction,
                            isDefaultDeductionEnabled: isDefaultDeductionEnabled
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Legal Entity is required').min("1", 'Legal Entity is required'),
                                operationEntityID: Yup.number().required('Garden is required').min("1", 'Garden is required'),
                                collectionPointID: Yup.number().required('Cost Center is required').min("1", 'Cost Center is required'),
                                menuID: Yup.number().required('Mobile Menu is required').min("1", 'Mobile Menu is required'),
                                deductionTypeID: Yup.number().required('Deduction Type is required').min("1", 'Deduction Type is required'),
                                applyMethodID: Yup.number().required('Apply Method is required').min("1", 'Apply Method is required'),
                                deductionOrder: Yup.string().matches(/^-?\d+(\.\d+)?$/, "Please enter a correct value").nullable(),
                                deductionSequence: Yup.string().matches(/^-?\d+(\.\d+)?$/, "Please enter a correct value").nullable(),
                                defaultValue: isDefaultDeductionEnabled == true ? Yup.number().min(0.01, 'Default value should greater than 0').required('Default Value is required')
                                    : Yup.number().notRequired(),
                                minimumValue: isDefaultDeductionEnabled == true ? Yup.number().min(0, 'Minimum value must be positive number').required('Minimum Value is required')
                                    : Yup.number().notRequired()
                            })
                        }
                        onSubmit={(e) => trackPromise(SaveDeductionTemplate(e))}
                        enableReinitialize
                    >
                        {({
                            errors,
                            handleBlur,
                            handleSubmit,
                            isSubmitting,
                            touched,
                            values
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
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={deductionData.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            InputProps={{
                                                                readOnly: !permissionList.isGroupFilterEnabled ? true : false || isUpdate ? true : false
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Business Division--</MenuItem>
                                                            {generateDropDownMenu(groups)}
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
                                                            onBlur={handleBlur}
                                                            size='small'
                                                            onChange={(e) => handleChange(e)}
                                                            value={deductionData.operationEntityID}
                                                            variant="outlined"
                                                            id="operationEntityID"
                                                            InputProps={{
                                                                readOnly: !permissionList.isFactoryFilterEnabled ? true : false || isUpdate ? true : false
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Location--</MenuItem>
                                                            {generateDropDownMenu(factories)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="collectionPointID">
                                                            Sub Division*
                                                        </InputLabel>
                                                        <TextField select
                                                            fullWidth
                                                            helperText={touched.collectionPointID && errors.collectionPointID}
                                                            error={Boolean(touched.collectionPointID && errors.collectionPointID)}
                                                            name="collectionPointID"
                                                            size='small'
                                                            onChange={(e) => handleChange(e)}
                                                            value={deductionData.collectionPointID}
                                                            variant="outlined"
                                                            id="collectionPointID"
                                                        >
                                                            <MenuItem value="0">--Select Sub Division--</MenuItem>
                                                            {generateDropDownMenu(costCenter)}
                                                        </TextField>
                                                    </Grid>
                                                </Grid>

                                                <Grid container spacing={3}>

                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="menuID">
                                                            Mobile Menu *
                                                        </InputLabel>
                                                        <TextField select
                                                            fullWidth
                                                            helperText={touched.menuID && errors.menuID}
                                                            error={Boolean(touched.menuID && errors.menuID)}
                                                            name="menuID"
                                                            size='small'
                                                            onChange={(e) => handleChange(e)}
                                                            value={deductionData.menuID}
                                                            variant="outlined"
                                                            id="menuID"
                                                        >
                                                            <MenuItem value="0">--Select Mobile Menu--</MenuItem>
                                                            {generateDropDownMenu(mobileMenu)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="deductionTypeID">
                                                            Deduction Type *
                                                        </InputLabel>
                                                        <TextField select
                                                            fullWidth
                                                            helperText={touched.deductionTypeID && errors.deductionTypeID}
                                                            error={Boolean(touched.deductionTypeID && errors.deductionTypeID)}
                                                            name="deductionTypeID"
                                                            size='small'
                                                            onChange={(e) => handleChange(e)}
                                                            value={deductionData.deductionTypeID}
                                                            variant="outlined"
                                                            id="deductionTypeID"
                                                        >
                                                            <MenuItem value="0">--Select Deduction Type--</MenuItem>
                                                            {generateDropDownMenu(deductionTypes)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="applyMethodID">
                                                            Apply Method *
                                                        </InputLabel>
                                                        <TextField select
                                                            fullWidth
                                                            helperText={touched.applyMethodID && errors.applyMethodID}
                                                            error={Boolean(touched.applyMethodID && errors.applyMethodID)}
                                                            name="applyMethodID"
                                                            size='small'
                                                            onChange={(e) => handleChange(e)}
                                                            value={deductionData.applyMethodID}
                                                            variant="outlined"
                                                            id="applyMethodID"
                                                        >
                                                            <MenuItem value="0">--Select Apply Method--</MenuItem>
                                                            {generateDropDownMenu(applyMethods)}
                                                        </TextField>
                                                    </Grid>
                                                </Grid>
                                                <Grid container spacing={3}>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="deductionOrder">
                                                            Deduction Order
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.deductionOrder && errors.deductionOrder)}
                                                            fullWidth
                                                            helperText={touched.deductionOrder && errors.deductionOrder}
                                                            name="deductionOrder"
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={deductionData.deductionOrder}
                                                            variant="outlined"
                                                        />
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="deductionSequence">
                                                            Deduction Sequence
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.deductionSequence && errors.deductionSequence)}
                                                            fullWidth
                                                            helperText={touched.deductionSequence && errors.deductionSequence}
                                                            name="deductionSequence"
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={deductionData.deductionSequence}
                                                            variant="outlined"
                                                        />
                                                    </Grid>
                                                </Grid>
                                                <Grid container spacing={3}>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="isActive">
                                                            Active
                                                        </InputLabel>
                                                        <Switch
                                                            checked={deductionData.isActive}
                                                            onChange={(e) => handleChangeSwitch(e)}
                                                            name="isActive"
                                                            disabled={false}
                                                        />
                                                    </Grid>
                                                </Grid>

                                                <Grid container spacing={3}>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="isActive">
                                                            Is Fixed Deduction
                                                        </InputLabel>
                                                        <Switch
                                                            checked={isFixedDeduction}
                                                            onChange={(e) => handleChangeSwitch(e)}
                                                            name="isFixedDeduction"
                                                            disabled={false}
                                                        />
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="isActive">
                                                            Default Deduction Enabled
                                                        </InputLabel>
                                                        <Switch
                                                            checked={isDefaultDeductionEnabled}
                                                            onChange={(e) => handleChangeSwitch(e)}
                                                            name="isDefaultDeductionEnabled"
                                                            disabled={false}
                                                        />
                                                    </Grid>
                                                </Grid>
                                                {isDefaultDeductionEnabled ?
                                                    <Grid container spacing={3}>
                                                        <Grid item md={6} xs={12}>
                                                            <InputLabel shrink id="defaultValue">
                                                                Default Value *
                                                            </InputLabel>
                                                            <TextField
                                                                error={Boolean(touched.defaultValue && errors.defaultValue)}
                                                                fullWidth
                                                                helperText={touched.defaultValue && errors.defaultValue}
                                                                name="defaultValue"
                                                                size='small'
                                                                onBlur={handleBlur}
                                                                onChange={(e) => handleChange(e)}
                                                                value={deductionData.defaultValue}
                                                                variant="outlined"
                                                                InputProps={{
                                                                    inputProps: {
                                                                        step: 0.01,
                                                                        type: 'number',
                                                                    },
                                                                }}
                                                                onKeyDown={(evt) =>
                                                                    (evt.key === "-") && evt.preventDefault()
                                                                }
                                                                onWheel={event => event.target.blur()}
                                                            />
                                                        </Grid>
                                                        <Grid item md={6} xs={12}>
                                                            <InputLabel shrink id="minimumValue">
                                                                Minimum Value *
                                                            </InputLabel>
                                                            <TextField
                                                                error={Boolean(touched.minimumValue && errors.minimumValue)}
                                                                fullWidth
                                                                helperText={touched.minimumValue && errors.minimumValue}
                                                                name="minimumValue"
                                                                size='small'
                                                                onBlur={handleBlur}
                                                                onChange={(e) => handleChange(e)}
                                                                value={deductionData.minimumValue}
                                                                variant="outlined"
                                                                InputProps={{
                                                                    inputProps: {
                                                                        step: 0.01,
                                                                        type: 'number',
                                                                    },
                                                                }}
                                                                onKeyDown={(evt) =>
                                                                    (evt.key === "-") && evt.preventDefault()
                                                                }
                                                                onWheel={event => event.target.blur()}
                                                            />
                                                        </Grid>
                                                    </Grid> : null}
                                                {
                                                    isFixedDeduction ?
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={12} sm={4}>
                                                                <MaterialTable
                                                                    hidden={!isFixedDeduction}
                                                                    title="Deduction Types"
                                                                    fullWidth
                                                                    columns={state.columns}
                                                                    data={state.data}
                                                                    options={{ showTitle: false, search: false }}
                                                                    editable={{
                                                                        onRowAdd: (newData) =>
                                                                            new Promise((resolve) => {
                                                                                setTimeout(() => {
                                                                                    resolve();
                                                                                    setState((prevState) => {
                                                                                        const data = [...prevState.data];
                                                                                        data.push(newData);
                                                                                        return { ...prevState, data };
                                                                                    });
                                                                                }, 600);
                                                                            }),
                                                                        onRowUpdate: (newData, oldData) =>
                                                                            new Promise((resolve) => {
                                                                                setTimeout(() => {
                                                                                    resolve();
                                                                                    if (oldData) {
                                                                                        setState((prevState) => {
                                                                                            const data = [...prevState.data];
                                                                                            data[data.indexOf(oldData)] = newData;
                                                                                            return { ...prevState, data };
                                                                                        });
                                                                                    }
                                                                                }, 600);
                                                                            }),
                                                                        onRowDelete: (oldData) =>
                                                                            new Promise((resolve) => {
                                                                                setTimeout(() => {
                                                                                    resolve();

                                                                                    setState((prevState) => {
                                                                                        const data = [...prevState.data];
                                                                                        data.splice(data.indexOf(oldData), 1);
                                                                                        return { ...prevState, data };
                                                                                    });
                                                                                    setDeletedValues((prevState) => {
                                                                                        const deleted = [...prevState.deleted];
                                                                                        deleted.push(oldData);
                                                                                        return { ...prevState, deleted };
                                                                                    });

                                                                                }, 600);
                                                                            }),
                                                                    }}
                                                                />
                                                            </Grid>

                                                        </Grid>

                                                        : null
                                                }

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






//     async function getAvailableDeductionTypes() {

//         let filteredData = await services.getAvailableDeductionTypes(deduction.groupID, deduction.operationEntityID, deduction.collectionPointID, deduction.deductionTemplateID, deduction.collectionCategoryMenuID);
//         setDeductionType(filteredData)
//     }
