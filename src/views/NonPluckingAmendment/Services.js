import { getDate } from 'date-fns';
import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
  getAllGroups,
  GetNonPluckingAmendmentDetails,
  getEstateDetailsByGroupID,
  getDivisionDetailsByEstateID,
  GetFactoryJobs,
  getFieldDetailsByDivisionID,
  getEmployeeTypesForDropdown,
  getGangDetailsByDivisionID,
  GetOperatorListByDateAndGardenIDForLabourChecklistReport,
  UpdateNonPluckingAmendment,
  DeleteNonPluckingAmendment,
  getSirdersForDropdown,
  getTaskNamesByOperationID,
  getSirdersForDropdownForEdit,
  getGangDetailsByDivisionIDForEdit,
  getFieldDetailsByDivisionIDForEdit,
  getTaskNamesByOperationIDForEdit,
  getEmployeeTypesForDropdownForEdit,
  getOperatorsForDropdown,
  getEmployeeDetailsByFactoryIDRegistrationNumber,
  getRatesQuntitiesByTaskID,
  getStatus,
  getAllFactoriesByGroupID,
  SaveNonPluckingAttendance,
  GetOperatorListByDateAndGardenIDForLabourChecklistReportForEdit,
  getMobileAccessibleUsers,
  getGangDetailsByDivisionIDByEmpID,
  SaveNonPluckingAttendanceOnebyone,
  getNonPLOldDetails,
  GetEmployeeDetailsAndNonPluckingAttendance,
  NewSaveNonPluckingAttendance,
  NewUpdateNonPluckingAttendance,
  GetMobileAccessibleUsersOperationEntityID,
  GetSirdersByOperationEntityID,
  GetAllEmployeeSubCategoryMapping,
  GetDivisionDetailsByGroupID,
  GetRegistrationNumbersByIDs,
  GetMappedProductsByFactoryID,
  GetTaskNamesByProductID,
  GetTaskNamesByTaskCode
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

async function GetNonPluckingAmendmentDetails(model) {
  let response = await CommonPost('/api/NonPluckingAmendment/GetNonPluckingAmendmentData', null, model);
  return response;
}

async function getDivisionDetailsByEstateID(estateID) {
  let response = await CommonGet('/api/Division/getDivisionDetailsByEstateID', "estateID=" + parseInt(estateID));
  let divisionArray = [];
  for (let item of Object.entries(response.data)) {
    divisionArray[item[1]["divisionID"]] = item[1]["divisionName"];
  }
  return divisionArray;
};

async function GetFactoryJobs(factoryId) {
  var response = await CommonGet('/api/Task/GetFactoryJobs', 'factoryId=' + parseInt(factoryId));
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["harvestingJobMasterID"]] = item[1]["jobName"]
  }
  return array;
}

async function getFieldDetailsByDivisionID(divisionID) {
  let response = await CommonGet('/api/Field/getFieldDetailsByDivisionID', "divisionID=" + parseInt(divisionID));
  return response.data;
};

async function getGangDetailsByDivisionID(costCenterID) {
  let response = await CommonGet('/api/Gang/getGangDetailsByDivisionID', "divisionID=" + parseInt(costCenterID));
  return response.data;
};

async function GetOperatorListByDateAndGardenIDForLabourChecklistReport(factoryID, date) {
  let response = await CommonGet('/api/User/GetOperatorListByDateAndGardenIDForWorkerAttendanceNonPluckingReport', "factoryID=" + parseInt(factoryID) + "&date=" + date);
  return response.data;
};

async function getEmployeeTypesForDropdown() {
  var response = await CommonGet('/api/Task/GetEmployeeTypesData', null);
  return response.data;
}

async function UpdateNonPluckingAmendment(updateModel) {
  const response = await CommonPost('/api/NonPluckingAmendment/UpdateNonPluckingAmendment', null, updateModel);
  return response;
}

async function DeleteNonPluckingAmendment(deleteModel) {
  const response = await CommonPost('/api/NonPluckingAmendment/DeleteNonPluckingAmendment', null, deleteModel);
  return response;
}

async function getSirdersForDropdown() {
  var response = await CommonGet('/api/Employee/GetSirders', null);
  let estateArray = [];
  for (let item of Object.entries(response.data)) {
    estateArray[item[1]["employeeID"]] = item[1]["employeeName"];
  }
  return estateArray;
}

