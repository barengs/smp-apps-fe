import React from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Trash2, XCircle } from 'lucide-react';
import type { Kegiatan } from '@/pages/manajemen-pendidikan/JadwalKegiatanPage';

interface KegiatanListProps {
  kegiatanList: Kegiatan[];
  onToggleStatus: (id: number) => void;
  onDelete: (id: number) => void;
}

const KegiatanList: React.FC<KegiatanListProps> = ({ kegiatanList, onToggleStatus, onDelete }) => {
  const sortedList = [...kegiatanList].sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Kegiatan</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[450px] pr-4">
          {sortedList.length > 0 ? (
            <div className="space-y-4">
              {sortedList.map((kegiatan) => (
                <div key={kegiatan.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1 mr-4">
                    <p className="font-semibold">{kegiatan.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(kegiatan.date, 'd MMMM yyyy', { locale: id })}
                    </p>
                    <Badge variant={kegiatan.status === 'Selesai' ? 'default' : 'secondary'} className="mt-1">
                      {kegiatan.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onToggleStatus(kegiatan.id)}
                      title={kegiatan.status === 'Selesai' ? 'Tandai Belum Selesai' : 'Tandai Selesai'}
                    >
                      {kegiatan.status === 'Selesai' ? (
                        <XCircle className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(kegiatan.id)}
                      title="Hapus Kegiatan"
                    >
                      <Trash2 className="h-5 w-5 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Tidak ada kegiatan terjadwal.</p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default KegiatanList;