from django.conf.urls import patterns, include, url
from django.contrib import admin

urlpatterns = patterns('',
    url(r'^$', 'core.services.views.home'),
    url(r'^cssdemo/$', 'core.services.views.cssdemo'),
    #catch all
    url(r'^.*/$', 'core.services.views.CatchAllUrl'),
)
