import './Home.css';
// PROJE ANA SAYFASI
const Home = () => {
  return (
    <div className="home-container">
      <h1>VetApp'e hoşgeldiniz!</h1>
      <img 
        src="/pet.png" 
        alt="Veterinary" 
        className="vet-image"
      />
      
      <div className='greeting'>
        <span>Bu sistem sayesinde aşağıdaki işlemleri kolaylıkla gerçekleştirebilirsiniz:</span>
        <ul>
          <li>Veteriner doktorlarının bilgilerini yönetme</li>
          <li>Müşteri ve hayvan kayıtlarını tutma</li>
          <li>Hayvanların aşı takvimlerini düzenleme</li>
          <li>Randevuları planlama ve takip etme</li>
        </ul>
      </div>

      <h2>İşlemlerinizi menü bölümünden gerçekleştirebilirsiniz.</h2>
    </div>
  );
};

export default Home;
