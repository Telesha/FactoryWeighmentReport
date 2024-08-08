import React from "react";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Box from "@material-ui/core/Box";
import moment from 'moment';

export default class ComponentToPrint extends React.Component {
    render() {
        const searchData = this.props.searchData;
        const attendanceData = this.props.attendanceData;
        const totalValues = this.props.totalValues;
        return (
            <div>
                <style>
                    {`
        @page {
            size: A4 portrait;
            margin-top: 0.75in;
            margin-bottom: 0.75in;
            margin-right: 0.3in;
            margin-left: 0.3in;
            transform-origin: top left; /* Set origin to top left corner */
        }
    `}
                </style>
                <h3><left><u>Non Plucking Attendance</u></left></h3>
                <br />
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><left><b>Business Division: </b> {searchData.groupName}</left></div>
                    <div className="col"><left><b>Location: </b> {searchData.gardenName}</left></div>
                    <div className="col"><left><b>Sub Division: </b> {searchData.costCenterName == undefined ? 'All' : searchData.costCenterName}</left></div>
                    <div className="col"><left><b>Pay Point: </b> {searchData.payPointName == undefined ? 'All' : searchData.payPointName}</left></div>
                    <div className="col"><left><b>Product: </b> {searchData.productName == undefined ? 'All' : searchData.productName}</left></div>
                    <div className="col"><left><b>Emp Category: </b> {searchData.empCategoryName == undefined ? 'All' : searchData.empCategoryName}</left></div>
                    <div className="col"><left><b>Work Type: </b> {searchData.jobTypeID == 1 ? 'General' : searchData.jobTypeID == 2 ? 'Cash Work' : 'All'}</left></div>
                    <div className="col"><left><b>Labour Type: </b> {searchData.labourTypeID == 1 ? 'General' : searchData.labourTypeID == 2 ? 'Lent Labour' : searchData.labourTypeID == 3 ? 'Inter Center Lent Labour' : 'All'}</left></div>
                    <div className="col"><left><b>Date: </b> {moment(searchData.date).format('YYYY/MM/DD')}</left></div>
                </div>
                <br />
                <Box minWidth={1050}>
                    <TableContainer style={{ margin: 'auto' }}>
                        <Table aria-label="simple table" size='small'>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="left" style={{ fontSize: "10px", fontWeight: "bold", border: "1px solid black", padding: "3px" }}>Attendance Date</TableCell>
                                    <TableCell align="left" style={{ fontSize: "10px", fontWeight: "bold", border: "1px solid black", padding: "3px" }}>Work Type</TableCell>
                                    <TableCell align="left" style={{ fontSize: "10px", fontWeight: "bold", border: "1px solid black", padding: "3px" }}>Labour Type</TableCell>
                                    <TableCell align="left" style={{ fontSize: "10px", fontWeight: "bold", border: "1px solid black", padding: "3px" }}>Transaction Division</TableCell>
                                    <TableCell align="right" style={{ fontSize: "10px", fontWeight: "bold", border: "1px solid black", padding: "3px" }}>Category Code</TableCell>
                                    <TableCell align="left" style={{ fontSize: "10px", fontWeight: "bold", border: "1px solid black", padding: "3px" }}>Out Garden</TableCell>
                                    <TableCell align="left" style={{ fontSize: "10px", fontWeight: "bold", border: "1px solid black", padding: "3px" }}>Crop</TableCell>
                                    <TableCell align="left" style={{ fontSize: "10px", fontWeight: "bold", border: "1px solid black", padding: "3px" }}>Employee No</TableCell>
                                    <TableCell align="left" style={{ fontSize: "10px", fontWeight: "bold", border: "1px solid black", padding: "3px" }}>Jab</TableCell>
                                    <TableCell align="left" style={{ fontSize: "10px", fontWeight: "bold", border: "1px solid black", padding: "3px" }}>Field</TableCell>
                                    <TableCell align="left" style={{ fontSize: "10px", fontWeight: "bold", border: "1px solid black", padding: "3px" }}>Block</TableCell>
                                    <TableCell align="right" style={{ fontSize: "10px", fontWeight: "bold", border: "1px solid black", padding: "3px", width: "80px" }}>FullorHalf</TableCell>
                                    <TableCell align="right" style={{ fontSize: "10px", fontWeight: "bold", border: "1px solid black", padding: "3px", width: "80px" }}>GLorLatex</TableCell>
                                    {/* <TableCell align="left" style={{ fontSize: "10px", fontWeight: "bold", border: "1px solid black", padding: "3px" }}>Sub Category Name</TableCell> */}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {attendanceData.map((row, i) => (
                                    <TableRow key={i}>
                                        <TableCell component="th" scope="row" align="left" style={{ fontSize: "10px", border: "1px dashed black", padding: "3px" }}> {moment(row.date).format('DD/MM/YYYY')}</TableCell>
                                        <TableCell component="th" scope="row" align="left" style={{ fontSize: "10px", border: "1px dashed black", padding: "3px" }}> {row.jobTypeID == 1 ? 'General' : 'Cash'}</TableCell>
                                        <TableCell component="th" scope="row" align="left" style={{ fontSize: "10px", border: "1px dashed black", padding: "3px" }}> {(row.collectionPointID == row.workLocationID) ? 'General' : 'Lent Labour'}</TableCell>
                                        <TableCell component="th" scope="row" align="left" style={{ fontSize: "10px", border: "1px dashed black", padding: "3px" }}> {row.pShortCode}</TableCell>
                                        <TableCell component="th" scope="row" align="right" style={{ fontSize: "10px", border: "1px dashed black", padding: "3px" }}> {row.categoryCode}</TableCell>
                                        <TableCell component="th" scope="row" align="left" style={{ fontSize: "10px", border: "1px dashed black", padding: "3px" }}> {row.dShortCode}</TableCell>
                                        <TableCell component="th" scope="row" align="left" style={{ fontSize: "10px", border: "1px dashed black", padding: "3px" }}> {row.productName == 'Tea' ? 'TEA' : row.productName == 'Rubber' ? 'RUBBER' : row.productName}</TableCell>
                                        <TableCell component="th" scope="row" align="left" style={{ fontSize: "10px", border: "1px dashed black", padding: "3px" }}> {row.employeeCode}</TableCell>
                                        <TableCell component="th" scope="row" align="left" style={{ fontSize: "10px", border: "1px dashed black", padding: "3px" }}> {row.taskCode}</TableCell>
                                        <TableCell component="th" scope="row" align="left" style={{ fontSize: "10px", border: "1px dashed black", padding: "3px" }}> {row.fieldName}</TableCell>
                                        <TableCell component="th" scope="row" align="left" style={{ fontSize: "10px", border: "1px dashed black", padding: "3px" }}> {row.block}</TableCell>
                                        <TableCell component="th" scope="row" align="right" style={{ fontSize: "10px", border: "1px dashed black", padding: "3px" }}> </TableCell>
                                        <TableCell component="th" scope="row" align="right" style={{ fontSize: "10px", border: "1px dashed black", padding: "3px" }}> </TableCell>
                                        {/* <TableCell component="th" scope="row" align="left" style={{ fontSize: "10px", border: "1px dashed black", padding: "3px" }}> {row.employeeSubCategoryName}</TableCell> */}
                                    </TableRow>
                                )
                                )}
                            </TableBody>
                            
                        </Table>
                    </TableContainer>
                </Box>
            </div>
        );
    }
}