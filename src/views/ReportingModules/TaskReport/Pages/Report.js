import React, { useState, useEffect, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box,
    Card,
    Button,
    makeStyles,
    Container,
    Divider,
    CardContent,
    CardHeader,
    Grid,
    TextField,
    MenuItem,
    InputLabel,
} from '@material-ui/core';
import Page from 'src/components/Page';
import * as Yup from "yup";
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import { Formik } from 'formik';
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePDF';
import { LoadingComponent } from 'src/utils/newLoader';
import { useAlert } from "react-alert";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import xlsx from 'json-as-xlsx';

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
    row: {
        marginTop: '1rem'
    },
    colorCancel: {
        backgroundColor: "red",
    },
    colorRecordAndNew: {
        backgroundColor: "#FFBE00"
    },
    colorRecord: {
        backgroundColor: "green",
    }

}));

const screenCode = 'TASKREPORT';

export default function TaskReport(props) {
    const [title, setTitle] = useState("Task Report")
    const classes = useStyles();
    const [GroupList, setGroupList] = useState([]);
    const [estates, setEstates] = useState([]);
    const [taskCategory, setTaskCategory] = useState([]);
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [taskData, setTaskData] = useState([]);
    const [products, setProducts] = useState([]);
    const [taskReport, setTaskReport] = useState({
        groupID: '0',
        estateID: '0',
        estateTaskID: '0',
        productID: '0',
    })
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: '',
        estateName: 0,
        estateTaskName: 0,
        productName: '',
    })
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });

    const componentRef = useRef();
    const navigate = useNavigate();
    const alert = useAlert();

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        getEstateDetailsByGroupID();
    }, [taskReport.groupID]);

    useEffect(() => {
        trackPromise(
            getAllTaskNames()
        )
    }, [taskReport.groupID, taskReport.estateID]);

    useEffect(() => {
        setTaskData([]);
    }, [taskReport]);

    useEffect(() => {
        trackPromise(
            GetMappedProductsByFactoryID()
        )
    }, [taskReport.estateID]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWTASKREPORT');

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

        setTaskReport({
            ...taskReport,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            estateID: parseInt(tokenService.getFactoryIDFromToken())
        })

    }
    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroupList(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(taskReport.groupID);
        setEstates(response);
    }

    async function getAllTaskNames() {
        const result = await services.getAllTaskNames(taskReport.groupID, taskReport.estateID);
        setTaskCategory(result);
    }
    async function GetMappedProductsByFactoryID() {
        var response = await services.GetMappedProductsByFactoryID(taskReport.estateID);
        setProducts(response);
    };
    async function GetDetails() {
        let model = {
            groupID: parseInt(taskReport.groupID),
            estateID: parseInt(taskReport.estateID),
            estateTaskID: parseInt(taskReport.estateTaskID),
            productID: parseInt(taskReport.productID),
        }
        getSelectedDropdownValuesForReport(model);
        const response = await services.GetTaskReportDetails(model);
        if (response.statusCode === "Success" && response.data !== null) {
            setTaskData(response.data);
        } else {
            alert.error("No Records to Display");
        }
    }

    async function createDataForExcel() {
        var res = [];
        if (taskData != null) {
            taskData.forEach(data => {
                res.push({
                    'Task Code': data.estateTaskName,
                    'Task Name': '',
                    'Budget Code': '',
                    //'Measuring Unit': '',
                });
                data.details.forEach(detail => {
                    var vr = {
                        'Task Code': detail.taskCode,
                        'Task Name': detail.taskName,
                        'Budget Code': detail.budgetexpensescode,
                        //'Measuring Unit': detail.measuringUnitName,
                    };
                    res.push(vr);
                });
            });
        }
        return res;
    }


    async function createFile() {
        var file = await createDataForExcel(taskData);
        var settings = {
            sheetName: 'Task Report',
            fileName:
                'Task Report',
            writeOptions: {}
        };
        let keys = Object.keys(file[0]);
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem });
        });
        let dataA = [
            {
                sheet: 'Task Report',
                columns: tempcsvHeaders,
                content: file
            }
        ];
        xlsx(dataA, settings);
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

    function cardTitle(titleName) {
        return (
            <Grid container spacing={1}>
                <Grid item md={10} xs={12}>
                    {titleName}
                </Grid>
            </Grid>
        )
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setTaskReport({
            ...taskReport,
            [e.target.name]: value
        });
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: GroupList[searchForm.groupID],
            estateName: estates[searchForm.estateID],
            estateTaskName: taskCategory[searchForm.estateTaskID],
            productName: products[searchForm.productID],
        })
    }

    const getAge = birthDate => Math.floor((new Date() - new Date(birthDate).getTime()) / 3.15576e+10)
    return (
        <Page className={classes.root} title={title}>
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: taskReport.groupID,
                        estateID: taskReport.estateID,
                        estateTaskID: taskReport.estateTaskID,
                        productID: taskReport.productID,
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Business Division is required').min("1", 'Business Division is required'),
                            estateID: Yup.number().required('Location is required').min("1", 'Location is required')
                        })
                    }
                    onSubmit={() => trackPromise(GetDetails())}
                    enableReinitialize
                >
                    {({
                        errors,
                        handleBlur,
                        handleSubmit,
                        touched
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
                                                        onChange={(e) => handleChange(e)}
                                                        value={taskReport.groupID}
                                                        variant="outlined"
                                                        size='small'
                                                        InputProps={{
                                                            readOnly: !permissionList.isGroupFilterEnabled,
                                                        }}
                                                    >
                                                        <MenuItem value="0">--Select Business Division--</MenuItem>
                                                        {generateDropDownMenu(GroupList)}
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
                                                        size='small'
                                                        onChange={(e) => {
                                                            handleChange(e)
                                                        }}
                                                        value={taskReport.estateID}
                                                        variant="outlined"
                                                        id="estateID"
                                                        InputProps={{
                                                            readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                        }}
                                                    >
                                                        <MenuItem value={0}>--Select Location--</MenuItem>
                                                        {generateDropDownMenu(estates)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="estateTaskID">
                                                        Task Category
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="estateTaskID"
                                                        onChange={(e) => handleChange(e)}
                                                        size='small'
                                                        value={taskReport.estateTaskID}
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
                                                        value={taskReport.productID}
                                                        variant="outlined"
                                                        id="productID"
                                                    >
                                                        <MenuItem value="0">--Select All Product--</MenuItem>
                                                        {generateDropDownMenu(products)}
                                                    </TextField>
                                                </Grid>
                                            </Grid>
                                            <Grid container justify="flex-end">
                                                <Box pt={2}>
                                                    <Button
                                                        color="primary"
                                                        variant="contained"
                                                        type='submit'
                                                    >
                                                        Search
                                                    </Button>
                                                </Box>
                                            </Grid>
                                            <br />
                                            <Box minWidth={1050}>
                                                <br></br>
                                                <br></br>
                                                {taskData.length > 0 ?
                                                    <TableContainer component={Paper}>
                                                        <Table className={classes.table} aria-label="simple table" size='small'>
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Budget Code</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Task Code</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Task Name</TableCell>
                                                                    {/* <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Measuring Unit</TableCell> */}
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {taskData.map((data, i) => {
                                                                    return (
                                                                        <React.Fragment key={i}>
                                                                            <TableRow>
                                                                                <TableCell colSpan={3} component="th" scope="row" align="left" style={{ fontWeight: 'bolder', color: 'blue', borderLeft: '1px dashed black', borderBottom: '1px dashed black' }}>{data.estateTaskName}</TableCell>
                                                                            </TableRow>
                                                                            {data.details.map((detail, k) => {
                                                                                return (
                                                                                    <TableRow key={`${i}-${k}`}>
                                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black", borderLeft: "1px dashed black" }}> {detail.budgetexpensescode}</TableCell>
                                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black", borderLeft: "1px dashed black" }}> {detail.taskCode}</TableCell>
                                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black", borderLeft: "1px dashed black" }}> {detail.taskName}</TableCell>
                                                                                        {/* <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black", borderLeft: "1px dashed black" }}> {detail.measuringUnitName}</TableCell> */}
                                                                                    </TableRow>
                                                                                );
                                                                            })}

                                                                        </React.Fragment>
                                                                    );
                                                                })}
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer> : null}
                                            </Box>
                                        </CardContent>
                                        {taskData.length > 0 ?
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                {/* <Button
                                                    color="primary"
                                                    id="btnRecord"
                                                    variant="contained"
                                                    style={{ marginRight: '1rem' }}
                                                    className={classes.colorRecord}
                                                    onClick={createFile}
                                                >
                                                    EXCEL
                                                </Button>
                                                <div>&nbsp;</div> */}
                                                <ReactToPrint
                                                    documentTitle={"Task Report"}
                                                    trigger={() => <Button
                                                        color="primary"
                                                        id="btnCancel"
                                                        variant="contained"
                                                        style={{ marginRight: '1rem' }}
                                                        className={classes.colorCancel}
                                                    >
                                                        PDF
                                                    </Button>}
                                                    content={() => componentRef.current}
                                                />
                                                <div hidden={true}>
                                                    <CreatePDF ref={componentRef}
                                                        searchData={selectedSearchValues} taskData={taskData} />
                                                </div>
                                            </Box>
                                            : null
                                        }
                                    </PerfectScrollbar>
                                </Card>
                            </Box>
                        </form>
                    )}
                </Formik>
            </Container>
        </Page>
    )
}