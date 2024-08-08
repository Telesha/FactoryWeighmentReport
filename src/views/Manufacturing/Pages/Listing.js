import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Button, Card, makeStyles, Container, CardHeader, CardContent, Divider, MenuItem, Grid, InputLabel, TextField } from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import MaterialTable from "material-table";
import VisibilityIcon from '@material-ui/icons/Visibility';
import { useAlert } from "react-alert";
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";

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
  row: {
    marginTop: '1rem'
  }
}));

const screenCode = 'MANUFACTURING';

export default function ManufacturingListing() {
  const [title, setTitle] = useState("Manufacturing");
  const classes = useStyles();
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [manufactureId, setManufactureID] = useState();
  const [manufacturingDetail, setManufacturingDetail] = useState({
    groupID: 0,
    factoryID: 0,
    date: null,
    statusID: 1
  });
  const [manufactureList, setManufactureList] = useState([]);
  const [manufacturePendingList, setManufacturePendingList] = useState([]);
  const [manufactureCompleteList, setManufactureCompleteList] = useState([]);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const navigate = useNavigate();
  const alert = useAlert();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/manufacturing/addEdit/' + encrypted)
  }
  const handleClickEdit = (blManufaturingID) => {
    encrypted = btoa(blManufaturingID.toString());
    navigate('/app/manufacturing/addEdit/' + encrypted);
  }

  const handleClickView = (blManufaturingID) => {
    encrypted = btoa(blManufaturingID.toString());
    navigate('/app/manufacturing/addEdit/' + encrypted);

  }

  const [value, setValue] = React.useState("1");
  const handleChangetab = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    trackPromise(
      getPermission());
    trackPromise(
      getGroupsForDropdown());
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoriesForDropdown());
    if (manufacturingDetail.groupID != 0) {
      trackPromise(
        GetManufacturingList());
    }
  }, [manufacturingDetail.groupID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWMANUFACTURING');
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
    setManufacturingDetail({
      ...manufacturingDetail,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroupList(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(manufacturingDetail.groupID);
    setFactoryList(factories);
  }


  async function GetManufacturingList() {
    const response = await services.GetManufacturingList(manufacturingDetail.groupID, manufacturingDetail.factoryID, manufacturingDetail.date, manufacturingDetail.statusID);
    if (response.statusCode == "Success" && response.data != null) {
      setManufactureList(response.data);
      if (response.data.length == 0) {
        alert.error("No records to display");
      }
    }
    else {
      alert.error(response.message);
    }


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

  function generateFactoryDropDownMenu(data) {
    let items = []
    if (data != null) {
      FactoryList.forEach(x => {
        items.push(<MenuItem key={x.factoryID} value={x.factoryID}>{x.factoryName}</MenuItem>)
      });
    }
    return items
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setManufacturingDetail({
      ...manufacturingDetail,
      [e.target.name]: value
    });
    setManufactureList([]);
  }

  function handleDateChange(value) {
    setManufacturingDetail({
      ...manufacturingDetail,
      date: value
    });
    setManufactureList([]);
  }

  function clearFormFields() {
    setManufacturingDetail({
      ...manufacturingDetail,
      statusID: 0,
      date: null
    });
    setManufactureList([]);
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
            toolTiptitle={"Add Manufacturing"}
          />
        </Grid>
      </Grid>
    )
  }

  return (
    <Fragment>
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: manufacturingDetail.groupID,
              factoryID: manufacturingDetail.factoryID,
              date: manufacturingDetail.date,
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                date: Yup.date().typeError('Invalid date').nullable()
              })
            }
            onSubmit={() => trackPromise(GetManufacturingList())}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              touched
            }) => (
              <form onSubmit={handleSubmit}>
                <Box mt={0}>
                  <Card>
                    <CardHeader title={cardTitle(title)} />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="groupID">
                              Group *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="groupID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={manufacturingDetail.groupID}
                              variant="outlined"
                              id="groupID"
                              disabled={!permissionList.isGroupFilterEnabled}
                              size= 'small'
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(GroupList)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="factoryID">
                              Factory *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.factoryID && errors.factoryID)}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              name="factoryID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={manufacturingDetail.factoryID}
                              variant="outlined"
                              id="factoryID"
                              disabled={!permissionList.isFactoryFilterEnabled}
                              size= 'small'
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateFactoryDropDownMenu(FactoryList)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="date">
                              Manufacture From Date
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                error={Boolean(touched.date && errors.date)}
                                helperText={touched.date && errors.date}
                                autoOk
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                id="date"
                                name="date"
                                value={manufacturingDetail.date}
                                onChange={(e) => handleDateChange(e)}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                InputProps={{ readOnly: true }}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="statusID">
                              Status
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="statusID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={manufacturingDetail.statusID}
                              variant="outlined"
                              id="statusID"
                              size= 'small'
                            >
                              <MenuItem value="0">All</MenuItem>
                              <MenuItem value="1">Pending</MenuItem>
                              <MenuItem value="2">Complete</MenuItem>
                            </TextField>
                          </Grid>
                        </Grid>
                        <Box display="flex" justifyContent="flex-end" p={2} >
                          <Button
                            color="primary"
                            type="reset"
                            variant="outlined"
                            onClick={() => clearFormFields()}
                            size= 'small'
                          >
                            Clear
                          </Button>
                          <div>&nbsp;</div>
                          <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                            size= 'small'
                          >
                            Search
                          </Button>
                        </Box>
                      </CardContent>
                      <Box minWidth={1050}>
                        {manufactureList.length > 0 ?
                          <MaterialTable
                            title="Multiple Actions Preview"
                            columns={[
                              { title: 'Date', field: 'fromDateOfManufaturing', render: rowData => rowData.fromDateOfManufaturing.split('T')[0] },
                              { title: 'Factory', field: 'factoryName' },
                              { title: 'Manufacture Number', field: 'manufactureNumber' },
                              {
                                title: 'Status', field: 'statusID', lookup: {
                                  0: 'All',
                                  1: 'Pending',
                                  2: 'Complete',
                                }
                              },
                            ]}
                            data={manufactureList}
                            options={{
                              exportButton: false,
                              showTitle: false,
                              headerStyle: { textAlign: "left", height: '1%' },
                              cellStyle: { textAlign: "left" },
                              columnResizable: false,
                              actionsColumnIndex: -1,
                              pageSize: 10
                            }}
                            actions={[
                              rowData => ({
                                hidden: (rowData.statusID !== 1),
                                icon: 'edit',
                                tooltip: 'Edit',
                                onClick: (event, rowData) => handleClickEdit(rowData.blManufaturingID)
                              }),
                              rowData => ({
                                hidden: (rowData.statusID !== 2),
                                icon: VisibilityIcon,
                                tooltip: 'Edit',
                                onClick: (event, rowData) => handleClickView(rowData.blManufaturingID)
                              })
                            ]}
                          />
                          : null}
                      </Box>
                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            )}
          </Formik>
        </Container>
      </Page>
    </Fragment>
  );
}
