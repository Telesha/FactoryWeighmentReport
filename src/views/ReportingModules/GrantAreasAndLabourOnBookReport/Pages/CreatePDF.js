import React from "react";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Box from '@material-ui/core/Box';

export default class ComponentToPrint extends React.Component {
    render() {
        const searchData = this.props.searchData;
        const groupComplex = this.props.groupComplex;
        const totalGrantArea = this.props.totalGrantArea;
        const totalLabourOnBook = this.props.totalLabourOnBook;

        return (
            <div>
                <style>
                    {`
            @page {
              margin: 0.75in;
            }
          `}
                </style>
                <h3><left><u>GRANT AREA AND LABOUR ON BOOK</u></left></h3>
                <br />
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><left><b>Business Division: </b> {searchData.groupName == undefined ? 'All Business Divisions' : searchData.groupName}</left></div>
                </div>
                <br />
                <Box minWidth={1050}>
                    <TableContainer style={{ maxWidth: 'calc(100% - 1.5in)' }}>
                        <Table aria-label="simple table" size='small'>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="left" style={{ fontWeight: "bold" }}> Particulars </TableCell>
                                    <TableCell align="right" style={{ fontWeight: "bold", width: "180px" }}> Labour on Book </TableCell>
                                    <TableCell align="right" style={{ fontWeight: "bold", width: "180px" }}> Grant Area </TableCell>
                                    <TableCell align="right" style={{ fontWeight: "bold", width: "180px" }}> Labour per Hectare </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {groupComplex.map((group, i) => {
                                    let TtotalLabourOnBook = 0;
                                    let TtotalGrantArea = 0;
                                    return (
                                        <React.Fragment key={i}>
                                            <TableRow>
                                                <TableCell colSpan={4} component="th" scope="row" align="left" style={{ fontWeight: 'bolder', color: 'red' }}>{group.masterGroupName}</TableCell>
                                            </TableRow>
                                            {group.details.map((grp, j) => {
                                                let totalLabourOnBook = 0;
                                                let totalGrantArea = 0;
                                                let totalGrantLabour = 0;
                                                return (
                                                    <React.Fragment key={j}>
                                                        <TableRow>
                                                            <TableCell colSpan={4} component="th" scope="row" align="left" style={{ fontWeight: 'bolder' }}>{grp.groupName}</TableCell>
                                                        </TableRow>
                                                        {grp.detailsx.map((detail, k) => {
                                                            totalLabourOnBook += parseFloat(detail.labourOnBook);
                                                            totalGrantArea += parseFloat(detail.grantArea);
                                                            totalGrantLabour = parseFloat(detail.labourOnBook) / parseFloat(detail.grantArea)
                                                            TtotalLabourOnBook += parseFloat(detail.labourOnBook);
                                                            TtotalGrantArea += parseFloat(detail.grantArea);
                                                            return (
                                                                <TableRow key={`${i}-${j}-${k}`}>
                                                                    <TableCell component="th" scope="row" align="left" style={{}}>{detail.factoryName}</TableCell>
                                                                    <TableCell align="right" >{parseFloat(detail.labourOnBook).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                    <TableCell align="right" >{parseFloat(detail.grantArea).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                    <TableCell align="right" >{isNaN(totalGrantLabour) ? '0.00' : totalGrantLabour.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                </TableRow>
                                                            );
                                                        })}
                                                        <TableRow>
                                                            <TableCell align="left" style={{ fontWeight: "bold", fontStyle: "italic" }}>Sub Total</TableCell>
                                                            <TableCell align="right" style={{ fontWeight: "bold" }}>{parseFloat(totalLabourOnBook).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                            <TableCell align="right" style={{ fontWeight: "bold" }}>{parseFloat(totalGrantArea).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                            <TableCell align="right" style={{ fontWeight: "bold" }}>{isNaN(totalLabourOnBook / totalGrantArea) ? '0.00' : parseFloat(totalLabourOnBook / totalGrantArea).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        </TableRow>
                                                    </React.Fragment>
                                                );
                                            })}
                                            <TableRow>
                                                <TableCell align="left" style={{ fontWeight: "bold", fontStyle: "italic", color: 'blue' }}>Total</TableCell>
                                                <TableCell align="right" style={{ fontWeight: "bold", color: 'blue' }}>{TtotalLabourOnBook.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell align="right" style={{ fontWeight: "bold", color: 'blue' }}>{TtotalGrantArea.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell align="right" style={{ fontWeight: "bold", color: 'blue' }}>{isNaN(TtotalLabourOnBook / TtotalGrantArea) ? '0.00' : parseFloat(TtotalLabourOnBook / TtotalGrantArea).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            </TableRow>
                                        </React.Fragment>
                                    );
                                })}
                                <TableRow>
                                    <TableCell align="left" style={{ fontWeight: "bold", fontStyle: "italic", color: 'green' }}>Grand Total</TableCell>
                                    <TableCell align="right" style={{ fontWeight: "bold", color: 'green' }}>{totalLabourOnBook.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                    <TableCell align="right" style={{ fontWeight: "bold", color: 'green' }}>{totalGrantArea.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                    <TableCell align="right" style={{ fontWeight: "bold", color: 'green' }}>{isNaN(((totalLabourOnBook) / (totalGrantArea))) ? '0.00' : ((totalLabourOnBook) / (totalGrantArea)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </div>
        );
    }
}