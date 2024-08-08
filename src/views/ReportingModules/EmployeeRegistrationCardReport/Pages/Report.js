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
    TableCell,
    TableRow,
    TableContainer,
    TableBody,
    Table,
    TableHead,
    Checkbox
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik } from 'formik';
import * as Yup from 'yup';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
import { useAlert } from 'react-alert';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ReactToPrint from 'react-to-print';
import CreatePDF from './CreatePDF';

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
    },
    table: {
        minWidth: 550,
    },
}));

const screenCode = 'EMPLOYEEREGISTRATIONCARDREPORT';

export default function EmployeeRegistrationCardReport(props) {
    const navigate = useNavigate();
    const componentRef = useRef();
    const alert = useAlert();
    const title = 'Employee Registration Card';
    const classes = useStyles();
    const [employeeDetail, setEmployeeDetail] = useState({
        groupID: 0,
        gardenID: 0,
        costCenterID: 0,
        employeeTypeID: 0,
        employeeSubCategoryMappingID: 0,
        employeeCategoryID: 0,
        designationID: 0,
        gangID: 0,
        payPointID: '0',
        registrationNumber: ''
    });
    const [GroupList, setGroupList] = useState([]);
    const [gardens, setGardens] = useState([]);
    const [costCenters, setCostCenters] = useState();
    const [employeeType, setEmployeeType] = useState();
    const [designations, setDesignations] = useState([]);
    const [PayPoints, setPayPoints] = useState();
    const [employeeSubCategoryMapping, setEmployeeSubCategoryMapping] = useState([]);
    const [gangs, setGangs] = useState([]);
    const [employeeCategory, setEmployeeCategory] = useState();
    const [employeeData, setEmployeeData] = useState([]);
    const [initialState, setInitialState] = useState(false);
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        gardenName: '0',
        groupName: '0',
        costCenterName: "0",
        employeeTypeName: "0",
        employeeCategoryName: "0",
        employeeSubCategory: "0",
        designationName: "0",
        payPointID: '0',
        gangName: "0"
    });
    const [selectedRows, setSelectedRows] = useState([]);
    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        if (!initialState) {
            trackPromise(getPermission());
        }
    }, []);

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID(),
            GetDivisionDetailsByGroupID());
    }, [employeeDetail.groupID]);

    useEffect(() => {
        setEmployeeDetail((prevState) => ({
            ...prevState,
            costCenterID: "0"
        }));
    }, [employeeDetail.groupID]);

    useEffect(() => {
        trackPromise(
            getCostCenterDetailsByGardenID()
        )
    }, [employeeDetail.gardenID]);

    useEffect(() => {
        setEmployeeData([])
    }, [employeeDetail]);

    useEffect(() => {
        if (initialState) {
            setEmployeeDetail((prevState) => ({
                ...prevState,
                gardenID: 0,
                costCenterID: 0,
                payPointID: 0
            }));
        }
    }, [employeeDetail.groupID, initialState]);

    useEffect(() => {
        if (initialState) {
            setEmployeeDetail((prevState) => ({
                ...prevState,
                costCenterID: 0
            }));
        }
    }, [employeeDetail.gardenID, initialState]);

    useEffect(() => {
        if (employeeDetail.costCenterID != 0) {
            getGangDetailsByDivisionID();
        }
    }, [employeeDetail.costCenterID]);

    useEffect(() => {
        GetAllEmployeeSubCategoryMapping();
    }, []);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(
            p => p.permissionCode == 'VIEWEMPLOYEEREGISTRATIONCARDREPORT'
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

        setEmployeeDetail({
            ...employeeDetail,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            gardenID: parseInt(tokenService.getFactoryIDFromToken())
        });
        getEmployeeTypesForDropdown();
        getEmployeeCategoriesForDropdown();
        getDesignationsForDropDown();
        setInitialState(true);
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value;
        setEmployeeDetail({
            ...employeeDetail,
            [e.target.name]: value
        });
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroupList(groups);
    }

    async function getEstateDetailsByGroupID() {
        const factory = await services.getEstateDetailsByGroupID(employeeDetail.groupID);
        setGardens(factory);
    };

    async function getCostCenterDetailsByGardenID() {
        var response = await services.getDivisionDetailsByEstateID(employeeDetail.gardenID);
        const elementCount = response.reduce((count) => count + 1, 0);
        var generated = generateDropDownMenu(response)
        if (elementCount === 1) {
            setEmployeeDetail((prevState) => ({
                ...prevState,
                costCenterID: generated[0].props.value,
            }));
        }
        setCostCenters(response);
    };

    async function GetDivisionDetailsByGroupID() {
        const result = await services.GetDivisionDetailsByGroupID(employeeDetail.groupID);
        setPayPoints(result)
    }

    async function getEmployeeTypesForDropdown() {
        const types = await services.getEmployeeTypesForDropdown();
        setEmployeeType(types);
    }

    async function getEmployeeCategoriesForDropdown() {
        const result = await services.getEmployeeCategoriesForDropdown();
        setEmployeeCategory(result)
    }

    async function getDesignationsForDropDown() {
        const designations = await services.getDesignationsByEmployeeCategoryID();
        setDesignations(designations);
    }

    async function GetAllEmployeeSubCategoryMapping() {
        const result = await services.GetAllEmployeeSubCategoryMapping();
        setEmployeeSubCategoryMapping(result)
    }

    async function getGangDetailsByDivisionID() {
        var response = await services.getGangDetailsByDivisionID(employeeDetail.costCenterID);
        setGangs(response);
    };

    async function GetDetails() {
        setSelectedRows([])
        let model = {
            groupID: parseInt(employeeDetail.groupID),
            gardenID: parseInt(employeeDetail.gardenID),
            costCenterID: parseInt(employeeDetail.costCenterID),
            employeeTypeID: parseInt(employeeDetail.employeeTypeID),
            employeeCategoryID: parseInt(employeeDetail.employeeCategoryID),
            employeeSubCategoryMappingID: parseInt(employeeDetail.employeeSubCategoryMappingID),
            gangID: parseInt(employeeDetail.gangID),
            payPointID: parseInt(employeeDetail.payPointID),
            registrationNumber: employeeDetail.registrationNumber
        };
        getSelectedDropdownValuesForReport(model);
        const response = await services.GetEmployeeRegCardDetails(model);
        if (response.statusCode == 'Success' && response.data != null) {
            setEmployeeData(response.data);
        } else {
            alert.error('NO RECORDS TO DISPLAY');
        }
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
            costCenterName: costCenters[searchForm.costCenterID],
            employeeTypeName: employeeType[searchForm.employeeTypeID],
            employeeCategoryName: employeeCategory[searchForm.employeeCategoryID],
            employeeSubCategory: employeeSubCategoryMapping[searchForm.employeeSubCategoryMappingID],
            payPointID: PayPoints[searchForm.payPointID],
            gangName: gangs[searchForm.gangID]
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

    const handleRowCheckboxClick = (event, index) => {
        const selectedRowData = employeeData[index];
        if (event.target.checked) {
            setSelectedRows([...selectedRows, { index, data: selectedRowData }]);
        } else {
            setSelectedRows(selectedRows.filter((row) => row.index !== index));
        }
    };
    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            setSelectedRows(Array.from({ length: employeeData.length }, (_, index) => ({
                index,
                data: employeeData[index]
            })));
        } else {
            setSelectedRows([]);
        }
    };

    return (
        <Fragment>
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: employeeDetail.groupID,
                            gardenID: employeeDetail.gardenID,
                            employeeTypeID: employeeDetail.employeeTypeID,
                            employeeSubCategoryMappingID: employeeDetail.employeeSubCategoryMappingID,
                            registrationNumber: employeeDetail.registrationNumber,
                            payPointID: employeeDetail.payPointID,
                            gangID: employeeDetail.gangID
                        }}
                        validationSchema={Yup.object().shape({
                            groupID: Yup.number()
                                .required('Business Division is required')
                                .min('1', 'Business Division is required'),
                        })}
                        onSubmit={() => trackPromise(GetDetails())}
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
                                                    <Grid item md={3} xs={12}>
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
                                                            value={employeeDetail.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            size="small"
                                                            InputProps={{
                                                                readOnly: !permissionList.isGroupFilterEnabled ? true : false
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Business Division--</MenuItem>
                                                            {generateDropDownMenu(GroupList)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="gardenID">
                                                            Location
                                                        </InputLabel>
                                                        <TextField
                                                            select
                                                            error={Boolean(touched.gardenID && errors.gardenID)}
                                                            fullWidth
                                                            helperText={touched.gardenID && errors.gardenID}
                                                            name="gardenID"
                                                            onBlur={handleBlur}
                                                            onChange={e => handleChange(e)}
                                                            value={employeeDetail.gardenID}
                                                            variant="outlined"
                                                            id="gardenID"
                                                            size="small"
                                                            InputProps={{
                                                                readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                            }}
                                                        >
                                                            <MenuItem value="0">--All Location --</MenuItem>
                                                            {generateDropDownMenu(gardens)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="costCenterID">
                                                            Sub-Division
                                                        </InputLabel>
                                                        <TextField
                                                            select
                                                            fullWidth
                                                            name="costCenterID"
                                                            onChange={e => handleChange(e)}
                                                            value={employeeDetail.costCenterID}
                                                            variant="outlined"
                                                            id="costCenterID"
                                                            size="small"
                                                        >
                                                            <MenuItem value="0">--All Sub-Division--</MenuItem>
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
                                                            value={employeeDetail.payPointID}
                                                            variant="outlined"
                                                            id="payPointID"
                                                            size='small'
                                                        >
                                                            <MenuItem value="0">--All Pay Point--</MenuItem>
                                                            {generateDropDownMenu(PayPoints)}
                                                        </TextField>
                                                    </Grid>
                                                </Grid>
                                                <Grid container spacing={3}>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="employeeTypeID">
                                                            Employee Type
                                                        </InputLabel>
                                                        <TextField select fullWidth
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            id="employeeTypeID"
                                                            name="employeeTypeID"
                                                            value={employeeDetail.employeeTypeID}
                                                            type="text"
                                                            variant="outlined"
                                                            onChange={e => handleChange(e)}
                                                        >
                                                            <MenuItem value="0">--All Employee Type--</MenuItem>
                                                            {generateDropDownMenuWithTwoValues(employeeType)}
                                                        </TextField>
                                                    </Grid>


                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="employeeCategoryID">
                                                            Employee Category
                                                        </InputLabel>
                                                        <TextField select fullWidth
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            id="employeeCategoryID"
                                                            name="employeeCategoryID"
                                                            value={employeeDetail.employeeCategoryID}
                                                            type="text"
                                                            variant="outlined"
                                                            onChange={(e) => handleChange(e)}
                                                        >
                                                            <MenuItem value="0">--All Employee Category--</MenuItem>
                                                            {generateDropDownMenuWithTwoValues(employeeCategory)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="employeeSubCategoryMappingID">
                                                            Employee Sub Category
                                                        </InputLabel>
                                                        <TextField select fullWidth
                                                            size='small'
                                                            id="employeeSubCategoryMappingID"
                                                            onBlur={handleBlur}
                                                            name="employeeSubCategoryMappingID"
                                                            value={employeeDetail.employeeSubCategoryMappingID}
                                                            type="text"
                                                            variant="outlined"
                                                            onChange={(e) => handleChange(e)}
                                                        >
                                                            <MenuItem value="0">--All Employee Sub Category--</MenuItem>
                                                            {generateDropDownMenu(employeeSubCategoryMapping)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
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
                                                            value={employeeDetail.gangID}
                                                            variant="outlined"
                                                            id="gangID"
                                                        >
                                                            <MenuItem value={'0'}>--All Duffa--</MenuItem>
                                                            {generateDropDownMenu(gangs)}
                                                        </TextField>
                                                    </Grid>
                                                </Grid>
                                                <Grid container spacing={3}>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="registrationNumber">
                                                            Registration Number
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            size='small'
                                                            name="registrationNumber"
                                                            onChange={(e) => handleChange(e)}
                                                            value={employeeDetail.registrationNumber}
                                                            variant="outlined"
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
                                            </CardContent>
                                            {employeeData.length > 0 ?
                                                <Box minWidth={1050}>
                                                    <TableContainer style={{ maxHeight: '550px', overflowY: 'auto' }}>
                                                        <Table className={classes.table} aria-label="sticky table" stickyHeader size="small" Table>
                                                            <TableHead style={{ position: "sticky", top: 0, zIndex: 1000, background: "white" }}>
                                                                <TableRow>
                                                                    <TableCell className={classes.sticky} align="center"><b>Reg. No.</b></TableCell>
                                                                    <TableCell className={classes.sticky} align="center"><b>Name</b></TableCell>
                                                                    <TableCell className={classes.sticky} align="center"><b>Location</b></TableCell>
                                                                    <TableCell className={classes.sticky} align="center">
                                                                        <b>Select All</b>
                                                                        <Checkbox
                                                                            indeterminate={
                                                                                selectedRows.length > 0 && selectedRows.length < employeeData.length
                                                                            }
                                                                            checked={selectedRows.length === employeeData.length}
                                                                            onChange={handleSelectAllClick}
                                                                        />
                                                                    </TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {employeeData.map((row, index) => {
                                                                    return <TableRow key={index}>
                                                                        <TableCell align="center" >{row.registrationNumber}
                                                                        </TableCell>
                                                                        <TableCell align="center" >{row.employeeName}
                                                                        </TableCell>
                                                                        <TableCell align="center" >  {row.factoryName}
                                                                        </TableCell>
                                                                        <TableCell align="center" padding='100px'>
                                                                            <Checkbox
                                                                                checked={selectedRows.some((selectedRow) => selectedRow.index === index)}
                                                                                onChange={(event) => handleRowCheckboxClick(event, index)}
                                                                            />
                                                                        </TableCell>
                                                                    </TableRow>
                                                                })}
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                </Box> : null}
                                            {employeeData.length > 0 && selectedRows.length > 0 ?
                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    <ReactToPrint
                                                        documentTitle={'Employee Registration Card'}
                                                        trigger={() => (
                                                            <Button
                                                                startIcon={<PictureAsPdfIcon />}
                                                                color="primary"
                                                                id="btnRecord"
                                                                type="submit"
                                                                variant="contained"
                                                                style={{ marginRight: '1rem' }}
                                                                className={classes.colorCancel}
                                                                size='small'
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
                                                            employeeData={selectedRows}
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
        </Fragment>
    );
}