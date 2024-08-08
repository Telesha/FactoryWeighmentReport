import { CommonGet, CommonPost } from '../../../helpers/HttpClient';

export default {
  getAllGroups,
  GetWorkerAttendanceReportDetails,
  getEstateDetailsByGroupID,
  getDivisionDetailsByEstateID,
  getGangDetailsByDivisionID,
  getSirderDetailsByDivisionID,
  getOperatorDetailsByDivisionID,
  getLabourTask,
  GetEmployeeTypesData,
  getSirdersForDropdown,
  GetOperatorListByDateAndGardenIDForLabourChecklistReport
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

async function GetWorkerAttendanceReportDetails(model) {
  let response = await CommonPost('/api/WorkerAttendanceReport/GetWorkerAttendanceReportDetails', null, model);
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

async function getGangDetailsByDivisionID(divisionID) {
  let response = await CommonGet('/api/Gang/getGangDetailsByDivisionID', "divisionID=" + parseInt(divisionID));
  return response.data;
};

async function getSirdersForDropdown() {
  var response = await CommonGet('/api/Employee/GetSirders', null);
  return response.data;
}

async function getSirderDetailsByDivisionID(divisionID, date) {
  const inputDate = new Date(date);
  const formattedDate = `${inputDate.getFullYear()}-${(inputDate.getMonth() + 1).toString().padStart(2, '0')}-${inputDate.getDate().toString().padStart(2, '0')} ${inputDate.getHours().toString().padStart(2, '0')}:${inputDate.getMinutes().toString().padStart(2, '0')}:${inputDate.getSeconds().toString().padStart(2, '0')}`;
  let response = await CommonGet('/api/Sirder/GetSirderListByDateAndCostCenterID', "divisionID=" + parseInt(divisionID) + "&date=" + formattedDate);
  let sirderArray = [];
  for (let item of Object.entries(response.data)) {
    sirderArray[item[1]["sirderID"]] = item[1]["sirderName"];
  }
  return sirderArray;
};

async function getOperatorDetailsByDivisionID(factoryID, date) {
  const inputDate = new Date(date);
  const formattedDate = `${inputDate.getFullYear()}-${(inputDate.getMonth() + 1).toString().padStart(2, '0')}-${inputDate.getDate().toString().padStart(2, '0')} ${inputDate.getHours().toString().padStart(2, '0')}:${inputDate.getMinutes().toString().padStart(2, '0')}:${inputDate.getSeconds().toString().padStart(2, '0')}`;
  let response = await CommonGet('/api/User/GetOperatorListByDateAndGardenID', "factoryID=" + parseInt(factoryID) + "&date=" + formattedDate);
  let operatorArray = [];
  for (let item of Object.entries(response.data)) {
    operatorArray[item[1]["operatorID"]] = item[1]["operatorName"];
  }
  return operatorArray;
};

async function getLabourTask(operationEntityID, divisionID, date) {
  const inputDate = new Date(date).toLocaleDateString();
  const response = await CommonGet('/api/TaskTemplate/GetPluckingLabourTaskByDateWorker', 'operationEntityID=' + parseInt(operationEntityID) + '&divisionID=' + parseInt(divisionID) + '&date=' + inputDate);
  return response.data;
}

async function GetEmployeeTypesData() {
  var response = await CommonGet('/api/Task/GetEmployeeTypesData', null);
  return response.data;
}

async function GetOperatorListByDateAndGardenIDForLabourChecklistReport(factoryID, date) {
  let response = await CommonGet('/api/User/GetOperatorListByDateAndGardenIDForWorkerAttendancePluckingReport', "factoryID=" + parseInt(factoryID) + "&date=" + date);
  return response.data;
};