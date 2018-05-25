

document.querySelector('form').addEventListener('submit', (event) => {
      event.preventDefault();
      const { value } = document.querySelector('input');
      ipcRenderer.send('person:register', value);
    });

    document.getElementById('tomenu').addEventListener('click', (event) => {
          event.preventDefault();
          ipcRenderer.send('screen:set', 'welcome');
        });
