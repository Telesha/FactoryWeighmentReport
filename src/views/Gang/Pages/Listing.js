import React, { useState, useEffect, createContext } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, makeStyles, Container, CardHeader, CardContent,
  Divider, MenuItem, Grid, InputLabel, TextField, Button
} from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import MaterialTable from "material-table";
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
  avatar: {
    marginRight: theme.spacing(2)
  },
  colorRecord: {
    backgroundColor: 'green'
  }
}));

const screenCode = 'GANGREGISTRATION';
export default function GangRegistrationListing() {
  const classes = useStyles();
  const [gangData, setGangData] = useState([]);
  const [csvHeaders, SetCsvHeaders] = useState([]);
  const [groups, setGroups] = useState();
  const [estates, setEstates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [gangID, setGroupID] = useState(0);
  const [excel, setExcel] = useState(false);
  const [gangList, setGangList] = useState({
    groupID: '0',
    estateID: '0',
    divisionID: '0'
  })
  const [IDDataForDefaultLoad, setIsIDDataForDefaultLoad] = useState(null);

  const navigate = useNavigate();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    let model = {
      groupID: parseInt(gangList.groupID),
      estateID: parseInt(gangList.estateID),
      divisionID: parseInt(gangList.divisionID)
    }
    sessionStorage.setItem(
      'gang-listing-page-search-parameters-id',
      JSON.stringify(model)
    );
    navigate('/app/gangRegistration/addedit/' + encrypted);
  }

  const handleClickEdit = (gangID) => {
    encrypted = btoa(gangID.toString());
    let model = {
      groupID: parseInt(gangList.groupID),
      estateID: parseInt(gangList.estateID),
      divisionID: parseInt(gangList.divisionID)
    }
    sessionStorage.setItem(
      'gang-listing-page-search-parameters-id',
      JSON.stringify(model)
    );
    navigate('/app/gangRegistration/addedit/' + encrypted);
  }

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
    isAddEditScreen: false
  });

  useEffect(() => {
    const IDdata = JSON.parse(
      sessionStorage.getItem('gang-listing-page-search-parameters-id')
    );
    getPermissions(IDdata);
  }, []);

  useEffect(() => {
    sessionStorage.removeItem(
      'gang-listing-page-search-parameters-id'
    );
  }, []);


  useEffect(() => {
    trackPromise(
      getGroupsForDropdown(),
    );
  }, []);

  useEffect(() => {
    getGangDetailsByGroupIDEstateIDDivisionID();
  }, [gangList.groupID, gangList.estateID, gangList.divisionID]);

  useEffect(() => {
    getEstateDetailsByGroupID();
  }, [gangList.groupID]);

  useEffect(() => {
    getDivisionDetailsByEstateID();
  }, [gangList.estateID]);

  useEffect(() => {
    if (excel == true) {
      createFile()
    }
  }, [excel]);

  useEffect(() => {
    if (gangID != 0) {
      handleClickEdit(gangID)
    }
  }, [gangID]);

  useEffect(() => {
    if (IDDataForDefaultLoad != null) {
      getGangDetailsByGroupIDEstateIDDivisionID();
    }
  }, [IDDataForDefaultLoad]);

  async function getPermissions(IDdata) {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWGANGLISTING');

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');
    var isAddEditScreen = permissions.find(p => p.permissionCode == 'ADDEDITGANGREGISTRATION');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
      isAddEditScreen: isAddEditScreen !== undefined
    });

    const isInitialLoad = IDdata === null
    if (isInitialLoad) {
      setGangList({
        ...gangList,
        groupID: parseInt(tokenService.getGroupIDFromToken()),
        estateID: parseInt(tokenService.getFactoryIDFromToken())
      })
    }
    else {
      setGangList({
        ...gangList,
        groupID: parseInt(IDdata.groupID),
        estateID: parseInt(IDdata.estateID),
        divisionID: parseInt(IDdata.divisionID)
      })
      setIsIDDataForDefaultLoad(IDdata);
    }
  }

  async function getGangDetailsByGroupIDEstateIDDivisionID() {
    const gangItem = await services.getGangDetailsByGroupIDEstateIDDivisionID(gangList.groupID, gangList.estateID, gangList.divisionID);
    setGangData(gangItem);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getEstateDetailsByGroupID() {
    var response = await services.getEstateDetailsByGroupID(gangList.groupID);
    setEstates(response);
  }

  async function getDivisionDetailsByEstateID() {
    var response = await services.getDivisionDetailsByEstateID(gangList.estateID);
    setDivisions(response);
  }

  function handleGroupChange(e) {
    const target = e.target;
    const value = target.value
    setGangList({
      ...gangList,
      [e.target.name]: value,
      estateID: "0"
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
    setGangList({
      ...gangList,
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
              toolTiptitle={"Add Duffa Item"}
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
          'Sub Division': x.divisionName,
          'Duffa Code': x.gangCode,
          'Duffa Name': x.gangName,
          'Status': x.isActive == true ? 'Active' : 'InActive'
        }
        res.push(vr);
      });

    }

    return res;
  }

  async function createFile() {

    var file = await createDataForExcel(gangData);
    var settings = {
      sheetName: 'Duffas',
      fileName: 'Duffas',
      writeOptions: {}
    }

    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let dataA = [
      {
        sheet: 'Duffas',
        columns: tempcsvHeaders,
        content: file
      }
    ]
    xlsx(dataA, settings);
  }

  return (
    <Page
      className={classes.root}
      title="Duffas"
    >
      <Container maxWidth={false}>
        <Box mt={0}>
          <Card>
            <CardHeader
              title={cardTitle("Duffas")}
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
                      value={gangList.groupID}
                      variant="outlined"
                      size='small'
                      InputProps={{
                        readOnly: !permissionList.isGroupFilterEnabled,
                      }}
                    >
                      <MenuItem value="0">--Select All Business Division--</MenuItem>
                      {generateDropDownMenu(groups)}
                    </TextField>
                  </Grid>

                  <Grid item md={4} xs={12}>
                    <InputLabel shrink id="estateID">
                      Location 
                    </InputLabel>
                    <TextField select
                      fullWidth
                      name="estateID"
                      size='small'
                      onChange={(e) => {
                        handleChange(e)
                      }}
                      value={gangList.estateID}
                      variant="outlined"
                      id="estateID"
                      InputProps={{
                        readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                      }}
                    >
                      <MenuItem value={0}>--Select All Location--</MenuItem>
                      {generateDropDownMenu(estates)}
                    </TextField>
                  </Grid>
                  <Grid item md={4} xs={12}>
                    <InputLabel shrink id="divisionID">
                      Sub Division
                    </InputLabel>
                    <TextField select
                      fullWidth
                      name="divisionID"
                      size='small'
                      onChange={(e) => {
                        handleChange(e)
                      }}
                      value={gangList.divisionID}
                      variant="outlined"
                      id="divisionID"
                    >
                      <MenuItem value={0}>--Select All Sub Division--</MenuItem>
                      {generateDropDownMenu(divisions)}
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
              {gangData.length > 0 ?
                <CustomTable gangData={gangData} setGroupID={setGroupID} setExcel={setExcel} permissionList={permissionList.isAddEditScreen} />
                : <SearchNotFound searchQuery="Duffas" />}
            </PerfectScrollbar>
          </Card>
        </Box>
      </Container>
    </Page>
  );
};
