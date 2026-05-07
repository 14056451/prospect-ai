import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { startOAuthLogin } from "@/constants/oauth";

/**
 * ProspectAI 홈 화면
 * 
 * 가망 고객 관리 앱의 메인 화면입니다.
 */
export default function HomeScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // 로그인된 경우 고객 탭으로 이동
  useEffect(() => {
    if (user) {
      router.replace("/(tabs)/customers");
    }
  }, [user, router]);

  const handleGetStarted = async () => {
    await startOAuthLogin();
  };
  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-8">
          {/* 헤더 섹션 */}
          <View className="items-center gap-2">
            <Text className="text-4xl font-bold text-foreground">ProspectAI</Text>
            <Text className="text-base text-muted text-center">
              AI 가망 고객 관리 앱
            </Text>
          </View>

          {/* 소개 카드 */}
          <View className="w-full max-w-sm self-center bg-surface rounded-2xl p-6 shadow-sm border border-border">
            <Text className="text-lg font-semibold text-foreground mb-2">스마트한 고객 관리</Text>
            <Text className="text-sm text-muted leading-relaxed">
              상담 메모를 입력하면 AI가 자동으로 요점과 다음 액션을 정리해줍니다. 다음 연락일을 놓치지 마세요.
            </Text>
          </View>

          {/* 시작 버튼 */}
          <View className="items-center">
            <TouchableOpacity
              onPress={handleGetStarted}
              disabled={loading}
              className="bg-primary px-6 py-3 rounded-full active:opacity-80"
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-background font-semibold">시작하기</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
