import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
  getAllGroups,
  getFactoryByGroupID,
  getleaveTypes,
  getEmployeesForDropdown,
  SaveLeaveFormDetails,
  getEmployeeAvailability,
  GetAllLeaveBulkRequestDetails,
  GetBulkLeaveRequestDetailsByLeaveRefNo,
  getEmployeeLeaveFormDetailsByLeaveRefNo,
  getEmployeeLeaveForPDFByEmployeeLeaveRequestID,
  updateLeaveFormDetails,
  getEmployeeRemainingLeaveValue,
  SaveRejectedBulkLeaveRequest,
  SaveApprovedLeaveRequest,
  employeeDetailsForLeavePayment,
  getStatus,
  getAllocatedDays,
  getPermantEmployeeRegNo,
  getDivisionDetailsByEstateID,
  getGangDetailsByDivisionID,
  getEmployeeReligions,
  SaveSendToApprove,
  SaveApproveBulkLeaveRequest,
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

async function getGangDetailsByDivisionID(divisionID) {
  let response = await CommonGet('/api/Gang/getGangDetailsByDivisionID', "divisionID=" + parseInt(divisionID));
  let gangArray = [];
  for (let item of Object.entries(response.data)) {
    gangArray[item[1]["gangID"]] = item[1]["gangName"];
  }
  return gangArray;
};

async function getEmployeeReligions() {
  var response = await CommonGet('/api/Employee/GetEmployeeReligions', null)
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["religionID"]] = item[1]["religionName"]
  }
  return array;
}

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

async function GetAllLeaveBulkRequestDetails(model) {
  const response = await CommonPost('/api/EmployeeLeaveBulk/GetAllLeaveBulkRequestDetails', null, model);
  return response;
}

async function GetBulkLeaveRequestDetailsByLeaveRefNo(LeaveRefNo) {
  const response = await CommonGet('/api/EmployeeLeaveBulk/GetBulkLeaveRequestDetailsByLeaveRefNo', 'LeaveRefNo=' + parseInt(LeaveRefNo));
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

async function getEmployeeRemainingLeaveValue(leaveTypeID, regNo) {
  let model = {
    LeaveTypeID: leaveTypeID,
    RegistrationNumber: regNo
  }
  const response = await CommonPost('/api/LeaveRequest/GetRemaingingLeaveBalance', null, model);
  return response;
}

async function SaveRejectedBulkLeaveRequest(model) {
  const response = await CommonPost('/api/EmployeeLeaveBulk/SaveRejectedBulkLeaveRequest', null, model);
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

async function getPermantEmployeeRegNo(model) {
  const response = await CommonPost('/api/EmployeeLeaveBulk/GetEmployeeDetailsForLeaveBulk', null, model);
  return response.data;
}

async function getAllocatedDays(leaveTypeID, regNo) {
  let model = {
    LeaveTypeID: leaveTypeID,
    RegistrationNumber: regNo
  }
  const response = await CommonPost('/api/LeaveRequest/GetAllocatedDays', null, model);
  return response;
}

async function SaveSendToApprove(model) {
  const response = await CommonPost('/api/EmployeeLeaveBulk/SaveLeaveRequestBulk', null, model);
  return response;
}

async function SaveApproveBulkLeaveRequest(model) {
  const response = await CommonPost('/api/EmployeeLeaveBulk/SaveApproveBulkLeaveRequest', null, model);
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