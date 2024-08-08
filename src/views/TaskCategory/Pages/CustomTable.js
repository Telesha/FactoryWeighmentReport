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

export function CustomTable({ taskData, setEstateTaskID, setExcel, permissionList }) {
    const cloneData = _.cloneDeep(taskData)
    cloneData.forEach(x => {
        x.isActive = x.isActive == true ? 'Active' : 'InActive'
    });
    const data = cloneData;
    const columns = useMemo(
        () => [
            {
                accessorKey: 'taskTypeName',
                header: 'Task Type',
                size: 100,
            },

            {
                accessorKey: 'estateTaskName',
                header: 'Task Category Name',
                size: 100,
            },

            {
                accessorKey: 'estateTaskDescription',
                header: 'Task Category Description',
                size: 100,
            },

            {
                accessorKey: 'isActive',
                header: 'Status',
                size: 100,
            }

        ],
        [],
    );

    const table = useMaterialReactTable({
        columns,
        data
    });

    function handleClickEdit(estateTaskID) {
        setEstateTaskID(estateTaskID)
    }

    function handleExcel() {
        setExcel(true)
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
                enableRowActions
                renderRowActions={({ row, table }) => (
                    <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: '8px' }}>
                        <IconButton
                            color="secondary"

                            onClick={() => handleClickEdit(row.original.estateTaskID)}
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
                            Task Category Details
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
