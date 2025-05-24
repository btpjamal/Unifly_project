import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { buscarProdutosDoEstabelecimento, salvarPedido } from "../firebaseService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Ionicons } from "@expo/vector-icons";

export default function CardapioCliente({ navigation, route }) {
  const { comercioId } = route.params;
  const [nomeEstabelecimento, setNomeEstabelecimento] = useState("");
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [metodo, setMetodo] = useState(null);
  const [dados, setDados] = useState("");
  const [pedidoConfirmado, setPedidoConfirmado] = useState(false);

  // Função que retorna o total do carrinho
  const calcularTotal = () => {
    return carrinho
      .reduce((sum, item) => sum + item.preco * item.quantidade, 0)
      .toFixed(2);
  };

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
        setProdutosFiltrados(produtosFirebase);
        if (carrinhoLocal) setCarrinho(JSON.parse(carrinhoLocal));
      } catch (error) {
        Alert.alert("Erro", "Não foi possível carregar o cardápio");
        console.error(error);
      }
    };

    carregarDados();
  }, [comercioId]);

  useEffect(() => {
    if (filtroTexto.trim() === "") {
      setProdutosFiltrados(produtos);
    } else {
      const filtrados = produtos.filter((item) =>
        item.nome.toLowerCase().includes(filtroTexto.toLowerCase()) ||
        (item.descricao &&
          item.descricao.toLowerCase().includes(filtroTexto.toLowerCase()))
      );
      setProdutosFiltrados(filtrados);
    }
  }, [filtroTexto, produtos]);

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

  const finalizarPagamento = async () => {
    if (!metodo || dados.trim() === "") {
      Alert.alert("Erro", "Selecione um método e insira os dados.");
      return;
    }

    try {
      // Recupera token e uid para autenticação
      const token = await AsyncStorage.getItem("userToken");
      const uid = await AsyncStorage.getItem("userUid");
      if (!token || !uid) throw new Error("Usuário não autenticado");

      // Calcula o total e salva o pedido
      const totalNum = parseFloat(calcularTotal());
      await salvarPedido(token, uid, carrinho, totalNum, nomeEstabelecimento);

      setPedidoConfirmado(true);
      const numeroPedido = Math.floor(Math.random() * 1000000);
      setTimeout(() => {
        setModalVisible(false);
        navigation.replace("statuspedido", { numeroPedido });
      }, 2000);
    } catch (error) {
      Alert.alert("Erro ao processar o pagamento", error.message);
    }
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
        data={produtosFiltrados}
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
      />

      <TouchableOpacity
        style={styles.botaoCarrinhoFlutuante}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.botaoTexto}>
          Ver Carrinho 🛒({carrinho.length})
        </Text>
      </TouchableOpacity>

      {/* Modal de Pagamento */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.label}>
              💰 Escolha uma forma de pagamento:
            </Text>
            <Text style={styles.totalModal}>Total: R$ {calcularTotal()}</Text>
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

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.botaoFechar}
            >
              <Text style={styles.buttonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  backbutton: {
    backgroundColor: "#4A6A5A",
    padding: 10,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
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
    marginRight: 10,
    borderRadius: 8,
    resizeMode: "cover",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 16,

  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    margin: 15,
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1A2233",
  },
    emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#6A0DAD",
    marginTop: 10,
    textAlign: "center",
  },
    modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)", // Fundo escurecido e levemente desfocado
    backdropFilter: "blur(8px)", // Efeito de desfoque
  },
  modalContainer: {
    width: "85%",
    padding: 25,
    backgroundColor: "#FFF",
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A2233",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#FFF",
    padding: 12,
    marginTop: 10,
    borderRadius: 8,
    borderColor: "#6A0DAD",
    borderWidth: 2,
    fontSize: 16,
    color: "#333",
    width: "100%",
  },
  button: {
    backgroundColor: "#4A6A5A",
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    width: "100%",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  fecharModal: {
    marginTop: 15,
    backgroundColor: "#6A0DAD",
    padding: 12,
    borderRadius: 10,
    width: "100%",
  },
  option: {
    backgroundColor: "#6A0DAD",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  optionSelecionado: {
    borderColor: "#FFF",
    borderWidth: 2,
  },
  optionText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    color: "#1A2233",
  },
  botaoFechar:{
    backgroundColor: "#4A6A5A",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
  }
});
