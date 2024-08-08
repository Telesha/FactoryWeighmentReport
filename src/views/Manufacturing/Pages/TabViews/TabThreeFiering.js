import React, { useState, useEffect} from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Button, Card, makeStyles, CardHeader, CardContent, Divider, MenuItem, Grid, InputLabel, TextField } from '@material-ui/core';
import services from '../../Services';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useNavigate, useParams } from 'react-router-dom';
import { useAlert } from "react-alert";
import { trackPromise } from 'react-promise-tracker';
import MaterialTable, { MTableToolbar, MTableBody, MTableHeader } from "material-table";
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
  row: {
    marginTop: '1rem'
  }
}));

export default function Fiering({ manufactureID, groupData, factoryData, firingDhoolData, setFiringDhoolData, enableGrading, disableFields }) {
  const classes = useStyles();
  const [title, setTitle] = useState("Manufacturing Add Edit");
  const [isUpdate, setIsUpdate] = useState(false);
  const [isHide, setIsHide] = useState(true);
  const [ShoolDetails, setShoolDetails] = useState({
    direID: 0,
    startDateTime: "",
    endDateTime: "",
    fieringFinishedDate: "",
    period: '',

    firstDhoolAmount: 0,
    secondDhoolAmount: 0,
    thirdDhoolAmount: 0,
    fourthDhoolAmount: 0,
    dirR: 0,
    bigBulkAmount: 0,
    firedTeaAmount: 0,
    firedDhoolWeightBy: 0
  });

  const [fieringId, setFieringID] = useState();
  const [employees, setEmployees] = useState([]);
  const [direList, setDireList] = useState([]);
  const [successData, setSuccessData] = useState([]);
  const [blFieringAndDhoolID, setBLFieringAndDhoolID] = useState([]);
  const [direDetails, setDireDetails] = useState([
    { direID: 1, direName: "Dire 1" },
    { direID: 2, direName: "Dire 2" },
    { direID: 3, direName: "Dire 3" },
    { direID: 4, direName: "Dire 4" },
  ]);


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
      trackPromise(GetFieringDetailsByBLManufaturingID(decrypted));
    }
  }, []);


  useEffect(() => {
    trackPromise(
      getDiresForDropdown());
  }, []);

  async function getEmployeesForDropdown() {
    const employees = await services.getEmployeesForDropdown(groupData, factoryData);
    setEmployees(employees);
  }

  async function getDiresForDropdown() {
    var direArray = [];
    for (let item of Object.entries(direDetails)) {
      direArray[item[1]["direID"]] = item[1]["direName"]
      setDireList(direArray);
    }

  }

  async function AddShoolDetails() {
    let array = [];
    let DhoolDetails = [...firingDhoolData];
    let direDetail = [...direDetails];

    DhoolDetails.find(x => {
      array = (parseInt(ShoolDetails.direID) === x.direID);
    });


    if (array == false || DhoolDetails.length == 0) {
      let dhoolModel = {
        direID: parseInt(ShoolDetails.direID),
        startDateTime: moment(ShoolDetails.startDateTime).format(),
        endDateTime: moment(ShoolDetails.endDateTime).format(),
        period: parseInt(ShoolDetails.period),
        firedDhoolWeightBy: parseInt(ShoolDetails.firedDhoolWeightBy),

        firstDhoolAmount: parseFloat(ShoolDetails.firstDhoolAmount),
        secondDhoolAmount: parseFloat(ShoolDetails.secondDhoolAmount),
        thirdDhoolAmount: parseFloat(ShoolDetails.thirdDhoolAmount),
        fourthDhoolAmount: parseFloat(ShoolDetails.fourthDhoolAmount),
        dirR: parseFloat(ShoolDetails.dirR),
        bigBulkAmount: parseFloat(ShoolDetails.bigBulkAmount),
        firedTeaAmount: parseFloat(ShoolDetails.firedTeaAmount),
      }
      setFiringDhoolData(firingDhoolData => [...firingDhoolData, dhoolModel]);
    }
    else {
      alert.error("Dire Already Added");
    }
    clearFormFields();
  }

  async function direGenarete() {
    let array = [];
    let DhoolDetails = [...firingDhoolData];
    let direDetail = [...direDetails];

    DhoolDetails.forEach(x => {
      array = direDetail.find(y => y.direID != x.direID)

    });
  }

  async function saveFiering() {
    await timeout(1000);
    if (isUpdate == true) {
      firingDhoolData.forEach(x => {
        x.firstDhoolAmount = parseFloat(x.firstDhoolAmount);
        x.secondDhoolAmount = parseFloat(x.secondDhoolAmount);
        x.thirdDhoolAmount = parseFloat(x.thirdDhoolAmount);
        x.fourthDhoolAmount = parseFloat(x.fourthDhoolAmount);
        x.dirR = parseFloat(x.dirR);
        x.bigBulkAmount = parseFloat(x.bigBulkAmount);
        x.firedTeaAmount = parseFloat(x.firedTeaAmount);
      });
      let response = await services.saveFiering(firingDhoolData, manufactureID);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setFiringDhoolData([])
        getFiringDhoolData();
      }
      else {
        alert.error(response.message);
      }
    } else {
      firingDhoolData.forEach(x => {
        x.firstDhoolAmount = parseFloat(x.firstDhoolAmount);
        x.secondDhoolAmount = parseFloat(x.secondDhoolAmount);
        x.thirdDhoolAmount = parseFloat(x.thirdDhoolAmount);
        x.fourthDhoolAmount = parseFloat(x.fourthDhoolAmount);
        x.dirR = parseFloat(x.dirR);
        x.bigBulkAmount = parseFloat(x.bigBulkAmount);
        x.firedTeaAmount = parseFloat(x.firedTeaAmount);
      });
      let response = await services.saveFiering(firingDhoolData, manufactureID);
      if (response.statusCode == "Success") {
        enableGrading();
        alert.success(response.message);
        setFiringDhoolData([])
        getFiringDhoolData();
        setSuccessData(response.data);

      }
      else {
        alert.error(response.message);
        setSuccessData(response.data);
      }
    }
  }

  async function getFiringDhoolData() {

    let response = await services.GetFieringDetailsByBLManufaturingID(manufactureID);
    setFiringDhoolData(response)
  }

  async function GetFieringDetailsByBLManufaturingID(blManufaturingID) {
    let response = await services.GetFieringDetailsByBLManufaturingID(blManufaturingID);

    setFiringDhoolData(response)
    setBLFieringAndDhoolID(response.blFieringAndDhoolID)
    setTitle("Edit Manufacturing");
    setIsUpdate(true);
    setIsHide(false)
  }

  async function handleClickRemove(oldData) {
    if(isUpdate == true){
      const res = await services.DeleteFieringAndDhools(oldData.blFieringAndDhoolID);
      let decrypted = 0;
      decrypted = atob(blManufaturingID);
      GetFieringDetailsByBLManufaturingID(decrypted);
    }else {
      const res = await services.DeleteFieringAndDhools(oldData.blFieringAndDhoolID);
    }
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
      direID: 0,
      startDateTime: "",
      endDateTime: "",
      fieringFinishedDate: "",
      period: '',
      firedDhoolWeightBy: 0

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
        direID: ShoolDetails.direID,
        startDateTime: ShoolDetails.startDateTime,
        endDateTime: ShoolDetails.endDateTime,
        fieringFinishedDate: ShoolDetails.fieringFinishedDate,
        period: ShoolDetails.period,
        firstDhoolAmount: ShoolDetails.firstDhoolAmount,
        secondDhoolAmount: ShoolDetails.secondDhoolAmount,
        thirdDhoolAmount: ShoolDetails.thirdDhoolAmount,
        fourthDhoolAmount: ShoolDetails.fourthDhoolAmount,
        dirR: ShoolDetails.dirR,
        bigBulkAmount: ShoolDetails.bigBulkAmount,
        firedTeaAmount: ShoolDetails.firedTeaAmount,
        firedDhoolWeightBy: ShoolDetails.firedDhoolWeightBy,
        isActive: ShoolDetails.isActive
      }}
      validationSchema={
        Yup.object().shape({
          direID: Yup.number().required('Dire is required').min("1", 'Dire is required'),
          startDateTime: Yup.string().required('Start Date is required').min("1", 'Start Date is required'),
          endDateTime: Yup.string().required('End Date is required').min("1", 'End Date is required'),
          firedDhoolWeightBy: Yup.number().required('Fired By is required').min("1", 'Fired By is required'),
          period: Yup.number().required('Firing Hours is required').min("1", 'Firing Hours is required')
        })
      }
      onSubmit={(event) => trackPromise(AddShoolDetails(event))}
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
              <CardHeader title={"Firing"} />
              <PerfectScrollbar>
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item md={3} xs={8}>
                      <InputLabel shrink id="direID">
                        Dire *
                      </InputLabel>
                      <TextField select
                        error={Boolean(touched.direID && errors.direID)}
                        fullWidth
                        helperText={touched.direID && errors.direID}
                        name="direID"
                        onBlur={handleBlur}
                        onChange={(e) => handleChange(e)}
                        value={ShoolDetails.direID}
                        disabled={disableFields}
                        variant="outlined"
                        size='small'
                        id="direID"
                      >
                        <MenuItem value="0">--Select Dire--</MenuItem>
                        {generateDropDownMenu(direList)}
                      </TextField>
                    </Grid>

                    <Grid item md={3} xs={8}>
                      <InputLabel shrink id="startDateTime">
                        Start Date & Time *
                      </InputLabel>
                      <TextField
                        fullWidth
                        error={Boolean(touched.startDateTime && errors.startDateTime)}
                        helperText={touched.startDateTime && errors.startDateTime}
                        name="startDateTime"
                        type="datetime-local"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        onBlur={handleBlur}
                        onChange={(e) => handleChange(e)}
                        value={ShoolDetails.startDateTime}
                        disabled={disableFields}
                        variant="outlined"
                        id="startDateTime"
                        size='small'
                      >
                      </TextField>
                    </Grid>

                    <Grid item md={3} xs={8}>
                      <InputLabel shrink id="endDateTime">
                        End Date & Time *
                      </InputLabel>
                      <TextField
                        fullWidth
                        error={Boolean(touched.endDateTime && errors.endDateTime)}
                        helperText={touched.endDateTime && errors.endDateTime}
                        type="datetime-local"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        name="endDateTime"
                        onBlur={handleBlur}
                        onChange={(e) => handleChange(e)}
                        value={ShoolDetails.endDateTime}
                        variant="outlined"
                        disabled={disableFields}
                        id="endDateTime"
                        size='small'
                      >
                      </TextField>
                    </Grid>

                    <Grid item md={3} xs={8}>
                      <InputLabel shrink id="firedDhoolWeightBy">
                        Fired By *
                      </InputLabel>
                      <TextField select
                        fullWidth
                        error={Boolean(touched.firedDhoolWeightBy && errors.firedDhoolWeightBy)}
                        helperText={touched.firedDhoolWeightBy && errors.firedDhoolWeightBy}
                        name="firedDhoolWeightBy"
                        onBlur={handleBlur}
                        onChange={(e) => handleChange(e)}
                        value={ShoolDetails.firedDhoolWeightBy}
                        disabled={disableFields}
                        variant="outlined"
                        id="firedDhoolWeightBy"
                        size='small'
                      >
                        <MenuItem value="0">--Select Fired By--</MenuItem>
                        {generateDropDownMenu(employees)}
                      </TextField>
                    </Grid>

                  </Grid>

                  <Grid container spacing={3}>


                    <Grid item md={3} xs={8}>
                      <InputLabel shrink id="period">
                        Firing Hours *
                      </InputLabel>
                      <TextField
                        error={Boolean(touched.period && errors.period)}
                        fullWidth
                        helperText={touched.period && errors.period}
                        name="period"
                        type='number'
                        onBlur={handleBlur}
                        onChange={(e) => handleChange(e)}
                        disabled={disableFields}
                        value={ShoolDetails.period}
                        variant="outlined"
                        id="period"
                        size='small'
                      >
                      </TextField>
                    </Grid>
                  </Grid>
                  <br />
                  <Divider />


                  <Box display="flex" flexDirection="row-reverse" p={2} >
                    <Button
                      color="primary"
                      variant="contained"
                      type="submit"
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

                        {
                          title: 'Dire',
                          field: 'direID',
                          lookup: {
                            "1": "Dire 1",
                            "2": "Dire 2",
                            "3": "Dire 3",
                            "4": "Dire 4",
                          }, editable: 'never'
                        },
                        { title: '1D', field: 'firstDhoolAmount', editPlaceholder: "1D" },
                        { title: '2D', field: 'secondDhoolAmount', editPlaceholder: "2D" },
                        { title: '3D', field: 'thirdDhoolAmount', editPlaceholder: "3D" },
                        { title: '4D', field: 'fourthDhoolAmount', editPlaceholder: "4D" },
                        { title: 'F/R', field: 'dirR', editPlaceholder: "F/R" },
                        { title: 'BB', field: 'bigBulkAmount', editPlaceholder: "BB" },
                        { title: 'FT', field: 'firedTeaAmount', editPlaceholder: "FT" },

                      ]}
                      data={firingDhoolData}
                      options={{
                        exportButton: false,
                        showTitle: false,
                        headerStyle: { textAlign: "left", height: '1%' },
                        cellStyle: { textAlign: "left" },
                        columnResizable: false,
                        actionsColumnIndex: -1,
                        pageSize: 5,
                        search: false,


                      }}

                      editable={{
                        isEditHidden: () => disableFields,
                        isDeleteHidden: () => disableFields,
                        onRowUpdate: (newData, oldData) =>
                          new Promise((resolve, reject) => {
                            setTimeout(() => {
                              const dataUpdate = [...firingDhoolData];
                              const index = oldData.tableData.id;
                              dataUpdate[index] = newData;
                              setFiringDhoolData([...dataUpdate]);

                              resolve();
                            }, 1000)
                          }),
                        onRowDelete: oldData =>
                          new Promise((resolve, reject) => {
                            setTimeout(() => {

                              const dataDelete = [...firingDhoolData];
                              const index = oldData.tableData.id;
                              dataDelete.splice(index, 1);
                              setFiringDhoolData([...dataDelete]);
                              handleClickRemove(oldData);
                              resolve();
                            }, 1000)
                          }),
                      }}
                    />
                  </Box>
                  <Box display="flex" flexDirection="row-reverse" p={2} >
                    <Button
                      color="primary"
                      variant="contained"
                      disabled={disableFields}
                      onClick={() => saveFiering()}
                      size='small'
                    >
                      Save
                    </Button>
                  </Box>
                </CardContent>
                <br />

              </PerfectScrollbar>
            </Card>
          </Box>
        </form>
      )}
    </Formik>

  )

}
