#!/usr/bin/env python
import BaseHTTPServer
import cStringIO
import httplib
import logging
import shutil
import socket
import SocketServer
import sys
import threading
import time
import urllib2
import urlparse

from select import select
from datetime import datetime


logging.basicConfig(level=logging.WARNING, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", stream=sys.stderr)
try:
    # on windows log additionally to debugview since thats often more helpful to debug problems with the C++ side
    from win32api import OutputDebugString

    class DbgViewHandler(logging.Handler):
        def emit(self, record):
            OutputDebugString("Proxy: %s" % self.format(record))

    dbghandler = DbgViewHandler()
    dbghandler.setFormatter(logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s"))
    logging.getLogger().addHandler(dbghandler)
    logging.getLogger().setLevel(logging.WARNING)
except ImportError:
    pass
#logging.basicConfig(level=logging.DEBUG, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", stream=open("c:\\squish\\proxy.log", "w"))

webproxyhtml = """<html>
    <head>
        <title>Squish/Web Automated Gui Testing</title>
    </head>
    <body>
        <h1>Squish/Web Automated GuiTesting</h1>
        <p>Waiting for start of next testcase...</p>
        <script type="text/javascript">
            function __squish__asyncWaitForLoadUrl()
            {
                // ignoring IE < 7
                var req = new XMLHttpRequest();
                var requestUri = location.protocol + '//' + location.host + '/__squish__waitForLoadUrl__/';
                req.onreadystatechange = function() {
                    // XXX handle 404s?
                    if (req.readyState == 4 && req.status == 200) {
                        //__squish__asyncWaitForLoadUrl();
                        var url = req.responseText;
                        window.location.href = url;
                    }
                    return true;
                }
                req.open('GET', requestUri, true);
                req.send(null);
            }
            __squish__asyncWaitForLoadUrl();
        </script>
    </body>
</html>"""

proxyworkshtml = """<html>
<head><title>Proxy Works</title></head>
<body>
  <h1>Squish/Web HTTP Proxy works</h1>
</body>
</html>"""

class StdOutLogger:
    def __init__(self):
        self.logger = logging.getLogger("StdOut")
    def write(self, s):
        for line in s.rstrip().splitlines():
            self.logger.info(line.rstrip())

class StdErrLogger:
    def __init__(self):
        self.logger = logging.getLogger("StdErr")
    def write(self, s):
        for line in s.rstrip().splitlines():
            self.logger.warning(line.rstrip())

inputHandler = None

# This is a module-level variable to be usable from the tests
RFC822_FORMAT = "%a %d %b %Y %H:%M:%S +0000"

def addCacheHeaders(headers, http_version):
    def getCurrentDateTimeUTCAsRFC822String():
        return datetime.utcnow().strftime(RFC822_FORMAT)
    def getLastModifiedString():
        return getCurrentDateTimeUTCAsRFC822String()
    def getExpiresString():
        return getCurrentDateTimeUTCAsRFC822String()

    if http_version == "HTTP/1.0":
        headers["expires"] = getExpiresString()
        headers["last-modified"] = getLastModifiedString()
    else:
        headers["cache-control"] = "no-store, no-cache, must-revalidate"

def sendCacheHeaders(req_handler):
    headers = {}
    addCacheHeaders(headers, req_handler.request_version)
    for k, v in headers.items():
        req_handler.send_header(k,v)

class IPv4OnlyHttpConnection(httplib.HTTPConnection):
    def __init__(self, host, port=None, strict=None, timeout=socket._GLOBAL_DEFAULT_TIMEOUT):
        httplib.HTTPConnection.__init__(self, host, port, strict, timeout)

    def connect(self):
        msg = "getaddrinfo returns an empty list"
        # Make sure we request only IPv4 socket info, as trying to connect via IPv6 if the
        # receiving side does not listen on IPv6 has an unusual long timeout on Windows
        for info in socket.getaddrinfo(self.host, self.port, socket.AF_INET, socket.SOCK_STREAM):
            af, socktype, proto, name, sa = info
            self.sock = None
            try:
                self.sock = socket.socket(af, socktype, proto)
                if self.timeout is  not socket._GLOBAL_DEFAULT_TIMEOUT:
                    self.sock.settimeout(self.timeout)
                self.sock.connect(sa)
                if hasattr(self, "_tunnel_host") and self._tunnel_host:
                    self._tunnel()
                return
            except socket.error, msg:
                if self.sock is not None:
                    self.sock.close()
        raise socket.error, msg


class ProxyHandler(BaseHTTPServer.BaseHTTPRequestHandler):

    server_version = "Squish Proxy/1.0.0"
    injectJS = ""
    httpConClass = IPv4OnlyHttpConnection
    injectableContentTypes = ["text/html", "text/xhtml"]

    requestInterceptionHandlers = {}

    """
    Class to implement a read() method that stops reading from its source
    stream once a given file length is read
    """
    class StaticLengthFile:
        def __init__(self, realfile, length):
            self.realfile = realfile
            self.length = int(length)
        def read(self, size=None):
            if self.length <= 0:
                return None
            if size is None or size < 0:
                readlen = self.length
                self.length = 0
                return self.realfile.read(self.length)
            readlen = self.length
            if readlen < size:
                size = readlen
            self.length = self.length - size
            return self.realfile.read( size )

    def __init__(self, request, client_address, server):
        self.logger = logging.getLogger("ProxyHandler [%s,%s,%s]" %(request, client_address, server))
        # The __init__ behind this in BaseRequestHandler does the complete handling of the
        # request, so set the logger first
        BaseHTTPServer.BaseHTTPRequestHandler.__init__(self, request, client_address, server)

    def _inject(self, inData):
        return inData + "<script type=\"text/javascript\">%s</script>" % ProxyHandler.injectJS

    def _real_proxy_handling(self, request_path, inject=None):
        self.logger.debug("Handling proxy request: %s, inject: %s" %(request_path, inject[:100]))
        (scm, netloc, path, params, query, fragment) = urlparse.urlparse(request_path, 'http')

        if scm != 'http' or fragment or not netloc:
            self.logger.debug("Not a http request (%s) or having a fragment (%s) or not having a netloc (%s)" %(scm, fragment, netloc))
            self.send_error(400, "bad url %s" % request_path)
            return
        server_conn = ProxyHandler.httpConClass( netloc )
        self.headers['Connection'] = 'close'
        # Need to remove this so we always get a full answer from the server and
        # send this to the client, this will probably break caching on browsers though!
        if "if-modified-since" in self.headers:
            del self.headers["if-modified-since"]
        # Make sure the remote server never sends compressed contents so our injection
        # works. In case this creates a problem at some time in the future, we can think
        # about doing a de-compression and re-compressing after injection
        self.headers["accept-encoding"] = "identity"
        del self.headers['Proxy-Connection']
        txt = None
        if self.rfile and not self.rfile.closed and "content-length" in self.headers:
            txt = ProxyHandler.StaticLengthFile( self.rfile, self.headers["content-length"] )

        self.logger.debug("Forwarding request to real server: %s" %(netloc))

        server_conn.request( self.command, urlparse.urlunparse(('','', path, params, query, '')), txt, dict(self.headers.items()))
        server_response = server_conn.getresponse()
        self.wfile.write("%s %s %s\r\n" %(self.request_version, server_response.status, server_response.reason))

        headers = dict(server_response.getheaders())
        if "connection" in headers:
            del headers["connection"]
        if "transfer-encoding" in headers and headers["transfer-encoding"] == "chunked":
            del headers["transfer-encoding"]
        self.logger.debug("Injecting? %s %s" %(headers, ProxyHandler.injectableContentTypes))
        if inject is not None and \
                ( "content-type" in headers ) and \
                True in (x in headers["content-type"] for x in ProxyHandler.injectableContentTypes):

            self.logger.debug("Injecting JS: %s...%s" % (ProxyHandler.injectJS[:100], ProxyHandler.injectJS[-100:]))

            html = self._inject(server_response.read())
            self.logger.debug("Sending headers: %s" % headers)
            addCacheHeaders(headers, self.request_version)
            headers["content-length"] = str(len(html))
            server_response = cStringIO.StringIO(html)

        self.logger.info("Sending Response to browser")
        for key in headers:
            # Cookies get assembled into a single header field, splittable on comma
            # Luckily the value is going to be percent-encoded, so no comma in there.
            # Unfortunately the 'Cookie' module does not support the httponly flag and
            # the cookielib module requires usage of urllib2-like requests
            # So at the moment this poor-mans-solution is the best we can do.
            if 'set-cookie' == key:
                for cookie in headers[key].split(','):
                    self.send_header('set-cookie', cookie)
            else:
                self.send_header(key,headers[key])
        self.end_headers()
        shutil.copyfileobj(server_response, self.wfile)
        server_conn.close()

    def do_GET(self):
        try:
            self.logger.info("Handling HTTP Request: %s" % self.path)
            requestPath = urlparse.urlparse(self.path, 'http').path

            for hook in ProxyHandler.requestInterceptionHandlers:
                if requestPath.startswith("/%s/" % (hook.keyword, )) or requestPath == ("/"+hook.keyword):
                    self.logger.debug("Found hook for keyword: %s %s" %(hook.keyword, hook))
                    hook(self)
                    break
            else:
                if self.path == "/":
                    self.logger.info("Request is '/': %s" %self.path)
                    self.wfile.write("%s %s %s\r\n" %(self.request_version, "200", "OK"))
                    data = proxyworkshtml
                    # Make sure the browser does not cache the result
                    sendCacheHeaders(self)
                    self.send_header("content-length", str(len(data)))
                    self.send_header("content-type", "text/html")
                    self.end_headers()
                    self.wfile.write(data)
                    self.wfile.close()
                else:
                    self._real_proxy_handling(self.path, ProxyHandler.injectJS)


            self.connection.close()
        except socket.error, e:
            self.logger.exception("Error while handling GET request: %s" % self.path)

    do_HEAD = do_GET
    do_POST = do_GET
    do_PUT  = do_GET
    do_DELETE=do_GET

class ThreadingHTTPServer (SocketServer.ThreadingMixIn,
                           BaseHTTPServer.HTTPServer): pass

class BackgroundHTTPServer(ThreadingHTTPServer):

    def __init__(self,hostAndPort,Handler):
        ThreadingHTTPServer.__init__(self,hostAndPort,Handler)
        self.thread = threading.Thread( target=self.serve_forever, name=str(hostAndPort), )
        self.thread.daemon = True
    def start(self):
        self.thread.start()
    def join(self):
        self.thread.join()

class RequestHandlerDataQueue(object):
    def __init__(self, name):
        self.queue = []
        self.logger = logging.getLogger(name)
        self.queueCond = threading.Condition()
        self.currentRequestHandler = None
        self.currentRequestHandlerLock = threading.Lock()

    def clear(self):
        self.queueCond.acquire()
        self.queue = []
        self.queueCond.notifyAll()
        self.queueCond.release()

    def isEmpty(self):
        self.queueCond.acquire()
        empty = len(self.queue) == 0
        self.queueCond.release()
        return empty

    def prependToQueue(self, data):
        self.queueCond.acquire()
        self.queue.insert(0, data)
        self.queueCond.notifyAll()
        self.queueCond.release()

    def addToQueue(self, data):
        self.queueCond.acquire()
        self.queue.append( data )
        self.queueCond.notifyAll()
        self.queueCond.release()

    def _setCurrentRequestHandler( self, req_handler ):
        with self.currentRequestHandlerLock:
            self.currentRequestHandler = req_handler

    def _isSameRequestHandler( self, req_handler ):
        with self.currentRequestHandlerLock:
            return self.currentRequestHandler == req_handler

    def _queuePop( self ):
        self.queueCond.acquire()
        elem = self.queue.pop()
        self.queueCond.release()
        return elem

    def resetRequestHandler( self, req_handler ):
        with self.currentRequestHandlerLock:
            if self.currentRequestHandler == req_handler:
                self.currentRequestHandler = None

    def getCurrentRequestHandler( self ):
        with self.currentRequestHandlerLock:
            return self.currentRequestHandler

    def getNext( self, req_handler ):
        self._setCurrentRequestHandler( req_handler )
        self.queueCond.acquire()
        while len(self.queue) == 0 and self._isSameRequestHandler( req_handler ):
            self.queueCond.wait(.5)
        self.queueCond.release()

        with self.currentRequestHandlerLock:
            if self.currentRequestHandler == req_handler:
                return self._queuePop()
        return None


class InputHandler():
    INITIAL = 0
    READGLOBALSCRIPT = 1
    READJAVASCRIPT = 2
    READURL = 3
    states = [ INITIAL, READGLOBALSCRIPT, READJAVASCRIPT, READURL ]

    NoAction = -1

    def __init__( self, port, host=None):
        self.port = port
        self.host = host
        self.data = ""
        self.state = [ InputHandler.INITIAL ]
        self.logger = logging.getLogger("InputHandler")
        self.buffer = ""
        self.js = ""
        self.jssnippets = RequestHandlerDataQueue("JS")
        self.urls = RequestHandlerDataQueue("URL")
        self.socket = None
        self.serversocket = None
        self.closed = False

    def _handleConnection( self, sock ):
        self.socket = sock
        self.socket.setblocking( False )
        while not self.closed:
            (r,w,e) = select([self.socket.fileno()],[],[],.5)
            if self.socket.fileno() in r:
                tmp = self.socket.recv(4096)
                self.data += tmp
                if not tmp:
                    self._handleSquishConnectionClose()

            self._parse()

    def close( self ):
        try:
            if self.socket is not None:
                self.socket.close()
        except:
            pass
        try:
            if self.serversocket is not None:
                self.serversocket.close()
        except:
            pass

    def handle( self ):
        if self.host is None:
            self._handleConnection( socket.create_connection(("localhost",self.port)) )
        else:
            self.serversocket = socket.socket()
            self.serversocket.bind( (self.host,self.port) )
            self.serversocket.listen(1)
            while True:
                self.closed = False
                #TODO: Setup some kind of proxyserverrc file so not every machine is allowed to connect?
                try:
                    (conn,addr) = self.serversocket.accept()
                    self.logger.debug("Handling IPC connection from: %s" %(addr,))
                    self._handleConnection( conn )
                    conn.close()
                except socket.error, e:
                    self.logger.exception("Error handling IPC control connection")
                finally:
                    self.logger.debug("waiting for IPC request handler to become none")
                    # Leave request-handlers trying to fetch JS a bit time to empty the queue
                    # this is necessary so we can be sure that the redirect to the start-url really
                    # reaches the browser before clearing the jssnippets
                    # But only wait up to 2 seconds, then completely shut down everything so jssnippets
                    # don't end up in the next test-run.
                    # Only waiting for the request-handler to become None is insufficient since the one
                    # fetching the last js-snippet starts the next wait-for-js request before evaluating
                    # js.
                    count = 0
                    while (self.jssnippets.getCurrentRequestHandler() != None and not self.jssnippets.isEmpty()) or count > 20 :
                        time.sleep(.1)
                        count += 1
                    self.logger.debug("IPC connection closed, clearing snippets and urls")
                    self.jssnippets.clear()
                    self.urls.clear()

    def _handleSquishConnectionClose( self ):
        self.logger.debug("closing connection")
        self.state = [InputHandler.INITIAL]
        self.buffer = ""
        self.js = ""
        ProxyHandler.injectJS = ""
        self.closed = True

    def _handleAction( self, line ):
        if line == "startGenericCode" and self.state[-1] == InputHandler.INITIAL:
            self.logger.debug("Got start Code")
            return InputHandler.READGLOBALSCRIPT
        elif line == "endGenericCode" and self.state[-1] == InputHandler.READGLOBALSCRIPT:
            self.logger.debug("Got end Code")
            ProxyHandler.injectJS = self.js
            self.state.pop()
            return InputHandler.NoAction
        elif line == "startJavaScript" and self.state[-1] in [ InputHandler.INITIAL, InputHandler.READGLOBALSCRIPT ]:
            self.logger.debug("Got start JS")
            return InputHandler.READJAVASCRIPT
        elif line == "endJavaScript" and self.state[-1] == InputHandler.READJAVASCRIPT:
            self.logger.debug("Got end JS")
            if self.state[-2] == InputHandler.READGLOBALSCRIPT:
                self.js += self.buffer
                self.buffer = ""
            else:
                self.jssnippets.addToQueue( self.buffer )
                self.buffer = ""
            self.state.pop()
            return InputHandler.NoAction
        elif line == "close":
            self._handleSquishConnectionClose()
            return InputHandler.NoAction
        elif line == "beginLoadUrl":
            self.logger.debug("Got begin loadUrl")
            return InputHandler.READURL
        elif line == "endLoadUrl":
            self.logger.debug("got url"+self.buffer)
            self.urls.addToQueue(self.buffer)
            self.buffer = ""
            self.state.pop()
            return InputHandler.NoAction
        else:
            return None

    def _parse( self ):
        while "\n" in self.data:
            line = self.data[:self.data.index('\n')+1]
            if len(line.strip()) > 0:
                result = self._handleAction( line.strip() )
                if result is None:
                    self.buffer += line
                elif result in InputHandler.states:
                    self.state.append( result )

            self.data = self.data[len(line):]

class ProxyAction(object):
    def __init__(self, keyword, handler):
        self.keyword = keyword
        self.handler = handler

    def __call__(self, req_handler):
        self.handler(self.keyword, req_handler)


def webhookDirector(keyword, req_handler):
    """Taking an HTTP Request Handler instance as input, it uses the
    given information to forward the request to the Squish
    Webserver. The answer is then sent back to the original client."""
    (scm, netloc, path, params, query, fragment) = urlparse.urlparse(req_handler.path, 'http')

    logger = logging.getLogger("webhookDirector %s" %(req_handler.path))
    logger.debug("Sending request to squish webserver")

    path = path[len(keyword)+1:]
    txt = None
    if req_handler.rfile and not req_handler.rfile.closed and "content-length" in req_handler.headers:
        txt = ProxyHandler.StaticLengthFile( req_handler.rfile, req_handler.headers["content-length"] )

    host, path = path[1:].split('/', 1)
    path = '/' + path
    host = urllib2.unquote(host)

    logger.debug("connecting to Squish webserver url: %s/%s" % (host, path))

    server_conn = ProxyHandler.httpConClass( host )

    logger.debug("Sending data to Squish webserver path: %s params: %s query: %s, headers: %s" % (path, params, query, req_handler.headers))
    server_conn.request( req_handler.command, urlparse.urlunparse(('','', path, params, query, '')),
                         txt, dict(req_handler.headers.items()))
    server_response = server_conn.getresponse()

    logger.debug("Received answer from server: %s %s" %(server_response.status, server_response.reason))

    req_handler.wfile.write("%s %s %s\r\n" % (req_handler.request_version, server_response.status,
                                              server_response.reason))

    headers = dict(server_response.getheaders())
    # Make sure the browser does not cache the result
    addCacheHeaders(headers, req_handler.request_version)
    logger.debug("got response headers: %s" % headers)
    for key in headers:
        req_handler.send_header(key,headers[key])
    req_handler.end_headers()
    shutil.copyfileobj(server_response, req_handler.wfile)
    server_conn.close()
    logger.info("Sent answer from Squish webserver to browser")

def dynamicEvalJSInjector(keyword, req_handler):
    """Taking a HTTP Request Handler instance as input, it sets up
    a communication to send Javascript to the receiving side."""
    global inputHandler
    logger = logging.getLogger("dynamicEvalJSInjector %s" %(req_handler.path))
    try:
        js = inputHandler.jssnippets.getNext( req_handler )
        if js is not None:
            try:
                logger.debug("Sending JS snippet to browser: %s...%s" %(js[:100],js[-100:]))
                req_handler.wfile.write("%s %s %s\r\n" %(req_handler.request_version, "200", "OK"))
                # Make sure the browser does not cache the result
                sendCacheHeaders(req_handler)
                req_handler.send_header("content-length", str(len(js)))
                req_handler.send_header("content-type", "text/javascript")
                req_handler.end_headers()
                logger.debug("sending JS done, closing connection")
                req_handler.wfile.write(js)
                req_handler.wfile.close()
            except:
                logger.exception("Error sending JS, re-injecting")
                # Re-Add the snippet if anything goes wrong during sending
                inputHandler.jssnippets.prependToQueue( js );
        else:
            logger.debug("no JS snippet, sending a 404")
            req_handler.wfile.write("%s %s %s\r\n" %(req_handler.request_version, "404", "Not Found"))
            req_handler.wfile.flush()
            req_handler.wfile.close()
    finally:
        # Make sure we always reset the request handler, otherwise the
        # inputHandler may never accept the next IDE connection
        inputHandler.logger.info("resetting JS snippets handler for next connection")
        inputHandler.jssnippets.resetRequestHandler( req_handler )

def loadUrlInjector(keyword, req_handler):
    """Returns the last-provided url to load into the web-app
    blocks until a url was provided"""
    global inputHandler
    logger = logging.getLogger("loadUrlInjector %s" %(req_handler.path))
    try:
        url = inputHandler.urls.getNext( req_handler )
        if url is not None:
            try:
                logger.debug("Loading URL into browser: %s" % url )
                url = url.strip()
                req_handler.wfile.write("%s %s %s\r\n" %(req_handler.request_version, "200", "OK"))
                # Make sure the browser does not cache the result
                sendCacheHeaders(req_handler)
                req_handler.send_header("content-length", str(len(url)))
                req_handler.send_header("content-type", "text/plain")
                req_handler.end_headers()
                logger.debug("sending url:'"+url+"'")
                req_handler.wfile.write(url)
                req_handler.wfile.close()
            except:
                logging.exception("Error sending URL, reinjecting")
                # When sending the URL failed for some reason, try again next time
                inputHandler.urls.prependToQueue( url );
        else:
            inputHandler.logger.info("no url to load, sending a 404")
            req_handler.wfile.write("%s %s %s\r\n" %(req_handler.request_version, "404", "Not Found"))
            req_handler.wfile.close()
    finally:
        # Make sure we always reset the request handler, otherwise the
        # inputHandler may never accept the next IDE connection
        inputHandler.logger.info("resetting loadURl handler for next connection")
        inputHandler.urls.resetRequestHandler( req_handler )

def deliverTestStartPage(keyword, req_handler):
    logger = logging.getLogger("deliverTestStartPage %s" %(req_handler.path))
    req_handler.wfile.write("%s %s %s\r\n" %(req_handler.request_version, "200", "OK"))
    data = webproxyhtml
    # Make sure the browser does not cache the result
    sendCacheHeaders(req_handler)
    req_handler.send_header("content-length", str(len(data)))
    req_handler.send_header("content-type", "text/html")
    req_handler.end_headers()
    req_handler.wfile.write(data)
    req_handler.wfile.close()

def deliverPacFile(keyword, req_handler):
    pacFileContent = """function FindProxyForURL(url, host)
{
    if( shExpMatch(url, "https://*")) {
        return "DIRECT";
    } else {
        return "PROXY %s:%s";
    }
}"""
    logger = logging.getLogger("deliverTestStartPage %s" %(req_handler.path))
    req_handler.wfile.write("%s %s %s\r\n" %(req_handler.request_version, "200", "OK"))
    data = pacFileContent % (httpServer.server_name, httpServer.server_port)
    sendCacheHeaders(req_handler)
    req_handler.send_header("content-length", str(len(data)))
    req_handler.send_header("content-type", " application/x-ns-proxy-autoconfig")
    req_handler.end_headers()
    req_handler.wfile.write(data)
    req_handler.wfile.close()

if __name__ == '__main__':
    from optparse import OptionParser
    import time
    parser = OptionParser(usage="%prog [-H|--host PROXY_HOST] [-p|--port PROXY_PORT] [-d|--debug] [<hostname> <port>|<listen-port>]",
                          version="%prog 1.0",
                          description="Runs a proxy server for Squish/Web testing on PROXY_HOST:PROXY_PORT. Can either listen "
                          "to incoming control-connections on <listen-port> or can itself connect to a controlling-server "
                          "(Squish/Web webhook) listening on <hostname>/<port>.")
    parser.add_option( "-p", "--port", type="int", dest="proxy_port", default=8000,
                       help="listen as http proxy on port PROXY_PORT [%default]")
    parser.add_option( "-d", "--debug", action="store_true", dest="debug", default=False,
                       help="enable debugging messages [%default]")
    parser.add_option( "-H", "--host", dest="proxy_host", default="",
                       help="bind as http proxy to IP/Hostname PROXY_HOST [%default]")
    (options,args) = parser.parse_args()

    if options.debug:
        logging.getLogger().setLevel(logging.DEBUG)
        logging.getLogger().debug("Debugging enabled")

    # Only override these two here, doing it earlier breaks -h and --version output
    sys.stdout = StdOutLogger()
    sys.stderr = StdErrLogger()

    logging.info("starting background http server on: %s %s" %(options.proxy_host,options.proxy_port))
    httpServer = BackgroundHTTPServer( (options.proxy_host, options.proxy_port,), ProxyHandler )
    ProxyHandler.requestInterceptionHandlers = [ProxyAction("__squish_webhook__", webhookDirector),
                                                ProxyAction("__squish__waitForEval__", dynamicEvalJSInjector),
                                                ProxyAction("__squish__waitForLoadUrl__", loadUrlInjector),
                                                ProxyAction("startsquish", deliverTestStartPage),
                                                ProxyAction("squish.pac", deliverPacFile),]
    try:
        httpServer.start()
        logging.info("Arguments: "+ str(args))
        inputHandler = None
        if len(args) == 1:
            inputHandler = InputHandler( args[0] )
        elif len(args) == 2:
            inputHandler = InputHandler( host=args[0], port=int(args[1]) )
        else:
            inputHandler = InputHandler( host="localhost", port=8001 )
        inputHandler.handle()
    except KeyboardInterrupt, ke:
        logging.info("Received keyboard interrupt, shutting down.")
    finally:
        if inputHandler is not None:
            inputHandler.close()
        httpServer.shutdown()
        httpServer.join()
