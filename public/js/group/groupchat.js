$(document).ready(function(){
    var socket = io();
    $("#mydiv1").scrollTop($("#mydiv1")[0].scrollHeight);
    $("#mydiv2").scrollTop($("#mydiv2")[0].scrollHeight);
    var room= $('#groupName').val();
    var sender= $('#sender').val();
    var userPic = $('#name-image').val();
    socket.on('connect',function(){
        var params = {
            room: room,
            name: sender
        }
        socket.emit('join',params, function(){
            console.log('User joined a channel');
        });
    });

    socket.on('usersList', function(users){
        var ol=$('<ol></ol>');
        for (var i=0;i<users.length;i++){
            ol.append('<p><a id="val" data-toggle="modal" data-target="#myModal">'+users[i]+'</a></p>');
        }

        $(document).on('click','#val', function(){
            $('#name').text('@'+$(this).text());
            $('#receiverName').val($(this).text());
            $('#nameLink').attr("href", "/profile/"+$(this).text());
        });

        $('#numValue').text('('+users.length+')');
        $('#users').html(ol);
    });

    if(!('getContext' in document.createElement('canvas'))){
        alert('Sorry, it looks like your browser does not support canvas!');
        return false;
    }

    var ax,ay;
    var drawingcircle=false;
    var drawingellipse=false;
    var drawingline=false;
    var drawingrect=false;
    var textarea=false;
    var textdrawing=false;
    var colorSelected;
    var lineWidthSelected;
    var SelectedFontFamily;
    var SelectedFontSize;
    var textEntered;
    var touch=false;
    var doc = $(document);
    var win = $(window);
    var canvas = $('#paper');
    var ctx = canvas[0].getContext('2d');
    var instructions = $('#instructions');
    var id = Math.round($.now()*Math.random());
    window.addEventListener('resize', onResize, false);
    onResize();

    // A flag for drawing activity
    var drawing = false;
    var clients = {};
    var cursors = {};
    ctx.fillStyle="#fff";
    ctx.fillRect(0,0,1490,400);
    colorSelected = $("#colour-picker").val();
    $("#colour-picker").change(function(){
        colorSelected = $("#colour-picker").val();
    });
    
    /*navigator.getMedia = ( navigator.getUserMedia || 
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia);

    var video;
    var webcamStream;
    $("#start").click(function(){
        navigator.getMedia(
            { 
            video: true, 
            audio: false 
            },
            function(localMediaStream) {
                video = document.querySelector('video');
                webcamStream = localMediaStream;
                video.srcObject=localMediaStream;
            if (navigator.mozGetUserMedia) { 
                video.mozSrcObject = localMediaStream;
            } else {
                video.srcObject=localMediaStream;
            }
            video.play();
            },
            function(err) {
            console.log("An error occured! " + err);
            }
        ); 
        }, false); 

    function stopWebcam() {
        webcamStream.getTracks().forEach(function (track) {track.stop();});
    }*/
    
    navigator.getUserMedia = ( navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia);

    var video;
    var webcamStream;
    $("#start").click(function(){
        if (navigator.getUserMedia) {
            navigator.getUserMedia (
                {video: true, audio: false},

                function(localMediaStream) {
                    video = document.querySelector('video');
                    video.srcObject=localMediaStream;
                    webcamStream = localMediaStream;
                },
            
                function(err) {
                    console.log(err);
                }
            );
        } 
        else {
            console.log("getUserMedia is not supported");
        }  
    });
    
    function stopWebcam() {
        webcamStream.getTracks().forEach(function (track) {track.stop();});
    }

    socket.on("paintpic", function(info) {
        if (info.image) {
            var img = new Image();
            img.src = info.buffer;
            img.onload = function() {
                ctx.drawImage(img, 0, 0);
            }
        }
    }); 

    $("#snap").click(function(){
        ctx.drawImage(video,0,0, 500, 400);
        stopWebcam();
        var buffer;
        window.setTimeout(function() {
            buffer = canvas[0].toDataURL();
            socket.emit('picdraw', { image: true, buffer: buffer.toString('base64') });
        }, 2000);
    });

    //Choose line Width
    lineWidthSelected = $("#line-Width").val();
    

    $("#paint_file").change(function(){
        var files = event.target.files;
        if(files.length === 0){return;}
        var file = files[0];
        if(file.type !== '' && !file.type.match('image.*')){return;}
        var imageURL = window.URL.createObjectURL(file);
        var img = new Image();
        img.src = imageURL;
        img.onload = function() {
            ctx.drawImage(img, 0, 0);
        }
    });

    $("#line-Width").change(function(){
        lineWidthSelected = $("#line-Width").val();
    });

    textEntered = $("#text").val();
    $("#text").change(function(){
        textEntered = $("#text").val();
    });
    
    //SelectedFontFamily
    SelectedFontFamily = $("#draw-text-font-family").val();
    $("#draw-text-font-family").change(function(){
        SelectedFontFamily = $("#draw-text-font-family").val();
    });
        
    //SelectedFontSize
    SelectedFontSize = $("#draw-text-font-size").val();
    
    $("#draw-text-font-family").change(function(){
        SelectedFontSize = $("#draw-text-font-size").val();
    });

    $("#rect-button").click(function(){
        drawingrect=true;
        drawing=false;
    });
    
     $("#circle-button").click(function(){
        drawingcircle=true;
        drawing=false;
    });
    
    $("#ellipse-button").click(function(){
        drawingellipse=true;
        drawing=false;
    });
    
    $("#line-button").click(function(){
        drawingline=true;
        drawing=false;
    });
    
    $("#clearcanv").click(function (){
        ctx.fillStyle="#fff";
        ctx.fillRect(0,0,1490,400);
    });

    $("#text-button").click(function(e){
        textarea=true;
        textdrawing=true;
        SelectedFontSize = $("#draw-text-font-size").val();
        SelectedFontFamily = $("#draw-text-font-family").val();
        textEntered = $("#text").val();
    });
    
    $("#eraser").click(function(){
        colorSelected="fff";
    });
    
    $("#pencil-button").click(function(){
        colorSelected=$("#colour-picker").val();
    });

    socket.on('moving', function (data) {
        if(! (data.id in clients)){
            // a new user has come online. create a cursor for them
            cursors[data.id] = $('<div class="cursor">').appendTo('#cursors');
        }
        // Move the mouse pointer
        cursors[data.id].css({
            'left' : data.x,
            'top' : data.y
        });          
        if(data.drawing && clients[data.id]){
            drawLine(clients[data.id].x, clients[data.id].y, data.x, data.y, data.color, data.lineThickness);
        }
        
        // Saving the current client state
        clients[data.id] = data;
        clients[data.id].updated = $.now();
    });

    canvas[0].addEventListener('touchstart', function (e) {
        e.preventDefault();
        getTouchPos();
        socket.emit('mousemove',{
            'x': touchX,
            'y': touchY,
            'drawing': drawing,
            'color': colorSelected,
            'id': id,
            'lineThickness': lineWidthSelected,
        });	
        lastEmit = $.now();
        ax=touchX;
        ay=touchY;
        drawing = true;
        if(drawingcircle==true||drawingellipse==true||drawingline==true||drawingrect==true){
            drawing=false;
        }
        // Hide the instructions
        instructions.fadeOut();
        if(textarea==true){
            socket.emit('textclick',{
                'x': touchX,
                'y': touchY,
                'id': id,
                'color': colorSelected,                    
                'textdrawing':textdrawing,
                'text':textEntered,
                'fontstyle':SelectedFontFamily,
                'fontsize':SelectedFontSize
            });
            lastEmit = $.now();
        }
        }, false);
        
        canvas[0].addEventListener('touchend', function (e) {
            
        e.preventDefault();
        drawing = false;
        
        if(drawingcircle==true){
            socket.emit('circledraw',{
                'ax':ax,
                'ay':ay,
                'x': touchX,
                'y': touchY,
                'id': id,
                'color': colorSelected,
                'lineThickness': lineWidthSelected,
            });
        }
        else if(drawingellipse==true){
            socket.emit('ellipsedraw',{
                'ax':ax,
                'ay':ay,
                'x': touchX,
                'y': touchY,
                'id': id,
                'color': colorSelected,
                'lineThickness': lineWidthSelected,
            });
        }
        else if(drawingline==true){
            socket.emit('linedraw',{
                'ax':ax,
                'ay':ay,
                'x': touchX,
                'y': touchY,
                'id': id,
                'color': colorSelected,
                'lineThickness': lineWidthSelected,
            });
        }
        else if(drawingrect==true){
            socket.emit('rectdraw',{
                'ax':ax,
                'ay':ay,
                'x': touchX,
                'y': touchY,
                'id': id,
                'color': colorSelected,
                'lineThickness': lineWidthSelected,
            });
        }
        }, false);
        
        canvas[0].addEventListener('touchmove', function (e) {
        e.preventDefault();
        if(jQuery.now() - lastEmit > 30){
            getTouchPos();
                    
                    //drawLine(prev.x, prev.y, touchX, touchY);
                    
                socket.emit('mousemove',{
                        'x': touchX,
                        'y': touchY,
                        'drawing': drawing,
                        'color': colorSelected,
                        'id': id,
                        'lineThickness': lineWidthSelected,
                    });		
                    lastEmit = jQuery.now();		
                }
        
        }, false);
    
        
    socket.on('textdraw', function(data){
        cursors[data.id].css({
            'left' : data.x,
            'top' : data.y
        });          
        if(data.textdrawing){
        drawText(clients[data.id].x, clients[data.id].y, data.color, data.text, data.fontstyle, data.fontsize);
        }
        // Saving the current client state
        clients[data.id] = data;
        clients[data.id].updated = $.now();
    });

    socket.on('circledrawing', function(data){
        cursors[data.id].css({
            'left' : data.x,
            'top' : data.y
        });          
        drawCircle(data.ax, data.ay, data.x, data.y, data.color, data.lineThickness);
        clients[data.id] = data;
        clients[data.id].updated = $.now();
        drawingcircle=false;
    });

    socket.on('linedrawing', function(data){
        cursors[data.id].css({
            'left' : data.x,
            'top' : data.y
        });          
        drawLine(data.ax, data.ay, data.x, data.y, data.color, data.lineThickness);
        clients[data.id] = data;
        clients[data.id].updated = $.now();
        drawingline=false;
    });

    socket.on('ellipsedrawing', function(data){
        cursors[data.id].css({
            'left' : data.x,
            'top' : data.y
        });          
        drawEllipse(data.ax, data.ay, data.x, data.y, data.color, data.lineThickness);
        clients[data.id] = data;
        clients[data.id].updated = $.now();
        drawingellipse=false;
    });

    socket.on('rectdrawing', function(data){
        cursors[data.id].css({
            'left' : data.x,
            'top' : data.y
        });          
        drawRect(data.ax, data.ay, data.x, data.y, data.color, data.lineThickness);
        clients[data.id] = data;
        clients[data.id].updated = $.now();
        drawingrect=false;
    });
    
    var prev = {};

    canvas.on('mousedown',function(e){
        e.preventDefault();
        drawing = true;
        prev.x = e.pageX;
        prev.y = e.pageY;
        ax=e.pageX-13;
        ay=e.pageY-209;
        if(drawingcircle==true||drawingellipse==true||drawingline==true||drawingrect==true){
            drawing=false;
        }
        // Hide the instructions
        instructions.fadeOut();
        if(textarea==true){
            socket.emit('textclick',{
                'x': e.pageX-13,
                'y': e.pageY-209,
                'id': id,
                'color': colorSelected,                    
                'textdrawing':textdrawing,
                'text':textEntered,
                'fontstyle':SelectedFontFamily,
                'fontsize':SelectedFontSize
            });
        }
    });

    canvas.on('mouseup', function(e){
        if(drawingcircle==true){
            socket.emit('circledraw',{
                'ax':ax,
                'ay':ay,
                'x': e.pageX-13,
                'y': e.pageY-209,
                'id': id,
                'color': colorSelected,
                'lineThickness': lineWidthSelected,
            });
        }
        else if(drawingellipse==true){
            socket.emit('ellipsedraw',{
                'ax':ax,
                'ay':ay,
                'x': e.pageX-13,
                'y': e.pageY-209,
                'id': id,
                'color': colorSelected,
                'lineThickness': lineWidthSelected,
            });
        }
        else if(drawingline==true){
            socket.emit('linedraw',{
                'ax':ax,
                'ay':ay,
                'x': e.pageX-13,
                'y': e.pageY-209,
                'id': id,
                'color': colorSelected,
                'lineThickness': lineWidthSelected,
            });
        }
        else if(drawingrect==true){
            socket.emit('rectdraw',{
                'ax':ax,
                'ay':ay,
                'x': e.pageX-13,
                'y': e.pageY-209,
                'id': id,
                'color': colorSelected,
                'lineThickness': lineWidthSelected,
            });
        }
    });

    doc.bind('mouseup mouseleave',function(){
        drawing = false;
        textdrawing=false;
    });
    
    var lastEmit = $.now();

    doc.on('mousemove',function(e){
        if($.now() - lastEmit > 30){
            socket.emit('mousemove',{
                'x': e.pageX-13,
                'y': e.pageY-209,
                'drawing': drawing,
                'id': id,
                'color': colorSelected,
                'lineThickness': lineWidthSelected,
            });
            lastEmit = $.now();
        }
    });
    setInterval(function(){
        for(ident in clients){
            if($.now() - clients[ident].updated > 10000){
                cursors[ident].remove();
                delete clients[ident];
                delete cursors[ident];
            }
        }
    },10000);

    function drawLine(fromx, fromy, tox, toy, color, linewidth){
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(fromx, fromy);
        ctx.lineTo(tox, toy);
        if(color)
            ctx.strokeStyle = "#"+color;
        else
            ctx.strokeStyle = "#"+colorSelected; 
        if(linewidth)
            ctx.lineWidth = linewidth;
        else
            ctx.lineWidth = lineWidthSelected;
        ctx.stroke();
        ctx.save();
    }

    function drawText(fromx, fromy, color, text, fontstyle, fontsize){
        ctx.save();
        ctx.font = fontsize + "px " + fontstyle;
        ctx.textBaseline = 'top';
        ctx.fillStyle = "#"+color;
        ctx.fillText(text, fromx, fromy);
        $("#text").val('');
        ctx.save();
    }

    function drawRect(min_x, min_y, abs_x, abs_y, color, linewidth){
        ctx.save();
        if(color)
            ctx.strokeStyle = "#"+color;
        else
            ctx.strokeStyle = "#"+colorSelected; 
        if(linewidth)
            ctx.lineWidth = linewidth+'px';
        else
            ctx.lineWidth = lineWidthSelected+'px';
        ctx.rect(min_x, min_y, abs_x-min_x, abs_y-min_y);
        ctx.stroke();
        ctx.save();
    }

    //New Circle Function
    function drawCircle(x1, y1, x2, y2, color, linewidth){
        ctx.save();
        var x = (x2 + x1) / 2;
        var y = (y2 + y1) / 2;
        var radius = Math.max(
            Math.abs(x2 - x1),
            Math.abs(y2 - y1)
        ) / 2;  
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI*2, false);
        ctx.closePath();
        if(color)
            ctx.strokeStyle = "#"+color;
        else
            ctx.strokeStyle = "#"+colorSelected; 
        if(linewidth)
            ctx.lineWidth = linewidth+'px';
        else
            ctx.lineWidth = lineWidthSelected+'px';  
        ctx.stroke();  
        ctx.save();
    }

    function drawEllipse(x, y, x1, y1, color, linewidth, emit){
        ctx.save();
        var ox, oy, xe, ye, xm, ym,w=x1-x,h=y1-y;
        var kappa = .5522848;
        ox = (w / 2) * kappa,
        oy = (h / 2) * kappa,
        xe = x + w,    
        ye = y + h,    
        xm = x + w / 2,
        ym = y + h / 2;
        ctx.moveTo(x, ym);
        ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
        ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
        ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
        ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
        ctx.closePath();
        if(color)
            ctx.strokeStyle = "#"+color;
        else
            ctx.strokeStyle = "#"+colorSelected; 
        if(linewidth)
            ctx.lineWidth = linewidth+'px';
        else
            ctx.lineWidth = lineWidthSelected+'px';  
        ctx.stroke();
        ctx.save();
    }

    function onResize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    function getTouchPos(e) {
        if (!e)
            var e = event;

        if(e.touches) {
            if (e.touches.length == 1) { // Only deal with one finger
                var touch = e.touches[0]; // Get the information for finger #1
                touchX=touch.pageX-touch.target.offsetLeft;
                touchY=touch.pageY-touch.target.offsetTop;
                  //touchX=touch.pageX;
                //touchY=touch.pageY;
            }
        }
    }

    //shift functions
    socket.on('newMessage', function(data){
        var template=$('#message-template').html();
        var message=Mustache.render(template, {
            text: data.text,
            sender: data.from,
            userImage: data.image
        });
        $('#messages').append(message);
    });

    $('#message-form').on('submit', function(e){
        e.preventDefault();
        var msg=$('#msg').val();
        $("#mydiv1").scrollTop($("#mydiv1")[0].scrollHeight);
        $("#mydiv2").scrollTop($("#mydiv2")[0].scrollHeight);
        socket.emit('createMessage', 
            {
            text: msg,
            room: room,
            from: sender,
            userPic: userPic
            }, 
            function(){
                $("#mydiv1").scrollTop($("#mydiv1")[0].scrollHeight);
                $("#mydiv2").scrollTop($("#mydiv2")[0].scrollHeight);
                $('#msg').val('');
            });

        $.ajax({
            url: '/group/'+room,
            type: 'POST',
            data: {
                message: msg,
                groupName: room
            },
            success: function(){
                $("#mydiv1").scrollTop($("#mydiv1")[0].scrollHeight);
                $("#mydiv2").scrollTop($("#mydiv2")[0].scrollHeight);
                $('#msg').val('');
            }
        })
    });

    socket.on('newIssue', function(data){
        var template=$('#issue-template').html();
        var message=Mustache.render(template, {
            text: data.text,
            sender: data.from,
            userImage: data.image
        });
        $('#issues').append(message);
    });

    $('#issue-form').on('submit', function(e){
        e.preventDefault();
        var iss=$('#iss').val();
        $("#mydiv1").scrollTop($("#mydiv1")[0].scrollHeight);
        $("#mydiv2").scrollTop($("#mydiv2")[0].scrollHeight);
        socket.emit('createIssue', 
            {
                text: iss,
                room: room,
                from: sender,
                image: userPic
            }, 
            function(){
                $("#mydiv1").scrollTop($("#mydiv1")[0].scrollHeight);
                $("#mydiv2").scrollTop($("#mydiv2")[0].scrollHeight);
                $('#iss').val('');
            });

        $.ajax({
            url: '/group/'+room,
            type: 'POST',
            data: {
                issue: iss,
                groupName: room
            },
            success: function(){
                $("#mydiv1").scrollTop($("#mydiv1")[0].scrollHeight);
                $("#mydiv2").scrollTop($("#mydiv2")[0].scrollHeight);
                $('#iss').val('');
            }
        })
    });
});