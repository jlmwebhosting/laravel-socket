var config = require('./config')
var errorHandler = require('./errorHandler')

var exec = require('child_process').exec

var unauthorizedConnections = [];
var authorizedConnections = {};

var retrieveIdentity = function (apiKey, handler) {
  var cmd = config.artisan.cmd('retrieve-identity', [apiKey])

  exec(cmd, handler)
}

var registerAuthorizedConnection = function (ws, userId) {
  if(! authorizedConnections[userId])
    authorizedConnections[userId] = []

  authorizedConnections[userId].push(ws)

  ws.on('close', function () {
    authorizedConnections[userId] = authorizedConnections[userId].filter(function (el) { return el !== ws })

    authorizedConnections = authorizedConnections.filter(function (conns) { return conns.length > 0 })
  })
}

var handleNewConnection = function (ws) {
  ws.on('message', function (msg) {
    msg = JSON.parse(msg)

    if(Object.prototype.toString.call(msg) !== '[object Object]' || ! msg.apiKey)
      return

    retrieveIdentity(msg.apiKey, function (err, stdout, stderr) {
      if(err) {
        errorHandler.handleIdentityCmdError(err, stderr)
        return
      }

      var userId = parseInt(stdout)

      if(userId > 0) {
        ws.removeAllListeners('message')
        unauthorizedConnections = unauthorizedConnections.filter(function (conn) { return conn === ws })
        registerAuthorizedConnection(ws, userId)
      }
    })
  })

  unauthorizedConnections.push(ws)
}

var flushUnauthorizedConnections = function () {
  if(unauthorizedConnections.length === 0)
    return

  unauthorizedConnections.forEach(function (conn) {
    conn.removeAllListeners()
    conn.close()
  })

  unauthorizedConnections = []
}

var init = function () {
  setInterval(flushUnauthorizedConnections, 5000)
}

var distribute = function (payload) {
  if(Object.prototype.toString.call(payload.user_ids) !== '[object Array]' || payload.user_ids.length === 0)
    return 

  payload.user_ids.forEach(function (id) {
    if(! authorizedConnections[id] || authorizedConnections[id].length > 0)
      return

    var conns = authorizedConnections[id]

    conns.forEach(function (conn) {
      conn.send(JSON.stringify({type: payload.type, data: payload.data}))
    })
  })
}

exports.init = init
exports.handleNewConnection = handleNewConnection
exports.flushUnauthorizedConnections = flushUnauthorizedConnections
exports.distribute = distribute