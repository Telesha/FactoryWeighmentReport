import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
    GetAllGroups,
    getLabourTaskByFilter,
    GetLabourTaskByTaskID,
    SaveLabourTask,
    deleteRates,
    UpdateLabourTask,
    GetLabourRatesByTaskID,
    getAllTaskNames,
    GetEmployeeTypesData,
    getEstateDetailsByGroupID,
    getHarvestingJobType,
    getMeasuringUnit,
    GetFactoryJobs,
    GetTaskHarverstingJob,
    GetDivisionDetailsByEstateID,
    GetFieldDetailsByDivisionID,
    GetEmployeeCategoryTypesData,
    GetMappedProductsByFactoryID,
    getTaskTypes,
    getTaskNamesByOperationID,
    getTaskCodesForDropdown,
    GetTaskTemplatesByFilter
};

async function GetAllGroups() {
    let response = await CommonGet('/api/Group/GetAllGroups');
    let groupArray = [];
    for (let item of Object.entries(response.data)) {
        if (item[1]["isActive"] === true) {
            groupArray[item[1]["groupID"]] = item[1]["groupName"];
        }
    }

    return groupArray;
}

async function getEstateDetailsByGroupID(groupID) {
    let response = await CommonGet('/api/Estate/getEstateDetailsByGroupID', "groupID=" + parseInt(groupID));
    let estateArray = [];
    for (let item of Object.entries(response.data)) {
        estateArray[item[1]["estateID"]] = item[1]["estateName"];
    }

    return estateArray;
};

async function getTaskTypes() {
    var response = await CommonGet('/api/EstateTask/GetTaskTypes', null);
    let array = []
    for (let item of Object.entries(response.data)) {
        array[item[1]["taskTypeID"]] = item[1]["taskTypeName"]
    }
    return array;
}

async function getLabourTaskByFilter(model) {
    const response = await CommonPost('/api/Task/GetLabourTaskByFilter', null, model)
    return response.data;
}

async function GetLabourRatesByTaskID(taskID) {
    const response = await CommonGet('/api/Task/GetLabourRatesByTaskID', 'taskID=' + parseInt(taskID))
    return response.data;
}

async function deleteRates(labourTaskRateID, taskID) {
    const response = await CommonGet('/api/Task/DeleteLabourTaskRate', 'labourTaskRateID=' + parseInt(labourTaskRateID) + '&taskID=' + parseInt(taskID))
    return response.data;
}

async function GetLabourTaskByTaskID(taskID) {
    const response = await CommonGet('/api/Task/GetLabourTaskByTaskID', 'labourTaskID=' + parseInt(taskID))
    return response.data[0];
}

async function getAllTaskNames(groupID, operationEntityID) {
    const response = await CommonGet('/api/Task/GetAllTaskNames', 'groupID=' + groupID + '&operationEntityID=' + operationEntityID);
    let array = []
    for (let item of Object.entries(response.data)) {
        array[item[1]["estateTaskId"]] = item[1]["estateTaskName"]
    }
    return array;
}

async function GetMappedProductsByFactoryID(estateID) {
    const response = await CommonGet('/api/Product/GetMappedProductsByFactoryID', 'estateID=' + parseInt(estateID));
    let plantDistence = []
    for (let item of Object.entries(response.data)) {
        plantDistence[item[1]["productID"]] = item[1]["productName"]
    }
    return plantDistence;
}

async function GetEmployeeTypesData() {
    var response = await CommonGet('/api/Task/GetEmployeeTypesData', null);
    let array = []
    for (let item of Object.entries(response.data)) {
        array[item[1]["employeeTypeID"]] = item[1]["employeeTypeName"]
    }
    return array;
}

async function GetEmployeeCategoryTypesData() {
    var response = await CommonGet('/api/Task/GetEmployeeCategoryTypesData', null);
    let array = []
    for (let item of Object.entries(response.data)) {
        array[item[1]["employeeCategoryID"]] = item[1]["employeeCategoryName"]
    }
    return array;
}

async function getHarvestingJobType(operationEntityId) {
    var response = await CommonGet('/api/Task/GetHarvestingJobType', 'operationEntityId=' + parseInt(operationEntityId));
    let array = []
    for (let item of Object.entries(response.data)) {
        array[item[1]["haverstingJobTypeID"]] = item[1]["haverstingJobTypeName"]
    }
    return array;
}

