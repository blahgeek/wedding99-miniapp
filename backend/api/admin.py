from django.contrib import admin

from .models import RsvpResponse, UiConfig, HuntQuestion, HuntScore


class HuntScoreAdmin(admin.ModelAdmin):
    list_display = ('openid', 'name', 'score')
    ordering = ('-score',)


admin.site.register(RsvpResponse)
admin.site.register(UiConfig)
admin.site.register(HuntQuestion)
admin.site.register(HuntScore, HuntScoreAdmin)
