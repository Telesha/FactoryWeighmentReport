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
    Divider,
    InputLabel,
    Switch,
    CardHeader,
    MenuItem

} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { LoadingComponent, ManualLoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';

import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";

import ButtonGroup from "@material-ui/core/ButtonGroup";

import { DatePicker, MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { set } from 'lodash';

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
    formControlLabel: {
        color: "grey",
        fontFamily: "Roboto",
        fontSize: 13
    }
}));

var screenCode = "TASKTEMPLATE"

export default function TaskTemplateAddEdit(props) {
    const [title, setTitle] = useState("Add Task Template")
    const [isUpdate, setIsUpdate] = useState(false);
    const [isDisableButton, setIsDisableButton] = useState(false);
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [estates, setEstates] = useState();
    const [taskCategory, setTaskCategory] = useState();
    const [sundry, setSundry] = useState();
    const [fields, setFields] = useState();
    const [division, setDivision] = useState();
    const [circulationMonths, setCirculationMonths] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleAccordionClick = () => {
        setIsExpanded(false);
    };

    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });

    const [expirationDate, handleExpirationDate] = useState();

    const [taskTemplate, setTaskTemplate] = useState({
        employeeTaskTemplateID: "0",
        groupID: "0",
        operationEntityID: "0",
        estateTaskID: "0",
        fieldID: "0",
        numberOfWorkers: "",
        divisionID: "0",
        taskID: "0",
        collectionPointName: "",
        isCirculation: "",
        isActive: true,
        taskExpiration: ''
    });
    const navigate = useNavigate();
    const handleClick = () => {
        navigate('/app/taskTemplate/listing');
    }

    const alert = useAlert();
    const { employeeTaskTemplateID } = useParams();
    let decryptedID = 0;

    useEffect(() => {
        getPermission();
        trackPromise(
            GetAllGroups()
        )
    }, []);

    useEffect(() => {
        trackPromise(
            getEstateDetailsByGroupID()
        )
    }, [taskTemplate.groupID]);

    useEffect(() => {
        trackPromise(
            getAllTaskNames()
        )
    }, [taskTemplate.groupID, taskTemplate.operationEntityID]);

    useEffect(() => {
        if (taskTemplate.operationEntityID != "0" && taskTemplate.estateTaskID != "0" && taskTemplate.divisionID != "0") {
            trackPromise(
                getLabourTask()
            )
        }
    }, [taskTemplate.operationEntityID, taskTemplate.estateTaskID]);

    useEffect(() => {
        if (taskTemplate.operationEntityID > 0) {
            trackPromise(
                getDivisionDetailsByEstateID()
            )
        }
    }, [taskTemplate.operationEntityID]);

    useEffect(() => {
        trackPromise(getFeilds())
    }, [taskTemplate.groupID, taskTemplate.operationEntityID, taskTemplate.divisionID]);


    useEffect(() => {
        decryptedID = atob(employeeTaskTemplateID);
        if (decryptedID != 0) {
            setIsUpdate(true);
            trackPromise(
                getTaskTemplate(decryptedID),
            )
        }
    }, []);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITTASKTEMPLATE');

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

        setTaskTemplate({
            ...taskTemplate,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            operationEntityID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function GetAllGroups() {
        const result = await services.getGroupsForDropdown();
        setGroups(result);
    }

    async function getEstateDetailsByGroupID() {
        var result = await services.getEstateDetailsByGroupID(taskTemplate.groupID);
        setEstates(result);
    }

    async function getAllTaskNames() {
        const result = await services.getAllTaskNames(taskTemplate.groupID, taskTemplate.operationEntityID);
        setTaskCategory(result);
    }

    async function getLabourTask() {
        const result = await services.getLabourTask(taskTemplate.operationEntityID, taskTemplate.divisionID, taskTemplate.estateTaskID, isUpdate);
        setSundry(result);
    }

    async function getDivisionDetailsByEstateID() {
        const routes = await services.getDivisionDetailsByEstateID(taskTemplate.operationEntityID);
        setDivision(routes);
    }

    async function getTaskTemplate(ID) {
        const result = await services.GetTaskTemplateByTaskTemplateID(ID);
        setTitle("Update Task Template");
        if (result.circulationMonths > 0) {
            setCirculationMonths(result.circulationMonths)
            setTaskTemplate({
                ...taskTemplate,
                employeeTaskTemplateID: result.employeeTaskTemplateID,
                groupID: result.groupID,
                operationEntityID: result.estateID,
                estateTaskID: result.estateTaskID,
                numberOfWorkers: result.numberOfWorkers == null ? "" : result.numberOfWorkers,
                divisionID: result.divisionID,
                taskID: result.taskID,
                taskExpiration: result.taskExpiration.split('T')[0],
                isActive: result.isActive,
                isCirculation: true
            });
            handleExpirationDate(result.taskExpiration.split('T')[0])
        }
        else {
            setCirculationMonths(0)
            setTaskTemplate({
                ...taskTemplate,
                employeeTaskTemplateID: result.employeeTaskTemplateID,
                groupID: result.groupID,
                operationEntityID: result.estateID,
                estateTaskID: result.estateTaskID,
                numberOfWorkers: result.numberOfWorkers == null ? "" : result.numberOfWorkers,
                divisionID: result.divisionID,
                taskID: result.taskID,
                taskExpiration: result.taskExpiration.split('T')[0],
                isActive: result.isActive,
                isCirculation: false
            })
            handleExpirationDate(result.taskExpiration.split('T')[0])
        }
    }

    async function HandleSave(taskTemplate) {
        if (isUpdate == true) {
            let updateModel = {
                employeeTaskTemplateID: atob(employeeTaskTemplateID.toString()),
                groupID: taskTemplate.groupID,
                operationEntityID: taskTemplate.operationEntityID,
                divisionID: taskTemplate.divisionID,
                estateTaskID: taskTemplate.estateTaskID,
                taskExpiration: taskTemplate.taskExpiration,
                numberOfWorkers: taskTemplate.numberOfWorkers,
                circulation: taskTemplate.circulationMonths,
                taskID: taskTemplate.taskID,
                isActive: taskTemplate.isActive,
                isCirculation: taskTemplate.isCirculation,


            }
            let response = await services.UpdateTaskTemplate(updateModel, fields, expirationDate, circulationMonths);
            if (response.statusCode == "Success") {
                alert.success(response.message);
                setIsDisableButton(true);
                navigate('/app/taskTemplate/listing');
            }
            else {
                alert.error(response.message);
            }
        }

        else {
            let response = await services.SaveTaskTemplate(taskTemplate, fields, expirationDate, circulationMonths)
            if (response.statusCode == "Success") {
                alert.success(response.message);
                setIsDisableButton(true);
                navigate('/app/taskTemplate/listing');
            }
            else {
                alert.error(response.message);
            }
        }
    }

    function handleChange1(e) {
        const target = e.target;
        const value = target.value

        setTaskTemplate({
            ...taskTemplate,
            [e.target.name]: value
        });
    }

    //getFields by divisionID
    async function getFeilds() {
        const result = await services.filterFields(

            taskTemplate.groupID,
            taskTemplate.operationEntityID,
            taskTemplate.divisionID,
        );
        if (isUpdate == true) {
            var fieldIds = await services.getFeildsByTemplateID(taskTemplate.employeeTaskTemplateID);
            if (fieldIds.length > 0 && result.length > 0) {
                fieldIds.forEach(x => {
                    result.forEach(f => {
                        if (f.fieldID === x.fieldID && x.isActive === true) {
                            f.isChecked = true;
                            f.status = 2;
                            f.taskTemplateFeildID = x.taskTemplateFeildID
                        }
                    })
                })
            }
        }
        setFields(result);
    }

    function getListOfFeilds(key) {
        var selectedFields = [...fields];

        selectedFields.forEach((element) => {
            if (element.fieldID == key) {
                element.isChecked = !element.isChecked;
                if (element.status === 2) {
                    element.status = 3;
                } else {
                    element.status = 1;
                }
            }
        });

        setFields(selectedFields);
    }

    function generateFieldAccordians(data) {
        let items = [];
        if (data != null) {
            data.forEach((element, i) => {
                items.push(
                    <Accordion key={i} expanded={isExpanded} onChange={handleAccordionClick}>
                        <AccordionSummary
                            id="additional-actions1-header"
                        >
                            <FormControlLabel
                                aria-label="Acknowledge"
                                onClick={(event) => event.stopPropagation()}
                                onFocus={(event) => event.stopPropagation()}
                                control={
                                    <Checkbox
                                        color="primary"
                                        checked={element.isChecked}
                                        onClick={() => getListOfFeilds(element.fieldID)}
                                    />
                                }
                                id={element.fieldID}
                                label={element.fieldName}
                            />
                        </AccordionSummary>
                    </Accordion>
                );
            });
        }
        return items;
    }

    function handleIncrement() {
        let data = circulationMonths;
        data++;
        setCirculationMonths(data);
    };

    function handleDecrement() {
        let data = circulationMonths;
        data--;
        data >= 0 ?
            setCirculationMonths(data) : setCirculationMonths(0)
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

    function handleChange2(e) {
        const target = e.target;
        const value = target.name === 'isCirculation' ? target.checked : target.value
        setTaskTemplate({
            ...taskTemplate,
            [e.target.name]: value
        });
    }


    function handleChange3(e) {
        const target = e.target;
        const value = target.name === 'isActive' ? target.checked : target.value
        setTaskTemplate({
            ...taskTemplate,
            [e.target.name]: value
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
                        isEdit={false}
                    />
                </Grid>
            </Grid>
        )
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            employeeTaskTemplateID: taskTemplate.employeeTaskTemplateID,
                            groupID: taskTemplate.groupID,
                            operationEntityID: taskTemplate.operationEntityID,
                            estateTaskID: taskTemplate.estateTaskID,
                            taskID: taskTemplate.taskID,
                            taskName: taskTemplate.taskName,
                            divisionID: taskTemplate.divisionID,
                            taskExpiration: taskTemplate.taskExpiration,
                            numberOfWorkers: taskTemplate.numberOfWorkers,
                            fieldID: taskTemplate.fieldID,
                            isCirculation: false,
                            isActive: true,
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().min(1, 'Please Select Business Division').required('Business Division required'),
                                operationEntityID: Yup.number().min(1, 'Location is required').required('Location required'),
                                estateTaskID: Yup.number().min(1, 'Task Category is required').required('Task Category required'),
                                taskID: Yup.number().min(1, 'Sundry Task is required').required('Sundry Task required'),
                                divisionID: Yup.number().min(1, 'Sub Division is required').required('Sub Division required')

                            })
                        }
                        onSubmit={HandleSave}
                        enableReinitialize
                    >
                        {({
                            errors,
                            handleBlur,
                            handleChange,
                            handleSubmit,
                            isSubmitting,
                            touched,
                            values,
                            props
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
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange1(e)}
                                                            value={taskTemplate.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            size="small"
                                                            InputProps={{
                                                                readOnly: isUpdate || !permissionList.isGroupFilterEnabled ? true : false,
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
                                                            onChange={(e) => handleChange1(e)}
                                                            value={taskTemplate.operationEntityID}
                                                            variant="outlined"
                                                            id="operationEntityID"
                                                            size="small"
                                                            InputProps={{
                                                                readOnly: isUpdate || !permissionList.isGroupFilterEnabled ? true : false,
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Location--</MenuItem>
                                                            {generateDropDownMenu(estates)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="divisionID">
                                                            Sub Division *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.divisionID && errors.divisionID)}
                                                            fullWidth
                                                            helperText={touched.divisionID && errors.divisionID}
                                                            name="divisionID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange1(e)}
                                                            value={taskTemplate.divisionID}
                                                            variant="outlined"
                                                            id="divisionID"
                                                            size="small"
                                                            InputProps={{
                                                                readOnly: isUpdate ? true : false,
                                                            }}

                                                        >
                                                            <MenuItem value="0">--Select Sub Division--</MenuItem>
                                                            {generateDropDownMenu(division)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="estateTaskID">
                                                            Task Category *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.estateTaskID && errors.estateTaskID)}
                                                            fullWidth
                                                            helperText={touched.estateTaskID && errors.estateTaskID}
                                                            name="estateTaskID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange1(e)}
                                                            value={taskTemplate.estateTaskID}
                                                            variant="outlined"
                                                            id="estateTaskID"
                                                            size="small"
                                                            InputProps={{
                                                                readOnly: isUpdate ? true : false,
                                                            }}

                                                        >
                                                            <MenuItem value="0">--Select Task Category--</MenuItem>
                                                            {generateDropDownMenu(taskCategory)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="taskID">
                                                            Sundry Task *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.taskID && errors.taskID)}
                                                            fullWidth
                                                            helperText={touched.taskID && errors.taskID}
                                                            name="taskID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange1(e)}
                                                            value={taskTemplate.taskID}
                                                            variant="outlined"
                                                            id="taskID"
                                                            size="small"
                                                            InputProps={{
                                                                readOnly: isUpdate ? true : false,
                                                            }}

                                                        >
                                                            <MenuItem value="0">--Select Sundry Task--</MenuItem>
                                                            {generateDropDownMenu(sundry)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <InputLabel shrink id="expirationDate">
                                                                Task Expiration
                                                            </InputLabel>
                                                            <KeyboardDatePicker
                                                                fullWidth
                                                                inputVariant="outlined"
                                                                format="dd/MM/yyyy"
                                                                id="date-picker-inline"
                                                                value={expirationDate}
                                                                size='small'
                                                                onChange={e => {
                                                                    handleExpirationDate(e);
                                                                }}
                                                                KeyboardButtonProps={{
                                                                    'aria-label': 'change date'
                                                                }}
                                                                autoOk
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="numberOfWorkers">
                                                            Number Of Workers
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.numberOfWorkers && errors.numberOfWorkers)}
                                                            fullWidth
                                                            helperText={touched.numberOfWorkers && errors.numberOfWorkers}
                                                            name="numberOfWorkers"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange1(e)}
                                                            value={taskTemplate.numberOfWorkers}
                                                            variant="outlined"
                                                            disabled={isDisableButton}
                                                            size='small'
                                                        />
                                                    </Grid>
                                                </Grid>
                                                <Grid container spacing={3}>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="isCirculation">
                                                            Circulation
                                                        </InputLabel>
                                                        <Switch
                                                            checked={taskTemplate.isCirculation}
                                                            onChange={(e) => handleChange2(e)}
                                                            name="isCirculation"
                                                            disabled={isDisableButton}
                                                        />
                                                    </Grid>
                                                </Grid>
                                                {taskTemplate.isCirculation ? (
                                                    <div className="col-md pb-1">
                                                        <InputLabel shrink id="def">Months</InputLabel>
                                                        <ButtonGroup size="small" aria-label="small outlined button group">
                                                            <Button onClick={handleDecrement}>-</Button>
                                                            {circulationMonths >= 0 && <Button>{circulationMonths}</Button>}
                                                            {circulationMonths >= 0 && <Button onClick={handleIncrement}>+</Button>}
                                                        </ButtonGroup>
                                                    </div>
                                                ) : null}
                                                <br />
                                                <Grid container spacing={3}>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="isActive">
                                                            Active
                                                        </InputLabel>
                                                        <Switch
                                                            checked={taskTemplate.isActive}
                                                            onChange={(e) => handleChange3(e)}
                                                            name="isActive"
                                                            disabled={isDisableButton}
                                                        />
                                                    </Grid>
                                                </Grid>
                                                {/* <Grid container spacing={3}>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="fieldID">
                                                            Select Sections
                                                        </InputLabel>
                                                        {generateFieldAccordians(fields)}
                                                    </Grid>
                                                </Grid> */}
                                            </CardContent>
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                <Button
                                                    color="primary"
                                                    disabled={isSubmitting || isDisableButton}
                                                    type="submit"
                                                    variant="contained"
                                                    size='small'
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
        </Fragment >
    );
};

