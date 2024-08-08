import React from "react";
import moment from "moment";
import { Card, CardContent, Grid, Typography, Box, Divider } from "@material-ui/core";

export default class ComponentToPrint extends React.Component {
    render() {
        const { employeeProfileData } = this.props;
        return (
            <div>
                <style>
                    {`
                        @page {
                            size: A4 portrait;
                            margin-top: 0.75in;
                            margin-bottom: 0.75in;
                            margin-right:0.75in;
                            margin-left: 0.75in;
                        }

                        .card {
                            margin: 10px;
                            padding: 3px; 
                            max-width: 1000px;
                            font-size: 14px; 
                        }
                    `}
                </style>
                <h2><u>Employee Profile</u></h2>
                <br />
                <br />
                <Box display="flex" justifyContent="center" alignItems="center">
                    {employeeProfileData.map((row, index) => (
                        <Card key={index} className="card">
                            <CardContent>
                                {employeeProfileData.map((row, index) => (
                                    <Grid container spacing={8} key={index}>
                                        <Grid item xs={6} style={{ textAlign: 'center' }}>
                                            <img
                                                src={row.convertedEmployeeImageData}
                                                alt={`${row.firstName} profile`}
                                                style={{ borderRadius: '10px', width: '200px', height: '200px', objectFit: 'cover' }}
                                            />
                                            <Typography variant="h5" gutterBottom style={{ marginTop: '10px' }}>
                                                <strong>{row.registrationNumber}</strong>
                                            </Typography>
                                            <Typography variant="h6" gutterBottom>
                                                <strong>{row.firstName}</strong>
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body1" gutterBottom>
                                                <strong>Business Division:</strong> {row.groupName}
                                            </Typography>
                                            <Typography variant="body1" gutterBottom>
                                                <strong>Location:</strong> {row.factoryName}
                                            </Typography>
                                            <Typography variant="body1" gutterBottom>
                                                <strong>Sub-Division:</strong> {row.employeeSubDivisionName}
                                            </Typography>
                                            <Typography variant="body1" gutterBottom>
                                                <strong>Work Location:</strong> {row.workLocation}
                                            </Typography>
                                            <Typography variant="body1" gutterBottom>
                                                <strong>Pay Point:</strong> {row.payPointName}
                                            </Typography>
                                            <Typography variant="body1" gutterBottom>
                                                <strong>Employee Sub Category:</strong> {row.employeeSubCategoryName}
                                            </Typography>
                                            <Typography variant="body1" gutterBottom>
                                                <strong>Date Of Birth:</strong> {moment(row.dateOfBirth).format('YYYY-MM-DD')}
                                            </Typography>
                                            <Typography variant="body1" gutterBottom>
                                                <strong>Joining Date:</strong> {moment(row.joiningDate).format('YYYY-MM-DD')}
                                            </Typography>
                                        </Grid>
                                        {index !== employeeProfileData.length - 1 && (
                                            <Grid item xs={12}>
                                                <Divider />
                                            </Grid>
                                        )}
                                    </Grid>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            </div>
        );
    }
}
