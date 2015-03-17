import json,time
from django.core.cache import cache
from ws4redis.redis_store import RedisMessage
from ws4redis.publisher import RedisPublisher
from funguilds import celery_app as app

@app.task
def start_bingo_game(task_id):
    while True:
        input_events = cache.get('bingo_input_events')
        pldata = cache.get('bingo_players_data')
        if input_events is not None and len(input_events) > 0:
            event = input_events.pop(0)
            cache.set('bingo_input_events',input_events)
            request_id = event['requestID']
            pdata = event['pData']
            if pldata is not None:
                if pdata['playerID'] in pldata:
                    pldata[pdata['playerID']]['xPoint'] = pdata['xPoint']
                    pldata[pdata['playerID']]['yPoint'] = pdata['yPoint']
                else:
                    pldata[pdata['playerID']] = pdata
            else:
                pldata = {}
                pldata[pdata['playerID']] = pdata
            cache.set('bingo_players_data',pldata)
            pldata['requestID'] = request_id
        else:
            pldata = pldata if pldata is not None else {}
        redis_publisher = RedisPublisher(facility='interpolation', broadcast=True)
        message = RedisMessage(json.dumps(pldata))
        redis_publisher.publish_message(message)
        time.sleep(0.002)
