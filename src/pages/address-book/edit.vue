<script lang="ts" setup>
import type { FormRules, TnFormInstance } from '@tuniao/tnui-vue3-uniapp'
import { cloneDeep } from 'lodash-es'
import TnForm from '@tuniao/tnui-vue3-uniapp/components/form/src/form.vue'
import TnFormItem from '@tuniao/tnui-vue3-uniapp/components/form/src/form-item.vue'
import TnInput from '@tuniao/tnui-vue3-uniapp/components/input/src/input.vue'
import TnCheckbox from '@tuniao/tnui-vue3-uniapp/components/checkbox/src/checkbox.vue'
import AsyncValidator, { type RuleItem } from '@tuniao/tnui-vue3-uniapp/libs/async-validator'
import type { ValidateError } from '@tuniao/tnui-vue3-uniapp/libs/async-validator/interface'
import type { AddressEntity } from '~/composables/api/address'
import { Address, AddressType } from '~/composables/api/address'
import MlRegionPicker from '~/components/ui/form/MlRegionPicker.vue'
import { mobileValidator, phoneValidator } from '~/utils/validator'
import { isMobile } from '~/utils/validate'
import { useEnvStore } from '~/stores/env'

const props = withDefaults(defineProps<{
  id?: string
  type?: string
  temporary?: string // 临时模式，即提交时不保存到地址簿，而是设置到寄件人、收件人
}>(), {
})

uni.setNavigationBarTitle({
  title: props.id ? '编辑地址' : '新建地址',
})

const env = useEnvStore()
const ui = useUi()
const service = useService()
const orderStore = useOrderStore()

const formRef = ref<TnFormInstance>()
const model = reactive(new Address())

const source = ref<AddressEntity | undefined>()

const rules: FormRules = reactive({
  name: [{
    required: true,
    message: '姓名不能为空',
  }],
  phone: [
    {
      required: true,
      message: '座机号不能为空',
    },
    {
      message: '请输入有效的座机号码',
      validator: phoneValidator,
      trigger: 'blur',
    },
  ],
  mobile: [
    {
      required: true,
      message: '手机号不能为空',
    },
    {
      message: '请输入有效的手机号码',
      validator: mobileValidator,
      trigger: 'blur',
    },
  ],
  district: [
    {
      required: true,
      message: '地区不能为空',
    },
  ],
  address: [{
    required: true,
    message: '地址不能为空',
  }],
})

const loading = ref(false)

const region = computed({
  get: () => {
    return [model.province, model.city, model.district]
  },
  set: (value) => {
    model.province = value[0]
    model.city = value[1]
    model.district = value[2]
    // 缓存用户选择的地区
    ls.set('region', value)
  },
})

// 联系方式
const phoneType = ref<'mobile' | 'landline'>('mobile')

async function refresh() {
  if (props.temporary) {
    if (props.type) {
      if (Number.parseInt(props.type) === AddressType.RECEIVE) {
        source.value = orderStore.receiver
        uni.setNavigationBarTitle({
          title: '收件地址',
        })
      }
      else {
        source.value = orderStore.sender
        uni.setNavigationBarTitle({
          title: '寄件地址',
        })
      }
      if (source.value) {
        Object.assign(model, source.value)
        // 还原联系方式
        nextTick(() => {
          if (model.mobile) {
            phoneType.value = 'mobile'
          }
          else if (model.phone) {
            phoneType.value = 'landline'
          }
          else {
            phoneType.value = 'mobile'
          }
        })
      }
      else {
        // 尝试从剪贴板读取
        recognize()
      }
    }
    else {
      ui.showError('参数错误')
    }
  }
  else {
    if (props.id) {
      loading.value = true
      try {
        source.value = await service.address.info({ id: props.id })
      }
      catch (err: any) {
        ui.showError(err?.message, () => {
          refresh()
        })
        return
      }
      if (!source.value) {
        ui.showError('未找到地址信息', () => {
          refresh()
        })
      }
      else {
        Object.assign(model, source.value)
        // 还原联系方式
        nextTick(() => {
          if (model.mobile) {
            phoneType.value = 'mobile'
          }
          else if (model.phone) {
            phoneType.value = 'landline'
          }
          else {
            phoneType.value = 'mobile'
          }
        })

        loading.value = false
        uni.setNavigationBarTitle({
          title: `编辑 ${source.value?.name}`,
        })
      }
    }
    else {
      uni.setNavigationBarTitle({
        title: '新建地址',
      })
    }
  }
}

