module.exports = {
  hyperlinksChecker: (message) => {
    if (message.trim().startsWith('http' || message.trim().startsWith('https'))
      && (message.trim().endsWith('jpg') || message.trim().endsWith('jpeg') || message.trim().endsWith('png'))) {
      return 'isImage'
    }
    else if (message.trim().startsWith('http') || message.trim().startsWith('https')) {
      return 'isHyperLink'
    }
  }
}