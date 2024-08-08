import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  getGroupsForDropdown,
  getFactoryByGroupID,
  getGradesByGroupIDAndFactoryID,
  saveManufacture,
  saveWithtredLeaf,
  saveRolling,
  saveFiering,
  saveGrading,
  GetManufacturingList,
  GetManufacturingByID,
  getEmployeesForDropdown,
  getFuelTypesForDropdown,
  getJobTypesForDropdown,
  GetWitheringDetailsByWitheredLeafID,
  GetRollingDetailsByBLManufaturingID,
  GetFieringDetailsByBLManufaturingID,
  GetGradingDetailsByBLManufaturingID,
  CompleteManufacture,
  updateManufacturing,
  DeleteWitheredLeaf,
  DeleteRolling,
  DeleteGrading,
  DeleteFieringAndDhools,
  updateFiering,
  GetFuelConsumeByBLManufaturingID,
  DeleteFuelConsume
};

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

async function getFactoryByGroupID(groupID) {

  const response = await CommonGet('/api/Group/GetFactoryByGroupID', 'groupID=' + parseInt(groupID))
  
  return response.data;
}

async function getGradesByGroupIDAndFactoryID(groupID, factoryID) {

  const response = await CommonGet('/api/Grade/GetGradeDetails', 'groupID=' + groupID + "&factoryID=" + factoryID)
  return response.data;
}

async function saveManufacture(manufacture,DhoolDetaislList) {

  let saveModel = {
    bLManufaturingID: 0,
    groupID: parseInt(manufacture.groupID),
    factoryID: parseInt(manufacture.factoryID),
    fromDateOfCrop: manufacture.fromDateOfCrop,
    toDateOfCrop: manufacture.toDateOfCrop,
    fromDateOfManufaturing: manufacture.fromDateOfManufacture,
    toDateOfManufaturing: manufacture.toDateOfManufacture,
    greenLeafAmount: parseFloat(manufacture.greenLeafAmount),
    numberOfDays: parseInt(manufacture.numberOfDays),
    manufactureNumber: manufacture.manufactureNumber,
    weatherCondition: parseInt(manufacture.weatherCondition),
    fuelConsumeList: DhoolDetaislList,
    best: parseFloat(manufacture.best),
    belowBest: parseFloat(manufacture.belowBest),
    poor: parseFloat(manufacture.poor),
    isActive: manufacture.isActive,
    createdBy: tokenDecoder.getUserIDFromToken(),
    createdDate: new Date().toISOString(),

  }
  const response = await CommonPost('/api/Manufacturing/SaveManufacture', null, saveModel);
  return response;
}

async function updateManufacturing(manufacture,DhoolDetaislList) {

  let updateModel = {
    bLManufaturingID: parseInt(manufacture.blManufaturingID),
    groupID: parseInt(manufacture.groupID),
    factoryID: parseInt(manufacture.factoryID),
    fromDateOfCrop: manufacture.fromDateOfCrop,
    toDateOfCrop: manufacture.toDateOfCrop,
    fromDateOfManufaturing: manufacture.fromDateOfManufacture,
    toDateOfManufaturing: manufacture.toDateOfManufacture,
    greenLeafAmount: parseFloat(manufacture.greenLeafAmount),
    numberOfDays: parseInt(manufacture.numberOfDays),
    manufactureNumber: manufacture.manufactureNumber,
    weatherCondition: parseInt(manufacture.weatherCondition),
    fuelConsumeList: DhoolDetaislList,
    best: parseFloat(manufacture.best),
    belowBest: parseFloat(manufacture.belowBest),
    poor: parseFloat(manufacture.poor),
    isActive: manufacture.isActive,
    createdBy: tokenDecoder.getUserIDFromToken(),
    createdDate: new Date().toISOString(),

  }
  const response = await CommonPost('/api/Manufacturing/UpdateManufacture', null, updateModel);
  return response;
}



async function saveWithtredLeaf(DhoolDetaislList, manufactureID) {
  let model = {
    witheredLeafID: 0,
    BLManufaturingID: manufactureID,
    witheredLeafList: DhoolDetaislList,
    isActive: true,
    createdBy: tokenDecoder.getUserIDFromToken(),
    createdDate: new Date().toISOString(),
  }
  const response = await CommonPost('/api/Manufacturing/SaveWitheredLeaf', null, model);
  return response;
}

async function saveRolling(DhoolDetaislList, manufactureID) {
  let model = {
    bLRollingID: 0,
    BLManufaturingID: manufactureID,
    rollingList: DhoolDetaislList,
    isActive: true,
    createdBy: tokenDecoder.getUserIDFromToken(),
    createdDate: new Date().toISOString(),
  }
  const response = await CommonPost('/api/Manufacturing/SaveRolling', null, model);
  return response;
}



async function saveFiering(DhoolDetaislList, manufactureID) {
  let model = {
    bLFieringAndDhoolID: 0,
    BLManufaturingID: manufactureID,
    fieringAndDhoolList: DhoolDetaislList,
    isActive: true,
    createdBy: tokenDecoder.getUserIDFromToken(),
    createdDate: new Date().toISOString(),
  }
  const response = await CommonPost('/api/Manufacturing/SaveFieringAndDhool', null, model);
  return response;
}

async function updateFiering(DhoolDetaislList, manufactureID) {
  let model = {
    bLFieringAndDhoolID: DhoolDetaislList.blFieringAndDhoolID,
    fieringAndDhoolList: DhoolDetaislList,
    isActive: true,
    createdBy: tokenDecoder.getUserIDFromToken(),
    createdDate: new Date().toISOString(),
  }
  
  const response = await CommonPost('/api/Manufacturing/UpdateFieringAndDhool', null, model);
  return response;
}


