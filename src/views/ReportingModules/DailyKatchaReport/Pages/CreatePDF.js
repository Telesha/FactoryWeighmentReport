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
                <style>
                    {`
        @page {
            size: A4 landscape;
            margin-top: 0.75in;
            margin-bottom: 0.75in;
            margin-right: 0.3in;
            margin-left: 0.3in;
        }
    `}
                </style>
                <h3><left><u>Daily Katcha Report</u></left></h3>
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><left><b>Location: </b> {searchData.gardenName}</left></div>
                    <div className="col"><left><b>Sub Division: </b> {searchData.costCenterName}</left></div>
                    <div className="col"><left><b>Task: </b> {searchData.taskID == "" ? 'All Tasks' : searchData.taskID}</left></div>
                    <div className="col"><left><b>Employee Type: </b> {searchData.empTypeName == "" ? 'All Types' : searchData.empTypeName}</left></div>
                    <div className="col"><left><b>From Date: </b> {searchData.fromDate} </left></div>
                </div>
                <br></br>
                <br></br>
                <TableContainer component={Paper}>
                    <Table size="small" aria-label="a dense table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center" rowSpan={3} style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black", padding: '3px' }}>
                                    Particulars&nbsp;of&nbsp;Work&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                </TableCell>
                                <TableCell align="center" colSpan={columnTwo.length + 1} style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black", padding: '3px' }}>
                                    Number of Workers
                                </TableCell>
                                <TableCell align="center" colSpan="21" style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black", padding: '3px' }}>
                                    Wages
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                {columnOne.map((row, i) => {
                                    const found = columnTwo.filter(x => x.empTypeID == row.empTypeID)
                                    return (
                                        <TableCell align="center" colSpan={found.length} style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black", padding: '3px' }}>
                                            {row.empTypeName}
                                        </TableCell>
                                    )
                                })}
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black", padding: '3px' }}>
                                    Total
                                </TableCell>
                                {columnOne.map((row, i) => {
                                    return (
                                        <TableCell align="center" colSpan={4} style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black", padding: '3px' }}>
                                            {row.empTypeName}
                                        </TableCell>
                                    )
                                })}
                                <TableCell align="center" colSpan="5" style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black", padding: '3px' }}>
                                    Total
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                {columnTwo.map((row, i) => {
                                    return (
                                        <TableCell align="right" style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black", padding: '3px' }}>
                                            {row.dafaTypeName.substring(0, 1)}
                                        </TableCell>
                                    )
                                })}
                                {columnThree.map((row, i) => {
                                    return (
                                        <TableCell align="right" style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black", padding: '3px' }}>
                                            {row.colName}
                                        </TableCell>
                                    )
                                })}
                                <TableCell align="right" style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black", padding: '3px' }}>Basic</TableCell>
                                <TableCell align="right" style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black", padding: '3px' }}>Ex.Pay</TableCell>
                                <TableCell align="right" style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black", padding: '3px' }}>BCS</TableCell>
                                <TableCell align="right" style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black", padding: '3px' }}>OT</TableCell>
                                <TableCell align="right" style={{ fontWeight: "bold", fontSize: 12, border: "1px solid black", padding: '3px' }}>G.Total</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {katchaData.map((row, i) => {
                                return (
                                    <TableRow key={i}>
                                        <TableCell component="th" scope="row" align="left" style={{ width: '100px', fontSize: 12, border: "1px dashed black", padding: '3px' }}>
                                            {row.kamjariName}
                                        </TableCell>
                                        {columnTwo.map((rows, i) => {
                                            var res = row[rows.empTypeID + ' ' + rows.gangID]
                                            return (
                                                <TableCell align="right" style={{ fontSize: 12, border: "1px dashed black", padding: '3px' }}>
                                                    {res == undefined ? '-' : res == 0 ? '-' : parseFloat(res).toFixed(0)}
                                                </TableCell>
                                            )
                                        })}
                                        <TableCell align="right" style={{ fontSize: 12, border: "1px dashed black", padding: '3px' }}>
                                            {parseFloat(row.totalPresent).toFixed(0)}
                                        </TableCell>
                                        {columnThree.map((rows, i) => {
                                            var res = row[rows.colID]
                                            return (
                                                <TableCell align="right" style={{ fontSize: 12, border: "1px dashed black", padding: '3px' }}>
                                                    {res == undefined ? '-' : res == 0 ? '-' : parseFloat(res).toFixed(0)}
                                                </TableCell>
                                            )
                                        })}
                                        <TableCell align="right" style={{ fontSize: 12, border: "1px dashed black", padding: '3px' }}>{row.totalBasicAmount == 0 ? '-' : parseFloat(row.totalBasicAmount).toFixed(0)}</TableCell>
                                        <TableCell align="right" style={{ fontSize: 12, border: "1px dashed black", padding: '3px' }}>{row.totalGardenAllowance == 0 ? '-' : parseFloat(row.totalGardenAllowance).toFixed(0)}</TableCell>
                                        <TableCell align="right" style={{ fontSize: 12, border: "1px dashed black", padding: '3px' }}>{row.totalAllowance == 0 ? '-' : parseFloat(row.totalAllowance).toFixed(0)}</TableCell>
                                        <TableCell align="right" style={{ fontSize: 12, border: "1px dashed black", padding: '3px' }}>{row.totalOtAmount == 0 ? '-' : parseFloat(row.totalOtAmount).toFixed(0)}</TableCell>
                                        <TableCell align="right" style={{ fontSize: 12, border: "1px dashed black", padding: '3px' }}>{row.grndTotal == 0 ? '-' : parseFloat(row.grndTotal).toFixed(0)}</TableCell>
                                    </TableRow>
                                )
                            })}
                            <TableRow >
                                <TableCell component="th" scope="row" align="left" style={{ width: '100px', fontSize: 12, border: "1px dashed black", fontWeight: "bold", padding: '3px' }}>
                                    Total
                                </TableCell>
                                {columnTwo.map((rows, i) => {
                                    var res = totalRow.find(x => x.name == rows.empTypeID + ' ' + rows.gangID)
                                    return (
                                        <TableCell align="right" style={{ fontSize: 12, border: "1px dashed black", fontWeight: "bold", padding: '3px' }}>
                                            {res == undefined ? '-' : res.value == 0 ? '-' : parseFloat(res.value).toFixed(0)}
                                        </TableCell>
                                    )
                                })}
                                {columnFour.map((rows, i) => {
                                    if (rows.colID == 'totalPresent') {
                                        var res = totalRow.find(x => x.name == rows.colID)
                                        return (
                                            <TableCell align="right" style={{ fontSize: 12, border: "1px dashed black", fontWeight: "bold", padding: '3px' }}>
                                                {res == undefined ? '-' : res.value == 0 ? '-' : parseFloat(res.value).toFixed(0)}
                                            </TableCell>
                                        )
                                    }
                                })}
                                {columnThree.map((rows, i) => {
                                    var res = totalRow.find(x => x.name == rows.colID)
                                    return (
                                        <TableCell align="right" style={{ fontSize: 12, border: "1px dashed black", fontWeight: "bold", padding: '3px' }}>
                                            {res == undefined ? '-' : res.value == 0 ? '-' : parseFloat(res.value).toFixed(0)}
                                        </TableCell>
                                    )
                                })}
                                {columnFour.map((rows, i) => {
                                    if (rows.colID != 'totalPresent') {
                                        var res = totalRow.find(x => x.name == rows.colID)
                                        return (
                                            <TableCell align="right" style={{ fontSize: 12, border: "1px dashed black", fontWeight: "bold", padding: '3px' }}>
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