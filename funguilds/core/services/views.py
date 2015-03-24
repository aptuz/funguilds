from django.shortcuts import render
from django.shortcuts import render_to_response
from django.template import RequestContext, loader
from django.http import HttpResponse
from django.views.generic import View
from core.services.models import Guild,GuildGames,GameDetail,NextId
import json

def home(request):
    return render_to_response("base.html", {}, context_instance=RequestContext(request))

def cssdemo(request):
    return render_to_response("cssdemo.html", {}, context_instance=RequestContext(request))

def add_games(request, guild_id, game_id):
    if request.user.username == Guild.objects.get(pk=guild_id).created_by.username:
        guild_games = GuildGames()
        guild_games.guild = Guild.objects.get(pk=guild_id)
        guild_games.game = GameDetail.objects.get(pk=game_id)
        guild_games.save()
        return HttpResponse("added")

def if_partial_url(url):
    partial_urls = [ '/guild_detail','/bingo/','/dots/','/snakes/']
    proceed = False
    for purl in partial_urls:
        if url.startswith(purl):
            proceed = True
    return proceed

def CatchAllUrl(request):
    purl = if_partial_url(request.path)
    if purl:
        if not request.user_agent.is_bot:
            return render_to_response('base.html', {}, context_instance=RequestContext(request))
    else:
        return HttpResponse("Page Not Found")

def GetNextId():
    next=NextId.objects.get(source='games')
    return_stmt=next.next_id
    next.next_id=return_stmt+1
    next.save()
    return return_stmt
