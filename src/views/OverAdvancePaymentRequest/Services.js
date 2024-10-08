import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  saveAdvancePayment,
  getAdvancePaymentRequestDetails,
  getfactoriesForDropDown,
  getGroupsForDropdown,
  getApprovedDetailsByRouteID,
  getRoutesForDropDown,
  getApprovedDetailsByCustomerID,
  updateAdvancePayment,
  getCustomersForDropDown,
  getCustomersListForDropDown,
  getRegistrationNumbersForDropDown,
  getCustomerAccountNo,
  getCustomerAccountBalance,
  getCustomersByRouteID,
  getOverAdvanceDetailsByRouteIDCustomerIDdate,
  getCustomerAdavanceDetails,
  getMinMaxRateByApplicableMonthAndYear,
  getCollectionTypeDetailsByID,
  getCustomerAdavancePaymentDetails,
  getCustomerFactoryItemTotalDetails,
  getCustomerLoanTotalDetails,
  getCustomerBalancePaymentDetails,
  getCustomerCurrentAdvancePaymentDetails,
  getCurrentMinMaxRateByApplicableMonthAndYear,
  getCustomerCurrentAdavanceDetails,
  getCustomerCurrentFactoryItemTotalDetails,
  getCustomerCurrentLoanTotalDetails,
  getBalanceMinMaxRateByApplicableMonthAndYear,
  getCustomerAccountBalanceByRedis,
  getCustomerDetails,
  saveAdvancePaymentDetails,
  getCustomerTransportTotalDetails,
  getCustomerCurrentTransportTotalDetails,
  RejectAdvancePayment,
  AuthorizeAdvancePayment,
  ApproveAdvancePayment,
  getApprovedDetailsByID,
  UpdateOverAdvanceRequest,
  CheckCustomerISActive,
  savePrintReceipt,
  getCustomerDetailsNameAndRouteName
};

async function CheckCustomerISActive(regNo, factoryID) {
  const response = await CommonGet('/api/Customer/CheckCustomerISActive', 'registrationNumber=' + regNo + '&factoryID=' + factoryID);
  return response;
}

async function UpdateOverAdvanceRequest(data) {

  let approveModel = {
    advancePaymentRequestID: parseInt(data.advancePaymentRequestID),
    requestedAmount: parseFloat(data.requestedAmount),
    modifiedBy: tokenDecoder.getUserIDFromToken(),
    modifiedDate: new Date().toISOString(),
    customerID: data.customerID,
    factoryID: parseInt(data.factoryID),
    groupID: parseInt(data.groupID),
    customerAccountID: data.customerAccountID,
    approvedAmount: parseFloat(data.approvedAmount),
    previouseAvailableBalance: parseFloat(data.previouseBalance),
    currentAvailableBalance: parseFloat(data.currentBalance),
    ledgerSelectedDetails: data.ledgerSelectedDetails,
    issuingDate: data.issuingDate,
    registrationNumber: data.registrationNumber,
    advanceType: parseInt(data.advanceType.toString())
  }

  const response = await CommonPost('/api/AdvancePayment/UpdateOverAdvanceRequest', null, approveModel);
  return response;
}

async function getApprovedDetailsByID(advancePaymentRequestID) {
  const response = await CommonGet('/api/AdvancePaymentApproval/GetAdvancePaymentApprovedDetailsByID', "advancePaymentRequestID=" + parseInt(advancePaymentRequestID));
  return response.data;
}

async function ApproveAdvancePayment(data) {
  let approveModel = {
    advancePaymentRequestID: parseInt(data.advancePaymentRequestID),
    modifiedBy: tokenDecoder.getUserIDFromToken(),
    modifiedDate: new Date().toISOString(),

  }
  const response = await CommonPost('/api/AdvancePaymentApproval/ApproveOverAdvancePayment', null, approveModel);
  return response;
}

async function AuthorizeAdvancePayment(data) {

  let authorizeModel = {
    advancePaymentRequestID: parseInt(data.advancePaymentRequestID),
    requestedAmount: parseFloat(data.requestedAmount),
    approvedAmount: parseFloat(data.approvedAmount),
    createdBy: tokenDecoder.getUserIDFromToken(),
    createdDate: new Date().toISOString(),
    registrationNumber: data.registrationNumber,
    factoryID: parseInt(data.factoryID),
    groupID: parseInt(data.groupID),
    previouseAvailableBalance: parseFloat(data.previouseBalance),
    currentAvailableBalance: parseFloat(data.currentBalance),
    ledgerSelectedDetails: data.ledgerSelectedDetails,
    customerAccountID: data.customerAccountID,
    issuingDate: data.issuingDate,
    advanceType: parseInt(data.advanceType.toString())
  }

  const response = await CommonPost('/api/AdvancePayment/SaveOverAdvanceAuthorize', null, authorizeModel);
  return response;
}

