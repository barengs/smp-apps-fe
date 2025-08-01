"use client";

import React, { useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form'; // Import useFieldArray
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, PlusCircle, UploadCloud } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { SantriFormValues } from '../form-schemas';

interface DocumentStepProps {
  form: any;
}

const DocumentStep: React.FC<DocumentStepProps> = ({ form }) => {
  const { control, register, setValue, getValues } = useFormContext<SantriFormValues>();

  // Use useFieldArray for optionalDocuments
  const { fields, append, remove } = useFieldArray({
    control,
    name: "optionalDocuments", // This matches the field in santriFormSchema
  });

  // Add one empty row initially if no optional documents exist
  React.useEffect(() => {
    if (fields.length === 0) {
      append({ name: '', file: null });
    }
  }, [fields, append]);

  const handleDocumentFileChange = (index: number, file: File | null) => {
    setValue(`optionalDocuments.${index}.file`, file, { shouldValidate: true });
  };

  const addDocumentRow = () => {
    append({ name: '', file: null });
  };

  const removeDocumentRow = (index: number) => {
    remove(index);
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
                      <UploadCloud className="w-8 h-8 mb-3 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Klik untuk mengunggah</span> atau seret
                      </p>
                      <p className="text-xs text-muted-foreground">PDF, JPG, PNG (MAX. 2MB)</p>
                      {field.value && field.value.name && (
                        <p className="text-sm text-primary mt-1">{field.value.name}</p>
                      )}
                    </div>
                    <FormControl>
                      <Input
                        id="ijazah-file"
                        type="file"
                        className="hidden"
                        accept="application/pdf,image/*"
                        onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)}
                      />
                    </FormControl>
                  </FormLabel>
                  <FormMessage className="mt-2" />
                </FormItem>
              )}
            />
          </div>

          {/* Dokumen Lainnya */}
          <div>
            <h3 className="text-lg font-medium mb-2">Dokumen Lainnya (Opsional)</h3>
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
                  {fields.map((field, index) => (
                    <TableRow key={field.id}> {/* useFieldArray provides a unique 'id' for each field */}
                      <TableCell>
                        <Input
                          placeholder="Contoh: Kartu Keluarga"
                          {...register(`optionalDocuments.${index}.name`)} // Register name field
                        />
                        <FormMessage className="mt-1">
                          {form.formState.errors.optionalDocuments?.[index]?.name?.message}
                        </FormMessage>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="file"
                          className="text-sm text-muted-foreground file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                          onChange={(e) => handleDocumentFileChange(index, e.target.files ? e.target.files[0] : null)}
                        />
                        {getValues(`optionalDocuments.${index}.file`)?.name && (
                          <p className="text-sm text-primary mt-1">
                            {getValues(`optionalDocuments.${index}.file`)?.name}
                          </p>
                        )}
                        <FormMessage className="mt-1">
                          {form.formState.errors.optionalDocuments?.[index]?.file?.message}
                        </FormMessage>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeDocumentRow(index)}
                          disabled={fields.length <= 1} // Disable remove if only one row left
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
              type="button"
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