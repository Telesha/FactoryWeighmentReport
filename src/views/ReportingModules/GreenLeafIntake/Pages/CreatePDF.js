import React from "react";
import {
    Box,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Table,
    Typography
} from '@material-ui/core';

export default class ComponentToPrint extends React.Component {
    render() {
        const routeSummaryData = this.props.routeSummaryData;
        const searchData = this.props.searchData;
        const yeraValues = this.props.yeraValues;
        const mainTotalValues = this.props.mainTotalValues;
        const currentTotalValues = this.props.currentTotalValues;
        const currentSectionData = this.props.currentSectionData;
        const previousTotalValues = this.props.previousTotalValues;
        const previousSectionData = this.props.previousSectionData;
        return (
            <div>

                <h2><center><u>Green Leaf Intake Report</u></center></h2>
                <div>&nbsp;</div>
                <h2><center>Legal Entity : {searchData.groupName} - Garden :{searchData.gardenName}</center></h2>
                <div>&nbsp;</div>
                <h2><center> {searchData.costCenterName == undefined ? 'All Cost Centers ' : 'Cost Center : ' + searchData.costCenterName + ' '}
                    -  {searchData.fieldName == undefined ? 'All Sections ' : 'Section : ' + searchData.costCenterName}</center></h2>
                <div>&nbsp;</div>
                <h3><center>{searchData.froDate} - {searchData.tDate} </center></h3>
                <div>
                    <Box minWidth={1050}>
                        <TableContainer>
                            <Table aria-label="caption table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align={'left'}>Gardens</TableCell>
                                        <TableCell align={'right'}>{yeraValues.currentYear}</TableCell>
                                        <TableCell align={'right'}>{yeraValues.previousYear}</TableCell>
                                        <TableCell align={'center'}>Good leaf (Average)</TableCell>
                                        <TableCell align={'right'}>YTD/{yeraValues.copyCurrentYear}</TableCell>
                                        <TableCell align={'right'}>YTD/{yeraValues.copyPreviousYear}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {routeSummaryData.map((data, index) => (
                                        <TableRow key={index}>
                                            <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.currentFactoryName == null ? data.previousFactoryName : data.currentFactoryName}
                                            </TableCell>
                                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {parseFloat(data.currentTotalAmount).toFixed(2)}
                                            </TableCell>
                                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {parseFloat(data.previousTotalAmount).toFixed(2)}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                -
                                            </TableCell>
                                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {parseFloat(data.currentYTDTotalAmount).toFixed(2)}
                                            </TableCell>
                                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {parseFloat(data.previousYTDTotalAmount).toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableRow>
                                    <TableCell align={'center'}><b>Total</b></TableCell>
                                    <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {parseFloat(mainTotalValues.totalCurrentTotalAmount).toFixed(2)} </b>
                                    </TableCell>
                                    <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {parseFloat(mainTotalValues.totalPreviousTotalAmount).toFixed(2)} </b>
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> - </b>
                                    </TableCell>
                                    <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {parseFloat(mainTotalValues.totalCurrentYTDTotalAmount).toFixed(2)} </b>
                                    </TableCell>
                                    <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {parseFloat(mainTotalValues.totalPreviousYTDTotalAmount).toFixed(2)} </b>
                                    </TableCell>
                                </TableRow>
                            </Table>
                        </TableContainer>
                    </Box>
                    <center>
                        <Typography style={{ marginTop: '20px' }} variant="h4" gutterBottom>
                            Section based Plucking Report
                        </Typography>
                        <Typography style={{ marginTop: '15px' }} variant="h5" gutterBottom>
                            {yeraValues.currentYear}
                        </Typography>
                    </center>
                    <Box minWidth={1050}>
                        <TableContainer>
                            <Table aria-label="caption table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align={'left'}>Garden</TableCell>
                                        <TableCell align={'left'}>Sec No</TableCell>
                                        <TableCell align={'right'}>Plucked Area (Ha.)</TableCell>
                                        <TableCell align={'right'}>Green leaf plucked in Kg</TableCell>
                                        <TableCell align={'right'}>Mendays</TableCell>
                                    </TableRow>
                                </TableHead>
                                {currentSectionData.length > 0 ?
                                    <>
                                        <TableBody>
                                            {currentSectionData.map((data, index) => (
                                                <TableRow key={index}>
                                                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                        {data.factoryName}
                                                    </TableCell>
                                                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                        {data.fieldName}
                                                    </TableCell>
                                                    <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                        {parseFloat(data.coveredArea).toFixed(2)}
                                                    </TableCell>
                                                    <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                        {parseFloat(data.totalAmount).toFixed(2)}
                                                    </TableCell>
                                                    <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                        {parseInt(data.employeeCount)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                        <TableRow>
                                            <TableCell align={'center'}><b>Total</b></TableCell>
                                            <TableCell ></TableCell>
                                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                <b> {parseFloat(currentTotalValues.totalCoveredArea).toFixed(2)} </b>
                                            </TableCell>
                                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                <b> {parseFloat(currentTotalValues.totalTotalAmount).toFixed(2)} </b>
                                            </TableCell>
                                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                <b> {parseInt(currentTotalValues.totalEmployeeCount)} </b>
                                            </TableCell>
                                        </TableRow>
                                    </> :
                                    <>
                                        <TableRow>
                                            <TableCell colSpan={5} align={'center'}>
                                                <center>
                                                    <Typography style={{ marginTop: '15px', marginBottom: '15px' }} variant="h5" >
                                                        No Current Year Details
                                                    </Typography>
                                                </center>
                                            </TableCell>
                                        </TableRow>
                                    </>}
                            </Table>
                        </TableContainer>
                    </Box>
                    <center>
                        <Typography style={{ marginTop: '15px', marginBottom: '15px' }} variant="h5" gutterBottom>
                            {yeraValues.previousYear}
                        </Typography>
                    </center>
                    <Box minWidth={1050}>
                        <TableContainer>
                            <Table aria-label="caption table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align={'left'}>Garden</TableCell>
                                        <TableCell align={'left'}>Sec No</TableCell>
                                        <TableCell align={'right'}>Plucked Area (Ha.)</TableCell>
                                        <TableCell align={'right'}>Green leaf plucked in Kg</TableCell>
                                        <TableCell align={'right'}>Mendays</TableCell>
                                    </TableRow>
                                </TableHead>
                                {previousSectionData.length > 0 ?
                                    <>
                                        <TableBody>
                                            {previousSectionData.map((data, index) => (
                                                <TableRow key={index}>
                                                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                        {data.factoryName}
                                                    </TableCell>
                                                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                        {data.fieldName}
                                                    </TableCell>
                                                    <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                        {parseFloat(data.coveredArea).toFixed(2)}
                                                    </TableCell>
                                                    <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                        {parseFloat(data.totalAmount).toFixed(2)}
                                                    </TableCell>
                                                    <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                        {parseInt(data.employeeCount)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                        <TableRow>
                                            <TableCell align={'center'}><b>Total</b></TableCell>
                                            <TableCell ></TableCell>
                                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                <b> {parseFloat(previousTotalValues.totalCoveredArea).toFixed(2)} </b>
                                            </TableCell>
                                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                <b> {parseFloat(previousTotalValues.totalTotalAmount).toFixed(2)} </b>
                                            </TableCell>
                                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                <b> {parseInt(previousTotalValues.totalEmployeeCount)} </b>
                                            </TableCell>
                                        </TableRow>
                                    </> :
                                    <>
                                        <TableRow>
                                            <TableCell colSpan={5} align={'center'}>
                                                <center>
                                                    <Typography style={{ marginTop: '15px', marginBottom: '15px' }} variant="h5" >
                                                        No Previous Year Details
                                                    </Typography>
                                                </center>
                                            </TableCell>
                                        </TableRow>
                                    </>}
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