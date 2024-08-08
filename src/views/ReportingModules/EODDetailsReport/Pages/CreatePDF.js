import React from "react";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import moment from "moment";

export default class ComponentToPrint extends React.Component {
    render() {
        const searchData = this.props.searchData;
        const reportData = this.props.eodDetailsData;
        const totalValues = this.props.totalValues;
        return (
            <div>
                
                <style>
                    {`
            @page {
                size: A4 landscape;
                margin-top: 0.75in;
                margin-bottom: 0.75in;
                margin-right: 0.4in;
                margin-left: 0.4in;
            }
            
            `}
                </style>
                <h3><center><u>EOD Details Report</u></center></h3>
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><center><b>Location: </b> {searchData.gardenName}</center></div>
                    <div className="col"><center><b>Sub Division: </b> {searchData.costCenterName}</center></div>
                    <div className="col"><center><b>Operator: </b> {searchData.operatorID == "" ? 'All Operators' : searchData.operatorID}</center></div>
                    <div className="col"><center><b>Date: </b> {searchData.date} </center></div>
                </div>
                <TableContainer>
                    <Table aria-label="simple table" size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center" rowSpan={2} style={{ fontWeight: "bold", border: "1px solid black", fontSize: "10px", padding: "3px" }}>Operator</TableCell>
                                <TableCell align="center" colSpan={3} style={{ fontWeight: "bold", border: "1px solid black", fontSize: "10px", padding: "3px" }}>Device</TableCell>
                                <TableCell align="center" colSpan={2} style={{ fontWeight: "bold", border: "1px solid black", fontSize: "10px", padding: "3px" }}>Time</TableCell>
                                <TableCell align="center" rowSpan={2} style={{ fontWeight: "bold", border: "1px solid black", fontSize: "10px", padding: "3px" }}>EOD Fail Count</TableCell>
                                <TableCell align="center" rowSpan={2} style={{ fontWeight: "bold", border: "1px solid black", fontSize: "10px", padding: "3px" }}>No. of Employee</TableCell>
                                <TableCell align="center" rowSpan={2} style={{ fontWeight: "bold", border: "1px solid black", fontSize: "10px", padding: "3px" }}>No. of Sessions</TableCell>
                                <TableCell align="center" colSpan={3} style={{ fontWeight: "bold", border: "1px solid black", fontSize: "10px", padding: "3px" }}>Task</TableCell>
                                <TableCell align="center" rowSpan={2} style={{ fontWeight: "bold", border: "1px solid black", fontSize: "10px", padding: "3px" }}>No. of Pluckers</TableCell>
                                <TableCell align="center" rowSpan={2} style={{ fontWeight: "bold", border: "1px solid black", fontSize: "10px", padding: "3px" }}>No. of Non Pluckers</TableCell>
                                <TableCell align="center" rowSpan={2} style={{ fontWeight: "bold", border: "1px solid black", fontSize: "10px", padding: "3px" }}>Non Plucking Suspend Count</TableCell>
                                <TableCell align="center" rowSpan={2} style={{ fontWeight: "bold", border: "1px solid black", fontSize: "10px", padding: "3px" }}>Version</TableCell>
                                <TableCell align="center" rowSpan={2} style={{ fontWeight: "bold", border: "1px solid black", fontSize: "10px", padding: "3px" }}>Installation Date</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: "10px", padding: "3px" }}>Device Lang</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: "10px", padding: "3px" }}>Device Model</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: "10px", padding: "3px" }}>OS Version</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: "10px", padding: "3px" }}>EOS Time</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: "10px", padding: "3px" }}>EOD Time</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: "10px", padding: "3px" }}>No. of Assing Task</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: "10px", padding: "3px" }}>No. of Incomplete Task</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: "10px", padding: "3px" }}>No. of Complete Task</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reportData.map((row, i) => (
                                <TableRow key={i}>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black", fontSize: "10px", padding: "3px" }}> {row.oparaterName}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black", fontSize: "10px", padding: "3px" }}> {row.deviceLang}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black", fontSize: "10px", padding: "3px" }}> {row.deviceModel}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px dashed black", fontSize: "10px", padding: "3px" }}> {row.osVersion == 0 ? '-' : row.osVersion}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px dashed black", fontSize: "10px", padding: "3px" }}> {moment(row.eosTime).format('YYYY-MM-DD, hh:mm:ss a')}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px dashed black", fontSize: "10px", padding: "3px", color: row.isEodDone === false ? 'red' : 'inherit', fontWeight: row.isEodDone === false ? 'bold' : 'normal'}}> {row.isEodDone == false ? 'Pending' : moment(row.eodTime).format('YYYY-MM-DD, hh:mm:ss a')}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px dashed black", fontSize: "10px", padding: "3px" }}> {row.eodFailCount == 0 ? '-' : row.eodFailCount}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px dashed black", fontSize: "10px", padding: "3px" }}> {row.noOfEmp}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px dashed black", fontSize: "10px", padding: "3px" }}> {row.noOfSessions}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px dashed black", fontSize: "10px", padding: "3px" }}> {row.noOfAssingTask}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px dashed black", fontSize: "10px", padding: "3px" }}> {row.noOfIncompleteTask}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px dashed black", fontSize: "10px", padding: "3px" }}> {row.noOfCompleteTask}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px dashed black", fontSize: "10px", padding: "3px" }}> {row.noOfPluckers}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px dashed black", fontSize: "10px", padding: "3px" }}> {row.noOfNonPluckers}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px dashed black", fontSize: "10px", padding: "3px" }}> {row.nonPluckingSuspendCount == 0 ? '-' : row.nonPluckingSuspendCount}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px dashed black", fontSize: "10px", padding: "3px" }}> {row.version}</TableCell>
                                    <TableCell component="th" scope="row" align="center" style={{ border: "1px dashed black", fontSize: "10px", padding: "3px" }}> {row.installationDate == null ? '-' : moment(row.installationDate).format('YYYY-MM-DD')}</TableCell>
                                </TableRow>
                            )
                            )}
                        </TableBody>
                        <TableRow>

                            <TableCell align={'center'} colSpan={6} style={{ borderBottom: "none", border: "1px solid black", padding: "3px" }}><b>Total</b></TableCell>
                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black", padding: "3px" }}>
                                <b> {totalValues.totaleodfailcount} </b>
                            </TableCell>
                            <TableCell align={'right'} style={{ borderBottom: "none", border: "1px solid black", padding: "3px" }}>
                                <b> {totalValues.totalNoofEmp} </b>
                            </TableCell>
                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black", padding: "3px" }}>
                                <b> {totalValues.totalnoOfSessions} </b>
                            </TableCell>
                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black", padding: "3px" }}>
                                <b> {totalValues.totalnoOfAssingTask} </b>
                            </TableCell>
                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black", padding: "3px" }}>
                                <b> {totalValues.totalnoOfIncompleteTask} </b>
                            </TableCell>
                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black", padding: "3px" }}>
                                <b> {totalValues.totalnoOfCompleteTask} </b>
                            </TableCell>
                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black", padding: "3px" }}>
                                <b> {totalValues.totalnoOfPluckers} </b>
                            </TableCell>
                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black", padding: "3px" }}>
                                <b> {totalValues.totalnoOfNonPluckers} </b>
                            </TableCell>                           
                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black", padding: "3px" }}>
                                <b> {totalValues.totalnonpluckingsuscount} </b>
                            </TableCell>
                            <TableCell style={{ borderBottom: "none", border: "1px solid black", padding: "3px" }}></TableCell>
                            <TableCell style={{ borderBottom: "none", border: "1px solid black", padding: "3px" }}></TableCell>
                        </TableRow>
                    </Table>
                </TableContainer>
            </div>
        );
    }
}