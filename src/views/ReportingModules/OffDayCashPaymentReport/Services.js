import { CommonGet, CommonPost } from '../../../helpers/HttpClient';

export default {
  getAllGroups,
  GetOffDayCashPaymentDetails,
  getEstateDetailsByGroupID,
  getDivisionDetailsByEstateID,
  GetFieldDetailsByDivisionID,
  GetEmployeeTypesData,
  getGangDetailsByDivisionID,
  GetOperatorListByDateAndGardenIDFromOffDayCashPlucking,
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

async function GetOffDayCashPaymentDetails(model) {
  let response = await CommonPost('/api/OffDayCashPaymentReport/GetOffDayCashPaymentDetails', null, model);
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

async function GetFieldDetailsByDivisionID(costCenterID) {
  let response = await CommonGet('/api/Field/getFieldDetailsByDivisionID', "divisionID=" + parseInt(costCenterID));
  return response.data;
}

async function GetEmployeeTypesData() {
  var response = await CommonGet('/api/Task/GetEmployeeTypesData', null);
  return response.data;
}

async function getGangDetailsByDivisionID(costCenterID) {
  let response = await CommonGet('/api/Gang/getGangDetailsByDivisionID', "divisionID=" + parseInt(costCenterID));
  return response.data;
};

async function GetOperatorListByDateAndGardenIDFromOffDayCashPlucking(factoryID, date) {
  let response = await CommonGet('/api/User/GetOperatorListByDateAndGardenIDFromOffDayCashPlucking', "factoryID=" + parseInt(factoryID) + "&date=" + date);
  return response.data;
};


