import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
  getAllGroups,
  getAllFactoriesByGroupID,
  getDivisionDetailsByEstateID,
  getEmployeeDetailsByRegNumber,
  GetElectricityDeductionDetailsForView,
  SaveElectricityDeductionDetails,
  getElectricityDeductionDetailsByelectricityDeductionID,
  UpdateElectricityDeductionDetails,
  DeleteElectricityDeductionDetails,
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
}

async function getAllFactoriesByGroupID(groupID) {
  var factoryArray = [];
  const response = await CommonGet('/api/Group/GetFactoryByGroupID', "groupID=" + parseInt(groupID));
  for (let item of Object.entries(response.data)) {
    if (item[1]["isActive"] == true) {
      factoryArray[item[1]["factoryID"]] = item[1]["factoryName"];
    }
  }
  return factoryArray;
}

async function getDivisionDetailsByEstateID(estateID) {
  let response = await CommonGet('/api/Division/getDivisionDetailsByEstateID', "estateID=" + parseInt(estateID));
  let divisionArray = [];
  for (let item of Object.entries(response.data)) {
    divisionArray[item[1]["divisionID"]] = item[1]["divisionName"];
  }
  return divisionArray;
}

async function getEmployeeDetailsByRegNumber(costCenterID, regNo) {
  const response = await CommonGet('/api/ElectricityDeduction/GetEmployeeDetailsByCostCenterIDRegNumber', 'costCenterID=' + parseInt(costCenterID) + "&regNo=" + regNo);
  return response;
}

async function GetElectricityDeductionDetailsForView(model) {
  const response = await CommonPost('/api/ElectricityDeduction/GetElectricityDeductionDetails', null, model);
  return response;
}

async function SaveElectricityDeductionDetails(otherDeductionDetails) {
  let array = otherDeductionDetails
  const response = await CommonPost('/api/ElectricityDeduction/SaveElectricityDeductionnDetails', null, array);
  return response;
}

async function getElectricityDeductionDetailsByelectricityDeductionID(electricityDeductionID) {
  const response = await CommonGet('/api/ElectricityDeduction/GetElectricityDeductionDetailsByectricityDeductionID', "electricityDeductionID=" + parseInt(electricityDeductionID));
  return response;
}

async function UpdateElectricityDeductionDetails(otherDeductionDetails, userID) {
  let updateModel = {
    electricityDeductionID: parseInt(otherDeductionDetails.electricityDeductionID),
    deductionAmount: parseFloat(otherDeductionDetails.deductionAmount),
    reference: otherDeductionDetails.reference,
    modifiedBy: parseInt(userID),
  }
  const response = await CommonPost('/api/ElectricityDeduction/UpdateElectricityDeductionDetails', null, updateModel);
  return response;
}

async function DeleteElectricityDeductionDetails(electricityDeductionID) {
  const response = await CommonGet('/api/ElectricityDeduction/DeleteElectricityDeductionDetails', "electricityDeductionID=" + parseInt(electricityDeductionID))
  return response;
}












