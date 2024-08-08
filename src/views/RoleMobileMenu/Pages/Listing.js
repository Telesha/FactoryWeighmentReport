import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Card, makeStyles, Container, CardHeader, CardContent, Divider, MenuItem, Grid, InputLabel, TextField } from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import MaterialTable from "material-table";
import { CustomTable } from './CustomTable';
import xlsx from 'json-as-xlsx';
import SearchNotFound from 'src/views/Common/SearchNotFound';

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

const screenCode = 'ROLEMOBILEMENU';
export default function RoleMobileMenuListing() {
  const classes = useStyles();
  const [roleMobileData, setRoleMobileData] = useState([]);
  const [groups, setGroups] = useState();
  const [estates, setEstates] = useState([]);
  const [excel, setExcel] = useState(false);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [roles, setRoles] = useState([]);
  const [roleMobileMenuID, setRoleMobileMenuID] = useState(0);
  const [gangList, setGangList] = useState({
    groupID: '0',
    estateID: '0',
    roleID: 0
  })
  const [IDDataForDefaultLoad, setIsIDDataForDefaultLoad] = useState(null);

  const navigate = useNavigate();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    let model = {
      groupID: parseInt(gangList.groupID),
      estateID: parseInt(gangList.estateID),
      roleID: parseInt(gangList.roleID)
    }
    sessionStorage.setItem(
      'roleMobileMenu-listing-page-search-parameters-id',
      JSON.stringify(model)
    );
    navigate('/app/roleMobileMenu/addedit/' + encrypted);
  }

  const handleClickEdit = (roleMobileMenuID) => {
    encrypted = btoa(roleMobileMenuID.toString());
    let model = {
      groupID: parseInt(gangList.groupID),
      estateID: parseInt(gangList.estateID),
      roleID: parseInt(gangList.roleID)
    }
    sessionStorage.setItem(
      'roleMobileMenu-listing-page-search-parameters-id',
      JSON.stringify(model)
    );
    navigate('/app/roleMobileMenu/addedit/' + encrypted);
  }

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
    isAddEditScreen: false
  });

  useEffect(() => {
    const IDdata = JSON.parse(
      sessionStorage.getItem('roleMobileMenu-listing-page-search-parameters-id')
    );
    getPermissions(IDdata);
  }, []);

  useEffect(() => {
    sessionStorage.removeItem(
      'roleMobileMenu-listing-page-search-parameters-id'
    );
  }, []);

  useEffect(() => {
    trackPromise(
      getGroupsForDropdown(),
    );
  }, []);

  useEffect(() => {
    if (gangList.groupID !== 0 && gangList.estateID !== 0) {
      getRoleMobileMenuDetails();
    }
  }, [gangList.groupID, gangList.estateID, gangList.roleID]);

  useEffect(() => {
    getEstateDetailsByGroupID();
  }, [gangList.groupID]);

  useEffect(() => {
    getRoleDetailsByGroupFactory();
  }, [gangList.estateID]);

  useEffect(() => {
    if (roleMobileMenuID != 0) {
      handleClickEdit(roleMobileMenuID)
    }
  }, [roleMobileMenuID]);

  useEffect(() => {
    if (excel == true) {
      createFile()
    }
  }, [excel]);

  useEffect(() => {
    if (IDDataForDefaultLoad != null) {
      getRoleMobileMenuDetails();
    }
  }, [IDDataForDefaultLoad]);

  async function getPermissions(IDdata) {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWROLEMOBILEMENU');

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');
    var isAddEditScreen = permissions.find(p => p.permissionCode == 'ADDEDITROLEMOBILEMENU');

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
        estateID: parseInt(tokenService.getFactoryIDFromToken()),
      })
    }
    else {
      setGangList({
        ...gangList,
        groupID: IDdata.groupID,
        estateID: IDdata.estateID,
        roleID: IDdata.roleID
      })
      setIsIDDataForDefaultLoad(IDdata);
    }
  }

  async function getRoleMobileMenuDetails() {
    const data = await services.getRoleMobileMenuDetails(gangList.groupID, gangList.estateID, gangList.roleID);
    setRoleMobileData(data);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getEstateDetailsByGroupID() {
    var response = await services.getEstateDetailsByGroupID(gangList.groupID);
    setEstates(response);
  }

  async function getRoleDetailsByGroupFactory() {
    if (gangList.groupID !== 0 && gangList.estateID !== 0) {
      var response = await services.getRoleDetailsByGroupFactory(gangList.groupID, gangList.estateID);
      setRoles(response);
    }
  };

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
              toolTiptitle={"Add Role Mobile Menu"}
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
          'Role': x.roleName,
          'Mobile Menu': x.menuName,
          '1st Verification Type': x.fVerificationName,
          '2nd Verification Type': x.sndVerificationName,
          'Collection Tag Enabled' :x.isCollectiontagEnabled == true ? 'Yes' : 'No',
          'Digital Scale Enabled' : x.isDigitalScaleEnabled == true ? 'Yes' : 'No',
          'Status': x.isActive == true ? 'Active' : 'InActive'
        }
        res.push(vr);
      });
    }
    return res;
  }

  async function createFile() {
    setExcel(false);
    var file = await createDataForExcel(roleMobileData);
    var settings = {
      sheetName: 'Role Mobile Menu',
      fileName: 'Role Mobile Menu Details',
      writeOptions: {}
    }

    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let dataA = [
      {
        sheet: 'Role Mobile Menu Details',
        columns: tempcsvHeaders,
        content: file
      }
    ]
    xlsx(dataA, settings);
  }

  return (
    <Page
      className={classes.root}
      title="Role Mobile Menu"
    >
      <Container maxWidth={false}>
        <Box mt={0}>
          <Card>
            <CardHeader
              title={cardTitle("Role Mobile Menu")}
            />
            <PerfectScrollbar>
              <Divider />
              <CardContent style={{ marginBottom: "2rem" }}>
                <Grid container spacing={3}>
                  <Grid item md={4} xs={12}>
                    <InputLabel shrink id="groupID">
                      Business Division *
                    </InputLabel>
                    <TextField select
                      fullWidth
                      name="groupID"
                      onChange={(e) => handleChange(e)}
                      value={gangList.groupID}
                      variant="outlined"
                      size='small'
                      InputProps={{
                        readOnly: !permissionList.isGroupFilterEnabled,
                      }}
                    >
                      <MenuItem value="0">--Select Business Division--</MenuItem>
                      {generateDropDownMenu(groups)}
                    </TextField>
                  </Grid>
                  <Grid item md={4} xs={12}>
                    <InputLabel shrink id="estateID">
                      Location *
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
                      <MenuItem value={0}>--Select Location--</MenuItem>
                      {generateDropDownMenu(estates)}
                    </TextField>
                  </Grid>
                  <Grid item md={4} xs={12}>
                    <InputLabel shrink id="roleID">
                      Role
                    </InputLabel>
                    <TextField select
                      fullWidth
                      name="roleID"
                      size='small'
                      onChange={(e) => {
                        handleChange(e)
                      }}
                      value={gangList.roleID}
                      variant="outlined"
                      id="roleID"
                      InputProps={{
                        readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                      }}
                    >
                      <MenuItem value={0}>--Select Role--</MenuItem>
                      {generateDropDownMenu(roles)}
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
              {roleMobileData.length > 0 ?
                <CustomTable roleMobileData={roleMobileData} setRoleMobileMenuID={setRoleMobileMenuID} permissionList={permissionList.isAddEditScreen} setExcel={setExcel} />
                : <SearchNotFound searchQuery="Role Mobile Menu" />}
            </PerfectScrollbar>
          </Card>
        </Box>
      </Container>
    </Page>
  );
};
