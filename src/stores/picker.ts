import { defineStore } from 'pinia'

export const usePickerStore = defineStore('picker', () => {
  const address = ref<{ id: any, name?: string, [key: string]: any }[]>([])

  const cacheAddress = ref<{ [key: string]: any }>({})

  // 缓存id对应数据对象
  const cache: { [key: string]: any } = {
    address: cacheAddress,
  }
  const setCache = (
    type: string,
    item: { id?: any, name?: string, [key: string]: any },
  ) => {
    if (cache[type]) {
      cache[type].value[item.id] = item
    }
  }

  const state: { [key: string]: any } = {
    address,
  }
  const set = (type: string, list: any[]) => {
    state[type].value = list
  }

  const add = (type: string, item: any) => {
    state[type].value.push(item)
  }
  const remove = (type: string, item: any) => {
    state[type].value.splice(
      state[type].value.findIndex((x: any) => x.id === item.id),
      1,
    )
  }

  const toggle = (type: string, item: any) => {
    const index = state.value[type].findIndex((x: any) => x.id === item.id)
    if (index !== -1) {
      remove(type, item)
    }
    else {
      add(type, item)
    }
  }

  return {
    cacheAddress,
    setCache,
    address,
    set,
    add,
    remove,
    toggle,
  }
})
