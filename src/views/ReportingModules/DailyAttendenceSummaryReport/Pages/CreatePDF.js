import React from "react";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import moment from 'moment';

export default class ComponentToPrint extends React.Component {
    render() {
        const searchData = this.props.searchData;
        const dailyAttendanceData = this.props.dailyAttendanceData;
        const allTotal = this.props.allTotal;
        const totalRow = this.props.totalRow;
        const mainHeader = this.props.mainHeader;
        const header = this.props.header;

        return (
            <div>
                <h3><center><u>Daily Attendance Summary Report</u></center></h3>
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><center><b>Garden: </b> {searchData.gardenName}</center></div>
                    <div className="col"><center><b>Cost Center: </b> {searchData.costCenterName == undefined ? "All Cost Centers" : searchData.costCenterName}</center></div>
                    <div className="col"><center><b>Operator: </b> {searchData.operatorName === "" ? "All Operators" : searchData.operatorName} </center></div>
                    <div className="col"><center><b>Sirder: </b> {searchData.sirderID === "" ? "All Sirders" : searchData.sirderID} </center></div>
                    <div className="col"><center><b>Date: </b> {searchData.date} </center></div>
                </div>
                <TableContainer component={Paper}>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black" }}>Operator</TableCell>
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black" }}>Sirder</TableCell>
                                <TableCell align="center" colSpan={header.length} style={{ fontWeight: "bold", border: "1px solid black" }}>Number of Workers</TableCell>
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                    Total
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                {header.map((row, i) => {
                                    return (
                                        <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                            {row.employeeTypeName}
                                        </TableCell>
                                    )
                                })}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {dailyAttendanceData.map((row, i) => {

                                return (
                                    <TableRow>
                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.operatorName}</TableCell>
                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}>{row.sirderName}</TableCell>

                                        {header.map((rows, i) => {
                                            var result = row[rows.employeeTypeName]
                                            return (
                                                <>
                                                    <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black" }}>
                                                        {result == undefined ? '-' : result}
                                                    </TableCell>
                                                </>
                                            )
                                        })}
                                        <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black" }}>{row.total}</TableCell>
                                    </TableRow>
                                )
                            })}
                            <TableRow>
                                <TableCell component="th" scope="row" align="left" style={{ fontWeight: "bold", borderLeft: "1px solid black", borderBottom: "1px solid black" }}>Total</TableCell>
                                <TableCell style={{ borderBottom: "1px solid black" }}></TableCell>
                                {header.map((rows, i) => {
                                    var result = totalRow.find(x => x.name == rows.employeeTypeName)
                                    return (
                                        <>
                                            <TableCell component="th" scope="row" align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                {result == undefined ? '-' : result.value}
                                            </TableCell>
                                        </>
                                    )
                                })}
                                <TableCell component="th" scope="row" align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>{allTotal} </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        );
    }
}