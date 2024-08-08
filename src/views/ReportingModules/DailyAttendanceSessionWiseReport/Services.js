import { CommonGet, CommonPost } from '../../../helpers/HttpClient';

export default {
  getAllGroups,
  GetDetails,
  getEstateDetailsByGroupID,
  getDivisionDetailsByEstateID,
  GetFactoryJobs,
  getLabourTask,
  GetFieldDetailsByDivisionID,
  getGangDetailsByDivisionID
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

async function GetDetails(model) {
  let response = await CommonPost('/api/DailyAttendanceSessionWise/GetDailyAttendanceSessionWiseReportDetails', null, model);
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

async function GetFactoryJobs(factoryId, date) {
  var response = await CommonGet('/api/Task/GetFactoryJobsByDate', 'factoryId=' + parseInt(factoryId) + '&pluckingDate=' + new Date(date).toISOString());
  return response.data;
}

async function getLabourTask(operationEntityID, divisionID, date) {
  const response = await CommonGet('/api/TaskTemplate/GetPluckingLabourTaskByDate', 'operationEntityID=' + parseInt(operationEntityID) + '&divisionID=' + parseInt(divisionID) + '&pluckingDate=' + new Date(date).toISOString());
  return response.data;
}

async function GetFieldDetailsByDivisionID(costCenterID, date) {
  let response = await CommonGet('/api/Field/getFieldDetailsByDivisionIDDate', "divisionID=" + parseInt(costCenterID) + '&pluckingDate=' + new Date(date).toISOString());
  return response.data;
}

async function getGangDetailsByDivisionID(costCenterID, date) {
  let response = await CommonGet('/api/Gang/getGangDetailsByDivisionIDDate', "divisionID=" + parseInt(costCenterID) + '&pluckingDate=' + new Date(date).toISOString());
  return response.data;
};