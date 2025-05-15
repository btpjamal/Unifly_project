// screens/carrinho.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, ImageBackground } from 'react-native';

export default function Carrinho({ route, navigation }) {
  const [itensCarrinho, setItensCarrinho] = useState([]);

  useEffect(() => {
    if (route.params?.itens) {
      const agrupados = agruparItens(route.params.itens);
      setItensCarrinho(agrupados);
    }
  }, [route.params]);

  const agruparItens = (itens) => {
    const mapa = {};
    itens.forEach(item => {
      if (mapa[item.id]) {
        mapa[item.id].quantidade += 1;
      } else {
        mapa[item.id] = { ...item, quantidade: 1 };
      }
    });
    return Object.values(mapa);
  };

  const alterarQuantidade = (id, delta) => {
    const atualizados = itensCarrinho.map(item => {
      if (item.id === id) {
        const novaQtd = item.quantidade + delta;
        if (novaQtd <= 0) {
          return null; // Remover
        }
        return { ...item, quantidade: novaQtd };
      }
      return item;
    }).filter(Boolean);
    setItensCarrinho(atualizados);
  };

  const calcularTotal = () => {
    return itensCarrinho.reduce((soma, item) => soma + item.preco * item.quantidade, 0).toFixed(2);
  };

  const finalizarCompra = () => {
  if (itensCarrinho.length === 0) {
    Alert.alert("Carrinho vazio", "Adicione itens antes de finalizar.");
    return;
  }

  const carrinho = itensCarrinho.map(item => ({
    nome: item.nome,
    preco: item.preco,
    quantidade: item.quantidade
  }));

  navigation.navigate("pagamento", {
    total: parseFloat(calcularTotal()),
    carrinho: carrinho
  });
};


  return (
    <ImageBackground source={require('../assets/background3.jpg')} style={styles.background}>
    <Text style={styles.titulo}>Seu Carrinho</Text>
      <View style={styles.container}>
        

        {itensCarrinho.length === 0 ? (
          <Text style={styles.vazio}>Seu carrinho está vazio 😞</Text>
        ) : (
          <>
            <FlatList
              data={itensCarrinho}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.item}>
                  <Image source={item.imagem} style={styles.imagem} />
                  <View style={styles.info}>
                    <Text style={styles.nome}>{item.nome}</Text>
                    <Text style={styles.preco}>R$ {item.preco.toFixed(2)} x {item.quantidade}</Text>
                    <View style={styles.qtdContainer}>
                      <TouchableOpacity onPress={() => alterarQuantidade(item.id, -1)} style={styles.qtdBotao}>
                        <Text style={styles.qtdTexto}>-</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => alterarQuantidade(item.id, 1)} style={styles.qtdBotao}>
                        <Text style={styles.qtdTexto}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            />
            <Text style={styles.total}>Total: R$ {calcularTotal()}</Text>
            <TouchableOpacity style={styles.finalizar} onPress={finalizarCompra}>
              <Text style={styles.finalizarTexto}>Finalizar Pedido</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.continuar} onPress={() => navigation.goBack()}>
              <Text style={styles.continuarTexto}>Continuar comprando</Text>
            </TouchableOpacity>
            
            
          </>
        )}
      </View>
      <TouchableOpacity style={styles
            .backbutton} onPress={() => navigation.goBack()}>
              <Text style={styles.botaoTexto}>{"<"}</Text>
            </TouchableOpacity>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backbutton: {
    position: 'absolute',
    top: 20, // Distância do topo da tela
    left: 20, // Distância do lado esquerdo
    backgroundColor: '#8a241c', // Vermelho vinho
    borderWidth: 3,
    borderColor: '#8a241c',
    borderRadius: 30, // Bordas arredondadas
    paddingVertical: 10,
    paddingHorizontal: 15,
    shadowColor: '#3c1f1e', // Sombra escura para profundidade
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 4,
    elevation: 5, // Sombra no Android
  },
  background: {
    flex: 1,
  },
  container: {
    padding: 20,
    flex: 1,
    marginTop: 50,
  },
  titulo: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'NewRocker-Regular',
    color: '#8a241c',
    marginTop: 30,
  },
  item: {
    backgroundColor: 'white',
    marginBottom: 15,
    borderRadius: 12,
    flexDirection: 'row',
    padding: 10,
    elevation: 5, // Sombra no Android
    shadowColor: '#000000', // Cor da sombra
    shadowOffset: { width: 8, height: 8 }, // Sombra posicionada embaixo e à direita
    shadowOpacity: 0.7, // Intensidade da sombra
    shadowRadius: 4, // Difusão da sombra
  },
  imagem: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  info: {
    marginLeft: 12,
    flex: 1,
    justifyContent: 'center',
  },
  nome: {
    fontSize: 16,
    fontFamily: 'NewRocker-Regular',
    color: '#333',
  },
  preco: {
    color: '#666',
    fontSize: 14,
  },
  qtdContainer: {
    flexDirection: 'row',
    marginTop: 6,
  },
  qtdBotao: {
    backgroundColor: '#8a241c',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  qtdTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  total: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
    color: '#3c1f1e',
    fontFamily: 'NewRocker-Regular',
  },
  finalizar: {
    backgroundColor: '#306030',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  finalizarTexto: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'NewRocker-Regular',
  },
  continuar: {
    backgroundColor: '#8a241c',
    padding: 10,
    borderRadius: 8,
  },
  continuarTexto: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'NewRocker-Regular',
  },
  vazio: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
    fontFamily: 'NewRocker-Regular',
  },
  botaoTexto: {
    color: '#fff',
    fontFamily: 'NewRocker-Regular',
    textAlign: 'center',
  },
});

