node deploy/alipay/deploy.js toggle --appid=2021004171608216
pnpm run build:mp-alipay
export DEBUG=minidev-cli
node deploy/alipay/deploy.js upload --appid=2021004171608216
#minidev upload --app-id=2021004171608216 --project dist/build/mp-alipay --version 0.1.1 --identity-key-path deploy/alipay/2021004171608216.json
