import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
  getAllGroups,
  getFactoryByGroupID,
  getleaveTypes,
  getEmployeesForDropdown,
  SaveLeaveFormDetails,
  getEmployeeAvailability,
  getAllLeaveRequestDetailsByGroupFactory,
  getEmployeeLeaveFormDetailsByEmployeeLeaveRequestID,
  getEmployeeLeaveFormDetailsByLeaveRefNo,
  getEmployeeLeaveForPDFByEmployeeLeaveRequestID,
  updateLeaveFormDetails,
  getEmployeeRemainingLeaveValue,
  SaveRejectedLeaveRequest,
  SaveApprovedLeaveRequest,
  employeeDetailsForLeavePayment,
  getStatus,
  getAllocatedDays,
  getPermantEmployeeRegNo,
  getDivisionDetailsByEstateID,
  GetAllEmployeeSubCategoryMapping,
  getEmployeeDetailsByFactoryIDRegistrationNumberEPFNumber,
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

async function getFactoryByGroupID(groupID) {
  let response = await CommonGet('/api/Group/GetFactoryByGroupID', "groupID=" + parseInt(groupID));
  let factoryArray = [];
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"];
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

async function SaveLeaveFormDetails(model) {
  const response = await CommonPost('/api/LeaveRequest/SaveLeaveRequestDetails', null, model);
  return response;
}

async function updateLeaveFormDetails(model) {
  const response = await CommonPost('/api/LeaveRequest/UpdateLeaveFormDetails', null, model);
  return response;
}

async function getEmployeeAvailability(groupID, factoryID, regNo) {
  const response = await CommonGet('/api/LeaveRequest/GetEmployeeAvailability', 'groupID=' + groupID + "&factoryID=" + factoryID + "&registrationNumber=" + regNo);
  return response;
}

async function getAllLeaveRequestDetailsByGroupFactory(model) {
  const response = await CommonPost('/api/LeaveRequest/GetAllShortLeaveApprovalDetails', null, model);
  return response;
}

async function getEmployeeLeaveFormDetailsByEmployeeLeaveRequestID(LeaveRefNo) {
  const response = await CommonGet('/api/LeaveRequest/GetLeaveRequestDetailsByEmployeeLeaveRequestID', 'LeaveRefNo=' + parseInt(LeaveRefNo));
  return response.data;
}

async function getEmployeeLeaveFormDetailsByLeaveRefNo(LeaveRefNo) {
  const response = await CommonGet('/api/LeaveRequest/GetEmployeeLeaveFormDetailsByLeaveRefNo', 'LeaveRefNo=' + parseInt(LeaveRefNo));
  return response;
}

async function getEmployeeLeaveForPDFByEmployeeLeaveRequestID(employeeLeaveRequestID) {
  const response = await CommonGet('/api/LeaveRequest/GetEmployeeLeaveForPDFByEmployeeLeaveRequestID', 'employeeLeaveRequestID=' + parseInt(employeeLeaveRequestID));
  return response;
}

async function getEmployeeRemainingLeaveValue(model) {
  const response = await CommonPost('/api/LeaveRequest/GetRemaingingLeaveBalance', null, model);
  return response;
}

async function SaveRejectedLeaveRequest(model) {
  const response = await CommonPost('/api/LeaveRequest/SaveRejectedLeaveRequest', null, model);
  return response;
}

async function SaveApprovedLeaveRequest(model) {
  const response = await CommonPost('/api/LeaveRequest/SaveApproveLeaveRequest', null, model);
  return response;
}

async function employeeDetailsForLeavePayment(regNo, isPlucking, createdBy, fromDate, toDate, employeeLeaveRequestID) {
  const response = await CommonGet('/api/LeaveRequest/EmployeeDetailsForLeavePayment', 'registrationNumber=' + regNo + "&isPlucking=" +
    isPlucking + "&createdBy=" + parseInt(createdBy) + "&fromDate=" + fromDate + "&toDate=" + toDate + "&employeeLeaveRequestID=" + employeeLeaveRequestID);
  return response;
}

async function getStatus(id) {
  const response = await CommonGet('/api/OtherDeduction/GetAllProductOrderStatus', "id=" + parseInt(id));
  return response.data;
}

async function getPermantEmployeeRegNo(operationEntityID, employeeDivisionID) {
  const response = await CommonGet('/api/LeaveRequest/GetPermantEmployeeRegNo', "operationEntityID=" + parseInt(operationEntityID) + "&employeeDivisionID=" + parseInt(employeeDivisionID));
  return response.data;
}

async function getAllocatedDays(model) {
  const response = await CommonPost('/api/LeaveRequest/GetAllocatedDays', null, model);
  return response;
}

async function GetAllEmployeeSubCategoryMapping() {
  var response = await CommonGet('/api/NonPluckingAmendment/GetAllEmployeeSubCategoryMapping', null);
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["employeeSubCategoryMappingID"]] = item[1]["employeeSubCategoryName"]
  }
  return array;
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