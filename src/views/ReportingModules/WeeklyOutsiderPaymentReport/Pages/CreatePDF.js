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
                <h3><center><u>Weekly Outsider Payment Report</u></center></h3>
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><center><b>Business Division: </b> {searchData.groupName}</center></div>
                    <div className="col"><center><b>Location: </b> {searchData.gardenName}</center></div>
                    <div className="col"><center><b>Duffa: </b> {searchData.gangName === undefined ? "All Duffas" : searchData.gangName}</center></div>
                    <div className="col"><center><b>From Date: </b> {searchData.fromDate.toLocaleString()}</center></div>
                    <div className="col"><center><b>To Date: </b> {searchData.toDate.toLocaleString()}</center></div>
                    <div className="col"><center><b>Reg.No: </b> {searchData.registrationNumber == "" ? "-" : searchData.registrationNumber}</center></div>
                    <div className="col"><center><b>Book Number: </b> {searchData.bookNumber == "" ? "-" : searchData.bookNumber}</center></div>
                </div>
                <TableContainer component={Paper}>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Reg.No</TableCell>
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Emp.Name</TableCell>
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Emp.Type</TableCell>
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Duffa</TableCell>
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>B.FWRD</TableCell>
                                <TableCell align="center" colSpan="8" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Wages</TableCell>
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Ration</TableCell>
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Net Pay</TableCell>
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Payable</TableCell>
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>C.FWRD</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Sat {satDate}</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Sun {sunDate}</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Mon {monDate}</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Tue {tueDate}</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Wed {wedDate}</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Thu {thuDate}</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Fri {friDate}</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Total</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reportData.map((row, i) => (
                                <TableRow key={i}
                                >
                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.registrationNumber}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.firstName}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.employeeTypeName}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.duffa}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.cfAmount.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.SatTotal == 0 ? "-" : row.SatTotal.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.SunTotal == 0 ? "-" : row.SunTotal.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.MonTotal == 0 ? "-" : row.MonTotal.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.TueTotal == 0 ? "-" : row.TueTotal.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.WedTotal == 0 ? "-" : row.WedTotal.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.ThuTotal == 0 ? "-" : row.ThuTotal.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.FriTotal == 0 ? "-" : row.FriTotal.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.wagesTotal.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.ration.toFixed(2)} </TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.totalNet.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.payable.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.broughtForward.toFixed(2)}</TableCell>
                                </TableRow>
                            )
                            )}
                            <TableCell align={'center'} style={{ borderBottom: "none", border: "1px solid black" }}><b>Total</b></TableCell>
                            <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                            <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                            <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                            <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b>{totalValues.totalCFwd.toFixed(2)}</b></TableCell>
                            <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b>{totalValues.totalSatAmt.toFixed(2)}</b></TableCell>
                            <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b>{totalValues.totalSunAmt.toFixed(2)}</b></TableCell>
                            <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b>{totalValues.totalMonAmt.toFixed(2)}</b></TableCell>
                            <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b>{totalValues.totalTueAmt.toFixed(2)} </b></TableCell>
                            <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalWedAmt.toFixed(2)} </b></TableCell>
                            <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalThuAmt.toFixed(2)} </b></TableCell>
                            <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalFriAmt.toFixed(2)} </b></TableCell>
                            <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b>{totalValues.totalAmt.toFixed(2)} </b></TableCell>
                            <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalRation.toFixed(2)} </b></TableCell>
                            <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b>{totalValues.totalNet.toFixed(2)} </b></TableCell>
                            <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b>{totalValues.totalPayble.toFixed(2)} </b></TableCell>
                            <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b>{totalValues.totalBFwd.toFixed(2)} </b></TableCell>
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        );
    }
}