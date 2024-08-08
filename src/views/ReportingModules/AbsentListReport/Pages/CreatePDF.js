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
        const reportData = this.props.reportData;
        return (
            <div>
                <style>
                    {`
        @page {
            size: A4 portrait;
            margin: 1in;
        }
    `}
                </style>
                <h2><u>Absent List Details Report</u></h2>
                <div className="row pl-2 pb-4 pt-4">

                    <div className="col"><left><b>Business Division: </b> {searchData.groupName} </left></div>
                    <div className="col"><left><b>Location : </b> {searchData.gardenName == undefined ? "All" : searchData.gardenName}</left></div>
                    <div className="col"><left><b>Pay Point: </b> {searchData.payPointName == undefined ? "All" : searchData.payPointName}</left></div>
                    <div className="col"><left><b>Emp.Sub Category : </b> {searchData.employeeSubCategoryName == undefined ? "All" : searchData.employeeSubCategoryName}</left></div>
                    <div className="col"><left><b>Date : </b> {moment(searchData.fromDate).format('YYYY-MM-DD') + ' - ' + moment(searchData.toDate).format('YYYY-MM-DD')}</left></div>
                </div>
                <br />

                <TableContainer component={Paper}>
                    <Table aria-label="simple table" size='small'>
                        <TableHead>
                            <TableRow>
                                <TableCell align="left" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>Reg.No.</TableCell>
                                <TableCell align="left" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>Emp.Name</TableCell>
                                <TableCell align="left" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>Emp.Sub Category</TableCell>
                                <TableCell align="left" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>Absent Date</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reportData.slice().map((row, i) => (
                                <TableRow key={i}>
                                    <TableCell component="th" scope="row" align="left" style={{ fontSize: '10px', border: "1px solid black", padding: '4px' }}> {row.registrationNumber}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ fontSize: '10px', border: "1px solid black", padding: '4px' }}> {row.firstName}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ fontSize: '10px', border: "1px solid black", padding: '4px' }}> {row.employeeSubCategoryName}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ fontSize: '10px', border: "1px solid black", padding: '4px' }}> {moment(row.date).format('YYYY-MM-DD')}</TableCell>
                                </TableRow>
                            )
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        );
    }
}