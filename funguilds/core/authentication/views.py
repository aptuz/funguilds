from django.shortcuts import render_to_response
from django.http import HttpResponse, HttpRequest, HttpResponseRedirect
from django.template import RequestContext, loader
from django.contrib.auth import authenticate,login,logout
from django.contrib.auth.hashers import check_password,make_password
from .models import Users
import json

""" For user login """
def userLogin(request):
    data = {}
    if request.method == "GET":
        pass
    if request.method == "POST":
        uname = request.POST.get('username')
        pwd = request.POST.get('password')
        user = authenticate(username = uname, password = pwd)
        if user is not None:
            login(request, user)
            data = {
                'message':'success'
            }
            return HttpResponse(json.dumps(data))
        else:
            data = {
                'message':'Invalid User Credentials'
            }
    return render_to_response('login.html', data, context_instance=RequestContext(request))

def register(request):
    import re
    data = {}
    reg = re.compile("^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$")
    if request.method == "POST":
        user = Users()
        user.username = request.POST.get('username')
        if reg.match(request.POST.get('email')):
            user.email = request.POST.get('email')
        else:
            return HttpResponseServerError('Invaild Email') 
        user.password = make_password(request.POST.get('password'))
        user.save()
        user = authenticate(username = request.POST.get('username'), password = request.POST.get('password'))
        login(request, user)
        data = {
            'message':'success'
        }
        return HttpResponse(json.dumps(data))

""" For user logout """
def userLogout(request):
    logout(request)
    return HttpResponseRedirect("/")

