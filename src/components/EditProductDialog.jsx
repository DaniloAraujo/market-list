import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProductFields from '@/components/form/ProductFields';
import { centsToReais, reaisToCents } from '@/utils/currencyUtils';

function EditForm({ product, onSave, onClose }) {
  const [values, setValues] = useState({
    name: product.name,
    category: product.category,
    quantity: product.quantity,
    priceCents: reaisToCents(product.unitPrice),
  });
  const [errors, setErrors] = useState({});

  const change = (patch) => {
    setValues((v) => ({ ...v, ...patch }));
    if ('name' in patch) setErrors({});
  };

  const submit = (e) => {
    e?.preventDefault();
    if (!values.name.trim()) {
      setErrors({ name: 'Digite o nome do produto' });
      return;
    }
    onSave(product.id, {
      name: values.name.trim(),
      category: values.category || 'outros',
      quantity: Number(values.quantity) || 1,
      unitPrice: centsToReais(values.priceCents),
    });
    onClose();
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <ProductFields compact values={values} errors={errors} onChange={change} />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">Salvar alterações</Button>
      </div>
    </form>
  );
}

export default function EditProductDialog({ product, onSave, onClose }) {
  return (
    <Dialog open={!!product} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar produto</DialogTitle>
          <DialogDescription>Ajuste o nome, a quantidade ou o valor.</DialogDescription>
        </DialogHeader>
        {product && <EditForm key={product.id} product={product} onSave={onSave} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}
