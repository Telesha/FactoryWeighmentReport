import React, { useState, useEffect, } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Button, Card, makeStyles, CardHeader, CardContent, Divider, MenuItem, Grid, InputLabel, TextField } from '@material-ui/core';
import services from '../../Services';
import { Formik  } from 'formik';
import * as Yup from "yup";
import { useNavigate , useParams} from 'react-router-dom';
import { useAlert } from "react-alert";
import { trackPromise } from 'react-promise-tracker';
import MaterialTable from "material-table";
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

export default function LossExess({ manufactureID,groupData,factoryData, manufactureNumber, GradeDetaislList, setGradeDetaislList, isComplete, disableFields ,
  isCompleteDisabled,setIsCompleteDisabled}) {
  const classes = useStyles();
  const [title, setTitle] = useState("Manufacturing Add Edit");
  const [isUpdate, setIsUpdate] = useState(false);
  const [dialogbox, setDialogbox] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [counter, setCounter] = useState(1);
  const incrementCounter = () => {
    setCounter(counter + 1);
  };
  const [isHide, setIsHide] = useState(true);
  const [ShoolDetails, setShoolDetails] = useState({
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
  
  const [grades, setGrades] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [gradeLookUp, setGradeLookUp] = useState([]);
  const [GroupList, setGroupList] = useState([]);
  const [lastEle, setLastEle] = useState([])
  const [successData, setSuccessData] = useState([]);
  const [lastMCodeByOrder, setLastMCodeByOrder] = useState([])
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const [FactoryList, setFactoryList] = useState([]);
  const [manucatureCode, setManucatureCode] = useState([]);
  const [GradingDetails, setGradingDetails] = useState({
    gradeID: 0,
    gradeAmount: '',
    gradeBy: 0,
    gradeSequence: ''
  });
  
  
  
  const navigate = useNavigate();
  const alert = useAlert();
  const { blManufaturingID } = useParams();
  let decrypted = 0;

  let encrypted = "";

  useEffect(() => {
    trackPromise(
      getEmployeesForDropdown(),
      getGradesForDropdown(),
     );
  }, [groupData,factoryData]);

  useEffect(() => {
    trackPromise(
      gradeSequence());
  }, [GradingDetails.gradeID]);

  useEffect(() => {
    decrypted = atob(blManufaturingID);
    if (decrypted != 0) {
      trackPromise(GetGradingDetailsByBLManufaturingID(decrypted));
    }
  }, []);



  async function getGradesForDropdown() {
    const grades = await services.getGradesByGroupIDAndFactoryID(groupData,factoryData);
    setGrades(grades);
    var obj = grades.reduce(function(acc, cur, i) {
      acc[cur.gradeID] = cur.gradeName;
      return acc;
      }, {});
      setGradeLookUp(obj)
}

async function getEmployeesForDropdown() {
  const employees = await services.getEmployeesForDropdown(groupData,factoryData);
  setEmployees(employees);
}


  function AddGradeDetails() {
   
    let model = {
      gradeID: parseInt(GradingDetails.gradeID),
      gradeAmount: parseFloat(GradingDetails.gradeAmount),
      gradeBy: parseInt(GradingDetails.gradeBy),
      gradeSequence: GradingDetails.gradeSequence
    }
    setGradeDetaislList(GradeDetaislList => [...GradeDetaislList, model]);
    gradeSequence();
    incrementCounter();
    clearFormFields(); 

  }

  async function handleClickRemove(data) {

    setTableData(data)
    setDialogbox(true);
    
  }

  async function GetGradingDetailsByBLManufaturingID(blManufaturingID) {
    let response = await services.GetGradingDetailsByBLManufaturingID(blManufaturingID);


    const mCode = response[0].manufactureNumber
    storeLastElement(response[0].gradeSequence);
    setGradeDetaislList(response.reverse());
    setManucatureCode(mCode)
    setTitle("Edit Manufacturing");
    setIsUpdate(true);
    setIsHide(false);
    setIsCompleteDisabled(false)
  }

  async function storeLastElement(id) {

    const lastElement = id.split('_')[2];
    setLastEle(Number(lastElement))
  }

  async function confirmData() {
    
    if(isUpdate == true){

      let decrypted = 0;
        decrypted = atob(blManufaturingID);
        GetGradingDetailsByBLManufaturingID(decrypted)
      const res = await services.DeleteGrading(tableData.gradingID);
      
      if(res == 1) {
        setGradeDetaislList(GradeDetaislList.splice(tableData.tableData.id))
        let decrypted = 0;
        decrypted = atob(blManufaturingID);
        GetGradingDetailsByBLManufaturingID(decrypted)
        alert.success('Item deleted successfully');
      }else {

        const dataDelete = [...GradeDetaislList];
        const index = tableData.tableData.id;
        dataDelete.splice(index, 1);
        setGradeDetaislList([...dataDelete]);

        setDialogbox(false);
      }

      setDialogbox(false);

    }else{

      if (tableData.gradingID != undefined) {
        
        const res = await services.DeleteGrading(tableData.gradingID);

        if(res == 1) {

          const dataDelete = [...GradeDetaislList];
        const index = tableData.tableData.id;
        dataDelete.splice(index, 1);
        setGradeDetaislList([...dataDelete]);
        }

        alert.success('Item deleted successfully');
      } else {
        const dataDelete = [...GradeDetaislList];
        const index = tableData.tableData.id;
        dataDelete.splice(index, 1);
        setGradeDetaislList([...dataDelete]);

        setDialogbox(false);
      }

    }
    
  }

  async function cancelData() {
    if(isUpdate == true){

      let decrypted = 0;
      decrypted = atob(blManufaturingID);
      GetGradingDetailsByBLManufaturingID(decrypted)
      setDialogbox(false);

    }else{

      setDialogbox(false);

    }
    
  }

  async function gradeSequence() {
   
    if(isUpdate == true){
      
      const gradeCode = grades.find(x => x.gradeID === GradingDetails.gradeID)

      const gradeSequence = manucatureCode.concat("_").concat(gradeCode.gradeCode).concat("_").concat(lastEle + counter)
      
      setGradingDetails({
        ...GradingDetails,
        gradeSequence: gradeSequence
      });
    }else{
      const gradeCode = grades.find(x => x.gradeID === GradingDetails.gradeID)
      const gradeName = grades.find(x => x.gradeID === GradingDetails.gradeID)
  
      const gradeSequence = manufactureNumber.concat("_").concat(gradeCode.gradeCode).concat("_").concat(counter)
      
      setGradingDetails({
        ...GradingDetails,
        gradeSequence: gradeSequence
      });
    }
    
    
  }

  async function saveGrading() {

    if (isUpdate == true) {

      let response = await services.saveGrading(GradeDetaislList, manufactureID);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setGradeDetaislList([])
        getGradingData();
      }
      else {
        alert.error(response.message);
      }
     }else{
      let response = await services.saveGrading(GradeDetaislList, manufactureID);
      if (response.statusCode == "Success") {
        setIsCompleteDisabled(false)
        alert.success(response.message);
        setGradeDetaislList([])
        getGradingData();
        setSuccessData(response.data);
      }
      else {
        alert.error(response.message);
        setSuccessData(response.data);
      }
     }
  }

  async function getGradingData() {

    let response = await services.GetGradingDetailsByBLManufaturingID(manufactureID);
    setGradeDetaislList(response.reverse());
  }

  async function CompleteManufacture() {
    await timeout(1000);
    let response = await services.CompleteManufacture(manufactureID);
    if (response.statusCode == "Success") {
      isComplete();
      alert.success(response.message);
      navigate('/app/manufacturing/listing')
    }
    else {
      alert.error(response.message);
    }
  }

 

  
  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setGradingDetails({
      ...GradingDetails,
      [e.target.name]: value
    });
  }

  function handleChangeGrade(e) {
    const target = e.target;
    const value = target.value
    setGradingDetails({
      ...GradingDetails,
      [e.target.name]: value
    });
    
  }

  function timeout(delay) {

    return new Promise(res => setTimeout(res, delay));

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

  function generateGradeDropDownMenu(data) {
    let items = []
    if (data != null) {
      grades.forEach(x => {
        items.push(<MenuItem key={x.gradeID} value={x.gradeID}>{x.gradeName}</MenuItem>)
      });
    }
    return items
  }

  async function clearFormFields() {
    setGradingDetails({
        ...GradingDetails,
        gradeID: 0,
        gradeAmount: '',
        gradeBy: 0.,
        gradeSequence: '',
        
    });
}

  return (
    <Formik
      initialValues={{
         gradeID: GradingDetails.gradeID,
         gradeAmount: GradingDetails.gradeAmount,
         gradeBy: GradingDetails.gradeBy,
         gradeSequence: GradingDetails.gradeSequence
      }}
      validationSchema={
        Yup.object().shape({
          gradeID: Yup.number().required('Grade is required').min("1", 'Grade is required'),
          gradeAmount: Yup.number().required('Grade Amount is required').min("1", 'Grade Amount is required'),
          gradeBy: Yup.number().required('Grade By is required').min("1", 'Grade By is required'),
          gradeSequence: Yup.string().required('Grade Sequence is required').min("1", 'Grade Sequence is required'),
        })
      }

      enableReinitialize
      onSubmit={(event) => (AddGradeDetails(event))}
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
              <CardHeader title={"Grading"} />
              <PerfectScrollbar>
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item md={4} xs={12}>
                      <InputLabel shrink id="gradeID">
                        Grade *
                      </InputLabel>
                      <TextField
                        select
                        fullWidth
                        error={Boolean(touched.gradeID && errors.gradeID)}
                        helperText={touched.gradeID && errors.gradeID}
                        name="gradeID"
                        onChange={(e) => handleChangeGrade(e)}
                        value={GradingDetails.gradeID}
                        disabled={disableFields}
                        variant="outlined"
                        size='small'
                        id="gradeID"
                      >
                        <MenuItem value="0">--Select Grade--</MenuItem>
                        {generateGradeDropDownMenu(grades)}
                      </TextField>
                    </Grid>
                    <Grid item md={4} xs={8}>
                      <InputLabel shrink id="gradeAmount">
                        Amount (KG) *
                      </InputLabel>
                      <TextField
                        error={Boolean(touched.gradeAmount && errors.gradeAmount)}
                        fullWidth
                        helperText={touched.gradeAmount && errors.gradeAmount}
                        name="gradeAmount"
                        type='number'
                        onBlur={handleBlur}
                        onChange={(e) => handleChange(e)}
                        value={GradingDetails.gradeAmount}
                        disabled={disableFields}
                        size='small'
                        variant="outlined"
                        id="gradeAmount"
                      >
                      </TextField>
                    </Grid>

                    <Grid item md={3} xs={8}>
                      <InputLabel shrink id="gradeBy">
                        Grade By *
                      </InputLabel>
                      <TextField select
                        fullWidth
                        error={Boolean(touched.gradeBy && errors.gradeBy)}
                        helperText={touched.gradeBy && errors.gradeBy}
                        name="gradeBy"
                        onBlur={handleBlur}
                        onChange={(e) => handleChange(e)}
                        value={GradingDetails.gradeBy}
                        disabled={disableFields}
                        size='small'
                        variant="outlined"
                        id="gradeBy"
                      >
                        <MenuItem value="0">--Select Gradeing By--</MenuItem>
                        {generateDropDownMenu(employees)}
                      </TextField>
                    </Grid>

                    <Grid item md={4} xs={8}>
                      <InputLabel shrink id="gradeSequence">
                        Grade Sequence *
                      </InputLabel>
                      <TextField
                        error={Boolean(touched.gradeSequence && errors.gradeSequence)}
                        fullWidth
                        helperText={touched.gradeSequence && errors.gradeSequence}
                        name="gradeSequence"
                        onBlur={handleBlur}
                        onChange={(e) => handleChange(e)}
                        value={GradingDetails.gradeSequence}
                        disabled={disableFields}
                        variant="outlined"
                        size='small'
                        id="gradeSequence"
                        InputProps={{
                          readOnly: true
                        }}
                      >
                      </TextField>
                    </Grid>

                  </Grid>

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
                          title: 'Grade',
                          field: 'gradeID', 
                          lookup: {...gradeLookUp}
                        },
                        { title: 'Amount (KG)', field: 'gradeAmount' },
                        { title: 'Grade By', field: 'gradeBy', lookup: {...employees} },
                        { title: 'Grade Sequence', field: 'gradeSequence'}

                      ]}
                      data={GradeDetaislList}
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
                      onClick={() => saveGrading()}
                      size='small'
                    >
                      Save
                    </Button>
                  </Box>

                  <Box display="flex" flexDirection="row-reverse" p={2} >
                    <Button
                      color="primary"
                      variant="contained"
                      disabled={isCompleteDisabled || disableFields}
                      onClick={(event) => trackPromise(CompleteManufacture(event))}
                      size='small'
                    >
                      Complete
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
