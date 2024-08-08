import React, { useState, useEffect, createContext } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Card, makeStyles, Container, CardHeader, CardContent, Divider, MenuItem, Grid, InputLabel, TextField } from '@material-ui/core';
import Page from 'src/components/Page';
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

const screenCode = 'EMPLOYEECARDASSIGN';
export default function EmployeeCardAssignListing() {
  const classes = useStyles();
  const [employeesData, setEmployeesData] = useState([]);
  const [groups, setGroups] = useState();
  const [estates, setEstates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [empFilterList, setEmpFilterList] = useState({
    groupID: '0',
    estateID: '0',
    divisionID: '0'
  })

  const navigate = useNavigate();
  let encrypted = "";

  const handleClickEdit = (employeeID) => {
    encrypted = btoa(employeeID.toString());
    navigate('/app/employeeCardAssign/addedit/' + encrypted);
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
        getEmployeeDetailsByGroupIDEstateIDDivisionID();
    }
  }, [empFilterList.groupID,empFilterList.estateID,empFilterList.divisionID]);

  useEffect(() => {
    getEstateDetailsByGroupID();
  }, [empFilterList.groupID]);

  useEffect(() => {
    getDivisionDetailsByEstateID();
  }, [empFilterList.estateID]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWEMPLOYEECARDASSIGN');

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

  async function getEmployeeDetailsByGroupIDEstateIDDivisionID() {
    const empDetails = await services.getEmployeeDetailsByGroupIDEstateIDDivisionID(empFilterList.groupID,empFilterList.estateID,empFilterList.divisionID);
    setEmployeesData(empDetails);
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
      </Grid>
    )
  }

  return (
    <Page
      className={classes.root}
      title="UnAssign Employees"
    >
      <Container maxWidth={false}>
        <Box mt={0}>
          <Card>
            <CardHeader
              title={cardTitle("Unassign Employees")}
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
                                Cost Center * 
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
                    { title: 'Employee ID', field: 'employeeID'},
                    { title: 'Employee Code', field: 'employeeCode' },
                    { title: 'Employee Name', field: 'employeeName' },
                    { title: 'NIC No', field: 'nicNumber'}
                  ]}
                  data={employeesData}
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
                      tooltip: 'Assign Card',
                      onClick: (event, rowData) => { handleClickEdit(rowData.employeeID) }
                    },
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
