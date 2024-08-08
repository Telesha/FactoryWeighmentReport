import { CommonGet, CommonGetAxios, CommonPost } from '../../helpers/HttpClient';
import tokenService from '../../utils/tokenDecoder';

export default {
  getDivisionDetailsByEstateID,
  getEmployeeTypesForDropdown,
  // GetHarvestingJobsByFactoryID,
  getAllTaskSubCodesForDropDown,
  getFieldDetailsByDivisionID,
  getDailyPaymentDetails,
  updateDailyPaymentDetails,
  getAllGroups,
  getEstateDetailsByGroupID,
  GetFactoryJobs,
  calculateWages,
  calculateNonWages,
  GetDivisionDetailsByGroupID
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

async function getEmployeeTypesForDropdown() {
  var response = await CommonGet('/api/Task/GetEmployeeTypesData', null);
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["employeeTypeID"]] = item[1]["employeeTypeName"]
  }
  return array;
}

async function GetFactoryJobs(factoryId) {
  var response = await CommonGet('/api/Task/GetFactoryJobs', 'factoryId=' + parseInt(factoryId));
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["harvestingJobMasterID"]] = item[1]["jobName"]
  }
  return array;
}

async function getAllTaskSubCodesForDropDown(pluckingDate) {
  var response = await CommonGet('/api/Task/GetAllTaskSubCodes', "pluckingDate=" + pluckingDate);
  let taskArray = [];
  for (let item of Object.entries(response.data)) {
    taskArray[item[1]["taskID"]] = item[1]["taskSubCode"];
  }

  return taskArray;
  //return response.data;
}

async function getFieldDetailsByDivisionID(divisionID, pluckingDate) {
  let response = await CommonGet('/api/Field/GetFieldDetailsPluckingDate', "divisionID=" + parseInt(divisionID) + "&pluckingDate=" + (pluckingDate));
  let fieldArray = [];
  for (let item of Object.entries(response.data)) {
    fieldArray[item[1]["fieldID"]] = item[1]["fieldName"];
  }
  return fieldArray;
};

async function getDailyPaymentDetails(model) {
  const response = await CommonPost('/api/EmployeeWages/GetDailyReconciliationExecution', null, model);
  return response.data
}

async function updateDailyPaymentDetails(paymentDetails) {
  const dataArray = []
  paymentDetails.forEach(paymentDetail => {
    let model = {
      baseRate: parseFloat(paymentDetail.baseRate),
      createdBy: tokenService.getUserIDFromToken(),
      createdDate: paymentDetail.createdDate,
      employeeTypeName: paymentDetail.employeeTypeName,
      fieldCode: paymentDetail.fieldCode,
      fieldName: paymentDetail.fieldName,
      haverstingJobTypeName: paymentDetail.haverstingJobTypeName,
      labourTaskRateID: paymentDetail.labourTaskRateID,
      lessRate: parseFloat(paymentDetail.lessRate),
      overRate: parseFloat(paymentDetail.overRate),
      sectionID: paymentDetail.sectionID,
      target: parseFloat(paymentDetail.target),
      taskSubCode: paymentDetail.taskSubCode,
      maxMeasuringQuantity: paymentDetail.maxMeasuringQuantity
    }
    dataArray.push(model)
  });
  const response = await CommonPost('/api/EmployeeWages/UpdateDailyPaymentDetails', null, dataArray)
  return response;
}

async function calculateWages(model) {
  const response = await CommonPost('/api/EmployeeWages/GetDailyReconciliationExecution', null, model)
  return response;
}

async function calculateNonWages(model) {
  const response = await CommonPost('/api/EmployeeWages/GetDailyNonPluckingPaymentDetails', null, model)
  return response;
}

async function GetDivisionDetailsByGroupID(groupID) {
  let response = await CommonGet('/api/Division/GetDivisionDetailsByGroupID', "groupID=" + parseInt(groupID));
  let divisionArray = [];
  for (let item of Object.entries(response.data)) {
    divisionArray[item[1]["divisionID"]] = item[1]["divisionName"];
  }
  return divisionArray;
};