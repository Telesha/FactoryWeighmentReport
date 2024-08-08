import React from "react";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import tokenService from '../../../../utils/tokenDecoder';
import moment from 'moment';
import { Padding } from "@mui/icons-material";
import Box from '@material-ui/core/Box';

export default class ComponentToPrint extends React.Component {
    render() {
        const searchData = this.props.searchData;
        const reportData = this.props.attendanceData;
        const employeeCount = this.props.employeeCount;
        const totalValues = this.props.totalValues;
        return (
            <div>
                <style>
                    {`
                        @page {
                            margin-top: 0.5in;
                            margin-bottom: 0.5in;
                            margin-left: 0.5in;
                        }
                    `}
                </style>
                <h3><center><u>Daily Non Plucking Attendance</u></center></h3>
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><center><b>Legal Entity: </b> {searchData.groupName}</center></div>
                    <div className="col"><center><b>Garden: </b> {searchData.gardenName}</center></div>
                    <div className="col"><center><b>Cost Center: </b> {searchData.costCenterName}</center></div>
                    <div className="col"><center><b>Date: </b> {searchData.date} </center></div>
                    <div className="col"><center><b>Task Category: </b> {searchData.estateTaskName === undefined ? 'Task Category - All Task Categories' : 'Task Category - ' + searchData.estateTaskName} </center></div>
                    <div className="col"><center><b>Sundry Task: </b> {searchData.taskName === undefined ? 'Sundry Task - All Sundry Tasks' : 'Sundry Task - ' + searchData.taskName} </center></div>
                    {/* <div className="col"><center><b>Total Employee Count: </b> {employeeCount} </center></div> */}
                </div>
                <Box minWidth={1050}>
                    <TableContainer style={{ maxWidth: 'calc(100% - 0.5in)' }}>
                        <Table aria-label="simple table" size='small'>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", padding:'2px', fontSize:'12px' }}>Emp.ID</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", padding:'2px' }}><div style={{width:"80px", overflow:'hidden', fontSize:'12px'}}>Emp.Name</div></TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", padding:'2px', fontSize:'12px' }}>Emp.Type</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", padding:'2px', fontSize:'12px' }}>Duffa</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", padding:'2px', fontSize:'12px' }}>Sirder</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", padding:'2px', fontSize:'12px' }}>Operator</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", padding:'2px', fontSize:'10px' }}><div style={{width:"35px", overflow:'hidden'}}>Kamjari Code</div></TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", padding:'2px', fontSize:'12px'}}>Kamjari Name</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", padding:'2px', fontSize:'12px' }}>In Time</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", padding:'2px', fontSize:'12px' }}>Out Time</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", padding:'2px', fontSize:'12px' }}>Target</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", padding:'2px', fontSize:'12px' }}>Qty</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", padding:'2px', fontSize:'12px' }}>M.Unit</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", padding:'2px', fontSize:'12px' }}>Rate</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", padding:'2px', fontSize:'12px' }}>Amount</TableCell>

                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {reportData.map((row, i) => (
                                    <TableRow key={i}>
                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black", padding:'2px', fontSize:'12px'}}> {row.registrationNumber}</TableCell>
                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black", padding:'2px' }}><div style={{width:"80px", overflow:'hidden', fontSize:'10px'}}>{row.firstName}</div></TableCell>
                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black", padding:'2px', fontSize:'12px' }}> {row.employeeTypeName}</TableCell>
                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black", padding:'2px', fontSize:'12px' }}> {row.duffaName}</TableCell>
                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black", padding:'2px', fontSize:'12px' }}> {row.sirderName}</TableCell>
                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black", padding:'2px', fontSize:'12px' }}>  {row.operator}</TableCell>
                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black", padding:'2px', fontSize:'12px' }}><div style={{width:"35px", overflow:'hidden'}}>{row.taskCode}</div></TableCell>
                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black", padding:'2px', fontSize:'12px' }}>{row.taskName}</TableCell>
                                        <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black", padding:'2px', fontSize:'12px' }}>  {moment(row.inTime).format('HH:mm:ss A')}</TableCell>
                                        <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black", padding:'2px', fontSize:'12px' }}>  {moment(row.outTime).format('HH:mm:ss A')}</TableCell>
                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", padding:'2px', fontSize:'12px' }}> {row.assignQuntity.toFixed(2)}</TableCell>
                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", padding:'2px', fontSize:'12px' }}> {row.quntity.toFixed(2)}</TableCell>
                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black", padding:'2px', fontSize:'12px' }}> {row.measuringUnitName}</TableCell>
                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", padding:'2px', fontSize:'12px' }}> {row.rate.toFixed(2)}</TableCell>
                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", padding:'2px', fontSize:'12px' }}> {row.amount.toFixed(2)}</TableCell>

                                    </TableRow>
                                )
                                )}
                            </TableBody>
                            <TableRow>
                                <TableCell align={'left'} colSpan={11} style={{ borderBottom: "none", border: "1px solid black", padding:'2px' }}><b>Total</b></TableCell>
                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black", padding:'2px' }}>
                                </TableCell>
                                <TableCell style={{ borderBottom: "none", border: "1px solid black", padding:'2px' }}></TableCell>
                                <TableCell style={{ borderBottom: "none", border: "1px solid black", padding:'2px' }}></TableCell>
                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black", padding:'2px' }}>
                                    <b> {totalValues.totalAmount.toFixed(2)} </b>
                                </TableCell>
                            </TableRow>
                            <TableHead>
                            </TableHead>
                        </Table>
                    </TableContainer>
                </Box>
            </div>
        );
    }
}