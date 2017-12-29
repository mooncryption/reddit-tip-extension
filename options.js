// Saves options to chrome.storage.sync.
function save_options() {
    var au = document.getElementById('autotip').value;
    var wo = document.getElementById('word').value;
    var am = document.getElementById('amount').value;
    var st = document.getElementById('step').value;
    var un = document.getElementById('unit').value;
    chrome.storage.sync.set({
      autotip: au,
      word: wo,
      defaultStep: st,
      defaultAmt: am,
      defaultUnit: un
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
      defaultStep: 0.01,
      defaultAmt: 0.0001,
      defaultUnit: "bch"
    }, function(items) {
      document.getElementById('autotip').value = items.autotip;
      document.getElementById('word').value = items.word;
      document.getElementById('amount').value = items.defaultAmt;
      document.getElementById('step').value = items.defaultStep;
      document.getElementById('unit').value = items.defaultUnit;
    });
  }
  document.addEventListener('DOMContentLoaded', restore_options);
  document.getElementById('save').addEventListener('click',
      save_options);