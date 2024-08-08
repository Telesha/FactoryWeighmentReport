import { CommonGet, CommonPost } from '../../../helpers/HttpClient';

export default {
  getAllGroups,
  getGrantAreasandLabouronbookReport,
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

async function getGrantAreasandLabouronbookReport(groupID) {
  const response = await CommonGet('/api/GrantAreasandLabouronbookReport/GetGrantAreasandLabouronbookReport', 'groupID=' + parseInt(groupID))
  return response;
  
}
