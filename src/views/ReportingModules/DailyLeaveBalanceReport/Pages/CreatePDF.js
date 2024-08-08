import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import moment from 'moment';
export default class ComponentToPrint extends React.Component {
  render() {
    const searchData = this.props.searchData;
    const leavebalanceData = this.props.leavebalanceData;
    const getEntitlement = this.props.getEntitlement;
    const getAvailed = this.props.getAvailed;
    const getBalance = this.props.getBalance;

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

        <h2>
          <left>
            <u>Leave Balance</u>
          </left>
        </h2>
        <br />
        <div className="row pl-2 pb-4 pt-4">
          <div className="col">
            <left>
              <b>Business Division: </b>{' '}
              {searchData.groupName}
            </left>
          </div>
          <div className="col">
            <left>
              <b>Location: </b>{' '}
              {searchData.estateName === undefined
                ? 'All'
                : searchData.estateName}
            </left>
          </div>
          <div className="col">
            <left>
              <b>Sub-Division: </b>{' '}
              {searchData.divisionName === undefined
                ? 'All'
                : searchData.divisionName}
            </left>
          </div>
          <div className="col">
            <left>
              <b>Pay Point : </b>
              {searchData.payPointName == undefined
                ? "All"
                : searchData.payPointName}
            </left>
          </div>
          <div className="col">
            <left>
              <b>Category: </b>{' '}
              {searchData.employeeSubCategoryMappingName === undefined
                ? 'All'
                : searchData.employeeSubCategoryMappingName}
            </left>
          </div>
          <div className="col">
            <left>
              <b>Date : </b> 
              {moment(searchData.fromDate).format('YYYY-MM-DD') + ' - ' + moment(searchData.toDate).format('YYYY-MM-DD')}
            </left>
          </div>

        </div>
        <br />
        <TableContainer >
          <Table aria-label="simple table" size='small'>
            <TableHead>
              <TableRow>
                <TableCell rowSpan={2} align="left" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>Emp.ID</TableCell>
                <TableCell rowSpan={2} align="left" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>Emp.Name</TableCell>
                <TableCell rowSpan={2} align="left" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>Pay Point</TableCell>
                <TableCell rowSpan={2} align="left" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>Joining Date</TableCell>
                <TableCell colSpan={3} align="center" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>Annual Leave</TableCell>
                <TableCell colSpan={3} align="center" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>Sick Leave</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="right" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>Entitle</TableCell>
                <TableCell align="right" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>Availed</TableCell>
                <TableCell align="right" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>Balance</TableCell>
                <TableCell align="right" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>Entitle</TableCell>
                <TableCell align="right" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>Availed</TableCell>
                <TableCell align="right" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>Balance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody style={{ border: '1px solid black' }}>
              {leavebalanceData.map((group, i) => (
                <TableRow key={i}>
                  <TableCell align="left" style={{ fontSize: '10px', border: '1px dashed black', padding: '3px' }}>{group.employeeID}</TableCell>
                  <TableCell align="left" style={{ fontSize: '10px', border: '1px dashed black', padding: '3px' }}>{group.firstName}</TableCell>
                  <TableCell align="left" style={{ fontSize: '10px', border: '1px dashed black', padding: '3px' }}>{group.payPointName}</TableCell>
                  <TableCell align="left" style={{ fontSize: '10px', border: '1px dashed black', padding: '3px' }}>{group.joiningDate == null ? '-' : moment(group.joiningDate).format('YYYY-MM-DD')}</TableCell>
                  <TableCell align="right" style={{ fontSize: '10px', border: '1px dashed black', padding: '3px' }}>{getEntitlement(group.details, 'AL')}</TableCell>
                  <TableCell align="right" style={{ fontSize: '10px', border: '1px dashed black', padding: '3px' }}>{getAvailed(group.details, 'AL')}</TableCell>
                  <TableCell align="right" style={{ fontSize: '10px', border: '1px dashed black', padding: '3px' }}>{getBalance(group.details, 'AL')}</TableCell>
                  <TableCell align="right" style={{ fontSize: '10px', border: '1px dashed black', padding: '3px' }}>{getEntitlement(group.details, 'SL')}</TableCell>
                  <TableCell align="right" style={{ fontSize: '10px', border: '1px dashed black', padding: '3px' }}>{getAvailed(group.details, 'SL')}</TableCell>
                  <TableCell align="right" style={{ fontSize: '10px', border: '1px dashed black', padding: '3px' }}>{getBalance(group.details, 'SL')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    );
  }
}
