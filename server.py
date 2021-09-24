import os
import re
import secrets
import string
from dataclasses import dataclass
from pprint import pprint
from typing import Optional

import flask
import yaml
from flask import Flask, render_template, request
from flask_babel import Babel
from flask_socketio import Namespace, SocketIO, emit, join_room, leave_room
from flask_wtf import CSRFProtect


@dataclass
class Channel:
    """
    Channel Entity Class

    A channel is a logical container for a lower thirds channel.
    The rendered view of a channel is used as overlay in a video signal.

    Each channel has it's own control surface and is isolated from other channels.
    Lower thirds played to a channel are only shown in render clients subscribed to that channel.
    """
    name: str
    slug: Optional[str] = None
    _all_channels = {}

    def __post_init__(self):
        if not self.slug:
            self.slug = re.sub(r'[^a-z0-9]', '_', self.name.lower())
        else:
            self.slug = self.slug.lower()
            if not re.fullmatch(r'^[a-z0-9_]+$', self.slug):
                raise ValueError('invalid slug "%s", only alphanumeric characters and underscores are allowed')
        if self.slug in self.__class__._all_channels:
            raise ValueError('channel slug %s already in use by the channel %s'
                             % (self.slug, self.__class__._all_channels[self.slug].name))
        self.__class__._all_channels[self.slug] = self

    @classmethod
    def get_all_channels(cls):
        return cls._all_channels

    @classmethod
    def get_all_channels_serialized(cls):
        return {slug: channel.serialize() for slug, channel in cls._all_channels.items()}

    @classmethod
    def get_channel(cls, channel):
        return cls._all_channels[channel]

    def serialize(self):
        return {
            'name': self.name,
            'slug': self.slug,
        }


try:
    config = yaml.load(open(os.environ.get('LOWER_THIRDS_TOOL_CONFIG', 'settings.yml')), Loader=yaml.SafeLoader)
    if not config:
        print('error, configuration is empty')
        exit(1)
    if not isinstance(config, dict) or not isinstance(config.get('channels'), list):
        print('error, configuration format invalid')
        exit(1)
    if len(config['channels']) < 1:
        print('error, at least one channel must be defined')

    for channel in config['channels']:
        if isinstance(channel, str):
            Channel(name=channel)
        else:
            Channel(name=channel['name'], slug=channel.get('slug'))
except Exception as e:
    print('error loading config: %s' % e)
    raise

app = Flask(__name__)
app.secret_key = os.environ.get('FLASK_SECRET_KEY',
                                config.get('secret', ''.join([secrets.choice(string.printable) for i in range(64)])))
socketio = SocketIO(app)
csrf = CSRFProtect(app)
babel = Babel(app)

supported_languages = {'de', 'en'}

if app.debug:
    pprint(Channel.get_all_channels())


@babel.localeselector
def get_locale():
    requested_language = request.args.get('lang', request.form.get('language')).lower()

    if requested_language is not None and requested_language in supported_languages:
        return requested_language

    return request.accept_languages.best_match(supported_languages)


# views

@app.route('/')
def index_view():  # put application's code here
    return render_template('base.html')


# websocket events

class WebSocketHandler(Namespace):
    def on_connect(self):
        print('new client connected, sending channels data [NAMESPACE]')
        emit('channels_data', {'channels': Channel.get_all_channels_serialized()})

    def on_join_channel(self, data: dict):
        if not isinstance(data, dict):
            raise TypeError('join_channel expects a dictionary with at least the key channel set')
        if data['channel'] not in Channel.get_all_channels():
            raise ValueError('join_channel called with unknown channel slug %s' % data['channel'])
        channel = Channel.get_channel(data['channel'])
        join_room(channel.slug)
        print('session %s joined channel "%s" [%s]' % (flask.request.sid, channel.name, channel.slug))

    def on_leave_channel(self, data):
        if not isinstance(data, dict):
            raise TypeError('leave_channel expects a dictionary with at least the key channel set')
        if data['channel'] not in Channel.get_all_channels():
            raise ValueError('leave_channel called with unknown channel slug %s' % data['channel'])
        channel = Channel.get_channel(data['channel'])
        leave_room(data['channel'])
        print('session %s left channel "%s" [%s]' % (flask.request.sid, channel.name, channel.slug))


socketio.on_namespace(WebSocketHandler('/'))

if __name__ == '__main__':
    socketio.run(app, use_reloader=True)
