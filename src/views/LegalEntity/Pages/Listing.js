import React, { useState, useEffect, createContext } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  InputLabel,
  Grid,
  makeStyles,
  TextField,
  Container,
  CardHeader,
  CardContent,
  Divider,
  MenuItem,
  Button
} from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import MaterialTable from "material-table";
import authService from '../../../utils/permissionAuth';
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
const screenCode = 'LEGALENTITY';
export default function LegalEntityListing() {
  const classes = useStyles();
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);
  const [groupID, setGroupID] = useState(0);
  const [excel, setExcel] = useState(false);
  const [detailsLoad, setDetailsLoad] = useState(null);
  const [csvHeaders, SetCsvHeaders] = useState([]);
  const [groups, setGroups] = useState();
  const [groupList, setGroupList] = useState({
    masterGroupID: '0'
  })
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: true,
    isAuthorizedOne: false
  });
  const [groupData, setGroupData] = useState([]);
  const navigate = useNavigate();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    let model = {
      masterGroupID: parseInt(groupList.masterGroupID),
    }
    sessionStorage.setItem(
      'legalEntity-listing-page-search-parameters-id',
      JSON.stringify(model)
    );
    navigate('/app/legalEntity/addedit/' + encrypted);
  }

  const handleClickEdit = (groupID) => {
    encrypted = btoa(groupID.toString());
    let model = {
      masterGroupID: parseInt(groupList.masterGroupID),
    }
    sessionStorage.setItem(
      'legalEntity-listing-page-search-parameters-id',
      JSON.stringify(model)
    );
    navigate('/app/legalEntity/addedit/' + encrypted);
  }

  useEffect(() => {
    const iDdata = JSON.parse(
      sessionStorage.getItem('legalEntity-listing-page-search-parameters-id')
    );

    if (iDdata != null) {
      setGroupList({
        ...groupList,
        masterGroupID: iDdata.masterGroupID
      })
      setDetailsLoad(iDdata);
    }
    getPermission();
  }, []);

  useEffect(() => {
    sessionStorage.removeItem(
      'legalEntity-listing-page-search-parameters-id'
    );
  }, []);

  useEffect(() => {
    trackPromise(
      getPermission(),
      GetAllGroups(),
      getGroupsForDropdown()
    );
  }, []);

  useEffect(() => {
    if (groupID != 0) {
      handleClickEdit(groupID)
    }
  }, [groupID]);

  useEffect(() => {
    if (excel == true) {
      createFile()
    }
  }, [excel]);

  useEffect(() => {
    trackPromise(
      getGroupsByMasterGroupID()
    )
  }, [groupList.masterGroupID]);

  useEffect(() => {
    if (detailsLoad != null) {
      getGroupsByMasterGroupID()
    }
  }, [detailsLoad]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWLEGALENTITY');
    var isAuthorizedOne = permissions.find(p => p.permissionCode == 'ADDEDITLEGALENTITY');

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isAuthorizedOne: isAuthorizedOne !== undefined
    });
  }

  async function GetAllGroups() {
    const result = await services.GetAllLegalEntities();
    setGroupData(result);
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

  const handleChange = (e) => {
    const target = e.target;
    const value = target.value
    setGroupList({
      ...groupList,
      [e.target.name]: value
    });
  }

  async function getGroupsByMasterGroupID() {
    var result = await services.getGroupsByMasterGroupID(groupList.masterGroupID);
    setGroupData(result);
  }
  async function getGroupsForDropdown() {
    const groups = await services.getMasterGroupsForDropdown();
    setGroups(groups);
  }

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {titleName}
        </Grid>
        <Grid item md={2} xs={12}>
          {permissionList.isAuthorizedOne == true ?
            <PageHeader
              onClick={handleClick}
              isEdit={true}
              toolTiptitle={"Add Business Division"}
            /> : null}
        </Grid>
      </Grid>
    )
  }

  async function createDataForExcel(array) {
    var res = [];
    if (array != null) {
      array.map(x => {
        var vr = {
          'Company': x.masterGroupName,
          'Business Division Code': x.groupCode,
          'Short Code': x.shortCode,
          'Business Division Name': x.groupName,
          'Status': x.isActive == true ? 'Active' : 'InActive'
        }
        res.push(vr);
      });

    }

    return res;
  }

  async function createFile() {
    setExcel(false)
    var file = await createDataForExcel(groupData);
    var settings = {
      sheetName: 'Business Divisions',
      fileName: 'Business Divisions',
      writeOptions: {}
    }

    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let dataA = [
      {
        sheet: 'Business Divisions',
        columns: tempcsvHeaders,
        content: file
      }
    ]
    xlsx(dataA, settings);
  }

  return (
    <Page
      className={classes.root}
      title="Business Divisions"
    >
      <Container maxWidth={false}>
        <Box mt={0}>
          <Card>
            <CardHeader
              title={cardTitle("Business Divisions")}
            />
            <PerfectScrollbar>
              <Divider />
              <CardContent style={{ marginBottom: "2rem" }}>
                <Grid container spacing={3}>
                  <Grid item md={6} xs={12}>
                    <InputLabel shrink id="MasterGroupID">
                      Company  
                    </InputLabel>
                    <TextField select
                      fullWidth
                      name="masterGroupID"
                      size='small'
                      onChange={(e) => handleChange(e)}
                      value={groupList.masterGroupID}
                      variant="outlined"
                    >
                      <MenuItem value="0">--Select All Company--</MenuItem>
                      {generateDropDownMenu(groups)}
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
              {groupData.length > 0 ?
                <CustomTable groupData={groupData} setGroupID={setGroupID} setExcel={setExcel}
                  permissionList={permissionList} />
                : <SearchNotFound searchQuery="Business Divisions" />}
            </PerfectScrollbar>
          </Card>
        </Box>
      </Container>
    </Page>
  );
};

