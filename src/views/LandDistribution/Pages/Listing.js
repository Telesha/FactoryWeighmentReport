import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Grid, Box, Card, makeStyles, Container, CardHeader, Divider } from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import { TextField, CardContent } from '@material-ui/core';
import SearchNotFound from 'src/views/Common/SearchNotFound';
import { CustomTable } from './CustomTable';
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
    }

}));

var screenCode = "LANDDISTRIBUTION"
export default function ViewLandDistribution() {
    const classes = useStyles();

    const [groupData, setGroupData] = useState([]);
    const [factoryData, setFactoryData] = useState([]);
    const [landDistribution, setLandDistribution] = useState({
        groupID: '0',
        operationEntityID: '0'
    });
    const [landDistributionData, setLandDistributionData] = useState([]);
    const [landDistributionID, setLandDistributionID] = useState(0);
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [totalGrantArea, setTotalGrantArea] = useState(0);
    const [excel, setExcel] = useState(false);
    const [IDDataForDefaultLoad, setIsIDDataForDefaultLoad] = useState(null);
    const navigate = useNavigate();

    let encrypted = "";
    const handleClick = () => {
        encrypted = btoa('0');
        let model = {
            groupID: parseInt(landDistribution.groupID),
            operationEntityID: parseInt(landDistribution.operationEntityID)
        }
        sessionStorage.setItem(
            'landDistribution-listing-page-search-parameters-id',
            JSON.stringify(model)
        );
        navigate('/app/landDistribution/addedit/' + encrypted);
    }

    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
        isAddEditScreen: false
    });

    const [totalValues, setTotalValues] = useState({
        totalArea: 0
    });

    const differenceTotal = totalGrantArea - totalValues.totalArea;

    useEffect(() => {
        const IDdata = JSON.parse(
            sessionStorage.getItem('landDistribution-listing-page-search-parameters-id')
        );
        getPermission(IDdata);
    }, []);

    useEffect(() => {
        sessionStorage.removeItem(
            'landDistribution-listing-page-search-parameters-id'
        );
    }, []);

    useEffect(() => {
        trackPromise(
            GetAllGroups()
        );
    }, []);

    useEffect(() => {
        if (landDistributionID != 0) {
            handleClickEdit(landDistributionID)
        }
    }, [landDistributionID]);

    useEffect(() => {
        if (excel == true) {
            createFile()
        }
    }, [excel]);

    useEffect(() => {
        trackPromise(
            getEstateDetailsByGroupID()
        )
    }, [landDistribution.groupID]);

    useEffect(() => {
        trackPromise(
            GetGrantAreaByOperationEntityID()
        )
    }, [landDistribution.operationEntityID]);

    useEffect(() => {
        trackPromise(
            GetLandDistributionsByGroupIDOperationEntityID()
        )
    }, [landDistribution.groupID, landDistribution.operationEntityID]);

    useEffect(() => {
        if (IDDataForDefaultLoad != null) {
            GetLandDistributionsByGroupIDOperationEntityID();
        }
    }, [IDDataForDefaultLoad]);

    useEffect(() => {
        if (landDistributionData.length != 0) {
            calculateTotal()
        }
    }, [landDistributionData]);

    async function getPermission(IDdata) {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWLANDDISTRIBUTION');

        if (isAuthorized === undefined) {
            navigate('/404');
        }
        var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');
        var isAddEditScreen = permissions.find(p => p.permissionCode == 'ADDEDITLANDDISTRIBUTION');

        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
            isAddEditScreen: isAddEditScreen !== undefined
        });

        const isInitialLoad = IDdata === null
        if (isInitialLoad) {
            setLandDistribution({
                ...landDistribution,
                groupID: parseInt(tokenService.getGroupIDFromToken()),
                operationEntityID: parseInt(tokenService.getFactoryIDFromToken())
            })
        }
        else {
            setLandDistribution({
                ...landDistribution,
                groupID: IDdata.groupID,
                operationEntityID: IDdata.operationEntityID
            })
            setIsIDDataForDefaultLoad(IDdata);
        }
    }

    async function GetAllGroups() {
        const result = await services.GetAllGroups();
        setGroupData(result);
    }

    async function getEstateDetailsByGroupID() {
        var result = await services.getEstateDetailsByGroupID(landDistribution.groupID);
        setFactoryData(result);
    }

    async function GetLandDistributionsByGroupIDOperationEntityID() {
        var result = await services.GetLandDistributionsByGroupIDOperationEntityID(landDistribution.groupID, landDistribution.operationEntityID);
        setLandDistributionData(result);
    }

    async function GetGrantAreaByOperationEntityID() {
        const result = await services.GetGrantAreaByOperationEntityID(landDistribution.operationEntityID);
        setTotalGrantArea(result.grantArea);
    }

    function calculateTotal() {
        const totalArea = landDistributionData.reduce((accumulator, current) => accumulator + current.area, 0);
        setTotalValues({
            ...totalValues,
            totalArea: totalArea
        })
    }

    function handleGroupChange(e) {
        const target = e.target;
        const value = target.value
        setLandDistribution({
            ...landDistribution,
            [e.target.name]: value,
            operationEntityID: "0"
        });
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
        setLandDistribution({
            ...landDistribution,
            [e.target.name]: value
        });
    }

    const handleClickEdit = (landDistributionID) => {
        encrypted = btoa(landDistributionID.toString());
        let model = {
            groupID: parseInt(landDistribution.groupID),
            operationEntityID: parseInt(landDistribution.operationEntityID)
        }
        sessionStorage.setItem(
            'landDistribution-listing-page-search-parameters-id',
            JSON.stringify(model)
        );
        navigate('/app/landDistribution/addedit/' + encrypted);
    }

    function cardTitle(titleName) {
        return (
            <Grid container spacing={1}>
                <Grid item md={10} xs={12}>
                    {titleName}
                </Grid>
                <Grid item md={2} xs={12}>
                    {permissionList.isAddEditScreen == true ?
                        <PageHeader
                            onClick={handleClick}
                            isEdit={true}
                            toolTiptitle={"Add Land Distribution"}
                        />
                        : null}
                </Grid>
            </Grid>
        )
    }

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            array.map(x => {
                var vr = {
                    'Business Division': x.groupName,
                    'Location': x.factoryName,
                    'Land Description': x.landDescription,
                    'Print Priority': x.printPriority,
                    'Area': x.area
                }
                res.push(vr);
            });

            var vr = {
                'Business Division': 'Total',
                'Area': totalValues.totalArea
            }
            res.push(vr);
        }
        return res;
    }

    async function createFile() {
        setExcel(false);
        var file = await createDataForExcel(landDistributionData);
        var settings = {
            sheetName: 'Land Distribution',
            fileName: 'Land Distribution Details',
            writeOptions: {}
        }

        let keys = Object.keys(file[0])
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem })
        })

        let dataA = [
            {
                sheet: 'Land Distribution Details',
                columns: tempcsvHeaders,
                content: file
            }
        ]
        xlsx(dataA, settings);
    }

    return (
        <Page
            className={classes.root}
            title="Land Distribution"
        >
            <Container maxWidth={false}>
                <Box mt={0}>
                    <Card>
                        <CardHeader
                            title={cardTitle("Land Distribution")}
                        />
                        <PerfectScrollbar>
                            <Divider />
                            <CardContent style={{ marginBottom: "2rem" }}>
                                <Grid container spacing={3}>
                                    <Grid item md={4} xs={12}>
                                        <InputLabel shrink id="groupID">
                                            Business Division 
                                        </InputLabel>
                                        <TextField select
                                            fullWidth
                                            name="groupID"
                                            onChange={(e) => handleGroupChange(e)}
                                            size='small'
                                            value={landDistribution.groupID}
                                            variant="outlined"
                                            InputProps={{
                                                readOnly: !permissionList.isGroupFilterEnabled ? true : false
                                            }}
                                        >
                                            <MenuItem value="0">--Select All Business Division--</MenuItem>
                                            {generateDropDownMenu(groupData)}
                                        </TextField>
                                    </Grid>

                                    <Grid item md={4} xs={12}>
                                        <InputLabel shrink id="operationEntityID">
                                            Location 
                                        </InputLabel>
                                        <TextField select
                                            fullWidth
                                            name="operationEntityID"
                                            onChange={(e) => handleChange(e)}
                                            size='small'
                                            value={landDistribution.operationEntityID}
                                            variant="outlined"
                                            id="operationEntityID"
                                            InputProps={{
                                                readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                            }}
                                        >
                                            <MenuItem value="0">--Select All Location--</MenuItem>
                                            {generateDropDownMenu(factoryData)}
                                        </TextField>
                                    </Grid>
                                </Grid>
                            </CardContent>
                            {landDistributionData.length > 0 ?
                                <CustomTable totalGrantArea={totalGrantArea} landDistributionData={landDistributionData} setLandDistributionID={setLandDistributionID} setExcel={setExcel} totalArea={totalValues.totalArea} differenceTotal={differenceTotal}
                                    permissionList={permissionList.isAddEditScreen} />
                                : <SearchNotFound searchQuery="Land Distribution" />}
                        </PerfectScrollbar>
                    </Card>
                </Box>
            </Container>
        </Page>
    );
};