Allows to write an stream of files and direcotire to Amazon S3. 

This library is meant to be used with [fstream](https://github.com/isaacs/fstream/) and it uses [awssum](https://github.com/appsattic/node-awssum) internally.


# Usage

Upload the local directory ```../somelocaldir``` to amazon s3 in the bucket ```buckettt``` and the directory /destination **recursively**.

```js
var Writer = require("fstream-s3").Writer,
	writer = new Writer({
				accessKeyId: "..", 
				secretAccessKey: "..", 
				bucket: "buckettt", 
				region: "...",
				baseDir: "/destination" }),
	reader = fstream.Reader({path: "../somelocaldir", type: 'Directory'});

reader.pipe(writer);

```

# TODO

The writer is very incomplete yet but it does the basic stuff, and there is no reader. Not ready for prime time.
**TESTS***

# License

The MIT License : http://opensource.org/licenses/MIT

Copyright (c) 2011-2012 José F. Romaniello. http://joseoncode.com/

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.