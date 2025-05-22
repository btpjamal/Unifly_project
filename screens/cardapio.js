import React, { useState, useEffect } from "react";
import { buscarProdutosDoEstabelecimento } from "../firebaseService";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function CardapioCliente({ navigation, route }) {
  const { comercioId } = route.params;
  const [nomeEstabelecimento, setNomeEstabelecimento] = useState("");
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const estabelecimentoRef = doc(db, "comercios", comercioId);
        const estabelecimentoSnap = await getDoc(estabelecimentoRef);

        if (estabelecimentoSnap.exists()) {
          setNomeEstabelecimento(estabelecimentoSnap.data().nome);
        }

        const [produtosFirebase, carrinhoLocal] = await Promise.all([
          buscarProdutosDoEstabelecimento(comercioId),
          AsyncStorage.getItem(`carrinho_${comercioId}`),
        ]);

        setProdutos(produtosFirebase);
        if (carrinhoLocal) setCarrinho(JSON.parse(carrinhoLocal));
      } catch (error) {
        Alert.alert("Erro", "Não foi possível carregar o cardápio");
        console.error(error);
      }
    };

    carregarDados();
  }, [comercioId]);

  useEffect(() => {
    const salvarCarrinho = async () => {
      await AsyncStorage.setItem(
        `carrinho_${comercioId}`,
        JSON.stringify(carrinho)
      );
    };
    salvarCarrinho();
  }, [carrinho, comercioId]);

  const adicionarAoCarrinho = (produto) => {
    setCarrinho((prev) => {
      const itemExistente = prev.find((item) => item.id === produto.id);
      if (itemExistente) {
        return prev.map((item) =>
          item.id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }
      return [...prev, { ...produto, quantidade: 1 }];
    });
  };

  const irParaCarrinho = () => {
    navigation.navigate("carrinho", {
      itens: carrinho,
      total: carrinho.reduce(
        (sum, item) => sum + item.preco * item.quantidade,
        0
      ),
      comercioId,
      comercioNome: nomeEstabelecimento,
    });
  };

  return (
    <View style={styles.fundo}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backbutton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.botaoGoback}>{"<"}</Text>
        </TouchableOpacity>

        <View style={styles.tituloContainer}>
          <Text style={styles.titulo} numberOfLines={1}>
            {nomeEstabelecimento || "Cardápio"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.botaoPerfil}
          onPress={() => navigation.navigate("perfil")}
        >
          <Text style={styles.botaoTexto}>👤 Perfil</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={produtos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Image source={{ uri: item.foto }} style={styles.productImage} />
            <View style={styles.infoProduto}>
              <Text style={styles.nome}>{item.nome}</Text>
              <Text style={styles.descricao}>{item.descricao}</Text>
              <Text style={styles.preco}>R$ {item.preco.toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={styles.botaoAdicionar}
              onPress={() => adicionarAoCarrinho(item)}
            >
              <Text style={styles.botaoTexto}>+</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.listaVazia}>
            Nenhum produto disponível no momento
          </Text>
        }
      />

      <TouchableOpacity
        style={styles.botaoCarrinhoFlutuante}
        onPress={irParaCarrinho}
      >
        <Text style={styles.botaoTexto}>
          Ver Carrinho 🛒({carrinho.length})
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#1A2233",
    width: "100%",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backbutton: {
    backgroundColor: "#4A6A5A",
    padding: 10,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  tituloContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  titulo: {
    fontSize: 20,
    color: "#FFF",
    fontWeight: "bold",
    textAlign: "center",
  },
  botaoPerfil: {
    backgroundColor: "#6A0DAD",
    padding: 10,
    borderRadius: 20,
  },
  botaoGoback: {
    color: "#FFF",
    fontSize: 20,
  },
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  lista: {
    paddingHorizontal: 15,
    paddingBottom: 80,
  },
  itemContainer: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 3,
  },
  infoProduto: {
    flex: 1,
  },
  nome: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A2233",
  },
  descricao: {
    fontSize: 14,
    color: "#666",
    marginVertical: 5,
  },
  preco: {
    fontSize: 16,
    color: "#2c682c",
    fontWeight: "bold",
  },
  botaoAdicionar: {
    backgroundColor: "#6A0DAD",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  botaoCarrinhoFlutuante: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#4A6A5A",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  listaVazia: {
    textAlign: "center",
    color: "#6A0DAD",
    fontSize: 16,
    marginTop: 20,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    resizeMode: "cover",
  },
});
