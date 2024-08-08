import React from "react";
import Table from '@material-ui/core/Table';
import Box from '@material-ui/core/Table';
import TableContainer from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

export default class ComponentToPrint extends React.Component {
    render() {
        const searchData = this.props.searchData;
        const reportData = this.props.offDayCashPaymentData;
        const totalValues = this.props.totalValues;
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
                <h3><left><u>Daily Wages Report</u></left></h3>
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><left><b>Garden : </b> {searchData.gardenName}</left></div>
                    <div className="col"><left><b>Division : </b> {searchData.costCenterName == undefined ? "All Divisions" : searchData.costCenterName}</left></div>
                    <div className="col"><left><b>Emp.Type : </b> {searchData.employeeTypeID == "" ? "All Emp.Types" : searchData.employeeTypeID}</left></div>
                    <div className="col"><left><b>Job Type : </b> {searchData.harvestJobTypeID == "" ? "All" : searchData.harvestJobTypeID}</left></div>
                    <div className="col"><left><b>Date : </b> {searchData.date} </left></div>
                </div>
                <br />
                <Box minWidth={1050}>
                    <TableContainer component={Paper} >
                        <Table aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Emp.ID</TableCell>
                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Emp.Name</TableCell>
                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Emp.Type</TableCell>
                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Job Type</TableCell>
                                    {/* <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Ass.Qty</TableCell>
                            <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Com.Qty</TableCell> */}
                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Amount</TableCell>
                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Allowances(BCS)</TableCell>
                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Extra Payment</TableCell>
                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Extra Hazira</TableCell>
                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Total Amount</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {reportData.map((row, i) => (
                                    <TableRow key={i}>
                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.registrationNumber}</TableCell>
                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.employeeName}</TableCell>
                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.employeeTypeName}</TableCell>
                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.jobName}</TableCell>
                                        {/* <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.targetQuantity.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.completedQuantity.toFixed(2)}</TableCell> */}
                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.amount.toFixed(2)}</TableCell>
                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.allowance.toFixed(2)}</TableCell>
                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.extraPayment.toFixed(2)}</TableCell>
                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.extraHazira.toFixed(2)}</TableCell>
                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {(row.amount + row.allowance + row.extraPayment + row.extraHazira).toFixed(2)}</TableCell>
                                    </TableRow>
                                )
                                )}
                            </TableBody>
                            <TableRow>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}><b>Total</b></TableCell>
                                <TableCell component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }} ></TableCell>
                                <TableCell component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }} ></TableCell>
                                <TableCell component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }} ></TableCell>
                                {/* <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                <b> {totalValues.totalAssQuantity.toFixed(2)} </b>
                            </TableCell>
                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                <b> {totalValues.totalComQuantity.toFixed(2)} </b>
                            </TableCell> */}
                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                    <b> {totalValues.totalgrossAmount.toFixed(2)} </b>
                                </TableCell>
                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                    <b> {totalValues.totalallowance.toFixed(2)} </b>
                                </TableCell>
                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                    <b> {totalValues.totalExtraPayment.toFixed(2)} </b>
                                </TableCell>
                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                    <b> {totalValues.totalExtraHazira.toFixed(2)} </b>
                                </TableCell>
                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                    <b> {totalValues.totalAmount.toFixed(2)} </b>
                                </TableCell>
                            </TableRow>
                        </Table>
                    </TableContainer>
                </Box>
            </div >
        );
    }
}