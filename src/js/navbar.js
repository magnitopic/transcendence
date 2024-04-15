/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   navbar.js                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adpachec <adpachec@student.42madrid.com>   +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2024/04/10 17:23:01 by adpachec          #+#    #+#             */
/*   Updated: 2024/04/15 14:04:12 by adpachec         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { isLoggedIn } from './auth.js';

function updateNavbar()
{
	const navBarDiv = document.getElementById('login-navbar');

	const mockUser =
	{
		username: "user1",
		avatar: "./images/avatar/author_1.png"
	};
	
	if (isLoggedIn())
	{
		navBarDiv.innerHTML = `
			<div class="user-info" id="user-info">
				<a class="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
					<img src="${mockUser.avatar}" id="user-avatar" class="rounded-circle" alt="User Avatar">
					<span id="username">${mockUser.username}</span>
				</a>
				<ul class="dropdown-menu" aria-labelledby="navbarDropdown">
					<li><a class="dropdown-item" href="#profile">Profile</a></li>
					<li><a class="dropdown-item" href="#friends">Friends</a></li>
					<li><hr class="dropdown-divider"></li>
					<li><a class="dropdown-item" href="#" id="link-logout">Log out</a></li>
				</ul>
			</div>
		`;
	}
	else
	{
		navBarDiv.innerHTML = `
			<a class="btn btn-outline-success me-2" href="#login">Log in</a>
			<a class="btn btn-outline-danger" href="#register">Register</a>
		`;
	}
}

export function updateTournamentNavbar() {
    const navBarDiv = document.getElementById('login-navbar');
    navBarDiv.classList.add('tournament-navbar');
}

export function restoreOriginalNavbar() {
    const navBarDiv = document.getElementById('login-navbar');
    navBarDiv.classList.remove('tournament-navbar');
}

export default updateNavbar;