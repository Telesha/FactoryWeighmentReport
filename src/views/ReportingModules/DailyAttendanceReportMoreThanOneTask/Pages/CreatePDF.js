import React from "react";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import tokenService from '../../../../utils/tokenDecoder';
import moment from 'moment';

export default class ComponentToPrint extends React.Component {
    render() {
        const searchData = this.props.searchData;
        const reportData = this.props.attendanceData;
        const totalValues = this.props.totalValues;
        return (
            <div>
                <h3><center><u>Daily Attendance Report : More Than One Task</u></center></h3>
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><center><b>Location : </b> {searchData.gardenName}</center></div>
                    <div className="col"><center><b>Pay Point: </b> {searchData.payPoint}</center></div>
                    <div className="col"><center><b>Employee Type: </b> {searchData.empTypeID == "" ? 'All Employee Types' : searchData.empTypeID}</center></div>
                    <div className="col"><center><b>Duffa: </b> {searchData.gangID == "" ? 'All Duffas' : searchData.gangID}</center></div>
                    <div className="col"><center><b>Field: </b> {searchData.fieldID == "" ? 'All Fields' : searchData.fieldID}</center></div>
                    <div className="col"><center><b>Operator: </b> {searchData.operatorID == "" ? 'All Operators' : searchData.operatorID}</center></div>
                    <div className="col"><center><b>Task: </b> {searchData.taskID == "" ? 'All Tasks' : searchData.taskID}</center></div>
                    <div className="col"><center><b>Date: </b> {searchData.date} </center></div>
                </div>
                <Table aria-label="simple table">
                    <TableHead>
                        <TableRow style={{ border: "2px solid black" }}>
                            <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", width: "0.5px" }}>Emp.ID</TableCell>
                            <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", width: "0.5px" }}>Emp.Name</TableCell>
                            <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", width: "0.5px" }}>Field</TableCell>
                            <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", width: "0.5px" }}>Operator</TableCell>
                            <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", width: "100px" }}>Kamjari</TableCell>
                            <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", width: "0.5px" }}>Job Type</TableCell>
                            <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", width: "0.5px" }}>Completed Task</TableCell> 
                            <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", width: "0.5px" }}>Target</TableCell>
                            <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", width: "0.5px" }}>Actual</TableCell>                          
                            <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", width: "1px" }}>Amount</TableCell>
                            <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", width: "1px" }}>Allowance</TableCell>
                            <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", width: "1px" }}>Addition</TableCell>
                            <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", width: "1px" }}>Deduction</TableCell>
                            <TableCell align="center" style={{ fontSize: "18px", fontWeight: "bold", border: "2px solid black", width: "100px" }}>Total Amount</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {reportData.map((row, i) => (
                            <TableRow style={{ border: "2px solid black" }} key={i}>
                                <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.registrationNumber}</TableCell>
                                <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.firstName}</TableCell>
                                <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.fieldName}</TableCell>
                                <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.operatorName}</TableCell>
                                <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.taskName}</TableCell>
                                <TableCell component="th" scope="row" align="center" style={{ border: "2px solid black" }}> {(row.jobTypeID == 1 ? 'General' : row.jobTypeID == 2 ? 'Cash' : '-')}</TableCell>
                                <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.completedTask}</TableCell>                 
                                <TableCell component="th" scope="row" align="right" style={{ border: "2px solid black" }} > {(row.assignQuntity)} </TableCell> 
                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }} > {(row.quntity)} </TableCell>   
                                <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.amount == 0 ? '-' : row.amount.toFixed(2)}</TableCell>
                                <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.allowance == 0 ? '-' : row.allowance.toFixed(2)}</TableCell>
                                <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.totalAddition == 0 ? '-' : row.totalAddition}</TableCell>
                                <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.totalDeduction == 0 ? '-' : row.totalDeduction}</TableCell>
                                <TableCell component="th" scope="row" align="right" style={{ fontSize: "18px", border: "2px solid black" }}> <b>{row.totalAmount == 0 ? '-' : row.totalAmount.toFixed(2)}</b></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableRow>
                        <TableCell align={'center'} colSpan={9} style={{ borderBottom: "none", border: "2px solid black" }}><b>Total</b></TableCell>
                        <TableCell align={'center'} style={{ borderBottom: "none", border: "2px solid black" }}>
                            <b> {totalValues.totalOfAmount == 0 ? '-' : totalValues.totalOfAmount.toFixed(2)} </b>
                        </TableCell>
                        <TableCell style={{ borderBottom: "none", border: "2px solid black" }}>
                            <b> {totalValues.totalAllowance == 0 ? '-' : totalValues.totalAllowance.toFixed(2)} </b>
                        </TableCell>
                        <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "2px solid black" }}>
                            <b> {totalValues.totalAddition == 0 ? '-' : totalValues.totalAddition.toFixed(2)} </b>
                        </TableCell>
                        <TableCell style={{ borderBottom: "none", border: "2px solid black" }}>
                            <b> {totalValues.totalDeduction == 0 ? '-' : totalValues.totalDeduction.toFixed(2)} </b>
                        </TableCell>
                        <TableCell align={'right'} style={{ fontSize: "18px", borderBottom: "none", border: "2px solid black" }}>
                            <b> {totalValues.totalOfTotalAmount == 0 ? '-' : totalValues.totalOfTotalAmount.toFixed(2)} </b>
                        </TableCell>
                    </TableRow>
                </Table>

                <br></br>
                <br></br>
                <br></br>
                <div align="center">
                    <TableRow>
                        <TableCell
                            component="th"
                            scope="col"
                            align="left"
                            style={{ border: '2px solid black', width: 300, height: 70, borderBottom: "none", borderRight: "none" }}
                        >
                            {' '}
                        </TableCell>
                        <TableCell
                            component="th"
                            scope="col"
                            align="left"
                            style={{ border: '2px solid black', width: 300, height: 70, borderBottom: "none", borderRight: "none" }}
                        >
                            {' '}
                        </TableCell>
                        <TableCell
                            component="th"
                            scope="col"
                            align="left"
                            style={{ border: '2px solid black', width: 300, height: 70, borderBottom: "none", borderRight: "none" }}
                        >
                            {' '}
                        </TableCell>
                        <TableCell
                            component="th"
                            scope="col"
                            align="left"
                            style={{ border: '2px solid black', width: 300, height: 70, borderBottom: "none", borderRight: "none" }}
                        >
                            {' '}
                        </TableCell>
                        <TableCell
                            component="th"
                            scope="col"
                            align="left"
                            style={{ border: '2px solid black', width: 300, height: 70, borderBottom: "none" }}
                        >
                            {' '}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell
                            component="th"
                            scope="col"
                            align="left"
                            style={{ border: '2px solid black', width: 300, borderRight: "none" }}
                        >
                            {'Operator       : '}
                        </TableCell>
                        <TableCell
                            component="th"
                            scope="col"
                            align="left"
                            style={{ border: '2px solid black', width: 300, borderRight: "none" }}
                        >
                            {'Prepared By       : '}
                        </TableCell>
                        <TableCell
                            component="th"
                            scope="col"
                            align="left"
                            style={{ border: '2px solid black', width: 300, borderRight: "none" }}
                        >
                            {'HTC       : '}
                        </TableCell>
                        <TableCell
                            component="th"
                            scope="col"
                            align="left"
                            style={{ border: '2px solid black', width: 300, borderRight: "none" }}
                        >
                            {'Asst/Dy Manager       : '}
                        </TableCell>
                        <TableCell
                            component="th"
                            scope="col"
                            align="left"
                            style={{ border: '2px solid black', width: 300 }}
                        >
                            {'General Manager       : '}
                        </TableCell>
                    </TableRow>
                    <br></br>
                    <div className="row pl-2 pb-4 pt-7">
                        <div className="col"><center><b>Created By: </b> {tokenService.getUserNameFromToken()}</center></div>
                        <div className="col"><center><b>Created Date: </b> {new Date().toISOString().split('T')[0]}</center></div>
                    </div>

                </div>
            </div>
        );
    }
}