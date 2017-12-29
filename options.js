// Saves options to chrome.storage.sync.
function save_options() {
    var au = document.getElementById('autotip').value;
    var wo = document.getElementById('word').value;
    chrome.storage.sync.set({
      autotip: au,
      word: wo,
    }, function() {
      // Update status to let user know options were saved.
      var status = document.getElementById('status');
      status.textContent = 'Your settings have been saved.';
      setTimeout(function() {
        status.textContent = '';
      }, 750);
    });
  }
  
  // Restores select box and checkbox state using the preferences
  // stored in chrome.storage.
  function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
      autotip: "true",
      word: "give tip",
    }, function(items) {
      document.getElementById('autotip').value = items.autotip;
      document.getElementById('word').value = items.word;
    });
  }
  document.addEventListener('DOMContentLoaded', restore_options);
  document.getElementById('save').addEventListener('click',
      save_options);