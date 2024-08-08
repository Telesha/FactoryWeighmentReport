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

export default class ComponentToPrint extends React.Component {
    render() {

        const routeSummaryData = this.props.routeSummaryData;
        const searchData = this.props.searchData;
        const totalValues = this.props.totalValues;
        return (
            <div>

                <h2><center><u>Section Wise Daily Plucking Report</u></center></h2>
                <div>&nbsp;</div>
                <h2><center>Legal Entity : {searchData.groupName} - Garden :{searchData.gardenName}</center></h2>
                <div>&nbsp;</div>
                <h2><center> {searchData.costCenterName == undefined ? 'All Cost Centers ' : 'Cost Center : ' + searchData.costCenterName + ' '}
                    -  {searchData.fieldName == undefined ? 'All Sections ' : 'Section : ' + searchData.costCenterName}</center></h2>
                <div>&nbsp;</div>
                <h3><center>{searchData.froDate} - {searchData.tDate} </center></h3>
                <div>
                    <Box minWidth={1050}>
                        <TableContainer >
                            <Table aria-label="caption table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align={'left'} style={{ fontWeight: "bold", border: "1px solid black" }}>Garden</TableCell>
                                        <TableCell align={'left'} style={{ fontWeight: "bold", border: "1px solid black" }}>Plucking Date</TableCell>
                                        <TableCell align={'left'} style={{ fontWeight: "bold", border: "1px solid black" }}>Section</TableCell>
                                        <TableCell align={'right'} style={{ fontWeight: "bold", border: "1px solid black" }}>Area in Hectare</TableCell>
                                        <TableCell align={'right'} style={{ fontWeight: "bold", border: "1px solid black" }}>Area Covered</TableCell>
                                        <TableCell align={'right'} style={{ fontWeight: "bold", border: "1px solid black" }}>Green leaf plucked in Kg</TableCell>
                                        <TableCell align={'right'} style={{ fontWeight: "bold", border: "1px solid black" }}>No.of Pluckers</TableCell>
                                        <TableCell align={'right'} style={{ fontWeight: "bold", border: "1px solid black" }}>Average / Plucker</TableCell>
                                        <TableCell align={'right'} style={{ fontWeight: "bold", border: "1px solid black" }}>Percentage of Leaf Count %</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {routeSummaryData.map((data, index) => (
                                        <TableRow key={index}>
                                            <TableCell align={'left'} component="th" scope="row" style={{ border: "1px solid black" }}>
                                                {data.factoryName}
                                            </TableCell>
                                            <TableCell align={'left'} component="th" scope="row" style={{ border: "1px solid black" }}>
                                                {data.cardReadTime.split('T')[0]}
                                            </TableCell>
                                            <TableCell align={'left'} component="th" scope="row" style={{ border: "1px solid black" }}>
                                                {data.fieldName}
                                            </TableCell>
                                            <TableCell align={'right'} component="th" scope="row" style={{ border: "1px solid black" }}>
                                                {parseFloat(data.area).toFixed(2)}
                                            </TableCell>
                                            <TableCell align={'right'} component="th" scope="row" style={{ border: "1px solid black" }}>
                                                {parseFloat(data.coveredArea).toFixed(2)}
                                            </TableCell>
                                            <TableCell align={'right'} component="th" scope="row" style={{ border: "1px solid black" }}>
                                                {parseFloat(data.totalAmount).toFixed(2)}
                                            </TableCell>
                                            <TableCell align={'right'} component="th" scope="row" style={{ border: "1px solid black" }}>
                                                {parseInt(data.employeeCount)}
                                            </TableCell>
                                            <TableCell align={'right'} component="th" scope="row" style={{ border: "1px solid black" }}>
                                                {parseFloat(data.totalAmount / data.employeeCount).toFixed(2)}
                                            </TableCell>
                                            <TableCell align={'right'} component="th" scope="row" style={{ border: "1px solid black" }}>
                                                {parseFloat(data.percentageOfLeaf).toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableRow>
                                    <TableCell align={'center'} style={{ border: "1px solid black" }}><b>Total</b></TableCell>
                                    <TableCell style={{ border: "1px solid black" }} ></TableCell>
                                    <TableCell style={{ border: "1px solid black" }}></TableCell>
                                    <TableCell align={'right'} component="th" scope="row" style={{ border: "1px solid black" }}>
                                        <b> {parseFloat(totalValues.totalArea).toFixed(2)} </b>
                                    </TableCell>
                                    <TableCell align={'right'} component="th" scope="row" style={{ border: "1px solid black" }}>
                                        <b> {parseFloat(totalValues.totalCoveredArea).toFixed(2)} </b>
                                    </TableCell>
                                    <TableCell align={'right'} component="th" scope="row" style={{ border: "1px solid black" }}>
                                        <b> {parseFloat(totalValues.totalTotalAmount).toFixed(2)} </b>
                                    </TableCell>
                                    <TableCell align={'right'} component="th" scope="row" style={{ border: "1px solid black" }}>
                                        <b> {parseInt(totalValues.totalEmployeeCount)} </b>
                                    </TableCell>
                                    <TableCell align={'right'} component="th" scope="row" style={{ border: "1px solid black" }}>
                                        <b> {parseFloat(totalValues.totalTotalAmount / totalValues.totalEmployeeCount).toFixed(2)} </b>
                                    </TableCell>
                                    <TableCell align={'right'} component="th" scope="row" style={{ border: "1px solid black" }}>
                                        <b> {parseFloat(totalValues.totalPercentageOfLeaf).toFixed(2)} </b>
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