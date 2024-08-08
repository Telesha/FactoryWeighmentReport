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
        const supplementaryDetailsData = this.props.supplementaryDetailsData;
        var curr = moment(searchData.date);
        var sunday = moment(curr).add(6, 'days');

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
                <h2><left><u>Ration Deduction</u></left></h2>
                <br />
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col" style={{ fontSize: '14px' }}><left><b>Business Division: </b> {searchData.groupName}</left></div>
                    <div className="col" style={{ fontSize: '14px' }}><left><b>Location: </b> {searchData.estateName}</left></div>
                    <div className="col" style={{ fontSize: '14px' }}><left><b>Sub Division: </b> {searchData.divisionName == undefined ? 'All Sub Divisions' : searchData.divisionName}</left></div>
                    <div className="col" style={{ fontSize: '14px' }}><left><b>Employee Type: </b> {searchData.employeeTypeName == undefined ? 'All Employee Types' : searchData.employeeTypeName}</left></div>
                    <div className="col" style={{ fontSize: '14px' }}><left><b>Employee Category: </b> {searchData.employeeSubCategory == undefined ? 'All Employee Sub Categories' : searchData.employeeSubCategory}</left></div>
                    <div className="col" style={{ fontSize: '14px' }}><left><b>Date: </b> {curr.format('YYYY-MM-DD') + ' - ' + sunday.format('YYYY-MM-DD')}</left></div>
                </div>
                <br />
                <Box minWidth={1050} style={{ margin: 'auto' }}>
                    <TableContainer>
                        <Table aria-label="simple table" size='small'>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', width: '100px' }}>Emp.No</TableCell>
                                    <TableCell align="left" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', width: '100px' }}>Name</TableCell>
                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', width: '100px' }}>Working Days</TableCell>
                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', width: '100px' }}>Entitlement</TableCell>
                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', width: '100px' }}>Eligible</TableCell>
                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', width: '100px' }}>Khetland</TableCell>
                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', width: '100px' }}>Qty.Issued</TableCell>
                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', width: '100px' }}>Rate</TableCell>
                                    <TableCell align="right" style={{ fontWeight: "bold", borderBottom: '1px solid black', borderTop: '1px solid black', width: '100px' }}>Value</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {supplementaryDetailsData.map((data, i) => {
                                    return (
                                        <React.Fragment key={i}>
                                            <TableRow>
                                                <TableCell colSpan={9} component="th" scope="row" align="left" style={{ fontSize: '12px', fontWeight: 'bolder', color: 'green', borderBottom: '1px solid black', padding: '3px' }}>Division: {data.divisionName} <div>Category: {data.employeeSubCategoryName}</div></TableCell>
                                            </TableRow>
                                            {data.detailsx.map((detail, k) => {
                                                return (
                                                    <TableRow key={`${i}-${k}`}>
                                                        <TableCell component="th" scope="row" align="left" style={{ borderBottom: "1px dashed black", width: '100px' }}> {detail.registrationNumber}</TableCell>
                                                        <TableCell component="th" scope="row" align="left" style={{ borderBottom: "1px dashed black", width: '100px' }}> {detail.fullName}</TableCell>
                                                        <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", width: '100px' }}> {detail.noOfAttendance}</TableCell>
                                                        <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", width: '100px' }}> {parseFloat(detail.entitleQuntity).toFixed(3)}</TableCell>
                                                        <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", width: '100px' }}> {parseFloat(detail.eligibleQuntity).toFixed(3)}</TableCell>
                                                        <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", width: '100px' }}> {parseFloat(detail.deductionQuntity).toFixed(3)}</TableCell>
                                                        <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", width: '100px' }}> {parseFloat(detail.quntityIssued).toFixed(3)}</TableCell>
                                                        <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", width: '100px' }}> {detail.perKgRate}</TableCell>
                                                        <TableCell component="th" scope="row" align="right" style={{ borderBottom: "1px dashed black", width: '100px' }}> {detail.amount <= 0 ? '0' : parseFloat(detail.amount).toFixed(3)}</TableCell>
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