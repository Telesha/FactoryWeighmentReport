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

var screenCode = "TASKCATEGORY"

export default function TaskCategoryAddEdit(props) {
    const [title, setTitle] = useState("Add Task Category")
    const [isUpdate, setIsUpdate] = useState(false);
    const [isDisableButton, setIsDisableButton] = useState(false);
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [estates, setEstates] = useState();
    const [taskType, setTaskType] = useState();

    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });

    const [taskCategory, setTaskCategory] = useState({
        groupID: "0",
        estateID: "0",
        taskTypeID: "0",
        taskCategory: "",
        taskDescription: "",
        isActive: false

    });

    const navigate = useNavigate();
    const handleClick = () => {
        navigate('/app/taskCategory/Listing');
    }

    const alert = useAlert();
    const { estateTaskID } = useParams();
    let decryptedID = 0;

    useEffect(() => {
        getPermission();
        trackPromise(
            GetAllGroups(),
            GetTaskTypes()
        )
    }, []);


    useEffect(() => {
        trackPromise(
            GetEstateDetailsByGroupID()
        )
    }, [taskCategory.groupID]);

    useEffect(() => {
        decryptedID = atob(estateTaskID);
        if (decryptedID != 0) {
            setIsUpdate(true);
            trackPromise(
                GetTaskByEstateTaskID(decryptedID),
            )
        }

    }, []);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITTASKCATEGORY');

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

        setTaskCategory({
            ...taskCategory,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            estateID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function GetAllGroups() {
        const result = await services.getGroupsForDropdown();
        setGroups(result);
    }

    async function GetEstateDetailsByGroupID() {
        var result = await services.getEstateDetailsByGroupID(taskCategory.groupID);
        setEstates(result);
    }

    async function GetTaskTypes() {
        var result = await services.getTaskTypes();
        setTaskType(result);
    }


    async function GetTaskByEstateTaskID(ID) {
        var result = await services.getTaskByEstateTaskID(ID);
        setTaskCategory({
            ...taskCategory,
            groupID: parseInt(result.groupID),
            estateID: parseInt(result.operationEntityID),
            taskTypeID: parseInt(result.taskTypeID),
            taskCategory: result.estateTaskName,
            taskDescription: result.estateTaskDescription,
            isActive: result.isActive,
        });
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

    async function HandleSave(taskCategory) {
        if (isUpdate == true) {

            let updateModel = {
                estateTaskId: atob(estateTaskID.toString()),
                groupID: taskCategory.groupID,
                estateID: taskCategory.estateID,
                taskTypeID: taskCategory.taskTypeID,
                taskCategory: taskCategory.taskCategory,
                taskDescription: taskCategory.taskDescription,
                isActive: taskCategory.isActive,
            }

            let response = await services.updateTask(updateModel);
            if (response.statusCode == "Success") {
                alert.success(response.message);
                setIsDisableButton(true);
                navigate('/app/taskCategory/Listing');
            }
            else {
                alert.error(response.message);
            }
        } else {
            let response = await services.saveTask(taskCategory);
            if (response.statusCode == "Success") {
                alert.success(response.message);
                setIsDisableButton(true);
                navigate('/app/taskCategory/Listing');
            }
            else {
                alert.error(response.message);
            }
        }
    }

    function handleChange1(e) {
        const target = e.target;
        const value = target.name === 'isActive' ? target.checked : target.value
        setTaskCategory({
            ...taskCategory,
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
                            groupID: taskCategory.groupID,
                            estateID: taskCategory.estateID,
                            taskTypeID: taskCategory.taskTypeID,
                            taskCategory: taskCategory.taskCategory,
                            taskDescription: taskCategory.taskDescription,
                            isActive: taskCategory.isActive,
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().min(1, 'Business Division is required').required('Business Division required'),
                                estateID: Yup.number().min(1, 'Location is required').required('Location required'),
                                taskTypeID: Yup.number().min(1, 'Task Type is required').required('Task Type required'),
                                taskCategory: Yup.string().required('Task Category Name is required'),
                                taskDescription: Yup.string().required('Task Description is required'),

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
                                                            value={taskCategory.groupID}
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
                                                        <InputLabel shrink id="estateID">
                                                            Location *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.estateID && errors.estateID)}
                                                            fullWidth
                                                            helperText={touched.estateID && errors.estateID}
                                                            name="estateID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange1(e)}
                                                            value={taskCategory.estateID}
                                                            variant="outlined"
                                                            id="estateID"
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
                                                        <InputLabel shrink id="taskTypeID">
                                                            Task Type *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.taskTypeID && errors.taskTypeID)}
                                                            fullWidth
                                                            helperText={touched.taskTypeID && errors.taskTypeID}
                                                            name="taskTypeID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange1(e)}
                                                            value={taskCategory.taskTypeID}
                                                            variant="outlined"
                                                            id="taskTypeID"
                                                            size="small"
                                                        >
                                                            <MenuItem value="0">--Select Task Type--</MenuItem>
                                                            {generateDropDownMenu(taskType)}
                                                        </TextField>
                                                    </Grid>
                                                </Grid>

                                                <Grid container spacing={3}>

                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="taskCategory">
                                                            Task Category Name *
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.taskCategory && errors.taskCategory)}
                                                            fullWidth
                                                            helperText={touched.taskCategory && errors.taskCategory}
                                                            name="taskCategory"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange1(e)}
                                                            value={taskCategory.taskCategory}
                                                            variant="outlined"
                                                            id="taskCategory"
                                                            size="small"

                                                        >
                                                        </TextField>
                                                    </Grid>


                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="taskDescription">
                                                            Task Category Description *
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.taskDescription && errors.taskDescription)}
                                                            fullWidth
                                                            helperText={touched.taskDescription && errors.taskDescription}
                                                            name="taskDescription"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange1(e)}
                                                            value={taskCategory.taskDescription}
                                                            variant="outlined"
                                                            id="taskDescription"
                                                            size="small"

                                                        >
                                                        </TextField>
                                                    </Grid>
                                                </Grid>

                                                <Grid container spacing={3}>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="isActive">
                                                            Active
                                                        </InputLabel>
                                                        <Switch
                                                            checked={taskCategory.isActive}
                                                            onChange={(e) => handleChange1(e)}
                                                            name="isActive"
                                                            disabled={isDisableButton}
                                                        />
                                                    </Grid>
                                                </Grid>

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