import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
    getGroupsForDropdown,
    getFactoriesByGroupID,
    getIgnoreSessionDetails,
    updateIgnoreSession,
    saveIgnoreSession,
    getIgnoreSessionDetailsByID,
    getDivisionByEstateID,
    updateIgnoreSessionStatus
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

async function getIgnoreSessionDetails(model) {
    const response = await CommonPost('/api/IgnoreSession/GetIgnoreSessionDetails', null, model);
    return response.data;
}

async function updateIgnoreSession(updateModel) {

    const response = await CommonPost('/api/IgnoreSession/UpdateIgnoreSessionDetails', null, updateModel);
    return response;
}
async function saveIgnoreSession(saveModel) {
    const response = await CommonPost('/api/IgnoreSession/SaveIgnoreSessionDetails', null, saveModel);
    return response;
}
async function getIgnoreSessionDetailsByID(ignoreSessionID) {

    const response = await CommonGet('/api/IgnoreSession/GetIgnoreSessionDetailsByID', "DeductionID=" + parseInt(ignoreSessionID));
    return response.data;
}

async function updateIgnoreSessionStatus(model) {
    const response = await CommonPost('/api/IgnoreSession/UpdateIgnoreSessionStatus', null, model);
    return response;
}