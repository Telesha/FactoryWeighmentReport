import React, { useState, useEffect, Fragment, useRef } from 'react';
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
    Checkbox,
    Chip
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import * as Yup from "yup";
import { LoadingComponent } from 'src/utils/newLoader';
import { Formik } from 'formik';
import { useAlert } from "react-alert";
import PageHeader from 'src/views/Common/PageHeader';
import MaterialTable from "material-table";
import moment from 'moment';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";

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
    colorCancel: {
        backgroundColor: "red",
    },
    colorRecordAndNew: {
        backgroundColor: "#FFBE00"
    },
    colorRecord: {
        backgroundColor: "green",
    },
    colorReject: {
        backgroundColor: "red",
    },
    colorApprove: {
        backgroundColor: "green",
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 200,
    },
}));

const screenCode = 'EMPLOYEELEAVEBULK';

export default function EmployeeLeaveBulkListing(props) {
    const [title, setTitle] = useState("Employee Leave Bulk")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [costCenters, setCostCenters] = useState();
    const [gangs, setGangs] = useState([]);
    const [employeeReligions, setEmployeeReligions] = useState([]);
    const [employeeSubCategoryMapping, setEmployeeSubCategoryMapping] = useState();
    const [payPoints, setPayPoints] = useState([]);
    const [leaveFormData, setLeaveFormData] = useState({
        groupID: 0,
        factoryID: 0,
        costCenterID: 0,
        payPointID: 0,
        gangID: 0,
        religionID: 0,
        regNo: '',
        todayDate: new Date(),
        employeeSubCategoryMappingID: 0
    })
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
        isLeaveRequestApproveReject: false
    });
    const [leaveRequestData, setLeaveRequestData] = useState([]);
    const [found, setFound] = useState([]);
    const [pendingCount, setPendingCount] = useState(0);
    const [uploadData, setUploadData] = useState([]);
    const navigate = useNavigate();
    let encryptedID = "";

    const handleClick = () => {
        encryptedID = btoa('0');
        navigate('/app/employeeLeaveBulk/addEdit/' + encryptedID);
    }

    const alert = useAlert();

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getEmployeeReligions(), getPermission(), GetAllEmployeeSubCategoryMapping());
    }, []);

    useEffect(() => {
        trackPromise(getFactoriesForDropDown(),
            GetDivisionDetailsByGroupID());
    }, [leaveFormData.groupID]);

    useEffect(() => {
        trackPromise(getCostCenterDetailsByGardenID());
    }, [leaveFormData.factoryID]);

    useEffect(() => {
        trackPromise(getGangDetailsByDivisionID());
    }, [leaveFormData.costCenterID]);

    useEffect(() => {
        setLeaveRequestData([]);
    }, [leaveFormData.groupID]);

    useEffect(() => {
        setLeaveRequestData([]);
    }, [leaveFormData.factoryID]);

    useEffect(() => {
        setLeaveRequestData([]);
    }, [leaveFormData.costCenterID]);

    useEffect(() => {
        setLeaveRequestData([]);
    }, [leaveFormData.gangID]);

    useEffect(() => {
        setLeaveRequestData([]);
    }, [leaveFormData.religionID]);

    useEffect(() => {
        setLeaveRequestData([]);
    }, [leaveFormData.regNo]);

    useEffect(() => {
        setLeaveRequestData([]);
    }, [leaveFormData.todayDate]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWEMPLOYEELEAVEBULK');

        if (isAuthorized === undefined) {
            navigate('/404');
        }
        var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');
        var isLeaveRequestApproveReject = permissions.find(p => p.permissionCode === 'VIEWLEAVEREQUESTAPPROVEREJECTBULK');

        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
            isLeaveRequestApproveReject: isLeaveRequestApproveReject !== undefined
        });

        setLeaveFormData({
            ...leaveFormData,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }
    async function getFactoriesForDropDown() {
        const factory = await services.getFactoryByGroupID(leaveFormData.groupID);
        setFactories(factory);
    }

    async function getCostCenterDetailsByGardenID() {
        var response = await services.getDivisionDetailsByEstateID(leaveFormData.factoryID);
        setCostCenters(response);
    };

    async function getGangDetailsByDivisionID() {
        var response = await services.getGangDetailsByDivisionID(leaveFormData.costCenterID);
        setGangs(response);
    };

    async function getEmployeeReligions() {
        const result = await services.getEmployeeReligions();
        setEmployeeReligions(result)
    }

    async function GetAllEmployeeSubCategoryMapping() {
        const result = await services.GetAllEmployeeSubCategoryMapping();
        setEmployeeSubCategoryMapping(result)
    }

    async function GetDivisionDetailsByGroupID() {
        const result = await services.GetDivisionDetailsByGroupID(leaveFormData.groupID);
        setPayPoints(result)
    }

    async function getAllLeaveRequestDetailsByGroupFactory() {
        setUploadData([]);
        let model = {
            groupID: parseInt(leaveFormData.groupID),
            religionID: parseInt(leaveFormData.religionID),
            payPointID: parseInt(leaveFormData.payPointID),
            employeeSubCategoryMappingID: parseInt(leaveFormData.employeeSubCategoryMappingID),
            registrationNumber: leaveFormData.regNo,
            todayDate: moment(leaveFormData.todayDate).format().split('T')[0]
        }
        const verify = await services.GetAllLeaveBulkRequestDetails(model);
        if (verify.data.length > 0) {
            var found = verify.data.filter(x => x.pending != 0)
            setFound(found)
            setLeaveRequestData(verify.data);
            setPendingCount(verify.count - verify.data.length)
        }
        else {
            alert.error("No Records to Display");
            setFound([])
            setLeaveRequestData([]);
            setPendingCount(0)
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

    function handleGroupChange(e) {
        const target = e.target;
        const value = target.value
        setLeaveFormData({
            ...leaveFormData,
            [e.target.name]: value,
            payPointID: "0"
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
                        isEdit={true}
                        toolTiptitle={"Add Leave Form"}
                    />
                </Grid>
            </Grid>
        )
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setLeaveFormData({
            ...leaveFormData,
            [e.target.name]: value
        });
    }

    function handleDateChange(value) {
        setLeaveFormData({
            ...leaveFormData,
            todayDate: value
        });
    }
    const [checkAll, setCheckAll] = useState(false);

    const selectAll = () => {
        setCheckAll(!checkAll);
    };

    function handleClickAll(e) {
        let uploadDataCopy = [...uploadData];
        if (e.target.checked) {
            leaveRequestData.forEach(x => {
                if (x.pending != 0) {
                    const isEnable = uploadDataCopy.filter((p) => p.leaveRefNo == x.leaveRefNo);
                    if (isEnable.length === 0) {
                        if (uploadDataCopy.length < 100) {
                            uploadDataCopy.push(x);
                        }
                    }
                }
            });
            setUploadData(uploadDataCopy);
        }
        else {
            setUploadData([]);
        }
    }

    function handleClickOne(data) {
        let uploadDataCopy = [...uploadData];
        const isEnable = uploadDataCopy.filter((p) => p.leaveRefNo == data.leaveRefNo);
        if (isEnable.length === 0) {
            if (uploadDataCopy.length < 100) {
                uploadDataCopy.push(data)
            } else {
                alert.error("Maximum Selected Count Is 100");
            }
        } else {
            var index = uploadDataCopy.indexOf(isEnable[0]);
            uploadDataCopy.splice(index, 1);
        }
        setUploadData(uploadDataCopy);
    }

    async function handleApproveClick() {
        let array = [];
        uploadData.forEach(x => {
            x.details.forEach(y => {
                array.push({
                    employeeLeaveRequestID: y.employeeLeaveRequestID,
                    registrationNumber: x.registrationNumber,
                    employeeID: x.employeeID,
                    noOfDays: x.noOfDays,
                    leaveTypeID: y.leaveTypeID,
                    isPayment: y.isPayment,
                    fromDate: x.fromDate,
                    toDate: x.toDate,
                    modifiedBy: parseInt(tokenService.getUserIDFromToken())
                })
            })
        })
        let model = {
            approve: array
        }
        const response = await services.SaveApproveBulkLeaveRequest(model);
        if (response.statusCode == "Success") {
            setLeaveRequestData([])
            setUploadData([])
            trackPromise(getAllLeaveRequestDetailsByGroupFactory())
            alert.success(response.message);
        }
        else {
            setLeaveRequestData([])
            setUploadData([])
            trackPromise(getAllLeaveRequestDetailsByGroupFactory())
            alert.error(response.message);
        }
    }

    const [open, setOpen] = useState(false);
    const handleOpenDialog = () => {
        setOpen(true);
    };

    const handleCloseDialog = () => {
        setOpen(false);
    };

    const handleReject = async () => {
        let array = [];
        setOpen(false);
        uploadData.forEach(x => {
            x.details.forEach(y => {
                array.push({
                    employeeLeaveRequestID: y.employeeLeaveRequestID,
                    registrationNumber: x.registrationNumber,
                    ModifiedBy: parseInt(tokenService.getUserIDFromToken())
                })
            })
        })

        const response = await services.SaveRejectedBulkLeaveRequest(array);
        if (response.statusCode === "Success") {
            setLeaveRequestData([])
            setUploadData([])
            trackPromise(getAllLeaveRequestDetailsByGroupFactory())
            alert.success(response.message);
        } else {
            setLeaveRequestData([])
            setUploadData([])
            trackPromise(getAllLeaveRequestDetailsByGroupFactory())
            alert.error(response.message);
        }
    };

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: leaveFormData.groupID,
                            regNo: leaveFormData.regNo,
                            payPointID: leaveFormData.payPointID,
                            todayDate: leaveFormData.todayDate
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Business Division is required').min("1", 'Business Division is required'),
                                todayDate: Yup.string().required('Date is required')
                            })
                        }
                        onSubmit={() => trackPromise(getAllLeaveRequestDetailsByGroupFactory())}
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
                                            title={cardTitle(title)}
                                        />
                                        <PerfectScrollbar>
                                            <Divider />
                                            <CardContent style={{ marginBottom: "2rem" }}>
                                                <Grid container spacing={3}>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="groupID">
                                                            Business Division *
                                                        </InputLabel>
                                                        <TextField select
                                                            fullWidth
                                                            size='small'
                                                            name="groupID"
                                                            onChange={(e) => handleGroupChange(e)}
                                                            value={leaveFormData.groupID}
                                                            variant="outlined"
                                                            InputProps={{
                                                                readOnly: !permissionList.isGroupFilterEnabled,
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Business Division--</MenuItem>
                                                            {generateDropDownMenu(groups)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="payPointID">
                                                            Pay Point
                                                        </InputLabel>
                                                        <TextField select
                                                            fullWidth
                                                            name="payPointID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={leaveFormData.payPointID}
                                                            variant="outlined"
                                                            id="payPointID"
                                                            size='small'
                                                        >
                                                            <MenuItem value="0">--All Pay Point--</MenuItem>
                                                            {generateDropDownMenu(payPoints)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="employeeSubCategoryMappingID">
                                                            Employee Sub Category
                                                        </InputLabel>
                                                        <TextField select fullWidth
                                                            size='small'
                                                            id="employeeSubCategoryMappingID"
                                                            name="employeeSubCategoryMappingID"
                                                            value={leaveFormData.employeeSubCategoryMappingID}
                                                            type="text"
                                                            variant="outlined"
                                                            onChange={(e) => handleChange(e)}
                                                        >
                                                            <MenuItem value="0">--Select Employee Sub Category--</MenuItem>
                                                            {generateDropDownMenu(employeeSubCategoryMapping)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="religionID">
                                                            Religion
                                                        </InputLabel>
                                                        <TextField select fullWidth
                                                            size='small'
                                                            name="religionID"
                                                            id="religionID"
                                                            onChange={(e) => handleChange(e)}
                                                            value={leaveFormData.religionID}
                                                            variant="outlined"
                                                        >
                                                            <MenuItem value="0">--All Religion--</MenuItem>
                                                            {generateDropDownMenu(employeeReligions)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="regNo">
                                                            Registration Number
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.regNo && errors.regNo)}
                                                            fullWidth
                                                            helperText={touched.regNo && errors.regNo}
                                                            size='small'
                                                            name="regNo"
                                                            onChange={(e) => handleChange(e)}
                                                            value={leaveFormData.regNo}
                                                            variant="outlined"
                                                            id="regNo"
                                                        >
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="date">Date *</InputLabel>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <KeyboardDatePicker
                                                                fullWidth
                                                                variant="inline"
                                                                format="yyyy-MM-dd"
                                                                margin="dense"
                                                                name='date'
                                                                id='date'
                                                                size='small'
                                                                value={leaveFormData.todayDate}
                                                                onChange={(e) => {
                                                                    handleDateChange(e)
                                                                }}
                                                                KeyboardButtonProps={{
                                                                    'aria-label': 'change date',
                                                                }}
                                                                autoOk
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>
                                                </Grid>
                                                <Grid container spacing={3}>
                                                    <Grid item md={12} xs={12}>
                                                        <Box display="flex" justifyContent="flex-end" p={2}>
                                                            <Button
                                                                color="primary"
                                                                variant="contained"
                                                                type="submit"
                                                                style={{ marginLeft: 10 }}
                                                            >
                                                                Search
                                                            </Button>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                                <Grid container spacing={3}>
                                                    <Grid item md={12} xs={12}>
                                                        {leaveRequestData.length > 0 ?
                                                            <Chip style={{ marginLeft: '15px' }} label={'Pending Count : ' + pendingCount} />
                                                            : null}
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                            {leaveRequestData.length > 0 ?
                                                <Box minWidth={1000}>
                                                    <MaterialTable
                                                        title="Multiple Actions Preview"
                                                        columns={[
                                                            { title: 'Emp.ID', field: 'registrationNumber' },
                                                            { title: 'Emp.Name', field: 'employeeName' },
                                                            { title: 'Type', field: 'employeeLeaveTypeName' },
                                                            { title: 'F.Date', field: 'fromDate', render: rowData => moment(rowData.fromDate).format('YYYY-MM-DD') },
                                                            { title: 'T.Date', field: 'toDate', render: rowData => moment(rowData.toDate).format('YYYY-MM-DD') },
                                                            { title: 'Ref No', field: 'leaveRefNo' },
                                                            {
                                                                title: 'Status',
                                                                field: 'employeeLeaveRequestStatusID',
                                                                render: rowData => {
                                                                    let label, color;
                                                                    switch (rowData.details[0].employeeLeaveRequestStatusID) {
                                                                        case 1:
                                                                            label = 'Pending';
                                                                            color = 'default';
                                                                            break;
                                                                        case 2:
                                                                            label = 'Approved';
                                                                            color = 'success';
                                                                            break;
                                                                        default:
                                                                            label = 'Rejected';
                                                                            color = 'error';
                                                                            break;
                                                                    }
                                                                    return <Chip variant="outlined" label={label} color={color} />;
                                                                }
                                                            },
                                                            {
                                                                title: (
                                                                    <label>
                                                                        {found.length > 0 ? "Select All" : "Select"}
                                                                        {found.length > 0 ? (
                                                                            <Checkbox
                                                                                color="primary"
                                                                                onClick={(e) => handleClickAll(e)}
                                                                                onChange={selectAll}
                                                                                checked={leaveRequestData.length != 0 && uploadData.length == leaveRequestData.filter((x, index) => index < 100 && x.pending != 0).length}
                                                                            ></Checkbox>
                                                                        ) : (
                                                                            null
                                                                        )}
                                                                    </label>
                                                                ),
                                                                sorting: false,
                                                                field: "selected",
                                                                render: (data) => {
                                                                    if (data.pending == 0) {
                                                                        return (
                                                                            <Checkbox
                                                                                defaultChecked
                                                                                indeterminate
                                                                                disabled
                                                                            />
                                                                        );
                                                                    } else {
                                                                        return (
                                                                            <Checkbox
                                                                                color="primary"
                                                                                onClick={() => handleClickOne(data)}
                                                                                disabled={data.pending == 0 ? true : false}
                                                                                checked={!(uploadData.find((x) => x.leaveRefNo == data.leaveRefNo) == undefined)}
                                                                            ></Checkbox>
                                                                        );
                                                                    }
                                                                }
                                                            },
                                                        ]}
                                                        data={leaveRequestData}
                                                        options={{
                                                            exportButton: false,
                                                            showTitle: false,
                                                            headerStyle: { textAlign: "left", height: '1%' },
                                                            cellStyle: { textAlign: "left" },
                                                            columnResizable: false,
                                                            actionsColumnIndex: -1
                                                        }}
                                                    // actions={[
                                                    //     {
                                                    //         icon: 'edit',
                                                    //         tooltip: 'Edit Employee',
                                                    //         onClick: (event, leaveRequestData) => EditLeaveFormData(leaveRequestData.leaveRefNo)
                                                    //     }
                                                    // ]}
                                                    />
                                                </Box>
                                                : null}
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                {permissionList.isLeaveRequestApproveReject && leaveRequestData.length > 0 && found.length > 0 && uploadData.length > 0 ?
                                                    <Button
                                                        color="primary"
                                                        variant="contained"
                                                        style={{ marginLeft: 10 }}
                                                        className={classes.colorApprove}
                                                        onClick={() => trackPromise(handleApproveClick())}
                                                    >
                                                        Approve
                                                    </Button>
                                                    : null}
                                                {permissionList.isLeaveRequestApproveReject && leaveRequestData.length > 0 && found.length > 0 && uploadData.length > 0 ?
                                                    <Button
                                                        color="primary"
                                                        variant="contained"
                                                        style={{ marginRight: '1rem', marginLeft: 10 }}
                                                        className={classes.colorReject}
                                                        onClick={() => handleOpenDialog()}
                                                    >
                                                        Reject
                                                    </Button>
                                                    : null}
                                            </Box>
                                        </PerfectScrollbar>
                                        <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                                            <DialogTitle>Confirm Reject</DialogTitle>
                                            <DialogContent>
                                                <DialogContentText style={{ fontSize: '18px' }}>
                                                    Are you sure you want to reject this request ?
                                                </DialogContentText>
                                            </DialogContent>
                                            <DialogActions>
                                                <Button
                                                    onClick={() => trackPromise(handleReject())}
                                                    color="primary" autoFocus>
                                                    Yes
                                                </Button>
                                                <Button onClick={handleCloseDialog} color="primary">
                                                    No
                                                </Button>
                                            </DialogActions>
                                        </Dialog>
                                    </Card>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </Container>
            </Page>
        </Fragment >
    )
}