async function saveGrading(GradeDetaislList, manufactureID) {
  let model = {
    gradingID: 0,
    BLManufaturingID: manufactureID,
    gradingList: GradeDetaislList,
    isActive:true,
    createdBy: tokenDecoder.getUserIDFromToken(),
    createdDate: new Date().toISOString(),
  }
  const response = await CommonPost('/api/Manufacturing/SaveGrading', null, model);
  return response;
}

async function CompleteManufacture(manufactureID) {
  let model = {
    BLManufaturingID: manufactureID,
    isActive:true,
    modifiedBy: tokenDecoder.getUserIDFromToken(),
    modifiedDate: new Date().toISOString(),
  }
  const response = await CommonPost('/api/Manufacturing/CompleteManufacture', null, model);
  return response;
}

async function GetManufacturingList(groupID, factoryID, date, statusID) {  
  let model = {
    groupID: parseInt(groupID),
    factoryID: parseInt(factoryID),
    date: date == null ? null : date,
    statusID: parseInt(statusID)
  }
  const response = await CommonPost('/api/Manufacturing/GetManufacturingList', null, model);
  return response;
}

async function GetManufacturingByID(blManufaturingID) {
  const response = await CommonGet('/api/Manufacturing/GetManufactringByBLManufaturingID', "blManufaturingID=" + parseInt(blManufaturingID));
  return response.data;
}

async function GetFuelConsumeByBLManufaturingID(blManufaturingID) {
  const response = await CommonGet('/api/Manufacturing/GetFuelConsumeByBLManufaturingID', "blManufaturingID=" + parseInt(blManufaturingID));
  return response.data;
}

async function GetWitheringDetailsByWitheredLeafID(blManufaturingID) {
  const response = await CommonGet('/api/Manufacturing/GetWitheringDetailsByWitheredLeafID', "blManufaturingID=" + parseInt(blManufaturingID));
  return response.data;
}

async function GetRollingDetailsByBLManufaturingID(blManufaturingID) {
  const response = await CommonGet('/api/Manufacturing/GetRollingDetailsByBLManufaturingID', "blManufaturingID=" + parseInt(blManufaturingID));
  return response.data;
}

async function GetFieringDetailsByBLManufaturingID(blManufaturingID) {
  const response = await CommonGet('/api/Manufacturing/GetFieringDetailsByBLManufaturingID', "blManufaturingID=" + parseInt(blManufaturingID));
  return response.data;
}

async function GetGradingDetailsByBLManufaturingID(blManufaturingID) {
  const response = await CommonGet('/api/Manufacturing/GetGradingDetailsByBLManufaturingID', "blManufaturingID=" + parseInt(blManufaturingID));
  return response.data;
}


async function getEmployeesForDropdown(groupID, factoryID) {
  var employeeArray = [];
  const response = await CommonGet('/api/Manufacturing/GetEmployees', 'groupID=' + groupID + "&operationEntityID=" + factoryID)
  for (let item of Object.entries(response.data)) {
    employeeArray[item[1]["employeeID"]] = item[1]["fullName"]
  }
  return employeeArray;
}


async function getFuelTypesForDropdown() {
  var fuelTypeArray = [];

  const response = await CommonGet('/api/Manufacturing/GetAllFuelTypes', null)
  for (let item of Object.entries(response.data)) {
    
    fuelTypeArray[item[1]["fuelTypeID"]] = item[1]["fuelTypeName"]
    
  }
  return fuelTypeArray;
}

async function getJobTypesForDropdown() {
  var jobTypeArray = [];

  const response = await CommonGet('/api/Manufacturing/GetAllJobTypes', null)
  for (let item of Object.entries(response.data)) {
    
    jobTypeArray[item[1]["jobTypeID"]] = item[1]["jobTypeName"]
    
  }
  return jobTypeArray;
}

async function DeleteWitheredLeaf(witheredLeafID) {
  let model = {
    witheredLeafID : witheredLeafID,
    modifiedBy: tokenDecoder.getUserIDFromToken(),
    modifiedDate: new Date().toISOString(),
  }
  const response = await CommonPost('/api/Manufacturing/DeleteWitheredLeaf', null, model);
  return response.data;
}

async function DeleteFuelConsume(manufactureFuelConsumeID) {
  let model = {
    manufactureFuelConsumeID : manufactureFuelConsumeID,
    modifiedBy: tokenDecoder.getUserIDFromToken(),
    modifiedDate: new Date().toISOString(),
  }
  const response = await CommonPost('/api/Manufacturing/DeleteFuelConsume',null, model);
  return response.data;
}

async function DeleteFieringAndDhools(blFieringAndDhoolID) {
  let model = {
    bLFieringAndDhoolID : blFieringAndDhoolID,
    modifiedBy: tokenDecoder.getUserIDFromToken(),
    modifiedDate: new Date().toISOString(),
  }
  const response = await CommonPost('/api/Manufacturing/DeleteFieringAndDhools',null, model);
  return response.data;
}

async function DeleteRolling(blRollingID) {
  let model = {
    bLRollingID : blRollingID,
    modifiedBy: tokenDecoder.getUserIDFromToken(),
    modifiedDate: new Date().toISOString(),
  }
  const response = await CommonPost('/api/Manufacturing/DeleteRolling', null, model);
  return response.data;
}

async function DeleteGrading(gradingID) {
  let model = {
    gradingID : gradingID,
    modifiedBy: tokenDecoder.getUserIDFromToken(),
    modifiedDate: new Date().toISOString(),
  }
  const response = await CommonPost('/api/Manufacturing/DeleteGrading', null, model);
  return response.data;
}

