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
import SearchNotFound from 'src/views/Common/SearchNotFound';
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

const screenCode = "PACKAGE";
export default function PackageListing() {

  const classes = useStyles();
  const navigate = useNavigate();

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  const [IDDataForDefaultLoad, setIsIDDataForDefaultLoad] = useState(null);
  const [csvHeaders, SetCsvHeaders] = useState([]);
  const [packageID, setPackageID] = useState(0);
  const [excel, setExcel] = useState(false);
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [costCenters, setCostCenters] = useState();
  const [packageList, setPackageList] = useState({
    groupID: '0',
    factoryID: '0',
    divisionID: '0'
  })

  const [ 
  packageData, setPackageData] = useState([])
  useEffect(() => {
    trackPromise(
      getPermission()
    );
  }, []);

  async function getPermission(IDData) {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWPACKAGE');

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

    const isInitialLoad = IDData === null
    if (isInitialLoad) {
      setPackageList({
        ...packageList,
        groupID: parseInt(tokenService.getGroupIDFromToken()),
        factoryID: parseInt(tokenService.getFactoryIDFromToken()),
      })
    }
    else {
      setPackageList({
        ...packageList,
        groupID: IDData.groupID,
        factoryID: IDData.factoryID,
        divisionID: IDData.divisionID
      })
      setIsIDDataForDefaultLoad(IDData);

    }
    trackPromise(
      getGroupsForDropdown())
  }

  useEffect(() => {
    if (packageID != 0) {
      editPackageDetails(packageID)
    }
}, [packageID]);

  useEffect(() => {
  if (excel == true) {
      createFile()
  }
}, [excel]);

  useEffect(() => {
    if (IDDataForDefaultLoad != null) {
      getPackagesByFactoryID();
    }
  }, [IDDataForDefaultLoad]);

  useEffect(() => {
    trackPromise(
      getFactoriesForDropDown(),
    )
    if (IDDataForDefaultLoad == null) {
      setPackageList({
        ...packageList,
        factoryID: '0',
        divisionID: '0'
      });
    }
  }, [IDDataForDefaultLoad, packageList.groupID]);

  useEffect(() => {
    trackPromise(getCostCenterForDropDown());
    if (IDDataForDefaultLoad == null) {
      setPackageList({
        ...packageList,
        divisionID: '0'
      });
    }
  }, [IDDataForDefaultLoad, packageList.factoryID]);


  useEffect(() => {
    const IDData = JSON.parse(
      sessionStorage.getItem('Package-listing-page-search-parameters-id')
    );
    getPermission(IDData);
  }, []);

  useEffect(() => {
    sessionStorage.removeItem(
      'Package-listing-page-search-parameters-id'
    );
  }, []);

  async function createFile() {
    setExcel(false)
    var file = await createDataForExcel(packageData);
    var settings = {
        sheetName: 'Package Details',
        fileName: 'Package Details',
        writeOptions: {}
    }

    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
        tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let dataA = [
        {
            sheet: 'Package Details',
            columns: tempcsvHeaders,
            content: file
        }
    ]
    xlsx(dataA, settings);
}
  async function createDataForExcel(array) {
  var res = [];
  if (array != null) {
      array.map(x => {
          var vr = {
              'Package Code': x.packageCode,
              'Package Name': x.packageName,
              'User Name': x.userName,
              'Reference': x.packageReferance,
              'Cost Center': x.divisionName,
              'Status': x.isActive == true ? 'Active' : 'InActive'
          }
          res.push(vr);
      });
  }
  return res;
}

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  async function getFactoriesForDropDown() {
    const factoryList = await services.getFactoryByGroupID(packageList.groupID);
    setFactories(factoryList);

  }

  async function getCostCenterForDropDown() {
    var response = await services.getDivisionDetailsByEstateID(packageList.factoryID);
    setCostCenters(response);
  };


  async function getPackagesByFactoryID() {
    const packages = await services.getPackagesByFactoryID(packageList.factoryID, packageList.groupID, packageList.divisionID)
    setPackageData(packages)
    
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
    navigate('/app/package/addEdit/' + encryptedID);
  }

  function editPackageDetails(packageID) {
    encryptedID = btoa(packageID.toString());
    let model = {
      groupID: parseInt(packageList.groupID),
      factoryID: parseInt(packageList.factoryID),
      divisionID: parseInt(packageList.divisionID)
    }
    sessionStorage.setItem(
      'Package-listing-page-search-parameters-id',
      JSON.stringify(model)
    );
    navigate('/app/package/addEdit/' + encryptedID);
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setPackageList({
      ...packageList,
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
            toolTiptitle={"Add Package"}
          />
        </Grid>
      </Grid>
    )
  }
  return (
    <Page
      className={classes.root}
      title="Packages"
    >
      <Container maxWidth={false}>
        <LoadingComponent />
        <Formik
          initialValues={{
            groupID: packageList.groupID,
            factoryID: packageList.factoryID,
            divisionID: packageList.divisionID
          }}
          validationSchema={
            Yup.object().shape({
              groupID: Yup.number().required('Legal Entity is required').min("1", 'Select a Legal Entity '),
              factoryID: Yup.number().required('Garden is required').min("1", 'Select a Garden'),
            })
          }
          onSubmit={() => trackPromise(getPackagesByFactoryID())}
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
                    title={cardTitle("Packages ")}
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
                            error={Boolean(touched.groupID && errors.groupID)}
                            fullWidth
                            helperText={touched.groupID && errors.groupID}
                            size='small'
                            name="groupID"
                            onChange={(e) => handleChange(e)}
                            value={packageList.groupID}
                            variant="outlined"
                            InputProps={{
                              readOnly: !permissionList.isGroupFilterEnabled,
                            }}
                          >
                            <MenuItem value="0">--Select Legal Entity--</MenuItem>
                            {generateDropDownMenu(groups)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="factoryID">
                          Location *
                          </InputLabel>
                          <TextField select
                            error={Boolean(touched.factoryID && errors.factoryID)}
                            fullWidth
                            helperText={touched.factoryID && errors.factoryID}
                            size='small'
                            name="factoryID"
                            onChange={(e) => handleChange(e)}
                            value={packageList.factoryID}
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
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="divisionID">
                          Sub Division
                          </InputLabel>
                          <TextField select
                            fullWidth
                            name="divisionID"
                            onChange={(e) => handleChange(e)}
                            value={packageList.divisionID}
                            variant="outlined"
                            id="divisionID"
                            size='small'
                          >
                            <MenuItem value="0">--Select Cost Center--</MenuItem>
                            {generateDropDownMenu(costCenters)}
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
                      {packageData.length > 0 ?
                        <CustomTable packageData={packageData} setPackageID={setPackageID} setExcel={setExcel} permissionList={permissionList.isAddEditScreen} />
                          : <SearchNotFound searchQuery="Package" />}
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