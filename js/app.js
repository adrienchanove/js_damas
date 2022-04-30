document.addEventListener('DOMContentLoaded', function () {
    var app = new Vue({
        el: '#app',
        data: {
            message: 'Hello Vue !'
        }
    });
    var tchat = new Vue({
        el: '#tchat',
        data: {
            messages: [],
        },
    });



    var socket = io();
    var form = document.querySelector('#formChat');
    var input = document.querySelector('#inputChat');
    var messagesEl = document.querySelector('#messages');

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (input.value != '') {
            socket.emit('chat message', input.value);
            input.value = '';
        }
    });

    socket.on('chat message', function (msg) {
        tchat.messages.push(msg);
        setTimeout(() => {messagesEl.scrollTo(0, messagesEl.scrollHeight*2);}, 50);
        
    });
    socket.on('chat information', function (msg) {
        tchat.messages.push(msg);
        setTimeout(() => {messagesEl.scrollTo(0, messagesEl.scrollHeight*2);}, 50);
    });
    socket.on('chat system', function (data) {
        if(data.action == "reload"){
            alert(data.info);
            location.reload();
        }
    });

    let username = prompt("Entrez votre pseudo");
    socket.emit('chat connect', username);


    // Sound CANVAS
    
    let lunched = false;
    var canvas = document.querySelector('#canvas');
    var ctx = canvas.getContext('2d');
    var audio = document.querySelector('#audio');

    audio.addEventListener('play', function () {
        if (!lunched) {
            lunched = true;
            
            var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            var source = audioCtx.createMediaElementSource(audio);
            var analyser = audioCtx.createAnalyser();
            source.connect(analyser);
            analyser.connect(audioCtx.destination);
            // A modifier pour changer le rate de l'analyse
            analyser.fftSize = 1024;
            var bufferLength = analyser.frequencyBinCount;
            var dataArray = new Uint8Array(bufferLength);

            var WIDTH = canvas.width;
            var HEIGHT = canvas.height;

            var barWidth = (WIDTH / bufferLength) * 2.5;
            var barHeight;
            var x = 0;

            function renderFrame() {
                requestAnimationFrame(renderFrame);

                x = 0;

                analyser.getByteFrequencyData(dataArray);

                ctx.fillStyle = 'rgb(0, 0, 0)';
                ctx.fillRect(0, 0, WIDTH, HEIGHT);

                for (var i = 0; i < bufferLength; i++) {
                    barHeight = dataArray[i];

                    var r = barHeight + (25 * (i / bufferLength));
                    var g = 250 * (i / bufferLength);
                    var b = 50;

                    ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
                    ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

                    x += barWidth + 1;
                }
            }

            renderFrame();
        }
    });








});

