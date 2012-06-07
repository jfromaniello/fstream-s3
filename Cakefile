{exec} = require 'child_process'

build = (callback) ->
  exec 'mkdir -p lib', (err, stdout, stderr) ->
    throw new Error(err) if err
    exec "coffee --compile --output lib/ src/", (err, stdout, stderr) ->
      throw new Error(err) if err
      callback() if callback

test = (callback) ->
  cp = exec "mocha ./test/* -R spec --compilers coffee:coffee-script --timeout 5000", (err, stdout, stderr) -> callback() if callback
  cp.stdout.pipe(process.stdout)
  cp.stderr.pipe(process.stderr)

task 'build', 'Build lib from src', -> build()
task 'test', 'Run tests', -> test()