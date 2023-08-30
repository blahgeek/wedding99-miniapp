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

    def to_message(self):
        msg = ''
        if self.participate:
            msg += '确认参加; '
            if self.plusOne:
                msg += '携伴; '
            if self.needHotel:
                msg += f'需要酒店 {self.needHotelStartDate} 至 {self.needHotelEndDate}; '
        else:
            msg += '不参加; '
        if self.notes:
            msg += f'备注：{self.notes}'
        return msg

    def __str__(self):
        return f'{self.name}: {self.to_message()}'


class HuntScore(models.Model):
    openid = models.CharField(max_length=128, primary_key=True)
    name = models.CharField(max_length=64)
    score = models.IntegerField(default=0)
    score_timestamp = models.IntegerField(default=0)

