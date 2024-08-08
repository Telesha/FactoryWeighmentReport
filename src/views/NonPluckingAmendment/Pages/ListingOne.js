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
    InputLabel, Table, TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,

} from '@material-ui/core';
import CreateIcon from '@material-ui/icons/Create';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import { Formik } from 'formik';
import * as Yup from "yup";
import { LoadingComponent } from '../../../utils/newLoader';
import { useAlert } from "react-alert";
import _ from 'lodash';
import TablePagination from '@material-ui/core/TablePagination';
import { AddEditTable } from './AddEditTable';
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
    },
    btnApprove: {
        backgroundColor: "green",
    }

}));

const screenCode = 'NONPLUCKINGAMENDMENT';

export default function NonPluckingAmendment(props) {
    const alert = useAlert();
    const [title, setTitle] = useState("Non Plucking Amendment")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [gardens, setGardens] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [editDataSet, setEditDataSet] = useState();
    const [date, setDate] = useState(new Date());
    const [costCenters, setCostCenters] = useState();
    const handleLimitChange = (event) => {
        setLimit(event.target.value);
    };
    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(5);
    const [dialogbox, setDialogbox] = useState(false);
    const [fields, setFields] = useState([]);
    const [payPoints, setPayPoints] = useState([]);
    const [workLocation, setWorkLocation] = useState([]);
    const [taskCount, setTaskCount] = useState([]);
    const [products, setProducts] = useState([]);
    const [ArrayField, setArrayField] = useState([]);
    const [employeeSubCategoryMapping, setEmployeeSubCategoryMapping] = useState();
    const [nonPluckingAmendmentData, setNonPluckingAmendmentData] = useState();
    const [nonPluckingAmendmentList, setNonPluckingAmendmentList] = useState({
        groupID: '0',
        gardenID: '0',
        costCenterID: '0',
        payPointID: '0',
        employeeSubCategoryMappingID: '0',
        employeeSubCategoryName: '',
        todayDate: new Date().toISOString().substr(0, 10),
        registrationNumber: '',
        employeeID: '',
        employeeCode: '',
        employeeName: '',
        employeeTypeID: '',
        employeeTypeName: '',
        gangID: '',
        gangName: '',
        employeeCategoryID: '',
        employeeCategoryName: '',
        bookNumber: '',
        genderID: '',
        jobTypeID: '0',
        productID: '0',
        workLocationID: '0',
        payPointName: '',
        workLocationName: '',
        divisionName: ''
    })

    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });

    const navigate = useNavigate();
    const registrationNumberRef = useRef(null);
    const addButtonRef = useRef(null);
    const selectAllText = () => {
        if (registrationNumberRef.current) {
            registrationNumberRef.current.select();
        }
    };
    const [initialState, setInitialState] = useState(false);

    useEffect(() => {
        trackPromise(
            getPermission(),
            GetAllEmployeeSubCategoryMapping());
    }, []);

    useEffect(()=>{
        if(!initialState){
            trackPromise(getPermission());
        }
    },[])

    useEffect(() => {
        registrationNumberRef.current.focus();
    }, []);

    useEffect(() => {
        registrationNumberRef.current.focus();
    }, [nonPluckingAmendmentList]);

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID(),
            GetDivisionDetailsByGroupID());
    }, [nonPluckingAmendmentList.groupID]);

    useEffect(() => {
        trackPromise(getCostCenterDetailsByGardenID(),
            GetMappedProductsByIDs())
    }, [nonPluckingAmendmentList.gardenID]);

    useEffect(() => {
        trackPromise(getFieldDetailsByDivisionID());
    }, [nonPluckingAmendmentList.costCenterID]);

    useEffect(() => {
        setArrayField([])
        setNonPluckingAmendmentData(null)
    }, [nonPluckingAmendmentList.groupID]);

    useEffect(() => {
        setArrayField([])
        setNonPluckingAmendmentData(null)
    }, [nonPluckingAmendmentList.gardenID]);

    useEffect(() => {
        setArrayField([])
        setNonPluckingAmendmentData(null)
    }, [nonPluckingAmendmentList.costCenterID]);

    useEffect(() => {
        setArrayField([])
        setNonPluckingAmendmentData(null)
    }, [nonPluckingAmendmentList.workLocationID]);

    useEffect(() => {
        setArrayField([])
        setNonPluckingAmendmentData(null)
    }, [nonPluckingAmendmentList.payPointID]);

    useEffect(() => {
        setArrayField([])
        setNonPluckingAmendmentData(null)
    }, [nonPluckingAmendmentList.employeeSubCategoryMappingID]);

    useEffect(() => {
        setArrayField([])
        setNonPluckingAmendmentData(null)
    }, [nonPluckingAmendmentList.productID]);

    useEffect(() => {
        setArrayField([])
        setNonPluckingAmendmentData(null)
    }, [date]);

    useEffect(() => {
        setArrayField([])
        setNonPluckingAmendmentData(null)
    }, [nonPluckingAmendmentList.todayDate]);

    useEffect(() => {
        setArrayField([])
        setNonPluckingAmendmentData(null)
    }, [nonPluckingAmendmentList.registrationNumber]);

    useEffect(() => {
        if (initialState) {
            setNonPluckingAmendmentList((prevState) => ({
                ...prevState,
                gardenID: 0,
                payPointID: 0,
                workLocationID: 0

            }));
        }
    }, [nonPluckingAmendmentList.groupID, initialState]);


    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWNONPLUCKINGAMENDMENT');

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

        setNonPluckingAmendmentList({
            ...nonPluckingAmendmentList,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            gardenID: parseInt(tokenService.getFactoryIDFromToken())
        })
        trackPromise(getGroupsForDropdown())
        setInitialState(true);
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(nonPluckingAmendmentList.groupID);
        setGardens(response);
    };

    async function getCostCenterDetailsByGardenID() {
        var response = await services.getDivisionDetailsByEstateID(nonPluckingAmendmentList.gardenID);
        var generated = generateDropDownMenu(response)
        if (generated.length > 0) {
            setNonPluckingAmendmentList((nonPluckingAmendmentList) => ({
                ...nonPluckingAmendmentList,
                costCenterID: generated[0].props.value,
            }));
        }
        setCostCenters(response);
    };

    async function getFieldDetailsByDivisionID() {
        var response = await services.getFieldDetailsByDivisionID(nonPluckingAmendmentList.costCenterID);
        var newOptionArray = fields;
        for (var i = 0; i < response.length; i++) {
            newOptionArray.push({ label: response[i].fieldName, value: response[i].fieldID })
        }
        setFields(newOptionArray);
    };

    async function GetAllEmployeeSubCategoryMapping() {
        const result = await services.GetAllEmployeeSubCategoryMapping();
        setEmployeeSubCategoryMapping(result)
    }

    async function GetDivisionDetailsByGroupID() {
        const result = await services.GetDivisionDetailsByGroupID(nonPluckingAmendmentList.groupID);
        setPayPoints(result);
        setWorkLocation(result)
    }

    async function GetMappedProductsByIDs() {
        var response = await services.GetMappedProductsByFactoryID(nonPluckingAmendmentList.gardenID);
        setProducts(response);
    };

    async function getNonPluckingAmendmentDetails() {
        let model = {
            gardenID: parseInt(nonPluckingAmendmentList.gardenID),
            registrationNumber: nonPluckingAmendmentList.registrationNumber,
            employeeSubCategoryMappingID: parseInt(nonPluckingAmendmentList.employeeSubCategoryMappingID),
            todayDate: moment(date.toString()).format().split('T')[0]
        }
        var response = await services.GetEmployeeDetailsAndNonPluckingAttendance(model)
        if (response.statusCode == "Success") {
            const newResult = response.data
            if (newResult.isActive == true) {
                const newResultOne = newResult.details
                setNonPluckingAmendmentData(newResult)
                setNonPluckingAmendmentList((prevState) => ({
                    ...prevState,
                    employeeID: newResult.employeeID,
                    employeeTypeID: newResult.employeeTypeID,
                    employeeTypeName: newResult.employeeTypeName,
                    gangName: newResult.gangName,
                    gangID: newResult.gangID,
                    employeeName: newResult.firstName,
                    employeeCategoryID: parseInt(newResult.employeeCategoryID),
                    employeeCategoryName: newResult.employeeCategoryName,
                    employeeSubCategoryName: newResult.employeeSubCategoryName,
                    bookNumber: newResult.bookNumber,
                    payPointName: newResult.payPointName,
                    workLocationName: newResult.workLocationName,
                    divisionName: newResult.divisionName,
                    genderID: newResult.genderID
                }));
                if (newResultOne.length != 0) {
                    const found = newResultOne.filter(x => x.isSuspend == false)
                    newResultOne.sort((a, b) => (a.isSuspend > b.isSuspend) ? 1 : -1)
                    setTaskCount(found)
                    setArrayField(newResultOne)
                }
                else {
                    alert.error("No Non Plucking Attendance Available");
                    setTaskCount([])
                    setArrayField([])
                }
            }
            else {
                alert.error("Inactive Employee");
                setNonPluckingAmendmentData(null)
                setArrayField([])
                setTaskCount([])
                setNonPluckingAmendmentList((prevState) => ({
                    ...prevState,
                    employeeID: '',
                    employeeTypeID: '',
                    employeeTypeName: '',
                    gangID: '',
                    gangName: '',
                    employeeName: '',
                    employeeCategoryID: '',
                    employeeCategoryName: '',
                    bookNumber: '',
                    genderID: ''
                }));
            }
        }
        else {
            alert.error(response.message);
            setNonPluckingAmendmentData(null)
            setArrayField([])
            setTaskCount([])
            setNonPluckingAmendmentList((prevState) => ({
                ...prevState,
                employeeID: '',
                employeeTypeID: '',
                employeeTypeName: '',
                gangID: '',
                gangName: '',
                employeeName: '',
                employeeCategoryID: '',
                employeeCategoryName: '',
                bookNumber: '',
                genderID: ''
            }));
        }
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
        setNonPluckingAmendmentList({
            ...nonPluckingAmendmentList,
            [e.target.name]: value
        });
    }

    const handleKeyDown = (event, nextInputRef) => {
        if (nextInputRef && nextInputRef.current && typeof nextInputRef.current.focus === 'function') {
            if (event.key === 'Enter') {
                event.preventDefault();
                nextInputRef.current.focus();
            }
        }
    }

    function openDialogbox() {
        setDialogbox(true)
        setIsEdit(false)
    }

    function closeDialogbox() {
        setDialogbox(false)
        setIsEdit(false)
    }

    function clearFormFields() {
        setNonPluckingAmendmentList((prevState) => ({
            ...prevState,
            registrationNumber: ''
        }));
        setArrayField([])
        setNonPluckingAmendmentData(null)
    }

    function Edit(rowData) {
        setIsEdit(true)
        setDialogbox(true)
        setEditDataSet(rowData)
    }

    return (
        <>
            <Page className={classes.root} title={title}>
                {/* <LoadingComponent /> */}
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: nonPluckingAmendmentList.groupID,
                            gardenID: nonPluckingAmendmentList.gardenID,
                            costCenterID: nonPluckingAmendmentList.costCenterID,
                            payPointID: nonPluckingAmendmentList.payPointID,
                            workLocationID: nonPluckingAmendmentList.workLocationID,
                            productID: nonPluckingAmendmentList.productID,
                            //employeeSubCategoryMappingID: nonPluckingAmendmentList.employeeSubCategoryMappingID,
                            //todayDate: nonPluckingAmendmentList.todayDate,
                            registrationNumber: nonPluckingAmendmentList.registrationNumber,
                            //jobTypeID: nonPluckingAmendmentList.jobTypeID
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Business Division is required').min("1", 'Business Division is required'),
                                gardenID: Yup.number().required('Location  is required').min("1", 'Location  is required'),
                                costCenterID: Yup.number().required('Cost Center is required').min("1", 'Cost Center is required'),
                                payPointID: Yup.number().required('Pay Point is required').min("1", 'Pay Point is required'),
                                workLocationID: Yup.number().required('Work Location is required').min("1", 'Work Location is required'),
                                productID: Yup.number().required('Product is required').min("1", 'Product is required'),
                                //employeeSubCategoryMappingID: Yup.number().required('Employee SubCategory is required').min("1", 'Employee SubCategory is required'),
                                //todayDate: Yup.date().required('Date is required'),
                                registrationNumber: Yup.string().required('Registration Number is required'),
                                //jobTypeID: Yup.number().required('Job Type is required').min("1", 'Job Type is required'),
                            })
                        }
                        validateOnChange={false}
                        validateOnBlur={false}
                        onSubmit={() => trackPromise(getNonPluckingAmendmentDetails())}
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
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="groupID">
                                                            Business Division  *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.groupID && errors.groupID)}
                                                            fullWidth
                                                            helperText={touched.groupID && errors.groupID}
                                                            name="groupID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={nonPluckingAmendmentList.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            size='small'
                                                            InputProps={{
                                                                readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                            }}
                                                        >
                                                            <MenuItem value="0">--All Business Divisions--</MenuItem>
                                                            {generateDropDownMenu(groups)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="gardenID">
                                                            Location *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.gardenID && errors.gardenID)}
                                                            fullWidth
                                                            helperText={touched.gardenID && errors.gardenID}
                                                            name="gardenID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={nonPluckingAmendmentList.gardenID}
                                                            variant="outlined"
                                                            id="gardenID"
                                                            size='small'
                                                            InputProps={{
                                                                readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                            }}
                                                        >
                                                            <MenuItem value="0">--All Locations--</MenuItem>
                                                            {generateDropDownMenu(gardens)}
                                                        </TextField>
                                                    </Grid>
                                                    {/* <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="costCenterID">
                                                            Sub Division *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.costCenterID && errors.costCenterID)}
                                                            fullWidth
                                                            helperText={touched.costCenterID && errors.costCenterID}
                                                            name="costCenterID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={nonPluckingAmendmentList.costCenterID}
                                                            variant="outlined"
                                                            id="costCenterID"
                                                            size='small'
                                                        >
                                                            <MenuItem value="0">--Select Sub Division--</MenuItem>
                                                            {generateDropDownMenu(costCenters)}
                                                        </TextField>
                                                    </Grid> */}
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="workLocationID">
                                                            Work Location *
                                                        </InputLabel>
                                                        <TextField select fullWidth
                                                            error={Boolean(touched.workLocationID && errors.workLocationID)}
                                                            helperText={touched.workLocationID && errors.workLocationID}
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            id="workLocationID"
                                                            name="workLocationID"
                                                            value={nonPluckingAmendmentList.workLocationID}
                                                            type="text"
                                                            variant="outlined"
                                                            onChange={(e) => handleChange(e)}
                                                        >
                                                            <MenuItem value="0">--All Work Locations--</MenuItem>
                                                            {generateDropDownMenu(workLocation)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="payPointID">
                                                            Pay Point *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.payPointID && errors.payPointID)}
                                                            fullWidth
                                                            helperText={touched.payPointID && errors.payPointID}
                                                            name="payPointID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={nonPluckingAmendmentList.payPointID}
                                                            variant="outlined"
                                                            id="payPointID"
                                                            size='small'
                                                        >
                                                            <MenuItem value="0">--All Pay Points--</MenuItem>
                                                            {generateDropDownMenu(payPoints)}
                                                        </TextField>
                                                    </Grid>
                                                </Grid>
                                                <Grid container spacing={3}>
                                                    {/*<Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="employeeSubCategoryMappingID">
                                                            Employee Sub Category *
                                                        </InputLabel>
                                                        <TextField select fullWidth
                                                            error={Boolean(touched.employeeSubCategoryMappingID && errors.employeeSubCategoryMappingID)}
                                                            helperText={touched.employeeSubCategoryMappingID && errors.employeeSubCategoryMappingID}
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            id="employeeSubCategoryMappingID"
                                                            name="employeeSubCategoryMappingID"
                                                            value={nonPluckingAmendmentList.employeeSubCategoryMappingID}
                                                            type="text"
                                                            variant="outlined"
                                                            onChange={(e) => handleChange(e)}
                                                        >
                                                            <MenuItem value="0">--All Employee Sub Categories--</MenuItem>
                                                            {generateDropDownMenu(employeeSubCategoryMapping)}
                                                        </TextField>
                                                    </Grid>*/}
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="productID">
                                                            Product *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.productID && errors.productID)}
                                                            fullWidth
                                                            helperText={touched.productID && errors.productID}
                                                            name="productID"
                                                            size='small'
                                                            onChange={(e) => handleChange(e)}
                                                            value={nonPluckingAmendmentList.productID}
                                                            variant="outlined"
                                                            id="productID"
                                                            onBlur={handleBlur}
                                                        >
                                                            <MenuItem value={0}>--All Products--</MenuItem>
                                                            {generateDropDownMenu(products)}
                                                        </TextField>
                                                    </Grid>
                                                    {/* <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="jobTypeID">
                                                            Job Type *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.jobTypeID && errors.jobTypeID)}
                                                            fullWidth
                                                            helperText={touched.jobTypeID && errors.jobTypeID}
                                                            name="jobTypeID"
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            onChange={handleChange}
                                                            value={nonPluckingAmendmentList.jobTypeID}
                                                            variant="outlined"
                                                        >
                                                            <MenuItem value={0}>--Select Job Type--</MenuItem>
                                                            <MenuItem value={1}>General</MenuItem>
                                                            <MenuItem value={2}>Cash</MenuItem>
                                                        </TextField>
                                                    </Grid> */}
                                                    {/* <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="todayDate">
                                                            Date *
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.todayDate && errors.todayDate)}
                                                            fullWidth
                                                            helperText={touched.todayDate && errors.todayDate}
                                                            size='small'
                                                            name="todayDate"
                                                            type='date'
                                                            onChange={(e) => handleChange(e)}
                                                            value={nonPluckingAmendmentList.todayDate}
                                                            variant="outlined"
                                                            id="todayDate"
                                                        >
                                                        </TextField>
                                                    </Grid> */}
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="date">Date *</InputLabel>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <KeyboardDatePicker
                                                                fullWidth
                                                                variant="inline"
                                                                format="yyyy-MM-dd"
                                                                margin="dense"
                                                                name='todayDate'
                                                                id='todayDate'
                                                                size='small'
                                                                value={date}
                                                                onChange={(e) => {
                                                                    setDate(e)
                                                                }}
                                                                KeyboardButtonProps={{
                                                                    'aria-label': 'change date',
                                                                }}
                                                                autoOk
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>
                                                    <Grid item md={3} xs={12} >
                                                        <InputLabel shrink id="registrationNumber">
                                                            Reg No. *
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.registrationNumber && errors.registrationNumber)}
                                                            fullWidth
                                                            helperText={touched.registrationNumber && errors.registrationNumber}
                                                            size='small'
                                                            name="registrationNumber"
                                                            onChange={(e) => handleChange(e)}
                                                            value={nonPluckingAmendmentList.registrationNumber}
                                                            variant="outlined"
                                                            id="registrationNumber"
                                                            inputRef={registrationNumberRef}
                                                            onKeyDown={(e) => handleKeyDown(e, addButtonRef)}
                                                        >
                                                        </TextField>
                                                    </Grid>
                                                    {nonPluckingAmendmentData != null ?
                                                        <Grid item md={3} xs={12}>
                                                            <InputLabel shrink id="employeeName">
                                                                Emp.Name *
                                                            </InputLabel>
                                                            <TextField
                                                                fullWidth
                                                                size='small'
                                                                name="employeeName"
                                                                onChange={(e) => handleChange(e)}
                                                                value={nonPluckingAmendmentList.employeeName}
                                                                variant="outlined"
                                                                id="employeeName"
                                                                disabled={true}
                                                            >
                                                            </TextField>
                                                        </Grid> : null}
                                                    <Grid container justify="flex-end">
                                                        <Box pr={2}>
                                                            <Button
                                                                color="primary"
                                                                variant="outlined"
                                                                type="button"
                                                                onClick={() => clearFormFields()}
                                                            >
                                                                Clear
                                                            </Button>
                                                            &nbsp;
                                                            &nbsp;
                                                            <Button
                                                                color="primary"
                                                                variant="contained"
                                                                type="submit"
                                                            >
                                                                Search
                                                            </Button>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                                {nonPluckingAmendmentData != null ?
                                                    <>
                                                        <Grid container spacing={3}>
                                                            <Grid item md={3} xs={12}>
                                                                <InputLabel shrink id="employeeSubCategoryName">
                                                                    Employee Sub Category *
                                                                </InputLabel>
                                                                <TextField
                                                                    fullWidth
                                                                    size='small'
                                                                    name="employeeSubCategoryName"
                                                                    onChange={(e) => handleChange(e)}
                                                                    value={nonPluckingAmendmentList.employeeSubCategoryName}
                                                                    variant="outlined"
                                                                    id="employeeSubCategoryName"
                                                                    disabled={true}
                                                                >
                                                                </TextField>
                                                            </Grid>
                                                            {/* <Grid item md={3} xs={12}>
                                                            <InputLabel shrink id="employeeTypeName">
                                                                Emp.Type *
                                                            </InputLabel>
                                                            <TextField
                                                                fullWidth
                                                                size='small'
                                                                name="employeeTypeName"
                                                                onChange={(e) => handleChange(e)}
                                                                value={nonPluckingAmendmentList.employeeTypeName}
                                                                variant="outlined"
                                                                id="employeeTypeName"
                                                                disabled={true}
                                                            >
                                                            </TextField>
                                                        </Grid>
                                                        <Grid item md={3} xs={12}>
                                                            <InputLabel shrink id="gangName">
                                                                Duffa *
                                                            </InputLabel>
                                                            <TextField
                                                                fullWidth
                                                                size='small'
                                                                name="gangName"
                                                                onChange={(e) => handleChange(e)}
                                                                value={nonPluckingAmendmentList.gangName}
                                                                variant="outlined"
                                                                id="gangName"
                                                                disabled={true}
                                                            >
                                                            </TextField>
                                                        </Grid> */}
                                                            <Grid item md={3} xs={12}>
                                                                <InputLabel shrink id="divisionName">
                                                                    Sub Division *
                                                                </InputLabel>
                                                                <TextField
                                                                    fullWidth
                                                                    size='small'
                                                                    name="divisionName"
                                                                    onChange={(e) => handleChange(e)}
                                                                    value={nonPluckingAmendmentList.divisionName}
                                                                    variant="outlined"
                                                                    id="divisionName"
                                                                    disabled={true}
                                                                >
                                                                </TextField>
                                                            </Grid>
                                                            <Grid item md={3} xs={12}>
                                                                <InputLabel shrink id="workLocationName">
                                                                    Work Location *
                                                                </InputLabel>
                                                                <TextField
                                                                    fullWidth
                                                                    size='small'
                                                                    name="workLocationName"
                                                                    onChange={(e) => handleChange(e)}
                                                                    value={nonPluckingAmendmentList.workLocationName}
                                                                    variant="outlined"
                                                                    id="workLocationName"
                                                                    disabled={true}
                                                                >
                                                                </TextField>
                                                            </Grid>
                                                            <Grid item md={3} xs={12}>
                                                                <InputLabel shrink id="payPointName">
                                                                    Pay Point *
                                                                </InputLabel>
                                                                <TextField
                                                                    fullWidth
                                                                    size='small'
                                                                    name="payPointName"
                                                                    onChange={(e) => handleChange(e)}
                                                                    value={nonPluckingAmendmentList.payPointName}
                                                                    variant="outlined"
                                                                    id="payPointName"
                                                                    disabled={true}
                                                                >
                                                                </TextField>
                                                            </Grid>
                                                        </Grid> </> : null}
                                                {nonPluckingAmendmentData != null
                                                    && (nonPluckingAmendmentList.employeeCategoryID == 3 ? taskCount.length < 1 : taskCount.length < 2) ?
                                                    <Box display="flex" justifyContent="flex-end" p={2}>
                                                        <Button
                                                            color="primary"
                                                            type="button"
                                                            variant="contained"
                                                            onClick={() => {
                                                                openDialogbox();
                                                                selectAllText();
                                                            }}
                                                            ref={addButtonRef}
                                                        >
                                                            Add
                                                        </Button>
                                                    </Box> : null}
                                                <br />
                                                <Grid container spacing={2}>
                                                    {ArrayField.length != 0 ?
                                                        <Grid item xs={12}>
                                                            <TableContainer >
                                                                <Table className={classes.table} aria-label="caption table">
                                                                    <TableHead>
                                                                        <TableRow>
                                                                            <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Emp.ID</TableCell>
                                                                            <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Emp.Name</TableCell>
                                                                            {/* <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Emp.Type</TableCell> */}
                                                                            <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>W/L</TableCell>
                                                                            <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>P/P</TableCell>
                                                                            <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>W/Type</TableCell>
                                                                            {/* <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Duffa</TableCell>
                                                                            <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Sirder</TableCell> */}
                                                                            <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Field</TableCell>
                                                                            <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Kamjari Code</TableCell>
                                                                            {/* <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Kamjari</TableCell> */}
                                                                            {/* <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>In Time</TableCell> */}
                                                                            {/* <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Out Time</TableCell> */}
                                                                            <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Target</TableCell>
                                                                            <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Actual</TableCell>
                                                                            <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Basic Rate</TableCell>
                                                                            <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Amount</TableCell>
                                                                            <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Allowance</TableCell>
                                                                            {/* <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Ex.Pay</TableCell> */}
                                                                            <TableCell align='right' style={{ fontWeight: "bold", border: "1px solid black" }}>Addition</TableCell>
                                                                            <TableCell align='right' style={{ fontWeight: "bold", border: "1px solid black" }}>Deduction</TableCell>
                                                                            {/* <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Night Job</TableCell> */}
                                                                            <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Suspended</TableCell>
                                                                            <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Action</TableCell>
                                                                        </TableRow>
                                                                    </TableHead>
                                                                    <TableBody>
                                                                        {ArrayField.slice(page * limit, page * limit + limit).map((rowData, index) => (
                                                                            <TableRow key={index}>
                                                                                <TableCell align="left" style={{ border: "1px solid black" }} component="th" scope="row">
                                                                                    {(rowData.registrationNumber)}
                                                                                </TableCell>
                                                                                <TableCell align="left" style={{ border: "1px solid black" }} component="th" scope="row">
                                                                                    {(rowData.firstName)}
                                                                                </TableCell>
                                                                                <TableCell align="left" style={{ border: "1px solid black" }} component="th" scope="row">
                                                                                    {(rowData.workLocationName)}
                                                                                </TableCell>
                                                                                <TableCell align="left" style={{ border: "1px solid black" }} component="th" scope="row">
                                                                                    {(rowData.payPointName)}
                                                                                </TableCell>
                                                                                {/* <TableCell align="left" style={{ border: "1px solid black" }} component="th" scope="row">
                                                                                    {(rowData.employeeTypeName)}
                                                                                </TableCell> */}
                                                                                <TableCell align="left" style={{ border: "1px solid black" }} component="th" scope="row">
                                                                                    {(rowData.jobTypeID == 1 ? 'General' : rowData.jobTypeID == 2 ? 'Cash' : '')}
                                                                                </TableCell>
                                                                                {/* <TableCell align="left" style={{ border: "1px solid black" }} component="th" scope="row">
                                                                                    {(rowData.duffa)}
                                                                                </TableCell>
                                                                                <TableCell align="left" style={{ border: "1px solid black" }} component="th" scope="row">
                                                                                    {(rowData.employeeName == null ? '-' : rowData.employeeName)}
                                                                                </TableCell> */}
                                                                                <TableCell align="left" style={{ border: "1px solid black" }} component="th" scope="row">
                                                                                    {(rowData.section == null ? '-' : rowData.section)}
                                                                                </TableCell>
                                                                                <TableCell align="left" style={{ border: "1px solid black" }} component="th" scope="row">
                                                                                    {(rowData.taskCode)}
                                                                                </TableCell>
                                                                                {/* <TableCell align="left" style={{ border: "1px solid black" }} component="th" scope="row">
                                                                                    {(rowData.kamjari)}
                                                                                </TableCell> */}
                                                                                {/* <TableCell align="left" style={{ border: "1px solid black" }} component="th" scope="row">
                                                                                    {moment(rowData.inTime).format('YYYY-MM-DD  HH:mm:ss A')}
                                                                                </TableCell>
                                                                                <TableCell align="left" style={{ border: "1px solid black" }} component="th" scope="row" >
                                                                                    {moment(rowData.outTime).format('YYYY-MM-DD HH:mm:ss A')}
                                                                                </TableCell> */}
                                                                                <TableCell align="right" style={{ border: "1px solid black" }} component="th" scope="row">
                                                                                    {(rowData.assignQuntity)}
                                                                                </TableCell>
                                                                                <TableCell align="right" style={{ border: "1px solid black" }} component="th" scope="row">
                                                                                    {((rowData.quntity).toFixed(2))}
                                                                                </TableCell>
                                                                                <TableCell align="right" style={{ border: "1px solid black" }} component="th" scope="row">
                                                                                    {(rowData.rate)}
                                                                                </TableCell>
                                                                                <TableCell align="right" style={{ border: "1px solid black" }} component="th" scope="row">
                                                                                    {((rowData.amount).toFixed(0))}
                                                                                </TableCell>
                                                                                <TableCell align="right" style={{ border: "1px solid black" }} component="th" scope="row" >
                                                                                    {(rowData.allowance)}
                                                                                </TableCell>
                                                                                {/* <TableCell align="right" style={{ border: "1px solid black" }} component="th" scope="row" >
                                                                                    {((rowData.gardenAllowance).toFixed(0))}
                                                                                </TableCell> */}
                                                                                <TableCell align='right' component="th" scope="row" style={{ border: "1px solid black" }}>
                                                                                    {(rowData.addition)}
                                                                                </TableCell>
                                                                                <TableCell align='right' component="th" scope="row" style={{ border: "1px solid black" }}>
                                                                                    {(rowData.deduction)}
                                                                                </TableCell>
                                                                                {/* <TableCell align='center' component="th" scope="row" style={{ border: "1px solid black" }}>
                                                                                    {(rowData.isNightJob == true ? 'Yes' : 'No')}
                                                                                </TableCell> */}
                                                                                <TableCell align='center' component="th" scope="row" style={{ border: "1px solid black" }}>
                                                                                    {(rowData.isSuspend == true ? 'Yes' : 'No')}
                                                                                </TableCell>
                                                                                <TableCell align="center" style={{ border: "1px solid black", }} scope="row">
                                                                                    {rowData.isSuspend == false ?
                                                                                        <CreateIcon
                                                                                            style={{
                                                                                                cursor: "pointer"
                                                                                            }}
                                                                                            size="small"
                                                                                            type="submit"
                                                                                            onClick={() => (Edit(rowData))}
                                                                                        /> : null}
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                    </TableBody>
                                                                </Table>
                                                            </TableContainer>
                                                            <TablePagination
                                                                component="div"
                                                                count={ArrayField.length}
                                                                onChangePage={handlePageChange}
                                                                onChangeRowsPerPage={handleLimitChange}
                                                                page={page}
                                                                rowsPerPage={limit}
                                                                rowsPerPageOptions={[5, 10, 25]}
                                                            />
                                                        </Grid> : null}
                                                </Grid>
                                            </CardContent>
                                        </PerfectScrollbar>
                                    </Card>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </Container>
            </Page >
            {dialogbox ?
                <AddEditTable
                    dialogbox={dialogbox}
                    setDialogbox={setDialogbox}
                    isEdit={isEdit}
                    setIsEdit={setIsEdit}
                    editDataSet={editDataSet}
                    closeDialogbox={closeDialogbox}
                    nonPluckingAmendmentList={nonPluckingAmendmentList}
                    getNonPluckingAmendmentDetails={getNonPluckingAmendmentDetails}
                    date={date}
                />
                : null
            }
        </>
    )
}