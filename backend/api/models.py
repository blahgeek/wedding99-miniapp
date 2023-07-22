from django.db import models

class SessionKV(models.Model):
    key = models.CharField(max_length=64, primary_key=True)
    value = models.TextField()

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

    def __str__(self):
        return f'RsvpResponse: {self.name}, participate={self.participate}'


class HuntScore(models.Model):
    openid = models.CharField(max_length=128, primary_key=True)
    name = models.CharField(max_length=64)
    score = models.IntegerField(default=0)

