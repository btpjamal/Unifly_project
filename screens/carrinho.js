import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from "react-native";
import { StatusBar } from "react-native";

export default function Carrinho({ route, navigation }) {
  const [itensCarrinho, setItensCarrinho] = useState([]);

  useEffect(() => {
    if (route.params?.itens) {
      const agrupados = agruparItens(route.params.itens);
      setItensCarrinho(agrupados);
    }
  }, [route.params]);

  const agruparItens = (itens) => {
    const mapa = {};
    itens.forEach((item) => {
      if (mapa[item.id]) {
        mapa[item.id].quantidade += 1;
      } else {
        mapa[item.id] = { ...item, quantidade: 1 };
      }
    });
    return Object.values(mapa);
  };

  const alterarQuantidade = (id, delta) => {
    const atualizados = itensCarrinho
      .map((item) => {
        if (item.id === id) {
          const novaQtd = item.quantidade + delta;
          if (novaQtd <= 0) {
            return null;
          }
          return { ...item, quantidade: novaQtd };
        }
        return item;
      })
      .filter(Boolean);
    setItensCarrinho(atualizados);
  };

  const calcularTotal = () => {
    return itensCarrinho
      .reduce((soma, item) => soma + item.preco * item.quantidade, 0)
      .toFixed(2);
  };

  const finalizarCompra = () => {
    if (itensCarrinho.length === 0) {
      Alert.alert("Carrinho vazio", "Adicione itens antes de finalizar.");
      return;
    }

    const carrinho = itensCarrinho.map((item) => ({
      nome: item.nome,
      preco: item.preco,
      quantidade: item.quantidade,
      foto: item.foto, // Incluindo foto no carrinho
      comercioNome: route.params.comercioNome,
    }));

    navigation.navigate("pagamento", {
      total: parseFloat(calcularTotal()),
      carrinho: carrinho,
      comercioNome: route.params.comercioNome,
    });
  };

  return (
    <View style={styles.fundo}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backbutton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.botaoTexto}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>🛒 Seu Carrinho</Text>
      </View>

      <View style={styles.container}>
        {itensCarrinho.length === 0 ? (
          <View style={styles.vazioContainer}>
            <Text style={styles.vazio}>Seu carrinho está vazio 😞</Text>
          </View>
        ) : (
          <>
            <FlatList
              data={itensCarrinho}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.item}>
                  {item.foto ? (
                    <Image source={{ uri: item.foto }} style={styles.imagem} />
                  ) : (
                    <View style={[styles.imagem, styles.imagePlaceholder]}>
                      <Text style={styles.imagePlaceholderText}>Sem foto</Text>
                    </View>
                  )}
                  <View style={styles.info}>
                    <Text style={styles.nome}>{item.nome}</Text>
                    <Text style={styles.preco}>
                      R$ {item.preco.toFixed(2)} x {item.quantidade}
                    </Text>
                    <View style={styles.qtdContainer}>
                      <TouchableOpacity
                        onPress={() => alterarQuantidade(item.id, -1)}
                        style={styles.qtdBotao}
                      >
                        <Text style={styles.qtdTexto}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.quantidade}>{item.quantidade}</Text>
                      <TouchableOpacity
                        onPress={() => alterarQuantidade(item.id, 1)}
                        style={styles.qtdBotao}
                      >
                        <Text style={styles.qtdTexto}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            />
            <Text style={styles.total}>Total: R$ {calcularTotal()}</Text>
            <TouchableOpacity
              style={styles.finalizar}
              onPress={finalizarCompra}
            >
              <Text style={styles.finalizarTexto}>Finalizar Pedido</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.continuar}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.continuarTexto}>Continuar comprando</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1A2233",
    padding: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
    flex: 1,
  },
  backbutton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#4A6A5A",
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  botaoTexto: {
    color: "#FFF",
    fontSize: 20,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  vazioContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  vazio: {
    fontSize: 18,
    color: "#6A0DAD",
    fontWeight: "600",
  },
  item: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  imagem: {
    width: 60,
    height: 60,
    borderRadius: 10,
    resizeMode: "cover",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  imagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ccc",
  },
  imagePlaceholderText: {
    color: "#FFF",
    fontSize: 12,
    textAlign: "center",
  },
  info: {
    marginLeft: 10,
    flex: 1,
    justifyContent: "center",
  },
  nome: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A2233",
  },
  preco: {
    fontSize: 14,
    color: "#666",
  },
  qtdContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  qtdBotao: {
    backgroundColor: "#6A0DAD",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  qtdTexto: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  quantidade: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A2233",
  },
  total: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
    color: '#3c1f1e',
  },
  finalizar: {
    backgroundColor: '#4A6A5A',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  finalizarTexto: {
    color: '#fff',
    textAlign: 'center',
  },
  continuar: {
    backgroundColor: '#6A0DAD',
    padding: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  continuarTexto: {
    color: '#fff',
    textAlign: 'center',
  },
  vazio: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
  botaoTexto: {
    color: '#fff',
    textAlign: 'center',
  },
});