/**
 * Small wrapper around a Web Socket.
 * https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
 */

class Socket {
  socket: WebSocket | null;

  constructor() {
    this.socket = null;
  }

  connect(url: string) {
    if (!this.socket) {
      this.socket = new WebSocket(url);
    }
  }

  send(message: unknown) {
    if (this.socket) {
      this.socket.send(JSON.stringify(message));
    }
  }

  // TODO: Replace the `any` with the correct type.
  on(eventName: EventName, callback: any) {
    if (this.socket) {
      this.socket.addEventListener(eventName, callback);
    }
  }
}

type EventName = 'open' | 'close' | 'error' | 'message';

export default Socket;
