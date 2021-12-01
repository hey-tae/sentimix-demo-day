var trash = document.getElementsByClassName("fa-trash");


Array.from(trash).forEach(function(element) {
      element.addEventListener('click', function(){
        const title = this.getAttribute('data-id')
        console.log(title)
        console.log('This is the parent node: ', this.parentNode.parentNode) 
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
