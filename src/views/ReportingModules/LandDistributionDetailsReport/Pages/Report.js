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

const screenCode = 'LANDDISTRIBUTIONDETAILSREPORT';

export default function LandDistributionDetailsReport(props) {
    const [title, setTitle] = useState("Land Distribution")
    const classes = useStyles();
    const [groups, setGroups] = useState([]);
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [groupComplex, setGroupComplex] = useState([]);
    const [grantAreasandLabouronbookReport, setGrantAreasandLabouronbookReport] = useState({
        masterGroupID: 0
    })
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        masterGroupName: ''
    })
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const componentRef = useRef();
    const navigate = useNavigate();
    const alert = useAlert();

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        GetDetails();
    }, []);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWLANDDISTRIBUTIONDETAILSREPORT');

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

        setGrantAreasandLabouronbookReport({
            ...grantAreasandLabouronbookReport,
            groupID: parseInt(tokenService.getGroupIDFromToken())
        })

    }

    async function getGroupsForDropdown() {
        const groups = await services.getMasterGroupsForDropdown();
        setGroups(groups);
    }

    async function GetDetails() {
        const response = await services.GetLandDistributionDetailsReport(grantAreasandLabouronbookReport.masterGroupID);
        //getSelectedDropdownValuesForReport(grantAreasandLabouronbookReport.masterGroupID);
        if (response.statusCode === "Success" && response.data !== null) {
            setGroupComplex(response.data);
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
        setGrantAreasandLabouronbookReport({
            ...grantAreasandLabouronbookReport,
            [e.target.name]: value
        });
    }

    // function getSelectedDropdownValuesForReport(searchForm) {
    //     setSelectedSearchValues({
    //         ...selectedSearchValues,
    //         masterGroupName: groups[searchForm],
    //     })
    // }

    return (
        <Page className={classes.root} title={title}>
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                // initialValues={{
                //     groupID: grantAreasandLabouronbookReport.masterGroupID
                // }}
                // onSubmit={() => trackPromise(GetDetails())}
                // enableReinitialize
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
                                            {/* <Grid container spacing={3}>
                                                <Grid item md={6} xs={12}>
                                                    <InputLabel shrink id="MasterGroupID">
                                                        Company  *
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="masterGroupID"
                                                        size='small'
                                                        onChange={(e) => handleChange(e)}
                                                        value={grantAreasandLabouronbookReport.masterGroupID}
                                                        variant="outlined"
                                                        InputProps={{
                                                            readOnly: !permissionList.isGroupFilterEnabled ? true : false
                                                        }}
                                                    >
                                                        <MenuItem value="0">--All Companies--</MenuItem>
                                                        {generateDropDownMenu(groups)}
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
                                            </Grid> */}
                                            <br />
                                            <Box minWidth={1050}>
                                                {groupComplex.length > 0 ? (
                                                    <TableContainer component={Paper}>
                                                        <Table className={classes.table} aria-label="simple table" size='small'>
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}> Particulars </TableCell>
                                                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black", width: "100px" }}> Priority </TableCell>
                                                                    {groups.map((group, i) => (
                                                                        <TableCell key={i} align="right" style={{ fontWeight: 'bold', border: "1px solid black" }}>
                                                                            {group === "The Consolidated Tea and Lands Company (Bangladesh) Limited" ? "Consol"
                                                                                : group === "Baraoora (Sylhet) Tea Company Limited" ? "Baraoora"
                                                                                    : group}
                                                                        </TableCell>
                                                                    ))}
                                                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", width: "120px", fontStyle: 'italic' }}> Total </TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {groupComplex.map((row, rowIndex) => {
                                                                    const distinctDetails = row.details.reduce((acc, detail) => {
                                                                        if (!acc.find(d => d.landDescription === detail.landDescription)) {
                                                                            acc.push(detail);
                                                                        }
                                                                        return acc;
                                                                    }, []);

                                                                    return (
                                                                        distinctDetails.map((rows, i) => {
                                                                            const rowTotalArea = groups.reduce((acc, grp) => {
                                                                                const groupRow = row.details.find(r => r.masterGroupName === grp && r.landDescription === rows.landDescription);
                                                                                return acc + (groupRow ? groupRow.area : 0);
                                                                            }, 0);
                                                                            return (
                                                                                <TableRow key={`${rowIndex}-${i}`}>
                                                                                    <TableCell align="left" style={{ border: "1px solid black" }}>{rows.landDescription}</TableCell>
                                                                                    <TableCell align="right" style={{ border: "1px solid black" }}>{rows.printPriority}</TableCell>
                                                                                    {groups.map((group, groupIndex) => {
                                                                                        const groupRow = row.details.find(r => r.masterGroupName === group && r.landDescription === rows.landDescription);
                                                                                        return (
                                                                                            <React.Fragment key={groupIndex}>
                                                                                                <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold" }}>
                                                                                                    {groupRow ? (groupRow.area).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                                                                                                </TableCell>
                                                                                            </React.Fragment>
                                                                                        );
                                                                                    })}
                                                                                    <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold", color: 'green' }}>
                                                                                        {rowTotalArea.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            );
                                                                        })
                                                                    );
                                                                })}
                                                                <TableRow>
                                                                    <TableCell colSpan={2} align="left" style={{ fontWeight: "bold", border: "1px solid black", color: 'navy', fontStyle: 'italic' }}> Total </TableCell>
                                                                    {groups.map((group, groupIndex) => {
                                                                        const groupTotalArea = groupComplex.reduce((acc, row) => {
                                                                            const groupRow = row.details.find(r => r.masterGroupName === group);
                                                                            return acc + (groupRow ? groupRow.area : 0);
                                                                        }, 0);
                                                                        return (
                                                                            <TableCell key={groupIndex} align="right" style={{ border: "1px solid black", fontWeight: "bold", color: 'blue' }}>
                                                                                {groupTotalArea.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                            </TableCell>
                                                                        );
                                                                    })}
                                                                    <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold", color: 'red' }}>
                                                                        {groupComplex.reduce((acc, row) => {
                                                                            return acc + groups.reduce((grpAcc, grp) => {
                                                                                const groupRow = row.details.find(r => r.masterGroupName === grp);
                                                                                return grpAcc + (groupRow ? groupRow.area : 0);
                                                                            }, 0);
                                                                        }, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                    </TableCell>
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
                                                    documentTitle={"Land Distribution"}
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
                                                        searchData={selectedSearchValues} groupComplex={groupComplex} groups={groups} />
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