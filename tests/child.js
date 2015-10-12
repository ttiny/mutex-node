var Mutex = require( '../Mutex.js' );
var m = new Mutex( 'test' );

process.on( 'message', function ( msg ) {

	if ( msg == 'lock' ) {
		try { 
			m.lock();
			process.send( 'locked' );
		}
		catch( e ) {
			process.send( 'lock_failed' );
		}
	}
	else if ( msg == 'lock_async' ) {
		m.lock( function ( err ) {
			if ( err ) {
				process.send( 'lock_failed' );
			}
			else {
				process.send( 'locked' );
			}
			
		} );
	}
	else if ( msg == 'wait_lock' ) {
		try { 
			m.waitLock();
			process.send( 'locked' );
		}
		catch( e ) {
			process.send( 'lock_failed' );
		}
	}
	else if ( msg == 'wait_lock_async' ) {
		m.waitLock( function ( err ) {
			if ( err ) {
				process.send( 'lock_failed' );
			}
			else {
				process.send( 'locked' );
			}
		} );
	}
	else if ( msg == 'unlock' ) {
		m.unlock();
		process.send( 'unlocked' );
	}
	else if ( msg == 'unlock_async' ) {
		m.unlock( function ( err ) {
			if ( err ) {
				process.send( 'unlock_failed' );
			}
			else {
				process.send( 'unlocked' );
			}
		} );
	}
	else if ( msg == 'exit' ) {
		process.exit( 0 );
	}

} );