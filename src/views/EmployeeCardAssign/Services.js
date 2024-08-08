import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
  saveEmpCard,
  getEmployeeDetailsByEmployeeID,
  getEmployeeDetailsByGroupIDEstateIDDivisionID,
  getAllGroups,
  getEstateDetailsByGroupID,
  getDivisionDetailsByEstateID,
  getCardDetailsByGroupIDEstateIDDivisionID
};

async function getAllGroups() {
  let response = await CommonGet('/api/Factory/GetAllActiveGroups', null);
  let groupArray = []
  for (let item of Object.entries(response.data)) {
    groupArray[item[1]["groupID"]] = item[1]["groupName"]
  }
  return groupArray;
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

async function saveEmpCard(saveModel) {
  const response = await CommonPost('/api/EmployeeCardManagement/SaveEmpCard', null, saveModel);
  return response;
}


async function getEmployeeDetailsByEmployeeID(employeeID) {
  const response = await CommonGet('/api/Employee/GetEmployeeDetailsToCardPrintByEmployeeID', "employeeID=" + parseInt(employeeID));
  return response;
}

async function getEmployeeDetailsByGroupIDEstateIDDivisionID(groupID, estateID, divisionID) {
  const response = await CommonGet('/api/Employee/GetEmployeeDetailsByGroupIDEstateIDDivisionID', 'groupID=' + parseInt(groupID) + "&estateID=" + parseInt(estateID) + '&divisionID=' + parseInt(divisionID));
  return response.data;
}

async function getCardDetailsByGroupIDEstateIDDivisionID(groupID, estateID, divisionID) {
    const response = await CommonGet('/api/EmployeeCardManagement/GetCardDetailsByGroupIDEstateIDDivisionID', 'groupID=' + parseInt(groupID) + "&estateID=" + parseInt(estateID) + '&divisionID=' + parseInt(divisionID));
    let cardArray = []
    for (let item of Object.entries(response.data)) {
        cardArray[item[1]["cardID"]] = item[1]["cardNumber"]
    }
  return cardArray;
  }






