import React from "react";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

export default class ComponentToPrint extends React.Component {
    render() {
        const searchData = this.props.searchData;
        const reportData = this.props.biometricData;
        return (
            <div>
                <style>
                    {`
                    @page{
                        size: A4 portrait;
                        margin-top: 1in;  
                        margin-bottom: 1in; 
                        margin-right: 0.75in;  
                        margin-left: 0.75in;
                    }
                    `}

                </style>

                <h3><u>Employee Biometric</u></h3>
                <br />
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><b>Business Division: </b> {searchData.groupName}</div>
                    <div className="col"><b>Location: </b> {searchData.gardenName == undefined ? "All Locations" : searchData.gardenName}</div>
                    <div className="col"><b>Sub Division: </b> {searchData.costCenterName == undefined ? "All Sub-Divisions" : searchData.costCenterName}</div>
                    <div className="col"><b>Pay Point : </b>{searchData.payPointName == undefined ? "All Pay Points" : searchData.payPointName}</div>
                    <div className="col"><b>Employee Type: </b> {searchData.empTypeName == undefined ? "All Employee Types" : searchData.empTypeName} </div>
                    <div className="col"><b>Employee Category: </b> {searchData.employeeSubCategory == undefined ? "All Employee Categories" : searchData.employeeSubCategory} </div>
                    <div className="col"><b>Employee Biometric Status: </b> {searchData.empBioStatusName == undefined ? "All Status" : searchData.empBioStatusName} </div>
                </div>
                <br />
                <TableContainer component={Paper}>
                    <Table aria-label="simple table" size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell align="left" style={{ fontWeight: "bold", fontSize: '10px', padding: '3px', border: "1px solid black" }}>Reg. No</TableCell>
                                <TableCell align="left" style={{ fontWeight: "bold", fontSize: '10px', padding: '3px', border: "1px solid black" }}>Name</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", fontSize: '10px', padding: '3px', border: "1px solid black" }}>DOB</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", fontSize: '10px', padding: '3px', border: "1px solid black" }}>Category</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", fontSize: '10px', padding: '3px', border: "1px solid black" }}>Duffa</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", fontSize: '10px', padding: '3px', border: "1px solid black" }}>Status</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", fontSize: '10px', padding: '3px', border: "1px solid black" }}>Image</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reportData.map((row, i) => (
                                <TableRow key={i}>
                                    <TableCell component="th" scope="row" align="left" style={{ fontSize: '10px', padding: '3px', border: "1px dashed black" }}> {row.registrationNumber}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ fontSize: '10px', padding: '3px', border: "1px dashed black" }}> {row.employeeName}</TableCell>
                                    <TableCell component="th" scope="row" align="center" style={{ fontSize: '10px', padding: '3px', border: "1px dashed black" }}> {new Date(row.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}</TableCell>
                                    <TableCell component="th" scope="row" align="center" style={{ fontSize: '10px', padding: '3px', border: "1px dashed black" }}> {row.employeeSubCategoryName}</TableCell>
                                    <TableCell component="th" scope="row" align="center" style={{ fontSize: '10px', padding: '3px', border: "1px dashed black" }}> {row.gangName}</TableCell>
                                    <TableCell component="th" scope="row" align="center" style={{ fontSize: '10px', padding: '3px', border: "1px dashed black" }}> {row.isActive}</TableCell>
                                    <TableCell component="th" scope="row" align="center" style={{ fontSize: '10px', padding: '3px', border: "1px dashed black" }}> {row.convertedEmployeeBiometricData && (<img src={row.convertedEmployeeBiometricData} width="75" height="100"></img>)}</TableCell>
                                </TableRow>
                            )
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        );
    }
}






