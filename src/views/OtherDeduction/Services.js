import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import moment from 'moment';

export default {
  saveOtherDeductionDetails,
  getAllGroups,
  getAllFactoriesByGroupID,
  GetOtherDeductionDetailsByGroupFactoryRegistrationNo,
  getEmployeeDetailsByFactoryIDRegistrationNumber,
  getDeductionType,
  getOtherDeductionDetailsByOtherDeductionID,
  UpdateOtherDeductionDetails,
  getEmployeeTypesForDropdown,
  getStatus,
  ValidateOtherDeductionDetails
};

async function saveOtherDeductionDetails(otherDeductionDetails) {
  let array = otherDeductionDetails
  const response = await CommonPost('/api/OtherDeduction/SaveOtherDeductionDetails', null, array);
  return response;
}

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

async function GetOtherDeductionDetailsByGroupFactoryRegistrationNo(groupID, operationEntityID, registrationNumber) {
  const response = await CommonGet('/api/OtherDeduction/GetOtherDeductionDetailsByGroupOperationEntityRegNo', "groupID=" + parseInt(groupID) + "&operationEntityID=" + parseInt(operationEntityID) + "&registrationNumber=" + registrationNumber);
  return response;
}

async function getEmployeeDetailsByFactoryIDRegistrationNumber(factoryID, regNo) {
  const response = await CommonGet('/api/OtherDeduction/GetEmployeeDetailsByFactoryIDRegistrationNumber', 'factoryID=' + parseInt(factoryID) + "&regNo=" + regNo);
  return response;
}

async function getDeductionType() {
  let response = await CommonGet('/api/OtherDeduction/GetDeductionType');
  let deductionTypeArray = []
  for (let item of Object.entries(response.data)) {
    deductionTypeArray[item[1]["deductionTypeID"]] = item[1]["deductionTypeName"]
  }
  return deductionTypeArray;
}

async function getOtherDeductionDetailsByOtherDeductionID(otherDeductionID) {
  const response = await CommonGet('/api/OtherDeduction/GetOtherDeductionDetailsByOtherDeductionID', "otherDeductionID=" + parseInt(otherDeductionID));
  return response;
}

async function UpdateOtherDeductionDetails(otherDeductionDetails, userID) {
  let updateModel = {
    otherDeductionID: parseInt(otherDeductionDetails.otherDeductionID),
    deductionType: parseInt(otherDeductionDetails.deductionType),
    deductionTypeName: otherDeductionDetails.deductionTypeName,
    employeeTypeName: otherDeductionDetails.employeeTypeName,
    deductionAmount: parseFloat(otherDeductionDetails.deductionAmount),
    // applyParty: parseInt(otherDeductionDetails.applyParty),
    // calculationType: otherDeductionDetails.calculationType,
    modifiedBy: parseInt(userID),
    reference: otherDeductionDetails.reference,
    applicableDate: moment(otherDeductionDetails.applicableDate).format('YYYY-MM-DD'),
  }
  const response = await CommonPost('/api/OtherDeduction/UpdateOtherDeductionDetails', null, updateModel);
  return response;
}

async function getEmployeeTypesForDropdown() {
  var response = await CommonGet('/api/Task/GetEmployeeTypesData', null);
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["employeeTypeID"]] = { name: item[1]["employeeTypeName"], code: item[1]["employeeTypeCode"] }
  }
  return array;
}

async function getStatus(id) {
  const response = await CommonGet('/api/OtherDeduction/GetAllProductOrderStatus', "id=" + parseInt(id));
  return response.data;
}

async function ValidateOtherDeductionDetails(otherDeductionDetails) {
  let validateModel = {
    employeeID: parseInt(otherDeductionDetails.employeeID),
    employeeTypeID: parseInt(otherDeductionDetails.employeeTypeID),
    deductionType: parseInt(otherDeductionDetails.deductionType),
    deductionAmount: parseFloat(otherDeductionDetails.deductionAmount),
    applicableDate: moment(otherDeductionDetails.applicableDate).format('YYYY-MM-DD'),
  }
  const response = await CommonPost('/api/OtherDeduction/ValidateOtherDeductionDetails', null, validateModel);
  return response;
}

