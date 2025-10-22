"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Upload, Plus, Search, Filter, FileText, Link, CreditCard as Edit, Trash2, Tag, BookOpen, Globe, FolderOpen, ChevronRight, Calendar, File as FileIcon, ExternalLink } from "lucide-react";
import { KBStorage, KBEntry, KBCategory } from "@/lib/kbStorage";
import { cn } from "@/lib/utils";

export default function KnowledgeBase() {
  const [entries, setEntries] = useState<KBEntry[]>([]);
  const [categories, setCategories] = useState<KBCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAddUrlDialog, setShowAddUrlDialog] = useState(false);
  const [showCategoriesExpanded, setShowCategoriesExpanded] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KBEntry | null>(null);

  // Form states
  const [newEntry, setNewEntry] = useState({
    title: "",
    description: "",
    tags: "",
    category: "",
    url: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const kbEntries = KBStorage.getAllEntries();
    const kbCategories = KBStorage.getAllCategories();
    setEntries(kbEntries);
    setCategories(kbCategories);
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || entry.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const entry: Omit<KBEntry, 'id' | 'created_at' | 'updated_at'> = {
        title: file.name,
        description: newEntry.description || `Uploaded ${file.type || 'file'} document`,
        type: 'document',
        content: '', // In a real app, you'd process the file content
        file_size: file.size,
        file_type: file.type || 'application/octet-stream',
        tags: newEntry.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        category: newEntry.category || 'uncategorized',
        status: 'ready',
        confidence: 1.0
      };

      KBStorage.saveEntry(entry);
    });

    // Reset form
    setNewEntry({ title: "", description: "", tags: "", category: "", url: "" });
    setShowAddDialog(false);
    loadData();
  };

  const handleUrlAdd = () => {
    if (!newEntry.url.trim()) return;

    const entry: Omit<KBEntry, 'id' | 'created_at' | 'updated_at'> = {
      title: newEntry.title || new URL(newEntry.url).hostname,
      description: newEntry.description || `Web content from ${new URL(newEntry.url).hostname}`,
      type: 'url',
      content: newEntry.url,
      tags: newEntry.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      category: newEntry.category || 'web-resources',
      status: 'ready',
      confidence: 1.0
    };

    KBStorage.saveEntry(entry);
    setNewEntry({ title: "", description: "", tags: "", category: "", url: "" });
    setShowAddUrlDialog(false);
    loadData();
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      KBStorage.deleteEntry(id);
      loadData();
    }
  };

  const handleEditEntry = (entry: KBEntry) => {
    setEditingEntry(entry);
    setNewEntry({
      title: entry.title,
      description: entry.description,
      tags: entry.tags.join(', '),
      category: entry.category,
      url: entry.type === 'url' ? entry.content : ''
    });
    setShowAddDialog(true);
  };

  const handleSaveEdit = () => {
    if (!editingEntry) return;

    const updatedEntry: Partial<KBEntry> = {
      title: newEntry.title,
      description: newEntry.description,
      tags: newEntry.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      category: newEntry.category,
      ...(editingEntry.type === 'url' && { content: newEntry.url })
    };

    KBStorage.updateEntry(editingEntry.id, updatedEntry);
    setEditingEntry(null);
    setNewEntry({ title: "", description: "", tags: "", category: "", url: "" });
    setShowAddDialog(false);
    loadData();
  };

  const getFileIcon = (entry: KBEntry) => {
    if (entry.type === 'url') return <Globe className="w-5 h-5 text-blue-600" />;
    if (entry.file_type?.includes('pdf')) return <FileText className="w-5 h-5 text-red-600" />;
    return <FileIcon className="w-5 h-5 text-gray-600" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const categoryCount = (categoryId: string) => {
    return entries.filter(entry => entry.category === categoryId).length;
  };

  return (
    <div className="space-y-6">
      {/* Add Content Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-green-600" />
            Add Knowledge Base Content
          </CardTitle>
          <CardDescription>
            Upload documents, clinical guidelines, treatment protocols, and add URLs for information, education, and support content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-auto p-4">
                  <div className="text-center w-full">
                    <Upload className="w-5 h-5 mx-auto mb-2" />
                    <p className="font-medium">Upload Files</p>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingEntry ? 'Edit' : 'Upload'} Knowledge Base Content</DialogTitle>
                  <DialogDescription>
                    {editingEntry ? 'Update the details for this entry' : 'Add files and metadata to your knowledge base'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {!editingEntry && (
                    <div>
                      <Label>Select Files</Label>
                      <Input
                        type="file"
                        multiple
                        accept=".pdf,.txt,.xlsx,.docx,.doc,.csv"
                        onChange={handleFileUpload}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Supported: PDF, TXT, XLSX, DOCX (max 10MB each)
                      </p>
                    </div>
                  )}
                  
                  {editingEntry && (
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={newEntry.title}
                        onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
                        placeholder="Document title"
                      />
                    </div>
                  )}
                  
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={newEntry.description}
                      onChange={(e) => setNewEntry({...newEntry, description: e.target.value})}
                      placeholder="Describe the content and its use cases"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label>Tags (comma-separated)</Label>
                    <Input
                      value={newEntry.tags}
                      onChange={(e) => setNewEntry({...newEntry, tags: e.target.value})}
                      placeholder="e.g., technical, guidelines, support"
                    />
                  </div>
                  
                  <div>
                    <Label>Category</Label>
                    <Select value={newEntry.category} onValueChange={(value) => setNewEntry({...newEntry, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical-docs">Technical Documentation</SelectItem>
                        <SelectItem value="guidelines">Guidelines</SelectItem>
                        <SelectItem value="support">Support Materials</SelectItem>
                        <SelectItem value="training">Training Resources</SelectItem>
                        <SelectItem value="policies">Policies</SelectItem>
                        <SelectItem value="uncategorized">Uncategorized</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {editingEntry && (
                    <Button onClick={handleSaveEdit} className="w-full">
                      Save Changes
                    </Button>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showAddUrlDialog} onOpenChange={setShowAddUrlDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-auto p-4">
                  <div className="text-center w-full">
                    <Link className="w-5 h-5 mx-auto mb-2" />
                    <p className="font-medium">Add URL</p>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add URL to Knowledge Base</DialogTitle>
                  <DialogDescription>
                    Add web resources and documentation links
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>URL</Label>
                    <Input
                      value={newEntry.url}
                      onChange={(e) => setNewEntry({...newEntry, url: e.target.value})}
                      placeholder="https://example.com/documentation"
                      type="url"
                    />
                  </div>
                  
                  <div>
                    <Label>Title (optional)</Label>
                    <Input
                      value={newEntry.title}
                      onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
                      placeholder="Leave blank to auto-generate"
                    />
                  </div>
                  
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={newEntry.description}
                      onChange={(e) => setNewEntry({...newEntry, description: e.target.value})}
                      placeholder="Describe the web content and its use cases"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label>Tags (comma-separated)</Label>
                    <Input
                      value={newEntry.tags}
                      onChange={(e) => setNewEntry({...newEntry, tags: e.target.value})}
                      placeholder="e.g., external, reference, documentation"
                    />
                  </div>
                  
                  <div>
                    <Label>Category</Label>
                    <Select value={newEntry.category} onValueChange={(value) => setNewEntry({...newEntry, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="web-resources">Web Resources</SelectItem>
                        <SelectItem value="external-docs">External Documentation</SelectItem>
                        <SelectItem value="reference">Reference Materials</SelectItem>
                        <SelectItem value="training">Training Resources</SelectItem>
                        <SelectItem value="uncategorized">Uncategorized</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleUrlAdd} className="w-full">
                    Add URL
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Drag and Drop Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              Click to upload or drag and drop knowledge base documents here
            </p>
            <p className="text-sm text-gray-500">
              Supported: PDF, TXT, XLSX, DOCX (max 10MB each)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Knowledge Base Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Knowledge Base Content
              </CardTitle>
              <CardDescription>
                Manage documentation with tags and descriptions for better semantic matching and recommendations
              </CardDescription>
            </div>
            <Badge variant="secondary">{filteredEntries.length} items</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search documentation and URLs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name} ({categoryCount(category.id)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Categories Section */}
          <div className="border rounded-lg">
            <Button
              variant="ghost"
              onClick={() => setShowCategoriesExpanded(!showCategoriesExpanded)}
              className="w-full justify-between p-4 h-auto"
            >
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-green-600" />
                <span className="font-medium">Knowledge Base Categories</span>
                <Badge variant="secondary">{categories.length} categories</Badge>
              </div>
              <ChevronRight className={cn("w-4 h-4 transition-transform", showCategoriesExpanded && "rotate-90")} />
            </Button>
            
            {showCategoriesExpanded && (
              <div className="px-4 pb-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-4">
                  {categories.map(category => (
                    <Button
                      key={category.id}
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className="justify-start"
                    >
                      {category.name} ({categoryCount(category.id)})
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Entries List */}
          <div className="space-y-3">
            {filteredEntries.map((entry) => (
              <div key={entry.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getFileIcon(entry)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{entry.title}</h3>
                        {entry.type === 'url' && (
                          <ExternalLink className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        )}
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            entry.status === 'ready' ? 'text-green-700 bg-green-50' : 'text-yellow-700 bg-yellow-50'
                          )}
                        >
                          {entry.status}
                        </Badge>
                      </div>
                      
                      {entry.file_size && (
                        <p className="text-sm text-gray-500 mb-2">
                          {formatFileSize(entry.file_size)} • Added {new Date(entry.created_at).toLocaleDateString()}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        {entry.tags.map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <p className="text-sm text-gray-700">{entry.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditEntry(entry)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredEntries.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="font-medium">No knowledge base content found</p>
                <p className="text-sm">Upload documents or add URLs to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}