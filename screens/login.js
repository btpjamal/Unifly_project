import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ImageBackground, 
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
          routes: [{ name: 'dashboardProprietario', params: { comercioId: userData.comercioId } }]
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'cardapio' }]
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
    <ImageBackground source={require('../assets/background3.jpg')} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>

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
  },
  title: {
    fontSize: 30,
    marginBottom: 20,
    fontFamily: 'NewRocker-Regular',
  },
  input: {
    width: '80%',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 5,
    backgroundColor: '#F9F9F9',
    fontFamily: 'NewRocker-Regular',
  },
  buttonentrar: {
    margin: 10,
    backgroundColor: '#8a241c', // Tom de vermelho mais escuro e sombrio
    borderWidth: 3,
    borderColor: '#8a241c', // Vermelho queimado para um efeito "rasgado"
    borderRadius: 30, // Bordas levemente arredondadas, menos "perfeitas"
    paddingVertical: 12,
    paddingHorizontal: 28,
    shadowColor: '#3c1f1e', // Sombra escura para profundidade
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 4,
    elevation: 5, // Sombra no Android
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'NewRocker-Regular',
  },
  registerText: {
    marginTop: 20,
    fontSize: 20,
    color: '#8A241C',
    fontFamily: 'NewRocker-Regular',
    textDecorationLine: 'underline',
  },
});



