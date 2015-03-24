import random,json
from django.shortcuts import render
from django.http import HttpResponse
from django.core.cache import cache
from celery.task.control import revoke
from ws4redis.redis_store import RedisMessage
from ws4redis.publisher import RedisPublisher
from ws4redis.redis_store import SELF
from core.authentication.models import Users
from core.services.models import GameStates,GameUsers,GameDetail
from core.services.views import GetNextId
from .tasks import *


# Create your views here.

def request_game(request):
    game_id = GetNextId()
    acceptee = Users.objects.get(pk=int(request.GET['user']))
    requestee = Users.objects.get(pk=int(request.GET['requestee']))
    game = GameDetail.objects.get(name=request.GET['game'])
    game_state = GameStates(game_id=game_id,game_obj=game,game_state='Requesting')
    game_state.save()
    game_users = GameUsers(game_id=game_state, user=requestee, mode='Requestee')
    game_users.save() 
    redis_publisher = RedisPublisher(facility='notifications', users=[acceptee.username])
    data = {
        'userName': requestee.username,
        'gameName': game.name,
        'gameID': game_id,
        'mode': 'game_request'
    }
    message = RedisMessage(json.dumps(data))
    redis_publisher.publish_message(message)
    return HttpResponse('success')

def accept_game(request):
    game_id = int(request.GET['gameID'])
    game_state = GameStates.objects.get(game_id=game_id)
    if game_state.game_state != 'Busy':
        if request.GET['mode'] == 'accept_request':
            acceptee = Users.objects.get(pk=int(request.GET['acceptee']))
            game_users = GameUsers(game_id=game_state, user=acceptee, mode='Acceptee')
            game_users.save() 
            game_state.game_state = 'Requested'
            game_state.save()
            game_requestee = GameUsers.objects.get(game_id=game_state,mode='Requestee').user
            redis_publisher = RedisPublisher(facility='notifications', users=[game_requestee.username])
            data = {
                'userName': acceptee.username,
                'gameName': game_state.game_obj.name,
                'gameID': game_id,
                'mode': 'game_start1'
            }
            message = RedisMessage(json.dumps(data))
        elif request.GET['mode'] == 'accept_start1':
            requestee = Users.objects.get(pk=int(request.GET['requestee']))
            acceptee = Users.objects.get(username=str(request.GET['acceptee']))
            redis_publisher = RedisPublisher(facility='notifications', users=[acceptee.username])
            data = {
                'userName': requestee.username,
                'requestee': requestee.username,
                'gameName': game_state.game_obj.name,
                'gameID': game_id,
                'mode': 'game_start2'
            }
            message = RedisMessage(json.dumps(data))
        elif request.GET['mode'] == 'accept_start2':
            requestee = GameUsers.objects.get(game_id=game_state,mode='Requestee').user
            acceptee = Users.objects.get(pk=int(request.GET['acceptee']))
            game_state.game_state = 'Busy'
            game_state.save()
            redis_publisher = RedisPublisher(facility='notifications', users=[acceptee.username,requestee.username])
            data = {
                'gameName': game_state.game_obj.name,
                'requestee': requestee.pk,
                'acceptee': acceptee.pk,
                'gameID': game_id,
                'mode': 'game_deploy'
            }
            message = RedisMessage(json.dumps(data))
        redis_publisher.publish_message(message)
    return HttpResponse('success')

def bingo_game(request):
    if request.method == 'POST':
        playerID = request.POST['playerID']
        gameData = request.POST['gameData']
        key = 'bingo_'+str(request.POST['gameID'])+'_'
        if request.GET['type'] == 'shuffle':
            game_board = cache.get(key+'game_board')
            if game_board is not None:
                game_board[playerID] = json.loads(gameData)
            else:
                game_board = {}
                game_board[playerID] = json.loads(gameData)
            cache.set(key+'game_board', game_board)
        elif request.GET['type'] == 'click':
            input_events = cache.get(key+'input_events')
            if input_events is not None:
                if playerID in input_events:
                    input_events[playerID][gameData] = 1
                else:
                    input_events[playerID] = {}
                    input_events[playerID][gameData] = 1
            else:
                input_events = {}
                input_events[playerID] = {}
                input_events[playerID][gameData] = 1
            cache.set(key+'input_events',input_events)
            redis_publisher = RedisPublisher(facility='bingo_'+str(request.POST['gameID']), broadcast=True)
            data = {
                'id': gameData,
                'playerID': playerID
            }
            message = RedisMessage(json.dumps(data))
            redis_publisher.publish_message(message)
        elif request.GET['type'] == 'completed_row':
            redis_publisher = RedisPublisher(facility='bingo_'+str(request.POST['gameID']), broadcast=True)
            data = {
                'id': gameData,
                'playerID': playerID
            }
            message = RedisMessage(json.dumps(data))
            redis_publisher.publish_message(message)
        elif request.GET['type'] == 'winner':
            redis_publisher = RedisPublisher(facility='bingo_'+str(request.POST['gameID']), broadcast=True)
            data = {
                'id': gameData,
                'playerID': playerID
            }
            message = RedisMessage(json.dumps(data))
            redis_publisher.publish_message(message)
        return HttpResponse('success')
    return HttpResponse("ok")

def snake_game(request):
    if request.method == 'POST':
        playerID = request.POST['playerID']
        gameData = request.POST['gameData']
        key = 'snakes_'+str(request.POST['gameID'])+'_'
        if request.GET['type'] == 'diceRoll':
            game_board = cache.get(key+'game_state')
            if game_board is not None:
                game_board[playerID] = json.loads(gameData)
            else:
                game_board = {}
                game_board[playerID] = json.loads(gameData)
            cache.set(key+'game_state', game_board)
            redis_publisher = RedisPublisher(facility='snakes_'+str(request.POST['gameID']), broadcast=True)
            data = {
                'mode': request.GET['type'],
                'data': gameData,
                'playerID': playerID
            }
            message = RedisMessage(json.dumps(data))
            redis_publisher.publish_message(message)
    return HttpResponse("ok")
    
