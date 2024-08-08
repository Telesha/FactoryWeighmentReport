import React from "react";
import tokenService from '../../../../utils/tokenDecoder';
import {
    Box,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Table
} from '@material-ui/core';

export default class ComponentToPrint extends React.Component {
    render() {

        const LeafRouteDetails = this.props.LeafRouteDetails;
        const LeafweightTotal = this.props.LeafweightTotal;
        const SearchData = this.props.SearchData;
        const GreenLeafInput = this.props.GreenLeafInput;
        const AllTotal = this.props.AllTotal;

        return (
            <div>

                <h2><center><u>Green Leaf Route Details Report</u></center></h2>
                <div>&nbsp;</div>
                <h2><center>{SearchData.groupName} - {SearchData.factoryName}</center></h2>
                <div>&nbsp;</div>
                <h2><center>{GreenLeafInput.year}</center></h2>
                <div>
                <Box minWidth={1500}>
                        <TableContainer >
                            <Table aria-label="caption table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align={'center'}>Route Name</TableCell>
                                        <TableCell align={'center'}>January</TableCell>
                                        <TableCell align={'center'}>February</TableCell>
                                        <TableCell align={'center'}>March</TableCell>
                                        <TableCell align={'center'}>April</TableCell>
                                        <TableCell align={'center'}>May</TableCell>
                                        <TableCell align={'center'}>June</TableCell>
                                        <TableCell align={'center'}>July</TableCell>
                                        <TableCell align={'center'}>August</TableCell>
                                        <TableCell align={'center'}>September</TableCell>
                                        <TableCell align={'center'}>October</TableCell>
                                        <TableCell align={'center'}>November</TableCell>
                                        <TableCell align={'center'}>December</TableCell>
                                        <TableCell align={'center'}>Total (KG)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {LeafRouteDetails.map((data, index) => (
                                        <TableRow key={index}>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.routeName}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.january.toFixed(2)}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.february.toFixed(2)}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.march.toFixed(2)}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.april.toFixed(2)}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.may.toFixed(2)}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.june.toFixed(2)}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.july.toFixed(2)}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.august.toFixed(2)}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.september.toFixed(2)}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.october.toFixed(2)}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.november.toFixed(2)}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.december.toFixed(2)}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {(data.january+data.february+data.march+data.april+data.may+data.june+
                                                 data.july+data.august+data.september+data.october+data.november+data.december).toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableRow>
                                    <TableCell align={'center'}><b>Total</b></TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {LeafweightTotal.january.toFixed(2)} </b>
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {LeafweightTotal.february.toFixed(2)} </b>
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {LeafweightTotal.march.toFixed(2)} </b>
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {LeafweightTotal.april.toFixed(2)} </b>
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {LeafweightTotal.may.toFixed(2)} </b>
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {LeafweightTotal.june.toFixed(2)} </b>
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {LeafweightTotal.july.toFixed(2)} </b>
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {LeafweightTotal.august.toFixed(2)} </b>
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {LeafweightTotal.september.toFixed(2)} </b>
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {LeafweightTotal.october.toFixed(2)} </b>
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {LeafweightTotal.november.toFixed(2)} </b>
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {LeafweightTotal.december.toFixed(2)} </b>
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {AllTotal} </b>
                                    </TableCell>
                                </TableRow>
                            </Table>
                        </TableContainer>
                    </Box>
                </div>
                <div>&nbsp;</div>
                <h3><center>***** End of List *****</center></h3>
            </div>
        );

    }

}