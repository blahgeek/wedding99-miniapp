from django.contrib import admin

from .models import RsvpResponse, UiConfig, HuntQuestion, HuntScore


admin.site.register(RsvpResponse)
admin.site.register(UiConfig)
admin.site.register(HuntQuestion)
admin.site.register(HuntScore)
