import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBulkAssignStudentRoomMutation } from '@/store/slices/studentApi';
import { useGetHostelsQuery } from '@/store/slices/hostelApi';
import { useGetRoomsQuery } from '@/store/slices/roomApi';
import { useGetTahunAjaranQuery } from '@/store/slices/tahunAjaranApi';
import * as toast from '@/utils/toast';

interface BulkAssignRoomDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    studentIds: number[];
    onSuccess?: () => void;
}

const BulkAssignRoomDialog: React.FC<BulkAssignRoomDialogProps> = ({ open, onOpenChange, studentIds, onSuccess }) => {
    const [selectedHostel, setSelectedHostel] = useState<string>('');
    const [selectedRoom, setSelectedRoom] = useState<string>('');
    const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState<string>('');

    const { data: hostelsData, isLoading: isLoadingHostels } = useGetHostelsQuery();
    const { data: roomsData, isLoading: isLoadingRooms } = useGetRoomsQuery({ per_page: 1000 });
    const { data: academicYearsData, isLoading: isLoadingAcademicYears } = useGetTahunAjaranQuery();

    const [bulkAssignRoom, { isLoading: isAssigning }] = useBulkAssignStudentRoomMutation();

    const hostels = hostelsData?.data || [];
    const rooms = roomsData?.data || [];
    const academicYears = academicYearsData || [];

    const filteredRooms = rooms.filter((r) => r.hostel_id.toString() === selectedHostel);

    useEffect(() => {
        if (academicYears.length > 0 && !selectedAcademicYear) {
            const activeYear = academicYears.find((y) => y.active);
            if (activeYear) {
                setSelectedAcademicYear(activeYear.id.toString());
            }
        }
    }, [academicYears, selectedAcademicYear]);

    useEffect(() => {
        if (!open) {
            setSelectedHostel('');
            setSelectedRoom('');
            setNotes('');
            setStartDate(new Date().toISOString().split('T')[0]);
        }
    }, [open]);

    useEffect(() => {
        setSelectedRoom('');
    }, [selectedHostel]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (studentIds.length === 0) {
            toast.showError('Tidak ada santri yang dipilih.');
            return;
        }

        if (!selectedRoom || !selectedAcademicYear || !startDate) {
            toast.showError('Asrama, Kamar, Tahun Ajaran, dan Tanggal Mulai wajib diisi.');
            return;
        }

        try {
            await bulkAssignRoom({
                student_ids: studentIds,
                room_id: parseInt(selectedRoom),
                academic_year_id: parseInt(selectedAcademicYear),
                start_date: startDate,
                notes: notes.trim() || undefined,
            }).unwrap();

            toast.showSuccess(`Mutasi massal berhasil diproses untuk ${studentIds.length} santri.`);
            onOpenChange(false);
            if (onSuccess) onSuccess();
        } catch (error: any) {
            toast.showError(error?.data?.message || 'Gagal memproses mutasi massal.');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Mutasi Massal Asrama ({studentIds.length} Santri)</DialogTitle>
                    <DialogDescription>
                        Pindahkan {studentIds.length} santri yang dipilih ke asrama dan kamar baru secara sekaligus.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="academic_year">Tahun Ajaran <span className="text-red-500">*</span></Label>
                        <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
                            <SelectTrigger disabled={isLoadingAcademicYears}>
                                <SelectValue placeholder="Pilih Tahun Ajaran" />
                            </SelectTrigger>
                            <SelectContent>
                                {academicYears.map((ay) => (
                                    <SelectItem key={ay.id} value={ay.id.toString()}>
                                        {ay.year} {ay.active ? '- Aktif' : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="hostel">Asrama Tujuan <span className="text-red-500">*</span></Label>
                        <Select value={selectedHostel} onValueChange={setSelectedHostel}>
                            <SelectTrigger disabled={isLoadingHostels}>
                                <SelectValue placeholder="Pilih Asrama" />
                            </SelectTrigger>
                            <SelectContent>
                                {hostels.map((h) => (
                                    <SelectItem key={h.id} value={h.id.toString()}>
                                        {h.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="room">Kamar Tujuan <span className="text-red-500">*</span></Label>
                        <Select value={selectedRoom} onValueChange={setSelectedRoom} disabled={!selectedHostel || isLoadingRooms}>
                            <SelectTrigger>
                                <SelectValue placeholder={!selectedHostel ? "Pilih asrama terlebih dahulu" : "Pilih Kamar"} />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredRooms.length === 0 ? (
                                    <div className="p-2 text-sm text-center text-muted-foreground">Tidak ada kamar di asrama ini</div>
                                ) : (
                                    filteredRooms.map((r) => (
                                        <SelectItem key={r.id} value={r.id.toString()}>
                                            {r.name} (Kapasitas: {r.capacity})
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="start_date">Tanggal Mulai <span className="text-red-500">*</span></Label>
                        <Input
                            id="start_date"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Catatan / Alasan Mutasi</Label>
                        <Textarea
                            id="notes"
                            placeholder="Misal: Mutasi massal kenaikan jenjang, renovasi gedung, dsb."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <DialogFooter className="pt-4 mt-4 border-t">
                        <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isAssigning}>
                            Batal
                        </Button>
                        <Button variant="primary" type="submit" disabled={isAssigning || !selectedRoom || !selectedAcademicYear || !startDate}>
                            {isAssigning ? 'Memproses...' : 'Simpan Mutasi Massal'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default BulkAssignRoomDialog;
