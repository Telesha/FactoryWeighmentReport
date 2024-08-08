import React from "react";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Box from '@material-ui/core/Box';
import moment from "moment";

export default class ComponentToPrint extends React.Component {
    render() {
        const searchData = this.props.searchData;
        const fieldDetailsData = this.props.fieldDetailsData;
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
                <h2><u>FIELD DETAILS</u></h2>
                <br />
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><b>Business Division: </b> {searchData.groupName}</div>
                    <div className="col"><b>Location: </b> {searchData.estateName}</div>
                    <div className="col"><b>Sub Division: </b> {searchData.divisionName == undefined ? 'All Sub Divisions' : searchData.divisionName}</div>
                    <div className="col"><b>Product: </b> {searchData.productName == undefined ? 'All Products' : searchData.productName}</div>
                </div>
                <br />
                <Box minWidth={1050}>
                    <TableContainer>
                        <Table aria-label="simple table" size='small'>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="left" style={{ fontSize: '10px', fontWeight: "bold", border: "1px solid black", width: '100px', padding: '3px' }}>Field Code</TableCell>
                                    <TableCell align="right" style={{ fontSize: '10px', fontWeight: "bold", border: "1px solid black", padding: '3px' }}>Field Area</TableCell>
                                    <TableCell align="right" style={{ fontSize: '10px', fontWeight: "bold", border: "1px solid black", padding: '3px' }}>Mature Area</TableCell>
                                    <TableCell align="right" style={{ fontSize: '10px', fontWeight: "bold", border: "1px solid black", padding: '3px' }}>Immature Area</TableCell>
                                    <TableCell align="left" style={{ fontSize: '10px', fontWeight: "bold", border: "1px solid black", padding: '3px' }}>Last Year of Planting </TableCell>
                                    <TableCell align="left" style={{ fontSize: '10px', fontWeight: "bold", border: "1px solid black", width: '150px', padding: '3px' }}>Spacing</TableCell>
                                    <TableCell align="right" style={{ fontSize: '10px', fontWeight: "bold", border: "1px solid black", padding: '3px' }}>Plants per Hectare</TableCell>
                                    <TableCell align="right" style={{ fontSize: '10px', fontWeight: "bold", border: "1px solid black", padding: '3px' }}>Vacancy Percentage</TableCell>
                                    <TableCell align="right" style={{ fontSize: '10px', fontWeight: "bold", border: "1px solid black", padding: '3px' }}>Actual Number of Plants</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {fieldDetailsData.map((row, i) => (
                                    <TableRow key={i}>
                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black", padding: '3px' }}> {row.fieldCode}</TableCell>
                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", padding: '3px' }}> {(row.area).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", padding: '3px' }}> {(row.cultivationArea).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", padding: '3px' }}> {(row.area - row.cultivationArea).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                        <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black", padding: '3px' }}> {moment(row.lastPlantingYear).format('YYYY')}</TableCell>
                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black", padding: '3px' }}> {(row.specing == "" || row.specing == null) ? '-' : row.specing}</TableCell>
                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", padding: '3px' }}> {row.plantsPerHectare.toLocaleString('en-US')}</TableCell>
                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", padding: '3px' }}> {row.vacancyPercentage}</TableCell>
                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", padding: '3px' }}> {row.noOfTeaBushes.toLocaleString('en-US')}</TableCell>
                                    </TableRow>
                                )
                                )}
                            </TableBody>
                            <TableRow>
                                <TableCell align={'center'} style={{ borderBottom: "none", border: "1px solid black", padding: '3px' }}><b>Total</b></TableCell>
                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black", padding: '3px' }}>
                                    <b> {(totalValues.totalArea).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                </TableCell>
                                <TableCell align={'right'} style={{ borderBottom: "none", border: "1px solid black", padding: '3px' }}>
                                    <b> {(totalValues.totalCultivationArea).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                </TableCell>
                                <TableCell align={'right'} style={{ borderBottom: "none", border: "1px solid black", padding: '3px' }}>
                                    <b> {(totalValues.totalArea - totalValues.totalCultivationArea).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                </TableCell>
                                <TableCell style={{ borderBottom: "none", border: "1px solid black", padding: '3px' }}></TableCell>
                                <TableCell style={{ borderBottom: "none", border: "1px solid black", padding: '3px' }}></TableCell>
                                <TableCell style={{ borderBottom: "none", border: "1px solid black", padding: '3px' }}></TableCell>
                                <TableCell style={{ borderBottom: "none", border: "1px solid black", padding: '3px' }}></TableCell>
                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black", padding: '3px' }}>
                                    <b> {(totalValues.totalNoOfTeaBushes).toLocaleString('en-US')} </b>
                                </TableCell>
                            </TableRow>
                        </Table>
                    </TableContainer>
                </Box>
            </div>
        );
    }
}