import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, makeStyles, Container, Button, CardContent, Divider, CardHeader
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import moment from 'moment';
import { TabPanel } from './tabPanel';
import { GeneralDetails } from '../Pages/TabPages/GeneralDetails';
import { FieldHistory } from '../Pages/TabPages/FieldHistory';
import { PruningDetails } from '../Pages/TabPages/PruningDetails';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  avatar: {
    marginRight: theme.spacing(2)
  },
}));

export default function FieldRegistrationAddEdit() {
  const [title, setTitle] = useState("Add Field")
  const [value, setValue] = React.useState(0);
  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };
  const [fieldGeneralArray, setFieldGeneralArray] = useState([]);
  const [historyArray, setHistoryArray] = useState([]);
  const [pruningArray, setPruningArray] = useState([]);
  const [isMainButtonEnable, setIsMainButtonEnable] = useState(false);
  const [isFormValid, setIsFormValid] = useState(0);
  const [isUpdate, setIsUpdate] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const classes = useStyles();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/app/fieldRegistration/listing');
  }

  const alert = useAlert();
  const { fieldID } = useParams();
  let decrypted = 0;

  useEffect(() => {
    if (isMainButtonEnable) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }

  }, [isMainButtonEnable]);

  useEffect(() => {
    decrypted = atob(fieldID.toString());
    if (decrypted != 0) {
      setTitle("Edit Field");
      trackPromise(getFieldDetails(decrypted),
        getSectionDetails(decrypted));
      getPruningDetailsByField(decrypted);
    }
  }, []);

  async function getFieldDetails(fieldID) {
    let response = await services.getFieldDetailsByID(fieldID);
    let general = {
      groupID: response.groupID,
      estateID: response.estateID,
      divisionID: response.divisionID,
      fieldCode: response.fieldCode,
      fieldName: response.fieldName,
      fieldLocation: response.fieldLocation,
      area: response.area,
      cultivationArea: response.cultivationArea,
      targetCrop: response.targetCrop,
      sectionName: response.sectionName,
      areaOfSection: response.areaOfSection,
      sectionTypeID: response.sectionTypeID,
      typesOfPlant: response.typesOfPlant,
      clone: response.clone,
      seedling: response.seedling,
      drainageLengths: response.drainageLengths,
      spaceBetweenPlants: response.spaceBetweenPlants,
      noOfTeaBushes: response.noOfTeaBushes,
      noOfShadeTrees: response.noOfShadeTrees,
      productID: response.productID,
      fieldClassID: response.fieldClassID,
      fieldTopographyID: response.fieldTopographyID,
      fieldCloneDetailID: response.fieldCloneDetailID,
      plantsPerHectare: response.plantsPerHectare,
      vacancyPercentage: response.vacancyPercentage,
      lastPlantingYear: response.lastPlantingYear == null ? '' : moment(response.lastPlantingYear).format('YYYY'),
      specing: response.specing == null ? '' : response.specing,
      cloneDetails: response.cloneDetails,
      isActive: response.isActive
    };
    setFieldGeneralArray(general)
    setIsUpdate(true);
    setValue(1);
    setValue(0);
  }

  async function getPruningDetailsByField(fieldID) {
    let response = await services.getPruningDetailsByField(fieldID);
    setPruningArray(response);
  }

  async function getSectionDetails(fieldID) {
    let response = await services.getSectionDetails(fieldID);
    setHistoryArray(response.data);
  }

  async function saveField() {
    if (fieldGeneralArray.length <= 0) {
      alert.error('Please fill before save');
    }
    else {
      if (!isUpdate) {
        let saveModel = {
          fieldGeneralArray: fieldGeneralArray,
          historyArray: historyArray,
          pruningArray: pruningArray
        }
        let response = await services.saveField(saveModel);
        if (response.statusCode == "Success") {
          alert.success(response.message);
          setIsDisableButton(true);
          navigate('/app/fieldRegistration/listing');
        }
        else {
          alert.error(response.message);
        }
      } else {
        let updateModel = {
          fieldID: atob(fieldID.toString()),
          fieldGeneralArray: fieldGeneralArray,
          historyArray: historyArray,
          pruningArray: pruningArray
        }
        let response = await services.updateField(updateModel);
        if (response.statusCode == "Success") {
          alert.success(response.message);
          setIsDisableButton(true);
          navigate('/app/fieldRegistration/listing');
        }
        else {
          alert.error(response.message);
        }
      }
    }
  }

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
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
          <Box mt={0}>
            <Card>
              <CardHeader
                title={cardTitle(title)}
              />
              <PerfectScrollbar>
                <Divider />
                <CardContent>
                  <Grid container spacing={4}>
                    <Grid className={classes.root1} item xs={12}>
                      <AppBar position="static">
                        <Tabs value={value} onChange={handleTabChange} variant={'fullWidth'} classes={{ indicator: classes.indicator }}
                          aria-label="simple tabs example" style={{ backgroundColor: "White" }}>
                          <Tab label="General" {...a11yProps(0)} style={{ color: "black" }} />
                          <Tab label="Field History" {...a11yProps(1)} style={{ color: "black" }} />
                          <Tab label="Pruning Details" {...a11yProps(2)} style={{ color: "black" }} />
                        </Tabs>
                      </AppBar>
                      <TabPanel value={value} index={0}>
                        <GeneralDetails fieldGeneralArray={fieldGeneralArray} setFieldGeneralArray={setFieldGeneralArray} setIsMainButtonEnable={setIsMainButtonEnable} />
                      </TabPanel>
                      <TabPanel value={value} index={1}>
                        <FieldHistory historyArray={historyArray} setHistoryArray={setHistoryArray} setIsMainButtonEnable={setIsMainButtonEnable} />
                      </TabPanel>
                      <TabPanel value={value} index={2} >
                        <PruningDetails pruningArray={pruningArray} setPruningArray={setPruningArray} setIsMainButtonEnable={setIsMainButtonEnable} />
                      </TabPanel>
                    </Grid>
                  </Grid>
                </CardContent>
                <Box display="flex" justifyContent="flex-end" p={2}>
                  <Button
                    color="primary"
                    disabled={(isUpdate ? false : (isDisableButton)) || !isFormValid}
                    type="submit"
                    variant="contained"
                    onClick={() => trackPromise(saveField())}
                    style={{ marginTop: '-2rem', marginBottom: '2rem', marginRight: '3rem' }}
                  >
                    {isUpdate ? "Update" : "Save"}
                  </Button>
                </Box>
              </PerfectScrollbar>
            </Card>
          </Box>
        </Container>
      </Page>
    </Fragment >
  );
};

