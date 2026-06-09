import { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import "./welcome.css";

export default function Welcome({ setCurrentUser, setUserLocation, onGuest }) {
    const [showRegister, setShowRegister] = useState(false);
    const [showLogin, setShowLogin] = useState(false);

    return (
        <div className="welcome-overlay">
            <div className="welcome-panel">
                <div className="welcome-content">
                    <h1 className="welcome-title">Pin Map</h1>
                    <p className="welcome-subtitle">
                        Discover places, share your favorites, and explore the world through the eyes of others.
                    </p>

                    <div className="welcome-actions">
                        <button className="welcome-btn primary" onClick={() => setShowLogin(true)}>
                            Log In
                        </button>
                        <button className="welcome-btn secondary" onClick={() => setShowRegister(true)}>
                            Create Account
                        </button>
                    </div>

                    <button className="welcome-guest" onClick={onGuest}>
                        Continue without an account — I'm just looking
                    </button>
                </div>
            </div>

            {showLogin && (
                <Login
                    onClose={() => { setShowLogin(false); }}
                    setCurrentUser={(user) => { setCurrentUser(user); }}
                    setUserLocation={setUserLocation}
                />
            )}
            {showRegister && (
                <Register onClose={() => setShowRegister(false)} />
            )}
        </div>
    );
}