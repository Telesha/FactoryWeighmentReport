import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  Button,
  makeStyles,
  Container,
  CardHeader,
  CardContent,
  Divider,
  MenuItem,
  Grid,
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
import tokenService from '../../../utils/tokenDecoder'
import { LoadingComponent } from './../../../utils/newLoader';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
}));

var screenCode = "SELLERCONTRACT"

export default function SellerContactListing() {

  const navigate = useNavigate();
  const classes = useStyles();
  const [groups, setGroups] = useState([]);
  const [factories, setFactories] = useState([]);
  const [SellerData, setSellerData] = useState([]);
  const [sellerContractData, setSellerContractData] = useState([]);
  const [isViewTable, setIsViewTable] = useState(true);
  const [SellerContact, setSellerContact] = useState({
    groupID: 1,
    factoryID: 1
  })
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  let encrypted = "";

  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/sellerContact/addEdit/' + encrypted)
  }

  const handleClickEdit = (sellerContractID) => {
    encrypted = btoa(sellerContractID.toString());
    navigate('/app/sellerContact/addEdit/' + encrypted);
  }
  useEffect(() => {
    trackPromise(getPermissions());
    trackPromise(
      getGroupsForDropdown());
  }, [])

  useEffect(() => {
    trackPromise(
      getFactoriesForDropdown());
  }, [SellerContact.groupID]);

  useEffect(() => {
    trackPromise(
      getSellerContractDetails()
    )
    checkDisbursement();
  }, [SellerContact.factoryID]);


  async function getPermissions() {

    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWSELLERCONTRACT');

    if (isAuthorized === undefined) {
      navigate('/404');
    }

    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
    });

    setSellerContact({
      ...SellerContact,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })

  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoriesByGroupID(SellerContact.groupID);
    setFactories(factories);
  }

  function checkDisbursement() {
    if (SellerContact.factoryID === '0') {
      setIsViewTable(true);
    }
    else {
      setIsViewTable(false);
    }
  }

  async function getSellerContractDetails() {
    const response = await services.getSellerContractDetails(SellerContact.groupID, SellerContact.factoryID);


    if (response.statusCode == "Success" && response.data != null) {
      setSellerContractData(response.data);
      if (response.data.length == 0) {
        alert.error("No records to display");
      }
    }
    else {
      alert.error(response.message);

    }

  }

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {titleName}
        </Grid>
        <Grid item md={2} xs={12}>
          <PageHeader
            onClick={handleClick}
            isEdit={true}
            toolTiptitle={"Add Seller Contract"}
          />
        </Grid>
      </Grid>
    )
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setSellerContact({
      ...SellerContact,
      [e.target.name]: value
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

  return (
    <Page
      className={classes.root}
      title="Seller Contract"
    >
      <LoadingComponent />
      <Container maxWidth={false}>
        <Box mt={0}>
          <Card>
            <CardHeader
              title={cardTitle("Seller Contract")}
            />
            <PerfectScrollbar>
              <Divider />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item md={4} xs={12}>
                    <InputLabel shrink id="groupID">
                      Group  *
                    </InputLabel>
                    <TextField select
                      fullWidth
                      name="groupID"
                      onChange={(e) => handleChange(e)}
                      value={SellerContact.groupID}
                      variant="outlined"
                      disabled={!permissionList.isGroupFilterEnabled}
                      size='small'
                    >
                      <MenuItem value="0">--Select Group--</MenuItem>
                      {generateDropDownMenu(groups)}
                    </TextField>
                  </Grid>

                  <Grid item md={4} xs={12}>
                    <InputLabel shrink id="factoryID">
                      Factory *
                    </InputLabel>
                    <TextField select
                      fullWidth
                      name="factoryID"
                      onChange={(e) => handleChange(e)}
                      value={SellerContact.factoryID}
                      variant="outlined"
                      id="factoryID"
                      disabled={!permissionList.isFactoryFilterEnabled}
                      size='small'
                    >
                      <MenuItem value="0">--Select Factory--</MenuItem>
                      {generateDropDownMenu(factories)}
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
              <Box minWidth={1000} hidden={isViewTable}>
                <MaterialTable
                  title="Multiple Actions Preview"
                  columns={[
                    { title: 'Date of Selling', field: 'sellingDate', render: rowData => rowData.sellingDate.split('T')[0] },
                    { title: 'Invoice No', field: 'invoiceNo' },
                    { title: 'Selling Mark', field: 'sellingMarkName' },
                    { title: 'Broker', field: 'brokerName' },
                    { title: 'Grade', field: 'gradeName' },
                    { title: 'Buyer', field: 'buyerName' },
                    { title: 'Status', field: 'statusName' },

                  ]}
                  data={sellerContractData}
                  options={{
                    exportButton: false,
                    showTitle: false,
                    headerStyle: { textAlign: "left", height: '1%' },
                    cellStyle: { textAlign: "left" },
                    columnResizable: false,
                    actionsColumnIndex: -1
                  }}
                  actions={[
                    {
                      icon: 'edit',
                      tooltip: 'Edit Contract',
                      onClick: (event, rowData) => handleClickEdit(rowData.sellerContractID)
                    }
                  ]}
                />
              </Box>
            </PerfectScrollbar>
          </Card>
        </Box>
      </Container>
    </Page>
  );
};

