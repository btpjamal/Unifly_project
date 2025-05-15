import React, { useState, useEffect } from 'react';
import { buscarProdutos } from '../firebaseService';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CardapioCliente({ navigation }) {
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);

  // Carregar dados iniciais
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [produtosFirebase, carrinhoLocal] = await Promise.all([
          buscarProdutos(),
          AsyncStorage.getItem('carrinho')
        ]);
        
        setProdutos(produtosFirebase);
        if (carrinhoLocal) setCarrinho(JSON.parse(carrinhoLocal));
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar o cardápio');
        console.error(error);
      }
    };

    carregarDados();
  }, []);

  // Persistir carrinho
  useEffect(() => {
    const salvarCarrinho = async () => {
      await AsyncStorage.setItem('carrinho', JSON.stringify(carrinho));
    };
    salvarCarrinho();
  }, [carrinho]);

  // Adicionar item ao carrinho
  const adicionarAoCarrinho = (produto) => {
    setCarrinho(prev => {
      const itemExistente = prev.find(item => item.id === produto.id);
      if (itemExistente) {
        return prev.map(item =>
          item.id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }
      return [...prev, { ...produto, quantidade: 1 }];
    });
  };

  // Navegação para o carrinho
  const irParaCarrinho = () => {
    navigation.navigate('carrinho', { 
      itens: carrinho,
      total: carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0)
    });
  };

  return (
    <ImageBackground source={require('../assets/background3.jpg')} style={styles.background}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.botaoPerfil}
          onPress={() => navigation.navigate('perfil')}>
          <Text style={styles.botaoTexto}>👤 Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoCarrinhoHeader}
          onPress={irParaCarrinho}>
          <Text style={styles.botaoTexto}>🛒 ({carrinho.length})</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.titulo}>Cardápio</Text>

      <FlatList
        data={produtos}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <View style={styles.infoProduto}>
              <Text style={styles.nome}>{item.nome}</Text>
              <Text style={styles.descricao}>{item.descricao}</Text>
              <Text style={styles.preco}>R$ {item.preco.toFixed(2)}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.botaoAdicionar}
              onPress={() => adicionarAoCarrinho(item)}>
              <Text style={styles.botaoTexto}>+</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.listaVazia}>Nenhum produto disponível no momento</Text>
        }
      />

      <TouchableOpacity 
        style={styles.botaoCarrinhoFlutuante}
        onPress={irParaCarrinho}>
        <Text style={styles.botaoTexto}>Ver Carrinho ({carrinho.length})</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: 'rgba(138, 36, 28, 0.9)'
  },
  titulo: {
    fontSize: 28,
    textAlign: 'center',
    marginVertical: 15,
    color: '#fff',
    fontFamily: 'NewRocker-Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5
  },
  lista: {
    paddingHorizontal: 15,
    paddingBottom: 80
  },
  itemContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3
  },
  infoProduto: {
    flex: 1
  },
  nome: {
    fontSize: 18,
    fontFamily: 'NewRocker-Regular',
    color: '#333'
  },
  descricao: {
    fontSize: 14,
    color: '#666',
    marginVertical: 5
  },
  preco: {
    fontSize: 16,
    color: '#2c682c',
    fontFamily: 'NewRocker-Regular',
    fontWeight: 'bold'
  },
  botaoAdicionar: {
    backgroundColor: '#306030',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  botaoPerfil: {
    backgroundColor: '#3c1f1e',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20
  },
  botaoCarrinhoHeader: {
    backgroundColor: '#306030',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20
  },
  botaoTexto: {
    color: '#fff',
    fontFamily: 'NewRocker-Regular',
    fontSize: 16
  },
  botaoCarrinhoFlutuante: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#8a241c',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5
  },
  listaVazia: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
    fontFamily: 'NewRocker-Regular'
  }
});