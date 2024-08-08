import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  getEmployeeDetailsByFactoryIDGroupID,
  getGroupsForDropdown,
  getFactoryByGroupID,
  getRoutesForDropDown,
  getAllRoutesForDropDown,
  getBanksForDropdown,
  saveEmployee,
  getEmployeeGeneralDetailsByEmployeeID,
  getEmployeePaymentDetailsByEmployeeID,
  getEmployeeSupplimentaryDetailsByEmployeeID,
  getEmployeeStandingOrderDetailsByEmployeeID,
  getEmployeeFundsDetailsByEmployeeID,
  getEmployeeBioMetricsDetailsByEmployeeID,
  updateEmployee,
  DeleteEmployeeBiometricItem,
  DeleteSupplierBiometricItem,
  getBranchesByBankID,
  getAllBranches,
  getFundsForDropdown,
  getFundAmountWithFundID,
  getStandingFundsByCustomerID,
  getStandingOrdersByCustomerID,
  DeleteEmployeeStandingOrderItem,
  DeleteEmployeeStandingFundItem,
  getBanksForTable,
  getBranchesByBankIDForTable,
  DeleteEmployeeSupplimentary,
  getEmployeeTypesForDropdown,
  getEmployeeCategoriesForDropdown,
  getEmployeeSubCategoriesForDropdown,
  getTitlesForDropDown,
  getEmployeeReligions,
  getEmployeeRaises,
  GetEmployeeCountries,
  getDivisionDetailsByEstateID,
  getGangDetailsByDivisionID,
  GetHarvestingJobsByEmployeeType,
  getDesignationsByEmployeeCategoryID,
  getEmployeeMobileAllowDetailsByEmployeeID,
  getEmployeeDetails,
  getEmployeeSubCategoryMappingForDropdown,
  GetEmployeePaymentMode,
  GetEmployeePaymentType,
  GetEmployeeSubCategoryMappingByEmployeeTypeID,
  GetAllEmployeeSubCategoryMapping,
  GetAllDivisions,
  GetDivisionDetailsByGroupID,
  GetEmpAndLabouronBookCount,
  GetAllRelationshipsForDropDown,
  GetSupplimentaryDetailsCheck,
  getPermantEmployeeRegNo,
  GetEmployeeProfile
};

async function getAllBranches() {
  const response = await CommonGet('/api/Branch/GetAllBranches');
  return response.data;
}

async function getBranchesByBankID(bankID) {
  const response = await CommonGet('/api/Branch/GetBranchesByBankID', 'bankID=' + bankID);
  var branchArray = [];
  for (let item of Object.entries(response.data)) {
    branchArray[item[1]["branchID"]] = item[1]["branchName"];
  }
  return branchArray;

}
async function getBranchesByBankIDForTable(bankID) {
  const response = await CommonGet('/api/Branch/GetBranchesByBankID', 'bankID=' + bankID);
  return response.data;

}

async function getEmployeeDetailsByFactoryIDGroupID(factoryID, groupID) {
  const response = await CommonGet('/api/Employee/GetEmployeeDetails', 'factoryID=' + factoryID + '&groupID=' + groupID);
  return response.data;

}

async function getEmployeeDetails(model) {
  const response = await CommonPost('/api/Employee/GetEmployeeDetailsByModel', null, model);
  return response.data;

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

async function getFactoryByGroupID(groupID) {
  var factoryArray = [];

  const response = await CommonGet('/api/Group/GetFactoryByGroupID', 'groupID=' + groupID)
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"]
  }
  return factoryArray;
}

async function getRoutesForDropDown(factoryID) {
  var routeArray = [];

  const response = await CommonGet('/api/Group/GetRouteByFactoryID', 'factoryID=' + factoryID)
  for (let item of Object.entries(response.data)) {
    routeArray[item[1]["routeID"]] = item[1]["routeName"]
  }
  return routeArray;
}

async function getAllRoutesForDropDown() {
  var routeArray = [];

  const response = await CommonGet('/api/Route/GetAllRoutes', null)
  for (let item of Object.entries(response.data)) {
    if (item[1]["isActive"] === true) {
      routeArray[item[1]["routeID"]] = item[1]["routeName"]
    }
  }
  return routeArray;
}

async function getBanksForTable() {
  const response = await CommonGet('/api/Bank/GetAllBanks', null);
  return response.data;
}

