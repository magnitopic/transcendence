# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    0002_auto_20240426_1155.py                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: alaparic <alaparic@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/05/27 12:38:26 by alaparic          #+#    #+#              #
#    Updated: 2024/07/23 17:18:10 by alaparic         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

# Generated by Django 5.0.4 on 2024-04-26 11:55

from django.db import migrations
from api.populate_data import doTournamentMatchmaking
import datetime
import random


def generate_users_data(apps, schema_editor):
    User = apps.get_model("api", "User")
    for i in range(10):
        User.objects.create_user(username=f"user{i+1}", password=f"pass123")
    # create a user with the project name
    User.objects.create_user(username="transcendence", password="pass123")


def generate_tournaments_data(apps, schema_editor):
    Tournament = apps.get_model("api", "Tournament")
    for i in range(10):
        Tournament.objects.create(name=f"tournament{i+1}",
                                  date=datetime.date.today().isoformat(),
                                  number_participants=random.randint(2, 16) if i != 0 and i != 1 else 10)


# Aux function
def create_new_user_tournaments_data(nParticipants, UserTournament, User, tournament):
    for j in range(nParticipants):
        # select a user that is not already in the tournament
        users_in_tournament = UserTournament.objects.filter(
            tournament=tournament).values_list('user', flat=True)
        users_not_in_tournament = User.objects.exclude(
            id__in=users_in_tournament)
        user = random.choice(users_not_in_tournament)
        # add user to tournament
        UserTournament.objects.create(user=user, tournament=tournament)


def generate_tournament_participants_data(apps, schema_editor):
    Tournament = apps.get_model("api", "Tournament")
    User = apps.get_model("api", "User")
    UserTournament = apps.get_model("api", "UserTournament")
    Match = apps.get_model("api", "Match")
    for i in range(10):
        tournament = Tournament.objects.get(name=f"tournament{i+1}")
        if tournament.tournamentID != 1 and tournament.tournamentID != 2:
            nParticipants = random.choices(
                list(range(0, 11)), list(range(0, 11)), k=1)[0]
            while nParticipants > tournament.number_participants:
                nParticipants = random.choices(
                    list(range(0, 11)), list(range(0, 11)), k=1)[0]
        else:
            nParticipants = tournament.number_participants

        create_new_user_tournaments_data(
            nParticipants, UserTournament, User, tournament)

        # change tournament status if tournament is full
        if UserTournament.objects.filter(tournament=tournament).count() == tournament.number_participants:
            tournament.status = "In Progress"
            tournament.save()
            players = UserTournament.objects.filter(tournament=tournament)
            for i in range(len(players)):
                for j in range(i+1, len(players)):
                    Match.objects.create(
                        user1=players[i].user,
                        user2=players[j].user,
                        date=datetime.date.today(),
                        tournament=tournament
                    )


def generate_friends_data(apps, schema_editor):
    Friend = apps.get_model("api", "Friend")
    User = apps.get_model("api", "User")
    for i in range(9):
        user1 = User.objects.get(username=f"user{i+1}")
        user2 = User.objects.get(username=f"user{i+2}")
        Friend.objects.create(user1=user1, user2=user2, status=True)
    user1 = User.objects.get(username="user1")
    user2 = User.objects.get(username="user10")
    Friend.objects.create(user1=user1, user2=user2, status=True)


def generate_matches_data(apps, schema_editor):
    Match = apps.get_model("api", "Match")
    User = apps.get_model("api", "User")
    count = 0
    while count < 50:
        user1 = User.objects.get(username=f"user{random.randint(1, 10)}")
        user2 = User.objects.get(username=f"user{random.randint(1, 10)}")
        while user1 == user2:
            user2 = User.objects.get(
                username=f"user{random.randint(1, 10)}")
        points1 = random.randint(0, 10)
        points2 = random.randint(0, 10)
        while points1 == points2:
            points2 = random.randint(0, 10)

        count += 1
        # create match object
        Match.objects.create(user1=user1,
                             user2=user2,
                             tournament=None,
                             pointsUser1=points1,
                             pointsUser2=points2,
                             winner=user1 if points1 > points2 else user2,
                             date=datetime.date.today().isoformat())
        # modify users to update their statistics with the match data
        user1.totalPoints += points1
        user1.matchesTotal += 1
        user1.matchesWon += 1 if points1 > points2 else 0
        user1.matchesLost += 1 if points1 < points2 else 0
        user1.save()

        user2.totalPoints += points2
        user2.matchesTotal += 1
        user2.matchesWon += 1 if points2 > points1 else 0
        user2.matchesLost += 1 if points2 < points1 else 0
        user2.save()


