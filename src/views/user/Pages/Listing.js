import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Avatar,
  Box,
  Card,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  makeStyles,
  Container,
  CardHeader,
  Grid,
  CardContent,
  MenuItem,
  InputLabel,
  TextField
} from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import MaterialTable from "material-table";
import SearchNotFound from 'src/views/Common/SearchNotFound';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
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

const screenCode = 'USER';
export default function UserListing(props) {
  const classes = useStyles();
  const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);
  const [userData, setUserData] = useState([]);
  const [excel, setExcel] = useState(false);
  const [userID, setUserID] = useState(0);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [changeID, setChangeID] = useState(0);
  const [isViewTable, setIsViewTable] = useState(true);
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [userList, setUserList] = useState({
    groupID: '0',
    factoryID: '0'
  })
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
    isAddEditScreen: false
  });
  const [IDDataForDefaultLoad, setIsIDDataForDefaultLoad] = useState(null);
  const handleLimitChange = (event) => {
    setLimit(event.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const navigate = useNavigate();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    let model = {
      groupID: parseInt(userList.groupID),
      factoryID: parseInt(userList.factoryID)
    }
    sessionStorage.setItem(
      'users-listing-page-search-parameters-id',
      JSON.stringify(model)
    );
    navigate('/app/users/addedit/' + encrypted);
  }

  const handleClickEdit = (userID) => {
    encrypted = btoa(userID.toString());
    let model = {
      groupID: parseInt(userList.groupID),
      factoryID: parseInt(userList.factoryID)
    }
    sessionStorage.setItem(
      'users-listing-page-search-parameters-id',
      JSON.stringify(model)
    );
    navigate('/app/users/addedit/' + encrypted);
  }

  const handleClickChangePassword = (userID) => {
    encrypted = btoa(userID.toString());
    navigate('/app/users/passwordChange/' + encrypted);
  }

  useEffect(() => {
    const IDdata = JSON.parse(
      sessionStorage.getItem('users-listing-page-search-parameters-id')
    );
    getPermission(IDdata);
  }, []);

  useEffect(() => {
    sessionStorage.removeItem(
      'users-listing-page-search-parameters-id'
    );
  }, []);

  useEffect(() => {
    trackPromise(getGroupsForDropdown());
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoriesForDropdown()
    );
  }, [userList.groupID]);

  useEffect(() => {
    trackPromise(
      getUserDetailsByGroupIDFactoryID()
    )
    checkDisbursement();
  }, [userList.factoryID]);

  useEffect(() => {
    if (userID != 0) {
      handleClickEdit(userID)
    }
  }, [userID]);

  useEffect(() => {
    if (changeID != 0) {
      const userID = changeID;
      handleClickChangePassword(userID)
    }
  }, [changeID]);

  useEffect(() => {
    if (excel == true) {
      createFile()
    }
  }, [excel]);

  useEffect(() => {
    if (IDDataForDefaultLoad != null) {
      getUserDetailsByGroupIDFactoryID();
    }
  }, [IDDataForDefaultLoad]);

  async function getPermission(IDdata) {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWUSER');

    if (isAuthorized === undefined) {
      navigate('/404');
    }

    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');
    var isAddEditScreen = permissions.find(p => p.permissionCode == 'ADDEDITUSER');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
      isAddEditScreen: isAddEditScreen !== undefined
    });

    const isInitialLoad = IDdata === null
    if (isInitialLoad) {
      setUserList({
        ...userList,
        groupID: parseInt(tokenService.getGroupIDFromToken()),
        factoryID: parseInt(tokenService.getFactoryIDFromToken())
      })
    }
    else {
      setUserList({
        ...userList,
        groupID: IDdata.groupID,
        factoryID: IDdata.factoryID
      })
      setIsIDDataForDefaultLoad(IDdata);
    }
    trackPromise(getGroupsForDropdown());
  }

  async function getUserDetailsByGroupIDFactoryID() {
    var result = await services.getUserDetailsByGroupIDFactoryID(userList.groupID, userList.factoryID);
    setUserData(result);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getAllFactoriesByGroupID(userList.groupID);
    setFactories(factories);
  }

  function checkDisbursement() {
    if (userList.factoryID === '0') {
      setIsViewTable(true);
    }
    else {
      setIsViewTable(false);
    }
  }

  function handleGroupChange(e) {
    const target = e.target;
    const value = target.value
    setUserList({
      ...userList,
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
    setUserList({
      ...userList,
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
              toolTiptitle={"Add User"}
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
          'User Name': x.userName,
          'First Name': x.firstName,
          'Last Name': x.lastName,
          'Role Name': x.roleName,
          'Status': x.isActive == true ? 'Active' : 'InActive'
        }
        res.push(vr);
      });
    }
    return res;
  }

  async function createFile() {
    setExcel(false);
    var file = await createDataForExcel(userData);
    var settings = {
      sheetName: 'User',
      fileName: 'User Details',
      writeOptions: {}
    }

    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let dataA = [
      {
        sheet: 'User Details',
        columns: tempcsvHeaders,
        content: file
      }
    ]
    xlsx(dataA, settings);
  }

  return (
    <Page
      className={classes.root}
      title="Users"
    >
      <Container maxWidth={false}>
        <Box mt={0}>
          <Card>
            <CardHeader
              title={cardTitle("User")}
            />
            <PerfectScrollbar>
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
                      size='small'
                      value={userList.groupID}
                      variant="outlined"
                      InputProps={{
                        readOnly: !permissionList.isGroupFilterEnabled ? true : false,
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
                      value={userList.factoryID}
                      variant="outlined"
                      InputProps={{
                        readOnly: !permissionList.isFactoryFilterEnabled ? true : false,
                      }}
                    >
                      <MenuItem value="0">--Select Location--</MenuItem>
                      {generateDropDownMenu(factories)}
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
              {userData.length > 0 ?
                <CustomTable userData={userData} setUserID={setUserID} setChangeID={setChangeID} permissionList={permissionList.isAddEditScreen} setExcel={setExcel} />
                : <SearchNotFound searchQuery="User" />}
            </PerfectScrollbar>
          </Card>
        </Box>
      </Container>
    </Page>
  );
};