async function getBanksForDropdown() {
  var bankArray = [];
  const response = await CommonGet('/api/Bank/GetAllBanks', null);
  for (let item of Object.entries(response.data)) {
    bankArray[item[1]["bankID"]] = item[1]["bankName"];
  }
  return bankArray;
}

async function getFundsForDropdown(factoryID) {
  var fundArray = [];
  const response = await CommonGet('/api/Customer/GetAllActiveFunds', null);

  for (let item of Object.entries(response.data)) {
    if (parseInt(item[1]["factoryID"]) === parseInt(factoryID)) {
      fundArray[item[1]["fundMasterID"]] = item[1]["fundName"];
    }
  }
  return fundArray;
}

async function getEmployeeTypesForDropdown() {
  var response = await CommonGet('/api/Task/GetEmployeeTypesData', null);
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["employeeTypeID"]] = { name: item[1]["employeeTypeName"], code: item[1]["employeeTypeCode"] }
  }
  return array;
}
async function getEmployeeCategoriesForDropdown() {
  var response = await CommonGet('/api/Employee/GetEmployeeCategories', null);
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["employeeCategoryID"]] = { name: item[1]["employeeCategoryName"], code: item[1]["employeeCategoryCode"] }
  }
  return array;
}
async function getEmployeeSubCategoriesForDropdown() {
  var response = await CommonGet('/api/Employee/GetEmployeeSubCategories', null);
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["employeeSubCategoryID"]] = item[1]["employeeSubCategoryName"]
  }
  return array;
}
async function getEmployeeSubCategoryMappingForDropdown(employeeTypeID, employeeCategoryID) {
  var response = await CommonGet('/api/Employee/GetEmployeeSubCategoryMappingByEmployeeTypeIDEmployeeCategoryID',
    'employeeTypeID=' + parseInt(employeeTypeID) + '&employeeCategoryID=' + parseInt(employeeCategoryID));
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["employeeSubCategoryMappingID"]] = item[1]["employeeSubCategoryName"]
  }
  return array;
}
async function GetEmployeeSubCategoryMappingByEmployeeTypeID(employeeTypeID) {
  var response = await CommonGet('/api/Employee/GetEmployeeSubCategoryMappingByEmployeeTypeID',
    'employeeTypeID=' + parseInt(employeeTypeID));
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["employeeSubCategoryMappingID"]] = item[1]["employeeSubCategoryName"]
  }
  return array;
}
async function GetEmployeePaymentMode() {
  var response = await CommonGet('/api/Employee/GetEmployeePaymentMode', null)
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["paymentModeID"]] = item[1]["paymentModeName"]
  }
  return array;
}
async function GetEmployeePaymentType() {
  var response = await CommonGet('/api/Employee/GetEmployeePaymentType', null)
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["paymentTypeID"]] = item[1]["paymentTypeName"]
  }
  return array;
}
async function getTitlesForDropDown() {
  var response = await CommonGet('/api/Employee/GetEmployeeTitles', null)
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["employeeTitleID"]] = item[1]["employeeTitleName"]
  }
  return array;
}
async function getEmployeeReligions() {
  var response = await CommonGet('/api/Employee/GetEmployeeReligions', null)
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["religionID"]] = item[1]["religionName"]
  }
  return array;
}
async function getEmployeeRaises() {
  var response = await CommonGet('/api/Employee/GetEmployeeRaises', null)
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["raiseID"]] = item[1]["raiseName"]
  }
  return array;
}
async function GetEmployeeCountries() {
  var response = await CommonGet('/api/Employee/GetEmployeeCountries', null)
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["countryID"]] = item[1]["countryName"]
  }
  return array;
}

async function GetAllDivisions() {
  var response = await CommonGet('/api/Division/GetAllDivisions', null)
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["divisionID"]] = item[1]["divisionName"]
  }
  return array;
}

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
    divisionArray[item[1]["divisionID"]] = item[1]["divisionName"];
  }
  return divisionArray;
};

async function getGangDetailsByDivisionID(divisionID) {
  let response = await CommonGet('/api/Gang/getGangDetailsByDivisionID', "divisionID=" + parseInt(divisionID));
  let gangArray = [];
  for (let item of Object.entries(response.data)) {
    gangArray[item[1]["gangID"]] = item[1]["gangName"];
  }
  return gangArray;
};
async function getDesignationsByEmployeeCategoryID(employeeSubCategoryMappingID) {
  let response = await CommonGet('/api/Employee/GetDesignationsByEmployeeCategoryID', "employeeSubCategoryMappingID=" + parseInt(employeeSubCategoryMappingID));
  let designationArray = []
  for (let item of Object.entries(response.data)) {
    designationArray[item[1]["designationID"]] = item[1]["designationName"]
  }
  return designationArray;
}
async function GetHarvestingJobsByEmployeeType(EmployeeTypeID, FactoryID) {
  const response = await CommonGet('/api/Employee/GetHarvestingJobsByEmployeeType', 'EmployeeTypeID=' + parseInt(EmployeeTypeID) + '&FactoryID=' + parseInt(FactoryID));
  return response.data;
}

