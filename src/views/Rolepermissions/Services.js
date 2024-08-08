import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {

  getPermissionNameAndScreenNameForCheckbox,
  saveRolePermission,
  getRoleDetailsByID
};


async function getPermissionNameAndScreenNameForCheckbox(loggedRoleID, assigningRoleID) {
  
  const response = await CommonGet('/api/RolePermission/GetPermissionByRoleId', 'loggedRoleID=' + parseInt(loggedRoleID) + '&assigningRoleID=' + parseInt(assigningRoleID));
   
  return response; 
}

async function saveRolePermission(unmodifiedPermissions, modifiedPermissions, roleID) {
  var requestModel = {
    unmodifiedList: unmodifiedPermissions,
    modifiedList: modifiedPermissions,
    roleID: parseInt(roleID)
  }

  const response = await CommonPost('/api/RolePermission/SaveRolePermission', null, requestModel);
  return response;
}

async function getRoleDetailsByID(roleID) {
  const response = await CommonGet('/api/Role/GetRoleDetailsByID', "roleID=" + parseInt(roleID));
  return response.data;
}
