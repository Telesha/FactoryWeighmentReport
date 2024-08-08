import React, { useEffect, useState, Fragment, useRef } from "react";
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import Box from '@material-ui/core/Box';
export default class ComponentToPrint extends React.Component {

    render() {
        const reportData = this.props.reportData;
        const pdfData = this.props.pdfData;
        const leaveRequestData = this.props.leaveRequestData
        const aaa = this.props.aaa

        return (
            <div>
                <br></br>
                <h1 className="pr-2"><center><u>Neptune Tea Estate</u></center></h1>
                <h2 className="pr-2"><center><u>Leave Entry Form</u></center></h2>

                <div>
                    <Box display="flex" justifyContent="flex-end" p={4}>
                        <TableContainer component={Paper}>
                            <Table aria-label="simple table">
                                <TableBody>
                                    {reportData.map((row, i) => (
                                        <TableRow>
                                            <div>
                                                <div>
                                                    <TableRow key={i}>
                                                        <TableCell
                                                            component="th"
                                                            scope="col"
                                                            align="Left"
                                                            style={{ border: '3px solid black', width: 200 }}
                                                        >
                                                            {'Employee ID       : '}
                                                        </TableCell>
                                                        <TableCell
                                                            component="th"
                                                            scope="col"
                                                            align="left"
                                                            style={{ border: '3px solid black', width: 600 }}
                                                        >
                                                            {row['registrationNumber']}
                                                        </TableCell>
                                                    </TableRow>

                                                    <TableRow key={i}>
                                                        <TableCell
                                                            component="th"
                                                            scope="col"
                                                            align="left"
                                                            style={{ border: '3px solid black', width: 200 }}
                                                        >
                                                            {'Employee Name       :'}
                                                        </TableCell>
                                                        <TableCell
                                                            component="th"
                                                            scope="row"
                                                            align="left"
                                                            style={{ border: '3px solid black', width: 600 }}
                                                        >
                                                            {row.firstName}
                                                        </TableCell>
                                                    </TableRow>

                                                    <TableRow key={i}>
                                                        <TableCell
                                                            component="th"
                                                            scope="col"
                                                            align="left"
                                                            style={{ border: '3px solid black', width: 200 }}
                                                        >
                                                            {'Department       :'}
                                                        </TableCell>
                                                        <TableCell
                                                            component="th"
                                                            scope="row"
                                                            align="left"
                                                            style={{ border: '3px solid black', width: 600 }}
                                                        >
                                                            {row.divisionName}
                                                        </TableCell>
                                                    </TableRow>
                                                </div>
                                                <div>
                                                    <TableRow key={i}>
                                                        <TableCell
                                                            component="th"
                                                            scope="col"
                                                            align="left"
                                                            style={{ width: 218, borderLeft: '3px solid black' }}
                                                        >
                                                            {'From Date       :'}
                                                        </TableCell>
                                                        <TableCell
                                                            component="th"
                                                            scope="row"
                                                            align="left"
                                                            style={{ width: 200, borderLeft: '3px solid black', borderRight: '3px solid black' }}
                                                        >
                                                            {/* {row.isTrue ? row.fromDate.slice(0, 10) : pdfData.fromDate} */}
                                                            {pdfData.fromDate.split('T')[0]}
                                                        </TableCell>
                                                        <TableCell
                                                            component="th"
                                                            scope="col"
                                                            align="left"
                                                            style={{ width: 200 }}
                                                        >
                                                            {'To Date       :'}
                                                        </TableCell>
                                                        <TableCell
                                                            component="th"
                                                            scope="row"
                                                            align="left"
                                                            style={{ width: 200, borderLeft: '3px solid black', borderRight: '3px solid black' }}
                                                        >
                                                            {/* {row.isTrue ? row.toDate.slice(0, 10) : pdfData.toDate} */}
                                                            {pdfData.toDate.split('T')[0]}
                                                        </TableCell>
                                                    </TableRow>
                                                </div>
                                                <div>
                                                    <TableRow key={i}>
                                                        <TableCell
                                                            component="th"
                                                            scope="col"
                                                            align="left"
                                                            style={{ border: '3px solid black', width: 205 }}
                                                        >
                                                            {'Leave Type       :'}
                                                        </TableCell>
                                                        <TableCell
                                                            component="th"
                                                            scope="row"
                                                            align="left"
                                                            style={{ border: '3px solid black', width: 600 }}
                                                        >
                                                            {row.elaboration}
                                                        </TableCell>
                                                    </TableRow>
                                                </div>
                                                <div>
                                                    <TableRow key={i}>
                                                        <TableCell
                                                            component="th"
                                                            scope="col"
                                                            align="left"
                                                            style={{ width: 150, borderBottom: '3px solid black', borderLeft: '3px solid black' }}
                                                        >
                                                            {'Days Entitled       :'}
                                                        </TableCell>
                                                        <TableCell
                                                            component="th"
                                                            scope="row"
                                                            align="left"
                                                            style={{ width: 100, borderBottom: '3px solid black', borderLeft: '3px solid black', borderRight: '3px solid black' }}
                                                        >
                                                            {row.allocatedQuntity}
                                                        </TableCell>
                                                        <TableCell
                                                            component="th"
                                                            scope="col"
                                                            align="left"
                                                            style={{ width: 150, borderBottom: '3px solid black' }}
                                                        >
                                                            {'Days Enjoyed       :'}
                                                        </TableCell>
                                                        <TableCell
                                                            component="th"
                                                            scope="row"
                                                            align="left"
                                                            style={{ width: 100, borderBottom: '3px solid black', borderLeft: '3px solid black', borderRight: '3px solid black' }}
                                                        >
                                                            {/* {row.isTrue ? row.approvedLeave : pdfData.daysEnjoyed} */}
                                                            {1}
                                                        </TableCell>
                                                        <TableCell
                                                            component="th"
                                                            scope="col"
                                                            align="left"
                                                            style={{ width: 200, borderBottom: '3px solid black' }}
                                                        >
                                                            {'Days Remaining       :'}
                                                        </TableCell>
                                                        <TableCell
                                                            component="th"
                                                            scope="row"
                                                            align="left"
                                                            style={{ width: 100, borderBottom: '3px solid black', borderLeft: '3px solid black', borderRight: '3px solid black' }}
                                                        >
                                                            {row.remainingQuntity}
                                                        </TableCell>
                                                    </TableRow>
                                                </div>
                                            </div>
                                            <br></br>
                                            <br></br>
                                            <br></br>
                                            <div>
                                                <TableRow key={i}>
                                                    <TableCell
                                                        component="th"
                                                        scope="col"
                                                        align="left"
                                                        style={{ border: '3px solid black', width: 200 }}
                                                    >
                                                        {'Address       : '}
                                                    </TableCell>
                                                    <TableCell
                                                        component="th"
                                                        scope="col"
                                                        align="left"
                                                        style={{ border: '3px solid black', width: 200 }}
                                                    >
                                                        {row['address1']}
                                                    </TableCell>
                                                    <TableCell
                                                        component="th"
                                                        scope="col"
                                                        align="left"
                                                        style={{ border: '3px solid black', width: 200 }}
                                                    >
                                                        {'Mobile Number       : '}
                                                    </TableCell>
                                                    <TableCell
                                                        component="th"
                                                        scope="col"
                                                        align="left"
                                                        style={{ border: '3px solid black', width: 200 }}
                                                    >
                                                        {row['mobileNumber']}
                                                    </TableCell>
                                                </TableRow>
                                            </div>
                                            <br></br>
                                            <br></br>
                                            <br></br>
                                            <div>
                                                <TableRow key={i}>
                                                    <TableCell
                                                        component="th"
                                                        scope="col"
                                                        align="left"
                                                        style={{ border: '3px solid black', width: 200 }}
                                                    >
                                                        {'Approved By       : '}
                                                    </TableCell>
                                                    <TableCell
                                                        component="th"
                                                        scope="col"
                                                        align="left"
                                                        style={{ border: '3px solid black', width: 200 }}
                                                    >
                                                        {' '}
                                                    </TableCell>
                                                    <TableCell
                                                        component="th"
                                                        scope="col"
                                                        align="left"
                                                        style={{ border: '3px solid black', width: 200 }}
                                                    >
                                                        {'Approved By       : '}
                                                    </TableCell>
                                                    <TableCell
                                                        component="th"
                                                        scope="col"
                                                        align="left"
                                                        style={{ border: '3px solid black', width: 200 }}
                                                    >
                                                        {' '}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow key={i}>
                                                    <TableCell
                                                        component="th"
                                                        scope="col"
                                                        align="left"
                                                        style={{ border: '3px solid black', width: 200 }}
                                                    >
                                                        {'AMO       : '}
                                                    </TableCell>
                                                    <TableCell
                                                        component="th"
                                                        scope="col"
                                                        align="left"
                                                        style={{ border: '3px solid black', width: 200 }}
                                                    >
                                                        {' '}
                                                    </TableCell>
                                                    <TableCell
                                                        component="th"
                                                        scope="col"
                                                        align="left"
                                                        style={{ border: '3px solid black', width: 200 }}
                                                    >
                                                        {'Garden Incharge    : '}
                                                    </TableCell>
                                                    <TableCell
                                                        component="th"
                                                        scope="col"
                                                        align="left"
                                                        style={{ border: '3px solid black', width: 200 }}
                                                    >
                                                        {' '}
                                                    </TableCell>
                                                </TableRow>
                                            </div>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </div>
            </div>
        );
    }
}