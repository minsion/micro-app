// 👇 测试style标签延迟隔离，clone dom 导致的样式隔离失效的情况
const dynamicStyle1 = document.createElement('style')
document.head.appendChild(dynamicStyle1)
dynamicStyle1.textContent = '.test-color { color: green; }'

// 👇 测试style同步隔离，clone dom后不需要处理的case
const dynamicStyle2 = document.createElement('style')
dynamicStyle2.textContent = '.test-font { color: yellow; }'
document.head.appendChild(dynamicStyle2)

// 👇 测试 style 没有textcontent时的分支覆盖
const dynamicStyle3 = document.createElement('style')
document.head.appendChild(dynamicStyle3)

window.addEventListener('umd-window-event', () => {
  console.warn('umd-window-event is triggered')
}, false)

setTimeout(() => {
  console.warn('setTimeout from umd init env')
}, 1000)

setInterval(() => {
  console.warn('setInterval from umd init env')
}, 1000)

document.onclick = () => {
  console.warn('onclick event from umd init env')
}

document.addEventListener('click', () => {
  console.warn('click event from umd init env')
})

// 单测分支覆盖
function handleDocumentLoad () {}
document.addEventListener('load', handleDocumentLoad, false)
document.removeEventListener('load', handleDocumentLoad)
document.addEventListener('error-handler', null, false)

window.microApp && window.microApp.addDataListener(() => {
  console.warn('scoped data from umd init env')
}, true)

window.microApp && window.microApp.addGlobalDataListener(() => {
  console.warn('scoped globalData from umd init env')
}, true)

// 卸载后，全局变量testGlobalKey会被保留，不再清空
window.testGlobalKey = 1
// 卸载后，逃逸的__cjsWrapper会被删除，重新渲染后，此值恢复
window.__cjsWrapper = '__cjsWrapper'

let renderCount = 0

window.mount = function mount () {
  console.log('----window.渲染-----')
  renderCount++
  const root = document.querySelector('#umd-root1')
  root.innerHTML = `
    <div class='container'>
      <span class='test-color'>text1</span>
      <span class='test-font'>text2</span>
    </div>
  `
  // 关闭沙箱后，第一次值为1，再次渲染时值始终为2
  if (renderCount === 1) {
    window.expect && expect(window.testGlobalKey).toBe(1)
  } else {
    window.expect && expect(window.testGlobalKey).toBe(2)
  }
  window.expect && expect(window.__cjsWrapper).toBe('__cjsWrapper')
  window.testGlobalKey = 2
  window.System = 'System'

  const boundFunc1 = (function func1 () {}).bind(window)

  // bound function will attach to raw document direct
  document.addEventListener('click', boundFunc1, false)
}

window.unmount = function unmount () {
  console.log('----window.卸载-----')
  const root = document.querySelector('#umd-root1')
  root && (root.innerHTML = '')
}
