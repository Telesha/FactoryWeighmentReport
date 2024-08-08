import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';
import moment from 'moment';

export default {
    getGroupsForDropdown,
    getFactoriesByGroupID,
    getVehicleDetails,
    getVehicleTypes,
    updateVehicleDetail,
    saveVehicleDetail,
    GetVehicleDetailsByVehicleID
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

async function getVehicleDetails(model){
    const response = await CommonPost('/api/VehicleRegistration/GetVehicleDetails', null, model);
    return response;
}


async function getVehicleTypes() {
    const response = await CommonGet('/api/VehicleRegistration/GetVehicleTypes', null);
    let VehicleTypeArray = []
    for (let item of Object.entries(response.data)) {
        VehicleTypeArray[item[1]["vehicleTypeID"]] = item[1]["vehicleName"]
    }
    return VehicleTypeArray;
}

async function updateVehicleDetail(Vehicle) {
    let updateModel = {
        vehicleID: parseInt(Vehicle.vehicleID),
        factoryID: parseInt(Vehicle.factoryID),
        groupID: parseInt(Vehicle.groupID),
        vehicleTypeID: parseInt(Vehicle.vehicleTypeID),
        vehicleNumber: Vehicle.vehicleNumber,
        fuelTypeID: parseInt(Vehicle.fuelTypeID),
        capacity: Vehicle.capacity === "" ? null : Vehicle.capacity,
        purchaseYear: Vehicle.purchaseYear === "" ? null : Vehicle.purchaseYear,
        purchaseValue: parseFloat(parseFloat(Vehicle.purchaseValue).toFixed(2).toString()) === NaN ? null : parseFloat(parseFloat(Vehicle.purchaseValue).toFixed(2).toString()),
        manufactureBy: Vehicle.manufactureBy === "" ? null : Vehicle.manufactureBy,
        engineNumber: Vehicle.engineNumber === "" ? null : Vehicle.engineNumber,
        chassisNumber: Vehicle.chassisNumber === "" ? null : Vehicle.chassisNumber,
        applicableDate: moment(Vehicle.applicableDate).format('YYYY-MM-DD') === "Invalid date" ? null : moment(Vehicle.applicableDate).format('YYYY-MM-DD'),
        manufactureYear: Vehicle.manufactureYear === "" ? null : Vehicle.manufactureYear,
        expiryDateTax: moment(Vehicle.expiryDateTax).format('YYYY-MM-DD') === "Invalid date" ? null : moment(Vehicle.expiryDateTax).format('YYYY-MM-DD'),
        expiryDateFitness: moment(Vehicle.expiryDateFitness).format('YYYY-MM-DD') === "Invalid date" ? null : moment(Vehicle.expiryDateFitness).format('YYYY-MM-DD'),
        isActive: Vehicle.isActive,
        modifiedBy: tokenDecoder.getUserIDFromToken(),
        modifiedDate: new Date().toISOString(),
    }
    const response = await CommonPost('/api/VehicleRegistration/UpdateVehicle', null, updateModel);
    return response;
}

async function saveVehicleDetail(values) {
    let saveModel = {
        vehicleID: isNaN(parseInt(values.vehicleID)) ? null : parseInt(values.vehicleID),
        factoryID: parseInt(values.factoryID),
        groupID: parseInt(values.groupID),
        vehicleTypeID: parseInt(values.vehicleTypeID),
        vehicleNumber: values.vehicleNumber,
        fuelTypeID: parseInt(values.fuelTypeID),
        capacity: values.capacity === "" ? null : values.capacity,
        purchaseYear: values.lastYear === "" ? null : values.lastYear,
        purchaseValue: parseFloat(parseFloat(values.purchaseValue).toFixed(2).toString()) === NaN ? null : parseFloat(parseFloat(values.purchaseValue).toFixed(2).toString()),
        manufactureBy: values.manufactureBy === "" ? null : values.manufactureBy,
        engineNumber: values.engineNumber === "" ? null : values.engineNumber,
        chassisNumber: values.chassisNumber === "" ? null : values.chassisNumber,
        applicableDate: moment(values.applicableDate).format('YYYY-MM-DD') === "Invalid date" ? null : moment(values.applicableDate).format('YYYY-MM-DD'),
        manufactureYear: values.manufactureYear === "" ? null : values.manufactureYear,
        expiryDateTax: moment(values.expiryDateTax).format('YYYY-MM-DD') === "Invalid date" ? null : moment(values.expiryDateTax).format('YYYY-MM-DD'),
        expiryDateFitness: moment(values.expiryDateFitness).format('YYYY-MM-DD') === "Invalid date" ? null : moment(values.expiryDateFitness).format('YYYY-MM-DD'),
        isActive: values.isActive,
        createdBy: parseInt(tokenDecoder.getUserIDFromToken()),
        createdDate: new Date().toISOString()
    }
    const response = await CommonPost('/api/VehicleRegistration/SaveVehicle', null, saveModel);
    return response;
}

async function GetVehicleDetailsByVehicleID(vehicleID) {
    const response = await CommonGet('/api/VehicleRegistration/GetVehicleDetailsByID', "vehicleID=" + parseInt(vehicleID));
    return response.data;
}




