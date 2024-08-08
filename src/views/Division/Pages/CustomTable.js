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

export function CustomTable({ costCenterData, setRouteID, setExcel, permissionList }) {
    const cloneData = _.cloneDeep(costCenterData)
    cloneData.forEach(x => {
        x.isActive = x.isActive == true ? 'Active' : 'InActive'
    });
    const data = cloneData;
    const columns = useMemo(
        () => [
            {
                accessorKey: 'routeCode',
                header: 'Sub Division Code',
                size: 165,

            },
            {
                accessorKey: 'shortCode',
                header: 'Short Code',
                size: 140,
                Cell: ({ row }) => {
                    return row.original.shortCode !== null ? row.original.shortCode : '-';
                }
            },
            {
                accessorKey: 'routeName',
                header: 'Sub Division Name',
                size: 150,

            },
            {
                accessorKey: 'targetCrop',
                header: 'Target Crop (in Kg)',
                size: 165,
                Cell: ({ row }) => {
                    return row.original.targetCrop !== null ? row.original.targetCrop : '-';
                }
            },
            {
                accessorKey: 'isActive',
                header: 'Status',
                size: 110,
            }
        ],
        [],
    );

    const table = useMaterialReactTable({
        columns,
        data,
        initialState: { density: 'compact' },
    });



    function handleClickEditOne(routeID) {
        setRouteID(routeID)
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
                enableRowActions={permissionList == true ? true : false}
                renderRowActions={({ row, table }) => (
                    <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: '8px' }}>
                        <IconButton
                            color="secondary"
                            onClick={() => handleClickEditOne(row.original.routeID)}
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
                            label={"Total Count : " + costCenterData.length}
                            clickable
                            color="primary"
                        />
                    </Box>
                )}
                enableColumnFilterModes={true}
                enableColumnPinning={true}
                enableFacetedValues={true}
                initialState={{ density: 'compact' }}
                paginationDisplayMode='pages'
            />
        </div>
    );
};
