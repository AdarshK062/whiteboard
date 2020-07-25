$(document).ready(function(){
    $('.add-btn').on('click', function(){
        $('#add-input').click();
    });
    
    $('#add-input').on('change', function(){
        var addInput = $('#add-input');
        if(addInput.val() != ''){
            var formData = new FormData();
            formData.append('upload', addInput[0].files[0]);
            $('#completed').html('File Uploaded Successfully');
            $.ajax({
                url: '/userupload',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(){
                    addInput.val('');
                }
            })
        }
        ShowImage(this);
    });

    $('#profile').on('click', function(){
        var username = $('#username').val();
        var fullname = $('#fullname').val();
        var section = $('#section').val();
        var gender = $('#gender').val();
        var bio = $('#bio').val();
        var userImage = $('#add-input').val();
        var image = $('#user-image').val();
        var isValid = true;
        if(userImage == ''){
            $('#add-input').val(image);
        }

        if(username == '' || fullname == '' || section == '' || gender == '' || bio == '') {
            isValid = false;
            $('#error').html('<div class ="alert alert-danger">You can\'t submit an empty field</div>');
        } 
        else {
            userImage = $('#add-input').val();
            $('#error').html('');
        }

        if(isValid){
            $.ajax({
                url: '/settings/profile',
                type:'POST',
                data: {
                    username: username,
                    fullname: fullname,
                    gender: gender,
                    section: section,
                    bio: bio,
                    upload: userImage
                },
                success: function(){
                    setTimeout(function(){
                        window.Location.reload();
                    },200);
                }
            })
        } 
        else {
            return false;
        }
    });
});

function ShowImage(input){
    if(input.files && input.files[0]){
        var reader = new FileReader();
        reader.onload = function(e) {
            $('#show_img').attr('src', e.target.result);
        }
        reader.readAsDataURL(input.files[0]);
    }
}