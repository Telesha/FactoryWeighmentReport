import React from "react";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableFooter from '@material-ui/core/TableFooter';
import Paper from '@material-ui/core/Paper';
import { Grid, InputLabel, CardContent, Card, Box } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import tokenService from '../../../../utils/tokenDecoder';

const styles = {
    headerRow: {
        height: '10px',
    },
    cell: {
        padding: '1px', // Adjust padding if needed
    },
};

class ComponentToPrint extends React.Component {
    render() {
        const data = this.props.data;
        const summeryValues = this.props.summeryValues;
        const searchData = this.props.selectedSearchValues;
        const summeryData = this.props.summeryData;
        const subNames = this.props.subNames;
        const colName = this.props.colName;
        const empCount = this.props.empCount;
        const csvData = this.props.csvData;
        const { classes } = this.props;

        const currentDate = new Date();

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const cDate = currentDate.getDate();
        const hours = currentDate.getHours();
        const minutes = currentDate.getMinutes();

        const formattedDate = `${year}-${month}-${cDate}`;
        const formattedTime = `${hours}:${minutes}`
        return (
            <div>
                <style>
                    {`
                    @page {
                        size: A4 protrait;
                        margin-left: 1in;
                        margin-bottom: 0.5in;
                        margin-top: 0.5in;
                    }
                `}
                </style>
                <h3><left><u>Daily Weighment Register</u></left></h3>
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><left><b>Business Division: </b> {searchData.groupName}</left></div>
                    <div className="col"><left><b>Location : </b> {searchData.gardenName == undefined ? "All" : searchData.gardenName}</left></div>
                    <div className="col"><left><b>Sub-Division : </b> {searchData.costCenterName == undefined ? "All" : searchData.costCenterName}</left></div>
                    <div className="col"><left><b>Pay Point : </b> {searchData.payPointName == undefined ? "All" : searchData.payPointName}</left></div>
                    <div className="col"><left><b>Employee Category : </b> {searchData.empTypeName ===undefined ? "All" : searchData.empTypeName} </left></div>
                    <div className="col"><left><b>Harvesting Job : </b> {searchData.taskName === "" ? "All" : searchData.taskName} </left></div>
                    <div className="col"><left><b>Date : </b> {searchData.date} </left></div>
                </div>
                <>
                    <Box minWidth={1050}>
                        <Card>
                            <TableContainer component={Paper}>
                                <div className="row alternative_cls bg-light  ">
                                    <CardContent>
                                        <Box display="flex" justifyContent="flex-start" style={{ width: 400 }} >
                                            <Grid item md={3} xs={8} style={{ borderBottom: '1px solid black', borderTop: '1px solid black' }}>
                                                <InputLabel style={{ color: "black", marginTop: '3px', marginBottom: '3px', fontSize: '12px' }}></InputLabel>
                                            </Grid>
                                            <Grid item md={3} xs={8} style={{ textAlign: 'right', borderBottom: '1px solid black', borderTop: '1px solid black', marginLeft: '-1px' }}>
                                                <InputLabel style={{ color: "black", marginTop: '3px', marginBottom: '3px', fontSize: '12px' }}><b>Kg</b></InputLabel>
                                            </Grid>
                                            <Grid item md={3} xs={8} style={{ textAlign: 'right', borderBottom: '1px solid black', borderTop: '1px solid black', marginLeft: '-1px' }}>
                                                <InputLabel style={{ color: "black", marginTop: '3px', marginBottom: '3px', fontSize: '12px' }}><b>Emp Count</b></InputLabel>
                                            </Grid>
                                            <Grid item md={3} xs={8} style={{ textAlign: 'right', borderBottom: '1px solid black', borderTop: '1px solid black', marginLeft: '-1px' }}>
                                                <InputLabel style={{ color: "black", marginTop: '3px', marginBottom: '3px', fontSize: '12px' }}><b>Avg</b></InputLabel>
                                            </Grid>
                                        </Box>
                                        {summeryData.map((item) => {
                                            if (item.prop == "01") {
                                                return (
                                                    <Box display="flex" justifyContent="flex-start" style={{ width: 400 }}>
                                                        <Grid item md={3} xs={8} style={{ textAlign: 'right', borderBottom: "1px dashed black" }}>
                                                            <InputLabel style={{ color: "black", marginTop: '3px', marginBottom: '3px', fontSize: '12px' }} ><b>Weighment 1 </b></InputLabel>
                                                        </Grid>
                                                        <Grid item md={3} xs={8} style={{ textAlign: 'right', borderBottom: "1px dashed black", marginLeft: '-1px' }}>
                                                            <InputLabel style={{ color: "black", fontWeight: "bold", marginTop: '3px', marginBottom: '3px', fontSize: '12px' }} >{item.value == 0 ? "-" : parseFloat(item.value).toFixed(2)} </InputLabel>
                                                        </Grid>
                                                        <Grid item md={3} xs={8} style={{ textAlign: 'right', borderBottom: "1px dashed black", marginLeft: '-1px' }}>
                                                            <InputLabel style={{ color: "black", fontWeight: "bold", marginTop: '3px', marginBottom: '3px', fontSize: '12px' }} >{item.value == 0 ? "-" : parseInt(empCount.Weighment1Count)} </InputLabel>
                                                        </Grid>
                                                        <Grid item md={3} xs={8} style={{ textAlign: 'right', borderBottom: "1px dashed black", marginLeft: '-1px' }}>
                                                            <InputLabel style={{ color: "black", fontWeight: "bold", marginTop: '3px', marginBottom: '3px', fontSize: '12px' }} >{item.value == 0 ? "-" : parseFloat((item.value) / empCount.Weighment1Count).toFixed(2)} </InputLabel>
                                                        </Grid>
                                                    </Box>
                                                )
                                            }
                                            else if (item.prop == "02") {
                                                return (
                                                    <Box display="flex" justifyContent="flex-start" style={{ width: 400 }}>
                                                        <Grid item md={3} xs={8} style={{ textAlign: 'right', borderBottom: "1px dashed black" }}>
                                                            <InputLabel style={{ color: "black", marginTop: '3px', marginBottom: '3px', fontSize: '12px' }}><b>Weighment 2</b></InputLabel>
                                                        </Grid>
                                                        <Grid item md={3} xs={8} style={{ textAlign: 'right', borderBottom: "1px dashed black", marginLeft: '-1px' }}>
                                                            <InputLabel style={{ color: "black", fontWeight: "bold", marginTop: '3px', marginBottom: '3px', fontSize: '12px' }}>{item.value == 0 ? "-" : parseFloat(item.value).toFixed(2)} </InputLabel>
                                                        </Grid>
                                                        <Grid item md={3} xs={8} style={{ textAlign: 'right', borderBottom: "1px dashed black", marginLeft: '-1px' }}>
                                                            <InputLabel style={{ color: "black", fontWeight: "bold", marginTop: '3px', marginBottom: '3px', fontSize: '12px' }} >{item.value == 0 ? "-" : parseInt(empCount.Weighment2Count)} </InputLabel>
                                                        </Grid>
                                                        <Grid item md={3} xs={8} style={{ textAlign: 'right', borderBottom: "1px dashed black", marginLeft: '-1px' }}>
                                                            <InputLabel style={{ color: "black", fontWeight: "bold", marginTop: '3px', marginBottom: '3px', fontSize: '12px' }} >{item.value == 0 ? "-" : parseFloat((item.value) / empCount.Weighment2Count).toFixed(2)} </InputLabel>
                                                        </Grid>
                                                    </Box>
                                                )
                                            }
                                            else if (item.prop == "03") {
                                                return (
                                                    <Box display="flex" justifyContent="flex-start" style={{ width: 400 }}>
                                                        <Grid item md={3} xs={8} style={{ textAlign: 'right', borderBottom: "1px dashed black" }}>
                                                            <InputLabel style={{ color: "black", marginTop: '3px', marginBottom: '3px', fontSize: '12px' }}><b>Weighment 3</b></InputLabel>
                                                        </Grid>
                                                        <Grid item md={3} xs={8} style={{ textAlign: 'right', borderBottom: "1px dashed black", marginLeft: '-1px' }}>
                                                            <InputLabel style={{ color: "black", fontWeight: "bold", marginTop: '3px', marginBottom: '3px', fontSize: '12px' }}>{item.value == 0 ? "-" : parseFloat(item.value).toFixed(2)} </InputLabel>
                                                        </Grid>
                                                        <Grid item md={3} xs={8} style={{ textAlign: 'right', borderBottom: "1px dashed black", marginLeft: '-1px' }}>
                                                            <InputLabel style={{ color: "black", fontWeight: "bold", marginTop: '3px', marginBottom: '3px', fontSize: '12px' }} >{item.value == 0 ? "-" : parseInt(empCount.Weighment3Count)} </InputLabel>
                                                        </Grid>
                                                        <Grid item md={3} xs={8} style={{ textAlign: 'right', borderBottom: "1px dashed black", marginLeft: '-1px' }}>
                                                            <InputLabel style={{ color: "black", fontWeight: "bold", marginTop: '3px', marginBottom: '3px', fontSize: '12px' }} >{item.value == 0 ? "-" : parseFloat((item.value) / empCount.Weighment3Count).toFixed(2)} </InputLabel>
                                                        </Grid>
                                                    </Box>
                                                )
                                            }
                                            else if (item.prop == "04") {
                                                return (
                                                    <Box display="flex" justifyContent="flex-start" style={{ width: 400 }}>
                                                        <Grid item md={3} xs={8} style={{ textAlign: 'right', borderBottom: "1px dashed black" }}>
                                                            <InputLabel style={{ color: "black", marginTop: '3px', marginBottom: '3px', fontSize: '12px' }}><b>Weighment 4</b></InputLabel>
                                                        </Grid>
                                                        <Grid item md={3} xs={8} style={{ textAlign: 'right', borderBottom: "1px dashed black", marginLeft: '-1px' }}>
                                                            <InputLabel style={{ color: "black", fontWeight: "bold", marginTop: '3px', marginBottom: '3px', fontSize: '12px' }}>{item.value == 0 ? "-" : parseFloat(item.value).toFixed(2)} </InputLabel>
                                                        </Grid>
                                                        <Grid item md={3} xs={8} style={{ textAlign: 'right', borderBottom: "1px dashed black", marginLeft: '-1px' }}>
                                                            <InputLabel style={{ color: "black", fontWeight: "bold", marginTop: '3px', marginBottom: '3px', fontSize: '12px' }} >{item.value == 0 ? "-" : parseInt(empCount.Weighment4Count)} </InputLabel>
                                                        </Grid>
                                                        <Grid item md={3} xs={8} style={{ textAlign: 'right', borderBottom: "1px dashed black", marginLeft: '-1px' }}>
                                                            <InputLabel style={{ color: "black", fontWeight: "bold", marginTop: '3px', marginBottom: '3px', fontSize: '12px' }} >{item.value == 0 ? "-" : parseFloat((item.value) / empCount.Weighment4Count).toFixed(2)} </InputLabel>
                                                        </Grid>
                                                    </Box>
                                                )
                                            }
                                        })}
                                        <Box display="flex" justifyContent="flex-start" style={{ width: 400 }}>
                                            <Grid item md={3} xs={8} style={{ textAlign: 'right', borderBottom: "1px solid black" }}>
                                                <InputLabel style={{ color: "black", marginTop: '3px', marginBottom: '3px', fontSize: '12px', backgroundColor: "#f0f0f0" }}><b>Total</b></InputLabel>
                                            </Grid>
                                            <Grid item md={3} xs={8} style={{ textAlign: 'right', borderBottom: "1px solid black", marginLeft: '-1px' }}>
                                                <InputLabel style={{ color: "black", fontWeight: "bold", marginTop: '3px', marginBottom: '3px', fontSize: '12px', backgroundColor: "#f0f0f0" }} >{parseFloat(summeryValues.allTotal).toFixed(2)} </InputLabel>
                                            </Grid>
                                            <Grid item md={3} xs={8} style={{ textAlign: 'right', borderBottom: "1px solid black", marginLeft: '-1px' }}>
                                                <InputLabel style={{ color: "black", fontWeight: "bold", marginTop: '3px', marginBottom: '3px', fontSize: '12px', backgroundColor: "#f0f0f0" }} >{parseInt(csvData.length)} </InputLabel>
                                            </Grid>
                                            <Grid item md={3} xs={8} style={{ textAlign: 'right', borderBottom: "1px solid black", marginLeft: '-1px' }}>
                                                <InputLabel style={{ color: "black", fontWeight: "bold", marginTop: '3px', marginBottom: '3px', fontSize: '12px', backgroundColor: "#f0f0f0" }} >{parseFloat(summeryValues.allTotal / csvData.length).toFixed(2)} </InputLabel>
                                            </Grid>
                                        </Box>
                                    </CardContent>
                                    <br>
                                    </br>
                                    <Box minWidth={1000}>
                                        <TableContainer style={{ maxWidth: 'calc(100% - 1in)' }}>
                                            <Table aria-label="caption table" size="small">
                                                <TableHead>
                                                    <TableRow className={classes.headerRow}>
                                                        <TableCell className={classes.cell} component="th" rowSpan={2} align="center" style={{ fontWeight: "bold", border: '1px dashed black', fontSize: '12px', width: '80px' }}>
                                                            Reg.No
                                                        </TableCell>
                                                        <TableCell className={classes.cell} component="th" rowSpan={2} align="center" style={{ fontWeight: "bold", border: '1px dashed black', fontSize: '12px', width: '150px' }}>
                                                            Employee Name
                                                        </TableCell>
                                                        {colName.map((item) => {
                                                            if (item == "01") {
                                                                return (
                                                                    <TableCell className={classes.cell} component="th" colSpan={2} style={{ fontWeight: "bold", border: '1px dashed black', fontSize: '12px', width: '200px' }} align='center'>
                                                                        Weighment 1
                                                                    </TableCell>
                                                                );
                                                            } else if (item == "02") {
                                                                return (
                                                                    <TableCell className={classes.cell} component="th" colSpan={2} style={{ fontWeight: "bold", border: '1px dashed black', fontSize: '12px', width: '200px' }} align='center'>
                                                                        Weighment 2
                                                                    </TableCell>
                                                                );
                                                            }
                                                            else if (item == "03") {
                                                                return (
                                                                    <TableCell className={classes.cell} component="th" colSpan={2} style={{ fontWeight: "bold", border: '1px dashed black', fontSize: '12px', width: '200px' }} align='center'>
                                                                        Weighment 3
                                                                    </TableCell>
                                                                );
                                                            }
                                                            else if (item == "04") {
                                                                return (
                                                                    <TableCell className={classes.cell} component="th" colSpan={2} style={{ fontWeight: "bold", border: '1px dashed black', fontSize: '12px', width: '200px' }} align='center'>
                                                                        Weighment 4
                                                                    </TableCell>
                                                                );
                                                            }
                                                        })}
                                                        <TableCell className={classes.cell} component="th" rowSpan={2} align="center" style={{ fontWeight: "bold", border: '1px dashed black', fontSize: '12px', width: '150px' }}>
                                                            Total Kg
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow className={classes.headerRow}>
                                                        {subNames.map((item) => {
                                                            var res = item.slice(-1);
                                                            if (res == 'F') {
                                                                return (
                                                                    <TableCell className={classes.cell} component="th" style={{ fontWeight: "bold", border: '1px dashed black', fontSize: '12px', width: '70px' }} align='center'>
                                                                        Section
                                                                    </TableCell>
                                                                );
                                                            }
                                                            else if (res == 'N') {
                                                                return (
                                                                    <TableCell className={classes.cell} component="th" style={{ fontWeight: "bold", border: '1px dashed black', fontSize: '12px', width: '80px' }} align='center'>
                                                                        Kg
                                                                    </TableCell>
                                                                );
                                                            }
                                                        })}
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {data.map((data, i) => {
                                                        const sortedDetails = data.details.sort((a, b) => a.registrationNumber.localeCompare(b.registrationNumber));

                                                        return (
                                                            <React.Fragment key={i}>
                                                                <TableRow>
                                                                    <TableCell colSpan={12} component="th" scope="row" align="left" style={{ fontWeight: 'bolder', color: 'green', borderBottom: "none", border: "1px dashed black", fontSize: '12px', backgroundColor: "#f0f0f0", padding: '3px' }}>Pay Point: {data.divisionName} <div>Category: {data.employeeSubCategoryName}</div></TableCell>
                                                                </TableRow>
                                                                {sortedDetails.map((row, k) => {
                                                                    return (
                                                                        <TableRow key={k}>
                                                                            <TableCell align="left" style={{ fontSize: '12px', borderBottom: "none", border: "1px dashed black", padding: '3px', width: '80px' }}>
                                                                                {row.registrationNumber}
                                                                            </TableCell>
                                                                            <TableCell align="left" style={{ fontSize: '12px', borderBottom: "none", border: "1px dashed black", padding: '3px', width: '150px', overflow: 'hidden' }}>
                                                                                {row.firstName}
                                                                            </TableCell>
                                                                            {subNames.map((column) => {
                                                                                const value = row[column];
                                                                                var res = column.slice(-1);
                                                                                if (res == 'F') {
                                                                                    return (
                                                                                        <TableCell style={{ fontSize: '12px', borderBottom: "none", border: "1px dashed black", padding: '3px', width: '70px' }} align='right'>
                                                                                            {value == undefined ? '-' : res == 'N' ? parseFloat(value).toFixed(2) : value}
                                                                                        </TableCell>
                                                                                    );
                                                                                }
                                                                                else if (res == 'N') {
                                                                                    return (
                                                                                        <TableCell style={{ fontSize: '12px', borderBottom: "none", border: "1px dashed black", padding: '3px', width: '80px' }} align='right'>
                                                                                            {value == undefined ? '-' : res == 'N' ? parseFloat(value).toFixed(2) : value}
                                                                                        </TableCell>
                                                                                    );
                                                                                }
                                                                            })}
                                                                            <TableCell style={{ fontSize: '12px', borderBottom: "none", border: "1px dashed black", padding: '3px' }} align="right">{parseFloat(row.total).toFixed(2)}</TableCell>
                                                                        </TableRow>
                                                                    );
                                                                })}
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                    <TableRow>
                                                        <TableCell colSpan={2} component="th" align="left" style={{ fontWeight: "bold", borderBottom: "none", border: "1px dashed black", fontSize: '12px', backgroundColor: "#f0f0f0", padding: '3px' }} >
                                                            Grand Total
                                                        </TableCell>
                                                        {summeryData.map((item) => {
                                                            if (item.prop == "01") {
                                                                return (
                                                                    <>
                                                                        <TableCell component="th" align="left" style={{ fontWeight: "bold", borderBottom: "none", border: "1px dashed black", fontSize: '12px', backgroundColor: "#f0f0f0", padding: '3px' }} >
                                                                        </TableCell>
                                                                        <TableCell component="th" align="right" style={{ fontWeight: "bold", borderBottom: "none", border: "1px dashed black", fontSize: '12px', backgroundColor: "#f0f0f0", padding: '3px' }} >
                                                                            {item.value == 0 ? "-" : parseFloat(item.value).toFixed(2)}
                                                                        </TableCell>
                                                                    </>
                                                                )
                                                            }
                                                            else if (item.prop == "02") {
                                                                return (
                                                                    <>
                                                                        <TableCell component="th" align="left" style={{ fontWeight: "bold", borderBottom: "none", border: "1px dashed black", fontSize: '12px', backgroundColor: "#f0f0f0", padding: '3px' }} >
                                                                        </TableCell>
                                                                        <TableCell component="th" align="right" style={{ fontWeight: "bold", borderBottom: "none", border: "1px dashed black", fontSize: '12px', backgroundColor: "#f0f0f0", padding: '3px' }} >
                                                                            {item.value == 0 ? "-" : parseFloat(item.value).toFixed(2)}
                                                                        </TableCell>
                                                                    </>
                                                                )
                                                            }
                                                            else if (item.prop == "03") {
                                                                return (
                                                                    <>
                                                                        <TableCell component="th" align="left" style={{ fontWeight: "bold", borderBottom: "none", border: "1px dashed black", fontSize: '12px', backgroundColor: "#f0f0f0", padding: '3px' }} >
                                                                        </TableCell>
                                                                        <TableCell component="th" align="right" style={{ fontWeight: "bold", borderBottom: "none", border: "1px dashed black", fontSize: '12px', backgroundColor: "#f0f0f0", padding: '3px' }} >
                                                                            {item.value == 0 ? "-" : parseFloat(item.value).toFixed(2)}
                                                                        </TableCell>
                                                                    </>
                                                                )
                                                            }
                                                            else if (item.prop == "04") {
                                                                return (
                                                                    <>
                                                                        <TableCell component="th" align="left" style={{ fontWeight: "bold", borderBottom: "none", border: "1px dashed black", fontSize: '12px', backgroundColor: "#f0f0f0", padding: '3px' }} >
                                                                        </TableCell>
                                                                        <TableCell component="th" align="right" style={{ fontWeight: "bold", borderBottom: "none", border: "1px dashed black", fontSize: '12px', backgroundColor: "#f0f0f0", padding: '3px' }} >
                                                                            {item.value == 0 ? "-" : parseFloat(item.value).toFixed(2)}
                                                                        </TableCell>
                                                                    </>
                                                                )
                                                            }
                                                        })}
                                                        <TableCell component="th" align="right" style={{ fontWeight: "bold", borderBottom: "none", border: "1px dashed black", fontSize: '12px', backgroundColor: "#f0f0f0", padding: '3px' }} >
                                                            {parseFloat(summeryValues.allTotal).toFixed(2)}
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                                <TableFooter>
                                                    <TableRow>
                                                        <TableCell colSpan={5} component="th" align="left" tyle={{ fontWeight: "bold", borderBottom: "none", fontSize: '12px', padding: '3px' }}>User : {tokenService.getUserNameFromToken()}</TableCell>
                                                        <TableCell colSpan={4} component="th" align="left" color="black" tyle={{ fontWeight: "bold", borderBottom: "none", fontSize: '12px', padding: '3px' }}>Date : {formattedDate}</TableCell>
                                                        <TableCell colSpan={2} component="th" align="left" color="black" tyle={{ fontWeight: "bold", borderBottom: "none", fontSize: '12px', padding: '3px' }}>Time : {formattedTime}</TableCell>
                                                    </TableRow>
                                                </TableFooter>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                </div>
                            </TableContainer>
                        </Card>
                    </Box>
                </>
            </div>
        );
    }
}

export default withStyles(styles)(ComponentToPrint);