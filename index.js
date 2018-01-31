const http = require('http'),
  concat = require('concat-stream'),
  Router = require('routes-router'),
  ecstatic = require('ecstatic'),
  args = require('minimist')(process.argv, {
    alias:{
      p:'port',
      r:'redis_host',
      v:'verbose'
    },
    default:{
      port:80
    },
    boolean:['verbose']
  })
;

const
  router = Router(),
  fileServer = ecstatic({ root: __dirname + '/client' }),
  RedisServer = require('./server/redis'),
  PostgresServer = require('./server/postgres');

// if any of these are set - then we use the postgres server
const postgresEnvVars = [
  'USE_POSTGRES_PORT',
  'USE_POSTGRES_HOST',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD'
];

var dbDriver = RedisServer;

postgresEnvVars.forEach(function(varName){
  if(process.env[varName]){
    dbDriver = PostgresServer;
  }
});

const db = dbDriver(args);


router.addRoute("/v1/ping", {
  GET: function(req, res){
    res.setHeader('Content-type', 'application/json');
    res.end(JSON.stringify({
      connected: db.connectionStatus()
    }));
  }
});

router.addRoute("/v1/whales", {
  GET: function (req, res) {
    db.get( (err, data) => {
      res.setHeader('Content-type', 'application/json');
      res.end(JSON.stringify(data));
    });
  },
  POST: function (req, res) {
    req.pipe(concat(function(data){
      data = data.toString();
      db.put(data, () => {
        res.end('ok');
      });
    }));
  }
});

router.addRoute("/*", fileServer);

var server = http.createServer(router);

server.listen(args.port, function(){
  console.log('server listening on port: ' + args.port);
});
