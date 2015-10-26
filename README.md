Mutex
=====
Cross-process named mutex for Node.js using file locks (and not redis!).

```sh
npm install https://github.com/Perennials/mutex-node
```

*This is port from <https://github.com/Perennials/providerkit-core-php/blob/master/src/sync/Mutex.php>.*

<!-- MarkdownTOC -->

- [Example](#example)
- [API](#api)
	- [Constructor](#constructor)
	- [.lock()](#lock)
	- [.waitLock()](#waitlock)
	- [.tryLock()](#trylock)
	- [.unlock()](#unlock)
	- [.isLocked()](#islocked)
- [Authors](#authors)

<!-- /MarkdownTOC -->


Example
-------

```js
var Mutex = require( 'Mutex' );

var mutex = new Mutex( 'should_happen_one_at_a_time' );
mutex.lock();
// .. do something and rest assured this is the only process doing it
mutex.unlock();
```

API
---

### Constructor
Constructs a mutex.
- It starts in unlocked state.
- The name you provide goes as a file name with extension `.mutex` in the
  system temporary directory, so don't get too fancy with the name.
- Consider this will only work if the processes that are to mutually exclude each other
  use the same temp dir.
- If `.unlock()` is not properly called the lock file will remain in the temp
  directory, which will not affect future locking, but just leave trash behind.

```js
new Mutex(
	name:String
);
```

### .lock()
Acquires the lock without waiting. Meaning if the lock is busy the function
will fail immediately.

- If the function works in sync or async mode is determined by the presence of
  a callback argument.
- In sync mode the function will throw on errors.
- The lock can not outlive the process life time, even if it is not released.

```js
.lock(
	callback:function( err:Error|null )|undefined
) : Boolean;
```

### .waitLock()
Acquires the lock waiting for it to become available if necessary. This
waiting does not relate to the asyncness of the function.

- If the function works in sync or async mode is determined by the presence of
  a callback argument.
- In sync mode the function may possibly block for very long time until the
  lock becomes available.


```js
.waitLock(
	callback:function( err:Error|null )|undefined
) : Boolean;
```

### .tryLock()
Acquires the lock without waiting and without throwing.

- If the function works in sync or async mode is determined by the presence of
  a callback argument.
- In sync mode the function will not throw but just return false.

```js
.tryLock(
	callback:function( err:Error|null )|undefined
) : Boolean;
```


### .unlock()
Releases the lock.

- If the function works in sync or async mode is determined by the presence of
  a callback argument.
- If this function is not properly called the lock file will remain in the temp
  directory, which will not affect future locking, but just leave trash behind.

```js
.unlock(
	callback:function( err:Error|null )|undefined
) : Boolean;
```

### .isLocked()
Checks if the mutex is locked.

```js
.isLocked() : Boolean;
```

Authors
-------
Borislav Peev (borislav.asdf at gmail dot com)