async function getFundAmountWithFundID() {
  const response = await CommonGet('/api/Customer/GetFundAmountWithFundID', null);
  return response.data;
}


async function saveEmployee(data) {
  let employeeSaveModel = {
    employeeID: 0,
    groupID: parseInt(data.employeeGeneralArray.groupID),
    operationEntityID: parseInt(data.employeeGeneralArray.factoryID),
    employeeTypeID: parseInt(data.employeeGeneralArray.employeeTypeID),
    employeeCategoryID: parseInt(data.employeeGeneralArray.employeeCategoryID),
    employeeSubCategoryID: parseInt(data.employeeGeneralArray.employeeSubCategoryID),
    designationID: parseInt(data.employeeGeneralArray.designationID),
    basicMonthlySalary: parseFloat(data.employeeGeneralArray.basicMonthlySalary),
    basicDailySalary: data.employeeGeneralArray.basicDailySalary == "" ? parseFloat(0) : parseFloat(data.employeeGeneralArray.basicDailySalary),
    SpecialAllowance: data.employeeGeneralArray.specialAllowance == "" ? parseFloat(0) : parseFloat(data.employeeGeneralArray.specialAllowance),
    OtherAllowance: data.employeeGeneralArray.otherAllowance == "" ? parseFloat(0) : parseFloat(data.employeeGeneralArray.otherAllowance),
    dateOfBirth: data.employeeGeneralArray.dob,
    joiningDate: data.employeeGeneralArray.joiningDate,
    retiredDate: data.employeeGeneralArray.retiredDate,
    FirstName: data.employeeGeneralArray.firstName,
    secondName: data.employeeGeneralArray.secondName,
    lastName: data.employeeGeneralArray.lastName,
    nICNumber: data.employeeGeneralArray.nICNumber,
    city: data.employeeGeneralArray.city,
    address1: data.employeeGeneralArray.address,
    address2: data.employeeGeneralArray.addresstwo,
    address3: data.employeeGeneralArray.addressthree,
    registrationNumber: data.employeeGeneralArray.registrationNumber,
    isEPFEnable: parseInt(data.employeeGeneralArray.isEPFEnable),
    ePFNumber: data.employeeGeneralArray.epfNumber,
    email: data.employeeGeneralArray.email,
    genderID: parseInt(data.employeeGeneralArray.genderID),
    homeNumber: data.employeeGeneralArray.homeNumber,
    religionID: parseInt(data.employeeGeneralArray.religionID),
    mobileNumber: data.employeeGeneralArray.mobileNumber,
    titleID: parseInt(data.employeeGeneralArray.titleID),
    areaType: parseInt(data.employeeGeneralArray.areaType),
    area: parseFloat(data.employeeGeneralArray.area),
    isActive: data.employeeGeneralArray.isActive,
    createdBy: tokenDecoder.getUserIDFromToken(),
    createdDate: new Date().toISOString(),
    employeeCode: data.employeeGeneralArray.employeeCode,
    biometricModel: data.employeeBiometricArray,
    paymentMethodModel: data.paymentMethodArray == null ? null : data.paymentMethodArray[0],
    supplimentaryModel: data.supplimentaryArray,
    standingOrders: data.standingOrdersArray,
    standingFunds: data.standingFundsArray,
    countryID: parseInt(data.employeeGeneralArray.countryID),
    employeeDivisionID: parseInt(data.employeeGeneralArray.employeeDivisionID),
    gangID: parseInt(data.employeeGeneralArray.gangID),
    haverstingJobTypeID: data.employeeGeneralArray.haverstingJobTypeID.length > 0 ? data.employeeGeneralArray.haverstingJobTypeID.map(job => job.haverstingJobTypeID) : [],
    raiseID: parseInt(data.employeeGeneralArray.raiseID),
    identityType: parseInt(data.employeeGeneralArray.identityTypeID),
    mobileCredentialsModel: data.mobileCredentialsArray,
    bookNumber: data.employeeGeneralArray.bookNumber,
    statusID: parseInt(data.employeeGeneralArray.statusID),
    rationQuantity: data.employeeGeneralArray.rationQuantity == "" ? parseFloat(0) : parseFloat(data.employeeGeneralArray.rationQuantity),
    khethLandDeductionQuantity: data.employeeGeneralArray.khethLandDeductionQuantity == "" ? parseFloat(0) : parseFloat(data.employeeGeneralArray.khethLandDeductionQuantity),
    employeeSubCategoryMappingID: parseInt(data.employeeGeneralArray.employeeSubCategoryMappingID),
    paymentTypeID: parseInt(data.employeeGeneralArray.paymentTypeID),
    paymentModeID: parseInt(data.employeeGeneralArray.paymentModeID),
    specialtyID: parseInt(data.employeeGeneralArray.specialtyID),
    postalCode: data.employeeGeneralArray.postalCode === '' ? null : data.employeeGeneralArray.postalCode,
    postOffice: data.employeeGeneralArray.postOffice === '' ? null : data.employeeGeneralArray.postOffice,
    policeStation: data.employeeGeneralArray.policeStation === '' ? null : data.employeeGeneralArray.policeStation,
    addressPresent: data.employeeGeneralArray.addressPresent === '' ? null : data.employeeGeneralArray.addressPresent,
    dateOfConfirmation: data.employeeGeneralArray.dateOfConfirmation === '' ? null : data.employeeGeneralArray.dateOfConfirmation,
    workLocationID: parseInt(data.employeeGeneralArray.workLocationID),
    payPointID: parseInt(data.employeeGeneralArray.payPointID),
    expiredDate: data.employeeGeneralArray.expiredDate === '' ? null : data.employeeGeneralArray.expiredDate,
    resignedDate: data.employeeGeneralArray.resignedDate === '' ? null : data.employeeGeneralArray.resignedDate,
    terminatedDate: data.employeeGeneralArray.terminatedDate === '' ? null : data.employeeGeneralArray.terminatedDate,
    rationCardNumber: data.employeeGeneralArray.rationCardNumber
  }
  const response = await CommonPost('/api/Employee/SaveEmployee', null, employeeSaveModel);
  return response;
}
async function getEmployeeGeneralDetailsByEmployeeID(employeeID) {
  const response = await CommonGet('/api/Employee/GetEmployeeDetailsByEmployeeID', "employeeID=" + parseInt(employeeID));
  return response.data;
}

