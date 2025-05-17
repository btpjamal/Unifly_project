import React, { useState, useEffect } from 'react';
import { buscarProdutosDoEstabelecimento } from '../firebaseService';
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
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function CardapioCliente({ navigation, route }) {
  const { comercioId } = route.params;
   const [nomeEstabelecimento, setNomeEstabelecimento] = useState('');
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);

  // Carregar dados iniciais
  useEffect(() => {
  const carregarDados = async () => {
    try {
      const estabelecimentoRef = doc(db, 'comercios', comercioId);
      const estabelecimentoSnap = await getDoc(estabelecimentoRef);
      
      if (estabelecimentoSnap.exists()) {
        setNomeEstabelecimento(estabelecimentoSnap.data().nome);
      }

      const [produtosFirebase, carrinhoLocal] = await Promise.all([
        buscarProdutosDoEstabelecimento(comercioId), // Função modificada
        AsyncStorage.getItem(`carrinho_${comercioId}`) // Carrinho por estabelecimento
      ]);
      
      setProdutos(produtosFirebase);
      if (carrinhoLocal) setCarrinho(JSON.parse(carrinhoLocal));
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar o cardápio');
      console.error(error);
    }
  };

  carregarDados();
}, [comercioId]);

  // Persistir carrinho
  useEffect(() => {
  const salvarCarrinho = async () => {
    await AsyncStorage.setItem(`carrinho_${comercioId}`, JSON.stringify(carrinho));
  };
  salvarCarrinho();
}, [carrinho, comercioId]); // Adicione a dependência

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
    total: carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0),
    comercioId, // Passe o ID do estabelecimento
    comercioNome: nomeEstabelecimento
  });
};

  return (
    <ImageBackground source={require('../assets/background3.jpg')} style={styles.background}>
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backbutton} 
          onPress={() => navigation.goBack()}>
         <Text style={styles.botaoGoback}>{"<"}</Text>
        </TouchableOpacity>

      <View style={styles.tituloContainer}>
        <Text style={styles.titulo} numberOfLines={1}>
        {nomeEstabelecimento || 'Cardápio'}
        </Text>
      </View>


      <TouchableOpacity 
        style={styles.botaoPerfil}
        onPress={() => navigation.navigate('perfil')}>
        <Text style={styles.botaoTexto}>👤 Perfil</Text>
      </TouchableOpacity>
      </View>

      

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
        <Text style={styles.botaoTexto}>Ver Carrinho 🛒({carrinho.length})</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
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
 background: {
    flex: 1,
    resizeMode: 'cover'
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