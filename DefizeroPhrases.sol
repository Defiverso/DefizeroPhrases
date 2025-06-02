// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Defizero Phrases Registry
/// @author You
/// @notice Allows users to store, update, delete, and retrieve personal phrases
contract DefizeroPhrases {
    mapping(address => string) private _phrases;

    event PhraseUpdated(address indexed user, string phrase);

    /// @notice Store or update your personal phrase
    /// @param phrase The phrase to be saved
    function setPhrase(string calldata phrase) external {
        _phrases[msg.sender] = phrase;
        emit PhraseUpdated(msg.sender, phrase);
    }

    /// @notice Delete your personal phrase
    function deletePhrase() external {
        delete _phrases[msg.sender];
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
}
