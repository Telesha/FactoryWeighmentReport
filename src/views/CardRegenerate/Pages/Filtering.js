import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box, Card, Grid, TextField, makeStyles, Container, Button,
    CardContent, Divider, InputLabel, Switch, CardHeader,
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenDecoder from '../../../utils/tokenDecoder';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, MenuItem, Tooltip, Select } from '@material-ui/core';
import { Checkbox } from "@material-ui/core";
import { useAlert } from "react-alert";
import TokenDecoder from 'src/helpers/TokenDecoder';
import MaterialTable from "material-table";


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

    clearButton: {
        marginRight: 8,
    }

}));

const screenCode = 'EMPLOYEECARDREGENERATE';

export default function EmployeeCardRegenerate(props) {
    const [title, setTitle] = useState("Employee Card Regenerate")
    const [isDisableButton, setIsDisableButton] = useState(true);
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [estates, setEstates] = useState();
    const [divisions, setDivisions] = useState();
    const [empType, setEmpType] = useState();
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });
    const [saveData, setSaveData] = useState([]);
    const alert = useAlert();
    const [checkAll, setCheckAll] = useState(false);


    const selectAll = () => {
        setCheckAll(!checkAll);
    };

    const [cardRegenerateData, setCardRegenerateData] = useState([]);

    const [card, setCard] = useState({
        cardNumber: "",
        divisionID: "0",
        firstName: "",
        groupID: "0",
        nameToBePrinted: "",
        operationEntityID: "0",
        registrationNumber: "",
        empTypeID: "0",

    });
    const navigate = useNavigate();

    useEffect(() => {
        getPermission();
        trackPromise(
            GetAllGroups()
        )
    }, []);

    useEffect(() => {
        trackPromise(
            getEstateDetailsByGroupID()
        )
    }, [card.groupID]);

    useEffect(() => {
        if (card.operationEntityID > 0) {
            trackPromise(
                getDivisionDetailsByEstateID()
            )
        }
    }, [card.operationEntityID]);

    useEffect(() => {
        trackPromise(
            GetEmployeeTypesData()
        )
    }, []);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'EMPLOYEECARDREGENERATE');

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

        setCard({
            ...card,
            groupID: parseInt(tokenDecoder.getGroupIDFromToken()),
            operationEntityID: parseInt(tokenDecoder.getFactoryIDFromToken())
        })
    }

    async function GetAllGroups() {
        const result = await services.GetAllGroups();
        setGroups(result);
    }

    async function getEstateDetailsByGroupID() {
        var result = await services.getEstateDetailsByGroupID(card.groupID);
        setEstates(result);
    }

    async function getDivisionDetailsByEstateID() {
        const result = await services.getDivisionDetailsByEstateID(card.operationEntityID);
        setDivisions(result);
    }

    async function SearchData(card){
        const response = await services.getCardRegenerateDetails(card.groupID,card.operationEntityID,card.divisionID, card.empTypeID);
            if (response != null) {
                setCardRegenerateData(response);
          
            if (response.length == 0) {
                alert.error("No records to display");
            }
            }
            else {
            alert.error("Error");
            }
    }

    async function GetEmployeeTypesData() {
        const result = await services.GetEmployeeTypesData();
        setEmpType(result);
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

    function handleGroupChange(e) {
        const target = e.target;
        const value = target.value;

        setCard({
            ...card,
            groupID: parseInt(value),
            divisionID: "0",
            empTypeID: "0",
        });
    }


    function handleChange1(e) {
        const target = e.target;
        const value = target.value;

        setCard({
            ...card,
            [e.target.name]: parseInt(value)
        });
    }

    function handleClick(data) {
        var token = tokenDecoder.getUserIDFromToken();
        let cardData = {
            cardID: data.cardID,
            modifiedBy: parseInt(token),
        };

        let dataRecords = [...saveData];

        var isEnable = dataRecords.find((p) => p.cardID == data.cardID);
        if (isEnable === undefined) {
            dataRecords.push(cardData);
        } else {
            var index = dataRecords.indexOf(isEnable);
            dataRecords.splice(index, 1);
        }
        setSaveData(dataRecords);
        setIsDisableButton(false);

    }

    async function handleSave(e) {
        const response = await services.updateCard(saveData);
        setIsDisableButton(true);

        if (saveData.length > 1) {
            alert.success("Cards Regenerated Successfully");
        }
        else
            if (saveData.length == 1) {
                alert.success(response.message);
            }
        const array = [...cardRegenerateData];
        const newArray = array.filter((item) => !saveData.some((saveItem) => saveItem.cardID === item.cardID));
        setCardRegenerateData(newArray)
    }

    function handleClickAll(e) {
        var token = tokenDecoder.getUserIDFromToken();
        var cardDataCopy = [...saveData];

        if (e.target.checked) {
            cardRegenerateData.forEach((x) => {
                let cardData = {
                    cardID: x.cardID,
                    modifiedBy: parseInt(token),
                };
                var isEnable = cardDataCopy.find((p) => p.cardID == x.cardID);
                if (isEnable === undefined) {
                    cardDataCopy.push(cardData);
                }
            });
            setSaveData(cardDataCopy);
        } else {
            setSaveData([]);
        }
        setIsDisableButton(false);
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

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                    >
                        {({
                            errors,
                            handleBlur,
                            handleSubmit,
                            handleChange,
                            isSubmitting,
                            touched,
                            values,
                            props
                        }) => (
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
                                                        Group *
                                                    </InputLabel>
                                                    <TextField
                                                        select
                                                        fullWidth
                                                        name="groupID"
                                                        onChange={(e) => handleGroupChange(e)}
                                                        value={card.groupID}
                                                        variant="outlined"
                                                        id="groupID"
                                                        size="small"
                                                    >
                                                        <MenuItem value="0">--Select Group--</MenuItem>
                                                        {generateDropDownMenu(groups)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="operationEntityID">
                                                        Garden *
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="operationEntityID"
                                                        onChange={(e) => handleChange1(e)}
                                                        value={card.operationEntityID}
                                                        variant="outlined"
                                                        id="operationEntityID"
                                                        size="small"
                                                    >
                                                        <MenuItem value="0">--Select Garden--</MenuItem>
                                                        {generateDropDownMenu(estates)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="divisionID">
                                                        Cost Center *
                                                    </InputLabel>
                                                    <TextField
                                                        error={Boolean(touched.divisionID && errors.divisionID)}
                                                        helperText={touched.divisionID && errors.divisionID}
                                                        select
                                                        fullWidth
                                                        name="divisionID"
                                                        onChange={(e) => handleChange1(e)}
                                                        value={card.divisionID}
                                                        variant="outlined"
                                                        id="divisionID"
                                                        size="small"
                                                    >
                                                        <MenuItem value="0">--Select Cost Center--</MenuItem>
                                                        {generateDropDownMenu(divisions)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="empTypeID">
                                                        Employee Type *
                                                    </InputLabel>
                                                    <TextField
                                                        error={Boolean(touched.empTypeID && errors.empTypeID)}
                                                        helperText={touched.empTypeID && errors.empTypeID}
                                                        select
                                                        fullWidth
                                                        name="empTypeID"
                                                        onChange={(e) => handleChange1(e)}
                                                        value={card.empTypeID}
                                                        variant="outlined"
                                                        id="empTypeID"
                                                        size="small"
                                                    >
                                                        <MenuItem value="0">--Select Employee Type--</MenuItem>
                                                        {generateDropDownMenu(empType)}
                                                    </TextField>
                                                </Grid>
                                            </Grid>
                                            <Box display="flex" flexDirection="row-reverse" p={2}>
                                                <Button
                                                    color="primary"
                                                    type="submit"
                                                    variant="contained"
                                                    onClick={() => trackPromise(SearchData(card))}
                                                >
                                                    Search
                                                </Button>
                                            </Box>
                                        </CardContent>
                                        <Box minWidth={1000}>
                                            <MaterialTable
                                                title=""
                                                columns={[
                                                    {
                                                        title: (
                                                            <label>
                                                                <Checkbox
                                                                    color="primary"
                                                                    onClick={(e) => handleClickAll(e)}
                                                                    onChange={selectAll}
                                                                    checked={cardRegenerateData.length != 0 && saveData.length == cardRegenerateData.length}
                                                                ></Checkbox>
                                                                Select All
                                                            </label>
                                                        ),
                                                        sorting: false,
                                                        field: "select",
                                                        type: "boolean",
                                                        render: (data) => (
                                                            <Checkbox
                                                                color="primary"
                                                                onClick={() => handleClick(data)}
                                                                checked={!(saveData.find((x) => x.cardID == data.cardID) == undefined)}
                                                            ></Checkbox>
                                                        ),
                                                    },
                                                    { title: 'Card Number', field: 'cardNumber' },
                                                    { title: 'Card ID', field: 'cardID'},
                                                    { title: 'Emp ID', field: 'employeeID'},
                                                    { title: 'Registration Number', field: 'registrationNumber' },
                                                    { title: 'First Name', field: 'firstName' },
                                                ]}
                                                data={cardRegenerateData}
                                            />
                                        </Box>
                                        <Box display="flex" justifyContent="flex-end" p={2}>
                                            <Button
                                                color="primary"
                                                type="submit"
                                                variant="contained"
                                                size='small'
                                                disabled={isDisableButton}
                                                onClick={(e) => trackPromise(handleSave(e))}
                                            >
                                                Regenerate
                                            </Button>
                                        </Box>
                                    </PerfectScrollbar>
                                </Card>
                            </Box>
                        )}
                    </Formik>
                </Container>
            </Page>
        </Fragment >
    );
};
