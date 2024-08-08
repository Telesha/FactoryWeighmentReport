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
        const dailylabourData = this.props.dailylabourData;
        const mainHeader = this.props.mainHeader;
        const allTotal = this.props.allTotal;
        const totalRow = this.props.totalRow;
        const header = this.props.header;
        return (
            <div>
                <h3><center><u>Daily Labour Report</u></center></h3>
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><center><b>Legal Entity: </b> {searchData.groupName}</center></div>
                    <div className="col"><center><b>Garden: </b> {searchData.gardenName}</center></div>
                    <div className="col"><center><b>Cost Center: </b> {searchData.costCenterName == undefined ? "All Cost Centers" : searchData.costCenterName}</center></div>
                    <div className="col"><center>{searchData.fromDate} - {searchData.toDate}</center></div>
                </div>
                <TableContainer component={Paper}>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center" rowSpan="3" style={{ fontWeight: "bold", border: "1px solid black" }}>Particulars of Work</TableCell>
                                <TableCell align="center" colSpan={mainHeader.length + 1} style={{ fontWeight: "bold", border: "1px solid black" }}>Number of Workers</TableCell>
                            </TableRow>
                            <TableRow>
                                {header.map((row, i) => {
                                    return (
                                        <TableCell colSpan={row.newList.length} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                            {row.employeeTypeName}
                                        </TableCell>
                                    )
                                })}
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                    Total
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                {mainHeader.map((row, i) => {
                                    return (
                                        <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                            {row.gangName}
                                        </TableCell>
                                    )
                                })}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {dailylabourData.map((row, i) => {
                                return (
                                    <TableRow key={i}>
                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.taskName}</TableCell>
                                        {mainHeader.map((rows, i) => {
                                            var result = row.newList.find(x => x.employeeTypeID == rows.employeeTypeID && x.gangID == rows.gangID)
                                            return (
                                                <>
                                                    <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black" }}>
                                                        {result == undefined ? '-' : result.value}
                                                    </TableCell>
                                                </>
                                            )
                                        })}
                                        <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black" }}> {row.totalCount}</TableCell>
                                    </TableRow>
                                )
                            })}
                            <TableRow>
                                <TableCell component="th" scope="row" align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Total</TableCell>
                                {mainHeader.map((rows, i) => {
                                    var result = totalRow.find(x => x.employeeTypeID == rows.employeeTypeID && x.gangID == rows.gangID)
                                    return (
                                        <>
                                            <TableCell component="th" scope="row" align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                {result == undefined ? '-' : result.sumValue}
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