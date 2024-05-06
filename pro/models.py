#from django.db import models
from djongo import models

class MyModel(models.Model):
    field1 = models.CharField(max_length=100)
    field2 = models.CharField(max_length=500)
    
    class Meta:
        db_table = 'mydata' 