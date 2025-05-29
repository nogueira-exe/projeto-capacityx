// app/novo-apontamento.tsx
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Button,
  Alert,
  Switch,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { format } from "date-fns";

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

  const [showDatePicker, setShowDatePicker] = useState(false);

  function handleChange(field: keyof ApontamentoForm, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleDateChange(_: any, selectedDate?: Date) {
    setShowDatePicker(false);
    if (selectedDate) {
      handleChange("data", selectedDate.toISOString());
    }
  }

  async function handleSubmit() {
    try {
      await axios.post("http://192.168.3.112:3000/apontamento", form);
      Alert.alert("Sucesso", "Apontamento criado com sucesso");
    } catch (error: any) {
      Alert.alert("Erro", error.message);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
        Novo Apontamento
      </Text>

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
        <View key={key} style={{ marginBottom: 12 }}>
          <Text>{label}</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#CCC",
              borderRadius: 6,
              padding: 8,
            }}
            value={form[key as keyof ApontamentoForm] as string}
            onChangeText={(text) =>
              handleChange(key as keyof ApontamentoForm, text)
            }
          />
        </View>
      ))}

      <View style={{ marginBottom: 12 }}>
        <Text>Data</Text>
        <Button
          title={format(new Date(form.data), "dd/MM/yyyy")}
          onPress={() => setShowDatePicker(true)}
        />
        {showDatePicker && (
          <DateTimePicker
            value={new Date(form.data)}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </View>

      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}
      >
        <Text>Garantia</Text>
        <Switch
          value={form.garantia}
          onValueChange={(val) => handleChange("garantia", val)}
          style={{ marginLeft: 10 }}
        />
      </View>

      <Button title="Cadastrar" onPress={handleSubmit} />
    </ScrollView>
  );
}
