import React from "react";
import {
  Box,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Table
} from '@material-ui/core';
import moment from 'moment';

export default class ComponentToPrint extends React.Component {

  render() {
    const searchData = this.props.searchData;
    const WeeklyPaymentSheetData = this.props.WeeklyPaymentSheetData;
    const grandTotalValues = this.props.grandTotalValues;

    let fromDate = moment(searchData.date).format('YYYY/MM/DD')
    let toDate = moment(new Date(fromDate).setDate(new Date(fromDate).getDate() + 6)).format('YYYY/MM/DD')

    return (
      <div>
        <style>
          {`
                    @page{
                        size: Legal landscape;
                        margin-top: 0.5in;  
                        margin-bottom: 0.5in; 
                        margin-right: 0.5in;  
                        margin-left: 0.5in;
                    }
                    `}

        </style>

        <h2><left><u>Weekly Payment Sheet F1</u></left></h2>
        <br />
        <div className="row pl-2 pb-4 pt-4">
          <div className="col"><left><b>Business Division : </b> {searchData.groupName}</left></div>
          <div className="col"><left><b>Location : </b> {searchData.gardenName == undefined ? "All Locations" : searchData.gardenName}</left></div>
          <div className="col"><left><b>Pay Point : </b> {searchData.payPointID == undefined ? "All Pay Point" : searchData.payPointID}</left></div>
          <div className="col"><left><b>Date : </b> {fromDate} - {toDate} </left></div>
        </div>
        <br />
        <Box>
          <>
            {WeeklyPaymentSheetData.map((dataOne, i) => {
              return (
                <>
                  <>
                    <TableRow>
                      <TableCell size='small' colSpan={17} align="left" style={{ fontWeight: 'bolder' }}>
                        Pay Point :  {dataOne.divisionName}
                      </TableCell>
                    </TableRow>
                    <Table aria-label="simple table" size='small'>
                      <TableHead >
                        <TableRow>
                          <TableCell align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px', padding: '3px' }}>Reg.No</TableCell>
                          <TableCell align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}>PF.No</TableCell>
                          <TableCell align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}>Emp.Name</TableCell>
                          <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}>Work Days</TableCell>
                          <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}>Pluck Kgs</TableCell>
                          <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}>Latex Kgs</TableCell>
                          <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}>Cash Wages</TableCell>
                          <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}>Over Kilo&nbsp;Amt</TableCell>
                          <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}>Leave Wages</TableCell>
                          <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}>O.T Wages</TableCell>
                          <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}>B/F</TableCell>
                          <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}>Gross</TableCell>
                          <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}>P.F.</TableCell>
                          <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}>Total Deduct.</TableCell>
                          <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}>Payable</TableCell>
                          <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}>C/F</TableCell>
                          <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}>Net</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dataOne.details.map((data, i) => {
                          return (
                            <React.Fragment key={i}>
                              <TableRow>
                                <TableCell colSpan={17} align="left" style={{ fontWeight: 'bolder', color: 'green', borderBottom: '1px solid black', fontSize: '10px', padding: '3px' }}>
                                  Category :  {data.employeeSubCategoryName}
                                </TableCell>
                              </TableRow>
                              {data.details.map((row, k) => {
                                return (
                                  <TableRow key={i}>
                                    <TableCell component="th" scope="row" align="left" style={{ borderBottom: "1px dashed black", fontSize: '10px', padding: '3px' }}> {row.registrationNumber}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ borderBottom: "1px dashed black", fontSize: '10px', padding: '3px' }}> {row.epfNumber == null || row.epfNumber == "" || row.epfNumber == "NULL" ? '-' : row.epfNumber}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ borderBottom: "1px dashed black", fontSize: '10px', padding: '3px' }}> {row.firstName}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", fontSize: '10px', padding: '3px' }}> {row.workCount <= 0 ? '-' : parseInt(row.workCount)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", fontSize: '10px', padding: '3px' }}> {'-'}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", fontSize: '10px', padding: '3px' }}> {'-'}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", fontSize: '10px', padding: '3px' }}> {row.otAmount == 0 ? '-' : row.otAmount.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", fontSize: '10px', padding: '3px' }}> {'-'}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", fontSize: '10px', padding: '3px' }}> {row.leaveAmount == 0 ? '-' : row.leaveAmount.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", fontSize: '10px', padding: '3px' }}> {'-'}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", fontSize: '10px', padding: '3px' }}> {'-'}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", fontSize: '10px', padding: '3px' }}> {row.totalEarnings == 0 ? '-' : row.totalEarnings.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", fontSize: '10px', padding: '3px' }}> {row.pfDeductionAmount == 0 ? '-' : Math.round(row.pfDeductionAmount).toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", fontSize: '10px', padding: '3px' }}> {row.totalDeduction == 0 ? '-' : row.totalDeduction.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", fontSize: '10px', padding: '3px' }}> {row.netPayable == 0 ? '-' : row.netPayable.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", fontSize: '10px', padding: '3px' }}> {row.roundOff == 0 ? '-' : row.roundOff.toFixed(2)}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", fontSize: '10px', padding: '3px' }}> {row.netPay == 0 ? '-' : row.netPay.toFixed(2)}</TableCell>
                                  </TableRow>
                                );
                              })}
                              <TableRow>
                                <TableCell component="th" scope="row" align="left" colSpan={3} style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> Category Total</TableCell>
                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {data.workCount <= 0 ? '-' : parseInt(data.workCount)}</TableCell>
                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {'-'}</TableCell>
                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {'-'}</TableCell>
                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {data.otAmount == 0 ? '-' : data.otAmount.toFixed(2)}</TableCell>
                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {'-'}</TableCell>
                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {data.leaveAmount == 0 ? '-' : data.leaveAmount.toFixed(2)}</TableCell>
                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {'-'}</TableCell>
                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {'-'}</TableCell>
                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {data.totalEarnings == 0 ? '-' : data.totalEarnings.toFixed(2)}</TableCell>
                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {data.pfDeductionAmount == 0 ? '-' : Math.round(data.pfDeductionAmount).toFixed(2)}</TableCell>
                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {data.totalDeduction == 0 ? '-' : data.totalDeduction.toFixed(2)}</TableCell>
                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {data.netPayable == 0 ? '-' : data.netPayable.toFixed(2)}</TableCell>
                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {data.roundOff == 0 ? '-' : data.roundOff.toFixed(2)}</TableCell>
                                <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {data.netPay == 0 ? '-' : data.netPay.toFixed(2)}</TableCell>
                              </TableRow>
                            </React.Fragment>
                          );
                        })}
                      </TableBody>
                      <TableRow>
                        <TableCell component="th" scope="row" align="left" colSpan={3} style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> Outgarden Total</TableCell>
                        <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {dataOne.workCount <= 0 ? '-' : parseInt(dataOne.workCount)}</TableCell>
                        <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {'-'}</TableCell>
                        <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {'-'}</TableCell>
                        <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {dataOne.otAmount == 0 ? '-' : dataOne.otAmount.toFixed(2)}</TableCell>
                        <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {'-'}</TableCell>
                        <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {dataOne.leaveAmount == 0 ? '-' : dataOne.leaveAmount.toFixed(2)}</TableCell>
                        <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {'-'}</TableCell>
                        <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {'-'}</TableCell>
                        <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {dataOne.totalEarnings == 0 ? '-' : dataOne.totalEarnings.toFixed(2)}</TableCell>
                        <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {dataOne.pfDeductionAmount == 0 ? '-' : Math.round(dataOne.pfDeductionAmount).toFixed(2)}</TableCell>
                        <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {dataOne.totalDeduction == 0 ? '-' : dataOne.totalDeduction.toFixed(2)}</TableCell>
                        <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {dataOne.netPayable == 0 ? '-' : dataOne.netPayable.toFixed(2)}</TableCell>
                        <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {dataOne.roundOff == 0 ? '-' : dataOne.roundOff.toFixed(2)}</TableCell>
                        <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {dataOne.netPay == 0 ? '-' : dataOne.netPay.toFixed(2)}</TableCell>
                      </TableRow>
                    </Table>
                  </>

                  <br />
                </>
              );
            })}
            <>
              <TableRow>
                <TableCell size='small' colSpan={17} align="left" style={{ fontWeight: 'bolder', marginTop: '3px', marginBottom: '3px' }}>
                  Total Table
                </TableCell>
              </TableRow>
              <Table aria-label="simple table" size='small'>
                <TableHead >
                  <TableRow>
                    <TableCell align="left" colSpan={3} style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}>Pay Point</TableCell>
                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}>Work Days</TableCell>
                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}>Pluck Kgs</TableCell>
                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}>Latex Kgs</TableCell>
                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}>Cash Wages</TableCell>
                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}>Over Kilo&nbsp;Amt</TableCell>
                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}>Leave Wages</TableCell>
                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}>O.T Wages</TableCell>
                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}>B/F Wages</TableCell>
                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}>Total Earnings</TableCell>
                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}>P.F. Amount</TableCell>
                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}>Total Deductions</TableCell>
                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}>Net Payble</TableCell>
                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}>Rounded Off</TableCell>
                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}>Net&nbsp;pay</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {WeeklyPaymentSheetData.map((row, i) => {
                    return (
                      <TableRow key={i}>
                        <TableCell align="left" colSpan={3} style={{ fontWeight: "bold", borderBottom: "1px dashed black", fontSize: '10px', padding: '3px' }}> {row.divisionName}</TableCell>
                        <TableCell align="right" style={{ fontWeight: "bold", borderBottom: "1px dashed black", fontSize: '10px', padding: '3px' }}> {row.workCount <= 0 ? '-' : parseInt(row.workCount)}</TableCell>
                        <TableCell align="right" style={{ fontWeight: "bold", borderBottom: "1px dashed black", fontSize: '10px', padding: '3px' }}> {'-'}</TableCell>
                        <TableCell align="right" style={{ fontWeight: "bold", borderBottom: "1px dashed black", fontSize: '10px', padding: '3px' }}> {'-'}</TableCell>
                        <TableCell align="right" style={{ fontWeight: "bold", borderBottom: "1px dashed black", fontSize: '10px', padding: '3px' }}> {row.otAmount == 0 ? '-' : row.otAmount.toFixed(2)}</TableCell>
                        <TableCell align="right" style={{ fontWeight: "bold", borderBottom: "1px dashed black", fontSize: '10px', padding: '3px' }}> {'-'}</TableCell>
                        <TableCell align="right" style={{ fontWeight: "bold", borderBottom: "1px dashed black", fontSize: '10px', padding: '3px' }}> {row.leaveAmount == 0 ? '-' : row.leaveAmount.toFixed(2)}</TableCell>
                        <TableCell align="right" style={{ fontWeight: "bold", borderBottom: "1px dashed black", fontSize: '10px', padding: '3px' }}> {'-'}</TableCell>
                        <TableCell align="right" style={{ fontWeight: "bold", borderBottom: "1px dashed black", fontSize: '10px', padding: '3px' }}> {'-'}</TableCell>
                        <TableCell align="right" style={{ fontWeight: "bold", borderBottom: "1px dashed black", fontSize: '10px', padding: '3px' }}> {row.totalEarnings == 0 ? '-' : row.totalEarnings.toFixed(2)}</TableCell>
                        <TableCell align="right" style={{ fontWeight: "bold", borderBottom: "1px dashed black", fontSize: '10px', padding: '3px' }}> {row.pfDeductionAmount == 0 ? '-' : Math.round(row.pfDeductionAmount).toFixed(2)}</TableCell>
                        <TableCell align="right" style={{ fontWeight: "bold", borderBottom: "1px dashed black", fontSize: '10px', padding: '3px' }}> {row.totalDeduction == 0 ? '-' : row.totalDeduction.toFixed(2)}</TableCell>
                        <TableCell align="right" style={{ fontWeight: "bold", borderBottom: "1px dashed black", fontSize: '10px', padding: '3px' }}> {row.netPayable == 0 ? '-' : row.netPayable.toFixed(2)}</TableCell>
                        <TableCell align="right" style={{ fontWeight: "bold", borderBottom: "1px dashed black", fontSize: '10px', padding: '3px' }}> {row.roundOff == 0 ? '-' : row.roundOff.toFixed(2)}</TableCell>
                        <TableCell align="right" style={{ fontWeight: "bold", borderBottom: "1px dashed black", fontSize: '10px', padding: '3px' }}> {row.netPay == 0 ? '-' : row.netPay.toFixed(2)}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
                <TableRow>
                  <TableCell component="th" scope="row" align="left" colSpan={3} style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> Grand Total</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {grandTotalValues.workCount <= 0 ? '-' : parseInt(grandTotalValues.workCount)}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {'-'}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {'-'}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {grandTotalValues.otAmount == 0 ? '-' : grandTotalValues.otAmount.toFixed(2)}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {'-'}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {grandTotalValues.leaveAmount == 0 ? '-' : grandTotalValues.leaveAmount.toFixed(2)}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {'-'}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {'-'}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {grandTotalValues.totalEarnings == 0 ? '-' : grandTotalValues.totalEarnings.toFixed(2)}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {grandTotalValues.pfDeductionAmount == 0 ? '-' : Math.round(grandTotalValues.pfDeductionAmount).toFixed(2)}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {grandTotalValues.totalDeduction == 0 ? '-' : grandTotalValues.totalDeduction.toFixed(2)}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {grandTotalValues.netPayable == 0 ? '-' : grandTotalValues.netPayable.toFixed(2)}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {grandTotalValues.roundOff == 0 ? '-' : grandTotalValues.roundOff.toFixed(2)}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', fontSize: '10px', padding: '3px' }}> {grandTotalValues.netPay == 0 ? '-' : grandTotalValues.netPay.toFixed(2)}</TableCell>
                </TableRow>
              </Table>
            </>
          </>
        </Box>
      </div>
    );

  }

}
