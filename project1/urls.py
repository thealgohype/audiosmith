from django.contrib import admin
from django.urls import include, path
from pro.views import add_data


urlpatterns = [
    path('admin/', admin.site.urls),
    path('chat_bot/', add_data),
]