import React from "react";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import moment from 'moment';
import LineWeightIcon from '@material-ui/icons/LineWeight';
import {Chip} from '@material-ui/core';

export default class ComponentToPrint extends React.Component {
    render() {
        const searchData = this.props.searchData;
        const reportData = this.props.dailyAttendanceData;
        const totalValues = this.props.totalValues; 
        const employeeCount = this.props.employeeCount;
        return (
            <div>
                <h3><center><u>Daily Plucking Details Report</u></center></h3>
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><center><b>Legal Entity: </b> {searchData.groupName}</center></div>
                    <div className="col"><center><b>Garden: </b> {searchData.gardenName}</center></div>
                    <div className="col"><center><b>Cost Center: </b> {searchData.costCenterName == undefined ? "All Cost Centers" : searchData.costCenterName}</center></div>
                    <div className="col"><center><b>Date: </b> {searchData.date} </center></div>
                    <div className="col"><center><b>Harvesting Job: </b> {searchData.factoryJobName === undefined ? "All Harvesting Jobs" : searchData.factoryJobName} </center></div>
                    <div className="col"><center><b>Plucking Task: </b> {searchData.taskName === undefined ? "All Plucking Tasks" : searchData.taskName} </center></div>
                    <div className="col"><center><b>Section: </b> {searchData.fieldName === undefined ? "All Sections" : searchData.fieldName} </center></div>
                    <div className="col"><center><b>Duffa: </b> {searchData.gangName === undefined ? "All Duffas" : searchData.gangName} </center></div>
                    {/* <div className="col"><center><b>Total Employee Count: </b> {employeeCount} </center></div> */}
                </div>
                <TableContainer component={Paper}>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center" style={{ fontWeight: "bold" }}>Reg No</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold" }}>Name</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold" }}>Kamjari Code</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold" }}>Kamjari Name</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold" }}>Section</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold" }}>Duffa</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold" }}>Qty(KG)</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold" }}>In Time</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold" }}>Out Time</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reportData.map((row, i) => (
                                <TableRow key={i}>
                                    <TableCell component="th" scope="row" align="center"> {row.registrationNumber}</TableCell>
                                    <TableCell component="th" scope="row" align="center"> {row.employeeName}</TableCell>
                                    <TableCell component="th" scope="row" align="center"> {row.taskCode}</TableCell>
                                    <TableCell component="th" scope="row" align="center"> {row.taskName}</TableCell>
                                    <TableCell component="th" scope="row" align="center"> {row.subTaskCode}</TableCell>
                                    <TableCell component="th" scope="row" align="center"> {row.gangName}</TableCell>
                                    <TableCell component="th" scope="row" align="center"> {row.quntity.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="center">  {moment(row.inTime).format('HH:mm:ss A')}</TableCell>
                                    <TableCell component="th" scope="row" align="center">  {moment(row.outTime).format('HH:mm:ss A')}</TableCell>
                                </TableRow>
                            )
                            )}
                        </TableBody>
                        <TableRow>
                            <TableCell align={'center'}><b>Total</b></TableCell>
                            <TableCell ></TableCell>
                            <TableCell ></TableCell>
                            <TableCell ></TableCell>
                            <TableCell ></TableCell>
                            <TableCell ></TableCell>
                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                <b> {totalValues.totalQty.toFixed(2)} </b>
                            </TableCell>
                        </TableRow>
                    </Table>
                </TableContainer>
            </div>
        );
    }
}