async function getTaskNamesByOperationID(gardenID) {
  const response = await CommonGet('/api/Task/GetTaskNamesByOperationID', 'gardenID=' + parseInt(gardenID))
  return response.data;
}

async function GetTaskNamesByProductID(productID) {
  const response = await CommonGet('/api/Task/GetTaskNamesByProductID', 'productID=' + parseInt(productID))
  return response.data;
}

async function GetTaskNamesByTaskCode(taskCode, workLocationID) {
  const response = await CommonGet('/api/Task/GetTaskNamesByTaskCode', 'taskCode=' + taskCode + "&workLocationID=" + parseInt(workLocationID))
  return response;
}

async function getSirdersForDropdownForEdit() {
  var response = await CommonGet('/api/Employee/GetSirders', null);
  return response.data;
}

async function getNonPLOldDetails(model) {
  var response = await CommonPost('/api/NonPluckingAmendment/GetNonPLOldDetails', null, model);
  return response;
}

async function getGangDetailsByDivisionIDForEdit(costCenterID) {
  let response = await CommonGet('/api/Gang/getGangDetailsByDivisionID', "divisionID=" + parseInt(costCenterID));
  let estateArray = [];
  for (let item of Object.entries(response.data)) {
    estateArray[item[1]["gangID"]] = item[1]["gangName"];
  }
  return estateArray;
};

async function getGangDetailsByDivisionIDByEmpID(registrationNumber, gardenID) {
  let response = await CommonGet('/api/Gang/getGangDetailsByDivisionIDAndEmpID', "registrationNumber=" + (registrationNumber) + "&gardenID=" + parseInt(gardenID));
  let estateArray = [];
  for (let item of Object.entries(response.data)) {
    estateArray[item[1]["gangID"]] = item[1]["gangName"];
  }
  return estateArray;
};

async function getFieldDetailsByDivisionIDForEdit(divisionID) {
  let response = await CommonGet('/api/Field/getFieldDetailsByDivisionID', "divisionID=" + parseInt(divisionID));
  let estateArray = [];
  for (let item of Object.entries(response.data)) {
    estateArray[item[1]["fieldID"]] = item[1]["fieldName"];
  }
  return estateArray;
};

async function getEmployeeTypesForDropdownForEdit() {
  var response = await CommonGet('/api/Task/GetEmployeeTypesData', null);
  let estateArray = [];
  for (let item of Object.entries(response.data)) {
    estateArray[item[1]["employeeTypeID"]] = item[1]["employeeTypeName"];
  }
  return estateArray;
}

async function SaveNonPluckingAttendance(otherDeductionDetails) {
  let array = otherDeductionDetails
  const response = await CommonPost('/api/NonPluckingManualAttendance/SaveNonPluckingAttendance', null, array);
  return response;
}

async function getAllFactoriesByGroupID(groupID) {
  let response = await CommonGet('/api/Factory/GetAllFactoriesByGroupID', 'groupID=' + parseInt(groupID));
  let factoryArray = []
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"]
  }
  return factoryArray;
}


async function getEmployeeDetailsByFactoryIDRegistrationNumber(factoryID, regNo) {
  const response = await CommonGet('/api/OtherDeduction/GetEmployeeDetailsByFactoryIDRegistrationNumber', 'factoryID=' + parseInt(factoryID) + "&regNo=" + regNo);
  return response;
}
async function getStatus(id, employeeTypeID) {
  const response = await CommonGet('/api/OtherDeduction/GetAllProductOrderStatusNonPluckingAttendance', "id=" + parseInt(id) + "&employeeTypeID=" + parseInt(employeeTypeID));
  return response.data;
}


async function getOperatorsForDropdown(date) {
  var response = await CommonGet('/api/NonPluckingManualAttendance/GetOperatorsByDateForNonPluckAttend', "date=" + date);
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["userID"]] = { name: item[1]["userName"] }
  }
  return array;
}


async function getRatesQuntitiesByTaskID(taskID, employeeTypeID, genderID, divisionID) {
  const response = await CommonGet('/api/NonPluckingManualAttendance/GetRatesQuntitiesByTaskID', 'taskID=' + parseInt(taskID) + '&employeeTypeID=' + parseInt(employeeTypeID) + '&genderID=' + parseInt(genderID) + '&divisionID=' + parseInt(divisionID));
  return response;
}

