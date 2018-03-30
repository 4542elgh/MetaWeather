let
  cors_proxy = require('cors-anywhere'),
  host = process.env.HOST || '127.0.0.1',
  port = process.env.PORT || 8090;


cors_proxy.createServer({
  originWhitelist: [], // Allow all origins
  requireHeader: ['origin', 'x-requested-with'],
  removeHeaders: ['cookie', 'cookie2']
})
  .listen(port, host, function() {
    console.log('Running CORS Anywhere on ' + host + ':' + port);
  });
