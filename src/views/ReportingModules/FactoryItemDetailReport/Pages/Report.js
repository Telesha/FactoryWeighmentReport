import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader,
  MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@material-ui/core';
import MaterialTable from "material-table";
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
import { useAlert } from "react-alert";
import { startOfMonth, endOfMonth, addMonths } from 'date-fns';
import DateRangeSelectorComponent from '../../InquiryRegistry/Utils/DateRangeSelector';
import Popover from '@material-ui/core/Popover';
import EventIcon from '@material-ui/icons/Event';
import xlsx from 'json-as-xlsx';
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePDF';
import moment from 'moment';
import { LoadingComponent } from './../../../../utils/newLoader';

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
  colorCancel: {
    backgroundColor: "red",
  },
  colorRecord: {
    backgroundColor: "green",
  },
}));

const screenCode = 'FACTORYITEMDETAILREPORT';

export default function FactoryItemDetailReport(props) {
  const [title, setTitle] = useState("Factory Item Detail Report");
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [routeList, setRouteList] = useState();
  const [ItemCategoryList, setItemCategoryList] = useState();
  const [factoryItems, setFactoryItems] = useState();
  const [itemRequestDetail, setItemRequestDetail] = useState({
    groupID: 0,
    factoryID: 0,
    routeID: 0,
    registrationNumber: '',
    itemCategoryID: 0,
    factoryItemID: 0,
  });
  const [factoryItemList, setFactoryItemList] = useState([]);
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    groupName: "0",
    factoryName: "0",
    startDate: '',
    endDate: ''
  });
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleClickPop = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const [DateRange, setDateRange] = useState({
    startDate: startOfMonth(addMonths(new Date(), -5)),
    endDate: endOfMonth(addMonths(new Date(), -0))
  });
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  const navigate = useNavigate();
  const alert = useAlert();
  const componentRef = useRef();
  const [csvHeaders, SetCsvHeaders] = useState([]);

  useEffect(() => {
    trackPromise(
      getPermission()
    );
    trackPromise(
      getGroupsForDropdown(),
    );
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoriesForDropdown());
  }, [itemRequestDetail.groupID]);

  useEffect(() => {
    trackPromise(
      getRoutesByFactoryID());
  }, [itemRequestDetail.factoryID]);

  useEffect(() => {
    trackPromise(getAllActiveItemCategory())
  }, []);

  useEffect(() => {
    trackPromise(
      getfactoryItemsForDropDown());
  }, [itemRequestDetail.groupID, itemRequestDetail.factoryID, itemRequestDetail.itemCategoryID]);

  useEffect(() => {
    setItemRequestDetail({
      ...itemRequestDetail,
      registrationNumber: '',
      itemCategoryID: 0,
      factoryItemID: 0,
    })
  }, [itemRequestDetail.routeID])

  useEffect(() => {
    setItemRequestDetail({
      ...itemRequestDetail,
      registrationNumber: '',
      factoryItemID: 0,
    }
    )
  }, [itemRequestDetail.itemCategoryID])

  useEffect(() => {
    setItemRequestDetail({
      ...itemRequestDetail,
      registrationNumber: ''
    })
  }, [itemRequestDetail.factoryItemID])

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWFACTORYITEMDETAILREPORT');

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

    setItemRequestDetail({
      ...itemRequestDetail,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroupList(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(itemRequestDetail.groupID);
    setFactoryList(factories);
  }

  async function getRoutesByFactoryID() {
    const routes = await services.getRoutesForDropDown(itemRequestDetail.factoryID);
    setRouteList(routes);
  }

  async function getAllActiveItemCategory() {
    const result = await services.getAllActiveItemCategory();
    setItemCategoryList(result);
  }

  async function getfactoryItemsForDropDown() {
    const factoryItem = await services.getfactoryItemsByGroupIDFactoryIDItemCategoryID(itemRequestDetail.groupID, itemRequestDetail.factoryID, itemRequestDetail.itemCategoryID);
    setFactoryItems(factoryItem);
  }

  async function GetFactoryItemDetails() {

    let model = {
      groupID: parseInt(itemRequestDetail.groupID),
      factoryID: parseInt(itemRequestDetail.factoryID),
      routeID: parseInt(itemRequestDetail.routeID),
      itemCategoryID: parseInt(itemRequestDetail.itemCategoryID),
      factoryItemID: parseInt(itemRequestDetail.factoryItemID),
      registrationNumber: itemRequestDetail.registrationNumber,
      startDate: moment(DateRange.startDate.toString()).format().split('T')[0],
      endDate: moment(DateRange.endDate.toString()).format().split('T')[0],
    }
    getSelectedDropdownValuesForReport(model);

    const itemData = await services.GetFactoryItemDetailsForReport(model);

    if (itemData.statusCode == "Success" && itemData.data != null) {
      setFactoryItemList(itemData.data);
      createDataForExcel(itemData.data);
      if (itemData.data.length == 0) {
        alert.error("No records to display");
      }
    }
    else {
      alert.error(itemData.message);
    }
  }

  async function createDataForExcel(array) {
    var res = [];
    if (array != null) {
      array.map(x => {
        var vr = {
          'Route Name': x.routeName,
          'Date': x.date.split('T')[0],
          'Reg No': x.registrationNumber,
          'Supplier Name': x.name,
          'Category': x.categoryName,
          'Item': x.itemName,
          'Quantity': x.approvedQuantity,
          'Total Price (Rs)': x.totalPrice.toFixed(2),
        }
        res.push(vr);
      });
    }
    return res;
  }

  async function createFile() {

    var file = await createDataForExcel(factoryItemList);
    var settings = {
      sheetName: 'Factory Item Detail Report',
      fileName: 'Factory Item Detail Report ' + selectedSearchValues.groupName + ' - ' + selectedSearchValues.factoryName + '  ' + selectedSearchValues.startDate + ' - ' + selectedSearchValues.endDate,
      writeOptions: {}
    }

    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let dataA = [
      {
        sheet: 'Factory Item Detail Report',
        columns: tempcsvHeaders,
        content: file
      }
    ]
    xlsx(dataA, settings);
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

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setItemRequestDetail({
      ...itemRequestDetail,
      [e.target.name]: value
    });
    setFactoryItemList([]);
  }

  function getSelectedDropdownValuesForReport(searchForm) {
    var startDate = moment(searchForm.startDate.toString()).format().split('T')[0]
    var endDate = moment(searchForm.endDate.toString()).format().split('T')[0]
    setSelectedSearchValues({
      ...selectedSearchValues,
      groupName: GroupList[searchForm.groupID],
      factoryName: FactoryList[searchForm.factoryID],
      startDate: [startDate],
      endDate: [endDate]
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
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: itemRequestDetail.groupID,
              factoryID: itemRequestDetail.factoryID
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
              })
            }
            onSubmit={() => trackPromise(GetFactoryItemDetails())}
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
                          <Grid item md={3} xs={8}>
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
                              value={itemRequestDetail.groupID}
                              variant="outlined"
                              id="groupID"
                              disabled={!permissionList.isGroupFilterEnabled}
                              size = 'small'
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(GroupList)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={8}>
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
                              value={itemRequestDetail.factoryID}
                              variant="outlined"
                              id="factoryID"
                              disabled={!permissionList.isFactoryFilterEnabled}
                              size = 'small'
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(FactoryList)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="routeID">
                              Route
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="routeID"
                              onChange={(e) => handleChange(e)}
                              value={itemRequestDetail.routeID}
                              variant="outlined"
                              id="routeID"
                              size = 'small'
                            >
                              <MenuItem value="0">--Select Route--</MenuItem>
                              {generateDropDownMenu(routeList)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="itemCategoryID">
                              Item Category
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="itemCategoryID"
                              onChange={(e) => handleChange(e)}
                              value={itemRequestDetail.itemCategoryID}
                              size = 'small'
                              variant="outlined" >
                              <MenuItem value={0}>--Select Item Category--</MenuItem>
                              {generateDropDownMenu(ItemCategoryList)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="factoryItemID">
                              Factory Item
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="factoryItemID"
                              onChange={(e) => handleChange(e)}
                              value={itemRequestDetail.factoryItemID}
                              variant="outlined"
                              id="factoryItemID"
                              size = 'small'
                            >
                              <MenuItem value="0">--Select Factory Item--</MenuItem>
                              {generateDropDownMenu(factoryItems)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="registrationNumber">
                              Registration Number
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="registrationNumber"
                              onChange={(e) => handleChange(e)}
                              value={itemRequestDetail.registrationNumber}
                              variant="outlined"
                              id="registrationNumber"
                              size = 'small'
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12} >
                            <InputLabel shrink>
                              Date *
                            </InputLabel>
                            <Button
                              aria-describedby={id}
                              variant="contained"
                              fullWidth
                              color="primary"
                              onClick={handleClickPop}
                              size="medium"
                              endIcon={<EventIcon />}
                            >
                              {DateRange.startDate.toLocaleDateString() + " - " + DateRange.endDate.toLocaleDateString()}
                            </Button>
                            <Popover
                              id={id}
                              open={open}
                              anchorEl={anchorEl}
                              onClose={handleClose}
                              anchorOrigin={{
                                vertical: 'center',
                                horizontal: 'left',
                              }}
                              transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                              }}
                            >
                              <DateRangeSelectorComponent setDateRange={setDateRange} handleClose={handleClose} />
                            </Popover>
                          </Grid>
                        </Grid>
                        <Box display="flex" flexDirection="row-reverse" p={2} >
                          <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                            size = 'small'
                          >
                            Search
                          </Button>
                        </Box>
                      </CardContent>
                      <Box minWidth={1050}>
                        {factoryItemList.length > 0 ?
                          <MaterialTable
                            title="Multiple Actions Preview"
                            columns={[
                              { title: 'Route Name', field: 'routeName' },
                              { title: 'Date', field: 'date', render: rowData => rowData.date.split('T')[0] },
                              { title: 'Reg No', field: 'registrationNumber' },
                              { title: 'Supplier Name', field: 'name' },
                              { title: 'Category', field: 'categoryName' },
                              { title: 'Item', field: 'itemName' },
                              { title: 'Quantity', field: 'approvedQuantity' },
                              { title: 'Total Price (Rs)', field: 'totalPrice', render: rowData => rowData.totalPrice.toFixed(2) },
                            ]}
                            data={factoryItemList}
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

                            ]}
                          /> : null}
                      </Box>
                      {factoryItemList.length > 0 ?
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <Button
                            color="primary"
                            id="btnRecord"
                            type="submit"
                            variant="contained"
                            style={{ marginRight: '1rem' }}
                            className={classes.colorRecord}
                            onClick={() => createFile()}
                            size = 'small'
                          >
                            EXCEL
                          </Button>
                          <ReactToPrint
                            documentTitle={"Factory Item Detail Report"}
                            trigger={() => <Button
                              color="primary"
                              id="btnRecord"
                              type="submit"
                              variant="contained"
                              style={{ marginRight: '1rem' }}
                              className={classes.colorCancel}
                              size = 'small'
                            >
                              PDF
                            </Button>}
                            content={() => componentRef.current}
                          />
                          <div hidden={true}>
                            <CreatePDF ref={componentRef}
                              factoryItemList={factoryItemList} searchData={selectedSearchValues}
                            />
                          </div>
                        </Box> : null}
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

