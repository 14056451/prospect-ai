import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

/**
 * 로그인 화면
 * 
 * Manus OAuth를 통한 인증
 */
export default function LoginScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // 이미 로그인된 경우 홈으로 이동
  useEffect(() => {
    if (user) {
      router.replace("/(tabs)");
    }
  }, [user, router]);

  const handleLogin = async () => {
    try {
      const redirectUrl = Linking.createURL("/oauth/callback");
      const loginUrl = `https://api.manus.im/oauth/authorize?redirect_uri=${encodeURIComponent(redirectUrl)}`;
      await WebBrowser.openBrowserAsync(loginUrl);
    } catch (error) {
      console.error("로그인 실패:", error);
    }
  };

  return (
    <ScreenContainer className="bg-gradient-to-b from-primary/10 to-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center items-center px-6 gap-8">
          {/* 로고 섹션 */}
          <View className="items-center gap-4">
            <View className="w-24 h-24 bg-primary rounded-full items-center justify-center">
              <Text className="text-4xl">📊</Text>
            </View>
            <Text className="text-4xl font-bold text-foreground">ProspectAI</Text>
            <Text className="text-base text-muted text-center">
              AI 가망 고객 관리 앱
            </Text>
          </View>

          {/* 기능 설명 */}
          <View className="w-full gap-4">
            <View className="bg-surface rounded-2xl p-4 border border-border">
              <Text className="text-sm font-semibold text-foreground mb-2">✨ 주요 기능</Text>
              <Text className="text-xs text-muted leading-relaxed">
                • 가망 고객 정보 관리{"\n"}
                • AI 상담 메모 요약{"\n"}
                • 다음 연락일 알림{"\n"}
                • 상담 통계 분석
              </Text>
            </View>

            <View className="bg-surface rounded-2xl p-4 border border-border">
              <Text className="text-sm font-semibold text-foreground mb-2">💰 가격 정책</Text>
              <Text className="text-xs text-muted leading-relaxed">
                무료: 고객 50명, 메모 100개{"\n"}
                프리미엄: 월 3,000~5,000원
              </Text>
            </View>
          </View>

          {/* 로그인 버튼 */}
          <View className="w-full gap-3">
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className="w-full bg-primary py-4 rounded-full items-center justify-center active:opacity-80"
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white font-semibold text-base">로그인하기</Text>
              )}
            </TouchableOpacity>

            <Text className="text-xs text-muted text-center">
              Manus 계정으로 로그인합니다
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
