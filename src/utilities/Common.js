// this prevents any overhead from creating the object each time
var element = document.createElement('div')

export function decodeEntities (str) {
  if(str && typeof str === 'string') {
    // strip script/html tags
    str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '')
    str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '')
    element.innerHTML = str
    str = element.textContent
    element.textContent = ''
  }
  return str
}

export function prettyNumber(number) {
  if(number >= 1000000) {
    return (Math.round((number/1000000)*10)/10) + 'm'
  }else if(number >= 1000) {
    return (Math.round((number/1000)*10)/10) + 'k'
  }else{
    return number
  }
}

export const className = function(...args) {
  const list = []
  for (var i = 0; i < args.length; i++) {
    const el = args[i]
    if (typeof el == 'string') {
      list.push(el)
    } else if (el instanceof Array) {
      [].push.apply(list, el)
    } else if (el) {
      Object.keys(el).forEach(key => {
        if (el[key]) list.push(key)
      })
    }
  }
  return list.join(' ')
}
