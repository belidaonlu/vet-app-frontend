import { useEffect, useState } from "react";
import axios from "axios";
import "./Doctor.css"
// MUI
import { Alert, Snackbar, TextField, MenuItem, Select, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
// RENK
import { lightGreen, deepPurple } from '@mui/material/colors';
// TARIH
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
// ICONLAR
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PushPinIcon from '@mui/icons-material/PushPin';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import DateRangeIcon from '@mui/icons-material/DateRange';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteSharpIcon from '@mui/icons-material/DeleteSharp';
import UpdateIcon from '@mui/icons-material/Update';

function Doctor() {
  // ************** DOKTOR YONETIMI
  const [doctor, setDoctor] = useState([]);
  const [update, setUpdate] = useState(false);
  const [filteredDoctor, setFilteredDoctor] = useState([]);
  const [newDoctor, setNewDoctor] = useState({
    id: null,
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [alert, setAlert] = useState(null);
  const [searchInput, setSearchInput] = useState("");

  // DATA CEKME
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_APP_BASEURL}api/v1/doctors`)
      .then((res) => {
        setDoctor(res.data.content);
        setFilteredDoctor(res.data.content);
      })
      .then(() => setUpdate(true));
  }, [update]);

  // TELEFON NO FORMATI OLUSTURMA
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const phoneFormat = /^\+90-\d{0,10}$/;
      if (!phoneFormat.test(value)) {
        return;
      }
      if (value === "+90-") {
        setNewDoctor((prev) => ({
          ...prev,
          phone: value,
        }));
        return;
      }
      if (value.startsWith("+90-")) {
        const numberPart = value.substr("+90-".length);
        if (/^\d{0,10}$/.test(numberPart)) {
          setNewDoctor((prev) => ({
            ...prev,
            phone: "+90-" + numberPart,
          }));
        }
      }
    }
    setNewDoctor((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhoneFocus = () => {
    if (newDoctor.phone === "") {
      setNewDoctor((prev) => ({
        ...prev,
        phone: "+90-",
      }));
    }
  };

  // EMAIL FORMATI OLUSTURMA
  const handleEmailBlur = (e) => {
    const { name, value } = e.target;
    if (name === "email") {
      const emailFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailFormat.test(value)) {
        setAlert({ type: 'error', message: 'Geçersiz e-mail formatı' });
        setNewDoctor((prev) => ({
          ...prev,
          email: "",
        }));
      } else {
        setAlert(null);
      }
    }
  };

  // EKLE/GUNCELLE BUTONU FONKSIYONU
  const handleAddOrUpdateDoctor = () => {
    if (isEditMode) {
      axios
        .put(`${import.meta.env.VITE_APP_BASEURL}api/v1/doctors/${newDoctor.id}`, newDoctor)
        .then(() => setUpdate(false))
        .then(() => setIsEditMode(false))
        .then(() =>
          setNewDoctor({
            id: null,
            name: "",
            phone: "",
            email: "",
            address: "",
            city: "",
          })
        )
        .then(() => setAlert({ type: 'success', message: 'Doktor başarıyla güncellendi.' }));
    } else {
      axios
        .post(`${import.meta.env.VITE_APP_BASEURL}api/v1/doctors`, newDoctor)
        .then((res) => console.log(res))
        .then(() => setUpdate(false))
        .then(() =>
          setNewDoctor({
            id: null,
            name: "",
            phone: "",
            email: "",
            address: "",
            city: "",
          })
        )
        .then(() => setAlert({ type: 'success', message: 'Doktor başarıyla eklendi.' }));
    }
  };

  // SIL BUTONU FONKSIYONU
  const handleDeleteDoctor = (e) => {
    const id = e.target.id;
    axios
      .delete(`${import.meta.env.VITE_APP_BASEURL}api/v1/doctors/${id}`)
      .then(() => setUpdate(false))
      .then(() => setAlert({ type: 'warning', message: 'Doktor silindi.' }));
  };

  // GUNCELLE BUTONU-GIRILEN DEGERE GORE
  const handleUpdateDoctorBtn = (e) => {
    const index = e.target.id;
    setNewDoctor({
      ...doctor[index]
    });
    setIsEditMode(true);
  };

  // ARAMA
  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  useEffect(() => {
    if (searchInput === "") {
      setFilteredDoctor(doctor);
    } else {
      setFilteredDoctor(
        doctor?.filter((doctor) =>
          doctor.name.toLowerCase().includes(searchInput.toLowerCase())
        )
      );
    }
  }, [searchInput, doctor]);

  // **************MUSAIT TARIH YONETIMI
  const today = dayjs();
  const [availableDate, setAvailableDate] = useState([]);
  const [filteredAvailableDate, setFilteredAvailableDate] = useState([]);
  const [newAvailableDate, setNewAvailableDate] = useState({
    workDay: today,
    doctorId: null
  });
  const [searchAvailableDate, setSearchAvailableDate] = useState("");

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_APP_BASEURL}api/v1/available-dates`)
      .then((res) => {
        console.log('kontrol', res.data.content);
        const fetchedDates = res.data.content.map(item => ({
          ...item,
          workDay: item.workDay ? dayjs(item.workDay).format('YYYY-MM-DD') : 'N/A'
        }));
        setAvailableDate(fetchedDates);
        setFilteredAvailableDate(fetchedDates);
      })
      .then(() => setUpdate(true));
  }, [update]);

  const handleAvailableDateChange = (date) => {
    setNewAvailableDate((prev) => ({
      ...prev,
      workDay: dayjs(date).format('YYYY-MM-DD')
    }));
  };

  const handleDoctorSelectChange = (e) => {
    const id = e.target.value;
    setNewAvailableDate((prev) => ({
      ...prev,
      doctorId: id
    }));
  };

  const handleAddAvailableDate = () => {
    axios
      .post(`${import.meta.env.VITE_APP_BASEURL}api/v1/available-dates`, {
        workDate: newAvailableDate.workDay,
        doctorId: newAvailableDate.doctorId
      })
      .then((res) => {
        console.log(res);
        setUpdate(false);
        setNewAvailableDate({
          workDate: "",
          doctorId: null
        });
        setAlert({ type: 'success', message: 'Müsait tarih başarıyla eklendi.' });
      })
  };

  const handleDeleteAvailableDate = (e) => {
    const id = e.target.id;
    axios
      .delete(`${import.meta.env.VITE_APP_BASEURL}api/v1/available-dates/${id}`)
      .then(() => setUpdate(false))
      .then(() => setAlert({ type: 'warning', message: 'Müsait tarih silindi.' }));
  };

  const handleSearchAvailableDateChange = (e) => {
    setSearchAvailableDate(e.target.value);
  };

  useEffect(() => {
    if (searchAvailableDate === "") {
      setFilteredAvailableDate(availableDate);
    } else {
      setFilteredAvailableDate(
        availableDate?.filter((availableDate) =>
          availableDate.workDay.includes(searchAvailableDate)
        )
      );
    }
  }, [searchAvailableDate, availableDate]);

  return (
    <>
      <div className="container">
        <h2 className="title-doctor">Doktor Yönetimi</h2>
        <div className="content-doc">
          {alert && ( 
            <Snackbar
              open={!!alert}
              autoHideDuration={3000}
              onClose={() => setAlert(null)}
              anchorOrigin={{ vertical: 'top',  horizontal: 'right' }}
              sx={{mt:8}}
            >
              <Alert onClose={() => setAlert(null)} severity={alert.type} sx={{ width: '100%' }}>
                {alert.message}
              </Alert>
            </Snackbar>
          )}
          <section className="add-doc">
            <h3 style={{ color: deepPurple[400] }}>Doktor Ekle/Güncelle</h3>
            <div className="input-doc" style={{ height: 400 }}>
              <TextField
                type="text"
                placeholder="Doktor Adı"
                name="name"
                value={newDoctor.name}
                onChange={handleInputChange}
                variant="standard"
              />
              <TextField
                type="text"
                placeholder="Doktor Email"
                name="email"
                value={newDoctor.email}
                onChange={handleInputChange}
                onBlur={handleEmailBlur}
                variant="standard"
              />
              <TextField
                type="text"
                placeholder="Doktor Adresi"
                name="address"
                value={newDoctor.address}
                onChange={handleInputChange}
                variant="standard"
              />
              <TextField
                type="text"
                placeholder="Doktor Şehir"
                name="city"
                value={newDoctor.city}
                onChange={handleInputChange}
                variant="standard"
              />
              <TextField
                type="text"
                placeholder="Doktor Telefon"
                name="phone"
                value={newDoctor.phone}
                onChange={handleInputChange}
                onFocus={handlePhoneFocus}
                variant="standard"
              />
              <button
                className="btn-add-doc"
                onClick={handleAddOrUpdateDoctor}
              >
                {isEditMode ? "Kaydet" : "Ekle"}
              </button>
            </div>
          </section>

          <section>
            <div className="doc-list-head">
              <h3  style={{ color: deepPurple[400] }}>Doktor Listesi</h3>
              <TextField
                  sx={{width: 192, height:50, mr:3, p:0}}
                  InputProps={{
                    style: { height: 30, padding: '0 8px' }
                  }}
                  type="text"
                  placeholder="Doktor Adı Ara"
                  onChange={handleSearchInputChange}
                  name="search"
                  value={searchInput}
              />
            </div>
            <TableContainer sx={{ width: 900, height: 400, borderRadius: 4, boxShadow: 0, overflow: 'auto' }} component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow sx={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: "white" }}>
                    <TableCell align="left" sx={{ fontWeight: 'bold', verticalAlign: 'middle' }}>
                      <AssignmentIndIcon sx={{ fontSize: 20, verticalAlign: 'middle' }} /> Doktor
                    </TableCell>
                    <TableCell align="left" sx={{ fontWeight: 'bold', verticalAlign: 'middle' }}>
                      <AlternateEmailIcon sx={{ fontSize: 20, verticalAlign: 'middle' }} /> Email
                    </TableCell>
                    <TableCell align="left" sx={{ fontWeight: 'bold', verticalAlign: 'middle' }}>
                      <LocationOnIcon sx={{ fontSize: 20, verticalAlign: 'middle' }} /> Adres
                    </TableCell>

                    <TableCell align="left" sx={{ fontWeight: 'bold', verticalAlign: 'middle' }}>
                      <PushPinIcon sx={{ fontSize: 20, verticalAlign: 'middle' }} /> Şehir
                    </TableCell>
                    <TableCell align="left" sx={{ fontWeight: 'bold', verticalAlign: 'middle' }}>
                      <PhoneAndroidIcon sx={{ fontSize: 20, verticalAlign: 'middle' }} /> Telefon
                    </TableCell>
                    <TableCell align="left" sx={{ fontWeight: 'bold', verticalAlign: 'middle' }}>
                      <SettingsIcon sx={{ fontSize: 20, verticalAlign: 'middle' }} /> İşlemler
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDoctor?.map((doc, index) => (
                    <TableRow
                      key={index}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row" align="left" sx={{ p: 1 }}>
                        {doc.name}
                      </TableCell>
                      <TableCell align="left" sx={{ p: 1 }}>{doc.email}</TableCell>
                      <TableCell align="left" sx={{ p: 1 }}>{doc.address}</TableCell>
                      <TableCell align="left" sx={{ p: 1 }}>{doc.city}</TableCell>
                      <TableCell align="left" sx={{ p: 1 }}>{doc.phone}</TableCell>
                      <TableCell align="left" sx={{ p: 1 }}>
                        <Button
                          id={doc.id}
                          onClick={handleDeleteDoctor}
                          variant="outlined"
                          size="small"
                          sx={{ width: 60, fontSize: 12, mr: 1, color: deepPurple[400], borderColor: deepPurple[400] }}
                        >
                          <DeleteSharpIcon sx={{ fontSize: 20 }} /> Sil
                        </Button>
                        <Button
                          id={index}
                          onClick={handleUpdateDoctorBtn}
                          variant="outlined"
                          size="small"
                          sx={{ width: 120, fontSize: 12, color: lightGreen[600], borderColor: lightGreen[600] }}
                        >
                          <UpdateIcon sx={{ fontSize: 20 }} /> Güncelle
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </section>
        </div>

        {/* MUSAIT TARIH YONETIMI */}
        <h2 className="title-available">Müsait Tarih Yönetimi</h2>
        <div className="content-available">
          {alert && ( 
            <Snackbar
              open={!!alert}
              autoHideDuration={3000}
              onClose={() => setAlert(null)}
              anchorOrigin={{ vertical: 'top',  horizontal: 'right' }}
              sx={{mt:8}}
            >
              <Alert onClose={() => setAlert(null)} severity={alert.type} sx={{ width: '100%' }}>
                {alert.message}
              </Alert>
            </Snackbar>
          )}

          <section className="add-doc">
            <h3 style={{ color: deepPurple[400] }}>Müsait Tarih Ekle</h3>
            <div className="input-doc" style={{ height: 400 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer
                  components={[
                    'DatePicker',
                  ]}
                >
                  <DemoItem>
                    <DatePicker
                      value={newAvailableDate.workDay ? dayjs(newAvailableDate.workDay) : null}
                      onChange={(newValue) => handleAvailableDateChange(newValue)}
                      disablePast
                      views={['year', 'month', 'day']}
                      format="YYYY-MM-DD"
                      sx={{width: 192, height: 60}}
                    />
                  </DemoItem>
                </DemoContainer>
              </LocalizationProvider>

              <Select
                id="DoctorSelect"
                placeholder="Doktor"
                value={newAvailableDate.doctorId || ""}
                onChange={handleDoctorSelectChange}
                sx={{ width: 200, height: 40 }}
                displayEmpty
                renderValue={(selected) => selected ? doctor.find(doc => doc.id === selected)?.name : "Doktor Seç"}
              >
                {doctor?.map((doc, index) => (
                  <MenuItem key={index} value={doc.id}>
                    {doc.name}
                  </MenuItem> 
                ))}
              </Select>
              
              <button
                className="btn-add-doc"
                onClick={handleAddAvailableDate}
              >
                Ekle
              </button>
            </div>
          </section>

          <section>
            <div className="doc-list-head">
              <h3  style={{ color: deepPurple[400] }}> Müsait Tarih Listesi </h3>
              <TextField
                  sx={{width: 192, height:50, mr:3, p:0}}
                  InputProps={{
                    style: { height: 30, padding: '0 8px' }
                  }}
                  type="text"
                  placeholder="Tarih Ara"
                  onChange={handleSearchAvailableDateChange}
                  name="search"
                  value={searchAvailableDate}
              />
            </div>
            <TableContainer sx={{ width: 900, height: 400, borderRadius: 4, boxShadow: 0, overflow: 'auto' }} component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow sx={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: "white"}}>
                    <TableCell align="left" sx={{ fontWeight: 'bold', verticalAlign: 'middle' }}>
                      <DateRangeIcon sx={{ fontSize: 20, verticalAlign: 'middle' }} /> Müsait Tarih
                    </TableCell>
                    <TableCell align="left" sx={{ fontWeight: 'bold', verticalAlign: 'middle' }}>
                      <AssignmentIndIcon sx={{ fontSize: 20, verticalAlign: 'middle' }} /> Doktor
                    </TableCell>
                    <TableCell align="left" sx={{ fontWeight: 'bold', verticalAlign: 'middle' }}>
                      <AlternateEmailIcon sx={{ fontSize: 20, verticalAlign: 'middle' }} /> Email
                    </TableCell>
                    <TableCell align="left" sx={{ fontWeight: 'bold', verticalAlign: 'middle' }}>
                      <LocationOnIcon sx={{ fontSize: 20, verticalAlign: 'middle' }} /> Adres
                    </TableCell>
                    <TableCell align="left" sx={{ fontWeight: 'bold', verticalAlign: 'middle' }}>
                      <PushPinIcon sx={{ fontSize: 20, verticalAlign: 'middle' }} /> Şehir
                    </TableCell>
                    <TableCell align="left" sx={{ fontWeight: 'bold', verticalAlign: 'middle' }}>
                      <PhoneAndroidIcon sx={{ fontSize: 20, verticalAlign: 'middle' }} /> Telefon
                    </TableCell>
                    <TableCell align="left" sx={{ fontWeight: 'bold', verticalAlign: 'middle' }}>
                      <SettingsIcon sx={{ fontSize: 20, verticalAlign: 'middle' }} /> İşlemler
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAvailableDate?.map((availableDate, index) => (
                    <TableRow
                      key={index}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell align="left" sx={{ p: 1 }}>
                        {availableDate.workDay !== 'N/A' ? dayjs(availableDate.workDay).format('YYYY-MM-DD') : 'Invalid Date'}
                      </TableCell>
                      <TableCell component="th" scope="row" align="left" sx={{ p: 1 }}>
                        {availableDate.doctor.name}
                      </TableCell>
                      <TableCell align="left" sx={{ p: 1 }}>{availableDate.doctor.email}</TableCell>
                      <TableCell align="left" sx={{ p: 1 }}>{availableDate.doctor.address}</TableCell>
                      <TableCell align="left" sx={{ p: 1 }}>{availableDate.doctor.city}</TableCell>
                      <TableCell align="left" sx={{ p: 1 }}>{availableDate.doctor.phone}</TableCell>
                      <TableCell align="left" sx={{ p: 1 }}>
                        <Button
                          id={availableDate.id}
                          onClick={handleDeleteAvailableDate}
                          variant="outlined"
                          size="small"
                          sx={{ width: 60, fontSize: 12, mr: 1, color: deepPurple[400], borderColor: deepPurple[400] }}
                        >
                          <DeleteSharpIcon sx={{ fontSize: 20 }} /> Sil
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </section>
        </div>
      </div>
    </>
  );
}

export default Doctor;
