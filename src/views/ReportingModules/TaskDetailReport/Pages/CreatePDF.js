import React from 'react';
import tokenService from '../../../../utils/tokenDecoder';
import Paper from '@material-ui/core/Paper';
import TablePagination from '@material-ui/core/TablePagination';
import {
    Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader, MenuItem,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Table,
    TableFooter
} from '@material-ui/core';

class ComponentToPrint extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            page: 0,
            limit: 10
        };
    }

    handlePageChange = (event, newPage) => {
        this.setState({ page: newPage });
    };

    handleLimitChange = (event) => {
        this.setState({ limit: event.target.value });
    };

    render() {
        const { page, limit } = this.state;
        const { searchData, employeeData } = this.props;

        return (
            <div>
                <h2><u>Task Details Report</u></h2>
                <br></br>
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><b>Business Division : </b> {searchData.groupName}</div>
                    <div className="col"><b>Location : </b> {searchData.gardenName}</div>
                    <div className="col"><b>Task Type : </b> {searchData.taskTypeID == undefined ? "All Task Types" : searchData.taskTypeID}</div>
                    <div className="col"><b>Task Category : </b> {searchData.estateTaskID == undefined ? "All Task Category" : searchData.estateTaskID}</div>
                    <div className="col"><b>Product : </b> {searchData.productID == undefined ? "All Product" : searchData.productID}</div>
                </div>
                <br></br>
                <div>
                    <Box minWidth={1050}>
                        <TableContainer component={Paper}>
                            <Table aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>GL Code</TableCell>
                                        <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>Task Name</TableCell>
                                        <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Task Code</TableCell>
                                        <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Measuring Unit</TableCell>
                                        <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Emp.Category Type</TableCell>
                                        <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>Expense Type</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {employeeData.slice(page * limit, page * limit + limit).map((rows) => (
                                        <React.Fragment key={rows.taskCategoryName}>
                                            <TableRow>
                                                <TableCell colSpan={6} align="left" style={{ fontWeight: "bold", border: "1px solid black" }}> {"Task Category : " + rows.taskCategoryName}</TableCell>
                                            </TableRow>
                                            {rows.tasks.map((row, index) => (
                                                <TableRow key={index}>
                                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}> {row.budgetexpensescode}</TableCell>
                                                    <TableCell align="left" style={{ border: "1px solid black" }}> {row.taskName}</TableCell>
                                                    <TableCell align="right" style={{ border: "1px solid black" }}> {row.taskCode}</TableCell>
                                                    <TableCell align="right" style={{ border: "1px solid black" }}> {row.measuringUnitName}</TableCell>
                                                    <TableCell align="right" style={{ border: "1px solid black" }}> {row.employeeCategoryName}</TableCell>
                                                    <TableCell align="right" style={{ border: "1px solid black" }}> {row.taskTypeName}</TableCell>
                                                </TableRow>
                                            ))}
                                        </React.Fragment>
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

export default ComponentToPrint;
