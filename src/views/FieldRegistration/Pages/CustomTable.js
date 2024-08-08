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

export function CustomTable({ fieldData, setFeildID, setExcel, totalFieldArea, totalMaturedArea, totalActualPlants, totalImmaturedArea, permissionList }) {
    const cloneData = _.cloneDeep(fieldData)
    cloneData.forEach(x => {
        x.isActive = x.isActive == true ? 'Active' : 'InActive'
        x.total = (x.area - x.cultivationArea).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    });
    const data = cloneData;
    const columns = useMemo(
        () => [
            {
                accessorKey: 'fieldName',
                header: 'Field Name',
                size: 128,
            },
            {
                accessorKey: 'area',
                header: 'Field Area',
                size: 125,
            },
            {
                accessorKey: 'cultivationArea',
                header: 'Matured Area',
                size: 145,
            },
            {
                accessorKey: 'total',
                header: 'Immatured Area',
                size: 145,
            },
            {
                accessorKey: 'plantsPerHectare',
                header: 'Plants Per Hec.',
                size: 155,
            },
            {
                accessorKey: 'vacancyPercentage',
                header: 'Vacancy %',
                size: 125,
            },
            {
                accessorKey: 'noOfTeaBushes',
                header: 'Actual Plants',
                size: 145,
            },
            {
                accessorKey: 'productName',
                header: 'Product',
                size: 107,
                Cell: ({ row }) => {
                    return row.original.productName !== null ? row.original.productName : '-';
                },
            },
            {
                accessorKey: 'specing',
                header: 'Spacing',
                size: 107,
                Cell: ({ row }) => {
                    return row.original.specing !== null ? row.original.specing : '-';
                },
            },
            {
                accessorKey: 'lastPlantingYear',
                header: 'Last Planting Year',
                size: 175,
                Cell: ({ row }) => {
                    return row.original.lastPlantingYear !== null ? new Date(row.original.lastPlantingYear).getFullYear() : '-';
                },
            },
            {
                accessorKey: 'divisionName',
                header: 'Sub Division',
                size: 138,
            },
            {
                accessorKey: 'isActive',
                header: 'Status',
                size: 105,
                Cell: ({ row }) => {
                    return row.original.isActive !== null ? row.original.isActive : '-';
                },
            }
        ],
        [],
    );

    const table = useMaterialReactTable({
        columns,
        data,
        initialState: { density: 'compact' },
    });

    function handleClickEditOne(fieldID) {
        setFeildID(fieldID)
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
                        size: 110,
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
                            onClick={() => handleClickEditOne(row.original.fieldID)}
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
                            label={"Field Area : " + totalFieldArea.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            clickable
                            color="primary"
                        />
                        &nbsp;
                        <Chip style={{ marginLeft: '1rem', backgroundColor: "#44a6c6 ", fontWeight: "bold" }} alignContent="center"
                            label={"Matured Area : " + totalMaturedArea.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            clickable
                            color="primary"
                        />
                        &nbsp;
                        <Chip style={{ marginLeft: '1rem', backgroundColor: "#44a6c6 ", fontWeight: "bold" }} alignContent="center"
                            label={"Immatured Area : " + totalImmaturedArea.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            clickable
                            color="primary"
                        />
                        &nbsp;
                        <Chip style={{ marginLeft: '1rem', backgroundColor: "#44a6c6 ", fontWeight: "bold" }} alignContent="center"
                            label={"Actual Plants : " + totalActualPlants.toLocaleString('en-US')}
                            clickable
                            color="primary"
                        />
                        <Chip style={{ marginLeft: '1rem', backgroundColor: "#44a6c6 ", fontWeight: "bold" }} alignContent="center"
                            label={"Total Count : " + fieldData.length}
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
