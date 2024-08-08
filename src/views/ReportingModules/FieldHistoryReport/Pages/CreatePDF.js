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
                size: A4 landscape;
              margin: 20mm;
            }
          `}
                </style>
                <h3><center><u>FIELD HISTORY DETAILS</u></center></h3>
                <br />
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><center><b>Business Division: </b> {searchData.groupName}</center></div>
                    <div className="col"><center><b>Location: </b> {searchData.estateName}</center></div>
                    <div className="col"><center><b>Sub Division: </b> {searchData.divisionName == undefined ? 'All Sub Divisions' : searchData.divisionName}</center></div>
                    <div className="col"><center><b>Product: </b> {searchData.productName == undefined ? 'All Products' : searchData.productName}</center></div>
                </div>
                <br />
                <Box minWidth={1050} style={{ margin: 'auto', textAlign: 'center' }}>
                    <TableContainer style={{ maxWidth: 'calc(100% - 1.5in)', margin: 'auto' }}>
                        <Table aria-label="simple table" size='small'>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px dotted black" }}>Business Division</TableCell>
                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px dotted black" }}>Location</TableCell>
                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px dotted black" }}>Sub Division</TableCell>
                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px dotted black" }}>Field Name</TableCell>
                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px dotted black" }}>Planting Type</TableCell>
                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px dotted black" }}>Spacing</TableCell>
                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px dotted black" }}>Area</TableCell>
                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px dotted black" }}>Year</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {fieldDetailsData.map((row, i) => (
                                    <TableRow key={i}>
                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px dotted black" }}> {row.groupName}</TableCell>
                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px dotted black" }}> {(row.factoryName)}</TableCell>
                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px dotted black" }}> {(row.divisionName)}</TableCell>
                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px dotted black" }}> {(row.fieldName)}</TableCell>
                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px dotted black" }}> {(row.plantingTypeName)}</TableCell>
                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px dotted black" }}> {(row.spaceBetweenPlants == "" || row.spaceBetweenPlants == null) ? '-' : row.spaceBetweenPlants}</TableCell>
                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px dotted black" }}> {row.fieldArea.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px dotted black" }}> {row.plantingYear}</TableCell>
                                    </TableRow>
                                )
                                )}
                            </TableBody>
                            <TableRow>
                                <TableCell colSpan={6} align={'center'} style={{ borderBottom: "none", border: "1px dotted black" }}><b>Total</b></TableCell>
                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "1px dotted black" }}>
                                    <b> {(totalValues.totalFieldArea).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                </TableCell>
                                <TableCell style={{ borderBottom: "none", border: "1px dotted black" }}></TableCell>
                            </TableRow>
                        </Table>
                    </TableContainer>
                </Box>
            </div>
        );
    }
}