async function RejectAdvancePayment(data) {
  let rejectModel = {
    advancePaymentRequestID: parseInt(data.advancePaymentRequestID),
    modifiedBy: tokenDecoder.getUserIDFromToken(),
    modifiedDate: new Date().toISOString(),
  }
  const response = await CommonPost('/api/AdvancePaymentApproval/RejectAdvancePayment', null, rejectModel);
  return response;
}

async function getCustomerAccountBalance(customerID, customerAccountNo) {
  const response = await CommonGet('/api/Customer/GetCustomerAccountBalance', 'customerID=' + customerID + "&customerAccountID=" + customerAccountNo)
  return response;
}

async function getCustomerAccountNo(customerID, registrationNumber) {
  const response = await CommonGet('/api/Customer/GetCustomerAccountNo', 'customerID=' + customerID + "&registrationNumber=" + registrationNumber)
  return response.data;
}

async function getRegistrationNumbersForDropDown(customerID) {
  const response = await CommonGet('/api/Customer/GetRegistrationNumbersByCustomerID', 'customerID=' + customerID)
  return response.data;
}

async function getCustomersListForDropDown(routeID) {
  const response = await CommonGet('/api/Customer/GetCustomersByRouteID', 'routeID=' + routeID)
  return response.data;
}

async function getCustomersForDropDown(routeID) {
  var customerArray = [];
  const response = await CommonGet('/api/Customer/GetCustomersByRouteID', 'routeID=' + routeID)
  for (let item of Object.entries(response.data)) {
    customerArray[item[1]["customerID"]] = item[1]["firstName"]
  }
  return customerArray;
}

async function getApprovedDetailsByCustomerID(customerID, routeID) {
  const response = await CommonGet('/api/AdvancePayment/GetApprovedDetailsByCustomerIDANDRouteID', "customerID=" + customerID + "&routeID=" + routeID);
  return response.data;
}

async function getOverAdvanceDetailsByRouteIDCustomerIDdate(registrationNumber, routeID, factoryID, date) { 
  var newModel = {
    registrationNumber: registrationNumber.length === 0 ? null : registrationNumber,
    routeID: parseInt(routeID),
    factoryID: parseInt(factoryID),
    date: date == null ? null : date
  } 
  const response = await CommonPost('/api/AdvancePayment/GetOverAdvanceDetailsByRouteIDCustomerIDdate', null, newModel);
  return response.data;
}

async function getRoutesForDropDown(factoryID) {
  var routeArray = [];

  const response = await CommonGet('/api/Group/GetRouteByFactoryID', 'factoryID=' + factoryID)
  for (let item of Object.entries(response.data)) {
    routeArray[item[1]["routeID"]] = item[1]["routeName"]
  }
  return routeArray;
}

async function getApprovedDetailsByRouteID(routeID) {
  const response = await CommonGet('/api/AdvancePayment/GetApprovedDetailsByRouteID', "routeID=" + routeID);
  return response.data;
}

async function getfactoriesForDropDown(groupID) {
  var factoryArray = [];

  const response = await CommonGet('/api/Group/GetFactoryByGroupID', 'groupID=' + groupID)
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"]
  }
  return factoryArray;
}
async function getGroupsForDropdown() {
  var groupArray = [];
  const response = await CommonGet('/api/Group/GetAllGroups', null)
  for (let item of Object.entries(response.data)) {
    if (item[1]["isActive"] === true) {
      groupArray[item[1]["groupID"]] = item[1]["groupName"]
    }
  }
  return groupArray;
}

async function saveAdvancePayment(Apayment) {
  let saveModel = {
    advancePaymentRequestID: 0,
    customerID: parseInt(Apayment.customerID),
    requestedAmount: parseFloat(Apayment.requestedAmount),
    statusID: Apayment.statusID,
    isActive: Apayment.isActive,
    createdBy: tokenDecoder.getUserIDFromToken(),
    createdDate: new Date().toISOString(),
    registrationNumber: Apayment.registrationNumber

  }
  const response = await CommonPost('/api/AdvancePayment/SaveAdvancePayment', null, saveModel);
  return response;
}

