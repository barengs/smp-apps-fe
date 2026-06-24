import React, { useState } from 'react';
import { useGetPositionsQuery, useCreatePositionMutation, useUpdatePositionMutation, useDeletePositionMutation, Position } from '@/store/slices/positionApi';
import { useGetOrganizationsQuery } from '@/store/slices/organizationApi';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Briefcase } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb, { BreadcrumbItemData } from '@/components/CustomBreadcrumb';

export default function PositionPage() {
  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Dashboard', href: '/dashboard/administrasi' },
    { label: 'Organisasi' },
    { label: 'Jabatan', icon: <Briefcase className="h-4 w-4" /> },
  ];

  const { data: positions, isLoading } = useGetPositionsQuery();
  const { data: organizations } = useGetOrganizationsQuery();
  const [createPosition] = useCreatePositionMutation();
  const [updatePosition] = useUpdatePositionMutation();
  const [deletePosition] = useDeletePositionMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Position>>({});

  const [selectedOrgFilter, setSelectedOrgFilter] = useState<string>('all');

  const handleOpenDialog = (pos?: Position) => {
    if (pos) {
      setFormData({
        id: pos.id,
        name: pos.name,
        code: pos.code,
        organization_id: pos.organization_id,
        level: pos.level,
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
        await updatePosition({ id: formData.id, data: formData }).unwrap();
        toast.success('Jabatan berhasil diperbarui');
      } else {
        await createPosition(formData).unwrap();
        toast.success('Jabatan berhasil ditambahkan');
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Yakin ingin menghapus jabatan ini?')) {
      try {
        await deletePosition(id).unwrap();
        toast.success('Jabatan berhasil dihapus');
      } catch (error) {
        toast.error('Gagal menghapus jabatan');
      }
    }
  };

  const filteredPositions = positions?.filter(pos => {
    if (selectedOrgFilter === 'all') return true;
    return pos.organization_id.toString() === selectedOrgFilter;
  });

  return (
    <DashboardLayout title="Manajemen Jabatan" role="administrasi">
      <div className="container mx-auto px-4 pb-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Struktur Jabatan</h1>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" /> Tambah Jabatan
            </Button>
          </div>

      <div className="mb-6 max-w-sm">
        <Label className="mb-2 block">Filter berdasarkan Organisasi / Lembaga</Label>
        <Select value={selectedOrgFilter} onValueChange={setSelectedOrgFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Semua Organisasi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">-- Semua Organisasi --</SelectItem>
            {organizations?.map(org => (
              <SelectItem key={org.id} value={org.id.toString()}>{org.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-md shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Jabatan</TableHead>
              <TableHead>Kode</TableHead>
              <TableHead>Organisasi</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
            ) : filteredPositions && filteredPositions.length > 0 ? (
              filteredPositions.map(pos => (
                <TableRow key={pos.id}>
                  <TableCell>{pos.name}</TableCell>
                  <TableCell>{pos.code}</TableCell>
                  <TableCell>{pos.organization?.name}</TableCell>
                  <TableCell>Level {pos.level}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(pos)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(pos.id)} className="text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={5} className="text-center">Tidak ada data jabatan</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formData.id ? 'Edit Jabatan' : 'Tambah Jabatan'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Organisasi / Lembaga</Label>
              <Select 
                value={formData.organization_id?.toString() || ''} 
                onValueChange={(val) => setFormData({...formData, organization_id: parseInt(val)})}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Organisasi" />
                </SelectTrigger>
                <SelectContent>
                  {organizations?.map(org => (
                    <SelectItem key={org.id} value={org.id.toString()}>{org.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nama Jabatan</Label>
              <Input 
                value={formData.name || ''} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                required 
              />
            </div>
            <div>
              <Label>Kode Jabatan</Label>
              <Input 
                value={formData.code || ''} 
                onChange={(e) => setFormData({...formData, code: e.target.value})} 
                required
              />
            </div>
            <div>
              <Label>Level</Label>
              <Input 
                type="number"
                min="1"
                value={formData.level || 1} 
                onChange={(e) => setFormData({...formData, level: parseInt(e.target.value)})} 
                required 
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