def generate_tournament_matches_data(apps, schema_editor):
    Match = apps.get_model("api", "Match")
    Tournament = apps.get_model("api", "Tournament")
    UserTournament = apps.get_model("api", "UserTournament")
    tournament_matches = Match.objects.filter(tournament__isnull=False)
    for match in tournament_matches:
        # 70% chance of match being played
        if random.random() > 0.3:
            continue
        points1 = random.randint(0, 10)
        points2 = random.randint(0, 10)
        while points1 == points2:
            points2 = random.randint(0, 10)
        match.pointsUser1 = points1
        match.pointsUser2 = points2
        match.winner = match.user1 if points1 > points2 else match.user2
        match.save()

        # modify users to update their statistics with the match data
        match.user1.totalPoints += points1
        match.user1.matchesTotal += 1
        match.user1.matchesWon += 1 if points1 > points2 else 0
        match.user1.matchesLost += 1 if points1 < points2 else 0
        match.user1.save()

        match.user2.totalPoints += points2
        match.user2.matchesTotal += 1
        match.user2.matchesWon += 1 if points2 > points1 else 0
        match.user2.matchesLost += 1 if points2 < points1 else 0
        match.user2.save()

    # if all games in tournament played, change to finished
    for tournament in Tournament.objects.all():
        matches = Match.objects.filter(tournament=tournament)
        if (matches.count() == 0):
            continue
        for match in matches:
            if match.winner is None:
                break
            tournament.status = "Finished"
            tournament.save()


def generate_special_users(apps, schema_editor):
    User = apps.get_model("api", "User")
    Friend = apps.get_model("api", "Friend")
    # create AI user
    User.objects.create_user(
        username=f"AI", password=f"pass123", profilePicture="/api/static/avatars/15.jpg")
    # create a user for each memeber of the project
    User.objects.create_user(username="alaparic", password="pass123",
                             profilePicture="/api/static/avatars/12.jpeg")
    User.objects.create_user(username="adpachec", password="pass123",
                             profilePicture="/api/static/avatars/13.jpeg")
    User.objects.create_user(username="jutrera-", password="pass123",
                             profilePicture="/api/static/avatars/14.jpeg")
    alaparic = User.objects.get(username="alaparic")
    adpachec = User.objects.get(username="adpachec")
    jutrera = User.objects.get(username="jutrera-")
    Friend.objects.create(user1=alaparic, user2=adpachec, status=True)
    Friend.objects.create(user1=alaparic, user2=jutrera, status=True)
    Friend.objects.create(user1=adpachec, user2=jutrera, status=True)
     # create the goat user
    User.objects.create_user(username="lacabra", password="pass123",
                             profilePicture="/api/static/avatars/16.jpeg")


def generate_special_torurnaments(apps, schema_editor):
    Tournament = apps.get_model("api", "Tournament")
    User = apps.get_model("api", "User")
    UserTournament = apps.get_model("api", "UserTournament")
    Match = apps.get_model("api", "Match")

    # create a full tournament
    fullTournament = Tournament.objects.create(name="fullTournament", date=datetime.date.today().isoformat(), number_participants=2, status="In Progress")
    user1 = User.objects.get(username="user1")
    user2 = User.objects.get(username="user2")
    UserTournament.objects.create(user=user1, tournament=fullTournament)
    UserTournament.objects.create(user=user2, tournament=fullTournament)
    Match.objects.create(user1=user1, user2=user2,
                         pointsUser1=0, pointsUser2=0, date=datetime.date.today(), winner=None, tournament=fullTournament)

    # create a tournament with 1 participant
    notStarted = Tournament.objects.create(name="notStarted", number_participants=2)
    user1 = User.objects.get(username="user1")
    UserTournament.objects.create(user=user1, tournament=notStarted)
    notStarted.save()



class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(generate_users_data),
        migrations.RunPython(generate_tournaments_data),
        migrations.RunPython(generate_tournament_participants_data),
        migrations.RunPython(generate_friends_data),
        migrations.RunPython(generate_matches_data),
        migrations.RunPython(generate_tournament_matches_data),
        migrations.RunPython(generate_special_users),
        migrations.RunPython(generate_special_torurnaments),
    ]
