try {
  const s = document.createElement('script')
  s.src = chrome.runtime.getURL('myScript.js')
  s.onload = () => {
    s.remove()
  }
  ;(document.head || document.documentElement).appendChild(s)

  window.addEventListener('message', event => {
    if (event.data.type === 'CANVA_DOWNLOAD') {
      chrome.runtime.sendMessage({
        action: 'downloadFile',
        url: event.data.url,
        filename: event.data.filename
      })
    }
  })
} catch {}
