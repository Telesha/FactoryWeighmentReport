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

export function CustomTable({ factoryData, setFactoryID, setExcel, permissionList }) {
    const cloneData = _.cloneDeep(factoryData)
    cloneData.forEach(x => {
        x.isActive = x.isActive == true ? 'Active' : 'InActive'
    });
    const data = cloneData;
    const columns = useMemo(
        () => [
            {
                accessorKey: 'factoryCode',
                header: 'Location Code',
                size: 150,
            },
            {
                accessorKey: 'shortCode',
                header: 'Short Code',
                size: 150,
            },
            {
                accessorKey: 'factoryName',
                header: 'Location Name',
                size: 150,
            },
            {
                accessorKey: 'labourOnBook',
                header: 'Labour on Book',
                muiTableBodyCellProps: {
                    align: 'center',
                  },
                size: 150,
                Cell: ({ row }) => {
                    return row.original.labourOnBook !== null ? row.original.labourOnBook : '-';
                }
            },
            {
                accessorKey: 'grantArea',
                header: '  Grant Area',
                size: 150,
                muiTableBodyCellProps: {
                    align: 'left',
                  },

                Cell: ({ row }) => {
                    return row.original.grantArea !== null ? row.original.grantArea : '-';
                }
            },
            {
                accessorKey: 'isActive',
                header: 'Status',             
            }
        ],
        [],
    );

    const table = useMaterialReactTable({
        columns,
        data
    });

    function handleClickEditOne(factoryID) {
        setFactoryID(factoryID)
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
                            onClick={() => handleClickEditOne(row.original.factoryID)}
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
                            label={"Total Count : " + factoryData.length}
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