async function GetOperatorListByDateAndGardenIDForLabourChecklistReportForEdit(factoryID, date) {
  let response = await CommonGet('/api/User/GetOperatorListByDateAndGardenIDForWorkerAttendanceNonPluckingReport', "factoryID=" + parseInt(factoryID) + "&date=" + date);
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["userID"]] = { name: item[1]["userName"] }
  }
  return array;
};

async function getMobileAccessibleUsers() {
  let response = await CommonGet('/api/User/GetMobileAccessibleUsers', null);
  let mobileUsersArray = [];
  for (let item of Object.entries(response.data)) {
    mobileUsersArray[item[1]["userID"]] = {
      firstName: item[1]["firstName"], lastName: item[1]["lastName"]
    };
  }
  return mobileUsersArray;
}

async function getTaskNamesByOperationIDForEdit(gardenID) {
  const response = await CommonGet('/api/Task/GetTaskNamesByOperationID', 'gardenID=' + parseInt(gardenID))
  let estateArray = [];
  for (let item of Object.entries(response.data)) {
    estateArray[item[1]["taskID"]] = item[1]["taskName"];
  }
  return estateArray;
}

async function SaveNonPluckingAttendanceOnebyone(otherDeductionDetails) {
  const response = await CommonPost('/api/NonPluckingManualAttendance/SaveNonPluckingAttendanceOnebyone', null, otherDeductionDetails);
  return response;
}

async function GetEmployeeDetailsAndNonPluckingAttendance(model) {
  const response = await CommonPost('/api/NewNonPluckingManualAttendance/GetEmployeeDetailsAndNonPluckingAttendance', null, model);
  return response;
}

async function NewSaveNonPluckingAttendance(array) {
  const response = await CommonPost('/api/NewNonPluckingManualAttendance/NewSaveNonPluckingAttendance', null, array);
  return response;
}

async function NewUpdateNonPluckingAttendance(array) {
  const response = await CommonPost('/api/NewNonPluckingManualAttendance/NewUpdateNonPluckingAttendance', null, array);
  return response;
}

async function GetMobileAccessibleUsersOperationEntityID(gardenID) {
  let response = await CommonGet('/api/User/GetMobileAccessibleUsersOperationEntityID', 'operationEntityID=' + parseInt(gardenID));
  let mobileUsersArray = [];
  for (let item of Object.entries(response.data)) {
    mobileUsersArray[item[1]["userID"]] = {
      firstName: item[1]["firstName"], lastName: item[1]["lastName"]
    };
  }
  return mobileUsersArray;
}

async function GetSirdersByOperationEntityID(gardenID) {
  var response = await CommonGet('/api/Employee/GetSirdersByOperationEntityID', 'operationEntityID=' + parseInt(gardenID));
  let estateArray = [];
  for (let item of Object.entries(response.data)) {
    estateArray[item[1]["employeeID"]] = item[1]["employeeName"];
  }
  return estateArray;
}

async function GetAllEmployeeSubCategoryMapping() {
  var response = await CommonGet('/api/NonPluckingAmendment/GetAllEmployeeSubCategoryMapping', null);
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["employeeSubCategoryMappingID"]] = item[1]["employeeSubCategoryName"]
  }
  return array;
}

async function GetDivisionDetailsByGroupID(groupID) {
  let response = await CommonGet('/api/Division/GetDivisionDetailsByGroupID', "groupID=" + parseInt(groupID));
  let divisionArray = [];
  for (let item of Object.entries(response.data)) {
    divisionArray[item[1]["divisionID"]] = item[1]["divisionName"];
  }
  return divisionArray;
};

async function GetMappedProductsByFactoryID(estateID) {
  const response = await CommonGet('/api/Product/GetMappedProductsByFactoryID', 'estateID=' + parseInt(estateID));
  let product = []
  for (let item of Object.entries(response.data)) {
    product[item[1]["productID"]] = item[1]["productName"]
  }
  return product;
}

async function GetRegistrationNumbersByIDs(model) {
  const response = await CommonPost('/api/NewNonPluckingManualAttendance/GetRegistrationNumbersByIDs', null, model);
  return response;
}