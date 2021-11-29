var trash = document.getElementsByClassName("fa-trash");


Array.from(trash).forEach(function(element) {
      element.addEventListener('click', function(){
        const title = this.getAttribute('data-id')
        console.log(title)
        const msg = this.parentNode.parentNode.childNodes[3].innerText
        fetch('deletePlaylist', {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            'title': title
          })
        }).then(function (response) {
          window.location.reload()
        })
      });
});
