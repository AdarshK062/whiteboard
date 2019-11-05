$(document).ready(function(){
    var socket = io();

        if(!('getContext' in document.createElement('canvas'))){
            alert('Sorry, it looks like your browser does not support canvas!');
            return false;
        }
        var tools = {};
        var textarea;
        var colorPicked;
        var lineWidthPicked;
        var SelectedFontFamily;
        var SelectedFontSize;      
        var doc = $(document),
            win = $(window),
            canvas = $('#paper'),
            ctx = canvas[0].getContext('2d'),
            instructions = $('#instructions');
        // Generate an unique ID
        var id = Math.round($.now()*Math.random());
        
        // A flag for drawing activity
        var drawing = false;
    
        var clients = {};
        var cursors = {};
        colorPicked = $("#colour-picker").val();
    
        $("#colour-picker").change(function(){
            colorPicked = $("#colour-picker").val();
        });
        
        //Choose line Width
        lineWidthPicked = $("#line-Width").val();
            
        $("#line-Width").change(function(){
            lineWidthPicked = $("#line-Width").val();
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
            
            // Is the user drawing?
            if(data.drawing && clients[data.id]){
                
                // Draw a line on the canvas. clients[data.id] holds
                // the previous position of this user's mouse pointer
                
                drawLine(clients[data.id].x, clients[data.id].y, data.x, data.y, data.color, data.lineThickness);
            }
            
            // Saving the current client state
            clients[data.id] = data;
            clients[data.id].updated = $.now();
        });
    
        var prev = {};
        
        canvas.on('mousedown',function(e){
            e.preventDefault();
            drawing = true;
            prev.x = e.pageX;
            prev.y = e.pageY;
            
            // Hide the instructions
            instructions.fadeOut();
        });
        
        doc.bind('mouseup mouseleave',function(){
            drawing = false;
        });
    
        var lastEmit = $.now();
    
        doc.on('mousemove',function(e){
            if($.now() - lastEmit > 30){
                socket.emit('mousemove',{
                    'x': e.pageX-12,
                    'y': e.pageY-211,
                    'drawing': drawing,
                    'id': id,
                    'color': colorPicked,
                    'lineThickness': lineWidthPicked
                });
                lastEmit = $.now();
            }
        });

    
        // Remove inactive clients after 10 seconds of inactivity
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
            ctx.moveTo(fromx, fromy);
            ctx.lineTo(tox, toy);
            if(color)
                ctx.strokeStyle = "#"+color;
            else
                ctx.strokeStyle = "#"+colorPicked; 
            if(linewidth)
                ctx.lineWidth = linewidth;
            else
                ctx.lineWidth = lineWidthPicked;
            ctx.stroke();
        }


        //shift functions
    });