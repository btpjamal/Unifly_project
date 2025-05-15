import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';

export default function Menu({ navigation }) {
  return (
    <ImageBackground source={require('../assets/background.png')} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.titulo}>Menu Principal</Text>

        <TouchableOpacity style={styles.botao} onPress={() => navigation.navigate('cardapio')}>
          <Text style={styles.botaoTexto}>Ver Cardápio</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botao} onPress={() => navigation.navigate('perfil')}>
          <Text style={styles.botaoTexto}>Perfil</Text>
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
    padding: 30,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  titulo: {
    fontSize: 36,
    color: '#fff',
    fontFamily: 'NewRocker-Regular',
    textAlign: 'center',
    marginBottom: 40,
  },
  botao: {
    margin: 10,
    backgroundColor: '#3c1f1e', // Tom de vermelho mais escuro e sombrio
    borderWidth: 3,
    borderColor: '#8a241c', // Vermelho queimado para um efeito "rasgado"
    borderRadius: 30, // Bordas levemente arredondadas, menos "perfeitas"
    paddingVertical: 12,
    paddingHorizontal: 28,
    shadowColor: '#000000', // Sombra escura para profundidade
    shadowOffset: { width: 10, height: 10 },
    shadowOpacity: 0.7,
    shadowRadius: 4,
    elevation: 5, // Sombra no Android
  },
  botaoTexto: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'NewRocker-Regular',
  },
});
