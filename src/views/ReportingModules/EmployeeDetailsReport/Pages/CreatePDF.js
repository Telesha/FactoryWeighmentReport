import React from "react";
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
    const searchData = this.props.searchData;
    const employeeData = this.props.employeeData;

    const employeeDataBySubCategory = {};

    employeeData.forEach((item) => {
      if (!employeeDataBySubCategory[item.employeeSubCategoryName]) {
        employeeDataBySubCategory[item.employeeSubCategoryName] = [];
      }
      employeeDataBySubCategory[item.employeeSubCategoryName].push(item);
    });

    return (
      <div>
        <style>
          {`
            @page {
              size: A4 portrait;
              margin: 1in;
            }
          `}
        </style>
        <h2><u>Employee Master</u></h2>
        <br></br>
        <div className="row pl-2 pb-4 pt-4">
          <div className="col"><b>Business Division : </b>{searchData.groupName}</div>
          <div className="col"><b>Location : </b>{searchData.gardenName}</div>
          <div className="col"><b>Sub-Division : </b>{searchData.costCenterName == undefined ? "All Sub Divisions" : searchData.costCenterName}</div>
          <div className="col"><b>Pay Point : </b>{searchData.payPointID == undefined ? "All Pay Points" : searchData.payPointID}</div>
          <div className="col"><b>Employee Category : </b>{searchData.employeeSubCategory === undefined ? "All Employee Sub Categories" : searchData.employeeSubCategory}</div>
        </div>
        <br></br>
        <br></br>
        <Box minWidth={1000}>
          <TableContainer style={{ maxWidth: 'calc(100% - 1in)' }}>
            <Table size="small" aria-label="caption table">
              <TableHead>
                <TableRow>
                  <TableCell style={{ border: "1px dotted black", padding: '3px' }} align={'left'}>Sub-Division</TableCell>
                  <TableCell style={{ border: "1px dotted black", padding: '3px' }} align={'left'}>Reg. No</TableCell>
                  <TableCell style={{ border: "1px dotted black", padding: '3px' }} align={'left'}>Emp.Code</TableCell>
                  <TableCell style={{ border: "1px dotted black", padding: '3px' }} align={'left'}>PF No</TableCell>
                  <TableCell style={{ border: "1px dotted black", padding: '3px' }} align={'left'}>Emp.Name</TableCell>
                  <TableCell style={{ border: "1px dotted black", padding: '3px' }} align={'left'}>NIC/BIR</TableCell>
                  <TableCell style={{ border: "1px dotted black", padding: '3px' }} align={'left'}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody style={{ border: "1px solid black" }}>
                {Object.keys(employeeDataBySubCategory).map((category, index) => (
                  <>
                    <TableRow key={index}>
                      <TableCell colSpan={2} style={{ border: "1px dashed black", backgroundColor: "#f0f0f0", padding: '3px' }}>
                        <b>{category}</b>
                      </TableCell>
                      <TableCell colSpan={10} style={{ border: "1px dashed black", backgroundColor: "#f0f0f0", padding: '3px' }}>
                        <b>Employee Count : {employeeDataBySubCategory[category].length} </b>
                      </TableCell>
                    </TableRow>
                    {employeeDataBySubCategory[category].map((data, dataIndex) => (
                      <TableRow key={dataIndex}>
                        <TableCell align={'left'} style={{ borderBottom: "none", border: "1px dashed black", padding: '3px' }}>
                          {data.divisionName}
                        </TableCell>
                        <TableCell align={'left'} style={{ borderBottom: "none", border: "1px dashed black", padding: '3px' }}>
                          {data.registrationNumber}
                        </TableCell>
                        <TableCell align={'left'} style={{ borderBottom: "none", border: "1px dashed black", padding: '3px' }}>
                          {data.employeeCode}
                        </TableCell>
                        <TableCell align={'left'} style={{ borderBottom: "none", border: "1px dashed black", padding: '3px' }}>
                          {data.epfNumber == null ? '-' : data.epfNumber}
                        </TableCell>
                        <TableCell align={'left'} style={{ borderBottom: "none", border: "1px dashed black", padding: '3px' }}>
                          {data.employeeName}
                        </TableCell>
                        <TableCell align={'left'} style={{ borderBottom: "none", border: "1px dashed black", padding: '3px' }}>
                          {data.nicNumber}
                        </TableCell>
                        <TableCell align={'left'} style={{ borderBottom: "none", border: "1px dashed black", padding: '3px' }}>
                          {data.isActive == true ? 'Active' : 'Inactive'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </div>
    );

  }

}
