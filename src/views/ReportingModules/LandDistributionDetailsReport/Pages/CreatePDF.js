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
        const groupComplex = this.props.groupComplex;
        const groups = this.props.groups;

        return (
            <div>
                <style>
                    {`
            @page {
              margin: 0.75in;
            }
          `}
                </style>
                <h3><left><u>LAND DISTRIBUTION </u></left></h3>
                <br />
                <br />
                <Box minWidth={1050} style={{ margin: 'auto', textAlign: 'center' }}>
                    <TableContainer style={{ maxWidth: 'calc(100% - 1.5in)' }}>
                        <Table aria-label="simple table" size='small'>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}> Particulars </TableCell>
                                    <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black", width: "100px" }}> Priority </TableCell>
                                    {groups.map((group, i) => (
                                        <TableCell key={i} align="right" style={{ fontWeight: 'bold', border: "1px solid black" }}>
                                            {group === "The Consolidated Tea and Lands Company (Bangladesh) Limited" ? "Consol"
                                                : group === "Baraoora (Sylhet) Tea Company Limited" ? "Baraoora"
                                                    : group}
                                        </TableCell>
                                    ))}
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", width: "120px", fontStyle: 'italic' }}> Total </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {groupComplex.map((row, rowIndex) => {
                                    const distinctDetails = row.details.reduce((acc, detail) => {
                                        if (!acc.find(d => d.landDescription === detail.landDescription)) {
                                            acc.push(detail);
                                        }
                                        return acc;
                                    }, []);

                                    return (
                                        distinctDetails.map((rows, i) => {
                                            const rowTotalArea = groups.reduce((acc, grp) => {
                                                const groupRow = row.details.find(r => r.masterGroupName === grp && r.landDescription === rows.landDescription);
                                                return acc + (groupRow ? groupRow.area : 0);
                                            }, 0);
                                            return (
                                                <TableRow key={`${rowIndex}-${i}`}>
                                                    <TableCell align="left" style={{ border: "1px solid black" }}>{rows.landDescription}</TableCell>
                                                    <TableCell align="right" style={{ border: "1px solid black" }}>{rows.printPriority}</TableCell>
                                                    {groups.map((group, groupIndex) => {
                                                        const groupRow = row.details.find(r => r.masterGroupName === group && r.landDescription === rows.landDescription);
                                                        return (
                                                            <React.Fragment key={groupIndex}>
                                                                <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold" }}>
                                                                    {groupRow ? (groupRow.area).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                                                                </TableCell>
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                    <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold", color: 'green' }}>
                                                        {rowTotalArea.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    );
                                })}
                                <TableRow>
                                    <TableCell colSpan={2} align="left" style={{ fontWeight: "bold", border: "1px solid black", color: 'navy', fontStyle: 'italic' }}> Total </TableCell>
                                    {groups.map((group, groupIndex) => {
                                        const groupTotalArea = groupComplex.reduce((acc, row) => {
                                            const groupRow = row.details.find(r => r.masterGroupName === group);
                                            return acc + (groupRow ? groupRow.area : 0);
                                        }, 0);
                                        return (
                                            <TableCell key={groupIndex} align="right" style={{ border: "1px solid black", fontWeight: "bold", color: 'blue' }}>
                                                {groupTotalArea.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                        );
                                    })}
                                    <TableCell align="right" style={{ border: "1px solid black", fontWeight: "bold", color: 'red' }}>
                                        {groupComplex.reduce((acc, row) => {
                                            return acc + groups.reduce((grpAcc, grp) => {
                                                const groupRow = row.details.find(r => r.masterGroupName === grp);
                                                return grpAcc + (groupRow ? groupRow.area : 0);
                                            }, 0);
                                        }, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </div>
        );
    }
}