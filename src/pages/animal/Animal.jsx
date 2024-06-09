import { useEffect, useState } from "react";
import axios from "axios";
import "./Animal.css";
// MUI
import { Alert, Snackbar } from "@mui/material";
import { lightGreen, deepPurple } from "@mui/material/colors";
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
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import EmojiNatureIcon from '@mui/icons-material/EmojiNature';
import PetsIcon from '@mui/icons-material/Pets';
import PaletteIcon from '@mui/icons-material/Palette';
import TransgenderIcon from '@mui/icons-material/Transgender';
import DateRangeIcon from '@mui/icons-material/DateRange';
import SettingsIcon from "@mui/icons-material/Settings";

function Animal() {
  const [animal, setAnimal] = useState([]);
  const [customer, setCustomer] = useState([]);
  const [update, setUpdate] = useState(false);
  const [filteredAnimal, setFilteredAnimal] = useState([]);
  const [newAnimal, setNewAnimal] = useState({
    id: null,
    name: "",
    species: "",
    breed: "",
    gender: "",
    colour: "",
    dateOfBirth: "",
    customer: {},
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [alert, setAlert] = useState(null);
  const [searchAnimal, setSearchAnimal] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");

  // DATA CEKME
  useEffect(() => {
    axios
      .get(import.meta.env.VITE_APP_BASEURL + "api/v1/animals")
      .then((res) => {
        setAnimal(res.data.content);
        setFilteredAnimal(res.data.content);
      })
      .then(() => setUpdate(true));
    axios
      .get(import.meta.env.VITE_APP_BASEURL + "api/v1/customers")
      .then((res) => setCustomer(res.data.content))
      .then(() => setUpdate(true));
  }, [update]);

  // dateOfBirth formatini hazirla(datanin istedigi sekilde)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return dateString;
  };

  // INPUT YONETIMI - MUSTERI EKLE/GUNCELLE
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const formattedValue = name === 'dateOfBirth' ? formatDate(value) : value;
    setNewAnimal((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  const handleCustomerSelectChange = (e) => {
    const id = e.target.value;
    const newCustomer = customer?.find((c) => c.id === +id);
    setNewAnimal((prev) => ({
      ...prev,
      customer: newCustomer || {},
    }));
  }

  // DATA EKLEME/GUNCELLEME
  const handleAddOrUpdateAnimal = () => {
    const formattedAnimal = {
      ...newAnimal,
      dateOfBirth: formatDate(newAnimal.dateOfBirth)
    };

    if (isEditMode) {
      axios
        .put(`${import.meta.env.VITE_APP_BASEURL}api/v1/animals/${newAnimal.id}`, formattedAnimal)
        .then(() => setUpdate(false))
        .then(() => setIsEditMode(false))
        .then(() =>
          setNewAnimal({
            id: "",
            name: "",
            species: "",
            breed: "",
            gender: "",
            dateOfBirth: "",
            colour: "",
            customer: {},
          })
        )
        .then(() => setAlert({ type: 'success', message: 'Hayvan başarıyla güncellendi.' }));
    } else {
      axios
        .post(import.meta.env.VITE_APP_BASEURL + "api/v1/animals", formattedAnimal)
        .then((res) => console.log(res))
        .then(() => setUpdate(false))
        .then(() =>
          setNewAnimal({
            id: "",
            name: "",
            species: "",
            breed: "",
            gender: "",
            dateOfBirth: "",
            colour: "",
            customer: {},
          })
        )
        .then(() => setAlert({ type: 'success', message: 'Hayvan başarıyla eklendi.' }));
    }
  };

  // HAYVAN SILME BUTONU
  const handleDeleteAnimal = (e) => {
    const id = e.target.id;
    axios
      .delete(`${import.meta.env.VITE_APP_BASEURL}api/v1/animals/${id}`)
      .then(() => setUpdate(false))
      .then(() => setAlert({ type: 'warning', message: 'Hayvan silindi.' }));
  };

  // HAYVAN GUNCELLEME BUTONU
  const handleUpdateAnimalBtn = (e) => {
    const index = e.target.id;
    const animalToUpdate = filteredAnimal[index];
    setNewAnimal({
      ...animalToUpdate,
      dateOfBirth: formatDate(animalToUpdate.dateOfBirth)
    });
    setIsEditMode(true);
  };

  // INPUT YONETIMI - SEARCH:
  const handleSearchAnimalChange = (e) => {
    setSearchAnimal(e.target.value);
  };
  const handleSearchCustomerChange = (e) => {
    setSearchCustomer(e.target.value);
  };

  // girilen inputa gore API ile filtreleme islemi
  useEffect(() => {
    if (searchAnimal === "") {
      setFilteredAnimal(animal);
    } else {
      axios
        .get(import.meta.env.VITE_APP_BASEURL + `api/v1/animals/searchByName?name=${searchAnimal}`)
        .then((res) => setFilteredAnimal(res.data.content))
        .catch((error) => {
          console.error("Search Error:", error);
          setFilteredAnimal([]);
        });
    }
  }, [searchAnimal, animal]);

  // girilen inputa gore API ile filtreleme islemi
  useEffect(() => {
    if (searchCustomer === "") {
      setFilteredAnimal(animal);
    } else {
      axios
        .get(import.meta.env.VITE_APP_BASEURL + `api/v1/animals/searchByCustomer?customerName=${searchCustomer}`)
        .then((res) => setFilteredAnimal(res.data.content))
        .catch((error) => {
          console.error("Search Error:", error);
          setFilteredAnimal([]);
        });
    }
  }, [searchCustomer, animal]);

  return (
    <>
      <div className="container">
        <h2>Hayvan Yönetimi</h2>
        <div className="content-ani">
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
            <h3 style={{ color: deepPurple[400] }}>Hayvan Ekle/Güncelle</h3>
            <div className="input-ani" style={{ height: 400 }}>
              <TextField
                type="text"
                placeholder="Hayvan Adı"
                name="name"
                value={newAnimal.name}
                onChange={handleInputChange}
                variant="standard"
              />
              <TextField
                type="text"
                placeholder="Hayvan Türü"
                name="species"
                value={newAnimal.species}
                onChange={handleInputChange}
                variant="standard"
              />
              <TextField
                type="text"
                placeholder="Hayvan Cinsi"
                name="breed"
                value={newAnimal.breed}
                onChange={handleInputChange}
                variant="standard"
              />
              <TextField
                type="text"
                placeholder="Hayvan Cinsiyeti"
                name="gender"
                value={newAnimal.gender}
                onChange={handleInputChange}
                variant="standard"
              />
              <TextField
                type="text"
                placeholder="Hayvan Rengi"
                name="colour"
                value={newAnimal.colour}
                onChange={handleInputChange}
                variant="standard"
              />
              <TextField
                type="text"
                placeholder="YYYY-AA-GG (Doğum T.)"
                name="dateOfBirth"
                value={newAnimal.dateOfBirth}
                onChange={handleInputChange}
                variant="standard"
              />
              <Select
                labelId="Animal"
                id="AnimalSelect"
                placeholder="Sahibi"
                name="customer"
                value={newAnimal.customer.id || ""}
                label="Age"
                onChange={handleCustomerSelectChange}
                sx={{ width: 192, height: 40 }}
                displayEmpty
                renderValue={(selected) => selected ? customer.find(cust => cust.id === selected).name : "Müşteri Seç"}
              >
                {customer?.map((cust, index) => (
                  <MenuItem key={index} value={cust.id}>
                    {cust.name}
                  </MenuItem> 
                ))}
              </Select>

              <button
                className="btn-add-ani"
                onClick={handleAddOrUpdateAnimal}
              >
                {isEditMode ? "Kaydet" : "Ekle"}
              </button>
            </div>
          </section>

          <section>
            <div className="ani-list-head" >
              <h3 style={{ color: deepPurple[400] }}>Hayvan Listesi</h3>
              <TextField
                sx={{ width: 192, height: 50, mr: 3, p: 0 }}
                InputProps={{
                  style: { height: 30, padding: "0 8px" },
                }}
                type="text"
                placeholder="Hayvan Adı Ara"
                onChange={handleSearchAnimalChange}
                name="searchAnimal"
                value={searchAnimal}
              />
              <TextField
                sx={{ width: 192, height: 50, mr: 3, p: 0 }}
                InputProps={{
                  style: { height: 30, padding: "0 8px" },
                }}
                type="text"
                placeholder="Müşteri Adı Ara"
                onChange={handleSearchCustomerChange}
                name="searchCustomer"
                value={searchCustomer}
              />
            </div>
            <TableContainer
              sx={{
                width: 1100,
                height: 400,
                borderRadius: 4,
                boxShadow: 0,
                overflow: "auto",
              }}
              component={Paper}
            >
              <Table sx={{ minWidth: 650,  }} aria-label="simple table">
                <TableHead>
                  <TableRow sx={{ position: "sticky", top: 0, zIndex: 1, backgroundColor: "white" }}>
                    <TableCell
                      align="left"
                      sx={{ fontWeight: "bold", verticalAlign: "middle" }}
                    >
                      <DriveFileRenameOutlineIcon
                        sx={{ fontSize: 20, verticalAlign: "middle" }}
                      />{" "}
                      Hayvan Adı
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{ fontWeight: "bold", verticalAlign: "middle" }}
                    >
                      <EmojiNatureIcon
                        sx={{ fontSize: 20, verticalAlign: "middle" }}
                      />{" "}
                      Türü
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{ fontWeight: "bold", verticalAlign: "middle" }}
                    >
                      <PetsIcon
                        sx={{ fontSize: 20, verticalAlign: "middle" }}
                      />{" "}
                      Cinsi
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{ fontWeight: "bold", verticalAlign: "middle" }}
                    >
                      <TransgenderIcon
                        sx={{ fontSize: 20, verticalAlign: "middle" }}
                      />{" "}
                      Cinsiyeti
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{ fontWeight: "bold", verticalAlign: "middle" }}
                    >
                      <PaletteIcon
                        sx={{ fontSize: 20, verticalAlign: "middle" }}
                      />{" "}
                      Rengi
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{ fontWeight: "bold", verticalAlign: "middle" }}
                    >
                      <DateRangeIcon
                        sx={{ fontSize: 20, verticalAlign: "middle" }}
                      />{" "}
                      Doğum Tarihi
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{ fontWeight: "bold", verticalAlign: "middle" }}
                    >
                      <AccountBoxIcon
                        sx={{ fontSize: 20, verticalAlign: "middle" }}
                      />{" "}
                      Sahibi
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{ fontWeight: "bold", verticalAlign: "middle" }}
                    >
                      <SettingsIcon
                        sx={{ fontSize: 20, verticalAlign: "middle" }}
                      />{" "}
                      İşlemler
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAnimal?.map((ani, index) => (
                    <TableRow
                      key={index}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell
                        component="th"
                        scope="row"
                        align="left"
                        sx={{ p: 1 }}
                      >
                        {ani.name}
                      </TableCell>
                      <TableCell align="left" sx={{ p: 1 }}>
                        {ani.species}
                      </TableCell>
                      <TableCell align="left" sx={{ p: 1 }}>
                        {ani.breed}
                      </TableCell>
                      <TableCell align="left" sx={{ p: 1 }}>
                        {ani.gender}
                      </TableCell>
                      <TableCell align="left" sx={{ p: 1 }}>
                        {ani.colour}
                      </TableCell>
                      <TableCell align="left" sx={{ p: 1 }}>
                        {ani.dateOfBirth}
                      </TableCell>
                      <TableCell align="left" sx={{ p: 1 }}>
                        {ani.customer.name}
                      </TableCell>
                      <TableCell align="center" sx={{ p: 1 }}>
                        <Button
                          id={ani.id}
                          onClick={handleDeleteAnimal}
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
                          onClick={handleUpdateAnimalBtn}
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
          </section>
        </div>
      </div>
    </>
  );
}

export default Animal;
