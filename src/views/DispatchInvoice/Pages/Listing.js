import React, { useState, useEffect, Fragment, createContext } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Button, Card, makeStyles, Container, CardHeader, CardContent, Divider, MenuItem, Grid, InputLabel, TextField } from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder'
import { LoadingComponent } from './../../../utils/newLoader';
import MaterialTable from "material-table";
import { startOfMonth, endOfMonth, addMonths } from 'date-fns';
import { useAlert } from "react-alert";
import EventIcon from '@material-ui/icons/Event';
import Popover from '@material-ui/core/Popover';
import moment from 'moment';
import VisibilityIcon from '@material-ui/icons/Visibility';
import DateRangeSelectorComponent from '../../UserStatistics/Utils/DateRangeSelector';

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

const screenCode = 'DISPATCHINVOICE';

export default function DispatchInvoiceListing() {
    const [title, setTitle] = useState("Dispatch Invoice");
    const classes = useStyles();
    const [GroupList, setGroupList] = useState([]);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [FactoryList, setFactoryList] = useState([]);
    const [isViewTable, setIsViewTable] = useState(true);
    const [dispatchInvoiceDetailList, setDispatchInvoiceDetailList] = useState([]);
    const [dispatchInvoiceDetails, setDispatchInvoiceDetails] = useState({
        groupID: 0,
        factoryID: 0,
        date: '',
    });
    const [buyerList, setBuyerList] = useState([]);
    const [isTableHide, setIsTableHide] = useState(true);
    const [isButtonHide, setIsButtonHide] = useState(false);
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });
    const [DateRange, setDateRange] = useState({
        startDate: startOfMonth(addMonths(new Date(), -5)),
        endDate: endOfMonth(addMonths(new Date(), -0))
    });
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;
    const handleClickPop = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const alert = useAlert();
    const navigate = useNavigate();
    let encrypted = "";
    const handleClick = () => {
        encrypted = btoa('0');
        navigate('/app/dispatchInvoice/Add/' + encrypted)
    }

    const handleClickView = (teaProductDispatchID) => {
        encrypted = btoa(teaProductDispatchID);
        navigate('/app/dispatchInvoice/Edit/' + encrypted);
    }
    useEffect(() => {
        trackPromise(
            getPermission());
        trackPromise(
            getGroupsForDropdown());
    }, []);

    useEffect(() => {
        trackPromise(
            getFactoriesForDropdown());
    }, [dispatchInvoiceDetails.groupID]);

    useEffect(() => {
        trackPromise(
            GetDetails());
    }, [dispatchInvoiceDetails.factoryID]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWDISPATCHINVOICE');
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
        setDispatchInvoiceDetails({
            ...dispatchInvoiceDetails,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroupList(groups);
    }

    async function getFactoriesForDropdown() {
        const factories = await services.getFactoryByGroupID(dispatchInvoiceDetails.groupID);
        setFactoryList(factories);
    }

    async function GetDetails() {
        let model = {
            groupID: parseInt(dispatchInvoiceDetails.groupID),
            factoryID: parseInt(dispatchInvoiceDetails.factoryID),
            startDate: moment(DateRange.startDate.toString())
                .format()
                .split('T')[0],
            endDate: moment(DateRange.endDate.toString())
                .format()
                .split('T')[0],
        };

        const routeData = await services.GetDispatchInvoiceDetails(model);
         if(routeData.statusCode == "Success" && routeData.data != null){
             setIsViewTable(false);
            setDispatchInvoiceDetailList(routeData.data);
         } else{
            setIsViewTable(true);
         }
        
    }


    function timeout(delay) {
        return new Promise(res => setTimeout(res, delay));
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
        setDispatchInvoiceDetails({
            ...dispatchInvoiceDetails,
            [e.target.name]: value
        });
        setBuyerList([]);
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
                        toolTiptitle={"Add Dispatch Invoice"}
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
                            groupID: dispatchInvoiceDetails.groupID,
                            factoryID: dispatchInvoiceDetails.factoryID
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                            })
                        }
                        onSubmit={(event) => trackPromise(GetDetails(event))}
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
                                        <CardHeader title={cardTitle(title)} />
                                        <PerfectScrollbar>
                                            <Divider />
                                            <CardContent>
                                                <Grid container spacing={3}>
                                                    <Grid item md={3} xs={8}>
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
                                                            value={dispatchInvoiceDetails.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            size='small'
                                                            disabled={!permissionList.isGroupFilterEnabled}
                                                        >
                                                            <MenuItem value="0">--Select Group--</MenuItem>
                                                            {generateDropDownMenu(GroupList)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={8}>
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
                                                            value={dispatchInvoiceDetails.factoryID}
                                                            variant="outlined"
                                                            id="factoryID"
                                                            size='small'
                                                            disabled={!permissionList.isFactoryFilterEnabled}
                                                        >
                                                            <MenuItem value="0">--Select Factory--</MenuItem>
                                                            {generateDropDownMenu(FactoryList)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12} >
                                                        <InputLabel shrink>
                                                            Date *
                                                        </InputLabel>
                                                        <Button
                                                            aria-describedby={id}
                                                            variant="contained"
                                                            fullWidth
                                                            color="primary"
                                                            onClick={handleClickPop}
                                                            size="small"
                                                            endIcon={<EventIcon />}
                                                        >
                                                            {DateRange.startDate.toLocaleDateString() + " - " + DateRange.endDate.toLocaleDateString()}
                                                        </Button>
                                                        <Popover
                                                            id={id}
                                                            open={open}
                                                            anchorEl={anchorEl}
                                                            onClose={handleClose}
                                                            anchorOrigin={{
                                                                vertical: 'center',
                                                                horizontal: 'left',
                                                            }}
                                                            transformOrigin={{
                                                                vertical: 'top',
                                                                horizontal: 'left',
                                                            }}
                                                        >
                                                            <DateRangeSelectorComponent setDateRange={setDateRange} handleClose={handleClose} />
                                                        </Popover>
                                                    </Grid>
                                                </Grid>
                                                <Box display="flex" flexDirection="row-reverse" p={2} >
                                                    <Button
                                                        color="primary"
                                                        type="submit"
                                                        variant="contained"
                                                        size='small'
                                                    >
                                                        Search
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                            <Box minWidth={1050}  hidden={isViewTable}>
                                                    <MaterialTable
                                                        title="Multiple Actions Preview"
                                                        columns={[
                                                            { title: 'Date of Dispatch', field: 'dateofDispatched', render: rowData => rowData.dateofDispatched.split('T')[0] },

                                                            { title: 'Invoice No', field: 'invoiceNo' },
                                                            { title: 'Selling Mark', field: 'sellingMarkName' },
                                                            { title: 'Broker Name', field: 'brokerName' },
                                                        ]}
                                                        data={dispatchInvoiceDetailList}
                                                        options={{
                                                            exportButton: false,
                                                            showTitle: false,
                                                            headerStyle: { textAlign: "left", height: '1%' },
                                                            cellStyle: { textAlign: "left" },
                                                            columnResizable: false,
                                                            actionsColumnIndex: -1,
                                                            pageSize: 10
                                                        }}
                                                        actions={[{

                                                            icon: VisibilityIcon,
                                                            tooltip: 'View',
                                                            onClick: (event, rowData) => handleClickView(rowData.teaProductDispatchID)
                                                        }]}
                                                    />
                                                ) 
                                            </Box>
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
