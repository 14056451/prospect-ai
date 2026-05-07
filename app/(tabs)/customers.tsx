import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { STATUS_COLORS, STATUS_LABELS, CustomerStatus } from "@/shared/types";

/**
 * 고객 리스트 화면
 * 
 * 모든 가망 고객을 리스트로 표시하고 필터링, 추가, 삭제 기능 제공
 */
export default function CustomersScreen() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<CustomerStatus | "전체">("전체");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    occupation: "",
  });

  // API 호출
  const { data: customers = [], isLoading, refetch, error: listError, isError: isListError } = trpc.customers.list.useQuery();
  const createCustomerMutation = trpc.customers.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowAddModal(false);
      setNewCustomer({ name: "", phone: "", occupation: "" });
    },
    onError: (error) => {
      Alert.alert("오류", error.message || "고객 추가에 실패했습니다");
    },
  });

  const deleteCustomerMutation = trpc.customers.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      Alert.alert("오류", error.message || "고객 삭제에 실패했습니다");
    },
  });

  // 필터링된 고객 목록
  const filteredCustomers = selectedStatus === "전체"
    ? customers
    : customers.filter((c) => c.status === selectedStatus);

  const handleAddCustomer = async () => {
    if (!newCustomer.name.trim() || !newCustomer.phone.trim()) {
      Alert.alert("입력 오류", "이름과 전화번호는 필수입니다");
      return;
    }

    createCustomerMutation.mutate({
      name: newCustomer.name,
      phone: newCustomer.phone,
      occupation: newCustomer.occupation || undefined,
      status: "1차상담",
    });
  };

  const handleDeleteCustomer = (id: number, name: string) => {
    Alert.alert(
      "삭제 확인",
      `${name} 고객을 삭제하시겠습니까?`,
      [
        { text: "취소", onPress: () => {} },
        {
          text: "삭제",
          onPress: () => deleteCustomerMutation.mutate({ id }),
          style: "destructive",
        },
      ]
    );
  };

  const renderCustomerItem = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => router.push(`/(tabs)/customer-detail?id=${item.id}`)}
      className="bg-surface rounded-2xl p-4 mb-3 border border-border active:opacity-70"
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-foreground">{item.name}</Text>
          <Text className="text-sm text-muted">{item.phone}</Text>
        </View>
      <View
        className="px-3 py-1 rounded-full"
        style={{ backgroundColor: (STATUS_COLORS as any)[item.status] }}
      >
        <Text className="text-xs font-semibold text-white">
          {(STATUS_LABELS as any)[item.status]}
        </Text>
      </View>
      </View>

      {item.occupation && (
        <Text className="text-sm text-muted mb-2">직업: {item.occupation}</Text>
      )}

      {item.nextContactDate && (
        <Text className="text-sm text-muted mb-2">
          다음 연락: {new Date(item.nextContactDate).toLocaleDateString("ko-KR")}
        </Text>
      )}

      {item.purchaseItem && (
        <Text className="text-sm text-muted">
          구매: {item.purchaseItem} x {item.purchaseQuantity || 1}
        </Text>
      )}

      <TouchableOpacity
        onPress={() => handleDeleteCustomer(item.id, item.name)}
        className="mt-3 py-2 px-3 bg-error/10 rounded-lg"
      >
        <Text className="text-xs font-semibold text-error text-center">삭제</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer className="p-4">
      <View className="flex-1">
        {/* 헤더 */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-foreground">고객 관리</Text>
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            className="bg-primary px-4 py-2 rounded-full"
          >
            <Text className="text-white font-semibold">+ 추가</Text>
          </TouchableOpacity>
        </View>

        {/* 상태 필터 탭 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
          contentContainerStyle={{ gap: 8 }}
        >
          {(["전체", "1차상담", "2차", "소비자", "사업자"] as const).map((status) => (
            <TouchableOpacity
              key={status}
              onPress={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-full ${
                selectedStatus === status
                  ? "bg-primary"
                  : "bg-surface border border-border"
              }`}
            >
              <Text
                className={`font-semibold text-sm ${
                  selectedStatus === status ? "text-white" : "text-foreground"
                }`}
              >
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 고객 리스트 */}
        {isListError ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-error text-center">오류: {listError?.message || '고객 목록을 불러올 수 없습니다'}</Text>
          </View>
        ) : isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#0a7ea4" />
          </View>
        ) : filteredCustomers.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-muted text-center">고객이 없습니다</Text>
          </View>
        ) : (
          <FlatList
            data={filteredCustomers}
            renderItem={renderCustomerItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={true}
          />
        )}
      </View>

      {/* 고객 추가 모달 */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-6 gap-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-2xl font-bold text-foreground">고객 추가</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text className="text-2xl text-muted">×</Text>
              </TouchableOpacity>
            </View>

            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">이름</Text>
              <TextInput
                placeholder="고객 이름"
                value={newCustomer.name}
                onChangeText={(text) =>
                  setNewCustomer({ ...newCustomer, name: text })
                }
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                placeholderTextColor="#687076"
              />
            </View>

            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">전화번호</Text>
              <TextInput
                placeholder="010-0000-0000"
                value={newCustomer.phone}
                onChangeText={(text) =>
                  setNewCustomer({ ...newCustomer, phone: text })
                }
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                placeholderTextColor="#687076"
              />
            </View>

            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">직업</Text>
              <TextInput
                placeholder="직업 (선택사항)"
                value={newCustomer.occupation}
                onChangeText={(text) =>
                  setNewCustomer({ ...newCustomer, occupation: text })
                }
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                placeholderTextColor="#687076"
              />
            </View>

            <TouchableOpacity
              onPress={handleAddCustomer}
              disabled={createCustomerMutation.isPending}
              className="bg-primary py-4 rounded-lg items-center justify-center mt-4"
            >
              {createCustomerMutation.isPending ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white font-semibold">저장하기</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
