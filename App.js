import 'expo-crypto';
import { useState, useEffect} from 'react';
import { Text, StyleSheet} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './screens/splashscreen';
import PaginaInicial from './screens/paginainicial';
import Login from './screens/login';
import Cadastro from './screens/cadastro';
import CardapioCliente from './screens/cardapio';
import Carrinho from './screens/carrinho';
import StatusPedido from './screens/statusPedido';
import Perfil from './screens/perfil';
import CardapioProprietario from './screens/cardapioProprietario';
import EstabelecimentosScreen from './screens/EstabelecimentosScreen';
import PerfilScreenProprietario from './screens/perfilProprietário';
import * as Font from 'expo-font';

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'NewRocker-Regular': require('./assets/fonts/NewRocker-Regular.ttf'),
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null; // Mostre um carregador ou tela inicial
  }

  return (
    <Text style={styles.text}>Minha fonte global!</Text>,
    <NavigationContainer>
      <Stack.Navigator initialRouteName="splashscreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="splashscreen" component={SplashScreen} />
        <Stack.Screen name="paginainicial" component={PaginaInicial} />
        <Stack.Screen name="login" component={Login} />
        <Stack.Screen name="cardapio" component={CardapioCliente} />
        <Stack.Screen name="cadastro" component={Cadastro} />
        <Stack.Screen name="carrinho" component={Carrinho} />
        <Stack.Screen name="statuspedido" component={StatusPedido} />
        <Stack.Screen name="perfil" component={Perfil} />
        <Stack.Screen name="cardapioProprietario" component={CardapioProprietario} />
        <Stack.Screen name="EstabelecimentosScreen" component={EstabelecimentosScreen} />
        <Stack.Screen name="perfilProprietário" component={PerfilScreenProprietario} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
const styles = StyleSheet.create({
  text: {
    fontFamily: 'NewRocker-Regular',
    fontSize: 20,
  },
});
