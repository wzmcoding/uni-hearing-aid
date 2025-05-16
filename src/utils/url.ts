export function combineURLs(baseURL: string, relativeURL: string) {
  return relativeURL
    ? `${baseURL.replace(/\/?\/$/, '')}/${relativeURL.replace(/^\/+/, '')}`
    : baseURL
}

export function isAbsoluteURL(url: string) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url)
}

function getQueryStringify(params: Record<string, any>) {
  return Object.entries(params) // 将对象转换成 [key, value] 数组
    .map(([key, value]) => encodeURI(
      `${key}=${typeof value === 'object' ? JSON.stringify(value) : value}`,
    )) // 将每个数组元素转换成 key=value 字符串，需要对 value 进行 JSON 序列化和 URL 编码
    .join('&') // 将数组用 & 符号连接成字符串
}

export function buildURL(url: string, params: any) {
  if (!params) {
    return url
  }

  const paramsObj = getQueryStringify(params || {})

  // 如果URL已经有查询参数，则添加到现有参数后面
  if (url.includes('?')) {
    url = `${url}&${paramsObj}`
  }
  else {
    url = `${url}?${paramsObj}`
  }

  return url
}
