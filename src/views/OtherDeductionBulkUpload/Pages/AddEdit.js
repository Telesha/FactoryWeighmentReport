import React, { useState, useEffect } from 'react';
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
import { useNavigate, useParams } from 'react-router-dom';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import { Formik } from 'formik';
import * as Yup from "yup";
import CSVReader from 'react-csv-reader';
import MaterialTable from "material-table";
import { Fragment } from 'react';
import { LoadingComponent } from '../../../utils/newLoader';
import { useAlert } from "react-alert";
import tokenDecoder from '../../../utils/tokenDecoder';

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
    }
}));

const screenCode = 'OTHERDEDUCTIONBULKUPLOAD';
export default function OtherDeductionBulkUploadAddEdit(props) {
    const [title, setTitle] = useState("Other Deduction Bulk Upload")
    const classes = useStyles();
    const alert = useAlert();
    const [groups, setGroups] = useState();
    const [estates, setEstates] = useState();
    const [divisions, setDivisions] = useState();
    const [employeeCSVData, setEmployeeCSVData] = useState([]);
    const [failedData, setFailedData] = useState([]);
    const [initialState, setInitialState] = useState(false);
    const [employeeBulkUpload, setEmployeeBulkUpload] = useState({
        groupID: 0,
        estateID: 0,
        divisionID: 0,
    })
    const [employeeDataBulkUpload, setEmployeeDataBulkUpload] = useState({
        employeeID: '',
        employeeName: '',
        employeeTypeName: '',
        deductionTypeName: '',
        deductionAmount: '0',
        reference: '-',
        applicableDate: ''
    });
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });

    const papaparseOptions = {
        header: true,
        dynamicTyping: false,
        quoteChar: '"',
        skipEmptyLines: true,
        parseNumbers: true,
        transformHeader: header => header.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '')
    };
    const navigate = useNavigate();

    useEffect(() => {
        trackPromise(getGroupsForDropdown(),
            getPermission()
        );
    }, []);

    useEffect(() => {
        if (!initialState) {
            trackPromise(getPermission());
        }
    }, []);

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID());
    }, [employeeBulkUpload.groupID]);

    useEffect(() => {
        if (initialState) {
            setEmployeeBulkUpload((prevState) => ({
                ...prevState,
                estateID: 0,
                divisionID: 0,

            }));
        }
    }, [employeeBulkUpload.groupID, initialState]);

    useEffect(() => {
        if (initialState) {
            setEmployeeBulkUpload((prevState) => ({
                ...prevState,
                divisionID: 0
            }));
        }
    }, [employeeBulkUpload.estateID, initialState]);

    useEffect(() => {
        trackPromise(getDivisionDetailsByEstateID());
    }, [employeeBulkUpload.estateID]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWOTHERDEDUCTIONBULKUPLOAD');

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

        setEmployeeBulkUpload({
            ...employeeBulkUpload,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            estateID: parseInt(tokenService.getFactoryIDFromToken())
        })
        setInitialState(true);
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }
    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(employeeBulkUpload.groupID);
        setEstates(response);
    };
    async function getDivisionDetailsByEstateID() {
        var response = await services.getDivisionDetailsByEstateID(employeeBulkUpload.estateID);
        setDivisions(response);
    };

    const handleForce = (data, fileInfo) => {
        if (employeeCSVData != null) {
            setEmployeeDataBulkUpload({
                ...employeeDataBulkUpload,
                employeeID: data,
                employeeName: data,
                employeeTypeName: data,
                deductionTypeName: data,
                deductionAmount: data,
                reference: data,
                applicableDate: data,
            })
            confirmUpload(data, fileInfo);
        }
    }

    function confirmUpload(data, fileInfo) {
        setEmployeeCSVData(data);
    }

    async function handleSave() {
        let datarest = await Promise.all(employeeCSVData.map(async data => {
            let dataobj = {
                employeeID: data.employeeID,
                employeeName: data.employeeName,
                employeeTypeName: data.employeeTypeName,
                deductionTypeName: data.deductionTypeName,
                deductionAmount: parseFloat(data.deductionAmount).toFixed(2),
                reference: data.reference == '' ? '-' : data.reference,
                applicableDate: data.applicableDate,
                createdBy: tokenDecoder.getUserIDFromToken(),
                createdDate: new Date().toISOString(),
            }
            return dataobj;
        }))
        const response = await services.saveOtherDeductionUpload(datarest);
        if (response.statusCode == "Success" || response.data > 0) {
            setEmployeeCSVData([]);
            alert.success(response.message);
            clearData();
        }
        else {
            setEmployeeCSVData(response.data);
            alert.error(response.message);
        }

        setFailedData(response.data);
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
        setEmployeeBulkUpload({
            ...employeeBulkUpload,
            [e.target.name]: value
        });
        clearScreen();
    }

    function clearScreen() {
        setEmployeeCSVData([]);
        document.querySelector('.csv-input').value = '';
    }

    function clearData() {
        setEmployeeBulkUpload({
            ...employeeBulkUpload,
            groupID: 0,
            estateID: 0,
            divisionID: 0
        });
        setEmployeeCSVData([]);
        setFailedData([]);
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: employeeBulkUpload.groupID,
                            estateID: employeeBulkUpload.estateID,
                            divisionID: employeeBulkUpload.divisionID
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Legal Entity is required').min("1", 'Legal Entity is required'),
                                estateID: Yup.number().required('Garden is required').min("1", 'Garden is required'),
                                divisionID: Yup.number().required('Cost Center is required').min("1", 'Cost Center is required')
                            })
                        }
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
                                                            error={Boolean(touched.groupID && errors.groupID)}
                                                            fullWidth
                                                            helperText={touched.groupID && errors.groupID}
                                                            name="groupID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={employeeBulkUpload.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            InputProps={{
                                                                readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                            }}
                                                            size='small'

                                                        >
                                                            <MenuItem value="0">--Select Legal Entity--</MenuItem>
                                                            {generateDropDownMenu(groups)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="estateID">
                                                            Location *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.estateID && errors.estateID)}
                                                            fullWidth
                                                            helperText={touched.estateID && errors.estateID}
                                                            name="estateID"
                                                            onBlur={handleBlur}
                                                            size='small'
                                                            onChange={(e) => handleChange(e)}
                                                            value={employeeBulkUpload.estateID}
                                                            variant="outlined"
                                                            id="estateID"
                                                            InputProps={{
                                                                readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                            }}
                                                        >
                                                            <MenuItem value={0}>--Select Garden--</MenuItem>
                                                            {generateDropDownMenu(estates)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="divisionID">
                                                            Sub-Division *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.divisionID && errors.divisionID)}
                                                            fullWidth
                                                            helperText={touched.divisionID && errors.divisionID}
                                                            name="divisionID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={employeeBulkUpload.divisionID}
                                                            variant="outlined"
                                                            id="divisionID"
                                                            disabled={!permissionList.isFactoryFilterEnabled}
                                                            size='small'
                                                        >
                                                            <MenuItem value="0">--Select Cost Center--</MenuItem>
                                                            {generateDropDownMenu(divisions)}
                                                        </TextField>
                                                    </Grid>

                                                </Grid>
                                                <Grid container spacing={3}>

                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink>
                                                            Select File *
                                                        </InputLabel>
                                                        <CSVReader
                                                            inputStyle={{ width: '100%', height: '56px' }}
                                                            cssClass="react-csv-input"
                                                            onFileLoaded={handleForce}
                                                            parserOptions={papaparseOptions}
                                                            inputId="react-csv-reader-input"
                                                        />
                                                    </Grid>
                                                </Grid>

                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    <Button
                                                        color="primary"
                                                        type="reset"
                                                        variant="outlined"
                                                        onClick={() => clearData()}
                                                        size='small'
                                                    >
                                                        Clear
                                                    </Button>
                                                </Box>
                                                <br />

                                                <Box minWidth={1050}>
                                                    {failedData.length > 0 ?
                                                        <CardHeader style={{ marginLeft: '-1rem', color: '#FF0000', fontStyle: 'italic', fontWeight: 'bold', fontSize: '1.3rem' }} titleTypographyProps={{ variant: 'h6' }}
                                                            title={["Failed Records: " + failedData.length]}
                                                        /> : null
                                                    }
                                                    {employeeCSVData.length > 0 ?
                                                        <MaterialTable
                                                            title="Other Deduction Details"
                                                            columns={[
                                                                { title: 'Applicable Date', field: 'applicableDate' },
                                                                { title: 'Emp ID', field: 'employeeID' },
                                                                { title: 'Emp Name', field: 'employeeName' },
                                                                { title: 'Emp Type', field: 'employeeTypeName' },
                                                                { title: 'Deduction Type', field: 'deductionTypeName' },
                                                                { title: 'Amount', field: 'deductionAmount' },
                                                                { title: 'Reference', field: 'reference' },

                                                            ]}
                                                            data={employeeCSVData}
                                                            options={{
                                                                exportButton: false,
                                                                showTitle: false,
                                                                headerStyle: { textAlign: "left", height: '1%' },
                                                                cellStyle: { textAlign: "left" },
                                                                columnResizable: false,
                                                                actionsColumnIndex: -1
                                                            }}
                                                            actions={[

                                                            ]}
                                                        /> : null}

                                                    {employeeCSVData.length > 0 ?
                                                        <Box display="flex" justifyContent="flex-end" p={2}>
                                                            <Button
                                                                color="primary"
                                                                type="submit"
                                                                variant="contained"
                                                                disabled={failedData.length > 0}
                                                                onClick={() => (trackPromise(handleSave()))}
                                                            >
                                                                Upload
                                                            </Button>
                                                        </Box> : null}
                                                </Box>
                                            </CardContent>
                                        </PerfectScrollbar>
                                    </Card>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </Container>
            </Page>
        </Fragment>
    )

}