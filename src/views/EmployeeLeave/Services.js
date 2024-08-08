import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
  getAllGroups,
  getFactoryByGroupID,
  getleaveTypes,
  getEmployeesForDropdown,
  getEmployeeAvailability,
  getEmployeeRemainingLeaveValue,
  getAllocatedDays,
  getPermantEmployeeRegNo,
  getEmployeeDetailsByFactoryIDRegistrationNumberEPFNumber,
  getEmployeeLeaveType,
  GetDivisionDetailsByGroupID,
  SaveLeaveDetails
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

async function getFactoryByGroupID(groupID) {
  let response = await CommonGet('/api/Group/GetFactoryByGroupID', "groupID=" + parseInt(groupID));
  let factoryArray = [];
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"];
  }
  return factoryArray;
};

async function getleaveTypes(groupID) {
  let response = await CommonGet('/api/Leave/GetEmployeeLeaveType', 'groupID=' + parseInt(groupID));

  return response.data;
};

async function getEmployeesForDropdown(groupID, factoryID) {
  var employeeArray = [];
  const response = await CommonGet('/api/Manufacturing/GetEmployees', 'groupID=' + groupID + "&operationEntityID=" + factoryID)
  for (let item of Object.entries(response.data)) {
    employeeArray[item[1]["employeeID"]] = item[1]["fullName"]
  }
  return employeeArray;
}

async function SaveLeaveDetails(model) {
  const response = await CommonPost('/api/LeaveRequest/SaveLeaveDetails', null, model);
  return response;
}

async function getEmployeeAvailability(groupID, factoryID, regNo) {
  const response = await CommonGet('/api/LeaveRequest/GetEmployeeAvailability', 'groupID=' + groupID + "&factoryID=" + factoryID + "&registrationNumber=" + regNo);
  return response;
}

async function getEmployeeRemainingLeaveValue(model) {
  const response = await CommonPost('/api/LeaveRequest/GetRemaingingLeaveBalance', null, model);
  return response;
}

async function getPermantEmployeeRegNo(operationEntityID, employeeDivisionID) {
  const response = await CommonGet('/api/LeaveRequest/GetPermantEmployeeRegNo', "operationEntityID=" + parseInt(operationEntityID) + "&employeeDivisionID=" + parseInt(employeeDivisionID));
  return response.data;
}

async function getAllocatedDays(model) {
  const response = await CommonPost('/api/LeaveRequest/GetAllocatedDays', null, model);
  return response;
}

async function getEmployeeDetailsByFactoryIDRegistrationNumberEPFNumber(factoryID, regNo, epfNo) {
  const response = await CommonGet('/api/EmployeeAttendance/GetEmployeeDetailsByFactoryIDRegistrationNumberEPFNumber', 'factoryID=' + parseInt(factoryID) + "&regNo=" + regNo + "&epfNo=" + epfNo);
  return response;
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