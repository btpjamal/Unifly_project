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
      
      <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backbutton} 
                onPress={() => navigation.navigate('splashscreen')}>
               <Text style={styles.botaoGoback}>{"Sair"}</Text>
              </TouchableOpacity>
      
            <View style={styles.tituloContainer}>
              <Text style={styles.titulo} numberOfLines={1}>
              SELECIONE UM ESTABELECIMENTO
              </Text>
            </View>
      
            <TouchableOpacity 
              style={styles.botaoPerfil}
              onPress={() => navigation.navigate('perfil')}>
              <Text style={styles.botaoTexto}>👤 Perfil</Text>
            </TouchableOpacity>
      </View>
      
      
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
  header: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 15,
  backgroundColor: 'rgba(138, 36, 28, 0.9)',
  width: '100%'
},
backbutton: {
  backgroundColor: '#3c1f1e',
  padding: 10,
  borderRadius: 20,
  zIndex: 1,
  width: 40,
  height: 40,
  justifyContent: 'center',
  alignItems: 'center'
},
tituloContainer: {
  flex: 1,
  marginHorizontal: 10
},
titulo: {
  fontSize: 20,
  color: '#fff',
  fontFamily: 'NewRocker-Regular',
  textAlign: 'center',
  textShadowColor: 'rgba(0, 0, 0, 0.75)',
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 2
},
botaoPerfil: {
  backgroundColor: '#3c1f1e',
  padding: 10,
  borderRadius: 20,
  zIndex: 1
},
botaoGoback: {
  color: '#fff',
  fontSize: 20,
  lineHeight: 24
},
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