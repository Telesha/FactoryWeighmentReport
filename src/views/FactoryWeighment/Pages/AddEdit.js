import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Card, makeStyles, Container, CardHeader, Button, CardContent, Typography, DialogContentText, Divider, MenuItem, Grid, InputLabel, TextField, TableCell, TableRow, TableContainer, TableBody, Table, TableHead } from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { LoadingComponent } from '../../../utils/newLoader';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import tokenDecoder from '../../../utils/tokenDecoder';
import { useParams } from 'react-router-dom';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import moment from 'moment';

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
}));

const screenCode = "FACTORYWEIGHMENTADD"

export default function FactoryWeighmentAdd(props) {

  const classes = useStyles();
  const navigate = useNavigate();
  const alert = useAlert();
  const [title, setTitle] = useState("Factory Weighment")
  const [groups, setGroups] = useState();
  const [estates, setEstates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [FieldList, setFieldList] = useState([]);
  const [ArrayField, setArrayField] = useState([]);
  const [arrayNewWareField, setArrayNewWareField] = useState([]);
  const [date, setDate] = useState(new Date());
  const [factoryWeighment, setFactoryWeighment] = useState({
    groupID: 0,
    estateID: 0,
    division: 0,
    fieldID: 0,
    amount: '',
  });
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const [editIndex, setEditIndex] = useState(null);
  const [editAmount, setEditAmount] = useState("");

  const fieldRef = useRef(null);
  const amountRef = useRef(null);
  const addButtonRef = useRef(null);

  useEffect(() => {
    trackPromise(getGroupsForDropdown(), getPermissions(), getFieldsForDropdown());
  }, []);

  useEffect(() => {
    if (factoryWeighment.groupID > 0) {
      trackPromise(getEstateDetailsByGroupID());
    };
  }, [factoryWeighment.groupID]);

  useEffect(() => {
    if (factoryWeighment.estateID > 0) {
      trackPromise(
        getDivisionDetailsByEstateID());
    };
  }, [factoryWeighment.estateID]);

  useEffect(() => {
    if (factoryWeighment.division > 0) {
      trackPromise(
        getFieldsForDropdown());
    };
  }, [factoryWeighment.division]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDFACTORYWEIGHMENT');

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

    setFactoryWeighment({
      ...factoryWeighment,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      estateID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getEstateDetailsByGroupID() {
    var response = await services.getFactoryByGroupID(factoryWeighment.groupID);
    setEstates(response);
  };

  async function getDivisionDetailsByEstateID() {
    var response = await services.getDivisionDetailsByEstateID(factoryWeighment.estateID);
    setDivisions(response);
  };

  async function getFieldsForDropdown() {
    const fields = await services.getFieldDetailsByDivisionID(factoryWeighment.division);
    setFieldList(fields);
  };

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
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
    setFactoryWeighment({
      ...factoryWeighment,
      [e.target.name]: value
    });
  }

  function handleChangeForAmount(e) {
    const target = e.target;
    let value = target.value;

    value = value.replace(/[^0-9.]/g, '');
    const decimalParts = value.split('.');

    if (decimalParts.length > 2) {

      value = decimalParts.slice(0, 2).join('.');
    } else if (decimalParts.length === 2) {

      value = `${decimalParts[0]}.${decimalParts[1].slice(0, 2)}`;
    }

    setFactoryWeighment({
      ...factoryWeighment,
      [target.name]: value
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

  async function InactivDetails(row, index) {
    const dataDelete = [...ArrayField];
    const remove = index;
    dataDelete.splice(remove, 1);
    setArrayField([...dataDelete]);

  };

  const EditItem = (row, index) => {
    setEditIndex(index);
    setEditAmount(row.amount);
  };

  const saveEdit = (index) => {
    const updatedArray = [...ArrayField];
    updatedArray[index] = { ...updatedArray[index], amount: parseFloat(Number(editAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) };
    setArrayField(updatedArray);
    setEditIndex(null);
  };

  async function handleClickAdd() {
    const isMatch = ArrayField.some(x =>
      x.fieldID === parseInt(factoryWeighment.fieldID)
    );

    if (isMatch) {
      alert.error("The field already exists!")
    }
    else {
      var array1 = [...ArrayField];
      var array2 = [...arrayNewWareField];

      let newEntry = {
        groupID: parseInt(factoryWeighment.groupID),
        estateID: parseInt(factoryWeighment.estateID),
        division: parseInt(factoryWeighment.division),
        date: moment(date).format('YYYY-MM-DD'),
        fieldID: parseInt(factoryWeighment.fieldID),
        fieldName: FieldList[factoryWeighment.fieldID],
        amount: parseFloat(factoryWeighment.amount),
        createdBy: parseInt(tokenDecoder.getUserIDFromToken()),
        factoryWeigmentDetails: []
      };

      array1.push(newEntry);
      setArrayField(array1);

      array2.push({
        groupID: factoryWeighment.groupID,
        estateID: factoryWeighment.estateID,
        division: factoryWeighment.division,
        fieldID: factoryWeighment.fieldID,
        amount: factoryWeighment.amount
      });

      setArrayNewWareField('arr', array2);

      setFactoryWeighment({
        ...factoryWeighment,
        fieldID: 0,
        amount: ''
      });
    }
    handleKeyDown1(fieldRef);
  }

  async function saveDetails() {
    const totalAmount = ArrayField.reduce((sum, curr) => sum + curr.amount, 0);

    const factoryWeighmentDetails = ArrayField.map(curr => ({
      fieldID: curr.fieldID,
      date: curr.date,
      amount: curr.amount,
      createdBy: curr.createdBy
    }));

    const groupedData = [{
      groupID: ArrayField[0].groupID,
      estateID: ArrayField[0].estateID,
      division: ArrayField[0].division,
      date: ArrayField[0].date,
      amount: totalAmount,
      createdBy: ArrayField[0].createdBy,
      factoryWeigmentDetails: factoryWeighmentDetails
    }];

    let response = await services.saveDetails(groupedData);

    if (response.statusCode === "Success") {
      alert.success(response.message);
      clearFields();
    } else {
      alert.error(response.message);
      clearFields();
    }
  }

  function clearFields() {
    setFactoryWeighment({
      ...factoryWeighment,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      estateID: parseInt(tokenService.getFactoryIDFromToken()),
      division: 0,
      fieldID: 0,
      amount: ''
    });
    setDate(new Date())
    setArrayField([]);
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
      <Page
        className={classes.root}
        title={title}
      >
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: factoryWeighment.groupID,
              estateID: factoryWeighment.estateID,
              division: factoryWeighment.division,
              fieldID: factoryWeighment.fieldID,
              amount: factoryWeighment.amount
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Business Division is required').min('1', 'Business Division is required'),
                estateID: Yup.number().required('Location is required').min('1', 'Location is required'),
                division: Yup.number().required('Sub Division is required').min('1', 'Sub Division is required'),
                fieldID: Yup.number().required('Field is required').min('1', 'Field is required'),
                amount: Yup.number().typeError('Amount must be a number').required('Amount is required')
                  .test('notOnlyZero', 'Amount must not be only 0', value => value !== 0),
              })
            }
            validateOnChange={false}
            validateOnBlur={false}
            onSubmit={handleClickAdd}
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
                    <CardHeader
                      title={cardTitle(title)}
                    />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent style={{ marginBottom: "2rem" }}>
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="groupID">
                              Business Division  *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.groupID && errors.groupID)}
                              helperText={touched.groupID && errors.groupID}
                              fullWidth
                              name="groupID"
                              onChange={(e) => handleChange(e)}
                              value={factoryWeighment.groupID}
                              variant="outlined"
                              size="small"
                              onBlur={handleBlur}
                              InputProps={{
                                readOnly: !permissionList.isGroupFilterEnabled || ArrayField.length > 0
                              }}
                            >
                              <MenuItem value="0">--Select Business Division--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="estateID">
                              Location *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.estateID && errors.estateID)}
                              fullWidth
                              helperText={touched.estateID && errors.estateID}
                              name="estateID"
                              onBlur={handleBlur}
                              size='small'
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={factoryWeighment.estateID}
                              variant="outlined"
                              id="estateID"
                              InputProps={{
                                readOnly: !permissionList.isFactoryFilterEnabled || ArrayField.length > 0 ? true : false
                              }}
                            >
                              <MenuItem value={0}>--Select Location--</MenuItem>
                              {generateDropDownMenu(estates)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="division">
                              Sub Division *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.division && errors.division)}
                              helperText={touched.division && errors.division}
                              fullWidth
                              name="division"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={factoryWeighment.division}
                              variant="outlined"
                              InputProps={{
                                readOnly: ArrayField.length > 0 ? true : false
                              }}
                            >
                              <MenuItem value="0">--Select Sub Division--</MenuItem>
                              {generateDropDownMenu(divisions)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="date">Date *</InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                fullWidth
                                variant="inline"
                                format="yyyy-MM-dd"
                                margin="dense"
                                name='date'
                                id='date'
                                size='small'
                                value={date}
                                onChange={(e) => {
                                  setDate(e)
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                autoOk
                                InputProps={{
                                  readOnly: ArrayField.length > 0
                                }}
                                keyboardIcon={ArrayField.length > 0 ? null : undefined}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                        </Grid>
                        <br />
                        <br />
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="fieldID">
                              Field *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.fieldID && errors.fieldID)}
                              helperText={touched.fieldID && errors.fieldID}
                              fullWidth
                              name="fieldID"
                              size='small'
                              onChange={(e) => handleChange(e)}
                              value={factoryWeighment.fieldID}
                              variant="outlined"
                              id="fieldID"
                              inputRef={fieldRef}
                              onKeyDown={(e) => handleKeyDown(e, amountRef)}
                            >
                              <MenuItem value={0}>--Select Field--</MenuItem>
                              {generateDropDownMenu(FieldList)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="amount">
                              Amount *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.amount && errors.amount)}
                              helperText={touched.amount && errors.amount}
                              fullWidth
                              size='small'
                              name="amount"
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeForAmount(e)}
                              value={factoryWeighment.amount}
                              variant="outlined"
                              inputRef={amountRef}
                              onKeyDown={(e) => handleKeyDown(e, addButtonRef)}
                            />
                          </Grid>
                        </Grid>
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <Button
                            color="primary"
                            variant="contained"
                            type="submit"
                            size='small'
                            ref={addButtonRef}
                          >
                            Add
                          </Button>
                        </Box>

                      </CardContent>
                      {ArrayField.length > 0 ? (
                        <Grid item xs={12}>

                          <TableContainer>
                            <Table className={classes.table} aria-label="caption table">
                              <TableHead>
                                <TableRow>
                                  <TableCell align="center"><b>Date</b></TableCell>
                                  <TableCell align="center"><b>Field</b></TableCell>
                                  <TableCell align="center"><b>Amount</b></TableCell>
                                  <TableCell align="center"><b>Edit</b></TableCell>
                                  <TableCell align="center"><b>Delete</b></TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {ArrayField.map((row, index) => (
                                  <TableRow key={index}>
                                    <TableCell align="center">{row.date}</TableCell>
                                    <TableCell align="center">
                                      {row.fieldName}
                                    </TableCell>
                                    <TableCell align="center">
                                      {editIndex === index ? (
                                        <TextField
                                          value={editAmount}
                                          onChange={(e) => setEditAmount(e.target.value)}
                                        />
                                      ) : (
                                        parseFloat(row.amount).toFixed(2)
                                      )}
                                    </TableCell>
                                    <TableCell align="center">
                                      {editIndex === index ? (
                                        <Button onClick={() => saveEdit(index)}>Update</Button>
                                      ) : (
                                        <EditIcon
                                          style={{ color: "secondary", cursor: "pointer" }}
                                          size="small"
                                          onClick={() => EditItem(row, index)}
                                        />
                                      )}
                                    </TableCell>
                                    <TableCell align="center">
                                      <DeleteIcon
                                        style={{
                                          color: "red",
                                          cursor: "pointer"
                                        }}
                                        size="small"
                                        onClick={() => InactivDetails(row, index)}
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Grid>
                      )
                        : null}
                      {(ArrayField.length > 0) ?
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <Button
                            color="primary"
                            variant="contained"
                            size='small'
                            onClick={saveDetails}
                          >
                            {"Save"}
                          </Button>
                        </Box>
                        : null}
                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            )}
          </Formik>
        </Container>
      </Page >
    </Fragment>
  )
}