async function getAdvancePaymentRequestDetails(advancePaymentRequestID) {
  const response = await CommonGet('/api/AdvancePayment/GetAdvancePaymentRequestDetails', "advancePaymentRequestID=" + parseInt(advancePaymentRequestID));
  return response.data;
}

async function updateAdvancePayment(Apayment) {
  let updateModel = {
    advancePaymentRequestID: parseInt(Apayment.advancePaymentRequestID),
    requestedAmount: Apayment.requestedAmount,
    modifiedBy: tokenDecoder.getUserIDFromToken(),
    modifiedDate: new Date().toISOString(),

  }
  const response = await CommonPost('/api/AdvancePayment/UpdateAdvancePayment', null, updateModel);
  return response;
}

async function getCustomersByRouteID(groupID, factoryID, routeID) {
  var customerArray = [];
  const response = await CommonGet('/api/Customer/GetCustomersByIDS', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID) + "&routeID=" + parseInt(routeID));
  for (let item of Object.entries(response.data)) {
    customerArray[item[1]["customerID"]] = item[1]["customerName"]
  }
  return customerArray;
}

async function saveAdvancePaymentDetails(finalModel) {
  const response = await CommonPost('/api/AdvancePayment/SaveAdvancePaymentDetails', null, finalModel);
  return response;
}

async function getCustomerDetails(groupID, factoryID, regNo) {
  const response = await CommonGet('/api/Customer/GetCustomerDetailsForAdvancePayment', 'groupID=' + parseInt(groupID) + '&factoryID=' + parseInt(factoryID) + '&registrationNumber=' + regNo);
  return response;
}

async function getCustomerAccountBalanceByRedis(customerID, customerAccountID) {
  const response = await CommonGet('/api/Customer/GetCustomerAccountBalance', 'customerID=' + parseInt(customerID) + '&customerAccountID=' + parseInt(customerAccountID));
  return response.balance;
}

async function getBalanceMinMaxRateByApplicableMonthAndYear(factoryID) {
  const response = await CommonGet('/api/AdvancePayment/GetBalanceMinMaxRateByApplicableMonthAndYear', 'factoryID=' + parseInt(factoryID))
  return response.data;
}

async function getCustomerCurrentLoanTotalDetails(approveDetails) {

  let newModel = {
    groupID: parseInt(approveDetails.groupID),
    factoryID: parseInt(approveDetails.factoryID),
    nIC: approveDetails.nic == "" ? null : approveDetails.nic,
    RegistrationNumber: approveDetails.regNumber == "" ? null : approveDetails.regNumber
  }
  const response = await CommonPost('/api/AdvancePayment/GetCustomerCurrentLoanTotalDetails', null, newModel)
  return response.data;
}

async function getCustomerCurrentFactoryItemTotalDetails(approveDetails) {

  let newModel = {
    groupID: parseInt(approveDetails.groupID),
    factoryID: parseInt(approveDetails.factoryID),
    nIC: approveDetails.nic == "" ? null : approveDetails.nic,
    RegistrationNumber: approveDetails.regNumber == "" ? null : approveDetails.regNumber
  }
  const response = await CommonPost('/api/AdvancePayment/GetCustomerCurrentFactoryItemTotalDetails', null, newModel)
  return response.data;
}

async function getCustomerCurrentAdavanceDetails(approveDetails) {

  let newModel = {
    groupID: parseInt(approveDetails.groupID),
    factoryID: parseInt(approveDetails.factoryID),
    nIC: approveDetails.nic == "" ? null : approveDetails.nic,
    RegistrationNumber: approveDetails.regNumber == "" ? null : approveDetails.regNumber
  }
  const response = await CommonPost('/api/AdvancePayment/GetCustomerCurrentAdavanceDetails', null, newModel)
  return response.data;
}

async function getCurrentMinMaxRateByApplicableMonthAndYear(factoryID) {
  const response = await CommonGet('/api/AdvancePayment/GetCurrentMinMaxRateByApplicableMonthAndYear', 'factoryID=' + factoryID)
  return response.data;
}

async function getCustomerCurrentAdvancePaymentDetails(approveDetails) {

  let newModel = {
    groupID: parseInt(approveDetails.groupID),
    factoryID: parseInt(approveDetails.factoryID),
    nIC: approveDetails.nic == "" ? null : approveDetails.nic,
    RegistrationNumber: approveDetails.regNumber == "" ? null : approveDetails.regNumber
  }
  const response = await CommonPost('/api/AdvancePayment/GetCustomerCurrentAdvancePaymentDetails', null, newModel)
  return response.data;
}

