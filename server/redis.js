const redis = require('redis');

module.exports = function(opts){

  console.log('using redis server');

  const port = opts.redis_port || process.env.USE_REDIS_PORT || 6379,
    host = opts.redis_host || process.env.USE_REDIS_HOST || 'redis';

  var connectionStatus = false;

  const client = redis.createClient(port, host, {});

  client.on('error', function(err){
    connectionStatus = false;
    console.log('Error from the redis connection:');
    console.log(err);
  });
  client.on('end', function(err){
    connectionStatus = false;
    console.log('Lost connection to Redis server');
  });
  client.on('ready', function(err){
    connectionStatus = true;
    console.log('Connection made to the Redis server');
  });

  console.log('-------------------------------------------');
  console.log('have host: ' + host);
  console.log('have port: ' + port);

  return {
    connectionStatus: () => connectionStatus,
    get: (callback) => client.lrange('whales', 0, -1, callback),
    put: (data, callback) => {
      client.rpush('whales', data, function(){
        client.save(callback);
      });
    }
  };
};
