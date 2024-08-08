import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
    GetAllGroups,
    GetEmployeeTypesData,
    getEstateDetailsByGroupID,
    getDivisionDetailsByEstateID,
    getCardRegenerateDetails,
    updateCard

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

async function GetEmployeeTypesData() {
    var response = await CommonGet('/api/Task/GetEmployeeTypesData', null);
    let array = []
    for (let item of Object.entries(response.data)) {
        array[item[1]["employeeTypeID"]] = item[1]["employeeTypeName"]
    }
    return array;
}

async function getDivisionDetailsByEstateID(estateID) {
    const response = await CommonGet('/api/Division/getDivisionDetailsByEstateID', 'estateID=' + parseInt(estateID));
    let array = []
    for (let item of Object.entries(response.data)) {
        array[item[1]["divisionID"]] = item[1]["divisionName"]
    }
    return array;
}

async function getCardRegenerateDetails(groupID,estateID,divisionID, employeeTypeID) {
    const res = await CommonGet('/api/EmployeeCardManagement/GetEmployeeCardsToRegenerate', 'groupID=' + groupID + '&estateID='+ estateID +'&divisionID=' + divisionID + '&employeeTypeID=' + employeeTypeID);
    return res.data;
}

async function updateCard(data) {
    const response = await CommonPost('/api/EmployeeCardManagement/UpdateEmployeeCardsToRegeneration', null, data);
    return response;
}