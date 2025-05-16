export interface BaseEntity {
  id?: string
  createTime?: string
  createBy?: string
  updateTime?: string
  updateBy?: string
}
export interface UploadEntity {
  onProgress: Function
  file: File
  filename: string
  publicAccess?: boolean // 是否上传到公有OSS
}

export interface OSSTokenEntity {
  stsToken: string
  accessKeySecret: string
  accessKeyId: string
  region: string
  bucket: string
  expiration: string
}
export function useApiCommon() {
  const { api } = useApi()
  return {
    upload: (data: UploadEntity): Promise<any> => {
      const { file, filename, publicAccess } = data
      return api.upload({
        url: 'file/upload',
        data: {
          files: file,
          filename,
          publicAccess,
        },
      })
    },
    ossToken: (): Promise<OSSTokenEntity> => {
      return api.query({
        url: 'file/token',
      })
    },
  }
}
