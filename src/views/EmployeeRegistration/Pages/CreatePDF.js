import React from "react";
import { DialogContent, DialogTitle, Grid, Typography } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import moment from "moment";


export default class ComponentToPrint extends React.Component {
    render() {
        const employeeProfileData = this.props.employeeProfileData;
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
            <div>
                <style>
                    {`
        @page {
            size: A4 protrait;
            margin-top: 0.75in;
            margin-bottom: 0.75in;
            margin-right: 0.5in;
            margin-left: 0.75in;
        }
    `}
                </style>
                <h3>
                    Employee Profile
                </h3>
                <div className="row pl-2 pb-4 pt-4">
                    {employeeProfileData !== null ? (
                        employeeProfileData.basic && employeeProfileData.basic.map((row, index) => (
                            <>
                                <Grid container spacing={8} key={index}>
                                    <Grid item xs={6} style={{ textAlign: 'center' }}>
                                        <img
                                            src={row.convertedEmployeeImageData}
                                            alt={`${row.firstName} profile`}
                                            style={{ borderRadius: '10px', width: '150px', height: '150px' }}
                                        />
                                        <h4 >
                                            <strong>{row.registrationNumber}</strong>
                                        </h4>
                                        <h5>
                                            <strong>{row.firstName}</strong>
                                        </h5>
                                    </Grid>
                                    <br />
                                    <Grid item xs={6} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <Typography variant="body1" gutterBottom style={{ fontSize: '10px' }}>
                                            <strong>Business Division:</strong> {row.groupName}
                                        </Typography>
                                        <Typography variant="body1" gutterBottom style={{ fontSize: '10px' }}>
                                            <strong>Location:</strong> {row.factoryName}
                                        </Typography>
                                        <Typography variant="body1" gutterBottom style={{ fontSize: '10px' }}>
                                            <strong>Sub-Division:</strong> {row.employeeSubDivisionName}
                                        </Typography>
                                        <Typography variant="body1" gutterBottom style={{ fontSize: '10px' }}>
                                            <strong>Work Location:</strong> {row.workLocation}
                                        </Typography>
                                        <Typography variant="body1" gutterBottom style={{ fontSize: '10px' }}>
                                            <strong>Pay Point:</strong> {row.payPointName}
                                        </Typography>
                                        <Typography variant="body1" gutterBottom style={{ fontSize: '10px' }}>
                                            <strong>Employee Sub Category:</strong> {row.employeeSubCategoryName}
                                        </Typography>
                                        <Typography variant="body1" gutterBottom style={{ fontSize: '10px' }}>
                                            <strong>Date Of Birth:</strong> {moment(row.dateOfBirth).format('YYYY-MM-DD')}
                                        </Typography>
                                        <Typography variant="body1" gutterBottom style={{ fontSize: '10px' }}>
                                            <strong>Joining Date:</strong> {moment(row.joiningDate).format('YYYY-MM-DD')}
                                        </Typography>
                                    </Grid>
                                </Grid>
                                <br />
                                <hr style={{ borderTop: '2px solid #000', width: '100%', margin: '10px 0' }} />
                                <Typography gutterBottom style={{ textAlign: 'center' }}>
                                    Dependent Details
                                </Typography>
                                <hr style={{ borderTop: '2px solid #000', width: '100%', margin: '10px 0' }} />
                                <br></br>
                                <TableContainer>
                                    <Table aria-label="simple table" size='small' >
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="left" style={{ fontSize: "10px", fontWeight: "bold", border: "1px solid black", padding: '3px', width: '200px' }}>Name</TableCell>
                                                <TableCell align="left" style={{ fontSize: "10px", fontWeight: "bold", border: "1px solid black", padding: '3px', width: '60px' }}>Gender</TableCell>
                                                <TableCell align="left" style={{ fontSize: "10px", fontWeight: "bold", border: "1px solid black", padding: '3px', width: '100px' }}>Relationship</TableCell>
                                                <TableCell align="left" style={{ fontSize: "10px", fontWeight: "bold", border: "1px solid black", padding: '3px', width: '100px' }}>Date Of Birth</TableCell>
                                                <TableCell align="left" style={{ fontSize: "10px", fontWeight: "bold", border: "1px solid black", padding: '3px', width: '50px' }}>Age</TableCell>
                                                <TableCell align="left" style={{ fontSize: "10px", fontWeight: "bold", border: "1px solid black", padding: '3px', width: '100px' }}>NIC</TableCell>
                                                <TableCell align="left" style={{ fontSize: "10px", fontWeight: "bold", border: "1px solid black", padding: '3px', width: '100px' }}>Worker Type</TableCell>
                                                <TableCell align="left" style={{ fontSize: "10px", fontWeight: "bold", border: "1px solid black", padding: '3px', width: '100px' }}>Employee No.</TableCell>
                                                <TableCell align="left" style={{ fontSize: "10px", fontWeight: "bold", border: "1px solid black", padding: '3px', width: '100px' }}>Ration</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {employeeProfileData.dependant && employeeProfileData.dependant.map((row, index) => {
                                                return (
                                                    <>
                                                        <React.Fragment key={index}>
                                                            <TableRow key={`${row}-${index}`}>

                                                                <TableCell component="th" scope="row" align="left" style={{ fontSize: "10px", border: "1px dashed black", borderLeft: "1px solid black", padding: '3px' }}>
                                                                    {settingData(row.supplimentaryName)}
                                                                </TableCell>
                                                                <TableCell component="th" scope="row" align="left" style={{ fontSize: "10px", border: "1px dashed black", borderLeft: "1px solid black", padding: '3px' }}>
                                                                    {settingGender(row.gender)}
                                                                </TableCell>
                                                                <TableCell component="th" scope="row" align="left" style={{ fontSize: "10px", border: "1px dashed black", borderLeft: "1px solid black", padding: '3px' }}>
                                                                    {settingRelationship(row.relationship)}
                                                                </TableCell>
                                                                <TableCell component="th" scope="row" align="left" style={{ fontSize: "10px", border: "1px dashed black", borderLeft: "1px solid black", padding: '3px' }}>
                                                                    {settingDOB(row.dateOfBirth)}
                                                                </TableCell>
                                                                <TableCell component="th" scope="row" align="left" style={{ fontSize: "10px", border: "1px dashed black", borderLeft: "1px solid black", padding: '3px' }}>
                                                                    {settingAge(row.dateOfBirth)}
                                                                </TableCell>
                                                                <TableCell component="th" scope="row" align="left" style={{ fontSize: "10px", border: "1px dashed black", borderLeft: "1px solid black", padding: '3px' }}>
                                                                    {settingData(row.nic)}
                                                                </TableCell>
                                                                <TableCell component="th" scope="row" align="left" style={{ fontSize: "10px", border: "1px dashed black", borderLeft: "1px solid black", padding: '3px' }}>
                                                                    {settingWorkingType(row.workingType)}
                                                                </TableCell>
                                                                <TableCell component="th" scope="row" align="left" style={{ fontSize: "10px", border: "1px dashed black", borderLeft: "1px solid black", padding: '3px' }}>
                                                                    {settingData(row.employeeNumber)}
                                                                </TableCell>
                                                                <TableCell component="th" scope="row" align="left" style={{ fontSize: "10px", border: "1px dashed black", borderLeft: "1px solid black", padding: '3px' }}>
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
                </div>
            </div>
        );
    }
}