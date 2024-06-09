import { useEffect, useState } from "react";
import axios from "axios";
import "./Report.css";
// MUI
import { Alert, Snackbar, TextField, MenuItem, Select, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, InputAdornment } from '@mui/material';
// RENK
import { lightGreen, deepPurple } from '@mui/material/colors';
// ICONLAR
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteSharpIcon from '@mui/icons-material/DeleteSharp';
import UpdateIcon from '@mui/icons-material/Update';

function Report() {
  const [report, setReport] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [update, setUpdate] = useState(false);
  const [filteredReport, setFilteredReport] = useState([]);
  const [newReport, setNewReport] = useState({
    title: "",
    diagnosis: "",
    price: 0,
    appointmentId: "",
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [alert, setAlert] = useState(null);
  const [searchInput, setSearchInput] = useState("");

  // DATA ÇEKME
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_APP_BASEURL}api/v1/reports`)
      .then((res) => {
        setReport(res.data.content);
        setFilteredReport(res.data.content);
      })
      .then(() => setUpdate(true));
    axios
      .get(`${import.meta.env.VITE_APP_BASEURL}api/v1/appointments`)
      .then((res) => {
        setAppointments(res.data.content);
      })
      .then(() => setUpdate(true));
  }, [update]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReport((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // INPUT YONETIMI
  const handleAddOrUpdateReport = () => {
    if (isEditMode) {
      axios
        .put(`${import.meta.env.VITE_APP_BASEURL}api/v1/reports/${newReport.id}`, newReport)
        .then(() => setUpdate(false))
        .then(() => setIsEditMode(false))
        .then(() =>
          setNewReport({
            title: "",
            diagnosis: "",
            price: 0,
            appointmentId: "",
          })
        )
        .then(() => setAlert({ type: 'success', message: 'Rapor başarıyla güncellendi.' }));
    } else {
      axios
        .post(`${import.meta.env.VITE_APP_BASEURL}api/v1/reports`, newReport)
        .then((res) => console.log(res))
        .then(() => setUpdate(false))
        .then(() =>
          setNewReport({
            title: "",
            diagnosis: "",
            price: 0,
            appointmentId: "",
          })
        )
        .then(() => setAlert({ type: 'success', message: 'Rapor başarıyla eklendi.' }));
    }
  };

  const handleDeleteReport = (e) => {
    const id = e.target.id;
    axios
      .delete(`${import.meta.env.VITE_APP_BASEURL}api/v1/reports/${id}`)
      .then(() => setUpdate(false))
      .then(() => setAlert({ type: 'warning', message: 'Rapor silindi.' }));
  };

  const handleUpdateReportBtn = (e) => {
    const index = e.target.id;
    setNewReport({
      ...report[index],
      appointmentId: report[index].appointment.id // appointmentId'yi doğru şekilde set et
    });
    setIsEditMode(true);
  };

  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  useEffect(() => {
    if (searchInput === "") {
      setFilteredReport(report);
    } else {
      setFilteredReport(
        report?.filter((rep) =>
          rep.title.toLowerCase().includes(searchInput.toLowerCase())
        )
      );
    }
  }, [searchInput, report]);

  const handleAppointmentSelectChange = (e) => {
    const value = e.target.value;
    setNewReport((prev) => ({
      ...prev,
      appointmentId: value,
    }));
  };

  return (
    <>
      <div className="container">
        <h2>Rapor Yönetimi</h2>
        <div className="content-rep">
          {alert && (
            <Snackbar
              open={!!alert}
              autoHideDuration={3000}
              onClose={() => setAlert(null)}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              sx={{ mt: 8 }}
            >
              <Alert onClose={() => setAlert(null)} severity={alert.type} sx={{ width: '100%' }}>
                {alert.message}
              </Alert>
            </Snackbar>
          )}
          <section className="add-rep">
            <h3 style={{ color: deepPurple[400] }}>Rapor Ekle/Güncelle</h3>
            <div className="input-rep" style={{ height: 400 }}>
              <TextField
                type="text"
                placeholder="Rapor Başlığı"
                name="title"
                value={newReport.title}
                onChange={handleInputChange}
                variant="standard"
              />
              <TextField
                type="text"
                placeholder="Tanı/Teşhis"
                name="diagnosis"
                value={newReport.diagnosis}
                onChange={handleInputChange}
                variant="standard"
              />
              <TextField
                type="number"
                placeholder="Ücret"
                name="price"
                value={newReport.price}
                onChange={handleInputChange}
                variant="standard"
                InputProps={{
                  endAdornment: <InputAdornment position="end">₺</InputAdornment>,
                }}
                sx={{ width: 192}}
              />
              
              <Select
                labelId="AppointmentIdSelect"
                id="AppointmentIdSelect"
                value={newReport.appointmentId || ""}
                onChange={handleAppointmentSelectChange}
                sx={{ width: 192, height: 40 }}
                displayEmpty
                renderValue={newReport.appointmentId !== "" ? undefined : () => "Randevu No Seç"}
              >
                {appointments?.map((app, index) => (
                  <MenuItem key={index} value={app.id}>
                    {app.id}
                  </MenuItem>
                ))}
              </Select>
              <button
                className="btn-add-rep"
                onClick={handleAddOrUpdateReport}
              >
                {isEditMode ? "Kaydet" : "Ekle"}
              </button>
            </div>
          </section>

          <section>
            <div className="rep-list-head">
              <h3 style={{ color: deepPurple[400] }}>Rapor Listesi</h3>
              <TextField
                sx={{ width: 192, height: 50, mr: 3, p: 0 }}
                InputProps={{
                  style: { height: 30, padding: '0 8px' }
                }}
                type="text"
                placeholder="Rapor Adı Ara"
                onChange={handleSearchInputChange}
                name="search"
                value={searchInput}
              />
            </div>
            <TableContainer sx={{ width: 1100, height: 400, borderRadius: 4, boxShadow: 0, overflow: 'auto' }} component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow sx={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: "white" }}>
                    <TableCell align="left" sx={{ fontWeight: 'bold', verticalAlign: 'middle' }}>
                      Başlık
                    </TableCell>
                    <TableCell align="left" sx={{ fontWeight: 'bold', verticalAlign: 'middle' }}>
                      Hayvan Adı
                    </TableCell>
                    <TableCell align="left" sx={{ fontWeight: 'bold', verticalAlign: 'middle' }}>
                      Müşteri Adı
                    </TableCell>
                    <TableCell align="left" sx={{ fontWeight: 'bold', verticalAlign: 'middle' }}>
                      Doktor Adı
                    </TableCell>
                    <TableCell align="left" sx={{ fontWeight: 'bold', verticalAlign: 'middle' }}>
                      Tanı/Teşhis
                    </TableCell>
                    <TableCell align="left" sx={{ fontWeight: 'bold', verticalAlign: 'middle' }}>
                      Ücret (₺)
                    </TableCell>
                    <TableCell align="left" sx={{ fontWeight: 'bold', verticalAlign: 'middle' }}>
                      Randevu tarih
                    </TableCell>
                    <TableCell align="left" sx={{ fontWeight: 'bold', verticalAlign: 'middle' }}>
                      Randevu no
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', verticalAlign: 'middle' }}>
                      <SettingsIcon sx={{ fontSize: 20, verticalAlign: 'middle' }} /> İşlemler
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredReport?.map((rep, index) => (
                    <TableRow
                      key={index}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row" align="left" sx={{ p: 1 }}>
                        {rep.title}
                      </TableCell>
                      <TableCell component="th" scope="row" align="left" sx={{ p: 1 }}>
                        {rep.appointment.animalName}
                      </TableCell>
                      <TableCell component="th" scope="row" align="left" sx={{ p: 1 }}>
                        {rep.appointment.customerName}
                      </TableCell>
                      <TableCell component="th" scope="row" align="left" sx={{ p: 1 }}>
                        {rep.appointment.doctorName}
                      </TableCell>
                      <TableCell align="left" sx={{ p: 1 }}>{rep.diagnosis}</TableCell>
                      <TableCell align="left" sx={{ p: 1 }}>{rep.price}</TableCell>
                      <TableCell align="left" sx={{ p: 1 }}>{rep.appointment.date}</TableCell>
                      <TableCell component="th" scope="row" align="left" sx={{ p: 1 }}>
                        {rep.appointment.id}
                      </TableCell>
                      <TableCell align="center" sx={{ p: 1 }}>
                        <Button
                          id={rep.id}
                          onClick={handleDeleteReport}
                          variant="outlined"
                          size="small"
                          sx={{ width: 60, fontSize: 12, mr: 1, color: deepPurple[400], borderColor: deepPurple[400] }}
                        >
                          <DeleteSharpIcon sx={{ fontSize: 20 }} /> Sil
                        </Button>
                        <Button
                          id={index}
                          onClick={handleUpdateReportBtn}
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
      </div>
    </>
  );
}

export default Report;
