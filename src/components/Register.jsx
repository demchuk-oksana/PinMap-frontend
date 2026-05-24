import { useState, useRef } from "react";
import axios from "axios";
import "./register.css";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

export default function Register({ onClose }) {
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [cityLoading, setCityLoading] = useState(false);
    const nameRef = useRef();
    const emailRef = useRef();
    const passwordRef = useRef();
    const cityRef = useRef();

    const geocodeCity = async (cityName) => {
        const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cityName)}.json?types=place&limit=1&access_token=${MAPBOX_TOKEN}`
        );
        const data = await res.json();
        if (data.features?.length > 0) {
            const [lng, lat] = data.features[0].center;
            return { lat, long: lng };
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!nameRef.current.value || !emailRef.current.value || !passwordRef.current.value) {
            setError("Please fill in all fields.");
            return;
        }

        let coords = null;
        if (cityRef.current.value) {
            setCityLoading(true);
            coords = await geocodeCity(cityRef.current.value);
            setCityLoading(false);
            if (!coords) {
                setError("City not found. Please try a different name.");
                return;
            }
        }

        const newUser = {
            username: nameRef.current.value,
            email: emailRef.current.value,
            password: passwordRef.current.value,
            city: cityRef.current.value || null,
            lat: coords?.lat || null,
            long: coords?.long || null,
        };

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/users/register`, newUser);
            setSuccess(true);
            setError(null);
        } catch (err) {
            const msg = err.response?.data?.message || "";
            if (msg.includes("username")) {
                setError("This username is already taken.");
            } else if (msg.includes("email")) {
                setError("This email is already registered.");
            } else {
                setError("Registration failed. Please try again.");
            }
            setSuccess(false);
        }
    };

    return (
        <div className="register-overlay">
            <div className="register-container">
                <button className="close-btn" onClick={onClose}>✕</button>
                <h2>Create Account</h2>
                <form onSubmit={handleSubmit}>
                    <input className="register-input" type="text" placeholder="Username" ref={nameRef} />
                    <input className="register-input" type="email" placeholder="Email" ref={emailRef} />
                    <input className="register-input" type="password" placeholder="Password" ref={passwordRef} />
                    <input className="register-input" type="text" placeholder="Your city (optional)" ref={cityRef} />
                    <button className="register-btn" type="submit" disabled={cityLoading}>
                        {cityLoading ? "Looking up city..." : "Register"}
                    </button>
                </form>
                {success && <span className="success-message">Registration successful! You can now log in.</span>}
                {error && <span className="error-message">{error}</span>}
            </div>
        </div>
    );
}