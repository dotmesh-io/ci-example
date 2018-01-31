const postgres = require('pg');

module.exports = function(opts){

  console.log('using postgres server');
  const port = opts.postgres_port || process.env.USE_POSTGRES_PORT || 5432,
    host = opts.postgres_host || process.env.USE_POSTGRES_HOST || 'postgres',
    user = opts.postgres_user || process.env.POSTGRES_USER || 'flocker',
    password = opts.postgres_password || process.env.POSTGRES_PASSWORD || 'flocker';

  var connectionStatus = false;
  const now = new Date().getTime();

  if(process.env.DELAY_CONNECTION){
    // Wait for WeaveDNS to setup DB hostname.
    while(new Date().getTime() < now + 10000){ /* do nothing */ }
  }

  const conString = 'postgres://' + user + ':' + password + '@' + host + '/postgres' ;
  console.log(conString);

  var
    connectionAttempts = 0,
    client;

  function connectToDatabase(){

    client = new postgres.Client(conString);

    if(connectionAttempts>=10){
      console.error('attempted to connect to Postgres 10 times and failed - giving up');
      process.exit(1);
    }

    console.log('connection to Postgres attempt: ' + connectionAttempts);
    client.connect(function(err) {
      if(err) {
        connectionAttempts++;
        console.error('could not connect to postgres', err);
        console.log('waiting 5 seconds before reconnect');
        setTimeout(connectToDatabase, 5000);
        return;
      }

      // lets check we can do a basic query
      console.log('checking we can do a basic query on the database');
      client.query('SELECT NOW() AS "theTime"', function(err, result) {
        if(err) {
          return console.error('error running query', err);
        }
        console.log('basic query success: ' + result.rows[0].theTime);
        client.query('CREATE TABLE IF NOT EXISTS mywhales (whale text)', function(err, result) {
          if(err) {
            console.log('Error creating whales table:', err);
          } else{
            console.log('success creating whales table - setting connectionStatus to true');
            connectionStatus = true;
          }
        });
      });
    });
  }

  connectToDatabase();

  console.log('-------------------------------------------');
  console.log('have host: ' + host);
  console.log('have port: ' + port);

  return {
    connectionStatus: () => connectionStatus,
    get: (callback) => {
      const select_query = client.query('SELECT * FROM mywhales'),
        array = [];
      select_query.on('row', function(row) {
        console.log('Getting whale "%s"', row.whale);
        array.push(row.whale);
      });

      select_query.on('end', function() {
        console.log('Sending whales "%s"', JSON.stringify(array));
        callback(null, array);
      });

    },
    put: (data, callback) => {
      console.log('Posting whale "%s"', data);
      const insert_stmt = 'INSERT INTO mywhales (whale) VALUES ($1)';

      client.query(insert_stmt, [data], function(err, res) {
        if (err) throw err;
      });
      callback();
    }
  };
};
