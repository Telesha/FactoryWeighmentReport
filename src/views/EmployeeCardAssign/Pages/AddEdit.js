import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, Switch, CardHeader, MenuItem, TextareaAutosize
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';

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

const screenCode = 'EMPLOYEECARDASSIGN';
export default function EmployeeCardAssignAddEdit(props) {
  const [title, setTitle] = useState("Card Assign")
  const [isUpdate, setIsUpdate] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const classes = useStyles();
  const [groups, setGroups] = useState()
  const [estates, setEstates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [cards, setCards] = useState([]);

  const [empDetails, setEmpDetails] = useState({
    employeeID: 0,
    groupID: 0,
    estateID: 0,
    divisionID: 0,
    employeeCode: '',
    firstName: '',
    secondName: '',
    lastName: '',
    mobileNumber: '',
    cardID: 0,
    cardNumber: '',
  })

  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/app/employeeCardAssign/listing');
  }
  const alert = useAlert();
  const { empID } = useParams();
  let decrypted = 0;

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  useEffect(() => {
    decrypted = atob(empID.toString());
    if (decrypted != 0) {
      trackPromise(getEmployeeDetailsByEmployeeID(decrypted));
    }
    trackPromise(getPermissions(), getGroupsForDropdown());
  }, []);

  useEffect(() => {
    getEstateDetailsByGroupID();
  }, [empDetails.groupID]);

  useEffect(() => {
    getDivisionDetailsByEstateID();
  }, [empDetails.estateID]);

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  };

  async function getEstateDetailsByGroupID() {
    var response = await services.getEstateDetailsByGroupID(empDetails.groupID);
    setEstates(response);
  };

  async function getDivisionDetailsByEstateID() {
    var response = await services.getDivisionDetailsByEstateID(empDetails.estateID);
    setDivisions(response);
  };

  async function getEmployeeDetailsByEmployeeID(employeeID) {
    let response = await services.getEmployeeDetailsByEmployeeID(employeeID);
    let data = response.data[0];
      setTitle("Card Assign");
    setEmpDetails({
        ...empDetails,
            employeeID: parseInt(atob(empID.toString())),
            groupID: data.groupID,
            estateID: data.operationEntityID,
            divisionID: data.employeeDivisionID,
            employeeCode: data.employeeCode,
            firstName: data.firstName,
            secondName: data.secondName,
            lastName: data.lastName,
            mobileNumber: data.mobileNumber,
    });
    var cardResponse = await services.getCardDetailsByGroupIDEstateIDDivisionID(data.groupID,data.operationEntityID,data.employeeDivisionID);
    if(cardResponse != 0){
      setCards(cardResponse);
    }
    else{
      alert.error('Not Cards For Assign.Please Create Cards');
    }
    
  }
  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITEMPLOYEECARDASSIGN');

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
  }

async function saveEmpCard(){
    let saveModel = {
        employeeID: parseInt(atob(empID.toString())),
        cardID: parseInt(empDetails.cardID),
        createdBy: tokenService.getUserIDFromToken(),
    }
    if(saveModel.cardID == 0){
      alert.error('Please Select Card to Assign');
    }
    else{
    let response = await services.saveEmpCard(saveModel);
    if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/employeeCardAssign/listing');
    }
    else{
      alert.error(response.message);
    }
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

  function handleChange1(e) {
    const target = e.target;
    const value = target.value;
    setEmpDetails({
      ...empDetails,
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
          />
        </Grid>
      </Grid>
    )
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: empDetails.groupID,
              estateID: empDetails.estateID,
              divisionID: empDetails.divisionID,
              employeeCode: empDetails.employeeCode,
              firstName: empDetails.firstName,
              secondName: empDetails.secondName,
              lastName: empDetails.lastName,
              mobileNumber: empDetails.mobileNumber,
              isActive: empDetails.isActive = true,
            }}
            validationSchema={
              Yup.object().shape({
                 groupID: Yup.number().required('Group required').min("1", 'Group required'),
                 estateID: Yup.number().required('Estate required').min("1", 'Estate required'),
                 divisionID: Yup.number().required('Division required').min("1", 'Division required')
              })
            }
            onSubmit={saveEmpCard}
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
              props
            }) => (
              <form onSubmit={handleSubmit}>
                <Box mt={0}>
                  <Card>
                    <CardHeader
                      title={cardTitle(title)}
                    />

                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="groupID">
                              Group *
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="groupID"
                              onBlur={handleBlur}
                              size='small'
                              value={empDetails.groupID}
                              variant="outlined"
                              id="groupID"
                              InputProps={{
                                readOnly: true
                              }}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="estateID">
                              Garden *
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="estateID"
                              onBlur={handleBlur}
                              size='small'
                              value={empDetails.estateID}
                              variant="outlined"
                              id="estateID"
                              InputProps={{
                                readOnly: true
                              }}
                            >
                              <MenuItem value={0}>--Select Garden--</MenuItem>
                              {generateDropDownMenu(estates)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="divisionID">
                              Cost Center *
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="divisionID"
                              size='small'
                              onBlur={handleBlur}
                              value={empDetails.divisionID}
                              variant="outlined"
                              id="divisionID"
                              InputProps={{
                                readOnly: true
                              }}
                            >
                              <MenuItem value={0}>--Select Cost Center--</MenuItem>
                              {generateDropDownMenu(divisions)}
                            </TextField>
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="gangCode">
                            Employee Code
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="employeeCode"
                              onBlur={handleBlur}
                              value={empDetails.employeeCode}
                              size='small'
                              variant="outlined"
                              disabled={isDisableButton}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="gangName">
                            First Name
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="firstName"
                              onBlur={handleBlur}
                              value={empDetails.firstName}
                              size='small'
                              variant="outlined"
                              disabled={isDisableButton}
                            />
                          </Grid> 
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="gangName">
                            Second Name
                              </InputLabel>
                            <TextField
                              fullWidth
                              name="secondName"
                              onBlur={handleBlur}
                              value={empDetails.secondName}
                              size='small'
                              variant="outlined"
                              disabled={isDisableButton}
                            />
                          </Grid> 
                           
                        </Grid>
                        <Grid container spacing={3}>
                        <Grid item md={4} xs={12}>
                            <InputLabel shrink id="lastName">
                            Last Name
                              </InputLabel>
                            <TextField
                              fullWidth
                              name="lastName"
                              onBlur={handleBlur}
                              value={empDetails.lastName}
                              size='small'
                              variant="outlined"
                              disabled={isDisableButton}
                            />
                        </Grid>
                        <Grid item md={4} xs={12}>
                            <InputLabel shrink id="gangName">
                            Mobile Number
                              </InputLabel>
                            <TextField
                              fullWidth
                              name="mobileNumber"
                              onBlur={handleBlur}
                              value={empDetails.mobileNumber}
                              size='small'
                              variant="outlined"
                              disabled={isDisableButton}
                            />
                        </Grid>
                        <Grid item md={4} xs={12}>
                            <InputLabel shrink id="cardID">
                              Card Number 
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="cardID"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={empDetails.cardID}
                              variant="outlined"
                              id="cardID"
                            >
                              <MenuItem value={0}>--Select Card Number--</MenuItem>
                              {generateDropDownMenu(cards)}
                            </TextField>
                          </Grid>
                        </Grid>
                         
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="isActive">
                              Active
                            </InputLabel>
                            <Switch
                              checked={values.isActive}
                              onChange={handleChange}
                              name="isActive"
                              disabled={isDisableButton}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          color="primary"
                          disabled={isSubmitting || isDisableButton}
                          type="submit"
                          size='small'
                          variant="contained"
                        >
                          {"Save"}
                        </Button>
                      </Box>
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
