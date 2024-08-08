import React, { useState, useEffect } from 'react';
import { trackPromise } from 'react-promise-tracker';
import {
  Box,
  Card,
  makeStyles,
  Container,
  Divider,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  InputLabel,
  CardHeader,
  Button
  } from '@material-ui/core';
import services from '../Services';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import PerfectScrollbar from 'react-perfect-scrollbar';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import { useNavigate } from 'react-router-dom';
import { LoadingComponent } from '../../../utils/newLoader';
import MaterialTable from "material-table";
import { Formik } from 'formik';
import * as Yup from "yup";

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

const screenCode = "LEAVETYPECONFIGURATION";
export default function GardenLeaveTypeConfigurationListing(){

  const classes = useStyles();
  const navigate = useNavigate();

  const [permissionList, setPermissions] = useState({
      isGroupFilterEnabled: false,
      isFactoryFilterEnabled: false,
    });
  const [factories, setFactories] = useState();
  const [leaveTypeList, setLeaveTypeList] = useState({
    factoryID: '0',
  })
  const[leaveTypeData, setLeaveTypeData] = useState()
  useEffect(() => {
      trackPromise(
        getPermission()
      );
    }, []);

  async function getPermission() {
  var permissions = await authService.getPermissionsByScreen(screenCode);
  var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWLEAVETYPECONFIGURATION');

  if (isAuthorized === undefined) {
      navigate('/404');
  }
  var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

  setPermissions({
      ...permissionList,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
  });

  setLeaveTypeList({
      ...leaveTypeList,
      factoryID: parseInt(tokenService.getFactoryIDFromToken()),
  });
  trackPromise(
    getAllFactories())
  }

  async function getAllFactories() {
    const factoryList = await services.getAllFactories();
    setFactories(factoryList);
  }

  async function getGardenLeaveTypesByFactoryID(){
    const leaveTypes = await services.getGardenLeaveTypesByFactoryID(leaveTypeList.factoryID)
    setLeaveTypeData(leaveTypes)
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

  let encryptedID = "";
  const handleClick = () => {
    encryptedID = btoa('0');
    navigate('/app/gardenLeaveTypeConfiguration/addEdit/' + encryptedID);
  }

  function editLeaveTypeDetails(leaveTypeID){
    encryptedID = btoa(leaveTypeID.toString());
    navigate('/app/gardenLeaveTypeConfiguration/addEdit/' + encryptedID);
  }
  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setLeaveTypeList({
      ...leaveTypeList,
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
            toolTiptitle={"Add Garden Leave Type Configuration"}
          />
        </Grid>
      </Grid>
    )
  }
  return (
    <Page
      className={classes.root}
      title="Garden Leave Type Configuration"
    >
      <Container maxWidth={false}>
        <LoadingComponent />
        <Formik
          initialValues={{
            groupID: leaveTypeList.groupID,
            factoryID: leaveTypeList.factoryID,
          }}
          validationSchema={
            Yup.object().shape({
              factoryID: Yup.number().required('Garden is required').min("1", 'Select a Garden'),
            })
          }
          onSubmit={() => trackPromise(getGardenLeaveTypesByFactoryID())}
          enableReinitialize
        >
          {({
            errors,
            handleBlur,
            handleSubmit,
            touched,
            values
          }) => (
        <form onSubmit={handleSubmit}>
        <Box mt={0}>
          <Card>
            <CardHeader
              title={cardTitle("Garden Leave Type Configuration")}
            />
            <PerfectScrollbar>
              <Divider />
              <CardContent style={{ marginBottom: "2rem" }}>
                <Grid container spacing={3}>
                  <Grid item md={4} xs={12}>
                    <InputLabel shrink id="factoryID">
                      Garden *
                    </InputLabel>
                    <TextField select
                     error={Boolean(touched.factoryID && errors.factoryID)}
                     fullWidth
                     helperText={touched.factoryID && errors.factoryID}
                      fullWidth
                      size='small'
                      name="factoryID"
                      onChange={(e) => handleChange(e)}
                      value={leaveTypeList.factoryID}
                      variant="outlined"
                      id="factoryID"
                      InputProps={{
                        readOnly: !permissionList.isFactoryFilterEnabled,
                      }}
                    >
                      <MenuItem value="0">--Select Garden--</MenuItem>
                      {generateDropDownMenu(factories)}
                    </TextField>
                  </Grid>
                </Grid>
                <Box display="flex" flexDirection="row-reverse" p={2} >
                  <Button
                    color="primary"
                    type="submit"
                    variant="contained"
                  >
                    Search
                  </Button>
                </Box>
              </CardContent>
              <Box minWidth={1000}>
                <MaterialTable
                  title="Garden Leave Type Preview"
                  columns={[
                    { title: 'Short Form', field: 'shortForm' },
                    { title: 'Elaboration', field: 'elaboration' },
                    { title: 'Eligible', field: 'eligible' },
                    { title: 'Condition', field: 'condition' },
                    { title: 'Wages', field: 'wages' },
                    {
                      title: 'Status', field: 'isActive',
                      render: rowData => {
                        if (rowData.isActive) {
                          return "Active"
                        } else {
                          return "Inactive"
                        }
                      }
                    }
                  ]}
                  data={leaveTypeData}
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
                      tooltip: 'Edit Garden Leave Type',
                      onClick: (event, leaveTypeDataData) => editLeaveTypeDetails(leaveTypeDataData.leaveTypeConfigurationID)
                    }
                  ]}
                />
              </Box>
            </PerfectScrollbar>
          </Card>
        </Box>
        </form>
          )}
        </Formik>
      </Container>
    </Page>
  );
}