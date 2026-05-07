import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";

/**
 * 구매 내역 통계 화면
 * 
 * 일/월/년간 구매 내역 요약 및 그래프 표시
 */
export default function PurchaseStatsScreen() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<"day" | "month" | "year">("month");

  // 고객 목록 조회
  const { data: customers = [], isLoading } = trpc.customers.list.useQuery();

  // 통계 계산
  const stats = useMemo(() => {
    if (!customers.length) {
      return {
        totalAmount: 0,
        totalCount: 0,
        averageAmount: 0,
        topCustomers: [],
      };
    }

    let filteredCustomers = customers;
    const now = new Date();

    // 시간 범위에 따라 필터링
    if (timeRange === "day") {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filteredCustomers = customers.filter((c) => {
        if (!c.purchasePrice) return false;
        return new Date(c.createdAt) >= today;
      });
    } else if (timeRange === "month") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      filteredCustomers = customers.filter((c) => {
        if (!c.purchasePrice) return false;
        return new Date(c.createdAt) >= firstDay;
      });
    }

    const totalAmount = filteredCustomers.reduce((sum, c) => {
      const price = typeof c.purchasePrice === "number" ? c.purchasePrice : 0;
      return sum + price;
    }, 0);

    const totalCount = filteredCustomers.filter((c) => c.purchasePrice).length;
    const averageAmount = totalCount > 0 ? totalAmount / totalCount : 0;

    // 상위 고객 (구매액 기준)
    const topCustomers = filteredCustomers
      .filter((c) => c.purchasePrice)
      .sort((a, b) => {
        const priceA = typeof a.purchasePrice === "number" ? a.purchasePrice : 0;
        const priceB = typeof b.purchasePrice === "number" ? b.purchasePrice : 0;
        return priceB - priceA;
      })
      .slice(0, 5);

    return {
      totalAmount,
      totalCount,
      averageAmount,
      topCustomers,
    };
  }, [customers, timeRange]);

  if (isLoading) {
    return (
      <ScreenContainer className="justify-center items-center">
        <ActivityIndicator size="large" color="#0a7ea4" />
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
          <Text className="text-2xl font-bold text-foreground">구매 내역 통계</Text>
          <View className="w-6" />
        </View>

        {/* 시간 범위 선택 */}
        <View className="flex-row gap-2 mb-6">
          {(["day", "month", "year"] as const).map((range) => (
            <TouchableOpacity
              key={range}
              onPress={() => setTimeRange(range)}
              className={`flex-1 py-2 rounded-lg border-2 ${
                timeRange === range
                  ? "bg-primary border-primary"
                  : "bg-surface border-border"
              }`}
            >
              <Text
                className={`font-semibold text-center ${
                  timeRange === range ? "text-white" : "text-foreground"
                }`}
              >
                {range === "day" ? "일" : range === "month" ? "월" : "년"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 통계 카드 */}
        <View className="gap-4 mb-6">
          {/* 총 구매액 */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-sm font-semibold text-muted mb-2">총 구매액</Text>
            <Text className="text-3xl font-bold text-primary">
              {stats.totalAmount.toLocaleString()}원
            </Text>
          </View>

          {/* 구매 건수 */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-sm font-semibold text-muted mb-2">구매 건수</Text>
            <Text className="text-3xl font-bold text-foreground">{stats.totalCount}건</Text>
          </View>

          {/* 평균 구매액 */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-sm font-semibold text-muted mb-2">평균 구매액</Text>
            <Text className="text-3xl font-bold text-foreground">
              {Math.round(stats.averageAmount).toLocaleString()}원
            </Text>
          </View>
        </View>

        {/* 상위 고객 */}
        <View className="mb-8">
          <Text className="text-sm font-semibold text-foreground mb-3">
            상위 고객 (구매액 기준)
          </Text>
          {stats.topCustomers.length === 0 ? (
            <View className="bg-surface rounded-2xl p-6 border border-border items-center justify-center py-8">
              <Text className="text-muted text-sm">구매 내역이 없습니다</Text>
            </View>
          ) : (
            <View className="gap-2">
              {stats.topCustomers.map((customer, index) => (
                <View key={customer.id} className="bg-surface rounded-lg p-4 border border-border flex-row justify-between items-center">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-1">
                      <Text className="text-sm font-semibold text-primary">#{index + 1}</Text>
                      <Text className="text-base font-semibold text-foreground">{customer.name}</Text>
                    </View>
                    <Text className="text-xs text-muted">{customer.phone}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-lg font-bold text-primary">
                      {(typeof customer.purchasePrice === "number" ? customer.purchasePrice : 0).toLocaleString()}원
                    </Text>
                    <Text className="text-xs text-muted">{customer.purchaseQuantity || 1}개</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
