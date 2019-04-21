

  ipcRenderer.on('list:obtained', (event, list) => {
    console.log('inside list:obt')
    document.getElementById('list').innerHTML = format(list)
  });

function format(list) {
  var s = "<table border=1>"
  s+="<td>"+"Jmeno"+"</td><td>"+"Registracni cislo"+"</td>"
  for (r=0; r < list.length; r++) {
    if (!list[r]) continue
    s += "<tr>"
    var n = list[r].N
    var rn = list[r].R
    if (typeof(n) == "undefined") n = ""
    if (typeof(rn) == "undefined") rn = ""
    s +=  "<td>" + n + "</td><td>" + rn + "</td>"
    s += "</tr>"
  }
  s += "</table"
  return s
}



  document.getElementById('tomenu').addEventListener('click', (event) => {
    event.preventDefault();
    ipcRenderer.send('screen:set', 'welcome');
  }); 


  ipcRenderer.send('list:get', 'reg');