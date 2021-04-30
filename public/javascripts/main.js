
// Infinite-scroll newsfeed
let pageIndex = 0
let nextIndex = pageIndex + 1
let loadMore = (localPageIndex) => {
    $.getJSON(`/posts/${localPageIndex}`, (posts) => {
        if (posts) {
            $.each(posts, (i, data) => {
                let checkType
                if (data.image){
                    checkType = 'img'
                }else if (data.video){
                    checkType = 'video'
                }
                else{
                    checkType = 'text'
                }
                switch (checkType){
                    case 'img':
                        $('#infinite-scroll').append(`
                            <div class="content m-3 p-3 bg-light bg-gradient" name="${data._id}">
                                <h4>User: ${data.owner}</h4>
                                <p name="${data._id}">${data.content}</p>
                                <p><i>${data.date}</i></p>
                                <image src="${data.image}"></image>
                                <button class="btn btn-danger" id="${data._id}" onclick="delete_post(this.id)">Delete</button>
                                <button type="button" class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#editContentModal" name="${data._id}" onclick="edit(this.name)">
                                    Edit
                                </button>
                            </div>
                        `)
                        break
                    case 'video':
                        $('#infinite-scroll').append(`
                            <div class="content m-3 p-3 bg-light bg-gradient" name="${data._id}">
                                <h4>User: ${data.owner}</h4>
                                <p name="${data._id}">${data.content}</p>
                                <p><i>${data.date}</i></p>
                                <div class="video-wrapper">
                                    <iframe src="https://www.youtube.com/embed/${data.video}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                                </div>
                                <button class="btn btn-danger" id="${data._id}" onclick="delete_post(this.id)">Delete</button>
                                <button type="button" class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#editContentModal" name="${data._id}" onclick="edit(this.name)">
                                    Edit
                                </button>
                            </div>
                        `)
                        break
                    default:
                        $('#infinite-scroll').append(`
                            <div class="content m-3 p-3 bg-light bg-gradient" name="${data._id}">
                                <h4>User: ${data.owner}</h4>
                                <p name="${data._id}">${data.content}</p>
                                <p><i>${data.date}</i></p>
                                <button class="btn btn-danger" id="${data._id}" onclick="delete_post(this.id)">Delete</button>
                                <button type="button" class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#editContentModal" name="${data._id}" onclick="edit(this.name)">
                                    Edit
                                </button>
                            </div>
                        `)
                        break

                }
            })
        }
        nextIndex++
    })
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

$('#post-newsfeed').submit((e) => {
    e.preventDefault()

    let content = $('#content').val()
    let dataUpload = new FormData($('#post-newsfeed')[0])
    let video = youtube_parser($('#video').val())
    let checkType
    if ($('#image').val()){
        checkType = 'img'
    }
    else if(video){
        checkType = 'video'
    }
    else {
        checkType = 'plain'
    }
    
    switch (checkType){
        case 'img':
            $.ajax({
                type: "POST",
                data: dataUpload,
                url: "/postimage",
                contentType: false,
                processData: false,
                success: function (data) {
                    console.log(data)
                    $('#content').val('')
                    $('#image').val('')
                },
                error: function (data) {
                    console.warn(data)
                }
            });
            break;
        case 'video':
            $.post('postvideo', { content: content, video: video }, (data, status) => {
                if (data) {
                    console.log(`${data}`)
                    $('#content').val('')
                    $('video').val('')
                }
                else {
                    console.warn(data)
                }
            })
            break;
        default:
            $.post('post', { content: content }, (data, status) => {
                if (data) {
                    console.log(`${data}`)
                    $('#content').val('')
                }
                else {
                    console.warn(data)
                }
            })
    }
})

function delete_post(id) {
    $.ajax({
        url: `/post/${id}`,
        type: 'DELETE',
        success: function (result) {
            $(`div[name="${id}"]`).remove()
            console.log(result)
        }
    })
}


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
            $('#btn-close-modal').click()
            console.log(result)
        }
    })
})