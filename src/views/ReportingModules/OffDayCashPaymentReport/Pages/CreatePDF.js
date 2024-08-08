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
        const reportData = this.props.offDayCashPaymentData;
        const totalValues = this.props.totalValues;
        return (
            <div>
                <h3><center><u>Off Day Cash Payment Report - Plucking</u></center></h3>
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><center><b>Business Division: </b> {searchData.groupName}</center></div>
                    <div className="col"><center><b>Location: </b> {searchData.gardenName}</center></div>
                    <div className="col"><center><b>Sub Division: </b> {searchData.costCenterName == undefined ? "All Sub Divisions" : searchData.costCenterName}</center></div>
                    <div className="col"><center><b>Date: </b> {searchData.date} </center></div>
                    <div className="col"><center><b>Employee Type: </b> {searchData.empTypeName == "" ? "All Employee Types" : searchData.empTypeName}</center></div>
                    <div className="col"><center><b>Duffa: </b> {searchData.gangName == "" ? "All Duffas" : searchData.gangName}</center></div>
                    <div className="col"><center><b>Operator: </b> {searchData.operatorName == "" ? "All Operators" : searchData.operatorName}</center></div>
                </div>
                <TableContainer component={Paper}>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Reg.No</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Emp.Name</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Emp.Type</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>B.FWRD</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Quantity(Kg)</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Total Amount</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Net Amount</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Paid Amount</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>C.FWRD</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reportData.map((row, i) => (
                                <TableRow key={i}>
                                    <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black" }}> {row.registrationNumber}</TableCell>
                                    <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black" }}> {row.employeeName}</TableCell>
                                    <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black" }}> {row.employeeType}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.broughtForward.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.quantity.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.totalAmount.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.netAmount.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.paidAmount.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.carryForward.toFixed(2)}</TableCell>
                                </TableRow>
                            )
                            )}
                        </TableBody>
                        <TableRow>
                            <TableCell align={'center'} style={{ borderBottom: "none", border: "1px solid black" }}><b>Total</b></TableCell>
                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                            </TableCell>
                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                            </TableCell>
                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                <b> {totalValues.totalBroughtForward.toFixed(2)} </b>
                            </TableCell>
                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                <b> {totalValues.totalQuantity.toFixed(2)} </b>
                            </TableCell>
                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                <b> {totalValues.totalOfTotalAmount.toFixed(2)} </b>
                            </TableCell>
                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                <b> {totalValues.totalNetAmount.toFixed(2)} </b>
                            </TableCell>
                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                <b> {totalValues.totalPaidAmount.toFixed(2)} </b>
                            </TableCell>
                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                <b> {totalValues.totalCarryForward.toFixed(2)} </b>
                            </TableCell>
                        </TableRow>
                    </Table>
                </TableContainer>
            </div>
        );
    }
}