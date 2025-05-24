// screens/statuspedido.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { observarPedido } from '../firebaseService';

const statusList = ['Pedido Recebido', 'Em Preparo', 'Pronto para Retirada'];

export default function StatusPedido({ navigation, route }) {
  const { pedidoId } = route.params; // Alterar para receber pedidoId ao invés de numeroPedido
  const [pedido, setPedido] = useState(null);

  useEffect(() => {
    const unsubscribe = observarPedido(pedidoId, (novoPedido) => {
      setPedido(novoPedido);
    });

    return () => unsubscribe();
  }, [pedidoId]);

  return (
    <View style={styles.container}>
      {pedido && (
        <>
          <Text style={styles.title}>Status do Pedido</Text>
          <Text style={styles.pedido}>Pedido #{pedido.id.slice(0, 6)}</Text>
          
          <View style={styles.statusBox}>
            <Text style={styles.statusText}>
              {traduzirStatus(pedido.status)}
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

// Helper para traduzir status
const traduzirStatus = (status) => {
  const traducoes = {
    pendente: "🕒 Pedido Recebido",
    preparo: "👨🍳 Em Preparo",
    pronto: "✅ Pronto para Retirada",
    entregue: "🛵 Entregue"
  };
  return traducoes[status] || status;
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  title: {
    fontSize: 28,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
    fontFamily: 'NewRocker-Regular',
  },
  pedido: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'NewRocker-Regular',
  },
  statusBox: {
    backgroundColor: '#8a241c',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  statusText: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'NewRocker-Regular',
  },
  button: {
    backgroundColor: '#306030',
    padding: 15,
    borderRadius: 10,
    alignSelf: 'center',
    width: '70%',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'NewRocker-Regular',
    fontSize: 16,
  },
  // Adicione ao StyleSheet:
statusBox: {
  backgroundColor: '#8a241c',
  padding: 30,
  borderRadius: 15,
  alignItems: 'center',
  marginBottom: 30,
},
statusText: {
  color: '#fff',
  fontSize: 22,
  fontFamily: 'NewRocker-Regular',
}
});

