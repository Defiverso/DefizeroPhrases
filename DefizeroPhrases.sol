// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Defizero Phrases Registry
/// @author Thiego Carvalho - https://github.com/thiegocarvalho
/// @notice Allows users to store, update, delete, and retrieve personal phrases
contract DefizeroPhrases {
    mapping(address => string) private _phrases;
    address[] private _users;
    mapping(address => bool) private _hasInteracted;

    event PhraseUpdated(address indexed user, string phrase);

    /// @notice Store or update your personal phrase
    /// @param phrase The phrase to be saved
    function setPhrase(string calldata phrase) external {
        if (!_hasInteracted[msg.sender]) {
            _hasInteracted[msg.sender] = true;
            _users.push(msg.sender);
        }
        _phrases[msg.sender] = phrase;
        emit PhraseUpdated(msg.sender, phrase);
    }

    /// @notice Delete your personal phrase
    function deletePhrase() external {
        _phrases[msg.sender] = "";
        emit PhraseUpdated(msg.sender, "");
    }

    /// @notice Get your own phrase
    /// @return The phrase associated with the caller
    function getMyPhrase() external view returns (string memory) {
        return _phrases[msg.sender];
    }

    /// @notice Get the phrase of another user
    /// @param user The address of the user
    /// @return The phrase associated with the given address
    function getPhraseOf(address user) external view returns (string memory) {
        return _phrases[user];
    }

    /// @notice Get all users and their phrases
    /// @return users An array of all user addresses
    /// @return phrases An array of phrases corresponding to each address
    function getAllPhrases() external view returns (address[] memory users, string[] memory phrases) {
        uint256 length = _users.length;
        users = new address[](length);
        phrases = new string[](length);

        for (uint256 i = 0; i < length; i++) {
            address user = _users[i];
            users[i] = user;
            phrases[i] = _phrases[user];
        }
    }
}
