export default class VirtualList {
  // 视口容器、列表数据，列表元素渲染函数
  constructor(viewportElement, listData, listItemHeight, listItemRender) {
    // 视口容器
    this.vEl = viewportElement
    // 视口容器高度
    this.vElHeight = 0
    // 视口容器滚动条高度
    this.vElScrollTop = 0
    // 视口展示第一个列表元素index
    this.vElStartIndex = 0
    // 视口展示最后一个列表元素index
    this.vElEndIndex = 0
    // 视口偏移量，列表容器距列表顶部距离
    this.vElOffsetHeight = 0
    // 视口可容纳列表元素数量
    this.vElListElNum = 0

    // 列表容器
    this.listEl = null
    // 列表数据
    this.listData = listData
    // 列表元素高度
    this.listItemHeight = listItemHeight
    // 列表总高
    this.listHeight = this.listData.length * this.listItemHeight
    // 列表元素渲染函数
    this.listItemRender = listItemRender

    this._init()

    // 初始化手动触发视口容器scroll事件，用于首次渲染
    this.vEl.dispatchEvent(new Event("scroll"))
  }

  _init() {
    // 文档碎片，为了减少添加dom次数
    const fragment = document.createDocumentFragment()

    // 视口添加占位元素，作用是把视口容器的滚动条撑起来
    const placeholderEl = document.createElement("div")
    placeholderEl.style.cssText = `width:100%; height:${this.listHeight}px; position:absolute; top:0;`
    this.vEl.style.position = "relative"
    fragment.appendChild(placeholderEl)

    // 初始化视口高度，可能视口是动态高度
    this.vElHeight = this.vEl.offsetHeight

    // 视口容器添加列表元素，每次更新该元素
    const listEl = document.createElement("div")
    listEl.id = "virtual-list"
    listEl.style.cssText = `width:100%; height:${this.vElHeight}px;`
    fragment.appendChild(listEl)

    // 初始化列表容器
    this.listEl = listEl

    // 初始化视口可容纳列表元素数量
    this.vElListElNum = Math.ceil(this.vElHeight / this.listItemHeight)

    // 视口容器添加滚动监听，清除是为了防止重复监听
    this.vEl.removeEventListener("scroll", this._vElOnScroll)
    this.vEl.addEventListener("scroll", this._vElOnScroll.bind(this))

    // 将构建好的文档碎片插入视口容器中
    this.vEl.appendChild(fragment)
  }

  // 视口滚动
  _vElOnScroll(e) {
    // 更新视口滚动条高度
    this.vElScrollTop = e.target.scrollTop

    // 更新视口偏移量
    this.vElOffsetHeight =
      this.vElScrollTop - (this.vElScrollTop % this.listItemHeight)

    // 获取视口起始列表元素索引
    this.vElStartIndex = Math.floor(this.vElScrollTop / this.listItemHeight)

    // 获取视口结束列表元素索引
    this.vElEndIndex = this.vElStartIndex + this.vElListElNum

    this._render()
  }

  // 渲染
  _render = throttle(
    function () {
      // 截取渲染数据
      const renderData = this.listData.slice(
        this.vElStartIndex,
        this.vElEndIndex
      )

      // 移动列表容器，保证一值出现在视口
      this.listEl.style.transform = `translateY(${this.vElOffsetHeight}px)`

      // 更新列表元素
      this.listEl.innerHTML = renderData
        .map(this.listItemRender)
        .reduce((a, b) => a + b, "")
    }.bind(this),
    200
  )
}

// 节流
function throttle(fn, time) {
  let timmer = null

  return (...args) => {
    if (timmer) return
    timmer = setTimeout(() => {
      clearTimeout(timmer)
      timmer = null

      fn(...args)
    }, time)
  }
}
