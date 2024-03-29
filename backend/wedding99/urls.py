"""
URL configuration for wedding99 project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path

from api import views as api_views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/code2session", api_views.code2session, name="code2session"),
    path("api/global_config", api_views.global_config, name="global_config"),
    path("api/rsvp", api_views.rsvp, name="rsvp"),
    path("api/hunt_score", api_views.hunt_score, name="hunt_score"),
    path("api/hunt_score_ranking", api_views.hunt_score_ranking, name="hunt_score_ranking"),
    path("api/hunt_tasks", api_views.get_hunt_tasks, name="get_hunt_tasks"),
    path("api/face_upload_and_detect", api_views.face_upload_and_detect, name="face_upload_and_detect"),
]
