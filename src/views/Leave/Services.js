import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
  saveEmployeeLeaveDetails,
  getAllGroups,
  getAllFactoriesByGroupID,
  GetEmployeeLeaveDetailsByGroupFactoryRegistrationNo,
  getEmployeeDetailsByFactoryIDRegistrationNumberEPFNumber,
  getLeaveDetailsByEmployeeLeaveDetailsID,
  UpdateLeaveDetails,
  getEmployeeTypesForDropdown,
  getStatus,
  GetAllEmployeeSubCategoryMapping,
  getEmployeeLeaveType
};

async function saveEmployeeLeaveDetails(leaveDetails, userID) {
  let saveModel = {
    groupID: parseInt(leaveDetails.groupID),
    gardenID: parseInt(leaveDetails.gardenID),
    employeeID: parseInt(leaveDetails.employeeID),
    employeeTypeID: parseInt(leaveDetails.employeeTypeID),
    employeeSubCategoryMappingID: parseInt(leaveDetails.employeeSubCategoryMappingID),
    employeeName: leaveDetails.empName,
    leaveType: parseInt(leaveDetails.leaveType),
    nicNumber: leaveDetails.nic,
    allocatedDays: parseFloat(leaveDetails.noOfDays),
    registrationNumber: leaveDetails.regNo,
    createdBy: parseInt(userID),
  }
  const response = await CommonPost('/api/Leave/SaveLeaveDetails', null, saveModel);
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

async function GetEmployeeLeaveDetailsByGroupFactoryRegistrationNo(model) {
  const response = await CommonPost('/api/Leave/GetLeaveDetailsByGroupOperationEntityRegNo', null, model);
  return response;
}

async function getEmployeeDetailsByFactoryIDRegistrationNumberEPFNumber(factoryID, regNo, epfNo) {
  const response = await CommonGet('/api/EmployeeAttendance/GetEmployeeDetailsByFactoryIDRegistrationNumberEPFNumber', 'factoryID=' + parseInt(factoryID) + "&regNo=" + regNo + "&epfNo=" + epfNo);
  return response;
}

async function getLeaveDetailsByEmployeeLeaveDetailsID(employeeLeaveMasterID) {
  const response = await CommonGet('/api/Leave/GetLeaveDetailsByEmployeeID', "employeeLeaveMasterID=" + parseInt(employeeLeaveMasterID));
  return response;
}

async function UpdateLeaveDetails(leaveDetails, userID) {
  let updateModel = {
    employeeLeaveMasterID: parseInt(leaveDetails.employeeLeaveMasterID),
    allocatedDays: parseFloat(leaveDetails.noOfDays),
    modifiedBy: parseInt(userID),
  }
  const response = await CommonPost('/api/Leave/UpdateEmployeeLeaveDetails', null, updateModel);
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

async function GetAllEmployeeSubCategoryMapping() {
  var response = await CommonGet('/api/NonPluckingAmendment/GetAllEmployeeSubCategoryMapping', null);
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["employeeSubCategoryMappingID"]] = item[1]["employeeSubCategoryName"]
  }
  return array;
}

async function getStatus(id) {
  const response = await CommonGet('/api/OtherDeduction/GetAllProductOrderStatus', "id=" + parseInt(id));
  return response.data;
}

async function getEmployeeLeaveType(groupID) {
  let response = await CommonGet('/api/Leave/GetEmployeeLeaveType', 'groupID=' + parseInt(groupID));

  return response.data;
};
