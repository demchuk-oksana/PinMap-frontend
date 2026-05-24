import { useState, useRef } from "react";
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import axios from "axios";
import './settings.css';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

export default function Settings({ currentUser, onLogout, setUserLocation }) {
    const [open, setOpen] = useState(false);
    const [cityLoading, setCityLoading] = useState(false);
    const [cityError, setCityError] = useState(null);
    const [citySuccess, setCitySuccess] = useState(false);
    const cityRef = useRef();

    const geocodeCity = async (cityName) => {
        const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cityName)}.json?types=place&limit=1&access_token=${MAPBOX_TOKEN}`
        );
        const data = await res.json();
        if (data.features?.length > 0) {
            const [lng, lat] = data.features[0].center;
            return { lat, long: lng, city: data.features[0].place_name };
        }
        return null;
    };

    const handleCityUpdate = async (e) => {
        e.preventDefault();
        if (!cityRef.current.value) {
            setCityError("Please enter a city name.");
            return;
        }
        setCityLoading(true);
        setCityError(null);
        setCitySuccess(false);

        const coords = await geocodeCity(cityRef.current.value);
        setCityLoading(false);

        if (!coords) {
            setCityError("City not found. Please try a different name.");
            return;
        }

        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/api/users/city`, {
                username: currentUser,
                city: coords.city,
                lat: coords.lat,
                long: coords.long,
            });
            setUserLocation({ lat: coords.lat, long: coords.long });
            setCitySuccess(true);
            cityRef.current.value = "";
        } catch (err) {
            setCityError("Failed to update city. Please try again.");
        }
    };

    return (
        <>
            <button className="settings-btn" onClick={() => setOpen(true)}>
                <SettingsIcon />
            </button>

            {open && (
                <div className="settings-overlay" onClick={() => setOpen(false)}>
                    <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
                        <div className="settings-header">
                            <h3>Settings</h3>
                            <button className="settings-close" onClick={() => setOpen(false)}>
                                <CloseIcon />
                            </button>
                        </div>

                        <div className="settings-section">
                            <p className="settings-label">Logged in as <b>{currentUser}</b></p>
                            <button className="logout-btn" onClick={onLogout}>Log Out</button>
                        </div>

                        <div className="settings-divider" />

                        <div className="settings-section">
                            <p className="settings-label">Update your city</p>
                            <form onSubmit={handleCityUpdate}>
                                <input
                                    className="settings-input"
                                    type="text"
                                    placeholder="Enter city name..."
                                    ref={cityRef}
                                />
                                <button className="settings-save-btn" type="submit" disabled={cityLoading}>
                                    {cityLoading ? "Searching..." : "Update City"}
                                </button>
                            </form>
                            {cityError && <span className="settings-error">{cityError}</span>}
                            {citySuccess && <span className="settings-success">City updated!</span>}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}