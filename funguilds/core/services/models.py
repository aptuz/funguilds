from django.db import models
from core.authentication.models import Users

choices = (('Private','Private'),('Public', 'Public'))
REQUEST_CHOICES = (('REQUESTED', 'REQUESTED'), ('ACCEPTED', 'ACCEPTED'), ('REJECTED', 'REJECTED'), ('CLOSED','CLOSED'))

class Guild(models.Model):

    name = models.CharField(max_length = 50)
    description = models.CharField(max_length = 50, null = True)
    cover_pic = models.CharField(max_length = 300, null = True)
    group_type = models.CharField(max_length = 10, choices = choices)
    created_by = models.ForeignKey(Users, null=True)
    

    class Meta:
        db_table = "guilds"

    def __unicode__(self):
        return self.name


class GuildManaged(models.Model):
    guild = models.ForeignKey(Guild, related_name = "guildobj")
    user = models.ForeignKey(Users, related_name = "manageduser")

    class Meta:
        db_table = "guild_managed"


class GuildMembers(models.Model):
    guild = models.ForeignKey(Guild, related_name = "guilds")
    user = models.ForeignKey(Users, related_name = "memberuser")

    class Meta:
        db_table = "guild_members"

class GameDetail(models.Model):
    name = models.CharField(max_length = 50)
    description = models.CharField(max_length = 100, null = True)
    profile_pic = models.CharField(max_length = 300, null = True)
    created_by = models.ForeignKey(Users, related_name = "created_by", null=True)

    class Meta:
        db_table = "game_detail"

class GuildGames(models.Model):
    guild = models.ForeignKey(Guild, related_name = "game_guild")
    game = models.ForeignKey(GameDetail, related_name = "game_game")

    class Meta:
        db_table = "guild_games"

class Tags(models.Model):
    guild = models.ForeignKey(Guild, related_name = "guild_tags", null = True)
    game = models.ForeignKey(GameDetail, related_name = "game_tags", null = True)
    tag_name = models.CharField(max_length = 30)

    class Meta:
        db_table = "tags"

class GuildAcceptance(models.Model):
    guild = models.ForeignKey(Guild, related_name = "guild_request")
    requested_from = models.ForeignKey(Users, related_name = "requested_user", null=True)
    status = models.CharField(max_length = 30)
    requested_on = models.DateTimeField(null = True)

    class Meta:
        db_table = "guild_acceptance"

class NextId(models.Model):
    source = models.CharField(max_length = 20)
    next_id = models.IntegerField(max_length = 12, default=1000)

    class Meta:
        db_table = "next_id"

class GameStates(models.Model):
    game_id = models.IntegerField(max_length = 12)
    game_obj = models.ForeignKey(GameDetail, related_name = "gameobj")
    game_state = models.CharField(max_length = 20)
    game_winner = models.CharField(max_length = 40, null=True)

    class Meta:
        db_table = "game_state"

class GameUsers(models.Model):
    game_id = models.ForeignKey(GameStates, related_name = "gamestates")
    user = models.ForeignKey(Users, related_name = "users") 
    mode = models.CharField(max_length = 40, null=True)
    score = models.IntegerField(max_length = 12, null=True)

    class Meta:
        db_table = "game_users"  

    


