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
    InputLabel
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import { Formik } from 'formik';
import * as Yup from "yup";
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePDF';
import { LoadingComponent } from 'src/utils/newLoader';
import { useAlert } from "react-alert";
import moment from 'moment';
import TablePagination from '@material-ui/core/TablePagination';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import xlsx from 'json-as-xlsx';
import { CustomMultiSelect } from 'src/utils/CustomMultiSelect';
import _ from 'lodash';

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

const screenCode = 'DAILYKATCHAREPORT';

export default function DailyKatchaReport(props) {
    const [title, setTitle] = useState("Daily Katcha Report")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [fromDate, setFromDate] = useState(new Date());
    const [gardens, setGardens] = useState([]);
    const [costCenters, setCostCenters] = useState();
    const [payPoints, setPayPoints] = useState([]);
    const [kamjari, setKamjari] = useState([]);
    const [empType, setEmpType] = useState([]);
    const [katchaData, setKatchaData] = useState([]);
    const [totalRow, setTotalRow] = useState([]);
    const curr = new Date;
    const first = curr.getDate() - curr.getDay();
    const last = first - 1;
    const lastday = new Date(curr.setDate(last)).toISOString().substr(0, 10);
    const [katchaDataList, setKatchaDataList] = useState({
        groupID: '0',
        gardenID: '0',
        costCenterID: '0',
        taskID: '0',
        fromDate: lastday,
        payPointID: '0'
    })
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: "0",
        gardenName: "0",
        costCenterName: "0",
        fromDate: "",
        taskName: "0",
    })
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const componentRef = useRef();
    const navigate = useNavigate();
    const alert = useAlert();
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(5);
    const [columnOne, setColumnOne] = useState([]);
    const [columnTwo, setColumnTwo] = useState([]);
    const [columnThree, setColumnThree] = useState([]);
    const [columnFour, setColumnFour] = useState([]);


    const [selectedOptions, setSelectedOptions] = useState([]);
    const getOptionLabel = option => `${option.label}`;
    const getOptionDisabled = option => option.value === "foo";
    const handleToggleOption = selectedOptions =>
        setSelectedOptions(selectedOptions);
    const handleClearOptions = () => setSelectedOptions([]);
    const handleSelectAll = isSelected => {
        if (isSelected) {
            setSelectedOptions(empType);
        } else {
            handleClearOptions();
        }
    };

    const [selectedOptions2, setSelectedOptions2] = useState([]);
    const getOptionLabel2 = option => `${option.label}`;
    const getOptionDisabled2 = option => option.value === "foo";
    const handleToggleOption2 = selectedOptions =>
        setSelectedOptions2(selectedOptions);
    const handleClearOptions2 = () => setSelectedOptions2([]);
    const handleSelectAll2 = isSelected => {
        if (isSelected) {
            setSelectedOptions2(kamjari);
        } else {
            handleClearOptions2();
        }
    };

    let prescription = {
        prescriptionDate: fromDate,  // Today
        prescriptionExpirationDate: 6  // Days to add
    };
    let date = new Date(new Date(prescription.prescriptionDate).setDate(prescription.prescriptionDate.getDate() + prescription.prescriptionExpirationDate)).toISOString();

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission(), GetEmployeeTypesData());
    }, []);

    useEffect(() => {
        setKatchaDataList((prevState) => ({
            ...prevState,
            costCenterID: "0"
        }));
    }, [katchaDataList.groupID]);

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID(), GetDivisionDetailsByGroupID());
    }, [katchaDataList.groupID]);

    useEffect(() => {
        trackPromise(
            getCostCenterDetailsByGardenID()
        )
    }, [katchaDataList.gardenID]);

    useEffect(() => {
        setKatchaData([])
    }, [katchaDataList.gardenID]);

    useEffect(() => {
        setKatchaData([])
    }, [katchaDataList.costCenterID]);

    useEffect(() => {
        setKatchaData([])
    }, [fromDate]);

    const handleLimitChange = (event) => {
        setLimit(event.target.value);
    };
    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    useEffect(() => {
        setKatchaData([])
    }, [selectedOptions2]);

    useEffect(() => {
        setKatchaData([])
    }, [selectedOptions]);

    useEffect(() => {
        if (katchaDataList.gardenID != "0" && katchaDataList.costCenterID != "0") {
            trackPromise(
                getLabourTask()
            )
        }
    }, [katchaDataList.gardenID, katchaDataList.costCenterID, fromDate]);


    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWDAILYKATCHAREPORT');

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

        setKatchaDataList({
            ...katchaDataList,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            gardenID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function GetEmployeeTypesData() {
        const result = await services.GetAllEmployeeSubCategoryMapping();
        var newOptionArray = empType;
        for (var i = 0; i < result.length; i++) {
            newOptionArray.push({ label: result[i].employeeSubCategoryName, value: result[i].employeeSubCategoryMappingID })
        }
        setEmpType(newOptionArray);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(katchaDataList.groupID);
        setGardens(response);
    };

    async function getCostCenterDetailsByGardenID() {
        var response = await services.getDivisionDetailsByEstateID(katchaDataList.gardenID);
        var generated = generateDropDownMenu(response)
        if (generated.length > 0) {
            setKatchaDataList((katchaDataList) => ({
                ...katchaDataList,
                costCenterID: generated[0].props.value,
            }));
        }
        setCostCenters(response);
    };

    async function GetDivisionDetailsByGroupID() {
        const result = await services.GetDivisionDetailsByGroupID(katchaDataList.groupID);
        setPayPoints(result);
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

    async function GetDetails() {
        let model = {
            gardenID: parseInt(katchaDataList.gardenID),
            costCenterID: parseInt(katchaDataList.costCenterID),
            payPointID: parseInt(katchaDataList.payPointID),
            fromDate: moment(fromDate.toString()).format().split('T')[0],
            taskID: selectedOptions2.map(x => x.value).join(','),
            empTypeID: selectedOptions.map(x => x.value).join(',')
        }
        getSelectedDropdownValuesForReport(model);
        const response = await services.GetDailyKatchaReportDetails(model);
        if (response.statusCode == "Success" && response.data != null) {
            createReportTableData(response.data)
            createReportTableColumnNames(response.data)
        }
        else {
            setKatchaData([])
            alert.error(response.message);
        }
    }

    async function getLabourTask() {
        const result = await services.getLabourTask(katchaDataList.gardenID, katchaDataList.costCenterID, fromDate);
        var newOptionArray = [];
        for (var i = 0; i < result.length; i++) {
            newOptionArray.push({ label: result[i].taskName, value: result[i].taskID })
        }
        setKamjari(newOptionArray);
    }

    function createReportTableData(data) {
        var result = [];
        data.forEach((x, i) => {
            let totalAllowance = 0;
            let totalBasicAmount = 0;
            let totalGardenAllowance = 0;
            let totalOtAmount = 0;
            let grndTotal = 0;
            x.employeeTypeList.forEach(y => {
                totalAllowance = totalAllowance + y.allowance;
                totalBasicAmount = totalBasicAmount + y.basicAmount;
                totalGardenAllowance = totalGardenAllowance + y.gardenAllowance;
                totalOtAmount = totalOtAmount + y.otAmount;
                grndTotal = grndTotal + (y.allowance + y.basicAmount + y.gardenAllowance + y.otAmount);
                x.totalAllowance = totalAllowance
                x.totalBasicAmount = totalBasicAmount
                x.totalGardenAllowance = totalGardenAllowance
                x.totalOtAmount = totalOtAmount
                x.grndTotal = grndTotal
                y.duffaTypeList.forEach(z => {
                    var colname = y.empTypeID + ' ' + z.gangID;
                    var colname1 = y.empTypeID + ' allowance';
                    var colname2 = y.empTypeID + ' basicAmount';
                    var colname3 = y.empTypeID + ' gardenAllowance';
                    var colname4 = y.empTypeID + ' otAmount';
                    var duplicateDate = result.find(i => i.kamjariID === x.kamjariID);
                    if (duplicateDate) {
                        duplicateDate[colname] = duplicateDate[colname] == undefined ? 0 + z.dafaTypeCount : duplicateDate[colname] + z.dafaTypeCount;
                        duplicateDate[colname1] = duplicateDate[colname1] == undefined ? 0 + y.allowance : duplicateDate[colname1];
                        duplicateDate[colname2] = duplicateDate[colname2] == undefined ? 0 + y.basicAmount : duplicateDate[colname2];
                        duplicateDate[colname3] = duplicateDate[colname3] == undefined ? 0 + y.gardenAllowance : duplicateDate[colname3];
                        duplicateDate[colname4] = duplicateDate[colname4] == undefined ? 0 + y.otAmount : duplicateDate[colname4];
                        duplicateDate.kamjariID = x.kamjariID;
                        duplicateDate.kamjariName = x.kamjariName;
                        duplicateDate.kamjariTotal = x.kamjariTotal;
                        duplicateDate.totalPresent = duplicateDate.totalPresent + z.dafaTypeCount;
                    }
                    else {
                        result.push({
                            [colname]: z.dafaTypeCount,
                            [colname1]: y.allowance,
                            [colname2]: y.basicAmount,
                            [colname3]: y.gardenAllowance,
                            [colname4]: y.otAmount,
                            kamjariID: x.kamjariID,
                            kamjariName: x.kamjariName,
                            kamjariTotal: x.kamjariTotal,
                            totalPresent: z.dafaTypeCount
                        });
                    }
                });
                result[i].totalAllowance = x.totalAllowance
                result[i].totalBasicAmount = x.totalBasicAmount
                result[i].totalGardenAllowance = x.totalGardenAllowance
                result[i].totalOtAmount = x.totalOtAmount
                result[i].grndTotal = x.grndTotal
            });
        });
        setKatchaData(result)
        calTotalRow(result)
    }

    function calTotalRow(data) {
        var total = [];
        data.forEach(x => {
            for (var property in x) {
                if (property !== "kamjariName" && property !== "kamjariID") {
                    total.push({ name: property, value: x[property] });
                }
            }
        });

        const res = Array.from(total.reduce(
            (m, { name, value }) => m.set(name, parseFloat(m.get(name) || 0) + parseFloat(value)), new Map
        ), ([name, value]) => ({ name, value }));
        setTotalRow(res)
    }

    function createReportTableColumnNames(data) {
        var result = [];
        var resultOne = [];
        var resultTwo = [];
        var resultThree = [];
        data.forEach(x => {
            x.employeeTypeList.forEach(y => {

                var duplicateDate = result.find(i => i.empTypeID === y.empTypeID);

                if (duplicateDate) {
                    duplicateDate.empTypeID = y.empTypeID;
                    duplicateDate.empTypeName = y.empTypeName;
                }
                else {
                    result.push({
                        empTypeName: y.empTypeName,
                        empTypeID: y.empTypeID
                    });
                }
            });
        });
        data.forEach(x => {
            x.employeeTypeList.forEach(y => {
                y.duffaTypeList.forEach(z => {
                    var duplicateDate = resultOne.find(i => i.empTypeID === y.empTypeID && i.gangID === z.gangID);

                    if (duplicateDate) {
                        duplicateDate.empTypeID = y.empTypeID;
                        duplicateDate.empTypeName = y.empTypeName;
                        duplicateDate.gangID = z.gangID;
                        duplicateDate.dafaTypeName = z.dafaTypeName;
                    }
                    else {
                        resultOne.push({
                            empTypeName: y.empTypeName,
                            empTypeID: y.empTypeID,
                            dafaTypeName: z.dafaTypeName,
                            gangID: z.gangID
                        });
                    }
                });
            });
        });

        for (let i = 0; i < result.length; i++) {
            resultTwo.push({ empTypeID: result[i].empTypeID, empTypeName: result[i].empTypeName, colID: result[i].empTypeID + ' otAmount', colName: 'OT' })
            resultTwo.push({ empTypeID: result[i].empTypeID, empTypeName: result[i].empTypeName, colID: result[i].empTypeID + ' allowance', colName: 'BCS' })
            resultTwo.push({ empTypeID: result[i].empTypeID, empTypeName: result[i].empTypeName, colID: result[i].empTypeID + ' gardenAllowance', colName: 'Ex.Pay' })
            resultTwo.push({ empTypeID: result[i].empTypeID, empTypeName: result[i].empTypeName, colID: result[i].empTypeID + ' basicAmount', colName: 'Basic' })
        }

        resultThree.push({ colID: 'totalPresent' })
        resultThree.push({ colID: 'totalBasicAmount' })
        resultThree.push({ colID: 'totalGardenAllowance' })
        resultThree.push({ colID: 'totalAllowance' })
        resultThree.push({ colID: 'totalOtAmount' })
        resultThree.push({ colID: 'grndTotal' })

        result.sort((a, b) => a.empTypeID > b.empTypeID ? 1 : -1);
        resultOne.sort((a, b) => a.empTypeID > b.empTypeID ? 1 : -1);
        resultTwo.sort((a, b) => a.empTypeID > b.empTypeID ? 1 : -1);

        setColumnOne(result)
        setColumnTwo(resultOne)
        setColumnThree(resultTwo)
        setColumnFour(resultThree)
    }

    async function createDataForExcel(data) {
        var array = _.cloneDeep(data)
        if (array != null) {
            array.forEach(x => {
                for (var property in x) {
                    if (property !== "kamjariName") {
                        x[property] = x[property] == 0 ? '' : x[property]
                    }
                }
            });
            let newArray = [];
            newArray['kamjariName'] = 'Total'
            totalRow.forEach(x => {
                newArray[x.name] = x.value == 0 ? '' : parseFloat(x.value).toFixed(0)
            })
            array.push(newArray)
            array.push({})
            var vr = {
                'kamjariName': 'Business Division - ' + selectedSearchValues.groupName,
            };
            var vr1 = {
                'kamjariName': 'Garden - ' + selectedSearchValues.gardenName,
            };
            var vr2 = {
                'kamjariName': 'Sub Division - ' + selectedSearchValues.costCenterName,
            };
            var vr3 = {
                'kamjariName': 'Date - ' + fromDate.toISOString().split('T')[0],
            };
            array.push(vr, vr1, vr2, vr3);
        }
        return array;
    }

    async function createFile() {
        var file = await createDataForExcel(katchaData);
        var settings = {
            sheetName: 'Daily Katcha Report',
            fileName: 'Daily Katcha Report - ' + fromDate.toISOString().substr(0, 10)
        };

        var res = [];
        res.push({ label: 'Particulars of Work', value: 'kamjariName' });
        columnTwo.forEach(x => {
            res.push({ label: x.empTypeName + ' ' + x.dafaTypeName, value: x.empTypeID + ' ' + x.gangID });
        })
        res.push({ label: 'Total Present', value: 'totalPresent' });
        columnThree.forEach(x => {
            res.push({ label: x.empTypeName + ' ' + x.colName, value: x.colID });
        })
        res.push({ label: 'Total Basic', value: 'totalBasicAmount' });
        res.push({ label: 'Total Garden Allowance', value: 'totalGardenAllowance' });
        res.push({ label: 'Total Allowance', value: 'totalAllowance' });
        res.push({ label: 'Total OT Amount', value: 'totalOtAmount' });
        res.push({ label: 'Grand Total', value: 'grndTotal' });

        let dataA = [
            {
                sheet: 'Daily Katcha Report',
                columns: res,
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
        setKatchaDataList({
            ...katchaDataList,
            [e.target.name]: value
        });
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: groups[katchaDataList.groupID],
            gardenName: gardens[searchForm.gardenID],
            costCenterName: costCenters[searchForm.costCenterID],
            taskID: selectedOptions2.map(x => x.label).join(','),
            empTypeName: selectedOptions.map(x => x.label).join(','),
            fromDate: fromDate.toISOString().split('T')[0]
        })
    }

    return (
        <Page className={classes.root} title={title}>
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: katchaDataList.groupID,
                        gardenID: katchaDataList.gardenID,
                        costCenterID: katchaDataList.costCenterID,
                        fromDate: katchaDataList.fromDate,
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Business Division is required').min("1", 'Business Division is required'),
                            fromDate: Yup.date().required('Date is required'),
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
                                                        Business Division  *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.groupID && errors.groupID)}
                                                        fullWidth
                                                        helperText={touched.groupID && errors.groupID}
                                                        name="groupID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={katchaDataList.groupID}
                                                        variant="outlined"
                                                        id="groupID"
                                                        size='small'
                                                        InputProps={{
                                                            readOnly: !permissionList.isGroupFilterEnabled ? true : false,
                                                        }}
                                                    >
                                                        <MenuItem value="0">--Select Business Division--</MenuItem>
                                                        {generateDropDownMenu(groups)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="gardenID">
                                                        Location
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.gardenID && errors.gardenID)}
                                                        fullWidth
                                                        helperText={touched.gardenID && errors.gardenID}
                                                        name="gardenID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={katchaDataList.gardenID}
                                                        variant="outlined"
                                                        id="gardenID"
                                                        size='small'
                                                        InputProps={{
                                                            readOnly: !permissionList.isFactoryFilterEnabled ? true : false,
                                                        }}
                                                    >
                                                        <MenuItem value="0">--All Locations--</MenuItem>
                                                        {generateDropDownMenu(gardens)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="costCenterID">
                                                        Sub Division
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.costCenterID && errors.costCenterID)}
                                                        fullWidth
                                                        helperText={touched.costCenterID && errors.costCenterID}
                                                        name="costCenterID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={katchaDataList.costCenterID}
                                                        variant="outlined"
                                                        id="costCenterID"
                                                        size='small'

                                                    >
                                                        <MenuItem value="0">--All Sub Divisions--</MenuItem>
                                                        {generateDropDownMenu(costCenters)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="payPointID">
                                                        Pay Point
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.payPointID && errors.payPointID)}
                                                        fullWidth
                                                        helperText={touched.payPointID && errors.payPointID}
                                                        name="payPointID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={katchaDataList.payPointID}
                                                        variant="outlined"
                                                        id="payPointID"
                                                        size='small'
                                                    >
                                                        <MenuItem value="0">--All Pay Points--</MenuItem>
                                                        {generateDropDownMenu(payPoints)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="fromDate">
                                                        From Date *
                                                    </InputLabel>
                                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                        <KeyboardDatePicker
                                                            autoOk
                                                            fullWidth
                                                            variant="inline"
                                                            format="dd/MM/yyyy"
                                                            margin="dense"
                                                            id="fromDate"
                                                            value={fromDate}
                                                            onChange={(e) => {
                                                                setFromDate(e);

                                                            }}
                                                            KeyboardButtonProps={{
                                                                'aria-label': 'change date',
                                                            }}
                                                        />
                                                    </MuiPickersUtilsProvider>
                                                </Grid>
                                                <Grid item md={3} xs={12} >
                                                    <InputLabel shrink id="taskID">
                                                        Kamjari
                                                    </InputLabel>
                                                    <CustomMultiSelect
                                                        items={kamjari}
                                                        getOptionLabel={getOptionLabel2}
                                                        getOptionDisabled={getOptionDisabled2}
                                                        selectedValues={selectedOptions2}
                                                        placeholder="Kamjari"
                                                        selectAllLabel="Select all"
                                                        onToggleOption={handleToggleOption2}
                                                        onClearOptions={handleClearOptions2}
                                                        onSelectAll={handleSelectAll2}
                                                    />
                                                </Grid>
                                                <Grid item md={3} xs={12} >
                                                    <InputLabel shrink id="empTypeID">
                                                        Employee Sub Category
                                                    </InputLabel>
                                                    <CustomMultiSelect
                                                        items={empType}
                                                        getOptionLabel={getOptionLabel}
                                                        getOptionDisabled={getOptionDisabled}
                                                        selectedValues={selectedOptions}
                                                        placeholder="Employee Sub Category"
                                                        selectAllLabel="Select all"
                                                        onToggleOption={handleToggleOption}
                                                        onClearOptions={handleClearOptions}
                                                        onSelectAll={handleSelectAll}
                                                    />
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
                                            <br />
                                            <Box minWidth={900}>
                                                {katchaData.length > 0 ?
                                                    <>
                                                        <TableContainer component={Paper}>
                                                            <Table size="small" aria-label="a dense table">
                                                                <TableHead>
                                                                    <TableRow>
                                                                        <TableCell align="center" rowSpan={3} style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black" }}>
                                                                            Particulars&nbsp;of&nbsp;Work&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                                        </TableCell>
                                                                        <TableCell align="center" colSpan={columnTwo.length + 1} style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black" }}>
                                                                            Number of Workers
                                                                        </TableCell>
                                                                        <TableCell align="center" colSpan="21" style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black" }}>
                                                                            Wages
                                                                        </TableCell>
                                                                    </TableRow>
                                                                    <TableRow>
                                                                        {columnOne.map((row, i) => {
                                                                            const found = columnTwo.filter(x => x.empTypeID == row.empTypeID)
                                                                            return (
                                                                                <TableCell align="center" colSpan={found.length} style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black" }}>
                                                                                    {row.empTypeName}
                                                                                </TableCell>
                                                                            )
                                                                        })}
                                                                        <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black" }}>
                                                                            Total
                                                                        </TableCell>
                                                                        {columnOne.map((row, i) => {
                                                                            return (
                                                                                <TableCell align="center" colSpan={4} style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black" }}>
                                                                                    {row.empTypeName}
                                                                                </TableCell>
                                                                            )
                                                                        })}
                                                                        <TableCell align="center" colSpan="5" style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black" }}>
                                                                            Total
                                                                        </TableCell>
                                                                    </TableRow>
                                                                    <TableRow>
                                                                        {columnTwo.map((row, i) => {
                                                                            return (
                                                                                <TableCell align="right" style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black" }}>
                                                                                    {row.dafaTypeName.substring(0, 1)}
                                                                                </TableCell>
                                                                            )
                                                                        })}
                                                                        {columnThree.map((row, i) => {
                                                                            return (
                                                                                <TableCell align="right" style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black" }}>
                                                                                    {row.colName}
                                                                                </TableCell>
                                                                            )
                                                                        })}
                                                                        <TableCell align="right" style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black" }}>Basic</TableCell>
                                                                        <TableCell align="right" style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black" }}>Ex.Pay</TableCell>
                                                                        <TableCell align="right" style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black" }}>BCS</TableCell>
                                                                        <TableCell align="right" style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black" }}>OT</TableCell>
                                                                        <TableCell align="right" style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black" }}>G.Total</TableCell>
                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                    {katchaData.slice(page * limit, page * limit + limit).map((row, i) => {
                                                                        return (
                                                                            <TableRow key={i}>
                                                                                <TableCell component="th" scope="row" align="left" style={{ width: '100px', fontSize: 12, border: "1px solid black" }}>
                                                                                    {row.kamjariName}
                                                                                </TableCell>
                                                                                {columnTwo.map((rows, i) => {
                                                                                    var res = row[rows.empTypeID + ' ' + rows.gangID]
                                                                                    return (
                                                                                        <TableCell align="right" style={{ fontSize: 12, border: "1px solid black" }}>
                                                                                            {res == undefined ? '-' : res == 0 ? '-' : parseFloat(res).toFixed(0)}
                                                                                        </TableCell>
                                                                                    )
                                                                                })}
                                                                                <TableCell align="right" style={{ fontSize: 12, border: "1px solid black" }}>
                                                                                    {parseFloat(row.totalPresent).toFixed(0)}
                                                                                </TableCell>
                                                                                {columnThree.map((rows, i) => {
                                                                                    var res = row[rows.colID]
                                                                                    return (
                                                                                        <TableCell align="right" style={{ fontSize: 12, border: "1px solid black" }}>
                                                                                            {res == undefined ? '-' : res == 0 ? '-' : parseFloat(res).toFixed(0)}
                                                                                        </TableCell>
                                                                                    )
                                                                                })}
                                                                                <TableCell align="right" style={{ fontSize: 12, border: "1px solid black" }}>{row.totalBasicAmount == 0 ? '-' : parseFloat(row.totalBasicAmount).toFixed(0)}</TableCell>
                                                                                <TableCell align="right" style={{ fontSize: 12, border: "1px solid black" }}>{row.totalGardenAllowance == 0 ? '-' : parseFloat(row.totalGardenAllowance).toFixed(0)}</TableCell>
                                                                                <TableCell align="right" style={{ fontSize: 12, border: "1px solid black" }}>{row.totalAllowance == 0 ? '-' : parseFloat(row.totalAllowance).toFixed(0)}</TableCell>
                                                                                <TableCell align="right" style={{ fontSize: 12, border: "1px solid black" }}>{row.totalOtAmount == 0 ? '-' : parseFloat(row.totalOtAmount).toFixed(0)}</TableCell>
                                                                                <TableCell align="right" style={{ fontSize: 12, border: "1px solid black" }}>{row.grndTotal == 0 ? '-' : parseFloat(row.grndTotal).toFixed(0)}</TableCell>
                                                                            </TableRow>
                                                                        )
                                                                    })}
                                                                    <TableRow >
                                                                        <TableCell component="th" scope="row" align="left" style={{ width: '100px', fontSize: 12, border: "1px solid black", fontWeight: "bold" }}>
                                                                            Total
                                                                        </TableCell>
                                                                        {columnTwo.map((rows, i) => {
                                                                            var res = totalRow.find(x => x.name == rows.empTypeID + ' ' + rows.gangID)
                                                                            return (
                                                                                <TableCell align="right" style={{ fontSize: 12, border: "1px solid black", fontWeight: "bold" }}>
                                                                                    {res == undefined ? '-' : res.value == 0 ? '-' : parseFloat(res.value).toFixed(0)}
                                                                                </TableCell>
                                                                            )
                                                                        })}
                                                                        {columnFour.map((rows, i) => {
                                                                            if (rows.colID == 'totalPresent') {
                                                                                var res = totalRow.find(x => x.name == rows.colID)
                                                                                return (
                                                                                    <TableCell align="right" style={{ fontSize: 12, border: "1px solid black", fontWeight: "bold" }}>
                                                                                        {res == undefined ? '-' : res.value == 0 ? '-' : parseFloat(res.value).toFixed(0)}
                                                                                    </TableCell>
                                                                                )
                                                                            }
                                                                        })}
                                                                        {columnThree.map((rows, i) => {
                                                                            var res = totalRow.find(x => x.name == rows.colID)
                                                                            return (
                                                                                <TableCell align="right" style={{ fontSize: 12, border: "1px solid black", fontWeight: "bold" }}>
                                                                                    {res == undefined ? '-' : res.value == 0 ? '-' : parseFloat(res.value).toFixed(0)}
                                                                                </TableCell>
                                                                            )
                                                                        })}
                                                                        {columnFour.map((rows, i) => {
                                                                            if (rows.colID != 'totalPresent') {
                                                                                var res = totalRow.find(x => x.name == rows.colID)
                                                                                return (
                                                                                    <TableCell align="right" style={{ fontSize: 12, border: "1px solid black", fontWeight: "bold" }}>
                                                                                        {res == undefined ? '-' : res.value == 0 ? '-' : parseFloat(res.value).toFixed(0)}
                                                                                    </TableCell>
                                                                                )
                                                                            }
                                                                        })}
                                                                    </TableRow>
                                                                </TableBody>
                                                            </Table>
                                                        </TableContainer>
                                                        <TablePagination
                                                            component="div"
                                                            count={katchaData.length}
                                                            onChangePage={handlePageChange}
                                                            onChangeRowsPerPage={handleLimitChange}
                                                            page={page}
                                                            rowsPerPage={limit}
                                                            rowsPerPageOptions={[5, 50, 100]}
                                                        />
                                                    </>
                                                    : null}
                                            </Box>
                                        </CardContent>
                                        {katchaData.length > 0 ?
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                <Button
                                                    color="primary"
                                                    id="btnRecord"
                                                    type="submit"
                                                    variant="contained"
                                                    style={{ marginRight: '1rem' }}
                                                    className={classes.colorRecord}
                                                    onClick={() => createFile()}
                                                    size='small'
                                                >
                                                    EXCEL
                                                </Button>
                                                <ReactToPrint
                                                    documentTitle={"Daily Katcha Report - " + fromDate.toISOString().substr(0, 10) + ' - ' + date.substr(0, 10)}
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
                                                        searchData={selectedSearchValues} katchaData={katchaData}
                                                        columnOne={columnOne}
                                                        columnTwo={columnTwo}
                                                        columnThree={columnThree}
                                                        columnFour={columnFour}
                                                        totalRow={totalRow}
                                                        date={date}
                                                    />
                                                </div>
                                            </Box> : null}
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