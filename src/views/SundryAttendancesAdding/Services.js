import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
  getAllGroups,
  getEstateDetailsByGroupID,
  getDivisionDetailsByEstateID,
  GetDailyCropDetails,
  GetSundryAttendanceEmployeeDetailsByEmpNo,
  getFieldDetailsByDivisionID,
  saveEmployeeSundryAttendance
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

async function getFieldDetailsByDivisionID(divisionID) {
  let response = await CommonGet('/api/Field/getFieldDetailsByDivisionID', "divisionID=" + parseInt(divisionID));
  let fieldArray = [];
  for (let item of Object.entries(response.data)) {
    fieldArray[item[1]["fieldID"]] = item[1]["fieldName"];
  }
  return fieldArray;
};

async function GetDailyCropDetails(groupID, factoryID, routeID, date, registrationNumber) {
  let response = await CommonGet('/api/DailyCropDetails/GetDailyCropDetails', 'groupID=' + groupID + '&factoryID=' + factoryID + '&routeID=' + routeID + '&date=' + date + '&registrationNumber=' + registrationNumber);
  return response;
}

async function GetSundryAttendanceEmployeeDetailsByEmpNo(estateID, empNo) {
  let response = await CommonGet('/api/EmployeeSundryAttendance/GetSundryAttendanceEmployeeDetailsByEmpNo', 'estateID=' + parseInt(estateID) + '&empNo=' + empNo);
  return response;
}

async function saveEmployeeSundryAttendance(data) {
  const response = await CommonPost('/api/EmployeeSundryAttendance/SaveEmployeeSundryAttendance', null, data);
  return response;
}