async function getEmployeePaymentDetailsByEmployeeID(employeeID) {
  const response = await CommonGet('/api/Employee/GetPaymentsDetailsByEmployeeID', "employeeID=" + parseInt(employeeID));
  return response.data;
}

async function getEmployeeSupplimentaryDetailsByEmployeeID(employeeID) {
  const response = await CommonGet('/api/Employee/GetEmployeeSupplimentaryDetailsByEmployeeID', "employeeID=" + parseInt(employeeID));
  return response.data;
}

async function getEmployeeStandingOrderDetailsByEmployeeID(employeeID) {
  const response = await CommonGet('/api/Employee/GetEmployeeStandingOrderDetailsByEmployeeID', "employeeID=" + parseInt(employeeID));
  return response.data;
}

async function getEmployeeFundsDetailsByEmployeeID(employeeID) {
  const response = await CommonGet('/api/Employee/GetEmployeeFundsDetailsByEmployeeID', "employeeID=" + parseInt(employeeID));
  return response.data;
}

async function getEmployeeBioMetricsDetailsByEmployeeID(employeeID) {
  const response = await CommonGet('/api/Employee/GetEmployeeBioMetricsDetailsByEmployeeID', "employeeID=" + parseInt(employeeID));
  return response.data;
}
async function getEmployeeMobileAllowDetailsByEmployeeID(employeeID) {
  const response = await CommonGet('/api/Employee/GetEmployeeMobileAllowDetailsByEmployeeID', "employeeID=" + parseInt(employeeID));
  return response.data;
}

