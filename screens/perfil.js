import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth, signOut } from "firebase/auth";
import { buscarPedidos } from "../firebaseService";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";

export default function PerfilScreen({ navigation }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [endereco, setEndereco] = useState("");
  const [foto, setFoto] = useState(null);
  const [editando, setEditando] = useState(false);
  const [historicoPedidos, setHistoricoPedidos] = useState([]);

  useEffect(() => {
    const carregarDados = async () => {
      const auth = getAuth();
      const usuario = auth.currentUser;

      if (!usuario) {
        navigation.navigate("login");
        return;
      }

      try {
        const db = getFirestore();
        const userRef = doc(db, "usuarios", usuario.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setNome(userData.nome || usuario.displayName || "Nome desconhecido");
          setEndereco(userData.endereco || "");
          setFoto(userData.fotoPerfil || null);
          setEmail(userData.email || "");
        }

        const token = await usuario.getIdToken();
        const pedidos = await buscarPedidos(token, usuario.uid);
        setHistoricoPedidos(pedidos);
      } catch (error) {
        Alert.alert("Erro", "Falha ao carregar o perfil");
      }
    };

    carregarDados();
  }, []);

  const escolherFoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.3,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      setFoto(result.assets[0].uri);
    }
  };

  const salvarDados = async () => {
    const auth = getAuth();
    const usuario = auth.currentUser;

    if (!usuario) {
      Alert.alert("Erro", "Usuário não autenticado.");
      return;
    }

    try {
      const db = getFirestore();
      const userRef = doc(db, "usuarios", usuario.uid);
      const storage = getStorage();
      let novaFoto = foto;

      if (foto && !foto.startsWith("http")) {
        const response = await fetch(foto);
        const blob = await response.blob();
        const storageRef = ref(storage, `perfil/${usuario.uid}/fotoPerfil.jpg`);
        await uploadBytes(storageRef, blob);
        novaFoto = await getDownloadURL(storageRef);
      }

      await updateDoc(userRef, {
        fotoPerfil: novaFoto,
        endereco: endereco,
      });

      setEditando(false);
      Alert.alert("Sucesso", "Informações atualizadas!");
    } catch (error) {
      Alert.alert("Erro", "Falha ao salvar os dados. Tente novamente.");
    }
  };

  return (
    <View style={styles.fundo}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={editando ? escolherFoto : null}>
          <Image
            source={
              foto ? { uri: foto } : require("../assets/avatarpadrao.png")
            }
            style={styles.fotoPerfil}
          />
          {editando && <Text style={styles.trocarFoto}>Trocar Foto</Text>}
        </TouchableOpacity>

        <Text style={styles.titulo}>Meu Perfil</Text>

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
          onPress={() => (editando ? salvarDados() : setEditando(true))}
        >
          <Text style={styles.botaoTexto}>
            {editando ? "Salvar" : "Editar"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaologout}
          onPress={() => signOut(getAuth())}
        >
          <Text style={styles.botaoTexto}>Sair</Text>
        </TouchableOpacity>

        <Text style={styles.subtitulo}>Histórico de Pedidos</Text>
        {historicoPedidos.length === 0 ? (
          <Text style={styles.pedidoTexto}>Nenhum pedido encontrado.</Text>
        ) : (
          historicoPedidos.map((pedido, index) => (
            <View key={index} style={styles.pedido}>
              <Text style={styles.pedidoTexto}>
                Estabelecimento: {pedido.comercioNome || "Não identificado"}
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
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  container: {
    padding: 20,
    alignItems: "center",
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#6A0DAD",
    textAlign: "center",
  },
  subtitulo: {
    fontSize: 22,
    color: "#1A2233",
    marginTop: 30,
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
  botaoTexto: {
    color: "#FFF",
    fontWeight: "bold",
  },
  botaologout: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#8A241C",
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  pedido: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    width: "100%",
    marginBottom: 10,
  },
  pedidoTexto: {
    fontSize: 14,
    color: "#333",
  },
  fotoPerfil: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
});
