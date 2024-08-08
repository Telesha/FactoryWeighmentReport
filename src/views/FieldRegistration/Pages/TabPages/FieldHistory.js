import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../../Services';
import { useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import tokenDecoder from '../../../../utils/tokenDecoder';

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
}));

export function FieldHistory({ historyArray, setHistoryArray, setIsMainButtonEnable }) {
  const [title, setTitle] = useState("Add Field")
  const [isUpdate, setIsUpdate] = useState(false);
  const classes = useStyles();
  const [fieldPlantDistences, setFieldPlantDistences] = useState([]);
  const [plantingTypes, setPlantingTypes] = useState([]);
  const [index, setIndex] = useState()
  const [sectionDetailsID, setSectionDetailsID] = useState(0)
  const [tableData, setTableData] = useState({
    plantingType: 0,
    spaceBetweenPlantsID: 0,
    fieldArea: 0,
    noOfPlants: 0,
    date: ''
  });
  const alert = useAlert();

  useEffect(() => {
    trackPromise(GetAllFieldPlantDistence());
    trackPromise(GetFieldPlantingType());
  }, []);

  async function GetAllFieldPlantDistence() {
    const result = await services.GetAllFieldPlantDistence()
    setFieldPlantDistences(result);
  }

  async function GetFieldPlantingType() {
    const result = await services.GetFieldPlantingType()
    setPlantingTypes(result);
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

  function handleDateChangeDate(value) {
    setTableData({
      ...tableData,
      date: value
    })
  }
  function handleChangeTabledata(e) {
    setTableData({
      ...tableData,
      [e.target.name]: e.target.value
    })
  }

  function addHistory(values) {
    const dateObj = new Date(tableData.date);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth();
    if (!isUpdate) {
      let historyDetails = {
        plantingTypeName: plantingTypes[values.plantingType],
        plantingType: parseInt(values.plantingType),
        spaceBetweenPlants: fieldPlantDistences[values.spaceBetweenPlantsID],
        spaceBetweenPlantsID: parseInt(values.spaceBetweenPlantsID),
        fieldArea: parseFloat(values.fieldArea),
        noOfPlants: parseInt(values.noOfPlants),
        date: year.toString(),
        plantingYear: year.toString(),
        plantingMonth: parseInt(month + 1).toString(),
        sectionDetailsID: sectionDetailsID
      };
      setHistoryArray(historyArray => [...historyArray, historyDetails]);
      alert.success("History detail added.")
      setIsMainButtonEnable(true);
    }
    else {
      let historyDetails = {
        plantingTypeName: plantingTypes[values.plantingType],
        plantingType: parseInt(values.plantingType),
        spaceBetweenPlants: fieldPlantDistences[values.spaceBetweenPlantsID],
        spaceBetweenPlantsID: parseInt(values.spaceBetweenPlantsID),
        fieldArea: parseFloat(values.fieldArea),
        noOfPlants: parseInt(values.noOfPlants),
        date: year.toString(),
        plantingYear: year.toString(),
        plantingMonth: parseInt(month + 1).toString(),
        sectionDetailsID: sectionDetailsID
      };
      historyArray.splice(index, 1, historyDetails);
      setIsMainButtonEnable(true);
      setSectionDetailsID(0);
      setIndex();
      setIsUpdate(false);
    }
    setTableData({
      ...tableData,
      plantingType: 0,
      spaceBetweenPlantsID: 0,
      fieldArea: 0,
      noOfPlants: '',
      date: null
    });
  }

  async function EditItem(index) {
    setIsUpdate(true);
    setIndex(index);
    if (historyArray[index].sectionDetailsID != undefined) {
      setTableData({
        ...tableData,
        plantingType: historyArray[index].plantingType,
        spaceBetweenPlantsID: historyArray[index].spaceBetweenPlantsID,
        fieldArea: historyArray[index].fieldArea,
        noOfPlants: historyArray[index].noOfPlants,
        date: historyArray[index].date
      });
      setSectionDetailsID(historyArray[index].sectionDetailsID);
    }
  }

  async function DeleteItem(index) {
    if (historyArray[index].sectionDetailsID != undefined) {
      const res = await services.deleteSectionItem(historyArray[index].sectionDetailsID, tokenDecoder.getUserIDFromToken());
      setHistoryArray(current => current.filter((img, i) => i != index));
      if (res > 0) {
        alert.success('Item deleted successfully');
      }
    }
    else {
      for (var i = 0; i < historyArray.length; i++) {
        setTableData({
          ...tableData,
          plantingType: historyArray[i].plantingType,
          spaceBetweenPlantsID: historyArray[i].spaceBetweenPlantsID,
          fieldArea: historyArray[i].fieldArea,
          noOfPlants: historyArray[i].noOfPlants,
          date: historyArray[i].date
        })
      }
      historyArray.splice(index, 1);
      setTableData({
        ...tableData,
        plantingType: '0',
        spaceBetweenPlantsID: '0',
        fieldArea: '',
        noOfPlants: 0,
        date: null
      });
      alert.success('Item deleted successfully');
    }
  }

  function settingPlantingType(data) {
    if (data > 0) {
      return plantingTypes[data];
    }
  }

  function settingSpacebetweenPlants(data) {
    if (data > 0) {
      return fieldPlantDistences[data];
    }
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              spaceBetweenPlantsID: tableData.spaceBetweenPlantsID,
              plantingType: tableData.plantingType,
              fieldArea: tableData.fieldArea,
              noOfPlants: tableData.noOfPlants,
              date: tableData.date
            }}
            onSubmit={(event) => addHistory(event)}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              handleChange,
              isSubmitting,
              touched,
              values,
            }) => (
              <form onSubmit={handleSubmit}>
                <PerfectScrollbar>
                  <Divider />
                  <CardContent>
                    <CardHeader
                      title="Add Field History Details"
                    />
                    <CardContent>
                      <Grid container spacing={3}
                        columnSpacing={3}
                        justifyContent="space-around"
                      >
                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="plantingType">
                            Planting Type *
                          </InputLabel>
                          <TextField select
                            error={Boolean(touched.plantingType && errors.plantingType)}
                            fullWidth
                            helperText={touched.plantingType && errors.plantingType}
                            name="plantingType"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeTabledata(e)}
                            value={tableData.plantingType}
                            size='small'
                            variant="outlined" >
                            <MenuItem value="0">--Select Planting Type--</MenuItem>
                            {generateDropDownMenu(plantingTypes)}
                          </TextField>
                        </Grid>
                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id='spaceBetweenPlantsID'>
                            Space between plants *
                          </InputLabel>
                          <TextField select
                            error={Boolean(touched.spaceBetweenPlantsID && errors.spaceBetweenPlantsID)}
                            fullWidth
                            helperText={touched.spaceBetweenPlantsID && errors.spaceBetweenPlantsID}
                            name='spaceBetweenPlantsID'
                            onBlur={handleBlur}
                            value={tableData.spaceBetweenPlantsID}
                            onChange={(e) => handleChangeTabledata(e)}
                            variant="outlined"
                            size='small'
                            onKeyDown={(evt) =>
                              (evt.key === "-") && evt.preventDefault()
                            }>
                            <MenuItem value="0">--Select Space between plants--</MenuItem>
                            {generateDropDownMenu(fieldPlantDistences)}
                          </TextField>
                        </Grid>
                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id='fieldArea'>
                            Field Area *
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.fieldArea && errors.fieldArea)}
                            fullWidth
                            helperText={touched.fieldArea && errors.fieldArea}
                            name='fieldArea'
                            onBlur={handleBlur}
                            value={tableData.fieldArea}
                            onChange={(e) => handleChangeTabledata(e)}
                            variant="outlined"
                            size='small'
                            InputProps={{
                              inputProps: {
                                step: 0.01
                              },
                            }}
                            onKeyDown={(evt) =>
                              (evt.key === "-") && evt.preventDefault()
                            }
                            onWheel={event => event.target.blur()}
                          />
                        </Grid>
                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id='noOfPlants'>
                            No of Plants *
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.noOfPlants && errors.noOfPlants)}
                            fullWidth
                            helperText={touched.noOfPlants && errors.noOfPlants}
                            name='noOfPlants'
                            onBlur={handleBlur}
                            value={tableData.noOfPlants}
                            onChange={(e) => handleChangeTabledata(e)}
                            variant="outlined"
                            size='small'
                            InputProps={{
                              inputProps: {
                                step: 0
                              },
                            }}
                            onKeyDown={(evt) =>
                              (evt.key === "-") && evt.preventDefault()
                            }
                            onWheel={event => event.target.blur()}
                          />
                        </Grid>
                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="year" style={{ marginBottom: '-8px' }}>
                            Year *
                          </InputLabel>

                          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                              error={Boolean(touched.date && errors.date)}
                              fullWidth
                              helperText={touched.date && errors.date}
                              autoOk
                              views={['year']}
                              inputVariant="outlined"
                              margin="dense"
                              name="year"
                              disableFuture
                              value={tableData.date}
                              onChange={(e) => {
                                handleDateChangeDate(e);
                              }}
                              KeyboardButtonProps={{
                                'aria-label': 'change year',
                              }}
                              InputProps={{ readOnly: true }}
                            />
                          </MuiPickersUtilsProvider>
                        </Grid>
                      </Grid>
                      <Box display="flex" justifyContent="flex-end" p={2} >
                        <Button
                          color="primary"
                          size='small'
                          variant="contained"
                          type='submit'
                          disabled={tableData.plantingType == 0 || tableData.spaceBetweenPlantsID == 0 || tableData.fieldArea == 0 || tableData.noOfPlants == 0 || tableData.date == '' || tableData.date == null || isSubmitting}
                        >
                          Add
                        </Button>
                      </Box>
                      <Grid>
                        {historyArray.length != 0 ? (
                          <TableContainer>
                            <Table size='small'>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Planting type</TableCell>
                                  <TableCell>Space between plants</TableCell>
                                  <TableCell>Field Area</TableCell>
                                  <TableCell>No of Plants</TableCell>
                                  <TableCell>Year</TableCell>
                                  <TableCell >Edit</TableCell>
                                  <TableCell >Delete</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {historyArray.map((row, index) => {
                                  return <TableRow key={index}>
                                    <TableCell>
                                      {settingPlantingType(row.plantingType)}
                                    </TableCell>
                                    <TableCell>
                                      {settingSpacebetweenPlants(row.spaceBetweenPlantsID)}
                                    </TableCell>
                                    <TableCell>
                                      {row.fieldArea == 0 ? '-' : (row.fieldArea).toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                      {row.noOfPlants}
                                    </TableCell>
                                    <TableCell>
                                      {row.date}
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
                                })}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        )
                          : null}
                      </Grid>
                    </CardContent>

                  </CardContent>
                </PerfectScrollbar>

              </form>
            )}
          </Formik>
        </Container>
      </Page>
    </Fragment >
  );
};

