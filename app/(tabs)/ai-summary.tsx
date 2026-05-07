import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

/**
 * AI 요약 기능 화면
 * 
 * 상담 메모를 입력하면 AI가 자동으로 요점 3줄과 다음 액션 3개를 생성합니다.
 * 프리미엄 기능입니다.
 */
export default function AISummaryScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const memoId = parseInt(params.memoId as string);

  const [summary, setSummary] = useState<{
    keyPoints: string[];
    nextActions: string[];
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // 메모 조회
  const { data: memo, isLoading } = trpc.memos.get.useQuery(
    { id: memoId },
    { enabled: !!memoId }
  );

  // AI 요약 생성 (실제로는 서버의 LLM 호출)
  const handleGenerateSummary = async () => {
    if (!memo) {
      Alert.alert("오류", "메모를 찾을 수 없습니다");
      return;
    }

    setIsGenerating(true);
    try {
      // 실제로는 서버의 LLM API를 호출해야 합니다
      // 현재는 간단한 예시 구현
      const keyPoints = [
        memo.content.substring(0, 50) + "...",
        "고객의 주요 관심사 파악됨",
        "다음 상담에서 상세 논의 필요",
      ];

      const nextActions = [
        "고객에게 제안서 전송",
        "3일 후 전화 연락",
        "상담 내용 정리 및 저장",
      ];

      setSummary({
        keyPoints,
        nextActions,
      });

      Alert.alert("성공", "AI 요약이 생성되었습니다");
    } catch (error) {
      Alert.alert("오류", "AI 요약 생성에 실패했습니다");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <ScreenContainer className="justify-center items-center">
        <ActivityIndicator size="large" color="#0a7ea4" />
      </ScreenContainer>
    );
  }

  if (!memo) {
    return (
      <ScreenContainer className="justify-center items-center">
        <Text className="text-muted">메모를 찾을 수 없습니다</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-2xl text-primary">←</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-foreground">AI 요약</Text>
          <View className="w-6" />
        </View>

        {/* 원본 메모 */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-foreground mb-3">원본 메모</Text>
          <View className="bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-sm text-muted mb-2">
              {new Date(memo.consultationDate).toLocaleDateString("ko-KR")}
            </Text>
            <Text className="text-base text-foreground leading-relaxed">{memo.content}</Text>
          </View>
        </View>

        {/* 요약 결과 */}
        {summary ? (
          <>
            {/* 요점 */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-foreground mb-3">요점 (3줄)</Text>
              <View className="gap-2">
                {summary.keyPoints.map((point, index) => (
                  <View key={index} className="bg-primary/10 rounded-lg p-4 flex-row gap-3">
                    <Text className="text-lg font-bold text-primary">{index + 1}</Text>
                    <Text className="flex-1 text-sm text-foreground leading-relaxed">
                      {point}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* 다음 액션 */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-foreground mb-3">다음 액션 (3개)</Text>
              <View className="gap-2">
                {summary.nextActions.map((action, index) => (
                  <View key={index} className="bg-success/10 rounded-lg p-4 flex-row gap-3">
                    <Text className="text-lg font-bold text-success">✓</Text>
                    <Text className="flex-1 text-sm text-foreground leading-relaxed">
                      {action}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : (
          <View className="mb-6 bg-surface rounded-2xl p-6 border border-border items-center justify-center py-8">
            <Text className="text-muted text-sm">아직 요약이 생성되지 않았습니다</Text>
          </View>
        )}

        {/* 생성 버튼 */}
        <TouchableOpacity
          onPress={handleGenerateSummary}
          disabled={isGenerating}
          className="bg-primary py-4 rounded-lg items-center justify-center mb-8"
        >
          {isGenerating ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white font-semibold text-base">
              {summary ? "다시 생성" : "요약 생성"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
