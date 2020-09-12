export default class AvonetClient {
  listeners = [];
  pending = [];

  constructor(engine) {
    this.engine = engine;
  }

  connect(handler) {
    var url = this.engine.prod ?
                'wss://avonet.whipple/life:9789' :
                'ws://localhost:9789';

    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      this.pending.forEach(msg => {
        this.send(msg);
      });
      this.pending = [];
      this.socket.addEventListener('message', msg => {
        this.listeners.forEach(listener => {
          listener(msg.data);
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

  send(msg) {
    if ( this.socket.readyState === this.socket.OPEN ) {
      this.socket.send(msg);
    } else {
      this.pending.push(msg);
    }
  }
}