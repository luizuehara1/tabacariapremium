import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp,
  getDoc,
  onSnapshot,
  setDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Real-time products subscription
export const subscribeProducts = (callback: (products: any[]) => void) => {
  const path = 'products';
  // Use a simple query first to ensure all products are fetched even if createdAt is missing
  return onSnapshot(collection(db, path), (snapshot) => {
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sort client-side to be safe
    const sortedProducts = products.sort((a: any, b: any) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return dateB - dateA;
    });
    callback(sortedProducts);
  }, (error) => {
    console.error("Real-time subscription error:", error);
    handleFirestoreError(error, OperationType.GET, path);
  });
};

export const getProducts = async () => {
  const path = 'products';
  try {
    const snapshot = await getDocs(collection(db, path));
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return products.sort((a: any, b: any) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return dateB - dateA;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const addProduct = async (product: any) => {
  const path = 'products';
  try {
    const res = await addDoc(collection(db, path), {
      ...product,
      createdAt: serverTimestamp()
    });
    return res.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const updateProduct = async (productId: string, data: any) => {
  const path = `products/${productId}`;
  try {
    await updateDoc(doc(db, 'products', productId), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const deleteProduct = async (productId: string) => {
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const createOrder = async (order: any) => {
  const path = 'orders';
  try {
    const orderData = {
      ...order,
      shipping: 10,
      status: order.status || 'Pendente',
      createdAt: serverTimestamp()
    };

    if (order.id) {
      const orderId = order.id;
      // Remove id from data to avoid duplicating it inside the document
      const { id, ...data } = orderData;
      await setDoc(doc(db, path, orderId), data);
      return orderId;
    } else {
      const res = await addDoc(collection(db, path), orderData);
      return res.id;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const getOrders = async () => {
  const path = 'orders';
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    try {
      const snapshot = await getDocs(collection(db, path));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (innerError) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  }
};

export const subscribeOrders = (callback: (orders: any[]) => void) => {
  const path = 'orders';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => {
    // If it fails because of missing index, fallback to unordered
    return onSnapshot(collection(db, path), (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  });
};

export const updateOrder = async (orderId: string, data: any) => {
  const path = `orders/${orderId}`;
  try {
    await updateDoc(doc(db, 'orders', orderId), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const deleteOrder = async (orderId: string) => {
  const path = `orders/${orderId}`;
  try {
    await deleteDoc(doc(db, 'orders', orderId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

// Funções genéricas solicitadas
export const getCollectionData = async (collectionName: string) => {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Erro ao buscar ${collectionName}:`, error);
    handleFirestoreError(error, OperationType.LIST, collectionName);
  }
};

export const getDocumentData = async (collectionName: string, documentId: string) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
  } catch (error) {
    console.error(`Erro ao buscar documento em ${collectionName}:`, error);
    handleFirestoreError(error, OperationType.GET, `${collectionName}/${documentId}`);
  }
};

export const listenCollection = (collectionName: string, callback: (data: any[]) => void) => {
  return onSnapshot(collection(db, collectionName), (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => {
    console.error(`Erro ao escutar ${collectionName}:`, error);
    handleFirestoreError(error, OperationType.LIST, collectionName);
  });
};

export const createDocument = async (collectionName: string, data: any) => {
  try {
    const res = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp()
    });
    return res.id;
  } catch (error) {
    console.error(`Erro ao criar em ${collectionName}:`, error);
    handleFirestoreError(error, OperationType.CREATE, collectionName);
  }
};

export const updateDocument = async (collectionName: string, documentId: string, data: any) => {
  try {
    await updateDoc(doc(db, collectionName, documentId), data);
  } catch (error) {
    console.error(`Erro ao atualizar em ${collectionName}:`, error);
    handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${documentId}`);
  }
};

export const deleteDocument = async (collectionName: string, documentId: string) => {
  try {
    await deleteDoc(doc(db, collectionName, documentId));
  } catch (error) {
    console.error(`Erro ao deletar em ${collectionName}:`, error);
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${documentId}`);
  }
};

export const isAdminUser = async (email: string) => {
  if (!email) return false;
  
  // 1. Email em lowercase para comparação consistente
  const emailLower = email.toLowerCase();
  
  // 2. Hardcoded (opcional, mas o usuário pediu para buscar REAL)
  const masterAdmins = ['luiz.uehara1@gmail.com', 'mestredaobradecuritiba@gmail.com'];
  if (masterAdmins.includes(emailLower)) return true;
  
  try {
    // 3. Verificar na coleção "administradores" onde ID é o email
    const adminDoc = await getDoc(doc(db, 'administradores', emailLower));
    if (adminDoc.exists() && adminDoc.data()?.admin === true) {
      return true;
    }
    
    // 4. Verificar emails que podem estar com casing diferente se não for o ID
    const q = query(collection(db, 'administradores'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const found = snapshot.docs.find(d => {
      const data = d.data();
      return (data.email?.toLowerCase() === emailLower && data.admin === true);
    });
    
    return !!found;
  } catch (error) {
    console.error("Erro ao verificar administradores:", error);
    return false;
  }
};
