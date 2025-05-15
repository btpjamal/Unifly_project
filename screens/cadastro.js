import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Alert } from 'react-native';
import { cadastrarUsuario, salvarDadosFirestore } from '../firebaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';  // Importando o AsyncStorage

export default function Cadastro({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tipo, setTipo] = useState('cliente'); // 'cliente' ou 'admin'
  const [nomeComercio, setNomeComercio] = useState('');
  
  const handleCadastro = async () => {
  if (!nome || !email || !senha || (tipo === 'admin' && !nomeComercio)) {
    Alert.alert('Erro', 'Preencha todos os campos!');
    return;
  }

  try {
    const usuario = await cadastrarUsuario({
      nome,
      email,
      senha,
      tipo,
      nomeComercio: tipo === 'admin' ? nomeComercio : null
    });

    await AsyncStorage.setItem('nome', nome);
    await AsyncStorage.setItem('email', email);

    Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
    navigation.navigate('login');
  } catch (error) {
    Alert.alert('Erro', error.message || 'Erro ao cadastrar. Tente novamente.');
  }
};

  

  return (
    <ImageBackground source={require('../assets/background3.jpg')} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>Cadastro</Text>

        <TextInput style={styles.input} placeholder="Nome" value={nome} onChangeText={setNome} />
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry />
        <View style={{ flexDirection: 'row', marginVertical: 10 }}>
        <TouchableOpacity onPress={() => setTipo('cliente')} style={[styles.tipoButton, tipo === 'cliente' && styles.tipoButtonSelecionado]}>
          <Text style={styles.tipoButtonText}>Cliente</Text>
        </TouchableOpacity>
  <TouchableOpacity onPress={() => setTipo('admin')} style={[styles.tipoButton, tipo === 'admin' && styles.tipoButtonSelecionado]}>
    <Text style={styles.tipoButtonText}>Proprietário</Text>
  </TouchableOpacity>
</View>

{tipo === 'admin' && (
  <TextInput
    style={styles.input}
    placeholder="Nome do Comércio"
    value={nomeComercio}
    onChangeText={setNomeComercio}
  />
)}

        <TouchableOpacity style={styles.button} onPress={handleCadastro}>
          <Text style={styles.buttonText}>Cadastrar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles
        .backbutton} onPress={() => navigation.goBack()}>
          <Text style={styles.botaoGoback}>{"<"}</Text>
        </TouchableOpacity>
        
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backbutton: {
    position: 'absolute',
    top: 20, // Distância do topo da tela
    left: 20, // Distância do lado esquerdo
    backgroundColor: '#8a241c', // Vermelho vinho
    borderWidth: 3,
    borderColor: '#8a241c',
    borderRadius: 30, // Bordas arredondadas
    paddingVertical: 10,
    paddingHorizontal: 15,
    shadowColor: '#3c1f1e', // Sombra escura para profundidade
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 4,
    elevation: 5, // Sombra no Android
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 30,
    color: 'black',
    marginBottom: 20,
    fontFamily: 'NewRocker-Regular',
  },
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 5,
    backgroundColor: '#F9F9F9',
    fontFamily: 'NewRocker-Regular',
  },
  button: {
    margin: 10,
    backgroundColor: '#8a241c', // Tom de vermelho mais escuro e sombrio
    borderWidth: 3,
    borderColor: '#8a241c', // Vermelho queimado para um efeito "rasgado"
    borderRadius: 30, // Bordas levemente arredondadas, menos "perfeitas"
    paddingVertical: 12,
    paddingHorizontal: 28,
    shadowColor: '#3c1f1e', // Sombra escura para profundidade
    shadowOffset: { width: 10, height: 10 },
    shadowOpacity: 0.7,
    shadowRadius: 4,
    elevation: 5, // Sombra no Android
  },
  buttonText: {
    color: 'white',
    fontSize: 25,
    fontFamily: 'NewRocker-Regular',
  },
  botaoGoback: {
  color: '#FFFFFF',
  fontSize: 16,
  fontFamily: 'NewRocker-Regular',
  },
  tipoButton: {
  padding: 10,
  borderWidth: 1,
  borderColor: '#8a241c',
  borderRadius: 5,
  marginHorizontal: 5,
  backgroundColor: '#F9F9F9',
},
tipoButtonSelecionado: {
  backgroundColor: '#8a241c',
},
tipoButtonText: {
  fontFamily: 'NewRocker-Regular',
  color: 'black',
},

});


