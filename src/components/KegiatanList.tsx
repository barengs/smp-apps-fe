import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Kegiatan } from '@/types/kegiatan'; // Updated import path

interface KegiatanListProps {
  kegiatanList: Kegiatan[];
  onToggleStatus: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (kegiatan: Kegiatan) => void;
}

const KegiatanList: React.FC<KegiatanListProps> = ({ kegiatanList, onToggleStatus, onDelete, onEdit }) => {
  const sortedKegiatan = [...kegiatanList].sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Kegiatan</CardTitle>
        <CardDescription>Kegiatan yang akan datang dan yang telah selesai.</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedKegiatan.length === 0 ? (
          <p className="text-center text-muted-foreground">Tidak ada kegiatan terjadwal.</p>
        ) : (
          <div className="space-y-4">
            {sortedKegiatan.map((kegiatan) => (
              <div key={kegiatan.id} className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <p className="font-medium">{kegiatan.name}</p> {/* Changed from kegiatan.title */}
                  <p className="text-sm text-muted-foreground">
                    {format(kegiatan.date, 'PPP', { locale: id })}
                    {kegiatan.description && ` - ${kegiatan.description}`}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={kegiatan.status === 'Selesai' ? 'default' : 'secondary'}>
                    {kegiatan.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onEdit(kegiatan)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onToggleStatus(kegiatan.id)}>
                        {kegiatan.status === 'Selesai' ? (
                          <>
                            <XCircle className="mr-2 h-4 w-4" /> Tandai Belum Selesai
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" /> Tandai Selesai
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" /> Hapus
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus kegiatan "{kegiatan.name}" secara permanen. {/* Changed from kegiatan.title */}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(kegiatan.id)}>Hapus</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KegiatanList;