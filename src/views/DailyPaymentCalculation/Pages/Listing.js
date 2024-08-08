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
    Switch,
    Typography
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
import MaterialTable from 'material-table';
import Dialog from '@material-ui/core/Dialog';
import CircularProgress from '@material-ui/core/CircularProgress';
import moment from 'moment';
import { CustomMultiSelect } from 'src/utils/CustomMultiSelect';
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

const screenCode = "DAILYPAYMENTCALCULATION";
export default function DailyPaymentCalculation() {
    const classes = useStyles();
    const navigate = useNavigate();
    const alert = useAlert();
    const [title, setTitle] = useState("Daily Payment Calculation")
    const [permissionList, setPermissions] = useState({
        isFactoryFilterEnabled: false,
    });
    const [searchData, setSearchData] = useState({
        groupID: '0',
        estateID: '0',
        divisionID: '0',
        haverstingJobTypeID: '0',
        employeeTypeID: "0",
        employeeSubCategoryMappingID: '0',
        taskSubCode: '',
        fieldID: '0',
        date: moment(new Date().toISOString().substr(0, 10)).format("YYYY-MM-DD"),
        jobType: '0'
    })
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: '',
        estateName: '',
        divisionName: '',
        employeeType: ''
    })
    const [paymentDetails, setDailyPaymentDetails] = useState([]);
    const [isPlucking, setIsPlucking] = useState(false)
    const [isActive, setIsActive] = useState(false);
    const [factories, setFactories] = useState();
    const [divisions, setDivisions] = useState();
    const [fields, setFields] = useState();
    const [employeeSubCategoryMapping, setEmployeeSubCategoryMapping] = useState([]);
    const [empType, setEmpType] = useState();
    const [harvestingJob, setHarvestingJob] = useState();
    const [taskSubCodeData, setTaskSubCodeData] = useState();
    const [openOne, setOpenOne] = useState(false);
    const [openTwo, setOpenTwo] = useState(false);
    const [openThree, setOpenThree] = useState(false);
    const [isButtonHide, setIsButtonHide] = useState(false);
    const [isExecuteButtonHide, setIsExecuteButtonHide] = useState(false);
    const [checkDetails, setCheckDetails] = useState({
        leave: 0,
        nonPluckingAttendance: 0,
        pluckingAttendance: 0,
        crossJobAttendance: 0,
        DailyRecords: 0,
        OutsiderDailyRecords: 0
    });
    const [taskSubCodeList, setTaskSubCodeList] = useState({
        taskSubCode: ''
    });
    const [groups, setGroups] = useState();
    const [date, setDate] = useState(new Date());
    const [date1, setDate1] = useState();
    const [weekOffday, setWeekOffday] = useState();
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [isPluckingSeason, setIsPluckingSeason] = useState(false);
    const [isEntireWeekRun, setIsEntireWeekRun] = useState(false);
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
    const [selectedOptions4, setSelectedOptions4] = useState([]);
    const getOptionLabel4 = option => `${option.label}`;
    const getOptionDisabled4 = option => option.value === "foo";
    const handleToggleOption4 = selectedOptions =>
        setSelectedOptions4(selectedOptions);
    const handleClearOptions4 = () => setSelectedOptions4([]);
    const handleSelectAll4 = isSelected => {
        if (isSelected) {
            setSelectedOptions4(employeeSubCategoryMapping);
        } else {
            handleClearOptions4();
        }
    };
    const handleClose = () => {
        setOpen(false);
    };
    const [open, setOpen] = React.useState(true);

    const handleCloseDialogTwo = () => {
        setOpenTwo(false);
        setIsButtonHide(false);
    };

    const handleCloseDialogThr = () => {
        setOpenTwo(false);
        setIsButtonHide(false);
    }

    const handleCloseDialogThree = () => {
        setOpenThree(false);
    };

    useEffect(() => {
        trackPromise(
            getPermission(),
        );
    }, []);

    useEffect(() => {
        trackPromise(GetHarvestingJobsForDropDown())
        if (searchData.estateID > 0) {
            trackPromise(GetWeekHolidayDetails(), GetCurrentSalaryWeek())
        }
    }, [searchData.estateID])

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID(), GetDivisionDetailsByGroupID());
        setSearchData({
            ...searchData,
            estateID: '0',
            divisionID: '0'
        })
    }, [searchData.groupID])

    useEffect(() => {
        if (searchData.divisionID != 0) {
            let model = {
                divisionID: parseInt(searchData.divisionID),
            }
            getSelectedDivisionValueForCard(model);
            trackPromise(getFieldDetailsByDivisionID())
        }
    }, [searchData.divisionID])

    useEffect(() => {
        if (searchData.divisionID != 0 && startDate != null) {

            trackPromise(CheckPluckingSeason())
        }
    }, [searchData.divisionID])

    // useEffect(() => {
    //     if (searchData.employeeSubCategoryMappingID != 0) {
    //         let model = {
    //             employeeSubCategoryMappingID: parseInt(searchData.employeeSubCategoryMappingID),
    //         }
    //         getSelectedEmpTypeValuesForCard(model);
    //     }
    // }, [searchData.employeeSubCategoryMappingID])

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
        setSearchData({
            ...searchData,
            employeeTypeID: '0',
            employeeSubCategoryMappingID: '0'
        })
        setSelectedOptions4([]);
        if (searchData.jobType == 2) {
            setIsActive(true)
        }
        else {
            setIsActive(false)
        }
    }, [searchData.jobType])

    useEffect(() => {
        setDailyPaymentDetails([]);
        if (searchData.jobType == 1) {
            setIsActive(false)
        }
    }, [selectedOptions4])

    useEffect(() => {
        trackPromise(getAllTaskSubCodesForDropDown())
    }, [date])

    const columns = [
        // { title: 'Harvesting Job', field: 'haverstingJobTypeName', editable: 'never' },
        { title: 'Emp Type', field: 'employeeTypeName', editable: 'never' },
        { title: 'Emp Sub Category', field: 'employeeSubCategoryName', editable: 'never' },
        { title: 'Kamjari Sub Code', field: 'taskSubCode', editable: 'never', },
        { title: 'Section', field: 'fieldName', editable: 'never', },
        { title: 'Target', field: 'target', cellStyle: { color: '##032341', fontWeight: 'bold' }, editable: 'always' },
        { title: 'Max Target', field: 'maxMeasuringQuantity', cellStyle: { color: '##032341', fontWeight: 'bold' }, editable: 'always' },
        { title: 'Base Rate', field: 'baseRate', editable: 'never' },
        { title: 'Less Rate', field: 'lessRate', cellStyle: { color: '##032341', fontWeight: 'bold' }, editable: 'always' },
        { title: 'Over Rate', field: 'overRate', cellStyle: { color: '##032341', fontWeight: 'bold' }, editable: 'always' },
    ];

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWDAILYPAYMETDETAILS');

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

        trackPromise(getEmployeeTypesForDropdown(), getGroupsForDropdown(), GetAllEmployeeSubCategoryMapping())
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }
    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(searchData.groupID);
        setFactories(response);
    };

    async function GetDivisionDetailsByGroupID() {
        var response = await services.GetDivisionDetailsByGroupID(searchData.groupID);
        const elementCount = response.reduce((count) => count + 1, 0);
        var generated = generateDropDownMenuWithTwoValues(response)
        if (elementCount === 1) {
            setSearchData((prevState) => ({
                ...prevState,
                divisionID: generated[0].props.value,
            }));
        }
        setDivisions(response);
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

    async function GetAllEmployeeSubCategoryMapping() {
        const response = await services.GetAllEmployeeSubCategoryMapping();
        let newOptionArray = [];
        for (var i = 0; i < response.length; i++) {
            newOptionArray.push({
                label: response[i].employeeSubCategoryName,
                value: response[i].employeeSubCategoryMappingID,
                employeeTypeID: response[i].employeeTypeID
            })
        }
        setEmployeeSubCategoryMapping(newOptionArray)
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
                items.push(<MenuItem key={key} value={key}>{value.name}</MenuItem>);
            }
        }
        return items
    }

    function onIsPlucking(e) {
        const target = e.target;
        const value = target.value
        setSearchData({
            ...searchData,
            [e.target.name]: value
        });
        if (value == 1) {
            setIsPlucking(true);
        }
        else {
            setIsPlucking(false);
        }
    }

    function handleChangeForm(e) {
        const target = e.target;
        const value = target.value
        if (e.target.name == "divisionID") {
            const found = divisions.find((x, i) => i == value)
            setSearchData((prevState) => ({
                ...prevState,
                estateID: found == undefined ? '0' : found.id,
                divisionID: value
            }));
        }
        else if (e.target.name == "employeeSubCategoryMappingID") {
            const found = employeeSubCategoryMapping.find((x, i) => i == value)
            setSearchData((prevState) => ({
                ...prevState,
                employeeTypeID: found == undefined ? '0' : found.id,
                employeeSubCategoryMappingID: value
            }));
        }
        else {
            setSearchData({
                ...searchData,
                [e.target.name]: value
            });
        }
    }

    // function handleDate(e){
    //     setSearchData({...searchData, date: moment(e, 'YYYY-MM-DD').toISOString()})
    // }

    const handleDate = (e) => {
        const formattedDate = moment(e).format('YYYY-MM-DD');
        setSearchData(prevState => ({
            ...prevState,
            date: formattedDate
        }));
    };

    async function CheckCrossJob() {
        if (searchData.estateID != 0 && searchData.divisionID != 0) {
            let model = {
                estateID: parseInt(searchData.estateID),
                divisionID: parseInt(searchData.divisionID),
                date: searchData.date
            }
            const response = await services.executeCrossJob(model);
            if (response.statusCode == "Success") {
                alert.success(response.message);;
                setIsExecuteButtonHide(true);
            }
            else {
                alert.error(response.message);
            }
        }
    }

    async function onClearData() {
        setIsExecuteButtonHide(false)
        setSearchData({
            ...searchData,
            divisionID: '0',
            date: '',
            haverstingJobTypeID: '0',
            employeeTypeID: '0',
            taskSubCode: '',
            fieldID: '0',
            jobType: '0'
        });
        setIsPlucking(true);
        setIsActive(false);
    }

    async function getDailyPaymentDetails() {
        const model = {
            groupID: parseInt(searchData.groupID),
            factoryID: parseInt(searchData.estateID),
            payPointID: parseInt(searchData.divisionID),
            date: searchData.date,
            IsPlucking: isPlucking,
            haverstingJobTypeID: parseInt(searchData.haverstingJobTypeID),
            employeeTypeID: parseInt(searchData.employeeTypeID),
            employeeSubCategoryMappingID: parseInt(searchData.employeeSubCategoryMappingID),
            employeeDetails: selectedOptions4,
            taskSubCode: searchData.taskSubCode == "0" ? "" : searchData.taskSubCode,
            fieldID: parseInt(searchData.fieldID)
        }
        const paymentDetails = await services.getDailyPaymentDetails(model)
        if (paymentDetails.length > 0) {
            setIsActive(true);
            setDate1(date.toISOString().split('T', 1));
        }
        setDailyPaymentDetails(paymentDetails)
    }

    // async function updateDailyPaymentDetails() {
    //     setDailyPaymentDetails({
    //         ...paymentDetails,
    //         createdBy: tokenService.getUserIDFromToken()
    //     })
    //     var result = await services.updateDailyPaymentDetails(paymentDetails)
    //     if (result.statusCode == "Success") {
    //         alert.success(result.message);
    //     } else {
    //         alert.error(result.message);
    //     }
    //     setDailyPaymentDetails();
    //     getDailyPaymentDetails();
    // }

    async function CalculateSalary(params) {
        if (selectedOptions4.length != 0 && searchData.divisionID != 0) {
            var response = await services.checkDetailsBeforeRunSalary(searchData.date, searchData.estateID, searchData.divisionID,
                selectedOptions4.map(x => x.employeeTypeID).join(','), selectedOptions4.map(x => x.value).join(','))
            setCheckDetails(response)
            setOpenTwo(true);
            if (isPlucking == true) {
                if (response.leave != 0 || response.pluckingAttendance == 0) {
                    setIsButtonHide(true)
                }
            }
            else if (isPlucking == false && searchData.jobType == 2) {
                if (response.leave != 0 || response.nonPluckingAttendance == 0) {
                    setIsButtonHide(true)
                }
            }
            else {
                if (response.leave != 0 || response.crossJobAttendance == 0) {
                    setIsButtonHide(true)
                }
            }
        }
    }

    async function calculateWages() {
        if (isPlucking) {
            const dataArray = [];
            paymentDetails.forEach(paymentDetail => {
                const model = {
                    employeeTypeID: paymentDetail.employeeTypeID,
                    employeeSubCategoryMappingID: paymentDetail.employeeSubCategoryMappingID,
                    harvestJobTypeID: paymentDetail.harvestingJobMasterID,
                    fieldID: paymentDetail.fieldID,
                    subTaskCode: paymentDetail.taskSubCode,
                    pluckingDate: searchData.date,
                    createdBy: paymentDetail.createdBy,
                    createdBy: tokenDecoder.getUserIDFromToken(),
                    isPlucking: isPlucking,
                    estateID: parseInt(searchData.estateID),
                    divisionID: parseInt(searchData.divisionID)
                }
                dataArray.push(model)
            })
            var checkPreviouspaymentComplete = await services.checkPreviouspaymentComplete(searchData.date, searchData.estateID, searchData.divisionID)
            if (checkPreviouspaymentComplete.data > 0) {
                setOpenOne(true)
                var salaryCalculation = await services.calculateWages(dataArray)
                await timeout(10000);
                if (salaryCalculation) {
                    alert.success("Salary Calculation Successfully");
                    setOpenOne(false)
                }
                else {
                    setOpenOne(false)
                    alert.error("Error Occurred in Salary Calculation");
                }
            }
            else {
                setOpenThree(true)
            }
        }
        else {
            const dataArray = [];
            selectedOptions4.forEach(x => {
                let nonModel = {
                    pluckingDate: searchData.date,
                    createdBy: tokenDecoder.getUserIDFromToken(),
                    employeeTypeID: parseInt(x.employeeTypeID),
                    employeeSubCategoryMappingID: parseInt(x.value),
                    isPlucking: isPlucking,
                    estateID: parseInt(searchData.estateID),
                    divisionID: parseInt(searchData.divisionID),
                }
                dataArray.push(nonModel)
            })
            var checkPreviouspaymentComplete = await services.checkPreviouspaymentComplete(searchData.date, searchData.estateID, searchData.divisionID)
            if (checkPreviouspaymentComplete.data > 0) {
                setOpenOne(true)
                if (searchData.jobType == 2) {
                    var nonPluckingSalaryCalculation = await services.calculateNonWages(dataArray)
                    await timeout(10000);
                    if (nonPluckingSalaryCalculation) {
                        alert.success("Salary Calculation Successfully");
                        setOpenOne(false)
                    }
                    else {
                        setOpenOne(false)
                        alert.error("Error Occurred in Salary Calculation");
                    }
                }

                // else if (searchData.jobType == 3) {
                //     var crossJobSalaryCalculation = await services.calculateCrossWages(nonModel)
                //     await timeout(10000);
                //     if (crossJobSalaryCalculation) {
                //         alert.success("Salary Calculation Successfully");
                //         setOpenOne(false)
                //     }
                //     else {
                //         setOpenOne(false)
                //         alert.error("Error Occurred in Salary Calculation");
                //     }
                // }
            }
            else {
                setOpenThree(true)
            }
        }
        setCheckDetails([]);
        setIsButtonHide(false);
    }

    function getSelectedDivisionValueForCard(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            divisionName: divisions[searchForm.divisionID].name,
        })
    }

    function timeout(delay) {
        return new Promise(res => setTimeout(res, delay));
    }

    function getSelectedEmpTypeValuesForCard(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            employeeType: employeeSubCategoryMapping[searchForm.employeeSubCategoryMappingID].name,
        })
    }

    async function GetWeekHolidayDetails() {
        var result = await services.GetWeekHolidayDetails(searchData.date, searchData.estateID);
        if (result.data != null) {
            setWeekOffday(result.data.dayN);
        }
    }

    async function GetCurrentSalaryWeek() {
        var result = await services.GetCurrentSalaryWeek(searchData.estateID);
        if (result != null) {
            setStartDate(result.startDate)
            setEndDate(result.endDate)
        }
        else {
            setStartDate(null)
            setEndDate(null)
        }
    }

    async function CheckPluckingSeason() {
        var result = await services.CheckPluckingSeason(startDate, searchData.estateID, searchData.divisionID);
        if (result) {
            setIsPluckingSeason(true)
        }
        else {
            setIsPluckingSeason(false)
        }

    }

    function offdayOrNot() {
        handleCloseDialogTwo()
        if (moment(searchData.date).format('dddd') == weekOffday) {
            //trackPromise(calculateWagesOffday())
            trackPromise(calculateWages())
        }
        else {
            trackPromise(calculateWages())
        }
    }

    async function calculateWagesOffday() {
        const model = {
            startDate: startDate,
            endDate: endDate,
            offDay: searchData.date,
            jobTypeID: parseInt(2), //nonplucking
            estateID: parseInt(searchData.estateID),
            divisionID: parseInt(searchData.divisionID)
        }
        var result = await services.CheckWhetherEntireWeekSalaryRunExceptOffday(model);
        if (result.statusCode == "Success") {
            if (isPluckingSeason) {
                const model = {
                    startDate: startDate,
                    endDate: endDate,
                    offDay: searchData.date,
                    jobTypeID: parseInt(1), //plucking
                    estateID: parseInt(searchData.estateID),
                    divisionID: parseInt(searchData.divisionID)
                }
                var result2 = await services.CheckWhetherEntireWeekSalaryRunExceptOffday(model);
                if (result2.statusCode == "Success") {
                    setIsEntireWeekRun(true);
                    trackPromise(calculateWages())
                } else {
                    setIsEntireWeekRun(false);
                    alert.error("Please run salary for the entire week before running the offday!");
                }
            } else {
                setIsEntireWeekRun(true);
                trackPromise(calculateWages())
            }
        } else {
            setIsEntireWeekRun(false);
            alert.error("Please run salary for the entire week before running the offday!");
        }
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

    return (
        <Page className={classes.root} title={title}>
            <Container maxWidth={false}>
                <LoadingComponent />
                <Formik
                    initialValues={{
                        groupID: searchData.groupID,
                        divisionID: searchData.divisionID,
                        date: moment(searchData.date, 'yyyy-MM-dd'),
                        haverstingJobTypeID: searchData.haverstingJobTypeID,
                        employeeSubCategoryMappingID: searchData.employeeSubCategoryMappingID,
                        jobType: searchData.jobType,
                        taskSubCode: searchData.taskSubCode,
                        fieldID: searchData.fieldID
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Business Division is required').min("1", 'Select a Business Division'),
                            divisionID: Yup.number().required('Pay Point is required').min("1", 'Select a Pay Point'),
                            //employeeSubCategoryMappingID: Yup.number().required('Employee Sub Category is required').min("1", 'Employee Sub Category is required'),
                            jobType: Yup.number().required('Job Type is required').min("1", 'Job Type is required'),
                            date: Yup.date().required('Date is required'),
                        })
                    }
                    onSubmit={(value) => trackPromise(getDailyPaymentDetails(value))}
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
                                                        readOnly: (!permissionList.isGroupFilterEnabled ? true : false),
                                                    }}
                                                >
                                                    <MenuItem value="0">--Select Business Division--</MenuItem>
                                                    {generateDropDownMenu(groups)}
                                                </TextField>
                                            </Grid>
                                            <Grid item md={4} xs={12}>
                                                <InputLabel shrink id="divisionID">
                                                    Pay Point *
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
                                                // InputProps={{
                                                //     readOnly: isExecuteButtonHide ? true : false,
                                                // }}
                                                >
                                                    <MenuItem value='0'>--Select Pay Point--</MenuItem>
                                                    {generateDropDownMenuWithTwoValues(divisions)}
                                                </TextField>
                                            </Grid>
                                            <Grid item md={4} xs={8}>
                                                <InputLabel shrink id="date">
                                                    Date *
                                                </InputLabel>
                                                {/* <TextField
                                                    error={Boolean(touched.date && errors.date)}
                                                    helperText={touched.date && errors.date}
                                                    fullWidth
                                                    size='small'
                                                    name="date"
                                                    type="date"
                                                    value={moment(searchData.date).format('yyyy-mm-dd')}
                                                    onChange={(e) => handleChangeForm(e)}
                                                    variant="outlined"
                                                    id="date"
                                                // InputProps={{
                                                //     readOnly: isExecuteButtonHide ? true : false,
                                                // }}
                                                /> */}
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
                                                        onChange={(e) => {
                                                            handleDate(e)
                                                        }}
                                                        KeyboardButtonProps={{
                                                            'aria-label': 'change date',
                                                        }}
                                                        autoOk
                                                    />
                                                </MuiPickersUtilsProvider>
                                            </Grid>
                                            {/* {isExecuteButtonHide ? */}
                                            <Grid item md={4} xs={12}>
                                                <InputLabel shrink id="jobType">
                                                    Job Type *
                                                </InputLabel>
                                                <TextField select fullWidth
                                                    error={Boolean(touched.jobType && errors.jobType)}
                                                    helperText={touched.jobType && errors.jobType}
                                                    size='small'
                                                    onBlur={handleBlur}
                                                    id="jobType"
                                                    name="jobType"
                                                    value={searchData.jobType}
                                                    type="text"
                                                    variant="outlined"
                                                    onChange={(e) => onIsPlucking(e)}
                                                >
                                                    <MenuItem value={0}>--Select Job Type--</MenuItem>
                                                    <MenuItem value={1}>Plucking</MenuItem>
                                                    <MenuItem value={2}>Non Plucking</MenuItem>
                                                    {/* <MenuItem value={'3'}>Cross Job</MenuItem> */}
                                                </TextField>
                                            </Grid>
                                            {/* : null} */}
                                            {/* {isExecuteButtonHide ? */}
                                            {/* <Grid item md={4} xs={12}>
                                                <InputLabel shrink id="employeeSubCategoryMappingID">
                                                    Employee Sub Category *
                                                </InputLabel>
                                                <TextField select fullWidth
                                                    error={Boolean(touched.employeeSubCategoryMappingID && errors.employeeSubCategoryMappingID)}
                                                    helperText={touched.employeeSubCategoryMappingID && errors.employeeSubCategoryMappingID}
                                                    size='small'
                                                    id="employeeSubCategoryMappingID"
                                                    name="employeeSubCategoryMappingID"
                                                    value={searchData.employeeSubCategoryMappingID}
                                                    type="text"
                                                    variant="outlined"
                                                    onChange={(e) => handleChangeForm(e)}
                                                >
                                                    <MenuItem value="0">--Select Employee Sub Category--</MenuItem>
                                                    {generateDropDownMenuWithTwoValues(employeeSubCategoryMapping)}
                                                </TextField>
                                            </Grid> */}
                                            <Grid item md={4} xs={12}>
                                                <InputLabel shrink id="employeeSubCategoryMappingID">
                                                    Employee Sub Category *
                                                </InputLabel>
                                                <CustomMultiSelect
                                                    items={employeeSubCategoryMapping}
                                                    getOptionLabel={getOptionLabel4}
                                                    getOptionDisabled={getOptionDisabled4}
                                                    selectedValues={selectedOptions4}
                                                    placeholder="Employee Sub Category"
                                                    selectAllLabel="Select all"
                                                    onToggleOption={handleToggleOption4}
                                                    onClearOptions={handleClearOptions4}
                                                    onSelectAll={handleSelectAll4}
                                                />
                                            </Grid>
                                            {/* : null} */}
                                        </Grid>
                                        {/* {isExecuteButtonHide != true ?
                                            <Box display="flex" p={2}>
                                                <Button
                                                    color="primary"
                                                    type="submit"
                                                    variant="contained"
                                                    onClick={() => CheckCrossJob()}
                                                >
                                                    Execute
                                                </Button>
                                            </Box>
                                            : null} */}
                                    </CardContent>
                                    {isPlucking ?
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
                                                Search
                                            </Button>
                                        </Box>
                                        : null}
                                    <Divider />
                                    <CardContent>
                                        {paymentDetails.length > 0 && isPlucking ? <Box minWidth={1000}>
                                            <MaterialTable
                                                title="Daily Payment Calculation Details"
                                                columns={columns}
                                                data={paymentDetails}
                                                editable={{
                                                    onRowUpdate: (newData, oldData) =>
                                                        new Promise((resolve, reject) => {
                                                            setTimeout(() => {
                                                                const dataUpdate = [...paymentDetails];
                                                                const index = oldData.tableData.id;
                                                                dataUpdate[index] = newData;
                                                                setDailyPaymentDetails([...dataUpdate]);
                                                                resolve();
                                                            }, 1000)
                                                        })
                                                }}
                                            />
                                        </Box> : null}
                                        {isActive ?
                                            <Box border={1} borderRadius={16} borderColor="green" {...currentProps} style={{ marginTop: "3rem", marginLeft: "5rem", marginRight: '5rem' }}>
                                                <Grid item md={12} xs={12}>
                                                    <Grid item md={12} xs={12} alignItems="center" justify="center">
                                                        <CardHeader titleTypographyProps={{ variant: 'h2', align: 'center' }}
                                                            title="Salary Calculation"
                                                        />
                                                    </Grid>
                                                    <Grid item md={12} xs={12}>
                                                        {searchData.divisionID != 0 ?
                                                            <Typography variant="h5" style={{ marginLeft: '2rem', marginTop: '1rem' }}>
                                                                <Grid container spacing={0}>
                                                                    <Grid item md={3} xs={12}>
                                                                        Pay Point
                                                                    </Grid>
                                                                    <Grid item md={9} xs={12}>
                                                                        -{'  ' + selectedSearchValues.divisionName}
                                                                    </Grid>
                                                                </Grid>
                                                            </Typography>
                                                            : null}
                                                        {selectedOptions4.length != 0 ?
                                                            <Typography variant="h5" style={{ marginLeft: '2rem', marginTop: '1rem' }}>
                                                                <Grid container spacing={0}>
                                                                    <Grid item md={3} xs={12}>
                                                                        Employee Sub Category
                                                                    </Grid>
                                                                    <Grid item md={9} xs={12}>
                                                                        -{'  ' + selectedOptions4.map(x => x.label).join(', ')}
                                                                    </Grid>
                                                                </Grid>
                                                            </Typography>
                                                            : null}
                                                        <Typography variant="h5" style={{ marginLeft: '2rem', marginTop: '1rem' }}>
                                                            <Grid container spacing={0}>
                                                                <Grid item md={3} xs={12}>
                                                                    Date
                                                                </Grid>
                                                                <Grid item md={9} xs={12}>
                                                                    -{'  ' + isPlucking ? '  ' + moment(searchData.date).format('YYYY-MM-DD').substr(0, 10) : '  ' + moment(searchData.date).format('YYYY-MM-DD').substr(0, 10)}
                                                                </Grid>
                                                            </Grid>
                                                        </Typography>
                                                    </Grid>
                                                    <Box display="flex" justifyContent="flex-end" p={2}>
                                                        <Button
                                                            color="primary"
                                                            type="button"
                                                            variant="contained"
                                                            onClick={() => CalculateSalary()}
                                                        >
                                                            Start
                                                        </Button>
                                                    </Box>
                                                </Grid>
                                            </Box>
                                            : null}
                                    </CardContent>
                                </Card>
                            </Box>
                        </form>
                    )}
                </Formik>
            </Container>
            <Dialog open={openOne} maxWidth="sm" fullWidth>
                <Card style={{ justifycontent: 'center' }} >
                    <Box p={2} >
                        <Typography variant="h1">
                            <center>
                                <b>
                                    Please Wait!
                                </b>
                            </center>
                        </Typography>
                        <Typography variant="h3" gutterBottom>
                            <center>
                                Backend Process Running...
                            </center>
                        </Typography>
                    </Box>
                    <Box p={2} >
                        <center>
                            <CircularProgress />
                        </center>
                    </Box>
                </Card>
            </Dialog>
            <Dialog open={openTwo} onClose={handleCloseDialogTwo} maxWidth="sm" fullWidth>
                <Card style={{ justifycontent: 'center' }} >
                    <Box p={2} >
                        <Typography variant="h3">
                            <center>
                                <b>
                                    Daily Salary Calculation!
                                </b>
                            </center>
                        </Typography>
                        <br />
                        <br />
                        <Typography color={checkDetails.leave === 0 ? 'black' : 'error'} variant="h4" gutterBottom>
                            <Grid container spacing={0}>
                                <Grid item md={5} xs={12}>
                                    Pending Leaves
                                </Grid>
                                <Grid item md={3} xs={12}>
                                    :{'  ' + checkDetails.leave}
                                    <br />
                                </Grid>
                            </Grid>
                        </Typography>
                        <Typography style={{ color: 'green' }} variant="h4" gutterBottom>
                            {isPlucking == false && searchData.jobType == 2 ?
                                <Grid container spacing={0}>
                                    <Grid item md={5} xs={12}>
                                        Non Plucking Attendance
                                    </Grid>
                                    <Grid item md={3} xs={12}>
                                        :{'  ' + checkDetails.nonPluckingAttendance}
                                        <br />
                                    </Grid>
                                </Grid>
                                : null}
                        </Typography>
                        <Typography style={{ color: 'green' }} variant="h4" gutterBottom>
                            {isPlucking == false && searchData.jobType == 3 ?
                                <Grid container spacing={0}>
                                    <Grid item md={5} xs={12}>
                                        Cross Job Attendance
                                    </Grid>
                                    <Grid item md={3} xs={12}>
                                        :{'  ' + checkDetails.crossJobAttendance}
                                        <br />
                                    </Grid>
                                </Grid>
                                : null}
                        </Typography>
                        <Typography style={{ color: 'green' }} variant="h4" gutterBottom>
                            {isPlucking == true ?
                                <Grid container spacing={0}>
                                    <Grid item md={5} xs={12}>
                                        Plucking Attendance
                                    </Grid>
                                    <Grid item md={3} xs={12}>
                                        :{'  ' + checkDetails.pluckingAttendance}
                                        <br />
                                    </Grid>
                                </Grid>
                                : null}
                        </Typography>
                        <Typography color='secondary' variant="h4" gutterBottom>
                            {searchData.employeeTypeID != 3 ?
                                <Grid container spacing={0}>
                                    <Grid item md={5} xs={12}>
                                        Already Salary Run
                                    </Grid>
                                    <Grid item md={3} xs={12}>
                                        :{'  ' + checkDetails.dailyRecords}
                                    </Grid>
                                </Grid>
                                : null}
                        </Typography>
                        <Typography color='secondary' variant="h4" gutterBottom>
                            {searchData.employeeTypeID == 3 ?
                                <Grid container spacing={0}>
                                    <Grid item md={5} xs={12}>
                                        Already Salary Run Outsider
                                    </Grid>
                                    <Grid item md={3} xs={12}>
                                        :{'  ' + checkDetails.outsiderDailyRecords}
                                    </Grid>
                                </Grid>
                                : null}
                        </Typography>
                    </Box>
                    {isButtonHide != true ?
                        <Box p={2}>
                            <Typography variant="h4">
                                <b>Are you sure you want to do this ?</b>
                            </Typography>
                        </Box>
                        : null}
                    {checkDetails.leave != 0 ?
                        <Box p={2}>
                            <Typography color='error' variant="h4">
                                <b>Please Confirm All Leaves Are Approved!</b>
                            </Typography>
                        </Box>
                        : null}
                    {isPlucking == true && checkDetails.leave == 0 && checkDetails.pluckingAttendance == 0 ?
                        <Box p={2}>
                            <Typography color='error' variant="h4">
                                <b>No Attendance to Run Salary!</b>
                            </Typography>
                        </Box>
                        : null}
                    {isPlucking == false && checkDetails.leave == 0 && checkDetails.crossJobAttendance == 0 && searchData.jobType == 3 ?
                        <Box p={2}>
                            <Typography color='error' variant="h4">
                                <b>No Attendance to Run Salary!</b>
                            </Typography>
                        </Box>
                        : null}
                    {isPlucking == false && checkDetails.leave == 0 && checkDetails.nonPluckingAttendance == 0 && searchData.jobType == 2 ?
                        <Box p={2}>
                            <Typography color='error' variant="h4">
                                <b>No Attendance to Run Salary</b>
                            </Typography>
                        </Box>
                        : null}
                    {isButtonHide != true ?
                        <Box display="flex" flexDirection="row-reverse" p={2} >
                            <Button
                                type="button"
                                variant="contained"
                                color="primary"
                                size='small'
                                onClick={() => handleCloseDialogTwo()}
                            >
                                No
                            </Button>
                            &nbsp;&nbsp;
                            <Button
                                type="button"
                                variant="contained"
                                color="primary"
                                size='small'
                                onClick={() => offdayOrNot()}
                            >
                                Yes
                            </Button>
                        </Box>
                        :
                        <Box display="flex" flexDirection="row-reverse" p={2} >
                            <Button
                                type="button"
                                variant="contained"
                                color="primary"
                                size='small'
                                onClick={() => handleCloseDialogThr()}
                            >
                                Close
                            </Button>
                        </Box>}
                </Card>
            </Dialog>
            <Dialog open={openThree} onClose={handleCloseDialogThree} maxWidth="sm" fullWidth>
                <Card style={{ justifycontent: 'center', display: 'flex', alignItems: 'center', minHeight: '300px' }} >
                    <Box p={2} >
                        <Typography color='error' variant="h1">
                            <center>
                                <b>Please Complete Last Week Salary!</b>
                            </center>
                        </Typography>
                    </Box>
                </Card>
            </Dialog>
        </Page>
    )
}