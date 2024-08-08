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
import { useNavigate } from 'react-router-dom';
import { LoadingComponent } from '../../../utils/newLoader';
import tokenDecoder from '../../../utils/tokenDecoder';
import { useAlert } from "react-alert";
import { confirmAlert } from 'react-confirm-alert';
import moment from 'moment';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";

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

const screenCode = "DAILYRECONCILIATIONEXECUTION";
export default function DailyReconciliationExecution() {
    const classes = useStyles();
    const navigate = useNavigate();
    const alert = useAlert();
    const [title, setTitle] = useState("Daily Reconciliation Execution")
    const [searchData, setSearchData] = useState({
        groupID: '0',
        estateID: '0',
        divisionID: '0',
        isPlucking: false,
        haverstingJobTypeID: '0',
        employeeTypeID: '0',
        taskSubCode: '',
        fieldID: '0',
        jobTypeID: '0',
        payPointID: '0',
        date: moment(new Date().toISOString().substr(0, 10)).format("YYYY-MM-DD")
    })
    const handleDate = (e) => {
        const formattedDate = moment(e).format('YYYY-MM-DD');
        setSearchData(prevState => ({
            ...prevState,
            date: formattedDate
        }));
    };
    const [paymentDetails, setDailyPaymentDetails] = useState();
    const [isPlucking, setIsPlucking] = useState(true)
    const [isActive, setIsActive] = useState(false)
    const [factories, setFactories] = useState();
    const [divisions, setDivisions] = useState();
    const [payPoints, setPayPoints] = useState([]);
    const [fields, setFields] = useState();
    const [empType, setEmpType] = useState();
    const [harvestingJob, setHarvestingJob] = useState();
    const [taskSubCodeData, setTaskSubCodeData] = useState();
    const [taskSubCodeList, setTaskSubCodeList] = useState({
        taskSubCode: ''
    });
    const [groups, setGroups] = useState();
    const [date, setDate] = useState(new Date());
    const [date1, setDate1] = useState();
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });
    const defaultProps = {
        border: 1,
        style: { width: '50rem', height: '10rem' },
    };
    const currentProps = {
        border: 3,
        style: { width: '50rem', height: '12rem' },
    };
    const newProps = {
        border: 1,
        style: { width: '50rem', height: '10rem' },
    };
    const handleClose = () => {
        setOpen(false);
    };
    const [open, setOpen] = React.useState(true);
    useEffect(() => {
        trackPromise(
            getPermission(),
        );
    }, []);

    useEffect(() => {
        trackPromise(getDivisionsForDropDown(), GetHarvestingJobsForDropDown())
    }, [searchData.estateID])

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID(), GetDivisionDetailsByGroupID())
    }, [searchData.groupID])

    useEffect(() => {
        trackPromise(getFieldDetailsByDivisionID())
    }, [searchData.divisionID])

    useEffect(() => {
        setDailyPaymentDetails([]);
        setIsActive(false)
    }, [date])

    useEffect(() => {
        setDailyPaymentDetails([]);
        setIsActive(false)
    }, [searchData.divisionID])

    useEffect(() => {
        setDailyPaymentDetails([]);
        setIsActive(false)
    }, [searchData.haverstingJobTypeID])

    useEffect(() => {
        setDailyPaymentDetails([]);
        setIsActive(false)
    }, [searchData.taskSubCode])

    useEffect(() => {
        setDailyPaymentDetails([]);
        setIsActive(false)
    }, [searchData.fieldID])

    useEffect(() => {
        setDailyPaymentDetails([]);
        setIsActive(false)
    }, [taskSubCodeList.taskSubCode])

    useEffect(() => {
        trackPromise(getAllTaskSubCodesForDropDown())
    }, [date])

    useEffect(() => {
        trackPromise(getFieldDetailsByDivisionID())
    }, [date])

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWDAILYRECONCILIATIONEXECUTION');

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

        setSearchData({
            ...searchData,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            estateID: parseInt(tokenService.getFactoryIDFromToken())
        });

        trackPromise(getEmployeeTypesForDropdown(), getGroupsForDropdown())
    }
    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }
    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(searchData.groupID);
        setFactories(response);
    };

    async function getDivisionsForDropDown() {
        var response = await services.getDivisionDetailsByEstateID(searchData.estateID);
        var generated = generateDropDownMenu(response)
        if (generated.length > 0) {
            setSearchData((searchData) => ({
                ...searchData,
                divisionID: generated[0].props.value,
            }));
        }
        setDivisions(response);
    };

    async function GetDivisionDetailsByGroupID() {
        const response = await services.GetDivisionDetailsByGroupID(searchData.groupID);
        setPayPoints(response);
    };

    async function getEmployeeTypesForDropdown() {
        const types = await services.getEmployeeTypesForDropdown();
        setEmpType(types);
    }
    async function GetHarvestingJobsForDropDown() {
        const result = await services.GetFactoryJobs(searchData.estateID);
        setHarvestingJob(result);
    }
    async function getAllTaskSubCodesForDropDown() {
        const subTaskCodes = await services.getAllTaskSubCodesForDropDown(searchData.date);
        setTaskSubCodeData(subTaskCodes);
    }
    async function getFieldDetailsByDivisionID() {
        var response = await services.getFieldDetailsByDivisionID(searchData.divisionID, searchData.date);
        setFields(response);
    };
    function generateDropDownMenu(data) {
        let items = []
        if (data != null) {
            for (const [key, value] of Object.entries(data)) {
                items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
            }
        }
        return items
    }

    function handleChangeForm(e) {
        const target = e.target;
        const value = target.value
        setSearchData({
            ...searchData,
            [e.target.name]: value
        });
    }

    function handleChange(data, e) {
        if (data === undefined || data === null) {
            setTaskSubCodeList({
                ...taskSubCodeList,
                taskSubCode: '0'
            });
            return;
        } else {
            var valueV = data["taskSubCode"];

            setTaskSubCodeList({
                ...taskSubCodeList,
                taskSubCode: valueV.toString()
            });
        }
    }
    async function getDailyPaymentDetails() {
        const model = {
            groupID: parseInt(searchData.groupID),
            factoryID: parseInt(searchData.estateID),
            divisionID: parseInt(searchData.divisionID),
            date: searchData.date,
            IsPlucking: isPlucking,
            haverstingJobTypeID: parseInt(searchData.haverstingJobTypeID),
            employeeTypeID: parseInt(searchData.employeeTypeID),
            taskSubCode: searchData.taskSubCode == "0" ? "" : searchData.taskSubCode,
            fieldID: parseInt(searchData.fieldID),
            jobTypeID: parseInt(searchData.jobTypeID),
        }
        const paymentDetails = await services.getDailyPaymentDetails(model)
        if (paymentDetails.length > 0) {
            setIsActive(true);
            setDate1(date.toISOString().split('T', 1));
        }
        setDailyPaymentDetails(paymentDetails)
    }

    async function calculateWages() {

        const dataArray = [];
        const model = {
            PluckingDate: searchData.date,
            CreatedBy: parseInt(tokenDecoder.getUserIDFromToken()),
            GroupID: parseInt(searchData.groupID),
            FactoryID: parseInt(searchData.estateID),
            DivisionID: parseInt(searchData.divisionID),
            jobTypeID: parseInt(searchData.jobTypeID),
            payPointID: parseInt(searchData.payPointID)
        }
        dataArray.push(model)
        var salaryCalculation = await services.calculateWages(dataArray)
        await timeout(4000);
        if (salaryCalculation) {
            alert.success("Recinciliation Execution Successfully");
        }
        else {
            alert.error("Error Occurred in Recinciliation Execution");
        }
    }

    function timeout(delay) {
        return new Promise(res => setTimeout(res, delay));
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

    function CalculateSalary() {
        confirmAlert({
            title: 'Daily Reconciliation',
            message: 'Are you sure you want to do this.',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => trackPromise(calculateWages())
                },
                {
                    label: 'No',
                    onClick: () => handleClose()
                }
            ],
            closeOnEscape: true,
            closeOnClickOutside: true,
        });
    }
    return (
        <Page className={classes.root} title={title}>
            <Container maxWidth={false}>
                <LoadingComponent />
                <Formik
                    initialValues={{
                        groupID: searchData.groupID,
                        estateID: searchData.estateID,
                        divisionID: searchData.divisionID,
                        date: moment(searchData.date, 'yyyy-MM-dd'),
                        IsPlucking: searchData.isPlucking,
                        haverstingJobTypeID: searchData.haverstingJobTypeID,
                        employeeTypeID: searchData.employeeTypeID,
                        taskSubCode: searchData.taskSubCode,
                        fieldID: searchData.fieldID,
                        jobTypeID: searchData.jobTypeID,
                        payPointID: searchData.payPointID
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Business Division is required').min("1", 'Select a Business Division'),
                            estateID: Yup.number().required('Location is required').min("1", 'Select a Location'),
                            divisionID: Yup.number().required('Sub Division is required').min("1", 'Select a Sub Division'),
                            date: Yup.date().required('Date is required'),
                            jobTypeID: Yup.number().required('Job Type is required').min("1", 'Select a Job Type'),
                            payPointID: Yup.number().required('Pay Point is required').min("1", 'Select a Pay Point')
                        })
                    }
                    onSubmit={() => CalculateSalary()}
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
                                    <Divider />
                                    <CardContent >
                                        <Grid container spacing={3}>
                                            <Grid item md={4} xs={8}>
                                                <InputLabel shrink id="groupID">
                                                    Business Division  *
                                                </InputLabel>
                                                <TextField select
                                                    error={Boolean(touched.groupID && errors.groupID)}
                                                    fullWidth
                                                    helperText={touched.groupID && errors.groupID}
                                                    name="groupID"
                                                    onBlur={handleBlur}
                                                    onChange={(e) => handleChangeForm(e)}
                                                    value={searchData.groupID}
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
                                            <Grid item md={4} xs={8}>
                                                <InputLabel shrink id="estateID">
                                                    Location *
                                                </InputLabel>
                                                <TextField select
                                                    error={Boolean(touched.estateID && errors.estateID)}
                                                    fullWidth
                                                    helperText={touched.estateID && errors.estateID}
                                                    name="estateID"
                                                    onBlur={handleBlur}
                                                    onChange={(e) => handleChangeForm(e)}
                                                    value={searchData.estateID}
                                                    variant="outlined"
                                                    id="estateID"
                                                    size='small'
                                                    InputProps={{
                                                        readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                    }}
                                                >
                                                    <MenuItem value="0">--Select Location--</MenuItem>
                                                    {generateDropDownMenu(factories)}
                                                </TextField>
                                            </Grid>
                                            <Grid item md={4} xs={12}>
                                                <InputLabel shrink id="divisionID">
                                                    Sub Division *
                                                </InputLabel>
                                                <TextField select fullWidth
                                                    error={Boolean(touched.divisionID && errors.divisionID)}
                                                    helperText={touched.divisionID && errors.divisionID}
                                                    size='small'
                                                    onBlur={handleBlur}
                                                    id="divisionID"
                                                    name="divisionID"
                                                    value={searchData.divisionID}
                                                    type="text"
                                                    variant="outlined"
                                                    onChange={(e) => handleChangeForm(e)}
                                                >
                                                    <MenuItem value='0'>--Select Sub Division--</MenuItem>
                                                    {generateDropDownMenu(divisions)}
                                                </TextField>
                                            </Grid>
                                            <Grid item md={4} xs={12}>
                                                <InputLabel shrink id="payPointID">
                                                    Pay Point *
                                                </InputLabel>
                                                <TextField select fullWidth
                                                    error={Boolean(touched.payPointID && errors.payPointID)}
                                                    helperText={touched.payPointID && errors.payPointID}
                                                    size='small'
                                                    onBlur={handleBlur}
                                                    id="payPointID"
                                                    name="payPointID"
                                                    value={searchData.payPointID}
                                                    type="text"
                                                    variant="outlined"
                                                    onChange={(e) => handleChangeForm(e)}
                                                // InputProps={{
                                                //     readOnly: isExecuteButtonHide ? true : false,
                                                // }}
                                                >
                                                    <MenuItem value='0'>--Select Pay Point--</MenuItem>
                                                    {generateDropDownMenu(payPoints)}
                                                </TextField>
                                            </Grid>
                                            <Grid item md={4} xs={8}>
                                                <InputLabel shrink id="date">
                                                    Date *
                                                </InputLabel>
                                                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                        <KeyboardDatePicker
                                                        
                                                            error={Boolean(touched.date && errors.date)}
                                                            fullWidth
                                                            helperText={touched.date && errors.date}
                                                            variant="outlined"
                                                            format="yyyy-MM-dd"
                                                            margin="dense"
                                                            name='date'
                                                            id='date'
                                                            size='small'
                                                            value={moment(searchData.date, 'YYYY-MM-DD')}
                                                            onChange={(e) =>  {
                                                                handleDate(e)
                                                                
                                                            }}
                                                            KeyboardButtonProps={{
                                                                'aria-label': 'change date',
                                                            }}
                                                            autoOk
                                                        />
                                                    </MuiPickersUtilsProvider>
                                            </Grid>

                                            <Grid item md={4} xs={8}>
                                                <InputLabel shrink id="jobTypeID">
                                                    Job Type *
                                                </InputLabel>
                                                <TextField select
                                                    error={Boolean(touched.jobTypeID && errors.jobTypeID)}
                                                    fullWidth
                                                    helperText={touched.jobTypeID && errors.jobTypeID}
                                                    name="jobTypeID"
                                                    onBlur={handleBlur}
                                                    onChange={(e) => handleChangeForm(e)}
                                                    value={searchData.jobTypeID}
                                                    variant="outlined"
                                                    id="jobTypeID"
                                                    size='small'
                                                >
                                                    <MenuItem value='0'>--Select Job Type--</MenuItem>
                                                    <MenuItem value="1">Plucking</MenuItem>
                                                    <MenuItem value="2">Non Plucking</MenuItem>
                                                </TextField>
                                            </Grid>

                                        </Grid>
                                    </CardContent>

                                    <Divider />
                                    <CardContent>
                                        <Grid container alignItems="center" justify="center">
                                            <Box border={1} borderRadius={16} borderColor="green" {...currentProps} style={{ marginTop: "3rem", marginLeft: "5rem", marginRight: '5rem' }}>
                                                <Grid item md={9} xs={12} >
                                                    <CardHeader style={{ marginLeft: '8.5rem' }} titleTypographyProps={{ variant: 'h2' }}
                                                        title="Reconciliation Execution"
                                                    />
                                                </Grid>
                                                <Grid container spacing={6} alignItems="center" justify="center">
                                                    <Grid item md={4} xs={6}>
                                                        <CardHeader style={{ marginLeft: '2rem', marginTop: '-1rem' }} titleTypographyProps={{ variant: 'h5' }}
                                                            title="Date"
                                                        />
                                                        <TextField
                                                            error={Boolean(touched.currentYear && errors.currentYear)}
                                                            fullWidth
                                                            helperText={touched.currentYear && errors.currentYear}
                                                            name="currentYear"
                                                            onBlur={handleBlur}
                                                            onChange={handleChange}
                                                            value={isPlucking ? searchData.date : searchData.date}
                                                            InputProps={{
                                                                readOnly: true,
                                                                style: { fontSize: 25, fontStyle: "initial", textAlign: "right", marginLeft: '0rem' },
                                                                disableUnderline: true
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item md={6} xs={12}>
                                                        <CardHeader style={{ marginLeft: '6rem', marginTop: '0.7rem' }} titleTypographyProps={{ variant: 'h6' }}
                                                            title=""
                                                        />
                                                        <Box display="flex" justifyContent="flex-end" p={2}>
                                                            <Button
                                                                fullWidth="true"
                                                                size="large"
                                                                color="primary"
                                                                type="submit"
                                                                id="btnRecord"
                                                                variant="contained"
                                                                className={
                                                                    classes.colorApprove
                                                                }
                                                                style={{ marginLeft: '5rem' }}
                                                            >
                                                                Start
                                                            </Button>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Box>
                        </form>
                    )}
                </Formik>
            </Container>
        </Page>
    )
}