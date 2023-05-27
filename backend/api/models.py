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

    def __str__(self):
        return f'RsvpResponse: {self.name}, participate={self.participate}'


class UiConfig(models.Model):
    key = models.CharField(max_length=64, primary_key=True)
    value = models.TextField()


class HuntQuestion(models.Model):
    question_id = models.CharField(max_length=64, primary_key=True)
    question_rich_content = models.TextField()
    answer0 = models.CharField(max_length=64)
    answer1 = models.CharField(max_length=64)
    answer2 = models.CharField(max_length=64)
    answer3 = models.CharField(max_length=64)
    correct_answer = models.IntegerField()
    explanation = models.TextField()


class HuntScore(models.Model):
    openid = models.CharField(max_length=128, primary_key=True)
    name = models.CharField(max_length=64)
    score = models.IntegerField(default=0)

