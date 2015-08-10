import nconf from 'nconf';
import database from './database.json';
import auth from './auth';

nconf
  .argv()
  .env()
  .use('memory');

nconf.set('auth', auth);
nconf.set('api:prefix', 'api');
nconf.set('api:version', 'v1');
nconf.set('db', database);
nconf.set('pagination:perPage', 15);

nconf.defaults({
  'NODE_ENV': 'development'
});

export default nconf;
