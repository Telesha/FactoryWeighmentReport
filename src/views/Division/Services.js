import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  GetAllcostCenters,
  savecostCenter,
  getcostCenterDetailsByID,
  updatecostCenter,
  getfactoriesForDropDown,
  getGroupsForDropdown,
  getcostCentersByFactoryID,
  getProductsByFactoryID
};

async function getcostCentersByFactoryID(groupID, factoryID) {
  const response = await CommonGet('/api/Route/GetRoutesByFactoryID', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
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

async function GetAllcostCenters() {
  const response = await CommonGet('/api/Route/GetAllRoutes', null);
  return response.data;
}

async function savecostCenter(costCenter) {
  let saveModel = {
    routeID: 0,
    routeName: costCenter.costCenterName,
    routeCode: costCenter.costCenterCode,
    shortCode: costCenter.shortCode,
    factoryID: parseInt(costCenter.factoryID),
    groupID: parseInt(costCenter.groupID),
    routeLocation: costCenter.costCenterLocation,
    targetCrop: costCenter.targetCrop == "" ? parseFloat(0) : parseFloat(costCenter.targetCrop),
    productID: parseInt(costCenter.productID),
    isActive: costCenter.isActive,
    createdBy: tokenDecoder.getUserIDFromToken(),
    createdDate: new Date().toISOString(),
  }
  const response = await CommonPost('/api/Route/SaveRoute', null, saveModel);
  return response;
}
async function updatecostCenter(costCenter) {
  let updateModel = {
    routeID: parseInt(costCenter.costCenterID),
    routeName: costCenter.costCenterName,
    routeCode: costCenter.costCenterCode,
    shortCode: costCenter.shortCode,
    factoryID: parseInt(costCenter.factoryID),
    groupID: parseInt(costCenter.groupID),
    routeLocation: costCenter.costCenterLocation,
    targetCrop: costCenter.targetCrop == "" ? parseFloat(0) : parseFloat(costCenter.targetCrop),
    productID: parseInt(costCenter.productID),
    isActive: costCenter.isActive,
    modifiedBy: tokenDecoder.getUserIDFromToken(),
    modifiedDate: new Date().toISOString(),
  }
  const response = await CommonPost('/api/Route/UpdateRoute', null, updateModel);
  return response;
}

async function getcostCenterDetailsByID(routeID) {
  const response = await CommonGet('/api/Route/GetRouteDetailsByID', "routeID=" + parseInt(routeID));
  return response.data;
}

async function getProductsByFactoryID(factoryID) {
  let response = await CommonGet('/api/Product/GetProductsByFactoryID', "factoryID=" + parseInt(factoryID));
  let productArray = []
  for (let item of Object.entries(response.data)) {
    productArray[item[1]["productID"]] = item[1]["productName"]
  }
  return productArray;
}
