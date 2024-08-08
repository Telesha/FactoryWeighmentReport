import React from "react";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Page from 'src/components/Page';
import Box from '@material-ui/core/Box';


export default class ComponentToPrint extends React.Component {
    render() {
        const searchData = this.props.searchData;
        const pruningDetailData = this.props.pruningDetailData;
        const totalValues = this.props.totalValues;

        return (
            <div>
                <style>
                    {`
        @page {
            size: A4 portrait;
            margin-top: 0.75in;
            margin-bottom: 0.75in;
            margin-right: 0.4in;
            margin-left: 0.4in;
        }
    `}
                </style>
                <h2><u>Pruning Details</u></h2>
                <br />
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><b>Business Division: </b> {searchData.groupName}</div>
                    <div className="col"><b>Location: </b> {searchData.estateName}</div>
                    <div className="col"><b>Sub Division: </b> {searchData.divisionName == undefined ? 'All Sub Divisions' : searchData.divisionName}</div>
                    <div className="col"><b>Field: </b> {searchData.fieldName == undefined ? 'All Fields' : searchData.fieldName}</div>
                    <div className="col"><b>Product: </b> {searchData.productName == undefined ? 'All Products' : searchData.productName}</div>
                </div>
                <br />
                <Box minWidth={1050}>
                    <TableContainer>
                        <Table aria-label="simple table" size='small'>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="left" style={{ fontSize: '10px', fontWeight: "bold", border: "1px solid black", padding: '3px' }}>Pruning Details</TableCell>
                                    <TableCell align="left" style={{ fontSize: '10px', fontWeight: "bold", border: "1px solid black", padding: '3px' }}>Field Name</TableCell>
                                    <TableCell align="left" style={{ fontSize: '10px', fontWeight: "bold", border: "1px solid black", padding: '3px' }}>Pruning Type Name</TableCell>
                                    <TableCell align="right" style={{ fontSize: '10px', fontWeight: "bold", border: "1px solid black", padding: '3px' }}>Field Area</TableCell>
                                    <TableCell align="right" style={{ fontSize: '10px', fontWeight: "bold", border: "1px solid black", padding: '3px' }}>Height</TableCell>
                                    <TableCell align="right" style={{ fontSize: '10px', fontWeight: "bold", border: "1px solid black", padding: '3px' }}>Allowance</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pruningDetailData.map((rows, i) => (
                                    <>
                                        <TableRow key={i}>
                                            <TableCell colSpan={6} align="left" style={{ fontWeight: "bold", border: "1px dashed black" }}> {"Field : " + rows.fieldName}</TableCell>
                                        </TableRow>
                                        {rows.tasks.map((row) => {
                                            return (
                                                <TableRow key={i}>
                                                    <TableCell component="th" scope="row" align="left" style={{ fontSize: "10px", border: "1px dashed black", padding: '3px' }}> {row.pruningDetails}</TableCell>
                                                    <TableCell component="th" scope="row" align="left" style={{ fontSize: "10px", border: "1px dashed black", padding: '3px' }}> {row.fieldName}</TableCell>
                                                    <TableCell component="th" scope="row" align="left" style={{ fontSize: "10px", border: "1px dashed black", padding: '3px' }}> {row.pruningTypeName}</TableCell>
                                                    <TableCell component="th" scope="row" align="right" style={{ fontSize: "10px", border: "1px dashed black", padding: '3px' }}> {row.fieldArea}</TableCell>
                                                    <TableCell component="th" scope="row" align="right" style={{ fontSize: "10px", border: "1px dashed black", padding: '3px' }}> {row.height}</TableCell>
                                                    <TableCell component="th" scope="row" align="right" style={{ fontSize: "10px", border: "1px dashed black", padding: '3px' }}> {row.allowance}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </>
                                ))}
                            </TableBody>
                            <TableRow>
                                <TableCell colSpan={3} align={'center'} style={{ borderBottom: "1px solid black", border: "1px solid black" }}><b>Total</b></TableCell>
                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                    <b> {(totalValues.totalFieldArea).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                </TableCell>
                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "1px solid black", border: "1px solid black" }}>
                                    <b> {(totalValues.totalHeight).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                </TableCell>
                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "1px solid black", border: "1px solid black" }}>
                                    <b> {(totalValues.totalAllowance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                </TableCell>
                            </TableRow>
                        </Table>
                    </TableContainer>
                </Box>
            </div>
        );
    }
}