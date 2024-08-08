import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import moment from 'moment';

export default {
  SaveNonPluckingAttendance,
  getDivisionDetailsByEstateID,
  getAllGroups,
  getAllFactoriesByGroupID,
  getEmployeeDetailsByFactoryIDRegistrationNumber,
  getEmployeeTypesForDropdown,
  getStatus,
  getSirdersForDropdown,
  getOperatorsForDropdown,
  getTaskNamesByOperationID,
  getFieldDetailsByDivisionID,
  getRatesQuntitiesByTaskID
};

async function SaveNonPluckingAttendance(otherDeductionDetails) {
  let array = otherDeductionDetails
  const response = await CommonPost('/api/NonPluckingManualAttendance/SaveNonPluckingAttendance', null, array);
  return response;
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

async function getEmployeeDetailsByFactoryIDRegistrationNumber(factoryID, regNo) {
  const response = await CommonGet('/api/OtherDeduction/GetEmployeeDetailsByFactoryIDRegistrationNumber', 'factoryID=' + parseInt(factoryID) + "&regNo=" + regNo);
  return response;
}

async function getEmployeeTypesForDropdown() {
  var response = await CommonGet('/api/Task/GetEmployeeTypesData', null);
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["employeeTypeID"]] = { name: item[1]["employeeTypeName"], code: item[1]["employeeTypeCode"] }
  }
  return array;
}

async function getStatus(id) {
  const response = await CommonGet('/api/OtherDeduction/GetAllProductOrderStatus', "id=" + parseInt(id));
  return response.data;
}

async function getSirdersForDropdown() {
  var response = await CommonGet('/api/Employee/GetSirders', null);
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["employeeID"]] = { name: item[1]["employeeName"], code: item[1]["employeeCode"] }
  }
  return array;
}

async function getOperatorsForDropdown() {
  var response = await CommonGet('/api/NonPluckingManualAttendance/GetOperatorsByDateForNonPluckAttend', null);
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["userID"]] = { name: item[1]["userName"] }
  }
  return array;
}

async function getTaskNamesByOperationID(gardenID) {
  const response = await CommonGet('/api/Task/GetTaskNamesByOperationID', 'gardenID=' + parseInt(gardenID))
  return response.data;
}

async function getFieldDetailsByDivisionID(divisionID) {
  let response = await CommonGet('/api/Field/getFieldDetailsByDivisionID', "divisionID=" + parseInt(divisionID));
  let fieldArray = [];
  for (let item of Object.entries(response.data)) {
    fieldArray[item[1]["fieldID"]] = item[1]["fieldName"];
  }
  return fieldArray;
};

async function getRatesQuntitiesByTaskID(taskID) {
  const response = await CommonGet('/api/NonPluckingManualAttendance/GetRatesQuntitiesByTaskID', 'taskID=' + taskID);
  return response;
}