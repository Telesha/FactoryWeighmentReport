import React from "react";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import moment from "moment";
import LineWeightIcon from '@material-ui/icons/LineWeight';

export default class ComponentToPrint extends React.Component {
    render() {
        const searchData = this.props.searchData;
        const supplementaryDetailsData = this.props.supplementaryDetailsData;
        const kethLandQty = this.props.kethLandQty;
        const getAge = birthDate => Math.floor((new Date() - new Date(birthDate).getTime()) / 3.15576e+10)
        return (
            <div>
                <style>
                    {`
        @page {
            size: A4 portrait;
            margin-top: 0.75in;
            margin-bottom: 0.75in;
            margin-right: 0.4in;
            margin-left: 0.4in;
        }
    `}
                </style>
                <h2><u>Family Details</u></h2>
                <br />
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><b>Business Division: </b> {searchData.groupName}</div>
                    <div className="col"><b>Location: </b> {searchData.estateName}</div>
                    <div className="col"><b>Sub Division: </b> {searchData.divisionName == undefined ? 'All Sub Divisions' : searchData.divisionName}</div>
                    <div className="col"><b>Employee Category: </b> {searchData.employeeSubCategoryName == undefined ? 'All Sub Divisions' : searchData.employeeSubCategoryName}</div>
                    <br />
                    <Chip
                        icon={<LineWeightIcon />}
                        label={"KethLand Quantity: " + kethLandQty}
                        color="secondary"
                        variant="outlined"
                    />
                </div>
                <br />
                <Box minWidth={1050} style={{ margin: 'auto' }}>
                    <TableContainer>
                        <Table aria-label="simple table" size='small'>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="left" style={{ fontSize: "10px", fontWeight: "bold", border: "1px solid black", padding: '3px', width: '250px' }}>Supplimentary Name</TableCell>
                                    <TableCell align="left" style={{ fontSize: "10px", fontWeight: "bold", border: "1px solid black", padding: '3px' }}>Gender</TableCell>
                                    <TableCell align="left" style={{ fontSize: "10px", fontWeight: "bold", border: "1px solid black", padding: '3px', width: '100px' }}>Relationship</TableCell>
                                    <TableCell align="left" style={{ fontSize: "10px", fontWeight: "bold", border: "1px solid black", padding: '3px', width: '100px' }}>Date Of Birth</TableCell>
                                    <TableCell align="left" style={{ fontSize: "10px", fontWeight: "bold", border: "1px solid black", padding: '3px' }}>Age</TableCell>
                                    <TableCell align="left" style={{ fontSize: "10px", fontWeight: "bold", border: "1px solid black", padding: '3px' }}>NID / BIR</TableCell>
                                    <TableCell align="left" style={{ fontSize: "10px", fontWeight: "bold", border: "1px solid black", padding: '3px', width: '100px' }}>Working Type</TableCell>
                                    <TableCell align="left" style={{ fontSize: "10px", fontWeight: "bold", border: "1px solid black", padding: '3px', width: '100px' }}>Employee No.</TableCell>
                                    <TableCell align="left" style={{ fontSize: "10px", fontWeight: "bold", border: "1px solid black", padding: '3px', width: '100px' }}>Ration</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {supplementaryDetailsData.map((data, i) => {
                                    return (
                                        <React.Fragment key={i}>
                                            <TableRow>
                                                <TableCell colSpan={2} component="th" scope="row" align="left" style={{ fontWeight: 'bolder', color: 'blue', borderLeft: '1px solid black', borderBottom: '1px dashed black', padding: '3px' }}>Registration Number: {data.registrationNumber}</TableCell>
                                                <TableCell colSpan={4} component="th" scope="row" align="left" style={{ fontWeight: 'bolder', color: 'blue', borderBottom: '1px dashed black', padding: '3px' }}> Employee Name: {data.fullName} </TableCell>
                                                <TableCell colSpan={3} component="th" scope="row" align="left" style={{ fontWeight: 'bolder', color: 'blue', borderRight: "1px solid black", borderBottom: '1px dashed black', padding: '3px' }}> Kethland : {data.area} {data.areaType == 1 ? "Decimal" : "Khair"} </TableCell>
                                            </TableRow>
                                            {data.detailsx.map((detail, k) => {
                                                return (
                                                    <TableRow key={`${i}-${k}`}>
                                                        <TableCell component="th" scope="row" align="left" style={{ fontSize: "10px", border: "1px dashed black", borderLeft: "1px solid black", padding: '3px' }}> {detail.supplimentaryName}</TableCell>
                                                        <TableCell component="th" scope="row" align="left" style={{ fontSize: "10px", border: "1px dashed black", borderLeft: "1px dashed black", padding: '3px' }}> {detail.gender == 1 ? 'Male' : detail.gender == 2 ? 'Female' : 'Other'}</TableCell>
                                                        <TableCell component="th" scope="row" align="left" style={{ fontSize: "10px", border: "1px dashed black", borderLeft: "1px dashed black", padding: '3px' }}> {detail.relationship}</TableCell>
                                                        <TableCell component="th" scope="row" align="left" style={{ fontSize: "10px", border: "1px dashed black", borderLeft: "1px dashed black", padding: '3px' }}> {moment(detail.dateOfBirth).format('YYYY-MM-DD')}</TableCell>
                                                        <TableCell component="th" scope="row" align="left" style={{ fontSize: "10px", border: "1px dashed black", borderLeft: "1px dashed black", padding: '3px' }}> {getAge(moment(detail.dateOfBirth).format('YYYY-MM-DD'))}</TableCell>
                                                        <TableCell component="th" scope="row" align="left" style={{ fontSize: "10px", border: "1px dashed black", borderLeft: "1px dashed black", padding: '3px' }}> {detail.nic == null ? '-' : detail.nic}</TableCell>
                                                        <TableCell component="th" scope="row" align="left" style={{ fontSize: "10px", border: "1px dashed black", borderLeft: "1px dashed black", padding: '3px' }}> {detail.workingType == 1 ? 'Employee' : detail.workingType == 2 ? 'Dependant' : detail.workingType == 3 ? 'Family Member' : 'Other'}</TableCell>
                                                        <TableCell component="th" scope="row" align="left" style={{ fontSize: "10px", border: "1px dashed black", borderLeft: "1px dashed black", padding: '3px' }}> {detail.emplhoyeeNumber == null ? '-' : detail.employeeNumber}</TableCell>
                                                        <TableCell component="th" scope="row" align="left" style={{ fontSize: "10px", border: "1px dashed black", borderLeft: "1px dashed black", borderRight: "1px solid black", padding: '3px' }}> {detail.isRation == 1 ? 'Yes' : 'No'}</TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </React.Fragment>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </div>
        );
    }
}