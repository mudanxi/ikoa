var co = require('co');
var http = require('http');

function Application() {
  this.context = {};
  this.context['res'] = null;
  this.middleware = [];
}
var app = Application.prototype;

function compose(handlelist,ctx) {

  return co(function * () {
    var prev = null;
    var i = handlelist.length;
    while (i--) {
      prev = handlelist[i].call(ctx, prev);
    }
    yield prev;
  })
}

function *respond(next) {
  console.log("start app....");
  yield next;
  this.res.writeHead(200, {
    'Content-Type': 'text/plain'
  });
  this.res.end(this.body);
}

app.use = function(fn) {
  //this.do = fn;
  this.middleware.push(fn)
}

app.callback = function() {
  var fn = compose.call(this, [respond].concat(this.middleware),this.context);
  var that = this;
  return function(req, res) {
    that.context.res = res;
    fn.call(that.context);
    //respond.call(that.context);
  }
}
app.listen = function() {
  var server = http.createServer(this.callback());
  return server.listen.apply(server, arguments);
};
//调用
var appObj = new Application();
appObj.use(function *(next) {
  this.body = "hello world!";
  yield next;
})
appObj.use(function *(next) {
  this.body += "by me!!";
})
appObj.listen(3000);