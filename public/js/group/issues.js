$(document).ready(function(){
    var socket = io();
    var room= $('#issueName').val();
    var sender= $('#name-user').val();
    var userPic = $('#name-image').val();
    $("#mydiv3").scrollTop($("#mydiv3")[0].scrollHeight);
    $("#mydiv4").scrollTop($("#mydiv4")[0].scrollHeight);
    socket.on('connect',function(){
        var params = {
            room: room,
            name: sender
        }
        socket.emit('join',params, function(){
            console.log('User joined a channel');
        });
    });

    socket.on('newSolution', function(data){
        console.log(data);
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
        $("#mydiv3").scrollTop($("#mydiv3")[0].scrollHeight);
        $("#mydiv4").scrollTop($("#mydiv4")[0].scrollHeight);

        socket.emit('createSolution', {
            text: iss,
            room: room,
            from: sender,
            image: userPic,
        }, function(){
            $("#mydiv3").scrollTop($("#mydiv3")[0].scrollHeight);
            $("#mydiv4").scrollTop($("#mydiv4")[0].scrollHeight);
            $('#iss').val('');
        });

        $.ajax({
            url: '/group/issues/'+room,
            type: 'POST',
            data: {
                solution: iss,
                groupName: room
            },
            success: function(){       
                $("#mydiv3").scrollTop($("#mydiv3")[0].scrollHeight);
                $("#mydiv4").scrollTop($("#mydiv4")[0].scrollHeight);
                $('#iss').val('');
            }
        })
    });
});