export function useService() {
  return {
    auth: useApiAuth(),
    common: useApiCommon(),
    address: useApiAddress(),
    order: useApiOrder(),
    app: useApiExpressApp(),
    report: useApiReport(),
  }
}
