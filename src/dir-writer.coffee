{Writer}  = require "fstream"
path      = require "path"
awssum    = require 'awssum'
amazon    = awssum.load 'amazon/amazon'
s3Service = awssum.load('amazon/s3').S3

class DirWriter extends Writer 
  constructor: (@params, @relativeTo = "") ->
    s3params =
        accessKeyId: @params.accessKeyId,  
        secretAccessKey: @params.secretAccessKey, 
        region: amazon[@params.region], 
    @s3 = new s3Service(s3params)
    @_pushing = false
    @_ended = false
    @_buffer = []

  add: (entry) ->
    if entry.type == "Directory"
      entry.pipe(this)
    else
      @_buffer.push(entry)
      @_process()
    return @_buffer.length is 0

  _process: () ->
    if @_pushing or @_buffer.length == 0 
      return

    @_pushing = true
    entry = @_buffer.shift()
    relPath = entry.path.substr(-1*(entry.basename.length + @relativeTo.length + 1))
    @emit "entry", entry

    newObject =
      BucketName: @params.bucket
      ContentLength: entry.props.size
      Body: entry
      ObjectName: path.join(@params.baseDir, relPath)


    @s3.PutObject newObject, (err, r) => 
                                if err
                                  @emit "error", err 
                                else
                                  @_pushing = false
                                  @emit "drain"
                                  @_process()

  write: () -> true

  end: () ->
    unless @_ended
      @_process()
    @_ended = true

module.exports = DirWriter