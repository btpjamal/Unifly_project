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
import { getAuth } from 'firebase/auth';
import { buscarPedidos } from '../firebaseService';

export default function PerfilScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [endereco, setEndereco] = useState('');
  const [foto, setFoto] = useState(null);
  const [editando, setEditando] = useState(false);
  const [historicoPedidos, setHistoricoPedidos] = useState([]);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [botaoColor, setBotaoColor] = useState('#8A241C');
  const [textoColor, setTextoColor] = useState('#000000');

  useEffect(() => {
    const carregarDados = async () => {
      const auth = getAuth();
      const usuario = auth.currentUser;

      if (usuario) {
        setEmail(usuario.email);
      }

      const nomeSalvo = await AsyncStorage.getItem('nome');
      const enderecoSalvo = await AsyncStorage.getItem('endereco');
      const fotoSalva = await AsyncStorage.getItem('fotoPerfil');
      const bgColorSalvo = await AsyncStorage.getItem('bgColor');
      const botaoColorSalvo = await AsyncStorage.getItem('botaoColor');
      const textoColorSalvo = await AsyncStorage.getItem('textoColor');

      if (nomeSalvo) {
        setNome(nomeSalvo);
      } else {
        console.log("Nome não encontrado no AsyncStorage");
      }
      if (enderecoSalvo) setEndereco(enderecoSalvo);
      if (fotoSalva) setFoto(fotoSalva);
      if (bgColorSalvo) setBackgroundColor(bgColorSalvo);
      if (botaoColorSalvo) setBotaoColor(botaoColorSalvo);
      if (textoColorSalvo) setTextoColor(textoColorSalvo);

      const token = await AsyncStorage.getItem('userToken');
      const uid = await AsyncStorage.getItem('userUid');
      if (token && uid) {
        const pedidos = await buscarPedidos(token, uid);
        setHistoricoPedidos(pedidos);
      }
    };

    carregarDados();
  }, []);

  const escolherFoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setFoto(imageUri);
    }
  };

  const salvarDados = async () => {
    await AsyncStorage.setItem('nome', nome);
    await AsyncStorage.setItem('endereco', endereco);
    if (foto) await AsyncStorage.setItem('fotoPerfil', foto);
    await AsyncStorage.setItem('bgColor', backgroundColor);
    await AsyncStorage.setItem('botaoColor', botaoColor);
    await AsyncStorage.setItem('textoColor', textoColor);
    setEditando(false);
    Alert.alert('Sucesso', 'Informações atualizadas!');
  };

  return (
    <ImageBackground
      source={require('../assets/background3.jpg')}
      style={[styles.background, { backgroundColor: backgroundColor }]}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={editando ? escolherFoto : null}>
          <Image
            source={foto ? { uri: foto } : require('../assets/avatarpadrao.png')}
            style={styles.fotoPerfil}
          />
          {editando && <Text style={[styles.trocarFoto, { color: textoColor }]}>Trocar Foto</Text>}
        </TouchableOpacity>

        <Text style={[styles.titulo, { color: textoColor }]}>Meu Perfil</Text>

        <Text style={[styles.label, { color: textoColor }]}>Nome</Text>
        {/* Nome agora é apenas um campo de texto não editável */}
        <TextInput
          style={styles.input}
          editable={false}
          value={nome}  // Garantir que o valor do nome seja exibido aqui
        />

        <Text style={[styles.label, { color: textoColor }]}>E-mail</Text>
        <TextInput
          style={[styles.input, { backgroundColor: '#eee', color: '#888' }]}
          editable={false}
          selectTextOnFocus={false}
          value={email}
        />

        <Text style={[styles.label, { color: textoColor }]}>Endereço</Text>
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

        <TouchableOpacity style={styles.botaologout} onPress={() => navigation.navigate('paginainicial')}>
          <Text style={styles.botaoTexto}>{"Sair"}</Text>
        </TouchableOpacity>

        <Text style={[styles.subtitulo, { color: textoColor }]}>Histórico de Pedidos</Text>
        {historicoPedidos.length === 0 ? (
          <Text style={[styles.pedidoTexto, { color: textoColor }]}>Nenhum pedido encontrado.</Text>
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
