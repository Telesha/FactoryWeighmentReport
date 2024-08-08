import React, { useMemo } from 'react';
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
import CountUp from 'react-countup';

export function CustomTable({ totalGrantArea, landDistributionData, setLandDistributionID, setExcel, totalArea, differenceTotal, permissionList }) {
    const cloneData = _.cloneDeep(landDistributionData)
    const data = cloneData;
    const columns = useMemo(
        () => [
            {
                accessorKey: 'groupName',
                header: 'Business Division',
                size: 100,
            },
            {
                accessorKey: 'factoryName',
                header: 'Location',
                size: 100,
                
            },
            {
                accessorKey: 'landDescription',
                header: 'Land Description',
                size: 100,
            },
            {
                accessorKey: 'printPriority',
                header: 'Print Priority',
                size: 100,
            },
            {
                accessorKey: 'area',
                header: 'Area',
                size: 100,
            }
        ],
        [],
    );

    const table = useMaterialReactTable({
        columns,
        data
    });

    function handleClickEditOne(landDistributionID) {
        setLandDistributionID(landDistributionID)
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
                        size: 180,
                        grow: false,
                    },
                }}
                enableColumnActions={false}
                positionActionsColumn='last'
                enableRowActions={permissionList == true ? true : false}
                renderRowActions={({ row, table }) => (
                    <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: '8px' }}>
                        <IconButton
                            color="secondary"
                            onClick={() => handleClickEditOne(row.original.landDistributionID)}
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
                            label={"Total Grant Area : " + totalGrantArea.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            clickable
                            color="primary"
                        />
                        &nbsp;
                        <Chip style={{ marginLeft: '1rem', backgroundColor: "#44a6c6 ", fontWeight: "bold" }} alignContent="center"
                            label={"Total Area : " + totalArea.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            clickable
                            color="primary"
                        />
                        &nbsp;
                        <Chip style={{ marginLeft: '1rem', backgroundColor: "#44a6c6 ", fontWeight: "bold" }} alignContent="center"
                            label={"Difference : " + differenceTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            clickable
                            color="primary"
                        />
                        <Chip style={{ marginLeft: '1rem', backgroundColor: "#44a6c6 ", fontWeight: "bold" }} alignContent="center"
                            label={"Total Count : " + landDistributionData.length}
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
