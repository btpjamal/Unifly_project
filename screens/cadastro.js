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
  );
}

const styles = StyleSheet.create({
  backbutton: {
    position: 'absolute',
    top: 20, // Distância do topo da tela
    left: 20, // Distância do lado esquerdo
    backgroundColor: '#1c2c40',
    borderRadius: 30, // Bordas arredondadas
    paddingVertical: 10,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  container: {
    backgroundColor: '#fffff',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
 title: {
    fontSize: 50,
    marginBottom: 20,
    fontFamily: 'Rubik',
    color:'purple',
  },
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    backgroundColor: '#F9F9F9',
    fontFamily: 'Roboto-Medium',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    margin: 10,
    backgroundColor: '#1c2c40',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
  },
  botaoGoback: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  tipoButton: {
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    backgroundColor: '#f3ece7',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 5,
  },
  tipoButtonSelecionado: {
    backgroundColor: '#f3ece7',
    shadowColor: "#ffff",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 5,
  },
  tipoButtonText: {
    fontFamily: 'Roboto-Medium',
    color: 'black',
  },
});


