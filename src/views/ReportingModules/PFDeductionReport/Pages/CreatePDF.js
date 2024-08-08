import React from "react";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import moment from 'moment';
import TableContainer from '@material-ui/core/TableContainer';


export default class ComponentToPrint extends React.Component {
    render() {
        const searchData = this.props.searchData;
        const reportData = this.props.monthlyPFDeduction;
        const totalValues = this.props.totalValues;
        const fromDate = this.props.fromDate;
        const toDate = this.props.toDate;
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
                <h2><left><u>Monthly PF Deduction Report</u></left></h2>
                <br></br>
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><left><b>Business Division: </b> {searchData.groupName} </left></div>
                    <div className="col"><left><b>Location : </b> {searchData.gardenName == undefined ? "All" : searchData.gardenName}</left></div>
                    <div className="col"><left><b>Pay Point: </b> {searchData.payPointName == undefined ? "All" : searchData.payPointName}</left></div>
                    <div className="col"><left><b>Employee Category : </b> {searchData.employeeSubCategoryName == undefined ? "All" : searchData.employeeSubCategoryName}</left></div>
                    <div className="col"><left><b>Date : </b> {moment(searchData.fromDate).format('YYYY-MM-DD') + ' - ' + moment(searchData.toDate).format('YYYY-MM-DD')}</left></div>
                </div>
                <br></br>
                <TableContainer component={Paper}>
                    <Table aria-label="simple table" size='small'>
                        <TableHead>
                            <TableRow>
                                <TableCell align="left" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>Reg.No</TableCell>
                                <TableCell align="left" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>Emp.Name</TableCell>
                                <TableCell align="left" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>PF No</TableCell>
                                <TableCell align="left" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>Book No</TableCell>
                                <TableCell align="right" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>PF Total</TableCell>
                                <TableCell align="right" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>Total PF Arears</TableCell>
                                <TableCell align="right" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>PF Basic</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reportData.map((row, i) => (
                                <TableRow key={i}>
                                    <TableCell component="th" scope="row" align="left" style={{ fontSize: '10px', border: "1px solid black", padding: '3px' }}> {row.registrationNumber}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ fontSize: '10px', border: "1px solid black", padding: '3px' }}> {row.firstName}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ fontSize: '10px', border: "1px solid black", padding: '3px' }}> {row.epfNumber}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ fontSize: '10px', border: "1px solid black", padding: '3px' }}> {row.bookNumber ? row.bookNumber : '-'}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ fontSize: '10px', border: "1px solid black", padding: '3px' }}> {row.totalPF == 0 ? '-' : row.totalPF.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ fontSize: '10px', border: "1px solid black", padding: '3px' }}> {row.totalPFArears == 0 ? '-' : row.totalPFArears.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ fontSize: '10px', border: "1px solid black", padding: '3px' }}> {row.pfBasic == 0 ? '-' : row.pfBasic.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableRow>
                            <TableCell align={'left'} colSpan={4} style={{ fontSize: '10px', border: "1px solid black", padding: '3px', fontWeight: "bold", padding: '3px' }}><b>Total</b></TableCell>
                            <TableCell align={'right'} style={{ fontSize: '10px', border: "1px solid black", padding: '3px', fontWeight: "bold", padding: '3px' }}>
                                <b> {totalValues.totalTotalPF == 0 ? '-' : totalValues.totalTotalPF.toFixed(2)} </b>
                            </TableCell>
                            <TableCell align={'right'} style={{ fontSize: '10px', border: "1px solid black", padding: '3px', fontWeight: "bold", padding: '3px' }}>
                                <b> {totalValues.totalPFArearsT == 0 ? '-' : totalValues.totalPFArearsT.toFixed(2)} </b>
                            </TableCell>
                            <TableCell align={'right'} style={{ fontSize: '10px', border: "1px solid black", padding: '3px', fontWeight: "bold", padding: '3px' }}>
                                <b> {totalValues.totalPFBasic == 0 ? '-' : totalValues.totalPFBasic.toFixed(2)} </b>
                            </TableCell>
                        </TableRow>
                    </Table>
                    <br></br>
                </TableContainer>
            </div>
        );
    }
}