import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  saveField,
  getFieldDetailsByID,
  updateField,
  getFieldDetailsByGroupIDEstateIDDivisionID,
  getAllGroups,
  getEstateDetailsByGroupID,
  getDivisionDetailsByEstateID,
  getSectionTypes,
  deleteSectionItem,
  getSectionDetails,
  GetAllFieldPlantType,
  GetAllFieldPlantDistence,
  GetAllFieldClass,
  GetAllFieldTopography,
  GetMappedProductsByDivisionID,
  GetAllFieldCloneDetail,
  GetFieldPlantingType,
  GetFieldPruningType,
  getPruningDetailsByField,
  GetMappedProductsByFactoryID,
  deletePruningItem
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

async function saveField(data) {
  let saveFieldModel = {
    fieldID: 0,
    groupID: parseInt(data.fieldGeneralArray.groupID),
    estateID: parseInt(data.fieldGeneralArray.estateID),
    divisionID: parseInt(data.fieldGeneralArray.divisionID),
    fieldCode: data.fieldGeneralArray.fieldCode,
    fieldName: data.fieldGeneralArray.fieldName,
    fieldLocation: data.fieldGeneralArray.fieldLocation,
    area: parseFloat(data.fieldGeneralArray.area),
    cultivationArea: data.fieldGeneralArray.cultivationArea == "" ? parseFloat(0) : parseFloat(data.fieldGeneralArray.cultivationArea),
    targetCrop: parseFloat(data.fieldGeneralArray.targetCrop),
    typesOfPlant: parseInt(data.fieldGeneralArray.typesOfPlant),
    clone: parseInt(data.fieldGeneralArray.clone),
    seedling: parseInt(data.fieldGeneralArray.seedling),
    drainageLengths: parseFloat(data.fieldGeneralArray.drainageLengths),
    noOfTeaBushes: parseInt(data.fieldGeneralArray.noOfTeaBushes),
    noOfShadeTrees: parseInt(data.fieldGeneralArray.noOfShadeTrees),
    sectionTypeID: parseInt(data.fieldGeneralArray.sectionTypeID),
    productID: parseInt(data.fieldGeneralArray.productID),
    fieldClassID: parseInt(data.fieldGeneralArray.fieldClassID),
    fieldTopographyID: parseInt(data.fieldGeneralArray.fieldTopographyID),
    fieldCloneDetailID: parseInt(data.fieldGeneralArray.fieldCloneDetailID),
    sectionDetails: data.fieldGeneralArray.plantingData,
    plantsPerHectare: parseFloat(data.fieldGeneralArray.plantsPerHectare),
    vacancyPercentage: parseFloat(data.fieldGeneralArray.vacancyPercentage),
    lastPlantingYear: data.fieldGeneralArray.lastPlantingYear,
    specing: data.fieldGeneralArray.specing,
    cloneDetails: data.fieldGeneralArray.cloneDetails,
    isActive: data.fieldGeneralArray.isActive,
    createdBy: tokenDecoder.getUserIDFromToken(),
    sectionDetails: data.historyArray,
    pruningDetails: data.pruningArray
  }
  const response = await CommonPost('/api/Field/SaveField', null, saveFieldModel);
  return response;
}

async function updateField(data) {
  data.fieldID = parseInt(data.fieldID);
  if (data.typesOfPlant != 3) {
    data.clone = 0;
    data.seedling = 0;
  }
  let updateFieldModel = {
    fieldID: data.fieldID,
    groupID: parseInt(data.fieldGeneralArray.groupID),
    estateID: parseInt(data.fieldGeneralArray.estateID),
    divisionID: parseInt(data.fieldGeneralArray.divisionID),
    fieldCode: data.fieldGeneralArray.fieldCode,
    fieldName: data.fieldGeneralArray.fieldName,
    fieldLocation: data.fieldGeneralArray.fieldLocation,
    area: parseFloat(data.fieldGeneralArray.area),
    cultivationArea: data.fieldGeneralArray.cultivationArea == "" ? parseFloat(0) : parseFloat(data.fieldGeneralArray.cultivationArea),
    targetCrop: parseFloat(data.fieldGeneralArray.targetCrop),
    typesOfPlant: parseInt(data.fieldGeneralArray.typesOfPlant),
    clone: parseInt(data.fieldGeneralArray.clone),
    seedling: parseInt(data.fieldGeneralArray.seedling),
    drainageLengths: parseFloat(data.fieldGeneralArray.drainageLengths),
    noOfTeaBushes: parseInt(data.fieldGeneralArray.noOfTeaBushes),
    noOfShadeTrees: parseInt(data.fieldGeneralArray.noOfShadeTrees),
    sectionTypeID: parseInt(data.fieldGeneralArray.sectionTypeID),
    productID: parseInt(data.fieldGeneralArray.productID),
    fieldClassID: parseInt(data.fieldGeneralArray.fieldClassID),
    fieldTopographyID: parseInt(data.fieldGeneralArray.fieldTopographyID),
    fieldCloneDetailID: parseInt(data.fieldGeneralArray.fieldCloneDetailID),
    sectionDetails: data.fieldGeneralArray.plantingData,
    plantsPerHectare: parseFloat(data.fieldGeneralArray.plantsPerHectare),
    vacancyPercentage: parseFloat(data.fieldGeneralArray.vacancyPercentage),
    lastPlantingYear: (data.fieldGeneralArray.lastPlantingYear),
    specing: data.fieldGeneralArray.specing,
    cloneDetails: data.fieldGeneralArray.cloneDetails,
    isActive: data.fieldGeneralArray.isActive,
    modifiedBy: tokenDecoder.getUserIDFromToken(),
    sectionDetails: data.historyArray,
    pruningDetails: data.pruningArray
  }
  const response = await CommonPost('/api/Field/UpdateField', null, updateFieldModel);
  return response;
}
async function getFieldDetailsByID(fieldID) {
  const response = await CommonGet('/api/Field/GetFieldDetailsByFieldID', "fieldID=" + parseInt(fieldID));
  return response.data;
}

