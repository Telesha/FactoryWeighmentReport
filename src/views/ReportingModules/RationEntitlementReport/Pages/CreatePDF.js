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
        const rationDetailsData = this.props.rationDetailsData;
        const totalValues = this.props.totalValues;
        var curr = (searchData.date);
        var sunday = moment(curr).add(6, 'days');
        return (
            <div>
                <style>
                    {`
        @page {
            size: A4 landscape;
            margin-top: 0.75in;
            margin-bottom: 0.75in;
            margin-right: 0.5in;
            margin-left: 0.5in;
            transform: scale(0.7); /* Scale to 70% */
            transform-origin: top left; /* Set origin to top left corner */
        }
    `}
                </style>
                <h2><left><u>Ration Entitlement</u></left></h2>
                <br />
                <div className="row pl-2 pb-4 pt-4">
                    <div className="col"><left><b>Business Division: </b> {searchData.groupName}</left></div>
                    <div className="col"><left><b>Location: </b> {searchData.estateName == undefined ? "All Locations" : searchData.estateName}</left></div>
                    <div className="col"><left><b>Sub Division: </b> {searchData.divisionName == undefined ? 'All Sub Divisions' : searchData.divisionName}</left></div>
                    <div className="col"><left><b>Pay Point: </b> {searchData.payPointName == undefined ? 'All PayPoints' : searchData.payPointName}</left></div>
                    <div className="col"><left><b>Employee Category: </b> {searchData.employeeSubCategoryName == undefined ? 'All Categories' : searchData.employeeSubCategoryName}</left></div>
                    <div className="col"><left><b>Date: </b> {(curr) == "" ? 'All' : (curr + ' - ' + sunday.format("YYYY-MM-DD"))}</left></div>
                </div>
                <br />
                <Box minWidth={1050}>
                    <TableContainer>
                        <Table aria-label="simple table" size='small'>
                            <TableHead>
                                <TableRow>
                                    <TableCell rowSpan={2} align="left" style={{ fontWeight: "bold", border: "1px solid black", width: "180px", padding: '3px' }}> Code </TableCell>
                                    <TableCell rowSpan={2} align="left" style={{ fontWeight: "bold", border: "1px solid black", width: "150px", padding: '3px' }}> Ration Card </TableCell>
                                    <TableCell rowSpan={2} align="left" style={{ fontWeight: "bold", border: "1px solid black", width: "280px", padding: '3px' }}> Employee Name </TableCell>
                                    <TableCell rowSpan={2} align="right" style={{ fontWeight: "bold", border: "1px solid black", padding: '3px' }}> Khetland </TableCell>
                                    <TableCell rowSpan={2} align="right" style={{ fontWeight: "bold", border: "1px solid black", width: "120px", padding: '3px' }}> Workers </TableCell>
                                    <TableCell colSpan={2} align="center" style={{ fontWeight: "bold", border: "1px solid black", padding: '3px' }}> Dependants</TableCell>
                                    <TableCell rowSpan={2} align="right" style={{ fontWeight: "bold", border: "1px solid black", padding: '3px' }}> Gross </TableCell>
                                    <TableCell rowSpan={2} align="right" style={{ fontWeight: "bold", border: "1px solid black", padding: '3px' }}> Deduction </TableCell>
                                    <TableCell rowSpan={2} align="right" style={{ fontWeight: "bold", border: "1px solid black", padding: '3px' }}> Net </TableCell>
                                    <TableCell rowSpan={2} align="right" style={{ fontWeight: "bold", border: "1px solid black", padding: '3px' }}> Value </TableCell>
                                    <TableCell rowSpan={2} align="left" style={{ fontWeight: "bold", border: "1px solid black", padding: '3px' }}> Signature </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell align="right" style={{ fontSize: "12px", fontWeight: "bold", border: "1px solid black", width: "150px", padding: '3px' }}> Age 0 - 8 </TableCell>
                                    <TableCell align="right" style={{ fontSize: "12px", fontWeight: "bold", border: "1px solid black", width: "150px", padding: '3px' }}> Age Above 8+ </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rationDetailsData.map((group, i) => {
                                    let TtotalArea = 0;
                                    let TtotalNoofWorkers = 0;
                                    let TtotalnoofUnder8Dependent = 0;
                                    let Ttotalnoof8to12Dependent = 0;
                                    let TtotalofTotalEntitileQuntity = 0;
                                    let TtotaldeductionAmount = 0;
                                    let TtotalnetEntitlement = 0;
                                    let TtotalValue = 0;
                                    return (
                                        <React.Fragment key={i}>
                                            <TableRow>
                                                <TableCell colSpan={14} component="th" scope="row" align="left" style={{ border: "1px dashed black", fontWeight: 'bolder', color: 'red', padding: '3px' }}>
                                                    {'Outgarden:  ' + group.divisionName}<br />
                                                    {'Category: ' + group.employeeSubCategoryName}
                                                </TableCell>
                                            </TableRow>
                                            {group.details.map((grp, j) => {
                                                let totalArea = 0;
                                                let totalNoofWorkers = 0;
                                                let totalnoofUnder8Dependent = 0;
                                                let totalnoof8to12Dependent = 0;
                                                let totalofTotalEntitileQuntity = 0;
                                                let totaldeductionAmount = 0;
                                                let totalnetEntitlement = 0;
                                                let totalValue = 0;
                                                return (
                                                    <React.Fragment key={j}>
                                                        <TableRow>
                                                            <TableCell colSpan={14} component="th" scope="row" align="left" style={{ border: "1px dashed black", fontWeight: 'bolder', padding: '3px' }}>{'PayPoint:  ' + grp.payPointName}</TableCell>
                                                        </TableRow>
                                                        {grp.detailsx.map((detail, k) => {
                                                            totalArea += parseFloat(detail.area);
                                                            totalNoofWorkers += parseFloat(detail.noofWorkers);
                                                            totalnoofUnder8Dependent += parseFloat(detail.noofUnder8Dependent);
                                                            totalnoof8to12Dependent += parseFloat(detail.noof8to12Dependent);
                                                            totalofTotalEntitileQuntity += parseFloat(detail.totalEntitileQuntity);
                                                            totaldeductionAmount += parseFloat(detail.deductionAmount);
                                                            totalnetEntitlement += parseFloat(detail.netEntitlement);
                                                            totalValue += parseFloat(detail.value);
                                                            TtotalArea += parseFloat(detail.area);
                                                            TtotalNoofWorkers += parseFloat(detail.noofWorkers);
                                                            TtotalnoofUnder8Dependent += parseFloat(detail.noofUnder8Dependent);
                                                            Ttotalnoof8to12Dependent += parseFloat(detail.noof8to12Dependent);
                                                            TtotalofTotalEntitileQuntity += parseFloat(detail.totalEntitileQuntity);
                                                            TtotaldeductionAmount += parseFloat(detail.deductionAmount);
                                                            TtotalnetEntitlement += parseFloat(detail.netEntitlement);
                                                            TtotalValue += parseFloat(detail.value);
                                                            return (
                                                                <TableRow key={`${i}-${j}-${k}`}>
                                                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px dashed black", padding: '3px' }}>{detail.registrationNumber}</TableCell>
                                                                    <TableCell align="left" style={{ border: "1px dashed black", padding: '3px' }}>{(detail.employeeRationCard)}</TableCell>
                                                                    <TableCell align="left" style={{ border: "1px dashed black", padding: '3px' }}>{(detail.firstName)}</TableCell>
                                                                    <TableCell align="right" style={{ border: "1px dashed black", padding: '3px' }}>{parseFloat(detail.area).toFixed(3)}</TableCell>
                                                                    <TableCell align="right" style={{ border: "1px dashed black", padding: '3px' }}>{(detail.noofWorkers)}</TableCell>
                                                                    <TableCell align="right" style={{ border: "1px dashed black", padding: '3px' }}>{(detail.noofUnder8Dependent)}</TableCell>
                                                                    <TableCell align="right" style={{ border: "1px dashed black", padding: '3px' }}>{(detail.noof8to12Dependent)}</TableCell>
                                                                    <TableCell align="right" style={{ border: "1px dashed black", padding: '3px' }}>{parseFloat(detail.totalEntitileQuntity).toFixed(3)}</TableCell>
                                                                    <TableCell align="right" style={{ border: "1px dashed black", padding: '3px' }}>{parseFloat(detail.deductionAmount).toFixed(3)}</TableCell>
                                                                    <TableCell align="right" style={{ border: "1px dashed black", padding: '3px' }}>{parseFloat(detail.netEntitlement).toFixed(3)}</TableCell>
                                                                    <TableCell align="right" style={{ border: "1px dashed black", padding: '3px' }}>{parseFloat(detail.value).toFixed(3)}</TableCell>
                                                                    <TableCell align="right" style={{ border: "1px dashed black", padding: '3px' }}>{ }</TableCell>
                                                                </TableRow>
                                                            );
                                                        })}
                                                        <TableRow>
                                                            <TableCell align="left" colSpan={3} style={{ border: "1px dashed black", fontWeight: "bold", fontStyle: "italic", padding: '3px' }}>Total</TableCell>
                                                            <TableCell align="right" style={{ border: "1px dashed black", fontWeight: "bold", padding: '3px' }}>{parseFloat(totalArea).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</TableCell>
                                                            <TableCell align="right" style={{ border: "1px dashed black", fontWeight: "bold", padding: '3px' }}>{(totalNoofWorkers)}</TableCell>
                                                            <TableCell align="right" style={{ border: "1px dashed black", fontWeight: "bold", padding: '3px' }}>{(totalnoofUnder8Dependent)}</TableCell>
                                                            <TableCell align="right" style={{ border: "1px dashed black", fontWeight: "bold", padding: '3px' }}>{(totalnoof8to12Dependent)}</TableCell>
                                                            <TableCell align="right" style={{ border: "1px dashed black", fontWeight: "bold", padding: '3px' }}>{parseFloat(totalofTotalEntitileQuntity).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</TableCell>
                                                            <TableCell align="right" style={{ border: "1px dashed black", fontWeight: "bold", padding: '3px' }}>{parseFloat(totaldeductionAmount).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</TableCell>
                                                            <TableCell align="right" style={{ border: "1px dashed black", fontWeight: "bold", padding: '3px' }}>{parseFloat(totalnetEntitlement).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</TableCell>
                                                            <TableCell align="right" style={{ border: "1px dashed black", fontWeight: "bold", padding: '3px' }}>{parseFloat(totalValue).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</TableCell>
                                                            <TableCell align="right" style={{ border: "1px dashed black", fontWeight: "bold", padding: '3px' }}>{ }</TableCell>
                                                        </TableRow>
                                                    </React.Fragment>
                                                );
                                            })}
                                            <TableRow>
                                                <TableCell align="left" colSpan={3} style={{ border: "1px dashed black", fontWeight: "bold", fontStyle: "italic", padding: '3px' }}>Total</TableCell>
                                                <TableCell align="right" style={{ border: "1px dashed black", fontWeight: "bold", padding: '3px' }}>{parseFloat(TtotalArea).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</TableCell>
                                                <TableCell align="right" style={{ border: "1px dashed black", fontWeight: "bold", padding: '3px' }}>{(TtotalNoofWorkers)}</TableCell>
                                                <TableCell align="right" style={{ border: "1px dashed black", fontWeight: "bold", padding: '3px' }}>{(TtotalnoofUnder8Dependent)}</TableCell>
                                                <TableCell align="right" style={{ border: "1px dashed black", fontWeight: "bold", padding: '3px' }}>{(Ttotalnoof8to12Dependent)}</TableCell>
                                                <TableCell align="right" style={{ border: "1px dashed black", fontWeight: "bold", padding: '3px' }}>{parseFloat(TtotalofTotalEntitileQuntity).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</TableCell>
                                                <TableCell align="right" style={{ border: "1px dashed black", fontWeight: "bold", padding: '3px' }}>{parseFloat(TtotaldeductionAmount).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</TableCell>
                                                <TableCell align="right" style={{ border: "1px dashed black", fontWeight: "bold", padding: '3px' }}>{parseFloat(TtotalnetEntitlement).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</TableCell>
                                                <TableCell align="right" style={{ border: "1px dashed black", fontWeight: "bold", padding: '3px' }}>{parseFloat(TtotalValue).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</TableCell>
                                                <TableCell align="right" style={{ border: "1px dashed black", fontWeight: "bold", padding: '3px' }}>{ }</TableCell>
                                            </TableRow>
                                        </React.Fragment>
                                    );
                                })}
                                <TableRow>
                                    <TableCell align="left" colSpan={3} style={{ border: "1px dashed black", fontWeight: "bold", fontStyle: "italic", padding: '3px' }}>Grand Total</TableCell>
                                    <TableCell align="right" style={{ border: "1px dashed black", fontWeight: "bold", padding: '3px' }}>{parseFloat(totalValues.totalArea).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</TableCell>
                                    <TableCell align="right" style={{ border: "1px dashed black", fontWeight: "bold", padding: '3px' }}>{(totalValues.totalNoofWorkers)}</TableCell>
                                    <TableCell align="right" style={{ border: "1px dashed black", fontWeight: "bold", padding: '3px' }}>{(totalValues.totalnoofUnder8Dependent)}</TableCell>
                                    <TableCell align="right" style={{ border: "1px dashed black", fontWeight: "bold", padding: '3px' }}>{(totalValues.totalnoof8to12Dependent)}</TableCell>
                                    <TableCell align="right" style={{ border: "1px dashed black", fontWeight: "bold", padding: '3px' }}>{parseFloat(totalValues.totalofTotalEntitileQuntity).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</TableCell>
                                    <TableCell align="right" style={{ border: "1px dashed black", fontWeight: "bold", padding: '3px' }}>{parseFloat(totalValues.totaldeductionAmount).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</TableCell>
                                    <TableCell align="right" style={{ border: "1px dashed black", fontWeight: "bold", padding: '3px' }}>{parseFloat(totalValues.totalnetEntitlement).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</TableCell>
                                    <TableCell align="right" style={{ border: "1px dashed black", fontWeight: "bold", padding: '3px' }}>{parseFloat(totalValues.totalValue).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</TableCell>
                                    <TableCell align="right" style={{ border: "1px dashed black", fontWeight: "bold", padding: '3px' }}>{ }</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </div>
        );
    }
}