import { CommonGet, CommonPost } from '../../../helpers/HttpClient';

export default {
  getAllGroups,
  GetEmployeeTypesData,
  getEstateDetailsByGroupID,
  getDivisionDetailsByEstateID,
  getLabourTask,
  GetDailyKatchaReportDetails,
  GetAllEmployeeSubCategoryMapping,
  GetDivisionDetailsByGroupID
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

async function GetEmployeeTypesData() {
  var response = await CommonGet('/api/Task/GetEmployeeTypesData', null);
  return response.data;
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

async function getLabourTask(operationEntityID, divisionID, date) {
  const inputDate = new Date(date);
  const formattedDate = `${inputDate.getFullYear()}-${(inputDate.getMonth() + 1).toString().padStart(2, '0')}-${inputDate.getDate().toString().padStart(2, '0')} ${inputDate.getHours().toString().padStart(2, '0')}:${inputDate.getMinutes().toString().padStart(2, '0')}:${inputDate.getSeconds().toString().padStart(2, '0')}`;
  const response = await CommonGet('/api/TaskTemplate/GetPluckingRateForKatchaByDate', 'operationEntityID=' + parseInt(operationEntityID) + '&divisionID=' + parseInt(divisionID) + '&date=' + formattedDate);
  return response.data;
}

async function GetDailyKatchaReportDetails(model) {
  let response = await CommonPost('/api/DailyKatchaReport/GetDailyKatchaReportDetails', null, model);
  return response;
}

async function GetAllEmployeeSubCategoryMapping() {
  var response = await CommonGet('/api/NonPluckingAmendment/GetAllEmployeeSubCategoryMapping', null);
  return response.data;
}

async function GetDivisionDetailsByGroupID(groupID) {
  let response = await CommonGet('/api/Division/GetDivisionDetailsByGroupID', "groupID=" + parseInt(groupID));
  let divisionArray = [];
  for (let item of Object.entries(response.data)) {
    divisionArray[item[1]["divisionID"]] = item[1]["divisionName"];
  }
  return divisionArray;
};