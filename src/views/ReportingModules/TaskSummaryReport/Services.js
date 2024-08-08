import { CommonGet, CommonPost } from '../../../helpers/HttpClient';
export default {
  getAllGroups,
  getEstateDetailsByGroupID,
  getAllTaskNames,
  GetMappedProductsByFactoryID,
  GetTaskSummaryReportDetails,
  GetDivisionDetailsByGroupID,
  getDivisionDetailsByEstateID,
  getTaskTypes
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

async function getEstateDetailsByGroupID(groupID) {
  let response = await CommonGet('/api/Estate/getEstateDetailsByGroupID', "groupID=" + parseInt(groupID));
  let estateArray = [];
  for (let item of Object.entries(response.data)) {
    estateArray[item[1]["estateID"]] = item[1]["estateName"];
  }
  return estateArray;
};

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

async function GetTaskSummaryReportDetails(model) {
  const response = await CommonPost('/api/TaskReport/GetTaskSummaryReportDetails', null, model)
  return response;
}

async function GetDivisionDetailsByGroupID(groupID) {
  let response = await CommonGet('/api/Division/GetDivisionDetailsByGroupID', "groupID=" + parseInt(groupID));
  let divisionArray = [];
  for (let item of Object.entries(response.data)) {
    divisionArray[item[1]["divisionID"]] = item[1]["divisionName"];
  }
  return divisionArray;
};

async function getDivisionDetailsByEstateID(estateID) {
  let response = await CommonGet('/api/Division/getDivisionDetailsByEstateID', "estateID=" + parseInt(estateID));
  let divisionArray = [];
  for (let item of Object.entries(response.data)) {
    divisionArray[item[1]["divisionID"]] = item[1]["divisionName"];
  }
  return divisionArray;
};

async function getTaskTypes() {
  var response = await CommonGet('/api/EstateTask/GetTaskTypes', null);
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["taskTypeID"]] = item[1]["taskTypeName"]
  }
  return array;
}