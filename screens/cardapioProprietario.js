// screens/cardapioProprietario.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ImageBackground, 
  Alert,
  TextInput,
  Modal
} from 'react-native';
import { buscarProdutosComercio, adicionarProduto, atualizarProduto, excluirProduto } from '../firebaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CardapioProprietario({ navigation }) {
  const [produtos, setProdutos] = useState([]);
  const [comercioId, setComercioId] = useState(null);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [novoProduto, setNovoProduto] = useState({
    nome: '',
    descricao: '',
    preco: '',
    estoque: ''
  });

  // Carregar dados do comércio
  useEffect(() => {
    const carregarDados = async () => {
      const uid = await AsyncStorage.getItem('userUid');
      const usuarioDoc = await getDoc(doc(db, 'usuarios', uid));
      setComercioId(usuarioDoc.data().comercioId);
      
      const lista = await buscarProdutosComercio(usuarioDoc.data().comercioId);
      setProdutos(lista);
    };
    
    carregarDados();
  }, []);

  // Função para abrir modal de edição/criação
  const abrirModal = (produto = null) => {
    setProdutoEditando(produto);
    setNovoProduto(produto ? { ...produto } : {
      nome: '',
      descricao: '',
      preco: '',
      estoque: ''
    });
    setModalVisivel(true);
  };

  // Salvar produto
  const salvarProduto = async () => {
    try {
      const dadosProduto = {
        ...novoProduto,
        preco: parseFloat(novoProduto.preco),
        estoque: parseInt(novoProduto.estoque)
      };

      if (produtoEditando) {
        await atualizarProduto(comercioId, produtoEditando.id, dadosProduto);
        setProdutos(prev => prev.map(p => p.id === produtoEditando.id ? { ...dadosProduto, id: p.id } : p));
      } else {
        const novoId = await adicionarProduto(comercioId, dadosProduto);
        setProdutos(prev => [...prev, { ...dadosProduto, id: novoId }]);
      }
      
      setModalVisivel(false);
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  // Excluir produto
  const confirmarExclusao = (produtoId) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este produto?',
      [
        { text: 'Cancelar' },
        { 
          text: 'Excluir', 
          onPress: async () => {
            await excluirProduto(comercioId, produtoId);
            setProdutos(prev => prev.filter(p => p.id !== produtoId));
          }
        }
      ]
    );
  };

  return (
    <ImageBackground source={require('../assets/background3.jpg')} style={styles.background}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.botaoDashboard} 
          onPress={() => navigation.navigate('dashboard')}>
          <Text style={styles.botaoTexto}>🏠 Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.botaoNovo}
          onPress={() => abrirModal()}>
          <Text style={styles.botaoTexto}>+ Novo Produto</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.titulo}>Cardápio Proprietário</Text>

      <FlatList
        data={produtos}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <View style={styles.infoContainer}>
              <Text style={styles.nome}>{item.nome}</Text>
              <Text style={styles.descricao}>{item.descricao}</Text>
              <View style={styles.detalhes}>
                <Text style={styles.preco}>R$ {item.preco.toFixed(2)}</Text>
                <Text style={styles.estoque}>Estoque: {item.estoque}</Text>
              </View>
            </View>
            
            <View style={styles.botoesContainer}>
              <TouchableOpacity 
                style={styles.botaoEditar}
                onPress={() => abrirModal(item)}>
                <Text style={styles.botaoTexto}>✏️</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.botaoExcluir}
                onPress={() => confirmarExclusao(item.id)}>
                <Text style={styles.botaoTexto}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Modal de Edição */}
      <Modal visible={modalVisivel} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitulo}>
            {produtoEditando ? 'Editar Produto' : 'Novo Produto'}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Nome do Produto"
            value={novoProduto.nome}
            onChangeText={text => setNovoProduto({ ...novoProduto, nome: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Descrição"
            value={novoProduto.descricao}
            onChangeText={text => setNovoProduto({ ...novoProduto, descricao: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Preço"
            keyboardType="numeric"
            value={novoProduto.preco}
            onChangeText={text => setNovoProduto({ ...novoProduto, preco: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Estoque"
            keyboardType="numeric"
            value={novoProduto.estoque}
            onChangeText={text => setNovoProduto({ ...novoProduto, estoque: text })}
          />

          <View style={styles.botoesModal}>
            <TouchableOpacity 
              style={styles.botaoCancelar}
              onPress={() => setModalVisivel(false)}>
              <Text style={styles.botaoTexto}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.botaoSalvar}
              onPress={salvarProduto}>
              <Text style={styles.botaoTexto}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  lista: {
    padding: 15
  },
  itemContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    marginBottom: 15,
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  infoContainer: {
    flex: 1
  },
  nome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  descricao: {
    fontSize: 14,
    color: '#666',
    marginVertical: 5
  },
  detalhes: {
    flexDirection: 'row',
    gap: 15
  },
  preco: {
    fontSize: 16,
    color: '#2c682c',
    fontWeight: 'bold'
  },
  estoque: {
    fontSize: 14,
    color: '#8a241c'
  },
  botoesContainer: {
    flexDirection: 'row',
    gap: 10
  },
  botaoEditar: {
    backgroundColor: '#306030',
    padding: 10,
    borderRadius: 5
  },
  botaoExcluir: {
    backgroundColor: '#8a241c',
    padding: 10,
    borderRadius: 5
  },
  botaoTexto: {
    color: '#fff',
    fontFamily: 'NewRocker-Regular'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.95)'
  },
  modalTitulo: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'NewRocker-Regular',
    color: '#8a241c'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontFamily: 'NewRocker-Regular'
  },
  botoesModal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20
  },
  botaoCancelar: {
    backgroundColor: '#8a241c',
    padding: 15,
    borderRadius: 10,
    width: '40%'
  },
  botaoSalvar: {
    backgroundColor: '#306030',
    padding: 15,
    borderRadius: 10,
    width: '40%'
  },
  botaoNovo: {
    backgroundColor: '#306030',
    padding: 10,
    borderRadius: 5
  },
  botaoDashboard: {
    backgroundColor: '#3c1f1e',
    padding: 10,
    borderRadius: 5
  }
});