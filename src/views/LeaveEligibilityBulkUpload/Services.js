import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
  getAllGroups,
  getAllFactoriesByGroupID,
  GetLeaveEligibilityBulkUpload,
  getEmployeeLeaveType,
  UpdateLeaveDetails,
  getEmployeeTypesForDropdown,
  getDivisionDetailsByEstateID,
  GetAllEmployeeSubCategoryMapping,
  saveDetails,
  GetLeaveEligibilityDetailByIDs,
  GetDetailsByLeaveMasterID,
  GetAllEmployeeSubCategoryMappingByTypeID
};

async function GetLeaveEligibilityBulkUpload(model) {
  const response = await CommonPost('/api/LeaveEligibilityBulkUpload/GetRegNoAndNameByIDs', null, model);
  return response.data;
}

async function getAllGroups() {
  let response = await CommonGet('/api/Factory/GetAllActiveGroups', null);
  let groupArray = []
  for (let item of Object.entries(response.data)) {
    groupArray[item[1]["groupID"]] = item[1]["groupName"]
  }
  return groupArray;
}

async function getAllFactoriesByGroupID(groupID) {
  let response = await CommonGet('/api/Factory/GetAllFactoriesByGroupID', 'groupID=' + parseInt(groupID));
  let factoryArray = []
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"]
  }
  return factoryArray;
}
async function getDivisionDetailsByEstateID(estateID) {
  let response = await CommonGet('/api/Division/getDivisionDetailsByEstateID', "estateID=" + parseInt(estateID));
  let divisionArray = [];
  for (let item of Object.entries(response.data)) {
    divisionArray[item[1]["divisionID"]] = item[1]["divisionName"];
  }
  return divisionArray;
};

async function getEmployeeLeaveType(groupID) {
  let response = await CommonGet('/api/Leave/GetEmployeeLeaveType', 'groupID=' + parseInt(groupID));
  return response.data;
}

async function getEmployeeTypesForDropdown() {
  var response = await CommonGet('/api/Task/GetEmployeeTypesData', null);
  return response.data;
}

async function GetAllEmployeeSubCategoryMappingByTypeID(employeeTypeID) {
  var response = await CommonGet('/api/Employee/GetEmployeeSubCategoryMappingByEmployeeTypeID', 'employeeTypeID=' + parseInt(employeeTypeID));
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["employeeSubCategoryMappingID"]] = item[1]["employeeSubCategoryName"]
  }
  return array;
}

async function saveDetails(dataList) {
  const response = await CommonPost('/api/LeaveEligibilityBulkUpload/SaveLeaveEligibilityDetail', null, dataList);
  return response;
}

async function UpdateLeaveDetails(model) {
  const response = await CommonPost('/api/LeaveEligibilityBulkUpload/UpdateLeaveDetails', null, model);
  return response;
}

async function GetLeaveEligibilityDetailByIDs(model) {
  const response = await CommonPost('/api/LeaveEligibilityBulkUpload/GetLeaveEligibilityDetailByIDs', null, model);
  return response;
};

async function GetDetailsByLeaveMasterID(employeeLeaveMasterID) {
  let response = await CommonPost('/api/LeaveEligibilityBulkUpload/GetDetailsByLeaveMasterID', "employeeLeaveMasterID=" + parseInt(employeeLeaveMasterID))
  return response.data;
}

async function GetAllEmployeeSubCategoryMapping() {
  var response = await CommonGet('/api/Employee/GetAllEmployeeSubCategoryMapping');
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["employeeSubCategoryMappingID"]] = item[1]["employeeSubCategoryName"]
  }
  return array;
}