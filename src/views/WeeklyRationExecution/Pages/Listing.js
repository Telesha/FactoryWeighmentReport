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
    MenuItem
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
import { useAlert } from "react-alert";
import { confirmAlert } from 'react-confirm-alert';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import moment from 'moment';
import tokenDecoder from '../../../utils/tokenDecoder';

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

const screenCode = "RATIONEXECUTION";
export default function WeeklyRationExecution() {
    const classes = useStyles();
    const navigate = useNavigate();
    const alert = useAlert();
    const [title, setTitle] = useState("Weekly Ration Execution")
    const isDayDisabled = (date) => {
        if (enabledDay === null) {
            return true; // Disable all dates until the enabled day is fetched
        }
        return date.getDay() !== enabledDay;
    };
    const curr = new Date;
    const first = curr.getDate() - curr.getDay();
    const last = first;
    const friday = first + 5;
    const lastday = new Date(curr.setDate(last)).toISOString().substr(0, 10);
    const friday1 = new Date(curr.setDate(friday)).toISOString().substr(0, 10);

    const [enabledDay, setEnabledDay] = useState(0);//Sunday is 0, Monday is 1, and so on up to Saturday, which is 6.
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
        date: lastday,
        toDate: friday1,
    })
    const [paymentDetails, setDailyPaymentDetails] = useState();
    const [isActive, setIsActive] = useState(false)
    const [factories, setFactories] = useState();
    const [divisions, setDivisions] = useState();
    const [fields, setFields] = useState();;
    const [groups, setGroups] = useState();
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });

    const currentProps = {
        border: 3,
        style: { width: '50rem', height: '12rem' },
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
        trackPromise(getEstateDetailsByGroupID())
    }, [searchData.groupID])

    useEffect(() => {
        trackPromise(getFieldDetailsByDivisionID())
    }, [searchData.divisionID])

    useEffect(() => {
        trackPromise(getDivisionsForDropDown())
    }, [searchData.estateID])

    useEffect(() => {
        setDailyPaymentDetails([]);
        setIsActive(false)
        calculateToDate();
    }, [searchData.date])

    useEffect(() => {
        trackPromise(getFieldDetailsByDivisionID())
    }, [searchData.date])

    useEffect(() => {
        trackPromise(GetWeeklyPaymentMasterByEstateID())
    }, [searchData.estateID], [searchData.groupID]);


    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWRATIONEXECUTION');

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
        trackPromise(getGroupsForDropdown())
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

    function handleDateChange(value) {
        setSearchData({
            ...searchData,
            date: value
        });
    }

    function calculateToDate() {
        const calDate = new Date(searchData.date);
        calDate.setDate(calDate.getDate() + 6);
        setSearchData({
            ...searchData,
            toDate: calDate
        });
    }

    async function calculateRation() {

        const model = {
            fromDate: searchData.date,
            operationEntityID: parseInt(searchData.estateID),
            costCenterID: parseInt(searchData.divisionID),
            createdBy: tokenDecoder.getUserIDFromToken(),
        }
        var salaryCalculation = await services.calculateRation(model)
        await timeout(4000);
        if (salaryCalculation) {
            alert.success("Ration Execution Successfull");
        }
        else {
            alert.error("Error Occurred in Ration Execution");
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
            title: 'Weekly Ration',
            message: 'Are you sure you want to do this.',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => trackPromise(calculateRation())
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

    async function GetWeeklyPaymentMasterByEstateID() {
        // var response = await services.GetWeeklyPaymentMasterByEstateID(searchData.estateID);
        // setStartDay(response.startDay);
        // setEnabledDay(response.startDayID);
        // setHoliday(response.holiday);
    };
 

    return (
        <Page className={classes.root} title={title}>
            <Container maxWidth={false}>
                <LoadingComponent />
                <Formik
                    initialValues={{
                        groupID: searchData.groupID,
                        estateID: searchData.estateID,
                        divisionID: searchData.divisionID,
                        date: searchData.date,
                        toDate: searchData.toDate,
                        IsPlucking: searchData.isPlucking,
                        haverstingJobTypeID: searchData.haverstingJobTypeID,
                        employeeTypeID: searchData.employeeTypeID,
                        taskSubCode: searchData.taskSubCode,
                        fieldID: searchData.fieldID,
                        jobTypeID: searchData.jobTypeID,
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Business Division is required').min("1", 'Select a Business Division'),
                            date: Yup.date().required('Date is required'),
                        })
                    }

                    enableReinitialize
                >
                    {({
                        errors,
                        handleBlur,
                        handleSubmit,
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
                                                    onChange={(e) => handleChangeForm(e)}
                                                    value={searchData.groupID}
                                                    variant="outlined"
                                                    id="groupID"
                                                    size='small'
                                                    InputProps={{
                                                        readOnly: !permissionList.isGroupFilterEnabled ? true : false,
                                                    }}
                                                >
                                                    <MenuItem value="0">--Select Business Division--</MenuItem>
                                                    {generateDropDownMenu(groups)}
                                                </TextField>
                                            </Grid>
                                            <Grid item md={3} xs={12}>
                                                <InputLabel shrink id="estateID">
                                                    Location
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
                                                        readOnly: !permissionList.isFactoryFilterEnabled ? true : false,
                                                    }}

                                                >
                                                    <MenuItem value="0">--Select Location--</MenuItem>
                                                    {generateDropDownMenu(factories)}
                                                </TextField>
                                            </Grid>
                                            <Grid item md={3} xs={12}>
                                                <InputLabel shrink id="divisionID">
                                                    Sub Division
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
                                            <Grid item md={3} xs={12}>
                                                <InputLabel shrink id="date">
                                                    Date *
                                                </InputLabel>
                                                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                    <KeyboardDatePicker
                                                        error={Boolean(touched.date && errors.date)}
                                                        helperText={touched.date && errors.date}
                                                        onBlur={handleBlur}
                                                        autoOk
                                                        fullWidth
                                                        variant="inline"
                                                        format="dd/MM/yyyy"
                                                        margin="dense"
                                                        id="date"
                                                        value={searchData.date}
                                                        shouldDisableDate={isDayDisabled}
                                                        onChange={(e) => {
                                                            handleDateChange(e);

                                                        }}
                                                        KeyboardButtonProps={{
                                                            'aria-label': 'change date',
                                                        }}
                                                    />
                                                </MuiPickersUtilsProvider>
                                            </Grid>


                                        </Grid>
                                    </CardContent>
                                    <Divider />
                                    <CardContent>
                                        <Grid container alignItems="center" justify="center">
                                            <Box border={1} borderRadius={16} borderColor="green" {...currentProps} style={{ marginTop: "3rem", marginLeft: "5rem", marginRight: '5rem' }}>
                                                <Grid item md={9} xs={12} >
                                                    <CardHeader style={{ marginLeft: '8.5rem' }} titleTypographyProps={{ variant: 'h2' }}
                                                        title="Weekly Ration Execution"
                                                    />
                                                </Grid>
                                                <Grid container spacing={6} alignItems="center" justify="center">
                                                    <Grid item md={4} xs={6}>
                                                        <CardHeader style={{ marginLeft: '2rem', marginTop: '-1rem' }} titleTypographyProps={{ variant: 'h5' }}
                                                            title="Week"
                                                        />
                                                        <TextField
                                                            error={Boolean(touched.currentYear && errors.currentYear)}
                                                            fullWidth
                                                            helperText={touched.currentYear && errors.currentYear}
                                                            name="currentYear"
                                                            onBlur={handleBlur}
                                                            value={moment(searchData.date).format('YYYY-MM-DD')}
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
                                                                onClick={CalculateSalary}
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