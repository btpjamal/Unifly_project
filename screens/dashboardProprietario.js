import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function DashboardProprietario({ route }) {
  const { comercioId } = route.params;
  const navigation = useNavigation(); // Adicione esta linha
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Painel do Proprietário</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('cardapioProprietario', { comercioId })}>
        <Text style={styles.buttonText}>Gerenciar Cardápio</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('relatorios', { comercioId })}>
        <Text style={styles.buttonText}>Relatórios</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#8a241c',
    fontFamily: 'NewRocker-Regular'
  },
  button: {
    backgroundColor: '#306030',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontFamily: 'NewRocker-Regular',
    fontSize: 16
  }
});