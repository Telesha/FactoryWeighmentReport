import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    Grid,
    TextField,
    makeStyles,
    Container,
    Button,
    CardContent,
    Divider,
    InputLabel,
    CardHeader,
    MenuItem,
    Switch
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { Formik } from 'formik';
import * as Yup from "yup";
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { useNavigate, useParams } from 'react-router-dom';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { LoadingComponent } from '../../../utils/newLoader';
import PageHeader from 'src/views/Common/PageHeader';
import tokenDecoder from '../../../utils/tokenDecoder';
import { useAlert } from "react-alert";

const useStyles = makeStyles((theme) => ({
    root: {
        minHeight: '100%',
    },
    avatar: {
        marginRight: theme.spacing(2)
    },
    cardContent: {
        border: `2px solid #e8eaf6`
    }
}));

const screenCode = "PACKAGE";
export default function AddEditPackage() {
    const classes = useStyles();
    const navigate = useNavigate();
    const [title, setTitle] = useState("Add Package")
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });
    const [package1, setPackage] = useState({
        groupID: '0',
        factoryID: '0',
        divisionID: '0',
        userID: '0',
        noOfSessions: '',
        packageCode: '',
        packageName: '',
        referenceNumber: '',
        pinCode: '',
        isActive: true
    })
    const [groups, setGroups] = useState();
    const [isUpdate, setIsUpdate] = useState(false);
    const [factories, setFactories] = useState();
    const [divisions, setDivisions] = useState();
    const [users, setUsers] = useState();
    const [IsActiveValue, setIsActiveValue] = useState(true);
    const [pkgID, setPkgID] = useState('');
    const alert = useAlert();
    const { packageID } = useParams();
    let decryptedID = 0;

    const handleClick = () => {
        navigate('/app/package/listing');
    }

    useEffect(() => {
        decryptedID = atob(packageID.toString());
        setPkgID(decryptedID)
        
        if (decryptedID != 0) {
            setIsUpdate(true);
            setTitle("Edit Package");
            trackPromise(
                GetPackageDetailsByPackageID(decryptedID));
        }
        trackPromise(
            getPermission(),
        );
    }, []);

    useEffect(() => {
        trackPromise(
            getFactoriesForDropDown(),
        )
    }, [package1.groupID]);

    useEffect(() => {
        trackPromise(
            getDivisionsForDropDown(),
        );
    }, [package1.factoryID]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITPACKAGE');
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

        setPackage({
            ...package1,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        });

        trackPromise(getGroupsForDropdown(), getMobileAccessibleUsersForDropDown())
    }
    function onIsActiveChange() {
        setIsActiveValue(!IsActiveValue);
    }

    async function getGroupsForDropdown() {
        const groups = await services.getGroupsForDropdown();
        setGroups(groups);
    }
    async function getFactoriesForDropDown() {
        const factoryList = await services.getFactoryByGroupID(package1.groupID);
        setFactories(factoryList);
    }
    async function getDivisionsForDropDown() {
        const divisionList = await services.getDivisionDetailsByEstateID(parseInt(package1.factoryID))
        setDivisions(divisionList)
    }
    async function getMobileAccessibleUsersForDropDown() {
        const mobileUsers = await services.getMobileAccessibleUsers()
        setUsers(mobileUsers)
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
                items.push(<MenuItem key={key} value={key}>{value.firstName + ' ' + value.lastName}</MenuItem>);
            }
        }
        return items
    }
    function handleChangeForm(e) {
        const target = e.target;
        const value = target.value

        setPackage({
            ...package1,
            [e.target.name]: value
        });
    }

    async function GetPackageDetailsByPackageID(packageID) {
        let response = await services.GetPackageDetailsByPackageID(packageID);
       

        setTitle("Edit Package");
        setPackage({
            ...package1,
            groupID: response.groupID,
            factoryID: response.factoryID,
            divisionID: response.divisionID,
            userID: response.userID,
            noOfSessions: response.noOfSessions,
            packageCode: response.packageCode,
            packageName: response.packageName,
            referenceNumber: response.referenceNumber,
            pinCode: response.pinCode
        })
        setIsActiveValue(response.isActive);
        setIsUpdate(true)
    }
    async function onClearData() {
        setPackage({
            ...package1,
            divisionID: '0',
            userID: '0',
            noOfSessions: '',
            packageCode: '',
            packageName: '',
            referenceNumber: '',
            pinCode: '',
            isActive: true
        });
    }
    async function  savePackageDetails(values) {
        if (isUpdate == true) {
            let updateModel = {
                packageID: parseInt(pkgID),
                createdBy: parseInt(tokenService.getUserIDFromToken()),
                groupID: parseInt(values.groupID),
                factoryID: parseInt(values.factoryID),
                divisionID: parseInt(values.divisionID),
                userID: parseInt(values.userID),
                noOfSessions: parseInt(values.noOfSessions),
                packageCode: values.packageCode,
                packageName: values.packageName,
                referenceNumber: values.referenceNumber,
                pinCode: values.pinCode,
                isActive: IsActiveValue,
            }
            let response = await services.updatePackageDetails(updateModel);
            if (response.statusCode == "Success") {
                alert.success(response.message);
                // setPackageDtails(updateModel);
                navigate('/app/package/listing');
            }
            else {
                alert.error(response.message);
            }
        }
        else {
            let saveModel = {
                packageID: 0,
                groupID: parseInt(values.groupID),
                factoryID: parseInt(values.factoryID),
                divisionID: parseInt(values.divisionID),
                userID: parseInt(values.userID),
                noOfSessions: parseInt(values.noOfSessions),
                packageCode: values.packageCode,
                packageName: values.packageName,
                referenceNumber: values.referenceNumber,
                pinCode: values.pinCode,
                isActive: IsActiveValue,
                createdBy: tokenDecoder.getUserIDFromToken()
            }
            let response = await services.savePackageDetail(saveModel);
            if (response.statusCode == "Success") {
                alert.success(response.message);
                // setPackageDtails(values);
                navigate('/app/package/listing');
            }
            else {
                alert.error(response.message);
            }
        }
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
    return (
        <Page className={classes.root} title={title}>
            <Container maxWidth={false}>
                <LoadingComponent />
                <Formik
                    initialValues={{
                        groupID: package1.groupID,
                        factoryID: package1.factoryID,
                        divisionID: package1.divisionID,
                        userID: package1.userID,
                        noOfSessions: package1.noOfSessions,
                        packageCode: package1.packageCode,
                        packageName: package1.packageName,
                        referenceNumber: package1.referenceNumber,
                        pinCode: package1.pinCode,
                        isActive: package1.isActive
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Legal entity is required').min("1", 'Select a legal entity'),
                            factoryID: Yup.number().required('Garden is required').min("1", 'Select a garden'),
                            divisionID: Yup.number().required('Cost center is required').min("1", 'Select a cost center'),
                            noOfSessions: Yup.number()
                                .required('No Of Sessions is required')
                                .integer('Only whole numbers are allowed')
                                .positive('Only positive numbers are allowed'),
                            userID: Yup.number().required('User is required').min("1", 'Select a user'),
                            packageCode: Yup.string().max(255).required('Package Code is required').matches(/^[0-9\b]+$/, 'Only allow numbers')
                                .min(2, 'Package code must be at least 2 characters').max(2, 'Package Code must be at most 2 characters'),
                            packageName: Yup.string().required('Package Name is required').matches(/^[^-\s].*/, 'Can Not Start With Spaces'),
                            referenceNumber: Yup.string().required('Reference Number is required').matches(/^[^-\s].*/, 'Can Not Start With Spaces'),
                            pinCode: Yup.string().required('Pin Code is required').matches(/^[0-9\b]+$/, 'Only allow numbers')
                                .min(6, 'Pin code must be at least 6 characters').max(6, 'Pin code must be at most 6 characters'),
                        })
                    }
                    onSubmit={(value) => savePackageDetails(value)}
                    enableReinitialize
                >
                    {({
                        errors,
                        handleBlur,
                        handleSubmit,
                        isSubmitting,
                        touched,
                    }) => (
                        <form onSubmit={handleSubmit}>
                            <Box mt={3}>
                                <Card className={classes.cardContent}>
                                    <CardHeader
                                        title={cardTitle(title)}
                                    />
                                    <PerfectScrollbar>
                                        <Divider />
                                        <CardContent >
                                            <Grid container spacing={3}>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="groupID">
                                                        Legal Entity *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.groupID && errors.groupID)}
                                                        fullWidth
                                                        helperText={touched.groupID && errors.groupID}
                                                        size='small'
                                                        name="groupID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChangeForm(e)}
                                                        value={package1.groupID}
                                                        variant="outlined"
                                                        id="groupID"
                                                        InputProps={{
                                                            readOnly: isUpdate || !permissionList.isGroupFilterEnabled ? true : false,
                                                        }}
                                                    >
                                                        <MenuItem value='0'>--Select Legal Entity--</MenuItem>
                                                        {generateDropDownMenu(groups)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="factoryID">
                                                        Garden *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.factoryID && errors.factoryID)}
                                                        fullWidth
                                                        helperText={touched.factoryID && errors.factoryID}
                                                        size='small'
                                                        name="factoryID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChangeForm(e)}
                                                        value={package1.factoryID}
                                                        variant="outlined"
                                                        InputProps={{
                                                            readOnly: isUpdate || !permissionList.isFactoryFilterEnabled ? true : false,
                                                        }}
                                                    >
                                                        <MenuItem value="0">--Select Garden--</MenuItem>
                                                        {generateDropDownMenu(factories)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="divisionID">
                                                        Cost Center *
                                                    </InputLabel>
                                                    <TextField select fullWidth
                                                        error={Boolean(touched.divisionID && errors.divisionID)}
                                                        helperText={touched.divisionID && errors.divisionID}
                                                        size='small'
                                                        onBlur={handleBlur}
                                                        id="divisionID"
                                                        name="divisionID"
                                                        value={package1.divisionID}
                                                        type="text"
                                                        variant="outlined"
                                                        onChange={(e) => handleChangeForm(e)}
                                                        InputProps={{
                                                            readOnly: isUpdate
                                                        }}
                                                    >
                                                        <MenuItem value='0'>--Select Cost Center--</MenuItem>
                                                        {generateDropDownMenu(divisions)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="noOfSessions">
                                                        No Of Sessions *
                                                    </InputLabel>
                                                    <TextField
                                                        error={Boolean(touched.noOfSessions && errors.noOfSessions)}
                                                        fullWidth
                                                        helperText={touched.noOfSessions && errors.noOfSessions}
                                                        size='small'
                                                        name="noOfSessions"
                                                        id="noOfSessions"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChangeForm(e)}
                                                        value={package1.noOfSessions}
                                                        variant="outlined"
                                                        type="number"
                                                    />
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="userID">
                                                        User *
                                                    </InputLabel>
                                                    <TextField select fullWidth
                                                        error={Boolean(touched.userID && errors.userID)}
                                                        helperText={touched.userID && errors.userID}
                                                        size='small'
                                                        onBlur={handleBlur}
                                                        id="userID"
                                                        name="userID"
                                                        value={package1.userID}
                                                        type="text"
                                                        variant="outlined"
                                                        onChange={(e) => handleChangeForm(e)}
                                                    >
                                                        <MenuItem value='0'>--Select User--</MenuItem>
                                                        {generateDropDownMenuWithTwoValues(users)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="packageCode">
                                                        Package Code *
                                                    </InputLabel>
                                                    <TextField
                                                        error={Boolean(touched.packageCode && errors.packageCode)}
                                                        fullWidth
                                                        helperText={touched.packageCode && errors.packageCode}
                                                        size='small'
                                                        name="packageCode"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChangeForm(e)}
                                                        value={package1.packageCode}
                                                        variant="outlined"
                                                    />
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="packageName">
                                                        Package Name *
                                                    </InputLabel>
                                                    <TextField
                                                        error={Boolean(touched.packageName && errors.packageName)}
                                                        fullWidth
                                                        helperText={touched.packageName && errors.packageName}
                                                        size='small'
                                                        name="packageName"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChangeForm(e)}
                                                        value={package1.packageName}
                                                        variant="outlined"
                                                    />
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="referenceNumber">
                                                        Reference Number *
                                                    </InputLabel>
                                                    <TextField
                                                        error={Boolean(touched.referenceNumber && errors.referenceNumber)}
                                                        fullWidth
                                                        helperText={touched.referenceNumber && errors.referenceNumber}
                                                        size='small'
                                                        name="referenceNumber"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChangeForm(e)}
                                                        value={package1.referenceNumber}
                                                        variant="outlined"
                                                    />
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="pinCode">
                                                        Pin Code *
                                                    </InputLabel>
                                                    <TextField
                                                        error={Boolean(touched.pinCode && errors.pinCode)}
                                                        fullWidth
                                                        helperText={touched.pinCode && errors.pinCode}
                                                        size='small'
                                                        name="pinCode"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChangeForm(e)}
                                                        value={package1.pinCode}
                                                        variant="outlined"
                                                    />
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                        <Grid container spacing={0} >
                                            <Grid item md={1} xs={12} style={{ marginLeft: '1rem' }}>
                                                <InputLabel id="isActive">
                                                    Active
                                                </InputLabel>
                                                <Switch
                                                    error={Boolean(touched.isActive && errors.isActive)}
                                                    helperText={touched.isActive && errors.isActive}
                                                    checked={IsActiveValue}
                                                    onBlur={handleBlur}
                                                    onChange={onIsActiveChange}
                                                    name="isActive"
                                                    size="medium"
                                                />
                                            </Grid>
                                        </Grid>
                                        <Divider />
                                        <Box display="flex" justifyContent="flex-end" p={2}>
                                            <Button
                                                color="primary"
                                                type="clear"
                                                variant="outlined"
                                                onClick={onClearData}
                                            >
                                                Clear
                                            </Button>
                                            &nbsp;
                                            <Button
                                                color="primary"
                                                type="submit"
                                                variant="contained"
                                                disabled={isSubmitting}
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
    )
}