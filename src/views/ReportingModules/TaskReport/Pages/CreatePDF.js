import React from "react";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Box from '@material-ui/core/Box';

export default class ComponentToPrint extends React.Component {
    render() {
        const searchData = this.props.searchData;
        const taskData = this.props.taskData;
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
        }
    `}
                </style>
                <h3><left><u>TASK REPORT</u></left></h3>
                <br />
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><left><b>Business Division: </b> {searchData.groupName}</left></div>
                    <div className="col"><left><b>Location: </b> {searchData.estateName}</left></div>
                    <div className="col"><left><b>Task Category: </b> {searchData.estateTaskName == undefined ? 'All Task Categries' : searchData.estateTaskName}</left></div>
                    <div className="col"><left><b>Product: </b> {searchData.productName == undefined ? 'All Products' : searchData.productName}</left></div>
                </div>
                <br />
                <Box minWidth={950} style={{ margin: 'auto' }}>
                    <TableContainer>
                        <Table aria-label="simple table" size='small'>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Budget Code</TableCell>
                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Task Code</TableCell>
                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Task Name</TableCell>
                                    {/* <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Measuring Unit</TableCell> */}
                                </TableRow>
                            </TableHead>
                            <TableBody style={{ border: '1px dashed black' }}>
                                {taskData.map((data, i) => {
                                    const sortedDetails = data.details.sort((a, b) => a.budgetexpensescode.localeCompare(b.budgetexpensescode));
                                    return (
                                        <React.Fragment key={i}>
                                            <TableRow>
                                                <TableCell colSpan={3} component="th" scope="row" align="left" style={{ fontWeight: 'bolder', color: 'blue', borderLeft: '1px dashed black', borderBottom: '1px dashed black', fontSize: '14px' }}>{data.estateTaskName}</TableCell>
                                            </TableRow>
                                            {sortedDetails.map((detail, k) => {
                                                return (
                                                    <TableRow key={`${i}-${k}`}>
                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black", borderLeft: "1px dashed black", fontSize: '10px' }}> {detail.budgetexpensescode}</TableCell>
                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black", borderLeft: "1px dashed black", fontSize: '10px' }}> {detail.taskCode}</TableCell>
                                                        <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black", borderLeft: "1px dashed black", fontSize: '10px' }}> {detail.taskName}</TableCell>
                                                        {/* <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black", borderLeft: "1px dashed black" }}> {detail.measuringUnitName}</TableCell> */}
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