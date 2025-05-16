// screens/EstabelecimentosScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ImageBackground } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { buscarEstabelecimentos } from '../firebaseService';

export default function EstabelecimentosScreen({ navigation }) {
  const [estabelecimentos, setEstabelecimentos] = useState([]);

  useEffect(() => {
    const carregarEstabelecimentos = async () => {
      const querySnapshot = await getDocs(collection(db, 'comercios'));
      const lista = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEstabelecimentos(lista);
    };
    
    carregarEstabelecimentos();
  }, []);

  return (
    <ImageBackground source={require('../assets/background.png')} style={styles.background}>
      <FlatList
        data={estabelecimentos}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('cardapio', { comercioId: item.id })}>
            <Text style={styles.nome}>{item.nome}</Text>
            <Text style={styles.descricao}>{item.descricao}</Text>
          </TouchableOpacity>
        )}
      />
    </ImageBackground>
  );
}

const styles = {
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    margin: 10,
    borderRadius: 10
  },
  nome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8a241c'
  },
  item: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    margin: 10,
    borderRadius: 8
  },
  nomeProduto: {
    fontSize: 16,
    color: '#333'
  },
  preco: {
    fontSize: 14,
    color: '#666'
  }
};