
import { isLoggedIn } from './auth.js';
import router from './main.js';

async function loadFriendProfile(id) {
    if (!isLoggedIn()) {
        localStorage.setItem('loginRedirect', 'true');
        router.route('/login');
        return ;
    }

	const apiUrl = `http://localhost:8000/api/users?user_id=${id}`;
    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
			headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const user = await response.json();
        updateProfileUI(user);
    } catch (error) {
        console.error('Error loading profile:', error);
		router.route("/error");
    }
}

function updateProfileUI(user) {
    const profileHTML = `
        <div class="profile-container">
            <div class="profile-header">
                <img src="http://localhost:8000${user.profilePicture}" class="profile-avatar" alt="Avatar del usuario">
                <h2 class="profile-username">${user.username}</h2>
            </div>
            <div class="profile-stats">
                <button class="stats-toggler">Stats</button>
                <div class="stats-content">
                    <p>Matches Played: ${user.matchesTotal}</p>
                    <p>Matches Won: ${user.matchesWon}</p>
                    <p>Matches Lost: ${user.matchesLost}</p>
                    <p>Points Scored: ${user.totalPoints}</p>
                    <p>Tournaments Played: ${user.tournamentsPlayed || 0}</p>
                    <p>Tournaments Won: ${user.tournamentsWon || 0}</p>
                </div>
            </div>
            <div class="profile-history">
                <button class="history-toggler">Match history</button>
                <div class="history-content" style="display: none;">
                    ${renderMatchHistory(user.matches)}
                </div>
            </div>
            <button class="friends-button" id="friends-button">Friends</button>
            <div class="friends-section" id="friends-section" style="display: none;">
                <div id="friends-list" class="friends-list">
                    ${renderFriendsList(user.friends)}
                </div>
                <button class="toggle-button" id="toggle-friend-form">Add a New Friend</button>
                <div id="add-friend-form" class="add-friend-form" style="display: none;">
                    <input type="text" id="new-friend-name" placeholder="Enter friend's username" />
                    <button id="sendRequestBtn">Send Friend Request</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('main-content').innerHTML = profileHTML;
    addEventListeners();
}

function renderMatchHistory(matches) {
    return `
        <table class="table table-dark table-striped">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Opponent</th>
                    <th>Result</th>
                    <th>Score</th>
                </tr>
            </thead>
            <tbody>
                ${matches.map(match => `
                    <tr>
                        <td>${match.date}</td>
                        <td>${match.opponent}</td>
                        <td class="${match.result ? 'win' : 'loss'}">${match.result ? 'Win' : 'Loss'}</td>
                        <td>${match.score}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function renderFriendsList(friends) {
    return friends.map(friend => `
        <div class="friend-entry">
            <a data-id="${friend.id}">
                <img src="http://localhost:8000${friend.profilePicture}" alt="${friend.name}'s Avatar" class="friend-avatar">
                <span class="friend-username">${friend.name}</span>
            </a>
        </div>
    `).join('');
}

document.addEventListener("DOMContentLoaded", function() {
    const links = document.querySelectorAll('.friend-entry a');
    links.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const id = this.getAttribute('data-id');
            router.route(`/friend-profile/${id}`, id);
        });
    });
});

function addEventListeners() {
	document.querySelector('.stats-toggler').addEventListener('click', toggleStats);
	document.querySelector('.history-toggler').addEventListener('click', toggleHistory);
	document.getElementById('friends-button').addEventListener('click', toggleFriendSection);
	document.getElementById('toggle-friend-form').addEventListener('click', toggleFriendForm);
	document.getElementById('sendRequestBtn').addEventListener('click', sendFriendRequest);
}

function toggleStats() {
	const statsContent = document.querySelector('.stats-content');
	statsContent.style.display = statsContent.style.display === 'none' ? 'block' : 'none';
}

function toggleHistory() {
	const historyContent = document.querySelector('.history-content');
	historyContent.style.display = historyContent.style.display === 'none' ? 'block' : 'none';
}

function toggleFriendSection() {
	const section = document.getElementById('friends-section');
	section.style.display = section.style.display === 'none' ? 'block' : 'none';
}

function toggleFriendForm() {
	const form = document.getElementById('add-friend-form');
	form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function sendFriendRequest()
{
	const friendUsernameInput = document.getElementById('new-friend-name');
	const friendUsername = friendUsernameInput.value.trim();
	if (friendUsername)
	{
		console.log(`Sending friend request to ${friendUsername}`);
		// updateFriendsList(friendUsername);
		friendUsernameInput.value = "";
		showNotification(`Friend request sent to ${friendUsername}`);
	}
	else
	{
		alert("Please enter a friend's username.");
	}
}

function showNotification(message) {
	let notification = document.getElementById('notification');
	if (!notification)
	{
		notification = document.createElement('div');
		notification.id = 'notification';
		notification.className = 'notification';
		document.body.appendChild(notification);
	}
	notification.textContent = message;
	
	notification.classList.add('show');
	setTimeout(() =>
	{
		notification.classList.remove('show');
	}, 4000);
}

export default loadFriendProfile;