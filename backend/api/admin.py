from django.contrib import admin

from .models import RsvpResponse, UiConfig, HuntQuestion


admin.site.register(RsvpResponse)
admin.site.register(UiConfig)
admin.site.register(HuntQuestion)