async function getCustomerBalancePaymentDetails(approveDetails) {

  let newModel = {
    groupID: parseInt(approveDetails.groupID),
    factoryID: parseInt(approveDetails.factoryID),
    nIC: approveDetails.nic == "" ? null : approveDetails.nic,
    RegistrationNumber: approveDetails.regNumber == "" ? null : approveDetails.regNumber,
  }
  const response = await CommonPost('/api/AdvancePayment/GetCustomerBalancePaymentDetails', null, newModel)
  return response.data;
}

async function getCustomerLoanTotalDetails(approveDetails) {

  let newModel = {
    groupID: parseInt(approveDetails.groupID),
    factoryID: parseInt(approveDetails.factoryID),
    nIC: approveDetails.nic == "" ? null : approveDetails.nic,
    RegistrationNumber: approveDetails.regNumber == "" ? null : approveDetails.regNumber
  }
  const response = await CommonPost('/api/AdvancePayment/GetCustomerLoanTotalDetails', null, newModel)
  return response.data;
}

async function getCustomerFactoryItemTotalDetails(approveDetails) {

  let newModel = {
    groupID: parseInt(approveDetails.groupID),
    factoryID: parseInt(approveDetails.factoryID),
    nIC: approveDetails.nic == "" ? null : approveDetails.nic,
    RegistrationNumber: approveDetails.regNumber == "" ? null : approveDetails.regNumber
  }
  const response = await CommonPost('/api/AdvancePayment/GetCustomerFactoryItemTotalDetails', null, newModel)
  return response.data;
}

async function getCustomerAdavancePaymentDetails(approveDetails) {

  let newModel = {
    groupID: parseInt(approveDetails.groupID),
    factoryID: parseInt(approveDetails.factoryID),
    nIC: approveDetails.nic == "" ? null : approveDetails.nic,
    RegistrationNumber: approveDetails.regNumber == "" ? null : approveDetails.regNumber
  }
  const response = await CommonPost('/api/AdvancePayment/GetCustomerAdavancePaymentDetails', null, newModel)
  return response.data;
}

async function getCollectionTypeDetailsByID(collectionTypeID) {
  const response = await CommonGet('/api/CollectionType/getCollectionTypeDetailsByID', 'collectionTypeID=' + collectionTypeID)
  return response.data;
}

async function getMinMaxRateByApplicableMonthAndYear(factoryID) {
  const response = await CommonGet('/api/AdvancePayment/GetMinMaxRateByApplicableMonthAndYear', 'factoryID=' + factoryID);
  return response.data;
}

async function getCustomerAdavanceDetails(approveDetails) {

  let newModel = {
    groupID: parseInt(approveDetails.groupID),
    factoryID: parseInt(approveDetails.factoryID),
    nIC: approveDetails.nic == "" ? null : approveDetails.nic,
    RegistrationNumber: approveDetails.regNumber == "" ? null : approveDetails.regNumber
  }
  const response = await CommonPost('/api/AdvancePayment/GetCustomerAdavanceDetails', null, newModel)
  return response.data;
}

async function getCustomerTransportTotalDetails(approveDetails) {

  let newModel = {
    groupID: parseInt(approveDetails.groupID),
    factoryID: parseInt(approveDetails.factoryID),
    nIC: approveDetails.nic == "" ? null : approveDetails.nic,
    RegistrationNumber: approveDetails.regNumber == "" ? null : approveDetails.regNumber
  }
  const response = await CommonPost('/api/AdvancePayment/GetCustomerTransportTotalDetails', null, newModel)
  return response.data;
}

async function getCustomerCurrentTransportTotalDetails(approveDetails) {

  let newModel = {
    groupID: parseInt(approveDetails.groupID),
    factoryID: parseInt(approveDetails.factoryID),
    nIC: approveDetails.nic == "" ? null : approveDetails.nic,
    RegistrationNumber: approveDetails.regNumber == "" ? null : approveDetails.regNumber
  }
  const response = await CommonPost('/api/AdvancePayment/GetCustomerCurrentTransportTotalDetails', null, newModel)
  return response.data;
}

//Printing Function
async function savePrintReceipt(model) {
  let response = await CommonPost('/api/InvoiceReceiptPrint/SaveInvoiceReceiptPrint', null, model);
  return response
}

async function getCustomerDetailsNameAndRouteName(groupID, factoryID, registrationNumber) {
  let response = await CommonGet('/api/Customer/GetCustomerDetailsNameAndRouteName', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID) + "&registrationNumber=" + registrationNumber);
  return response;
}