function submit() {
  const callback = async (valid: boolean) => {
    if (valid) {
      console.log(model)
      loading.value = true
      // 删除无用值
      if (phoneType.value === 'mobile') {
        model.phone = ''
      }
      else {
        model.mobile = ''
      }
      const data: any = cloneDeep(model)

      try {
        if (props.temporary && props.type) {
          if (model.defaulted) {
            const data: any = cloneDeep(model)
            const res = await service.address.add(data)
            model.id = res.id
            orderStore.setAddress(model, Number.parseInt(props.type))
            uni.$emit('refresh:address', {
              data: model,
              force: true,
              callback: () => {
                uni.showToast({
                  title: '保存成功',
                  icon: 'success',
                })
              },
            })
            router.back()
          }
          else {
            // 直接设置到寄件页
            orderStore.setAddress(model, Number.parseInt(props.type))
            router.back()
          }
        }
        else {
          if (props.id) {
            await service.address.update(data)
          }
          else {
            const res = await service.address.add(data)
            model.id = res.id
          }
          uni.$emit('refresh:address', {
            data: model,
            force: !props.id || model.defaulted !== source.value?.defaulted,
            callback: () => {
              uni.showToast({
                title: '保存成功',
                icon: 'success',
              })
            },
          })
          router.back()
        }
      }
      catch (err: any) {

      }
      finally {
        loading.value = false
      }
    }
  }
  // #ifdef MP-TOUTIAO
  validate(callback)
  // #endif
  // #ifndef MP-TOUTIAO
  formRef.value?.validate(callback)
  // #endif
}

// #ifdef MP-TOUTIAO || MP-ALIPAY
const formItems = ref<any[]>([])
function formItemRef(el: any) {
  if (el) {
    formItems.value.push(el)
  }
}
// #endif
// #ifdef MP-TOUTIAO
async function validate(callback: (valid: boolean) => void) {
  const currentRules: any = {}
  for (const item of formItems.value) {
    const rule = rules[item.prop] as RuleItem[]
    currentRules[item.prop] = rule
  }
  const validator = new AsyncValidator(currentRules)
  validator.validate(model, (errors, fields) => {
    console.log(errors)
    if (errors?.length) {
      ui.showTips(errors.map(((item: ValidateError) => item.message)).join(' '), '表单验证失败')
    }
    callback(!errors?.length)
  })
}
// #endif

async function reset() {
  formRef.value?.resetFields()
  if (source.value) {
    Object.assign(model, source.value)
  }
  else {
    model.reset()
  }
  await nextTick()
  clear()
}

function clear() {
  formRef.value?.clearValidate()
}

function del() {
  ui.showConfirm({
    title: '提示',
    content: `您确定要删除 '${source.value?.name}' 么？`,
    confirm: () => {
      return new Promise<boolean>(async (resolve) => {
        loading.value = true
        try {
          await service.address.delete([source.value?.id])
          resolve(true)
          uni.$emit('refresh:address', {
            force: true,
            callback: () => {
              uni.showToast({
                title: '删除成功',
                icon: 'success',
              })
            },
          })

          const pages = getCurrentPages()
          const lastPage = pages[pages.length - 3] // 地址簿
          if (lastPage && lastPage.route === 'pages/address-book/list') {
            router.back(2)
          }
          else {
            router.push({
              path: '/pages/address-book/list',
              query: {
                type: source.value?.type,
              },
            })
          }
        }
        catch (err: any) {
          ui.showToast({
            title: err.message,
            icon: 'none',
          })
        }
        finally {
          loading.value = false
        }
      })
    },
  })
}

function importAddress() {
  uni.chooseAddress({
    success(res) {
      console.log(res, '======')
      model.name = res.userName
      model.province = res.provinceName
      model.city = res.cityName
      // #ifndef MP-ALIPAY
      model.district = res.countyName
      // #endif
      // #ifdef MP-ALIPAY
      model.district = (res as any).result.area
      // #endif
      model.address = res.detailInfo
      if (isMobile(res.telNumber)) {
        model.mobile = res.telNumber
        phoneType.value = 'mobile'
      }
      else {
        model.phone = res.telNumber
        phoneType.value = 'landline'
      }
    },
    fail(result) {
      console.log(result)
    },
  })
}

const pasteText = ref('')
async function recognize() {
  if (!pasteText.value) {
    const res = await uni.getClipboardData()
    pasteText.value = res.data
  }
  if (pasteText.value) {
    const res = await service.address.recognize(pasteText.value)
    if (res) {
      Object.assign(model, res)
      // 还原联系方式
      nextTick(() => {
        if (model.mobile) {
          phoneType.value = 'mobile'
        }
        else if (model.phone) {
          phoneType.value = 'landline'
        }
        else {
          phoneType.value = 'mobile'
        }
      })
    }
  }
}

