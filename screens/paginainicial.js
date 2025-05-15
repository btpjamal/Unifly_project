import { SafeAreaView, StyleSheet, Image, ImageBackground } from 'react-native';
import { Button } from 'react-native-elements';

export default function Paginainicial({ navigation }) {
  return (
    <ImageBackground
      source={require('../assets/background2.png')}
      style={styles.background}
    >
      <SafeAreaView style={styles.container}>
        <Image style={styles.logo} source={require('../assets/logo.png')} />
        
        <Button
          title="Login"
          buttonStyle={styles.button}
          titleStyle={styles.buttonText} // Aplica a fonte ao texto do botão
          onPress={() => navigation.navigate("login")}
        />
        <Button
          title="Cadastro"
          buttonStyle={styles.button}
          titleStyle={styles.buttonText} // Aplica a fonte ao texto do botão
          onPress={() => navigation.navigate("cadastro")}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover', // A imagem cobrirá toda a tela
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Fundo semitransparente sobre a imagem
    padding: 8,
  },
  logo: {
    height: 370,
    width: 335,
    marginBottom: 20,
  },
  button: {
  margin: 10,
  backgroundColor: '#8a241c', // Tom de vermelho mais escuro e sombrio
  borderWidth: 3,
  borderColor: '#8a241c', // Vermelho queimado para um efeito "rasgado"
  borderRadius: 30, // Bordas levemente arredondadas, menos "perfeitas"
  paddingVertical: 12,
  paddingHorizontal: 28,
  shadowColor: 'black', // Sombra escura para profundidade
  shadowOffset: { width: 10, height: 10 },
  shadowOpacity: 0.7,
  shadowRadius: 4,
  elevation: 5, // Sombra no Android
  },
buttonText: {
  fontFamily: 'NewRocker-Regular', // Fonte com estilo grunge/metaleiro
  fontSize: 18, // Tamanho maior para impacto
  color: '#fbf7ec', // Contraste branco
  textShadowColor: 'black', // Sombras no texto para profundidade
  textShadowOffset: { width: 2, height: 2 },
  textShadowRadius: 3,
  letterSpacing: 2, // Espaçamento entre letras para estilo metaleiro
  textTransform: 'uppercase', // Maiúsculas para um impacto visual forte
},
});
