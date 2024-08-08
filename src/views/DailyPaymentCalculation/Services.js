import { CommonGet, CommonGetAxios, CommonPost } from '../../helpers/HttpClient';
import tokenService from '../../utils/tokenDecoder';

export default {
  getDivisionDetailsByEstateID,
  getEmployeeTypesForDropdown,
  // GetHarvestingJobsByFactoryID,
  getAllTaskSubCodesForDropDown,
  getFieldDetailsByDivisionID,
  executeCrossJob,
  getDailyPaymentDetails,
  updateDailyPaymentDetails,
  getAllGroups,
  getEstateDetailsByGroupID,
  GetFactoryJobs,
  calculateWages,
  calculateNonWages,
  checkPreviouspaymentComplete,
  checkDetailsBeforeRunSalary,
  calculateCrossWages,
  GetWeekHolidayDetails,
  GetCurrentSalaryWeek,
  CheckWhetherEntireWeekSalaryRunExceptOffday,
  CheckPluckingSeason,
  GetDivisionDetailsByGroupID,
  GetAllEmployeeSubCategoryMapping
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

async function GetDivisionDetailsByGroupID(groupID) {
  let response = await CommonGet('/api/Division/GetDivisionDetailsByGroupID', "groupID=" + parseInt(groupID));
  let divisionArray = [];
  for (let item of Object.entries(response.data)) {
    divisionArray[item[1]["divisionID"]] = { name: item[1]["divisionName"], id: item[1]["estateID"] }
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
}

async function getFieldDetailsByDivisionID(divisionID, pluckingDate) {
  let response = await CommonGet('/api/Field/GetFieldDetailsPluckingDate', "divisionID=" + parseInt(divisionID) + "&pluckingDate=" + (pluckingDate));
  let fieldArray = [];
  for (let item of Object.entries(response.data)) {
    fieldArray[item[1]["fieldID"]] = item[1]["fieldName"];
  }
  return fieldArray;
};

async function GetAllEmployeeSubCategoryMapping() {
  var response = await CommonGet('/api/Employee/GetAllEmployeeSubCategoryMapping');
  // let array = []
  // for (let item of Object.entries(response.data)) {
  //   array[item[1]["employeeSubCategoryMappingID"]] = { name: item[1]["employeeSubCategoryName"], id: item[1]["employeeTypeID"] }
  // }
  return response.data;
}

async function executeCrossJob(model) {
  const response = await CommonPost('/api/EmployeeWages/ExecuteCrossJob', null, model);
  return response
}

async function getDailyPaymentDetails(model) {
  const response = await CommonPost('/api/EmployeeWages/GetDailyPaymentDetails', null, model);
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
  const response = await CommonPost('/api/EmployeeWages/GetDailyPluckingAttendanceDetails', null, model)
  return response;
}

async function calculateNonWages(model) {
  const response = await CommonPost('/api/EmployeeWages/GetDailyNonPluckingPaymentDetails', null, model)
  return response;
}

async function calculateCrossWages(model) {
  const response = await CommonPost('/api/EmployeeWages/GetDailyCrossJobPaymentDetails', null, model)
  return response;
}

async function checkPreviouspaymentComplete(date, estateID) {
  let model = {
    date: date,
    estateID: parseInt(estateID)
  }
  const response = await CommonPost('/api/EmployeeWages/CheckPreviouspaymentComplete', null, model)
  return response;
}

async function checkDetailsBeforeRunSalary(date, estateID, divisionID, employeeTypeID, employeeSubCategoryMappingID) {
  let model = {
    date: date,
    estateID: parseInt(estateID),
    divisionID: parseInt(divisionID),
    employeeTypeID: employeeTypeID,
    employeeSubCategoryMappingID: employeeSubCategoryMappingID,
  }
  const response = await CommonPost('/api/EmployeeWages/CheckDetailsBeforeRunSalary', null, model)
  return response.data;
}

async function GetWeekHolidayDetails(date, estateID) {
  const response = await CommonGet('/api/EmployeeWages/GetWeekHolidayDetails', "date=" + (date) + "&estateID=" + parseInt(estateID));
  return response;
};

async function GetCurrentSalaryWeek(estateID) {
  const response = await CommonGet('/api/EmployeeWages/GetCurrentSalaryWeek', "estateID=" + parseInt(estateID));
  return response.data;
};

async function CheckWhetherEntireWeekSalaryRunExceptOffday(model) {
  const response = await CommonPost('/api/EmployeeWages/CheckWhetherEntireWeekSalaryRunExceptOffday', null, model);
  return response;
};

async function CheckPluckingSeason(date, estateID, divisionID) {
  const response = await CommonGet('/api/EmployeeWages/CheckPluckingSeason', "FromDate=" + (date) + "&OperationEntityID=" + parseInt(estateID) + "&CostCenterID=" + parseInt(divisionID));
  return response;
};