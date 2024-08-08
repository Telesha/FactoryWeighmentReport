import React from "react";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import moment from 'moment';
import LineWeightIcon from '@material-ui/icons/LineWeight';
import { Chip, Grid, InputLabel, CardContent, Card, Box } from '@material-ui/core';
import { parse } from "date-fns";

export default class ComponentToPrint extends React.Component {
    render() {
        const data = this.props.data;
        const summeryValues = this.props.summeryValues;
        const searchData = this.props.selectedSearchValues;
        const summeryData = this.props.summeryData;
        const subNames = this.props.subNames;
        const colName = this.props.colName;
        const empCount = this.props.empCount;
        return (
            <div>
                <h3><center><u>Daily Weighment Register Report</u></center></h3>
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><center><b>Garden : </b> {searchData.gardenName}</center></div>
                    <div className="col"><center><b>Division : </b> {searchData.costCenterName == undefined ? "All Cost Centers" : searchData.costCenterName}</center></div>
                    <div className="col"><center><b>Section : </b> {searchData.fieldName == "" ? "All Sections" : searchData.fieldName}</center></div>
                    <div className="col"><center><b>Duffa : </b> {searchData.gangName === "" ? "All Duffas" : searchData.gangName} </center></div>
                    <div className="col"><center><b>Employee Type : </b> {searchData.empTypeName === "" ? "All Employee Types" : searchData.empTypeName} </center></div>
                    <div className="col"><center><b>Operator : </b> {searchData.operatorName === "" ? "All Operators" : searchData.operatorName} </center></div>
                    <div className="col"><center><b>Date : </b> {searchData.date} </center></div>
                </div>
                <CardContent>
                    <Box minWidth={1050}>
                        <Card>
                            <TableContainer component={Paper}>
                                <div className="row alternative_cls bg-light  ">
                                    <CardContent>
                                        <Box display="flex" justifyContent="flex-start" style={{ width: 600 }} >
                                            <Grid item md={2} xs={8} style={{ border: "1px solid black" }}>
                                                <InputLabel style={{ color: "black", marginTop: '3px', marginBottom: '3px' }}></InputLabel>
                                            </Grid>
                                            <Grid item md={2} xs={8} style={{ border: "1px solid black", marginLeft: '-1px' }}>
                                                <InputLabel style={{ color: "black", marginTop: '3px', marginBottom: '3px' }}><b>Qty</b></InputLabel>
                                            </Grid>
                                            <Grid item md={2} xs={8} style={{ border: "1px solid black", marginLeft: '-1px' }}>
                                                <InputLabel style={{ color: "black", marginTop: '3px', marginBottom: '3px' }}><b>Amount</b></InputLabel>
                                            </Grid>
                                            <Grid item md={2} xs={8} style={{ border: "1px solid black", marginLeft: '-1px' }}>
                                                <InputLabel style={{ color: "black", marginTop: '3px', marginBottom: '3px' }}><b>Emp Count</b></InputLabel>
                                            </Grid>
                                            <Grid item md={2} xs={8} style={{ border: "1px solid black", marginLeft: '-1px' }}>
                                                <InputLabel style={{ color: "black", marginTop: '3px', marginBottom: '3px' }}><b>Avg</b></InputLabel>
                                            </Grid>
                                        </Box>
                                        {summeryData.map((item) => {
                                            if (item["Morning CashN"] || item["Off Day Cash 1N"] || item["Morning CashA"] || item["Off Day Cash 1A"]) {
                                                return (
                                                    <Box display="flex" justifyContent="flex-start" style={{ width: 600 }}>
                                                        <Grid item md={2} xs={8} style={{ border: "1px solid black" }}>
                                                            <InputLabel style={{ color: "black", marginTop: '3px', marginBottom: '3px' }} ><b>Weighment 1 </b></InputLabel>
                                                        </Grid>
                                                        <Grid item md={2} xs={8} style={{ border: "1px solid black", marginLeft: '-1px' }}>
                                                            <InputLabel style={{ color: "black", fontWeight: "bold", marginTop: '3px', marginBottom: '3px' }} >{parseFloat(item['Morning CashN'] || item["Off Day Cash 1N"]).toFixed(2)} </InputLabel>
                                                        </Grid>
                                                        <Grid item md={2} xs={8} style={{ border: "1px solid black", marginLeft: '-1px' }}>
                                                            <InputLabel style={{ color: "black", fontWeight: "bold", marginTop: '3px', marginBottom: '3px' }} >{parseInt(item["Morning CashA"] || item["Off Day Cash 1A"])} </InputLabel>
                                                        </Grid>
                                                        <Grid item md={2} xs={8} style={{ border: "1px solid black", marginLeft: '-1px' }}>
                                                            <InputLabel style={{ color: "black", fontWeight: "bold", marginTop: '3px', marginBottom: '3px' }} >{parseInt(empCount.Weighment1Count)} </InputLabel>
                                                        </Grid>
                                                        <Grid item md={2} xs={8} style={{ border: "1px solid black", marginLeft: '-1px' }}>
                                                            <InputLabel style={{ color: "black", fontWeight: "bold", marginTop: '3px', marginBottom: '3px' }} >{parseFloat((item['Morning CashN'] || item["Off Day Cash 1N"]) / empCount.Weighment1Count).toFixed(2)} </InputLabel>
                                                        </Grid>
                                                    </Box>
                                                )
                                            }
                                            else if (item["Mid Day SessionN"] || item["Off Day Cash 2N"] || item["Mid Day SessionA"] || item["Off Day Cash 2A"]) {
                                                return (
                                                    <Box display="flex" justifyContent="flex-start" style={{ width: 600 }}>
                                                        <Grid item md={2} xs={8} style={{ border: "1px solid black" }}>
                                                            <InputLabel style={{ color: "black", marginTop: '3px', marginBottom: '3px' }}><b>Weighment 2</b></InputLabel>
                                                        </Grid>
                                                        <Grid item md={2} xs={8} style={{ border: "1px solid black", marginLeft: '-1px' }}>
                                                            <InputLabel style={{ color: "black", fontWeight: "bold", marginTop: '3px', marginBottom: '3px' }}>{parseFloat(item["Mid Day SessionN"] || item["Off Day Cash 2N"]).toFixed(2)} </InputLabel>
                                                        </Grid>
                                                        <Grid item md={2} xs={8} style={{ border: "1px solid black", marginLeft: '-1px' }}>
                                                            <InputLabel style={{ color: "black", fontWeight: "bold", marginTop: '3px', marginBottom: '3px' }}>{parseInt(item["Mid Day SessionA"] || item["Off Day Cash 2A"])} </InputLabel>
                                                        </Grid>
                                                        <Grid item md={2} xs={8} style={{ border: "1px solid black", marginLeft: '-1px' }}>
                                                            <InputLabel style={{ color: "black", fontWeight: "bold", marginTop: '3px', marginBottom: '3px' }} >{parseInt(empCount.Weighment2Count)} </InputLabel>
                                                        </Grid>
                                                        <Grid item md={2} xs={8} style={{ border: "1px solid black", marginLeft: '-1px' }}>
                                                            <InputLabel style={{ color: "black", fontWeight: "bold", marginTop: '3px', marginBottom: '3px' }} >{parseFloat((item["Mid Day SessionN"] || item["Off Day Cash 2N"]) / empCount.Weighment2Count).toFixed(2)} </InputLabel>
                                                        </Grid>
                                                    </Box>
                                                )
                                            }
                                            else if (item["Evening SessionN"] || item["Off Day Cash 3N"] || item["Evening SessionA"] || item["Off Day Cash 3A"]) {
                                                return (
                                                    <Box display="flex" justifyContent="flex-start" style={{ width: 600 }}>
                                                        <Grid item md={2} xs={8} style={{ border: "1px solid black" }}>
                                                            <InputLabel style={{ color: "black", marginTop: '3px', marginBottom: '3px' }}><b>Weighment 3</b></InputLabel>
                                                        </Grid>
                                                        <Grid item md={2} xs={8} style={{ border: "1px solid black", marginLeft: '-1px' }}>
                                                            <InputLabel style={{ color: "black", fontWeight: "bold", marginTop: '3px', marginBottom: '3px' }}>{parseFloat(item["Evening SessionN"] || item["Off Day Cash 3N"]).toFixed(2)} </InputLabel>
                                                        </Grid>
                                                        <Grid item md={2} xs={8} style={{ border: "1px solid black", marginLeft: '-1px' }}>
                                                            <InputLabel style={{ color: "black", fontWeight: "bold", marginTop: '3px', marginBottom: '3px' }}>{parseInt(item["Evening SessionA"] || item["Off Day Cash 3A"])} </InputLabel>
                                                        </Grid>
                                                        <Grid item md={2} xs={8} style={{ border: "1px solid black", marginLeft: '-1px' }}>
                                                            <InputLabel style={{ color: "black", fontWeight: "bold", marginTop: '3px', marginBottom: '3px' }} >{parseInt(empCount.Weighment3Count)} </InputLabel>
                                                        </Grid>
                                                        <Grid item md={2} xs={8} style={{ border: "1px solid black", marginLeft: '-1px' }}>
                                                            <InputLabel style={{ color: "black", fontWeight: "bold", marginTop: '3px', marginBottom: '3px' }} >{parseFloat((item["Evening SessionN"] || item["Off Day Cash 3N"]) / empCount.Weighment3Count).toFixed(2)} </InputLabel>
                                                        </Grid>
                                                    </Box>
                                                )
                                            }
                                        })}
                                        <Box display="flex" justifyContent="flex-start" style={{ width: 600 }}>
                                            <Grid item md={2} xs={8} style={{ border: "1px solid black" }}>
                                                <InputLabel style={{ color: "black", marginTop: '3px', marginBottom: '3px' }}><b>Total</b></InputLabel>
                                            </Grid>
                                            <Grid item md={2} xs={8} style={{ border: "1px solid black", marginLeft: '-1px' }}>
                                                <InputLabel style={{ color: "black", fontWeight: "bold", marginTop: '3px', marginBottom: '3px' }} >{parseFloat(summeryValues.allTotal).toFixed(2)} </InputLabel>
                                            </Grid>
                                            <Grid item md={2} xs={8} style={{ border: "1px solid black", marginLeft: '-1px' }}>
                                                <InputLabel style={{ color: "black", fontWeight: "bold", marginTop: '3px', marginBottom: '3px' }} >{parseInt(summeryValues.allAmountTotal)} </InputLabel>
                                            </Grid>
                                            <Grid item md={2} xs={8} style={{ border: "1px solid black", marginLeft: '-1px' }}>
                                                <InputLabel style={{ color: "black", fontWeight: "bold", marginTop: '3px', marginBottom: '3px' }} >{parseInt(data.length)} </InputLabel>
                                            </Grid>
                                            <Grid item md={2} xs={8} style={{ border: "1px solid black", marginLeft: '-1px' }}>
                                                <InputLabel style={{ color: "black", fontWeight: "bold", marginTop: '3px', marginBottom: '3px' }} >{parseFloat(summeryValues.allTotal / data.length).toFixed(2)} </InputLabel>
                                            </Grid>
                                        </Box>
                                    </CardContent>
                                    <br>
                                    </br>
                                    <Table aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell rowSpan={2} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                    Duffa
                                                </TableCell>
                                                <TableCell rowSpan={2} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                    Employee Type
                                                </TableCell>
                                                <TableCell rowSpan={2} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                    Reg.No
                                                </TableCell>
                                                <TableCell rowSpan={2} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                    Employee Name
                                                </TableCell>
                                                {colName.map((item) => {
                                                    if (item == "Morning Cash" || item == "Off Day Cash 1") {
                                                        return (
                                                            <TableCell colSpan={4} style={{ fontWeight: "bold", border: "1px solid black" }} align='center'>
                                                                {"Weighment 1"}
                                                            </TableCell>
                                                        );
                                                    } else if (item == "Mid Day Session" || item == "Off Day Cash 2") {
                                                        return (
                                                            <TableCell colSpan={4} style={{ fontWeight: "bold", border: "1px solid black" }} align='center'>
                                                                {"Weighment 2"}
                                                            </TableCell>
                                                        );
                                                    }
                                                    else if (item == "Evening Session" || item == "Off Day Cash 3") {
                                                        return (
                                                            <TableCell colSpan={4} style={{ fontWeight: "bold", border: "1px solid black" }} align='center'>
                                                                {"Weighment 3"}
                                                            </TableCell>
                                                        );
                                                    }
                                                })}
                                                <TableCell rowSpan={2} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                    Total Qty
                                                </TableCell>
                                                <TableCell rowSpan={2} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                    Total Amount
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                {subNames.map((item) => {
                                                    var res = item.slice(-1);
                                                    return (
                                                        <TableCell style={{ fontWeight: "bold", border: "1px solid black" }} align='center'>
                                                            {res == 'N' ? 'Kg' : res == 'F' ? 'Section' : res == 'A' ? 'Amount' : 'Operator'}
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {data.map((row) => (
                                                <TableRow key={row.registrationNumber}>
                                                    <TableCell component="th" align="left" style={{ border: "1px solid black" }} >
                                                        {row.gangName}
                                                    </TableCell>
                                                    <TableCell align="left" style={{ border: "1px solid black" }}>
                                                        {row.employeeTypeName}
                                                    </TableCell>
                                                    <TableCell align="left" style={{ border: "1px solid black" }}>
                                                        {row.registrationNumber}
                                                    </TableCell>
                                                    <TableCell align="left" style={{ border: "1px solid black" }}>
                                                        {row.firstName}
                                                    </TableCell>
                                                    {subNames.map((column) => {
                                                        const value = row[column];
                                                        var res = column.slice(-1);
                                                        return (
                                                            <TableCell style={{ border: "1px solid black" }} align='right'>
                                                                {value == undefined ? '-' : res == 'N' ? parseFloat(value).toFixed(2) : res == 'A' ? parseInt(value) : value}
                                                            </TableCell>
                                                        );
                                                    })}
                                                    <TableCell style={{ border: "1px solid black" }} align="right">{parseFloat(row.total).toFixed(2)}</TableCell>
                                                    <TableCell style={{ border: "1px solid black" }} align="right">{parseInt(row.totalRate)}</TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow>
                                                <TableCell colSpan={4} component="th" align="left" style={{ fontWeight: "bold", border: "1px solid black" }} >
                                                    Total
                                                </TableCell>
                                                {summeryData.map((item) => {
                                                    if (item["Morning CashN"] || item["Off Day Cash 1N"] || item["Morning CashA"] || item["Off Day Cash 1A"]) {
                                                        return (
                                                            <>
                                                                <TableCell component="th" align="right" style={{ fontWeight: "bold", border: "1px solid black" }} >
                                                                    {parseFloat(item['Morning CashN'] || item["Off Day Cash 1N"]).toFixed(2)}
                                                                </TableCell>
                                                                <TableCell component="th" align="right" style={{ fontWeight: "bold", border: "1px solid black" }} >
                                                                    {parseInt(item['Morning CashA'] || item["Off Day Cash 1A"])}
                                                                </TableCell>
                                                                <TableCell component="th" align="left" style={{ fontWeight: "bold", border: "1px solid black" }} >

                                                                </TableCell>
                                                                <TableCell component="th" align="left" style={{ fontWeight: "bold", border: "1px solid black" }} >

                                                                </TableCell>
                                                            </>
                                                        )
                                                    }
                                                    else if (item["Mid Day SessionN"] || item["Off Day Cash 2N"] || item["Mid Day SessionA"] || item["Off Day Cash 2A"]) {
                                                        return (
                                                            <>
                                                                <TableCell component="th" align="right" style={{ fontWeight: "bold", border: "1px solid black" }} >
                                                                    {parseFloat(item['Mid Day SessionN'] || item["Off Day Cash 2N"]).toFixed(2)}
                                                                </TableCell>
                                                                <TableCell component="th" align="right" style={{ fontWeight: "bold", border: "1px solid black" }} >
                                                                    {parseInt(item['Mid Day SessionA'] || item["Off Day Cash 2A"])}
                                                                </TableCell>
                                                                <TableCell component="th" align="left" style={{ fontWeight: "bold", border: "1px solid black" }} >

                                                                </TableCell>
                                                                <TableCell component="th" align="left" style={{ fontWeight: "bold", border: "1px solid black" }} >

                                                                </TableCell>
                                                            </>
                                                        )
                                                    }
                                                    else if (item["Evening SessionN"] || item["Off Day Cash 3N"] || item["Evening SessionA"] || item["Off Day Cash 3A"]) {
                                                        return (
                                                            <>
                                                                <TableCell component="th" align="right" style={{ fontWeight: "bold", border: "1px solid black" }} >
                                                                    {parseFloat(item['Evening SessionN'] || item["Off Day Cash 3N"]).toFixed(2)}
                                                                </TableCell>
                                                                <TableCell component="th" align="right" style={{ fontWeight: "bold", border: "1px solid black" }} >
                                                                    {parseInt(item['Evening SessionA'] || item["Off Day Cash 3A"])}
                                                                </TableCell>
                                                                <TableCell component="th" align="left" style={{ fontWeight: "bold", border: "1px solid black" }} >

                                                                </TableCell>
                                                                <TableCell component="th" align="left" style={{ fontWeight: "bold", border: "1px solid black" }} >

                                                                </TableCell>
                                                            </>
                                                        )
                                                    }
                                                })}
                                                <TableCell component="th" align="right" style={{ fontWeight: "bold", border: "1px solid black" }} >
                                                    {parseFloat(summeryValues.allTotal).toFixed(2)}
                                                </TableCell>
                                                <TableCell component="th" align="right" style={{ fontWeight: "bold", border: "1px solid black" }} >
                                                    {parseInt(summeryValues.allAmountTotal)}
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                            </TableContainer>
                        </Card>
                    </Box>
                </CardContent>
            </div>
        );
    }
}