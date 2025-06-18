import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, FadeIn } from "react-native-reanimated";

// Tipagem do Apontamento
export type Apontamento = {
  id: number;
  id_usuario: string;
  id_categoria: string;
  id_cliente: string;
  id_item_projeto_categoria: string;
  data: string;
  horas: string;
  descricao: string;
  projeto: string;
  extra: string;
  data_de_exclusao?: string | null;
  status_extra: string;
  resposta_extra: string;
  observacao: string;
  garantia: boolean;
};

export default function HomeScreen() {
  const router = useRouter();
  const [apontamentos, setApontamentos] = useState<Apontamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [apontamentoToDelete, setApontamentoToDelete] = useState<number | null>(null);
  const [filter, setFilter] = useState({ period: "all", garantia: "all" });

  const fabScale = useSharedValue(1);
  const modalTranslateY = useSharedValue(100);

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withSpring(modalTranslateY.value) }],
  }));

  const fetchApontamentos = async () => {
    try {
      const response = await axios.get("http://192.168.1.13:3000/apontamento");
      const activeApontamentos = response.data.filter((item: Apontamento) => !item.data_de_exclusao);
      setApontamentos(activeApontamentos);
      setErrorMsg("");
    } catch (error) {
      setErrorMsg("Erro ao carregar apontamentos.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApontamentos();
  }, []);

  useEffect(() => {
    modalTranslateY.value = modalVisible ? 0 : 100;
  }, [modalVisible]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchApontamentos();
  }, []);

  const filteredApontamentos = apontamentos.filter((item) => {
    const matchesSearch =
      item.projeto.toLowerCase().includes(search.toLowerCase()) ||
      item.descricao.toLowerCase().includes(search.toLowerCase());
    const matchesGarantia = filter.garantia === "all" || item.garantia === (filter.garantia === "true");
    const matchesPeriod =
      filter.period === "all" ||
      (filter.period === "7days" &&
        new Date(item.data) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (filter.period === "30days" &&
        new Date(item.data) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    return matchesSearch && matchesGarantia && matchesPeriod;
  });

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://192.168.1.13:3000/apontamento/${id}`);
      fetchApontamentos();
      setModalVisible(false);
      setApontamentoToDelete(null);
    } catch (error) {
      alert("Erro ao excluir apontamento.");
    }
  };

  const confirmDelete = (id: number) => {
    setApontamentoToDelete(id);
    setModalVisible(true);
  };

  const cancelDelete = () => {
    setModalVisible(false);
    setApontamentoToDelete(null);
  };

  const handleFabPressIn = () => {
    fabScale.value = withSpring(0.95);
  };

  const handleFabPressOut = () => {
    fabScale.value = withSpring(1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Apontamentos</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Icon name="refresh" size={24} color="#2563eb" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter.period === "all" && styles.filterButtonActive]}
          onPress={() => setFilter((prev) => ({ ...prev, period: "all" }))}
        >
          <Text style={[styles.filterText, filter.period === "all" && styles.filterTextActive]}>Todos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter.period === "7days" && styles.filterButtonActive]}
          onPress={() => setFilter((prev) => ({ ...prev, period: "7days" }))}
        >
          <Text style={[styles.filterText, filter.period === "7days" && styles.filterTextActive]}>7 Dias</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter.period === "30days" && styles.filterButtonActive]}
          onPress={() => setFilter((prev) => ({ ...prev, period: "30days" }))}
        >
          <Text style={[styles.filterText, filter.period === "30days" && styles.filterTextActive]}>30 Dias</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter.garantia === "all" && styles.filterButtonActive]}
          onPress={() => setFilter((prev) => ({ ...prev, garantia: "all" }))}
        >
          <Text style={[styles.filterText, filter.garantia === "all" && styles.filterTextActive]}>Garantia: Todos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter.garantia === "true" && styles.filterButtonActive]}
          onPress={() => setFilter((prev) => ({ ...prev, garantia: "true" }))}
        >
          <Text style={[styles.filterText, filter.garantia === "true" && styles.filterTextActive]}>Com Garantia</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter.garantia === "false" && styles.filterButtonActive]}
          onPress={() => setFilter((prev) => ({ ...prev, garantia: "false" }))}
        >
          <Text style={[styles.filterText, filter.garantia === "false" && styles.filterTextActive]}>Sem Garantia</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por projeto ou descrição..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#9ca3af"
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Carregando apontamentos...</Text>
        </View>
      ) : errorMsg !== "" ? (
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={24} color="#dc2626" style={styles.errorIcon} />
          <Text style={styles.error}>{errorMsg}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredApontamentos}
          keyExtractor={(item) => item.id.toString()}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Animated.View entering={FadeIn.duration(300)} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.projeto}</Text>
                <Text style={styles.cardDate}>
                  {new Date(item.data).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })} às {item.horas}
                </Text>
              </View>
              <Text style={styles.cardDesc}>{item.descricao}</Text>
              {item.observacao ? (
                <Text style={styles.cardObs}>Obs: {item.observacao}</Text>
              ) : null}
              <Text style={styles.cardStatus}>
                Garantia: {item.garantia ? "Sim" : "Não"}
              </Text>
              {item.status_extra && (
                <Text
                  style={[
                    styles.cardStatusExtra,
                    {
                      backgroundColor:
                        item.status_extra === "Pendente"
                          ? "#f59e0b"
                          : item.status_extra === "Aprovado"
                          ? "#10b981"
                          : "#6b7280",
                    },
                  ]}
                >
                  Status Extra: {item.status_extra}
                </Text>
              )}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.containerBtnEdit}
                  onPress={() => {
                    router.push({
                      pathname: `../editar-apontamento/${item.id}`,
                      params: { id: item.id.toString() },
                    });
                  }}
                  accessibilityLabel={`Editar apontamento ${item.projeto}`}
                  accessibilityHint="Toque para editar os detalhes do apontamento"
                >
                  <Icon name="edit" size={20} color="#fff" />
                  <Text style={styles.actionText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.containerBtnDelete}
                  onPress={() => confirmDelete(item.id)}
                  accessibilityLabel={`Excluir apontamento ${item.projeto}`}
                  accessibilityHint="Toque para excluir o apontamento"
                >
                  <Icon name="delete" size={20} color="#fff" />
                  <Text style={styles.actionText}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        />
      )}

      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={cancelDelete}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContainer, modalAnimatedStyle]}>
            <Icon name="warning" size={32} color="#dc2626" style={styles.modalIcon} />
            <Text style={styles.modalTitle}>Confirmar Exclusão</Text>
            <Text style={styles.modalMessage}>
              Tem certeza que deseja excluir este apontamento? Esta ação não pode ser desfeita.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={cancelDelete}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={() => {
                  if (apontamentoToDelete !== null) {
                    handleDelete(apontamentoToDelete);
                  }
                }}
              >
                <Text style={styles.modalButtonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      <Animated.View style={[styles.fab, fabAnimatedStyle]}>
        <TouchableOpacity
          onPressIn={handleFabPressIn}
          onPressOut={handleFabPressOut}
          onPress={() => router.push("/novo-apontamento")}
          accessibilityLabel="Criar novo apontamento"
          accessibilityHint="Toque para abrir o formulário de criação de apontamento"
        >
          <Icon name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
    textAlign: "left",
  },
  refreshButton: {
    padding: 8,
  },
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  filterButtonActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  filterText: {
    fontSize: 14,
    color: "#4b5563",
  },
  filterTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderColor: "#e5e7eb",
    borderWidth: 1,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1f2937",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: "#4b5563",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    gap: 8,
  },
  errorIcon: {
    marginRight: 8,
  },
  error: {
    fontSize: 16,
    color: "#dc2626",
    textAlign: "center",
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
  },
  cardDate: {
    fontSize: 12,
    color: "#9ca3af",
  },
  cardDesc: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 8,
    lineHeight: 20,
  },
  cardObs: {
    fontSize: 13,
    color: "#2563eb",
    marginBottom: 8,
  },
  cardStatus: {
    fontSize: 13,
    color: "#10b981",
    marginBottom: 8,
  },
  cardStatusExtra: {
    fontSize: 13,
    color: "#ffffff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  containerBtnEdit: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    borderRadius: 8,
    padding: 10,
  },
  containerBtnDelete: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dc2626",
    borderRadius: 8,
    padding: 10,
  },
  actionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#2563eb",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    width: "85%",
    alignItems: "center",
  },
  modalIcon: {
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: "#4b5563",
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonCancel: {
    backgroundColor: "#6b7280",
  },
  modalButtonConfirm: {
    backgroundColor: "#dc2626",
  },
  modalButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});