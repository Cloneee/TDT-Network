
// Infinite-scroll newsfeed
let pageIndex = 0
let nextIndex = pageIndex + 1
let mssvViewer

var textarea = document.querySelector('textarea');

if (textarea){
    textarea.addEventListener('keydown', autosize);
}
             
function autosize(){
  var el = this;
  setTimeout(function(){
    el.style.cssText = 'height:auto; padding:0';
    // for box-sizing other than "content-box" use:
    // el.style.cssText = '-moz-box-sizing:content-box';
    el.style.cssText = 'height:' + el.scrollHeight + 'px';
  },0);
}

function addNewPost(data, checkType, isAppending){
    if (isAppending){
        switch (checkType){
            case 'img':
                $('#infinite-scroll').append(`
                    <div class="content m-3 p-3 bg-light bg-gradient" name="${data._id}">
                        <div class="d-flex justify-content-between" name="${data._id}-title">
                            <a href='/profile/${data.owner.mssv}'>
                                <h4>${data.owner.fullname}</h4>
                            </a>
                        </div>
                        <p name="${data._id}" class="text-break p-3" >${data.content}</p>
                        <image src="/${data.image}"></image>
                        <p><i>${data.date.toLocaleString()}</i></p>
                    </div>
                `)
                break
            case 'video':
                $('#infinite-scroll').append(`
                    <div class="content m-3 p-3 bg-light bg-gradient" name="${data._id}">
                        <div class="d-flex justify-content-between" name="${data._id}-title">
                            <a href='/profile/${data.owner.mssv}'>
                                <h4>${data.owner.fullname}</h4>
                            </a>
                        </div>
                        <p name="${data._id}" class="text-break p-3" >${data.content}</p>
                        <div class="video-wrapper">
                            <iframe src="https://www.youtube.com/embed/${data.video}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                        </div>
                        <p><i>${data.date.toLocaleString()}</i></p>
                    </div>
                `)
                break
            default:
                $('#infinite-scroll').append(`
                    <div class="content m-3 p-3 bg-light bg-gradient" name="${data._id}">
                        <div class="d-flex justify-content-between" name="${data._id}-title">
                            <a href='/profile/${data.owner.mssv}'>
                                <h4>${data.owner.fullname}</h4>
                            </a>
                        </div>
                        <p name="${data._id}" class="text-break p-3" >${data.content}</p>
                        <p><i>${data.date.toLocaleString()}</i></p>
                    </div>
                `)
                break
        }
    }
    else {
        switch (checkType){
            case 'img':
                $('#infinite-scroll').prepend(`
                    <div class="content m-3 p-3 bg-light bg-gradient" name="${data._id}">
                        <div class="d-flex justify-content-between" name="${data._id}-title">
                            <a href='/profile/${data.owner.mssv}'>
                                <h4>${data.owner.fullname}</h4>
                            </a>
                        </div>
                        <p name="${data._id}" class="text-break p-3" >${data.content}</p>
                        <image src="/${data.image}"></image>
                        <p><i>${data.date.toLocaleString()}</i></p>
                    </div>
                `)
                break
            case 'video':
                $('#infinite-scroll').prepend(`
                    <div class="content m-3 p-3 bg-light bg-gradient" name="${data._id}">
                        <div class="d-flex justify-content-between" name="${data._id}-title">
                            <a href='/profile/${data.owner.mssv}'>
                                <h4>${data.owner.fullname}</h4>
                            </a>
                        </div>
                        <p name="${data._id}" class="text-break p-3" >${data.content}</p>
                        <div class="video-wrapper">
                            <iframe src="https://www.youtube.com/embed/${data.video}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                        </div>
                        <p><i>${data.date.toLocaleString()}</i></p>
                    </div>
                `)
                break
            default:
                $('#infinite-scroll').prepend(`
                    <div class="content m-3 p-3 bg-light bg-gradient" name="${data._id}">
                        <div class="d-flex justify-content-between" name="${data._id}-title">
                            <a href='/profile/${data.owner.mssv}'>
                                <h4>${data.owner.fullname}</h4>
                            </a>
                        </div>
                        <p name="${data._id}" class="text-break p-3" >${data.content}</p>
                        <p><i>${data.date.toLocaleString()}</i></p>
                    </div>
                `)
                break
        }
    }
    if (mssvViewer == data.owner.mssv){
        $(`div[name="${data._id}-title"]`).append(`
            <div>
                <button type="button" class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#confirmDelete" name="${data._id}" onclick="delete_post(this.name)">
                    <i class="bi bi-trash-fill"></i>
                </button>
                <button type="button" class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#editContentModal" name="${data._id}" onclick="edit(this.name)">
                    <i class="bi bi-gear-fill"></i>
                </button>
            </div>
            
        `)
    }
}

