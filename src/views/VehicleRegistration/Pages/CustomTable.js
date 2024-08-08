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

export function CustomTable({ Vehicle, setVehicleID, setExcel, permissionList }) {
    const cloneData = _.cloneDeep(Vehicle)
    cloneData.forEach(x => {
        x.isActive = x.isActive == true ? 'Active' : 'InActive';
        x.fuelTypeID = x.fuelTypeID == 1 ? 'Petrol' : x.fuelTypeID == 2 ? 'Diesel' : x.fuelTypeID == 3 ? 'Kerosene' : x.fuelTypeID == 4 ? 'Gas' : '-';
    });
    const data = cloneData;
    const columns = useMemo(
        () => [

            {
                accessorKey: 'factoryName',
                header: 'Location',
                size: 150,
            },
            {
                accessorKey: 'vehicleName',
                header: 'Vehicle Type',
                size: 150,
            },
            {
                accessorKey: 'fuelTypeID',
                header: 'Fuel Type',
                size: 150,
            },
            {
                accessorKey: 'vehicleRegistrationNumber',
                header: 'Registration Number',
                size: 150,
            },
            {
                accessorKey: 'capacity',
                header: 'Capacity',
                size: 150,
            },
            {
                accessorKey: 'isActive',
                header: 'Status',
                size: 150,
            },

        ],
        [],
    );

    const table = useMaterialReactTable({
        columns,
        data
    });

    function handleClickEditOne(vehicleID) {
        setVehicleID(vehicleID)
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
                            onClick={() => handleClickEditOne(row.original.vehicleID)}
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
                            label={"Total Count : " + Vehicle.length}
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
