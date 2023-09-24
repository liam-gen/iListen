const youtubedl = require('youtube-dl-exec')

youtubedl('https://www.youtube.com/watch?v=KOxC0axwLUc', {
  dumpSingleJson: true,
  noCheckCertificates: true,
  noWarnings: true,
  preferFreeFormats: true,
  addHeader: ['referer:youtube.com', 'user-agent:googlebot']
}).then(output => console.log(output["requested_formats"][1]["url"]))