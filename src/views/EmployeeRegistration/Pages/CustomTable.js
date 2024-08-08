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
import VisibilityIcon from '@mui/icons-material/Visibility';
import GetAppIcon from '@material-ui/icons/GetApp';
import moment from 'moment';

export function CustomTable({ employeeData, setEmployeeID, setExcel, permissionList, labourOnBookCount, empCount, handleViewModalClick }) {
    const cloneData = _.cloneDeep(employeeData)
    cloneData.forEach(x => {
        x.isActive = x.isActive == true ? 'Active' : 'InActive'
        x.dateOfBirth = x.dateOfBirth == null ? '-' : moment(x.dateOfBirth).format('YYYY-MM-DD')
        x.joiningDate = x.joiningDate == null ? '-' : moment(x.joiningDate).format('YYYY-MM-DD')
    });
    const data = cloneData;
    const columns = useMemo(
        () => [
            {
                accessorKey: 'registrationNumber',
                header: 'Reg No',
                size: 130,
            },
            {
                accessorKey: 'employeeCode',
                header: 'Emp.Code',
                size: 150,
            },
            {
                accessorKey: 'employeeName',
                header: 'Emp.Name',
                size: 170,
            },
            {
                accessorKey: 'epfNumber',
                header: 'EPF No',
                size: 130,
                Cell: ({ row }) => {
                    return row.original.epfNumber !== null ? row.original.epfNumber : '-';
                },
            },
            {
                accessorKey: 'nicNumber',
                header: 'NID/BIR',
                size: 135,
            },
            {
                accessorKey: 'dateOfBirth',
                header: 'DOB',
                size: 130
            },
            {
                accessorKey: 'joiningDate',
                header: 'DOJ',
                size: 130
            },
            {
                accessorKey: 'employeeCategoryID',
                header: 'Emp.Cat',
                Cell: ({ row }) => {
                    if (row.original.employeeCategoryID == 1) {
                        return "Staff";
                    } else if (row.original.employeeCategoryID == 2) {
                        return 'Daily Labour';
                    } else if (row.original.employeeCategoryID == 3) {
                        return 'Monthly Labour';
                    }
                }
            },
            {
                accessorKey: 'isActive',
                header: 'Status',
                size: 120,
                Cell: ({ row }) => {
                    if (row.original.isActive == "Active") {
                        return "Active";
                    } else {
                        return "Inactive";
                    }
                }
            }
        ],
        [],
    );

    const table = useMaterialReactTable({
        columns,
        data,
    });

    function handleClickEditOne(employeeID) {
        setEmployeeID(employeeID)
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
                        size: 130,
                        grow: false,
                    },
                }}
                enableColumnActions={false}
                positionActionsColumn='last'
                enableRowActions={permissionList == true ? true : false}
                renderRowActions={({ row }) => (
                    <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: '8px' }}>
                        <IconButton
                            color="secondary"
                            onClick={() => handleClickEditOne(row.original.employeeID)}
                        >
                            <EditIcon />
                        </IconButton>
                        <IconButton
                            color="secondary"
                            onClick={() => handleViewModalClick(row.original.registrationNumber, row.original.employeeID)}
                        >
                            <VisibilityIcon />
                        </IconButton>
                    </Box>
                )}
                renderTopToolbarCustomActions={() => (
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
                        &nbsp;
                        <Chip style={{ marginLeft: '1rem', backgroundColor: "#44a6c6 ", fontWeight: "bold" }} alignContent="center"
                            label={"Employee Count : " + empCount}
                            clickable
                            color="primary"
                        />
                        &nbsp;
                        <Chip style={{ marginLeft: '1rem', backgroundColor: "#44a6c6 ", fontWeight: "bold" }} alignContent="center"
                            label={"Labour on Book : " + labourOnBookCount}
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
