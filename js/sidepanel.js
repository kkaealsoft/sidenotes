var currentLocation = window.location.hash.slice(1).split('#')[0];
var backgroundNote;
var cursorPosition;

$(document).ready(function(){

  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if(changes['backgroundNote']) {
      chrome.storage.local.get(null, function(result){
        $('#textarea').text(result['backgroundNote']['body']);
      })
      Caret.set($('#textarea'), cursorPosition);
    };
  });


  // Functions for setting the caret/cursor position

  Caret = {
      set : function(input, pos) {
          this.setSelectionRange(input, pos, pos);
      },
      get : function(el) {
          if (el.selectionStart) {
              return el.selectionStart;
          } else if (document.selection) {
              el.focus();

              var r = document.selection.createRange();
              if (r == null) {
                  return 0;
              }

              var re = el.createTextRange(),
              rc = re.duplicate();
              re.moveToBookmark(r.getBookmark());
              rc.setEndPoint('EndToStart', re);

              return rc.text.length;
          }
          return 0;
      },
      setSelectionRange : function(input, selectionStart, selectionEnd) {
          if (input.setSelectionRange) {
              input.focus();
              input.setSelectionRange(selectionStart, selectionEnd);
          }
          else if (input.createTextRange) {
              var range = input.createTextRange();
              range.collapse(true);
              range.moveEnd('character', selectionEnd);
              range.moveStart('character', selectionStart);
              range.select();
          }
      }
  }

  $('#textarea').focus();

  // Create note from textarea content

  function setIframeData() {
    var noteBody = $('#textarea').text();
    var chromeStorage = {};
    chromeStorage['iframeNote'] = { 'url': currentLocation, 'body': noteBody, 'date': JSON.stringify(new Date()) }
    chrome.storage.local.set(chromeStorage, function() {});
  };


  // Autosave
  var timeoutId;
  $('#textarea').on('input propertychange change', function(){
    clearTimeout(timeoutId);
    timeoutId = setTimeout(function() {
      setIframeData();
    }, 1000);
    cursorPosition = $('#textarea').text().length;
  });
});
