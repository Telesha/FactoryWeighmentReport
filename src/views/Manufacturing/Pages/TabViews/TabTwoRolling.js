import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Button, Card, makeStyles, CardHeader, CardContent, Divider, MenuItem, Grid, InputLabel, TextField } from '@material-ui/core';
import services from '../../Services';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useParams } from 'react-router-dom';
import { useAlert } from "react-alert";
import { trackPromise } from 'react-promise-tracker';
import MaterialTable from "material-table";
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

export default function Rolling({ manufactureID, groupData, factoryData, rollingData, setRollingData, enableFiring, disableFields}) {
  const classes = useStyles();
  const [title, setTitle] = useState("Manufacturing Add Edit");
  const [isUpdate, setIsUpdate] = useState(false);
  const [dialogbox, setDialogbox] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [successData, setSuccessData] = useState([]);
  const [isHide, setIsHide] = useState(true);
  const [ShoolDetails, setShoolDetails] = useState({
    rollingWeightBy: 0,
    rollingStartTime: "",
    rollingEndDate: "",
    rollingPeriod: '',
    noOfBatches: '',
    leafAmount: "",

    direID: "0",
    firstDhool: "",
    secondDhool: "",
    thirdDhool: "",
    fourthDhool: "",
    dirInKg: "",
    bigBulk: "",
    firedTea: "",
    firedDhoolWeightBy: ""
  });
  
  const alert = useAlert();
  const { blManufaturingID } = useParams();
  let decrypted = 0;

  let encrypted = "";
  const [employees, setEmployees] = useState([]);

  async function handleClickRemove(data) {
    setTableData(data)
    setDialogbox(true);

  }

  useEffect(() => {
    trackPromise(
      getEmployeesForDropdown());
  }, [groupData, factoryData]);

  useEffect(() => {
    decrypted = atob(blManufaturingID);
    if (decrypted != 0) {
      trackPromise(GetRollingDetailsByBLManufaturingID(decrypted));
    }
  }, []);

  async function getEmployeesForDropdown() {
    const employees = await services.getEmployeesForDropdown(groupData, factoryData);
    setEmployees(employees);
  }


  async function AddShoolDetails() {
    let dhoolModel = {
      rollingWeightBy: parseInt(ShoolDetails.rollingWeightBy),
      rollingStartTime: moment(ShoolDetails.rollingStartTime).format(),
      rollingEndDate: moment(ShoolDetails.rollingEndDate).format(),
      rollingPeriod: parseInt(ShoolDetails.rollingPeriod),
      noOfBatches: parseInt(ShoolDetails.noOfBatches),
    }

    setRollingData(rollingData => [...rollingData, dhoolModel]);
    clearFormFields();
  }

  async function confirmData() {

    if (isUpdate == true) {

      let decrypted = 0;
      decrypted = atob(blManufaturingID);
      GetRollingDetailsByBLManufaturingID(decrypted)
      const res = await services.DeleteRolling(tableData.blRollingID);

      if (res == 1) {

        setRollingData(rollingData.splice(tableData.tableData.id))
        let decrypted = 0;
        decrypted = atob(blManufaturingID);
        GetRollingDetailsByBLManufaturingID(decrypted)

        alert.success('Item deleted successfully');

      } else {

        const dataDelete = [...rollingData];
        const index = tableData.tableData.id;
        dataDelete.splice(index, 1);
        setRollingData([...dataDelete]);

        setDialogbox(false);
      }

      setDialogbox(false);

    } else {

      if (tableData.blRollingID != undefined) {
        
        const res = await services.DeleteRolling(tableData.blRollingID);

        if(res == 1) {

          const dataDelete = [...rollingData];
        const index = tableData.tableData.id;
        dataDelete.splice(index, 1);
        setRollingData([...dataDelete]);
        }

        alert.success('Item deleted successfully');
      } else {
        const dataDelete = [...rollingData];
        const index = tableData.tableData.id;
        dataDelete.splice(index, 1);
        setRollingData([...dataDelete]);

        setDialogbox(false);
      }
    }

  }

  async function cancelData() {
    if (isUpdate == true) {

      let decrypted = 0;
      decrypted = atob(blManufaturingID);
      GetRollingDetailsByBLManufaturingID(decrypted)
      setDialogbox(false);

    } else {

      setDialogbox(false);
    }

  }

  async function saveRolling() {
    await timeout(1000);

    if (isUpdate == true) {

      let response = await services.saveRolling(rollingData, manufactureID);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setRollingData([])
        getRollingData();
      }
      else {
        alert.error(response.message);
      }
    } else {
      let response = await services.saveRolling(rollingData, manufactureID);
      if (response.statusCode == "Success") {
        enableFiring();
        alert.success(response.message);
        setRollingData([])
        getRollingData();
        setSuccessData(response.data);
        
      }
      else {
        alert.error(response.message);
        setSuccessData(response.data);
      }
    }
  }

  async function getRollingData() {

    let response = await services.GetRollingDetailsByBLManufaturingID(manufactureID);
    setRollingData(response)
  }

  async function GetRollingDetailsByBLManufaturingID(blManufaturingID) {
    let response = await services.GetRollingDetailsByBLManufaturingID(blManufaturingID);
    setRollingData(response)
    setTitle("Edit Manufacturing");
    setIsUpdate(true);
    setIsHide(false)
  }

  async function handleClickRemove(data) {
    setTableData(data)
    setDialogbox(true);

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
      rollingWeightBy: 0,
      rollingStartTime: "",
      rollingEndDate: "",
      rollingPeriod: '',
      noOfBatches: '',
      leafAmount: "",

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
        rollingStartTime: ShoolDetails.rollingStartTime,
        rollingEndDate: ShoolDetails.rollingEndDate,
        rollingPeriod: ShoolDetails.rollingPeriod,
        noOfBatches: ShoolDetails.noOfBatches,
        leafAmount: ShoolDetails.leafAmount,
        rollingWeightBy: ShoolDetails.rollingWeightBy,
      }}
      validationSchema={
        Yup.object().shape({
        rollingStartTime: Yup.string().required('Rolling Start Date is required').min("1", 'Rolling Start Date is required'),
        rollingEndDate: Yup.string().required('Rolling End Date is required').min("1", 'Rolling End Date is required'),
        rollingPeriod: Yup.number().required('Rolling Period is required').min("1", 'Rolling Period is required'),
        noOfBatches: Yup.number().required('No of Batches is required').min("1", 'No of Batches is required'),
        rollingWeightBy: Yup.number().required('Rolling Weight By is required').min("1", 'Rolling Weight By is required'),

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
              <CardHeader title={"Rolling"} />
              <PerfectScrollbar>
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item md={3} xs={8}>
                      <InputLabel shrink id="rollingStartTime">
                        Start Date & Time *
                      </InputLabel>
                      <TextField
                        fullWidth
                        error={Boolean(touched.rollingStartTime && errors.rollingStartTime)}
                        helperText={touched.rollingStartTime && errors.rollingStartTime}
                        name="rollingStartTime"
                        type="datetime-local"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        onBlur={handleBlur}
                        onChange={(e) => handleChange(e)}
                        value={ShoolDetails.rollingStartTime}
                        disabled={disableFields}
                        variant="outlined"
                        id="rollingStartTime"
                        size='small'
                      >

                      </TextField>
                    </Grid>

                    <Grid item md={3} xs={8}>
                      <InputLabel shrink id="rollingEndDate">
                        End Date & Time *
                      </InputLabel>
                      <TextField
                        fullWidth
                        error={Boolean(touched.rollingEndDate && errors.rollingEndDate)}
                        helperText={touched.rollingEndDate && errors.rollingEndDate}
                        type="datetime-local"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        name="rollingEndDate"
                        onBlur={handleBlur}
                        onChange={(e) => handleChange(e)}
                        disabled={disableFields}
                        value={ShoolDetails.rollingEndDate}
                        variant="outlined"
                        id="rollingEndDate"
                        size='small'
                      >
                      </TextField>
                    </Grid>

                    <Grid item md={3} xs={8}>
                      <InputLabel shrink id="rollingPeriod">
                        Rolling Period *
                      </InputLabel>
                      <TextField
                        fullWidth
                        error={Boolean(touched.rollingPeriod && errors.rollingPeriod)}
                        helperText={touched.rollingPeriod && errors.rollingPeriod}
                        name="rollingPeriod"
                        type='number'
                        onBlur={handleBlur}
                        onChange={(e) => handleChange(e)}
                        value={ShoolDetails.rollingPeriod}
                        disabled={disableFields}
                        variant="outlined"
                        id="rollingPeriod"
                        size='small'
                      >
                      </TextField>
                    </Grid>

                    <Grid item md={3} xs={8}>
                      <InputLabel shrink id="noOfBatches">
                        No Of Batches *
                      </InputLabel>
                      <TextField
                        fullWidth
                        error={Boolean(touched.noOfBatches && errors.noOfBatches)}
                        helperText={touched.noOfBatches && errors.noOfBatches}
                        name="noOfBatches"
                        type="number"
                        onBlur={handleBlur}
                        onChange={(e) => handleChange(e)}
                        value={ShoolDetails.noOfBatches}
                        disabled={disableFields}
                        variant="outlined"
                        id="noOfBatches"
                        size='small'
                      >
                      </TextField>
                    </Grid>
                  </Grid>

                  <Grid container spacing={3}>

                    <Grid item md={3} xs={8}>
                      <InputLabel shrink id="rollingWeightBy">
                        Rolling Weigh By *
                      </InputLabel>
                      <TextField select
                        fullWidth
                        error={Boolean(touched.rollingWeightBy && errors.rollingWeightBy)}
                        helperText={touched.rollingWeightBy && errors.rollingWeightBy}
                        name="rollingWeightBy"
                        onBlur={handleBlur}
                        onChange={(e) => handleChange(e)}
                        value={ShoolDetails.rollingWeightBy}
                        disabled={disableFields}
                        variant="outlined"
                        id="rollingWeightBy"
                        size='small'
                      >
                        <MenuItem value="0">--Select Rolling Weigh By--</MenuItem>
                        {generateDropDownMenu(employees)}
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
                        { title: 'Weight By', field: 'rollingWeightBy', lookup: { ...employees } },
                        { title: 'Start Date & Time', field: 'rollingStartTime' },
                        { title: 'End Date & Time', field: 'rollingEndDate' }

                      ]}
                      data={rollingData}
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
                      onClick={(event) => trackPromise(saveRolling(event))}
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
