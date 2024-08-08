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

const screenCode = 'EMPLOYEEBULKUPLOAD';
export default function EmployeeBulkUploadAddEdit(props) {
    const [title, setTitle] = useState("Employee Bulk Upload")
    const classes = useStyles();
    const alert = useAlert();
    const [groups, setGroups] = useState();
    const [estates, setEstates] = useState();
    const [divisions, setDivisions] = useState();
    const [employeeCSVData, setEmployeeCSVData] = useState([]);
    const [employeeCategory, setEmployeeCategory] = useState([]);
    const [IsUploadingFinished, setIsUploadingFinished] = useState(false);
    const [employeeTypes, setEmployeeTypes] = useState([])
    const [employeeBulkUpload, setEmployeeBulkUpload] = useState({
        groupID: '0',
        estateID: '0',
        divisionID: '0'
    })
    const [employeeDataBulkUpload, setEmployeeDataBulkUpload] = useState([]);
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const [employeeNICExistsList, setEmployeeNICExistsList] = useState([]);
    const [initialState, setInitialState] = useState(false);
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
            getPermission(),
            getEmployeeTypes(),
            getEmployeeCategory()
        );
    }, []);

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID());
    }, [employeeBulkUpload.groupID]);

    useEffect(() => {
        if (!initialState) {
            trackPromise(getPermission());
        }
    }, []);

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
        var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEMPLOYEEBULKUPLOAD');

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
    async function getEmployeeTypes() {
        const result = await services.getEmployeeTypes();
        setEmployeeTypes(result.data);
    }
    async function getEmployeeCategory() {
        const result = await services.getEmployeeCategory();
        setEmployeeCategory(result.data);
    }


    async function assginEmployee(employeeCSVData, type) {
        if (type.type === "text/csv") {
            setEmployeeDataBulkUpload([])
            let datarest = await Promise.all(employeeCSVData.map(async data => {
                var employeeDetails = {
                    employeeID: 0,
                    groupID: parseInt(employeeBulkUpload.groupID),
                    employeeDivisionID: parseInt(employeeBulkUpload.divisionID),
                    operationEntityID: parseInt(employeeBulkUpload.estateID),
                    employeeTypeCode: data.employeeType,
                    employeeCategoryCode: data.employeeCategory,
                    employeeCode: data.employeeCode,
                    registrationNumber: data.registrationNumber,
                    titleCode: data.title,
                    //title: data.title,
                    name: data.name,
                    genderID: (data.gender == "Male") ? (1) : ((data.gender == "Female") ? (2) : (3)),
                    gender: data.gender,
                    dateOfBirth: data.dateOfBirth,
                    joiningDate: data.joiningDate,
                    maritalStatus: data.maritalStatus,
                    maritalStatusID: data.maritalStatus == "Married" ? 1 : 2,
                    epfNo: data.epfNo,
                    identityType: data.identityType,
                    identityTypeID: (data.identityType == "NID") ? (1) : ((data.identityType == "NIC") ? (3) : (2)),
                    nic: data.nic,
                    ReligionCode: data.religion,
                    officePhoneNo: data.officePhoneNo,
                    designationCode: data.designation,
                    RaiseCode: data.race,
                    nameToBePrinted: data.nameToBePrinted,
                    countryCode: data.country,
                    EmployeeSubCategoryCode: data.employeeSubCategory,
                    isSupplementary: parseInt(data.isSupplementary),
                    gangCode: data.daffa,
                    bookNumber: data.bookNumber,
                    //jobList: temCropArray,
                    employeeSubCategoryMappingCode: data.employeeSubCategoryMapping,
                    paymentModeCode: data.paymentMode,
                    paymentTypeCode: data.paymentType,
                    specialtyID: data.specialty,
                    dateOfConfirmation: data.dateOfConfirmation,
                    workLocation: data.workLocation,
                    payPoint: data.payPoint,
                    expiredDate: data.expiredDate,
                    resignedDate: data.resignedDate,
                    terminatedDate: data.terminatedDate,
                    createdBy: tokenDecoder.getUserIDFromToken(),
                }

                setEmployeeDataBulkUpload(employeeDataBulkUpload => [...employeeDataBulkUpload, employeeDetails]);
            }))
        }
        else {
            alert.error(type.name + " is not valid . please select a CSV file.");
        }
    }

    const handleForce = (data, fileInfo) => {
        assginEmployee(data, fileInfo);
        confirmUpload(data, fileInfo);
        setEmployeeCSVData(data);
    }

    function confirmUpload(data, fileInfo) {
        setIsUploadingFinished(false);
        setEmployeeCSVData(data);
    }

    async function saveEmployeeBulkDetails() {
        const count = await services.getAvailableCardCount();
        if (employeeDataBulkUpload.length > count) {
            alert.error("Not enough available card to proceed bulk upload")
        }
        else {

            if (employeeDataBulkUpload.length > 0) {
                setEmployeeCSVData([]);
                const response = await services.saveEmployeeBulkUpload(employeeDataBulkUpload);
                if (response.statusCode == "Success") {
                    setEmployeeCSVData([]);
                    alert.success(response.message);
                } else if (response.statusCode == "Error") {
                    setEmployeeCSVData(response.data);
                    alert.error(response.message);
                }
            }
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
        setEmployeeBulkUpload({
            ...employeeBulkUpload,
            [e.target.name]: value
        });
        clearScreen();
    }

    function clearScreen() {
        setEmployeeCSVData([]);
        setEmployeeNICExistsList([]);
        document.querySelector('.csv-input').value = '';
    }

    function clearData() {
        var employeeDetails = {
            employeeID: 0,
            groupID: 0,
            operationEntityID: 0,
            employeeTypeID: 0,
            employeeCategoryID: 0,
            designationID: 0,
            employeeSubCategoryID: 0,
            employeeDivisionID: 0,
            firstName: "",
            lastName: "",
            nic: "",
            genderID: 0,
            registrationNumber: "",
            city: "",
            address1: "",
            address2: "",
            address3: "",
            email: "",
            homePhoneNo: ""
        }
        setEmployeeDataBulkUpload([employeeDetails]);
        setIsUploadingFinished(false);
        setEmployeeBulkUpload({
            ...employeeBulkUpload,
            divisionID: '0'
        });
        setEmployeeCSVData([]);
        setEmployeeNICExistsList([]);
    }

    const getEmployeeType = id => {
        const result = employeeTypes.find(type => type.employeeTypeCode === id);
        return result === undefined ? '' : result.employeeTypeName;
    };
    const getEmployeeCategoryName = id => {
        const result = employeeCategory.find(type => type.employeeCategoryCode === id);
        return result === undefined ? '' : result.employeeCategoryName;
    };

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
                                groupID: Yup.number().required('Business Division is required').min("1", 'Business Division is required'),
                                estateID: Yup.number().required('Location is required').min("1", 'Location is required'),
                                divisionID: Yup.number().required('Sub Division is required').min("1", 'Sub Division is required')
                            })
                        }
                        enableReinitialize
                        onSubmit={() => (trackPromise(saveEmployeeBulkDetails()))}
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
                                                            <MenuItem value="0">--Select Business Division--</MenuItem>
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
                                                            <MenuItem value={0}>--Select Location--</MenuItem>
                                                            {generateDropDownMenu(estates)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="divisionID">
                                                            Sub Division *
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
                                                            size='small'
                                                        >
                                                            <MenuItem value="0">--Select Sub Division--</MenuItem>
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
                                                    {employeeCSVData.length > 0 ?
                                                        <MaterialTable
                                                            title="Employee Details"
                                                            columns={[
                                                                { title: 'Registration Number', field: 'registrationNumber' },
                                                                { title: 'Employee Type', field: 'employeeType', render: rowdata => getEmployeeType(rowdata.employeeType === undefined ? rowdata.employeeTypeCode : rowdata.employeeType) },
                                                                { title: 'Employee Category', field: 'employeeCategory', render: rowdata => getEmployeeCategoryName(rowdata.employeeCategory === undefined ? rowdata.employeeCategoryCode : rowdata.employeeCategory) },
                                                                { title: 'Name', field: 'name' },
                                                                { title: 'Identity Type', field: 'identityType' }, //, render: rowdata => (rowdata.identityTypeID == 1) ? ("NID") : ((rowdata.identityTypeID == 3 ) ? ("NIC") : ("BIR"))
                                                                { title: 'NIC', field: 'nic' }

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