from django.conf.urls import patterns, include, url
from django.contrib import admin

urlpatterns = patterns('',
    url(r'^login/$', 'core.authentication.views.userLogin'),
    url(r'^register/$', 'core.authentication.views.register'),
    url(r'^logout/$', 'core.authentication.views.userLogout'),
)
