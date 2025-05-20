import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ImageBackground,
  TextInput,
  Modal,
  Alert
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { buscarProdutosComercio, adicionarProduto, atualizarProduto, excluirProduto } from '../firebaseService';

export default function CardapioProprietario({ navigation }) {
  const [produtos, setProdutos] = useState([]);
  const [comercioId, setComercioId] = useState(null);
  const [nomeEstabelecimento, setNomeEstabelecimento] = useState('');
  const [modalVisivel, setModalVisivel] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [novoProduto, setNovoProduto] = useState({
    nome: '',
    descricao: '',
    preco: '',
    estoque: '',
    foto: null,
  });

  // Recupera o commerceId e o nome do estabelecimento e carrega os produtos
  useEffect(() => {
    const carregarDados = async () => {
    const auth = getAuth();
    const usuario = auth.currentUser;
    if (!usuario) {
      Alert.alert('Erro', 'Usuário não autenticado.');
      // Se necessário, redirecione para a tela de login
      navigation.navigate('login');
      return;
    }

    const usuarioDoc = await getDoc(doc(db, 'usuarios', usuario.uid));
    const comercio = usuarioDoc.data().comercioId;
    setComercioId(comercio);
    
    const lista = await buscarProdutosComercio(comercio);
    setProdutos(lista);
  };

  carregarDados();
}, []);

  // Abre o modal para criar ou editar um produto
  const abrirModal = (produto = null) => {
    setProdutoEditando(produto);
    setNovoProduto(
      produto
        ? { ...produto }
        : { nome: '', descricao: '', preco: '', estoque: '', foto: null }
    );
    setModalVisivel(true);
  };

  // Função para escolher foto (implemente sua lógica com o expo-image-picker)
  const escolherFotoProduto = async () => {
    // Exemplo simplificado:
    // Utilize o ImagePicker para selecionar a foto e atualizar novoProduto.foto
    // Seu código de seleção de imagem vai aqui...
  };

  // Salva (cria/atualiza) o produto
  const salvarProduto = async () => {
    try {
      const dadosProduto = {
        nome: novoProduto.nome,
        descricao: novoProduto.descricao,
        preco: parseFloat(novoProduto.preco),
        estoque: parseInt(novoProduto.estoque),
      };

      let dadosProdutoComFoto = { ...dadosProduto };

      if (produtoEditando) {
        // Atualiza produto existente
        if (novoProduto.foto && !novoProduto.foto.startsWith('http')) {
          // Se houver foto nova, faça o upload (lógica de upload similar à usada no perfil)
          // e obtenha a URL para atribuir:
          // dadosProdutoComFoto.foto = urlObtida;
        } else if (produtoEditando.foto) {
          dadosProdutoComFoto.foto = produtoEditando.foto;
        }
        await atualizarProduto(comercioId, produtoEditando.id, dadosProdutoComFoto);
        setProdutos(prev =>
          prev.map(p => p.id === produtoEditando.id ? { ...dadosProdutoComFoto, id: p.id } : p)
        );
      } else {
        // Cria novo produto e obtém o novo ID
        const novoId = await adicionarProduto(comercioId, dadosProduto);
        if (novoProduto.foto && !novoProduto.foto.startsWith('http')) {
          // Faça o upload e depois atualize o documento com a URL da foto
          // dadosProdutoComFoto.foto = urlObtida;
          await atualizarProduto(comercioId, novoId, dadosProdutoComFoto);
        }
        setProdutos(prev => [...prev, { ...dadosProdutoComFoto, id: novoId }]);
      }
      setModalVisivel(false);
    } catch (error) {
      Alert.alert('Erro', error.message);
      console.error('Erro ao salvar produto:', error);
    }
  };

  // Confirma exclusão do produto
  const confirmarExclusao = (produtoId) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este produto?',
      [
        { text: 'Cancelar' },
        {
          text: 'Excluir',
          onPress: async () => {
            try {
              await excluirProduto(comercioId, produtoId);
              setProdutos(prev => prev.filter(p => p.id !== produtoId));
            } catch (error) {
              Alert.alert('Erro', 'Falha ao excluir o produto.');
            }
          }
        }
      ]
    );
  };

  return (
    <ImageBackground source={require('../assets/background3.jpg')} style={styles.background}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backbutton} onPress={() => navigation.goBack()}>
          <Text style={styles.botaoGoback}>{"<"}</Text>
        </TouchableOpacity>
        <View style={styles.tituloContainer}>
          <Text style={styles.titulo} numberOfLines={1}>
            {nomeEstabelecimento || 'Cardápio'}
          </Text>
        </View>
        <TouchableOpacity style={styles.botaoPerfil} onPress={() => navigation.navigate('perfil')}>
          <Text style={styles.botaoTexto}>👤 Perfil</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={produtos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            {item.foto ? (
              <Image source={{ uri: item.foto }} style={styles.productImage} />
            ) : null}
            <View style={styles.infoProduto}>
              <Text style={styles.nome}>{item.nome}</Text>
              <Text style={styles.descricao}>{item.descricao}</Text>
              <Text style={styles.preco}>R$ {parseFloat(item.preco).toFixed(2)}</Text>
            </View>
            <View style={styles.botoesContainer}>
              <TouchableOpacity onPress={() => abrirModal(item)} style={styles.botaoEditar}>
                <Text style={styles.botaoTexto}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => confirmarExclusao(item.id)} style={styles.botaoExcluir}>
                <Text style={styles.botaoTexto}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.listaVazia}>Nenhum produto disponível no momento</Text>
        }
      />

      <TouchableOpacity style={styles.botaoCarrinhoFlutuante} onPress={() => abrirModal(null)}>
        <Text style={styles.botaoTexto}>Adicionar Produto</Text>
      </TouchableOpacity>

      <Modal visible={modalVisivel} animationType="slide">
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nome"
            value={novoProduto.nome}
            onChangeText={(text) => setNovoProduto(prev => ({ ...prev, nome: text }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Descrição"
            value={novoProduto.descricao}
            onChangeText={(text) => setNovoProduto(prev => ({ ...prev, descricao: text }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Preço"
            keyboardType="numeric"
            value={novoProduto.preco}
            onChangeText={(text) => setNovoProduto(prev => ({ ...prev, preco: text }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Estoque"
            keyboardType="numeric"
            value={novoProduto.estoque}
            onChangeText={(text) => setNovoProduto(prev => ({ ...prev, estoque: text }))}
          />

          {novoProduto.foto ? (
            <Image source={{ uri: novoProduto.foto }} style={styles.fotoProdutoModal} />
          ) : null}

          <TouchableOpacity onPress={escolherFotoProduto} style={styles.botaoFoto}>
            <Text style={styles.botaoTexto}>
              {novoProduto.foto ? 'Alterar foto' : 'Adicionar foto'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={salvarProduto} style={styles.botaoSalvar}>
            <Text style={styles.botaoTexto}>Salvar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setModalVisivel(false)} style={styles.botaoCancelar}>
            <Text style={styles.botaoTexto}>Cancelar</Text>
          </TouchableOpacity>
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
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(138, 36, 28, 0.9)',
    width: '100%'
  },
  backbutton: {
    backgroundColor: '#3c1f1e',
    padding: 10,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  botaoGoback: {
    color: '#fff',
    fontSize: 20,
    lineHeight: 24
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
    borderRadius: 20
  },
  botaoTexto: {
    color: '#fff',
    fontFamily: 'NewRocker-Regular',
    fontSize: 16
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
    alignItems: 'center',
    elevation: 3
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
    resizeMode: 'cover'
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
  botoesContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  botaoEditar: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8
  },
  botaoExcluir: {
    backgroundColor: '#F44336',
    padding: 8,
    borderRadius: 4
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
  },
  modalContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
    padding: 8,
    borderRadius: 4
  },
  botaoFoto: {
    backgroundColor: '#9C27B0',
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 12
  },
  botaoSalvar: {
    backgroundColor: '#4CAF50',
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 8
  },
  botaoCancelar: {
    backgroundColor: '#F44336',
    padding: 12,
    alignItems: 'center',
    borderRadius: 8
  },
  fotoProdutoModal: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    borderRadius: 8,
    marginBottom: 12
  }
});
