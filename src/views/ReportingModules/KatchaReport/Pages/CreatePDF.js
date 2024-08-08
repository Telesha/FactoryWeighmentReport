import React from "react";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import tokenService from '../../../../utils/tokenDecoder';
import TableContainer from '@material-ui/core/TableContainer';
import Paper from '@material-ui/core/Paper';

export default class ComponentToPrint extends React.Component {
    render() {
        const searchData = this.props.searchData;
        const katchaData = this.props.katchaData;
        const columnOne = this.props.columnOne
        const columnTwo = this.props.columnTwo
        const columnThree = this.props.columnThree
        const columnFour = this.props.columnFour
        const totalRow = this.props.totalRow
        const date = this.props.date
        return (
            <div>
                <h3><center><u>Katcha Report</u></center></h3>
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><center><b>Garden: </b> {searchData.gardenName}</center></div>
                    <div className="col"><center><b>Division: </b> {searchData.costCenterName}</center></div>
                    <div className="col"><center><b>Task: </b> {searchData.taskID == "" ? 'All Tasks' : searchData.taskID}</center></div>
                    <div className="col"><center><b>Employee Type: </b> {searchData.empTypeName == "" ? 'All Types' : searchData.empTypeName}</center></div>
                    <div className="col"><center><b>From Date: </b> {searchData.fromDate} </center></div>
                    <div className="col"><center><b>To Date: </b> {date.substr(0, 10)} </center></div>
                </div>
                <br></br>
                <br></br>
                <TableContainer component={Paper}>
                    <Table size="small" aria-label="a dense table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center" rowSpan={3} style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black" }}>
                                    Particulars&nbsp;of&nbsp;Work&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                </TableCell>
                                <TableCell align="center" colSpan={columnTwo.length + 1} style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black" }}>
                                    Number of Workers
                                </TableCell>
                                <TableCell align="center" colSpan="31" style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black" }}>
                                    Wages
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                {columnOne.map((row, i) => {
                                    const found = columnTwo.filter(x => x.empTypeID == row.empTypeID)
                                    return (
                                        <TableCell align="center" colSpan={found.length} style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black" }}>
                                            {row.empTypeName}
                                        </TableCell>
                                    )
                                })}
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black" }}>
                                    Total
                                </TableCell>
                                {columnOne.map((row, i) => {
                                    return (
                                        <TableCell align="center" colSpan={6} style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black" }}>
                                            {row.empTypeName}
                                        </TableCell>
                                    )
                                })}
                                <TableCell align="center" colSpan="7" style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black" }}>
                                    Total
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                {columnTwo.map((row, i) => {
                                    return (
                                        <TableCell align="right" style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black" }}>
                                            {row.dafaTypeName.substring(0, 1)}
                                        </TableCell>
                                    )
                                })}
                                {columnThree.map((row, i) => {
                                    return (
                                        <TableCell align="right" style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black" }}>
                                            {row.colName}
                                        </TableCell>
                                    )
                                })}
                                <TableCell align="right" style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black" }}>Basic</TableCell>
                                <TableCell align="right" style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black" }}>Ex.Pay</TableCell>
                                <TableCell align="right" style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black" }}>BCS</TableCell>
                                <TableCell align="right" style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black" }}>OT</TableCell>
                                <TableCell align="right" style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black" }}>Addition</TableCell>
                                <TableCell align="right" style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black" }}>Deduction</TableCell>
                                <TableCell align="right" style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black" }}>G.Total</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {katchaData.map((row, i) => {
                                return (
                                    <TableRow key={i}>
                                        <TableCell component="th" scope="row" align="left" style={{ width: '100px', fontSize: 12, border: "1px solid black" }}>
                                            {row.kamjariName}
                                        </TableCell>
                                        {columnTwo.map((rows, i) => {
                                            var res = row[rows.empTypeID + ' ' + rows.gangID]
                                            return (
                                                <TableCell align="right" style={{ fontSize: 12, border: "1px solid black" }}>
                                                    {res == undefined ? '-' : res == 0 ? '-' : parseFloat(res).toFixed(0)}
                                                </TableCell>
                                            )
                                        })}
                                        <TableCell align="right" style={{ fontSize: 12, border: "1px solid black" }}>
                                            {parseFloat(row.totalPresent).toFixed(0)}
                                        </TableCell>
                                        {columnThree.map((rows, i) => {
                                            var res = row[rows.colID]
                                            return (
                                                <TableCell align="right" style={{ fontSize: 12, border: "1px solid black" }}>
                                                    {res == undefined ? '-' : res == 0 ? '-' : parseFloat(res).toFixed(0)}
                                                </TableCell>
                                            )
                                        })}
                                        <TableCell align="right" style={{ fontSize: 12, border: "1px solid black" }}>{row.totalBasicAmount == 0 ? '-' : parseFloat(row.totalBasicAmount).toFixed(0)}</TableCell>
                                        <TableCell align="right" style={{ fontSize: 12, border: "1px solid black" }}>{row.totalGardenAllowance == 0 ? '-' : parseFloat(row.totalGardenAllowance).toFixed(0)}</TableCell>
                                        <TableCell align="right" style={{ fontSize: 12, border: "1px solid black" }}>{row.totalAllowance == 0 ? '-' : parseFloat(row.totalAllowance).toFixed(0)}</TableCell>
                                        <TableCell align="right" style={{ fontSize: 12, border: "1px solid black" }}>{row.totalOtAmount == 0 ? '-' : parseFloat(row.totalOtAmount).toFixed(0)}</TableCell>
                                        <TableCell align="right" style={{ fontSize: 12, border: "1px solid black" }}>{row.totalAddition == 0 ? '-' : parseFloat(row.totalAddition).toFixed(0)}</TableCell>
                                        <TableCell align="right" style={{ fontSize: 12, border: "1px solid black" }}>{row.totalDeduction == 0 ? '-' : parseFloat(row.totalDeduction).toFixed(0)}</TableCell>
                                        <TableCell align="right" style={{ fontSize: 12, border: "1px solid black" }}>{row.grndTotal == 0 ? '-' : parseFloat(row.grndTotal).toFixed(0)}</TableCell>
                                    </TableRow>
                                )
                            })}
                            <TableRow >
                                <TableCell component="th" scope="row" align="left" style={{ width: '100px', fontSize: 12, border: "1px solid black", fontWeight: "bold" }}>
                                    Total
                                </TableCell>
                                {columnTwo.map((rows, i) => {
                                    var res = totalRow.find(x => x.name == rows.empTypeID + ' ' + rows.gangID)
                                    return (
                                        <TableCell align="right" style={{ fontSize: 12, border: "1px solid black", fontWeight: "bold" }}>
                                            {res == undefined ? '-' : res.value == 0 ? '-' : parseFloat(res.value).toFixed(0)}
                                        </TableCell>
                                    )
                                })}
                                {columnFour.map((rows, i) => {
                                    if (rows.colID == 'totalPresent') {
                                        var res = totalRow.find(x => x.name == rows.colID)
                                        return (
                                            <TableCell align="right" style={{ fontSize: 12, border: "1px solid black", fontWeight: "bold" }}>
                                                {res == undefined ? '-' : res.value == 0 ? '-' : parseFloat(res.value).toFixed(0)}
                                            </TableCell>
                                        )
                                    }
                                })}
                                {columnThree.map((rows, i) => {
                                    var res = totalRow.find(x => x.name == rows.colID)
                                    return (
                                        <TableCell align="right" style={{ fontSize: 12, border: "1px solid black", fontWeight: "bold" }}>
                                            {res == undefined ? '-' : res.value == 0 ? '-' : parseFloat(res.value).toFixed(0)}
                                        </TableCell>
                                    )
                                })}
                                {columnFour.map((rows, i) => {
                                    if (rows.colID != 'totalPresent') {
                                        var res = totalRow.find(x => x.name == rows.colID)
                                        return (
                                            <TableCell align="right" style={{ fontSize: 12, border: "1px solid black", fontWeight: "bold" }}>
                                                {res == undefined ? '-' : res.value == 0 ? '-' : parseFloat(res.value).toFixed(0)}
                                            </TableCell>
                                        )
                                    }
                                })}
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
                <div align="center">
                    <br></br>
                    <div className="row pl-2 pb-4 pt-7">
                        <div className="col"><center><b>Created By: </b> {tokenService.getUserNameFromToken()}</center></div>
                        <div className="col"><center><b>Created Date: </b> {new Date().toISOString().split('T')[0]}</center></div>
                    </div>

                </div>
            </div>
        );
    }
}