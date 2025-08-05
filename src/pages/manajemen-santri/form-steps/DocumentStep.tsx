"use client";

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UploadCloud, PlusCircle, Trash2 } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { SantriFormValues } from '../form-schemas';
import { Button } from '@/components/ui/button';
import { useFieldArray } from 'react-hook-form';

interface DocumentStepProps {
  // form: any; // Dihapus karena menggunakan useFormContext
}

const DocumentStep: React.FC<DocumentStepProps> = () => { // Menghapus { form }
  const { control } = useFormContext<SantriFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "optionalDocuments",
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Langkah 4: Kelengkapan Dokumen</CardTitle>
          <CardDescription>Unggah dokumen pendukung lainnya.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Dokumen Wajib</h3>
            <FormField
              control={control}
              name="ijazahFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    htmlFor="ijazah-file"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Klik untuk mengunggah</span> atau seret
                      </p>
                      <p className="text-xs text-muted-foreground">Scan Ijazah Terakhir (MAX. 2MB)</p>
                    </div>
                    <FormControl>
                      <Input
                        id="ijazah-file"
                        type="file"
                        className="hidden"
                        accept=".pdf,image/*"
                        onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)}
                      />
                    </FormControl>
                  </FormLabel>
                  <FormMessage className="mt-2" />
                  {field.value && field.value instanceof File && (
                    <p className="text-sm text-muted-foreground mt-1">File terpilih: {field.value.name}</p>
                  )}
                </FormItem>
              )}
            />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Dokumen Opsional</h3>
            <p className="text-sm text-muted-foreground mb-4">Anda dapat menambahkan dokumen pendukung lainnya seperti Akta Lahir, Kartu Keluarga, dll.</p>
            <div className="space-y-4">
              {fields.map((item, index) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end border p-4 rounded-lg">
                  <FormField
                    control={control}
                    name={`optionalDocuments.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Dokumen</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Contoh: Akta Lahir" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name={`optionalDocuments.${index}.file`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          htmlFor={`optional-file-${index}`}
                          className="flex flex-col items-center justify-center w-full h-10 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted"
                        >
                          <div className="flex items-center justify-center">
                            <UploadCloud className="w-5 h-5 mr-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Pilih File (MAX. 2MB)</p>
                          </div>
                          <FormControl>
                            <Input
                              id={`optional-file-${index}`}
                              type="file"
                              className="hidden"
                              accept=".pdf,image/*"
                              onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)}
                            />
                          </FormControl>
                        </FormLabel>
                        <FormMessage />
                        {field.value && field.value instanceof File && (
                          <p className="text-sm text-muted-foreground mt-1">File terpilih: {field.value.name}</p>
                        )}
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="destructive" onClick={() => remove(index)} className="w-fit">
                    <Trash2 className="mr-2 h-4 w-4" /> Hapus
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ name: '', file: undefined })}
                className="w-full"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Dokumen Opsional
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentStep;