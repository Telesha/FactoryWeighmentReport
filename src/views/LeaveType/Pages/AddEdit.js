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
  Switch,
  CardHeader,
  MenuItem,
  FormControl
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
const screenCode = 'LEAVETYPE';

export default function LeaveTypeAddEdit(props) {
  const [title, setTitle] = useState("Add Leave Type")
  const [isUpdate, setIsUpdate] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const classes = useStyles();
  const [groups, setGroups] = useState([]);
  const [employeeVerified, setEmployeeVerified] = useState(false);
  const [leaveTypeIsActive, setLeaveTypeIsActive] = useState(true);
  const [leaveTypeDataList, setLeaveTypeDataList] = useState({
    groupID: 0,
    shortForm: '',
    elaboration: '',
    eligible: '',
    condition: '',
    isPaymentPerson: false,
    wages: 0,
    isActive: true,
  })
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: true,
  });
  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/app/leaveType/listing');
  }
  const alert = useAlert();
  const { leaveTypeConfigurationID } = useParams();
  let decrypted = 0;

  useEffect(() => {
    getPermissions();
    getGroupsForDropdown()
  }, []);

  useEffect(() => {
    decrypted = atob(leaveTypeConfigurationID.toString());
    if (decrypted != 0) {
      trackPromise(
        getLeaveTypeDetailsByID(decrypted),
      )
    }
  }, []);

  function generateDropDownMenu(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
      }
    }
    return items
  }

  async function getLeaveTypeDetailsByID(leaveTypeConfigurationID) {
    let response = await services.getLeaveTypeDetailsByID(leaveTypeConfigurationID);
    let data = response[0];
    setTitle("Update Leave Types");
    setLeaveTypeDataList((prevState) => ({
      ...prevState,
      groupID: data.groupID,
      shortForm: data.shortForm,
      elaboration: data.elaboration,
      eligible: data.eligible,
      condition: data.condition,
      isPaymentPerson: data.wages > 0,
      wages: data.wages,
      isActive: data.isActive,
    }));
    setIsUpdate(true);
    setLeaveTypeIsActive(response[0]);
  }

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITLEAVETYPE');
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');

    if (isAuthorized === undefined) {
      navigate('/404');
    }

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined
    });

    setLeaveTypeDataList({
      ...leaveTypeDataList,
      groupID: parseInt(tokenService.getGroupIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function saveLeaveTypeDetails(values) {
    if (isUpdate == true) {
      let updateModel = {
        leaveTypeConfigurationID: atob(leaveTypeConfigurationID.toString()),
        shortForm: values.shortForm,
        elaboration: values.elaboration,
        eligible: values.eligible,
        condition: values.condition,
        isPaymentPerson: values.isPaymentPerson,
        wages: values.wages,
        isActive: values.isActive,
      }
      let response = await services.UpdateLeaveTypeDetails(updateModel);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/leaveType/listing');
      }
      else {
        alert.error(response.message);
      }
    } else {
      let response = await services.saveLeaveTypeDetails(values);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/leaveType/listing');
      }
      else {
        alert.error(response.message);
      }
    }
  }

  function handleChangeData(e) {
    const { name, value } = e.target;
    setLeaveTypeDataList(prevState => ({
      ...prevState,
      [name]: value
    }));
  }

  function isPaymentPersonHandleChange(e) {
    const target = e.target;
    const isPaymentPerson = target.checked;
    setLeaveTypeDataList(prevState => ({
      ...prevState,
      isPaymentPerson: isPaymentPerson,
      wages: isPaymentPerson ? prevState.wages : 0
    }));
  };

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
              groupID: leaveTypeDataList.groupID,
              shortForm: leaveTypeDataList.shortForm,
              elaboration: leaveTypeDataList.elaboration,
              eligible: leaveTypeDataList.eligible,
              condition: leaveTypeDataList.condition,
              isPaymentPerson: leaveTypeDataList.isPaymentPerson,
              wages: leaveTypeDataList.isPaymentPerson ? leaveTypeDataList.wages : 0,
              isActive: leaveTypeDataList.isActive,
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Business Division is required').positive('Please select a company'),
                shortForm: Yup.string()
                  .required('Short Form is required')
                  .matches(/^[A-Z]+$/, "Only uppercase letters are allowed"),
                elaboration: Yup.string().required('Elaboration is required'),
                eligible: Yup.string().required('Eligibility field is required'),
                condition: Yup.string().required('Condition is required'),

              })
            }
            onSubmit={saveLeaveTypeDetails}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleChange,
              handleSubmit,
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
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="groupID">
                              Business Division *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              size='small'
                              name="groupID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeData(e)}
                              value={leaveTypeDataList.groupID}
                              variant="outlined"
                              id="groupID"
                              InputProps={{
                                readOnly: isUpdate || !permissionList.isGroupFilterEnabled ? true : false
                              }}
                            >
                              <MenuItem value="0">--Select Business Division--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="shortForm">
                              Short Form *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.shortForm && errors.shortForm)}
                              fullWidth
                              helperText={touched.shortForm && errors.shortForm}
                              name="shortForm"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeData(e)}
                              value={leaveTypeDataList.shortForm}
                              variant="outlined"
                              id="shortForm"
                              InputProps={{
                                readOnly: isUpdate ? true : false,
                              }}
                              disabled={isDisableButton}
                            />
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="elaboration">
                              Elaboration *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.elaboration && errors.elaboration)}
                              fullWidth
                              helperText={touched.elaboration && errors.elaboration}
                              name="elaboration"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeData(e)}
                              value={leaveTypeDataList.elaboration}
                              variant="outlined"
                              disabled={isDisableButton}
                            />
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="eligible">
                              Eligible *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.eligible && errors.eligible)}
                              fullWidth
                              helperText={touched.eligible && errors.eligible}
                              name="eligible"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeData(e)}
                              value={leaveTypeDataList.eligible}
                              variant="outlined"
                              disabled={isDisableButton}
                            />
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="condition">
                              Condition *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.condition && errors.condition)}
                              fullWidth
                              helperText={touched.condition && errors.condition}
                              name="condition"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeData(e)}
                              value={leaveTypeDataList.condition}
                              variant="outlined"
                              disabled={isDisableButton}
                            />
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="isPaymentPerson">
                              Is Payment
                            </InputLabel>
                            <Switch
                              checked={leaveTypeDataList.isPaymentPerson}
                              onChange={isPaymentPersonHandleChange}
                              name="isPaymentPerson"
                              value={leaveTypeDataList.isPaymentPerson}
                              disabled={isDisableButton}
                            />
                          </Grid>
                          <Grid item md={3} xs={12}>
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
                        <Grid container spacing={3}>
                          {leaveTypeDataList.isPaymentPerson && (
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="wages">
                                Wages
                              </InputLabel>
                              <TextField
                                fullWidth
                                name="wages"
                                size='small'
                                onBlur={handleBlur}
                                onChange={handleChangeData}
                                value={leaveTypeDataList.wages}
                                disabled={isDisableButton}
                                variant="outlined"
                                id="wages"
                              />
                            </Grid>
                          )}
                        </Grid>
                      </CardContent>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          color="primary"
                          disabled={isSubmitting || isDisableButton}
                          type="submit"
                          variant="contained"
                        >
                          {isUpdate == true ? "Update" : "Save"}
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
