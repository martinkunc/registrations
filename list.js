

  ipcRenderer.on('list:obtained', (event, list) => {
    console.log('inside list:obt')
    document.getElementById('list').innerHTML = format(list)
  });

function format(list) {
  s = ""
  for (r=0; r < list.length; r++) {
    if (!list[r]) continue
    s = s + list[r] + "<br/>"
  }
  return s
}



  document.getElementById('tomenu').addEventListener('click', (event) => {
    event.preventDefault();
    ipcRenderer.send('screen:set', 'welcome');
  }); 


  ipcRenderer.send('list:get', 'reg');