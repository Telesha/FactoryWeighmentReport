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

export function CustomTable({ roleMobileData, setRoleMobileMenuID, permissionList, setExcel }) {
    const cloneData = _.cloneDeep(roleMobileData)
    cloneData.forEach(x => {
        x.isActive = x.isActive == true ? 'Active' : 'InActive'
        x.isCollectiontagEnabled = x.isCollectiontagEnabled == true ? 'Yes' : 'No'
        x.isDigitalScaleEnabled = x.isDigitalScaleEnabled == true ? 'Yes' : 'No'
    });
    const data = cloneData;
    const columns = useMemo(
        () => [
            {
                accessorKey: 'roleName',
                header: 'Role',
                size: 100, 
            },
            {
                accessorKey: 'menuName',
                header: 'Mobile Menu',
                size: 100,
            },
            {
                accessorKey: 'fVerificationName',
                header: '1st Verification Type',
                size: 100,
            },
            {
                accessorKey: 'sndVerificationName',
                header: '2nd Verification Type',
                size: 100,
            },            
            {
                accessorKey: 'isCollectiontagEnabled',
                header: 'Collection Tag Enabled',
                size: 100,
            },
            {
                accessorKey: 'isDigitalScaleEnabled',
                header: ' Digital Scale Enabled',
                size: 100,
            },
            {
                accessorKey: 'isActive',
                header: 'Status',
                size: 100,
            },
        ],
        [],
    );

    const table = useMaterialReactTable({
        columns,
        data
    });

    function handleClickEditOne(roleMobileMenuID) {
        setRoleMobileMenuID(roleMobileMenuID)
    }

    function handleExcel() {
        setExcel(true);
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
                enableColumnOrdering={false}
                enableColumnActions={false}
                positionActionsColumn='last'
                enableRowActions={permissionList == true ? true : false}
                renderRowActions={({ row, table }) => (
                    <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: '8px' }}>
                        <IconButton
                            color="secondary"
                            onClick={() => handleClickEditOne(row.original.roleMobileMenuID)}
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
                        <Chip style={{ marginLeft: '1rem', backgroundColor: "#44a6c6 ", fontWeight: "bold" }} alignContent="center"
                            label={"Total Count : " + roleMobileData.length}
                            clickable
                            color="primary"
                        />
                    </Box>
                )}
                enableColumnFilterModes={true}
                enableColumnPinning={true}
                initialState={{ density: 'compact' }}
                enableFacetedValues={true}
                paginationDisplayMode='pages'
            />
        </div>
    );
};
