import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
  SaveRationConfiguration,
  GetAllGroups,
  getAllFactoriesByGroupID,
  GetRationConfiguration,
  UpdateRationConfiguration,
  getEmployeeTypesForDropdown,
  getEstateDetailsByGroupID,
  GetRationConfigurationByRationConfigurationID
};

async function SaveRationConfiguration(rationConfigDetails, userID) {
  let saveModel = {
    groupID: parseInt(rationConfigDetails.groupID),
    operationEntityID: parseInt(rationConfigDetails.operationEntityID),
    employeeTypeID: parseInt(rationConfigDetails.employeeTypeID),
    employeeEntitleQntity: isNaN(parseFloat(rationConfigDetails.employeeEntitleQntity)) ? 0 : parseFloat(rationConfigDetails.employeeEntitleQntity),
    spouseEntitleQntity: isNaN(parseFloat(rationConfigDetails.spouseEntitleQntity)) ? 0 : parseFloat(rationConfigDetails.spouseEntitleQntity),
    under8EntitleQntity: isNaN(parseFloat(rationConfigDetails.under8EntitleQntity)) ? 0 : parseFloat(rationConfigDetails.under8EntitleQntity),
    between8to12EntitleQntity: isNaN(parseFloat(rationConfigDetails.between8to12EntitleQntity)) ? 0 : parseFloat(rationConfigDetails.between8to12EntitleQntity),
    seniorCitizenEntitleQntity: isNaN(parseFloat(rationConfigDetails.seniorCitizenEntitleQntity)) ? 0 : parseFloat(rationConfigDetails.seniorCitizenEntitleQntity),
    perKgRate: isNaN(parseFloat(rationConfigDetails.perKgRate)) ? 0 : parseFloat(rationConfigDetails.perKgRate),
    createdBy: parseInt(userID),
    isActive: rationConfigDetails.isActive,
  }
  const response = await CommonPost('/api/RationConfiguration/SaveRationConfiguration', null, saveModel);
  return response;
}

async function GetAllGroups() {
  let response = await CommonGet('/api/Factory/GetAllActiveGroups', null);
  let groupArray = []
  for (let item of Object.entries(response.data)) {
    groupArray[item[1]["groupID"]] = item[1]["groupName"]
  }
  return groupArray;
}

async function getAllFactoriesByGroupID(groupID) {
  let response = await CommonGet('/api/Factory/GetAllFactoriesByGroupID', 'groupID=' + parseInt(groupID));
  let factoryArray = []
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"]
  }
  return factoryArray;
}

async function GetRationConfiguration(model) {
  const response = await CommonPost('/api/RationConfiguration/GetRationConfiguration', null, model);
  return response;
}

async function GetRationConfigurationByRationConfigurationID(rationID) {
  const response = await CommonGet('/api/RationConfiguration/GetRationConfigurationByRationConfigurationID', 'rationConfigurationID=' + parseInt(rationID));
  return response;
}

async function UpdateRationConfiguration(rationConfigDetails, userID) {
  let updateModel = {
    rationConfigurationID: parseInt(rationConfigDetails.rationConfigurationID),
    groupID: parseInt(rationConfigDetails.groupID),
    operationEntityID: parseInt(rationConfigDetails.operationEntityID),
    employeeTypeID: parseInt(rationConfigDetails.employeeTypeID),
    employeeEntitleQntity: isNaN(parseFloat(rationConfigDetails.employeeEntitleQntity)) ? 0 : parseFloat(rationConfigDetails.employeeEntitleQntity),
    spouseEntitleQntity: isNaN(parseFloat(rationConfigDetails.spouseEntitleQntity)) ? 0 : parseFloat(rationConfigDetails.spouseEntitleQntity),
    under8EntitleQntity: isNaN(parseFloat(rationConfigDetails.under8EntitleQntity)) ? 0 : parseFloat(rationConfigDetails.under8EntitleQntity),
    between8to12EntitleQntity: isNaN(parseFloat(rationConfigDetails.between8to12EntitleQntity)) ? 0 : parseFloat(rationConfigDetails.between8to12EntitleQntity),
    seniorCitizenEntitleQntity: isNaN(parseFloat(rationConfigDetails.seniorCitizenEntitleQntity)) ? 0 : parseFloat(rationConfigDetails.seniorCitizenEntitleQntity),
    perKgRate: isNaN(parseFloat(rationConfigDetails.perKgRate)) ? 0 : parseFloat(rationConfigDetails.perKgRate),
    modifiedBy: parseInt(userID),
    isActive: rationConfigDetails.isActive,
  }
  const response = await CommonPost('/api/RationConfiguration/UpdateRationConfiguration', null, updateModel);
  return response;
}

async function getEmployeeTypesForDropdown() {
  var response = await CommonGet('/api/Task/GetEmployeeTypesData', null);
  return response.data;
}

async function getEstateDetailsByGroupID(groupID) {
  let response = await CommonGet('/api/Estate/getEstateDetailsByGroupID', "groupID=" + parseInt(groupID));
  let estateArray = [];
  for (let item of Object.entries(response.data)) {
    estateArray[item[1]["estateID"]] = item[1]["estateName"];
  }
  return estateArray;
};


