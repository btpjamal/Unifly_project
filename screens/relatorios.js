import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { observarPedidos, atualizarStatusPedido } from '../firebaseService';
import { Alert } from 'react-native';

const statusOptions = ['pendente', 'em_preparo', 'pronto', 'entregue'];

export default function RelatoriosScreen({ route }) {
  const { comercioId } = route.params;
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    const unsubscribe = observarPedidos(comercioId, (novosPedidos) => {
      setPedidos(novosPedidos);
    });
    return () => unsubscribe();
  }, [comercioId]);

  const atualizarStatus = async (pedidoId, novoStatus) => {
    try {
         if (!pedidoId || !novoStatus) return;
      await atualizarStatusPedido(pedidoId, novoStatus);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o status');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pedidos Recentes</Text>
      
      <FlatList
        data={pedidos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.pedidoContainer}>
            <Text>Pedido #{item.id.slice(0, 6)}</Text>
            <Text>Cliente: {item.token.slice(0, 6)}</Text>
            <Text>Total: R$ {item.total.toFixed(2)}</Text>
            <Text>Status: {item.status}</Text>
            
            <View style={styles.statusButtons}>
              {statusOptions.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusButton,
                    item.status === status && styles.selectedStatus
                  ]}
                  onPress={() => atualizarStatus(item.id, status)}
                >
                  <Text style={styles.buttonText}>
                    {status.replace('_', ' ').toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F7FA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1A2233',
  },
  pedidoContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statusButton: {
    backgroundColor: '#4A6A5A',
    padding: 8,
    borderRadius: 5,
    marginHorizontal: 2,
  },
  selectedStatus: {
    backgroundColor: '#6A0DAD',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
  },
});