onBackPress((e) => {
  if (e.from === 'navigateBack') {
    return false
  }
  ui.showConfirm({
    title: '提示',
    content: '您确定要放弃此次编辑么？',
    confirmText: '放弃修改',
    cancelText: '继续编辑',
    confirm() {
      router.back()
    },
  })
  return true
})

onReady(() => {
  refresh()
})
</script>

<template>
  <MlPage>
    <div class="px-2 py-4">
      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-3 card p-2 py-3">
          <template v-if="type">
            <div v-if="Number.parseInt(type) === AddressType.SEND" class="flex items-center gap-2">
              <div
                class="h-5 w-5 flex items-center justify-center rounded-full bg-primary text-3 text-primary-foreground"
              >
                寄
              </div>
              <div class="text-3.5">
                寄件人
              </div>
            </div>
            <div v-if="Number.parseInt(type) === AddressType.RECEIVE" class="flex items-center gap-2">
              <div
                class="h-5 w-5 flex items-center justify-center rounded-full bg-accent text-3 text-primary-foreground"
              >
                收
              </div>
              <div class="text-3.5">
                收件人
              </div>
            </div>
          </template>
          <div class="rounded bg-muted">
            <TnInput
              v-model="pasteText" :height="env.platform === AppPlatform.MP_ALIPAY ? 140 : 120" type="textarea" placeholder="请粘贴或输入文本，点击“识别”自动识别姓名、电话和地址"
              :border="false" clearable
            />
          </div>
          <div class="flex items-center">
            <div class="flex-1" />
            <div class="btn px-3 py-1 text-3.5" @click="recognize">
              <div>{{ pasteText || env.platform === AppPlatform.MP_TOUTIAO ? '识别' : '粘贴并识别' }}</div>
            </div>
          </div>
        </div>

        <view class="card px-5 py-3">
          <TnForm
            ref="formRef" :model="model" :rules="rules" :disabled="loading" label-position="left"
            hide-required-asterisk :label-width="env.platform === AppPlatform.MP_ALIPAY ? 135 : 120" size="lg" class="text-4"
          >
            <TnFormItem ref="formItemRef" label="姓名" prop="name">
              <div class="flex items-center">
                <MLInput v-model="model.name" type="textarea" placeholder="请输入姓名" underline class="flex-1" />
                <div v-if="env.platform !== AppPlatform.H5" class="flex items-center gap-1 text-3.5 text-muted-foreground" @click="importAddress">
                  <!--                  <div i-icon-park-outline-download /> -->
                  <div class="whitespace-nowrap">
                    {{ env.platform === AppPlatform.MP_WEIXIN ? '从微信导入' : '导入收货地址' }}
                  </div>
                </div>
              </div>
            </TnFormItem>
            <TnFormItem v-if="phoneType === 'mobile'" ref="formItemRef" label="手机号" prop="mobile">
              <div class="flex items-center">
                <MLInput v-model="model.mobile" type="textarea" placeholder="请输入手机号" underline class="flex-1" />
                <div class="flex-none text-3.5 text-muted-foreground" @click="phoneType = 'landline'">
                  切换到座机号
                </div>
              </div>
            </TnFormItem>
            <TnFormItem v-if="phoneType === 'landline'" ref="formItemRef" label="座机号" prop="phone">
              <div class="flex items-center">
                <MLInput v-model="model.phone" placeholder="请输入座机号" underline />
                <div class="flex-none text-3.5 text-muted-foreground" @click="phoneType = 'mobile'">
                  切换到手机号
                </div>
              </div>
            </TnFormItem>
            <TnFormItem ref="formItemRef" label="地区" prop="district">
              <MlRegionPicker v-model="region" placeholder="请选择地区" />
            </TnFormItem>
            <TnFormItem ref="formItemRef" label="地址" prop="address">
              <MLInput v-model="model.address" placeholder="请填写详细地址" underline type="textarea" height="150" />
            </TnFormItem>
          </TnForm>
          <div class="flex items-center">
            <TnCheckbox v-model="model.defaulted">
              设为默认地址
            </TnCheckbox>
            <!-- <TnCheckbox v-if="!temporary" v-model="model.defaulted">
              设为默认地址
            </TnCheckbox> -->
            <div class="flex-1" />
            <div class="text-secondary-foreground" @click="reset">
              {{ source ? '还原当前信息' : '清空当前信息' }}
            </div>
          </div>

          <div class="fixed-bottom-container bg-background">
            <div class="flex items-center p-3">
              <button class="btn flex-1 p-3 text-4" :loading="loading" @click="submit">
                完成
              </button>
            </div>
          </div>
        </view>
      </div>
    </div>
  </MlPage>
</template>

<style lang="scss">
.app {
  @apply bg-primary/5;
}
</style>

<style lang="scss" scoped></style>
