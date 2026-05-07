import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { trpc } from "@/lib/trpc";

/**
 * 알림 화면
 * 
 * 다음 연락일, 사용기한 등의 알림을 표시합니다.
 */
export default function NotificationsScreen() {
  const router = useRouter();

  // 고객 목록 조회
  const { data: customers = [], isLoading } = trpc.customers.list.useQuery();

  // 알림 계산
  const notifications = useMemo(() => {
    const alerts: any[] = [];
    const now = new Date();

    customers.forEach((customer) => {
      // 다음 연락일 알림
      if (customer.nextContactDate) {
        const nextDate = new Date(customer.nextContactDate);
        const daysUntil = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntil === 0) {
          alerts.push({
            id: `contact-${customer.id}`,
            type: "contact-today",
            title: `[오늘] ${customer.name}님 연락 예정`,
            description: `${customer.name}님에게 연락할 예정입니다`,
            customer,
            date: nextDate,
            priority: "high",
          });
        } else if (daysUntil === 1) {
          alerts.push({
            id: `contact-${customer.id}`,
            type: "contact-tomorrow",
            title: `[내일] ${customer.name}님 연락 예정`,
            description: `내일 ${customer.name}님에게 연락할 예정입니다`,
            customer,
            date: nextDate,
            priority: "medium",
          });
        } else if (daysUntil > 0 && daysUntil <= 7) {
          alerts.push({
            id: `contact-week-${customer.id}`,
            type: "contact-week",
            title: `${customer.name}님 연락 예정 (${daysUntil}일 후)`,
            description: `${daysUntil}일 후 ${customer.name}님에게 연락할 예정입니다`,
            customer,
            date: nextDate,
            priority: "low",
          });
        }
      }
    });

    // 우선순위로 정렬
    return (alerts as any[]).sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
    });
  }, [customers]);

  const renderNotification = ({ item }: any) => {
    const priorityColor = {
      high: "bg-error/10 border-error",
      medium: "bg-warning/10 border-warning",
      low: "bg-primary/10 border-primary",
    };

    const priorityIcon = {
      high: "🔴",
      medium: "🟡",
      low: "🔵",
    };

    return (
      <TouchableOpacity
        onPress={() => router.push(`/(tabs)/customers?id=${item.customer.id}`)}
        className={`rounded-lg p-4 border mb-3 flex-row gap-3 ${priorityColor[item.priority as keyof typeof priorityColor]}`}
      >
        <Text className="text-2xl">{priorityIcon[item.priority as keyof typeof priorityIcon]}</Text>
        <View className="flex-1">
          <Text className="font-semibold text-foreground mb-1">{item.title}</Text>
          <Text className="text-sm text-muted">{item.description}</Text>
          <Text className="text-xs text-muted mt-2">
            {item.date.toLocaleDateString("ko-KR", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

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
          <Text className="text-2xl font-bold text-foreground">알림</Text>
          <View className="w-6" />
        </View>

        {/* 알림 목록 */}
        {notifications.length === 0 ? (
          <View className="bg-surface rounded-2xl p-6 border border-border items-center justify-center py-12">
            <Text className="text-muted text-center">
              알림이 없습니다{"\n"}모든 일정이 정상입니다
            </Text>
          </View>
        ) : (
          <View className="mb-8">
            <Text className="text-sm font-semibold text-foreground mb-3">
              총 {notifications.length}개의 알림
            </Text>
            <FlatList
              data={notifications}
              renderItem={renderNotification}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* 알림 설정 */}
        <View className="bg-surface rounded-2xl p-4 border border-border mb-8">
          <Text className="text-sm font-semibold text-foreground mb-3">알림 설정</Text>
          <View className="gap-2">
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-muted">다음 연락일 1일 전 알림</Text>
              <Text className="text-sm font-semibold text-primary">활성화</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-muted">다음 연락일 당일 알림</Text>
              <Text className="text-sm font-semibold text-primary">활성화</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-muted">사용기한 1주일 전 알림</Text>
              <Text className="text-sm font-semibold text-primary">활성화</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
