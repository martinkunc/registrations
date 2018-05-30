

ipcRenderer.on('registered:getautocomplete', (event, list) => {
  console.log('inside registered:getautocomplete')
  new Awesomplete(input, {
    list: list
  });
});

ipcRenderer.on('registered:verified', (event, res) => {
  console.log('inside registered:verified')
  if (!res.ok) {
    alertify.alert(res.msg, function(){
      alertify.message('OK');
    });
} else {
  alertify.alert("Uspesne zaregistrovan.", function(){
      ipcRenderer.send('screen:set', 'welcome');
  });
}
});

document.querySelector('form').addEventListener('submit', (event) => {
      event.preventDefault();
      const { value } = document.querySelector('input');

      ipcRenderer.send('persons:get', {t: 'verify', p: value});
      //ipcRenderer.send('persons:get', {t: 'autocomplete'});
    });

document.getElementById('tomenu').addEventListener('click', (event) => {
      event.preventDefault();
      ipcRenderer.send('screen:set', 'welcome');
    });

input = document.getElementById("name");
// new Awesomplete(input, {
// 	list: ["Ada", "Java", "JavaScript", "Brainfuck", "LOLCODE", "Node.js", "Ruby on Rails"]
// });

input.focus()
ipcRenderer.send('persons:get', {t: 'autocomplete'});