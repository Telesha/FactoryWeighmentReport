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
    TableSortLabel,
    Modal
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
import TablePagination from '@material-ui/core/TablePagination';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import xlsx from 'json-as-xlsx';
import { CustomMultiSelect } from 'src/utils/CustomMultiSelect';

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

const screenCode = 'EMPLOYEEBIOMETRICDETAILSREPORT';

export default function EmployeeBiometricDetailsReport(props) {
    const [title, setTitle] = useState("Employee Biometric")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [gardens, setGardens] = useState([]);
    const [employeeSubCategoryMapping, setEmployeeSubCategoryMapping] = useState([]);
    const [costCenters, setCostCenters] = useState();
    const [biometricData, setBiometricData] = useState([]);
    const [employeeType, setEmployeeType] = useState();
    const [orderBy, setOrderBy] = useState("registrationNumber");
    const [order, setOrder] = useState("asc");
    const [selectedImage, setSelectedImage] = useState(null);
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [gangs, setGangs] = useState([]);
    const [PayPoints, setPayPoints] = useState();
    const [initialState, setInitialState] = useState(false);
    const [biometricDataList, setBiometricDataList] = useState({
        groupID: '0',
        gardenID: '0',
        costCenterID: '0',
        empTypeID: '0',
        payPointID: '0',
        employeeSubCategoryMappingID: "0",
        empBioStatusID: '0',
        gangID: 0,
        registrationNumber: ''
    })

    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: "0",
        gardenName: "0",
        costCenterName: "0",
        empTypeName: "0",
        employeeSubCategory: "0",
        empBioStatusName: "0",
        gangName: "0",
        payPointName: ""
    })

    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const componentRef = useRef();
    const navigate = useNavigate();
    const alert = useAlert();
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);
    const [selectedOptions1, setSelectedOptions1] = useState([]);
    const getOptionLabel1 = option => `${option.label}`;
    const getOptionDisabled1 = option => option.value === "foo";
    const handleToggleOption1 = selectedOptions =>
        setSelectedOptions1(selectedOptions);
    const handleClearOptions1 = () => setSelectedOptions1([]);
    const handleSelectAll1 = isSelected => {
        if (isSelected) {
            setSelectedOptions1(employeeSubCategoryMapping);
        } else {
            handleClearOptions1();
        }
    };

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        if (!initialState) {
            trackPromise(getPermission());
        }
    }, []);


    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID(), GetDivisionDetailsByGroupID());
    }, [biometricDataList.groupID]);

    useEffect(() => {
        trackPromise(
            getCostCenterDetailsByGardenID()
        )
    }, [biometricDataList.gardenID]);

    useEffect(() => {
        if (initialState) {
            setBiometricDataList((prevState) => ({
                ...prevState,
                gardenID: 0,
                costCenterID: 0,
                payPointID: 0
            }));
        }
    }, [biometricDataList.groupID, initialState]);

    useEffect(() => {
        setBiometricData([])
    }, [biometricDataList, selectedOptions1]);

    useEffect(() => {
        setBiometricData([])
    }, [biometricDataList]);

    useEffect(() => {
        if (biometricDataList.costCenterID != "0") {
            getGangDetailsByDivisionID();
        }
    }, [biometricDataList.costCenterID]);

    useEffect(() => {
        if (initialState) {
            setBiometricDataList((prevState) => ({
                ...prevState,
                costCenterID: 0
            }));
        }
    }, [biometricDataList.gardenID, initialState]);

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission(), GetAllEmployeeSubCategoryMapping());
    }, []);

    const handleLimitChange = (event) => {
        setLimit(event.target.value);
    };
    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWEMPLOYEEBIOMETRICDETAILSREPORT');

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

        setBiometricDataList({
            ...biometricDataList,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            gardenID: parseInt(tokenService.getFactoryIDFromToken())
        })
        getEmployeeTypesForDropdown();
        setInitialState(true);
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(biometricDataList.groupID);
        setGardens(response);
    };

    async function getCostCenterDetailsByGardenID() {
        var response = await services.getDivisionDetailsByEstateID(biometricDataList.gardenID);
        setCostCenters(response);
    };

    async function getEmployeeTypesForDropdown() {
        const types = await services.getEmployeeTypesForDropdown();

        setEmployeeType(types);
    }

    async function getGangDetailsByDivisionID() {
        var response = await services.getGangDetailsByDivisionID(biometricDataList.costCenterID);
        setGangs(response);
    };

    async function GetAllEmployeeSubCategoryMapping() {
        const response = await services.GetAllEmployeeSubCategoryMapping();
        const newOptionArray = [];
        for (var i = 0; i < response.length; i++) {
            newOptionArray.push({ label: response[i].employeeSubCategoryName, value: response[i].employeeSubCategoryMappingID })
        }
        setEmployeeSubCategoryMapping(newOptionArray);
    }

    async function GetDivisionDetailsByGroupID() {
        const result = await services.GetDivisionDetailsByGroupID(biometricDataList.groupID);
        setPayPoints(result)
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

    function generateDropDownMenuWithTwoValues(data) {
        let items = []
        if (data != null) {
            for (const [key, value] of Object.entries(data)) {
                items.push(<MenuItem key={key} value={key}>{value.name}</MenuItem>);
            }
        }
        return items
    }

    async function GetDetails() {
        let model = {
            groupID: parseInt(biometricDataList.groupID),
            gardenID: parseInt(biometricDataList.gardenID),
            costCenterID: parseInt(biometricDataList.costCenterID),
            empTypeID: parseInt(biometricDataList.empTypeID),
            employeeSubCategoryMappingID: selectedOptions1.map(x => x.value).join(','),
            gangID: parseInt(biometricDataList.gangID),
            payPointID: parseInt(biometricDataList.payPointID),
            registrationNumber: biometricDataList.registrationNumber
        }

        getSelectedDropdownValuesForReport(model);

        const response = await services.GetBiometricDetails(model);

        if (response.statusCode == "Success" && response.data != null) {

            response.data.forEach((record) => {
                if (record.convertedEmployeeBiometricData != null) {
                    record.empBiometricID = 1;
                } else {
                    record.empBiometricID = 2;
                }
            });

            setBiometricData(response.data);
            createDataForExcel(response.data);
        }
        else {
            alert.error(response.message);
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
        setBiometricDataList({
            ...biometricDataList,
            [e.target.name]: value
        });
    }

    async function createDataForExcel(array) {
        var res = [];

        if (array != null) {
            array.map(x => {
                var vr = {
                    'Registration Number': x.registrationNumber,
                    'Employee Type': x.employeeTypeName,
                    'Employee Category': x.employeeSubCategoryName,
                    'Employee Name': x.employeeName,
                    'Duffa': x.gangName,
                    'Employee Biometric Status': x.empBiometricID == 1 ? 'Available' : x.empBiometricID == 2 ? 'Not Available' : ''
                };
                res.push(vr);
            });

            var vr = {
                'Registration Number': 'Business Division: ' + selectedSearchValues.groupName,
                'Employee Type': 'Location: ' + selectedSearchValues.gardenName,
                'Employee Name': selectedSearchValues.costCenterName === undefined ? 'Sub-Division: All Sub-Divisions' : 'Sub-Division: ' + selectedSearchValues.costCenterName
            };
            res.push(vr);

            var vr = {
                'Registration Number': selectedSearchValues.empTypeName === undefined ? 'Employee Type: All Employee Types' : 'Employee Type: ' + selectedSearchValues.empTypeName,
                'Employee Type': 'Biometric Status: ' + selectedSearchValues.empBioStatusName,
                'Employee Name': 'Duffa: ' + selectedSearchValues.gangName === undefined ? 'Duffa: All Duffas' : 'Duffa: ' + selectedSearchValues.gangName,
            };
            res.push(vr);
        }

        return res;
    }

    async function createFile() {
        var file = await createDataForExcel(biometricData);
        var settings = {
            sheetName: 'Employee Details Report',
            fileName: 'Employee Biometric Details Report ' + selectedSearchValues.groupName + ' - ' + selectedSearchValues.gardenName,
            writeOptions: {}
        };

        let keys = Object.keys(file[0]);
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem });
        });

        let dataA = [
            {
                sheet: 'Employee Details Report',
                columns: tempcsvHeaders,
                content: file
            }
        ];

        xlsx(dataA, settings);
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: groups[searchForm.groupID],
            gardenName: gardens[searchForm.gardenID],
            costCenterName: costCenters[searchForm.costCenterID],
            empTypeName: searchForm.empTypeID == 0 ? "All Employee Types" : employeeType[searchForm.empTypeID].name,
            empBioStatusName: searchForm.empBioStatusID == 1 ? 'Available' : searchForm.empBioStatusID == 2 ? 'Not Available' : 'All Biometric Status Types',
            employeeSubCategory: searchForm.employeeSubCategoryMappingID == 0 ? "All Employee Categories" : selectedOptions1.map(x => x.label).join(','),
            gangName: gangs[searchForm.gangID],
            payPointName: PayPoints[searchForm.payPointID]
        })
    }

    function handleRequestSort(property) {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    function getSortIcon(columnId) {
        if (orderBy === columnId) {
            return order === "asc" ? "" : "";
        }
        return null;
    };

    function sortData(data) {
        const sortedData = [...data];
        sortedData.sort((a, b) => {
            if (order === "asc") {
                return a[orderBy].localeCompare(b[orderBy], undefined, { numeric: true });
            } else {
                return b[orderBy].localeCompare(a[orderBy], undefined, { numeric: true });
            }
        });
        return sortedData;
    };

    const handleImageClick = (imageURL) => {
        setSelectedImage(imageURL);
    };

    const handleCloseModal = () => {
        setSelectedImage(null);
    };

    return (
        <Page className={classes.root} title={title}>
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: biometricDataList.groupID,
                        gardenID: biometricDataList.gardenID,
                        costCenterID: biometricDataList.costCenterID,
                        empTypeID: biometricDataList.empTypeID,
                        employeeSubCategoryMappingID: biometricDataList.employeeSubCategoryMappingID,
                        empBioStatusID: biometricDataList.empBioStatusID,
                        gangID: biometricDataList.gangID,
                        registrationNumber: biometricDataList.registrationNumber,
                        payPointID: biometricDataList.payPointID
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Legal Entity is required').min("1", 'Legal Entity is required'),
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
                                                <Grid item md={3} xs={8}>
                                                    <InputLabel shrink id="groupID">
                                                        Business Division *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.groupID && errors.groupID)}
                                                        fullWidth
                                                        helperText={touched.groupID && errors.groupID}
                                                        name="groupID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={biometricDataList.groupID}
                                                        variant="outlined"
                                                        id="groupID"
                                                        size='small'
                                                        InputProps={{
                                                            readOnly: !permissionList.isGroupFilterEnabled ? true : false
                                                        }}
                                                    >
                                                        <MenuItem value="0">--All Business Division--</MenuItem>
                                                        {generateDropDownMenu(groups)}
                                                    </TextField>
                                                </Grid>

                                                <Grid item md={3} xs={8}>
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
                                                        value={biometricDataList.gardenID}
                                                        variant="outlined"
                                                        id="gardenID"
                                                        size='small'
                                                        InputProps={{
                                                            readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                        }}
                                                    >
                                                        <MenuItem value="0">--All Locations--</MenuItem>
                                                        {generateDropDownMenu(gardens)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={8}>
                                                    <InputLabel shrink id="costCenterID">
                                                        Sub-Division
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="costCenterID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={biometricDataList.costCenterID}
                                                        variant="outlined"
                                                        id="costCenterID"
                                                        size='small'
                                                    >
                                                        <MenuItem value="0">--All Sub-Division--</MenuItem>
                                                        {generateDropDownMenu(costCenters)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={8}>
                                                    <InputLabel shrink id="payPointID">
                                                        Pay Point
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="payPointID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={biometricDataList.payPointID}
                                                        variant="outlined"
                                                        id="payPointID"
                                                        size='small'
                                                    >
                                                        <MenuItem value="0">--All Pay Point--</MenuItem>
                                                        {generateDropDownMenu(PayPoints)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={8}>
                                                    <InputLabel shrink id="empTypeID">
                                                        Employee Type
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="empTypeID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={biometricDataList.empTypeID}
                                                        variant="outlined"
                                                        id="empTypeID"
                                                        size='small'
                                                    >
                                                        <MenuItem value="0">--All Employee Type--</MenuItem>
                                                        {generateDropDownMenuWithTwoValues(employeeType)}
                                                    </TextField>
                                                </Grid>

                                                <Grid item md={3} xs={8}>
                                                    <InputLabel shrink id="employeeSubCategoryMappingID">
                                                        Employee Category
                                                    </InputLabel>
                                                    <CustomMultiSelect
                                                        items={employeeSubCategoryMapping}
                                                        getOptionLabel={getOptionLabel1}
                                                        getOptionDisabled={getOptionDisabled1}
                                                        selectedValues={selectedOptions1}
                                                        placeholder="--Select Employee Category--"
                                                        selectAllLabel="Select all"
                                                        onToggleOption={handleToggleOption1}
                                                        onClearOptions={handleClearOptions1}
                                                        onSelectAll={handleSelectAll1}
                                                    />
                                                </Grid>
                                                <Grid item md={3} xs={8}>
                                                    <InputLabel shrink id="gangID">
                                                        Duffa
                                                    </InputLabel>
                                                    <TextField select fullWidth
                                                        error={Boolean(touched.gangID && errors.gangID)}
                                                        helperText={touched.gangID && errors.gangID}
                                                        name="gangID"
                                                        onBlur={handleBlur}
                                                        size='small'
                                                        onChange={(e) => {
                                                            handleChange(e)
                                                        }}
                                                        value={biometricDataList.gangID}
                                                        variant="outlined"
                                                        id="gangID"
                                                    >
                                                        <MenuItem value={'0'}>--All Duffa--</MenuItem>
                                                        {generateDropDownMenu(gangs)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={8}>
                                                    <InputLabel shrink id="empTypeID">
                                                        Employee Biometric Status
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="empBioStatusID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={biometricDataList.empBioStatusID}
                                                        variant="outlined"
                                                        id="empBioStatusID"
                                                        size='small'
                                                    >
                                                        <MenuItem value="0">--All Biometric Status--</MenuItem>
                                                        <MenuItem value="1">Available</MenuItem>
                                                        <MenuItem value="2">Not Available</MenuItem>
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={8}>
                                                    <InputLabel shrink id="registrationNumber">
                                                        Registration Number
                                                    </InputLabel>
                                                    <TextField
                                                        fullWidth
                                                        name="registrationNumber"
                                                        size='small'
                                                        onChange={(e) => {
                                                            handleChange(e)
                                                        }}
                                                        value={biometricDataList.registrationNumber}
                                                        variant="outlined"
                                                    >
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
                                            <br />
                                            <Box minWidth={1050}>
                                                {biometricData.length > 0 ?
                                                    <TableContainer component={Paper}>
                                                        <Table aria-label="simple table" size="small">
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell align="left" style={{ fontWeight: "bold" }} onClick={() => handleRequestSort("registrationNumber")}>
                                                                        <TableSortLabel
                                                                            active={orderBy === "registrationNumber"}
                                                                            direction={order}
                                                                            onClick={() => handleRequestSort("registrationNumber")}
                                                                        >
                                                                            Reg. No {getSortIcon("registrationNumber")}
                                                                        </TableSortLabel>
                                                                    </TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold" }}>Name</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold" }}>DOB</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold" }}>Category</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold" }}>Duffa</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold" }}>Status</TableCell>
                                                                    <TableCell align="center" style={{ fontWeight: "bold" }}>Image</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {sortData(biometricData).slice(page * limit, page * limit + limit).map((row, i) => (
                                                                    <TableRow key={i}>
                                                                        <TableCell component="th" scope="row" align="left"> {row.registrationNumber}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left"> {row.employeeName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="center"> {new Date(row.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left"> {row.employeeSubCategoryName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left"> {row.gangName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left"> {row.isActive}</TableCell>
                                                                        <TableCell component="th" scope="row" align="center">
                                                                            {row.convertedEmployeeBiometricData && (
                                                                                <img
                                                                                    src={row.convertedEmployeeBiometricData}
                                                                                    width="75"
                                                                                    height="100"
                                                                                    alt="Biometric Data"
                                                                                    onClick={() => handleImageClick(row.convertedEmployeeBiometricData)}
                                                                                />
                                                                            )}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                        <TablePagination
                                                            component="div"
                                                            count={biometricData.length}
                                                            onChangePage={handlePageChange}
                                                            onChangeRowsPerPage={handleLimitChange}
                                                            page={page}
                                                            rowsPerPage={limit}
                                                            rowsPerPageOptions={[5, 10, 25]}
                                                        />
                                                    </TableContainer> : null}
                                            </Box>
                                        </CardContent>
                                        <Modal open={selectedImage !== null} onClose={handleCloseModal}>
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                                                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }} onClick={handleCloseModal}></div>
                                                    {selectedImage && <img src={selectedImage} alt="Larger Biometric Data" style={{ maxWidth: '90%', maxHeight: '90%', zIndex: 2 }} />}
                                                </div>
                                            </div>
                                        </Modal>
                                        {biometricData.length > 0 ?
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                <Button
                                                    color="primary"
                                                    id="btnRecord"
                                                    variant="contained"
                                                    style={{ marginRight: '1rem' }}
                                                    className={classes.colorRecord}
                                                    onClick={createFile}
                                                    size="small"
                                                >
                                                    EXCEL
                                                </Button>
                                                <div>&nbsp;</div>
                                                <ReactToPrint
                                                    documentTitle={"Biometric Details"}
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
                                                        searchData={selectedSearchValues} biometricData={biometricData} />
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