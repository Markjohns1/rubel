import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link, useLocation } from "wouter";
import { Plus, Pencil, Trash2, Search, ArrowLeft, X, Upload, AlertCircle } from "lucide-react";
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api, ProductCreateData, Product } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ProductFormState {
  name: string;
  price: number | string;
  description: string;
  category: string;
  imageFile: File | null;
}

const initialFormState: ProductFormState = {
  name: '',
  price: '',
  description: '',
  category: 'bed',
  imageFile: null,
};

export default function AdminProducts() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form State
  const [formData, setFormData] = useState<ProductFormState>(initialFormState);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // API Hooks
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: api.products.list,
    retry: false
  });

  const createMutation = useMutation({
    mutationFn: api.products.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsAddOpen(false);
      resetForm();
      toast({ title: "Success", description: "Product added successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to add product", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.products.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsEditOpen(false);
      setEditingProduct(null);
      resetForm();
      toast({ title: "Success", description: "Product updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to update product", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: api.products.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: "Success", description: "Product deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to delete product", variant: "destructive" });
    }
  });

  if (!user?.isAdmin) {
    setLocation('/login');
    return null;
  }

  const resetForm = () => {
    setFormData(initialFormState);
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredProducts = products?.filter((product) =>
    product.nameEn.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
      setFormData(prev => ({ ...prev, imageFile: file }));
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.nameEn,
      price: product.price,
      description: product.descriptionEn || '',
      category: product.category,
      imageFile: null,
    });
    setPreviewImage(product.image);
    setIsEditOpen(true);
  };

  const handleAddProduct = () => {
    if (!formData.name || !formData.price || !formData.category || !formData.imageFile) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and upload an image",
        variant: "destructive"
      });
      return;
    }

    const productData: ProductCreateData = {
      nameBn: formData.name, // Use same name for both
      nameEn: formData.name,
      price: Number(formData.price),
      descriptionBn: formData.description,
      descriptionEn: formData.description,
      category: formData.category,
      image: formData.imageFile,
    };

    createMutation.mutate(productData);
  };

  const handleUpdateProduct = () => {
    if (!editingProduct) return;

    const updateData: any = {
      nameEn: formData.name,
      nameBn: formData.name, // Use same name for both
      price: Number(formData.price),
      descriptionEn: formData.description,
      descriptionBn: formData.description,
      category: formData.category,
    };

    if (formData.imageFile) {
      updateData.image = formData.imageFile;
    }

    updateMutation.mutate({ id: editingProduct.id, data: updateData });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif">Manage Products</h1>
        <div className="sm:ml-auto w-full sm:w-auto">
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                <div className="space-y-2">
                  <Label>Product Name *</Label>
                  <Input
                    placeholder="Modern Bed"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price *</Label>
                    <Input
                      type="number"
                      placeholder="25000"
                      value={formData.price}
                      onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select
                      onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                      value={formData.category}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bed">Bed</SelectItem>
                        <SelectItem value="sofa">Sofa</SelectItem>
                        <SelectItem value="cupboard">Cupboard</SelectItem>
                        <SelectItem value="door">Door</SelectItem>
                        <SelectItem value="dining">Dining</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Product details and features..."
                    rows={4}
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Product Image *</Label>
                  <div
                    className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {previewImage ? (
                      <div className="relative w-full h-48">
                        <img src={previewImage} alt="Preview" className="w-full h-full object-contain" />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewImage(null);
                            setFormData(prev => ({ ...prev, imageFile: null }));
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3 text-primary">
                          <Upload className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium">Click to upload image</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                      </>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>

                <Button onClick={handleAddProduct} className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Saving..." : "Save Product"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Backend Connection Failed. Ensure FastAPI is running.
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[600px]">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-4 font-medium w-[80px]">Image</th>
                  <th className="p-4 font-medium">Product Name</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Price</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  // Ensure image URL is absolute
                  const imageUrl = product.image.startsWith('http') 
                    ? product.image 
                    : `http://localhost:8000${product.image}`;
                  
                  return (
                  <tr key={product.id} className="border-t hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <div className="w-10 h-10 rounded bg-muted overflow-hidden">
                        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="p-4 font-medium">{product.nameEn}</td>
                    <td className="p-4 capitalize text-muted-foreground">{product.category}</td>
                    <td className="p-4">${product.price.toLocaleString()}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => deleteMutation.mutate(product.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
                {filteredProducts.length === 0 && !error && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No products found. Add one to get started!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(open) => {
        setIsEditOpen(open);
        if (!open) {
          setEditingProduct(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label>Product Name *</Label>
              <Input
                placeholder="Modern Bed"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price *</Label>
                <Input
                  type="number"
                  placeholder="25000"
                  value={formData.price}
                  onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                  value={formData.category}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bed">Bed</SelectItem>
                    <SelectItem value="sofa">Sofa</SelectItem>
                    <SelectItem value="cupboard">Cupboard</SelectItem>
                    <SelectItem value="door">Door</SelectItem>
                    <SelectItem value="dining">Dining</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Product details and features..."
                rows={4}
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Product Image (leave empty to keep current)</Label>
              <div
                className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {previewImage ? (
                  <div className="relative w-full h-48">
                    <img src={previewImage} alt="Preview" className="w-full h-full object-contain" />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewImage(editingProduct?.image || null);
                        setFormData(prev => ({ ...prev, imageFile: null }));
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3 text-primary">
                      <Upload className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium">Click to upload new image</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                  </>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            <Button onClick={handleUpdateProduct} className="w-full" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating..." : "Update Product"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}