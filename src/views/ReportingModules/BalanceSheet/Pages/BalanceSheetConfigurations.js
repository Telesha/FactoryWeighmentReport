import React, { useState, useEffect, Fragment, useRef } from 'react';
import { useAlert } from "react-alert";
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader, MenuItem

} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik} from 'formik';
import PageHeader from 'src/views/Common/PageHeader';
import * as Yup from "yup";
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { useNavigate, useParams } from 'react-router-dom';
import { LoadingComponent } from '../../../../utils/newLoader';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import Paper from '@material-ui/core/Paper';
import SearchIcon from '@material-ui/icons/Search';


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
    colorCancel: {
        backgroundColor: "red",
    },
    colorRecord: {
        backgroundColor: "green",
    },
    bold: {
        fontWeight: 600,
    }

}));

const screenCode = 'BALANCESHEETREPORT';

export default function BalanceSheetReportConfigurationSetup(props) {

    const navigate = useNavigate();
    const alert = useAlert();
    const { groupID } = useParams();
    const { factoryID } = useParams();
    const classes = useStyles();
    const [title, setTitle] = useState("Balance Sheet Setup");
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });
    const handleClickNavigate = () => {
        navigate('/app/balanceSheet/balanceSheetReport');
    }
    const [BalanceSheetDetails, setBalanceSheetDetails] = useState({
        groupID: 1,
        factoryID: 1,
        sectionName: '0',
        accountFilterType: '0',
        accountFilterText: ''
    });
    const [BalanceSheetSctionList, setBalanceSheetSctionList] = useState();
    const [checked, setChecked] = useState([]);
    const [LeftNewArray, setLeftNewArray] = useState([]);
    const [RightNewArray, setRightNewArray] = useState([]);
    const [RightNewArrayAlreadyStoredAccounts, setRightNewArrayAlreadyStoredAccounts] = useState([])
    const [RemovedLedgerAccountList, setRemovedLedgerAccountList] = useState([]);

    const leftChecked = intersection(checked, LeftNewArray);
    const rightChecked = intersection(checked, RightNewArray);

    function not(a, b) {
        return a.filter((value) => b.map(obj => obj.ledgerAccountID).indexOf(value.ledgerAccountID) === -1);
    }

    function intersection(a, b) {
        return a.filter((value) => b.map(obj => obj.ledgerAccountID).indexOf(value.ledgerAccountID) !== -1);
    }

    const handleToggle = (value) => () => {
        const currentIndex = checked.map(obj => obj.ledgerAccountID).indexOf(value.ledgerAccountID);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }
        setChecked(newChecked);
    };

    const handleAllRight = () => {
        setRightNewArray(RightNewArray.concat(LeftNewArray));
        setLeftNewArray([]);
    };

    const handleCheckedRight = () => {
        setRemovedLedgerAccountList(not(RemovedLedgerAccountList, leftChecked))
        setRightNewArray(RightNewArray.concat(leftChecked));
        setLeftNewArray(not(LeftNewArray, leftChecked));
        setChecked(not(checked, leftChecked));
    };

    const handleCheckedLeft = () => {

        setRemovedLedgerAccountList(RemovedLedgerAccountList.concat(rightChecked))

        setLeftNewArray(LeftNewArray.concat(rightChecked));
        setRightNewArray(not(RightNewArray, rightChecked));
        setChecked(not(checked, rightChecked));
    };

    const handleAllLeft = () => {
        setLeftNewArray(LeftNewArray.concat(RightNewArray));
        setRightNewArray([]);
    };

    const customList = (items) => (

        items.length > 0 ?
            <Paper className={classes.paper}>
                <List dense component="div" role="list">
                    {items.map((value) => {
                        const labelId = `transfer-list-item-${value.ledgerAccountID}-label`;

                        return (
                            <ListItem key={value.ledgerAccountID} role="listitem" button onClick={handleToggle(value)}>
                                <ListItemIcon>
                                    <Checkbox
                                        checked={checked.map(obj => obj.ledgerAccountID).indexOf(value.ledgerAccountID) !== -1}
                                        tabIndex={-1}
                                        disableRipple
                                        inputProps={{ 'aria-labelledby': labelId }}
                                    />
                                </ListItemIcon>
                                <ListItemText id={labelId} primary={value.ledgerAccountName} />
                            </ListItem>
                        );
                    })}
                    <ListItem />
                </List>
            </Paper> : null
    );

    useEffect(() => {
        trackPromise(getPermission());
        trackPromise(GetBalanceSheetSecctionDetails())
    }, []);

    useEffect(() => {
        const DecryptedGroupID = atob(groupID.toString());
        const DecryptedFactoryID = atob(factoryID.toString());

        setBalanceSheetDetails({
            ...BalanceSheetDetails,
            groupID: DecryptedGroupID,
            factoryID: DecryptedFactoryID
        })

    }, [])

    async function GetBalanceSheetSecctionDetails() {
        const respose = await services.GetBalanceSheetSectionDetails(BalanceSheetDetails.groupID, BalanceSheetDetails.factoryID);

        if (respose !== null && respose.length > 0) {
            setBalanceSheetSctionList(respose)
        } else {
            alert.error("Please configure section names")
        }
    }

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'ENABLEBALANCESHEETCONFIGURATION');

        if (isAuthorized === undefined) {
            navigate('/404');
        }
        var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
        });
    }

    async function LoadSetupCofigurations(e) {
        ClearAllArrays();
        const value = e.target.value
        const balanceSheetCongiDetails = await GetBalanceSheetSetupConfigurationDetails(value);

        if (balanceSheetCongiDetails.data.ledgerAccountList.length === 0) {
            alert.error("Configuration details not found");
        }
        const chartOfAccountList = await GetAllChartOfAccountDetails();
        if (chartOfAccountList.length === 0) {
            alert.error("Ledger accounts not found");
        }

        if (balanceSheetCongiDetails.data.ledgerAccountList.length === 0) {
            setRightNewArray([]);
            setRightNewArrayAlreadyStoredAccounts([])
        } else {
            setRightNewArray(balanceSheetCongiDetails.data.ledgerAccountList)
            setRightNewArrayAlreadyStoredAccounts(balanceSheetCongiDetails.data.ledgerAccountList)
        }
        const inter = await SetAndFilterMainLedgerAccountListArrays(chartOfAccountList, balanceSheetCongiDetails.data.ledgerAccountList)
    }

    async function SetAndFilterMainLedgerAccountListArrays(chartsOfAccountList, linkedAccountList) {
        const filteredAccountList = not(chartsOfAccountList, linkedAccountList)
        filteredAccountList.length === 0 ?
            setLeftNewArray([]) :
            setLeftNewArray(filteredAccountList);

        return filteredAccountList;
    }

    async function SearchLedgerAccountList() {
        const result = await GetAllChartOfAccountDetails();

        if (result.length === 0) {
            alert.error("Ledger accounts not found");
        }

        if (RightNewArray.length === 0) {
            result.length === 0 ?
                setLeftNewArray([]) :
                setLeftNewArray(result)
        }
        else {
            await SetAndFilterMainLedgerAccountListArrays(result, RightNewArray)
        }
    }

    async function GetBalanceSheetSetupConfigurationDetails(balanceSheetSectionID) {
        const result = await services.GetBalanceSheetSectionSetupConfigurationDetails(parseInt(BalanceSheetDetails.groupID.toString()), parseInt(BalanceSheetDetails.factoryID.toString()), parseInt(balanceSheetSectionID.toString()));
        return result;
    }

    async function GetAllChartOfAccountDetails() {
        let requestModel = {
            accountFilterText: BalanceSheetDetails.accountFilterText,
            accountFilterType: parseInt(BalanceSheetDetails.accountFilterType.toString()),
            factoryID: parseInt(BalanceSheetDetails.factoryID.toString()),
            groupID: parseInt(BalanceSheetDetails.groupID.toString())
        }

        const response = await services.GetAllLedgerAccountDetailsByFilters(requestModel);
        return response;
    }

    async function SaveBalanceSheetSetupDetails() {
        let requestModel = {
            groupID: parseInt(BalanceSheetDetails.groupID),
            factoryID: parseInt(BalanceSheetDetails.factoryID),
            balanceSheetSectionID: parseInt(BalanceSheetDetails.sectionName),
            createdBy: parseInt(tokenService.getUserIDFromToken()),
            linkedAccountList: not(RightNewArray, RightNewArrayAlreadyStoredAccounts),
            removedLinkedAccountList: RemovedLedgerAccountList
        }

        const response = await services.SaveBalanceSheetSetupDetails(requestModel)

        if (response.statusCode == "Success") {
            ClearAllArrays();
            alert.success(response.message);
            setTimeout(() => {
                navigate("/app/balanceSheet/balanceSheetReport")
            }, 2000)
        }
        else {
            alert.error(response.message);
        }
    }

    function cardTitle(titleName) {
        return (
            <Grid container spacing={1}>
                <Grid item md={10} xs={12}>
                    {titleName}
                </Grid>
                <Grid item md={2} xs={12}>
                    <PageHeader
                        onClick={handleClickNavigate}
                    />
                </Grid>
            </Grid>
        )
    }

    function ClearAllArrays() {
        setChecked([])
        setLeftNewArray([])
        setRightNewArray([])
        setRightNewArrayAlreadyStoredAccounts([])
        setRemovedLedgerAccountList([])
    }

    function generateDropDownMenu(data) {
        let items = []
        if (data != null) {
            for (const [key, value] of Object.entries(data)) {
                items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
            }
        }
        return items;
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setBalanceSheetDetails({
            ...BalanceSheetDetails,
            [e.target.name]: value
        });
    }

    function handleChangeAccountType(e) {
        const target = e.target;
        const value = target.value
        setBalanceSheetDetails({
            ...BalanceSheetDetails,
            [e.target.name]: value,
            accountFilterText: ""
        });
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page
                className={classes.root}
                title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            sectionName: BalanceSheetDetails.sectionName,
                        }}
                        validationSchema={
                            Yup.object().shape({
                                sectionName: Yup.number().required('Section Name is required').min("1", 'Section Name is required')
                            })
                        }
                        onSubmit={() => trackPromise(SaveBalanceSheetSetupDetails())}
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
                                                        <InputLabel shrink id="sectionName">
                                                            Section Name *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.sectionName && errors.sectionName)}
                                                            fullWidth
                                                            helperText={touched.sectionName && errors.sectionName}
                                                            name="sectionName"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => {
                                                                handleChange(e)
                                                                trackPromise(LoadSetupCofigurations(e))
                                                            }}
                                                            value={BalanceSheetDetails.sectionName}
                                                            variant="outlined"
                                                            id="sectionName"
                                                        >
                                                            <MenuItem value="0">--Select Section Name--</MenuItem>
                                                            {generateDropDownMenu(BalanceSheetSctionList)}
                                                        </TextField>
                                                    </Grid>

                                                </Grid>

                                                <br />

                                                {
                                                    RightNewArray.length > 0 || LeftNewArray.length > 0 ?
                                                        <Card>
                                                            <CardContent>
                                                                <Grid container spacing={3}>
                                                                    <Grid item md={6} xs={12}>
                                                                        <Grid container spacing={1}>
                                                                            <Grid item md={5} xs={12}>
                                                                                <TextField select
                                                                                    // error={Boolean(touched.sectionName && errors.sectionName)}
                                                                                    fullWidth
                                                                                    // helperText={touched.sectionName && errors.sectionName}
                                                                                    name="accountFilterType"
                                                                                    onBlur={handleBlur}
                                                                                    onChange={(e) => {
                                                                                        handleChangeAccountType(e)
                                                                                    }}
                                                                                    size='small'
                                                                                    value={BalanceSheetDetails.accountFilterType}
                                                                                    variant="outlined"
                                                                                    id="accountFilterType"
                                                                                >
                                                                                    <MenuItem value="0">All Acccounts</MenuItem>
                                                                                    <MenuItem value="4">Search By Account Type</MenuItem>
                                                                                    <MenuItem value="1">Search By Parent Headder</MenuItem>
                                                                                    <MenuItem value="2">Search By Child Headder</MenuItem>
                                                                                    <MenuItem value="3">Search By Ledger Headder</MenuItem>

                                                                                </TextField>
                                                                            </Grid>
                                                                            {
                                                                                BalanceSheetDetails.accountFilterType !== "0" ?
                                                                                    <Grid item md={5} xs={12}>
                                                                                        <TextField
                                                                                            variant="outlined"
                                                                                            fullWidth
                                                                                            name="accountFilterText"
                                                                                            id="accountFilterText"
                                                                                            label="Filtering Text" size="small"
                                                                                            value={BalanceSheetDetails.accountFilterText}
                                                                                            onChange={(e) => handleChange(e)}
                                                                                            disabled={BalanceSheetDetails.accountFilterType === "0"}
                                                                                        />
                                                                                    </Grid> : null
                                                                            }
                                                                            <Grid item md={1} xs={12}>
                                                                                <Tooltip title="Filter Account">
                                                                                    <IconButton
                                                                                        aria-label="filter"
                                                                                        onClick={() => trackPromise(SearchLedgerAccountList())}
                                                                                    >
                                                                                        <SearchIcon />
                                                                                    </IconButton>
                                                                                </Tooltip>
                                                                            </Grid>
                                                                        </Grid>
                                                                    </Grid>
                                                                </Grid>

                                                                <Grid container spacing={3}>
                                                                    <Grid item md={6} xs={12}>

                                                                    </Grid>
                                                                </Grid>

                                                                <Grid container spacing={3}>
                                                                    <Grid item md={5} xs={12} >
                                                                        <Typography variant='h5'>Chart Of Account</Typography> <br />
                                                                        {customList(LeftNewArray)}
                                                                    </Grid>
                                                                    <Grid item md={2} xs={12}>
                                                                        <Grid container direction="column" alignItems="center" style={{ marginTop: "30%" }}>
                                                                            {/* <Button
                                                                                variant="outlined"
                                                                                size="small"
                                                                                className={classes.button}
                                                                                onClick={handleAllRight}
                                                                                disabled={LeftNewArray.length === 0}
                                                                                aria-label="move all right"
                                                                            >
                                                                                ≫
                                                                            </Button> */}
                                                                            <Button
                                                                                variant="outlined"
                                                                                size="small"
                                                                                className={classes.button}
                                                                                onClick={handleCheckedRight}
                                                                                disabled={leftChecked.length === 0}
                                                                                aria-label="move selected right"
                                                                            >
                                                                                &gt;
                                                                            </Button>
                                                                            <Button
                                                                                variant="outlined"
                                                                                size="small"
                                                                                className={classes.button}
                                                                                onClick={handleCheckedLeft}
                                                                                disabled={rightChecked.length === 0}
                                                                                aria-label="move selected left"
                                                                            >
                                                                                &lt;
                                                                            </Button>
                                                                            {/* <Button
                                                                                variant="outlined"
                                                                                size="small"
                                                                                className={classes.button}
                                                                                onClick={handleAllLeft}
                                                                                disabled={RightNewArray.length === 0}
                                                                                aria-label="move all left"
                                                                            >
                                                                                ≪
                                                                            </Button> */}
                                                                        </Grid>
                                                                    </Grid>
                                                                    <Grid item md={5} xs={12}>
                                                                        <Typography variant='h5'>Linked Accounts</Typography> <br />
                                                                        {customList(RightNewArray)}
                                                                    </Grid>
                                                                </Grid>

                                                                <Box display="flex" flexDirection="row-reverse" p={2} >
                                                                    <Button
                                                                        color="primary"
                                                                        type="submit"
                                                                        variant="contained"
                                                                        disabled={RightNewArray.length === 0}
                                                                    >
                                                                        Save
                                                                    </Button>
                                                                </Box>
                                                            </CardContent>
                                                        </Card> : null
                                                }
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
    );
}
