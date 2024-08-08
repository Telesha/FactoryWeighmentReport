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
                <h3><center><u>Daily Attendance Report-Plucker</u></center></h3>
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><center><b>Garden: </b> {searchData.gardenName}</center></div>
                    <div className="col"><center><b>Division: </b> {searchData.costCenterName}</center></div>
                    <div className="col"><center><b>Employee Type: </b> {searchData.empTypeID == "" ? 'All Employees' : searchData.empTypeID}</center></div>
                    <div className="col"><center><b>Duffa: </b> {searchData.gangID == "" ? 'All Duffas' : searchData.gangID}</center></div>
                    <div className="col"><center><b>Sirder: </b> {searchData.sirderID == "" ? 'All Sirders' : searchData.sirderID}</center></div>
                    <div className="col"><center><b>Operator: </b> {searchData.operatorID == "" ? 'All Operators' : searchData.operatorID}</center></div>
                    <div className="col"><center><b>Task: </b> {searchData.taskID == "" ? 'All Tasks' : searchData.taskID}</center></div>
                    <div className="col"><center><b>Date: </b> {searchData.date} </center></div>
                </div>
                <Table aria-label="simple table">
                    <TableHead>
                        <TableRow style={{ border: "2px solid black" }}>
                            <TableCell align="left" rowSpan={2} style={{ fontWeight: "bold", border: "2px solid black" }}>Emp.ID</TableCell>
                            <TableCell align="left" rowSpan={2} style={{ fontWeight: "bold", border: "2px solid black" }}>Emp.Name</TableCell>
                            <TableCell align="left" rowSpan={2} style={{ fontWeight: "bold", border: "2px solid black" }}>Emp.Type</TableCell>
                            <TableCell align="left" rowSpan={2} style={{ fontWeight: "bold", border: "2px solid black" }}>Sirder</TableCell>
                            <TableCell align="left" rowSpan={2} style={{ fontWeight: "bold", border: "2px solid black" }}>Operator</TableCell>
                            <TableCell align="left" rowSpan={2} style={{ fontWeight: "bold", border: "2px solid black" }}>Duffa</TableCell>
                            <TableCell align="left" rowSpan={2} style={{ fontWeight: "bold", border: "2px solid black" }}>Date</TableCell>
                            <TableCell align="left" rowSpan={2} style={{ fontWeight: "bold", border: "2px solid black" }}>In Time</TableCell>
                            <TableCell align="center" colSpan={3} style={{ fontWeight: "bold", border: "2px solid black" }}>Session 1</TableCell>
                            <TableCell align="center" colSpan={3} style={{ fontWeight: "bold", border: "2px solid black" }}>Session 2</TableCell>
                            <TableCell align="center" colSpan={3} style={{ fontWeight: "bold", border: "2px solid black" }}>Session 3</TableCell>
                        </TableRow>
                        <TableRow style={{ border: "2px solid black" }}>
                            <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>W 1 Time</TableCell>
                            <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>W 1 Section</TableCell>
                            <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>W 1 Quantity</TableCell>
                            <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>W 2 Time</TableCell>
                            <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>W 2 Section</TableCell>
                            <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>W 2 Quantity</TableCell>
                            <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>W 3 Time</TableCell>
                            <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>W 3 Section</TableCell>
                            <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black" }}>W 3 Quantity</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {reportData.map((row, i) => (
                            <TableRow style={{ border: "2px solid black" }} key={i}>
                                <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.registrationNumber}</TableCell>
                                <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.firstName}</TableCell>
                                <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.employeeTypeName}</TableCell>
                                <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.sirderName}</TableCell>
                                <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.operatorName}</TableCell>
                                <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.gangName}</TableCell>
                                <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.date == null ? '-' : row.date.split('T')[0]}</TableCell>
                                <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.inTime == null ? '-' : moment(row.inTime).format('HH:mm:ss A')}</TableCell>
                                <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.session1Time == null ? '-' : moment(row.session1Time).format('HH:mm:ss A')}</TableCell>
                                <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.session1Section == null ? '-' : row.session1Section}</TableCell>
                                <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.session1TimeQuntity == 0 ? '-' : row.session1TimeQuntity}</TableCell>
                                <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.session2Time == null ? '-' : moment(row.session2Time).format('HH:mm:ss A')}</TableCell>
                                <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.session2Section == null ? '-' : row.session2Section}</TableCell>
                                <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.session2TimeQuntity == 0 ? '-' : row.session2TimeQuntity}</TableCell>
                                <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.session3Time == null ? '-' : moment(row.session3Time).format('HH:mm:ss A')}</TableCell>
                                <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.session3Section == null ? '-' : row.session3Section}</TableCell>
                                <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.session3TimeQuntity == 0 ? '-' : row.session3TimeQuntity}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableRow>
                        <TableCell align={'center'} style={{ borderBottom: "none", border: "2px solid black" }}><b>Total</b></TableCell>
                        <TableCell style={{ borderBottom: "none", border: "2px solid black" }} ></TableCell>
                        <TableCell style={{ borderBottom: "none", border: "2px solid black" }}></TableCell>
                        <TableCell style={{ borderBottom: "none", border: "2px solid black" }}></TableCell>
                        <TableCell style={{ borderBottom: "none", border: "2px solid black" }}></TableCell>
                        <TableCell style={{ borderBottom: "none", border: "2px solid black" }}></TableCell>
                        <TableCell style={{ borderBottom: "none", border: "2px solid black" }}></TableCell>
                        <TableCell style={{ borderBottom: "none", border: "2px solid black" }}></TableCell>
                        <TableCell style={{ borderBottom: "none", border: "2px solid black" }}></TableCell>
                        <TableCell style={{ borderBottom: "none", border: "2px solid black" }}></TableCell>
                        <TableCell style={{ borderBottom: "none", border: "2px solid black" }}>
                            <b> {totalValues.totalW1Qty.toFixed(2)} </b>
                        </TableCell>
                        <TableCell style={{ borderBottom: "none", border: "2px solid black" }}></TableCell>
                        <TableCell style={{ borderBottom: "none", border: "2px solid black" }}></TableCell>
                        <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "2px solid black" }}>
                            <b> {totalValues.totalW2Qty.toFixed(2)} </b>
                        </TableCell>
                        <TableCell style={{ borderBottom: "none", border: "2px solid black" }}></TableCell>
                        <TableCell style={{ borderBottom: "none", border: "2px solid black" }}></TableCell>
                        <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "2px solid black" }}>
                            <b> {totalValues.totalW3Qty.toFixed(2)} </b>
                        </TableCell>
                    </TableRow>
                </Table>
                <div className="row pl-2 pb-4 pt-7">
                    <div className="col"><center><b>Created By: </b> {tokenService.getUserNameFromToken()}</center></div>
                    <div className="col"><center><b>Created Date: </b> {new Date().toISOString().split('T')[0]}</center></div>
                </div>
            </div>
        );
    }
}