async function updateEmployee(data) {
  let updateModel = {
    employeeID: parseInt(data.employeeID),
    groupID: parseInt(data.employeeGeneralArray.groupID),
    operationEntityID: parseInt(data.employeeGeneralArray.factoryID),
    registrationNumber: data.employeeGeneralArray.registrationNumber,
    dateOfBirth: data.employeeGeneralArray.dob === '' ? null : data.employeeGeneralArray.dob,
    joiningDate: data.employeeGeneralArray.joiningDate === '' ? null : data.employeeGeneralArray.joiningDate,
    retiredDate: data.employeeGeneralArray.retiredDate === '' ? null : data.employeeGeneralArray.retiredDate,
    employeeTypeID: parseInt(data.employeeGeneralArray.employeeTypeID),
    employeeCategoryID: parseInt(data.employeeGeneralArray.employeeCategoryID),
    employeeSubCategoryID: parseInt(data.employeeGeneralArray.employeeSubCategoryID),
    designationID: parseInt(data.employeeGeneralArray.designationID),
    basicMonthlySalary: parseFloat(data.employeeGeneralArray.basicMonthlySalary),
    basicDailySalary: parseFloat(data.employeeGeneralArray.basicDailySalary),
    SpecialAllowance: parseFloat(data.employeeGeneralArray.specialAllowance),
    OtherAllowance: parseFloat(data.employeeGeneralArray.otherAllowance),
    FirstName: data.employeeGeneralArray.firstName,
    secondName: data.employeeGeneralArray.secondName,
    lastName: data.employeeGeneralArray.lastName,
    nICNumber: data.employeeGeneralArray.nICNumber,
    city: data.employeeGeneralArray.city,
    address1: data.employeeGeneralArray.address,
    address2: data.employeeGeneralArray.addresstwo,
    address3: data.employeeGeneralArray.addressthree,
    isEPFEnable: parseInt(data.employeeGeneralArray.isEPFEnable),
    ePFNumber: data.employeeGeneralArray.epfNumber,
    email: data.employeeGeneralArray.email,
    genderID: parseInt(data.employeeGeneralArray.genderID),
    homeNumber: data.employeeGeneralArray.homeNumber,
    religionID: parseInt(data.employeeGeneralArray.religionID),
    raiseID: parseInt(data.employeeGeneralArray.raiseID),
    mobileNumber: data.employeeGeneralArray.mobileNumber,
    titleID: parseInt(data.employeeGeneralArray.titleID),
    areaType: parseInt(data.employeeGeneralArray.areaType),
    area: parseFloat(data.employeeGeneralArray.area),
    isActive: data.employeeGeneralArray.isActive.isActiveResult == undefined ? data.employeeGeneralArray.isActive : data.employeeGeneralArray.isActive.isActiveResult,
    employeeCode: data.employeeGeneralArray.employeeCode,
    bookNumber: data.employeeGeneralArray.bookNumber,
    modifiedBy: tokenDecoder.getUserIDFromToken(),
    modifiedDate: new Date().toISOString(),
    BiometricUpdateModel: data.employeeBiometricArray,
    PaymentMethodUpdateModel: data.paymentMethodArray[0],
    SupplimentaryUpdateModel: data.supplimentaryArray,
    standingFunds: data.standingFundsArray,
    StandingOrdersUpdate: data.standingOrdersArray,
    haverstingJobTypeID: data.employeeGeneralArray.haverstingJobTypeID.length > 0 ? data.employeeGeneralArray.haverstingJobTypeID.map(job => job.haverstingJobTypeID) : [],
    countryID: parseInt(data.employeeGeneralArray.countryID),
    employeeDivisionID: parseInt(data.employeeGeneralArray.employeeDivisionID),
    gangID: parseInt(data.employeeGeneralArray.gangID),
    identityType: parseInt(data.employeeGeneralArray.identityTypeID),
    statusID: parseInt(data.employeeGeneralArray.statusID),
    mobileCredentialsModel: data.mobileCredentialsArray,
    rationQuantity: data.employeeGeneralArray.rationQuantity === "" || data.employeeGeneralArray.rationQuantity === null ? parseFloat(0) :
      parseFloat(data.employeeGeneralArray.rationQuantity),
    khethLandDeductionQuantity: data.employeeGeneralArray.khethLandDeductionQuantity === "" || data.employeeGeneralArray.khethLandDeductionQuantity === null ? parseFloat(0) :
      parseFloat(data.employeeGeneralArray.khethLandDeductionQuantity),
    employeeSubCategoryMappingID: parseInt(data.employeeGeneralArray.employeeSubCategoryMappingID),
    paymentTypeID: parseInt(data.employeeGeneralArray.paymentTypeID),
    paymentModeID: parseInt(data.employeeGeneralArray.paymentModeID),
    specialtyID: parseInt(data.employeeGeneralArray.specialtyID),
    postalCode: data.employeeGeneralArray.postalCode === '' ? null : data.employeeGeneralArray.postalCode,
    postOffice: data.employeeGeneralArray.postOffice === '' ? null : data.employeeGeneralArray.postOffice,
    policeStation: data.employeeGeneralArray.policeStation === '' ? null : data.employeeGeneralArray.policeStation,
    addressPresent: data.employeeGeneralArray.addressPresent === '' ? null : data.employeeGeneralArray.addressPresent,
    dateOfConfirmation: data.employeeGeneralArray.dateOfConfirmation === '' ? null : data.employeeGeneralArray.dateOfConfirmation,
    workLocationID: parseInt(data.employeeGeneralArray.workLocationID),
    payPointID: parseInt(data.employeeGeneralArray.payPointID),
    expiredDate: data.employeeGeneralArray.expiredDate === '' ? null : data.employeeGeneralArray.expiredDate,
    resignedDate: data.employeeGeneralArray.resignedDate === '' ? null : data.employeeGeneralArray.resignedDate,
    terminatedDate: data.employeeGeneralArray.terminatedDate === '' ? null : data.employeeGeneralArray.terminatedDate,
    rationCardNumber: data.employeeGeneralArray.rationCardNumber
  }
  const response = await CommonPost('/api/Employee/UpdateEmployee', null, updateModel);
  return response;
}

