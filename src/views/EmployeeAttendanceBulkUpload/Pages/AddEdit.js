import React, { useState, useEffect } from 'react';
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
    InputLabel
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import CSVReader from 'react-csv-reader';
import { confirmAlert } from 'react-confirm-alert';
import MaterialTable from "material-table";
import { Fragment } from 'react';
import { LoadingComponent } from '../../../utils/newLoader';
import tokenDecoder from '../../../utils/tokenDecoder';
import { useAlert } from "react-alert";
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
    },
    row: {
        marginTop: '1rem'
    }



}));

const screenCode = 'EMPLOYEEATTENDANCEBULKUPLOAD';
export default function EmployeeAttendanceBulkUpload(props) {
    const [title, setTitle] = useState("Employee Attendance Bulk Upload")
    const classes = useStyles();
    const alert = useAlert();
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [routes, setRoutes] = useState();
    const [attendanceData, setAttendanceData] = useState([]);
    const [error, setError] = useState([]);
    const [isDisableButton, setIsDisableButton] = useState(false);
    const [IsUploadingFinished, setIsUploadingFinished] = useState(false)
    const [attendanceBulkUpload, setAttendanceBulkUpload] = useState({
        groupID: '0',
        factoryID: '0'
    })
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });

    const handleClose = () => {
        setIsDisableButton(false);
        setOpen(false);
    };
    const [open, setOpen] = React.useState(true);
    const papaparseOptions = {
        header: true,
        dynamicTyping: false,
        quoteChar: '"',
        skipEmptyLines: true,
        parseNumbers: true,
        transformHeader: header => header.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '')
    };
    const navigate = useNavigate();

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        trackPromise(getFactoriesForDropDown()
        );
    }, [attendanceBulkUpload.groupID]);

    useEffect(() => {
        trackPromise(
            getRoutesByFactoryID()
        )
    }, [attendanceBulkUpload.factoryID]);


    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWEMPLOYEEATTENDANCEBULKUPLOAD');

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

        setAttendanceBulkUpload({
            ...attendanceBulkUpload,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }
    async function getFactoriesForDropDown() {
        const factory = await services.getFactoryByGroupID(attendanceBulkUpload.groupID);
        setFactories(factory);
    }

    async function getRoutesByFactoryID() {
        const route = await services.getRoutesForDropDown(attendanceBulkUpload.factoryID);
        setRoutes(route);
    }

    const handleForce = (data, fileInfo) => {

        if (attendanceData.length > 0) {
            confirmAlert({
                title: 'Confirmation Message',
                message: 'Are you sure to browse a new file without uploading existing file.',
                buttons: [
                    {
                        label: 'Yes',
                        onClick: () => confirmUpload(data, fileInfo)
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
        else {
            confirmUpload(data, fileInfo);
        }

    }

    function confirmUpload(data, fileInfo) {
        setIsUploadingFinished(false);
        setAttendanceData(data);
    }

    async function saveEmployeeAttendance() {

        attendanceData.forEach(x => {
            x.groupID = parseInt(attendanceBulkUpload.groupID);
            x.factoryID = parseInt(attendanceBulkUpload.factoryID);
            x.createdBy = tokenDecoder.getUserIDFromToken();
            x.dayOT = parseInt(x.dayOT);
            x.days = parseInt(x.days);
            x.nightOT = parseInt(x.nightOT);
            x.date = moment(x.date).format('YYYY-MM-DD');
        });
        let response = await services.saveEmployeeAttendanceBulk(attendanceData);
        response.data.forEach(x => {
            x.date = moment(x.date).format('YYYY-MM-DD');
        });
        if (response.statusCode == "Error") {
            setIsUploadingFinished(true);
            setAttendanceData(response.data)
            alert.error(response.message);
        }
        else {
            setAttendanceData([]);
            alert.success(response.message);
        }
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
        setAttendanceBulkUpload({
            ...attendanceBulkUpload,
            [e.target.name]: value
        });
        clearScreen();
    }

    function clearScreen() {
        setAttendanceData([]);
        document.querySelector('.csv-input').value = '';
    }

    function clearData() {
        setIsUploadingFinished(false);
        setAttendanceBulkUpload({
            ...attendanceBulkUpload,
            factoryID: '0'
        });
        setAttendanceData([]);
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: attendanceBulkUpload.groupID,
                            factoryID: attendanceBulkUpload.factoryID
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required')
                            })
                        }
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
                                                            Group *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.groupID && errors.groupID)}
                                                            fullWidth
                                                            helperText={touched.groupID && errors.groupID}
                                                            name="groupID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={attendanceBulkUpload.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            disabled={!permissionList.isGroupFilterEnabled}
                                                            size = 'small'

                                                        >
                                                            <MenuItem value="0">--Select Group--</MenuItem>
                                                            {generateDropDownMenu(groups)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="factoryID">
                                                            Factory *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.factoryID && errors.factoryID)}
                                                            fullWidth
                                                            helperText={touched.factoryID && errors.factoryID}
                                                            name="factoryID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={attendanceBulkUpload.factoryID}
                                                            variant="outlined"
                                                            id="factoryID"
                                                            disabled={!permissionList.isFactoryFilterEnabled}
                                                            size = 'small'
                                                        >
                                                            <MenuItem value="0">--Select Factory--</MenuItem>
                                                            {generateDropDownMenu(factories)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink>
                                                            Select File *
                                                        </InputLabel>
                                                        <CSVReader
                                                            inputStyle={{ width: '100%', height: '56px' }}
                                                            cssClass="react-csv-input"
                                                            onFileLoaded={handleForce}
                                                            parserOptions={papaparseOptions}
                                                            inputId="react-csv-reader-input"
                                                        />
                                                    </Grid>
                                                </Grid>

                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    <Button
                                                        color="primary"
                                                        type="reset"
                                                        variant="outlined"
                                                        onClick={() => clearData()}
                                                        size = 'small'
                                                    >
                                                        Clear
                                                    </Button>
                                                </Box>
                                                <br />

                                                {attendanceData.length > 0 && IsUploadingFinished === true ?
                                                    <CardHeader style={{ marginLeft: '-1rem' }} titleTypographyProps={{ variant: 'h6' }}
                                                        title="Failed Records"
                                                    /> : null}

                                                <Box minWidth={1050}>
                                                    {attendanceData.length > 0 ?
                                                        <MaterialTable
                                                            title="Multiple Actions Preview"
                                                            columns={[
                                                                { title: 'Date', field: 'date' },
                                                                { title: 'Emp Name', field: 'empName' },
                                                                { title: 'Registration Number', field: 'registrationNumber' },
                                                                {
                                                                    title: 'Days', field: 'days', lookup: {
                                                                        1: 'Full Day',
                                                                        2: 'Half Day'
                                                                    }
                                                                },
                                                                { title: 'Day OT', field: 'dayOT', render: data => data.dayOT == 1 ? data.dayOT + ' hour' : data.dayOT + ' hours' },
                                                                { title: 'Night OT', field: 'nightOT', render: data => data.nightOT == 1 ? data.nightOT + ' hour' : data.nightOT + ' hours' },
                                                            ]}
                                                            data={attendanceData}
                                                            options={{
                                                                exportButton: false,
                                                                showTitle: false,
                                                                headerStyle: { textAlign: "left", height: '1%' },
                                                                cellStyle: { textAlign: "left" },
                                                                columnResizable: false,
                                                                actionsColumnIndex: -1,
                                                                pageSize: 10
                                                            }}
                                                            actions={[

                                                            ]}
                                                        /> : null}
                                                </Box>
                                                {attendanceData.length > 0 ?
                                                    <Box display="flex" justifyContent="flex-end" p={2}>
                                                        <Button
                                                            color="primary"
                                                            type="submit"
                                                            variant="contained"
                                                            onClick={() => (trackPromise(saveEmployeeAttendance()))}
                                                        >
                                                            Upload
                                                        </Button>
                                                    </Box> : null}
                                            </CardContent>
                                        </PerfectScrollbar>
                                    </Card>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </Container>
            </Page>
        </Fragment>
    )

}