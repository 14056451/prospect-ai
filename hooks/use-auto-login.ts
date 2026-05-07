import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./use-auth";

/**
 * 자동 로그인 훅
 * 
 * AsyncStorage에 저장된 로그인 정보를 확인하여 자동으로 로그인합니다.
 */
export function useAutoLogin() {
  const { user, loading, logout, refresh } = useAuth();
  const [isAutoLoginAttempted, setIsAutoLoginAttempted] = useState(false);

  useEffect(() => {
    const attemptAutoLogin = async () => {
      try {
        // AsyncStorage에서 로그인 정보 확인
        const userEmail = await AsyncStorage.getItem("user_email");
        const userId = await AsyncStorage.getItem("user_id");

        if (userEmail && userId) {
          // 로그인 정보가 있으면 자동 로그인 시도
          console.log("저장된 로그인 정보 감지:", userEmail);
          // 로그인 상태 갱신
          await refresh();
        }
      } catch (error) {
        console.error("자동 로그인 실패:", error);
      } finally {
        setIsAutoLoginAttempted(true);
      }
    };

    attemptAutoLogin();
  }, [refresh]);

  return {
    user,
    isLoading: loading || !isAutoLoginAttempted,
    logout,
    isAutoLoginAttempted,
  };
}
