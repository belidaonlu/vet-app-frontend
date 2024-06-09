import { useEffect, useState } from "react";
import axios from "axios";
import "./Appointment.css";
// MUI
// renkler
import { Alert, Snackbar } from "@mui/material";
import { lightGreen, deepPurple } from "@mui/material/colors";
// buton/input
import TextField from "@mui/material/TextField";
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Button from "@mui/material/Button";
// TABLO FORMATI
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
// ICONLAR
import DeleteSharpIcon from "@mui/icons-material/DeleteSharp";
import UpdateIcon from "@mui/icons-material/Update";
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PetsIcon from '@mui/icons-material/Pets';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SettingsIcon from '@mui/icons-material/Settings';
// TARIH
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

function Appointment() {
  const [appointment, setAppointment] = useState([]);
  const [doctor, setDoctor] = useState([]);
  const [availableDoctor, setAvailableDoctor] = useState([]);
  const [availableDate, setAvailableDate] = useState([]);
  const [animal, setAnimal] = useState([]);
  const [customer, setCustomer] = useState([]);
  const [update, setUpdate] = useState(false);
  const [filteredAppointment, setFilteredAppointment] = useState([]);
  const [newAppointment, setNewAppointment] = useState({
    id: null,
    appointmentDate: null,
    appointmentTime: null,
    doctor: {},
    animal: {},
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [alert, setAlert] = useState(null);
  const [searchDoctor, setSearchDoctor] = useState("");
  const [searchAnimal, setSearchAnimal] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // DATA CEKME
  useEffect(() => {
    axios
      .get(import.meta.env.VITE_APP_BASEURL + "api/v1/appointments")
      .then((res) => {
        setAppointment(res.data.content);
        setFilteredAppointment(res.data.content);
      })
      .then(() => setUpdate(true));
    axios
      .get(`${import.meta.env.VITE_APP_BASEURL}api/v1/doctors`)
      .then((res) => {
        setDoctor(res.data.content);
      })
      .then(() => setUpdate(true));
    axios
      .get(import.meta.env.VITE_APP_BASEURL + "api/v1/available-dates")
      // ISTENEN TARIH FORMATINDA:
      .then((res) => {
        const fetchedDates = res.data.content.map(item => ({
          date: dayjs(item.workDay).format('YYYY-MM-DD'),
          doctorId: item.doctor.id
        }));
        setAvailableDate(fetchedDates);
      })
      .then(() => setUpdate(true));
    axios
      .get(import.meta.env.VITE_APP_BASEURL + "api/v1/animals")
      .then((res) => setAnimal(res.data.content))
      .then(() => setUpdate(true));
    axios
      .get(import.meta.env.VITE_APP_BASEURL + "api/v1/customers")
      .then((res) => setCustomer(res.data.content))
      .then(() => setUpdate(true));
  }, [update]);

  const handleAvailableDateSelectChange = (date) => {
    const selectedDate = dayjs(date).format('YYYY-MM-DD');
    const availableDoctorIds = availableDate
      .filter(item => item.date === selectedDate)
      .map(item => item.doctorId);

    const filteredDoctors = doctor.filter(doc => availableDoctorIds.includes(doc.id));
    setAvailableDoctor(filteredDoctors);

    setNewAppointment((prev) => ({
      ...prev,
      appointmentDate: date,
    }));
  };

  const handleTimeChange = (time) => {
    setNewAppointment((prev) => ({
      ...prev,
      appointmentTime: dayjs(time).format('HH:mm'),
    }));
  };

  const handleDoctorSelectChange = (e) => {
    const id = e.target.value;
    const selectedDoctor = doctor?.find((d) => d.id === +id);
    setSearchDoctor(id);
    setNewAppointment((prev) => ({
      ...prev,
      doctor: selectedDoctor || {},
    }));
  };

  const handleAnimalSelectChange = (e) => {
    const id = e.target.value;
    const newAnimal = animal?.find((a) => a.id === +id);
    setSearchAnimal(id);
    setNewAppointment((prev) => ({
      ...prev,
      animal: newAnimal || {},
    }));
  };

  //EKLE/GUNCELLE
  const handleAddOrUpdateAppointment = () => {
    const appointmentDate = newAppointment.appointmentDate;
    const appointmentTime = newAppointment.appointmentTime || "00:00";
  
    if (!appointmentDate) {
      setAlert({ type: 'error', message: 'Tarih seçilmelidir.' });
      return;
    }
  
    const fullAppointmentDate = dayjs(`${dayjs(appointmentDate).format('YYYY-MM-DD')}T${appointmentTime}`).toISOString();
  
    const appointmentData = {
      appointmentDate: fullAppointmentDate,
      doctor: newAppointment.doctor,
      animal: newAppointment.animal,
    };
  
    if (isEditMode) {
      axios
        .put(`${import.meta.env.VITE_APP_BASEURL}api/v1/appointments/${newAppointment.id}`, appointmentData)
        .then(() => setUpdate(false))
        .then(() => setIsEditMode(false))
        .then(() =>
          setNewAppointment({
            id: null,
            appointmentDate: null,
            appointmentTime: null,
            doctor: {},
            animal: {},
          })
        )
        .then(() => setAlert({ type: 'success', message: 'Randevu başarıyla güncellendi.' }))
        .catch((error) => {
          console.error("Güncelleme Hatası:", error);
          setAlert({ type: 'error', message: `Hata: ${error.response.data.message || error.response.data}` });
        });
    } else {
      axios
        .post(import.meta.env.VITE_APP_BASEURL + "api/v1/appointments", appointmentData)
        .then((res) => console.log(res))
        .then(() => setUpdate(false))
        .then(() =>
          setNewAppointment({
            id: null,
            appointmentDate: null,
            appointmentTime: null,
            doctor: {},
            animal: {},
          })
        )
        .then(() => setAlert({ type: 'success', message: 'Randevu başarıyla eklendi.' }))
        .catch((error) => {
          console.error("Ekleme Hatası:", error);
          setAlert({ type: 'error', message: `Hata: ${error.response.data.message || error.response.data}` });
        });
    }
  };

  const handleDeleteAppointment = (e) => {
    const id = e.currentTarget.id;
    axios
      .delete(`${import.meta.env.VITE_APP_BASEURL}api/v1/appointments/${id}`)
      .then(() => setUpdate(false))
      .then(() => setAlert({ type: 'warning', message: 'Randevu silindi.' }));
  };

  const handleUpdateAppointmentBtn = (e) => {
    const index = e.currentTarget.id;
    const appointment = filteredAppointment[index];
    const [date, time] = appointment.appointmentDate.split('T');

    setNewAppointment({
      ...appointment,
      appointmentDate: dayjs(date),
      appointmentTime: time,
      doctor: doctor.find(d => d.id === appointment.doctor.id) || {},
      animal: animal.find(a => a.id === appointment.animal.id) || {},
    });
    setIsEditMode(true);
  };

  useEffect(() => {
    if (searchDoctor === "" && startDate && endDate) {
      setFilteredAppointment(appointment);
    } else if (searchDoctor && startDate && endDate) {
      axios
        .get(`${import.meta.env.VITE_APP_BASEURL}api/v1/appointments/searchByDoctorAndDateRange?id=${searchDoctor}&startDate=${dayjs(startDate).format('YYYY-MM-DD')}&endDate=${dayjs(endDate).format('YYYY-MM-DD')}`)
        .then((res) => setFilteredAppointment(res.data.content))
        .catch((error) => {
          console.error("Search Error:", error);
          setFilteredAppointment([]);
        });
    }
  }, [searchDoctor, startDate, endDate]);

  useEffect(() => {
    if (searchAnimal === "" && startDate && endDate) {
      setFilteredAppointment(appointment);
    } else if (searchAnimal && startDate && endDate) {
      axios
        .get(`${import.meta.env.VITE_APP_BASEURL}api/v1/appointments/searchByAnimalAndDateRange?id=${searchAnimal}&startDate=${dayjs(startDate).format('YYYY-MM-DD')}&endDate=${dayjs(endDate).format('YYYY-MM-DD')}`)
        .then((res) => setFilteredAppointment(res.data.content))
        .catch((error) => {
          console.error("Search Error:", error);
          setFilteredAppointment([]);
        });
    }
  }, [searchAnimal, startDate, endDate]);

  const shouldDisableDate = (date) => {
    const formattedDate = dayjs(date).format('YYYY-MM-DD');
    return !availableDate.some(item => item.date === formattedDate);
  };

  return (
    <div className="container">
      <h2>Randevu Yönetimi</h2>
      <div className="content-app">
        {alert && (
          <Snackbar
            open={!!alert}
            autoHideDuration={3000}
            onClose={() => setAlert(null)}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            sx={{ mt: 8 }}
          >
            <Alert
              onClose={() => setAlert(null)}
              severity={alert.type}
              sx={{ width: "100%" }}
            >
              {alert.message}
            </Alert>
          </Snackbar>
        )}
        <section className="add-ani">
          <h3 style={{ color: deepPurple[400] }}>Randevu Ekle/Güncelle</h3>
          <div className="input-ani" style={{ height: 400 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Tarih"
                value={newAppointment.appointmentDate}
                onChange={handleAvailableDateSelectChange}
                shouldDisableDate={shouldDisableDate}
                slotProps={{ textField: { variant: 'outlined' } }}
              />
            </LocalizationProvider>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <TimePicker
                label="Saat"
                value={newAppointment.appointmentTime ? dayjs(newAppointment.appointmentTime, 'HH:mm') : null}
                onChange={handleTimeChange}
                ampm={false}
                minTime={dayjs().hour(9).minute(0)}
                maxTime={dayjs().hour(18).minute(0)}
                slotProps={{ textField: { variant: 'outlined' } }}
              />
            </LocalizationProvider>

            <Select
              id="DoctorSelect"
              value={newAppointment.doctor.id || ""}
              onChange={handleDoctorSelectChange}
              sx={{ width: 260, height: 55 }}
              displayEmpty
              renderValue={(selected) => selected ? doctor.find(doc => doc.id === selected).name : "Doktor Seç"}
            >
              {availableDoctor?.map((doc, index) => (
                <MenuItem key={index} value={doc.id}>
                  {doc.name}
                </MenuItem>
              ))}
            </Select>

            <Select
              labelId="Animal"
              id="AnimalSelect"
              value={newAppointment.animal.id || ""}
              onChange={handleAnimalSelectChange}
              sx={{ width: 260, height: 55 }}
              displayEmpty
              renderValue={(selected) => selected ? animal.find(ani => ani.id === selected).name : "Hayvan Seç"}
            >
              {animal?.map((ani, index) => (
                <MenuItem key={index} value={ani.id}>
                  {ani.name}
                </MenuItem>
              ))}
            </Select>

            <button
              className="btn-add-ani"
              onClick={handleAddOrUpdateAppointment}
            >
              {isEditMode ? "Kaydet" : "Ekle"}
            </button>
          </div>
        </section>

        <section>
          <div className="ani-list-head">
            <h3 style={{ color: deepPurple[400] }}>Randevu Listesi</h3>
          </div>
          <TableContainer
            sx={{
              width: 950,
              height: 250,
              borderRadius: 4,
              boxShadow: 0,
              overflow: "auto",
            }}
            component={Paper}
          >
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow sx={{ position: "sticky", top: 0, zIndex: 1, backgroundColor: "white" }}>
                  <TableCell
                    align="left"
                    sx={{ fontWeight: "bold", verticalAlign: "middle" }}
                  >
                    <BookmarkBorderIcon sx={{ fontSize: 20, verticalAlign: "middle" }} />{" "}
                    Randevu No
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{ fontWeight: "bold", verticalAlign: "middle" }}
                  >
                    <DateRangeIcon sx={{ fontSize: 20, verticalAlign: "middle" }} />{" "}
                    Tarih
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{ fontWeight: "bold", verticalAlign: "middle" }}
                  >
                    <AccessTimeIcon sx={{ fontSize: 20, verticalAlign: "middle" }} />{" "} 
                    Saat
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{ fontWeight: "bold", verticalAlign: "middle" }}
                  >
                    <LocalHospitalIcon sx={{ fontSize: 20, verticalAlign: "middle" }} />{" "}
                    Doktor
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{ fontWeight: "bold", verticalAlign: "middle" }}
                  >
                    <PetsIcon sx={{ fontSize: 20, verticalAlign: "middle" }} />{" "}
                    Hayvan
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{ fontWeight: "bold", verticalAlign: "middle" }}
                  >
                    <SettingsIcon sx={{ fontSize: 20, verticalAlign: "middle" }} />{" "}
                    İşlemler
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAppointment?.map((app, index) => (
                  <TableRow
                    key={index}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell align="left" sx={{ p: 1 }}>
                      {app.id}
                    </TableCell>
                    <TableCell
                      component="th"
                      scope="row"
                      align="left"
                      sx={{ p: 1 }}
                    >
                      {app.appointmentDate.split('T')[0]}
                    </TableCell>
                    <TableCell
                      component="th"
                      scope="row"
                      align="left"
                      sx={{ p: 1 }}
                    >
                      {app.appointmentDate.split('T')[1].substring(0, 5)}
                    </TableCell>
                    <TableCell align="left" sx={{ p: 1 }}>
                      {app.doctor.name}
                    </TableCell>
                    <TableCell align="left" sx={{ p: 1 }}>
                      {app.animal.name}
                    </TableCell>
                    <TableCell align="left" sx={{ p: 1 }}>
                      <Button
                        id={app.id}
                        onClick={handleDeleteAppointment}
                        variant="outlined"
                        size="small"
                        sx={{
                          width: 60,
                          fontSize: 12,
                          mr: 1,
                          color: deepPurple[400],
                          borderColor: deepPurple[400],
                        }}
                      >
                        <DeleteSharpIcon sx={{ fontSize: 20 }} /> Sil
                      </Button>
                      <Button
                        id={index}
                        onClick={handleUpdateAppointmentBtn}
                        variant="outlined"
                        size="small"
                        sx={{
                          width: 120,
                          fontSize: 12,
                          color: lightGreen[600],
                          borderColor: lightGreen[600],
                        }}
                      >
                        <UpdateIcon sx={{ fontSize: 20 }} /> Güncelle
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <div className="ani-list-head">
            <h3 style={{ color: lightGreen[600] }}>Tarihe Göre Detaylı Filtreleme</h3>
          </div>
          <div className="search-appointment">
            <div className="search-doctor">
              <Select
                id="searchDoctorSelect"
                value={searchDoctor || ""}
                onChange={(e) => setSearchDoctor(e.target.value)}
                sx={{ width: 260, height: 55 }}
                displayEmpty
                renderValue={(selected) => selected ? doctor.find(doc => doc.id === selected).name : "Doktor Seç"}
              >
                {doctor?.map((doc, index) => (
                  <MenuItem key={index} value={doc.id}>
                    {doc.name}
                  </MenuItem>
                ))}
              </Select>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Başlangıç Tarihi"
                  value={startDate ? dayjs(startDate) : null}
                  onChange={(date) => setStartDate(date)}
                  shouldDisableDate={shouldDisableDate}
                  slotProps={{ textField: { variant: 'outlined' } }}
                />
              </LocalizationProvider>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Bitiş Tarihi"
                  value={endDate ? dayjs(endDate) : null}
                  onChange={(date) => setEndDate(date)}
                  shouldDisableDate={shouldDisableDate}
                  slotProps={{ textField: { variant: 'outlined' } }}
                />
              </LocalizationProvider>
            </div>
            <div className="search-animal">
              <Select
                labelId="searchAnimalSelect"
                id="AnimalSelect"
                value={searchAnimal || ""}
                onChange={(e) => setSearchAnimal(e.target.value)}
                sx={{ width: 260, height: 55 }}
                displayEmpty
                renderValue={(selected) => selected ? animal.find(ani => ani.id === selected).name : "Hayvan Seç"}
              >
                {animal?.map((ani, index) => (
                  <MenuItem key={index} value={ani.id}>
                    {ani.name}
                  </MenuItem>
                ))}
              </Select>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Başlangıç Tarihi"
                  value={startDate ? dayjs(startDate) : null}
                  onChange={(date) => setStartDate(date)}
                  shouldDisableDate={shouldDisableDate}
                  slotProps={{ textField: { variant: 'outlined' } }}
                />
              </LocalizationProvider>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Bitiş Tarihi"
                  value={endDate ? dayjs(endDate) : null}
                  onChange={(date) => setEndDate(date)}
                  shouldDisableDate={shouldDisableDate}
                  slotProps={{ textField: { variant: 'outlined' } }}
                />
              </LocalizationProvider>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Appointment;
