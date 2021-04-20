let pageIndex = 0
let nextIndex = pageIndex+1
let loadMore = (localPageIndex) => {
    $.getJSON(`/posts/${localPageIndex}`, (posts) => {
        if (posts) {
            $.each(posts, (i, data) => {
                $('#infinite-scroll').append(`
                    <div class="content m-3 p-3">
                        <h4>User: ${data.owner}</h4>
                        <p>${data.content}</p>
                        <p><i>${data.date}</i></p>
                    </div>
                `)
            })
        }
        nextIndex++
    })
    
}


$(document).ready(()=>{
    loadMore(pageIndex)
    pageIndex++
})

$(document).scroll(() => {
    if (($(document).scrollTop()+($(window).height()))>=($('#infinite-scroll').height())){
        if (pageIndex<nextIndex){
            loadMore(pageIndex)
            pageIndex++
        }
    }
    
})

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

