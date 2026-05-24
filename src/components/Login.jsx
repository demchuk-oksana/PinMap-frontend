import { useRef, useState } from "react";
import axios from "axios";
import "./login.css";

export default function Login({ onClose, setCurrentUser, setUserLocation }) {
    const [error, setError] = useState(null);
    const loginRef = useRef();
    const passwordRef = useRef();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!loginRef.current.value || !passwordRef.current.value) {
            setError("Please fill in all fields.");
            return;
        }

        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/users/login`, {
                login: loginRef.current.value,
                password: passwordRef.current.value
            });
            setCurrentUser(res.data.username);
                localStorage.setItem("user", res.data.username);

                if (res.data.lat && res.data.long) {
                    setUserLocation({ lat: res.data.lat, long: res.data.long });
                    localStorage.setItem("userLat", res.data.lat);
                    localStorage.setItem("userLong", res.data.long);
                }

            if (res.data.lat && res.data.long) {
                setUserLocation({ lat: res.data.lat, long: res.data.long });
            }

            setError(null);
            onClose();
        } catch (err) {
            const msg = err.response?.data?.message || "";
            if (msg.includes("not found")) {
                setError("User not found.");
            } else if (msg.includes("credentials")) {
                setError("Incorrect password.");
            } else {
                setError("Login failed. Please try again.");
            }
        }
    };

    return (
        <div className="login-overlay">
            <div className="login-container">
                <button className="close-btn" onClick={onClose}>✕</button>
                <h2>Welcome Back</h2>
                <form onSubmit={handleSubmit}>
                    <input className="login-input" type="text" placeholder="Username or Email" ref={loginRef} />
                    <input className="login-input" type="password" placeholder="Password" ref={passwordRef} />
                    <button className="login-btn" type="submit">Log In</button>
                </form>
                {error && <span className="error-message">{error}</span>}
            </div>
        </div>
    );
}