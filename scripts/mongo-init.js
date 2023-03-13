db.createUser({
  user: 'vidstreamUser',
  pwd: '6yeuWT5FJ3Xc9FvxfcGJcfG625eLLn',
  roles: [{ role: 'readWrite', db: 'vidstream' }]
});

db.createCollection('admins');
db.createCollection('multimedia');
