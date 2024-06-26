import contextlib
from channels.generic.websocket import AsyncJsonWebsocketConsumer

class PongConsumer(AsyncJsonWebsocketConsumer):
    
    async def connect(self):
        self.match_id = self.scope['url_route']['kwargs']['id']
        self.group_name = f'group_{self.match_id}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)

        with contextlib.suppress(KeyError):
            if(len(self.channel_layer.groups[self.group_name]) > 2):
                await self.accept()
                await self.send_json({
						"event": "show_error",
						"error": "Match is full"
				})
                return await self.close()

        await self.accept()
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        
        if len(self.channel_layer.groups[self.group_name]) == 2:
            matchGroup = list(self.channel_layer.groups[self.group_name])
            #print(matchGroup)
            for i, channel_name in enumerate(matchGroup):
                player_number = "1" if i == 0 else "2"
                await self.channel_layer.send(channel_name, {
					"type": "gameData.send",
                    "data": {
                        "event": "game_start",
                        "player": player_number,
                    }
				})

    async def receive_json(self, content, **kwargs):
        #print(content)
        if (content['event'] == "game_update"):
            for channel_name in self.channel_layer.groups[self.group_name]:
                await self.channel_layer.send(channel_name, {
                    "type": "gameData.send",
                    "data": {
                        "event": "game_update",
                        "stateMatch": content['stateMatch'],
                    }
			    })
        elif(content['event'] == "game_over"):
            for channel_name in self.channel_layer.groups[self.group_name]:
                await self.channel_layer.send(channel_name, {
					"type": "gameData.send",
					"data": {
						"event": "game_over",
						"winner": content['winner'],
					}
				})

        elif(content['event'] == "write_names"):
            for channel_name in self.channel_layer.groups[self.group_name]:
                await self.channel_layer.send(channel_name, {
					"type": "gameData.send",
					"data": {
						"event": "write_names",
						"name1": content['name1'],
						"name2": content['name2'],
                        "ballvy": content['ballvy'],
					}
				})

    async def disconnect(self, code):
        if(code==1):
            return 
        await self.channel_layer.group_discard(self.group_name, self.channel_name)
        await self.channel_layer.group_send(self.group_name, {
            "type": "gameData.send",
            "data": {
                "event": "opponent_left",
            }
        })

    async def gameData_send(self, context):
        await self.send_json(context['data'])
