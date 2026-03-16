import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAssignStudentRoomMutation } from '@/store/slices/studentApi';
import { useGetHostelsQuery } from '@/store/slices/hostelApi';
import { useGetRoomsQuery } from '@/store/slices/roomApi';
import { useGetTahunAjaranQuery } from '@/store/slices/tahunAjaranApi';
import * as toast from '@/utils/toast';

interface AssignRoomDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    studentId: number;
}

const AssignRoomDialog: React.FC<AssignRoomDialogProps> = ({ open, onOpenChange, studentId }) => {
    const [selectedHostel, setSelectedHostel] = useState<string>('');
    const [selectedRoom, setSelectedRoom] = useState<string>('');
    const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState<string>('');

    const { data: hostelsData, isLoading: isLoadingHostels } = useGetHostelsQuery();
    const { data: roomsData, isLoading: isLoadingRooms } = useGetRoomsQuery({ per_page: 1000 }); // Ambil semua kamar
    const { data: academicYearsData, isLoading: isLoadingAcademicYears } = useGetTahunAjaranQuery();

    const [assignRoom, { isLoading: isAssigning }] = useAssignStudentRoomMutation();

    const hostels = hostelsData?.data || [];
    const rooms = roomsData?.data || [];
    const academicYears = academicYearsData || [];

    // Filter kamar berdasarkan asrama yang dipilih
    const filteredRooms = rooms.filter((r) => r.hostel_id.toString() === selectedHostel);

    // Set default academic year to the active one (if available)
    useEffect(() => {
        if (academicYears.length > 0 && !selectedAcademicYear) {
            const activeYear = academicYears.find((y) => y.active);
            if (activeYear) {
                setSelectedAcademicYear(activeYear.id.toString());
            }
        }
    }, [academicYears, selectedAcademicYear]);

    // Reset form when dialog opens/closes
    useEffect(() => {
        if (!open) {
            setSelectedHostel('');
            setSelectedRoom('');
            setNotes('');
            setStartDate(new Date().toISOString().split('T')[0]);
        }
    }, [open]);

    // Reset room selection when hostel changes
    useEffect(() => {
        setSelectedRoom('');
    }, [selectedHostel]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedRoom || !selectedAcademicYear || !startDate) {
            toast.showError('Asrama, Kamar, Tahun Ajaran, dan Tanggal Mulai wajib diisi.');
            return;
        }

        try {
            await assignRoom({
                id: studentId,
                data: {
                    room_id: parseInt(selectedRoom),
                    academic_year_id: parseInt(selectedAcademicYear),
                    start_date: startDate,
                    notes: notes.trim() || null,
                },
            }).unwrap();

            toast.showSuccess('Mutasi asrama berhasil diproses.');
            onOpenChange(false);
        } catch (error: any) {
            toast.showError(error?.data?.message || 'Gagal memproses mutasi asrama.');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Mutasi Asrama Santri</DialogTitle>
                    <DialogDescription>
                        Tentukan asrama, kamar, dan tahun ajaran tujuan santri ini. Mutasi ini akan dicatat dan mengubah asrama aktif saat ini.
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
                                        {ay.year} ({ay.type}) {ay.active ? '- Aktif' : ''}
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
                            placeholder="Misal: Pindah program, atas permintaan orang tua, dll."
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
                            {isAssigning ? 'Menyimpan...' : 'Simpan Mutasi'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AssignRoomDialog;
