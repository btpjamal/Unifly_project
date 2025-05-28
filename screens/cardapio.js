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
import { SafeAreaView } from "react-native-web";

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

const atualizarCarrinho = (produto, action = 'increment') => {
  setCarrinho((prev) => {
    const itemExistente = prev.find((item) => item.id === produto.id);
    
    // Incrementar
    if (action === 'increment') {
      if (itemExistente) {
        return prev.map((item) =>
          item.id === produto.id 
            ? { ...item, quantidade: item.quantidade + 1 } 
            : item
        );
      }
      return [...prev, { ...produto, quantidade: 1 }];
    }
    
    // Decrementar
    else if (action === 'decrement') {
      if (!itemExistente) return prev; // Item não existe, retorna sem alterar
      
      if (itemExistente.quantidade === 1) {
        return prev.filter((item) => item.id !== produto.id); // Remove o item
      } else {
        return prev.map((item) =>
          item.id === produto.id 
            ? { ...item, quantidade: item.quantidade - 1 } 
            : item
        );
      }
    }
    
    return prev; // Fallback para ações desconhecidas
  });
};
  const finalizarPagamento = async () => {
  if (!metodo || dados.trim() === "") {
    Alert.alert("Erro", "Selecione um método e insira os dados.");
    return;
  }

  try {
    const token = await AsyncStorage.getItem("userToken");
    const uid = await AsyncStorage.getItem("userUid");
    if (!token || !uid) throw new Error("Usuário não autenticado");

    const totalNum = parseFloat(calcularTotal());
    
    // 1. Salva o pedido e obtém a referência do documento
    const docRef = await salvarPedido(
      token,
      uid,
      carrinho,
      totalNum,
      nomeEstabelecimento,
      comercioId
    );

    setPedidoConfirmado(true);
    
    // 2. Navega imediatamente com o ID real
    setTimeout(() => {
      setModalVisible(false);
      navigation.replace("statuspedido", { pedidoId: docRef.id }); // Usa o ID real
    }, 2000);

  } catch (error) {
    Alert.alert("Erro ao processar o pagamento", error.message);
  }
};

    return (
    <SafeAreaView style={styles.fundo}>
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

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#4A6A5A"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar estabelecimento..."
          placeholderTextColor="#888"
          value={filtroTexto}
          onChangeText={setFiltroTexto}
        />
        {filtroTexto.length > 0 && (
          <TouchableOpacity onPress={() => setFiltroTexto("")}>
            <Ionicons name="close-circle" size={20} color="#6A0DAD" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        style={{ flex: 1 }}
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
              onPress={() => atualizarCarrinho(item, 'increment')}
            >
              <Text style={styles.botaoTexto}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.botaoDecrementar}
              onPress={() => atualizarCarrinho(item, 'decrement')}
            >
              <Text style={styles.botaoTexto}>-</Text>
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={
          <>
            <View style={styles.listaCarrinho}>
              <Text style={styles.subtituloCarrinho}>Itens no Carrinho:</Text>
              
              {carrinho.length === 0 ? (
                <Text style={styles.textoVazio}>Nenhum item adicionado</Text>
              ) : (
                carrinho.map((item) => (
                  <View key={item.id} style={styles.itemCarrinho}>
                    <View style={styles.infoItem}>
                      <Text style={styles.nomeItem}>{item.nome}</Text>
                      <Text style={styles.quantidadeItem}>x{item.quantidade}</Text>
                    </View>
                    <Text style={styles.precoItem}>
                      R$ {(item.preco * item.quantidade).toFixed(2)}
                    </Text>
                  </View>
                ))
              )}
            </View>

            <TouchableOpacity
              style={styles.botaoFinalizar}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.botaoTexto}>
                Finalizar Pedido 🛒({carrinho.reduce((sum, item) => sum + item.quantidade, 0)})
              </Text>
            </TouchableOpacity>
          </>
        }
      />

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: '#F0F4F7',
  },
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
    paddingBottom: 15,
  },
  itemContainer: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  botaoDecrementar: {
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
    marginLeft: 8,
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
    backgroundColor: "rgba(0,0,0,0.5)",
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
  botaoFechar: {
    backgroundColor: "#4A6A5A",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    width: '100%',
  },
  listaCarrinho: {
    backgroundColor: '#FFF',
    padding: 15,
    marginTop: 10,
    borderTopWidth: 2,
    borderColor: '#6A0DAD',
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 15,
  },
  subtituloCarrinho: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A2233',
    marginBottom: 10,
  },
  itemCarrinho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderColor: '#EEE',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nomeItem: {
    fontSize: 14,
    color: '#333',
  },
  quantidadeItem: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  precoItem: {
    fontSize: 14,
    color: '#2c682c',
    fontWeight: 'bold',
  },
  textoVazio: {
    fontStyle: 'italic',
    color: '#999',
    textAlign: 'center',
    marginVertical: 10,
  },
  botaoFinalizar: {
    backgroundColor: "#4A6A5A",
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
});
