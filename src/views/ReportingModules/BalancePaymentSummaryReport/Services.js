import { CommonGet, CommonPost } from '../../../helpers/HttpClient';

export default {
  getAllGroups,
  getAllFactoriesByGroupID,
  GetBalancePaymentSummary,
  GetBalancePaymentDetailedData,
  GetRoutewiseBalancepayment
};

async function getAllGroups() {
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

async function GetBalancePaymentSummary(balancePaymentSummaryRequestModel) {
  
  let response = await CommonPost('/api/BalancePaymentSummery/GetBalancePaymentSummary', null, balancePaymentSummaryRequestModel);
  return response;
}

async function GetBalancePaymentDetailedData(balancePaymentSummaryRequestModel) {
  
  let response = await CommonPost('/api/BalancePaymentSummery/GetBalancePaymentDetailedData', null, balancePaymentSummaryRequestModel);
  return response;
}

async function GetRoutewiseBalancepayment(balancePaymentSummaryRequestModel) {
  
  let response = await CommonPost('/api/BalancePaymentSummery/GetRoutewiseBalancepayment', null, balancePaymentSummaryRequestModel);
  return response;
}

