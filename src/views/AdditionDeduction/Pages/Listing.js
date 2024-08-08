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
    InputLabel,
    Select,
    Tooltip
} from '@material-ui/core';
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
import { CustomMultiSelect } from 'src/utils/CustomMultiSelect';
import moment from 'moment';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from '@material-ui/pickers';
import tokenDecoder from '../../../utils/tokenDecoder';
import MaterialTable from 'material-table';

import _ from 'lodash';


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

const screenCode = 'ADDITIONDEDUCTION';

export default function AdditionDeduction(props) {

    const [title, setTitle] = useState("Addition Deduction")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [gardens, setGardens] = useState([]);
    const [costCenters, setCostCenters] = useState();
    const [applicableDate, handleDateChange] = useState(new Date());
    const [gangs, setGangs] = useState([]);
    const [empTypes, setEmpTypes] = useState([]);
    const [empType, setEmpType] = useState([]);
    const [fields, setFields] = useState([]);
    const [operator, setOperator] = useState([]);
    const [sirders, setSirder] = useState([]);
    const [dataNP, setDataNP] = useState([]);
    const [dataP, setDataP] = useState([]);
    const [isTableHideNP, setIsTableHideNP] = useState(true);
    const [isTableHideP, setIsTableHideP] = useState(true);
    const [additionDeductionData, setAdditionDeductionData] = useState([]);
    const [additionDeductionList, setAdditionDeductionList] = useState({
        groupID: '0',
        gardenID: '0',
        costCenterID: '0',
        applicableDate: new Date().toISOString().substr(0, 10),
        registrationNumber: ''
    })

    const [dropdownAdditionDeduction, setDropdownAdditionDeduction] = useState({
        1: 'Addition',
        2: 'Deduction'
    });


    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });

    const navigate = useNavigate();
    const alert = useAlert();
    const [deletedValues, setDeletedValues] = useState({
        deleted: []
    });
    const [EditedValues, setEditedValues] = useState({
        edited: []
    })
    const [btnEnable, setBtnEnable] = useState(false);

    const valueChecker = /^[+]?\d+([.]\d+)?$/;
    const fruitsList = ["lime", "mango", "coconut", "grapefruit"];
    const [stateNP, setStateNP] = useState({
        columns: [
            {
                title: 'Emp.ID', field: 'registrationNumber', editable: 'never'
            },
            {
                title: 'Emp.Name', field: 'employeeName', editable: 'never'
            },
            {
                title: 'Emp.Type', field: 'employeeTypeName', editable: 'never'
            },
            {
                title: 'Cost Center', field: 'costCenter', editable: 'never'
            },

            {
                title: 'Task Code', field: 'taskCode', editable: 'never'
            },
            {
                title: 'Task Name', field: 'taskName', editable: 'never'
            },
            {
                title: 'Rate', field: 'rate', editable: 'never'
            },
            {
                title: 'BCS Allowance', field: 'allowance', editable: 'never'
            },
            {
                title: 'G.Allowance', field: 'gardenAllowance', editable: 'never'
            },
            {
                title: 'Assigned Qty', field: 'assignQuntity', editable: 'never'
            },
            {
                title: 'Completed Qty', field: 'quntity', editable: 'never'
            },
            {
                title: 'Total Amount', field: 'amount', editable: 'never'
            },
            {
                title: 'Addition', field: 'addition', type: 'numeric', validate: rowData => (valueChecker.test(rowData.addition) ? true : 'Only positive numbers')
            },
            {
                title: 'Deduction', field: 'deduction', type: 'numeric', validate: rowData => (valueChecker.test(rowData.deduction) ? true : 'Only positive numbers')
            },
            {
                title: 'Reason', field: 'reason'
            },

        ],
        data: [],
    });

    const [stateP, setStateP] = useState({
        columns: [
            {
                title: 'Emp.ID', field: 'registrationNumber', editable: 'never'
            },
            {
                title: 'Emp.Name', field: 'employeeName', editable: 'never'
            },
            {
                title: 'Emp.Type', field: 'employeeTypeName', editable: 'never'
            },
            {
                title: 'Cost Center', field: 'costCenter', editable: 'never'
            },

            {
                title: 'Task Code', field: 'taskCode', editable: 'never'
            },
            {
                title: 'Task Name', field: 'taskName', editable: 'never'
            },
            {
                title: 'Rate', field: 'rate', editable: 'never'
            },
            {
                title: 'Assigned Qty', field: 'quntity', editable: 'never'
            },
            {
                title: 'Completed Qty', field: 'quntity', editable: 'never'
            },
            {
                title: 'Total Amount', field: 'quntity', editable: 'never'
            },
            {
                title: 'Addition', field: 'addition', type: 'numeric', validate: rowData => (valueChecker.test(rowData.addition) ? true : 'Only positive numbers')
            },
            {
                title: 'Deduction', field: 'deduction', type: 'numeric', validate: rowData => (valueChecker.test(rowData.deduction) ? true : 'Only positive numbers')
            },
            {
                title: 'Reason', field: 'reason'
            },

        ],
        data: [],
    });

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission(), getSirdersForDropdown());
    }, []);

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID());
    }, [additionDeductionList.groupID]);

    useEffect(() => {
        setAdditionDeductionList((prevState) => ({
            ...prevState,
            costCenterID: "0"
        }));
    }, [additionDeductionList.groupID]);

    useEffect(() => {
        setAdditionDeductionData([])
    }, [additionDeductionList.gardenID]);

    useEffect(() => {
        trackPromise(getCostCenterDetailsByGardenID())
    }, [additionDeductionList.gardenID]);

    useEffect(() => {
        setAdditionDeductionData([])
    }, [additionDeductionList.costCenterID]);

    useEffect(() => {
        trackPromise(getFieldDetailsByDivisionID());
    }, [additionDeductionList.costCenterID]);

    useEffect(() => {
        if (additionDeductionList.costCenterID != 0) {
            getGangDetailsByDivisionID();
        }
    }, [additionDeductionList.costCenterID]);

    useEffect(() => {
        setStateNP({
            ...stateNP,
            data: []
        });
        setStateP({
            ...stateP,
            data: []
        });
    }, [additionDeductionList.applicableDate]);


    useEffect(() => {
        setAdditionDeductionData([]);
    }, [additionDeductionList.registrationNumber]);

    useEffect(() => {
        GetOperatorListByDateAndGardenIDForLabourChecklistReport();
    }, [additionDeductionList.gardenID, additionDeductionList.applicableDate]);


    useEffect(() => {
        checkBeforeBtnEnable()
    }, [deletedValues.deleted]);

    useEffect(() => {
        checkBeforeBtnEnable()
    }, [EditedValues.edited]);

    useEffect(() => {
        setDataNP([]);
        setDataP([]);
    }, [additionDeductionList.applicableDate]);

    useEffect(() => {
        setDataNP([]);
        setDataP([]);
    }, [additionDeductionList.registrationNumber]);


    async function checkBeforeBtnEnable() {
        if (deletedValues.deleted.length > 0 || EditedValues.edited.length > 0) {
            setBtnEnable(true);
        }
    }

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWADDITIONDEDUCTION');

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

        setAdditionDeductionList({
            ...additionDeductionList,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            gardenID: parseInt(tokenService.getFactoryIDFromToken())
        })

        getEmployeeTypesForDropdown();
    }

    async function getSirdersForDropdown() {
        const result = await services.getSirdersForDropdown();
        setSirder(result);

    }


    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(additionDeductionList.groupID);
        setGardens(response);
    };

    async function getCostCenterDetailsByGardenID() {
        var response = await services.getDivisionDetailsByEstateID(additionDeductionList.gardenID);
        const elementCount = response.reduce((count) => count + 1, 0);
        var generated = generateDropDownMenu(response)
        if (elementCount === 1) {
            setAdditionDeductionList((prevState) => ({
                ...prevState,
                costCenterID: generated[0].props.value,
            }));
        }
        setCostCenters(response);
    };

    async function getFieldDetailsByDivisionID() {
        var response = await services.getFieldDetailsByDivisionID(additionDeductionList.costCenterID);
        var newOptionArray = fields;
        for (var i = 0; i < response.length; i++) {
            newOptionArray.push({ label: response[i].fieldName, value: response[i].fieldID })
        }
        setFields(newOptionArray);
    };

    async function getGangDetailsByDivisionID() {
        var response = await services.getGangDetailsByDivisionID(additionDeductionList.costCenterID);
        var newOptionArray = gangs;
        for (var i = 0; i < response.length; i++) {
            newOptionArray.push({ label: response[i].gangName, value: response[i].gangID })
        }
        setGangs(newOptionArray);
    };

    async function GetOperatorListByDateAndGardenIDForLabourChecklistReport() {
        const result = await services.GetOperatorListByDateAndGardenIDForLabourChecklistReport(additionDeductionList.gardenID, moment(additionDeductionList.applicableDate.toString()).format().split('T')[0]);
        if (result.length > 0) {
            var newOptionArray = [];
            for (var i = 0; i < result.length; i++) {
                newOptionArray.push({ label: result[i].operatorName, value: result[i].operatorID })
            }
            setOperator(newOptionArray);

        }
        else {
            setOperator([]);

        }
    }

    async function getEmployeeTypesForDropdown() {
        const result = await services.getEmployeeTypesForDropdown();
        setEmpTypes(result)
        var newOptionArray = empType;
        for (var i = 0; i < result.length; i++) {
            newOptionArray.push({ label: result[i].employeeTypeName, value: result[i].employeeTypeID })
        }
        setEmpType(newOptionArray);
    }


    function generateDropDownMenuSider(data) {
        let items = []

        if (data != null) {
            for (const [key, value] of Object.entries(data)) {
                items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
            }
        }

        return items
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
        setAdditionDeductionList({
            ...additionDeductionList,
            [e.target.name]: value
        });
    }

    async function getAdditionDeductionDetails() {
        setDataNP([])
        setDataP([])
        setIsTableHideNP(true);
        setIsTableHideP(true);

        let model = {
            groupID: parseInt(additionDeductionList.groupID),
            gardenID: parseInt(additionDeductionList.gardenID),
            costCenterID: parseInt(additionDeductionList.costCenterID),
            applicableDate: (additionDeductionList.applicableDate),
            registrationNumber: (additionDeductionList.registrationNumber)
        }

        var result = await services.GetAdditionDeductionDetails(model);
        if (result.statusCode == "Success") {
            if (result.data.nonPluckingModel.length != 0) {
                AdditionDeductionNonPluckingDetails(result.data.nonPluckingModel)
            }
            if (result.data.pluckingModel.length != 0) {
                AdditionDeductionPluckingDetails(result.data.pluckingModel)
            }
        }
    }

    function AdditionDeductionNonPluckingDetails(data) {
        setDataNP(data)
        setIsTableHideNP(false);

    }
    function AdditionDeductionPluckingDetails(data) {
        setDataP(data)
        setIsTableHideP(false);

    }

    async function UpdateNonPluckingAdditionDeductionData(oldData) {
        if (oldData.addition != 0 && oldData.deduction != 0) {
            alert.error('Addition and Deduction cannot be add same time');
        } else {
            let updateModel = {
                dailyNonPluckingAttendanceID: oldData.dailyNonPluckingAttendanceID,
                addition: oldData.addition,
                deduction: oldData.deduction,
                reason: oldData.reason,
                modifiedBy: tokenDecoder.getUserIDFromToken(),
            }
            let response = await services.UpdateNonPluckingAdditionDeductionData(updateModel);

            if (response.statusCode == "Success") {
                alert.success(response.message);
                trackPromise(getAdditionDeductionDetails())
            }
            else {
                alert.error(response.message);
            }
        }

    }

    async function UpdatePluckingAdditionDeductionData(oldData) {
        if (oldData.addition != 0 && oldData.deduction != 0) {
            alert.error('Addition and Deduction cannot be add same time');
        } else {
            let updateModel = {
                dailyPluckingAttendanceID: oldData.dailyPluckingAttendanceID,
                addition: oldData.addition,
                deduction: oldData.deduction,
                reason: oldData.reason,
                modifiedBy: tokenDecoder.getUserIDFromToken(),
            }
            let response = await services.UpdatePluckingAdditionDeductionData(updateModel);

            if (response.statusCode == "Success") {
                alert.success(response.message);
                trackPromise(getAdditionDeductionDetails())
            }
            else {
                alert.error(response.message);
            }
        }

    }


    function clearFormFields() {
        setAdditionDeductionList({
            ...additionDeductionList,
            registrationNumber: ''
        });
        handleDateChange();
    }

    async function clearTable() {
        var result = await services.GetAdditionDeductionDetails(additionDeductionList.groupID, additionDeductionList.gardenID,
            additionDeductionList.costCenterID, additionDeductionList.applicableDate, additionDeductionList.registrationNumber);
        setAdditionDeductionData(result);
        setStateP({ ...stateP, data: [] });
        setStateNP({ ...stateNP, data: [] });
    }

    function checkCollectionTypeValidation(employeeID) {
        return Object.keys(sirders).find(key => key === employeeID);
    }

    return (
        <Page className={classes.root} title={title}>
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: additionDeductionList.groupID,
                        gardenID: additionDeductionList.gardenID,
                        costCenterID: additionDeductionList.costCenterID,
                        applicableDate: additionDeductionList.applicableDate,
                        registrationNumber: additionDeductionList.registrationNumber

                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Legal Entity is required').min("1", 'Legal Entity is required'),
                            gardenID: Yup.number().required('Garden is required').min("1", 'Garden is required'),
                            costCenterID: Yup.number().required('Cost Center is required').min("1", 'Cost Center is required'),
                            applicableDate: Yup.date().required('Date is required'),
                            registrationNumber: Yup.string().required('Emp.ID is required')
                        })
                    }
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
                                                        Business Division *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.groupID && errors.groupID)}
                                                        fullWidth
                                                        helperText={touched.groupID && errors.groupID}
                                                        name="groupID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={additionDeductionList.groupID}
                                                        variant="outlined"
                                                        id="groupID"
                                                        size='small'
                                                        InputProps={{
                                                            readOnly: !permissionList.isGroupFilterEnabled ? true : false
                                                        }}
                                                    >
                                                        <MenuItem value="0">--Select Business Division--</MenuItem>
                                                        {generateDropDownMenu(groups)}
                                                    </TextField>
                                                </Grid>

                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="gardenID">
                                                        Location  *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.gardenID && errors.gardenID)}
                                                        fullWidth
                                                        helperText={touched.gardenID && errors.gardenID}
                                                        name="gardenID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={additionDeductionList.gardenID}
                                                        variant="outlined"
                                                        id="gardenID"
                                                        size='small'
                                                        InputProps={{
                                                            readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                        }}
                                                    >
                                                        <MenuItem value="0">--Select Location --</MenuItem>
                                                        {generateDropDownMenu(gardens)}
                                                    </TextField>
                                                </Grid>

                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="costCenterID">
                                                        Sub Division *
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="costCenterID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={additionDeductionList.costCenterID}
                                                        variant="outlined"
                                                        id="costCenterID"
                                                        size='small'
                                                    >
                                                        <MenuItem value="0">--Select Sub Division--</MenuItem>
                                                        {generateDropDownMenu(costCenters)}
                                                    </TextField>
                                                </Grid>

                                                {/* <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="date">Date *</InputLabel>
                                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                        <KeyboardDatePicker
                                                            fullWidth
                                                            variant="inline"
                                                            format="dd/MM/yyyy"
                                                            margin="dense"
                                                            name='applicableDate'
                                                            id='applicableDate'
                                                            size='small'
                                                            value={applicableDate}
                                                            onChange={(e) => {
                                                                handleDateChange(e)
                                                            }}
                                                            KeyboardButtonProps={{
                                                                'aria-label': 'change date',
                                                            }}
                                                            autoOk
                                                        />
                                                    </MuiPickersUtilsProvider>
                                                </Grid> */}

                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="applicableDate">
                                                        Date *
                                                    </InputLabel>
                                                    <TextField
                                                        error={Boolean(touched.applicableDate && errors.applicableDate)}
                                                        helperText={touched.applicableDate && errors.applicableDate}
                                                        fullWidth
                                                        size='small'
                                                        name="applicableDate"
                                                        type="date"
                                                        value={additionDeductionList.applicableDate}
                                                        onChange={(e) => handleChange(e)}
                                                        variant="outlined"
                                                        id="applicableDate"
                                                    />
                                                </Grid>

                                                <Grid item md={3} xs={12} >
                                                    <InputLabel shrink id="registrationNumber">
                                                        Emp.ID *
                                                    </InputLabel>
                                                    <TextField
                                                        error={Boolean(touched.registrationNumber && errors.registrationNumber)}
                                                        fullWidth
                                                        helperText={touched.registrationNumber && errors.registrationNumber}
                                                        size='small'
                                                        name="registrationNumber"
                                                        onChange={(e) => handleChange(e)}
                                                        value={additionDeductionList.registrationNumber}
                                                        variant="outlined"
                                                        id="registrationNumber"
                                                    >
                                                    </TextField>
                                                </Grid>


                                                <Grid container justify="flex-end">
                                                    <Box pr={2}>
                                                        <Button
                                                            color="primary"
                                                            variant="contained"
                                                            type="submit"
                                                            size='small'
                                                            onClick={() => trackPromise(getAdditionDeductionDetails())}
                                                        >
                                                            Search
                                                        </Button>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                            <br />
                                        </CardContent>
                                        <Box minWidth={1050} hidden={isTableHideNP}>
                                            <MaterialTable
                                                title="Non Plucking"
                                                fullWidth
                                                columns={[
                                                    {
                                                        title: 'Emp.ID', field: 'registrationNumber', editable: 'never', cellStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "left",
                                                            marginLeft: '20rem'
                                                        }, headerStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "left",
                                                            marginLeft: '20rem'
                                                        }
                                                    },
                                                    {
                                                        title: 'Emp.Name', field: 'employeeName', editable: 'never', cellStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "left",
                                                            marginLeft: '20rem'
                                                        }, headerStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "left",
                                                            marginLeft: '20rem'
                                                        }
                                                    },
                                                    {
                                                        title: 'Emp.Type', field: 'employeeTypeName', editable: 'never', cellStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "left",
                                                            marginLeft: '20rem'
                                                        }, headerStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "left",
                                                            marginLeft: '20rem'
                                                        }
                                                    },
                                                    {
                                                        title: 'Cost Center', field: 'costCenter', editable: 'never', cellStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "center"
                                                        }, headerStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "center"
                                                        }
                                                    },

                                                    {
                                                        title: 'Task Code', field: 'taskCode', editable: 'never', cellStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "center"
                                                        }, headerStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "center"
                                                        }
                                                    },
                                                    {
                                                        title: 'Task Name', field: 'taskName', editable: 'never', cellStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "center"
                                                        }, headerStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "center"
                                                        }
                                                    },
                                                    {
                                                        title: 'Rate', field: 'rate', editable: 'never', cellStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "center"
                                                        }, headerStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "center"
                                                        }
                                                    },
                                                    {
                                                        title: 'BCS Allowance', field: 'allowance', editable: 'never', cellStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "center"
                                                        }, headerStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "center"
                                                        }
                                                    },
                                                    {
                                                        title: 'G.Allowance', field: 'gardenAllowance', editable: 'never', cellStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "center"
                                                        }, headerStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "center"
                                                        }
                                                    },
                                                    {
                                                        title: 'Assigned Qty', field: 'assignQuntity', editable: 'never', cellStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "center"
                                                        }, headerStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "center"
                                                        }
                                                    },
                                                    {
                                                        title: 'Completed Qty', field: 'quntity', editable: 'never', cellStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "center"
                                                        }, headerStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "center"
                                                        }
                                                    },
                                                    {
                                                        title: 'Total Amount', field: 'amount', editable: 'never', cellStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "center"
                                                        }, headerStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "center"
                                                        }
                                                    },
                                                    {
                                                        title: 'Addition', field: 'addition', type: 'numeric', validate: rowData => (valueChecker.test(rowData.addition) ? true : 'Only positive numbers'),
                                                        editable: rowData => (rowData.deduction != undefined) ? 'never' : 'always',
                                                        cellStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "center"
                                                        }, headerStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "center"
                                                        },
                                                    },
                                                    {
                                                        title: 'Deduction', field: 'deduction', type: 'numeric', validate: rowData => (valueChecker.test(rowData.deduction) ? true : 'Only positive numbers'),
                                                        editable: rowData => (rowData.addition) ? 'never' : 'always',
                                                        cellStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "center"
                                                        }, headerStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "center"
                                                        },
                                                    },
                                                    {
                                                        title: 'Reason', field: 'reason', cellStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "center"
                                                        }, headerStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "center"
                                                        },
                                                    },


                                                ]}
                                                data={dataNP}
                                                page={10}
                                                options={{ showTitle: true, search: false, actionsColumnIndex: -1 }}
                                                editable={{
                                                    onRowUpdate: (newData, oldData) =>
                                                        new Promise((resolve, edit) => {
                                                            setTimeout(() => {

                                                                resolve();
                                                                if (oldData) {
                                                                    setStateNP((prevState) => {
                                                                        const data = [...prevState.data];
                                                                        data[data.indexOf(oldData)] = newData;
                                                                        return { ...prevState, data };
                                                                    });
                                                                    setEditedValues((prevState) => {
                                                                        const edited = [...prevState.edited];
                                                                        edited[edited.indexOf(oldData)] = newData;
                                                                        edited.push(newData);
                                                                        UpdateNonPluckingAdditionDeductionData(newData)
                                                                        return { ...prevState, edited };
                                                                    });
                                                                }
                                                            }, 300);
                                                        }),
                                                }}
                                            />
                                        </Box>
                                        <Box minWidth={1050} hidden={isTableHideP}>
                                            <MaterialTable
                                                title="Plucking"
                                                fullWidth
                                                columns={[
                                                    {
                                                        title: 'Emp.ID', field: 'registrationNumber', editable: 'never', cellStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "left",
                                                            marginLeft: '20rem'
                                                        }, headerStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "left",
                                                            marginLeft: '20rem'
                                                        }
                                                    },
                                                    {
                                                        title: 'Emp.Name', field: 'employeeName', editable: 'never', cellStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "left",
                                                            marginLeft: '20rem'
                                                        }, headerStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "left",
                                                            marginLeft: '20rem'
                                                        }
                                                    },
                                                    {
                                                        title: 'Emp.Type', field: 'employeeTypeName', editable: 'never', cellStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "left",
                                                            marginLeft: '20rem'
                                                        }, headerStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "left",
                                                            marginLeft: '20rem'
                                                        }
                                                    },
                                                    {
                                                        title: 'Cost Center', field: 'costCenter', editable: 'never', cellStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "center"
                                                        }, headerStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "center"
                                                        }
                                                    },

                                                    {
                                                        title: 'Task Code', field: 'taskCode', editable: 'never', cellStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "center"
                                                        }, headerStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "center"
                                                        }
                                                    },
                                                    {
                                                        title: 'Task Name', field: 'taskName', editable: 'never', cellStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "center"
                                                        }, headerStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "center"
                                                        }
                                                    },
                                                    {
                                                        title: 'Rate', field: 'rate', editable: 'never', cellStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "center"
                                                        }, headerStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "center"
                                                        }
                                                    },
                                                    {
                                                        title: 'Completed Qty', field: 'quntity', editable: 'never', cellStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "center"
                                                        }, headerStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "center"
                                                        }
                                                    },
                                                    {
                                                        title: 'Addition', field: 'addition', type: 'numeric', validate: rowData => (valueChecker.test(rowData.addition) ? true : 'Only positive numbers'),
                                                        editable: rowData => (rowData.deduction) ? 'never' : 'always',
                                                        cellStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "center"
                                                        }, headerStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "center"
                                                        },
                                                    },
                                                    {
                                                        title: 'Deduction', field: 'deduction', type: 'numeric', validate: rowData => (valueChecker.test(rowData.deduction) ? true : 'Only positive numbers'),
                                                        editable: rowData => (rowData.addition) ? 'never' : 'always',
                                                        cellStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "center"
                                                        }, headerStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "center"
                                                        },
                                                    },
                                                    {
                                                        title: 'Reason', field: 'reason', cellStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "center"
                                                        }, headerStyle: {
                                                            width: 200,
                                                            maxWidth: 200,
                                                            textAlign: "center"
                                                        },
                                                    },


                                                ]}
                                                data={dataP}
                                                page={10}
                                                options={{ showTitle: true, search: false, actionsColumnIndex: -1 }}
                                                editable={{
                                                    onRowUpdate: (newData, oldData) =>
                                                        new Promise((resolve, edit) => {
                                                            setTimeout(() => {

                                                                resolve();
                                                                if (oldData) {
                                                                    setStateP((prevState) => {
                                                                        const data = [...prevState.data];
                                                                        data[data.indexOf(oldData)] = newData;
                                                                        return { ...prevState, data };
                                                                    });
                                                                    setEditedValues((prevState) => {
                                                                        const edited = [...prevState.edited];
                                                                        edited[edited.indexOf(oldData)] = newData;
                                                                        edited.push(newData);
                                                                        UpdatePluckingAdditionDeductionData(newData)
                                                                        return { ...prevState, edited };
                                                                    });
                                                                }
                                                            }, 300);
                                                        }),
                                                }}
                                            />
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