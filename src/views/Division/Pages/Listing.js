import React, { useState, useEffect, createContext } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  makeStyles,
  Container,
  CardHeader,
  CardContent,
  Divider,
  MenuItem,
  Grid,
  Button,
  InputLabel,
  TextField
} from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import MaterialTable from "material-table";
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import SearchNotFound from 'src/views/Common/SearchNotFound';
import xlsx from 'json-as-xlsx';
import { CustomTable } from './CustomTable';


const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  colorRecord: {
    backgroundColor: 'green'
  },
}));

var screenCode = "DIVISION"

export default function DivisionListing() {
  const classes = useStyles();
  const [costCenterData, setcostCenterData] = useState([]);
  const [csvHeaders, SetCsvHeaders] = useState([]);
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [isViewTable, setIsViewTable] = useState(true);
  const [routeID, setRouteID] = useState(0);
  const [excel, setExcel] = useState(false);
  const [initialLoad, setInitialLoad] = useState(false);
  const [costCenterList, setcostCenterList] = useState({
    groupID: '0',
    factoryID: '0'
  })
  const [IDDataForDefaultLoad, setIsIDDataForDefaultLoad] = useState(null);

  const navigate = useNavigate();

  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    let model = {
      groupID: parseInt(costCenterList.groupID),
      factoryID: parseInt(costCenterList.factoryID)
    }
    sessionStorage.setItem(
      'division-listing-page-search-parameters-id',
      JSON.stringify(model)
    );
    navigate('/app/division/addedit/' + encrypted);
  }
  const handleClickEdit = (routeID) => {
    encrypted = btoa(routeID.toString());
    let model = {
      groupID: parseInt(costCenterList.groupID),
      factoryID: parseInt(costCenterList.factoryID)
    }
    sessionStorage.setItem(
      'division-listing-page-search-parameters-id',
      JSON.stringify(model)
    );
    navigate('/app/division/addedit/' + encrypted);
  }
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
    isAddEditScreen: false
  });

  useEffect(() => {
    const IDdata = JSON.parse(
      sessionStorage.getItem('division-listing-page-search-parameters-id')
    )
    getPermissions(IDdata);
  }, []);

  useEffect(() => {
    sessionStorage.removeItem(
      'division-listing-page-search-parameters-id'
    );
  }, []);

  useEffect(() => {
    trackPromise(
      getGroupsForDropdown()
    );
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoriesByGroupID()
    )
  }, [costCenterList.groupID]);

  useEffect(() => {
    if (initialLoad) {
      checkDisbursement();
    }
  }, [initialLoad, costCenterList.groupID]);

  useEffect(() => {
    trackPromise(
      getcostCentersByFactoryID()
    )
  }, [costCenterList.groupID, costCenterList.factoryID]);

  useEffect(() => {
    if (excel == true) {
      createFile()
    }
  }, [excel]);

  useEffect(() => {
    if (routeID != 0) {
      handleClickEdit(routeID)
    }
  }, [routeID]);

  useEffect(() => {
    if (IDDataForDefaultLoad != null) {
      getcostCentersByFactoryID();
    }
  }, [IDDataForDefaultLoad]);

  async function getPermissions(IDdata) {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWDIVISION');
    var isAddEditScreen = permissions.find(p => p.permissionCode == 'ADDEDDIVISION');

    if (isAuthorized === undefined) {
      navigate('/404');
    }

    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
      isAddEditScreen: isAddEditScreen !== undefined
    });

    const isInitialLoad = IDdata === null
    if (isInitialLoad) {
      setcostCenterList({
        ...costCenterList,
        groupID: parseInt(tokenService.getGroupIDFromToken()),
        factoryID: parseInt(tokenService.getFactoryIDFromToken())
      })
    }
    else {
      setcostCenterList({
        ...costCenterList,
        groupID: parseInt(IDdata.groupID),
        factoryID: parseInt(IDdata.factoryID)
      })
      setInitialLoad(false);
      setIsIDDataForDefaultLoad(IDdata);
    }
  }

  async function getFactoriesByGroupID() {
    const fac = await services.getfactoriesForDropDown(costCenterList.groupID);
    setFactories(fac);
  }

  async function getcostCentersByFactoryID() {
    const costCenters = await services.getcostCentersByFactoryID(costCenterList.groupID, costCenterList.factoryID);
    setcostCenterData(costCenters);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
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

  function handleGroupChange(e) {
    const target = e.target;
    const value = target.value
    setcostCenterList({
      ...costCenterList,
      [e.target.name]: value,
      factoryID: "0"
    });
  }

  function checkDisbursement() {
    setcostCenterData([])
    setcostCenterList((prevState) => ({
      ...prevState,
      factoryID: '0',
    }));
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setcostCenterList({
      ...costCenterList,
      [e.target.name]: value
    });
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
              toolTiptitle={"Add Sub Division"}
            />
            : null}
        </Grid>
      </Grid>
    )
  }

  async function createFile() {
    var file = await createDataForExcel(costCenterData);
    var settings = {
      sheetName: 'Sub Division',
      fileName: 'Sub Division',
      writeOptions: {}
    }
    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })
    let dataA = [
      {
        sheet: 'Sub Division',
        columns: tempcsvHeaders,
        content: file
      }
    ]
    xlsx(dataA, settings);
  }

  async function createDataForExcel(array) {
    var res = [];
    if (array != null) {
      array.map(x => {
        var vr = {
          'Business Division': x.groupName,
          'Location': x.factoryName,
          'Product': x.productName,
          'Sub Division Code': x.routeCode,
          'Short Code': x.shortCode,
          'Sub Division Name': x.routeName,
          'Sub Division Location': x.routeLocation,
          'Monthly Target Crop(KG)': x.targetCrop,
          'Status': x.isActive == true ? 'Active' : 'InActive'
        }
        res.push(vr);
      });
    }
    return res;
  }

  return (
    <Page
      className={classes.root}
      title="Sub Division"
    >
      <Container maxWidth={false}>
        <Box mt={0}>
          <Card>
            <CardHeader
              title={cardTitle("Sub Division")}
            />
            <PerfectScrollbar>
              <Divider />
              <CardContent style={{ marginBottom: "2rem" }}>
                <Grid container spacing={3}>
                  <Grid item md={5} xs={12}>
                    <InputLabel shrink id="groupID">
                      Business Division  
                    </InputLabel>
                    <TextField select
                      fullWidth
                      name="groupID"
                      onChange={(e) => handleGroupChange(e)}
                      size='small'
                      value={costCenterList.groupID}
                      variant="outlined"
                      InputProps={{
                        readOnly: !permissionList.isGroupFilterEnabled ? true : false
                      }}
                    >
                      <MenuItem value="0">--Select All Business Division--</MenuItem>
                      {generateDropDownMenu(groups)}
                    </TextField>
                  </Grid>

                  <Grid item md={5} xs={12}>
                    <InputLabel shrink id="factoryID">
                      Location 
                    </InputLabel>
                    <TextField select
                      fullWidth
                      name="factoryID"
                      onChange={(e) => handleChange(e)}
                      size='small'
                      value={costCenterList.factoryID}
                      variant="outlined"
                      id="factoryID"
                      InputProps={{
                        readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                      }}
                    >
                      <MenuItem value="0">--Select All Location--</MenuItem>
                      {generateDropDownMenu(factories)}
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
              {costCenterData.length > 0 ?
                <CustomTable costCenterData={costCenterData} setRouteID={setRouteID} setExcel={setExcel} permissionList={permissionList.isAddEditScreen} />
                : <SearchNotFound searchQuery="Business Divisions" />}
            </PerfectScrollbar>
          </Card>
        </Box>
      </Container>
    </Page>
  );
};

