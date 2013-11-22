var WebSocket = require('ws')
var ws = new WebSocket('ws://localhost:8080')

ws.on('open', function () {
    console.log('aha')
})

ws.on('error', function (err) {
    console.log(err)
})

ws.on('close', function () {
  console.log('kicked')
})