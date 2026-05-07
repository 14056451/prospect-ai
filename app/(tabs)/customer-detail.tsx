import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { STATUS_COLORS, STATUS_LABELS, CustomerStatus } from "@/shared/types";

/**
 * 고객 상세 화면
 * 
 * 개별 고객의 정보, 상담 메모, 구매 내역, 상태 변경 기능 제공
 */
export default function CustomerDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const customerId = parseInt(params.id as string);

  const [memoContent, setMemoContent] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<CustomerStatus>("1차상담");
  const [showAddPurchaseModal, setShowAddPurchaseModal] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState({
    purchaseDate: new Date().toISOString().split("T")[0],
    productName: "",
    quantity: "1",
    price: "",
    expiryDate: "",
  });

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
    if (customer && (customer.status === "1차상담" || customer.status === "2차")) {
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

  const handleAddPurchase = () => {
    if (!purchaseForm.productName.trim() || !purchaseForm.price.trim()) {
      Alert.alert("입력 오류", "제품명과 가격을 입력하세요");
      return;
    }

    // 구매 내역 저장 (현재는 고객 정보에 추가)
    const totalPrice = parseFloat(purchaseForm.price) * parseInt(purchaseForm.quantity);
    updateCustomerMutation.mutate({
      id: customerId,
      purchaseItem: purchaseForm.productName,
      purchaseQuantity: parseInt(purchaseForm.quantity),
      purchasePrice: totalPrice,
    });

    // 모달 닫기 및 폼 초기화
    setShowAddPurchaseModal(false);
    setPurchaseForm({
      purchaseDate: new Date().toISOString().split("T")[0],
      productName: "",
      quantity: "1",
      price: "",
      expiryDate: "",
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

  // 사용기한 알림 계산
  const getExpiryWarning = () => {
    if (!customer.purchasePrice) return null;
    const today = new Date();
    const oneWeekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    // 실제로는 purchasePrice 필드에 expiryDate를 저장해야 하지만, 현재는 간단히 표시
    return null;
  };

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
        </View>

        {/* 상태 변경 */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-foreground mb-3">상담 상태</Text>
          <View className="gap-2">
            {(["1차상담", "2차"] as const).map((status) => (
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

        {/* 구매 내역 배너 */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-sm font-semibold text-foreground">구매 내역</Text>
            <TouchableOpacity
              onPress={() => setShowAddPurchaseModal(true)}
              className="bg-primary px-3 py-1 rounded-full"
            >
              <Text className="text-white text-xs font-semibold">+ 추가</Text>
            </TouchableOpacity>
          </View>

          {customer.purchaseItem ? (
            <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
              <View>
                <Text className="text-xs font-semibold text-muted mb-1">제품명</Text>
                <Text className="text-lg font-semibold text-foreground">{customer.purchaseItem}</Text>
              </View>
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-muted mb-1">수량</Text>
                  <Text className="text-base font-semibold text-foreground">{customer.purchaseQuantity || 1}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-muted mb-1">가격</Text>
                  <Text className="text-base font-semibold text-foreground">
                    {customer.purchasePrice ? `${customer.purchasePrice.toLocaleString()}원` : "-"}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View className="bg-surface rounded-2xl p-4 border border-border items-center justify-center py-8">
              <Text className="text-muted text-sm">구매 내역이 없습니다</Text>
            </View>
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
        <View className="mb-8">
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

      {/* 구매 내역 추가 모달 */}
      <Modal
        visible={showAddPurchaseModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddPurchaseModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-6 gap-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xl font-bold text-foreground">구매 내역 추가</Text>
              <TouchableOpacity onPress={() => setShowAddPurchaseModal(false)}>
                <Text className="text-2xl text-muted">×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* 구매 일자 */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">구매 일자</Text>
                <TextInput
                  placeholder="YYYY-MM-DD"
                  value={purchaseForm.purchaseDate}
                  onChangeText={(text) =>
                    setPurchaseForm({ ...purchaseForm, purchaseDate: text })
                  }
                  className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                  placeholderTextColor="#687076"
                />
              </View>

              {/* 제품명 */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">제품명</Text>
                <TextInput
                  placeholder="제품명을 입력하세요"
                  value={purchaseForm.productName}
                  onChangeText={(text) =>
                    setPurchaseForm({ ...purchaseForm, productName: text })
                  }
                  className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                  placeholderTextColor="#687076"
                />
              </View>

              {/* 수량 */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">수량</Text>
                <TextInput
                  placeholder="수량"
                  value={purchaseForm.quantity}
                  onChangeText={(text) =>
                    setPurchaseForm({ ...purchaseForm, quantity: text })
                  }
                  keyboardType="number-pad"
                  className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                  placeholderTextColor="#687076"
                />
              </View>

              {/* 가격 */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">가격 (원)</Text>
                <TextInput
                  placeholder="가격"
                  value={purchaseForm.price}
                  onChangeText={(text) =>
                    setPurchaseForm({ ...purchaseForm, price: text })
                  }
                  keyboardType="number-pad"
                  className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                  placeholderTextColor="#687076"
                />
              </View>

              {/* 사용기한 */}
              <View className="mb-6">
                <Text className="text-sm font-semibold text-foreground mb-2">사용기한 (선택)</Text>
                <TextInput
                  placeholder="YYYY-MM-DD"
                  value={purchaseForm.expiryDate}
                  onChangeText={(text) =>
                    setPurchaseForm({ ...purchaseForm, expiryDate: text })
                  }
                  className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                  placeholderTextColor="#687076"
                />
              </View>

              {/* 저장 버튼 */}
              <TouchableOpacity
                onPress={handleAddPurchase}
                disabled={updateCustomerMutation.isPending}
                className="bg-primary py-4 rounded-lg items-center justify-center"
              >
                {updateCustomerMutation.isPending ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white font-semibold text-base">저장</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
