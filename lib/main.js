var config = require('./config'),
    errorHandler = require('./errorHandler')

var zmq = require('zmq'),
    WebSocketServer = require('ws').Server

var connectionsManager = require('./connectionsManager')

var run = function () {

  var wsServer = new WebSocketServer({port: config.ws.port})
  var zmqPullSock = zmq.socket('pull')
  connectionsManager.init()

  zmqPullSock.connect(config.zmq.host+':'+config.zmq.port)

  zmqPullSock.on('message', function (msg) {
    var payload = JSON.parse(msg)

    if(Object.prototype.toString.call(payload) === ['object Object'])
      connectionsManager.distribute(payload)
  })

  wsServer.on('connection', function (ws) {
    connectionsManager.handleNewConnection(ws);
  })

}

exports.run = run