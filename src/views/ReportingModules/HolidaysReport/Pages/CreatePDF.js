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
        const holidayData = this.props.holidayData;
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
            transform-origin: top left; 
        }
    `}
                </style>
                <h3><u>Paypoint Exception Report</u></h3>
                <br />
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><left><b>Business Division: </b> {searchData.groupName}</left></div>
                    <div className="col"><left><b>Location: </b> {searchData.gardenName}</left></div>
                    <div className="col"><left><b>Date: </b>{searchData.fromDate} - {searchData.toDate}</left></div>
                </div>
                <br />
                <TableContainer component={Paper}>
                    <Table aria-label="simple table" size='small'>
                        <TableHead>
                            <TableRow>
                                <TableCell align="left" style={{ fontWeight: "bold", border: '1px solid black' }}>Location</TableCell>
                                <TableCell align="left" style={{ fontWeight: "bold", border: '1px solid black' }}>Date</TableCell>
                                <TableCell align="left" style={{ fontWeight: "bold", border: '1px solid black' }}>Description</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {holidayData.map((row, i) => (
                                <TableRow key={i}>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black" }}> {row.gardenName}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black" }}> {moment(row.date).format('YYYY-MM-DD')}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black" }}> {row.description}</TableCell>                                
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



