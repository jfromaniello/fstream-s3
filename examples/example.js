require('coffee-script');
var Writer = require('../lib').Writer,
    path = require('path'),
    fstream = require('fstream'),
    reader = fstream.Reader({path: path.join(__dirname, 'fixture'), type: 'Directory'});

var params = {
        accessKeyId:     process.env['S3_ACCESS_KEY'],  
        secretAccessKey: process.env['S3_SECRET_KEY'], 
        bucket:          process.env['S3_TEST_BUCKET'],
        region:          process.env['S3_TEST_REGION'],  //an string like US_EAST_1 
        baseDir: 'test1/'
    },
    writer = new Writer(params);


reader.pipe(writer);