import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Card, makeStyles, Container, CardHeader, Button, CardContent, Divider, MenuItem, Grid, InputLabel, TextField } from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import MaterialTable from "material-table";
import { LoadingComponent } from '../../../utils/newLoader';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";


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

const screenCode = 'OTHERDEDUCTION';
export default function OtherDeductionListing() {
  const classes = useStyles();
  const [otherDeductionDetailsData, setOtherDeductionDetailsData] = useState([]);
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [isHideField, setIsHideField] = useState(true);

  const [otherDeductionDetails, setOtherDeductionDetails] = useState({
    groupID: '0',
    gardenID: '0',
    regNo: ''
  })

  const navigate = useNavigate();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/otherDeduction/addEdit/' + encrypted);
  }

  const handleClickEdit = (otherDeductionID) => {
    encrypted = btoa(otherDeductionID.toString());
    navigate('/app/otherDeduction/addEdit/' + encrypted);
  }

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  const alert = useAlert();

  useEffect(() => {
    trackPromise(getPermissions(), getGroupsForDropdown());
  }, []);

  useEffect(() => {
    setOtherDeductionDetailsData([]);
  }, [otherDeductionDetails.groupID]);

  useEffect(() => {
    setOtherDeductionDetailsData([]);
  }, [otherDeductionDetails.gardenID]);

  useEffect(() => {
    setOtherDeductionDetailsData([]);
  }, [otherDeductionDetails.regNo]);

  useEffect(() => {
    if (otherDeductionDetails.groupID > 0) {
      trackPromise(getFactoriesForDropdown());
    }
  }, [otherDeductionDetails.groupID]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWOTHERDEDUCTION');

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

    setOtherDeductionDetails({
      ...otherDeductionDetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      gardenID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getAllFactoriesByGroupID(otherDeductionDetails.groupID);
    setFactories(factories);
  }

  function generateDropDownMenu(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
      }
    }
    return items
  }

  function handleGroupChange(e) {
    const target = e.target;
    const value = target.value
    setOtherDeductionDetails({
      ...otherDeductionDetails,
      [e.target.name]: value,
      gardenID: "0"
    });
  }

  async function getOtherDeductionDetails() {
    const OtherDeductionDetails = await services.GetOtherDeductionDetailsByGroupFactoryRegistrationNo(otherDeductionDetails.groupID, otherDeductionDetails.gardenID, otherDeductionDetails.regNo);
    if (OtherDeductionDetails.statusCode == 'Success') {
      setOtherDeductionDetailsData(OtherDeductionDetails.data);
      setIsHideField(false);
    }
    else {
      setIsHideField(true);
      alert.error("No records to display");
    }
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setOtherDeductionDetails({
      ...otherDeductionDetails,
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
            isEdit={true}
            toolTiptitle={"Add Other Deduction Details"}
          />
        </Grid>
      </Grid>
    )
  }

  return (

    <Page
      className={classes.root}
      title="Other Deductions"
    >
      <LoadingComponent />
      <Container maxWidth={false}>

        <Formik
          initialValues={{
            groupID: otherDeductionDetails.groupID,
            gardenID: otherDeductionDetails.gardenID,
            regNo: otherDeductionDetails.regNo,
          }}
          validationSchema={
            Yup.object().shape({
              groupID: Yup.number().required('Legal Entity is required').min("1", 'Legal Entity is required'),
              gardenID: Yup.number().required('Garden is required').min("1", 'Garden is required')
            })
          }
          onSubmit={() => trackPromise(getOtherDeductionDetails())}
          enableReinitialize
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
                  <CardHeader
                    title={cardTitle("Other Deductions")}
                  />
                  <Divider />
                  <CardContent style={{ marginBottom: "2rem" }}>
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
                          onChange={(e) => handleGroupChange(e)}
                          value={otherDeductionDetails.groupID}
                          variant="outlined"
                          disabled={!permissionList.isGroupFilterEnabled}
                          size='small'
                        >
                          <MenuItem value="0">--Select Business Division--</MenuItem>
                          {generateDropDownMenu(groups)}
                        </TextField>
                      </Grid>

                      <Grid item md={4} xs={12}>
                        <InputLabel shrink id="gardenID">
                          Location *
                        </InputLabel>
                        <TextField select
                          error={Boolean(touched.gardenID && errors.gardenID)}
                          fullWidth
                          helperText={touched.gardenID && errors.gardenID}
                          name="gardenID"
                          onChange={(e) => handleChange(e)}
                          value={otherDeductionDetails.gardenID}
                          variant="outlined"
                          disabled={!permissionList.isFactoryFilterEnabled}
                          size='small'
                        >
                          <MenuItem value="0">--Select Location--</MenuItem>
                          {generateDropDownMenu(factories)}
                        </TextField>
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <InputLabel shrink id="regNo">
                          Emp.ID
                        </InputLabel>
                        <TextField
                          error={Boolean(touched.regNo && errors.regNo)}
                          fullWidth
                          helperText={touched.regNo && errors.regNo}
                          name="regNo"
                          onBlur={handleBlur}
                          onChange={(e) => handleChange(e)}
                          value={otherDeductionDetails.regNo}
                          variant="outlined"
                          size="small"
                        />
                      </Grid>
                    </Grid>
                    <Box display="flex" justifyContent="flex-end" p={2}>
                      <Button
                        color="primary"
                        type="submit"
                        variant="contained"

                      >
                        Search
                      </Button>
                    </Box>
                  </CardContent>
                  <PerfectScrollbar>
                    <Box minWidth={1050}
                      hidden={isHideField}
                    >

                      <MaterialTable
                        title="Employee Deduction Details"
                        columns={[
                          { title: 'Applicable Date', field: 'date', render: rowData => rowData.date.split('T')[0] },
                          { title: 'Emp.ID', field: 'registrationNumber' },
                          { title: 'Emp.Name', field: 'employeeName' },
                          { title: 'Emp.Type', field: 'employeeTypeName' },
                          { title: 'Deduction Type', field: 'deductionTypeName' },
                          { title: 'Deduction Amount', field: 'deductionAmount' },
                          { title: 'Reference', field: 'reference' },
                          // {
                          //   title: 'Apply Party', field: 'applyParty', lookup: {
                          //     1: "Daily",
                          //     2: "Weekly",
                          //     3: "Monthly",
                          //     4: "Quarterly"
                          //   }
                          // },
                          // {
                          //   title: 'Calculation Type', field: 'calculationType', lookup: {
                          //     1: "Fix",
                          //     2: "Percentage"
                          //   }
                          // }
                        ]}
                        data={otherDeductionDetailsData}
                        options={{
                          exportButton: false,
                          showTitle: true,
                          headerStyle: { textAlign: "left", height: '1%' },
                          cellStyle: { textAlign: "left" },
                          columnResizable: false,
                          actionsColumnIndex: -1,
                          pageSize: 10
                        }}
                        actions={[
                          {
                            icon: 'mode',
                            tooltip: 'Edit Other Deduction Details',
                            onClick: (event, rowData) => { handleClickEdit(rowData.otherDeductionID) }
                          },
                        ]}
                      />

                    </Box>
                  </PerfectScrollbar>
                </Card>
              </Box>
            </form>
          )}
        </Formik>
      </Container>
    </Page>
  );
};
