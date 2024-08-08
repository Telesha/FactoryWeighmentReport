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

const screenCode = 'GRANTAREASANDLABOURONBOOKREPORT';

export default function GrantAreasAndLabourOnBookReport(props) {
    const [title, setTitle] = useState("Grant Area and Labour on Book")
    const classes = useStyles();
    const [GroupList, setGroupList] = useState([]);
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [groupComplex, setGroupComplex] = useState([]);
    const [totalGrantArea, setTotalGrantArea] = useState(0);
    const [totalLabourOnBook, setTotalLabourOnBook] = useState(0);
    const [grantAreasandLabouronbookReport, setGrantAreasandLabouronbookReport] = useState({
        groupID: 0
    })
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: ''
    })
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false
    });
    const componentRef = useRef();
    const navigate = useNavigate();
    const alert = useAlert();

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        setGroupComplex([]);
    }, [grantAreasandLabouronbookReport.groupID]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWGRANTAREASANDLABOURONBOOKREPORT');

        if (isAuthorized === undefined) {
            navigate('/404');
        }
        var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');

        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined
        });

        setGrantAreasandLabouronbookReport({
            ...grantAreasandLabouronbookReport,
            groupID: parseInt(tokenService.getGroupIDFromToken())
        })

    }
    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroupList(groups);
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
        const response = await services.getGrantAreasandLabouronbookReport(grantAreasandLabouronbookReport.groupID);
        getSelectedDropdownValuesForReport(grantAreasandLabouronbookReport.groupID);
        if (response.statusCode === "Success" && response.data !== null) {
            let totalLabourOnBook = 0;
            let totalGrantArea = 0;
            response.data.forEach(x => {
                x.details.forEach(y => {
                    y.detailsx.forEach(z => {
                        totalLabourOnBook += parseFloat(z.labourOnBook)
                        totalGrantArea += parseFloat(z.grantArea)
                    })
                })
            });
            setGroupComplex(response.data);
            setTotalLabourOnBook(totalLabourOnBook);
            setTotalGrantArea(totalGrantArea);
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
        var file = await createDataForExcel(groupComplex);
        var settings = {
            sheetName: 'Grant Area Labour Report',
            fileName:
                'Grant Area And Labour On Book Report - ' +
                    selectedSearchValues.groupName == undefined ? 'All Business Divisions' : selectedSearchValues.groupName,
            writeOptions: {}
        };
        let keys = Object.keys(file[0]);
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem });
        });
        let dataA = [
            {
                sheet: 'Grant Area Labour Report',
                columns: tempcsvHeaders,
                content: file
            }
        ];
        xlsx(dataA, settings);
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
        setGrantAreasandLabouronbookReport({
            ...grantAreasandLabouronbookReport,
            [e.target.name]: value
        });
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: GroupList[searchForm],
        })
    }
    return (
        <Page className={classes.root} title={title}>
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: grantAreasandLabouronbookReport.groupID,
                    }}
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
                                                        Business Division
                                                    </InputLabel>
                                                    <TextField
                                                        select
                                                        error={Boolean(touched.groupID && errors.groupID)}
                                                        fullWidth
                                                        helperText={touched.groupID && errors.groupID}
                                                        name="groupID"
                                                        onBlur={handleBlur}
                                                        onChange={e => handleChange(e)}
                                                        value={grantAreasandLabouronbookReport.groupID}
                                                        variant="outlined"
                                                        id="groupID"
                                                        size="small"
                                                        InputProps={{
                                                            readOnly: !permissionList.isGroupFilterEnabled ? true : false
                                                        }}
                                                    >
                                                        <MenuItem value="0">--All Business Division--</MenuItem>
                                                        {generateDropDownMenu(GroupList)}
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
                                                {groupComplex.length > 0 ? (
                                                    <TableContainer component={Paper}>
                                                        <Table className={classes.table} aria-label="simple table" size='small'>
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}> Particulars </TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black", width: "350px" }}> Labour on Book </TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black", width: "350px" }}> Grant Area </TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black", width: "350px" }}> Labour per Hectare </TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {groupComplex.map((group, i) => {
                                                                    let TtotalLabourOnBook = 0;
                                                                    let TtotalGrantArea = 0;
                                                                    return (
                                                                        <React.Fragment key={i}>
                                                                            <TableRow>
                                                                                <TableCell colSpan={4} component="th" scope="row" align="left" style={{ border: "1px solid black", fontWeight: 'bolder', color: 'red' }}>{group.masterGroupName}</TableCell>
                                                                            </TableRow>
                                                                            {group.details.map((grp, j) => {
                                                                                let totalLabourOnBook = 0;
                                                                                let totalGrantArea = 0;
                                                                                let totalGrantLabour = 0;
                                                                                return (
                                                                                    <React.Fragment key={j}>
                                                                                        <TableRow>
                                                                                            <TableCell colSpan={4} component="th" scope="row" align="left" style={{ border: "1px solid black", fontWeight: 'bolder' }}>{grp.groupName}</TableCell>
                                                                                        </TableRow>
                                                                                        {grp.detailsx.map((detail, k) => {
                                                                                            totalLabourOnBook += parseFloat(detail.labourOnBook);
                                                                                            totalGrantArea += parseFloat(detail.grantArea);
                                                                                            totalGrantLabour = parseFloat(detail.labourOnBook) / parseFloat(detail.grantArea)
                                                                                            TtotalLabourOnBook += parseFloat(detail.labourOnBook);
                                                                                            TtotalGrantArea += parseFloat(detail.grantArea);
                                                                                            return (
                                                                                                <TableRow key={`${i}-${j}-${k}`}>
                                                                                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}>{detail.factoryName}</TableCell>
                                                                                                    <TableCell align="right" style={{ border: "1px solid black" }}>{parseFloat(detail.labourOnBook).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                                    <TableCell align="right" style={{ border: "1px solid black" }}>{parseFloat(detail.grantArea).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                                    <TableCell align="right" style={{ border: "1px solid black" }}>{isNaN(totalGrantLabour) ? '0.00' : totalGrantLabour.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                                </TableRow>
                                                                                            );
                                                                                        })}
                                                                                        <TableRow>
                                                                                            <TableCell align="left" style={{ border: "1px solid black", fontWeight: "bold", fontStyle: "italic" }}>Sub Total</TableCell>
                                                                                            <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold" }}>{parseFloat(totalLabourOnBook).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                            <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold" }}>{parseFloat(totalGrantArea).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                            <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold" }}>{isNaN(totalLabourOnBook / totalGrantArea) ? '0.00' : parseFloat(totalLabourOnBook / totalGrantArea).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                        </TableRow>
                                                                                    </React.Fragment>
                                                                                );
                                                                            })}
                                                                            <TableRow>
                                                                                <TableCell align="left" style={{ border: "1px solid black", fontWeight: "bold", fontStyle: "italic", color: 'blue' }}>Total</TableCell>
                                                                                <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold", color: 'blue' }}>{TtotalLabourOnBook.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold", color: 'blue' }}>{TtotalGrantArea.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold", color: 'blue' }}>{isNaN(TtotalLabourOnBook / TtotalGrantArea) ? '0.00' : parseFloat(TtotalLabourOnBook / TtotalGrantArea).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                            </TableRow>
                                                                        </React.Fragment>
                                                                    );
                                                                })}
                                                                <TableRow>
                                                                    <TableCell align="left" style={{ border: "1px solid black", fontWeight: "bold", fontStyle: "italic", color: 'green' }}>Grand Total</TableCell>
                                                                    <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold", color: 'green' }}>{totalLabourOnBook.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                    <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold", color: 'green' }}>{totalGrantArea.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                    <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold", color: 'green' }}>{isNaN(((totalLabourOnBook) / (totalGrantArea))) ? '0.00' : ((totalLabourOnBook) / (totalGrantArea)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                </TableRow>
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                ) : null}
                                            </Box>
                                        </CardContent>
                                        {groupComplex.length > 0 ?
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
                                                    documentTitle={"Grant Area and Labour on Book "}
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
                                                        searchData={selectedSearchValues} groupComplex={groupComplex} totalLabourOnBook={totalLabourOnBook} totalGrantArea={totalGrantArea} />
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