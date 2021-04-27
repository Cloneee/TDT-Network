
// Infinite-scroll newsfeed
let pageIndex = 0
let nextIndex = pageIndex + 1
let loadMore = (localPageIndex) => {
    $.getJSON(`/posts/${localPageIndex}`, (posts) => {
        if (posts) {
            $.each(posts, (i, data) => {
                $('#infinite-scroll').append(`
                    <div class="content m-3 p-3" name="${data._id}">
                        <h4>User: ${data.owner}</h4>
                        <p name="${data._id}">${data.content}</p>
                        <p><i>${data.date}</i></p>
                        <button class="btn btn-danger" id="${data._id}" onclick="delete_post(this.id)">Delete</button>
                        <button type="button" class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#editContentModal" name="${data._id}" onclick="edit(this.name)">
                            Edit
                        </button>
                    </div>
                `)
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

$('#post-content-btn').click(() => {
    let content = $('#content').val();
    $.post('post',
        {
            content: content
        },
        (data, status) => {
            if (data) {
                console.log(`${data}`)
                $('#content').val('')
            }
            else {
                console.warn(status + '/n' + data)
            }
        })
})

function delete_post(id){
    $.ajax({
        url: `/post/${id}`,
        type: 'DELETE',
        success: function(result) {
            $(`div[name="${id}"]`).remove()
            console.log(result)
        }
    })
}
//Modal edit post form

function edit(id){
    let content = $(`p[name=${id}]`).text()
    $('#content-update').val(content)
    $('#content-update').attr('name', id)
}

$('#edit-btn').click(()=>{
    let id = $('#content-update').attr('name')
    let contentUpdated = $('#content-update').val()
    $.ajax({
        url: `/post/${id}`,
        type: 'PUT',
        data:{content: contentUpdated},
        success: function(result) {
            $(`p[name=${id}]`).text(contentUpdated)
            $('#btn-close-modal').click()
            console.log(result)
        }
    })
})
