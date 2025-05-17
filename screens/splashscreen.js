import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Text, ActivityIndicator, ImageBackground } from 'react-native';

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
      <Text style={styles.loadingText}>Iniciando a plataforma...</Text>
      <ActivityIndicator size="large" color="#4A6A5A" />
    </View>
  );
}

const styles = StyleSheet.create({
  background:{
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    backgroundColor: '#0b0f1a',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 30,
  },
  loadingText: {
    fontSize: 30,
    color: '#4A6A5A',
    fontFamily: 'System',
    marginBottom: 10,
  },
});
