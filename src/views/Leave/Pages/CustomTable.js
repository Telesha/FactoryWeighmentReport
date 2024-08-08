import React, { useState, useMemo } from 'react';
import {
    MaterialReactTable,
    useMaterialReactTable,
} from 'material-react-table';
import {
    Box, IconButton, Button,Chip
} from '@material-ui/core';
import _ from 'lodash';
import EditIcon from '@material-ui/icons/Edit';
import GetAppIcon from '@material-ui/icons/GetApp';

export function CustomTable({ employeeLeaveDetailsData, setemployeeLeaveMasterID, permissionList }) {
    const cloneData = _.cloneDeep(employeeLeaveDetailsData)
    cloneData.forEach(x => {
        x.isActive = x.isActive == true ? 'Active' : 'InActive'
    });
    const data = cloneData;
    const columns = useMemo(
        () => [
            {
                accessorKey: 'registrationNumber',
                header: 'Employee ID',
                size: 100,
            },
            {
                accessorKey: 'employeeName',
                header: 'Employee Name',
                size: 100,
            },
            {
                accessorKey: 'employeeLeaveTypeName',
                header: 'Leave type Name',
                size: 100,
            },
            {
                accessorKey: 'allocatedDays',
                header: 'Total Leave Count',
                size: 100,
            },
            {
                accessorKey: 'remainingDays',
                header: 'Remaining Leaves',
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

    function handleClickEdit(employeeLeaveMasterID) {
        setemployeeLeaveMasterID(employeeLeaveMasterID)
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

                            onClick={() => handleClickEdit(row.original.employeeLeaveMasterID)}
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
                        &nbsp;
                        <Chip style={{ marginLeft: '1rem', backgroundColor: "#44a6c6 ", fontWeight: "bold" }} alignContent="center"
                            label={"Total Count : " + employeeLeaveDetailsData.length}
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
