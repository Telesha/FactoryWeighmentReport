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
                <h3><center><u>Weekly Ration Deduction Report</u></center></h3>
                <br></br>
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><center><b>Garden: </b> {searchData.gardenName}</center></div>
                    <div className="col"><center><b>Division: </b> {searchData.costCenterName}</center></div>
                    <div className="col"><center><b>Employee Type: </b> {searchData.empTypeID == "" ? 'All Employee Types' : searchData.empTypeID}</center></div>
                    <div className="col"><center><b>Date: </b> {searchData.date} </center></div>
                </div>
                <br></br>
                <Table aria-label="simple table">
                    <TableRow style={{ border: "2px solid black" }}>
                        <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>Emp.ID</TableCell>
                        <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>Emp.Name</TableCell>
                        <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>Duffa</TableCell>
                        <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>Ration No</TableCell>
                        <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>Entitle (Qty- Kg)</TableCell>
                        <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>Eligible (Qty- Kg)</TableCell>
                        <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>Deduction (Qty- Kg)</TableCell>
                        <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>Attendance (Days)</TableCell>
                        <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>Rate Per Kg</TableCell>
                        <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>Amount</TableCell>
                    </TableRow>
                    <TableBody>
                        {reportData.map((row, i) => (
                            <TableRow style={{ border: "2px solid black" }} key={i}>
                                <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.registrationNumber}</TableCell>
                                <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.firstName}</TableCell>
                                <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.gangName}</TableCell>
                                <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.rationCardNo}</TableCell>
                                <TableCell component="th" scope="row" align="right" style={{ border: "2px solid black" }}> {row.entitleQuntity.toFixed(2)}</TableCell>
                                <TableCell component="th" scope="row" align="right" style={{ border: "2px solid black" }}> {row.eligibleQuntity.toFixed(2)}</TableCell>
                                <TableCell component="th" scope="row" align="right" style={{ border: "2px solid black" }}> {row.deductionQuntity.toFixed(2)}</TableCell>
                                <TableCell component="th" scope="row" align="right" style={{ border: "2px solid black" }}> {row.noOfAttendance}</TableCell>
                                <TableCell component="th" scope="row" align="right" style={{ border: "2px solid black" }}> {row.perKgRate}</TableCell>
                                <TableCell component="th" scope="row" align="right" style={{ border: "2px solid black" }}> {row.amount.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableRow>
                        <TableCell align={'center'} style={{ borderBottom: "none", border: "2px solid black" }}><b>Total</b></TableCell>
                        <TableCell style={{ borderBottom: "none", border: "2px solid black" }} ></TableCell>
                        <TableCell style={{ borderBottom: "none", border: "2px solid black" }}></TableCell>
                        <TableCell style={{ borderBottom: "none", border: "2px solid black" }}></TableCell>
                        <TableCell align={'right'} style={{ borderBottom: "none", border: "2px solid black" }}>
                            <b> {totalValues.totalMandayCount.toFixed(2)} </b>
                        </TableCell>
                        <TableCell align={'right'} style={{ borderBottom: "none", border: "2px solid black" }}>
                            <b> {totalValues.totalAmount.toFixed(2)} </b>
                        </TableCell>
                        <TableCell align={'right'} style={{ borderBottom: "none", border: "2px solid black" }}>
                            <b> {totalValues.totalBCSAllowance.toFixed(2)} </b>
                        </TableCell>
                        <TableCell align={'right'} style={{ borderBottom: "none", border: "2px solid black" }}>
                            <b> {totalValues.totalExtraPayment.toFixed(2)} </b>
                        </TableCell>
                        <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "2px solid black" }}>
                            <b> {totalValues.totalExtraHazira.toFixed(2)} </b>
                        </TableCell>
                        <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "2px solid black" }}>
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