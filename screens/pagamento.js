import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ImageBackground,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { salvarPedido } from "../firebaseService";

export default function Pagamento({ navigation, route }) {
  const [metodo, setMetodo] = useState(null);
  const [dados, setDados] = useState("");
  const [pedidoConfirmado, setPedidoConfirmado] = useState(false);
  const numeroPedido = Math.floor(Math.random() * 1000000);
  const total = route.params?.total || "0.00";

  const finalizarPagamento = async () => {
    if (!metodo || dados.trim() === "") {
      Alert.alert("Erro", "Selecione um método e insira os dados.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("userToken");
      const uid = await AsyncStorage.getItem("userUid");
      if (!token || !uid) throw new Error("Usuário não autenticado");

      const pedidos = route.params?.pedidos || {};

      const pedidosConfirmados = [];

      for (const comercioId in pedidos) {
        const pedido = pedidos[comercioId];
        await salvarPedido(
          token,
          uid,
          pedido.itens,
          pedido.total,
          pedido.comercioNome
        );
        pedidosConfirmados.push(pedido.comercioNome);
      }

      await AsyncStorage.removeItem("carrinho_global");

      setPedidoConfirmado(true);
      setTimeout(() => {
        navigation.replace("statuspedido", {
          numeroPedido,
          lojas: pedidosConfirmados,
        });
      }, 2000);
    } catch (error) {
      Alert.alert("Erro ao processar pagamento", error.message);
    }
  };

  return (
    <View style={styles.fundo}>
      <View style={styles.container}>
        <Text style={styles.title}>💰 Pagamento</Text>

        <Text style={styles.total}>Total: R$ {total}</Text>

        <Text style={styles.label}>Selecione um método:</Text>
        {["cartaoCredito", "cartaoDebito", "pix"].map((metodoItem) => (
          <TouchableOpacity
            key={metodoItem}
            style={[
              styles.option,
              metodo === metodoItem && styles.optionSelecionado,
            ]}
            onPress={() => setMetodo(metodoItem)}
          >
            <Text style={styles.optionText}>
              {metodoItem === "pix"
                ? "Pix"
                : `Cartão de ${
                    metodoItem === "cartaoCredito" ? "Crédito" : "Débito"
                  }`}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.backbutton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>{"<"}</Text>
        </TouchableOpacity>

        {metodo && (
          <>
            <TextInput
              style={styles.input}
              placeholder={`Insira os dados do ${
                metodo === "pix" ? "Pix" : "Cartão"
              }`}
              placeholderTextColor="#999"
              value={dados}
              onChangeText={setDados}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={finalizarPagamento}
            >
              <Text style={styles.buttonText}>Finalizar Pagamento</Text>
            </TouchableOpacity>
          </>
        )}

        {pedidoConfirmado && (
          <Text style={styles.confirmationText}>
            ✅ Pagamento confirmado! Redirecionando...
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 20,
    justifyContent: "center",
  },
  container: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#6A0DAD",
    marginBottom: 15,
  },
  total: {
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    color: "#1A2233",
  },
  option: {
    backgroundColor: "#6A0DAD",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  optionSelecionado: {
    borderColor: "#FFF",
    borderWidth: 2,
  },
  optionText: {
    color: "#FFF",
    fontWeight: "bold",
    textAlign: "center",
  },
  input: {
    backgroundColor: "#FFF",
    padding: 12,
    marginTop: 15,
    borderRadius: 8,
    borderColor: "#6A0DAD",
    borderWidth: 2,
    fontSize: 16,
    color: "#333",
  },
  button: {
    backgroundColor: "#4A6A5A",
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    textAlign: "center",
  },
  confirmationText: {
    color: "#2c682c",
    marginTop: 20,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  backbutton: {
    position: "absolute",
    top: -50,
    left: -10,
    backgroundColor: "#4A6A5A",
    padding: 10,
    borderRadius: 20,
  },
});
