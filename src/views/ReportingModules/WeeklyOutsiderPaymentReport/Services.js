import { CommonGet, CommonPost } from '../../../helpers/HttpClient';

export default {
  getAllGroups,
  GetDailyLabourDetails,
  getEstateDetailsByGroupID,
  getDivisionDetailsByEstateID,
  getEmployeeTypesForDropdown,
  getGangDetailsByDivisionID,
  GetOperatorListByDateAndGardenIDForWeeklyOutsiderPaymentReportReport,
  getBookDetailsByEmployeeTypeForDropDown,
  completePayment
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
  let response = await CommonPost('/api/WeeklyOutisderPaymentReport/GetWeeklyOutsiderPaymentReportData', null, model);
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
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["employeeTypeID"]] = { name: item[1]["employeeTypeName"], code: item[1]["employeeTypeCode"] }
  }
  return array;
}

async function getGangDetailsByDivisionID(costCenterID) {
  let response = await CommonGet('/api/Gang/getGangDetailsByDivisionID', "divisionID=" + parseInt(costCenterID));
  return response.data;
};

async function getBookDetailsByEmployeeTypeForDropDown() {
  let response = await CommonGet('/api/Book/GetBookDetailsByEmployeeTypeForDropDown', null);
  return response.data;
};

async function GetOperatorListByDateAndGardenIDForWeeklyOutsiderPaymentReportReport(factoryID, date) {
  let response = await CommonGet('/api/User/GetOperatorListByDateAndGardenIDForWeeklyOutsiderPaymentReportReport', "factoryID=" + parseInt(factoryID) + "&date=" + date);
  return response.data;
};

async function completePayment(model) {
  let response = await CommonPost('/api/WeeklyOutisderPaymentReport/CompletePayment', null, model);
  return response;
}
