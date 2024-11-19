import React from "react";
import { BrowserRouter as Router, Route, Routes, NavLink } from "react-router-dom";
import PatientPage from "./pages/PatientPage";
import ProviderPage from "./pages/ProviderPage";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./config"; // Importing the contract details

import Web3 from "web3";

function App() {
    // Initialize Web3 and the contract globally
    const initializeContract = () => {
        if (window.ethereum) {
            const web3 = new Web3(window.ethereum);
            const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
            console.log("Contract initialized:", contract);
        } else {
            alert("Please install MetaMask to use this application.");
        }
    };

    React.useEffect(() => {
        initializeContract();
    }, []);

    return (
        <Router>
            <div style={{ textAlign: "center", marginTop: "50px", fontFamily: "Roboto, Arial, sans-serif" }}>
                <h1 style={{ color: "#007bff" }}>MedChain DApp</h1>
                {/* Navigation Bar */}
                <nav
                    style={{
                        backgroundColor: "#f8f9fa",
                        padding: "15px",
                        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
                    }}
                >
                    <NavLink
                        to="/patient"
                        style={{
                            margin: "10px",
                            textDecoration: "none",
                            color: "#007bff",
                            fontSize: "18px",
                        }}
                        activeStyle={{
                            color: "#0056b3",
                            fontWeight: "bold",
                            textDecoration: "underline",
                        }}
                    >
                        Patient Portal
                    </NavLink>
                    <NavLink
                        to="/provider"
                        style={{
                            margin: "10px",
                            textDecoration: "none",
                            color: "green",
                            fontSize: "18px",
                        }}
                        activeStyle={{
                            color: "#005500",
                            fontWeight: "bold",
                            textDecoration: "underline",
                        }}
                    >
                        Healthcare Provider Portal
                    </NavLink>
                </nav>
                {/* Routes for Patient and Provider Pages */}
                <Routes>
                    <Route path="/patient" element={<PatientPage />} />
                    <Route path="/provider" element={<ProviderPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
