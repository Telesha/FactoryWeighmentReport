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
import NoEncryptionIcon from '@material-ui/icons/NoEncryption';

export function CustomTable({ userData, setUserID, permissionList, setChangeID, setExcel }) {
    const cloneData = _.cloneDeep(userData)
    cloneData.forEach(x => {
        x.isActive = x.isActive == true ? 'Active' : 'InActive'
    });
    const data = cloneData;
    const columns = useMemo(
        () => [
            {
                accessorKey: 'userName',
                header: 'User Name',
                size: 100,
            },
            {
                accessorKey: 'firstName',
                header: 'First Name',
                size: 100,
            },
            {
                accessorKey: 'lastName',
                header: 'Last Name',
                size: 100,
            },
            {
                accessorKey: 'roleName',
                header: 'Role Name',
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

    function handleClickEditOne(userID) {
        setUserID(userID)
    }

    function handleClickChangePasswordOne(userID) {
        setChangeID(userID)
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
                enableColumnActions={false}
                positionActionsColumn='last'
                enableRowActions={permissionList == true ? true : false}
                renderRowActions={({ row, table }) => (
                    <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: '8px' }}>
                        <IconButton
                            color="secondary"
                            onClick={() => handleClickEditOne(row.original.userID)}
                        >
                            <EditIcon />
                        </IconButton>
                        <IconButton
                            color="secondary"
                            onClick={() => handleClickChangePasswordOne(row.original.userID)}
                        >
                            <NoEncryptionIcon />
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
                            label={"Total Count : " + userData.length}
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
