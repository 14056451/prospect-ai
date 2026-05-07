import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * 로그인 정보 저장 및 로드
 */

const AUTH_TOKEN_KEY = "auth_token";
const USER_ID_KEY = "user_id";
const USER_EMAIL_KEY = "user_email";
const USER_NAME_KEY = "user_name";

/**
 * 로그인 정보 저장
 */
export async function saveLoginInfo(token: string, userId: number, email: string, name: string) {
  try {
    await AsyncStorage.multiSet([
      [AUTH_TOKEN_KEY, token],
      [USER_ID_KEY, userId.toString()],
      [USER_EMAIL_KEY, email],
      [USER_NAME_KEY, name],
    ]);
    console.log("로그인 정보 저장 완료:", email);
  } catch (error) {
    console.error("로그인 정보 저장 실패:", error);
  }
}

/**
 * 저장된 로그인 정보 조회
 */
export async function getLoginInfo() {
  try {
    const values = await AsyncStorage.multiGet([
      AUTH_TOKEN_KEY,
      USER_ID_KEY,
      USER_EMAIL_KEY,
      USER_NAME_KEY,
    ]);

    const loginInfo = {
      token: values[0][1],
      userId: values[1][1] ? parseInt(values[1][1]) : null,
      email: values[2][1],
      name: values[3][1],
    };

    if (loginInfo.token && loginInfo.userId) {
      console.log("저장된 로그인 정보 조회 완료:", loginInfo.email);
      return loginInfo;
    }

    return null;
  } catch (error) {
    console.error("로그인 정보 조회 실패:", error);
    return null;
  }
}

/**
 * 로그인 정보 삭제
 */
export async function clearLoginInfo() {
  try {
    await AsyncStorage.multiRemove([
      AUTH_TOKEN_KEY,
      USER_ID_KEY,
      USER_EMAIL_KEY,
      USER_NAME_KEY,
    ]);
    console.log("로그인 정보 삭제 완료");
  } catch (error) {
    console.error("로그인 정보 삭제 실패:", error);
  }
}
