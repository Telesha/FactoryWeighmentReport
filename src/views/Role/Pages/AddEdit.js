import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button,
  CardContent, Divider, InputLabel, Switch, CardHeader, MenuItem
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import tokenDecoder from '../../../utils/tokenDecoder';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import permissionService from "../../../utils/permissionAuth";
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

const screenCode = 'ROLE';
export default function RoleAddEdit(props) {
  const [title, setTitle] = useState("Add Role")
  const [isUpdate, setIsUpdate] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const classes = useStyles();
  const [groups, setGroups] = useState()
  const [factories, setFactories] = useState()
  const [roleLevels, setRoleLevels] = useState()
  const [initialState, setInitialState] = useState(false);
  const [role, setRole] = useState({
    groupID: 0,
    factoryID: 0,
    roleLevelID: 0,
    roleName: '',
    isActive: true
  });

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });

  const navigate = useNavigate();
  const handleClick = () => {

    navigate('/app/roles/listing');

  }
  const alert = useAlert();
  const { roleID } = useParams();
  let decrypted = 0;

  useEffect(() => {
    getPermissions();
  }, []);

  useEffect(() => {
    decrypted = atob(roleID.toString());
    if (decrypted != 0) {
      trackPromise(
        getRoleDetails(decrypted)
      )
    }
  }, []);

  useEffect(() => {
    if (!initialState) {
      trackPromise(getPermissions());
    }
  }, []);

  useEffect(() => {
    trackPromise(
      getGroupsForDropdown()
    );
  }, []);

  useEffect(() => {
    if (initialState) {
      setRole((prevState) => ({
        ...prevState,
        factoryID: 0,
      }));
    }
  }, [role.groupID, initialState]);

  useEffect(() => {
    getFactoriesForDropdown()
  }, [role.groupID]);

  useEffect(() => {
    trackPromise(
      getRoleLevelsForDropdown()
    );
  }, []);

  async function getPermissions() {
    var permissions = await permissionService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITROLE');

    if (isAuthorized === undefined) {
      navigate('/app/unauthorized');
    }

    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
    });

    setRole({
      ...role,
      isActive: true,
      groupID: parseInt(tokenDecoder.getGroupIDFromToken()),
      factoryID: parseInt(tokenDecoder.getFactoryIDFromToken())
    })

    trackPromise(getGroupsForDropdown());
    setInitialState(true);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getAllFactoriesByGroupID(role.groupID);
    setFactories(factories);
  }

  async function getRoleLevelsForDropdown() {
    const response = tokenDecoder.getRoleLevelFromToken();
    const roleLevels = await services.getRoleLevelsByToken(response);
    setRoleLevels(roleLevels);
  }

  async function getRoleDetails(roleID) {
    let response = await services.getRoleDetailsByID(roleID);
    let data = response[0];
    setTitle("Update Role");
    setRole(data);
    setIsUpdate(true);
  }

  async function saveRole(values) {
    if (isUpdate == true) {

      let updateModel = {
        roleID: atob(roleID.toString()),
        groupID: parseInt(values.groupID),
        factoryID: parseInt(values.factoryID),
        roleLevelID: parseInt(values.roleLevelID),
        roleName: values.roleName,
        isActive: values.isActive,
      }

      let response = await services.updateRole(updateModel);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/roles/listing');
      }
      else {
        alert.error(response.message);
      }
    } else {
      let response = await services.saveRole(values);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/roles/listing');
      }
      else {
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
    const value = target.value
    setRole({
      ...role,
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
              groupID: role.groupID,
              factoryID: role.factoryID,
              roleLevelID: role.roleLevelID,
              roleName: role.roleName,
              isActive: role.isActive,

            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Legal Entity is required').min("1", 'Legal Entity is required'),
                factoryID: Yup.number().required('Garden is required').min("1", 'Garden is required'),
                roleLevelID: Yup.number().required('Role Level is required').min("1", 'Role Level is required'),
                roleName: Yup.string().max(255).required('Role Name is required')
              })
            }
            onSubmit={saveRole}
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
                              Business Division *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              size='small'
                              name="groupID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={role.groupID}
                              variant="outlined"
                              id="groupID"
                              InputProps={{
                                readOnly: isUpdate ? true : !permissionList.isGroupFilterEnabled ? true : false
                              }}
                            >
                              <MenuItem value="0">--Select Business Division--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="factoryID">
                              Location *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.factoryID && errors.factoryID)}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              size='small'
                              name="factoryID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={role.factoryID}
                              variant="outlined"
                              id="factoryID"
                              InputProps={{
                                readOnly: isUpdate ? true : !permissionList.isFactoryFilterEnabled ? true : false
                              }}
                            >
                              <MenuItem value="0">--Select Location--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="roleLevelID">
                              Role Level *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.roleLevelID && errors.roleLevelID)}
                              fullWidth
                              helperText={touched.roleLevelID && errors.roleLevelID}
                              size='small'
                              name="roleLevelID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={role.roleLevelID}
                              variant="outlined"
                              id="roleLevelID"
                            >
                              <MenuItem value="0">--Select Role Level--</MenuItem>
                              {generateDropDownMenu(roleLevels)}
                            </TextField>
                          </Grid>
                        </Grid>

                        <Grid container spacing={3}>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="roleName">
                              Role Name *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.roleName && errors.roleName)}
                              fullWidth
                              helperText={touched.roleName && errors.roleName}
                              size='small'
                              name="roleName"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={role.roleName}
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
                          size='small'
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