async function getMeasuringUnit() {
    var response = await CommonGet('/api/Task/GetMeasuringUnit', null);
    let array = []
    for (let item of Object.entries(response.data)) {
        array[item[1]["measuringUnitID"]] = item[1]["measuringUnitName"]
    }
    return array;
}

async function getTaskNamesByOperationID(gardenID) {
    const response = await CommonGet('/api/Task/GetTaskNamesByOperationID', 'gardenID=' + parseInt(gardenID))
    return response.data;
}

async function GetTaskTemplatesByFilter(operationEntityID, divisionID, taskID) {
    const response = await CommonGet('/api/TaskTemplate/GetTaskTemplatesByFilter', 'estateId=' + parseInt(operationEntityID) + '&divisionID=' + parseInt(divisionID) + '&taskID=' + parseInt(taskID));
    return response.data;
}

async function SaveLabourTask(values, array, harvestingJobIdList, tableData) {
    let saveModel = {
        estateTaskID: parseInt(values.estateTaskID),
        operationEntityID: parseInt(values.operationEntityID),
        productID: parseInt(values.productID),
        divisionID: parseInt(values.divisionID),
        fieldID: parseInt(values.fieldID),
        taskCode: values.taskCode,
        taskName: values.taskName,
        taskDescription: values.taskDescription,
        measuringUnit: values.measuringUnit,
        budgetExpensesCode: values.budgetExpensesCode,
        rateList: array,
        isActive: values.isActive,
        factoryJobId: values.factoryJobId,
        measuringUnitId: parseInt(values.measuringUnitId),
        isRate: tableData.isRate,
        isGender: tableData.isGender,
        isPlucking: values.isPlucking,
        subTaskCode: values.subTaskCode,
        harvestingJobIdList: harvestingJobIdList,
        isFixed: values.isFixed,
        createdBy: parseInt(tokenDecoder.getUserIDFromToken()),
        employeeCategoryID: parseInt(values.employeeCategoryTypeID)
    }
    const response = await CommonPost('/api/Task/SaveLabourTask', null, saveModel);
    return response;
}

async function UpdateLabourTask(values, array, tableData) {
    let updateModel = {
        taskID: parseInt(values.taskID),
        estateTaskID: parseInt(values.estateTaskID),
        operationEntityID: parseInt(values.operationEntityID),
        productID: parseInt(values.productID),
        divisionID: parseInt(values.divisionID),
        fieldID: parseInt(values.fieldID),
        taskCode: values.taskCode,
        taskName: values.taskName,
        taskDescription: values.taskDescription,
        measuringUnit: values.measuringUnit,
        budgetExpensesCode: values.budgetExpensesCode,
        rateList: array,
        modifiedBy: parseInt(tokenDecoder.getUserIDFromToken()),
        isActive: values.isActive,
        isPlucking: values.isPlucking,
        subTaskCode: values.subTaskCode,
        isFixed: values.isFixed,
        measuringUnitId: parseInt(values.measuringUnitId),
        isGender: tableData.isGender,
        employeeCategoryID: parseInt(values.employeeCategoryTypeID)
    }
    const response = await CommonPost('/api/Task/UpdateLabourTask', null, updateModel);
    return response;
}
async function GetFactoryJobs(factoryId) {
    var response = await CommonGet('/api/Task/GetFactoryJobs', 'factoryId=' + parseInt(factoryId));
    return response.data;
}

async function GetTaskHarverstingJob(taskID) {
    var response = await CommonGet('/api/Task/GetTaskHarverstingJob', 'taskId=' + parseInt(taskID));
    let array = []
    for (let item of Object.entries(response.data)) {
        array[item[1]["harvestingJobMasterID"]] = item[1]["jobName"]
    }
    return array;
}

async function GetDivisionDetailsByEstateID(estateID) {
    let response = await CommonGet('/api/Division/getDivisionDetailsByEstateID', "estateID=" + parseInt(estateID));
    let divisionArray = [];
    for (let item of Object.entries(response.data)) {
        divisionArray[item[1]["divisionID"]] = item[1]["divisionName"];
    }
    return divisionArray;
};

async function GetFieldDetailsByDivisionID(divisionID) {
    let response = await CommonGet('/api/Field/GetFieldDetailsByDivisionIDActiveTaskScreen', "divisionID=" + parseInt(divisionID));
    return response.data;
};

async function getTaskCodesForDropdown() {
    const response = await CommonGet('/api/TaskTemplate/GetAllTaskCodes', null)
    return response.data;
}



