import React from "react";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import tokenService from '../../../../utils/tokenDecoder';
import moment from 'moment';
import { Box, TableContainer, Chip } from "@material-ui/core";
import CircleIcon from '@mui/icons-material/Circle';

export default class ComponentToPrint extends React.Component {
    render() {
        const searchData = this.props.searchData;
        const reportData = this.props.attendanceData;
        const employeeCount = this.props.employeeCount;
        const attendanceDataOne = this.props.attendanceDataOne;
        const transCount = this.props.transCount;
        const genCount = this.props.genCount;
        const cashCount = this.props.cashCount;
        const susCount = this.props.susCount;

        return (
            <div>
                <style>
                    {`
        @page {
            size: A4 protrait;
            margin-top: 0.5in;
            margin-bottom: 0.5in;
            margin-right: 0.5in;
            margin-left: 0.5in;
            transform-origin: top left; /* Set origin to top left corner */
        }
    `}
                </style>
                <h3><left><u>Daily Attendance (Non-Plucker)</u></left></h3>
                <br />
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><left><b>Business Division: </b> {searchData.groupName}</left></div>
                    <div className="col"><left><b>Location: </b> {searchData.gardenName == undefined ? "All Locations" : searchData.gardenName}</left></div>
                    <div className="col"><left><b>Sub-Division: </b> {searchData.costCenterName == undefined ? "All Sub Divisions" : searchData.costCenterName}</left></div>
                    <div className="col"><left><b>Pay Point: </b> {searchData.payPointName == undefined ? "All Paypoints" : searchData.payPointName}</left></div>
                    <div className="col"><left><b>Product: </b> {searchData.productName == undefined ? "All Products" : searchData.productName}</left></div>
                    <div className="col"><left><b>Employee Category: </b> {searchData.empTypeID == "" ? 'All Employee Types' : searchData.empTypeID}</left></div>
                    <div className="col"><left><b>Task Type: </b> {searchData.taskTypeID == "" ? 'All Task Types' : searchData.taskTypeID}</left></div>
                    <div className="col"><left><b>Work Type: </b> {searchData.jobType}</left></div>
                    <div className="col"><left><b>Status: </b> {searchData.status}</left></div>
                    <div className="col"><left><b>Sick Leave: </b> {searchData.taskSickLeave}</left></div>
                    <div className="col"><left><b>Date: </b> {moment(searchData.date).format('YYYY/MM/DD, hh:mm:ss a')} </left></div>
                </div>
                <br />
                <Box minWidth={1000}>
                    <Chip
                        icon={<CircleIcon
                            fontSize='small' />}
                        label={"Total Employee Count: " + employeeCount}
                        color="secondary"
                        variant="outlined"
                    />
                    &nbsp; &nbsp;
                    <Chip
                        icon={<CircleIcon
                            fontSize='small' color='success' />}
                        label={"G : " + genCount}
                        style={{ color: "green", fontStyle: "bold", borderColor: "green" }}
                        variant="outlined"
                    />
                    &nbsp; &nbsp;
                    <Chip
                        icon={<CircleIcon
                            fontSize='small' color='error' />}
                        label={"C : " + cashCount}
                        style={{ color: "red", fontStyle: "bold", borderColor: "red" }}
                        variant="outlined"
                    />
                    &nbsp; &nbsp;
                    <Chip
                        icon={<CircleIcon
                            fontSize='small' style={{ color: "orange" }} />}
                        label={"S : " + susCount}
                        style={{ color: "orange", fontStyle: "bold", borderColor: "orange" }}
                        variant="outlined"
                    />
                    &nbsp; &nbsp;
                    <Chip
                        icon={<CircleIcon
                            fontSize='small' />}
                        label={"Transaction Count: " + transCount}
                        color="secondary"
                        variant="outlined"
                    />
                    &nbsp; &nbsp;
                    <Chip
                        icon={<CircleIcon fontSize='small' />}
                        label={"Record: " + attendanceDataOne.length}
                        color="secondary"
                        style={{ position: 'absolute', right: 15 }}
                        variant="outlined"
                    />
                    <br>
                    </br>
                    <br>
                    </br>
                    <TableContainer>
                        <Table aria-label="simple table" size='small'>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px', padding: '3px' }}>Reg. No</TableCell>
                                    <TableCell align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px', padding: '3px' }}>Emp.Name</TableCell>
                                    <TableCell align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px', padding: '3px' }}>Code</TableCell>
                                    <TableCell align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', width: '150px', fontSize: '12px', padding: '3px' }}>Kamjari</TableCell>
                                    <TableCell align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px', padding: '3px' }}>W/Type</TableCell>
                                    <TableCell align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px', padding: '3px' }}>Field</TableCell>
                                    <TableCell align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px', padding: '3px' }}>Target</TableCell>
                                    <TableCell align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px', padding: '3px', paddingRight: '20px' }}>Actual</TableCell>
                                    <TableCell align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px', padding: '3px' }}>In Time</TableCell>
                                    <TableCell align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px', padding: '3px' }}>Out Time</TableCell>
                                    <TableCell align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '12px', padding: '3px' }}>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {reportData.map((data, i) => {
                                    const sortedDetails = data.details.sort((a, b) => a.registrationNumber.localeCompare(b.registrationNumber));
                                    return (
                                        <React.Fragment key={i}>
                                            <TableRow>
                                                <TableCell colSpan={12} component="th" scope="row" align="left" style={{ fontWeight: 'bolder', color: 'green', borderBottom: '1px solid black', fontSize: '12px', padding: '3px' }}>Pay Point: {data.payPointName} <div>Category: {data.employeeSubCategoryName}</div></TableCell>
                                            </TableRow>
                                            {sortedDetails.map((row, k) => {
                                                return (
                                                    <TableRow key={`${i}-${k}`}>
                                                        <TableCell component="th" scope="row" align="left" style={{ borderBottom: "1px dashed black", fontSize: '12px', padding: '3px' }}> {row.registrationNumber}</TableCell>
                                                        <TableCell component="th" scope="row" align="left" style={{ borderBottom: "1px dashed black", fontSize: '12px', padding: '3px' }}> {row.firstName}</TableCell>
                                                        <TableCell component="th" scope="row" align="left" style={{ borderBottom: "1px dashed black", fontSize: '12px', padding: '3px' }}> {row.taskCode}</TableCell>
                                                        <TableCell component="th" scope="row" align="left" style={{ borderBottom: "1px dashed black", fontSize: '12px', padding: '3px' }}> {row.taskName}</TableCell>
                                                        <TableCell component="th" scope="row" align="center" style={{ fontWeight: 'bold', borderBottom: "1px dashed black", fontSize: '12px', padding: '3px', color: row.jobType == 'G' ? 'green' : row.jobType == 'C' ? 'red' : 'inherit' }}> {row.jobType}</TableCell>
                                                        <TableCell component="th" scope="row" align="left" style={{ borderBottom: "1px dashed black", fontSize: '12px', padding: '3px' }}> {row.fieldName == null ? '-' : row.fieldName}</TableCell>
                                                        <TableCell component="th" scope="row" align="center" style={{ borderBottom: "1px dashed black", fontSize: '12px', padding: '3px' }}> {row.assignQuntity}</TableCell>
                                                        <TableCell component="th" scope="row" align="center" style={{ borderBottom: "1px dashed black", fontSize: '12px', padding: '3px', paddingRight: '20px' }}> {row.completedQuntity}</TableCell>
                                                        <TableCell component="th" scope="row" align="left" style={{ borderBottom: "1px dashed black", fontSize: '12px', padding: '3px' }}> {row.inTime == null ? '-' : moment(row.inTime).format('HH:mm:ss A')}</TableCell>
                                                        <TableCell component="th" scope="row" align="left" style={{ borderBottom: "1px dashed black", fontSize: '12px', padding: '3px' }}> {row.outTime == null ? '-' : moment(row.outTime).format('HH:mm:ss A')}</TableCell>
                                                        <TableCell component="th" scope="row" align="left" style={{ borderBottom: "1px dashed black", fontSize: '12px', padding: '3px' }}> {row.status}</TableCell>
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
                <br />
                <div className="row pl-2 pb-4 pt-7">
                    <div className="col"><center><b>Created By: </b> {tokenService.getUserNameFromToken()}</center></div>
                    <div className="col"><center><b>Created Date: </b> {new Date().toISOString().split('T')[0]}</center></div>
                </div>
            </div>
        );
    }
}