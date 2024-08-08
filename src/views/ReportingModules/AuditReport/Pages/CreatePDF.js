import React from 'react';
import {
  Box,
  Card,
  Grid,
  TextField,
  Container,
  CardContent,
  Divider,
  CardHeader,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Table,
  TableFooter
} from '@material-ui/core';

export default class ComponentToPrint extends React.Component {
  render() {
    const auditReportData = this.props.auditReportData;
    const total = this.props.total;
    const totForPer = this.props.totForPer;
    const searchData = this.props.searchData;
    const individualTotalAmount = this.props.individualTotalAmount;

    return (
      <div>
        <div
          style={{
            width: '1093px',
            height: '1059px',
            padding: '20px',
            marginBottom: '14rem'
          }}
        >
          <br />
          <h2 style={{marginBottom:'15px'}}>
            <center>
              <u>Audit Report</u>
            </center>
          </h2>
          <h3>
            <center>
              {' '}
              Factory Name: {searchData.factoryName}
              Date:{' '}{searchData.startDate} - {searchData.endDate}
              {searchData.accountType != undefined ?
                ' Account Type: ' : null}
              {searchData.accountType != undefined ?
                searchData.accountType : null}
            </center>
          </h3>
          <div>&nbsp;</div>
          <div>
            <Box minWidth={1050}>
              <TableContainer >
                <Table aria-label="caption table">
                  <TableHead></TableHead>
                  <TableBody>
                    {auditReportData.map((data, index) => (
                      <TableContainer key={index}>
                        <Table aria-label="caption table">
                          <TableRow
                            style={{
                              backgroundColor: '#B0C4DE',
                              fontWeight: 'bold'
                            }}
                          >
                            <TableCell align={'center'}>
                              Account Name: {data.ledgerAccountName}
                            </TableCell>
                            <TableCell align={'center'}>
                              Account Code: {data.ledgerAccountCode}
                            </TableCell>
                            <TableCell align={'center'}>
                              Opening Balance: {data.totalDebit}
                            </TableCell>
                          </TableRow>
                        </Table>
                        <Table>
                          <TableRow>
                            <TableCell align={'center'}>Voucher</TableCell>
                            <TableCell align={'center'}>Date</TableCell>
                            <TableCell align={'center'}>Description</TableCell>

                            <TableCell align={'center'}>
                              Cheque Number
                            </TableCell>
                            <TableCell align={'center'}>Debit Amount</TableCell>
                            <TableCell align={'center'}>
                              Credit Amount
                            </TableCell>
                          </TableRow>
                          {data.auditReportList.map((data1, index) => (
                            <TableRow key={index}>
                              <TableCell
                                align={'center'}
                                component="th"
                                scope="row"
                                style={{ borderBottom: 'none' }}
                              >
                                {data1.voucherCodeRefNumber}
                              </TableCell>
                              <TableCell
                                align={'center'}
                                component="th"
                                scope="row"
                                style={{ borderBottom: 'none' }}
                              >
                                {data1.date.split('T')[0]}
                              </TableCell>
                              <TableCell
                                align={'center'}
                                component="th"
                                scope="row"
                                style={{ borderBottom: 'none' }}
                              >
                                {data1.description}
                              </TableCell>
                              <TableCell
                                align={'center'}
                                component="th"
                                scope="row"
                                style={{ borderBottom: 'none' }}
                              >
                                {data1.chequeNumber}
                              </TableCell>
                              <TableCell
                                align={'center'}
                                component="th"
                                scope="row"
                                style={{ borderBottom: 'none' }}
                              >
                                {data1.debit}
                              </TableCell>
                              <TableCell align={'center'}>
                                {data1.credit}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow bgcolor="#FFFFE0">
                            <TableCell align={'center'}>
                              <b>Total</b>
                            </TableCell>
                            <TableCell align={'center'}></TableCell>
                            <TableCell align={'center'}></TableCell>
                            <TableCell align={'center'}></TableCell>
                            <TableCell align={'center'}>
                              {data.auditReportList.debit}
                            </TableCell>
                            <TableCell align={'center'}>
                              {data.auditReportList.credit}
                            </TableCell>
                            <TableCell align={'left'}></TableCell>
                          </TableRow>

                          <TableRow bgcolor="#D3D3D3">
                            <TableCell align={'center'}>
                              <b>Closing Balance</b>
                            </TableCell>
                            <TableCell align={'center'}></TableCell>
                            <TableCell align={'center'}></TableCell>
                            <TableCell align={'center'}></TableCell>
                            <TableCell align={'center'}>
                              {data.totalCredit}
                            </TableCell>
                            <TableCell align={'center'}>

                            </TableCell>
                            <TableCell align={'left'}></TableCell>
                          </TableRow>

                          <br></br>
                          <br></br>
                        </Table>
                      </TableContainer>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </div>
        </div>
      </div>
    );
  }
}
