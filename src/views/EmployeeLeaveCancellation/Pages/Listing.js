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
    Checkbox
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

const screenCode = 'EMPLOYEELEAVECANCELLATIONFORM';

export default function EmployeeLeaveCancellation(props) {
    const [open, setOpen] = useState(false);
    const [openApprove, setOpenApprove] = useState(false);
    const [title, setTitle] = useState("Leave Cancellation")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [costCenters, setCostCenters] = useState();
    const [payPoints, setPayPoints] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState();
    const [fromDate, handleFromDate] = useState(new Date());
    const [leaveCancelFormData, setLeaveCancelFormData] = useState({
        groupID: 0,
        factoryID: 0,
        leaveTypeID: 0,
        payPointID: 0,
        regNo: ''
    })
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });
    const [leaveCancelData, setLeaveCancelData] = useState([]);
    const [found, setFound] = useState([]);
    const navigate = useNavigate();
    const handleOpenDialog = () => {
        setOpen(true);
    };
    const handleCloseDialog = () => {
        setOpen(false);
    };
    const handleLeaveCancellation = async () => {
        let rejectarray = [];
        selectedRows.forEach(x => {
            rejectarray.push({
                employeeLeaveRequestID: x.employeeLeaveRequestID,
                employeeID: x.employeeID,
                leaveTypeID: x.leaveTypeID,
                modifiedBy: parseInt(tokenService.getUserIDFromToken()),
            })
        })
        const response = await services.updateLeaveFormDetails(rejectarray);
        if (response.statusCode === "Success") {
            alert.success(response.message);
            setSelectedRows([]);
            GetApprovedLeaveRequestDetails();
        }
        handleCloseDialog();
    };
    const alert = useAlert();
    const [selectedRows, setSelectedRows] = useState([]);
    const [checkAll, setCheckAll] = useState(false);
    const selectAll = () => {
        setCheckAll(!checkAll);
    };

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        trackPromise(getFactoriesForDropDown(), getLeaveTypeForDropdown(), GetDivisionDetailsByGroupID());
    }, [leaveCancelFormData.groupID]);

    useEffect(() => {
        setLeaveCancelData([]);
    }, [leaveCancelFormData]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWEMPLOYEELEAVECANCELLATIONFORM');

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
        setLeaveCancelFormData({
            ...leaveCancelFormData,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getFactoriesForDropDown() {
        const factory = await services.getFactoryByGroupID(leaveCancelFormData.groupID);
        setFactories(factory);
    }

    async function GetDivisionDetailsByGroupID() {
        const result = await services.GetDivisionDetailsByGroupID(leaveCancelFormData.groupID);
        setPayPoints(result)
    }

    async function getLeaveTypeForDropdown() {
        const leaveTypes = await services.getEmployeeLeaveType(leaveCancelFormData.groupID);
        let leaveTypeArray = []
        for (let item of Object.entries(leaveTypes)) {
            leaveTypeArray[item[1]["employeeLeaveTypeID"]] = item[1]["employeeLeaveTypeName"]
        }
        setLeaveTypes(leaveTypeArray);
    }

    async function GetApprovedLeaveRequestDetails() {
        let model = {
            groupID: parseInt(leaveCancelFormData.groupID),
            factoryID: parseInt(leaveCancelFormData.factoryID),
            payPointID: parseInt(leaveCancelFormData.payPointID),
            leaveTypeID: parseInt(leaveCancelFormData.leaveTypeID),
            registrationNumber: leaveCancelFormData.regNo,
            fromDate: moment(fromDate).format('YYYY-MM-DD'),

        }
        const verify = await services.GetApprovedLeaveRequestDetails(model);
        setLeaveCancelData([]);
        if (verify.data.length > 0) {
            const found = verify.data.filter(x => x.pending != 0)
            setFound(found)
            setLeaveCancelData(verify.data);
        }
        else {
            alert.error("No Records to Display");
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
        setLeaveCancelFormData({
            ...leaveCancelFormData,
            [e.target.name]: value,
            factoryID: "0",
            payPointID: "0"
        });
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
        setLeaveCancelFormData({
            ...leaveCancelFormData,
            [e.target.name]: value
        });
    }

    function clearData() {
        setLeaveCancelFormData({
            ...leaveCancelFormData,
            regNo: '',
            leaveTypeID: 0,
            fromDate: '',
            timeFrom: '',
            timeTo: '',
            date: '',
            noOfDays: 0,
            isCoveringPerson: false,
            coveringPerson: '',
            reason: '',
            applyForID: 0
        });
    }

    function handleClickAll(event) {
        if (event.target.checked) {
            setSelectedRows([...leaveCancelData]);
        } else {
            setSelectedRows([]);
        }
    }

    function handleClickOne(rowData) {
        const rowIndex = selectedRows.findIndex(row => row.leaveRefNo === rowData.leaveRefNo);
        if (rowIndex === -1) {
            setSelectedRows([...selectedRows, rowData]);
        } else {
            setSelectedRows(selectedRows.filter(row => row.leaveRefNo !== rowData.leaveRefNo));
        }
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: leaveCancelFormData.groupID,
                            factoryID: leaveCancelFormData.factoryID,
                            payPointID: leaveCancelFormData.payPointID,
                            regNo: leaveCancelFormData.regNo,
                            fromDate: fromDate,
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Business Division is required').min("1", 'Business Division is required'),
                                fromDate: Yup.date().required('From Date is required'),
                            })
                        }
                        onSubmit={() => trackPromise(GetApprovedLeaveRequestDetails())}
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
                                                            error={Boolean(touched.groupID && errors.groupID)}
                                                            fullWidth
                                                            helperText={touched.groupID && errors.groupID}
                                                            size='small'
                                                            name="groupID"
                                                            onChange={(e) => handleGroupChange(e)}
                                                            value={leaveCancelFormData.groupID}
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
                                                        <InputLabel shrink id="factoryID">
                                                            Location
                                                        </InputLabel>
                                                        <TextField select
                                                            fullWidth
                                                            size='small'
                                                            name="factoryID"
                                                            onChange={(e) => handleChange(e)}
                                                            value={leaveCancelFormData.factoryID}
                                                            variant="outlined"
                                                            id="factoryID"
                                                            InputProps={{
                                                                readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                            }}
                                                        >
                                                            <MenuItem value="0">--All Locations--</MenuItem>
                                                            {generateDropDownMenu(factories)}
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
                                                            value={leaveCancelFormData.payPointID}
                                                            variant="outlined"
                                                            id="payPointID"
                                                            size='small'
                                                        >
                                                            <MenuItem value="0">--All Pay Points--</MenuItem>
                                                            {generateDropDownMenu(payPoints)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="leaveTypeID">
                                                            Leave Type
                                                        </InputLabel>
                                                        <TextField
                                                            select fullWidth
                                                            name="leaveTypeID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={leaveCancelFormData.leaveTypeID}
                                                            variant="outlined"
                                                            id="leaveTypeID"
                                                            size="small"
                                                        >
                                                            <MenuItem value="0">--All Leave Types--</MenuItem>
                                                            {generateDropDownMenu(leaveTypes)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="fromDate">Date *</InputLabel>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <KeyboardDatePicker
                                                                error={Boolean(touched.fromDate && errors.fromDate)}
                                                                fullWidth
                                                                helperText={touched.fromDate && errors.fromDate}
                                                                variant="inline"
                                                                format="yyyy-MM-dd"
                                                                margin="dense"
                                                                name='fromDate'
                                                                id='fromDate'
                                                                size='small'
                                                                value={fromDate}
                                                                onChange={(e) => {
                                                                    handleFromDate(e)
                                                                }}
                                                                KeyboardButtonProps={{
                                                                    'aria-label': 'change fromDate',
                                                                }}
                                                                autoOk
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="regNo">
                                                            Reg No.
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.regNo && errors.regNo)}
                                                            fullWidth
                                                            helperText={touched.regNo && errors.regNo}
                                                            size='small'
                                                            name="regNo"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={leaveCancelFormData.regNo}
                                                            variant="outlined"
                                                            id="regNo"
                                                        >
                                                        </TextField>
                                                    </Grid>
                                                </Grid>
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
                                            </CardContent>
                                            {leaveCancelData.length > 0 ?
                                                <Box minWidth={1000}>
                                                    <MaterialTable
                                                        title="Multiple Actions Preview"
                                                        columns={[
                                                            { title: 'Reg.No.', field: 'registrationNumber' },
                                                            { title: 'Emp.Name', field: 'employeeName' },
                                                            { title: 'Type', field: 'leaveType' },
                                                            { title: 'F.Date', field: 'fromDate', render: rowData => moment(rowData.fromDate).format('YYYY-MM-DD') },
                                                            {
                                                                title: (
                                                                    <label>
                                                                        {found.length > 0 ? "Select" : "Select"}
                                                                        {found.length > 0 ? (
                                                                            <Checkbox
                                                                                color="primary"
                                                                                indeterminate={selectedRows.length > 0 && selectedRows.length < leaveCancelData.length}
                                                                                checked={selectedRows.length === leaveCancelData.length}
                                                                                onChange={(event) => handleClickAll(event)}
                                                                            />
                                                                        ) : (
                                                                            null
                                                                        )}
                                                                    </label>
                                                                ),
                                                                render: rowData => {
                                                                    return (
                                                                        <Checkbox
                                                                            color="primary"
                                                                            checked={selectedRows.some(row => row.leaveRefNo === rowData.leaveRefNo)}
                                                                            onChange={(event) => handleClickOne(rowData)}
                                                                        />
                                                                    );
                                                                },
                                                            }
                                                        ]}
                                                        data={leaveCancelData}
                                                        options={{
                                                            exportButton: false,
                                                            showTitle: false,
                                                            headerStyle: { textAlign: "left", height: '1%' },
                                                            cellStyle: { textAlign: "left" },
                                                            columnResizable: false,
                                                            actionsColumnIndex: -1
                                                        }}
                                                    />
                                                </Box>
                                                : null}
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                {selectedRows.length > 0 && leaveCancelData.length > 0 ?
                                                    <Button
                                                        color="primary"
                                                        variant="contained"
                                                        style={{ marginRight: '1rem', marginLeft: 10 }}
                                                        className={classes.colorReject}
                                                        onClick={() => handleOpenDialog()}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    : null}
                                                <Dialog open={open}
                                                    onClose={handleCloseDialog}
                                                    maxWidth="sm" fullWidth>
                                                    <DialogTitle>Confirm Cancellation</DialogTitle>
                                                    <DialogContent>
                                                        <DialogContentText style={{ fontSize: '18px' }}>
                                                            Are you sure you want to Cancel this request?
                                                        </DialogContentText>
                                                    </DialogContent>
                                                    <DialogActions>
                                                        <Button
                                                            onClick={() => trackPromise(handleLeaveCancellation())}
                                                            color="primary" autoFocus>
                                                            Yes
                                                        </Button>
                                                        <Button
                                                            onClick={handleCloseDialog}
                                                            color="primary">
                                                            No
                                                        </Button>
                                                    </DialogActions>
                                                </Dialog>
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
    )
}
