export function useUi() {
  const ui: any = {
    get loaded() {
      return router.currentPage()?.['cl-page']?.loaded
    },
  }

  const keys = ['showLoading', 'hideLoading', 'showToast', 'showTips', 'showConfirm', 'showError']

  keys.forEach((k) => {
    ui[k] = (...args: any[]) => {
      const d = router.currentPage()?.['ml-page']

      if (d) {
        d[k]?.(...args)
      }
    }
  })

  return ui
}
