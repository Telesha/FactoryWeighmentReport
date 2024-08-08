import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  getAllGroups,
  GetAllLeaveTypeDetails,
  GetLeaveTypesByGroupID,
  saveLeaveTypeDetails,
  UpdateLeaveTypeDetails,
  getLeaveTypeDetailsByID,
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

async function GetAllLeaveTypeDetails() {
  const response = await CommonGet('/api/LeaveType/GetAllLeaveTypeDetails', null);
  return response.data;
}

async function GetLeaveTypesByGroupID(groupID) {
  const response = await CommonGet('/api/LeaveType/GetLeaveTypesByGroupID', 'groupID=' + parseInt(groupID))
  return response.data;
}

async function saveLeaveTypeDetails(leaveTypeDataList) {
  let saveModel = {
    leaveTypeConfigurationID: 0,
    groupID: parseInt(leaveTypeDataList.groupID),
    shortForm: leaveTypeDataList.shortForm,
    elaboration: leaveTypeDataList.elaboration,
    eligible: leaveTypeDataList.eligible,
    condition: leaveTypeDataList.condition,
    isPayment: leaveTypeDataList.isPaymentPerson,
    wages: leaveTypeDataList.isPaymentPerson ? parseFloat(leaveTypeDataList.wages) : parseFloat(0),
    isActive: leaveTypeDataList.isActive,
    createdBy: tokenDecoder.getUserIDFromToken(),
    createdDate: new Date().toISOString(),
  }
  const response = await CommonPost('/api/LeaveType/SaveLeaveTypeDetails', null, saveModel);
  return response;
};

async function UpdateLeaveTypeDetails(leaveTypeDataList) {
  let updateModel = {
    leaveTypeConfigurationID: parseInt(leaveTypeDataList.leaveTypeConfigurationID),
    shortForm: leaveTypeDataList.shortForm,
    elaboration: leaveTypeDataList.elaboration,
    eligible: leaveTypeDataList.eligible,
    condition: leaveTypeDataList.condition,
    isPayment: leaveTypeDataList.isPaymentPerson,
    wages: leaveTypeDataList.isPaymentPerson ? parseFloat(leaveTypeDataList.wages) : parseFloat(0),
    isActive: leaveTypeDataList.isActive,
    modifiedBy: tokenDecoder.getUserIDFromToken(),
    modifiedDate: new Date().toISOString(),
  }
  const response = await CommonPost('/api/LeaveType/UpdateLeaveTypeDetails', null, updateModel);

  return response;
}

async function getLeaveTypeDetailsByID(leaveTypeConfigurationID) {
  const response = await CommonGet('/api/LeaveType/GetLegalEntityDetailsByID', "leaveTypeConfigurationID=" + parseInt(leaveTypeConfigurationID));
  return response.data;
}





