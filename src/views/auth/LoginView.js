import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { Formik } from 'formik';
import {
  Box,
  Button,
  Container,
  Grid,
  Link,
  TextField,
  Typography,
  makeStyles,
  IconButton,
  InputAdornment,
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from './Services';
import { Icon } from '@iconify/react';
import eyeFill from '@iconify/icons-eva/eye-fill';
import eyeOffFill from '@iconify/icons-eva/eye-off-fill';
import { Alert, AlertTitle } from '@material-ui/lab';
import { LoadingComponent } from './../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    height: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  }
}));

const LoginView = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [userDetails, setUserDetails] = useState({
    username: "",
    password: ""

  });
  const [isHidden, setIsHidden] = useState(false)

  const [messageModel, setmessageModel] = useState([]);

  async function login(values) {
    let result = await services.login(values);
    if (result.statusCode == "Error") {
      setIsHidden(true);
      setmessageModel(result.message);
      return;
    }
    sessionStorage.setItem('token', result.data);
    //navigate('/app/dashboard');
    navigate('/newLoader');
  }

  const handleShowPassword = () => {
    setShowPassword((show) => !show);
  };

  return (
    <Page
      className={classes.root}
      title="Sign in"
    >
      <Box
        display="flex"
        flexDirection="column"
        height="100%"
        justifyContent="center"
      >
        <LoadingComponent />
        <Container maxWidth="sm">
          <Formik
            initialValues={{
              username: userDetails.username,
              password: userDetails.password
            }}
            validationSchema={Yup.object().shape({
              username: Yup.string().max(255).required('Username is required'),
              password: Yup.string().max(255).required('Password is required')
            })}
            onSubmit={(e) => trackPromise(login(e))}
          >
            {({
              errors,
              handleBlur,
              handleChange,
              handleSubmit,
              isSubmitting,
              touched,
              values
            }) => (
              <form onSubmit={handleSubmit}>
                <Box mb={3}>
                  <img style={{ width: 400, height: 115, marginLeft: 70, marginBottom: 20 }}
                    src="/static/images/products/AgriGEN.png" alt="login" />
                  <Typography variant="h2" gutterBottom>
                    Sign in to AgriGEN
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>Enter your details below.</Typography>
                  {/* <Typography
                    color="textPrimary"
                    variant="h2"
                  >
                    Sign in
                  </Typography> */}
                </Box>
                <Grid
                  item
                  xs={12}
                  md={12}
                >
                  {isHidden ? <Alert severity="error">
                    <AlertTitle>Error: <strong>{messageModel}</strong></AlertTitle>

                  </Alert> : null}
                </Grid>
                <TextField
                  error={Boolean(touched.username && errors.username)}
                  fullWidth
                  helperText={touched.username && errors.username}
                  label="Username"
                  margin="normal"
                  name="username"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  type="text"
                  value={values.username}
                  variant="outlined"
                />
                <TextField
                  error={Boolean(touched.password && errors.password)}
                  fullWidth
                  helperText={touched.password && errors.password}
                  label="Password"
                  margin="normal"
                  name="password"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  type={showPassword ? 'text' : 'password'}
                  value={values.password}
                  variant="outlined"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleShowPassword} edge="end">
                          <Icon icon={showPassword ? eyeFill : eyeOffFill} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                <Box my={2}>
                  <Button
                    color="primary"
                    disabled={isSubmitting}
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                  >
                    Sign in now
                  </Button>
                </Box>
              </form>
            )}
          </Formik>
        </Container>
      </Box>
    </Page>
  );
};

export default LoginView;
