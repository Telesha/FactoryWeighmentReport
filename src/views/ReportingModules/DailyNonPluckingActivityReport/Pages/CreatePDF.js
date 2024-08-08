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
        const reportData = this.props.dailyNonPluckingPaymentData;
        const totalValues = this.props.totalValues;
        return (
            <div>
                <h3><center><u>Daily Non Plucking Activity Report</u></center></h3>
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><center><b>Garden: </b> {searchData.gardenName}</center></div>
                    <div className="col"><center><b>Division: </b> {searchData.costCenterName == undefined ? "All Cost Divisions" : searchData.costCenterName}</center></div>
                    <div className="col"><center><b>Employee Type: </b> {searchData.empTypeName == "" ? "All Employee Types" : searchData.empTypeName}</center></div>
                    <div className="col"><center><b>Duffa: </b> {searchData.gangName == "" ? "All Duffas" : searchData.gangName}</center></div>
                    <div className="col"><center><b>Operator: </b> {searchData.operatorName == "" ? "All Operators" : searchData.operatorName}</center></div>
                    <div className="col"><center><b>Sirder: </b> {searchData.sirderName == "" ? "All Sirders" : searchData.sirderName}</center></div>
                    <div className="col"><center><b>Date: </b> {searchData.date} </center></div>
                </div>
                <TableContainer component={Paper} style={{ width: '100%', padding: '1rem' }}>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Date</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Operator</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Emp.ID</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Emp.Name</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Emp.Type</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Duffa</TableCell>
                                <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Amount</TableCell>
                                <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>BCS Allowance</TableCell>
                                <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Extra Payment</TableCell>
                                <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Extra Hazira</TableCell>
                                <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Total Amount</TableCell>
                                <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Hazira Count</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reportData.map((row, i) => (
                                <TableRow key={i}>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.date.split('T')[0]}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.operatorName}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.registrationNumber}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.firstName}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.employeeTypeName}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.gangName}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.base.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.allowance.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.gardenAllowance.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.ot.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.totalAmount.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.taskType}</TableCell>
                                </TableRow>
                            )
                            )}
                        </TableBody>
                        <TableRow>
                            <TableCell align={'center'} style={{ borderBottom: "none", border: "1px solid black" }}><b>Total</b></TableCell>
                            <TableCell style={{ borderBottom: "none", border: "1px solid black" }} ></TableCell>
                            <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                            <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                            <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                            <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                            <TableCell align={'right'} style={{ borderBottom: "none", border: "1px solid black" }}>
                                <b> {totalValues.totalbase.toFixed(2)} </b>
                            </TableCell>
                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                <b> {totalValues.totalBCSAllowance.toFixed(2)} </b>
                            </TableCell>
                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                <b> {totalValues.totalExtraPayment.toFixed(2)} </b>
                            </TableCell>
                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                <b> {totalValues.totalExtraHazira.toFixed(2)} </b>
                            </TableCell>
                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                <b> {totalValues.totalTotalAmount.toFixed(2)} </b>
                            </TableCell>
                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                <b> {totalValues.totalHaziraCount} </b>
                            </TableCell>
                        </TableRow>
                    </Table>
                </TableContainer>
            </div>
        );
    }
}