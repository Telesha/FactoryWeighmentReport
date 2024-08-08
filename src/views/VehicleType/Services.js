import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
    getGroupsForDropdown,
    getFactoriesByGroupID,
    GetVehicleTypeDetails,
    SaveVehicleType,
    updateVehicleType,
    GetVehicleTypeDetailsByID
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

async function GetVehicleTypeDetails(factoryID) {
    const response = await CommonGet('/api/VehicleType/GetVehicleTypeDetails', 'factoryID=' + parseInt(factoryID))
    return response;
}

async function SaveVehicleType(vehicleTypeList) {
    let saveModel = {
        vehicleTypeID: isNaN(parseInt(vehicleTypeList.vehicleTypeID)) ? null : parseInt(vehicleTypeList.vehicleTypeID),
        groupID: parseInt(vehicleTypeList.groupID),
        factoryID: parseInt(vehicleTypeList.factoryID),
        vehicleTypeCode: vehicleTypeList.vehicleTypeCode,
        vehicleName: vehicleTypeList.vehicleName,
        isActive: vehicleTypeList.isActive,
        createdBy: tokenDecoder.getUserIDFromToken(),
        createdDate: new Date().toISOString()
    }
    const response = await CommonPost('/api/VehicleType/SaveVehicleType', null, saveModel);
    return response;
}

async function updateVehicleType(vehicleTypeList) {
    let updateModel = {
        vehicleTypeID: parseInt(vehicleTypeList.vehicleTypeID),
        factoryID: parseInt(vehicleTypeList.factoryID),
        vehicleTypeCode: vehicleTypeList.vehicleTypeCode,
        vehicleName: vehicleTypeList.vehicleName,
        isActive: vehicleTypeList.isActive,
        modifiedBy: tokenDecoder.getUserIDFromToken(),
        modifiedDate: new Date().toISOString(),
    }
    const response = await CommonPost('/api/VehicleType/UpdateVehicleType', null, updateModel);
    return response;
}

async function GetVehicleTypeDetailsByID(vehicleTypeID) {
    const response = await CommonGet('/api/VehicleType/GetVehicleTypeDetailsByID', "vehicleTypeID=" + parseInt(vehicleTypeID));
    return response.data;
}




