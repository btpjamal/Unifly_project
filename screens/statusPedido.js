// screens/statuspedido.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  FlatList,
} from "react-native";

const statusList = ["Pedido Recebido", "Em Preparo", "Pronto para Retirada"];

export default function StatusPedido({ navigation, route }) {
  const { numeroPedido, lojas = [] } = route.params;
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prevIndex) => {
        if (prevIndex < statusList.length - 1) {
          return prevIndex + 1;
        } else {
          clearInterval(interval);
          return prevIndex;
        }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.fundo}>
      <View style={styles.container}>
        <Text style={styles.title}>Status do Pedido</Text>

        <Text style={styles.pedido}>Pedido nº {numeroPedido}</Text>

        <View style={styles.statusBox}>
          <Text style={styles.statusText}>{statusList[statusIndex]}</Text>
        </View>

        <Text style={styles.subtitulo}>Estabelecimentos envolvidos:</Text>
        <FlatList
          data={lojas}
          keyExtractor={(item, index) => `${item}_${index}`}
          renderItem={({ item }) => (
            <Text style={styles.lojaItem}>🏪 {item}</Text>
          )}
          contentContainerStyle={styles.listaLojas}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("EstabelecimentosScreen")}
        >
          <Text style={styles.buttonText}>Voltar aos estabelecimentos</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  title: {
    fontSize: 28,
    color: "#fff",
    textAlign: "center",
    marginBottom: 15,
    fontFamily: "NewRocker-Regular",
  },
  pedido: {
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "NewRocker-Regular",
  },
  statusBox: {
    backgroundColor: "#8a241c",
    padding: 30,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 30,
  },
  statusText: {
    color: "#fff",
    fontSize: 22,
    fontFamily: "NewRocker-Regular",
  },
  subtitulo: {
    fontSize: 18,
    color: "#fff",
    fontFamily: "NewRocker-Regular",
    marginBottom: 8,
  },
  listaLojas: {
    marginBottom: 20,
  },
  lojaItem: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "NewRocker-Regular",
    paddingLeft: 10,
    marginBottom: 5,
  },
  button: {
    backgroundColor: "#306030",
    padding: 15,
    borderRadius: 10,
    alignSelf: "center",
    width: "70%",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontFamily: "NewRocker-Regular",
    fontSize: 16,
  },
});
