// screens/statuspedido.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';

const statusList = ['Pedido Recebido', 'Em Preparo', 'Pronto para Retirada'];

export default function StatusPedido({ navigation, route }) {
  const { numeroPedido } = route.params;
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prevIndex) => {
        if (prevIndex < statusList.length - 1) {
          return prevIndex + 1;
        } else {
          clearInterval(interval);
          return prevIndex;
        }
      });
    }, 3000); // Atualiza a cada 3 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <ImageBackground source={require('../assets/background.png')} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>Status do Pedido</Text>

        <Text style={styles.pedido}>Pedido nº {numeroPedido}</Text>

        <View style={styles.statusBox}>
          <Text style={styles.statusText}>{statusList[statusIndex]}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EstabelecimentosScreen')}>
          <Text style={styles.buttonText}>Voltar aos estabelecimentos</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  title: {
    fontSize: 28,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
    fontFamily: 'NewRocker-Regular',
  },
  pedido: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'NewRocker-Regular',
  },
  statusBox: {
    backgroundColor: '#8a241c',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  statusText: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'NewRocker-Regular',
  },
  button: {
    backgroundColor: '#306030',
    padding: 15,
    borderRadius: 10,
    alignSelf: 'center',
    width: '70%',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'NewRocker-Regular',
    fontSize: 16,
  },
});

