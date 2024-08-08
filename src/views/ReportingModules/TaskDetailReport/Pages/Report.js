import React, { useState, useEffect, Fragment, useRef } from 'react';
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
    CardHeader,
    MenuItem,
    Table
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from 'yup';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
import ReactToPrint from 'react-to-print';
import CreatePDF from './CreatePDF';
import { useAlert } from 'react-alert';
import Paper from '@material-ui/core/Paper';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';

const useStyles = makeStyles(theme => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    },
    avatar: {
        marginRight: theme.spacing(2)
    },
    colorCancel: {
        backgroundColor: 'red'
    },
    colorRecord: {
        backgroundColor: 'green'
    }
}));

const screenCode = 'TASKDETAILREPORT';

export default function TaskDetailReport(props) {
    const [title, setTitle] = useState('Task Detail Report');
    const classes = useStyles();
    const [taskDetail, setTaskDetail] = useState({
        groupID: 0,
        gardenID: 0,
        productID: '0',
        estateTaskID: '0',
        taskTypeID: '0',
        employeeCategoryID: 0,
    });
    const [GroupList, setGroupList] = useState([]);
    const [gardens, setGardens] = useState([]);
    const [products, setProducts] = useState([]);
    const [costCenters, setCostCenters] = useState();
    const [employeeType, setEmployeeType] = useState();
    const [searchQuery, setSearchQuery] = useState('');
    const [page,setPage] = useState(0);
    const [limit,setLimit] = useState(5);
    const [taskTypes, setTaskTypes] = useState([]);
    const [taskCategory, setTaskCategory] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [employeeSubCategoryMapping, setEmployeeSubCategoryMapping] = useState([]);
    const [gangs, setGangs] = useState([]);
    const [employeeCategory, setEmployeeCategory] = useState();
    const [employeeData, setEmployeeData] = useState([]);
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const navigate = useNavigate();

    const handleLimitChange = (event) => {
        setLimit(event.target.value);
    };
    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        gardenName: '0',
        groupName: '0',
        productID: '',
        estateTaskID: '',
        taskTypeID: '',
        employeeCategoryID: '',
    });
    const componentRef = useRef();
    const alert = useAlert();

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID());
    }, [taskDetail.groupID]);

    useEffect(() => {
        setEmployeeData([])
    }, [taskDetail.gardenID]);

    useEffect(() => {
        trackPromise(
            GetMappedProductsByFactoryID()
        )
    }, [taskDetail.gardenID]);

    useEffect(() => {
        getPermission();
        trackPromise(
            getTaskTypes(), getEmployeeCategoriesForDropdown()
        );
    }, []);

    useEffect(() => {
        trackPromise(
            getAllTaskNames()
        )
    }, [taskDetail.groupID, taskDetail.gardenID]);

    useEffect(() => {
        setEmployeeData([])
    }, [taskDetail.employeeCategoryID]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(
            p => p.permissionCode == 'VIEWTASKDETAILREPORT'
        );

        if (isAuthorized === undefined) {
            navigate('/404');
        }
        var isGroupFilterEnabled = permissions.find(
            p => p.permissionCode == 'GROUPDROPDOWN'
        );
        var isFactoryFilterEnabled = permissions.find(
            p => p.permissionCode == 'FACTORYDROPDOWN'
        );

        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
        });

        setTaskDetail({
            ...taskDetail,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            gardenID: parseInt(tokenService.getFactoryIDFromToken())
        });
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value;
        setTaskDetail({
            ...taskDetail,
            [e.target.name]: value
        });
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroupList(groups);
    }

    async function getEstateDetailsByGroupID() {
        const factory = await services.getEstateDetailsByGroupID(taskDetail.groupID);
        setGardens(factory);
    };

    async function GetMappedProductsByFactoryID() {
        var response = await services.GetMappedProductsByFactoryID(taskDetail.gardenID);
        setProducts(response);
    };

    async function GetTaskDetails() {
        var result = await services.GetTaskDetails(taskDetail.groupID, taskDetail.gardenID, taskDetail.productID, taskDetail.taskTypeID, taskDetail.estateTaskID, taskDetail.employeeCategoryID);
        setEmployeeData(result);
        getSelectedDropdownValuesForReport(taskDetail);
    }

    async function getTaskTypes() {
        var result = await services.getTaskTypes();
        setTaskTypes(result);
    }

    async function getAllTaskNames() {
        const result = await services.getAllTaskNames(taskDetail.groupID, taskDetail.gardenID);
        setTaskCategory(result);
    }

    async function getEmployeeCategoriesForDropdown() {
        const result = await services.getEmployeeCategoriesForDropdown();
        setEmployeeCategory(result)
    }

    function generateDropDownMenu(data) {
        let items = [];
        if (data != null) {
            for (const [key, value] of Object.entries(data)) {
                items.push(
                    <MenuItem key={key} value={key}>
                        {value}
                    </MenuItem>
                );
            }
        }
        return items;
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

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            gardenName: gardens[searchForm.gardenID],
            groupName: GroupList[searchForm.groupID],
            productID: products[searchForm.productID],
            estateTaskID: taskCategory[searchForm.estateTaskID],
            taskTypeID: taskTypes[searchForm.taskTypeID],
            employeeCategoryID: employeeCategory[searchForm.employeeCategoryID],
        });
    }
    function cardTitle(titleName) {
        return (
            <Grid container spacing={1}>
                <Grid item md={10} xs={12}>
                    {titleName}
                </Grid>
            </Grid>
        );
    }

    return (
        <Fragment>
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: taskDetail.groupID,
                            gardenID: taskDetail.gardenID,
                            productID: taskDetail.productID,
                            estateTaskID: taskDetail.estateTaskID,
                            taskTypeID: taskDetail.taskTypeID,
                            employeeCategoryID: taskDetail.employeeCategoryID,
                        }}
                        validationSchema={Yup.object().shape({
                            groupID: Yup.number()
                                .required('Business Division is required')
                                .min('1', 'Business Division is required'),
                            gardenID: Yup.number()
                                .required('Location is required')
                                .min('1', 'Location is required')
                        })}
                        onSubmit={() => trackPromise(GetTaskDetails())}
                        enableReinitialize
                    >
                        {({ errors, handleBlur, handleSubmit, touched }) => (
                            <form onSubmit={handleSubmit}>
                                <Box mt={0}>
                                    <Card>
                                        <CardHeader title={cardTitle(title)} />
                                        <PerfectScrollbar>
                                            <Divider />
                                            <CardContent>
                                                <Grid container spacing={3}>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="groupID">
                                                            Business Division *
                                                        </InputLabel>
                                                        <TextField
                                                            select
                                                            error={Boolean(touched.groupID && errors.groupID)}
                                                            fullWidth
                                                            helperText={touched.groupID && errors.groupID}
                                                            name="groupID"
                                                            onBlur={handleBlur}
                                                            onChange={e => handleChange(e)}
                                                            value={taskDetail.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            disabled={!permissionList.isGroupFilterEnabled}
                                                            size="small"
                                                        >
                                                            <MenuItem value="0">--Select Business Division--</MenuItem>
                                                            {generateDropDownMenu(GroupList)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="gardenID">
                                                            Location *
                                                        </InputLabel>
                                                        <TextField
                                                            select
                                                            error={Boolean(touched.gardenID && errors.gardenID)}
                                                            fullWidth
                                                            helperText={touched.gardenID && errors.gardenID}
                                                            name="gardenID"
                                                            onBlur={handleBlur}
                                                            onChange={e => handleChange(e)}
                                                            value={taskDetail.gardenID}
                                                            variant="outlined"
                                                            id="gardenID"
                                                            disabled={!permissionList.isFactoryFilterEnabled}
                                                            size="small"
                                                        >
                                                            <MenuItem value="0">--Select Location --</MenuItem>
                                                            {generateDropDownMenu(gardens)}
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
                                                            value={taskDetail.taskTypeID}
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
                                                            value={taskDetail.estateTaskID}
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
                                                            value={taskDetail.productID}
                                                            variant="outlined"
                                                            id="productID"
                                                        >
                                                            <MenuItem value="0">--Select All Product--</MenuItem>
                                                            {generateDropDownMenu(products)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="employeeCategoryID">
                                                            Employee Category
                                                        </InputLabel>
                                                        <TextField select fullWidth
                                                            size='small'
                                                            name="employeeCategoryID"
                                                            value={taskDetail.employeeCategoryID}
                                                            type="text"
                                                            variant="outlined"
                                                            id="employeeCategoryID"
                                                            onChange={(e) => handleChange(e)}
                                                        >
                                                            <MenuItem value="0">--Select Employee Category--</MenuItem>
                                                            {generateDropDownMenuWithTwoValues(employeeCategory)}
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
                                            <Box minWidth={1050}>
                                                {employeeData.length > 0 ? (
                                                    <TableContainer component={Paper}>
                                                        <Table className={classes.table} size='small' aria-label="simple table" style={{ backgroundSize: '10px'}}>
                                                            <TableHead>
                                                                <TableRow >
                                                                    <TableCell align="left"  style={{ fontWeight: "bold", border: "1px solid black"  }}>GL Code</TableCell>
                                                                    <TableCell align="left"  style={{ fontWeight: "bold", border: "1px solid black" }}>Task Name</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Task Code</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Measuring Unit</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Emp.Category Type</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Expense Type</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {employeeData.slice(page * limit, page * limit + limit).map((rows, i) => (
                                                                    <>
                                                                        <TableRow key={i}>
                                                                            <TableCell colSpan={6} align="left" style={{ fontWeight: "bold", border: "1px solid black" }}> {"Task Category : " + rows.taskCategoryName}</TableCell>
                                                                        </TableRow>
                                                                        {rows.tasks.map((row) => {
                                                                            return (
                                                                                <TableRow>
                                                                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.budgetexpensescode}</TableCell>
                                                                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.taskName}</TableCell>
                                                                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.taskCode}</TableCell>
                                                                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.measuringUnitName}</TableCell>
                                                                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.employeeCategoryName}</TableCell>
                                                                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.taskTypeName}</TableCell>
                                                                                </TableRow>
                                                                            );
                                                                        })}
                                                                    </>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                ) : null}
                                            </Box>
                                            </CardContent>

                                            {employeeData.length > 0 ? (
                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    <div>&nbsp;</div>
                                                    <ReactToPrint
                                                        documentTitle={'Task Detail Report'}
                                                        trigger={() => (
                                                            <Button
                                                                color="primary"
                                                                id="btnRecord"
                                                                variant="contained"
                                                                style={{ marginRight: '1rem' }}
                                                                className={classes.colorCancel}
                                                                size="small"
                                                            >
                                                                PDF
                                                            </Button>
                                                        )}
                                                        content={() => componentRef.current}
                                                    />
                                                    <div hidden={true}>
                                                        <CreatePDF
                                                            ref={componentRef}
                                                            searchData={selectedSearchValues}
                                                            employeeData={employeeData}
                                                        />
                                                    </div>
                                                </Box>
                                            ) : null}
                                        </PerfectScrollbar>
                                    </Card>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </Container>
            </Page>
        </Fragment>
    );
}