async function DeleteEmployeeBiometricItem(employeeBiometricID) {
  const response = await CommonGet('/api/Employee/DeleteEmployeeBiometricItem', "employeeBiometricID=" + employeeBiometricID);
  return response.data;
}

async function DeleteSupplierBiometricItem(customerSupplimentaryBiometricID) {
  const response = await CommonGet('/api/Customer/DeleteSupplierBiometricItem', "customerSupplimentaryBiometricID=" + customerSupplimentaryBiometricID);
  return response.data;
}

async function getStandingFundsByCustomerID(customerID) {
  const response = await CommonGet('/api/Customer/getStandingFundsByCustomerID', "customerID=" + parseInt(customerID));
  return response.data;
}

async function getStandingOrdersByCustomerID(customerID) {
  const response = await CommonGet('/api/Customer/GetStandingOrdersByCustomerID', "customerID=" + parseInt(customerID));
  return response.data;
}

async function DeleteEmployeeStandingOrderItem(standingOrderID) {
  const response = await CommonGet('/api/Employee/DeleteEmployeeStandingOrderItem', "standingOrderID=" + parseInt(standingOrderID));
  return response.data;
}

async function DeleteEmployeeStandingFundItem(fundID) {
  const response = await CommonGet('/api/Employee/DeleteEmployeeStandingFund', "fundID=" + parseInt(fundID));
  return response.data;
}

async function DeleteEmployeeSupplimentary(employeeSupplimentaryID, modifiedBy) {
  const response = await CommonPost('/api/Employee/DeleteEmployeeSupplimentary', "modifiedBy=" + parseInt(modifiedBy), employeeSupplimentaryID);
  return response.data;
}

async function GetAllEmployeeSubCategoryMapping() {
  var response = await CommonGet('/api/Employee/GetAllEmployeeSubCategoryMapping');
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["employeeSubCategoryMappingID"]] = item[1]["employeeSubCategoryName"]
  }
  return array;
}

async function GetEmpAndLabouronBookCount(operationEntityID) {
  const response = await CommonGet('/api/Employee/GetEmpAndLabouronBookCount', 'operationEntityID=' + parseInt(operationEntityID))
  return response.data;
}

async function GetAllRelationshipsForDropDown() {
  var relationshipArray = [];
  const response = await CommonGet('/api/Employee/GetAllRelationshipsForDropDown', null)
  for (let item of Object.entries(response.data)) {
    relationshipArray[item[1]["employeeRelationshipID"]] = item[1]["employeeRelationshipName"]
  }
  return relationshipArray;
}

async function GetSupplimentaryDetailsCheck(employeeID, relationship) {
  const response = await CommonGet('/api/Employee/GetSupplimentaryDetailsCheck', 'employeeID=' + parseInt(employeeID) + "&relationship=" + parseInt(relationship))
  return response.data;
}

async function getPermantEmployeeRegNo(operationEntityID, employeeDivisionID) {
  const response = await CommonGet('/api/LeaveRequest/GetPermantEmployeeRegNo', "operationEntityID=" + parseInt(operationEntityID) + "&employeeDivisionID=" + parseInt(employeeDivisionID));
  return response.data;
}

async function GetEmployeeProfile(model) {
  const response = await CommonPost('/api/EmployeeProfile/GetEmployeeProfile', null, model)
  return response;
}