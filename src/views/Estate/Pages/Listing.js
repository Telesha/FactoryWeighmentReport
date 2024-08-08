import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  makeStyles,
  Container,
  Divider,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  InputLabel,
  CardHeader,
  Button
} from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import MaterialTable from "material-table";
import tokenService from '../../../utils/tokenDecoder';
import authService from '../../../utils/permissionAuth';
import xlsx from 'json-as-xlsx';
import SearchNotFound from 'src/views/Common/SearchNotFound';
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
  },
}));

const screenCode = 'FACTORY';
export default function EstateListing(props) {
  const classes = useStyles();
  const [groups, setGroups] = useState();
  const [excel, setExcel] = useState(false);
  const [factoryList, setFactoryList] = useState({
    groupID: '0',
  })
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    groupID: '0',
  })
  const [factoryData, setFactoryData] = useState([]);
  const [factoryID, setFactoryID] = useState(0);
  const [csvHeaders, SetCsvHeaders] = useState([]);
  const navigate = useNavigate();
  let encryptedID = "";
  const handleClick = () => {
    encryptedID = btoa('0');
    let model = {
      groupID: parseInt(factoryList.groupID),
    }
    sessionStorage.setItem(
      'estate-listing-page-search-parameters-id',
      JSON.stringify(model)
    );
    navigate('/app/estate/addedit/' + encryptedID);
  }

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isAddEditScreen: false
  });

  const [IDDataForDefaultLoad, setIsIDDataForDefaultLoad] = useState(null);

  useEffect(() => {
    const iddata = JSON.parse(
      sessionStorage.getItem('estate-listing-page-search-parameters-id')
    );
    getPermission(iddata);
  }, []);

  useEffect(() => {
    sessionStorage.removeItem(
      'estate-listing-page-search-parameters-id'
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
  }, [factoryList.groupID]);

  useEffect(() => {
    if (factoryID != 0) {
      EditFactoryDetails(factoryID)
    }
  }, [factoryID]);

  useEffect(() => {
    if (excel == true) {
      createFile()
    }
  }, [excel]);

  useEffect(() => {
    if (IDDataForDefaultLoad != null) {
      getFactoriesByGroupID();
    }
  }, [IDDataForDefaultLoad]);

  async function getPermission(iddata) {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWFACTORY');
    var isAddEditScreen = permissions.find(p => p.permissionCode == 'ADDEDITFACTORY');

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isAddEditScreen: isAddEditScreen !== undefined
    });

    const isInitialLoad = iddata === null
    if (isInitialLoad) {
      setFactoryList({
        ...factoryList,
        groupID: parseInt(tokenService.getGroupIDFromToken()),
      })
    }
    else {
      setFactoryList({
        ...factoryList,
        groupID: iddata.groupID,
      })
      setIsIDDataForDefaultLoad(iddata);
    }
  }

  async function getFactoriesByGroupID() {
    var result = await services.getFactoriesByGroupID(factoryList.groupID);
    setFactoryData(result);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }
  const EditFactoryDetails = (factoryID) => {
    encryptedID = btoa(factoryID.toString());
    let model = {
      groupID: parseInt(factoryList.groupID),
    }
    sessionStorage.setItem(
      'estate-listing-page-search-parameters-id',
      JSON.stringify(model)
    );
    navigate('/app/estate/addedit/' + encryptedID);
  }

  async function createDataForExcel(array) {
    var res = [];
    if (array != null) {
      array.map(x => {
        var vr = {
          'Business Division': x.groupName,
          'Entity Type': x.operationEntityTypeID === 1 ? 'Factory' : x.operationEntityTypeID === 3 ? 'Garden' : x.operationEntityTypeID === 5 ? 'Both' : '',
          'Location Code': x.factoryCode,
          'Location Name': x.factoryName,
          'Short Code': x.shortCode,
          'BR Number': x.brNumber,
          'Tax Number': x.taxNumber,
          'Manager Name': x.managerName,
          'Labour on Book': x.labourOnBook,
          'Grant Area': x.grantArea
        }
        res.push(vr);
      });

    }

    return res;
  }

  async function createFile() {

    var file = await createDataForExcel(factoryData);
    var settings = {
      sheetName: 'Locations',
      fileName: 'Locations',
      writeOptions: {}
    }

    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let dataA = [
      {
        sheet: 'Locations',
        columns: tempcsvHeaders,
        content: file
      }
    ]
    xlsx(dataA, settings);
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
    setFactoryList({
      ...factoryList,
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
              toolTiptitle={"Add Location"}
            />
            : null}
        </Grid>
      </Grid>
    )
  }

  return (
    <Page
      className={classes.root}
      title="Locations"
    >
      <Container maxWidth={false}>
        <Box mt={0}>
          <Card>
            <CardHeader
              title={cardTitle("Locations")}
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
                      onChange={(e) => handleChange(e)}
                      value={factoryList.groupID}
                      variant="outlined"
                      size='small'
                      InputProps={{
                        readOnly: !permissionList.isGroupFilterEnabled ? true : false
                      }}                    >
                      <MenuItem value="0">--All Business Divisions--</MenuItem>
                      {generateDropDownMenu(groups)}
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
              {factoryData.length > 0 ?
                <CustomTable factoryData={factoryData} setFactoryID={setFactoryID} setExcel={setExcel} permissionList={permissionList.isAddEditScreen} />
                : <SearchNotFound searchQuery="Locations" />}
            </PerfectScrollbar>
          </Card>
        </Box>
      </Container>
    </Page>
  );
};

