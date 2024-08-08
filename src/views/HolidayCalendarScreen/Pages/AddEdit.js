import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box,
    Card,
    Grid,
    TextField,
    makeStyles,
    Container,
    Button,
    CardContent,
    InputLabel,
    CardHeader,
    Divider,
    MenuItem,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from "formik";
import * as Yup from "yup";
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import moment from 'moment';
import MaterialTable from "material-table";
// import AddCircleIcon from '@mui/icons-material/AddCircle';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    },
    avatar: {
        marginRight: theme.spacing(2)
    }

}));

const currentProps = {
    border: 3,
    style: { width: '50rem', height: '12rem' },
};

var screenCode = "HOLIDAYCALENDAR"
export default function HolidayCalendarScreen(props) {
    const [title, setTitle] = useState("Add Holiday")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [costCenters, setCostCenters] = useState();
    const [eventType, setEventType] = useState([]);
    const [initialState, setInitialState] = useState(false);
    const [holiDay, setHoliday] = useState({
        groupID: 0,
        operationEntityID: 0,
        eventID: 0,
        divisionID: 0
    });
    const [selectedDate, setSelectedDate] = useState(null);
    const [EventName, setEventName] = useState({
        eventName: ''
    });
    const [events, setEvents] = useState([]);
    const [FailedList, setFailedList] = useState([]);
    const [isFailed, setIsFailed] = useState(false);
    const [isDisableButton, setIsDisableButton] = useState(false);
    const [expandedBox, setExpandedBox] = useState(false);
    const [changePadding, setChangePadding] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentEventToDelete, setCurrentEventToDelete] = useState(null);
    const navigate = useNavigate();
    const alert = useAlert();
    let decrypted = 0;
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });
    const formattedDate = formatDate(selectedDate);
    const handleDateChange = (date) => {
        setSelectedDate(date);
        setExpandedBox(true);
        setChangePadding(true);
    };

    useEffect(() => {
        trackPromise(getPermissions(), getGroupsForDropdown());
    }, []);

    useEffect(() => {
        if (holiDay.groupID > 0) {
            trackPromise(
                getfactoriesForDropDown()
            )
            setIsFailed(false);
        }
    }, [holiDay.groupID]);

    useEffect(() => {
        if (!initialState) {
            trackPromise(getPermissions());
        }
    }, []);

    useEffect(() => {
        if (holiDay.operationEntityID > 0) {
            trackPromise(
                getCostCenterDetailsByGardenID()
            )
            setIsFailed(false);
        }
    }, [holiDay.operationEntityID]);

    useEffect(() => {
        if (initialState) {
            setHoliday((prevState) => ({
                ...prevState,
                operationEntityID: 0,
                divisionID: 0,
            }));
        }
    }, [holiDay.groupID, initialState]);

    useEffect(() => {
        if (initialState) {
            setHoliday((prevState) => ({
                ...prevState,
                divisionID: 0
            }));
        }
    }, [holiDay.operationEntityID, initialState]);

    useEffect(() => {
        if (holiDay.divisionID > 0) {
            trackPromise(
                geteventForDropDown()
            )
            setIsFailed(false);
        }
    }, [holiDay.divisionID]);

    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITHOLIDAY');
        if (isAuthorized === undefined) {
            navigate('/404');
        }
        var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');
        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
        });
        if (decrypted == 0) {
            setHoliday({
                ...holiDay,
                groupID: parseInt(tokenService.getGroupIDFromToken()),
                operationEntityID: parseInt(tokenService.getFactoryIDFromToken()),
            })
            setInitialState(true);
        }
    }

    async function getGroupsForDropdown() {
        const groups = await services.getGroupsForDropdown();
        setGroups(groups);
    }

    async function getfactoriesForDropDown() {
        const factory = await services.getFactoriesByGroupID(holiDay.groupID);
        setFactories(factory);
    }

    async function getCostCenterDetailsByGardenID() {
        var response = await services.getDivisionDetailsByEstateID(holiDay.operationEntityID);
        setCostCenters(response);
    };

    async function geteventForDropDown() {
        var event = await services.geteventBygardenID(holiDay.operationEntityID, holiDay.divisionID);
        setEventType(event);
    }

    function generateDropDownMenu(data) {
        let items = []
        if (data != null) {
            for (const [key, value] of Object.entries(data)) {
                items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
            }
        }
        return items
    }

    const Date_Click_Fun = (date) => {
        setSelectedDate(moment(date).format('YYYY-MM-DD'));
    };

    const Event_Data_Update = (event) => {
        const target = event.target;
        const value = target.value;
        setHoliday({
            ...holiDay,
            [event.target.name]: value
        });
        setEventName({
            ...EventName,
            eventName: eventType[event.target.value]
        });
    };

    const Create_Event_Fun = () => {
        setIsDisableButton(false);
        setIsFailed(false);
        setHoliday({
            ...holiDay,
            eventID: 0
        })
        let sameDate = 0
        for (let i = 0; i < events.length; i++) {
            if (events[i].date === selectedDate) {
                sameDate = 1;
                break;
            }
        }
        if (sameDate == 1) {
            alert.error('Cannot add two events on the same day.');
        }
        else {
            if (selectedDate && EventName.eventName) {
                const newEvent = {
                    id: (new Date().getTime()).toString(),
                    eventID: parseInt(eventType.findIndex(type => type === EventName.eventName)),
                    date: moment(selectedDate).format('YYYY-MM-DD'),
                    title: EventName.eventName,
                    operationEntityID: parseInt(holiDay.operationEntityID),
                    operationEntityName: factories[holiDay.operationEntityID],
                    description: EventName.eventName == 'Holiday' ? 'Holiday' : getDayOfWeek(selectedDate),
                    createdBy: tokenService.getUserIDFromToken(),
                    divisionID: parseInt(holiDay.divisionID),
                    divisionName: costCenters[holiDay.divisionID]
                };
                setEvents([...events, newEvent]);
                setSelectedDate(null);
                setEventName("");
                setSelectedDate(newEvent.date);
            }
        }
    };

    const Delete_Event_Fun = (eventId) => {
        const updated_Events = events.filter((event) => event.id !== eventId);
        setEvents(updated_Events);
    };
    const handleDeleteClick = (eventId) => {
        setCurrentEventToDelete(eventId);
        setOpenDialog(true);
    };

    function cardTitle(titleName) {
        return (
            <Grid container spacing={1}>
                <Grid item md={10} xs={12}>
                    {titleName}
                </Grid>
            </Grid>
        )
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value;
        setHoliday({
            ...holiDay,
            [e.target.name]: value
        });
    }

    async function SaveHolidayCalendar() {
        setIsDisableButton(true);
        let response = await services.saveHolidayCalendar(events);
        if (response.statusCode == "Success" && response.data == 0) {
            alert.success(response.message);
        }
        else if (response.statusCode == "Success" && response.data != 0) {
            alert.success(response.message);
            setFailedList(response.data)
            setIsFailed(true);
        }
        else if (response.statusCode == "Error" && response.data != 0) {
            alert.error(response.message);
            setFailedList(response.data)
            setIsFailed(true);
        }
        else {
            alert.error(response.message);
        }
        setEvents([])
    }

    function getDayOfWeek(selectedDate) {
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const date = new Date(selectedDate);
        const dayOfWeekIndex = date.getDay();
        return daysOfWeek[dayOfWeekIndex];
    }

    function formatDate(selectedDate) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const date = new Date(selectedDate);
        const dayName = days[date.getDay()];
        const monthName = months[date.getMonth()];
        const day = date.getDate();
        const year = date.getFullYear();

        return `${dayName} ${monthName} ${day < 10 ? '0' + day : day} ${year}`;
    }


    function ConfirmDeleteDialog() {
        return (
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
            >
                <DialogTitle>{"Confirm Deletion"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this event?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="primary">
                        No
                    </Button>
                    <Button onClick={() => {
                        Delete_Event_Fun(currentEventToDelete);
                        setOpenDialog(false);
                    }} color="primary" autoFocus>
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: holiDay.groupID,
                            operationEntityID: holiDay.operationEntityID,
                            divisionID: holiDay.divisionID
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Business Division required').min("1", 'Business Division required'),
                                operationEntityID: Yup.number().required('Location required').min("1", 'Location required'),
                                divisionID: Yup.number().required('Sub Division required').min("1", 'Sub Division required')
                            })
                        }
                        enableReinitialize
                    >
                        {({
                            errors,
                            handleSubmit,
                            handleBlur,
                            touched,
                        }) => (
                            <form onSubmit={handleSubmit}>
                                <Box mt={0}>
                                    <Card>
                                        <CardHeader
                                            title={cardTitle(title)}
                                        />
                                        <PerfectScrollbar>
                                            <Divider />
                                            <CardContent>
                                                <Grid container spacing={3}>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="groupID">
                                                            Business Division  *
                                                        </InputLabel>
                                                        <TextField select
                                                            fullWidth
                                                            helperText={touched.groupID && errors.groupID}
                                                            error={Boolean(touched.groupID && errors.groupID)}
                                                            name="groupID"
                                                            size='small'
                                                            onChange={(e) => handleChange(e)}
                                                            value={holiDay.groupID}
                                                            variant="outlined"
                                                            InputProps={{
                                                                readOnly: !permissionList.isGroupFilterEnabled ? true : false || events.length > 0
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Business Division--</MenuItem>
                                                            {generateDropDownMenu(groups)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="operationEntityID">
                                                            Location *
                                                        </InputLabel>
                                                        <TextField select
                                                            fullWidth
                                                            helperText={touched.operationEntityID && errors.operationEntityID}
                                                            error={Boolean(touched.operationEntityID && errors.operationEntityID)}
                                                            name="operationEntityID"
                                                            size='small'
                                                            onChange={(e) => handleChange(e)}
                                                            value={holiDay.operationEntityID}
                                                            variant="outlined"
                                                            id="operationEntityID"
                                                            InputProps={{
                                                                readOnly: !permissionList.isFactoryFilterEnabled ? true : false || events.length > 0
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Location--</MenuItem>
                                                            {generateDropDownMenu(factories)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="divisionID">
                                                            Sub Division *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.divisionID && errors.divisionID)}
                                                            fullWidth
                                                            helperText={touched.divisionID && errors.divisionID}
                                                            name="divisionID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={holiDay.divisionID}
                                                            variant="outlined"
                                                            id="divisionID"
                                                            size='small'
                                                        >
                                                            <MenuItem value="0">--Select Sub Division--</MenuItem>
                                                            {generateDropDownMenu(costCenters)}
                                                        </TextField>
                                                    </Grid>
                                                </Grid>
                                                <br></br>

                                                <CardContent>
                                                    <Box elevation={0} {...currentProps} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginLeft: changePadding ? '120px' : '300px', border: '1px solid black', boxShadow: '-6px -6px 6px rgba(0, 0, 0, 0.2), 6px 6px 6px rgba(0, 0, 0, 0.2)', marginTop: "50px", width: expandedBox ? '80%' : '50%', marginBottom: '50px' }}>
                                                        <Grid container spacing={2} >
                                                            <Grid item xs={6} md={selectedDate ? 6 : 12} style={{ display: 'flex', justifyContent: 'center' }}>
                                                                <Card elevation={0} display="flex" minHeight="100vh">
                                                                    <CardContent>
                                                                        <CardHeader
                                                                            titleTypographyProps={{ variant: 'h1', align: 'left' }}
                                                                            title="Holiday Calendar"
                                                                        />
                                                                        <Box style={{ boxShadow: '6px 6px 6px rgba(5, 5, 5, 0.2)' }}>
                                                                            <Calendar
                                                                                value={selectedDate}
                                                                                onClickDay={Date_Click_Fun}
                                                                                onChange={handleDateChange}
                                                                                calendarType="gregory"
                                                                                tileClassName={({ date }) =>
                                                                                    selectedDate && date === selectedDate
                                                                                        ? "selected"
                                                                                        : events.some(
                                                                                            (event) => event.date === moment(date).format('YYYY-MM-DD')
                                                                                        )
                                                                                            ? "event-marked"
                                                                                            : ""
                                                                                }
                                                                                style={{
                                                                                    maxWidth: "500px",
                                                                                    maxHeight: "500px"
                                                                                }}
                                                                            />
                                                                        </Box>
                                                                    </CardContent>
                                                                </Card>
                                                            </Grid>
                                                            <Grid item xs={6} style={{ paddingRight: '70px', }}>
                                                                <Card elevation={0}>
                                                                    <CardContent>
                                                                        <Box >
                                                                            {selectedDate && (
                                                                                <div
                                                                                    className="event-form"
                                                                                    style={{
                                                                                        marginBottom: "20px",
                                                                                        fontSize: "2.2rem",
                                                                                    }}
                                                                                >
                                                                                    <CardHeader style={{ marginLeft: '8.5rem' }} titleTypographyProps={{ variant: 'h2' }}
                                                                                        title="Create Event"
                                                                                    />
                                                                                    <p
                                                                                        style={{
                                                                                            fontSize: "1.5rem",
                                                                                            fontFamily: "Calibri, sans-serif"
                                                                                        }}
                                                                                    >
                                                                                        {" "}
                                                                                        Selected Date: {formattedDate}{" "}
                                                                                    </p>{" "}
                                                                                    <br></br>
                                                                                    <InputLabel shrink id="eventID">
                                                                                    </InputLabel>
                                                                                    <TextField select
                                                                                        fullWidth
                                                                                        name="eventID"
                                                                                        size='small'
                                                                                        onChange={Event_Data_Update}
                                                                                        value={holiDay.eventID}
                                                                                        variant="outlined"
                                                                                        id="eventID"
                                                                                        placeholder="Event Name"
                                                                                        paddingBottom="20px"
                                                                                    >
                                                                                        <MenuItem value="0">--Select Event Name--</MenuItem>
                                                                                        {generateDropDownMenu(eventType)}
                                                                                    </TextField>{" "}
                                                                                    <br />
                                                                                    <Button
                                                                                        className="create-btn"
                                                                                        onClick={Create_Event_Fun}
                                                                                        style={{
                                                                                            padding: "4px 16px",
                                                                                            backgroundColor: "#A9CCED",
                                                                                            color: "black",
                                                                                            border: "2px solid black",
                                                                                            borderRadius: "10px",
                                                                                            fontSize: "1rem",
                                                                                            cursor: "pointer",
                                                                                            transition: "background-color 0.2s",
                                                                                        }}
                                                                                    >
                                                                                        {/* <AddCircleIcon /> */}
                                                                                        Add Event

                                                                                    </Button>{" "}
                                                                                </div>
                                                                            )}
                                                                            {events.length > 0 && selectedDate && (
                                                                                <div
                                                                                    className="event-list"
                                                                                    style={{
                                                                                        marginTop: "20px",
                                                                                    }}
                                                                                >
                                                                                    <div
                                                                                        className="event-cards"
                                                                                        style={{
                                                                                            display: "flex",
                                                                                            flexWrap: "wrap",
                                                                                            justifyContent: "center",
                                                                                        }}
                                                                                    >
                                                                                        {" "}
                                                                                        {events.map((event) =>
                                                                                            event.date ===
                                                                                                moment(selectedDate).format('YYYY-MM-DD') ? (
                                                                                                <div
                                                                                                    key={event.id}
                                                                                                    className="event-card"
                                                                                                    style={{
                                                                                                        width: '100%',
                                                                                                        backgroundColor: "#A9CCED",
                                                                                                        borderRadius: "8px",
                                                                                                        margin: "5px",
                                                                                                        padding: "5px",

                                                                                                        cursor: "pointer",
                                                                                                        transition: "transform 0.2s, box-shadow 0.2s",
                                                                                                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                                                                                    }}
                                                                                                >
                                                                                                    <div
                                                                                                        className="event-card-header"
                                                                                                    >
                                                                                                        <p
                                                                                                            className="event-title"
                                                                                                            style={{
                                                                                                                fontSize: "1.5rem",
                                                                                                                color: "black",
                                                                                                                fontWeight: "bold",
                                                                                                                paddingTop: "20px",
                                                                                                                paddingLeft: "20px",
                                                                                                                shrink: 4,
                                                                                                                fontFamily: "sans-serif"
                                                                                                            }}
                                                                                                        >
                                                                                                            {" "}
                                                                                                            {event.title}{" "}
                                                                                                        </p>{" "}
                                                                                                        <div
                                                                                                            className="event-actions"
                                                                                                            style={{
                                                                                                                display: "flex",
                                                                                                            }}
                                                                                                        >
                                                                                                            <span
                                                                                                                className="event-date"
                                                                                                                style={{
                                                                                                                    fontSize: "1rem",
                                                                                                                    color: "black",
                                                                                                                    fontWeight: "bold",
                                                                                                                    paddingTop: "20px",
                                                                                                                    paddingLeft: "20px",
                                                                                                                    shrink: 4,
                                                                                                                    fontFamily: "sans-serif"
                                                                                                                }}
                                                                                                            >
                                                                                                                {" "}
                                                                                                                {event.date}{" "}
                                                                                                            </span>{" "}

                                                                                                            <button
                                                                                                                className="delete-btn"
                                                                                                                onClick={() =>
                                                                                                                    Delete_Event_Fun(
                                                                                                                        event.id,
                                                                                                                    )
                                                                                                                }
                                                                                                                style={{
                                                                                                                    padding: "5px 20px",
                                                                                                                    marginLeft: "50%",
                                                                                                                    backgroundColor: "white",
                                                                                                                    color: "black",
                                                                                                                    border: "2px solid black",
                                                                                                                    borderRadius: "4px",
                                                                                                                    fontSize: "0.9rem",
                                                                                                                    cursor: "pointer",
                                                                                                                    transition: "background-color 0.2s",
                                                                                                                    justifyContent: "right",
                                                                                                                    top: "20px",
                                                                                                                }}
                                                                                                            >
                                                                                                                Delete{" "}
                                                                                                            </button>{" "}
                                                                                                        </div>{" "}
                                                                                                    </div>{" "}
                                                                                                    <div
                                                                                                        className="event-card-body"
                                                                                                        style={{
                                                                                                            paddingBottom: "35px",
                                                                                                            alignItems: "right"
                                                                                                        }}
                                                                                                    >
                                                                                                    </div>{" "}
                                                                                                </div>
                                                                                            ) : null,
                                                                                        )}{" "}
                                                                                    </div>{" "}
                                                                                </div>
                                                                            )}{" "}
                                                                        </Box>
                                                                    </CardContent>
                                                                </Card>
                                                            </Grid>
                                                        </Grid>
                                                    </Box>
                                                </CardContent>
                                                {events.length > 0 ?
                                                    <MaterialTable
                                                        title="Holidays"
                                                        columns={[
                                                            { title: 'Location', field: 'operationEntityName' },
                                                            { title: 'Sub Division', field: 'divisionName' },
                                                            { title: 'Holiday Calender Name', field: 'title' },
                                                            { title: 'Date', field: 'date' },
                                                            { title: 'Description', field: 'description' },
                                                        ]}
                                                        data={events}
                                                        options={{
                                                            exportButton: false,
                                                            showTitle: true,
                                                            headerStyle: { textAlign: "left", height: '1%' },
                                                            cellStyle: { textAlign: "left" },
                                                            columnResizable: false,
                                                            actionsColumnIndex: -1,
                                                            pageSize: 5
                                                        }}
                                                        actions={[
                                                            {
                                                                icon: 'delete',
                                                                tooltip: 'Delete Event',
                                                                onClick: (event, rowData) => handleDeleteClick(rowData.id)
                                                            }
                                                        ]}

                                                    />
                                                    : null}
                                                {isFailed ?
                                                    <MaterialTable
                                                        title="These Days already have Holidays"
                                                        columns={[
                                                            { title: 'Location', field: 'operationEntityName' },
                                                            { title: 'Holiday Calender Name', field: 'holidayCalenderName' },
                                                            { title: 'Date', field: 'dayOrDate', render: rowData => moment(rowData.dayOrDate).format('YYYY-MM-DD') },
                                                            { title: 'Description', field: 'description' },
                                                        ]}
                                                        data={FailedList}
                                                        options={{
                                                            exportButton: false,
                                                            showTitle: true,
                                                            headerStyle: { textAlign: "left", height: '1%' },
                                                            cellStyle: { textAlign: "left" },
                                                            columnResizable: false,
                                                            actionsColumnIndex: -1,
                                                            pageSize: 5
                                                        }}
                                                    />
                                                    : null}
                                            </CardContent>
                                            {events.length > 0 ?
                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    <Button
                                                        color="primary"
                                                        type="submit"
                                                        variant="contained"
                                                        onClick={SaveHolidayCalendar}
                                                        disabled={isDisableButton}
                                                    >
                                                        {"Save"}
                                                    </Button>
                                                </Box>
                                                : null}
                                        </PerfectScrollbar>
                                    </Card>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </Container>
                <ConfirmDeleteDialog />
            </Page>
        </Fragment>
    );
};