var config = require('./config')
var fs = require('fs')

var makeErrorMsg = function (err, stderr) {
  var str = '-------------------------------------------------------\r\n'
  str += (new Date).toString() + '\r\n'

  if(err)
    str += JSON.stringify(err) + '\r\n\r\n'
  
  if(stderr)
    str += stderr + '\r\n\r\n'

  str += '-------------------------------------------------------\r\n\r\n'

  return str
}

var createFile = function (file, callback) {
  fs.open(file, 'w')
}

var writeStrToFile = function (str, file, callback) {
  var write = function () {
    if(Object.prototype.toString.call(callback) === '[object Function]') {
      fs.appendFile(file, str, {encoding: 'utf8', mode: 438, flag: 'a'}, callback)
    } else {
      fs.appendFile(file, str)
    }
  }

  var op = function (exists) {
    exists ? write() : createFile(file, op(true))
  }

  fs.exists(file, op)
}

var handleIdentityCmdError = function (err, stderr, callback) {
  var msg = makeErrorMsg(err, stderr)
  
  writeStrToFile(msg, config.logs.identityErrors)
}

exports.handleIdentityCmdError = handleIdentityCmdError