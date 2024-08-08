import React from "react";
import {QRCodeCanvas} from 'qrcode.react';


export default class ComponentToPrint extends React.Component {

  renderqr(data) {
    let qrdata = (data == undefined || data == null || data.length === 0) ? null : (
      data.map((d) => {
        return (
          <div className="table-responsive row-top-gap">
            <br></br><br></br><br></br>
            <table>
              <thead>
                <tr>
                  <th style={{ fontWeight: "bold", textAlign: "left", fontSize: "20px" }} colSpan="5" width="50%" height="70">Name : {d.employeeName}</th>
                  <th style={{ fontWeight: "bold", textAlign: "left", fontSize: "20px" }} colSpan="3" width="25%">Gender : {d.genderID == 1 ? 'Male' : d.genderID ==2 ? 'Female' : null}</th>
                  <th colSpan="4" rowSpan="5" width="30%"><QRCodeCanvas id={d.registrationNumber} value={d.registrationNumber} size={250} bgColor="#FFFFFF" fgColor="#000000" /></th>
                </tr>
                <tr>
                  <th style={{ fontWeight: "bold", textAlign: "left", fontSize: "20px" }} colSpan="4" height="70">Date Of Birth : {d.dateOfBirth.split('T')[0]}</th>
                  <th style={{ fontWeight: "bold", textAlign: "left", fontSize: "20px" }} colSpan="4" width="40%">NIC : {d.nicNumber}</th>
                </tr>
                <tr>
                  <th style={{ fontWeight: "bold", textAlign: "left", fontSize: "20px" }} colSpan="4" height="70">Mobile NO : {d.mobileNumber}</th>
                  <th style={{ fontWeight: "bold", textAlign: "left", fontSize: "20px" }} colSpan="4" width="40%">REG NO : {d.registrationNumber}</th>
                </tr>
                <tr>
                  <th style={{ fontWeight: "bold", textAlign: "left", fontSize: "20px" }} colSpan="4" height="70">Card NO : {d.cardNumber}</th>
                  <th style={{ fontWeight: "bold", textAlign: "left", fontSize: "20px" }} colSpan="4" width="40%">Group : {d.groupName}</th>
                </tr>
                <tr>
                  <th style={{ fontWeight: "bold", textAlign: "left", fontSize: "20px" }} colSpan="4" height="70">Estate : {d.estateName}</th>
                  <th style={{ fontWeight: "bold", textAlign: "left", fontSize: "20px" }} colSpan="4" width="40%">Division : {d.divisionName}</th>
                </tr>
              </thead>
            </table>
            <br></br><br></br><br></br>
            <br></br><br></br><br></br>
          </div>
        )
      })
    );
    return (
      <div>
        {qrdata}
      </div>
    )
  }

  render() {
    const renderqr = this.renderqr(this.props.data);
    return (
      <table>
        <tbody>
          {renderqr}
        </tbody>
      </table>
    );
  };
}


















