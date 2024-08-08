import React from "react";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import tokenService from '../../../../utils/tokenDecoder';

export default class ComponentToPrint extends React.Component {
    render() {
        const searchData = this.props.searchData;
        const reportData = this.props.dailylabourData;
        const totalValues = this.props.totalValues;
        const monDate = this.props.monDate;
        const tueDate = this.props.tueDate;
        const wedDate = this.props.wedDate;
        const thuDate = this.props.thuDate;
        const friDate = this.props.friDate;
        const satDate = this.props.satDate;
        const sunDate = this.props.sunDate;
        const clr = (value, int) => {
            if (value == 0) {
                return "#FEFFB8"
            }
            else if (int !== null) {
                return "#FFD3F9"
            }
            else {
                return "#FFFFFF"
            }
        }
        return (
            <div>
                <style>
                    {`
                    @page {
                        size: A4 landscape;
                        margin-top: 1in;  
                        margin-bottom: 1in; 
                        margin-right: 0.5in;  
                        margin-left: 0.5in;
                    }
                `}
                </style>
                <h3><left><u>Weekly Payment Report</u></left></h3>
                <br/>
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><left><b>Location: </b> {searchData.gardenName}</left></div>
                    <div className="col"><left><b>Employee Type: </b> {searchData.empTypeName === "" ? "All Employee Types" : searchData.empTypeName}</left></div>
                    <div className="col"><left><b>Duffa: </b> {searchData.gangName === "" ? "All Duffas" : searchData.gangName}</left></div>
                    <div className="col"><left><b>Reg.No: </b> {searchData.registrationNumber == "" ? "All Employees" : searchData.registrationNumber}</left></div>
                    <div className="col"><left><b>Book: </b> {searchData.bookName === "" ? "All Books" : searchData.bookName}</left></div>
                    <div className="col"><left><b>From Date: </b> {searchData.fromDate}</left></div>
                    <div className="col"><left><b>To Date: </b> {searchData.toDate}</left></div>
                </div>
                <br/>
                <TableContainer component={Paper}>
                    <Table aria-label="simple table" size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF", fontSize: '9px', padding: '3px' }}>Reg.No</TableCell>
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF", fontSize: '9px', padding: '3px' }}>Emp.Name</TableCell>
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF", fontSize: '9px', padding: '3px' }}>B.FWRD</TableCell>
                                <TableCell align="center" colSpan="8" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF", fontSize: '9px', padding: '3px' }}>Wages</TableCell>
                                <TableCell align="center" colSpan="5" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF", fontSize: '9px', padding: '3px' }}>Other Earnings</TableCell>
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF", fontSize: '9px', padding: '3px' }}>Gross Pay</TableCell>
                                <TableCell align="center" colSpan="6" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF", fontSize: '9px', padding: '3px' }}>Other Deductions</TableCell>
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF", fontSize: '9px', padding: '3px' }}>Net Pay</TableCell>
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF", fontSize: '9px', padding: '3px' }}>Payable</TableCell>
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF", fontSize: '9px', padding: '3px' }}>C.FWRD</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF", fontSize: '9px', padding: '3px' }}>Sun {sunDate}</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF", fontSize: '9px', padding: '3px' }}>Mon {monDate}</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF", fontSize: '9px', padding: '3px' }}>Tue {tueDate}</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF", fontSize: '9px', padding: '3px' }}>Wed {wedDate}</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF", fontSize: '9px', padding: '3px' }}>Thu {thuDate}</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF", fontSize: '9px', padding: '3px' }}>Fri {friDate}</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF", fontSize: '9px', padding: '3px' }}>Sat {satDate}</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF", fontSize: '9px', padding: '3px' }}>Wages Total</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF", fontSize: '9px', padding: '3px' }}>Allowance (BCS)</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF", fontSize: '9px', padding: '3px' }}>Over Time</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF", fontSize: '9px', padding: '3px' }}>Cash Wages</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF", fontSize: '9px', padding: '3px' }}>Leave Wages</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF", fontSize: '9px', padding: '3px' }}>Others</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF", fontSize: '9px', padding: '3px' }}>PF/PF Aries</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF", fontSize: '9px', padding: '3px' }}>Ration</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF", fontSize: '9px', padding: '3px' }}>Elec</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF", fontSize: '9px', padding: '3px' }}>Union</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF", fontSize: '9px', padding: '3px' }}>Other</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF", fontSize: '9px', padding: '3px' }}>Total</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reportData.map((row, i) => (
                                <TableRow key={i}
                                >
                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black", fontSize: '9px', padding: '3px' }}> {row.registrationNumber}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black", fontSize: '9px', padding: '3px' }}> {row.firstName}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", fontSize: '9px', padding: '3px' }}> {row.cfAmount.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black", fontSize: '9px', padding: '3px' }}> {(row.SunTotal == 0) ? ("0.00") : ((row.SunL !== null) ? (row.SunL + " " + row.SunTotal.toFixed(2)) : row.SunTotal.toFixed(2))}</TableCell>
                                    <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black", fontSize: '9px', padding: '3px', backgroundColor: clr(row.MonTotal, row.MonL) }}> {(row.MonTotal == 0) ? ("A") : ((row.MonL !== null) ? (row.MonL + " " + row.MonTotal.toFixed(2)) : row.MonTotal.toFixed(2))}</TableCell>
                                    <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black", fontSize: '9px', padding: '3px', backgroundColor: clr(row.TueTotal, row.TueL) }}> {(row.TueTotal == 0) ? ("A") : ((row.TueL !== null) ? (row.TueL + " " + row.TueTotal.toFixed(2)) : row.TueTotal.toFixed(2))}</TableCell>
                                    <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black", fontSize: '9px', padding: '3px', backgroundColor: clr(row.WedTotal, row.WedL) }}> {(row.WedTotal == 0) ? ("A") : ((row.WedL !== null) ? (row.WedL + " " + row.WedTotal.toFixed(2)) : row.WedTotal.toFixed(2))}</TableCell>
                                    <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black", fontSize: '9px', padding: '3px', backgroundColor: clr(row.ThuTotal, row.ThuL) }}> {(row.ThuTotal == 0) ? ("A") : ((row.ThuL !== null) ? (row.ThuL + " " + row.ThuTotal.toFixed(2)) : row.ThuTotal.toFixed(2))}</TableCell>
                                    <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black", fontSize: '9px', padding: '3px', backgroundColor: clr(row.FriTotal, row.FriL) }}> {(row.FriTotal == 0) ? ("A") : ((row.FriL !== null) ? (row.FriL + " " + row.FriTotal.toFixed(2)) : row.FriTotal.toFixed(2))}</TableCell>
                                    <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black", fontSize: '9px', padding: '3px', backgroundColor: clr(row.SatTotal, row.SatL) }}> {(row.SatTotal == 0) ? ("A") : ((row.SatL !== null) ? (row.SatL + " " + row.SatTotal.toFixed(2)) : row.SatTotal.toFixed(2))}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", fontSize: '9px', padding: '3px' }}> {row.wagesTotal.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", fontSize: '9px', padding: '3px' }}> {row.totAllowance.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", fontSize: '9px', padding: '3px' }}> {(row.overTime.toFixed(2))}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", fontSize: '9px', padding: '3px' }}> {row.wagesCashTotal.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", fontSize: '9px', padding: '3px' }}> {(row.totalAdd.toFixed(2))}</TableCell> {/*Temp}*/}
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", fontSize: '9px', padding: '3px' }}> {(row.totalAdd.toFixed(2))}</TableCell> {/*Temp}*/}
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", fontSize: '9px', padding: '3px' }}> {row.totalGross.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", fontSize: '9px', padding: '3px' }}> {row.pfDeductionAmount.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", fontSize: '9px', padding: '3px' }}> {row.rationQuantity.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", fontSize: '9px', padding: '3px' }}> {row.eleDeduction.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", fontSize: '9px', padding: '3px' }}> {row.bcsuAmount.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", fontSize: '9px', padding: '3px' }}> {row.otherDeduction.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", fontSize: '9px', padding: '3px' }}> {row.totalDeduction.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", fontSize: '9px', padding: '3px' }}> {row.totalNet.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", fontSize: '9px', padding: '3px' }}> {row.payable.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", fontSize: '9px', padding: '3px' }}> {row.broughtForward.toFixed(2)}</TableCell>
                                </TableRow>
                            )
                            )}
                            <TableRow>
                                <TableCell align={'center'} colSpan="2" style={{ borderBottom: "none", border: "1px solid black", fontSize: '9px', padding: '3px' }}><b>Total</b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black", fontSize: '9px', padding: '3px' }}><b> {totalValues.totalCFWD.toFixed(2)}</b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black", fontSize: '9px', padding: '3px' }}><b> {totalValues.totalSun.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black", fontSize: '9px', padding: '3px' }}><b> {totalValues.totalMon.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black", fontSize: '9px', padding: '3px' }}><b> {totalValues.totalTue.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black", fontSize: '9px', padding: '3px' }}><b> {totalValues.totalWed.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black", fontSize: '9px', padding: '3px' }}><b> {totalValues.totalThu.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black", fontSize: '9px', padding: '3px' }}><b> {totalValues.totalFri.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black", fontSize: '9px', padding: '3px' }}><b> {totalValues.totalSat.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black", fontSize: '9px', padding: '3px' }}><b> {totalValues.totalWages.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black", fontSize: '9px', padding: '3px' }}><b> {totalValues.totalAllowance.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black", fontSize: '9px', padding: '3px' }}><b> {totalValues.totalOvertime.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black", fontSize: '9px', padding: '3px' }}><b> {totalValues.totalCashWages.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black", fontSize: '9px', padding: '3px' }}><b> {"0.00"} </b></TableCell> {/*Temp}*/}
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black", fontSize: '9px', padding: '3px' }}><b> {totalValues.totalDayAddtion.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black", fontSize: '9px', padding: '3px' }}><b> {totalValues.totalPayGross.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black", fontSize: '9px', padding: '3px' }}><b> {totalValues.totalPF.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black", fontSize: '9px', padding: '3px' }}><b> {totalValues.totalRationQty.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black", fontSize: '9px', padding: '3px' }}><b> {totalValues.totalelec.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black", fontSize: '9px', padding: '3px' }}><b> {totalValues.totalBCSU.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black", fontSize: '9px', padding: '3px' }}><b> {totalValues.totalOther.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black", fontSize: '9px', padding: '3px' }}><b> {totalValues.totalDeduction.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black", fontSize: '9px', padding: '3px' }}><b> {totalValues.totalNetPay.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black", fontSize: '9px', padding: '3px' }}><b> {totalValues.totalPayble.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black", fontSize: '9px', padding: '3px' }}><b> {totalValues.totalBFwd.toFixed(2)} </b></TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    <br/>
                    <div className="row pl-2 pb-4 pt-7">
                        <div className="col"><left><b>Created By: </b> {tokenService.getUserNameFromToken()}</left></div>
                        <div className="col"><left><b>Created Date: </b> {new Date().toISOString().split('T')[0]}</left></div>
                    </div>
                </TableContainer>
            </div>
        );
    }
}