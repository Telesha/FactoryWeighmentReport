import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box,
    Card,
    makeStyles,
    Container,
    CardHeader,
    CardContent,
    Divider,
    Button,
    MenuItem,
    Grid,
    InputLabel,
    TextField,
} from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import MaterialTable from "material-table";
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import { AgriGenERPEnum } from 'src/views/Common/AgriGenERPEnum/AgriGenERPEnum';


const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    },
}));

var screenCode = "DEDUCTIONTEMPLATE"

export default function DeductionListing() {
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const agriGenERPEnum = new AgriGenERPEnum();
    const [factories, setFactories] = useState();
    const [deductionList, setDeductionList] = useState([]);
    const alert = useAlert();
    const [costCenter, setCostCenter] = useState([]);
    const [deductionData, setDeductionData] = useState({
        groupID: 0,
        OperationEntityID: 0,
        costCenterID: 0
    })

    const navigate = useNavigate();
    let encrypted = "";
    const handleClick = () => {
        encrypted = btoa('0');
        navigate('/app/deductionTemplate/addedit/' + encrypted);
    }
    const handleClickEdit = (deductionTemplateID) => {
        encrypted = btoa(deductionTemplateID.toString());
        navigate('/app/deductionTemplate/addedit/' + encrypted);
    }
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });

    useEffect(() => {
        getPermissions();
        trackPromise(
            getGroupsForDropdown()
        );
    }, []);

    useEffect(() => {
        if (deductionData.groupID > 0) {
            trackPromise(
                getFactoriesByGroupID()
            )
        }
    }, [deductionData.groupID]);

    useEffect(() => {
        if (deductionData.OperationEntityID > 0) {
            trackPromise(
                getDivisionsByEstateID(deductionData.OperationEntityID)
            )
        }
    }, [deductionData.OperationEntityID]);

    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWDEDUCTIONTEMPLATE');

        if (isAuthorized === undefined) {
            navigate('/404');
        }

        var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
        })

        setDeductionData({
            ...deductionData,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            OperationEntityID: parseInt(tokenService.getFactoryIDFromToken()),
        });
    }

    async function getGroupsForDropdown() {
        const groups = await services.getGroupsForDropdown();
        setGroups(groups);
    }

    async function getFactoriesByGroupID() {
        const factory = await services.getFactoriesByGroupID(deductionData.groupID);
        setFactories(factory);
    }

    async function getDivisionsByEstateID(gardenID) {
        const costCenters = await services.getDivisionByEstateID(gardenID);
        setCostCenter(costCenters);
    }

    async function getDeductionDetails() {
        const response = await services.getDeductionDetails(deductionData.groupID, deductionData.OperationEntityID, deductionData.costCenterID);
        setDeductionList(response);
        if (response.length < 1) {
            alert.error("No Records Found")
        }
    }

    function handleGroupChange(e) {
        const target = e.target;
        const value = target.value
        setDeductionData({
            ...deductionData,
            [e.target.name]: value,
            OperationEntityID: "0",
            costCenterID: "0"
        });
    }

    function handleLocationChange(e) {
        const target = e.target;
        const value = target.value
        setDeductionData({
            ...deductionData,
            [e.target.name]: value,
            costCenterID: "0"
        });
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

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setDeductionData({
            ...deductionData,
            [e.target.name]: value
        });
    }
    const getEnumValueByInteger = (value) => {
        for (const key in agriGenERPEnum.ApplyMethodEnum) {
            if (agriGenERPEnum.ApplyMethodEnum[key] === value) {
                return key;
            }
        }
        return null;
    };

    function cardTitle(titleName) {
        return (
            <Grid container spacing={1}>
                <Grid item md={10} xs={12}>
                    {titleName}
                </Grid>
                <Grid item md={2} xs={12}>

                    <PageHeader
                        onClick={handleClick}
                        isEdit={true}
                        toolTiptitle={"Deduction Add"}
                    />

                </Grid>
            </Grid>
        )
    }

    return (
        <Page
            className={classes.root}
            title="Deduction Template"
        >
            <Container maxWidth={false}>

                <Formik
                    initialValues={{
                        groupID: deductionData.groupID,
                        OperationEntityID: deductionData.OperationEntityID,
                        costCenterID: deductionData.costCenterID
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Legal Entity is required').min("1", 'Legal Entity is required'),
                            OperationEntityID: Yup.number().required('Garden is required').min("1", 'Garden is required'),
                            costCenterID: Yup.number().required('Cost Center is required').min("1", 'Cost Center is required')
                        })
                    }
                    onSubmit={() => trackPromise(getDeductionDetails())}
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
                                        title={cardTitle("Deduction Template")}
                                    />
                                    <PerfectScrollbar>
                                        <Divider />
                                        <CardContent style={{ marginBottom: "2rem" }}>
                                            <Grid container spacing={3}>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="groupID">
                                                        Business Division *
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        helperText={touched.groupID && errors.groupID}
                                                        error={Boolean(touched.groupID && errors.groupID)}
                                                        name="groupID"
                                                        size='small'
                                                        onChange={(e) => handleGroupChange(e)}
                                                        value={deductionData.groupID}
                                                        variant="outlined"
                                                        InputProps={{
                                                            readOnly: !permissionList.isGroupFilterEnabled ? true : false
                                                        }}
                                                    >
                                                        <MenuItem value="0">--Select Business Division--</MenuItem>
                                                        {generateDropDownMenu(groups)}
                                                    </TextField>
                                                </Grid>

                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="OperationEntityID">
                                                        Location *
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        helperText={touched.OperationEntityID && errors.OperationEntityID}
                                                        error={Boolean(touched.OperationEntityID && errors.OperationEntityID)}
                                                        name="OperationEntityID"
                                                        size='small'
                                                        onChange={(e) => handleLocationChange(e)}
                                                        value={deductionData.OperationEntityID}
                                                        variant="outlined"
                                                        id="OperationEntityID"
                                                        InputProps={{
                                                            readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                        }}
                                                    >
                                                        <MenuItem value="0">--Select Location--</MenuItem>
                                                        {generateDropDownMenu(factories)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="OperationEntityID">
                                                        Sub Division*
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        helperText={touched.costCenterID && errors.costCenterID}
                                                        error={Boolean(touched.costCenterID && errors.costCenterID)}
                                                        name="costCenterID"
                                                        size='small'
                                                        onChange={(e) => handleChange(e)}
                                                        value={deductionData.costCenterID}
                                                        variant="outlined"
                                                        id="costCenterID"
                                                    >
                                                        <MenuItem value="0">--Select Sub Division--</MenuItem>
                                                        {generateDropDownMenu(costCenter)}
                                                    </TextField>
                                                </Grid>

                                            </Grid>
                                            <Box display="flex" flexDirection="row-reverse" p={2} style={{ marginTop: '20px' }}>
                                                <Button
                                                    color="primary"
                                                    type="submit"
                                                    variant="contained"
                                                >
                                                    Search
                                                </Button>
                                            </Box>
                                        </CardContent>
                                        <Box minWidth={1050}>
                                            {deductionList.length > 0 ?
                                                < MaterialTable width={1000}
                                                    title="Multiple Actions Preview"
                                                    columns={[
                                                        { title: 'Menu', field: 'menuName' },
                                                        { title: 'Deduction Type', field: 'deductionTypeName' },
                                                        { title: 'Apply Method', field: 'applyMethodID', render: rowdata => getEnumValueByInteger(parseInt(rowdata.applyMethodID)) },
                                                        { title: 'Default Value Enabled', field: 'isDefaultValueEnabled', render: rowdata => rowdata.isDefaultValueEnabled == true ? "Yes" : "No" },
                                                        { title: 'Deduction Order', field: 'deductionOrder' },
                                                        { title: 'Deduction Sequence', field: 'deductionSequence' },
                                                        { title: 'Status', field: 'isActive', render: rowdata => rowdata.isActive == true ? "Active" : "Inactive" },

                                                    ]}
                                                    data={deductionList}
                                                    options={{
                                                        exportButton: false,
                                                        showTitle: false,
                                                        headerStyle: { textAlign: "left", height: '1%' },
                                                        cellStyle: { textAlign: "left", paddingRight: '5rem' },
                                                        columnResizable: false,
                                                        actionsColumnIndex: -1,
                                                        search: false
                                                    }}
                                                    actions={[
                                                        {
                                                            icon: 'edit',
                                                            tooltip: 'Edit Deduction',
                                                            onClick: (event, deductionData) => handleClickEdit(deductionData.deductionTemplateID)
                                                        }
                                                    ]}
                                                />
                                                : null}
                                        </Box>
                                    </PerfectScrollbar>
                                </Card>
                            </Box>
                        </form>
                    )}
                </Formik>
            </Container>
        </Page>
    );
};