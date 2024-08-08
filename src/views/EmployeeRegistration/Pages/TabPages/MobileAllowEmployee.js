import React, { useState, useEffect } from 'react';
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
  CardHeader,
  Switch
} from '@material-ui/core';
import Page from 'src/components/Page';
import { Formik } from 'formik';
import { trackPromise } from 'react-promise-tracker';
import * as Yup from "yup";
import { LoadingComponent } from '../../../../utils/newLoader';
import { useAlert } from 'react-alert';
import authService from '../../../../utils/permissionAuth';
import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100%',
  },
  avatar: {
    marginRight: theme.spacing(2)
  },
  cardContent: {
    border: `2px solid #e8eaf6`
  }
}));

const screenCode = "EMPLOYEEREGISTRATION";
export function MobileAllowEmployee({ mobileCredentialsArray, setMobileCredentialsArray, setIsMainButtonEnable, nameAndRegNo }) {
  const classes = useStyles();
  const alert = useAlert();
  const navigate = useNavigate();
  const [user, setUser] = useState({
    employeeUserName: '',
    password: '',
    confirmPassword: '',
    IsAllowMobile: false
  })
  const [btnDisable, setBtnDisable] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [IsActiveMobile, setIsActiveMobile] = useState(false)
  useEffect(() => {
    trackPromise(
      getPermission(),
      setMobileCredentialValues(),
    );
  }, []);
  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITEMPLOYEEREGISTRATION');

    if (isAuthorized === undefined) {
      navigate('/404');
    }
  }
  function handleChangeForm(e) {
    const target = e.target;
    const value = target.value

    setUser({
      ...user,
      [e.target.name]: value
    });
  }
  function OnHandleIsActiveMobile() {
    setIsActiveMobile(!IsActiveMobile);
    if (!isUpdate) {
      user.employeeUserName = ""
      user.password = ''
      user.confirmPassword = ''
    }
  }
  async function setMobileCredentialValues() {
    if (mobileCredentialsArray) {
      setUser({
        ...user,
        employeeUserName: mobileCredentialsArray.userName,
        password: mobileCredentialsArray.password == null ? "***" : mobileCredentialsArray.password,
        confirmPassword: mobileCredentialsArray.confirmPassword == null ? "***" : mobileCredentialsArray.confirmPassword,
        allowMobile: mobileCredentialsArray.isMobileAllow
      })
      setIsActiveMobile(mobileCredentialsArray.isMobileAllow)
      if (mobileCredentialsArray.userID > 0) {
        setIsUpdate(true);
      }
      else {
        setIsUpdate(false);
      }
    }
  }
  async function saveEmployeeMobileCredentials(values) {
    if (isUpdate) {
      let mobileUpdate = {
        userName: values.employeeUserName,
        password: values.password === "***" ? null : values.password,
        confirmPassword: values.confirmPassword === "***" ? null : values.confirmPassword,
        isAllowMobile: IsActiveMobile,
        userID: mobileCredentialsArray.userID
      }
      btnchecking();
      setMobileCredentialsArray(mobileUpdate)
      setIsMainButtonEnable(true);
      alert.success("Employee mobile credentials updated.");
    } else {
      if (values.password == values.confirmPassword) {
        let mobile = {
          userName: values.employeeUserName,
          password: values.password,
          confirmPassword: values.confirmPassword,
          isAllowMobile: IsActiveMobile
        }
        btnchecking();
        setMobileCredentialsArray(mobile)
        setIsMainButtonEnable(true);
        alert.success("Employee mobile credentials added.");
      }
      else {
        alert.error("Confirm Password is not matching")
      }
    }
  }
  function btnchecking() {
    setBtnDisable(false);
  }
  return (
    <Page className={classes.root} title="Employee Mobile Allow Employee Add Edit">
      <Container maxWidth={false}>
        <LoadingComponent />
        <Formik
          initialValues={{
            employeeUserName: user.employeeUserName,
            password: user.password,
            confirmPassword: user.confirmPassword,
            IsAllowMobile: user.IsAllowMobile
          }}
          validationSchema={
            Yup.object().shape({
              employeeUserName: IsActiveMobile ? Yup.string()
                .required('User Name is required').matches(/^(?!\s)[a-zA-ZÀ-ÖÙ-öù-ÿĀ-žḀ-ỿ\s\-\/.]+$/, 'Please enter a valid name') : null,
              password: IsActiveMobile ? Yup.string().min(3, 'Password must be at 3 char long').required('Password is mandatory')
                .matches(/^\S.*$/, 'Password should not start with a space') : null
            })
          }
          onSubmit={(values) => trackPromise(saveEmployeeMobileCredentials(values))}
          enableReinitialize
        >
          {({
            errors,
            handleBlur,
            handleChange,
            handleSubmit,
            touched,
            values,
            getFieldProps
          }) => (
            <form onSubmit={handleSubmit}>
              {(nameAndRegNo.length > 0) ?
                <Grid container spacing={3}>
                  <Grid item md={4} xs={12}>Employee Name : {nameAndRegNo[0]}</Grid>
                  <Grid item md={4} xs={12}>Registration Number : {nameAndRegNo[1]}</Grid>
                </Grid>
                : null}
              <Box mt={3}>
                <Card className={classes.cardContent}>
                  <CardHeader
                    title="Mobile Allow"
                  />
                  <PerfectScrollbar>
                    <Divider />
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid item md={12} xs={12} alignItems="flex-start">
                          <InputLabel id="IsAllowMobile">
                            Allow Mobile
                          </InputLabel>
                          <Switch
                            error={Boolean(touched.IsAllowMobile && errors.IsAllowMobile)}
                            helperText={touched.IsAllowMobile && errors.IsAllowMobile}
                            checked={IsActiveMobile}
                            onBlur={handleBlur}
                            onChange={OnHandleIsActiveMobile}
                            name="IsAllowMobile"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="employeeUserName">
                            User Name *
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.employeeUserName && errors.employeeUserName)}
                            fullWidth
                            placeholder="User Name"
                            helperText={touched.employeeUserName && errors.employeeUserName}
                            size='small'
                            name="employeeUserName"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={values.employeeUserName}
                            variant="outlined"
                            disabled={!IsActiveMobile || isUpdate}
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="password">
                            Password *
                          </InputLabel>
                          <TextField
                            error={Boolean(
                              touched.password && errors.password
                            )}
                            fullWidth
                            helperText={
                              touched.password && errors.password
                            }

                            name="password"
                            placeholder="Password"
                            onChange={handleChangeForm}
                            onBlur={handleBlur}
                            value={values.password}
                            {...getFieldProps('password')}
                            variant="outlined"
                            size="small"
                            type='password'
                            disabled={!IsActiveMobile || isUpdate}
                          ></TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="confirmPassword">
                            Confirm Password *
                          </InputLabel>
                          <TextField
                            error={Boolean(
                              touched.password && errors.password
                            )}
                            fullWidth
                            helperText={
                              touched.password && errors.password
                            }
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            onBlur={handleBlur}
                            onChange={handleChangeForm}
                            {...getFieldProps('confirmPassword')}
                            value={values.confirmPassword}
                            variant="outlined"
                            size="small"
                            type='password'
                            disabled={!IsActiveMobile || isUpdate}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                    <Box display="flex" justifyContent="flex-end" p={2}>
                      <Button
                        color="primary"
                        disabled={btnDisable}
                        type="submit"
                        variant="contained"
                      >
                        Add
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
  )
}