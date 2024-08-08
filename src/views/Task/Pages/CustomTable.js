import React, { useState, useMemo } from 'react';
import {
    MaterialReactTable,
    useMaterialReactTable,
} from 'material-react-table';
import {
    Box, IconButton, Button, Chip
} from '@material-ui/core';
import _ from 'lodash';
import EditIcon from '@material-ui/icons/Edit';
import GetAppIcon from '@material-ui/icons/GetApp';

export function CustomTable({ taskData, setTaskID, setExcel, setExcelOne, permissionList }) {
    const cloneData = _.cloneDeep(taskData)
    const data = cloneData;
    const columns = useMemo(
        () => [
            {
                accessorKey: 'taskCode',
                header: 'Task Code',
                size: 100,
            },
            {
                accessorKey: 'subTaskCode',
                header: 'Task Sub Code',
                size: 100,
            },
            {
                accessorKey: 'taskName',
                header: 'Task Name',
                size: 100,
            },
            {
                accessorKey: 'productName',
                header: 'Product',
                size: 100,
            },
            {
                accessorKey: 'estateTaskName',
                header: 'Task Category',
                size: 100,
            },
            {
                accessorKey: 'measuringUnitName',
                header: 'Measuring Unit',
                size: 100,
            },
            {
                accessorKey: 'employeeCategoryName',
                header: 'Employee Category',
                size: 100,
            }
        ],
        [],
    );

    const table = useMaterialReactTable({
        columns,
        data
    });

    function handleClickEditOne(taskID) {
        setTaskID(taskID)
    }

    function handleExcel() {
        setExcel(true)
    }

    function handleExcelOne() {
        setExcelOne(true)
    }

    return (
        <div>
            <MaterialReactTable
                columns={columns}
                data={data}
                layoutMode="grid"
                displayColumnDefOptions={{
                    'mrt-row-actions': {
                        size: 100,
                        grow: false,
                    },
                }}
                enableColumnActions={false}
                positionActionsColumn='last'
                enableRowActions={permissionList == true ? true : false}
                renderRowActions={({ row, table }) => (
                    <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: '8px' }}>
                        <IconButton
                            color="secondary"
                            onClick={() => handleClickEditOne(row.original.taskID)}
                        >
                            <EditIcon />
                        </IconButton>
                    </Box>
                )}
                renderTopToolbarCustomActions={({ table }) => (
                    <Box
                        sx={{
                            display: 'flex',
                            gap: '16px',
                            padding: '8px',
                            flexWrap: 'wrap',
                        }}
                    >
                        <Button
                            onClick={() => handleExcel()}
                            startIcon={<GetAppIcon />}
                        >
                            Export Task Details
                        </Button>
                        &nbsp;
                        <Button
                            onClick={() => handleExcelOne()}
                            startIcon={<GetAppIcon />}
                        >
                            Export Task Rate Details
                        </Button>
                        &nbsp;
                        <Chip style={{ marginLeft: '1rem', backgroundColor: "#44a6c6 ", fontWeight: "bold" }} alignContent="center"
                            label={"Total Count : " + taskData.length}
                            clickable
                            color="primary"
                        />
                    </Box>
                )}
                enableColumnFilterModes={true}
                initialState={{ density: 'compact' }}
                enableColumnPinning={true}
                enableFacetedValues={true}
                paginationDisplayMode='pages'
            />
        </div>
    );
};
