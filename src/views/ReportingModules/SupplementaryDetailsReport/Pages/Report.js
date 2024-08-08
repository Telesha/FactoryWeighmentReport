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
    Chip
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
import moment from 'moment';
import TablePagination from '@material-ui/core/TablePagination';
import LineWeightIcon from '@material-ui/icons/LineWeight';

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

const screenCode = 'SUPPLEMENTARYDETAILS';

export default function SupplementaryDetailsReport(props) {
    const [title, setTitle] = useState("Family Details")
    const classes = useStyles();
    const [GroupList, setGroupList] = useState([]);
    const [estates, setEstates] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [employeeSubCategoryMapping, setEmployeeSubCategoryMapping] = useState([]);
    const [kethLandQty, setKethLandQty] = useState();
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [supplementaryDetailsData, setSupplementaryDetailsData] = useState([]);
    const [initialState, setInitialState] = useState(false);
    const [supplementaryDetailsReport, setSupplementaryDetailsReport] = useState({
        groupID: '0',
        operationEntityID: '0',
        employeeDivisionID: '0',
        employeeSubCategoryMappingID: '0'
    })
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: '',
        estateName: 0,
        divisionName: 0,
        employeeSubCategoryName: '',
    })
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);

    const componentRef = useRef();
    const navigate = useNavigate();
    const alert = useAlert();

    const handleLimitChange = (event) => {
        setLimit(event.target.value);
    };
    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission(), GetAllEmployeeSubCategoryMapping());
    }, []);

    useEffect(() => {
        if (!initialState) {
            trackPromise(getPermission());
        }
    }, []);

    useEffect(() => {
        getEstateDetailsByGroupID();
    }, [supplementaryDetailsReport.groupID]);

    useEffect(() => {
        getDivisionDetailsByEstateID();
    }, [supplementaryDetailsReport.operationEntityID]);

    useEffect(() => {
        GetKethLandQtyByDivision();
    }, [supplementaryDetailsReport.operationEntityID, supplementaryDetailsReport.employeeDivisionID]);

    useEffect(() => {
        setSupplementaryDetailsData([]);
    }, [supplementaryDetailsReport]);

    useEffect(() => {
        if (initialState) {
            setSupplementaryDetailsReport((prevState) => ({
                ...prevState,
                operationEntityID: 0,
                employeeDivisionID: 0,
            }));
        }
    }, [supplementaryDetailsReport.groupID, initialState]);

    useEffect(() => {
        if (initialState) {
            setSupplementaryDetailsReport((prevState) => ({
                ...prevState,
                employeeDivisionID: 0
            }));
        }
    }, [supplementaryDetailsReport.operationEntityID, initialState]);

    useEffect(() => {
        setPage(0);
    }, [supplementaryDetailsReport]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWSUPPLEMENTARYDETAILSREPORT');

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

        setSupplementaryDetailsReport({
            ...supplementaryDetailsReport,
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
        var response = await services.getEstateDetailsByGroupID(supplementaryDetailsReport.groupID);
        setEstates(response);
    }

    async function getDivisionDetailsByEstateID() {
        var response = await services.getDivisionDetailsByEstateID(supplementaryDetailsReport.operationEntityID);
        setDivisions(response);
    }

    async function GetKethLandQtyByDivision() {
        const response = await services.GetKethLandQtyByDivision(supplementaryDetailsReport.operationEntityID, supplementaryDetailsReport.employeeDivisionID);
        let khethLandDeductionQuantity = 0;
        response.forEach(x => {
            khethLandDeductionQuantity += x.khethLandDeductionQuantity;
        });
        setKethLandQty(khethLandDeductionQuantity);
    }

    async function GetAllEmployeeSubCategoryMapping() {
        const result = await services.GetAllEmployeeSubCategoryMapping();
        setEmployeeSubCategoryMapping(result)
    }

    async function GetDetails() {
        let model = {
            groupID: parseInt(supplementaryDetailsReport.groupID),
            operationEntityID: parseInt(supplementaryDetailsReport.operationEntityID),
            employeeDivisionID: parseInt(supplementaryDetailsReport.employeeDivisionID),
            employeeSubCategoryMappingID: parseInt(supplementaryDetailsReport.employeeSubCategoryMappingID)
        }


        getSelectedDropdownValuesForReport(model);
        const response = await services.GetFieldDetails(model);
        if (response.statusCode === "Success" && response.data !== null) {
            setSupplementaryDetailsData(response.data);
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
        var file = await createDataForExcel(supplementaryDetailsData);
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
        setSupplementaryDetailsReport({
            ...supplementaryDetailsReport,
            [e.target.name]: value
        });
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: GroupList[searchForm.groupID],
            estateName: estates[searchForm.operationEntityID],
            divisionName: divisions[searchForm.employeeDivisionID],
            employeeSubCategoryName: employeeSubCategoryMapping[searchForm.employeeSubCategoryMappingID]

        })
    }

    const getAge = birthDate => Math.floor((new Date() - new Date(birthDate).getTime()) / 3.15576e+10)
    return (
        <Page className={classes.root} title={title}>
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: supplementaryDetailsReport.groupID,
                        operationEntityID: supplementaryDetailsReport.operationEntityID,
                        employeeDivisionID: supplementaryDetailsReport.employeeDivisionID,
                        employeeSubCategoryMappingID: supplementaryDetailsReport.employeeSubCategoryMappingID

                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Business Division is required').min("1", 'Business Division is required'),
                            operationEntityID: Yup.number().required('Location is required').min("1", 'Location is required')
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
                                                        value={supplementaryDetailsReport.groupID}
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
                                                        Location *
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
                                                        value={supplementaryDetailsReport.operationEntityID}
                                                        variant="outlined"
                                                        id="operationEntityID"
                                                        InputProps={{
                                                            readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                        }}
                                                    >
                                                        <MenuItem value={0}>--Select Location--</MenuItem>
                                                        {generateDropDownMenu(estates)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="employeeDivisionID">
                                                        Sub Division
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="employeeDivisionID"
                                                        size='small'
                                                        onChange={(e) => {
                                                            handleChange(e)
                                                        }}
                                                        value={supplementaryDetailsReport.employeeDivisionID}
                                                        variant="outlined"
                                                        id="employeeDivisionID"
                                                    >
                                                        <MenuItem value={0}>--All Sub Divisions--</MenuItem>
                                                        {generateDropDownMenu(divisions)}
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
                                                        value={supplementaryDetailsReport.employeeSubCategoryMappingID}
                                                        type="text"
                                                        variant="outlined"
                                                        onChange={(e) => handleChange(e)}
                                                    >
                                                        <MenuItem value="0">--All Employee Categories--</MenuItem>
                                                        {generateDropDownMenu(employeeSubCategoryMapping)}
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
                                                {supplementaryDetailsData.length > 0 ?
                                                    <Chip
                                                        icon={<LineWeightIcon />}
                                                        label={"KethLand Quantity: " + kethLandQty}
                                                        color="secondary"
                                                        variant="outlined"
                                                    />
                                                    : null}
                                                <br></br>
                                                <br></br>
                                                {supplementaryDetailsData.length > 0 ?
                                                    <TableContainer component={Paper}>
                                                        <Table className={classes.table} aria-label="simple table" size='small'>
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Supplimentary Name</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Gender</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Relationship</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Date Of Birth</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Age</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>NID / BIR</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Working Type</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Employee No.</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Ration</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {supplementaryDetailsData.map((data, i) => {
                                                                    return (
                                                                        <React.Fragment key={i}>
                                                                            <TableRow>
                                                                                <TableCell colSpan={2} component="th" scope="row" align="left" style={{ fontWeight: 'bolder', color: 'blue', borderLeft: '1px solid black', borderBottom: '1px dashed black' }}>Registration Number: {data.registrationNumber}</TableCell>
                                                                                <TableCell colSpan={2} component="th" scope="row" align="left" style={{ fontWeight: 'bolder', color: 'blue', borderBottom: '1px dashed black' }}> Employee Name: {data.fullName} </TableCell>
                                                                                <TableCell colSpan={5} component="th" scope="row" align="left" style={{ fontWeight: 'bolder', color: 'blue', borderRight: "1px solid black", borderBottom: '1px dashed black' }}> Kethland : {data.area == 0 ? "" : data.area} {data.areaType == 1 ? "Decimal" : data.areaType == 2 ? "Khair" : "-"} </TableCell>
                                                                            </TableRow>
                                                                            {data.detailsx.map((detail, k) => {
                                                                                return (
                                                                                    <TableRow key={`${i}-${k}`}>

                                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black", borderLeft: "1px solid black" }}> {detail.supplimentaryName}</TableCell>
                                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black", borderLeft: "1px dashed black" }}> {detail.gender == 1 ? 'Male' : detail.gender == 2 ? 'Female' : 'Other'}</TableCell>
                                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black", borderLeft: "1px dashed black" }}> {detail.relationship}</TableCell>
                                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black", borderLeft: "1px dashed black" }}> {moment(detail.dateOfBirth).format('YYYY-MM-DD')}</TableCell>
                                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black", borderLeft: "1px dashed black" }}> {getAge(moment(detail.dateOfBirth).format('YYYY-MM-DD'))}</TableCell>
                                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black", borderLeft: "1px dashed black" }}> {detail.nic == null ? '-' : detail.nic}</TableCell>
                                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black", borderLeft: "1px dashed black" }}> {detail.workingType == 1 ? 'Employee' : detail.workingType == 2 ? 'Dependant' : detail.workingType == 3 ? 'Family Member' : 'Other'}</TableCell>
                                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black", borderLeft: "1px dashed black" }}> {detail.employeeNumber == null ? '-' : detail.employeeNumber}</TableCell>
                                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black", borderLeft: "1px dashed black", borderRight: "1px solid black" }}> {detail.isRation == 1 ? 'Yes' : 'No'}</TableCell>
                                                                                    </TableRow>
                                                                                );
                                                                            })}

                                                                        </React.Fragment>
                                                                    );
                                                                })}
                                                            </TableBody>
                                                        </Table>
                                                        <TablePagination
                                                            component="div"
                                                            count={supplementaryDetailsData.length}
                                                            onChangePage={handlePageChange}
                                                            onChangeRowsPerPage={handleLimitChange}
                                                            page={page}
                                                            rowsPerPage={limit}
                                                            rowsPerPageOptions={[5, 10, 25]}
                                                        />
                                                    </TableContainer> : null}
                                            </Box>
                                        </CardContent>
                                        {supplementaryDetailsData.length > 0 ?
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                <div>&nbsp;</div>
                                                <ReactToPrint
                                                    documentTitle={"Family Details"}
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
                                                        searchData={selectedSearchValues} supplementaryDetailsData={supplementaryDetailsData} kethLandQty={kethLandQty} />
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