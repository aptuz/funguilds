from django.db import models
from django.contrib.auth.models import AbstractUser,UserManager


'''class Users(AbstractUser):
    username = models.CharField(max_length=30, unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default = False)
    date_joined = models.DateTimeField(null=True,blank=True)
    
    objects = UserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    class Meta:
        db_table="user_profiles"
'''

class Users(AbstractUser):
    profile_pic = models.CharField(max_length=30, null=True)
    last_activity = models.DateTimeField(null=True,blank=True)
    """
    Users within the Django authentication system are represented by this
    model.

    Username, password and email are required. Other fields are optional.
    """
    class Meta(AbstractUser.Meta):
        swappable = 'user_profiles'
