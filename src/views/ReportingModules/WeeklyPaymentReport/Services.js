import { CommonGet, CommonPost } from '../../../helpers/HttpClient';

export default {
  getAllGroups,
  GetDailyLabourDetails,
  getEstateDetailsByGroupID,
  getDivisionDetailsByEstateID,
  getEmployeeTypesForDropdown,
  getGangDetailsByDivisionID,
  getLeaveDeatils,
  getBookDetailsForDropDown,
  completePayment,
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

async function GetDailyLabourDetails(model) {
  let response = await CommonPost('/api/WeeklyPaymentReport/GetWeeklyPaymentReportData', null, model);
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

async function getEmployeeTypesForDropdown() {
  var response = await CommonGet('/api/Task/GetEmployeeTypesData', null);
  return response.data;
}

async function GetAllEmployeeSubCategoryMapping() {
  var response = await CommonGet('/api/NonPluckingAmendment/GetAllEmployeeSubCategoryMapping', null);
  return response.data;
}

async function getGangDetailsByDivisionID(costCenterID) {
  let response = await CommonGet('/api/Gang/getGangDetailsByDivisionID', "divisionID=" + parseInt(costCenterID));
  return response.data;
};

async function getLeaveDeatils(employeeID) {
  let response = await CommonGet('/api/WeeklyPaymentReport/GetEmployeeLeaveDetails', "employeeID=" + parseInt(employeeID));
  return response.data[0];
}

async function getBookDetailsForDropDown() {
  let response = await CommonGet('/api/Book/GetBookDetailsForDropDown', null);
  return response.data;
};

async function completePayment(model) {
  let response = await CommonPost('/api/WeeklyPaymentReport/CompletePayment', null, model);
  return response;
}

async function GetDivisionDetailsByGroupID(groupID) {
  let response = await CommonGet('/api/Division/GetDivisionDetailsByGroupID', "groupID=" + parseInt(groupID));
  let divisionArray = [];
  for (let item of Object.entries(response.data)) {
    divisionArray[item[1]["divisionID"]] = item[1]["divisionName"];
  }
  return divisionArray;
};