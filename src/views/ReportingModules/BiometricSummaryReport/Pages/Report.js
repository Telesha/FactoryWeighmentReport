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

const screenCode = 'BIOMETRICSUMMARYREPORT';

export default function BiometricSummaryReport(props) {
    const [title, setTitle] = useState("Biometric Summary")
    const classes = useStyles();
    const [GroupList, setGroupList] = useState([]);
    const [estates, setEstates] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [payPoints, setPayPoints] = useState([]);
    const [employeeSubCategoryMapping, setEmployeeSubCategoryMapping] = useState([]);
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [biometricSummaryData, setBiometricSummaryData] = useState([]);
    const [initialState, setInitialState] = useState(false);
    const [biometricSummaryReport, setBiometricSummaryReport] = useState({
        groupID: '0',
        estateID: '0',
        divisionID: '0',
        payPointID: '0',
        employeeSubCategoryMappingID: '0'
    })
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: '',
        estateName: '',
        divisionName: '',
        payPointName: '',
        employeeSubCategoryName: ''
    })
    const [totalValues, setTotalValues] = useState({
        totalActiveEmployeeCount: 0,
        totalActiveEmployeeBiometricCount: 0
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
        if (!initialState) {
            trackPromise(getPermission());
        }
    }, []);

    useEffect(() => {
        getEstateDetailsByGroupID();
        GetDivisionDetailsByGroupID();
    }, [biometricSummaryReport.groupID]);

    useEffect(() => {
        getDivisionDetailsByEstateID();
    }, [biometricSummaryReport.estateID]);

    useEffect(() => {
        if (initialState) {
            setBiometricSummaryReport((prevState) => ({
                ...prevState,
                estateID: 0,
                divisionID: 0,
                payPointID: 0
            }));
        }
    }, [biometricSummaryReport.groupID, initialState]);

    useEffect(() => {
        if (initialState) {
            setBiometricSummaryReport((prevState) => ({
                ...prevState,
                divisionID: 0
            }));
        }
    }, [biometricSummaryReport.estateID, initialState]);

    useEffect(() => {
        setBiometricSummaryData([]);
    }, [biometricSummaryReport]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWBIOMETRICSUMMARYREPORT');

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

        setBiometricSummaryReport({
            ...biometricSummaryReport,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            estateID: parseInt(tokenService.getFactoryIDFromToken())
        })
        setInitialState(true);
    }
    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroupList(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(biometricSummaryReport.groupID);
        setEstates(response);
    }

    async function getDivisionDetailsByEstateID() {
        var response = await services.getDivisionDetailsByEstateID(biometricSummaryReport.estateID);
        setDivisions(response);
    }

    async function GetDivisionDetailsByGroupID() {
        const result = await services.GetDivisionDetailsByGroupID(biometricSummaryReport.groupID);
        setPayPoints(result)
    }

    async function GetAllEmployeeSubCategoryMapping() {
        const result = await services.GetAllEmployeeSubCategoryMapping();
        setEmployeeSubCategoryMapping(result)
    }

    async function GetDetails() {
        let model = {
            groupID: parseInt(biometricSummaryReport.groupID),
            estateID: parseInt(biometricSummaryReport.estateID),
            divisionID: parseInt(biometricSummaryReport.divisionID),
            payPointID: parseInt(biometricSummaryReport.payPointID),
            employeeSubCategoryMappingID: parseInt(biometricSummaryReport.employeeSubCategoryMappingID)
        }
        getSelectedDropdownValuesForReport(model);
        const response = await services.GetEmployeeBiometricSummaryDetails(model);
        if (response.statusCode === "Success" && response.data !== null) {
            let totalActiveEmployeeCount = 0;
            let totalActiveEmployeeBiometricCount = 0;
            response.data.forEach(x => {
                x.details.forEach(y => {
                    y.detailsx.forEach(z => {
                        totalActiveEmployeeCount += parseFloat(z.activeEmployeeCount)
                        totalActiveEmployeeBiometricCount += parseFloat(z.activeEmployeeBiometricCount)
                    })
                })
            });
            setBiometricSummaryData(response.data);
            setTotalValues({
                ...totalValues,
                totalActiveEmployeeCount: totalActiveEmployeeCount,
                totalActiveEmployeeBiometricCount: totalActiveEmployeeBiometricCount
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
        var file = await createDataForExcel(biometricSummaryData);
        var settings = {
            sheetName: 'Biometric Report',
            fileName:
                'Biometric Report',
            writeOptions: {}
        };
        let keys = Object.keys(file[0]);
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem });
        });
        let dataA = [
            {
                sheet: 'Biometric Report',
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
        setBiometricSummaryReport({
            ...biometricSummaryReport,
            [e.target.name]: value
        });
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: GroupList[searchForm.groupID],
            estateName: estates[searchForm.estateID],
            divisionName: divisions[searchForm.divisionID],
            payPointName: payPoints[searchForm.payPointID],
            employeeSubCategoryName: employeeSubCategoryMapping[searchForm.employeeSubCategoryMappingID]
        })
    }

    return (
        <Page className={classes.root} title={title}>
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: biometricSummaryReport.groupID,
                        estateID: biometricSummaryReport.estateID,
                        divisionID: biometricSummaryReport.divisionID,
                        payPointID: biometricSummaryReport.payPointID,
                        employeeSubCategoryMappingID: biometricSummaryReport.employeeSubCategoryMappingID
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Business Division is required').min("1", 'Business Division is required'),
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
                                                        value={biometricSummaryReport.groupID}
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
                                                    <InputLabel shrink id="estateID">
                                                        Location
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.estateID && errors.estateID)}
                                                        fullWidth
                                                        helperText={touched.estateID && errors.estateID}
                                                        name="estateID"
                                                        size='small'
                                                        onChange={(e) => {
                                                            handleChange(e)
                                                        }}
                                                        value={biometricSummaryReport.estateID}
                                                        variant="outlined"
                                                        id="estateID"
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
                                                        value={biometricSummaryReport.divisionID}
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
                                                        value={biometricSummaryReport.payPointID}
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
                                                        Employee Sub Category
                                                    </InputLabel>
                                                    <TextField select fullWidth
                                                        size='small'
                                                        id="employeeSubCategoryMappingID"
                                                        onBlur={handleBlur}
                                                        name="employeeSubCategoryMappingID"
                                                        value={biometricSummaryReport.employeeSubCategoryMappingID}
                                                        type="text"
                                                        variant="outlined"
                                                        onChange={(e) => handleChange(e)}
                                                    >
                                                        <MenuItem value="0">--All Employee Sub Categories--</MenuItem>
                                                        {generateDropDownMenu(employeeSubCategoryMapping)}
                                                    </TextField>
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
                                                {biometricSummaryData.length > 0 ? (
                                                    <TableContainer component={Paper}>
                                                        <Table className={classes.table} aria-label="simple table" size='small'>
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}> Employee Category </TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}> Active </TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}> Biometric </TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}> Remaining </TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {biometricSummaryData.map((group, i) => {
                                                                    return (
                                                                        <React.Fragment key={i}>
                                                                            <TableRow>
                                                                                <TableCell colSpan={4} component="th" scope="row" align="left" style={{ border: "1px solid black", fontWeight: 'bolder', color: 'red' }}>Location : {group.factoryName} <div>Labour On Book : {group.labourOnBook}</div></TableCell>
                                                                            </TableRow>
                                                                            {group.details.map((grp, j) => {
                                                                                return (
                                                                                    <React.Fragment key={`${i}-${j}`}>
                                                                                        {grp.detailsx.map((detail, k) => {
                                                                                            return (
                                                                                                <TableRow key={`${i}-${j}-${k}`}>
                                                                                                    {k === 0 && (
                                                                                                        <TableCell rowSpan={grp.detailsx.length} align="left" style={{ border: "1px solid black", fontWeight: 'bolder' }}>{grp.employeeSubCategoryName}</TableCell>
                                                                                                    )}
                                                                                                    <TableCell align={'right'} style={{ border: "1px solid black" }}>{detail.activeEmployeeCount}</TableCell>
                                                                                                    <TableCell align={'right'} style={{ border: "1px solid black" }}>{detail.activeEmployeeBiometricCount}</TableCell>
                                                                                                    <TableCell align={'right'} style={{ border: "1px solid black" }}>{((detail.activeEmployeeCount) - (detail.activeEmployeeBiometricCount))}</TableCell>
                                                                                                </TableRow>
                                                                                            );
                                                                                        })}
                                                                                    </React.Fragment>
                                                                                );
                                                                            })}
                                                                        </React.Fragment>
                                                                    );
                                                                })}
                                                                <TableRow>
                                                                    <TableCell align={'left'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>Total</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalActiveEmployeeCount}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalActiveEmployeeBiometricCount}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{((totalValues.totalActiveEmployeeCount) - (totalValues.totalActiveEmployeeBiometricCount))}</TableCell>
                                                                </TableRow>
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                ) : null}
                                            </Box>
                                        </CardContent>
                                        {biometricSummaryData.length > 0 ?
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                <div>&nbsp;</div>
                                                <ReactToPrint
                                                    documentTitle={"Biometric Summary Report"}
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
                                                        searchData={selectedSearchValues} biometricSummaryData={biometricSummaryData} totalValues={totalValues} />
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