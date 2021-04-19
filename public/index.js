$('#post-content-btn').click(()=>{
    let content = $('#content').val();
    $.post('post',
    {
        content: content
    },
    (data,status)=>{
        if (data){
            console.log(`${data}`)
            $('#content').val('')
        }
        else{
            console.warn(status + '/n' + data)
        }
    })
})