import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
    getGroupsForDropdown,
    getEstateDetailsByGroupID,
    getTaskTypes,
    getTaskByEstateID,
    saveTask,
    updateTask,
    getTaskByEstateTaskID
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

async function getEstateDetailsByGroupID(groupID) {
    let response = await CommonGet('/api/Estate/getEstateDetailsByGroupID', 'groupID=' + parseInt(groupID));
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

async function getTaskByEstateID(groupID, estateID, taskTypeID) {
    var response = await CommonGet('/api/EstateTask/GetTaskByFilter', '&groupID=' + parseInt(groupID) + '&estateID=' + parseInt(estateID) + '&taskTypeID=' + parseInt(taskTypeID));
    return (response.data);
}

async function getTaskByEstateTaskID(estateTaskId) {
    var response = await CommonGet('/api/EstateTask/GetTaskByEstateTaskID', 'estateTaskId=' + parseInt(estateTaskId));
    return (response.data);
}

async function saveTask(task) {

    let saveModel = {
        groupID: parseInt(task.groupID),
        operationEntityID: parseInt(task.estateID),
        taskTypeID: parseInt(task.taskTypeID),
        estateTaskName: task.taskCategory,
        estateTaskDescription: task.taskDescription,
        isActive: task.isActive,
        createdBy: tokenDecoder.getUserIDFromToken(),
        createdDate: new Date().toISOString()

    }
    const response = await CommonPost('/api/EstateTask/SaveTask', null, saveModel);
    return response;
}

async function updateTask(task) {

    let updateModel = {
        estateTaskId: parseInt(task.estateTaskId),
        groupID: parseInt(task.groupID),
        operationEntityID: parseInt(task.estateID),
        taskTypeID: parseInt(task.taskTypeID),
        estateTaskName: task.taskCategory,
        estateTaskDescription: task.taskDescription,
        isActive: task.isActive,
        modifiedBy: tokenDecoder.getUserIDFromToken()

    }
    const response = await CommonPost('/api/EstateTask/UpdateTask', null, updateModel);
    return response;
}















