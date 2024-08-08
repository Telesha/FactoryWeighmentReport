import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  Grid,
  TextField,
  makeStyles,
  Container,
  Button,
  CardContent,
  Divider,
  InputLabel,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
  MenuItem,
  Switch
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../../Services';
import { Formik } from 'formik';
import * as Yup from "yup";
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import { useAlert } from "react-alert";
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import { LoadingComponent } from '../../../../utils/newLoader';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { trackPromise } from 'react-promise-tracker';
import moment from 'moment';
import tokenDecoder from '../../../../utils/tokenDecoder';
import Autocomplete from '@material-ui/lab/Autocomplete';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100%',
  },
  avatar: {
    marginRight: theme.spacing(2)
  },
  root1: {
    height: 180,
  },
  container: {
    display: 'flex',
  },
  paper: {
    margin: theme.spacing(1),
    display: 'inline-block',
    backgroundColor: 'white',
  },
  svg: {
    width: 'fullWidth',
    height: 100,
  },
  polygon: {
    fill: theme.palette.common.white,
    stroke: theme.palette.divider,
    strokeWidth: 1,
  },
  table: {
    minWidth: 150,
  },
  cardContent: {
    border: `2px solid #e8eaf6`
  }
}));

export function EmployeeSupplimentary({ empGeneralArray, supplimentaryArray, setSupplimentaryArray, setIsMainButtonEnable, nameAndRegNo, setDeleledSupplimentaryList }) {
  const classes = useStyles();

  const [relationships, setRelationships] = useState([]);
  const [regNoList, setRegNoList] = useState([]);
  const [supplimentary, setSupplimentary] = useState({
    name: '',
    relationship: '0',
    nic: '',
    workingType: '0',
    dateOfBirth: null,
    gender: '0',
    employeeNumber: '',
    age: '',
    isRation: true
  });
  const [isEdit, setIsEdit] = useState(false);
  const [employeeSupplimentaryID, setEmployeeSupplimentaryID] = useState(0);
  const [workingTypeID, setWorkingTypeID] = useState(0);
  const [index, setIndex] = useState()
  const alert = useAlert();

  useEffect(() => {
    trackPromise(GetAllRelationshipsForDropDown())
  }, []);

  useEffect(() => {
    trackPromise(getPermantEmployeeRegNo())
  }, [empGeneralArray]);

  async function GetAllRelationshipsForDropDown() {
    const relationships = await services.GetAllRelationshipsForDropDown();
    setRelationships(relationships);
  }

  async function getPermantEmployeeRegNo() {
    let response = await services.getPermantEmployeeRegNo(empGeneralArray.factoryID, empGeneralArray.employeeDivisionID);
    setRegNoList(response);
  }

  async function saveSupplimentaryDetails(values) {
    if (!isEdit) {
      let supplimentaryDetails = {
        supplimentaryName: values.name,
        relationship: parseInt(values.relationship),
        nic: values.nic,
        workingType: parseInt(values.workingType),
        gender: parseInt(values.gender),
        dateOfBirth: moment(values.dateOfBirth).format('YYYY-MM-DD'),
        employeeNumber: values.employeeNumber,
        employeeSupplimentaryID: employeeSupplimentaryID,
        isRation: values.isRation,
        status: 1,
        createdBy: tokenDecoder.getUserIDFromToken()
      };
      setSupplimentaryArray(supplimentaryArray => [...supplimentaryArray, supplimentaryDetails]);
      alert.success("Supplementary detail added.")
      setIsMainButtonEnable(true);
    }
    else {
      let supplimentaryDetails = {
        supplimentaryName: values.name,
        relationship: parseInt(values.relationship),
        nic: values.nic,
        workingType: parseInt(values.workingType),
        gender: parseInt(values.gender),
        dateOfBirth: moment(values.dateOfBirth).format('YYYY-MM-DD'),
        employeeNumber: values.employeeNumber,
        employeeSupplimentaryID: employeeSupplimentaryID,
        isRation: values.isRation,
        status: 1,
        createdBy: tokenDecoder.getUserIDFromToken()
      };
      supplimentaryArray.splice(index, 1, supplimentaryDetails);
      setIsMainButtonEnable(true);
      setEmployeeSupplimentaryID(0);
      setWorkingTypeID(0)
      setIndex();
      setIsEdit(false);
    }
    setSupplimentary({
      ...supplimentary,
      name: '',
      relationship: '0',
      nic: '',
      workingType: '0',
      gender: '0',
      employeeNumber: '',
      dateOfBirth: null
    });
  }

  async function EditItem(index) {
    setIsEdit(true);
    setIndex(index);
    if (supplimentaryArray[index].employeeSupplimentaryID != undefined) {
      setSupplimentary({
        ...supplimentary,
        name: supplimentaryArray[index].supplimentaryName,
        gender: supplimentaryArray[index].gender,
        relationship: supplimentaryArray[index].relationship,
        dateOfBirth: supplimentaryArray[index].dateOfBirth,
        employeeNumber: supplimentaryArray[index].employeeNumber == null ? "" : supplimentaryArray[index].employeeNumber,
        nic: supplimentaryArray[index].nic == null ? "" : supplimentaryArray[index].nic,
        workingType: supplimentaryArray[index].workingType,
        isRation: supplimentaryArray[index].isRation
      });
      setEmployeeSupplimentaryID(supplimentaryArray[index].employeeSupplimentaryID);
      setWorkingTypeID(supplimentaryArray[index].workingType)
    }
  }

  async function DeleteItem(index) {
    setIsMainButtonEnable(true)
    if (supplimentaryArray[index].employeeSupplimentaryID != undefined) {
      setDeleledSupplimentaryList(
        prevIdSet => [...prevIdSet, supplimentaryArray[index].employeeSupplimentaryID]
      )
      setSupplimentaryArray(current => current.filter((img, i) => i != index));
    }
    else {
      for (var i = 0; i < supplimentaryArray.length; i++) {
        setSupplimentary({
          ...supplimentary,
          name: supplimentaryArray[i].name,
          nic: supplimentaryArray[i].nic,
          relationship: supplimentaryArray[i].relationship,
          workingType: supplimentaryArray[i].workingType,
          gender: supplimentaryArray[i].gender,
          dateOfBirth: supplimentaryArray[i].dateOfBirth,
          employeeNumber: supplimentaryArray[i].employeeNumber,
          isRation: supplimentaryArray[i].isRation
        })
      }
      supplimentaryArray.splice(index, 1);
      setSupplimentary({
        ...supplimentary,
        name: '',
        relationship: '0',
        nic: '',
        workingType: '0',
        gender: '0',
        employeeNumber: '',
        dateOfBirth: null
      });
      alert.success('Item deleted successfully');
    }
  }

  function settingData(data) {
    if (data == undefined || data == null || data == "") {
      return '---';
    }
    else {
      return data;
    }
  }

  function settingDOB(data) {
    if (data == undefined || data == null || data == "") {
      return '---';
    }
    else {
      return moment(data).format('YYYY-MM-DD');
    }
  }

  const settingAge = (dob) => {
    if (!dob) return '---';
    const today = moment();
    const birthDate = moment(dob);
    const age = today.diff(birthDate, 'years');
    return age;
  };

  function settingRelationship(data) {
    if (data > 0) {
      return relationships[data];
    }
  }

  function settingGender(data) {
    if (data == 1) {
      return 'Male';
    }
    else if (data == 2) {
      return 'Female';
    }
    else {
      return 'Other';
    }
  }

  function settingWorkingType(data) {
    if (data == 1) {
      return 'Employee';
    }
    else if (data == 2) {
      return 'Dependant';
    }
    else if (data == 3) {
      return 'Family Member';
    }
    else {
      return 'Other';
    }
  }

  function settingIsRation(data) {
    if (data == true) {
      return 'Available';
    }
    else {
      return 'Not Available';
    }
  }

  function handleChangeMethod(e) {
    const target = e.target;
    const value = target.value;
    if (target.name == 'name') {
      setSupplimentary({
        ...supplimentary,
        [e.target.name]: value.toUpperCase()
      });
    } else if (target.name == 'workingType') {
      setSupplimentary({
        ...supplimentary,
        [e.target.name]: value,
        employeeNumber: ''
      })
    } else {
      setSupplimentary({
        ...supplimentary,
        [e.target.name]: value
      });
    }
  }

  function handleDateChange(value, field) {
    if (field == "dateOfBirth") {
      setSupplimentary({
        ...supplimentary,
        dateOfBirth: value
      });
    }
  }

  function handleChangeCheck(e) {
    const target = e.target;
    const value = target.checked;
    setSupplimentary({
      ...supplimentary,
      [e.target.name]: value
    });
  }


  function handleChangeRegNo(data, e) {
    if (data === undefined || data === null) {
      setSupplimentary({
        ...supplimentary,
        employeeNumber: '0'
      });
      return;
    } else {
      var valueV = data.registrationNumber;
      setSupplimentary({
        ...supplimentary,
        employeeNumber: valueV.toString()
      });
    }
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

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title="Employee Dependant Add Edit">
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              name: supplimentary.name,
              nic: supplimentary.nic,
              gender: supplimentary.gender,
              relationship: supplimentary.relationship,
              workingType: supplimentary.workingType,
              employeeNumber: supplimentary.employeeNumber,
              dateOfBirth: supplimentary.dateOfBirth,
              isRation: supplimentary.isRation
            }}
            validationSchema={
              Yup.object().shape({
                name: Yup.string().required('Name is required'),
                gender: Yup.number().required('Gender is required').min("1", 'Gender is required'),
                relationship: Yup.number().required('Relationship is required').min("1", 'Relationship is required'),
                workingType: Yup.number().required('Working Type required').min("1", 'Working Type is required'),
                employeeNumber: Yup.string().when("workingType",
                  {
                    is: val => val === 1,
                    then: Yup.string().required('Please enter employee number'),//.min(7, 'Employee number must be 7 digits'),
                  }),
                dateOfBirth: Yup.string().required('DOB is required').nullable(),
                isRation: Yup.boolean().required('Is Ration required')
              })
            }
            onSubmit={(event) => trackPromise(saveSupplimentaryDetails(event))}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              isSubmitting,
              touched,
              values,
            }) => (
              <form onSubmit={handleSubmit}>
                {(nameAndRegNo.length > 0) ?
                  <Grid container spacing={3}>
                    <Grid item md={4} xs={12}>Employee Name : {nameAndRegNo[0]}</Grid>
                    <Grid item md={4} xs={12}>Registration Number : {nameAndRegNo[1]}</Grid>
                  </Grid>
                  : null}
                <Box mt={3}>
                  <Card className={classes.cardContent}>
                    <CardHeader
                      title="Dependant Details"
                    />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="name">
                              Name *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.name && errors.name)}
                              fullWidth
                              helperText={touched.name && errors.name}
                              size='small'
                              name="name"
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeMethod(e)}
                              value={supplimentary.name}
                              variant="outlined"
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="gender">
                              Gender *
                            </InputLabel>
                            <TextField select fullWidth
                              error={Boolean(touched.gender && errors.gender)}
                              helperText={touched.gender && errors.gender}
                              size='small'
                              onBlur={handleBlur}
                              id="gender"
                              name="gender"
                              value={supplimentary.gender}
                              type="text"
                              variant="outlined"
                              onChange={(e) => handleChangeMethod(e)}>
                              <MenuItem value="0">--Select Gender--</MenuItem>
                              <MenuItem value="1">Male</MenuItem>
                              <MenuItem value="2">Female</MenuItem>
                              <MenuItem value="3">Other</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="relationship">
                              Relationship *
                            </InputLabel>
                            <TextField select fullWidth
                              error={Boolean(touched.relationship && errors.relationship)}
                              helperText={touched.relationship && errors.relationship}
                              size='small'
                              name="relationship"
                              onBlur={handleBlur}
                              value={supplimentary.relationship}
                              variant="outlined"
                              type="text"
                              onChange={(e) => handleChangeMethod(e)}>
                              <MenuItem value="0">--Select Relationship--</MenuItem>
                              {generateDropDownMenu(relationships)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="dateOfBirth" style={{ marginBottom: '-8px' }}>
                              Date of Birth *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                error={Boolean(touched.dateOfBirth && errors.dateOfBirth)}
                                helperText={touched.dateOfBirth && errors.dateOfBirth}
                                autoOk
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                inputVariant="outlined"
                                id="dateOfBirth"
                                name="dateOfBirth"
                                value={supplimentary.dateOfBirth}
                                onChange={(e) => handleDateChange(e, "dateOfBirth")}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="nic">
                              NID / BIR
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.nic && errors.nic)}
                              fullWidth
                              helperText={touched.nic && errors.nic}
                              size='small'
                              name="nic"
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeMethod(e)}
                              value={supplimentary.nic}
                              variant="outlined"
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="workingType">
                              Worker Type *
                            </InputLabel>
                            <TextField select fullWidth
                              error={Boolean(touched.workingType && errors.workingType)}
                              helperText={touched.workingType && errors.workingType}
                              size='small'
                              name="workingType"
                              disabled={isEdit && employeeSupplimentaryID != 0 && workingTypeID == 1}
                              onBlur={handleBlur}
                              value={supplimentary.workingType}
                              variant="outlined"
                              onChange={(e) => handleChangeMethod(e)}>
                              <MenuItem value="0">--Select Worker Type--</MenuItem>
                              <MenuItem value="1">Employee</MenuItem>
                              <MenuItem value="2">Dependant</MenuItem>
                              <MenuItem value="3">Family Member</MenuItem>
                              <MenuItem value="4">Other</MenuItem>
                            </TextField>
                          </Grid>
                          {supplimentary.workingType == 1 ?
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="employeeNumber">
                                Employee Number *
                              </InputLabel>
                              <Autocomplete
                                id="employeeNumber"
                                options={regNoList}
                                getOptionLabel={option => option.registrationNumber ?? option.registrationNumber}
                                disabled={isEdit && employeeSupplimentaryID != 0 && workingTypeID == 1}
                                onChange={(e, value) =>
                                  handleChangeRegNo(value, e)
                                }
                                value={regNoList.find(option => option.registrationNumber === supplimentary.employeeNumber) || null}
                                renderInput={params => (
                                  <TextField
                                    {...params}
                                    variant="outlined"
                                    name="employeeNumber"
                                    size="small"
                                    fullWidth
                                    disabled={isEdit && employeeSupplimentaryID != 0 && workingTypeID == 1}
                                    error={Boolean(touched.employeeNumber && errors.employeeNumber)}
                                    helperText={touched.employeeNumber && errors.employeeNumber}
                                    onBlur={handleBlur}
                                  />
                                )}
                              />
                            </Grid>

                            : null}
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="isRation">
                              Ration
                            </InputLabel>
                            <Switch
                              onChange={handleChangeCheck}
                              name="isRation"
                              disabled={supplimentary.workingType == 1 || supplimentary.workingType == 3 || supplimentary.workingType == 4}
                              checked={supplimentary.workingType == 1 || (supplimentary.workingType == 2 && supplimentary.isRation)}
                            />
                          </Grid>
                        </Grid>
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <Button
                            color="primary"
                            type="submit"
                            disabled={isSubmitting}
                            variant="contained"
                          >
                            {!isEdit ? "Add" : "Update"}
                          </Button>
                        </Box>
                      </CardContent>
                      <Divider />
                      <CardContent>
                        <Grid className={classes.container}>
                          <Collapse in={true}>
                            <Paper elevation={0} className={classes.paper}>
                              {(supplimentaryArray.length > 0 && !isEdit) ?
                                <TableContainer >
                                  <Table className={classes.table} aria-label="caption table">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell style={{ width: "300px" }}>Name</TableCell>
                                        <TableCell style={{ width: "200px" }}>Gender</TableCell>
                                        <TableCell style={{ width: "200px" }}>Relationship</TableCell>
                                        <TableCell style={{ width: "250px" }}>DOB</TableCell>
                                        <TableCell style={{ width: "200px" }}>Age</TableCell>
                                        <TableCell style={{ width: "250px" }}>NIC</TableCell>
                                        <TableCell style={{ width: "250px" }}>Worker Type</TableCell>
                                        <TableCell style={{ width: "250px" }}>Employee Number</TableCell>
                                        <TableCell style={{ width: "250px" }}>Ration</TableCell>
                                        <TableCell >Edit</TableCell>
                                        <TableCell >Delete</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {supplimentaryArray.map((rowData, index) => (
                                        <TableRow key={index}>
                                          <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                            {settingData(rowData.supplimentaryName)}
                                          </TableCell>
                                          <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                            {settingGender(rowData.gender)}
                                          </TableCell>
                                          <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                            {settingRelationship(rowData.relationship)}
                                          </TableCell>
                                          <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                            {settingDOB(rowData.dateOfBirth)}
                                          </TableCell>
                                          <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                            {settingAge(rowData.dateOfBirth)}
                                          </TableCell>
                                          <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                            {settingData(rowData.nic)}
                                          </TableCell>
                                          <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                            {settingWorkingType(rowData.workingType)}
                                          </TableCell>
                                          <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                            {settingData(rowData.employeeNumber)}
                                          </TableCell>
                                          <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                            {settingIsRation(rowData.isRation)}
                                          </TableCell>
                                          <TableCell component="th" scope="row" style={{ borderBottom: "none", textAlign: 'center' }}>
                                            <EditIcon
                                              style={{
                                                color: "secondary",
                                                cursor: "pointer"
                                              }}
                                              size="small"
                                              onClick={() => trackPromise(EditItem(index))}
                                            >
                                            </EditIcon>
                                          </TableCell>
                                          <TableCell component="th" scope="row" style={{ borderBottom: "none", textAlign: 'center' }}>
                                            <DeleteIcon
                                              style={{
                                                color: "red",
                                                cursor: "pointer"
                                              }}
                                              size="small"
                                              onClick={() => DeleteItem(index)}
                                            >
                                            </DeleteIcon>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                                : null}
                            </Paper>
                          </Collapse>
                        </Grid>
                      </CardContent>
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
};
