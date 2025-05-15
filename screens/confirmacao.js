import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Confirmacao({ route }) {
  const { numeroPedido } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pedido Confirmado!</Text>
      <Text style={styles.text}>Número do Pedido:</Text>
      <Text style={styles.numero}>{numeroPedido}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    fontFamily: 'NewRocker-Regular',
  },
  text: {
    fontSize: 18,
    fontFamily: 'NewRocker-Regular',
  },
  numero: {
    fontSize: 30,
    color: '#8a241c',
    marginTop: 10,
    fontFamily: 'NewRocker-Regular',
  },
});
