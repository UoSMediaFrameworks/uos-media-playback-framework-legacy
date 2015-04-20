'use strict';
/*jshint browser: true */

var io = require('socket.io-client');



var form = document.getElementById('login-form'),
    login = document.getElementById('login'),
    errors = document.getElementById('errors');

var socket;

function showError (message) {
    var msg = document.createElement('h2');
    msg.innerText = message.toString();
    errors.appendChild(msg);
}

function handleError (func, errorHandler) {
    return function() {
        // error
        if ( arguments[0] ) {
            showError(arguments[0]);
            if ( errorHandler ) {
                errorHandler.call(this, arguments[0]);
            }
        } else {
            var args = Array.prototype.slice.call(arguments, 1);
            func.apply(this, args);
        }
    };
}



form.addEventListener('submit', function(event) {
    event.preventDefault();

    var submitBtn = this.submit,
        form = this;
    submitBtn.disabled = true;
    submitBtn.value = 'Logging in';

    socket = io(process.env.MEDIA_HUB, {forceNew: true});
    socket.on('connect', function() {
        var cleanup = function() {
            submitBtn.disabled = false;
            submitBtn.value = 'Submit';
        };

        socket.emit('auth', {password: form.password.value}, handleError(function(err) {
            form.password.value = '';
            login.style.opacity = 0;
            cleanup();

            socket.emit('register', 'manifest2015');
        }, cleanup));
    });

    socket.on('command', function(data) {
        if (data.name === 'showScenes') {

        } else {
            showError('Recieved unknown command from hub: ' + data.name);
        }
    });
});