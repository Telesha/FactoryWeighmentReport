import React, { useState, useEffect, createContext } from 'react';
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

const screenCode = 'EMPLOYEECARDCREATION';
export default function EmployeeCardCreationListing() {
  const classes = useStyles();
  const [cardDetailsData, setCardDetailsData] = useState([]);
  const [groups, setGroups] = useState();
  const [estates, setEstates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [empFilterList, setEmpFilterList] = useState({
    groupID: '0',
    estateID: '0',
    divisionID: '0'
  })

  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/app/employeeCardCreation/addedit');
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
    if(empFilterList.groupID > 0 && empFilterList.estateID > 0 && empFilterList.divisionID > 0){
      trackPromise(getCardDetailsByGroupIDEstateIDDivisionID());
    }
  }, [empFilterList.groupID,empFilterList.estateID,empFilterList.divisionID]);

  useEffect(() => {
    if(empFilterList.groupID >0){
      trackPromise(getEstateDetailsByGroupID());
    }
  }, [empFilterList.groupID]);

  useEffect(() => {
    if(empFilterList.estateID > 0){ 
      trackPromise(getDivisionDetailsByEstateID());
    }
  }, [empFilterList.estateID]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWEMPLOYEECARDCREATION');

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

    setEmpFilterList({
      ...empFilterList,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      estateID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getCardDetailsByGroupIDEstateIDDivisionID() {
    const cardData = await services.getCardDetailsByGroupIDEstateIDDivisionID(empFilterList.groupID, empFilterList.estateID, empFilterList.divisionID);
    cardData.forEach(x => {
     x.createdDate = x.createdDate.split('T')[0];
     });
    setCardDetailsData(cardData);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getEstateDetailsByGroupID() {
    var response = await services.getEstateDetailsByGroupID(empFilterList.groupID);
    setEstates(response);
  }

  async function getDivisionDetailsByEstateID() {
    var response = await services.getDivisionDetailsByEstateID(empFilterList.estateID); 
    setDivisions(response);
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
    setEmpFilterList({
      ...empFilterList,
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
            toolTiptitle={"Create New Cards"}
          />
        </Grid>
      </Grid>
    )
  }

  return (
    <Page
      className={classes.root}
      title="Employee Cards"
    >
      <Container maxWidth={false}>
        <Box mt={0}>
          <Card>
            <CardHeader
              title={cardTitle("Available Employee Cards")}
            />
            <PerfectScrollbar>
              <Divider />
              <CardContent style={{ marginBottom: "2rem" }}>
                <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                              <InputLabel shrink id="groupID">  
                                Group  *
                              </InputLabel>
                              <TextField select
                                fullWidth
                                name="groupID"
                                onChange={(e) => handleChange(e)}
                                value={empFilterList.groupID}
                                variant="outlined"
                                size='small'
                                InputProps={{
                                  readOnly: !permissionList.isGroupFilterEnabled,
                              }}
                              >
                                <MenuItem value="0">--Select Group--</MenuItem>
                                {generateDropDownMenu(groups)}
                              </TextField>
                          </Grid>

                           <Grid item md={4} xs={12}>
                              <InputLabel shrink id="estateID">
                                Garden *
                              </InputLabel>
                              <TextField select 
                                fullWidth 
                                name="estateID" 
                                size='small'
                                onChange={(e) => {
                                  handleChange(e)
                                }}
                                value={empFilterList.estateID}
                                variant="outlined"
                                id="estateID"
                                InputProps={{
                                  readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                }}
                              >
                                <MenuItem value={0}>--Select Garden--</MenuItem>
                                {generateDropDownMenu(estates)}
                              </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                              <InputLabel shrink id="divisionID">
                                Cost Center 
                              </InputLabel>
                              <TextField select 
                                fullWidth 
                                name="divisionID"
                                size='small' 
                                onChange={(e) => {
                                  handleChange(e)
                                }}
                                value={empFilterList.divisionID}
                                variant="outlined"
                                id="divisionID"
                              >
                                <MenuItem value={0}>--Select Cost Center--</MenuItem>
                                {generateDropDownMenu(divisions)}
                              </TextField>
                          </Grid> 
                </Grid>
              </CardContent>
              <Box minWidth={1050}> 
                <MaterialTable
                  title="Multiple Actions Preview"
                  columns={[
                    { title: 'Card ID', field: 'cardID' },
                    { title: 'Card Number', field: 'cardNumber' },
                    { title: 'Created By', field: 'createdBy'},
                    { title: 'Created Date', field: 'createdDate'}   
                  ]}
                  data={cardDetailsData}
                  options={{
                    exportButton: false,
                    showTitle: false,
                    headerStyle: { textAlign: "left", height: '1%' },
                    cellStyle: { textAlign: "left" },
                    columnResizable: false,
                    actionsColumnIndex: -1
                  }}
                />
              </Box>
            </PerfectScrollbar>
          </Card>
        </Box>
      </Container>
    </Page>
  );
};
