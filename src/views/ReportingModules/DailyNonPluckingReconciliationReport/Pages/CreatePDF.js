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
                <style>
                    {`
        @page {
            size: A4 portrait;
            margin-top: 0.75in;
            margin-bottom: 0.75in;
            margin-right: 0.3in;
            margin-left: 0.3in;
        }
    `}
                </style>
                <h3><left><u>Daily Non Plucking Reconciliation Report</u></left></h3>
                <br></br>
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><left><b>Location: </b> {searchData.gardenName}</left></div>
                    <div className="col"><left><b>Sub Division: </b> {searchData.costCenterName}</left></div>
                    {searchData.registrationNumber == '' ? null
                        : <div className="col"><left><b>Reg. No.: </b> {searchData.registrationNumber}</left></div>}
                    <div className="col"><left><b>Employee Sub Category: </b> {searchData.empTypeID == "" ? 'All Employee Types' : searchData.empTypeID}</left></div>
                    <div className="col"><left><b>Sections: </b> {searchData.fieldID == "" ? 'All Sections' : searchData.fieldID}</left></div>
                    <div className="col"><left><b>Sirder: </b> {searchData.sirderID == "" ? 'All Sirders' : searchData.sirderID}</left></div>
                    <div className="col"><left><b>Operator: </b> {searchData.operatorID == "" ? 'All Operators' : searchData.operatorID}</left></div>
                    <div className="col"><left><b>Task: </b> {searchData.taskID == "" ? 'All Tasks' : searchData.taskID}</left></div>
                    <div className="col"><left><b>Status: </b> {searchData.statusID == "" ? 'All Status' : searchData.statusID}</left></div>
                    <div className="col"><left><b>Date: </b> {searchData.date} </left></div>
                </div>
                <br></br>
                <Table aria-label="simple table" size="small">
                    <TableRow style={{ border: "2px solid black" }}>
                        <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", padding: '3px' }}>Kamjari</TableCell>
                        <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", padding: '3px' }}>Reg. No.</TableCell>
                        <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", padding: '3px' }}>Emp.Name</TableCell>
                        <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", padding: '3px' }}>Measuring unit</TableCell>
                        <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", padding: '3px' }}>Measuring Quantity</TableCell>
                        <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", padding: '3px' }}>Mandays Count</TableCell>
                        <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", padding: '3px' }}>Amount</TableCell>
                        <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", padding: '3px' }}>BCS Allowance</TableCell>
                        <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", padding: '3px' }}>Extra Payment</TableCell>
                        <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", padding: '3px' }}>Extra Hazira</TableCell>
                        <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", padding: '3px' }}>Addition</TableCell>
                        <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", padding: '3px' }}>Deduction</TableCell>
                        <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", padding: '3px' }}>Total Amount</TableCell>
                    </TableRow>
                    <TableBody>
                        {reportData.map((row, i) => (
                            <TableRow style={{ border: "2px dashed black" }} key={i}>
                                <TableCell component="th" scope="row" align="left" style={{ border: "2px dashed black", padding: '3px' }}> {row.taskName}</TableCell>
                                <TableCell component="th" scope="row" align="left" style={{ border: "2px dashed black", padding: '3px' }}> {row.registrationNumber}</TableCell>
                                <TableCell component="th" scope="row" align="left" style={{ border: "2px dashed black", padding: '3px' }}> {row.employeeName}</TableCell>
                                <TableCell component="th" scope="row" align="left" style={{ border: "2px dashed black", padding: '3px' }}> {row.measuringunit}</TableCell>
                                <TableCell component="th" scope="row" align="right" style={{ border: "2px dashed black", padding: '3px' }}> {row.measuringQuantity}</TableCell>
                                <TableCell component="th" scope="row" align="right" style={{ border: "2px dashed black", padding: '3px' }}> {row.mandaysCount}</TableCell>
                                <TableCell component="th" scope="row" align="right" style={{ border: "2px dashed black", padding: '3px' }}> {row.amount}</TableCell>
                                <TableCell component="th" scope="row" align="right" style={{ border: "2px dashed black", padding: '3px' }}> {row.bcsAllowance}</TableCell>
                                <TableCell component="th" scope="row" align="right" style={{ border: "2px dashed black", padding: '3px' }}> {row.extraPayment}</TableCell>
                                <TableCell component="th" scope="row" align="right" style={{ border: "2px dashed black", padding: '3px' }}> {row.extraHazira}</TableCell>
                                <TableCell component="th" scope="row" align="right" style={{ border: "2px dashed black", padding: '3px' }}> {row.addition}</TableCell>
                                <TableCell component="th" scope="row" align="right" style={{ border: "2px dashed black", padding: '3px' }}> {row.deduction}</TableCell>
                                <TableCell component="th" scope="row" align="right" style={{ border: "2px dashed black", padding: '3px' }}> {row.totalAmount}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableRow>
                        <TableCell align={'center'} colSpan={5} style={{ borderBottom: "none", border: "2px dashed black", padding: '3px' }}><b>Grand Total</b></TableCell>
                        <TableCell align={'right'} style={{ borderBottom: "none", border: "2px dashed black", padding: '3px' }}>
                            <b> {totalValues.totalMandayCount} </b>
                        </TableCell>
                        <TableCell align={'right'} style={{ borderBottom: "none", border: "2px dashed black", padding: '3px' }}>
                            <b> {totalValues.totalAmount.toFixed(2)} </b>
                        </TableCell>
                        <TableCell align={'right'} style={{ borderBottom: "none", border: "2px dashed black", padding: '3px' }}>
                            <b> {totalValues.totalBCSAllowance.toFixed(2)} </b>
                        </TableCell>
                        <TableCell align={'right'} style={{ borderBottom: "none", border: "2px dashed black", padding: '3px' }}>
                            <b> {totalValues.totalExtraPayment.toFixed(2)} </b>
                        </TableCell>
                        <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "2px dashed black", padding: '3px' }}>
                            <b> {totalValues.totalExtraHazira.toFixed(2)} </b>
                        </TableCell>
                        <TableCell align={'right'} style={{ borderBottom: "none", border: "2px dashed black", padding: '3px' }}>
                            <b> {totalValues.totalAddition.toFixed(2)} </b>
                        </TableCell>
                        <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "2px dashed black", padding: '3px' }}>
                            <b> {totalValues.totalDeduction.toFixed(2)} </b>
                        </TableCell>
                        <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "2px dashed black", padding: '3px' }}>
                            <b> {totalValues.totalTotalAmount.toFixed(2)} </b>
                        </TableCell>
                    </TableRow>
                </Table>
                <br></br>
                <div className="row pl-2 pb-4 pt-7">
                    <div className="col"><center><b>Created By: </b> {tokenService.getUserNameFromToken()}</center></div>
                    <div className="col"><center><b>Created Date: </b> {new Date().toISOString().split('T')[0]}</center></div>
                </div>
            </div>
        );
    }
}