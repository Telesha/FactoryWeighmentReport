import React from "react";

export default class ComponentToPrint extends React.Component {

  render() {
    const employeeData = this.props.employeeData != undefined ? this.props.employeeData.slice() : [];
    return (
      <div style={{ width: '100%' }}>
        <style>
          {`
            @media print {
                .pagebreak {
                clear: both;
                page-break-after: always;
                }
            }
          `}
        </style>
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
          {employeeData.length > 0 ? employeeData.map((value, index) => {

            return (
              <div style={{border:'4px solid black', fontFamily:'sans-serif', flex: '1 0 45%', margin:'15px'}}>
                <table style={{padding:'5px'}}>
                  <thead>
                    <tr style={{ fontSize: '14px' }}>
                      <th colSpan={4} style={{ textAlign: 'center', paddingTop: '10px' }}>{value.data.masterGroupName}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ fontSize: '14px', borderBottom: "2px solid black" }}>
                      <td colSpan={2} style={{ textAlign: 'left', borderBottom: "2px solid black", fontWeight: 'bold', paddingBottom: '10px', paddingTop: "10px" }}>{value.data.factoryName}</td>
                      <td colSpan={2} style={{ textAlign: 'right', borderBottom: "2px solid black", fontWeight: 'bold', paddingBottom: '10px', paddingTop: "10px" }}>{value.data.divisionName}</td>
                    </tr>
                    <tr style={{ fontSize: '14px', borderTop: '2px solid black' }}>
                      <td colSpan={4} style={{ textAlign: 'left', fontWeight: 'bold', paddingTop: '10px' }}>{value.data.groupName}</td>
                    </tr>
                    <tr>
                      <td colSpan={2} style={{ textAlign: 'left', fontWeight: 'bold' }}>{value.data.employeeSubCategoryName}</td>
                      <td colSpan={2} style={{ textAlign: 'right', fontSize: '22px', fontWeight: 'bold' }}>{value.data.registrationNumber}</td>
                    </tr>
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'left', fontSize: '22px', fontWeight: 'bold', paddingTop: '10px', paddingBottom: '10px' }}>{value.data.employeeName}</td>
                    </tr>
                  </tbody>
                </table>
                {(index + 1) % 8 === 0 ? <div className='pagebreak'></div> : null}
              </div>
            )
          }) : null}
          {employeeData.length % 2 != 0 ? <div style={{ flex: '1 0 45%' }}></div> : null}
        </div>
      </div>
    );

  }

}
