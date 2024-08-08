import React from "react";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Box from '@material-ui/core/Box';
import moment from "moment";
import Chip from "@material-ui/core/Chip";
import CircleIcon from '@mui/icons-material/Circle';
export default class ComponentToPrint extends React.Component {
    render() {
        const searchData = this.props.searchData;
        const musterchitDetailsDataOne = this.props.musterchitDetailsDataOne;
        const registrationNumberCountByTaskCode = this.props.registrationNumberCountByTaskCode;
        const musterchitDetailsData = this.props.musterchitDetailsData;
        const registrationNumberCount = this.props.registrationNumberCount;
        var curr = moment(searchData.date);
        const transCount = this.props.transCount;
        const genCount = this.props.genCount;
        const cashCount = this.props.cashCount;
        const susCount = this.props.susCount;

        return (
            <div>
                <style>
                    {`
        @page {
            size: A4 portrait;
            margin-top: 0.75in;
            margin-bottom: 0.75in;
            margin-right: 0.5in;
            margin-left: 0.5in;
            transform-origin: top left; /* Set origin to top left corner */
        }
    `}
                </style>
                <h3><left><u>Muster Chit</u></left></h3>
                <br />
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><left><b>Business Division: </b> {searchData.groupName}</left></div>
                    <div className="col"><left><b>Location: </b> {searchData.estateName == undefined ? "All" : searchData.estateName}</left></div>
                    <div className="col"><left><b>Sub-Division: </b> {searchData.divisionName == undefined ? "All" : searchData.divisionName}</left></div>
                    <div className="col"><left><b>Pay Point: </b> {searchData.payPointName == undefined ? "All" : searchData.payPointName}</left></div>
                    <div className="col"><left><b>Employee Category: </b> {searchData.employeeSubCategory == undefined ? "All" : searchData.employeeSubCategory}</left></div>
                    <div className="col"><left><b>Product: </b> {searchData.productName == undefined ? "All" : searchData.productName}</left></div>
                    <div className="col"><left><b>Sick Leave: </b> {searchData.taskSickLeave}</left></div>
                    <div className="col"><left><b>Date: </b> {curr.format('YYYY-MM-DD')}</left></div>
                </div>
                <br />
                <Chip
                    icon={<CircleIcon
                        fontSize='small' />}
                    label={"Total Employee Count: " + registrationNumberCount}
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
                    label={"Record: " + musterchitDetailsDataOne.length}
                    color="secondary"
                    style={{ position: 'absolute', right: 15 }}
                    variant="outlined"
                />
                <br />
                <br />
                <Box minWidth={1050} style={{ margin: 'auto' }}>
                    <TableContainer>
                        <Table aria-label="simple table" size='small'>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="left" style={{ fontWeight: 'bold', borderBottom: '1px solid black', borderTop: '1px solid black', padding: '3px', width: '100px' }}>
                                        Reg. No
                                    </TableCell>
                                    <TableCell align="left" style={{ fontWeight: 'bold', borderBottom: '1px solid black', borderTop: '1px solid black', padding: '3px', width: '200px' }}>
                                        Employee Name
                                    </TableCell>
                                    <TableCell align="left" style={{ fontWeight: 'bold', borderBottom: '1px solid black', borderTop: '1px solid black', padding: '3px' }}>
                                        W/Type
                                    </TableCell>
                                    <TableCell align="left" style={{ fontWeight: 'bold', borderBottom: '1px solid black', borderTop: '1px solid black', padding: '3px' }}>
                                        Field
                                    </TableCell>
                                    <TableCell align="left" style={{ fontWeight: 'bold', borderBottom: '1px solid black', borderTop: '1px solid black', padding: '3px' }}>
                                        Target
                                    </TableCell>
                                    <TableCell align="left" style={{ fontWeight: 'bold', borderBottom: '1px solid black', borderTop: '1px solid black', padding: '3px' }}>
                                        Actual
                                    </TableCell>
                                    {/* <TableCell align="left" style={{ fontWeight: 'bold', borderBottom: '1px solid black', borderTop: '1px solid black' }}>
                                        Assign (Date/Time)
                                    </TableCell> */}
                                    <TableCell align="left" style={{ fontWeight: 'bold', borderBottom: '1px solid black', borderTop: '1px solid black', padding: '3px' }}>
                                        Started (Date/Time)
                                    </TableCell>
                                    <TableCell align="left" style={{ fontWeight: 'bold', borderBottom: '1px solid black', borderTop: '1px solid black', padding: '3px' }}>
                                        Completed (Date/Time)
                                    </TableCell>
                                    <TableCell align="left" style={{ fontWeight: 'bold', borderBottom: '1px solid black', borderTop: '1px solid black', padding: '3px' }}>
                                        Status
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {musterchitDetailsData.map((data, i) => {
                                    const taskCount = registrationNumberCountByTaskCode.find(item => item.taskCode === data.taskCode)?.count || 0;
                                    const sortedDetails = data.details.sort((a, b) => a.registrationNumber.localeCompare(b.registrationNumber));
                                    return (
                                        <React.Fragment key={i}>
                                            <TableRow>
                                                <TableCell colSpan={3} component="th" scope="row" align="left" style={{ fontWeight: 'bolder', color: 'green', borderBottom: '1px solid black', padding: '3px' }}>
                                                    Task Name : {data.taskName + ' - ' + data.taskCode}
                                                </TableCell>
                                                <TableCell colSpan={3} component="th" scope="row" align="left" style={{ fontWeight: 'bolder', color: 'green', borderBottom: '1px solid black', padding: '3px' }}>
                                                    Emp Count : {taskCount}
                                                </TableCell>
                                                <TableCell colSpan={3} component="th" scope="row" align="left" style={{ fontWeight: 'bolder', color: 'green', borderBottom: '1px solid black', padding: '3px' }}>
                                                    Transaction Count : {data.details.length}
                                                </TableCell>
                                            </TableRow>
                                            {sortedDetails.map((row, k) => {
                                                return (
                                                    <TableRow key={k}>
                                                        <TableCell component="th" scope="row" align="left" style={{ borderBottom: '1px dashed black', padding: '3px' }}>
                                                            {row.registrationNumber}
                                                        </TableCell>
                                                        <TableCell component="th" scope="row" align="left" style={{ borderBottom: '1px dashed black', padding: '3px' }}>
                                                            {row.employeeName}
                                                        </TableCell>
                                                        <TableCell component="th" scope="row" align="center" style={{ fontWeight: 'bold', borderBottom: '1px dashed black', color: row.jobType == 'G' ? 'green' : row.jobType == 'C' ? 'red' : row.jobType == 'S' ? 'orange' : 'inherit' }}>
                                                            {row.jobType}
                                                        </TableCell>
                                                        <TableCell component="th" scope="row" align="left" style={{ borderBottom: '1px dashed black', padding: '3px' }}>
                                                            {row.fieldName == null ? '-' : row.fieldName}
                                                        </TableCell>
                                                        <TableCell component="th" scope="row" align="center" style={{ borderBottom: '1px dashed black', padding: '3px' }}>
                                                            {row.assignQuntity}
                                                        </TableCell>
                                                        <TableCell component="th" scope="row" align="center" style={{ borderBottom: '1px dashed black', padding: '3px' }}>
                                                            {row.completedQuntity}
                                                        </TableCell>
                                                        {/* <TableCell component="th" scope="row" align="left" style={{ borderBottom: '1px dashed black' }}>
                                                            {moment(row.assignAt).format('YYYY-MM-DD hh:mm:ss a')}
                                                        </TableCell> */}
                                                        <TableCell component="th" scope="row" align="left" style={{ borderBottom: '1px dashed black', padding: '3px' }}>
                                                            {row.startedAt == null ? '-' : moment(row.startedAt).format('YYYY-MM-DD hh:mm:ss a')}
                                                        </TableCell>
                                                        <TableCell component="th" scope="row" align="left" style={{ borderBottom: '1px dashed black', padding: '3px' }}>
                                                            {row.completedTime == null ? '-' : moment(row.completedTime).format('YYYY-MM-DD hh:mm:ss a')}
                                                        </TableCell>
                                                        <TableCell component="th" scope="row" align="left" style={{ borderBottom: '1px dashed black', padding: '3px' }}>
                                                            {row.status}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </React.Fragment>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </div>
        );
    }
}
