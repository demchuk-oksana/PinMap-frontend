import React, { useState, useEffect, useRef } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import RoomIcon from '@mui/icons-material/Room';
import StarIcon from '@mui/icons-material/Star';
import './App.css';
import axios from 'axios';
import Register from './components/Register';
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import Settings from "./components/Settings";
import PinDropIcon from '@mui/icons-material/PinDrop';
import Welcome from "./components/Welcome";

const API_URL = process.env.REACT_APP_API_URL;

function App() {
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [title, SetTitle] = useState("");
  const [desc, SetDesc] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const mapRef = useRef(null);
  const isMobile =
  /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const [currentUser, setCurrentUser] = useState(localStorage.getItem("user") || null);
  const [pins, setPins] = useState([]);
  const [newPlace, setNewPlace] = useState(null);
  const [selectedPin, setSelectedPin] = useState(null);
  const [editingPin, setEditingPin] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editRating, setEditRating] = useState(0);
  const [editHoverRating, setEditHoverRating] = useState(0);
  const [newPhoto, setNewPhoto] = useState(null);
  const [editPhoto, setEditPhoto] = useState(null);
  const [allComments, setAllComments] = useState([]);
  const [userLocation, setUserLocation] = useState(() => {
    const lat = localStorage.getItem("userLat");
    const long = localStorage.getItem("userLong");
    return lat && long ? { lat: parseFloat(lat), long: parseFloat(long) } : null;})
  const [myLocation, setMyLocation] = useState(null);
  const [viewState, setViewState] = useState(() => {
    const lat = localStorage.getItem("userLat");
    const long = localStorage.getItem("userLong");
    return {
        latitude: lat ? parseFloat(lat) : 20,
        longitude: long ? parseFloat(long) : 0,
        zoom: lat ? 14 : 2,
    };
});
  const [showWelcome, setShowWelcome] = useState(!localStorage.getItem("user"));
  

  useEffect(() => {
    if (currentUser) setShowWelcome(false);
  }, [currentUser]);

  useEffect(() => {
    if (userLocation) {
      mapRef.current?.flyTo({
        center: [userLocation.long, userLocation.lat],
        zoom: 14,
        duration: 1500,
      });
    }
  }, [userLocation]);

  useEffect(() => {
    const getData = async () => {
      try {
        const [pinsRes, commentsRes] = await Promise.all([
          axios.get(`${API_URL}/api/pins`),
          axios.get(`${API_URL}/api/comments`),
        ]);
        setPins(pinsRes.data);
        setAllComments(commentsRes.data);
      } catch (err) {
        console.log(err);
      }
    };
    getData();
  }, []);

 useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
        (pos) => {
            setMyLocation({
                lat: pos.coords.latitude,
                long: pos.coords.longitude,
            });
        },
        (err) => console.log("Geolocation error:", err),
        { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
}, []);

