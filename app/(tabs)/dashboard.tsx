import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

/**
 * 대시보드 화면
 * 
 * 통계 및 분석 정보 표시
 */
export default function DashboardScreen() {
  // API 호출
  const { data: customers = [], isLoading: customersLoading } = trpc.customers.list.useQuery();

  // 통계 계산
  const totalCustomers = customers.length;
  const statusCounts = {
    "1차상담": customers.filter((c) => c.status === "1차상담").length,
    "2차": customers.filter((c) => c.status === "2차").length,
    소비자: customers.filter((c) => c.status === "소비자").length,
    사업자: customers.filter((c) => c.status === "사업자").length,
  };

  const conversionRate = totalCustomers > 0
    ? Math.round(((statusCounts.소비자 + statusCounts.사업자) / totalCustomers) * 100)
    : 0;

  const nextContactCount = customers.filter((c) => c.nextContactDate).length;

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <Text className="text-2xl font-bold text-foreground mb-6">통계 대시보드</Text>

        {customersLoading ? (
          <View className="justify-center items-center py-12">
            <ActivityIndicator size="large" color="#0a7ea4" />
          </View>
        ) : (
          <>
            {/* 주요 지표 */}
            <View className="gap-3 mb-6">
              {/* 전체 고객 수 */}
              <View className="bg-primary/10 rounded-2xl p-6 border border-primary/20">
                <Text className="text-sm text-muted mb-2">전체 고객 수</Text>
                <Text className="text-4xl font-bold text-primary">{totalCustomers}</Text>
              </View>

              {/* 계약 전환율 */}
              <View className="bg-success/10 rounded-2xl p-6 border border-success/20">
                <Text className="text-sm text-muted mb-2">계약 전환율</Text>
                <Text className="text-4xl font-bold text-success">{conversionRate}%</Text>
              </View>

              {/* 다음 연락 예정 */}
              <View className="bg-warning/10 rounded-2xl p-6 border border-warning/20">
                <Text className="text-sm text-muted mb-2">다음 연락 예정 고객</Text>
                <Text className="text-4xl font-bold text-warning">{nextContactCount}</Text>
              </View>
            </View>

            {/* 상태별 분포 */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-foreground mb-4">상태별 고객 분포</Text>
              <View className="gap-3">
                {Object.entries(statusCounts).map(([status, count]) => {
                  const percentage = totalCustomers > 0 ? Math.round((count / totalCustomers) * 100) : 0;
                  return (
                    <View key={status} className="gap-2">
                      <View className="flex-row justify-between items-center">
                        <Text className="text-sm font-semibold text-foreground">{status}</Text>
                        <Text className="text-sm font-semibold text-muted">
                          {count}명 ({percentage}%)
                        </Text>
                      </View>
                      <View className="h-2 bg-surface rounded-full overflow-hidden">
                        <View
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* 프리미엄 기능 안내 */}
            <View className="bg-primary/10 rounded-2xl p-6 border border-primary/20">
              <Text className="text-sm font-bold text-primary mb-2">✨ 프리미엄 기능</Text>
              <Text className="text-xs text-foreground leading-relaxed">
                프리미엄 구독 시 AI 요약, 상세 통계, 자동 알림 등의 기능을 이용할 수 있습니다.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
