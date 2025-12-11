export interface ILoginReq {
  username: string
  password: string
}

export interface ILoginByPhoneReq {
  phoneNumber: string
  verificationCode: string
}

export interface IVerificationCodeReq {
  phoneNumber: string
}


export interface ILoginRes {
  access_token: string
  user: IUserInfoRes
}

/**
 * 用户信息
 */
export interface IUserInfoRes {
  id: number
  username: string
  nickname: string
  avatar?: string
  [key: string]: any // 允许其他扩展字段
}
