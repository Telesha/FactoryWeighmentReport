import React, { useState, useEffect, createContext } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, makeStyles, Container, CardHeader, CardContent,
  Divider, MenuItem, Grid, InputLabel, TextField, Button
} from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import MaterialTable from "material-table";
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

const screenCode = 'DIVISIONPRODUCTMAPPING';
export default function DivisionProductMappingListing() {
  const classes = useStyles();
  const [divisionProductMappingData, setDivisionProductMappingData] = useState([]);
  const [csvHeaders, SetCsvHeaders] = useState([]);
  const [groups, setGroups] = useState();
  const [estates, setEstates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [products, setProducts] = useState();
  const [divisionProductData, setDivisionProductData] = useState([]);;
  const [divisionProductMappingID, setDivisionProductMappingID] = useState(0);
  const [excel, setExcel] = useState(false);
  const [divisionProductMappingList, setDivisionProductMappingList] = useState({
    groupID: 0,
    factoryID: 0,
    divisionID: 0,
    productID: 0
  })
  const [IDDataForDefaultLoad, setIsIDDataForDefaultLoad] = useState(null);
  const [productData, setProductData] = useState([]);
  const navigate = useNavigate();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    let model = {
      groupID: parseInt(divisionProductMappingList.groupID),
      factoryID: parseInt(divisionProductMappingList.factoryID),
      divisionID: parseInt(divisionProductMappingList.divisionID),
      productID: parseInt(divisionProductMappingList.productID)
    }
    sessionStorage.setItem(
      'DivisionProductMapping-listing-page-search-parameters-id',
      JSON.stringify(model)
    );
    navigate('/app/DivisionProductMapping/addedit/' + encrypted);
  }

  const handleClickEdit = (divisionProductMappingID) => {
    encrypted = btoa(divisionProductMappingID.toString());

    let model = {
      groupID: parseInt(divisionProductMappingList.groupID),
      factoryID: parseInt(divisionProductMappingList.factoryID),
      divisionID: parseInt(divisionProductMappingList.divisionID),
      productID: parseInt(divisionProductMappingList.productID)
    }
    sessionStorage.setItem(
      'DivisionProductMapping-listing-page-search-parameters-id',
      JSON.stringify(model)
    );
    navigate('/app/DivisionProductMapping/addedit/' + encrypted);
  }

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
    isAddEditScreen: false
  });

  useEffect(() => {
    const IDdata = JSON.parse(
      sessionStorage.getItem('DivisionProductMapping-listing-page-search-parameters-id')
    );
    getPermissions(IDdata);
  }, []);

  useEffect(() => {
    sessionStorage.removeItem(
      'DivisionProductMapping-listing-page-search-parameters-id'
    );
  }, []);


  useEffect(() => {
    trackPromise(
      getGroupsForDropdown(),
    );
  }, []);

  useEffect(() => {
    getEstateDetailsByGroupID();
  }, [divisionProductMappingList.groupID]);

  useEffect(() => {
    getDivisionDetailsByEstateID();
  }, [divisionProductMappingList.factoryID]);

  useEffect(() => {
    if (excel == true) {
      createFile()
    }
  }, [excel]);

  useEffect(() => {
    if (divisionProductMappingID != 0) {
      handleClickEdit(divisionProductMappingID)
    }
  }, [divisionProductMappingID]);

  useEffect(() => {
    trackPromise(
      getProductsForDropdown()
    );
  }, []);

  useEffect(() => {
    if (IDDataForDefaultLoad != null) {
      trackPromise(
        GetDivisionProductMappingDetails(),
      );
    }
  }, [IDDataForDefaultLoad]);

  useEffect(() => {
    if (divisionProductMappingList.groupID !== 0) {
      trackPromise(
        getEstateDetailsByGroupID(),
      );
    }
  }, [divisionProductMappingList.groupID]);

  useEffect(() => {
    if (divisionProductMappingList.factoryID !== 0) {
      trackPromise(
        getDivisionDetailsByEstateID(),
      );
    }
  }, [divisionProductMappingList.factoryID]);

  async function getPermissions(IDdata) {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'DIVISIONPRODUCTMAPPINGLISTING');

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');
    var isAddEditScreen = permissions.find(p => p.permissionCode == 'ADDEDITDIVISIONPRODUCTMAPPING');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
      isAddEditScreen: isAddEditScreen !== undefined
    });

    const isInitialLoad = IDdata === null
    if (isInitialLoad) {
      setDivisionProductMappingList({
        ...divisionProductMappingList,
        groupID: parseInt(tokenService.getGroupIDFromToken()),
        factoryID: parseInt(tokenService.getFactoryIDFromToken())
      })
    }
    else {
      setDivisionProductMappingList({
        ...divisionProductMappingList,
        groupID: parseInt(IDdata.groupID),
        factoryID: parseInt(IDdata.factoryID),
        divisionID: parseInt(IDdata.divisionID),
        productID: parseInt(IDdata.productID),

      })
      setIsIDDataForDefaultLoad(IDdata);
    }
  }

  async function GetDivisionProductMappingDetails() {
    const result = await services.GetDivisionProductMappingDetails(divisionProductMappingList.groupID, divisionProductMappingList.factoryID, divisionProductMappingList.divisionID, divisionProductMappingList.productID);
    setDivisionProductData(result);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getEstateDetailsByGroupID() {
    var response = await services.getEstateDetailsByGroupID(divisionProductMappingList.groupID);
    setEstates(response);
  }

  async function getDivisionDetailsByEstateID() {
    var response = await services.getDivisionDetailsByEstateID(divisionProductMappingList.factoryID);
    setDivisions(response);
  }

  async function getProductsForDropdown() {
    const products = await services.getProductsForDropdown();
    setProducts(products);
  }

  function handleGroupChange(e) {
    const target = e.target;
    const value = target.value
    setDivisionProductMappingList({
      ...divisionProductMappingList,
      [e.target.name]: value,
      factoryID: "0",
      divisionID: "0"
    });
  }

  function handleLocationChange(e) {
    const target = e.target;
    const value = target.value
    setDivisionProductMappingList({
      ...divisionProductMappingList,
      [e.target.name]: value,
      divisionID: "0"
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

    setDivisionProductMappingList({
      ...divisionProductMappingList,
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
              toolTiptitle={"Add Division Product Mapping"}
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
          'Business Division': x.groupName,
          'Location': x.factoryName,
          'Sub Division': x.divisionName,
          'Product': x.productName,
          'Status': x.isActive == true ? 'Active' : 'InActive'
        }
        res.push(vr);
      });

    }

    return res;
  }

  async function createFile() {
    setExcel(false);
    ;
    var file = await createDataForExcel(divisionProductData);
    var settings = {
      sheetName: 'Division Product Mapping',
      fileName: 'Division Product Mapping',
      writeOptions: {}
    }


    let keys = file && file.length > 0 ? Object.keys(file[0]) : [];
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let dataA = [
      {
        sheet: 'Division Product Mapping',
        columns: tempcsvHeaders,
        content: file
      }
    ]

    xlsx(dataA, settings);
  }

  return (
    <Page
      className={classes.root}
      title="Division Product Mapping"
    >
      <Container maxWidth={false}>
        <Box mt={0}>
          <Card>
            <CardHeader
              title={cardTitle("Division Product Mapping")}
            />
            <PerfectScrollbar>
              <Divider />
              <CardContent style={{ marginBottom: "2rem" }}>
                <Grid container spacing={3}>
                  <Grid item md={4} xs={12}>
                    <InputLabel shrink id="groupID">
                      Business Division  *
                    </InputLabel>
                    <TextField select
                      fullWidth
                      name="groupID"
                      onChange={(e) => handleGroupChange(e)}
                      value={divisionProductMappingList.groupID}
                      variant="outlined"
                      size='small'
                      InputProps={{
                        readOnly: !permissionList.isGroupFilterEnabled,
                      }}
                    >
                      <MenuItem value="0">--Select All Business Division--</MenuItem>
                      {generateDropDownMenu(groups)}
                    </TextField>
                  </Grid>

                  <Grid item md={4} xs={12}>
                    <InputLabel shrink id="factoryID">
                      Location *
                    </InputLabel>
                    <TextField select
                      fullWidth
                      name="factoryID"
                      size='small'
                      onChange={(e) => {
                        handleLocationChange(e)
                      }}
                      value={divisionProductMappingList.factoryID}
                      variant="outlined"
                      id="factoryID"
                      InputProps={{
                        readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                      }}
                    >
                      <MenuItem value={0}>--Select All Location--</MenuItem>
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
                      value={divisionProductMappingList.divisionID}
                      variant="outlined"
                      id="divisionID"
                    >
                      <MenuItem value={0}>--Select All Sub Division--</MenuItem>
                      {generateDropDownMenu(divisions)}
                    </TextField>
                  </Grid>

                  <Grid item md={4} xs={12}>
                    <InputLabel shrink id="productID">
                      Product
                    </InputLabel>
                    <TextField select
                      fullWidth
                      name="productID"
                      size='small'
                      onChange={(e) => {
                        handleChange(e)
                      }}
                      value={divisionProductMappingList.productID}
                      variant="outlined"
                      id="productID"
                    >
                      <MenuItem value={0}>--Select Product--</MenuItem>
                      {generateDropDownMenu(products)}
                    </TextField>
                  </Grid>
                </Grid>
                <Box display="flex" justifyContent="flex-end" p={2}>
                  <Button
                    color="primary"
                    type="submit"
                    variant="contained"
                    onClick={() => trackPromise(GetDivisionProductMappingDetails())}
                  >
                    Search
                  </Button>
                </Box>
              </CardContent>
              {divisionProductData.length > 0 ?
                <CustomTable divisionProductMappingData={divisionProductData} setDivisionProductMappingID={setDivisionProductMappingID} setExcel={setExcel} permissionList={permissionList.isAddEditScreen} />
                : <SearchNotFound searchQuery="Division Product Mapping" />}
            </PerfectScrollbar>
          </Card>
        </Box>
      </Container>
    </Page>
  );
};
