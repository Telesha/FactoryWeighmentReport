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

export function CustomTable({ groupData, setGroupID, setExcel, permissionList }) {
    const cloneData = _.cloneDeep(groupData)
    cloneData.forEach(x => {
        x.isActive = x.isActive == true ? 'Active' : 'InActive'
    });
    const data = cloneData;
    const columns = useMemo(
        () => [
            {
                accessorKey: 'masterGroupCode',
                header: 'Company Code',
                size: 100,
                

            },
            {
                accessorKey: 'shortCode',
                header: 'Short Code',
                size: 100,
                
            },
            {
                accessorKey: 'masterGroupName',
                header: 'Company Name',
                size: 200,
               
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
        data,
    });

    function handleClickEditOne(masterGroupID) {
        setGroupID(masterGroupID)
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
                            onClick={() => handleClickEditOne(row.original.masterGroupID)}
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
                            label={"Total Count : " + groupData.length}
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
