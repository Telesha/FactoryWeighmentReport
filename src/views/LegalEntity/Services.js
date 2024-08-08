import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  GetAllLegalEntities,
  saveLegalEntity,
  getLegalEntityDetailsByID,
  updateLegalEntity,
  getMasterGroupsForDropdown,
  getGroupsByMasterGroupID
};

async function GetAllLegalEntities() {
  const response = await CommonGet('/api/Group/GetAllGroups', null);
  return response.data;
}

async function saveLegalEntity(group) {

  let saveModel = {
    groupID: 0,
    groupName: group.groupName,
    groupCode: group.groupCode,
    shortCode: group.shortCode,
    isActive: group.isActive,
    createdBy: tokenDecoder.getUserIDFromToken(),
    createdDate: new Date().toISOString(),
    masterGroupID: parseInt(group.masterGroupID)
  }

  const response = await CommonPost('/api/Group/SaveGroup', null, saveModel);
  return response;
}
async function updateLegalEntity(group) {


  let updateModel = {
    groupID: parseInt(group.groupID),
    groupName: group.groupName,
    groupCode: group.groupCode,
    shortCode: group.shortCode,
    isActive: group.isActive,
    modifiedBy: tokenDecoder.getUserIDFromToken(),
    modifiedDate: new Date().toISOString(),

  }
  const response = await CommonPost('/api/Group/UpdateGroup', null, updateModel);
  return response;
}

async function getLegalEntityDetailsByID(groupID) {
  const response = await CommonGet('/api/Group/getGroupDetailsByID', "groupID=" + parseInt(groupID));
  return response.data;
}
async function getMasterGroupsForDropdown() {
  var groupArray = [];
  const response = await CommonGet('/api/MasterGroup/GetAllMasterGroups', null)
  for (let item of Object.entries(response.data)) {
    if (item[1]["isActive"] === true) {
      groupArray[item[1]["masterGroupID"]] = item[1]["masterGroupName"]
    }
  }
  return groupArray;
}

async function getGroupsByMasterGroupID(masterGroupID) {
  const response = await CommonGet('/api/Group/GetGroupsByMasterGroupID', 'masterGroupID=' + parseInt(masterGroupID))
  return response.data;
}