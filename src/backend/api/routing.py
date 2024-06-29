from django.urls import re_path
from .consumers import PongConsumerRemote

websocket_urlpatterns = [
    re_path(r'^ws/pong/(?P<game_id>\d+)/$', PongConsumerRemote.as_asgi()),
]