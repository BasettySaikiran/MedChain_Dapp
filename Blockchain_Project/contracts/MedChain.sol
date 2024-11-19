// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MedChain {
    struct Patient {
        address patientAddress;
        string name;
        string[] records; // IPFS hashes of medical records
    }

    struct AuditLog {
        address accessedBy;
        string action;
        uint256 timestamp;
    }

    mapping(address => Patient) private patients;
    mapping(address => mapping(address => bool)) private accessControl;
    mapping(address => AuditLog[]) private auditLogs;
    mapping(address => address[]) private providersWithAccess;

    event RecordAdded(address indexed patient, string recordHash);
    event AccessGranted(address indexed patient, address indexed provider);
    event AccessRevoked(address indexed patient, address indexed provider);

    modifier onlyPatient() {
        require(msg.sender == patients[msg.sender].patientAddress, "Not authorized");
        _;
    }

    function registerPatient(string memory name) public {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(patients[msg.sender].patientAddress == address(0), "Patient already registered");

        string[] memory emptyRecords = new string[](0);
        patients[msg.sender] = Patient({
            patientAddress: msg.sender,
            name: name,
            records: emptyRecords
        });
    }

    function addRecord(string memory recordHash) public onlyPatient {
        require(bytes(recordHash).length > 0, "Record hash cannot be empty");

        patients[msg.sender].records.push(recordHash);

        auditLogs[msg.sender].push(AuditLog({
            accessedBy: msg.sender,
            action: "Added Record",
            timestamp: block.timestamp
        }));

        emit RecordAdded(msg.sender, recordHash);
    }

    function grantAccess(address provider) public onlyPatient {
        require(provider != address(0), "Invalid provider address");
        require(!accessControl[msg.sender][provider], "Access already granted");

        accessControl[msg.sender][provider] = true;
        providersWithAccess[msg.sender].push(provider);

        auditLogs[msg.sender].push(AuditLog({
            accessedBy: provider,
            action: "Access Granted",
            timestamp: block.timestamp
        }));

        emit AccessGranted(msg.sender, provider);
    }

    function revokeAccess(address provider) public onlyPatient {
        require(provider != address(0), "Invalid provider address");
        require(accessControl[msg.sender][provider], "Access not granted");

        accessControl[msg.sender][provider] = false;

        // Remove provider from the list
        address[] storage providers = providersWithAccess[msg.sender];
        for (uint256 i = 0; i < providers.length; i++) {
            if (providers[i] == provider) {
                providers[i] = providers[providers.length - 1];
                providers.pop();
                break;
            }
        }

        auditLogs[msg.sender].push(AuditLog({
            accessedBy: provider,
            action: "Access Revoked",
            timestamp: block.timestamp
        }));

        emit AccessRevoked(msg.sender, provider);
    }

    function viewRecords(address patientAddress) public view returns (string[] memory) {
        require(
            accessControl[patientAddress][msg.sender] || msg.sender == patientAddress,
            "Access denied"
        );

        return patients[patientAddress].records;
    }

    function viewAuditLogs(address patientAddress) public view returns (AuditLog[] memory) {
        require(
            msg.sender == patientAddress || accessControl[patientAddress][msg.sender],
            "Not authorized to view audit logs"
        );
        return auditLogs[patientAddress];
    }

    function listProvidersWithAccess() public view onlyPatient returns (address[] memory) {
        return providersWithAccess[msg.sender];
    }
}