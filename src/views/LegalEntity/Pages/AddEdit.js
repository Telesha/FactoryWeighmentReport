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
const screenCode = 'LEGALENTITY';
export default function LegalEntityAddEdit(props) {
  const [title, setTitle] = useState("Add Business Division")
  const [isUpdate, setIsUpdate] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const classes = useStyles();
  const [group, setGroup] = useState({
    groupName: '',
    groupCode: '',
    shortCode: '',
    isActive: true,
    masterGroupID: 0
  });
  const [groups, setGroups] = useState([]);
  const [groupIsActive, setGroupIsActive] = useState(true);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: true,
  });
  const navigate = useNavigate();
  const handleClick = () => {

    navigate('/app/legalEntity/listing');

  }
  const alert = useAlert();
  const { groupID } = useParams();
  let decrypted = 0;

  useEffect(() => {
    getPermission();
    getGroupsForDropdown()
  }, []);

  useEffect(() => {
    decrypted = atob(groupID.toString());
    if (decrypted != 0) {
      trackPromise(
        getGroupDetails(decrypted),
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
  async function getGroupDetails(groupID) {
    let response = await services.getLegalEntityDetailsByID(groupID);
    let data = response[0];
    setTitle("Update Business Division");
    setGroup((prevState) => ({
      ...prevState,
      groupName: data.groupName,
      groupCode: data.groupCode,
      shortCode: data.shortCode == null ? '' : data.shortCode,
      isActive: data.isActive,
      masterGroupID: data.masterGroupID
    }));
    setIsUpdate(true);
    setGroupIsActive(response[0]);
  }

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITLEGALENTITY');

    if (isAuthorized === undefined) {
      navigate('/404');
    }
  }
  async function saveGroup(values) {
    if (isUpdate == true) {

      let updateModel = {
        groupID: atob(groupID.toString()),
        groupCode: values.groupCode,
        groupName: values.groupName,
        shortCode: values.shortCode,
        isActive: values.isActive,
      }

      let response = await services.updateLegalEntity(updateModel);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/legalEntity/listing');
      }
      else {
        alert.error(response.message);
      }
    } else {
      let response = await services.saveLegalEntity(values);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/legalEntity/listing');
      }
      else {
        alert.error(response.message);
      }
    }
  }
  function handleChange1(e) {
    const target = e.target;
    const value = target.value
    setGroup({
      ...group,
      [e.target.name]: value
    });
  }
  async function getGroupsForDropdown() {
    const groups = await services.getMasterGroupsForDropdown();
    setGroups(groups);
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
              groupName: group.groupName,
              groupCode: group.groupCode,
              shortCode: group.shortCode,
              isActive: group.isActive,
              masterGroupID: group.masterGroupID
            }}
            validationSchema={
              Yup.object().shape({
                groupName: Yup.string().max(255, 'Business Division Name must be at least 255 characters').required('Business Division Name is required')
                  .matches(/^(?!\s)/, 'Only alphabets and special characters are allowed'),
                groupCode: Yup.string().max(255).required('Business Division Code is required').matches(/^[0-9\b]+$/, 'Only allow numbers')
                  .min(2, 'Business Division Code must be at least 2 characters').max(2, 'Business Division Code must be at most 2 characters'),
                shortCode: Yup.string().required('Short Code is required').matches(/^[A-Z0-9]+$/, 'Numbers And Uppercase Letters Only').max(5, 'Short Code must be at most 5 characters'),
                masterGroupID: Yup.number().required('Company is required').positive('Please select a company'),
              })
            }
            onSubmit={saveGroup}
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
                            <InputLabel shrink id="masterGroupID">
                              Company *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.masterGroupID && errors.masterGroupID)}
                              fullWidth
                              helperText={touched.masterGroupID && errors.masterGroupID}
                              size='small'
                              name="masterGroupID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={group.masterGroupID}
                              variant="outlined"
                              id="masterGroupID"
                              InputProps={{
                                readOnly: isUpdate ? true : false,
                              }}
                            >
                              <MenuItem value="0">--Select Company--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="groupCode">
                              Business Division Code *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.groupCode && errors.groupCode)}
                              fullWidth
                              helperText={touched.groupCode && errors.groupCode}
                              name="groupCode"
                              size='small'
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={values.groupCode}
                              variant="outlined"
                              disabled={isDisableButton}
                              InputProps={{
                                readOnly: isUpdate ? true : false,
                              }}
                            />
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="shortCode">
                              Short Code *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.shortCode && errors.shortCode)}
                              fullWidth
                              helperText={touched.shortCode && errors.shortCode}
                              name="shortCode"
                              size='small'
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={values.shortCode}
                              variant="outlined"
                              disabled={isDisableButton}
                            />
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="groupName">
                              Business Division Name *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.groupName && errors.groupName)}
                              fullWidth
                              helperText={touched.groupName && errors.groupName}
                              name="groupName"
                              size='small'
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={values.groupName}
                              variant="outlined"
                              disabled={isDisableButton}
                            />
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
