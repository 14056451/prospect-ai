import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { STATUS_COLORS, STATUS_LABELS, CustomerStatus } from "@/shared/types";

/**
 * 고객 상세 화면
 * 
 * 개별 고객의 정보, 상담 메모, 상태 변경 기능 제공
 */
export default function CustomerDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const customerId = parseInt(params.id as string);

  const [memoContent, setMemoContent] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<CustomerStatus>("1차상담");

  // API 호출
  const { data: customer, isLoading: customerLoading, refetch: refetchCustomer } = trpc.customers.get.useQuery(
    { id: customerId },
    { enabled: !!customerId }
  );

  const { data: memos = [], refetch: refetchMemos } = trpc.memos.listByCustomer.useQuery(
    { customerId },
    { enabled: !!customerId }
  );

  const updateCustomerMutation = trpc.customers.update.useMutation({
    onSuccess: () => {
      refetchCustomer();
      Alert.alert("성공", "고객 정보가 업데이트되었습니다");
    },
    onError: (error) => {
      Alert.alert("오류", error.message || "업데이트에 실패했습니다");
    },
  });

  const createMemoMutation = trpc.memos.create.useMutation({
    onSuccess: () => {
      refetchMemos();
      setMemoContent("");
      Alert.alert("성공", "메모가 저장되었습니다");
    },
    onError: (error) => {
      Alert.alert("오류", error.message || "메모 저장에 실패했습니다");
    },
  });

  useEffect(() => {
    if (customer) {
      setSelectedStatus(customer.status);
    }
  }, [customer]);

  if (customerLoading) {
    return (
      <ScreenContainer className="justify-center items-center">
        <ActivityIndicator size="large" color="#0a7ea4" />
      </ScreenContainer>
    );
  }

  if (!customer) {
    return (
      <ScreenContainer className="justify-center items-center">
        <Text className="text-muted">고객을 찾을 수 없습니다</Text>
      </ScreenContainer>
    );
  }

  const handleUpdateStatus = () => {
    if (selectedStatus !== customer.status) {
      updateCustomerMutation.mutate({
        id: customerId,
        status: selectedStatus,
      });
    }
  };

  const handleAddMemo = () => {
    if (!memoContent.trim()) {
      Alert.alert("입력 오류", "메모 내용을 입력하세요");
      return;
    }

    createMemoMutation.mutate({
      customerId,
      content: memoContent,
      consultationDate: new Date(),
    });
  };

  const renderMemoItem = ({ item }: any) => (
    <View className="bg-surface rounded-2xl p-4 mb-3 border border-border">
      <Text className="text-sm text-muted mb-2">
        {new Date(item.consultationDate).toLocaleDateString("ko-KR")}
      </Text>
      <Text className="text-sm text-foreground leading-relaxed">{item.content}</Text>
      {item.aiSummary && (
        <View className="mt-3 p-3 bg-primary/10 rounded-lg">
          <Text className="text-xs font-semibold text-primary mb-1">AI 요약</Text>
          <Text className="text-xs text-foreground">{item.aiSummary}</Text>
        </View>
      )}
    </View>
  );

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-2xl text-primary">←</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-foreground">{customer.name}</Text>
          <View className="w-6" />
        </View>

        {/* 고객 정보 카드 */}
        <View className="bg-surface rounded-2xl p-6 mb-6 border border-border gap-4">
          <View>
            <Text className="text-xs font-semibold text-muted mb-1">전화번호</Text>
            <Text className="text-lg font-semibold text-foreground">{customer.phone}</Text>
          </View>

          {customer.occupation && (
            <View>
              <Text className="text-xs font-semibold text-muted mb-1">직업</Text>
              <Text className="text-lg font-semibold text-foreground">{customer.occupation}</Text>
            </View>
          )}

          {customer.company && (
            <View>
              <Text className="text-xs font-semibold text-muted mb-1">회사</Text>
              <Text className="text-lg font-semibold text-foreground">{customer.company}</Text>
            </View>
          )}

          {customer.nextContactDate && (
            <View>
              <Text className="text-xs font-semibold text-muted mb-1">다음 연락일</Text>
              <Text className="text-lg font-semibold text-foreground">
                {new Date(customer.nextContactDate).toLocaleDateString("ko-KR")}
              </Text>
            </View>
          )}

          {customer.purchaseItem && (
            <View>
              <Text className="text-xs font-semibold text-muted mb-1">구매 정보</Text>
              <Text className="text-lg font-semibold text-foreground">
                {customer.purchaseItem} × {customer.purchaseQuantity || 1}
                {customer.purchasePrice && ` (${customer.purchasePrice}원)`}
              </Text>
            </View>
          )}
        </View>

        {/* 상태 변경 */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-foreground mb-3">상담 상태</Text>
          <View className="gap-2">
            {(["1차상담", "2차", "소비자", "사업자"] as const).map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => setSelectedStatus(status)}
                className={`p-3 rounded-lg border-2 ${
                  selectedStatus === status
                    ? "bg-primary border-primary"
                    : "bg-surface border-border"
                }`}
              >
                <Text
                  className={`font-semibold text-center ${
                    selectedStatus === status ? "text-white" : "text-foreground"
                  }`}
                >
                  {(STATUS_LABELS as any)[status]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {selectedStatus !== customer.status && (
            <TouchableOpacity
              onPress={handleUpdateStatus}
              disabled={updateCustomerMutation.isPending}
              className="mt-3 bg-success py-3 rounded-lg items-center justify-center"
            >
              {updateCustomerMutation.isPending ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white font-semibold">상태 저장</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* 상담 메모 입력 */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-foreground mb-3">상담 메모</Text>
          <TextInput
            placeholder="오늘의 상담 내용을 입력하세요..."
            value={memoContent}
            onChangeText={setMemoContent}
            multiline
            numberOfLines={4}
            className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
            placeholderTextColor="#687076"
            textAlignVertical="top"
          />
          <TouchableOpacity
            onPress={handleAddMemo}
            disabled={createMemoMutation.isPending}
            className="mt-3 bg-primary py-3 rounded-lg items-center justify-center"
          >
            {createMemoMutation.isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-semibold">메모 저장</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 상담 메모 목록 */}
        <View>
          <Text className="text-sm font-semibold text-foreground mb-3">
            상담 기록 ({memos.length})
          </Text>
          {memos.length === 0 ? (
            <Text className="text-muted text-center py-6">상담 기록이 없습니다</Text>
          ) : (
            <FlatList
              data={memos}
              renderItem={renderMemoItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
