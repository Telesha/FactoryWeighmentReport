import React,{ useState, useEffect,useRef }  from "react";
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box,
    Button,
    Card,
    makeStyles,
    Container,
    CardHeader,
    CardContent,
    Divider,
    MenuItem,
    Grid,
    InputLabel,
    TextField
  } from '@material-ui/core';
import Page from 'src/components/Page';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import services from '../Services'
import MaterialTable from "material-table";
import xlsx from 'json-as-xlsx';
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePdf';
import {saveAs} from 'file-saver';
var JSZip = require("jszip");


const useStyles = makeStyles(theme => ({
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

const screenCode = 'EMPLOYEECARDPRINT';
export default function EmployeeCardPrintFiltering(props){
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [estates, setEstates] = useState();
    const [divisions, setDivisions] = useState();

    const [empCardPrintList,setEmpCardPrintList] = useState({
        groupID : '0' ,
        estateID : '0' ,
        divisionID : '0',
        employeeTypeID : '0'
    });
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
      });
    const [cardDetailsData, setCardDetailsData] = useState([]);

    const [selectedEmpCardDetailsList, setSelectedEmpCardDetailsList] = useState([]);
    const [isButtonHide, setIsButtonHide] = useState(false);
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const componentRef = useRef();

    const navigate = useNavigate();

    useEffect(() => {
        trackPromise(
            getPermissions(),
            getGroupsForDropdown(),
        );
    }, [] );

    useEffect(() => {
        trackPromise(
            getEstateDetailsByGroupID()
        );
    }, [empCardPrintList.groupID]);

    useEffect(() => {
        trackPromise(
            getDivisionDetailsByEstateID(),
        );
    }, [empCardPrintList.estateID]);


    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(
          p => p.permissionCode == 'VIEWEMPLOYEECARD'
        );
    
        if (isAuthorized === undefined) {
          navigate('/404');
        }
        var isGroupFilterEnabled = permissions.find(
          p => p.permissionCode == 'GROUPDROPDOWN'
        );
        var isFactoryFilterEnabled = permissions.find(
          p => p.permissionCode == 'FACTORYDROPDOWN'
        );
    
        setPermissions({
          ...permissionList,
          isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
          isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
        });
    
        setEmpCardPrintList({
          ...empCardPrintList,
          groupID: parseInt(tokenService.getGroupIDFromToken()),
          estateID: parseInt(tokenService.getFactoryIDFromToken())
        });
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(empCardPrintList.groupID);
        setEstates(response);
    }

    async function getDivisionDetailsByEstateID() {
    var response = await services.getDivisionDetailsByEstateID(empCardPrintList.estateID);
    setDivisions(response);
    };

    function generateDropDownMenu(data) {
        let items = [];
        if (data != null) {
          for (const [key, value] of Object.entries(data)) {
            items.push(
              <MenuItem key={key} value={key}>
                {value}
              </MenuItem>
            );
          }
        }
        return items;
    }

    async function SearchData(empCardPrintList){
        const cardDetails = await services.getCardPrintDetails(empCardPrintList.groupID,empCardPrintList.estateID,empCardPrintList.divisionID,empCardPrintList.employeeTypeID);
            if (cardDetails != null) {
                cardDetails.forEach(cardDetails => {
                    cardDetails['groupName'] = groups[empCardPrintList.groupID];
                    cardDetails['estateName'] = estates[empCardPrintList.estateID];
                    cardDetails['divisionName'] = divisions[empCardPrintList.divisionID];
                   });
                setCardDetailsData(cardDetails);
            if (cardDetails.length == 0) {
                alert.error("No records to display");
            }
            }
            else {
            alert.error("Error");
            }
    }

    function handleChange(e){
        const target = e.target;
        const value = target.value;
        setEmpCardPrintList({
            ...empCardPrintList,
            [e.target.name]: value
        })
    }

    function handleRecordSelectionFromTable(rowData) {
        setSelectedEmpCardDetailsList(rowData);
    }

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
          array.map(x => {
            var vr = {
              'Card ID': x.cardID,
              'Employee ID': x.employeeID,
              'Card Number': x.cardNumber,
              'Employee Code': x.employeeCode,
              'NIC Number': x.nicNumber,
              'Employee Name': x.employeeName,
              'Employee Code': x.employeeCode,
              'Gender': x.genderID == 1 ? 'M': x.genderID == 2 ? 'F' : null,
              'Mobile Number': x.mobileNumber
            }
            res.push(vr);
          });
        }
        return res;
      }
    
      async function createFile() {
        if(selectedEmpCardDetailsList.length > 0){
            var file = await createDataForExcel(selectedEmpCardDetailsList);
            var settings = {
            sheetName: 'Employee Card Print Details',
            fileName: 'Employee Card Print Details',
            writeOptions: {}
                }
            let keys = Object.keys(file[0])
            let tempcsvHeaders = csvHeaders;
            keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem })
            })
    
            let dataA = [
            {
                sheet: 'Employee Card Print Details',
                columns: tempcsvHeaders,
                content: file
            }
            ]
            xlsx(dataA, settings);
            }
    }
    

    function getBase64String(dataURL) {
        var idx = dataURL.indexOf('base64,') + 'base64,'.length;
        return dataURL.substring(idx);
     }

      function handleDownload() {
        var zip = new JSZip();
        var img = zip.folder("images");
    
        if (selectedEmpCardDetailsList.length != 0) {
            selectedEmpCardDetailsList.map(item => {
    
            const canvas = document.getElementById(item.registrationNumber);
            const pngUrl = canvas.toDataURL();
            let baseString = getBase64String(pngUrl);
            const imagename = item.registrationNumber + "." + "jpeg"
            img.file(imagename, baseString, { base64: true });
          })
        }
        zip.generateAsync({ type: "blob" })
          .then(function (content) { 
            // see FileSaver.js 
            saveAs(content, "Agrix-Employees.zip");
          });
      } 


    return(
        <Page className={classes.root} title="Employee Card Print">
            <Container maxWidth={false}>
                <Box mt={0}>
                    <Card>
                        <CardHeader title={'Employee Card Print'}/>
                        <PerfectScrollbar>
                            <Divider/>
                            <CardContent style={{ marginBottom: '2rem' }}>
                                <Grid container spacing={3}>
                                    <Grid item md={4} xs={12}>
                                        <InputLabel shrink id="groupID">
                                        Group *
                                        </InputLabel>
                                        <TextField
                                        select
                                        fullWidth
                                        size='small'
                                        name="groupID"
                                        variant="outlined"
                                        onChange={e=> handleChange(e)}
                                        value = {empCardPrintList.groupID}
                                        disabled={!permissionList.isGroupFilterEnabled}
                                        >
                                            <MenuItem value="0">--Select Group--</MenuItem>
                                            {generateDropDownMenu(groups)}
                                        </TextField>

                                    </Grid>
                                    <Grid item md={4} xs={12}>
                                        <InputLabel shrink id="estateID">
                                        Estate *
                                        </InputLabel>
                                        <TextField
                                        select
                                        fullWidth
                                        size="small"
                                        name="estateID"
                                        variant="outlined"
                                        onChange={e => handleChange(e)}
                                        value = {empCardPrintList.estateID}
                                        disabled={!permissionList.isFactoryFilterEnabled}
                                        >
                                            <MenuItem value="0">--Select Estate--</MenuItem>
                                            {generateDropDownMenu(estates)}
                                        </TextField>
                                    </Grid>
                                    <Grid item md={4} xs={12}>
                                        <InputLabel shrink id="divisionID">
                                        Division *
                                        </InputLabel>
                                        <TextField
                                        select
                                        fullWidth
                                        size="small"
                                        name="divisionID"
                                        variant="outlined"
                                        onChange={e => handleChange(e)}
                                        value = {empCardPrintList.divisionID}
                                        >
                                            <MenuItem value="0">--Select Division--</MenuItem>
                                            {generateDropDownMenu(divisions)}
                                        </TextField>
                                    </Grid>
                                    <Grid item md={4} xs={12}>
                                        <InputLabel shrink id="employeeTypeID">
                                        Employee Type *
                                        </InputLabel>
                                        <TextField 
                                        select 
                                        fullWidth
                                        size='small'
                                        id="employeeTypeID"
                                        name="employeeTypeID"
                                        value={empCardPrintList.employeeTypeID}
                                        type="text"
                                        variant="outlined"
                                        onChange={(e) => handleChange(e)}
                                    >
                                        <MenuItem value="0">--Select Employee Type--</MenuItem>
                                        <MenuItem value="1">Registered</MenuItem>
                                        <MenuItem value="2">Contract</MenuItem>
                                    </TextField>
                                    </Grid>
                                </Grid>
                                <Box display="flex" flexDirection="row-reverse" p={2}>
                                    <Button
                                        color="primary"
                                        type="submit"
                                        variant="contained"
                                        onClick={() => trackPromise(SearchData(empCardPrintList))}
                                    >
                                        Search
                                    </Button>
                                </Box>
                            </CardContent>
                            <Box minWidth={1050}> 
                                        <MaterialTable
                                        title="Multiple Actions Preview"
                                        columns={[
                                            { title: 'Card ID', field: 'cardID' },
                                            { title: 'Employee ID', field: 'employeeID'},
                                            { title: 'Card Number', field: 'cardNumber' },
                                            { title: 'Employee Reg Number', field: 'registrationNumber'},
                                            { title: 'Created Date', field: 'createdDate', render: rowData => rowData.createdDate.split('T')[0]}   
                                        ]}
                                        data={cardDetailsData}
                                        options={{
                                            exportButton: false,
                                            showTitle: false,
                                            headerStyle: { textAlign: "left", height: '1%' },
                                            cellStyle: { textAlign: "left" },
                                            columnResizable: false,
                                            actionsColumnIndex: -1,
                                            selection: true,
                                        }}
                                        onSelectionChange={(rows) => handleRecordSelectionFromTable(rows)
                                        }
                                        />
                            </Box>
                           

                            <div hidden={isButtonHide}>
                                        {cardDetailsData.length > 0 ?
                                        <Box display="flex" justifyContent="flex-end" p={2} >
                                            <Button
                                            color="primary"
                                            id="btnRecord"
                                            type="submit"
                                            variant="contained"
                                            style={{ marginRight: '1rem' }}
                                            className={classes.colorRecord}
                                            onClick={() => createFile()}
                                            size='small'
                                            >
                                            EXCEL
                                            </Button>

                                            <ReactToPrint
                                            documentTitle={"Employee Card Print Details"}
                                            trigger={() => <Button
                                                color="primary"
                                                id="btnRecord"
                                                type="submit"
                                                variant="contained"
                                                style={{ marginRight: '1rem' }}
                                                className={classes.colorCancel}
                                                size='small'
                                            >
                                                PDF
                                            </Button>}
                                            content={() => componentRef.current}
                                            />

                                            <Button
                                            color="primary"
                                            id="btnRecord"
                                            type="submit"
                                            variant="contained"
                                            style={{ marginRight: '1rem' }}
                                            className={classes.colorRecord}
                                            value="Save As Images"
                                            onClick={() => handleDownload()}
                                            size='small'
                                            >
                                            Save As Images
                                            </Button>      

                                            <div hidden={true}>
                                            <CreatePDF ref={componentRef}
                                                data={selectedEmpCardDetailsList}
                                            />
                                            </div>

                                            <div>&nbsp;</div>
                                        </Box>
                                        : null}
                            </div>
                        </PerfectScrollbar>
                    </Card>
                </Box>
            </Container>
        </Page>
    );



}