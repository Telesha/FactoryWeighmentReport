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
            margin-top: 0.75in;
            margin-bottom: 0.75in;
            margin-right: 0.5in;
            margin-left: 0.5in;
        }
    `}
                </style>
                <h2><u>Employee Transfer</u></h2>
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><b>Business Division: </b> {searchData.groupName} </div>
                    <div className="col"><b>Location : </b> {searchData.gardenName}</div>
                    <div className="col"><b>Sub Division : </b> {searchData.costCenterName}</div>
                    <div className="col"><b>Pay Point : </b> {searchData.payPointName}</div>
                    <div className="col"><b>Employee Sub Category : </b> {searchData.employeeSubCategoryName}</div>
                    <div className="col"><b>Date : </b> {moment(searchData.fromDate).format('YYYY-MM-DD') + ' - ' + moment(searchData.toDate).format('YYYY-MM-DD')}</div>
                </div>
                <br />
                <TableContainer component={Paper}>
                    <Table aria-label="simple table" size='small'>
                        <TableHead>
                            <TableRow>
                                <TableCell align="left" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>Registration Number</TableCell>
                                <TableCell align="left" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>Name</TableCell>
                                <TableCell align="left" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>Work Location</TableCell>
                                <TableCell align="left" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>PayPoint</TableCell>
                                <TableCell align="left" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>Created Date/Time</TableCell>
                                <TableCell align="left" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>Modified Date/Time</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reportData.map((row, i) => (
                                <TableRow key={i}>
                                    <TableCell component="th" scope="row" align="left" style={{ fontSize: '10px', border: '1px dashed black', padding: '3px' }}> {row.registrationNumber}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ fontSize: '10px', border: '1px dashed black', padding: '3px' }}> {row.employeeName}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ fontSize: '10px', border: '1px dashed black', padding: '3px' }}> {row.workLocationName}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ fontSize: '10px', border: '1px dashed black', padding: '3px' }}> {row.payPointName}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ fontSize: '10px', border: '1px dashed black', padding: '3px' }}> {moment(row.createdDate).format('YYYY-MM-DD hh:mm:ss a')}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ fontSize: '10px', border: '1px dashed black', padding: '3px' }}> {moment(row.modifiedDate).format('YYYY-MM-DD hh:mm:ss a')}</TableCell>
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