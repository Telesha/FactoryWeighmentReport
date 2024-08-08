import React, { useState, useEffect, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Card, makeStyles, Container, CardHeader, Button, CardContent, Chip, Divider, MenuItem, Grid, InputLabel, TextField, TableCell, TableRow, TableContainer, TableBody, Table, TableHead } from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import DeleteIcon from '@material-ui/icons/Delete';

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
  table: {
    minWidth: 550,
  },
  stickyHeader: {
    position: 'sticky',
    left: 0,
    zIndex: 1,
    backgroundColor: 'white',
  },
  stickyColumn: {
    position: 'sticky',
    left: 0,
    zIndex: 1,
    backgroundColor: 'white',
  },
}));

const screenCode = 'WORKLOCATIONPAYPOINTUPDATE';
export default function WorkLocationPayPointUpdate() {
  const [title, setTitle] = useState("Employee Transfer")
  const [isUpdate, setIsUpdate] = useState(false);
  const [employeeSubCategoryMapping, setEmployeeSubCategoryMapping] = useState();
  const classes = useStyles();
  const [groups, setGroups] = useState()
  const [factories, setFactories] = useState()
  const [costCenters, setCostCenters] = useState();
  const [payPoints, setPayPoints] = useState([]);
  const [workLocation, setWorkLocation] = useState([]);
  const [ArrayField, setArrayField] = useState([]);
  const [dataList, setDataList] = useState([])
  const [isTableHide, setIsTableHide] = useState(false);
  const [isAdd, setIsAdd] = useState(false);
  const [workLocationPayPointUpdate, setWorkLocationPaypointUpdate] = useState({
    groupID: '0',
    factoryID: '0',
    costCenterID: '0',
    employeeSubCategoryMappingID: '0',
    payPointID: '0',
    workLocationID: '0',
    registrationNumber: '',
    firstName: ''
  });

  const navigate = useNavigate();
  const registrationNumberRef = useRef(null);
  const addButtonRef = useRef(null);
  const [initialState, setInitialState] = useState(false);
  const alert = useAlert();

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  useEffect(() => {
    registrationNumberRef.current.focus();
  }, []);

  useEffect(() => {
    registrationNumberRef.current.focus();
  }, [workLocationPayPointUpdate.factoryID, workLocationPayPointUpdate.costCenterID, workLocationPayPointUpdate.employeeSubCategoryMappingID]);

  useEffect(() => {
    trackPromise(getPermissions(), getGroupsForDropdown(), GetAllEmployeeSubCategoryMapping());
  }, []);

  useEffect(() => {
    if (workLocationPayPointUpdate.groupID != '0') {
      trackPromise(getFactoriesForDropdown());
      trackPromise(GetDivisionDetailsByGroupID());
    }
  }, [workLocationPayPointUpdate.groupID]);

  useEffect(() => {
    if (!initialState) {
      trackPromise(getPermissions());
    }
  }, []);

  useEffect(() => {
    if (initialState) {
      setWorkLocationPaypointUpdate((prevState) => ({
        ...prevState,
        factoryID: 0,
        costCenterID: 0,

      }));
    }
  }, [workLocationPayPointUpdate.groupID, initialState]);

  useEffect(() => {
    trackPromise(getCostCenterDetailsByGardenID());
  }, [workLocationPayPointUpdate.factoryID]);

  useEffect(() => {
    if (workLocationPayPointUpdate.registrationNumber) {
      setIsAdd(false);
    } else {
      setIsAdd(true);
    }
  }, [workLocationPayPointUpdate.registrationNumber]);

  useEffect(() => {
    if (isAdd) {
      setIsAdd(true);
    } else {
      setIsAdd(false);
    }
  }, [isAdd]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWWORKLOCATIONPAYPOINTUPDATE');
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

    setWorkLocationPaypointUpdate({
      ...workLocationPayPointUpdate,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken()),
    })
    setInitialState(true);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }
  async function getFactoriesForDropdown() {
    const factories = await services.getAllFactoriesByGroupID(workLocationPayPointUpdate.groupID);
    setFactories(factories);
  }

  async function GetAllEmployeeSubCategoryMapping() {
    const result = await services.GetAllEmployeeSubCategoryMapping();
    setEmployeeSubCategoryMapping(result)
  }

  async function getCostCenterDetailsByGardenID() {
    var response = await services.getDivisionDetailsByEstateID(workLocationPayPointUpdate.factoryID);
    setCostCenters(response);
  };

  async function GetDivisionDetailsByGroupID() {
    const result = await services.GetDivisionDetailsByGroupID(workLocationPayPointUpdate.groupID);
    setPayPoints(result)
    setWorkLocation(result)
  }

  async function handleClickAdd() {
    const isMatch = ArrayField.some(x =>
      x.registrationNumber === workLocationPayPointUpdate.registrationNumber
    );
    if (isMatch) {
      alert.error("The record already exists!")
    } else {
      let model = {
        groupID: parseInt(workLocationPayPointUpdate.groupID),
        factoryID: parseInt(workLocationPayPointUpdate.factoryID),
        costCenterID: parseInt(workLocationPayPointUpdate.costCenterID),
        employeeSubCategoryMappingID: parseInt(workLocationPayPointUpdate.employeeSubCategoryMappingID),
        registrationNumber: workLocationPayPointUpdate.registrationNumber
      }
      const response = await services.GetEmpDetailsByIDs(model);
      if (response.length > 0) {
        var array1 = [...ArrayField];

        response.forEach((item) => {
          array1.push({
            groupID: parseInt(workLocationPayPointUpdate.groupID),
            factoryID: parseInt(workLocationPayPointUpdate.factoryID),
            divisionID: parseInt(workLocationPayPointUpdate.costCenterID),
            registrationNumber: workLocationPayPointUpdate.registrationNumber,
            firstName: item.firstName,
            employeeSubCategoryMappingID: parseInt(workLocationPayPointUpdate.employeeSubCategoryMappingID),
            employeeSubCategoryName: item.employeeSubCategoryName,
            payPointID: parseInt(item.payPointID),
            payPointName: item.payPointName,
            workLocationID: parseInt(item.workLocationID),
            workLocationName: item.workLocationName,
            createdBy: tokenService.getUserIDFromToken()
          });
        });
        setArrayField(array1);
        setIsTableHide(true);
        setIsAdd(true);
        setIsUpdate(false);

        let dataModel = {
          groupID: workLocationPayPointUpdate.groupID,
          factoryID: workLocationPayPointUpdate.factoryID,
          costCenterID: workLocationPayPointUpdate.costCenterID,
          registrationNumber: workLocationPayPointUpdate.registrationNumber,
          employeeSubCategoryMappingID: workLocationPayPointUpdate.employeeSubCategoryMappingID
        }
        setDataList(dataList => [...dataList, dataModel]);
        setWorkLocationPaypointUpdate({
          ...workLocationPayPointUpdate,
          registrationNumber: '',
          workLocationID: 0,
          payPointID: 0
        });
      }
      else {
        alert.error("Invalid Registration Number!")
      }
      handleKeyDown1(registrationNumberRef)
    }
  }

  async function handleClickUpdate() {
    const updatedArray = [...ArrayField].map(item => {
      const matchingResponse = ArrayField.find(res => res.registrationNumber === item.registrationNumber);
      if (matchingResponse) {
        const payPointID = workLocationPayPointUpdate.payPointID == 0 ? matchingResponse.payPointID : parseInt(workLocationPayPointUpdate.payPointID);
        const payPointName = workLocationPayPointUpdate.payPointID == 0 ? matchingResponse.payPointName : payPoints[payPointID];
        return {
          ...item,
          payPointID: payPointID,
          payPointName: payPointName,
          workLocationID: parseInt(workLocationPayPointUpdate.workLocationID),
          workLocationName: workLocation[workLocationPayPointUpdate.workLocationID],
          createdBy: tokenService.getUserIDFromToken()
        };
      } else {
        return item;
      }
    });

    setArrayField(updatedArray);
    setIsTableHide(true);
    setIsUpdate(true);
    setIsAdd(false);

    const dataModels = ArrayField.map(item => ({
      groupID: workLocationPayPointUpdate.groupID,
      factoryID: workLocationPayPointUpdate.factoryID,
      costCenterID: workLocationPayPointUpdate.costCenterID,
      registrationNumber: item.registrationNumber,
      employeeSubCategoryMappingID: workLocationPayPointUpdate.employeeSubCategoryMappingID
    }));
    setDataList(dataList => [...dataList, ...dataModels]);

    const response = await services.UpdateWorkLocationPayPoint(updatedArray);
    if (response.statusCode === "Success") {
      alert.success(response.message);
    } else {
      alert.error("Update Failed!");
      clearFields();
    }
  }

  function handleDelete(registrationNumber) {
    const newArray = ArrayField.filter(item =>
      item.registrationNumber !== registrationNumber
    );
    setArrayField(newArray);
  }

  const renderChips = (name) => {
    return name.split(', ').map((label, index) => (
      <Chip key={index} label={label} size="small" style={{ color: 'black', fontStyle: 'bold', backgroundColor: 'lightskyblue' }} />
    ));
  };

  function clearFields() {
    setWorkLocationPaypointUpdate({
      ...workLocationPayPointUpdate,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken()),
      divisionID: 0,
      employeeSubCategoryMappingID: 0,
      registrationNumber: '',
      workLocationID: 0,
      payPointID: 0
    });
    setIsUpdate(false)
    setArrayField([]);
  }

  function generateDropDownMenu(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>)
      }
    }
    return items
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setWorkLocationPaypointUpdate({
      ...workLocationPayPointUpdate,
      [e.target.name]: value
    });
  }

  const handleKeyDown = (event, nextInputRef) => {
    if (nextInputRef && nextInputRef.current && typeof nextInputRef.current.focus === 'function') {
      if (event.key === 'Enter') {
        event.preventDefault();
        nextInputRef.current.focus();
      }
    }
  }

  const handleKeyDown1 = (nextInputRef) => {
    nextInputRef.current.focus();
  }

  function cardTitle() {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {title}
        </Grid>
      </Grid>
    )
  }

  return (
    <Page
      className={classes.root}
      title={title}
    >
      <LoadingComponent />
      <Container maxWidth={false}>
        <Formik
          initialValues={{
            groupID: workLocationPayPointUpdate.groupID,
            factoryID: workLocationPayPointUpdate.factoryID,
            costCenterID: workLocationPayPointUpdate.costCenterID,
            employeeTypeID: workLocationPayPointUpdate.employeeTypeID,
            employeeSubCategoryMappingID: workLocationPayPointUpdate.employeeSubCategoryMappingID,
            registrationNumber: workLocationPayPointUpdate.registrationNumber
          }}
          validationSchema={
            Yup.object().shape({
              groupID: Yup.number().required('Business Division required').min("1", 'Business Division is required'),
              factoryID: Yup.number().required('Location required').min("1", 'Location is required')
            })
          }
          onSubmit={() => trackPromise(handleClickUpdate())}
          enableReinitialize
        >
          {({
            errors,
            handleBlur,
            handleSubmit,
            touched,
          }) => (
            <form onSubmit={handleSubmit}>
              <Box mt={0}>
                <Card>
                  <CardHeader
                    title={cardTitle()}
                  />
                  <PerfectScrollbar>
                    <Divider />
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="groupID">
                            Business Division*
                          </InputLabel>
                          <TextField select
                            error={Boolean(touched.groupID && errors.groupID)}
                            fullWidth
                            helperText={touched.groupID && errors.groupID}
                            name="groupID"
                            onBlur={handleBlur}
                            onChange={(e) => handleChange(e)}
                            value={workLocationPayPointUpdate.groupID}
                            variant="outlined"
                            id="groupID"
                            InputProps={{
                              readOnly: !permissionList.isGroupFilterEnabled ? true : false || isAdd || isUpdate
                            }}
                            size="small"
                          >
                            <MenuItem value="0">--Select Business Division--</MenuItem>
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
                            name="factoryID"
                            onBlur={handleBlur}
                            onChange={(e) => handleChange(e)}
                            value={workLocationPayPointUpdate.factoryID}
                            variant="outlined"
                            id="factoryID"
                            InputProps={{
                              readOnly: !permissionList.isFactoryFilterEnabled ? true : false || isAdd || isUpdate
                            }}
                            size="small"
                          >
                            <MenuItem value="0">--Select Location--</MenuItem>
                            {generateDropDownMenu(factories)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="costCenterID">
                            Sub Division
                          </InputLabel>
                          <TextField select
                            fullWidth
                            name="costCenterID"
                            onBlur={handleBlur}
                            onChange={(e) => handleChange(e)}
                            value={workLocationPayPointUpdate.costCenterID}
                            variant="outlined"
                            id="costCenterID"
                            size='small'
                            InputProps={{
                              readOnly: isUpdate
                            }}
                          >
                            <MenuItem value="0">--Select Sub Division--</MenuItem>
                            {generateDropDownMenu(costCenters)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="employeeSubCategoryMappingID">
                            Employee Sub Category
                          </InputLabel>
                          <TextField select fullWidth
                            size='small'
                            onBlur={handleBlur}
                            id="employeeSubCategoryMappingID"
                            name="employeeSubCategoryMappingID"
                            value={workLocationPayPointUpdate.employeeSubCategoryMappingID}
                            type="text"
                            variant="outlined"
                            onChange={(e) => handleChange(e)}
                            InputProps={{
                              readOnly: isUpdate
                            }}
                          >
                            <MenuItem value="0">--Select Employee Sub Category--</MenuItem>
                            {generateDropDownMenu(employeeSubCategoryMapping)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12} >
                          <InputLabel shrink id="registrationNumber">
                            Employee ID *
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.registrationNumber && errors.registrationNumber)}
                            fullWidth
                            helperText={touched.registrationNumber && errors.registrationNumber}
                            size='small'
                            name="registrationNumber"
                            onChange={(e) => handleChange(e)}
                            value={workLocationPayPointUpdate.registrationNumber}
                            variant="outlined"
                            id="registrationNumber"
                            inputRef={registrationNumberRef}
                            onKeyDown={(e) => handleKeyDown(e, addButtonRef)}
                            InputProps={{
                              readOnly: isUpdate
                            }}
                          >
                          </TextField>
                        </Grid>
                      </Grid>
                      <br />
                      <Grid container spacing={3}>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="workLocationID">
                            Work Location *
                          </InputLabel>
                          <TextField select fullWidth
                            error={Boolean(touched.workLocationID && errors.workLocationID)}
                            helperText={touched.workLocationID && errors.workLocationID}
                            size='small'
                            onBlur={handleBlur}
                            id="workLocationID"
                            name="workLocationID"
                            value={workLocationPayPointUpdate.workLocationID}
                            type="text"
                            variant="outlined"
                            onChange={(e) => handleChange(e)}
                            disabled={!isAdd}
                          >
                            <MenuItem value="0">--Select Work Location--</MenuItem>
                            {generateDropDownMenu(workLocation)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="payPointID">
                            Pay Point
                          </InputLabel>
                          <TextField select
                            fullWidth
                            name="payPointID"
                            onBlur={handleBlur}
                            onChange={(e) => handleChange(e)}
                            value={workLocationPayPointUpdate.payPointID}
                            variant="outlined"
                            id="payPointID"
                            size='small'
                            disabled={!isAdd}
                          >
                            <MenuItem value="0">--Select Pay Point--</MenuItem>
                            {generateDropDownMenu(payPoints)}
                          </TextField>
                        </Grid>
                      </Grid>
                      <Box display="flex" justifyContent="flex-end" item p={2}>
                        <Button
                          color="primary"
                          variant="contained"
                          onClick={() => handleClickAdd()}
                          disabled={workLocationPayPointUpdate.workLocationID > 0}
                          ref={addButtonRef}
                        >
                          Add
                        </Button>
                      </Box >
                    </CardContent>
                  </PerfectScrollbar>
                  <PerfectScrollbar>
                    <Box minWidth={1050}>
                      {ArrayField.length > 0 && isTableHide ?
                        <Grid item xs={12}>
                          <TableContainer style={{ maxHeight: '550px', overflowY: 'auto' }}>
                            <Table className={classes.table} aria-label="sticky table" stickyHeader size="small" Table>
                              <TableHead style={{ position: "sticky", top: 0, zIndex: 1000, background: "white" }}>
                                <TableRow>
                                  <TableCell className={classes.sticky} align="center"><b>Registration Number</b></TableCell>
                                  <TableCell className={classes.sticky} align="center"><b>First Name</b></TableCell>
                                  <TableCell className={classes.sticky} align="center"><b>Sub Category</b></TableCell>
                                  <TableCell className={classes.sticky} align="center"><b>Work Location</b></TableCell>
                                  <TableCell className={classes.sticky} align="center"><b>Pay Point</b></TableCell>
                                  {!isUpdate ?
                                    <TableCell className={classes.sticky} align="center"><b>Delete</b></TableCell>
                                    : null}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {ArrayField.map((row, index) => {
                                  return <TableRow key={index}>
                                    <TableCell align="center" >{row.registrationNumber}</TableCell>
                                    <TableCell align="center" >{row.firstName}</TableCell>
                                    <TableCell align="center" >{row.employeeSubCategoryName}</TableCell>
                                    <TableCell align="center" >{row.workLocationName == null ? '-' : renderChips(row.workLocationName)}</TableCell>
                                    <TableCell align="center" >{row.payPointName == null ? '-' : renderChips(row.payPointName)}</TableCell>
                                    {!isUpdate ?
                                      <TableCell component="th" scope="row" style={{ borderBottom: "none", textAlign: 'center' }}>
                                        <DeleteIcon
                                          style={{
                                            color: "red",
                                            cursor: "pointer",
                                          }}
                                          size="small"
                                          onClick={() => handleDelete(row.registrationNumber)}
                                        >
                                        </DeleteIcon>
                                      </TableCell>
                                      : null}
                                  </TableRow>
                                })}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Grid>
                        : null}

                      {ArrayField.length > 0 && (workLocationPayPointUpdate.workLocationID > 0) ?
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <Button
                            color="primary"
                            type="reset"
                            variant="outlined"
                            onClick={() => clearFields()}
                            size='small'
                            disabled={!isUpdate}
                          >
                            Clear
                          </Button>
                          <div>&nbsp; &nbsp;</div>
                          <Box pr={2}>
                            <Button
                              color="primary"
                              variant="contained"
                              type="submit"
                              disabled={isUpdate}
                              size='small'
                            >
                              Update
                            </Button>
                          </Box>
                        </Box>
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
  );
};
