const version = chrome.runtime.getManifest().version;

function save_options() {
  var au = document.getElementById('autotip').value;
  var wo = document.getElementById('word').value;
  var am = document.getElementById('amount').value;
  var st = document.getElementById('step').value;
  var un = document.getElementById('unit').value;
  var gi = document.getElementById('gild').checked;
  var br = document.getElementById('browserActionLink').value;
  var defaultWithdrawal = {
    address: "<ADDRESS>",
    amount: "<AMOUNT>"
  } 
  defaultWithdrawal.address = document.getElementById('wAddress').value;
  defaultWithdrawal.amount = document.getElementById('wAmount').value;
  if (defaultWithdrawal.address == "") defaultWithdrawal.address = "<ADDRESS>";
  if (defaultWithdrawal.amount <= 0 || defaultWithdrawal.amount == "") defaultWithdrawal.amount = "<AMOUNT>";
  chrome.storage.sync.set({
    autotip: au,
    word: wo,
    defaultStep: st,
    defaultAmt: am,
    defaultUnit: un,
    gilding: gi,
    browserActionLink: br,
    defaultWithdrawal: defaultWithdrawal,
  }, function () {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Your settings have been saved.';
    setTimeout(function () {
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
    defaultUnit: "bch",
    gilding: true,
    browserActionLink: "https://reddit.com/r/btc/",
    defaultWithdrawal: {
      address: "<ADDRESS>",
      amount: "<AMOUNT>"
    }
  }, function (items) {
    document.getElementById('autotip').value = items.autotip;
    document.getElementById('word').value = items.word;
    document.getElementById('amount').value = items.defaultAmt;
    document.getElementById('step').value = items.defaultStep;
    document.getElementById('unit').value = items.defaultUnit;
    document.getElementById('browserActionLink').value = items.browserActionLink;
    document.getElementById('gild').checked = items.gilding;
    if (items.defaultWithdrawal.amount != "<AMOUNT>") document.getElementById('wAmount').value = items.defaultWithdrawal.amount;
    if (items.defaultWithdrawal.address != "<ADDRESS>") document.getElementById('wAddress').value = items.defaultWithdrawal.address;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
  save_options);