from django.urls import path
from . import views

urlpatterns = [
    path('',views.index, name ='index'),
    path('add/',views.add_test, name ='add'),
    path('del/', views.delete_all_records, name='delete_all_records'),
]


