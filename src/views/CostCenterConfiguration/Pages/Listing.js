import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Card, makeStyles, Container, CardHeader, CardContent, Divider, MenuItem, Grid, InputLabel, TextField, Button } from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import MaterialTable from "material-table";

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

const screenCode = 'COSTCENTERCONFIGURATION';
export default function CostCenterConfigurationListing() {
  const classes = useStyles();
  const [configurationData, setConfigurationData] = useState([]);
  const [groups, setGroups] = useState();
  const [estates, setEstates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [costCenterList, setCostCenterList] = useState({
    groupID: '0',
    estateID: '0',
    divisionID: '0'
  })

  const navigate = useNavigate();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/costCenterConfiguration/addedit/' + encrypted);
  }

  const handleClickEdit = (configurationID) => {
    encrypted = btoa(configurationID.toString());
    navigate('/app/costCenterConfiguration/addedit/' + encrypted);
  }

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  useEffect(() => {
    trackPromise(
      getPermissions(),
      getGroupsForDropdown(),
    );
  }, []);

  useEffect(() => {
    setCostCenterList((prevState) => ({
      ...prevState,
      divisionID: "0"
    }));
  }, [costCenterList.groupID]);

  useEffect(() => {
    getEstateDetailsByGroupID();
  }, [costCenterList.groupID]);

  useEffect(() => {
    getDivisionDetailsByEstateID();
  }, [costCenterList.estateID]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWCOSTCENTERCONFIGURATION');

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

    setCostCenterList({
      ...costCenterList,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      estateID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getEstateDetailsByGroupID() {
    var response = await services.getEstateDetailsByGroupID(costCenterList.groupID);
    setEstates(response);
  }

  async function getDivisionDetailsByEstateID() {
    var response = await services.getDivisionDetailsByEstateID(costCenterList.estateID);
    const elementCount = response.reduce((count) => count + 1, 0);
    var generated = generateDropDownMenu(response)
    if (elementCount === 1) {
      setCostCenterList((prevState) => ({
        ...prevState,
        divisionID: generated[0].props.value,
      }));
    }
    setDivisions(response);
  }

  async function GetDetails() {
    var response = await services.getConfigurationDataByCostCenterID(costCenterList.groupID, costCenterList.estateID, costCenterList.divisionID);
    setConfigurationData(response);
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
    setCostCenterList({
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
          <PageHeader
            onClick={handleClick}
            isEdit={true}
            toolTiptitle={"Add Section Item"}
          />
        </Grid>
      </Grid>
    )
  }

  return (
    <Page
      className={classes.root}
      title="Cost Center Configurations"
    >
      <Container maxWidth={false}>
        <Box mt={0}>
          <Card>
            <CardHeader
              title={cardTitle("Cost Center Configurations")}
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
                      value={costCenterList.groupID}
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
                      value={costCenterList.estateID}
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
                      value={costCenterList.divisionID}
                      variant="outlined"
                      id="divisionID"
                    >
                      <MenuItem value={0}>--Select Sub Division--</MenuItem>
                      {generateDropDownMenu(divisions)}
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
              <Box display="flex" flexDirection="row-reverse" p={2} >
                <Button
                  color="primary"
                  variant="contained"
                  onClick={() => trackPromise(GetDetails())}
                >
                  Search
                </Button>
              </Box>
              <br />
              {configurationData.length != 0 ?
                <Box minWidth={1050}>
                  <MaterialTable
                    title="Multiple Actions Preview"
                    columns={[
                      { title: 'Cost Center', field: 'costCenterName' },
                      {
                        title: 'Config Type',
                        field: 'configurationTypeID',
                        render: rowData => rowData.configurationTypeID == 1 ? 'Value'
                          : rowData.configurationTypeID == 2 ? 'Min / Max'
                            : rowData.configurationTypeID == 3 ? 'Boolean' : ''
                      },
                      { title: 'Configuration', field: 'configurationMasterName' },
                      { title: 'M Unit', field: 'measuringUnitName' },
                      { title: 'Config Value', field: 'configurationValue' },
                      { title: 'Min', field: 'minValue' },
                      { title: 'Max', field: 'maxValue' },
                      { title: 'Is Apply', field: 'IsApply', render: rowData => rowData.isApply == true ? 'Yes' : 'No' },
                      { title: 'Status', field: 'isActive', render: rowData => rowData.isActive == true ? 'Active' : 'Inactive' },
                    ]}
                    data={configurationData}
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
                        icon: 'mode',
                        tooltip: 'Edit Configuration',
                        onClick: (event, rowData) => { handleClickEdit(rowData.configurationID) }
                      },
                    ]}
                  />
                </Box> : null}
            </PerfectScrollbar>
          </Card>
        </Box>
      </Container>
    </Page>
  );
};

