import type { ILoginByPhoneReq, ILoginReq, ILoginRes, IUserInfoRes, IVerificationCodeReq } from './login.types'
import { http } from '@/utils/request'

//获取用户信息
export function getUserInfo() {
	return http.get<IUserInfoRes>('/user/info')
}

/**
 * 退出登录
 */
export function logout() {
	return http.get<void>('/auth/logout')
}


// 账号密码登录
export const loginByAccount = (data: ILoginReq): Promise<ILoginRes> => {
	// 模拟API调用 - 前端模拟数据
	return new Promise<ILoginRes>((resolve,reject) => {
		setTimeout(() => {
			// 模拟账号密码验证
			if (data.username === 'admin' && data.password === '123456') {
				resolve({
					access_token: 'mock_token_' + Date.now(),
					user: {
						id: 1,
						username: data.username,
						nickname: '管理员',
						avatar: '',
						role: 'admin'
					}
				});
			} else {
				reject({
					code: 401,
					message: '用户名或密码错误'
				});
			}
		}, 200);
	});
	// 实际后端调用（注释）
	// return request.post('/auth/login', data);
};

// 手机号验证码登录
export const loginByPhone = (data: ILoginByPhoneReq): Promise<ILoginRes> => {
	// 模拟API调用 - 前端模拟数据
	return new Promise<ILoginRes>((resolve, reject) => {
		setTimeout(() => {
			// 模拟验证码验证
			if (data.verificationCode === '123456') {
				resolve({
					access_token: 'mock_token_' + Date.now(),
					user: {
						id: 2,
						username: data.phoneNumber,
						nickname: '用户' + data.phoneNumber.slice(-4),
						avatar: '',
						role: 'user',
						phoneNumber: data.phoneNumber
					}
				});
			} else {
				reject({
					code: 401,
					message: '验证码错误'
				});
			}
		}, 200);
	});
	// 实际后端调用（注释）
	// return request.post('/auth/login/phone', data);
};

// 发送验证码
export const sendVerificationCode = (_data: IVerificationCodeReq): Promise<{code: number, message: string}> => {
	// 模拟API调用
	return new Promise<{code: number, message: string}>((resolve) => {
		setTimeout(() => {
			resolve({
				code: 200,
				message: '验证码已发送'
			});
		}, 500);
	});
	// 实际后端调用（注释）
	// return request.post('/auth/send-code', data);
};
