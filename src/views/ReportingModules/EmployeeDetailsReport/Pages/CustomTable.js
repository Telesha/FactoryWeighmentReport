import React, { useState, useMemo } from 'react';
import {
    MaterialReactTable,
    useMaterialReactTable,
} from 'material-react-table';
import {
    Box, Button
} from '@material-ui/core';
import _ from 'lodash';
import GetAppIcon from '@material-ui/icons/GetApp';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ReactToPrint from 'react-to-print';
import CreatePDF from './CreatePDF';

export function CustomTable({ employeeData, componentRef, setExcel, selectedSearchValues }) {
    const cloneData = _.cloneDeep(employeeData)
    cloneData.forEach(x => {
        x.isActive = x.isActive ? 'Active' : 'Inactive';
        x.dateOfBirth = x.dateOfBirth ? x.dateOfBirth.split('T')[0] : '-';
        x.joiningDate = x.joiningDate ? x.joiningDate.split('T')[0] : '-';
    });
    const data = cloneData;
    const columns = useMemo(
        () => [
            {
                accessorKey: 'factoryName',
                header: 'Business Division',
                size: 100,
            },
            {
                accessorKey: 'divisionName',
                header: 'Location',
                size: 100,
            },
            {
                accessorKey: 'registrationNumber',
                header: 'Reg. No',
                size: 100,
            },
            {
                accessorKey: 'employeeCode',
                header: 'Emp.Code',
                size: 100,
            },
            {
                accessorKey: 'epfNumber',
                header: 'PF No',
                size: 100,
            },
            {
                accessorKey: 'employeeName',
                header: 'Emp. Name',
                size: 100,
            },
            {
                accessorKey: 'nicNumber',
                header: 'NID/BIR',
                size: 100,
            },
            {
                accessorKey: 'dateOfBirth',
                header: 'DOB',
                size: 100,
            },
            {
                accessorKey: 'joiningDate',
                header: 'DOJ',
                size: 100,
            },
            {
                accessorKey: 'employeeCategoryName',
                header: 'Emp. Cat',
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
    function handleExcel() {
        setExcel(true);
    }

    return (
        <div>
            <MaterialReactTable
                columns={columns}
                data={data}
                layoutMode="grid"
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
                        &nbsp;&nbsp;&nbsp;
                        <ReactToPrint
                            documentTitle={'Employee Master'}
                            trigger={() => (
                                <Button
                                    startIcon={<PictureAsPdfIcon />}
                                >
                                    PDF
                                </Button>
                            )}
                            content={() => componentRef.current}
                        />
                        <div hidden={true}>
                            <CreatePDF
                                ref={componentRef}
                                searchData={selectedSearchValues}
                                employeeData={employeeData}
                            />
                        </div>
                    </Box>
                )}
                enableColumnFilterModes={true}
                enableColumnActions={false}
                enableColumnPinning={true}
                initialState={{ density: 'compact' }}
                enableFacetedValues={true}
                paginationDisplayMode='pages'
            />
        </div>
    );
};
