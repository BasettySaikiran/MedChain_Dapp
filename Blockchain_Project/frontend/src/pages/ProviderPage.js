import React, { useState } from "react";
import Web3 from "web3";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";

function ProviderPage() {
    const [patientAddress, setPatientAddress] = useState("");
    const [records, setRecords] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [error, setError] = useState("");

    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

    const viewRecords = async () => {
        try {
            if (!patientAddress) {
                alert("Please enter a valid patient address.");
                return;
            }

            const accounts = await web3.eth.getAccounts();
            const records = await contract.methods.viewRecords(patientAddress).call({ from: accounts[0] });
            setRecords(records);
            alert("Patient records fetched successfully.");
        } catch (error) {
            console.error(error);
            alert("Error fetching patient records. Ensure you have been granted access.");
        }
    };

    const viewAuditLogs = async () => {
        try {
            if (!patientAddress) {
                alert("Please enter a valid patient address.");
                return;
            }

            const accounts = await web3.eth.getAccounts();
            const logs = await contract.methods.viewAuditLogs(patientAddress).call({ from: accounts[0] });

            const formattedLogs = logs.map((log) => ({
                action: log.action,
                accessedBy: log.accessedBy,
                timestamp: new Date(Number(log.timestamp) * 1000).toLocaleString(), // Convert BigInt timestamp
            }));

            setAuditLogs(formattedLogs);
            alert("Audit logs fetched successfully.");
        } catch (error) {
            console.error(error);
            alert("Error fetching audit logs. Ensure you have the necessary permissions.");
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>Healthcare Provider Portal</h2>
            <input
                type="text"
                placeholder="Enter Patient Address"
                value={patientAddress}
                onChange={(e) => setPatientAddress(e.target.value)}
                style={{ width: "300px", padding: "10px", margin: "10px" }}
            />
            <div>
                <button onClick={viewRecords} style={{ margin: "10px" }}>
                    View Records
                </button>
                <button onClick={viewAuditLogs} style={{ margin: "10px" }}>
                    View Audit Logs
                </button>
            </div>
            <div style={{ marginTop: "20px" }}>
                <h3>Patient Records:</h3>
                {records.length === 0 ? (
                    <p>No records available or access not granted.</p>
                ) : (
                    <ul style={{ listStyleType: "none", padding: 0 }}>
                        {records.map((record, index) => (
                            <li key={index} style={{ marginBottom: "10px" }}>
                                <a
                                    href={`https://gateway.pinata.cloud/ipfs/${record}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: "blue", textDecoration: "underline" }}
                                >
                                    View Record {index + 1}
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div style={{ marginTop: "20px" }}>
                <h3>Audit Logs:</h3>
                {auditLogs.length === 0 ? (
                    <p>No audit logs available or access not granted.</p>
                ) : (
                    <table border="1" style={{ margin: "0 auto", textAlign: "left", width: "80%" }}>
                        <thead>
                            <tr>
                                <th>Action</th>
                                <th>Accessed By</th>
                                <th>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {auditLogs.map((log, index) => (
                                <tr key={index}>
                                    <td>{log.action}</td>
                                    <td>{log.accessedBy}</td>
                                    <td>{log.timestamp}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default ProviderPage;
