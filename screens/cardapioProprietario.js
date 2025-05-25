import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { getAuth } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { db, storage } from "../firebase";
import {
  buscarProdutosComercio,
  adicionarProduto,
  atualizarProduto,
  excluirProduto,
} from "../firebaseService";
import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import { Ionicons } from "@expo/vector-icons";

export default function CardapioProprietario({ navigation }) {
  const [produtos, setProdutos] = useState([]);
  const [comercioId, setComercioId] = useState(null);
  const [nomeEstabelecimento, setNomeEstabelecimento] = useState("");
  const [filtroTexto, setFiltroTexto] = useState("");
  const [modalVisivel, setModalVisivel] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);
  const [novoProduto, setNovoProduto] = useState({
    nome: "",
    descricao: "",
    preco: "",
    estoque: "",
    foto: null,
  });
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const carregarDados = async () => {
      const auth = getAuth();
      const usuario = auth.currentUser;
      
      if (!usuario) {
        navigation.navigate("login");
        return;
      }

      try {
        const usuarioDoc = await getDoc(doc(db, "usuarios", usuario.uid));
        const comercio = usuarioDoc.data().comercioId;
        setComercioId(comercio);

        const lista = await buscarProdutosComercio(comercio);
        setProdutos(lista);
      } catch (error) {
        Alert.alert("Erro", "Falha ao carregar dados");
      }
    };

    carregarDados();
  }, []);
  
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

  const abrirModal = (produto = null) => {
    setProdutoEditando(produto);
    setNovoProduto(
      produto ? { ...produto } : {
        nome: "",
        descricao: "",
        preco: "",
        estoque: "",
        foto: null
      }
    );
    setModalVisivel(true);
  };

  const escolherFotoProduto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos acesso às suas fotos');
        return;
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!resultado.canceled) {
        setNovoProduto(prev => ({
          ...prev,
          foto: resultado.assets[0].uri
        }));
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao selecionar imagem");
    }
  };

  const uploadImagem = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const nomeArquivo = uuidv4();
      const storageRef = ref(storage, `produtos/${nomeArquivo}`);
      
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (error) {
      throw new Error("Falha no upload da imagem");
    }
  };

  const salvarProduto = async () => {
    if (!novoProduto.nome || !novoProduto.preco) {
      Alert.alert("Atenção", "Preencha pelo menos nome e preço");
      return;
    }

    setCarregando(true);
    try {
      let fotoUrl = novoProduto.foto;

      // Se é uma nova imagem (não começa com http)
      if (novoProduto.foto && !novoProduto.foto.startsWith('http')) {
        fotoUrl = await uploadImagem(novoProduto.foto);
      }

      const dadosProduto = {
        ...novoProduto,
        preco: parseFloat(novoProduto.preco),
        estoque: parseInt(novoProduto.estoque) || 0,
        foto: fotoUrl
      };

      if (produtoEditando) {
        await atualizarProduto(comercioId, produtoEditando.id, dadosProduto);
        setProdutos(prev => prev.map(p => 
          p.id === produtoEditando.id ? { ...dadosProduto, id: p.id } : p
        ));
      } else {
        const novoId = await adicionarProduto(comercioId, dadosProduto);
        setProdutos(prev => [...prev, { ...dadosProduto, id: novoId }]);
      }

      setModalVisivel(false);
    } catch (error) {
      Alert.alert("Erro", error.message);
    } finally {
      setCarregando(false);
    }
  };

  const confirmarExclusao = (produtoId) => {
    if (!comercioId) {
      Alert.alert("Erro", "Comércio não identificado");
      return;
    }

    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir este produto?",
      [
        { text: "Cancelar" },
        {
          text: "Excluir",
          onPress: async () => {
            try {
              await excluirProduto(comercioId, produtoId);
              setProdutos(prev => prev.filter(p => p.id !== produtoId));
            } catch (error) {
              Alert.alert("Erro", "Falha ao excluir o produto");
            }
          },
        },
      ]
    );
  };
  
  return (
    <View style={styles.background}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backbutton}
          onPress={() => navigation.navigate("splashscreen")}
          activeOpacity={0.7}
        >
          <Ionicons name="exit-outline" size={24} color="#FFF" />
        </TouchableOpacity>
        
        <View style={styles.tituloContainer}>
          <Text style={styles.titulo} numberOfLines={1}>
            {nomeEstabelecimento || "Cardápio"}
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.botaoPerfil}
          onPress={() => navigation.navigate("perfilProprietário")}
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
        data={produtosFiltrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            {item.foto && (
              <Image source={{ uri: item.foto }} style={styles.productImage} />
            )}
            
            <View style={styles.infoProduto}>
              <Text style={styles.nome}>{item.nome}</Text>
              <Text style={styles.descricao}>{item.descricao}</Text>
              <Text style={styles.preco}>
                R$ {parseFloat(item.preco).toFixed(2)}
              </Text>
              <Text style={styles.estoque}>Estoque: {item.estoque}</Text>
            </View>
            
            <View style={styles.botoesContainer}>
              <TouchableOpacity
                onPress={() => abrirModal(item)}
                style={styles.botaoEditar}
              >
                <Text style={styles.botaoTexto}>Editar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => confirmarExclusao(item.id)}
                style={styles.botaoExcluir}
              >
                <Text style={styles.botaoTexto}>Excluir</Text>
              </TouchableOpacity>
            </View>
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
        onPress={() => abrirModal()}
      >
        <Text style={styles.botaoTexto}>Adicionar Produto</Text>
      </TouchableOpacity>

      <Modal visible={modalVisivel} transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {carregando && <ActivityIndicator size="large" color="#6A0DAD" />}
            
            <TextInput
              style={styles.input}
              placeholder="Nome do produto"
              value={novoProduto.nome}
              onChangeText={(text) => setNovoProduto(prev => ({ ...prev, nome: text }))}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Descrição"
              multiline
              value={novoProduto.descricao}
              onChangeText={(text) => setNovoProduto(prev => ({ ...prev, descricao: text }))}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Preço"
              keyboardType="numeric"
              value={novoProduto.preco}
              onChangeText={(text) => setNovoProduto(prev => ({ ...prev, preco: text }))}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Estoque"
              keyboardType="numeric"
              value={novoProduto.estoque}
              onChangeText={(text) => setNovoProduto(prev => ({ ...prev, estoque: text }))}
            />

            {novoProduto.foto && (
              <Image
                source={{ uri: novoProduto.foto }}
                style={styles.fotoProdutoModal}
              />
            )}

            <TouchableOpacity
              onPress={escolherFotoProduto}
              style={styles.botaoFoto}
            >
              <Text style={styles.botaoTexto}>
                {novoProduto.foto ? "Alterar Foto" : "Adicionar Foto"}
              </Text>
            </TouchableOpacity>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                onPress={salvarProduto}
                style={styles.botaoSalvar}
                disabled={carregando}
              >
                <Text style={styles.botaoTexto}>
                  {carregando ? 'Salvando...' : 'Salvar'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setModalVisivel(false)}
                style={styles.botaoCancelar}
                disabled={carregando}
              >
                <Text style={styles.botaoTexto}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    backgroundColor: "#F0F4F7",
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
    padding: 8,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  botaoGoback: {
    color: "#FFF",
    fontSize: 20,
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
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
  botaoTexto: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
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
  botoesContainer: {
    flexDirection: "column",
    gap: 8,
  },
  botaoEditar: {
    backgroundColor: "#4A6A5A",
    padding: 8,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  botaoExcluir: {
    backgroundColor: "#6A0DAD",
    padding: 8,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  botaoCarrinhoFlutuante: {
    position: "absolute",
    bottom: 25,
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
    fontWeight: "bold",
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
  botaoSalvar: {
    backgroundColor: "#4A6A5A",
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    width: "100%",
  },
  botaoCancelar: {
    backgroundColor: "#6A0DAD",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    width: "100%",
  },
  fotoProdutoModal: {
    width: 150,
    height: 150,
    alignSelf: "center",
    borderRadius: 8,
    marginBottom: 12,
    marginTop:10,
  },
  botaoFoto: {
    backgroundColor: "#6A0DAD",
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 0,
    width: '15%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  listaCarrinho: {
    backgroundColor: '#FFF',
    padding: 15,
    marginBottom: 70,
    borderTopWidth: 2,
    borderColor: '#6A0DAD',
  },
  quantidadeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
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
});
