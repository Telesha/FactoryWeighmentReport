import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Grid, Box, Card, makeStyles, Container, CardHeader, Divider, Button } from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import { LoadingComponent } from '../../../utils/newLoader';
import * as Yup from "yup";
import { Formik } from 'formik';
import { TextField, CardContent } from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import moment from 'moment'
import EditableTable from './EditableTable'
import tokenDecoder from '../../../utils/tokenDecoder';
import { useAlert } from "react-alert";

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

var screenCode = "PLUCKINGAMENDMENT"

export default function PluckingAmendmentListing() {
    const alert = useAlert();
    const classes = useStyles();
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const [groups, setGroups] = useState([]);
    const [gardens, setGardens] = useState([]);
    const [payPoints, setPayPoints] = useState([]);
    const [amendment, setAmendment] = useState([]);
    const [amendmentList, setAmendmentList] = useState({
        groupID: 0,
        gardenID: 0,
        payPointID: 0,
        date: new Date(),
        registrationNumber: '',
    });
    const [task, setTask] = useState([]);
    const [fields, setFields] = useState([]);
    const navigate = useNavigate();
    const handleClick = () => {
        navigate('/app/pluckingAmendment/addEdit');
    }
    useEffect(() => {
        getPermission();
    }, []);

    useEffect(()=>{
        getPluckingTaskNamesByPayPointID()
        getFieldDetailsByDivisionID()
    }, [amendmentList.payPointID])

    useEffect(() => {
        setAmendmentList({
            ...amendmentList,
            gardenID:'0',
            payPointID:'0'
        })
        trackPromise(getEstateDetailsByGroupID(),
            GetDivisionDetailsByGroupID());
    }, [amendmentList.groupID]);

    async function getPluckingAmendmentData(){
        let model = {
            RegistrationNo : amendmentList.registrationNumber,
            Date : amendmentList.date
        }
        var amendmentData = await services.getPluckingAmendmentData(model)  
        if(amendmentData.length <=0){
            alert.error("No Records To Display")
        }else{
         setAmendment(amendmentData)
        }
    }
    async function UpdatePluckingAmendmentData() {
        let arr = []
        amendment.forEach(item => {
            let convertedData = {
                Date : item.date,
                EmployeeID : parseInt(item.employeeID),
                EmployeeName : item.employeeName,
                EmployeeTypeID : parseInt(item.employeeTypeID),
                FieldID : parseInt(item.fieldID),
                Quantity : parseFloat(item.quantity),
                SessionID :item.sessionID,
                TaskID : parseInt(item.taskID),
                MobileSubSessionID : item.mobileSubSessionID,
                GangId : parseInt(item.gangId),
                RegistrationNumber : item.registrationNumber
            }
            arr.push(convertedData)
        });
        const model ={
            UpdateList : arr,
            PayPointID : parseInt(amendmentList.payPointID),
            ModifiedBy : parseInt(tokenDecoder.getUserIDFromToken()),
            GardenID : parseInt(amendmentList.gardenID)
        }
        const result = await services.UpdatePluckingAmendmentData(model)
        if (result.statusCode == "Success") {
            alert.success(result.message);
            setAmendment([])
            setAmendmentList({
                ...amendmentList,
                groupID: 0,
                gardenID: 0,
                payPointID: 0,
                date: new Date(),
                registrationNumber: '',
            })
        }          
        else {
            alert.error(result.message);
        }
    }

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWPLUCKINGAMENDMENT');

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
        trackPromise(getAllGroups())
    }

    async function getAllGroups() {
        const result = await services.getAllGroups();
        setGroups(result);
    }
    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(amendmentList.groupID);
        setGardens(response);
    };
    async function GetDivisionDetailsByGroupID() {
        const result = await services.GetDivisionDetailsByGroupID(amendmentList.groupID);
        setPayPoints(result);
    }
    async function getPluckingTaskNamesByPayPointID() {
        const task = await services.getPluckingTaskNamesByPayPointID(amendmentList.payPointID);
        const taskArray = []
        for (let item of Object.entries(task)) {
            taskArray[item[1]["taskID"]] = item[1]["taskName"];
        }
        setTask(taskArray);
    }
    async function getFieldDetailsByDivisionID() {
        var field = await services.getFieldDetailsByDivisionID(amendmentList.payPointID);
        const fieldArray = []
        for (let item of Object.entries(field)) {
            fieldArray[item[1]["fieldID"]] = item[1]["fieldName"];
        }
        setFields(fieldArray);
    };
    
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
        setAmendmentList({
            ...amendmentList,
            [e.target.name]: value
        });
    }
    function handleDateChange(value) {
        setAmendmentList({
        ...amendmentList,
        date: moment(value).format('YYYY-MM-DD')
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
                            isEdit={true}
                            toolTiptitle={"Plucking Amendment"}
                        />
                </Grid>
            </Grid>
        )
    }

    return (
        <Page
            className={classes.root}
            title="Plucking Amendment"
        >
            <Container maxWidth={false}>
                <LoadingComponent />
                <Formik
                    initialValues={{
                        groupID: amendmentList.groupID,
                        gardenID: amendmentList.gardenID,
                        payPointID: amendmentList.payPointID,
                        date: amendmentList.date,
                        registrationNumber: amendmentList.registrationNumber,
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().min(1, 'Business Division is required').required('Business Division is required'),
                            gardenID: Yup.number().min(1, 'Location is required').required('Location is required'),
                            payPointID: Yup.number().required('Pay Point is required').min("1", 'Pay Point is required'),
                            date: Yup.date().required('Date is required').typeError('Date is required'),
                            registrationNumber: Yup.string().required('Registration Number is required'),
                        })
                    }
                    onSubmit={() => trackPromise(getPluckingAmendmentData())}
                    enableReinitialize
                >
                    {({
                        errors,
                        handleBlur,
                        handleSubmit,
                        touched,
                        values
                    }) => (
                        <form onSubmit={handleSubmit}>
                            <Box mt={0}>
                                <Card>
                                    <CardHeader
                                        title={cardTitle("Plucking Amendment")}
                                    />
                                    <PerfectScrollbar>
                                        <Divider />
                                        <CardContent style={{ marginBottom: "0.5rem" }}>
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
                                                            value={amendmentList.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            size='small'
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
                                                            value={amendmentList.gardenID}
                                                            variant="outlined"
                                                            id="gardenID"
                                                            size='small'
                                                            InputProps={{
                                                                readOnly: !permissionList.isFactoryFilterEnabled ? true : false
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
                                                            value={amendmentList.payPointID}
                                                            variant="outlined"
                                                            id="payPointID"
                                                            size='small'
                                                            onBlur={handleBlur}
                                                        >
                                                            <MenuItem value="0">--Select Pay Point--</MenuItem>
                                                            {generateDropDownMenu(payPoints)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="date">Date *</InputLabel>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <KeyboardDatePicker
                                                                error={Boolean(touched.date && errors.date)}
                                                                helperText={touched.date && errors.date}
                                                                fullWidth
                                                                variant="inline"
                                                                format="yyyy/MM/dd"
                                                                margin="dense"
                                                                name='date'
                                                                id='date'
                                                                size='small'
                                                                value={amendmentList.date}
                                                                onBlur={handleBlur}
                                                                onChange={(e) => handleDateChange(e)}
                                                                KeyboardButtonProps={{
                                                                    'aria-label': 'change date',
                                                                }}
                                                                autoOk
                                                                maxDate={ new Date()}
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>
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
                                                                value={amendmentList.registrationNumber}
                                                                variant="outlined"
                                                                id="registrationNumber"
                                                                onBlur={handleBlur}
                                                            >
                                                            </TextField>
                                                        </Grid>
                                                </Grid>
                                            <Box display="flex" flexDirection="row-reverse" p={2} >
                                                <Button
                                                    color="primary"
                                                    type="submit"
                                                    variant="contained"
                                                >
                                                    Search
                                                </Button>
                                            </Box>
                                        </CardContent>
                                         {amendment.length > 0?
                                            <Box>
                                                <EditableTable task={task} fields={fields} data={amendment} setData={setAmendment}/>
                                            </Box>: ''
                                        }
                                    </PerfectScrollbar>
                                    <br/>
                                    {amendment.length>0?
                                    <Grid container justify="flex-end">
                                        <Box pr={2}>
                                            <Button
                                                color="primary"
                                                variant="contained"
                                                type="button"
                                                onClick={() => trackPromise(UpdatePluckingAmendmentData())}
                                            >
                                                UPDATE
                                            </Button>
                                        </Box>
                                    </Grid>
                                    :null}
                                    <br/>
                                </Card>
                            </Box>
                        </form>
                    )}
                </Formik>
            </Container>
        </Page>
    );
};