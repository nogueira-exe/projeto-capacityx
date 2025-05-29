// app/editar-apontamento/[id].tsx
import { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, Button, Alert, Switch } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format } from 'date-fns';

export default function EditarApontamentoScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    axios.get(`http://192.168.3.112:3000/apontamento/${id}`)
      .then(res => setForm(res.data))
      .catch(err => Alert.alert('Erro ao carregar apontamento', err.message))
      .finally(() => setLoading(false));
  }, [id]);

  function handleChange(field: string, value: any) {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  }

  function handleDateChange(_: any, selectedDate?: Date) {
    setShowDatePicker(false);
    if (selectedDate) {
      handleChange('data', selectedDate.toISOString());
    }
  }

  async function handleSubmit() {
    try {
      await axios.put(`http://192.168.3.112:3000/apontamento/${id}`, form);
      Alert.alert('Sucesso', 'Apontamento atualizado com sucesso');
      router.back();
    } catch (error: any) {
      Alert.alert('Erro ao atualizar', error.message);
    }
  }

  if (loading || !form) return <Text style={{ padding: 20 }}>Carregando...</Text>;

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Editar Apontamento</Text>

      {Object.entries({
        id_usuario: 'Usuário',
        id_categoria: 'Categoria',
        id_cliente: 'Cliente',
        id_item_projeto_categoria: 'Item Projeto/Categoria',
        horas: 'Horas',
        descricao: 'Descrição',
        projeto: 'Projeto',
        extra: 'Extra',
        status_extra: 'Status Extra',
        resposta_extra: 'Resposta Extra',
        observacao: 'Observação',
      }).map(([key, label]) => (
        <View key={key} style={{ marginBottom: 12 }}>
          <Text>{label}</Text>
          <TextInput
            style={{ borderWidth: 1, borderColor: '#CCC', borderRadius: 6, padding: 8 }}
            value={form[key]}
            onChangeText={text => handleChange(key, text)}
          />
        </View>
      ))}

      <View style={{ marginBottom: 12 }}>
        <Text>Data</Text>
        <Button
          title={format(new Date(form.data), 'dd/MM/yyyy')}
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

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <Text>Garantia</Text>
        <Switch
          value={form.garantia}
          onValueChange={val => handleChange('garantia', val)}
          style={{ marginLeft: 10 }}
        />
      </View>

      <Button title="Salvar Alterações" onPress={handleSubmit} />
    </ScrollView>
  );
}
