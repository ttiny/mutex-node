"use strict";

var Fs = require( 'fs' );
var Const = require( 'constants' );
var FsExt = require( 'fs-ext' );
var Os = require( 'os' );

class Mutex {

	constructor ( name ) {
		var dir = Os.tmpdir();
		this._file = dir + '/' + name + '.mutex';
		this._locked = false;
		this._fd = null;
	}

	lock ( callback ) {
		if ( callback ) {
			return this._lock( false, callback );
		}
		else {
			return this._lockSync( false );
		}
	}

	waitLock ( callback ) {
		if ( callback ) {
			return this._lock( true, callback );
		}
		else {
			return this._lockSync( true );
		}
	}

	tryLock ( callback ) {
		try {
			return this.lock( callback );
		}
		catch ( e ) {
			return false;
		}
	}

	unlock ( callback ) {
		if ( callback ) {
			return this._unlock( callback );
		}
		else {
			return this._unlockSync();
		}
	}

	_lockSync ( block ) {
		
		if ( !this._fd ) {
			this._fd = Fs.openSync( this._file, Const.O_CREAT );
		}
		
		try { FsExt.flockSync( this._fd, 'ex' + (block ? '' : 'nb') ); }
		catch ( e ) {
			
			try { this._unlockSync(); }
			catch ( ee ) {}
			
			throw e;
		}
		
		this._locked = true;
		return true;
	}

	_lock ( block, callback ) {

		if ( block instanceof Function ) {
			callback = block;
			block = false;
		}

		var _this = this;

		function thenLock () {
			FsExt.flock( _this._fd, 'ex' + (block ? '' : 'nb'), function ( err ) {
				if ( err ) {
					_this._unlock( function () {
						callback( err )
					} );
					return;
				}
				_this._locked = true;
				callback( null );
			} );
		}

		if ( !this._fd ) {
			Fs.open( this._file, Const.O_CREAT, function ( err, fd ) {
				if ( err ) {
					callback( err );
					return;
				}
				_this._fd = fd;
				thenLock();	
			} );
		}
		else {
			thenLock();
		}
	}

	_unlockSync () {
		if ( !this._fd ) {
			throw new Error( 'NOT_LOCKED' );
		}
		
		// throw only if the unlock fails. if the fclose fails nobody cares
		var locked = this._locked;
		if ( locked ) {
			FsExt.flockSync( this._fd, 'un' );
		}
		
		try {
			Fs.closeSync( this._fd );
			this._fd = null;
		}
		catch ( e ) {}
		
		if ( locked ) {
			try {
				Fs.unlinkSync( this._file );
			}
			catch ( e ) {}
			
		}
		this._locked = false;
		return true;
	}

	_unlock ( callback ) {
		if ( !this._fd ) {
			callback( new Error( 'NOT_LOCKED' ) );
			return;
		}

		var locked = this._locked;
		var _this = this;

		function thenUnlink () {
			Fs.close( _this._fd, function ( err ) {
				if ( !err ) {
					_this._fd = null;
				}
				if ( locked ) {
					Fs.unlink( _this._file, function () {
						callback( null );
					} );
				}
				else {
					callback( null );
				}
			} );
		}
		
		if ( locked ) {
			FsExt.flock( this._fd, 'un', function ( err ) {
				if ( err ) {
					callback( err );
					return;
				}
				_this._locked = false;
				thenUnlink();
			} );
		}
		else {
			thenUnlink();
		}
	}

}

module.exports = Mutex;