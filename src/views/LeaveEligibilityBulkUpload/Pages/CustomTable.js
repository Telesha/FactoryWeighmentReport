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

export function CustomTable({ employeeLeaveDetailsData, setemployeeLeaveMasterID, setExcel }) {
    const cloneData = _.cloneDeep(employeeLeaveDetailsData)
    cloneData.forEach(x => {
        x.isActive = x.isActive == true ? 'Active' : 'InActive'
        x.remainingLeaves = x.remainingLeaves == null ? x.noOfDays : x.remainingLeaves
        x.availableLeaves = parseFloat(x.noOfDays - x.remainingLeaves).toFixed(1)
    });
    const data = cloneData;
    const columns = useMemo(
        () => [
            {
                accessorKey: 'registrationNumber',
                header: 'Reg. No.',
                size: 100,
            },
            {
                accessorKey: 'firstName',
                header: 'Employee Name',
                size: 100,
            },
            {
                accessorKey: 'leaveTypeName',
                header: 'Leave Type',
                size: 100,
            },
            {
                accessorKey: 'noOfDays',
                header: 'Entitle',
                size: 100,
            },
            {
                accessorKey: 'availableLeaves',
                header: 'Avail',
                size: 100,
            },
            {
                accessorKey: 'remainingLeaves',
                header: 'Balance',
                size: 100,
            },
            // {
            //     accessorKey: 'isActive',
            //     header: 'Status',
            //     size: 100,
            // }

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
                        <Button
                            onClick={() => handleExcel()}
                            startIcon={<GetAppIcon />}
                        >
                            Export
                        </Button>
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
