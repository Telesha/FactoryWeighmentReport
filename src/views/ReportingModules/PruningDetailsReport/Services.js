import { CommonGet, CommonPost } from '../../../helpers/HttpClient';

export default {
  getAllGroups,
  getEstateDetailsByGroupID,
  getDivisionDetailsByEstateID,
  GetMappedProductsByDivisionID,
  GetMappedProductsByFactoryID,
  GetPruningDetails,
  GetAllFields
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

async function GetMappedProductsByDivisionID(divisionID) {
  const response = await CommonGet('/api/Product/GetMappedProductsByDivisionID', 'divisionID=' + parseInt(divisionID));
  let plantDistence = []
  for (let item of Object.entries(response.data)) {
    plantDistence[item[1]["productID"]] = item[1]["productName"]
  }
  return plantDistence;
}

async function GetMappedProductsByFactoryID(estateID) {
  const response = await CommonGet('/api/Product/GetMappedProductsByFactoryID', 'estateID=' + parseInt(estateID));
  let product = []
  for (let item of Object.entries(response.data)) {
    product[item[1]["productID"]] = item[1]["productName"]
  }
  return product;
}

async function GetPruningDetails(model) {
  const response = await CommonPost('/api/PruningDetailsReport/GetPruningDetails', null, model)
  return response;

}

async function GetAllFields() {
  let response = await CommonGet('/api/Field/GetAllFields');
  let groupArray = [];
  for (let item of Object.entries(response.data)) {
    if (item[1]["isActive"] === true) {
      groupArray[item[1]["fieldID"]] = item[1]["fieldName"];
    }
  }
  return groupArray;
};