const handleCenterMe = () => {
    if (myLocation) {
        mapRef.current?.flyTo({
            center: [myLocation.long, myLocation.lat],
            zoom: 15,
            duration: 1000,
        });
    }
};

  const handleAddClick = (e) => {
    e.preventDefault();
    if (!currentUser) {
      setShowLoginAlert(true);
      setTimeout(() => setShowLoginAlert(false), 3000);
      return;
    }
    const { lng, lat } = e.lngLat;
    setNewPlace({ long: lng, lat: lat });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newPin = {
      username: currentUser,
      title,
      desc,
      rating: newRating,
      lat: newPlace.lat,
      long: newPlace.long,
    };
    try {
      const res = await axios.post(`${API_URL}/api/pins`, newPin);
      const savedPin = res.data;

      if (newPhoto) {
        const formData = new FormData();
        formData.append("photos", newPhoto);
        const photoRes = await axios.post(`${API_URL}/api/pins/${savedPin._id}/photos`, formData);
        setPins([...pins, photoRes.data]);
      } else {
        setPins([...pins, savedPin]);
      }

      setNewPlace(null);
      SetTitle("");
      SetDesc("");
      setNewRating(0);
      setNewPhoto(null);
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserLocation(null);
    localStorage.removeItem("user");
    localStorage.removeItem("userLat");
    localStorage.removeItem("userLong");
};

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this pin?")) return;
    try {
      await axios.delete(`${API_URL}/api/pins/${id}`);
      setPins(pins.filter(p => p._id !== id));
      setSelectedPin(null);
    } catch (err) {
      console.log(err);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${API_URL}/api/pins/${editingPin}`, {
        title: editTitle,
        desc: editDesc,
        rating: editRating,
      });

      let updatedPin = res.data;

      if (editPhoto) {
        const formData = new FormData();
        formData.append("photos", editPhoto);
        const photoRes = await axios.post(`${API_URL}/api/pins/${editingPin}/photos`, formData);
        updatedPin = photoRes.data;
      }

      setPins(pins.map(p => p._id === editingPin ? updatedPin : p));
      setSelectedPin(updatedPin);
      setEditingPin(null);
      setEditPhoto(null);
    } catch (err) {
      console.log(err);
    }
  };

  const getAverageRating = (pin, comments) => {
    const pinComments = comments.filter(c => c.pinId === pin._id);
    const allRatings = [pin.rating, ...pinComments.map(c => c.rating)];
    return (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1);
  };

  return (
    <div className="App">
      <Map
  ref={mapRef}
  {...viewState}
  onMove={evt => setViewState(evt.viewState)}
  style={{ width: '100vw', height: '100vh' }}
  mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
  mapStyle="mapbox://styles/mapbox/streets-v11"
  projection="mercator"
  maxPitch={0}
  dragRotate={false}
  onClick={(e) => {
    setSelectedPin(null);

    if (isMobile) {
      handleAddClick(e);
    } else {
      setNewPlace(null);
    }
  }}
  onContextMenu={isMobile ? undefined : handleAddClick}
>
        onContextMenu={handleAddClick}
      >
        {pins.map((p) => (
          <React.Fragment key={p._id}>
            <Marker longitude={p.long} latitude={p.lat} anchor="bottom">
              <RoomIcon
                style={{ fontSize: viewState.zoom * 3, color: 'slateblue', cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPin(p);
                  setEditingPin(null);
                  mapRef.current?.flyTo({
                    center: [p.long, p.lat],
                    duration: 1000,
                  });
                }}
              />
            </Marker>
          </React.Fragment>
        ))}

        {myLocation && (
          <Marker longitude={myLocation.long} latitude={myLocation.lat} anchor="center">
            <div className="my-location-dot" />
          </Marker>
        )}

        {newPlace && (
          <Popup
            longitude={newPlace.long}
            latitude={newPlace.lat}
            anchor="left"
            closeButton={true}
            closeOnClick={false}
            onClose={() => setNewPlace(null)}
          >
            <form className="new-pin-form" onSubmit={handleSubmit}>
              <h3>Add a Pin</h3>
              <input className="form-input" placeholder="Title" onChange={(e) => SetTitle(e.target.value)} />
              <textarea className="form-textarea" placeholder="Say something about this place..." rows={3} onChange={(e) => SetDesc(e.target.value)} />
              <input
                className="form-input"
                type="file"
                accept="image/*"
                onChange={(e) => setNewPhoto(e.target.files[0])}
              />
              <div className="star-rating">
                {Array(5).fill(0).map((_, i) => (
                  <StarIcon
                    key={i}
                    style={{
                      color: i < (hoverRating || newRating) ? 'gold' : 'lightgray',
                      cursor: 'pointer',
                      fontSize: 28
                    }}
                    onClick={() => setNewRating(i + 1)}
                    onMouseEnter={() => setHoverRating(i + 1)}
                    onMouseLeave={() => setHoverRating(0)}
                  />
                ))}
              </div>
              <button className="form-btn" type="submit">Add Pin</button>
            </form>
          </Popup>
        )}

         <div className="nav-buttons">
        {currentUser ? (
          <Settings
            currentUser={currentUser}
            onLogout={handleLogout}
            setUserLocation={setUserLocation}
          />
        ) : (
          <>
            {!showWelcome && (
              <>
                <button className="btn login" onClick={() => setShowLogin(true)}>Log In</button>
                <button className="btn register" onClick={() => setShowRegister(true)}>Register</button>
              </>
            )}
          </>
        )}
        {showLogin && <Login onClose={() => setShowLogin(false)} setCurrentUser={setCurrentUser} setUserLocation={setUserLocation} />}
        {showRegister && <Register onClose={() => setShowRegister(false)} />}
        {showLoginAlert && (
          <div className="login-alert">
            Please log in to add a pin.
          </div>
        )}
      </div>

      {myLocation && (
        <button className="center-me-btn" onClick={handleCenterMe}>
          <PinDropIcon style={{ fontSize: 22, color: '#4285f4' }} />
        </button>
      )}
      
      </Map>

      <Sidebar
        pin={selectedPin}
        currentUser={currentUser}
        allComments={allComments}
        setAllComments={setAllComments}
        onClose={() => { setSelectedPin(null); setEditingPin(null); }}
        onDelete={handleDelete}
        getAverageRating={getAverageRating}
        handleEdit={handleEdit}
        editingPin={editingPin}
        setEditingPin={setEditingPin}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        editDesc={editDesc}
        setEditDesc={setEditDesc}
        editRating={editRating}
        setEditRating={setEditRating}
        editHoverRating={editHoverRating}
        setEditHoverRating={setEditHoverRating}
        setEditPhoto={setEditPhoto}
        setPins={setPins}
        pins={pins}
        setSelectedPin={setSelectedPin}
      />

      {showWelcome && (
    <Welcome
        setCurrentUser={setCurrentUser}
        setUserLocation={setUserLocation}
        onGuest={() => setShowWelcome(false)}
    />
    )}

    </div>
  );
}

export default App;
