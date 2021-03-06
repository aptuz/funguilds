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


from core.services.models import Guild, GameDetail, Tags, GuildAcceptance, GuildMembers, GuildManaged
#import serializers
from core.services.serializers import GuildListSerializer, GuildCreateSerializer, TagsSerializer, GameDetailListSerializer, GameDetailUpdateSerializer, GuildAcceptanceSerializer, GuildDetailSerializer, GuildAcceptanceCreateSerializer, GuildAcceptanceUpdateSerializer

class GuildViewSet(CustomModelViewSet):
    """ All User profile Management """
    
    queryset = Guild.objects.all()
    
    parser = {
        'list':GuildListSerializer,
        'retrieve':GuildDetailSerializer,
        'create':GuildCreateSerializer,
        'update':GuildCreateSerializer,
        'default':GuildListSerializer
    }

    def post_save(self, obj, **kwargs):
        obj.created_by = self.request.user
        obj.save()
        GMRef = GuildManaged()
        GMRef.user = self.request.user
        GMRef.guild = obj
        GMRef.save()

   
    filter_fields = ('name','user','admin','member','open')
    
    def filtering(self, params, queryset, user = None):
        if "name" in params and params['name'] != "":
            queryset = queryset.filter(name__icontains = params['name'])
        if "user" in params and params['user'] != "":
            if 'admin' in params and params['admin'] == 'yes':
                queryset = queryset.filter(created_by = int(params['user']))
            if 'member' in params and params['member'] == 'yes':
                mguilds = GuildMembers.objects.filter(user=int(params['user'])).values_list('guild',flat=True)
                queryset = queryset.filter(pk__in=mguilds)
            if 'open' in params and params['open'] == 'yes':
                aguilds = GuildManaged.objects.filter(user=int(params['user'])).values_list('guild',flat=True)
                mguilds = GuildMembers.objects.filter(user=int(params['user'])).values_list('guild',flat=True)
                cguilds = list(set(list(aguilds)+list(mguilds)))
                queryset = queryset.exclude(pk__in=cguilds)
        return queryset


    """ Only  logged in user can create """
    def create(self, *args, **kwargs):
        if self.request.user.is_authenticated():
            return super(GuildViewSet, self).create(*args, **kwargs)            
        else:
            return Response({'message':'Authentication required'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
            

    """ anyone can see the guilds """
    # def list(self, *args, **kwargs):
    #     if self.request.user.is_authenticated():
    #         return super(GuildViewSet, self).list(*args, **kwargs)
    #     else:
    #         return Response({'message':'Youre not Authorized'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    """ user can update only his detail """
    def update(self, *args, **kwargs):
        if self.request.user.is_authenticated():
            return super(GuildViewSet, self).update(*args, **kwargs)
        else:
            return Response({'message':'Youre not Authorized'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    """ user can retrieve only his detail"""
    # def retrieve(self, *args, **kwargs):
    #     if self.request.user.is_superuser:
    #         return super(UsersViewSet, self).retrieve(*args, **kwargs)
    #     else:
    #         return super(UsersViewSet, self).retrieve(*args, **kwargs)

    """ No one can delete user account including superuser """
    # def destroy(self, *args, **kwargs):
    #     return Response({'message':'Invalid Request'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    """ User can change password using POST method """
    # @detail_route(methods=['GET'])
    # def password(self, request, *args, **kwargs):
    #     # Change password here
    #     return HttpResponse("Ok")


class TagsViewSet(CustomModelViewSet):
    """ All User profile Management """
    
    queryset = Tags.objects.all()
    
    parser = {
        'default':TagsSerializer
    }

    filter_fields = ('name',)
    
    def filtering(self, params, queryset, user = None):
        if "name" in params and params['name'] != "":
            queryset = queryset.filter(name__icontains = params['name'])
        return queryset


    """ Only  logged in user can create """
    def create(self, *args, **kwargs):
        if self.request.user.is_authenticated():
            return super(TagsViewSet, self).create(*args, **kwargs)            
        else:
            return Response({'message':'Authentication required'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def update(self, *args, **kwargs)  :
        if self.request.user.is_authenticated():
            #additional about author of guild
            return super(TagsViewSet, self).update(*args, **kwargs)            
        else:
            return Response({'message':'Authentication required'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def destroy(self, *args, **kwargs):
        if self.request.user.is_authenticated():
            #additional about author of guild
            return super(TagsViewSet, self).destroy(*args, **kwargs)            
        else:
            return Response({'message':'Authentication required'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

class GameDetailViewSet(CustomModelViewSet):
    """ All User profile Management """
    
    queryset = GameDetail.objects.all()
    
    parser = {
        'list':GameDetailListSerializer,
        'create':GameDetailUpdateSerializer,
        'update':GameDetailUpdateSerializer,
        'default':GameDetailListSerializer
    }

    filter_fields = ('tag_name',)
    
    def post_save(self, obj, **kwargs):
        obj.created_by = self.request.user
        obj.save()


    def filtering(self, params, queryset, user = None):
        if "tag_name" in params and params['name'] != "":
            pass
            # queryset = queryset.filter(name__icontains = params['name'])
        return queryset


    """ Only  logged in user can create """
    def create(self, *args, **kwargs):
        if self.request.user.is_authenticated():
            return super(GameDetailViewSet, self).create(*args, **kwargs)            
        else:
            return Response({'message':'Authentication required'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def update(self, *args, **kwargs)  :
        if self.request.user.is_authenticated():
            #additional about author of guild
            return super(GameDetailViewSet, self).update(*args, **kwargs)            
        else:
            return Response({'message':'Authentication required'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def destroy(self, *args, **kwargs):
        if self.request.user.is_authenticated():
            #additional about author of guild
            return super(GameDetailViewSet, self).destroy(*args, **kwargs)            
        else:
            return Response({'message':'Authentication required'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

class GuildAcceptanceViewSet(CustomModelViewSet):
    """ All Request Management """
    
    queryset = GuildAcceptance.objects.all()
    
    parser = {
        'create':GuildAcceptanceCreateSerializer,
        'retrieve':GuildAcceptanceSerializer,
        'update':GuildAcceptanceUpdateSerializer,
        'default':GuildAcceptanceSerializer
    }

    filter_fields = ('reuested_from','required_to')
    


    def post_save(self, obj, **kwargs):
        if kwargs['created']:
            obj.requested_from = self.request.user
            obj.requested_on = datetime.now()
            obj.save()
        if obj.status == 'ACCEPTED':
            GMRef = GuildMembers()
            GMRef.guild = obj.guild
            GMRef.user = obj.requested_from
            GMRef.save()
        




    def filtering(self, params, queryset, user = None):
        if "guild" in params and params['guild'] != "":
            queryset = queryset.filter(guild_id = int(params['guild']))
        if "reuested_from" in params and params['reuested_from'] != "":
            queryset = queryset.filter(reuested_from_id = int(params['reuested_from']))
        if "status" in params and params['status'] != "":
            queryset = queryset.filter(status = params['status'])
        return queryset

    def list(self, *args, **kwargs):
        if self.request.user.is_authenticated():
            return super(GuildAcceptanceViewSet, self).list(*args, **kwargs)        
        else:
            return  Response({'message':'You\'re not allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def retrieve(self, *args, **kwargs):
        if self.request.user.is_authenticated():
            return super(GuildAcceptanceViewSet, self).retrieve(*args, **kwargs)            
        else:
            return Response({'message':'Authentication required'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    """ Only  logged in user can create """
    def create(self, *args, **kwargs):
        if self.request.user.is_authenticated():
            return super(GuildAcceptanceViewSet, self).create(*args, **kwargs)            
        else:
            return Response({'message':'Authentication required'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def update(self, *args, **kwargs)  :
        if self.request.user.is_authenticated():
            #additional about author of guild
            return super(GuildAcceptanceViewSet, self).update(*args, **kwargs)            
        else:
            return Response({'message':'Authentication required'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)