from django.conf.urls import patterns, include, url
from django.contrib import admin
from core.authentication.viewsets import UsersViewSet
from core.services.viewsets import GuildViewSet, TagsViewSet, GameDetailViewSet, GuildAcceptanceViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()

router.register(r'profile', UsersViewSet)
router.register(r'guild', GuildViewSet)
router.register(r'tags', TagsViewSet)
router.register(r'games', GameDetailViewSet)
router.register(r'guildrequest', GuildAcceptanceViewSet)

urlpatterns = patterns('',
    url(r'^webservices/api/1/', include(router.urls)),
    url(r'^games/request_game/', 'core.games.views.request_game'),
    url(r'^games/accept_game/', 'core.games.views.accept_game'),
    url(r'^games/bingo/game_state/', 'core.games.views.bingo_game'),
    url(r'^games/snakes/game_state/', 'core.games.views.snake_game'),
    url(r'^', include('core.authentication.urls')),
    url(r'^add_games/(?P<guild_id>\d+)/(?P<game_id>\d+)/$', 'core.services.views.add_games'),
    url(r'^', include('core.services.urls')),
    url(r'^admin/', include(admin.site.urls)),
)
