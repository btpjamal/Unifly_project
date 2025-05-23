import { SafeAreaView, StyleSheet, Image } from 'react-native';
import { Button } from 'react-native-elements';

export default function Paginainicial({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <Image style={styles.logo} source={require('../assets/logo.png')} />
      
      <Button
        title="Login"
        buttonStyle={styles.button}
        titleStyle={styles.buttonText}
        onPress={() => navigation.navigate("login")}
      />
      <Button
        title="Cadastro"
        buttonStyle={styles.button}
        titleStyle={styles.buttonText}
        onPress={() => navigation.navigate("cadastro")}
      />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fffff', // Cor sólida no fundo
  },
  logo: {
    height: 200,
    width: 300,
    marginBottom: 20,
  },
  button: {
    margin: 10,
    backgroundColor: '#1c2c40',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    fontFamily: 'Roboto-Medium',
    fontSize: 18,
    color: '#F0F4F8',
    textShadowColor: 'black',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
