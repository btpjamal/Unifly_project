import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, signOut } from 'firebase/auth';
import { observarPedidos, atualizarStatusPedido } from '../firebaseService';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Ionicons } from "@expo/vector-icons";

export default function PerfilScreenProprietario({ navigation }) {
  const [comercioId, setComercioId] = useState(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [endereco, setEndereco] = useState('');
  const [foto, setFoto] = useState(null);
  const [editando, setEditando] = useState(false);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [historicoPedidos, setHistoricoPedidos] = useState([]);
  const [pedidoFiltrados, setPedidosFiltrados] = useState([]);
  const statusOptions = ['pendente', 'preparo', 'pronto', 'entregue'];

  const traduzirStatus = (status) => {
    const traducoes = {
      pendente: "🕒 Pedido Recebido",
      preparo: "👨🍳 Em Preparo",
      pronto: "✅ Pronto para Retirada",
      entregue: "🛵 Entregue"
    };
    return traducoes[status] || status;
  };

  const atualizarStatus = async (pedidoId, novoStatus) => {
    try {
      if (!pedidoId || !novoStatus) return;
      await atualizarStatusPedido(pedidoId, novoStatus);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o status');
    }
  };

  useEffect(() => {
    const auth = getAuth();
    const usuario = auth.currentUser;
    let unsubscribePedidos = null;

    const carregarDados = async () => {
      try {
        const db = getFirestore();
        const userRef = doc(db, 'usuarios', usuario.uid);
        const userDoc = await getDoc(userRef);

        const dadosIniciais = {
          nome: usuario.displayName || 'Nome desconhecido',
          endereco: '',
          fotoPerfil: null
        };

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setComercioId(userData.comercioId);
          setNome(userData.nome || dadosIniciais.nome);
          setEndereco(userData.endereco || '');
          setFoto(userData.fotoPerfil || null);
          setEmail(userData.email || '');

          if (userData.comercioId) {
            unsubscribePedidos = observarPedidos(userData.comercioId, (pedidos) => {
              setHistoricoPedidos(pedidos);
              setPedidosFiltrados(pedidos);
            });
          }
        } else {
          await updateDoc(userRef, dadosIniciais);
          setNome(dadosIniciais.nome);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        Alert.alert('Erro', 'Falha ao carregar o perfil');
      }
    };

    if (usuario) {
      carregarDados();
    } else {
      navigation.navigate('login');
    }

    return () => {
      if (unsubscribePedidos) unsubscribePedidos();
    };
  }, [navigation]);

  useEffect(() => {
  const filtrarPedidos = () => {
    const texto = filtroTexto.toLowerCase();
    
    const filtrados = historicoPedidos.filter(pedido => {
      return (
        (pedido.uid?.toLowerCase().includes(texto)) || 
        (pedido.itens?.some(item => item.nome?.toLowerCase().includes(texto))) || 
        (pedido.id?.toLowerCase().includes(texto))
      );
    });

    setPedidosFiltrados(filtrados);
  };
  filtrarPedidos();
}, [filtroTexto, historicoPedidos]);

  const escolherFoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.3,
      aspect: [1, 1],
      base64: Platform.OS === 'web',
    });

    if (!result.canceled) {
      if (Platform.OS === 'web') {
        const base64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setFoto(base64);
      } else {
        setFoto(result.assets[0].uri);
      }
    }
  };

  const salvarDados = async () => {
  const auth = getAuth();
  const usuario = auth.currentUser;

  if (!usuario) {
    Alert.alert('Erro', 'Usuário não autenticado.');
    return;
  }

  try {
    const db = getFirestore();
    const userRef = doc(db, 'usuarios', usuario.uid);
    const storage = getStorage();
    let novaFoto = foto;

    // Verificação adicional de autenticação
    if (!usuario.uid) {
      throw new Error("UID do usuário não disponível");
    }

    // Upload apenas se a foto for nova
    if (foto && !foto.startsWith('https://')) { // Ajuste para seu domínio
      console.log("Iniciando upload para:", `perfil/${usuario.uid}/fotoPerfil.jpg`);
      
      // Converta para Blob
      const response = await fetch(foto);
      const blob = await response.blob();

      // Referência do Storage com UID
      const storageRef = ref(storage, `perfil/${usuario.uid}/fotoPerfil.jpg`);
      
      // Faça o upload
      await usuario.getIdToken(/* forceRefresh */ true);
      await uploadBytes(storageRef, blob);
      novaFoto = await getDownloadURL(storageRef);
      console.log("Upload concluído. Nova URL:", novaFoto);
    }

    // Atualize o Firestore
    await updateDoc(userRef, {
      fotoPerfil: novaFoto,
      endereco: endereco
    });

    setEditando(false);
    Alert.alert('Sucesso', 'Foto atualizada!');

  } catch (error) {
    console.error('Erro detalhado:', error.code, error.message);
    Alert.alert('Erro', error.message || 'Falha no upload');
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
            Meu Perfil
          </Text>
        </View>

        <TouchableOpacity
          style={styles.botaoPerfil}
          onPress={async () => {
            try {
              const auth = getAuth();
              await signOut(auth);
              navigation.navigate("splashscreen");
            } catch (error) {
              Alert.alert("Erro", "Não foi possível sair. Tente novamente.");
            }
          }}
        >
          <Text style={styles.botaoTexto}>{"Sair"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={editando ? escolherFoto : null}>
          <Image
            source={foto ? { uri: foto } : require("../assets/avatarpadrao.png")}
            style={styles.fotoPerfil}
          />
          {editando && <Text style={styles.trocarFoto}>Trocar Foto</Text>}
        </TouchableOpacity>

        <Text style={styles.label}>Nome</Text>
        <TextInput style={styles.input} editable={false} value={nome} />

        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={[styles.input, { backgroundColor: "#eee", color: "#888" }]}
          editable={false}
          value={email}
        />

        <Text style={styles.label}>Endereço</Text>
        <TextInput
          style={styles.input}
          editable={editando}
          value={endereco}
          onChangeText={setEndereco}
        />

        <TouchableOpacity
          style={styles.botao}
          onPress={() => {
            if (editando) salvarDados();
            else setEditando(true);
          }}
        >
          <Text style={styles.botaoTexto}>
            {editando ? "Salvar" : "Editar"}
          </Text>
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#4A6A5A"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por cliente, item ou pedido..."
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

        <Text style={styles.subtitulo}>Histórico de Pedidos</Text>
        {pedidoFiltrados.length === 0 ? (
          <Text style={styles.pedidoTexto}>Nenhum pedido encontrado.</Text>
        ) : (
          pedidoFiltrados.map((pedido, index) => (
            <View key={index} style={styles.pedido}>
              <Text style={styles.pedidoTexto}>
                Status: {traduzirStatus(pedido.status)}
              </Text>
              <Text style={styles.pedidoTexto}>
                Cliente: {pedido.uid.slice(0, 6)}
              </Text>
              <Text style={styles.pedidoTexto}>
                Pedido #{index + 1} - {pedido.criadoEm?.toLocaleString()}
              </Text>
              <Text style={styles.pedidoTexto}>
                Total: R$ {pedido.total.toFixed(2)}
              </Text>
              {pedido.itens.map((item, idx) => (
                <Text key={idx} style={styles.pedidoTexto}>
                  - {item.nome} x{item.quantidade} (R$ {item.preco.toFixed(2)})
                </Text>
              ))}
              <View style={styles.statusButtons}>
                {statusOptions.map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusButton,
                      pedido.status === status && styles.selectedStatus
                    ]}
                    onPress={() => atualizarStatus(pedido.id, status)}
                  >
                    <Text style={styles.buttonText}>
                      {traduzirStatus(status).split(' ')[1]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: "#F5F7FA",
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
  botaoTexto: {
    color: "#FFF",
    fontWeight: "bold",
  },
  container: {
    padding: 20,
    alignItems: "center",
    paddingBottom: 100,
  },
  fotoPerfil: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#1A2233",
  },
  trocarFoto: {
    marginBottom: 10,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    alignSelf: "flex-start",
    color: "#333",
  },
  input: {
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CCC",
    width: "100%",
    marginBottom: 15,
  },
  botao: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#6A0DAD",
    width: "100%",
  },
  subtitulo: {
    fontSize: 22,
    color: "#1A2233",
    marginTop: 30,
  },
  pedido: {
    backgroundColor: "#FFF",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    width: "100%",
  },
  pedidoTexto: {
    fontSize: 14,
    color: "#333",
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    margin: 15,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#1A2233',
    fontSize: 16,
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    gap: 5,
  },
  statusButton: {
    backgroundColor: '#6A0DAD',
    padding: 8,
    borderRadius: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  selectedStatus: {
    backgroundColor: '#4A6A5A',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
  },
});