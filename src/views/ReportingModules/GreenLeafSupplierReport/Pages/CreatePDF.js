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

        const supplierReportData = this.props.supplierReportData;
        const searchData = this.props.searchData;

        function calclateTotalWeight(data) {
            let totalWeight = (data.january + data.february + data.march + data.april + data.may + data.june + data.july +
                data.august + data.september + data.october + data.november + data.december);
            return totalWeight;
        }

        return (
            <div>

                <h2><center><u>Green Leaf Supplier Details Summary</u></center></h2>
                <div>&nbsp;</div>
                <h2><center>{searchData.groupName} - {searchData.factoryName}</center></h2>
                <div>&nbsp;</div>
                <div>
                    <Box minWidth={1220}>
                        <TableContainer>
                            <Table aria-label="caption table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align={'center'}>Reg No.</TableCell>
                                        <TableCell align={'center'}>Supplier Name</TableCell>
                                        <TableCell align={'center'}>January</TableCell>
                                        <TableCell align={'center'}>February</TableCell>
                                        <TableCell align={'center'}>March</TableCell>
                                        <TableCell align={'center'}>April</TableCell>
                                        <TableCell align={'center'}>May</TableCell>
                                        <TableCell align={'center'}>June</TableCell>
                                        <TableCell align={'center'}>July</TableCell>
                                        <TableCell align={'center'}>August</TableCell>
                                        <TableCell align={'center'}>September</TableCell>
                                        <TableCell align={'center'}>October</TableCell>
                                        <TableCell align={'center'}>November</TableCell>
                                        <TableCell align={'center'}>December</TableCell>
                                        <TableCell align={'center'}>Total</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {supplierReportData.map((data, index) => (
                                        <TableRow key={index}>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.registrationNumber}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.supplierName}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.january}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.february}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.march}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.april}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.may}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.june}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.july}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.august}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.september}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.october}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.november}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.december}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", fontWeight: 'bold' }}>
                                                {calclateTotalWeight(data)}
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