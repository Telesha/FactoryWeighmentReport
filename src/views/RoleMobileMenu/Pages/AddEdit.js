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

const screenCode = 'ROLEMOBILEMENU';
export default function RoleMobileMenuAddEdit(props) {
  const [title, setTitle] = useState("Role Mobile Menu Add")
  const [isUpdate, setIsUpdate] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const classes = useStyles();
  const [groups, setGroups] = useState()
  const [estates, setEstates] = useState([]);
  const [roles, setRoles] = useState([]);
  const [mobileMenus, setMobileMenus] = useState([]);
  const [verificationtypes, setVerificationtypes] = useState([]);
  const [roleMobileMenu, setRoleMobileMenu] = useState({
    roleMobileMenuID: 0,
    groupID: 0,
    estateID: 0,
    roleID: 0,
    mobileMenuID: 0,
    fverificationTypeID: 0,
    SndverificationTypeID: 0,
    isActive: true,
    isDigitalScaleEnabled: true,
    isCollectiontagEnabled: true
  });

  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/app/roleMobileMenu/listing');
  }
  const alert = useAlert();
  const { roleMobileMenuID } = useParams();
  let decrypted = 0;

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  useEffect(() => {
    decrypted = atob(roleMobileMenuID.toString());
    if (decrypted != 0) {
      setIsUpdate(true);
      trackPromise(getReloMobileMenuDetailsByRoleMobileMenuID(decrypted));
    }
    trackPromise(getPermissions(), getGroupsForDropdown());
  }, []);

  useEffect(() => {
    getAllVerificationtypes();
  }, []);

  useEffect(() => {
    if (roleMobileMenu.groupID !== 0) {
      getEstateDetailsByGroupID();
    }
  }, [roleMobileMenu.groupID]);

  useEffect(() => {
    getRoleDetailsByGroupFactory();
  }, [roleMobileMenu.estateID]);

  useEffect(() => {
    if (roleMobileMenu.roleID !== 0) {
      getAllMobileMenus();
    }
  }, [roleMobileMenu.roleID, isUpdate]);

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  };

  async function getEstateDetailsByGroupID() {
    var response = await services.getEstateDetailsByGroupID(roleMobileMenu.groupID);
    setEstates(response);
  };

  async function getRoleDetailsByGroupFactory() {
    if (roleMobileMenu.groupID !== 0 && roleMobileMenu.estateID !== 0) {
      var response = await services.getRoleDetailsByGroupFactory(roleMobileMenu.groupID, roleMobileMenu.estateID);
      setRoles(response);
    }
  };

  async function getAllMobileMenus() {
    var response = await services.getAllMobileMenus(roleMobileMenu.groupID, roleMobileMenu.estateID, roleMobileMenu.roleID, isUpdate);
    setMobileMenus(response);
  };

  async function getAllVerificationtypes() {
    var response = await services.getAllVerificationtypes();
    setVerificationtypes(response);
  };

  async function getReloMobileMenuDetailsByRoleMobileMenuID(roleMobileMenuID) {
    let response = await services.getReloMobileMenuDetailsByRoleMobileMenuID(roleMobileMenuID);
    setTitle("Role Mobile Menu Edit");
    setRoleMobileMenu({
      ...roleMobileMenu,
      groupID: response.groupID,
      estateID: response.estateID,
      roleID: response.roleID,
      mobileMenuID: response.mobileMenuID,
      fverificationTypeID: response.fverificationTypeID,
      SndverificationTypeID: response.sndverificationTypeID,
      isActive: response.isActive,
      isDigitalScaleEnabled: response.isDigitalScaleEnabled,
      isCollectiontagEnabled: response.isCollectiontagEnabled
    });
  }

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITROLEMOBILEMENU');

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

    if (decrypted == 0) {
      setRoleMobileMenu({
        ...roleMobileMenu,
        groupID: parseInt(tokenService.getGroupIDFromToken()),
        estateID: parseInt(tokenService.getFactoryIDFromToken()),
      })
    }
  }
 
  async function saveRoleMobileMenu(values) {
    if (isUpdate == true) {
      let updateModel = {
        RoleMobileMenuID: parseInt(atob(roleMobileMenuID.toString())),
        groupID: parseInt(values.groupID),
        estateID: parseInt(values.estateID),
        roleID: parseInt(roleMobileMenu.roleID),
        mobileMenuID: parseInt(roleMobileMenu.mobileMenuID),
        fverificationTypeID: parseInt(roleMobileMenu.fverificationTypeID),
        sndverificationTypeID: parseInt(roleMobileMenu.SndverificationTypeID),
        isActive: values.isActive,
        isCollectiontagEnabled: values.isCollectiontagEnabled,
        isDigitalScaleEnabled: values.isDigitalScaleEnabled,
        modifiedBy: parseInt(tokenService.getUserIDFromToken())
      }

      let response = await services.updateRoleMobileMenu(updateModel);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/roleMobileMenu/listing');
      }
      else {
        alert.error(response.message);
      }
    } else {
      let saveModel = {
        roleMobileMenuID: 0,
        groupID: parseInt(values.groupID),
        estateID: parseInt(roleMobileMenu.estateID),
        roleID: parseInt(roleMobileMenu.roleID),
        mobileMenuID: parseInt(roleMobileMenu.mobileMenuID),
        fverificationTypeID: parseInt(roleMobileMenu.fverificationTypeID),
        sndverificationTypeID: parseInt(roleMobileMenu.SndverificationTypeID),
        isActive: roleMobileMenu.isActive,
        isCollectiontagEnabled: values.isCollectiontagEnabled,
        isDigitalScaleEnabled: values.isDigitalScaleEnabled,
        createdBy: tokenService.getUserIDFromToken(),
      }

      let response = await services.saveRoleMobileMenu(saveModel);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/roleMobileMenu/listing');
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
    const value = target.value;
    setRoleMobileMenu({
      ...roleMobileMenu,
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
              groupID: roleMobileMenu.groupID,
              estateID: roleMobileMenu.estateID,
              roleID: roleMobileMenu.roleID,
              mobileMenuID: roleMobileMenu.mobileMenuID,
              fverificationTypeID: roleMobileMenu.fverificationTypeID,
              SndverificationTypeID: roleMobileMenu.SndverificationTypeID,
              isActive: roleMobileMenu.isActive,
              isCollectiontagEnabled: roleMobileMenu.isCollectiontagEnabled,
              isDigitalScaleEnabled: roleMobileMenu.isDigitalScaleEnabled
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Legal Entity is required').min("1", 'Legal Entity is required'),
                estateID: Yup.number().required('Garden is required').min("1", 'Garden is required'),
                roleID: Yup.number().required('Role is required').min("1", 'Role is required'),
                mobileMenuID: Yup.number().required('Mobile Menu is required').min("1", 'Mobile Menu is required'),
                fverificationTypeID: Yup.number().required('1st Verification Type is required').min("1", '1st Verification Type is required')
              })
            }
            onSubmit={saveRoleMobileMenu}
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
                              name="groupID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              size='small'
                              value={roleMobileMenu.groupID}
                              variant="outlined"
                              id="groupID"
                              InputProps={{
                                readOnly: !permissionList.isGroupFilterEnabled ? true : false || isUpdate ? true : false
                              }}
                            >
                              <MenuItem value="0">--Select Business Division--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="estateID">
                              Location *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.estateID && errors.estateID)}
                              fullWidth
                              helperText={touched.estateID && errors.estateID}
                              name="estateID"
                              onBlur={handleBlur}
                              size='small'
                              onChange={(e) => handleChange1(e)}
                              value={roleMobileMenu.estateID}
                              variant="outlined"
                              id="estateID"
                              InputProps={{
                                readOnly: !permissionList.isFactoryFilterEnabled ? true : false || isUpdate ? true : false
                              }}
                            >
                              <MenuItem value={0}>--Select Location--</MenuItem>
                              {generateDropDownMenu(estates)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="roleID">
                              Role *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.roleID && errors.roleID)}
                              fullWidth
                              helperText={touched.roleID && errors.roleID}
                              name="roleID"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={roleMobileMenu.roleID}
                              variant="outlined"
                              id="roleID"
                              InputProps={{
                                readOnly: isUpdate
                              }}
                            >
                              <MenuItem value={0}>--Select Role--</MenuItem>
                              {generateDropDownMenu(roles)}
                            </TextField>
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="mobileMenuID">
                              Mobile Menu *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.mobileMenuID && errors.mobileMenuID)}
                              fullWidth
                              helperText={touched.mobileMenuID && errors.mobileMenuID}
                              name="mobileMenuID"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={roleMobileMenu.mobileMenuID}
                              variant="outlined"
                              id="roleID"
                              InputProps={{
                                readOnly: isUpdate
                              }}
                            >
                              <MenuItem value={0}>--Select Mobile Menu--</MenuItem>
                              {generateDropDownMenu(mobileMenus)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="fverificationTypeID">
                              1st Verification Type *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.fverificationTypeID && errors.fverificationTypeID)}
                              fullWidth
                              helperText={touched.fverificationTypeID && errors.fverificationTypeID}
                              name="fverificationTypeID"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={roleMobileMenu.fverificationTypeID}
                              variant="outlined"
                              id="roleID"
                              InputProps={{
                                readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                              }}
                            >
                              <MenuItem value={0}>--Select 1st Verification Type--</MenuItem>
                              {generateDropDownMenu(verificationtypes)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="SndverificationTypeID">
                              2nd Verification Type
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.SndverificationTypeID && errors.SndverificationTypeID)}
                              fullWidth
                              helperText={touched.SndverificationTypeID && errors.SndverificationTypeID}
                              name="SndverificationTypeID"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={roleMobileMenu.SndverificationTypeID}
                              variant="outlined"
                              id="roleID"
                              InputProps={{
                                readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                              }}
                            >
                              <MenuItem value={0}>--Select 2nd Verification Type--</MenuItem>
                              {generateDropDownMenu(verificationtypes)}
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
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="isCollectiontagEnabled">
                              Collection Tag Enabled
                            </InputLabel>
                            <Switch
                              checked={values.isCollectiontagEnabled}
                              onChange={handleChange}
                              name="isCollectiontagEnabled"
                              disabled={isDisableButton}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="isDigitalScaleEnabled">
                              Digital Scale Enabled
                            </InputLabel>
                            <Switch
                              checked={values.isDigitalScaleEnabled}
                              onChange={handleChange}
                              name="isDigitalScaleEnabled"
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
