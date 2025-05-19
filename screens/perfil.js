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
  ImageBackground
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, signOut } from 'firebase/auth';
import { buscarPedidos } from '../firebaseService';
import Constants from 'expo-constants';


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
      let uid = null;

      if (usuario) {
        setEmail(usuario.email);
        uid = usuario.uid;
      }

      if (uid) {
        const nomeSalvo = await AsyncStorage.getItem(`nome_${uid}`);
        const enderecoSalvo = await AsyncStorage.getItem(`endereco_${uid}`);
        const fotoSalva = await AsyncStorage.getItem(`fotoPerfil_${uid}`);

        setNome(nomeSalvo || '');
        setEndereco(enderecoSalvo || '');
        setFoto(fotoSalva || null);

        const token = await AsyncStorage.getItem('userToken');
        const pedidos = await buscarPedidos(token, uid);
        setHistoricoPedidos(pedidos);
      }
    };

    carregarDados();
  }, []);

  const escolherFoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.3, // Qualidade reduzida
      aspect: [1, 1],
    });

    if (!result.canceled) {
      setFoto(result.assets[0].uri); // Armazena o URI da imagem
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
    const uid = usuario.uid;
    
    // Salva os dados independentemente de ter foto ou não
    await AsyncStorage.setItem(`nome_${uid}`, nome);
    await AsyncStorage.setItem(`endereco_${uid}`, endereco);

    // Se houver foto, faz o upload
    if (foto && foto.startsWith('file://')) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const formData = new FormData();
      formData.append('image', {
        uri: foto,
        type: 'image/jpeg',
        name: 'foto_perfil.jpg',
      });

      const imgurClientId = Constants.manifest.extra.IMGUR_CLIENT_ID;
      const response = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          Authorization: `Client-ID ${imgurClientId}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const urlImagem = data.data.link;
        await AsyncStorage.setItem(`fotoPerfil_${uid}`, urlImagem);
        setFoto(urlImagem);
      } else {
        Alert.alert('Aviso', 'Foto não foi atualizada, mas outros dados foram salvos.');
      }
    }

    setEditando(false);
    Alert.alert('Sucesso', 'Informações atualizadas!');
  } catch (error) {
    if (error.message.includes('429')) {
      Alert.alert('Erro', 'Limite de uploads excedido. Foto não foi atualizada, mas outros dados foram salvos.');
    } else {
      Alert.alert('Erro', 'Falha ao salvar os dados. Tente novamente.');
    }
  }
};

  return (
    <ImageBackground
      source={require('../assets/background3.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={editando ? escolherFoto : null}>
          <Image
            source={foto ? { uri: foto } : require('../assets/avatarpadrao.png')}
            style={styles.fotoPerfil}
          />
          {editando && <Text style={[styles.trocarFoto]}>Trocar Foto</Text>}
        </TouchableOpacity>

        <Text style={[styles.titulo]}>Meu Perfil</Text>

        <Text style={[styles.label]}>Nome</Text>
        {/* Nome agora é apenas um campo de texto não editável */}
        <TextInput
          style={styles.input}
          editable={false}
          value={nome}  // Garantir que o valor do nome seja exibido aqui
        />

        <Text style={[styles.label]}>E-mail</Text>
        <TextInput
          style={[styles.input, { backgroundColor: '#eee', color: '#888' }]}
          editable={false}
          selectTextOnFocus={false}
          value={email}
        />

        <Text style={[styles.label]}>Endereço</Text>
        <TextInput
          style={styles.input}
          editable={editando}
          value={endereco}
          onChangeText={setEndereco}
        />

        <TouchableOpacity style={[styles.botao,]} onPress={() => {
          if (editando) salvarDados();
          else setEditando(true);
        }}>
          <Text style={styles.botaoTexto}>{editando ? 'Salvar' : 'Editar'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botaocardapio} onPress={() => navigation.goBack()}>
          <Text style={styles.botaoTexto}>{"<"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botaologout} onPress={async () => {
          try {
            const auth = getAuth();
            await signOut(auth);
            navigation.navigate('splashscreen');
          }catch (error) {
            Alert.alert('Erro', 'Não foi possível sair. Tente novamente.');
          }
        }}
>
  <Text style={styles.botaoTexto}>{"Sair"}</Text>
</TouchableOpacity>

        <Text style={[styles.subtitulo]}>Histórico de Pedidos</Text>
        {historicoPedidos.length === 0 ? (
          <Text style={[styles.pedidoTexto]}>Nenhum pedido encontrado.</Text>
        ) : (
          historicoPedidos.map((pedido, index) => (
            <View key={index} style={styles.pedido}>
              <Text style={styles.pedidoTexto}>Estabelecimento: {pedido.comercioNome || "Estabelecimento não identificado"}</Text>
              <Text style={styles.pedidoTexto}>Pedido #{index + 1} - {pedido.criadoEm?.toLocaleString() || "Data não disponível"}</Text>
              <Text style={styles.pedidoTexto}>Total: R$ {pedido.total.toFixed(2)}</Text>
              {pedido.itens.map((item, idx) => (
                <Text key={idx} style={styles.pedidoTexto}>
                  - {item.nome} x{item.quantidade} (R$ {item.preco.toFixed(2)})
                </Text>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  titulo: {
    fontSize: 28,
    marginBottom: 20,
    fontFamily: 'NewRocker-Regular',
    textAlign: 'center',
    color: '#333', // Cor fixa
  },
  subtitulo: {
    fontSize: 22,
    marginTop: 30,
    marginBottom: 10,
    fontFamily: 'NewRocker-Regular',
  },
  label: {
    fontFamily: 'NewRocker-Regular',
    fontSize: 16,
    marginBottom: 5,
    alignSelf: 'flex-start',
    color: '#333', // Cor fixa
  },
  input: {
    backgroundColor: '#F9F9F9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    fontFamily: 'NewRocker-Regular',
    borderWidth: 1,
    borderColor: '#CCC',
    width: '100%',
  },
  botao: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
    backgroundColor: '#3c1f1e',
  },
  botaoTexto: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'NewRocker-Regular',
  },
  botaocardapio: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#8a241c',
    borderWidth: 3,
    borderColor: '#8a241c',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 15,
    shadowColor: '#3c1f1e',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 4,
    elevation: 5,
  },
  botaologout: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#8a241c',
    borderWidth: 3,
    borderColor: '#8a241c',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 15,
    shadowColor: '#3c1f1e',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 4,
    elevation: 5,
  },
  pedido: {
    backgroundColor: '#FFF',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    width: '100%',
  },
  pedidoTexto: {
    fontFamily: 'NewRocker-Regular',
    fontSize: 14,
    color: '#333',
  },
  fotoPerfil: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#8A241C',
  },
  trocarFoto: {
    fontFamily: 'NewRocker-Regular',
    marginBottom: 10,
    textAlign: 'center',
  },
});

