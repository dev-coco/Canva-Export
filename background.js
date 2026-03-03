chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'downloadFile') {
    chrome.downloads.download({
      url: message.url,
      filename: message.filename || 'Canva_Export.mp4',
      conflictAction: 'uniquify',
      saveAs: false
    })
  }
})
