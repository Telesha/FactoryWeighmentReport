import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
  saveRoleMobileMenu,
  getReloMobileMenuDetailsByRoleMobileMenuID,
  updateRoleMobileMenu,
  getRoleMobileMenuDetails,
  getAllGroups,
  getEstateDetailsByGroupID,
  getRoleDetailsByGroupFactory,
  getAllMobileMenus,
  getAllVerificationtypes
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

async function getRoleDetailsByGroupFactory(groupID, estateID) {
  let response = await CommonGet('/api/Role/GetRoleDetailsByGroupIDFactoryID', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(estateID));
  let roleArray = [];
  for (let item of Object.entries(response.data)) {
    roleArray[item[1]["roleID"]] = item[1]["roleName"];
  }
  return roleArray;
};

async function saveRoleMobileMenu(saveModel) {
  const response = await CommonPost('/api/RoleMobileMenu/SaveRoleMobileMenu', null, saveModel);
  return response;
}

async function updateRoleMobileMenu(model) {
  const response = await CommonPost('/api/RoleMobileMenu/UpdateRoleMobileMenu', null, model);
  return response;
}

async function getReloMobileMenuDetailsByRoleMobileMenuID(roleMobileMenuID) {
  const response = await CommonGet('/api/RoleMobileMenu/GetReloMobileMenuDetailsByRoleMobileMenuID', "roleMobileMenuID=" + parseInt(roleMobileMenuID));
  return response.data;
}

async function getRoleMobileMenuDetails(groupID, estateID, roleID) {
  const response = await CommonGet('/api/RoleMobileMenu/GetRoleMobileMenuByGroupFactoryRole', 'groupID=' + parseInt(groupID) + "&estateID=" + parseInt(estateID) + '&roleID=' + parseInt(roleID))
  return response.data;
}

async function getAllMobileMenus(groupID, estateID, roleID, isUpdate) {
  let response = await CommonGet('/api/MobileMenu/GetMobileMenuDetails', 'groupID=' + parseInt(groupID) + "&estateID=" + parseInt(estateID) + '&roleID=' + parseInt(roleID) + '&isUpdate=' + isUpdate);
  let groupArray = []
  for (let item of Object.entries(response.data)) {
    groupArray[item[1]["mobileMenuID"]] = item[1]["menuName"]
  }
  return groupArray;
}

async function getAllVerificationtypes() {
  let response = await CommonGet('/api/MobileMenu/GetAllVerificationTypes', null);
  let verificationArray = []
  for (let item of Object.entries(response.data)) {
    verificationArray[item[1]["menuVerificationTypeID"]] = item[1]["menuVerificationTypeName"]
  }
  return verificationArray;
}






