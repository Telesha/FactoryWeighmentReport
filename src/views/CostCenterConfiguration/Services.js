import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  getAllGroups,
  getEstateDetailsByGroupID,
  getDivisionDetailsByEstateID,
  getConfugarationForDropdown,
  getMeasuringUnit,
  saveConfiguration,
  updateConfiguration,
  getConfigurationDataByConfigurationID,
  getConfigurationDataByCostCenterID
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

async function getConfugarationForDropdown(gardenID, isUpdate) {
  let response = await CommonGet('/api/CostCenterConfiguration/GetAllConfigurationMasterForDropDown', "gardenID=" + parseInt(gardenID) + "&isUpdate=" + isUpdate);
  let configurationArray = [];
  for (let item of Object.entries(response.data)) {
    configurationArray[item[1]["configurationMasterID"]] = item[1]["configurationMasterName"];
  }
  return configurationArray;
};

async function getMeasuringUnit() {
  var response = await CommonGet('/api/Task/GetMeasuringUnit', null);
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["measuringUnitID"]] = item[1]["measuringUnitName"]
  }
  return array;
}

async function getConfigurationDataByConfigurationID(configurationID) {
  const response = await CommonGet('/api/CostCenterConfiguration/GetConfigurationDataByConfigurationID', "configurationID=" + parseInt(configurationID));
  return response.data;
}

async function saveConfiguration(model) {
  const response = await CommonPost('/api/CostCenterConfiguration/SaveConfiguration', null, model);
  return response;
}

async function updateConfiguration(model) {
  const response = await CommonPost('/api/CostCenterConfiguration/UpdateConfiguration', null, model);
  return response;
}

async function getConfigurationDataByCostCenterID(groupID, gardenID, costCenterID) {
  const response = await CommonGet('/api/CostCenterConfiguration/GetConfigurationDataByCostCenterID', 'groupID=' + parseInt(groupID) + "&gardenID=" + parseInt(gardenID) + '&costCenterID=' + parseInt(costCenterID));
  return response.data;
}


