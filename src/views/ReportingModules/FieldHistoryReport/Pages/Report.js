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
import moment from 'moment';
import TablePagination from '@material-ui/core/TablePagination';

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

const screenCode = 'FIELDHISTORY';

export default function FieldHistoryDetailsReport(props) {
    const [title, setTitle] = useState("Field History Details")
    const classes = useStyles();
    const [GroupList, setGroupList] = useState([]);
    const [estates, setEstates] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [products, setProducts] = useState([]);
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [fieldDetailsData, setFieldDetailsData] = useState([]);
    const [fieldDetailsReport, setFieldDetailsReport] = useState({
        groupID: '0',
        estateID: '0',
        divisionID: '0',
        productID: '0'
    })
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: '',
        estateName: 0,
        divisionName: 0,
        productName: 0
    })
    const [totalValues, setTotalValues] = useState({
        totalFieldArea: 0
    });
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
        trackPromise(getGroupsForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        getEstateDetailsByGroupID();
    }, [fieldDetailsReport.groupID]);

    useEffect(() => {
        getDivisionDetailsByEstateID();
    }, [fieldDetailsReport.estateID]);

    useEffect(() => {
        GetMappedProductsByIDs();
    }, [fieldDetailsReport.estateID, fieldDetailsReport.divisionID]);

    useEffect(() => {
        setPage(0);
        setFieldDetailsData([]);
    }, [fieldDetailsReport]);

    useEffect(() => {
        if (fieldDetailsData.length != 0) {
            calculateTotalQty()
        }
    }, [fieldDetailsData]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWFIELDHISTORYREPORT');

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

        setFieldDetailsReport({
            ...fieldDetailsReport,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            estateID: parseInt(tokenService.getFactoryIDFromToken())
        })

    }
    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroupList(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(fieldDetailsReport.groupID);
        setEstates(response);
    }

    async function getDivisionDetailsByEstateID() {
        var response = await services.getDivisionDetailsByEstateID(fieldDetailsReport.estateID);
        setDivisions(response);
    }

    async function GetMappedProductsByIDs() {
        setProducts([])
        var response = 0;
        if (fieldDetailsReport.divisionID == '0') {
            response = await services.GetMappedProductsByFactoryID(fieldDetailsReport.estateID);
        } else {
            response = await services.GetMappedProductsByDivisionID(fieldDetailsReport.divisionID);
        }
        setProducts(response);
    };

    async function GetDetails() {
        let model = {
            groupID: parseInt(fieldDetailsReport.groupID),
            estateID: parseInt(fieldDetailsReport.estateID),
            divisionID: parseInt(fieldDetailsReport.divisionID),
            productID: parseInt(fieldDetailsReport.productID)
        }
        getSelectedDropdownValuesForReport(model);
        const response = await services.GetFieldHistoryDetails(model);
        if (response.statusCode === "Success" && response.data !== null) {
            setFieldDetailsData(response.data);
        } else {
            alert.error("No Records to Display");
        }
    }

    function calculateTotalQty() {
        const totalFieldArea = fieldDetailsData.reduce((accumulator, current) => accumulator + current.fieldArea, 0);

        setTotalValues({
            ...totalValues,
            totalFieldArea: totalFieldArea
        })
    };

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            array.map(x => {
                var vr = {
                    'Business Division': x.groupName,
                    'Location': x.factoryName,
                    'Sub Division': x.divisionName,
                    'Field Name': x.fieldName,
                    'Field Name': x.fieldName,
                    'Planting Type': x.plantingTypeName,
                    'Spacing': x.spaceBetweenPlants,
                    'Area': x.fieldArea.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    'Year': x.plantingYear
                };
                res.push(vr);
            });
        }
        return res;
    }

    async function createFile() {
        var file = await createDataForExcel(fieldDetailsData);
        var settings = {
            sheetName: 'Field History Report',
            fileName:
                'Field History Detail Report',
            writeOptions: {}
        };
        let keys = Object.keys(file[0]);
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem });
        });
        let dataA = [
            {
                sheet: 'Field History Report',
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
        setFieldDetailsReport({
            ...fieldDetailsReport,
            [e.target.name]: value
        });
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: GroupList[searchForm.groupID],
            estateName: estates[searchForm.estateID],
            divisionName: divisions[searchForm.divisionID],
            productName: products[searchForm.productID]
        })
    }
    return (
        <Page className={classes.root} title={title}>
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: fieldDetailsReport.groupID,
                        estateID: fieldDetailsReport.estateID,
                        divisionID: fieldDetailsReport.divisionID,
                        productID: fieldDetailsReport.productID
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Business Division is required').min("1", 'Business Division is required'),
                            estateID: Yup.number().required('Location is required').min("1", 'Location is required')
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
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="groupID">
                                                        Business Division *
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="groupID"
                                                        onChange={(e) => handleChange(e)}
                                                        value={fieldDetailsReport.groupID}
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

                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="estateID">
                                                        Location *
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="estateID"
                                                        size='small'
                                                        onChange={(e) => {
                                                            handleChange(e)
                                                        }}
                                                        value={fieldDetailsReport.estateID}
                                                        variant="outlined"
                                                        id="estateID"
                                                        InputProps={{
                                                            readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                        }}
                                                    >
                                                        <MenuItem value={0}>--Select Location--</MenuItem>
                                                        {generateDropDownMenu(estates)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={12}>
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
                                                        value={fieldDetailsReport.divisionID}
                                                        variant="outlined"
                                                        id="divisionID"
                                                    >
                                                        <MenuItem value={0}>--All Sub Divisions--</MenuItem>
                                                        {generateDropDownMenu(divisions)}
                                                    </TextField>
                                                </Grid>

                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="productID">
                                                        Product
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="productID"
                                                        size='small'
                                                        onChange={(e) => handleChange(e)}
                                                        value={fieldDetailsReport.productID}
                                                        variant="outlined"
                                                        id="productID"
                                                    >
                                                        <MenuItem value={0}>--All Products--</MenuItem>
                                                        {generateDropDownMenu(products)}
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
                                                <br></br>
                                                {fieldDetailsData.length > 0 ?
                                                    <TableContainer component={Paper}>
                                                        <Table className={classes.table} aria-label="simple table" size='small'>
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px dotted black" }}>Business Division</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px dotted black" }}>Location</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px dotted black" }}>Sub Division</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px dotted black" }}>Field Name</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px dotted black" }}>Planting Type</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px dotted black" }}>Spacing</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px dotted black" }}>Area</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px dotted black" }}>Year</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {fieldDetailsData.slice(page * limit, page * limit + limit).map((row, i) => (
                                                                    <TableRow key={i}>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px dotted black" }}> {row.groupName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px dotted black" }}> {(row.factoryName)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px dotted black" }}> {(row.divisionName)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px dotted black" }}> {(row.fieldName)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px dotted black" }}> {(row.plantingTypeName)}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px dotted black" }}> {(row.spaceBetweenPlants == "" || row.spaceBetweenPlants == null) ? '-' : row.spaceBetweenPlants}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px dotted black" }}> {row.fieldArea.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px dotted black" }}> {row.plantingYear}</TableCell>
                                                                    </TableRow>
                                                                )
                                                                )}
                                                            </TableBody>
                                                            <TableRow>
                                                                <TableCell colSpan={6} align={'center'} style={{ borderBottom: "none", border: "1px dotted black" }}><b>Total</b></TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px dotted black" }}>
                                                                    <b> {(totalValues.totalFieldArea).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                                                </TableCell>
                                                                <TableCell style={{ borderBottom: "none", border: "1px dotted black" }}></TableCell>
                                                            </TableRow>
                                                        </Table>
                                                        <TablePagination
                                                            component="div"
                                                            count={fieldDetailsData.length}
                                                            onChangePage={handlePageChange}
                                                            onChangeRowsPerPage={handleLimitChange}
                                                            page={page}
                                                            rowsPerPage={limit}
                                                            rowsPerPageOptions={[5, 10, 25]}
                                                        />
                                                    </TableContainer> : null}
                                            </Box>
                                        </CardContent>
                                        {fieldDetailsData.length > 0 ?
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                {/* <Button
                                                    color="primary"
                                                    id="btnRecord"
                                                    type="submit"
                                                    variant="contained"
                                                    style={{ marginRight: '1rem' }}
                                                    className={classes.colorRecord}
                                                    onClick={createFile}
                                                    size="small"
                                                >
                                                    EXCEL
                                                </Button> */}
                                                <div>&nbsp;</div>
                                                <ReactToPrint
                                                    documentTitle={"Field History Details"}
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
                                                        searchData={selectedSearchValues} fieldDetailsData={fieldDetailsData} totalValues={totalValues} />
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