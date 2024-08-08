import React from "react";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import moment from 'moment';

export default class ComponentToPrint extends React.Component {
    render() {
        const searchData = this.props.searchData;
        const data = this.props.data;
        const dayCount = this.props.daysCount;
        const allTotal = this.props.allTotal;
        const totalArray = this.props.totalArray;
        const startDay = this.props.startDay;
        const search = this.props.fieldPerformanceDataList;


        function generateDynamicColor(fieldID) {
            const hash = fieldID.toString().split('').reduce((acc, char) => {
                return char.charCodeAt(0) + (acc << 6) + (acc << 16) - acc;
            }, 0);

            const baseBrightness = 80;
            const randomness = (Math.abs(hash) % 20) - 10;
            const adjustedBrightness = Math.max(30, Math.min(95, baseBrightness + randomness));
            const hue = (hash % 360 + 360) % 360;

            const color = `hsl(${hue}, 100%, ${adjustedBrightness}%)`;

            return color;
        }

        return (
            <div style={{ overflow: "hidden" }}>
                <h3><center><u>Daily Section Performance Report</u></center></h3>
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><center><b>Legal Entity: </b> {searchData.groupName}</center></div>
                    <div className="col"><center><b>Garden: </b> {searchData.gardenName}</center></div>
                    <div className="col"><center><b>Cost Center: </b> {searchData.costCenterName == undefined ? "All Cost Centers" : searchData.costCenterName}</center></div>
                    <div className="col"><center><b>From: </b> {searchData.month} </center></div>
                </div>
                <div>
                    <TableContainer component={Paper} variant="outlined">
                        <>
                            <Table aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Section Name</TableCell>

                                        {dayCount.map((count, i) => (
                                            <TableCell key={i} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>{count}</TableCell>
                                        ))}

                                        <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Total</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}></TableCell>

                                        {dayCount.map((count, i) => (
                                            <TableCell key={i} align="center" style={{ fontWeight: "bold", border: "1px solid black"}}>{moment(new Date((search.month + '-' + count).toString())).format('ddd')}</TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.map((rows, i) => {
                                        const cellColor = generateDynamicColor(rows.fieldID);
                                        return (
                                            <TableRow key={i} >
                                                <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black" }}> {rows.fieldName}</TableCell>
                                                {dayCount.map((count) => {
                                                    const result = rows[count]
                                                    if (result == undefined) {
                                                        return (
                                                            <TableCell component="th" scope="row" align="center" style={{ border: "1px solid black" }}> - </TableCell>
                                                        );
                                                    }
                                                    else {
                                                        return (
                                                            <TableCell component="th" scope="row" align="center" style={{ backgroundColor: cellColor }}> {parseFloat(result).toFixed(2)}</TableCell>
                                                        );
                                                    }
                                                })}
                                                <TableCell component="th" scope="row" style={{ backgroundColor: "#14a37f" }} align="center"> {parseFloat(rows.amount).toFixed(2)}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    <TableRow>
                                        <TableCell component="th" style={{ fontWeight: "bold",  border: "1px solid black" }} scope="row" align="center"> Total</TableCell>
                                        {dayCount.map((count) => {
                                            const result = totalArray.find(x => x.name == count)
                                            if (result == undefined) {
                                                return (
                                                    <TableCell component="th" style={{ fontWeight: "bold",  border: "1px solid black" }} scope="row" align="center"> - </TableCell>
                                                );
                                            }
                                            else {
                                                return (
                                                    <TableCell component="th" scope="row" align="center" style={{ fontWeight: "bold", backgroundColor: "#14a37f",  border: "1px solid black"}}> {parseFloat(result.value).toFixed(2)}</TableCell>
                                                );
                                            }
                                        })}
                                        <TableCell component="th" scope="row" style={{ fontWeight: "bold",  border: "1px solid black"}} align="center"> {parseFloat(allTotal).toFixed(2)}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </>
                    </TableContainer>
                </div>
            </div>
        );
    }
}