

ipcRenderer.on('welcome:settings', (event, res) => {
  console.log('inside welcome:settings', res)
  document.getElementById("name").innerText = res.name
});

console.log('inside welcome script')
document.getElementById("regbtn").addEventListener("click", function () {
  console.log('clicked registration')
  ipcRenderer.send('screen:set', 'reg');
})

document.getElementById("listbtn").addEventListener("click", function () {
  console.log('clicked list')
  ipcRenderer.send('screen:set', 'list');
})


ipcRenderer.send('settings:get', null);