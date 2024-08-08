import React, { useState, useEffect, Fragment } from 'react';
import {
    Tabs,
    Tab,
    AppBar,
    makeStyles,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    TextField,
    Card,
    Grid,
    Box,
    InputLabel,
    MenuItem,
    CardContent
} from '@material-ui/core';

import { TabPanel } from '../Utils/tabPanel';
import { Overview } from '../TabPages/TabOverview/TabOverview';
import { DetailView } from '../TabPages/TabDetailView/TabDetailView';
import ArrowDropDownCircleIcon from '@material-ui/icons/ArrowDropDownCircle';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

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
    tabBarBackround: {
        backgroundColor: "white"
    },
    tabTitle: {
        color: "black",
        maxWidth: "20rem"
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
    },
    column: {
        flexBasis: '33.33%',
    },

}));

export const UserStatisticsExportComponentContainer = ({
    AdvancedTakenData,
    TotalLeafCountComponentData,
    AverageMonthlyIncomeComponetData,
    UserBiometricDetailss,
    CustomerOverAllViewComponentData,
    TotalLeaftChartComponentData,
    CustomerRelatedAccountList,
    getUserAccountDetails,
    DefaultSelectAccount,
    customerHistoryData,
    GetTransactionDetailsByType,
    IsDefaultAccount,
    SelectedMonth,
    setSelectedMonth,
    CoveredArea,
    SelectedTransactionType,
    setSelectedTransactionType,
    TransactionTypes,
    NumberOfLeafCollectedDays,
    TotalLeafBarChartComponentData
}) => {

    const classes = useStyles();
    const [value, setValue] = React.useState(0);
    const [SelectedAccountNumber, setSelectedAccountNumber] = useState('');
    const [HideUserFields, setHideUserFields] = useState(false);
    const [AccordianTitle, setAccordianTitle] = useState("Please Expand to View Customer Statistics");

    const handleChangeRadio = (event) => {
        setSelectedMonth(event.target.value);
    };

    const defaultDropdownValue = () => {
        if (DefaultSelectAccount !== null) {
            setSelectedAccountNumber(DefaultSelectAccount)
        }
    }
    useEffect(() => {
        if (DefaultSelectAccount !== null) {
            setSelectedAccountNumber(DefaultSelectAccount)
        }
    }, [DefaultSelectAccount])

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    useEffect(() => {
        if (SelectedAccountNumber !== '') {
            getUserAccountDetails(SelectedAccountNumber)
        }
    }, [SelectedAccountNumber])

    function generateDropDownMenu(data) {
        let items = []
        if (data != null) {
            for (const [key, value] of Object.entries(data)) {
                items.push(<MenuItem key={key} value={value["registrationNumber"]}>{value["registrationNumber"]}</MenuItem>);
            }
        }
        return items
    }

    function toggleUserFields(expanded) {
        setHideUserFields(!HideUserFields);
        if (expanded === false) {
            setAccordianTitle("Please Expand to View Customer Statistics")
        } else {
            setAccordianTitle("Customer Statistics")
        }
    };

    return (

        <Accordion
            defaultExpanded={false}
            onChange={(e, expanded) => {
                toggleUserFields(expanded)
            }}
        >
            <AccordionSummary
                expandIcon={
                    <ArrowDropDownCircleIcon
                        color="primary"
                        fontSize="large"
                    />
                }
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <div className={classes.column}>
                    <Typography
                        color="textPrimary"
                        variant="h5"
                    >
                        {AccordianTitle}
                    </Typography>
                </div>
            </AccordionSummary>

            <Box display="flex" justifyContent="flex-end" p={2}>
                <Grid container spacing={2}>
                    <Grid item xs={4}>
                        <InputLabel shrink id="groupID">
                            Accounts
                        </InputLabel>

                        <TextField select
                            fullWidth
                            name="groupID"
                            variant="outlined"
                            id="groupID"
                            value={SelectedAccountNumber}
                            onChange={(e) => {
                                setSelectedAccountNumber(e.target.value)
                            }}
                        >
                            <MenuItem value={'0'} disabled={true}> --Select Account-- </MenuItem>
                            {generateDropDownMenu(CustomerRelatedAccountList)}
                        </TextField>
                    </Grid>
                    <Grid item xs={8}>
                        <Card style={{ marginTop: '1rem', minHeight: '3.5rem', maxHeight: '3.5rem', padding: 0 }}>
                            <CardContent style={{ padding: 0, paddingTop: '0.5rem' }}>
                                <FormControl>
                                    <RadioGroup aria-label="month" name="monthList" value={SelectedMonth} onChange={handleChangeRadio}>
                                        <Grid container spacing={3}>
                                            <Grid item >
                                                <FormControlLabel value="Last_6_months" control={<Radio />} label="Last 6 months" />
                                            </Grid>
                                            <Grid item >
                                                <FormControlLabel value="Last_3_Months" control={<Radio />} label="Last 3 Months" />
                                            </Grid>
                                            <Grid item >
                                                <FormControlLabel value="Previous_Month" control={<Radio />} label="Previous Month" />
                                            </Grid>
                                            <Grid item >
                                                <FormControlLabel value="Current_Month" control={<Radio />} label="Current Month" />
                                            </Grid>
                                        </Grid>
                                    </RadioGroup>
                                </FormControl>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>

            <AccordionDetails>
                <div style={{ width: '100%' }}>
                    <AppBar position="static">
                        <Tabs
                            indicatorColor="primary"
                            value={value}
                            onChange={handleChange}
                            variant={'fullWidth'}
                            className={classes.tabBarBackround}
                        >
                            <Tab label="Overview" className={classes.tabTitle} />
                            <Tab label="Detail View" className={classes.tabTitle} />
                        </Tabs>
                    </AppBar>
                    <TabPanel value={value} index={0} >
                        <Overview
                            AdvancedTakenComponentData={AdvancedTakenData}
                            TotalLeafCountComponentData={TotalLeafCountComponentData}
                            AverageMonthlyIncomeComponetData={AverageMonthlyIncomeComponetData}
                            UserBiometricDetails={UserBiometricDetailss}
                            CustomerOverallViewComponentData={CustomerOverAllViewComponentData}
                            TotalLeafChartComponentData={TotalLeaftChartComponentData}
                            IsDefaultAccount={IsDefaultAccount}
                            CoveredArea={CoveredArea}
                            NumberOfLeafCollectedDays={NumberOfLeafCollectedDays}
                            TotalLeafBarChartComponentData={TotalLeafBarChartComponentData}
                        />
                    </TabPanel>
                    <TabPanel value={value} index={1} >
                        <DetailView
                            CustomerHistoryData={customerHistoryData}
                            GetTransactionDetailsByType={GetTransactionDetailsByType}
                            IsDefaultAccount={IsDefaultAccount}
                            SelectedTransactionType={SelectedTransactionType}
                            setSelectedTransactionType={setSelectedTransactionType}
                            TransactionTypes={TransactionTypes}
                        />
                    </TabPanel>
                </div>
            </AccordionDetails>
        </Accordion>
    )
}