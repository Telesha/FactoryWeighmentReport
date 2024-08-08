import { CommonGet, CommonPost } from '../../../helpers/HttpClient';

export default {
  getAllGroups,
  getEstateDetailsByGroupID,
  getDivisionDetailsByEstateID,
  GetLeaveDetails,
  GetAllEmployeeSubCategoryMapping,
  getEmployeeLeaveType,
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

async function GetLeaveDetails(model) {
  let response = await CommonPost('/api/LeaveHistory/GetLeaveHistoryDetailsForReport', null, model);
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

async function GetAllEmployeeSubCategoryMapping() {
  var response = await CommonGet('/api/NonPluckingAmendment/GetAllEmployeeSubCategoryMapping', null);
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["employeeSubCategoryMappingID"]] = item[1]["employeeSubCategoryName"]
  }
  return array;
}

async function getEmployeeLeaveType(groupID) {
  let response = await CommonGet('/api/Leave/GetEmployeeLeaveType', 'groupID=' + parseInt(groupID));
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