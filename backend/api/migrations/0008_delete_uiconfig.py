# Generated by Django 4.2.3 on 2023-07-22 04:06

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0007_delete_huntquestion"),
    ]

    operations = [
        migrations.DeleteModel(
            name="UiConfig",
        ),
    ]
