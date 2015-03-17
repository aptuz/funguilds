from django.contrib.auth.views import redirect_to_login
from django.contrib.auth.models import User
from django.http import HttpResponse, HttpRequest, HttpResponseRedirect
from datetime import datetime

exempted_urls = ['/register']
user_exempted_urls = ['']
class LoginRequiredMiddleware:
    
    def process_request(self, request):
        if request.path_info == '/login/':
            if request.user.is_authenticated():
                return HttpResponseRedirect('/')
            else:
                if request.path_info == '/':
                    return HttpResponseRedirect('/login/')
                return 
        if not request.user.is_authenticated():
            path = request.path_info.lstrip('/')
            exempt = False
            for exempt_url in exempted_urls:
                if request.path.startswith(exempt_url):
                    exempt=True
            if not exempt:
                return HttpResponseRedirect('/login/')
            else:
                return
        else:
            if request.user.is_superuser:
                return
            else:
                uexempt = False
                for exempt_url in user_exempted_urls:
                    if request.path.startswith(exempt_url):
                        uexempt=True
                if not uexempt:
                    return 
                else:
                    return 

class ActiveMiddleware:

    def process_request(self, request):
        if request.user.is_authenticated():
            utc_time = datetime.utcnow()
            request.user.last_activity = utc_time
            request.user.save()
        return
            
