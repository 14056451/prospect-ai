import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "expo-router";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  exportCustomersToCSV,
  exportPurchaseHistoryToCSV,
  exportAllDataToCSV,
  downloadCSV,
} from "@/lib/csv-export";

/**
 * 설정 화면
 * 
 * 사용자 정보, 구독 정보, 데이터 내보내기, 로그아웃 등
 */
export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // 고객 목록 조회
  const { data: customers = [] } = trpc.customers.list.useQuery();

  const handleLogout = () => {
    Alert.alert("로그아웃", "정말 로그아웃하시겠습니까?", [
      { text: "취소", onPress: () => {} },
      {
        text: "로그아웃",
        onPress: async () => {
          await logout();
          router.replace("/");
        },
        style: "destructive",
      },
    ]);
  };

  const handleExportCustomers = async () => {
    try {
      setIsExporting(true);
      const csv = exportCustomersToCSV(customers);
      const filename = `고객목록_${new Date().toISOString().split("T")[0]}.csv`;
      downloadCSV(csv, filename);
      Alert.alert("성공", "고객 데이터가 CSV로 내보내졌습니다");
    } catch (error) {
      Alert.alert("오류", "CSV 내보내기에 실패했습니다");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPurchaseHistory = async () => {
    try {
      setIsExporting(true);
      const csv = exportPurchaseHistoryToCSV(customers);
      const filename = `구매내역_${new Date().toISOString().split("T")[0]}.csv`;
      downloadCSV(csv, filename);
      Alert.alert("성공", "구매 내역이 CSV로 내보내졌습니다");
    } catch (error) {
      Alert.alert("오류", "CSV 내보내기에 실패했습니다");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAllData = async () => {
    try {
      setIsExporting(true);
      const csv = exportAllDataToCSV(customers);
      const filename = `전체데이터_${new Date().toISOString().split("T")[0]}.csv`;
      downloadCSV(csv, filename);
      Alert.alert("성공", "모든 데이터가 CSV로 내보내졌습니다");
    } catch (error) {
      Alert.alert("오류", "CSV 내보내기에 실패했습니다");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <Text className="text-2xl font-bold text-foreground mb-6">설정</Text>

        {/* 사용자 정보 */}
        <View className="bg-surface rounded-2xl p-6 mb-6 border border-border">
          <Text className="text-sm font-semibold text-muted mb-4">계정 정보</Text>
          <View className="gap-3">
            <View>
              <Text className="text-xs font-semibold text-muted mb-1">이름</Text>
              <Text className="text-base font-semibold text-foreground">
                {user?.name || "정보 없음"}
              </Text>
            </View>
            <View>
              <Text className="text-xs font-semibold text-muted mb-1">이메일</Text>
              <Text className="text-base font-semibold text-foreground">
                {user?.email || "정보 없음"}
              </Text>
            </View>
            <View>
              <Text className="text-xs font-semibold text-muted mb-1">로그인 방법</Text>
              <Text className="text-base font-semibold text-foreground">
                {user?.loginMethod || "정보 없음"}
              </Text>
            </View>
          </View>
        </View>

        {/* 구독 정보 */}
        <View className="bg-primary/10 rounded-2xl p-6 mb-6 border border-primary/20">
          <Text className="text-sm font-semibold text-primary mb-4">구독 정보</Text>
          <View className="gap-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-sm font-semibold text-foreground">현재 플랜</Text>
              <View className="bg-primary px-3 py-1 rounded-full">
                <Text className="text-xs font-semibold text-white">무료</Text>
              </View>
            </View>
            <View>
              <Text className="text-xs text-muted leading-relaxed">
                • 고객 50명까지 관리{"\n"}
                • 상담 메모 100개까지{"\n"}
                • 기본 알림 기능
              </Text>
            </View>
            <TouchableOpacity className="bg-primary py-3 rounded-lg items-center justify-center mt-2">
              <Text className="text-white font-semibold">프리미엄 업그레이드</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 데이터 내보내기 */}
        <View className="bg-surface rounded-2xl p-6 mb-6 border border-border">
          <Text className="text-sm font-semibold text-muted mb-4">데이터 내보내기</Text>
          <Text className="text-xs text-muted mb-4">
            고객 데이터와 구매 내역을 CSV 파일로 내보내어 엑셀에서 관리할 수 있습니다.
          </Text>
          <View className="gap-2">
            <TouchableOpacity
              onPress={handleExportCustomers}
              disabled={isExporting || customers.length === 0}
              className="bg-primary/10 border border-primary py-3 rounded-lg items-center justify-center"
            >
              {isExporting ? (
                <ActivityIndicator color="#0a7ea4" />
              ) : (
                <Text className="text-sm font-semibold text-primary">
                  고객 목록 내보내기
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleExportPurchaseHistory}
              disabled={isExporting || customers.length === 0}
              className="bg-primary/10 border border-primary py-3 rounded-lg items-center justify-center"
            >
              {isExporting ? (
                <ActivityIndicator color="#0a7ea4" />
              ) : (
                <Text className="text-sm font-semibold text-primary">
                  구매 내역 내보내기
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleExportAllData}
              disabled={isExporting || customers.length === 0}
              className="bg-primary/10 border border-primary py-3 rounded-lg items-center justify-center"
            >
              {isExporting ? (
                <ActivityIndicator color="#0a7ea4" />
              ) : (
                <Text className="text-sm font-semibold text-primary">
                  전체 데이터 내보내기
                </Text>
              )}
            </TouchableOpacity>

            {customers.length === 0 && (
              <Text className="text-xs text-muted text-center mt-2">
                내보낼 고객 데이터가 없습니다
              </Text>
            )}
          </View>
        </View>

        {/* 알림 설정 */}
        <View className="bg-surface rounded-2xl p-6 mb-6 border border-border">
          <Text className="text-sm font-semibold text-muted mb-4">알림 설정</Text>
          <View className="gap-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-sm font-semibold text-foreground">다음 연락일 알림</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
              />
            </View>
            <Text className="text-xs text-muted">
              다음 연락일 1일 전과 당일에 알림을 받습니다
            </Text>
          </View>
        </View>

        {/* 앱 정보 */}
        <View className="bg-surface rounded-2xl p-6 mb-6 border border-border">
          <Text className="text-sm font-semibold text-muted mb-4">앱 정보</Text>
          <View className="gap-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-foreground">버전</Text>
              <Text className="text-sm font-semibold text-muted">1.0.0</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-foreground">개발사</Text>
              <Text className="text-sm font-semibold text-muted">ProspectAI</Text>
            </View>
          </View>
        </View>

        {/* 도움말 및 지원 */}
        <View className="bg-surface rounded-2xl p-6 mb-6 border border-border gap-3">
          <TouchableOpacity className="py-3">
            <Text className="text-sm font-semibold text-foreground">자주 묻는 질문</Text>
          </TouchableOpacity>
          <View className="h-px bg-border" />
          <TouchableOpacity className="py-3">
            <Text className="text-sm font-semibold text-foreground">피드백 보내기</Text>
          </TouchableOpacity>
          <View className="h-px bg-border" />
          <TouchableOpacity className="py-3">
            <Text className="text-sm font-semibold text-foreground">이용약관</Text>
          </TouchableOpacity>
          <View className="h-px bg-border" />
          <TouchableOpacity className="py-3">
            <Text className="text-sm font-semibold text-foreground">개인정보처리방침</Text>
          </TouchableOpacity>
        </View>

        {/* 로그아웃 */}
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-error/10 py-4 rounded-lg items-center justify-center mb-6"
        >
          <Text className="text-error font-semibold">로그아웃</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
