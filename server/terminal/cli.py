"""
A simple command-line interface for Mininet.

The Mininet CLI provides a simple control console which
makes it easy to talk to nodes. For example, the command

mininet> h27 ifconfig

runs 'ifconfig' on host h27.

Having a single console rather than, for example, an xterm for each
node is particularly convenient for networks of any reasonable
size.

The CLI automatically substitutes IP addresses for node names,
so commands like

mininet> h2 ping h3

should work correctly and allow host h2 to ping host h3

Several useful commands are provided, including the ability to
list all nodes ('nodes'), to print out the network topology
('net') and to check connectivity ('pingall', 'pingpair')
and bandwidth ('iperf'.)
"""

from mininet.net import Mininet
from subprocess import call
from cmd import Cmd
from os import isatty
from select import poll, POLLIN
import select
import errno
import sys
import time
import os
import atexit

from mininet.term import runX11
from mininet.util import quietRun

class WSCLI( Cmd ):
    "Simple command-line interface to talk to nodes."

    prompt = 'mininet> '

    def __init__( self, mininet: Mininet, stdin=sys.stdin, script=None, cmdqueue=[],
                  **kwargs ):
        """Start and run interactive or batch mode CLI
           mininet: Mininet network object
           stdin: standard input for CLI
           script: script to run in batch mode"""
        self.mn = mininet
        # Local variable bindings for py command
        self.locals = { 'net': mininet }
        # Attempt to handle input
        self.inPoller = poll()
        self.inPoller.register( stdin )
        self.inputFile = script
        Cmd.__init__( self, stdin=stdin, **kwargs )
        self.cmdqueue= cmdqueue

        if self.inputFile:
            self.do_source( self.inputFile )
            return

        self.initReadline()
        self.run()

    readlineInited = False

    @classmethod
    def initReadline( cls ):
        "Set up history if readline is available"
        # Only set up readline once to prevent multiplying the history file
        if cls.readlineInited:
            return
        cls.readlineInited = True
        try:
            # pylint: disable=import-outside-toplevel
            from readline import ( read_history_file, write_history_file,
                                   set_history_length )
        except ImportError:
            pass
        else:
            history_path = os.path.expanduser( '~/.mininet_history' )
            if os.path.isfile( history_path ):
                read_history_file( history_path )
                set_history_length( 1000 )

            def writeHistory():
                "Write out history file"
                try:
                    write_history_file( history_path )
                except IOError:
                    # Ignore probably spurious IOError
                    pass
            atexit.register( writeHistory )

    def cmdloop(self, intro=None):
        """Repeatedly issue a prompt, accept input, parse an initial prefix
        off the received input, and dispatch to action methods, passing them
        the remainder of the line as argument.

        """

        self.preloop()
        if self.use_rawinput and self.completekey:
            try:
                import readline
                self.old_completer = readline.get_completer()
                readline.set_completer(self.complete)
                readline.parse_and_bind(self.completekey+": complete")
            except ImportError:
                pass
        try:
            if intro is not None:
                self.intro = intro
            if self.intro:
                self.stdout.write(str(self.intro)+"\n")
            stop = None
            while not stop:
                if self.cmdqueue:
                    line = self.cmdqueue.pop(0)

                    line = self.precmd(line)
                    stop = self.onecmd(line)
                    stop = self.postcmd(stop, line)
                time.sleep(0.1)
            self.postloop()
        finally:
            if self.use_rawinput and self.completekey:
                try:
                    import readline
                    readline.set_completer(self.old_completer)
                except ImportError:
                    pass

    def postcmd(self, stop, line):
        self.stdout.write("___STOP___")
        return stop

    def run( self ):
        "Run our cmdloop(), catching KeyboardInterrupt"
        while True:
            try:
                # Make sure no nodes are still waiting
                for node in self.mn.values():
                    while node.waiting:
                        self.stdout.write( 'stopping', node, '\n' )
                        node.sendInt()
                        node.waitOutput()
                # if self.isatty():
                #     quietRun( 'stty echo sane intr ^C' )
                self.cmdloop()
                break
            except KeyboardInterrupt:
                # Output a message - unless it's also interrupted
                # pylint: disable=broad-except
                try:
                    self.stdout.write( '\nInterrupt\n' )
                except Exception:
                    pass
                # pylint: enable=broad-except

    def emptyline( self ):
        "Don't repeat last command when you hit return."
        pass

    def getLocals( self ):
        "Local variable bindings for py command"
        self.locals.update( self.mn )
        return self.locals

    helpStr = (
        'You may also send a command to a node using:\n'
        '  <node> command {args}\n'
        'For example:\n'
        '  mininet> h1 ifconfig\n'
        '\n'
        'The interpreter automatically substitutes IP addresses\n'
        'for node names when a node is the first arg, so commands\n'
        'like\n'
        '  mininet> h2 ping h3\n'
        'should work.\n'
        '\n'
        'Some character-oriented interactive commands require\n'
        'noecho:\n'
        '  mininet> noecho h2 vi foo.py\n'
        'However, starting up an xterm/gterm is generally better:\n'
        '  mininet> xterm h2\n\n'
    )

    def do_help( self, line ):  # pylint: disable=arguments-differ
        "Describe available CLI commands."
        Cmd.do_help( self, line )
        if line == '':
            self.stdout.write( self.helpStr )

    def do_nodes( self, _line ):
        "List all nodes."
        nodes = ' '.join( sorted( self.mn ) )
        self.stdout.write( 'available nodes are: \n%s\n' % nodes )

    def do_ports( self, _line ):
        "display ports and interfaces for each switch"
        out = ""
        for switch in self.mn.switches:
            out +=  '%s ' % switch.name
            for intf in switch.intfList():
                port = switch.ports[ intf ]
                out +=  '%s:%d ' % ( intf, port )
        self.stdout.write(out)

    def do_net( self, _line ):
        "List network connections."
        out = ""            

        for node in self.mn.values():
            out +=  node.name 
            for intf in node.intfList():
                out += ' %s:' % intf
                if intf.link:
                    intfs = [ intf.link.intf1, intf.link.intf2 ]
                    intfs.remove( intf )
                    out += str(intfs[ 0 ])
                else:
                    out +=  ' '
            out +=  '\n'
        self.stdout.write(out)

    def do_sh( self, line ):
        """Run an external shell command
           Usage: sh [cmd args]"""
        assert self  # satisfy pylint and allow override
        self.stdout.write('*** WARNING: no output yet')
        call( line, shell=True )

    # do_py() and do_px() need to catch any exception during eval()/exec()
    # pylint: disable=broad-except

    def do_py( self, line ):
        """Evaluate a Python expression.
           Node names may be used, e.g.: py h1.cmd('ls')"""
        try:
            # pylint: disable=eval-used
            sys.stdout = self.stdout
            result = eval( line, globals(), self.getLocals() )
            sys.stdout = sys.__stdout__
            if result is None:
                return
            elif isinstance( result, str ):
                self.stdout.write( result + '\n' )
            else:
                self.stdout.write( repr( result ) + '\n' )
        except Exception as e:
            self.stdout.write( str( e ) + '\n' )

    # We are in fact using the exec() pseudo-function
    # pylint: disable=exec-used

    def do_px( self, line ):
        """Execute a Python statement.
            Node names may be used, e.g.: px print h1.cmd('ls')"""
        try:
            exec( line, globals(), self.getLocals() )
        except Exception as e:
            self.stdout.write( str( e ) + '\n' )

    # pylint: enable=broad-except,exec-used

    def do_pingall( self, line ):
        "Ping between all hosts."
        loss = self.mn.pingAll( line )
        self.stdout.write(f"Packet loss {int(loss)}%", )

    def do_pingpair( self, _line ):
        "Ping between first two hosts, useful for testing."
        loss = self.mn.pingPair()
        self.stdout.write(f"Packet loss {int(loss)}%")

    def do_pingallfull( self, _line ):
        "Ping between all hosts, returns all ping results."
        pings = self.mn.pingAllFull()
        self.stdout.write(output_pingall(pings))

    def do_pingpairfull( self, _line ):
        "Ping between first two hosts, returns all ping results."
        pings = self.mn.pingPairFull()
        self.stdout.write(output_pingall(pings))

    def do_iperf( self, line ):
        """Simple iperf TCP test between two (optionally specified) hosts.
           Usage: iperf node1 node2"""
        args = line.split()
        if not args:
            self.stdout.write(f'Results: {self.mn.iperf()}')
        elif len(args) == 2:
            hosts = []
            err = False
            for arg in args:
                if arg not in self.mn:
                    err = True
                    self.stdout.write( "node '%s' not in network\n" % arg )
                else:
                    hosts.append( self.mn[ arg ] )
            if not err:
                self.stdout.write(f'Results: {self.mn.iperf( hosts )}')
        else:
            self.stdout.write( 'invalid number of args: iperf src dst\n' )

    def do_iperfudp( self, line ):
        """Simple iperf UDP test between two (optionally specified) hosts.
           Usage: iperfudp bw node1 node2"""
        args = line.split()
        if not args:
            self.stdout.write(f'Results: {self.mn.iperf( l4Type="UDP" )}')
        elif len(args) == 3:
            udpBw = args[ 0 ]
            hosts = []
            err = False
            for arg in args[ 1:3 ]:
                if arg not in self.mn:
                    err = True
                    self.stdout.write( "node '%s' not in network\n" % arg )
                else:
                    hosts.append( self.mn[ arg ] )
            if not err:
                self.stdout.write(f'Results: {self.mn.iperf( hosts, l4Type="UDP", udpBw=udpBw )}')
        else:
            self.stdout.write( 'invalid number of args: iperfudp bw src dst\n' +
                   'bw examples: 10M\n' )

    def do_intfs( self, _line ):
        "List interfaces."
        for node in self.mn.values():
            self.stdout.write( '%s: %s\n' %
                    ( node.name, ','.join( node.intfNames() ) ) )

    def do_dump( self, _line ):
        "Dump node info."
        for node in self.mn.values():
            self.stdout.write( '%s\n' % repr( node ) )

    def do_link( self, line ):
        """Bring link(s) between two nodes up or down.
           Usage: link node1 node2 [up/down]"""
        args = line.split()
        if len(args) != 3:
            self.stdout.write( 'invalid number of args: link end1 end2 [up down]\n' )
        elif args[ 2 ] not in [ 'up', 'down' ]:
            self.stdout.write( 'invalid type: link end1 end2 [up down]\n' )
        else:
            self.mn.configLinkStatus( *args )

    def do_xterm( self, line, term='xterm' ):
        """Spawn xterm(s) for the given node(s).
           Usage: xterm node1 node2 ..."""
        self.stdout.write("*** Not supported yet!")
        # args = line.split()
        # if not args:
        #     self.stdout.write( 'usage: %s node1 node2 ...\n' % term )
        # else:
        #     for arg in args:
        #         if arg not in self.mn:
        #             self.stdout.write( "node '%s' not in network\n" % arg )
        #         else:
        #             node = self.mn[ arg ]
        #             self.mn.terms += makeTerms( [ node ], term = term )

    def do_x( self, line ):
        """Create an X11 tunnel to the given node,
           optionally starting a client.
           Usage: x node [cmd args]"""
        args = line.split()
        if not args:
            self.stdout.write( 'usage: x node [cmd args]...\n' )
        else:
            node = self.mn[ args[ 0 ] ]
            cmd = args[ 1: ]
            self.mn.terms += runX11( node, cmd )

    def do_gterm( self, line ):
        """Spawn gnome-terminal(s) for the given node(s).
           Usage: gterm node1 node2 ..."""
        self.stdout.write("*** Not supported yet!")
        # self.do_xterm( line, term='gterm' )

    def do_exit( self, _line ):
        "Exit"
        assert self  # satisfy pylint and allow override
        return 'exited by user command'

    def do_quit( self, line ):
        "Exit"
        return self.do_exit( line )

    def do_EOF( self, line ):
        "Exit"
        self.stdout.write( '\n' )
        return self.do_exit( line )

    def isatty( self ):
        "Is our standard input a tty?"
        return isatty( self.stdin.fileno() )

    def do_noecho( self, line ):
        """Run an interactive command with echoing turned off.
           Usage: noecho [cmd args]"""
        if self.isatty():
            quietRun( 'stty -echo' )
        self.default( line )
        if self.isatty():
            quietRun( 'stty echo' )

    def do_source( self, line ):
        """Read commands from an input file.
           Usage: source <file>"""
        args = line.split()
        if len(args) != 1:
            self.stdout.write( 'usage: source <file>\n' )
            return
        try:
            self.inputFile = open( args[ 0 ] )
            while True:
                line = self.inputFile.readline()
                if len( line ) > 0:
                    self.onecmd( line )
                else:
                    break
        except IOError:
            self.stdout.write( 'error reading file %s\n' % args[ 0 ] )
        self.inputFile.close()
        self.inputFile = None

    def do_dpctl( self, line ):
        """Run dpctl (or ovs-ofctl) command on all switches.
           Usage: dpctl command [arg1] [arg2] ..."""
        args = line.split()
        if len(args) < 1:
            self.stdout.write( 'usage: dpctl command [arg1] [arg2] ...\n' )
            return
        for sw in self.mn.switches:
            self.stdout.write( '*** ' + sw.name + ' ' + ('-' * 72) + '\n' )
            self.stdout.write( sw.dpctl( *args ) )

    def do_time( self, line ):
        "Measure time taken for any command in Mininet."
        start = time.time()
        self.onecmd(line)
        elapsed = time.time() - start
        self.stdout.write("*** Elapsed time: %0.6f secs\n" % elapsed)

    def do_links( self, _line ):
        "Report on links"
        for link in self.mn.links:
            self.stdout.write( link, link.status(), '\n' )

    def do_switch( self, line ):
        "Starts or stops a switch"
        args = line.split()
        if len(args) != 2:
            self.stdout.write( 'invalid number of args: switch <switch name>'
                   '{start, stop}\n' )
            return
        sw = args[ 0 ]
        command = args[ 1 ]
        if sw not in self.mn or self.mn.get( sw ) not in self.mn.switches:
            self.stdout.write( 'invalid switch: %s\n' % args[ 1 ] )
        else:
            sw = args[ 0 ]
            command = args[ 1 ]
            if command == 'start':
                self.mn.get( sw ).start( self.mn.controllers )
                self.stdout.write('*** Switch started')
            elif command == 'stop':
                self.mn.get( sw ).stop( deleteIntfs=False )
                self.stdout.write('*** Switch Stopped')
            else:
                self.stdout.write( 'invalid command: '
                       'switch <switch name> {start, stop}\n' )

    def do_wait( self, _line ):
        "Wait until all switches have connected to a controller"
        self.mn.waitConnected()

    def default( self, line ):
        """Called on an input line when the command prefix is not recognized.
           Overridden to run shell commands when a node is the first
           CLI argument.  Past the first CLI argument, node names are
           automatically replaced with corresponding IP addrs."""

        first, args, line = self.parseline( line )

        if first in self.mn:
            if not args:
                self.stdout.write( '*** Please enter a command for node: %s <cmd>\n'
                       % first )
                return
            node = self.mn[ first ]
            rest = args.split( ' ' )
            # Substitute IP addresses for node names in command
            # If updateIP() returns None, then use node name
            rest = [ self.mn[ arg ].defaultIntf().updateIP() or arg
                     if arg in self.mn else arg
                     for arg in rest ]
            rest = ' '.join( rest )
            # Run cmd on node:
            node.sendCmd( rest )
            self.waitForNode( node )
        else:
            self.stdout.write( '*** Unknown command: %s\n' % line )

    def waitForNode( self, node ):
        "Wait for a node to finish, and print its output."
        # Pollers
        nodePoller = poll()
        nodePoller.register( node.stdout )
        bothPoller = poll()
        bothPoller.register( self.stdin, POLLIN )
        bothPoller.register( node.stdout, POLLIN )
        if self.isatty():
            # Buffer by character, so that interactive
            # commands sort of work
            quietRun( 'stty -icanon min 1' )
        while True:
            try:
                bothPoller.poll()
                # XXX BL: this doesn't quite do what we want.
                if False and self.inputFile:
                    key = self.inputFile.read( 1 )
                    if key != '':
                        node.write( key )
                    else:
                        self.inputFile = None
                if isReadable( self.inPoller ):
                    key = self.stdin.read( 1 )
                    node.write( key )
                if isReadable( nodePoller ):
                    data = node.monitor()
                    self.stdout.write( data )
                if not node.waiting:
                    break
            except KeyboardInterrupt:
                # There is an at least one race condition here, since
                # it's possible to interrupt ourselves after we've
                # read data but before it has been printed.
                node.sendInt()
            except select.error as e:
                # pylint: disable=unpacking-non-sequence
                # pylint: disable=unbalanced-tuple-unpacking
                errno_, errmsg = e.args
                if errno_ != errno.EINTR:
                    self.stdout.write( "select.error: %s, %s" % (errno_, errmsg) )
                    node.sendInt()

    def precmd( self, line ):
        "allow for comments in the cli"
        if '#' in line:
            line = line.split( '#' )[ 0 ]
        return line


# Helper functions

def isReadable( poller ):
    "Check whether a Poll object has a readable fd."
    for fdmask in poller.poll( 0 ):
        mask = fdmask[ 1 ]
        if mask & POLLIN:
            return True
        return False
    
def output_pingall(pings):
    output = ""
    for ping in pings:
        if len(ping) != 3: continue
        h1 = ping[0]
        h2 = ping[1]
        info = ping[2]

        output += f"""{h1.name}->{h2.name}
packets: {info[0]}/{info[1]}
rtt:
    min: {info[2]} ms
    avg: {info[3]} ms
    max: {info[4]} ms
    mdev: {info[5]}
"""
    return output