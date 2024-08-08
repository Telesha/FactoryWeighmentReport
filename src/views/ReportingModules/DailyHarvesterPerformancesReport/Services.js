import { CommonGet, CommonPost } from '../../../helpers/HttpClient';

export default {
  getAllGroups,
  getEstateDetailsByGroupID,
  getDivisionDetailsByEstateID,
  getGangByCollectionPointID,
  GetDailyHarvesterPerformancesReport
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

async function getGangByCollectionPointID(groupId,operationEntityID, collectionPointID) {
  var gangArray = [];
  const response = await CommonGet('/api/Gang/GetGangDetailsByGroupIDEstateIDDivisionID', "groupID=" + parseInt(groupId) + '&estateID=' + parseInt(operationEntityID)+ '&divisionID=' + parseInt(collectionPointID));
  for (let item of Object.entries(response.data)) {
      gangArray[item[1]["gangID"]] = item[1]["gangName"]
  }
  return gangArray;
}


async function GetDailyHarvesterPerformancesReport(model) {
  var newModel = {
      divisionID: parseInt(model.divisionID),
      estateID: parseInt(model.estateID),
      gangID: parseInt(model.gangID),
      searchDate: model.searchDate + '-01',
  }
  const response = await CommonPost('/api/DailyHarvesterPerformancesReport/GetDailyHarvesterPerformancesReportData', null, newModel);
  return response;
}

