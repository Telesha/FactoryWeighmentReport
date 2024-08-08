import { CommonGet, CommonPost } from '../../../helpers/HttpClient';
export default {
  getAllGroups,
  GetTaskDetails,
  getEstateDetailsByGroupID,
  getDivisionDetailsByEstateID,
  getEmployeeTypesForDropdown,
  getEmployeeCategoriesForDropdown,
  getDesignationsByEmployeeCategoryID,
  getGangDetailsByDivisionID,
  GetAllEmployeeSubCategoryMapping,
  GetMappedProductsByFactoryID,
  getAllTaskNames,
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

async function GetTaskDetails(groupID, operationEntityId, productID, estateTaskID, taskTypeID, employeeCategoryID) {
  let response = await CommonGet('/api/Task/GetTaskDetails', 'groupID=' + parseInt(groupID) + '&operationEntityId='
    + parseInt(operationEntityId) + '&productID=' + parseInt(productID) + '&estateTaskID=' + parseInt(estateTaskID)
    + '&taskTypeID=' + parseInt(taskTypeID) + '&employeeCategoryID=' + parseInt(employeeCategoryID))
  return response.data;
}

async function getEstateDetailsByGroupID(groupID) {
  var factoryArray = [];
  const response = await CommonGet('/api/Group/GetFactoryByGroupID', 'groupID=' + groupID)
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"]
  }
  return factoryArray;
};

async function getDivisionDetailsByEstateID(estateID) {
  let response = await CommonGet('/api/Division/getDivisionDetailsByEstateID', "estateID=" + parseInt(estateID));
  let divisionArray = [];
  for (let item of Object.entries(response.data)) {
    divisionArray[item[1]["divisionID"]] = item[1]["divisionName"];
  }
  return divisionArray;
};

async function getEmployeeTypesForDropdown() {
  var response = await CommonGet('/api/Task/GetEmployeeTypesData', null);
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["employeeTypeID"]] = { name: item[1]["employeeTypeName"], code: item[1]["employeeTypeCode"] }
  }
  return array;
}

async function getEmployeeCategoriesForDropdown() {
  var response = await CommonGet('/api/Employee/GetEmployeeCategories', null);
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["employeeCategoryID"]] = { name: item[1]["employeeCategoryName"], code: item[1]["employeeCategoryCode"] }
  }
  return array;
}

async function getDesignationsByEmployeeCategoryID() {
  let response = await CommonGet('/api/Employee/GetDesignationsByEmployeeCategoryID');
  let designationArray = []
  for (let item of Object.entries(response.data)) {
    designationArray[item[1]["designationID"]] = item[1]["designationName"]
  }
  return designationArray;
}

async function getGangDetailsByDivisionID(divisionID) {
  let response = await CommonGet('/api/Gang/getGangDetailsByDivisionID', "divisionID=" + parseInt(divisionID));
  let gangArray = [];
  for (let item of Object.entries(response.data)) {
    gangArray[item[1]["gangID"]] = item[1]["gangName"];
  }
  return gangArray;
};

async function GetAllEmployeeSubCategoryMapping() {
  var response = await CommonGet('/api/Employee/GetAllEmployeeSubCategoryMapping');
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["employeeSubCategoryMappingID"]] = item[1]["employeeSubCategoryName"]
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

async function getAllTaskNames(groupID, operationEntityId) {
  const response = await CommonGet('/api/Task/GetAllTaskNames', 'groupID=' + groupID + '&operationEntityID=' + operationEntityId);
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["estateTaskId"]] = item[1]["estateTaskName"]
  }
  return array;
}

async function getTaskTypes() {
  var response = await CommonGet('/api/EstateTask/GetTaskTypes', null);
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["taskTypeID"]] = item[1]["taskTypeName"]
  }
  return array;
}
