import { CommonGet, CommonPost } from '../../../helpers/HttpClient';

export default {
  getAllGroups,
  GetNonPluckingAttendanceDetails,
  getEstateDetailsByGroupID,
  getDivisionDetailsByEstateID,
  getAllTaskNames,
  getLabourTask
};

async function getAllGroups() {
  let response = await CommonGet('/api/Group/GetAllGroups');
  let groupArray = [];
  for (let item of Object.entries(response.data)) {
    if (item[1]["isActive"] === true) {
      groupArray[item[1]["groupID"]] = item[1]["groupName"];
    }
  }
  return groupArray;
};

async function GetNonPluckingAttendanceDetails(model) {
  let response = await CommonPost('/api/NonPluckingAttendance/GetNonPluckingAttendanceDetails', null, model);
  return response;
}

async function getEstateDetailsByGroupID(groupID) {
  let response = await CommonGet('/api/Estate/getEstateDetailsByGroupID', "groupID=" + parseInt(groupID));
  let estateArray = [];
  for (let item of Object.entries(response.data)) {
    estateArray[item[1]["estateID"]] = item[1]["estateName"];
  }
  return estateArray;
};

async function getDivisionDetailsByEstateID(estateID) {
  let response = await CommonGet('/api/Division/getDivisionDetailsByEstateID', "estateID=" + parseInt(estateID));
  let divisionArray = [];
  for (let item of Object.entries(response.data)) {
    divisionArray[item[1]["divisionID"]] = item[1]["divisionName"];
  }
  return divisionArray;
};

async function getAllTaskNames(groupID, operationEntityID) {
  const response = await CommonGet('/api/TaskTemplate/GetAllTaskNames', 'groupID=' + groupID + '&operationEntityID=' + operationEntityID);
  let array = []
  for (let item of Object.entries(response.data)) {
      array[item[1]["estateTaskId"]] = item[1]["estateTaskName"]
  }
  return array;
}

async function getLabourTask(operationEntityID, estateTaskID,) {
  const response = await CommonGet('/api/TaskTemplate/GetLabourTaskWithOutIsUpdate', 'operationEntityID=' + parseInt(operationEntityID)  + '&estateTaskID=' + parseInt(estateTaskID));
  let array = []
  for (let item of Object.entries(response.data)) {
      array[item[1]["taskID"]] = item[1]["taskName"]
  }
  return array;
}