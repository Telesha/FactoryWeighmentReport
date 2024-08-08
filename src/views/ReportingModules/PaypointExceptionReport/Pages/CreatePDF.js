import React from "react";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import moment from "moment";
import Paper from '@material-ui/core/Paper';


export default class ComponentToPrint extends React.Component {
    render() {
        const searchData = this.props.searchData;
        const paypointExceptionData = this.props.paypointExceptionData;

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
            transform-origin: top left; /* Set origin to top left corner */
        }
    `}
                </style>
                <h2><u>Paypoint Exception Report</u></h2>
                <br />
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><left><b>Business Division : </b> {searchData.groupName} </left></div>
                    <div className="col"><left><b>Location : </b> {searchData.estateName} </left></div>
                    <div className="col"><left><b>Date : </b> {moment(searchData.date).format('YYYY-MM-DD')}</left></div>
                </div>
                <br />
                <TableContainer component={Paper}>
                    <Table aria-label="simple table" size='small'>
                        <TableHead>
                            <TableRow>
                                <TableCell align="left" style={{ fontSize: '10px', fontWeight: "bold", border: '1px solid black', padding: '3px' }}>Reg.No</TableCell>
                                <TableCell align="left" style={{ fontSize: '10px', fontWeight: "bold", border: '1px solid black', padding: '3px' }}> Emp.Name</TableCell>
                                <TableCell align="left" style={{ fontSize: '10px', fontWeight: "bold", border: '1px solid black', padding: '3px' }}>Paypoint Name</TableCell>
                                <TableCell align="left" style={{ fontSize: '10px', fontWeight: "bold", border: '1px solid black', padding: '3px' }}>Created Date</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {paypointExceptionData.map((row, i) => (
                                <TableRow key={i}>
                                    <TableCell component="th" scope="row" align="left" style={{ fontSize: '12px', border: "1px dashed black", padding: '3px' }}> {row.registrationNumber}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ fontSize: '12px', border: "1px dashed black", padding: '3px' }}> {row.employeeName}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ fontSize: '12px', border: "1px dashed black", padding: '3px' }}> {row.paypointName}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ fontSize: '12px', border: "1px dashed black", padding: '3px' }}> {moment(row.createdDate).format('YYYY-MM-DD HH:mm:ss')}</TableCell>
                                </TableRow>
                            )
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div >
        );
    }
}