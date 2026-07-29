import React, { useState } from 'react';
import { useGetPositionAssignmentsQuery, useCreatePositionAssignmentMutation, useUpdatePositionAssignmentMutation, useDeletePositionAssignmentMutation, PositionAssignment } from '@/store/slices/positionAssignmentApi';
import { useGetOrganizationsQuery } from '@/store/slices/organizationApi';
import { useGetPositionsQuery } from '@/store/slices/positionApi';
import { useGetEmployeesQuery } from '@/store/slices/employeeApi';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb, { BreadcrumbItemData } from '@/components/CustomBreadcrumb';

export default function KepengurusanPage() {
  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Dashboard', href: '/dashboard/administrasi' },
    { label: 'Organisasi' },
    { label: 'Kepengurusan', icon: <Users className="h-4 w-4" /> },
  ];

  const { data: assignments, isLoading } = useGetPositionAssignmentsQuery();
  const { data: organizations } = useGetOrganizationsQuery();
  const { data: positions } = useGetPositionsQuery();
  const { data: employees } = useGetEmployeesQuery({ per_page: 1000 });
  
  const [createAssignment] = useCreatePositionAssignmentMutation();
  const [updateAssignment] = useUpdatePositionAssignmentMutation();
  const [deleteAssignment] = useDeletePositionAssignmentMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<PositionAssignment>>({});
  
  // Filter state
  const [selectedOrgFilter, setSelectedOrgFilter] = useState<string>('all');
  const [staffSearch, setStaffSearch] = useState<string>('');

  const handleOpenDialog = (assignment?: PositionAssignment) => {
    if (assignment) {
      setFormData({
        id: assignment.id,
        position_id: assignment.position_id,
        staff_id: assignment.staff_id,
        start_date: assignment.start_date?.split('T')[0],
        is_active: assignment.is_active,
        assignment_letter: assignment.assignment_letter,
      });
    } else {
      setFormData({ 
        is_active: true,
        start_date: new Date().toISOString().split('T')[0]
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.staff_id || !formData.position_id) {
      toast.error('Pegawai dan Jabatan harus dipilih');
      return;
    }
    
    try {
      if (formData.id) {
        await updateAssignment({ id: formData.id, data: formData }).unwrap();
        toast.success('Kepengurusan berhasil diperbarui');
      } else {
        await createAssignment(formData).unwrap();
        toast.success('Kepengurusan berhasil ditambahkan');
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      if (error?.data?.data) {
        const errors = Object.values(error.data.data).flat().join(', ');
        toast.error(errors || error?.data?.message || 'Terjadi kesalahan');
      } else {
        toast.error(error?.data?.message || 'Terjadi kesalahan');
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Yakin ingin menghapus kepengurusan ini?')) {
      try {
        await deleteAssignment(id).unwrap();
        toast.success('Kepengurusan berhasil dihapus');
      } catch (error) {
        toast.error('Gagal menghapus kepengurusan');
      }
    }
  };

  const filteredAssignments = assignments?.filter(assignment => {
    if (selectedOrgFilter === 'all') return true;
    return assignment.position?.organization_id?.toString() === selectedOrgFilter;
  });

  return (
    <DashboardLayout title="Manajemen Kepengurusan" role="administrasi">
      <div className="container mx-auto px-4 pb-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Data Kepengurusan Lembaga</h1>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" /> Tetapkan Pengurus
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

      <div className="bg-white rounded-md shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Staff / Pegawai</TableHead>
              <TableHead>Jabatan</TableHead>
              <TableHead>Organisasi</TableHead>
              <TableHead>Tanggal Mulai</TableHead>
              <TableHead>Status Aktif</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>
            ) : filteredAssignments && filteredAssignments.length > 0 ? (
              filteredAssignments.map(assignment => (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium">{assignment.staff?.first_name} {assignment.staff?.last_name}</TableCell>
                  <TableCell>{assignment.position?.name}</TableCell>
                  <TableCell>{assignment.position?.organization?.name}</TableCell>
                  <TableCell>{assignment.start_date}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${assignment.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {assignment.is_active ? 'Aktif' : 'Non-Aktif'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(assignment)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(assignment.id)} className="text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={6} className="text-center">Tidak ada data kepengurusan untuk organisasi ini</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formData.id ? 'Edit Kepengurusan' : 'Tetapkan Kepengurusan'}</DialogTitle>
            <DialogDescription className="sr-only">Form untuk mengelola data kepengurusan.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" aria-describedby="dialog-description">
            <div>
              <Label>Pegawai / Staff</Label>
              <Select 
                value={formData.staff_id?.toString() || ''} 
                onValueChange={(val) => setFormData({...formData, staff_id: parseInt(val)})}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Pegawai" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <Input 
                      placeholder="Cari staff..." 
                      value={staffSearch}
                      onChange={(e) => setStaffSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>
                  {employees?.filter(emp => emp.staff?.id && emp.name.toLowerCase().includes(staffSearch.toLowerCase())).map(emp => (
                    <SelectItem key={emp.staff.id} value={emp.staff.id.toString()}>{emp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Jabatan</Label>
              <Select 
                value={formData.position_id?.toString() || ''} 
                onValueChange={(val) => setFormData({...formData, position_id: parseInt(val)})}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Jabatan" />
                </SelectTrigger>
                <SelectContent>
                  {positions?.map(pos => (
                    <SelectItem key={pos.id} value={pos.id.toString()}>
                      {pos.name} ({pos.organization?.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tanggal Mulai</Label>
              <Input 
                type="date"
                value={formData.start_date || ''} 
                onChange={(e) => setFormData({...formData, start_date: e.target.value})} 
                required 
              />
            </div>
            <div>
              <Label>No. SK / Surat Tugas</Label>
              <Input 
                value={formData.assignment_letter || ''} 
                onChange={(e) => setFormData({...formData, assignment_letter: e.target.value})} 
              />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <input 
                type="checkbox" 
                id="is_active"
                className="rounded border-gray-300"
                checked={formData.is_active || false}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
              />
              <Label htmlFor="is_active">Status Aktif</Label>
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
