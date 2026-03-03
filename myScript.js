const para = document.createElement('div')
const element = document.querySelector('body')
element.appendChild(para)
para.innerHTML = `<div id="downloadBtn" style="border:thick double red;padding:3px 12px;border-radius:10px;color:black;background-color:rgb(176,233,254);position:fixed;top:50%;right:30px;transform:translateY(-50%);z-index:9999;font-size:16px;max-width:300px;text-align:center"><button style="background-color:#EA4C89;border-radius:8px;border-style:none;color:#FFFFFF;font-size:14px;padding:10px 16px;">开始下载</button><p style="margin: 5px;" id="downloadStatus"></p></div>`

document.getElementById('downloadBtn').addEventListener('click', batchDownload)

let auth = ''
async function getAuth () {
  if (auth) return auth
  const text = await fetch(document.location.href).then(response => response.text())
  auth = text.match(/window.'bootstrap'..+/g)[0].match(/(?<="C":").*?(?=")/g)[1]
  return auth
}

async function getPageCount () {
  const param = document.location.href.split('/')
  const json = await fetch(`https://www.canva.com/_ajax/documents/${param[4]}/summary?extension=${param[5]}`, {
    headers: {
      accept: '*/*',
      'content-type': 'application/json;charset=UTF-8',
      'x-canva-accept-prefix': 'no-prefix',
      'x-canva-authz': await getAuth()
    }
  }).then(response => response.json())
  return {
    pageCount: json.document.draft.pageCount,
    version: json.document.draft.version
  }
}

async function getExportId (index, version) {
  const param = document.location.href.split('/')
  const obj = {
    priority: 'HIGH',
    renderSpec: { content: { schema: 'web-2', type: 'DOCUMENT_REFERENCE', id: param[4], version, prefetch: true, extension: param[5] }, mediaQuality: 'PRINT', mediaDpi: 96, preferWatermarkedMedia: true, pages: [index] },
    outputSpecs: [{ destination: { type: 'DOWNLOAD' }, pages: [1], type: 'MP4', width: 1440, height: 1440 }],
    pollable: true,
    useSkiaRenderer: true
  }
  const obj2 = {
    priority: 'HIGH',
    renderSpec: {
      content: {
        schema: 'web-2',
        type: 'DOCUMENT_REFERENCE',
        id: 'DAG3dRdngOo',
        version: 8,
        prefetch: true,
        extension: 'kTpLeRSBOc4TqF6hgo7dzg'
      },
      mediaQuality: 'PRINT',
      mediaDpi: 96,
      preferWatermarkedMedia: true,
      pages: [1]
    },
    outputSpecs: [
      {
        destination: {
          type: 'DOWNLOAD'
        },
        pages: [1],
        type: 'MP4',
        width: 1440,
        height: 1440
      }
    ],
    pollable: true,
    useSkiaRenderer: true
  }
  const json = await fetch('https://www.canva.com/_ajax/export?version=2&inline=false', {
    headers: {
      accept: '*/*',
      'accept-language': 'en,zh-CN;q=0.9,zh;q=0.8',
      'content-type': 'application/json;charset=UTF-8',
      'x-canva-accept-prefix': 'no-prefix',
      'x-canva-authz': await getAuth()
    },
    body: JSON.stringify(obj),
    method: 'POST'
  }).then(response => response.json())
  return json.export.exportIdentifier
}

async function getCanvaExportUrl (exportId, interval = 2000) {
  while (true) {
    const json = await fetch(`https://www.canva.com/_ajax/export/${exportId}?attachment`, {
      headers: {
        accept: '*/*',
        'content-type': 'application/json;charset=UTF-8',
        'x-canva-accept-prefix': 'no-prefix',
        'x-canva-authz': await getAuth()
      }
    }).then(response => response.json())

    const url = json?.export?.output?.exportBlobs?.[0]?.url

    if (url) return url

    await new Promise(r => setTimeout(r, interval))
  }
}

async function batchDownload () {
  const status = document.getElementById('downloadStatus')
  status.innerText = '获取中...'
  const { pageCount, version } = await getPageCount()

  for (let i = 0; i < pageCount; i++) {
    status.innerText = `${pageCount} / ${i + 1}`
    const exportId = await getExportId(i + 1, version)
    const link = await getCanvaExportUrl(exportId)
    window.postMessage(
      {
        type: 'CANVA_DOWNLOAD',
        url: link,
        filename: `Canva_Design_Page_${i + 1}.mp4`
      },
      '*'
    )
  }
  status.innerText = '下载完成'
}
