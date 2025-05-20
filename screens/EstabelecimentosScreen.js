import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Platform,
  StatusBar,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Ionicons } from "@expo/vector-icons";

export default function EstabelecimentosScreen({ navigation }) {
  const [estabelecimentos, setEstabelecimentos] = useState([]);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [estabelecimentosFiltrados, setEstabelecimentosFiltrados] = useState(
    []
  );

  useEffect(() => {
    const carregarEstabelecimentos = async () => {
      const querySnapshot = await getDocs(collection(db, "comercios"));
      const lista = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEstabelecimentos(lista);
      setEstabelecimentosFiltrados(lista);
    };

    carregarEstabelecimentos();
  }, []);

  useEffect(() => {
    const filtrados = estabelecimentos.filter((item) =>
      item.nome.toLowerCase().includes(filtroTexto.toLowerCase())
    );
    setEstabelecimentosFiltrados(filtrados);
  }, [filtroTexto, estabelecimentos]);

  return (
    <SafeAreaView style={styles.fundo}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backbutton}
          onPress={() => navigation.navigate("splashscreen")}
          activeOpacity={0.7}
        >
          <Ionicons name="exit-outline" size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.tituloContainer}>
          <Text style={styles.titulo} numberOfLines={1}>
            🏪 SELECIONE UM ESTABELECIMENTO
          </Text>
        </View>

        <TouchableOpacity
          style={styles.botaoPerfil}
          onPress={() => navigation.navigate("perfil")}
          activeOpacity={0.7}
        >
          <Ionicons name="person" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#4A6A5A"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar estabelecimento..."
          placeholderTextColor="#888"
          value={filtroTexto}
          onChangeText={setFiltroTexto}
        />
        {filtroTexto.length > 0 && (
          <TouchableOpacity onPress={() => setFiltroTexto("")}>
            <Ionicons name="close-circle" size={20} color="#6A0DAD" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={estabelecimentosFiltrados}
        contentContainerStyle={styles.listContainer}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate("cardapio", { comercioId: item.id })
            }
            activeOpacity={0.7}
          >
            <View style={styles.cardContent}>
              <Ionicons
                name="storefront"
                size={24}
                color="#6A0DAD"
                style={styles.cardIcon}
              />
              <Text style={styles.nome}>{item.nome}</Text>
              <Ionicons name="chevron-forward" size={20} color="#4A6A5A" />
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle" size={40} color="#6A0DAD" />
            <Text style={styles.emptyText}>
              Nenhum estabelecimento encontrado
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#1A2233",
    width: "100%",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  backbutton: {
    backgroundColor: "#4A6A5A",
    padding: 8,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  tituloContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  titulo: {
    fontSize: 18,
    color: "#FFF",
    textAlign: "center",
    fontWeight: "bold",
  },
  botaoPerfil: {
    backgroundColor: "#6A0DAD",
    padding: 10,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    margin: 15,
    padding: 15,
    borderRadius: 10,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1A2233",
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#FFF",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardIcon: {
    marginRight: 15,
  },
  nome: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A2233",
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#6A0DAD",
    marginTop: 10,
    textAlign: "center",
  },
});
