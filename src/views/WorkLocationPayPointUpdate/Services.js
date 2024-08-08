import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
  getAllGroups,
  getAllFactoriesByGroupID,
  GetEmpDetailsByIDs,
  getDivisionDetailsByEstateID,
  GetAllEmployeeSubCategoryMapping,
  UpdateWorkLocationPayPoint,
  GetDivisionDetailsByGroupID
};

async function GetEmpDetailsByIDs(model) {
  const response = await CommonPost('/api/WorkLocationPayPointUpdate/GetEmpDetailsByIDs', null, model);
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

async function UpdateWorkLocationPayPoint(dataList) {
  const response = await CommonPost('/api/WorkLocationPayPointUpdate/UpdateWorkLocationPayPoint', null, dataList);
  return response;
}

async function GetAllEmployeeSubCategoryMapping() {
  var response = await CommonGet('/api/Employee/GetAllEmployeeSubCategoryMapping');
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["employeeSubCategoryMappingID"]] = item[1]["employeeSubCategoryName"]
  }
  return array;
}

async function GetDivisionDetailsByGroupID(groupID) {
  let response = await CommonGet('/api/Division/GetDivisionDetailsByGroupID', "groupID=" + parseInt(groupID));
  let divisionArray = [];
  for (let item of Object.entries(response.data)) {
    divisionArray[item[1]["divisionID"]] = item[1]["divisionName"];
  }
  return divisionArray;
};