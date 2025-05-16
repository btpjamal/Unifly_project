//Autenticação com SDK
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, getDocs, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { auth, db } from './firebase';

export const cadastrarUsuario = async ({ nome, email, senha, tipo, nomeComercio }) => {
  try {
    // 1. Cria o usuário no Auth
    const cred = await createUserWithEmailAndPassword(auth, email, senha);
    const uid = cred.user.uid;

    // 2. Aguarda login automático (já resolvido pelo createUserWithEmailAndPassword)
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado após cadastro.");

    // 3. Cria o documento do usuário no Firestore primeiro
    const userData = {
      nome,
      email,
      tipo,
      comercioId: null // Inicialmente null
    };
    await setDoc(doc(db, 'usuarios', uid), userData);

    let comercioId = null;

    // 4. Se for admin, cria o comércio
    if (tipo === 'admin') {
      comercioId = nomeComercio.toLowerCase().replace(/\s+/g, '');
      await setDoc(doc(db, 'comercios', comercioId), {
        nome: nomeComercio,
        codigoIdentificador: comercioId,
        criadoPor: uid,
        tema: {
          corPrimaria: '#A52A2A',
          corTexto: '#FFFFFF',
          logoUrl: '',
          imagemFundo: ''
        }
      });

      // Atualiza o usuário com o ID do comércio
      await setDoc(doc(db, 'usuarios', uid), {
        comercioId
      }, { merge: true }); // Usa merge para não sobrescrever outros campos
    }

    return cred.user;

  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    throw new Error(error.message || "Erro ao criar conta. Tente novamente.");
  }
};



// Login
export const autenticarUsuario = async (email, senha) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, senha);
  return {
    uid: userCredential.user.uid,
    email: userCredential.user.email
  };
};


//Buscar Produtos
// Função modificada para buscar produtos específicos
export const buscarProdutosDoEstabelecimento = async (comercioId) => {
  try {
    const produtosRef = collection(db, 'comercios', comercioId, 'produtos');
    const snapshot = await getDocs(produtosRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }
};

//Salvar Pedido
export const salvarPedido = async (token, uid, itens, total) => {
  try {
    const pedido = {
      token,
      uid,
      total,
      itens,
      status: 'pendente',
      criadoEm: serverTimestamp(),
    };

    await addDoc(collection(db, 'pedidos'), pedido);
  } catch (error) {
    console.error('Erro ao salvar pedido:', error);
    throw error;
  }
};

//Buscar Pedidos
export const buscarPedidos = async (token, uid) => {
  try {
    const pedidosRef = collection(db, 'pedidos');
    const q = query(pedidosRef, where('uid', '==', uid));
    const snapshot = await getDocs(q);

    const pedidos = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    }));

    return pedidos;
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return [];
  }
};

// FirebaseService.js (funções adicionais)
export const buscarProdutosComercio = async (comercioId) => {
  const produtosRef = collection(db, 'comercios', comercioId, 'produtos');
  const snapshot = await getDocs(produtosRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const adicionarProduto = async (comercioId, produto) => {
  const produtosRef = collection(db, 'comercios', comercioId, 'produtos');
  const docRef = await addDoc(produtosRef, produto);
  return docRef.id;
};

export const atualizarProduto = async (comercioId, produtoId, novosDados) => {
  const produtoRef = doc(db, 'comercios', comercioId, 'produtos', produtoId);
  await updateDoc(produtoRef, novosDados);
};

export const excluirProduto = async (comercioId, produtoId) => {
  const produtoRef = doc(db, 'comercios', comercioId, 'produtos', produtoId);
  await deleteDoc(produtoRef);
};

// Adicione esta função
export const obterTipoUsuario = async (uid) => {
  const userDoc = await getDoc(doc(db, 'usuarios', uid));
  return userDoc.data().tipo;
};

export const buscarEstabelecimentos = async () => {
  try {
    const estabelecimentosRef = collection(db, 'comercios');
    const querySnapshot = await getDocs(estabelecimentosRef);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
  } catch (error) {
    console.error("Erro ao buscar estabelecimentos:", error);
    return [];
  }
};
