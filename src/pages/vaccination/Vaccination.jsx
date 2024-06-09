import { useEffect, useState } from "react";
import axios from "axios";
import "./Vaccination.css";
import { Alert, Snackbar, MenuItem, Select, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import TextField from "@mui/material/TextField";
import { lightGreen, deepPurple } from '@mui/material/colors';
// ICONLAR
import VaccinesIcon from '@mui/icons-material/Vaccines';
import DeleteSharpIcon from '@mui/icons-material/DeleteSharp';
import SettingsIcon from '@mui/icons-material/Settings';
// TARIH
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

function Vaccination() {
  const [vaccination, setVaccination] = useState([]);
  const [animal, setAnimal] = useState([]);
  const [filteredVaccination, setFilteredVaccination] = useState([]);
  const [newVaccination, setNewVaccination] = useState({
    id: null,
    name: "",
    code: "",
    protectionStartDate: null,
    protectionFinishDate: null,
    animal: {},
  });

  const [alert, setAlert] = useState(null);
  const [searchAnimal, setSearchAnimal] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [update, setUpdate] = useState(false);

  // DATA CEKME
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_APP_BASEURL}api/v1/vaccinations`)
      .then((res) => {
        setVaccination(res.data.content);
        setFilteredVaccination(res.data.content);
      });
    axios
      .get(`${import.meta.env.VITE_APP_BASEURL}api/v1/animals`)
      .then((res) => {
        setAnimal(res.data.content);
      });
  }, [update]);

  const handleAnimalSelectChange = (e) => {
    const id = e.target.value;
    const selectedAnimal = animal.find((ani) => ani.id === id);
    setSearchAnimal(id);
    setFilteredVaccination(vaccination.filter((vac) => vac.animal.id === id));
    setNewVaccination((prev) => ({
      ...prev,
      animal: selectedAnimal || {},
    }));
  };

  const handleDateChange = (date, field) => {
    if (field === "startDate") {
      setStartDate(date);
    } else {
      setEndDate(date);
    }
  };

  const handleAddOrUpdateVaccination = () => {
    const vaccinationData = {
      name: newVaccination.name,
      code: newVaccination.code,
      protectionStartDate: newVaccination.protectionStartDate,
      protectionFinishDate: newVaccination.protectionFinishDate,
      animal: newVaccination.animal,
    };

    if (isEditMode) {
      axios
        .put(`${import.meta.env.VITE_APP_BASEURL}api/v1/vaccinations/${newVaccination.id}`, vaccinationData)
        .then(() => setUpdate(false))
        .then(() => setIsEditMode(false))
        .then(() =>
          setNewVaccination({
            id: null,
            name: "",
            code: "",
            protectionStartDate: null,
            protectionFinishDate: null,
            animal: {},
          })
        )
        .then(() => setAlert({ type: 'success', message: 'Aşı başarıyla güncellendi.' }))
        .catch((error) => {
          console.error("Güncelleme Hatası:", error);
          setAlert({ type: 'error', message: `Hata: ${error.response.data.message || error.response.data}` });
        });
    } else {
      axios
        .post(`${import.meta.env.VITE_APP_BASEURL}api/v1/vaccinations`, vaccinationData)
        .then((res) => setVaccination([...vaccination, res.data]))
        .then(() => setUpdate(false))
        .then(() =>
          setNewVaccination({
            id: null,
            name: "",
            code: "",
            protectionStartDate: null,
            protectionFinishDate: null,
            animal: {},
          })
        )
        .then(() => setAlert({ type: 'success', message: 'Aşı başarıyla eklendi.' }))
        .catch((error) => {
          console.error("Ekleme Hatası:", error);
          setAlert({ type: 'error', message: `Hata: ${error.response.data.message || error.response.data}` });
        });
    }
  };

  const handleDeleteVaccination = (e) => {
    const id = e.currentTarget.id;
    axios
      .delete(`${import.meta.env.VITE_APP_BASEURL}api/v1/vaccinations/${id}`)
      .then(() => setUpdate(false))
      .then(() => setAlert({ type: 'warning', message: 'Aşı silindi.' }));
  };

  const handleUpdateVaccinationBtn = (e) => {
    const index = e.currentTarget.id;
    const vac = filteredVaccination[index];

    setNewVaccination({
      ...vac,
      protectionStartDate: dayjs(vac.protectionStartDate),
      protectionFinishDate: dayjs(vac.protectionFinishDate),
      animal: animal.find(a => a.id === vac.animal.id) || {},
    });
    setIsEditMode(true);
  };

  useEffect(() => {
    if (searchAnimal === "" && startDate && endDate) {
      setFilteredVaccination(vaccination);
    } else if (searchAnimal && startDate && endDate) {
      axios
        .get(`${import.meta.env.VITE_APP_BASEURL}api/v1/vaccinations/searchByAnimalAndDateRange`, {
          params: {
            animalId: searchAnimal,
            startDate: dayjs(startDate).format('YYYY-MM-DD'),
            endDate: dayjs(endDate).format('YYYY-MM-DD'),
          }
        })
        .then((res) => setFilteredVaccination(res.data.content))
        .catch((error) => {
          console.error("Search Error:", error);
          setFilteredVaccination([]);
        });
    }
  }, [searchAnimal, startDate, endDate]);

  return (
    <div className="container">
      <h2>Aşı Yönetimi</h2>
      <div className="content-vac">
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
        <section className="add-vac">
          <h3 style={{ color: deepPurple[400] }}>Aşı Ekle/Güncelle</h3>
          <div className="input-vac" style={{ height: 400 }}>
            <TextField
              type="text"
              label="Aşı Adı"
              name="name"
              value={newVaccination.name}
              onChange={(e) => setNewVaccination({ ...newVaccination, name: e.target.value })}
              variant="outlined"
              sx={{ width: 192, height: 50 }}
            />
            <TextField
              type="text"
              label="Aşı Kodu"
              name="code"
              value={newVaccination.code}
              onChange={(e) => setNewVaccination({ ...newVaccination, code: e.target.value })}
              variant="outlined"
              sx={{ width: 192, height: 50 }}
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Koruma Başlangıç Tarihi"
                value={newVaccination.protectionStartDate}
                onChange={(date) => setNewVaccination({ ...newVaccination, protectionStartDate: date })}
                disablePast
                views={['year', 'month', 'day']}
                format="YYYY-MM-DD"
                slotProps={{ textField: { variant: 'outlined' } }}
                sx={{ width: 192, height: 50 }}
              />
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Koruma Bitiş Tarihi"
                value={newVaccination.protectionFinishDate}
                onChange={(date) => setNewVaccination({ ...newVaccination, protectionFinishDate: date })}
                disablePast
                views={['year', 'month', 'day']}
                format="YYYY-MM-DD"
                slotProps={{ textField: { variant: 'outlined' } }}
                sx={{ width: 192, height: 50 }}
              />
            </LocalizationProvider>
            <Select
              labelId="Animal"
              id="AnimalSelect"
              value={newVaccination.animal.id || ""}
              onChange={handleAnimalSelectChange}
              sx={{ width: 192, height: 50 }}
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
              className="btn-add-vac"
              onClick={handleAddOrUpdateVaccination}
            >
              {isEditMode ? "Kaydet" : "Ekle"}
            </button>
          </div>
        </section>
        <section>
          <div className="vac-list-head">
            <h3 style={{ color: deepPurple[400] }}>Aşı Listesi</h3>
          </div>
          <TableContainer
            sx={{
              width: 1100,
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
                    <VaccinesIcon sx={{ fontSize: 20, verticalAlign: "middle" }} />{" "}
                    Aşı Adı
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{ fontWeight: "bold", verticalAlign: "middle" }}
                  >
                    Aşı Kodu
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{ fontWeight: "bold", verticalAlign: "middle" }}
                  >
                    Başlangıç Tarihi
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{ fontWeight: "bold", verticalAlign: "middle" }}
                  >
                    Bitiş Tarihi
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{ fontWeight: "bold", verticalAlign: "middle" }}
                  >
                    Hayvan Adı
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{ fontWeight: "bold", verticalAlign: "middle" }}
                  >
                    Hayvan Türü
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: "bold", verticalAlign: "middle" }}
                  >
                    <SettingsIcon sx={{ fontSize: 20, verticalAlign: "middle" }} />{" "}
                    İşlemler
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredVaccination?.map((vac, index) => (
                  <TableRow
                    key={index}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" align="left" sx={{ p: 1 }}>
                      {vac.name}
                    </TableCell>
                    <TableCell component="th" scope="row" align="left" sx={{ p: 1 }}>
                      {vac.code}
                    </TableCell>
                    <TableCell component="th" scope="row" align="left" sx={{ p: 1 }}>
                      {vac.protectionStartDate ? dayjs(vac.protectionStartDate).format('YYYY-MM-DD') : 'Invalid Date'}
                    </TableCell>
                    <TableCell component="th" scope="row" align="left" sx={{ p: 1 }}>
                      {vac.protectionFinishDate ? dayjs(vac.protectionFinishDate).format('YYYY-MM-DD') : 'Invalid Date'}
                    </TableCell>
                    <TableCell align="left" sx={{ p: 1 }}>
                      {vac.animal?.name || "Bilinmeyen Hayvan"}
                    </TableCell>
                    <TableCell align="left" sx={{ p: 1 }}>
                      {vac.animal?.species}
                    </TableCell>
                    <TableCell align="center" sx={{ p: 1 }}>
                      <Button
                        id={vac.id}
                        onClick={handleDeleteVaccination}
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
                        onClick={handleUpdateVaccinationBtn}
                        variant="outlined"
                        size="small"
                        sx={{
                          width: 120,
                          fontSize: 12,
                          color: lightGreen[600],
                          borderColor: lightGreen[600],
                        }}
                      >
                        <SettingsIcon sx={{ fontSize: 20 }} /> Güncelle
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <div className="vac-list-head">
            <h3 style={{ color: lightGreen[600] }}>Hayvana/Tarihe Göre Filtreleme</h3>
          </div>
          <div className="search-appointment">
            <div className="search-doctor">
              <Select
                id="searchAnimalSelect"
                value={searchAnimal || ""}
                onChange={handleAnimalSelectChange}
                sx={{ width: 192, height: 55 }}
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
                  onChange={(date) => handleDateChange(date, "startDate")}
                  slotProps={{ textField: { variant: 'outlined' } }}
                />
              </LocalizationProvider>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Bitiş Tarihi"
                  value={endDate ? dayjs(endDate) : null}
                  onChange={(date) => handleDateChange(date, "endDate")}
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

export default Vaccination;