async function getFieldDetailsByGroupIDEstateIDDivisionID(groupID, estateID, divisionID, productID) {
  const response = await CommonGet('/api/Field/GetFieldDetailsByGroupIDEstateIDDivisionID', 'groupID=' + parseInt(groupID) + "&estateID=" + parseInt(estateID) + '&divisionID=' + parseInt(divisionID) + '&productID=' + parseInt(productID))
  return response.data;
}

async function getSectionTypes() {
  const response = await CommonGet('/api/Field/GetSectionTypes');
  let sectionTypes = []
  for (let item of Object.entries(response.data)) {
    sectionTypes[item[1]["sectionTypeID"]] = item[1]["typeName"]
  }
  return sectionTypes;
}

async function GetAllFieldPlantType() {
  const response = await CommonGet('/api/Field/GetAllFieldPlantType');
  let plantType = []
  for (let item of Object.entries(response.data)) {
    plantType[item[1]["fieldPlantTypeID"]] = item[1]["plantTypeName"]
  }
  return plantType;
}

async function GetAllFieldPlantDistence() {
  const response = await CommonGet('/api/Field/GetAllFieldPlantDistence');
  let plantDistence = []
  for (let item of Object.entries(response.data)) {
    plantDistence[item[1]["fieldPlantDistenceID"]] = item[1]["plantDistenceName"]
  }
  return plantDistence;
}

async function GetAllFieldClass() {
  const response = await CommonGet('/api/Field/GetAllFieldClass');
  let plantDistence = []
  for (let item of Object.entries(response.data)) {
    plantDistence[item[1]["fieldClassID"]] = item[1]["fieldClassName"]
  }
  return plantDistence;
}

async function GetAllFieldTopography() {
  const response = await CommonGet('/api/Field/GetAllFieldTopography');
  let plantDistence = []
  for (let item of Object.entries(response.data)) {
    plantDistence[item[1]["fieldTopographyID"]] = item[1]["topographyName"]
  }
  return plantDistence;
}

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

async function GetAllFieldCloneDetail() {
  const response = await CommonGet('/api/Field/GetAllFieldCloneDetail');
  let plantDistence = []
  for (let item of Object.entries(response.data)) {
    plantDistence[item[1]["fieldCloneDetailID"]] = item[1]["fieldCloneName"]
  }
  return plantDistence;
}

async function deleteSectionItem(sectionDetailsID, modifiedBy) {
  const response = await CommonPost('/api/Field/DeleteSectionDetails', "sectionDetailsID=" + parseInt(sectionDetailsID), "&modifiedBy=" + parseInt(modifiedBy))
  return response.data;
}

async function deletePruningItem(pruningDetailsID, modifiedBy) {
  const response = await CommonPost('/api/Field/DeletePruningDetails', "pruningDetailsID=" + parseInt(pruningDetailsID), "&modifiedBy=" + parseInt(modifiedBy))
  return response.data;
}

async function getSectionDetails(fieldID) {
  const response = await CommonGet('/api/Field/GetSectionData', 'fieldID=' + parseInt(fieldID))
  return response;
}

async function GetFieldPlantingType() {
  const response = await CommonGet('/api/Field/GetFieldPlantingType');
  let plantDistence = []
  for (let item of Object.entries(response.data)) {
    plantDistence[item[1]["fieldPlantingTypeID"]] = item[1]["plantingTypeName"]
  }
  return plantDistence;

}

async function GetFieldPruningType() {
  const response = await CommonGet('/api/Field/GetPruningType');
  let PruningDistence = []
  for (let item of Object.entries(response.data)) {
    PruningDistence[item[1]["pruningTypeID"]] = item[1]["pruningTypeName"]
  }
  return PruningDistence;
}

async function getPruningDetailsByField(fieldID) {
  const response = await CommonGet('/api/Field/getPruningDetailsByField', "fieldID=" + parseInt(fieldID));
  return response.data;
}

