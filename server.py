import os
import re
import secrets
import string
from dataclasses import dataclass
from pprint import pprint
from typing import Optional

import flask
import yaml
from flask import Flask, abort, render_template, request
from flask_babel import Babel
from flask_socketio import Namespace, SocketIO, emit, join_room, leave_room
from flask_wtf import CSRFProtect


@dataclass
class LowerThird:
    design: str
    title: str
    subtitle: Optional[str] = None
    duration: Optional[float] = None

    def serialize(self):
        return {
            'design': self.design,
            'title': self.title,
            'subtitle': self.subtitle,
            'duration': self.duration,
        }


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

        self.lower_third_visible: bool = False
        self.current_lower_third: Optional[LowerThird] = None

        try:
            from gevent.lock import BoundedSemaphore
            self.lock = BoundedSemaphore()
        except ImportError:
            self.lock = None

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

    def show_lower_third(self, lt: LowerThird):
        print('showing lower third in channel: "%s" [%s]' % (self.name, self.slug))
        print('design: "%(design)s" title: "%(title)s" subtitle: "%(subtitle)s" duration: %(duration)0.3f' % {
            'design': lt.design,
            'title': lt.title,
            'subtitle': lt.subtitle,
            'duration': lt.duration if lt.duration is not None else -1,
        })
        self.current_lower_third = lt
        data = {
            'channel': self.slug
        }
        data.update(lt.serialize())
        socketio.emit('show_lower_third', data, to=self.slug)
        # currently disable as there is no easy and reliable way to unlock this server side if all clients fail
        # self.lower_third_visible = True
        self.update_channel_status()

    def update_channel_status(self, to=None):
        if to is None:
            to = self.slug
        data = {
            'channel': self.slug,
            'lower_third_visible': self.lower_third_visible,
            'current_lower_third': self.current_lower_third.serialize() if self.current_lower_third else None,
        }
        print('sending channel status update to %s' % to)
        socketio.emit('channel_status', data, to=to)


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
def index_view():
    return render_template('base.html')


@app.route('/playout/<channel>')
def playout_view(channel: str):
    try:
        channel = Channel.get_channel(channel)
    except KeyError:
        abort(404)
    return render_template('playout.html', channel=channel)


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
        channel.update_channel_status(to=flask.request.sid)

    def on_leave_channel(self, data):
        if not isinstance(data, dict):
            raise TypeError('leave_channel expects a dictionary with at least the key channel set')
        if data['channel'] not in Channel.get_all_channels():
            raise ValueError('leave_channel called with unknown channel slug %s' % data['channel'])
        channel = Channel.get_channel(data['channel'])
        leave_room(data['channel'])
        print('session %s left channel "%s" [%s]' % (flask.request.sid, channel.name, channel.slug))

    def on_show_lower_third(self, data):
        try:
            if not isinstance(data, dict):
                raise TypeError('show_lower_third expects a dictionary')
            if not data.get('channel') or not data.get('title') or not data.get('design'):
                raise ValueError('show_lower_third needs at least the channel, title and design')
            if data['channel'] not in Channel.get_all_channels():
                raise ValueError('show_lower_third called with unknown channel slug %s' % data['channel'])
            channel = Channel.get_channel(data['channel'])
            duration = data.get('duration')
            if duration or duration == 0:
                duration = float(duration)
            else:
                duration = None
            if channel.lock:
                channel.lock.acquire()
            if channel.lower_third_visible:
                channel.lock.release()
                return {
                    'status': 'error',
                    'error': 'concurrency_error',
                    'msg': 'Another lower third is already being displayed.',
                }
        except (ValueError, TypeError) as e:
            return {
                'status': 'error',
                'error': e.__class__.__name__,
                'msg': str(e),
            }
        channel.show_lower_third(LowerThird(
            design=data['design'],
            title=data['title'],
            subtitle=data.get('subtitle'),
            duration=duration
        ))
        channel.lock.release()
        return {'status': 'success'}


socketio.on_namespace(WebSocketHandler('/'))

if __name__ == '__main__':
    socketio.run(app, use_reloader=True)
