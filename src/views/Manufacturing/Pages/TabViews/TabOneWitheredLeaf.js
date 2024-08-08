import React, { useState, useEffect, Fragment, createContext } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Button, Card, makeStyles, Container, CardHeader, CardContent, Divider, MenuItem, Grid, InputLabel, TextField } from '@material-ui/core';
import services from '../../Services';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import { useNavigate, useParams } from 'react-router-dom';
import { useAlert } from "react-alert";
import { trackPromise } from 'react-promise-tracker';
import MaterialTable, { MTableToolbar, MTableBody, MTableHeader } from "material-table";
import moment from 'moment';
import { AlertDialogWithoutButton } from '../../../Common/AlertDialogWithoutButton';

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

export default function WitheredLeaf({ manufactureID, groupData, factoryData, witheredLeafData, setWitheredLeafData, enableRolling, disableFields }) {
  const classes = useStyles();
  const [title, setTitle] = useState("Manufacturing Add Edit");
  const [ShoolDetails, setShoolDetails] = useState({
    startDate: "",
    endDate: "",
    witheredLeafAmount: '',
    witheredLeafWeightBy: 0,
    witheringCondition: 0,
  });
  const [employees, setEmployees] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [dialogbox, setDialogbox] = useState(false);
  const [isHide, setIsHide] = useState(true);
  const [FactoryList, setFactoryList] = useState([]);
  const [GroupList, setGroupList] = useState([]);
  const [successData, setSuccessData] = useState([]);
  const alert = useAlert();
  const { blManufaturingID } = useParams();
  let decrypted = 0;

  let encrypted = "";



  useEffect(() => {
    trackPromise(
      getEmployeesForDropdown());
  }, [groupData, factoryData]);

  useEffect(() => {
    decrypted = atob(blManufaturingID);
    if (decrypted != 0) {
      trackPromise(GetWitheringDetailsByWitheredLeafID(decrypted));
    }
  }, []);

  async function AddShoolDetails() {
    let dhoolModel = {
      startDate: moment(ShoolDetails.startDate).format(),
      endDate: moment(ShoolDetails.endDate).format(),
      witheredLeafAmount: parseFloat(ShoolDetails.witheredLeafAmount),
      witheredLeafWeightBy: parseInt(ShoolDetails.witheredLeafWeightBy),
      witheringCondition: parseInt(ShoolDetails.witheringCondition)
    }

    setWitheredLeafData(witheredLeafData => [...witheredLeafData, dhoolModel]);
    clearFormFields();
  }

  async function handleClickRemove(data) {
    setTableData(data)
    setDialogbox(true);

  }

  async function confirmData() {

    if (isUpdate == true) {

      let decrypted = 0;
      decrypted = atob(blManufaturingID);
      GetWitheringDetailsByWitheredLeafID(decrypted)
      const res = await services.DeleteWitheredLeaf(tableData.witheredLeafID);

      if (res == 1) {
        setWitheredLeafData(witheredLeafData.splice(tableData.tableData.id))
        let decrypted = 0;
        decrypted = atob(blManufaturingID);
        GetWitheringDetailsByWitheredLeafID(decrypted)
        alert.success('Item deleted successfully');
      } else {
        const dataDelete = [...witheredLeafData];
        const index = tableData.tableData.id;
        dataDelete.splice(index, 1);
        setWitheredLeafData([...dataDelete]);

        setDialogbox(false);
      }

      setDialogbox(false);

    } else {
      if (tableData.witheredLeafID != undefined) {
        
        const res = await services.DeleteWitheredLeaf(tableData.witheredLeafID);

        if(res == 1) {

          const dataDelete = [...witheredLeafData];
        const index = tableData.tableData.id;
        dataDelete.splice(index, 1);
        setWitheredLeafData([...dataDelete]);
        }

        alert.success('Item deleted successfully');
      } else {
        const dataDelete = [...witheredLeafData];
        const index = tableData.tableData.id;
        dataDelete.splice(index, 1);
        setWitheredLeafData([...dataDelete]);

        setDialogbox(false);
      }



    }

  }

  async function cancelData() {
    if (isUpdate == true) {

      let decrypted = 0;
      decrypted = atob(blManufaturingID);
      GetWitheringDetailsByWitheredLeafID(decrypted)
      setDialogbox(false);

    } else {

      setDialogbox(false);

    }

  }

  async function getEmployeesForDropdown() {
    const employees = await services.getEmployeesForDropdown(groupData, factoryData);
    setEmployees(employees);
  }

  async function saveWitheredLeaf() {
    await timeout(1000);
    if (isUpdate == true) {

      let response = await services.saveWithtredLeaf(witheredLeafData, manufactureID);
      
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setWitheredLeafData([])
        getWitherdLeafData();
      }
      else {
        alert.error(response.message);
      }
    } else {
      let response = await services.saveWithtredLeaf(witheredLeafData, manufactureID);

     if (response.statusCode == "Success") {
        enableRolling();
        alert.success(response.message);
        setWitheredLeafData([])
        getWitherdLeafData();
        setSuccessData(response.data);
      }
      else {
        
        alert.error(response.message);
        setSuccessData(response.data);
      }
    }
  }

  async function getWitherdLeafData() {

    let response = await services.GetWitheringDetailsByWitheredLeafID(manufactureID);
    setWitheredLeafData(response)
  }

  async function GetWitheringDetailsByWitheredLeafID(blManufaturingID) {
    let response = await services.GetWitheringDetailsByWitheredLeafID(blManufaturingID);
    setWitheredLeafData(response)

    setTitle("Edit Manufacturing");
    setIsUpdate(true || false);
    setIsHide(false)
  }


  function timeout(delay) {

    return new Promise(res => setTimeout(res, delay));

  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setShoolDetails({
      ...ShoolDetails,
      [e.target.name]: value
    });
  }

  async function clearFormFields() {
    setShoolDetails({
      ...ShoolDetails,
      startDate: "",
      endDate: "",
      witheredLeafAmount: '',
      witheredLeafWeightBy: 0,
      witheringCondition: 0,

    });
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

  return (

    <Formik
      initialValues={{
        startDate: ShoolDetails.startDate,
        endDate: ShoolDetails.endDate,
        witheredLeafAmount: ShoolDetails.witheredLeafAmount,
        witheredLeafWeightBy: ShoolDetails.witheredLeafWeightBy,
        witheringCondition: ShoolDetails.witheringCondition
      }}
      validationSchema={
        Yup.object().shape({
          startDate: Yup.string().required('Start Date is required').min("1", 'Start Date is required'),
          endDate: Yup.string().required('End Date is required').min("1", 'End Date is required'),
          witheredLeafAmount: Yup.number().required('Withered Leaf Amount is required').min("1", 'Withered Leaf Amount is required'),
          witheredLeafWeightBy: Yup.number().required('Withered Leaf Weight By is required').min("1", 'Withered Leaf Weight By is required'),
          witheringCondition: Yup.number().required('Withering Condition is required').min("1", 'Withering Condition is required'),
        })
      }
      enableReinitialize
      onSubmit={(event) => trackPromise(AddShoolDetails(event))}
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
              <CardHeader title={"Withered Leaf"} />
              <PerfectScrollbar>
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item md={3} xs={8}>
                      <InputLabel shrink id="startDate">
                        Start Date & Time *
                      </InputLabel>
                      <TextField
                        fullWidth
                        name="startDate"
                        type="datetime-local"
                        error={Boolean(touched.startDate && errors.startDate)}
                        helperText={touched.startDate && errors.startDate}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        onBlur={handleBlur}
                        onChange={(e) => handleChange(e)}
                        value={ShoolDetails.startDate}
                        disabled={disableFields}
                        variant="outlined"
                        id="startDate"
                        size='small'
                      >

                      </TextField>
                    </Grid>
                    <Grid item md={3} xs={8}>
                      <InputLabel shrink id="endDate">
                        End Date & Time *
                      </InputLabel>
                      <TextField
                        fullWidth
                        type="datetime-local"
                        error={Boolean(touched.endDate && errors.endDate)}
                        helperText={touched.endDate && errors.endDate}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        name="endDate"
                        onBlur={handleBlur}
                        onChange={(e) => handleChange(e)}
                        value={ShoolDetails.endDate}
                        disabled={disableFields}
                        variant="outlined"
                        id="endDate"
                        size='small'
                      >
                      </TextField>
                    </Grid>
                    <Grid item md={3} xs={8}>
                      <InputLabel shrink id="witheredLeafAmount">
                        Withered Leaf(KG) *
                      </InputLabel>
                      <TextField
                        fullWidth
                        name="witheredLeafAmount"
                        type='number'
                        error={Boolean(touched.witheredLeafAmount && errors.witheredLeafAmount)}
                        helperText={touched.witheredLeafAmount && errors.witheredLeafAmount}
                        onBlur={handleBlur}
                        onChange={(e) => handleChange(e)}
                        value={ShoolDetails.witheredLeafAmount}
                        disabled={disableFields}
                        variant="outlined"
                        id="witheredLeafAmount"
                        size='small'
                      >
                      </TextField>
                    </Grid>
                    <Grid item md={3} xs={8}>
                      <InputLabel shrink id="witheredLeafWeightBy">
                        Withered Leaf Weight By *
                      </InputLabel>
                      <TextField select
                        fullWidth
                        name="witheredLeafWeightBy"
                        error={Boolean(touched.witheredLeafWeightBy && errors.witheredLeafWeightBy)}
                        helperText={touched.witheredLeafWeightBy && errors.witheredLeafWeightBy}
                        onBlur={handleBlur}
                        onChange={(e) => handleChange(e)}
                        value={ShoolDetails.witheredLeafWeightBy}
                        disabled={disableFields}
                        variant="outlined"
                        id="witheredLeafWeightBy"
                        size='small'
                      >
                        <MenuItem value="0">--Select Weight By--</MenuItem>
                        {generateDropDownMenu(employees)}
                      </TextField>
                    </Grid>

                    <Grid item md={3} xs={8}>
                      <InputLabel shrink id="witheringCondition">
                        Withering Condition *
                      </InputLabel>
                      <TextField select
                        fullWidth
                        error={Boolean(touched.witheringCondition && errors.witheringCondition)}
                        helperText={touched.witheringCondition && errors.witheringCondition}
                        name="witheringCondition"
                        onBlur={handleBlur}
                        onChange={(e) => handleChange(e)}
                        value={ShoolDetails.witheringCondition}
                        disabled={disableFields}
                        variant="outlined"
                        id="witheringCondition"
                        size='small'
                      >
                        <MenuItem value="0">--Select Withering Condition--</MenuItem>
                        <MenuItem value="1">Soft</MenuItem>
                        <MenuItem value="2">Medium</MenuItem>
                        <MenuItem value="3">Hard</MenuItem>

                      </TextField>
                    </Grid>
                  </Grid>

                  <Box display="flex" flexDirection="row-reverse" p={2} >
                    <Button
                      color="primary"
                      type="submit"
                      variant="contained"
                      disabled={disableFields}
                      size='small'
                    >
                      Add
                    </Button>
                  </Box>


                  <Box minWidth={1050}>
                    <MaterialTable
                      title="Multiple Actions Preview"
                      columns={[
                        { title: 'Weight By', field: 'witheredLeafWeightBy', lookup: { ...employees } },
                        { title: 'Withered Leaf(KG)', field: 'witheredLeafAmount' },
                        { title: 'Start Date & Time', field: 'startDate' },
                        { title: 'End Date & Time', field: 'endDate' },
                        {
                          title: 'Withering Condition', field: 'witheringCondition', lookup: {
                            "1": "Soft",
                            "2": "Medium",
                            "3": "Hard"
                          }
                        }

                      ]}
                      data={witheredLeafData}
                      options={{
                        exportButton: false,
                        showTitle: false,
                        headerStyle: { textAlign: "left", height: '1%' },
                        cellStyle: { textAlign: "left" },
                        columnResizable: false,
                        actionsColumnIndex: -1,
                        pageSize: 5,
                        search: false
                      }}
                      actions={[
                        rowData => ({
                          disabled: (disableFields),
                          icon: 'delete',
                          tooltip: 'Remove',
                          onClick: (event, rowData) => { handleClickRemove(rowData) }
                        }),
                      ]}

                    />
                  </Box>
                  {dialogbox ?
                    <AlertDialogWithoutButton confirmData={confirmData} cancelData={cancelData}
                      IconTitle={"Delete"}
                      headerMessage={"Are you sure you want to delete?"}
                      discription={""} />
                    : null
                  }
                  <Box display="flex" flexDirection="row-reverse" p={2} >
                    <Button
                      color="primary"
                      variant="contained"
                      disabled={disableFields}
                      onClick={(event) => trackPromise(saveWitheredLeaf(event))}
                      size='small'
                    >
                      save
                    </Button>
                  </Box>
                </CardContent>
              </PerfectScrollbar>
            </Card>
          </Box>
        </form>
      )}
    </Formik>
  )
}
