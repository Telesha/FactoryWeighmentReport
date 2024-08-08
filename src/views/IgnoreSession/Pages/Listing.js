import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box,
    Card,
    makeStyles,
    Container,
    CardHeader,
    CardContent,
    Divider,
    Button,
    MenuItem,
    Grid,
    InputLabel,
    TextField,
    Hidden,
} from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import MaterialTable from "material-table";
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import { AgriGenERPEnum } from 'src/views/Common/AgriGenERPEnum/AgriGenERPEnum';
import moment from 'moment';
import CancelIcon from '@material-ui/icons/Cancel';
import DoneIcon from '@material-ui/icons/Done';
import IconButton from '@material-ui/core/IconButton';
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import { AlertDialogWithoutButton } from '../../Common/AlertDialogWithoutButton';
import { AlertWithTextField } from '../../Common/AlertWithTextField';


const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    },
}));

var screenCode = "IGNORESESSION"

export default function IgnoreSession() {
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [ignoreSessionList, setIgnoreSessionList] = useState([]);
    const alert = useAlert();
    const [dialogbox, setDialogbox] = useState(false)
    const [costCenter, setCostCenter] = useState([]);
    const [handleSessionID, setHandleSessionID] = useState();
    const [state, setState] = useState();
    const [viewStatus, setViewStatus] = useState();
    const [rejectReason, setRejectReason] = useState();
    const [dialogboxReject, setDialogboxReject] = useState(false);
    const [ignoreSession, setDeductionData] = useState({
        groupID: 0,
        OperationEntityID: 0,
        costCenterID: 0,
        approveStatus: 0
    })

    const navigate = useNavigate();
    let encrypted = "";
    const handleClick = () => {
        encrypted = btoa('0');
        navigate('/app/ignoreSession/addedit/' + encrypted);
    }
    const handleClickEdit = (ignoreSessionID) => {
        encrypted = btoa(ignoreSessionID.toString());
        navigate('/app/ignoreSession/addedit/' + encrypted);
    }
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
        isAproveRejectEnabled: false
    });

    useEffect(() => {
        getPermissions();
        trackPromise(
            getGroupsForDropdown()
        );
    }, []);

    useEffect(() => {
        if (ignoreSession.groupID > 0) {
            trackPromise(
                getFactoriesByGroupID()
            )
        }
    }, [ignoreSession.groupID]);

    useEffect(() => {
        if (ignoreSession.OperationEntityID > 0) {
            trackPromise(
                getDivisionsByEstateID(ignoreSession.OperationEntityID)
            )
        }
    }, [ignoreSession.OperationEntityID]);

    useEffect(() => {
        setIgnoreSessionList([]);
    }, [ignoreSession.OperationEntityID, ignoreSession.groupID, ignoreSession.costCenterID, ignoreSession.approveStatus]);

    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWIGNORESESSION');

        if (isAuthorized === undefined) {
            navigate('/404');
        }

        var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');
        var isAproveRejectEnabled = permissions.find(p => p.permissionCode == 'ENABLEAPROVEANDREJECT');
        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
            isAproveRejectEnabled: isAproveRejectEnabled !== undefined
        })

        setDeductionData({
            ...ignoreSession,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            OperationEntityID: parseInt(tokenService.getFactoryIDFromToken()),
        });
    }

    async function getGroupsForDropdown() {
        const groups = await services.getGroupsForDropdown();
        setGroups(groups);
    }

    async function getFactoriesByGroupID() {
        const factory = await services.getFactoriesByGroupID(ignoreSession.groupID);
        setFactories(factory);
    }

    async function getDivisionsByEstateID(gardenID) {
        const costCenters = await services.getDivisionByEstateID(gardenID);
        setCostCenter(costCenters);
    }

    async function getIgnoreSessionDetails() {
        setViewStatus(ignoreSession.approveStatus);
        let model = {
            groupID: parseInt(ignoreSession.groupID),
            OperationEntityID: parseInt(ignoreSession.OperationEntityID),
            collectionPointID: parseInt(ignoreSession.costCenterID),
            StatusID: parseInt(ignoreSession.approveStatus)
        };
        const response = await services.getIgnoreSessionDetails(model);
        setIgnoreSessionList(response);

        if (response.length < 1) {
            alert.error("No Records Found")
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

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setDeductionData({
            ...ignoreSession,
            [e.target.name]: value
        });
    }

    const handleApproveReject = (rowData, name) => {
        setHandleSessionID(rowData.ignoreSessionEmployeeID);
        if (name === "reject") {
            setState(2);
            setDialogboxReject(true);
        }
        else {
            setDialogbox(true);
            setState(1);
        }
    }

    async function cancelData() {
        setDialogbox(false);
        setDialogboxReject(false);
    }

    async function confirmData() {
        setDialogbox(false);
        setRejectReason(false);
        let statusModel = {
            IgnoreSessionEmployeeID: handleSessionID,
            RejectReason: rejectReason,
            StatusID: state
        }
        const approve = await services.updateIgnoreSessionStatus(statusModel)
        if (approve.statusCode === "Success") {
            const newArray = ignoreSessionList.filter(e => e.ignoreSessionEmployeeID !== handleSessionID)
            setIgnoreSessionList(newArray);
            alert.success(approve.message);
            setRejectReason('');
        }
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
                        toolTiptitle={"Ignore Session Add"}
                    />

                </Grid>
            </Grid>
        )
    }

    return (
        <Page
            className={classes.root}
            title="Ignore Session"
        >
            <Container maxWidth={false}>

                <Formik
                    initialValues={{
                        groupID: ignoreSession.groupID,
                        OperationEntityID: ignoreSession.OperationEntityID,
                        costCenterID: ignoreSession.costCenterID
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Group required').min("1", 'Group required'),
                            OperationEntityID: Yup.number().required('Factory required').min("1", 'Factory required'),
                            costCenterID: Yup.number().required('Cost center required').min("1", 'Cost center required')
                        })
                    }
                    onSubmit={() => trackPromise(getIgnoreSessionDetails())}
                    enableReinitialize
                >
                    {({
                        errors,
                        handleSubmit,
                        touched
                    }) => (
                        <form onSubmit={handleSubmit}>

                            <Box mt={0}>
                                <Card>
                                    <CardHeader
                                        title={cardTitle("Ignore Session")}
                                    />
                                    <PerfectScrollbar>
                                        <Divider />
                                        <CardContent style={{ marginBottom: "2rem" }}>
                                            <Grid container spacing={3}>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="groupID">
                                                        Legal Entity  *
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        helperText={touched.groupID && errors.groupID}
                                                        error={Boolean(touched.groupID && errors.groupID)}
                                                        name="groupID"
                                                        size='small'
                                                        onChange={(e) => handleChange(e)}
                                                        value={ignoreSession.groupID}
                                                        variant="outlined"
                                                        InputProps={{
                                                            readOnly: !permissionList.isGroupFilterEnabled ? true : false
                                                        }}
                                                    >
                                                        <MenuItem value="0">--Select Legal Entity--</MenuItem>
                                                        {generateDropDownMenu(groups)}
                                                    </TextField>
                                                </Grid>

                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="OperationEntityID">
                                                        Garden *
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        helperText={touched.OperationEntityID && errors.OperationEntityID}
                                                        error={Boolean(touched.OperationEntityID && errors.OperationEntityID)}
                                                        name="OperationEntityID"
                                                        size='small'
                                                        onChange={(e) => handleChange(e)}
                                                        value={ignoreSession.OperationEntityID}
                                                        variant="outlined"
                                                        id="OperationEntityID"
                                                        InputProps={{
                                                            readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                        }}
                                                    >
                                                        <MenuItem value="0">--Select Garden--</MenuItem>
                                                        {generateDropDownMenu(factories)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="OperationEntityID">
                                                        Cost Center *
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        helperText={touched.costCenterID && errors.costCenterID}
                                                        error={Boolean(touched.costCenterID && errors.costCenterID)}
                                                        name="costCenterID"
                                                        size='small'
                                                        onChange={(e) => handleChange(e)}
                                                        value={ignoreSession.costCenterID}
                                                        variant="outlined"
                                                        id="costCenterID"
                                                        InputProps={{
                                                            readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                        }}
                                                    >
                                                        <MenuItem value="0">--Select Cost Center--</MenuItem>
                                                        {generateDropDownMenu(costCenter)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="approveStatus">
                                                        Status
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="approveStatus"
                                                        size='small'
                                                        onChange={(e) => handleChange(e)}
                                                        value={ignoreSession.approveStatus}
                                                        variant="outlined"
                                                        id="approveStatus"
                                                        InputProps={{
                                                            readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                        }}
                                                    >

                                                        <MenuItem value="0">New</MenuItem>
                                                        <MenuItem value="1">Approved</MenuItem>
                                                        <MenuItem value="2">Rejected</MenuItem>
                                                    </TextField>
                                                </Grid>

                                            </Grid>
                                            <Box display="flex" flexDirection="row-reverse" p={2} style={{ marginTop: '20px' }}>
                                                <Button
                                                    color="primary"
                                                    type="submit"
                                                    variant="contained"
                                                >
                                                    Search
                                                </Button>
                                            </Box>
                                        </CardContent>
                                        <div style={{ width: "1200px" }}>


                                            {ignoreSessionList.length > 0 ?
                                                < MaterialTable width={1000}
                                                    title="Multiple Actions Preview"
                                                    columns={[
                                                        { title: 'Registration No', field: 'registrationNumber' },
                                                        { title: 'Effective Date', field: 'appliedDate', render: rowdata => moment(rowdata.appliedDate).format('YYYY-MM-DD') },
                                                        { title: 'Reason', field: 'requestReason', hidden: viewStatus === "2" },
                                                        { title: 'Reject Reason', field: 'rejectReason', hidden: viewStatus !== "2" },
                                                        {
                                                            title: 'Reject',
                                                            field: 'reject',
                                                            hidden: viewStatus != "0" || !permissionList.isAproveRejectEnabled,
                                                            render: rowData => (
                                                                <IconButton onClick={() => handleApproveReject(rowData, "reject")}>
                                                                    <ClearIcon />
                                                                </IconButton>
                                                            )
                                                        },

                                                        {
                                                            title: 'Approve',
                                                            field: 'approve',
                                                            hidden: viewStatus != "0" || !permissionList.isAproveRejectEnabled,
                                                            render: rowData => (
                                                                <IconButton onClick={() => handleApproveReject(rowData, "approve")}>
                                                                    <CheckIcon />
                                                                </IconButton>
                                                            )
                                                        }
                                                    ]}
                                                    data={ignoreSessionList}
                                                    options={{
                                                        exportButton: false,
                                                        showTitle: false,
                                                        headerStyle: { textAlign: "left", height: '1%' },
                                                        cellStyle: { textAlign: "left", paddingRight: '5rem' },
                                                        columnResizable: false,
                                                        actionsColumnIndex: -1,
                                                        search: false
                                                    }}
                                                />
                                                : null}
                                        </div>
                                    </PerfectScrollbar>
                                    {dialogbox ?
                                        <AlertDialogWithoutButton confirmData={confirmData} cancelData={cancelData}
                                            IconTitle={"Delete"}
                                            headerMessage={"Are you sure you want to Approve?"}
                                            discription={""} />
                                        : null
                                    }
                                    {dialogboxReject ?
                                        <AlertWithTextField confirmData={confirmData} cancelData={cancelData}
                                            IconTitle={"Delete"}
                                            inputMesseage={rejectReason}
                                            setInputMesseage={setRejectReason}
                                            headerMessage={"Are you sure you want to Reject?"}
                                            discription={""} />
                                        : null
                                    }
                                </Card>
                            </Box>
                        </form>
                    )}
                </Formik>
            </Container>
        </Page>
    );
};