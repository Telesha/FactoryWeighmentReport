import React from "react";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import moment from 'moment';
import LineWeightIcon from '@material-ui/icons/LineWeight';
import { Chip, Grid, InputLabel, CardContent, Card, Box } from '@material-ui/core';

export default class ComponentToPrint extends React.Component {
    render() {
        const chitData = this.props.data;
        const summeryValues = this.props.summeryValues;
        const searchData = this.props.selectedSearchValues;
        const summeryData = this.props.summeryData;
        const subNames = this.props.subNames;
        const colName = this.props.colName;
        const empCount = this.props.empCount;
        const totalValues = this.props.totalValues;
        return (
            <div>
                <h3><center><u>Leaf Chit Report</u></center></h3>
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><center><b>Legal Entity : </b> {searchData.groupName}</center></div>
                    <div className="col"><center><b>Garden : </b> {searchData.gardenName}</center></div>
                    {/* <div className="col"><center><b>Section : </b> {searchData.fieldName == "" ? "All Sections" : searchData.fieldName}</center></div> */}
                    <div className="col"><center><b>Date : </b> {searchData.date} </center></div>
                </div>
                <CardContent>
                    <Box minWidth={1050}>
                        <Card>
                            <TableContainer component={Paper}>
                                <div className="row alternative_cls bg-light  ">
                                    <br>
                                    </br>
                                    <Table aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell rowSpan={2} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                    Perticular
                                                </TableCell>
                                                <TableCell rowSpan={2} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                    Unit
                                                </TableCell>
                                                {chitData.map((item) => {
                                                    return (
                                                        <TableCell style={{ fontWeight: "bold", border: "1px solid black" }} align='center'>
                                                            {item.fieldName}
                                                        </TableCell>
                                                    );
                                                })}
                                                <TableCell rowSpan={2} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                    Total
                                                </TableCell>

                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                    Gross Area
                                                </TableCell>
                                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                    HA
                                                </TableCell>
                                                {chitData.map((item) => {
                                                    return (
                                                        <TableCell component="th" align="center" style={{ border: "1px solid black" }}>
                                                            {item.grosArea}
                                                        </TableCell>
                                                    );
                                                })}
                                                <TableCell align="center" style={{ border: "1px solid black" }}>
                                                    {totalValues.tGross.toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                    Area Covered-Today
                                                </TableCell>
                                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                    HA
                                                </TableCell>
                                                {chitData.map((item) => {
                                                    return (
                                                        <TableCell component="th" align="center" style={{ border: "1px solid black" }}>
                                                            {item.areaCoverdToday}
                                                        </TableCell>
                                                    );
                                                })}
                                                <TableCell align="center" style={{ border: "1px solid black" }}>
                                                    {totalValues.tareaCoverdToday.toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                    Area Coverd-Todate
                                                </TableCell>
                                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                    HA
                                                </TableCell>
                                                {chitData.map((item) => {
                                                    return (
                                                        <TableCell component="th" align="center" style={{ border: "1px solid black" }}>
                                                            {item.areaCoverdTodate}
                                                        </TableCell>
                                                    );
                                                })}
                                                <TableCell align="center" style={{ border: "1px solid black" }}>
                                                    {totalValues.tareaCoverdTodate.toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                    Number Of Pluckers-Today
                                                </TableCell>
                                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                    No
                                                </TableCell>
                                                {chitData.map((item) => {
                                                    return (
                                                        <TableCell component="th" align="center" style={{ border: "1px solid black" }}>
                                                            {item.numberOfPluckersToday}
                                                        </TableCell>
                                                    );
                                                })}
                                                <TableCell align="center" style={{ border: "1px solid black" }}>
                                                    {totalValues.tnumberOfPluckersToday.toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                    Number Of Pluckers Todate
                                                </TableCell>
                                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                    NO
                                                </TableCell>
                                                {chitData.map((item) => {
                                                    return (
                                                        <TableCell component="th" align="center" style={{ border: "1px solid black" }}>
                                                            {item.numberOfPluckersTodate}
                                                        </TableCell>
                                                    );
                                                })}
                                                <TableCell align="center" style={{ border: "1px solid black" }}>
                                                    {totalValues.tnumberOfPluckersTodate.toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                    Leaf Plucked Today
                                                </TableCell>
                                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                    KG
                                                </TableCell>
                                                {chitData.map((item) => {
                                                    return (
                                                        <TableCell component="th" align="center" style={{ border: "1px solid black" }}>
                                                            {item.leafPluckedToday}
                                                        </TableCell>
                                                    );
                                                })}
                                                <TableCell align="center" style={{ border: "1px solid black" }}>
                                                    {totalValues.tleafPluckedToday.toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                    Leaf Plucked Todate
                                                </TableCell>
                                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                    NO
                                                </TableCell>
                                                {chitData.map((item) => {
                                                    return (
                                                        <TableCell component="th" align="center" style={{ border: "1px solid black" }}>
                                                            {item.leafPluckedTodate}
                                                        </TableCell>
                                                    );
                                                })}
                                                <TableCell align="center" style={{ border: "1px solid black" }}>
                                                    {totalValues.tleafPluckedTodate.toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                    Average Leaf Plucked Today
                                                </TableCell>
                                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                    KG
                                                </TableCell>
                                                {chitData.map((item) => {
                                                    return (
                                                        <TableCell component="th" align="center" style={{ border: "1px solid black" }}>
                                                            {parseFloat(item.averageLeafPluckedToday).toFixed(2)}
                                                        </TableCell>
                                                    );
                                                })}
                                                <TableCell align="center" style={{ border: "1px solid black" }}>
                                                    {totalValues.taverageLeafPluckedToday.toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                    Average Leaf Plucked Todate
                                                </TableCell>
                                                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                    KG
                                                </TableCell>
                                                {chitData.map((item) => {
                                                    return (
                                                        <TableCell component="th" align="center" style={{ border: "1px solid black" }}>
                                                            {parseFloat(item.averageLeafPluckedTodate).toFixed(2)}
                                                        </TableCell>
                                                    );
                                                })}
                                                <TableCell align="center" style={{ border: "1px solid black" }}>
                                                    {totalValues.taverageLeafPluckedTodate.toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                            </TableContainer>
                        </Card>
                    </Box>
                </CardContent>
            </div>
        );
    }
}
