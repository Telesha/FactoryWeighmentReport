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
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import { isSaturday } from 'date-fns';
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

const screenCode = 'RATIONENTITLEMENTREPORT';

export default function RationEntitlementReport(props) {
    const [title, setTitle] = useState("Ration Entitlement")
    const classes = useStyles();
    const [GroupList, setGroupList] = useState([]);
    const [estates, setEstates] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [payPoints, setPayPoints] = useState([]);
    const [employeeSubCategoryMapping, setEmployeeSubCategoryMapping] = useState([]);
    const isDayDisabled = (date) => {
        return !isSaturday(date);
    };
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [rationDetailsData, setRationDetailsData] = useState([]);
    const [initialState, setInitialState] = useState(false);
    const [rationDetailsReport, setRationDetailsReport] = useState({
        groupID: '0',
        operationEntityID: '0',
        divisionID: '0',
        payPointID: '0',
        employeeSubCategoryMappingID: '0',
        regNo: '',
        date: '' //new Date().toISOString().substr(0, 10)
    })
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: '',
        estateName: '',
        divisionName: '',
        payPointName: '',
        employeeSubCategoryName: '',
        date: ''
    })
    const [totalValues, setTotalValues] = useState({
        totalArea: 0,
        totalNoofWorkers: 0,
        totalnoof8to12Dependent: 0,
        totalnoofUnder8Dependent: 0,
        totalofTotalEntitileQuntity: 0,
        totaldeductionAmount: 0,
        totalnetEntitlement: 0,
        totalValue: 0
    })
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });

    const componentRef = useRef();
    const navigate = useNavigate();
    const alert = useAlert();

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission(), GetAllEmployeeSubCategoryMapping());
    }, []);

    useEffect(() => {
        getEstateDetailsByGroupID();
        GetDivisionDetailsByGroupID();
    }, [rationDetailsReport.groupID]);

    useEffect(() => {
        getDivisionDetailsByEstateID();
    }, [rationDetailsReport.operationEntityID]);

    useEffect(() => {
        if (!initialState) {
            trackPromise(getPermission());
        }
    }, []);

    useEffect(() => {
        setRationDetailsData([]);
    }, [rationDetailsReport]);

    useEffect(() => {
        if (initialState) {
            setRationDetailsReport((prevState) => ({
                ...prevState,
                operationEntityID: 0,
                divisionID: 0,
                payPointID: 0
            }));
        }
    }, [rationDetailsReport.groupID, initialState]);

    useEffect(() => {
        if (initialState) {
            setRationDetailsReport((prevState) => ({
                ...prevState,
                divisionID: 0
            }));
        }
    }, [rationDetailsReport.operationEntityID, initialState]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWRATIONENTITLEMENTREPORT');

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

        setRationDetailsReport({
            ...rationDetailsReport,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            operationEntityID: parseInt(tokenService.getFactoryIDFromToken())
        })
        setInitialState(true);
    }
    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroupList(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(rationDetailsReport.groupID);
        setEstates(response);
    }

    async function getDivisionDetailsByEstateID() {
        var response = await services.getDivisionDetailsByEstateID(rationDetailsReport.operationEntityID);
        setDivisions(response);
    }

    async function GetDivisionDetailsByGroupID() {
        const result = await services.GetDivisionDetailsByGroupID(rationDetailsReport.groupID);
        setPayPoints(result)
    }

    async function GetAllEmployeeSubCategoryMapping() {
        const result = await services.GetAllEmployeeSubCategoryMapping();
        setEmployeeSubCategoryMapping(result)
    }

    async function GetDetails() {
        let model = {
            groupID: parseInt(rationDetailsReport.groupID),
            operationEntityID: parseInt(rationDetailsReport.operationEntityID),
            divisionID: parseInt(rationDetailsReport.divisionID),
            payPointID: parseInt(rationDetailsReport.payPointID),
            employeeSubCategoryMappingID: parseInt(rationDetailsReport.employeeSubCategoryMappingID),
            regNo: rationDetailsReport.regNo,
            date: rationDetailsReport.date == "" ? "" : moment(rationDetailsReport.date).format('YYYY-MM-DD')
        }
        getSelectedDropdownValuesForReport(model);
        const response = await services.GetRationEntitlementReport(model);
        if (response.statusCode === "Success" && response.data !== null) {
            let totalArea = 0;
            let totalNoofWorkers = 0;
            let totalnoofUnder8Dependent = 0;
            let totalnoof8to12Dependent = 0;
            let totalofTotalEntitileQuntity = 0;
            let totaldeductionAmount = 0;
            let totalnetEntitlement = 0;
            let totalValue = 0;
            response.data.forEach(x => {
                x.details.forEach(y => {
                    y.detailsx.forEach(z => {
                        totalArea += parseFloat(z.area)
                        totalNoofWorkers += parseFloat(z.noofWorkers)
                        totalnoofUnder8Dependent += parseFloat(z.noofUnder8Dependent)
                        totalnoof8to12Dependent += parseFloat(z.noof8to12Dependent)
                        totalofTotalEntitileQuntity += parseFloat(z.totalEntitileQuntity)
                        totaldeductionAmount += parseFloat(z.deductionAmount)
                        totalnetEntitlement += parseFloat(z.netEntitlement)
                        totalValue += parseFloat(z.value)
                    })
                })
            });
            setRationDetailsData(response.data);
            setTotalValues({
                ...totalValues,
                totalArea: totalArea,
                totalNoofWorkers: totalNoofWorkers,
                totalnoofUnder8Dependent: totalnoofUnder8Dependent,
                totalnoof8to12Dependent: totalnoof8to12Dependent,
                totalofTotalEntitileQuntity: totalofTotalEntitileQuntity,
                totaldeductionAmount: totaldeductionAmount,
                totalnetEntitlement: totalnetEntitlement,
                totalValue: totalValue
            })
        } else {
            alert.error("No Records to Display");
        }
    }

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            array.map(group => {
                group.details.map(grp => {
                    grp.detailsx.map(detail => {
                        var vr = {
                            'Particulars': `${group.masterGroupName} - ${grp.groupName} - ${detail.factoryName}`,
                            'Labour on Book': parseFloat(detail.labourOnBook).toFixed(2),
                            'Grant Area': parseFloat(detail.grantArea).toFixed(2),
                            'Labour per Hectare': (detail.labourOnBook / detail.grantArea).toFixed(2)
                        };
                        res.push(vr);
                    });
                });
            });
        }
        return res;
    }

    async function createFile() {
        var file = await createDataForExcel(rationDetailsData);
        var settings = {
            sheetName: 'Field Detail Report',
            fileName:
                'Field Detail Report',
            writeOptions: {}
        };
        let keys = Object.keys(file[0]);
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem });
        });
        let dataA = [
            {
                sheet: 'Field Detail Report',
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
        setRationDetailsReport({
            ...rationDetailsReport,
            [e.target.name]: value
        });
    }

    function handleDateChange(value) {
        setRationDetailsReport({
            ...rationDetailsReport,
            date: value
        });
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: GroupList[searchForm.groupID],
            estateName: estates[searchForm.operationEntityID],
            divisionName: divisions[searchForm.divisionID],
            payPointName: payPoints[searchForm.payPointID],
            employeeSubCategoryName: employeeSubCategoryMapping[searchForm.employeeSubCategoryMappingID],
            date: searchForm.date
        })
    }

    const getAge = birthDate => Math.floor((new Date() - new Date(birthDate).getTime()) / 3.15576e+10)
    return (
        <Page className={classes.root} title={title}>
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: rationDetailsReport.groupID,
                        operationEntityID: rationDetailsReport.operationEntityID,
                        divisionID: rationDetailsReport.divisionID,
                        payPointID: rationDetailsReport.payPointID,
                        employeeSubCategoryMappingID: rationDetailsReport.employeeSubCategoryMappingID,
                        regNo: rationDetailsReport.regNo
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Business Division is required').min("1", 'Business Division is required'),
                            date: Yup.string().notRequired().nullable(),
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
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="groupID">
                                                        Business Division *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.groupID && errors.groupID)}
                                                        fullWidth
                                                        helperText={touched.groupID && errors.groupID}
                                                        name="groupID"
                                                        onChange={(e) => handleChange(e)}
                                                        value={rationDetailsReport.groupID}
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

                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="operationEntityID">
                                                        Location
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.operationEntityID && errors.operationEntityID)}
                                                        fullWidth
                                                        helperText={touched.operationEntityID && errors.operationEntityID}
                                                        name="operationEntityID"
                                                        size='small'
                                                        onChange={(e) => {
                                                            handleChange(e)
                                                        }}
                                                        value={rationDetailsReport.operationEntityID}
                                                        variant="outlined"
                                                        id="operationEntityID"
                                                        InputProps={{
                                                            readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                        }}
                                                    >
                                                        <MenuItem value={0}>--All Location--</MenuItem>
                                                        {generateDropDownMenu(estates)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="divisionID">
                                                        Sub Division
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="divisionID"
                                                        size='small'
                                                        onChange={(e) => {
                                                            handleChange(e)
                                                        }}
                                                        value={rationDetailsReport.divisionID}
                                                        variant="outlined"
                                                        id="divisionID"
                                                    >
                                                        <MenuItem value={0}>--All Sub Divisions--</MenuItem>
                                                        {generateDropDownMenu(divisions)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="payPointID">
                                                        Pay Point
                                                    </InputLabel>
                                                    <TextField select fullWidth
                                                        size='small'
                                                        onBlur={handleBlur}
                                                        id="payPointID"
                                                        name="payPointID"
                                                        value={rationDetailsReport.payPointID}
                                                        type="text"
                                                        variant="outlined"
                                                        onChange={(e) => {
                                                            handleChange(e)
                                                        }}                                                    >
                                                        <MenuItem value="0">--All Pay Points--</MenuItem>
                                                        {generateDropDownMenu(payPoints)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="employeeSubCategoryMappingID">
                                                        Employee Category
                                                    </InputLabel>
                                                    <TextField select fullWidth
                                                        size='small'
                                                        id="employeeSubCategoryMappingID"
                                                        onBlur={handleBlur}
                                                        name="employeeSubCategoryMappingID"
                                                        value={rationDetailsReport.employeeSubCategoryMappingID}
                                                        type="text"
                                                        variant="outlined"
                                                        onChange={(e) => handleChange(e)}
                                                    >
                                                        <MenuItem value="0">--All Employee Categories--</MenuItem>
                                                        {generateDropDownMenu(employeeSubCategoryMapping)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="date">
                                                        Date
                                                    </InputLabel>
                                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                        <KeyboardDatePicker
                                                            autoOk
                                                            error={Boolean(touched.applicableDate && errors.applicableDate)}
                                                            fullWidth
                                                            helperText={touched.applicableDate && errors.applicableDate}
                                                            variant="inline"
                                                            format="yyyy/MM/dd"
                                                            margin="dense"
                                                            id="date"
                                                            value={rationDetailsReport.date}
                                                            onChange={(e) => handleDateChange(e)}
                                                            shouldDisableDate={isDayDisabled}
                                                            KeyboardButtonProps={{
                                                                'aria-label': 'change date',
                                                            }}
                                                        />
                                                    </MuiPickersUtilsProvider>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="regNo">
                                                        Registration Number
                                                    </InputLabel>
                                                    <TextField
                                                        fullWidth
                                                        size='small'
                                                        name="regNo"
                                                        onChange={(e) => handleChange(e)}
                                                        value={rationDetailsReport.regNo}
                                                        variant="outlined"
                                                    />
                                                </Grid>
                                                <Grid container justify="flex-end">
                                                    <Box pr={2}>
                                                        <Button
                                                            color="primary"
                                                            variant="contained"
                                                            type="submit"
                                                            size='small'
                                                        >
                                                            Search
                                                        </Button>
                                                    </Box>
                                                </Grid>
                                            </Grid>

                                            <br />
                                            <Box minWidth={1050}>
                                                <br></br>
                                                <br></br>
                                                {rationDetailsData.length > 0 ? (
                                                    <TableContainer component={Paper}>
                                                        <Table className={classes.table} aria-label="simple table" size='small'>
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell rowSpan={2} align="left" style={{ fontWeight: "bold", border: "1px solid black" }}> Code </TableCell>
                                                                    {/* <TableCell rowSpan={2} align="left" style={{ fontWeight: "bold", border: "1px solid black" }}> Folio </TableCell> */}
                                                                    <TableCell rowSpan={2} align="left" style={{ fontWeight: "bold", border: "1px solid black" }}> Ration Card </TableCell>
                                                                    <TableCell rowSpan={2} align="left" style={{ fontWeight: "bold", border: "1px solid black" }}> Employee Name </TableCell>
                                                                    {/* <TableCell rowSpan={2} align="right" style={{ fontWeight: "bold", border: "1px solid black" }}> Eligible Days </TableCell> */}
                                                                    <TableCell rowSpan={2} align="right" style={{ fontWeight: "bold", border: "1px solid black" }}> Khetland </TableCell>
                                                                    <TableCell rowSpan={2} align="right" style={{ fontWeight: "bold", border: "1px solid black" }}> Workers </TableCell>
                                                                    <TableCell colSpan={2} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}> Dependants </TableCell>
                                                                    <TableCell rowSpan={2} align="right" style={{ fontWeight: "bold", border: "1px solid black" }}> Gross </TableCell>
                                                                    <TableCell rowSpan={2} align="right" style={{ fontWeight: "bold", border: "1px solid black" }}> Deduction </TableCell>
                                                                    <TableCell rowSpan={2} align="right" style={{ fontWeight: "bold", border: "1px solid black" }}> Net </TableCell>
                                                                    <TableCell rowSpan={2} align="right" style={{ fontWeight: "bold", border: "1px solid black" }}> Value </TableCell>
                                                                    <TableCell rowSpan={2} align="left" style={{ fontWeight: "bold", border: "1px solid black" }}> Signature </TableCell>
                                                                    {/* <TableCell rowSpan={2} align="left" style={{ fontWeight: "bold", border: "1px solid black" }}> Signature of Manager </TableCell> */}
                                                                </TableRow>
                                                                <TableRow>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}> Age 0 - 8 </TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}> Age Above 8 + </TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {rationDetailsData.map((group, i) => {
                                                                    let TtotalArea = 0;
                                                                    let TtotalNoofWorkers = 0;
                                                                    let TtotalnoofUnder8Dependent = 0;
                                                                    let Ttotalnoof8to12Dependent = 0;
                                                                    let TtotalofTotalEntitileQuntity = 0;
                                                                    let TtotaldeductionAmount = 0;
                                                                    let TtotalnetEntitlement = 0;
                                                                    let TtotalValue = 0;
                                                                    return (
                                                                        <React.Fragment key={i}>
                                                                            <TableRow>
                                                                                <TableCell colSpan={14} component="th" scope="row" align="left" style={{ border: "1px solid black", fontWeight: 'bolder', color: 'red' }}>
                                                                                    {'Outgarden:  ' + group.divisionName}<br />
                                                                                    {'Category: ' + group.employeeSubCategoryName}
                                                                                </TableCell>
                                                                            </TableRow>
                                                                            {group.details.map((grp, j) => {
                                                                                let totalArea = 0;
                                                                                let totalNoofWorkers = 0;
                                                                                let totalnoofUnder8Dependent = 0;
                                                                                let totalnoof8to12Dependent = 0;
                                                                                let totalofTotalEntitileQuntity = 0;
                                                                                let totaldeductionAmount = 0;
                                                                                let totalnetEntitlement = 0;
                                                                                let totalValue = 0;
                                                                                return (
                                                                                    <React.Fragment key={j}>
                                                                                        <TableRow>
                                                                                            <TableCell colSpan={14} component="th" scope="row" align="left" style={{ border: "1px solid black", fontWeight: 'bolder' }}>{'PayPoint:  ' + grp.payPointName}</TableCell>
                                                                                        </TableRow>
                                                                                        {grp.detailsx.map((detail, k) => {
                                                                                            totalArea += parseFloat(detail.area);
                                                                                            totalNoofWorkers += parseFloat(detail.noofWorkers);
                                                                                            totalnoofUnder8Dependent += parseFloat(detail.noofUnder8Dependent);
                                                                                            totalnoof8to12Dependent += parseFloat(detail.noof8to12Dependent);
                                                                                            totalofTotalEntitileQuntity += parseFloat(detail.totalEntitileQuntity);
                                                                                            totaldeductionAmount += parseFloat(detail.deductionAmount);
                                                                                            totalnetEntitlement += parseFloat(detail.netEntitlement);
                                                                                            totalValue += parseFloat(detail.value);
                                                                                            TtotalArea += parseFloat(detail.area);
                                                                                            TtotalNoofWorkers += parseFloat(detail.noofWorkers);
                                                                                            TtotalnoofUnder8Dependent += parseFloat(detail.noofUnder8Dependent);
                                                                                            Ttotalnoof8to12Dependent += parseFloat(detail.noof8to12Dependent);
                                                                                            TtotalofTotalEntitileQuntity += parseFloat(detail.totalEntitileQuntity);
                                                                                            TtotaldeductionAmount += parseFloat(detail.deductionAmount);
                                                                                            TtotalnetEntitlement += parseFloat(detail.netEntitlement);
                                                                                            TtotalValue += parseFloat(detail.value);
                                                                                            return (
                                                                                                <TableRow key={`${i}-${j}-${k}`}>
                                                                                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}>{detail.registrationNumber}</TableCell>
                                                                                                    {/* <TableCell align="left" style={{ border: "1px solid black" }}>{(detail.folio)}</TableCell> */}
                                                                                                    <TableCell align="left" style={{ border: "1px solid black" }}>{(detail.employeeRationCard)}</TableCell>
                                                                                                    <TableCell align="left" style={{ border: "1px solid black" }}>{(detail.firstName)}</TableCell>
                                                                                                    {/* <TableCell align="right" style={{ border: "1px solid black" }}>{(detail.eligbleDays)}</TableCell> */}
                                                                                                    <TableCell align="right" style={{ border: "1px solid black" }}>{parseFloat(detail.area).toFixed(3)}</TableCell>
                                                                                                    <TableCell align="right" style={{ border: "1px solid black" }}>{(detail.noofWorkers)}</TableCell>
                                                                                                    <TableCell align="right" style={{ border: "1px solid black" }}>{(detail.noofUnder8Dependent)}</TableCell>
                                                                                                    <TableCell align="right" style={{ border: "1px solid black" }}>{(detail.noof8to12Dependent)}</TableCell>
                                                                                                    <TableCell align="right" style={{ border: "1px solid black" }}>{parseFloat(detail.totalEntitileQuntity).toFixed(3)}</TableCell>
                                                                                                    <TableCell align="right" style={{ border: "1px solid black" }}>{parseFloat(detail.deductionAmount).toFixed(3)}</TableCell>
                                                                                                    <TableCell align="right" style={{ border: "1px solid black" }}>{parseFloat(detail.netEntitlement).toFixed(3)}</TableCell>
                                                                                                    <TableCell align="right" style={{ border: "1px solid black" }}>{parseFloat(detail.value).toFixed(3)}</TableCell>
                                                                                                    <TableCell align="right" style={{ border: "1px solid black" }}>{ }</TableCell>
                                                                                                    {/* <TableCell align="right" style={{ border: "1px solid black" }}>{ }</TableCell> */}
                                                                                                </TableRow>
                                                                                            );
                                                                                        })}
                                                                                        <TableRow>
                                                                                            <TableCell align="left" colSpan={3} style={{ border: "1px solid black", fontWeight: "bold", fontStyle: "italic" }}>Total</TableCell>
                                                                                            <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold" }}>{parseFloat(totalArea).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</TableCell>
                                                                                            <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold" }}>{(totalNoofWorkers)}</TableCell>
                                                                                            <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold" }}>{(totalnoofUnder8Dependent)}</TableCell>
                                                                                            <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold" }}>{(totalnoof8to12Dependent)}</TableCell>
                                                                                            <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold" }}>{parseFloat(totalofTotalEntitileQuntity).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</TableCell>
                                                                                            <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold" }}>{parseFloat(totaldeductionAmount).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</TableCell>
                                                                                            <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold" }}>{parseFloat(totalnetEntitlement).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</TableCell>
                                                                                            <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold" }}>{parseFloat(totalValue).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</TableCell>
                                                                                            <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold" }}>{ }</TableCell>
                                                                                            {/* <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold" }}>{ }</TableCell> */}
                                                                                        </TableRow>
                                                                                    </React.Fragment>
                                                                                );
                                                                            })}
                                                                            <TableRow>
                                                                                <TableCell align="left" colSpan={3} style={{ border: "1px solid black", fontWeight: "bold", fontStyle: "italic" }}>Total</TableCell>
                                                                                <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold" }}>{parseFloat(TtotalArea).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</TableCell>
                                                                                <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold" }}>{(TtotalNoofWorkers)}</TableCell>
                                                                                <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold" }}>{(TtotalnoofUnder8Dependent)}</TableCell>
                                                                                <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold" }}>{(Ttotalnoof8to12Dependent)}</TableCell>
                                                                                <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold" }}>{parseFloat(TtotalofTotalEntitileQuntity).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</TableCell>
                                                                                <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold" }}>{parseFloat(TtotaldeductionAmount).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</TableCell>
                                                                                <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold" }}>{parseFloat(TtotalnetEntitlement).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</TableCell>
                                                                                <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold" }}>{parseFloat(TtotalValue).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</TableCell>
                                                                                <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold" }}>{ }</TableCell>
                                                                                {/* <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold" }}>{ }</TableCell> */}
                                                                            </TableRow>
                                                                        </React.Fragment>
                                                                    );
                                                                })}
                                                                <TableRow>
                                                                    <TableCell align="left" colSpan={3} style={{ border: "1px solid black", fontWeight: "bold", fontStyle: "italic" }}>Grand Total</TableCell>
                                                                    <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold" }}>{parseFloat(totalValues.totalArea).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</TableCell>
                                                                    <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold" }}>{(totalValues.totalNoofWorkers)}</TableCell>
                                                                    <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold" }}>{(totalValues.totalnoofUnder8Dependent)}</TableCell>
                                                                    <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold" }}>{(totalValues.totalnoof8to12Dependent)}</TableCell>
                                                                    <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold" }}>{parseFloat(totalValues.totalofTotalEntitileQuntity).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</TableCell>
                                                                    <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold" }}>{parseFloat(totalValues.totaldeductionAmount).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</TableCell>
                                                                    <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold" }}>{parseFloat(totalValues.totalnetEntitlement).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</TableCell>
                                                                    <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold" }}>{parseFloat(totalValues.totalValue).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</TableCell>
                                                                    <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold" }}>{ }</TableCell>
                                                                    {/* <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold" }}>{ }</TableCell> */}
                                                                </TableRow>
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                ) : null}
                                            </Box>
                                        </CardContent>
                                        {rationDetailsData.length > 0 ?
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                <div>&nbsp;</div>
                                                <ReactToPrint
                                                    documentTitle={"Ration Entitlement"}
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
                                                        searchData={selectedSearchValues} rationDetailsData={rationDetailsData} totalValues={totalValues} />
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