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
                <h3><center><u>Daily Cash Job Payment Report</u></center></h3>
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><center><b>Legal Entity: </b> {searchData.groupName}</center></div>
                    <div className="col"><center><b>Garden: </b> {searchData.gardenName}</center></div>
                    <div className="col"><center><b>Cost Center: </b> {searchData.costCenterName == undefined ? "All Cost Centers" : searchData.costCenterName}</center></div>
                    <div className="col"><center><b>Date: </b> {searchData.date} </center></div>
                </div>
                <TableContainer component={Paper}>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Reg.No</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Emp.Name</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Emp.Type</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Job</TableCell>
                                <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Qty(KG)</TableCell>
                                <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Gross(BDT)</TableCell>
                                <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Net(BDT)</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reportData.map((row, i) => (
                                <TableRow key={i}>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.registrationNumber}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.employeeName}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.employeeTypeName}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.jobName}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.completedQuantity.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.grossAmount.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.totalAmount.toFixed(2)}</TableCell>
                                </TableRow>
                            )
                            )}
                        </TableBody>
                        <TableRow>
                            <TableCell align={'center'} style={{ borderBottom: "none", border: "1px solid black" }}><b>Total</b></TableCell>
                            <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                            <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                            <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                <b> {totalValues.totalQuantity.toFixed(2)} </b>
                            </TableCell>
                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                <b> {totalValues.totalgrossAmount.toFixed(2)} </b>
                            </TableCell>
                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                <b> {totalValues.totalAmount.toFixed(2)} </b>
                            </TableCell>
                        </TableRow>
                    </Table>
                </TableContainer>
            </div>
        );
    }
}