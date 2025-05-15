import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('paginainicial');
    }, 3000); // Tempo de exibição da splash (3 segundos)

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.nomeApp}>Carregando...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8a241c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    flex: 1,
    height: 370,
    width: 335,
    marginBottom: 20,
  },
  nomeApp: {
    fontSize: 32,
    color: '#fff',
    fontFamily: 'NewRocker-Regular',
    marginTop: 20,
  },
});