let loadMore = (localPageIndex) => {
    let path = window.location.pathname
    if (path.includes('profile')){
        let mssv = path.split('/')[2]
        $.getJSON(`/posts/${localPageIndex}/${mssv}`, (posts) => {
            if (posts) {
                $.each(posts, (i, data) => {
                    if (i==0){
                        mssvViewer = data
                    }
                    else{
                        let checkType
                        if (data.image){
                            checkType = 'img'
                        }else if (data.video){
                            checkType = 'video'
                        }
                        else{
                            checkType = 'text'
                        }
                        addNewPost(data, checkType, true)
                    }
                })
            }
            nextIndex++
        })
    }
    else{
        $.getJSON(`/posts/${localPageIndex}`, (posts) => {
            if (posts) {
                $.each(posts, (i, data) => {
                    if (i==0){
                        mssvViewer = data
                    }
                    else{
                        let checkType
                        if (data.image){
                            checkType = 'img'
                        }else if (data.video){
                            checkType = 'video'
                        }
                        else{
                            checkType = 'text'
                        }
                        addNewPost(data, checkType, true)
                    }
                })
            }
            nextIndex++
        })
    }
}
$(document).ready(() => {
    loadMore(pageIndex)
    pageIndex++
})

$(document).scroll(() => {
    if (($(document).scrollTop() + ($(window).height())) >= ($('#infinite-scroll').height())) {
        if (pageIndex < nextIndex) {
            loadMore(pageIndex)
            pageIndex++
        }
    }

})
// End Infinite-scroll newsfeed
function youtube_parser(url){
    let regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    let match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
}

$('#video').change(()=>{
    let video = $('#video').val()
    if (video!=''){
        let videoId = youtube_parser($('#video').val())
        if (!videoId){
            $('#video').addClass('is-invalid')
        }
        else{
            $('#video').removeClass('is-invalid')
        }
    }
    else{
        $('#video').removeClass('is-invalid')
    }
    if (video != ''){
        $('#image-label').addClass('btn-warning')
        $('#image').prop("disabled", true)
    }
    else{
        $('#image-label').removeClass('btn-warning')
        $('#image').prop("disabled", false)
    }
})
$('#image').change(()=>{
    let image = $('#image').val()
    if (image != ''){
        $('#video').prop("disabled", true)
    }
    else{
        $('#video').prop("disabled", false)
    }
})

$('#post-newsfeed').submit((e) => {
    e.preventDefault()
    let content = $('#content').val()

    if (content == ''){
        $("#alert").removeAttr('hidden')
        $("#alert").fadeTo(2000, 500).slideUp(500, function(){
            $("#alert").slideUp(500, ()=>{
                $("#alert").attr('hidden')
            });
        });
    }
    else {
        let dataUpload = new FormData($('#post-newsfeed')[0])
        let video = youtube_parser($('#video').val())
        let checkType
        if ($('#image').val()){
            checkType = 'img'
        }
        else if(video){
            checkType = 'video'
            dataUpload.set('video', video)
        }
        else {
            checkType = 'plain'
        }
        dataUpload.append('type', checkType)
    
        $.ajax({
            type: "POST",
            data: dataUpload,
            url: "/post",
            contentType: false,
            processData: false,
            success: function (data) {
                $('#content').val('')
                $('#image').val('')
                $('#video').val('')
                addNewPost(data, checkType, false)
                $('#video').prop("disabled", false)
                $('#image').prop("disabled", false)
                $('#image-label').removeClass('btn-warning')
                $('#video').removeClass('is-invalid')
            },
            error: function (data) {
                console.warn(data)
            }
        })
    }

    
})

//Modal delete post
function delete_post(id) {
    $('#delete-btn').attr('name', id)
}
$('#delete-btn').click(() => {
    let id = $('#delete-btn').attr('name')
    $.ajax({
        url: `/post/${id}`,
        type: 'DELETE',
        success: function (result) {
            $(`div[name="${id}"]`).remove()
            $('#btn-close-modal-delete').click()
            console.log(result)
        }
    })
})
//Modal edit post form
function edit(id) {
    let content = $(`p[name=${id}]`).text()
    $('#content-update').val(content)
    $('#content-update').attr('name', id)
}

$('#edit-btn').click(() => {
    let id = $('#content-update').attr('name')
    let contentUpdated = $('#content-update').val()
    $.ajax({
        url: `/post/${id}`,
        type: 'PUT',
        data: { content: contentUpdated },
        success: function (result) {
            $(`p[name=${id}]`).text(contentUpdated)
            $('#btn-close-modal-edit').click()
            console.log(result)
        }
    })
})