import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Grid, Box, Card, MenuItem, Button,
    makeStyles, Container, CardHeader, Divider, CardContent, InputLabel, TextField,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import permissionService from "../../../utils/permissionAuth";
import { LoadingComponent } from '../../../utils/newLoader';
import { Formik } from 'formik';
import * as Yup from "yup";
import tokenService from '../../../utils/tokenDecoder';
import { useAlert } from "react-alert";
import Paper from '@material-ui/core/Paper';

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
    table: {
        minWidth: 650,
    },
    paper: {
        backgroundColor: "#424242",
    },
}));

const screenCode = 'OPENINGBALANCE';

export default function OpeningBalance(probs) {

    const classes = useStyles();
    const alert = useAlert();
    const navigate = useNavigate();
    const [title, setTitle] = useState("Opening Balance")
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [accountTypeNames, setAccountTypeNames] = useState();
    const [parentHeaderNames, setParentHeaderNames] = useState();
    const [childHeaderNames, setChildHeaderNames] = useState();
    const [searchParamList, setSearchParamList] = useState({
        groupID: 0,
        factoryID: 0,
        accountTypeID: 0,
        parentHeaderID: 0,
        childHeaderID: 0,
        transactionTypeID: 0,
        balance: ''
    })
    const [ledgerAccounts, setLedgerAccounts] = useState([]);
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });

    useEffect(() => {
        trackPromise(
            getPermissions()
        )
    }, []);

    useEffect(() => {
        if (searchParamList.groupID != 0) {
            trackPromise(
                getFactoriesForDropdown(searchParamList.groupID)
            );
        }
    }, [searchParamList.groupID])

    useEffect(() => {
        trackPromise(getAccountTypeNamesForDropdown());

    }, [searchParamList.factoryID]);

    useEffect(() => {
        trackPromise(getParentHeadersByAccountTypeID(searchParamList.accountTypeID));

    }, [searchParamList.accountTypeID]);

    useEffect(() => {
        trackPromise(getChildHeadersByParentTypeID(searchParamList.parentHeaderID));

    }, [searchParamList.parentHeaderID]);

    async function getPermissions() {
        var permissions = await permissionService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWOPENINGBALANCE');

        if (isAuthorized === undefined) {
            navigate('/app/unauthorized');
        }

        var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
        });

        setSearchParamList({
            ...searchParamList,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })

        getGroupsForDropdown();
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getFactoriesForDropdown(groupID) {
        const factories = await services.getAllFactoriesByGroupID(groupID);
        setFactories(factories);
    }

    async function getAccountTypeNamesForDropdown() {
        const accounts = await services.getAccountTypeNamesForDropdown(
            searchParamList.groupID,
            searchParamList.factoryID
        );
        setAccountTypeNames(accounts);
    }

    async function getParentHeadersByAccountTypeID(id) {
        const parent = await services.getParentHeadersByAccountTypeID(id);
        setParentHeaderNames(parent);
    }
    async function getChildHeadersByParentTypeID(id) {
        const parent = await services.getChildHeadersByParentTypeID(id);
        setChildHeaderNames(parent);
    }

    async function handleSave() {

        const result = ledgerAccounts.filter(x => (x.transactionTypeID != undefined || x.balance != undefined) && (x.transactionTypeID > 0))
        let model = {
            groupID: parseInt(searchParamList.groupID),
            factoryID: parseInt(searchParamList.factoryID),
            accountTypeID: parseInt(searchParamList.accountTypeID),
            parentHeaderID: parseInt(searchParamList.parentHeaderID),
            childHeaderID: parseInt(searchParamList.childHeaderID),
            openingBalanceListModel: result,
            modifiedBy: tokenService.getUserIDFromToken()
        }

        const response = await services.updateOpeningBalance(model);

        if (response.statusCode == "Success") {
            alert.success(response.message);
            clearTable();
            ClearFields();
        }
        else {
            alert.error(response.message);
        }
    }

    function handleGroupChange(e) {
        const target = e.target;
        const value = target.value
        setSearchParamList({
            ...searchParamList,
            groupID: value,
            factoryID: 0
        });
        clearTable()
    }

    function handleFactoryChange(e) {
        const target = e.target;
        const value = target.value
        setSearchParamList({
            ...searchParamList,
            factoryID: value,
            registrationNumber: ''
        });
        clearTable();
    }

    function handleChangeTypes(target, ledgerAccountID) {
        const value = target.value
        const name = target.name

        const newArr = [...ledgerAccounts];
        var idx = newArr.findIndex(e => e.ledgerAccountID == parseInt(ledgerAccountID));
        newArr[idx] = { ...newArr[idx], [name]: value == "" ? parseFloat(0) : parseFloat(value) };
        setLedgerAccounts(newArr)


    }

    function handleChangeEvnt(target, ledgerAccountID) {
        const value = target.value
        const name = target.name

        const newArr = [...ledgerAccounts];
        var idx = newArr.findIndex(e => e.ledgerAccountID == parseInt(ledgerAccountID));
        newArr[idx] = { ...newArr[idx], [name]: value == "" ? parseFloat(0) : parseFloat(value) };
        setLedgerAccounts(newArr)
    }

    function handleChangeAccount(e) {
        const target = e.target;
        const value = target.value;

        setSearchParamList({
            ...searchParamList,
            accountTypeID: value,
            parentHeaderID: 0,
            childHeaderID: 0
        });
        clearTable();
    }


    function handleChangeParnet(e) {
        const target = e.target;
        const value = target.value;

        setSearchParamList({
            ...searchParamList,
            parentHeaderID: value,
            childHeaderID: 0
        });
    }


    function handleChangeChild(e) {
        const target = e.target;
        const value = target.value;

        setSearchParamList({
            ...searchParamList,
            childHeaderID: value,
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

    async function GetAccountDetails() {
        var result = await services.GetAccountDetails(searchParamList);
        if (result.statusCode == "Success" && result.data != null) {
            setLedgerAccounts(result.data);
        }
        else {
            alert.error('No records to display');
        }
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

    function ClearFields() {
        setSearchParamList({
            ...searchParamList,
            accountTypeID: 0,
            parentHeaderID: 0,
            childHeaderID: 0
        })
    }

    function clearTable() {
        setLedgerAccounts([]);
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: searchParamList.groupID,
                            factoryID: searchParamList.factoryID,
                            accountTypeID: searchParamList.accountTypeID,
                            parentHeaderID: searchParamList.parentHeaderID,
                            childHeaderID: searchParamList.childHeaderID,
                            transactionTypeID: searchParamList.transactionTypeID,
                            balance: searchParamList.balance
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().min(1, "Please Select a Group").required('Group is required'),
                                factoryID: Yup.number().min(1, "Please Select a Factory").required('Factory is required'),
                                accountTypeID: Yup.number().min(1, "Please Select a Account Type").required('Account Type is required'),
                                parentHeaderID: Yup.number().min(1, "Please Select a Parent Header").required('Parent Header is required'),
                                childHeaderID: Yup.number().min(1, "Please Select a Child Header").required('Child Header is required'),
                                //registrationNumber: Yup.string().required('registration number is required').typeError('Enter valid registration number').matches(/^[0-9]{0,15}$/, 'Please enter valid registration number')
                            })
                        }
                        enableReinitialize
                        onSubmit={() => trackPromise(GetAccountDetails())}
                    >
                        {({
                            errors,
                            handleBlur,
                            handleSubmit,
                            touched,
                        }) => (
                            <form onSubmit={handleSubmit}>
                                <Box mt={0}>
                                    <Card>
                                        <CardHeader
                                            title={cardTitle(title)}
                                        />
                                        <PerfectScrollbar>
                                            <Divider />
                                            <CardContent style={{ marginBottom: "2rem" }}>
                                                <Grid container spacing={2}>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="groupID">
                                                            Group *
                                                        </InputLabel>
                                                        <TextField select
                                                            size='small'
                                                            error={Boolean(touched.groupID && errors.groupID)}
                                                            fullWidth
                                                            helperText={touched.groupID && errors.groupID}
                                                            name="groupID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => {
                                                                handleGroupChange(e)
                                                            }}
                                                            value={searchParamList.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            InputProps={{
                                                                readOnly: !permissionList.isGroupFilterEnabled,
                                                            }}
                                                        >
                                                            <MenuItem value={'0'} disabled={true}>
                                                                --Select Group--
                                                            </MenuItem>
                                                            {generateDropDownMenu(groups)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="groupID">
                                                            Factory *
                                                        </InputLabel>
                                                        <TextField select
                                                            size='small'
                                                            error={Boolean(touched.factoryID && errors.factoryID)}
                                                            fullWidth
                                                            helperText={touched.factoryID && errors.factoryID}
                                                            name="factoryID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => {
                                                                handleFactoryChange(e)
                                                            }}
                                                            value={searchParamList.factoryID}
                                                            variant="outlined"
                                                            id="factoryID"
                                                            InputProps={{
                                                                readOnly: !permissionList.isFactoryFilterEnabled,
                                                            }}
                                                        >
                                                            <MenuItem value={'0'} disabled={true}>
                                                                --Select Factory--
                                                            </MenuItem>
                                                            {generateDropDownMenu(factories)}
                                                        </TextField>
                                                    </Grid>

                                                </Grid>
                                                <Grid container spacing={2}>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="accountTypeID">
                                                            Account Type Name *
                                                        </InputLabel>

                                                        <TextField
                                                            select
                                                            error={Boolean(
                                                                touched.accountTypeID && errors.accountTypeID
                                                            )}
                                                            helperText={
                                                                touched.accountTypeID && errors.accountTypeID
                                                            }
                                                            onBlur={handleBlur}
                                                            name="accountTypeID"
                                                            onChange={e => handleChangeAccount(e)}
                                                            value={searchParamList.accountTypeID}
                                                            variant="outlined"
                                                            id="accountTypeID"
                                                            size="small"
                                                            fullWidth
                                                        >
                                                            <MenuItem value="0">
                                                                --Select Account Type Name--
                                                            </MenuItem>
                                                            {generateDropDownMenu(accountTypeNames)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}  >
                                                        <InputLabel shrink id="parentHeaderID">
                                                            Parent Header *
                                                        </InputLabel>

                                                        <TextField
                                                            select
                                                            error={Boolean(
                                                                touched.parentHeaderID && errors.parentHeaderID
                                                            )}
                                                            helperText={
                                                                touched.parentHeaderID && errors.parentHeaderID
                                                            }
                                                            onBlur={handleBlur}
                                                            name="parentHeaderID"
                                                            onChange={e => handleChangeParnet(e)}
                                                            value={searchParamList.parentHeaderID}
                                                            variant="outlined"
                                                            id="parentHeaderID"
                                                            size="small"
                                                            fullWidth
                                                        >
                                                            <MenuItem value="0">
                                                                --Select Parent Header--
                                                            </MenuItem>
                                                            {generateDropDownMenu(parentHeaderNames)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}   >
                                                        <InputLabel shrink id="childHeaderID">
                                                            Child Header *
                                                        </InputLabel>

                                                        <TextField
                                                            select
                                                            error={Boolean(
                                                                touched.childHeaderID && errors.childHeaderID
                                                            )}
                                                            helperText={
                                                                touched.childHeaderID && errors.childHeaderID
                                                            }
                                                            onBlur={handleBlur}
                                                            name="childHeaderID"
                                                            onChange={e => handleChangeChild(e)}
                                                            value={searchParamList.childHeaderID}
                                                            variant="outlined"
                                                            id="childHeaderID"
                                                            size="small"
                                                            fullWidth
                                                        >
                                                            <MenuItem value="0">--Select Child Header--</MenuItem>
                                                            {generateDropDownMenu(childHeaderNames)}
                                                        </TextField>
                                                    </Grid>
                                                    <br></br>
                                                    <Grid container justify="flex-end">
                                                        <Box pr={2}>
                                                            <Button
                                                                size='small'
                                                                color="primary"
                                                                variant="contained"
                                                                type='submit'
                                                            >
                                                                Search
                                                            </Button>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                                <br></br>
                                                <br></br>
                                                {ledgerAccounts.length > 0 ?
                                                    <Card>
                                                        <TableContainer component={Paper} >
                                                            <Table className={classes.table} aria-label="simple table">
                                                                <TableHead>
                                                                    <TableRow>
                                                                        <TableCell align={'center'}>Ledger Account</TableCell>
                                                                        <TableCell align={'center'}>Transaction Type</TableCell>
                                                                        <TableCell align={'center'}>Opening Balance</TableCell>
                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                    {ledgerAccounts.map((data, index) => (
                                                                        <TableRow key={index}>
                                                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                {data.ledgerAccountName}
                                                                            </TableCell>
                                                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>

                                                                                <TextField
                                                                                    select
                                                                                    fullWidth
                                                                                    name="transactionTypeID"
                                                                                    onBlur={handleBlur}
                                                                                    onChange={(e) => handleChangeTypes(e.target, data.ledgerAccountID)}
                                                                                    value={data.transactionTypeID == null ? "0" : data.transactionTypeID}
                                                                                    variant="outlined"
                                                                                    id="transactionTypeID"
                                                                                    size="small"
                                                                                >
                                                                                    <MenuItem value="0">--Select Type--</MenuItem>
                                                                                    <MenuItem value="1"> Debit </MenuItem>
                                                                                    <MenuItem value="2"> Credit </MenuItem>

                                                                                </TextField>
                                                                            </TableCell>
                                                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                <TextField
                                                                                    size='small'
                                                                                    label="Opening Balance"
                                                                                    name="balance"
                                                                                    type='number'
                                                                                    value={data.balance == null ? "" : data.balance}
                                                                                    onBlur={handleBlur}
                                                                                    onChange={(e) => handleChangeEvnt(e.target, data.ledgerAccountID)}
                                                                                    variant="outlined"
                                                                                    id="balance"
                                                                                >
                                                                                </TextField>
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </TableContainer>
                                                        <Box display="flex" justifyContent="flex-end" p={2}>
                                                            <Button
                                                                color="primary"
                                                                type="button"
                                                                variant="contained"
                                                                size="small"
                                                                onClick={(event) => trackPromise(handleSave(event))}
                                                            >
                                                                Update
                                                            </Button>
                                                        </Box>
                                                    </Card>
                                                    : null}
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