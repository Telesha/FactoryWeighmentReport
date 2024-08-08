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
        const reportData = this.props.dailyAttendanceSessionWiseData;
        const totalValues = this.props.totalValues;
        return (
            <div>
                <h3><center><u>Daily Plucking Details - Session Wise</u></center></h3>
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><center><b>Legal Entity: </b> {searchData.groupName}</center></div>
                    <div className="col"><center><b>Garden: </b> {searchData.gardenName}</center></div>
                    <div className="col"><center><b>Cost Center: </b> {searchData.costCenterName == undefined ? "All Cost Centers" : searchData.costCenterName}</center></div>
                    <div className="col"><center><b>Date: </b> {searchData.date} </center></div>
                    <div className="col"><center><b>Harvesting Job: </b> {searchData.factoryJobName === undefined ? "All Harvesting Jobs" : searchData.factoryJobName} </center></div>
                    <div className="col"><center><b>Plucking Task: </b> {searchData.taskName === undefined ? "All Plucking Tasks" : searchData.taskName} </center></div>
                    <div className="col"><center><b>Section: </b> {searchData.fieldName === undefined ? "All Sections" : searchData.fieldName} </center></div>
                    <div className="col"><center><b>Duffa: </b> {searchData.gangName === undefined ? "All Duffas" : searchData.gangName} </center></div>
                    <div className="col"><center><b>Session: </b> {searchData.sessionName === "0" ? "All Sessions" : searchData.sessionName} </center></div>
                </div>
                <TableContainer component={Paper}>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Reg.No</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Name</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Job</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Kamjari Code</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Kamjari Name</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Section</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Duffa</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Session</TableCell>
                                <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Qty(Kg)</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reportData.map((row, i) => (
                                <TableRow key={i}>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.registrationNumber}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.employeeName}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.jobName}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.taskCode}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.taskName}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.taskSubCode}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.gangName}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.sessionName}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.quntity.toFixed(2)}</TableCell>
                                </TableRow>
                            )
                            )}
                        </TableBody>
                        <TableRow>
                            <TableCell align={'center'} style={{ borderBottom: "none", border: "1px solid black" }}><b>Total</b></TableCell>
                            <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                            <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                            <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                            <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                            <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                            <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                            <TableCell style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                <b> {totalValues.totalQty.toFixed(2)} </b>
                            </TableCell>
                        </TableRow>
                    </Table>
                </TableContainer>
            </div>
        );
    }
}