import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
    getGroupsForDropdown,
    getFactoriesByGroupID,
    getDeductionDetails,
    updateDeductionTemplate,
    SaveDeductionTemplate,
    getDeductionDetailsByID,
    getDivisionByEstateID,
    getMobileMenuList,
    getDeductionTypeList,
    getApplyMethodList
};


async function getFactoriesByGroupID(groupID) {
    var factoryArray = [];
    const response = await CommonGet('/api/Group/GetFactoryByGroupID', "groupID=" + parseInt(groupID));
    for (let item of Object.entries(response.data)) {
        if (item[1]["isActive"] == true) {
            factoryArray[item[1]["factoryID"]] = item[1]["factoryName"];
        }
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
async function getDivisionByEstateID(estateID) {
    let response = await CommonGet('/api/Division/getDivisionDetailsByEstateID', "estateID=" + parseInt(estateID));
    let divisionArray = [];
    for (let item of Object.entries(response.data)) {
        divisionArray[item[1]["divisionID"]] = item[1]["divisionName"];
    }
    return divisionArray;
};

async function getMobileMenuList() {
    let response = await CommonGet('/api/DeductionTemplate/GetMobileMenuList');
    let mobileMenuArray = [];
    for (let item of Object.entries(response.data)) {
        mobileMenuArray[item[1]["mobileMenuID"]] = item[1]["menuName"];
    }
    return mobileMenuArray;
};

async function getDeductionTypeList(deductiontype) {
    let response = await CommonPost('/api/DeductionTemplate/GetDeductionTypeList', null, deductiontype);
    let deductionTypeArray = [];
    for (let item of Object.entries(response.data)) {
        deductionTypeArray[item[1]["deductionTypeID"]] = item[1]["deductionTypeName"];
    }
    return deductionTypeArray;
};

async function getApplyMethodList() {
    var response = await CommonGet('/api/DeductionTemplate/GetApplyMethodEnumData', null);
    var array = []
    for (let item of Object.entries(response.data)) {
        array[item[1]["key"]] = item[1]["value"]
    }
    return array;
}

async function getDeductionDetails(groupID, operationEntityID, costCenterID) {
    const response = await CommonGet('/api/DeductionTemplate/GetDeductionDetails', "groupID=" + parseInt(groupID) + "&operationEntityID=" + parseInt(operationEntityID) + "&costCenterID=" + parseInt(costCenterID));
    return response.data;
}

async function updateDeductionTemplate(updateModel) {

    const response = await CommonPost('/api/DeductionTemplate/UpdateDeductionTemplate', null, updateModel);
    return response;
}
async function SaveDeductionTemplate(saveModel) {
    const response = await CommonPost('/api/DeductionTemplate/SaveDeductionTemplate', null, saveModel);
    return response;
}
async function getDeductionDetailsByID(deductionID) {
    const response = await CommonGet('/api/DeductionTemplate/GetDeductionDetailsByID', "DeductionID=" + parseInt(deductionID));
    return response.data;
}