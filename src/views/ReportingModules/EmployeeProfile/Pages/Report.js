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
    Typography,
    Paper
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
import moment from 'moment';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: '100%',
        paddingBottom: theme.spacing(4),
        paddingTop: theme.spacing(4)
    },
    modalCard: {
        padding: theme.spacing(4),
        width: '75%',
        maxWidth: 'calc(100% - 96px)',
        margin: '20px',
        backgroundColor: 'seashell'
    },
    heading: {
        marginBottom: theme.spacing(3),
    },
    content: {
        marginBottom: theme.spacing(3),
    },
}));



const screenCode = 'EMPLOYEEPROFILE';

export default function EmployeeProfilReport(props) {
    const [title, setTitle] = useState("Employee Profile")
    const classes = useStyles();
    const [GroupList, setGroupList] = useState([]);
    const [employeeProfileData, setEmployeeProfileData] = useState([]);
    const [employeeProfilReport, setEmployeeProfilReport] = useState({
        groupID: '0',
        registrationNumber: ''
    })
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: '',
        registrationNumber: '',

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
        setEmployeeProfileData([]);
    }, [employeeProfilReport]);


    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'EMPLOYEEPROFILE');

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

        setEmployeeProfilReport({
            ...employeeProfilReport,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
        })
    }
    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroupList(groups);
    }

    async function GetDetails() {
        let model = {
            groupID: parseInt(employeeProfilReport.groupID),
            registrationNumber: employeeProfilReport.registrationNumber
        }

        getSelectedDropdownValuesForReport(model);
        const response = await services.GetEmployeeProfile(model);
        if (response.statusCode === "Success" && response.data !== null) {
            setEmployeeProfileData(response.data);
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
        setEmployeeProfilReport({
            ...employeeProfilReport,
            [e.target.name]: value
        });
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: GroupList[searchForm.groupID],
            registrationNumber: [searchForm.registrationNumber],

        })
    }
    return (
        <Page className={classes.root} title={title}>
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: employeeProfilReport.groupID,
                        registrationNumber: employeeProfilReport.registrationNumber,
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Business Division is required').min("1", 'Business Division is required'),
                            registrationNumber: Yup.string().required('Registration No is required'),
                        })
                    }
                    onSubmit={() => trackPromise(GetDetails())}
                    enableReinitialize

                >
                    {({
                        errors,
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
                                                        value={employeeProfilReport.groupID}
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
                                                    <InputLabel shrink id="regNo">
                                                        Reg No. *
                                                    </InputLabel>
                                                    <TextField
                                                        error={Boolean(touched.registrationNumber && errors.registrationNumber)}
                                                        fullWidth
                                                        helperText={touched.registrationNumber && errors.registrationNumber}
                                                        size='small'
                                                        name="registrationNumber"
                                                        onChange={(e) => handleChange(e)}
                                                        value={employeeProfilReport.registrationNumber}
                                                        variant="outlined"
                                                        id="registrationNumber"
                                                    >
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
                                            {employeeProfileData.length > 0 && (
                                                <Box display="flex" justifyContent="center" position="relative">
                                                    <Paper elevation={3} className={`${classes.modalCard} ${classes.expandedCard}`}>
                                                        <CardContent>
                                                            {employeeProfileData.map((row, index) => (
                                                                <Grid container spacing={8} key={index}>
                                                                    <Grid item xs={6} style={{ textAlign: 'center' }}>
                                                                        <img
                                                                            src={row.convertedEmployeeImageData}
                                                                            alt={`${row.firstName} profile`}
                                                                            style={{ borderRadius: '10px', width: '250px', height: '250px', objectFit: 'cover' }}
                                                                        />
                                                                        <Typography variant="h2" gutterBottom style={{ marginTop: '10px' }}>
                                                                            <strong>{row.registrationNumber}</strong>
                                                                        </Typography>
                                                                        <Typography variant="h3" gutterBottom>
                                                                            <strong>{row.firstName}</strong>
                                                                        </Typography>
                                                                    </Grid>
                                                                    <Grid item xs={6}>
                                                                        <Typography variant="body1" gutterBottom className={classes.heading}>
                                                                            <strong>Business Division:</strong> {row.groupName}
                                                                        </Typography>
                                                                        <Typography variant="body1" gutterBottom className={classes.content}>
                                                                            <strong>Location:</strong> {row.factoryName}
                                                                        </Typography>
                                                                        <Typography variant="body1" gutterBottom className={classes.content}>
                                                                            <strong>Sub-Division:</strong> {row.employeeSubDivisionName}
                                                                        </Typography>
                                                                        <Typography variant="body1" gutterBottom className={classes.content}>
                                                                            <strong>Work Location:</strong> {row.workLocation}
                                                                        </Typography>
                                                                        <Typography variant="body1" gutterBottom className={classes.content}>
                                                                            <strong>Pay Point:</strong> {row.payPointName}
                                                                        </Typography>
                                                                        <Typography variant="body1" gutterBottom className={classes.content}>
                                                                            <strong>Employee Sub Category:</strong> {row.employeeSubCategoryName}
                                                                        </Typography>
                                                                        <Typography variant="body1" gutterBottom className={classes.content}>
                                                                            <strong>Date Of Birth:</strong> {moment(row.dateOfBirth).format('YYYY-MM-DD')}
                                                                        </Typography>
                                                                        <Typography variant="body1" gutterBottom className={classes.content}>
                                                                            <strong>Joining Date:</strong> {moment(row.joiningDate).format('YYYY-MM-DD')}
                                                                        </Typography>
                                                                    </Grid>
                                                                    {index !== employeeProfileData.length - 1 && (
                                                                        <Grid item xs={12}>
                                                                            <Divider />
                                                                        </Grid>
                                                                    )}
                                                                </Grid>
                                                            ))}
                                                        </CardContent>
                                                    </Paper>
                                                </Box>
                                            )}


                                        </CardContent>
                                        {employeeProfileData.length > 0 ?
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                <div>&nbsp;</div>
                                                <ReactToPrint
                                                    documentTitle={"Employee Profile"}
                                                    trigger={() => <Button
                                                        color="primary"
                                                        id="btnRecord"
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
                                                        employeeProfileData={employeeProfileData} />
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