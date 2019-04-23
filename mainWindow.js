const electron = require('electron');
const fs = require('fs');
const path = require('path');
const { ipcRenderer } = electron;


let input;

ipcRenderer.on('screen:set', (event, screen) => {
  console.log('inside set')
  fs.readFile(path.join(__dirname,screen+".html"), 'utf8', function(err, fileData) {
      console.log(fileData);
      insertAndExecute('container', screen,  fileData)
      //container = document.getElementById('container');
      //container.innerHTML =  fileData;
  });

});



ipcRenderer.on('todo:clear', () => {
  list.innerHTML = '';
});

function insertAndExecute(id, screen, text)
  {
    domelement = document.getElementById(id);
    var n = document.createElement("div");
    n.id='container'
    n.innerHTML = text
    domelement.replaceWith(n)
    var scripts = [];

    ret = domelement.childNodes;
    // for ( var i = 0; ret[i]; i++ ) {
    //   if ( scripts && nodeName( ret[i], "script" ) && (!ret[i].type || ret[i].type.toLowerCase() === "text/javascript") ) {
    //         scripts.push( ret[i].parentNode ? ret[i].parentNode.removeChild( ret[i] ) : ret[i] );
    //     }
    // }
    var head = document.getElementsByTagName("head")[0] || document.documentElement,
    oldel = head.querySelector("script #content")
    if (oldel) {
      oldel.parentNode.removeChild(oldel)
    }
    script = document.createElement("script");
    script.type = "text/javascript";
    script.id = "content"
    script.src = path.join(__dirname, screen+".js")
    head.insertBefore( script, head.firstChild );

    //for(script in scripts)
    //{
    //  evalScript(scripts[script]);
    //}
  }
  function nodeName( elem, name ) {
    return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
  }
  function evalScript( elem ) {
    console.log('evaluating '+ elem)
    data = ( elem.text || elem.textContent || elem.innerHTML || "" );

    var head = document.getElementsByTagName("head")[0] || document.documentElement,
    script = document.createElement("script");
    script.type = "text/javascript";
    script.src = elem.src || ""
    script.appendChild( document.createTextNode( data ) );
    head.insertBefore( script, head.firstChild );
    //head.removeChild( script );

    if ( elem.parentNode ) {
        elem.parentNode.removeChild( elem );
    }
  }
