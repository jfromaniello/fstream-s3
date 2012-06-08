require "should"
require "coffee-script"

{Writer}    = require "../src"
fstream = require('fstream')

#only for testing
path = require "path"
awssum    = require "awssum"
amazon    = awssum.load "amazon/amazon"
S3 = awssum.load("amazon/s3").S3
s3opt = 
    accessKeyId:     process.env['S3_ACCESS_KEY'],  
    secretAccessKey: process.env['S3_SECRET_KEY'], 
    region:          amazon[process.env['S3_TEST_REGION']]
s3 = new S3(s3opt)
tar     = require "tar"


describe "directory writer", () ->
  before (done) ->
    s3.ListObjects {BucketName: process.env['S3_TEST_BUCKET'], Prefix: "test1"}, (err, res) => 
      unless res.Body.ListBucketResult.Contents
        done()
        return

      options = 
        BucketName: process.env['S3_TEST_BUCKET'],
        Objects: (Key for {Key} in res.Body.ListBucketResult.Contents)
      s3.DeleteMultipleObjects options, (er,re) -> done()

  it "can send the fixture folder", (done) ->
    reader = fstream.Reader(path: path.normalize(path.join(__dirname, '../examples/fixture')), type: 'Directory')
    params = 
            accessKeyId:     process.env['S3_ACCESS_KEY'],  
            secretAccessKey: process.env['S3_SECRET_KEY'], 
            bucket:          process.env['S3_TEST_BUCKET'],
            region:          process.env['S3_TEST_REGION'],  
            baseDir:         'test1/'

    writer = new Writer(params)

    reader.on "end", () ->
      s3.ListObjects {BucketName: process.env['S3_TEST_BUCKET'], Prefix: "test1"}, (err, res) => 
        keys = res.Body.ListBucketResult.Contents.map((f) -> f.Key)
        keys.should.includeEql("test1/test.txt")
        keys.should.includeEql("test1/afolder/foobarbaz")
        done()

    reader.pipe(writer)

  it "should set the right content type", (done) ->
    reader = fstream.Reader(path: path.normalize(path.join(__dirname, '../examples/fixture')), type: 'Directory')
    params = 
            accessKeyId:     process.env['S3_ACCESS_KEY'],  
            secretAccessKey: process.env['S3_SECRET_KEY'], 
            bucket:          process.env['S3_TEST_BUCKET'],
            region:          process.env['S3_TEST_REGION'],  
            baseDir:         'test1/'

    writer = new Writer(params)

    reader.on "end", () ->
      s3.GetObjectMetadata {BucketName: process.env['S3_TEST_BUCKET'], ObjectName: "test1/test.txt"}, (err, res) => 
        res.Headers["content-type"].should.eql("text/plain");
        done()

    reader.pipe(writer)

  it "can send from a tared stream", (done) ->
    dirReader = fstream.Reader(path: path.normalize(path.join(__dirname, '../examples/fixture')), type: 'Directory')
    params = 
            accessKeyId:     process.env['S3_ACCESS_KEY'],  
            secretAccessKey: process.env['S3_SECRET_KEY'], 
            bucket:          process.env['S3_TEST_BUCKET'],
            region:          process.env['S3_TEST_REGION'],  
            baseDir:         'test1/'

    writer = new Writer(params)
    tarPacker = tar.Pack()
    tarParser = tar.Parse()

    dirReader.on "end", () ->
      s3.ListObjects {BucketName: process.env['S3_TEST_BUCKET'], Prefix: "test1"}, (err, res) => 
        keys = res.Body.ListBucketResult.Contents.map((f) -> f.Key)
        keys.should.includeEql("test1/test.txt")
        keys.should.includeEql("test1/afolder/foobarbaz")
        done()

    dirReader
        .pipe(tarPacker)
        .pipe(tarParser)
        .pipe(writer)

