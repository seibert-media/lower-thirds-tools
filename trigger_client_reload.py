import os
from contextlib import suppress

import yaml
from flask_socketio import SocketIO

config = yaml.load(open(os.environ.get('LOWER_THIRDS_TOOL_CONFIG', 'settings.yml')), Loader=yaml.SafeLoader)
if not config:
    print('error, configuration is empty')
    exit(1)
if not isinstance(config, dict) or not isinstance(config.get('channels'), list):
    print('error, configuration format invalid')
    exit(1)
if not config.get('message_queue'):
    print('message_queue must be configured for this script to work')

with suppress(ImportError):
    from gevent import monkey
    monkey.patch_all()

socketio = SocketIO(message_queue=config.get('message_queue'))
socketio.emit('reload_client')
