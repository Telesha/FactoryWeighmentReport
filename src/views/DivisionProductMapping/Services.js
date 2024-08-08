import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
  saveDivisionProductMapping,
  GetDivisionProductMappingDetails,
  UpdateDivisionProductMapping,
  getGangDetailsByGroupIDEstateIDDivisionID,
  getAllGroups,
  getEstateDetailsByGroupID,
  getDivisionDetailsByEstateID,
  getProductsForDropdown,
  GetDivisionProductMappingDetailsByDivisionProductMappingID
};

async function getAllGroups() {
  let response = await CommonGet('/api/Factory/GetAllActiveGroups', null);
  let groupArray = []
  for (let item of Object.entries(response.data)) {
    groupArray[item[1]["groupID"]] = item[1]["groupName"]
  }
  return groupArray;
}

async function getEstateDetailsByGroupID(groupID) {
  let response = await CommonGet('/api/Estate/getEstateDetailsByGroupID', "groupID=" + parseInt(groupID));
  let estateArray = [];
  for (let item of Object.entries(response.data)) {
    estateArray[item[1]["estateID"]] = item[1]["estateName"];
  }
  return estateArray;
};

async function getDivisionDetailsByEstateID(estateID) {
  let response = await CommonGet('/api/Division/getDivisionDetailsByEstateID', "estateID=" + parseInt(estateID));
  let divisionArray = [];
  for (let item of Object.entries(response.data)) {
    divisionArray[item[1]["divisionID"]] = item[1]["divisionName"];
  }
  return divisionArray;
};

async function saveDivisionProductMapping(saveModel) {
  const response = await CommonPost('/api/DivisionProductMapping/SaveDivisionProductMapping', null, saveModel);
  return response;
}

async function UpdateDivisionProductMapping(updateModel) {
  const response = await CommonPost('/api/DivisionProductMapping/UpdateDivisionProductMapping', null, updateModel);
  return response;
}

async function GetDivisionProductMappingDetails(groupID, factoryID, divisionID, productID) {
  const response = await CommonGet('/api/DivisionProductMapping/GetDivisionProductMappingDetails', 'groupID=' + parseInt(groupID) + "&factoryID=" + parseInt(factoryID) + '&divisionID=' + parseInt(divisionID) + '&productID=' + parseInt(productID));
  return response.data;
}

async function getGangDetailsByGroupIDEstateIDDivisionID(groupID, factoryID, divisionID) {
  const response = await CommonGet('/api/Gang/GetGangDetailsByGroupIDEstateIDDivisionID', 'groupID=' + parseInt(groupID) + "&factoryID=" + parseInt(factoryID) + '&divisionID=' + parseInt(divisionID))
  return response.data;
}

async function getProductsForDropdown() {
  let response = await CommonGet('/api/Product/GetAllProducts', null);
  let productArray = []
  for (let item of Object.entries(response.data)) {
    productArray[item[1]["productID"]] = item[1]["productName"]
  }
  return productArray;
}

async function GetDivisionProductMappingDetailsByDivisionProductMappingID(divisionProductMappingID) {
  const response = await CommonGet('/api/DivisionProductMapping/GetDivisionProductMappingDetailsByDivisionProductMappingID', 'divisionProductMappingID=' + parseInt(divisionProductMappingID))
  return response.data[0];
}





