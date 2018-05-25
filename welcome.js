


console.log('inside welcome script')
document.getElementById("regbtn").addEventListener("click", function(){
console.log('clicked registration')
ipcRenderer.send('screen:set', 'reg');
})
