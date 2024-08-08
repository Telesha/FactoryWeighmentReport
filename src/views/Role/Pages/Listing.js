import React, { useState, useEffect, createContext } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Avatar, Box, Card, Checkbox, Table, TableBody, TableCell, TableHead, TablePagination, TableRow,
  Typography, makeStyles, Container, CardHeader, CardContent, Divider, MenuItem, Grid, InputLabel, TextField
} from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import MaterialTable from "material-table";
import permissionService from "../../../utils/permissionAuth";
import tokenDecoder from 'src/utils/tokenDecoder';
import { LoadingComponent } from 'src/utils/newLoader';
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
  }
}));

const screenCode = 'ROLE';

export default function RoleListing() {
  const classes = useStyles();
  const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);
  const handleLimitChange = (event) => {
    setLimit(event.target.value);
  };
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const [roleData, setRoleData] = useState([]);
  const [roleID, setRoleID] = useState(0);
  const [changeID, setChangeID] = useState(0);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [groups, setGroups] = useState();
  const [isViewTable, setIsViewTable] = useState(true);
  const [excel, setExcel] = useState(false);
  const [factories, setFactories] = useState();
  const [roleList, setRoleList] = useState({
    groupID: '0',
    factoryID: '0'
  })
  const [IDDataForDefaultLoad, setIsIDDataForDefaultLoad] = useState(null);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
    isAddEditScreen: false
  });

  const navigate = useNavigate();

  useEffect(() => {
    const IDdata = JSON.parse(
      sessionStorage.getItem('roles-listing-page-search-parameters-id')
    );
    getPermissions(IDdata);
  }, []);

  useEffect(() => {
    sessionStorage.removeItem(
      'roles-listing-page-search-parameters-id'
    );
  }, []);

  useEffect(() => {
    if (IDDataForDefaultLoad != null) {
      getRoleDetailsByGroupIDFactoryID();
    }
  }, [IDDataForDefaultLoad]);

  async function getPermissions(IDdata) {
    var permissions = await permissionService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWROLE');

    if (isAuthorized === undefined) {
      navigate('/app/unauthorized');
    }

    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');
    var isAddEditScreen = permissions.find(p => p.permissionCode == 'ADDEDITROLE');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
      isAddEditScreen: isAddEditScreen !== undefined
    });

    const isInitialLoad = IDdata === null
    if (isInitialLoad) {
      setRoleList({
        ...roleList,
        groupID: parseInt(tokenDecoder.getGroupIDFromToken()),
        factoryID: parseInt(tokenDecoder.getFactoryIDFromToken())
      })
    }
    else {
      setRoleList({
        ...roleList,
        groupID: IDdata.groupID,
        factoryID: IDdata.factoryID
      })
      setIsIDDataForDefaultLoad(IDdata);
    }
    trackPromise(getGroupsForDropdown());
  }

  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    let model = {
      groupID: parseInt(roleList.groupID),
      factoryID: parseInt(roleList.factoryID)
    }
    sessionStorage.setItem(
      'roles-listing-page-search-parameters-id',
      JSON.stringify(model)
    );
    navigate('/app/roles/addedit/' + encrypted);
  }

  const handleClickEdit = (roleID) => {
    encrypted = btoa(roleID.toString());
    let model = {
      groupID: parseInt(roleList.groupID),
      factoryID: parseInt(roleList.factoryID)
    }
    sessionStorage.setItem(
      'roles-listing-page-search-parameters-id',
      JSON.stringify(model)
    );
    navigate('/app/roles/addedit/' + encrypted);
  }

  const handleClickPermission = (roleID, roleLevelID) => {
    encrypted = btoa(roleID.toString());
    let encrypted1 = btoa(roleLevelID.toString());

    navigate('/app/rolePermission/listing/' + encrypted + "/" + encrypted1);
  }

  useEffect(() => {
    trackPromise(
      getFactoriesForDropdown()
    );
  }, [roleList.groupID]);

  useEffect(() => {
    trackPromise(
      getRoleDetailsByGroupIDFactoryID()
    )
    checkDisbursement();
  }, [roleList.factoryID]);

  useEffect(() => {
    if (roleID != 0) {
      handleClickEdit(roleID)
    }
  }, [roleID]);

  useEffect(() => {
    if (changeID != 0) {
      const roleID = changeID;
      const roleLevelID = changeID;
      handleClickPermission(roleID, roleLevelID)
    }
  }, [changeID]);

  useEffect(() => {
    if (excel == true) {
      createFile()
    }
  }, [excel]);

  async function getRoleDetailsByGroupIDFactoryID() {
    var result = await services.getRoleDetailsByGroupIDFactoryID(roleList.groupID, roleList.factoryID);
    setRoleData(result);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getAllFactoriesByGroupID(roleList.groupID);
    setFactories(factories);
  }

  function checkDisbursement() {
    if (roleList.factoryID === '0') {
      setIsViewTable(true);
    }
    else {
      setIsViewTable(false);
    }
  }

  function handleGroupChange(e) {
    const target = e.target;
    const value = target.value
    setRoleList({
      ...roleList,
      [e.target.name]: value,
      factoryID: "0"
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
    setRoleList({
      ...roleList,
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
              toolTiptitle={"Add Role"}
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
          'Role Name': x.roleName,
          'Role Level ID': x.roleLevelID,
          'Role Level': x.roleLevelName,
          'Status': x.isActive == true ? 'Active' : 'InActive'
        }
        res.push(vr);
      });
    }
    return res;
  }

  async function createFile() {
    setExcel(false);
    var file = await createDataForExcel(roleData);
    var settings = {
      sheetName: 'Role',
      fileName: 'Role Details',
      writeOptions: {}
    }

    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let dataA = [
      {
        sheet: 'Role Details',
        columns: tempcsvHeaders,
        content: file
      }
    ]
    xlsx(dataA, settings);
  }

  return (
    <Page
      className={classes.root}
      title="Roles"
    >
      <LoadingComponent />
      <Container maxWidth={false}>
        <Box mt={0}>
          <Card>
            <CardHeader
              title={cardTitle("Role")}
            />
            <PerfectScrollbar>
              <Divider />
              <CardContent style={{ marginBottom: "2rem" }}>
                <Grid container spacing={3}>
                  <Grid item md={6} xs={12}>
                    <InputLabel shrink id="groupID">
                      Business Division *
                    </InputLabel>
                    <TextField select
                      fullWidth
                      name="groupID"
                      onChange={(e) => handleGroupChange(e)}
                      value={roleList.groupID}
                      size='small'
                      variant="outlined"
                      InputProps={{
                        readOnly: !permissionList.isGroupFilterEnabled,
                      }}
                    >
                      <MenuItem value="0">--Select Business Division--</MenuItem>
                      {generateDropDownMenu(groups)}
                    </TextField>
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <InputLabel shrink id="factoryID">
                      Location *
                    </InputLabel>
                    <TextField select
                      fullWidth
                      name="factoryID"
                      onChange={(e) => handleChange(e)}
                      size='small'
                      value={roleList.factoryID}
                      variant="outlined"
                      InputProps={{
                        readOnly: !permissionList.isFactoryFilterEnabled,
                      }}
                    >
                      <MenuItem value="0">--Select Location--</MenuItem>
                      {generateDropDownMenu(factories)}
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
              {roleData.length > 0 ?
                <CustomTable roleData={roleData} setRoleID={setRoleID} setChangeID={setChangeID} permissionList={permissionList.isAddEditScreen} setExcel={setExcel} />
                : <SearchNotFound searchQuery="User" />}
            </PerfectScrollbar>

          </Card>
        </Box>
      </Container>
    </Page>
  );
};