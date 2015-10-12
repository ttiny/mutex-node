var ChildProcess = require( 'child_process' );
var Os = require( 'os' );
var Fs = require( 'fs' );

function startChildren ( test ) {
	var p1 = ChildProcess.fork( __dirname + '/child.js' );
	p1.on( 'error', function ( err ) {
		test( !err );
	} );
	p1.on( 'exit', function ( code ) {
		test.eq( code, 0 );
	} );

	var p2 = ChildProcess.fork( __dirname + '/child.js' );
	p2.on( 'error', function ( err ) {
		test( !err );
	} );
	p2.on( 'exit', function ( code ) {
		test.eq( code, 0 );
		test.out();
	} );

	return [ p1, p2 ];
}

UnitestA( 'Mutex proper unlock', function ( test ) {
	console.log( '-----' );
	var p = startChildren( test );
	var lock = 0;
	p[ 0 ].send( 'lock' );
	p[ 0 ].on( 'message', function ( m ) {
		console.log( 'p1', m );
		if ( m === 'locked' ) {
			test( Fs.existsSync( Os.tmpdir() + '/test.mutex' ) );
			p[ 1 ].send( 'lock' );
		}
		else if ( m == 'unlocked' ) {
			test( !Fs.existsSync( Os.tmpdir() + '/test.mutex' ) );
			p[ 0 ].send( 'exit' );
			p[ 1 ].send( 'exit' );
		}
	} );
	p[ 1 ].on( 'message', function ( m ) {
		console.log( 'p2', m );
		if ( m == 'lock_failed' ) {
			p[ 0 ].send( 'unlock' );
		}
	} );
} );

UnitestA( 'Mutex no proper unlock', function ( test ) {
	console.log( '-----' );
	var p = startChildren( test );
	var lock = 0;
	p[ 0 ].send( 'lock' );
	p[ 0 ].on( 'message', function ( m ) {
		console.log( 'p1', m );
		if ( m === 'locked' ) {
			test( Fs.existsSync( Os.tmpdir() + '/test.mutex' ) );
			p[ 1 ].send( 'lock' );
		}
	} );
	p[ 0 ].on( 'exit', function () {
		test( Fs.existsSync( Os.tmpdir() + '/test.mutex' ) );
		p[ 1 ].send( 'lock' );
	} );
	p[ 1 ].on( 'message', function ( m ) {
		console.log( 'p2', m );
		if ( m == 'lock_failed' ) {
			p[ 0 ].send( 'exit' );
		}
		else if ( m == 'locked' ) {
			test( Fs.existsSync( Os.tmpdir() + '/test.mutex' ) );
			p[ 1 ].send( 'unlock' );
		}
		else if ( m == 'unlocked' ) {
			test( !Fs.existsSync( Os.tmpdir() + '/test.mutex' ) );
			p[ 1 ].send( 'exit' );
		}
	} );
} );


UnitestA( 'Mutex.waitLock', function ( test ) {
	console.log( '-----' );
	var p = startChildren( test );
	var lock = 0;
	p[ 0 ].send( 'lock' );
	p[ 0 ].on( 'message', function ( m ) {
		console.log( 'p1', m );
		if ( m === 'locked' ) {
			test( Fs.existsSync( Os.tmpdir() + '/test.mutex' ) );
			p[ 1 ].send( 'wait_lock' );
			console.log( 'waiting 1s to release the lock' );
			setTimeout( function () {
				p[ 0 ].send( 'unlock' );
			}, 1000 );
		}
		else if ( m == 'unlocked' ) {
			test( !Fs.existsSync( Os.tmpdir() + '/test.mutex' ) );
			p[ 0 ].send( 'exit' );
		}
	} );
	p[ 1 ].on( 'message', function ( m ) {
		console.log( 'p2', m );
		if ( m == 'locked' ) {
			p[ 1 ].send( 'unlock' );
		}
		else if ( m == 'unlocked' ) {
			p[ 1 ].send( 'exit' );
		}
	} );
} );


UnitestA( 'Mutex proper unlock async', function ( test ) {
	console.log( '-----' );
	var p = startChildren( test );
	var lock = 0;
	p[ 0 ].send( 'lock_async' );
	p[ 0 ].on( 'message', function ( m ) {
		console.log( 'p1', m );
		if ( m === 'locked' ) {
			test( Fs.existsSync( Os.tmpdir() + '/test.mutex' ) );
			p[ 1 ].send( 'lock_async' );
		}
		else if ( m == 'unlocked' ) {
			test( !Fs.existsSync( Os.tmpdir() + '/test.mutex' ) );
			p[ 0 ].send( 'exit' );
			p[ 1 ].send( 'exit' );
		}
	} );
	p[ 1 ].on( 'message', function ( m ) {
		console.log( 'p2', m );
		if ( m == 'lock_failed' ) {
			p[ 0 ].send( 'unlock_async' );
		}
	} );
} );


UnitestA( 'Mutex.waitLock async', function ( test ) {
	console.log( '-----' );
	var p = startChildren( test );
	var lock = 0;
	p[ 0 ].send( 'lock_async' );
	p[ 0 ].on( 'message', function ( m ) {
		console.log( 'p1', m );
		if ( m === 'locked' ) {
			test( Fs.existsSync( Os.tmpdir() + '/test.mutex' ) );
			p[ 1 ].send( 'wait_lock_async' );
			console.log( 'waiting 1s to release the lock' );
			setTimeout( function () {
				p[ 0 ].send( 'unlock_async' );
			}, 1000 );
		}
		else if ( m == 'unlocked' ) {
			test( !Fs.existsSync( Os.tmpdir() + '/test.mutex' ) );
			p[ 0 ].send( 'exit' );
		}
	} );
	p[ 1 ].on( 'message', function ( m ) {
		console.log( 'p2', m );
		if ( m == 'locked' ) {
			p[ 1 ].send( 'unlock_async' );
		}
		else if ( m == 'unlocked' ) {
			p[ 1 ].send( 'exit' );
		}
	} );
} );