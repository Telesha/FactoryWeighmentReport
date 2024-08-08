import React from "react";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import CircleIcon from '@mui/icons-material/Circle';

export default class ComponentToPrint extends React.Component {
    render() {
        const searchData = this.props.searchData;
        const taskSummaryData = this.props.taskSummaryData;
        const cashTotal = this.props.cashTotal;
        const generalTotal = this.props.generalTotal;
        const total = this.props.total;
        const prodOneCashTotal = this.props.prodOneCashTotal;
        const prodOneGenTotal = this.props.prodOneGenTotal;
        const prodOneTotal = this.props.prodOneTotal;
        const prodTwoCashTotal = this.props.prodTwoCashTotal;
        const prodTwoGenTotal = this.props.prodTwoGenTotal;
        const prodTwoTotal = this.props.prodTwoTotal;
        const employeeCount = this.props.employeeCount;
        const transCount = this.props.transCount;
        const genCount = this.props.genCount;
        const cashCount = this.props.cashCount;
        const susCount = this.props.susCount;
        const allCount = this.props.allCount;
        const susTotal = this.props.susTotal;
        const prodOneSusTotal = this.props.prodOneSusTotal;
        const prodTwoSusTotal = this.props.prodTwoSusTotal;

        return (
            <div>
                <style>
                    {`
        @page {
            size: A4 protrait;
            margin-top: 0.75in;
            margin-bottom: 0.75in;
            margin-right: 0.5in;
            margin-left: 0.75in;
        }
    `}
                </style>
                <h3><left><u>TASK SUMMARY</u></left></h3>
                <br />
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><left><b>Business Division: </b> {searchData.groupName}</left></div>
                    <div className="col"><left><b>Location: </b> {searchData.estateName == undefined ? 'All Locations' : searchData.estateName}</left></div>
                    <div className="col"><left><b>Sub-Division: </b> {searchData.divisionName == undefined ? 'All Sub-Divisions' : searchData.divisionName}</left></div>
                    <div className="col"><left><b>Pay Point: </b> {searchData.payPointName == undefined ? 'All Pay Points' : searchData.payPointName}</left></div>
                    <div className="col"><left><b>Product: </b> {searchData.productName == undefined ? 'All Products' : searchData.productName}</left></div>
                    <div className="col"><left><b>Task Category: </b> {searchData.estateTaskName == undefined ? 'All Task Categries' : searchData.estateTaskName}</left></div>
                    <div className="col"><left><b>Task Type: </b> {searchData.taskTypeID == "" ? 'All Task Types' : searchData.taskTypeID}</left></div>
                    <div className="col"><left><b>Plucking / Non-Plucking: </b>
                        {searchData.pluckingType == 1 ? 'With Plucking'
                            : searchData.pluckingType == 2 ? 'Without Plucking' : ''}
                    </left></div>
                    <div className="col"><left><b>Sick Leave: </b> {searchData.taskSickLeave}</left></div>
                    <div className="col"><left><b>Date: </b> {searchData.date}</left></div>
                </div>
                <br />
                <Box minWidth={1000} style={{ margin: 'auto' }}>
                    <Chip
                        icon={<CircleIcon
                            fontSize='small' />}
                        label={"Total Employee Count: " + employeeCount}
                        color="secondary"
                        variant="outlined"
                    />
                    &nbsp; &nbsp;
                    <Chip
                        icon={<CircleIcon
                            fontSize='small' color='success' />}
                        label={"G : " + genCount}
                        style={{ color: "green", fontStyle: "bold", borderColor: "green" }}
                        variant="outlined"
                    />
                    &nbsp; &nbsp;
                    <Chip
                        icon={<CircleIcon
                            fontSize='small' color='error' />}
                        label={"C : " + cashCount}
                        style={{ color: "red", fontStyle: "bold", borderColor: "red" }}
                        variant="outlined"
                    />
                    &nbsp; &nbsp;
                    <Chip
                        icon={<CircleIcon
                            fontSize='small' style={{ color: "orange" }} />}
                        label={"S : " + susCount}
                        style={{ color: "orange", fontStyle: "bold", borderColor: "orange" }}
                        variant="outlined"
                    />
                    &nbsp; &nbsp;
                    <Chip
                        icon={<CircleIcon
                            fontSize='small' />}
                        label={"Transaction Count: " + transCount}
                        color="secondary"
                        variant="outlined"
                    />
                    &nbsp; &nbsp;
                    <Chip
                        icon={<CircleIcon
                            fontSize='small' />}
                        label={"Record: " + allCount}
                        color="secondary"
                        style={{ position: 'absolute', right: 15 }}
                        variant="outlined"
                    />
                    <br />
                    <br />
                    <TableContainer>
                        <Table aria-label="simple table" size='small' style={{ border: "1px solid black" }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center" rowSpan={2} style={{ fontWeight: "bold", border: "1px solid black" }}>Kamjari Code</TableCell>
                                    <TableCell align="center" rowSpan={2} style={{ fontWeight: "bold", border: "1px solid black" }}>Kamjari Name</TableCell>
                                    <TableCell align="center" colSpan={4} style={{ fontWeight: "bold", border: "1px solid black" }}>Head Count</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", color: "green" }}>General</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", color: "red" }}>Cash</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", color: "orange" }}>Suspended</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Total</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {taskSummaryData.map((data, i) => {
                                    return (
                                        <React.Fragment key={i}>
                                            <TableRow>
                                                <TableCell colSpan={4} component="th" scope="row" align="left" style={{ fontWeight: 'bolder', color: 'blue', borderLeft: '1px solid black', borderBottom: '1px dashed black' }}>{data.productName}</TableCell>
                                            </TableRow>
                                            {data.detail.map((detail, k) => {
                                                return (
                                                    <TableRow key={`${i}-${k}`}>
                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black", borderLeft: "1px solid black" }}> {detail.taskCode}</TableCell>
                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black", borderLeft: "1px dashed black" }}> {detail.taskName}</TableCell>
                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px dashed black", borderLeft: "1px dashed black", color: "green" }}> {detail.details[0] && detail.details[0].jobTypeID == 1 ? detail.details[0].count : detail.details[1] && detail.details[1].jobTypeID == 1 ? detail.details[1].count : '--'}</TableCell>
                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px dashed black", borderLeft: "1px dashed black", color: "red" }}> {detail.details[0] && detail.details[0].jobTypeID == 2 ? detail.details[0].count : detail.details[1] && detail.details[1].jobTypeID == 2 ? detail.details[1].count : '--'}</TableCell>
                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px dashed black", borderLeft: "1px dashed black", color: "red" }}> {detail.details[0] && detail.details[0].jobTypeID == 3 ? detail.details[0].count : detail.details[1] && detail.details[1].jobTypeID == 3 ? detail.details[1].count : '--'}</TableCell>
                                                        <TableCell component="th" scope="row" align="right" style={{ border: "1px dashed black", borderLeft: "1px dashed black" }}> {detail.details.length < 2 ? detail.details[0].count : (detail.details[0].count + detail.details[1].count)}</TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                            <TableRow>
                                                <TableCell component="th" scope="row" align="left" colSpan={2} style={{ border: "1px solid black", fontWeight: 'bold' }}>Total</TableCell>
                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", fontWeight: 'bold', color: "green" }}>{data.productID == 1 ? prodOneGenTotal : (data.productID == 2 ? prodTwoGenTotal : 0)}</TableCell>
                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", fontWeight: 'bold', color: "red" }}>{data.productID == 1 ? prodOneCashTotal : (data.productID == 2 ? prodTwoCashTotal : 0)}</TableCell>
                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", fontWeight: 'bold', color: "orange" }}>{data.productID == 1 ? prodOneSusTotal : (data.productID == 2 ? prodTwoSusTotal : 0)}</TableCell>
                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", fontWeight: 'bold' }}>{data.productID == 1 ? prodOneTotal : data.productID == 2 ? prodTwoTotal : 0}</TableCell>
                                            </TableRow>
                                        </React.Fragment>
                                    )
                                })}
                                <TableRow>
                                    <TableCell component="th" scope="row" align="left" colSpan={2} style={{ border: "1px solid black", fontWeight: 'bold' }}>Total</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", fontWeight: 'bold', color: "green" }}>{generalTotal}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", fontWeight: 'bold', color: "red" }}>{cashTotal}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", fontWeight: 'bold', color: "orange" }}>{susTotal}</TableCell>
                                    <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", fontWeight: 'bold' }}>{total}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </div>
        );
    }
}