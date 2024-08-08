import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogTitle, Grid, Typography, Box, Button, makeStyles } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import moment from 'moment';
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePDF'

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
    row: {
        marginTop: '1rem'
    },
    colorCancel: {
        backgroundColor: "red",
    },
    colorRecordAndNew: {
        backgroundColor: "#FFBE00"
    },
    colorRecord: {
        backgroundColor: "green",
    }

}));


const EmployeeViewModal = ({ employeeProfileData, open, onClose }) => {
    const classes = useStyles();
    const componentRef = useRef();

    function settingData(data) {
        if (data == undefined || data == null || data == "") {
            return 'Not Available';
        }
        else {
            return data;
        }
    }

    function settingDOB(data) {
        if (data == undefined || data == null || data == "") {
            return '---';
        }
        else {
            return moment(data).format('YYYY-MM-DD');
        }
    }

    const settingAge = (dob) => {
        if (!dob) return '---';
        const today = moment();
        const birthDate = moment(dob);
        const age = today.diff(birthDate, 'years');
        return age;
    };

    function settingRelationship(data) {
        if (data > 0 && employeeProfileData?.relationships) {
            return employeeProfileData.relationships[data];
        }
    }

    function settingGender(data) {
        if (data == 1) {
            return 'Male';
        }
        else if (data == 2) {
            return 'Female';
        }
        else {
            return 'Other';
        }
    }

    function settingWorkingType(data) {
        if (data == 1) {
            return 'Employee';
        }
        else if (data == 2) {
            return 'Dependant';
        }
        else if (data == 3) {
            return 'Family Member';
        }
        else {
            return 'Other';
        }
    }

    function settingIsRation(data) {
        if (data == true) {
            return 'Available';
        }
        else {
            return 'Not Available';
        }
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Typography variant="h4">Employee Profile</Typography>
            </DialogTitle>
            <DialogContent style={{ display: 'block', marginBottom: '20px' }}>
                {employeeProfileData !== null ? (
                    employeeProfileData.basic && employeeProfileData.basic.map((row, index) => (
                        <>
                            <Grid container spacing={8} key={index}>
                                <Grid item xs={6} style={{ textAlign: 'center' }}>
                                    <img
                                        src={row.convertedEmployeeImageData}
                                        alt={`${row.firstName} profile`}
                                        style={{ borderRadius: '10px', width: '250px', height: '250px' }}
                                    />
                                    <Typography variant="h3" gutterBottom style={{ marginTop: '15px' }}>
                                        <strong>{row.registrationNumber}</strong>
                                    </Typography>
                                    <Typography variant="h4" gutterBottom>
                                        <strong>{row.firstName}</strong>
                                    </Typography>
                                </Grid>
                                <Grid item xs={6} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" gutterBottom>
                                        <strong>Business Division:</strong> {row.groupName}
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        <strong>Location:</strong> {row.factoryName}
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        <strong>Sub-Division:</strong> {row.employeeSubDivisionName}
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        <strong>Work Location:</strong> {row.workLocation}
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        <strong>Pay Point:</strong> {row.payPointName}
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        <strong>Employee Sub Category:</strong> {row.employeeSubCategoryName}
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        <strong>Date Of Birth:</strong> {moment(row.dateOfBirth).format('YYYY-MM-DD')}
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        <strong>Joining Date:</strong> {moment(row.joiningDate).format('YYYY-MM-DD')}
                                    </Typography>
                                </Grid>
                            </Grid>
                            <hr style={{ borderTop: '2px solid #000', width: '100%', margin: '20px 0' }} />
                            <Typography variant="h4" gutterBottom style={{ textAlign: 'center' }}>
                                Dependent Details
                            </Typography>
                            <hr style={{ borderTop: '2px solid #000', width: '100%', margin: '20px 0' }} />
                            <br></br>
                            <TableContainer>
                                <Table aria-label="simple table" size='small' >
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="left" style={{ fontSize: "17px", fontWeight: "bold", border: "1px solid black", padding: '5px' }}>Name</TableCell>
                                            <TableCell align="left" style={{ fontSize: "17px", fontWeight: "bold", border: "1px solid black", padding: '5px', width: '50px' }}>Gender</TableCell>
                                            <TableCell align="left" style={{ fontSize: "17px", fontWeight: "bold", border: "1px solid black", padding: '5px' }}>Relationship</TableCell>
                                            <TableCell align="left" style={{ fontSize: "17px", fontWeight: "bold", border: "1px solid black", padding: '5px' }}>Date Of Birth</TableCell>
                                            <TableCell align="left" style={{ fontSize: "17px", fontWeight: "bold", border: "1px solid black", padding: '5px', width: '50px' }}>Age</TableCell>
                                            <TableCell align="left" style={{ fontSize: "17px", fontWeight: "bold", border: "1px solid black", padding: '5px' }}>NIC</TableCell>
                                            <TableCell align="left" style={{ fontSize: "17px", fontWeight: "bold", border: "1px solid black", padding: '5px' }}>Worker Type</TableCell>
                                            <TableCell align="left" style={{ fontSize: "17px", fontWeight: "bold", border: "1px solid black", padding: '5px' }}>Employee No.</TableCell>
                                            <TableCell align="left" style={{ fontSize: "17px", fontWeight: "bold", border: "1px solid black", padding: '5px' }}>Ration</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {employeeProfileData.dependant && employeeProfileData.dependant.map((row, index) => {
                                            return (
                                                <>
                                                    <React.Fragment key={index}>
                                                        <TableRow key={`${row}-${index}`}>

                                                            <TableCell component="th" scope="row" align="left" style={{ fontSize: "17px", border: "1px dashed black", borderLeft: "1px solid black", padding: '3px' }}>
                                                                {settingData(row.supplimentaryName)}
                                                            </TableCell>
                                                            <TableCell component="th" scope="row" align="left" style={{ fontSize: "17px", border: "1px dashed black", borderLeft: "1px solid black", padding: '3px' }}>
                                                                {settingGender(row.gender)}
                                                            </TableCell>
                                                            <TableCell component="th" scope="row" align="left" style={{ fontSize: "17px", border: "1px dashed black", borderLeft: "1px solid black", padding: '3px' }}>
                                                                {settingRelationship(row.relationship)}
                                                            </TableCell>
                                                            <TableCell component="th" scope="row" align="left" style={{ fontSize: "17px", border: "1px dashed black", borderLeft: "1px solid black", padding: '3px' }}>
                                                                {settingDOB(row.dateOfBirth)}
                                                            </TableCell>
                                                            <TableCell component="th" scope="row" align="left" style={{ fontSize: "17px", border: "1px dashed black", borderLeft: "1px solid black", padding: '3px' }}>
                                                                {settingAge(row.dateOfBirth)}
                                                            </TableCell>
                                                            <TableCell component="th" scope="row" align="left" style={{ fontSize: "17px", border: "1px dashed black", borderLeft: "1px solid black", padding: '3px' }}>
                                                                {settingData(row.nic)}
                                                            </TableCell>
                                                            <TableCell component="th" scope="row" align="left" style={{ fontSize: "17px", border: "1px dashed black", borderLeft: "1px solid black", padding: '3px' }}>
                                                                {settingWorkingType(row.workingType)}
                                                            </TableCell>
                                                            <TableCell component="th" scope="row" align="left" style={{ fontSize: "17px", border: "1px dashed black", borderLeft: "1px solid black", padding: '3px' }}>
                                                                {settingData(row.employeeNumber)}
                                                            </TableCell>
                                                            <TableCell component="th" scope="row" align="left" style={{ fontSize: "17px", border: "1px dashed black", borderLeft: "1px solid black", padding: '3px' }}>
                                                                {settingIsRation(row.isRation)}
                                                            </TableCell>
                                                        </TableRow>
                                                    </React.Fragment>
                                                </>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    ))
                ) : (
                    <p style={{ textAlign: 'center' }}>Employee Profile Load Error</p>
                )}
                <Box display="flex" justifyContent="flex-end" p={2}>
                    <ReactToPrint
                        documentTitle={"Employee Profile"}
                        trigger={() => <Button
                            color="primary"
                            id="btnCancel"
                            variant="contained"
                            style={{ marginRight: '1rem' }}
                            className={classes.colorCancel}
                        >
                            PDF
                        </Button>}
                        content={() => componentRef.current}
                    />
                    <div hidden={true}>
                        <CreatePDF ref={componentRef}
                            employeeProfileData={employeeProfileData}
                        />
                    </div>
                </Box>

            </DialogContent>
        </Dialog>
    );
};

export default EmployeeViewModal;