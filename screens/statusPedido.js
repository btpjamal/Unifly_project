// screens/statuspedido.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { observarPedido } from '../firebaseService';

const statusList = ['Pedido Recebido', 'Em Preparo', 'Pronto para Retirada'];

export default function StatusPedido({ navigation, route }) {
  const { pedidoId } = route.params;
  const [pedido, setPedido] = useState(null);

  useEffect(() => {
    const unsubscribe = observarPedido(pedidoId, (novoPedido) => {
      setPedido(novoPedido);
    });

    return () => unsubscribe();
  }, [pedidoId]);

  const traduzirStatus = (status) => {
    const traducoes = {
      pendente: "🕒 Pedido Recebido",
      preparo: "👨🍳 Em Preparo",
      pronto: "✅ Pronto para Retirada",
      entregue: "🛵 Entregue"
    };
    return traducoes[status] || status;
  };

  return (
    <View style={styles.background}>
      {pedido && (
        <>
          {/* Botão de voltar reposicionado e aumentado */}
          <TouchableOpacity
            style={styles.backbutton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.textBackButton}>{"<"}</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Status do Pedido</Text>
          <Text style={styles.pedido}>Pedido #{pedido.id.slice(0, 6)}</Text>
          
          {/* Status alterado para roxo */}
          <View style={styles.statusBox}>
            <Text style={styles.statusText}>
              {traduzirStatus(pedido.status)}
            </Text>
          </View>
          
          <Text style={styles.pedido}>Você pode acompanhar o status do seu pedido na tela de Perfil</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    color: 'black',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: "bold",
  },
  pedido: {
    fontSize: 20,
    color: 'black',
    textAlign: 'center',
    marginBottom: 20,
  },
  // Status alterado para roxo
  statusBox: {
    backgroundColor: '#6a0dad', // Roxo
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  statusText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  // Botão de voltar maior e posicionado no canto superior esquerdo
  backbutton: {
    backgroundColor: "#4A6A5A",
    position: 'absolute',
    top: 50,
    left: 20,
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  textBackButton: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: -4,
  },
});        