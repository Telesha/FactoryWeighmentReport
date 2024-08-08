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
  CardHeader,
  MenuItem
} from '@material-ui/core';
import Page from 'src/components/Page';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from '../../../../utils/newLoader';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100%',
  },
  cardContent: {
    border: `2px solid #e8eaf6`
  },
}));

export function GeneralDetails({ generalDetailsArray, setGeneralDetailsArray, isUpdate }) {
  const classes = useStyles();
  const [factory, setFactory] = useState({
    operationEntityTypeID: 0,
    factoryCode: '0',
    factoryName: "",
    brNumber: "",
    taxNumber: "",
    managerName: "",
    shortCode: "",
    labourOnBook: "",
    grantArea: 0
  });
  const alert = useAlert();
  const [btnDisable, setBtnDisable] = useState(false);

  useEffect(() => {
    if (isUpdate == true) {
      trackPromise(
        setGeneralValues());
    }
  }, []);

  async function setGeneralValues() {
    setFactory({
      ...factory,
      operationEntityTypeID: generalDetailsArray.operationEntityTypeID,
      factoryCode: generalDetailsArray.factoryCode,
      shortCode: generalDetailsArray.shortCode,
      factoryName: generalDetailsArray.factoryName,
      managerName: generalDetailsArray.managerName,
      taxNumber: generalDetailsArray.taxNumber,
      brNumber: generalDetailsArray.brNumber,
      labourOnBook: generalDetailsArray.labourOnBook == null ? '' : generalDetailsArray.labourOnBook,
      grantArea: generalDetailsArray.grantArea == null ? '' : generalDetailsArray.grantArea
    });
  }

  async function saveGeneral(values) {
    if (values.factoryCode == '0' || values.factoryName == "" || values.operationEntityTypeID == 0) {
      alert.error("Fill all fields");
    } else {
      setGeneralDetailsArray(values);
      setBtnDisable(true);
      alert.success("Successfully added general details");
    }

  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title="General Details Add Edit">
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              operationEntityTypeID: factory.operationEntityTypeID,
              factoryCode: factory.factoryCode,
              factoryName: factory.factoryName,
              managerName: factory.managerName,
              taxNumber: factory.taxNumber,
              brNumber: factory.brNumber,
              shortCode: factory.shortCode,
              labourOnBook: factory.labourOnBook,
              grantArea: factory.grantArea
            }}
            validationSchema={
              Yup.object().shape({
                operationEntityTypeID: Yup.number().required('Entity Type is required').positive('Select an Entity Type'),
                factoryCode: Yup.string().max(255).required('Location Code is required').matches(/^[0-9\b]+$/, 'Location code must be a positive number')
                  .min(2, 'Location code must be at least 2 characters').max(2, 'Location Code must be at most 2 characters'),
                factoryName: Yup.string().max(255).required('Location Name is required').max(50, 'Allow only 50 digits'),
                managerName: Yup.string().max(255).nullable().matches(/^[a-zA-Z0-9_ ]*$/, 'Special characters are not allowed').max(50, 'Allow only 50 digits'),
                taxNumber: Yup.string().max(14, 'Allow only 14 digits').nullable().matches(/^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?/^[a-zA-Z0-9\d\s\/\-]+$/).nullable().min(5, 'Minimum 5 digits required'),
                brNumber: Yup.string().max(255).nullable(),
                shortCode: Yup.string().max(255).required('Short Code is required').matches(/^[A-Z0-9]+$/, 'Numbers And Uppercase Letters Only').max(5, 'Short Code must be at most 5 characters'),
                labourOnBook: Yup.string().max(255).required('Labour On Book is required'),
                grantArea: Yup.number().min(0.01, 'Grant Area must be greater than 0').required('Grant Area is required')
              })
            }
            onSubmit={(saveGeneral)}
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

            }) => (
              <form onSubmit={handleSubmit} autoComplete="off">
                <Box mt={3}>
                  <Card className={classes.cardContent}>
                    <CardHeader
                      title="Add General Details"
                    />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="operationEntityTypeID">
                              Entity Type *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.operationEntityTypeID && errors.operationEntityTypeID)}
                              fullWidth
                              helperText={touched.operationEntityTypeID && errors.operationEntityTypeID}
                              name="operationEntityTypeID"
                              size='small'
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={values.operationEntityTypeID}
                              variant="outlined"
                              InputProps={{
                                readOnly: isUpdate ? true : false,
                              }}
                            >
                              <MenuItem value={0}>--Select Entity Type--</MenuItem>
                              <MenuItem value={3}>Garden</MenuItem>
                              <MenuItem value={1}>Factory</MenuItem>
                              <MenuItem value={5}>Both</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="factoryCode">
                              Location Code *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.factoryCode && errors.factoryCode)}
                              fullWidth
                              helperText={touched.factoryCode && errors.factoryCode}
                              name="factoryCode"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={values.factoryCode}
                              variant="outlined"
                              size='small'
                              onInput={(e) => {
                                e.target.value = e.target.value.slice(0, 2)
                              }}
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
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="factoryName">
                              Location Name *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.factoryName && errors.factoryName)}
                              fullWidth
                              helperText={touched.factoryName && errors.factoryName}
                              name="factoryName"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={values.factoryName}
                              variant="outlined"
                              size='small'
                              InputProps={{
                                readOnly: isUpdate ? true : false,
                              }}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="brNumber">
                              BR Number
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.brNumber && errors.brNumber)}
                              fullWidth
                              helperText={touched.brNumber && errors.brNumber}
                              name="brNumber"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={values.brNumber}
                              size='small'
                              variant="outlined"
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="taxNumber">
                              Tax Number
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.taxNumber && errors.taxNumber)}
                              fullWidth
                              helperText={touched.taxNumber && errors.taxNumber}
                              name="taxNumber"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={values.taxNumber}
                              size='small'
                              variant="outlined"
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="managerName">
                              Garden Manager Name
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.managerName && errors.managerName)}
                              fullWidth
                              helperText={touched.managerName && errors.managerName}
                              name="managerName"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={values.managerName}
                              size='small'
                              variant="outlined"
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="labourOnBook">
                              Labour on Book *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.labourOnBook && errors.labourOnBook)}
                              fullWidth
                              helperText={touched.labourOnBook && errors.labourOnBook}
                              name="labourOnBook"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={values.labourOnBook}
                              size='small'
                              variant="outlined"
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="grantArea">
                              Grant Area *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.grantArea && errors.grantArea)}
                              fullWidth
                              helperText={touched.grantArea && errors.grantArea}
                              name="grantArea"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={values.grantArea}
                              size='small'
                              variant="outlined"
                              InputProps={{
                                inputProps: {
                                  step: 0.01,
                                  type: 'number'
                                },
                              }}
                              onKeyDown={(evt) =>
                                (evt.key === "-") && evt.preventDefault()
                              }
                              onWheel={event => event.target.blur()}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                      <Box display="flex" justifyContent="flex-end" p={3}>
                        <Button
                          color="primary"
                          disabled={btnDisable}
                          type="submit"
                          variant="contained"
                          size='small'
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
    </Fragment>
  );
};
