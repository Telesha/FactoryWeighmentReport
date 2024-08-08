import React from "react";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { Box } from '@material-ui/core';


export default class ComponentToPrint extends React.Component {
    render() {
        const availedReportData = this.props.availedReportData;
        const searchData = this.props.selectedSearchValues;
        const leaveTotals = this.props.leaveTotals;
        const leaveTypes = this.props.leaveTypes;

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
                <h2><left><u>Leave Avail</u></left></h2>
                <br />
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><left><b>Division : </b> {searchData.groupName}</left></div>
                    <div className="col"><left><b>Location : </b> {searchData.gardenName == undefined ? "All Locations" : searchData.gardenName}</left></div>
                    <div className="col"><left><b>Sub Division : </b> {searchData.costCenterName == undefined ? "All Sub Divisions" : searchData.costCenterName}</left></div>
                    <div className="col"><left><b>Pay Point : </b> {searchData.payPointName == undefined ? "All Pay Points" : searchData.payPointName}</left></div>
                    <div className="col"><left><b>Employee Category : </b> {searchData.employeeSubCategoryName === undefined ? "All Employee Categories" : searchData.employeeSubCategoryName} </left></div>
                    <div className="col"><left><b>Date : </b> {searchData.fromDate + ' - ' + searchData.toDate} </left></div>
                </div>
                <br />
                <>
                    <Box minWidth={1050}>
                        <TableContainer>
                            <Table aria-label="simple table" size='small'>
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="left" rowSpan={2} style={{ fontWeight: "bold", border: "1px solid black", width: "80px", padding: "3px" }}>Reg. No</TableCell>
                                        <TableCell align="left" rowSpan={2} style={{ fontWeight: "bold", border: "1px solid black", width: "180px", padding: "3px" }}>First Name</TableCell>
                                        <TableCell align="center" colSpan={leaveTypes.length} style={{ fontWeight: "bold", border: "1px solid black", padding: "3px" }}>Leave Types</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        {leaveTypes.map((shortForm, index) => (
                                            <TableCell key={index} align="center" style={{ fontWeight: "bold", border: "1px solid black", width: "50px", padding: "3px" }}>{shortForm}</TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody style={{ border: "1px solid black" }}>
                                    {availedReportData.map((data, i) => (
                                        <TableRow key={i}>
                                            <TableCell align="left" style={{ border: "1px dashed black", padding: "3px" }}>{data.registrationNumber}</TableCell>
                                            <TableCell align="left" style={{ border: "1px dashed black", padding: "3px" }}>{data.firstName}</TableCell>
                                            {leaveTypes.map((shortForm, k) => {
                                                const leaveCount = data.details.find(d => d.shortForm === shortForm)?.leaveCount || 0;
                                                return (
                                                    <TableCell key={`${i}-${k}`} align="right" style={{ border: "1px dashed black", padding: "3px" }}>{leaveCount}</TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell align="left" colSpan={2} style={{ fontWeight: "bold", border: "1px solid black", padding: "3px" }}>Total</TableCell>
                                        {leaveTypes.map((shortForm, k) => (
                                            <TableCell key={`total-${k}`} align="right" style={{ fontWeight: "bold", border: "1px solid black", padding: "3px" }}>{leaveTotals[shortForm] ? (leaveTotals[shortForm]).toLocaleString('en-US') : 0}</TableCell>
                                        ))}
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </>
            </div>
        );
    }
}