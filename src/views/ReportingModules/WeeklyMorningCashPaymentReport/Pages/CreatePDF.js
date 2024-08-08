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
        const reportData = this.props.dailylabourData;
        const totalValues = this.props.totalValues;
        const monDate = this.props.monDate;
        const tueDate = this.props.tueDate;
        const wedDate = this.props.wedDate;
        const thuDate = this.props.thuDate;
        const friDate = this.props.friDate;
        const satDate = this.props.satDate;
        const sunDate = this.props.sunDate;
        return (
            <div>
                <h3><center><u>Weekly Morning Cash Payment Report</u></center></h3>
                <div className="row pl-2 pb-4 pt-4">
                    {/* <div className="col"><center><b>Legal Entity: </b> {searchData.groupName}</center></div> */}
                    <div className="col"><center><b>Garden: </b> {searchData.gardenName}</center></div>
                    <div className="col"><center><b>Employee Type: </b> {searchData.empTypeName === "" ? "All Employee Types" : searchData.empTypeName}</center></div>
                    <div className="col"><center><b>Duffa: </b> {searchData.gangName === "" ? "All Duffas" : searchData.gangName}</center></div>
                    <div className="col"><center><b>Book: </b> {searchData.bookID == "" ? "All Books" : searchData.bookID}</center></div>
                    {/* <div className="col"><center><b>Operator: </b> {searchData.operatorName === "" ? "All Operators" : searchData.operatorName}</center></div> */}
                    <div className="col"><center><b>From Date: </b>{searchData.fromDate}</center></div>
                    <div className="col"><center><b>To Date: </b>{searchData.toDate}</center></div>
                </div>
                <TableContainer component={Paper}>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Reg.No</TableCell>
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Emp.Name</TableCell>
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>B.FWRD</TableCell>
                                <TableCell align="center" colSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>{satDate}</TableCell>
                                <TableCell align="center" colSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>{sunDate}</TableCell>
                                <TableCell align="center" colSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>{monDate}</TableCell>
                                <TableCell align="center" colSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>{tueDate}</TableCell>
                                <TableCell align="center" colSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>{wedDate}</TableCell>
                                <TableCell align="center" colSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>{thuDate}</TableCell>
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Total Qty</TableCell>
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Net Pay</TableCell>
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Payable</TableCell>
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>C.FWRD</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Qty</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Amount</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Qty</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Amount</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Qty</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Amount</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Qty</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Amount</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Qty</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Amount</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Qty</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Amount</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reportData.map((row, i) => (
                                <TableRow key={i}
                                >
                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.registrationNumber}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.firstName}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {"0.00"}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.SatQty == 0 ? "-" : row.SatQty.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.SatAmt == 0 ? "-" : row.SatAmt.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.SunQty == 0 ? "-" : row.SunQty.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.SunAmt == 0 ? "-" : row.SunAmt.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.MonQty == 0 ? "-" : row.MonQty.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.MonAmt == 0 ? "-" : row.MonAmt.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.TueQty == 0 ? "-" : row.TueQty.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.TueAmt == 0 ? "-" : row.TueAmt.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.WedQty == 0 ? "-" : row.WedQty.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.WedAmt == 0 ? "-" : row.WedAmt.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.ThuQty == 0 ? "-" : row.ThuQty.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.ThuAmt == 0 ? "-" : row.ThuAmt.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.totalQuantity.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.totalAmount.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.payable.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.broughtForward.toFixed(2)}</TableCell>
                                </TableRow>
                            )
                            )}
                            <TableCell align={'center'} style={{ borderBottom: "none", border: "1px solid black" }}><b>Total</b></TableCell>
                            <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                            <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b>{totalValues.totalCFwd.toFixed(2)}</b></TableCell>
                            <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b>{totalValues.totalSatQty.toFixed(2)}</b></TableCell>
                            <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b>{totalValues.totalSatAmt.toFixed(2)}</b></TableCell>
                            <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b>{totalValues.totalSunQty.toFixed(2)}</b></TableCell>
                            <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b>{totalValues.totalSunAmt.toFixed(2)} </b></TableCell>
                            <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalMonQty.toFixed(2)} </b></TableCell>
                            <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalMonAmt.toFixed(2)} </b></TableCell>
                            <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalTueQty.toFixed(2)} </b></TableCell>
                            <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalTueAmt.toFixed(2)}</b></TableCell>
                            <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalWedQty.toFixed(2)} </b></TableCell>
                            <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalWedAmt.toFixed(2)}</b></TableCell>
                            <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalThuQty.toFixed(2)} </b></TableCell>
                            <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b>{totalValues.totalThuAmt.toFixed(2)}</b></TableCell>
                            <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b>{totalValues.totalQty.toFixed(2)}</b></TableCell>
                            <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b>{totalValues.totalAmt.toFixed(2)} </b></TableCell>
                            <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b>{totalValues.totalPayble.toFixed(2)} </b></TableCell>
                            <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b>{totalValues.totalBFwd.toFixed(2)} </b></TableCell>
                        </TableBody>
                    </Table>
                </TableContainer>
            </div >
        );
    }
}