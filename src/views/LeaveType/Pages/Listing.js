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
  avatar: {
    marginRight: theme.spacing(2)
  },
  colorRecord: {
    backgroundColor: 'green'
  }
}));

const screenCode = 'LEAVETYPE';

export default function LeaveTypeListing() {
  const classes = useStyles();
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);
  const [excel, setExcel] = useState(false);
  const [leaveTypeConfigurationID, setLeaveTypeConfigurationID] = useState(0);
  const [detailsLoad, setDetailsLoad] = useState(null);
  const [csvHeaders, SetCsvHeaders] = useState([]);
  const [groups, setGroups] = useState();
  const [leaveTypeDataList, setLeaveTypeDataList] = useState({
    groupID: 0
  });
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isAddEditScreen: false
  });
  const [leaveTypeData, setLeaveTypeData] = useState([]);
  const navigate = useNavigate();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    let model = {
      groupID: parseInt(leaveTypeDataList.groupID)
    }
    sessionStorage.setItem(
      'leaveType-listing-page-search-parameters-id',
      JSON.stringify(model)
    );
    navigate('/app/leaveType/addedit/' + encrypted);
  }
  const handleClickEdit = (leaveTypeConfigurationID) => {
    encrypted = btoa(leaveTypeConfigurationID.toString());
    let model = {
      groupID: parseInt(leaveTypeDataList.groupID),
    }
    sessionStorage.setItem(
      'leaveType-listing-page-search-parameters-id',
      JSON.stringify(model)
    );
    navigate('/app/leaveType/addedit/' + encrypted);
  }

  useEffect(() => {
    const iDdata = JSON.parse(
      sessionStorage.getItem('leaveType-listing-page-search-parameters-id')
    );

    if (iDdata != null) {
      setLeaveTypeDataList({
        ...leaveTypeDataList,
        groupID: iDdata.groupID
      })
      setDetailsLoad(iDdata);
    }
    getPermissions();
  }, []);

  useEffect(() => {
    sessionStorage.removeItem(
      'leaveType-listing-page-search-parameters-id'
    );
  }, []);

  useEffect(() => {
    trackPromise(
      getPermissions(),
      GetAllLeaveTypeDetails(),
      getGroupsForDropdown()
    );
  }, []);

  useEffect(() => {
    if (leaveTypeConfigurationID != 0) {
      handleClickEdit(leaveTypeConfigurationID)
    }
  }, [leaveTypeConfigurationID]);

  useEffect(() => {
    if (excel == true) {
      createFile()
    }
  }, [excel]);

  useEffect(() => {
    trackPromise(
      GetLeaveTypesByGroupID()
    )
  }, [leaveTypeDataList.groupID]);

  useEffect(() => {
    if (detailsLoad != null) {
      GetLeaveTypesByGroupID()
    }
  }, [detailsLoad]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWLEAVETYPE');
    var isAddEditScreen = permissions.find(p => p.permissionCode == 'ADDEDITLEAVETYPE');

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isAddEditScreen: isAddEditScreen !== undefined
    });
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function GetAllLeaveTypeDetails() {
    const result = await services.GetAllLeaveTypeDetails();
    setLeaveTypeData(result);
  }

  async function GetLeaveTypesByGroupID() {
    var result = await services.GetLeaveTypesByGroupID(leaveTypeDataList.groupID);
    setLeaveTypeData(result);
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
    setLeaveTypeDataList({
      ...leaveTypeDataList,
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

              toolTiptitle={"Add Leave Type"}
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
          'Business Division': x.groupName,
          'Short Form': x.shortForm,
          'Elaboration': x.elaboration,
          'Eligible': x.eligible,
          'Condition': x.condition,
          'Wages': x.wages || '-',
          'Status': x.isActive ? 'Active' : 'Inactive'
        }
        res.push(vr);
      });
    }
    return res;
  }

  async function createFile() {
    setExcel(false)
    var file = await createDataForExcel(leaveTypeData);
    var settings = {
      sheetName: 'Leave Types',
      fileName: 'Leave Types',
      writeOptions: {}
    }
    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })
    let dataA = [
      {
        sheet: 'Leave Types',
        columns: tempcsvHeaders,
        content: file
      }
    ]
    xlsx(dataA, settings);
  }

  return (
    <Page
      className={classes.root}
      title="Leave Types"
    >
      <Container maxWidth={false}>
        <Box mt={0}>
          <Card>
            <CardHeader
              title={cardTitle("Leave Types")}
            />
            <PerfectScrollbar>
              <Divider />
              <CardContent style={{ marginBottom: "2rem" }}>
                <Grid container spacing={3}>
                  <Grid item md={6} xs={12}>
                    <InputLabel shrink id="groupID">
                      Business Division
                    </InputLabel>
                    <TextField select
                      fullWidth
                      name="groupID"
                      size='small'
                      onChange={(e) => handleChange(e)}
                      value={leaveTypeDataList.groupID}
                      variant="outlined"
                    >
                      <MenuItem value="0">--All Business Division--</MenuItem>
                      {generateDropDownMenu(groups)}
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
              {leaveTypeData.length > 0 ?
                <CustomTable leaveTypeData={leaveTypeData} setLeaveTypeConfigurationID={setLeaveTypeConfigurationID} setExcel={setExcel} permissionList={permissionList} />
                : <SearchNotFound searchQuery="Leave Types" />}
            </PerfectScrollbar>
          </Card>
        </Box>
      </Container>
    </Page>
  );
};

