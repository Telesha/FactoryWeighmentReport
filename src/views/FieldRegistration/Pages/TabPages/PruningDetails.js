import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import tokenDecoder from '../../../../utils/tokenDecoder';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minheight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  avatar: {
    marginRight: theme.spacing(2)
  },
}));

export function PruningDetails({ pruningArray, setPruningArray, setIsMainButtonEnable }) {
  const [title, setTitle] = useState("Add Field")
  const [isUpdate, setIsUpdate] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const classes = useStyles();
  const [pruningTypes, setpruningTypes] = useState([]);
  const [pruningDetailsID, setPruningDetailsID] = useState(0);
  const [index, setIndex] = useState()
  const [tableData, setTableData] = useState({
    pruningType: 0,
    fieldArea: 0,
    height: 0,
    allowance: 0,
  });
  const navigate = useNavigate();
  const alert = useAlert();
  const { fieldID } = useParams();
  let decrypted = 0;

  useEffect(() => {
    decrypted = atob(fieldID.toString());
    trackPromise(
      GetFieldPruningType(),
    )
  }, []);

  async function GetFieldPruningType() {
    const result = await services.GetFieldPruningType()
    setpruningTypes(result);
  }

  function addPruning(values) {
    if (!isUpdate) {
      let pruningDetails = {
        height: parseFloat(values.height),
        fieldArea: parseFloat(values.fieldArea),
        pruningTypeID: parseInt(values.pruningType),
        allowance: parseFloat(values.allowance) == '' ? null : parseFloat(tableData.allowance),
        pruningDetailsID: parseInt(pruningDetailsID)
      };
      setPruningArray(pruningArray => [...pruningArray, pruningDetails]);
      alert.success("History detail added.")
      setIsMainButtonEnable(true);
    }
    else {
      let pruningDetails = {
        height: parseFloat(values.height),
        fieldArea: parseFloat(values.fieldArea),
        pruningTypeID: parseInt(values.pruningType),
        allowance: parseFloat(values.allowance) == '' ? null : parseFloat(tableData.allowance),
        pruningDetailsID: parseInt(pruningDetailsID)
      };
      pruningArray.splice(index, 1, pruningDetails);
      setIsMainButtonEnable(true);
      setPruningDetailsID(0);
      setIndex();
      setIsUpdate(false);
    }
    setTableData({
      ...tableData,
      pruningType: 0,
      fieldArea: 0,
      height: 0,
      allowance: 0
    });
  }

  async function EditItem(index) {
    setIsUpdate(true);
    setIndex(index);
    if (pruningArray[index].pruningDetailsID != undefined) {
      setTableData({
        ...tableData,
        pruningType: pruningArray[index].pruningTypeID,
        fieldArea: pruningArray[index].fieldArea,
        height: pruningArray[index].height,
        allowance: pruningArray[index].allowance
      });
      setPruningDetailsID(pruningArray[index].pruningDetailsID);
    }
  }

  async function DeleteItem(index) {
    if (pruningArray[index].pruningDetailsID != undefined) {
      const res = await services.deletePruningItem(pruningArray[index].pruningDetailsID, tokenDecoder.getUserIDFromToken());
      setPruningArray(current => current.filter((img, i) => i != index));
      if (res > 0) {
        alert.success('Item deleted successfully');
      }
    }
    else {
      for (var i = 0; i < pruningArray.length; i++) {
        setTableData({
          ...tableData,
          pruningType: pruningArray[i].pruningTypeID,
          fieldArea: pruningArray[i].fieldArea,
          height: pruningArray[i].height,
          allowance: pruningArray[i].allowance
        })
      }
      pruningArray.splice(index, 1);
      setTableData({
        ...tableData,
        pruningType: '0',
        fieldArea: '',
        height: '',
        allowance: ''
      });
      alert.success('Item deleted successfully');
    }
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

  function handleChangeData(e) {
    const value = e.target.value;
    setTableData({
      ...tableData,
      [e.target.name]: value
    });
  }

  function handleChangeTabledata(e) {
    setTableData({
      ...tableData,
      [e.target.name]: e.target.value
    })
  }

  function settingPruningType(data) {
    if (data > 0) {
      return pruningTypes[data];
    }
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              height: tableData.height,
              pruningType: tableData.pruningType,
              allowance: tableData.allowance,
              fieldArea: tableData.fieldArea,
            }}
            onSubmit={(event) => addPruning(event)}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              touched,
            }) => (
              <form onSubmit={handleSubmit}>

                <PerfectScrollbar>
                  <Divider />
                  <CardContent>
                    <CardHeader
                      title="Add Pruning Details"
                    />
                    <CardContent>
                      <Grid container spacing={3}
                        columnSpacing={3}
                        justifyContent="space-around"
                      >
                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="pruningType">
                            Pruning Type *
                          </InputLabel>
                          <TextField select
                            error={Boolean(touched.pruningType && errors.pruningType)}
                            fullWidth
                            helperText={touched.pruningType && errors.pruningType}
                            name="pruningType"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeTabledata(e)}
                            value={tableData.pruningType}
                            size='small'
                            variant="outlined" >
                            <MenuItem value="0">--Select Planting Type--</MenuItem>
                            {generateDropDownMenu(pruningTypes)}
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
                          <InputLabel shrink id="height">
                            Height *
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.height && errors.height)}
                            fullWidth
                            helperText={touched.height && errors.height}
                            name="height"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeData(e)}
                            value={tableData.height}
                            size='small'
                            variant="outlined"
                            disabled={isDisableButton}
                          />
                        </Grid>
                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id='allowance'>
                            Allowance*
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.allowance && errors.allowance)}
                            fullWidth
                            helperText={touched.allowance && errors.allowance}
                            name='allowance'
                            onBlur={handleBlur}
                            value={tableData.allowance}
                            onChange={(e) => handleChangeData(e)}
                            variant="outlined"
                            size='small'
                          />
                        </Grid>
                      </Grid>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          color="primary"
                          type="submit"
                          variant="contained"
                          disabled={tableData.pruningType == 0 || tableData.fieldArea == 0 || tableData.height == 0 || tableData.allowance == 0}
                        >
                          Add
                        </Button>
                      </Box>
                      <Grid>
                        {pruningArray.length != 0 ? (
                          <TableContainer>
                            <Table size='small'>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Pruning type</TableCell>
                                  <TableCell>Field Area</TableCell>
                                  <TableCell>Height</TableCell>
                                  <TableCell>Allowance</TableCell>
                                  <TableCell >Edit</TableCell>
                                  <TableCell >Delete</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {pruningArray.map((row, index) => {
                                  return <TableRow key={index}>
                                    <TableCell>
                                      {settingPruningType(row.pruningTypeID)}
                                    </TableCell>
                                    <TableCell>
                                      {row.fieldArea == 0 ? '-' : (row.fieldArea).toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                      {(row.height).toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                      {(row.allowance).toFixed(2)}
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

