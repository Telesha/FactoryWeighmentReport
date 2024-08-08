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
                <style>
                    {`
                    @page {
                        size: A4 portrait;
                        margin-top: 0.5in;
                        margin-bottom: 0.5in;
                        margin-right: 0.25in;
                        margin-left: 0.25in;
                    }
                `}
                </style>
                <br></br>
                <h2 className="pr-2"><center><u>Leave Entry Form</u></center></h2>

                <div>
                    <Box display="flex" justifyContent="flex-end" p={4}>
                        <TableContainer component={Paper}>
                            <Table aria-label="simple table">
                                <TableBody>
                                    {reportData.map((row, i) => (
                                        <div>
                                            <div>
                                                <div>
                                                    <TableRow key={i}>
                                                        <TableCell
                                                            component="th"
                                                            scope="col"
                                                            align="Left"
                                                            style={{ border: '1px solid black', width: 200,padding:'5px' }}
                                                        >
                                                            {'Employee ID       : '}
                                                        </TableCell>
                                                        <TableCell
                                                            component="th"
                                                            scope="col"
                                                            align="left"
                                                            style={{ border: '1px solid black', width: 600,padding:'5px'  }}
                                                        >
                                                            {row['registrationNumber']}
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow key={i}>
                                                        <TableCell
                                                            component="th"
                                                            scope="col"
                                                            align="left"
                                                            style={{ border: '1px solid black', width: 200,padding:'5px'  }}
                                                        >
                                                            {'Employee Name       :'}
                                                        </TableCell>
                                                        <TableCell
                                                            component="th"
                                                            scope="col"
                                                            align="left"
                                                            style={{ border: '1px solid black', width: 600,padding:'5px'  }}
                                                        >
                                                            {row.firstName}
                                                        </TableCell>
                                                    </TableRow>

                                                    <TableRow key={i}>
                                                        <TableCell
                                                            component="th"
                                                            scope="col"
                                                            align="left"
                                                            style={{ border: '1px solid black', width: 200,padding:'5px'  }}
                                                        >
                                                            {'Department       :'}
                                                        </TableCell>
                                                        <TableCell
                                                            component="th"
                                                            scope="col"
                                                            align="left"
                                                            style={{ border: '1px solid black', width: 600,padding:'5px'  }}
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
                                                            style={{ width: 215, borderLeft: '1px solid black',padding:'5px'  }}
                                                        >
                                                            {'From Date       : '}
                                                        </TableCell>
                                                        <TableCell
                                                            component="th"
                                                            scope="col"
                                                            align="left"
                                                            style={{ width: 200, borderLeft: '1px solid black', borderRight: '1px solid black',padding:'5px'}}
                                                        >
                                                            {/* {row.isTrue ? row.fromDate.slice(0, 10) : pdfData.fromDate} */}
                                                            {pdfData.fromDate.split('T')[0]}
                                                        </TableCell>
                                                        <TableCell
                                                            component="th"
                                                            scope="col"
                                                            align="left"
                                                            style={{ width: 200, borderLeft: '1px solid black',padding:'5px'  }}
                                                        >
                                                            {'To Date       : '}
                                                        </TableCell>
                                                        <TableCell
                                                            component="th"
                                                            scope="col"
                                                            align="left"
                                                            style={{ width: 200, borderLeft: '1px solid black', borderRight: '1px solid black',padding:'5px'  }}
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
                                                            style={{ border: '1px solid black', width: 208,padding:'5px'  }}
                                                        >
                                                            {'Leave Type       :'}
                                                        </TableCell>
                                                        <TableCell
                                                            component="th"
                                                            scope="row"
                                                            align="left"
                                                            style={{ border: '1px solid black', width: 600,padding:'5px'  }}
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
                                                            style={{ width: 150, borderBottom: '1px solid black', borderLeft: '1px solid black',padding:'5px'  }}
                                                        >
                                                            {'Days Entitled       :'}
                                                        </TableCell>
                                                        <TableCell
                                                            component="th"
                                                            scope="row"
                                                            align="left"
                                                            style={{ width: 100, borderBottom: '1px solid black', borderLeft: '1px solid black', borderRight: '1px solid black',padding:'5px'  }}
                                                        >
                                                            {row.allocatedQuntity}
                                                        </TableCell>
                                                        <TableCell
                                                            component="th"
                                                            scope="col"
                                                            align="left"
                                                            style={{ width: 150, borderBottom: '1px solid black',padding:'5px'  }}
                                                        >
                                                            {'Days Enjoyed       :'}
                                                        </TableCell>
                                                        <TableCell
                                                            component="th"
                                                            scope="row"
                                                            align="left"
                                                            style={{ width: 100, borderBottom: '1px solid black', borderLeft: '1px solid black', borderRight: '1px solid black',padding:'5px'}}
                                                        >
                                                            {/* {row.isTrue ? row.approvedLeave : pdfData.daysEnjoyed} */}
                                                            {1}
                                                        </TableCell>
                                                        <TableCell
                                                            component="th"
                                                            scope="col"
                                                            align="left"
                                                            style={{ width: 157, borderBottom: '1px solid black',padding:'5px'  }}
                                                        >
                                                            {'Days Remaining       :'}
                                                        </TableCell>
                                                        <TableCell
                                                            component="th"
                                                            scope="row"
                                                            align="left"
                                                            style={{ width: 100, borderBottom: '1px solid black', borderLeft: '1px solid black', borderRight: '1px solid black',padding:'5px'  }}
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
                                                        style={{ border: '1px solid black', width: 200,padding:'5px'  }}
                                                    >
                                                        {'Address       : '}
                                                    </TableCell>
                                                    <TableCell
                                                        component="th"
                                                        scope="col"
                                                        align="left"
                                                        style={{ border: '1px solid black', width: 200,padding:'5px'  }}
                                                    >
                                                        {row['address1']}
                                                    </TableCell>
                                                    <TableCell
                                                        component="th"
                                                        scope="col"
                                                        align="left"
                                                        style={{ border: '1px solid black', width: 200,padding:'5px'  }}
                                                    >
                                                        {'Mobile Number       : '}
                                                    </TableCell>
                                                    <TableCell
                                                        component="th"
                                                        scope="col"
                                                        align="left"
                                                        style={{ border: '1px solid black', width: 200,padding:'5px'  }}
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
                                                        style={{ border: '1px solid black', width: 200,padding:'5px'  }}
                                                    >
                                                        {'Approved By       : '}
                                                    </TableCell>
                                                    <TableCell
                                                        component="th"
                                                        scope="col"
                                                        align="left"
                                                        style={{ border: '1px solid black', width: 200,padding:'5px'  }}
                                                    >
                                                        {' '}
                                                    </TableCell>
                                                    <TableCell
                                                        component="th"
                                                        scope="col"
                                                        align="left"
                                                        style={{ border: '1px solid black', width: 200,padding:'5px'  }}
                                                    >
                                                        {'Approved By       : '}
                                                    </TableCell>
                                                    <TableCell
                                                        component="th"
                                                        scope="col"
                                                        align="left"
                                                        style={{ border: '1px solid black', width: 200,padding:'5px'  }}
                                                    >
                                                        {' '}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow key={i}>
                                                    <TableCell
                                                        component="th"
                                                        scope="col"
                                                        align="left"
                                                        style={{ border: '1px solid black', width: 200,padding:'5px'  }}
                                                    >
                                                        {'AMO       : '}
                                                    </TableCell>
                                                    <TableCell
                                                        component="th"
                                                        scope="col"
                                                        align="left"
                                                        style={{ border: '1px solid black', width: 200,padding:'5px'  }}
                                                    >
                                                        {' '}
                                                    </TableCell>
                                                    <TableCell
                                                        component="th"
                                                        scope="col"
                                                        align="left"
                                                        style={{ border: '1px solid black', width: 200,padding:'5px'  }}
                                                    >
                                                        {'Garden Incharge    : '}
                                                    </TableCell>
                                                    <TableCell
                                                        component="th"
                                                        scope="col"
                                                        align="left"
                                                        style={{ border: '1px solid black', width: 200,padding:'5px'  }}
                                                    >
                                                        {' '}
                                                    </TableCell>
                                                </TableRow>
                                            </div>
                                        </div>
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