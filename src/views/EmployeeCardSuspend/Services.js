import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
    getAllGroups,
    getEstateDetailsByGroupID,
    getDivisionDetailsByEstateID,
    getCardSuspendDetails,
    updateSuspendCard,
    updateInactiveCard,
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

  async function getCardSuspendDetails(groupID,estateID,divisionID,employeeTypeID) {
    const res = await CommonGet('/api/EmployeeCardManagement/GetEmployeeCardsToSuspendORInactive', 'groupID=' + groupID + '&estateID='+ estateID + '&divisionID='+ divisionID +'&employeeTypeID=' + employeeTypeID);
    return res.data;
}

async function updateSuspendCard(cardSuspendUpdate) {
  const response = await CommonPost('/api/EmployeeCardManagement/UpdateEmployeeCardToSuspend', null, cardSuspendUpdate);
  return response;
}

async function updateInactiveCard(cardSuspendUpdate) {
  const response = await CommonPost('/api/EmployeeCardManagement/UpdateEmployeeCardToInactive', null, cardSuspendUpdate);
  return response;
}
