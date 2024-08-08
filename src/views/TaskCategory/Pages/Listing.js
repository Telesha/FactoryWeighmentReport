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
    Button
} from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import MaterialTable from "material-table";
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import SearchNotFound from 'src/views/Common/SearchNotFound';
import xlsx from 'json-as-xlsx';
import { CustomTable } from './CustomTable';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    },
    colorRecord: {
        backgroundColor: 'green'
    }
}));

var screenCode = "TASKCATEGORY"
export default function TaskCategoryListing() {
    const [IDDataForDefaultLoad, setIsIDDataForDefaultLoad] = useState(null);
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [estates, setEstates] = useState();
    const [estateTaskID, setEstateTaskID] = useState(0);
    const [isViewTable, setIsViewTable] = useState(true);
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [taskCategory, setTaskCategory] = useState({
        groupID: "0",
        estateID: "0",
        taskTypeID: "0"
    })
    const [taskData, setTaskData] = useState([]);
    const [taskTypes, setTaskTypes] = useState([]);
    const navigate = useNavigate();
    let encrypted = "";
    const handleClick = () => {
        encrypted = btoa('0');
        navigate('/app/taskCategory/addEdit/' + encrypted);
    }
    const [excel, setExcel] = useState(false);
    useEffect(() => {
        if (IDDataForDefaultLoad != null) {
            GetTaskByEstateID();
        }
    }, [IDDataForDefaultLoad]);

    const handleClickEdit = (estateTaskID) => {
        encrypted = btoa(estateTaskID.toString());
        let model = {
            groupID: parseInt(taskCategory.groupID),
            estateID: parseInt(taskCategory.estateID),
            taskTypeID: parseInt(taskCategory.taskTypeID),
        }
        sessionStorage.setItem(
            'taskCategory-listing-page-search-parameters-id',
            JSON.stringify(model)
        );
        navigate('/app/taskCategory/addedit/' + encrypted);
    }

    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });

    useEffect(() => {
        if (estateTaskID != 0) {
            handleClickEdit(estateTaskID)
        }
    }, [estateTaskID]);


    useEffect(() => {
        const IDDATA = JSON.parse(
            sessionStorage.getItem('taskCategory-listing-page-search-parameters-id')
        );
        getPermission(IDDATA);

    }, []);

    useEffect(() => {
        sessionStorage.removeItem(
            'taskCategory-listing-page-search-parameters-id'
        );
    }, []);


    useEffect(() => {
        trackPromise(
            GetAllGroups()
        );
    }, []);

    useEffect(() => {
        trackPromise(
            GetEstateDetailsByGroupID()
        )
    }, [taskCategory.groupID]);

    useEffect(() => {
        trackPromise(
            GetTaskByEstateID()
        )
    }, [taskCategory.groupID, taskCategory.estateID, taskCategory.taskTypeID]);

    useEffect(() => {
        trackPromise(
            getTaskTypes()
        )
    }, []);
    useEffect(() => {
        if (excel == true) {
            createFile()
        }
    }, [excel]);

    async function getPermission(IDDATA) {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWTASKCATEGORY');

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

        const isInitialLoad = IDDATA === null || undefined
        if (isInitialLoad) {
            setTaskCategory({
                ...taskCategory,
                groupID: parseInt(tokenService.getGroupIDFromToken()),
                estateID: parseInt(tokenService.getFactoryIDFromToken())
            })

        }
        else {
            setTaskCategory({
                ...taskCategory,
                taskTypeID: parseInt(IDDATA.taskTypeID),
                estateID: parseInt(IDDATA.estateID),
                groupID: parseInt(IDDATA.groupID)
            })
            setIsIDDataForDefaultLoad(IDDATA);
        }
    }
    async function GetAllGroups() {
        const result = await services.getGroupsForDropdown();
        setGroups(result);
    }

    async function GetEstateDetailsByGroupID() {
        var result = await services.getEstateDetailsByGroupID(taskCategory.groupID);
        setEstates(result);
    }

    async function getTaskTypes() {
        var result = await services.getTaskTypes();
        setTaskTypes(result);
    }

    async function GetTaskByEstateID() {
        var result = await services.getTaskByEstateID(taskCategory.groupID, taskCategory.estateID, taskCategory.taskTypeID);
        setTaskData(result);
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
        setTaskCategory({
            ...taskCategory,
            [e.target.name]: value,
            estateID: "0"
        });
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setTaskCategory({
            ...taskCategory,
            [e.target.name]: value
        });
    }

    async function createFile() {
        setExcel(false)
        var file = await createDataForExcel(taskData);
        var settings = {
            sheetName: 'Task Categories',
            fileName: 'Task Categories',
            writeOptions: {}
        }
        let keys = Object.keys(file[0])
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem })
        })
        let dataA = [
            {
                sheet: 'Task Categories',
                columns: tempcsvHeaders,
                content: file
            }
        ]
        xlsx(dataA, settings);
    }

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            array.map(x => {
                var vr = {
                    'Business Division': x.groupName,
                    'Location': x.factoryName,
                    'Task Type': x.taskTypeName,
                    'Task Category Name': x.estateTaskName,
                    'Task Category Description': x.estateTaskDescription,
                    'Status': x.isActive == true ? 'Active' : 'InActive'
                }
                res.push(vr);
            });
        }
        return res;
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
                        toolTiptitle={"Edit Task Category"}
                    />
                </Grid>
            </Grid>
        )
    }
    return (
        <Page
            className={classes.root}
            title="Task Categories"
        >
            <Container maxWidth={false}>
                <Box mt={0}>
                    <Card>
                        <CardHeader
                            title={cardTitle("Task Categories")}
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
                                            size='small'
                                            onChange={(e) => handleGroupChange(e)}
                                            value={taskCategory.groupID}
                                            variant="outlined"
                                            InputProps={{
                                                readOnly: !permissionList.isGroupFilterEnabled ? true : false
                                            }}
                                        >
                                            <MenuItem value="0">--Select All Business Division--</MenuItem>
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
                                            value={taskCategory.estateID}
                                            variant="outlined"
                                            id="estateID"
                                            InputProps={{
                                                readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                            }}
                                        >
                                            <MenuItem value="0">--Select All Location--</MenuItem>
                                            {generateDropDownMenu(estates)}
                                        </TextField>
                                    </Grid>

                                    <Grid item md={4} xs={12}>
                                        <InputLabel shrink id="taskTypeID">
                                            Task Type *
                                        </InputLabel>
                                        <TextField select
                                            fullWidth
                                            name="taskTypeID"
                                            size='small'
                                            onChange={(e) => handleChange(e)}
                                            value={taskCategory.taskTypeID}
                                            variant="outlined"
                                            id="taskTypeID"
                                        >
                                            <MenuItem value="0">--Select All Task Type--</MenuItem>
                                            {generateDropDownMenu(taskTypes)}
                                        </TextField>
                                    </Grid>
                                </Grid>
                            </CardContent>
                            {taskData.length > 0 ?
                                <CustomTable taskData={taskData} setEstateTaskID={setEstateTaskID} setExcel={setExcel} permissionList={permissionList.isAddEditScreen} />
                                : <SearchNotFound searchQuery="Tasks" />}
                        </PerfectScrollbar>
                    </Card>
                </Box>
            </Container>
        </Page>
    );
};

