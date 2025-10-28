// Mock implementation for cloudflare:sockets
// This properly mocks the Socket functionality needed by pg-cloudflare

class Socket {
  constructor() {
    this.destroyed = false;
    this.readable = true;
    this.writable = true;
  }
  
  // Basic socket methods
  connect() { return this; }
  on() { return this; }
  once() { return this; }
  removeListener() { return this; }
  removeAllListeners() { return this; }
  emit() { return this; }
  end() { return this; }
  destroy() { this.destroyed = true; return this; }
  write() { return true; }
  pause() { return this; }
  resume() { return this; }
  setTimeout() { return this; }
  setNoDelay() { return this; }
  setKeepAlive() { return this; }
  address() { return { port: 0, family: 'IPv4', address: '127.0.0.1' }; }
}

// Export a proper socket implementation
module.exports = {
  connect: (options, callback) => {
    const socket = new Socket();
    
    if (typeof callback === 'function') {
      setTimeout(() => {
        callback(null, socket);
      }, 0);
    }
    
    return socket;
  },
  
  // Additional exports that might be needed
  Socket
}; 