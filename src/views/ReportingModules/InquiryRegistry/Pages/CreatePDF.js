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

        // const InquiryRegistry = this.props.InquiryRegistry;
        const TransactionDetails = this.props.TransactionDetails;
        const PdfExcelGeneralDetails = this.props.PdfExcelGeneralDetails;
        return (
            <div>
                <h3><center><u>Inquiry Registry Report</u></center></h3>
                <div>&nbsp;</div>
                <h2><center><u>Group: {PdfExcelGeneralDetails.groupName} - Factory: {PdfExcelGeneralDetails.factoryName}</u></center></h2>
                <div>&nbsp;</div>
                <h2><center><u>From {PdfExcelGeneralDetails.fromDate} To {PdfExcelGeneralDetails.endDate}</u></center></h2>
                <div>&nbsp;</div>
                <div>
                    <Box minWidth={1050}>
                        <TableContainer >
                            <Table aria-label="caption table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align={'center'}>Reference No</TableCell>
                                        <TableCell align={'center'}>Date</TableCell>
                                        <TableCell align={'center'}>Description</TableCell>
                                        <TableCell align={'center'}>Cheque No</TableCell>
                                        <TableCell align={'center'}>Reg No</TableCell>
                                        <TableCell align={'center'}>Debit(Rs.)</TableCell>
                                        <TableCell align={'center'}>Credit(Rs.)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {TransactionDetails.map((data, index) => (
                                        <TableRow key={index}>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.referenceNumber}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.date.split('T')[0]}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.description}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.chequeNumber}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.registrationNumber}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.debit.toLocaleString()}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.credit.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
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
