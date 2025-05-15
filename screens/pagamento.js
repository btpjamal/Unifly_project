// screens/pagamento.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { salvarPedido } from '../firebaseService';

export default function Pagamento({ navigation, route }) {
  const [metodo, setMetodo] = useState(null);
  const [dados, setDados] = useState('');
  const [pedidoConfirmado, setPedidoConfirmado] = useState(false);
  const numeroPedido = Math.floor(Math.random() * 1000000); // Número aleatório
  const total = route.params?.total || '0.00';

  const finalizarPagamento = async () => {
  if (!metodo || dados.trim() === '') {
    Alert.alert('Erro', 'Por favor, selecione um método de pagamento e preencha os dados.');
    return;
  }

  try {
    const token = await AsyncStorage.getItem('userToken');
    const uid = await AsyncStorage.getItem('userUid');
    if (!token || !uid) throw new Error('Usuário não autenticado');

    const carrinho = route.params?.carrinho || [];
    const totalNum = parseFloat(total);

    await salvarPedido(token, uid, carrinho, totalNum);

    setPedidoConfirmado(true);
    setTimeout(() => {
      navigation.replace('statuspedido', { numeroPedido });
    }, 2000);
  } catch (error) {
    Alert.alert('Erro ao processar o pagamento', error.message);
  }
};

  return (
    <ImageBackground source={require('../assets/background3.jpg')} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>Pagamento</Text>

        <Text style={styles.total}>Total do Pedido: R$ {total}</Text>

        <Text style={styles.label}>Escolha o método de pagamento:</Text>
        <TouchableOpacity
          style={[styles.option, metodo === 'cartaoCredito' && styles.optionSelecionado]}
          onPress={() => setMetodo('cartaoCredito')}
        >
          <Text style={styles.optionText}>Cartão de Crédito</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.option, metodo === 'cartaoDebito' && styles.optionSelecionado]}
          onPress={() => setMetodo('cartaoDebito')}
        >
          <Text style={styles.optionText}>Cartão de Débito</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.option, metodo === 'pix' && styles.optionSelecionado]}
          onPress={() => setMetodo('pix')}
        >
          <Text style={styles.optionText}>Pix</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles
        .backbutton} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>{"<"}</Text>
        </TouchableOpacity>

        {metodo && (
          <>
            <TextInput
              style={styles.input}
              placeholder={`Digite os dados do ${metodo === 'pix' ? 'Pix' : 'Cartão'}`}
              placeholderTextColor="#999"
              value={dados}
              onChangeText={setDados}
            />
            <TouchableOpacity style={styles.button} onPress={finalizarPagamento}>
              <Text style={styles.buttonText}>Finalizar Pagamento</Text>
            </TouchableOpacity>
          </>
        )}

        {pedidoConfirmado && (
          <Text style={styles.confirmationText}>
            Pagamento confirmado! Redirecionando para o status do pedido...
          </Text>
        )}
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
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  title: {
    fontSize: 30,
    marginBottom: 10,
    textAlign: 'center',
    color: '#fff',
    fontFamily: 'NewRocker-Regular',
  },
  total: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    color: '#fff',
    fontFamily: 'NewRocker-Regular',
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    color: '#fff',
    fontFamily: 'NewRocker-Regular',
  },
  option: {
    backgroundColor: '#8a241c',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  optionSelecionado: {
    borderColor: '#fff',
    borderWidth: 2,
  },
  optionText: {
    color: '#fff',
    fontFamily: 'NewRocker-Regular',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    marginTop: 15,
    borderRadius: 8,
    fontFamily: 'NewRocker-Regular',
    color: '#000',
  },
  button: {
    backgroundColor: '#306030',
    marginTop: 15,
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'NewRocker-Regular',
  },
  confirmationText: {
    color: '#00e676',
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'NewRocker-Regular',
  },
});

