import React, { useState } from "react";
import Web3 from "web3";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";
import axios from "axios"; // To handle Pinata API requests

function PatientPage() {
    const [name, setName] = useState("");
    const [file, setFile] = useState(null);
    const [providerAddress, setProviderAddress] = useState("");

    // Pinata API details
    const PINATA_API_KEY = "02af12425b6a91169d1a";
    const PINATA_API_SECRET = "70ca2950ed924143185873e56b13fd1c0f08b4efbbdb17246fb03cb6ba2825ab";

    const connectToContract = async () => {
        if (window.ethereum) {
            const web3 = new Web3(window.ethereum);
            await window.ethereum.request({ method: "eth_requestAccounts" });
            const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
            return { web3, contract };
        } else {
            alert("Please install MetaMask to use this application.");
        }
    };

    const registerPatient = async () => {
        try {
            const { contract } = await connectToContract();
            const accounts = await window.ethereum.request({ method: "eth_accounts" });
            const account = accounts[0];
            await contract.methods.registerPatient(name).send({ from: account });
            alert(`Patient "${name}" registered successfully.`);
        } catch (error) {
            console.error("Error registering patient:", error);
            alert("Error registering patient. Check the console for details.");
        }
    };

    const uploadToPinata = async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const metadata = JSON.stringify({
            name: file.name,
            keyvalues: {
                uploadedBy: "MedChainPatient",
                timestamp: new Date().toISOString(),
            },
        });

        formData.append("pinataMetadata", metadata);

        const options = JSON.stringify({
            cidVersion: 1,
        });

        formData.append("pinataOptions", options);

        try {
            const response = await axios.post(
                "https://api.pinata.cloud/pinning/pinFileToIPFS",
                formData,
                {
                    maxContentLength: "Infinity",
                    headers: {
                        "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
                        pinata_api_key: PINATA_API_KEY,
                        pinata_secret_api_key: PINATA_API_SECRET,
                    },
                }
            );

            return response.data.IpfsHash; // Return the IPFS hash of the uploaded file
        } catch (error) {
            console.error("Error uploading file to Pinata:", error);
            alert("Error uploading file to Pinata. Check the console for details.");
            throw new Error("Failed to upload file to Pinata.");
        }
    };

    const addRecord = async () => {
        if (!file) {
            alert("Please select a file to upload.");
            return;
        }
        try {
            const ipfsHash = await uploadToPinata(file);
            const { contract } = await connectToContract();
            const accounts = await window.ethereum.request({ method: "eth_accounts" });
            const account = accounts[0];
            await contract.methods.addRecord(ipfsHash).send({ from: account });
            alert(`Record added successfully with IPFS hash: ${ipfsHash}`);
        } catch (error) {
            console.error("Error adding record:", error);
            alert("Error adding record. Check the console for details.");
        }
    };

    const grantAccess = async () => {
        try {
            const { contract } = await connectToContract();
            const accounts = await window.ethereum.request({ method: "eth_accounts" });
            const account = accounts[0];
            await contract.methods.grantAccess(providerAddress).send({ from: account });
            alert(`Access granted to provider: ${providerAddress}`);
        } catch (error) {
            console.error("Error granting access:", error);
            alert("Error granting access. Check the console for details.");
        }
    };

    const revokeAccess = async () => {
        try {
            const { contract } = await connectToContract();
            const accounts = await window.ethereum.request({ method: "eth_accounts" });
            const account = accounts[0];
            await contract.methods.revokeAccess(providerAddress).send({ from: account });
            alert(`Access revoked for provider: ${providerAddress}`);
        } catch (error) {
            console.error("Error revoking access:", error);
            alert("Error revoking access. Check the console for details.");
        }
    };

    const listProvidersWithAccess = async () => {
        try {
            const { contract } = await connectToContract();
            const accounts = await window.ethereum.request({ method: "eth_accounts" });
            const account = accounts[0];
            const providers = await contract.methods.listProvidersWithAccess().call({ from: account });
            alert(`Providers with access: ${providers.join(", ")}`);
        } catch (error) {
            console.error("Error fetching providers:", error);
            alert("Error fetching providers. Check the console for details.");
        }
    };

    return (
        <div>
            <h2>Patient Portal</h2>
            <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <button onClick={registerPatient}>Register as Patient</button>
            <br />
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            <button onClick={addRecord}>Add Record</button>
            <br />
            <input
                type="text"
                placeholder="Enter Provider Address"
                value={providerAddress}
                onChange={(e) => setProviderAddress(e.target.value)}
            />
            <button onClick={grantAccess}>Grant Access</button>
            <button onClick={revokeAccess}>Revoke Access</button>
            <button onClick={listProvidersWithAccess}>View Providers with Access</button>
        </div>
    );
}

export default PatientPage;
