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

const screenCode = 'PRUNINGDETAILSREPORT';

export default function PruningDetailsReport(props) {
    const [title, setTitle] = useState("Pruning Details")
    const classes = useStyles();
    const [GroupList, setGroupList] = useState([]);
    const [FieldList, setFieldList] = useState([]);
    const [estates, setEstates] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [products, setProducts] = useState([]);
    const [pruningDetailData, setPruningDetailData] = useState([]);
    const [pruningDetailsReport, setPruningDetailsReport] = useState({
        groupID: '0',
        estateID: '0',
        divisionID: '0',
        productID: '0',
        fieldID: '0'
    })

    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: '',
        estateName: 0,
        divisionName: 0,
        fieldName: 0,
        productName: 0
    })
    const [totalValues, setTotalValues] = useState({
        totalFieldArea: 0,
        totalHeight: 0,
        totalAllowance: 0
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
        trackPromise(getGroupsForDropdown(), getPermission(), getFieldsForDropdown());
    }, []);

    useEffect(() => {
        getEstateDetailsByGroupID();
    }, [pruningDetailsReport.groupID]);

    useEffect(() => {
        getDivisionDetailsByEstateID();
    }, [pruningDetailsReport.estateID]);

    useEffect(() => {
        GetMappedProductsByIDs();
    }, [pruningDetailsReport.estateID, pruningDetailsReport.divisionID]);

    useEffect(() => {
        setPruningDetailData([]);
    }, [pruningDetailsReport.groupID, pruningDetailsReport.estateID, pruningDetailsReport.divisionID, pruningDetailsReport.productID, pruningDetailsReport.fieldID]);

    useEffect(() => {
        setPage(0);
    }, [pruningDetailsReport]);


    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'PRUNINGDETAILSREPORT');

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

        setPruningDetailsReport({
            ...pruningDetailsReport,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            estateID: parseInt(tokenService.getFactoryIDFromToken())
        })

    }
    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroupList(groups);
    }

    async function getFieldsForDropdown() {
        const fields = await services.GetAllFields();
        setFieldList(fields);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(pruningDetailsReport.groupID);
        setEstates(response);
    }

    async function getDivisionDetailsByEstateID() {
        var response = await services.getDivisionDetailsByEstateID(pruningDetailsReport.estateID);
        setDivisions(response);
    }

    async function GetMappedProductsByIDs() {
        setProducts([])
        var response = 0;
        if (pruningDetailsReport.divisionID == '0') {
            response = await services.GetMappedProductsByFactoryID(pruningDetailsReport.estateID);
        } else {
            response = await services.GetMappedProductsByDivisionID(pruningDetailsReport.divisionID);
        }
        setProducts(response);
    };

    async function GetDetails() {
        let model = {
            groupID: parseInt(pruningDetailsReport.groupID),
            estateID: parseInt(pruningDetailsReport.estateID),
            divisionID: parseInt(pruningDetailsReport.divisionID),
            productID: parseInt(pruningDetailsReport.productID),
            fieldID: parseInt(pruningDetailsReport.fieldID)
        }
        getSelectedDropdownValuesForReport(model);
        const response = await services.GetPruningDetails(model);
        let totalFieldArea = 0;
        let totalHeight = 0;
        let totalAllowance = 0;
        if (response.statusCode === "Success" && response.data !== null) {
            response.data.forEach(x => {
                x.tasks.forEach(y => {
                    totalFieldArea += y.fieldArea
                    totalHeight += y.height
                    totalAllowance += y.allowance
                });
            });
            setPruningDetailData(response.data);
            setTotalValues({
                ...totalValues,
                totalFieldArea: totalFieldArea,
                totalHeight: totalHeight,
                totalAllowance: totalAllowance
            })

        } else {
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
        setPruningDetailsReport({
            ...pruningDetailsReport,
            [e.target.name]: value
        });
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: GroupList[searchForm.groupID],
            estateName: estates[searchForm.estateID],
            divisionName: divisions[searchForm.divisionID],
            productName: products[searchForm.productID],
            fieldName: FieldList[searchForm.fieldID]
        })
    }
    return (
        <Page className={classes.root} title={title}>
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: pruningDetailsReport.groupID,
                        estateID: pruningDetailsReport.estateID,
                        divisionID: pruningDetailsReport.divisionID,
                        productID: pruningDetailsReport.productID,
                        fieldName: pruningDetailsReport.fieldName
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
                                                        value={pruningDetailsReport.groupID}
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
                                                        value={pruningDetailsReport.estateID}
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
                                                        value={pruningDetailsReport.divisionID}
                                                        variant="outlined"
                                                        id="divisionID"
                                                    >
                                                        <MenuItem value={0}>--All Sub Divisions--</MenuItem>
                                                        {generateDropDownMenu(divisions)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="fieldID">
                                                        Fields
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="fieldID"
                                                        size='small'
                                                        onChange={(e) => handleChange(e)}
                                                        value={pruningDetailsReport.fieldID}
                                                        variant="outlined"
                                                        id="fieldID"
                                                    >
                                                        <MenuItem value={0}>--All Fields--</MenuItem>
                                                        {generateDropDownMenu(FieldList)}
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
                                                        value={pruningDetailsReport.productID}
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
                                                {pruningDetailData.length > 0 ?
                                                    <TableContainer component={Paper}>
                                                        <Table className={classes.table} aria-label="simple table" size='small'>
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Pruning Details</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Field Name</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Pruning Type Name</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Field Area</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Height</TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Allowance</TableCell>

                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>

                                                                {pruningDetailData.slice(page * limit, page * limit + limit).map((rows, i) => (
                                                                    <>
                                                                        <TableRow key={i}>
                                                                            <TableCell colSpan={6} align="left" style={{ fontWeight: "bold", border: "1px dashed black" }}> {"Field : " + rows.fieldName}</TableCell>
                                                                        </TableRow>
                                                                        {rows.tasks.map((row) => {
                                                                            return (
                                                                                <TableRow key={i}>
                                                                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black" }}> {row.pruningDetails}</TableCell>
                                                                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black" }}> {row.fieldName}</TableCell>
                                                                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black" }}> {row.pruningTypeName}</TableCell>
                                                                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px dashed black" }}> {row.fieldArea}</TableCell>
                                                                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px dashed black" }}> {row.height}</TableCell>
                                                                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px dashed black" }}> {row.allowance}</TableCell>
                                                                                </TableRow>
                                                                            );
                                                                        })}
                                                                    </>
                                                                ))}
                                                            </TableBody>
                                                            <TableRow>
                                                                <TableCell colSpan={3} align={'center'} style={{ borderBottom: "1px solid black", border: "1px solid black" }}><b>Total</b></TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "1px solid black", border: "1px solid black" }}>
                                                                    <b> {(totalValues.totalFieldArea).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                                                </TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "1px solid black", border: "1px solid black" }}>
                                                                    <b> {(totalValues.totalHeight).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                                                </TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "1px solid black", border: "1px solid black" }}>
                                                                    <b> {(totalValues.totalAllowance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                                                </TableCell>
                                                            </TableRow>
                                                        </Table>
                                                        <TablePagination
                                                            component="div"
                                                            count={pruningDetailData.length}
                                                            onChangePage={handlePageChange}
                                                            onChangeRowsPerPage={handleLimitChange}
                                                            page={page}
                                                            rowsPerPage={limit}
                                                            rowsPerPageOptions={[5, 10, 25]}
                                                        />
                                                    </TableContainer> : null}
                                            </Box>
                                        </CardContent>
                                        {pruningDetailData.length > 0 ?
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
                                                    documentTitle={"Pruning Details"}
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
                                                        searchData={selectedSearchValues} pruningDetailData={pruningDetailData} totalValues={totalValues} />
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