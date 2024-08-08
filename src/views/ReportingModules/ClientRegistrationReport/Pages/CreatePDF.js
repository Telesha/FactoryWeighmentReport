import React from "react";
import {
  Box, Card, Grid, TextField, Container,  CardContent, Divider, InputLabel, CardHeader,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Table,
  TableFooter
} from '@material-ui/core';


export default class ComponentToPrint extends React.Component {

  render() {
    const clientDetailListData = this.props.clientDetailListData;
    const selectedSearchValues = this.props.selectedSearchValues;


    return (
      <div>
        <h4><center><u>Client Registration Details Report</u></center></h4>
        <div>&nbsp;</div>
        <h4><center>{selectedSearchValues.groupName} - {selectedSearchValues.factoryName}</center></h4>
        <div>&nbsp;</div>
        <div>
          <Box minWidth={1050}>
            <TableContainer style={{ marginLeft:'5px' }}>
              <Table aria-label="caption table">
                <TableHead>
                  <TableRow>
                    <TableCell align={'center'}>Route Name</TableCell>
                    <TableCell align={'center'}>Reg No</TableCell>
                    <TableCell align={'center'}>Name</TableCell>
                    <TableCell align={'center'}>NIC</TableCell>
                    <TableCell align={'center'}>Contact No</TableCell>
                    <TableCell align={'center'}>Address</TableCell>
                    
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clientDetailListData.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.routeName}
                      </TableCell>
                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.registrationNumber}
                      </TableCell>
                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.name}
                      </TableCell>
                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.nic}
                      </TableCell>
                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.mobile}
                      </TableCell>
                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.address}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </div>
        <div>&nbsp;</div>
        <h4><center>*******End of List*******</center></h4>
      </div>
    );

  }

}
