import * as Crypto from "expo-crypto";
import React, { useState, useEffect, useRef } from "react";
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
  LogBox,
  Platform,
  StatusBar,
  SafeAreaView,
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
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
//import { v4 as uuidv4 } from 'uuid';
import { Ionicons } from "@expo/vector-icons";

// Suprimir avisos específicos
LogBox.ignoreLogs([
  "props.pointerEvents is deprecated. Use style.pointerEvents",
]);

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
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    const carregarDados = async () => {
      const auth = getAuth();
      const usuario = auth.currentUser;

      if (!usuario) {
        if (isMounted.current) navigation.navigate("login");
        return;
      }

      try {
        const usuarioDoc = await getDoc(doc(db, "usuarios", usuario.uid));
        if (!isMounted.current) return;

        const comercio = usuarioDoc.data().comercioId;
        setComercioId(comercio);

        // Carregar nome do estabelecimento
        const comercioDoc = await getDoc(doc(db, "comercios", comercio));
        if (comercioDoc.exists() && isMounted.current) {
          setNomeEstabelecimento(comercioDoc.data().nome);
        }

        const lista = await buscarProdutosComercio(comercio);
        if (isMounted.current) setProdutos(lista);
      } catch (error) {
        if (isMounted.current)
          Alert.alert("Erro", "Falha ao carregar dados: " + error.message);
      }
    };

    carregarDados();

    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (filtroTexto.trim() === "") {
      setProdutosFiltrados(produtos);
    } else {
      const filtrados = produtos.filter(
        (item) =>
          item.nome?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
          (item.descricao &&
            item.descricao.toLowerCase().includes(filtroTexto.toLowerCase()))
      );
      setProdutosFiltrados(filtrados);
    }
  }, [filtroTexto, produtos]);

  const abrirModal = (produto = null) => {
    setProdutoEditando(produto);
    setNovoProduto(
      produto
        ? { ...produto }
        : {
            nome: "",
            descricao: "",
            preco: "",
            estoque: "",
            foto: null,
          }
    );
    setModalVisivel(true);
  };

  const escolherFotoProduto = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permissão necessária", "Precisamos acesso às suas fotos");
        return;
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (
        !resultado.canceled &&
        resultado.assets &&
        resultado.assets.length > 0
      ) {
        setNovoProduto((prev) => ({
          ...prev,
          foto: resultado.assets[0].uri,
        }));
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao selecionar imagem: " + error.message);
    }
  };

  const uploadImagem = async (uri) => {
    try {
      if (!comercioId) {
        throw new Error("ID do comércio não disponível");
      }

      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error("Usuário não autenticado. Faça login novamente.");
      }

      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Falha ao buscar imagem: ${response.status}`);
      }

      const blob = await response.blob();
      const nomeArquivo = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        Date.now().toString()
      );

      // CORREÇÃO: Usar a estrutura produtos/{comercioId}/{nomeArquivo}
      const storageRef = ref(storage, `produtos/${comercioId}/${nomeArquivo}`);

      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Erro detalhado no upload:", error);
      throw new Error("Falha no upload da imagem: " + error.message);
    }
  };

  const salvarProduto = async () => {
    if (!novoProduto.nome || !novoProduto.preco) {
      Alert.alert("Atenção", "Preencha pelo menos nome e preço");
      return;
    }

    if (carregando) return;
    setCarregando(true);

    try {
      let fotoUrl = novoProduto.foto;

      // Upload apenas se for uma nova imagem
      if (novoProduto.foto && !novoProduto.foto.startsWith("http")) {
        console.log("Iniciando upload da imagem...");
        fotoUrl = await uploadImagem(novoProduto.foto);
        console.log("Upload de imagem concluído:", fotoUrl);
      }
      const precoString = String(novoProduto.preco || "");

      const cleanedPreco = precoString
        .replace(",", ".")
        .replace(/[^0-9.]/g, "");

      const precoNumerico = parseFloat(cleanedPreco);

      if (isNaN(precoNumerico)) {
        throw new Error("Preço inválido");
      }

      const dadosProduto = {
        nome: novoProduto.nome,
        descricao: novoProduto.descricao,
        preco: precoNumerico,
        estoque: parseInt(novoProduto.estoque) || 0,
        foto: fotoUrl,
      };

      if (produtoEditando) {
        await atualizarProduto(comercioId, produtoEditando.id, dadosProduto);
        setProdutos((prev) =>
          prev.map((p) =>
            p.id === produtoEditando.id ? { ...dadosProduto, id: p.id } : p
          )
        );
      } else {
        const novoId = await adicionarProduto(comercioId, dadosProduto);
        setProdutos((prev) => [...prev, { ...dadosProduto, id: novoId }]);
      }

      setModalVisivel(false);
    } catch (error) {
      console.error("Erro completo ao salvar produto:", error);
      Alert.alert(
        "Erro",
        error.message || "Ocorreu um erro ao salvar o produto"
      );
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
              setProdutos((prev) => prev.filter((p) => p.id !== produtoId));
            } catch (error) {
              Alert.alert(
                "Erro",
                "Falha ao excluir o produto: " + error.message
              );
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.fundo}>
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
          placeholder="Buscar produtos..."
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

      <Modal visible={modalVisivel} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {carregando && (
              <ActivityIndicator
                size="large"
                color="#6A0DAD"
                style={styles.carregandoModal}
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Nome do produto*"
              value={novoProduto.nome}
              onChangeText={(text) =>
                setNovoProduto((prev) => ({ ...prev, nome: text }))
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Descrição"
              multiline
              value={novoProduto.descricao}
              onChangeText={(text) =>
                setNovoProduto((prev) => ({ ...prev, descricao: text }))
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Preço*"
              keyboardType="decimal-pad"
              value={novoProduto.preco}
              onChangeText={(text) => {
                // Permite apenas números, vírgula e ponto
                const cleanedText = text.replace(/[^0-9,.]/g, "");
                setNovoProduto((prev) => ({ ...prev, preco: cleanedText }));
              }}
            />

            <TextInput
              style={styles.input}
              placeholder="Estoque"
              keyboardType="numeric"
              value={novoProduto.estoque}
              onChangeText={(text) =>
                setNovoProduto((prev) => ({
                  ...prev,
                  estoque: text.replace(/[^0-9]/g, ""),
                }))
              }
            />

            {novoProduto.foto && (
              <Image
                source={{ uri: novoProduto.foto }}
                style={styles.fotoProdutoModal}
              />
            )}

            {carregando &&
              novoProduto.foto &&
              !novoProduto.foto.startsWith("http") && (
                <View style={styles.uploadIndicator}>
                  <ActivityIndicator size="small" color="#FFF" />
                  <Text style={styles.uploadText}>Enviando imagem...</Text>
                </View>
              )}

            <TouchableOpacity
              onPress={escolherFotoProduto}
              style={styles.botaoFoto}
              disabled={carregando}
            >
              <Text style={styles.botaoTexto}>
                {novoProduto.foto ? "Alterar Foto" : "Adicionar Foto"}
              </Text>
            </TouchableOpacity>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                onPress={salvarProduto}
                style={[
                  styles.botaoSalvar,
                  carregando && styles.botaoDesabilitado,
                ]}
                disabled={carregando}
              >
                <Text style={styles.botaoTexto}>
                  {carregando ? "Salvando..." : "Salvar"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setModalVisivel(false)}
                style={[
                  styles.botaoCancelar,
                  carregando && styles.botaoDesabilitado,
                ]}
                disabled={carregando}
              >
                <Text style={styles.botaoTexto}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
  estoque: {
    fontSize: 14,
    color: "#666",
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
  },
  botaoExcluir: {
    backgroundColor: "#6A0DAD",
    padding: 8,
    borderRadius: 20,
    alignItems: "center",
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
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "90%",
    padding: 20,
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
    borderWidth: 1,
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
    alignItems: "center",
  },
  botaoCancelar: {
    backgroundColor: "#6A0DAD",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  botaoDesabilitado: {
    backgroundColor: "#999",
    opacity: 0.7,
  },
  fotoProdutoModal: {
    width: 150,
    height: 150,
    alignSelf: "center",
    borderRadius: 8,
    marginVertical: 10,
  },
  botaoFoto: {
    backgroundColor: "#6A0DAD",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
    width: "100%",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    margin: 15,
    padding: 10,
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
  uploadIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 5,
    borderRadius: 5,
    position: "absolute",
    bottom: 5,
    alignSelf: "center",
  },
  uploadText: {
    color: "#FFF",
    marginLeft: 5,
    fontSize: 12,
  },
  modalButtonContainer: {
    width: "100%",
  },
  carregandoModal: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255,255,255,0.7)",
    zIndex: 10,
  },
});
