from .serializers import *
from rest_framework import viewsets, status
from rest_framework.response import Response
from funguilds.restful.viewsets import CustomModelViewSet
from funguilds.restful.permissions import AdminCheckPermission
from django.http import HttpResponse
from rest_framework.decorators import detail_route
from core.services.tasks import sendMail
from datetime import datetime
import pytz
from django.conf import settings

#import models
from core.authentication.models import Users
#import serializers
from core.authentication.serializers import UsersListSerializer, UsersCreateSerializer, UsersUpdateSerializer

class UsersViewSet(CustomModelViewSet):
    """ All User profile Management """
    
    queryset = Users.objects.all()
    
    parser = {
        'detail':UsersListSerializer,
        'create':UsersCreateSerializer,
        'update':UsersUpdateSerializer,
        'default':UsersListSerializer
    }

    lookup_field = "username"
    filter_fields = ('username', 'first_name')
    
    def filtering(self, params, queryset, user = None):
        if "first_name" in params and params['first_name'] != "":
            queryset = queryset.filter(first_name__icontains = params['first_name'])
        if "username" in params and params['username'] != "":
            queryset = queryset.filter(username = params['username'])
        return queryset


    """ Only non logged in user can access """
    def create(self, *args, **kwargs):
        if self.request.user.is_authenticated():
            return Response({'message':'Invalid Operation'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
        else:
            return super(UsersViewSet, self).create(*args, **kwargs)

    """ Only super user can see all user profiles """
    def list(self, *args, **kwargs):
        if self.request.user.is_superuser:
            return super(UsersViewSet, self).list(*args, **kwargs)
        else:
            return Response({'message':'Youre not Authorized'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    """ user can update only his detail """
    def update(self, *args, **kwargs):
        if self.request.user.username == kwargs['username']:
            return super(UsersViewSet, self).update(*args, **kwargs)
        else:
            return Response({'message':'Youre not Authorized'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    """ user can retrieve only his detail"""
    def retrieve(self, *args, **kwargs):
        if self.request.user.is_superuser:
            return super(UsersViewSet, self).retrieve(*args, **kwargs)
        else:
            return super(UsersViewSet, self).retrieve(*args, **kwargs)

    """ No one can delete user account including superuser """
    def destroy(self, *args, **kwargs):
        return Response({'message':'Invalid Request'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    """ User can change password using POST method """
    @detail_route(methods=['GET'])
    def password(self, request, *args, **kwargs):
        # Change password here
        return HttpResponse("Ok")

    
###Mail sample
# eta = datetime.now()
# tz = pytz.timezone(settings.TIME_ZONE)
# eta = tz.localize(eta)

# template = "testmail.html"
# subject = "subject"
# ToList = ['parthasaradhi1992@gmail.com']
# context = {'data':'data'}
# data = {'to_list':ToList, 'subject':subject, 'template':template, 'context':context}
# sendMail.apply_async(('MAIL','siva'),{'to_list':ToList, 
#                       'subject':subject, 
#                       'template':template, 
#                       'context':context}, 
#                       eta=eta)
