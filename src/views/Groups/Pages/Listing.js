import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  Grid,
  makeStyles,
  Container,
  CardHeader,
  Divider
} from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import MaterialTable from "material-table";
import SearchNotFound from 'src/views/Common/SearchNotFound';
import authService from '../../../utils/permissionAuth';
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

const screenCode = 'GROUP';
export default function GroupListing() {
  const classes = useStyles();
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);
  const [masterGroupID, setGroupID] = useState(0);
  const [excel, setExcel] = useState(false);
  const [csvHeaders, SetCsvHeaders] = useState([]);
  const handleLimitChange = (event) => {
    setLimit(event.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const [groupData, setGroupData] = useState([]);

  const [permissionList, setPermissions] = useState({
    isAddEditScreen: false
  });

  const navigate = useNavigate();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/groups/addedit/' + encrypted);
  }

  const handleClickEdit = (masterGroupID) => {
    encrypted = btoa(masterGroupID);
    navigate('/app/groups/addedit/' + encrypted);
  }

  useEffect(() => {
    trackPromise(
      getPermission(),
      GetAllGroups()
    );
  }, []);

  useEffect(() => {
    if (excel == true) {
      createFile()
    }
  }, [excel]);

  useEffect(() => {
    if (masterGroupID != 0) {
      handleClickEdit(masterGroupID)
    }
  }, [masterGroupID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWGROUP');
    var isAddEditScreen = permissions.find(p => p.permissionCode == 'ADDEDITGROUP');

    if (isAuthorized === undefined) {
      navigate('/404');
    }

    setPermissions({
      ...permissionList,
      isAddEditScreen: isAddEditScreen !== undefined
    });
  }

  async function GetAllGroups() {
    const result = await services.GetAllGroups();
    setGroupData(result);
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
              toolTiptitle={"Add Groups"}
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
          'Company Code': x.masterGroupCode,
          'Short Code': x.shortCode,
          'Company Name': x.masterGroupName,
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
      sheetName: 'Company',
      fileName: 'Company',
      writeOptions: {}
    }

    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let dataA = [
      {
        sheet: 'Company',
        columns: tempcsvHeaders,
        content: file
      }
    ]
    xlsx(dataA, settings);
  }

  return (
    <Page
      className={classes.root}
      title="Company"
    >
      <Container maxWidth={false}>
        <Box mt={0}>
          <Card>
            <CardHeader
              title={cardTitle("Company")}
            />
            <PerfectScrollbar>
              <Divider />
              {groupData.length > 0 ?
                <CustomTable groupData={groupData} setGroupID={setGroupID} setExcel={setExcel} permissionList={permissionList.isAddEditScreen} />
                : <SearchNotFound searchQuery="Company" />}
            </PerfectScrollbar>
          </Card>
        </Box>
      </Container>
    </Page>
  );
};

