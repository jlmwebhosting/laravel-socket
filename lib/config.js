module.exports = {
  
  artisan: {
    exe : __dirname + '/../../api/artisan',
    cmd : function (cmd, args, options) {
      var str = this.exe + ' ' + cmd
      
      if(args && Object.prototype.toString.call(args) === '[object Array]') {
        str += ' ' + args.join(' ')
      }

      if(options && Object.prototype.toString.call(options) === '[object Object]') {
        str += ' '

        for(prop in options) {
          str += '--'+prop+'=' + options[prop]
        }
      }

      console.log(str, args)

      return str
    }
  },

  zmq: {
    host : 'tcp://127.0.0.1',
    port : 4242
  },

  ws: {
    port: 8080
  },

  logs: {
    identityErrors: __dirname + '/../logs/identityCmdErrors'
  }
}