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

export function CustomTable({ packageData, setPackageID, setExcel, permissionList }) {
    const cloneData = _.cloneDeep(packageData)
    cloneData.forEach(x => {
        x.isActive = x.isActive == true ? 'Active' : 'InActive'
    });
    const data = cloneData;
    const columns = useMemo(
        () => [
            {
                accessorKey: 'packageCode',
                header: 'Package Code',
                size: 100,
            },

            {
                accessorKey: 'packageName',
                header: 'Package Name',
                size: 100,
            },

            {
                accessorKey: 'userName',
                header: 'User Name',
                size: 100,
            },
            {
                accessorKey: 'packageReferance',
                header: 'Reference',
                size: 100,
            },
            {
                accessorKey: 'divisionName',
                header: 'Cost Center',
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

    function editPackageDetails(packageID) {
        setPackageID(packageID)
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
                enableRowActions //={permissionList == true ? true : false}
                renderRowActions={({ row, table }) => (
                    <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: '8px' }}>
                        <IconButton
                            color="secondary"

                            onClick={() => editPackageDetails(row.original.packageID)}
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
                            Package Details
                        </Button>
                        &nbsp;
                        <Chip style={{ marginLeft: '1rem', backgroundColor: "#44a6c6 ", fontWeight: "bold" }} alignContent="center"
                            label={"Total Count : " + packageData.length}
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
