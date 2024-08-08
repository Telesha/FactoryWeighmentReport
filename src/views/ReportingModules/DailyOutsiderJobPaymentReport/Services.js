import { CommonGet, CommonPost } from '../../../helpers/HttpClient';

export default {
  getAllGroups,
  GetOffDayCashPaymentDetails,
  getEstateDetailsByGroupID,
  getDivisionDetailsByEstateID,
  GetFactoryJobs,
  getFieldDetailsByDivisionID,
  getEmployeeTypesForDropdown
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

async function GetOffDayCashPaymentDetails(model) {
  let newmodel = {
    Date: new Date(model.applicableDate),
    HarvestJobTypeID: parseInt(model.factoryJobID),
    EmployeeTypeID: parseInt(model.empTypeID),
    //FieldID: parseInt(model.fieldID)
  }
  let response = await CommonPost('/api/DailyOutsiderJobPaymentReport/GetDailyOutsiderJobPaymentReportData', null, newmodel);
  return response;
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

async function GetFactoryJobs(factoryId, date) {
  var response = await CommonGet('/api/Task/GetFactoryJobsOutsiderJob', 'factoryId=' + parseInt(factoryId) + '&date=' + date);
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["harvestingJobMasterID"]] = item[1]["jobName"]
  }
  return array;
}

async function getFieldDetailsByDivisionID(divisionID, date) {
  let response = await CommonGet('/api/Field/getFieldDetailsByDivisionIDGenaralJob', "divisionID=" + parseInt(divisionID) + '&date=' + date);
  let fieldArray = [];
  for (let item of Object.entries(response.data)) {
    fieldArray[item[1]["fieldID"]] = item[1]["fieldName"];
  }
  return fieldArray;
};

async function getEmployeeTypesForDropdown() {
  var response = await CommonGet('/api/Task/GetEmployeeTypesData', null);
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["employeeTypeID"]] = { name: item[1]["employeeTypeName"], code: item[1]["employeeTypeCode"] }
  }
  return array;
}
