function createPersistentWindow() {
  chrome.system.display.getInfo(function(displays) {
    const display = displays[0];
    chrome.windows.create({
      url: 'index.html',
      type: 'popup',
      width: 350,
      height: 600,
      left: display.workArea.width - 320,
      top: 0,
      focused: true,
      state: 'normal'
    }, function(window) {
      // keepWindowOnTop(window.id);
      
    });
  });
}

// function keepWindowOnTop(windowId) {
//   chrome.windows.get(windowId, function(window) {
//     if (window) {
//       chrome.windows.update(windowId, {focused: true}, function() {
//         setTimeout(function() {
//           keepWindowOnTop(windowId);
//         }, 1000); // Check every second
//       });
//     }
//   });
// }

chrome.action.onClicked.addListener(function(tab) {
  createPersistentWindow();
});