
import React, { useMemo } from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { Box, IconButton, Button, Chip } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import GetAppIcon from '@material-ui/icons/GetApp';
import _ from 'lodash';

export function CustomTable({ leaveTypeData, setLeaveTypeConfigurationID, setExcel, permissionList }) {
    const cloneData = _.cloneDeep(leaveTypeData)
    cloneData.forEach(x => {
        x.isActive = x.isActive == true ? 'Active' : 'InActive'
    });
    const data = cloneData;
    const columns = useMemo(() => [
        { accessorKey: 'groupName', header: 'Group Name', size: 150 },
        { accessorKey: 'shortForm', header: 'Short Form', size: 130 },
        { accessorKey: 'elaboration', header: 'Elaboration', size: 200 },
        { accessorKey: 'eligible', header: 'Eligible', size: 120 },
        { accessorKey: 'condition', header: 'Condition', size: 150 },
        { accessorKey: 'wages', header: 'Wages', size: 130 },
        { accessorKey: 'isActive', header: 'Status', size: 120 }
    ], []);
    const table = useMaterialReactTable({
        columns,
        data
    });
    function handleClickEditOne(leaveTypeConfigurationID) {
        setLeaveTypeConfigurationID(leaveTypeConfigurationID)
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
                enableRowActions={permissionList.isAddEditScreen == true ? true : false}
                renderRowActions={({ row, table }) => (
                    <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'nowrap' }}>
                        <IconButton color="secondary" onClick={() => handleClickEditOne(row.original.leaveTypeConfigurationID)}>
                            <EditIcon />
                        </IconButton>
                    </Box>
                )}
                renderTopToolbarCustomActions={({ table }) => (
                    <Box sx={{ display: 'flex', gap: '16px', padding: '8px', flexWrap: 'wrap' }}>
                        <Button onClick={() => handleExcel()} startIcon={<GetAppIcon />}>
                            Export All Data
                        </Button>
                        <Chip style={{ marginLeft: '1rem', backgroundColor: "#44a6c6 ", fontWeight: "bold" }} alignContent="center"
                            label={"Total Count : " + leaveTypeData.length}
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
}

