import { getDate } from 'date-fns';
import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
  getAllGroups,
  getEstateDetailsByGroupID,
  getDivisionDetailsByEstateID,
  getFieldDetailsByDivisionIDAndProductID,
  getEmployeeTypesForDropdown,
  getTaskNamesByOperationID,
  getFieldDetailsByDivisionIDForEdit,
  getTaskNamesByOperationIDForEdit,
  getEmployeeTypesForDropdownForEdit,
  getAllFactoriesByGroupID,
  GetEmployeeDetailsAndPluckingAttendance,
  GetMobileAccessibleUsersOperationEntityID,
  GetDivisionDetailsByGroupID,
  GetTaskNamesByProductID,
  GetPluckingTaskNamesByTaskCode,
  getPluckingTaskNamesByPayPointID,
  GetEmployeeDetailsByRegistrationNumber,
  savePluckingAmendmentDetails,
  GetMappedProductsByDivisionID,
  getFieldDetailsByDivisionID,
  getPluckingAmendmentData,
  UpdatePluckingAmendmentData,
  DeletePluckingAmendmentData
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

async function getDivisionDetailsByEstateID(estateID) {
  let response = await CommonGet('/api/Division/getDivisionDetailsByEstateID', "estateID=" + parseInt(estateID));
  let divisionArray = [];
  for (let item of Object.entries(response.data)) {
    divisionArray[item[1]["divisionID"]] = item[1]["divisionName"];
  }
  return divisionArray;
};

async function getFieldDetailsByDivisionIDAndProductID(divisionID, productID) {
  const response = await CommonGet('/api/Field/GetFieldDetailsByDivisionIDAndProductID', 'productID=' + parseInt(productID) + "&divisionID=" + parseInt(divisionID));
  let fieldArray = [];
  for (let item of Object.entries(response.data)) {
    fieldArray[item[1]["fieldID"]] = item[1]["fieldName"];
  }
  return fieldArray;
};

async function getEmployeeTypesForDropdown() {
  var response = await CommonGet('/api/Task/GetEmployeeTypesData', null);
  return response.data;
}

async function getTaskNamesByOperationID(gardenID) {
  const response = await CommonGet('/api/Task/GetTaskNamesByOperationID', 'gardenID=' + parseInt(gardenID))
  return response.data;
}

async function GetTaskNamesByProductID(productID) {
  const response = await CommonGet('/api/Task/GetTaskNamesByProductID', 'productID=' + parseInt(productID))
  return response.data;
}

async function GetPluckingTaskNamesByTaskCode(taskCode) {
  const response = await CommonGet('/api/Task/GetPluckingTaskNamesByTaskCode', 'taskCode=' + taskCode)
  return response;
}

async function getFieldDetailsByDivisionIDForEdit(divisionID) {
  let response = await CommonGet('/api/Field/getFieldDetailsByDivisionID', "divisionID=" + parseInt(divisionID));
  let estateArray = [];
  for (let item of Object.entries(response.data)) {
    estateArray[item[1]["fieldID"]] = item[1]["fieldName"];
  }
  return estateArray;
};

async function getEmployeeTypesForDropdownForEdit() {
  var response = await CommonGet('/api/Task/GetEmployeeTypesData', null);
  let estateArray = [];
  for (let item of Object.entries(response.data)) {
    estateArray[item[1]["employeeTypeID"]] = item[1]["employeeTypeName"];
  }
  return estateArray;
}

async function savePluckingAmendmentDetails(model) {
  const response = await CommonPost('/api/PluckingAmendment/SavePluckingAmendmentDetails', null, model);
  return response;
}

async function getAllFactoriesByGroupID(groupID) {
  let response = await CommonGet('/api/Factory/GetAllFactoriesByGroupID', 'groupID=' + parseInt(groupID));
  let factoryArray = []
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"]
  }
  return factoryArray;
}

async function getTaskNamesByOperationIDForEdit(gardenID) {
  const response = await CommonGet('/api/Task/GetTaskNamesByOperationID', 'gardenID=' + parseInt(gardenID))
  let estateArray = [];
  for (let item of Object.entries(response.data)) {
    estateArray[item[1]["taskID"]] = item[1]["taskName"];
  }
  return estateArray;
}

async function GetEmployeeDetailsAndPluckingAttendance(model) {
  const response = await CommonPost('/api/PluckingManualAttendance/GetEmployeeDetailsAndPluckingAttendance', null, model);
  return response;
}

async function GetMobileAccessibleUsersOperationEntityID(gardenID) {
  let response = await CommonGet('/api/User/GetMobileAccessibleUsersOperationEntityID', 'operationEntityID=' + parseInt(gardenID));
  let mobileUsersArray = [];
  for (let item of Object.entries(response.data)) {
    mobileUsersArray[item[1]["userID"]] = {
      firstName: item[1]["firstName"], lastName: item[1]["lastName"]
    };
  }
  return mobileUsersArray;
}

async function GetDivisionDetailsByGroupID(groupID) {
  let response = await CommonGet('/api/Division/GetDivisionDetailsByGroupID', "groupID=" + parseInt(groupID));
  let divisionArray = [];
  for (let item of Object.entries(response.data)) {
    divisionArray[item[1]["divisionID"]] = item[1]["divisionName"];
  }
  return divisionArray;
};

async function getPluckingTaskNamesByPayPointID(payPointID) {
  const response = await CommonGet('/api/Task/GetPluckingTaskNamesByPayPointID', 'payPointID=' + parseInt(payPointID))
  return response.data;
}

async function GetEmployeeDetailsByRegistrationNumber(regNo){
  const response = await CommonGet('/api/Employee/GetEmployeeDetailsByRegistrationNumber', 'registrationNumber='+ parseInt(regNo))
  return response.data;
}

async function GetMappedProductsByDivisionID(divisionID) {
  const response = await CommonGet('/api/Product/GetMappedProductsByDivisionID', 'divisionID=' + parseInt(divisionID));
  let plantDistence = []
  for (let item of Object.entries(response.data)) {
    plantDistence[item[1]["productID"]] = item[1]["productName"]
  }
  return plantDistence;
}

async function getFieldDetailsByDivisionID(divisionID) {
  let response = await CommonGet('/api/Field/getFieldDetailsByDivisionID', "divisionID=" + parseInt(divisionID));
  return response.data;
};

async function getPluckingAmendmentData(model) {
  let response = await CommonPost('/api/PluckingAmendment/GetPluckingAmendmentDetails', null, model);
  return response.data;
}

async function UpdatePluckingAmendmentData(model){
  let response = await CommonPost('/api/PluckingAmendment/UpdatePluckingAmendmentData', null, model)
  return response;
}
async function DeletePluckingAmendmentData(model){
  let response = await CommonPost('/api/PluckingAmendment/DeletePluckingAmendmentData', null, model)
  return response;
}