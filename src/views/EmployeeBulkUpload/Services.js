import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  getAllGroups,
  getEstateDetailsByGroupID,
  getDivisionDetailsByEstateID,
  saveEmployeeBulkUpload,
  getEmployeeTypes,
  getEmployeeCategory,
  getAvailableCardCount
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

async function saveEmployeeBulkUpload(dataBulk) {
  const response = await CommonPost('/api/Employee/SaveEmployeeBulk', null, dataBulk);
  
  return response;
}

async function getEmployeeTypes() {
  let response = await CommonGet('/api/Employee/GetEmployeeTypes');
  return response;
}
async function getEmployeeCategory() {
  let response = await CommonGet('/api/Employee/GetEmployeeCategory');
  return response;
}

async function getAvailableCardCount() {
  const response = await CommonGet('/api/Employee/GetAvailableCardCount');
  return response;
}
