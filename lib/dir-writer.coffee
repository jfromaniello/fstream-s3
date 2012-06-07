{Writer}  = require "fstream"
path      = require "path"
awssum    = require 'awssum'
amazon    = awssum.load 'amazon/amazon'
s3Service = awssum.load('amazon/s3').S3

class DirWriter extends Writer 
  constructor: (@params, @relativeTo = "") ->
    @_buffer = []
    s3params =
        accessKeyId: @params.accessKeyId,  
        secretAccessKey: @params.secretAccessKey, 
        region: amazon[@params.region], 
    @s3 = new s3Service(s3params)

  add: (entry) ->
    @_buffer.push(entry)
    relPath = entry.path.substr(-1*(entry.basename.length + @relativeTo.length + 1))

    if entry.type == "Directory"
      newWriter = new DirWriter(@params, relPath)
      entry.pipe(newWriter)
    else
      newObject =
        BucketName: @params.bucket
        ContentLength: entry.props.size
        Body: entry
        ObjectName: path.join(@params.baseDir, relPath)
      @s3.PutObject newObject, 
                    (err, r) -> me.emit "error", err if err

  write: () -> true

  end: () ->
    # omg! what should i do here?!

module.exports = DirWriter