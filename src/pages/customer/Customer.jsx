import { useEffect, useState } from "react";
import axios from "axios";
import "./Customer.css";
// MUI
// alert
import { Alert, Snackbar } from '@mui/material';
// color
import { lightGreen, deepPurple } from '@mui/material/colors';
// input
import TextField from '@mui/material/TextField';
//button icons
import DeleteSharpIcon from '@mui/icons-material/DeleteSharp';
import UpdateIcon from '@mui/icons-material/Update';
import Button from '@mui/material/Button';
// table
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
// list icons
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PushPinIcon from '@mui/icons-material/PushPin';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import SettingsIcon from '@mui/icons-material/Settings';

function Customer() {
  const [customer, setCustomer] = useState([]);
  const [update, setUpdate] = useState(false);
  const [filteredCustomer, setFilteredCustomer] = useState([]);
  const [newCustomer, setNewCustomer] = useState({
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
      .get(import.meta.env.VITE_APP_BASEURL + "api/v1/customers")
      .then((res) => {
        setCustomer(res.data.content);
        setFilteredCustomer(res.data.content); // filteredCustomer'ı başlat
      });
  }, [update]);

  // INPUT YONETIMI - MUSTERI EKLE/GUNCELLE
  const handleInputChange = (e) => {
    // inputa girilen degerleri al
    const { name, value } = e.target;

    // TELEFON-MAIL FORMATI:
    // telefon numarasi kontrolu(format belirleme)
    if (name === "phone") {
      const phoneFormat = /^\+90-\d{0,10}$/;
      if (!phoneFormat.test(value)) {
        return; // format uymazsa işlem yapma
      }
      if (value === "+90-") {
        setNewCustomer((prev) => ({
          ...prev,
          phone: value,
        }));
        return;
      }
      if (value.startsWith("+90-")) {
        const numberPart = value.substr("+90-".length);
        if (/^\d{0,10}$/.test(numberPart)) {
          setNewCustomer((prev) => ({
            ...prev,
            phone: "+90-" + numberPart,
          }));
        }
      }
    }
    // newCustomer'in statini guncelle(onceki durumu al, yenisini ona ekle)
    setNewCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  // telefon numarasini +90 standardi ile baslatma
  const handlePhoneFocus = () => {
    if (newCustomer.phone === "") {
      setNewCustomer((prev) => ({
        ...prev,
        phone: "+90-",
      }));
    }
  };

  // EMAIL FORMATI BELIRLEME(format harici girislerde alert kullanimi)
  const handleEmailBlur = (e) => {
    const { name, value } = e.target;
    if (name === "email") {
      const emailFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailFormat.test(value)) {
        setAlert({ type: 'error', message: 'Geçersiz e-mail formatı' });
        setNewCustomer((prev) => ({
          ...prev,
          email: "",
        }));
      } else {
        setAlert(null);
      }
    }
  };

  // DATA EKLEME/GUNCELLEME
  const handleAddOrUpdateCustomer = () => {
    if (isEditMode) {
      axios
        .put(`${import.meta.env.VITE_APP_BASEURL}api/v1/customers/${newCustomer.id}`, newCustomer)
        .then(() => setUpdate(false))
        .then(() => setIsEditMode(false))
        .then(() =>
          setNewCustomer({
            id: null,
            name: "",
            phone: "",
            email: "",
            address: "",
            city: "",
          })
        )
        .then(() => setAlert({ type: 'success', message: 'Müşteri başarıyla güncellendi.' }));
    } else {
      axios
        .post(import.meta.env.VITE_APP_BASEURL + "api/v1/customers", newCustomer)
        .then((res) => console.log(res))
        .then(() => setUpdate(false))
        .then(() =>
          setNewCustomer({
            id: null,
            name: "",
            phone: "",
            email: "",
            address: "",
            city: "",
          })
        )
        .then(() => setAlert({ type: 'success', message: 'Müşteri başarıyla eklendi.' }));
    }
  };

  // MUSTERI SILME BUTONU
  const handleDeleteCustomer = (e) => {
    const id = e.target.id;
    axios
      .delete(`${import.meta.env.VITE_APP_BASEURL}api/v1/customers/${id}`)
      .then(() => setUpdate(false))
      .then(() => setAlert({ type: 'warning', message: 'Müşteri silindi.' }));
  };

  // MUSTERI GUNCELLEME BUTONU
  const handleUpdateCustomerBtn = (e) => {
    const index = e.target.id;
    setNewCustomer({
      ...customer[index]
    });
    setIsEditMode(true);
  };

  // INPUT YONETIMI - SEARCH:
  // search inputun girilen degeri almasi
  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  // girilen inputa gore API ile filtreleme islemi
  useEffect(() => {
    if (searchInput === "") {
      setFilteredCustomer(customer);
    } else {
      axios
        .get(import.meta.env.VITE_APP_BASEURL + `api/v1/customers/searchByName?name=${searchInput}`)
        .then((res) => setFilteredCustomer(res.data.content))
        .catch((error) => {
          console.error("Search Error:", error);
          setFilteredCustomer([]);
        });
    }
  }, [searchInput, customer]);

  return (
    <>
      <div className="container">
        <h2>Müşteri Yönetimi</h2>
        <div className="content-cust">
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
          <section className="add-cust">
            <h3 style={{ color: deepPurple[400] }}>Müşteri Ekle/Güncelle</h3>
            <div className="input-cust" style={{ height: 400 }}>
              <TextField
                type="text"
                placeholder="Müşteri Adı"
                name="name"
                value={newCustomer.name}
                onChange={handleInputChange}
                variant="standard"
              />
              <TextField
                type="text"
                placeholder="Müşteri Epostası"
                name="email"
                value={newCustomer.email}
                onChange={handleInputChange}
                onBlur={handleEmailBlur}
                variant="standard"
              />
              <TextField
                type="text"
                placeholder="Müşteri Adresi"
                name="address"
                value={newCustomer.address}
                onChange={handleInputChange}
                variant="standard"
              />
              <TextField
                type="text"
                placeholder="Müşteri Şehir"
                name="city"
                value={newCustomer.city}
                onChange={handleInputChange}
                variant="standard"
              />
              <TextField
                type="text"
                placeholder="Müşteri Telefon"
                name="phone"
                value={newCustomer.phone}
                onChange={handleInputChange}
                onFocus={handlePhoneFocus}
                variant="standard"
              />
              <button
                className="btn-add-cust"
                onClick={handleAddOrUpdateCustomer}
              >
                {isEditMode ? "Kaydet" : "Ekle"}
              </button>
            </div>
          </section>

          <section>
            <div className="cust-list-head">
              <h3  style={{ color: deepPurple[400] }}>Müşteri Listesi</h3>
              <TextField
                  sx={{width: 192, height:50, mr:3, p:0}}
                  InputProps={{
                    style: { height: 30, padding: '0 8px' }
                  }}
                  type="text"
                  placeholder="Müşteri Adı Ara"
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
                      <AssignmentIndIcon sx={{ fontSize: 20, verticalAlign: 'middle' }} /> Müşteri
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
                  {filteredCustomer?.map((cust, index) => (
                    <TableRow
                      key={index}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row" align="left" sx={{ p: 1 }}>
                        {cust.name}
                      </TableCell>
                      <TableCell align="left" sx={{ p: 1 }}>{cust.email}</TableCell>
                      <TableCell align="left" sx={{ p: 1 }}>{cust.address}</TableCell>
                      <TableCell align="left" sx={{ p: 1 }}>{cust.city}</TableCell>
                      <TableCell align="left" sx={{ p: 1 }}>{cust.phone}</TableCell>
                      <TableCell align="center" sx={{ p: 1 }}>
                        <Button
                          id={cust.id}
                          onClick={handleDeleteCustomer}
                          variant="outlined"
                          size="small"
                          sx={{ width: 60, fontSize: 12, mr: 1, color: deepPurple[400], borderColor: deepPurple[400] }}
                        >
                          <DeleteSharpIcon sx={{ fontSize: 20 }} /> Sil
                        </Button>
                        <Button
                          id={index}
                          onClick={handleUpdateCustomerBtn}
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

export default Customer;
