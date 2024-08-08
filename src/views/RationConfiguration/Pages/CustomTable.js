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

export function CustomTable({ rationConfigDetailsData, setrationConfigurationID, setExcel, permissionList }) {
    const cloneData = _.cloneDeep(rationConfigDetailsData)
    cloneData.forEach(x => {
        x.isActive = x.isActive == true ? 'Active' : 'InActive'
    });
    const data = cloneData;
    function handleExcel() {
        setExcel(true)
    }
    const columns = useMemo(
        () => [
            {
                accessorKey: 'employeeEntitleQntity',
                header: 'Employee Entitle Qty',
                size: 100,
            },
            {
                accessorKey: 'spouseEntitleQntity',
                header: 'Spouse Entitle Qty',
                size: 100,
            },
            {
                accessorKey: 'under8EntitleQntity',
                header: 'Age Below 8 Entitle Qty',
                size: 100,
            },
            {
                accessorKey: 'between8to12EntitleQntity',
                header: 'Age Above 8 Entitle Qty',
                size: 100,
            },
            {
                accessorKey: 'seniorCitizenEntitleQntity',
                header: 'Senior Citizen Entitle Qty',
                size: 100,
            },
            {
                accessorKey: 'perKgRate',
                header: 'Per Kg Rate',
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

    function handleClickEdit(rationConfigurationID) {
        setrationConfigurationID(rationConfigurationID)
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
                enableStickyHeader
                displayColumnDefOptions={{
                    'mrt-row-actions': {
                        size: 180,
                        grow: false,
                    },
                }}
                enableColumnOrdering={false}
                enableColumnActions={false}
                positionActionsColumn='last'
                enableRowActions={true}
                renderRowActions={({ row, table }) => (
                    <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: '8px' }}>
                        <IconButton
                            color="secondary"

                            onClick={() => handleClickEdit(row.original.rationConfigurationID)}
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
                            Export All Data
                        </Button>
                        <Chip style={{ marginLeft: '1rem', backgroundColor: "#44a6c6 ", fontWeight: "bold" }} alignContent="center"
                            label={"Total Count : " + rationConfigDetailsData.length}
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
