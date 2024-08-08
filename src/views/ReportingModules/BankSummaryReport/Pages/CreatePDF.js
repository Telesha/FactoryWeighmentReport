import React from "react";
import tokenService from '../../../../utils/tokenDecoder';
import {
    Box,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Table
} from '@material-ui/core';


export default class ComponentToPrint extends React.Component {
    render() {
        const BankSummarySearchData = this.props.BankSummarySearchData;
        const BankSummaryList = this.props.BankSummaryList;
        const BankSummaryData = this.props.BankSummaryData;
        const TotalAmount = this.props.TotalAmount;

        return (
            <div>
                <h3><center>{BankSummarySearchData.factoryName}</center></h3>
                <div>&nbsp;</div>
                <h3><center>{BankSummarySearchData.routeName}</center></h3>
                <div>&nbsp;</div>
                <h3><center>Balance Payment For the Month of  {BankSummaryList.month}-{BankSummaryList.year}</center></h3>
                <div>&nbsp;</div>
                <h3><center><u>Bank Summary</u></center></h3>

                <div>&nbsp;</div>
                <div>
                    <Box minWidth={1050}>
                        <TableContainer >
                            <Table aria-label="caption table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align={'center'}>Name</TableCell>
                                        <TableCell align={'center'}>Amount</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {BankSummaryData.map((data, index) => (
                                        <TableRow key={index}>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.bankName}-{data.branchName}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.amount}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableRow>
                                    <TableCell align={'center'}><b>Total</b></TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {TotalAmount} </b>
                                    </TableCell>
                                </TableRow>
                            </Table>
                        </TableContainer>
                    </Box>
                </div>
                <div>&nbsp;</div>
                <h3><center>***** End of List *****</center></h3>
            </div>
        );

    }

}