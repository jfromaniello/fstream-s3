var Writer = require("../lib").Writer,  
  fstream = require('fstream'),
  path = require("path"),
  awssum = require("awssum");
  amazon = awssum.load("amazon/amazon"),
  S3 = awssum.load("amazon/s3").S3,
  s3opt = {
    accessKeyId: process.env['S3_ACCESS_KEY'],
    secretAccessKey: process.env['S3_SECRET_KEY'],
    region: amazon[process.env['S3_TEST_REGION']]
  },
  s3 = new S3(s3opt),
  tar = require("tar");

describe("directory writer", function() {

  before(function(done) {
    s3.ListObjects({
      BucketName: process.env['S3_TEST_BUCKET'],
      Prefix: "test1"
    }, function(err, res) {
      
      if (!res.Body.ListBucketResult.Contents) {
        done();
        return;
      }
      
      var options = {
        BucketName: process.env['S3_TEST_BUCKET'],
        Objects: res.Body.ListBucketResult.Contents.map(function(c){
          return c.Key;
        })
      };

      s3.DeleteMultipleObjects(options, function(er, re) {
        done();
      });
    });
  });

  it("can send the fixture folder", function(done) {
    var reader = fstream.Reader({
          path: path.normalize(path.join(__dirname, '../examples/fixture')),
          type: 'Directory'
        }),
        params = {
          accessKeyId: process.env['S3_ACCESS_KEY'],
          secretAccessKey: process.env['S3_SECRET_KEY'],
          bucket: process.env['S3_TEST_BUCKET'],
          region: process.env['S3_TEST_REGION'],
          baseDir: 'test1/'
        },
        writer = new Writer(params);
  
    reader.on("end", function() {
      return s3.ListObjects({
        BucketName: process.env['S3_TEST_BUCKET'],
        Prefix: "test1"
      }, function(err, res) {
        var keys = res.Body.ListBucketResult.Contents.map(function(f) {
          return f.Key;
        });
        keys.should.includeEql("test1/test.txt");
        keys.should.includeEql("test1/afolder/foobarbaz");
        return done();
      });
    });
  
    return reader.pipe(writer);
  });

  it("should set the right content type", function(done) {
    var reader = fstream.Reader({
          path: path.normalize(path.join(__dirname, '../examples/fixture')),
          type: 'Directory'
        }),
        params = {
          accessKeyId: process.env['S3_ACCESS_KEY'],
          secretAccessKey: process.env['S3_SECRET_KEY'],
          bucket: process.env['S3_TEST_BUCKET'],
          region: process.env['S3_TEST_REGION'],
          baseDir: 'test1/'
        },
        writer = new Writer(params);

    reader.on("end", function() {
      return s3.GetObjectMetadata({
        BucketName: process.env['S3_TEST_BUCKET'],
        ObjectName: "test1/test.txt"
      }, function(err, res) {
        res.Headers["content-type"].should.eql("text/plain");
        return done();
      });
    });

    return reader.pipe(writer);
  });

  return it("can send from a tared stream", function(done) {
    var dirReader = fstream.Reader({
          path: path.normalize(path.join(__dirname, '../examples/fixture')),
          type: 'Directory'
        }),
        params = {
          accessKeyId: process.env['S3_ACCESS_KEY'],
          secretAccessKey: process.env['S3_SECRET_KEY'],
          bucket: process.env['S3_TEST_BUCKET'],
          region: process.env['S3_TEST_REGION'],
          baseDir: 'test1/'
        },
        writer = new Writer(params),
        tarPacker = tar.Pack(),
        tarParser = tar.Parse();

    dirReader.on("end", function() {
      return s3.ListObjects({
        BucketName: process.env['S3_TEST_BUCKET'],
        Prefix: "test1"
      }, function(err, res) {
        var keys = res.Body.ListBucketResult.Contents.map(function(f) {
          return f.Key;
        });
        keys.should.includeEql("test1/test.txt");
        keys.should.includeEql("test1/afolder/foobarbaz");
        return done();
      });
    });
    return dirReader.pipe(tarPacker).pipe(tarParser).pipe(writer);
  });

});