import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
  getAllGroups,
  getFactoryByGroupID,
  GetTransferAttendanceDetails,
  GetDivisionDetailsByGroupID,
  UpdateTransferAttendanceNonPlucking,
  UpdateTransferAttendancePlucking
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

async function getFactoryByGroupID(groupID) {
  let response = await CommonGet('/api/Group/GetFactoryByGroupID', "groupID=" + parseInt(groupID));
  let factoryArray = [];
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"];
  }
  return factoryArray;
};

async function GetDivisionDetailsByGroupID(groupID) {
  let response = await CommonGet('/api/Division/GetDivisionDetailsByGroupID', "groupID=" + parseInt(groupID));
  let divisionArray = [];
  for (let item of Object.entries(response.data)) {
    divisionArray[item[1]["divisionID"]] = item[1]["divisionName"];
  }
  return divisionArray;
};

async function GetTransferAttendanceDetails(model) {
  let response = await CommonPost('/api/TransferAttendance/GetTransferAttendanceDetails', null, model);
  return response;
}

async function UpdateTransferAttendanceNonPlucking(model) {
  let response = await CommonPost('/api/TransferAttendance/UpdateTransferAttendanceNonPlucking', null, model);
  return response;
}

async function UpdateTransferAttendancePlucking(model) {
  let response = await CommonPost('/api/TransferAttendance/UpdateTransferAttendancePlucking', null, model);
  return response;
}
