import React from "react";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { Chip } from "@material-ui/core";
import { Box } from "@material-ui/core";
import moment from "moment";
import CircleIcon from '@mui/icons-material/Circle';

export default class ComponentToPrint extends React.Component {
    render() {
        const searchData = this.props.searchData;
        const reportData = this.props.offDayCashPaymentData;
        const totalValues = this.props.totalValues;
        const employeeCount = this.props.employeeCount;
        return (
            <div>
                <style>
                    {`
                    @page {
                        size: A4 landscape;
                        margin-top: 0.75in;
                        margin-bottom: 0.75in;
                        margin-right: 0.5in;
                        margin-left: 0.5in;
                        transform-origin: top left; /* Set origin to top left corner */
                    }
                `}
                </style>
                <h3><left><u>Daily Payment Details Report</u></left></h3>
                <br />
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><left><b>Location : </b> {searchData.gardenName == undefined ? "All Locations" : searchData.gardenName}</left></div>
                    <div className="col"><left><b>Pay Point : </b> {searchData.costCenterName == undefined ? "All Pay Points" : searchData.costCenterName}</left></div>
                    <div className="col"><left><b>Employee Category : </b> {searchData.employeeTypeID == "" ? "All Employee Categories" : searchData.employeeTypeID}</left></div>
                    <div className="col"><left><b>Date : </b> {moment(searchData.date).format('YYYY-MM-DD')} </left></div>
                </div>
                <br />
                <Box minWidth={1000}>
                    {reportData.length > 0 ? (
                        <Chip
                            icon={<CircleIcon
                                fontSize='small' />}
                            label={"Employee Count: " + employeeCount}
                            color="secondary"
                            variant="outlined"
                        />
                    ) : null}
                    <br />
                    <br />
                    <TableContainer component={Paper}>
                        <Table aria-label="simple table" size='small'>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', padding: '3px' }}>Reg.No.</TableCell>
                                    <TableCell align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', padding: '3px' }}>Emp.Name</TableCell>
                                    <TableCell align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', padding: '3px' }}>Task</TableCell>
                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', padding: '3px' }}>KGs</TableCell>
                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', padding: '3px' }}>General</TableCell>
                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', padding: '3px' }}>Cash</TableCell>
                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', padding: '3px' }}>Leave</TableCell>
                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', padding: '3px' }}>O.T</TableCell>
                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', padding: '3px' }}>Allowance</TableCell>
                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', padding: '3px' }}>Gross</TableCell>
                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', padding: '3px' }}>PF</TableCell>
                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', padding: '3px' }}>Net</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {reportData.map((group, i) => {
                                    return (
                                        <React.Fragment key={i}>
                                            <TableRow>
                                                <TableCell colSpan={12} component="th" scope="row" align="left" style={{ fontWeight: 'bolder', color: 'green', borderBottom: '1px solid black', padding: '3px' }}>
                                                    Pay Point: {group.divisionName} <div>Category: {group.employeeSubCategoryName}</div>
                                                </TableCell>
                                            </TableRow>
                                            {group.details.map((data, j) => (
                                                <TableRow key={`${i}-${j}`}>
                                                    <TableCell component="th" scope="row" align="left" style={{ borderBottom: "1px dashed black", padding: '3px' }}>{data.registrationNumber}</TableCell>
                                                    <TableCell component="th" scope="row" align="left" style={{ borderBottom: "1px dashed black", padding: '3px' }}>{data.employeeName}</TableCell>
                                                    <TableCell component="th" scope="row" align="left" style={{ borderBottom: "1px dashed black", padding: '3px' }}>{data.taskCodes}</TableCell>
                                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", padding: '3px' }}>{data.pluckQty == 0 ? '-' : data.pluckQty.toFixed(2)}</TableCell>
                                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", padding: '3px' }}>{data.nonCashGrossAmount == 0 ? '-' : data.nonCashGrossAmount.toFixed(2)}</TableCell>
                                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", padding: '3px' }}>{data.cashGrossAmount == 0 ? '-' : data.cashGrossAmount.toFixed(2)}</TableCell>
                                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", padding: '3px' }}>{data.leaveGrossAmount == 0 ? '-' : data.leaveGrossAmount.toFixed(2)}</TableCell>
                                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", padding: '3px' }}>{'-'}</TableCell>
                                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", padding: '3px' }}>{data.allowance == 0 ? '-' : data.allowance.toFixed(2)}</TableCell>
                                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", padding: '3px' }}>{data.totalEarnings == 0 ? '-' : data.totalEarnings.toFixed(2)}</TableCell>
                                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", padding: '3px' }}>{data.pfDeductionAmount == 0 ? '-' : Math.round(data.pfDeductionAmount).toFixed(2)}</TableCell>
                                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", padding: '3px' }}>{data.totalNetPay == 0 ? '-' : Math.floor(data.totalNetPay).toFixed(2)}</TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow>
                                                <TableCell colSpan={3} component="th" scope="row" align="left" style={{ fontWeight: 'bolder', color: 'blue', borderBottom: '1px solid black', padding: '3px' }}>Sub Total</TableCell>
                                                <TableCell component="th" scope="row" align="right" style={{ borderBottom: '1px solid black', padding: '3px' }}>{group.totals.pluckQty == 0 ? '-' : group.totals.pluckQty.toFixed(2)}</TableCell>
                                                <TableCell component="th" scope="row" align="right" style={{ borderBottom: '1px solid black', padding: '3px' }}>{group.totals.nonCashGrossAmount == 0 ? '-' : group.totals.nonCashGrossAmount.toFixed(2)}</TableCell>
                                                <TableCell component="th" scope="row" align="right" style={{ borderBottom: '1px solid black', padding: '3px' }}>{group.totals.cashGrossAmount == 0 ? '-' : group.totals.cashGrossAmount.toFixed(2)}</TableCell>
                                                <TableCell component="th" scope="row" align="right" style={{ borderBottom: '1px solid black', padding: '3px' }}>{group.totals.leaveGrossAmount == 0 ? '-' : group.totals.leaveGrossAmount.toFixed(2)}</TableCell>
                                                <TableCell component="th" scope="row" align="right" style={{ borderBottom: '1px solid black', padding: '3px' }}>{'-'}</TableCell>
                                                <TableCell component="th" scope="row" align="right" style={{ borderBottom: '1px solid black', padding: '3px' }}>{group.totals.allowance == 0 ? '-' : group.totals.allowance.toFixed(2)}</TableCell>
                                                <TableCell component="th" scope="row" align="right" style={{ borderBottom: '1px solid black', padding: '3px' }}>{group.totals.totalEarnings == 0 ? '-' : group.totals.totalEarnings.toFixed(2)}</TableCell>
                                                <TableCell component="th" scope="row" align="right" style={{ borderBottom: '1px solid black', padding: '3px' }}>{group.totals.pfDeductionAmount == 0 ? '-' : Math.round(group.totals.pfDeductionAmount).toFixed(2)}</TableCell>
                                                <TableCell component="th" scope="row" align="right" style={{ borderBottom: '1px solid black', padding: '3px' }}>{group.totals.totalNetPay == 0 ? '-' : Math.floor(group.totals.totalNetPay).toFixed(2)}</TableCell>
                                            </TableRow>
                                        </React.Fragment>
                                    );
                                })}
                                <TableRow>
                                    <TableCell colSpan={3} component="th" scope="row" align="left" style={{ fontWeight: 'bolder', color: 'red', borderBottom: '1px solid black', padding: '3px' }}>Grand Total</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: '1px solid black', padding: '3px' }}>{totalValues.pluckQty == 0 ? '-' : totalValues.pluckQty.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: '1px solid black', padding: '3px' }}>{totalValues.nonCashGrossAmount == 0 ? '-' : totalValues.nonCashGrossAmount.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: '1px solid black', padding: '3px' }}>{totalValues.cashGrossAmount == 0 ? '-' : totalValues.cashGrossAmount.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: '1px solid black', padding: '3px' }}>{totalValues.leaveGrossAmount == 0 ? '-' : totalValues.leaveGrossAmount.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: '1px solid black', padding: '3px' }}>{'-'}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: '1px solid black', padding: '3px' }}>{totalValues.allowance == 0 ? '-' : totalValues.allowance.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: '1px solid black', padding: '3px' }}>{totalValues.totalEarnings == 0 ? '-' : totalValues.totalEarnings.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: '1px solid black', padding: '3px' }}>{totalValues.pfDeductionAmount == 0 ? '-' : Math.round(totalValues.pfDeductionAmount).toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: '1px solid black', padding: '3px' }}>{totalValues.totalNetPay == 0 ? '-' : Math.floor(totalValues.totalNetPay).toFixed(2)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </div >
        );
    }
}