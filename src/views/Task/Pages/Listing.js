import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Grid, Box, Card, makeStyles, Container, CardHeader, Divider, Button } from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import MaterialTable from "material-table";
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import { LoadingComponent } from '../../../utils/newLoader';
import * as Yup from "yup";
import { Formik } from 'formik';
import { TextField, CardContent } from '@material-ui/core';
import SearchNotFound from 'src/views/Common/SearchNotFound';
import { CustomTable } from './CustomTable';
import xlsx from 'json-as-xlsx';
import { Autocomplete } from '@material-ui/lab';
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
    }

}));

var screenCode = "TASK"

export default function TaskListing() {
    const classes = useStyles();
    const [taskData, setTaskData] = useState([]);
    const [taskList, setTaskList] = useState({
        groupID: 0,
        factoryID: 0,
        taskTypeID: 0,
        estateTaskID: 0,
        productID: 0,
        taskID: 0,
        taskCode: ''
    });

    const [taskID, setTaskID] = useState(0);
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [groupData, setGroupData] = useState([]);
    const [factoryData, setFactoryData] = useState([]);
    const [taskTypes, setTaskTypes] = useState([]);
    const [taskCategory, setTaskCategory] = useState([]);
    const [products, setProducts] = useState([]);
    const [task, setTask] = useState([]);
    const [isCleared, setIsCleared] = useState(false);
    const [excel, setExcel] = useState(false);
    const [excelOne, setExcelOne] = useState(false);
    const [IDDataForCall, setIDDataForCall] = useState(null);
    const [page, setPage] = useState(0);
    const navigate = useNavigate();
    let encrypted = "";
    const handleClick = () => {
        encrypted = btoa('0');
        let modelID = {
            groupID: parseInt(taskList.groupID),
            factoryID: parseInt(taskList.factoryID),
            productID: parseInt(taskList.productID),
            estateTaskID: parseInt(taskList.estateTaskID),
            taskTypeID: parseInt(taskList.taskTypeID),
            taskID: parseInt(taskList.taskID),
            taskCode: taskList.taskCode
        };
        sessionStorage.setItem('task-list-page-search-parameters-id', JSON.stringify(modelID));
        navigate('/app/tasks/addedit/' + encrypted);
    }
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
        isAddEditScreen: false
    });

    useEffect(() => {
        const IDdata = JSON.parse(
            sessionStorage.getItem('task-list-page-search-parameters-id')
        );
        getPermission(IDdata);
    }, []);

    useEffect(() => {
        trackPromise(
            GetAllGroups(),
            getTaskTypes()
        );
    }, []);

    useEffect(() => {
        trackPromise(
            getAllTaskNames()
        )
    }, [taskList.groupID, taskList.factoryID]);

    useEffect(() => {
        if (taskID != 0) {
            handleClickEdit(taskID)
        }
    }, [taskID]);

    useEffect(() => {
        if (excel == true) {
            createFile()
        }
    }, [excel]);

    useEffect(() => {
        if (excelOne == true) {
            createFileOne()
        }
    }, [excelOne]);

    useEffect(() => {
        trackPromise(
            getEstateDetailsByGroupID()
        )
    }, [taskList.groupID]);

    useEffect(() => {
        setTaskData([])
    }, [taskList]);

    useEffect(() => {
        trackPromise(
            GetMappedProductsByFactoryID(),
            GetTaskNamesByOperationID()
        )
    }, [taskList.factoryID]);

    useEffect(() => {
        setIsCleared(!isCleared);
    }, [])

    useEffect(() => {
        if (IDDataForCall !== null) {
            trackPromise(GetLabourTaskByFilter());
        }
    }, [IDDataForCall]);

    async function getPermission(IDdata) {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWLABOURTASK');

        if (isAuthorized === undefined) {
            navigate('/404');
        }
        var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');
        var isAddEditScreen = permissions.find(p => p.permissionCode == 'ADDEDITLABOURTASK');

        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
            isAddEditScreen: isAddEditScreen !== undefined
        });

        const isInitialLoad = IDdata === null || undefined
        if (isInitialLoad) {
            setTaskList({
                ...taskList,
                groupID: parseInt(tokenService.getGroupIDFromToken()),
                estateID: parseInt(tokenService.getFactoryIDFromToken())
            })
        }
        else {
            setTaskList({
                ...taskList,
                groupID: parseInt(IDdata.groupID),
                factoryID: parseInt(IDdata.factoryID),
                productID: parseInt(IDdata.productID),
                estateTaskID: parseInt(IDdata.estateTaskID),
                taskTypeID: parseInt(IDdata.taskTypeID),
                taskID: parseInt(IDdata.taskID),
                taskCode: IDdata.taskCode
            })
            setIDDataForCall(IDdata);
        }
    }

    async function GetAllGroups() {
        const result = await services.GetAllGroups();
        setGroupData(result);
    }

    async function getEstateDetailsByGroupID() {
        var result = await services.getEstateDetailsByGroupID(taskList.groupID);
        setFactoryData(result);
    }

    async function getTaskTypes() {
        var result = await services.getTaskTypes();
        setTaskTypes(result);
    }

    async function getAllTaskNames() {
        const result = await services.getAllTaskNames(taskList.groupID, taskList.factoryID);
        setTaskCategory(result);
    }

    async function GetMappedProductsByFactoryID() {
        var response = await services.GetMappedProductsByFactoryID(taskList.factoryID);
        setProducts(response);
    };

    async function GetTaskNamesByOperationID() {
        const task = await services.getTaskNamesByOperationID(taskList.factoryID);
        setTask(task);
    }

    async function GetLabourTaskByFilter() {
        let model = {
            groupID: parseInt(taskList.groupID),
            factoryID: parseInt(taskList.factoryID),
            productID: parseInt(taskList.productID),
            estateTaskID: parseInt(taskList.estateTaskID),
            taskTypeID: parseInt(taskList.taskTypeID),
            taskID: parseInt(taskList.taskID),
            taskCode: taskList.taskCode,
        }
        var result = await services.getLabourTaskByFilter(model);

        setTaskData(result);
    }

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
        setTaskList({
            ...taskList,
            [e.target.name]: value
        });
    }

    function handleSearchDropdownChangeTask(data, e) {
        if (data === undefined || data === null) {
            setTaskList({
                ...taskList,
                taskID: 0,
                taskCode: ''
            });
            return;
        } else {
            var nameV = "taskID";
            var valueV = data["taskID"];;
            setTaskList({
                ...taskList,
                taskID: valueV.toString(),
                taskCode: data.taskCode
            });
        }
    }

    function fieldsClear() {
        setTaskList((prevState) => ({
            ...prevState,
            taskID: '0',
            taskCode: '',
        }));
        setIsCleared(!isCleared)
    }

    const handleClickEdit = (taskID) => {
        encrypted = btoa(taskID.toString());
        let modelID = {
            groupID: parseInt(taskList.groupID),
            factoryID: parseInt(taskList.factoryID),
            productID: parseInt(taskList.productID),
            estateTaskID: parseInt(taskList.estateTaskID),
            taskTypeID: parseInt(taskList.taskTypeID),
            taskID: parseInt(taskList.taskID),
            taskCode: taskList.taskCode
        };
        sessionStorage.setItem('task-list-page-search-parameters-id', JSON.stringify(modelID));
        sessionStorage.setItem('task-table-page', JSON.stringify(page));
        navigate('/app/tasks/addedit/' + encrypted);
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
                            toolTiptitle={"Add Task"}
                        />
                        : null}
                </Grid>
            </Grid>
        )
    }

    function fieldsClear() {
        setIsCleared(!isCleared)
    }

    function handleSearchButtonClick() {
        trackPromise(GetLabourTaskByFilter());
    }

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            array.map(x => {
                var vr = {
                    'Business Division': x.groupName,
                    'Location': x.factoryName,
                    'Product': x.productName,
                    'Task Category': x.estateTaskName,
                    'Task Code': x.taskCode,
                    'Sub Task Code': x.subTaskCode,
                    'Task Name': x.taskName,
                    'Task Description': x.taskDescription,
                    'Budget expenses code': x.budgetexpensescode,
                    'Employee Category Type': x.employeeCategoryName,
                    'Measuring Unit': x.measuringUnitName,
                }
                res.push(vr);
            });
        }
        return res;
    }

    async function createFile() {
        setExcel(false)
        var file = await createDataForExcel(taskData);
        var settings = {
            sheetName: 'Tasks Details',
            fileName: 'Tasks Details',
            writeOptions: {}
        }

        let keys = Object.keys(file[0])
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem })
        })

        let dataA = [
            {
                sheet: 'Tasks Details',
                columns: tempcsvHeaders,
                content: file
            }
        ]
        xlsx(dataA, settings);
    }

    async function createDataForExcelOne(array) {
        var res = [];

        if (array != null) {
            array.map(x => {
                x.details.map(y => {
                    var vr = {
                        'Business Division': x.groupName,
                        'Location': x.factoryName,
                        'Product': x.productName,
                        'Task Category': x.estateTaskName,
                        'Task Code': x.taskCode,
                        'Sub Task Code': x.subTaskCode,
                        'Task Name': x.taskName,
                        'Task Description': x.taskDescription,
                        'Budget expenses code': x.budgetexpensescode,
                        'Employee Category Type': x.employeeCategoryName,
                        'Measuring Unit': x.measuringUnitName,

                        'Sub Division': y.divisionName,
                        'Section': y.fieldName,
                        'Emp.Type': y.employeeTypeName,
                        'Job': y.jobName,
                        'Unit': y.measuringName,
                        'Qty': y.labourTaskRateID == 0 ? null : y.measuringQuantity,
                        'M.Qty': y.labourTaskRateID == 0 ? null : y.maxMeasuringQuantity,
                        'Alw': y.labourTaskRateID == 0 ? null : y.allowance,
                        'G.Alw': y.labourTaskRateID == 0 ? null : y.gardenAlloeance,
                        'Rate': y.labourTaskRateID == 0 ? null : y.rate,
                        'Rate - M': y.labourTaskRateID == 0 ? null : y.defaultMRate,
                        'Rate - W': y.labourTaskRateID == 0 ? null : y.defaultWRate,
                        'Less.R': y.labourTaskRateID == 0 ? null : y.lessRate,
                        'Over.R': y.labourTaskRateID == 0 ? null : y.overRate,
                        'TaskExpiration': y.taskExpiration == null ? null : moment(y.taskExpiration).format('YYYY-MM-DD'),
                        'IsActive': y.isActive,

                    }
                    res.push(vr);
                });
            });
        }
        return res;
    }

    async function createFileOne() {
        setExcelOne(false)
        var file = await createDataForExcelOne(taskData);
        var settings = {
            sheetName: 'Tasks Rate Details',
            fileName: 'Tasks Rate Details',
            writeOptions: {}
        }

        let keys = Object.keys(file[0])
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem })
        })

        let dataA = [
            {
                sheet: 'Tasks Rate Details',
                columns: tempcsvHeaders,
                content: file
            }
        ]
        xlsx(dataA, settings);
    }

    useEffect(() => {
        sessionStorage.removeItem('task-list-page-search-parameters-id')
        sessionStorage.removeItem('task-table-page')
    }, []);

    return (
        <Page
            className={classes.root}
            title="Tasks"
        >
            <Container maxWidth={false}>
                <LoadingComponent />
                <Formik
                    initialValues={{
                        groupID: task.groupID,
                        factoryID: task.factoryID,
                        taskTypeID: task.taskTypeID,
                        estateTaskID: task.estateTaskID,
                        productID: task.productID,
                        taskID: task.taskID,
                        taskCode: task.taskCode,
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().min(1, 'Business Division is required').required('Business Division is required'),
                            factoryID: Yup.number().min(1, 'Location is required').required('Location is required'),

                        })
                    }
                    onSubmit={() => trackPromise(handleSearchButtonClick())}
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
                                        title={cardTitle("Tasks")}
                                    />
                                    <PerfectScrollbar>
                                        <Divider />
                                        <CardContent style={{ marginBottom: "2rem" }}>
                                            <Grid container spacing={3}>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="groupID">
                                                        Business Division *
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="groupID"
                                                        onChange={(e) => handleChange(e)}
                                                        size='small'
                                                        value={taskList.groupID}
                                                        variant="outlined"
                                                        InputProps={{
                                                            readOnly: !permissionList.isGroupFilterEnabled ? true : false
                                                        }}
                                                    >
                                                        <MenuItem value="0">--Select All Business Division--</MenuItem>
                                                        {generateDropDownMenu(groupData)}
                                                    </TextField>
                                                </Grid>

                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="factoryID">
                                                        Location *
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="factoryID"
                                                        onChange={(e) => handleChange(e)}
                                                        size='small'
                                                        value={taskList.factoryID}
                                                        variant="outlined"
                                                        id="factoryID"
                                                        InputProps={{
                                                            readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                        }}
                                                    >
                                                        <MenuItem value="0">--Select All Location--</MenuItem>
                                                        {generateDropDownMenu(factoryData)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="taskTypeID">
                                                        Task Type
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="taskTypeID"
                                                        size='small'
                                                        onChange={(e) => handleChange(e)}
                                                        value={taskList.taskTypeID}
                                                        variant="outlined"
                                                        id="taskTypeID"
                                                        InputProps={{
                                                            readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                        }}
                                                    >
                                                        <MenuItem value="0">--Select All Task Type--</MenuItem>
                                                        {generateDropDownMenu(taskTypes)}
                                                    </TextField>
                                                </Grid>
                                            </Grid>
                                            <Grid container spacing={3}>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="estateTaskID">
                                                        Task Category
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="estateTaskID"
                                                        onChange={(e) => handleChange(e)}
                                                        size='small'
                                                        value={taskList.estateTaskID}
                                                        variant="outlined"
                                                        id="estateTaskID"
                                                    >
                                                        <MenuItem value="0">--Select Task Category--</MenuItem>
                                                        {generateDropDownMenu(taskCategory)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="productID">
                                                        Product
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="productID"
                                                        onChange={(e) => handleChange(e)}
                                                        size='small'
                                                        value={taskList.productID}
                                                        variant="outlined"
                                                        id="productID"
                                                    >
                                                        <MenuItem value="0">--Select All Product--</MenuItem>
                                                        {generateDropDownMenu(products)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="taskID">
                                                        Task
                                                    </InputLabel>
                                                    <Autocomplete
                                                        key={isCleared}
                                                        id="taskID"
                                                        options={task}
                                                        getOptionLabel={option => option.taskName ?? option.taskName}
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
                                                                value={taskList.taskID}
                                                                getOptionDisabled={true}
                                                            />
                                                        )}
                                                    />
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
                                                                value={taskList.taskID}
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
                                                    onClick={handleSearchButtonClick}
                                                >
                                                    Search
                                                </Button>
                                            </Box>
                                        </CardContent>
                                        {taskData.length > 0 ?
                                            <CustomTable taskData={taskData} setTaskID={setTaskID} setExcel={setExcel} setExcelOne={setExcelOne} permissionList={permissionList.isAddEditScreen} />
                                            : <SearchNotFound searchQuery="Tasks" />}
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