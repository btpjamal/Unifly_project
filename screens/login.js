import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { autenticarUsuario } from '../firebaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Preencha todos os campos!');
      return;
    }

    setCarregando(true);
    
    try {
      // 1. Autenticação com Firebase Auth
      const { uid } = await autenticarUsuario(email, senha);
      
      // 2. Buscar dados adicionais no Firestore
      const userDoc = await getDoc(doc(db, 'usuarios', uid));
      
      if (!userDoc.exists()) {
        throw new Error('Usuário não encontrado no sistema');
      }

      const userData = userDoc.data();

      // 3. Salvar dados locais
      await AsyncStorage.multiSet([
        ['userToken', await getAuth().currentUser.getIdToken()],
        ['userUid', uid],
        ['userType', userData.tipo]
      ]);

      // 4. Redirecionamento adequado
      if (userData.tipo === 'admin') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'cardapioProprietario', params: { comercioId: userData.comercioId } }]
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'EstabelecimentosScreen' }]
        });
      }

    } catch (error) {
      let mensagem = 'Erro ao fazer login. Verifique suas credenciais.';
      if (error.code === 'auth/invalid-credential') mensagem = 'E-mail ou senha inválidos';
      if (error.code === 'auth/too-many-requests') mensagem = 'Muitas tentativas. Tente mais tarde';
      
      Alert.alert('Erro', mensagem);
      console.error('Erro login:', error);
    } finally {
      setCarregando(false);
    }
  };

  return (
      <View style={styles.container}>
        <h1 style={styles.title}>Login</h1>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        {carregando ? (
          <ActivityIndicator size="large" color="#8a241c" />
        ) : (
          <TouchableOpacity style={styles.buttonentrar} onPress={handleLogin}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => navigation.navigate('cadastro')}>
          <Text style={styles.registerText}>Não tem uma conta? Cadastre-se aqui</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backbutton} onPress={() => navigation.goBack()}>
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
  },
  title: {
    fontSize: 50,
    marginBottom: 20,
    fontFamily: 'Rubik',
    color:'purple',
  },
  input: {
    width: '80%',
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
  buttonentrar: {
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
  registerText: {
    marginTop: 20,
    fontSize: 20,
    color: '#4A6A5A',
    fontFamily: 'Roboto-Medium',
    textDecorationLine: 'underline',
  },
    botaoGoback: {
  color: '#FFFFFF',
  fontSize: 16,
  },
});