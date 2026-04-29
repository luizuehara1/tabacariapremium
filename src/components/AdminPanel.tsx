import { useState, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Plus, 
  Trash2, 
  Layout, 
  LogIn, 
  LogOut, 
  Loader2, 
  Image as ImageIcon,
  Tag,
  AlignLeft,
  ListFilter,
  Package,
  Info,
  Type,
  LayoutDashboard,
  FileText,
  Search,
  Download,
  Calendar,
  ShoppingBag,
  CheckCircle2,
  Truck,
  Clock,
  Pencil,
  RotateCcw,
  CreditCard,
  QrCode
} from 'lucide-react';
import { auth, loginWithGoogle, logout } from '../lib/firebase';
import { 
  addProduct, 
  subscribeProducts, 
  deleteProduct, 
  updateProduct,
  isAdminUser, 
  getOrders,
  subscribeOrders,
  updateOrder,
  deleteOrder
} from '../services/storeService';
import { onAuthStateChanged } from 'firebase/auth';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

type TabType = 'basic' | 'description' | 'flavors' | 'reports' | 'orders';

interface Order {
  id: string;
  createdAt: any;
  items: any[];
  total: number;
  status?: string;
}

export default function AdminPanel({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [exporting, setExporting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    images: [] as string[],
    tag: '',
    description: '',
    flavors: [] as string[],
    isHighlight: false
  });
  const [isAdding, setIsAdding] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [orderToDelete, setOrderToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingOrder, setIsDeletingOrder] = useState(false);

  useEffect(() => {
    let unsubscribeProducts: () => void;
    let unsubscribeOrders: () => void;
    
    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u && u.email) {
        const adminStatus = await isAdminUser(u.email);
        setIsAdmin(adminStatus);
        if (adminStatus) {
          unsubscribeProducts = subscribeProducts((data) => {
            setProducts(data || []);
          });
          unsubscribeOrders = subscribeOrders((data) => {
            setOrders(data || []);
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProducts) unsubscribeProducts();
      if (unsubscribeOrders) unsubscribeOrders();
    };
  }, []);

  async function handleLogin() {
    setLoginError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      if (err.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        setLoginError(`Domínio não autorizado. Adicione "${domain}" à lista de domínios autorizados no Console do Firebase (Authentication > Settings).`);
      } else {
        setLoginError('Ocorreu um erro ao tentar fazer login. Tente novamente.');
        console.error('Login error:', err);
      }
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsAdding(true);
    try {
      const productData = {
        ...formData,
        image: formData.images[0] || '', // Compatibility
        price: parseFloat(formData.price),
        rating: 5
      };

      if (editingId) {
        await updateProduct(editingId, productData);
        alert("Produto atualizado com sucesso!");
        setEditingId(null);
      } else {
        await addProduct(productData);
        alert("Produto adicionado com sucesso!");
      }

      setFormData({ name: '', price: '', images: [], tag: '', description: '', flavors: [], isHighlight: false });
      setActiveTab('basic');
    } catch (err: any) {
      console.error("Erro ao adicionar produto:", err);
      try {
        const errorData = JSON.parse(err.message);
        alert(`Erro ao adicionar: ${errorData.error}`);
      } catch {
        alert("Erro ao adicionar produto. Verifique sua conexão ou permissões.");
      }
    } finally {
      setIsAdding(false);
    }
  }

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setFormData({
      name: product.name || '',
      price: product.price?.toString() || '',
      images: product.images || (product.image ? [product.image] : []),
      tag: product.tag || '',
      description: product.description || '',
      flavors: product.flavors || [],
      isHighlight: product.isHighlight || false
    });
    setActiveTab('basic');
    // Scroll to form
    const container = document.querySelector('.custom-scrollbar');
    if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: '',
      price: '',
      images: [],
      tag: '',
      description: '',
      flavors: [],
      isHighlight: false
    });
  };

  async function handleDelete(product: any) {
    setProductToDelete(product);
  }

  async function confirmDelete() {
    if (!productToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteProduct(productToDelete.id);
      setProductToDelete(null);
      // Optional: Success message in UI rather than alert
    } catch (err: any) {
      console.error("Erro ao excluir produto:", err);
      alert("Erro ao excluir.");
    } finally {
      setIsDeleting(false);
    }
  }

  const handleAddFlavor = () => {
    setFormData({ ...formData, flavors: [...formData.flavors, ''] });
  };

  const handleFlavorChange = (index: number, value: string) => {
    const newFlavors = [...formData.flavors];
    newFlavors[index] = value;
    setFormData({ ...formData, flavors: newFlavors });
  };

  const removeFlavor = (index: number) => {
    setFormData({ ...formData, flavors: formData.flavors.filter((_, i) => i !== index) });
  };

  const handleAddImage = () => {
    setFormData({ ...formData, images: [...formData.images, ''] });
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const removeImage = (index: number) => {
    setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) });
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateOrder(orderId, { status });
    } catch (err) {
      alert("Erro ao atualizar status.");
    }
  };

  const handleDeleteOrder = async (order: any) => {
    setOrderToDelete(order);
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    setIsDeletingOrder(true);
    try {
      await deleteOrder(orderToDelete.id);
      setOrderToDelete(null);
    } catch (err) {
      console.error("Erro ao excluir pedido:", err);
      alert("Erro ao excluir pedido.");
    } finally {
      setIsDeletingOrder(false);
    }
  };

  const generateReport = async () => {
    setExporting(true);
    try {
      const allOrders = await getOrders() as Order[];
      if (!allOrders) return;

      const filteredOrders = allOrders.filter((order: Order) => {
        if (!order.createdAt) return false;
        const date = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
        return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
      });

      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(40, 40, 40);
      doc.text("Relatório de Vendas", 14, 22);
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date(selectedYear, selectedMonth));
      doc.text(`Mês: ${monthName} de ${selectedYear}`, 14, 32);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 38);

      // Table
      const tableData = filteredOrders.map(order => {
        const date = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
        const productNames = order.items?.map((item: any) => `${item.name} (${item.quantity}x)`).join(', ') || 'N/A';
        return [
          date.toLocaleDateString('pt-BR'),
          productNames,
          `R$ ${order.total.toFixed(2)}`,
          order.status || 'Pendente'
        ];
      });

      autoTable(doc, {
        startY: 50,
        head: [['Data', 'Produtos', 'Total', 'Status']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [142, 68, 255] }, // brand-accent color approximately
      });

      // Total summary
      const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const totalSales = filteredOrders.length;
      
      const lastY = (doc as any).lastAutoTable.finalY || 50;
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text(`Total de Vendas: ${totalSales}`, 14, lastY + 20);
      doc.text(`Receita Total: R$ ${totalRevenue.toFixed(2)}`, 14, lastY + 30);

      doc.save(`relatorio-vendas-${monthName}-${selectedYear}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      alert("Erro ao gerar PDF.");
    } finally {
      setExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 sm:p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="relative bg-brand-dark w-full h-full sm:h-[90vh] sm:max-w-4xl sm:rounded-[40px] overflow-hidden border-t sm:border border-white/10 flex flex-col"
      >
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-white/5 flex items-center justify-between bg-brand-dark/50 sticky top-0 z-20 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden border border-white/10 group-hover:scale-105 transition-transform">
              <img 
                src="https://i.postimg.cc/MpvX4Nyx/Chat-GPT-Image-28-de-abr-de-2026-22-38-06.png" 
                alt="Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase italic">Painel <span className="text-brand-accent">Admin</span></h2>
              <p className="text-[10px] text-white/30 font-bold tracking-widest uppercase">Gerenciamento de Inventário</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-brand-black/20">
          {!user ? (
            <div className="flex flex-col items-center justify-center py-32 p-8">
              <Package size={64} className="text-white/5 mb-8" />
              <h3 className="text-xl font-bold mb-4">Acesso Restrito</h3>
              <p className="text-white/50 mb-8 max-w-sm mx-auto text-center">Faça login com sua conta do Google para acessar a gestão da loja.</p>
              {loginError && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs leading-relaxed max-w-md">
                  <p className="font-bold mb-1">Erro de Configuração:</p>
                  {loginError}
                </div>
              )}
              <button 
                onClick={handleLogin}
                className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-black transition-all hover:scale-105"
              >
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                ENTRAR COM GOOGLE
              </button>
            </div>
          ) : !isAdmin ? (
            <div className="flex flex-col items-center justify-center py-20 p-8 text-center">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                <X className="text-red-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Acesso Negado</h3>
              <p className="text-white/50 mb-8 max-w-md">{user.email} não tem permissão de administrador no Firebase.</p>
              
              <div className="p-6 bg-white/5 rounded-[24px] mb-8 w-full max-w-md text-left">
                <div className="text-[10px] text-white/30 mb-2 font-black uppercase tracking-widest">Guia para Liberar Acesso:</div>
                <p className="text-xs text-white/40 mb-4 leading-relaxed">No Firestore, crie uma coleção chamada <code className="text-brand-accent">admins</code> e adicione um documento com este ID:</p>
                <code className="text-brand-accent text-xs break-all font-mono bg-black/40 p-3 rounded-xl block border border-brand-accent/20 select-all">{user.email}</code>
              </div>

              <button onClick={logout} className="text-white/40 hover:text-white flex items-center gap-2 mx-auto font-bold text-sm">
                <LogOut size={16} /> SAI DA CONTA
              </button>
            </div>
          ) : (
            <div className="p-4 sm:p-8 space-y-12">
              {/* Product Form Card */}
              <section className="bg-brand-dark/80 backdrop-blur-sm rounded-[32px] p-1 border border-white/5 shadow-2xl overflow-hidden">
                <div className="p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      {editingId ? <Pencil className="text-brand-accent" size={24} /> : <Plus className="text-brand-accent" size={24} />}
                      <h3 className="text-lg sm:text-xl font-black tracking-tight uppercase">
                        {editingId ? 'Editar Produto' : 'Novo Produto'}
                      </h3>
                    </div>
                    {editingId && (
                      <button 
                        type="button"
                        onClick={handleCancelEdit}
                        className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase hover:text-white transition-all bg-white/5 px-4 py-2 rounded-xl"
                      >
                        <RotateCcw size={14} />
                        Cancelar Edição
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Tabs Navigation */}
                    <div className="flex p-1.5 bg-brand-black/60 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar gap-1">
                      {[
                        { id: 'basic', label: 'Básico', icon: Info },
                        { id: 'description', label: 'Descrição', icon: AlignLeft },
                        {id: 'flavors', label: 'Sabores', icon: ListFilter},
                        {id: 'orders', label: 'Pedidos', icon: ShoppingBag},
                        {id: 'reports', label: 'Relatórios', icon: FileText}
                      ].map(tab => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTab(tab.id as TabType)}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[10px] sm:text-xs font-black tracking-widest uppercase transition-all whitespace-nowrap ${
                            activeTab === tab.id 
                            ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20' 
                            : 'text-white/30 hover:text-white/50 hover:bg-white/5'
                          }`}
                        >
                          <tab.icon size={14} />
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Tab Panels */}
                    <div className="min-h-[280px]">
                      <AnimatePresence mode="wait">
                        {activeTab === 'basic' && (
                          <motion.div
                            key="basic"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="space-y-6"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                              <div className="sm:col-span-2 space-y-2">
                                <label className="text-[10px] uppercase font-black text-white/30 ml-4 flex items-center gap-2">
                                  <Type size={10} /> Nome do Produto
                                </label>
                                <input 
                                  required
                                  value={formData.name}
                                  onChange={e => setFormData({...formData, name: e.target.value})}
                                  placeholder="Ex: Vapor Max Pro 20k"
                                  className="w-full bg-brand-black/40 border border-white/5 rounded-2xl py-4 px-6 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/50 outline-none transition-all placeholder:text-white/5 font-medium text-sm"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-white/30 ml-4 flex items-center gap-2">
                                  <Tag size={10} /> Categoria/Tag
                                </label>
                                <input 
                                  value={formData.tag}
                                  onChange={e => setFormData({...formData, tag: e.target.value})}
                                  placeholder="Destaque, Novo"
                                  className="w-full bg-brand-black/40 border border-white/5 rounded-2xl py-4 px-6 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/50 outline-none transition-all placeholder:text-white/5 font-medium text-sm"
                                />
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="flex items-center justify-between px-4">
                                <div className="flex flex-col">
                                  <label className="text-[10px] uppercase font-black text-white/30 flex items-center gap-2">
                                    <ImageIcon size={10} /> Galeria de Imagens
                                  </label>
                                  <span className="text-[8px] text-white/10 uppercase font-bold tracking-widest mt-1">Primeira imagem será a principal</span>
                                </div>
                                <button 
                                  type="button" 
                                  onClick={handleAddImage}
                                  className="flex items-center gap-2 text-[10px] font-black text-brand-accent uppercase bg-brand-accent/5 hover:bg-brand-accent/10 px-4 py-2 rounded-xl transition-all border border-brand-accent/10"
                                >
                                  <Plus size={12} /> Adicionar Link
                                </button>
                              </div>
                              
                              <div className="grid grid-cols-1 gap-3">
                                {formData.images.map((img, index) => (
                                  <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={index} 
                                    className="flex gap-2 group"
                                  >
                                    <div className="w-14 h-14 bg-brand-black/60 rounded-2xl overflow-hidden border border-white/5 flex-shrink-0 flex items-center justify-center">
                                      {img ? (
                                        <img src={img} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                                      ) : (
                                        <ImageIcon className="text-white/5" size={16} />
                                      )}
                                    </div>
                                    <input 
                                      required
                                      value={img}
                                      onChange={e => handleImageChange(index, e.target.value)}
                                      placeholder="https://..."
                                      className="flex-1 bg-brand-black/40 border border-white/10 rounded-2xl py-4 px-6 focus:border-brand-accent outline-none transition-all text-xs"
                                    />
                                    <button 
                                      type="button" 
                                      onClick={() => removeImage(index)}
                                      className="p-4 bg-red-500/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </motion.div>
                                ))}
                                {formData.images.length === 0 && (
                                  <div onClick={handleAddImage} className="py-12 flex flex-col items-center justify-center bg-white/5 rounded-[32px] border border-dashed border-white/5 cursor-pointer hover:bg-white/[0.07] transition-all group">
                                    <ImageIcon className="text-white/10 mb-4 group-hover:text-brand-accent/40 transition-colors" size={32} />
                                    <p className="text-[10px] text-white/20 uppercase font-black tracking-[0.2em]">Clique para adicionar imagens</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="pt-4 flex flex-col sm:flex-row gap-6 items-end">
                              <div className="flex-1 w-full max-w-xs space-y-2">
                                <label className="text-[10px] uppercase font-black text-white/30 ml-4 flex items-center gap-2">
                                  R$ Preço de Venda
                                </label>
                                <div className="relative">
                                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-accent font-black text-sm">R$</span>
                                  <input 
                                    required
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={e => setFormData({...formData, price: e.target.value})}
                                    placeholder="0,00"
                                    className="w-full bg-brand-black/40 border border-white/5 rounded-2xl py-4 pl-14 pr-6 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/50 outline-none transition-all font-black text-lg"
                                  />
                                </div>
                              </div>

                              <div className="flex-shrink-0 w-full sm:w-auto">
                                <button
                                  type="button"
                                  onClick={() => setFormData({ ...formData, isHighlight: !formData.isHighlight })}
                                  className={`w-full flex items-center justify-between gap-4 px-6 py-4 rounded-2xl border transition-all ${
                                    formData.isHighlight 
                                    ? 'bg-brand-accent/10 border-brand-accent text-brand-accent' 
                                    : 'bg-white/5 border-white/5 text-white/30'
                                  }`}
                                >
                                  <div className="flex flex-col items-start gap-0.5">
                                    <span className="text-[10px] font-black uppercase tracking-widest">Destaque do Mês</span>
                                    <span className="text-[8px] opacity-60">Exibir no banner principal</span>
                                  </div>
                                  <div className={`w-10 h-5 rounded-full relative transition-colors ${formData.isHighlight ? 'bg-brand-accent' : 'bg-white/10'}`}>
                                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${formData.isHighlight ? 'left-6' : 'left-1'}`} />
                                  </div>
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {activeTab === 'description' && (
                          <motion.div
                            key="description"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="space-y-2"
                          >
                            <label className="text-[10px] uppercase font-black text-white/30 ml-4 flex items-center gap-2">
                              <AlignLeft size={10} /> Descrição Completa
                            </label>
                            <textarea 
                              required
                              rows={6}
                              value={formData.description}
                              onChange={e => setFormData({...formData, description: e.target.value})}
                              placeholder="Descreva as características técnicas e diferenciais do produto..."
                              className="w-full bg-brand-black/40 border border-white/5 rounded-3xl py-5 px-6 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/50 outline-none transition-all resize-none placeholder:text-white/5 font-medium"
                            />
                          </motion.div>
                        )}

                        {activeTab === 'flavors' && (
                          <motion.div
                            key="flavors"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="space-y-4"
                          >
                            <div className="flex items-center justify-between mb-4 px-4">
                              <label className="text-[10px] uppercase font-black text-white/30 flex items-center gap-2">
                                <ListFilter size={10} /> Lista de Sabores
                              </label>
                              <button 
                                type="button" 
                                onClick={handleAddFlavor}
                                className="text-[10px] font-black text-brand-accent uppercase hover:bg-brand-accent/10 px-3 py-1.5 rounded-lg transition-all"
                              >
                                + Adicionar Sabor
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-8">
                              {formData.flavors.map((flavor, index) => (
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  key={index} 
                                  className="flex gap-2 group"
                                >
                                  <input 
                                    value={flavor}
                                    onChange={e => handleFlavorChange(index, e.target.value)}
                                    placeholder={`Sabor #${index + 1}`}
                                    className="flex-1 bg-brand-black/40 border border-white/5 rounded-2xl py-3 px-5 focus:border-brand-accent outline-none text-sm transition-all"
                                  />
                                  <button 
                                    type="button" 
                                    onClick={() => removeFlavor(index)}
                                    className="p-3.5 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500/20 transition-all opacity-100 sm:opacity-0 group-hover:opacity-100"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </motion.div>
                              ))}
                              {formData.flavors.length === 0 && (
                                <div className="col-span-full py-12 text-center bg-white/5 rounded-[32px] border border-dashed border-white/5 text-white/10 text-[10px] uppercase tracking-widest font-black">
                                  Nenhum sabor listado para este produto
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}

                        {activeTab === 'orders' && (
                          <motion.div
                            key="orders"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="space-y-6 py-4"
                          >
                            <div className="grid grid-cols-1 gap-4">
                              {orders.length === 0 ? (
                                <div className="py-20 text-center bg-white/5 rounded-[32px] border border-dashed border-white/5">
                                  <ShoppingBag className="mx-auto mb-4 text-white/10" size={40} />
                                  <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">Nenhum pedido registrado</p>
                                </div>
                              ) : (
                                [...orders].sort((a, b) => {
                                  const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                                  const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                                  return dateB.getTime() - dateA.getTime();
                                }).map(order => {
                                  const date = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
                                  const isPendente = order.status === 'Pendente';
                                  const isAceito = order.status === 'Aceito';
                                  const isEntregue = order.status === 'Entregue';

                                  return (
                                    <div key={order.id} className="bg-white/5 border border-white/5 rounded-[32px] p-5 sm:p-6 hover:border-white/10 transition-all">
                                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                        <div className="flex flex-wrap items-center gap-3">
                                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                            isPendente ? 'bg-amber-500/10 text-amber-500' : 
                                            isAceito ? 'bg-brand-accent/10 text-brand-accent' : 
                                            'bg-green-500/10 text-green-500'
                                          }`}>
                                            {isPendente ? <Clock size={20} /> : isAceito ? <Package size={20} /> : <CheckCircle2 size={20} />}
                                          </div>
                                          <div className="min-w-0">
                                            <div className="text-[10px] text-white/30 uppercase font-black tracking-widest truncate">Pedido #{order.id.slice(-6)}</div>
                                            <div className="text-xs text-white/60 font-bold">{date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
                                          </div>
                                          
                                          {/* Payment Method Tag */}
                                          <div className={`px-3 py-1 rounded-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${
                                            (order as any).paymentMethod === 'pix' 
                                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/10' 
                                            : 'bg-brand-accent/10 text-brand-accent border border-brand-accent/10'
                                          }`}>
                                            {(order as any).paymentMethod === 'pix' ? <QrCode size={12} /> : <CreditCard size={12} />}
                                            {(order as any).paymentMethod === 'pix' ? 'Pix Direto' : 'Mercado Pago'}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                          {!isEntregue && (
                                            <button 
                                              type="button"
                                              onClick={() => handleUpdateOrderStatus(order.id, isPendente ? 'Aceito' : 'Entregue')}
                                              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                isPendente 
                                                ? 'bg-brand-accent text-white hover:scale-105 active:scale-95' 
                                                : 'bg-green-500 text-white hover:scale-105 active:scale-95'
                                              }`}
                                            >
                                              {isPendente ? 'Confirmar Pagamento' : 'Finalizar Entrega'}
                                            </button>
                                          )}
                                          <button 
                                            type="button"
                                            onClick={() => handleDeleteOrder(order)}
                                            className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all shrink-0 active:scale-90"
                                            title="Excluir"
                                          >
                                            <Trash2 size={16} />
                                          </button>
                                        </div>
                                      </div>

                                      <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                          <div className="bg-black/20 p-4 rounded-2x border border-white/5">
                                            <div className="text-[9px] text-white/30 uppercase font-black mb-3 tracking-widest flex items-center gap-2">
                                              <ListFilter size={10} /> Itens do Pedido
                                            </div>
                                            <div className="space-y-2">
                                              {order.items?.map((item, idx) => (
                                                <div key={idx} className="flex flex-col bg-white/5 p-2.5 rounded-xl border border-white/5">
                                                  <div className="flex justify-between items-start gap-2">
                                                    <span className="font-bold text-white/90">{item.quantity}x {item.name}</span>
                                                    <span className="text-brand-accent font-black">R${(item.price * item.quantity).toFixed(2)}</span>
                                                  </div>
                                                  {item.flavors?.length > 0 && (
                                                    <div className="mt-1 flex flex-wrap gap-1">
                                                      {item.flavors.map((f: string, i: number) => (
                                                        <span key={i} className="text-[8px] px-1.5 py-0.5 bg-brand-accent/10 text-brand-accent rounded uppercase font-black tracking-tighter">
                                                          {f}
                                                        </span>
                                                      ))}
                                                    </div>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                          <div className="bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
                                            <div>
                                              <div className="text-[9px] text-white/30 uppercase font-black mb-1 tracking-widest">Valor do Recebimento</div>
                                              <div className="text-3xl font-black text-brand-accent tracking-tighter">
                                                R$ {order.total?.toFixed(2)}
                                              </div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                              <div className="text-[9px] text-white/20 uppercase font-bold">Status Atual</div>
                                              <div className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${
                                                isPendente ? 'bg-amber-500/10 text-amber-500' : 
                                                isAceito ? 'bg-brand-accent/10 text-brand-accent' : 
                                                'bg-green-500/10 text-green-500'
                                              }`}>
                                                {order.status}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </motion.div>
                        )}

                        {activeTab === 'reports' && (
                          <motion.div
                            key="reports"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="space-y-6 py-4"
                          >
                            {/* Summary Cards for Mobile */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-brand-accent/10 border border-brand-accent/20 p-4 rounded-2xl">
                                <div className="text-[8px] text-brand-accent uppercase font-black tracking-widest mb-1">Vendas (Mês)</div>
                                <div className="text-xl font-black text-white">
                                  {(() => {
                                    const filtered = orders.filter(o => {
                                      const d = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
                                      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
                                    });
                                    return filtered.length;
                                  })()}
                                </div>
                              </div>
                              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl">
                                <div className="text-[8px] text-green-500 uppercase font-black tracking-widest mb-1">Receita (Mês)</div>
                                <div className="text-xl font-black text-white">
                                  R${(() => {
                                    const filtered = orders.filter(o => {
                                      const d = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
                                      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
                                    });
                                    return filtered.reduce((acc, curr) => acc + (curr.total || 0), 0).toFixed(2);
                                  })()}
                                </div>
                              </div>
                            </div>

                            <div className="bg-white/5 p-6 rounded-[32px] border border-white/5">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-6 flex items-center gap-2">
                                <Calendar size={12} /> Configurar Relatório
                              </h4>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                <div className="space-y-2">
                                  <label className="text-[10px] uppercase font-black text-white/30 ml-2">Mês de Referência</label>
                                  <div className="relative">
                                    <select 
                                      value={selectedMonth}
                                      onChange={e => setSelectedMonth(parseInt(e.target.value))}
                                      className="w-full bg-brand-black/40 border border-white/5 rounded-2xl py-4 px-6 focus:border-brand-accent outline-none text-white font-medium appearance-none"
                                    >
                                      {Array.from({ length: 12 }).map((_, i) => (
                                        <option key={i} value={i} className="bg-brand-dark">
                                          {new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date(2000, i))}
                                        </option>
                                      ))}
                                    </select>
                                    <ListFilter className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={16} />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] uppercase font-black text-white/30 ml-2">Ano</label>
                                  <div className="relative">
                                    <select 
                                      value={selectedYear}
                                      onChange={e => setSelectedYear(parseInt(e.target.value))}
                                      className="w-full bg-brand-black/40 border border-white/5 rounded-2xl py-4 px-6 focus:border-brand-accent outline-none text-white font-medium appearance-none"
                                    >
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <option key={i} value={new Date().getFullYear() - i} className="bg-brand-dark">
                                          {new Date().getFullYear() - i}
                                        </option>
                                      ))}
                                    </select>
                                    <Calendar className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={16} />
                                  </div>
                                </div>
                              </div>

                              <button 
                                type="button"
                                onClick={generateReport}
                                disabled={exporting}
                                className="w-full bg-white text-black py-4.5 rounded-[20px] font-black tracking-widest uppercase transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-white/5"
                              >
                                {exporting ? (
                                  <>
                                    <Loader2 className="animate-spin" size={18} />
                                    <span className="text-xs font-black uppercase">GERANDO PDF...</span>
                                  </>
                                ) : (
                                  <>
                                    <Download size={18} />
                                    <span className="text-xs font-black uppercase">BAIXAR RELATÓRIO PDF</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <div className="p-5 border border-brand-accent/20 bg-brand-accent/5 rounded-[28px]">
                              <p className="text-[9px] text-brand-accent font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                <Info size={10} /> Dica do Sistema
                              </p>
                              <p className="text-[11px] text-white/40 leading-relaxed font-medium">Os dados são filtrados automaticamente pelo mês e ano selecionados acima. O relatório PDF detalha cada transação individualmente.</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {activeTab !== 'reports' && activeTab !== 'orders' && (
                      <button 
                        disabled={isAdding}
                        className="w-full bg-brand-accent text-white py-5 rounded-[24px] font-black tracking-widest uppercase transition-all hover:scale-[1.01] active:scale-100 shadow-xl shadow-brand-accent/20 flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {isAdding ? (
                          <>
                            <Loader2 className="animate-spin" size={24} />
                            PROCESSANDO...
                          </>
                        ) : (
                          <>
                            {editingId ? <CheckCircle2 size={24} /> : <Plus size={24} />}
                            {editingId ? 'SALVAR ALTERAÇÕES' : 'SALVAR NO INVENTÁRIO'}
                          </>
                        )}
                      </button>
                    )}
                  </form>
                </div>
              </section>

              {/* Inventory List */}
              <section className="space-y-6 sm:px-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <Package className="text-brand-accent" size={24} />
                    <h3 className="text-lg font-black tracking-tight uppercase">Produtos Ativos</h3>
                    <span className="bg-brand-accent/10 border border-brand-accent/20 px-3 py-1 rounded-full text-[10px] font-black text-brand-accent">{products.length}</span>
                  </div>
                  
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input
                      type="text"
                      placeholder="Buscar produto pelo nome..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-brand-black/40 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-xs focus:border-brand-accent outline-none transition-all placeholder:text-white/10"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products
                    .filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(product => (
                    <div key={product.id} className="bg-brand-dark/50 border border-white/5 p-4 rounded-[28px] group transition-all hover:bg-brand-dark hover:border-white/10 flex items-center sm:items-start gap-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-brand-black rounded-2xl overflow-hidden border border-white/5 flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                        {product.image ? (
                          <img src={product.image} className="w-16 h-16 sm:w-20 sm:h-20 object-cover" alt={product.name} referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-white/5">
                            <ImageIcon className="text-white/10" size={24} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pr-24 relative">
                        <p className="text-[9px] text-brand-accent font-black tracking-widest uppercase mb-0.5 truncate opacity-60">
                          {product.tag || 'GERAL'}
                        </p>
                        <h4 className="font-bold text-white text-sm sm:text-base leading-tight mb-1 truncate">{product.name}</h4>
                        <div className="flex items-center gap-2">
                           <span className="text-xs font-black text-white/60">R$ {product.price?.toFixed(2)}</span>
                           {product.flavors?.length > 0 && (
                            <span className="text-[8px] font-black bg-white/5 text-white/30 px-1.5 py-0.5 rounded leading-none">
                              {product.flavors.length} SABORES
                            </span>
                           )}
                        </div>
                        
                        <div className="absolute top-1/2 -translate-y-1/2 right-0 flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity z-50">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleEdit(product); }}
                            className="p-3 bg-brand-accent/10 text-brand-accent rounded-2xl hover:bg-brand-accent/20 transition-all pointer-events-auto"
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(product); }}
                            className="p-3 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500/20 transition-all pointer-events-auto"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {products.length === 0 && !loading && (
                    <div className="col-span-full py-24 text-center">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 opacity-20">
                        <Package size={40} />
                      </div>
                      <p className="font-black text-white/20 text-xs uppercase tracking-widest">Nenhum produto cadastrado no momento</p>
                    </div>
                  )}
                </div>
              </section>

              {/* User Bar */}
              <div className="sm:px-4 pt-12 pb-8 flex flex-col sm:flex-row items-center justify-between gap-6 opacity-40 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {user.photoURL ? (
                      <img src={user.photoURL} className="w-10 h-10 rounded-full border-2 border-white/10" alt={user.displayName || 'User'} referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand-accent/20 flex items-center justify-center border-2 border-white/10">
                        <span className="text-brand-accent font-black text-xs">{(user.displayName || user.email || 'U')[0].toUpperCase()}</span>
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-brand-dark rounded-full shadow-lg shadow-green-500/20" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-brand-accent block tracking-widest">{isAdmin ? 'Sistema Online' : 'Conectado'}</span>
                    <span className="text-xs text-white/60 font-bold block">{user.email}</span>
                  </div>
                </div>
                <button 
                  onClick={logout}
                  className="flex items-center gap-2 text-white/40 hover:text-red-500 transition-colors text-[10px] font-black uppercase tracking-[0.2em]"
                >
                  <LogOut size={14} />
                  Sair do Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {productToDelete && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProductToDelete(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-brand-dark border border-white/10 p-8 rounded-[40px] max-w-sm w-full text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="text-red-500" size={32} />
              </div>
              <h4 className="text-xl font-black uppercase italic mb-2">Excluir Produto?</h4>
              <p className="text-white/40 text-sm mb-8 leading-relaxed font-medium">
                Você está prestes a remover <span className="text-white font-bold">{productToDelete.name}</span>. Esta ação não poderá ser desfeita.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setProductToDelete(null)}
                  disabled={isDeleting}
                  className="py-4 rounded-2xl bg-white/5 text-white/60 font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="py-4 rounded-2xl bg-red-500 text-white font-black uppercase text-[10px] tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 className="animate-spin" size={14} /> : 'Sim, Excluir'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Delete Confirmation Modal for Orders */}
      <AnimatePresence>
        {orderToDelete && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOrderToDelete(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-brand-dark border border-white/10 p-8 rounded-[40px] max-w-sm w-full text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="text-red-500" size={32} />
              </div>
              <h4 className="text-xl font-black uppercase italic mb-2">Excluir Registro?</h4>
              <p className="text-white/40 text-sm mb-8 leading-relaxed font-medium">
                Você está prestes a remover o registro do pedido <span className="text-white font-bold">#{orderToDelete.id.slice(-6)}</span>. Esta ação não poderá ser desfeita.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button"
                  onClick={() => setOrderToDelete(null)}
                  disabled={isDeletingOrder}
                  className="py-4 rounded-2xl bg-white/5 text-white/60 font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  onClick={confirmDeleteOrder}
                  disabled={isDeletingOrder}
                  className="py-4 rounded-2xl bg-red-500 text-white font-black uppercase text-[10px] tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDeletingOrder ? <Loader2 className="animate-spin" size={14} /> : 'Sim, Excluir'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
