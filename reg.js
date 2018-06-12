

ipcRenderer.on('registered:getautocomplete', (event, list) => {
  
  console.log('inside registered:getautocomplete')
  new Awesomplete(input, {
    list: list, 
    minChars: 0
  });
  input.focus()
  
});

ipcRenderer.on('registered:verified', (event, res) => {
  console.log('inside registered:verified')
  if (!res.ok) {
    alertify.alert(res.msg, function(){
      console.log('successfully saved')
    });
} else {
  alertify.alert("Uspech","Registrace proběhla úspěšně", function(){
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

var style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = `
div.awesomplete {
  display: block;
}
`;
document.getElementsByTagName('head')[0].appendChild(style);

function onl() {
var input = document.getElementById("name");
console.log('before focus')
  input.focus()
  console.log(input)
  console.log('after focus')
}
//document.body.onload = onl



ipcRenderer.send('persons:get', {t: 'autocomplete'});