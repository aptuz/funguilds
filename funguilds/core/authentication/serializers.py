from rest_framework import serializers
from .models import Users

class UsersListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ('id','username','first_name', 'last_name', 'email', 'is_superuser','date_joined')

class UsersCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ('password','username','first_name', 'last_name', 'email','date_joined')

class UsersUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ('first_name', 'last_name', 'email')
