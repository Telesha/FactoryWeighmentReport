import React from "react";
import {
  Box, Card, Grid, CardContent, Divider, CardHeader,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Table, TableFooter
} from '@material-ui/core';


export default class ComponentToPrint extends React.Component {

  render() {
    const advancePaymentData = this.props.advancedPaymentList;
    const advancedPaymentList = this.props.searchData;

    return (
      <div>
        <h3><center><u>Advanced Payment Details</u></center></h3>
        <div>&nbsp;</div>
        <h4><center>{advancedPaymentList.groupName} - {advancedPaymentList.factoryName}</center></h4>
        <h4><center>{advancedPaymentList.startDate} - {advancedPaymentList.endDate}</center></h4>
        <h4><center>{advancedPaymentList.routeName}</center></h4>
        <div>&nbsp;</div>
        <div>
          <Box minWidth={1050}>
            <TableContainer style={{ marginLeft: '5px' }}>
              <Table aria-label="caption table">
                <TableHead>
                  <TableRow>
                    <TableCell align={'left'}>Date</TableCell>
                    <TableCell align={'left'}>Route Name</TableCell>
                    <TableCell align={'left'}>Register Number</TableCell>
                    <TableCell align={'left'}>Requested Amount(Rs)</TableCell>
                    <TableCell align={'left'}>Approved Amount(Rs)</TableCell>
                    <TableCell align={'left'}>Source</TableCell>
                    <TableCell align={'left'}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {advancePaymentData.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.effectiveDate}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.routeName}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.registrationNumber}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.amount}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.approvedAmount}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.advanceRequestType == 1 ? "Mobile Advance" : data.advanceRequestType == 2 ? "Over Advance" : "Direct Advance"}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.statusID == 1 ? "Pending" : data.statusID == 2 ? "Issue" : data.statusID == 3 ? "Reject" : data.statusID == 4 ? "Send_To_Deliver" : data.statusID == 5 ? "Autherized" : "Delivered"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </div>
      </div>
    );
  }
}
