export default class AvonetClient {
  listeners = [];
  pending = [];

  constructor(engine) {
    this.engine = engine;
  }

  connect(handler) {
    var url = this.engine.prod ?
                'ws://avonet.whipple.life:9789' :
                'ws://localhost:9789';

    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      this.pending.forEach(msg => {
        this.socket.send(msg);
      });
      this.pending = [];
      this.socket.addEventListener('message', msg => {
        this.listeners.forEach(listener => {
          try {
            listener(JSON.parse(msg.data));
          } catch {
            listener(msg.data);
          }
        });
      });
    };

    this.listen(handler);
  }

  listen(handler) {
    if ( handler ) {
      this.listeners.push(handler);
    }
  }

  send(...args) {
    var type = "broadcast", channel = this.channel ?? args[0], body = this.channel ? args[0] : args[1];

    var msg = JSON.stringify({type, channel, body});
    this._send(msg);
  }

  _send(msg) {
    if ( this.socket.readyState === this.socket.OPEN ) {
      this.socket.send(msg);
    } else {
      this.pending.push(msg);
    }
  }

  setChannel(channel) {
    this.channel = channel;
  }

  ping() {
    this._send(JSON.stringify({type: "ping"}));
  }

  subscribe(channel) {
    this._send(JSON.stringify({type: "subscribe", channel}));
  }
  
  unsubscribe(channel) {
    this._send(JSON.stringify({type: "unsubscribe", channel}));
  }

  auth(name) {
    this._send(JSON.stringify({type: "auth", name}));
  }
}