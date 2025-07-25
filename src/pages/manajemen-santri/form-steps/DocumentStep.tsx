"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, PlusCircle, UploadCloud } from 'lucide-react';

interface DocumentRow {
  id: number;
  name: string;
  file: File | null;
}

const DocumentStep = () => {
  const [documents, setDocuments] = useState<DocumentRow[]>([
    { id: Date.now(), name: '', file: null },
  ]);

  const handleDocumentNameChange = (id: number, name: string) => {
    setDocuments(documents.map(doc =>
      doc.id === id ? { ...doc, name: name } : doc
    ));
  };

  const handleDocumentFileChange = (id: number, file: File | null) => {
    setDocuments(documents.map(doc =>
      doc.id === id ? { ...doc, file: file } : doc
    ));
  };

  const addDocumentRow = () => {
    setDocuments([...documents, { id: Date.now(), name: '', file: null }]);
  };

  const removeDocumentRow = (id: number) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Langkah 4: Kelengkapan Dokumen</CardTitle>
          <CardDescription>Unggah ijazah terakhir dan dokumen pendukung lainnya.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Ijazah Terakhir */}
          <div>
            <h3 className="text-lg font-medium mb-2">Ijazah Terakhir</h3>
            <Label
              htmlFor="ijazah-file"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-8 h-8 mb-3 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Klik untuk mengunggah</span> atau seret dan lepas
                </p>
                <p className="text-xs text-muted-foreground">PDF, JPG, PNG (MAX. 5MB)</p>
              </div>
              <Input id="ijazah-file" type="file" className="hidden" />
            </Label>
          </div>

          {/* Dokumen Lainnya */}
          <div>
            <h3 className="text-lg font-medium mb-2">Dokumen Lainnya</h3>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50%]">Nama Dokumen</TableHead>
                    <TableHead className="w-[40%]">Unggah File</TableHead>
                    <TableHead className="w-[10%] text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <Input
                          placeholder="Contoh: Kartu Keluarga"
                          value={doc.name}
                          onChange={(e) => handleDocumentNameChange(doc.id, e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="file"
                          className="text-sm text-muted-foreground file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                          onChange={(e) => handleDocumentFileChange(doc.id, e.target.files ? e.target.files[0] : null)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeDocumentRow(doc.id)}
                          disabled={documents.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={addDocumentRow}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Tambah Dokumen
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentStep;