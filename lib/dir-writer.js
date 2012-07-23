var Writer  = require("fstream").Writer,
  awssum    = require("awssum"),
  amazon    = awssum.load('amazon/amazon'),
  s3Service = awssum.load('amazon/s3').S3,
  path      = require("path"),
  mime      = require('mime');


function DirWriter(params, rel) {
  Object.getPrototypeOf(DirWriter.prototype)
        .constructor.call(this, "/");
  
  // Writer.call(this, "/");

  this.params = params;
  this.rel = rel || "";

  var s3params = {
    accessKeyId: this.params.accessKeyId,
    secretAccessKey: this.params.secretAccessKey,
    region: amazon[this.params.region]
  };

  this.s3 = new s3Service(s3params);
  this._pushing = false;
  this._ended = false;
  this._buffer = [];
}

DirWriter.prototype = Object.create(Writer.prototype);

DirWriter.prototype.add = function(rel, entry) {
  if (!entry) {
    entry = rel;
    rel = "";
  }
  if (entry.type === "Directory") {
    var newRel = entry.path.substr(-1 * ((entry.basename || entry.path).length + this.rel.length + 1));
    entry.pipe(new DirWriter(this.params, newRel));
  } else {
    this._buffer.push(entry);
    this._process();
  }
  return this._buffer.length === 0;
};

DirWriter.prototype._process = function() {
  var me = this;
  if (this._pushing || this._buffer.length === 0) {
    return;
  }
  this._pushing = true;
  
  var entry = this._buffer.shift(),
      relPath = entry.path.substr(-1 * ((entry.basename || entry.path).length + this.rel.length + 1));
  
  this.emit("entry", entry);
  
  var newObject = {
    BucketName: this.params.bucket,
    ContentLength: entry.props.size,
    Body: entry,
    ObjectName: path.join(this.params.baseDir, relPath),
    ContentType: mime.lookup(relPath)
  };

  if (process.platform === "win32") {
    newObject.ObjectName = newObject.ObjectName.replace(/\\/g, "\/");
  }

  entry.on("end", function() {
    me._pushing = false;
    return me._process();
  });

  return this.s3.PutObject(newObject, function(err, r) {
    if (err) {
      return me.emit("error", err);
    } else {
      me._pushing = false;
      entry.resume();
      me.emit("drain");
      return me._process();
    }
  });
};

DirWriter.prototype.write = function() {
  return true;
};

DirWriter.prototype.end = function() {
  if (!this._ended) {
    this._process();
  }
  return this._ended = true;
};

module.exports = DirWriter;