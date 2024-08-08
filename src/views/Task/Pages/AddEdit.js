import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box, Card, Grid, TextField, makeStyles, Container, Button,
    CardContent, Divider, InputLabel, Switch, CardHeader,
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, MenuItem, Tooltip, Select } from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import { trackPromise } from 'react-promise-tracker';
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import './CustomDropdownStyles.css';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    },
    avatar: {
        marginRight: theme.spacing(2)
    }
}));

var screenCode = "TASK"

export default function TaskAddEdit(props) {
    const [title, setTitle] = useState("Add Task")
    const [isUpdate, setIsUpdate] = useState(false);
    const [isDisableButton, setIsDisableButton] = useState(false);
    const [isMultipleMonths, setIsMultipleMonths] = useState(true);
    const [isEdit, setIsEdit] = useState(false);
    const [isSectionView, setIsSectionView] = useState(false);
    const [isDisableFixedButton, setIsDisableFixedButton] = useState(false);
    const classes = useStyles();
    const [task, setTask] = useState({
        taskID: '',
        groupID: "0",
        operationEntityID: "0",
        productID: "0",
        divisionID: "0",
        fieldID: "0",
        estateTaskID: "0",
        factoryJobId: "0",
        measuringUnitId: "0",
        taskCode: '',
        subTaskCode: '',
        taskName: '',
        taskDescription: '',
        measuringUnit: '',
        budgetExpensesCode: '',
        isPlucking: false,
        isActive: true,
        isMinMaxApply: false,
        isFixed: true,
        isGender: false,
        employeeCategoryTypeID: "0"

    });
    const [array, setArray] = useState([]);
    const [arrayLenght, setarrayLenght] = useState(false);
    const [groupData, setGroupData] = useState([]);
    const [factoryData, setFactoryData] = useState([]);
    const [taskCategory, setTaskCategory] = useState([]);
    const [products, setProducts] = useState([]);
    const [employee, setEmployee] = useState([]);
    const [employeeCategory, setEmployeeCategory] = useState([]);
    const [harvestingJobType, setHarvestingJobType] = useState([]);
    const [measuringUnitType, setMeasuringUnitType] = useState([]);
    const [options, setOptions] = useState([]);
    const [options1, setOptions1] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [harvestingJobIdList, setHarvestingJobIdList] = useState([]);
    const [fieldIDList, setFieldIDList] = useState([]);
    const [fieldType, setFieldType] = useState([]);
    const [fields, setFields] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [fieldVal, setFieldVal] = useState();
    const [sectionNameForTextField, setSectionNameForTextField] = useState();
    const [tableData, setTableData] = useState({
        employeeTypeID: "0",
        harvestingJobId: "0",
        measuringUnitId: "0",
        measuringQuantity: "",
        maxMeasuringQuantity: "",
        allowance: "",
        gardenAllowance: "",
        applyMethodID: "0",
        minRate: "10",
        maxRate: "",
        defaultRate: "",
        defaultMRate: "",
        defaultWRate: "",
        isRate: false,
        isGender: false,
        labourTaskRateID: "0",
        monthId: "0",
        lessRate: "",
        overRate: "",
        divisionID: "0",
        employeeCategoryTypeID: "0"
    });
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const months = [
        { value: '1', label: 'January' },
        { value: '2', label: 'February' },
        { value: '3', label: 'March' },
        { value: '4', label: 'April' },
        { value: '5', label: 'May' },
        { value: '6', label: 'June' },
        { value: '7', label: 'July' },
        { value: '8', label: 'August' },
        { value: '9', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' },
    ];
    const [selectedMonths, setSelectedMonths] = useState([]);
    const navigate = useNavigate();
    const handleClick = () => {
        navigate('/app/tasks/Listing');
    }
    const alert = useAlert();
    const { taskID } = useParams();
    let decryptedID = 0;

    useEffect(() => {
        getPermission();
        GetAllGroups()
    }, []);

    useEffect(() => {
        trackPromise(
            getEstateDetailsByGroupID()
        )
    }, [task.groupID]);

    useEffect(() => {
        if (!tableData.isFixed) {
            const currentDate = new Date();
            const currentMonth = (currentDate.getMonth() + 1).toString()

            setTableData(prevTableData => ({
                ...prevTableData,
                monthId: currentMonth
            }));
        }
    }, [tableData.isFixed]);

    useEffect(() => {
        if (tableData.isFixed) {
            setTableData(prevTableData => ({
                ...prevTableData,
                monthId: "0"
            }));
        }
    }, [tableData.isFixed]);

    useEffect(() => {
        trackPromise(
            getAllTaskNames()
        )
    }, [task.groupID, task.operationEntityID]);

    useEffect(() => {
        trackPromise(
            GetEmployeeTypesData()
        )
    }, []);

    useEffect(() => {
        trackPromise(
            GetEmployeeCategoryTypesData()
        )
    }, []);

    useEffect(() => {
        trackPromise(
            GetHarvestingJobType()
        )
    }, [task.operationEntityID]);

    useEffect(() => {
        trackPromise(
            GetFactoryJobs()
        )
    }, [task.operationEntityID]);

    useEffect(() => {
        trackPromise(
            GetMeasuringUnit()
        )
    }, []);

    useEffect(() => {
        if (task.operationEntityID != 0) {
            trackPromise(
                getDivisionDetailsByEstateID(),
                GetMappedProductsByFactoryID()
            )
        }
    }, [task.operationEntityID]);

    useEffect(() => {
        if (task.divisionID != 0) {
            trackPromise(
                GetFieldDetailsByDivisionID()
            )
        }
    }, [task.divisionID]);

    useEffect(() => {
        decryptedID = atob(taskID.toString());
        if (decryptedID != 0) {
            setIsUpdate(true);
            setTitle("Edit Task");
            trackPromise(
                GetLabourTaskByTaskID(decryptedID),
                GetLabourRatesByTaskID(decryptedID),
                GetHarvestingJobType(decryptedID)
            )
        }
    }, []);

    const EnableAddButton = () => {
        var enable = false;
        if (task.divisionID <= 0) {
            alert.error("Sub Division Required");
        }
        else if (tableData.employeeTypeID <= 0) {
            alert.error("Employee Type Required");
        }
        else if (task.measuringUnitId <= 0) {
            alert.error("Measuring Unit Required");
        }
        else if (task.isPlucking == true && tableData.harvestingJobId <= 0) {
            alert.error("Harvesting Job Required");
        }
        else {
            enable = true
        }
        return enable;
    };

    async function GetLabourRatesByTaskID(ID) {
        const result = await services.GetLabourRatesByTaskID(ID);
        if (result.length != 0) {
            const newObjectList = result.map((item) =>
                item.monthId != 0 ? { ...item, monthName: months.find((op) => parseInt(op.value) === item.monthId).label } : { ...item, monthName: "N/A" }
            );
            setarrayLenght(true);
            setArray(newObjectList);
            setIsDisableFixedButton(true);
        }
        else {
            setArray(result);
        }
    }

    async function GetLabourTaskByTaskID(ID) {
        const result = await services.GetLabourTaskByTaskID(ID);
        setTask({
            ...task,
            taskID: result.taskID,
            groupID: result.groupID,
            operationEntityID: result.operationEntityID,
            productID: result.productID,
            estateTaskID: result.estateTaskID,
            taskCode: result.taskCode,
            subTaskCode: result.subTaskCode,
            taskName: result.taskName,
            taskDescription: result.taskDescription,
            measuringUnit: result.measuringUnit,
            budgetExpensesCode: result.budgetexpensescode,
            isPlucking: result.isPlucking,
            isActive: result.isActive,
            isFixed: result.isFixed,
            isGender: result.isGender,
            measuringUnitId: result.measuringUnitId,
            divisionID: result.divisionID,
            employeeCategoryTypeID: result.employeeCategoryTypeID

        });
    }

    async function GetAllGroups() {
        const result = await services.GetAllGroups();
        setGroupData(result);
    }

    async function getEstateDetailsByGroupID() {
        var result = await services.getEstateDetailsByGroupID(task.groupID);
        setFactoryData(result);
    }

    async function getAllTaskNames() {
        const result = await services.getAllTaskNames(task.groupID, task.operationEntityID);
        setTaskCategory(result);
    }

    async function GetMappedProductsByFactoryID() {
        var response = await services.GetMappedProductsByFactoryID(task.operationEntityID);
        setProducts(response);
    };

    async function GetEmployeeTypesData() {
        const result = await services.GetEmployeeTypesData();
        setEmployee(result);
    }

    async function GetEmployeeCategoryTypesData() {
        const result = await services.GetEmployeeCategoryTypesData();
        setEmployeeCategory(result);
    }

    async function GetHarvestingJobType(ID) {
        const result = await services.GetTaskHarverstingJob(ID);
        setHarvestingJobType(result);
    }

    async function getDivisionDetailsByEstateID() {
        var response = await services.GetDivisionDetailsByEstateID(task.operationEntityID);
        setDivisions(response);
    };

    async function GetFieldDetailsByDivisionID() {
        var response = await services.GetFieldDetailsByDivisionID(task.divisionID);
        var newCollectionTypeArray = options;
        newCollectionTypeArray.splice(0, newCollectionTypeArray.length);
        for (var i = 0; i < response.length; i++) {
            newCollectionTypeArray.push({ label: response[i].fieldName, value: response[i].fieldID })
        }
        setFields(newCollectionTypeArray);

        let array = []
        for (let item of Object.entries(newCollectionTypeArray)) {
            array[item[1]["value"]] = item[1]["label"]
        }
    };

    async function GetFactoryJobs() {
        const result = await services.GetFactoryJobs(task.operationEntityID);

        var newCollectionTypeArray = options1;
        newCollectionTypeArray.splice(0, newCollectionTypeArray.length);
        for (var i = 0; i < result.length; i++) {
            newCollectionTypeArray.push({ label: result[i].jobName, value: result[i].harvestingJobMasterID })
        }
        setJobs(newCollectionTypeArray);

        let array = []
        for (let item of Object.entries(newCollectionTypeArray)) {
            array[item[1]["value"]] = item[1]["label"]
        }
    }

    const handleOnchangeCategory = val => {

        var splitCollectionCategoryArray = val.split(",")
        let array = []
        for (let item of splitCollectionCategoryArray) {

            var obj = options1.find((op) => op.value === parseInt(item));

            if (obj != undefined) {
                array[obj.value] = obj.label
            }
        }
        setHarvestingJobIdList(splitCollectionCategoryArray);
        setHarvestingJobType(array);
    }

    const handleOnchangeFields = val => {
        setFieldVal(val)
        var splitCollectionCategoryArray = val.split(",")
        let array = []
        for (let item of splitCollectionCategoryArray) {

            var obj = options.find((op) => op.value === parseInt(item));

            if (obj != undefined) {
                array[obj.value] = obj.label
            }
        }
        setFieldIDList(splitCollectionCategoryArray);
        setFieldType(array);
    }

    async function GetMeasuringUnit() {
        const result = await services.getMeasuringUnit();
        setMeasuringUnitType(result);
    }

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITLABOURTASK');

        if (isAuthorized === undefined) {
            navigate('/404');
        }
        var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
        });

        setTask({
            ...task,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            operationEntityID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function DeleteRates(labourTaskRateID, taskID) {
        const result = await services.deleteRates(labourTaskRateID, taskID);
        alert.success("Task Rate Deleted Successfully")
    }

    async function SaveLabourTask() {
        if (isUpdate == true) {
            let updateModel = {
                taskID: atob(taskID.toString()),
                estateTaskID: parseInt(task.estateTaskID),
                operationEntityID: parseInt(task.operationEntityID),
                productID: parseInt(task.productID),
                divisionID: parseInt(task.divisionID),
                fieldID: parseInt(task.fieldID),
                taskCode: task.taskCode,
                subTaskCode: task.subTaskCode,
                taskName: task.taskName,
                taskDescription: task.taskDescription,
                measuringUnit: task.measuringUnit,
                measuringUnitId: task.measuringUnitId,
                budgetExpensesCode: task.budgetExpensesCode,
                rateList: array,
                modifiedBy: parseInt(tokenService.getUserIDFromToken()),
                isActive: task.isActive,
                isPlucking: task.isPlucking,
                isFixed: task.isFixed,
                employeeCategoryTypeID: task.employeeCategoryTypeID
            }
            let response = await services.UpdateLabourTask(updateModel, array, tableData);
            if (response.statusCode == "Success") {
                alert.success(response.message);
                setIsDisableButton(true);
                navigate('/app/tasks/Listing');
            }
            else {
                alert.error(response.message);
            }

        } else {
            let response = await services.SaveLabourTask(task, array, harvestingJobIdList, tableData)
            if (response.statusCode == "Success") {
                alert.success(response.message);
                setIsDisableButton(true);
                navigate('/app/tasks/Listing');
            }
            else {
                alert.error(response.message);
            }
        }
    }

    const handleDelete = (row, id) => {
        if (isUpdate == true) {
            DeleteRates(row.labourTaskRateID, task.taskID)
            const updatedData = array.filter((row, index) => index !== id);
            if (updatedData.length == 0) {
                setarrayLenght(false);
            }
            setArray(updatedData);
        }
        else {
            const updatedData = array.filter((row, index) => index !== id);
            if (updatedData.length == 0) {
                setarrayLenght(false);
            }
            setArray(updatedData);
        }
    };

    const handleEdit = (row, id) => {
        const updatedData = array.filter((array, i) => i !== id);
        setArray(updatedData);
        setIsMultipleMonths(false);
        setIsEdit(true);
        setSectionNameForTextField(row.sectionName)
        setIsDisableButton(true)
        setIsSectionView(true)
        setTableData({
            ...tableData,
            employeeTypeID: row.employeeTypeID,
            applyMethodID: row.applyMethodID,
            minRate: row.minRate,
            maxRate: row.maxRate,
            harvestingJobId: row.harvestingJobId,
            measuringUnitId: row.measuringUnitId,
            measuringQuantity: row.measuringQuantity,
            maxMeasuringQuantity: row.maxMeasuringQuantity,
            allowance: row.allowance,
            gardenAllowance: row.gardenAllowance,
            defaultRate: row.defaultRate,
            isRate: row.isRate,
            monthId: row.monthId,
            labourTaskRateID: row.labourTaskRateID,
            lessRate: row.lessRate,
            overRate: row.overRate,
            divisionID: row.divisionID,
            fieldID: row.fieldID
        })
    }

    function addTabledata() {
        var enable = EnableAddButton();
        if (enable) {
            if (task.isFixed || isEdit) {
                addYearRatesToArray();
            }
            else {
                addMonthlyRatesToArray();
            }
            setIsMultipleMonths(true);
            setIsDisableFixedButton(true);
            setIsDisableButton(false)
            setSectionNameForTextField('')
            setIsSectionView(false)
            setIsEdit(false)
            setTableData({
                ...tableData,
                employeeTypeID: "0",
                applyMethodID: "0",
                minRate: "10",
                maxRate: "",
                harvestingJobId: "0",
                measuringQuantity: "",
                maxMeasuringQuantity: "",
                allowance: "",
                gardenAllowance: "",
                defaultRate: "",
                isRate: true,
                labourTaskRateID: "0",
                lessRate: "",
                overRate: "",
                divisionID: "0",
                defaultMRate: "",
                defaultWRate: ""
            })
        }
    }

    function addMonthlyRatesToArray() {
        var newOptionArray = array;
        if (fieldIDList.length === 0) {
            alert.error("Select a Field");
            return;
        }

        for (let item of fieldIDList) {
            newOptionArray.push({
                employeeTypeID: tableData.employeeTypeID,
                employeeTypeName: tableData.employeeTypeID > 0 ? employee.filter((item, index) => index === tableData.employeeTypeID)[0] : "N/A",
                applyMethodID: parseInt(task.measuringUnitId),
                minRate: tableData.minRate == '' || isNaN(tableData.minRate) ? parseFloat(0) : parseFloat(tableData.minRate),
                maxRate: tableData.maxRate == '' || isNaN(tableData.maxRate) ? parseFloat(0) : parseFloat(tableData.maxRate),
                harvestingJobId: parseInt(tableData.harvestingJobId),
                harvestingJobName: tableData.harvestingJobId > 0 ? harvestingJobType.filter((item, index) => index === tableData.harvestingJobId)[0] : "N/A",
                measuringUnitId: parseInt(task.measuringUnitId),
                measuringUnitName: task.measuringUnitId > 0 ? measuringUnitType.filter((item, index) => index === parseInt(task.measuringUnitId))[0] : "N/A",
                measuringQuantity: tableData.measuringQuantity == '' || isNaN(tableData.measuringQuantity) ? parseFloat(0) : parseFloat(tableData.measuringQuantity),
                maxMeasuringQuantity: tableData.maxMeasuringQuantity == '' || isNaN(tableData.maxMeasuringQuantity) ? parseFloat(0) : parseFloat(tableData.maxMeasuringQuantity),
                allowance: tableData.allowance == '' || isNaN(tableData.allowance) ? parseFloat(0) : parseFloat(tableData.allowance),
                gardenAllowance: tableData.gardenAllowance == '' || isNaN(tableData.gardenAllowance) ? parseFloat(0) : parseFloat(tableData.gardenAllowance),
                defaultRate: tableData.defaultRate == '' || isNaN(tableData.defaultRate) ? parseFloat(0) : parseFloat(tableData.defaultRate),
                defaultMRate: tableData.defaultMRate == '' || isNaN(tableData.defaultMRate) ? parseFloat(0) : parseFloat(tableData.defaultMRate),
                defaultWRate: tableData.defaultWRate == '' || isNaN(tableData.defaultWRate) ? parseFloat(0) : parseFloat(tableData.defaultWRate),
                isGender: tableData.isGender,
                isRate: tableData.isRate,
                monthId: parseInt(tableData.monthId),
                monthName: task.isFixed ? "N/A" : months.find((op) => parseInt(op.value) === parseInt(tableData.monthId)).label,
                labourTaskRateID: tableData.labourTaskRateID,
                divisionID: parseInt(task.divisionID),
                divisionName: divisions[task.divisionID],
                fieldID: parseInt(item),
                lessRate: tableData.lessRate == '' || isNaN(tableData.lessRate) ? parseFloat(0) : parseFloat(tableData.lessRate),
                overRate: tableData.overRate == '' || isNaN(tableData.overRate) ? parseFloat(0) : parseFloat(tableData.overRate),
                sectionName: task.isFixed ? "N/A" : fields.find((op) => parseInt(op.value) === parseInt(item)).label
            });
        }
        setArray(newOptionArray);
    }

    function addYearRatesToArray() {
        var newOptionArray = array;
        if (fieldIDList.length === 0) {
            alert.error("Select a Field");
            return;
        }
        if (array.some((itm) => parseInt(itm.fieldID) === parseInt(tableData.fieldID)

            && itm.employeeTypeID === tableData.employeeTypeID

            && itm.harvestingJobId === parseInt(tableData.harvestingJobId))) {

            return;
        }
        if (isUpdate) {
            if (isUpdate && isEdit) {
                setArray(
                    [...array, {
                        employeeTypeID: tableData.employeeTypeID,
                        employeeTypeName: tableData.employeeTypeID > 0 ? employee.filter((item, index) => index === tableData.employeeTypeID)[0] : "N/A",
                        applyMethodID: parseInt(task.measuringUnitId),
                        minRate: tableData.minRate == '' || isNaN(tableData.minRate) ? parseFloat(0) : parseFloat(tableData.minRate),
                        maxRate: tableData.maxRate == '' || isNaN(tableData.maxRate) ? parseFloat(0) : parseFloat(tableData.maxRate),
                        harvestingJobId: parseInt(tableData.harvestingJobId),
                        harvestingJobName: tableData.harvestingJobId > 0 ? harvestingJobType.filter((item, index) => index === tableData.harvestingJobId)[0] : "N/A",
                        measuringUnitId: parseInt(task.measuringUnitId),
                        measuringUnitName: task.measuringUnitId > 0 ? measuringUnitType.filter((item, index) => index === parseInt(task.measuringUnitId))[0] : "N/A",
                        measuringQuantity: tableData.measuringQuantity == '' || isNaN(tableData.measuringQuantity) ? parseFloat(0) : parseFloat(tableData.measuringQuantity),
                        maxMeasuringQuantity: tableData.maxMeasuringQuantity == '' || isNaN(tableData.maxMeasuringQuantity) ? parseFloat(0) : parseFloat(tableData.maxMeasuringQuantity),
                        allowance: tableData.allowance == '' || isNaN(tableData.allowance) ? parseFloat(0) : parseFloat(tableData.allowance),
                        gardenAllowance: tableData.gardenAllowance == '' || isNaN(tableData.gardenAllowance) ? parseFloat(0) : parseFloat(tableData.gardenAllowance),
                        defaultRate: tableData.defaultRate == '' || isNaN(tableData.defaultRate) ? parseFloat(0) : parseFloat(tableData.defaultRate),
                        defaultMRate: tableData.defaultMRate == '' || isNaN(tableData.defaultMRate) ? parseFloat(0) : parseFloat(tableData.defaultMRate),
                        defaultWRate: tableData.defaultWRate == '' || isNaN(tableData.defaultWRate) ? parseFloat(0) : parseFloat(tableData.defaultWRate),
                        isGender: tableData.isGender,
                        isRate: tableData.isRate,
                        monthId: task.isFixed ? 0 : parseInt(tableData.monthId),
                        monthName: task.isFixed ? "N/A" : months.find((op) => parseInt(op.value) === parseInt(tableData.monthId)).label,
                        labourTaskRateID: tableData.labourTaskRateID,
                        divisionID: parseInt(task.divisionID),
                        divisionName: divisions[task.divisionID],
                        fieldID: parseInt(tableData.fieldID),
                        lessRate: tableData.lessRate == '' || isNaN(tableData.lessRate) ? parseFloat(0) : parseFloat(tableData.lessRate),
                        overRate: tableData.overRate == '' || isNaN(tableData.overRate) ? parseFloat(0) : parseFloat(tableData.overRate),
                        sectionName: sectionNameForTextField
                    }]
                );
            }
            else if (!isEdit) {
                for (let item of fieldIDList) {
                    newOptionArray.push({
                        employeeTypeID: tableData.employeeTypeID,
                        employeeTypeName: tableData.employeeTypeID > 0 ? employee.filter((item, index) => index === tableData.employeeTypeID)[0] : "N/A",
                        applyMethodID: parseInt(task.measuringUnitId),
                        minRate: tableData.minRate == '' || isNaN(tableData.minRate) ? parseFloat(0) : parseFloat(tableData.minRate),
                        maxRate: tableData.maxRate == '' || isNaN(tableData.maxRate) ? parseFloat(0) : parseFloat(tableData.maxRate),
                        harvestingJobId: parseInt(tableData.harvestingJobId),
                        harvestingJobName: tableData.harvestingJobId > 0 ? harvestingJobType.filter((item, index) => index === tableData.harvestingJobId)[0] : "N/A",
                        measuringUnitId: parseInt(task.measuringUnitId),
                        measuringUnitName: task.measuringUnitId > 0 ? measuringUnitType.filter((item, index) => index === parseInt(task.measuringUnitId))[0] : "N/A",
                        measuringQuantity: tableData.measuringQuantity == '' || isNaN(tableData.measuringQuantity) ? parseFloat(0) : parseFloat(tableData.measuringQuantity),
                        maxMeasuringQuantity: tableData.maxMeasuringQuantity == '' || isNaN(tableData.maxMeasuringQuantity) ? parseFloat(0) : parseFloat(tableData.maxMeasuringQuantity),
                        allowance: tableData.allowance == '' || isNaN(tableData.allowance) ? parseFloat(0) : parseFloat(tableData.allowance),
                        gardenAllowance: tableData.gardenAllowance == '' || isNaN(tableData.gardenAllowance) ? parseFloat(0) : parseFloat(tableData.gardenAllowance),
                        defaultRate: tableData.defaultRate == '' || isNaN(tableData.defaultRate) ? parseFloat(0) : parseFloat(tableData.defaultRate),
                        defaultMRate: tableData.defaultMRate == '' || isNaN(tableData.defaultMRate) ? parseFloat(0) : parseFloat(tableData.defaultMRate),
                        defaultWRate: tableData.defaultWRate == '' || isNaN(tableData.defaultWRate) ? parseFloat(0) : parseFloat(tableData.defaultWRate),
                        isGender: tableData.isGender,
                        isRate: tableData.isRate,
                        monthId: task.isFixed ? 0 : parseInt(tableData.monthId),
                        monthName: task.isFixed ? "N/A" : months.find((op) => parseInt(op.value) === parseInt(tableData.monthId)).label,
                        labourTaskRateID: tableData.labourTaskRateID,
                        divisionID: parseInt(task.divisionID),
                        divisionName: divisions[task.divisionID],
                        fieldID: parseInt(item),
                        lessRate: tableData.lessRate == '' || isNaN(tableData.lessRate) ? parseFloat(0) : parseFloat(tableData.lessRate),
                        overRate: tableData.overRate == '' || isNaN(tableData.overRate) ? parseFloat(0) : parseFloat(tableData.overRate),
                        sectionName: fields.find((op) => parseInt(op.value) === parseInt(item)).label
                    });
                }
                if (newOptionArray.length > 0) {
                    setarrayLenght(true);
                }
                setArray(newOptionArray);
            }
        } else {
            for (let item of fieldIDList) {
                newOptionArray.push({
                    employeeTypeID: tableData.employeeTypeID,
                    employeeTypeName: tableData.employeeTypeID > 0 ? employee.filter((item, index) => index === tableData.employeeTypeID)[0] : "N/A",
                    applyMethodID: parseInt(task.measuringUnitId),
                    minRate: tableData.minRate == '' || isNaN(tableData.minRate) ? parseFloat(0) : parseFloat(tableData.minRate),
                    maxRate: tableData.maxRate == '' || isNaN(tableData.maxRate) ? parseFloat(0) : parseFloat(tableData.maxRate),
                    harvestingJobId: parseInt(tableData.harvestingJobId),
                    harvestingJobName: tableData.harvestingJobId > 0 ? harvestingJobType.filter((item, index) => index === tableData.harvestingJobId)[0] : "N/A",
                    measuringUnitId: parseInt(task.measuringUnitId),
                    measuringUnitName: task.measuringUnitId > 0 ? measuringUnitType.filter((item, index) => index === parseInt(task.measuringUnitId))[0] : "N/A",
                    measuringQuantity: tableData.measuringQuantity == '' || isNaN(tableData.measuringQuantity) ? parseFloat(0) : parseFloat(tableData.measuringQuantity),
                    maxMeasuringQuantity: tableData.maxMeasuringQuantity == '' || isNaN(tableData.maxMeasuringQuantity) ? parseFloat(0) : parseFloat(tableData.maxMeasuringQuantity),
                    allowance: tableData.allowance == '' || isNaN(tableData.allowance) ? parseFloat(0) : parseFloat(tableData.allowance),
                    gardenAllowance: tableData.gardenAllowance == '' || isNaN(tableData.gardenAllowance) ? parseFloat(0) : parseFloat(tableData.gardenAllowance),
                    defaultRate: tableData.defaultRate == '' || isNaN(tableData.defaultRate) ? parseFloat(0) : parseFloat(tableData.defaultRate),
                    defaultMRate: tableData.defaultMRate == '' || isNaN(tableData.defaultMRate) ? parseFloat(0) : parseFloat(tableData.defaultMRate),
                    defaultWRate: tableData.defaultWRate == '' || isNaN(tableData.defaultWRate) ? parseFloat(0) : parseFloat(tableData.defaultWRate),
                    isGender: tableData.isGender,
                    isRate: tableData.isRate,
                    monthId: task.isFixed ? 0 : parseInt(tableData.monthId),
                    monthName: task.isFixed ? "N/A" : months.find((op) => parseInt(op.value) === parseInt(tableData.monthId)).label,
                    labourTaskRateID: tableData.labourTaskRateID,
                    divisionID: parseInt(task.divisionID),
                    divisionName: divisions[task.divisionID],
                    fieldID: parseInt(item),
                    lessRate: tableData.lessRate == '' || isNaN(tableData.lessRate) ? parseFloat(0) : parseFloat(tableData.lessRate),
                    overRate: tableData.overRate == '' || isNaN(tableData.overRate) ? parseFloat(0) : parseFloat(tableData.overRate),
                    sectionName: fields.find((op) => parseInt(op.value) === parseInt(item)).label
                });
            }
            if (newOptionArray.length > 0) {
                setarrayLenght(true);
            }
            setArray(newOptionArray);
        }
    }

    function generateDropDownMenu(data) {
        let items = []
        if (data != null) {
            for (const [key, value] of Object.entries(data)) {
                items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
            }
        }
        return items;
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setTask({
            ...task,
            [e.target.name]: value
        });
    }

    function handleChangeCostCenter(e) {
        setFields([])
        const target = e.target;
        const value = target.value
        setTask({
            ...task,
            [e.target.name]: value
        });
    }

    function handleIsActive(e) {
        const target = e.target;
        const value = target.name === 'isActive' ? target.checked : target.value
        setTask({
            ...task,
            [e.target.name]: value
        });
    }

    function handleCheck(e) {
        const target = e.target;
        const value = target.name === 'isRate' ? target.checked : target.value
        setTableData({
            ...tableData,
            [e.target.name]: value
        });
    }

    function handleCheckisGender(e) {
        const target = e.target;
        const value = target.name === 'isGender' ? target.checked : target.value
        setTableData({
            ...tableData,
            [e.target.name]: value
        });
    }

    function handleSwitch(e) {
        const target = e.target;
        const value = target.name === 'isPlucking' ? target.checked : target.value
        setTask({
            ...task,
            [e.target.name]: value
        });
    }

    function handleIsFixed(e) {
        const target = e.target;
        const value = target.name === 'isFixed' ? target.checked : target.value
        setTask({
            ...task,
            [e.target.name]: value
        });
    }

    function handleTableSwitch(e) {
        const target = e.target;
        const value = target.checked;

        setTask({
            ...task,
            [e.target.name]: value
        });
    }

    function handleEmployeeTypeChange(e) {
        const target = e.target
        const value = target.value
        setTableData({
            ...tableData,
            [e.target.name]: parseInt(value)
        });
    }

    function handleEmployeeCategoryTypeChange(e) {
        const target = e.target
        const value = target.value
        setTask({
            ...task,
            [e.target.name]: parseInt(value)
        });
    }

    function handleTableDropDownChange(e) {
        const target = e.target
        const value = target.value
        setTableData({
            ...tableData,
            [e.target.name]: parseInt(value)
        });
    }

    function handleApplyMethodChange(value) {
        setTableData({
            ...tableData,
            applyMethodID: parseInt(value),
        });
    }

    function handleRateChange(e) {
        const target = e.target
        const value = target.value

        setTableData({
            ...tableData,
            [e.target.name]: parseFloat(value),
        });
    }

    function handlePracentageRateChange(e) {
        const target = e.target
        const value = target.value
        if (parseFloat(value) >= 0 && parseFloat(value) <= 100 || value === '') {
            setTableData({
                ...tableData,
                [e.target.name]: parseFloat(value),
            });
        }
    }

    function handleTableTextChange(e) {
        const target = e.target
        const value = target.value

        setTableData({
            ...tableData,
            [e.target.name]: value,
        });
    }

    function cardTitle(titleName) {
        return (
            <Grid container spacing={1}>
                <Grid item md={10} xs={12}>
                    {titleName}
                </Grid>
                <Grid item md={2} xs={12}>
                    <PageHeader
                        onClick={handleClick}
                        isEdit={false}
                    />
                </Grid>
            </Grid>
        )
    }

    const handleMonthChange = (selected) => {
        setSelectedMonths(selected);
    };
    const MonthDropdown = ({ options1, onChange, value }) => {
        return (
            <MultiSelect
                onChange={onChange}
                options={options}
                closeOnSelect={true}
                placeholder="-- Select Months --"
                clearable={true}
            />
        );
    };

    const handleScroll = (e) => {
        e.preventDefault();
    };

    const styles = {
        input: {
            background: '#ffffff',
            paddingRight: '20px',
        },
    };

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: task.groupID,
                            operationEntityID: task.operationEntityID,
                            productID: task.productID,
                            estateTaskID: task.estateTaskID,
                            taskCode: task.taskCode,
                            subTaskCode: task.subTaskCode,
                            taskName: task.taskName,
                            taskDescription: task.taskDescription,
                            measuringUnit: task.measuringUnit,
                            budgetExpensesCode: task.budgetExpensesCode,
                            measuringUnitId: task.measuringUnitId,
                            isPlucking: task.isPlucking,
                            isActive: task.isActive,
                            isFixed: task.isFixed,
                            divisionID: task.divisionID,
                            fieldID: task.fieldID,
                            harvestingJobId: tableData.harvestingJobId,
                            employeeCategoryTypeID: task.employeeCategoryTypeID
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().min(1, 'Business Division is required').required('Business Division is required'),
                                operationEntityID: Yup.number().min(1, 'Location is required').required('Location is required'),
                                productID: Yup.number().min(1, 'Product is required').required('Product is required'),
                                estateTaskID: Yup.number().min(1, 'Task Category is required').required('Task Category is required'),
                                employeeCategoryTypeID: Yup.number().min(1, 'Employee Category Type is required').required('Employee Category Type is required'),
                                taskCode: Yup.string().required('Task Code is required'),
                                subTaskCode: Yup.string().required('Sub Task Code is required'),
                                taskName: Yup.string().required('Task Name is required'),
                                taskDescription: Yup.string().required('Task Description is required'),
                                measuringUnitId: Yup.number().min(1, 'Measuring Unit required').required('Measuring Unit required'),
                                budgetExpensesCode: Yup.string().required('Budget Expenses Code is required')
                            })
                        }
                        onSubmit={SaveLabourTask}
                        enableReinitialize
                    >
                        {({
                            errors,
                            handleBlur,
                            handleSubmit,
                            isSubmitting,
                            touched
                        }) => (
                            <form onSubmit={handleSubmit}>
                                <Box mt={0}>
                                    <Card>
                                        <CardHeader
                                            title={cardTitle(title)}
                                        />
                                        <PerfectScrollbar>
                                            <Divider />
                                            <CardContent>
                                                <Grid container spacing={3}>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="groupID">
                                                            Business Division *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.groupID && errors.groupID)}
                                                            fullWidth
                                                            helperText={touched.groupID && errors.groupID}
                                                            name="groupID"
                                                            onChange={(e) => handleChange(e)}
                                                            size='small'
                                                            value={task.groupID}
                                                            variant="outlined"
                                                            disabled={isUpdate}
                                                            InputProps={{
                                                                readOnly: !permissionList.isGroupFilterEnabled ? true : false
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Business Division--</MenuItem>
                                                            {generateDropDownMenu(groupData)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="operationEntityID">
                                                            Location *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.operationEntityID && errors.operationEntityID)}
                                                            fullWidth
                                                            helperText={touched.operationEntityID && errors.operationEntityID}
                                                            name="operationEntityID"
                                                            onChange={(e) => handleChange(e)}
                                                            size='small'
                                                            value={task.operationEntityID}
                                                            variant="outlined"
                                                            disabled={isUpdate}
                                                            InputProps={{
                                                                readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Location--</MenuItem>
                                                            {generateDropDownMenu(factoryData)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="productID">
                                                            Product *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.productID && errors.productID)}
                                                            fullWidth
                                                            helperText={touched.productID && errors.productID}
                                                            name="productID"
                                                            onChange={(e) => handleChange(e)}
                                                            size='small'
                                                            value={task.productID}
                                                            variant="outlined"
                                                            id="productID"
                                                            disabled={isDisableButton}
                                                        >
                                                            <MenuItem value="0">--Select Product--</MenuItem>
                                                            {generateDropDownMenu(products)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="estateTaskID">
                                                            Task Category *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.estateTaskID && errors.estateTaskID)}
                                                            fullWidth
                                                            helperText={touched.estateTaskID && errors.estateTaskID}
                                                            name="estateTaskID"
                                                            onChange={(e) => handleChange(e)}
                                                            size='small'
                                                            value={task.estateTaskID}
                                                            variant="outlined"
                                                            id="estateTaskID"
                                                            disabled={isDisableButton}
                                                        >
                                                            <MenuItem value="0">--Select Task Category--</MenuItem>
                                                            {generateDropDownMenu(taskCategory)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="taskCode">
                                                            Task Code *
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.taskCode && errors.taskCode)}
                                                            fullWidth
                                                            helperText={touched.taskCode && errors.taskCode}
                                                            name="taskCode"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={task.taskCode}
                                                            variant="outlined"
                                                            disabled={isDisableButton}
                                                            size='small'
                                                        />
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="subTaskCode">
                                                            Sub Task Code *
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.subTaskCode && errors.subTaskCode)}
                                                            fullWidth
                                                            helperText={touched.subTaskCode && errors.subTaskCode}
                                                            name="subTaskCode"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={task.subTaskCode}
                                                            variant="outlined"
                                                            disabled={isDisableButton}
                                                            size='small'
                                                        />
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="taskName">
                                                            Task Name *
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.taskName && errors.taskName)}
                                                            fullWidth
                                                            helperText={touched.taskName && errors.taskName}
                                                            name="taskName"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={task.taskName}
                                                            variant="outlined"
                                                            disabled={isDisableButton}
                                                            size='small'
                                                        />
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="taskDescription">
                                                            Task Description *
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.taskDescription && errors.taskDescription)}
                                                            fullWidth
                                                            helperText={touched.taskDescription && errors.taskDescription}
                                                            name="taskDescription"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={task.taskDescription}
                                                            variant="outlined"
                                                            disabled={isDisableButton}
                                                            size='small'
                                                        />
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="budgetExpensesCode">
                                                            Budget expenses code *
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.budgetExpensesCode && errors.budgetExpensesCode)}
                                                            fullWidth
                                                            helperText={touched.budgetExpensesCode && errors.budgetExpensesCode}
                                                            name="budgetExpensesCode"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={task.budgetExpensesCode}
                                                            variant="outlined"
                                                            disabled={isDisableButton}
                                                            size='small'
                                                        />
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <Grid container spacing={3}>
                                                            <Grid item md={3} xs={12}>
                                                                <InputLabel shrink id="isFixed">
                                                                    Is Fixed
                                                                </InputLabel>
                                                                <Switch
                                                                    checked={task.isFixed}
                                                                    onChange={(e) => handleIsFixed(e)}
                                                                    name="isFixed"
                                                                    disabled={isDisableFixedButton}
                                                                />
                                                            </Grid>
                                                            <Grid item md={3} xs={12}>
                                                                <InputLabel shrink id="isPlucking">
                                                                    Plucking
                                                                </InputLabel>
                                                                <Switch
                                                                    checked={task.isPlucking}
                                                                    onChange={(e) => handleSwitch(e)}
                                                                    name="isPlucking"
                                                                    disabled={isUpdate}
                                                                />
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <div className="form-group row">
                                                            <div className="col-md">
                                                                <InputLabel shrink id="employeeCategoryTypeID">
                                                                    Employee Category Type *
                                                                </InputLabel>
                                                                <TextField select
                                                                    error={Boolean(touched.employeeCategoryTypeID && errors.employeeCategoryTypeID)}
                                                                    fullWidth
                                                                    helperText={touched.employeeCategoryTypeID && errors.employeeCategoryTypeID}
                                                                    name="employeeCategoryTypeID"
                                                                    onChange={(e) => handleEmployeeCategoryTypeChange(e)}
                                                                    size='small'
                                                                    value={task.employeeCategoryTypeID}
                                                                    variant="outlined"
                                                                >
                                                                    <MenuItem value="0">--Select Employee Category Type--</MenuItem >
                                                                    {generateDropDownMenu(employeeCategory)}
                                                                </TextField>
                                                            </div>
                                                        </div>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <div className="form-group row">
                                                            <div className="col-md">

                                                                <InputLabel shrink id="measuringUnitId">
                                                                    Measuring Unit *
                                                                </InputLabel>
                                                                <TextField select
                                                                    error={Boolean(touched.measuringUnitId && errors.measuringUnitId)}
                                                                    fullWidth
                                                                    helperText={touched.measuringUnitId && errors.measuringUnitId}
                                                                    name="measuringUnitId"
                                                                    onChange={(e) => handleChange(e)}
                                                                    size='small'
                                                                    value={task.measuringUnitId}
                                                                    variant="outlined"
                                                                    disabled={arrayLenght}
                                                                >
                                                                    <MenuItem value="0">--Select Measuring Unit--</MenuItem >
                                                                    {generateDropDownMenu(measuringUnitType)}
                                                                </TextField>
                                                            </div>
                                                        </div>
                                                    </Grid>
                                                    {task.isPlucking ?
                                                        <Grid item md={4} xs={12}>
                                                            <InputLabel shrink id="factoryJobId">
                                                                Harvesting Jobs *
                                                            </InputLabel>
                                                            <MultiSelect
                                                                options={jobs}
                                                                variant="outlined"
                                                                placeholder={"--Select Harvesting Jobs--"}
                                                                closeOnSelect={true}
                                                                disableChip
                                                                clearable={true}
                                                                onChange={handleOnchangeCategory}
                                                            />
                                                        </Grid>
                                                        : null
                                                    }
                                                </Grid>
                                                <br />
                                                <br />
                                                <br />
                                                {true ?
                                                    (
                                                        <Grid >
                                                            <Box maxWidth={true}>
                                                                <Card>
                                                                    <CardContent>
                                                                        <Grid container spacing={3}
                                                                            columnSpacing={3}
                                                                            justifyContent="space-around"
                                                                        >
                                                                            {isMultipleMonths && !task.isFixed ?
                                                                                <Grid item md={3} xs={3}>
                                                                                    <div className="form-group row">
                                                                                        <div className="col-md">
                                                                                            <InputLabel shrink id="monthId">
                                                                                                Month
                                                                                            </InputLabel>
                                                                                            <TextField select
                                                                                                fullWidth
                                                                                                name="monthId"
                                                                                                onChange={(e) => handleTableDropDownChange(e)}
                                                                                                size='small'
                                                                                                value={tableData.monthId}
                                                                                                variant="outlined"
                                                                                                disabled={isEdit}
                                                                                                InputProps={{
                                                                                                    inputProps: {
                                                                                                        readOnly: true
                                                                                                    }
                                                                                                }}
                                                                                            >
                                                                                                <MenuItem value="0">--Select Month--</MenuItem >
                                                                                                {months.map((month) => (
                                                                                                    <MenuItem key={month.value} value={month.value}>{month.label}</MenuItem>

                                                                                                ))}
                                                                                            </TextField>
                                                                                        </div>
                                                                                    </div>
                                                                                </Grid>
                                                                                :
                                                                                null
                                                                            }
                                                                            {!isMultipleMonths && !task.isFixed ?
                                                                                <Grid item md={3} xs={3} >
                                                                                    <div className="form-group row">
                                                                                        <div className="col-md">
                                                                                            <InputLabel shrink id="monthId">
                                                                                                Month
                                                                                            </InputLabel>
                                                                                            <TextField select
                                                                                                fullWidth
                                                                                                name="monthId"
                                                                                                onChange={(e) => handleTableDropDownChange(e)}
                                                                                                size='small'
                                                                                                value={tableData.monthId}
                                                                                                variant="outlined"
                                                                                                disabled={isEdit}
                                                                                            >
                                                                                                <MenuItem value="0">--Select Month--</MenuItem >
                                                                                                {months.map((month) => (
                                                                                                    <MenuItem key={month.value} value={month.value}>{month.label}</MenuItem>

                                                                                                ))}
                                                                                            </TextField>
                                                                                        </div>
                                                                                    </div>
                                                                                </Grid>
                                                                                : null
                                                                            }
                                                                            {task.isPlucking ?
                                                                                <Grid item md={3} xs={3}>
                                                                                    <div className="form-group row">
                                                                                        <div className="col-md">
                                                                                            <InputLabel shrink id="harvestingJobId">
                                                                                                Harvesting Job *
                                                                                            </InputLabel>
                                                                                            <TextField select
                                                                                                fullWidth
                                                                                                error={Boolean(touched.harvestingJobId && errors.harvestingJobId)}
                                                                                                helperText={touched.harvestingJobId && errors.harvestingJobId}
                                                                                                name="harvestingJobId"
                                                                                                onChange={(e) => handleTableDropDownChange(e)}
                                                                                                size='small'
                                                                                                disabled={isDisableButton}
                                                                                                value={tableData.harvestingJobId}
                                                                                                variant="outlined"
                                                                                            >
                                                                                                <MenuItem value="0">--Select Harvesting Job--</MenuItem >
                                                                                                {generateDropDownMenu(harvestingJobType)}
                                                                                            </TextField>
                                                                                        </div>
                                                                                    </div>
                                                                                </Grid>
                                                                                : null
                                                                            }
                                                                            <Grid item md={3} xs={12}>
                                                                                <InputLabel shrink id="divisionID">
                                                                                    Sub Division *
                                                                                </InputLabel>
                                                                                <TextField select
                                                                                    fullWidth
                                                                                    name="divisionID"
                                                                                    onChange={(e) => handleChangeCostCenter(e)}
                                                                                    value={isEdit ? tableData.divisionID : task.divisionID}
                                                                                    disabled={isDisableButton}
                                                                                    variant="outlined"
                                                                                    size='small'
                                                                                    id="divisionID"
                                                                                >
                                                                                    <MenuItem value="0">--Select Sub Division--</MenuItem>
                                                                                    {generateDropDownMenu(divisions)}
                                                                                </TextField>
                                                                            </Grid>
                                                                            {isEdit && isSectionView ?
                                                                                <Grid item md={3} xs={3}>
                                                                                    <InputLabel shrink id="fieldID">
                                                                                        Fields
                                                                                    </InputLabel>
                                                                                    <TextField
                                                                                        fullWidth
                                                                                        name="fieldID"
                                                                                        onBlur={handleBlur}
                                                                                        value={sectionNameForTextField}
                                                                                        variant="outlined"
                                                                                        disabled={isEdit}
                                                                                        size='small'
                                                                                        style={{ maxWidth: '260px' }}
                                                                                    />
                                                                                </Grid>
                                                                                :
                                                                                <Grid item md={3} xs={3}>
                                                                                    <InputLabel shrink id="fieldID">
                                                                                        Fields
                                                                                    </InputLabel>
                                                                                    <MultiSelect
                                                                                        options={fields}
                                                                                        variant="outlined"
                                                                                        placeholder={"--Select Fields--"}
                                                                                        closeOnSelect={true}
                                                                                        disableChip
                                                                                        clearable={true}
                                                                                        onChange={handleOnchangeFields}
                                                                                        style={{ maxWidth: '260px' }}
                                                                                    />
                                                                                </Grid>}
                                                                            <Grid item md={3} xs={3}>
                                                                                <div className="form-group row">
                                                                                    <div className="col-md">
                                                                                        <InputLabel shrink id="employeeTypeID">
                                                                                            Employee Type *
                                                                                        </InputLabel>
                                                                                        <TextField select
                                                                                            fullWidth
                                                                                            name="employeeTypeID"
                                                                                            onChange={(e) => handleEmployeeTypeChange(e)}
                                                                                            size='small'
                                                                                            value={tableData.employeeTypeID}
                                                                                            variant="outlined"
                                                                                        >
                                                                                            <MenuItem value="0">--Select Employee Type--</MenuItem >
                                                                                            {generateDropDownMenu(employee)}
                                                                                        </TextField>
                                                                                    </div>
                                                                                </div>
                                                                            </Grid>
                                                                            <Grid item md={3} xs={3}>
                                                                                <div className="form-group row">
                                                                                    <div className="col-md">
                                                                                        <InputLabel shrink id="measuringQuantity">
                                                                                            Measuring Quantity
                                                                                        </InputLabel>
                                                                                        <TextField
                                                                                            fullWidth
                                                                                            name="measuringQuantity"
                                                                                            id="measuringQuantity"
                                                                                            variant="outlined"
                                                                                            size='small'
                                                                                            onChange={(e) => handleRateChange(e)}
                                                                                            value={tableData.measuringQuantity}
                                                                                            onKeyDown={(evt) =>
                                                                                                (evt.key === "-") && evt.preventDefault()
                                                                                            }
                                                                                            InputProps={{
                                                                                                inputProps: {
                                                                                                    step: 0.01,
                                                                                                    type: 'number'
                                                                                                }
                                                                                            }}
                                                                                            onWheel={(e) => e.target.blur()}
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            </Grid>
                                                                            <Grid item md={3} xs={3}>
                                                                                <div className="form-group row">
                                                                                    <div className="col-md">
                                                                                        <InputLabel shrink id="maxMeasuringQuantity">
                                                                                            Max Measuring Quantity
                                                                                        </InputLabel>
                                                                                        <TextField
                                                                                            fullWidth
                                                                                            name="maxMeasuringQuantity"
                                                                                            id="maxMeasuringQuantity"
                                                                                            variant="outlined"
                                                                                            size='small'
                                                                                            onChange={(e) => handleRateChange(e)}
                                                                                            value={tableData.maxMeasuringQuantity}
                                                                                            onWheel={event => event.target.blur()}
                                                                                            onKeyDown={(evt) =>
                                                                                                (evt.key === "-") && evt.preventDefault()
                                                                                            }
                                                                                            InputProps={{
                                                                                                inputProps: {
                                                                                                    step: 0.01,
                                                                                                    type: 'number'
                                                                                                }
                                                                                            }}
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            </Grid>
                                                                            <Grid item md={3} xs={3}>
                                                                                <div className="form-group row">
                                                                                    <div className="col-md">
                                                                                        <InputLabel shrink id="allowance">
                                                                                            Allowance
                                                                                        </InputLabel>
                                                                                        <TextField
                                                                                            fullWidth
                                                                                            name="allowance"
                                                                                            id="allowance"
                                                                                            variant="outlined"
                                                                                            size='small'
                                                                                            onChange={(e) => handleRateChange(e)}
                                                                                            value={tableData.allowance}
                                                                                            onWheel={event => event.target.blur()}
                                                                                            onKeyDown={(evt) =>
                                                                                                (evt.key === "-") && evt.preventDefault()
                                                                                            }
                                                                                            InputProps={{
                                                                                                inputProps: {
                                                                                                    step: 0.01,
                                                                                                    type: 'number'
                                                                                                }
                                                                                            }}
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            </Grid>

                                                                            <Grid item md={3} xs={3}>
                                                                                <div className="form-group row">
                                                                                    <div className="col-md">
                                                                                        <InputLabel shrink id="gardenAllowance">
                                                                                            Garden Allowance
                                                                                        </InputLabel>
                                                                                        <TextField
                                                                                            fullWidth
                                                                                            name="gardenAllowance"
                                                                                            id="gardenAllowance"
                                                                                            variant="outlined"
                                                                                            size='small'
                                                                                            onChange={(e) => handleRateChange(e)}
                                                                                            value={tableData.gardenAllowance}
                                                                                            onKeyDown={(evt) =>
                                                                                                (evt.key === "-") && evt.preventDefault()
                                                                                            }
                                                                                            InputProps={{
                                                                                                inputProps: {
                                                                                                    step: 0.01,
                                                                                                    type: 'number'
                                                                                                }
                                                                                            }}
                                                                                            onWheel={event => event.target.blur()}
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            </Grid>
                                                                            <Grid item md={12} xs={3}>
                                                                                <Grid item md={3} xs={3}>
                                                                                    <div className="form-group row">
                                                                                        <div className="col-md">
                                                                                            <InputLabel shrink id="isRate">
                                                                                                Rate
                                                                                            </InputLabel>
                                                                                            <Switch
                                                                                                checked={tableData.isRate}
                                                                                                onChange={(e) => handleCheck(e)}
                                                                                                name="isRate"
                                                                                                disabled={isDisableButton}
                                                                                            />
                                                                                        </div>
                                                                                    </div>
                                                                                </Grid>
                                                                            </Grid>
                                                                            {tableData.isRate ?
                                                                                (<>
                                                                                    <Grid item md={12} xs={3}>
                                                                                        <Grid item md={4} xs={10}>
                                                                                            <InputLabel shrink id="isGender">
                                                                                                Is Gender
                                                                                            </InputLabel>
                                                                                            <Switch
                                                                                                checked={tableData.isGender}
                                                                                                onChange={(e) => handleCheckisGender(e)}
                                                                                                name="isGender"
                                                                                                disabled={isDisableButton}
                                                                                            />
                                                                                        </Grid>
                                                                                    </Grid>
                                                                                    <Grid item md={3} xs={3}>
                                                                                        <div className="form-group row" >
                                                                                            <div className="col-md">
                                                                                                <InputLabel shrink id="applyMethodID">
                                                                                                    Apply Method *
                                                                                                </InputLabel>
                                                                                                <TextField select
                                                                                                    fullWidth
                                                                                                    name="applyMethodID"
                                                                                                    disabled
                                                                                                    onChange={(e) => handleApplyMethodChange(e.target.value)}
                                                                                                    size='small'
                                                                                                    variant="outlined"
                                                                                                    value={task.measuringUnitId}

                                                                                                >
                                                                                                    <MenuItem value="0">--Apply Method --</MenuItem >
                                                                                                    {generateDropDownMenu(measuringUnitType)}
                                                                                                </TextField>
                                                                                            </div>
                                                                                        </div>
                                                                                    </Grid>
                                                                                    <Grid item md={3} xs={3}>
                                                                                        <div className="form-group row" >
                                                                                            <div className="col-md">
                                                                                                <InputLabel shrink id="defaultRate">
                                                                                                    Default Rate
                                                                                                </InputLabel>
                                                                                                <TextField
                                                                                                    fullWidth
                                                                                                    type="number"
                                                                                                    onWheel={(e) => e.target.blur()}
                                                                                                    name="defaultRate"
                                                                                                    id="defaultRate"
                                                                                                    variant="outlined"
                                                                                                    size='small'
                                                                                                    onChange={(e) => handleRateChange(e)}
                                                                                                    value={tableData.defaultRate}
                                                                                                />
                                                                                            </div>
                                                                                        </div>
                                                                                    </Grid>
                                                                                    {tableData.isGender ?
                                                                                        (
                                                                                            <Grid item md={3} xs={3}>
                                                                                                <div className="form-group row" >
                                                                                                    <div className="col-md">
                                                                                                        <InputLabel shrink id="defaultMRate">
                                                                                                            Default Rate - M
                                                                                                        </InputLabel>
                                                                                                        <TextField
                                                                                                            fullWidth
                                                                                                            type="number"
                                                                                                            onWheel={(e) => e.target.blur()}
                                                                                                            name="defaultMRate"
                                                                                                            id="defaultMRate"
                                                                                                            variant="outlined"
                                                                                                            size='small'
                                                                                                            onChange={(e) => handleRateChange(e)}
                                                                                                            value={tableData.defaultMRate}
                                                                                                        />
                                                                                                    </div>
                                                                                                </div>
                                                                                            </Grid>
                                                                                        ) : null}
                                                                                    {tableData.isGender ?
                                                                                        (
                                                                                            <Grid item md={3} xs={3}>
                                                                                                <div className="form-group row" >
                                                                                                    <div className="col-md">
                                                                                                        <InputLabel shrink id="defaultWRate">
                                                                                                            Default Rate - W
                                                                                                        </InputLabel>
                                                                                                        <TextField
                                                                                                            fullWidth
                                                                                                            type="number"
                                                                                                            onWheel={(e) => e.target.blur()}
                                                                                                            name="defaultWRate"
                                                                                                            id="defaultWRate"
                                                                                                            variant="outlined"
                                                                                                            size='small'
                                                                                                            onChange={(e) => handleRateChange(e)}
                                                                                                            value={tableData.defaultWRate}
                                                                                                        />
                                                                                                    </div>
                                                                                                </div>
                                                                                            </Grid>
                                                                                        ) : null}
                                                                                    <Grid item md={3} xs={3}>
                                                                                        <div className="form-group row" >
                                                                                            <div className="col-md">
                                                                                                <InputLabel shrink id="lessRate">
                                                                                                    Less Rate
                                                                                                </InputLabel>
                                                                                                <TextField
                                                                                                    fullWidth
                                                                                                    type="number"
                                                                                                    onWheel={(e) => e.target.blur()}
                                                                                                    name="lessRate"
                                                                                                    id="lessRate"
                                                                                                    variant="outlined"
                                                                                                    size='small'
                                                                                                    onChange={(e) => handleRateChange(e)}
                                                                                                    value={tableData.lessRate}
                                                                                                    onKeyDown={(evt) =>
                                                                                                        (evt.key === "-") && evt.preventDefault()
                                                                                                    }
                                                                                                    InputProps={{
                                                                                                        inputProps: {
                                                                                                            step: 0.01,
                                                                                                            type: 'number'
                                                                                                        }
                                                                                                    }}
                                                                                                />
                                                                                            </div>
                                                                                        </div>
                                                                                    </Grid>
                                                                                    <Grid item md={3} xs={3}>
                                                                                        <div className="form-group row" >
                                                                                            <div className="col-md">
                                                                                                <InputLabel shrink id="overRate">
                                                                                                    Over Rate
                                                                                                </InputLabel>
                                                                                                <TextField
                                                                                                    fullWidth
                                                                                                    type="number"
                                                                                                    onWheel={(e) => e.target.blur()}
                                                                                                    name="overRate"
                                                                                                    id="overRate"
                                                                                                    variant="outlined"
                                                                                                    size='small'
                                                                                                    onChange={(e) => handleRateChange(e)}
                                                                                                    value={tableData.overRate}
                                                                                                    onKeyDown={(evt) =>
                                                                                                        (evt.key === "-") && evt.preventDefault()
                                                                                                    }
                                                                                                    InputProps={{
                                                                                                        inputProps: {
                                                                                                            step: 0.01,
                                                                                                            type: 'number'
                                                                                                        }
                                                                                                    }}
                                                                                                />
                                                                                            </div>
                                                                                        </div>
                                                                                    </Grid>
                                                                                    <Grid item md={3} xs={3}>
                                                                                        <div className="form-group row" >
                                                                                            <div className="col-md">
                                                                                                <InputLabel shrink id="minRate">
                                                                                                    Rate Percentage %
                                                                                                </InputLabel>

                                                                                                <TextField
                                                                                                    fullWidth
                                                                                                    type="number"
                                                                                                    onWheel={(e) => e.target.blur()}
                                                                                                    name="minRate"
                                                                                                    id="minRate"
                                                                                                    variant="outlined"
                                                                                                    size='small'
                                                                                                    onChange={(e) => handlePracentageRateChange(e)}
                                                                                                    value={tableData.minRate}
                                                                                                />
                                                                                            </div>
                                                                                        </div>
                                                                                    </Grid>
                                                                                </>
                                                                                )
                                                                                : null}
                                                                            <br />
                                                                            <Grid
                                                                                container spacing={3}
                                                                                direction="column"
                                                                                justifyContent="flex-end"
                                                                                alignItems="flex-end"
                                                                            >
                                                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                                                    <Button
                                                                                        color="primary"
                                                                                        onClick={addTabledata}
                                                                                        variant="contained"
                                                                                        size='small'
                                                                                    >
                                                                                        ADD
                                                                                    </Button>
                                                                                </Box>
                                                                            </Grid>
                                                                            <br />
                                                                            <br />
                                                                            {array.length > 0 ? (
                                                                                <TableContainer>
                                                                                    <Table>
                                                                                        <TableHead>
                                                                                            <TableRow>
                                                                                                <TableCell>Sub Division</TableCell>
                                                                                                <TableCell>Section</TableCell>
                                                                                                {/* <TableCell>Month</TableCell> */}
                                                                                                <TableCell>Emp.Type</TableCell>
                                                                                                <TableCell>Job</TableCell>
                                                                                                <TableCell>Unit</TableCell>
                                                                                                <TableCell>Qty</TableCell>
                                                                                                <TableCell>M.Qty</TableCell>
                                                                                                <TableCell>Alw</TableCell>
                                                                                                <TableCell>G.Alw</TableCell>
                                                                                                <TableCell>Rate</TableCell>
                                                                                                <TableCell>Rate - M</TableCell>
                                                                                                <TableCell>Rate - W</TableCell>
                                                                                                <TableCell>Less.R</TableCell>
                                                                                                <TableCell>Over.R</TableCell>
                                                                                                {/* <TableCell>Rate(%)</TableCell> */}
                                                                                                <TableCell>Actions</TableCell>
                                                                                                <TableCell></TableCell>
                                                                                            </TableRow>
                                                                                        </TableHead>
                                                                                        <TableBody>
                                                                                            {array.map((row, index) => {
                                                                                                return <TableRow key={index}>
                                                                                                    <TableCell>{row.divisionName}
                                                                                                    </TableCell>
                                                                                                    <TableCell>{row.sectionName}
                                                                                                    </TableCell>
                                                                                                    {/* <TableCell>{row.monthName} */}
                                                                                                    {/* </TableCell> */}
                                                                                                    <TableCell>{row.employeeTypeName}
                                                                                                    </TableCell>
                                                                                                    <TableCell>{row.harvestingJobName == null ? 'N/A' : row.harvestingJobName}
                                                                                                    </TableCell>
                                                                                                    <TableCell>{row.measuringUnitName}
                                                                                                    </TableCell>
                                                                                                    <TableCell>{row.measuringQuantity}
                                                                                                    </TableCell>
                                                                                                    <TableCell>{row.maxMeasuringQuantity}
                                                                                                    </TableCell>
                                                                                                    <TableCell>{row.allowance}
                                                                                                    </TableCell>
                                                                                                    <TableCell>{row.gardenAllowance}
                                                                                                    </TableCell>
                                                                                                    <TableCell>{row.defaultRate}
                                                                                                    </TableCell>
                                                                                                    <TableCell>{row.defaultMRate}
                                                                                                    </TableCell>
                                                                                                    <TableCell>{row.defaultWRate}
                                                                                                    </TableCell>
                                                                                                    <TableCell>{row.lessRate}
                                                                                                    </TableCell>
                                                                                                    <TableCell>{row.overRate}
                                                                                                    </TableCell>
                                                                                                    {/* <TableCell>{row.minRate}
                                                                                                    </TableCell> */}
                                                                                                    <TableCell>
                                                                                                        <IconButton onClick={() => handleDelete(row, index)}>
                                                                                                            <Delete />
                                                                                                        </IconButton>
                                                                                                    </TableCell>
                                                                                                </TableRow>
                                                                                            })}
                                                                                        </TableBody>
                                                                                    </Table>
                                                                                </TableContainer>
                                                                            )
                                                                                : null}
                                                                        </Grid>
                                                                    </CardContent>
                                                                </Card>
                                                            </Box>
                                                        </Grid>
                                                    )
                                                    : null}
                                                <br />
                                                <br />
                                                <Grid container spacing={3}>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="isActive">
                                                            Active
                                                        </InputLabel>
                                                        <Switch
                                                            checked={task.isActive}
                                                            onChange={(e) => handleIsActive(e)}
                                                            name="isActive"
                                                            disabled={isDisableButton}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                <Button
                                                    color="primary"
                                                    disabled={isSubmitting || isDisableButton}
                                                    type="submit"
                                                    variant="contained"
                                                    size='small'
                                                >
                                                    {isUpdate == true ? "Update" : "Save"}
                                                </Button>
                                            </Box>
                                        </PerfectScrollbar>
                                    </Card>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </Container>
            </Page>
        </Fragment >
    );
};
