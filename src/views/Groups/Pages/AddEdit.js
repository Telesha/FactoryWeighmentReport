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
const screenCode = 'GROUP';
export default function LegalEntityAddEdit(props) {
  const [title, setTitle] = useState("Add Company")
  const [isUpdate, setIsUpdate] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const classes = useStyles();
  const [group, setGroup] = useState({
    masterGroupName: '',
    masterGroupCode: '',
    shortCode: '',
    isActive: true,
  });
  const [groupIsActive, setGroupIsActive] = useState(true);

  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/app/groups/listing');
  }
  const alert = useAlert();
  const { masterGroupID } = useParams();
  let decrypted = 0;

  useEffect(() => {
    getPermission();
  }, []);

  useEffect(() => {
    decrypted = atob(masterGroupID.toString());
    if (decrypted != 0) {
      trackPromise(
        getGroupDetails(decrypted)
      )
    }
  }, []);

  async function getGroupDetails(masterGroupID) {
    let response = await services.getGroupDetailsByID(masterGroupID);
    let data = response[0];
    setTitle("Edit Company");
    setGroup(data);
    setIsUpdate(true);
    setGroupIsActive(response[0]);
  }
  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITGROUP');

    if (isAuthorized === undefined) {
      navigate('/404');
    }
  }
  async function saveGroup(values) {
    if (isUpdate == true) {

      let updateModel = {
        masterGroupID: atob(masterGroupID.toString()),
        masterGroupCode: values.masterGroupCode,
        masterGroupName: values.masterGroupName,
        shortCode: values.shortCode,
        isActive: values.isActive,
      }

      let response = await services.updateGroup(updateModel);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/groups/listing');
      }
      else {
        alert.error(response.message);
      }
    } else {
      let response = await services.saveGroup(values);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/groups/listing');
      }
      else {
        alert.error(response.message);
      }
    }
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
              masterGroupName: group.masterGroupName,
              masterGroupCode: group.masterGroupCode,
              shortCode: group.shortCode,
              isActive: group.isActive,
            }}
            validationSchema={
              Yup.object().shape({
                masterGroupName: Yup.string().max(255, 'Company Name must be at least 255 characters').required('Company Name is required')
                  .matches(/^(?!\s)/, 'Only alphabets and special characters are allowed'),
                masterGroupCode: Yup.string().max(255).required('Company Code is required').matches(/^[0-9\b]+$/, 'Only allow numbers')
                  .min(2, 'Company Code must be at least 2 characters').max(2, 'Company Code must be at most 2 characters'),
                shortCode: Yup.string().required('Short Code is required').matches(/^[A-Z0-9]+$/, 'Numbers And Uppercase Letters Only').max(5, 'Short Code must be at most 5 characters'),
              })
            }
            onSubmit={(values) => trackPromise(saveGroup(values))}
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
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="masterGroupCode">
                              Company Code *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.masterGroupCode && errors.masterGroupCode)}
                              fullWidth
                              helperText={touched.masterGroupCode && errors.masterGroupCode}
                              name="masterGroupCode"
                              size='small'
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={values.masterGroupCode}
                              variant="outlined"
                              disabled={isDisableButton}
                              InputProps={{
                                readOnly: isUpdate ? true : false,
                              }}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
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
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="masterGroupName">
                              Company Name *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.masterGroupName && errors.masterGroupName)}
                              fullWidth
                              helperText={touched.masterGroupName && errors.masterGroupName}
                              name="masterGroupName"
                              size='small'
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={values.masterGroupName}
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
