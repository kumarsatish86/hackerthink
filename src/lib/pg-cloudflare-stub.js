// Stub implementation for pg-cloudflare
// This prevents the module from trying to use cloudflare:sockets

module.exports = {
  // The isCloudflare function returns false to disable Cloudflare-specific behavior
  isCloudflare: () => false,
  
  // Return a function that returns null for the socket property
  // This causes pg to fall back to normal node sockets
  connect: () => {
    return null;
  }
}; 