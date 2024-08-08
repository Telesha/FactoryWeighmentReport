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
                <h3><center><u>Weekly Payment Report</u></center></h3>
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><center><b>Garden: </b> {searchData.gardenName}</center></div>
                    <div className="col"><center><b>Employee Type: </b> {searchData.empTypeName === "" ? "All Employee Types" : searchData.empTypeName}</center></div>
                    <div className="col"><center><b>Duffa: </b> {searchData.gangName === "" ? "All Duffas" : searchData.gangName}</center></div>
                    <div className="col"><center><b>Emp.ID: </b> {searchData.registrationNumber == "" ? "All Employees" : searchData.registrationNumber}</center></div>
                    <div className="col"><center><b>Book: </b> {searchData.bookName === "" ? "All Books" : searchData.bookName}</center></div>
                    <div className="col"><center><b>From Date: </b> {searchData.fromDate}</center></div>
                    <div className="col"><center><b>To Date: </b> {searchData.toDate}</center></div>
                </div>
                <TableContainer component={Paper}>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Emp.ID</TableCell>
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Emp.Name</TableCell>
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Emp.Type</TableCell>
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>PF.No</TableCell>
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>B.FWRD</TableCell>
                                <TableCell align="center" colSpan="8" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Wages</TableCell>
                                <TableCell align="center" colSpan="3" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Other Earnings</TableCell>
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Gross Pay</TableCell>
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>PF Basic</TableCell>
                                <TableCell align="center" colSpan="6" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Deduction</TableCell>
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Net Pay</TableCell>
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Payable</TableCell>
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>C.FWRD</TableCell>
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Completed By</TableCell>
                                <TableCell align="center" rowSpan="2" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Completed Date</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Sat {satDate}</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Sun {sunDate}</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Mon {monDate}</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Tue {tueDate}</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Wed {wedDate}</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Thu {thuDate}</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Fri {friDate}</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Wages Total</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Allowance (BCS)</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Extra Allowance</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Overtime</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>PF/PF Aries</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>BCSU</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Elec</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Ration</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Other</TableCell>
                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", backgroundColor: "#C8BFBF" }}>Total</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reportData.map((row, i) => (
                                <TableRow key={i}
                                >
                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.registrationNumber}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.firstName}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.employeeTypeName}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.pfNumber == null ? "-" : row.pfNumber}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.cfAmount.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black", backgroundColor: clr(row.SatTotal, row.SatL) }}> {(row.SatTotal == 0) ? ("A") : ((row.SatL !== null) ? (row.SatL + " " + row.SatTotal.toFixed(2)) : row.SatTotal.toFixed(2))}</TableCell>
                                    <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black", backgroundColor: clr(row.SunTotal, row.SunL) }}> {(row.SunTotal == 0) ? ("A") : ((row.SunL !== null) ? (row.SunL + " " + row.SunTotal.toFixed(2)) : row.SunTotal.toFixed(2))}</TableCell>
                                    <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black", backgroundColor: clr(row.MonTotal, row.MonL) }}> {(row.MonTotal == 0) ? ("A") : ((row.MonL !== null) ? (row.MonL + " " + row.MonTotal.toFixed(2)) : row.MonTotal.toFixed(2))}</TableCell>
                                    <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black", backgroundColor: clr(row.TueTotal, row.TueL) }}> {(row.TueTotal == 0) ? ("A") : ((row.TueL !== null) ? (row.TueL + " " + row.TueTotal.toFixed(2)) : row.TueTotal.toFixed(2))}</TableCell>
                                    <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black", backgroundColor: clr(row.WedTotal, row.WedL) }}> {(row.WedTotal == 0) ? ("A") : ((row.WedL !== null) ? (row.WedL + " " + row.WedTotal.toFixed(2)) : row.WedTotal.toFixed(2))}</TableCell>
                                    <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black", backgroundColor: clr(row.ThuTotal, row.ThuL) }}> {(row.ThuTotal == 0) ? ("A") : ((row.ThuL !== null) ? (row.ThuL + " " + row.ThuTotal.toFixed(2)) : row.ThuTotal.toFixed(2))}</TableCell>
                                    <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black" }}>{(row.FriTotal == 0) ? ("0.00") : ((row.FriL !== null) ? (row.FriL + " " + row.FriTotal.toFixed(2)) : row.FriTotal.toFixed(2))}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.wagesTotal.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.totAllowance.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.totGAllowance.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {(row.overTime.toFixed(2))}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.totalGross.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {(row.employeeTypeID == 2) ? ("0.00") : row.baseTotal.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.pfDeductionAmount.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.bcsuAmount.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.eleDeduction.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.rationQuantity.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.otherDeduction.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.totalDeduction.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.totalNet.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.payable.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {row.broughtForward.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.userName}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.createdDate?.split('T')[0]}</TableCell>
                                </TableRow>
                            )
                            )}
                            <TableRow>
                                <TableCell align={'center'} style={{ borderBottom: "none", border: "1px solid black" }}><b>Total</b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }} ></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b>{totalValues.totalCFWD.toFixed(2)}</b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalSat.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalSun.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalMon.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalTue.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalWed.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalThu.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalFri.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalWages.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalAllowance.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalExAllowance.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalOvertime.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalPayGross.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalPfBasic.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalPF.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalBCSU.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalelec.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalRation.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalOther.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalDeduction.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalNetPay.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalPayble.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}><b> {totalValues.totalBFwd.toFixed(2)} </b></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                <TableCell align="right" style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    <div className="row pl-2 pb-4 pt-7">
                        <div className="col"><center><b>Created By: </b> {tokenService.getUserNameFromToken()}</center></div>
                        <div className="col"><center><b>Created Date: </b> {new Date().toISOString().split('T')[0]}</center></div>
                    </div>
                </TableContainer>
            </div>
        );
    }
}