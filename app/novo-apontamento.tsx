import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { format } from "date-fns";
import { router } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

type ApontamentoForm = {
  id_usuario: string;
  id_categoria: string;
  id_cliente: string;
  id_item_projeto_categoria: string;
  data: string;
  horas: string;
  descricao: string;
  projeto: string;
  extra: string;
  status_extra: string;
  resposta_extra: string;
  observacao: string;
  garantia: boolean;
};

export default function NovoApontamentoScreen() {
  const [form, setForm] = useState<ApontamentoForm>({
    id_usuario: "",
    id_categoria: "",
    id_cliente: "",
    id_item_projeto_categoria: "",
    data: new Date().toISOString(),
    horas: "",
    descricao: "",
    projeto: "",
    extra: "",
    status_extra: "",
    resposta_extra: "",
    observacao: "",
    garantia: false,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  const buttonScale = useSharedValue(1);
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  function handleChange(field: keyof ApontamentoForm, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  }

  function validateField(field: keyof ApontamentoForm, value: any) {
    if (["id_usuario", "projeto", "horas", "descricao"].includes(field) && !value) {
      setErrors((prev) => ({ ...prev, [field]: `${field === "id_usuario" ? "Usuário" : field.charAt(0).toUpperCase() + field.slice(1)} é obrigatório` }));
    } else if (field === "horas" && value && !/^\d{2}:\d{2}$/.test(value)) {
      setErrors((prev) => ({ ...prev, [field]: "Horas deve estar no formato HH:mm" }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  }

  function handleDateChange(_: any, selectedDate?: Date) {
    setShowDatePicker(false);
    if (selectedDate) {
      handleChange("data", selectedDate.toISOString());
    }
  }

  async function handleSubmit() {
    const requiredFields: (keyof ApontamentoForm)[] = ["id_usuario", "projeto", "horas", "descricao"];
    const newErrors: { [key: string]: string } = {};
    requiredFields.forEach((field) => {
      if (!form[field]) {
        newErrors[field] = `${field === "id_usuario" ? "Usuário" : field.charAt(0).toUpperCase() + field.slice(1)} é obrigatório`;
      }
    });
    if (form.horas && !/^\d{2}:\d{2}$/.test(form.horas)) {
      newErrors.horas = "Horas deve estar no formato HH:mm";
    }
    setErrors(newErrors);
    if (Object.values(newErrors).some((error) => error)) {
      Alert.alert("Erro", "Corrija os campos destacados antes de salvar.");
      return;
    }
    try {
      await axios.post("http://192.168.1.13:3000/apontamento", form);
      Alert.alert("Sucesso", "Apontamento criado com sucesso");
      router.push("/home");
    } catch (error: any) {
      Alert.alert("Erro", error.message);
    }
  }

  const handleButtonPressIn = () => {
    buttonScale.value = withSpring(0.95);
  };

  const handleButtonPressOut = () => {
    buttonScale.value = withSpring(1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#2563eb" />
        </TouchableOpacity>
        <Text style={styles.title}>Novo Apontamento</Text>
      </View>

      <ScrollView contentContainerStyle={styles.formContainer}>
        {Object.entries({
          id_usuario: "Usuário",
          id_categoria: "Categoria",
          id_cliente: "Cliente",
          id_item_projeto_categoria: "Item Projeto/Categoria",
          horas: "Horas",
          descricao: "Descrição",
          projeto: "Projeto",
          extra: "Extra",
          status_extra: "Status Extra",
          resposta_extra: "Resposta Extra",
          observacao: "Observação",
        }).map(([key, label]) => (
          <View key={key} style={styles.inputContainer}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={[styles.input, errors[key] ? styles.inputError : null]}
              value={form[key as keyof ApontamentoForm] as string}
              onChangeText={(text) => handleChange(key as keyof ApontamentoForm, text)}
              placeholder={`Digite ${label.toLowerCase()}`}
              placeholderTextColor="#9ca3af"
              accessibilityLabel={label}
              accessibilityHint={`Digite o ${label.toLowerCase()} do apontamento`}
            />
            {errors[key] ? <Text style={styles.errorText}>{errors[key]}</Text> : null}
          </View>
        ))}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Data</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
            accessibilityLabel="Selecionar data"
            accessibilityHint="Toque para abrir o seletor de data"
          >
            <Icon name="calendar-today" size={20} color="#2563eb" style={styles.dateIcon} />
            <Text style={styles.dateText}>{format(new Date(form.data), "dd/MM/yyyy")}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={new Date(form.data)}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.label}>Garantia</Text>
          <Switch
            value={form.garantia}
            onValueChange={(val) => handleChange("garantia", val)}
            trackColor={{ false: "#9ca3af", true: "#2563eb" }}
            thumbColor={form.garantia ? "#ffffff" : "#f4f4f5"}
            accessibilityLabel="Garantia"
            accessibilityHint="Alterne para ativar ou desativar a garantia"
          />
        </View>

        <Animated.View style={[styles.submitButton, buttonAnimatedStyle]}>
          <TouchableOpacity
            onPressIn={handleButtonPressIn}
            onPressOut={handleButtonPressOut}
            onPress={handleSubmit}
            accessibilityLabel="Cadastrar apontamento"
            accessibilityHint="Toque para salvar o novo apontamento"
          >
            <Text style={styles.submitButtonText}>Cadastrar</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
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
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
    textAlign: "center",
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    borderColor: "#e5e7eb",
    borderWidth: 1,
    color: "#1f2937",
  },
  inputError: {
    borderColor: "#dc2626",
    borderWidth: 2,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 12,
    marginTop: 4,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 10,
    borderColor: "#e5e7eb",
    borderWidth: 1,
  },
  dateIcon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 16,
    color: "#1f2937",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});