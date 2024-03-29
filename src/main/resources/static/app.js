var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }

    var stompClient = null;

    var addPointToCanvas = function (point) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };


    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function (topic) {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);

        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic' + topic, function (eventbody) {
                var pt = JSON.parse(eventbody.body);
                addPointToCanvas(pt);
            });
        });

    };



    return {

        init: function () {
            var can = document.getElementById("canvas");
            if(window.PointerEvent){
                can.addEventListener("pointerdown", function(event){
                    var pt = getMousePosition(event);
                    addPointToCanvas(pt);
                    stompClient.send("/topic/newpoint", {}, JSON.stringify(pt));
                });
            }

            //websocket connection
            connectAndSubscribe();
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            addPointToCanvas(pt);
            stompClient.send("/topic/newpoint", {}, JSON.stringify(pt));
            //publicar el evento
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        },

        connect: function (){
            var can = document.getElementById("canvas");
            var option = document.getElementById("connectionType");

            var drawId = $("#connectionId").val();
            topic = option.value+drawId;

            alert("Connected to: " + topic);
            connectAndSubscribe(topic);
            if(window.PointerEvent){
                can.addEventListener("pointerdown", function(event){
                    var pt = getMousePosition(event);
                    addPointToCanvas(pt);
                    stompClient.send("/topic" + topic, {}, JSON.stringify(pt));
                });
            }
        }
    };
})();