
export interface HttpRequestResult<T> {
  promise: Promise<T>
  requestTask: UniApp.RequestTask
}

// 通用响应格式（兼容 msg + message 字段）
export type IResponse<T = any> = {
  code: number
  data: T
  message: string
  [key: string]: any // 允许额外属性
} | {
  code: number
  data: T
  msg: string
  [key: string]: any // 允许额外属性
}

// 分页请求参数
export interface PageParams {
  page: number
  pageSize: number
  [key: string]: any
}

// 分页响应数据
export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// Token 相关类型定义
export interface ITokenInfo {
  accessToken: string
  refreshToken?: string
  tokenType?: string
  expiresIn?: number
}

export interface IDoubleTokenRes extends ITokenInfo {
  refreshToken: string
}

// 临时的 token store 接口（实际项目中应该使用 Pinia/Zustand 等状态管理）
export interface ITokenStore {
  tokenInfo: ITokenInfo | null
  logout(): Promise<void>
  refreshToken(): Promise<void>
}
