/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   tournaments.js                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adpachec <adpachec@student.42madrid.com>   +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2024/04/08 11:49:29 by adpachec          #+#    #+#             */
/*   Updated: 2024/04/18 12:06:03 by adpachec         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import loadTournamentDetails from "./tournamentDetails.js";
import { getUsernameFromToken } from "./auth.js";

const mockTournaments = [
    {
        id: 1,
        name: 'Spring Pong Championship',
        participants: ['Player1', 'Player2', 'Player3'],
        status: 'Upcoming'
    },
    {
        id: 2,
        name: 'Summer Pong Fest',
        participants: ['Player4', 'Player5', 'Player6', 'Player4', 'Player5', 'Player6', 'Player4', 'Player5', 'Player6', 'Player4', 'Player5', 'Player6', 'Player4', 'Player5', 'Player6', 'Player4', 'Player5', 'Player6'],
        status: 'In Progress'
    },
	{
        id: 3,
        name: 'Spring Pong Championship',
        participants: ['Player1', 'Player2', 'Player3'],
        status: 'Upcoming'
    },
    {
        id: 4,
        name: 'Summer Pong Fest',
        participants: ['Player4', 'Player5', 'Player6'],
        status: 'In Progress'
    },
	{
        id: 5,
        name: 'Spring Pong Championship',
        participants: ['Player1', 'Player2', 'Player3'],
        status: 'Upcoming'
    },
    {
        id: 6,
        name: 'Summer Pong Fest',
        participants: ['Player4', 'Player5', 'Player6'],
        status: 'Ended'
    }
];

const sampleTournament = {
    name: "Summer Pong Fest",
    upcomingMatches: [
        { match: "Match 1", players: "Player A vs Player B", date: "2024-08-15" },
        { match: "Match 2", players: "Player C vs Player D", date: "2024-08-16" }
    ],
    previousMatches: [
        { match: "Match 1", result: "Player A 21 - 18 Player B" },
        { match: "Match 2", result: "Player D 21 - 15 Player C" }
    ],
    standings: [
        { team: "Player A", played: 2, won: 1, lost: 1, pointsFor: 42, pointsAgainst: 39 },
        { team: "Player B", played: 2, won: 1, lost: 1, pointsFor: 39, pointsAgainst: 42 },
        { team: "Player A", played: 2, won: 1, lost: 1, pointsFor: 42, pointsAgainst: 39 },
        { team: "Player B", played: 2, won: 1, lost: 1, pointsFor: 39, pointsAgainst: 42 }
    ]
};

function loadTournaments() {
    updateTournamentHTML();
    attachEventListeners();
}

function updateTournamentHTML() {
    const tournamentsHTML = `
        <div class="tournament-container">
            <h1 class="tournament-title">Tournaments</h1>
            <div class="btn-group" role="group" aria-label="Tournament Actions">
                <button class="button" id="createTournamentBtn">Create Tournament</button>
            </div>
            <div id="tournament-list" class="tournament-list">${viewTournaments()}</div>
        </div>
    `;
    document.getElementById('main-content').innerHTML = tournamentsHTML;
}

function attachEventListeners() {
    document.getElementById('createTournamentBtn').addEventListener('click', showCreateTournamentModal);

    const tournamentEntries = document.querySelectorAll('.tournament-entry');
    tournamentEntries.forEach(entry => {
        entry.querySelector('.tournament-name').addEventListener('click', function() {
            const details = entry.querySelector('.tournament-details');
            details.style.display = details.style.display === 'none' ? 'block' : 'none';
        });
    });
    
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('view-tournament-btn')) {
            loadTournamentDetails(sampleTournament);
        } else if (e.target.classList.contains('join-tournament-btn')) {
            const tournamentName = e.target.getAttribute('data-name');
            joinTournament(tournamentName);
        }
    });
}

function viewTournaments() {
    return mockTournaments.map(tournament => `
        <div class="tournament-entry">
            <h3 class="tournament-name">${tournament.name}</h3>
            <div class="tournament-details" style="display: none;">
                <p>Status: ${tournament.status}</p>
                <div class="participants-container">
                    <h4 class="participants-title">Participants</h4>
                    <div class="participants-list">
                        ${tournament.participants.map(participant => `
                            <span class="participant-name">${participant}</span>
                        `).join('')}
                    </div>
                </div>
                <div>
                    <button class="button view-tournament-btn">View Tournament</button>
                    ${tournament.status !== 'In Progress' ? `<button class="button join-tournament-btn" id="join-tournament-btn" data-name="${tournament.name}">Join Tournament</button>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function showCreateTournamentModal() {
    const modal = document.getElementById('createTournamentModal');
    if (!modal) {
        createTournament();
    }
    document.getElementById('createTournamentModal').style.display = 'block';
}

function createTournament() {
    const formHTML = `
    <div id="createTournamentModal" class="modal">
        <div class="modal-content">
            <span class="close-button">×</span>
            <form id="createTournamentForm" class="tournament-form">
                <div class="form-group">
                    <label for="tournamentName">Tournament Name:</label>
                    <input type="text" id="tournamentName" name="tournamentName" required>
                </div>
                <div class="form-group">
                    <label for="numPlayers">Number of Players:</label>
                    <input type="number" id="numPlayers" name="numPlayers" required>
                </div>
                <button type="submit" class="button" id="create-tournament">Create Tournament</button>
            </form>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', formHTML);
    addModalEventListeners();
}
 
function addModalEventListeners() {
    document.querySelector('.close-button').addEventListener('click', function() {
        document.getElementById('createTournamentModal').style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target == document.getElementById('createTournamentModal')) {
            document.getElementById('createTournamentModal').style.display = 'none';
        }
    });

    document.getElementById('createTournamentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const tournamentName = document.getElementById('tournamentName').value;
        const numPlayers = document.getElementById('numPlayers').value;
        console.log(`Creating tournament: ${tournamentName} with ${numPlayers} players`);
        document.getElementById('createTournamentModal').style.display = 'none';
    });
}

function joinTournament(tournament) {
    const username = getUsernameFromToken();
    if (username) {
        console.log(`${username} logged in. Joining tournament with name: ${tournament}`);
        alert(`Joined tournament: ${tournament} successfully!`);
    } else {
        console.log('User not logged in. Please log in to join a tournament.');
        alert('Please log in to join a tournament.');
    }
}

export { loadTournaments, createTournament, joinTournament, viewTournaments};
