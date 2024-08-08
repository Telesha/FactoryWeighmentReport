import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
    GetAllGroups,
    GetLandDistributionsByGroupIDOperationEntityID,
    GetLandDistributionsDetailsByLandDistributionID,
    SaveLandDistribution,
    UpdateLandDistributions,
    getEstateDetailsByGroupID,
    GetAllLandDescriptions,
    GetAllPrintPriorityByLandDescriptionID,
    GetAllLandDescriptionsWithoutSelected,
    GetGrantAreaByOperationEntityID
};

async function GetAllGroups() {
    let response = await CommonGet('/api/Group/GetAllGroups');
    let groupArray = [];
    for (let item of Object.entries(response.data)) {
        if (item[1]["isActive"] === true) {
            groupArray[item[1]["groupID"]] = item[1]["groupName"];
        }
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

async function GetLandDistributionsByGroupIDOperationEntityID(groupID, operationEntityID) {
    const response = await CommonGet('/api/LandDistribution/GetLandDistributionsByGroupIDOperationEntityID', "groupID=" + parseInt(groupID) + '&operationEntityID=' + parseInt(operationEntityID))
    return response.data;
}

async function GetAllPrintPriorityByLandDescriptionID(landDescriptionID) {
    const response = await CommonGet('/api/LandDistribution/GetAllPrintPriorityByLandDescriptionID', "landDescriptionID=" + parseInt(landDescriptionID))
    return response.data;
}

async function GetLandDistributionsDetailsByLandDistributionID(landDistributionID) {
    const response = await CommonGet('/api/LandDistribution/GetLandDistributionsDetailsByLandDistributionID', 'landDistributionID=' + parseInt(landDistributionID))
    return response.data[0];
}

async function SaveLandDistribution(values) {
    let saveModel = {
        landDistributionID: 0,
        groupID: parseInt(values.groupID),
        operationEntityID: parseInt(values.operationEntityID),
        landDescriptionID: parseInt(values.landDescriptionID),
        printPriority: parseInt(values.printPriority),
        area: parseFloat(values.area),
        createdBy: parseInt(tokenDecoder.getUserIDFromToken())
    }
    const response = await CommonPost('/api/LandDistribution/SaveLandDistribution', null, saveModel);
    return response;
}

async function UpdateLandDistributions(updateModel) {
    const response = await CommonPost('/api/LandDistribution/UpdateLandDistributions', null, updateModel);
    return response;
}

async function GetAllLandDescriptions() {
    var response = await CommonGet('/api/LandDistribution/GetAllLandDescriptions', null);
    let array = []
    for (let item of Object.entries(response.data)) {
        array[item[1]["landDescriptionID"]] = item[1]["landDescription"]
    }
    return array;
}

async function GetAllLandDescriptionsWithoutSelected(operationEntityID) {
    var response = await CommonGet('/api/LandDistribution/GetAllLandDescriptionsWithoutSelected', 'operationEntityID=' + parseInt(operationEntityID));
    let array = []
    for (let item of Object.entries(response.data)) {
        array[item[1]["landDescriptionID"]] = item[1]["landDescription"]
    }
    return array;
}

async function GetGrantAreaByOperationEntityID(operationEntityID) {
    const response = await CommonGet('/api/LandDistribution/GetGrantAreaByOperationEntityID', 'operationEntityID=' + parseInt(operationEntityID))
    return response.data;
}