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
    Typography,
    Switch
} from '@material-ui/core';
import MaterialTable from "material-table";
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
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import Autocomplete from '@material-ui/lab/Autocomplete';
import moment from 'moment';
import PageHeader from 'src/views/Common/PageHeader';

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

const screenCode = 'PLUCKINGAMENDMENT';

export default function PluckingAmendmentAdd(props) {
    const alert = useAlert();
    const title = "Add Plucking Amendment"
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [gardens, setGardens] = useState([]);
    const [fields, setFields] = useState([]);
    const [payPoints, setPayPoints] = useState([]);
    const [task, setTask] = useState([]);
    const [isCleared, setIsCleared] = useState(false);
    const [showInputs, setShowInputs] = useState(false)
    const [itemCount, setItemCount] = useState(0)
    const [sessionWiseData, setSessionWiseData] = useState([])
    const [pluckingAmendmentList, setPluckingAmendmentList] = useState({
        groupID: '0',
        gardenID: '0',
        payPointID: '0',
        date: new Date(),
        registrationNumber: '',
        employeeID: '',
        employeeCode: '',
        employeeName: '',
        employeeTypeID: '',
        employeeTypeName: '',
        gangID: '',
        employeeCategoryID: '',
        employeeCategoryName: '',
        bookNumber: '',
        genderID: '',
        jobTypeID: '0',
        productID: '0',
        workLocationID: '0',
        payPointName: '',
        divisionName: '',
        NoOfSessions: '',
        productID: ''
    })
    const [quantity, setQuantity] = useState({
        quantity0: '',
        quantity1: '',
        quantity2: '',
        quantity3: ''
    })
    const [sessionData, setSessionData] = useState([])
    const [tableData, setTableData] = useState([])
    const [showTable, setShowTable] = useState(false)
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const [columns, setColumns] = useState([
        { title: 'Reg No.', field: 'registrationNo' },
        { title: 'Emp Name', field: 'employeeName' },
    ])
    const [disableInputs, setDisableInputs] = useState(false)
    const [disableSessions, setDisableSessions] = useState(false)
    const [quantityDisable, setQuantityDisable] = useState({
        quantity1: false,
        quantity2: false,
        quantity3: false,
        quantity4: false,
    })
    const [products, setProducts] = useState([]);
    const [disableSubmit, setDisableSubmit] = useState(false)
    const [existRecordMessage, setExistRecordMessage] = useState("")
    const navigate = useNavigate();
    const handleClick = () => {
        navigate('/app/pluckingAmendment/listing');
    }
    const registrationNumberRef = useRef(null);
    const NoOfSessionsRef = useRef(null);
    const QuantityRef0 = useRef(null);
    const QuantityRef1 = useRef(null);
    const QuantityRef2 = useRef(null);
    const QuantityRef3 = useRef(null);
    const addButtonRef = useRef(null);

    const selectAllText = () => {
        if (registrationNumberRef.current) {
            registrationNumberRef.current.select();
        }
    };

    useEffect(() => {
        trackPromise(
            getPermission());
    }, []);

    useEffect(() => {
        setPluckingAmendmentList({
            ...pluckingAmendmentList,
            gardenID: '0',
            payPointID: '0'
        })
        trackPromise(getEstateDetailsByGroupID(),
            GetDivisionDetailsByGroupID());
    }, [pluckingAmendmentList.groupID]);

    useEffect(() => {
        setTask([])
        setIsCleared(!isCleared)
    }, [pluckingAmendmentList.gardenID]);

    useEffect(() => {
        setIsCleared(!isCleared)
        setPluckingAmendmentList({
            ...pluckingAmendmentList,
            productID : '0'
        })
        trackPromise(
            GetMappedProductsByDivisionID(),
            getPluckingTaskNamesByPayPointID()
        );
    }, [pluckingAmendmentList.payPointID]);

    useEffect(()=>{
        trackPromise( getFieldDetailsByDivisionIDAndProductID())
    },[pluckingAmendmentList.productID])

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITPLUCKINGAMENDMENT');
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

        setPluckingAmendmentList({
            ...pluckingAmendmentList,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            gardenID: parseInt(tokenService.getFactoryIDFromToken())
        })
        trackPromise(getGroupsForDropdown())
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(pluckingAmendmentList.groupID);
        setGardens(response);
    };

    async function getFieldDetailsByDivisionIDAndProductID() {
        var response = await services.getFieldDetailsByDivisionIDAndProductID(pluckingAmendmentList.payPointID, pluckingAmendmentList.productID);
        setFields(response);
    };

    async function GetDivisionDetailsByGroupID() {
        const result = await services.GetDivisionDetailsByGroupID(pluckingAmendmentList.groupID);
        setPayPoints(result);
    }
    async function GetMappedProductsByDivisionID() {
        var response = await services.GetMappedProductsByDivisionID(pluckingAmendmentList.payPointID);
        setProducts(response);
    };
    async function getPluckingTaskNamesByPayPointID() {
        const task = await services.getPluckingTaskNamesByPayPointID(pluckingAmendmentList.payPointID);
        setTask(task);
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
            <Grid item md={2} xs={12}>
            <PageHeader
                onClick={handleClick}
            />
            </Grid>
        </Grid>
        )
    }

    function handleDateChange(value) {
        setPluckingAmendmentList({
            ...pluckingAmendmentList,
            date: moment(value).format('YYYY-MM-DD')
        });
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setPluckingAmendmentList({
            ...pluckingAmendmentList,
            [e.target.name]: value
        });
    }

    const handleChangeItems = (e, index) => {
        const target = e.target;
        let value = target.value
        if (target.name === "fieldID") {
            const newInputs = sessionData.map((input, indx) => (
                indx === index ? { ...input, [e.target.name]: value, fieldName: fields[target.value], sessionID: index + 1 } : input
            ));
            setSessionData(newInputs);
        }
        else if (target.name === 'isSkip') {
            value = target.checked
            switch (index) {
                case 0:
                    setQuantityDisable({
                        ...quantityDisable,
                        quantity1: value
                    })
                    break;
                case 1:
                    setQuantityDisable({
                        ...quantityDisable,
                        quantity2: value
                    })
                    break;
                case 2:
                    setQuantityDisable({
                        ...quantityDisable,
                        quantity3: value
                    })
                    break;
                case 3:
                    setQuantityDisable({
                        ...quantityDisable,
                        quantity4: value
                    })
                    break;
                default:
                    break;
            }
            const newInputs = sessionData.map((input, indx) => (
                indx === index ? { ...input, [e.target.name]: value, sessionID: index + 1 } : input
            ));
            setSessionData(newInputs);
        }
        else {
            const newInputs = sessionData.map((input, indx) => (
                indx === index ? { ...input, [e.target.name]: value, sessionID: index + 1 } : input
            ));
            setSessionData(newInputs);
        }
    };

    const handleChangeQuantity = (e, index) => {
        const target = e.target;
        const value = target.value
        setQuantity({
            ...quantity,
            [e.target.name]: value
        })
        const newInputs = sessionData.map((input, indx) => (
            indx == index ? { ...input, quantity: value, sessionID: index + 1 } : input
        ));
        setSessionData(newInputs);
    }

    function handleSearchDropdownChangeTask(data, e, index) {
        if (data === undefined || data === null) {
            return;
        } else {
            var valueV = data["taskID"];
            const taskName = data["taskName"]
            const newInputs = sessionData.map((input, indx) => (
                indx === index ? { ...input, taskID: valueV, taskName: taskName, sessionID: index + 1 } : input
            ));
            setSessionData(newInputs);
        }
    }
    const handleKeyDown = (event, nextInputRef) => {
        if (nextInputRef && nextInputRef.current && typeof nextInputRef.current.focus === 'function') {
            if (event.key === 'Enter') {
                if (event.target.name == 'NoOfSessions') {
                    event.preventDefault();
                    if (pluckingAmendmentList.NoOfSessions > 4) {
                        alert.error("Max No. Of Sessions count is exceeded (Max - 4)")
                    } else {
                        setSessionData([])
                        setColumns([
                            { title: 'Reg No.', field: 'registrationNo' },
                            { title: 'Emp Name', field: 'employeeName' }
                        ])
                        setItemCount(pluckingAmendmentList.NoOfSessions)
                        const numSets = parseInt(pluckingAmendmentList.NoOfSessions)
                        setShowInputs(true)
                        setSessionData(Array.from({ length: numSets }, () => ({
                            sessionID: '0',
                            taskID: '0',
                            fieldID: '0',
                            quantity: '',
                            isSkip: false
                        })));
                        let newColumns = []
                        for (let i = 1; i <= numSets; i++) {
                            newColumns.push({ title: `Weighment ${i}`, field: `session${i}` })
                        }
                        setColumns((prevItems) => [...prevItems, ...newColumns]);
                    }
                }
                else {
                    if (nextInputRef == QuantityRef0 && quantityDisable.quantity1) {
                        nextInputRef = QuantityRef1
                    }
                    if (nextInputRef == QuantityRef1 && quantityDisable.quantity2) {
                        nextInputRef = QuantityRef2
                    }
                    if (nextInputRef == QuantityRef2 && quantityDisable.quantity3) {
                        nextInputRef = QuantityRef3
                    }
                    if (nextInputRef == QuantityRef3 && quantityDisable.quantity4) {
                        addPluckingAmendmentDetails()
                        nextInputRef = null
                    }
                    if (nextInputRef != null) {
                        event.preventDefault();
                        nextInputRef.current.focus();
                    }
                }
            }
        }
    }

    function handleClickDelete(rowData) {
        const updatedTableData = tableData.filter((item, index) => index !== rowData.tableData.id);
        setTableData(updatedTableData);
        const updatedSessionData = sessionWiseData.filter((item, index) => item.registrationNo != rowData.registrationNo);
        setSessionWiseData(updatedSessionData);
        if (updatedTableData.length <= 0 && sessionWiseData.length <= 0) {
            setDisableSessions(false)
            setDisableSubmit(false)
            setExistRecordMessage('')
        }
    }
    const formatSession = (quantityDisable, quantity, index, fields, newInputs) => {
        if (quantityDisable) {
            return 'Skip';
        }
        const fieldLabel = fields[parseInt(newInputs[index]?.fieldID)];
        return (
            <span>
                {fieldLabel} : <Typography component="span" style={{ fontWeight: 'bold', color: 'green' }}>{quantity}</Typography>
            </span>
        );
    };

    async function addPluckingAmendmentDetails() {
        if (sessionData.length > 0) {
            for (let i = 0; i < sessionData.length; i++) {
                const session = sessionData[i];
                if (session.fieldID == '0' && quantityDisable[`quantity${i + 1}`] == false) {
                    alert.error("Please select fields for all the active sessions")
                    return
                } else if (session.taskID == '0' && quantityDisable[`quantity${i + 1}`] == false) {
                    alert.error("Please select tasks for all the active sessions")
                    return
                } else if (session.quantity == '' && quantityDisable[`quantity${i + 1}`] == false) {
                    alert.error("Please add quantity for all the active sessions")
                    return
                }
            }
        }
        if (sessionWiseData.length > 0) {
            const availableRegNo = sessionWiseData.filter((item, index) => item.registrationNo == pluckingAmendmentList.registrationNumber);
            if (availableRegNo.length > 0) {
                alert.error("This registration number is already available")
                return
            }
        }
        const empData = await services.GetEmployeeDetailsByRegistrationNumber(pluckingAmendmentList.registrationNumber)
        if (empData.length <= 0) {
            alert.error("Invalid Employee Reg No.")
            return
        } else {
            const newInputs = sessionData.map((input, indx) => (
                { ...input, employeeName: empData[0].employeeName, registrationNo: empData[0].registrationNumber, sessionID: indx + 1 }
            ));
            const tableItem = {
                employeeName: empData[0]?.employeeName,
                registrationNo: empData[0]?.registrationNumber,
                session1: formatSession(quantityDisable.quantity1, quantity.quantity0, 0, fields, newInputs),
                session2: formatSession(quantityDisable.quantity2, quantity.quantity1, 1, fields, newInputs),
                session3: formatSession(quantityDisable.quantity3, quantity.quantity2, 2, fields, newInputs),
                session4: formatSession(quantityDisable.quantity4, quantity.quantity3, 3, fields, newInputs),
            }
            setTableData([...tableData, tableItem])
            setSessionWiseData((prevItems) => [...prevItems, ...newInputs]);
            setShowTable(true)
            setPluckingAmendmentList({
                ...pluckingAmendmentList,
                registrationNumber: ''
            })
            setDisableInputs(true)
            setDisableSessions(true)
            selectAllText()
            setQuantity({
                quantity0: '',
                quantity1: '',
                quantity2: '',
                quantity3: ''
            })
            setSessionData(prevSessionData =>
                prevSessionData.map(input => ({
                    ...input,
                    quantity: ''
                }))
            );
        }
    }
    async function savePluckingAmendmentDetails() {
        const skipSessionRemovedData = sessionWiseData.filter((item, index) => item.isSkip !== true && item.quantity != '0');
        const updatedSessionWiseData = skipSessionRemovedData.map((item, index) => (
            {
                taskID: parseInt(item.taskID),
                fieldID: parseInt(item.fieldID),
                sessionID: parseInt(item.sessionID),
                registrationNo: item.registrationNo,
                quantity: parseFloat(item.quantity)
            }
        ))
        const sessionDetails = updatedSessionWiseData.reduce((acc, { taskID, fieldID, sessionID, registrationNo, quantity }) => {
            let existingEntry = acc.find(entry => entry.registrationNo == registrationNo);
            if (existingEntry) {
                existingEntry.sessions.push({ taskID, fieldID, sessionID, quantity });
            } else {
                acc.push({
                    registrationNo,
                    sessions: [{ taskID, fieldID, sessionID, quantity }]
                });
            }
            return acc;
        }, [])
        const model = {
            groupID: parseInt(pluckingAmendmentList.groupID),
            gardenID: parseInt(pluckingAmendmentList.gardenID),
            payPointID: parseInt(pluckingAmendmentList.payPointID),
            date: pluckingAmendmentList.date,
            noOfSessions: parseInt(pluckingAmendmentList.NoOfSessions),
            createdBy: parseInt(tokenService.getUserIDFromToken()),
            sessionDetails
        };
        const response = await services.savePluckingAmendmentDetails(model)
        if (response.statusCode === "Success") {
            alert.success(response.message)
            let data = response.data
            if (data && data.length > 0) {
                setDisableSubmit(true)
                let existingAmendments = []
                data.forEach(amndment => {
                    tableData.forEach((tblData) => {
                        if (tblData.registrationNo == amndment.registrationNo) {
                            existingAmendments.push(tblData)
                        }
                    })
                })
                setTableData(existingAmendments)
                setSessionData([])
                setExistRecordMessage("These records are already available")
            }
            else {
                setTableData([])
                setDisableSessions(false)
            }
            setPluckingAmendmentList({
                ...pluckingAmendmentList,
                registrationNumber: '',
                NoOfSessions: ''
            })
            setSessionData([])
            setSessionWiseData([])
            setDisableInputs(false)
            setQuantityDisable({
                quantity1: false,
                quantity2: false,
                quantity3: false,
                quantity4: false,
            })
        } else {
            alert.error(response.message)
        }
    }
    function clearTable() {
        setTableData([])
        setPluckingAmendmentList({
            ...pluckingAmendmentList,
            registrationNumber: '',
            NoOfSessions: ''
        })
        setSessionWiseData([])
        setDisableInputs(false)
        setSessionData([])
        setDisableSessions(false)
    }

    return (
        <>
            <Page className={classes.root} title={title}>
                <LoadingComponent />
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: pluckingAmendmentList.groupID,
                            gardenID: pluckingAmendmentList.gardenID,
                            payPointID: pluckingAmendmentList.payPointID,
                            date: pluckingAmendmentList.date,
                            registrationNumber: pluckingAmendmentList.registrationNumber,
                            NoOfSessions: pluckingAmendmentList.NoOfSessions,
                            productID: pluckingAmendmentList.productID
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Business Division is required').min("1", 'Business Division is required'),
                                gardenID: Yup.number().required('Location  is required').min("1", 'Location  is required'),
                                payPointID: Yup.number().required('Pay Point is required').min("1", 'Pay Point is required'),
                                productID: Yup.number().required('Product is required').min("1", 'Product is required'),
                                date: Yup.date().required('Date is required').typeError('Date is required'),
                                registrationNumber: Yup.string().required('Registration Number is required'),
                                NoOfSessions: Yup.number().required('No Of Sessions is required').typeError("No Of Sessions is required").min("0", 'No. Of Sessions can not be Less than 0').max("4", "Max No. Of Sessions count is exceeded"),
                            })
                        }
                        validateOnChange={false}
                        validateOnBlur={false}
                        onSubmit={() => trackPromise(addPluckingAmendmentDetails())}
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
                                                            value={pluckingAmendmentList.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            size='small'
                                                            InputProps={{
                                                                readOnly: !permissionList.isFactoryFilterEnabled ? true : disableSessions ? true : false
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Business Division--</MenuItem>
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
                                                            value={pluckingAmendmentList.gardenID}
                                                            variant="outlined"
                                                            id="gardenID"
                                                            size='small'
                                                            InputProps={{
                                                                readOnly: !permissionList.isFactoryFilterEnabled ? true : disableSessions ? true : false
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Location--</MenuItem>
                                                            {generateDropDownMenu(gardens)}
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
                                                            onChange={(e) => handleChange(e)}
                                                            value={pluckingAmendmentList.payPointID}
                                                            variant="outlined"
                                                            id="payPointID"
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            InputProps={{
                                                                readOnly: disableSessions,
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Pay Point--</MenuItem>
                                                            {generateDropDownMenu(payPoints)}
                                                        </TextField>
                                                    </Grid>
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
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={pluckingAmendmentList.productID}
                                                            variant="outlined"
                                                            id="productID"
                                                            >
                                                            <MenuItem value={0}>--Select Product--</MenuItem>
                                                            {generateDropDownMenu(products)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="date">Date *</InputLabel>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <KeyboardDatePicker
                                                                error={Boolean(touched.date && errors.date)}
                                                                fullWidth
                                                                helperText={touched.date && errors.date}
                                                                variant="inline"
                                                                format="yyyy/MM/dd"
                                                                margin="dense"
                                                                name='date'
                                                                id='date'
                                                                size='small'
                                                                value={pluckingAmendmentList.date}
                                                                onBlur={handleBlur}
                                                                onChange={(e) => handleDateChange(e)}
                                                                KeyboardButtonProps={{
                                                                    'aria-label': 'change date',
                                                                }}
                                                                autoOk
                                                                maxDate={new Date()}
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="NoOfSessions">
                                                            No. of Sessions *
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.NoOfSessions && errors.NoOfSessions)}
                                                            fullWidth
                                                            helperText={touched.NoOfSessions && errors.NoOfSessions}
                                                            size='small'
                                                            name="NoOfSessions"
                                                            onChange={(e) => handleChange(e)}
                                                            value={pluckingAmendmentList.NoOfSessions}
                                                            variant="outlined"
                                                            id="NoOfSessions"
                                                            type="number"
                                                            onWheel={(e) => e.target.blur()}
                                                            onBlur={handleBlur}
                                                            autoComplete='off'
                                                            inputRef={NoOfSessionsRef}
                                                            onKeyDown={(e) => handleKeyDown(e, NoOfSessionsRef)}
                                                            InputProps={{
                                                                readOnly: disableSessions,
                                                                inputProps: {
                                                                    step: 1,
                                                                    type: 'number',
                                                                    min: 0
                                                                }
                                                            }}
                                                        >
                                                        </TextField>
                                                    </Grid>
                                                </Grid>
                                                <br />
                                                <br />
                                                <Grid container spacing={3}>
                                                    {showInputs ?
                                                        sessionData.map((inputSet, setIndex) => (
                                                            <Grid item md={3} xs={12}>
                                                                <Grid container md={12} xs={12}>
                                                                    <Grid item md={8} xs={12}>
                                                                        <Typography variant="h5">Weighment - {setIndex + 1}</Typography>
                                                                    </Grid>
                                                                    <Grid item md={4} xs={12}>
                                                                        <InputLabel shrink id="isSkip">
                                                                            IsSkip
                                                                        </InputLabel>
                                                                        <Switch
                                                                            checked={inputSet.isSkip}
                                                                            onChange={(e) => handleChangeItems(e, setIndex)}
                                                                            name="isSkip"
                                                                            disabled={disableInputs}
                                                                        />
                                                                    </Grid>
                                                                </Grid>
                                                                <Grid item md={12} xs={12}>
                                                                    <InputLabel shrink id="taskID">
                                                                        Task *
                                                                    </InputLabel>
                                                                    <Autocomplete
                                                                        key={isCleared}
                                                                        id="taskID"
                                                                        options={task}
                                                                        disabled={inputSet.isSkip || disableInputs}
                                                                        getOptionLabel={option => option.taskName ?? option.taskName}
                                                                        onChange={(e, value) =>
                                                                            handleSearchDropdownChangeTask(value, e, setIndex)
                                                                        }
                                                                        renderInput={params => (
                                                                            <TextField
                                                                                {...params}
                                                                                variant="outlined"
                                                                                name="taskID"
                                                                                size="small"
                                                                                fullWidth
                                                                                error={Boolean(
                                                                                    touched.taskID && errors.taskID
                                                                                )}
                                                                                helperText={touched.taskID && errors.taskID}
                                                                                value={inputSet.taskID}
                                                                                getOptionDisabled={true}
                                                                                onBlur={handleBlur}
                                                                                placeholder="Select Task"
                                                                            />
                                                                        )}
                                                                    />
                                                                </Grid>
                                                                &nbsp;
                                                                <Grid item md={12} xs={12}>
                                                                    <InputLabel shrink id="fieldID">
                                                                        Field *
                                                                    </InputLabel>
                                                                    <TextField select
                                                                        fullWidth
                                                                        name="fieldID"
                                                                        size='small'
                                                                        onBlur={handleBlur}
                                                                        onChange={(e) => handleChangeItems(e, setIndex)}
                                                                        value={inputSet.fieldID}
                                                                        variant="outlined"
                                                                        id="fieldID"
                                                                        disabled={inputSet.isSkip}
                                                                    >
                                                                        <MenuItem value={'0'} >--Select Field--</MenuItem>
                                                                        {generateDropDownMenu(fields)}
                                                                    </TextField>
                                                                </Grid>
                                                            </Grid>
                                                        )) : null}
                                                </Grid>
                                                 &nbsp;
                                                <Divider/>
                                                &nbsp;
                                                <Grid container spacing={3}>
                                                    {sessionData.length > 0 ?
                                                        <Grid item md={3} xs={12}>
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
                                                                value={pluckingAmendmentList.registrationNumber}
                                                                variant="outlined"
                                                                id="registrationNumber"
                                                                inputRef={registrationNumberRef}
                                                                onBlur={handleBlur}
                                                                onKeyDown={(e) => handleKeyDown(e, QuantityRef0)}
                                                            >
                                                            </TextField>
                                                        </Grid>
                                                        : null}
                                                </Grid>
                                                <Grid container spacing={3}>
                                                    {sessionData.length > 0 ?
                                                        <Grid item md={3} xs={12}>
                                                            <Grid container md={12} xs={12}>
                                                                <Grid item md={12} xs={12} >
                                                                    <InputLabel shrink id="quantity0">
                                                                        Quantity *
                                                                    </InputLabel>
                                                                    <TextField
                                                                        fullWidth
                                                                        size='small'
                                                                        onBlur={handleBlur}
                                                                        name="quantity0"
                                                                        onChange={(e) => handleChangeQuantity(e, 0)}
                                                                        onWheel={(e) => e.target.blur()}
                                                                        value={quantity.quantity0}
                                                                        variant="outlined"
                                                                        id="quantity0"
                                                                        type="number"
                                                                        disabled={quantityDisable.quantity1}
                                                                        inputRef={QuantityRef0}
                                                                        onKeyDown={(e) => handleKeyDown(e, QuantityRef1)}
                                                                        InputProps={{
                                                                            inputProps: {
                                                                                step: 1,
                                                                                type: 'number',
                                                                                min: 0
                                                                            }
                                                                        }}
                                                                    >
                                                                    </TextField>
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                        : null}
                                                    {sessionData.length > 1 ?
                                                        <Grid item md={3} xs={12}>
                                                            <Grid container md={12} xs={12}>
                                                                <Grid item md={12} xs={12} >
                                                                    <InputLabel shrink id="quantity1">
                                                                        Quantity *
                                                                    </InputLabel>
                                                                    <TextField
                                                                        fullWidth
                                                                        size='small'
                                                                        onBlur={handleBlur}
                                                                        name="quantity1"
                                                                        onChange={(e) => handleChangeQuantity(e, 1)}
                                                                        value={quantity.quantity1}
                                                                        variant="outlined"
                                                                        id="quantity1"
                                                                        type="number"
                                                                        onWheel={(e) => e.target.blur()}
                                                                        disabled={quantityDisable.quantity2}
                                                                        inputRef={QuantityRef1}
                                                                        onKeyDown={(e) => handleKeyDown(e, QuantityRef2)}
                                                                        InputProps={{
                                                                            inputProps: {
                                                                                step: 1,
                                                                                type: 'number',
                                                                                min: 0
                                                                            }
                                                                        }}
                                                                    >
                                                                    </TextField>
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                        : null}
                                                    {sessionData.length > 2 ?
                                                        <Grid item md={3} xs={12}>
                                                            <Grid container md={12} xs={12}>
                                                                <Grid item md={12} xs={12} >
                                                                    <InputLabel shrink id="quantity2">
                                                                        Quantity *
                                                                    </InputLabel>
                                                                    <TextField
                                                                        fullWidth
                                                                        size='small'
                                                                        onBlur={handleBlur}
                                                                        name="quantity2"
                                                                        onChange={(e) => handleChangeQuantity(e, 2)}
                                                                        value={quantity.quantity2}
                                                                        variant="outlined"
                                                                        id="quantity2"
                                                                        type="number"
                                                                        onWheel={(e) => e.target.blur()}
                                                                        disabled={quantityDisable.quantity3}
                                                                        inputRef={QuantityRef2}
                                                                        onKeyDown={(e) => handleKeyDown(e, QuantityRef3)}
                                                                        InputProps={{
                                                                            inputProps: {
                                                                                step: 1,
                                                                                type: 'number',
                                                                                min: 0
                                                                            }
                                                                        }}
                                                                    >
                                                                    </TextField>
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                        : null}
                                                    {sessionData.length > 3 ?
                                                        <Grid item md={3} xs={12}>
                                                            <Grid container md={12} xs={12}>
                                                                <Grid item md={12} xs={12} >
                                                                    <InputLabel shrink id="quantity3">
                                                                        Quantity *
                                                                    </InputLabel>
                                                                    <TextField
                                                                        fullWidth
                                                                        size='small'
                                                                        onBlur={handleBlur}
                                                                        name="quantity3"
                                                                        onChange={(e) => handleChangeQuantity(e, 3)}
                                                                        value={quantity.quantity3}
                                                                        variant="outlined"
                                                                        id="quantity3"
                                                                        type="number"
                                                                        disabled={quantityDisable.quantity4}
                                                                        inputRef={QuantityRef3}
                                                                        onWheel={(e) => e.target.blur()}
                                                                        onKeyDown={(e) => handleKeyDown(e, addButtonRef)}
                                                                        InputProps={{
                                                                            inputProps: {
                                                                                step: 1,
                                                                                type: 'number',
                                                                                min: 0
                                                                            }
                                                                        }}
                                                                    >
                                                                    </TextField>
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                        : null}
                                                </Grid>
                                                &nbsp;
                                                {showInputs ?
                                                    <Grid container justify="flex-end">
                                                        <Box pr={2}>
                                                            &nbsp;
                                                            &nbsp;
                                                            <Button
                                                                color="primary"
                                                                variant="contained"
                                                                type="submit"
                                                                ref={addButtonRef}
                                                                name="submit"
                                                                id="submit"
                                                            >
                                                                ADD
                                                            </Button>                                                   <Button
                                                                color="primary"
                                                                variant="outlined"
                                                                type="button"
                                                                onClick={() => clearTable()}
                                                            >
                                                                CLEAR
                                                            </Button>
                                                        </Box>
                                                    </Grid> : null}
                                                <br />
                                                <Typography style={{ fontWeight: 'bold' }} color='error'>
                                                    {existRecordMessage}
                                                </Typography>
                                                {tableData.length > 0 && showTable ?
                                                    <Box minWidth={1050}>
                                                        <MaterialTable
                                                            columns={columns}
                                                            data={tableData}
                                                            options={{
                                                                exportButton: false,
                                                                showTitle: false,
                                                                headerStyle: { textAlign: "left", height: '1%' },
                                                                cellStyle: { textAlign: "left" },
                                                                columnResizable: false,
                                                                actionsColumnIndex: -1,
                                                                pageSize: 5
                                                            }}
                                                            actions={[{
                                                                icon: 'delete',
                                                                tooltip: 'Delete',
                                                                onClick: (event, rowData) => handleClickDelete(rowData)
                                                            }]}
                                                        />
                                                        <br />
                                                        <Grid container justify="flex-end">
                                                            <Box pr={2}>
                                                                <Button
                                                                    color="primary"
                                                                    variant="contained"
                                                                    type="button"
                                                                    disabled={disableSubmit}
                                                                    onClick={() => trackPromise(savePluckingAmendmentDetails())}
                                                                >
                                                                    SUBMIT
                                                                </Button>
                                                                &nbsp;
                                                                <Button
                                                                    color="primary"
                                                                    variant="outlined"
                                                                    type="button"
                                                                    onClick={() => clearTable()}
                                                                >
                                                                    CLEAR
                                                                </Button>
                                                            </Box>
                                                        </Grid>
                                                    </Box>
                                                    : null}
                                            </CardContent>
                                        </PerfectScrollbar>
                                    </Card>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </Container>
            </Page >
        </>
    )
}