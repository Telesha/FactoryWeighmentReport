import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';


export default {
    getGroupsForDropdown,
    getFactoryByGroupID,
    getDivisionDetailsByEstateID,
    getDivisionDetailsByEstateID,
    getMobileAccessibleUsers,
    savePackageDetail,
    getPackagesByFactoryID,
    GetPackageDetailsByPackageID,
    updatePackageDetails,
    getDivisionDetailsByEstateID
  };

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

  async function getDivisionDetailsByEstateID(estateID) {
    let response = await CommonGet('/api/Division/getDivisionDetailsByEstateID', "estateID=" + parseInt(estateID));
    let divisionArray = [];
    for (let item of Object.entries(response.data)) {
      divisionArray[item[1]["divisionID"]] = item[1]["divisionName"];
    }
    return divisionArray;
  };

  async function getMobileAccessibleUsers(){
    let response = await CommonGet('/api/User/GetMobileAccessibleUsers',null);
    let mobileUsersArray = [];
    for (let item of Object.entries(response.data)) {
      mobileUsersArray[item[1]["userID"]] = {
        firstName: item[1]["firstName"],
        lastName: item[1]["lastName"]
      };
    }
    return mobileUsersArray;
  }

  async function savePackageDetail(saveModel){
    const response = await CommonPost('/api/Package/SavePackage', null, saveModel);
    return response;
  }

  async function getPackagesByFactoryID(factoryID,groupID,divisionID) {
    const response = await CommonGet('/api/Package/GetPackagesByFactoryID', "FactoryID=" + parseInt(factoryID) + "&GroupID=" + parseInt(groupID)+ "&DivisionID=" + parseInt(divisionID));
    return response.data;
  }

  async function GetPackageDetailsByPackageID(packageID) {
    const response = await CommonGet('/api/Package/GetPackageDetailsByPackageID', "PackageID=" + parseInt(packageID));
    return response.data;
}

async function updatePackageDetails(updateModel){
    const response = await CommonPost('/api/Package/UpdatePackage', null, updateModel);
    return response;
}