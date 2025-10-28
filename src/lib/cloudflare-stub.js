// Full stub implementation of cloudflare:sockets
// This provides a complete mock to prevent build errors

// Create an EventEmitter-like interface
class EventEmitter {
  constructor() {
    this._events = {};
  }
  
  on(event, listener) {
    if (!this._events[event]) this._events[event] = [];
    this._events[event].push(listener);
    return this;
  }
  
  once(event, listener) {
    const onceWrapper = (...args) => {
      listener(...args);
      this.removeListener(event, onceWrapper);
    };
    return this.on(event, onceWrapper);
  }
  
  emit(event, ...args) {
    const listeners = this._events[event];
    if (!listeners) return false;
    listeners.forEach(listener => listener(...args));
    return true;
  }
  
  removeListener(event, listener) {
    if (!this._events[event]) return this;
    this._events[event] = this._events[event].filter(l => l !== listener);
    return this;
  }
  
  removeAllListeners(event) {
    if (event) {
      delete this._events[event];
    } else {
      this._events = {};
    }
    return this;
  }
}

// Create a Socket class that mimics the behavior of a TCP socket
class Socket extends EventEmitter {
  constructor() {
    super();
    this.destroyed = false;
    this.readable = true;
    this.writable = true;
    this.pending = false;
    this.connecting = false;
    this.localAddress = '127.0.0.1';
    this.localPort = 0;
    this.remoteAddress = '';
    this.remotePort = 0;
    this.remoteFamily = 'IPv4';
  }
  
  connect(options, connectListener) {
    if (connectListener) {
      this.once('connect', connectListener);
    }
    
    // Simulate connection asynchronously
    setTimeout(() => {
      if (options.host) {
        this.remoteAddress = options.host;
      }
      if (options.port) {
        this.remotePort = options.port;
      }
      this.emit('connect');
      this.connecting = false;
    }, 0);
    
    this.connecting = true;
    return this;
  }
  
  write(data, encoding, callback) {
    if (typeof encoding === 'function') {
      callback = encoding;
      encoding = null;
    }
    
    if (callback) {
      callback();
    }
    
    return true;
  }
  
  end(data, encoding, callback) {
    if (data) {
      this.write(data, encoding);
    }
    
    this.writable = false;
    this.emit('end');
    
    if (callback) {
      callback();
    }
    
    return this;
  }
  
  destroy(error) {
    if (this.destroyed) return this;
    this.destroyed = true;
    this.readable = false;
    this.writable = false;
    
    if (error) {
      this.emit('error', error);
    }
    
    this.emit('close', !!error);
    return this;
  }
  
  // Additional socket methods
  pause() { return this; }
  resume() { return this; }
  setTimeout(timeout, callback) { 
    if (callback) this.once('timeout', callback);
    return this; 
  }
  setNoDelay(noDelay) { return this; }
  setKeepAlive(enable, initialDelay) { return this; }
  address() { 
    return { 
      port: this.localPort,
      family: 'IPv4',
      address: this.localAddress
    }; 
  }
}

// Export the socket connect function as the main module export
module.exports = {
  // Main connect function used by pg-cloudflare
  connect: (options, callback) => {
    const socket = new Socket();
    
    if (typeof options === 'object') {
      socket.connect(options);
    }
    
    if (typeof callback === 'function') {
      // The callback expects (err, socket)
      process.nextTick(() => {
        callback(null, socket);
      });
    }
    
    return socket;
  },
  
  // Export the Socket class for direct usage
  Socket
}; 