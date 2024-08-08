import React, { Fragment, useState } from "react";
import MaterialTable from "material-table";
import { TextField } from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import tokenDecoder from '../../../utils/tokenDecoder';
import services from '../Services';
import { useAlert } from "react-alert";

export default function EditableTable({task,fields,data,setData}) {
  const alert = useAlert();
  async function DeletePluckingData(deletedItem){
    const deleted = deletedItem[0]
    let convertedData = {
      Date : deleted.date,
      EmployeeID : parseInt(deleted.employeeID),
      EmployeeName : deleted.employeeName,
      EmployeeTypeID : parseInt(deleted.employeeTypeID),
      FieldID : parseInt(deleted.fieldID),
      Quantity : parseFloat(deleted.quantity),
      SessionID :deleted.sessionID,
      TaskID : parseInt(deleted.taskID),
      MobileSubSessionID : deleted.mobileSubSessionID,
      GangId : parseInt(deleted.gangId),
      RegistrationNumber : deleted.registrationNumber,
      ModifiedBy : parseInt(tokenDecoder.getUserIDFromToken()),
    }
    
    const result = await services.DeletePluckingAmendmentData(convertedData)
    if (result.statusCode == "Success") {
        alert.success(result.message);
    }          
    else {
        alert.error(result.message);
    }
  }

  const tableColumns = [
    { title: "Session", field: "sessionID",editable: 'never' },
    { title: "Emp. Name", field: "employeeName",editable: 'never' },
    {
      title: "Task",
      field: "taskID",
      render: rowData => task[rowData.taskID],
      editComponent: ({ value, onChange }) => (
        <TextField select
            id="taskID"
            variant="outlined"
            size='small'
            value={value}
            label="Task"
            onChange={(e) => onChange(e.target.value)}
            >
            <MenuItem value={value}>
                {task[value]}
            </MenuItem>
            {Object.entries(task).map(
            ([key, item]) =>
              key != value && (
                <MenuItem key={key} value={key}>{item}</MenuItem>
              )
            )}
        </TextField>
      )
    },
     {
      title: "Field",
      field: "fieldID",
      render: rowData => fields[rowData.fieldID],
      editComponent: ({ value, onChange }) => (
        <TextField select
            id="fieldID"
            variant="outlined"
            size='small'
            value={value}
            label="Field"
            onChange={(e) => onChange(e.target.value)}
            >
            <MenuItem value={value}>
                {fields[value]}
            </MenuItem>
            {Object.entries(fields).map(
            ([key, item]) =>
              key != value && (
                <MenuItem key={key} value={key}>{item}</MenuItem>
              )
            )}
        </TextField>
      )
    },
    {
      title: "Quantity",
      field: "quantity",
      editComponent:({value,onChange})=>(
        <TextField
          fullWidth
          size='small'
          name="quantity"
          onChange={(e) => onChange(e.target.value)}
          value={value}
          variant="outlined"
          id="quantity"
          type="number"
          InputProps={{
              inputProps: {
                  step: 1,
                  type: 'number',
                  min: 0
              }
          }}
        >
        </TextField>
      )
    },
  ];

  return (
    <Fragment>
      <MaterialTable
        columns={tableColumns}
        data={data}
        options={{ search: false, actionsColumnIndex: -1, showTitle: false}}
        editable={{
          onRowUpdate: (newData, oldData) =>
            new Promise((resolve, reject) => {
              setTimeout(() => {
                const dataUpdate = [...data];
                const index = oldData.tableData.id;
                dataUpdate[index] = newData;
                setData([...dataUpdate]);
                resolve();
              }, 1000);
            }),
          onRowDelete: (oldData) =>
            new Promise((resolve, reject) => {
              setTimeout(() => {
                const dataDelete = [...data];
                const index = oldData.tableData.id;
                const deleted = dataDelete.splice(index, 1);
                setData([...dataDelete]);
                DeletePluckingData(deleted)
                resolve();
              }, 1000);
            })
        }}
      />
    </Fragment>
  );
}
