import * as React from 'react';
import { View } from 'react-native';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useT } from '@/hooks/use-t';

/** Yeni hedef ekleme penceresi — günde en fazla 3 hedef */
export function AddGoalDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (title: string) => boolean;
}) {
  const t = useT();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {/* open koşulu içerideki formu her açılışta sıfır state ile mount eder */}
        {open && (
          <AddGoalForm
            onAdd={onAdd}
            onClose={() => onOpenChange(false)}
            placeholder={t('today.goalPlaceholder') as string}
            emptyError={t('today.goalEmptyError') as string}
            title={t('today.addGoal') as string}
            subtitle={t('today.goalsSubtitle') as string}
            cancelLabel={t('common.cancel') as string}
            addLabel={t('common.add') as string}
          />
        )}
        {!open && <View />}
      </DialogContent>
    </Dialog>
  );
}

function AddGoalForm({
  onAdd,
  onClose,
  placeholder,
  emptyError,
  title,
  subtitle,
  cancelLabel,
  addLabel,
}: {
  onAdd: (title: string) => boolean;
  onClose: () => void;
  placeholder: string;
  emptyError: string;
  title: string;
  subtitle: string;
  cancelLabel: string;
  addLabel: string;
}) {
  const [value, setValue] = React.useState('');
  const [error, setError] = React.useState(false);

  const submit = () => {
    const ok = onAdd(value);
    if (!ok) {
      setError(true);
      return;
    }
    onClose();
  };

  return (
    <>
      <View className="gap-1.5">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{subtitle}</DialogDescription>
      </View>

      <Input
        value={value}
        onChangeText={(text) => {
          setValue(text);
          setError(false);
        }}
        placeholder={placeholder}
        autoFocus
        onSubmitEditing={submit}
        returnKeyType="done"
        className={error ? 'border-destructive' : undefined}
      />
      {error && (
        <Text variant="tiny" className="-mt-3 text-destructive">
          {emptyError}
        </Text>
      )}

      <View className="flex-row justify-end gap-3">
        <DialogClose asChild>
          <Button variant="ghost" size="sm" onPress={onClose}>
            <Text className="text-muted-foreground">{cancelLabel}</Text>
          </Button>
        </DialogClose>
        <Button size="sm" onPress={submit} disabled={!value.trim()}>
          <Text className="text-primary-foreground">{addLabel}</Text>
        </Button>
      </View>
    </>
  );
}
