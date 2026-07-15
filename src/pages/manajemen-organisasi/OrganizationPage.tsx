import React, { useState } from 'react';
import { useGetOrganizationHierarchyQuery, useCreateOrganizationMutation, useUpdateOrganizationMutation, useDeleteOrganizationMutation, Organization } from '@/store/slices/organizationApi';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { useGetOrganizationsQuery } from '@/store/slices/organizationApi';
import { useGetInstitusiPendidikanQuery } from '@/store/slices/institusiPendidikanApi';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb, { BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Building } from 'lucide-react';

export default function OrganizationPage() {
  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Dashboard', href: '/dashboard/administrasi' },
    { label: 'Organisasi' },
    { label: 'Lembaga', icon: <Building className="h-4 w-4" /> },
  ];

  const { data: hierarchy, isLoading } = useGetOrganizationHierarchyQuery();
  const { data: flatOrganizations } = useGetOrganizationsQuery();
  const { data: institutions } = useGetInstitusiPendidikanQuery({ page: 1, per_page: 100 });
  const [createOrganization] = useCreateOrganizationMutation();
  const [updateOrganization] = useUpdateOrganizationMutation();
  const [deleteOrganization] = useDeleteOrganizationMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Organization>>({});
  const [expandedNodes, setExpandedNodes] = useState<Record<number, boolean>>({});

  const handleOpenDialog = (org?: Organization) => {
    if (org) {
      setFormData({
        id: org.id,
        name: org.name,
        code: org.code,
        description: org.description,
        parent_id: org.parent_id,
        educational_institution_id: org.educational_institution_id,
        level: org.level,
      });
    } else {
      setFormData({ level: 1 });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await updateOrganization({ id: formData.id, data: formData }).unwrap();
        toast.success('Organisasi berhasil diperbarui');
      } else {
        await createOrganization(formData).unwrap();
        toast.success('Organisasi berhasil ditambahkan');
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Yakin ingin menghapus organisasi ini?')) {
      try {
        await deleteOrganization(id).unwrap();
        toast.success('Organisasi berhasil dihapus');
      } catch (error: any) {
        toast.error('Gagal menghapus organisasi');
      }
    }
  };

  const toggleNode = (id: number) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderTree = (nodes: Organization[], depth = 0) => {
    return nodes.map(node => {
      const isExpanded = expandedNodes[node.id] !== false; // Default expanded
      const hasChildren = node.children && node.children.length > 0;

      return (
        <React.Fragment key={node.id}>
          <TableRow>
            <TableCell>
              <div className="flex items-center" style={{ paddingLeft: `${depth * 1.5}rem` }}>
                {hasChildren ? (
                  <button onClick={() => toggleNode(node.id)} className="mr-2">
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                ) : (
                  <span className="w-6 inline-block"></span>
                )}
                {node.name}
              </div>
            </TableCell>
            <TableCell>{node.code || '-'}</TableCell>
            <TableCell>Level {node.level}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(node)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(node.id)} className="text-red-500">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
          {isExpanded && hasChildren && renderTree(node.children!, depth + 1)}
        </React.Fragment>
      );
    });
  };

  return (
    <DashboardLayout title="Manajemen Lembaga" role="administrasi">
      <div className="container mx-auto px-4 pb-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Struktur Organisasi / Lembaga</h1>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" /> Tambah Organisasi
            </Button>
          </div>

      <div className="bg-white rounded-md shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Organisasi</TableHead>
              <TableHead>Kode</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
            ) : hierarchy && hierarchy.length > 0 ? (
              renderTree(hierarchy)
            ) : (
              <TableRow><TableCell colSpan={4} className="text-center">Tidak ada data organisasi</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formData.id ? 'Edit Organisasi' : 'Tambah Organisasi'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nama Organisasi</Label>
              <Input 
                value={formData.name || ''} 
                onChange={(e) => {
                  const name = e.target.value;
                  const updates: any = { name };
                  if (!formData.id) {
                    const prefix = name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
                    if (prefix.length > 0) {
                      const matches = flatOrganizations?.filter(o => o.code?.startsWith(prefix)) || [];
                      const nextNum = matches.length + 1;
                      updates.code = `${prefix}${nextNum.toString().padStart(3, '0')}`;
                    } else {
                      updates.code = '';
                    }
                  }
                  setFormData({...formData, ...updates});
                }} 
                required 
              />
            </div>
            <div>
              <Label>Kode (Terisi Otomatis)</Label>
              <Input 
                value={formData.code || ''} 
                onChange={(e) => setFormData({...formData, code: e.target.value})} 
              />
            </div>
            <div>
              <Label>Level (Otomatis)</Label>
              <Input 
                type="number"
                value={formData.level || 1} 
                disabled
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>
            <div>
              <Label>Induk Organisasi (Parent)</Label>
              <Select 
                value={formData.parent_id ? formData.parent_id.toString() : 'null'} 
                onValueChange={(val) => {
                  const parentId = val === 'null' ? null : parseInt(val);
                  let level = 1;
                  if (parentId && flatOrganizations) {
                    const parentOrg = flatOrganizations.find(o => o.id === parentId);
                    if (parentOrg) level = parentOrg.level + 1;
                  }
                  setFormData({...formData, parent_id: parentId, level});
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Induk Organisasi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">-- Tidak Ada (Root) --</SelectItem>
                  {flatOrganizations?.map(org => (
                    <SelectItem key={org.id} value={org.id.toString()}>{org.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Institusi Pendidikan (Opsional)</Label>
              <Select 
                value={formData.educational_institution_id ? formData.educational_institution_id.toString() : 'null'} 
                onValueChange={(val) => setFormData({...formData, educational_institution_id: val === 'null' ? null : parseInt(val)})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Institusi Pendidikan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">-- Tidak Ada (Tingkat Yayasan) --</SelectItem>
                  {institutions?.map(inst => (
                    <SelectItem key={inst.id} value={inst.id.toString()}>{inst.institution_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Deskripsi</Label>
              <Textarea 
                value={formData.description || ''} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit">Simpan</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
      </div>
    </DashboardLayout>
  );
}
