import React, { useState, useEffect, createContext } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box,
    Card,
    makeStyles,
    Container,
    CardHeader,
    CardContent,
    Divider,
    MenuItem,
    Grid,
    InputLabel,
    TextField,
    Button,
    Tooltip
} from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import MaterialTable from "material-table";
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { LoadingComponent } from '../../../utils/newLoader';
import { Formik } from 'formik';
import * as Yup from "yup";
import xlsx from 'json-as-xlsx';
import SearchNotFound from 'src/views/Common/SearchNotFound';
import { CustomTable } from './CustomTable';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    },
}));

var screenCode = "TASKTEMPLATE"

export default function TaskTemplateListing() {
    const classes = useStyles();
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [groups, setGroups] = useState();
    const [task, setTask] = useState([]);
    const [taskCodes, setTaskCodes] = useState([]);
    const [estates, setEstates] = useState();
    const [isViewTable, setIsViewTable] = useState(true);
    const [division, setDivision] = useState();
    const [isCleared, setIsCleared] = useState(false);
    const [taskTemplate, setTaskTemplate] = useState({
        groupID: 0,
        estateID: 0,
        divisionID: 0,
        taskID: 0
    })

    const [taskData, setTaskData] = useState([]);
    const navigate = useNavigate();
    let encrypted = "";
    const handleClick = () => {
        encrypted = btoa('0');
        navigate('/app/taskTemplate/addEdit/' + encrypted);
    }

    const handleClickEdit = (employeeTaskTemplateID) => {
        encrypted = btoa(employeeTaskTemplateID.toString());
        navigate('/app/taskTemplate/addedit/' + encrypted);
    }

    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
        isAddEditScreen: false
    });
    const [excel, setExcel] = useState(false);
    const [employeeTaskTemplateID, setEmployeeTaskTemplateID] = useState(0);

    useEffect(() => {
        getPermission();
        trackPromise(
            GetAllGroups()
        );
    }, []);

    useEffect(() => {
        trackPromise(
            getEstateDetailsByGroupID()
        )
    }, [taskTemplate.groupID]);

    useEffect(() => {
        if (taskTemplate.estateID > 0) {
            trackPromise(
                getDivisionDetailsByEstateID(),
                GetTaskNamesByOperationID()
            )
        }
    }, [taskTemplate.estateID]);

    useEffect(() => {
        if (excel == true) {
            createFile()
        }
    }, [excel]);


    useEffect(() => {
        if (employeeTaskTemplateID != 0) {
            handleClickEdit(employeeTaskTemplateID)
        }
    }, [employeeTaskTemplateID]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWTASKTEMPLATE');
        var isAddEditScreen = permissions.find(p => p.permissionCode == 'ADDEDITTASKTEMPLATE');

        if (isAuthorized === undefined) {
            navigate('/404');
        }

        var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
            isAddEditScreen: isAddEditScreen !== undefined
        });

        setTaskTemplate({
            ...taskTemplate,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            estateID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function createFile() {
        setExcel(false)
        var file = await createDataForExcel(taskData);
        var settings = {
            sheetName: 'Tasks Template',
            fileName: 'Tasks Template Details',
            writeOptions: {}
        }

        let keys = Object.keys(file[0])
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem })
        })

        let dataA = [
            {
                sheet: 'Tasks Template Details',
                columns: tempcsvHeaders,
                content: file
            }
        ]
        xlsx(dataA, settings);
    }

    async function getDivisionDetailsByEstateID() {
        const routes = await services.getDivisionDetailsByEstateID(taskTemplate.estateID, taskTemplate.divisionID);
        setDivision(routes);
    }

    async function GetAllGroups() {
        const result = await services.getGroupsForDropdown();
        setGroups(result);
    }

    async function GetTaskNamesByOperationID() {
        const task = await services.getTaskNamesByOperationID(taskTemplate.estateID);
        setTask(task);
    }

    async function getEstateDetailsByGroupID() {
        var result = await services.getEstateDetailsByGroupID(taskTemplate.groupID);
        setEstates(result);
    }

    async function GetTaskTemplatesByFilter() {
        var result = await services.GetTaskTemplatesByFilter(taskTemplate.estateID, taskTemplate.divisionID, taskTemplate.taskID);
        result.forEach(x => {
            x.taskExpiration = x.taskExpiration.split('T')[0]
        });
        setTaskData(result);
        if (result.length > 0) {
            setIsViewTable(false);
        } else {
            setIsViewTable(true);
        }
    }


    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            array.map(x => {
                var vr = {
                    'Task Name': x.taskName,
                    'Task Code': x.taskCode,
                    'Task Category': x.estateTaskName,
                    'Task Description': x.taskDescription,
                    'Task Exipiration': x.taskExpiration,
                    'Sub Division': x.divisionName,
                    'Number Of Workers': x.numberOfWorkers,
                    'Status': x.isActive == true ? 'Active' : 'InActive'
                }
                res.push(vr);
            });
        }
        return res;
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

    function handleGroupChange(e) {
        const target = e.target;
        const value = target.value
        setTaskTemplate({
            ...taskTemplate,
            [e.target.name]: value,
            estateID: "0"
        });
    }

    function fieldsClear() {
        setTaskTemplate((prevState) => ({
            ...prevState,
            taskID: '0',
            taskCode: '',

        }));
        setIsCleared(!isCleared)
    }

    function handleSearchDropdownChangeTask(data, e) {
        if (data === undefined || data === null) {
            setTaskTemplate({
                ...taskTemplate,
                taskID: '',
                taskCode: ''
            });
            return;
        } else {
            var nameV = "taskID";
            var valueV = data["taskID"];;
            setTaskTemplate({
                ...taskTemplate,
                taskID: valueV.toString(),
                taskCode: data.taskCode
            });
        }
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setTaskTemplate({
            ...taskTemplate,
            [e.target.name]: value,

        });
    }


    function cardTitle(titleName) {
        return (
            <Grid container spacing={1}>
                <Grid item md={10} xs={12}>
                    {titleName}
                </Grid>
                <Grid item md={2} xs={12}>
                    {permissionList.isAddEditScreen == true ?
                        <PageHeader
                            onClick={handleClick}
                            isEdit={true}
                            toolTiptitle={"Edit Task Template"}
                        />
                        : null}
                </Grid>
            </Grid>
        )

    }
    return (

        <Page
            className={classes.root}
            title="Task Templates"
        >
            <Container maxWidth={false}>
                <LoadingComponent />
                <Formik
                    initialValues={{
                        groupID: taskTemplate.groupID,
                        estateID: taskTemplate.estateID,
                        divisionID: taskTemplate.divisionID,
                        taskID: taskTemplate.taskID
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Legal Entity is required').min("1", 'Select a Legal Entity '),
                            estateID: Yup.number().required('Garden is required').min("1", 'Select a Garden'),
                        })
                    }
                    onSubmit={() => trackPromise(GetTaskTemplatesByFilter())}
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
                                        title={cardTitle("Task Templates")}
                                    />
                                    <PerfectScrollbar>
                                        <Divider />
                                        <CardContent style={{ marginBottom: "2rem" }}>
                                            <Grid container spacing={3}>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="groupID">
                                                        Business Division  *
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="groupID"
                                                        size='small'
                                                        onChange={(e) => handleGroupChange(e)}
                                                        value={taskTemplate.groupID}
                                                        variant="outlined"
                                                        InputProps={{
                                                            readOnly: !permissionList.isGroupFilterEnabled ? true : false
                                                        }}
                                                    >
                                                        <MenuItem value="0">--Select Business Division--</MenuItem>
                                                        {generateDropDownMenu(groups)}
                                                    </TextField>
                                                </Grid>

                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="estateID">
                                                        Location *
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="estateID"
                                                        size='small'
                                                        onChange={(e) => handleChange(e)}
                                                        value={taskTemplate.estateID}
                                                        variant="outlined"
                                                        id="estateID"
                                                        InputProps={{
                                                            readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                        }}
                                                    >
                                                        <MenuItem value="0">--Select Location--</MenuItem>
                                                        {generateDropDownMenu(estates)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="divisionID">
                                                        Sub Division
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="divisionID"
                                                        onChange={(e) => handleChange(e)}
                                                        value={taskTemplate.divisionID}
                                                        variant="outlined"
                                                        id="divisionID"
                                                        size="small"
                                                    >
                                                        <MenuItem value="0">--Select Sub Division--</MenuItem>
                                                        {generateDropDownMenu(division)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="taskID">
                                                        Task Code
                                                    </InputLabel>
                                                    <Autocomplete
                                                        key={isCleared}
                                                        id="taskID"
                                                        options={task}
                                                        getOptionLabel={option => option.taskCode + ' - ' + option.taskName ?? option.taskCode + ' - ' + option.taskName}
                                                        onChange={(e, value) =>
                                                            handleSearchDropdownChangeTask(value, e)
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
                                                                value={taskTemplate.taskID}
                                                                getOptionDisabled={true}
                                                                onBlur={handleBlur}
                                                            />
                                                        )}
                                                    />
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
                                        {taskData.length > 0 ?
                                            <CustomTable taskData={taskData} setEmployeeTaskTemplateID={setEmployeeTaskTemplateID} setExcel={setExcel} permissionList={permissionList.isAddEditScreen} />
                                            : <SearchNotFound searchQuery="Task Templates" />}
                                    </PerfectScrollbar>
                                </Card>
                            </Box>
                        </form>
                    )}
                </Formik>
            </Container>
        </Page>
    );

};

