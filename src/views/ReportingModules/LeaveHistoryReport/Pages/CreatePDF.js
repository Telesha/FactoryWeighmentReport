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
            margin: 0.75in;
        }
    `}
                </style>
                <h2><u>Leave History</u></h2>
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><left><b>Business Division: </b> {searchData.groupName} </left></div>
                    <div className="col"><left><b>Location : </b> {searchData.gardenName == undefined ? "All" : searchData.gardenName}</left></div>
                    <div className="col"><left><b>Sub-Division : </b> {searchData.costCenterName == undefined ? "All" : searchData.costCenterName}</left></div>
                    <div className="col"><left><b>Pay Point: </b> {searchData.payPointName == undefined ? "All" : searchData.payPointName}</left></div>
                    <div className="col"><left><b>Category : </b> {searchData.employeeSubCategoryName == undefined ? "All" : searchData.employeeSubCategoryName}</left></div>
                    <div className="col"><left><b>Leave Type : </b> {searchData.leaveTypeName == undefined ? "All" : searchData.leaveTypeName}</left></div>
                    <div className="col"><left><b>Status : </b> {searchData.status == 1 ? "Pending" : searchData.status == 2 ? "Approved" : searchData.status == 3 ? "Rejected" : searchData.status == 4 ? "Cancelled" : "All"}</left></div>
                    <div className="col"><left><b>Date : </b> {moment(searchData.fromDate).format('YYYY-MM-DD') + ' - ' + moment(searchData.toDate).format('YYYY-MM-DD')}</left></div>
                </div>
                <br />
                <TableContainer component={Paper}>
                    <Table aria-label="simple table" size='small'>
                        <TableHead>
                            <TableRow>
                                <TableCell align="left" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>Reg.No.</TableCell>
                                <TableCell align="left" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>Emp.Name</TableCell>
                                <TableCell align="left" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>From Date</TableCell>
                                <TableCell align="left" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>To Date</TableCell>
                                <TableCell align="right" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>Day Count</TableCell>
                                <TableCell align="left" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>Status</TableCell>
                                <TableCell align="left" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>Approved By</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reportData.map((data, i) => {
                                return (
                                    <React.Fragment key={i}>
                                        <TableRow>
                                            <TableCell colSpan={2} component="th" scope="row" align="left" style={{ fontSize: '10px', fontWeight: 'bolder', color: 'green', borderLeft: '1px solid black', borderBottom: '1px dashed black', padding: '3px' }}>Reg.No. : {data.employeeID}</TableCell>
                                            <TableCell colSpan={2} component="th" scope="row" align="left" style={{ fontSize: '10px', fontWeight: 'bolder', color: 'green', borderBottom: '1px dashed black', padding: '3px' }}>No.of Days : {data.noOfDays}</TableCell>
                                            <TableCell colSpan={3} component="th" scope="row" align="left" style={{ fontSize: '10px', fontWeight: 'bolder', color: 'green', borderBottom: '1px dashed black', borderRight: '1px solid black', padding: '3px' }}> Emp.Name : {data.firstName} </TableCell>
                                        </TableRow>
                                        {data.details.map((row, k) => {
                                            return (
                                                <>
                                                    <TableRow>
                                                        <TableCell colSpan={2} component="th" scope="row" align="left" style={{ fontSize: '10px', fontWeight: 'bolder', color: 'blue', borderLeft: '1px solid black', borderBottom: '1px dashed black', padding: '3px' }}>Leave Type : {row.leaveTypeName}</TableCell>
                                                        <TableCell colSpan={5} component="th" scope="row" align="left" style={{ fontSize: '10px', fontWeight: 'bolder', color: 'blue', borderBottom: '1px dashed black', borderRight: '1px solid black', padding: '3px' }}>No.of Days : {row.noOfDays}</TableCell>                                                    </TableRow>
                                                    {row.details.map((item, j) => {
                                                        return (
                                                            <TableRow key={`${k}-${j}`}>
                                                                <TableCell component="th" scope="row" align="left" style={{ fontSize: '10px', border: "1px solid black", padding: '4px' }}> {item.employeeID}</TableCell>
                                                                <TableCell component="th" scope="row" align="left" style={{ fontSize: '10px', border: "1px solid black", padding: '4px' }}> {item.firstName}</TableCell>
                                                                <TableCell component="th" scope="row" align="center" style={{ fontSize: '10px', border: "1px solid black", padding: '4px' }}> {moment(item.fromDate).format('YYYY-MM-DD')}</TableCell>
                                                                <TableCell component="th" scope="row" align="center" style={{ fontSize: '10px', border: "1px solid black", padding: '8px' }}> {moment(item.toDate).format('YYYY-MM-DD')}</TableCell>
                                                                <TableCell component="th" scope="row" align="center" style={{ fontSize: '10px', border: "1px solid black", padding: '4px' }}> {item.noOfDays}</TableCell>
                                                                <TableCell component="th" scope="row" align="center" style={{ fontSize: '10px', border: "1px solid black", padding: '4px' }}> {item.status}</TableCell>
                                                                <TableCell component="th" scope="row" align="center" style={{ fontSize: '10px', border: "1px solid black", padding: '4px' }}> {item.approvedbyOrRejectedby}</TableCell>
                                                            </TableRow>
                                                        )
                                                    })}
                                                </>
                                            );
                                        })}
                                    </React.Fragment>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        );
    }
}