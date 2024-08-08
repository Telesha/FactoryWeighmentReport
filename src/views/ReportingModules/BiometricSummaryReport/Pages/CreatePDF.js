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
        const biometricSummaryData = this.props.biometricSummaryData;
        const totalValues = this.props.totalValues;
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
                <h2><u>Biometric Summary Report</u></h2>
                <br />
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><b>Business Division: </b> {searchData.groupName}</div>
                    <div className="col"><b>Location: </b> {searchData.estateName == undefined ? "All" : searchData.estateName}</div>
                    <div className="col"><b>Sub Division: </b> {searchData.divisionName == undefined ? 'All' : searchData.divisionName}</div>
                    <div className="col"><b>Pay Point: </b> {searchData.payPointName == undefined ? 'All' : searchData.payPointName}</div>
                    <div className="col"><b>Employee Category: </b> {searchData.employeeSubCategoryName == undefined ? 'All' : searchData.employeeSubCategoryName}</div>
                </div>
                <br />
                <Box minWidth={1050}>
                    <TableContainer style={{ maxWidth: 'calc(100% - 1in)' }}>
                        <Table size="small" aria-label="caption table">
                            <TableHead>
                                <TableRow>
                                    <TableCell style={{ fontSize: "14px", border: "1px dotted black", padding: '3px' }} align={'left'}> Employee Category </TableCell>
                                    <TableCell style={{ fontSize: "14px", border: "1px dotted black", padding: '3px' }} align={'right'}> Active </TableCell>
                                    <TableCell style={{ fontSize: "14px", border: "1px dotted black", padding: '3px' }} align={'right'}> Biometric </TableCell>
                                    <TableCell style={{ fontSize: "14px", border: "1px dotted black", padding: '3px' }} align={'right'}> Remaining </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {biometricSummaryData.map((group, i) => {
                                    return (
                                        <React.Fragment key={i}>
                                            <TableRow>
                                                <TableCell colSpan={4} style={{ fontSize: "14px", border: "1px dotted black", backgroundColor: "#f0f0f0", color: "red" }}>Location : {group.factoryName} <div>Labour On Book : {group.labourOnBook}</div></TableCell>
                                            </TableRow>
                                            {group.details.map((grp, j) => {
                                                return (
                                                    <React.Fragment key={`${i}-${j}`}>
                                                        {grp.detailsx.map((detail, k) => {
                                                            return (
                                                                <TableRow key={`${i}-${j}-${k}`}>
                                                                    {k === 0 && (
                                                                        <TableCell rowSpan={grp.detailsx.length} align="left" style={{ fontSize: "14px", border: "1px dotted black" }}>{grp.employeeSubCategoryName}</TableCell>
                                                                    )}
                                                                    <TableCell align={'right'} style={{ fontSize: "14px", borderBottom: "none", border: "1px dotted black", padding: '3px' }}>{detail.activeEmployeeCount}</TableCell>
                                                                    <TableCell align={'right'} style={{ fontSize: "14px", borderBottom: "none", border: "1px dotted black", padding: '3px' }}>{detail.activeEmployeeBiometricCount}</TableCell>
                                                                    <TableCell align={'right'} style={{ fontSize: "14px", borderBottom: "none", border: "1px dotted black", padding: '3px' }}>{((detail.activeEmployeeCount) - (detail.activeEmployeeBiometricCount))}</TableCell>
                                                                </TableRow>
                                                            );
                                                        })}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </React.Fragment>
                                    );
                                })}
                                <TableRow>
                                    <TableCell align={'left'} style={{ border: "1px dotted black", fontWeight: "bold", fontSize: "14px", color: "red", padding: '3px' }}>Total</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px dotted black", fontWeight: "bold", fontSize: "14px", color: "red", padding: '3px' }}>{totalValues.totalActiveEmployeeCount}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px dotted black", fontWeight: "bold", fontSize: "14px", color: "red", padding: '3px' }}>{totalValues.totalActiveEmployeeBiometricCount}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px dotted black", fontWeight: "bold", fontSize: "14px", color: "red", padding: '3px' }}>{((totalValues.totalActiveEmployeeCount) - (totalValues.totalActiveEmployeeBiometricCount))}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </div>
        );
    }
}