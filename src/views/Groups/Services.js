import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  GetAllGroups,
  getGroupDetailsByID,
  updateGroup,
  saveGroup
};

async function GetAllGroups() {
  const response = await CommonGet('/api/MasterGroup/GetAllMasterGroups', null);
  return response.data;
}

async function getGroupDetailsByID(masterGroupID) {
  const response = await CommonGet('/api/MasterGroup/GetMasterGroupDetailsByID', "masterGroupID=" + parseInt
    (masterGroupID));
  return response.data;
}

async function updateGroup(group) {
  let updateModel = {
    MasterGroupID: parseInt(group.masterGroupID),
    MasterGroupName: group.masterGroupName.toString(),
    MasterGroupCode: group.masterGroupCode.toString(),
    ShortCode: group.shortCode.toUpperCase(),
    IsActive: group.isActive,
    ModifiedBy: tokenDecoder.getUserIDFromToken(),
    ModifiedDate: new Date().toISOString(),
  }
  const response = await CommonPost('/api/MasterGroup/UpdateMasterGroup', null, updateModel);
  return response;
}

async function saveGroup(group) {
  let saveModel = {
    MasterGroupID: 0,
    MasterGroupName: group.masterGroupName.toString(),
    MasterGroupCode: group.masterGroupCode.toString(),
    ShortCode: group.shortCode.toUpperCase(),
    IsActive: Boolean(group.isActive),
    CreatedBy: tokenDecoder.getUserIDFromToken(),
    CreatedDate: new Date(),
  }
  const response = await CommonPost('/api/MasterGroup/SaveMasterGroup', null, saveModel);
  return response;
}