import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function DashboardProprietario({ route }) {
  const { comercioId } = route.params;
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Painel do Proprietário</Text>
      
      <View style={styles.card}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('cardapioProprietario', { comercioId })}>
          <Text style={styles.buttonText}>Gerenciar Cardápio</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('relatorios', { comercioId })}>
          <Text style={styles.buttonText}>Relatórios</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFCFB', // Fundo claro para um visual clean
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    color: '#8a241c',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'NewRocker-Regular'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 10,
    padding: 20,
    elevation: 5, // Android
    shadowColor: '#000', // iOS
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  button: {
    backgroundColor: '#306030',
    paddingVertical: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'NewRocker-Regular',
    fontSize: 18
  },
});
