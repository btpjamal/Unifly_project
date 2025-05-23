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
  ImageBackground,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, signOut } from 'firebase/auth';
import { buscarPedidos } from '../firebaseService';
import Constants from 'expo-constants';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';

export default function PerfilScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [endereco, setEndereco] = useState('');
  const [foto, setFoto] = useState(null);
  const [editando, setEditando] = useState(false);
  const [historicoPedidos, setHistoricoPedidos] = useState([]);

  useEffect(() => {
    const carregarDados = async () => {
      const auth = getAuth();
      const usuario = auth.currentUser;

      console.log('Usuário autenticado:', usuario); // 👈 Adicione este log

      if (!usuario) {
        console.error('Usuário não autenticado!');
        navigation.navigate('login');
        return;
  
      }
      try{
        const db = getFirestore();
        const userRef = doc(db, 'usuarios', usuario.uid);
        const userDoc = await getDoc(userRef);

       // Dados padrão caso não exista no Firestore
        const dadosIniciais = {
        nome: usuario.displayName || 'Nome desconhecido',
        endereco: '',
        fotoPerfil: null
      };
       if (userDoc.exists()) {
        const userData = userDoc.data();
        setNome(userData.nome || dadosIniciais.nome);
        setEndereco(userDoc.data().endereco || ''); // Carrega do Firestore
        setFoto(userData.fotoPerfil || null);
        setEmail(userData.email || '');
        console.log('Dados do Firestore:', userData);
      }else {
        // Cria documento com dados iniciais
        await updateDoc(userRef, dadosIniciais);
        setNome(dadosIniciais.nome);
      }

        // Carrega pedidos
      const token = await usuario.getIdToken();
      const pedidos = await buscarPedidos(token, usuario.uid);
      setHistoricoPedidos(pedidos);

      }catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Falha ao carregar o perfil');
    }
  };

  carregarDados();
}, []);

  const escolherFoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.3, // Qualidade reduzida
      aspect: [1, 1],
      base64: Platform.OS === 'web', // Habilita base64 apenas na web
    });
    console.log('Resultado da foto:', result);
    if (!result.canceled) {
      if (Platform.OS === 'web'){
        // Web: usa base64
        const base64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setFoto(base64);
      }else {
        // Mobile: usa URI normal
        setFoto(result.assets[0].uri); // Armazena o URI da imagem
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
    let novaFoto = foto; // Armazena o valor final da foto

    // Apenas faça o upload se a foto não for uma URL já existente
    if (foto && !foto.startsWith('http')) {
      let blob;
      // Converte a imagem (base64 ou URI) para Blob
      const response = await fetch(foto);
      blob = await response.blob();

      // Upload para Storage
      const storageRef = ref(storage, `perfil/${usuario.uid}/fotoPerfil.jpg`);
      await uploadBytes(storageRef, blob);

      // Obtenha a URL de download
      novaFoto = await getDownloadURL(storageRef);
      console.log('Foto atualizada com sucesso');
    }

    // Atualiza o Firestore com a nova foto (se houve upload) e o endereço
    await updateDoc(userRef, {
      fotoPerfil: novaFoto,
      endereco: endereco
    });

    setEditando(false);
    Alert.alert('Sucesso', 'Informações atualizadas!');
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
    Alert.alert('Erro', 'Falha ao salvar os dados. Tente novamente.');
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
      {/* --- Resto do conteúdo da tela --- */}
      <TouchableOpacity onPress={editando ? escolherFoto : null}>
        <Image
          source={
            foto ? { uri: foto } : require("../assets/avatarpadrao.png")
          }
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
        selectTextOnFocus={false}
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

      <Text style={styles.subtitulo}>Histórico de Pedidos</Text>
      {historicoPedidos.length === 0 ? (
        <Text style={styles.pedidoTexto}>Nenhum pedido encontrado.</Text>
      ) : (
        historicoPedidos.map((pedido, index) => (
          <View key={index} style={styles.pedido}>
            <Text style={styles.pedidoTexto}>
              Estabelecimento:{" "}
              {pedido.comercioNome || "Estabelecimento não identificado"}
            </Text>
            <Text style={styles.pedidoTexto}>
              Pedido #{index + 1} -{" "}
              {pedido.criadoEm?.toLocaleString() || "Data não disponível"}
            </Text>
            <Text style={styles.pedidoTexto}>
              Total: R$ {pedido.total.toFixed(2)}
            </Text>
            {pedido.itens.map((item, idx) => (
              <Text key={idx} style={styles.pedidoTexto}>
                - {item.nome} x{item.quantidade} (R$ {item.preco.toFixed(2)})
              </Text>
            ))}
          </View>
        ))
      )}
    </ScrollView>
  </View>
);
};
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
  // --- Outros estilos da tela ---
  container: {
    padding: 20,
    alignItems: "center",
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
});

