
import React from "react";
import tokenService from '../../../../utils/tokenDecoder';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper';
export default class ComponentToPrint extends React.Component {
    render() {

        const reportData = this.props.reportData;
        const columeNames = this.props.columeNames;
        const searchData = this.props.selectedSearchValues;
        const allTotal = this.props.allTotal;
        const total = this.props.total

        return (
            <div>
                <h3><center><u>Daily Harvester Performances Report</u></center></h3>
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><center><b>Group: </b> {searchData.group}</center></div>
                    <div className="col"><center><b>Garden: </b> {searchData.estate}</center></div>
                    <div className="col"><center><b>Cost Center: </b> {searchData.collectionID}</center></div>
                    <div className="col"><center><b>Gang: </b> {searchData.gang}</center></div>
                    <div className="col"><center><b>Month: </b> {searchData.month}</center></div>
                    <div className="col"><center><b>User: </b> {tokenService.getUserNameFromToken()}</center></div>
                    <div className="col"><center><b>Date/Time: </b> {new Date().toLocaleString()}</center></div>
                </div>
               
                    <TableContainer  component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell style={{ fontWeight: "bold", border: "1px solid black" }} align='center'>Name</TableCell>
                                    <TableCell style={{ fontWeight: "bold", border: "1px solid black" }} align='center'>Reg No</TableCell>
                                    {columeNames.map((item) => (
                                        <TableCell style={{
                                             border: "1px solid black",fontWeight: "bold", backgroundColor: item.columnColor == 0 ? null :
                                                item.columnColor == 1 ? '#fffff' : '#6aa3d6'
                                        }} align='center'>{item.columnName}</TableCell>
                                    ))}
                                    <TableCell style={{ fontWeight: "bold", border: "1px solid black" }} align='center'>Total Kg</TableCell>
                                    <TableCell style={{ fontWeight: "bold" , border: "1px solid black"}} align='center'>Total Days</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {reportData.map((row) => (
                                    <TableRow key={row.employeeID}>
                                        <TableCell align='left' style={{ border: "1px solid black" }}>{row.firstName}</TableCell>
                                        <TableCell align='center' style={{ border: "1px solid black" }}>{row.registrationNumber}</TableCell>
                                        {columeNames.map((column) => {
                                            const value = row[column.column];
                                            return (
                                                <TableCell style={{
                                                    border: "1px solid black",  backgroundColor: column.columnColor == 0 ? null :
                                                        column.columnColor == 1 ? '#fffff' : '#6aa3d6'
                                                }} align='center'>
                                                    {value == undefined ? '-' :
                                                        row.employeeTypeID == 1 ?
                                                            ((row.configurationValue > parseInt(value)) ?
                                                            parseInt(value) :
                                                                parseInt(value)) :
                                                                parseInt(value)
                                                    }</TableCell>
                                            );
                                        })}
                                        <TableCell style={{ fontWeight: "bold" ,border: "1px solid black" }} align='center'>{row.total}</TableCell>
                                        <TableCell style={{ fontWeight: "bold",border: "1px solid black" }} align='center'>{row.totalDays}</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow>
                                    <TableCell align='center' style={{ fontWeight: "bold",border: "1px solid black" }} colSpan={2}>Plucker Count</TableCell>
                                    {columeNames.map((column) => {
                                        const value = reportData.filter(x => x[column.column])
                                        return (
                                            <TableCell style={{
                                                border: "1px solid black", fontWeight: "bold", backgroundColor: column.columnColor == 0 ? null :
                                                    column.columnColor == 1 ? '#fffff' : '#6aa3d6'
                                            }} align='center'>{value.length == 0 ? '-' :
                                                parseInt(value.length)}</TableCell>
                                        );
                                    })}
                                    <TableCell style={{ fontWeight: "bold",border: "1px solid black" }} align='center'>-</TableCell>
                                    <TableCell style={{ fontWeight: "bold",border: "1px solid black" }} align='center'>-</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell align='center' style={{ fontWeight: "bold",border: "1px solid black" }} colSpan={2}>Total Kg</TableCell>
                                    {columeNames.map((column) => {
                                        const value = allTotal.find(x => x.name == column.column)
                                        return (
                                            <TableCell style={{
                                                border: "1px solid black",fontWeight: "bold", backgroundColor: column.columnColor == 0 ? null :
                                                    column.columnColor == 1 ? '#fffff' : '#6aa3d6'
                                            }} align='center'>{value == undefined ? '-' :
                                                parseInt(value.value)}</TableCell>
                                        );
                                    })}
                                    <TableCell style={{ fontWeight: "bold" ,border: "1px solid black"}} align='center'>{parseInt(total)}</TableCell>
                                    <TableCell style={{ fontWeight: "bold" ,border: "1px solid black"}} align='center'>-</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                
            </div>
        );
    }
}