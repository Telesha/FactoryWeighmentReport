import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
  getAllGroups,
  getEstateDetailsByGroupID,
  getAllFactories,
  saveGardenLeaveTypeConfigurationDetails,
  getGardenLeaveTypesByFactoryID,
  GetLeaveTypeConfigurationsByLeaveTypeConfigurationID,
  updateGardenLeaveTypeConfigurationDetails
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

async function saveGardenLeaveTypeConfigurationDetails(saveModel) {
    const response = await CommonPost('/api/GardenLeaveTypeConfiguration/SaveGardenLeaveTypeConfigurationDetails', null, saveModel);
    return response;
    }

async function getGardenLeaveTypesByFactoryID(factoryID) {
    const response = await CommonGet('/api/GardenLeaveTypeConfiguration/GetGardenLeaveTypesByFactoryID', "FactoryID=" + parseInt(factoryID));
    return response.data;
}

async function GetLeaveTypeConfigurationsByLeaveTypeConfigurationID(leaveTypeConfigurationID) {
  const response = await CommonGet('/api/GardenLeaveTypeConfiguration/GetLeaveTypeConfigurationsByLeaveTypeConfigurationID', "LeaveTypeConfigurationID=" + parseInt(leaveTypeConfigurationID));
  return response.data;
}

async function getAllFactories() {
  var factoryArray = [];
  const response = await CommonGet('/api/Factory/GetAllFactories', null);
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"];
  }
  return factoryArray;
}

async function updateGardenLeaveTypeConfigurationDetails(updateModel){
  const response = await CommonPost('/api/GardenLeaveTypeConfiguration/UpdateGardenLeaveTypeConfigurationDetails', null, updateModel);
  return response;
}