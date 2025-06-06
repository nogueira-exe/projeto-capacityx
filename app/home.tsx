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

  const fetchApontamentos = async () => {
    try {
      const response = await axios.get("http://172.16.0.64:3000/apontamento");
      setApontamentos(response.data);
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchApontamentos();
  }, []);

  const filteredApontamentos = apontamentos.filter(
    (item) =>
      item.projeto.toLowerCase().includes(search.toLowerCase()) ||
      item.descricao.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://172.16.0.64:3000/apontamento/${id}`);
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meus Apontamentos</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por projeto ou descrição..."
        value={search}
        onChangeText={setSearch}
      />

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#2563eb"
          style={{ marginTop: 40 }}
        />
      ) : errorMsg !== "" ? (
        <Text style={styles.error}>{errorMsg}</Text>
      ) : (
        <FlatList
          data={filteredApontamentos}
          keyExtractor={(item) => item.id.toString()}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.projeto}</Text>
              <Text style={styles.cardDesc}>{item.descricao}</Text>
              <Text style={styles.cardDate}>
                {new Date(item.data).toLocaleDateString()} às {item.horas}
              </Text>
              {item.observacao ? (
                <Text style={styles.cardObs}>Obs: {item.observacao}</Text>
              ) : null}
              <Text style={styles.cardStatus}>
                Garantia: {item.garantia ? "Sim" : "Não"}
              </Text>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.containerBtnEdit}
                  onPress={() => {
                    router.push({
                      pathname: `../editar-apontamento/${item.id}`,
                      params: { id: item.id.toString() },
                    });
                  }}
                >
                  <Icon
                    name="edit"
                    size={22}
                    color="#FFF"
                    style={styles.actionIcon}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.containerBtnDelete}
                  onPress={() => confirmDelete(item.id)}
                >
                  <Icon
                    name="delete"
                    size={22}
                    color="#FFF"
                    style={styles.actionIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={cancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirmar Exclusão</Text>
            <Text style={styles.modalMessage}>
              Tem certeza que deseja excluir este apontamento?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={cancelDelete}
              >
                <Text style={styles.modalButtonText}>Não</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={() => {
                  if (apontamentoToDelete !== null) {
                    handleDelete(apontamentoToDelete);
                  }
                }}
              >
                <Text style={styles.modalButtonText}>Sim</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/novo-apontamento")}
      >
        <Icon name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
    textAlign: "center",
  },
  searchInput: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 16,
    borderColor: "#e5e7eb",
    borderWidth: 1,
  },
  error: {
    color: "#dc2626",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  list: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 15,
    color: "#4b5563",
    marginBottom: 6,
  },
  cardDate: {
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 4,
  },
  cardObs: {
    fontSize: 13,
    color: "#2563eb",
    marginBottom: 4,
  },
  cardStatus: {
    fontSize: 13,
    color: "#10b981",
  },
  actions: {
    flexDirection: "row",
    marginTop: 10,
    gap: 12,
  },
  actionIcon: {
    padding: 4,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#2563eb",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  containerBtnDelete: {
    backgroundColor: "#dc2626",
    borderRadius: 6,
  },
  containerBtnEdit: {
    backgroundColor: "#2563eb",
    borderRadius: 6,
  },
  // Estilos para o modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: "#4b5563",
    marginBottom: 20,
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    gap: 16,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonCancel: {
    backgroundColor: "#9ca3af",
  },
  modalButtonConfirm: {
    backgroundColor: "#dc2626",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});