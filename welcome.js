


console.log('inside welcome script')
document.getElementById("regbtn").addEventListener("click", function(){
  console.log('clicked registration')
  ipcRenderer.send('screen:set', 'reg');
})
document.getElementById("listbtn").addEventListener("click", function(){
    console.log('clicked list')
    ipcRenderer.send('screen:set', 'list');
  })
