import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
    getGroupsForDropdown,
    getfactoriesForDropDown,
    getEstateDetailsByGroupID,
    getAllTaskNames,
    getLabourTask,
    getFeildsByTemplateID,
    filterFields,
    GetTaskTemplatesByFilter,
    GetTaskTemplateByTaskTemplateID,
    SaveTaskTemplate,
    UpdateTaskTemplate,
    getRoutesByFactoryID,
    getDivisionDetailsByEstateID,
    getTaskCodesForDropdown,
    getTaskNamesByOperationID
};

async function getGroupsForDropdown() {
    var groupArray = [];
    const response = await CommonGet('/api/Group/GetAllGroups', null)
    for (let item of Object.entries(response.data)) {
        if (item[1]["isActive"] === true) {
            groupArray[item[1]["groupID"]] = item[1]["groupName"]
        }
    }
    return groupArray;
}

async function getTaskCodesForDropdown() {
    const response = await CommonGet('/api/TaskTemplate/GetAllTaskCodes', null)
    return response.data;
}

async function getfactoriesForDropDown(groupID) {
    var factoryArray = [];

    const response = await CommonGet('/api/Group/GetFactoryByGroupID', 'groupID=' + groupID)
    for (let item of Object.entries(response.data)) {
        factoryArray[item[1]["factoryID"]] = item[1]["factoryName"]
    }
    return factoryArray;
}

async function getEstateDetailsByGroupID(groupID) {
    let response = await CommonGet('/api/Estate/getEstateDetailsByGroupID', 'groupID=' + parseInt(groupID));
    let estateArray = [];
    for (let item of Object.entries(response.data)) {

        estateArray[item[1]["estateID"]] = item[1]["estateName"];
    }

    return estateArray;
};

async function getAllTaskNames(groupID, operationEntityID) {
    const response = await CommonGet('/api/TaskTemplate/GetAllTaskNames', 'groupID=' + groupID + '&operationEntityID=' + operationEntityID);
    let array = []
    for (let item of Object.entries(response.data)) {
        array[item[1]["estateTaskId"]] = item[1]["estateTaskName"]
    }
    return array;
}

async function getLabourTask(operationEntityID, divisionID, estateTaskID, isUpdate) {
    const response = await CommonGet('/api/TaskTemplate/GetLabourTask', 'operationEntityID=' + parseInt(operationEntityID) + '&divisionID=' + parseInt(divisionID) + '&estateTaskID=' + parseInt(estateTaskID) + '&isUpdate=' + isUpdate);
    let array = []
    for (let item of Object.entries(response.data)) {
        array[item[1]["taskID"]] = item[1]["taskName"]
    }
    return array;
}

async function getFeildsByTemplateID(taskTemplateID) {
    const response = await CommonGet('/api/Field/GetFieldsByTaskTemplateID', 'taskTemplateID=' + taskTemplateID);
    return response.data;
}

async function filterFields(groupID, operationEntityID, divisionID) {
    var filterModel = {
        groupID: parseInt(groupID),
        operationEntityID: parseInt(operationEntityID),
        collectionPointID: parseInt(divisionID)
    }
    const response = await CommonPost('/api/Field/FilterFields', null, filterModel);
    return response.data;
}

async function GetTaskTemplatesByFilter(operationEntityID, divisionID, taskID) {
    const response = await CommonGet('/api/TaskTemplate/GetTaskTemplatesByFilter', 'estateId=' + parseInt(operationEntityID) + '&divisionID=' + parseInt(divisionID) + '&taskID=' + parseInt(taskID));
    return response.data;
}

async function GetTaskTemplateByTaskTemplateID(employeeTaskTemplateID) {
    const response = await CommonGet('/api/TaskTemplate/GetTaskTemplateByTaskTemplateID', 'employeeTaskTemplateID=' + employeeTaskTemplateID);
    return response.data;
}

async function getRoutesByFactoryID(factoryID) {
    const response = await CommonGet('/api/Route/GetRoutesByFactoryID', "factoryID=" + parseInt(factoryID));
    return response.data;
}

async function getDivisionDetailsByEstateID(estateID) {
    const response = await CommonGet('/api/Division/getDivisionDetailsByEstateID', 'estateID=' + parseInt(estateID));
    let array = []
    for (let item of Object.entries(response.data)) {
        array[item[1]["divisionID"]] = item[1]["divisionName"]
    }
    return array;
}


async function SaveTaskTemplate(task, fields, expirationDate, circulationMonths) {
    let saveModel = {
        groupID: parseInt(task.groupID),
        operationEntityID: parseInt(task.operationEntityID),
        divisionID: parseInt(task.divisionID),
        estateTaskID: parseInt(task.estateTaskID),
        taskExpiration: expirationDate,
        numberOfWorkers: parseInt(task.numberOfWorkers),
        circulation: circulationMonths,
        sundryTask: parseInt(task.taskID),
        fieldsModel: fields,
        isActive: task.isActive,
        createdBy: parseInt(tokenDecoder.getUserIDFromToken())
    }
    const response = await CommonPost('/api/TaskTemplate/SaveTaskTemplate', null, saveModel);
    return response;
}

async function UpdateTaskTemplate(task, fields, expirationDate, circulationMonths) {
    let updateModel = {
        employeeTaskTemplateID: parseInt(task.employeeTaskTemplateID),
        groupID: parseInt(task.groupID),
        operationEntityID: parseInt(task.operationEntityID),
        divisionID: parseInt(task.divisionID),
        estateTaskID: parseInt(task.estateTaskID),
        taskExpiration: expirationDate,
        numberOfWorkers: parseInt(task.numberOfWorkers),
        circulation: circulationMonths,
        sundryTask: parseInt(task.taskID),
        fieldsModel: fields,
        isActive: task.isActive,
        modifiedBy: parseInt(tokenDecoder.getUserIDFromToken())
    }
    const response = await CommonPost('/api/TaskTemplate/Update', null, updateModel);
    return response;
}

async function getTaskNamesByOperationID(gardenID) {
    const response = await CommonGet('/api/Task/GetTaskNamesByOperationID', 'gardenID=' + parseInt(gardenID))
    return response.data;
}