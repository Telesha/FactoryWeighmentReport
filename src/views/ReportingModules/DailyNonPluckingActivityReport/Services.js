import { CommonGet, CommonPost } from '../../../helpers/HttpClient';

export default {
  getAllGroups,
  GetDailyNonPluckingDetails,
  getEstateDetailsByGroupID,
  getDivisionDetailsByEstateID,
  GetFactoryJobs,
  getEmployeeTypesForDropdown,
  getGangDetailsByDivisionID,
  GetOperatorListByDateAndGardenIDForLabourChecklistReport,
  getSirdersForDropdown
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

async function GetDailyNonPluckingDetails(model) {
  let response = await CommonPost('/api/DailyNonPluckingActivityReport/GetDailyNonPluckingActivityReportData', null, model);
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

async function GetFactoryJobs(factoryId) {
  var response = await CommonGet('/api/Task/GetFactoryJobs', 'factoryId=' + parseInt(factoryId));
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["harvestingJobMasterID"]] = item[1]["jobName"]
  }
  return array;
}

async function getGangDetailsByDivisionID(costCenterID) {
  let response = await CommonGet('/api/Gang/getGangDetailsByDivisionID', "divisionID=" + parseInt(costCenterID));
  return response.data;
};

async function GetOperatorListByDateAndGardenIDForLabourChecklistReport(factoryID, date) {
  let response = await CommonGet('/api/User/GetOperatorListByDateAndGardenIDForWorkerAttendanceNonPluckingReport', "factoryID=" + parseInt(factoryID) + "&date=" + date);
  return response.data;
};

async function getEmployeeTypesForDropdown() {
  var response = await CommonGet('/api/Task/GetEmployeeTypesData', null);
  return response.data;
}

async function getSirdersForDropdown() {
  var response = await CommonGet('/api/Employee/GetSirders', null);
  return response.data;
}
