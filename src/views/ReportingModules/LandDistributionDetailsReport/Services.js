import { CommonGet, CommonPost } from '../../../helpers/HttpClient';

export default {
  getMasterGroupsForDropdown,
  GetLandDistributionDetailsReport
};

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

async function GetLandDistributionDetailsReport(masterGroupID) {
  const response = await CommonGet('/api/LandDistributionDetailsReport/GetLandDistributionDetailsReport', 'masterGroupID=' + parseInt(masterGroupID))
  return response;

}
