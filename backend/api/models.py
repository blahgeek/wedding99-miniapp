from django.db import models

# note: camelCase to be consistent with typescript

class RsvpResponse(models.Model):
    openid = models.CharField(max_length=128, primary_key=True)
    name = models.CharField(max_length=64)
    participate = models.BooleanField(default=False)
    plusOne = models.BooleanField(default=False)
    needHotel = models.BooleanField(default=False)
    needHotelStartDate = models.CharField(max_length=64)
    needHotelEndDate = models.CharField(max_length=64)
    notes = models.TextField()
